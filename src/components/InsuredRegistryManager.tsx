import React, { useState, useEffect, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  FileText, 
  Car, 
  User, 
  Shield, 
  Calendar, 
  DollarSign, 
  RefreshCw, 
  Filter, 
  X, 
  Check,
  Eye,
  Database,
  ChevronLeft,
  History,
  FileCheck,
  Sparkles,
  Globe,
  Lock,
  Unlock,
  ExternalLink,
  ShieldAlert,
  Sliders,
  Send,
  MessageSquare,
  Copy
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

// Import our custom modular sub-components
import { 
  AddPolicyholderModal, 
  AddPolicyModal, 
  AddAssetModal, 
  RenewPolicyModal 
} from './AddOperationsModals';
import { PolicyholderFileModal } from './PolicyholderFileModal';

export const InsuredRegistryManager: React.FC = () => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'policyholders' | 'policies' | 'assets' | 'vehicles' | 'legacy_import' | 'legacy_history'>('policyholders');
  
  // Database state lists
  const [policyholders, setPolicyholders] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [importBatches, setImportBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any | null>(null);
  const [searching, setSearching] = useState(false);

  // Permisssions Simulation HUD State
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    POLICYHOLDER_CREATE: true,
    POLICYHOLDER_EDIT: true,
    POLICY_CREATE: true,
    POLICY_EDIT: true,
    ASSET_CREATE: true,
    ASSET_EDIT: true,
    LEGACY_IMPORT: true,
  });

  // Modal display states
  const [showAddPolicyholder, setShowAddPolicyholder] = useState(false);
  const [showAddPolicy, setShowAddPolicy] = useState(false);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [selectedPhIdForDetail, setSelectedPhIdForDetail] = useState<string | null>(null);
  const [policyToRenew, setPolicyToRenew] = useState<any | null>(null);
  const [prefilledPolicyholderId, setPrefilledPolicyholderId] = useState('');

  // Portal link generation states
  const [portalLinkData, setPortalLinkData] = useState<{ portalLink: string; whatsappMessage: string; mobile: string; fullName: string } | null>(null);
  const [generatingLinkPhId, setGeneratingLinkPhId] = useState<string | null>(null);
  const [portalLinkError, setPortalLinkError] = useState<string | null>(null);

  // ----------------------------------------------------
  // LEGACY IMPORT WIZARD STATE (Preserved intact!)
  // ----------------------------------------------------
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [importType, setImportType] = useState<'policyholders' | 'policies' | 'assets_vehicles'>('policyholders');
  const [sourceSystem, setSourceSystem] = useState<string>('LEGACY_ERP_1');
  const [importFileName, setImportFileName] = useState<string>('');
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  
  const [parsedRawHeaders, setParsedRawHeaders] = useState<string[]>([]);
  const [parsedRawRows, setParsedRawRows] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [previewSummary, setPreviewSummary] = useState<any | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [previewErrors, setPreviewErrors] = useState<any[]>([]);
  
  const [isCommitting, setIsCommitting] = useState<boolean>(false);
  const [commitResult, setCommitResult] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Legacy history states
  const [selectedBatch, setSelectedBatch] = useState<any | null>(null);
  const [loadingBatchDetails, setLoadingBatchDetails] = useState(false);
  const [batchErrors, setBatchErrors] = useState<any[]>([]);

  // ----------------------------------------------------
  // SCHEMAS FOR IMPORT AUTO-MAPPING
  // ----------------------------------------------------
  const schemas = {
    policyholders: [
      { key: 'customerNumber', label: 'رقم العميل/المؤمن له', required: false, synonyms: ['رقم العميل', 'customer_number', 'cust_no', 'رقم المؤمن له'] },
      { key: 'fullName', label: 'الاسم الكامل *', required: true, synonyms: ['الاسم الكامل', 'full_name', 'name', 'اسم المؤمن له', 'الاسم'] },
      { key: 'nationalId', label: 'رقم الهوية الوطنية *', required: true, synonyms: ['رقم الهوية', 'national_id', 'id_number', 'الهوية', 'السجل المدني'] },
      { key: 'companyRegistrationNumber', label: 'رقم السجل التجاري (للشركات)', required: false, synonyms: ['رقم السجل التجاري', 'السجل التجاري', 'company_reg', 'registration_number'] },
      { key: 'customerType', label: 'نوع العميل (INDIVIDUAL/COMPANY)', required: false, synonyms: ['نوع العميل', 'customer_type', 'type', 'النوع'] },
      { key: 'mobile', label: 'رقم الجوال *', required: true, synonyms: ['رقم الجوال', 'mobile', 'phone', 'الهاتف', 'جوال'] },
      { key: 'email', label: 'البريد الإلكتروني', required: false, synonyms: ['البريد الالكتروني', 'email', 'البريد'] },
      { key: 'address', label: 'العنوان', required: false, synonyms: ['العنوان', 'address'] },
      { key: 'city', label: 'المدينة', required: false, synonyms: ['المدينة', 'city'] },
      { key: 'governorate', label: 'المحافظة', required: false, synonyms: ['المحافظة', 'governorate'] },
      { key: 'legacyCustomerId', label: 'المعرف القديم (في النظام المصدر)', required: false, synonyms: ['المعرف القديم', 'legacy_customer_id', 'old_id'] }
    ],
    policies: [
      { key: 'policyNumber', label: 'رقم الوثيقة/البوليصة *', required: true, synonyms: ['رقم الوثيقة', 'policy_number', 'pol_no', 'رقم البوليصة'] },
      { key: 'nationalId', label: 'رقم هوية المؤمن له (للربط) *', required: true, synonyms: ['رقم هوية المؤمن له', 'رقم الهوية', 'national_id', 'identity', 'الهوية'] },
      { key: 'policyType', label: 'نوع الوثيقة (TPL/COMPREHENSIVE)', required: false, synonyms: ['نوع الوثيقة', 'policy_type', 'نوع التأمين'] },
      { key: 'coverageType', label: 'نوع التغطية', required: false, synonyms: ['نوع التغطية', 'coverage_type', 'التغطية'] },
      { key: 'startDate', label: 'تاريخ بدء التأمين (YYYY-MM-DD)', required: false, synonyms: ['تاريخ البدء', 'start_date', 'effective_date', 'تاريخ مفعول الوثيقة'] },
      { key: 'endDate', label: 'تاريخ انتهاء التأمين (YYYY-MM-DD)', required: false, synonyms: ['تاريخ الانتهاء', 'end_date', 'expiry_date', 'تاريخ انتهاء الوثيقة'] },
      { key: 'premiumAmount', label: 'مبلغ القسط المالي', required: false, synonyms: ['مبلغ القسط', 'premium_amount', 'premium', 'القسط'] },
      { key: 'currency', label: 'العملة', required: false, synonyms: ['العملة', 'currency'] },
      { key: 'legacyPolicyId', label: 'معرف البوليصة القديم', required: false, synonyms: ['المعرف القديم', 'legacy_policy_id', 'old_policy_id'] }
    ],
    assets_vehicles: [
      { key: 'plateNumber', label: 'رقم لوحة المركبة *', required: true, synonyms: ['رقم اللوحة', 'plate_number', 'رقم المركبة', 'اللوحة'] },
      { key: 'nationalId', label: 'رقم هوية مالك المركبة (للربط) *', required: true, synonyms: ['رقم هوية المؤمن له', 'رقم الهوية', 'national_id', 'identity', 'الهوية'] },
      { key: 'plateCountry', label: 'بلد اللوحة (مثال: KSA)', required: false, synonyms: ['بلد اللوحة', 'plate_country', 'الدولة'] },
      { key: 'chassisNumber', label: 'رقم الهيكل / VIN', required: false, synonyms: ['رقم الهيكل', 'chassis_number', 'vin', 'الهيكل'] },
      { key: 'make', label: 'الشركة المصنعة (الماركة)', required: false, synonyms: ['الماركة', 'الشركة المصنعة', 'make', 'brand'] },
      { key: 'model', label: 'طراز المركبة', required: false, synonyms: ['الموديل', 'الطراز', 'model'] },
      { key: 'modelYear', label: 'سنة الصنع', required: false, synonyms: ['سنة الصنع', 'السنة', 'model_year', 'year'] },
      { key: 'color', label: 'لون المركبة', required: false, synonyms: ['اللون', 'color'] },
      { key: 'vehicleType', label: 'تصنيف المركبة (صالون، نقل...)', required: false, synonyms: ['تصنيف المركبة', 'vehicle_type', 'نوع المركبة'] },
      { key: 'registrationNumber', label: 'رقم رخصة المركبة / الاستمارة', required: false, synonyms: ['رقم الرخصة', 'registration_number', 'الاستمارة'] },
      { key: 'legacyAssetId', label: 'معرف الأصل القديم', required: false, synonyms: ['المعرف القديم', 'legacy_asset_id', 'old_asset_id'] }
    ]
  };

  // ----------------------------------------------------
  // DATA LOADING
  // ----------------------------------------------------
  const loadDatabaseData = async () => {
    setLoading(true);
    try {
      const [phRes, polRes, assetsRes, vehRes, batchesRes] = await Promise.all([
        fetch('/api/operations/policyholders').catch(() => null),
        fetch('/api/operations/policies').catch(() => null),
        fetch('/api/operations/assets').catch(() => null),
        fetch('/api/operations/vehicles').catch(() => null),
        fetch('/api/import/batches').catch(() => null)
      ]);

      if (phRes && phRes.ok) {
        try {
          const data = await phRes.json();
          if (Array.isArray(data)) setPolicyholders(data);
        } catch (e) {}
      }
      if (polRes && polRes.ok) {
        try {
          const data = await polRes.json();
          if (Array.isArray(data)) setPolicies(data);
        } catch (e) {}
      }
      if (assetsRes && assetsRes.ok) {
        try {
          const data = await assetsRes.json();
          if (Array.isArray(data)) setAssets(data);
        } catch (e) {}
      }
      if (vehRes && vehRes.ok) {
        try {
          const data = await vehRes.json();
          if (Array.isArray(data)) setVehicles(data);
        } catch (e) {}
      }
      if (batchesRes && batchesRes.ok) {
        try {
          const data = await batchesRes.json();
          if (Array.isArray(data)) setImportBatches(data);
        } catch (e) {}
      }
    } catch (err) {
      console.warn("Notice: Database lists loading notice:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseData();
  }, []);

  // ----------------------------------------------------
  // UNIFIED SEARCH INTEGRATION
  // ----------------------------------------------------
  useEffect(() => {
    const triggerSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults(null);
        return;
      }
      setSearching(true);
      try {
        const res = await fetch(`/api/operations/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          setSearchResults(await res.json());
        }
      } catch (err) {
        console.error("Unified search failure:", err);
      } finally {
        setSearching(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      triggerSearch();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // ----------------------------------------------------
  // LEGACY BATCH LOGS IN DETAIL
  // ----------------------------------------------------
  const handleViewBatchDetails = async (batch: any) => {
    setSelectedBatch(batch);
    setLoadingBatchDetails(true);
    setBatchErrors([]);
    try {
      const res = await fetch(`/api/import/batches/${batch.id}/details`);
      if (res.ok) {
        const data = await res.json();
        setBatchErrors(data.errors || []);
      }
    } catch (err) {
      console.error("Error fetching batch details:", err);
    } finally {
      setLoadingBatchDetails(false);
    }
  };

  // ----------------------------------------------------
  // PORTAL LINK WORKFLOW
  // ----------------------------------------------------
  const handleGeneratePortalLink = async (ph: any) => {
    setGeneratingLinkPhId(ph.id);
    setPortalLinkError(null);
    setPortalLinkData(null);
    try {
      const res = await fetch(`/api/portal/policyholder/${ph.id}/generate-link`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) {
        setPortalLinkError(data.error || 'حدث خطأ أثناء إنشاء الرابط');
      } else {
        setPortalLinkData({
          portalLink: data.portalLink,
          whatsappMessage: data.whatsappMessage,
          mobile: data.mobile,
          fullName: ph.fullName
        });
      }
    } catch (err: any) {
      console.error("Error generating portal link:", err);
      setPortalLinkError('فشلت عملية إنشاء رابط البوابة الآمن.');
    } finally {
      setGeneratingLinkPhId(null);
    }
  };

  // ----------------------------------------------------
  // FILE PARSING FOR LEGACY WIZARD
  // ----------------------------------------------------
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    setIsProcessingFile(true);

    const reader = new FileReader();

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length > 0) {
            const headers = Object.keys(results.data[0] as object);
            setParsedRawHeaders(headers);
            setParsedRawRows(results.data);
            autoMapColumns(headers);
          }
          setIsProcessingFile(false);
          setWizardStep(3);
        },
        error: () => {
          alert("خطأ أثناء قراءة ملف الـ CSV.");
          setIsProcessingFile(false);
        }
      });
    } else {
      reader.onload = (evt) => {
        try {
          const data = evt.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet);

          if (rows.length > 0) {
            const headers = Object.keys(rows[0] as object);
            setParsedRawHeaders(headers);
            setParsedRawRows(rows);
            autoMapColumns(headers);
          }
          setIsProcessingFile(false);
          setWizardStep(3);
        } catch (err) {
          alert("خطأ أثناء معالجة ملف الإكسل.");
          setIsProcessingFile(false);
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const autoMapColumns = (headers: string[]) => {
    const activeSchema = schemas[importType === 'assets_vehicles' ? 'assets_vehicles' : importType];
    const initialMapping: Record<string, string> = {};

    activeSchema.forEach(schemaCol => {
      const matchedHeader = headers.find(h => {
        const normalizedHeader = h.toLowerCase().trim().replace(/_/g, '').replace(/\s+/g, '');
        return schemaCol.synonyms.some(syn => {
          const normalizedSyn = syn.toLowerCase().replace(/_/g, '').replace(/\s+/g, '');
          return normalizedHeader.includes(normalizedSyn) || normalizedSyn.includes(normalizedHeader);
        });
      });

      if (matchedHeader) {
        initialMapping[matchedHeader] = schemaCol.key;
      }
    });

    setColumnMapping(initialMapping);
  };

  const handleProceedToPreview = async () => {
    setIsSimulating(true);
    setWizardStep(4);
    
    try {
      const res = await fetch('/api/import/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          importType,
          sourceSystem,
          columnMapping,
          rows: parsedRawRows
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPreviewSummary(data.summary);
        setPreviewRows(data.rows || []);
        setPreviewErrors(data.errors || []);
      } else {
        alert("فشلت عملية المحاكاة المبدئية للبيانات.");
      }
    } catch (err: any) {
      alert("حدث خطأ في الاتصال أثناء المحاكاة.");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCommitImport = async () => {
    setIsCommitting(true);
    try {
      const res = await fetch('/api/import/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          importType,
          sourceSystem,
          columnMapping,
          rows: parsedRawRows,
          uploadedBy: localStorage.getItem('user_username') || 'SYSTEM_ADMIN'
        })
      });

      if (res.ok) {
        const result = await res.json();
        setCommitResult(result);
        setWizardStep(5);
        loadDatabaseData(); // Reload registry lists instantly
      } else {
        alert("حدث فشل أثناء حفظ البيانات الدائمة بقاعدة البيانات.");
      }
    } catch (err) {
      alert("حدث خطأ أثناء إتمام استيراد الملف.");
    } finally {
      setIsCommitting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const activeSchema = schemas[importType === 'assets_vehicles' ? 'assets_vehicles' : importType];
    const headers = activeSchema.map(col => col.key);
    const sampleData = [
      activeSchema.reduce((acc, col) => {
        acc[col.key] = col.required ? "قيمة مطلوبة" : "قيمة اختيارية";
        return acc;
      }, {} as Record<string, string>)
    ];
    
    const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "قالب الاستيراد");
    XLSX.writeFile(wb, `Template_${importType}.xlsx`);
  };

  const handleResetWizard = () => {
    setWizardStep(1);
    setImportFileName('');
    setParsedRawHeaders([]);
    setParsedRawRows([]);
    setColumnMapping({});
    setPreviewSummary(null);
    setPreviewRows([]);
    setPreviewErrors([]);
    setCommitResult(null);
  };

  // Helper permission checker
  const hasPermission = (perm: string): boolean => {
    return true;
  };

  return (
    <div className="space-y-6 font-sans select-none text-right" dir="rtl">

      {/* ---------------------------------------------------- */}
      {/* TOP HEADER SECTION */}
      {/* ---------------------------------------------------- */}
      <div className="bg-[#1C2229] p-6 rounded-3xl border border-[#3A434C] shadow-sm flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2 justify-end">
            <Database className="w-6 h-6 text-[#315EF5]" />
            <span>سجل التأمين والمؤمن عليهم الموحد</span>
          </h2>
          <p className="text-[#AAB2BA] text-xs mt-1">
            البنية الأساسية الموحدة للمؤمن عليهم والبوالص والأصول المؤمن عليها. يدعم الاستيراد التاريخي والتشغيل اليومي للبيانات.
          </p>
        </div>

        {/* Quick Operations Actions bar positioned below text, side by side, official governmental styling */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#3A434C]/50">
          <button
            onClick={() => {
              setPrefilledPolicyholderId('');
              setShowAddPolicyholder(true);
            }}
            className="px-4 py-2 bg-[#253245] hover:bg-[#31435f] text-slate-100 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm border border-[#475569]"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span>إضافة مؤمن عليه</span>
          </button>

          <button
            onClick={() => {
              setPrefilledPolicyholderId('');
              setShowAddPolicy(true);
            }}
            className="px-4 py-2 bg-[#1b3a32] hover:bg-[#234b3f] text-emerald-100 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm border border-emerald-800"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>إصدار بوليصة</span>
          </button>

          <button
            onClick={() => {
              setPrefilledPolicyholderId('');
              setShowAddAsset(true);
            }}
            className="px-4 py-2 bg-[#2d2547] hover:bg-[#3a305b] text-purple-100 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm border border-purple-800"
          >
            <Plus className="w-4 h-4 text-purple-400" />
            <span>إضافة أصل / مركبة</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SIX TABS SELECTOR SYSTEM */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center bg-[#131920] p-1.5 rounded-2xl border border-[#3A434C]/60 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('policyholders')}
          className={`py-2 px-4 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'policyholders' ? 'bg-[#315EF5] text-white' : 'text-[#AAB2BA] hover:text-[#F1F5F9]'
          }`}
        >
          المؤمن عليهم ({policyholders.length})
        </button>
        <button
          onClick={() => setActiveTab('policies')}
          className={`py-2 px-4 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'policies' ? 'bg-[#315EF5] text-white' : 'text-[#AAB2BA] hover:text-[#F1F5F9]'
          }`}
        >
          البوالص ({policies.length})
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`py-2 px-4 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'assets' ? 'bg-[#315EF5] text-white' : 'text-[#AAB2BA] hover:text-[#F1F5F9]'
          }`}
        >
          الأصول المؤمن عليها ({assets.length})
        </button>
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`py-2 px-4 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'vehicles' ? 'bg-[#315EF5] text-white' : 'text-[#AAB2BA] hover:text-[#F1F5F9]'
          }`}
        >
          المركبات ({vehicles.length})
        </button>
        <button
          onClick={() => setActiveTab('legacy_import')}
          disabled={!hasPermission('LEGACY_IMPORT')}
          className={`py-2 px-4 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 disabled:opacity-40 ${
            activeTab === 'legacy_import' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' : 'text-[#AAB2BA] hover:text-[#F1F5F9]'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>استيراد البيانات القديمة</span>
        </button>
        <button
          onClick={() => setActiveTab('legacy_history')}
          className={`py-2 px-4 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'legacy_history' ? 'bg-[#315EF5] text-white' : 'text-[#AAB2BA] hover:text-[#F1F5F9]'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>سجل الاستيرادات ({importBatches.length})</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* UNIFIED SEARCH CONTROL BAR */}
      {/* ---------------------------------------------------- */}
      {activeTab !== 'legacy_import' && activeTab !== 'legacy_history' && (
        <div className="bg-[#1C2229] p-4 rounded-3xl border border-[#3A434C] flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 -translate-y-1/2 w-4 h-4 text-[#7C8791]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="البحث الشامل... (الاسم الكامل، رقم العميل، الهوية، الجوال، رقم البوليصة، لوحة المركبة، رقم الهيكل)"
              className="w-full pl-10 pr-4 py-2.5 bg-[#131920] border border-[#3A434C] rounded-2xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#315EF5] text-right"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-2 bg-[#2A323A] hover:bg-[#323A40] text-[#AAB2BA] rounded-xl cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* ACTIVE VIEW BODY */}
      {/* ---------------------------------------------------- */}
      {loading || searching ? (
        <div className="bg-[#1C2229] border border-[#3A434C] rounded-3xl p-16 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-[#315EF5] animate-spin mx-auto" />
          <p className="text-[#AAB2BA] text-xs font-black">جاري جلب ومزامنة سجلات التأمين الموحدة...</p>
        </div>
      ) : (
        <>
          {/* If there's an active unified search query, show unified search results regardless of tab */}
          {searchQuery.trim() !== '' && searchResults ? (
            <div className="bg-[#1C2229] border border-[#3A434C] rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#3A434C]/40 pb-3">
                <span className="text-[10px] bg-[#315EF5]/15 text-[#315EF5] px-2 py-0.5 rounded-lg font-bold font-mono">
                  {searchResults.policyholders?.length + searchResults.policies?.length + searchResults.assets?.length + searchResults.vehicles?.length} سجلات مطابقة
                </span>
                <h3 className="text-sm font-black text-white">نتائج البحث الموحد والشامل</h3>
              </div>

              {/* Policyholder matches */}
              {searchResults.policyholders?.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-black text-[#315EF5] text-right">المؤمن عليهم المطابقين:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {searchResults.policyholders.map((ph: any) => (
                      <div key={ph.id} className="bg-[#131920] border border-[#3A434C]/50 p-4 rounded-2xl flex items-center justify-between">
                        <button
                          onClick={() => setSelectedPhIdForDetail(ph.id)}
                          className="px-3 py-1.5 bg-[#315EF5]/10 hover:bg-[#315EF5]/20 text-[#315EF5] border border-[#315EF5]/20 rounded-xl text-[10px] font-bold cursor-pointer"
                        >
                          فتح الملف المتكامل 👁
                        </button>
                        <div className="text-right">
                          <span className="font-bold text-white text-xs block">{ph.fullName}</span>
                          <span className="text-[10px] text-[#AAB2BA] font-mono mt-0.5 block">الهوية: {ph.nationalId || ph.companyRegistrationNumber} | جوال: {ph.mobile}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Policies matches */}
              {searchResults.policies?.length > 0 && (
                <div className="space-y-2.5 border-t border-[#3A434C]/30 pt-4">
                  <h4 className="text-xs font-black text-emerald-400 text-right">البوالص والوثائق المطابقة:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {searchResults.policies.map((pol: any) => (
                      <div key={pol.id} className="bg-[#131920] border border-[#3A434C]/50 p-4 rounded-2xl flex items-center justify-between">
                        <button
                          onClick={() => setSelectedPhIdForDetail(pol.policyholderId)}
                          className="px-3 py-1.5 bg-[#315EF5]/10 hover:bg-[#315EF5]/20 text-[#315EF5] border border-[#315EF5]/20 rounded-xl text-[10px] font-bold cursor-pointer"
                        >
                          ملف المؤمن له 👁
                        </button>
                        <div className="text-right">
                          <span className="font-bold text-white text-xs block">وثيقة: {pol.policyNumber}</span>
                          <span className="text-[10px] text-[#AAB2BA] font-mono mt-0.5 block">النوع: {pol.policyType} | التغطية: {pol.coverageType}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vehicles & Assets matches */}
              {(searchResults.assets?.length > 0 || searchResults.vehicles?.length > 0) && (
                <div className="space-y-2.5 border-t border-[#3A434C]/30 pt-4">
                  <h4 className="text-xs font-black text-indigo-400 text-right">الأصول والمركبات المطابقة:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {searchResults.assets?.map((asset: any) => (
                      <div key={asset.id} className="bg-[#131920] border border-[#3A434C]/50 p-4 rounded-2xl flex items-center justify-between">
                        <button
                          onClick={() => setSelectedPhIdForDetail(asset.policyholderId)}
                          className="px-3 py-1.5 bg-[#315EF5]/10 hover:bg-[#315EF5]/20 text-[#315EF5] border border-[#315EF5]/20 rounded-xl text-[10px] font-bold cursor-pointer"
                        >
                          ملف المالك 👁
                        </button>
                        <div className="text-right">
                          <span className="font-bold text-white text-xs block">أصل: {asset.assetReference || asset.id}</span>
                          <span className="text-[10px] text-[#AAB2BA] mt-0.5 block">التصنيف: {asset.assetType} | {asset.description}</span>
                        </div>
                      </div>
                    ))}
                    {searchResults.vehicles?.map((veh: any) => (
                      <div key={veh.id} className="bg-[#131920] border border-[#3A434C]/50 p-4 rounded-2xl flex items-center justify-between">
                        <button
                          onClick={() => setSelectedPhIdForDetail(veh.policyholderId)}
                          className="px-3 py-1.5 bg-[#315EF5]/10 hover:bg-[#315EF5]/20 text-[#315EF5] border border-[#315EF5]/20 rounded-xl text-[10px] font-bold cursor-pointer"
                        >
                          ملف المالك 👁
                        </button>
                        <div className="text-right">
                          <span className="font-bold text-white text-xs block">مركبة: {veh.plateNumber}</span>
                          <span className="text-[10px] text-[#AAB2BA] mt-0.5 block">{veh.make} {veh.model} ({veh.modelYear}) | VIN: {veh.chassisNumber}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.policyholders?.length === 0 && searchResults.policies?.length === 0 && searchResults.assets?.length === 0 && searchResults.vehicles?.length === 0 && (
                <div className="p-12 text-center text-[#7C8791] text-xs">
                  لا توجد نتائج مطابقة لمصطلح البحث في قاعدة البيانات المركزية للشركة.
                </div>
              )}
            </div>
          ) : (
            <>
              {/* TAB 1: POLICYHOLDERS LIST */}
              {activeTab === 'policyholders' && (
                <div className="bg-[#1C2229] border border-[#3A434C] rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs text-[#F1F5F9]">
                      <thead className="bg-[#131920] text-[#7C8791] font-bold text-[10px] border-b border-[#3A434C]/40">
                        <tr>
                          <th className="p-4 text-center">إجراءات</th>
                          <th className="p-4">المصدر</th>
                          <th className="p-4">المحافظة والمدينة</th>
                          <th className="p-4">الهاتف والجوال</th>
                          <th className="p-4">الهوية الوطنية / السجل</th>
                          <th className="p-4">كود العميل</th>
                          <th className="p-4">الاسم الكامل</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#3A434C]/30">
                        {policyholders.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-12 text-center text-[#7C8791]">
                              لا توجد سجلات مؤمن عليهم حالياً. قم بإضافة مؤمن عليه جديد أو استيراد الملفات التاريخية.
                            </td>
                          </tr>
                        ) : (
                          policyholders.map(ph => (
                            <tr key={ph.id} className="hover:bg-[#131920]/40 transition-colors">
                              <td className="p-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => setSelectedPhIdForDetail(ph.id)}
                                    className="p-1.5 bg-[#2A323A] hover:bg-[#323A40] text-white rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
                                    title="فتح الملف الموحد"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-[#315EF5]" />
                                    <span className="text-[10px] font-bold">الملف الموحد</span>
                                  </button>
                                  <button
                                    onClick={() => handleGeneratePortalLink(ph)}
                                    disabled={generatingLinkPhId === ph.id}
                                    className="p-1.5 bg-[#315EF5]/10 hover:bg-[#315EF5]/20 text-[#315EF5] border border-[#315EF5]/20 rounded-xl transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50 shrink-0"
                                    title="إرسال رابط البوابة"
                                  >
                                    {generatingLinkPhId === ph.id ? (
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#315EF5]" />
                                    ) : (
                                      <Send className="w-3.5 h-3.5 text-[#315EF5]" />
                                    )}
                                    <span className="text-[10px] font-bold">إرسال رابط البوابة</span>
                                  </button>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="px-2 py-0.5 bg-[#2A323A] text-[#AAB2BA] rounded-md font-bold text-[10px]">
                                  {ph.sourceSystem}
                                </span>
                              </td>
                              <td className="p-4">{ph.city || '-'} ، {ph.governorate || '-'}</td>
                              <td className="p-4 font-mono">{ph.mobile || ph.phone || '-'}</td>
                              <td className="p-4 font-mono font-bold text-[#AAB2BA]">{ph.nationalId || ph.companyRegistrationNumber || '-'}</td>
                              <td className="p-4 font-mono font-bold text-emerald-400">{ph.customerNumber || '-'}</td>
                              <td className="p-4 font-black text-white">{ph.fullName}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: POLICIES LIST */}
              {activeTab === 'policies' && (
                <div className="bg-[#1C2229] border border-[#3A434C] rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs text-[#F1F5F9]">
                      <thead className="bg-[#131920] text-[#7C8791] font-bold text-[10px] border-b border-[#3A434C]/40">
                        <tr>
                          <th className="p-4 text-center">إجراءات</th>
                          <th className="p-4">الحالة</th>
                          <th className="p-4">فترة السريان</th>
                          <th className="p-4">قسط التأمين</th>
                          <th className="p-4">نوع التأمين / التغطية</th>
                          <th className="p-4">المؤمن له</th>
                          <th className="p-4">رقم الوثيقة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#3A434C]/30">
                        {policies.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-12 text-center text-[#7C8791]">
                              لا توجد وثائق تأمين مصدرة بقاعدة البيانات.
                            </td>
                          </tr>
                        ) : (
                          policies.map(pol => (
                            <tr key={pol.id} className="hover:bg-[#131920]/40 transition-colors">
                              <td className="p-4 text-center">
                                {pol.status === 'ACTIVE' ? (
                                  <button
                                    onClick={() => setPolicyToRenew(pol)}
                                    className="px-2.5 py-1.5 bg-[#2A323A] hover:bg-[#323A40] border border-[#3A434C] text-white rounded-xl transition-all cursor-pointer flex items-center gap-1 mx-auto text-[10px] font-bold"
                                  >
                                    <RefreshCw className="w-3 h-3 text-[#315EF5]" />
                                    <span>تجديد الوثيقة</span>
                                  </button>
                                ) : (
                                  <span className="text-[#7C8791] text-[10px]">مجددة / منتهية</span>
                                )}
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                                  pol.status === 'ACTIVE' ? 'bg-[#22A06B]/20 text-[#22A06B]' : 'bg-red-500/10 text-red-400'
                                }`}>
                                  {pol.status === 'ACTIVE' ? 'نشطة سارية' : 'منتهية / ملغاة'}
                                </span>
                              </td>
                              <td className="p-4 font-mono text-[11px] text-[#AAB2BA]">{pol.startDate || '-'} إلى {pol.endDate || '-'}</td>
                              <td className="p-4 font-mono font-bold text-emerald-400">{pol.premiumAmount ? `${pol.premiumAmount} ${pol.currency}` : '-'}</td>
                              <td className="p-4 font-bold">{pol.policyType} / {pol.coverageType}</td>
                              <td className="p-4">
                                <button
                                  onClick={() => setSelectedPhIdForDetail(pol.policyholderId)}
                                  className="text-white hover:text-[#315EF5] font-bold hover:underline"
                                >
                                  {pol.policyholderName || 'فتح الملف 👁'}
                                </button>
                              </td>
                              <td className="p-4 font-mono font-bold text-white">{pol.policyNumber}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: INSURED ASSETS */}
              {activeTab === 'assets' && (
                <div className="bg-[#1C2229] border border-[#3A434C] rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs text-[#F1F5F9]">
                      <thead className="bg-[#131920] text-[#7C8791] font-bold text-[10px] border-b border-[#3A434C]/40">
                        <tr>
                          <th className="p-4">الوصف والتفاصيل</th>
                          <th className="p-4">المالك / المؤمن له</th>
                          <th className="p-4">تصنيف الأصل</th>
                          <th className="p-4">الرقم المرجعي</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#3A434C]/30">
                        {assets.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-12 text-center text-[#7C8791]">
                              لا توجد أصول مؤمن عليها مسجلة.
                            </td>
                          </tr>
                        ) : (
                          assets.map(asset => (
                            <tr key={asset.id} className="hover:bg-[#131920]/40 transition-colors">
                              <td className="p-4 text-[#AAB2BA] max-w-xs truncate" title={asset.description}>{asset.description || '-'}</td>
                              <td className="p-4 font-bold text-white">
                                <button
                                  onClick={() => setSelectedPhIdForDetail(asset.policyholderId)}
                                  className="hover:text-[#315EF5] hover:underline"
                                >
                                  {asset.policyholderName || 'فتح ملف المالك'}
                                </button>
                              </td>
                              <td className="p-4">
                                <span className="px-2 py-0.5 bg-indigo-600/15 text-indigo-400 border border-indigo-600/20 rounded-lg text-[9px] font-black">
                                  {asset.assetType}
                                </span>
                              </td>
                              <td className="p-4 font-mono font-bold text-white">{asset.assetReference || asset.id}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: VEHICLES ONLY LIST */}
              {activeTab === 'vehicles' && (
                <div className="bg-[#1C2229] border border-[#3A434C] rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs text-[#F1F5F9]">
                      <thead className="bg-[#131920] text-[#7C8791] font-bold text-[10px] border-b border-[#3A434C]/40">
                        <tr>
                          <th className="p-4">سنة الصنع واللون</th>
                          <th className="p-4">رقم الهيكل (VIN)</th>
                          <th className="p-4">الماركة والطراز</th>
                          <th className="p-4">المالك / المؤمن له</th>
                          <th className="p-4">رقم لوحة المركبة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#3A434C]/30">
                        {vehicles.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-12 text-center text-[#7C8791]">
                              لا توجد مركبات مؤمنة مسجلة في النظام.
                            </td>
                          </tr>
                        ) : (
                          vehicles.map(veh => (
                            <tr key={veh.id} className="hover:bg-[#131920]/40 transition-colors">
                              <td className="p-4 text-[#AAB2BA]">{veh.modelYear || '-'} | {veh.color || '-'}</td>
                              <td className="p-4 font-mono text-[11px] text-[#AAB2BA]">{veh.chassisNumber || '-'}</td>
                              <td className="p-4 font-bold text-white">{veh.make || '-'} {veh.model || '-'}</td>
                              <td className="p-4">
                                <button
                                  onClick={() => setSelectedPhIdForDetail(veh.policyholderId)}
                                  className="hover:text-[#315EF5] font-black hover:underline text-white"
                                >
                                  {veh.policyholderName || 'ملف المالك 👁'}
                                </button>
                              </td>
                              <td className="p-4 font-mono font-bold text-emerald-400 text-sm">{veh.plateNumber}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: LEGACY IMPORT WIZARD */}
              {activeTab === 'legacy_import' && (
                <div className="bg-[#1C2229] border border-[#3A434C] rounded-3xl p-6 shadow-sm space-y-6">
                  {/* Wizard Header Progress Bar */}
                  <div className="border-b border-[#3A434C]/40 pb-5">
                    <div className="flex items-center justify-between max-w-4xl mx-auto">
                      {[
                        { step: 1, label: "تهيئة الاستيراد" },
                        { step: 2, label: "رفع الملف" },
                        { step: 3, label: "مطابقة الحقول" },
                        { step: 4, label: "المحاكاة والمعاينة" },
                        { step: 5, label: "الحفظ الدائم" }
                      ].map((item, index) => (
                        <React.Fragment key={item.step}>
                          <div className="flex flex-col items-center space-y-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                              wizardStep >= item.step ? 'bg-[#315EF5] text-white border-[#315EF5]' : 'bg-[#131920] text-[#7C8791] border-[#3A434C]'
                            }`}>
                              {item.step}
                            </div>
                            <span className="text-[10px] font-bold text-[#F1F5F9]">{item.label}</span>
                          </div>
                          {index < 4 && (
                            <div className="flex-1 h-[2px] bg-[#3A434C] mx-2 -translate-y-2"></div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* STEP 1 */}
                  {wizardStep === 1 && (
                    <div className="max-w-2xl mx-auto space-y-6 py-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-black text-white flex items-center gap-2 justify-end">
                          <Sparkles className="w-4 h-4 text-[#315EF5]" />
                          <span>تحديد جدول الاستيراد المالي والتأشيري</span>
                        </h3>
                        <p className="text-xs text-[#AAB2BA] leading-relaxed">
                          الرجاء اختيار نوع المستندات القديمة المراد محاكاتها ونقلها إلى الجداول الموحدة للنظام.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2 md:col-span-1">
                          <label className="text-xs font-bold text-[#AAB2BA] block">نوع الملف والجدول المستهدف:</label>
                          <div className="space-y-2">
                            <button
                              onClick={() => setImportType('policyholders')}
                              className={`w-full p-4 border rounded-2xl text-right transition-all flex items-start gap-3 cursor-pointer ${
                                importType === 'policyholders' ? 'border-[#315EF5] bg-[#315EF5]/10' : 'border-[#3A434C] bg-[#131920]/50'
                              }`}
                            >
                              <User className="w-5 h-5 text-[#315EF5]" />
                              <div>
                                <div className="text-xs font-black text-white">سجل المؤمن عليهم (Policyholders)</div>
                                <div className="text-[10px] text-[#AAB2BA] mt-0.5">الأسماء، الهويات، أرقام الجوال والعناوين</div>
                              </div>
                            </button>

                            <button
                              onClick={() => setImportType('policies')}
                              className={`w-full p-4 border rounded-2xl text-right transition-all flex items-start gap-3 cursor-pointer ${
                                importType === 'policies' ? 'border-[#315EF5] bg-[#315EF5]/10' : 'border-[#3A434C] bg-[#131920]/50'
                              }`}
                            >
                              <Shield className="w-5 h-5 text-emerald-400" />
                              <div>
                                <div className="text-xs font-black text-white">بوالص التأمين (Policies)</div>
                                <div className="text-[10px] text-[#AAB2BA] mt-0.5">تفاصيل الوثيقة، الفترات، الأسعار والمبالغ</div>
                              </div>
                            </button>

                            <button
                              onClick={() => setImportType('assets_vehicles')}
                              className={`w-full p-4 border rounded-2xl text-right transition-all flex items-start gap-3 cursor-pointer ${
                                importType === 'assets_vehicles' ? 'border-[#315EF5] bg-[#315EF5]/10' : 'border-[#3A434C] bg-[#131920]/50'
                              }`}
                            >
                              <Car className="w-5 h-5 text-indigo-400" />
                              <div>
                                <div className="text-xs font-black text-white">الأصول والمركبات (Vehicles & Assets)</div>
                                <div className="text-[10px] text-[#AAB2BA] mt-0.5">لوحات السيارات، الشاصي والموديلات</div>
                              </div>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-4 col-span-2 md:col-span-1">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#AAB2BA] block">نظام المصدر القديم:</label>
                            <select
                              value={sourceSystem}
                              onChange={(e) => setSourceSystem(e.target.value)}
                              className="w-full p-3 bg-[#131920]/70 border border-[#3A434C] rounded-2xl text-xs text-white outline-none"
                            >
                              <option value="LEGACY_ERP_1">نظام ERP القديم للشركة</option>
                              <option value="LEGACY_AS400">نظام AS400 الموروث</option>
                              <option value="OLD_EXCEL_SHEET">ملفات إكسل الإدارية القديمة</option>
                            </select>
                          </div>

                          <div className="bg-[#131920]/40 border border-[#3A434C]/60 rounded-2xl p-4 space-y-3">
                            <div className="text-xs font-bold text-white flex items-center gap-2 justify-end">
                              <span className="text-emerald-400">تحميل القالب المطابق</span>
                              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                            </div>
                            <p className="text-[10px] text-[#AAB2BA] leading-relaxed">
                              لتسهيل مطابقة العناوين وتخطي الأخطاء تلقائياً، يرجى ملء البيانات في قالب إكسل تجريبي.
                            </p>
                            <button
                              onClick={handleDownloadTemplate}
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all border border-white/5"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>تنزيل قالب إكسل تجريبي</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end border-t border-[#3A434C]/30 pt-4">
                        <button
                          onClick={() => setWizardStep(2)}
                          className="px-5 py-2.5 bg-[#315EF5] hover:bg-[#315EF5]/90 text-white rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <span>التالي: اختيار ورفع الملف</span>
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2 */}
                  {wizardStep === 2 && (
                    <div className="max-w-xl mx-auto space-y-6 py-4">
                      <div className="space-y-1 text-center">
                        <h3 className="text-sm font-black text-white">خطوة 2: ارفع ملف البيانات القديمة</h3>
                        <p className="text-xs text-[#AAB2BA]">يدعم الملفات من نوع Excel (.xlsx) أو CSV لجميع الأنظمة القديمة</p>
                      </div>

                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-[#3A434C] hover:border-[#315EF5]/60 rounded-3xl p-10 text-center cursor-pointer bg-[#131920]/60 transition-all space-y-3"
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelected}
                          accept=".xlsx,.xls,.csv"
                          className="hidden"
                        />
                        <Upload className="w-8 h-8 text-[#315EF5] mx-auto animate-bounce" />
                        <div className="text-xs font-bold text-[#F1F5F9]">انقر هنا لرفع أو إسقاط ملف البيانات</div>
                        <div className="text-[10px] text-[#7C8791]">الحد الأقصى للملف: 10 ميغابايت</div>
                      </div>

                      {isProcessingFile && (
                        <div className="py-2 text-center text-[#315EF5] font-bold text-[11px] animate-pulse">
                          جاري معالجة وفك ترميز أعمدة الملف...
                        </div>
                      )}

                      <div className="flex justify-between border-t border-[#3A434C]/30 pt-4">
                        <button
                          onClick={() => setWizardStep(1)}
                          className="px-5 py-2 bg-[#2A323A] hover:bg-[#323A40] text-white rounded-xl font-bold text-xs"
                        >
                          السابق
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3 */}
                  {wizardStep === 3 && (
                    <div className="max-w-2xl mx-auto space-y-6 py-4">
                      <div className="space-y-1">
                        <h3 className="text-sm font-black text-white">خطوة 3: مطابقة أعمدة الملف المرفوع بقاعدة البيانات</h3>
                        <p className="text-xs text-[#AAB2BA]">قم بربط أعمدة ملفك (العناوين) بالحقول المقابلة لها في قاعدة البيانات المركزية.</p>
                      </div>

                      <div className="bg-[#131920]/80 rounded-2xl p-4 border border-[#3A434C]/40 space-y-4 max-h-[350px] overflow-y-auto">
                        {schemas[importType === 'assets_vehicles' ? 'assets_vehicles' : importType].map(schemaCol => {
                          // Find key currently mapped to this schema key
                          const mappedHeader = Object.keys(columnMapping).find(k => columnMapping[k] === schemaCol.key) || '';
                          
                          return (
                            <div key={schemaCol.key} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2 border-b border-[#3A434C]/20 last:border-0">
                              <select
                                value={mappedHeader}
                                onChange={e => {
                                  const header = e.target.value;
                                  const nextMap = { ...columnMapping };
                                  // Remove any previous maps to this schema key
                                  Object.keys(nextMap).forEach(k => {
                                    if (nextMap[k] === schemaCol.key) delete nextMap[k];
                                  });
                                  if (header) {
                                    nextMap[header] = schemaCol.key;
                                  }
                                  setColumnMapping(nextMap);
                                }}
                                className="w-full sm:w-1/2 p-2 bg-[#131920] border border-[#3A434C] text-xs text-white rounded-xl font-mono outline-none"
                              >
                                <option value="">-- تخطي العمود / لا توجد مطابقة --</option>
                                {parsedRawHeaders.map(h => (
                                  <option key={h} value={h}>{h}</option>
                                ))}
                              </select>

                              <div className="text-right">
                                <span className="font-bold text-white text-xs block">{schemaCol.label}</span>
                                <span className="text-[10px] text-[#AAB2BA] block font-mono">{schemaCol.key}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-between border-t border-[#3A434C]/30 pt-4">
                        <button
                          onClick={() => setWizardStep(2)}
                          className="px-5 py-2 bg-[#2A323A] hover:bg-[#323A40] text-white rounded-xl font-bold text-xs"
                        >
                          السابق
                        </button>
                        <button
                          onClick={handleProceedToPreview}
                          className="px-5 py-2.5 bg-[#315EF5] hover:bg-[#315EF5]/90 text-white rounded-2xl text-xs font-black flex items-center gap-1 cursor-pointer"
                        >
                          <span>المتابعة لمحاكاة الفحص</span>
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4 */}
                  {wizardStep === 4 && (
                    <div className="max-w-3xl mx-auto space-y-6 py-4">
                      <div className="space-y-1">
                        <h3 className="text-sm font-black text-white">خطوة 4: تقرير الفحص الأولي ومحاكاة الربط الثنائي</h3>
                        <p className="text-xs text-[#AAB2BA]">يقوم النظام الآن بتدقيق البيانات للتحقق من عدم وجود تكرار وربطها تلقائياً.</p>
                      </div>

                      {isSimulating ? (
                        <div className="py-12 text-center space-y-3">
                          <RefreshCw className="w-7 h-7 text-[#315EF5] animate-spin mx-auto" />
                          <p className="text-[#AAB2BA] text-xs font-bold">جاري تشغيل محرك التحقق ومسح الهويات بالخلفية...</p>
                        </div>
                      ) : previewSummary ? (
                        <div className="space-y-4">
                          {/* Summary Stats */}
                          <div className="grid grid-cols-4 gap-3">
                            <div className="bg-[#131920]/80 p-3 rounded-2xl border border-[#3A434C]/40 text-right">
                              <span className="text-[#AAB2BA] text-[10px] block">إجمالي السطور:</span>
                              <span className="text-white font-bold font-mono text-base">{previewSummary.total}</span>
                            </div>
                            <div className="bg-emerald-600/10 p-3 rounded-2xl border border-emerald-600/20 text-right">
                              <span className="text-emerald-400 text-[10px] block">سجلات مقبولة وجديدة:</span>
                              <span className="text-emerald-400 font-bold font-mono text-base">{previewSummary.validNew}</span>
                            </div>
                            <div className="bg-[#D6A83A]/10 p-3 rounded-2xl border border-[#D6A83A]/20 text-right">
                              <span className="text-[#D6A83A] text-[10px] block">تعديل وتحديث سجلات:</span>
                              <span className="text-[#D6A83A] font-bold font-mono text-base">{previewSummary.validUpdates}</span>
                            </div>
                            <div className="bg-red-500/10 p-3 rounded-2xl border border-red-500/20 text-right">
                              <span className="text-red-400 text-[10px] block">سجلات تحتوي أخطاء:</span>
                              <span className="text-red-400 font-bold font-mono text-base">{previewSummary.invalid}</span>
                            </div>
                          </div>

                          {previewErrors.length > 0 && (
                            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl space-y-2">
                              <div className="text-xs font-black flex items-center gap-2 justify-end">
                                <span>تم رصد أخطاء مطابقة أو تكرار في الملف:</span>
                                <AlertTriangle className="w-4 h-4 text-red-400" />
                              </div>
                              <ul className="text-[10px] leading-relaxed list-disc list-inside space-y-1 text-right pr-2">
                                {previewErrors.slice(0, 4).map((err, i) => (
                                  <li key={i}>{err.errorMessage} (سطر: {err.rowNumber})</li>
                                ))}
                                {previewErrors.length > 4 && <li>وغيرها من الأخطاء... (العدد الإجمالي: {previewErrors.length})</li>}
                              </ul>
                            </div>
                          )}

                          <div className="flex justify-between border-t border-[#3A434C]/30 pt-4">
                            <button
                              onClick={() => setWizardStep(3)}
                              className="px-5 py-2 bg-[#2A323A] hover:bg-[#323A40] text-white rounded-xl font-bold text-xs"
                            >
                              تعديل المطابقة
                            </button>
                            <button
                              onClick={handleCommitImport}
                              disabled={isCommitting}
                              className="px-6 py-2.5 bg-[#22A06B] hover:bg-[#22A06B]/90 disabled:opacity-50 text-white rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-600/10"
                            >
                              {isCommitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              <span>تأكيد وحفظ الاستيراد في قاعدة البيانات</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center text-red-400">فشل في توليد تقرير فحص البيانات المرفوعة.</div>
                      )}
                    </div>
                  )}

                  {/* STEP 5 */}
                  {wizardStep === 5 && commitResult && (
                    <div className="max-w-xl mx-auto text-center py-8 space-y-6">
                      <div className="w-16 h-16 bg-[#22A06B]/15 border border-[#22A06B]/30 rounded-full flex items-center justify-center mx-auto text-[#22A06B]">
                        <Check className="w-8 h-8" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-base font-black text-white">تم استيراد وحفظ البيانات القديمة بنجاح!</h3>
                        <p className="text-xs text-[#AAB2BA] leading-relaxed">
                          تم معالجة الملف وإدراجه في الجداول الموحدة للنظام. سيتمكن المؤمن عليهم من تفعيل حسابات البوابة الخاصة بهم بشكل طبيعي وبدون تكرار.
                        </p>
                      </div>

                      <div className="bg-[#131920] border border-[#3A434C]/40 p-4 rounded-2xl grid grid-cols-3 gap-3 text-right">
                        <div>
                          <span className="text-[10px] text-[#AAB2BA] block">رقم الدفعة المعتمد:</span>
                          <span className="text-xs font-mono font-bold text-[#315EF5]">{commitResult.batchId}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#AAB2BA] block">المدرجة حديثاً:</span>
                          <span className="text-xs font-bold text-emerald-400">{commitResult.insertedCount}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#AAB2BA] block">المعدلة والمحدّثة:</span>
                          <span className="text-xs font-bold text-white">{commitResult.updatedCount}</span>
                        </div>
                      </div>

                      <button
                        onClick={handleResetWizard}
                        className="px-6 py-2 bg-[#315EF5] text-white font-black text-xs rounded-xl cursor-pointer"
                      >
                        إجراء استيراد ملف جديد
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: LEGACY IMPORT BATCHES HISTORY */}
              {activeTab === 'legacy_history' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-[#131920] border border-[#3A434C]/40 p-4 rounded-2xl text-xs font-bold text-white">
                      دفعات عمليات الاستيراد السابقة للملفات التاريخية
                    </div>

                    <div className="space-y-3">
                      {importBatches.length === 0 ? (
                        <div className="p-12 text-center text-[#7C8791] bg-[#1C2229] border border-[#3A434C] rounded-2xl">
                          لا توجد عمليات استيراد تاريخية قديمة مسجلة.
                        </div>
                      ) : (
                        importBatches.map(batch => {
                          const isSelected = selectedBatch?.id === batch.id;
                          return (
                            <div
                              key={batch.id}
                              onClick={() => handleViewBatchDetails(batch)}
                              className={`p-4 border rounded-2xl text-right transition-all cursor-pointer ${
                                isSelected ? 'border-[#315EF5] bg-[#315EF5]/10' : 'border-[#3A434C] bg-[#1C2229]/80 hover:bg-[#1C2229]'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  batch.status === 'COMPLETED' ? 'bg-[#22A06B]/20 text-[#22A06B]' : 'bg-red-500/10 text-red-400'
                                }`}>
                                  {batch.status === 'COMPLETED' ? 'ناجح ومكتمل' : 'فشل الاستيراد'}
                                </span>
                                <div className="text-right">
                                  <span className="font-bold text-white text-xs block">{batch.fileName}</span>
                                  <span className="text-[10px] text-[#AAB2BA] mt-0.5 block">بواسطة: {batch.uploadedBy} | {new Date(batch.startedAt).toLocaleString('ar-EG')}</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-4 gap-2 bg-[#131920]/40 p-2.5 rounded-xl border border-[#3A434C]/30 mt-3 text-[10px] text-[#AAB2BA]">
                                <div>
                                  <span>السجلات:</span>
                                  <span className="text-white block font-bold font-mono">{batch.totalRows}</span>
                                </div>
                                <div className="border-r border-[#3A434C]/30 pr-2">
                                  <span className="text-emerald-400">الجديدة:</span>
                                  <span className="text-emerald-400 block font-bold font-mono">{batch.importedRows}</span>
                                </div>
                                <div className="border-r border-[#3A434C]/30 pr-2">
                                  <span>المحدّثة:</span>
                                  <span className="text-white block font-bold font-mono">{batch.updatedRows}</span>
                                </div>
                                <div className="border-r border-[#3A434C]/30 pr-2">
                                  <span className="text-red-400">الفاشلة:</span>
                                  <span className="text-red-400 block font-bold font-mono">{batch.failedRows}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="bg-[#1C2229] border border-[#3A434C] rounded-3xl p-5 space-y-4">
                    <div className="text-xs font-bold text-white border-b border-[#3A434C]/30 pb-2">تفاصيل تدقيق الاستيراد المحدد</div>
                    
                    {selectedBatch ? (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] text-[#AAB2BA] block">كود الدفعة المرجعي:</span>
                          <span className="text-xs font-mono font-bold text-[#315EF5]">{selectedBatch.id}</span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-[#AAB2BA] block">الجدول والمصدر:</span>
                          <span className="text-xs font-bold text-white">{selectedBatch.importType} ({selectedBatch.sourceSystem})</span>
                        </div>

                        <div className="border-t border-[#3A434C]/30 pt-3 space-y-2">
                          <span className="text-xs font-bold text-white block">سجل أخطاء المطابقة والتحقق:</span>
                          
                          {loadingBatchDetails ? (
                            <div className="py-8 text-center text-[#7C8791]">جاري تحميل السجلات...</div>
                          ) : batchErrors.length === 0 ? (
                            <div className="p-4 bg-[#22A06B]/15 border border-[#22A06B]/20 text-[#22A06B] text-[10px] rounded-xl text-center">
                              ✓ ممتاز! لا توجد سجلات أخطاء مسجلة لهذه الدفعة.
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {batchErrors.map((err, i) => (
                                <div key={i} className="p-2.5 bg-[#131920] border border-[#3A434C]/30 rounded-xl space-y-1 text-[10px]">
                                  <div className="flex items-center justify-between text-[#7C8791] font-mono">
                                    <span>سطر: {err.rowNumber}</span>
                                    <span className="text-red-400 font-bold">خطأ</span>
                                  </div>
                                  <div className="text-red-400 leading-relaxed font-bold">{err.errorMessage}</div>
                                  <div className="text-[#AAB2BA] truncate">القيمة: {err.originalValue}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-12 text-center text-[#7C8791] text-xs">
                        الرجاء اختيار دفعة استيراد لعرض تفاصيلها وتدقيق الأخطاء الخاص بها.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ---------------------------------------------------- */}
      {/* OPERATIONS DAILY BUSINESS MODALS */}
      {/* ---------------------------------------------------- */}
      {showAddPolicyholder && (
        <AddPolicyholderModal
          onClose={() => setShowAddPolicyholder(false)}
          onSuccess={(newPh) => {
            setShowAddPolicyholder(false);
            loadDatabaseData();
            setSelectedPhIdForDetail(newPh.id); // Open profile immediately!
          }}
          onOpenDuplicate={(ph) => {
            setShowAddPolicyholder(false);
            setSelectedPhIdForDetail(ph.id); // Open duplicate profile immediately!
          }}
        />
      )}

      {showAddPolicy && (
        <AddPolicyModal
          onClose={() => setShowAddPolicy(false)}
          onSuccess={() => {
            setShowAddPolicy(false);
            loadDatabaseData();
          }}
          preselectedPolicyholderId={prefilledPolicyholderId}
          policyholders={policyholders}
          assets={assets}
        />
      )}

      {showAddAsset && (
        <AddAssetModal
          onClose={() => setShowAddAsset(false)}
          onSuccess={() => {
            setShowAddAsset(false);
            loadDatabaseData();
          }}
          preselectedPolicyholderId={prefilledPolicyholderId}
          policyholders={policyholders}
        />
      )}

      {policyToRenew && (
        <RenewPolicyModal
          onClose={() => setPolicyToRenew(null)}
          onSuccess={() => {
            setPolicyToRenew(null);
            loadDatabaseData();
          }}
          policyToRenew={policyToRenew}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* COMPREHENSIVE POLICYHOLDER DETAILED DRAWER */}
      {/* ---------------------------------------------------- */}
      {selectedPhIdForDetail && (
        <PolicyholderFileModal
          policyholderId={selectedPhIdForDetail}
          onClose={() => setSelectedPhIdForDetail(null)}
          onAddPolicy={(phId) => {
            setPrefilledPolicyholderId(phId);
            setShowAddPolicy(true);
          }}
          onAddAsset={(phId) => {
            setPrefilledPolicyholderId(phId);
            setShowAddAsset(true);
          }}
          onRenewPolicy={(policy) => {
            setPolicyToRenew(policy);
          }}
        />
      )}

      {/* Modal for Portal Link / WhatsApp Invitation */}
      {(portalLinkData || portalLinkError) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md font-sans" dir="rtl">
          <div className="bg-[#1C2229] border border-[#3A434C] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-right text-xs text-[#F1F5F9]">
            {/* Header */}
            <div className="p-6 border-b border-[#3A434C] flex items-center justify-between bg-[#131920]">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#315EF5]" />
                <span>إرسال رابط البوابة الرقمية</span>
              </h3>
              <button 
                onClick={() => {
                  setPortalLinkData(null);
                  setPortalLinkError(null);
                }} 
                className="p-1 bg-[#2A323A] hover:bg-[#323A40] text-[#AAB2BA] rounded-xl cursor-pointer transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {portalLinkError ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 py-6">
                  <AlertTriangle className="w-12 h-12 text-red-400" />
                  <p className="text-red-400 font-bold text-sm leading-relaxed">{portalLinkError}</p>
                  <button
                    onClick={() => setPortalLinkError(null)}
                    className="mt-2 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold rounded-xl transition-all cursor-pointer"
                  >
                    إغلاق
                  </button>
                </div>
              ) : portalLinkData ? (
                <div className="space-y-4">
                  <div className="p-3.5 bg-[#131920] border border-[#3A434C]/50 rounded-2xl">
                    <span className="text-[#AAB2BA] text-[10px] block mb-1">العميل المستلم:</span>
                    <span className="font-bold text-white text-xs">{portalLinkData.fullName}</span>
                    <span className="text-[#7C8791] text-[10px] block mt-1">رقم الجوال: {portalLinkData.mobile}</span>
                  </div>

                  <div>
                    <span className="text-[#AAB2BA] text-[10px] block mb-1.5">نص رسالة WhatsApp الجاهزة:</span>
                    <div className="bg-[#131920] border border-[#3A434C] rounded-2xl p-4 font-sans text-xs text-[#F1F5F9] whitespace-pre-line leading-relaxed h-48 overflow-y-auto select-all">
                      {portalLinkData.whatsappMessage}
                    </div>
                  </div>

                  {/* Requirement 5: Exactly two buttons - "فتح WhatsApp" and "نسخ الرسالة" */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => {
                        const formattedMobile = portalLinkData.mobile.replace(/[\s\-\+]/g, '');
                        // Create direct wa.me link
                        const waUrl = `https://wa.me/${formattedMobile}?text=${encodeURIComponent(portalLinkData.whatsappMessage)}`;
                        window.open(waUrl, '_blank');
                      }}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-950/20"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>فتح WhatsApp</span>
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(portalLinkData.whatsappMessage);
                        alert("تم نسخ الرسالة إلى الحافظة!");
                      }}
                      className="w-full py-3 bg-[#2A323A] hover:bg-[#323A40] text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#3A434C]"
                    >
                      <Copy className="w-4 h-4" />
                      <span>نسخ الرسالة</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
