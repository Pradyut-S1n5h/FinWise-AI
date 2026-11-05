import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  User,
  ArrowRight,
  TrendingUp,
  HelpCircle,
} from 'lucide-react';
import { FinancialState, FinancialSummary } from '../../types/finance';
import { askFinancialCopilot, ChatMessage } from '../../services/copilotService';
import { formatCurrency } from '../../utils/formatters';

interface CopilotViewProps {
  state: FinancialState;
  summary: FinancialSummary;
}

const STARTER_PROMPTS = [
  'How much did I spend this month and what was my top category?',
  'Am I on track with my monthly budget and 50/30/20 allocation?',
  'How long until I hit my emergency fund savings goal?',
  'What happens to my wealth if I save ₹2,000 more each month?',
  'Explain my financial health score and areas to improve.',
];

export const CopilotView: React.FC<CopilotViewProps> = ({ state, summary }) => {
  const cur = state.profile.currency;
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content: `Hello ${state.profile.displayName || 'there'}! I'm **FinWise Copilot**, your personal financial reasoning assistant.

I analyze your actual manual ledger, cash flow, and savings goals to give mathematically grounded financial coaching. You can ask me about your spending breakdown, budget adherence, or milestone forecasts!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'local_engine',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askFinancialCopilot(query, state, messages);
      const assistantMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: response.source,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `ai_err_${Date.now()}`,
        role: 'assistant',
        content: `I analyzed your metrics: Your liquid cash is ${formatCurrency(summary.totalAvailableBalance, cur)} with a monthly surplus of ${formatCurrency(summary.monthlySavings, cur)}. Keep tracking your daily records!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'local_engine',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `msg_welcome_${Date.now()}`,
        role: 'assistant',
        content: `Chat history refreshed. How can I help you analyze your finances today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'local_engine',
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      {/* Copilot Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-3.5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-xs">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                FinWise AI Copilot
              </h2>
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <ShieldCheck className="h-2.5 w-2.5" /> Private Grounding
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Grounded on your actual ledger figures • Works with server Gemini & offline engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowContext(!showContext)}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {showContext ? 'Hide Ledger Context' : 'View Context'}
          </button>
          <button
            onClick={handleClearHistory}
            title="Clear Chat"
            className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Context Inspection Drawer */}
      {showContext && (
        <div className="border-b border-slate-200 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-950/60 max-h-40 overflow-y-auto">
          <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">
            Aggregated Financial Context passed to Copilot:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600 dark:text-slate-400">
            <div>Liquid Balance: <b>{formatCurrency(summary.totalAvailableBalance, cur)}</b></div>
            <div>Monthly Net Flow: <b>{formatCurrency(summary.monthlySavings, cur)}</b></div>
            <div>Net Worth: <b>{formatCurrency(summary.netWorth, cur)}</b></div>
            <div>Health Score: <b>{summary.healthScore}/100</b></div>
            <div>Active Goals: <b>{state.goals.length}</b></div>
            <div>Liabilities: <b>{state.liabilities.length}</b></div>
            <div>Categories: <b>{state.categories.length}</b></div>
            <div>Ledger Records: <b>{state.transactions.length}</b></div>
          </div>
        </div>
      )}

      {/* Chat Messages scroll area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                  isUser
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-50 text-slate-900 border border-slate-200/80 dark:bg-slate-800/80 dark:text-slate-100 dark:border-slate-700'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div
                  className={`mt-1.5 flex items-center justify-between text-[10px] ${
                    isUser ? 'text-emerald-200' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {!isUser && msg.source && (
                    <span className="font-medium">
                      {msg.source === 'gemini' ? 'Gemini 3.8 Flash' : 'FinWise Math Engine'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-500 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 animate-spin text-emerald-500" />
                <span>Analyzing financial ledger & computing response...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Prompts */}
      <div className="border-t border-slate-100 px-4 py-2 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            Suggested:
          </span>
          {STARTER_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-400 transition-all"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input box */}
      <div className="border-t border-slate-100 p-3 sm:p-4 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about your expenses, budgets, savings goals, or net worth..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs hover:bg-emerald-500 disabled:opacity-40 transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
