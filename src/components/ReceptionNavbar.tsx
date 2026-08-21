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
    <header className="bg-[#161B1F] text-[#F1F5F9] shadow-xl sticky top-0 z-40 border-b border-[#3A434C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Reception Branding */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-[#315EF5] flex items-center justify-center shadow-lg shadow-black/30">
              <PhoneCall className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-[#F1F5F9] flex items-center gap-2">
                V-COMMAND <span className="text-[#315EF5] font-bold">بوابة الاستقبال والاتصالات</span>
              </h1>
              <p className="text-[11px] text-[#AAB2BA]">استقبال البلاغات السريعة وتوثيق المكالمات</p>
            </div>
          </div>

          {/* Actions & Logout */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <button
              onClick={onOpenNewAccident}
              className="bg-[#22A06B] hover:bg-[#1b8558] text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-emerald-950/30 transition-all flex items-center gap-1.5 active:scale-95 uppercase tracking-wide cursor-pointer"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>تسجيل بلاغ جديد</span>
            </button>

            <button
              onClick={onLogout}
              title="تسجيل الخروج"
              className="p-2.5 rounded-xl bg-[#2A323A] hover:bg-[#D64545] text-[#AAB2BA] hover:text-white border border-[#3A434C] transition-colors flex items-center justify-center cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
