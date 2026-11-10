import { useEffect, type CSSProperties } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { FotoPais, Pais, Recipe } from '../types';
import type { Paises } from '../hooks/usePaises';
import { aHash } from '../lib/rutas';
import { nombrePais } from '../lib/paises';
import { FOTOS_CABECERA, platoEstrella } from '../lib/pasaporte';
import { useAcentoPais } from '../hooks/useAcentoPais';
import { Bandera } from './Bandera';
import { irA } from '../hooks/useRuta';
import { RecipeGrid } from './RecipeGrid';
import { PaisEditor } from './PaisEditor';
import { FichaPais } from './FichaPais';
import { PlatoEstrella } from './PlatoEstrella';
import { SelloPasaporte } from './SelloPasaporte';

interface PaisPaginaProps {
  codigo: string;
  /** La fila de `paises`; `null` si el país no está dado de alta (solo tiene recetas). */
  pais: Pais | null;
  fotos: FotoPais[];
  recetas: Recipe[];
  cargando: boolean;
  isAdmin: boolean;
  api: Paises;
  onRecetasCambiadas: () => void;
}

/** La página de un país: cabecera ambientada con unas pocas fotos, el contexto y sus recetas. */
export function PaisPagina({ codigo, pais, fotos, recetas, cargando, isAdmin, api, onRecetasCambiadas }: PaisPaginaProps) {
  const nombre = pais?.nombre ?? nombrePais(codigo);
  const acento = useAcentoPais(codigo);
  // La cenefa de la cabecera de la app toma el color de la bandera mientras se está en la página del país.
  useEffect(() => {
    if (!acento) return;
    document.documentElement.style.setProperty('--cenefa', acento.vivo);
    return () => { document.documentElement.style.removeProperty('--cenefa'); };
  }, [acento]);
  const estrella = platoEstrella(recetas, pais?.plato_estrella);
  const vacio = !cargando && !pais && recetas.length === 0 && !isAdmin;

  // La portada va primero; las demás, por orden de subida.
  const destacadas = [...fotos].sort((a, b) => Number(b.url === pais?.portada_url) - Number(a.url === pais?.portada_url))
    .slice(0, FOTOS_CABECERA);

  const estilo = acento ? ({ '--k': acento.vivo } as CSSProperties) : undefined;
  const color = acento?.oscuro ?? 'var(--color-accent)';
  const palabras = nombre.split(' ');
  const ultima = palabras.length > 1 ? palabras.pop() : null;
  const inicio = ultima ? palabras.join(' ') : '';
  const [grande, redonda, pequena] = destacadas;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={estilo}>
      <a href={aHash({ vista: 'pasaporte' })}
        className="mb-6 inline-flex items-center gap-1.5 font-mono text-[12px] text-ink-soft hover:text-accent">
        <ArrowLeft size={14} /> Mi pasaporte
      </a>

      <header className="mb-2 grid grid-cols-1 items-center gap-8 md:grid-cols-[1.15fr_1fr] md:gap-12">
        <div>
          <span className="etiqueta etiqueta-neutra !pl-1.5">
            <Bandera codigo={codigo} alto={16} /> {nombre}
          </span>
          <h2 className="mt-5 text-balance font-display text-[clamp(3.25rem,9vw,7.5rem)] font-light leading-[0.9] tracking-[-0.045em] text-ink">
            {inicio}{ultima ? <> <em className="font-normal" style={{ color }}>{ultima}</em></> : <em className="font-normal" style={{ color }}>{nombre}</em>}
          </h2>
          {pais?.lema && <p className="mt-4 font-script text-3xl font-bold leading-tight text-ink-soft">{pais.lema}</p>}
          {pais?.fecha_viaje && <p className="mt-1 font-script text-3xl font-bold leading-none" style={{ color }}>{pais.fecha_viaje}</p>}
        </div>

        {/* Collage: un arco grande con la sombra del color del país, un círculo y otro arco; el sello solapa. */}
        {grande ? (
          <div className="relative mx-auto aspect-[1/0.9] w-full max-w-[460px] md:max-w-none">
            <div className="arco absolute left-0 top-0 aspect-[4/5] w-[56%] border-[1.5px] border-ink shadow-[6px_6px_0_var(--k,var(--color-accent))]">
              <img src={grande.url} alt={grande.pie ?? `Foto de ${nombre}`} title={grande.pie ?? undefined} className="h-full w-full object-cover" />
            </div>
            {redonda && (
              <div className="absolute right-[2%] top-[10%] aspect-square w-[40%] overflow-hidden rounded-full border-[1.5px] border-ink">
                <img src={redonda.url} alt={redonda.pie ?? `Foto de ${nombre}`} title={redonda.pie ?? undefined} className="h-full w-full object-cover" />
              </div>
            )}
            {pequena && (
              <div className="arco absolute bottom-[-2%] right-[12%] aspect-square w-[32%] border-[1.5px] border-ink">
                <img src={pequena.url} alt={pequena.pie ?? `Foto de ${nombre}`} title={pequena.pie ?? undefined} className="h-full w-full object-cover" />
              </div>
            )}
            {pais && (
              <SelloPasaporte nombre={nombre} fecha={pais.fecha_viaje} color={acento?.oscuro}
                className="absolute bottom-[-4%] left-[40%] z-10 w-[36%] -rotate-12" />
            )}
          </div>
        ) : pais ? (
          <SelloPasaporte nombre={nombre} fecha={pais.fecha_viaje} color={acento?.oscuro} className="mx-auto w-44 -rotate-12 md:w-56" />
        ) : null}
      </header>

      <FichaPais pais={pais} />
      {pais?.contexto && (
        <p className="mb-2 mt-8 max-w-[60ch] whitespace-pre-line text-lg leading-relaxed text-ink">{pais.contexto}</p>
      )}
      <div className="mb-12" />

      {isAdmin && (
        // `key` reinicia el formulario al cambiar de país o al llegar la fila tras darla de alta.
        <PaisEditor key={`${codigo}-${pais ? 'alta' : 'sin-alta'}`} codigo={codigo} nombre={nombre} pais={pais}
          recetas={recetas} fotos={fotos} visibles={FOTOS_CABECERA} api={api} onRecetasCambiadas={onRecetasCambiadas} />
      )}

      {estrella && (
        <PlatoEstrella receta={estrella.receta} acento={acento}
          onClick={() => irA({ vista: 'receta', id: estrella.receta.id })} />
      )}

      {vacio ? (
        <p className="text-center font-script text-3xl text-ink-soft py-10">
          Todavía no hay nada de {nombre} en este pasaporte.
        </p>
      ) : (
        <section>
          <h3 className="seccion-titulo mb-7">Recetas de {nombre}</h3>
          <RecipeGrid recipes={recetas} loading={cargando} onRecipeClick={(r) => irA({ vista: 'receta', id: r.id })} />
        </section>
      )}
    </div>
  );
}
