import type { ReactNode } from 'react';
import { ChefHat } from 'lucide-react';

interface Props {
  /** Texto de la esquina superior derecha (ocasión y fecha). */
  derecha: string;
  /** Lo que va a la izquierda del pie, como la ruta de los PDF de recetas. */
  pie: string;
  /** Fecha de impresión, a la derecha del pie. */
  hoy: string;
  pagina: number;
  total: number;
  children: ReactNode;
}

/**
 * Una hoja A4 con el aspecto de los PDF de recetas de n8n: papel crema, cabecera con el
 * logo y el título en script, líneas discontinuas y un pie en monoespaciada.
 *
 * Mide una página exacta y se pinta su propio fondo: así el navegador no la parte ni le
 * añade márgenes con su URL y su fecha. `print-color-adjust` obliga a imprimir el fondo,
 * que por defecto se omite. Los 296 mm, y no 297, evitan una página en blanco por redondeo.
 */
export function HojaImpresa({ derecha, pie, hoy, pagina, total, children }: Props) {
  return (
    <section
      className="relative w-[210mm] h-[296mm] overflow-hidden break-after-page bg-paper text-ink
                 px-[14mm] pt-[11mm] [print-color-adjust:exact] [-webkit-print-color-adjust:exact]"
    >
      <header className="flex items-center justify-between pb-3 border-b border-dashed border-ink/25">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-ink text-paper rounded-lg flex items-center justify-center -rotate-3
                          shadow-[3px_3px_0_var(--color-yellow)]">
            <ChefHat size={20} strokeWidth={2.2} />
          </div>
          <span className="font-script text-[28px] leading-none">
            El Recetario de <span className="text-accent font-bold">Markis</span>
          </span>
        </div>
        <span className="font-mono text-[10px] tracking-wider text-ink-soft">{derecha}</span>
      </header>

      <div className="pt-6">{children}</div>

      <footer
        className="absolute bottom-[8mm] left-[14mm] right-[14mm] flex items-center justify-between pt-2
                   border-t border-dashed border-ink/25 font-mono text-[10px] text-ink-soft"
      >
        <span>{pie}</span>
        <span>pág. {pagina}/{total}</span>
        <span>
          <span className="text-accent">el recetario de markis</span> · {hoy}
        </span>
      </footer>
    </section>
  );
}
