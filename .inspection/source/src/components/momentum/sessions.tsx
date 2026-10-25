import { dayKey, spentAt, useStore, type Session } from '@/lib/momentum';

function dayLabel(day: string, now: number) {
  const today = dayKey(new Date(now));
  const yesterday = dayKey(new Date(now - 86_400_000));
  if (day === today) return 'Today';
  if (day === yesterday) return 'Yesterday';
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year, month - 1, date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function SessionRow({ app, planned, used, startedAt, status, extended, live }: {
  app: string;
  planned: number;
  used: number;
  startedAt: number;
  status: Session['status'] | 'active';
  extended: boolean;
  live?: boolean;
}) {
  const time = new Date(startedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const label = status === 'completed' ? 'Completed' : status === 'stopped' ? 'Stopped early' : 'Active';
  return (
    <div className="soft flex items-center justify-between gap-4 p-4">
      <div className="min-w-0">
        <p className="font-semibold">{app}</p>
        <p className="mt-1 text-xs text-[#6f7864] dark:text-[#9ba68c]">
          {time} · Planned {planned} min · Used {Math.round(used / 60)} min{extended ? ' · Extended' : ''}
        </p>
      </div>
      {live ? (
        <span className="chip shrink-0">Live</span>
      ) : (
        <span
          className={
            status === 'completed'
              ? 'chip shrink-0'
              : 'shrink-0 rounded-full bg-black/[0.06] px-3 py-1 text-xs font-semibold text-[#6f7864] dark:bg-white/10 dark:text-[#9ba68c]'
          }
        >
          {label}
        </span>
      )}
    </div>
  );
}

export function Sessions({ now }: { now: number }) {
  const store = useStore();
  const active = store.active;
  const sorted = [...store.sessions].sort((first, second) => second.startedAt - first.startedAt);
  const groups = new Map<string, Session[]>();
  for (const session of sorted) {
    groups.set(session.day, [...(groups.get(session.day) ?? []), session]);
  }
  return (
    <section className="surface p-6 sm:p-8">
      <p className="eyebrow">Your rhythm</p>
      <h2 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">Sessions</h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-[#6f7864] dark:text-[#9ba68c]">
        Review your recent intentions and keep building a healthier relationship with scrolling.
      </p>
      {active && (
        <div className="mt-7">
          <h3 className="eyebrow mb-3">Now</h3>
          <SessionRow
            app={active.app}
            planned={active.budgetMs / 60000}
            used={Math.round(spentAt(active, now) / 1000)}
            startedAt={active.startedAt}
            status="active"
            extended={active.extended}
            live
          />
        </div>
      )}
      {[...groups.entries()].map(([day, sessions]) => (
        <div key={day} className="mt-7">
          <h3 className="eyebrow mb-3">{dayLabel(day, now)}</h3>
          <div className="grid gap-3">
            {sessions.map((session) => (
              <SessionRow
                key={session.id}
                app={session.app}
                planned={session.plannedMinutes}
                used={session.usedSeconds}
                startedAt={session.startedAt}
                status={session.status}
                extended={session.extended}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
