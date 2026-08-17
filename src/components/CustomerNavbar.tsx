import React from 'react';
import { UserCheck, LogOut } from 'lucide-react';

interface CustomerNavbarProps {
  onLogout: () => void;
}

export const CustomerNavbar: React.FC<CustomerNavbarProps> = ({
  onLogout,
}) => {
  return (
    <header className="bg-teal-800 text-white shadow-xl sticky top-0 z-40 border-b border-teal-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-black/20">
              <UserCheck className="w-6 h-6 text-teal-800" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                V-COMMAND <span className="text-teal-200 font-bold">بوابة العميل</span>
              </h1>
              <p className="text-[11px] text-teal-200">متابعة حالة الحوادث والتقارير والمستندات</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="تسجيل الخروج"
            className="p-2.5 rounded-xl bg-teal-700 hover:bg-red-600 text-teal-100 hover:text-white transition-colors flex items-center justify-center"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
