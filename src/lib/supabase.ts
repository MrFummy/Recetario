import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// El enlace del correo de «restablecer contraseña» vuelve a la web con `#access_token=…&type=recovery` en el hash, y
// supabase-js lo consume y lo borra al arrancar. Se lee ANTES de crear el cliente: el evento `PASSWORD_RECOVERY` puede
// dispararse antes de que `App` se suscriba, y entonces la pantalla de «nueva contraseña» no saldría nunca.
const hashInicial = typeof window === 'undefined' ? '' : window.location.hash;
export const LLEGA_DE_RECUPERACION = /[#&]type=recovery(&|$)/.test(hashInicial);
export const ENLACE_CADUCADO = /[#&]error_code=otp_expired(&|$)/.test(hashInicial);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Clave pública del proyecto. Se reexporta porque los webhooks de n8n la
 * reenvían a `/auth/v1/user` para validar el token de quien llama: ese endpoint
 * exige la cabecera `apikey` además del Bearer.
 */
export const SUPABASE_ANON_KEY: string = supabaseAnonKey;
