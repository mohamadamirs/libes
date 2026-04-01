// src/pages/api/articles/update-status.ts
import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../lib/supabase'; // BENAR

export const POST: APIRoute = async ({ request, cookies, redirect, locals }) => {
  if (locals.role !== 'admin') {
    return new Response("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const articleId = formData.get('article_id')?.toString();
  const newStatus = formData.get('status')?.toString();
  const rejectionReason = formData.get('rejection_reason')?.toString();

  if (!articleId || !newStatus || !['published', 'rejected'].includes(newStatus)) {
    return redirect('/admin?error=Data tidak lengkap atau status tidak valid');
  }

  // Validasi: Alasan wajib ada jika status ditolak
  if (newStatus === 'rejected' && (!rejectionReason || rejectionReason.trim() === '')) {
    return redirect('/admin?error=Alasan penolakan wajib diisi');
  }

  const supabase = createSupabaseServerClient(cookies); // BENAR

  // Siapkan data update
  const updateData: any = { 
    status: newStatus,
    updated_at: new Date().toISOString()
  };

  // Jika rejected, masukkan alasannya. Jika published, hapus alasannya (null).
  if (newStatus === 'rejected') {
    updateData.rejection_reason = rejectionReason;
  } else {
    updateData.rejection_reason = null;
  }

  const { error } = await supabase
    .from('articles')
    .update(updateData)
    .eq('id', articleId);

  if (error) {
    console.error("Error updating status:", error);
    return redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  const statusLabel = newStatus === 'published' ? 'diterbitkan' : 'ditolak';
  return redirect(`/admin?success=Artikel berhasil ${statusLabel}`);
};