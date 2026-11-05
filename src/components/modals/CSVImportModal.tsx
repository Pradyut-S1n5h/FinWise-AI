import React, { useState } from 'react';
import { X, Upload, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { FinancialState, Transaction } from '../../types/finance';
import { parseCSVText, validateAndMapCSV, CSVParseResult, CSVImportValidation } from '../../services/csvService';
import { formatCurrency } from '../../utils/formatters';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: FinancialState;
  onImportConfirmed: (transactions: Transaction[]) => void;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  state,
  onImportConfirmed,
}) => {
  const [parsed, setParsed] = useState<CSVParseResult | null>(null);
  const [selectedAccount, setSelectedAccount] = useState(state.accounts[0]?.id || '');
  const [dateCol, setDateCol] = useState('');
  const [amountCol, setAmountCol] = useState('');
  const [typeCol, setTypeCol] = useState('');
  const [payeeCol, setPayeeCol] = useState('');
  const [notesCol, setNotesCol] = useState('');
  const [validationResult, setValidationResult] = useState<CSVImportValidation | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = parseCSVText(content);
      setParsed(res);

      // Auto-detect common column names
      const headersLower = res.headers.map((h) => h.toLowerCase());
      const findHeader = (keywords: string[]) => {
        const idx = headersLower.findIndex((h) => keywords.some((k) => h.includes(k)));
        return idx !== -1 ? res.headers[idx] : '';
      };

      setDateCol(findHeader(['date', 'time', 'txndate', 'day']));
      setAmountCol(findHeader(['amount', 'amt', 'value', 'price', 'total']));
      setTypeCol(findHeader(['type', 'direction', 'transaction type', 'cr/dr']));
      setPayeeCol(findHeader(['payee', 'merchant', 'description', 'narration', 'source', 'party']));
      setNotesCol(findHeader(['note', 'remark', 'memo', 'comment']));
      setValidationResult(null);
    };
    reader.readAsText(file);
  };

  const handleValidate = () => {
    if (!parsed || !dateCol || !amountCol) return;

    const result = validateAndMapCSV(
      parsed,
      {
        dateCol,
        amountCol,
        typeCol: typeCol || amountCol,
        payeeCol,
        notesCol,
      },
      state.transactions,
      selectedAccount
    );
    setValidationResult(result);
  };

  const handleCommit = () => {
    if (!validationResult || validationResult.validTransactions.length === 0) return;
    onImportConfirmed(validationResult.validTransactions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Import Transactions via CSV
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Validated manual import with automatic duplicate checking
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* File Picker */}
          {!parsed ? (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center space-y-3">
              <Upload className="h-10 w-10 mx-auto text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Select a CSV file from your computer
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Must contain headers for Date and Amount. Supports standard bank/budget exports.
                </p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500">
                <FileText className="h-4 w-4" /> Browse CSV File
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File loaded stats */}
              <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                <span>Loaded CSV: <b>{parsed.rows.length}</b> total rows found</span>
                <button
                  onClick={() => {
                    setParsed(null);
                    setValidationResult(null);
                  }}
                  className="font-semibold underline"
                >
                  Change File
                </button>
              </div>

              {/* Column Mapping Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  1. Map CSV Columns
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Target Account *
                    </label>
                    <select
                      value={selectedAccount}
                      onChange={(e) => setSelectedAccount(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      {state.accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Date Column *
                    </label>
                    <select
                      value={dateCol}
                      onChange={(e) => setDateCol(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">Select Column</option>
                      {parsed.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Amount Column *
                    </label>
                    <select
                      value={amountCol}
                      onChange={(e) => setAmountCol(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">Select Column</option>
                      {parsed.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Type Column (Income / Expense)
                    </label>
                    <select
                      value={typeCol}
                      onChange={(e) => setTypeCol(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">Infer as Expense by default</option>
                      {parsed.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Payee / Merchant Column
                    </label>
                    <select
                      value={payeeCol}
                      onChange={(e) => setPayeeCol(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">None</option>
                      {parsed.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Notes / Description Column
                    </label>
                    <select
                      value={notesCol}
                      onChange={(e) => setNotesCol(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">None</option>
                      {parsed.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleValidate}
                    disabled={!dateCol || !amountCol}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900"
                  >
                    Validate & Preview Import
                  </button>
                </div>
              </div>

              {/* Validation Summary */}
              {validationResult && (
                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    2. Validation Results
                  </h4>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-center dark:border-emerald-900/40 dark:bg-emerald-950/30">
                      <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                        {validationResult.validTransactions.length}
                      </div>
                      <div className="text-[11px] font-medium text-emerald-800 dark:text-emerald-400">
                        Ready to Import
                      </div>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-center dark:border-amber-900/40 dark:bg-amber-950/30">
                      <div className="text-lg font-bold text-amber-700 dark:text-amber-300">
                        {validationResult.duplicates.length}
                      </div>
                      <div className="text-[11px] font-medium text-amber-800 dark:text-amber-400">
                        Duplicates Skipped
                      </div>
                    </div>

                    <div className="rounded-xl border border-red-200 bg-red-50/70 p-3 text-center dark:border-red-900/40 dark:bg-red-950/30">
                      <div className="text-lg font-bold text-red-700 dark:text-red-300">
                        {validationResult.invalidRows.length}
                      </div>
                      <div className="text-[11px] font-medium text-red-800 dark:text-red-400">
                        Invalid Rows
                      </div>
                    </div>
                  </div>

                  {/* Preview Table of First 5 records */}
                  {validationResult.validTransactions.length > 0 && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                      <div className="bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        Sample Records Preview
                      </div>
                      <div className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                        {validationResult.validTransactions.slice(0, 4).map((tx) => (
                          <div key={tx.id} className="flex items-center justify-between px-3 py-2">
                            <div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {tx.payeeOrPayer || tx.type}
                              </span>
                              <span className="ml-2 text-[10px] text-slate-400">{tx.date}</span>
                            </div>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(tx.amount, state.profile.currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {validationResult.invalidRows.length > 0 && (
                    <div className="rounded-lg bg-red-50 p-2 text-[11px] text-red-600 dark:bg-red-950/40 dark:text-red-300 space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Issues found in file:
                      </div>
                      {validationResult.invalidRows.slice(0, 3).map((inv, i) => (
                        <div key={i}>
                          Row {inv.rowNumber}: {inv.reason}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCommit}
            disabled={!validationResult || validationResult.validTransactions.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-40"
          >
            <CheckCircle className="h-4 w-4" />
            Import {validationResult?.validTransactions.length || 0} Transactions
          </button>
        </div>
      </div>
    </div>
  );
};
