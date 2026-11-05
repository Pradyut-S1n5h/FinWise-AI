import React, { useState, useMemo } from 'react';
import {
  Sliders,
  Sparkles,
  RotateCcw,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { FinancialState, FinancialSummary } from '../../types/finance';
import { runWhatIfSimulation, WhatIfScenarioInputs } from '../../services/whatIfSimulator';
import { formatCurrency } from '../../utils/formatters';

interface SimulatorViewProps {
  state: FinancialState;
  summary: FinancialSummary;
}

const DEFAULT_INPUTS: WhatIfScenarioInputs = {
  monthlySavingsDelta: 2000,
  expensePercentChange: 0,
  incomePercentChange: 0,
  extraLoanPaymentMonthly: 1500,
  investmentReturnRate: 10,
  oneTimePostponedPurchase: 0,
};

export const SimulatorView: React.FC<SimulatorViewProps> = ({ state, summary }) => {
  const cur = state.profile.currency;
  const [inputs, setInputs] = useState<WhatIfScenarioInputs>(DEFAULT_INPUTS);

  const simulation = useMemo(() => runWhatIfSimulation(state, inputs), [state, inputs]);

  const handleReset = () => {
    setInputs(DEFAULT_INPUTS);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              What-If Financial Sandbox
            </h1>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              Zero Impact on Real Data
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Simulate decisions before committing money. Model expense shifts, extra debt payments, and delayed purchases.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset Variables
        </button>
      </div>

      {/* Simulator Controls & Comparative Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Hypothetical Levers
          </h2>

          {/* 1. Monthly Savings Delta */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Save More Each Month
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                +{formatCurrency(inputs.monthlySavingsDelta, cur)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="20000"
              step="500"
              value={inputs.monthlySavingsDelta}
              onChange={(e) => setInputs({ ...inputs, monthlySavingsDelta: parseFloat(e.target.value) || 0 })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* 2. Monthly Expenses % Shift */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Expense Adjustment (%)
              </span>
              <span
                className={`font-bold ${
                  inputs.expensePercentChange > 0
                    ? 'text-red-500'
                    : inputs.expensePercentChange < 0
                    ? 'text-emerald-500'
                    : 'text-slate-400'
                }`}
              >
                {inputs.expensePercentChange > 0 ? `+${inputs.expensePercentChange}%` : `${inputs.expensePercentChange}%`}
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              step="5"
              value={inputs.expensePercentChange}
              onChange={(e) => setInputs({ ...inputs, expensePercentChange: parseFloat(e.target.value) || 0 })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* 3. Monthly Income % Shift */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Income Adjustment (%)
              </span>
              <span
                className={`font-bold ${
                  inputs.incomePercentChange > 0
                    ? 'text-emerald-500'
                    : inputs.incomePercentChange < 0
                    ? 'text-red-500'
                    : 'text-slate-400'
                }`}
              >
                {inputs.incomePercentChange > 0 ? `+${inputs.incomePercentChange}%` : `${inputs.incomePercentChange}%`}
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="40"
              step="5"
              value={inputs.incomePercentChange}
              onChange={(e) => setInputs({ ...inputs, incomePercentChange: parseFloat(e.target.value) || 0 })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* 4. Extra Debt Prepayment */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Extra Debt Prepayment / Mo
              </span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                +{formatCurrency(inputs.extraLoanPaymentMonthly, cur)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="15000"
              step="500"
              value={inputs.extraLoanPaymentMonthly}
              onChange={(e) => setInputs({ ...inputs, extraLoanPaymentMonthly: parseFloat(e.target.value) || 0 })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* 5. Postpone a Big Purchase */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Postpone Purchase (One-time)
              </span>
              <span className="font-bold text-teal-600 dark:text-teal-400">
                {formatCurrency(inputs.oneTimePostponedPurchase, cur)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50000"
              step="1000"
              value={inputs.oneTimePostponedPurchase}
              onChange={(e) => setInputs({ ...inputs, oneTimePostponedPurchase: parseFloat(e.target.value) || 0 })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* 6. Assumed Investment Return Rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Assumed Asset Growth Rate
              </span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                {inputs.investmentReturnRate}% p.a.
              </span>
            </div>
            <input
              type="range"
              min="4"
              max="18"
              step="1"
              value={inputs.investmentReturnRate}
              onChange={(e) => setInputs({ ...inputs, investmentReturnRate: parseFloat(e.target.value) || 0 })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Results & Side-by-Side Comparison */}
        <div className="lg:col-span-2 space-y-4">
          {/* Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1-Year Impact */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                1-Year Net Worth Impact
              </span>
              <div className="mt-2 text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                {simulation.simulatedSummary.oneYearNetWorthImpact >= 0 ? '+' : ''}
                {formatCurrency(simulation.simulatedSummary.oneYearNetWorthImpact, cur)}
              </div>
              <p className="mt-1 text-xs text-emerald-800/80 dark:text-emerald-300/80">
                Extra wealth accumulated in 12 months under this simulated scenario.
              </p>
            </div>

            {/* 3-Year Impact */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900/40 dark:bg-blue-950/30">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                3-Year Net Worth Impact
              </span>
              <div className="mt-2 text-xl font-extrabold text-blue-700 dark:text-blue-400">
                {simulation.simulatedSummary.threeYearNetWorthImpact >= 0 ? '+' : ''}
                {formatCurrency(simulation.simulatedSummary.threeYearNetWorthImpact, cur)}
              </div>
              <p className="mt-1 text-xs text-blue-800/80 dark:text-blue-300/80">
                Longer compounding leverage over 36 months.
              </p>
            </div>

            {/* Debt Acceleration */}
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/30">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
                Debt-Free Acceleration
              </span>
              <div className="mt-2 text-xl font-extrabold text-indigo-700 dark:text-indigo-400">
                {simulation.simulatedSummary.debtFreeMonthsSooner > 0
                  ? `${simulation.simulatedSummary.debtFreeMonthsSooner} Months Sooner`
                  : 'On Schedule'}
              </div>
              <p className="mt-1 text-xs text-indigo-800/80 dark:text-indigo-300/80">
                Time saved on existing loans with extra prepayments.
              </p>
            </div>
          </div>

          {/* Visual Timeline Comparison Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Baseline vs. Simulated Trajectory
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Comparing your real baseline trajectory against the hypothetical simulation
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={simulation.timeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val), cur)}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar dataKey="baselineNetWorth" name="Baseline Trajectory" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="simulatedNetWorth" name="Simulated Scenario" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
