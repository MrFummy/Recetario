import type { User } from '@supabase/supabase-js';
import { Eraser, AlertTriangle, LogIn } from 'lucide-react';
import type { Json } from '../types';
import { normalizeIngredients, normalizeSteps } from '../lib/recipeContent';
import { useDespensa } from '../hooks/useDespensa';

interface IngredientsListProps {
  data: Json;
  user?: User | null;
}

/**
 * Lista de ingredientes con la despensa del usuario.
 *
 * Marcar un ingrediente lo guarda como "lo tengo en casa", no como "lo tengo
 * para esta receta": vale para todas las que lo lleven. Sin sesión el marcado
 * sigue funcionando, pero solo durante la visita.
 */
export function IngredientsList({ data, user }: IngredientsListProps) {
  const items = normalizeIngredients(data);
  const { tengo, alternar, quitarVarios, error } = useDespensa(user);

  if (items.length === 0) {
    return <p className="text-ink-soft italic font-mono text-sm">sin ingredientes</p>;
  }

  const marcables = items.filter((i) => !i.esGrupo && i.base);
  const marcados = marcables.filter((i) => tengo(i.base!));

  return (
    <>
      <ul className="list-none p-0 m-0">
        {items.map((item, idx) => {
          if (item.esGrupo) {
            return (
              <li
                key={item.id ?? `grupo-${idx}`}
                className="pt-4 pb-1 first:pt-0 font-mono text-[11px] uppercase tracking-wider text-accent"
              >
                {item.name}
              </li>
            );
          }
          const clave = item.base;
          const done = !!clave && tengo(clave);
          return (
            <li
              key={item.id ?? idx}
              className={`grid grid-cols-[20px_auto_1fr] gap-2.5 py-2 text-[14.5px] leading-snug items-baseline border-b border-dashed border-ink/15 last:border-0 cursor-pointer select-none ${done ? 'opacity-40' : ''}`}
              onClick={() => clave && void alternar(clave)}
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

      {error && (
        <p className="mt-3 flex items-start gap-1.5 font-mono text-[11px] text-hot leading-snug">
          <AlertTriangle size={13} className="shrink-0 mt-px" /> {error}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 font-mono text-[11px] text-ink-soft">
        <span>
          {marcados.length > 0
            ? `tienes ${marcados.length} de ${marcables.length}`
            : 'marca lo que ya tengas en casa'}
        </span>
        {user && marcados.length > 0 && (
          <button
            onClick={() => void quitarVarios(marcados.map((i) => i.base!))}
            className="flex items-center gap-1.5 underline decoration-dotted underline-offset-2 hover:text-hot transition-colors"
            title="Los quita de tu despensa, para empezar de cero con la próxima elaboración"
          >
            <Eraser size={12} /> vaciar los de esta receta
          </button>
        )}
      </div>

      {/*
        Sin sesión el marcado solo vive en memoria. El aviso tiene que ser
        imposible de pasar por alto: la sesión se guarda por origen, así que
        estar dentro en el sitio publicado no implica estarlo en otro, y el
        síntoma —marco algo y al volver no está— parece un fallo del programa.
      */}
      {!user && (
        <div className="mt-3 flex items-start gap-2 border-2 border-dashed border-ink/30 bg-yellow/25 px-3 py-2">
          <LogIn size={14} className="shrink-0 mt-0.5 text-ink" />
          <p className="font-mono text-[11px] leading-snug text-ink">
            Sin sesión iniciada.{' '}
            <span className="text-ink-soft">
              Puedes marcar ingredientes, pero se perderán al cerrar la receta.
            </span>
          </p>
        </div>
      )}
    </>
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
