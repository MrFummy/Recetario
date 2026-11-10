import { useId } from 'react';
import { urlBandera } from '../lib/paises';

import type { FormaVisado } from '../lib/visados';

interface SelloVisadoProps {
  codigo: string;
  nombre: string;
  /** Texto libre del viaje («Junio de 2025»); puede faltar. */
  fecha: string | null;
  forma: FormaVisado;
  className?: string;
}

const acotar = (min: number, max: number, v: number) => Math.max(min, Math.min(max, v));

/**
 * Visado de un país en la lista del pasaporte: tres formas que se alternan (redondo con el
 * nombre en el aro, rectángulo de visado y óvalo), con la bandera dentro. Pinta con
 * `currentColor`, así que el color de tinta lo pone quien lo usa (el de la bandera). El grano
 * de tinta gastada es un filtro SVG, sin ningún asset.
 */
export function SelloVisado({ codigo, nombre, fecha, forma, className = '' }: SelloVisadoProps) {
  const id = useId().replace(/:/g, '');
  const titulo = nombre.toUpperCase();
  const dia = fecha?.toUpperCase().replace(/ DE /g, ' ') ?? null;
  const bandera = urlBandera(codigo);
  const filtro = `t${id}`;
  const recorte = `c${id}`;
  const aro = `r${id}`;

  const defs = (
    <filter id={filtro} x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="5" result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.75" result="m" />
      <feComposite in="SourceGraphic" in2="m" operator="in" />
    </filter>
  );
  const letras = { fill: 'currentColor', stroke: 'none' } as const;

  if (forma === 'redondo') {
    const texto = `${titulo} ★ ${dia ?? 'RECETARIO'} ★`;
    return (
      <svg viewBox="0 0 160 160" role="img" aria-label={`Visado de ${nombre}`} className={className}>
        <defs>
          {defs}
          <clipPath id={recorte}><circle cx="80" cy="80" r="33" /></clipPath>
          <path id={aro} d="M80 80m-49 0a49 49 0 1 1 98 0a49 49 0 1 1-98 0" />
        </defs>
        <g filter={`url(#${filtro})`} fill="none" stroke="currentColor">
          <circle cx="80" cy="80" r="76" strokeWidth="3.2" />
          <circle cx="80" cy="80" r="70" strokeWidth="1.2" />
          <circle cx="80" cy="80" r="37" strokeWidth="2.4" />
          <text {...letras} fontFamily="var(--font-sello)" fontWeight="800" fontSize={acotar(7.5, 12, 330 / texto.length)}>
            <textPath href={`#${aro}`} textLength="296" lengthAdjust="spacing">{texto}</textPath>
          </text>
          <image href={bandera} x="46" y="46" width="68" height="68" clipPath={`url(#${recorte})`} preserveAspectRatio="xMidYMid slice" stroke="none" opacity=".9" />
        </g>
      </svg>
    );
  }

  if (forma === 'visado') {
    return (
      <svg viewBox="0 0 200 130" role="img" aria-label={`Visado de ${nombre}`} className={className}>
        <defs>{defs}<clipPath id={recorte}><rect x="18" y="30" width="62" height="42" rx="3" /></clipPath></defs>
        <g filter={`url(#${filtro})`} fill="none" stroke="currentColor">
          <rect x="3" y="3" width="194" height="124" rx="12" strokeWidth="3.2" />
          <rect x="10" y="10" width="180" height="110" rx="7" strokeWidth="1.2" />
          <image href={bandera} x="18" y="30" width="62" height="42" clipPath={`url(#${recorte})`} preserveAspectRatio="xMidYMid slice" opacity=".9" />
          <rect x="18" y="30" width="62" height="42" rx="3" strokeWidth="2" />
          <text {...letras} x="92" y="52" fontFamily="var(--font-sello)" fontWeight="800" fontSize={acotar(10, 19, 96 / (titulo.length * 0.62))}>{titulo}</text>
          {dia && <text {...letras} x="92" y="70" fontFamily="var(--font-mono)" fontWeight="500" fontSize={acotar(6.5, 9.5, 96 / (dia.length * 0.66))}>{dia}</text>}
          <path d="M18 88h164" strokeDasharray="3 4" strokeWidth="1.4" />
          <text {...letras} x="18" y="106" fontFamily="var(--font-sello)" fontWeight="800" fontSize="10" letterSpacing="2.4">RECETARIO · VISADO</text>
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 200 140" role="img" aria-label={`Visado de ${nombre}`} className={className}>
      <defs>{defs}<clipPath id={recorte}><circle cx="100" cy="46" r="22" /></clipPath></defs>
      <g filter={`url(#${filtro})`} fill="none" stroke="currentColor">
        <ellipse cx="100" cy="70" rx="96" ry="64" strokeWidth="3.2" />
        <ellipse cx="100" cy="70" rx="89" ry="57" strokeWidth="1.2" />
        <image href={bandera} x="76" y="24" width="48" height="48" clipPath={`url(#${recorte})`} preserveAspectRatio="xMidYMid slice" opacity=".9" />
        <circle cx="100" cy="46" r="24" strokeWidth="2" />
        <text {...letras} x="100" y="95" textAnchor="middle" fontFamily="var(--font-sello)" fontWeight="800" fontSize={acotar(9, 17, 150 / (titulo.length * 0.62))}>{titulo}</text>
        {dia && <text {...letras} x="100" y="112" textAnchor="middle" fontFamily="var(--font-mono)" fontWeight="500" fontSize={acotar(6.5, 9, 150 / (dia.length * 0.66))}>{dia}</text>}
      </g>
    </svg>
  );
}
