// src/types/database.ts

export type ArticleStatus = 'pending' | 'published' | 'rejected';
export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  updated_at: string;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  category: string;
  excerpt: string | null;
  image_url: string | null;
  status: ArticleStatus;
  rejection_reason: string | null;
  user_id: string;
  reading_time: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile; // Relasi ke penulis
}
