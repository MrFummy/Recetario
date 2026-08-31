import { useEffect, useState } from 'react';
import { aHash, parsearRuta, CATALOGO, type Ruta } from '../lib/rutas';

/**
 * Si esta pestaña ha cambiado de hash alguna vez, es decir, si hay algo nuestro
 * detrás en el historial.
 *
 * Lo necesita `volverAtras`: cerrar el detalle de una receta a la que se ha
 * llegado desde el catálogo debe ser un "atrás" del navegador, para que el
 * historial no se llene de idas y venidas y el botón atrás del móvil cierre la
 * ficha en lugar de sacarte de la app. Pero quien entra directo por un enlace
 * compartido no tiene nada detrás a lo que volver, y ahí sí toca navegar.
 */
let huboNavegacion = false;

/** Navega, dejando entrada en el historial. */
export function irA(ruta: Ruta): void {
  window.location.hash = aHash(ruta);
}

/**
 * Navega pisando la entrada actual del historial, para cuando la URL en la que
 * estamos deja de ser válida (una receta recién borrada). Así el botón atrás no
 * devuelve a una ficha que ya no existe.
 */
export function reemplazarPor(ruta: Ruta): void {
  const { pathname, search } = window.location;
  window.location.replace(`${pathname}${search}${aHash(ruta)}`);
}

/** Cierra la vista actual: atrás si venimos de dentro, al catálogo si no. */
export function volverAtras(): void {
  if (huboNavegacion) window.history.back();
  else irA(CATALOGO);
}

/** La ruta actual, recalculada en cada cambio de hash. */
export function useRuta(): Ruta {
  const [ruta, setRuta] = useState<Ruta>(() => parsearRuta(window.location.hash));

  useEffect(() => {
    function alCambiar() {
      huboNavegacion = true;
      setRuta(parsearRuta(window.location.hash));
    }
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);

  return ruta;
}
