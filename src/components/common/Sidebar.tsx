import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  TrendingUp,
  Sliders,
  Wallet,
  Landmark,
  Calendar,
  Calculator,
  Bot,
  BookOpen,
  Settings,
  HeartPulse,
  Sparkles,
} from 'lucide-react';
import { FinancialSummary } from '../../types/finance';

export type TabKey =
  | 'dashboard'
  | 'transactions'
  | 'analytics'
  | 'predictions'
  | 'simulator'
  | 'budget'
  | 'networth'
  | 'calendar'
  | 'calculators'
  | 'copilot'
  | 'education'
  | 'settings';

interface SidebarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  summary: FinancialSummary;
}

interface NavItemConfig {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_GROUPS: { label: string; items: NavItemConfig[] }[] = [
  {
    label: 'Core Financials',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { key: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
      { key: 'analytics', label: 'Analytics', icon: BarChart3 },
      { key: 'budget', label: 'Budget & Limits', icon: Wallet },
      { key: 'networth', label: 'Net Worth & Assets', icon: Landmark },
      { key: 'calendar', label: 'Financial Calendar', icon: Calendar },
    ],
  },
  {
    label: 'Forecasting & Tools',
    items: [
      { key: 'predictions', label: 'Prediction Engine', icon: TrendingUp, badge: 'Math' },
      { key: 'simulator', label: 'What-If Simulator', icon: Sliders, badge: 'Sandbox' },
      { key: 'calculators', label: 'Instant Calculators', icon: Calculator, badge: '14' },
    ],
  },
  {
    label: 'Intelligence & Learning',
    items: [
      { key: 'copilot', label: 'AI Copilot', icon: Bot, badge: 'AI' },
      { key: 'education', label: 'Learning Centre', icon: BookOpen },
      { key: 'settings', label: 'Settings & Data', icon: Settings },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  summary,
}) => {
  const handleNavClick = (key: TabKey) => {
    onSelectTab(key);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation items scroll area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.label}
              </div>
              <div className="space-y-0.5 pt-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleNavClick(item.key)}
                      className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`h-4 w-4 transition-colors ${
                            isActive
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                            isActive
                              ? 'bg-emerald-200/80 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Health status score widget at bottom */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <HeartPulse className="h-3.5 w-3.5 text-emerald-500" />
                Financial Health
              </span>
              <span
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                  summary.healthScore >= 80
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : summary.healthScore >= 60
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {summary.healthScore}/100
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  summary.healthScore >= 80
                    ? 'bg-emerald-500'
                    : summary.healthScore >= 60
                    ? 'bg-blue-500'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${summary.healthScore}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400">
              <span>Status: {summary.healthStatus}</span>
              <button
                onClick={() => handleNavClick('copilot')}
                className="text-emerald-600 hover:underline dark:text-emerald-400 flex items-center gap-0.5 font-medium"
              >
                <Sparkles className="h-2.5 w-2.5" /> Ask AI
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
