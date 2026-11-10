import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Save, Settings2, Star, Trash2 } from 'lucide-react';
import type { FotoPais, Pais, Recipe } from '../types';
import type { Paises } from '../hooks/usePaises';
import { errorMessage } from '../lib/errors';
import { irA } from '../hooks/useRuta';

interface PaisEditorProps {
  codigo: string;
  nombre: string;
  pais: Pais | null;
  recetas: Recipe[];
  fotos: FotoPais[];
  /** Cuántas salen en la cabecera. */
  visibles: number;
  api: Paises;
  /** Borrar un país quita su etiqueta a las recetas: el catálogo tiene que recargarse. */
  onRecetasCambiadas: () => void;
}

/**
 * El panel del admin en la página de un país: fecha del viaje, texto de contexto,
 * fotos y borrado. Va plegado para que la página pública no lo muestre en grande.
 * Las escrituras las autoriza la RLS (`es_admin()`), no este componente.
 */
export function PaisEditor({ codigo, nombre, pais, recetas: listaRecetas, fotos, visibles, api, onRecetasCambiadas }: PaisEditorProps) {
  const [fecha, setFecha] = useState(pais?.fecha_viaje ?? '');
  const [lema, setLema] = useState(pais?.lema ?? '');
  const [estrella, setEstrella] = useState(pais?.plato_estrella ?? '');
  const [ficha, setFicha] = useState({ capital: pais?.capital ?? '', idioma: pais?.idioma ?? '', moneda: pais?.moneda ?? '' });
  const [contexto, setContexto] = useState(pais?.contexto ?? '');
  const [ocupado, setOcupado] = useState<'guardar' | 'fotos' | 'borrar' | null>(null);
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const entradaFotos = useRef<HTMLInputElement>(null);

  const ejecutar = async (que: 'guardar' | 'fotos' | 'borrar', tarea: () => Promise<string | void>) => {
    setOcupado(que);
    setAviso(null);
    try {
      const ok = await tarea();
      if (ok) setAviso({ tipo: 'ok', texto: ok });
    } catch (err) {
      setAviso({ tipo: 'error', texto: errorMessage(err, 'No se pudo completar la acción.') });
    } finally {
      setOcupado(null);
    }
  };

  const guardar = () => ejecutar('guardar', async () => {
    await api.guardar(codigo, { fecha_viaje: fecha.trim() || null, lema: lema.trim() || null, plato_estrella: estrella || null,
      capital: ficha.capital.trim() || null, idioma: ficha.idioma.trim() || null, moneda: ficha.moneda.trim() || null, contexto: contexto.trim() || null });
    return 'Guardado.';
  });

  const subir = (archivos: FileList | null) => {
    if (!archivos?.length) return;
    void ejecutar('fotos', async () => {
      await api.subirFotos(codigo, [...archivos]);
      return `${archivos.length === 1 ? 'Foto subida' : `${archivos.length} fotos subidas`}.`;
    });
    if (entradaFotos.current) entradaFotos.current.value = '';
  };

  const borrar = () => {
    const recetas = listaRecetas.length;
    const pregunta = recetas > 0
      ? `Se quitará ${nombre} del pasaporte con sus fotos. Sus ${recetas} ${recetas === 1 ? 'receta' : 'recetas'} no se borran: se quedan sin país. ¿Seguro?`
      : `Se quitará ${nombre} del pasaporte con sus fotos. ¿Seguro?`;
    if (!window.confirm(pregunta)) return;
    void ejecutar('borrar', async () => {
      await api.borrar(codigo);
      onRecetasCambiadas();
      irA({ vista: 'pasaporte' });
    });
  };

  return (
    <details className="panel-admin mb-10">
      <summary>
        <Settings2 size={14} /> Gestionar país
      </summary>
      <div className="space-y-4 p-4">
        <label className="etiqueta-campo">
          Cuándo estuve
          <input value={fecha} onChange={(e) => setFecha(e.target.value)} placeholder="abril de 2024" className="campo-sello" />
        </label>
        <label className="etiqueta-campo">
          Lema: una frase corta bajo el nombre
          <input value={lema} onChange={(e) => setLema(e.target.value)} maxLength={80}
            placeholder="Donde el arroz es religión" className="campo-sello" />
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {([['capital', 'Capital', 'Tokio'], ['idioma', 'Idioma', 'Japonés'], ['moneda', 'Moneda', 'Yen (JPY)']] as const).map(([clave, etiqueta, ejemplo]) => (
            <label key={clave} className="etiqueta-campo">
              {etiqueta}
              <input value={ficha[clave]} onChange={(e) => setFicha({ ...ficha, [clave]: e.target.value })} maxLength={60}
                placeholder={ejemplo} className="campo-sello" />
            </label>
          ))}
        </div>
        {listaRecetas.length > 0 && (
          <label className="etiqueta-campo">
            Plato estrella (sin elegir, sale la mejor valorada)
            <select value={estrella} onChange={(e) => setEstrella(e.target.value)} className="campo-sello">
              <option value="">Automático</option>
              {listaRecetas.map((r) => <option key={r.id} value={r.id}>{r.titulo}</option>)}
            </select>
          </label>
        )}
        <label className="etiqueta-campo">
          Contexto: la temática del país, en tus palabras
          <textarea value={contexto} onChange={(e) => setContexto(e.target.value)} rows={5} className="campo-sello resize-y" />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => void guardar()} disabled={ocupado !== null}
            className="boton-sello">
            {ocupado === 'guardar' ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Guardar
          </button>
          <button onClick={() => entradaFotos.current?.click()} disabled={ocupado !== null}
            className="boton-sello boton-sello-claro">
            {ocupado === 'fotos' ? <Loader2 className="animate-spin" size={14} /> : <ImagePlus size={14} />} Añadir fotos
          </button>
          <input ref={entradaFotos} type="file" accept="image/*" multiple hidden onChange={(e) => subir(e.target.files)} />
          <button onClick={borrar} disabled={ocupado !== null}
            className="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] border-hot px-3.5 py-1.5 font-sello text-[13px] font-extrabold text-hot transition-colors hover:bg-hot-soft disabled:opacity-60">
            {ocupado === 'borrar' ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />} Quitar país
          </button>
        </div>

        {fotos.length > 0 && (
          <div>
            <p className="etiqueta-campo mb-2">
              Fotos de la cabecera: salen {visibles} como máximo, la portada (★) primero.
            </p>
            <div className="flex flex-wrap gap-2">
              {fotos.map((f) => {
                const esPortada = pais?.portada_url === f.url;
                return (
                  <div key={f.id} className="relative h-24 w-24 overflow-hidden rounded-[3px] border-[1.5px] border-ink">
                    <img src={f.url} alt={f.pie ?? `Foto de ${nombre}`} loading="lazy" className="w-full h-full object-cover" />
                    <button title={esPortada ? 'Quitar de portada' : 'Usar como portada'} aria-pressed={esPortada}
                      disabled={ocupado !== null}
                      onClick={() => void ejecutar('guardar', () => api.guardar(codigo, { portada_url: esPortada ? null : f.url }))}
                      className={`absolute top-1 left-1 grid h-6 w-6 place-items-center rounded-full border-[1.5px] border-ink ${esPortada ? 'bg-yellow' : 'bg-paper hover:bg-yellow'}`}>
                      <Star size={12} fill={esPortada ? 'currentColor' : 'none'} />
                    </button>
                    <button title="Borrar foto" disabled={ocupado !== null}
                      onClick={() => { if (window.confirm('¿Borrar esta foto?')) void ejecutar('guardar', () => api.borrarFoto(f)); }}
                      className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full border-[1.5px] border-ink bg-paper text-hot hover:bg-hot-soft">
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {aviso && (
          <p role="status" className={`font-mono text-[12px] ${aviso.tipo === 'ok' ? 'text-accent' : 'text-hot'}`}>{aviso.texto}</p>
        )}
      </div>
    </details>
  );
}
