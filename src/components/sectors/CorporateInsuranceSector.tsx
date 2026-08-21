import React, { useState } from 'react';
import { 
  Factory, 
  Briefcase, 
  MapPin, 
  Users, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Eye, 
  ExternalLink, 
  Copy, 
  Check, 
  Layers, 
  Cpu, 
  Boxes, 
  UserCheck, 
  ShieldAlert, 
  Building, 
  DollarSign,
  TrendingUp,
  FileCheck
} from 'lucide-react';

interface CorporateInsuranceSectorProps {
  onOpenPolicyholder?: (phId: string) => void;
}

export const CorporateInsuranceSector: React.FC<CorporateInsuranceSectorProps> = ({
  onOpenPolicyholder
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'branches' | 'assets' | 'liabilities' | 'employees' | 'policies_claims'>('profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [showAddClaimModal, setShowAddClaimModal] = useState(false);

  // Corporate Companies Data
  const [companies, setCompanies] = useState<any[]>([
    {
      id: 'CORP-2026-001',
      companyName: 'شركة النور للمقاولات العامة والتطوير العقاري',
      commercialRegistration: '562819034',
      taxNumber: 'TX-90182741',
      legalForm: 'شركة مساهمة خصوصية محدودة (Ltd)',
      industrySector: 'المقاولات والإنشاءات الهندسية والبنية التحتية',
      authorizedPerson: 'المهندس طارق عبد الحميد النور (المدير العام)',
      contactPhone: '+970 9 238 4400',
      contactEmail: 'info@alnoor-contracting.ps',
      headquartersAddress: 'برج النور - شارع فيصل - نابلس',
      policyholderId: 'ph-2',
      branchesCount: 4,
      insuredAssetsValue: 34500000, // ILS
      employeesCount: 145,
      activePoliciesCount: 5,
      masterPolicyNumber: 'POL-CORP-2026-0081',
      activeClaimsCount: 1
    },
    {
      id: 'CORP-2026-002',
      companyName: 'شركة الأفق للخدمات اللوجستية والشحن والتخزين المبرد',
      commercialRegistration: '562384910',
      taxNumber: 'TX-44019283',
      legalForm: 'شركة مساهمة محدودة',
      industrySector: 'النقل واللوجستيات وسلاسل الإمداد والتخزين',
      authorizedPerson: 'السيد رائد كمال بركات (رئيس مجلس الإدارة)',
      contactPhone: '+970 2 298 1200',
      contactEmail: 'contact@alofooq-logistics.ps',
      headquartersAddress: 'المنطقة الصناعية - بيتونيا - رام الله',
      policyholderId: 'ph-4',
      branchesCount: 6,
      insuredAssetsValue: 28000000,
      employeesCount: 210,
      activePoliciesCount: 4,
      masterPolicyNumber: 'POL-CORP-2026-0112',
      activeClaimsCount: 1
    },
    {
      id: 'CORP-2026-003',
      companyName: 'مجموعة القدس للصناعات الغذائية والتعبئة والتغليف',
      commercialRegistration: '561029384',
      taxNumber: 'TX-88201947',
      legalForm: 'مجموعة صناعية قابضة',
      industrySector: 'الصناعات الغذائية والتصنيع الزراعي',
      authorizedPerson: 'الحاج إبراهيم يوسف القدسي',
      contactPhone: '+970 2 225 8900',
      contactEmail: 'admin@quds-foodgroup.ps',
      headquartersAddress: 'المنطقة الحرفية - الخليل',
      policyholderId: 'ph-3',
      branchesCount: 5,
      insuredAssetsValue: 42000000,
      employeesCount: 320,
      activePoliciesCount: 6,
      masterPolicyNumber: 'POL-CORP-2026-0205',
      activeClaimsCount: 0
    }
  ]);

  // Branches & Facilities Data
  const [branches, setBranches] = useState<any[]>([
    {
      id: 'BR-01',
      companyId: 'CORP-2026-001',
      companyName: 'شركة النور للمقاولات العامة',
      branchName: 'المقر الرئيسي والمكاتب الإدارية المركزية',
      branchType: 'مقر إداري رئيسي',
      governorate: 'نابلس',
      city: 'نابلس',
      address: 'برج النور - شارع فيصل',
      managerName: 'فادي سالم',
      phone: '+970 9 238 4401',
      insuredValue: 9000000
    },
    {
      id: 'BR-02',
      companyId: 'CORP-2026-001',
      companyName: 'شركة النور للمقاولات العامة',
      branchName: 'مصنع الخرسانة الجاهزة والكسارة المركزية',
      branchType: 'موقع صناعي / مصنع',
      governorate: 'طولكرم',
      city: 'طولكرم',
      address: 'المنطقة الصناعية الشرقية',
      managerName: 'المهندس ماهر الدبيك',
      phone: '+970 9 267 3320',
      insuredValue: 14500000
    },
    {
      id: 'BR-03',
      companyId: 'CORP-2026-002',
      companyName: 'شركة الأفق للخدمات اللوجستية',
      branchName: 'المستودع المركزي للشحن المبرد',
      branchType: 'مستودعات مركزية ومستودع تبريد',
      governorate: 'رام الله والبيرة',
      city: 'بيتونيا',
      address: 'شارع المصانع - بيتونيا',
      managerName: 'أنس الصالحي',
      phone: '+970 2 298 1205',
      insuredValue: 12000000
    },
    {
      id: 'BR-04',
      companyId: 'CORP-2026-002',
      companyName: 'شركة الأفق للخدمات اللوجستية',
      branchName: 'مركز التوزيع والشحن السريع - الشمال',
      branchType: 'محطة شحن وتوزيع',
      governorate: 'جنين',
      city: 'جنين',
      address: 'شارع الناصرة',
      managerName: 'حازم غنام',
      phone: '+970 4 250 8821',
      insuredValue: 5500000
    }
  ]);

  // Insured Assets & Machinery Data
  const [assets, setAssets] = useState<any[]>([
    {
      id: 'AST-EQ-001',
      companyName: 'شركة النور للمقاولات العامة',
      assetCategory: 'معدات وآليات ثقيلة',
      assetName: 'مضخة باطون ثابتة ومتحركة (Schwing 42m)',
      serialNumber: 'SCHW-42M-89102',
      manufacturingYear: 2023,
      branchLocation: 'مصنع الخرسانة - طولكرم',
      estimatedValue: 1850000,
      coverageType: 'تأمين عطل الآلات ومعدات المقاولين (CPM)',
      status: 'OPERATIONAL'
    },
    {
      id: 'AST-EQ-002',
      companyName: 'شركة النور للمقاولات العامة',
      assetCategory: 'معدات إنشائية',
      assetName: 'حفار مجنزر ثقيل (Caterpillar 336D)',
      serialNumber: 'CAT-336D-992144',
      manufacturingYear: 2022,
      branchLocation: 'مشاريع البنية التحتية - نابلس',
      estimatedValue: 920000,
      coverageType: 'شامل آليات إنشائية وأخطار المقاولين',
      status: 'OPERATIONAL'
    },
    {
      id: 'AST-EQ-003',
      companyName: 'شركة الأفق للخدمات اللوجستية',
      assetCategory: 'أنظمة التبريد والمخزون',
      assetName: 'منظومة التبريد والتجميد الصناعي المركزية (Bitzer Chillers)',
      serialNumber: 'BITZ-IND-77192',
      manufacturingYear: 2021,
      branchLocation: 'مستودع بيتونيا المبرد',
      estimatedValue: 2400000,
      coverageType: 'تلف بضائع ومخزون نتيجة عطل ميكانيكي',
      status: 'OPERATIONAL'
    },
    {
      id: 'AST-EQ-004',
      companyName: 'مجموعة القدس للصناعات الغذائية',
      assetCategory: 'خطوط إنتاج آلية',
      assetName: 'خط تعبئة وتغليف إيطالي أوتوماتيكي متكامل (Tetra Pak line)',
      serialNumber: 'TP-AUTO-55421',
      manufacturingYear: 2024,
      branchLocation: 'المصنع الرئيسي - الخليل',
      estimatedValue: 4800000,
      coverageType: 'شامل مصانع وخطوط إنتاج وانقطاع أعمال',
      status: 'OPERATIONAL'
    }
  ]);

  // Covered Employees Data (Group Insurance)
  const [employeesGroups, setEmployeesGroups] = useState<any[]>([
    {
      id: 'EMP-GRP-001',
      companyName: 'شركة النور للمقاولات العامة',
      tierName: 'فئة المهندسين والمشرفين الميدانيين',
      count: 35,
      coverageDetails: 'إصابات عمل وتأمين حوادث شخصية 24/7 حتى 250,000 ₪ لكل موظف + علاج بالمستشفيات الخاصة',
      policyNumber: 'POL-GRP-2026-0041'
    },
    {
      id: 'EMP-GRP-002',
      companyName: 'شركة النور للمقاولات العامة',
      tierName: 'فئة الفنيين والعمال ومشغلي الآلات الإنشائية',
      count: 110,
      coverageDetails: 'مسؤولية أرباب العمل (Workmen\'s Comp) ومصاريف العلاج الطبي والعجز الدائم',
      policyNumber: 'POL-GRP-2026-0042'
    },
    {
      id: 'EMP-GRP-003',
      companyName: 'شركة الأفق للخدمات اللوجستية',
      tierName: 'سائقو أسطول الشحن ومشغلو الرافعات والمستودعات',
      count: 210,
      coverageDetails: 'تأمين جماعي للحوادث على الطرق وأثناء المناولة في المستودعات',
      policyNumber: 'POL-GRP-2026-0089'
    }
  ]);

  // Corporate Claims Data
  const [corporateClaims, setCorporateClaims] = useState<any[]>([
    {
      id: 'CLM-CORP-2026-015',
      companyName: 'شركة النور للمقاولات العامة',
      policyNumber: 'POL-CORP-2026-0081',
      incidentType: 'عطل مفاجئ في مضخة باطون وسقوط ذراع أثناء صب جسر',
      date: '2026-08-05',
      lossEstimate: 75000,
      approvedAmount: 68000,
      status: 'IN_SETTLEMENT',
      statusLabel: 'جاري تسوية التعويض مع المورد المعتمد'
    },
    {
      id: 'CLM-CORP-2026-011',
      companyName: 'شركة الأفق للخدمات اللوجستية',
      policyNumber: 'POL-CORP-2026-0112',
      incidentType: 'تلف شحنة منتجات ألبان مبردة نتيجة انقطاع دائرة تبريد فرعية',
      date: '2026-07-28',
      lossEstimate: 42000,
      approvedAmount: 39500,
      status: 'APPROVED',
      statusLabel: 'تمت الموافقة وجاري التحويل البنكي'
    }
  ]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCompanies = companies.filter(c => 
    c.companyName.includes(searchQuery) ||
    c.commercialRegistration.includes(searchQuery) ||
    c.taxNumber.includes(searchQuery) ||
    c.authorizedPerson.includes(searchQuery)
  );

  return (
    <div className="space-y-6 text-right font-sans text-xs text-[#F1F5F9]" dir="rtl">
      
      {/* HEADER BANNER */}
      <div className="bg-[#2A323A] rounded-3xl p-6 border border-[#3A434C] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 shrink-0">
              <Factory className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black">
                  قطاع تأمين الشركات والمؤسسات الكبرى
                </span>
                <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  حلول التغطية الشاملة للأعمال (Commercial Lines)
                </span>
              </div>
              <h1 className="text-xl font-black text-white mt-1">
                منظومة تأمين الشركات والمصانع (Corporate Insurance Sector)
              </h1>
              <p className="text-[#AAB2BA] text-xs mt-1">
                إدارة السجلات التجارية، الفروع، الآلات والمعدات الثقيلة، وثائق مسؤولية أرباب العمل، والتأمين الجماعي للموظفين
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setShowAddCompanyModal(true)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة ملف شركة جديدة</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddBranchModal(true)}
              className="px-4 py-2.5 bg-[#1D4ED8] hover:bg-[#2563EB] text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Building className="w-4 h-4" />
              <span>ربط فرع / موقع صناعي</span>
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mt-6 pt-6 border-t border-[#3A434C]/60">
          <div className="bg-[#1C2229] p-3.5 rounded-2xl border border-[#3A434C]">
            <div className="flex items-center justify-between text-[#AAB2BA] mb-1">
              <span className="text-[10px] font-bold">الشركات المؤمنة</span>
              <Factory className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl font-black text-white font-mono">{companies.length}</div>
            <span className="text-[9px] text-emerald-400 font-bold">مجموعات وشركات مساهمة</span>
          </div>

          <div className="bg-[#1C2229] p-3.5 rounded-2xl border border-[#3A434C]">
            <div className="flex items-center justify-between text-[#AAB2BA] mb-1">
              <span className="text-[10px] font-bold">الفروع والمواقع المشمولة</span>
              <Building className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-black text-white font-mono">{branches.length}</div>
            <span className="text-[9px] text-blue-400 font-bold">مصانع، مستودعات، مقرات</span>
          </div>

          <div className="bg-[#1C2229] p-3.5 rounded-2xl border border-[#3A434C]">
            <div className="flex items-center justify-between text-[#AAB2BA] mb-1">
              <span className="text-[10px] font-bold">قيمة الآلات والمعدات</span>
              <Cpu className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-lg font-black text-emerald-400 font-mono">
              {(companies.reduce((acc, curr) => acc + (curr.insuredAssetsValue || 0), 0) / 1000000).toFixed(1)}M ₪
            </div>
            <span className="text-[9px] text-[#AAB2BA] font-bold">خطوط إنتاج وآليات ثقيلة</span>
          </div>

          <div className="bg-[#1C2229] p-3.5 rounded-2xl border border-[#3A434C]">
            <div className="flex items-center justify-between text-[#AAB2BA] mb-1">
              <span className="text-[10px] font-bold">الموظفون المشمولون بالتأمين</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-black text-white font-mono">
              {companies.reduce((acc, curr) => acc + (curr.employeesCount || 0), 0)}
            </div>
            <span className="text-[9px] text-amber-400 font-bold">تأمين جماعي وإصابات عمل</span>
          </div>

          <div className="bg-[#1C2229] p-3.5 rounded-2xl border border-[#3A434C]">
            <div className="flex items-center justify-between text-[#AAB2BA] mb-1">
              <span className="text-[10px] font-bold">المطالبات الصناعية النشطة</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl font-black text-white font-mono">{corporateClaims.length}</div>
            <span className="text-[9px] text-rose-400 font-bold">قيد التسوية والصرف</span>
          </div>
        </div>
      </div>

      {/* SUB TABS NAVIGATION */}
      <div className="bg-[#2A323A] rounded-2xl p-1.5 border border-[#3A434C] flex items-center gap-1.5 overflow-x-auto shadow-md">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#323A40]'
          }`}
        >
          <Factory className="w-4 h-4" />
          <span>ملف الشركة والسجل التجاري</span>
          <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-white text-[10px]">{companies.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('branches')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'branches'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#323A40]'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>الفروع والمواقع والمنشآت</span>
          <span className="px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px]">{branches.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('assets')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'assets'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#323A40]'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>الأصول والمعدات والمخزون</span>
          <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px]">{assets.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('liabilities')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'liabilities'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#323A40]'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>المسؤوليات والتغطيات المهنية</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('employees')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'employees'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#323A40]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>الموظفون المشمولون (التأمين الجماعي)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('policies_claims')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'policies_claims'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#323A40]'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>البوالص والمطالبات الصناعية</span>
          <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px]">{corporateClaims.length}</span>
        </button>
      </div>

      {/* TAB 1: COMPANY PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-[#2A323A] rounded-3xl border border-[#3A434C] shadow-lg overflow-hidden space-y-4">
          <div className="p-5 border-b border-[#3A434C] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <Factory className="w-4 h-4 text-purple-400" />
                سجل الشركات والمجموعات التجارية المؤمنة
              </h2>
              <p className="text-[11px] text-[#AAB2BA] mt-0.5">
                بيانات السجل التجاري، الأرقام الضريبية، الممثلين القانونيين، وحجم الأصول المشمولة بالتأمين
              </p>
            </div>

            <div className="relative min-w-[280px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث باسم الشركة، السجل التجاري، المدير..."
                className="w-full bg-[#1C2229] border border-[#3A434C] rounded-xl px-3.5 py-2 pr-9 text-white placeholder-[#64748B] text-xs focus:outline-none focus:border-purple-500"
              />
              <Search className="w-4 h-4 text-[#64748B] absolute right-3 top-2.5" />
            </div>
          </div>

          <div className="p-5 space-y-4">
            {filteredCompanies.map((comp) => (
              <div key={comp.id} className="bg-[#1C2229] rounded-2xl border border-[#3A434C] p-5 space-y-4 hover:border-purple-500/50 transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#2A323A] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-xl font-black">
                      🏭
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-white">{comp.companyName}</h3>
                        <span className="px-2 py-0.5 rounded-md bg-[#2A323A] text-purple-300 font-mono text-[10px] font-bold">
                          {comp.legalForm}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#AAB2BA] mt-0.5 font-bold">{comp.industrySector}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end lg:self-auto">
                    <button
                      type="button"
                      onClick={() => onOpenPolicyholder && onOpenPolicyholder(comp.policyholderId)}
                      className="px-3.5 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-600/30 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>الملف الموحد الشامل</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#131920] p-3.5 rounded-xl border border-[#2A323A] text-[11px]">
                  <div>
                    <span className="text-[#AAB2BA] block text-[10px]">رقم السجل التجاري:</span>
                    <span className="font-mono font-bold text-white">{comp.commercialRegistration}</span>
                  </div>
                  <div>
                    <span className="text-[#AAB2BA] block text-[10px]">الرقم الضريبي:</span>
                    <span className="font-mono font-bold text-emerald-400">{comp.taxNumber}</span>
                  </div>
                  <div>
                    <span className="text-[#AAB2BA] block text-[10px]">الممثل القانوني / المدير:</span>
                    <span className="font-bold text-white">{comp.authorizedPerson}</span>
                  </div>
                  <div>
                    <span className="text-[#AAB2BA] block text-[10px]">المقر الرئيسي:</span>
                    <span className="font-bold text-white truncate block">{comp.headquartersAddress}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] pt-1">
                  <div className="flex items-center gap-4 text-[#AAB2BA]">
                    <span>الفروع والمنشآت: <strong className="text-white">{comp.branchesCount} فروع</strong></span>
                    <span>•</span>
                    <span>إجمالي الأصول المؤمنة: <strong className="text-emerald-400 font-mono">{(comp.insuredAssetsValue / 1000000).toFixed(1)}M ₪</strong></span>
                    <span>•</span>
                    <span>الكادر البشري: <strong className="text-amber-400 font-mono">{comp.employeesCount} موظف</strong></span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className="text-[#AAB2BA]">الوثيقة المجمعة:</span>
                    <span className="text-blue-400 font-bold">{comp.masterPolicyNumber}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: BRANCHES & FACILITIES */}
      {activeTab === 'branches' && (
        <div className="bg-[#2A323A] rounded-3xl border border-[#3A434C] p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-[#3A434C] pb-4">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-400" />
                فروع ومواقع ومنشآت الشركات المؤمن عليها
              </h2>
              <p className="text-[11px] text-[#AAB2BA] mt-0.5">
                تتبع المصانع والمستودعات الإقليمية ومراكز التوزيع الخاضعة لبوالص التأمين الصناعي
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddBranchModal(true)}
              className="px-3.5 py-2 bg-[#1D4ED8] hover:bg-[#2563EB] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة فرع / موقع جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map((b) => (
              <div key={b.id} className="bg-[#1C2229] rounded-2xl border border-[#3A434C] p-5 space-y-3.5 hover:border-blue-500/40 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-mono text-[10px] font-bold border border-blue-500/20">
                      {b.branchType}
                    </span>
                    <h3 className="font-black text-white text-sm mt-1.5">{b.branchName}</h3>
                    <span className="text-[10px] text-purple-300 font-bold">{b.companyName}</span>
                  </div>

                  <span className="font-mono text-emerald-400 font-black text-xs">
                    {(b.insuredValue / 1000000).toFixed(1)}M ₪
                  </span>
                </div>

                <div className="bg-[#131920] p-3 rounded-xl border border-[#2A323A] space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5 text-white">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{b.city} - {b.governorate} ({b.address})</span>
                  </div>
                  <div className="flex justify-between text-[#AAB2BA] text-[10px] pt-1 border-t border-[#2A323A]">
                    <span>مدير الموقع: <strong className="text-white">{b.managerName}</strong></span>
                    <span className="font-mono text-blue-400">{b.phone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: INSURED ASSETS & MACHINERY */}
      {activeTab === 'assets' && (
        <div className="bg-[#2A323A] rounded-3xl border border-[#3A434C] p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-[#3A434C] pb-4">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                سجل الآلات والمعدات الثقيلة والمخزون المؤمن عليه
              </h2>
              <p className="text-[11px] text-[#AAB2BA] mt-0.5">
                تأمين عطل الآلات (Machinery Breakdown)، خطوط الإنتاج الآلية، ومعدات ومخازن الشركات
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddAssetModal(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة آلة / أصل صناعي</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assets.map((ast) => (
              <div key={ast.id} className="bg-[#1C2229] rounded-2xl border border-[#3A434C] p-5 space-y-3 hover:border-emerald-500/40 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                      {ast.assetCategory}
                    </span>
                    <h3 className="font-black text-white text-sm mt-1.5">{ast.assetName}</h3>
                    <span className="text-[10px] text-[#AAB2BA]">{ast.companyName}</span>
                  </div>

                  <div className="text-left">
                    <span className="text-[10px] text-[#AAB2BA] block">القيمة التقديرية:</span>
                    <span className="font-mono font-black text-emerald-400 text-sm">{ast.estimatedValue.toLocaleString()} ₪</span>
                  </div>
                </div>

                <div className="bg-[#131920] p-3 rounded-xl border border-[#2A323A] text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#AAB2BA]">الرقم التسلسلي (Serial No):</span>
                    <span className="font-mono font-bold text-white">{ast.serialNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#AAB2BA]">الموقع التشغيلي:</span>
                    <span className="font-bold text-white">{ast.branchLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#AAB2BA]">نوع التغطية:</span>
                    <span className="font-bold text-amber-300">{ast.coverageType}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LIABILITIES */}
      {activeTab === 'liabilities' && (
        <div className="bg-[#2A323A] rounded-3xl border border-[#3A434C] p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-[#3A434C] pb-4">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
                وثائق المسؤوليات القانونية والمهنية للشركات
              </h2>
              <p className="text-[11px] text-[#AAB2BA] mt-0.5">
                تغطية مسؤولية أرباب العمل، المسؤولية العامة تجاه الغير، وخيانة الأمانة وحماية أموال المؤسسة
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#1C2229] rounded-2xl border border-indigo-500/30 p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-white">مسؤولية أرباب العمل (Workmen's Comp)</h3>
              <p className="text-[11px] text-[#AAB2BA] leading-relaxed">
                حماية صاحب العمل من المطالبات والتعويضات الناشئة عن إصابات العمل أو الوفاة أو العجز للموظفين أثناء تأدية المهام.
              </p>
              <div className="pt-2 text-[10px] font-bold text-indigo-400">تغطية إلزامية قانونية لكافة المنشآت</div>
            </div>

            <div className="bg-[#1C2229] rounded-2xl border border-blue-500/30 p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-white">المسؤولية المدنية العامة (Public Liability)</h3>
              <p className="text-[11px] text-[#AAB2BA] leading-relaxed">
                تغطية الأضرار الجسدية أو المادية التي قد تلحق بالغير أو الزوار أو الممتلكات المجاورة داخل مواقع العمل والمنشآت.
              </p>
              <div className="pt-2 text-[10px] font-bold text-blue-400">شاملة تكاليف الدفاع القانوني</div>
            </div>

            <div className="bg-[#1C2229] rounded-2xl border border-emerald-500/30 p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-white">انقطاع الأعمال (Business Interruption)</h3>
              <p className="text-[11px] text-[#AAB2BA] leading-relaxed">
                تعويض صافي الأرباح الفائتة والمصاريف الثابتة ورواتب الموظفين في حال توقف المصنع أو المنشأة عن العمل نتيجة حادث مغطى.
              </p>
              <div className="pt-2 text-[10px] font-bold text-emerald-400">ضمان استمرارية النشاط التجاري</div>
            </div>

            <div className="bg-[#1C2229] rounded-2xl border border-purple-500/30 p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-white">خيانة الأمانة ونقل الأموال (Fidelity Guarantee)</h3>
              <p className="text-[11px] text-[#AAB2BA] leading-relaxed">
                تغطية الخسائر المالية المباشرة الناتجة عن أعمال الاحتيال أو الاختلاس من الموظفين أو أثناء نقل الأموال بين البنوك والفروع.
              </p>
              <div className="pt-2 text-[10px] font-bold text-purple-400">حماية الخزائن والأصول النقدية</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: EMPLOYEES GROUPS */}
      {activeTab === 'employees' && (
        <div className="bg-[#2A323A] rounded-3xl border border-[#3A434C] p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-[#3A434C] pb-4">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                الموظفون المشمولون والتأمين الجماعي للشركات
              </h2>
              <p className="text-[11px] text-[#AAB2BA] mt-0.5">
                إدارة كشوفات الموظفين المشمولين بتأمين إصابات العمل والحوادث الشخصية والتأمين الصحي المؤسسي
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {employeesGroups.map((grp) => (
              <div key={grp.id} className="bg-[#1C2229] rounded-2xl border border-[#3A434C] p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-black text-white text-sm">{grp.tierName}</h3>
                    <span className="text-[11px] text-purple-300 font-bold">{grp.companyName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 font-black text-xs font-mono">
                      {grp.count} موظف مشمول
                    </span>
                    <span className="font-mono text-blue-400 text-xs font-bold">{grp.policyNumber}</span>
                  </div>
                </div>

                <div className="bg-[#131920] p-3 rounded-xl border border-[#2A323A] text-[11px] text-[#CBD5E1]">
                  <span className="text-[#AAB2BA] block font-bold mb-1">تفاصيل ومزايا التغطية المعتمدة:</span>
                  <p>{grp.coverageDetails}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: POLICIES & CLAIMS */}
      {activeTab === 'policies_claims' && (
        <div className="bg-[#2A323A] rounded-3xl border border-[#3A434C] p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-[#3A434C] pb-4">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                سجل المطالبات والبوالص الصناعية للشركات
              </h2>
              <p className="text-[11px] text-[#AAB2BA] mt-0.5">
                تتبع مطالبات عطل الآلات، تعويضات إصابات العمل، والخسائر الصناعية
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddClaimModal(true)}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل مطالبة شركة</span>
            </button>
          </div>

          <div className="space-y-4">
            {corporateClaims.map((clm) => (
              <div key={clm.id} className="bg-[#1C2229] rounded-2xl border border-[#3A434C] p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2A323A] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-white text-sm">{clm.id}</span>
                      <span className="px-2 py-0.5 bg-[#2A323A] font-mono text-[#AAB2BA] text-[10px]">بوليصة: {clm.policyNumber}</span>
                    </div>
                    <span className="text-xs font-bold text-white block mt-0.5">{clm.companyName}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <span className="text-[10px] text-[#AAB2BA] block">المبلغ المعتمد:</span>
                      <span className="text-emerald-400 font-mono font-black text-base">{clm.approvedAmount.toLocaleString()} ₪</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                      {clm.statusLabel}
                    </span>
                  </div>
                </div>

                <p className="text-white text-xs font-bold bg-[#131920] p-3 rounded-xl border border-[#2A323A]">
                  {clm.incidentType} (تاريخ الحادث: {clm.date})
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD COMPANY */}
      {showAddCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1C2229] border border-[#3A434C] rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#3A434C] pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Factory className="w-4 h-4 text-purple-400" />
                تسجيل شركة ومؤسسة مؤمنة جديدة
              </h3>
              <button onClick={() => setShowAddCompanyModal(false)} className="text-[#AAB2BA] hover:text-white">✕</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              setShowAddCompanyModal(false);
            }} className="space-y-3">
              <div>
                <label className="block text-[10px] text-[#AAB2BA] mb-1">اسم الشركة التجاري الكامل</label>
                <input type="text" placeholder="مثال: شركة القدس للصناعات العامة" required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#AAB2BA] mb-1">رقم السجل التجاري</label>
                  <input type="text" placeholder="562..." required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] text-[#AAB2BA] mb-1">الرقم الضريبي</label>
                  <input type="text" placeholder="TX-..." required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#AAB2BA] mb-1">الشكل القانوني</label>
                  <select className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs">
                    <option>شركة مساهمة خصوصية محدودة (Ltd)</option>
                    <option>شركة مساهمة عامة</option>
                    <option>مؤسسة فردية</option>
                    <option>شركة تضامن</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-[#AAB2BA] mb-1">القطاع / النشاط التجاري</label>
                  <input type="text" placeholder="مقاولات / صناعة / شحن..." required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#AAB2BA] mb-1">المدير العام / المفوض بالتوقيع</label>
                <input type="text" placeholder="الاسم الكامل ورقم التواصل" required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#3A434C]">
                <button type="button" onClick={() => setShowAddCompanyModal(false)} className="px-4 py-2 bg-[#2A323A] text-white rounded-xl text-xs">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold">تسجيل وتأكيد ملف الشركة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD BRANCH */}
      {showAddBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1C2229] border border-[#3A434C] rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#3A434C] pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-400" />
                إضافة فرع أو موقع صناعي جديد
              </h3>
              <button onClick={() => setShowAddBranchModal(false)} className="text-[#AAB2BA] hover:text-white">✕</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              setShowAddBranchModal(false);
            }} className="space-y-3">
              <div>
                <label className="block text-[10px] text-[#AAB2BA] mb-1">الشركة المالكة</label>
                <select className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs">
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#AAB2BA] mb-1">اسم الفرع / المنشأة</label>
                  <input type="text" placeholder="مثال: مصنع الخرسانة - طولكرم" required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] text-[#AAB2BA] mb-1">نوع المنشأة</label>
                  <select className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs">
                    <option>مقر إداري رئيسي</option>
                    <option>مصنع / موقع إنتاج</option>
                    <option>مستودع مركزي / مخزن</option>
                    <option>معرض ومحل بيع</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#AAB2BA] mb-1">المدينة والمحافظة</label>
                  <input type="text" placeholder="نابلس / الخليل..." required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] text-[#AAB2BA] mb-1">القيمة التأمينية للموقع (₪)</label>
                  <input type="number" placeholder="5000000" required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs font-mono" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#3A434C]">
                <button type="button" onClick={() => setShowAddBranchModal(false)} className="px-4 py-2 bg-[#2A323A] text-white rounded-xl text-xs">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold">حفظ الفرع</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ASSET */}
      {showAddAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1C2229] border border-[#3A434C] rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#3A434C] pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                إضافة آلة أو معدة صناعية للتأمين
              </h3>
              <button onClick={() => setShowAddAssetModal(false)} className="text-[#AAB2BA] hover:text-white">✕</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              setShowAddAssetModal(false);
            }} className="space-y-3">
              <div>
                <label className="block text-[10px] text-[#AAB2BA] mb-1">الشركة المالكة</label>
                <select className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs">
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#AAB2BA] mb-1">اسم الآلة / المعدة</label>
                  <input type="text" placeholder="مثال: حفار كاتربيلر أو خط تعبئة" required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] text-[#AAB2BA] mb-1">الرقم التسلسلي (Serial No)</label>
                  <input type="text" placeholder="SN-..." required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#AAB2BA] mb-1">تصنيف الأصل</label>
                  <select className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs">
                    <option>معدات وآليات ثقيلة</option>
                    <option>خطوط إنتاج آلية</option>
                    <option>أنظمة تبريد وتخزين</option>
                    <option>أجهزة ومعدات إلكترونية ومختبرات</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-[#AAB2BA] mb-1">القيمة التقديرية للآلة (₪)</label>
                  <input type="number" placeholder="1000000" required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs font-mono" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#3A434C]">
                <button type="button" onClick={() => setShowAddAssetModal(false)} className="px-4 py-2 bg-[#2A323A] text-white rounded-xl text-xs">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold">حفظ وإضافة الأصل</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CLAIM */}
      {showAddClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1C2229] border border-[#3A434C] rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#3A434C] pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                تسجيل مطالبة شركة / خسارة صناعية
              </h3>
              <button onClick={() => setShowAddClaimModal(false)} className="text-[#AAB2BA] hover:text-white">✕</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              setShowAddClaimModal(false);
            }} className="space-y-3">
              <div>
                <label className="block text-[10px] text-[#AAB2BA] mb-1">الشركة المتضررة</label>
                <select className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs">
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#AAB2BA] mb-1">طبيعة الحادث أو العطل</label>
                <input type="text" placeholder="عطل آلة / إصابة عمل / تلف مخزون..." required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs" />
              </div>

              <div>
                <label className="block text-[10px] text-[#AAB2BA] mb-1">الخسارة التقديرية (₪)</label>
                <input type="number" placeholder="50000" required className="w-full bg-[#131920] border border-[#3A434C] rounded-xl px-3 py-2 text-white text-xs font-mono" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#3A434C]">
                <button type="button" onClick={() => setShowAddClaimModal(false)} className="px-4 py-2 bg-[#2A323A] text-white rounded-xl text-xs">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold">تسجيل المطالبة وتوجيه الخبير</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
