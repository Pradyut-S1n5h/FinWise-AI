import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Database,
  Moon,
  Sun,
  Check,
  AlertTriangle,
} from 'lucide-react';
import {
  CurrencyCode,
  FinancialState,
  SUPPORTED_CURRENCIES,
  ThemeMode,
} from '../../types/finance';
import { exportStateAsJSON, importStateFromJSON } from '../../services/storage';
import { downloadFile } from '../../services/csvService';

interface SettingsViewProps {
  state: FinancialState;
  onUpdateState: (newState: FinancialState) => void;
  onLoadDemoData: () => void;
  onResetData: () => void;
  onOpenImportCSV: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  state,
  onUpdateState,
  onLoadDemoData,
  onResetData,
  onOpenImportCSV,
}) => {
  const [displayName, setDisplayName] = useState(state.profile.displayName);
  const [currency, setCurrency] = useState<CurrencyCode>(state.profile.currency);
  const [expectedIncome, setExpectedIncome] = useState(state.profile.monthlyIncomeExpected.toString());
  const [emergencyMonths, setEmergencyMonths] = useState(
    (state.profile.emergencyFundTargetMonths || 6).toString()
  );
  const [theme, setTheme] = useState<ThemeMode>(state.profile.theme || 'dark');
  const [statusMsg, setStatusMsg] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: FinancialState = {
      ...state,
      profile: {
        ...state.profile,
        displayName: displayName.trim() || 'FinWise User',
        currency,
        monthlyIncomeExpected: parseFloat(expectedIncome) || 45000,
        emergencyFundTargetMonths: parseInt(emergencyMonths) || 6,
        theme,
      },
    };
    onUpdateState(updated);
    setStatusMsg('Profile settings saved successfully!');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleExportBackup = () => {
    const jsonStr = exportStateAsJSON(state);
    downloadFile(
      jsonStr,
      `finwise-backup-${new Date().toISOString().slice(0, 10)}.json`,
      'application/json'
    );
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = importStateFromJSON(content);
        onUpdateState(imported);
        setStatusMsg('Backup restored successfully!');
        setTimeout(() => setStatusMsg(''), 3000);
      } catch (err: any) {
        alert(`Failed to restore backup: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* View Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Application Settings & Data Governance
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your personal preferences, preferred currency, AI configuration, and complete data portability
        </p>
      </div>

      {statusMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300">
          <Check className="h-4 w-4" /> {statusMsg}
        </div>
      )}

      {/* 1. Profile & Preferences */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Personal Financial Profile
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Display Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Expected Baseline Monthly Income ({currency})
              </label>
              <input
                type="number"
                value={expectedIncome}
                onChange={(e) => setExpectedIncome(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Emergency Fund Runway Target (Months)
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={emergencyMonths}
                onChange={(e) => setEmergencyMonths(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* 2. Privacy & Security Notice */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Privacy & Local-First Philosophy
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          FinWise AI is designed around complete financial privacy:
        </p>
        <ul className="text-xs text-slate-500 dark:text-slate-400 list-disc list-inside space-y-1">
          <li>All account balances, transactions, and liabilities are stored locally in your browser storage.</li>
          <li>No integration with banking credentials, UPI PINs, CVV codes, or external payment gateways.</li>
          <li>The AI Copilot communicates via a server-side proxy without saving your personal financial records to any third-party marketing databases.</li>
          <li>You retain 100% data portability via JSON backup files and CSV exports.</li>
        </ul>
      </div>

      {/* 3. Data Backup, Export & Portability */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Data Portability & Backups
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* JSON Full Backup Export */}
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Complete JSON Backup
            </h3>
            <p className="text-[11px] text-slate-400">
              Download your entire state (ledger, assets, categories, goals) as an encrypted/portable JSON file.
            </p>
            <button
              onClick={handleExportBackup}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Download className="h-3.5 w-3.5" /> Export JSON
            </button>
          </div>

          {/* JSON Restore */}
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Restore JSON Backup
            </h3>
            <p className="text-[11px] text-slate-400">
              Restore a previously exported FinWise JSON backup to seamlessly transfer devices.
            </p>
            <label className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <Upload className="h-3.5 w-3.5" /> Restore File
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>

          {/* CSV Transactions Import */}
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              CSV Transaction Importer
            </h3>
            <p className="text-[11px] text-slate-400">
              Import bank or budget CSV statements with live column mapping and duplicate filtering.
            </p>
            <button
              onClick={onOpenImportCSV}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Upload className="h-3.5 w-3.5" /> Launch CSV Wizard
            </button>
          </div>
        </div>
      </div>

      {/* 4. Demo Data & Reset Actions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <RotateCcw className="h-4 w-4 text-slate-500" /> Ledger Environment Tools
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Load Realistic Student & Youth Demo Dataset
            </h3>
            <p className="text-[11px] text-slate-400">
              Loads 19 realistic multi-month transactions, index funds, student laptop EMI, and emergency goals.
            </p>
          </div>
          <button
            onClick={onLoadDemoData}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5" /> Load Demo Data
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-xs font-bold text-red-600 dark:text-red-400">
              Reset Application & Clear All Records
            </h3>
            <p className="text-[11px] text-slate-400">
              Permanently clears all stored transactions, accounts, and profile data from local storage.
            </p>
          </div>

          {showResetConfirm ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="rounded-lg px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetData();
                  setShowResetConfirm(false);
                }}
                className="rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-500"
              >
                Confirm Reset
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-300 shrink-0"
            >
              <AlertTriangle className="h-3.5 w-3.5" /> Reset All Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
