import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ListChecks } from 'lucide-react';
import type { Recipe } from '../types';
import { normalizeIngredients, normalizeSteps } from '../lib/recipeContent';
import { useWakeLock } from '../hooks/useWakeLock';
import { useTemporizadores } from '../hooks/useTemporizadores';
import { PasoConTiempos } from './PasoConTiempos';
import { TemporizadoresBarra } from './TemporizadoresBarra';

interface ModoCocinaProps {
  recipe: Recipe;
  onClose: () => void;
}

/**
 * Un paso a la vez, en grande y con la pantalla siempre encendida: pensado
 * para mirarlo de lejos con las manos ocupadas. Es solo lectura; marcar lo que
 * tienes en casa se hace en la ficha normal.
 */
export function ModoCocina({ recipe, onClose }: ModoCocinaProps) {
  const pasos = normalizeSteps(recipe.pasos);
  const ingredientes = normalizeIngredients(recipe.ingredientes);
  const [indice, setIndice] = useState(0);
  const [verIngredientes, setVerIngredientes] = useState(false);

  useWakeLock(true);
  const { temporizadores, iniciar, ajustar, parar } = useTemporizadores();

  const ultimo = Math.max(pasos.length - 1, 0);
  const anterior = () => setIndice((i) => Math.max(i - 1, 0));
  const siguiente = () => setIndice((i) => Math.min(i + 1, ultimo));

  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIndice((i) => Math.min(i + 1, ultimo));
      else if (e.key === 'ArrowLeft') setIndice((i) => Math.max(i - 1, 0));
      else if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', alPulsar, true);
    return () => window.removeEventListener('keydown', alPulsar, true);
  }, [ultimo, onClose]);

  return (
    <div className="fixed inset-0 z-[60] bg-ink text-paper flex flex-col" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`Modo cocina: ${recipe.titulo}`}>
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-dashed border-paper/25 shrink-0">
        <h2 className="font-display font-bold text-lg truncate">{recipe.titulo}</h2>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setVerIngredientes((v) => !v)}
            aria-pressed={verIngredientes}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold border-[1.5px] border-paper/60 transition-colors ${verIngredientes ? 'bg-yellow text-ink' : 'hover:bg-paper/10'}`}
          >
            <ListChecks size={15} /> ingredientes
          </button>
          <button onClick={onClose} title="Salir del modo cocina" className="p-2 hover:bg-paper/10 transition-colors">
            <X size={22} />
          </button>
        </div>
      </div>

      <TemporizadoresBarra temporizadores={temporizadores} ajustar={ajustar} parar={parar} />

      <div className="h-1 bg-paper/15 shrink-0">
        <div
          className="h-full bg-yellow transition-all duration-300"
          style={{ width: pasos.length ? `${((indice + 1) / pasos.length) * 100}%` : '0%' }}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-8 flex">
        {verIngredientes ? (
          <ul className="m-auto w-full max-w-2xl list-none p-0 space-y-3">
            {ingredientes.map((ing, i) =>
              ing.esGrupo ? (
                <li key={i} className="pt-3 font-mono text-xs uppercase tracking-widest text-yellow">{ing.name}</li>
              ) : (
                <li key={ing.id ?? i} className="flex gap-4 text-2xl sm:text-3xl leading-snug">
                  <span className="font-mono text-yellow min-w-[7ch]">{ing.qty || '—'}</span>
                  <span>{ing.name}</span>
                </li>
              ),
            )}
          </ul>
        ) : pasos.length === 0 ? (
          <p className="m-auto font-mono text-paper/70">Esta receta no tiene pasos.</p>
        ) : (
          <div className="m-auto w-full max-w-3xl">
            <div className="font-mono text-sm tracking-widest uppercase text-yellow mb-4">
              paso {indice + 1} de {pasos.length}
            </div>
            <p className="text-3xl sm:text-5xl leading-snug font-medium">
              <PasoConTiempos texto={pasos[indice]} onIniciar={(s, e) => iniciar(s, `paso ${indice + 1} · ${e}`)} />
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 border-t border-dashed border-paper/25 shrink-0">
        <button
          onClick={anterior}
          disabled={indice === 0 || verIngredientes}
          className="flex items-center justify-center gap-2 py-5 text-xl font-semibold border-2 border-paper/60 hover:bg-paper/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronLeft size={26} /> Anterior
        </button>
        <button
          onClick={indice === ultimo ? onClose : siguiente}
          disabled={verIngredientes}
          className="flex items-center justify-center gap-2 py-5 text-xl font-bold bg-yellow text-ink border-2 border-yellow disabled:opacity-30 transition-opacity"
        >
          {indice === ultimo ? '¡Listo!' : <>Siguiente <ChevronRight size={26} /></>}
        </button>
      </div>
    </div>
  );
}
