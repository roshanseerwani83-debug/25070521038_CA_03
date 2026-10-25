import { MapPin } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Where to find the business: a map of `address` beside its details (`children`: the address, hours, how to get there,
 * buttons), in one card; the map on top on a phone. The map is Google's for the address, darkened in dark mode, and
 * shows a soft panel with a pin while it loads, never an empty box (a lazy map photographed before it arrived read as
 * an empty card: 2026-10-22). Directions are a link to `https://www.google.com/maps/search/?api=1&query=` and the
 * address; put it in `children` as a button.
 */
export function MapCard({
  address,
  title,
  side = 'right',
  className,
  children,
}: {
  address: string;
  /** The map's name for screen readers: "Map of Grano Alto in El Poblado". */
  title: string;
  /** Which side the map is on from tablets up. */
  side?: 'left' | 'right';
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card className={cn('grid gap-0 overflow-hidden p-0 md:grid-cols-5', className)}>
      {/* In the middle of its side: a heading and an address at the top of a map-tall panel left it mostly empty below
          (the kit's audit, 2026-10-24). */}
      <div className={cn('flex flex-col gap-4 p-6 md:col-span-2 md:justify-center md:p-8', side === 'left' && 'md:order-2')}>
        {children}
      </div>
      <div className="relative min-h-64 bg-[rgb(120_120_128/0.14)] max-md:order-first md:col-span-3 md:min-h-96">
        <MapPin aria-hidden className="absolute top-1/2 left-1/2 size-8 -translate-1/2 text-[var(--brand)] opacity-60" />
        <iframe
          title={title}
          src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`}
          loading="lazy"
          // Nothing at all: the full address handed Google the preview's pass
          // (`/__wb_view/…`), and this keyless embed renders with no Referer
          // (headless Chromium on dev, 2026-10-25).
          referrerPolicy="no-referrer"
          className="absolute inset-0 size-full border-0 dark:[filter:invert(0.92)_hue-rotate(180deg)_saturate(0.8)]"
        />
      </div>
    </Card>
  );
}
