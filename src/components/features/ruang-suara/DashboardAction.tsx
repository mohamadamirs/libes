import React, { useState } from 'react';
import { CreatePostModal } from './CreatePostModal';

interface DashboardActionProps {
  userName: string;
  userId: string;
}

export const DashboardAction: React.FC<DashboardActionProps> = ({ userName, userId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="md:col-span-2 group relative overflow-hidden bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 cursor-pointer"
      >
        <div className="relative z-10 text-left">
          <h3 className="text-white text-xl font-bold mb-2">Bagi Cerita Baru</h3>
          <p className="text-slate-400 text-xs font-medium">Curhat, keresahan, atau sekadar kabar hari ini...</p>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 text-white/10 group-hover:text-white/20 transition-colors text-right">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
      </div>

      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userName={userName}
        userId={userId}
      />
    </>
  );
};
