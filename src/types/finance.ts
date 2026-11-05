export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'SGD' | 'AED';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  decimalPlaces: number;
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)', decimalPlaces: 0 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar (USD)', decimalPlaces: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (EUR)', decimalPlaces: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound (GBP)', decimalPlaces: 2 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CAD)', decimalPlaces: 2 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (AUD)', decimalPlaces: 2 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen (JPY)', decimalPlaces: 0 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (SGD)', decimalPlaces: 2 },
  AED: { code: 'AED', symbol: 'AED ', name: 'UAE Dirham (AED)', decimalPlaces: 2 },
};

export type ThemeMode = 'dark' | 'light' | 'system';

export interface UserProfile {
  displayName: string;
  currency: CurrencyCode;
  monthlyIncomeExpected: number;
  incomeFrequency: 'monthly' | 'biweekly' | 'weekly';
  financialStartDate: string;
  theme: ThemeMode;
  onboardingCompleted: boolean;
  emergencyFundTargetMonths: number;
}

export type AccountType = 'cash' | 'bank' | 'savings' | 'wallet' | 'investment';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  notes?: string;
  isDefault?: boolean;
}

export type IncomeFrequency = 'monthly' | 'biweekly' | 'weekly' | 'one-time';

export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  frequency: IncomeFrequency;
  expectedDay?: number; // 1-31
  notes?: string;
  isActive: boolean;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  monthlyBudget: number;
  isFixed: boolean;
  isCustom?: boolean;
}

export type TransactionType =
  | 'income'
  | 'expense'
  | 'transfer'
  | 'savings_contribution'
  | 'debt_repayment'
  | 'investment_purchase'
  | 'investment_sale';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  amount: number;
  categoryId?: string;
  accountId: string;
  toAccountId?: string; // For transfers
  liabilityId?: string; // For debt repayments
  assetId?: string; // For investment purchase/sale
  goalId?: string; // For savings contributions
  payeeOrPayer?: string;
  notes?: string;
  tags?: string[];
  isRecurring?: boolean;
}

export type LiabilityType = 'education_loan' | 'personal_loan' | 'vehicle_loan' | 'mortgage' | 'credit_card' | 'other';

export interface Liability {
  id: string;
  name: string;
  type: LiabilityType;
  originalAmount: number;
  outstandingBalance: number;
  interestRate: number; // percentage, e.g. 8.5
  monthlyRepayment: number;
  frequency: 'monthly' | 'biweekly';
  startDate: string;
  expectedEndDate?: string;
  notes?: string;
}

export interface CreditCard {
  id: string;
  name: string; // e.g., "Student Rewards Card" (NEVER card number)
  creditLimit: number;
  outstandingBalance: number;
  minimumPayment: number;
  paymentDueDate: number; // Day of month 1-31
  interestRate: number;
  notes?: string;
}

export type AssetType =
  | 'stock'
  | 'mutual_fund'
  | 'fixed_deposit'
  | 'cash_savings'
  | 'gold'
  | 'crypto'
  | 'real_estate'
  | 'other';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  quantity?: number;
  purchasePrice: number;
  purchaseDate: string;
  manualValuation: number;
  lastValuationDate: string;
  notes?: string;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentSaved: number;
  targetDate: string;
  priority: 'high' | 'medium' | 'low';
  category: 'emergency_fund' | 'education' | 'gadget' | 'travel' | 'investment' | 'other';
  notes?: string;
}

export type CalendarEventType = 'income' | 'bill' | 'emi' | 'goal' | 'custom';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  amount: number;
  type: CalendarEventType;
  recurring: 'monthly' | 'yearly' | 'none';
  isPaid: boolean;
  notes?: string;
}

export interface FinancialState {
  profile: UserProfile;
  accounts: Account[];
  incomeSources: IncomeSource[];
  categories: ExpenseCategory[];
  transactions: Transaction[];
  liabilities: Liability[];
  creditCards: CreditCard[];
  assets: Asset[];
  goals: FinancialGoal[];
  calendarEvents: CalendarEvent[];
}

export interface FinancialSummary {
  totalAvailableBalance: number;
  monthlyIncomeExpected: number;
  monthlyIncomeActual: number;
  monthlyExpensesBudgeted: number;
  monthlyExpensesActual: number;
  monthlySavings: number;
  totalAssetsValue: number;
  totalLiabilitiesValue: number;
  netWorth: number;
  savingsRate: number; // Percentage
  debtToIncomeRatio: number;
  emergencyFundCoverageMonths: number;
  healthScore: number; // 0 - 100
  healthStatus: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical';
}
