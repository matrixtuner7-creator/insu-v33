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
    const query = (claimSearch || '').trim().toLowerCase();
    const found = accidents.find(a => ((a.accidentNumber || a.id || '').toLowerCase()).includes(query));
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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fadeIn text-[#F1F5F9]" dir="rtl">
      <div className="bg-[#161B1F] border border-[#3A434C] rounded-2xl p-6 text-[#F1F5F9] shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#315EF5] rounded-2xl flex items-center justify-center shadow-lg shadow-black/30">
            <UserCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-[#F1F5F9]">بوابة المؤمن له / العميل (Customer Portal)</h2>
            <p className="text-xs text-[#AAB2BA] mt-0.5">متابعة حالة التبليغ لحظياً، رفع المستندات المطلوبة، واستقبال توجيهات المحقق الميداني</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#2A323A] rounded-2xl p-6 border border-[#3A434C] shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#F1F5F9]">البحث برقم البلاغ / القسيمة (مثل CLM-2026-XXXX)</h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-[#7C8791]" />
            <input
              type="text"
              value={claimSearch}
              onChange={e => setClaimSearch(e.target.value)}
              placeholder="أدخل رقم البلاغ أو القسيمة..."
              className="w-full pr-10 pl-4 py-3 rounded-xl border border-[#3A434C] bg-[#323A40] text-[#F1F5F9] placeholder-[#7C8791] text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#315EF5]"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-[#315EF5] hover:bg-[#2549d4] text-white rounded-xl text-xs font-bold shadow-md transition-all shrink-0 cursor-pointer"
          >
            بحث ومتابعة
          </button>
        </form>

        {searchError && (
          <div className="p-3 bg-[#D64545]/15 border border-[#D64545]/30 text-[#D64545] rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{searchError}</span>
          </div>
        )}
      </div>

      {currentAccident && (
        <div className="bg-[#2A323A] rounded-2xl p-6 md:p-8 border border-[#3A434C] shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-[#3A434C] gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black bg-[#315EF5]/20 text-[#315EF5] px-3 py-1 rounded-full border border-[#315EF5]/30">
                  {currentAccident.accidentNumber}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  currentAccident.status === 'قيد التحقيق' || currentAccident.status === 'قيد المعاينة' ? 'bg-[#D6A83A]/20 text-[#D6A83A] border border-[#D6A83A]/30' :
                  currentAccident.status === 'مكتمل' || currentAccident.status === 'مغلقة' ? 'bg-[#22A06B]/20 text-[#22A06B] border border-[#22A06B]/30' :
                  'bg-[#315EF5]/20 text-[#315EF5] border border-[#315EF5]/30'
                }`}>
                  {currentAccident.status}
                </span>
              </div>
              <h4 className="text-base font-black text-[#F1F5F9] mt-2">{currentAccident.locationName}</h4>
            </div>
            <div className="text-left">
              <span className="text-[11px] text-[#AAB2BA] block">حالة المطالبة التأمينية:</span>
              <span className="text-xs font-bold text-[#22A06B] bg-[#22A06B]/15 px-3 py-1 rounded-lg border border-[#22A06B]/30 inline-block mt-0.5">
                {currentAccident.insuranceClaimStatus}
              </span>
            </div>
          </div>

          {/* Investigator Assigned Box */}
          <div className="bg-[#323A40] p-4 rounded-xl border border-[#3A434C] space-y-2 text-xs">
            <div className="font-bold text-[#F1F5F9] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#22A06B]" />
              <span>المحقق الميداني المسؤول:</span>
            </div>
            <div className="text-[#F1F5F9] font-semibold">
              {currentAccident.assignedAgentName ? currentAccident.assignedAgentName : 'جاري تعيين محقق ميداني من قبل الإدارة المركزية...'}
            </div>
            <p className="text-[11px] text-[#AAB2BA]">
              المطلوب من العميل: تجهيز رخصة القيادة، استمارة المركبة، وتوفير أي صور أو مستندات إضافية عبر قسم رفع المستندات أدناه.
            </p>
          </div>

          {uploadNotice && (
            <div className="p-3 bg-[#22A06B]/15 text-[#22A06B] border border-[#22A06B]/30 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#22A06B]" />
              <span>تم رفع وإرفاق المستند بنجاح إلى ملف القضية لدى الإدارة والمحقق!</span>
            </div>
          )}

          {/* Upload Documents */}
          <div className="space-y-3">
            <h5 className="font-bold text-[#F1F5F9] text-xs flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-[#315EF5]" />
              <span>رفع المستندات الإضافية أو الصور ({currentAccident.photos.length} مرفقة)</span>
            </h5>
            <div className="flex gap-2">
              <select
                value={newDocUrl}
                onChange={e => setNewDocUrl(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-[#3A434C] bg-[#323A40] text-[#F1F5F9] text-xs focus:outline-none focus:ring-2 focus:ring-[#315EF5]"
              >
                <option value="">اختر مستنداً أو صورة للإرسال...</option>
                <option value="https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80">صورة رخصة القيادة واستمارة السيارة</option>
                <option value="https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=600&q=80">صورة الأضرار الجانبية</option>
                <option value="https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80">صورة محضر المرور المبدئي</option>
              </select>
              <button
                type="button"
                onClick={handleAddDoc}
                className="px-5 py-3 bg-[#22A06B] hover:bg-[#1b8558] text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer"
              >
                إرسال للمحقق
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {currentAccident.photos.map((p, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden border border-[#3A434C] h-24 bg-[#161B1F]">
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
