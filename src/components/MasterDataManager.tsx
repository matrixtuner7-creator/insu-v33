import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Plus, 
  Search, 
  Edit2, 
  ToggleLeft, 
  ToggleRight, 
  History, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  Info
} from 'lucide-react';

// Define the structure of a Master Data item
interface MasterDataItem {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  description: string | null;
  category: string;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  companyId: string | null;
  branchId: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Define MDM Category schema description
interface MdmCategory {
  key: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  hierarchical: boolean;
  parentCategoryKey?: string; // If hierarchical, what represents parent items
}

const MDM_CATEGORIES: MdmCategory[] = [
  {
    key: 'incident_types',
    nameAr: 'أنواع الحوادث',
    nameEn: 'Incident Types',
    descriptionAr: 'تصنيف الحوادث الرسمية مثل تصادم، دهس، حريق، سرقة.. إلخ',
    descriptionEn: 'Official incident classifications (collision, pedestrian, fire, theft, etc.)',
    hierarchical: false
  },
  {
    key: 'accident_severities',
    nameAr: 'درجات خطورة الحادث',
    nameEn: 'Incident Severities',
    descriptionAr: 'مستويات الخطورة والأولوية للبلاغات مثل طفيف، متوسط، بليغ، حرج',
    descriptionEn: 'Severity and priority levels (minor, moderate, severe, critical)',
    hierarchical: false
  },
  {
    key: 'incident_statuses',
    nameAr: 'حالات القضية أو الملف',
    nameEn: 'Incident Statuses',
    descriptionAr: 'دورة حياة البلاغ والملف مثل جديد، قيد المعاينة، مكتمل، مغلق',
    descriptionEn: 'Case lifecycle statuses (new, under-inspection, completed, closed)',
    hierarchical: false
  },
  {
    key: 'incident_sources',
    nameAr: 'مصادر البلاغ والشكاوى',
    nameEn: 'Incident Sources',
    descriptionAr: 'قنوات استلام الحوادث مثل الهاتف، تطبيق جوال، دفاع مدني، شرطة',
    descriptionEn: 'Reporting channels (phone, mobile app, civil defense, police)',
    hierarchical: false
  },
  {
    key: 'locations',
    nameAr: 'المحافظات والمدن والمناطق',
    nameEn: 'Locations & Governorates',
    descriptionAr: 'التقسيمات الجغرافية والمدن والقرى في فلسطين (نابلس، جنين، رام الله...)',
    descriptionEn: 'Geographical regions, governorates, and towns in Palestine',
    hierarchical: true,
    parentCategoryKey: 'locations' // Locations can parent other locations (Governorate -> City -> Area)
  },
  {
    key: 'vehicle_types',
    nameAr: 'أنواع المركبات',
    nameEn: 'Vehicle Types',
    descriptionAr: 'تصنيفات المركبات مثل خصوصي، تجاري، عمومي، شاحنة، دراجة نارية',
    descriptionEn: 'Vehicle classifications (private, commercial, public, truck, motorcycle)',
    hierarchical: false
  },
  {
    key: 'vehicle_specs',
    nameAr: 'مواصفات وخصائص المركبة',
    nameEn: 'Vehicle Specs & features',
    descriptionAr: 'قوائم المواصفات والكماليات ونوع المحرك، لون الهيكل، بلد المنشأ',
    descriptionEn: 'Vehicle technical specifications, engine types, colors, origin',
    hierarchical: false
  },
  {
    key: 'party_types',
    nameAr: 'صفة السائق أو الأطراف المتضررة',
    nameEn: 'Party Roles / Types',
    descriptionAr: 'صفة الشخص في الحادث مثل سائق مؤمن، طرف ثالث، مشاة، راكب',
    descriptionEn: 'Role of involved individuals (insured driver, third party, pedestrian, passenger)',
    hierarchical: false
  },
  {
    key: 'damage_types',
    nameAr: 'أنواع الأضرار',
    nameEn: 'Damage Types',
    descriptionAr: 'تصنيف الأضرار مثل أضرار هيكلية، أضرار ميكانيكية، جسدية، خسارة كلية',
    descriptionEn: 'Damage classifications (structural, mechanical, bodily, total loss)',
    hierarchical: false
  },
  {
    key: 'damage_zones',
    nameAr: 'أجزاء المركبة المتضررة',
    nameEn: 'Damage Zones / Parts',
    descriptionAr: 'الواجهة الأمامية، الجهة الخلفية، الجانب الأيمن، السقف، زجاج أمامي',
    descriptionEn: 'Impact areas on the vehicle (front, rear, right-side, roof, windshield)',
    hierarchical: false
  },
  {
    key: 'vandalism_types',
    nameAr: 'أنواع التعديات والتخريب',
    nameEn: 'Vandalism & Sabotage Types',
    descriptionAr: 'أعمال تخريب متعمدة، خطوط وكتابة، تكسير زجاج عمد، ثقب إطارات',
    descriptionEn: 'Malicious damage and sabotage (vandalism, scratching, tire puncturing)',
    hierarchical: false
  },
  {
    key: 'theft_types',
    nameAr: 'تصنيفات وأنواع السرقة',
    nameEn: 'Theft Classifications',
    descriptionAr: 'سرقة مركبة بالكامل، سرقة قطع من المركبة، سرقة محتويات داخلية',
    descriptionEn: 'Theft types (full vehicle, parts theft, interior contents theft)',
    hierarchical: false
  },
  {
    key: 'fraud_types',
    nameAr: 'أنواع الاحتيال التأميني',
    nameEn: 'Insurance Fraud Types',
    descriptionAr: 'افتعال حادث، تضخيم الأضرار، تبديل سائق، تقرير طبي مزور',
    descriptionEn: 'Insurance fraud categories (staged accident, inflated damages, driver swap, fake medical report)',
    hierarchical: false
  },
  {
    key: 'investigation_steps',
    nameAr: 'إجراءات التحقيق ومراحل العمل',
    nameEn: 'Investigation Steps',
    descriptionAr: 'خطوات العمل الإداري مثل معاينة الميدان، استجواب الأطراف، تدقيق البوليسة',
    descriptionEn: 'Standard investigation steps and workflows for researchers',
    hierarchical: false
  },
  {
    key: 'required_documents',
    nameAr: 'المستندات المطلوبة لملف الحادث',
    nameEn: 'Required Documents',
    descriptionAr: 'رخصة القيادة، رخصة المركبة، تقرير الشرطة، شهادة التأمين، الهوية الشخصية',
    descriptionEn: 'Required file documentation (driver license, registration, police report, insurance cert)',
    hierarchical: false
  },
  {
    key: 'license_types',
    nameAr: 'أنواع رخص المحققين',
    nameEn: 'Investigator License Types',
    descriptionAr: 'رخص الممارسة مثل محقق حوادث معتمد، مهندس معاينة، خبير جنائي مرخص',
    descriptionEn: 'Professional credentials and designations for field agents',
    hierarchical: false
  },
  {
    key: 'emergency_contacts',
    nameAr: 'جهات الاتصال الرسمية والطوارئ',
    nameEn: 'Emergency Contacts',
    descriptionAr: 'أرقام الدفاع المدني، الهلال الأحمر، مراكز الشرطة في المحافظات',
    descriptionEn: 'Police, Red Crescent, Civil Defense contact centers by governorate',
    hierarchical: false
  },
  {
    key: 'insurance_covers',
    nameAr: 'أنواع بوالص التأمين',
    nameEn: 'Insurance Coverages',
    descriptionAr: 'تغطيات التأمين مثل تأمين إلزامي، طرف ثالث، تأمين شامل، تأمين ركاب',
    descriptionEn: 'Insurance products and technical coverage types',
    hierarchical: false
  },
  {
    key: 'insurance_companies',
    nameAr: 'شركات التأمين الزميلة والمنافسة',
    nameEn: 'Insurance Companies',
    descriptionAr: 'قائمة شركات التأمين العاملة في السوق الفلسطيني لإجراء المراسلات والتسويات',
    descriptionEn: 'Local insurance companies for recovery and subrogation purposes',
    hierarchical: false
  },
  {
    key: 'repair_shops',
    nameAr: 'كراجات التصليح والصيانة المعتمدة',
    nameEn: 'Approved Repair Shops',
    descriptionAr: 'الورش المعتمدة لتصليح أضرار المركبات في الضفة الغربية',
    descriptionEn: 'Partner repair facilities and mechanics certified by the operations',
    hierarchical: false
  },
  {
    key: 'loss_adjusters',
    nameAr: 'خبراء المعاينة والتقدير المعتمدين',
    nameEn: 'Loss Adjusters & Assessors',
    descriptionAr: 'مخمني السيارات والمقدرين المرخصين المعتمدين للمعاينة المشتركة',
    descriptionEn: 'Certified independent vehicle surveyors and damage assessors',
    hierarchical: false
  },
  {
    key: 'banks',
    nameAr: 'البنوك والمصارف المعتمدة',
    nameEn: 'Partner Banks',
    descriptionAr: 'البنوك المحلية المستخدمة لصرف التعويضات وإرسال التحويلات المالية',
    descriptionEn: 'Local financial institutions for wire transfers and settlements',
    hierarchical: false
  },
  {
    key: 'customer_segments',
    nameAr: 'فئات العملاء ومستويات الخدمة',
    nameEn: 'Customer Segments & SLA',
    descriptionAr: 'مستويات العملاء مثل الأفراد، الحسابات الكبرى، الأساطيل، كبار الشخصيات',
    descriptionEn: 'Customer categories and service levels (retail, corporate fleets, VIP)',
    hierarchical: false
  },
  {
    key: 'rejection_reasons',
    nameAr: 'أسباب الرفض أو التحفظ',
    nameEn: 'Claim Rejection Reasons',
    descriptionAr: 'أسباب رفض المطالبة قانونياً مثل رخصة منتهية، خارج التغطية، شبهة احتيال',
    descriptionEn: 'Legal claim rejection reasons (expired license, exclusion list, fraud suspicion)',
    hierarchical: false
  },
  {
    key: 'currencies',
    nameAr: 'أنواع العملات والتسوية',
    nameEn: 'Currencies & Settlements',
    descriptionAr: 'العملات المقبولة في المعاملات مثل الدينار الأردني، الشيكل الإسرائيلي، الدولار الأمريكي',
    descriptionEn: 'Accepted payment currencies (ILS, JOD, USD)',
    hierarchical: false
  }
];

export const MasterDataManager: React.FC = () => {
  // State for categories and selected category
  const [selectedCategory, setSelectedCategory] = useState<MdmCategory>(MDM_CATEGORIES[0]);
  const [items, setItems] = useState<MasterDataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MasterDataItem | null>(null);
  
  // Form fields
  const [formCode, setFormCode] = useState<string>('');
  const [formNameAr, setFormNameAr] = useState<string>('');
  const [formNameEn, setFormNameEn] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formParentId, setFormParentId] = useState<string>('');
  const [formSortOrder, setFormSortOrder] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  
  // Audit log state
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [showAuditLog, setShowAuditLog] = useState<boolean>(false);

  // Load items when category changes
  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/master-data?category=${selectedCategory.key}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      } else {
        console.error('Failed to fetch master data items');
      }
    } catch (err) {
      console.error('Error fetching master data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch audit logs for current MDM activities
  const fetchMdmAuditLogs = async () => {
    try {
      const response = await fetch('/api/audit-logs');
      if (response.ok) {
        const logs = await response.json();
        // Filter logs related to Master Data Management
        const mdmLogs = logs.filter((log: any) => 
          log.details && (
            log.details.includes('البيانات التعريفية') || 
            log.details.includes('Master Data') || 
            log.details.includes('master-data') || 
            log.details.includes(selectedCategory.nameAr) ||
            log.details.includes(selectedCategory.key)
          )
        );
        setAuditLogs(mdmLogs);
      }
    } catch (err) {
      console.error('Error fetching MDM audits:', err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchMdmAuditLogs();
  }, [selectedCategory]);

  // Handle open add modal
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormCode('');
    setFormNameAr('');
    setFormNameEn('');
    setFormDescription('');
    setFormParentId('');
    setFormSortOrder(items.length * 10);
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEditModal = (item: MasterDataItem) => {
    setEditingItem(item);
    setFormCode(item.code);
    setFormNameAr(item.nameAr);
    setFormNameEn(item.nameEn);
    setFormDescription(item.description || '');
    setFormParentId(item.parentId || '');
    setFormSortOrder(item.sortOrder);
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  // Form submission: Add or Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formCode.trim()) {
      setErrorMsg('كود البند مطلوب لضمان فرادة المعرفات في قاعدة البيانات');
      return;
    }
    if (!formNameAr.trim()) {
      setErrorMsg('الاسم باللغة العربية مطلوب');
      return;
    }
    if (!formNameEn.trim()) {
      setErrorMsg('الاسم باللغة الإنجليزية مطلوب لضمان الشفافية ثنائية اللغة');
      return;
    }

    const payload = {
      code: formCode.trim().toUpperCase(),
      nameAr: formNameAr.trim(),
      nameEn: formNameEn.trim(),
      description: formDescription.trim() || null,
      category: selectedCategory.key,
      parentId: formParentId || null,
      sortOrder: Number(formSortOrder) || 0,
      companyId: 'comp-1', // Default system company
      branchId: 'branch-1'  // Default main branch
    };

    try {
      let response;
      if (editingItem) {
        // Update existing item
        response = await fetch(`/api/master-data/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new item
        response = await fetch('/api/master-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const result = await response.json();

      if (response.ok) {
        setSuccessMsg(editingItem ? 'تم تحديث البيانات بنجاح في النظام!' : 'تمت إضافة البند التعريفي وتعميمه بنجاح!');
        setTimeout(() => {
          setIsModalOpen(false);
          fetchItems();
          fetchMdmAuditLogs();
        }, 1200);
      } else {
        setErrorMsg(result.error || 'حدث خطأ أثناء حفظ البيانات، يرجى التحقق من الكود المكرر');
      }
    } catch (err) {
      setErrorMsg('خطأ في الاتصال بالخادم. يرجى إعادة المحاولة.');
    }
  };

  // Soft delete / Toggle active status
  const handleToggleActive = async (item: MasterDataItem) => {
    try {
      const response = await fetch(`/api/master-data/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          isActive: !item.isActive
        })
      });

      if (response.ok) {
        fetchItems();
        fetchMdmAuditLogs();
      } else {
        alert('حدث خطأ في تفعيل أو تعطيل البند');
      }
    } catch (err) {
      console.error('Error toggling state:', err);
    }
  };

  // Soft delete completely (Deactivate with warning status)
  const handleSoftDelete = async (item: MasterDataItem) => {
    const confirmDelete = window.confirm(`هل أنت متأكد من تعطيل وحذف بند "${item.nameAr}"؟ لن يتم حذفه فيزئياً لحماية السجلات التاريخية للحوادث، ولكن سيعطل استخدامه في القوائم المستقبيلية.`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/master-data/${item.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchItems();
        fetchMdmAuditLogs();
      } else {
        alert('فشل في إلغاء تفعيل البند');
      }
    } catch (err) {
      console.error('Error soft deleting:', err);
    }
  };

  // Filter items based on search query and active status
  const filteredItems = items.filter(item => {
    // Text search
    const matchesSearch = 
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    // Status filter
    if (statusFilter === 'active') {
      return matchesSearch && item.isActive === true;
    } else if (statusFilter === 'disabled') {
      return matchesSearch && item.isActive === false;
    }
    return matchesSearch;
  });

  // For parenting support: Filter items of the same category that are governorates/parent items
  const parentCandidates = items.filter(item => item.isActive && (!editingItem || item.id !== editingItem.id));

  return (
    <div className="flex-1 p-6 space-y-6" dir="rtl">
      {/* Title & Info Banner */}
      <div className="bg-[#2A323A] text-white p-6 rounded-3xl shadow-xl border border-[#3A434C] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#315EF5]/10 text-[#315EF5] flex items-center justify-center border border-[#315EF5]/20">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-base font-black flex items-center gap-2 text-[#F1F5F9]">
              <span>مركز البيانات التعريفية الموحد (MDM)</span>
            </h2>
          </div>
          <p className="text-xs text-[#AAB2BA] mt-2 leading-relaxed max-w-3xl">
            نظام إدارة المعاجم والقواميس الموحد لمنع تداخل أو ترميز الخيارات داخل شاشات العمل. يمكنك إضافة أو تعديل أو تجميد أي خيار (مثل أنواع الحوادث، المحافظات، صفات الأطراف) وتعميمها فورياً على جميع بوابات العمل وشاشة المحقق الميداني.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowAuditLog(!showAuditLog)}
            className={`px-4 py-2 text-xs font-bold rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
              showAuditLog 
                ? 'bg-[#315EF5] text-white border-[#315EF5]' 
                : 'bg-[#161B1F] text-[#AAB2BA] border-[#3A434C] hover:text-[#F1F5F9]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>سجل الرقابة والأمان ({auditLogs.length})</span>
          </button>
          
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-[#315EF5] hover:bg-[#2549d4] text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة بند لـ {selectedCategory.nameAr}</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* RIGHT COLUMN: 25 Categories Selection Sidebar */}
        <div className="xl:col-span-1 bg-[#2A323A] rounded-3xl p-4 border border-[#3A434C] flex flex-col h-[650px] overflow-hidden">
          <div className="pb-3 border-b border-[#3A434C] mb-3">
            <h3 className="font-bold text-xs text-[#F1F5F9] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#315EF5]" />
              <span>فئات وقواميس النظام ({MDM_CATEGORIES.length})</span>
            </h3>
            <p className="text-[10px] text-[#AAB2BA] mt-1">اختر القاموس المراد تعديله وتصفح بنوده</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-right">
            {MDM_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory.key === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-right p-3 rounded-xl transition-all flex items-center justify-between gap-3 group cursor-pointer border ${
                    isSelected 
                      ? 'bg-[#315EF5]/10 text-[#315EF5] border-[#315EF5]/30 shadow-sm' 
                      : 'bg-[#161B1F]/40 hover:bg-[#161B1F] text-[#AAB2BA] hover:text-[#F1F5F9] border-transparent'
                  }`}
                >
                  <div className="min-w-0">
                    <div className={`font-bold text-xs transition-colors ${isSelected ? 'text-[#315EF5]' : 'text-[#F1F5F9]'}`}>
                      {cat.nameAr}
                    </div>
                    <div className="text-[9px] text-[#7C8791] font-mono truncate">{cat.nameEn}</div>
                  </div>
                  
                  {cat.hierarchical && (
                    <span className="px-1.5 py-0.5 bg-[#D6A83A]/10 text-[#D6A83A] border border-[#D6A83A]/20 text-[8px] font-bold rounded-md shrink-0">
                      شجري
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* LEFT COLUMN: Data Table and Search Controls */}
        <div className="xl:col-span-3 bg-[#2A323A] rounded-3xl p-5 border border-[#3A434C] flex flex-col justify-between min-h-[650px]">
          <div className="space-y-4">
            {/* Active Dictionary details banner */}
            <div className="p-4 bg-[#161B1F] rounded-2xl border border-[#3A434C] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-[#F1F5F9]">{selectedCategory.nameAr}</span>
                  <span className="text-[10px] text-[#AAB2BA] font-mono">({selectedCategory.nameEn})</span>
                </div>
                <p className="text-[11px] text-[#AAB2BA] mt-1 leading-relaxed">
                  💡 {selectedCategory.descriptionAr}
                </p>
              </div>
              <div className="text-left shrink-0">
                <span className="text-[10px] text-[#AAB2BA] block">إجمالي الخيارات المدرجة</span>
                <span className="font-mono text-base font-black text-[#315EF5]">{filteredItems.length}</span>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-1">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="بحث سريع بالرمز أو الكود أو الاسم العربي والإنجليزي..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 pr-9 pl-3 bg-[#161B1F] border border-[#3A434C] focus:border-[#315EF5] rounded-xl text-xs text-[#F1F5F9] placeholder:text-[#7C8791] outline-none"
                />
                <Search className="w-4 h-4 text-[#7C8791] absolute right-3 top-2.5" />
              </div>

              {/* Status Filter buttons */}
              <div className="flex items-center gap-1.5 p-1 bg-[#161B1F] rounded-xl border border-[#3A434C] self-stretch sm:self-auto">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'all' 
                      ? 'bg-[#2A323A] text-[#315EF5]' 
                      : 'text-[#AAB2BA] hover:text-white'
                  }`}
                >
                  الكل ({items.length})
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'active' 
                      ? 'bg-[#22A06B]/10 text-[#22A06B]' 
                      : 'text-[#AAB2BA] hover:text-white'
                  }`}
                >
                  المفعلة ({items.filter(i => i.isActive).length})
                </button>
                <button
                  onClick={() => setStatusFilter('disabled')}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'disabled' 
                      ? 'bg-[#D64545]/10 text-[#D64545]' 
                      : 'text-[#AAB2BA] hover:text-white'
                  }`}
                >
                  المجمدة ({items.filter(i => !i.isActive).length})
                </button>
              </div>
            </div>

            {/* Main Table */}
            <div className="border border-[#3A434C] rounded-2xl overflow-hidden bg-[#161B1F]/40">
              {loading ? (
                <div className="text-center py-16 text-[#AAB2BA]">
                  <div className="w-8 h-8 border-t-2 border-[#315EF5] border-solid rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-xs">جاري تحميل بيانات القاموس الموحد...</p>
                </div>
              ) : filteredItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-[#161B1F] text-[#AAB2BA] border-b border-[#3A434C] font-bold">
                        <th className="p-3.5 w-16">الترتيب</th>
                        <th className="p-3.5 w-24">كود البند</th>
                        <th className="p-3.5">الاسم بالعربية</th>
                        <th className="p-3.5">الاسم بالإنجليزية</th>
                        <th className="p-3.5 hidden md:table-cell">الوصف</th>
                        {selectedCategory.hierarchical && <th className="p-3.5">البند الأب</th>}
                        <th className="p-3.5 w-24">الحالة</th>
                        <th className="p-3.5 w-32 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3A434C]/40">
                      {filteredItems.map((item, idx) => {
                        // Find parent item description if hierarchical
                        const parentItem = item.parentId ? items.find(i => i.id === item.parentId) : null;
                        
                        return (
                          <tr key={item.id} className="hover:bg-[#161B1F]/40 transition-colors">
                            <td className="p-3.5 font-mono text-[#AAB2BA]">{item.sortOrder || idx * 10}</td>
                            <td className="p-3.5 font-mono font-bold text-[#315EF5] bg-[#315EF5]/5 rounded px-2 py-0.5">{item.code}</td>
                            <td className="p-3.5 font-bold text-[#F1F5F9]">{item.nameAr}</td>
                            <td className="p-3.5 font-mono text-[#AAB2BA]">{item.nameEn}</td>
                            <td className="p-3.5 text-[#AAB2BA] max-w-xs truncate hidden md:table-cell" title={item.description || ''}>
                              {item.description || '—'}
                            </td>
                            {selectedCategory.hierarchical && (
                              <td className="p-3.5">
                                {parentItem ? (
                                  <span className="px-2 py-1 bg-[#D6A83A]/10 text-[#D6A83A] border border-[#D6A83A]/20 rounded-lg text-[10px] font-bold">
                                    {parentItem.nameAr}
                                  </span>
                                ) : (
                                  <span className="text-[#7C8791] text-[10px]">—</span>
                                )}
                              </td>
                            )}
                            <td className="p-3.5">
                              {item.isActive ? (
                                <span className="px-2 py-0.5 bg-[#22A06B]/15 text-[#22A06B] border border-[#22A06B]/20 text-[10px] rounded-lg font-bold inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>مفعل</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-[#D64545]/15 text-[#D64545] border border-[#D64545]/20 text-[10px] rounded-lg font-bold inline-flex items-center gap-1">
                                  <XCircle className="w-3 h-3" />
                                  <span>مجمد</span>
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleOpenEditModal(item)}
                                  className="p-1.5 bg-[#323A40] hover:bg-[#3A434C] text-[#F1F5F9] rounded-lg transition-all cursor-pointer"
                                  title="تعديل"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                
                                <button
                                  onClick={() => handleToggleActive(item)}
                                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                    item.isActive 
                                      ? 'bg-[#22A06B]/15 text-[#22A06B] hover:bg-[#22A06B]/25' 
                                      : 'bg-[#7C8791]/15 text-[#7C8791] hover:bg-[#7C8791]/25'
                                  }`}
                                  title={item.isActive ? "تجميد البند" : "تنشيط البند"}
                                >
                                  {item.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                </button>

                                <button
                                  onClick={() => handleSoftDelete(item)}
                                  className="p-1.5 bg-[#D64545]/10 text-[#D64545] hover:bg-[#D64545]/20 rounded-lg transition-all cursor-pointer"
                                  title="تعطيل تاريخي"
                                >
                                  <XCircle className="w-3.5 h-3.5 text-[#D64545]" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 text-[#7C8791] space-y-3">
                  <AlertTriangle className="w-8 h-8 text-[#D6A83A] mx-auto opacity-80 animate-pulse" />
                  <p className="font-bold text-xs">لا توجد بنود مطابقة لبحثك في هذا القاموس</p>
                  <p className="text-[11px] opacity-70">تأكد من اختيار الفئة الصحيحة من العمود الأيمن أو جرب إدخال رمز آخر</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer of Table Panel */}
          <div className="pt-4 border-t border-[#3A434C] flex items-center justify-between text-[11px] text-[#AAB2BA] font-bold mt-4">
            <div>
              <span>عرض </span>
              <span className="text-[#F1F5F9] font-mono">{filteredItems.length}</span>
              <span> بند من أصل </span>
              <span className="text-[#315EF5] font-mono">{items.length}</span>
              <span> بند في هذا القاموس الموحد.</span>
            </div>
            <div className="flex items-center gap-1 bg-[#161B1F] px-3 py-1 rounded-lg border border-[#3A434C] text-[#22A06B]">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>لا يمكن حذف السجلات المستخدمة نهائياً لضمان سلامة التدقيق المالي والقانوني.</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Dedicated Audit logs visualization */}
      {showAuditLog && (
        <div className="bg-[#161B1F] rounded-3xl p-5 border border-[#3A434C] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#3A434C]">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#D6A83A]" />
              <h3 className="font-bold text-xs text-[#F1F5F9]">سجل الرقابة والأمان لقاموس: {selectedCategory.nameAr}</h3>
            </div>
            <button 
              onClick={() => setShowAuditLog(false)}
              className="text-[#7C8791] hover:text-white text-xs font-bold"
            >
              إغلاق السجل ×
            </button>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-[#2A323A] rounded-xl border border-[#3A434C]/70 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-[#315EF5]/15 text-[#315EF5] rounded-md font-mono text-[10px] font-black">
                      {log.actionType}
                    </span>
                    <div>
                      <p className="font-medium text-[#F1F5F9]">{log.details}</p>
                      <p className="text-[10px] text-[#AAB2BA] mt-0.5 font-mono">
                        👤 الفاعل: <strong className="text-white">{log.actorName}</strong> ({log.actorRole})
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-[#7C8791] shrink-0">
                    {new Date(log.timestamp || log.createdAt).toLocaleString('ar-EG')}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-[#7C8791] text-xs">
                لا توجد عمليات تعديل أو رقابة مسجلة حديثاً على هذه الفئة.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sleek MODAL for ADD or EDIT Master Data item */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#2A323A] w-full max-w-xl rounded-3xl border border-[#4E5B66] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 bg-[#161B1F] border-b border-[#3A434C] flex items-center justify-between">
              <div>
                <h3 className="font-black text-[#F1F5F9] text-sm flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#315EF5]" />
                  <span>{editingItem ? 'تعديل وتدقيق البند التعريفي' : `إضافة بند جديد إلى: ${selectedCategory.nameAr}`}</span>
                </h3>
                <p className="text-[10px] text-[#AAB2BA] mt-1 font-mono">القاموس المستهدف: {selectedCategory.key}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#323A40] hover:bg-[#3A434C] text-[#AAB2BA] hover:text-white flex items-center justify-center text-lg transition-all cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-[#D64545]/15 border border-[#D64545]/30 rounded-xl text-xs text-[#D64545] font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-[#22A06B]/15 border border-[#22A06B]/30 rounded-xl text-xs text-[#22A06B] font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 animate-bounce" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Code and Sort Order Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-[#AAB2BA] font-bold mb-1.5">كود المعرف (رمز فريد بالإنجليزية) *</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    disabled={!!editingItem} // Code cannot be changed once created to avoid referential integrity breakage
                    placeholder="مثال: ACC_COLLISION"
                    className="w-full py-2 px-3 bg-[#161B1F] border border-[#3A434C] focus:border-[#315EF5] rounded-xl text-xs text-[#F1F5F9] placeholder:text-[#7C8791] outline-none disabled:opacity-50 uppercase font-mono"
                  />
                  <p className="text-[9px] text-[#7C8791] mt-1">يستخدم كمعرّف دائم في الكود وقاعدة البيانات</p>
                </div>

                <div>
                  <label className="block text-[11px] text-[#AAB2BA] font-bold mb-1.5">ترتيب الفرز والظهور</label>
                  <input
                    type="number"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(Number(e.target.value))}
                    placeholder="10, 20, 30..."
                    className="w-full py-2 px-3 bg-[#161B1F] border border-[#3A434C] focus:border-[#315EF5] rounded-xl text-xs text-[#F1F5F9] placeholder:text-[#7C8791] outline-none font-mono"
                  />
                  <p className="text-[9px] text-[#7C8791] mt-1">الرقم الأصغر يظهر أولاً في القوائم</p>
                </div>
              </div>

              {/* Names: Arabic & English */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-[#AAB2BA] font-bold mb-1.5">الاسم المعرّب (بالعربية) *</label>
                  <input
                    type="text"
                    required
                    value={formNameAr}
                    onChange={(e) => setFormNameAr(e.target.value)}
                    placeholder="مثال: حادث اصطدام ثنائي"
                    className="w-full py-2 px-3 bg-[#161B1F] border border-[#3A434C] focus:border-[#315EF5] rounded-xl text-xs text-[#F1F5F9] placeholder:text-[#7C8791] outline-none"
                  />
                </div>

                <div className="text-left">
                  <label className="block text-[11px] text-[#AAB2BA] font-bold mb-1.5 text-right">الاسم بالإنجليزية (English Name) *</label>
                  <input
                    type="text"
                    required
                    value={formNameEn}
                    onChange={(e) => setFormNameEn(e.target.value)}
                    placeholder="e.g., Two-Vehicle Collision"
                    className="w-full py-2 px-3 bg-[#161B1F] border border-[#3A434C] focus:border-[#315EF5] rounded-xl text-xs text-[#F1F5F9] placeholder:text-[#7C8791] outline-none font-mono"
                    style={{ direction: 'ltr' }}
                  />
                </div>
              </div>

              {/* Parenting selection if Category is Hierarchical */}
              {selectedCategory.hierarchical && (
                <div>
                  <label className="block text-[11px] text-[#AAB2BA] font-bold mb-1.5">التبعية الهرمية (البند الأب)</label>
                  <select
                    value={formParentId}
                    onChange={(e) => setFormParentId(e.target.value)}
                    className="w-full py-2 px-3 bg-[#161B1F] border border-[#3A434C] focus:border-[#315EF5] rounded-xl text-xs text-[#F1F5F9] outline-none"
                  >
                    <option value="">— بلا تبعية (بند رئيسي مستقل) —</option>
                    {parentCandidates.map(p => (
                      <option key={p.id} value={p.id}>{p.nameAr} ({p.nameEn})</option>
                    ))}
                  </select>
                  <p className="text-[9px] text-[#7C8791] mt-1">مثال: ربط مدينة "بيت فوريك" بمحافظة "نابلس الأب"</p>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-[11px] text-[#AAB2BA] font-bold mb-1.5">شروحات وتفاصيل إضافية للمعاينة</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="وصف البند لمساعدة المحققين في الميدان على الفهم الصحيح لعملية الفرز والاختيار..."
                  className="w-full py-2 px-3 bg-[#161B1F] border border-[#3A434C] focus:border-[#315EF5] rounded-xl text-xs text-[#F1F5F9] placeholder:text-[#7C8791] outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-[#3A434C] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#161B1F] hover:bg-[#20272D] text-[#AAB2BA] hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-[#3A434C]"
                >
                  إلغاء الأمر
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#315EF5] hover:bg-[#2549d4] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg"
                >
                  {editingItem ? 'تحديث وحفظ' : 'إضافة وتعميم فوري'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
