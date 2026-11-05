import { FinancialState, FinancialSummary, Transaction } from '../types/finance';

/**
 * Computes consolidated financial health, net worth, cash flow, and key ratios.
 */
export function computeFinancialSummary(state: FinancialState): FinancialSummary {
  // 1. Total Available Liquid Cash across cash/bank/wallet accounts
  const totalAvailableBalance = state.accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);

  // 2. Expected monthly income
  const monthlyIncomeExpected = state.incomeSources.reduce((sum, inc) => {
    if (!inc.isActive) return sum;
    const amt = Number(inc.amount) || 0;
    if (inc.frequency === 'weekly') return sum + amt * 4.33;
    if (inc.frequency === 'biweekly') return sum + amt * 2.16;
    if (inc.frequency === 'monthly') return sum + amt;
    return sum; // one-time not counted in recurring monthly
  }, 0) || Number(state.profile.monthlyIncomeExpected) || 0;

  // 3. Transactions in the current calendar month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  let monthlyIncomeActual = 0;
  let monthlyExpensesActual = 0;

  state.transactions.forEach((tx) => {
    if (!tx.date) return;
    const [y, m] = tx.date.split('-').map(Number);
    if (y === currentYear && m === currentMonth + 1) {
      if (tx.type === 'income') {
        monthlyIncomeActual += Number(tx.amount) || 0;
      } else if (tx.type === 'expense') {
        monthlyExpensesActual += Number(tx.amount) || 0;
      }
    }
  });

  // 4. Budgeted monthly expenses
  const monthlyExpensesBudgeted = state.categories.reduce(
    (sum, cat) => sum + (Number(cat.monthlyBudget) || 0),
    0
  );

  // 5. Total Asset Value = Liquid accounts + Manually entered asset valuations
  const totalAssetsValue =
    totalAvailableBalance +
    state.assets.reduce((sum, asset) => sum + (Number(asset.manualValuation) || Number(asset.purchasePrice) || 0), 0);

  // 6. Total Liabilities = Outstanding loans + Credit card balances
  const loansBalance = state.liabilities.reduce(
    (sum, l) => sum + (Number(l.outstandingBalance) || 0),
    0
  );
  const creditCardBalance = state.creditCards.reduce(
    (sum, cc) => sum + (Number(cc.outstandingBalance) || 0),
    0
  );
  const totalLiabilitiesValue = loansBalance + creditCardBalance;

  // 7. Net Worth
  const netWorth = totalAssetsValue - totalLiabilitiesValue;

  // 8. Monthly Cash Flow & Savings Rate
  const effectiveIncome = monthlyIncomeActual > 0 ? monthlyIncomeActual : monthlyIncomeExpected;
  const monthlySavings = Math.max(0, effectiveIncome - monthlyExpensesActual);
  const savingsRate = effectiveIncome > 0 ? (monthlySavings / effectiveIncome) * 100 : 0;

  // 9. Debt to Income Ratio
  const totalMonthlyDebtPayments = state.liabilities.reduce(
    (sum, l) => sum + (Number(l.monthlyRepayment) || 0),
    0
  );
  const debtToIncomeRatio = effectiveIncome > 0 ? (totalMonthlyDebtPayments / effectiveIncome) * 100 : 0;

  // 10. Emergency Fund Coverage Months
  const monthlyBaselineBurn = monthlyExpensesActual > 0 ? monthlyExpensesActual : (monthlyExpensesBudgeted || 20000);
  const emergencyFundCoverageMonths = monthlyBaselineBurn > 0 ? totalAvailableBalance / monthlyBaselineBurn : 0;

  // 11. Health Score Calculation (0-100)
  // Factors:
  // - Savings rate: up to 25 pts (>20% = full)
  // - Emergency fund: up to 25 pts (>=6 months = full)
  // - Debt to Income: up to 25 pts (<20% = full, >50% = 0)
  // - Net worth positive: up to 25 pts
  let healthScore = 0;

  // Savings rate score
  healthScore += Math.min(25, (savingsRate / 20) * 25);

  // Emergency buffer score
  const targetMonths = state.profile.emergencyFundTargetMonths || 6;
  healthScore += Math.min(25, (emergencyFundCoverageMonths / targetMonths) * 25);

  // DTI score
  if (debtToIncomeRatio === 0) {
    healthScore += 25;
  } else if (debtToIncomeRatio < 20) {
    healthScore += 25;
  } else if (debtToIncomeRatio < 40) {
    healthScore += 15;
  } else if (debtToIncomeRatio < 60) {
    healthScore += 5;
  }

  // Net worth positive score
  if (netWorth > 0) {
    healthScore += 25;
  } else if (netWorth === 0) {
    healthScore += 10;
  }

  healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

  let healthStatus: FinancialSummary['healthStatus'] = 'Needs Attention';
  if (healthScore >= 80) healthStatus = 'Excellent';
  else if (healthScore >= 60) healthStatus = 'Good';
  else if (healthScore >= 40) healthStatus = 'Needs Attention';
  else healthStatus = 'Critical';

  return {
    totalAvailableBalance,
    monthlyIncomeExpected,
    monthlyIncomeActual,
    monthlyExpensesBudgeted,
    monthlyExpensesActual,
    monthlySavings,
    totalAssetsValue,
    totalLiabilitiesValue,
    netWorth,
    savingsRate,
    debtToIncomeRatio,
    emergencyFundCoverageMonths,
    healthScore,
    healthStatus,
  };
}

/**
 * Consistent Double-Entry-Aware state transformation when adding a transaction.
 */
export function applyTransactionEffects(state: FinancialState, tx: Transaction): FinancialState {
  const amt = Number(tx.amount) || 0;
  const updatedAccounts = state.accounts.map((acc) => ({ ...acc }));
  let updatedLiabilities = state.liabilities.map((l) => ({ ...l }));
  let updatedGoals = state.goals.map((g) => ({ ...g }));

  // Find primary account
  const primaryAcc = updatedAccounts.find((a) => a.id === tx.accountId) || updatedAccounts[0];

  switch (tx.type) {
    case 'income':
      if (primaryAcc) primaryAcc.balance += amt;
      break;

    case 'expense':
      if (primaryAcc) primaryAcc.balance -= amt;
      break;

    case 'transfer':
      if (primaryAcc) primaryAcc.balance -= amt;
      if (tx.toAccountId) {
        const destAcc = updatedAccounts.find((a) => a.id === tx.toAccountId);
        if (destAcc) destAcc.balance += amt;
      }
      break;

    case 'savings_contribution':
      if (primaryAcc) primaryAcc.balance -= amt;
      if (tx.goalId) {
        updatedGoals = updatedGoals.map((g) =>
          g.id === tx.goalId ? { ...g, currentSaved: Math.max(0, g.currentSaved + amt) } : g
        );
      }
      break;

    case 'debt_repayment':
      if (primaryAcc) primaryAcc.balance -= amt;
      if (tx.liabilityId) {
        updatedLiabilities = updatedLiabilities.map((l) =>
          l.id === tx.liabilityId
            ? { ...l, outstandingBalance: Math.max(0, l.outstandingBalance - amt) }
            : l
        );
      }
      break;

    case 'investment_purchase':
      if (primaryAcc) primaryAcc.balance -= amt;
      // Asset valuation may increase by purchase amount if linked
      break;

    case 'investment_sale':
      if (primaryAcc) primaryAcc.balance += amt;
      break;
  }

  return {
    ...state,
    accounts: updatedAccounts,
    liabilities: updatedLiabilities,
    goals: updatedGoals,
    transactions: [tx, ...state.transactions],
  };
}

/**
 * Reverts accounting balance effects when deleting or replacing a transaction.
 */
export function revertTransactionEffects(state: FinancialState, txId: string): FinancialState {
  const targetTx = state.transactions.find((t) => t.id === txId);
  if (!targetTx) return state;

  const amt = Number(targetTx.amount) || 0;
  const updatedAccounts = state.accounts.map((acc) => ({ ...acc }));
  let updatedLiabilities = state.liabilities.map((l) => ({ ...l }));
  let updatedGoals = state.goals.map((g) => ({ ...g }));

  const primaryAcc = updatedAccounts.find((a) => a.id === targetTx.accountId);

  switch (targetTx.type) {
    case 'income':
      if (primaryAcc) primaryAcc.balance -= amt;
      break;

    case 'expense':
      if (primaryAcc) primaryAcc.balance += amt;
      break;

    case 'transfer':
      if (primaryAcc) primaryAcc.balance += amt;
      if (targetTx.toAccountId) {
        const destAcc = updatedAccounts.find((a) => a.id === targetTx.toAccountId);
        if (destAcc) destAcc.balance -= amt;
      }
      break;

    case 'savings_contribution':
      if (primaryAcc) primaryAcc.balance += amt;
      if (targetTx.goalId) {
        updatedGoals = updatedGoals.map((g) =>
          g.id === targetTx.goalId ? { ...g, currentSaved: Math.max(0, g.currentSaved - amt) } : g
        );
      }
      break;

    case 'debt_repayment':
      if (primaryAcc) primaryAcc.balance += amt;
      if (targetTx.liabilityId) {
        updatedLiabilities = updatedLiabilities.map((l) =>
          l.id === targetTx.liabilityId
            ? { ...l, outstandingBalance: l.outstandingBalance + amt }
            : l
        );
      }
      break;

    case 'investment_purchase':
      if (primaryAcc) primaryAcc.balance += amt;
      break;

    case 'investment_sale':
      if (primaryAcc) primaryAcc.balance -= amt;
      break;
  }

  return {
    ...state,
    accounts: updatedAccounts,
    liabilities: updatedLiabilities,
    goals: updatedGoals,
    transactions: state.transactions.filter((t) => t.id !== txId),
  };
}
