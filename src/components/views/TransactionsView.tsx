import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit2,
  Trash2,
  ArrowUpDown,
  Tag,
  Calendar,
} from 'lucide-react';
import { FinancialState, Transaction, TransactionType } from '../../types/finance';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportTransactionsToCSV, downloadFile } from '../../services/csvService';

interface TransactionsViewProps {
  state: FinancialState;
  onOpenAddModal: () => void;
  onOpenEditModal: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenImportModal: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  state,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteTransaction,
  onOpenImportModal,
}) => {
  const cur = state.profile.currency;
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return state.transactions.filter((tx) => {
      // Search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesPayee = tx.payeeOrPayer?.toLowerCase().includes(term);
        const matchesNotes = tx.notes?.toLowerCase().includes(term);
        const matchesAmount = tx.amount.toString().includes(term);
        if (!matchesPayee && !matchesNotes && !matchesAmount) return false;
      }

      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

      // Category filter
      if (categoryFilter !== 'all' && tx.categoryId !== categoryFilter) return false;

      // Account filter
      if (accountFilter !== 'all' && tx.accountId !== accountFilter) return false;

      return true;
    }).sort((a, b) => {
      if (sortField === 'date') {
        const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
        return sortOrder === 'desc' ? -diff : diff;
      } else {
        const diff = a.amount - b.amount;
        return sortOrder === 'desc' ? -diff : diff;
      }
    });
  }, [state.transactions, searchTerm, typeFilter, categoryFilter, accountFilter, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportCSV = () => {
    const csvData = exportTransactionsToCSV(state.transactions);
    downloadFile(csvData, `finwise-transactions-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header and Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Transaction Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {state.transactions.length} total records • Filter, categorize, and reconcile
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Upload className="h-3.5 w-3.5" /> Import CSV
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" /> Add Record
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          {/* Search Box */}
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by payee, description, or amount..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
            <option value="transfer">Transfers</option>
            <option value="savings_contribution">Savings Deposits</option>
            <option value="debt_repayment">Debt Repayment</option>
            <option value="investment_purchase">Investments</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">All Categories</option>
            {state.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Account Filter */}
          <select
            value={accountFilter}
            onChange={(e) => {
              setAccountFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">All Accounts</option>
            {state.accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
              <tr>
                <th
                  onClick={() => toggleSort('date')}
                  className="cursor-pointer py-3.5 pl-4 pr-3 hover:text-emerald-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-3 py-3.5">Type</th>
                <th className="px-3 py-3.5">Description / Payee</th>
                <th className="px-3 py-3.5">Category</th>
                <th className="px-3 py-3.5">Account</th>
                <th
                  onClick={() => toggleSort('amount')}
                  className="cursor-pointer px-3 py-3.5 text-right hover:text-emerald-600"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Amount</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 pl-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((tx) => {
                  const category = state.categories.find((c) => c.id === tx.categoryId);
                  const account = state.accounts.find((a) => a.id === tx.accountId);

                  let badgeColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                  if (tx.type === 'income') badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
                  else if (tx.type === 'expense') badgeColor = 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
                  else if (tx.type === 'transfer') badgeColor = 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
                  else if (tx.type === 'savings_contribution') badgeColor = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300';
                  else if (tx.type === 'debt_repayment') badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
                  else if (tx.type === 'investment_purchase') badgeColor = 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Date */}
                      <td className="py-3 pl-4 pr-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>

                      {/* Type Badge */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
                          {tx.type.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Payee / Description */}
                      <td className="px-3 py-3 max-w-[200px]">
                        <div className="font-semibold text-slate-900 dark:text-white truncate">
                          {tx.payeeOrPayer || '—'}
                        </div>
                        {tx.notes && (
                          <div className="text-[11px] text-slate-400 truncate">
                            {tx.notes}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-3 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {category ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: category.color || '#10b981' }}
                            />
                            <span>{category.name}</span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Account */}
                      <td className="px-3 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {account?.name || 'Primary Bank'}
                      </td>

                      {/* Amount */}
                      <td className="px-3 py-3 text-right font-bold whitespace-nowrap">
                        <span
                          className={
                            tx.type === 'income'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-900 dark:text-slate-100'
                          }
                        >
                          {tx.type === 'income' ? '+' : '-'}
                          {formatCurrency(tx.amount, cur)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 pl-3 pr-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenEditModal(tx)}
                            title="Edit"
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            title="Delete"
                            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No transactions match your search and filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Page {currentPage} of {totalPages} ({filteredTransactions.length} items)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
