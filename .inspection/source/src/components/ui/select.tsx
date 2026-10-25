import { Check, ChevronDown } from 'lucide-react';
import { Select as Radix } from 'radix-ui';
import { useId, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type SelectOption = { value: string; label: string };

/** The empty field's words follow the page's own language (the site's <html lang>), like the kit's other words. */
function chooseWords(): string {
  return typeof document !== 'undefined' && document.documentElement.lang.toLowerCase().startsWith('es') ? 'Elige una opción' : 'Choose one';
}

/**
 * A choice from a short list (apple-design: a menu that grows from its control, a material surface, a check on the
 * chosen row), never the system's own list, which looks dated. The field matches the page's fields; the list opens
 * as a glass menu as wide as the field, grows from it, and keeps arrow keys, typing to jump, Enter and Escape.
 * Inside a `<form>`, `name` sends the value like a native select. `label` shows above the field, like every other
 * field's label: it was for screen readers only, and phones showed "Choose one" with no question (dev, 2026-10-20).
 */
export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = chooseWords(),
  name,
  required,
  label,
  className,
}: {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  name?: string;
  required?: boolean;
  /** The question above the field ("Who is the lesson for?"); then write no other label for it. */
  label?: string;
  className?: string;
}) {
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  const [own, setOwn] = useState(true);
  // A page that wrote the question itself just before the field (`<span>Size</span>`, or a `<label>` holding the
  // words and the Select) keeps its own: the kit's would say it twice. A field just before is never that.
  useLayoutEffect(() => {
    const before = box.current?.previousSibling;
    const control = before instanceof Element && before.querySelector('input, textarea, select, button');
    const words = before?.textContent?.toLowerCase() ?? '';
    if (label && !control && words.includes(label.trim().toLowerCase())) setOwn(false);
  }, [label]);
  const field = (
    <Radix.Root value={value} defaultValue={defaultValue} onValueChange={onValueChange} name={name} required={required}>
      <Radix.Trigger
        id={id}
        aria-label={label}
        className={cn(
          'flex h-12 w-full items-center justify-between gap-3 rounded-xl px-4 text-left text-base outline-none',
          'bg-white text-[#1d1d1f] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)] dark:bg-[rgb(120_120_128/0.16)] dark:text-inherit dark:shadow-none',
          'focus-visible:ring-2 focus-visible:ring-[var(--brand)] data-[placeholder]:opacity-60',
          className,
        )}
      >
        <Radix.Value placeholder={placeholder} />
        <Radix.Icon asChild>
          <ChevronDown aria-hidden className="size-4 shrink-0 opacity-60" />
        </Radix.Icon>
      </Radix.Trigger>
      <Radix.Portal>
        <Radix.Content
          position="popper"
          sideOffset={8}
          className={cn(
            'z-50 max-h-[min(22rem,var(--radix-select-content-available-height))] w-[var(--radix-select-trigger-width)] min-w-44 overflow-hidden rounded-2xl p-1.5',
            'bg-white/80 text-[#1d1d1f] shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_18px_48px_-12px_rgb(0_0_0/0.35)] backdrop-blur-2xl backdrop-saturate-150',
            'dark:bg-[rgb(40_40_44/0.82)] dark:text-white dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08),0_18px_48px_-12px_rgb(0_0_0/0.7)]',
          )}
        >
          <Radix.Viewport>
            {options.map((option) => (
              <Radix.Item
                key={option.value}
                value={option.value}
                className="relative flex min-h-11 cursor-pointer select-none items-center rounded-xl py-2.5 pr-3 pl-9 text-base outline-none transition-colors duration-100 data-[highlighted]:bg-[var(--brand)] data-[highlighted]:text-[var(--brand-ink)]"
              >
                <Radix.ItemIndicator className="absolute left-3 inline-flex">
                  <Check aria-hidden className="size-4" strokeWidth={2.5} />
                </Radix.ItemIndicator>
                <Radix.ItemText>{option.label}</Radix.ItemText>
              </Radix.Item>
            ))}
          </Radix.Viewport>
        </Radix.Content>
      </Radix.Portal>
    </Radix.Root>
  );
  if (!label) return field;
  return (
    <div ref={box} className="grid gap-1.5">
      {own && (
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
      )}
      {field}
    </div>
  );
}
