import { ArrowLeft } from 'lucide-react';
import type { FotoPais, Pais, Recipe } from '../types';
import type { Paises } from '../hooks/usePaises';
import { aHash } from '../lib/rutas';
import { nombrePais, urlBandera } from '../lib/paises';
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

const GIROS = ['-rotate-3', 'rotate-2', '-rotate-1'];

/** La página de un país: cabecera ambientada con unas pocas fotos, el contexto y sus recetas. */
export function PaisPagina({ codigo, pais, fotos, recetas, cargando, isAdmin, api, onRecetasCambiadas }: PaisPaginaProps) {
  const nombre = pais?.nombre ?? nombrePais(codigo);
  const acento = useAcentoPais(codigo);
  const estrella = platoEstrella(recetas, pais?.plato_estrella);
  const vacio = !cargando && !pais && recetas.length === 0 && !isAdmin;

  // La portada va primero; las demás, por orden de subida.
  const destacadas = [...fotos].sort((a, b) => Number(b.url === pais?.portada_url) - Number(a.url === pais?.portada_url))
    .slice(0, FOTOS_CABECERA);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <a href={aHash({ vista: 'pasaporte' })}
        className="inline-flex items-center gap-1.5 font-mono text-[12px] text-ink-soft hover:text-accent mb-6">
        <ArrowLeft size={14} /> Mi pasaporte
      </a>

      <header className="relative overflow-hidden border-[1.5px] border-ink shadow-brut mb-12"
        style={acento ? { borderTop: `8px solid ${acento.vivo}` } : undefined}>
        {/* Ambientación: la propia bandera, ampliada y difuminada, da los colores del país. */}
        <img src={urlBandera(codigo)} alt="" aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-[2px] opacity-30" />
        <div className="absolute inset-0 bg-paper/40" />
        <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center p-6 sm:p-10">
          <div>
            <Bandera codigo={codigo} alto={56} className="mb-5" />
            <h2 className="font-display font-black text-5xl sm:text-6xl leading-none text-ink mb-2"
              style={acento ? { color: acento.oscuro } : undefined}>{nombre}</h2>
            {pais?.lema && <p className="font-script text-3xl text-ink-soft leading-tight mb-2">{pais.lema}</p>}
            {pais?.fecha_viaje && <p className="font-script text-3xl text-accent leading-none mb-4">{pais.fecha_viaje}</p>}
            <FichaPais pais={pais} />
            {pais?.contexto && (
              <p className="text-ink text-lg leading-relaxed max-w-2xl whitespace-pre-line">{pais.contexto}</p>
            )}
          </div>
          {destacadas.length > 0 && (
            <div className="flex justify-center items-start pb-4 md:pr-4">
              {destacadas.map((f, i) => (
                <figure key={f.id}
                  className={`bg-white p-2 pb-8 shadow-md w-40 sm:w-48 ${i > 0 ? '-ml-8 sm:-ml-10' : ''} ${GIROS[i % GIROS.length]}`}
                  style={{ marginTop: i % 2 ? 28 : 0 }}>
                  <img src={f.url} alt={f.pie ?? `Foto de ${nombre}`} className="w-full aspect-square object-cover" />
                  {f.pie && <figcaption className="font-script text-xl text-center text-ink mt-1 leading-tight">{f.pie}</figcaption>}
                </figure>
              ))}
            </div>
          )}
        </div>
        {pais && (
          <SelloPasaporte nombre={nombre} fecha={pais.fecha_viaje} color={acento?.oscuro}
            className="absolute bottom-2 right-3 w-24 sm:w-36 -rotate-12 z-10" />
        )}
      </header>

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
          <h3 className="font-display font-bold text-2xl mb-6 relative inline-block">
            <span className="relative z-10">Recetas de {nombre}</span>
            <span className="absolute left-[-2px] right-[-4px] bottom-[2px] h-2 bg-yellow -z-0 -skew-x-6"
              style={acento ? { backgroundColor: acento.vivo, opacity: 0.55 } : undefined} />
          </h3>
          <RecipeGrid recipes={recetas} loading={cargando} onRecipeClick={(r) => irA({ vista: 'receta', id: r.id })} />
        </section>
      )}
    </div>
  );
}
