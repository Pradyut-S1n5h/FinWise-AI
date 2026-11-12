import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/common/Navbar';
import { Sidebar, TabKey } from './components/common/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { TransactionsView } from './components/views/TransactionsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { PredictionsView } from './components/views/PredictionsView';
import { SimulatorView } from './components/views/SimulatorView';
import { BudgetView } from './components/views/BudgetView';
import { NetWorthView } from './components/views/NetWorthView';
import { CalendarView } from './components/views/CalendarView';
import { CalculatorsView } from './components/views/CalculatorsView';
import { CopilotView } from './components/views/CopilotView';
import { EducationView } from './components/views/EducationView';
import { SettingsView } from './components/views/SettingsView';
import { TransactionModal } from './components/modals/TransactionModal';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { CSVImportModal } from './components/modals/CSVImportModal';

import {
  FinancialState,
  Transaction,
  CurrencyCode,
  ExpenseCategory,
  Asset,
  Liability,
  CreditCard as CreditCardType,
  CalendarEvent,
} from './types/finance';
import {
  loadFinancialState,
  saveFinancialState,
  resetToDemoState,
  resetToEmptyState,
  subscribeToStateChanges,
} from './services/storage';
import {
  computeFinancialSummary,
  applyTransactionEffects,
  revertTransactionEffects,
} from './services/accounting';
import { convertFinancialState, getExchangeRates } from './services/currencyService';

export default function App() {
  const [state, setState] = useState<FinancialState>(loadFinancialState());
  const stateRef = useRef(state);
  const [currentTab, setCurrentTab] = useState<TabKey>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCurrencyChanging, setIsCurrencyChanging] = useState(false);
  const [currencyNotice, setCurrencyNotice] = useState<{ message: string; error: boolean } | null>(null);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isCSVImportOpen, setIsCSVImportOpen] = useState(false);

  // Compute live consolidated summary
  const summary = computeFinancialSummary(state);

  // Sync state to storage and theme class
  useEffect(() => {
    const unsub = subscribeToStateChanges((updated) => {
      stateRef.current = updated;
      setState(updated);
    });
    return unsub;
  }, []);

  // Theme application to root document
  useEffect(() => {
    const root = document.documentElement;
    if (state.profile.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.profile.theme]);

  // First time visitor prompt: if onboarding not completed, trigger wizard
  useEffect(() => {
    if (!state.profile.onboardingCompleted && state.transactions.length === 0) {
      setIsOnboardingOpen(true);
    }
  }, []);

  const handleUpdateState = (newState: FinancialState) => {
    stateRef.current = newState;
    setState(newState);
    saveFinancialState(newState);
  };

  const handleThemeToggle = () => {
    const nextTheme = state.profile.theme === 'dark' ? 'light' : 'dark';
    handleUpdateState({
      ...state,
      profile: { ...state.profile, theme: nextTheme },
    });
  };

  const handleCurrencyChange = async (targetCurrency: CurrencyCode) => {
    const sourceCurrency = stateRef.current.profile.currency;
    if (targetCurrency === sourceCurrency || isCurrencyChanging) return;

    setIsCurrencyChanging(true);
    setCurrencyNotice(null);
    try {
      const exchangeRates = await getExchangeRates(sourceCurrency);
      const rate = exchangeRates.rates[targetCurrency];
      if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
        throw new Error(`No exchange rate is available for ${targetCurrency}.`);
      }

      handleUpdateState(convertFinancialState(stateRef.current, targetCurrency, rate));
      setCurrencyNotice({
        message: `All amounts converted at 1 ${sourceCurrency} = ${rate.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${targetCurrency}. Rate updated ${new Date(exchangeRates.updatedAt).toLocaleString()}.`,
        error: false,
      });
    } catch (error) {
      setCurrencyNotice({
        message: error instanceof Error ? error.message : 'Currency conversion failed. No amounts were changed.',
        error: true,
      });
    } finally {
      setIsCurrencyChanging(false);
    }
  };

  // Transaction Actions
  const handleSaveTransaction = (tx: Transaction) => {
    let newState = state;
    if (editingTx) {
      // Revert old effect first, then apply new
      newState = revertTransactionEffects(newState, editingTx.id);
    }
    const finalState = applyTransactionEffects(newState, tx);
    handleUpdateState(finalState);
    setEditingTx(null);
  };

  const handleDeleteTransaction = (id: string) => {
    const finalState = revertTransactionEffects(state, id);
    handleUpdateState(finalState);
  };

  const handleImportCSVTransactions = (importedTransactions: Transaction[]) => {
    let curState = state;
    importedTransactions.forEach((tx) => {
      curState = applyTransactionEffects(curState, tx);
    });
    handleUpdateState(curState);
  };

  // Category budget action
  const handleUpdateCategoryBudget = (catId: string, newBudget: number) => {
    const updatedCategories = state.categories.map((c) =>
      c.id === catId ? { ...c, monthlyBudget: newBudget } : c
    );
    handleUpdateState({ ...state, categories: updatedCategories });
  };

  const handleAddCustomCategory = (cat: ExpenseCategory) => {
    handleUpdateState({
      ...state,
      categories: [...state.categories, cat],
    });
  };

  // Assets & Liabilities Actions
  const handleAddAsset = (asset: Asset) => {
    handleUpdateState({
      ...state,
      assets: [asset, ...state.assets],
    });
  };

  const handleDeleteAsset = (id: string) => {
    handleUpdateState({
      ...state,
      assets: state.assets.filter((a) => a.id !== id),
    });
  };

  const handleAddLiability = (liab: Liability) => {
    handleUpdateState({
      ...state,
      liabilities: [liab, ...state.liabilities],
    });
  };

  const handleDeleteLiability = (id: string) => {
    handleUpdateState({
      ...state,
      liabilities: state.liabilities.filter((l) => l.id !== id),
    });
  };

  const handleAddCreditCard = (cc: CreditCardType) => {
    handleUpdateState({
      ...state,
      creditCards: [cc, ...state.creditCards],
    });
  };

  const handleDeleteCreditCard = (id: string) => {
    handleUpdateState({
      ...state,
      creditCards: state.creditCards.filter((c) => c.id !== id),
    });
  };

  // Calendar Event Actions
  const handleAddCalendarEvent = (event: CalendarEvent) => {
    handleUpdateState({
      ...state,
      calendarEvents: [event, ...state.calendarEvents],
    });
  };

  const handleDeleteCalendarEvent = (id: string) => {
    handleUpdateState({
      ...state,
      calendarEvents: state.calendarEvents.filter((e) => e.id !== id),
    });
  };

  const handleToggleEventPaid = (id: string) => {
    const updated = state.calendarEvents.map((e) =>
      e.id === id ? { ...e, isPaid: !e.isPaid } : e
    );
    handleUpdateState({ ...state, calendarEvents: updated });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        displayName={state.profile.displayName}
        currency={state.profile.currency}
        onCurrencyChange={handleCurrencyChange}
        isCurrencyChanging={isCurrencyChanging}
        theme={state.profile.theme}
        onThemeToggle={handleThemeToggle}
        onOpenAddTransaction={() => {
          setEditingTx(null);
          setIsTxModalOpen(true);
        }}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        mobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        totalBalance={summary.totalAvailableBalance}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          summary={summary}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 max-w-7xl mx-auto w-full">
          {currencyNotice && (
            <div
              role={currencyNotice.error ? 'alert' : 'status'}
              className={`mb-4 rounded-lg border px-3 py-2 text-xs ${
                currencyNotice.error
                  ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
              }`}
            >
              {currencyNotice.message}
            </div>
          )}
          {currentTab === 'dashboard' && (
            <DashboardView
              state={state}
              summary={summary}
              onNavigate={setCurrentTab}
              onOpenAddTransaction={() => {
                setEditingTx(null);
                setIsTxModalOpen(true);
              }}
              onLoadDemoData={() => handleUpdateState(resetToDemoState())}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionsView
              state={state}
              onOpenAddModal={() => {
                setEditingTx(null);
                setIsTxModalOpen(true);
              }}
              onOpenEditModal={(tx) => {
                setEditingTx(tx);
                setIsTxModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenImportModal={() => setIsCSVImportOpen(true)}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView state={state} summary={summary} />
          )}

          {currentTab === 'predictions' && (
            <PredictionsView state={state} summary={summary} />
          )}

          {currentTab === 'simulator' && (
            <SimulatorView state={state} summary={summary} />
          )}

          {currentTab === 'budget' && (
            <BudgetView
              state={state}
              onUpdateCategoryBudget={handleUpdateCategoryBudget}
              onAddCustomCategory={handleAddCustomCategory}
            />
          )}

          {currentTab === 'networth' && (
            <NetWorthView
              state={state}
              summary={summary}
              onAddAsset={handleAddAsset}
              onDeleteAsset={handleDeleteAsset}
              onAddLiability={handleAddLiability}
              onDeleteLiability={handleDeleteLiability}
              onAddCreditCard={handleAddCreditCard}
              onDeleteCreditCard={handleDeleteCreditCard}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarView
              state={state}
              onAddEvent={handleAddCalendarEvent}
              onDeleteEvent={handleDeleteCalendarEvent}
              onTogglePaid={handleToggleEventPaid}
            />
          )}

          {currentTab === 'calculators' && (
            <CalculatorsView currency={state.profile.currency} />
          )}

          {currentTab === 'copilot' && (
            <CopilotView state={state} summary={summary} />
          )}

          {currentTab === 'education' && <EducationView />}

          {currentTab === 'settings' && (
            <SettingsView
              state={state}
              onUpdateState={handleUpdateState}
              onCurrencyChange={handleCurrencyChange}
              isCurrencyChanging={isCurrencyChanging}
              currencyStatus={currencyNotice?.message}
              onLoadDemoData={() => handleUpdateState(resetToDemoState())}
              onResetData={() => handleUpdateState(resetToEmptyState())}
              onOpenImportCSV={() => setIsCSVImportOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Transaction Add / Edit Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTransaction}
        state={state}
        editingTransaction={editingTx}
      />

      {/* Onboarding Wizard Modal */}
      <OnboardingWizard
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        state={state}
        onSaveState={handleUpdateState}
      />

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isCSVImportOpen}
        onClose={() => setIsCSVImportOpen(false)}
        state={state}
        onImportConfirmed={handleImportCSVTransactions}
      />
    </div>
  );
}
