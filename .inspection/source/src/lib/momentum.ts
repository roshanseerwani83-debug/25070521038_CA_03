import { useSyncExternalStore } from 'react';

export const APPS = ['Instagram', 'TikTok', 'YouTube', 'Other'];
export const LENGTHS = [5, 10, 20, 30];
export const LIMITS = [60, 90, 100, 120];
export const EXTRA_MS = 120_000;

const KEY = 'momentum.v1';
const REMINDER_ID = 101;
const END_ID = 102;
const WEEKLY_ID = 103;

export type Status = 'completed' | 'stopped';

export type Session = {
  id: string;
  app: string;
  plannedMinutes: number;
  usedSeconds: number;
  startedAt: number;
  day: string;
  status: Status;
  extended: boolean;
};

export type Active = {
  id: string;
  app: string;
  plannedMinutes: number;
  budgetMs: number;
  remainingMs: number;
  runningSince: number | null;
  startedAt: number;
  day: string;
  extended: boolean;
  ended: boolean;
  warned: boolean;
};

export type Prefs = {
  sessionReminders: boolean;
  limitWarnings: boolean;
  weeklyReports: boolean;
  gentleNudges: boolean;
  quietHours: boolean;
  quietStart: string;
  quietEnd: string;
};

export type Store = {
  name: string;
  dailyLimit: number;
  prefs: Prefs;
  sessions: Session[];
  active: Active | null;
};

export function dayKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function remainingAt(active: Active, now: number) {
  return active.runningSince === null ? active.remainingMs : Math.max(0, active.remainingMs - (now - active.runningSince));
}

export function spentAt(active: Active, now: number) {
  return active.budgetMs - remainingAt(active, now);
}

const DEFAULT_PREFS: Prefs = {
  sessionReminders: true,
  limitWarnings: true,
  weeklyReports: true,
  gentleNudges: true,
  quietHours: false,
  quietStart: '22:00',
  quietEnd: '07:00',
};

function seedSessions(): Session[] {
  const today = new Date();
  const sessions: Session[] = [];
  const add = (offset: number, hour: number, app: string, planned: number, usedMinutes: number, status: Status) => {
    const startedAt = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour, 15).getTime();
    sessions.push({
      id: `seed-${offset}-${hour}`,
      app,
      plannedMinutes: planned,
      usedSeconds: usedMinutes * 60,
      startedAt,
      day: dayKey(new Date(startedAt)),
      status,
      extended: false,
    });
  };
  add(0, 8, 'Instagram', 10, 10, 'completed');
  add(0, 10, 'TikTok', 15, 15, 'completed');
  add(0, 13, 'Other', 20, 12, 'stopped');
  add(0, 18, 'YouTube', 5, 5, 'completed');
  const pastMinutes = [
    [14, 18, 9],
    [22, 11, 27],
    [8, 16, 12],
    [25, 14, 19],
    [9, 12, 20],
    [18, 26, 10],
  ];
  pastMinutes.forEach((minutes, index) => {
    minutes.forEach((used, slot) => {
      const planned = LENGTHS.find((length) => length >= used) ?? 30;
      add(-(index + 1), [9, 13, 20][slot], APPS[(index + slot) % 3], planned, used, slot === 2 ? 'stopped' : 'completed');
    });
  });
  return sessions;
}

function initialStore(): Store {
  return { name: 'Alex', dailyLimit: 100, prefs: DEFAULT_PREFS, sessions: seedSessions(), active: null };
}

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<Store>;
      return { ...initialStore(), ...saved, prefs: { ...DEFAULT_PREFS, ...saved.prefs } };
    }
  } catch {
    // Unreadable saved data: start from the sample week.
  }
  const fresh = initialStore();
  try {
    localStorage.setItem(KEY, JSON.stringify(fresh));
  } catch {
    // Private browsing can refuse storage; the app still works for this visit.
  }
  return fresh;
}

let store: Store = load();
const listeners = new Set<() => void>();

function commit(next: Store) {
  store = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private browsing can refuse storage; the app still works for this visit.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useStore() {
  return useSyncExternalStore(subscribe, () => store);
}

type NativeAlert = { id: number; title: string; body: string; schedule: { at: Date; allowWhileIdle: boolean } };
type Native = {
  checkPermissions: () => Promise<{ display: string }>;
  requestPermissions: () => Promise<{ display: string }>;
  schedule: (options: { notifications: NativeAlert[] }) => Promise<unknown>;
  cancel: (options: { notifications: { id: number }[] }) => Promise<unknown>;
};

/** The phone's own alerts, present only in the Android app: they fire even when the app is closed. */
function native(): Native | undefined {
  return (window as unknown as { Capacitor?: { Plugins?: { LocalNotifications?: Native } } }).Capacitor?.Plugins
    ?.LocalNotifications;
}

function minutesOf(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function quietAt(prefs: Prefs, time: number) {
  if (!prefs.quietHours) return false;
  const date = new Date(time);
  const current = date.getHours() * 60 + date.getMinutes();
  const start = minutesOf(prefs.quietStart);
  const end = minutesOf(prefs.quietEnd);
  return start <= end ? current >= start && current < end : current >= start || current < end;
}

function webAlert(title: string, body: string, enabled: boolean) {
  if (!enabled || native() || !('Notification' in window) || Notification.permission !== 'granted') return;
  if (quietAt(store.prefs, Date.now())) return;
  new Notification(title, { body, tag: 'momentum' });
}

export async function ensurePermission(): Promise<boolean> {
  const alerts = native();
  if (alerts) {
    const status = await alerts.checkPermissions();
    if (status.display === 'granted') return true;
    return (await alerts.requestPermissions()).display === 'granted';
  }
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'default') return (await Notification.requestPermission()) === 'granted';
  return Notification.permission === 'granted';
}

function cancelAlerts() {
  void native()?.cancel({ notifications: [{ id: REMINDER_ID }, { id: END_ID }] });
}

function scheduleAlerts(app: string, endsAt: number) {
  const alerts = native();
  if (!alerts) return;
  const { prefs } = store;
  const list: NativeAlert[] = [];
  const reminderAt = endsAt - 60_000;
  if (prefs.sessionReminders && reminderAt > Date.now() && !quietAt(prefs, reminderAt)) {
    list.push({
      id: REMINDER_ID,
      title: 'One minute left',
      body: `Your ${app} intention ends in a minute.`,
      schedule: { at: new Date(reminderAt), allowWhileIdle: true },
    });
  }
  if (prefs.gentleNudges && !quietAt(prefs, endsAt)) {
    list.push({
      id: END_ID,
      title: 'Your intention has ended',
      body: 'Take one slow breath, then choose what feels right next.',
      schedule: { at: new Date(endsAt), allowWhileIdle: true },
    });
  }
  void alerts
    .cancel({ notifications: [{ id: REMINDER_ID }, { id: END_ID }] })
    .then(() => (list.length ? alerts.schedule({ notifications: list }) : undefined));
}

function nextSundayEvening() {
  const date = new Date();
  date.setHours(19, 0, 0, 0);
  let days = (7 - date.getDay()) % 7;
  if (days === 0 && date.getTime() <= Date.now()) days = 7;
  date.setDate(date.getDate() + days);
  return date;
}

export function syncWeekly() {
  const alerts = native();
  if (!alerts) return;
  void alerts.cancel({ notifications: [{ id: WEEKLY_ID }] }).then(() => {
    if (!store.prefs.weeklyReports) return undefined;
    return alerts.schedule({
      notifications: [
        {
          id: WEEKLY_ID,
          title: 'Your week in Momentum',
          body: 'See how your focus rhythm went this week.',
          schedule: { at: nextSundayEvening(), allowWhileIdle: true },
        },
      ],
    });
  });
}

export function setName(name: string) {
  commit({ ...store, name });
}

export function setDailyLimit(dailyLimit: number) {
  commit({ ...store, dailyLimit });
}

export function updatePrefs(patch: Partial<Prefs>) {
  commit({ ...store, prefs: { ...store.prefs, ...patch } });
  if ('weeklyReports' in patch) syncWeekly();
}

export function beginSession(app: string, minutes: number) {
  if (store.active) return;
  const now = Date.now();
  const budgetMs = minutes * 60_000;
  commit({
    ...store,
    active: {
      id: `s-${now}`,
      app,
      plannedMinutes: minutes,
      budgetMs,
      remainingMs: budgetMs,
      runningSince: now,
      startedAt: now,
      day: dayKey(new Date(now)),
      extended: false,
      ended: false,
      warned: false,
    },
  });
  scheduleAlerts(app, now + budgetMs);
  void ensurePermission().then((granted) => {
    if (granted && store.active?.id === `s-${now}`) scheduleAlerts(app, now + store.active.remainingMs);
  });
}

export function togglePause() {
  const active = store.active;
  if (!active || active.ended) return;
  const now = Date.now();
  if (active.runningSince === null) {
    commit({ ...store, active: { ...active, runningSince: now } });
    scheduleAlerts(active.app, now + active.remainingMs);
  } else {
    commit({ ...store, active: { ...active, remainingMs: remainingAt(active, now), runningSince: null } });
    cancelAlerts();
  }
}

function recordAndClear(active: Active, status: Status, spentMs: number) {
  const session: Session = {
    id: active.id,
    app: active.app,
    plannedMinutes: active.plannedMinutes,
    usedSeconds: Math.round(spentMs / 1000),
    startedAt: active.startedAt,
    day: active.day,
    status,
    extended: active.extended,
  };
  commit({ ...store, sessions: [session, ...store.sessions], active: null });
  cancelAlerts();
}

export function endSession() {
  const active = store.active;
  if (!active) return;
  recordAndClear(active, 'stopped', spentAt(active, Date.now()));
}

export function finishSession() {
  const active = store.active;
  if (!active) return;
  recordAndClear(active, 'completed', spentAt(active, Date.now()));
}

export function extendSession() {
  const active = store.active;
  if (!active || !active.ended) return;
  const now = Date.now();
  commit({
    ...store,
    active: {
      ...active,
      budgetMs: active.budgetMs + EXTRA_MS,
      remainingMs: EXTRA_MS,
      runningSince: now,
      extended: true,
      ended: false,
      warned: false,
    },
  });
  scheduleAlerts(active.app, now + EXTRA_MS);
}

/** Called on a steady tick: moves the session to ended when its time runs out, even if the phone slept meanwhile. */
export function settle() {
  const active = store.active;
  if (!active || active.ended || active.runningSince === null) return;
  const now = Date.now();
  const left = remainingAt(active, now);
  if (left <= 0) {
    commit({ ...store, active: { ...active, remainingMs: 0, runningSince: null, ended: true, warned: true } });
    webAlert('Your intention has ended', 'Take one slow breath, then choose what feels right next.', store.prefs.gentleNudges);
    navigator.vibrate?.([200, 100, 200]);
    return;
  }
  if (left <= 60_000 && !active.warned) {
    commit({ ...store, active: { ...active, warned: true } });
    webAlert('One minute left', `Your ${active.app} intention ends in a minute.`, store.prefs.sessionReminders);
  }
}

export function todayKey(now: number) {
  return dayKey(new Date(now));
}

export function usedSecondsOn(day: string, now: number) {
  const active = store.active;
  const saved = store.sessions.filter((session) => session.day === day).reduce((sum, session) => sum + session.usedSeconds, 0);
  return saved + (active && active.day === day ? Math.round(spentAt(active, now) / 1000) : 0);
}

function focusScore(day: string, now: number) {
  const finished = store.sessions.filter((session) => session.day === day);
  const kept = finished.length ? finished.filter((session) => session.status === 'completed').length / finished.length : 1;
  const used = usedSecondsOn(day, now) / 60;
  const room = Math.min(1, Math.max(0, 1 - used / store.dailyLimit));
  return Math.round(100 * (kept * 0.5 + room * 0.5));
}

export function weekView(now: number) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (6 - index));
    const day = dayKey(date);
    return {
      day,
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      fullLabel: date.toLocaleDateString('en-US', { weekday: 'long' }),
      minutes: usedSecondsOn(day, now) / 60,
      score: focusScore(day, now),
      isToday: index === 6,
    };
  });
  const dayKeys = new Set(days.map((day) => day.day));
  const finished = store.sessions.filter((session) => dayKeys.has(session.day));
  const completed = finished.filter((session) => session.status === 'completed').length;
  const earlier = days.slice(0, 6);
  const earlierAverage = earlier.reduce((sum, day) => sum + day.score, 0) / earlier.length;
  return {
    days,
    completed,
    averageMinutes: finished.length ? finished.reduce((sum, session) => sum + session.usedSeconds, 0) / finished.length / 60 : 0,
    keptPercent: finished.length ? Math.round((completed / finished.length) * 100) : 0,
    best: days.reduce((top, day) => (day.score > top.score ? day : top), days[0]),
    underLimitDays: days.filter((day) => day.minutes <= store.dailyLimit).length,
    totalMinutes: days.reduce((sum, day) => sum + day.minutes, 0),
    scoreDelta: Math.round(days[6].score - earlierAverage),
  };
}
