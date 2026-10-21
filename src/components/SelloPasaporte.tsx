import { useId } from 'react';

interface SelloPasaporteProps {
  nombre: string;
  /** Texto libre tal y como lo escribió el admin («Verano de 2024»); puede faltar. */
  fecha: string | null;
  /** Color de tinta; sin él, el acento de la web. */
  color?: string;
  className?: string;
}

/** Tamaño de letra que cabe en el arco según la longitud del nombre. */
function tamanoArco(texto: string): number {
  return Math.max(9, Math.min(17, 190 / Math.max(texto.length, 1)));
}

/** Tamaño de letra del centro, para fechas cortas o largas. */
function tamanoFecha(texto: string): number {
  return Math.max(10, Math.min(22, 130 / Math.max(texto.length, 1)));
}

/**
 * Sello de entrada de pasaporte: doble aro, nombre en el arco de arriba, «RECETARIO» abajo y la
 * fecha del viaje en medio. El borde irregular y las faltas de tinta salen de un filtro SVG
 * (ruido que desplaza el trazo y lo agujerea), así que no hace falta ningún asset.
 */
export function SelloPasaporte({ nombre, fecha, color, className = '' }: SelloPasaporteProps) {
  const id = useId();
  const titulo = nombre.toUpperCase();
  const arriba = `${id}-arriba`;
  const abajo = `${id}-abajo`;
  const filtro = `${id}-tinta`;

  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={`Sello de ${nombre}${fecha ? `, ${fecha}` : ''}`}
      className={`text-accent mix-blend-multiply select-none pointer-events-none ${className}`}
      style={color ? { color } : undefined}>
      <defs>
        <path id={arriba} d="M 24,100 A 76,76 0 0 1 176,100" />
        <path id={abajo} d="M 12,100 A 88,88 0 0 0 188,100" />
        <filter id={filtro} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="3" result="onda" />
          <feDisplacementMap in="SourceGraphic" in2="onda" scale="4" result="torcido" />
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="8" result="grano" />
          <feColorMatrix in="grano" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  6 0 0 0 -1.2" result="huecos" />
          <feComposite in="torcido" in2="huecos" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#${filtro})`} fill="currentColor" stroke="currentColor" opacity="0.85">
        <circle cx="100" cy="100" r="96" fill="none" strokeWidth="4" />
        <circle cx="100" cy="100" r="70" fill="none" strokeWidth="1.5" />
        <text fontFamily="var(--font-mono, monospace)" fontWeight="700" stroke="none" textAnchor="middle"
          fontSize={tamanoArco(titulo)} letterSpacing="2">
          <textPath href={`#${arriba}`} startOffset="50%">{titulo}</textPath>
        </text>
        <text fontFamily="var(--font-mono, monospace)" fontWeight="700" stroke="none" textAnchor="middle"
          fontSize="12" letterSpacing="3">
          <textPath href={`#${abajo}`} startOffset="50%">★ RECETARIO ★</textPath>
        </text>
        {fecha ? (
          <text x="100" y="106" textAnchor="middle" stroke="none" fontFamily="var(--font-mono, monospace)"
            fontWeight="700" fontSize={tamanoFecha(fecha)}>{fecha}</text>
        ) : (
          <text x="100" y="116" textAnchor="middle" stroke="none" fontSize="40">★</text>
        )}
      </g>
    </svg>
  );
}
