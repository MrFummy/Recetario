import { Globe2 } from 'lucide-react';
import { PAISES, banderaPais, nombrePais } from '../lib/paises';

/** El país de una receta, como etiqueta con bandera. No pinta nada sin país. */
export function PaisEtiqueta({ codigo }: { codigo?: string | null }) {
  if (!codigo) return null;
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-widest uppercase text-ink bg-yellow/60 px-2.5 py-1 mb-4 ml-2 align-top">
      <span aria-hidden="true">{banderaPais(codigo)}</span>
      {nombrePais(codigo)}
    </span>
  );
}

interface PaisSelectProps {
  valor: string;
  onChange: (codigo: string) => void;
  /** Texto de la opción vacía (la cadena vacía). Por defecto, «Sin país». */
  textoVacio?: string;
}

/** Selector de país; la cadena vacía es «sin país». */
export function PaisSelect({ valor, onChange, textoVacio = 'Sin país' }: PaisSelectProps) {
  return (
    <label className="flex items-center gap-2 mb-4 font-mono text-[11px] text-ink-soft">
      <Globe2 size={14} />
      País
      <select
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="border border-ink/30 bg-paper text-ink px-2 py-1 text-[12px] focus:outline-none focus:border-ink"
      >
        <option value="">{textoVacio}</option>
        {PAISES.map((p) => (
          <option key={p.codigo} value={p.codigo}>
            {banderaPais(p.codigo)} {p.nombre}
          </option>
        ))}
      </select>
    </label>
  );
}
