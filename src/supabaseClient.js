import { createClient } from '@supabase/supabase-js';

// DESCONECTADO DEL PROYECTO ANTERIOR (VENDIDO)
// Se utilizan variables de entorno de Vite (.env) para total seguridad
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "⚠️ ADVERTENCIA: Las credenciales de Supabase no están configuradas en el archivo .env. " +
    "Crea un archivo .env en la raíz del proyecto con tus nuevas credenciales."
  );
}

// Fallback temporal con un placeholder inofensivo para evitar errores de inicialización
const activeUrl = supabaseUrl || 'https://placeholder-proyecto-desconectado.supabase.co';
const activeKey = supabaseKey || 'placeholder-key-inofensiva';

export const supabase = createClient(activeUrl, activeKey);
