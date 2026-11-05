import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  Wallet,
  DollarSign,
  PieChart,
  Landmark,
  CreditCard,
  Target,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  CurrencyCode,
  FinancialState,
  SUPPORTED_CURRENCIES,
  IncomeSource,
  Liability,
  CreditCard as CreditCardType,
  Asset,
  FinancialGoal,
} from '../../types/finance';
import { generateId } from '../../utils/formatters';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  state: FinancialState;
  onSaveState: (updated: FinancialState) => void;
}

const STEPS = [
  { id: 'basics', title: 'Basic Info', icon: Wallet },
  { id: 'income', title: 'Income', icon: DollarSign },
  { id: 'expenses', title: 'Budgets', icon: PieChart },
  { id: 'liabilities', title: 'Loans', icon: Landmark },
  { id: 'credit', title: 'Credit', icon: CreditCard },
  { id: 'assets', title: 'Assets', icon: Sparkles },
  { id: 'goals', title: 'Goals', icon: Target },
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  state,
  onSaveState,
}) => {
  const [stepIndex, setStepIndex] = useState(0);

  // Section A: Basics
  const [displayName, setDisplayName] = useState(state.profile.displayName || '');
  const [currency, setCurrency] = useState<CurrencyCode>(state.profile.currency || 'INR');
  const [initialBalance, setInitialBalance] = useState(
    state.accounts[0]?.balance ? state.accounts[0].balance.toString() : '25000'
  );
  const [expectedMonthlyIncome, setExpectedMonthlyIncome] = useState(
    state.profile.monthlyIncomeExpected ? state.profile.monthlyIncomeExpected.toString() : '45000'
  );

  // Section B: Income sources
  const [incomeList, setIncomeList] = useState<IncomeSource[]>(
    state.incomeSources.length > 0
      ? state.incomeSources
      : [
          {
            id: generateId('inc'),
            name: 'Primary Stipend / Salary',
            amount: 40000,
            frequency: 'monthly',
            expectedDay: 1,
            isActive: true,
          },
        ]
  );

  // Section C: Category budgets
  const [categories, setCategories] = useState(state.categories);

  // Section D: Liabilities
  const [liabilitiesList, setLiabilitiesList] = useState<Liability[]>(state.liabilities);

  // Section E: Credit Cards
  const [creditList, setCreditList] = useState<CreditCardType[]>(state.creditCards);

  // Section F: Assets
  const [assetList, setAssetList] = useState<Asset[]>(state.assets);

  // Section G: Goals
  const [goalList, setGoalList] = useState<FinancialGoal[]>(
    state.goals.length > 0
      ? state.goals
      : [
          {
            id: generateId('goal'),
            name: '3-Month Emergency Safety Buffer',
            targetAmount: 50000,
            currentSaved: 15000,
            targetDate: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().slice(0, 10),
            priority: 'high',
            category: 'emergency_fund',
          },
        ]
  );

  if (!isOpen) return null;

  const currentStep = STEPS[stepIndex];
  const progressPct = Math.round(((stepIndex + 1) / STEPS.length) * 100);

  // Helper to persist current form state
  const handleSaveProgress = (completeOnboarding = false) => {
    const updatedAccounts = [...state.accounts];
    const initBalNum = parseFloat(initialBalance) || 0;
    if (updatedAccounts.length > 0) {
      updatedAccounts[0] = { ...updatedAccounts[0], balance: initBalNum };
    } else {
      updatedAccounts.push({
        id: 'acc_main',
        name: 'Primary Bank Account',
        type: 'bank',
        balance: initBalNum,
        isDefault: true,
      });
    }

    const updatedState: FinancialState = {
      ...state,
      profile: {
        ...state.profile,
        displayName: displayName.trim() || 'FinWise User',
        currency,
        monthlyIncomeExpected: parseFloat(expectedMonthlyIncome) || 45000,
        onboardingCompleted: completeOnboarding ? true : state.profile.onboardingCompleted,
      },
      accounts: updatedAccounts,
      incomeSources: incomeList,
      categories,
      liabilities: liabilitiesList,
      creditCards: creditList,
      assets: assetList,
      goals: goalList,
    };

    onSaveState(updatedState);
  };

  const handleNext = () => {
    handleSaveProgress(false);
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const handleComplete = () => {
    handleSaveProgress(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative my-8 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Top Progress Bar */}
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Wizard Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <currentStep.icon className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Step {stepIndex + 1} of {STEPS.length}
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {currentStep.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            Close & Save
          </button>
        </div>

        {/* Wizard Step Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-5">
          {/* STEP 1: BASICS */}
          {stepIndex === 0 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Welcome to FinWise AI. Configure your primary currency and starting liquid balances. Everything is stored locally under your manual control.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Name or Moniker
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Currency *
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Starting Available Balance ({currency})
                  </label>
                  <input
                    type="number"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    placeholder="e.g. 25000"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Expected Monthly Income / Allowance ({currency})
                </label>
                <input
                  type="number"
                  value={expectedMonthlyIncome}
                  onChange={(e) => setExpectedMonthlyIncome(e.target.value)}
                  placeholder="e.g. 45000"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* STEP 2: INCOME SOURCES */}
          {stepIndex === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Add income streams (allowance, stipend, freelance, part-time wages, gifts).
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setIncomeList([
                      ...incomeList,
                      {
                        id: generateId('inc'),
                        name: 'New Income Source',
                        amount: 5000,
                        frequency: 'monthly',
                        expectedDay: 5,
                        isActive: true,
                      },
                    ])
                  }
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Source
                </button>
              </div>

              <div className="space-y-2.5">
                {incomeList.map((inc, idx) => (
                  <div
                    key={inc.id}
                    className="flex flex-col sm:flex-row items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60"
                  >
                    <input
                      type="text"
                      placeholder="Source Name"
                      value={inc.name}
                      onChange={(e) => {
                        const copy = [...incomeList];
                        copy[idx].name = e.target.value;
                        setIncomeList(copy);
                      }}
                      className="w-full sm:w-1/2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <div className="flex w-full sm:w-1/2 items-center gap-2">
                      <input
                        type="number"
                        placeholder="Amount"
                        value={inc.amount}
                        onChange={(e) => {
                          const copy = [...incomeList];
                          copy[idx].amount = parseFloat(e.target.value) || 0;
                          setIncomeList(copy);
                        }}
                        className="w-28 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                      <select
                        value={inc.frequency}
                        onChange={(e) => {
                          const copy = [...incomeList];
                          copy[idx].frequency = e.target.value as any;
                          setIncomeList(copy);
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="weekly">Weekly</option>
                        <option value="one-time">One-time</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setIncomeList(incomeList.filter((_, i) => i !== idx))}
                        className="p-1 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: EXPENSE BUDGETS */}
          {stepIndex === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review and set monthly budget limits for standard expense categories. You can modify these anytime.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {categories.map((cat, idx) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-800"
                  >
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      {cat.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400">{currency}</span>
                      <input
                        type="number"
                        value={cat.monthlyBudget}
                        onChange={(e) => {
                          const copy = [...categories];
                          copy[idx].monthlyBudget = parseFloat(e.target.value) || 0;
                          setCategories(copy);
                        }}
                        className="w-20 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-right text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: LOANS & LIABILITIES */}
          {stepIndex === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Optional: Record existing student loans, laptop EMIs, or personal borrowings to accurately compute Net Worth.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setLiabilitiesList([
                      ...liabilitiesList,
                      {
                        id: generateId('liab'),
                        name: 'Student Device EMI',
                        type: 'personal_loan',
                        originalAmount: 30000,
                        outstandingBalance: 15000,
                        interestRate: 0,
                        monthlyRepayment: 2500,
                        frequency: 'monthly',
                        startDate: new Date().toISOString().slice(0, 10),
                      },
                    ])
                  }
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Loan
                </button>
              </div>

              {liabilitiesList.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No liabilities added. If you are debt-free, congratulations! Click Next.
                </div>
              ) : (
                <div className="space-y-3">
                  {liabilitiesList.map((l, idx) => (
                    <div
                      key={l.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/60 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          placeholder="Loan Name"
                          value={l.name}
                          onChange={(e) => {
                            const copy = [...liabilitiesList];
                            copy[idx].name = e.target.value;
                            setLiabilitiesList(copy);
                          }}
                          className="w-2/3 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-900 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setLiabilitiesList(liabilitiesList.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400">Outstanding</label>
                          <input
                            type="number"
                            value={l.outstandingBalance}
                            onChange={(e) => {
                              const copy = [...liabilitiesList];
                              copy[idx].outstandingBalance = parseFloat(e.target.value) || 0;
                              setLiabilitiesList(copy);
                            }}
                            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400">Monthly EMI</label>
                          <input
                            type="number"
                            value={l.monthlyRepayment}
                            onChange={(e) => {
                              const copy = [...liabilitiesList];
                              copy[idx].monthlyRepayment = parseFloat(e.target.value) || 0;
                              setLiabilitiesList(copy);
                            }}
                            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400">Interest %</label>
                          <input
                            type="number"
                            value={l.interestRate}
                            onChange={(e) => {
                              const copy = [...liabilitiesList];
                              copy[idx].interestRate = parseFloat(e.target.value) || 0;
                              setLiabilitiesList(copy);
                            }}
                            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 5: CREDIT CARDS */}
          {stepIndex === 4 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200 flex items-start gap-2.5">
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <span className="font-bold">Strict Privacy Guarantee:</span> Never enter card numbers, expiry dates, CVVs, or PINs. Only track a friendly nickname and your balance.
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Track credit limits and statement balances to prevent revolving debt traps.
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCreditList([
                      ...creditList,
                      {
                        id: generateId('cc'),
                        name: 'Student Rewards Card',
                        creditLimit: 25000,
                        outstandingBalance: 2800,
                        minimumPayment: 500,
                        paymentDueDate: 15,
                        interestRate: 36,
                      },
                    ])
                  }
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Card Record
                </button>
              </div>

              {creditList.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No credit cards entered. Skip if you do not use credit lines.
                </div>
              ) : (
                <div className="space-y-3">
                  {creditList.map((cc, idx) => (
                    <div
                      key={cc.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/60 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          placeholder="Card Nickname (e.g. ICICI Platinum)"
                          value={cc.name}
                          onChange={(e) => {
                            const copy = [...creditList];
                            copy[idx].name = e.target.value;
                            setCreditList(copy);
                          }}
                          className="w-2/3 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-900 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setCreditList(creditList.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400">Credit Limit</label>
                          <input
                            type="number"
                            value={cc.creditLimit}
                            onChange={(e) => {
                              const copy = [...creditList];
                              copy[idx].creditLimit = parseFloat(e.target.value) || 0;
                              setCreditList(copy);
                            }}
                            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400">Current Balance</label>
                          <input
                            type="number"
                            value={cc.outstandingBalance}
                            onChange={(e) => {
                              const copy = [...creditList];
                              copy[idx].outstandingBalance = parseFloat(e.target.value) || 0;
                              setCreditList(copy);
                            }}
                            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400">Due Day (1-31)</label>
                          <input
                            type="number"
                            min="1"
                            max="31"
                            value={cc.paymentDueDate}
                            onChange={(e) => {
                              const copy = [...creditList];
                              copy[idx].paymentDueDate = parseInt(e.target.value) || 1;
                              setCreditList(copy);
                            }}
                            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 6: ASSETS & INVESTMENTS */}
          {stepIndex === 5 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manually record your investments (Mutual funds, Fixed Deposits, Stocks, Gold). FinWise AI never connects to external brokerages without permission.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setAssetList([
                      ...assetList,
                      {
                        id: generateId('asset'),
                        name: 'Nifty Index Fund',
                        type: 'mutual_fund',
                        purchasePrice: 20000,
                        purchaseDate: new Date().toISOString().slice(0, 10),
                        manualValuation: 22000,
                        lastValuationDate: new Date().toISOString().slice(0, 10),
                      },
                    ])
                  }
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Asset
                </button>
              </div>

              {assetList.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No assets entered yet. You can add them later under Net Worth & Assets.
                </div>
              ) : (
                <div className="space-y-3">
                  {assetList.map((asset, idx) => (
                    <div
                      key={asset.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/60 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          placeholder="Asset Name (e.g. FD with SBI, Index SIP)"
                          value={asset.name}
                          onChange={(e) => {
                            const copy = [...assetList];
                            copy[idx].name = e.target.value;
                            setAssetList(copy);
                          }}
                          className="w-2/3 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-900 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setAssetList(assetList.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400">Type</label>
                          <select
                            value={asset.type}
                            onChange={(e) => {
                              const copy = [...assetList];
                              copy[idx].type = e.target.value as any;
                              setAssetList(copy);
                            }}
                            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          >
                            <option value="mutual_fund">Mutual Fund</option>
                            <option value="fixed_deposit">Fixed Deposit</option>
                            <option value="stock">Stock</option>
                            <option value="gold">Gold</option>
                            <option value="other">Other Asset</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400">Cost Price</label>
                          <input
                            type="number"
                            value={asset.purchasePrice}
                            onChange={(e) => {
                              const copy = [...assetList];
                              copy[idx].purchasePrice = parseFloat(e.target.value) || 0;
                              setAssetList(copy);
                            }}
                            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400">Current Value</label>
                          <input
                            type="number"
                            value={asset.manualValuation}
                            onChange={(e) => {
                              const copy = [...assetList];
                              copy[idx].manualValuation = parseFloat(e.target.value) || 0;
                              setAssetList(copy);
                            }}
                            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 7: FINANCIAL GOALS */}
          {stepIndex === 6 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Set meaningful targets (emergency funds, exams, laptop, travel).
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setGoalList([
                      ...goalList,
                      {
                        id: generateId('goal'),
                        name: 'Emergency Fund',
                        targetAmount: 50000,
                        currentSaved: 10000,
                        targetDate: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().slice(0, 10),
                        priority: 'high',
                        category: 'emergency_fund',
                      },
                    ])
                  }
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Goal
                </button>
              </div>

              <div className="space-y-3">
                {goalList.map((g, idx) => (
                  <div
                    key={g.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/60 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        placeholder="Goal Name"
                        value={g.name}
                        onChange={(e) => {
                          const copy = [...goalList];
                          copy[idx].name = e.target.value;
                          setGoalList(copy);
                        }}
                        className="w-2/3 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-900 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setGoalList(goalList.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400">Target Amount</label>
                        <input
                          type="number"
                          value={g.targetAmount}
                          onChange={(e) => {
                            const copy = [...goalList];
                            copy[idx].targetAmount = parseFloat(e.target.value) || 0;
                            setGoalList(copy);
                          }}
                          className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400">Current Saved</label>
                        <input
                          type="number"
                          value={g.currentSaved}
                          onChange={(e) => {
                            const copy = [...goalList];
                            copy[idx].currentSaved = parseFloat(e.target.value) || 0;
                            setGoalList(copy);
                          }}
                          className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400">Target Date</label>
                        <input
                          type="date"
                          value={g.targetDate}
                          onChange={(e) => {
                            const copy = [...goalList];
                            copy[idx].targetDate = e.target.value;
                            setGoalList(copy);
                          }}
                          className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={handleBack}
            disabled={stepIndex === 0}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSkip}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Skip Section
            </button>

            {stepIndex < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500"
              >
                Continue <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500"
              >
                <CheckCircle2 className="h-4 w-4" /> Complete Setup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
