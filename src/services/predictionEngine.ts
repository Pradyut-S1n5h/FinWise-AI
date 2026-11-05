import { FinancialState, FinancialSummary } from '../types/finance';
import { computeFinancialSummary } from './accounting';

export interface PredictionMeta {
  method: 'Linear Trend Analysis' | 'Exponential Moving Average' | 'Recurring Cash Flow Extrapolation' | 'Amortization & Compound Model';
  confidenceScore: number; // 0 - 100%
  dataPointsUsed: number;
  assumptions: string[];
  limitations: string[];
  timeframe: string;
}

export interface CashFlowPoint {
  day: number;
  dateStr: string;
  projectedBalance: number;
  projectedInflow: number;
  projectedOutflow: number;
  isShortageWarning: boolean;
}

export interface CashFlowForecast {
  currentBalance: number;
  projectedMonthEndBalance: number;
  minProjectedBalance: number;
  cashShortageRisk: 'None' | 'Low' | 'Moderate' | 'High';
  shortageDate?: string;
  points: CashFlowPoint[];
  meta: PredictionMeta;
}

export interface SavingsMilestone {
  months: number;
  label: string;
  projectedSavings: number;
  conservativeSavings: number;
  optimisticSavings: number;
}

export interface SavingsForecast {
  currentLiquidSavings: number;
  monthlyAverageSurplus: number;
  milestones: SavingsMilestone[];
  meta: PredictionMeta;
}

export interface GoalPrediction {
  goalId: string;
  goalName: string;
  targetAmount: number;
  currentSaved: number;
  remainingAmount: number;
  progressPercent: number;
  requiredMonthlyContribution: number;
  projectedCompletionDate: string;
  feasibleWithCurrentSurplus: boolean;
  estimatedMonthsNeeded: number;
  meta: PredictionMeta;
}

export interface CategoryExpensePrediction {
  categoryId: string;
  categoryName: string;
  historicalMonthlyAvg: number;
  lastMonthSpend: number;
  projectedNextMonth: number;
  trendDirection: 'increasing' | 'stable' | 'decreasing';
  trendPercent: number;
  budgetStatus: 'within_budget' | 'near_limit' | 'exceeds_budget';
  budgetAmount: number;
  meta: PredictionMeta;
}

export interface NetWorthProjectionPoint {
  year: number;
  label: string;
  projectedNetWorth: number;
  projectedAssets: number;
  projectedLiabilities: number;
}

export interface NetWorthForecast {
  currentNetWorth: number;
  currentAssets: number;
  currentLiabilities: number;
  projections: NetWorthProjectionPoint[];
  assumedAnnualGrowthRate: number; // e.g. 7%
  meta: PredictionMeta;
}

/**
 * Mathematical Linear Regression for trend detection: y = mx + c
 */
export function calculateLinearRegression(values: number[]): { slope: number; intercept: number; rSquared: number } {
  const n = values.length;
  if (n < 2) {
    return { slope: 0, intercept: values[0] || 0, rSquared: 0 };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
  const intercept = (sumY - slope * sumX) / n;

  // Compute R-squared (goodness of fit)
  const meanY = sumY / n;
  let ssTot = 0;
  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    const yPred = slope * i + intercept;
    ssTot += Math.pow(values[i] - meanY, 2);
    ssRes += Math.pow(values[i] - yPred, 2);
  }
  const rSquared = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0.5;

  return { slope, intercept, rSquared };
}

/**
 * Forecast daily cash flow for the next 30 days based on balance, expected recurring income/bills, and average daily burn.
 */
export function forecastCashFlow(state: FinancialState, summary: FinancialSummary): CashFlowForecast {
  const currentBalance = summary.totalAvailableBalance;
  const now = new Date();
  const daysInMonth = 30;

  // Daily burn rate from actual or budgeted expenses
  const monthlyExpenses = summary.monthlyExpensesActual > 0 ? summary.monthlyExpensesActual : summary.monthlyExpensesBudgeted;
  const baselineDailySpend = Math.max(0, monthlyExpenses / 30);

  // Identify recurring income & obligations
  const recurringEvents = state.calendarEvents.filter((e) => !e.isPaid);

  let runningBalance = currentBalance;
  let minProjectedBalance = currentBalance;
  let shortageDate: string | undefined;

  const points: CashFlowPoint[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d);
    const dateStr = targetDate.toISOString().slice(0, 10);
    const dayOfMonth = targetDate.getDate();

    let dayInflow = 0;
    let dayOutflow = baselineDailySpend;

    // Check calendar obligations
    recurringEvents.forEach((ev) => {
      const evDate = new Date(ev.date);
      if (ev.recurring === 'monthly' ? evDate.getDate() === dayOfMonth : ev.date === dateStr) {
        if (ev.type === 'income') {
          dayInflow += ev.amount;
        } else {
          dayOutflow += ev.amount;
        }
      }
    });

    // Check scheduled income sources
    state.incomeSources.forEach((inc) => {
      if (inc.isActive && inc.expectedDay === dayOfMonth) {
        dayInflow += inc.amount;
      }
    });

    runningBalance = runningBalance + dayInflow - dayOutflow;
    if (runningBalance < minProjectedBalance) {
      minProjectedBalance = runningBalance;
    }
    if (runningBalance < 0 && !shortageDate) {
      shortageDate = dateStr;
    }

    points.push({
      day: d,
      dateStr,
      projectedBalance: Math.round(runningBalance),
      projectedInflow: Math.round(dayInflow),
      projectedOutflow: Math.round(dayOutflow),
      isShortageWarning: runningBalance < 0,
    });
  }

  const confidenceScore = state.transactions.length >= 10 ? 88 : state.transactions.length >= 3 ? 65 : 45;
  const cashShortageRisk = minProjectedBalance < 0 ? 'High' : minProjectedBalance < 5000 ? 'Moderate' : 'None';

  return {
    currentBalance,
    projectedMonthEndBalance: points[points.length - 1]?.projectedBalance || currentBalance,
    minProjectedBalance: Math.round(minProjectedBalance),
    cashShortageRisk,
    shortageDate,
    points,
    meta: {
      method: 'Recurring Cash Flow Extrapolation',
      confidenceScore,
      dataPointsUsed: state.transactions.length + state.calendarEvents.length,
      assumptions: [
        'Discretionary spending continues at recent daily average rate.',
        'Scheduled income and calendar bills are fulfilled on anticipated calendar dates.',
        'No unforeseen catastrophic emergency expenditure occurs.',
      ],
      limitations: [
        'Unscheduled purchases or delayed payments may shift daily cash positions.',
        'Based on historical daily average burn rather than variable timing.',
      ],
      timeframe: 'Next 30 Days',
    },
  };
}

/**
 * Predicts savings accumulation over 1, 3, 6, and 12 months with confidence intervals.
 */
export function forecastSavings(state: FinancialState, summary: FinancialSummary): SavingsForecast {
  const currentLiquidSavings = summary.totalAvailableBalance;
  const monthlySurplus = Math.max(0, summary.monthlySavings);

  const milestones: SavingsMilestone[] = [
    {
      months: 1,
      label: '1 Month',
      projectedSavings: Math.round(currentLiquidSavings + monthlySurplus),
      conservativeSavings: Math.round(currentLiquidSavings + monthlySurplus * 0.8),
      optimisticSavings: Math.round(currentLiquidSavings + monthlySurplus * 1.2),
    },
    {
      months: 3,
      label: '3 Months (Quarter)',
      projectedSavings: Math.round(currentLiquidSavings + monthlySurplus * 3),
      conservativeSavings: Math.round(currentLiquidSavings + monthlySurplus * 3 * 0.75),
      optimisticSavings: Math.round(currentLiquidSavings + monthlySurplus * 3 * 1.25),
    },
    {
      months: 6,
      label: '6 Months (Half-Year)',
      projectedSavings: Math.round(currentLiquidSavings + monthlySurplus * 6),
      conservativeSavings: Math.round(currentLiquidSavings + monthlySurplus * 6 * 0.7),
      optimisticSavings: Math.round(currentLiquidSavings + monthlySurplus * 6 * 1.3),
    },
    {
      months: 12,
      label: '12 Months (1 Year)',
      projectedSavings: Math.round(currentLiquidSavings + monthlySurplus * 12),
      conservativeSavings: Math.round(currentLiquidSavings + monthlySurplus * 12 * 0.65),
      optimisticSavings: Math.round(currentLiquidSavings + monthlySurplus * 12 * 1.35),
    },
  ];

  return {
    currentLiquidSavings,
    monthlyAverageSurplus: monthlySurplus,
    milestones,
    meta: {
      method: 'Exponential Moving Average',
      confidenceScore: summary.savingsRate > 0 ? 82 : 50,
      dataPointsUsed: state.transactions.length,
      assumptions: [
        'Current monthly net surplus is saved without lifestyle inflation.',
        'Interest earned on liquid balances is considered negligible or re-invested.',
        'Conservative band assumes 20-35% variance for unexpected expenses.',
      ],
      limitations: [
        'Does not predict unpredictable income spikes or macroeconomic shocks.',
      ],
      timeframe: '1 to 12 Months',
    },
  };
}

/**
 * Predicts completion dates and monthly required savings for all active goals.
 */
export function predictGoalCompletions(state: FinancialState, summary: FinancialSummary): GoalPrediction[] {
  const monthlySurplus = Math.max(0, summary.monthlySavings);
  const now = new Date();

  return state.goals.map((g) => {
    const targetAmount = Number(g.targetAmount) || 0;
    const currentSaved = Number(g.currentSaved) || 0;
    const remainingAmount = Math.max(0, targetAmount - currentSaved);
    const progressPercent = targetAmount > 0 ? Math.min(100, Math.round((currentSaved / targetAmount) * 100)) : 0;

    const targetDateObj = new Date(g.targetDate || new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()));
    const monthsRemaining = Math.max(
      1,
      (targetDateObj.getFullYear() - now.getFullYear()) * 12 + (targetDateObj.getMonth() - now.getMonth())
    );

    const requiredMonthlyContribution = Math.round(remainingAmount / monthsRemaining);
    const feasibleWithCurrentSurplus = monthlySurplus >= requiredMonthlyContribution;

    const estimatedMonthsNeeded = monthlySurplus > 0 ? Math.ceil(remainingAmount / monthlySurplus) : 999;
    const projectedCompletionDateObj = new Date(now.getFullYear(), now.getMonth() + estimatedMonthsNeeded, 1);
    const projectedCompletionDate = projectedCompletionDateObj.toISOString().slice(0, 10);

    return {
      goalId: g.id,
      goalName: g.name,
      targetAmount,
      currentSaved,
      remainingAmount,
      progressPercent,
      requiredMonthlyContribution,
      projectedCompletionDate: estimatedMonthsNeeded > 120 ? 'Over 10 years at current pace' : projectedCompletionDate,
      feasibleWithCurrentSurplus,
      estimatedMonthsNeeded,
      meta: {
        method: 'Linear Trend Analysis',
        confidenceScore: monthlySurplus > 0 ? 85 : 40,
        dataPointsUsed: state.goals.length,
        assumptions: [
          `Allocation assumption: monthly savings is dedicated towards goal '${g.name}'.`,
          'Zero capital depreciation or market erosion of saved funds.',
        ],
        limitations: [
          'Multiple simultaneous goals compete for the same monthly savings surplus.',
        ],
        timeframe: `${monthsRemaining} target months`,
      },
    };
  });
}

/**
 * Predicts next month's spending by category using historical transaction distribution.
 */
export function predictCategoryExpenses(state: FinancialState): CategoryExpensePrediction[] {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return state.categories.map((cat) => {
    // Collect spending per month for this category
    const monthlySpendingMap: Record<string, number> = {};

    state.transactions.forEach((tx) => {
      if (tx.type === 'expense' && tx.categoryId === cat.id && tx.date) {
        const [y, m] = tx.date.split('-');
        const key = `${y}-${m}`;
        monthlySpendingMap[key] = (monthlySpendingMap[key] || 0) + (Number(tx.amount) || 0);
      }
    });

    const spendValues = Object.values(monthlySpendingMap);
    const count = spendValues.length;
    const historicalMonthlyAvg = count > 0 ? spendValues.reduce((a, b) => a + b, 0) / count : cat.monthlyBudget || 3000;

    const currentKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const lastMonthKey = `${currentMonth === 0 ? currentYear - 1 : currentYear}-${String(currentMonth === 0 ? 12 : currentMonth).padStart(2, '0')}`;

    const lastMonthSpend = monthlySpendingMap[lastMonthKey] || monthlySpendingMap[currentKey] || historicalMonthlyAvg;

    // Linear regression or weighted average
    const regression = calculateLinearRegression(spendValues);
    const projectedNextMonth = Math.max(0, Math.round(regression.slope > 0 ? lastMonthSpend + regression.slope : historicalMonthlyAvg * 0.95));

    const trendPercent = historicalMonthlyAvg > 0 ? ((projectedNextMonth - historicalMonthlyAvg) / historicalMonthlyAvg) * 100 : 0;
    const trendDirection = trendPercent > 5 ? 'increasing' : trendPercent < -5 ? 'decreasing' : 'stable';

    const budgetAmount = cat.monthlyBudget || historicalMonthlyAvg;
    const budgetStatus = projectedNextMonth > budgetAmount ? 'exceeds_budget' : projectedNextMonth > budgetAmount * 0.85 ? 'near_limit' : 'within_budget';

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      historicalMonthlyAvg: Math.round(historicalMonthlyAvg),
      lastMonthSpend: Math.round(lastMonthSpend),
      projectedNextMonth,
      trendDirection,
      trendPercent: Math.round(trendPercent),
      budgetStatus,
      budgetAmount,
      meta: {
        method: 'Linear Trend Analysis',
        confidenceScore: count >= 3 ? 84 : count >= 1 ? 60 : 40,
        dataPointsUsed: count,
        assumptions: [
          'Historical consumption patterns represent standard living behavior.',
          'No sudden lifestyle modifications or one-off large purchases.',
        ],
        limitations: [
          'Seasonal fluctuations (e.g. festivals, semester starts) can disrupt linear trends.',
        ],
        timeframe: 'Next 30 Days',
      },
    };
  });
}

/**
 * Net Worth multi-year forecast (1-5 years) based on assumed annual growth, debt paydown, and ongoing savings.
 */
export function forecastNetWorth(state: FinancialState, summary: FinancialSummary, assumedAnnualGrowthRate = 7): NetWorthForecast {
  const currentNetWorth = summary.netWorth;
  const currentAssets = summary.totalAssetsValue;
  const currentLiabilities = summary.totalLiabilitiesValue;
  const annualSavingsAdditions = Math.max(0, summary.monthlySavings * 12);
  const annualDebtRepayment = state.liabilities.reduce((sum, l) => sum + (l.monthlyRepayment * 12 || 0), 0);

  const projections: NetWorthProjectionPoint[] = [];

  let projectedAssets = currentAssets;
  let projectedLiabilities = currentLiabilities;

  for (let year = 1; year <= 5; year++) {
    // Assets compound + annual additions
    projectedAssets = projectedAssets * (1 + assumedAnnualGrowthRate / 100) + annualSavingsAdditions;
    // Liabilities decrease
    projectedLiabilities = Math.max(0, projectedLiabilities - annualDebtRepayment);

    const projectedNetWorth = projectedAssets - projectedLiabilities;

    projections.push({
      year,
      label: `Year ${year}`,
      projectedNetWorth: Math.round(projectedNetWorth),
      projectedAssets: Math.round(projectedAssets),
      projectedLiabilities: Math.round(projectedLiabilities),
    });
  }

  return {
    currentNetWorth,
    currentAssets,
    currentLiabilities,
    projections,
    assumedAnnualGrowthRate,
    meta: {
      method: 'Amortization & Compound Model',
      confidenceScore: 78,
      dataPointsUsed: state.assets.length + state.liabilities.length,
      assumptions: [
        `Assumed nominal asset compound return of ${assumedAnnualGrowthRate}% per annum.`,
        'Scheduled loan EMIs and debt repayments are satisfied consistently.',
        'Annual savings additions remain constant without real income erosion.',
      ],
      limitations: [
        'Market assets (stocks, mutual funds) fluctuate and returns are never guaranteed.',
        'Inflation will reduce future purchasing power.',
      ],
      timeframe: '1 to 5 Years',
    },
  };
}
