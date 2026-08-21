import React, { useState } from 'react';
import { 
  Building2, 
  Shield, 
  MapPin, 
  Flame, 
  Droplets, 
  Wind, 
  Lock, 
  FileText, 
  AlertTriangle, 
  Camera, 
  Compass, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Eye, 
  ExternalLink, 
  Download, 
  Layers, 
  FileSpreadsheet, 
  Check, 
  Copy, 
  User, 
  FileCheck,
  Zap,
  Home
} from 'lucide-react';

interface PropertyInsuranceSectorProps {
  onOpenPolicyholder?: (phId: string) => void;
}

export const PropertyInsuranceSector: React.FC<PropertyInsuranceSectorProps> = ({
  onOpenPolicyholder
}) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'location' | 'coverages' | 'claims' | 'reports'>('properties');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [showAddClaimModal, setShowAddClaimModal] = useState(false);
  const [showAddReportModal, setShowAddReportModal] = useState(false);

  // Property Data
  const [properties, setProperties] = useState<any[]>([
    {
      id: 'PROP-2026-001',
      propertyName: 'برج الأندلس التجاري والإداري',
      propertyType: 'مبنى تجاري / مكاتب',
      deedNumber: 'DEED-NAB-9942/2020',
      ownerName: 'شركة النور للمقاولات والتجارة',
      ownerId: 'ph-2',
      nationalId: '700192834',
      governorate: 'نابلس',
      city: 'نابلس',
      address: 'شارع فلسطين - بجانب المجمع التجاري',
      lat: 32.2211,
      lng: 35.2544,
      builtArea: 4800, // m²
      floorsCount: 9,
      constructionYear: 2021,
      occupancyType: 'مكاتب شركات وعيادات ومحلات تجارية',
      valuationAmount: 18500000, // ILS
      policyNumber: 'POL-PROP-2026-0019',
      policyStatus: 'ACTIVE',
      policyExpiry: '2027-03-01',
      premiumAmount: 24500,
      activeCoverages: ['حريق وانفجار', 'تسرب مياه وسيول', 'كوارث طبيعية وزلازل', 'سرقة وسطو', 'مسؤولية مدنية تجاه الجوار والزوار'],
      safetySystems: 'شبكة رشاشات مائية تلقائية (Sprinklers) + إنذار حريق موصول بالدفاع المدني + مخرج طوارئ مزدوج',
      engineeringStatus: 'معتمد ومفحوص إنشائياً'
    },
    {
      id: 'PROP-2026-002',
      propertyName: 'مستودعات الأفق المركزية للتخزين المبرد',
      propertyType: 'مستودع لوجستي ومخازن مبردة',
      deedNumber: 'DEED-RAM-4120/2018',
      ownerName: 'شركة الأفق للخدمات اللوجستية',
      ownerId: 'ph-4',
      nationalId: '700384729',
      governorate: 'رام الله والبيرة',
      city: 'بيتونيا',
      address: 'المنطقة الصناعية - بيتونيا',
      lat: 31.8988,
      lng: 35.1822,
      builtArea: 3200,
      floorsCount: 2,
      constructionYear: 2019,
      occupancyType: 'مستودعات شحن ومخازن بضائع مبردة',
      valuationAmount: 12000000,
      policyNumber: 'POL-PROP-2026-0044',
      policyStatus: 'ACTIVE',
      policyExpiry: '2027-01-15',
      premiumAmount: 18900,
      activeCoverages: ['حريق وصواعق', 'تلف مخزون مبرد نتيجة انقطاع الكهرباء', 'سرقة واقتحام', 'مسؤولية أرباب العمل'],
      safetySystems: 'مضخات إطفاء غاز FM200 + كاميرات مراقبة 24/7 وحراسة أمنية',
      engineeringStatus: 'معتمد من الدفاع المدني'
    },
    {
      id: 'PROP-2026-003',
      propertyName: 'فيلا الياسمين السكنية الحديثة',
      propertyType: 'فيلا سكنية خاصة',
      deedNumber: 'DEED-NAB-1102/2023',
      ownerName: 'عماد عادل سليم',
      ownerId: 'ph-1',
      nationalId: '908234123',
      governorate: 'نابلس',
      city: 'نابلس',
      address: 'حي المخفية - شارع الأكاديمية',
      lat: 32.2268,
      lng: 35.2410,
      builtArea: 650,
      floorsCount: 3,
      constructionYear: 2023,
      occupancyType: 'سكني خاص عائلي',
      valuationAmount: 3800000,
      policyNumber: 'POL-PROP-2026-0092',
      policyStatus: 'ACTIVE',
      policyExpiry: '2027-05-20',
      premiumAmount: 4200,
      activeCoverages: ['حريق شامل ومحتويات المنزل', 'تسرب مياه وشبكة التدفئة', 'سرقة وكسر زجاج', 'أضرار العواصف'],
      safetySystems: 'نظام حماية ذكي متصل بالهاتف + أجهزة كشف الدخان',
      engineeringStatus: 'تقرير سلامة ممتاز'
    },
    {
      id: 'PROP-2026-004',
      propertyName: 'مجمع القدس التجاري والمطاعم',
      propertyType: 'مجمع تجاري ترفيهي',
      deedNumber: 'DEED-HEB-7719/2021',
      ownerName: 'خالد إبراهيم يوسف',
      ownerId: 'ph-3',
      nationalId: '401928374',
      governorate: 'الخليل',
      city: 'الخليل',
      address: 'عين سارة - بالقرب من استاد الحسين',
      lat: 31.5326,
      lng: 35.0998,
      builtArea: 5200,
      floorsCount: 5,
      constructionYear: 2022,
      occupancyType: 'مطاعم ومحلات ومناطق ألعاب أطفال',
      valuationAmount: 22000000,
      policyNumber: 'POL-PROP-2026-0120',
      policyStatus: 'ACTIVE',
      policyExpiry: '2026-12-31',
      premiumAmount: 31000,
      activeCoverages: ['حريق وأخطار حليفة', 'مسؤولية مدنية شاملة للمرتادين', 'تسرب مياه وخزانات', 'انقطاع الأعمال'],
      safetySystems: 'شبكة إطفاء متكاملة مع خزان مياه احتياطي 50 متر مكعب',
      engineeringStatus: 'مجدد رخصة الدفاع المدني 2026'
    }
  ]);

  // Property Claims
  const [propertyClaims, setPropertyClaims] = useState<any[]>([
    {
      id: 'CLM-PROP-2026-008',
      propertyName: 'مستودعات الأفق المركزية للتخزين المبرد',
      ownerName: 'شركة الأفق للخدمات اللوجستية',
      date: '2026-07-28',
      causeType: 'تسرب مياه حاد من شبكة التبريد وتلف بضائع مخزنة',
      perilCategory: 'أضرار مياه وشبكات صناعية',
      estimatedLoss: 38000,
      approvedCompensation: 35000,
      status: 'APPROVED',
      statusLabel: 'معتمد وجاري صرف التعويض',
      engineerName: 'المهندس حسام الجعبري (خبير تسوية أضرار هندسية)',
      surveyReportId: 'ENG-RPT-2026-041'
    },
    {
      id: 'CLM-PROP-2026-003',
      propertyName: 'فيلا الياسمين السكنية الحديثة',
      ownerName: 'عماد عادل سليم',
      date: '2026-06-14',
      causeType: 'التماس كهربائي جزئي بغرفة الغسيل وتلف دهان وسقف مستعار',
      perilCategory: 'حريق كهربائي محدود',
      estimatedLoss: 12000,
      approvedCompensation: 11500,
      status: 'COMPLETED',
      statusLabel: 'مكتملة ومسددة بالكامل للمؤمن له',
      engineerName: 'المهندسة ريم صبري',
      surveyReportId: 'ENG-RPT-2026-019'
    }
  ]);

  // Engineering Reports & Surveys
  const [engineeringReports, setEngineeringReports] = useState<any[]>([
    {
      id: 'ENG-RPT-2026-041',
      propertyName: 'مستودعات الأفق المركزية للتخزين المبرد',
      reportType: 'تقرير معاينة أضرار مياه وسلامة العوازل',
      date: '2026-07-30',
      engineer: 'المهندس حسام الجعبري',
      recommendation: 'استبدال أنابيب خط التبريد الرئيسي وعزل الأرضية الإيبوكسية بالكامل',
      status: 'FINALIZED',
      filesCount: 8,
      downloadUrl: '#'
    },
    {
      id: 'ENG-RPT-2026-028',
      propertyName: 'برج الأندلس التجاري والإداري',
      reportType: 'فحص دوري لأنظمة السلامة ومضخات الحريق والمصاعد',
      date: '2026-05-10',
      engineer: 'مكتب الرواد للاستشارات الهندسية وفحص المنشآت',
      recommendation: 'المبنى مطابق بنسبة 100% لمعايير كود البناء والدفاع المدني الفلسطيني',
      status: 'APPROVED_CERTIFIED',
      filesCount: 12,
      downloadUrl: '#'
    },
    {
      id: 'ENG-RPT-2026-012',
      propertyName: 'مجمع القدس التجاري والمطاعم',
      reportType: 'مخطط السلامة ومخارج الطوارئ ومسارات الهروب',
      date: '2026-02-18',
      engineer: 'المهندس فاروق التميمي',
      recommendation: 'تحديث اللوحات الإرشادية المضيئة في الطابقين الثاني والثالث',
      status: 'COMPLIANT',
      filesCount: 6,
      downloadUrl: '#'
    }
  ]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredProperties = properties.filter(p => 
    p.propertyName.includes(searchQuery) ||
    p.ownerName.includes(searchQuery) ||
    p.city.includes(searchQuery) ||
    p.policyNumber.includes(searchQuery) ||
    p.deedNumber.includes(searchQuery)
  );

  return (
    <div className="space-y-6 text-right font-sans text-xs text-[#F1F5F9]" dir="rtl">
      
      {/* HEADER BANNER */}
      <div className="bg-[#2A323A] rounded-3xl p-6 border border-[#3A434C] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black">
                  قطاع تأمين العقارات والممتلكات
                </span>
                <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  تغطية الأخطار الشاملة والهندسية
                </span>
              </div>
              <h1 className="text-xl font-black text-white mt-1">
                منظومة تأمين العقارات والمنشآت (Property Insurance Sector)
              </h1>
              <p className="text-[#AAB2BA] text-xs mt-1">
                إدارة الأبراج والمجمعات والفلل والمستودعات، بوالص الحريق والسيول والكوارث، ومطالبات ومعاينات الخبراء الهندسيين
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setShowAddPropertyModal(true)}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة عقار مؤمن جديد</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddClaimModal(true)}
              className="px-4 py-2.5 bg-[#1D4ED8] hover:bg-[#2563EB] text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>تسجيل مطالبة عقارية</span>
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mt-6 pt-6 border-t border-[#3A434C]/60">
          <div className="bg-[#1C2229] p-3.5 rounded-2xl border border-[#3A434C]">
            <div className="flex items-center justify-between text-[#AAB2BA] mb-1">
              <span className="text-[10px] font-bold">العقارات المؤمنة</span>
              <Building2 className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-black text-white font-mono">{properties.length}</div>
            <span className="text-[9px] text-emerald-400 font-bold">أبراج، مجمعات، مستودعات</span>
          </div>

          <div className="bg-[#1C2229] p-3.5 rounded-2xl border border-[#3A434C]">
            <div className="flex items-center justify-between text-[#AAB2BA] mb-1">
              <span className="text-[10px] font-bold">إجمالي القيمة التقديرية</span>
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-lg font-black text-emerald-400 font-mono">
              {(properties.reduce((acc, curr) => acc + (curr.valuationAmount || 0), 0) / 1000000).toFixed(1)}M ₪
            </div>
            <span className="text-[9px] text-[#AAB2BA] font-bold">مجموع مبالغ التغطية</span>
          </div>

          <div className="bg-[#1C2229] p-3.5 rounded-2xl border border-[#3A434C]">
            <div className="flex items-center justify-between text-[#AAB2BA] mb-1">
              <span className="text-[10px] font-bold">المساحة المبنية المشمولة</span>
              <Compass className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-lg font-black text-white font-mono">
              {properties.reduce((acc, curr) => acc + (curr.builtArea || 0), 0).toLocaleString()} م²
            </div>
            <span className="text-[9px] text-blue-400 font-bold">مساحات خاضعة للسلامة</span>
          </div>

          <div className="bg-[#1C2229] p-3.5 rounded-2xl border border-[#3A434C]">
            <div className="flex items-center justify-between text-[#AAB2BA] mb-1">
              <span className="text-[10px] font-bold">المطالبات العقارية المسجلة</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl font-black text-white font-mono">{propertyClaims.length}</div>
            <span className="text-[9px] text-rose-400 font-bold">أضرار مياه وحريق</span>
          </div>

          <div className="bg-[#1C2229] p-3.5 rounded-2xl border border-[#3A434C]">
            <div className="flex items-center justify-between text-[#AAB2BA] mb-1">
              <span className="text-[10px] font-bold">التقارير الهندسية المعتمدة</span>
              <FileCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl font-black text-white font-mono">{engineeringReports.length}</div>
            <span className="text-[9px] text-purple-400 font-bold">كودات السلامة والدفاع المدني</span>
          </div>
        </div>
      </div>

      {/* SUB TABS NAVIGATION */}
      <div className="bg-[#2A323A] rounded-2xl p-1.5 border border-[#3A434C] flex items-center gap-1.5 overflow-x-auto shadow-md">
        <button
          type="button"
          onClick={() => setActiveTab('properties')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'properties'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#323A40]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>العقارات المؤمن عليها</span>
          <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-white text-[10px]">{properties.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('location')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'location'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#323A40]'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>بيانات العقار والموقع الجغرافي</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('coverages')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'coverages'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#323A40]'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>نوع التغطية (حريق / مياه / كوارث / سرقة)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('claims')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'claims'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#323A40]'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>الأضرار والمطالبات</span>
          <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px]">{propertyClaims.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#323A40]'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>الصور والتقارير الهندسية</span>
          <span className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px]">{engineeringReports.length}</span>
        </button>
      </div>

      {/* TAB 1: PROPERTIES LIST */}
      {activeTab === 'properties' && (
        <div className="bg-[#2A323A] rounded-3xl border border-[#3A434C] shadow-lg overflow-hidden space-y-4">
          <div className="p-5 border-b border-[#3A434C] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                سجل العقارات والمنشآت المؤمن عليها
              </h2>
              <p className="text-[11px] text-[#AAB2BA] mt-0.5">
                تصفح كافة المباني الإدارية والسكنية والمستودعات المؤمنة مع تفاصيل الصكوك والقيمة الإجمالية
              </p>
            </div>

            <div className="relative min-w-[280px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث باسم العقار، الصك، المدينة، المالك..."
                className="w-full bg-[#1C2229] border border-[#3A434C] rounded-xl px-3.5 py-2 pr-9 text-white placeholder-[#64748B] text-xs focus:outline-none focus:border-amber-500"
              />
              <Search className="w-4 h-4 text-[#64748B] absolute right-3 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[#1E252B] text-[#94A3B8] border-b border-[#3A434C] text-[11px] font-bold">
                  <th className="p-4">اسم العقار والنوع</th>
                  <th className="p-4">الموقع والمحافظة</th>
                  <th className="p-4">رقم الصك / الطابو</th>
                  <th className="p-4">المؤمن له (المالك)</th>
                  <th className="p-4">القيمة التأمينية</th>
                  <th className="p-4">رقم الوثيقة</th>
                  <th className="p-4">الحالة والجاهزية</th>
                  <th className="p-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3A434C]/40 text-xs">
                {filteredProperties.map((p) => (
                  <tr key={p.id} className="hover:bg-[#323A40]/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-base">
                          🏢
                        </div>
                        <div>
                          <span className="font-bold text-white text-xs block">{p.propertyName}</span>
                          <span className="text-[10px] text-[#AAB2BA]">{p.propertyType} • {p.floorsCount} طوابق ({p.builtArea} م²)</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-white flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>{p.city} - {p.governorate}</span>
                      </div>
                      <span className="text-[10px] text-[#94A3B8] block truncate max-w-[200px]">{p.address}</span>
                    </td>

                    <td className="p-4 font-mono text-[11px] text-[#CBD5E1]">
                      {p.deedNumber}
                    </td>

                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => onOpenPolicyholder && onOpenPolicyholder(p.ownerId)}
                        className="font-bold text-amber-300 hover:text-amber-200 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>{p.ownerName}</span>
                      </button>
                      <span className="text-[10px] text-[#94A3B8] font-mono block mt-0.5">هوية/سجل: {p.nationalId}</span>
                    </td>

                    <td className="p-4">
                      <span className="font-mono font-black text-emerald-400 text-xs block">
                        {(p.valuationAmount / 1000000).toFixed(2)} مليون ₪
                      </span>
                      <span className="text-[10px] text-[#AAB2BA] font-mono">قسط: {p.premiumAmount.toLocaleString()} ₪/سنوي</span>
                    </td>

                    <td className="p-4">
                      <span className="font-mono font-bold text-blue-400 block">{p.policyNumber}</span>
                      <span className="text-[10px] text-emerald-400">سارية حتى {p.policyExpiry}</span>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {p.engineeringStatus}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => onOpenPolicyholder && onOpenPolicyholder(p.ownerId)}
                        className="p-1.5 bg-[#1C2229] hover:bg-amber-600 text-white rounded-lg transition-all cursor-pointer"
                        title="عرض الملف الشامل للمؤمن له وعقاراته"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PROPERTY DETAILS & GEO LOCATION */}
      {activeTab === 'location' && (
        <div className="bg-[#2A323A] rounded-3xl border border-[#3A434C] p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-[#3A434C] pb-4">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                بيانات العقارات والمواقع الجغرافية ومطابقة السلامة
              </h2>
              <p className="text-[11px] text-[#AAB2BA] mt-0.5">
                تحديد الإحداثيات الجغرافية (GPS)، مسافات مراكز الإطفاء، ونظم مكافحة الحرائق المعمارية
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {properties.map((p) => (
              <div key={p.id} className="bg-[#1C2229] rounded-2xl border border-[#3A434C] p-5 space-y-4 hover:border-amber-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping"></span>
                    <h3 className="text-sm font-black text-white">{p.propertyName}</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-[#2A323A] text-amber-300 font-mono text-[10px] font-bold">
                    {p.city} - {p.governorate}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-[#131920] p-3.5 rounded-xl border border-[#2A323A] text-[11px]">
                  <div>
                    <span className="text-[#AAB2BA] block text-[10px]">الإحداثيات الجغرافية (GPS):</span>
                    <span className="font-mono font-bold text-white">{p.lat.toFixed(4)}, {p.lng.toFixed(4)}</span>
                  </div>
                  <div>
                    <span className="text-[#AAB2BA] block text-[10px]">المساحة وسنة البناء:</span>
                    <span className="font-bold text-white">{p.builtArea} م² • بنيت عام {p.constructionYear}</span>
                  </div>
                  <div>
                    <span className="text-[#AAB2BA] block text-[10px]">طبيعة الإشغال:</span>
                    <span className="font-bold text-white">{p.occupancyType}</span>
                  </div>
                  <div>
                    <span className="text-[#AAB2BA] block text-[10px]">صك الملكية:</span>
                    <span className="font-mono font-bold text-emerald-400">{p.deedNumber}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#AAB2BA] font-bold block mb-1">نظام مكافحة الحرائق والإنذار المعتمد:</span>
                  <p className="text-[11px] text-[#CBD5E1] bg-[#1E252B] p-2.5 rounded-xl border border-[#2A323A]">
                    {p.safetySystems}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#2A323A] text-[11px]">
                  <span className="text-[#AAB2BA]">المالك: <strong className="text-white">{p.ownerName}</strong></span>
                  <a
                    href={`https://maps.google.com/?q=${p.lat},${p.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 rounded-xl font-bold text-[10px] flex items-center gap-1 transition-all"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>عرض الموقع على الخريطة</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: COVERAGE TYPES */}
      {activeTab === 'coverages' && (
        <div className="bg-[#2A323A] rounded-3xl border border-[#3A434C] p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-[#3A434C] pb-4">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                أنواع التغطيات والأخطار المشمولة في تأمين العقارات
              </h2>
              <p className="text-[11px] text-[#AAB2BA] mt-0.5">
                تغطيات الحريق، تسرب المياه والفيضانات، الزلازل والكوارث، والسرقة والمسؤولية المدنية للمباني
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Coverage 1: Fire */}
            <div className="bg-[#1C2229] rounded-2xl border border-orange-500/30 p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-white">الحريق والانفجار والصواعق</h3>
              <p className="text-[11px] text-[#AAB2BA] leading-relaxed">
                تغطية الأضرار المادية المباشرة الناتجة عن اشتعال النيران، التماسات الكهرباء، انفجار الغاز، وسقوط الصواعق على المنشأة.
              </p>
              <div className="pt-2 text-[10px] font-bold text-orange-400">تغطية أساسية 100% لكافة العقارات</div>
            </div>

            {/* Coverage 2: Water & Floods */}
            <div className="bg-[#1C2229] rounded-2xl border border-blue-500/30 p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Droplets className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-white">تسرب المياه والسيول والأنابيب</h3>
              <p className="text-[11px] text-[#AAB2BA] leading-relaxed">
                تعويض أضرار انفجار شبكات المياه المركزية، طفح الخزانات، تسرب مياه الأمطار الغزيرة من الأسطح، وغمر المستودعات الأرضية.
              </p>
              <div className="pt-2 text-[10px] font-bold text-blue-400">شامل العزل والدهان والأثاث المتضرر</div>
            </div>

            {/* Coverage 3: Earthquakes & Natural Perils */}
            <div className="bg-[#1C2229] rounded-2xl border border-emerald-500/30 p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Wind className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-white">الكوارث الطبيعية والزلازل والرياح</h3>
              <p className="text-[11px] text-[#AAB2BA] leading-relaxed">
                تغطية الهزات الأرضية، الانهيارات الصخرية، العواصف الثلجية والرياح الشديدة التي قد تؤثر على الهيكل الإنشائي للمبنى.
              </p>
              <div className="pt-2 text-[10px] font-bold text-emerald-400">تغطية اختيارية ومتقدمة للأبراج</div>
            </div>

            {/* Coverage 4: Burglary & Liability */}
            <div className="bg-[#1C2229] rounded-2xl border border-purple-500/30 p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-white">السرقة والسطو والمسؤولية المدنية</h3>
              <p className="text-[11px] text-[#AAB2BA] leading-relaxed">
                حماية محتويات العقار من السرقة بالاقتحام وكسر الأبواب، بالإضافة إلى تعويض إصابات الزوار أو أضرار المباني المجاورة.
              </p>
              <div className="pt-2 text-[10px] font-bold text-purple-400">تشمل المسؤولية القانونية للمالك</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DAMAGES & PROPERTY CLAIMS */}
      {activeTab === 'claims' && (
        <div className="bg-[#2A323A] rounded-3xl border border-[#3A434C] p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-[#3A434C] pb-4">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                سجل مطالبات وأضرار العقارات والمنشآت
              </h2>
              <p className="text-[11px] text-[#AAB2BA] mt-0.5">
                بلاغات الأضرار الإنشائية، معاينات الخبراء، والتعويضات المصروفة لإعادة تأهيل المبنى
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddClaimModal(true)}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل مطالبة جديدة</span>
            </button>
          </div>

          <div className="space-y-4">
            {propertyClaims.map((c) => (
              <div key={c.id} className="bg-[#1C2229] rounded-2xl border border-[#3A434C] p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2A323A] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-white text-sm">{c.id}</span>
                      <span className="px-2 py-0.5 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-md font-bold text-[10px]">
                        {c.perilCategory}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-white block mt-0.5">{c.propertyName} (المالك: {c.ownerName})</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <span className="text-[10px] text-[#AAB2BA] block">التعويض المعتمد:</span>
                      <span className="text-emerald-400 font-mono font-black text-base">
                        {c.approvedCompensation.toLocaleString()} ₪
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                      {c.statusLabel}
                    </span>
                  </div>
                </div>

                <div className="bg-[#131920] p-3.5 rounded-xl border border-[#2A323A] text-[11px] space-y-1">
                  <span className="text-[#AAB2BA] block text-[10px]">وصف الحادث والأضرار:</span>
                  <p className="text-white font-bold">{c.causeType}</p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-[11px] text-[#AAB2BA]">
                  <div>
                    <span>المهندس المعاين: <strong className="text-white">{c.engineerName}</strong></span>
                    <span className="mx-2">•</span>
                    <span>تقرير المعاينة: <strong className="font-mono text-blue-400">{c.surveyReportId}</strong></span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('reports')}
                    className="px-3 py-1.5 bg-[#2A323A] hover:bg-[#323A40] text-white rounded-xl font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-purple-400" />
                    <span>عرض التقرير الهندسي المرفق</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ENGINEERING REPORTS & BLUEPRINTS */}
      {activeTab === 'reports' && (
        <div className="bg-[#2A323A] rounded-3xl border border-[#3A434C] p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-[#3A434C] pb-4">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-400" />
                الصور والتقارير الهندسية ومخططات السلامة
              </h2>
              <p className="text-[11px] text-[#AAB2BA] mt-0.5">
                أرشفة تقارير الفحص الفني، شهادات السلامة من الدفاع المدني، وصور المعاينة الميدانية بدقة عالية
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddReportModal(true)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة تقرير هندسي جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {engineeringReports.map((rpt) => (
              <div key={rpt.id} className="bg-[#1C2229] rounded-2xl border border-[#3A434C] p-5 space-y-3.5 hover:border-purple-500/40 transition-all">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-black text-purple-400 text-xs">{rpt.id}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black">
                    معتمد ورسمي
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-white text-xs">{rpt.propertyName}</h3>
                  <span className="text-[10px] text-amber-300 font-bold block mt-0.5">{rpt.reportType}</span>
                </div>

                <div className="bg-[#131920] p-3 rounded-xl border border-[#2A323A] text-[10px] text-[#CBD5E1] space-y-1">
                  <span className="text-[#AAB2BA] block font-bold">توصيات المهندس والخبير:</span>
                  <p className="leading-relaxed">{rpt.recommendation}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#2A323A] text-[10px] text-[#AAB2BA]">
                  <span>تاريخ الفحص: <strong className="text-white">{rpt.date}</strong></span>
                  <button
                    type="button"
                    onClick={() => alert(`جاري تنزيل ملف التقرير الهندسي والمخططات: ${rpt.id}`)}
                    className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-600/30 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>تحميل ({rpt.filesCount} ملفات)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD PROPERTY */}
      {showAddPropertyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1C2229] border border-[#3A434C] rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#3A434C] pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                تسجيل عقار مؤمن جديد
              </h3>
              <button onClick={() => setShowAddPropertyModal(false)} className="text-[#AAB2BA] hover:text-white">✕</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              setShowAddPropertyModal(false);
            }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#AAB2BA] mb-1">اسم العقار / المنشأة</label>
                  <input type="text" placeholder="مثال: برج القدس التجاري" required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] text-[#AAB2BA] mb-1">نوع العقار</label>
                  <select className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs">
                    <option>مبنى تجاري / مكاتب</option>
                    <option>فيلا سكنية خاصة</option>
                    <option>مستودع لوجستي / مخازن</option>
                    <option>مجمع تجاري / مول</option>
                    <option>شقة سكنية</option>
                    <option>مصنع / منشأة صناعية</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-[#AAB2BA] mb-1">المحافظة</label>
                  <input type="text" placeholder="نابلس / رام الله..." required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] text-[#AAB2BA] mb-1">رقم الصك / الطابو</label>
                  <input type="text" placeholder="DEED-..." required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] text-[#AAB2BA] mb-1">المساحة المبنية (م²)</label>
                  <input type="number" placeholder="1500" required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#AAB2BA] mb-1">اسم المؤمن له (المالك)</label>
                <input type="text" placeholder="الاسم الكامل أو اسم الشركة المالكة" required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs" />
              </div>

              <div>
                <label className="block text-[10px] text-[#AAB2BA] mb-1">القيمة التقديرية للتأمين (₪)</label>
                <input type="number" placeholder="5000000" required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs font-mono" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#3A434C]">
                <button type="button" onClick={() => setShowAddPropertyModal(false)} className="px-4 py-2 bg-[#2A323A] text-white rounded-xl text-xs">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold">حفظ وتسجيل العقار</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PROPERTY CLAIM */}
      {showAddClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1C2229] border border-[#3A434C] rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#3A434C] pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                تسجيل مطالبة أضرار عقارية
              </h3>
              <button onClick={() => setShowAddClaimModal(false)} className="text-[#AAB2BA] hover:text-white">✕</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              setShowAddClaimModal(false);
            }} className="space-y-3">
              <div>
                <label className="block text-[10px] text-[#AAB2BA] mb-1">العقار المتضرر</label>
                <select className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs">
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.propertyName} - {p.city}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#AAB2BA] mb-1">نوع الخطر المسبب</label>
                  <select className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs">
                    <option>حريق وانفجار</option>
                    <option>تسرب مياه وسيول</option>
                    <option>كوارث طبيعية ورياح</option>
                    <option>سرقة وتخريب</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-[#AAB2BA] mb-1">الخسارة التقديرية الأولية (₪)</label>
                  <input type="number" placeholder="25000" required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#AAB2BA] mb-1">تفاصيل وموقع الأضرار داخل المبنى</label>
                <textarea rows={2} placeholder="وصف التلف والأجزاء الإنشائية المتأثرة..." required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#3A434C]">
                <button type="button" onClick={() => setShowAddClaimModal(false)} className="px-4 py-2 bg-[#2A323A] text-white rounded-xl text-xs">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold">تسجيل وتكليف خبير هندسي</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD REPORT */}
      {showAddReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1C2229] border border-[#3A434C] rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#3A434C] pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-400" />
                إرفاق تقرير هندسي / شهادة سلامة
              </h3>
              <button onClick={() => setShowAddReportModal(false)} className="text-[#AAB2BA] hover:text-white">✕</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              setShowAddReportModal(false);
            }} className="space-y-3">
              <div>
                <label className="block text-[10px] text-[#AAB2BA] mb-1">العقار المعني</label>
                <select className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs">
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.propertyName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#AAB2BA] mb-1">عنوان ونوع التقرير</label>
                <input type="text" placeholder="مثال: شهادة فحص شبكة الإنذار ورشاشات الإطفاء" required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs" />
              </div>

              <div>
                <label className="block text-[10px] text-[#AAB2BA] mb-1">اسم المهندس أو المكتب الاستشاري</label>
                <input type="text" placeholder="مكتب الاستشارات الهندسية المعتمد" required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs" />
              </div>

              <div>
                <label className="block text-[10px] text-[#AAB2BA] mb-1">الخلاصة والتوصيات الفنية</label>
                <textarea rows={2} placeholder="حالة المنشأة ومطابقتها للمواصفات..." required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#3A434C]">
                <button type="button" onClick={() => setShowAddReportModal(false)} className="px-4 py-2 bg-[#2A323A] text-white rounded-xl text-xs">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold">اعتماد ورفع التقرير</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
