export type RangePreset = '1h' | '12h' | '24h' | '7d' | '30d' | 'custom';

export interface TimeRange {
  from: Date;
  to: Date;
}

export const RANGE_PRESETS: { id: RangePreset; label: string }[] = [
  { id: '1h', label: '1 ч' },
  { id: '12h', label: '12 ч' },
  { id: '24h', label: 'Сутки' },
  { id: '7d', label: 'Неделя' },
  { id: '30d', label: 'Месяц' },
];

const PRESET_MS: Record<Exclude<RangePreset, 'custom'>, number> = {
  '1h': 60 * 60 * 1000,
  '12h': 12 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

export function getRangeForPreset(preset: Exclude<RangePreset, 'custom'>, now = new Date()): TimeRange {
  return {
    from: new Date(now.getTime() - PRESET_MS[preset]),
    to: now,
  };
}

export function toApiTimestamp(date: Date): string {
  return date.toISOString();
}

export function toDatetimeLocalValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatChartTime(timestamp: number, rangeMs: number): string {
  const date = new Date(timestamp * 1000);

  if (rangeMs <= 2 * 60 * 60 * 1000) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  if (rangeMs <= 2 * 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function formatRangeLabel(from: Date, to: Date): string {
  return `${from.toLocaleString()} — ${to.toLocaleString()}`;
}
