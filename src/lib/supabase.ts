import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Clave pública del proyecto. Se reexporta porque los webhooks de n8n la
 * reenvían a `/auth/v1/user` para validar el token de quien llama: ese endpoint
 * exige la cabecera `apikey` además del Bearer.
 */
export const SUPABASE_ANON_KEY: string = supabaseAnonKey;
