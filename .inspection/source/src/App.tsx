import { ChartColumn, CircleHelp, Gauge, Leaf, Settings, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Insights } from '@/components/momentum/insights';
import { NudgeContent, Overview } from '@/components/momentum/overview';
import { Preferences } from '@/components/momentum/preferences';
import { Sessions } from '@/components/momentum/sessions';
import { Sheet } from '@/components/ui/sheet';
import { ThemeButton } from '@/components/ui/theme-button';
import { settle, syncWeekly, useStore } from '@/lib/momentum';
import { usePageMeta } from '@/lib/page-meta';
import { cn } from '@/lib/utils';

type Tab = 'overview' | 'sessions' | 'insights';

const TABS = [
  { id: 'overview', label: 'Today', icon: Gauge },
  { id: 'sessions', label: 'Sessions', icon: Timer },
  { id: 'insights', label: 'Insights', icon: ChartColumn },
] as const;

const iconButton =
  'grid size-11 place-items-center rounded-full border border-[#e2e7d8] bg-white text-[#6f7864] transition hover:bg-[#f1f4e8] dark:border-white/10 dark:bg-[#161c11] dark:text-[#9ba68c] dark:hover:bg-[#1e2717]';

function greeting(now: number) {
  const hour = new Date(now).getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function HowItWorks() {
  const steps = [
    ['01', 'Set an intention', 'Choose the app and how long you want to spend there, then start the timer.'],
    ['02', 'Scroll with awareness', 'Momentum keeps the timer running in the background, even when your screen is locked.'],
    ['03', 'Choose your stopping point', 'When time is up, you get a gentle nudge with a clear choice, not a hard block.'],
  ];
  return (
    <div>
      <p className="text-sm font-medium text-[#6f7864] dark:text-[#9ba68c]">A gentler way to scroll</p>
      <h2 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">How Momentum works</h2>
      <div className="mt-7 grid gap-3">
        {steps.map(([number, title, text]) => (
          <div key={number} className="soft p-5">
            <span className="text-sm font-bold text-[#4f6a12] dark:text-[#c9f45c]">{number}</span>
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#6f7864] dark:text-[#9ba68c]">{text}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 rounded-2xl bg-[#e9f5c7] p-4 text-sm leading-6 text-[#4f6a12] dark:bg-[#22301a] dark:text-[#c9f45c]">
        Momentum measures the sessions you start here. It does not read other apps' usage yet.
      </p>
    </div>
  );
}

export default function App() {
  usePageMeta({
    title: 'Momentum — Scroll with intention',
    description: 'A gentle digital wellbeing companion that helps you scroll with intention.',
  });
  const store = useStore();
  const [tab, setTab] = useState<Tab>('overview');
  const [now, setNow] = useState(() => Date.now());
  const [helpOpen, setHelpOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [closedNudge, setClosedNudge] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      settle();
      setNow(Date.now());
    };
    tick();
    syncWeekly();
    const timer = window.setInterval(tick, 500);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);

  const active = store.active;
  const nudgeKey = active ? `${active.id}:${active.budgetMs}` : null;
  const nudgeOpen = Boolean(active?.ended) && closedNudge !== nudgeKey;
  const today = new Date(now).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-dvh bg-[#f4f5ec] text-[#1f2716] dark:bg-[#0d110a] dark:text-[#eef3e2]">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col justify-between border-r border-[#e2e7d8] bg-[#f9faf4] p-6 dark:border-white/[0.07] dark:bg-[#10160c] lg:flex">
        <div>
          <div className="mb-10 flex items-center gap-3 px-2">
            <div className="grid size-10 place-items-center rounded-xl bg-[#1f2716] text-[#c9f45c]">
              <Leaf size={20} />
            </div>
            <span className="text-xl font-semibold tracking-[-0.04em]">momentum</span>
          </div>
          <nav aria-label="Main navigation" className="grid gap-1.5">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                aria-current={tab === id ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium transition',
                  tab === id
                    ? 'bg-[#e4f3b8] text-[#1f2716] dark:bg-[#2a3a17] dark:text-[#eef3e2]'
                    : 'text-[#6f7864] hover:bg-[#eef1e5] dark:text-[#9ba68c] dark:hover:bg-white/5',
                )}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>
          <div className="mt-10 grid gap-1.5 border-t border-[#e2e7d8] pt-7 dark:border-white/[0.07]">
            <p className="px-3 pb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8c9482] dark:text-[#7d8a6c]">Your space</p>
            <button
              type="button"
              onClick={() => setPrefsOpen(true)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium text-[#6f7864] hover:bg-[#eef1e5] dark:text-[#9ba68c] dark:hover:bg-white/5"
            >
              <Settings size={18} />
              Preferences
            </button>
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium text-[#6f7864] hover:bg-[#eef1e5] dark:text-[#9ba68c] dark:hover:bg-white/5"
            >
              <CircleHelp size={18} />
              How it works
            </button>
          </div>
        </div>
        <div className="soft p-4">
          <p className="text-sm font-semibold">Stays on this device</p>
          <p className="mt-1 text-xs leading-5 text-[#6f7864] dark:text-[#9ba68c]">
            Your sessions and settings are saved in this browser or app, not sent anywhere.
          </p>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-[#e2e7d8] bg-[#f4f5ec]/90 px-4 pt-[env(safe-area-inset-top)] backdrop-blur dark:border-white/[0.07] dark:bg-[#0d110a]/90 lg:hidden">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-[#1f2716] text-[#c9f45c]">
              <Leaf size={19} />
            </div>
            <span className="font-semibold tracking-[-0.02em]">momentum</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeButton className={iconButton} />
            <button type="button" className={iconButton} aria-label="Preferences" onClick={() => setPrefsOpen(true)}>
              <Settings size={18} />
            </button>
            <button type="button" className={iconButton} aria-label="How it works" onClick={() => setHelpOpen(true)}>
              <CircleHelp size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-32 pt-5 sm:px-6 lg:pl-[17rem] lg:pr-10 lg:pt-9 lg:pb-12">
        <div className="mb-7 hidden items-end justify-between lg:flex">
          <div>
            <p className="text-sm font-medium text-[#6f7864] dark:text-[#9ba68c]">{today}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-[-0.05em]">
              {greeting(now)}, {store.name || 'there'}
              <span className="text-[var(--brand)]">.</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeButton className={iconButton} />
            <button type="button" className={iconButton} aria-label="Preferences" onClick={() => setPrefsOpen(true)}>
              <Settings size={18} />
            </button>
          </div>
        </div>
        <div className="mb-6 lg:hidden">
          <p className="text-sm font-medium text-[#6f7864] dark:text-[#9ba68c]">{today}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
            {greeting(now)}, {store.name || 'there'}
            <span className="text-[var(--brand)]">.</span>
          </h1>
        </div>

        {tab === 'overview' && <Overview now={now} onOpenInsights={() => setTab('insights')} />}
        {tab === 'sessions' && <Sessions now={now} />}
        {tab === 'insights' && <Insights now={now} />}
      </main>

      <nav
        aria-label="Sections"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e2e7d8] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-white/[0.07] dark:bg-[#0d110a]/95 lg:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-3">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id ? 'page' : undefined}
              className={cn(
                'flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition',
                tab === id ? 'text-[#4f6a12] dark:text-[#c9f45c]' : 'text-[#8c9482] dark:text-[#7d8a6c]',
              )}
            >
              <span
                className={cn(
                  'grid h-8 w-14 place-items-center rounded-full transition',
                  tab === id && 'bg-[#e4f3b8] dark:bg-[#2a3a17]',
                )}
              >
                <Icon size={20} />
              </span>
              {label}
            </button>
          ))}
        </div>
      </nav>

      <Sheet
        open={nudgeOpen}
        onOpenChange={(open) => {
          if (!open) setClosedNudge(nudgeKey);
        }}
        label="A gentle nudge"
      >
        <div className="p-6 pt-14 sm:p-8 sm:pt-16">
          <NudgeContent />
        </div>
      </Sheet>
      <Sheet open={prefsOpen} onOpenChange={setPrefsOpen} label="Preferences">
        <div className="p-6 pt-14 sm:p-8 sm:pt-16">
          <Preferences />
        </div>
      </Sheet>
      <Sheet open={helpOpen} onOpenChange={setHelpOpen} label="How it works">
        <div className="p-6 pt-14 sm:p-8 sm:pt-16">
          <HowItWorks />
        </div>
      </Sheet>
    </div>
  );
}
