import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * A small link onward from a section, in the brand color with a chevron. Between the first screen and the page's
 * last section a section leads on with this, never a full button: the same big button in every section read as
 * repetition, and one left under a row of cards looked out of place (owner, 2026-10-19).
 */
export function SectionLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={cn(
        'section-link group inline-flex shrink-0 items-center gap-1 text-[17px] font-semibold underline-offset-4 hover:underline',
        className,
      )}
    >
      {children}
      <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
        ›
      </span>
    </a>
  );
}

/**
 * A section's title: a small label, the headline at the section-title size and its line, with an optional `link`
 * onward beside it (under the line on a phone). It takes the color of where it sits: white on a photo band, the
 * page's ink elsewhere, the label in the brand color on the page.
 */
export function SectionHead({
  eyebrow,
  title,
  intro,
  link,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  link?: { label: string; href: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-4 self-stretch sm:flex-row sm:items-end sm:justify-between sm:gap-10',
        className,
      )}
    >
      <div>
        {eyebrow && <p className="section-label text-sm font-medium uppercase tracking-[0.14em]">{eyebrow}</p>}
        <h2
          className={cn(
            'max-w-2xl text-3xl font-semibold tracking-tight text-balance md:text-4xl lg:text-5xl',
            eyebrow && 'mt-3',
          )}
        >
          {title}
        </h2>
        {intro && <p className="mt-4 max-w-xl text-lg opacity-85">{intro}</p>}
      </div>
      {link && <SectionLink href={link.href}>{link.label}</SectionLink>}
    </div>
  );
}
