import { languageName, useLang } from '@/lib/lang';
import { cn } from '@/lib/utils';

/**
 * The language switch for the header: the site's languages as a small pill (EN · ES), the one shown lit, each a
 * button named in its own language. Put it in `GlassBar`'s row and add `...useLangMenu()` (`@/lib/lang`) to the
 * bar's `menu`: on a phone the switch moves into the menu with the links (`data-fold`). Needs `LangProvider`.
 */
export function LangSwitch({ className }: { className?: string }) {
  const { lang, languages, setLang } = useLang();
  if (languages.length < 2) return null;
  return (
    <div
      data-fold=""
      className={cn('inline-flex h-9 shrink-0 items-center rounded-full bg-[rgb(120_120_128/0.16)] p-1', className)}
    >
      {languages.map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-label={languageName(code)}
          aria-pressed={code === lang}
          onClick={() => setLang(code)}
          className={cn(
            'h-7 min-w-9 rounded-full px-2.5 text-[13px] font-semibold uppercase transition-[background-color,color,opacity] duration-200',
            code === lang
              ? 'bg-white text-zinc-900 shadow-[0_1px_3px_rgb(0_0_0/0.18)] dark:bg-zinc-700 dark:text-white'
              : 'opacity-70 hover:opacity-100',
          )}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
