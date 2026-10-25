import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * The page's first screen: a full-bleed photo of the subject under a dark fade, the words on the left in line with
 * the header's name (never centered), the headline in long lines up to 70% of the screen, its line narrower, the
 * buttons under them; on phones the words sit below the middle over a bottom fade. The floating header sits over
 * it. `position` is the photo's `object-position`: make or crop the photo with its subject on the right.
 */
export function Hero({
  src,
  alt = '',
  position,
  eyebrow,
  title,
  intro,
  actions,
  className,
}: {
  src: string;
  alt?: string;
  position?: string;
  /** A few words over the headline, such as "Licensed counseling · In person and online". */
  eyebrow?: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  /** One or two links styled with `buttonVariants` (the main one first). */
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'relative isolate flex min-h-svh items-end overflow-hidden bg-neutral-950 text-white md:items-center',
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        fetchPriority="high"
        className="absolute inset-0 -z-10 size-full object-cover"
        style={position ? { objectPosition: position } : undefined}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/45 to-black/10 md:bg-gradient-to-r md:from-black/75 md:via-black/40 md:to-black/5"
      />
      {/* On a phone the words end a sixth of the screen above its foot, not at it (owner, 2026-10-22: "should we put
          the mobile headline more up?"; at 56 px the buttons sat on the screen's edge). */}
      <div className="hero-words mx-auto w-full max-w-7xl px-5 pt-28 pb-[max(3.5rem,16svh)] sm:px-8 md:py-32">
        {eyebrow && <p className="text-sm font-medium uppercase tracking-[0.14em] text-white/85">{eyebrow}</p>}
        <h1
          className={cn(
            'text-4xl leading-[1.05] font-semibold tracking-tight text-pretty sm:text-5xl md:max-w-[70vw] lg:text-6xl',
            eyebrow && 'mt-4',
          )}
        >
          {title}
        </h1>
        {intro && <p className="mt-6 max-w-xl text-lg text-white/90 md:text-xl">{intro}</p>}
        {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </section>
  );
}
