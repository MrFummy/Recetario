import { useRef, useState } from 'react';
import type { Recipe } from '../types';
import { buscarSemantico } from '../lib/busquedaSemantica';
import { errorMessage } from '../lib/errors';

/**
 * Búsqueda por significado ("algo ligero de pescado"). El texto lo escribe el
 * usuario en la barra única de la portada (la misma del filtro por ingredientes)
 * y llega aquí al pulsar Enter o el botón. `resultado` es `null` mientras no haya
 * búsqueda activa: el catálogo se muestra entonces como siempre, y cuando hay
 * resultado sustituye a los filtros de la portada.
 */
export function useBusquedaSemantica(recipes: Recipe[]) {
  const [ids, setIds] = useState<string[] | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Si lanzas otra búsqueda (o limpias) mientras una está en vuelo, su respuesta
  // llega tarde y no debe pisar el estado actual.
  const ultima = useRef(0);

  const buscar = async (consulta: string) => {
    const texto = consulta.trim();
    if (texto.length < 2) return;
    const esta = ++ultima.current;
    setCargando(true);
    setError(null);
    try {
      const resultado = await buscarSemantico(texto);
      if (esta === ultima.current) setIds(resultado);
    } catch (e) {
      if (esta === ultima.current) setError(errorMessage(e, 'No se pudo hacer la búsqueda.'));
    } finally {
      if (esta === ultima.current) setCargando(false);
    }
  };

  const limpiar = () => {
    ultima.current++;
    setIds(null);
    setError(null);
    setCargando(false);
  };

  // Se conserva el orden de similitud; un id que ya no esté en el catálogo
  // (receta borrada desde otra sesión) simplemente se omite.
  const porId = new Map(recipes.map((r) => [r.id, r]));
  const resultado = ids
    ? ids.flatMap((id) => porId.get(id) ?? [])
    : null;

  return { buscar, limpiar, cargando, error, resultado };
}

export type BusquedaSemantica = ReturnType<typeof useBusquedaSemantica>;
