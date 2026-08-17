import React from 'react';
import { Smartphone, LogOut, ShieldAlert } from 'lucide-react';

interface FieldNavbarProps {
  onLogout: () => void;
}

export const FieldNavbar: React.FC<FieldNavbarProps> = ({
  onLogout,
}) => {
  return (
    <header className="bg-slate-900 text-white shadow-xl sticky top-0 z-40 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Field Branding */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-black/20">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                V-COMMAND <span className="text-emerald-400 font-bold">بوابة المحقق الميداني</span>
              </h1>
              <p className="text-[11px] text-slate-400">إدارة التكليفات الميدانية والتقارير الفورية</p>
            </div>
          </div>

          {/* Logout */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <button
              onClick={onLogout}
              title="تسجيل الخروج"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition-colors flex items-center justify-center text-xs font-semibold gap-1.5"
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
