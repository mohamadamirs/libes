// src/services/articleService.ts
import { type SupabaseClient } from '@supabase/supabase-js';
import type { Article, ArticleStatus } from '../types/database';

export class ArticleService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Mengambil semua artikel yang sudah terbit (Public)
   */
  async getPublishedArticles(): Promise<{ data: Article[] | null, error: any }> {
    const { data, error } = await this.supabase
      .from('articles')
      .select('*, profiles(full_name)')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    return { data, error };
  }

  /**
   * Mengambil satu artikel detail (Public)
   */
  async getArticleById(id: string): Promise<{ data: Article | null, error: any }> {
    const { data, error } = await this.supabase
      .from('articles')
      .select('*, profiles(full_name)')
      .eq('id', id)
      .eq('status', 'published')
      .single();

    return { data, error };
  }

  /**
   * Mengambil semua artikel untuk Dashboard Admin
   */
  async getAllArticlesForAdmin(): Promise<{ data: Article[] | null, error: any }> {
    const { data, error } = await this.supabase
      .from('articles')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false });

    return { data, error };
  }

  /**
   * Update Status Artikel (Admin Only)
   */
  async updateStatus(
    id: string, 
    status: ArticleStatus, 
    rejectionReason: string | null = null
  ) {
    const updateData: any = { 
      status, 
      updated_at: new Date().toISOString() 
    };

    if (status === 'rejected') {
      updateData.rejection_reason = rejectionReason;
    } else {
      updateData.rejection_reason = null;
    }

    return await this.supabase
      .from('articles')
      .update(updateData)
      .eq('id', id);
  }

  /**
   * Mengambil semua artikel milik user tertentu (Dashboard User)
   */
  async getUserArticles(userId: string): Promise<{ data: Article[] | null, error: any }> {
    const { data, error } = await this.supabase
      .from('articles')
      .select('*, profiles(full_name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  }

  /**
   * Menghapus Artikel
   */
  async deleteArticle(id: string, userId: string) {
    return await this.supabase
      .from('articles')
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // Pastikan hanya pemilik yang bisa hapus
  }
}
