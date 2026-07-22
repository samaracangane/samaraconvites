import type { ReactNode } from "react";

export function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </span>
        )}
        <h2 className="font-display text-2xl md:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}
