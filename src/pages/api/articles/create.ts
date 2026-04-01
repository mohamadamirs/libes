// src/pages/api/articles/create.ts
import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../lib/supabase'; // BENAR

export const POST: APIRoute = async ({ request, cookies, redirect, locals }) => {
  if (!locals.user) {
    return redirect('/login');
  }

  const formData = await request.formData();
  const title = formData.get('title')?.toString();
  const content = formData.get('content')?.toString();
  const category = formData.get('category')?.toString() || 'Zine';
  const excerpt = formData.get('excerpt')?.toString();
  const imageUrl = formData.get('image_url')?.toString();

  if (!title || !content) {
    return redirect('/user/create?error=Judul dan Konten wajib diisi');
  }

  // Hitung Estimasi Waktu Baca (Reading Time)
  // Rata-rata orang membaca 200 kata per menit
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const supabase = createSupabaseServerClient(cookies); // BENAR

  const { error } = await supabase.from('articles').insert({
    title,
    content,
    category,
    excerpt: excerpt || content.substring(0, 150),
    image_url: imageUrl || null,
    reading_time: readingTime,
    user_id: locals.user.id,
    status: 'pending',
  });

  if (error) {
    console.error("Error creating article:", error);
    return redirect(`/user/create?error=${encodeURIComponent(error.message)}`);
  }

  return redirect('/user?success=Tulisan berhasil dikirim ke Ruang Suara dan menunggu review admin');
};