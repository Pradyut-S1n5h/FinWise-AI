export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export const FinancialCalculators = {
  // 1. Basic Calculator
  basic(a: number, b: number, op: '+' | '-' | '*' | '/'): { result: number; formula: string } {
    let result = 0;
    if (op === '+') result = a + b;
    else if (op === '-') result = a - b;
    else if (op === '*') result = a * b;
    else if (op === '/') result = b !== 0 ? a / b : 0;
    return {
      result,
      formula: `${a} ${op} ${b} = ${result}`,
    };
  },

  // 2. Income-Expense Calculator
  incomeExpense(income: number, expenses: number): {
    netSavings: number;
    savingsRate: number;
    status: 'Surplus' | 'Deficit' | 'Breakeven';
    formula: string;
  } {
    const netSavings = income - expenses;
    const savingsRate = income > 0 ? (netSavings / income) * 100 : 0;
    const status = netSavings > 0 ? 'Surplus' : netSavings < 0 ? 'Deficit' : 'Breakeven';
    return {
      netSavings,
      savingsRate: Math.max(-100, Math.min(100, savingsRate)),
      status,
      formula: `Net Cash Flow = Income (${income}) - Expenses (${expenses}) = ${netSavings}`,
    };
  },

  // 3. Budget Calculator (50/30/20 Rule)
  budgetRule(income: number): {
    needs: number; // 50%
    wants: number; // 30%
    savingsDebt: number; // 20%
    formula: string;
  } {
    const needs = income * 0.5;
    const wants = income * 0.3;
    const savingsDebt = income * 0.2;
    return {
      needs: Math.round(needs),
      wants: Math.round(wants),
      savingsDebt: Math.round(savingsDebt),
      formula: `50% Needs (${needs}) + 30% Wants (${wants}) + 20% Savings/Investments (${savingsDebt}) = Total (${income})`,
    };
  },

  // 4. Savings Calculator (Initial Deposit + Monthly additions)
  savings(initialDeposit: number, monthlyDeposit: number, annualRatePct: number, years: number): {
    totalContributed: number;
    interestEarned: number;
    futureValue: number;
    formula: string;
  } {
    const r = (annualRatePct || 0) / 100 / 12;
    const n = Math.max(1, (years || 1) * 12);
    let fv = initialDeposit;
    let totalContributed = initialDeposit;

    for (let i = 0; i < n; i++) {
      fv = (fv + monthlyDeposit) * (1 + r);
      totalContributed += monthlyDeposit;
    }

    const futureValue = Math.round(fv);
    const interestEarned = Math.round(Math.max(0, futureValue - totalContributed));

    return {
      totalContributed: Math.round(totalContributed),
      interestEarned,
      futureValue,
      formula: `Future Value with Monthly Compounding at ${annualRatePct}% p.a. over ${years} years`,
    };
  },

  // 5. Compound Interest Calculator: A = P * (1 + r/n)^(n*t)
  compoundInterest(
    principal: number,
    annualRatePct: number,
    compoundingFreqPerYear: number, // 1=annual, 4=quarterly, 12=monthly, 365=daily
    years: number
  ): {
    futureValue: number;
    totalInterest: number;
    formula: string;
  } {
    const P = Math.max(0, principal);
    const r = (annualRatePct || 0) / 100;
    const n = Math.max(1, compoundingFreqPerYear || 1);
    const t = Math.max(0, years);

    const futureValue = P * Math.pow(1 + r / n, n * t);
    const totalInterest = Math.max(0, futureValue - P);

    return {
      futureValue: Math.round(futureValue),
      totalInterest: Math.round(totalInterest),
      formula: `A = P * (1 + r/n)^(nt) → ${P} * (1 + ${r}/${n})^(${n}*${t}) = ${Math.round(futureValue)}`,
    };
  },

  // 6. Simple Interest: I = (P * R * T) / 100
  simpleInterest(principal: number, annualRatePct: number, years: number): {
    interest: number;
    totalAmount: number;
    formula: string;
  } {
    const P = Math.max(0, principal);
    const R = Math.max(0, annualRatePct);
    const T = Math.max(0, years);

    const interest = (P * R * T) / 100;
    const totalAmount = P + interest;

    return {
      interest: Math.round(interest),
      totalAmount: Math.round(totalAmount),
      formula: `Interest = (P × R × T) / 100 → (${P} × ${R} × ${T}) / 100 = ${Math.round(interest)}`,
    };
  },

  // 7. Loan EMI Calculator: EMI = [P * r * (1 + r)^n] / [(1 + r)^n - 1]
  loanEMI(principal: number, annualInterestRatePct: number, tenureMonths: number): {
    monthlyEMI: number;
    totalInterest: number;
    totalPayment: number;
    amortizationSchedule: AmortizationRow[];
    formula: string;
  } {
    const P = Math.max(0, principal);
    const n = Math.max(1, tenureMonths);
    const r = (annualInterestRatePct || 0) / 100 / 12;

    let emi = 0;
    if (r === 0) {
      emi = P / n;
    } else {
      emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const monthlyEMI = Math.round(emi);
    const totalPayment = Math.round(monthlyEMI * n);
    const totalInterest = Math.max(0, totalPayment - P);

    // Amortization Schedule (first 12 months preview)
    const amortizationSchedule: AmortizationRow[] = [];
    let balance = P;
    const previewMonths = Math.min(n, 24);

    for (let m = 1; m <= previewMonths; m++) {
      const interestForMonth = balance * r;
      const principalForMonth = monthlyEMI - interestForMonth;
      balance = Math.max(0, balance - principalForMonth);

      amortizationSchedule.push({
        month: m,
        payment: monthlyEMI,
        principal: Math.round(principalForMonth),
        interest: Math.round(interestForMonth),
        remainingBalance: Math.round(balance),
      });
    }

    return {
      monthlyEMI,
      totalInterest,
      totalPayment,
      amortizationSchedule,
      formula: `EMI = [P × r × (1+r)ⁿ] / [(1+r)ⁿ - 1]`,
    };
  },

  // 8. Loan Prepayment / Early Repayment Calculator
  loanPrepayment(
    principal: number,
    annualInterestRatePct: number,
    tenureMonths: number,
    extraMonthlyPayment: number
  ): {
    originalEMI: number;
    newTenureMonths: number;
    monthsSaved: number;
    interestSaved: number;
    originalTotalInterest: number;
    newTotalInterest: number;
    formula: string;
  } {
    const orig = this.loanEMI(principal, annualInterestRatePct, tenureMonths);
    const r = (annualInterestRatePct || 0) / 100 / 12;
    const totalMonthlyPayment = orig.monthlyEMI + extraMonthlyPayment;

    let balance = principal;
    let newMonths = 0;
    let newTotalInterest = 0;

    while (balance > 0 && newMonths < tenureMonths * 2) {
      newMonths++;
      const interestForMonth = balance * r;
      const principalForMonth = totalMonthlyPayment - interestForMonth;

      if (principalForMonth >= balance) {
        newTotalInterest += balance * r;
        balance = 0;
        break;
      }

      newTotalInterest += interestForMonth;
      balance -= principalForMonth;
    }

    const monthsSaved = Math.max(0, tenureMonths - newMonths);
    const interestSaved = Math.max(0, Math.round(orig.totalInterest - newTotalInterest));

    return {
      originalEMI: orig.monthlyEMI,
      newTenureMonths: newMonths,
      monthsSaved,
      interestSaved,
      originalTotalInterest: orig.totalInterest,
      newTotalInterest: Math.round(newTotalInterest),
      formula: `Prepaying an extra ${extraMonthlyPayment}/month reduces debt duration by ${monthsSaved} months`,
    };
  },

  // 9. Net Worth Calculator
  netWorth(
    liquidCash: number,
    investments: number,
    realEstateOtherAssets: number,
    loansDebt: number,
    creditCardBalance: number
  ): {
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    debtToAssetRatio: number;
    formula: string;
  } {
    const totalAssets = liquidCash + investments + realEstateOtherAssets;
    const totalLiabilities = loansDebt + creditCardBalance;
    const netWorth = totalAssets - totalLiabilities;
    const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

    return {
      totalAssets: Math.round(totalAssets),
      totalLiabilities: Math.round(totalLiabilities),
      netWorth: Math.round(netWorth),
      debtToAssetRatio: Math.round(debtToAssetRatio * 10) / 10,
      formula: `Net Worth = Total Assets (${totalAssets}) - Total Liabilities (${totalLiabilities}) = ${netWorth}`,
    };
  },

  // 10. Investment Return / CAGR Calculator
  investmentReturn(
    initialInvestment: number,
    finalValue: number,
    years: number
  ): {
    totalGain: number;
    absoluteReturnPct: number;
    cagrPct: number;
    formula: string;
  } {
    const P = Math.max(1, initialInvestment);
    const F = Math.max(0, finalValue);
    const t = Math.max(0.1, years);

    const totalGain = F - P;
    const absoluteReturnPct = (totalGain / P) * 100;
    const cagrPct = (Math.pow(F / P, 1 / t) - 1) * 100;

    return {
      totalGain: Math.round(totalGain),
      absoluteReturnPct: Math.round(absoluteReturnPct * 10) / 10,
      cagrPct: Math.round(cagrPct * 100) / 100,
      formula: `CAGR = ((Final / Initial) ^ (1 / Years) - 1) × 100`,
    };
  },

  // 11. Percentage Calculator (Multiple modes)
  percentage(
    value: number,
    total: number,
    mode: 'what_percent_is' | 'percent_of' | 'percent_change'
  ): {
    result: number;
    explanation: string;
  } {
    if (mode === 'what_percent_is') {
      const res = total !== 0 ? (value / total) * 100 : 0;
      return {
        result: Math.round(res * 100) / 100,
        explanation: `${value} is ${res.toFixed(2)}% of ${total}`,
      };
    }
    if (mode === 'percent_of') {
      // value% of total
      const res = (value / 100) * total;
      return {
        result: Math.round(res * 100) / 100,
        explanation: `${value}% of ${total} is ${res.toFixed(2)}`,
      };
    }
    // percent change from value to total
    const diff = total - value;
    const res = value !== 0 ? (diff / value) * 100 : 0;
    return {
      result: Math.round(res * 100) / 100,
      explanation: `Change from ${value} to ${total} is ${res >= 0 ? '+' : ''}${res.toFixed(2)}%`,
    };
  },

  // 12. Inflation & Purchasing Power Calculator
  inflation(currentAmount: number, annualInflationRatePct: number, years: number): {
    futureCost: number;
    futurePurchasingPower: number;
    lossInPurchasingPowerPct: number;
    formula: string;
  } {
    const P = Math.max(0, currentAmount);
    const i = (annualInflationRatePct || 0) / 100;
    const t = Math.max(0, years);

    // What will cost P today cost in t years:
    const futureCost = P * Math.pow(1 + i, t);
    // Purchasing power of P in t years:
    const futurePurchasingPower = P / Math.pow(1 + i, t);
    const lossInPurchasingPowerPct = ((P - futurePurchasingPower) / P) * 100;

    return {
      futureCost: Math.round(futureCost),
      futurePurchasingPower: Math.round(futurePurchasingPower),
      lossInPurchasingPowerPct: Math.round(lossInPurchasingPowerPct * 10) / 10,
      formula: `Future Cost = Present Cost × (1 + Inflation)^Years`,
    };
  },

  // 13. Savings Goal Calculator
  savingsGoal(
    targetAmount: number,
    currentSavings: number,
    targetMonths: number,
    expectedAnnualReturnPct = 0
  ): {
    remainingAmount: number;
    requiredMonthlySaving: number;
    requiredDailySaving: number;
    formula: string;
  } {
    const remaining = Math.max(0, targetAmount - currentSavings);
    const months = Math.max(1, targetMonths);
    const r = (expectedAnnualReturnPct || 0) / 100 / 12;

    let requiredMonthly = 0;
    if (r === 0) {
      requiredMonthly = remaining / months;
    } else {
      // Sinking fund formula: PMT = FV * r / [(1 + r)^n - 1]
      requiredMonthly = (remaining * r) / (Math.pow(1 + r, months) - 1);
    }

    const requiredMonthlySaving = Math.round(requiredMonthly);
    const requiredDailySaving = Math.round(requiredMonthlySaving / 30);

    return {
      remainingAmount: remaining,
      requiredMonthlySaving,
      requiredDailySaving,
      formula: `Required Monthly = Remaining Target (${remaining}) ÷ (${months} months adjusted for interest)`,
    };
  },

  // 14. Recurring Contribution / SIP Calculator
  sipCalculator(
    monthlyInvestment: number,
    expectedAnnualReturnPct: number,
    tenureYears: number
  ): {
    totalInvested: number;
    estimatedReturns: number;
    totalMaturityValue: number;
    formula: string;
  } {
    const P = Math.max(0, monthlyInvestment);
    const i = (expectedAnnualReturnPct || 0) / 100 / 12;
    const n = Math.max(1, (tenureYears || 1) * 12);

    let totalMaturity = 0;
    if (i === 0) {
      totalMaturity = P * n;
    } else {
      // SIP Formula: M = P * [ ((1 + i)^n - 1) / i ] * (1 + i)
      totalMaturity = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    }

    const totalInvested = P * n;
    const totalMaturityValue = Math.round(totalMaturity);
    const estimatedReturns = Math.max(0, totalMaturityValue - totalInvested);

    return {
      totalInvested: Math.round(totalInvested),
      estimatedReturns: Math.round(estimatedReturns),
      totalMaturityValue,
      formula: `M = P × [((1+i)ⁿ - 1) / i] × (1+i)`,
    };
  },
};
