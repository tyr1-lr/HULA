import type { Num, Range } from '@/api/types';

// Dates are written by hand (not toLocaleString) so they look the same on every phone.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parse(iso: string): Date | null {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatTime(iso: string): string {
  const d = parse(iso);
  if (!d) return '—';
  const h = d.getHours();
  return `${h % 12 === 0 ? 12 : h % 12}:${String(d.getMinutes()).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

export function formatDate(iso: string): string {
  const d = parse(iso);
  return d ? `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}` : '—';
}

export function formatDateTime(iso: string): string {
  return parse(iso) ? `${formatDate(iso)} · ${formatTime(iso)}` : '—';
}

export function minutesSince(iso: string): number {
  const d = parse(iso);
  return d ? Math.max(0, Math.round((Date.now() - d.getTime()) / 60_000)) : Infinity;
}

export function timeAgo(iso: string): string {
  const m = minutesSince(iso);
  if (m === Infinity) return 'a while ago';
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ${h === 1 ? 'hour' : 'hours'} ago`;
  const d = Math.floor(h / 24);
  return `${d} ${d === 1 ? 'day' : 'days'} ago`;
}

// A missing sensor value prints as "—", never as 0.
export function fmt(v: Num | undefined, digits = 1): string {
  return v === null || v === undefined ? '—' : v.toFixed(digits);
}

export function withUnit(v: Num | undefined, digits: number, unit: string): string {
  return v === null || v === undefined ? '—' : `${v.toFixed(digits)}${unit}`;
}

// "↑ 0.3", "↓ 2", "→ 0"; empty string when there is nothing to compare.
export function deltaText(v: Num | undefined, digits = 0): string {
  if (v === null || v === undefined) return '';
  const abs = Math.abs(v).toFixed(digits);
  return `${v > 0 ? '↑' : v < 0 ? '↓' : '→'} ${abs}`;
}

// Picks evenly spaced timestamps from a chart's data to label the x axis.
export function axisLabels(times: string[], range: Range): string[] {
  if (times.length === 0) return [];
  const count = Math.min(times.length, range === '24h' ? 5 : 4);
  return Array.from({ length: count }, (_, i) => {
    const iso = times[count === 1 ? 0 : Math.round((i * (times.length - 1)) / (count - 1))];
    const d = parse(iso);
    if (!d) return '';
    if (range === '24h') {
      const h = d.getHours();
      return `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? 'AM' : 'PM'}`;
    }
    return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  });
}
