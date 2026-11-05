import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import {
  FinancialState,
  Transaction,
  TransactionType,
} from '../../types/finance';
import { generateId } from '../../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Transaction) => void;
  state: FinancialState;
  editingTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  state,
  editingTransaction,
}) => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState(state.accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(state.accounts[1]?.id || '');
  const [categoryId, setCategoryId] = useState(state.categories[0]?.id || '');
  const [goalId, setGoalId] = useState(state.goals[0]?.id || '');
  const [liabilityId, setLiabilityId] = useState(state.liabilities[0]?.id || '');
  const [assetId, setAssetId] = useState(state.assets[0]?.id || '');
  const [payeeOrPayer, setPayeeOrPayer] = useState('');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTransaction) {
      setDate(editingTransaction.date);
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setAccountId(editingTransaction.accountId);
      setToAccountId(editingTransaction.toAccountId || state.accounts[1]?.id || '');
      setCategoryId(editingTransaction.categoryId || state.categories[0]?.id || '');
      setGoalId(editingTransaction.goalId || state.goals[0]?.id || '');
      setLiabilityId(editingTransaction.liabilityId || state.liabilities[0]?.id || '');
      setAssetId(editingTransaction.assetId || state.assets[0]?.id || '');
      setPayeeOrPayer(editingTransaction.payeeOrPayer || '');
      setNotes(editingTransaction.notes || '');
      setIsRecurring(Boolean(editingTransaction.isRecurring));
    } else {
      setDate(new Date().toISOString().slice(0, 10));
      setType('expense');
      setAmount('');
      setAccountId(state.accounts[0]?.id || '');
      setToAccountId(state.accounts[1]?.id || '');
      setCategoryId(state.categories[0]?.id || '');
      setPayeeOrPayer('');
      setNotes('');
      setIsRecurring(false);
    }
    setError('');
  }, [editingTransaction, isOpen, state]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    if (!accountId) {
      setError('Please select an account');
      return;
    }
    if (type === 'transfer' && accountId === toAccountId) {
      setError('Source and destination accounts must be different');
      return;
    }

    const tx: Transaction = {
      id: editingTransaction ? editingTransaction.id : generateId('tx'),
      date,
      type,
      amount: parsedAmount,
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      categoryId: type === 'expense' ? categoryId : undefined,
      goalId: type === 'savings_contribution' ? goalId : undefined,
      liabilityId: type === 'debt_repayment' ? liabilityId : undefined,
      assetId: type === 'investment_purchase' || type === 'investment_sale' ? assetId : undefined,
      payeeOrPayer: payeeOrPayer.trim() || undefined,
      notes: notes.trim() || undefined,
      isRecurring,
    };

    onSave(tx);
    onClose();
  };

  const TYPE_OPTIONS: { value: TransactionType; label: string }[] = [
    { value: 'expense', label: 'Expense' },
    { value: 'income', label: 'Income' },
    { value: 'transfer', label: 'Transfer' },
    { value: 'savings_contribution', label: 'Savings Deposit' },
    { value: 'debt_repayment', label: 'Loan / Debt Repayment' },
    { value: 'investment_purchase', label: 'Investment Buy' },
    { value: 'investment_sale', label: 'Investment Sale' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingTransaction ? 'Edit Transaction' : 'Record Transaction'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manual entry with real-time double-entry balancing
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="rounded-lg bg-red-50 p-2.5 text-xs font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Type selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setType(opt.value)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium text-center border transition-all ${
                    type === opt.value
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Amount ({state.profile.currency}) *
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                placeholder="e.g. 1500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Accounts selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {type === 'transfer' ? 'From Account *' : 'Account *'}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {state.accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.type})
                  </option>
                ))}
              </select>
            </div>

            {type === 'transfer' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  To Account *
                </label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {state.accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.type})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {type === 'expense' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {state.categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {type === 'savings_contribution' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Savings Goal
                </label>
                <select
                  value={goalId}
                  onChange={(e) => setGoalId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {state.goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                  {state.goals.length === 0 && <option value="">No active goals found</option>}
                </select>
              </div>
            )}

            {type === 'debt_repayment' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Loan / Liability
                </label>
                <select
                  value={liabilityId}
                  onChange={(e) => setLiabilityId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {state.liabilities.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} (Bal: {l.outstandingBalance})
                    </option>
                  ))}
                  {state.liabilities.length === 0 && <option value="">No loans recorded</option>}
                </select>
              </div>
            )}

            {(type === 'investment_purchase' || type === 'investment_sale') && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Asset / Investment
                </label>
                <select
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {state.assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.type})
                    </option>
                  ))}
                  {state.assets.length === 0 && <option value="">No assets recorded</option>}
                </select>
              </div>
            )}
          </div>

          {/* Payee / Payer */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Payee / Source / Merchant (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Grocery Store, Client XYZ, Metro Card"
              value={payeeOrPayer}
              onChange={(e) => setPayeeOrPayer(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes & Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Shared dinner with flatmates"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Recurring Toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isRecurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="isRecurring" className="text-xs text-slate-600 dark:text-slate-400">
              Mark as recurring regular transaction (used in cash flow forecast)
            </label>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500"
            >
              <Check className="h-4 w-4" />
              {editingTransaction ? 'Update Record' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
