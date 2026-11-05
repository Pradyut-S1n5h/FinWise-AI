import { FinancialState } from '../types/finance';
import { computeFinancialSummary } from './accounting';
import { formatCurrency } from '../utils/formatters';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: 'gemini' | 'local_engine';
}

/**
 * Intelligent, deterministic local financial assistant engine
 * when external AI / network is unavailable or without Gemini API key.
 */
function generateLocalFinancialAdvice(question: string, state: FinancialState): string {
  const summary = computeFinancialSummary(state);
  const cur = state.profile.currency;
  const q = question.toLowerCase();

  // 1. Spending query
  if (q.includes('spend') || q.includes('expense') || q.includes('cost me the most') || q.includes('highest')) {
    // Find highest spend category
    const categoryTotals: Record<string, number> = {};
    state.transactions.forEach((tx) => {
      if (tx.type === 'expense' && tx.categoryId) {
        categoryTotals[tx.categoryId] = (categoryTotals[tx.categoryId] || 0) + tx.amount;
      }
    });

    let topCatName = 'Living Expenses';
    let topCatAmount = 0;

    Object.entries(categoryTotals).forEach(([catId, amt]) => {
      if (amt > topCatAmount) {
        topCatAmount = amt;
        const cat = state.categories.find((c) => c.id === catId);
        if (cat) topCatName = cat.name;
      }
    });

    return `📊 **Expense Analysis for this Month:**
- **Total Expenses:** ${formatCurrency(summary.monthlyExpensesActual, cur)} (Budgeted: ${formatCurrency(summary.monthlyExpensesBudgeted, cur)})
- **Top Expense Category:** **${topCatName}** at ${formatCurrency(topCatAmount, cur)}.
- **Budget Status:** You are currently utilizing **${summary.monthlyExpensesBudgeted > 0 ? Math.round((summary.monthlyExpensesActual / summary.monthlyExpensesBudgeted) * 100) : 0}%** of your total monthly budget.
💡 *Recommendation:* To boost your monthly savings, examine whether any non-essential spending in ${topCatName} can be optimized by 10-15%.`;
  }

  // 2. Savings and budget query
  if (q.includes('save') || q.includes('budget') || q.includes('following my budget')) {
    const isBudgetHealthy = summary.monthlyExpensesActual <= summary.monthlyExpensesBudgeted;
    return `💰 **Savings & Budget Assessment:**
- **Monthly Net Cash Flow:** ${formatCurrency(summary.monthlySavings, cur)}/month
- **Savings Rate:** **${summary.savingsRate.toFixed(1)}%** (Target recommended: 20%+)
- **Budget Performance:** ${
      isBudgetHealthy
        ? `✅ You are within your planned budget with ${formatCurrency(summary.monthlyExpensesBudgeted - summary.monthlyExpensesActual, cur)} headroom remaining!`
        : `⚠️ You are currently ${formatCurrency(summary.monthlyExpensesActual - summary.monthlyExpensesBudgeted, cur)} over your planned budget.`
    }
- **50/30/20 Guide:** For an expected income of ${formatCurrency(summary.monthlyIncomeExpected, cur)}, aim for:
  • Needs (50%): ${formatCurrency(summary.monthlyIncomeExpected * 0.5, cur)}
  • Wants (30%): ${formatCurrency(summary.monthlyIncomeExpected * 0.3, cur)}
  • Savings & Investments (20%): ${formatCurrency(summary.monthlyIncomeExpected * 0.2, cur)}`;
  }

  // 3. Goals and timeline query
  if (q.includes('goal') || q.includes('how long') || q.includes('reach') || q.includes('emergency fund')) {
    if (state.goals.length === 0) {
      return `🎯 You haven't added any active savings targets yet. Go to **Financial Goals** and create a target (like an Emergency Fund or Laptop purchase) to unlock automated milestone tracking!`;
    }
    const topGoal = state.goals[0];
    const remaining = Math.max(0, topGoal.targetAmount - topGoal.currentSaved);
    const months = summary.monthlySavings > 0 ? Math.ceil(remaining / summary.monthlySavings) : 'Indefinite';

    return `🎯 **Goal Tracking:**
- **Primary Target:** **${topGoal.name}**
- **Progress:** ${formatCurrency(topGoal.currentSaved, cur)} of ${formatCurrency(topGoal.targetAmount, cur)} (${Math.round((topGoal.currentSaved / topGoal.targetAmount) * 100)}%)
- **Estimated Completion:** At your current monthly surplus of ${formatCurrency(summary.monthlySavings, cur)}/month, you can achieve this goal in **approx. ${months} month(s)**.
💡 *Tip:* Automating a transfer of ${formatCurrency(Math.ceil(remaining / Math.max(1, typeof months === 'number' ? months : 6)), cur)} on payday guarantees on-time completion!`;
  }

  // 4. Net worth and liabilities
  if (q.includes('net worth') || q.includes('debt') || q.includes('loan') || q.includes('liabilit')) {
    return `🏛️ **Balance Sheet & Net Worth Overview:**
- **Total Net Worth:** **${formatCurrency(summary.netWorth, cur)}**
- **Total Assets:** ${formatCurrency(summary.totalAssetsValue, cur)} (Cash accounts + investments + holdings)
- **Total Liabilities:** ${formatCurrency(summary.totalLiabilitiesValue, cur)}
- **Debt-to-Income (DTI):** **${summary.debtToIncomeRatio.toFixed(1)}%** ${
      summary.debtToIncomeRatio < 20 ? '(Healthy!)' : '(Elevated, prioritize early paydown)'
    }
- **Financial Health Score:** **${summary.healthScore}/100** (${summary.healthStatus})`;
  }

  // Default holistic financial health summary
  return `🌟 **FinWise Financial Snapshot for ${state.profile.displayName}:**
- **Available Liquid Balance:** ${formatCurrency(summary.totalAvailableBalance, cur)}
- **Estimated Monthly Cash Flow:** ${formatCurrency(summary.monthlySavings, cur)}/month
- **Current Net Worth:** ${formatCurrency(summary.netWorth, cur)}
- **Emergency Reserve:** Covers **${summary.emergencyFundCoverageMonths.toFixed(1)} months** of living expenses.
- **Financial Health Score:** **${summary.healthScore}/100** (${summary.healthStatus})

How can I help you today? You can ask about:
1. "Which category costs me the most?"
2. "How much can I potentially save?"
3. "Am I following my budget?"
4. "What happens if I increase my savings by ₹500?"`;
}

export async function askFinancialCopilot(
  message: string,
  state: FinancialState,
  history: ChatMessage[] = []
): Promise<{ reply: string; source: 'gemini' | 'local_engine' }> {
  const summary = computeFinancialSummary(state);

  // Send aggregated safe summary context to server proxy
  const safeContext = {
    displayName: state.profile.displayName,
    currency: state.profile.currency,
    totalAvailableBalance: summary.totalAvailableBalance,
    monthlyIncomeExpected: summary.monthlyIncomeExpected,
    monthlyIncomeActual: summary.monthlyIncomeActual,
    monthlyExpensesBudgeted: summary.monthlyExpensesBudgeted,
    monthlyExpensesActual: summary.monthlyExpensesActual,
    monthlySavings: summary.monthlySavings,
    savingsRate: `${summary.savingsRate.toFixed(1)}%`,
    totalAssets: summary.totalAssetsValue,
    totalLiabilities: summary.totalLiabilitiesValue,
    netWorth: summary.netWorth,
    healthScore: `${summary.healthScore}/100 (${summary.healthStatus})`,
    emergencyFundMonths: summary.emergencyFundCoverageMonths.toFixed(1),
    categoriesCount: state.categories.length,
    activeGoals: state.goals.map((g) => ({
      name: g.name,
      target: g.targetAmount,
      saved: g.currentSaved,
      pct: Math.round((g.currentSaved / g.targetAmount) * 100),
    })),
    liabilities: state.liabilities.map((l) => ({
      name: l.name,
      balance: l.outstandingBalance,
      monthlyEMI: l.monthlyRepayment,
    })),
  };

  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(6000),
      body: JSON.stringify({
        message,
        financialContext: safeContext,
        history: history.slice(-4).map((h) => ({
          role: h.role === 'user' ? 'user' : 'model',
          text: h.content,
        })),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.reply && data.source === 'gemini') {
        return { reply: data.reply, source: 'gemini' };
      }
    }
  } catch (err) {
    console.warn('Backend Gemini API call skipped or timed out, using local financial engine:', err);
  }

  // Graceful local engine fallback
  const localReply = generateLocalFinancialAdvice(message, state);
  return { reply: localReply, source: 'local_engine' };
}
