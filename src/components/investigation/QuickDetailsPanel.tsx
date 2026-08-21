import React from 'react';
import { 
  X, 
  MapPin, 
  User, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  MessageSquare, 
  Radio, 
  RefreshCw, 
  ExternalLink,
  Send,
  ChevronLeft
} from 'lucide-react';
import { Accident, FieldAgent } from '../../types';

interface QuickDetailsPanelProps {
  accident?: Accident;
  caseData?: Accident;
  assignedAgent?: FieldAgent;
  onClose: () => void;
  onOpenCase?: (acc: Accident) => void;
  onOpenFullCase?: (acc: Accident) => void;
  onOpenChat: (acc: Accident) => void;
  onOpenRadio: (acc: Accident) => void;
  onFocusMap?: (acc: Accident) => void;
  onReassign?: (acc: Accident) => void;
  onRequestSync?: (acc: Accident) => void;
}

export const QuickDetailsPanel: React.FC<QuickDetailsPanelProps> = ({
  accident,
  caseData,
  assignedAgent,
  onClose,
  onOpenCase,
  onOpenFullCase,
  onOpenChat,
  onOpenRadio,
  onFocusMap,
  onReassign,
  onRequestSync
}) => {
  const activeAccident = accident || caseData;
  if (!activeAccident) {
    return null;
  }

  const caseNumber = activeAccident.accidentNumber || activeAccident.incidentNumber || activeAccident.id || 'قضية ميدانية';
  const isNeedsIntervention = activeAccident.severity === 'حرج' || activeAccident.severity === 'حرج جداً' || activeAccident.status === 'تحتاج تدخل';
  const isDelay = activeAccident.status === 'تأخير' || activeAccident.status === 'تأخير SLA';
  const isCompleted = activeAccident.status === 'مكتمل' || activeAccident.status === 'مغلق';
  
  // Dynamic badge styling following strict color rules
  let badgeBg = 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30';
  let badgeText = activeAccident.status || 'في الطريق';

  if (isNeedsIntervention) {
    badgeBg = 'bg-[#E5484D]/15 text-[#E5484D] border-[#E5484D]/30';
    badgeText = '🚨 تحتاج تدخل غ.ع';
  } else if (isDelay) {
    badgeBg = 'bg-[#E6B84A]/15 text-[#E6B84A] border-[#E6B84A]/30';
    badgeText = '⚠️ تأخير SLA';
  } else if (isCompleted) {
    badgeBg = 'bg-[#18B77A]/15 text-[#18B77A] border-[#18B77A]/30';
    badgeText = '✓ مكتمل';
  } else if (activeAccident.status === 'في الموقع' || activeAccident.status === 'قيد المعاينة') {
    badgeBg = 'bg-[#18B77A]/15 text-[#18B77A] border-[#18B77A]/30';
    badgeText = '📍 في الموقع';
  }

  const stepsCount = (activeAccident as any).currentStep || 6;
  const progressPct = Math.round((stepsCount / 8) * 100);

  const handleOpenCase = () => {
    if (onOpenFullCase) {
      onOpenFullCase(activeAccident);
    } else if (onOpenCase) {
      onOpenCase(activeAccident);
    }
  };

  return (
    <div className="bg-[#17212B] border border-[#34414E] rounded-3xl p-5 shadow-2xl text-[#F4F7FA] space-y-4 animate-in fade-in duration-200" dir="rtl">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[#34414E] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#2F66F6]/15 text-[#3B82F6] border border-[#2F66F6]/30 flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-mono font-black text-sm text-[#F4F7FA] flex items-center gap-2">
              <span>{caseNumber}</span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border ${badgeBg}`}>
                {badgeText}
              </span>
            </h4>
            <span className="text-[11px] text-[#A9B5C2]">{activeAccident.incidentCategory || 'حوادث مركبات'} • {activeAccident.incidentSubtype || 'معاينة ميدانية'}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 bg-[#1B2530] hover:bg-[#25313D] text-[#A9B5C2] hover:text-[#F4F7FA] rounded-xl border border-[#34414E] transition-all cursor-pointer"
          title="إغلاق اللوحة السريعة"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        {/* Investigator */}
        <div className="p-2.5 bg-[#1B2530] rounded-2xl border border-[#34414E]">
          <span className="text-[10px] text-[#738190] flex items-center gap-1">
            <User className="w-3 h-3 text-[#3B82F6]" />
            <span>المحقق الميداني:</span>
          </span>
          <strong className="text-white text-xs block truncate mt-0.5">
            {assignedAgent?.name || activeAccident.assignedAgentName || 'غير منسّب'}
          </strong>
        </div>

        {/* Location */}
        <div className="p-2.5 bg-[#1B2530] rounded-2xl border border-[#34414E]">
          <span className="text-[10px] text-[#738190] flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#E6B84A]" />
            <span>الموقع الجغرافي:</span>
          </span>
          <strong className="text-white text-xs block truncate mt-0.5">{activeAccident.locationName || 'نابلس - وسط المدينة'}</strong>
        </div>

        {/* Duration */}
        <div className="p-2.5 bg-[#1B2530] rounded-2xl border border-[#34414E]">
          <span className="text-[10px] text-[#738190] flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#18B77A]" />
            <span>مدة المهمة:</span>
          </span>
          <strong className="text-[#E6B84A] font-mono text-xs block mt-0.5">00:46 (ضمن SLA)</strong>
        </div>

        {/* Dispatch Time */}
        <div className="p-2.5 bg-[#1B2530] rounded-2xl border border-[#34414E]">
          <span className="text-[10px] text-[#738190] block">وقت التكليف:</span>
          <strong className="text-[#A9B5C2] font-mono text-[11px] block mt-0.5">14:22:10</strong>
        </div>

        {/* Arrival Time */}
        <div className="p-2.5 bg-[#1B2530] rounded-2xl border border-[#34414E]">
          <span className="text-[10px] text-[#738190] block">وقت الوصول:</span>
          <strong className="text-[#18B77A] font-mono text-[11px] block mt-0.5">14:31:05</strong>
        </div>

        {/* Last Sync */}
        <div className="p-2.5 bg-[#1B2530] rounded-2xl border border-[#34414E]">
          <span className="text-[10px] text-[#738190] block">آخر مزامنة:</span>
          <strong className="text-[#18B77A] font-mono text-[11px] block mt-0.5">منذ 15 ثانية</strong>
        </div>
      </div>

      {/* Progress Bar Section */}
      <div className="p-3 bg-[#1B2530] rounded-2xl border border-[#34414E] space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#A9B5C2] font-bold">تقدم خطوة التحقيق:</span>
          <span className="font-mono font-black text-[#3B82F6]">{stepsCount} / 8 ({progressPct}%)</span>
        </div>
        <div className="w-full bg-[#25313D] h-2 rounded-full overflow-hidden">
          <div className="bg-[#2F66F6] h-full rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          onClick={handleOpenCase}
          className="flex-1 py-2 px-3 bg-[#2F66F6] hover:bg-[#3B82F6] text-white text-xs font-bold rounded-xl transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>فتح التحقيق</span>
        </button>

        <button
          onClick={() => onOpenChat(activeAccident)}
          className="py-2 px-3 bg-[#25313D] hover:bg-[#34414E] text-[#F4F7FA] border border-[#34414E] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          title="مراسلة المحقق"
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#3B82F6]" />
          <span>رسالة</span>
        </button>

        <button
          onClick={() => onOpenRadio(activeAccident)}
          className="py-2 px-3 bg-[#25313D] hover:bg-[#34414E] text-[#18B77A] border border-[#34414E] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          title="اللاسلكي PTT"
        >
          <Radio className="w-3.5 h-3.5" />
          <span>PTT</span>
        </button>

        {onFocusMap && (
          <button
            onClick={() => onFocusMap(activeAccident)}
            className="py-2 px-3 bg-[#25313D] hover:bg-[#34414E] text-[#E6B84A] border border-[#34414E] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="تحديد الموقع بالخريطة"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>الموقع</span>
          </button>
        )}

        <a
          href={`https://waze.com/ul?ll=${activeAccident.lat},${activeAccident.lng}&navigate=yes`}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2 px-3 bg-[#F2A900] hover:bg-[#d59400] text-[#111820] text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-[#F2A900]/10 text-center"
          title="فتح وتوجيه وملاحة مباشرة عبر Waze"
        >
          <span>Waze 🚗</span>
        </a>

        {onReassign && (
          <button
            onClick={() => onReassign(activeAccident)}
            className="py-2 px-3 bg-[#25313D] hover:bg-[#34414E] text-[#3B82F6] border border-[#34414E] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="إعادة توجيه / إسناد"
          >
            <Send className="w-3.5 h-3.5" />
            <span>توجيه</span>
          </button>
        )}

        {onRequestSync && (
          <button
            onClick={() => onRequestSync(activeAccident)}
            className="py-2 px-2.5 bg-[#25313D] hover:bg-[#34414E] text-[#A9B5C2] hover:text-white border border-[#34414E] text-xs font-bold rounded-xl transition-all cursor-pointer"
            title="طلب استكمال البيانات فوراً"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
