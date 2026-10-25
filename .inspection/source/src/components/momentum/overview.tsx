import { Check, Pause, Play, Square, TrendingUp } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Button } from '@/components/ui/button';
import {
  APPS,
  EXTRA_MS,
  LENGTHS,
  beginSession,
  endSession,
  extendSession,
  finishSession,
  remainingAt,
  spentAt,
  togglePause,
  todayKey,
  useStore,
  usedSecondsOn,
  weekView,
  type Active,
} from '@/lib/momentum';

export function formatClock(ms: number) {
  const total = Math.ceil(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function Ring({ percent, track, children }: { percent: number; track: string; children: ReactNode }) {
  const radius = 52;
  const length = 2 * Math.PI * radius;
  return (
    <div className="relative grid size-40 shrink-0 place-items-center">
      <svg viewBox="0 0 120 120" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="10" className={track} />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={length}
          strokeDashoffset={length * (1 - Math.min(100, Math.max(0, percent)) / 100)}
          className="stroke-[var(--brand)] transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="relative text-center">{children}</div>
    </div>
  );
}

function Hero({ now }: { now: number }) {
  const store = useStore();
  const used = usedSecondsOn(todayKey(now), now) / 60;
  const limit = store.dailyLimit;
  const percent = Math.round((used / limit) * 100);
  const usedRounded = Math.round(used);
  const over = used > limit;
  const close = store.prefs.limitWarnings && used >= limit * 0.8;
  return (
    <section className="relative overflow-hidden rounded-[28px] text-white">
      <img src="/images/calm.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d120a]/95 via-[#0d120a]/75 to-[#0d120a]/35" />
      <div className="relative p-6 sm:p-8">
        <p className="text-sm font-medium text-white/75">Your digital wellbeing</p>
        <h2 className="mt-2 max-w-md text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
          Make room for what matters.
        </h2>
        <div className="mt-8 flex flex-col items-center gap-7 sm:flex-row sm:items-end">
          <Ring percent={percent} track="fill-none stroke-white/15">
            <p className="text-4xl font-semibold tracking-[-0.05em]">{usedRounded}</p>
            <p className="text-xs text-white/70">of {limit} min</p>
          </Ring>
          <div className="w-full flex-1 pb-1">
            <p className="text-center text-base leading-6 text-white/85 sm:text-left">
              {over ? (
                <>
                  You're <strong className="text-white">{usedRounded - limit} minutes</strong> past your daily intention.
                </>
              ) : (
                <>
                  You've used <strong className="text-white">{usedRounded} minutes</strong> of your {limit}-minute daily
                  intention.
                </>
              )}
            </p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-[var(--brand)] transition-[width] duration-700"
                style={{ width: `${Math.min(100, percent)}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between text-xs text-white/70">
              <span>{usedRounded} min used</span>
              <span>{over ? `${usedRounded - limit} min over` : `${limit - usedRounded} min remaining`}</span>
            </div>
            {close && (
              <p className="mt-5 flex w-fit items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-medium">
                <span className="size-2 rounded-full bg-[var(--brand)]" aria-hidden="true" />
                {over ? "You're past today's limit" : 'Close to your daily limit'}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function NudgeContent() {
  return (
    <>
      <p className="text-sm font-semibold text-[#4f6a12] dark:text-[#c9f45c]">A gentle nudge</p>
      <h3 className="mt-2 text-3xl font-semibold leading-tight tracking-[-0.04em]">Your intention has ended.</h3>
      <p className="mt-4 leading-6 text-[#6f7864] dark:text-[#9ba68c]">
        You showed up for yourself. Take one slow breath, then choose what feels right for the next few minutes.
      </p>
      <div className="mt-7 grid gap-3">
        <Button size="lg" className="justify-between px-5" onClick={finishSession}>
          Finish with a small win <Check />
        </Button>
        <Button size="lg" variant="gray" className="justify-between px-5" onClick={extendSession}>
          Give me 2 more minutes <Play />
        </Button>
      </div>
      <p className="mt-5 text-center text-xs text-[#8c9482] dark:text-[#7d8a6c]">
        Extra time adds {EXTRA_MS / 60000} minutes to this intention.
      </p>
    </>
  );
}

function StartCard() {
  const [app, setApp] = useState(APPS[0]);
  const [minutes, setMinutes] = useState(10);
  return (
    <section className="surface p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Start a session</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Set an intention</h2>
        </div>
        <div className="grid size-12 place-items-center rounded-2xl bg-[#e9f5c7] text-[#4f6a12] dark:bg-[#2a3a17] dark:text-[#c9f45c]">
          <Play size={20} fill="currentColor" />
        </div>
      </div>
      <p className="mt-5 text-sm leading-5 text-[#6f7864] dark:text-[#9ba68c]">Where will you scroll, and for how long?</p>
      <div className="mt-5 grid gap-5">
        <SegmentedControl
          label="App"
          value={app}
          onChange={setApp}
          options={APPS.map((name) => ({ value: name, label: name }))}
        />
        <SegmentedControl
          label="Minutes"
          value={String(minutes)}
          onChange={(value) => setMinutes(Number(value))}
          options={LENGTHS.map((length) => ({ value: String(length), label: `${length} min` }))}
        />
      </div>
      <Button size="lg" className="mt-6 w-full" onClick={() => beginSession(app, minutes)}>
        <Play size={16} fill="currentColor" /> Begin session
      </Button>
    </section>
  );
}

function ActiveCard({ active, now }: { active: Active; now: number }) {
  const left = remainingAt(active, now);
  const spent = Math.round(spentAt(active, now) / 60000);
  const running = active.runningSince !== null;
  return (
    <section className="surface p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Live intention</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">{active.app}</h2>
        </div>
        <span className="chip">{running ? 'Running' : 'Paused'}</span>
      </div>
      <div className="mt-7 flex flex-col items-center gap-6 sm:flex-row">
        <Ring percent={(left / active.budgetMs) * 100} track="fill-none stroke-[#e5ebd6] dark:stroke-white/10">
          <p className="text-4xl font-semibold tabular-nums tracking-[-0.05em]">{formatClock(left)}</p>
          <p className="text-xs text-[#6f7864] dark:text-[#9ba68c]">left</p>
        </Ring>
        <div className="grid w-full flex-1 gap-3">
          <p className="text-center text-sm leading-6 text-[#6f7864] dark:text-[#9ba68c] sm:text-left">
            {spent} of {Math.round(active.budgetMs / 60000)} minutes used. Pausing stops the clock.
          </p>
          <Button variant={running ? 'gray' : 'filled'} size="lg" className="w-full" onClick={togglePause}>
            {running ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
            {running ? 'Pause session' : 'Resume session'}
          </Button>
          <Button variant="plain" size="lg" className="w-full" onClick={endSession}>
            <Square size={14} fill="currentColor" /> End early
          </Button>
        </div>
      </div>
    </section>
  );
}

function SessionCard({ now }: { now: number }) {
  const store = useStore();
  const active = store.active;
  if (!active) return <StartCard />;
  if (active.ended) {
    return (
      <section className="surface p-6 sm:p-8">
        <NudgeContent />
      </section>
    );
  }
  return <ActiveCard active={active} now={now} />;
}

function FocusCard({ week }: { week: ReturnType<typeof weekView> }) {
  const today = week.days[6];
  const delta = week.scoreDelta;
  return (
    <section className="surface p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Focus score</p>
          <p className="mt-2 text-5xl font-semibold tracking-[-0.06em]">
            {today.score}
            <span className="ml-1 text-xl text-[#8c9482] dark:text-[#7d8a6c]">/100</span>
          </p>
        </div>
        <div className="grid size-14 place-items-center rounded-2xl bg-[#e9f5c7] text-[#4f6a12] dark:bg-[#2a3a17] dark:text-[#c9f45c]">
          <TrendingUp size={24} />
        </div>
      </div>
      <div className="mt-7 flex h-32 items-end gap-2" role="img" aria-label="Focus score for the last 7 days">
        {week.days.map((day) => (
          <div key={day.day} className="flex h-full flex-1 flex-col justify-end">
            <div
              className={
                day.isToday
                  ? 'rounded-t-lg bg-[var(--brand)]'
                  : 'rounded-t-lg bg-[#dfe8c9] dark:bg-white/10'
              }
              style={{ height: `${Math.max(8, day.score)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-between text-xs font-medium text-[#8c9482] dark:text-[#7d8a6c]">
        {week.days.map((day) => (
          <span key={day.day} className={day.isToday ? 'text-[#4f6a12] dark:text-[#c9f45c]' : undefined}>
            {day.isToday ? 'Today' : day.label}
          </span>
        ))}
      </div>
      <p className="mt-5 flex items-center gap-2 text-sm font-medium text-[#4f6a12] dark:text-[#c9f45c]">
        <TrendingUp size={15} />
        {delta > 0
          ? `${delta} points higher than your weekly average`
          : delta < 0
            ? `${-delta} points below your weekly average`
            : 'Right on your weekly average'}
      </p>
    </section>
  );
}

function WeekCard({ week, onOpenInsights }: { week: ReturnType<typeof weekView>; onOpenInsights: () => void }) {
  return (
    <section className="surface p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">This week</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">A little more present</h2>
        </div>
        <Button variant="plain" size="sm" onClick={onOpenInsights}>
          View report
        </Button>
      </div>
      <div className="mt-7 grid grid-cols-3 divide-x divide-[#e2e7d8] dark:divide-white/10">
        <div className="pr-3">
          <p className="text-2xl font-semibold tracking-[-0.04em]">{week.completed}</p>
          <p className="mt-1 text-xs text-[#6f7864] dark:text-[#9ba68c]">sessions finished</p>
        </div>
        <div className="px-3">
          <p className="text-2xl font-semibold tracking-[-0.04em]">{week.underLimitDays}</p>
          <p className="mt-1 text-xs text-[#6f7864] dark:text-[#9ba68c]">days under limit</p>
        </div>
        <div className="pl-3">
          <p className="text-2xl font-semibold tracking-[-0.04em]">{Math.round(week.totalMinutes)}</p>
          <p className="mt-1 text-xs text-[#6f7864] dark:text-[#9ba68c]">minutes used</p>
        </div>
      </div>
      <div className="soft mt-7 p-4">
        <p className="text-sm font-semibold">
          {week.keptPercent >= 60 ? 'Your week is trending well' : 'Small steps add up'}
        </p>
        <p className="mt-1 text-xs leading-5 text-[#6f7864] dark:text-[#9ba68c]">
          You kept {week.keptPercent}% of your intentions this week.
        </p>
      </div>
    </section>
  );
}

export function Overview({ now, onOpenInsights }: { now: number; onOpenInsights: () => void }) {
  const week = weekView(now);
  return (
    <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr] xl:items-start">
      <div className="grid gap-5">
        <Hero now={now} />
        <SessionCard now={now} />
      </div>
      <div className="grid gap-5">
        <FocusCard week={week} />
        <WeekCard week={week} onOpenInsights={onOpenInsights} />
      </div>
    </div>
  );
}
