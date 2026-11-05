import React from 'react';
import {
  Sparkles,
  Plus,
  Moon,
  Sun,
  Menu,
  X,
  Compass,
  ShieldCheck,
} from 'lucide-react';
import { CurrencyCode, SUPPORTED_CURRENCIES, ThemeMode } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';

interface NavbarProps {
  displayName: string;
  currency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  theme: ThemeMode;
  onThemeToggle: () => void;
  onOpenAddTransaction: () => void;
  onOpenOnboarding: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  totalBalance: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  displayName,
  currency,
  onCurrencyChange,
  theme,
  onThemeToggle,
  onOpenAddTransaction,
  onOpenOnboarding,
  mobileMenuOpen,
  onToggleMobileMenu,
  totalBalance,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 sm:px-6">
      {/* Left: Branding & Mobile toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          aria-label="Toggle Menu"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-md shadow-emerald-600/20 text-white font-bold text-base">
            FW
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-lg">
                FinWise
              </span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-700/40">
                <Sparkles className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                AI
              </span>
            </div>
            <span className="hidden sm:inline-block text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Personal Wealth & Forecasting
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Quick Balance Preview */}
      <div className="hidden md:flex items-center gap-3 rounded-full border border-slate-200/80 bg-slate-50/80 px-3.5 py-1.5 dark:border-slate-800 dark:bg-slate-800/60">
        <span className="text-xs text-slate-500 dark:text-slate-400">Available Liquid:</span>
        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 tracking-tight">
          {formatCurrency(totalBalance, currency)}
        </span>
        <span className="h-3 w-px bg-slate-300 dark:bg-slate-700" />
        <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
          <ShieldCheck className="h-3 w-3" /> Manual & Private
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Currency Selector */}
        <select
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
          aria-label="Currency"
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          {Object.values(SUPPORTED_CURRENCIES).map((c) => (
            <option key={c.code} value={c.code}>
              {c.symbol} ({c.code})
            </option>
          ))}
        </select>

        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-xs hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Onboarding Wizard button */}
        <button
          onClick={onOpenOnboarding}
          title="Onboarding Setup Guide"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <Compass className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Setup Guide</span>
        </button>

        {/* Quick Add Transaction Button */}
        <button
          onClick={onOpenAddTransaction}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 active:scale-95 transition-all dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 font-medium"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Add Record</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
    </header>
  );
};
