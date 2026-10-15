import { ArrowLeft, ImageIcon, Star, Trash2 } from 'lucide-react';
import type { FotoPais, Pais, Recipe } from '../types';
import type { Paises } from '../hooks/usePaises';
import { aHash } from '../lib/rutas';
import { banderaPais, nombrePais } from '../lib/paises';
import { errorMessage } from '../lib/errors';
import { irA } from '../hooks/useRuta';
import { RecipeGrid } from './RecipeGrid';
import { PaisEditor } from './PaisEditor';

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

const GIROS = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];

/** La página de un país: su portada, el contexto, la galería y sus recetas. */
export function PaisPagina({ codigo, pais, fotos, recetas, cargando, isAdmin, api, onRecetasCambiadas }: PaisPaginaProps) {
  const nombre = pais?.nombre ?? nombrePais(codigo);
  const vacio = !cargando && !pais && recetas.length === 0 && !isAdmin;

  const accion = (tarea: () => Promise<void>) => {
    tarea().catch((err) => window.alert(errorMessage(err, 'No se pudo completar la acción.')));
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <a href={aHash({ vista: 'pasaporte' })}
        className="inline-flex items-center gap-1.5 font-mono text-[12px] text-ink-soft hover:text-accent mb-6">
        <ArrowLeft size={14} /> Mi pasaporte
      </a>

      <header className="grid grid-cols-1 md:grid-cols-[minmax(0,320px)_1fr] gap-8 mb-12 items-start">
        {pais?.portada_url && (
          <div className="bg-white p-2.5 pb-10 shadow-md -rotate-2 max-w-[320px]">
            <img src={pais.portada_url} alt={`Portada de ${nombre}`} className="w-full aspect-[4/3] object-cover" />
            <div className="font-script text-2xl text-center text-ink mt-2">{nombre}</div>
          </div>
        )}
        <div className={pais?.portada_url ? '' : 'md:col-span-2'}>
          <div className="text-6xl leading-none mb-3" aria-hidden="true">{banderaPais(codigo)}</div>
          <h2 className="font-display font-black text-5xl sm:text-6xl leading-none text-ink mb-2">{nombre}</h2>
          {pais?.fecha_viaje && <p className="font-script text-3xl text-accent leading-none mb-4">{pais.fecha_viaje}</p>}
          {pais?.contexto && (
            <p className="text-ink-soft text-lg leading-relaxed max-w-2xl whitespace-pre-line">{pais.contexto}</p>
          )}
        </div>
      </header>

      {isAdmin && (
        // `key` reinicia el formulario al cambiar de país o al llegar la fila tras darla de alta.
        <PaisEditor key={`${codigo}-${pais ? 'alta' : 'sin-alta'}`} codigo={codigo} nombre={nombre} pais={pais}
          recetas={recetas.length} api={api} onRecetasCambiadas={onRecetasCambiadas} />
      )}

      {fotos.length > 0 && (
        <section className="mb-14">
          <div className="flex flex-wrap gap-6 justify-center">
            {fotos.map((f, i) => {
              const esPortada = pais?.portada_url === f.url;
              return (
                <figure key={f.id} className={`relative bg-white p-2 pb-8 shadow-md w-56 ${GIROS[i % GIROS.length]}`}>
                  <img src={f.url} alt={f.pie ?? `Foto de ${nombre}`} loading="lazy" className="w-full aspect-square object-cover" />
                  {f.pie && <figcaption className="font-script text-xl text-center text-ink mt-1 leading-tight">{f.pie}</figcaption>}
                  {isAdmin && (
                    <div className="absolute top-3.5 right-3.5 flex gap-1">
                      <button title={esPortada ? 'Quitar de portada' : 'Usar como portada'} aria-pressed={esPortada}
                        onClick={() => accion(() => api.guardar(codigo, { portada_url: esPortada ? null : f.url }))}
                        className={`w-7 h-7 grid place-items-center border-[1.5px] border-ink ${esPortada ? 'bg-yellow' : 'bg-paper hover:bg-yellow'}`}>
                        {esPortada ? <Star size={14} fill="currentColor" /> : <ImageIcon size={14} />}
                      </button>
                      <button title="Borrar foto"
                        onClick={() => { if (window.confirm('¿Borrar esta foto?')) accion(() => api.borrarFoto(f)); }}
                        className="w-7 h-7 grid place-items-center bg-paper border-[1.5px] border-ink text-hot hover:bg-hot-soft">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </figure>
              );
            })}
          </div>
        </section>
      )}

      {vacio ? (
        <p className="text-center font-script text-3xl text-ink-soft py-10">
          Todavía no hay nada de {nombre} en este pasaporte.
        </p>
      ) : (
        <section>
          <h3 className="font-display font-bold text-2xl mb-6 relative inline-block">
            <span className="relative z-10">Recetas de {nombre}</span>
            <span className="absolute left-[-2px] right-[-4px] bottom-[2px] h-2 bg-yellow -z-0 -skew-x-6" />
          </h3>
          <RecipeGrid recipes={recetas} loading={cargando} onRecipeClick={(r) => irA({ vista: 'receta', id: r.id })} />
        </section>
      )}
    </div>
  );
}
