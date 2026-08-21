import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Search, 
  Printer, 
  Download, 
  Ban, 
  CheckCircle2, 
  RefreshCw, 
  Plus, 
  ShieldAlert, 
  Filter, 
  SlidersHorizontal, 
  Calendar, 
  Car, 
  FileText, 
  Eye, 
  Settings, 
  AlertTriangle, 
  Building2, 
  X, 
  Sparkles,
  Layers,
  Clock,
  Activity,
  CheckSquare,
  Square
} from 'lucide-react';
import { VehicleQrCode, QrSystemSettings } from '../../types';
import { QrCodeGenerator } from './QrCodeGenerator';

interface VehicleQrManagerProps {
  onClose?: () => void;
}

export const VehicleQrManager: React.FC<VehicleQrManagerProps> = ({ onClose }) => {
  const [qrList, setQrList] = useState<VehicleQrCode[]>([]);
  const [stats, setStats] = useState<any>({});
  const [settings, setSettings] = useState<QrSystemSettings>({
    enableVehicleQr: true,
    enableIncidentQr: true,
    allowStickerPrinting: true,
    incidentQrExpiryDays: 30,
    qrUsageMode: 'OPTIONAL'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [policyStatusFilter, setPolicyStatusFilter] = useState('ALL');
  const [qrStatusFilter, setQrStatusFilter] = useState('ALL');

  // Modals state
  const [selectedQr, setSelectedQr] = useState<VehicleQrCode | null>(null);
  const [liveVehicleQr, setLiveVehicleQr] = useState<VehicleQrCode | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Batch selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string>('');

  // New vehicle form state
  const [newPlate, setNewPlate] = useState('7-2201-98');
  const [newModel, setNewModel] = useState('مرسيدس بنز E200 2023');
  const [newPolicy, setNewPolicy] = useState('POL-2026-9912');
  const [newCompany, setNewCompany] = useState('شركة المشرق للتأمين');
  const [newExpires, setNewExpires] = useState('2026-12-31');

  // Fetch QRs and stats
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [listRes, statsRes, settingsRes] = await Promise.all([
        fetch('/api/qr/vehicle/list'),
        fetch('/api/qr/stats'),
        fetch('/api/qr/settings')
      ]);

      if (listRes.ok) setQrList(await listRes.ok ? await listRes.json() : []);
      if (statsRes.ok) setStats(await statsRes.json());
      if (settingsRes.ok) setSettings(await settingsRes.json());
    } catch (err) {
      console.warn("Failed fetching QR data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered List
  const filteredQrs = qrList.filter(item => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchPlate = item.vehiclePlate.toLowerCase().includes(q);
      const matchPolicy = (item.policyNumber || '').toLowerCase().includes(q);
      const matchOwner = (item.customerName || '').toLowerCase().includes(q);
      if (!matchPlate && !matchPolicy && !matchOwner) return false;
    }

    if (companyFilter !== 'ALL' && item.insuranceCompanyName !== companyFilter) return false;
    if (qrStatusFilter !== 'ALL' && item.status !== qrStatusFilter) return false;

    if (policyStatusFilter !== 'ALL') {
      const isExp = item.policyExpiresAt ? new Date(item.policyExpiresAt) < new Date() : false;
      if (policyStatusFilter === 'ACTIVE' && isExp) return false;
      if (policyStatusFilter === 'EXPIRED' && !isExp) return false;
    }

    return true;
  });

  // Action helper (Revoke, Suspend, Activate, Reissue)
  const handleQrAction = async (qrId: string, vehiclePlate: string, action: string) => {
    try {
      const res = await fetch('/api/qr/vehicle/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrId, vehiclePlate, action, adminUser: 'إدارة النظام' })
      });

      if (res.ok) {
        const data = await res.json();
        setActionSuccessMsg(data.message || 'تم تحديث حالة رمز QR بنجاح');
        setTimeout(() => setActionSuccessMsg(''), 4000);
        fetchData();
      }
    } catch (err) {
      console.error("Action error:", err);
    }
  };

  // Create / Reissue new Vehicle QR
  const handleCreateQr = async () => {
    if (!newPlate || !newPolicy) return;
    try {
      const res = await fetch('/api/qr/vehicle/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehiclePlate: newPlate,
          vehicleModel: newModel,
          policyNumber: newPolicy,
          insuranceCompanyName: newCompany,
          policyExpiresAt: newExpires,
          createdBy: 'إدارة والمركبات'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setActionSuccessMsg(`تم إنشاء QR بنجاح للمركبة (${newPlate}) - المعرف: ${data.qrRecord?.tokenReference}`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
        setShowCreateModal(false);
        fetchData();
      }
    } catch (err) {
      console.error("Generate QR error:", err);
    }
  };

  // Toggle selection
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredQrs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredQrs.map(q => q.id));
    }
  };

  const printableItems = qrList.filter(q => selectedIds.length > 0 ? selectedIds.includes(q.id) : selectedQr ? selectedQr.id === q.id : true);

  return (
    <div className="bg-[#1C2229] min-h-screen text-white p-4 sm:p-6 space-y-6 text-right font-sans" dir="rtl" id="VEHICLE_QR_MANAGER_PAGE">
      {/* Toast Banner */}
      {actionSuccessMsg && (
        <div className="bg-emerald-950/90 border border-emerald-600 text-emerald-200 px-4 py-3 rounded-2xl flex items-center justify-between shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold">{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg('')} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#2A323A] p-5 rounded-3xl border border-[#3A434C] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center shrink-0 shadow-inner">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">إدارة رموز QR للمركبات والحوادث</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-950 text-blue-300 border border-blue-800">
                نظام الفحص التأميني الرقمي
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              إصدار وإدارة ملصقات QR الموحدة للمركبات وقضايا الحوادث مع ربط بالتحقيق الميداني والصلاحيات
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="px-3.5 py-2 bg-[#1C2229] hover:bg-[#323a42] text-slate-300 border border-[#3A434C] rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4 text-blue-400" />
            <span>إعدادات النظام</span>
          </button>

          <button
            onClick={() => {
              setSelectedQr(null);
              setShowPrintModal(true);
            }}
            className="px-4 py-2 bg-[#252c34] hover:bg-[#315EF5] text-white border border-[#3A434C] hover:border-[#315EF5] rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>طباعة الملصقات ({selectedIds.length > 0 ? selectedIds.length : 'الكل'})</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            id="VEHICLE_QR_CREATE_BTN"
            className="px-4 py-2 bg-[#315EF5] hover:bg-blue-600 text-white rounded-2xl text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-[#315EF5]/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إصدار QR جديد للمركبة</span>
          </button>

          {onClose && (
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#2A323A] p-4 rounded-2xl border border-[#3A434C] space-y-1">
          <span className="text-[11px] text-slate-400 font-bold block">QR الفعالة</span>
          <div className="flex items-center justify-between">
            <strong className="text-xl font-black text-emerald-400 font-mono">{stats.activeQrCount || qrList.filter(q => q.status === 'ACTIVE').length}</strong>
            <CheckCircle2 className="w-5 h-5 text-emerald-500/80" />
          </div>
        </div>

        <div className="bg-[#2A323A] p-4 rounded-2xl border border-[#3A434C] space-y-1">
          <span className="text-[11px] text-slate-400 font-bold block">لم تُستخدم بعد</span>
          <div className="flex items-center justify-between">
            <strong className="text-xl font-black text-blue-400 font-mono">{stats.unusedQrCount || 0}</strong>
            <Clock className="w-5 h-5 text-blue-400/80" />
          </div>
        </div>

        <div className="bg-[#2A323A] p-4 rounded-2xl border border-[#3A434C] space-y-1">
          <span className="text-[11px] text-slate-400 font-bold block">الموقوفة مؤقتاً</span>
          <div className="flex items-center justify-between">
            <strong className="text-xl font-black text-amber-400 font-mono">{stats.suspendedQrCount || qrList.filter(q => q.status === 'SUSPENDED').length}</strong>
            <Ban className="w-5 h-5 text-amber-400/80" />
          </div>
        </div>

        <div className="bg-[#2A323A] p-4 rounded-2xl border border-[#3A434C] space-y-1">
          <span className="text-[11px] text-slate-400 font-bold block">وثائق منتهية</span>
          <div className="flex items-center justify-between">
            <strong className="text-xl font-black text-red-400 font-mono">{stats.expiredPolicyQrCount || 1}</strong>
            <AlertTriangle className="w-5 h-5 text-red-400/80" />
          </div>
        </div>

        <div className="bg-[#2A323A] p-4 rounded-2xl border border-[#3A434C] space-y-1">
          <span className="text-[11px] text-slate-400 font-bold block">مسح اليوم</span>
          <div className="flex items-center justify-between">
            <strong className="text-xl font-black text-indigo-400 font-mono">{stats.todayScansCount || 34}</strong>
            <Activity className="w-5 h-5 text-indigo-400/80" />
          </div>
        </div>

        <div className="bg-[#2A323A] p-4 rounded-2xl border border-[#3A434C] space-y-1">
          <span className="text-[11px] text-slate-400 font-bold block">مسح مرفوض / تالف</span>
          <div className="flex items-center justify-between">
            <strong className="text-xl font-black text-rose-400 font-mono">{stats.failedScansCount || 0}</strong>
            <ShieldAlert className="w-5 h-5 text-rose-400/80" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#2A323A] p-4 rounded-2xl border border-[#3A434C] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          <div className="relative min-w-[220px] flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث برقم اللوحة، المالك، رقم الوثيقة..."
              className="w-full pr-9 pl-3 py-2 bg-[#1C2229] border border-[#3A434C] text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
            />
          </div>

          {/* Company Filter */}
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="px-3 py-2 bg-[#1C2229] border border-[#3A434C] text-white rounded-xl focus:outline-none text-xs"
          >
            <option value="ALL">جميع شركات التأمين</option>
            <option value="شركة المشرق للتأمين">شركة المشرق للتأمين</option>
            <option value="الشركة الوطنية للتأمين">الشركة الوطنية للتأمين</option>
            <option value="شركة فلسطين للتأمين">شركة فلسطين للتأمين</option>
          </select>

          {/* Policy Status Filter */}
          <select
            value={policyStatusFilter}
            onChange={(e) => setPolicyStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#1C2229] border border-[#3A434C] text-white rounded-xl focus:outline-none text-xs"
          >
            <option value="ALL">حالة الوثيقة: الكل</option>
            <option value="ACTIVE">وثائق فعالة</option>
            <option value="EXPIRED">وثائق منتهية</option>
          </select>

          {/* QR Status Filter */}
          <select
            value={qrStatusFilter}
            onChange={(e) => setQrStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#1C2229] border border-[#3A434C] text-white rounded-xl focus:outline-none text-xs"
          >
            <option value="ALL">حالة QR: الكل</option>
            <option value="ACTIVE">فعال</option>
            <option value="SUSPENDED">موقوف</option>
            <option value="REPLACED">تم استبداله</option>
            <option value="REVOKED">ملغى</option>
          </select>
        </div>

        <div className="text-slate-400 text-xs font-bold">
          عدد النتائج: <span className="text-blue-400 font-mono">{filteredQrs.length}</span> مركبة
        </div>
      </div>

      {/* Main Table: "المركبات > رموز QR" */}
      <div className="bg-[#2A323A] rounded-3xl border border-[#3A434C] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-[#1C2229] text-slate-400 border-b border-[#3A434C] font-bold">
                <th className="p-3.5 text-center w-10">
                  <button onClick={toggleSelectAll} className="cursor-pointer text-slate-400 hover:text-white">
                    {selectedIds.length > 0 && selectedIds.length === filteredQrs.length ? (
                      <CheckSquare className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-3.5">رقم اللوحة</th>
                <th className="p-3.5">نوع المركبة</th>
                <th className="p-3.5">المالك</th>
                <th className="p-3.5">شركة التأمين</th>
                <th className="p-3.5">رقم الوثيقة</th>
                <th className="p-3.5">انتهاء الوثيقة</th>
                <th className="p-3.5 text-center">حالة الوثيقة</th>
                <th className="p-3.5 text-center">حالة QR</th>
                <th className="p-3.5">تاريخ الإصدار</th>
                <th className="p-3.5 text-center">مرات المسح</th>
                <th className="p-3.5 text-center">الإجراءات والطباعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A434C]/60 text-slate-200">
              {filteredQrs.length > 0 ? (
                filteredQrs.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const isPolicyExpired = item.policyExpiresAt ? new Date(item.policyExpiresAt) < new Date() : false;

                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-[#252c34] transition-colors ${isSelected ? 'bg-blue-950/30' : ''}`}
                    >
                      <td className="p-3.5 text-center">
                        <button onClick={() => toggleSelect(item.id)} className="cursor-pointer">
                          {isSelected ? <CheckSquare className="w-4 h-4 text-blue-400" /> : <Square className="w-4 h-4 text-slate-600" />}
                        </button>
                      </td>

                      {/* Plate # */}
                      <td className="p-3.5 font-mono font-black text-blue-400">
                        {item.vehiclePlate}
                      </td>

                      {/* Vehicle Model */}
                      <td className="p-3.5 font-bold text-white">
                        {item.vehicleModel || 'مركبة خفيفة'}
                      </td>

                      {/* Owner Name */}
                      <td className="p-3.5 text-slate-300 font-medium">
                        {item.customerName || 'المالك المسجل'}
                      </td>

                      {/* Insurance Company */}
                      <td className="p-3.5 text-slate-300">
                        {item.insuranceCompanyName || 'شركة المشرق للتأمين'}
                      </td>

                      {/* Policy Number */}
                      <td className="p-3.5 font-mono text-slate-300">
                        {item.policyNumber}
                      </td>

                      {/* Expiry Date */}
                      <td className="p-3.5 font-mono text-slate-300">
                        {item.policyExpiresAt || '2026-12-31'}
                      </td>

                      {/* Policy Status Check */}
                      <td className="p-3.5 text-center" id="POLICY_STATUS_CHECK">
                        {isPolicyExpired ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-950 text-red-400 border border-red-800">
                            الوثيقة منتهية
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-400 border border-emerald-800">
                            الوثيقة فعالة ✓
                          </span>
                        )}
                      </td>

                      {/* QR Status */}
                      <td className="p-3.5 text-center">
                        {item.status === 'ACTIVE' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-950 text-blue-300 border border-blue-800">
                            فعال
                          </span>
                        )}
                        {item.status === 'SUSPENDED' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-950 text-amber-300 border border-amber-800">
                            موقوف
                          </span>
                        )}
                        {item.status === 'REPLACED' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-950 text-purple-300 border border-purple-800" id="OLD_QR_BLOCKED">
                            تم استبداله
                          </span>
                        )}
                        {item.status === 'REVOKED' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-950 text-rose-300 border border-rose-800" id="QR_REVOKE">
                            ملغى
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="p-3.5 text-slate-400 text-[11px] font-mono">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('ar-EG') : '2026-01-01'}
                      </td>

                      {/* Scan Count */}
                      <td className="p-3.5 text-center font-mono font-bold text-blue-400">
                        {item.scanCount || 0}
                      </td>

                      {/* Row Actions */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View QR */}
                          <button
                            onClick={() => setSelectedQr(item)}
                            title="عرض تفاصيل QR"
                            className="p-1.5 bg-[#1C2229] hover:bg-blue-600/30 text-blue-400 border border-[#3A434C] rounded-lg transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Print Sticker */}
                          <button
                            onClick={() => {
                              setSelectedQr(item);
                              setShowPrintModal(true);
                            }}
                            title="طباعة ملصق الزجاج"
                            id="VEHICLE_QR_PRINT"
                            className="p-1.5 bg-[#1C2229] hover:bg-emerald-600/30 text-emerald-400 border border-[#3A434C] rounded-lg transition-all cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Live Vehicle with QR Preview */}
                          <button
                            onClick={() => setLiveVehicleQr(item)}
                            title="معاينة حية للمركبة مع QR"
                            className="p-1.5 bg-[#1C2229] hover:bg-purple-600/30 text-purple-400 border border-[#3A434C] rounded-lg transition-all cursor-pointer"
                          >
                            <Car className="w-3.5 h-3.5" />
                          </button>

                          {/* Action toggle (Suspend/Activate) */}
                          {item.status === 'ACTIVE' ? (
                            <button
                              onClick={() => handleQrAction(item.id, item.vehiclePlate, 'SUSPEND')}
                              title="إيقاف مؤقت"
                              className="p-1.5 bg-[#1C2229] hover:bg-amber-600/30 text-amber-400 border border-[#3A434C] rounded-lg transition-all cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          ) : item.status === 'SUSPENDED' ? (
                            <button
                              onClick={() => handleQrAction(item.id, item.vehiclePlate, 'ACTIVATE')}
                              title="إعادة تفعيل"
                              className="p-1.5 bg-[#1C2229] hover:bg-emerald-600/30 text-emerald-400 border border-[#3A434C] rounded-lg transition-all cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          ) : null}

                          {/* Reissue New QR */}
                          <button
                            onClick={() => handleQrAction(item.id, item.vehiclePlate, 'REVOKE')}
                            title="إلغاء QR"
                            id="QR_REISSUE"
                            className="p-1.5 bg-[#1C2229] hover:bg-rose-600/30 text-rose-400 border border-[#3A434C] rounded-lg transition-all cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-500 font-bold">
                    لا توجد رموز QR مطابقة لفلاتر البحث الحالية
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINTABLE STICKER MODAL ("تصميم ملصق QR للطباعة") */}
      {showPrintModal && (
        <div id="print-modal-overlay" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#2A323A] border border-[#3A434C] rounded-3xl w-full max-w-2xl p-6 text-right space-y-5 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#3A434C] pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-base text-white">معاينة وتصدير ملصق QR لزجاج المركبة</h3>
              </div>
              <button onClick={() => setShowPrintModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              تصميم معتمد للصق داخل الزجاج الأمامي للمركبة. لا يحتوي على بيانات شخصية حساسة لحماية الخصوصية.
            </p>

            {/* Sticker Preview Box */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-wrap justify-center gap-6 print:bg-white print:p-0">
              {printableItems.slice(0, 4).map((item) => (
                <div 
                  key={item.id}
                  className="w-72 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-900 border-2 border-blue-500/80 rounded-2xl p-4 shadow-2xl space-y-3 relative overflow-hidden print:border-black print:text-black"
                >
                  {/* Company Header */}
                  <div className="flex items-center justify-between border-b border-blue-500/30 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-blue-400" />
                      <span className="text-[11px] font-black text-blue-300 truncate">
                        {item.insuranceCompanyName || 'شركة المشرق للتأمين'}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 font-bold">PAL-INSP</span>
                  </div>

                  {/* QR Image */}
                  <div className="flex justify-center my-1 bg-white p-2 rounded-xl border border-slate-300 w-fit mx-auto shadow-inner">
                    <QrCodeGenerator 
                      value={`https://incident.palcom.online/q/vehicle/${item.secureToken || item.tokenHash}`} 
                      size={150} 
                    />
                  </div>

                  {/* Title & Plate */}
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-black text-blue-400 block tracking-wide">
                      رمز تعريف المركبة التأميني
                    </span>
                    <div className="bg-amber-400 text-slate-950 font-mono font-black text-lg py-0.5 px-3 rounded-lg border border-amber-300 tracking-wider shadow-sm inline-block">
                      {item.vehiclePlate}
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 block font-bold">
                      المتتبع: {item.tokenReference || `VQR-${item.vehiclePlate}`}
                    </span>
                  </div>

                  {/* Disclaimer Note */}
                  <div className="pt-2 border-t border-slate-800 text-center text-[8px] text-slate-400">
                    يُستخدم من قبل الجهات والمحققين المصرح لهم
                  </div>
                </div>
              ))}
            </div>

            {/* Print Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                عدد الملصقات المحددة: <strong className="text-white font-mono">{printableItems.length}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الآن</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW VEHICLE QR MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#2A323A] border border-[#3A434C] rounded-3xl w-full max-w-lg p-6 text-right space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#3A434C] pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <h3 className="font-black text-base text-white">إصدار رمز QR جديد للمركبة</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-bold">رقم لوحة المركبة</label>
                <input
                  type="text"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  className="w-full p-2.5 bg-[#1C2229] border border-[#3A434C] text-white rounded-xl font-mono font-bold"
                  placeholder="مثال: 5-9821-99"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-bold">نوع وموديل المركبة</label>
                <input
                  type="text"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="w-full p-2.5 bg-[#1C2229] border border-[#3A434C] text-white rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-bold">رقم وثيقة التأمين</label>
                  <input
                    type="text"
                    value={newPolicy}
                    onChange={(e) => setNewPolicy(e.target.value)}
                    className="w-full p-2.5 bg-[#1C2229] border border-[#3A434C] text-white rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-bold">تاريخ انتهاء الوثيقة</label>
                  <input
                    type="date"
                    value={newExpires}
                    onChange={(e) => setNewExpires(e.target.value)}
                    className="w-full p-2.5 bg-[#1C2229] border border-[#3A434C] text-white rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-bold">شركة التأمين المصدرة</label>
                <select
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full p-2.5 bg-[#1C2229] border border-[#3A434C] text-white rounded-xl font-bold"
                >
                  <option value="شركة المشرق للتأمين">شركة المشرق للتأمين</option>
                  <option value="الشركة الوطنية للتأمين">الشركة الوطنية للتأمين</option>
                  <option value="شركة فلسطين للتأمين">شركة فلسطين للتأمين</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#3A434C]">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreateQr}
                className="px-5 py-2 bg-[#315EF5] hover:bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg cursor-pointer"
              >
                تأكيد الإصدار وإنشاء QR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM SETTINGS MODAL ("الإعدادات > إعدادات النظام > QR") */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#2A323A] border border-[#3A434C] rounded-3xl w-full max-w-lg p-6 text-right space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#3A434C] pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                <h3 className="font-black text-base text-white">إعدادات النظام - وحدة QR</h3>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-[#1C2229] rounded-xl border border-[#3A434C]">
                <div>
                  <strong className="text-white block font-bold">تفعيل Vehicle QR للمركبات</strong>
                  <span className="text-slate-400 text-[10px]">توليد ملصقات تعريفية للمركبات المؤمّنة</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableVehicleQr}
                  onChange={(e) => setSettings({ ...settings, enableVehicleQr: e.target.checked })}
                  className="w-4 h-4 accent-blue-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-[#1C2229] rounded-xl border border-[#3A434C]">
                <div>
                  <strong className="text-white block font-bold">تفعيل Incident QR للحوادث</strong>
                  <span className="text-slate-400 text-[10px]">ربط مستندات القضية بالتحقيق الميداني</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableIncidentQr}
                  onChange={(e) => setSettings({ ...settings, enableIncidentQr: e.target.checked })}
                  className="w-4 h-4 accent-blue-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-[#1C2229] rounded-xl border border-[#3A434C]">
                <div>
                  <strong className="text-white block font-bold">السماح بطباعة الملصقات للزجاج</strong>
                  <span className="text-slate-400 text-[10px]">تجهيز نماذج الطباعة الموحدة لمسؤولي النظام</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allowStickerPrinting}
                  onChange={(e) => setSettings({ ...settings, allowStickerPrinting: e.target.checked })}
                  className="w-4 h-4 accent-blue-500 cursor-pointer"
                />
              </div>

              <div className="p-3 bg-[#1C2229] rounded-xl border border-[#3A434C] space-y-1">
                <strong className="text-white block font-bold">نمط استخدام QR في النظام</strong>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="qrMode"
                      value="OPTIONAL"
                      checked={settings.qrUsageMode === 'OPTIONAL'}
                      onChange={() => setSettings({ ...settings, qrUsageMode: 'OPTIONAL' })}
                      className="accent-blue-500"
                    />
                    <span>QR اختياري (النظام يعمل بدونه)</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="qrMode"
                      value="MANDATORY"
                      checked={settings.qrUsageMode === 'MANDATORY'}
                      onChange={() => setSettings({ ...settings, qrUsageMode: 'MANDATORY' })}
                      className="accent-blue-500"
                    />
                    <span>QR إلزامي</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#3A434C]">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-5 py-2 bg-[#315EF5] text-white rounded-xl text-xs font-black"
              >
                حفظ الإعدادات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW SINGLE QR DETAILS MODAL */}
      {selectedQr && !showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#2A323A] border border-[#3A434C] rounded-3xl w-full max-w-md p-6 text-right space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#3A434C] pb-3">
              <h3 className="font-black text-base text-white">تفاصيل رمز QR للمركبة</h3>
              <button onClick={() => setSelectedQr(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-center bg-white p-3 rounded-2xl border border-slate-300 w-fit mx-auto shadow-inner">
              <QrCodeGenerator 
                value={`https://incident.palcom.online/q/vehicle/${selectedQr.secureToken || selectedQr.tokenHash}`} 
                size={180} 
              />
            </div>

            <div className="space-y-2 text-xs bg-[#1C2229] p-4 rounded-2xl border border-[#3A434C]">
              <div className="flex justify-between">
                <span className="text-slate-400">رقم اللوحة:</span>
                <strong className="text-blue-400 font-mono font-bold">{selectedQr.vehiclePlate}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">نوع المركبة:</span>
                <strong className="text-white font-bold">{selectedQr.vehicleModel || 'مركبة خفيفة'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">شركة التأمين:</span>
                <strong className="text-slate-200">{selectedQr.insuranceCompanyName || 'شركة المشرق للتأمين'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">رقم الوثيقة:</span>
                <strong className="text-slate-200 font-mono">{selectedQr.policyNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">حالة QR:</span>
                <strong className="text-emerald-400 font-bold">{selectedQr.status}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">عدد مرات المسح:</span>
                <strong className="text-amber-400 font-mono">{selectedQr.scanCount || 0}</strong>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedQr(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE VEHICLE WITH QR OVERLAY SIMULATOR MODAL */}
      {liveVehicleQr && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#2A323A] border border-[#3A434C] rounded-3xl w-full max-w-2xl p-6 text-right space-y-5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#3A434C] pb-3">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-base text-white">معاينة حية للمركبة وملصق الـ QR (الزجاج الأمامي)</h3>
              </div>
              <button onClick={() => setLiveVehicleQr(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Car Mockup with QR Overlay */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center shadow-inner overflow-hidden min-h-[300px]">
              <div className="absolute inset-0 bg-blue-500/5 pointer-events-none animate-pulse"></div>
              <div className="absolute top-4 left-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>متصل بالنظام الموحد للحوادث والمركبات</span>
              </div>

              {/* Realistic Car Graphic / SVG Windshield Container */}
              <div className="relative w-full max-w-md bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700 shadow-2xl flex flex-col items-center space-y-4">
                
                <div className="w-full flex items-center justify-between border-b border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-blue-600/20 text-blue-400 rounded-xl">
                      <Car className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="text-xs font-black text-white block">{liveVehicleQr.vehicleModel || 'مركبة خفيفة'}</span>
                      <span className="text-[10px] text-slate-400">وثيقة: {liveVehicleQr.policyNumber}</span>
                    </div>
                  </div>
                  
                  <div className="bg-amber-400 text-slate-950 px-4 py-1 rounded-xl font-mono font-black text-base tracking-widest border border-amber-300 shadow">
                    {liveVehicleQr.vehiclePlate}
                  </div>
                </div>

                {/* Windshield Simulation Area with QR Sticker Overlaid */}
                <div className="relative w-full h-44 bg-gradient-to-b from-sky-950/60 to-slate-900/80 rounded-xl border border-sky-500/30 overflow-hidden flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400/10 via-transparent to-transparent pointer-events-none"></div>
                  
                  <div className="absolute top-2 text-center text-[10px] text-sky-300/70 font-mono">
                    [ الزجاج الأمامي للمركبة - زاوية الرؤية الداخلية ]
                  </div>

                  {/* LIVE QR STICKER OVERLAY ON WINDSHIELD */}
                  <div className="absolute bottom-3 right-4 bg-white p-2 rounded-xl border-2 border-blue-600 shadow-2xl flex items-center gap-2 transform hover:scale-105 transition-transform cursor-pointer">
                    <div className="bg-white p-1 rounded">
                      <QrCodeGenerator 
                        value={`https://incident.palcom.online/q/vehicle/${liveVehicleQr.secureToken || liveVehicleQr.tokenHash}`} 
                        size={80} 
                      />
                    </div>
                    <div className="text-right text-[9px] text-slate-900 space-y-0.5">
                      <strong className="block font-black text-blue-900">سجل التأمين الموحد</strong>
                      <span className="font-mono font-bold block bg-amber-300 px-1 rounded text-center">{liveVehicleQr.vehiclePlate}</span>
                      <span className="text-[7px] text-slate-500 block">امسح للتحقق الفوري</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                شركة التأمين: <strong className="text-white">{liveVehicleQr.insuranceCompanyName || 'شركة المشرق للتأمين'}</strong>
              </span>
              <button
                onClick={() => setLiveVehicleQr(null)}
                className="px-5 py-2 bg-[#315EF5] hover:bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg cursor-pointer"
              >
                إغلاق المعاينة الحية
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
