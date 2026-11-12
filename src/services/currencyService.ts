import { CurrencyCode, FinancialState, SUPPORTED_CURRENCIES } from '../types/finance';

export interface ExchangeRateSnapshot {
  base: CurrencyCode;
  rates: Partial<Record<CurrencyCode, number>>;
  updatedAt: string;
  nextUpdateAt: string;
}

const exchangeRateCache = new Map<CurrencyCode, ExchangeRateSnapshot>();

export async function getExchangeRates(base: CurrencyCode): Promise<ExchangeRateSnapshot> {
  const cached = exchangeRateCache.get(base);
  if (cached && Date.now() < Date.parse(cached.nextUpdateAt)) {
    return cached;
  }

  const response = await fetch(`/api/exchange-rates/${base}`, {
    signal: AbortSignal.timeout(15_000),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(typeof data?.error === 'string' ? data.error : 'Could not load exchange rates.');
  }

  if (
    data?.base !== base ||
    typeof data.updatedAt !== 'string' ||
    typeof data.nextUpdateAt !== 'string' ||
    !data.rates ||
    typeof data.rates !== 'object'
  ) {
    throw new Error('The exchange-rate service returned an invalid response.');
  }

  const updatedAt = Date.parse(data.updatedAt);
  const nextUpdateAt = Date.parse(data.nextUpdateAt);
  if (
    !Number.isFinite(updatedAt) ||
    !Number.isFinite(nextUpdateAt) ||
    updatedAt > Date.now() + 5 * 60_000 ||
    Date.now() - updatedAt > 48 * 60 * 60_000
  ) {
    throw new Error('The exchange rates are outdated. Try again later.');
  }

  const rates: Partial<Record<CurrencyCode, number>> = {};
  for (const code of Object.keys(SUPPORTED_CURRENCIES) as CurrencyCode[]) {
    const rate = data.rates[code];
    if (typeof rate === 'number' && Number.isFinite(rate) && rate > 0) {
      rates[code] = rate;
    }
  }

  if (rates[base] !== 1) {
    throw new Error('The exchange-rate service returned an invalid base rate.');
  }

  const snapshot = {
    base,
    rates,
    updatedAt: new Date(updatedAt).toISOString(),
    nextUpdateAt: new Date(nextUpdateAt).toISOString(),
  };
  exchangeRateCache.set(base, snapshot);
  return snapshot;
}

export function convertFinancialState(
  state: FinancialState,
  targetCurrency: CurrencyCode,
  rate: number
): FinancialState {
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error('A valid exchange rate is required.');
  }

  const decimalPlaces = SUPPORTED_CURRENCIES[targetCurrency].decimalPlaces;
  const factor = 10 ** decimalPlaces;
  const convert = (amount: number) => Math.round((amount * rate + Number.EPSILON) * factor) / factor;

  return {
    ...state,
    profile: {
      ...state.profile,
      currency: targetCurrency,
      monthlyIncomeExpected: convert(state.profile.monthlyIncomeExpected),
    },
    accounts: state.accounts.map((account) => ({ ...account, balance: convert(account.balance) })),
    incomeSources: state.incomeSources.map((source) => ({ ...source, amount: convert(source.amount) })),
    categories: state.categories.map((category) => ({
      ...category,
      monthlyBudget: convert(category.monthlyBudget),
    })),
    transactions: state.transactions.map((transaction) => ({
      ...transaction,
      amount: convert(transaction.amount),
    })),
    liabilities: state.liabilities.map((liability) => ({
      ...liability,
      originalAmount: convert(liability.originalAmount),
      outstandingBalance: convert(liability.outstandingBalance),
      monthlyRepayment: convert(liability.monthlyRepayment),
    })),
    creditCards: state.creditCards.map((card) => ({
      ...card,
      creditLimit: convert(card.creditLimit),
      outstandingBalance: convert(card.outstandingBalance),
      minimumPayment: convert(card.minimumPayment),
    })),
    assets: state.assets.map((asset) => ({
      ...asset,
      purchasePrice: convert(asset.purchasePrice),
      manualValuation: convert(asset.manualValuation),
    })),
    goals: state.goals.map((goal) => ({
      ...goal,
      targetAmount: convert(goal.targetAmount),
      currentSaved: convert(goal.currentSaved),
    })),
    calendarEvents: state.calendarEvents.map((event) => ({
      ...event,
      amount: convert(event.amount),
    })),
  };
}
