// src/pages/api/auth/signin.ts
import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase'; // Gunakan client dari lib

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();

  if (!email || !password) {
    return redirect('/login?error=Email dan Password wajib diisi');
  }

  // Proses login menggunakan client Supabase
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return redirect('/login?error=Email atau password salah');
  }

  // Set cookies untuk autentikasi SSR
  cookies.set('sb-access-token', data.session.access_token, { 
    path: '/', 
    httpOnly: true, 
    secure: true, 
    maxAge: data.session.expires_in 
  });
  cookies.set('sb-refresh-token', data.session.refresh_token, { 
    path: '/', 
    httpOnly: true, 
    secure: true 
  });

  // Arahkan ke /login terlebih dahulu, Middleware akan mengarahkan ke dashboard yang tepat (admin/user)
  return redirect('/login');
};