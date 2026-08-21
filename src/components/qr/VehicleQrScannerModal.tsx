import React, { useState } from 'react';
import { 
  QrCode, 
  Search, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Car, 
  ShieldCheck, 
  Camera, 
  Link as LinkIcon,
  UserCheck,
  FileText,
  AlertOctagon,
  Sparkles,
  Layers
} from 'lucide-react';

interface VehicleQrScannerModalProps {
  caseId?: string;
  onClose: () => void;
  onVehicleLinked?: (partyData: any) => void;
}

export const VehicleQrScannerModal: React.FC<VehicleQrScannerModalProps> = ({
  caseId,
  onClose,
  onVehicleLinked
}) => {
  const [activeTab, setActiveTab] = useState<'QR_SCAN' | 'MANUAL_LOOKUP'>('QR_SCAN');
  const [tokenInput, setTokenInput] = useState('5-9821-99');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'plate' | 'policy' | 'chassis' | 'id'>('plate');
  
  const [selectedRole, setSelectedRole] = useState<'INSURED_VEHICLE' | 'THIRD_PARTY_VEHICLE' | 'ADDITIONAL_VEHICLE' | 'WITNESS_VEHICLE'>('THIRD_PARTY_VEHICLE');
  
  const [isSearching, setIsSearching] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [duplicateMessage, setDuplicateMessage] = useState<string>('');
  const [linkSuccess, setLinkSuccess] = useState<boolean>(false);

  // QR Scan Handler
  const handleScanToken = async (queryToken?: string) => {
    const tokenToSearch = queryToken || tokenInput;
    if (!tokenToSearch) return;

    setIsSearching(true);
    setErrorMessage('');
    setDuplicateMessage('');
    setScanResult(null);

    try {
      const res = await fetch(`/api/qr/vehicle/${encodeURIComponent(tokenToSearch.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || data.error || 'رمز QR غير مسجل في النظام أو تالف');
      } else {
        setScanResult(data);
      }
    } catch (err) {
      console.error("Scan API error:", err);
      setErrorMessage('تعذر الاتصال بمركز التحقق من رموز QR');
    } finally {
      setIsSearching(false);
    }
  };

  // Manual Search Handler
  const handleManualLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setErrorMessage('');
    setDuplicateMessage('');
    setScanResult(null);

    try {
      const res = await fetch('/api/qr/vehicle/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim(), searchType })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || data.error || 'لم يتم العثور على مركبة بهذه البيانات');
      } else {
        setScanResult(data);
      }
    } catch (err) {
      console.error("Lookup API error:", err);
      setErrorMessage('تعذر الاتصال بقاعدة بيانات التأمين المركبة');
    } finally {
      setIsSearching(false);
    }
  };

  // Link to Active Case with Auto-Fill & Role Selection
  const handleConfirmAndLink = async () => {
    if (!scanResult || !scanResult.autoFill) return;

    const targetCase = caseId || 'ACC-2026-0819';
    setDuplicateMessage('');
    setErrorMessage('');

    try {
      const res = await fetch('/api/qr/vehicle/link-to-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: targetCase,
          vehicleRole: selectedRole,
          vehiclePlate: scanResult.autoFill.plate_number,
          autoFill: scanResult.autoFill,
          investigatorId: 'emp-1787022544825'
        })
      });

      const data = await res.json();

      if (res.status === 409 || data.code === 'VEHICLE_ALREADY_LINKED') {
        setDuplicateMessage(data.message || 'هذه المركبة مضافة بالفعل إلى القضية');
        return;
      }

      if (!res.ok) {
        setErrorMessage(data.error || 'فشل ربط المركبة بالقضية');
      } else {
        setLinkSuccess(true);
        if (onVehicleLinked) {
          onVehicleLinked(data.linkedParty || scanResult.autoFill);
        }
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error("Link error:", err);
      setErrorMessage('خطأ أثناء حفظ البيانات وتعبئتها تلقائياً');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 text-right font-sans" dir="rtl" id="VEHICLE_QR_SCANNER_MODAL">
      <div className="bg-[#21272E] border border-[#3A434C] rounded-3xl w-full max-w-lg p-6 text-white space-y-5 shadow-2xl relative overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#3A434C] pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-950 border border-blue-800 text-blue-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <span>الربط والتعبئة التلقائية للمركبة</span>
                {caseId && (
                  <span className="text-[10px] bg-blue-900/60 text-blue-300 font-mono px-2 py-0.5 rounded-full border border-blue-700">
                    {caseId}
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">مسح ملصق QR أو البحث اليدوي لجلب البيانات وتعبئة الحقول فوراً</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex bg-[#161B22] p-1 rounded-2xl border border-[#3A434C] shrink-0">
          <button
            type="button"
            onClick={() => { setActiveTab('QR_SCAN'); setErrorMessage(''); setDuplicateMessage(''); setScanResult(null); }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'QR_SCAN' ? 'bg-[#315EF5] text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>مسح عبر QR المركبة</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('MANUAL_LOOKUP'); setErrorMessage(''); setDuplicateMessage(''); setScanResult(null); }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'MANUAL_LOOKUP' ? 'bg-[#315EF5] text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>البحث بدون QR (بحث يدوي)</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="overflow-y-auto space-y-4 pr-1">
          {activeTab === 'QR_SCAN' ? (
            <div className="space-y-3">
              {/* Camera Simulation View */}
              <div className="bg-[#161B22] p-4 rounded-2xl border border-[#3A434C] text-center space-y-3 relative">
                <div className="w-14 h-14 rounded-full bg-blue-950/70 border border-blue-500/50 text-blue-400 flex items-center justify-center mx-auto shadow-inner animate-pulse">
                  <Camera className="w-7 h-7" />
                </div>
                <p className="text-xs text-slate-300 font-bold">وجه كاميرا الهاتف نحو ملصق QR المعتمد على الزجاج الأمامي للمركبة</p>

                <div className="pt-1 flex flex-wrap gap-2 text-xs">
                  <span className="text-[10px] text-slate-400 block w-full text-right font-medium">أمثلة سريعة لاختبار الكاميرا:</span>
                  <button
                    type="button"
                    onClick={() => handleScanToken('5-9821-99')}
                    className="flex-1 py-1.5 bg-[#21272E] hover:bg-blue-600/30 text-blue-300 border border-blue-800 rounded-xl font-mono text-[11px] cursor-pointer"
                  >
                    5-9821-99
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScanToken('3-1102-90')}
                    className="flex-1 py-1.5 bg-[#21272E] hover:bg-blue-600/30 text-blue-300 border border-blue-800 rounded-xl font-mono text-[11px] cursor-pointer"
                  >
                    3-1102-90
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScanToken('8-4420-11')}
                    className="flex-1 py-1.5 bg-[#21272E] hover:bg-blue-600/30 text-blue-300 border border-blue-800 rounded-xl font-mono text-[11px] cursor-pointer"
                  >
                    8-4420-11
                  </button>
                </div>
              </div>

              {/* Direct Token Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="أدخل الرمز المرجعي أو رقم اللوحة..."
                  className="flex-1 p-2.5 bg-[#161B22] border border-[#3A434C] text-white rounded-xl text-xs font-mono focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleScanToken()}
                  disabled={isSearching}
                  id="VEHICLE_QR_SCAN_BTN"
                  className="px-4 py-2.5 bg-[#315EF5] hover:bg-blue-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <Search className="w-4 h-4" />
                  <span>{isSearching ? 'جاري المسح...' : 'فحص QR'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Manual Search Form */
            <form onSubmit={handleManualLookup} className="space-y-3 bg-[#161B22] p-4 rounded-2xl border border-[#3A434C]">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">نوع البحث:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                  {[
                    { id: 'plate', label: 'رقم اللوحة' },
                    { id: 'policy', label: 'رقم الوثيقة' },
                    { id: 'chassis', label: 'رقم الشاصي' },
                    { id: 'id', label: 'رقم الهوية' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSearchType(type.id as any)}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                        searchType === type.id
                          ? 'bg-blue-900/80 border-blue-500 text-white'
                          : 'bg-[#21272E] border-[#3A434C] text-slate-400 hover:text-white'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">
                  {searchType === 'plate' && 'رقم اللوحة (مثال: 5-9821-99 أو 7-1234-56):'}
                  {searchType === 'policy' && 'رقم وثيقة التأمين (مثال: POL-2026-8819):'}
                  {searchType === 'chassis' && 'رقم الشاصي / VIN (مثال: KMHJW81BDNU123456):'}
                  {searchType === 'id' && 'رقم الهوية الوطنية (مثال: 987654321):'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="أدخل قيمة البحث هنا..."
                    className="flex-1 p-2.5 bg-[#21272E] border border-[#3A434C] text-white font-mono rounded-xl text-xs focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="px-4 py-2.5 bg-[#315EF5] hover:bg-blue-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-lg shrink-0"
                  >
                    <Search className="w-4 h-4" />
                    <span>{isSearching ? 'جاري البحث...' : 'بحث بالنظام'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-rose-950/90 border border-rose-700 text-rose-200 p-3.5 rounded-2xl text-xs space-y-1 shadow-xl animate-fade-in" id="QR_ERROR_BANNER">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <strong className="font-black text-rose-200">نتيجة البحث / التنبيه:</strong>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">{errorMessage}</p>
            </div>
          )}

          {/* Duplicate Vehicle Warning Banner */}
          {duplicateMessage && (
            <div className="bg-amber-950/90 border border-amber-600 text-amber-200 p-3.5 rounded-2xl text-xs space-y-2 shadow-xl animate-fade-in" id="VEHICLE_DUPLICATE_BANNER">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-amber-400 shrink-0" />
                <strong className="font-black text-amber-300 text-xs">تنبيه تكرار المركبة!</strong>
              </div>
              <p className="text-amber-100 text-[11px] font-medium leading-relaxed">{duplicateMessage}</p>
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-amber-800 hover:bg-amber-700 text-white rounded-xl text-[11px] font-bold cursor-pointer"
                >
                  الرجوع وعرض بيانات المركبة المضافة
                </button>
              </div>
            </div>
          )}

          {/* Found Confirmation Screen ("تم العثور على المركبة") */}
          {scanResult && scanResult.valid && scanResult.autoFill && (
            <div className="bg-[#161B22] p-4 rounded-2xl border border-[#3A434C] space-y-4 animate-fade-in shadow-inner">
              {/* Header Confirmation Banner */}
              <div className="flex items-center justify-between pb-3 border-b border-[#3A434C]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="font-black text-xs text-emerald-300">تم العثور على المركبة الموثقة ✓</h4>
                    <span className="text-[10px] text-slate-400">مصدر البيانات: قاعدة بيانات التأمين المركزية</span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                  scanResult.reason === 'POLICY_EXPIRED'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {scanResult.policyStatusBadge || 'الوثيقة فعالة ✓'}
                </span>
              </div>

              {/* Data Summary Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs bg-[#21272E] p-3 rounded-xl border border-[#3A434C]">
                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] block font-bold">رقم اللوحة:</span>
                  <strong className="text-blue-400 font-mono text-sm block font-black">{scanResult.autoFill.plate_number}</strong>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] block font-bold">نوع وطراز المركبة:</span>
                  <strong className="text-white text-xs block font-bold">
                    {scanResult.autoFill.make} {scanResult.autoFill.model} ({scanResult.autoFill.model_year})
                  </strong>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] block font-bold">اسم المؤمن له / المالك:</span>
                  <strong className="text-emerald-300 text-xs block font-bold">{scanResult.autoFill.insured_name}</strong>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] block font-bold">رقم الهوية:</span>
                  <strong className="text-slate-200 font-mono text-xs block">{scanResult.autoFill.identification_number}</strong>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] block font-bold">شركة التأمين:</span>
                  <strong className="text-slate-200 text-xs block">{scanResult.autoFill.insurance_company_name}</strong>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] block font-bold">رقم الوثيقة:</span>
                  <strong className="text-amber-300 font-mono text-xs block">{scanResult.autoFill.policy_number}</strong>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] block font-bold">رقم الشاصي / VIN:</span>
                  <strong className="text-slate-300 font-mono text-[11px] block">{scanResult.autoFill.chassis_number}</strong>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] block font-bold">نوع التغطية:</span>
                  <strong className="text-indigo-300 text-[11px] block">{scanResult.autoFill.policy_type}</strong>
                </div>
              </div>

              {/* Role Selection inside Case */}
              <div className="space-y-2 pt-1 border-t border-[#3A434C]">
                <label className="text-[11px] font-black text-amber-300 block flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>حدد صفة المركبة / الطرف في القضية الحالية:</span>
                </label>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'INSURED_VEHICLE', title: 'مركبة المؤمن له', sub: 'الطرف الأول بالوثيقة' },
                    { id: 'THIRD_PARTY_VEHICLE', title: 'مركبة الطرف الآخر', sub: 'المعترضة أو المتضررة' },
                    { id: 'ADDITIONAL_VEHICLE', title: 'مركبة إضافية', sub: 'طرف ثالث أو رابع' },
                    { id: 'WITNESS_VEHICLE', title: 'مركبة شاهد / جهة أخرى', sub: 'توثيق بدون مطالبة' }
                  ].map((role) => (
                    <label
                      key={role.id}
                      className={`p-2.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                        selectedRole === role.id
                          ? 'bg-blue-950/80 border-blue-500 ring-1 ring-blue-400'
                          : 'bg-[#21272E] border-[#3A434C] hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="vehicleRole"
                          value={role.id}
                          checked={selectedRole === role.id}
                          onChange={() => setSelectedRole(role.id as any)}
                          className="text-blue-500 focus:ring-0 cursor-pointer"
                        />
                        <span className="font-bold text-xs text-white">{role.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 pr-5">{role.sub}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Auto-Fill & Link Button */}
              <div className="pt-2">
                {linkSuccess ? (
                  <div className="bg-emerald-950 text-emerald-300 p-3 rounded-xl border border-emerald-800 text-center font-black text-xs flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>تم ربط المركبة بالقضية وتعبئة الحقول بنجاح!</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleConfirmAndLink}
                    id="VEHICLE_LINK_TO_CASE_BTN"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer active:scale-98"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-200 animate-spin" />
                    <span>تأكيد وإضافة إلى القضية وتعبئة الحقول تلقائياً</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end border-t border-[#3A434C] pt-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            إلغاء وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
