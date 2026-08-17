import React from 'react';
import { PhoneCall, LogOut, Radio } from 'lucide-react';

interface ReceptionNavbarProps {
  onOpenNewAccident: () => void;
  onLogout: () => void;
}

export const ReceptionNavbar: React.FC<ReceptionNavbarProps> = ({
  onOpenNewAccident,
  onLogout,
}) => {
  return (
    <header className="bg-blue-800 text-white shadow-xl sticky top-0 z-40 border-b border-blue-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Reception Branding */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-black/20">
              <PhoneCall className="w-6 h-6 text-blue-800" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                V-COMMAND <span className="text-blue-200 font-bold">بوابة الاستقبال والاتصالات</span>
              </h1>
              <p className="text-[11px] text-blue-200">استقبال البلاغات السريعة وتوثيق المكالمات</p>
            </div>
          </div>

          {/* Actions & Logout */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <button
              onClick={onOpenNewAccident}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-1.5 active:scale-95 uppercase tracking-wide"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>تسجيل بلاغ جديد</span>
            </button>

            <button
              onClick={onLogout}
              title="تسجيل الخروج"
              className="p-2.5 rounded-xl bg-blue-700 hover:bg-red-600 text-blue-100 hover:text-white transition-colors flex items-center justify-center"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
