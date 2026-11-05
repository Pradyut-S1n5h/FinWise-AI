import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { FinancialState, FinancialSummary } from '../../types/finance';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface AnalyticsViewProps {
  state: FinancialState;
  summary: FinancialSummary;
}

const PALETTE = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#6366f1', '#14b8a6', '#f97316', '#64748b'];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ state, summary }) => {
  const cur = state.profile.currency;
  const [timeframe, setTimeframe] = useState<'3months' | '6months' | 'all'>('3months');

  // 1. Monthly Income, Expenses, and Savings Rate over time
  const monthlyTrends = useMemo(() => {
    const map: Record<string, { label: string; income: number; expenses: number; savings: number }> = {};
    const now = new Date();
    const monthsCount = timeframe === '3months' ? 3 : timeframe === '6months' ? 6 : 12;

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      map[key] = {
        label: `${monthNames[d.getMonth()]} '${String(d.getFullYear()).slice(-2)}`,
        income: 0,
        expenses: 0,
        savings: 0,
      };
    }

    state.transactions.forEach((tx) => {
      if (!tx.date) return;
      const [y, m] = tx.date.split('-');
      const key = `${y}-${m}`;
      if (map[key]) {
        if (tx.type === 'income') map[key].income += tx.amount;
        else if (tx.type === 'expense') map[key].expenses += tx.amount;
      }
    });

    return Object.values(map).map((item) => ({
      ...item,
      savings: Math.max(0, item.income - item.expenses),
    }));
  }, [state.transactions, timeframe]);

  // 2. Category Expense Breakdown
  const categoryExpenses = useMemo(() => {
    const map: Record<string, number> = {};
    state.transactions.forEach((tx) => {
      if (tx.type === 'expense' && tx.categoryId) {
        map[tx.categoryId] = (map[tx.categoryId] || 0) + tx.amount;
      }
    });

    const totalExp = Object.values(map).reduce((a, b) => a + b, 0) || 1;

    return Object.entries(map)
      .map(([catId, amount]) => {
        const cat = state.categories.find((c) => c.id === catId);
        return {
          name: cat ? cat.name : 'Other',
          amount,
          percent: (amount / totalExp) * 100,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [state.transactions, state.categories]);

  // 3. Asset Allocation Breakdown
  const assetAllocation = useMemo(() => {
    const items = [
      {
        name: 'Liquid Cash & Bank',
        value: summary.totalAvailableBalance,
      },
      ...state.assets.map((a) => ({
        name: a.name,
        value: Number(a.manualValuation) || Number(a.purchasePrice) || 0,
      })),
    ];
    return items.filter((i) => i.value > 0);
  }, [state.assets, summary.totalAvailableBalance]);

  // 4. Budget vs Actual Variance
  const budgetVariance = useMemo(() => {
    return state.categories.map((cat) => {
      let actual = 0;
      const now = new Date();
      state.transactions.forEach((tx) => {
        if (tx.type === 'expense' && tx.categoryId === cat.id && tx.date) {
          const [y, m] = tx.date.split('-').map(Number);
          if (y === now.getFullYear() && m === now.getMonth() + 1) {
            actual += tx.amount;
          }
        }
      });
      const budget = cat.monthlyBudget || 0;
      const diff = budget - actual;
      const pct = budget > 0 ? (actual / budget) * 100 : 0;
      return {
        name: cat.name,
        budget,
        actual,
        diff,
        pct: Math.min(100, pct),
        isOver: actual > budget,
      };
    });
  }, [state.categories, state.transactions]);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Financial Analytics & Intelligence
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real data visualization of spending patterns, asset distribution, and budget health
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-1 text-xs dark:border-slate-800 dark:bg-slate-900">
          <button
            onClick={() => setTimeframe('3months')}
            className={`rounded-md px-2.5 py-1 font-medium transition-all ${
              timeframe === '3months'
                ? 'bg-slate-900 text-white dark:bg-emerald-600'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            3 Months
          </button>
          <button
            onClick={() => setTimeframe('6months')}
            className={`rounded-md px-2.5 py-1 font-medium transition-all ${
              timeframe === '6months'
                ? 'bg-slate-900 text-white dark:bg-emerald-600'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            6 Months
          </button>
          <button
            onClick={() => setTimeframe('all')}
            className={`rounded-md px-2.5 py-1 font-medium transition-all ${
              timeframe === 'all'
                ? 'bg-slate-900 text-white dark:bg-emerald-600'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            1 Year
          </button>
        </div>
      </div>

      {/* Row 1: Cash Flow Multi-Bar & Line Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Income vs. Expenses & Net Surplus
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Historical trends showing your monthly cash savings margin
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                formatter={(val: any) => formatCurrency(Number(val), cur)}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="income" name="Total Inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Total Outflow" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="savings" name="Net Savings Surplus" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Category Breakdown & Asset Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Category Spending Distribution
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Proportion of all-time expenses by category
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryExpenses}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={45}
                    paddingAngle={2}
                  >
                    {categoryExpenses.map((_, index) => (
                      <Cell key={`cat-${index}`} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val), cur)}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs">
              {categoryExpenses.slice(0, 5).map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}
                    />
                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[110px]">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatPercent(item.percent)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Asset Allocation */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Total Asset Allocation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Liquid reserves vs. long-term investment assets
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetAllocation}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={45}
                    paddingAngle={2}
                  >
                    {assetAllocation.map((_, index) => (
                      <Cell key={`asset-${index}`} fill={PALETTE[(index + 3) % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val), cur)}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs">
              {assetAllocation.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: PALETTE[(idx + 3) % PALETTE.length] }}
                    />
                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[110px]">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(item.value, cur)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Budget vs Actual Variance Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          Current Month Budget vs. Actual Variance
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Tracking category limits and overspending warning thresholds
        </p>

        <div className="space-y-3">
          {budgetVariance.map((row) => (
            <div key={row.name} className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {row.name}
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {formatCurrency(row.actual, cur)} of {formatCurrency(row.budget, cur)} (
                  {Math.round(row.pct)}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    row.isOver
                      ? 'bg-red-500'
                      : row.pct > 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, row.pct)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
