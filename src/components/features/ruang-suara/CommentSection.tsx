import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { formatFullDate } from '../../../utils/date';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface CommentSectionProps {
  articleId: string;
  currentUserId?: string;
  currentUserName?: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ articleId, currentUserId, currentUserName }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(full_name, avatar_url)')
        .eq('article_id', articleId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          article_id: articleId,
          user_id: currentUserId,
          content: newComment.trim()
        })
        .select('*, profiles(full_name, avatar_url)')
        .single();

      if (error) throw error;

      setComments([...comments, data]);
      setNewComment('');
    } catch (err: any) {
      console.error('Error posting comment:', err);
      alert('Gagal mengirim komentar: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="comments" className="mt-16 pt-12 border-t border-slate-100">
      <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
        Diskusi Suara
        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-lg font-bold">{comments.length}</span>
      </h3>

      {/* Input Komentar */}
      {currentUserId ? (
        <form onSubmit={handleSubmit} className="mb-12">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
              {currentUserName?.charAt(0)}
            </div>
            <div className="grow space-y-3">
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Tanggapi suara ini..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none min-h-[100px]"
                required
              ></textarea>
              <div className="flex justify-end">
                <button 
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className={`px-6 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl transition-all ${isSubmitting ? 'opacity-50' : 'hover:bg-blue-600 shadow-lg shadow-blue-100'}`}
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Tanggapan'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center mb-12">
          <p className="text-sm text-slate-500 font-medium">
            Ingin ikut berdiskusi? <a href="/login" className="text-blue-600 font-bold hover:underline">Masuk dulu, Lur!</a>
          </p>
        </div>
      )}

      {/* Daftar Komentar */}
      <div className="space-y-8">
        {isLoading ? (
          <p className="text-center text-slate-400 text-xs font-bold animate-pulse uppercase tracking-widest">Memuat Diskusi...</p>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 group">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200 shrink-0">
                {comment.profiles?.full_name?.charAt(0)}
              </div>
              <div className="grow space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{comment.profiles?.full_name}</span>
                  <span className="text-[10px] text-slate-400 font-bold tracking-tighter">• {formatFullDate(comment.created_at)}</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {comment.content}
                </p>
                <div className="flex gap-4 pt-2">
                  <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Dukung</button>
                  <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Balas</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest py-8 italic opacity-50">Belum ada diskusi di sini.</p>
        )}
      </div>
    </div>
  );
};
