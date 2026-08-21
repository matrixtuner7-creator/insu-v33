import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Shield, 
  FileText, 
  AlertTriangle, 
  QrCode, 
  Wrench, 
  Search, 
  Plus, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Eye, 
  Copy, 
  Check, 
  Download, 
  User, 
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Printer
} from 'lucide-react';

interface MotorInsuranceSectorProps {
  onSelectAccident?: (accident: any) => void;
  onOpenPolicyholder?: (phId: string) => void;
}

export const MotorInsuranceSector: React.FC<MotorInsuranceSectorProps> = ({
  onSelectAccident,
  onOpenPolicyholder
}) => {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'policies' | 'claims' | 'qr' | 'damages'>('vehicles');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal states
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showAddPolicyModal, setShowAddPolicyModal] = useState(false);
  const [showAddDamageModal, setShowAddDamageModal] = useState(false);
  const [selectedVehicleForQr, setSelectedVehicleForQr] = useState<any | null>(null);

  // Sector Data
  const [vehicles, setVehicles] = useState<any[]>([
    {
      id: 'v-101',
      plateNumber: '6-8921-90',
      plateCountry: 'فلسطين',
      chassisNumber: 'WVWZZZ3CZWE192834',
      make: 'فولكس فاجن',
      model: 'باسات (Passat)',
      modelYear: 2023,
      color: 'رمادي ميتاليك',
      vehicleType: 'خصوصي صالون',
      usageType: 'شخصي',
      ownerName: 'عماد عادل سليم',
      ownerId: 'ph-1',
      nationalId: '908234123',
      policyNumber: 'POL-MOT-2026-0089',
      policyType: 'شامل كامل (Comprehensive)',
      policyStatus: 'ACTIVE',
      policyExpiry: '2027-02-15',
      premiumAmount: 3200,
      claimsCount: 1,
      qrCodeStatus: 'ACTIVE',
      qrReference: 'TRST-QR-8921-A'
    },
    {
      id: 'v-102',
      plateNumber: '3-4512-92',
      plateCountry: 'فلسطين',
      chassisNumber: 'WBA3A5C50DF928172',
      make: 'بي إم دبليو (BMW)',
      model: 'الفئة الخامسة (520i)',
      modelYear: 2024,
      color: 'أسود ملوكي',
      vehicleType: 'خصوصي',
      usageType: 'شخصي',
      ownerName: 'شركة النور للمقاولات والتجارة',
      ownerId: 'ph-2',
      nationalId: '700192834',
      policyNumber: 'POL-MOT-2026-0142',
      policyType: 'شامل أسطول شركات',
      policyStatus: 'ACTIVE',
      policyExpiry: '2026-11-30',
      premiumAmount: 4800,
      claimsCount: 0,
      qrCodeStatus: 'ACTIVE',
      qrReference: 'TRST-QR-4512-B'
    },
    {
      id: 'v-103',
      plateNumber: '1-7890-95',
      plateCountry: 'فلسطين',
      chassisNumber: 'JTDBT923401928471',
      make: 'تويوتا (Toyota)',
      model: 'كورولا (Corolla Cross)',
      modelYear: 2022,
      color: 'أبيض لؤلؤي',
      vehicleType: 'خصوصي SUV',
      usageType: 'شخصي',
      ownerName: 'خالد إبراهيم يوسف',
      ownerId: 'ph-3',
      nationalId: '401928374',
      policyNumber: 'POL-MOT-2025-0982',
      policyType: 'ضد الغير (Third Party)',
      policyStatus: 'EXPIRING_SOON',
      policyExpiry: '2026-09-10',
      premiumAmount: 1100,
      claimsCount: 2,
      qrCodeStatus: 'ACTIVE',
      qrReference: 'TRST-QR-7890-C'
    },
    {
      id: 'v-104',
      plateNumber: '7-1234-91',
      plateCountry: 'فلسطين',
      chassisNumber: 'VF1RFA00591827364',
      make: 'رينو (Renault)',
      model: 'ماستر شحن (Master Van)',
      modelYear: 2021,
      color: 'أبيض',
      vehicleType: 'تجاري نقل خفيف',
      usageType: 'تجاري',
      ownerName: 'شركة الأفق للخدمات اللوجستية',
      ownerId: 'ph-4',
      nationalId: '700384729',
      policyNumber: 'POL-MOT-2026-0311',
      policyType: 'شامل مركبات نقل',
      policyStatus: 'ACTIVE',
      policyExpiry: '2027-01-20',
      premiumAmount: 2900,
      claimsCount: 1,
      qrCodeStatus: 'ACTIVE',
      qrReference: 'TRST-QR-1234-D'
    },
    {
      id: 'v-105',
      plateNumber: '8-5544-93',
      plateCountry: 'فلسطين',
      chassisNumber: 'KMHDH41EBJU918273',
      make: 'هيونداي (Hyundai)',
      model: 'توسان (Tucson)',
      modelYear: 2023,
      color: 'فضي',
      vehicleType: 'خصوصي SUV',
      usageType: 'شخصي',
      ownerName: 'مريم سعيد القواسمي',
      ownerId: 'ph-5',
      nationalId: '901238475',
      policyNumber: 'POL-MOT-2026-0422',
      policyType: 'شامل ذهبي',
      policyStatus: 'ACTIVE',
      policyExpiry: '2027-04-18',
      premiumAmount: 3400,
      claimsCount: 0,
      qrCodeStatus: 'ACTIVE',
      qrReference: 'TRST-QR-5544-E'
    }
  ]);

  // Motor Claims Data
  const [motorClaims, setMotorClaims] = useState<any[]>([
    {
      id: 'CLM-MOT-2026-041',
      incidentNumber: 'INC-2026-0819-01',
      plateNumber: '6-8921-90',
      ownerName: 'عماد عادل سليم',
      driverName: 'عماد عادل سليم',
      date: '2026-08-19 14:30',
      location: 'شارع رفيديا الرئيسي - نابلس',
      accidentType: 'تصادم من الخلف مع مركبة أخرى',
      faultPercentage: 0, // 0% fault (not at fault)
      status: 'APPROVED',
      statusLabel: 'تم اعتماد التغطية والإصلاح',
      estimatedDamage: 4500,
      currency: 'ILS',
      assignedGarage: 'كراج النجم الفني المعتمد',
      investigatorName: 'أحمد النتشة (محقق ميداني)'
    },
    {
      id: 'CLM-MOT-2026-039',
      incidentNumber: 'INC-2026-0815-04',
      plateNumber: '1-7890-95',
      ownerName: 'خالد إبراهيم يوسف',
      driverName: 'رامي خالد يوسف',
      date: '2026-08-15 09:15',
      location: 'دوار الشهداء - نابلس',
      accidentType: 'احتكاك جانبي عند الانعطاف',
      faultPercentage: 50,
      status: 'UNDER_INSPECTION',
      statusLabel: 'قيد المعاينة وتقدير الخبير',
      estimatedDamage: 2200,
      currency: 'ILS',
      assignedGarage: 'مركز الرواد لدهان وتجليس المركبات',
      investigatorName: 'سامر الخالدي'
    },
    {
      id: 'CLM-MOT-2026-032',
      incidentNumber: 'INC-2026-0802-09',
      plateNumber: '7-1234-91',
      ownerName: 'شركة الأفق للخدمات اللوجستية',
      driverName: 'طارق عبد المحسن',
      date: '2026-08-02 18:00',
      location: 'طريق حوارة - نابلس',
      accidentType: 'انزلاق على طريق مبلل وصدم رصيف',
      faultPercentage: 100,
      status: 'COMPLETED',
      statusLabel: 'مكتملة ومصروفة للورشة',
      estimatedDamage: 6800,
      currency: 'ILS',
      assignedGarage: 'الشركة العربية لقطع الشاحنات',
      investigatorName: 'علاء الشريف'
    }
  ]);

  // Damage Appraisals Data
  const [damageAppraisals, setDamageAppraisals] = useState<any[]>([
    {
      id: 'DMG-8921-01',
      plateNumber: '6-8921-90',
      vehicleMake: 'فولكس فاجن باسات 2023',
      claimId: 'CLM-MOT-2026-041',
      date: '2026-08-19',
      damagedParts: ['الصدام الخلفي بالكامل', 'حساسات الاصطفاف الخلفية', 'العاكس الأيمن', 'دعامة الشاسيه الخلفية السفلية'],
      partsCost: 3100,
      laborCost: 1400,
      totalEstimate: 4500,
      appraiserName: 'المهندس رامي البيطار (مخمن معتمد)',
      status: 'APPROVED',
      photosCount: 6
    },
    {
      id: 'DMG-7890-02',
      plateNumber: '1-7890-95',
      vehicleMake: 'تويوتا كورولا كروس 2022',
      claimId: 'CLM-MOT-2026-039',
      date: '2026-08-15',
      damagedParts: ['الرفرف الأمامي الأيمن', 'المرآة الجانبية الكهربائية', 'حافة الباب الأمامي'],
      partsCost: 1500,
      laborCost: 700,
      totalEstimate: 2200,
      appraiserName: 'المهندس وليد صوافطة',
      status: 'PENDING_APPROVAL',
      photosCount: 4
    }
  ]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredVehicles = vehicles.filter(v => 
    v.plateNumber.includes(searchQuery) ||
    v.ownerName.includes(searchQuery) ||
    v.make.includes(searchQuery) ||
    v.model.includes(searchQuery) ||
    v.policyNumber.includes(searchQuery) ||
    v.chassisNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-right font-sans text-xs text-[#F1F5F9]" dir="rtl">
      
      {/* SECTOR HEADER & STATS BANNER */}
      <div className="bg-[#2A323A] rounded-3xl p-6 border border-[#3A434C] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
              <Car className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-black">
                  قطاع تأمين المركبات والحوادث
                </span>
                <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  النظام متصل بالسجل المركزي الموحد
                </span>
              </div>
              <h1 className="text-xl font-black text-white mt-1">
                منظومة تأمين المركبات والسيارات (Motor Insurance Sector)
              </h1>
              <p className="text-[#AAB2BA] text-xs mt-1">
                إدارة شاملة للمركبات المؤمن عليها، بوالص الشامل وضد الغير، بطاقات QR الذكية، ومعاينات أضرار الحوادث والورش
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setShowAddVehicleModal(true)}
              className="px-4 py-2.5 bg-[#1D4ED8] hover:bg-[#2563EB] text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مركبة مؤمنة</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddPolicyModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>إصدار وثيقة مركبة</span>
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mt-6 pt-6 border-t border-[#3A434C]/60">
          <div className="bg-[#1C2229] p-3.5 rounded-2xl border border-[#3A434C]">
            <div className="flex items-center justify-between text-[#AAB2BA] mb-1">
              <span className="text-[10px] font-bold">المركبات المؤمن عليها</span>
              <Car className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-black text-white font-mono">{vehicles.length}</div>
            <span className="text-[9px] text-emerald-400 font-bold">100% مسجلة وموثقة</span>
          </div>

          <div className="bg-[#1C2229] p-3.5 rounded-2xl border border-[#3A434C]">
            <div className="flex items-center justify-between text-[#AAB2BA] mb-1">
              <span className="text-[10px] font-bold">البوالص السارية</span>
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-black text-white font-mono">
              {vehicles.filter(v => v.policyStatus === 'ACTIVE').length}
            </div>
            <span className="text-[9px] text-blue-400 font-bold">شامل + ضد الغير</span>
          </div>

          <div className="bg-[#1C2229] p-3.5 rounded-2xl border border-[#3A434C]">
            <div className="flex items-center justify-between text-[#AAB2BA] mb-1">
              <span className="text-[10px] font-bold">المطالبات والحوادث</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-black text-white font-mono">{motorClaims.length}</div>
            <span className="text-[9px] text-amber-400 font-bold">معاينة وتوجيه فوري</span>
          </div>

          <div className="bg-[#1C2229] p-3.5 rounded-2xl border border-[#3A434C]">
            <div className="flex items-center justify-between text-[#AAB2BA] mb-1">
              <span className="text-[10px] font-bold">بطاقات QR النشطة</span>
              <QrCode className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl font-black text-white font-mono">
              {vehicles.filter(v => v.qrCodeStatus === 'ACTIVE').length}
            </div>
            <span className="text-[9px] text-purple-400 font-bold">مسح فوري للمحققين</span>
          </div>

          <div className="bg-[#1C2229] p-3.5 rounded-2xl border border-[#3A434C]">
            <div className="flex items-center justify-between text-[#AAB2BA] mb-1">
              <span className="text-[10px] font-bold">تقديرات أضرار الإصلاح</span>
              <Wrench className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-lg font-black text-white font-mono">
              {motorClaims.reduce((acc, curr) => acc + (curr.estimatedDamage || 0), 0).toLocaleString()} ₪
            </div>
            <span className="text-[9px] text-rose-400 font-bold">معتمدة مع الكراجات</span>
          </div>
        </div>
      </div>

      {/* INTERNAL SUB-NAVIGATION TABS */}
      <div className="bg-[#2A323A] rounded-2xl p-1.5 border border-[#3A434C] flex items-center gap-1.5 overflow-x-auto shadow-md">
        <button
          type="button"
          onClick={() => setActiveTab('vehicles')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'vehicles'
              ? 'bg-[#1D4ED8] text-white shadow-md'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#323A40]'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>المركبات المؤمن عليها</span>
          <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-white text-[10px]">{vehicles.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('policies')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'policies'
              ? 'bg-[#1D4ED8] text-white shadow-md'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#323A40]'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>البوالص والوثائق</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('claims')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'claims'
              ? 'bg-[#1D4ED8] text-white shadow-md'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#323A40]'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>الحوادث والمطالبات</span>
          <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px]">{motorClaims.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('qr')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'qr'
              ? 'bg-[#1D4ED8] text-white shadow-md'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#323A40]'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>QR للمركبات والتحقق الميداني</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('damages')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'damages'
              ? 'bg-[#1D4ED8] text-white shadow-md'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#323A40]'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>أضرار المركبات ومعاينات الحوادث</span>
          <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px]">{damageAppraisals.length}</span>
        </button>
      </div>

      {/* TAB 1: INSURED VEHICLES LIST */}
      {activeTab === 'vehicles' && (
        <div className="bg-[#2A323A] rounded-3xl border border-[#3A434C] shadow-lg overflow-hidden space-y-4">
          <div className="p-5 border-b border-[#3A434C] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-400" />
                سجل المركبات المؤمن عليها (قاعدة بيانات أسطول وسيارات المشتركين)
              </h2>
              <p className="text-[11px] text-[#AAB2BA] mt-0.5">
                تصفح كافة السيارات الخصوصية والتجارية وأساطيل الشركات المؤمنة لدى شركة ترست
              </p>
            </div>

            {/* SEARCH */}
            <div className="relative min-w-[280px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث برقم اللوحة، المالك، الشاسيه..."
                className="w-full bg-[#1C2229] border border-[#3A434C] rounded-xl px-3.5 py-2 pr-9 text-white placeholder-[#64748B] text-xs focus:outline-none focus:border-[#315EF5]"
              />
              <Search className="w-4 h-4 text-[#64748B] absolute right-3 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[#1E252B] text-[#94A3B8] border-b border-[#3A434C] text-[11px] font-bold">
                  <th className="p-4">رقم اللوحة</th>
                  <th className="p-4">المركبة والموديل</th>
                  <th className="p-4">رقم الشاسيه (VIN)</th>
                  <th className="p-4">المؤمن له (المالك)</th>
                  <th className="p-4">نوع الوثيقة</th>
                  <th className="p-4">حالة البوليصة</th>
                  <th className="p-4">رمز QR</th>
                  <th className="p-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3A434C]/40 text-xs">
                {filteredVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-[#323A40]/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-mono font-black text-xs">
                          🚘
                        </div>
                        <div>
                          <span className="font-mono font-black text-white text-sm tracking-wider">{v.plateNumber}</span>
                          <span className="block text-[9px] text-[#AAB2BA]">{v.plateCountry}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-white">{v.make} {v.model}</div>
                      <div className="text-[10px] text-[#AAB2BA] flex items-center gap-1.5 mt-0.5">
                        <span>موديل: {v.modelYear}</span>
                        <span>•</span>
                        <span>{v.color}</span>
                        <span>•</span>
                        <span>{v.vehicleType}</span>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-[11px] text-[#CBD5E1]">
                      {v.chassisNumber}
                    </td>

                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => onOpenPolicyholder && onOpenPolicyholder(v.ownerId)}
                        className="font-bold text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>{v.ownerName}</span>
                      </button>
                      <span className="text-[10px] text-[#94A3B8] font-mono block mt-0.5">هوية: {v.nationalId}</span>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-white block">{v.policyType}</span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">{v.premiumAmount} ₪ / سنوي</span>
                    </td>

                    <td className="p-4">
                      {v.policyStatus === 'ACTIVE' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> سارية حتى {v.policyExpiry}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-[10px] inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> تنتهي قريباً
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVehicleForQr(v);
                          setActiveTab('qr');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>{v.qrReference}</span>
                      </button>
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenPolicyholder) onOpenPolicyholder(v.ownerId);
                          }}
                          className="p-1.5 bg-[#1C2229] hover:bg-[#3B82F6] text-white rounded-lg transition-all cursor-pointer"
                          title="عرض ملف المؤمن له ومركباته"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: POLICIES */}
      {activeTab === 'policies' && (
        <div className="bg-[#2A323A] rounded-3xl border border-[#3A434C] p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-[#3A434C] pb-4">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                سجل بوالص ووثائق تأمين المركبات (شامل / ضد الغير / أساطيل)
              </h2>
              <p className="text-[11px] text-[#AAB2BA] mt-0.5">
                إدارة مدد التغطية، مبالغ التحمل، حدود المسؤولية، وتجديد بوالص المركبات إلكترونياً
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddPolicyModal(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>إصدار بوليصة جديدة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((v) => (
              <div key={v.policyNumber} className="bg-[#1C2229] rounded-2xl border border-[#3A434C] p-4.5 space-y-3.5 hover:border-blue-500/50 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-blue-400 text-xs">{v.policyNumber}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black">
                    سارية المفعول
                  </span>
                </div>

                <div className="space-y-1.5 border-y border-[#2A323A] py-2.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#AAB2BA]">المؤمن له:</span>
                    <span className="font-bold text-white">{v.ownerName}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#AAB2BA]">المركبة المؤمنة:</span>
                    <span className="font-bold text-white font-mono">{v.plateNumber} ({v.make})</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#AAB2BA]">نوع التغطية:</span>
                    <span className="font-bold text-amber-300">{v.policyType}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#AAB2BA]">تاريخ الانتهاء:</span>
                    <span className="font-mono text-[#CBD5E1]">{v.policyExpiry}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-[#AAB2BA] block">القسط السنوي:</span>
                    <span className="text-sm font-black text-emerald-400 font-mono">{v.premiumAmount} ₪</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(v.policyNumber, v.policyNumber)}
                      className="p-2 bg-[#2A323A] hover:bg-[#323A40] text-[#AAB2BA] hover:text-white rounded-xl transition-all cursor-pointer"
                      title="نسخ رقم البوليصة"
                    >
                      {copiedId === v.policyNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenPolicyholder && onOpenPolicyholder(v.ownerId)}
                      className="px-3 py-1.5 bg-[#315EF5]/15 hover:bg-[#315EF5]/25 text-[#315EF5] border border-[#315EF5]/30 rounded-xl font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span>عرض الوثيقة</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CLAIMS & ACCIDENTS */}
      {activeTab === 'claims' && (
        <div className="bg-[#2A323A] rounded-3xl border border-[#3A434C] p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-[#3A434C] pb-4">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                سجل حوادث ومطالبات المركبات (Motor Claims & Incidents)
              </h2>
              <p className="text-[11px] text-[#AAB2BA] mt-0.5">
                تتبع المطالبات من وقت وقوع البلاغ الميداني حتى اعتماد الإصلاح وصرف التعويض للكراجات
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            {motorClaims.map((claim) => (
              <div key={claim.id} className="bg-[#1C2229] rounded-2xl border border-[#3A434C] p-5 hover:border-amber-500/50 transition-all space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-black">
                      ⚠️
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-white text-sm">{claim.id}</span>
                        <span className="px-2 py-0.5 rounded-md bg-[#2A323A] text-[#AAB2BA] font-mono text-[10px]">
                          بلاغ: {claim.incidentNumber}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white mt-0.5">{claim.accidentType}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold">
                      {claim.statusLabel}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#131920] p-3 rounded-xl border border-[#2A323A] text-[11px]">
                  <div>
                    <span className="text-[#AAB2BA] block text-[10px]">المركبة واللوحة:</span>
                    <span className="font-mono font-bold text-white">{claim.plateNumber}</span>
                  </div>
                  <div>
                    <span className="text-[#AAB2BA] block text-[10px]">الموقع والتاريخ:</span>
                    <span className="font-bold text-white">{claim.location}</span>
                  </div>
                  <div>
                    <span className="text-[#AAB2BA] block text-[10px]">نسبة المسؤولية:</span>
                    <span className={`font-mono font-black ${claim.faultPercentage === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {claim.faultPercentage}% {claim.faultPercentage === 0 ? '(غير متسبب)' : '(متسبب جزئي/كلي)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#AAB2BA] block text-[10px]">تقدير الأضرار:</span>
                    <span className="font-mono font-black text-emerald-400">{claim.estimatedDamage.toLocaleString()} {claim.currency}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-[11px]">
                  <div className="flex items-center gap-3 text-[#AAB2BA]">
                    <span>الكراج المعتمد: <strong className="text-white">{claim.assignedGarage}</strong></span>
                    <span>•</span>
                    <span>المحقق: <strong className="text-white">{claim.investigatorName}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('damages')}
                      className="px-3 py-1.5 bg-[#2A323A] hover:bg-[#323A40] text-white rounded-xl font-bold text-[10px] flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5 text-rose-400" />
                      <span>تقرير معاينة الأضرار</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: VEHICLE QR CODES */}
      {activeTab === 'qr' && (
        <div className="bg-[#2A323A] rounded-3xl border border-[#3A434C] p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-[#3A434C] pb-4">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-purple-400" />
                منظومة بطاقات ورموز QR الذكية للمركبات المؤمنة
              </h2>
              <p className="text-[11px] text-[#AAB2BA] mt-0.5">
                تتيح للمحقق الميداني والجهات الرسمية والمؤمن له التحقق الفوري من سريان التأمين ومعاينة بيانات المركبة بمجرد المسح
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {vehicles.map((v) => (
              <div key={v.id} className="bg-[#1C2229] rounded-2xl border border-purple-500/30 p-5 space-y-4 text-center relative overflow-hidden shadow-lg">
                <div className="flex justify-between items-center text-right">
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 font-mono text-[10px] font-bold border border-purple-500/20">
                    {v.qrReference}
                  </span>
                  <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> فعال وموثق
                  </span>
                </div>

                {/* QR Visual Box */}
                <div className="w-40 h-40 mx-auto bg-white p-3 rounded-2xl shadow-inner flex flex-col items-center justify-center border-4 border-purple-600/30">
                  <QrCode className="w-32 h-32 text-slate-900" />
                </div>

                <div>
                  <div className="font-mono font-black text-white text-base tracking-widest">{v.plateNumber}</div>
                  <div className="font-bold text-slate-300 text-xs mt-0.5">{v.make} {v.model} ({v.modelYear})</div>
                  <div className="text-[10px] text-[#AAB2BA] mt-0.5">المالك: {v.ownerName}</div>
                </div>

                <div className="bg-[#131920] p-2.5 rounded-xl border border-[#2A323A] text-[10px] text-right space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#AAB2BA]">رقم البوليصة:</span>
                    <span className="font-mono font-bold text-white">{v.policyNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#AAB2BA]">صلاحية الوثيقة:</span>
                    <span className="font-mono text-emerald-400 font-bold">{v.policyExpiry}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`https://trust-insurance.app/verify/qr/${v.qrReference}`, v.qrReference)}
                    className="flex-1 py-2 bg-[#2A323A] hover:bg-[#323A40] text-white rounded-xl font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedId === v.qrReference ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>نسخ رابط التحقق</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-600/40 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                    title="طباعة بطاقة QR للمركبة"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DAMAGES & APPRAISALS */}
      {activeTab === 'damages' && (
        <div className="bg-[#2A323A] rounded-3xl border border-[#3A434C] p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-[#3A434C] pb-4">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-rose-400" />
                سجل معاينات أضرار المركبات ومقايسات الورش
              </h2>
              <p className="text-[11px] text-[#AAB2BA] mt-0.5">
                فحص القطع المتضررة، تقدير أجور اليد وقطع الغيار الأصلية/البديلة، والموافقة على الصرف
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddDamageModal(true)}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة تقرير معاينة أضرار</span>
            </button>
          </div>

          <div className="space-y-4">
            {damageAppraisals.map((dmg) => (
              <div key={dmg.id} className="bg-[#1C2229] rounded-2xl border border-[#3A434C] p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2A323A] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-white text-sm">{dmg.id}</span>
                      <span className="px-2 py-0.5 bg-[#2A323A] rounded-md font-mono text-[#AAB2BA] text-[10px]">مطالبة: {dmg.claimId}</span>
                    </div>
                    <span className="text-xs font-bold text-white block mt-0.5">{dmg.vehicleMake} (لوحة: {dmg.plateNumber})</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-mono font-black text-base">
                      إجمالي التقدير: {dmg.totalEstimate.toLocaleString()} ₪
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${dmg.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                      {dmg.status === 'APPROVED' ? 'معتمد للصرف' : 'قيد التدقيق'}
                    </span>
                  </div>
                </div>

                {/* Damaged Parts Badges */}
                <div>
                  <span className="text-[11px] text-[#AAB2BA] font-bold block mb-2">الأجزاء والقطع المتضررة المسجلة بالمعاينة:</span>
                  <div className="flex flex-wrap gap-2">
                    {dmg.damagedParts.map((part: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        {part}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-[11px] text-[#AAB2BA]">
                  <div>
                    <span>المخمن الفني: <strong className="text-white">{dmg.appraiserName}</strong></span>
                    <span className="mx-2">•</span>
                    <span>الصور المرفقة: <strong className="text-white">{dmg.photosCount} صور عالية الدقة</strong></span>
                  </div>
                  <div className="font-mono text-[#CBD5E1]">
                    قطع الغيار: {dmg.partsCost} ₪ | أجور اليد: {dmg.laborCost} ₪
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD VEHICLE */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1C2229] border border-[#3A434C] rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#3A434C] pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-400" />
                تسجيل مركبة مؤمنة جديدة
              </h3>
              <button onClick={() => setShowAddVehicleModal(false)} className="text-[#AAB2BA] hover:text-white">✕</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              setShowAddVehicleModal(false);
            }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#AAB2BA] mb-1">رقم اللوحة</label>
                  <input type="text" placeholder="مثال: 6-8921-90" required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] text-[#AAB2BA] mb-1">رقم الشاسيه (VIN)</label>
                  <input type="text" placeholder="17 حرف ورقم" required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-[#AAB2BA] mb-1">الشركة الصانعة</label>
                  <input type="text" placeholder="مثال: فولكس فاجن" required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] text-[#AAB2BA] mb-1">الموديل والطراز</label>
                  <input type="text" placeholder="مثال: باسات" required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] text-[#AAB2BA] mb-1">سنة الصنع</label>
                  <input type="number" defaultValue={2024} required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#AAB2BA] mb-1">اسم المؤمن له (المالك)</label>
                <input type="text" placeholder="الاسم الكامل أو اسم المؤسسة" required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#3A434C]">
                <button type="button" onClick={() => setShowAddVehicleModal(false)} className="px-4 py-2 bg-[#2A323A] text-white rounded-xl text-xs">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-[#1D4ED8] hover:bg-[#2563EB] text-white rounded-xl text-xs font-bold">حفظ وتسجيل المركبة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD DAMAGE APPRAISAL */}
      {showAddDamageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1C2229] border border-[#3A434C] rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#3A434C] pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-rose-400" />
                إضافة تقرير معاينة وتقدير أضرار حادث
              </h3>
              <button onClick={() => setShowAddDamageModal(false)} className="text-[#AAB2BA] hover:text-white">✕</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              setShowAddDamageModal(false);
            }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#AAB2BA] mb-1">رقم البلاغ / المطالبة</label>
                  <input type="text" placeholder="CLM-MOT-2026-..." required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] text-[#AAB2BA] mb-1">رقم لوحة المركبة</label>
                  <input type="text" placeholder="6-8921-90" required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#AAB2BA] mb-1">الأجزاء المتضررة (افصل بفواصل)</label>
                <textarea rows={2} placeholder="الصدام الأمامي، الكشاف الأيمن، الرديتر..." required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#AAB2BA] mb-1">تكلفة قطع الغيار التقديرية (₪)</label>
                  <input type="number" placeholder="2500" required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] text-[#AAB2BA] mb-1">أجور اليد والتجليس (₪)</label>
                  <input type="number" placeholder="1000" required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs font-mono" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#3A434C]">
                <button type="button" onClick={() => setShowAddDamageModal(false)} className="px-4 py-2 bg-[#2A323A] text-white rounded-xl text-xs">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold">اعتماد التقرير</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
