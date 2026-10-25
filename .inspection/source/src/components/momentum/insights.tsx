import { useStore, weekView } from '@/lib/momentum';

export function Insights({ now }: { now: number }) {
  const store = useStore();
  const week = weekView(now);
  const limit = store.dailyLimit;
  const scale = Math.max(limit, ...week.days.map((day) => day.minutes)) * 1.1;
  return (
    <section className="surface p-6 sm:p-8">
      <p className="eyebrow">Your progress</p>
      <h2 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">Insights</h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-[#6f7864] dark:text-[#9ba68c]">
        Small patterns become useful when you can see them clearly.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-[#1f2716] p-5 text-white dark:bg-[#1e2a12]">
          <p className="text-sm text-[#c1cbb4]">Average session</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{Math.round(week.averageMinutes)} min</p>
          <p className="mt-2 text-xs text-[#c9f45c]">Across the last 7 days</p>
        </div>
        <div className="soft p-5">
          <p className="text-sm text-[#6f7864] dark:text-[#9ba68c]">Best focus day</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{week.best.fullLabel}</p>
          <p className="mt-2 text-xs text-[#4f6a12] dark:text-[#c9f45c]">{week.best.score} focus score</p>
        </div>
        <div className="soft p-5">
          <p className="text-sm text-[#6f7864] dark:text-[#9ba68c]">Intentions kept</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{week.keptPercent}%</p>
          <p className="mt-2 text-xs text-[#4f6a12] dark:text-[#c9f45c]">Finished without stopping early</p>
        </div>
      </div>
      <div className="soft mt-6 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Minutes per day</p>
          <p className="text-xs text-[#6f7864] dark:text-[#9ba68c]">Dashed line: your {limit}-minute limit</p>
        </div>
        <div className="relative mt-6 flex h-48 items-end gap-2 sm:gap-3">
          <div
            className="absolute inset-x-0 border-t-2 border-dashed border-[#8c9482]/60 dark:border-white/30"
            style={{ bottom: `${(limit / scale) * 100}%` }}
          />
          {week.days.map((day) => (
            <div key={day.day} className="flex h-full flex-1 flex-col justify-end">
              <div
                className={day.isToday ? 'rounded-t-lg bg-[var(--brand)]' : 'rounded-t-lg bg-[#c9d9a6] dark:bg-white/15'}
                style={{ height: `${Math.max(3, (day.minutes / scale) * 100)}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2 text-xs font-medium text-[#6f7864] dark:text-[#9ba68c] sm:gap-3">
          {week.days.map((day) => (
            <span key={day.day} className="flex-1 text-center">
              {day.isToday ? 'Today' : day.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
