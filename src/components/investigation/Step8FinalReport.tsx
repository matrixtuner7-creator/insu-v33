import React from 'react';
import { 
  FileCheck2, 
  Send, 
  AlertCircle, 
  UserCheck, 
  Shield, 
  Sparkles, 
  HelpCircle, 
  Eye, 
  CheckCircle2,
  Lock,
  Clock,
  Printer
} from 'lucide-react';
import { FinalReportData, InvestigationSession } from '../../types';
import { SignaturePad } from './SignaturePad';

interface Step8FinalReportProps {
  finalReport: FinalReportData;
  onChange: (updated: FinalReportData) => void;
  session: InvestigationSession;
  onSubmitReport: () => void;
  isSubmitting: boolean;
  validationErrors: string[];
}

export const Step8FinalReport: React.FC<Step8FinalReportProps> = ({
  finalReport,
  onChange,
  session,
  onSubmitReport,
  isSubmitting,
  validationErrors
}) => {
  const isFormValid = validationErrors.length === 0 && !!finalReport.investigatorSignature;

  return (
    <div className="space-y-4 text-right animate-fade-in" dir="rtl">
      {/* Step Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-600 font-black text-sm">
            <FileCheck2 className="w-4 h-4" />
            <span>الخطوة 8: إعداد التقرير النهائي واعتماد المحقق الميداني</span>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            الخطوة الختامية
          </span>
        </div>
        <p className="text-xs text-slate-500">
          مراجعة ملخص المعاينة والملاحظات الفنية، تثبيت التوقيع الرقمي للمحقق، وإرسال الملف لمركز العمليات.
        </p>
      </div>

      {/* Investigation Summary & Notes */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 block">
            الخلاصة الفنية لنتائج التحقيق: <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            value={finalReport.summary || ''}
            onChange={(e) => onChange({ ...finalReport, summary: e.target.value })}
            placeholder="بناءً على المعاينة الميدانية ومخطط الحادث وإفادات الأطراف، يتضح أن سبب الحادث يعود إلى..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 resize-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 block">
            الملاحظات الختامية والتوصيات:
          </label>
          <textarea
            rows={2}
            value={finalReport.finalNotes || ''}
            onChange={(e) => onChange({ ...finalReport, finalNotes: e.target.value })}
            placeholder="توصيات بخصوص سحب المركبة، تقدير كلفة الإصلاح، تقرير الشرطة والدفاع المدني إن وجد..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 resize-none"
          />
        </div>
      </div>

      {/* Status Flags & Administrative Toggles */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <label className="text-xs font-bold text-slate-800 block">
          الإحالات والملاحظات الإدارية الخاصة:
        </label>

        {/* Missing Info Flag */}
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={finalReport.hasMissingInfo}
              onChange={(e) => onChange({ ...finalReport, hasMissingInfo: e.target.checked })}
              className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-800">
              يوجد معلومات أو وثائق ناقصة من أحد الأطراف
            </span>
          </label>

          {finalReport.hasMissingInfo && (
            <input
              type="text"
              value={finalReport.missingInfoDetails || ''}
              onChange={(e) => onChange({ ...finalReport, missingInfoDetails: e.target.value })}
              placeholder="حدد الوثائق الناقصة (مثال: رخصة المركبة منتهية، عدم إبراز بوليصة التأمين...)"
              className="w-full bg-amber-50/60 border border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-600 animate-fade-in"
            />
          )}
        </div>

        {/* Needs Admin Review Flag */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={finalReport.needsAdminReview}
              onChange={(e) => onChange({ ...finalReport, needsAdminReview: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-800">
              يتطلب تدقيق ومراجعة إدارية خاصة من الإدارة المركزية (HQ)
            </span>
          </label>

          {finalReport.needsAdminReview && (
            <input
              type="text"
              value={finalReport.adminReviewReason || ''}
              onChange={(e) => onChange({ ...finalReport, adminReviewReason: e.target.value })}
              placeholder="سبب طلب التدقيق الإداري (شبهة احتيال، تضارب إفادات، نزاع قضائي...)"
              className="w-full bg-blue-50/60 border border-blue-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 animate-fade-in"
            />
          )}
        </div>

        {/* Needs Extra Expert Flag */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={finalReport.needsExtraExpert}
              onChange={(e) => onChange({ ...finalReport, needsExtraExpert: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-800">
              يحتاج استدعاء خبير فني إضافي (ميكانيك / هندسة هياكل)
            </span>
          </label>

          {finalReport.needsExtraExpert && (
            <input
              type="text"
              value={finalReport.expertSpecialty || ''}
              onChange={(e) => onChange({ ...finalReport, expertSpecialty: e.target.value })}
              placeholder="تخصص الخبير المطلوب (مثال: خبير تخمين أضرار هيكلية، خبير حرائق مركبات...)"
              className="w-full bg-purple-50/60 border border-purple-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-600 animate-fade-in"
            />
          )}
        </div>
      </div>

      {/* Investigator Digital Signature */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>توقيع المحقق الميداني المعتمد:</span> <span className="text-red-500">*</span>
          </label>
          <span className="text-[10px] text-slate-400 font-medium">
            {session.investigatorName || 'المحقق الميداني'}
          </span>
        </div>

        <SignaturePad
          initialSignature={finalReport.investigatorSignature}
          signerName={session.investigatorName || 'المحقق الميداني'}
          onSave={(dataUrl) => onChange({ ...finalReport, investigatorSignature: dataUrl })}
          label="توقيع المحقق الرسمي"
        />
      </div>

      {/* Validation Errors Notice */}
      {validationErrors.length > 0 && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl space-y-2 text-xs text-red-800">
          <div className="flex items-center gap-2 font-black">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>يرجى استكمال البيانات الإلزامية التالية قبل الإرسال:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] pr-2 text-red-700">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onSubmitReport}
          disabled={isSubmitting}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>جاري حفظ واعتماد التقرير...</span>
            </div>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>اعتماد وإرسال التقرير النهائي للمركز</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
