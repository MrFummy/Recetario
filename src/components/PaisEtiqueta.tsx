import { Globe2 } from 'lucide-react';
import { PAISES, nombrePais } from '../lib/paises';
import { Bandera } from './Bandera';

/** El país de una receta, como etiqueta con bandera. No pinta nada sin país. */
export function PaisEtiqueta({ codigo }: { codigo?: string | null }) {
  if (!codigo) return null;
  return (
    <span className="etiqueta etiqueta-neutra mb-4 ml-2 align-top">
      <Bandera codigo={codigo} alto={12} />
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
    <label className="etiqueta-campo mb-4 flex min-w-0 items-center gap-2">
      <Globe2 size={14} />
      País
      <select
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="campo-sello !mt-0 min-w-0 max-w-full flex-1 !py-1 !text-[12px]"
      >
        <option value="">{textoVacio}</option>
        {PAISES.map((p) => (
          <option key={p.codigo} value={p.codigo}>
            {p.nombre}
          </option>
        ))}
      </select>
    </label>
  );
}
