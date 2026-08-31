import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import type { Despensa } from '../hooks/useDespensa';
import { buscarIngredientes, type IngredienteDelCatalogo } from '../lib/inventario';
import { normalizeString } from '../lib/ingredientParser';

interface Props {
  catalogo: IngredienteDelCatalogo[];
  despensa: Despensa;
}

/**
 * Añadir a la despensa algo que no salió de una receta.
 *
 * Sugiere siempre sobre los ingredientes que ya existen en el catálogo, porque
 * con texto libre acabarían conviviendo "cebolla" y "cebollas" como cosas
 * distintas y la despensa dejaría de cruzarse con las recetas.
 *
 * Aun así deja escribir uno nuevo, que hace falta para lo que no aparece en
 * ninguna receta, pero solo con un segundo clic deliberado: si lo que escribes
 * ya existe con otro nombre, lo verás en las sugerencias antes de duplicarlo.
 */
export function AnadirIngrediente({ catalogo, despensa }: Props) {
  const [texto, setTexto] = useState('');

  const escrito = texto.trim();
  const sugerencias = buscarIngredientes(catalogo, escrito)
    .filter((i) => !despensa.tengo(i.base));
  const yaLoTienes = !!escrito && despensa.tengo(escrito);
  const esConocido = catalogo.some(
    (i) => normalizeString(i.base) === normalizeString(escrito)
  );

  const anadir = async (base: string) => {
    await despensa.anadir(base);
    setTexto('');
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 border-2 border-ink bg-white px-3 py-2 shadow-brut">
        <Search size={16} className="shrink-0 text-ink-soft" />
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && sugerencias[0]) void anadir(sugerencias[0].base);
            if (e.key === 'Escape') setTexto('');
          }}
          placeholder="Añadir a la despensa: sal, aceite de oliva…"
          className="flex-1 bg-transparent outline-none text-[15px] text-ink placeholder:text-ink-soft/70"
        />
      </div>

      {escrito && (
        <div className="mt-2 border-2 border-dashed border-ink/30 bg-paper-2 p-2">
          {yaLoTienes && (
            <p className="px-1 py-1.5 font-mono text-[11px] text-ink-soft">
              «{escrito}» ya está en tu despensa.
            </p>
          )}

          {sugerencias.map((i) => (
            <button
              key={i.base}
              onClick={() => void anadir(i.base)}
              className="w-full flex items-center justify-between gap-3 px-2 py-1.5 text-left
                         hover:bg-yellow/40 transition-colors group"
            >
              <span className="flex items-center gap-2 text-[14.5px] text-ink">
                <Plus size={13} className="text-accent" />
                {i.base}
              </span>
              <span className="font-mono text-[10.5px] text-ink-soft whitespace-nowrap">
                en {i.recetas} {i.recetas === 1 ? 'receta' : 'recetas'}
              </span>
            </button>
          ))}

          {!yaLoTienes && !esConocido && (
            <div className="px-1 pt-1.5 pb-1 border-t border-dashed border-ink/20 mt-1 first:border-0 first:mt-0 first:pt-1">
              <p className="font-mono text-[11px] text-ink-soft leading-snug mb-2">
                «{escrito}» no aparece en ninguna receta.
                {sugerencias.length > 0 && ' Mira antes si es alguno de arriba.'}
              </p>
              <button
                onClick={() => void anadir(escrito)}
                className="font-mono text-[11px] underline decoration-dotted underline-offset-2
                           text-ink hover:text-accent transition-colors"
              >
                Añadirlo de todas formas
              </button>
            </div>
          )}

          {!yaLoTienes && esConocido && sugerencias.length === 0 && (
            <p className="px-1 py-1.5 font-mono text-[11px] text-ink-soft">
              «{escrito}» ya está en tu despensa.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
