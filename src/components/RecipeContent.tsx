import { useState } from 'react';
import type { Json } from '../types';
import { normalizeIngredients, normalizeSteps } from '../lib/recipeContent';

/** Lista de ingredientes con checkboxes locales (no persisten entre visitas). */
export function IngredientsList({ data }: { data: Json }) {
  const items = normalizeIngredients(data);
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  if (items.length === 0) {
    return <p className="text-ink-soft italic font-mono text-sm">sin ingredientes</p>;
  }

  return (
    <ul className="list-none p-0 m-0">
      {items.map((item, idx) => {
        const done = !!checked[idx];
        return (
          <li
            key={idx}
            className={`grid grid-cols-[20px_auto_1fr] gap-2.5 py-2 text-[14.5px] leading-snug items-baseline border-b border-dashed border-ink/15 last:border-0 cursor-pointer select-none ${done ? 'opacity-40' : ''}`}
            onClick={() => setChecked((c) => ({ ...c, [idx]: !c[idx] }))}
          >
            <span
              className={`relative w-4 h-4 border-[1.6px] border-ink rounded-[3px] self-center transition-colors ${done ? 'bg-ink' : 'bg-white'}`}
              aria-hidden
            >
              {done && (
                <span className="absolute -top-1 left-px font-script text-[22px] leading-none text-hot">✓</span>
              )}
            </span>
            <span className={`font-mono text-[12.5px] font-medium text-accent whitespace-nowrap ${done ? 'line-through decoration-hot decoration-[1.5px]' : ''}`}>
              {item.qty || '—'}
            </span>
            <span className={`text-ink ${done ? 'line-through decoration-hot decoration-[1.5px]' : ''}`}>
              {item.name}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Lista de pasos numerados con números circulados a mano. */
export function StepsList({ data }: { data: Json }) {
  const steps = normalizeSteps(data);

  if (steps.length === 0) {
    return <p className="text-ink-soft italic font-mono text-sm">sin pasos</p>;
  }

  return (
    <ol className="list-none p-0 m-0">
      {steps.map((text, idx) => (
        <li
          key={idx}
          className="grid grid-cols-[56px_1fr] gap-[18px] py-4 items-start border-b border-dashed border-ink/15 last:border-0"
        >
          <div className="relative w-12 h-12 grid place-items-center font-display font-black text-[28px] text-ink leading-none">
            <span className="absolute inset-0 border-[2.2px] border-ink rounded-full -rotate-[4deg] scale-x-[1.05] scale-y-[0.92]" />
            <span className="absolute inset-[3px] border border-ink/40 rounded-full rotate-[6deg] scale-x-100 scale-y-[0.96]" />
            <span className="relative">{idx + 1}</span>
          </div>
          <div className="pt-2.5 text-[15px] leading-relaxed text-ink">{text}</div>
        </li>
      ))}
    </ol>
  );
}
