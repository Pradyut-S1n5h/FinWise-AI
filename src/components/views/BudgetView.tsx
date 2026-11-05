import React, { useState } from 'react';
import {
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Plus,
  Save,
  PieChart,
} from 'lucide-react';
import { FinancialState, ExpenseCategory } from '../../types/finance';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface BudgetViewProps {
  state: FinancialState;
  onUpdateCategoryBudget: (categoryId: string, newBudget: number) => void;
  onAddCustomCategory: (cat: ExpenseCategory) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  state,
  onUpdateCategoryBudget,
  onAddCustomCategory,
}) => {
  const cur = state.profile.currency;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatBudget, setNewCatBudget] = useState('3000');
  const [newCatFixed, setNewCatFixed] = useState(false);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Calculate actual spending per category in the current month
  const categorySpending: Record<string, number> = {};
  let totalActualSpend = 0;

  state.transactions.forEach((tx) => {
    if (tx.type === 'expense' && tx.categoryId && tx.date) {
      const [y, m] = tx.date.split('-').map(Number);
      if (y === currentYear && m === currentMonth + 1) {
        categorySpending[tx.categoryId] = (categorySpending[tx.categoryId] || 0) + tx.amount;
        totalActualSpend += tx.amount;
      }
    }
  });

  const totalBudget = state.categories.reduce((sum, c) => sum + (c.monthlyBudget || 0), 0);
  const totalRemaining = Math.max(0, totalBudget - totalActualSpend);
  const totalUtilization = totalBudget > 0 ? (totalActualSpend / totalBudget) * 100 : 0;

  const handleStartEdit = (cat: ExpenseCategory) => {
    setEditingId(cat.id);
    setEditValue(cat.monthlyBudget.toString());
  };

  const handleSaveEdit = (catId: string) => {
    const val = parseFloat(editValue);
    if (!isNaN(val) && val >= 0) {
      onUpdateCategoryBudget(catId, val);
    }
    setEditingId(null);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: ExpenseCategory = {
      id: `cat_custom_${Date.now()}`,
      name: newCatName.trim(),
      icon: 'Tag',
      color: '#06b6d4',
      monthlyBudget: parseFloat(newCatBudget) || 2000,
      isFixed: newCatFixed,
      isCustom: true,
    };

    onAddCustomCategory(newCat);
    setNewCatName('');
    setNewCatBudget('3000');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Budget Management & Spending Limits
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set and monitor category limits with automated overspending alerts
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500"
        >
          <Plus className="h-3.5 w-3.5" /> Add Custom Category
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Total Monthly Budget
          </span>
          <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalBudget, cur)}
          </div>
          <span className="text-[11px] text-slate-400">Across {state.categories.length} categories</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Total Spent So Far
          </span>
          <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalActualSpend, cur)}
          </div>
          <span className="text-[11px] text-slate-400">
            Utilization: {totalUtilization.toFixed(1)}%
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Remaining Budget Headroom
          </span>
          <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalRemaining, cur)}
          </div>
          <span className="text-[11px] text-slate-400">Safe to spend this month</span>
        </div>
      </div>

      {/* Category Budget Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {state.categories.map((cat) => {
          const spent = categorySpending[cat.id] || 0;
          const budget = cat.monthlyBudget || 1;
          const pct = Math.round((spent / budget) * 100);
          const remaining = budget - spent;
          const isOver = spent > budget;
          const isWarning = pct >= 80 && !isOver;

          return (
            <div
              key={cat.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: cat.color || '#10b981' }}
                  />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {cat.name}
                  </h3>
                  {cat.isFixed && (
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[9px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      Fixed
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {editingId === cat.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-20 rounded-md border border-slate-300 px-1.5 py-0.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                      <button
                        onClick={() => handleSaveEdit(cat.id)}
                        className="rounded p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                      >
                        <Save className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(cat)}
                      title="Edit Budget Limit"
                      className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    Spent: <b className="text-slate-800 dark:text-slate-200">{formatCurrency(spent, cur)}</b>
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    Limit: <b className="text-slate-800 dark:text-slate-200">{formatCurrency(budget, cur)}</b>
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      isOver ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </div>

              {/* Status footer */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span
                  className={`flex items-center gap-1 font-semibold ${
                    isOver
                      ? 'text-red-600 dark:text-red-400'
                      : isWarning
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {isOver ? (
                    <>
                      <AlertTriangle className="h-3.5 w-3.5" /> Exceeded by {formatCurrency(Math.abs(remaining), cur)}
                    </>
                  ) : isWarning ? (
                    <>
                      <AlertTriangle className="h-3.5 w-3.5" /> Near limit: {formatCurrency(remaining, cur)} left
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" /> {formatCurrency(remaining, cur)} remaining
                    </>
                  )}
                </span>
                <span className="text-[11px] text-slate-400 font-bold">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add Expense Category
            </h3>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pet Care, Gaming, Coffee"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Budget Limit ({cur})
                </label>
                <input
                  type="number"
                  min="0"
                  value={newCatBudget}
                  onChange={(e) => setNewCatBudget(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="fixedCat"
                  checked={newCatFixed}
                  onChange={(e) => setNewCatFixed(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="fixedCat" className="text-xs text-slate-600 dark:text-slate-400">
                  Fixed Expense (Mandatory bill/rent)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
