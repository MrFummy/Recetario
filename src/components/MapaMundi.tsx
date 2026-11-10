import { useEffect, useRef, useState } from 'react';
import { Loader2, Minus, Plus, RotateCcw } from 'lucide-react';
import type { PaisVisitado } from '../lib/pasaporte';
import { useAcentosPaises } from '../hooks/useAcentoPais';
import { Bandera } from './Bandera';

interface DatosMapa {
  ancho: number;
  alto: number;
  paises: [string, string][];
}

interface MapaMundiProps {
  visitados: PaisVisitado[];
  onSelect: (codigo: string) => void;
}

const ZOOM_MAX = 8;

/**
 * El mapamundi: un SVG con cada país como `<path>` (contornos de Natural Earth,
 * ver scripts/generar-mapamundi.mjs). Los visitados se rellenan con el color de su
 * bandera y se pueden pulsar; el resto queda en crema con un contorno fino de tinta. Los territorios muy pequeños que no salen en el mapa se
 * alcanzan desde la lista. Zoom con los botones y desplazamiento arrastrando; sin
 * rueda del ratón, para no secuestrar el scroll de la página.
 */
export function MapaMundi({ visitados, onSelect }: MapaMundiProps) {
  const [mapa, setMapa] = useState<DatosMapa | null>(null);
  const [fallo, setFallo] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [vista, setVista] = useState({ k: 1, x: 0, y: 0 });
  const arrastre = useRef<{ px: number; py: number; moved: boolean } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // El mapa pesa ~700 KB: se carga solo al entrar en el pasaporte, no con la app.
    let active = true;
    import('../assets/mapamundi.json')
      .then((m) => { if (active) setMapa(m.default as DatosMapa); })
      .catch(() => { if (active) setFallo(true); });
    return () => { active = false; };
  }, []);

  const acentos = useAcentosPaises(visitados.map((v) => v.codigo));

  if (fallo) {
    return <p className="font-mono text-sm text-hot">No se pudo cargar el mapa. Usa la lista.</p>;
  }
  if (!mapa) {
    return (
      <div className="aspect-[96/50] grid place-items-center text-ink-soft">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  const porCodigo = new Map(visitados.map((v) => [v.codigo, v]));
  const w = mapa.ancho / vista.k;
  const h = mapa.alto / vista.k;

  /** Mantiene el mapa dentro del marco al hacer zoom o arrastrar. */
  const acotar = (k: number, x: number, y: number) => ({
    k,
    x: Math.min(Math.max(x, 0), mapa.ancho - mapa.ancho / k),
    y: Math.min(Math.max(y, 0), mapa.alto - mapa.alto / k),
  });

  const zoom = (factor: number) => {
    const k = Math.min(Math.max(vista.k * factor, 1), ZOOM_MAX);
    // Se hace zoom hacia el centro de lo que se ve ahora.
    const cx = vista.x + w / 2;
    const cy = vista.y + h / 2;
    setVista(acotar(k, cx - mapa.ancho / k / 2, cy - mapa.alto / k / 2));
  };

  const alPulsar = (e: React.PointerEvent<SVGSVGElement>) => {
    arrastre.current = { px: e.clientX, py: e.clientY, moved: false };
  };

  const alMover = (e: React.PointerEvent<SVGSVGElement>) => {
    const a = arrastre.current;
    const caja = svgRef.current?.getBoundingClientRect();
    if (!a || !caja || vista.k === 1) return;
    const dx = e.clientX - a.px;
    const dy = e.clientY - a.py;
    if (Math.abs(dx) + Math.abs(dy) > 3) a.moved = true;
    if (!a.moved) return;
    setVista(acotar(vista.k, vista.x - dx * (w / caja.width), vista.y - dy * (h / caja.height)));
    a.px = e.clientX;
    a.py = e.clientY;
  };

  const alSoltar = () => { window.setTimeout(() => { arrastre.current = null; }, 0); };
  const actual = hover ? porCodigo.get(hover) : null;

  return (
    <div className="relative select-none rounded-[3px] border-[1.5px] border-ink bg-paper-2 [--tierra:color-mix(in_srgb,var(--color-ink)_11%,var(--color-paper-2))]">
      <svg
        ref={svgRef}
        viewBox={`${vista.x} ${vista.y} ${w} ${h}`}
        className={`w-full h-auto block ${vista.k > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
        role="img"
        aria-label="Mapamundi con los países visitados"
        onPointerDown={alPulsar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerLeave={alSoltar}
      >
        {/* Los visitados se pintan al final: van por encima. Cada uno lleva dos trazos: el visible y
            otro transparente y ancho que agranda la zona de clic (a escala de mundo, Japón o Italia
            son pocos píxeles). */}
        {[...mapa.paises].sort((a, b) => Number(porCodigo.has(a[0])) - Number(porCodigo.has(b[0]))).map(([codigo, d]) => {
          const v = porCodigo.get(codigo);
          if (!v) {
            return <path key={codigo} d={d} fill="var(--tierra)" stroke="var(--color-ink-dim)" strokeOpacity="0.55" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />;
          }
          const acento = acentos.get(codigo);
          const vivo = acento?.vivo ?? 'var(--color-accent)';
          return (
            <g key={codigo}>
              <path
                d={d}
                fill={hover === codigo ? (acento?.oscuro ?? 'var(--color-accent)') : vivo}
                fillOpacity={v.recetas > 0 || hover === codigo ? 1 : 0.5}
                stroke="var(--color-ink)"
                strokeWidth={1.2}
                vectorEffect="non-scaling-stroke"
                pointerEvents="none"
              />
              <path
                d={d}
                fill="transparent"
                stroke="transparent"
                strokeWidth={10}
                vectorEffect="non-scaling-stroke"
                className="cursor-pointer"
                onPointerEnter={() => setHover(codigo)}
                onPointerLeave={() => setHover(null)}
                onClick={() => { if (!arrastre.current?.moved) onSelect(codigo); }}
              >
                <title>{v.nombre}</title>
              </path>
            </g>
          );
        })}
      </svg>

      {actual && (
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-full border-[1.5px] border-ink bg-paper px-3.5 py-1.5 font-mono text-[12px]">
          <Bandera codigo={actual.codigo} alto={14} className="mr-1.5 -mt-0.5" />{actual.nombre}
          <span className="text-ink-soft"> · {actual.recetas} {actual.recetas === 1 ? 'receta' : 'recetas'}</span>
        </div>
      )}

      <div className="absolute right-3 top-3 flex flex-col gap-1">
        {[
          { etiqueta: 'Acercar', icono: <Plus size={16} />, accion: () => zoom(1.6) },
          { etiqueta: 'Alejar', icono: <Minus size={16} />, accion: () => zoom(1 / 1.6) },
          { etiqueta: 'Restablecer', icono: <RotateCcw size={14} />, accion: () => setVista({ k: 1, x: 0, y: 0 }) },
        ].map((b) => (
          <button key={b.etiqueta} onClick={b.accion} title={b.etiqueta} aria-label={b.etiqueta}
            className="grid h-8 w-8 place-items-center rounded-full border-[1.5px] border-ink bg-paper transition-colors hover:bg-yellow">
            {b.icono}
          </button>
        ))}
      </div>
    </div>
  );
}
