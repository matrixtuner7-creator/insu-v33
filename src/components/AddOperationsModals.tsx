import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Shield, 
  Car, 
  Briefcase, 
  MapPin, 
  AlertTriangle, 
  Save, 
  RefreshCw, 
  DollarSign, 
  Calendar 
} from 'lucide-react';

interface AddPolicyholderModalProps {
  onClose: () => void;
  onSuccess: (newPh: any) => void;
  onOpenDuplicate: (ph: any) => void;
}

export const AddPolicyholderModal: React.FC<AddPolicyholderModalProps> = ({ onClose, onSuccess, onOpenDuplicate }) => {
  const [customerType, setCustomerType] = useState<'INDIVIDUAL' | 'COMPANY'>('INDIVIDUAL');
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [companyRegistrationNumber, setCompanyRegistrationNumber] = useState('');
  const [mobile, setMobile] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [duplicateData, setDuplicateData] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('الاسم الكامل مطلوب');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setDuplicateData(null);

    try {
      const res = await fetch('/api/operations/policyholder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerType,
          fullName,
          nationalId: customerType === 'INDIVIDUAL' ? nationalId : null,
          companyRegistrationNumber: customerType === 'COMPANY' ? companyRegistrationNumber : null,
          mobile,
          phone,
          email,
          address,
          city,
          governorate,
          customerNumber,
          actorId: localStorage.getItem('user_username') || 'HQ_ADMIN'
        })
      });

      if (res.status === 201) {
        const data = await res.json();
        onSuccess(data);
      } else if (res.status === 409) {
        const data = await res.json();
        setDuplicateData(data);
        setErrorMsg('يوجد مؤمن له مطابق في قاعدة البيانات بنفس الهوية أو الجوال.');
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'فشلت عملية الحفظ');
      }
    } catch (err: any) {
      setErrorMsg('حدث خطأ أثناء الاتصال بالخادم: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md font-sans">
      <div className="bg-[#21272F] border border-[#3A434C] rounded-3xl w-full max-w-2xl shadow-2xl text-right text-xs text-[#F1F5F9] overflow-hidden flex flex-col max-h-[90vh]" dir="rtl">
        {/* Header */}
        <div className="p-6 border-b border-[#3A434C] flex items-center justify-between bg-[#1A1F26]">
          <button onClick={onClose} className="p-1.5 bg-[#2A323A] hover:bg-[#323A40] text-[#AAB2BA] rounded-xl transition-all cursor-pointer">
            <X className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-base font-black flex items-center gap-2 justify-end">
              <User className="w-5 h-5 text-[#315EF5]" />
              <span>إضافة ملف مؤمن له جديد</span>
            </h3>
            <p className="text-[#AAB2BA] text-[11px] mt-1">تسجيل ملف تشغيلي يدوي للمؤمن له وتأكيد حقول التحقق والتكرار</p>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl flex flex-col gap-3">
              <div className="flex items-start gap-2 justify-end">
                <span className="text-right flex-1 font-bold">{errorMsg}</span>
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              </div>
              {duplicateData && duplicateData.existingPolicyholder && (
                <div className="bg-[#161B1F]/60 p-3 rounded-xl space-y-2 mt-1">
                  <div className="text-[11px] text-[#AAB2BA]">
                    الملف المطابق: <span className="text-white font-bold">{duplicateData.existingPolicyholder.fullName}</span> ({duplicateData.existingPolicyholder.customerNumber})
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenDuplicate(duplicateData.existingPolicyholder)}
                    className="w-full py-2 bg-[#315EF5] hover:bg-[#315EF5]/90 text-white rounded-lg font-bold text-[11px] transition-all cursor-pointer"
                  >
                    فتح الملف المطابق الحالي
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Customer Type Selector */}
          <div className="space-y-2">
            <label className="text-[#AAB2BA] font-bold block">تصنيف العميل:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCustomerType('INDIVIDUAL')}
                className={`py-3 rounded-2xl font-bold border transition-all cursor-pointer ${
                  customerType === 'INDIVIDUAL' 
                    ? 'bg-[#315EF5]/15 border-[#315EF5] text-[#315EF5]' 
                    : 'bg-[#161B1F] border-[#3A434C] text-[#AAB2BA] hover:text-[#F1F5F9]'
                }`}
              >
                فردي (INDIVIDUAL)
              </button>
              <button
                type="button"
                onClick={() => setCustomerType('COMPANY')}
                className={`py-3 rounded-2xl font-bold border transition-all cursor-pointer ${
                  customerType === 'COMPANY' 
                    ? 'bg-[#315EF5]/15 border-[#315EF5] text-[#315EF5]' 
                    : 'bg-[#161B1F] border-[#3A434C] text-[#AAB2BA] hover:text-[#F1F5F9]'
                }`}
              >
                شركة / مؤسسة (COMPANY)
              </button>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <label className="text-[#AAB2BA] font-bold">الاسم الكامل (أو اسم الشركة) *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="أدخل الاسم الرباعي للمؤمن له"
                className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-[#315EF5]"
              />
            </div>

            {customerType === 'INDIVIDUAL' ? (
              <div className="space-y-1.5">
                <label className="text-[#AAB2BA] font-bold">رقم الهوية الوطنية *</label>
                <input
                  type="text"
                  required
                  value={nationalId}
                  onChange={e => setNationalId(e.target.value)}
                  placeholder="رقم الهوية المكون من 9 خانات"
                  className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#315EF5]"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-[#AAB2BA] font-bold">رقم السجل التجاري *</label>
                <input
                  type="text"
                  required
                  value={companyRegistrationNumber}
                  onChange={e => setCompanyRegistrationNumber(e.target.value)}
                  placeholder="رقم السجل التجاري الرسمي"
                  className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#315EF5]"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[#AAB2BA] font-bold">رقم العميل الموحد (اختياري)</label>
              <input
                type="text"
                value={customerNumber}
                onChange={e => setCustomerNumber(e.target.value)}
                placeholder="سيتم توليده تلقائياً إن ترك فارغاً"
                className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#315EF5]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#AAB2BA] font-bold">رقم الجوال النشط *</label>
              <input
                type="text"
                required
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                placeholder="مثال: 0599000000"
                className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#315EF5]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#AAB2BA] font-bold">رقم الهاتف الأرضي (إن وجد)</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="الهاتف الثابت"
                className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#315EF5]"
              />
            </div>

            <div className="space-y-1.5 col-span-2">
              <label className="text-[#AAB2BA] font-bold">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@domain.com"
                className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#315EF5]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#AAB2BA] font-bold">المدينة</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="مثال: رام الله"
                className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-[#315EF5]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#AAB2BA] font-bold">المحافظة</label>
              <input
                type="text"
                value={governorate}
                onChange={e => setGovernorate(e.target.value)}
                placeholder="مثال: رام الله والبيرة"
                className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-[#315EF5]"
              />
            </div>

            <div className="space-y-1.5 col-span-2">
              <label className="text-[#AAB2BA] font-bold">العنوان السكني / التفصيلي</label>
              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="العمارة، الشارع، المعلم المميز..."
                rows={2}
                className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-[#315EF5]"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 bg-[#1A1F26] border-t border-[#3A434C] flex justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#2A323A] hover:bg-[#323A40] text-[#AAB2BA] rounded-xl font-bold transition-all cursor-pointer"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-[#315EF5] hover:bg-[#315EF5]/90 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>حفظ المؤمن له</span>
          </button>
        </div>
      </div>
    </div>
  );
};


// ==========================================
// ADD INSURANCE POLICY MODAL
// ==========================================

interface AddPolicyModalProps {
  onClose: () => void;
  onSuccess: (newPolicy: any) => void;
  preselectedPolicyholderId?: string;
  policyholders: any[];
  assets: any[];
}

export const AddPolicyModal: React.FC<AddPolicyModalProps> = ({ 
  onClose, 
  onSuccess, 
  preselectedPolicyholderId = '', 
  policyholders,
  assets
}) => {
  const [policyNumber, setPolicyNumber] = useState('');
  const [policyholderId, setPolicyholderId] = useState(preselectedPolicyholderId);
  const [insuredAssetId, setInsuredAssetId] = useState('');
  const [policyType, setPolicyType] = useState('COMPREHENSIVE'); // COMPREHENSIVE, TPL
  const [coverageType, setCoverageType] = useState('شامل ذهبي');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [premiumAmount, setPremiumAmount] = useState('');
  const [currency, setCurrency] = useState('ILS');
  const [branchId, setBranchId] = useState('');
  const [agentId, setAgentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filter assets to show only the selected policyholder's assets
  const filteredAssets = assets.filter(a => a.policyholderId === policyholderId);

  useEffect(() => {
    setPolicyholderId(preselectedPolicyholderId);
  }, [preselectedPolicyholderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyNumber.trim()) return setErrorMsg('رقم البوليصة مطلوب');
    if (!policyholderId) return setErrorMsg('المؤمن له مطلوب');

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/operations/policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyNumber,
          policyholderId,
          insuredAssetId: insuredAssetId || null,
          policyType,
          coverageType,
          startDate,
          endDate,
          issueDate,
          premiumAmount,
          currency,
          branchId,
          agentId,
          actorId: localStorage.getItem('user_username') || 'HQ_ADMIN'
        })
      });

      if (res.ok) {
        onSuccess(await res.json());
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'فشلت عملية إنشاء البوليصة');
      }
    } catch (err: any) {
      setErrorMsg('حدث خطأ أثناء الاتصال بالخادم: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md font-sans">
      <div className="bg-[#21272F] border border-[#3A434C] rounded-3xl w-full max-w-2xl shadow-2xl text-right text-xs text-[#F1F5F9] overflow-hidden flex flex-col max-h-[90vh]" dir="rtl">
        <div className="p-6 border-b border-[#3A434C] flex items-center justify-between bg-[#1A1F26]">
          <button onClick={onClose} className="p-1.5 bg-[#2A323A] hover:bg-[#323A40] text-[#AAB2BA] rounded-xl transition-all cursor-pointer">
            <X className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-base font-black flex items-center gap-2 justify-end">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>إصدار بوليصة تأمين جديدة</span>
            </h3>
            <p className="text-[#AAB2BA] text-[11px] mt-1">تحديد وثيقة التأمين، وربطها بالمؤمن له وتغطية الأصول المؤمن عليها</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl font-bold">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[#AAB2BA] font-bold">رقم وثيقة التأمين *</label>
              <input
                type="text"
                required
                value={policyNumber}
                onChange={e => setPolicyNumber(e.target.value)}
                placeholder="مثال: POL-2026-9912"
                className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#315EF5]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#AAB2BA] font-bold">المؤمن له (العميل) *</label>
              {preselectedPolicyholderId ? (
                <div className="p-3 bg-[#161B1F]/60 border border-[#3A434C] rounded-2xl text-[#F1F5F9] font-bold">
                  {policyholders.find(ph => ph.id === preselectedPolicyholderId)?.fullName || 'المؤمن له المختار'}
                </div>
              ) : (
                <select
                  required
                  value={policyholderId}
                  onChange={e => {
                    setPolicyholderId(e.target.value);
                    setInsuredAssetId('');
                  }}
                  className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#315EF5]"
                >
                  <option value="">-- اختر المؤمن له --</option>
                  {policyholders.map(ph => (
                    <option key={ph.id} value={ph.id}>{ph.fullName} ({ph.customerNumber})</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[#AAB2BA] font-bold">نوع البوليصة / التغطية الأساسية</label>
              <select
                value={policyType}
                onChange={e => setPolicyType(e.target.value)}
                className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#315EF5]"
              >
                <option value="COMPREHENSIVE">تأمين شامل (COMPREHENSIVE)</option>
                <option value="TPL">تأمين ضد الغير (TPL / Third Party)</option>
                <option value="PROPERTY">تأمين ممتلكات وسرقة</option>
                <option value="OTHER">أخرى</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[#AAB2BA] font-bold">تفاصيل نوع التغطية</label>
              <input
                type="text"
                value={coverageType}
                onChange={e => setCoverageType(e.target.value)}
                placeholder="مثال: شامل ذهبي، ضد الغير إلزامي"
                className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-[#315EF5]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#AAB2BA] font-bold">الأصل المؤمن عليه (إن وجد)</label>
              <select
                value={insuredAssetId}
                onChange={e => setInsuredAssetId(e.target.value)}
                disabled={!policyholderId}
                className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-bold disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#315EF5]"
              >
                <option value="">-- بلا أصل مرتبط (تأمين عام) --</option>
                {filteredAssets.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.assetType === 'VEHICLE' && a.vehicle ? `مركبة: ${a.vehicle.plateNumber} (${a.vehicle.make} ${a.vehicle.model})` : `${a.assetType}: ${a.description || a.assetReference || a.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[#AAB2BA] font-bold">قسط التأمين المالي (Premium Amount)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={premiumAmount}
                  onChange={e => setPremiumAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#315EF5]"
                />
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-bold focus:outline-none"
                >
                  <option value="ILS">ILS (شيكل)</option>
                  <option value="JOD">JOD</option>
                  <option value="USD">USD</option>
                  <option value="SAR">SAR</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[#AAB2BA] font-bold">تاريخ إصدار البوليصة</label>
              <input
                type="date"
                value={issueDate}
                onChange={e => setIssueDate(e.target.value)}
                className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#315EF5]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#AAB2BA] font-bold">تاريخ بدء مفعول التأمين</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#315EF5]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#AAB2BA] font-bold">تاريخ انتهاء التأمين</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#315EF5]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#AAB2BA] font-bold">رمز فرع الشركة / كود الوكيل</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={branchId}
                  onChange={e => setBranchId(e.target.value)}
                  placeholder="Branch Code"
                  className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-mono focus:outline-none"
                />
                <input
                  type="text"
                  value={agentId}
                  onChange={e => setAgentId(e.target.value)}
                  placeholder="Agent Code"
                  className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>
        </form>

        <div className="p-4 bg-[#1A1F26] border-t border-[#3A434C] flex justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#2A323A] hover:bg-[#323A40] text-[#AAB2BA] rounded-xl font-bold transition-all cursor-pointer"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>إصدار الوثيقة</span>
          </button>
        </div>
      </div>
    </div>
  );
};


// ==========================================
// ADD INSURED ASSET (VEHICLE / GENERAL) MODAL
// ==========================================

interface AddAssetModalProps {
  onClose: () => void;
  onSuccess: (newAsset: any) => void;
  preselectedPolicyholderId?: string;
  policyholders: any[];
}

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  onClose,
  onSuccess,
  preselectedPolicyholderId = '',
  policyholders
}) => {
  const [policyholderId, setPolicyholderId] = useState(preselectedPolicyholderId);
  const [assetType, setAssetType] = useState<'VEHICLE' | 'PROPERTY' | 'HOME' | 'COMMERCIAL_PROPERTY' | 'EQUIPMENT' | 'MACHINERY' | 'OTHER'>('VEHICLE');
  const [description, setDescription] = useState('');
  const [assetReference, setAssetReference] = useState('');

  // Vehicle Specific Sub-fields
  const [plateNumber, setPlateNumber] = useState('');
  const [plateCountry, setPlateCountry] = useState('JO');
  const [chassisNumber, setChassisNumber] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [modelYear, setModelYear] = useState('');
  const [color, setColor] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [usageType, setUsageType] = useState('PRIVATE');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setPolicyholderId(preselectedPolicyholderId);
  }, [preselectedPolicyholderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyholderId) return setErrorMsg('المؤمن له مطلوب للربط');
    if (assetType === 'VEHICLE' && !plateNumber.trim()) return setErrorMsg('رقم اللوحة مطلوب للمركبة');

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/operations/asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyholderId,
          assetType,
          description,
          assetReference: assetType === 'VEHICLE' ? plateNumber : assetReference,
          plateNumber,
          plateCountry,
          chassisNumber,
          make,
          model,
          modelYear,
          color,
          vehicleType,
          registrationNumber,
          usageType,
          actorId: localStorage.getItem('user_username') || 'HQ_ADMIN'
        })
      });

      if (res.ok) {
        onSuccess(await res.json());
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'فشلت عملية حفظ الأصل');
      }
    } catch (err: any) {
      setErrorMsg('حدث خطأ أثناء الاتصال بالخادم: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md font-sans">
      <div className="bg-[#21272F] border border-[#3A434C] rounded-3xl w-full max-w-2xl shadow-2xl text-right text-xs text-[#F1F5F9] overflow-hidden flex flex-col max-h-[90vh]" dir="rtl">
        <div className="p-6 border-b border-[#3A434C] flex items-center justify-between bg-[#1A1F26]">
          <button onClick={onClose} className="p-1.5 bg-[#2A323A] hover:bg-[#323A40] text-[#AAB2BA] rounded-xl transition-all cursor-pointer">
            <X className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-base font-black flex items-center gap-2 justify-end">
              <Car className="w-5 h-5 text-indigo-400" />
              <span>تسجيل أصل مؤمَّن جديد</span>
            </h3>
            <p className="text-[#AAB2BA] text-[11px] mt-1">إضافة أصل جديد (مركبة، عقار، منشأة، خط إنتاج) وربطها بملف المؤمن له</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl font-bold">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2 md:col-span-1">
              <label className="text-[#AAB2BA] font-bold">المؤمن له المرتبط (المالك) *</label>
              {preselectedPolicyholderId ? (
                <div className="p-3 bg-[#161B1F]/60 border border-[#3A434C] rounded-2xl text-[#F1F5F9] font-bold">
                  {policyholders.find(ph => ph.id === preselectedPolicyholderId)?.fullName || 'المؤمن له المختار'}
                </div>
              ) : (
                <select
                  required
                  value={policyholderId}
                  onChange={e => setPolicyholderId(e.target.value)}
                  className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-bold focus:outline-none"
                >
                  <option value="">-- اختر المؤمن له --</option>
                  {policyholders.map(ph => (
                    <option key={ph.id} value={ph.id}>{ph.fullName} ({ph.customerNumber})</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1.5 col-span-2 md:col-span-1">
              <label className="text-[#AAB2BA] font-bold">نوع الأصل المؤمن عليه *</label>
              <select
                value={assetType}
                onChange={e => setAssetType(e.target.value as any)}
                className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-bold focus:outline-none"
              >
                <option value="VEHICLE">مركبة (VEHICLE)</option>
                <option value="PROPERTY">عقار / مبنى (PROPERTY)</option>
                <option value="HOME">منزل سكني (HOME)</option>
                <option value="COMMERCIAL_PROPERTY">منشأة تجارية (COMMERCIAL)</option>
                <option value="EQUIPMENT">آلات ومعدات (EQUIPMENT)</option>
                <option value="OTHER">أصل آخر (OTHER)</option>
              </select>
            </div>

            {assetType === 'VEHICLE' ? (
              // VEHICLE SPECIFIC FIELDS
              <>
                <div className="bg-[#1A1F26] p-4 rounded-2xl col-span-2 border border-[#3A434C]/50 space-y-4">
                  <div className="text-[11px] font-black text-indigo-400 border-b border-[#3A434C]/40 pb-2">بيانات تفاصيل المركبة المؤمنة</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[#AAB2BA] font-bold">رقم لوحة المركبة *</label>
                      <input
                        type="text"
                        required
                        value={plateNumber}
                        onChange={e => setPlateNumber(e.target.value)}
                        placeholder="مثال: 3-9912-92"
                        className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-mono font-bold focus:ring-2 focus:ring-[#315EF5] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[#AAB2BA] font-bold">بلد اللوحة / المصدر</label>
                      <input
                        type="text"
                        value={plateCountry}
                        onChange={e => setPlateCountry(e.target.value)}
                        placeholder="مثال: JO, KSA"
                        className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-bold focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[#AAB2BA] font-bold">الماركة (الشركة المصنعة)</label>
                      <input
                        type="text"
                        value={make}
                        onChange={e => setMake(e.target.value)}
                        placeholder="مثال: تويوتا، هيونداي"
                        className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[#AAB2BA] font-bold">طراز المركبة وسنة الصنع</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={model}
                          onChange={e => setModel(e.target.value)}
                          placeholder="مثال: كامري"
                          className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white focus:outline-none"
                        />
                        <input
                          type="number"
                          value={modelYear}
                          onChange={e => setModelYear(e.target.value)}
                          placeholder="2024"
                          className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-mono focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[#AAB2BA] font-bold">رقم الهيكل / شاسيه المركبة (VIN)</label>
                      <input
                        type="text"
                        value={chassisNumber}
                        onChange={e => setChassisNumber(e.target.value)}
                        placeholder="أدخل الـ VIN الكامل المؤلف من 17 رمزاً"
                        className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-mono focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[#AAB2BA] font-bold">اللون الخارجي للمركبة</label>
                      <input
                        type="text"
                        value={color}
                        onChange={e => setColor(e.target.value)}
                        placeholder="فضي، أسود..."
                        className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[#AAB2BA] font-bold">تصنيف الاستخدام ورقم الرخصة</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={registrationNumber}
                          onChange={e => setRegistrationNumber(e.target.value)}
                          placeholder="رقم الاستمارة"
                          className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-mono focus:outline-none"
                        />
                        <select
                          value={usageType}
                          onChange={e => setUsageType(e.target.value)}
                          className="p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-bold focus:outline-none"
                        >
                          <option value="PRIVATE">خصوصي (PRIVATE)</option>
                          <option value="COMMERCIAL">تجاري / نقل</option>
                          <option value="TAXI">أجرة / عمومي</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // GENERAL ASSET FIELDS
              <>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[#AAB2BA] font-bold">الرقم المرجعي للأصل (أو كود الحساب)</label>
                  <input
                    type="text"
                    value={assetReference}
                    onChange={e => setAssetReference(e.target.value)}
                    placeholder="مثال: PROPERTY-902، LAND-BL-01"
                    className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-mono focus:outline-none"
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5 col-span-2">
              <label className="text-[#AAB2BA] font-bold">وصف الأصل / تفاصيل إضافية</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="أدخل تفاصيل وموقع وميزات الأصل المؤمن عليه لمساعدة المحققين..."
                rows={3}
                className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-[#315EF5]"
              />
            </div>
          </div>
        </form>

        <div className="p-4 bg-[#1A1F26] border-t border-[#3A434C] flex justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#2A323A] hover:bg-[#323A40] text-[#AAB2BA] rounded-xl font-bold transition-all cursor-pointer"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-[#315EF5] hover:bg-[#315EF5]/90 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>حفظ الأصل</span>
          </button>
        </div>
      </div>
    </div>
  );
};


// ==========================================
// RENEW INSURANCE POLICY MODAL
// ==========================================

interface RenewPolicyModalProps {
  onClose: () => void;
  onSuccess: (newPolicy: any) => void;
  policyToRenew: any;
}

export const RenewPolicyModal: React.FC<RenewPolicyModalProps> = ({
  onClose,
  onSuccess,
  policyToRenew
}) => {
  const [policyNumber, setPolicyNumber] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [premiumAmount, setPremiumAmount] = useState(policyToRenew?.premiumAmount || '');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto calculate a default next-year date if possible
  useEffect(() => {
    if (policyToRenew?.endDate) {
      try {
        const nextStart = new Date(policyToRenew.endDate);
        nextStart.setDate(nextStart.getDate() + 1);
        setStartDate(nextStart.toISOString().slice(0, 10));

        const nextEnd = new Date(nextStart);
        nextEnd.setFullYear(nextEnd.getFullYear() + 1);
        nextEnd.setDate(nextEnd.getDate() - 1);
        setEndDate(nextEnd.toISOString().slice(0, 10));
      } catch (e) {}
    }
    // Suggest a neat next policy number
    if (policyToRenew?.policyNumber) {
      setPolicyNumber(policyToRenew.policyNumber + "-R");
    }
  }, [policyToRenew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyNumber.trim()) return setErrorMsg('رقم البوليصة الجديدة مطلوب');

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/operations/policy/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyId: policyToRenew.id,
          policyNumber,
          startDate,
          endDate,
          premiumAmount,
          issueDate,
          actorId: localStorage.getItem('user_username') || 'HQ_ADMIN'
        })
      });

      if (res.ok) {
        onSuccess(await res.json());
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'فشلت عملية تجديد التأمين');
      }
    } catch (err: any) {
      setErrorMsg('حدث خطأ أثناء الاتصال بالخادم: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md font-sans">
      <div className="bg-[#21272F] border border-[#3A434C] rounded-3xl w-full max-w-lg shadow-2xl text-right text-xs text-[#F1F5F9] overflow-hidden flex flex-col" dir="rtl">
        <div className="p-6 border-b border-[#3A434C] flex items-center justify-between bg-[#1A1F26]">
          <button onClick={onClose} className="p-1.5 bg-[#2A323A] hover:bg-[#323A40] text-[#AAB2BA] rounded-xl transition-all cursor-pointer">
            <X className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-base font-black flex items-center gap-2 justify-end">
              <RefreshCw className="w-5 h-5 text-[#315EF5]" />
              <span>تجديد بوليصة تأمين منتهية</span>
            </h3>
            <p className="text-[#AAB2BA] text-[11px] mt-1">إنشاء وثيقة تأمين جديدة ممتدة ومرتبطة، وتحويل حالة البوليصة السابقة إلى ملغاة/منتهية</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl font-bold">
              {errorMsg}
            </div>
          )}

          {policyToRenew && (
            <div className="bg-[#1A1F26] p-4 rounded-2xl border border-[#3A434C]/50 text-right space-y-1">
              <div className="text-[10px] text-[#AAB2BA] font-bold">البوليصة الأصلية السابقة:</div>
              <div className="text-sm font-bold text-[#F1F5F9]">{policyToRenew.policyNumber}</div>
              <div className="text-[11px] text-[#7C8791] font-mono">
                المؤمن له: {policyToRenew.policyholderName || 'غير معروف'}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[#AAB2BA] font-bold">رقم البوليصة الجديدة لتاريخ التجديد *</label>
            <input
              type="text"
              required
              value={policyNumber}
              onChange={e => setPolicyNumber(e.target.value)}
              placeholder="رقم الوثيقة الجديد"
              className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-mono focus:ring-2 focus:ring-[#315EF5] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[#AAB2BA] font-bold">تاريخ البدء الجديد</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-mono focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[#AAB2BA] font-bold">تاريخ الانتهاء الجديد</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[#AAB2BA] font-bold">مبلغ القسط المالي</label>
              <input
                type="number"
                value={premiumAmount}
                onChange={e => setPremiumAmount(e.target.value)}
                className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-mono focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[#AAB2BA] font-bold">تاريخ إصدار التجديد</label>
              <input
                type="date"
                value={issueDate}
                onChange={e => setIssueDate(e.target.value)}
                className="w-full p-3 bg-[#161B1F] border border-[#3A434C] rounded-2xl text-white font-mono focus:outline-none"
              />
            </div>
          </div>
        </form>

        <div className="p-4 bg-[#1A1F26] border-t border-[#3A434C] flex justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#2A323A] hover:bg-[#323A40] text-[#AAB2BA] rounded-xl font-bold transition-all cursor-pointer"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-[#315EF5] hover:bg-[#315EF5]/90 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>تأكيد تجديد التأمين</span>
          </button>
        </div>
      </div>
    </div>
  );
};
