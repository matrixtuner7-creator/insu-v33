import React from 'react';
import { Building2, Radio, LogOut, ShieldAlert, Share2 } from 'lucide-react';

interface HqNavbarProps {
  unresolvedCount: number;
  onOpenNewAccident: () => void;
  onOpenShareModal: () => void;
  onLogout: () => void;
}

export const HqNavbar: React.FC<HqNavbarProps> = ({
  unresolvedCount,
  onOpenNewAccident,
  onOpenShareModal,
  onLogout,
}) => {
  return (
    <header className="bg-indigo-900 text-white shadow-xl sticky top-0 z-40 border-b border-indigo-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & HQ Branding */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-black/20">
              <Building2 className="w-6 h-6 text-indigo-900" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                V-COMMAND <span className="text-indigo-300 font-bold">HQ (غرفة العمليات المركزية)</span>
              </h1>
              <p className="text-[11px] text-indigo-300">إدارة العمليات، التوجيه الميداني والمراقبة اللحظية</p>
            </div>
          </div>

          {/* Actions & Logout */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <button
              onClick={onOpenShareModal}
              title="مشاركة روابط البوابات"
              className="px-3 py-2 rounded-xl bg-indigo-800 text-indigo-100 hover:text-white hover:bg-indigo-700 border border-indigo-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <Share2 className="w-4 h-4 text-indigo-300" />
              <span>روابط البوابات</span>
            </button>

            <button
              onClick={onOpenNewAccident}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-red-900/40 transition-all flex items-center gap-1.5 active:scale-95 uppercase tracking-wide"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>بلاغ جديد</span>
              {unresolvedCount > 0 && (
                <span className="bg-white text-red-700 px-1.5 py-0.5 rounded-full text-xs font-black">
                  {unresolvedCount}
                </span>
              )}
            </button>

            <button
              onClick={onLogout}
              title="تسجيل الخروج"
              className="p-2.5 rounded-xl bg-indigo-800 hover:bg-red-600 text-indigo-200 hover:text-white transition-colors flex items-center justify-center"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
