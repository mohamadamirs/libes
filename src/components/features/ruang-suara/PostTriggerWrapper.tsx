import React, { useState } from 'react';
import { CreatePostModal } from './CreatePostModal';

interface PostTriggerWrapperProps {
  isLoggedIn: boolean;
  userName?: string;
  userId?: string;
}

export const PostTriggerWrapper: React.FC<PostTriggerWrapperProps> = ({ isLoggedIn, userName, userId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      // Jika belum login, biarkan link href menangani redirect (atau kita handle manual)
      window.location.href = "/login?message=Silakan login terlebih dahulu untuk menyuarakan pikiranmu.";
      return;
    }
    e.preventDefault();
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="mb-12">
        <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar/Inisial */}
            <div className="hidden md:flex w-14 h-14 rounded-2xl bg-blue-600 items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200 shrink-0">
              {isLoggedIn ? userName?.charAt(0) : '?'}
            </div>

            {/* Trigger Area */}
            <div className="grow w-full text-center md:text-left space-y-2">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {isLoggedIn ? `Halo, ${userName}! 👋` : 'Punya cerita atau opini? 🖋️'}
              </h3>
              <p className="text-slate-500 text-sm font-medium">
                Bagikan keresahan, tips, atau pemikiranmu ke Ruang Suara hari ini.
              </p>
            </div>

            {/* Tombol Aksi */}
            <button 
              onClick={handleOpenModal}
              className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200 transition-all duration-300 text-center"
            >
              {isLoggedIn ? 'Mulai Menulis' : 'Suarakan Sekarang'}
            </button>
          </div>
        </div>
      </div>

      {isLoggedIn && userId && userName && (
        <CreatePostModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          userName={userName}
          userId={userId}
        />
      )}
    </>
  );
};
