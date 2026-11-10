import { useId } from 'react';

interface LogoSartenProps {
  /** Ancho en px; el alto es 120/140 de él. */
  ancho: number;
  /** Escribe el nombre en el aro. Solo se lee por encima de ~100 px; por debajo, déjalo en falso. */
  conTexto?: boolean;
  className?: string;
}

/**
 * La marca: una sartén vista desde arriba con un huevo frito. Con texto, el nombre
 * de la web va escrito en el aro oscuro. Los colores salen de los tokens, así que
 * sigue a la paleta; el favicon (`public/favicon.svg`) es una copia con los hex fijos.
 */
export function LogoSarten({ ancho, conTexto = false, className }: LogoSartenProps) {
  const id = `aro-${useId().replace(/:/g, '')}`;
  const tinta = 'var(--color-ink)';
  return (
    <svg width={ancho} height={(ancho * 120) / 140} viewBox="0 0 140 120" role="img" aria-label="El Recetario de Markis" className={className}>
      {conTexto && <defs><path id={id} d="M55 55m-35.5 0a35.5 35.5 0 1 1 71 0a35.5 35.5 0 1 1-71 0" /></defs>}
      {/* Sombra dura, como la de los sellos */}
      <g transform="translate(4 4)" fill="var(--color-accent)" stroke="var(--color-accent)" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="55" cy="55" r="50" />
        <path d="M86 86L126 108" strokeWidth="14" fill="none" />
      </g>
      <path d="M86 86L126 108" stroke={tinta} strokeWidth="16.5" strokeLinecap="round" fill="none" />
      <circle cx="123.5" cy="106.6" r="3.2" fill="var(--color-paper)" stroke={tinta} strokeWidth="1.4" />
      <circle cx="55" cy="55" r="50" fill={tinta} stroke={tinta} strokeWidth="2.6" />
      <circle cx="55" cy="55" r="43.5" fill="none" stroke="#6a5646" strokeWidth="1.6" />
      {conTexto && (
        <text fontFamily="var(--font-sello)" fontWeight="800" fontSize="7.4" letterSpacing="1.2" fill="var(--color-paper)">
          <textPath href={`#${id}`} textLength="219" lengthAdjust="spacing">EL RECETARIO DE MARKIS · COCINA CASERA ·</textPath>
        </text>
      )}
      <path
        d="M33 50C32 38 46 30 56 34C66 28 80 36 78 48C84 58 76 72 64 72C58 80 40 78 38 68C28 64 30 56 33 50Z"
        fill="var(--color-paper)" stroke={tinta} strokeWidth="1.6" strokeLinejoin="round"
      />
      <circle cx="56" cy="54" r="10" fill="var(--color-yellow)" stroke={tinta} strokeWidth="1.6" />
      <circle cx="52.6" cy="50.6" r="2.6" fill="#fff6c9" />
    </svg>
  );
}
