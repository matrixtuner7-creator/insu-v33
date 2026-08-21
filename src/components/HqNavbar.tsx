import React from 'react';
import { Building2, Radio, LogOut, ShieldAlert, Share2, Bell, Settings, User } from 'lucide-react';
import { TrustLogo } from './TrustLogo';

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
    <header className="bg-[#2A323A] text-[#F1F5F9] sticky top-0 z-40 border-b border-[#3A434C] shadow-md" dir="rtl">
      <div className="w-full px-6 py-3">
        <div className="flex items-center justify-between">
          
          {/* Right: Branding */}
          <div className="flex items-center gap-4 ">
            <TrustLogo size="sm" isAlive={true} glowColor="orange" variant="icon" />
            <div className="flex flex-col text-right">
              <h1 
                className="text-lg font-black text-[#F1F5F9] tracking-wide text-glow-neon-amber"
              >
                شركة ترست للتأمين
              </h1>
              <p className="text-[11px] text-[#F1F5F9] font-medium tracking-wide mt-0.5 text-glow-neon">
                Trust Insurance Company
              </p>
            </div>
          </div>

          {/* Center: Title */}
          <div className="flex flex-col items-center justify-center absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-2 mb-1">
              <Radio className="w-6 h-6 text-[#315EF5] animate-pulse" />
              <h2 className="text-[22px] font-black text-white tracking-tight text-glow-neon">غرفة العمليات</h2>
            </div>
            <p className="text-[11px] text-[#AAB2BA] font-bold text-glow-neon">
              المتابعة الحية للحوادث والمحققين
            </p>
          </div>

          {/* Left: Actions & Profile */}
          <div className="flex items-center gap-5">
            {/* Functional Actions */}
            <div className="flex items-center gap-2 mr-4">
              <button
                onClick={onOpenShareModal}
                title="مشاركة روابط البوابات"
                className="p-2 rounded-full bg-[#1B2530] text-[#738190] hover:text-[#315EF5] hover:bg-[#2A323A] border border-[#2A323A] transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenNewAccident}
                className="bg-[#D64545] hover:bg-[#b83838] text-white px-4 py-1.5 rounded-full text-[11px] font-black shadow-lg shadow-red-950/40 transition-all flex items-center gap-2 cursor-pointer border border-[#D64545]/50"
                title="تسجيل بلاغ طارئ"
              >
                <span>تسجيل بلاغ طارئ</span>
                <Radio className="w-3.5 h-3.5 animate-pulse" />
              </button>
            </div>

            <div className="h-8 w-px bg-[#2A323A]"></div>

            {/* Mockup Profile Elements */}
            <div className="flex items-center gap-4">
              <button className="text-[#738190] hover:text-white transition-colors" title="الإعدادات">
                <Settings className="w-5 h-5" />
              </button>
              <div className="relative cursor-pointer text-[#738190] hover:text-white transition-colors" title="التنبيهات">
                <Bell className="w-5 h-5" />
                {unresolvedCount > 0 ? (
                  <span className="absolute -top-1 -right-1 bg-[#D64545] text-white w-3.5 h-3.5 flex items-center justify-center rounded-full text-[9px] font-black border-2 border-[#111820]">
                    {unresolvedCount}
                  </span>
                ) : (
                  <span className="absolute -top-1 -right-1 bg-[#D64545] text-white w-3.5 h-3.5 flex items-center justify-center rounded-full text-[9px] font-black border-2 border-[#111820]">
                    3
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-[#F1F5F9] group-hover:text-white transition-colors text-right">عماد سليلة</span>
                  <span className="text-[10px] text-[#738190] text-right font-medium mt-0.5">مدير العمليات</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#1B2530] border-2 border-[#2A323A] flex items-center justify-center relative overflow-hidden group-hover:border-[#3A434C] transition-colors" onClick={onLogout} title="تسجيل الخروج">
                  <User className="w-5 h-5 text-[#738190]" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <LogOut className="w-4 h-4 text-white ml-0.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
