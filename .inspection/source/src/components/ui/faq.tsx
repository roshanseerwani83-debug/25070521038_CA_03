import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { PhotoTile } from '@/components/ui/mosaic';
import { cn } from '@/lib/utils';

/**
 * Questions and answers: a photo tile holding the section's label, title and a line (how to ask more), beside one
 * card of questions that open in place, each a full-width row with a chevron, separated by hairlines. Without a photo
 * the words stand on the page, at the top beside the questions, with no box: a box with nothing but its words at the
 * foot read as empty, black or glowing (dev and production, 2026-10-23 and 24; owner: "the text out of place").
 */
export function Faq({
  id,
  eyebrow,
  title,
  intro,
  image,
  imageAlt = '',
  position,
  items,
}: {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  /** The photo of the title tile: the place, the team at work, the product in use. */
  image?: string;
  imageAlt?: string;
  position?: string;
  items: { q: string; a: ReactNode }[];
}) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-5 py-12 sm:px-8 md:py-16">
      <div className="grid gap-4 lg:grid-cols-5">
        {image ? (
          <PhotoTile
            src={image}
            alt={imageAlt}
            position={position}
            // As tall as its questions need: beside two questions a 26rem photo left their card mostly empty (the kit's
            // audit, 2026-10-24).
            className={cn('min-h-72 p-8 md:p-10 lg:col-span-2', items.length > 3 && 'lg:min-h-[26rem]')}
          >
            {eyebrow && <p className="text-sm font-medium uppercase tracking-[0.14em] text-white/80">{eyebrow}</p>}
            <h2 className={cn('text-4xl font-semibold tracking-tight text-balance', eyebrow && 'mt-3')}>{title}</h2>
            {intro && <div className="mt-4 text-lg text-white/90">{intro}</div>}
          </PhotoTile>
        ) : (
          <div className="lg:col-span-2 lg:pt-6 lg:pr-6">
            {eyebrow && <p className="section-label text-sm font-medium uppercase tracking-[0.14em]">{eyebrow}</p>}
            <h2 className={cn('text-4xl font-semibold tracking-tight text-balance', eyebrow && 'mt-3')}>{title}</h2>
            {intro && <div className="mt-4 text-lg opacity-80">{intro}</div>}
          </div>
        )}
        <div className="flex flex-col justify-center rounded-3xl bg-[rgb(120_120_128/0.1)] px-6 py-2 shadow-[inset_0_1px_0_rgb(255_255_255/0.06),inset_0_0_0_1px_rgb(120_120_128/0.14)] md:px-8 lg:col-span-3">
          {items.map((item, index) => (
            <details key={item.q} className={cn('group', index > 0 && 'border-t border-[var(--separator)]')}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 text-lg font-medium [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronDown aria-hidden className="size-5 shrink-0 opacity-60 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="pb-6 opacity-75">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
