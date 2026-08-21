import React from 'react';
import { FileText, Lock, Calendar, Clock, MapPin, AlertCircle, Edit3 } from 'lucide-react';
import { IncidentBasicData } from '../../types';

interface Step2BasicInfoProps {
  basicInfo: IncidentBasicData;
  onChange: (updated: IncidentBasicData) => void;
}

const INCIDENT_TYPES = [
  'تصادم مركبتين',
  'تصادم متعدد (3 مركبات فأكثر)',
  'حادث دهس مشاة',
  'اصطدام بجسم ثابت / رصيف / عامود',
  'انقلاب مركبة',
  'حريق مركبة ناتج عن حادث',
  'انزلاق أو خروج عن مسار الطريق',
  'حادث صدم وهروب',
  'أخرى'
];

export const Step2BasicInfo: React.FC<Step2BasicInfoProps> = ({
  basicInfo,
  onChange
}) => {
  return (
    <div className="space-y-4 text-right animate-fade-in" dir="rtl">
      {/* Step Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
        <div className="flex items-center gap-2 text-blue-600 font-black text-sm">
          <FileText className="w-4 h-4" />
          <span>الخطوة 2: بيانات الحادث الأساسية والوصف الميداني</span>
        </div>
        <p className="text-xs text-slate-500">
          تثبيت رقم القضية الرسمي ونوع الحادث والتوقيت الدقيق وملاحظات المعاينة الأولية.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
        {/* Read-only Case ID */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>رقم القضية / البلاغ (غير قابل للتعديل):</span>
            <span className="text-[10px] text-slate-400 font-normal flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>نظام مركزي آمن</span>
            </span>
          </label>
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 font-mono font-black text-sm">
            <span className="text-blue-600">#</span>
            <span>{basicInfo.incidentNumber || basicInfo.caseId || 'ACC-2026-0819'}</span>
          </div>
        </div>

        {/* Incident Type */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 block">
            نوع الحادث / التصنيف الميداني: <span className="text-red-500">*</span>
          </label>
          <select
            value={basicInfo.incidentType || INCIDENT_TYPES[0]}
            onChange={(e) => onChange({ ...basicInfo, incidentType: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600 cursor-pointer"
          >
            {INCIDENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Date & Time Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>تاريخ الحادث:</span>
            </label>
            <input
              type="date"
              value={basicInfo.incidentDate || new Date().toISOString().split('T')[0]}
              onChange={(e) => onChange({ ...basicInfo, incidentDate: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>وقت الحادث:</span>
            </label>
            <input
              type="time"
              value={basicInfo.incidentTime || '10:30'}
              onChange={(e) => onChange({ ...basicInfo, incidentTime: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Location Description */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>موقع وتفاصيل الشارع / المنطقة:</span>
          </label>
          <input
            type="text"
            value={basicInfo.location || ''}
            onChange={(e) => onChange({ ...basicInfo, location: e.target.value })}
            placeholder="مثال: نابلس - شارع فيصل بالقرب من مفترق الميدان"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* Initial Description */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>الوصف الأولي لكيفية وقوع الحادث:</span>
          </label>
          <textarea
            rows={3}
            value={basicInfo.initialDescription || ''}
            onChange={(e) => onChange({ ...basicInfo, initialDescription: e.target.value })}
            placeholder="اكتب شرحاً مختصراً لكيفية وقوع الحادث واتجاهات مسير المركبات..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 resize-none"
          />
        </div>

        {/* Investigator Notes */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>ملاحظات المحقق الميدانية:</span>
          </label>
          <textarea
            rows={2}
            value={basicInfo.investigatorNotes || ''}
            onChange={(e) => onChange({ ...basicInfo, investigatorNotes: e.target.value })}
            placeholder="حالة الطقس، الإضاءة، الرؤية، معالم الطريق، وجود كاميرات مراقبة قريبة..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 resize-none"
          />
        </div>
      </div>
    </div>
  );
};
