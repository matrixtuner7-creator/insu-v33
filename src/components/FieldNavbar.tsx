import React from 'react';
import { Smartphone, LogOut, ShieldAlert } from 'lucide-react';

interface FieldNavbarProps {
  onLogout: () => void;
}

export const FieldNavbar: React.FC<FieldNavbarProps> = ({
  onLogout,
}) => {
  return (
    <header className="bg-[#161B1F] text-[#F1F5F9] shadow-xl sticky top-0 z-40 border-b border-[#3A434C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Field Branding */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-[#22A06B] flex items-center justify-center shadow-lg shadow-black/30">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-[#F1F5F9] flex items-center gap-2">
                V-COMMAND <span className="text-[#22A06B] font-bold">بوابة المحقق الميداني</span>
              </h1>
              <p className="text-[11px] text-[#AAB2BA]">إدارة التكليفات الميدانية والتقارير الفورية</p>
            </div>
          </div>

          {/* Logout */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <button
              onClick={onLogout}
              title="تسجيل الخروج والعودة للوحة الإدارة"
              className="p-2.5 rounded-xl bg-[#2A323A] hover:bg-[#D64545] text-[#AAB2BA] hover:text-white border border-[#3A434C] transition-colors flex items-center justify-center text-xs font-semibold gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
