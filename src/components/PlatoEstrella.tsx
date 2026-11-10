import { StarRating } from './StarRating';
import type { Recipe } from '../types';
import type { AcentoPais } from '../lib/colorBandera';
import placeholderImg from '../assets/placeholder.jpg';

interface PlatoEstrellaProps {
  receta: Recipe;
  acento: AcentoPais | null;
  onClick: () => void;
}

/** Parte el título para poner la última palabra en cursiva de color. */
function partirTitulo(titulo: string): [string, string | null] {
  const palabras = titulo.trim().split(' ');
  if (palabras.length < 2) return [titulo, null];
  const ultima = palabras.pop() ?? null;
  return [palabras.join(' '), ultima];
}

/** La receta destacada de un país: una banda a todo el ancho antes de la cuadrícula. */
export function PlatoEstrella({ receta, acento, onClick }: PlatoEstrellaProps) {
  const datos = [receta.tiempo, receta.porciones, receta.dificultad].filter((d): d is string => Boolean(d));
  const [inicio, ultima] = partirTitulo(receta.titulo);
  const color = acento?.oscuro ?? 'var(--color-accent)';

  return (
    <button
      type="button"
      onClick={onClick}
      className="group mb-14 grid w-full grid-cols-1 items-center gap-6 border-y-[1.5px] border-ink bg-paper-2 p-5 text-left sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] sm:gap-10 sm:p-8"
    >
      <div className="relative">
        <div className="arco aspect-[4/4.4] border-[1.5px] border-ink">
          <img src={receta.foto_url || placeholderImg} alt={receta.titulo} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>
        <span className="sello absolute -right-3 top-3 h-[88px] w-[88px] !bg-yellow !text-ink text-[11px] sm:-right-5">
          Plato<br />estrella
        </span>
      </div>
      <div>
        <p className="kicker mb-4" style={{ color }}>La mejor valorada de aquí</p>
        <h3 className="mb-5 font-display text-4xl font-light leading-[0.95] tracking-[-0.035em] text-ink sm:text-6xl">
          {inicio}{ultima && <> <em className="font-normal" style={{ color }}>{ultima}</em></>}
        </h3>
        {receta.rating ? <StarRating rating={receta.rating} size={16} /> : null}
        {datos.length > 0 && <p className="mt-3 font-mono text-[12px] text-ink-soft">{datos.join(' · ')}</p>}
        <span className="boton-sello mt-6">Ver receta →</span>
      </div>
    </button>
  );
}
