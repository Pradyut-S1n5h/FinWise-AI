import React from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Landmark,
  Scale,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { FinancialState, FinancialSummary, Transaction } from '../../types/finance';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { TabKey } from '../common/Sidebar';

interface DashboardViewProps {
  state: FinancialState;
  summary: FinancialSummary;
  onNavigate: (tab: TabKey) => void;
  onOpenAddTransaction: () => void;
  onLoadDemoData: () => void;
}

const CATEGORY_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6',
  '#06b6d4', '#6366f1', '#14b8a6', '#f97316', '#64748b'
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  summary,
  onNavigate,
  onOpenAddTransaction,
  onLoadDemoData,
}) => {
  const cur = state.profile.currency;
  const isStateEmpty = state.transactions.length === 0;

  // 1. Prepare Income vs Expense comparison chart data (last 4 months)
  const monthlyDataMap: Record<string, { month: string; income: number; expense: number; savings: number }> = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Initialize last 4 months
  const now = new Date();
  for (let i = 3; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyDataMap[key] = {
      month: `${monthNames[d.getMonth()]} '${String(d.getFullYear()).slice(-2)}`,
      income: 0,
      expense: 0,
      savings: 0,
    };
  }

  state.transactions.forEach((tx) => {
    if (!tx.date) return;
    const [y, m] = tx.date.split('-');
    const key = `${y}-${m}`;
    if (monthlyDataMap[key]) {
      if (tx.type === 'income') {
        monthlyDataMap[key].income += tx.amount;
      } else if (tx.type === 'expense') {
        monthlyDataMap[key].expense += tx.amount;
      }
    }
  });

  const cashFlowTrendData = Object.values(monthlyDataMap).map((d) => ({
    ...d,
    savings: Math.max(0, d.income - d.expense),
  }));

  // 2. Prepare Category Breakdown Pie Data
  const categorySpendMap: Record<string, number> = {};
  state.transactions.forEach((tx) => {
    if (tx.type === 'expense' && tx.categoryId) {
      categorySpendMap[tx.categoryId] = (categorySpendMap[tx.categoryId] || 0) + tx.amount;
    }
  });

  const categoryPieData = Object.entries(categorySpendMap)
    .map(([catId, amount]) => {
      const cat = state.categories.find((c) => c.id === catId);
      return {
        name: cat ? cat.name : 'Other',
        value: amount,
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // 3. Upcoming Obligations in next 30 days
  const upcomingEvents = state.calendarEvents
    .filter((e) => !e.isPaid)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  // 4. Recent Transactions
  const recentTransactions = state.transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Hello, {state.profile.displayName || 'Explorer'}
            </h1>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Verified Manual Ledger
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {summary.monthlySavings >= 0 ? (
              <span>
                You have a net cash surplus of{' '}
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(summary.monthlySavings, cur)}
                </strong>{' '}
                this month with a savings rate of {summary.savingsRate.toFixed(1)}%.
              </span>
            ) : (
              <span>
                Your current monthly expenses exceed income by{' '}
                <strong className="text-red-500">
                  {formatCurrency(Math.abs(summary.monthlySavings), cur)}
                </strong>
                .
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isStateEmpty && (
            <button
              onClick={onLoadDemoData}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50/70 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
            >
              <Sparkles className="h-3.5 w-3.5" /> Load Realistic Demo
            </button>
          )}
          <button
            onClick={() => onNavigate('copilot')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            Ask Copilot
          </button>
          <button
            onClick={onOpenAddTransaction}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500 active:scale-95 transition-all"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            Record Transaction
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (8 Key Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Available Balance */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Available Liquid Cash</span>
            <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(summary.totalAvailableBalance, cur)}
          </div>
          <div className="mt-1 flex items-center text-[11px] text-slate-500 dark:text-slate-400">
            <span>Across {state.accounts.length} accounts</span>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Monthly Inflow</span>
            <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(summary.monthlyIncomeActual || summary.monthlyIncomeExpected, cur)}
          </div>
          <div className="mt-1 flex items-center text-[11px] text-slate-500 dark:text-slate-400">
            <span>{summary.monthlyIncomeActual > 0 ? 'Recorded this month' : 'Expected baseline'}</span>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Monthly Outflow</span>
            <div className="rounded-lg bg-rose-50 p-1.5 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(summary.monthlyExpensesActual, cur)}
          </div>
          <div className="mt-1 flex items-center text-[11px] text-slate-500 dark:text-slate-400">
            <span>Budget: {formatCurrency(summary.monthlyExpensesBudgeted, cur)}</span>
          </div>
        </div>

        {/* Net Worth */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Consolidated Net Worth</span>
            <div className="rounded-lg bg-teal-50 p-1.5 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
              <Scale className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(summary.netWorth, cur)}
          </div>
          <div className="mt-1 flex items-center text-[11px] text-slate-500 dark:text-slate-400">
            <span>Assets − Liabilities</span>
          </div>
        </div>

        {/* Total Assets */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Total Assets</span>
            <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Landmark className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(summary.totalAssetsValue, cur)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Cash + {state.assets.length} Holdings
          </div>
        </div>

        {/* Total Liabilities */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Total Liabilities</span>
            <div className="rounded-lg bg-amber-50 p-1.5 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(summary.totalLiabilitiesValue, cur)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Loans & Credit Cards
          </div>
        </div>

        {/* Savings Rate Progress */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Savings Rate</span>
            <div className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {summary.savingsRate.toFixed(1)}%
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Target: 20%+ of income
          </div>
        </div>

        {/* Emergency Fund Coverage */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Emergency Runway</span>
            <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {summary.emergencyFundCoverageMonths.toFixed(1)} Months
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Target: {state.profile.emergencyFundTargetMonths || 6} months
          </div>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Income vs. Expenses Trend
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monthly actual cash flow history
              </p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 flex items-center gap-1 dark:text-emerald-400"
            >
              Full Analytics <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => formatCurrency(Number(val), cur)}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Breakdown Pie */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Expense Breakdown
              </h2>
              <button
                onClick={() => onNavigate('budget')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
              >
                Budgets
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Where your money is allocated
            </p>

            {categoryPieData.length > 0 ? (
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {categoryPieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => formatCurrency(Number(val), cur)}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center text-xs text-slate-400 text-center">
                No recorded expense categories yet. Add an expense transaction to see your distribution!
              </div>
            )}
          </div>

          <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            {categoryPieData.slice(0, 3).map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                  />
                  <span className="text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
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

      {/* Two Column Grid: Upcoming Obligations & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Financial Calendar Events */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Upcoming Obligations & Inflows
              </h2>
            </div>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
            >
              Open Calendar
            </button>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {upcomingEvents.map((ev) => (
                <div key={ev.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        ev.type === 'income' ? 'bg-emerald-500' : ev.type === 'emi' ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {ev.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Due: {formatDate(ev.date)} {ev.recurring !== 'none' ? `(${ev.recurring})` : ''}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`text-xs font-bold ${
                      ev.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {ev.type === 'income' ? '+' : '-'}
                    {formatCurrency(ev.amount, cur)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No upcoming pending events. Add bills or salary reminders in your Financial Calendar!
            </div>
          )}
        </div>

        {/* Recent Transactions List */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h2>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
            >
              View All ({state.transactions.length})
            </button>
          </div>

          {recentTransactions.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {tx.payeeOrPayer || tx.type.replace('_', ' ')}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{formatDate(tx.date)}</span>
                      <span>•</span>
                      <span className="capitalize">{tx.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div
                    className={`text-xs font-bold ${
                      tx.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatCurrency(tx.amount, cur)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No transactions recorded yet. Click "Record Transaction" above to start your financial ledger!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
