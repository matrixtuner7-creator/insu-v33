import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MapPin, 
  Users, 
  Camera, 
  Compass, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  UserCheck, 
  FileCheck2, 
  RotateCcw, 
  Send, 
  Plus, 
  MessageSquare, 
  Eye, 
  X, 
  Car, 
  Cloud, 
  CloudOff, 
  Lock, 
  Maximize2, 
  Volume2, 
  PenTool, 
  Layers, 
  Activity,
  History,
  Info
} from 'lucide-react';
import { 
  Accident, 
  FieldAgent, 
  Dispatch, 
  InvestigationSession, 
  InvestigationStepNumber, 
  SyncStatusType 
} from '../../types';

interface AdminFieldInvestigationTabProps {
  accident: Accident;
  assignedAgent?: FieldAgent;
  matchingDispatch?: Dispatch;
  onUpdateAccident?: (updated: Accident) => void;
}

type StepStatusType = 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED' | 'MISSING_DATA' | 'WAITING_SYNC';

const STEP_LABELS: Record<InvestigationStepNumber, string> = {
  1: 'الوصول للموقع',
  2: 'بيانات الحادث',
  3: 'الأطراف والمركبات',
  4: 'التصوير والتوثيق',
  5: 'مخطط الحادث',
  6: 'الإفادات والشهود',
  7: 'تقييم الأضرار',
  8: 'النتيجة والتقرير'
};

const REPORT_STATUS_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: 'مسودة', color: 'text-slate-400', bg: 'bg-slate-800 border-slate-700' },
  FIELD_IN_PROGRESS: { label: 'جاري التحقيق الميداني', color: 'text-blue-400', bg: 'bg-blue-950 border-blue-800' },
  SUBMITTED: { label: 'تم الإرسال - بانتظار الاعتماد', color: 'text-amber-400', bg: 'bg-amber-950 border-amber-800' },
  UNDER_REVIEW: { label: 'قيد المراجعة الإدارية', color: 'text-purple-400', bg: 'bg-purple-950 border-purple-800' },
  RETURNED_FOR_COMPLETION: { label: 'معاد لاستكمال البيانات', color: 'text-red-400', bg: 'bg-red-950 border-red-800' },
  APPROVED: { label: 'معتمد رسمياً', color: 'text-emerald-400', bg: 'bg-emerald-950 border-emerald-800' },
  CLOSED: { label: 'مغلق', color: 'text-gray-400', bg: 'bg-gray-800 border-gray-700' }
};

export const AdminFieldInvestigationTab: React.FC<AdminFieldInvestigationTabProps> = ({
  accident,
  assignedAgent,
  matchingDispatch,
  onUpdateAccident
}) => {
  const caseId = accident.accidentNumber || accident.incidentNumber || accident.id;

  const [session, setSession] = useState<InvestigationSession | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStepModal, setSelectedStepModal] = useState<InvestigationStepNumber | null>(null);
  const [activeImageZoom, setActiveImageZoom] = useState<string | null>(null);

  // Admin Actions State
  const [actionNote, setActionNote] = useState('');
  const [targetCompletionStep, setTargetCompletionStep] = useState<number>(1);
  const [showAdminActionModal, setShowAdminActionModal] = useState<'note' | 'completion' | 'reopen' | 'return' | 'approve' | 'close' | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Fetch Session & Audit Logs from Backend
  const fetchSessionAndLogs = async () => {
    try {
      setIsLoading(true);
      const [sessRes, logsRes] = await Promise.all([
        fetch(`/api/investigation/session/${encodeURIComponent(caseId)}`),
        fetch(`/api/investigation/audit-logs/${encodeURIComponent(caseId)}`)
      ]);

      if (sessRes.ok) {
        const sessData = await sessRes.json();
        if (sessData && sessData.caseId) {
          setSession(sessData);
        }
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setAuditLogs(logsData || []);
      }
    } catch (err) {
      console.error("Failed to fetch admin field investigation data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionAndLogs();
    const interval = setInterval(fetchSessionAndLogs, 5000); // Poll every 5s for live HQ sync
    return () => clearInterval(interval);
  }, [caseId]);

  // Compute Session Metrics
  const completedCount = session?.completedSteps?.length || (accident.status === 'مغلق' ? 8 : 4);
  const progressPercent = Math.round((completedCount / 8) * 100);

  const currentReportStatus = session?.status || (accident.status === 'مغلق' ? 'APPROVED' : 'FIELD_IN_PROGRESS');
  const badgeConfig = REPORT_STATUS_BADGES[currentReportStatus] || REPORT_STATUS_BADGES.FIELD_IN_PROGRESS;

  // Determine status for each individual step
  const getStepStatus = (stepNum: InvestigationStepNumber): StepStatusType => {
    if (session?.completionRequest?.stepNumber === stepNum) {
      return 'MISSING_DATA';
    }
    if (session?.completedSteps?.includes(stepNum)) {
      return 'COMPLETED';
    }
    if (session?.currentStep === stepNum) {
      return session?.syncStatus === 'PENDING_SYNC' ? 'WAITING_SYNC' : 'IN_PROGRESS';
    }
    return 'NOT_STARTED';
  };

  const getStepStatusBadge = (status: StepStatusType) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2.5 py-1 bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 rounded-lg text-[10px] font-black flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> مكتملة</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 bg-blue-950/80 text-blue-400 border border-blue-800/80 rounded-lg text-[10px] font-black flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> جاري العمل</span>;
      case 'MISSING_DATA':
        return <span className="px-2.5 py-1 bg-red-950/80 text-red-400 border border-red-800/80 rounded-lg text-[10px] font-black flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> يوجد نقص</span>;
      case 'WAITING_SYNC':
        return <span className="px-2.5 py-1 bg-amber-950/80 text-amber-400 border border-amber-800/80 rounded-lg text-[10px] font-black flex items-center gap-1"><CloudOff className="w-3 h-3" /> بانتظار المزامنة</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-lg text-[10px] font-bold">لم تبدأ</span>;
    }
  };

  // Perform Admin Supervision Action
  const handlePerformAdminAction = async (actionType: string) => {
    setIsSubmittingAction(true);
    try {
      const res = await fetch('/api/investigation/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminUserId: 'ADMIN-HQ-DIRECTOR',
          caseId,
          investigatorId: session?.investigatorId || assignedAgent?.id || 'emp-1787022544825',
          action: actionType,
          stepNumber: targetCompletionStep,
          note: actionNote,
          oldValue: currentReportStatus,
          newValue: actionType === 'APPROVE_REPORT' ? 'APPROVED' : actionType === 'RETURN_REPORT' ? 'RETURNED_FOR_COMPLETION' : currentReportStatus
        })
      });

      if (res.ok) {
        const data = await res.json();
        setActionSuccessMsg(`تم تنفيذ الإجراء (${data.auditLog?.action || actionType}) وتسجيله في سجل التدقيق بنجاح.`);
        
        if (actionType === 'CLOSE_CASE' || actionType === 'APPROVE_REPORT') {
          if (onUpdateAccident) {
            onUpdateAccident({
              ...accident,
              status: 'مغلق'
            });
          }
        }

        setTimeout(() => setActionSuccessMsg(''), 4000);
        setShowAdminActionModal(null);
        setActionNote('');
        fetchSessionAndLogs();
      } else {
        const errText = await res.text();
        let errMsg = "حدث خطأ أثناء تنفيذ الإجراء. يرجى المحاولة مرة أخرى.";
        try {
          const parsed = JSON.parse(errText);
          if (parsed.error) errMsg = parsed.error;
        } catch (e) {
          if (errText) errMsg = errText;
        }
        alert(`فشلت العملية: ${errMsg}`);
      }
    } catch (err) {
      console.error("Error executing admin action:", err);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl" id="ADMIN_CASE_OPEN">
      {/* Action Success Toast */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-950 border-2 border-emerald-500 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* 1. TOP INVESTIGATION HEADER & AGENT METRICS */}
      <div className="bg-[#2A323A] rounded-3xl p-5 border border-[#3A434C] shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#3A434C] pb-4">
          {/* Right: Case ID & Investigator Info */}
          <div className="flex items-center gap-3">
            <img 
              src={assignedAgent?.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'} 
              alt={session?.investigatorName || assignedAgent?.name || 'المحقق'}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-[#315EF5] shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  {session?.investigatorName || assignedAgent?.name || 'غير منسّب'}
                </h3>
                <span className="text-[10px] font-mono bg-blue-950 text-blue-400 border border-blue-800/60 px-2 py-0.5 rounded-full font-bold">
                  #{caseId}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                محقق ميداني معتمد | {session?.arrivalData?.locationAddress || accident.locationName}
              </p>
            </div>
          </div>

          {/* Left: Overall Report Status & Live Sync Indicator */}
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 ${badgeConfig.bg} ${badgeConfig.color}`}>
              <ShieldCheck className="w-4 h-4" />
              <span>{badgeConfig.label}</span>
            </div>

            <div className="px-3 py-1.5 bg-[#323A40] border border-[#3A434C] rounded-xl text-xs text-slate-300 font-mono font-bold flex items-center gap-1.5" id="OFFLINE_PENDING_VISIBLE">
              {session?.syncStatus === 'SYNCED' ? (
                <>
                  <Cloud className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">متزامن 100%</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="text-amber-400">بانتظار المزامنة</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Dispatch Timestamps Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs pt-1">
          <div className="p-3 bg-[#1C2229] rounded-2xl border border-[#3A434C]/60 space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold">حالة التكليف</span>
            <span className="font-black text-blue-400 block truncate">
              {matchingDispatch?.status === 'arrived' ? 'وصل للموقع' : matchingDispatch?.status === 'accepted' ? 'تم القبول' : 'في الموقع'}
            </span>
          </div>

          <div className="p-3 bg-[#1C2229] rounded-2xl border border-[#3A434C]/60 space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold">وقت إرسال التكليف</span>
            <span className="font-mono font-bold text-slate-200 block truncate">
              {matchingDispatch?.assignedAt ? new Date(matchingDispatch.assignedAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '10:15 صباحاً'}
            </span>
          </div>

          <div className="p-3 bg-[#1C2229] rounded-2xl border border-[#3A434C]/60 space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold">وقت قبول المهمة</span>
            <span className="font-mono font-bold text-slate-200 block truncate">
              {matchingDispatch?.acceptedAt ? new Date(matchingDispatch.acceptedAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '10:18 صباحاً'}
            </span>
          </div>

          <div className="p-3 bg-[#1C2229] rounded-2xl border border-[#3A434C]/60 space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold">وقت الوصول للموقع</span>
            <span className="font-mono font-bold text-emerald-400 block truncate">
              {session?.arrivalData?.arrivalTime || '10:28 صباحاً'}
            </span>
          </div>

          <div className="p-3 bg-[#1C2229] rounded-2xl border border-[#3A434C]/60 space-y-1 col-span-2 md:col-span-1">
            <span className="text-[10px] text-slate-400 block font-bold">مدة التحقيق الحالية</span>
            <span className="font-mono font-black text-amber-400 block truncate">
              00:46:12
            </span>
          </div>
        </div>
      </div>

      {/* 2. MASTER PROGRESS TRACKER BAR */}
      <div className="bg-[#2A323A] rounded-3xl p-5 border border-[#3A434C] shadow-xl space-y-3" id="INVESTIGATION_PROGRESS_VISIBLE">
        <div className="flex items-center justify-between text-xs font-black">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#315EF5]" />
            <span className="text-white">نسبة إنجاز مسار التحقيق الميداني</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-400 font-mono text-sm">{completedCount} من 8 خطوات مكتملة</span>
            <span className="px-2 py-0.5 bg-blue-950 text-blue-300 font-mono text-xs rounded-lg border border-blue-800/50">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full bg-[#1C2229] h-3.5 rounded-full overflow-hidden p-0.5 border border-[#3A434C]">
          <div 
            className="bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500 h-full rounded-full transition-all duration-500 shadow-lg shadow-blue-500/30"
            style={{ width: `${Math.max(5, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* 3. THE 8 INVESTIGATION STEPS CARDS GRID */}
      <div className="space-y-3" id="STEP_STATUS_VISIBLE">
        <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#315EF5]" />
          <span>خطوات ومراحل التحقيق الميداني (8 خطوات)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {([1, 2, 3, 4, 5, 6, 7, 8] as InvestigationStepNumber[]).map((stepNum) => {
            const status = getStepStatus(stepNum);
            const stepTitle = STEP_LABELS[stepNum];

            return (
              <div
                key={stepNum}
                onClick={() => setSelectedStepModal(stepNum)}
                className="bg-[#2A323A] hover:bg-[#323A40] border border-[#3A434C] hover:border-blue-500/50 rounded-2xl p-4 transition-all shadow-md cursor-pointer group flex flex-col justify-between space-y-3 active:scale-98"
              >
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-xl bg-slate-800 text-blue-400 font-mono text-xs font-black flex items-center justify-center border border-slate-700">
                    {stepNum}
                  </span>
                  {getStepStatusBadge(status)}
                </div>

                <div>
                  <h5 className="font-black text-sm text-white group-hover:text-blue-300 transition-colors">
                    {stepTitle}
                  </h5>
                  <p className="text-[10px] text-slate-400 font-medium mt-1 line-clamp-1">
                    {stepNum === 1 && (session?.arrivalData?.locationAddress || 'تأكيد إحداثيات GPS ورقم الموقع')}
                    {stepNum === 2 && (session?.basicInfo?.incidentType || 'بيانات الحادث وتاريخ وقوعه')}
                    {stepNum === 3 && (`${session?.parties?.length || 2} أطرف مسجلة بالأوراق`)}
                    {stepNum === 4 && (`${session?.mediaChecklist?.length || 4} صور موثقة بالكاميرا`)}
                    {stepNum === 5 && (session?.diagramData?.roadType ? 'تم توثيق مخطط الاصطدام' : 'رسم كروكي تفاعلي')}
                    {stepNum === 6 && (`${session?.statements?.length || 2} إفادات كتابية وتوقيعات`)}
                    {stepNum === 7 && (`${session?.damageAssessment?.length || 2} قطع متضررة بالمركبات`)}
                    {stepNum === 8 && (session?.finalReport?.summary ? 'تم إعداد التقرير والتوقيع' : 'اعتماد التقرير النهائي')}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#3A434C]/60 flex items-center justify-between text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors">
                  <span>عرض التفاصيل والإثباتات</span>
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ADMIN SUPERVISION POWERS & ACTIONS PANEL */}
      <div className="bg-[#2A323A] rounded-3xl p-5 border border-[#3A434C] shadow-xl space-y-4">
        <h4 className="text-xs font-black text-[#F1F5F9] flex items-center gap-2 border-b border-[#3A434C] pb-3">
          <ShieldCheck className="w-4 h-4 text-[#315EF5]" />
          <span>صلاحيات الإشراف الإداري والتحكم بالتقرير</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {/* Action 1: Add Note */}
          <button
            type="button"
            onClick={() => setShowAdminActionModal('note')}
            className="p-3 bg-[#323A40] hover:bg-[#3A434C] border border-[#3A434C] text-slate-200 rounded-2xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span>إضافة ملاحظة إدارية</span>
          </button>

          {/* Action 2: Request Completion */}
          <button
            type="button"
            id="ADMIN_REQUEST_COMPLETION"
            onClick={() => setShowAdminActionModal('completion')}
            className="p-3 bg-[#323A40] hover:bg-[#3A434C] border border-[#3A434C] text-slate-200 rounded-2xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>طلب استكمال بيانات</span>
          </button>

          {/* Action 3: Reopen Step */}
          <button
            type="button"
            onClick={() => setShowAdminActionModal('reopen')}
            className="p-3 bg-[#323A40] hover:bg-[#3A434C] border border-[#3A434C] text-slate-200 rounded-2xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-purple-400" />
            <span>إعادة فتح خطوة</span>
          </button>

          {/* Action 4: Return Report */}
          <button
            type="button"
            id="REPORT_RETURN"
            onClick={() => setShowAdminActionModal('return')}
            className="p-3 bg-red-950/60 hover:bg-red-900/80 border border-red-800/80 text-red-300 rounded-2xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4 text-red-400 rotate-180" />
            <span>إعادة التقرير للمحقق</span>
          </button>

          {/* Action 5: Approve Final Report */}
          <button
            type="button"
            id="REPORT_APPROVAL"
            onClick={() => setShowAdminActionModal('approve')}
            className="p-3 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-300 rounded-2xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            <span>اعتماد التقرير النهائي</span>
          </button>

          {/* Action 6: Close Case */}
          <button
            type="button"
            disabled={session?.status !== 'APPROVED'}
            onClick={() => setShowAdminActionModal('close')}
            className={`p-3 border rounded-2xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
              session?.status === 'APPROVED'
                ? 'bg-gray-900 hover:bg-gray-800 border-gray-700 text-gray-300'
                : 'bg-gray-900/40 border-gray-800/60 text-slate-500 opacity-50 cursor-not-allowed'
            }`}
            title={session?.status !== 'APPROVED' ? 'يجب اعتماد التقرير النهائي أولاً قبل السماح بإغلاق القضية' : ''}
          >
            <Lock className="w-4 h-4 text-slate-400" />
            <span>إغلاق ملف القضية</span>
          </button>
        </div>
      </div>

      {/* 5. AUDIT LOG TRAIL TABLE (سجل التدقيق الإداري) */}
      <div className="bg-[#2A323A] rounded-3xl p-5 border border-[#3A434C] shadow-xl space-y-3" id="AUDIT_LOG">
        <div className="flex items-center justify-between border-b border-[#3A434C] pb-3">
          <h4 className="text-xs font-black text-white flex items-center gap-2">
            <History className="w-4 h-4 text-[#315EF5]" />
            <span>سجل حركة وتدقيق إجراءات القضية (Audit Trail)</span>
          </h4>
          <span className="text-[10px] text-slate-400 font-mono">
            {auditLogs.length} سجلات موثقة
          </span>
        </div>

        {auditLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-[#3A434C] text-[#AAB2BA] text-[10px] font-bold uppercase">
                  <th className="py-2 px-3">التاريخ والوقت</th>
                  <th className="py-2 px-3">المستخدم (Admin / Agent)</th>
                  <th className="py-2 px-3">نوع الإجراء</th>
                  <th className="py-2 px-3">الحالة القادمة/الجديدة</th>
                  <th className="py-2 px-3">التفاصيل والملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3A434C]/60 text-slate-200">
                {auditLogs.map((log) => (
                  <tr key={log.id || Math.random()} className="hover:bg-[#323A40]/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleString('ar-EG')}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-blue-300">
                      {log.details?.admin_user_id || log.investigatorName || log.investigatorId}
                    </td>
                    <td className="py-2.5 px-3 font-black text-slate-100">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">
                        {log.details?.new_value || log.details?.status || 'حفظ'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px] max-w-xs truncate">
                      {log.details?.note || log.details?.action || JSON.stringify(log.details || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 text-center text-slate-400 text-xs">
            لا توجد سجلات تدقيق إداري سابقة لهذه القضية حتى الآن.
          </div>
        )}
      </div>

      {/* STEP DETAIL MODAL (READ-ONLY FOR HQ) */}
      {selectedStepModal && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" dir="rtl">
          <div className="bg-[#2A323A] border border-[#3A434C] rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-right">
            {/* Modal Header */}
            <div className="p-4 bg-[#1C2229] border-b border-[#3A434C] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-mono text-sm font-black flex items-center justify-center">
                  {selectedStepModal}
                </span>
                <div>
                  <h3 className="font-black text-sm text-white">
                    {STEP_LABELS[selectedStepModal]} (معاينة الإدارة)
                  </h3>
                  <p className="text-[10px] text-slate-400">قراءة فقط - معتمدة من تطبيق المحقق</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStepModal(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Viewport */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* STEP 1: ARRIVAL */}
              {selectedStepModal === 1 && (
                <div className="space-y-3">
                  <div className="p-4 bg-[#1C2229] rounded-2xl border border-[#3A434C] space-y-2">
                    <span className="text-[10px] text-slate-400 block font-bold">حالة الموقع والتأكيد</span>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-emerald-400 text-sm">
                        {session?.arrivalData?.confirmed ? 'تم تأكيد الوصول عبر GPS' : 'بانتظار تأكيد الوصول'}
                      </span>
                      <span className="font-mono text-slate-300">
                        {session?.arrivalData?.arrivalTime || '10:28:45 AM'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#1C2229] rounded-2xl border border-[#3A434C]">
                      <span className="text-[10px] text-slate-400 block">خط العرض (Latitude)</span>
                      <span className="font-mono text-white font-bold">{session?.arrivalData?.lat || 32.2211}</span>
                    </div>
                    <div className="p-3 bg-[#1C2229] rounded-2xl border border-[#3A434C]">
                      <span className="text-[10px] text-slate-400 block">خط الطول (Longitude)</span>
                      <span className="font-mono text-white font-bold">{session?.arrivalData?.lng || 35.2544}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#1C2229] rounded-2xl border border-[#3A434C]">
                    <span className="text-[10px] text-slate-400 block">عنوان الموقع المثبّت</span>
                    <span className="text-slate-200 font-bold">{session?.arrivalData?.locationAddress || accident.locationName}</span>
                  </div>
                </div>
              )}

              {/* STEP 2: BASIC INFO */}
              {selectedStepModal === 2 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#1C2229] rounded-2xl border border-[#3A434C]">
                      <span className="text-[10px] text-slate-400 block">نوع الحادث</span>
                      <span className="font-bold text-blue-400">{session?.basicInfo?.incidentType || 'تصادم مركبتين'}</span>
                    </div>
                    <div className="p-3 bg-[#1C2229] rounded-2xl border border-[#3A434C]">
                      <span className="text-[10px] text-slate-400 block">التاريخ والوقت</span>
                      <span className="font-mono text-slate-200 font-bold">
                        {session?.basicInfo?.incidentDate || '2026-08-18'} | {session?.basicInfo?.incidentTime || '10:30'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#1C2229] rounded-2xl border border-[#3A434C] space-y-1">
                    <span className="text-[10px] text-slate-400 block font-bold">وصف الحادث الأولي</span>
                    <p className="text-slate-200 leading-relaxed">
                      {session?.basicInfo?.initialDescription || 'تصادم مركبة رقم (5-9821-99) مع مركبة (3-1102-90) قرب المفترق الرئيسي بسبب انحراف مفاجئ.'}
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3: PARTIES & VEHICLES */}
              {selectedStepModal === 3 && (
                <div className="space-y-3">
                  {(session?.parties || [
                    { id: 'p1', roleLabel: 'المؤمن له (الطرف الأول)', name: 'محمد أحمد علي', nationalId: '908726152', phone: '+970599123456', vehiclePlate: '5-9821-99', vehicleModel: 'هيونداي توسان', insuranceCompany: 'المشرق للتأمين' },
                    { id: 'p2', roleLabel: 'الطرف الثاني (المتضرر)', name: 'خالد يوسف عمر', nationalId: '912345678', phone: '+970598765432', vehiclePlate: '3-1102-90', vehicleModel: 'كيا سبورتاج', insuranceCompany: 'الوطنية للتأمين' }
                  ]).map((party: any, i: number) => (
                    <div key={i} className="p-4 bg-[#1C2229] rounded-2xl border border-[#3A434C] space-y-2">
                      <div className="flex items-center justify-between border-b border-[#3A434C] pb-2">
                        <span className="font-black text-blue-400">{party.roleLabel || `طرف ${i+1}`}</span>
                        <span className="font-mono text-[10px] text-slate-400">لوحة: {party.vehiclePlate}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div><span className="text-slate-400">الاسم:</span> <strong className="text-white">{party.name}</strong></div>
                        <div><span className="text-slate-400">الهوية:</span> <span className="font-mono text-slate-200">{party.nationalId}</span></div>
                        <div><span className="text-slate-400">الهاتف:</span> <span className="font-mono text-slate-200">{party.phone}</span></div>
                        <div><span className="text-slate-400">الشركة:</span> <span className="text-slate-200">{party.insuranceCompany}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 4: MEDIA CHECKLIST & PHOTOS */}
              {selectedStepModal === 4 && (
                <div className="space-y-4" id="MEDIA_VISIBLE">
                  <div className="flex items-center justify-between p-3 bg-blue-950/60 border border-blue-800/60 rounded-2xl text-blue-300">
                    <span className="font-bold">إجمالي الوسائط الموثقة:</span>
                    <span className="font-mono font-black text-white">
                      {session?.mediaChecklist?.length || 4} صورة موثقة
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(session?.mediaChecklist || [
                      { id: '1', photoUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600', categoryLabel: 'صور الموقع العام' },
                      { id: '2', photoUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600', categoryLabel: 'نقطة الاصطدام' },
                      { id: '3', photoUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600', categoryLabel: 'مركبة المؤمن له' },
                      { id: '4', photoUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600', categoryLabel: 'مركبة الطرف الثاني' }
                    ]).map((item: any, idx: number) => (
                      <div 
                        key={idx}
                        onClick={() => setActiveImageZoom(item.photoUrl)}
                        className="relative group rounded-2xl overflow-hidden border border-[#3A434C] aspect-square bg-slate-900 cursor-pointer"
                      >
                        <img src={item.photoUrl} alt={item.categoryLabel} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 to-transparent text-[10px] text-white font-bold truncate">
                          {item.categoryLabel}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 5: ACCIDENT DIAGRAM (CROQUIS) */}
              {selectedStepModal === 5 && (
                <div className="space-y-3" id="DIAGRAM_VISIBLE">
                  <div className="p-4 bg-[#1C2229] rounded-2xl border border-[#3A434C] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400">مخطط الكروكا الهندسي الرسمي المعتمد:</span>
                      {session?.diagramData?.roadType && (
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-lg text-[10px] font-bold border border-slate-700">
                          {session.diagramData.roadType === 'intersection' ? 'مفترق طرق رباعي' :
                           session.diagramData.roadType === 'roundabout' ? 'دوار مروري' :
                           session.diagramData.roadType === 't_junction' ? 'مفترق T' :
                           session.diagramData.roadType === 'highway' ? 'طريق سريع' : 'شارع مستقيم'}
                        </span>
                      )}
                    </div>

                    {session?.diagramData?.previewImageUrl || session?.diagramData?.exportedImage ? (
                      <div className="space-y-3">
                        <div 
                          onClick={() => setActiveImageZoom(session.diagramData.previewImageUrl || session.diagramData.exportedImage)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-2xl overflow-hidden cursor-pointer group relative shadow-inner"
                        >
                          <img 
                            src={session.diagramData.previewImageUrl || session.diagramData.exportedImage} 
                            alt="مخطط الكروكا" 
                            className="w-full max-h-[380px] object-contain mx-auto group-hover:scale-[1.02] transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <span className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1">
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>تكبير الكروكا</span>
                            </span>
                          </div>
                        </div>

                        {session.diagramData.notes && (
                          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-300 text-xs">
                            <span className="font-bold text-amber-400 block mb-1">إيضاحات وتفاصيل المحقق:</span>
                            <p>{session.diagramData.notes}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-slate-900/60 rounded-xl border border-dashed border-slate-700 space-y-2">
                        <Layers className="w-8 h-8 text-slate-500 mx-auto" />
                        <p className="text-xs text-slate-300 font-bold">بانتظار اعتماد المخطط الكروكي النهائي</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 6: STATEMENTS */}
              {selectedStepModal === 6 && (
                <div className="space-y-3" id="STATEMENTS_VISIBLE">
                  {(session?.statements || [
                    { partyLabel: 'المؤمن له (محمد أحمد)', statementText: 'كنت أسير بسرعة قانونية وفوجئت بالطرف الثاني ينعطف دون إعطاء أولوية' },
                    { partyLabel: 'الطرف الثاني (خالد يوسف)', statementText: 'توقفت عند الإشارة الضوئية واصطدمت بي المركبة الأولى من الخلف' }
                  ]).map((stmt: any, i: number) => (
                    <div key={i} className="p-4 bg-[#1C2229] rounded-2xl border border-[#3A434C] space-y-2">
                      <span className="font-black text-blue-400 block border-b border-[#3A434C] pb-1">{stmt.partyLabel}</span>
                      <p className="text-slate-200 leading-relaxed text-xs">{stmt.statementText || 'لا توجد إفادة مدونة'}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 7: DAMAGE ASSESSMENT */}
              {selectedStepModal === 7 && (
                <div className="space-y-3" id="DAMAGES_VISIBLE">
                  {(session?.damageAssessment || [
                    { vehicleLabel: 'هيونداي توسان (5-9821-99)', partName: 'المصد الأمامي والغاطس', severity: 'severe', notes: 'كسر بالكامل وتلف الراديتر', estimatedCost: 3500 },
                    { vehicleLabel: 'كيا سبورتاج (3-1102-90)', partName: 'المصد الخلفي والضوء الأيمن', severity: 'medium', notes: 'انبعاج بالغطاء وكسر المصباح', estimatedCost: 1800 }
                  ]).map((dmg: any, i: number) => (
                    <div key={i} className="p-4 bg-[#1C2229] rounded-2xl border border-[#3A434C] space-y-2">
                      <div className="flex items-center justify-between border-b border-[#3A434C] pb-1">
                        <span className="font-black text-white">{dmg.vehicleLabel}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${dmg.severity === 'severe' ? 'bg-red-950 text-red-400' : 'bg-amber-950 text-amber-400'}`}>
                          {dmg.severity === 'severe' ? 'ضرر جسيم' : 'ضرر متوسط'}
                        </span>
                      </div>
                      <div className="text-slate-300">
                        <strong>الجزء المتضرر:</strong> {dmg.partName}
                      </div>
                      <p className="text-slate-400 text-[11px]">{dmg.notes}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 8: FINAL REPORT */}
              {selectedStepModal === 8 && (
                <div className="space-y-3">
                  <div className="p-4 bg-[#1C2229] rounded-2xl border border-[#3A434C] space-y-2">
                    <span className="font-black text-emerald-400 block border-b border-[#3A434C] pb-1">الخلاصة الفنية للتقرير</span>
                    <p className="text-slate-200 leading-relaxed">
                      {session?.finalReport?.summary || 'الحادث عبارة عن تصادم عند مفترق طرق. الأضرار مادية ولا يوجد إصابات بشرية.'}
                    </p>
                  </div>
                  {session?.finalReport?.investigatorSignature && (
                    <div className="p-3 bg-[#1C2229] rounded-2xl border border-[#3A434C]">
                      <span className="text-[10px] text-slate-400 block mb-1">توقيع المحقق الميداني</span>
                      <img src={session.finalReport.investigatorSignature} alt="Tوقيع" className="h-12 border border-slate-700 bg-white p-1 rounded" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[#1C2229] border-t border-[#3A434C] text-left">
              <button
                type="button"
                onClick={() => setSelectedStepModal(null)}
                className="px-4 py-2 bg-[#315EF5] hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
              >
                إغلاق معاينة الخطوة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN IMAGE ZOOM MODAL */}
      {activeImageZoom && (
        <div className="fixed inset-0 z-[999999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setActiveImageZoom(null)}>
          <div className="relative max-w-4xl max-h-[90vh]">
            <button 
              type="button" 
              onClick={() => setActiveImageZoom(null)} 
              className="absolute -top-10 left-0 p-2 text-white bg-slate-800 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={activeImageZoom} alt="توصيف بالكامل" className="max-w-full max-h-[85vh] rounded-2xl object-contain border-2 border-white/20 shadow-2xl" />
          </div>
        </div>
      )}

      {/* ADMIN ACTION DIALOG MODAL */}
      {showAdminActionModal && (
        <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" dir="rtl">
          <div className="bg-[#2A323A] border border-[#3A434C] rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-[#3A434C] pb-3">
              <h3 className="font-black text-sm text-white">
                {showAdminActionModal === 'note' && 'إضافة ملاحظة إدارية'}
                {showAdminActionModal === 'completion' && 'طلب استكمال بيانات ناقصة'}
                {showAdminActionModal === 'reopen' && 'إعادة فتح خطوة محددة للمحقق'}
                {showAdminActionModal === 'return' && 'إعادة التقرير كاملاً للمحقق'}
                {showAdminActionModal === 'approve' && 'اعتماد التقرير النهائي الميداني'}
                {showAdminActionModal === 'close' && 'إغلاق ملف القضية النهائي'}
              </h3>
              <button type="button" onClick={() => setShowAdminActionModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(showAdminActionModal === 'completion' || showAdminActionModal === 'reopen') && (
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 font-bold block">اختر رقم الخطوة:</label>
                <select
                  value={targetCompletionStep}
                  onChange={(e) => setTargetCompletionStep(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#1C2229] border border-[#3A434C] text-white rounded-xl text-xs font-bold focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>الخطوة {s}: {STEP_LABELS[s as InvestigationStepNumber]}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] text-slate-300 font-bold block">التفاصيل أو السبب الإداري:</label>
              <textarea
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="اكتب التوجيهات أو الملاحظة الإدارية للتدقيق..."
                rows={3}
                className="w-full p-3 bg-[#1C2229] border border-[#3A434C] text-white rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={isSubmittingAction}
                onClick={() => {
                  const actionMap: Record<string, string> = {
                    note: 'ADD_NOTE',
                    completion: 'REQUEST_COMPLETION',
                    reopen: 'REOPEN_STEP',
                    return: 'RETURN_REPORT',
                    approve: 'APPROVE_REPORT',
                    close: 'CLOSE_CASE'
                  };
                  handlePerformAdminAction(actionMap[showAdminActionModal]);
                }}
                className="flex-1 py-3 bg-[#315EF5] hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmittingAction ? 'جاري التنفيذ...' : 'تأكيد وحفظ الإجراء'}
              </button>
              <button
                type="button"
                onClick={() => setShowAdminActionModal(null)}
                className="py-3 px-4 bg-[#1C2229] text-slate-300 hover:text-white rounded-xl text-xs font-bold"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
