import { Star } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Carousel } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

export type Review = {
  quote: ReactNode;
  name: string;
  /** Who they are: "Regular since 2019", "Bride, June 2026". */
  detail?: ReactNode;
  /** 1 to 5; leave out for no stars. */
  stars?: number;
  /** Their photo (`/images/…`); without one, their initials in a circle of the brand color. */
  image?: string;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');
}

/**
 * What customers say: each review a card with its stars in the brand color, the words, and who said it (their photo,
 * or their initials in a brand circle). Three side by side on a computer, two on a tablet, one and the edge of the next
 * on a phone; past that many they swipe, with arrows for a mouse. `label` names them for screen readers ("Reviews").
 * `tone="glass"` over a photo.
 */
export function Reviews({
  items,
  label,
  tone = 'plain',
  className,
}: {
  items: Review[];
  label: string;
  tone?: 'plain' | 'glass';
  className?: string;
}) {
  const n = items.length;
  // One review is a wide quote in the middle of the row, two share it: a lone card a third wide, or two beside an empty
  // third, left the row half empty (the kit's audit, 2026-10-24).
  return (
    <Carousel
      label={label}
      className={cn(n === 1 && 'mx-auto max-w-3xl', className)}
      slideClassName={n === 1 ? 'basis-full' : n === 2 ? 'basis-[86%] sm:basis-1/2' : 'basis-[86%] sm:basis-1/2 lg:basis-1/3'}
    >
      {items.map((review, i) => (
        <Card key={i} tone={tone} className={cn('h-full gap-5 p-6 md:p-7', n === 1 && 'md:p-10')}>
          {review.stars != null && (
            <div className="flex gap-1" role="img" aria-label={`${review.stars} / 5`}>
              {Array.from({ length: 5 }, (_, star) => (
                <Star
                  key={star}
                  aria-hidden
                  className={cn('size-4', star < review.stars! ? 'fill-[var(--brand)] text-[var(--brand)]' : 'opacity-25')}
                />
              ))}
            </div>
          )}
          <blockquote className={cn('leading-relaxed text-pretty', n === 1 ? 'text-xl md:text-2xl' : 'text-lg')}>
            {review.quote}
          </blockquote>
          <div className="mt-auto flex items-center gap-3 pt-2">
            {review.image ? (
              <img
                src={review.image}
                alt=""
                width={80}
                height={80}
                loading="lazy"
                className="size-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span
                aria-hidden
                className="grid size-10 shrink-0 place-items-center rounded-full bg-[color-mix(in_oklab,var(--brand)_18%,transparent)] text-sm font-semibold text-[var(--brand)]"
              >
                {initials(review.name)}
              </span>
            )}
            <span className="min-w-0">
              <span className="block font-semibold">{review.name}</span>
              {review.detail != null && (
                <span className={cn('block text-sm', tone === 'glass' ? 'text-white/75' : 'opacity-65')}>
                  {review.detail}
                </span>
              )}
            </span>
          </div>
        </Card>
      ))}
    </Carousel>
  );
}
