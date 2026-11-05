import { FinancialState, FinancialSummary } from '../types/finance';
import { computeFinancialSummary } from './accounting';

export interface WhatIfScenarioInputs {
  monthlySavingsDelta: number; // e.g. +₹500 / month
  expensePercentChange: number; // e.g. +10% or -15%
  incomePercentChange: number; // e.g. -5% or +20%
  extraLoanPaymentMonthly: number; // e.g. +₹2000 towards debt
  investmentReturnRate: number; // e.g. 10% vs default 6%
  oneTimePostponedPurchase: number; // e.g. ₹25000 purchase delayed
}

export interface ScenarioProjectionPoint {
  month: number;
  label: string;
  baselineSavings: number;
  simulatedSavings: number;
  baselineNetWorth: number;
  simulatedNetWorth: number;
}

export interface WhatIfSimulationResult {
  baselineSummary: FinancialSummary;
  simulatedSummary: {
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlySavings: number;
    monthlyDebtPayment: number;
    effectiveNetCashflow: number;
    oneYearNetWorthImpact: number;
    threeYearNetWorthImpact: number;
    debtFreeMonthsSooner: number;
  };
  difference: {
    monthlySavingsDiff: number;
    monthlyExpenseDiff: number;
    monthlyIncomeDiff: number;
    oneYearNetDifference: number;
    threeYearNetDifference: number;
  };
  timeline: ScenarioProjectionPoint[];
}

export function runWhatIfSimulation(
  state: FinancialState,
  inputs: WhatIfScenarioInputs
): WhatIfSimulationResult {
  const baseline = computeFinancialSummary(state);

  const baseIncome = baseline.monthlyIncomeActual > 0 ? baseline.monthlyIncomeActual : baseline.monthlyIncomeExpected;
  const baseExpenses = baseline.monthlyExpensesActual > 0 ? baseline.monthlyExpensesActual : baseline.monthlyExpensesBudgeted;
  const baseSavings = Math.max(0, baseIncome - baseExpenses);

  // Apply simulated modifications
  const simIncome = Math.max(0, baseIncome * (1 + inputs.incomePercentChange / 100));
  const simExpenses = Math.max(0, baseExpenses * (1 + inputs.expensePercentChange / 100));

  // Extra debt payments
  const totalBaseMonthlyDebt = state.liabilities.reduce((sum, l) => sum + (l.monthlyRepayment || 0), 0);
  const simMonthlyDebt = totalBaseMonthlyDebt + inputs.extraLoanPaymentMonthly;

  // Monthly savings with delta
  const rawSimSavings = Math.max(0, simIncome - simExpenses - inputs.extraLoanPaymentMonthly);
  const simSavings = Math.max(0, rawSimSavings + inputs.monthlySavingsDelta);

  const effectiveNetCashflow = simIncome - simExpenses - simMonthlyDebt;

  // Debt payoff calculation
  const totalOutstandingDebt = state.liabilities.reduce((sum, l) => sum + (l.outstandingBalance || 0), 0);
  let baseMonthsToDebtFree = totalBaseMonthlyDebt > 0 ? Math.ceil(totalOutstandingDebt / totalBaseMonthlyDebt) : 0;
  let simMonthsToDebtFree = simMonthlyDebt > 0 ? Math.ceil(totalOutstandingDebt / simMonthlyDebt) : 0;
  const debtFreeMonthsSooner = Math.max(0, baseMonthsToDebtFree - simMonthsToDebtFree);

  // Multi-month timeline projection (1 to 36 months)
  const timeline: ScenarioProjectionPoint[] = [];
  let baseRunningCash = baseline.totalAvailableBalance;
  let simRunningCash = baseline.totalAvailableBalance + inputs.oneTimePostponedPurchase;

  let baseRunningAssets = baseline.totalAssetsValue;
  let simRunningAssets = baseline.totalAssetsValue + inputs.oneTimePostponedPurchase;

  let baseRunningDebt = baseline.totalLiabilitiesValue;
  let simRunningDebt = baseline.totalLiabilitiesValue;

  const annualBaseRate = 0.06;
  const annualSimRate = inputs.investmentReturnRate / 100;

  for (let m = 1; m <= 36; m++) {
    // Baseline progression
    baseRunningCash += baseSavings;
    baseRunningAssets = baseRunningAssets * (1 + annualBaseRate / 12) + baseSavings;
    baseRunningDebt = Math.max(0, baseRunningDebt - totalBaseMonthlyDebt);
    const baseNW = baseRunningAssets - baseRunningDebt;

    // Simulated progression
    simRunningCash += simSavings;
    simRunningAssets = simRunningAssets * (1 + annualSimRate / 12) + simSavings;
    simRunningDebt = Math.max(0, simRunningDebt - simMonthlyDebt);
    const simNW = simRunningAssets - simRunningDebt;

    if (m === 1 || m === 3 || m === 6 || m === 12 || m === 24 || m === 36) {
      timeline.push({
        month: m,
        label: m === 12 ? '1 Year' : m === 24 ? '2 Years' : m === 36 ? '3 Years' : `${m} Months`,
        baselineSavings: Math.round(baseRunningCash),
        simulatedSavings: Math.round(simRunningCash),
        baselineNetWorth: Math.round(baseNW),
        simulatedNetWorth: Math.round(simNW),
      });
    }
  }

  const oneYearPoint = timeline.find((p) => p.month === 12) || timeline[0];
  const threeYearPoint = timeline.find((p) => p.month === 36) || timeline[timeline.length - 1];

  const oneYearNetDifference = (oneYearPoint?.simulatedNetWorth || 0) - (oneYearPoint?.baselineNetWorth || 0);
  const threeYearNetDifference = (threeYearPoint?.simulatedNetWorth || 0) - (threeYearPoint?.baselineNetWorth || 0);

  return {
    baselineSummary: baseline,
    simulatedSummary: {
      monthlyIncome: Math.round(simIncome),
      monthlyExpenses: Math.round(simExpenses),
      monthlySavings: Math.round(simSavings),
      monthlyDebtPayment: Math.round(simMonthlyDebt),
      effectiveNetCashflow: Math.round(effectiveNetCashflow),
      oneYearNetWorthImpact: Math.round(oneYearNetDifference),
      threeYearNetWorthImpact: Math.round(threeYearNetDifference),
      debtFreeMonthsSooner,
    },
    difference: {
      monthlySavingsDiff: Math.round(simSavings - baseSavings),
      monthlyExpenseDiff: Math.round(simExpenses - baseExpenses),
      monthlyIncomeDiff: Math.round(simIncome - baseIncome),
      oneYearNetDifference: Math.round(oneYearNetDifference),
      threeYearNetDifference: Math.round(threeYearNetDifference),
    },
    timeline,
  };
}
