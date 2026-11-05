import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Shield,
  Info,
  Layers,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import { FinancialState, FinancialSummary } from '../../types/finance';
import {
  forecastCashFlow,
  forecastSavings,
  predictGoalCompletions,
  predictCategoryExpenses,
  forecastNetWorth,
} from '../../services/predictionEngine';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface PredictionsViewProps {
  state: FinancialState;
  summary: FinancialSummary;
}

export const PredictionsView: React.FC<PredictionsViewProps> = ({ state, summary }) => {
  const cur = state.profile.currency;
  const [activeTab, setActiveTab] = useState<'cashflow' | 'savings' | 'goals' | 'categories' | 'networth'>('cashflow');
  const [assumedAnnualGrowth, setAssumedAnnualGrowth] = useState(8);

  const cashFlowForecast = useMemo(() => forecastCashFlow(state, summary), [state, summary]);
  const savingsForecast = useMemo(() => forecastSavings(state, summary), [state, summary]);
  const goalPredictions = useMemo(() => predictGoalCompletions(state, summary), [state, summary]);
  const categoryPredictions = useMemo(() => predictCategoryExpenses(state), [state]);
  const netWorthForecast = useMemo(
    () => forecastNetWorth(state, summary, assumedAnnualGrowth),
    [state, summary, assumedAnnualGrowth]
  );

  return (
    <div className="space-y-6">
      {/* Header with Transparency Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Mathematical Prediction Engine
            </h1>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              Deterministic Algorithms
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Linear regressions, exponential moving averages, and scenario projections. No synthetic hallucinated numbers.
          </p>
        </div>

        {/* Tab pills */}
        <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 text-xs dark:border-slate-800 dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('cashflow')}
            className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
              activeTab === 'cashflow'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            30-Day Cash Flow
          </button>
          <button
            onClick={() => setActiveTab('savings')}
            className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
              activeTab === 'savings'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Savings Horizon
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
              activeTab === 'goals'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Goals Completion
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
              activeTab === 'categories'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Category Spend Trends
          </button>
          <button
            onClick={() => setActiveTab('networth')}
            className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
              activeTab === 'networth'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            5-Year Net Worth
          </button>
        </div>
      </div>

      {/* TAB 1: 30-DAY CASH FLOW FORECAST */}
      {activeTab === 'cashflow' && (
        <div className="space-y-6">
          {/* Risk Alert & KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Projected Month-End Balance
              </span>
              <div className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(cashFlowForecast.projectedMonthEndBalance, cur)}
              </div>
              <span className="text-[11px] text-slate-400">
                Starting from {formatCurrency(cashFlowForecast.currentBalance, cur)}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Lowest Projected Dip
              </span>
              <div className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(cashFlowForecast.minProjectedBalance, cur)}
              </div>
              <span className="text-[11px] text-slate-400">Minimum liquid cushion</span>
            </div>

            <div
              className={`rounded-xl border p-4 shadow-xs ${
                cashFlowForecast.cashShortageRisk === 'High'
                  ? 'border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200'
                  : cashFlowForecast.cashShortageRisk === 'Moderate'
                  ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                {cashFlowForecast.cashShortageRisk === 'None' ? (
                  <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                Cash Shortage Risk: {cashFlowForecast.cashShortageRisk}
              </div>
              <p className="mt-1 text-xs">
                {cashFlowForecast.cashShortageRisk === 'None'
                  ? 'Projected cash flow remains positive throughout the next 30 days.'
                  : `Potential liquidity shortfall anticipated around ${cashFlowForecast.shortageDate || 'mid-month'}. Consider postponing non-essential expenses.`}
              </p>
            </div>
          </div>

          {/* Line Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Projected Daily Liquid Balance (Next 30 Days)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Factoring recurring scheduled income, pending bills, and baseline daily burn rate
            </p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowForecast.points} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(d) => `Day ${d}`} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val), cur)}
                    labelFormatter={(d) => `Day ${d}`}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="projectedBalance" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#balanceGrad)" name="Liquid Balance" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Model Transparency Box */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60 text-xs space-y-2">
            <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Info className="h-4 w-4 text-emerald-500" /> Model Method: {cashFlowForecast.meta.method}
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                Confidence: {cashFlowForecast.meta.confidenceScore}%
              </span>
            </div>
            <div className="text-slate-500 dark:text-slate-400">
              <b>Assumptions:</b> {cashFlowForecast.meta.assumptions.join(' ')}
            </div>
            <div className="text-slate-400 dark:text-slate-500">
              <b>Limitations:</b> {cashFlowForecast.meta.limitations.join(' ')}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SAVINGS HORIZON */}
      {activeTab === 'savings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {savingsForecast.milestones.map((m) => (
              <div key={m.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {m.label}
                </span>
                <div className="mt-2 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(m.projectedSavings, cur)}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  Range: {formatCurrency(m.conservativeSavings, cur)} – {formatCurrency(m.optimisticSavings, cur)}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Projected Cumulative Savings Bands
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Conservative (70%), Expected (100%), and Optimistic (130%) surplus trajectories
            </p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={savingsForecast.milestones} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val), cur)}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="conservativeSavings" name="Conservative" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="projectedSavings" name="Expected Baseline" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="optimisticSavings" name="Optimistic" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GOAL COMPLETIONS */}
      {activeTab === 'goals' && (
        <div className="space-y-4">
          {goalPredictions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goalPredictions.map((gp) => (
                <div key={gp.goalId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {gp.goalName}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        gp.feasibleWithCurrentSurplus
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {gp.feasibleWithCurrentSurplus ? 'On Track' : 'Surplus Boost Needed'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Progress: {gp.progressPercent}%</span>
                      <span>
                        {formatCurrency(gp.currentSaved, cur)} of {formatCurrency(gp.targetAmount, cur)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${gp.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Required Monthly Saving</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(gp.requiredMonthlyContribution, cur)}/mo
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Projected Completion Date</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {gp.projectedCompletionDate}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-xs text-slate-500">
              No financial goals added yet. Go to Financial Goals in Onboarding or Settings to set your milestones!
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CATEGORY SPEND TRENDS */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryPredictions.map((cp) => (
              <div key={cp.categoryId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {cp.categoryName}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      cp.budgetStatus === 'within_budget'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : cp.budgetStatus === 'near_limit'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {cp.budgetStatus === 'within_budget' ? 'Safe' : cp.budgetStatus === 'near_limit' ? 'Caution' : 'Over Budget'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Projected Next Month</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {formatCurrency(cp.projectedNextMonth, cur)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Linear Trend</span>
                    <span
                      className={`text-xs font-semibold ${
                        cp.trendDirection === 'increasing'
                          ? 'text-rose-500'
                          : cp.trendDirection === 'decreasing'
                          ? 'text-emerald-500'
                          : 'text-slate-400'
                      }`}
                    >
                      {cp.trendPercent >= 0 ? `+${cp.trendPercent}%` : `${cp.trendPercent}%`}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                  <span>Monthly Budget: {formatCurrency(cp.budgetAmount, cur)}</span>
                  <span>Avg: {formatCurrency(cp.historicalMonthlyAvg, cur)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: 5-YEAR NET WORTH FORECAST */}
      {activeTab === 'networth' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Multi-Year Net Worth Trajectory (1 to 5 Years)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Simulating asset compounding, monthly savings contributions, and debt payoff
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Assumed Annual Return:</span>
                <input
                  type="number"
                  min="0"
                  max="25"
                  value={assumedAnnualGrowth}
                  onChange={(e) => setAssumedAnnualGrowth(parseFloat(e.target.value) || 0)}
                  className="w-16 rounded-md border border-slate-200 px-2 py-1 text-center font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <span className="text-slate-500">%</span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={netWorthForecast.projections} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val), cur)}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="projectedNetWorth" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#nwGrad)" name="Net Worth" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
