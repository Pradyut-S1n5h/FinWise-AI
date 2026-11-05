import { FinancialState } from '../types/finance';
import { DEMO_STATE, EMPTY_STATE } from '../data/initialData';

const STORAGE_KEY = 'finwise_ai_state_v1';
const LISTENERS: Set<(state: FinancialState) => void> = new Set();

export function loadFinancialState(): FinancialState {
  if (typeof window === 'undefined') {
    return DEMO_STATE;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First time visitor: provide DEMO_STATE or EMPTY_STATE
      // For immediate richness, if user hasn't seen it, initialize with DEMO_STATE so the dashboard is alive,
      // but if user clicks Start Fresh or Onboarding, it resets easily.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_STATE));
      return DEMO_STATE;
    }
    const parsed = JSON.parse(raw);
    // Basic verification and fallback merge
    return {
      ...EMPTY_STATE,
      ...parsed,
      profile: { ...EMPTY_STATE.profile, ...(parsed.profile || {}) },
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : EMPTY_STATE.accounts,
      incomeSources: Array.isArray(parsed.incomeSources) ? parsed.incomeSources : EMPTY_STATE.incomeSources,
      categories: Array.isArray(parsed.categories) ? parsed.categories : EMPTY_STATE.categories,
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      liabilities: Array.isArray(parsed.liabilities) ? parsed.liabilities : [],
      creditCards: Array.isArray(parsed.creditCards) ? parsed.creditCards : [],
      assets: Array.isArray(parsed.assets) ? parsed.assets : [],
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
      calendarEvents: Array.isArray(parsed.calendarEvents) ? parsed.calendarEvents : [],
    };
  } catch (err) {
    console.error('Failed to load from localStorage:', err);
    return DEMO_STATE;
  }
}

export function saveFinancialState(state: FinancialState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    LISTENERS.forEach((cb) => cb(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function resetToEmptyState(): FinancialState {
  const fresh: FinancialState = {
    ...EMPTY_STATE,
    profile: {
      ...EMPTY_STATE.profile,
      onboardingCompleted: false,
    },
  };
  saveFinancialState(fresh);
  return fresh;
}

export function resetToDemoState(): FinancialState {
  saveFinancialState(DEMO_STATE);
  return DEMO_STATE;
}

export function exportStateAsJSON(state: FinancialState): string {
  return JSON.stringify(
    {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: state,
    },
    null,
    2
  );
}

export function importStateFromJSON(jsonStr: string): FinancialState {
  const parsed = JSON.parse(jsonStr);
  const data = parsed.data || parsed;
  if (!data.profile || !Array.isArray(data.accounts)) {
    throw new Error('Invalid FinWise backup format: missing core profile or accounts.');
  }

  const merged: FinancialState = {
    ...EMPTY_STATE,
    ...data,
    profile: { ...EMPTY_STATE.profile, ...(data.profile || {}) },
    accounts: data.accounts || [],
    incomeSources: data.incomeSources || [],
    categories: data.categories || EMPTY_STATE.categories,
    transactions: data.transactions || [],
    liabilities: data.liabilities || [],
    creditCards: data.creditCards || [],
    assets: data.assets || [],
    goals: data.goals || [],
    calendarEvents: data.calendarEvents || [],
  };

  saveFinancialState(merged);
  return merged;
}

export function subscribeToStateChanges(callback: (state: FinancialState) => void): () => void {
  LISTENERS.add(callback);
  return () => {
    LISTENERS.delete(callback);
  };
}
