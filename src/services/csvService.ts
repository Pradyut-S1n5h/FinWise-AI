import { Transaction, TransactionType } from '../types/finance';

export interface CSVParseResult {
  headers: string[];
  rows: Record<string, string>[];
  errors: string[];
}

export interface CSVImportValidation {
  validTransactions: Transaction[];
  duplicates: Transaction[];
  invalidRows: Array<{ rowNumber: number; reason: string; raw: Record<string, string> }>;
}

/**
 * Converts array of transactions into standard CSV string
 */
export function exportTransactionsToCSV(transactions: Transaction[]): string {
  const headers = ['Date', 'Type', 'Amount', 'Category ID', 'Account ID', 'Payee / Payer', 'Notes', 'Recurring'];
  const rows = transactions.map((t) => [
    t.date,
    t.type,
    t.amount.toString(),
    t.categoryId || '',
    t.accountId,
    `"${(t.payeeOrPayer || '').replace(/"/g, '""')}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
    t.isRecurring ? 'Yes' : 'No',
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Downloads string content as a file in the browser
 */
export function downloadFile(content: string, filename: string, mimeType = 'text/csv;charset=utf-8;'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses raw CSV text into rows
 */
export function parseCSVText(csvContent: string): CSVParseResult {
  const lines = csvContent
    .split(/\r\n|\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return { headers: [], rows: [], errors: ['CSV file is empty or missing data rows'] };
  }

  // Simple CSV line tokenizer respecting quotes
  const tokenizeLine = (line: string): string[] => {
    const tokens: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        tokens.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    tokens.push(current.trim());
    return tokens;
  };

  const headers = tokenizeLine(lines[0]).map((h) => h.replace(/^["']|["']$/g, '').trim());
  const rows: Record<string, string>[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = tokenizeLine(lines[i]);
    if (values.length !== headers.length) {
      errors.push(`Row ${i + 1} has ${values.length} columns, expected ${headers.length}`);
      continue;
    }
    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] || '';
    });
    rows.push(rowObj);
  }

  return { headers, rows, errors };
}

/**
 * Validates parsed CSV rows, maps columns, and checks for duplicates against existing transactions
 */
export function validateAndMapCSV(
  parsed: CSVParseResult,
  columnMapping: {
    dateCol: string;
    amountCol: string;
    typeCol: string;
    categoryCol?: string;
    notesCol?: string;
    payeeCol?: string;
  },
  existingTransactions: Transaction[],
  defaultAccountId: string
): CSVImportValidation {
  const validTransactions: Transaction[] = [];
  const duplicates: Transaction[] = [];
  const invalidRows: Array<{ rowNumber: number; reason: string; raw: Record<string, string> }> = [];

  // Create hash set of existing transactions for duplicate detection
  const existingSet = new Set(
    existingTransactions.map((t) => `${t.date}_${t.type}_${t.amount}_${t.payeeOrPayer || ''}`)
  );

  parsed.rows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const dateRaw = row[columnMapping.dateCol];
    const amountRaw = row[columnMapping.amountCol];
    const typeRaw = (row[columnMapping.typeCol] || 'expense').toLowerCase();

    // 1. Validate date
    if (!dateRaw || isNaN(Date.parse(dateRaw))) {
      invalidRows.push({ rowNumber: rowNum, reason: `Invalid date format: "${dateRaw}"`, raw: row });
      return;
    }
    const formattedDate = new Date(dateRaw).toISOString().slice(0, 10);

    // 2. Validate amount
    const cleanAmt = parseFloat(amountRaw.replace(/[^0-9.-]+/g, ''));
    if (isNaN(cleanAmt) || cleanAmt <= 0) {
      invalidRows.push({ rowNumber: rowNum, reason: `Invalid positive amount: "${amountRaw}"`, raw: row });
      return;
    }

    // 3. Map type
    let mappedType: TransactionType = 'expense';
    if (typeRaw.includes('income') || typeRaw.includes('credit') || typeRaw.includes('salary') || typeRaw.includes('deposit')) {
      mappedType = 'income';
    } else if (typeRaw.includes('transfer')) {
      mappedType = 'transfer';
    } else if (typeRaw.includes('saving')) {
      mappedType = 'savings_contribution';
    } else if (typeRaw.includes('debt') || typeRaw.includes('emi') || typeRaw.includes('loan')) {
      mappedType = 'debt_repayment';
    } else if (typeRaw.includes('invest')) {
      mappedType = 'investment_purchase';
    }

    const payee = columnMapping.payeeCol ? row[columnMapping.payeeCol] : '';
    const notes = columnMapping.notesCol ? row[columnMapping.notesCol] : '';
    const category = columnMapping.categoryCol ? row[columnMapping.categoryCol] : '';

    const newTx: Transaction = {
      id: `csv_${Date.now()}_${idx}`,
      date: formattedDate,
      type: mappedType,
      amount: cleanAmt,
      accountId: defaultAccountId,
      categoryId: category || undefined,
      payeeOrPayer: payee || undefined,
      notes: notes || undefined,
    };

    // Duplicate detection
    const sig = `${newTx.date}_${newTx.type}_${newTx.amount}_${newTx.payeeOrPayer || ''}`;
    if (existingSet.has(sig)) {
      duplicates.push(newTx);
    } else {
      validTransactions.push(newTx);
    }
  });

  return { validTransactions, duplicates, invalidRows };
}
