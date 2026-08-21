import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  CheckCircle2, 
  Cloud, 
  CloudOff, 
  RotateCw, 
  AlertCircle,
  FileCheck2,
  Lock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  InvestigationSession, 
  InvestigationStepNumber, 
  SyncStatusType,
  ArrivalData,
  IncidentBasicData,
  CaseParty,
  CaseMediaItem,
  DiagramData,
  CaseStatement,
  DamageAssessmentItem,
  FinalReportData
} from '../../types';

import { Step1Arrival } from './Step1Arrival';
import { Step2BasicInfo } from './Step2BasicInfo';
import { Step3PartiesVehicles } from './Step3PartiesVehicles';
import { Step4MediaChecklist, PHOTO_CHECKLIST_TEMPLATE } from './Step4MediaChecklist';
import { Step5AccidentDiagram } from './Step5AccidentDiagram';
import { Step6StatementsWitnesses } from './Step6StatementsWitnesses';
import { Step7DamageAssessment } from './Step7DamageAssessment';
import { Step8FinalReport } from './Step8FinalReport';

interface InvestigationWorkflowModalProps {
  caseId: string;
  assignmentId?: string;
  investigatorId?: string;
  investigatorName?: string;
  initialLocation?: string;
  initialLat?: number;
  initialLng?: number;
  onClose: () => void;
  onSubmitted?: (session: InvestigationSession) => void;
}

const STEP_TITLES: Record<InvestigationStepNumber, string> = {
  1: 'الوصول للموقع',
  2: 'بيانات الحادث الأساسية',
  3: 'الأطراف والمركبات',
  4: 'التوثيق المصور (قائمة الصور)',
  5: 'مخطط ورسم الحادث',
  6: 'إفادات الأطراف والشهود',
  7: 'تقدير ومعاينة الأضرار',
  8: 'التقرير النهائي والاعتماد'
};

export const InvestigationWorkflowModal: React.FC<InvestigationWorkflowModalProps> = ({
  caseId,
  assignmentId = 'ASSIGN-001',
  investigatorId = 'agent_01',
  investigatorName = 'المحقق الميداني',
  initialLocation = 'شارع فيصل، نابلس',
  initialLat = 32.2211,
  initialLng = 35.2544,
  onClose,
  onSubmitted
}) => {
  const storageKey = `investigation_session_${caseId}`;

  // Default clean state
  const getInitialSession = (): InvestigationSession => {
    const savedLocal = localStorage.getItem(storageKey);
    if (savedLocal) {
      try {
        const parsed = JSON.parse(savedLocal);
        return {
          ...parsed,
          caseId,
          assignmentId: parsed.assignmentId || assignmentId,
          investigatorId: parsed.investigatorId || investigatorId,
          investigatorName: parsed.investigatorName || investigatorName
        };
      } catch (e) {
        console.warn("Could not parse saved session from localStorage", e);
      }
    }

    const now = new Date().toISOString();
    return {
      id: `session_${caseId}`,
      caseId,
      assignmentId,
      investigatorId,
      investigatorName,
      currentStep: 1,
      completedSteps: [],
      status: 'IN_PROGRESS',
      syncStatus: 'SAVED_LOCAL',
      arrivalData: {
        confirmed: false,
        arrivalTime: '',
        lat: initialLat,
        lng: initialLng,
        siteStatus: 'safe',
        locationAddress: initialLocation
      },
      basicInfo: {
        caseId,
        incidentNumber: caseId,
        incidentType: 'تصادم مركبتين',
        incidentDate: new Date().toISOString().split('T')[0],
        incidentTime: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        location: initialLocation,
        initialDescription: '',
        investigatorNotes: ''
      },
      parties: [
        {
          id: 'party_insured_1',
          role: 'insured',
          roleLabel: 'المؤمن له (الطرف الأول)',
          name: '',
          nationalId: '',
          phone: '',
          vehiclePlate: '',
          vehicleModel: '',
          insuranceCompany: 'شركة المشرق للتأمين',
          policyNumber: ''
        },
        {
          id: 'party_third_1',
          role: 'third_party',
          roleLabel: 'الطرف الآخر (المركبة الثانية)',
          name: '',
          nationalId: '',
          phone: '',
          vehiclePlate: '',
          vehicleModel: '',
          insuranceCompany: 'الشركة الوطنية للتأمين',
          policyNumber: ''
        }
      ],
      mediaChecklist: [],
      diagramData: {
        roadType: 'straight',
        elements: []
      },
      statements: [
        {
          id: 'stmt_insured',
          partyType: 'insured',
          partyLabel: 'إفادة المؤمن له (السائق الأول)',
          personName: '',
          phone: '',
          statementText: '',
          timestamp: now
        },
        {
          id: 'stmt_third_party',
          partyType: 'third_party',
          partyLabel: 'إفادة الطرف الآخر (السائق الثاني)',
          personName: '',
          phone: '',
          statementText: '',
          timestamp: now
        }
      ],
      damageAssessment: [],
      finalReport: {
        summary: '',
        finalNotes: '',
        hasMissingInfo: false,
        needsAdminReview: false,
        needsExtraExpert: false,
        investigatorSignature: ''
      },
      lastSavedAt: now,
      createdAt: now,
      updatedAt: now
    };
  };

  const [session, setSession] = useState<InvestigationSession>(getInitialSession);
  const [currentStep, setCurrentStep] = useState<InvestigationStepNumber>(session.currentStep || 1);
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>(session.syncStatus || 'SAVED_LOCAL');
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [saveBannerMsg, setSaveBannerMsg] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Fetch latest state from backend on mount if available
  useEffect(() => {
    let isMounted = true;
    const fetchRemoteSession = async () => {
      try {
        const res = await fetch(`/api/investigation/session/${encodeURIComponent(caseId)}`);
        if (res.ok) {
          const remote = await res.json();
          if (remote && remote.caseId && isMounted) {
            setSession(prev => ({
              ...prev,
              ...remote,
              syncStatus: 'SYNCED'
            }));
            if (remote.currentStep) {
              setCurrentStep(remote.currentStep as InvestigationStepNumber);
            }
            setSyncStatus('SYNCED');
          }
        }
      } catch (err) {
        console.log("Offline mode or no remote session yet");
      }
    };
    fetchRemoteSession();
    return () => { isMounted = false; };
  }, [caseId]);

  // Persist locally & auto-sync to backend
  const saveSessionState = useCallback(async (
    updatedSession: InvestigationSession,
    actionName?: string,
    showToast: boolean = false
  ) => {
    const now = new Date().toISOString();
    const sessionToSave = {
      ...updatedSession,
      syncStatus: 'PENDING_SYNC' as SyncStatusType,
      lastSavedAt: now,
      updatedAt: now
    };

    // 1. Save locally
    localStorage.setItem(storageKey, JSON.stringify(sessionToSave));
    setSession(sessionToSave);
    setSyncStatus('PENDING_SYNC');

    if (showToast) {
      setSaveBannerMsg('تم حفظ المسودة محلياً، جاري المزامنة...');
      setTimeout(() => setSaveBannerMsg(''), 3000);
    }

    // 2. Try remote save
    try {
      setIsSaving(true);
      const res = await fetch('/api/investigation/session/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sessionToSave,
          lastAction: actionName || `STEP_${updatedSession.currentStep}_SAVED`
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSyncStatus('SYNCED');
        setSession(prev => ({ ...prev, syncStatus: 'SYNCED' }));
        if (showToast) {
          setSaveBannerMsg('تمت المزامنة بنجاح مع الخادم');
          setTimeout(() => setSaveBannerMsg(''), 3000);
        }
      } else {
        setSyncStatus('SAVED_LOCAL');
      }
    } catch (err) {
      setSyncStatus('SAVED_LOCAL');
    } finally {
      setIsSaving(false);
    }
  }, [storageKey]);

  // Listen to network status
  useEffect(() => {
    const handleOnline = () => {
      if (syncStatus !== 'SYNCED') {
        saveSessionState(session, 'ONLINE_AUTO_SYNC');
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [session, syncStatus, saveSessionState]);

  // Validate step before proceeding
  const validateCurrentStep = (step: InvestigationStepNumber): string[] => {
    const errors: string[] = [];

    switch (step) {
      case 1:
        if (!session.arrivalData.confirmed) {
          errors.push('يرجى الضغط على زر "تأكيد الوصول للموقع" للمتابعة.');
        }
        break;
      case 2:
        if (!session.basicInfo.incidentType) {
          errors.push('يرجى تحديد نوع الحادث.');
        }
        break;
      case 3:
        if (!session.parties || session.parties.length === 0) {
          errors.push('يرجى إضافة أطراف الحادث.');
        } else {
          session.parties.forEach((p, idx) => {
            if (!p.name) errors.push(`يرجى كتابة اسم ${p.roleLabel || `الطرف ${idx + 1}`}`);
            if (!p.vehiclePlate) errors.push(`يرجى كتابة رقم لوحة ${p.roleLabel || `الطرف ${idx + 1}`}`);
          });
        }
        break;
      case 4:
        const capturedPhotosCount = (session.mediaChecklist || []).filter(m => !!m.photoUrl).length;
        if (capturedPhotosCount < 2) {
          errors.push(`يرجى التقاط صورتين على الأقل للحادث للمتابعة (تم التقاط ${capturedPhotosCount} من أصل 2 كحد أدنى).`);
        }
        break;
      case 6:
        if (session.statements.some(s => !s.statementText && !s.audioUrl)) {
          errors.push('يرجى تدوين إفادة أو تسجيل صوتي للأطراف المعنية.');
        }
        break;
      case 8:
        if (!session.finalReport.summary) {
          errors.push('يرجى كتابة الخلاصة الفنية للتحقيق.');
        }
        if (!session.finalReport.investigatorSignature) {
          errors.push('يرجى توقيع المحقق الميداني في خانة التوقيع الرقمي.');
        }
        break;
    }

    return errors;
  };

  const handleNextStep = () => {
    const errors = validateCurrentStep(currentStep);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    const nextStep = Math.min(8, currentStep + 1) as InvestigationStepNumber;
    const completed = Array.from(new Set([...session.completedSteps, currentStep]));

    const updated = {
      ...session,
      currentStep: nextStep,
      completedSteps: completed
    };

    setCurrentStep(nextStep);
    saveSessionState(updated, `STEP_${currentStep}_COMPLETED_NEXT`);
  };

  const handlePrevStep = () => {
    setValidationErrors([]);
    const prev = Math.max(1, currentStep - 1) as InvestigationStepNumber;
    setCurrentStep(prev);
    const updated = { ...session, currentStep: prev };
    saveSessionState(updated, `NAVIGATE_STEP_${prev}`);
  };

  const handleJumpToStep = (targetStep: InvestigationStepNumber) => {
    setValidationErrors([]);
    setCurrentStep(targetStep);
    const updated = { ...session, currentStep: targetStep };
    saveSessionState(updated, `JUMP_TO_STEP_${targetStep}`);
  };

  const handleSubmitFinalReport = async () => {
    const errors = validateCurrentStep(8);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setValidationErrors([]);

    const now = new Date().toISOString();
    const finalSession: InvestigationSession = {
      ...session,
      status: 'SUBMITTED',
      syncStatus: 'SYNCED',
      completedSteps: [1, 2, 3, 4, 5, 6, 7, 8],
      finalReport: {
        ...session.finalReport,
        submittedAt: now
      },
      lastSavedAt: now,
      updatedAt: now
    };

    localStorage.setItem(storageKey, JSON.stringify(finalSession));
    setSession(finalSession);

    try {
      const res = await fetch('/api/investigation/session/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalSession)
      });

      if (res.ok) {
        setSaveBannerMsg('🎉 تم اعتماد وإرسال تقرير التحقيق الميداني بنجاح!');
        if (onSubmitted) {
          onSubmitted(finalSession);
        }
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setSaveBannerMsg('تم الحفظ محلياً وبانتظار معاودة الاتصال');
        setTimeout(() => onClose(), 1500);
      }
    } catch (err) {
      setSaveBannerMsg('تم الحفظ محلياً وبانتظار معاودة الاتصال');
      setTimeout(() => onClose(), 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-100 flex flex-col select-none overflow-hidden" dir="rtl">
      {/* 1. Master Top Header (Mobile-First) */}
      <header className="bg-slate-900 text-white px-4 py-3 border-b border-slate-800 shadow-md shrink-0">
        <div className="flex items-center justify-between gap-2 max-w-2xl mx-auto">
          {/* Right Section: Exit / Back */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowExitConfirm(true)}
              className="p-2 hover:bg-slate-800 active:scale-95 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer"
              title="إغلاق والعودة للبوابة"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-right">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white">إجراءات التحقيق الميداني</span>
                <span className="text-[10px] font-mono text-blue-400 bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-800/50">
                  #{caseId}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">
                {STEP_TITLES[currentStep]}
              </p>
            </div>
          </div>

          {/* Left Section: Sync Status & Save Draft */}
          <div className="flex items-center gap-2">
            {/* Sync Badge */}
            <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-800/90 border border-slate-700">
              {syncStatus === 'SYNCED' ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 hidden sm:inline">تمت المزامنة</span>
                </>
              ) : syncStatus === 'PENDING_SYNC' ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span className="text-amber-400 hidden sm:inline">مزامنة...</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-300 hidden sm:inline">محفوظ محلياً</span>
                </>
              )}
            </div>

            {/* Save as Draft Button */}
            <button
              type="button"
              onClick={() => saveSessionState(session, 'USER_MANUAL_DRAFT_SAVE', true)}
              disabled={isSaving}
              className="px-2.5 py-1.5 bg-blue-600/90 hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="text-[11px]">{isSaving ? 'حفظ...' : 'حفظ كمسودة'}</span>
            </button>
          </div>
        </div>

        {/* Step Progress Visual Bar: Step X of 8 & Dots Indicator */}
        <div className="max-w-2xl mx-auto pt-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-blue-400 font-mono">الخطوة {currentStep} من 8</span>
            <span className="text-slate-400">{STEP_TITLES[currentStep]}</span>
          </div>

          {/* 8-Dots Step Indicator (●●●○○○○○) */}
          <div className="grid grid-cols-8 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => {
              const stepNum = s as InvestigationStepNumber;
              const isCurrent = currentStep === stepNum;
              const isCompleted = session.completedSteps.includes(stepNum);

              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleJumpToStep(stepNum)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-500 ring-2 ring-blue-400/40'
                      : isCompleted
                      ? 'bg-emerald-500'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                  title={`الخطوة ${s}: ${STEP_TITLES[stepNum]}`}
                />
              );
            })}
          </div>
        </div>
      </header>

      {/* Floating Save / Notification Banner */}
      {saveBannerMsg && (
        <div className="bg-emerald-600 text-white text-center py-2 px-4 text-xs font-bold shadow-md animate-fade-in flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveBannerMsg}</span>
        </div>
      )}

      {/* 2. Step Main Body Viewport */}
      <main className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full pb-24 space-y-4">
        {/* Step Validation Banner */}
        {validationErrors.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 space-y-1 animate-shake">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>يرجى استكمال الحقول الإلزامية:</span>
            </div>
            <ul className="list-disc list-inside text-[11px] text-red-700 pr-2">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Render Active Step Subcomponent */}
        {currentStep === 1 && (
          <Step1Arrival
            arrivalData={session.arrivalData}
            onChange={(arrivalData: ArrivalData) => {
              const updated = { ...session, arrivalData };
              saveSessionState(updated, 'STEP_1_ARRIVAL_UPDATE');
            }}
            caseLocation={session.basicInfo.location || initialLocation}
            caseLat={initialLat}
            caseLng={initialLng}
          />
        )}

        {currentStep === 2 && (
          <Step2BasicInfo
            basicInfo={session.basicInfo}
            onChange={(basicInfo: IncidentBasicData) => {
              const updated = { ...session, basicInfo };
              saveSessionState(updated, 'STEP_2_BASIC_INFO_UPDATE');
            }}
          />
        )}

        {currentStep === 3 && (
          <Step3PartiesVehicles
            caseId={caseId}
            parties={session.parties}
            onChange={(parties: CaseParty[]) => {
              const updated = { ...session, parties };
              saveSessionState(updated, 'STEP_3_PARTIES_UPDATE');
            }}
          />
        )}

        {currentStep === 4 && (
          <Step4MediaChecklist
            mediaItems={session.mediaChecklist}
            onChange={(mediaChecklist: CaseMediaItem[]) => {
              const updated = { ...session, mediaChecklist };
              saveSessionState(updated, 'STEP_4_MEDIA_UPDATE');
            }}
            caseId={caseId}
            assignmentId={assignmentId}
            investigatorId={investigatorId}
            currentLat={session.arrivalData.lat}
            currentLng={session.arrivalData.lng}
          />
        )}

        {currentStep === 5 && (
          <Step5AccidentDiagram
            diagramData={session.diagramData}
            caseId={caseId}
            incidentNumber={session.basicInfo?.incidentNumber || caseId}
            onChange={(diagramData: DiagramData) => {
              const updated = { ...session, diagramData };
              saveSessionState(updated, 'STEP_5_DIAGRAM_UPDATE');
            }}
          />
        )}

        {currentStep === 6 && (
          <Step6StatementsWitnesses
            statements={session.statements}
            onChange={(statements: CaseStatement[]) => {
              const updated = { ...session, statements };
              saveSessionState(updated, 'STEP_6_STATEMENTS_UPDATE');
            }}
          />
        )}

        {currentStep === 7 && (
          <Step7DamageAssessment
            damageItems={session.damageAssessment}
            onChange={(damageAssessment: DamageAssessmentItem[]) => {
              const updated = { ...session, damageAssessment };
              saveSessionState(updated, 'STEP_7_DAMAGE_UPDATE');
            }}
            parties={session.parties}
            mediaItems={session.mediaChecklist}
          />
        )}

        {currentStep === 8 && (
          <Step8FinalReport
            finalReport={session.finalReport}
            onChange={(finalReport: FinalReportData) => {
              const updated = { ...session, finalReport };
              saveSessionState(updated, 'STEP_8_FINAL_REPORT_UPDATE');
            }}
            session={session}
            onSubmitReport={handleSubmitFinalReport}
            isSubmitting={isSubmitting}
            validationErrors={validationErrors}
          />
        )}
      </main>

      {/* 3. Bottom Sticky Action Navigation Bar */}
      <footer className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-2xl z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          {/* Previous Button */}
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
            <span>السابق</span>
          </button>

          {/* Center Info Indicator */}
          <div className="text-center">
            <span className="text-[11px] font-bold text-slate-500 font-mono">
              {currentStep} / 8
            </span>
          </div>

          {/* Next / Submit Button */}
          {currentStep < 8 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-3 bg-[#315EF5] hover:bg-blue-700 text-white rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-95"
            >
              <span>حفظ ومتابعة</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitFinalReport}
              disabled={isSubmitting}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'جاري الإرسال...' : 'اعتماد التقرير'}</span>
              <FileCheck2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </footer>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4 text-right">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Save className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-900">حفظ الإجراءات والعودة للبوابة</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                تم حفظ جميع الخطوات والبيانات التي أدخلتها كمسودة آمنة. يمكنك استئناف التحقيق الميداني في أي وقت.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  saveSessionState(session, 'USER_EXIT_DRAFT_SAVED');
                  setShowExitConfirm(false);
                  onClose();
                }}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
              >
                تأكيد الخروج
              </button>
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer"
              >
                متابعة التحقيق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
