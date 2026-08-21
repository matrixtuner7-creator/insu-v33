import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Eye, 
  RefreshCcw, 
  Car, 
  User, 
  MapPin, 
  Shield, 
  DollarSign, 
  Printer, 
  ExternalLink,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Accident } from '../types';

interface ArchiveManagerProps {
  accidents: Accident[];
  onSelectAccident: (accident: Accident) => void;
  onReopenAccident?: (accidentId: string) => void;
}

export const ArchiveManager: React.FC<ArchiveManagerProps> = ({
  accidents,
  onSelectAccident,
  onReopenAccident
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedClaimStatus, setSelectedClaimStatus] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedArchivedCase, setSelectedArchivedCase] = useState<Accident | null>(null);

  // Filter archived cases (status === 'مكتمل' or 'مغلق' or any past cases)
  const archivedAccidents = useMemo(() => {
    // If the database has closed/completed cases, prioritize them, but also allow viewing all historical cases
    return accidents.filter(acc => {
      const isClosedOrCompleted = acc.status === 'مكتمل' || acc.status === 'مغلق';
      // In case user wants to see all historical records or specifically completed ones
      return isClosedOrCompleted || true;
    });
  }, [accidents]);

  const filteredList = useMemo(() => {
    return archivedAccidents.filter(acc => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNum = (acc.accidentNumber || '').toLowerCase().includes(q);
        const matchPlate = (acc.vehiclePlate || '').toLowerCase().includes(q);
        const matchDriver = (acc.driverName || '').toLowerCase().includes(q);
        const matchDriverId = (acc.driverId || '').includes(q);
        const matchLoc = (acc.locationName || '').toLowerCase().includes(q);
        const matchAgent = (acc.assignedAgentName || '').toLowerCase().includes(q);
        if (!matchNum && !matchPlate && !matchDriver && !matchDriverId && !matchLoc && !matchAgent) {
          return false;
        }
      }

      // Severity
      if (selectedSeverity !== 'all' && acc.severity !== selectedSeverity) {
        return false;
      }

      // Category
      if (selectedCategory !== 'all' && acc.incidentCategory !== selectedCategory) {
        return false;
      }

      // Claim Status
      if (selectedClaimStatus !== 'all' && acc.insuranceClaimStatus !== selectedClaimStatus) {
        return false;
      }

      // Date Range
      if (dateFrom && new Date(acc.timestamp) < new Date(dateFrom)) {
        return false;
      }
      if (dateTo && new Date(acc.timestamp) > new Date(dateTo + 'T23:59:59')) {
        return false;
      }

      return true;
    });
  }, [archivedAccidents, searchQuery, selectedSeverity, selectedCategory, selectedClaimStatus, dateFrom, dateTo]);

  // Export to Excel
  const handleExportExcel = () => {
    const dataToExport = filteredList.map(acc => ({
      'رقم القضية': acc.accidentNumber || acc.id,
      'تاريخ ووقت الحادث': new Date(acc.timestamp).toLocaleString('ar-EG'),
      'نوع الحادث': acc.incidentCategory || 'حوادث مركبات',
      'التصنيف الفرعي': acc.incidentSubtype || 'تصادم',
      'درجة الخطورة': acc.severity,
      'حالة القضية': acc.status,
      'رقم اللوحة': acc.vehiclePlate,
      'اسم السائق/المؤمن له': acc.driverName,
      'رقم الهوية': acc.driverId,
      'الموقع': acc.locationName,
      'المحقق الميداني': acc.assignedAgentName || 'غير محدد',
      'حالة مطالبة التأمين': acc.insuranceClaimStatus,
      'المبلغ المقدر للخسائر (شيكل)': acc.financialEstimates?.estimatedLossAmount || acc.financialEstimates?.finalApprovedAmount || 'غير مسجل',
      'عدد الصور المرفقة': acc.photos?.length || 0,
      'ملاحظات ووصف الحادث': acc.description
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'أرشيف القضايا');
    XLSX.writeFile(wb, `ارشيف_القضايا_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Banner */}
      <div className="bg-[#2A323A]/90 border border-[#3A434C] backdrop-blur-xl rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#315EF5]/20 to-[#22A06B]/20 border border-white/10 rounded-2xl flex items-center justify-center text-[#315EF5] shadow-inner">
            <History className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-[#F1F5F9]">أرشيف القضايا والملفات المنتهية</h2>
              <span className="px-3 py-0.5 bg-[#315EF5]/20 text-[#315EF5] border border-[#315EF5]/30 rounded-full text-xs font-black">
                {filteredList.length} ملف مؤرشف
              </span>
            </div>
            <p className="text-xs text-[#AAB2BA] font-bold mt-1">
              البحث الشامل والمراجعة والتوثيق القانوني لكافة قضايا الحوادث والمعاينات المنجزة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-[#22A06B] hover:bg-[#1b8558] text-white rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-[#22A06B]/20 transition-all cursor-pointer border border-white/10"
          >
            <Download className="w-4 h-4" />
            <span>تصدير إلى إكسل (Excel)</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-[#323A40] hover:bg-[#3A434C] text-[#F1F5F9] border border-[#3A434C] rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الأرشيف</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#2A323A]/80 border border-[#3A434C] backdrop-blur-xl rounded-3xl p-5 shadow-lg space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-[#7C8791] absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم القضية، رقم اللوحة، اسم السائق، رقم الهوية، الموقع..."
              className="w-full pl-4 pr-10 py-2.5 bg-[#161B1F]/70 border border-[#3A434C] rounded-2xl text-xs text-[#F1F5F9] placeholder-[#7C8791] focus:ring-2 focus:ring-[#315EF5] focus:outline-none transition-all"
            />
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#161B1F]/70 border border-[#3A434C] rounded-2xl text-xs text-[#F1F5F9] focus:ring-2 focus:ring-[#315EF5] focus:outline-none"
            >
              <option value="all">كافة درجات الخطورة</option>
              <option value="حرج">حرج</option>
              <option value="بليغ">بليغ</option>
              <option value="متوسط">متوسط</option>
              <option value="خفيف">خفيف</option>
            </select>
          </div>

          {/* Insurance Claim Status */}
          <div>
            <select
              value={selectedClaimStatus}
              onChange={(e) => setSelectedClaimStatus(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#161B1F]/70 border border-[#3A434C] rounded-2xl text-xs text-[#F1F5F9] focus:ring-2 focus:ring-[#315EF5] focus:outline-none"
            >
              <option value="all">كافة حالات المطالبة التأمينية</option>
              <option value="معتمد">معتمد</option>
              <option value="قيد التسوية">قيد التسوية</option>
              <option value="مرفق المستندات">مرفق المستندات</option>
              <option value="معلق">معلق</option>
              <option value="مرفوض">مرفوض</option>
            </select>
          </div>
        </div>

        {/* Date Range Row */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-[#3A434C]/50 text-xs text-[#AAB2BA]">
          <span className="flex items-center gap-1 font-bold">
            <Calendar className="w-3.5 h-3.5 text-[#315EF5]" />
            <span>نطاق التاريخ:</span>
          </span>
          <div className="flex items-center gap-2">
            <label className="text-[11px]">من:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-2.5 py-1.5 bg-[#161B1F]/70 border border-[#3A434C] rounded-xl text-xs text-[#F1F5F9] focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[11px]">إلى:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-2.5 py-1.5 bg-[#161B1F]/70 border border-[#3A434C] rounded-xl text-xs text-[#F1F5F9] focus:outline-none"
            />
          </div>
          {(dateFrom || dateTo || searchQuery || selectedSeverity !== 'all' || selectedClaimStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSeverity('all');
                setSelectedClaimStatus('all');
                setDateFrom('');
                setDateTo('');
              }}
              className="mr-auto px-3 py-1 bg-[#D64545]/15 text-[#D64545] hover:bg-[#D64545]/25 rounded-xl font-bold transition-all cursor-pointer"
            >
              إعادة ضبط الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* Archived Cases Table */}
      <div className="bg-[#2A323A]/90 border border-[#3A434C] backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#161B1F]/80 text-[#AAB2BA] font-bold border-b border-[#3A434C]">
              <tr>
                <th className="p-3.5">رقم القضية</th>
                <th className="p-3.5">التاريخ والوقت</th>
                <th className="p-3.5">نوع الحادث</th>
                <th className="p-3.5">المركبة والسائق</th>
                <th className="p-3.5">الموقع</th>
                <th className="p-3.5">المحقق</th>
                <th className="p-3.5">الخطورة</th>
                <th className="p-3.5">المطالبة التأمينية</th>
                <th className="p-3.5">الحالة</th>
                <th className="p-3.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A434C]/50">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-[#AAB2BA]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <History className="w-10 h-10 text-[#7C8791]" />
                      <p className="font-bold text-sm text-[#F1F5F9]">لا توجد قضايا مطابقة في الأرشيف</p>
                      <p className="text-xs text-[#7C8791]">جرّب تغيير كلمات البحث أو إعادة ضبط خيارات التصفية</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((acc) => (
                  <tr key={acc.id} className="hover:bg-[#323A40]/80 transition-all font-medium text-[#F1F5F9]">
                    <td className="p-3.5 font-mono font-bold text-[#315EF5] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#315EF5]" />
                      <span>{acc.accidentNumber || acc.incidentNumber || acc.id}</span>
                    </td>
                    <td className="p-3.5 text-[#AAB2BA]">
                      {new Date(acc.timestamp).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="p-3.5 font-bold">
                      {acc.incidentCategory || 'حوادث مركبات'}
                      <span className="block text-[10px] text-[#AAB2BA] font-normal">{acc.incidentSubtype || 'تصادم'}</span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-[#F1F5F9]">{acc.driverName || 'غير مسجل'}</div>
                      <span className="font-mono text-[10px] text-[#D6A83A] bg-[#D6A83A]/10 px-1.5 py-0.5 rounded border border-[#D6A83A]/20">
                        {acc.vehiclePlate || 'بدون لوحة'}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#AAB2BA] max-w-[160px] truncate">
                      📍 {acc.locationName}
                    </td>
                    <td className="p-3.5 font-bold text-xs text-[#22A06B]">
                      {acc.assignedAgentName || '⚠️ غير محدد'}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        acc.severity === 'حرج' || acc.severity === 'حرج جداً'
                          ? 'bg-[#D64545]/20 text-[#D64545] border border-[#D64545]/30'
                          : 'bg-[#D6A83A]/20 text-[#D6A83A] border border-[#D6A83A]/30'
                      }`}>
                        {acc.severity}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-[#315EF5]/15 text-[#315EF5] border border-[#315EF5]/30 rounded-lg text-[10px] font-bold">
                        {acc.insuranceClaimStatus || 'معلق'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-[#22A06B]/20 text-[#22A06B] border border-[#22A06B]/30 rounded-lg text-[10px] font-bold flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{acc.status}</span>
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onSelectAccident(acc)}
                          className="px-3 py-1.5 bg-[#315EF5] hover:bg-[#2549d4] text-white font-bold rounded-xl text-xs transition-all shadow flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>عرض كامل الملف</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
