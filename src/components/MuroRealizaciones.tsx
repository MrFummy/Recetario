import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { CheckCircle2, Edit2, Trash2 } from 'lucide-react';
import { StarRating } from './StarRating';
import { RealizacionForm } from './RealizacionForm';
import { useRealizaciones, type DatosRealizacion, type Realizacion } from '../hooks/useRealizaciones';
import { usePerfil } from '../hooks/usePerfil';
import type { ParaHacer } from '../hooks/useParaHacer';
import { errorMessage } from '../lib/errors';

interface Props {
  recetaId: string;
  user: User | null | undefined;
  isAdmin: boolean;
  paraHacer: ParaHacer;
  /** Se llama tras cada cambio: la media de la receta la recalcula un trigger. */
  onCambio: () => void;
}

const GIROS = ['-rotate-[1.5deg]', 'rotate-[1deg]', '-rotate-[0.6deg]', 'rotate-[1.8deg]'];

function formatearFecha(fecha: string): string {
  return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

/**
 * El muro de post-its de una receta: cada vez que alguien la cocinó, con su
 * fecha, su nota y su puntuación. Cada usuario edita y borra las suyas; el
 * admin puede borrar las ajenas.
 */
export function MuroRealizaciones({ recetaId, user, isAdmin, paraHacer, onCambio }: Props) {
  const { realizaciones, error, guardar, borrar } = useRealizaciones(recetaId, user, onCambio);
  const { nombre, guardarNombre } = usePerfil(user);
  // `null` = cerrado; `'nueva'` = alta; una realización = edición de esa.
  const [formulario, setFormulario] = useState<null | 'nueva' | Realizacion>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const alGuardar = async (datos: DatosRealizacion, nombreNuevo: string | null) => {
    if (nombreNuevo) await guardarNombre(nombreNuevo);
    await guardar(datos, formulario !== 'nueva' && formulario ? formulario.id : undefined);
    // "Ya hecha" cierra el "para hacer" de esta receta (no impide repetirla).
    if (formulario === 'nueva') await paraHacer.quitar(recetaId);
    setFormulario(null);
  };

  const alBorrar = async (r: Realizacion) => {
    if (!window.confirm('¿Borrar esta nota del muro?')) return;
    setAviso(null);
    try {
      await borrar(r.id);
    } catch (err) {
      setAviso(errorMessage(err, 'No se pudo borrar la nota.'));
    }
  };

  const edicion = formulario && formulario !== 'nueva' ? formulario : undefined;

  return (
    <section className="mt-14">
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <h3 className="font-display font-bold text-2xl relative inline-block">
          <span className="relative z-10">Muro de notas</span>
          <span className="absolute left-[-2px] right-[-4px] bottom-[2px] h-2 bg-yellow -z-0 -skew-x-6" />
        </h3>
        {user && !formulario && (
          <>
            <button
              onClick={() => void paraHacer.alternar(recetaId)}
              className={`px-3 py-1.5 text-[13px] font-semibold border-[1.5px] border-ink transition-all ${paraHacer.esta(recetaId) ? 'bg-ink text-paper' : 'bg-paper text-ink hover:shadow-brut'}`}
            >
              {paraHacer.esta(recetaId) ? '✓ para hacer' : 'para hacer'}
            </button>
            <button
              onClick={() => setFormulario('nueva')}
              className="flex items-center gap-1.5 bg-yellow text-ink px-3 py-1.5 text-[13px] font-semibold border-[1.5px] border-ink shadow-brut"
            >
              <CheckCircle2 size={14} /> ya la hice
            </button>
          </>
        )}
      </div>

      {formulario && (
        <RealizacionForm
          key={edicion?.id ?? 'nueva'}
          inicial={edicion && { notas: edicion.notas ?? '', puntuacion: edicion.puntuacion }}
          pedirNombre={!nombre}
          onGuardar={alGuardar}
          onCancelar={() => setFormulario(null)}
        />
      )}

      {(aviso || error) && <p className="mb-3 font-mono text-[11px] text-hot">{aviso ?? error}</p>}

      {!user ? (
        <p className="font-mono text-[12.5px] text-ink-soft border-2 border-dashed border-ink/20 px-4 py-5">
          Inicia sesión para ver las notas de los afans y apuntar las tuyas.
        </p>
      ) : realizaciones.length === 0 ? (
        <p className="font-mono text-[12.5px] text-ink-soft border-2 border-dashed border-ink/20 px-4 py-5">
          Nadie ha apuntado todavía que la haya hecho.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {realizaciones.map((r, i) => {
            const propia = r.user_id === user.id;
            return (
              <div key={r.id} className={`relative bg-yellow px-5 pt-5 pb-4 shadow-lg ${GIROS[i % GIROS.length]}`}>
                <div className="flex items-baseline justify-between gap-2 font-mono text-[11px] text-ink-soft mb-1">
                  <span>{r.nombre ?? 'un afan'} · {formatearFecha(r.fecha)}</span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    {propia && (
                      <button onClick={() => setFormulario(r)} title="Editar" className="hover:text-accent"><Edit2 size={13} /></button>
                    )}
                    {(propia || isAdmin) && (
                      <button onClick={() => void alBorrar(r)} title="Borrar" className="hover:text-hot"><Trash2 size={13} /></button>
                    )}
                  </span>
                </div>
                {r.puntuacion && <StarRating rating={r.puntuacion} size={14} />}
                {r.notas && (
                  <p className="mt-2 font-script text-[19px] leading-snug text-ink whitespace-pre-wrap">{r.notas}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
