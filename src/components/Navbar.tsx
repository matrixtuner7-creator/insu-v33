import React from 'react';
import { ShieldAlert, Building2, Smartphone, Share2, Radio, PhoneCall, UserCheck } from 'lucide-react';

interface NavbarProps {
  activePortal: 'hq' | 'agent' | 'reception' | 'customer';
  setActivePortal: (portal: 'hq' | 'agent' | 'reception' | 'customer') => void;
  unresolvedCount: number;
  onOpenNewAccident: () => void;
  onOpenShareModal: () => void;
  userRole?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePortal,
  setActivePortal,
  unresolvedCount,
  onOpenNewAccident,
  onOpenShareModal,
  userRole,
}) => {
  const isFieldOfficer = userRole === 'FIELD_OFFICER';

  return (
    <header className="bg-indigo-700 text-white shadow-lg sticky top-0 z-40 border-b border-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-black/10">
              <ShieldAlert className="w-6 h-6 text-indigo-700" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                V-COMMAND {isFieldOfficer ? '' : <span className="font-light text-indigo-200">HQ</span>}
                {!isFieldOfficer && (
                  <span className="text-xs bg-indigo-600 px-2.5 py-0.5 rounded-full font-bold border border-indigo-500">
                    نظام إدارة الحوادث والعمليات
                  </span>
                )}
              </h1>
              {!isFieldOfficer && <p className="text-[11px] text-indigo-200">ربط الإدارة، موظف الاستقبال، المحققين، والعملاء لحظياً</p>}
            </div>
          </div>

          {/* Portal Switcher & Actions */}
          <div className="flex items-center space-x-2 space-x-reverse overflow-x-auto py-2">
            <div className="bg-indigo-800/80 p-1 rounded-xl flex items-center border border-indigo-600 shrink-0">
              {!isFieldOfficer && (
                <>
                  <button
                    onClick={() => setActivePortal('hq')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activePortal === 'hq'
                        ? 'bg-white text-indigo-700 shadow-md'
                        : 'text-indigo-200 hover:text-white hover:bg-indigo-700/50'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>العمليات (HQ)</span>
                  </button>
                  <button
                    onClick={() => setActivePortal('reception')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activePortal === 'reception'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-indigo-200 hover:text-white hover:bg-indigo-700/50'
                    }`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>الاستقبال</span>
                  </button>
                </>
              )}
              <button
                onClick={() => setActivePortal('agent')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
                  activePortal === 'agent'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-indigo-200 hover:text-white hover:bg-indigo-700/50'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>المحقق الميداني</span>
                {!isFieldOfficer && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
              </button>
              {!isFieldOfficer && (
                <button
                  onClick={() => setActivePortal('customer')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activePortal === 'customer'
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'text-indigo-200 hover:text-white hover:bg-indigo-700/50'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>بوابة العميل</span>
                </button>
              )}
            </div>

            {!isFieldOfficer && (
              <button
                onClick={onOpenShareModal}
                title="مشاركة رابط بوابة الوكلاء"
                className="p-2 rounded-xl bg-indigo-600 text-indigo-100 hover:text-white hover:bg-indigo-500 border border-indigo-500 transition-colors flex items-center gap-1 text-xs font-semibold shrink-0"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-200" />
                <span className="hidden lg:inline">روابط البوابات</span>
              </button>
            )}

            {!isFieldOfficer && (
              <button
                onClick={onOpenNewAccident}
                className="bg-red-500 hover:bg-red-600 text-white px-3.5 py-2 rounded-xl text-xs font-black shadow-lg shadow-red-600/30 transition-all flex items-center gap-1.5 active:scale-95 uppercase tracking-wide shrink-0"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>بلاغ جديد</span>
                {unresolvedCount > 0 && (
                  <span className="bg-white text-red-700 px-1.5 py-0.2 rounded-full text-xs font-black">
                    {unresolvedCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

