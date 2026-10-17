import { useState } from 'react';
import { banderaPais, nombrePais } from '../lib/paises';

interface BanderaProps {
  codigo: string;
  /** Alto en píxeles; el ancho sale de la proporción de la bandera (3:2 aprox.). */
  alto: number;
  className?: string;
}

/**
 * La bandera de un país como imagen. Windows no dibuja los emoji de bandera (los
 * muestra como dos letras), así que se piden a flagcdn.com en lugar de usar texto.
 * Si la imagen no carga, cae al emoji.
 */
export function Bandera({ codigo, alto, className = '' }: BanderaProps) {
  const [fallo, setFallo] = useState(false);
  const iso = codigo.toLowerCase();
  if (!/^[a-z]{2}$/.test(iso)) return null;

  if (fallo) {
    return <span aria-hidden="true" style={{ fontSize: alto, lineHeight: 1 }} className={className}>{banderaPais(codigo)}</span>;
  }
  // flagcdn solo sirve anchos fijos (20, 40, 80, 160, 320, 640…): se elige el 2x más cercano.
  const ancho = alto * 1.5;
  const fijo = [40, 80, 160, 320, 640].find((w) => w >= ancho * 2) ?? 640;
  return (
    <img
      src={`https://flagcdn.com/w${fijo}/${iso}.png`}
      alt={`Bandera de ${nombrePais(codigo)}`}
      height={alto}
      style={{ height: alto, width: 'auto' }}
      loading="lazy"
      onError={() => setFallo(true)}
      className={`inline-block align-middle shadow-sm border border-ink/20 ${className}`}
    />
  );
}
