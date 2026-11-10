import type { User } from '@supabase/supabase-js';
import { Eraser, AlertTriangle, LogIn } from 'lucide-react';
import type { Json } from '../types';
import { normalizeIngredients, normalizeSteps } from '../lib/recipeContent';
import { aHash } from '../lib/rutas';
import type { Despensa } from '../hooks/useDespensa';

interface IngredientsListProps {
  data: Json;
  user?: User | null;
  despensa: Despensa;
}

/**
 * Lista de ingredientes con la despensa del usuario.
 *
 * Marcar un ingrediente lo guarda como "lo tengo en casa", no como "lo tengo
 * para esta receta": vale para todas las que lo lleven. Sin sesión el marcado
 * sigue funcionando, pero solo durante la visita.
 *
 * La despensa llega por props y no de un `useDespensa` propio: es la misma que
 * usa la sección `#/despensa`, y con una copia por lista lo marcado aquí no se
 * vería allí.
 */
export function IngredientsList({ data, user, despensa }: IngredientsListProps) {
  const items = normalizeIngredients(data);
  const { tengo, alternar, quitarVarios, error } = despensa;

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
                className="pt-5 pb-1 first:pt-0 kicker"
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
              className={`grid grid-cols-[22px_fit-content(45%)_minmax(0,1fr)] gap-2.5 py-2.5 text-[14.5px] leading-snug items-center border-b border-rule last:border-0 cursor-pointer select-none ${done ? 'opacity-50' : ''}`}
              onClick={() => clave && void alternar(clave)}
            >
              <span
                className={`grid h-[22px] w-[22px] place-items-center rounded-full border-[1.5px] border-ink transition-all duration-300 [transition-timing-function:cubic-bezier(.3,1.7,.5,1)] ${done ? 'rotate-[-12deg] scale-110 bg-accent text-paper shadow-[2px_2px_0_var(--color-ink)]' : 'bg-paper-2'}`}
                aria-hidden
              >
                {done && <span className="text-[12px] font-extrabold leading-none">✓</span>}
              </span>
              <span className={`w-fit rounded-full bg-cobalt px-2.5 py-0.5 font-sello text-[11px] font-extrabold uppercase text-paper break-words ${done ? 'line-through' : ''}`}>
                {item.qty || '—'}
              </span>
              <span className={`text-ink ${done ? 'line-through decoration-accent decoration-[1.5px]' : ''}`}>
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
            ? `tienes ${marcados.length} de ${marcables.length} · `
            : 'marca lo que ya tengas en casa · '}
          {user && (
            <a
              href={aHash({ vista: 'despensa' })}
              className="underline decoration-dotted underline-offset-2 hover:text-accent transition-colors"
            >
              tu despensa
            </a>
          )}
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
        <div className="mt-3 flex items-start gap-2 rounded-[3px] border-[1.5px] border-ink bg-yellow-soft px-3 py-2">
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

/** Lista de pasos numerados; cada número es un sello con el color de la categoría. */
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
          className="grid grid-cols-[56px_1fr] gap-[18px] py-4 items-start border-b border-rule last:border-0"
        >
          <div className="sello !h-11 !w-11 !-rotate-6 font-display text-[22px] !font-extrabold !shadow-[2px_2px_0_var(--color-ink)]">
            {idx + 1}
          </div>
          <div className="pt-2.5 text-[15px] leading-relaxed text-ink">{text}</div>
        </li>
      ))}
    </ol>
  );
}
