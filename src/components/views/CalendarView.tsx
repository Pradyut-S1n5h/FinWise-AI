import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Tag,
} from 'lucide-react';
import { FinancialState, CalendarEvent } from '../../types/finance';
import { formatCurrency, formatDate, generateId } from '../../utils/formatters';

interface CalendarViewProps {
  state: FinancialState;
  onAddEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  onTogglePaid: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  state,
  onAddEvent,
  onDeleteEvent,
  onTogglePaid,
}) => {
  const cur = state.profile.currency;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);

  // New Event Form
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10));
  const [eventAmount, setEventAmount] = useState('');
  const [eventType, setEventType] = useState<CalendarEvent['type']>('bill');
  const [eventRecurring, setEventRecurring] = useState<CalendarEvent['recurring']>('monthly');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const newEv: CalendarEvent = {
      id: generateId('ev'),
      title: eventTitle.trim(),
      date: eventDate,
      amount: parseFloat(eventAmount) || 0,
      type: eventType,
      recurring: eventRecurring,
      isPaid: false,
    };

    onAddEvent(newEv);
    setEventTitle('');
    setEventAmount('');
    setShowAddModal(false);
  };

  // Group events by day of this month
  const eventsByDay: Record<number, CalendarEvent[]> = {};

  state.calendarEvents.forEach((ev) => {
    const d = new Date(ev.date);
    if (ev.recurring === 'monthly') {
      const dayOfMonth = d.getDate();
      if (!eventsByDay[dayOfMonth]) eventsByDay[dayOfMonth] = [];
      eventsByDay[dayOfMonth].push(ev);
    } else if (d.getFullYear() === year && d.getMonth() === month) {
      const dayOfMonth = d.getDate();
      if (!eventsByDay[dayOfMonth]) eventsByDay[dayOfMonth] = [];
      eventsByDay[dayOfMonth].push(ev);
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Financial Calendar & Schedule
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track income paydays, bills, EMIs, and savings milestones in one calendar view
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 text-xs dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={handlePrevMonth}
              className="p-1 text-slate-600 hover:text-slate-900 dark:text-slate-400"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 font-bold text-slate-800 dark:text-slate-200">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 text-slate-600 hover:text-slate-900 dark:text-slate-400"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500"
          >
            <Plus className="h-3.5 w-3.5" /> Add Event
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 py-2.5">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-24 bg-slate-50/40 p-2 dark:bg-slate-950/20" />
          ))}

          {/* Days of month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayEvents = eventsByDay[dayNum] || [];
            const isToday =
              new Date().getFullYear() === year &&
              new Date().getMonth() === month &&
              new Date().getDate() === dayNum;

            return (
              <div
                key={`day-${dayNum}`}
                className={`min-h-24 p-2 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30 ${
                  isToday ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold ${
                      isToday
                        ? 'flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {dayNum}
                  </span>
                </div>

                <div className="space-y-1">
                  {dayEvents.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => onTogglePaid(ev.id)}
                      title={`${ev.title}: ${formatCurrency(ev.amount, cur)} (Click to toggle paid)`}
                      className={`cursor-pointer rounded px-1.5 py-0.5 text-[10px] font-semibold truncate transition-all ${
                        ev.isPaid
                          ? 'bg-slate-100 text-slate-400 line-through dark:bg-slate-800'
                          : ev.type === 'income'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : ev.type === 'emi'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {ev.title} • {formatCurrency(ev.amount, cur)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Events List for Quick Management */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Manage All Financial Obligations ({state.calendarEvents.length})
        </h2>

        {state.calendarEvents.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {state.calendarEvents.map((ev) => (
              <div key={ev.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onTogglePaid(ev.id)}
                    className={`h-4 w-4 rounded flex items-center justify-center border transition-all ${
                      ev.isPaid
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-300 hover:border-slate-500 dark:border-slate-600'
                    }`}
                  >
                    {ev.isPaid && <CheckCircle className="h-3 w-3 stroke-[3]" />}
                  </button>
                  <div>
                    <span
                      className={`font-semibold ${
                        ev.isPaid ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {ev.title}
                    </span>
                    <span className="ml-2 text-[10px] text-slate-400">
                      Date: {formatDate(ev.date)} {ev.recurring !== 'none' ? `(${ev.recurring})` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`font-bold ${
                      ev.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {ev.type === 'income' ? '+' : '-'}
                    {formatCurrency(ev.amount, cur)}
                  </span>
                  <button
                    onClick={() => onDeleteEvent(ev.id)}
                    className="p-1 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No calendar items recorded.</p>
        )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Schedule Financial Event
            </h3>
            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WiFi Bill, Laptop EMI, Salary Inflow"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount ({cur}) *
                  </label>
                  <input
                    type="number"
                    required
                    value={eventAmount}
                    onChange={(e) => setEventAmount(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Type
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="bill">Bill Payment</option>
                    <option value="emi">Loan EMI</option>
                    <option value="income">Income Payday</option>
                    <option value="goal">Goal Deposit</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Frequency
                  </label>
                  <select
                    value={eventRecurring}
                    onChange={(e) => setEventRecurring(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="none">One-time</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
