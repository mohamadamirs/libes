// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';

export const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Client standar untuk operasi yang tidak memerlukan session (seperti signup/signin)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Helper untuk mendapatkan client standar.
 * Digunakan agar kode lama yang memanggil getSupabase() tidak error.
 */
export const getSupabase = () => supabase;

/**
 * Membuat Supabase client untuk sisi server (SSR/API Routes).
 * Client ini akan secara otomatis menggunakan token otentikasi dari cookies.
 */
export const createSupabaseServerClient = (cookies: AstroCookies) => {
  const accessToken = cookies.get('sb-access-token')?.value;

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        // Mengirim token di setiap request dari server Astro ke Supabase
        Authorization: `Bearer ${accessToken || ''}`,
      },
    },
    auth: {
      persistSession: false, // Penting untuk SSR
    },
  });
};