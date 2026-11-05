import React, { useState } from 'react';
import {
  Calculator as CalcIcon,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Percent,
  Clock,
  DollarSign,
  PieChart,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { FinancialCalculators, AmortizationRow } from '../../services/calculators';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { CurrencyCode } from '../../types/finance';

interface CalculatorsViewProps {
  currency: CurrencyCode;
}

type CalculatorKey =
  | 'basic'
  | 'incomeExpense'
  | 'budgetRule'
  | 'savings'
  | 'compoundInterest'
  | 'simpleInterest'
  | 'loanEMI'
  | 'loanPrepay'
  | 'netWorth'
  | 'investmentReturn'
  | 'percentage'
  | 'inflation'
  | 'savingsGoal'
  | 'sip';

export const CalculatorsView: React.FC<CalculatorsViewProps> = ({ currency }) => {
  const [activeCalc, setActiveCalc] = useState<CalculatorKey>('compoundInterest');

  // 1. Basic Calculator State
  const [basicA, setBasicA] = useState('100');
  const [basicB, setBasicB] = useState('25');
  const [basicOp, setBasicOp] = useState<'+' | '-' | '*' | '/'>('+');

  // 2. Income-Expense
  const [ieIncome, setIeIncome] = useState('50000');
  const [ieExpenses, setIeExpenses] = useState('32000');

  // 3. Budget Rule
  const [brIncome, setBrIncome] = useState('45000');

  // 4. Savings Calculator
  const [savInit, setSavInit] = useState('10000');
  const [savMonthly, setSavMonthly] = useState('3000');
  const [savRate, setSavRate] = useState('7');
  const [savYears, setSavYears] = useState('5');

  // 5. Compound Interest
  const [ciPrincipal, setCiPrincipal] = useState('25000');
  const [ciRate, setCiRate] = useState('10');
  const [ciFreq, setCiFreq] = useState('12'); // monthly
  const [ciYears, setCiYears] = useState('10');

  // 6. Simple Interest
  const [siPrincipal, setSiPrincipal] = useState('20000');
  const [siRate, setSiRate] = useState('6.5');
  const [siYears, setSiYears] = useState('3');

  // 7. Loan EMI
  const [emiPrincipal, setEmiPrincipal] = useState('500000');
  const [emiRate, setEmiRate] = useState('8.5');
  const [emiTenure, setEmiTenure] = useState('60'); // 5 years

  // 8. Loan Prepayment
  const [prepPrincipal, setPrepPrincipal] = useState('400000');
  const [prepRate, setPrepRate] = useState('9');
  const [prepTenure, setPrepTenure] = useState('60');
  const [prepExtra, setPrepExtra] = useState('2000');

  // 9. Net Worth
  const [nwLiquid, setNwLiquid] = useState('45000');
  const [nwInvest, setNwInvest] = useState('120000');
  const [nwOther, setNwOther] = useState('35000');
  const [nwLoans, setNwLoans] = useState('30000');
  const [nwCards, setNwCards] = useState('5000');

  // 10. Investment Return / CAGR
  const [cagrInit, setCagrInit] = useState('50000');
  const [cagrFinal, setCagrFinal] = useState('110000');
  const [cagrYears, setCagrYears] = useState('5');

  // 11. Percentage Calculator
  const [pctVal, setPctVal] = useState('450');
  const [pctTotal, setPctTotal] = useState('3000');
  const [pctMode, setPctMode] = useState<'what_percent_is' | 'percent_of' | 'percent_change'>('what_percent_is');

  // 12. Inflation Calculator
  const [infAmt, setInfAmt] = useState('10000');
  const [infRate, setInfRate] = useState('6');
  const [infYears, setInfYears] = useState('10');

  // 13. Savings Goal
  const [goalTarget, setGoalTarget] = useState('100000');
  const [goalCurrent, setGoalCurrent] = useState('20000');
  const [goalMonths, setGoalMonths] = useState('18');
  const [goalRate, setGoalRate] = useState('6');

  // 14. SIP Calculator
  const [sipMonthly, setSipMonthly] = useState('5000');
  const [sipRate, setSipRate] = useState('12');
  const [sipYears, setSipYears] = useState('10');

  const CALC_TABS: { key: CalculatorKey; label: string }[] = [
    { key: 'compoundInterest', label: '5. Compound Interest' },
    { key: 'sip', label: '14. SIP / Mutual Fund' },
    { key: 'loanEMI', label: '7. Loan EMI & Amortization' },
    { key: 'loanPrepay', label: '8. Loan Prepayment Savings' },
    { key: 'savingsGoal', label: '13. Savings Goal Sinking' },
    { key: 'savings', label: '4. Savings Future Value' },
    { key: 'budgetRule', label: '3. 50/30/20 Budget' },
    { key: 'inflation', label: '12. Inflation & Purchasing Power' },
    { key: 'investmentReturn', label: '10. Investment CAGR Return' },
    { key: 'incomeExpense', label: '2. Net Cash Flow' },
    { key: 'netWorth', label: '9. Net Worth Breakdown' },
    { key: 'percentage', label: '11. Percentage & Discounts' },
    { key: 'simpleInterest', label: '6. Simple Interest' },
    { key: 'basic', label: '1. Basic Calculator' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Instant Financial Calculators
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          All 14 instant math engines with zero lag, clear formulas, and amortization schedules
        </p>
      </div>

      {/* Calculator Tab Pills */}
      <div className="flex flex-wrap gap-1.5 rounded-2xl border border-slate-200 bg-white p-2 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {CALC_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveCalc(tab.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeCalc === tab.key
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CALCULATOR PANELS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {/* 1. BASIC CALCULATOR */}
        {activeCalc === 'basic' && (() => {
          const res = FinancialCalculators.basic(parseFloat(basicA) || 0, parseFloat(basicB) || 0, basicOp);
          return (
            <div className="max-w-md space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Basic Arithmetic Calculator</h2>
              <div className="grid grid-cols-3 gap-2 items-center">
                <input
                  type="number"
                  value={basicA}
                  onChange={(e) => setBasicA(e.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <select
                  value={basicOp}
                  onChange={(e) => setBasicOp(e.target.value as any)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-center font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="+">+</option>
                  <option value="-">−</option>
                  <option value="*">×</option>
                  <option value="/">÷</option>
                </select>
                <input
                  type="number"
                  value={basicB}
                  onChange={(e) => setBasicB(e.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="rounded-xl bg-emerald-50 p-4 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                <div className="text-xs font-semibold">Calculated Result:</div>
                <div className="text-2xl font-bold mt-1">{res.result}</div>
                <div className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-1">{res.formula}</div>
              </div>
            </div>
          );
        })()}

        {/* 2. INCOME-EXPENSE */}
        {activeCalc === 'incomeExpense' && (() => {
          const res = FinancialCalculators.incomeExpense(parseFloat(ieIncome) || 0, parseFloat(ieExpenses) || 0);
          return (
            <div className="max-w-md space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Income vs. Expense Net Cash Flow</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Total Income ({currency})</label>
                  <input
                    type="number"
                    value={ieIncome}
                    onChange={(e) => setIeIncome(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Total Expenses ({currency})</label>
                  <input
                    type="number"
                    value={ieExpenses}
                    onChange={(e) => setIeExpenses(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                <div className="text-xs font-semibold">Net Cash Flow:</div>
                <div className="text-2xl font-bold mt-1">{formatCurrency(res.netSavings, currency)}</div>
                <div className="text-xs mt-1">Status: <b>{res.status}</b> • Savings Rate: <b>{res.savingsRate.toFixed(1)}%</b></div>
              </div>
            </div>
          );
        })()}

        {/* 3. BUDGET RULE 50/30/20 */}
        {activeCalc === 'budgetRule' && (() => {
          const res = FinancialCalculators.budgetRule(parseFloat(brIncome) || 0);
          return (
            <div className="max-w-lg space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">50/30/20 Budget Rule Allocation</h2>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Monthly Net Income ({currency})</label>
                <input
                  type="number"
                  value={brIncome}
                  onChange={(e) => setBrIncome(e.target.value)}
                  className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-center dark:border-blue-900/40 dark:bg-blue-950/30">
                  <div className="text-xs font-semibold text-blue-800 dark:text-blue-300">50% Needs</div>
                  <div className="text-lg font-bold text-blue-900 dark:text-blue-100 mt-1">{formatCurrency(res.needs, currency)}</div>
                  <div className="text-[10px] text-blue-700/80 mt-1">Rent, Food, Transport</div>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-center dark:border-amber-900/40 dark:bg-amber-950/30">
                  <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">30% Wants</div>
                  <div className="text-lg font-bold text-amber-900 dark:text-amber-100 mt-1">{formatCurrency(res.wants, currency)}</div>
                  <div className="text-[10px] text-amber-700/80 mt-1">Dining, Hobbies, Trips</div>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-center dark:border-emerald-900/40 dark:bg-emerald-950/30">
                  <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">20% Savings</div>
                  <div className="text-lg font-bold text-emerald-900 dark:text-emerald-100 mt-1">{formatCurrency(res.savingsDebt, currency)}</div>
                  <div className="text-[10px] text-emerald-700/80 mt-1">SIP, Emergency, Debt</div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 4. SAVINGS CALCULATOR */}
        {activeCalc === 'savings' && (() => {
          const res = FinancialCalculators.savings(parseFloat(savInit) || 0, parseFloat(savMonthly) || 0, parseFloat(savRate) || 0, parseFloat(savYears) || 0);
          return (
            <div className="max-w-lg space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Savings Future Value Calculator</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500">Initial ({currency})</label>
                  <input
                    type="number"
                    value={savInit}
                    onChange={(e) => setSavInit(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500">Monthly Deposit</label>
                  <input
                    type="number"
                    value={savMonthly}
                    onChange={(e) => setSavMonthly(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500">Rate (% p.a.)</label>
                  <input
                    type="number"
                    value={savRate}
                    onChange={(e) => setSavRate(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500">Years</label>
                  <input
                    type="number"
                    value={savYears}
                    onChange={(e) => setSavYears(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <div>
                  <div className="text-xs text-slate-500">Total Contributed</div>
                  <div className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1">{formatCurrency(res.totalContributed, currency)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Interest Earned</div>
                  <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(res.interestEarned, currency)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Future Maturity</div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{formatCurrency(res.futureValue, currency)}</div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 5. COMPOUND INTEREST */}
        {activeCalc === 'compoundInterest' && (() => {
          const res = FinancialCalculators.compoundInterest(
            parseFloat(ciPrincipal) || 0,
            parseFloat(ciRate) || 0,
            parseFloat(ciFreq) || 12,
            parseFloat(ciYears) || 0
          );
          return (
            <div className="max-w-lg space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Compound Interest: A = P(1 + r/n)^(nt)</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500">Principal ({currency})</label>
                  <input
                    type="number"
                    value={ciPrincipal}
                    onChange={(e) => setCiPrincipal(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500">Annual Rate (%)</label>
                  <input
                    type="number"
                    value={ciRate}
                    onChange={(e) => setCiRate(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500">Compounding</label>
                  <select
                    value={ciFreq}
                    onChange={(e) => setCiFreq(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="12">Monthly (12/yr)</option>
                    <option value="4">Quarterly (4/yr)</option>
                    <option value="1">Annually (1/yr)</option>
                    <option value="365">Daily (365/yr)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500">Years</label>
                  <input
                    type="number"
                    value={ciYears}
                    onChange={(e) => setCiYears(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                <div className="text-xs font-semibold">Total Accumulated Amount:</div>
                <div className="text-3xl font-extrabold mt-1">{formatCurrency(res.futureValue, currency)}</div>
                <div className="text-xs mt-2 flex justify-between border-t border-emerald-200/60 dark:border-emerald-800/60 pt-2">
                  <span>Interest Accumulated: <b>{formatCurrency(res.totalInterest, currency)}</b></span>
                  <span>Formula: <code>{res.formula}</code></span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 6. SIMPLE INTEREST */}
        {activeCalc === 'simpleInterest' && (() => {
          const res = FinancialCalculators.simpleInterest(parseFloat(siPrincipal) || 0, parseFloat(siRate) || 0, parseFloat(siYears) || 0);
          return (
            <div className="max-w-md space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Simple Interest: I = (P × R × T) / 100</h2>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Principal ({currency})</label>
                  <input
                    type="number"
                    value={siPrincipal}
                    onChange={(e) => setSiPrincipal(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Rate (%)</label>
                  <input
                    type="number"
                    value={siRate}
                    onChange={(e) => setSiRate(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Years</label>
                  <input
                    type="number"
                    value={siYears}
                    onChange={(e) => setSiYears(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 space-y-1">
                <div className="text-xs text-slate-500">Interest Earned: <b className="text-emerald-600">{formatCurrency(res.interest, currency)}</b></div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">Total Amount: {formatCurrency(res.totalAmount, currency)}</div>
              </div>
            </div>
          );
        })()}

        {/* 7. LOAN EMI & AMORTIZATION */}
        {activeCalc === 'loanEMI' && (() => {
          const res = FinancialCalculators.loanEMI(parseFloat(emiPrincipal) || 0, parseFloat(emiRate) || 0, parseFloat(emiTenure) || 1);
          return (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Loan Equated Monthly Installment (EMI)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Loan Amount ({currency})</label>
                  <input
                    type="number"
                    value={emiPrincipal}
                    onChange={(e) => setEmiPrincipal(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Annual Interest Rate (%)</label>
                  <input
                    type="number"
                    value={emiRate}
                    onChange={(e) => setEmiRate(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Tenure (Months)</label>
                  <input
                    type="number"
                    value={emiTenure}
                    onChange={(e) => setEmiTenure(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30">
                  <div className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold">Monthly EMI</div>
                  <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">{formatCurrency(res.monthlyEMI, currency)}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                  <div className="text-xs text-slate-500 font-semibold">Total Interest Paid</div>
                  <div className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-1">{formatCurrency(res.totalInterest, currency)}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                  <div className="text-xs text-slate-500 font-semibold">Total Outflow</div>
                  <div className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-1">{formatCurrency(res.totalPayment, currency)}</div>
                </div>
              </div>

              {/* Amortization Table */}
              <div className="pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Amortization Schedule (First 12 Months)</h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="p-2">Month</th>
                        <th className="p-2">Payment</th>
                        <th className="p-2">Principal</th>
                        <th className="p-2">Interest</th>
                        <th className="p-2">Remaining Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {res.amortizationSchedule.slice(0, 12).map((row) => (
                        <tr key={row.month} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="p-2 font-medium">{row.month}</td>
                          <td className="p-2">{formatCurrency(row.payment, currency)}</td>
                          <td className="p-2 text-emerald-600">{formatCurrency(row.principal, currency)}</td>
                          <td className="p-2 text-rose-500">{formatCurrency(row.interest, currency)}</td>
                          <td className="p-2 font-semibold">{formatCurrency(row.remainingBalance, currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 8. LOAN PREPAYMENT */}
        {activeCalc === 'loanPrepay' && (() => {
          const res = FinancialCalculators.loanPrepayment(
            parseFloat(prepPrincipal) || 0,
            parseFloat(prepRate) || 0,
            parseFloat(prepTenure) || 1,
            parseFloat(prepExtra) || 0
          );
          return (
            <div className="max-w-xl space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Loan Prepayment & Early Payoff</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500">Loan Principal</label>
                  <input
                    type="number"
                    value={prepPrincipal}
                    onChange={(e) => setPrepPrincipal(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500">Rate (%)</label>
                  <input
                    type="number"
                    value={prepRate}
                    onChange={(e) => setPrepRate(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500">Tenure (Mos)</label>
                  <input
                    type="number"
                    value={prepTenure}
                    onChange={(e) => setPrepTenure(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500">Extra/Month ({currency})</label>
                  <input
                    type="number"
                    value={prepExtra}
                    onChange={(e) => setPrepExtra(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30">
                  <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Total Interest Saved</div>
                  <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">{formatCurrency(res.interestSaved, currency)}</div>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900/40 dark:bg-blue-950/30">
                  <div className="text-xs font-semibold text-blue-800 dark:text-blue-300">Debt Duration Shortened By</div>
                  <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 mt-1">{res.monthsSaved} Months</div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 9. NET WORTH CALCULATOR */}
        {activeCalc === 'netWorth' && (() => {
          const res = FinancialCalculators.netWorth(
            parseFloat(nwLiquid) || 0,
            parseFloat(nwInvest) || 0,
            parseFloat(nwOther) || 0,
            parseFloat(nwLoans) || 0,
            parseFloat(nwCards) || 0
          );
          return (
            <div className="max-w-xl space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Net Worth Snapshot Calculator</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-500 font-semibold">Liquid Cash ({currency})</label>
                  <input
                    type="number"
                    value={nwLiquid}
                    onChange={(e) => setNwLiquid(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold">Investments ({currency})</label>
                  <input
                    type="number"
                    value={nwInvest}
                    onChange={(e) => setNwInvest(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold">Real Estate / Other ({currency})</label>
                  <input
                    type="number"
                    value={nwOther}
                    onChange={(e) => setNwOther(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold">Total Loans ({currency})</label>
                  <input
                    type="number"
                    value={nwLoans}
                    onChange={(e) => setNwLoans(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold">Credit Card Balances ({currency})</label>
                  <input
                    type="number"
                    value={nwCards}
                    onChange={(e) => setNwCards(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                <div className="text-xs font-semibold">Computed Net Worth:</div>
                <div className="text-3xl font-extrabold mt-1">{formatCurrency(res.netWorth, currency)}</div>
                <div className="text-xs mt-1">Debt-to-Asset Ratio: <b>{res.debtToAssetRatio}%</b></div>
              </div>
            </div>
          );
        })()}

        {/* 10. INVESTMENT CAGR */}
        {activeCalc === 'investmentReturn' && (() => {
          const res = FinancialCalculators.investmentReturn(parseFloat(cagrInit) || 1, parseFloat(cagrFinal) || 0, parseFloat(cagrYears) || 1);
          return (
            <div className="max-w-md space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Compound Annual Growth Rate (CAGR)</h2>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Initial Value ({currency})</label>
                  <input
                    type="number"
                    value={cagrInit}
                    onChange={(e) => setCagrInit(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Final Value ({currency})</label>
                  <input
                    type="number"
                    value={cagrFinal}
                    onChange={(e) => setCagrFinal(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Years</label>
                  <input
                    type="number"
                    value={cagrYears}
                    onChange={(e) => setCagrYears(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                <div className="text-xs font-semibold">Annualized Compound Return (CAGR):</div>
                <div className="text-3xl font-extrabold mt-1">{res.cagrPct}% / year</div>
                <div className="text-xs mt-1">Total Gain: {formatCurrency(res.totalGain, currency)} ({res.absoluteReturnPct}%)</div>
              </div>
            </div>
          );
        })()}

        {/* 11. PERCENTAGE CALCULATOR */}
        {activeCalc === 'percentage' && (() => {
          const res = FinancialCalculators.percentage(parseFloat(pctVal) || 0, parseFloat(pctTotal) || 1, pctMode);
          return (
            <div className="max-w-md space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Percentage & Discount Calculator</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setPctMode('what_percent_is')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${pctMode === 'what_percent_is' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                >
                  X is what % of Y
                </button>
                <button
                  onClick={() => setPctMode('percent_of')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${pctMode === 'percent_of' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                >
                  X% of Y
                </button>
                <button
                  onClick={() => setPctMode('percent_change')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${pctMode === 'percent_change' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                >
                  % Change
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Value X</label>
                  <input
                    type="number"
                    value={pctVal}
                    onChange={(e) => setPctVal(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Value Y</label>
                  <input
                    type="number"
                    value={pctTotal}
                    onChange={(e) => setPctTotal(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 text-xs">
                <div className="font-semibold text-slate-500">Result:</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{res.result}</div>
                <div className="text-slate-600 dark:text-slate-400 mt-1">{res.explanation}</div>
              </div>
            </div>
          );
        })()}

        {/* 12. INFLATION CALCULATOR */}
        {activeCalc === 'inflation' && (() => {
          const res = FinancialCalculators.inflation(parseFloat(infAmt) || 0, parseFloat(infRate) || 0, parseFloat(infYears) || 0);
          return (
            <div className="max-w-md space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Inflation & Future Purchasing Power</h2>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Amount Today ({currency})</label>
                  <input
                    type="number"
                    value={infAmt}
                    onChange={(e) => setInfAmt(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Inflation Rate (%)</label>
                  <input
                    type="number"
                    value={infRate}
                    onChange={(e) => setInfRate(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Years</label>
                  <input
                    type="number"
                    value={infYears}
                    onChange={(e) => setInfYears(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 dark:border-rose-900/40 dark:bg-rose-950/30">
                  <div className="text-xs text-rose-800 dark:text-rose-300 font-semibold">Future Equivalent Cost</div>
                  <div className="text-xl font-bold text-rose-900 dark:text-rose-100 mt-1">{formatCurrency(res.futureCost, currency)}</div>
                  <div className="text-[10px] text-rose-700/80 mt-1">What you will need to buy the same item</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/60">
                  <div className="text-xs text-slate-500 font-semibold">Future Purchasing Power</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(res.futurePurchasingPower, currency)}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Erosion: -{res.lossInPurchasingPowerPct}%</div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 13. SAVINGS GOAL CALCULATOR */}
        {activeCalc === 'savingsGoal' && (() => {
          const res = FinancialCalculators.savingsGoal(
            parseFloat(goalTarget) || 0,
            parseFloat(goalCurrent) || 0,
            parseFloat(goalMonths) || 1,
            parseFloat(goalRate) || 0
          );
          return (
            <div className="max-w-lg space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Savings Goal Sinking Fund Calculator</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500">Target ({currency})</label>
                  <input
                    type="number"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500">Already Saved</label>
                  <input
                    type="number"
                    value={goalCurrent}
                    onChange={(e) => setGoalCurrent(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500">Months Left</label>
                  <input
                    type="number"
                    value={goalMonths}
                    onChange={(e) => setGoalMonths(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500">Interest %</label>
                  <input
                    type="number"
                    value={goalRate}
                    onChange={(e) => setGoalRate(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                <div className="text-xs font-semibold">Save This Amount Every Month:</div>
                <div className="text-3xl font-extrabold mt-1">{formatCurrency(res.requiredMonthlySaving, currency)} / month</div>
                <div className="text-xs mt-1">Or approx. <b>{formatCurrency(res.requiredDailySaving, currency)} / day</b></div>
              </div>
            </div>
          );
        })()}

        {/* 14. SIP CALCULATOR */}
        {activeCalc === 'sip' && (() => {
          const res = FinancialCalculators.sipCalculator(
            parseFloat(sipMonthly) || 0,
            parseFloat(sipRate) || 0,
            parseFloat(sipYears) || 1
          );
          return (
            <div className="max-w-lg space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Mutual Fund SIP (Systematic Investment Plan)</h2>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Monthly SIP ({currency})</label>
                  <input
                    type="number"
                    value={sipMonthly}
                    onChange={(e) => setSipMonthly(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Expected Return (% p.a.)</label>
                  <input
                    type="number"
                    value={sipRate}
                    onChange={(e) => setSipRate(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Time Period (Years)</label>
                  <input
                    type="number"
                    value={sipYears}
                    onChange={(e) => setSipYears(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <div>
                  <div className="text-xs text-slate-500">Invested Amount</div>
                  <div className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1">{formatCurrency(res.totalInvested, currency)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Est. Wealth Gain</div>
                  <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(res.estimatedReturns, currency)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Total Maturity</div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{formatCurrency(res.totalMaturityValue, currency)}</div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
