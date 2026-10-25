import { CalendarDays, ChevronRight, Clock, Mail, MapPin, MessageCircle, Phone, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type ContactKind = 'call' | 'text' | 'whatsapp' | 'email' | 'visit' | 'hours' | 'book';
/** One way to reach the business: `label` is the small word over it ("Call", "Llámanos"), `value` what it is. */
export type ContactItem = { kind: ContactKind; label: string; value: ReactNode; href?: string };

const ICONS: Record<ContactKind, LucideIcon> = {
  call: Phone,
  text: MessageCircle,
  whatsapp: MessageCircle,
  email: Mail,
  visit: MapPin,
  hours: Clock,
  book: CalendarDays,
};

/** Where a card opens: the phone, messages, mail or the map, from its value when no `href` is given. */
function linkFor({ kind, value, href }: ContactItem) {
  if (href) return href;
  if (typeof value !== 'string') return undefined;
  const digits = value.replace(/[^\d+]/g, '');
  if (kind === 'call') return `tel:${digits}`;
  if (kind === 'text') return `sms:${digits}`;
  if (kind === 'whatsapp') return `https://wa.me/${digits.replace(/^\+/, '')}`;
  if (kind === 'email') return `mailto:${value.trim()}`;
  if (kind === 'visit') return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
  return undefined;
}

/**
 * The ways to reach a business, each its own card that does what it says: Call opens the phone, Email the mail app,
 * Visit the map, and Hours just shows them. An icon in a soft circle of the brand color, the label over the value
 * and an arrow on the ones that open something. `tone="glass"` over a photo. A strip of three contact details in one
 * glass bar read as a footer stuck in the page (owner, 2026-10-22: "at least make it individual cards").
 */
export function ContactCards({
  items,
  tone = 'plain',
  className,
}: {
  items: ContactItem[];
  tone?: 'plain' | 'glass';
  className?: string;
}) {
  const n = items.length;
  return (
    <div
      className={cn(
        'grid gap-3 sm:grid-cols-2',
        n === 3 && 'md:grid-cols-3',
        (n === 4 || n > 5) && 'lg:grid-cols-4',
        // Five: three and two in the middle, not four and one left alone (the kit's audit, 2026-10-24).
        n === 5 && 'lg:grid-cols-6 lg:[&>*]:col-span-2 lg:[&>:nth-last-child(2)]:col-start-2',
        n > 1 &&
          n % 2 === 1 &&
          (n === 3
            ? 'sm:max-md:[&>:last-child]:col-span-2 sm:max-md:[&>:last-child]:w-[calc(50%-0.375rem)] sm:max-md:[&>:last-child]:justify-self-center'
            : 'sm:max-lg:[&>:last-child]:col-span-2 sm:max-lg:[&>:last-child]:w-[calc(50%-0.375rem)] sm:max-lg:[&>:last-child]:justify-self-center'),
        n === 1 && 'max-w-md sm:grid-cols-1',
        className,
      )}
    >
      {items.map((item, i) => {
        const Icon = ICONS[item.kind];
        const href = linkFor(item);
        const external = href?.startsWith('http');
        return (
          <Card
            key={i}
            tone={tone}
            href={href}
            {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
            className="flex flex-row items-center gap-4 p-5"
          >
            <span
              className={cn(
                'grid size-11 shrink-0 place-items-center rounded-full',
                tone === 'glass'
                  ? 'bg-white/15 text-white'
                  : 'bg-[color-mix(in_oklab,var(--brand)_16%,transparent)] text-[var(--brand)]',
              )}
            >
              <Icon aria-hidden className="size-5" strokeWidth={2} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm opacity-70">{item.label}</span>
              <span className="mt-0.5 block font-semibold [overflow-wrap:anywhere]">{item.value}</span>
            </span>
            {href && <ChevronRight aria-hidden className="size-4 shrink-0 opacity-50" />}
          </Card>
        );
      })}
    </div>
  );
}
