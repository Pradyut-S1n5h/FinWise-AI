import React, { useState, useEffect } from 'react';
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
  KeyRound,
} from 'lucide-react';
import {
  CurrencyCode,
  FinancialState,
  SUPPORTED_CURRENCIES,
  ThemeMode,
} from '../../types/finance';
import { exportStateAsJSON, importStateFromJSON } from '../../services/storage';
import {
  clearGeminiApiKey,
  getGeminiApiKey,
  saveGeminiApiKey,
  testGeminiApiKey,
} from '../../services/copilotService';
import { downloadFile } from '../../services/csvService';

interface SettingsViewProps {
  state: FinancialState;
  onUpdateState: (newState: FinancialState) => void;
  onCurrencyChange: (currency: CurrencyCode) => Promise<void>;
  isCurrencyChanging: boolean;
  currencyStatus?: string;
  onLoadDemoData: () => void;
  onResetData: () => void;
  onOpenImportCSV: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  state,
  onUpdateState,
  onCurrencyChange,
  isCurrencyChanging,
  currencyStatus,
  onLoadDemoData,
  onResetData,
  onOpenImportCSV,
}) => {
  const [displayName, setDisplayName] = useState(state.profile.displayName);
  const [expectedIncome, setExpectedIncome] = useState(state.profile.monthlyIncomeExpected.toString());
  const [emergencyMonths, setEmergencyMonths] = useState(
    (state.profile.emergencyFundTargetMonths || 6).toString()
  );
  const [theme, setTheme] = useState<ThemeMode>(state.profile.theme || 'dark');
  const [statusMsg, setStatusMsg] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(() => getGeminiApiKey());
  const [geminiKeyStatus, setGeminiKeyStatus] = useState('');
  const [isTestingGeminiKey, setIsTestingGeminiKey] = useState(false);

  useEffect(() => {
    setExpectedIncome(state.profile.monthlyIncomeExpected.toString());
  }, [state.profile.currency, state.profile.monthlyIncomeExpected]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: FinancialState = {
      ...state,
      profile: {
        ...state.profile,
        displayName: displayName.trim() || 'FinWise User',
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

  const handleSaveGeminiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!geminiApiKey.trim()) {
      setGeminiKeyStatus('Enter a Gemini API key before saving.');
      return;
    }
    try {
      saveGeminiApiKey(geminiApiKey);
      setGeminiKeyStatus('Gemini API key saved in this browser.');
    } catch {
      setGeminiKeyStatus('Could not save the key in browser storage.');
    }
  };

  const handleClearGeminiKey = () => {
    try {
      clearGeminiApiKey();
      setGeminiApiKey('');
      setGeminiKeyStatus('Gemini API key removed from this browser.');
    } catch {
      setGeminiKeyStatus('Could not remove the key from browser storage.');
    }
  };

  const handleTestGeminiKey = async () => {
    setIsTestingGeminiKey(true);
    setGeminiKeyStatus(geminiApiKey.trim() ? 'Checking Gemini API key…' : 'Checking the server Gemini configuration…');
    try {
      const model = await testGeminiApiKey(geminiApiKey);
      setGeminiKeyStatus(geminiApiKey.trim()
        ? `${model} is reachable. Save the key to use it in Copilot.`
        : `${model} is reachable using the server configuration.`);
    } catch (error) {
      setGeminiKeyStatus(error instanceof Error ? error.message : 'Gemini key test failed.');
    } finally {
      setIsTestingGeminiKey(false);
    }
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

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <KeyRound className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Gemini AI Configuration
        </h2>
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          Recommended: configure GEMINI_API_KEY in the server environment or Codespaces secrets. You can also save a key in this browser; it is sent to this app’s server and anyone with access to this browser profile may be able to access it. Your financial data remains in this browser, and the context you ask about is sent to Google Gemini when you chat.
        </p>
        <form onSubmit={handleSaveGeminiKey} className="flex flex-col gap-2 sm:flex-row">
          <input
            type="password"
            autoComplete="new-password"
            value={geminiApiKey}
            onChange={(e) => setGeminiApiKey(e.target.value)}
            placeholder="Paste your Gemini API key"
            aria-label="Gemini API key"
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
          >
            Save Key
          </button>
          <button
            type="button"
            onClick={() => void handleTestGeminiKey()}
            disabled={isTestingGeminiKey}
            className="rounded-lg border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 disabled:opacity-60 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950"
          >
            {isTestingGeminiKey ? 'Testing…' : 'Test Connection'}
          </button>
          <button
            type="button"
            onClick={handleClearGeminiKey}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Clear
          </button>
        </form>
        <p role="status" className="min-h-4 text-[11px] text-slate-500 dark:text-slate-400">
          {geminiKeyStatus || (getGeminiApiKey() ? 'A Gemini API key is saved in this browser.' : 'No browser key is saved. The server may provide GEMINI_API_KEY; test the connection to check.')}
        </p>
      </section>

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
                Convert All Financial Records
              </label>
              <select
                value={state.profile.currency}
                disabled={isCurrencyChanging}
                onChange={(e) => void onCurrencyChange(e.target.value as CurrencyCode)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                {currencyStatus || 'Uses daily reference exchange rates. All saved amounts are converted; your bank may use different rates and fees.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Expected Baseline Monthly Income ({state.profile.currency})
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
          <li>Financial records stay in this browser. When you use Gemini, the relevant financial context and chat message are sent to Google; the app server does not save them or your API key.</li>
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
