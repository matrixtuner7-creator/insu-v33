import React, { useState } from 'react';
import { Accident } from '../types';
import { UserCheck, Search, FileText, CheckCircle2, Clock, Upload, ShieldCheck, AlertCircle } from 'lucide-react';

interface CustomerPortalProps {
  accidents: Accident[];
  onUpdateAccidentDocs: (accidentId: string, newPhotos: string[]) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  accidents,
  onUpdateAccidentDocs,
}) => {
  const [claimSearch, setClaimSearch] = useState('CLM-2026-');
  const [currentAccident, setCurrentAccident] = useState<Accident | null>(accidents[0] || null);
  const [searchError, setSearchError] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [uploadNotice, setUploadNotice] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = accidents.find(a => a.accidentNumber.toLowerCase().includes(claimSearch.trim().toLowerCase()));
    if (found) {
      setCurrentAccident(found);
      setSearchError('');
    } else {
      setSearchError('لم يتم العثور على بلاغ بهذا الرقم. تأكد من صحة رقم القسيمة.');
    }
  };

  const handleAddDoc = () => {
    if (!currentAccident || !newDocUrl) return;
    const updatedPhotos = [...currentAccident.photos, newDocUrl];
    onUpdateAccidentDocs(currentAccident.id, updatedPhotos);
    setCurrentAccident({ ...currentAccident, photos: updatedPhotos });
    setNewDocUrl('');
    setUploadNotice(true);
    setTimeout(() => setUploadNotice(false), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-emerald-900 rounded-2xl p-6 text-white shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <UserCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black">بوابة المؤمن له / العميل (Customer Portal)</h2>
            <p className="text-xs text-emerald-200 mt-0.5">متابعة حالة التبليغ لحظياً، رفع المستندات المطلوبة، واستقبال توجيهات المحقق الميداني</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">البحث برقم البلاغ / القسيمة (مثل CLM-2026-XXXX)</h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={claimSearch}
              onChange={e => setClaimSearch(e.target.value)}
              placeholder="أدخل رقم البلاغ أو القسيمة..."
              className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all shrink-0"
          >
            بحث ومتابعة
          </button>
        </form>

        {searchError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{searchError}</span>
          </div>
        )}
      </div>

      {currentAccident && (
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
                  {currentAccident.accidentNumber}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  currentAccident.status === 'قيد التحقيق' ? 'bg-amber-100 text-amber-800' :
                  currentAccident.status === 'مكتمل' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {currentAccident.status}
                </span>
              </div>
              <h4 className="text-base font-black text-slate-900 mt-2">{currentAccident.locationName}</h4>
            </div>
            <div className="text-left">
              <span className="text-[11px] text-slate-400 block">حالة المطالبة التأمينية:</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 inline-block mt-0.5">
                {currentAccident.insuranceClaimStatus}
              </span>
            </div>
          </div>

          {/* Investigator Assigned Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>المحقق الميداني المسؤول:</span>
            </div>
            <div className="text-slate-700 font-semibold">
              {currentAccident.assignedAgentName ? currentAccident.assignedAgentName : 'جاري تعيين محقق ميداني من قبل الإدارة المركزية...'}
            </div>
            <p className="text-[11px] text-slate-500">
              المطلوب من العميل: تجهيز رخصة القيادة، استمارة المركبة، وتوفير أي صور أو مستندات إضافية عبر قسم رفع المستندات أدناه.
            </p>
          </div>

          {uploadNotice && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>تم رفع وإرفاق المستند بنجاح إلى ملف القضية لدى الإدارة والمحقق!</span>
            </div>
          )}

          {/* Upload Documents */}
          <div className="space-y-3">
            <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>رفع المستندات الإضافية أو الصور ({currentAccident.photos.length} مرفقة)</span>
            </h5>
            <div className="flex gap-2">
              <select
                value={newDocUrl}
                onChange={e => setNewDocUrl(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-xs"
              >
                <option value="">اختر مستنداً أو صورة للإرسال...</option>
                <option value="https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80">صورة رخصة القيادة واستمارة السيارة</option>
                <option value="https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=600&q=80">صورة الأضرار الجانبية</option>
                <option value="https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80">صورة محضر المرور المبدئي</option>
              </select>
              <button
                type="button"
                onClick={handleAddDoc}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0"
              >
                إرسال للمحقق
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {currentAccident.photos.map((p, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 h-24">
                  <img src={p} alt={`مستند ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
