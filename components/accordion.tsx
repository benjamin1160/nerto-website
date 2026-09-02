"use client";

import { useState, type ReactNode } from "react";
import { cx, Icon } from "./ui";

export type AccordionItem = {
  title: string;
  body: ReactNode;
};

export function Accordion({
  items,
  defaultOpen = 0,
}: {
  items: AccordionItem[];
  defaultOpen?: number | null;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`acc-panel-${i}`}
                id={`acc-btn-${i}`}
                className="group flex w-full items-center justify-between gap-6 py-6 text-left"
              >
                <span
                  className={cx(
                    "font-display text-xl leading-snug tracking-tight transition-colors sm:text-2xl",
                    isOpen ? "text-ember" : "text-ink group-hover:text-ember",
                  )}
                >
                  {item.title}
                </span>
                <span
                  className={cx(
                    "grid size-8 shrink-0 place-items-center rounded-full border transition-all duration-300",
                    isOpen
                      ? "rotate-90 border-ember text-ember"
                      : "border-line-strong text-muted group-hover:border-ink group-hover:text-ink",
                  )}
                >
                  <Icon.Chevron className="size-4" />
                </span>
              </button>
            </h3>
            <div
              id={`acc-panel-${i}`}
              role="region"
              aria-labelledby={`acc-btn-${i}`}
              hidden={!isOpen}
              className="pb-7 pr-12"
            >
              <div className="max-w-3xl text-[0.98rem] leading-relaxed text-muted [&_p+p]:mt-4">
                {item.body}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
