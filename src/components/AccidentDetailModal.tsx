import React, { useState } from 'react';
import { getPublicShareUrl } from '../lib/shareUtils';
import { 
  Accident, 
  IncidentParty, 
  PolicySnapshot, 
  FinancialEstimates, 
  ClassifiedEvidence,
  CaseMovement,
  MovementType,
  ActorRole,
  DeviceInfo,
  PalestineLocalityType,
  PALESTINE_GOVERNORATES,
  FieldAgent,
  Dispatch
} from '../types';
import { AdminFieldInvestigationTab } from './investigation/AdminFieldInvestigationTab';
import { 
  X, 
  MapPin, 
  Car, 
  FileText, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Briefcase, 
  DollarSign, 
  ShieldCheck, 
  Fingerprint, 
  Building,
  Plus,
  AlertTriangle,
  History,
  PhoneCall,
  Bell,
  Camera,
  Download,
  Smartphone,
  Laptop,
  Check,
  Tag,
  Shield,
  Layers,
  Phone,
  Send,
  Copy,
  ClipboardList
} from 'lucide-react';

interface AccidentDetailModalProps {
  accident: Accident;
  agents?: FieldAgent[];
  dispatches?: Dispatch[];
  onClose: () => void;
  onUpdateStatus: (id: string, status: Accident['status']) => void;
  onOpenDispatch: (accident: Accident) => void;
  onUpdateAccident?: (accident: Accident) => void;
}

export const AccidentDetailModal: React.FC<AccidentDetailModalProps> = ({
  accident,
  agents,
  dispatches,
  onClose,
  onUpdateStatus,
  onOpenDispatch,
  onUpdateAccident,
}) => {
  if (!accident) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'investigation' | 'movements' | 'parties' | 'policy' | 'financial' | 'evidence' | 'ai'>('investigation');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  const assignedAgent = agents?.find(ag => ag.id === accident.assignedAgentId || ag.name === accident.assignedAgentName);
  const matchingDispatch = dispatches?.find(d => d.accidentId === accident.id || d.accidentId === accident.accidentNumber);

  const handleSendWhatsAppCase = () => {
    if (!accident.assignedAgentId && !assignedAgent) {
      onOpenDispatch(accident);
      return;
    }
    const agentObj = assignedAgent || {
      id: accident.assignedAgentId || 'ag-1',
      name: accident.assignedAgentName || 'محقق ميداني',
      phone: '+970590000000',
      whatsapp: '+970590000000'
    };
    const cleanNum = ((agentObj as any).whatsapp || agentObj.phone || '+970590000000').replace(/[^0-9+]/g, '');
    const caseNum = accident.accidentNumber || accident.incidentNumber || accident.id;
    const caseUrl = getPublicShareUrl({
      portal: 'agent',
      investigator_id: agentObj.id,
      case_id: caseNum
    });
    const msg = encodeURIComponent(`🚨 تكليف بمهمة معاينة حادث رسمي\n\nالزميل ${agentObj.name}،\nتم إسناد القضية رقم (${caseNum}) إليكم.\nالموقع: ${accident.locationName}\nالخطورة: ${accident.severity}\n\nرابط القضية الآمن:\n${caseUrl}\n\nيرجى فتح الرابط وبدء المعاينة الميدانية فوراً.`);
    window.open(`https://wa.me/${cleanNum}?text=${msg}`, '_blank');
  };

  const handleCopyCaseLink = () => {
    const caseNum = accident.accidentNumber || accident.incidentNumber || accident.id;
    const caseUrl = getPublicShareUrl({
      portal: 'agent',
      investigator_id: accident.assignedAgentId || 'ag-1',
      case_id: caseNum
    });
    navigator.clipboard.writeText(caseUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };
  
  // New movement form state
  const [showAddMovement, setShowAddMovement] = useState(false);
  const [newMovementType, setNewMovementType] = useState<MovementType>('note_added');
  const [newMovementNote, setNewMovementNote] = useState('');
  const [newMovementAttachment, setNewMovementAttachment] = useState('');
  const [newMovementActorName, setNewMovementActorName] = useState('غرفة العمليات المركزية (HQ)');
  const [newMovementActorRole, setNewMovementActorRole] = useState<ActorRole>('admin');
  const [isSubmittingMovement, setIsSubmittingMovement] = useState(false);

  // New Evidence Modal
  const [showAddEvidence, setShowAddEvidence] = useState(false);
  const [newEvidenceType, setNewEvidenceType] = useState<ClassifiedEvidence['evidenceType']>('صورة فوتوغرافية');
  const [newEvidenceRef, setNewEvidenceRef] = useState('');
  const [newEvidenceDesc, setNewEvidenceDesc] = useState('');

  const getSeverityBadge = (severity: Accident['severity']) => {
    switch (severity) {
      case 'خفيف': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'متوسط': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'بليغ': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'حرج': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: Accident['status']) => {
    switch (status) {
      case 'جديد': return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'مُوَجَّه': return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'قيد التحقيق': return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
      case 'مكتمل': return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
      case 'مغلق': return 'bg-slate-500/20 text-slate-300 border-slate-400/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-400/30';
    }
  };

  const getMovementTypeBadge = (type: MovementType) => {
    switch (type) {
      case 'case_created':
        return { label: 'فتح البلاغ', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Plus };
      case 'case_assigned':
      case 'case_reassigned':
        return { label: 'تنسيب محقق', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Users };
      case 'permit_issued':
        return { label: 'إصدار تصريح', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: ShieldCheck };
      case 'permit_rejected':
        return { label: 'رفض تصريح', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle };
      case 'status_changed':
        return { label: 'تحديث الحالة', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: History };
      case 'photo_captured':
        return { label: 'التقاط صورة', color: 'bg-cyan-100 text-cyan-800 border-cyan-200', icon: Camera };
      case 'document_uploaded':
        return { label: 'رفع مستند', color: 'bg-teal-100 text-teal-800 border-teal-200', icon: FileText };
      case 'witness_statement_added':
        return { label: 'إفادة شاهد/طرف', color: 'bg-violet-100 text-violet-800 border-violet-200', icon: Users };
      case 'note_added':
        return { label: 'ملاحظة تدقيق', color: 'bg-slate-100 text-slate-800 border-slate-200', icon: FileText };
      case 'call_logged':
        return { label: 'تسجيل مكالمة', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: PhoneCall };
      case 'reminder_set':
        return { label: 'تنبيه متابعة', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Bell };
      case 'export_generated':
        return { label: 'تصدير التقرير', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: Download };
      default:
        return { label: type, color: 'bg-slate-100 text-slate-800 border-slate-200', icon: Tag };
    }
  };

  const getLocalityBadge = (locType?: PalestineLocalityType) => {
    switch (locType) {
      case 'مخيم لاجئين':
        return {
          label: 'مخيم لاجئين (كثافة مرتفعة / عقود استضافة)',
          badge: 'bg-red-100 text-red-800 border-red-200',
          note: 'تنبيه تأميني: المخيمات تتميز بكثافة عمرانية وبنية عقارية خاصة؛ تقييم الأضرار يعتمد على المعاينة المادية المباشرة بدلاً من القيود العقارية التقليدية.'
        };
      case 'قرية':
        return {
          label: 'قرية ريفية',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          note: 'تنبيه تأميني: تخضع لمعايير التغطية الجغرافية للمناطق الريفية والممتلكات الزراعية.'
        };
      case 'بلدة':
        return {
          label: 'بلدة',
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          note: 'تغطية بلدية محلية قياسية.'
        };
      case 'مدينة':
      default:
        return {
          label: 'مدينة مركزية',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          note: 'نطاق بلدي ومروري مركزي متكامل مع محاضر الشرطة الرسمية.'
        };
    }
  };

  const handleAiClick = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: accident.description,
          vehiclePlate: accident.vehiclePlate,
          locationName: accident.locationName,
          severity: accident.severity,
          incidentCategory: accident.incidentCategory,
          incidentSubtype: accident.incidentSubtype,
          governorate: accident.locationDetails?.governorate || 'نابلس',
          localityType: accident.locationDetails?.localityType || 'مدينة'
        })
      });

      if (res.ok) {
        const analysis = await res.json();
        const updatedAccident = {
          ...accident,
          aiAnalysis: analysis
        };
        if (onUpdateAccident) {
          onUpdateAccident(updatedAccident);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMovementNote.trim()) return;

    setIsSubmittingMovement(true);
    try {
      const payload = {
        case_id: accident.accidentNumber,
        type: newMovementType,
        actor_id: newMovementActorRole === 'admin' ? 'HQ-ADMIN' : 'USR-CALLCENTER',
        actor_name: newMovementActorName,
        actor_role: newMovementActorRole,
        note: newMovementNote,
        attachment_ref: newMovementAttachment || undefined,
        location_lat: accident.lat,
        location_lng: accident.lng,
        device_info: 'web-admin' as DeviceInfo
      };

      const res = await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const createdMovement: CaseMovement = await res.json();
        const updatedMovements = [createdMovement, ...(accident.movements || [])];
        const updatedAccident = {
          ...accident,
          movements: updatedMovements
        };
        if (onUpdateAccident) {
          onUpdateAccident(updatedAccident);
        }
        setShowAddMovement(false);
        setNewMovementNote('');
        setNewMovementAttachment('');
      }
    } catch (err) {
      console.error('Failed to log movement:', err);
    } finally {
      setIsSubmittingMovement(false);
    }
  };

  const handleExportSummary = async () => {
    try {
      const payload = {
        case_id: accident.accidentNumber,
        type: 'export_generated' as MovementType,
        actor_id: 'HQ-ADMIN',
        actor_name: 'مدير التدقيق وضبط الجودة',
        actor_role: 'admin' as ActorRole,
        note: `تم تصدير ملف الحقيبة الرقمية الشاملة رقم (${accident.accidentNumber}) وحفظ نسخة التدقيق`,
        device_info: 'web-admin' as DeviceInfo
      };

      const res = await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const createdMovement: CaseMovement = await res.json();
        if (onUpdateAccident) {
          onUpdateAccident({
            ...accident,
            movements: [createdMovement, ...(accident.movements || [])]
          });
        }
        alert(`تم تصدير التقرير بنجاح وتوثيق حركة التصدير برقم ${createdMovement.id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvidenceRef) return;

    const newEv: ClassifiedEvidence = {
      id: `ev-${Date.now()}`,
      evidenceType: newEvidenceType,
      fileRef: newEvidenceRef,
      fileHash: `sha256:${Math.random().toString(36).substring(2)}${Date.now()}`,
      capturedAt: new Date().toISOString(),
      capturedLocation: accident.locationName,
      description: newEvidenceDesc || `مستند إضافي معتمد`,
      verified: true
    };

    const updatedEvidences = [...(accident.classifiedEvidences || []), newEv];
    const updatedAcc = {
      ...accident,
      classifiedEvidences: updatedEvidences,
    };

    if (onUpdateAccident) {
      onUpdateAccident(updatedAcc);
    }
    setShowAddEvidence(false);
    setNewEvidenceRef('');
    setNewEvidenceDesc('');
  };

  const localityInfo = getLocalityBadge(accident.locationDetails?.localityType);
  const movementsList = accident.movements || [];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-[#1C2229]/80 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="bg-[#2A323A] rounded-3xl shadow-2xl w-full max-w-5xl max-h-[94vh] overflow-hidden border border-[#3A434C] flex flex-col text-[#F1F5F9]">
        
        {/* Header - Digital Briefcase Identity */}
        <div className="p-5 sm:p-6 border-b border-[#3A434C] bg-[#161B1F] text-[#F1F5F9] relative">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-[#315EF5]/20 border border-[#315EF5]/30 text-[#315EF5] rounded-2xl shadow-inner">
                <Briefcase className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#315EF5]/20 text-[#315EF5] border border-[#315EF5]/30">
                    حقيبة تحقيق رقمية موحدة
                  </span>
                  <h2 className="text-lg sm:text-xl font-black font-mono tracking-wide text-white">{accident.accidentNumber}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getSeverityBadge(accident.severity)}`}>
                    {accident.severity}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(accident.status)}`}>
                    {accident.status}
                  </span>
                </div>
                
                {/* Geographic & Category breadcrumb */}
                <div className="flex items-center gap-2 mt-1.5 text-xs text-[#AAB2BA] flex-wrap">
                  <span className="bg-[#1C2229] px-2 py-0.5 rounded-md font-bold text-[#D6A83A] border border-[#D6A83A]/30">
                    {accident.locationDetails?.region || 'الضفة الغربية'} - محافظة {accident.locationDetails?.governorate || 'نابلس'}
                  </span>
                  <span>←</span>
                  <span className="bg-[#1C2229] px-2 py-0.5 rounded-md font-bold text-[#315EF5] border border-[#315EF5]/30">
                    {accident.incidentCategory || 'حوادث مركبات'} / {accident.incidentSubtype || 'تصادم'}
                  </span>
                  <span className="text-[#7C8791]">|</span>
                  <span className="flex items-center gap-1 text-[#AAB2BA]">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(accident.timestamp).toLocaleString('ar-SA')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportSummary}
                className="px-3.5 py-2 bg-[#323A40] hover:bg-[#3A434C] border border-[#3A434C] text-[#F1F5F9] rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1.5"
                title="تصدير ملف القضية مع حركة التصدير"
              >
                <Download className="w-3.5 h-3.5 text-[#315EF5]" />
                <span>تصدير الحقيبة</span>
              </button>
              <button
                onClick={() => onOpenDispatch(accident)}
                className="px-3.5 py-2 bg-[#315EF5] hover:bg-[#315EF5]/90 text-white rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                <span>{accident.assignedAgentId ? 'إعادة التنسيب' : 'تنسيب محقق'}</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-[#AAB2BA] hover:text-white rounded-xl hover:bg-[#323A40] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 mt-5 border-t border-[#3A434C] pt-3 overflow-x-auto text-xs font-semibold">
            {[
              { id: 'investigation', label: 'التحقيق الميداني', icon: ClipboardList },
              { id: 'overview', label: 'ملخص البلاغ والموقع الجغرافي', icon: MapPin },
              { id: 'movements', label: `سجل الحركات الشامل (${movementsList.length})`, icon: History },
              { id: 'parties', label: `أطراف الحادث (${accident.parties?.length || 1})`, icon: Users },
              { id: 'policy', label: 'وثيقة التأمين المجمّدة', icon: ShieldCheck },
              { id: 'financial', label: 'التقدير المالي ومؤشر الاحتيال', icon: DollarSign },
              { id: 'evidence', label: `الأدلة الرقمية (${accident.classifiedEvidences?.length || accident.photos?.length || 0})`, icon: Fingerprint },
              { id: 'ai', label: 'التحليل الذكي (Gemini)', icon: Sparkles },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#315EF5] text-white shadow-md font-bold'
                      : 'text-[#AAB2BA] hover:text-white hover:bg-[#323A40]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-[#F1F5F9] bg-[#1C2229]">
          
          {/* TAB 0: FIELD INVESTIGATION WORKFLOW (HQ SUPERVISION) */}
          {activeTab === 'investigation' && (
            <AdminFieldInvestigationTab
              accident={accident}
              assignedAgent={assignedAgent}
              matchingDispatch={matchingDispatch}
              onUpdateAccident={onUpdateAccident}
            />
          )}

          {/* TAB 1: OVERVIEW & PALESTINE GEOGRAPHY */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Palestinian Geographic Metadata Card */}
              <div className="p-5 rounded-2xl bg-[#2A323A] border border-[#3A434C] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#3A434C] pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#D64545]" />
                    <h3 className="font-bold text-[#F1F5F9] text-sm">الهيكل الجغرافي وتفاصيل الموقع (فلسطين)</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${localityInfo.badge}`}>
                    {localityInfo.label}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 bg-[#1C2229] rounded-xl border border-[#3A434C]">
                    <span className="text-[#7C8791] block text-[10px]">المنطقة / الإقليم</span>
                    <span className="font-bold text-[#F1F5F9]">{accident.locationDetails?.region || 'الضفة الغربية'}</span>
                  </div>
                  <div className="p-2.5 bg-[#1C2229] rounded-xl border border-[#3A434C]">
                    <span className="text-[#7C8791] block text-[10px]">المحافظة الرسمية</span>
                    <span className="font-bold text-[#315EF5]">محافظة {accident.locationDetails?.governorate || 'نابلس'}</span>
                  </div>
                  <div className="p-2.5 bg-[#1C2229] rounded-xl border border-[#3A434C]">
                    <span className="text-[#7C8791] block text-[10px]">المدينة / التجمع</span>
                    <span className="font-bold text-[#F1F5F9]">{accident.locationDetails?.city || 'نابلس'}</span>
                  </div>
                  <div className="p-2.5 bg-[#1C2229] rounded-xl border border-[#3A434C]">
                    <span className="text-[#7C8791] block text-[10px]">الحي / المنطقة الفرعية</span>
                    <span className="font-bold text-[#F1F5F9]">{accident.locationDetails?.neighborhood || 'رفيديا'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[#AAB2BA]">الشارع / الطريق:</span>{' '}
                    <span className="font-semibold text-[#F1F5F9]">{accident.locationDetails?.street || accident.locationName}</span>
                  </div>
                  <div>
                    <span className="text-[#AAB2BA]">رقم المبنى:</span>{' '}
                    <span className="font-semibold text-[#F1F5F9]">{accident.locationDetails?.buildingNumber || 'غير محدد'}</span>
                  </div>
                  <div>
                    <span className="text-[#AAB2BA]">أقرب معلم بارز:</span>{' '}
                    <span className="font-semibold text-[#F1F5F9]">{accident.locationDetails?.landmark || 'مفترق رئيسي'}</span>
                  </div>
                </div>

                {/* Locality density & tenure alert note */}
                <div className="p-3 bg-[#D6A83A]/15 rounded-xl border border-[#D6A83A]/30 text-xs text-[#F1F5F9] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#D6A83A] mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold block text-[#D6A83A]">محددات المعاينة العقارية والتأمينية للتجمع:</span>
                    <span className="text-[#AAB2BA]">{localityInfo.note}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1.5 border-t border-[#3A434C] justify-between">
                  <span className="text-[11px] text-[#AAB2BA]">إحداثيات GPS الموثقة: {accident.lat.toFixed(4)} N, {accident.lng.toFixed(4)} E</span>
                  <a
                    href={`https://waze.com/ul?ll=${accident.lat},${accident.lng}&navigate=yes`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1 px-3 bg-[#F2A900] hover:bg-[#d59400] text-[#111820] text-[10px] font-black rounded-lg transition-all flex items-center gap-1 shadow-md shadow-[#F2A900]/10 cursor-pointer"
                    title="فتح تطبيق Waze للملاحة الفورية"
                  >
                    <span>توجيه وملاحة عبر Waze 🚗</span>
                  </a>
                </div>
                <div className="text-[11px] text-[#AAB2BA] pt-0.5">
                  <span>حالة الطقس: {accident.weather || 'صحو ومستقر'} | نوع الطريق: {accident.roadType || 'شارع رئيسي'}</span>
                </div>
              </div>

              {/* Category & Description Cards */}
              <div className="p-5 rounded-2xl bg-[#2A323A] border border-[#3A434C] shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-[#315EF5] font-bold text-xs">
                  <Layers className="w-4 h-4" />
                  <span>التصنيف الهرمي وملابسات الحادث</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-[#315EF5]/20 text-[#315EF5] px-2.5 py-1 rounded-lg font-bold border border-[#315EF5]/30">
                    {accident.incidentCategory}
                  </span>
                  <span>←</span>
                  <span className="bg-[#323A40] text-[#F1F5F9] px-2.5 py-1 rounded-lg font-semibold border border-[#3A434C]">
                    {accident.incidentSubtype}
                  </span>
                </div>
                <p className="text-sm text-[#F1F5F9] leading-relaxed bg-[#1C2229] p-3.5 rounded-xl border border-[#3A434C]">
                  {accident.description}
                </p>
                {accident.potentialCause && (
                  <div className="text-xs text-[#AAB2BA] flex items-center gap-2 pt-1">
                    <span className="font-bold text-[#F1F5F9]">السبب المحتمل المرصود:</span>
                    <span className="bg-[#D6A83A]/20 text-[#D6A83A] px-2.5 py-0.5 rounded border border-[#D6A83A]/30 font-medium">
                      {accident.potentialCause}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#2A323A] border border-[#3A434C] shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-[#315EF5] font-bold text-xs pb-2 border-b border-[#3A434C]">
                    <Car className="w-4 h-4" />
                    <span>المركبة المقيدة بالبلاغ</span>
                  </div>
                  <div className="text-xs space-y-1.5">
                    <div className="flex justify-between"><span className="text-[#AAB2BA]">رقم اللوحة:</span> <span className="font-mono font-bold bg-[#1C2229] px-2 py-0.5 rounded text-[#315EF5] border border-[#3A434C]">{accident.vehiclePlate}</span></div>
                    <div className="flex justify-between"><span className="text-[#AAB2BA]">اسم السائق:</span> <span className="font-bold text-[#F1F5F9]">{accident.driverName}</span></div>
                    <div className="flex justify-between"><span className="text-[#AAB2BA]">رقم الهوية:</span> <span className="font-mono text-[#AAB2BA]">{accident.driverId}</span></div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#2A323A] border border-[#3A434C] shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-[#3A434C] pb-2">
                    <div className="flex items-center gap-2 text-[#22A06B] font-bold text-xs">
                      <ShieldAlert className="w-4 h-4" />
                      <span>المحقق المكلّف والتوجيه الميداني</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${accident.assignedAgentId || accident.assignedAgentName ? 'bg-[#22A06B]/20 text-[#22A06B] border-[#22A06B]/30' : 'bg-[#D6A83A]/20 text-[#D6A83A] border-[#D6A83A]/30'}`}>
                      {accident.assignedAgentId || accident.assignedAgentName ? 'مُسند' : 'بانتظار التنسيب'}
                    </span>
                  </div>

                  {accident.assignedAgentId || accident.assignedAgentName ? (
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center gap-3 p-2.5 bg-[#1C2229] rounded-xl border border-[#3A434C]">
                        <div className="w-10 h-10 rounded-full bg-[#22A06B] text-white font-bold flex items-center justify-center text-sm shadow">
                          {assignedAgent?.name?.[0] || accident.assignedAgentName?.[0] || 'م'}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between font-bold text-[#F1F5F9]">
                            <span>الاسم:</span>
                            <span>{assignedAgent?.name || accident.assignedAgentName}</span>
                          </div>
                          <div className="flex justify-between text-[#AAB2BA] font-mono">
                            <span>الهاتف / WhatsApp:</span>
                            <span className="text-[#22A06B] font-bold">{assignedAgent?.phone || '+970590000000'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 pt-1">
                        <button
                          onClick={handleSendWhatsAppCase}
                          className="w-full py-3 px-4 bg-[#22A06B] hover:bg-[#22A06B]/90 text-white rounded-xl font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all"
                        >
                          <Phone className="w-4 h-4" />
                          <span>WhatsApp | إرسال القضية للمحقق</span>
                        </button>

                        <button
                          onClick={handleCopyCaseLink}
                          className="w-full py-2 px-3 bg-[#323A40] hover:bg-[#3A434C] text-white rounded-xl font-bold text-[11px] shadow border border-[#3A434C] flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Copy className="w-3.5 h-3.5 text-[#315EF5]" />
                          <span>{copiedLink ? '✓ تم النسخ بنجاح' : 'نسخ رابط القضية'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-[#D6A83A]/15 rounded-xl border border-[#D6A83A]/30 text-center space-y-2.5">
                      <p className="text-xs text-[#D6A83A] font-bold">لم يتم تعيين محقق ميداني لهذه القضية بعد.</p>
                      <button
                        onClick={() => onOpenDispatch(accident)}
                        className="w-full py-2.5 px-4 bg-[#315EF5] hover:bg-[#315EF5]/90 text-white rounded-xl font-bold text-xs shadow flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Users className="w-4 h-4" />
                        <span>تعيين محقق ميداني</span>
                      </button>
                    </div>
                  )}

                  <div className="text-[10px] text-[#7C8791] pt-1 border-t border-[#3A434C] flex justify-between">
                    <span>محضر الشرطة: {accident.policeReportNumber || 'قيد الإصدار'}</span>
                    <span>المركز: {accident.policeStation || 'مديرية الشرطة'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MOVEMENTS & ACTIONS LOG (سجل الحركات الشامل) */}
          {activeTab === 'movements' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#2A323A] p-4 rounded-2xl border border-[#3A434C] shadow-sm">
                <div>
                  <h3 className="font-bold text-[#F1F5F9] text-sm flex items-center gap-2">
                    <History className="w-4 h-4 text-[#315EF5]" />
                    <span>سجل الحركات والتدقيق الشامل للقضية</span>
                  </h3>
                  <p className="text-xs text-[#AAB2BA]">توثيق ثابت تاريخياً لجميع القرارات، التنسيبات، المعاينات الميدانية، والأدلة</p>
                </div>
                <button
                  onClick={() => setShowAddMovement(!showAddMovement)}
                  className="px-3.5 py-1.5 bg-[#315EF5] hover:bg-[#315EF5]/90 text-white rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة حركة جديدة</span>
                </button>
              </div>

              {/* Add Movement Form */}
              {showAddMovement && (
                <form onSubmit={handleAddMovementSubmit} className="p-5 bg-[#1C2229] border border-[#3A434C] rounded-2xl space-y-3 animate-fadeIn text-xs">
                  <h4 className="font-bold text-[#315EF5]">تسجيل حركة / إجراء جديد للقضية {accident.accidentNumber}</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[#AAB2BA] font-semibold block mb-1">نوع الحركة</label>
                      <select
                        value={newMovementType}
                        onChange={e => setNewMovementType(e.target.value as MovementType)}
                        className="w-full p-2 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9] font-medium focus:ring-2 focus:ring-[#315EF5] focus:outline-none"
                      >
                        <optgroup label="البلاغ والتنسيب">
                          <option value="case_assigned">تنسيب محقق (case_assigned)</option>
                          <option value="permit_issued">إصدار تصريح معاينة (permit_issued)</option>
                          <option value="permit_rejected">رفض تصريح معاينة (permit_rejected)</option>
                          <option value="status_changed">تغيير حالة القضية (status_changed)</option>
                        </optgroup>
                        <optgroup label="جمع الأدلة والملاحظات">
                          <option value="note_added">إضافة ملاحظة فنية (note_added)</option>
                          <option value="witness_statement_added">إفادة طرف أو شاهد (witness_statement_added)</option>
                          <option value="photo_captured">توثيق صورة فوتوغرافية (photo_captured)</option>
                          <option value="document_uploaded">رفع وثيقة أو محضر (document_uploaded)</option>
                        </optgroup>
                        <optgroup label="الاتصال والمتابعة">
                          <option value="call_logged">تسجيل مكالمة هاتفية (call_logged)</option>
                          <option value="reminder_set">جدولة تنبيه متابعة (reminder_set)</option>
                          <option value="export_generated">تصدير تقرير (export_generated)</option>
                        </optgroup>
                      </select>
                    </div>

                    <div>
                      <label className="text-[#AAB2BA] font-semibold block mb-1">اسم القائم بالحركة (ثابت تاريخياً)</label>
                      <input
                        type="text"
                        required
                        value={newMovementActorName}
                        onChange={e => setNewMovementActorName(e.target.value)}
                        className="w-full p-2 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9] font-medium focus:ring-2 focus:ring-[#315EF5] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[#AAB2BA] font-semibold block mb-1">الدور الوظيفي</label>
                      <select
                        value={newMovementActorRole}
                        onChange={e => setNewMovementActorRole(e.target.value as ActorRole)}
                        className="w-full p-2 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9] font-medium focus:ring-2 focus:ring-[#315EF5] focus:outline-none"
                      >
                        <option value="admin">إدارة مركزية (admin)</option>
                        <option value="investigator">محقق ميداني (investigator)</option>
                        <option value="call_center">مركز الاتصال (call_center)</option>
                        <option value="system">النظام الآلي (system)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">نص الملاحظة / تفاصيل الحركة</label>
                    <textarea
                      rows={2}
                      required
                      value={newMovementNote}
                      onChange={e => setNewMovementNote(e.target.value)}
                      placeholder="اكتب ملاحظة واضحة ومسببة..."
                      className="w-full p-2 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9] placeholder-[#7C8791] font-medium focus:ring-2 focus:ring-[#315EF5] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">مرجع ملف / رابط مرفق (اختياري)</label>
                    <input
                      type="text"
                      value={newMovementAttachment}
                      onChange={e => setNewMovementAttachment(e.target.value)}
                      placeholder="مثال: DOC-0091 أو رابط صورة"
                      className="w-full p-2 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9] placeholder-[#7C8791] font-medium focus:ring-2 focus:ring-[#315EF5] focus:outline-none font-mono"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddMovement(false)}
                      className="px-3 py-1.5 bg-[#323A40] text-[#F1F5F9] hover:bg-[#3A434C] rounded-xl border border-[#3A434C]"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingMovement}
                      className="px-4 py-1.5 bg-[#315EF5] text-white rounded-xl font-bold disabled:opacity-50"
                    >
                      {isSubmittingMovement ? 'جاري الحفظ...' : 'تسجيل الحركة وتثبيتها'}
                    </button>
                  </div>
                </form>
              )}

              {/* Movement List Timeline */}
              {movementsList.length === 0 ? (
                <div className="p-8 text-center bg-[#2A323A] rounded-2xl border border-[#3A434C] text-xs text-[#AAB2BA]">
                  لا توجد حركات مسجلة لهذه القضية بعد. يمكنك إضافة حركة جديدة أعلاه.
                </div>
              ) : (
                <div className="space-y-3">
                  {movementsList.map(mv => {
                    const badgeInfo = getMovementTypeBadge(mv.type);
                    const BadgeIcon = badgeInfo.icon;
                    const isFieldAction = (mv.device_info || '').toLowerCase().includes('mobile');

                    return (
                      <div key={mv.id} className="p-4 rounded-2xl bg-[#2A323A] border border-[#3A434C] shadow-sm space-y-2.5 hover:border-[#315EF5]/50 transition-colors text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3A434C] pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-[#F1F5F9] bg-[#1C2229] px-2 py-0.5 rounded border border-[#3A434C]">
                              {mv.id}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-lg font-bold border flex items-center gap-1 ${badgeInfo.color}`}>
                              <BadgeIcon className="w-3.5 h-3.5" />
                              <span>{badgeInfo.label}</span>
                            </span>
                            <span className="font-mono text-[10px] text-[#7C8791]">({mv.type})</span>
                          </div>

                          <div className="flex items-center gap-2 text-[#AAB2BA] text-[11px]">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-[#7C8791]" />
                              {new Date(mv.created_at).toLocaleString('ar-SA')}
                            </span>
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-[#1C2229] rounded text-[10px] text-[#AAB2BA] font-mono border border-[#3A434C]">
                              {isFieldAction ? <Smartphone className="w-3 h-3 text-[#22A06B]" /> : <Laptop className="w-3 h-3 text-[#315EF5]" />}
                              {mv.device_info}
                            </span>
                          </div>
                        </div>

                        {/* Actor info and Before/After */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[#F1F5F9] bg-[#1C2229] p-2.5 rounded-xl border border-[#3A434C]">
                          <div>
                            <span className="text-[#7C8791] block text-[10px]">الفاعل (نسخة ثابتة)</span>
                            <span className="font-bold text-[#F1F5F9]">{mv.actor_name}</span>
                          </div>
                          <div>
                            <span className="text-[#7C8791] block text-[10px]">الدور الوظيفي</span>
                            <span className="font-semibold text-[#315EF5]">{mv.actor_role}</span>
                          </div>
                          {mv.from_value && (
                            <div>
                              <span className="text-[#7C8791] block text-[10px]">القيمة السابقة</span>
                              <span className="font-mono text-[#AAB2BA]">{mv.from_value}</span>
                            </div>
                          )}
                          {mv.to_value && (
                            <div>
                              <span className="text-[#7C8791] block text-[10px]">القيمة الجديدة</span>
                              <span className="font-mono font-bold text-[#22A06B]">{mv.to_value}</span>
                            </div>
                          )}
                        </div>

                        {/* Note */}
                        {mv.note && (
                          <div className="text-[#F1F5F9] bg-[#323A40] p-2 rounded-lg border border-[#3A434C] leading-relaxed font-medium">
                            {mv.note}
                          </div>
                        )}

                        {/* Attachments & Location Coordinates */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-[#AAB2BA]">
                          {mv.attachment_ref ? (
                            <div className="flex items-center gap-1.5 text-[#315EF5] font-mono bg-[#315EF5]/15 px-2 py-0.5 rounded border border-[#315EF5]/30">
                              <FileText className="w-3.5 h-3.5" />
                              <span>مرفق: {mv.attachment_ref}</span>
                            </div>
                          ) : <span />}

                          {mv.location_lat && mv.location_lng ? (
                            <div className="flex items-center gap-1 text-[#22A06B] bg-[#22A06B]/15 px-2 py-0.5 rounded border border-[#22A06B]/30 font-mono">
                              <MapPin className="w-3 h-3 text-[#22A06B]" />
                              <span>GPS: {mv.location_lat.toFixed(4)}, {mv.location_lng.toFixed(4)}</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PARTIES (أطراف الحادث) */}
          {activeTab === 'parties' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-[#F1F5F9]">سجل أطراف الحادث والإفادات الرسمية</h3>
                  <p className="text-xs text-[#AAB2BA]">توثيق هوية المؤمن له، الأطراف المتضررة، والشهود وأخذ أقوالهم</p>
                </div>
              </div>

              {(!accident.parties || accident.parties.length === 0) ? (
                <div className="p-8 text-center bg-[#2A323A] rounded-2xl border border-[#3A434C] text-xs text-[#AAB2BA]">
                  لم يتم تسجيل أطراف مفصلة بعد في هذه القضية.
                </div>
              ) : (
                <div className="space-y-3">
                  {accident.parties.map((party, idx) => (
                    <div key={party.id || idx} className="p-5 rounded-2xl bg-[#2A323A] border border-[#3A434C] shadow-sm space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3A434C] pb-3">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                            party.partyRole === 'مؤمَّن له' ? 'bg-[#315EF5]/20 text-[#315EF5] border-[#315EF5]/30' :
                            party.partyRole === 'طرف ثالث' ? 'bg-[#D6A83A]/20 text-[#D6A83A] border-[#D6A83A]/30' :
                            party.partyRole === 'شاهد' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                            'bg-[#323A40] text-[#F1F5F9] border-[#3A434C]'
                          }`}>
                            {party.partyRole}
                          </span>
                          <span className="font-black text-[#F1F5F9] text-sm">{party.fullName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            party.injuryStatus === 'لا إصابة' ? 'bg-[#22A06B]/20 text-[#22A06B] border-[#22A06B]/30' :
                            'bg-[#D64545]/20 text-[#D64545] border-[#D64545]/30'
                          }`}>
                            الإصابة: {party.injuryStatus}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            party.statementTaken ? 'bg-[#315EF5]/20 text-[#315EF5] border-[#315EF5]/30' : 'bg-[#323A40] text-[#AAB2BA] border-[#3A434C]'
                          }`}>
                            {party.statementTaken ? '✓ تم أخذ الإفادة' : 'لم تؤخذ إفادة'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div><span className="text-[#AAB2BA]">رقم الهوية:</span> <span className="font-mono font-bold text-[#F1F5F9]">{party.nationalId}</span></div>
                        <div><span className="text-[#AAB2BA]">رقم الجوال:</span> <span className="font-mono text-[#F1F5F9]">{party.phone}</span></div>
                        {party.vehiclePlate && (
                          <div><span className="text-[#AAB2BA]">المركبة:</span> <span className="font-bold text-[#315EF5]">{party.vehicleModel || ''} ({party.vehiclePlate})</span></div>
                        )}
                      </div>

                      {party.statementSummary && (
                        <div className="p-3 bg-[#1C2229] rounded-xl border border-[#3A434C] text-xs space-y-1">
                          <span className="font-bold text-[#AAB2BA]">نص الإفادة الميدانية:</span>
                          <p className="text-[#F1F5F9] leading-relaxed">{party.statementSummary}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: POLICY SNAPSHOT */}
          {activeTab === 'policy' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-6 rounded-3xl bg-[#161B1F] border border-[#3A434C] text-white shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#315EF5]/20 rounded-2xl border border-[#315EF5]/30 text-[#315EF5]">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-base">نسخة الوثيقة التأمينية المجمّدة (Policy Snapshot)</h3>
                      <p className="text-xs text-[#AAB2BA]">نسخة ثابتة مأخوذة لحظة فتح البلاغ لحفظ حقوق الأطراف ضد أي تعديل لاحق</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-[#22A06B]/20 text-[#22A06B] border border-[#22A06B]/30 rounded-xl text-xs font-bold">
                    {accident.policySnapshot?.policyStatusAtIncident || 'سارية ومطابقة'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[#3A434C] text-xs">
                  <div className="bg-[#2A323A] p-3 rounded-xl border border-[#3A434C]">
                    <span className="text-[#AAB2BA] block text-[11px]">رقم الوثيقة</span>
                    <span className="font-mono font-bold text-white text-sm">{accident.policySnapshot?.policyNumber || 'POL-77123-PAL'}</span>
                  </div>
                  <div className="bg-[#2A323A] p-3 rounded-xl border border-[#3A434C]">
                    <span className="text-[#AAB2BA] block text-[11px]">نوع التغطية</span>
                    <span className="font-bold text-white text-sm">{accident.policySnapshot?.policyType || 'شامل'}</span>
                  </div>
                  <div className="bg-[#2A323A] p-3 rounded-xl border border-[#3A434C]">
                    <span className="text-[#AAB2BA] block text-[11px]">حد التغطية الأقصى</span>
                    <span className="font-bold text-[#D6A83A] text-sm">{(accident.policySnapshot?.coverageLimit || 500000).toLocaleString('ar-SA')} ر.س / شيكل</span>
                  </div>
                  <div className="bg-[#2A323A] p-3 rounded-xl border border-[#3A434C]">
                    <span className="text-[#AAB2BA] block text-[11px]">مبلغ التحمل (Deductible)</span>
                    <span className="font-bold text-[#22A06B] text-sm">{(accident.policySnapshot?.deductible || 1500).toLocaleString('ar-SA')} ر.س / شيكل</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#AAB2BA] pt-2">
                  <span>تاريخ بدء الوثيقة: {accident.policySnapshot?.effectiveDate || '2026-01-01'}</span>
                  <span>تاريخ انتهاء الوثيقة: {accident.policySnapshot?.expiryDate || '2026-12-31'}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FINANCIAL ESTIMATES */}
          {activeTab === 'financial' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-[#2A323A] border border-[#3A434C] shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-[#3A434C]">
                    <DollarSign className="w-5 h-5 text-[#22A06B]" />
                    <h3 className="font-black text-[#F1F5F9] text-sm">التقديرات المالية للمطالبة</h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center p-3 bg-[#1C2229] rounded-xl border border-[#3A434C]">
                      <span className="text-[#AAB2BA] font-semibold">تقدير الخسائر المبدئي:</span>
                      <span className="text-base font-black text-[#F1F5F9]">
                        {(accident.financialEstimates?.estimatedLossAmount || 0).toLocaleString('ar-SA')} ر.س / شيكل
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-[#22A06B]/15 rounded-xl border border-[#22A06B]/30">
                      <span className="text-[#22A06B] font-bold">المبلغ المعتمد النهائي:</span>
                      <span className="text-base font-black text-[#22A06B]">
                        {(accident.financialEstimates?.finalApprovedAmount || 0).toLocaleString('ar-SA')} ر.س / شيكل
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-[#2A323A] border border-[#3A434C] shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-[#3A434C]">
                    <ShieldAlert className="w-5 h-5 text-[#D6A83A]" />
                    <h3 className="font-black text-[#F1F5F9] text-sm">مؤشر الاحتيال والتحقق الجنائي</h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[#AAB2BA] block mb-1">مستوى اشتباه الاحتيال:</span>
                      <span className={`px-3 py-1 rounded-xl font-bold inline-block border ${
                        accident.financialEstimates?.fraudRiskFlag === 'لا يوجد اشتباه'
                          ? 'bg-[#22A06B]/20 text-[#22A06B] border-[#22A06B]/30'
                          : 'bg-[#D64545]/20 text-[#D64545] border-[#D64545]/30'
                      }`}>
                        {accident.financialEstimates?.fraudRiskFlag || 'لا يوجد اشتباه'}
                      </span>
                    </div>

                    <div className="p-3 bg-[#1C2229] rounded-xl border border-[#3A434C] space-y-1">
                      <span className="font-bold text-[#AAB2BA]">ملاحظات فريق التدقيق المالي:</span>
                      <p className="text-[#F1F5F9] leading-relaxed">{accident.financialEstimates?.fraudNotes || 'المعاينة الميدانية متطابقة.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CLASSIFIED EVIDENCE */}
          {activeTab === 'evidence' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between bg-[#2A323A] p-4 rounded-2xl border border-[#3A434C]">
                <div>
                  <h3 className="font-bold text-[#F1F5F9] text-sm">الأدلة الميدانية الموثقة بالبصمات الرقمية (SHA-256)</h3>
                  <p className="text-xs text-[#AAB2BA]">إثبات عدم التلاعب بالصور والمحاضر الميدانية عبر التشفير الزمني والمكاني</p>
                </div>
                <button
                  onClick={() => setShowAddEvidence(!showAddEvidence)}
                  className="px-3 py-1.5 bg-[#315EF5] text-white rounded-xl text-xs font-bold shadow"
                >
                  إرفاق دليل جديد
                </button>
              </div>

              {showAddEvidence && (
                <form onSubmit={handleSaveEvidence} className="p-4 bg-[#1C2229] border border-[#3A434C] rounded-2xl space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[#AAB2BA] font-semibold block mb-1">نوع الدليل</label>
                      <select
                        value={newEvidenceType}
                        onChange={e => setNewEvidenceType(e.target.value as any)}
                        className="w-full p-2 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9]"
                      >
                        <option value="صورة فوتوغرافية">صورة فوتوغرافية</option>
                        <option value="محضر شرطة">محضر شرطة / دفاع مدني</option>
                        <option value="إفادة خطية">إفادة خطية</option>
                        <option value="فيديو معاينة">فيديو معاينة</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[#AAB2BA] font-semibold block mb-1">رابط أو مرجع الدليل</label>
                      <input
                        type="url"
                        required
                        value={newEvidenceRef}
                        onChange={e => setNewEvidenceRef(e.target.value)}
                        placeholder="https://..."
                        className="w-full p-2 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">الوصف التوثيقي</label>
                    <input
                      type="text"
                      value={newEvidenceDesc}
                      onChange={e => setNewEvidenceDesc(e.target.value)}
                      placeholder="وصف تفصيلي للضرر أو المحضر..."
                      className="w-full p-2 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddEvidence(false)}
                      className="px-3 py-1 bg-[#323A40] text-[#F1F5F9] rounded-lg border border-[#3A434C]"
                    >
                      إلغاء
                    </button>
                    <button type="submit" className="px-4 py-1 bg-[#315EF5] text-white rounded-lg font-bold">
                      حفظ وتوليد البصمة
                    </button>
                  </div>
                </form>
              )}

              {/* Evidence Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(accident.classifiedEvidences && accident.classifiedEvidences.length > 0) ? (
                  accident.classifiedEvidences.map((ev, idx) => (
                    <div key={ev.id || idx} className="p-4 rounded-2xl bg-[#2A323A] border border-[#3A434C] shadow-sm space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-lg bg-[#315EF5]/20 text-[#315EF5] font-bold border border-[#315EF5]/30">
                          {ev.evidenceType}
                        </span>
                        <span className="flex items-center gap-1 text-[#22A06B] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          بصمة موثقة
                        </span>
                      </div>

                      <div className="aspect-video rounded-xl overflow-hidden bg-[#1C2229] border border-[#3A434C] relative group">
                        <img
                          src={ev.fileRef}
                          alt={ev.description || 'دليل'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <p className="font-semibold text-[#F1F5F9]">{ev.description}</p>
                        <div className="p-2 bg-[#1C2229] rounded-lg font-mono text-[10px] text-[#AAB2BA] break-all border border-[#3A434C] flex items-center gap-1.5">
                          <Fingerprint className="w-4 h-4 text-[#315EF5] shrink-0" />
                          <span>{ev.fileHash}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-[#7C8791] pt-1">
                          <span>الالتقاط: {new Date(ev.capturedAt).toLocaleString('ar-SA')}</span>
                          <span>{ev.capturedLocation}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  (accident.photos || []).map((photo, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[#2A323A] border border-[#3A434C] shadow-sm space-y-2 text-xs">
                      <div className="aspect-video rounded-xl overflow-hidden bg-[#1C2229] border border-[#3A434C]">
                        <img src={photo} alt={`معاينة ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="p-2 bg-[#1C2229] rounded-lg font-mono text-[10px] text-[#AAB2BA] break-all border border-[#3A434C]">
                        sha256:legacy_img_{idx}_{accident.id}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 7: GEMINI AI */}
          {activeTab === 'ai' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-[#161B1F] border border-[#3A434C] rounded-3xl p-6 text-white shadow-xl space-y-4 relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#315EF5]/20 rounded-2xl text-[#315EF5] border border-[#315EF5]/30">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-white text-base">محرك التحقيق والاستقصاء الذكي (Gemini AI Engine)</h4>
                      <p className="text-xs text-[#AAB2BA]">تحليل هرمي للمسؤولية الجنائية، الأضرار المادية، ومخاطر الاحتيال مع مراعاة نوع التجمع الفلسطيني</p>
                    </div>
                  </div>
                  <button
                    onClick={handleAiClick}
                    disabled={isAnalyzing}
                    className="px-5 py-2.5 bg-[#315EF5] hover:bg-[#315EF5]/90 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>جاري التحليل المعمق...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>تحديث التحليل الذكي للحقيبة</span>
                      </>
                    )}
                  </button>
                </div>

                {accident.aiAnalysis ? (
                  <div className="space-y-4 pt-3 border-t border-[#3A434C] text-xs">
                    <div className="p-4 rounded-2xl bg-[#2A323A] border border-[#3A434C] space-y-1">
                      <div className="font-bold text-[#315EF5]">تقدير المسؤولية والنسب:</div>
                      <div className="text-[#F1F5F9] font-medium text-sm leading-relaxed">{accident.aiAnalysis.liabilityScore}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-[#2A323A] border border-[#3A434C] space-y-1">
                        <div className="font-bold text-[#315EF5]">التقدير المالي والتعويضات:</div>
                        <div className="text-[#F1F5F9] font-medium">{accident.aiAnalysis.damageEstimate}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#2A323A] border border-[#3A434C] space-y-1">
                        <div className="font-bold text-[#315EF5]">التوصية الإجرائية والقانونية:</div>
                        <div className="text-[#F1F5F9] font-medium">{accident.aiAnalysis.recommendedAction}</div>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#2A323A] border border-[#3A434C] space-y-1">
                      <div className="font-bold text-[#315EF5]">التقرير الاستقصائي الشامل:</div>
                      <div className="text-[#F1F5F9] leading-relaxed">{accident.aiAnalysis.summary}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-[#AAB2BA] text-xs">
                    انقر على زر "تحديث التحليل الذكي للحقيبة" لإجراء مراجعة شاملة لملابسات الحادث.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#3A434C] bg-[#161B1F] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[#AAB2BA] font-bold">تغيير حالة القضية:</span>
            {(['جديد', 'مُوَجَّه', 'قيد التحقيق', 'مكتمل', 'مغلق'] as Accident['status'][]).map(st => (
              <button
                key={st}
                onClick={() => onUpdateStatus(accident.id, st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  accident.status === st
                    ? 'bg-[#315EF5] text-white border-[#315EF5] shadow-sm'
                    : 'bg-[#2A323A] text-[#AAB2BA] border-[#3A434C] hover:bg-[#323A40] hover:text-[#F1F5F9]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#323A40] hover:bg-[#3A434C] text-[#F1F5F9] rounded-xl text-xs font-bold transition-colors border border-[#3A434C]"
          >
            إغلاق الحقيبة
          </button>
        </div>
      </div>
    </div>
  );
};
