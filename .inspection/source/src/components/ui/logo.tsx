import { useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Whether a logo picture is wide (a wordmark): it then shows whole at its own shape, never cropped into the square
 * tile (an owner's own wordmark was cut to a square on a real site, the only name a phone showed: 2026-10-21).
 */
export function useWideLogo() {
  const ref = useRef<HTMLImageElement>(null);
  const [wide, setWide] = useState(false);
  const read = () => {
    const img = ref.current;
    if (img && img.naturalWidth && img.naturalHeight) setWide(img.naturalWidth / img.naturalHeight > 1.3);
  };
  useLayoutEffect(() => {
    if (ref.current?.complete) read();
  }, []);
  return { ref, wide, onLoad: read };
}

/**
 * The site's logo for the header (owner, 2026-10-19: every site gets its own): the mark, a picture made with the
 * image tool for this business (a symbol only, no letters, on a solid background in its brand color, square), shown
 * as a small rounded app-icon tile, beside the name in bold, and nothing under it (owner, 2026-10-19: no line of
 * what the business is). The name stays real text: a picture's letters blur and cannot follow the page's language.
 * When the bar is short of room, the picture alone stands for the name before the main button leaves the bar
 * (src/lib/fit-row.ts). The same picture is the tab icon
 * (`<link rel="icon" href="/logo.png">` in index.html). An owner's own logo image takes its place. A picture that
 * does not load hides itself, as the footer's does, and the name stands alone: a build that made no logo showed the
 * browser's broken-image icon in its header on every page (dev browser test 2026-10-23).
 */
export function Logo({
  src = '/logo.png',
  name,
  href = '/',
  className,
}: {
  /** The mark: a square picture in `public/` (`public/logo.png` is `/logo.png`). */
  src?: string;
  name: string;
  /** No longer shown; kept so a page that still passes it builds. */
  kind?: string;
  href?: string;
  className?: string;
}) {
  const mark = useWideLogo();
  return (
    <a href={href} className={cn('flex min-w-0 items-center gap-2.5', className)}>
      <img
        ref={mark.ref}
        src={src}
        alt=""
        width={36}
        height={36}
        onLoad={mark.onLoad}
        onError={(event) => (event.currentTarget.style.display = 'none')}
        className={cn(
          'shrink-0',
          mark.wide
            ? 'h-9 w-auto max-w-44 object-contain'
            : 'size-9 rounded-[10px] object-cover shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08),0_2px_6px_rgb(0_0_0/0.25)]',
        )}
      />
      <span className="min-w-0 text-[17px] leading-[1.1] font-semibold tracking-tight">{name}</span>
    </a>
  );
}
