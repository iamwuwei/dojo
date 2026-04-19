// Daily streak helpers. Dates are stored as ISO `YYYY-MM-DD` so we never
// have to think about timezones once the date is computed.

export interface DailyStreak {
  current: number;
  longest: number;
  totalDays: number;
  lastDate: string | null; // YYYY-MM-DD of the most recent practice day
  last30: string[]; // up to 30 most recent practice dates, newest first
}

export const EMPTY_STREAK: DailyStreak = {
  current: 0,
  longest: 0,
  totalDays: 0,
  lastDate: null,
  last30: [],
};

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + n);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

// Returns a new streak after recording a practice on `today`. Idempotent:
// calling twice on the same day doesn't double-count.
export function bumpStreak(prev: DailyStreak, today: string): DailyStreak {
  if (prev.lastDate === today) return prev;

  const isContinuation = prev.lastDate === addDays(today, -1);
  const current = isContinuation ? prev.current + 1 : 1;
  const last30 = [today, ...prev.last30.filter((d) => d !== today)].slice(0, 30);

  return {
    current,
    longest: Math.max(prev.longest, current),
    totalDays: prev.totalDays + 1,
    lastDate: today,
    last30,
  };
}

// Recompute the live streak as of `today`. If the user skipped a day,
// `current` becomes 0 (kept in DailyStreak via the next bumpStreak call).
// Used purely for display so the UI doesn't show "5 days" when the user
// already broke their streak yesterday.
export function liveCurrentStreak(streak: DailyStreak, today: string): number {
  if (!streak.lastDate) return 0;
  if (streak.lastDate === today) return streak.current;
  if (streak.lastDate === addDays(today, -1)) return streak.current;
  return 0;
}

// Returns the dates of the last 7 days, newest (today) first.
export function last7Dates(today: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(today, -i));
}

// Picks an encouragement line based on the live streak and how long the
// user has been away. `daysSinceLast` is null if there is no prior practice.
export function streakGreeting(
  currentStreak: number,
  daysSinceLast: number | null
): string {
  if (daysSinceLast === null) return "はじめまして！一緒に修行しよう！";
  if (currentStreak === 0) {
    if (daysSinceLast >= 7) return "ずっと待ってたよ…また一緒にやろう。";
    if (daysSinceLast >= 3) return `${daysSinceLast} 日も来てくれなかった…`;
    return "おかえり！また続けようね。";
  }
  if (currentStreak < 3) return "いいぞ、続けて！";
  if (currentStreak < 7) return `${currentStreak} 日連続！えらい！`;
  if (currentStreak < 30) return `${currentStreak} 日続いた！すごい！`;
  return `${currentStreak} 日！修行者だね 🥋`;
}

// Maps streak status to a dog mood. Only uses moods that already exist
// in DogMood.
export function streakMood(
  currentStreak: number,
  daysSinceLast: number | null
): "idle" | "happy" | "proud" | "excited" | "sad" | "sleepy" | "shy" {
  if (daysSinceLast === null) return "shy"; // brand new user
  if (currentStreak === 0) {
    if (daysSinceLast >= 7) return "sleepy"; // gave up waiting
    if (daysSinceLast >= 3) return "sad";
    return "shy"; // just missed a day, mildly hurt
  }
  if (currentStreak < 3) return "happy";
  if (currentStreak < 7) return "proud";
  return "excited";
}

// Returns days between today and the last practice date, or null if there
// is no last date.
export function daysSinceLast(
  lastDate: string | null,
  today: string
): number | null {
  if (!lastDate) return null;
  const [ly, lm, ld] = lastDate.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  const last = new Date(ly, lm - 1, ld);
  const t = new Date(ty, tm - 1, td);
  const diffMs = t.getTime() - last.getTime();
  return Math.max(0, Math.round(diffMs / 86_400_000));
}
