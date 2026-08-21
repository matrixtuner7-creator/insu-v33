import React from 'react';
import { Building2, Smartphone, Share2, Radio, PhoneCall, UserCheck } from 'lucide-react';
import { TrustLogo } from './TrustLogo';

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
    <header className="bg-[#161B1F] text-[#F1F5F9] shadow-lg sticky top-0 z-40 border-b border-[#3A434C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-600/10 border border-orange-500/20 flex items-center justify-center shadow-lg shadow-black/10 overflow-hidden">
              <TrustLogo size="sm" variant="icon" isAlive={true} />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-[#F1F5F9] flex items-center gap-2">
                V-COMMAND {isFieldOfficer ? '' : <span className="font-light text-[#AAB2BA]">HQ</span>}
                {!isFieldOfficer && (
                  <span className="text-xs bg-[#2A323A] text-[#315EF5] px-2.5 py-0.5 rounded-full font-bold border border-[#3A434C]">
                    نظام إدارة الحوادث والعمليات
                  </span>
                )}
              </h1>
              {!isFieldOfficer && <p className="text-[11px] text-[#AAB2BA]">ربط الإدارة، موظف الاستقبال، المحققين، والعملاء لحظياً</p>}
            </div>
          </div>

          {/* Portal Switcher & Actions */}
          <div className="flex items-center space-x-2 space-x-reverse overflow-x-auto py-2">
            <div className="bg-[#1C2229] p-1 rounded-xl flex items-center border border-[#3A434C] shrink-0">
              {!isFieldOfficer && (
                <>
                  <button
                    onClick={() => setActivePortal('hq')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activePortal === 'hq'
                        ? 'bg-[#315EF5] text-white shadow-md'
                        : 'text-[#AAB2BA] hover:text-white hover:bg-[#2A323A]'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>العمليات (HQ)</span>
                  </button>
                  <button
                    onClick={() => setActivePortal('reception')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activePortal === 'reception'
                        ? 'bg-[#315EF5] text-white shadow-md'
                        : 'text-[#AAB2BA] hover:text-white hover:bg-[#2A323A]'
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
                    ? 'bg-[#22A06B] text-white shadow-md'
                    : 'text-[#AAB2BA] hover:text-white hover:bg-[#2A323A]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>المحقق الميداني</span>
                {!isFieldOfficer && <span className="w-1.5 h-1.5 rounded-full bg-[#22A06B] animate-pulse"></span>}
              </button>
              {!isFieldOfficer && (
                <button
                  onClick={() => setActivePortal('customer')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activePortal === 'customer'
                      ? 'bg-[#315EF5] text-white shadow-md'
                      : 'text-[#AAB2BA] hover:text-white hover:bg-[#2A323A]'
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
                className="p-2 rounded-xl bg-[#2A323A] text-[#AAB2BA] hover:text-white hover:bg-[#323A40] border border-[#3A434C] transition-colors flex items-center gap-1 text-xs font-semibold shrink-0"
              >
                <Share2 className="w-3.5 h-3.5 text-[#315EF5]" />
                <span className="hidden lg:inline">روابط البوابات</span>
              </button>
            )}

            {!isFieldOfficer && (
              <button
                onClick={onOpenNewAccident}
                className="bg-[#D64545] hover:bg-[#D64545]/90 text-white px-3.5 py-2 rounded-xl text-xs font-black shadow-lg transition-all flex items-center gap-1.5 active:scale-95 uppercase tracking-wide shrink-0"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>بلاغ جديد</span>
                {unresolvedCount > 0 && (
                  <span className="bg-[#1C2229] text-[#D64545] border border-[#D64545]/40 px-1.5 py-0.2 rounded-full text-xs font-black">
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

