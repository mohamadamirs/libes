import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userId: string;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, userName, userId }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Tanya' | 'Jawab' | 'Suara'>('Suara');
  const [imageUrl, setImageUrl] = useState('');
  const [isInteracting, setIsInteracting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ msg: string, type: 'info' | 'error' | 'success' | 'none' }>({ msg: '', type: 'none' });
  const [previewUrl, setPreviewUrl] = useState('');
  
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
          }, 'image/webp', 0.8);
        };
      };
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus({ msg: 'File terlalu besar!', type: 'error' });
      return;
    }

    try {
      setIsInteracting(true);
      setUploadStatus({ msg: '⌛ Mengunggah...', type: 'info' });
      
      const compressedBlob = await compressImage(file);
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.webp`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(filePath, compressedBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      setPreviewUrl(publicUrl);
      setUploadStatus({ msg: '✅ Berhasil!', type: 'success' });
    } catch (err: any) {
      setUploadStatus({ msg: `Gagal: ${err.message}`, type: 'error' });
    } finally {
      setIsInteracting(false);
    }
  };

  const handleSubmit = async () => {
    const content = editorRef.current?.innerHTML || '';
    if (!title || !content || content === '<br>') return;

    setIsInteracting(true);
    try {
      const textOnly = editorRef.current?.innerText || '';
      const wordCount = textOnly.split(/\s+/).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));

      const { error } = await supabase.from('articles').insert({
        title,
        content,
        category,
        excerpt: textOnly.substring(0, 150),
        image_url: imageUrl || null,
        reading_time: readingTime,
        user_id: userId,
        status: 'pending',
      });

      if (error) throw error;
      window.location.href = '/user?success=Suara kamu berhasil dikirim!';
    } catch (err: any) {
      alert('Gagal mengirim: ' + err.message);
    } finally {
      setIsInteracting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-center p-0 md:p-4 overflow-y-auto pt-16 md:pt-24 bg-slate-900/40 backdrop-blur-[2px]">
      <div className="absolute inset-0 z-[-1]" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-2xl md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-500 flex flex-col h-fit min-h-[60vh] mb-10 border border-slate-200">
        
        {/* Header - Sticky */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-200 uppercase">
              {userName.charAt(0)}
            </div>
            <div className="text-left">
              <p className="text-[11px] font-black text-slate-900 uppercase tracking-wider leading-none mb-1">{userName}</p>
              <p className="text-[8px] font-bold text-blue-600 uppercase tracking-[0.2em] leading-none">Menyuarakan Pikiran</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Editor Area */}
        <div className="p-6 md:p-8 space-y-6 text-left">
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul suara..." 
            className="w-full text-2xl md:text-3xl font-black text-slate-900 border-none focus:ring-0 p-0 placeholder:text-slate-200 bg-transparent leading-tight outline-none"
            required
          />

          {/* Category Selector */}
          <div className="flex items-center gap-2 pb-4 border-b border-slate-50 overflow-x-auto no-scrollbar">
            {(['Tanya', 'Jawab', 'Suara'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0 cursor-pointer ${
                  category === cat 
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div 
            ref={editorRef}
            contentEditable 
            className="w-full min-h-[250px] outline-none text-slate-700 leading-relaxed font-serif text-lg md:text-xl empty:before:content-[attr(data-placeholder)] empty:before:text-slate-300 empty:before:italic bg-transparent"
            data-placeholder="Bagikan sesuatu..."
          ></div>

          {previewUrl && (
            <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-slate-100 group shadow-lg">
              <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
              <button 
                type="button"
                onClick={() => { setPreviewUrl(''); setImageUrl(''); }}
                className="absolute top-4 right-4 bg-rose-600 text-white p-2 rounded-full shadow-2xl transform scale-90 md:scale-100 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Toolbar & Footer - Sticky Bottom */}
        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between sticky bottom-0 z-20 backdrop-blur-sm">
          <div className="flex items-center gap-1">
            <button onClick={() => execCommand('bold')} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl text-slate-500 transition-all cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
              </svg>
            </button>
            <button onClick={() => execCommand('italic')} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl text-slate-500 transition-all cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 0h-4m-6 16h4" />
              </svg>
            </button>
            <button onClick={() => execCommand('formatBlock', 'h1')} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl text-slate-500 transition-all cursor-pointer">
              <span className="font-black text-sm">H1</span>
            </button>
            
            <div className="w-px h-6 bg-slate-200 mx-2"></div>

            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl text-slate-500 transition-all cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            </button>

            {uploadStatus.type !== 'none' && (
              <span className={`text-[8px] font-black uppercase ml-2 hidden md:inline-block ${uploadStatus.type === 'error' ? 'text-rose-500' : 'text-blue-500'}`}>
                {uploadStatus.msg}
              </span>
            )}
          </div>

          <button 
            onClick={handleSubmit}
            disabled={isInteracting || !title}
            className={`px-8 py-3 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl shadow-blue-200 transition-all ${isInteracting ? 'opacity-50' : 'hover:bg-slate-900 hover:shadow-2xl active:scale-95 cursor-pointer'}`}
          >
            {isInteracting ? 'Proses...' : 'Suarakan'}
          </button>
        </div>
      </div>
    </div>
  );
};
