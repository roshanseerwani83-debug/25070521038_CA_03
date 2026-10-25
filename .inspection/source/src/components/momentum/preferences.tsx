import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Switch } from '@/components/ui/switch';
import { LIMITS, ensurePermission, setDailyLimit, setName, updatePrefs, useStore, type Prefs } from '@/lib/momentum';

const ALERTS: { key: keyof Prefs; label: string; text: string }[] = [
  { key: 'sessionReminders', label: 'Session reminders', text: 'A heads-up one minute before your intention ends.' },
  { key: 'limitWarnings', label: 'Limit warnings', text: 'A calm nudge when you are close to your daily limit.' },
  { key: 'weeklyReports', label: 'Weekly progress report', text: 'A summary of your focus rhythm each Sunday evening.' },
  { key: 'gentleNudges', label: 'Gentle stopping nudges', text: 'A reminder when a session ends, with a clear next step.' },
];

const field =
  'h-12 w-full rounded-xl border border-[#d9dfcc] bg-white px-4 text-base text-[#1f2716] outline-none focus:border-[#4f6a12] dark:border-white/10 dark:bg-[#10160c] dark:text-[#eef3e2]';

export function Preferences() {
  const store = useStore();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  async function allow() {
    setAllowed(await ensurePermission());
  }

  return (
    <div>
      <p className="text-sm font-semibold text-[#4f6a12] dark:text-[#c9f45c]">Your space</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Preferences</h2>

      <div className="mt-7 grid gap-6">
        <label className="grid gap-2">
          <span className="text-sm font-semibold">Your name</span>
          <input
            className={field}
            value={store.name}
            maxLength={24}
            onChange={(event) => setName(event.target.value)}
            autoComplete="given-name"
          />
        </label>

        <SegmentedControl
          label="Daily limit"
          value={String(store.dailyLimit)}
          onChange={(value) => setDailyLimit(Number(value))}
          options={LIMITS.map((limit) => ({ value: String(limit), label: `${limit} min` }))}
        />

        <div className="grid gap-3">
          <p className="text-sm font-semibold">Notifications</p>
          {ALERTS.map(({ key, label, text }) => (
            <div key={key} className="soft p-4">
              <Switch
                label={label}
                checked={Boolean(store.prefs[key])}
                onCheckedChange={(checked) => updatePrefs({ [key]: checked })}
              />
              <p className="mt-1 text-xs leading-5 text-[#6f7864] dark:text-[#9ba68c]">{text}</p>
            </div>
          ))}
          <div className="soft p-4">
            <Switch
              label="Quiet hours"
              checked={store.prefs.quietHours}
              onCheckedChange={(checked) => updatePrefs({ quietHours: checked })}
            />
            <p className="mt-1 text-xs leading-5 text-[#6f7864] dark:text-[#9ba68c]">
              No notifications during your rest window.
            </p>
            {store.prefs.quietHours && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="grid gap-2 text-xs font-semibold text-[#6f7864] dark:text-[#9ba68c]">
                  From
                  <input
                    type="time"
                    className={field}
                    value={store.prefs.quietStart}
                    onChange={(event) => updatePrefs({ quietStart: event.target.value })}
                  />
                </label>
                <label className="grid gap-2 text-xs font-semibold text-[#6f7864] dark:text-[#9ba68c]">
                  Until
                  <input
                    type="time"
                    className={field}
                    value={store.prefs.quietEnd}
                    onChange={(event) => updatePrefs({ quietEnd: event.target.value })}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="soft grid gap-3 p-4">
          <p className="text-sm leading-6">
            {allowed === true
              ? 'Notifications are on for Momentum.'
              : allowed === false
                ? "Notifications are off. Turn them on in your phone's settings, then try again."
                : 'Let Momentum send reminders when a session is running.'}
          </p>
          <Button variant="tinted" className="w-full" onClick={allow}>
            Allow notifications
          </Button>
        </div>
        <p className="text-center text-xs text-[#8c9482] dark:text-[#7d8a6c]">Your settings are saved on this device.</p>
      </div>
    </div>
  );
}
