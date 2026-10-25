import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { useLoadTurn } from '@/lib/eager-images';
import { cn } from '@/lib/utils';

export type FormBandContact = { label: string; value: string; href?: string };

/** An email may break after its @ when it must, never in the middle of a word. */
function breakAfterAt(value: ReactNode): ReactNode {
  if (typeof value !== 'string' || !value.includes('@')) return value;
  const at = value.indexOf('@') + 1;
  return (
    <>
      {value.slice(0, at)}
      <wbr />
      {value.slice(at)}
    </>
  );
}

/**
 * The section with a form (booking, order, reservation, contact, event request), over a full-width photo: two glass
 * cards side by side, the same height. The words card is laid out in three parts spread over its height, so it is
 * never a block of text over empty glass (owner, 2026-10-19): the label, title and line at the top; the steps as
 * numbered rows divided by hairlines in the middle; the ways to reach the business as a small two-column grid at the
 * foot. The form card pairs short fields two to a row from small screens up; a textarea, a choice of options and the
 * submit button take the full row.
 */
export function FormBand({
  id,
  background,
  backgroundAlt = '',
  position,
  eyebrow,
  title,
  intro,
  steps,
  contact,
  note,
  children,
}: {
  id?: string;
  /** The band's photo: the place, the people, the thing being booked or ordered. */
  background: string;
  backgroundAlt?: string;
  position?: string;
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  /** What happens after sending, two to four short steps. */
  steps?: string[];
  /** How to reach the business: {label: 'Call', value: '(718) 555-0147', href: 'tel:+17185550147'}, hours, address. */
  contact?: FormBandContact[];
  /** One line of small print under everything (a crisis line, a deposit policy). */
  note?: ReactNode;
  /** The form (or its thank-you message). */
  children: ReactNode;
}) {
  const [turnRef, loadNow, loaded] = useLoadTurn<HTMLElement>();
  return (
    <section
      ref={turnRef}
      id={id}
      // `clip`, not `hidden`: a box that clips with `hidden` would hold the photo's sticky in place.
      className="relative isolate overflow-clip bg-neutral-950 py-20 text-white md:py-28"
    >
      {/* Its turn comes in page order, after the first screen (src/lib/eager-images.ts). Until the cards sit side by
          side the band is several screens tall, and a photo stretched over all of it blew up a dark sliver of it:
          there it is one screen tall and stays behind the cards as they scroll (as PhotoBand, 2026-10-22). */}
      {loadNow && (
        <div className="absolute inset-0 -z-10">
          <img
            decoding="async"
            fetchPriority="low"
            src={background}
            alt={backgroundAlt}
            className="sticky top-0 h-svh w-full object-cover lg:absolute lg:inset-0 lg:h-full"
            style={position ? { objectPosition: position } : undefined}
            onLoad={loaded}
            onError={loaded}
          />
        </div>
      )}
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/55" />
      <div
        // Side by side from a computer; on a tablet two half-width cards squeezed the words and left the form floating
        // in a tall card (2026-10-21), so they stack there, each full width.
        className="mx-auto grid max-w-7xl gap-4 px-5 sm:px-8 lg:grid-cols-2"
      >
        {/* Its parts spread over the card's height when contact details close it; without them they sit together in
            the middle, never a hole between the steps and the card's foot (dev, 2026-10-21). */}
        <Card
          tone="glass"
          className={cn('gap-8 p-6 md:p-9', contact?.length || note ? 'justify-between' : 'justify-center')}
        >
          <div>
            {eyebrow && (
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-white/75">
                {eyebrow}
              </p>
            )}
            <h2
              className={cn(
                'text-3xl font-semibold tracking-tight text-balance md:text-4xl',
                eyebrow && 'mt-3',
              )}
            >
              {title}
            </h2>
            {intro && <div className="mt-4 text-lg leading-relaxed text-white/85">{intro}</div>}
          </div>
          {steps && steps.length > 0 && (
            <ol className="divide-y divide-white/10 border-y border-white/10">
              {steps.map((step, index) => (
                <li key={step} className="flex items-center gap-4 py-3.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-sm font-semibold text-[var(--brand-ink)]">
                    {index + 1}
                  </span>
                  <span className="text-[15px] leading-snug text-white/90">{step}</span>
                </li>
              ))}
            </ol>
          )}
          {(contact?.length || note) && (
            <div>
              {/* Two columns only where the card is wide: beside the form each was about 120 px on a narrow screen and
                  an email split mid-word (9 real sites, 2026-10-21). */}
              {contact && contact.length > 0 && (
                <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {contact.map((item) => (
                    <div key={item.label} className="min-w-0">
                      <dt className="text-xs font-medium uppercase tracking-[0.14em] text-white/60">
                        {item.label}
                      </dt>
                      <dd className="mt-1 text-[15px] [overflow-wrap:anywhere]">
                        {item.href ? (
                          <a href={item.href} className="underline-offset-4 hover:underline">
                            {breakAfterAt(item.value)}
                          </a>
                        ) : (
                          breakAfterAt(item.value)
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
              {note && (
                <p className={cn('text-sm text-white/65', contact?.length && 'mt-5')}>{note}</p>
              )}
            </div>
          )}
        </Card>
        <Card
          tone="glass"
          className={cn(
            // When the words card is the taller one, the form sits in the middle of its card, never over a gap.
            'justify-center p-6 md:p-9 [&_form]:grid [&_form]:gap-4',
            // Two to a row once the form has a few fields, unless the form pairs its own fields in rows already;
            // the long ones keep the full row.
            'sm:[&_form:has(>:nth-child(4)):not(:has(>div>label~label))]:grid-cols-2',
            'sm:[&_form>:is(button,[type=submit])]:col-span-full sm:[&_form>*:has(textarea,[role=radiogroup],[type=checkbox])]:col-span-full',
            // A short field that would sit alone on its row (just before a full-row one, or last) takes the row.
            // (No :has inside :has: browsers drop such a rule. col-span-full, never span-2: in a one-column form a span of
            // two adds a column.)
            'sm:[&_form>:nth-child(odd):has(+:is(button,[type=submit]),+*_textarea,+*_[role=radiogroup],+*_[type=checkbox])]:col-span-full',
            'sm:[&_form>:nth-child(odd):last-child]:col-span-full',
          )}
        >
          {children}
        </Card>
      </div>
    </section>
  );
}
