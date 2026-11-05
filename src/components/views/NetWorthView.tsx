import React, { useState } from 'react';
import {
  Landmark,
  Scale,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import {
  FinancialState,
  FinancialSummary,
  Asset,
  Liability,
  CreditCard as CreditCardType,
} from '../../types/finance';
import { formatCurrency, formatDate, generateId } from '../../utils/formatters';

interface NetWorthViewProps {
  state: FinancialState;
  summary: FinancialSummary;
  onAddAsset: (asset: Asset) => void;
  onDeleteAsset: (id: string) => void;
  onAddLiability: (liab: Liability) => void;
  onDeleteLiability: (id: string) => void;
  onAddCreditCard: (cc: CreditCardType) => void;
  onDeleteCreditCard: (id: string) => void;
}

export const NetWorthView: React.FC<NetWorthViewProps> = ({
  state,
  summary,
  onAddAsset,
  onDeleteAsset,
  onAddLiability,
  onDeleteLiability,
  onAddCreditCard,
  onDeleteCreditCard,
}) => {
  const cur = state.profile.currency;
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showLiabilityModal, setShowLiabilityModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);

  // New Asset form
  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState<Asset['type']>('mutual_fund');
  const [assetCost, setAssetCost] = useState('');
  const [assetValuation, setAssetValuation] = useState('');

  // New Liability form
  const [liabName, setLiabName] = useState('');
  const [liabBalance, setLiabBalance] = useState('');
  const [liabEMI, setLiabEMI] = useState('');
  const [liabRate, setLiabRate] = useState('');

  // New Credit Card form
  const [ccName, setCCName] = useState('');
  const [ccLimit, setCCLimit] = useState('');
  const [ccBalance, setCCBalance] = useState('');
  const [ccDueDay, setCCDueDay] = useState('15');

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim()) return;
    const cost = parseFloat(assetCost) || 0;
    const val = parseFloat(assetValuation) || cost;

    const newAsset: Asset = {
      id: generateId('asset'),
      name: assetName.trim(),
      type: assetType,
      purchasePrice: cost,
      purchaseDate: new Date().toISOString().slice(0, 10),
      manualValuation: val,
      lastValuationDate: new Date().toISOString().slice(0, 10),
    };

    onAddAsset(newAsset);
    setAssetName('');
    setAssetCost('');
    setAssetValuation('');
    setShowAssetModal(false);
  };

  const handleCreateLiability = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liabName.trim()) return;
    const bal = parseFloat(liabBalance) || 0;

    const newLiab: Liability = {
      id: generateId('liab'),
      name: liabName.trim(),
      type: 'personal_loan',
      originalAmount: bal,
      outstandingBalance: bal,
      interestRate: parseFloat(liabRate) || 0,
      monthlyRepayment: parseFloat(liabEMI) || 0,
      frequency: 'monthly',
      startDate: new Date().toISOString().slice(0, 10),
    };

    onAddLiability(newLiab);
    setLiabName('');
    setLiabBalance('');
    setLiabEMI('');
    setLiabRate('');
    setShowLiabilityModal(false);
  };

  const handleCreateCreditCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ccName.trim()) return;

    const newCC: CreditCardType = {
      id: generateId('cc'),
      name: ccName.trim(),
      creditLimit: parseFloat(ccLimit) || 0,
      outstandingBalance: parseFloat(ccBalance) || 0,
      minimumPayment: Math.round((parseFloat(ccBalance) || 0) * 0.05),
      paymentDueDate: parseInt(ccDueDay) || 15,
      interestRate: 36,
    };

    onAddCreditCard(newCC);
    setCCName('');
    setCCLimit('');
    setCCBalance('');
    setShowCreditModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Net Worth Banner */}
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-xl dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Personal Balance Sheet
            </span>
            <div className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight">
              {formatCurrency(summary.netWorth, cur)}
            </div>
            <p className="mt-1 text-xs text-slate-300">
              Net Worth = Total Assets ({formatCurrency(summary.totalAssetsValue, cur)}) − Total Liabilities ({formatCurrency(summary.totalLiabilitiesValue, cur)})
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowAssetModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500"
            >
              <Plus className="h-3.5 w-3.5" /> Add Asset
            </button>
            <button
              onClick={() => setShowLiabilityModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-500"
            >
              <Plus className="h-3.5 w-3.5" /> Add Loan
            </button>
            <button
              onClick={() => setShowCreditModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-600"
            >
              <Plus className="h-3.5 w-3.5" /> Add Credit Card
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Assets vs. Liabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ASSETS COLUMN */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Landmark className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Assets & Wealth Holdings
              </h2>
              <span className="text-xs text-slate-500">
                Total: {formatCurrency(summary.totalAssetsValue, cur)}
              </span>
            </div>
            <button
              onClick={() => setShowAssetModal(true)}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
            >
              + Add
            </button>
          </div>

          {/* Liquid Accounts Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Liquid Cash & Accounts
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(summary.totalAvailableBalance, cur)}
              </span>
            </div>
            <div className="divide-y divide-slate-100 text-xs text-slate-600 dark:divide-slate-800 dark:text-slate-400">
              {state.accounts.map((acc) => (
                <div key={acc.id} className="py-2 flex items-center justify-between">
                  <span>{acc.name} ({acc.type})</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(acc.balance, cur)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Manual Assets List */}
          <div className="space-y-2.5">
            {state.assets.map((asset) => {
              const val = Number(asset.manualValuation) || Number(asset.purchasePrice) || 0;
              const gain = val - (Number(asset.purchasePrice) || 0);
              const gainPct = asset.purchasePrice > 0 ? (gain / asset.purchasePrice) * 100 : 0;

              return (
                <div
                  key={asset.id}
                  className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {asset.name}
                      </span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300 capitalize">
                        {asset.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>Valuation manually entered</span>
                      {gain !== 0 && (
                        <span className={gain >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                          ({gain >= 0 ? '+' : ''}{formatCurrency(gain, cur)} • {gainPct.toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {formatCurrency(val, cur)}
                      </span>
                    </div>
                    <button
                      onClick={() => onDeleteAsset(asset.id)}
                      className="p-1 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {state.assets.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400 dark:border-slate-800">
                No investment assets recorded. Click "+ Add Asset" to add mutual funds, stocks, or FDs!
              </div>
            )}
          </div>
        </div>

        {/* LIABILITIES COLUMN */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Liabilities & Debt Obligations
              </h2>
              <span className="text-xs text-slate-500">
                Total: {formatCurrency(summary.totalLiabilitiesValue, cur)}
              </span>
            </div>
            <button
              onClick={() => setShowLiabilityModal(true)}
              className="text-xs font-semibold text-amber-600 hover:text-amber-500 dark:text-amber-400"
            >
              + Add
            </button>
          </div>

          {/* Loans List */}
          <div className="space-y-2.5">
            {state.liabilities.map((l) => (
              <div
                key={l.id}
                className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {l.name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    EMI: {formatCurrency(l.monthlyRepayment, cur)}/mo • {l.interestRate}% interest
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrency(l.outstandingBalance, cur)}
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteLiability(l.id)}
                    className="p-1 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Credit Cards */}
            {state.creditCards.map((cc) => (
              <div
                key={cc.id}
                className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-slate-500" />
                    {cc.name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Limit: {formatCurrency(cc.creditLimit, cur)} • Due Day {cc.paymentDueDate}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrency(cc.outstandingBalance, cur)}
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteCreditCard(cc.id)}
                    className="p-1 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {state.liabilities.length === 0 && state.creditCards.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400 dark:border-slate-800">
                No debts or liabilities recorded. You have a clean balance sheet!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Asset Modal */}
      {showAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Record Asset / Holding</h3>
            <form onSubmit={handleCreateAsset} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nifty 50 Index Fund, SBI Fixed Deposit"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Asset Type</label>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="mutual_fund">Mutual Fund</option>
                  <option value="fixed_deposit">Fixed Deposit</option>
                  <option value="stock">Stock</option>
                  <option value="gold">Gold</option>
                  <option value="other">Other Asset</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cost Price ({cur})</label>
                  <input
                    type="number"
                    value={assetCost}
                    onChange={(e) => setAssetCost(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Value ({cur})</label>
                  <input
                    type="number"
                    value={assetValuation}
                    onChange={(e) => setAssetValuation(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAssetModal(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liability Modal */}
      {showLiabilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Record Loan / Debt</h3>
            <form onSubmit={handleCreateLiability} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Loan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Student Laptop EMI, Education Loan"
                  value={liabName}
                  onChange={(e) => setLiabName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Outstanding ({cur})</label>
                  <input
                    type="number"
                    value={liabBalance}
                    onChange={(e) => setLiabBalance(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Monthly EMI ({cur})</label>
                  <input
                    type="number"
                    value={liabEMI}
                    onChange={(e) => setLiabEMI(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowLiabilityModal(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-500"
                >
                  Save Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credit Card Modal */}
      {showCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Record Credit Line</h3>
            <p className="text-[11px] text-slate-400">Strict Privacy: Never enter numbers, PINs, or CVVs.</p>
            <form onSubmit={handleCreateCreditCard} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Card Nickname</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Student Card, Bank Rewards"
                  value={ccName}
                  onChange={(e) => setCCName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Limit ({cur})</label>
                  <input
                    type="number"
                    value={ccLimit}
                    onChange={(e) => setCCLimit(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Balance ({cur})</label>
                  <input
                    type="number"
                    value={ccBalance}
                    onChange={(e) => setCCBalance(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreditModal(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
