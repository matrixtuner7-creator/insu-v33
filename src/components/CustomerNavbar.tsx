import React from 'react';
import { UserCheck, LogOut } from 'lucide-react';

interface CustomerNavbarProps {
  onLogout: () => void;
}

export const CustomerNavbar: React.FC<CustomerNavbarProps> = ({
  onLogout,
}) => {
  return (
    <header className="bg-[#161B1F] text-[#F1F5F9] shadow-xl sticky top-0 z-40 border-b border-[#3A434C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-[#315EF5] flex items-center justify-center shadow-lg shadow-black/30">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-[#F1F5F9] flex items-center gap-2">
                V-COMMAND <span className="text-[#315EF5] font-bold">بوابة العميل</span>
              </h1>
              <p className="text-[11px] text-[#AAB2BA]">متابعة حالة الحوادث والتقارير والمستندات</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="تسجيل الخروج"
            className="p-2.5 rounded-xl bg-[#2A323A] hover:bg-[#D64545] text-[#AAB2BA] hover:text-white border border-[#3A434C] transition-colors flex items-center justify-center cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
