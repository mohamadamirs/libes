import type { APIRoute } from 'astro';
import { getSupabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const fullName = formData.get('full_name')?.toString(); // Ambil input nama

  if (!email || !password || !fullName) {
    return redirect('/register?error=Semua kolom wajib diisi');
  }

  const supabase = getSupabase();

  // Proses registrasi ke Supabase
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName, // Data ini akan ditangkap oleh SQL Trigger di atas
      },
    },
  });

  if (error) {
    return redirect(`/register?error=${error.message}`);
  }

  // Jika Supabase diatur memerlukan konfirmasi email:
  if (!data.session) {
    return redirect('/login?message=Registrasi berhasil! Silakan cek email Anda untuk verifikasi.');
  }

  // Jika konfirmasi email dimatikan (auto login setelah daftar):
  cookies.set('sb-access-token', data.session.access_token, { path: '/', httpOnly: true, secure: true });
  cookies.set('sb-refresh-token', data.session.refresh_token, { path: '/', httpOnly: true, secure: true });

  // Redirect otomatis ke dashboard user (karena role defaultnya 'user')
  return redirect('/user');
};