import React, { useState } from 'react';
import { 
  Users, 
  Car, 
  Plus, 
  Trash2, 
  Phone, 
  CreditCard, 
  FileCheck, 
  QrCode, 
  Search, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  AlertOctagon
} from 'lucide-react';
import { CaseParty } from '../../types';
import { VehicleQrScannerModal } from '../qr/VehicleQrScannerModal';

interface Step3PartiesVehiclesProps {
  caseId?: string;
  parties: CaseParty[];
  onChange: (updatedParties: CaseParty[]) => void;
}

const PALESTINIAN_INSURERS = [
  'شركة المشرق للتأمين',
  'الشركة الوطنية للتأمين',
  'شركة ترست العالمية للتأمين',
  'شركة فلسطين للتأمين',
  'شركة التكافل الفلسطينية للتأمين',
  'شركة التأمين الوطنية',
  'شركة المجموعة الأهلية للتأمين',
  'شركة البركة للتأمين',
  'أخرى / بدون تأمين'
];

export const Step3PartiesVehicles: React.FC<Step3PartiesVehiclesProps> = ({
  caseId,
  parties,
  onChange
}) => {
  const [showQrModal, setShowQrModal] = useState(false);

  const handleAddParty = (role: 'insured' | 'third_party' | 'other' = 'third_party') => {
    const newParty: CaseParty = {
      id: `party_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      role,
      roleLabel: role === 'insured' ? 'المؤمن له (الطرف الأول)' : role === 'third_party' ? `الطرف الآخر (${parties.length + 1})` : `طرف إضافي (${parties.length + 1})`,
      name: '',
      nationalId: '',
      phone: '',
      vehiclePlate: '',
      vehicleModel: '',
      insuranceCompany: PALESTINIAN_INSURERS[0],
      policyNumber: '',
      licenseNumber: ''
    };
    onChange([...parties, newParty]);
  };

  const handleUpdatePartyField = async (partyId: string, field: keyof CaseParty, newValue: string) => {
    const party = parties.find(p => p.id === partyId);
    if (!party) return;

    // Check for Data Mismatch if party was verified by QR or has originalValues
    let updatedMismatches = party.mismatchAlerts ? [...party.mismatchAlerts] : [];

    if (party.verifiedByQr && party.originalValues && party.originalValues[field as string]) {
      const origVal = party.originalValues[field as string];
      if (origVal && origVal.trim() !== newValue.trim()) {
        const existingAlert = updatedMismatches.find(m => m.field === field);
        if (!existingAlert) {
          const alertObj = {
            field: field as string,
            originalValue: origVal,
            investigatorValue: newValue,
            reason: 'تعديل البيانات المشاهدة ميدانياً من قبل المحقق',
            changedAt: new Date().toISOString()
          };
          updatedMismatches.push(alertObj);

          // Notify backend API
          try {
            await fetch('/api/investigation/data-mismatch-alert', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                caseId: caseId || 'ACC-2026-0819',
                partyId,
                field,
                originalValue: origVal,
                investigatorValue: newValue,
                reason: 'تعديل بيانات تم تعبئتها من قاعدة بيانات التأمين'
              })
            });
          } catch (err) {
            console.error("Failed to log data mismatch alert:", err);
          }
        }
      }
    }

    onChange(parties.map(p => p.id === partyId ? { ...p, [field]: newValue, mismatchAlerts: updatedMismatches } : p));
  };

  const handleRemoveParty = (id: string) => {
    if (parties.length <= 1) return;
    onChange(parties.filter(p => p.id !== id));
  };

  const handleVehicleLinkedFromModal = (linkedPartyData: any) => {
    // If party exists with same plate, update it; otherwise append
    const existingIndex = parties.findIndex(p => p.vehiclePlate === linkedPartyData.vehiclePlate);
    if (existingIndex >= 0) {
      const updated = [...parties];
      updated[existingIndex] = {
        ...updated[existingIndex],
        ...linkedPartyData,
        verifiedByQr: true,
        verifiedAt: new Date().toISOString()
      };
      onChange(updated);
    } else {
      onChange([...parties, linkedPartyData]);
    }
  };

  return (
    <div className="space-y-4 text-right animate-fade-in" dir="rtl">
      {/* Step Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600 font-black text-sm">
            <Users className="w-4 h-4" />
            <span>الخطوة 3: الأطراف والمركبات المشتركة في الحادث</span>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {parties.length} {parties.length === 1 ? 'طرف' : 'أطراف'}
          </span>
        </div>

        <p className="text-xs text-slate-500">
          توثيق بيانات السائقين، أرقام الهويات، لوحات المركبات، وشركات ووثائق التأمين.
        </p>

        {/* QR & Auto-fill Action Bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            id="STEP3_SCAN_QR_BTN"
            className="flex-1 py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
          >
            <QrCode className="w-4 h-4" />
            <span>مسح QR المركبة لتعبئة البيانات تلقائياً</span>
          </button>

          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            id="STEP3_MANUAL_SEARCH_BTN"
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Search className="w-4 h-4 text-slate-600" />
            <span>البحث بدون QR (بحث يدوي)</span>
          </button>
        </div>
      </div>

      {/* Parties List */}
      <div className="space-y-3.5">
        {parties.map((party, index) => {
          const isInsured = party.role === 'insured';
          const hasMismatches = party.mismatchAlerts && party.mismatchAlerts.length > 0;

          return (
            <div
              key={party.id}
              className={`bg-white rounded-2xl border p-4 shadow-sm space-y-3 relative ${
                hasMismatches
                  ? 'border-amber-300 bg-amber-50/20'
                  : party.verifiedByQr
                  ? 'border-emerald-300 ring-1 ring-emerald-100'
                  : isInsured
                  ? 'border-blue-300 ring-1 ring-blue-100'
                  : 'border-slate-200'
              }`}
            >
              {/* Card Title & Verification Badges */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    isInsured ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-black text-slate-900">
                        {party.roleLabel || (isInsured ? 'المؤمن له (الطرف الأول)' : `الطرف رقم ${index + 1}`)}
                      </h3>

                      {/* Verified Badge */}
                      {party.verifiedByQr && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>تم التحقق ✓</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {isInsured ? 'صاحب الوثيقة المسجلة' : 'المركبة المعترضة / المتضررة'}
                    </span>
                  </div>
                </div>

                {parties.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveParty(party.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="حذف هذا الطرف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Data Mismatch Warning Banner */}
              {hasMismatches && (
                <div className="bg-amber-100/90 border border-amber-300 text-amber-900 p-2.5 rounded-xl text-xs space-y-1.5 animate-fade-in">
                  <div className="flex items-center gap-1.5 font-black text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>⚠️ يوجد اختلاف بين البيانات المسجلة والمشاهدة ميدانياً</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-amber-950 font-medium">
                    {party.mismatchAlerts?.map((m, idx) => (
                      <div key={idx} className="flex flex-wrap items-center gap-1 bg-white/70 p-1.5 rounded-lg border border-amber-200">
                        <span className="font-bold text-amber-900">حقل ({m.field}):</span>
                        <span className="text-slate-500 line-through font-mono">{m.originalValue}</span>
                        <span className="text-slate-400">←</span>
                        <strong className="text-emerald-700 font-mono font-bold">{m.investigatorValue}</strong>
                        <span className="text-[10px] text-amber-800 bg-amber-200/60 px-1.5 py-0.5 rounded font-sans">
                          تم التنبيه والتسجيل بالسجل
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Driver & Identity Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      الاسم الكامل للسائق / المالك: <span className="text-red-500">*</span>
                    </label>
                    {party.verifiedByQr && (
                      <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        تم التحقق ✓
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={party.name}
                    onChange={(e) => handleUpdatePartyField(party.id, 'name', e.target.value)}
                    placeholder="مثال: أحمد عبد الله خليل"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      رقم الهوية / السجل المدني:
                    </label>
                    {party.verifiedByQr && party.nationalId && (
                      <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        تم التحقق ✓
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={party.nationalId}
                      onChange={(e) => handleUpdatePartyField(party.id, 'nationalId', e.target.value)}
                      placeholder="9 أرقام (مثال: 987654321)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600"
                    />
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    رقم الهاتف / الجوال:
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={party.phone}
                      onChange={(e) => handleUpdatePartyField(party.id, 'phone', e.target.value)}
                      placeholder="059xxxxxxx أو 056xxxxxxx"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600"
                    />
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    رقم رخصة القيادة:
                  </label>
                  <input
                    type="text"
                    value={party.licenseNumber || ''}
                    onChange={(e) => handleUpdatePartyField(party.id, 'licenseNumber', e.target.value)}
                    placeholder="رقم رخصة القيادة"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Vehicle & Insurance Details */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Car className="w-3.5 h-3.5 text-indigo-600" />
                    <span>بيانات المركبة والتأمين الموثقة:</span>
                  </div>
                  {party.verifiedByQr && (
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>بيانات موثقة رقمياً ✓</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-600 block">
                        رقم اللوحة: <span className="text-red-500">*</span>
                      </label>
                      {party.verifiedByQr && (
                        <span className="text-[9px] text-emerald-700 font-bold">تم التحقق ✓</span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={party.vehiclePlate}
                      onChange={(e) => handleUpdatePartyField(party.id, 'vehiclePlate', e.target.value)}
                      placeholder="مثال: 6-1234-90"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-600 block">
                        نوع وطراز المركبة:
                      </label>
                      {party.verifiedByQr && (
                        <span className="text-[9px] text-emerald-700 font-bold">تم التحقق ✓</span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={party.vehicleModel}
                      onChange={(e) => handleUpdatePartyField(party.id, 'vehicleModel', e.target.value)}
                      placeholder="هيونداي توسان 2022"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-600 block">
                        شركة التأمين:
                      </label>
                      {party.verifiedByQr && (
                        <span className="text-[9px] text-emerald-700 font-bold">تم التحقق ✓</span>
                      )}
                    </div>
                    <select
                      value={party.insuranceCompany || PALESTINIAN_INSURERS[0]}
                      onChange={(e) => handleUpdatePartyField(party.id, 'insuranceCompany', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
                    >
                      {PALESTINIAN_INSURERS.map((comp) => (
                        <option key={comp} value={comp}>{comp}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-600 block">
                        رقم وثيقة التأمين:
                      </label>
                      {party.verifiedByQr && (
                        <span className="text-[9px] text-emerald-700 font-bold">تم التحقق ✓</span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={party.policyNumber}
                        onChange={(e) => handleUpdatePartyField(party.id, 'policyNumber', e.target.value)}
                        placeholder="مثال: POL-2026-9812"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600"
                      />
                      <FileCheck className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                    </div>
                  </div>
                </div>

                {/* Additional Chassis Number field if available */}
                {party.chassisNumber && (
                  <div className="pt-1.5 border-t border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                    <span>رقم الشاصي (VIN): <strong className="font-mono text-slate-900">{party.chassisNumber}</strong></span>
                    <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      تم التحقق ✓
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add More Parties Button */}
      <button
        type="button"
        onClick={() => handleAddParty('third_party')}
        className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-2 border-dashed border-indigo-300 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98"
      >
        <Plus className="w-4 h-4" />
        <span>إضافة طرف / مركبة إضافية في الحادث</span>
      </button>

      {/* QR Scanner Modal Trigger */}
      {showQrModal && (
        <VehicleQrScannerModal
          caseId={caseId || 'ACC-2026-0819'}
          onClose={() => setShowQrModal(false)}
          onVehicleLinked={handleVehicleLinkedFromModal}
        />
      )}
    </div>
  );
};
