import { CurrencyCode, SUPPORTED_CURRENCIES } from '../types/finance';

export function formatCurrency(amount: number, currencyCode: CurrencyCode = 'INR'): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    amount = 0;
  }

  const config = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.INR;

  try {
    // Specialized Indian Rupee Lakhs/Crores formatting for INR
    if (currencyCode === 'INR') {
      const isNegative = amount < 0;
      const absAmount = Math.abs(Math.round(amount));
      const formatted = new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0,
      }).format(absAmount);
      return `${isNegative ? '-' : ''}₹${formatted}`;
    }

    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: config.decimalPlaces,
      maximumFractionDigits: config.decimalPlaces,
    }).format(amount);
  } catch (_e) {
    return `${config.symbol}${amount.toLocaleString()}`;
  }
}

export function formatCompactCurrency(amount: number, currencyCode: CurrencyCode = 'INR'): string {
  const config = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.INR;
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (currencyCode === 'INR') {
    if (abs >= 10000000) {
      return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
    }
    if (abs >= 100000) {
      return `${sign}₹${(abs / 100000).toFixed(2)} L`;
    }
    if (abs >= 1000) {
      return `${sign}₹${(abs / 1000).toFixed(1)}k`;
    }
    return `${sign}₹${abs}`;
  }

  if (abs >= 1000000000) {
    return `${sign}${config.symbol}${(abs / 1000000000).toFixed(1)}B`;
  }
  if (abs >= 1000000) {
    return `${sign}${config.symbol}${(abs / 1000000).toFixed(1)}M`;
  }
  if (abs >= 1000) {
    return `${sign}${config.symbol}${(abs / 1000).toFixed(1)}k`;
  }
  return `${sign}${config.symbol}${abs}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatPercent(rate: number): string {
  if (isNaN(rate)) return '0.0%';
  return `${rate >= 0 ? '' : ''}${rate.toFixed(1)}%`;
}

export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}
