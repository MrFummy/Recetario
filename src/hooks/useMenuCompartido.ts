import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { errorMessage } from '../lib/errors';
import type { MenuCompartido } from '../types';

export interface MenuCompartidoCargado {
  cargando: boolean;
  /** `null` si no existe, es privado, o es de los afans y quien pregunta no tiene sesión. */
  datos: MenuCompartido | null;
  error: string | null;
}

/**
 * Un menú por su id a través de `ver_menu_compartido`, la única puerta de entrada del nivel
 * «enlace»: la tabla no se abre a la lectura pública, o cualquiera podría listarlos todos.
 * La función no distingue «no existe» de «no es tuyo», y aquí tampoco.
 *
 * Se repite al cambiar de usuario: entrar o salir de sesión cambia lo que se puede ver.
 */
export function useMenuCompartido(id: string, userId: string | undefined): MenuCompartidoCargado {
  const [estado, setEstado] = useState<MenuCompartidoCargado>({ cargando: true, datos: null, error: null });

  useEffect(() => {
    // `activo` descarta una respuesta que llega cuando ya se abrió otro menú.
    let activo = true;

    async function cargar() {
      const { data, error } = await supabase.rpc('ver_menu_compartido', { p_id: id });
      if (!activo) return;
      setEstado({
        cargando: false,
        datos: error ? null : (data as MenuCompartido | null),
        error: error ? errorMessage(error, 'No se pudo abrir el menú.') : null,
      });
    }

    void cargar();
    return () => { activo = false; };
  }, [id, userId]);

  return estado;
}
