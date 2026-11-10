import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Recipe } from '../types';
import { ArrowLeft, ExternalLink, Trash2 } from 'lucide-react';
import { useSugerencias, type EstadoSugerencia, type Sugerencia } from '../hooks/useSugerencias';
import { errorMessage } from '../lib/errors';
import { aHash } from '../lib/rutas';

interface Props {
  user: User;
  isAdmin: boolean;
  recipes: Recipe[];
}

const ETIQUETA: Record<EstadoSugerencia, string> = {
  pendiente: 'pendiente',
  aceptada: 'aceptada',
  descartada: 'descartada',
  hecha: 'hecha',
};

const campo = 'w-full px-3 py-2 bg-white border-2 border-ink/30 rounded-md text-[14.5px] focus:outline-none focus:border-ink';
const etiqueta = 'block font-mono text-[11px] uppercase tracking-wider text-ink-soft mb-1';

/** Enlace solo si es http(s): lo que escribe un afan no es de fiar. */
function EnlaceSeguro({ url }: { url: string }) {
  if (!/^https?:\/\//i.test(url)) return <span className="break-all">{url}</span>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline break-all">
      <ExternalLink size={12} className="shrink-0" /> {url}
    </a>
  );
}

function Fila({ s, esAdmin, recipes, onEstado, onReceta, onBorrar }: {
  s: Sugerencia;
  esAdmin: boolean;
  recipes: Recipe[];
  onEstado: (e: EstadoSugerencia) => void;
  onReceta: (id: string | null) => void;
  onBorrar: () => void;
}) {
  const puedeBorrar = esAdmin || s.estado === 'pendiente';
  return (
    <li className="py-3 border-b border-dashed border-ink/20">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 font-mono text-[12.5px] leading-relaxed text-ink">
          {s.enlace && <div><EnlaceSeguro url={s.enlace} /></div>}
          {s.texto && <p className="m-0 whitespace-pre-wrap">{s.texto}</p>}
          {s.nota && <p className="m-0 mt-1 text-ink-soft">«{s.nota}»</p>}
          <p className="m-0 mt-1 text-[11px] text-ink-soft">
            {new Date(s.created_at).toLocaleDateString('es-ES')}
            {esAdmin && !s.citar && ' · no quiere que la citen'}
          </p>
          {esAdmin && s.estado === 'hecha' && (
            <label className="mt-2 flex items-center gap-2 text-[11.5px] text-ink-soft">
              Receta creada
              <select
                value={s.receta_id ?? ''}
                onChange={(e) => onReceta(e.target.value || null)}
                className="px-2 py-1 bg-white border-2 border-ink/30 rounded-md font-mono text-[11.5px] max-w-[220px]"
              >
                <option value="">— elegir —</option>
                {recipes.map((r) => <option key={r.id} value={r.id}>{r.titulo}</option>)}
              </select>
            </label>
          )}
          {!esAdmin && s.estado === 'hecha' && s.receta_id && (
            <p className="m-0 mt-1"><a href={aHash({ vista: 'receta', id: s.receta_id })} className="text-accent hover:underline">Ver la receta →</a></p>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {esAdmin ? (
            <select
              value={s.estado}
              onChange={(e) => onEstado(e.target.value as EstadoSugerencia)}
              aria-label="Estado"
              className="px-2 py-1 bg-white border-2 border-ink/30 rounded-md font-mono text-[11.5px]"
            >
              {(Object.keys(ETIQUETA) as EstadoSugerencia[]).map((e) => <option key={e} value={e}>{ETIQUETA[e]}</option>)}
            </select>
          ) : (
            <span className={`font-mono text-[11px] px-2 py-0.5 rounded-sm ${s.estado === 'pendiente' ? 'bg-yellow/60' : s.estado === 'descartada' ? 'bg-ink/10' : 'bg-accent/15 text-accent'}`}>
              {ETIQUETA[s.estado]}
            </span>
          )}
          {puedeBorrar && (
            <button onClick={onBorrar} title="Borrar" aria-label="Borrar sugerencia" className="p-1 text-ink-soft hover:text-hot transition-colors">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

/**
 * `#/buzon`: un afan propone una receta con un enlace y/o unas líneas. El admin ve las de todos y
 * cambia su estado; el resto solo las suyas. No se convierte nada al enviar.
 */
export function SeccionBuzon({ user, isAdmin, recipes }: Props) {
  const { lista, cargando, error, enviar, cambiarEstado, enlazarReceta, borrar } = useSugerencias(user.id);
  const [enlace, setEnlace] = useState('');
  const [texto, setTexto] = useState('');
  const [nota, setNota] = useState('');
  const [citar, setCitar] = useState(true);
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enlaceValido = !enlace.trim() || /^https?:\/\/\S+$/i.test(enlace.trim());
  const hayContenido = !!(enlace.trim() || texto.trim());

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setMsg(null);
    try {
      await enviar({ enlace, texto, nota, citar });
      setEnlace(''); setTexto(''); setNota('');
      setMsg({ ok: true, texto: '¡Gracias! Tu sugerencia está en el buzón.' });
    } catch (err) {
      setMsg({ ok: false, texto: errorMessage(err, 'No se pudo enviar la sugerencia.') });
    } finally {
      setEnviando(false);
    }
  }

  const propias = lista.filter((s) => s.user_id === user.id);
  const ajenas = lista.filter((s) => s.user_id !== user.id);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <a href={aHash({ vista: 'cuenta' })} className="inline-flex items-center gap-1.5 font-mono text-[12px] text-ink-soft hover:text-accent mb-6">
        <ArrowLeft size={14} /> Mi cuenta
      </a>
      <header className="mb-10">
        <h2 className="font-display font-black text-4xl sm:text-6xl leading-[0.98] tracking-tight text-ink">
          Sugerir una <span className="hl-mark">receta</span>
        </h2>
        <p className="mt-3 font-mono text-[12.5px] text-ink-soft leading-relaxed">
          ¿Algo que te gustaría ver aquí? Pega un enlace o cuéntalo con tus palabras. Solo lo veo yo.
        </p>
      </header>

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
        <div>
          <label className={etiqueta} htmlFor="bz-enlace">Enlace (opcional)</label>
          <input id="bz-enlace" value={enlace} maxLength={500} onChange={(e) => setEnlace(e.target.value)} placeholder="https://…" className={campo} />
          {!enlaceValido && <p className="mt-1 font-mono text-[11.5px] text-hot">Tiene que empezar por http:// o https://</p>}
        </div>
        <div>
          <label className={etiqueta} htmlFor="bz-texto">La receta, con tus palabras (opcional)</label>
          <textarea id="bz-texto" value={texto} maxLength={2000} rows={4} onChange={(e) => setTexto(e.target.value)} className={campo} />
        </div>
        <div>
          <label className={etiqueta} htmlFor="bz-nota">¿Por qué te gusta? (opcional)</label>
          <input id="bz-nota" value={nota} maxLength={500} onChange={(e) => setNota(e.target.value)} className={campo} />
        </div>
        <label className="flex items-center gap-2 font-mono text-[12px] text-ink-soft">
          <input type="checkbox" checked={citar} onChange={(e) => setCitar(e.target.checked)} />
          Puedes citarme como «Sugerida por» si la incorporas
        </label>
        <button
          type="submit"
          disabled={!hayContenido || !enlaceValido || enviando}
          className="px-4 py-2 bg-ink text-paper text-sm font-semibold rounded-md hover:bg-ink-soft transition-colors disabled:opacity-40"
        >
          Enviar al buzón
        </button>
        {msg && <p className={`font-mono text-[12px] ${msg.ok ? 'text-accent' : 'text-hot'}`}>{msg.texto}</p>}
      </form>

      {error && <p className="mt-6 font-mono text-[11.5px] text-hot">{error}</p>}

      <section className="mt-12">
        <h3 className="font-mono text-[11px] uppercase tracking-wider text-accent mb-2">Mis sugerencias</h3>
        {cargando ? (
          <p className="font-mono text-sm text-ink-soft">Cargando…</p>
        ) : propias.length === 0 ? (
          <p className="font-mono text-[12.5px] text-ink-soft">Todavía no has enviado ninguna.</p>
        ) : (
          <ul className="list-none p-0 m-0 border-t border-dashed border-ink/20">
            {propias.map((s) => (
              <Fila key={s.id} s={s} esAdmin={isAdmin} recipes={recipes} onReceta={(r) => void enlazarReceta(s.id, r)} onEstado={(e) => void cambiarEstado(s.id, e)} onBorrar={() => void borrar(s.id)} />
            ))}
          </ul>
        )}
      </section>

      {isAdmin && (
        <section className="mt-12">
          <h3 className="font-mono text-[11px] uppercase tracking-wider text-accent mb-2">De los afans ({ajenas.length})</h3>
          {ajenas.length === 0 ? (
            <p className="font-mono text-[12.5px] text-ink-soft">Nada por ahora.</p>
          ) : (
            <ul className="list-none p-0 m-0 border-t border-dashed border-ink/20">
              {ajenas.map((s) => (
                <Fila key={s.id} s={s} esAdmin recipes={recipes} onReceta={(r) => void enlazarReceta(s.id, r)} onEstado={(e) => void cambiarEstado(s.id, e)} onBorrar={() => void borrar(s.id)} />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
