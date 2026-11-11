import type { ReactNode } from 'react';
import { LogoSarten } from './LogoSarten';

interface Props {
  /** Etiqueta de la esquina superior derecha, donde las recetas ponen «clase del día». */
  etiqueta: string;
  /** Fecha de esa esquina, en negrita. */
  fecha: string;
  /** Lo que va a la izquierda del pie, como «categoría · título» en los PDF de recetas. */
  ruta: string;
  /** Fecha de impresión, a la derecha del pie. */
  hoy: string;
  pagina: number;
  total: number;
  children: ReactNode;
}

/**
 * Una hoja A4 con el aspecto de los PDF de recetas de n8n (plantilla v5 «Mercado y azulejo»): papel
 * liso, cabecera con la sartén y el nombre en cursiva, cenefa, y un pie de mono. Los estilos son
 * una copia de su plantilla (`.hoja*` en `index.css`).
 *
 * Mide una página exacta y se pinta su propio fondo: así el navegador no la parte ni le
 * añade márgenes con su URL y su fecha. Los 296 mm, y no 297, evitan una página en blanco
 * por redondeo.
 */
export function HojaImpresa({ etiqueta, fecha, ruta, hoy, pagina, total, children }: Props) {
  return (
    <section className="hoja">
      <header className="hoja-cabecera">
        <div className="hoja-cabecera-izq">
          <LogoSarten ancho={46} />
          <span className="hoja-marca">El Recetario de <b>Markis</b></span>
        </div>
        <div className="hoja-cabecera-der">
          <span>{etiqueta}</span>
          <span>·</span>
          <span className="fecha">{fecha}</span>
        </div>
      </header>
      <div className="cenefa" />

      <div className="hoja-contenido">{children}</div>

      <footer className="hoja-pie">
        <span>{ruta}</span>
        <span>
          <span className="acento">el recetario de markis</span> · {hoy}
          {total > 1 && ` · pág. ${pagina}/${total}`}
        </span>
      </footer>
    </section>
  );
}
