import React, { useState, useEffect } from 'react';
import { 
  Vehicle, 
  Driver, 
  Accident, 
  INCIDENT_TAXONOMY, 
  IncidentCategory, 
  PalestineGovernorate, 
  PalestineLocalityType,
  PALESTINE_GOVERNORATES
} from '../types';
import { 
  X, 
  ShieldAlert, 
  Car, 
  User, 
  MapPin, 
  Phone, 
  FileText, 
  ShieldCheck, 
  DollarSign, 
  Camera, 
  Trash2, 
  Plus, 
  CheckCircle2,
  Sparkles,
  Info,
  AlertTriangle,
  Building,
  Radio
} from 'lucide-react';

interface NewAccidentModalProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const NewAccidentModal: React.FC<NewAccidentModalProps> = ({
  vehicles,
  drivers,
  onClose,
  onSubmit,
}) => {
  // Tabs for structured clean view
  const [activeTab, setActiveTab] = useState<'main' | 'vehicle_driver' | 'insurance_policy' | 'location_details' | 'attachments'>('main');

  // 0. Official Incident / Report Reference Number
  const [accidentNumber, setAccidentNumber] = useState<string>(() => `INC-2026-${Math.floor(100000 + Math.random() * 900000)}`);

  // 1. Vehicle & Plate (Manual Input with Fleet Autofill Option)
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState<number>(new Date().getFullYear());
  const [vehicleColor, setVehicleColor] = useState('');
  const [ownerName, setOwnerName] = useState('');

  // 2. Driver & Contact Info (Manual Input with Quick Driver Fill Option)
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverWhatsapp, setDriverWhatsapp] = useState('');
  const [driverId, setDriverId] = useState('');
  const [driverLicenseNumber, setDriverLicenseNumber] = useState('');
  const [isDriverOwner, setIsDriverOwner] = useState(false);

  // 3. Company & Insurance Policy Data
  const [insuranceCompany, setInsuranceCompany] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [policyType, setPolicyType] = useState<any>('');
  const [coverageLimit, setCoverageLimit] = useState(0);
  const [deductible, setDeductible] = useState(0);
  const [policyStatus, setPolicyStatus] = useState<'سارية ومطابقة' | 'منتهية الصلاحية' | 'معلقة لعدم السداد'>('سارية ومطابقة');

  // 4. Incident Category & Severity
  const [category, setCategory] = useState<any>('');
  const [subtype, setSubtype] = useState<string>('');
  const [severity, setSeverity] = useState<any>('');
  
  // 5. Palestinian Geography & Location
  const [governorate, setGovernorate] = useState<any>('');

  // Dynamic Master Data states
  const [mdmIncidentTypes, setMdmIncidentTypes] = useState<any[]>([]);
  const [mdmSeverities, setMdmSeverities] = useState<any[]>([]);
  const [mdmGovernorates, setMdmGovernorates] = useState<any[]>([]);
  const [mdmInsuranceCovers, setMdmInsuranceCovers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/master-data?isActive=true')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const incTypes = data.filter(item => item.category === 'incident_types');
          const sevs = data.filter(item => item.category === 'accident_severities');
          const govs = data.filter(item => item.category === 'locations');
          const covers = data.filter(item => item.category === 'insurance_covers');
          
          if (incTypes.length > 0) {
            setMdmIncidentTypes(incTypes);
            // Default to first active incident type if available
            // Removing the hardcoded setSubtype/setCategory to let user choose
          }
          if (sevs.length > 0) {
            setMdmSeverities(sevs);
          }
          if (govs.length > 0) {
            setMdmGovernorates(govs);
          }
          if (covers.length > 0) {
            setMdmInsuranceCovers(covers);
          }
        }
      })
      .catch(err => console.error("Error loading master data in NewAccidentModal:", err));
  }, []);
  const [localityType, setLocalityType] = useState<PalestineLocalityType>('مدينة');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [street, setStreet] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [landmark, setLandmark] = useState('');

  // 6. Police & Incident Dynamics
  const [policeNotified, setPoliceNotified] = useState(false);
  const [policeReportNumber, setPoliceReportNumber] = useState('');
  const [policeStation, setPoliceStation] = useState('');
  const [casualtiesCount, setCasualtiesCount] = useState(0);
  const [fatalitiesCount, setFatalitiesCount] = useState(0);
  const [estimatedLoss, setEstimatedLoss] = useState(0);
  const [roadType, setRoadType] = useState('');
  const [weather, setWeather] = useState('');
  const [potentialCause, setPotentialCause] = useState('');

  // 7. Incident Description & Evidence Photos
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  const handleClearForm = () => {
    setAccidentNumber(`INC-2026-${Math.floor(100000 + Math.random() * 900000)}`);
    setVehiclePlate('');
    setVehicleMake('');
    setVehicleModel('');
    setVehicleYear(new Date().getFullYear());
    setVehicleColor('');
    setOwnerName('');
    setDriverName('');
    setDriverPhone('');
    setDriverWhatsapp('');
    setDriverId('');
    setDriverLicenseNumber('');
    setInsuranceCompany('');
    setPolicyNumber('');
    setPolicyType('شامل');
    setCoverageLimit(0);
    setDeductible(0);
    setDescription('');
    setPoliceReportNumber('');
    setPoliceStation('');
    setEstimatedLoss(0);
    setLandmark('');
    setStreet('');
    setBuildingNumber('');
  };

  const handleFillDemo = () => {
    setAccidentNumber(`INC-2026-${Math.floor(100000 + Math.random() * 900000)}`);
    setVehiclePlate('7-9281-90');
    setVehicleMake('هيونداي');
    setVehicleModel('توسان');
    setVehicleYear(2024);
    setVehicleColor('فضي ميتاليك');
    setOwnerName('خالد عبد الله أبو سعيد');
    setDriverName('خالد عبد الله أبو سعيد');
    setDriverPhone('+970599123456');
    setDriverWhatsapp('+970599123456');
    setDriverId('908273641');
    setDriverLicenseNumber('DL-448291-PAL');
    setInsuranceCompany('شركة التأمين الوطنية الموحدة');
    setPolicyNumber(`POL-${Math.floor(10000 + Math.random() * 90000)}-PAL`);
    setPolicyType('شامل');
    setCoverageLimit(500000);
    setDeductible(1500);
    setDescription('وقع حادث تصادم مروري أثناء دوران المركبة عند المفترق، مما نتج عنه أضرار هيكلية بالجانب الأيمن وكسر في المصد والإنارة الأمامية.');
    setPoliceReportNumber(`PR-${Math.floor(100000 + Math.random() * 900000)}-PAL`);
    setPoliceStation('مديرية شرطة محافظة نابلس');
    setEstimatedLoss(14500);
    setLandmark('قرب المستشفى العربي التخصصي');
    setStreet('شارع يافا الرئيسي');
    setBuildingNumber('عمارة النورس 14');
  };

  // Handle Quick Vehicle Selection (Autofills while keeping plate completely editable)
  const handleQuickVehicleSelect = (plate: string) => {
    if (!plate) return;
    const found = vehicles.find(v => v.plateNumber === plate);
    if (found) {
      setVehiclePlate(found.plateNumber);
      setVehicleMake(found.make || '');
      setVehicleModel(found.model || '');
      setVehicleYear(found.year || 2024);
      setVehicleColor(found.color || 'أبيض');
      if (found.ownerName) setOwnerName(found.ownerName);
      if (found.insurancePolicy) setPolicyNumber(found.insurancePolicy);
    }
  };

  // Handle Quick Driver Selection (Autofills while keeping fields completely editable)
  const handleQuickDriverSelect = (driverIdVal: string) => {
    if (!driverIdVal) return;
    const found = drivers.find(d => d.id === driverIdVal || d.nationalId === driverIdVal);
    if (found) {
      setDriverName(found.fullName);
      setDriverId(found.nationalId);
      setDriverPhone(found.phone || '');
      setDriverWhatsapp(found.phone || '');
      if (found.licenseNumber) setDriverLicenseNumber(found.licenseNumber);
      if (isDriverOwner) setOwnerName(found.fullName);
    }
  };

  const handleCategoryChange = (newCat: IncidentCategory) => {
    setCategory(newCat);
    const availableSubtypes = INCIDENT_TAXONOMY[newCat];
    if (availableSubtypes && availableSubtypes.length > 0) {
      setSubtype(availableSubtypes[0]);
    }
  };

  const handleAddPhoto = () => {
    if (newPhotoUrl.trim()) {
      setPhotos([...photos, newPhotoUrl.trim()]);
      setNewPhotoUrl('');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehiclePlate.trim() || !driverName.trim() || !description.trim()) {
      alert('يرجى التأكد من ملء رقم اللوحة واسم السائق ووصف الحادث.');
      return;
    }

    const fullLocationName = `${governorate} - ${localityType} ${city} (${neighborhood || street})`;
    const approvedAccidentNumber = accidentNumber.trim() || `INC-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const payload = {
      accidentNumber: approvedAccidentNumber,
      incidentNumber: approvedAccidentNumber,
      claimNumber: approvedAccidentNumber,
      timestamp: new Date().toISOString(),
      locationName: fullLocationName,
      lat: 32.2227,
      lng: 35.2621,
      severity,
      status: 'جديد',
      
      // Hierarchical taxonomy
      incidentCategory: category,
      incidentSubtype: subtype,
      
      // Vehicle & Driver Details (Manual Entry)
      vehiclePlate: vehiclePlate.trim(),
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      ownerName: isDriverOwner ? driverName : ownerName,
      driverName: driverName.trim(),
      driverId: driverId.trim(),
      driverPhone: driverPhone.trim(),
      driverWhatsapp: driverWhatsapp.trim(),
      driverLicenseNumber: driverLicenseNumber.trim(),
      
      // Insurance Policy Details
      insuranceCompany,
      policyNumber,
      policyType,
      coverageLimit,
      deductible,
      
      // Incident specifics
      description,
      photos,
      policeReportNumber: policeNotified ? policeReportNumber : '',
      policeStation: policeNotified ? policeStation : '',
      insuranceClaimStatus: 'معلق',
      potentialCause,
      roadType,
      weather,
      casualtiesCount,
      fatalitiesCount,
      
      // Location Breakdown
      locationDetails: {
        region: 'الضفة الغربية',
        governorate,
        localityType,
        city,
        neighborhood,
        street,
        buildingNumber,
        landmark,
        latitude: 32.2227,
        longitude: 35.2621
      },

      // Standard Party Entities for Claims Engine
      parties: [
        {
          id: `pty-${Date.now()}-1`,
          partyRole: 'مؤمَّن له',
          fullName: driverName,
          nationalId: driverId,
          phone: driverPhone,
          vehiclePlate: vehiclePlate,
          vehicleModel: `${vehicleMake} ${vehicleModel}`,
          injuryStatus: casualtiesCount > 0 ? 'إصابة طفيفة' : 'لا إصابة',
          statementTaken: true,
          statementSummary: description
        }
      ],

      // Policy Snapshot Freeze
      policySnapshot: {
        policyNumber,
        policyType,
        coverageLimit,
        deductible,
        policyStatusAtIncident: policyStatus,
        effectiveDate: '2026-01-01',
        expiryDate: '2026-12-31'
      },

      // Financial Estimates
      financialEstimates: {
        estimatedLossAmount: estimatedLoss,
        finalApprovedAmount: 0,
        currency: 'SAR',
        fraudRiskFlag: 'لا يوجد اشتباه',
        fraudNotes: `بلاغ مدخل عبر لوحة العمليات المركزية (HQ).`
      }
    };

    onSubmit(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-[#1C2229]/85 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="bg-[#2A323A] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-[#3A434C] text-[#F1F5F9] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#3A434C] flex flex-wrap items-center justify-between gap-3 bg-[#161B1F] shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-[#D64545]/20 text-[#D64545] rounded-2xl border border-[#D64545]/30 shadow-inner">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[#F1F5F9]">بلاغ طارئ / تكليف مباشر</h2>
                <span className="px-2 py-0.5 bg-[#D64545]/20 text-[#D64545] text-[10px] font-bold rounded-lg border border-[#D64545]/30 animate-pulse">
                  طوارئ غرفة العمليات (HQ)
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-[#AAB2BA]">رقم البلاغ المعتمد:</span>
                <span className="font-mono font-black text-xs text-[#315EF5] bg-[#315EF5]/15 px-2 py-0.5 rounded-md border border-[#315EF5]/30">
                  {accidentNumber}
                </span>
                <span className="text-[10px] text-[#22A06B] font-bold">● يُدرج في خانة "البلاغات الجديدة"</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearForm}
              className="px-3 py-1.5 rounded-xl border border-[#3A434C] bg-[#2A323A] hover:bg-[#323A40] text-[#AAB2BA] hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="مسح كافة الحقول للبدء بنموذج فارغ جديد"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#D64545]" />
              <span>تفريغ النموذج</span>
            </button>
            <button
              type="button"
              onClick={handleFillDemo}
              className="px-3 py-1.5 rounded-xl border border-[#315EF5]/40 bg-[#315EF5]/15 hover:bg-[#315EF5]/25 text-[#315EF5] hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="تعبئة بيانات تجريبية سريعة"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D6A83A]" />
              <span>تعبئة تجريبية</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#AAB2BA] hover:text-white rounded-xl hover:bg-[#323A40] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-[#1C2229] border-b border-[#3A434C] overflow-x-auto text-xs shrink-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('main')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'main' 
                ? 'bg-[#315EF5] text-white shadow-md' 
                : 'bg-[#2A323A] text-[#AAB2BA] hover:text-[#F1F5F9] hover:bg-[#323A40]'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>1. البيانات الأساسية السريعة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vehicle_driver')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'vehicle_driver' 
                ? 'bg-[#315EF5] text-white shadow-md' 
                : 'bg-[#2A323A] text-[#AAB2BA] hover:text-[#F1F5F9] hover:bg-[#323A40]'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>2. المركبة والسائق والاتصال</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('insurance_policy')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'insurance_policy' 
                ? 'bg-[#315EF5] text-white shadow-md' 
                : 'bg-[#2A323A] text-[#AAB2BA] hover:text-[#F1F5F9] hover:bg-[#323A40]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>3. وثيقة التأمين والشركة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('location_details')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'location_details' 
                ? 'bg-[#315EF5] text-white shadow-md' 
                : 'bg-[#2A323A] text-[#AAB2BA] hover:text-[#F1F5F9] hover:bg-[#323A40]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>4. الموقع والشرطة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('attachments')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'attachments' 
                ? 'bg-[#315EF5] text-white shadow-md' 
                : 'bg-[#2A323A] text-[#AAB2BA] hover:text-[#F1F5F9] hover:bg-[#323A40]'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>5. المرفقات والصور ({photos.length})</span>
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          
          {/* TAB 1: MAIN FAST DATA */}
          {activeTab === 'main' && (
            <div className="space-y-4 animate-fadeIn">
              {/* 0. Official Incident / Report Reference Card */}
              <div className="p-3.5 bg-[#161B1F] rounded-2xl border border-[#315EF5]/50 flex flex-wrap items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#315EF5]/20 text-[#315EF5] border border-[#315EF5]/30 flex items-center justify-center font-mono font-black text-sm">
                    #
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-xs text-[#F1F5F9]">رقم البلاغ المعتمد (الرقم المرجعي الرسمي):</span>
                      <input
                        type="text"
                        required
                        value={accidentNumber}
                        onChange={e => setAccidentNumber(e.target.value)}
                        placeholder="INC-2026-..."
                        className="px-3 py-1 bg-[#2A323A] border border-[#315EF5]/60 focus:border-[#315EF5] text-[#315EF5] font-mono font-black text-xs rounded-lg outline-none w-52"
                      />
                      <button
                        type="button"
                        onClick={() => setAccidentNumber(`INC-2026-${Math.floor(100000 + Math.random() * 900000)}`)}
                        className="text-[11px] text-[#AAB2BA] hover:text-[#315EF5] underline cursor-pointer"
                        title="توليد رقم عشوائي جديد"
                      >
                        توليد رقم جديد 🔄
                      </button>
                    </div>
                    <p className="text-[10px] text-[#22A06B] font-bold">
                      ● هذا الرقم المرجعي سيتم اعتماده وإدراجه مباشرة في خانة <strong className="underline">"البلاغات الجديدة"</strong> في الشاشة الإدارية (HQ).
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-[#D64545]/15 text-[#D64545] border border-[#D64545]/30 text-[10px] font-bold rounded-xl animate-pulse">
                  يُعتمد فور الإرسال
                </span>
              </div>

              <div className="p-4 bg-[#1C2229] rounded-2xl border border-[#3A434C] space-y-4">
                <div className="flex items-center justify-between border-b border-[#3A434C] pb-2.5">
                  <span className="font-bold text-[#F1F5F9] text-sm flex items-center gap-2">
                    <Car className="w-4 h-4 text-[#315EF5]" />
                    <span>المدخلات الرئيسية للبلاغ (رقم اللوحة + اسم السائق + الجوال)</span>
                  </span>
                  <span className="text-[11px] text-[#22A06B] font-bold">إمكانية التعديل والكتابة اليدوية الكاملة</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {/* Manual License Plate */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-[#F1F5F9] flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-[#315EF5]" />
                        <span>رقم لوحة المركبة (يدوياً) *</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      required
                      value={vehiclePlate}
                      onChange={e => setVehiclePlate(e.target.value)}
                      placeholder="مثال: 7-9281-90 أو 6-1234-98"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#315EF5] font-mono font-black text-sm focus:ring-2 focus:ring-[#315EF5] focus:outline-none"
                    />
                  </div>

                  {/* Manual Driver Name */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-[#F1F5F9] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#22A06B]" />
                      <span>اسم السائق كاملاً (يدوياً) *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={driverName}
                      onChange={e => {
                        setDriverName(e.target.value);
                        if (isDriverOwner) setOwnerName(e.target.value);
                      }}
                      placeholder="أدخل اسم السائق الرباعي"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9] font-bold text-xs focus:ring-2 focus:ring-[#315EF5] focus:outline-none"
                    />
                  </div>

                  {/* Driver Mobile Phone */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-[#F1F5F9] flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#315EF5]" />
                      <span>رقم جوال السائق / الاتصال *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={driverPhone}
                      onChange={e => {
                        setDriverPhone(e.target.value);
                        setDriverWhatsapp(e.target.value);
                      }}
                      placeholder="مثال: 0599123456"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9] font-mono text-xs focus:ring-2 focus:ring-[#315EF5] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Quick Selection Dropdowns if user wants to autofill */}
                <div className="pt-2 border-t border-[#3A434C]/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#AAB2BA]">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#D6A83A]" />
                    <span>تعبئة سريعة من الأسطول المسجل مسبقاً (اختياري):</span>
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {vehicles.length > 0 && (
                      <select
                        onChange={e => handleQuickVehicleSelect(e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9] text-[11px]"
                        defaultValue=""
                      >
                        <option value="" disabled>اختر مركبة من الأسطول...</option>
                        {vehicles.map(v => (
                          <option key={v.id} value={v.plateNumber}>
                            {v.plateNumber} ({v.make} {v.model})
                          </option>
                        ))}
                      </select>
                    )}

                    {drivers.length > 0 && (
                      <select
                        onChange={e => handleQuickDriverSelect(e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9] text-[11px]"
                        defaultValue=""
                      >
                        <option value="" disabled>اختر سائق مسجل...</option>
                        {drivers.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.fullName} ({d.nationalId})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Accident Location & Severity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#AAB2BA]">نوع الحادث (MDM) *</label>
                  <select
                    value={subtype}
                    onChange={e => {
                      setSubtype(e.target.value);
                      const selected = mdmIncidentTypes.find(t => t.nameAr === e.target.value);
                      if (selected) {
                        setCategory(selected.parentId ? 'أخرى' : 'حوادث مركبات');
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#3A434C] bg-[#1C2229] text-[#F1F5F9] font-bold text-xs focus:ring-2 focus:ring-[#315EF5] focus:outline-none"
                  >
                    {mdmIncidentTypes.length > 0 ? (
                      mdmIncidentTypes.map(item => (
                        <option key={item.id} value={item.nameAr}>{item.nameAr}</option>
                      ))
                    ) : (
                      ['تصادم', 'انقلاب', 'دهس', 'حريق مركبة', 'سرقة مركبة', 'أضرار طبيعية', 'سقوط جسم على مركبة', 'كسر زجاج', 'تخريب متعمد', 'مسؤولية مدنية'].map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#AAB2BA] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#D64545]" />
                    <span>موقع الحادث / الشارع العام *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={e => setStreet(e.target.value)}
                    placeholder="مثال: نابلس - شارع رفيديا الرئيسي"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#3A434C] bg-[#1C2229] text-[#F1F5F9] text-xs focus:ring-2 focus:ring-[#315EF5] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#AAB2BA]">المحافظة الرسمية</label>
                  <select
                    value={governorate}
                    onChange={e => {
                      setGovernorate(e.target.value as any);
                      setCity(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#3A434C] bg-[#1C2229] text-[#315EF5] font-bold text-xs focus:ring-2 focus:ring-[#315EF5] focus:outline-none"
                  >
                    {mdmGovernorates.length > 0 ? (
                      mdmGovernorates.filter(g => !g.parentId).map(gov => (
                        <option key={gov.id} value={gov.nameAr}>محافظة {gov.nameAr}</option>
                      ))
                    ) : (
                      [...PALESTINE_GOVERNORATES['الضفة الغربية'], ...PALESTINE_GOVERNORATES['قطاع غزة']].map(gov => (
                        <option key={gov} value={gov}>محافظة {gov}</option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#AAB2BA]">مستوى الخطورة</label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#3A434C] bg-[#1C2229] text-[#F1F5F9] font-bold text-xs focus:ring-2 focus:ring-[#315EF5] focus:outline-none"
                  >
                    {mdmSeverities.length > 0 ? (
                      mdmSeverities.map(item => (
                        <option key={item.id} value={item.nameAr}>{item.nameAr} ({item.description?.split(' - ')[0] || item.nameEn})</option>
                      ))
                    ) : (
                      [
                        { val: 'خفيف', label: 'خفيف (أضرار سطحية بسيطة)' },
                        { val: 'متوسط', label: 'متوسط (أضرار متوسطة بالهيكل)' },
                        { val: 'بليغ', label: 'بليغ (أضرار جسيمة بالمركبة)' },
                        { val: 'حرج', label: 'حرج (إصابات وطوارئ طبية)' }
                      ].map(sev => (
                        <option key={sev.val} value={sev.val}>{sev.label}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="font-semibold text-[#AAB2BA] flex items-center justify-between">
                  <span>شرح ملابسات الحادث وتلفيات المركبة *</span>
                  <span className="text-[#7C8791] text-[10px]">يوثق في الحقيبة الرقمية للمطالبة</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="اكتب تفاصيل الحادث والظروف المحيطة وتلفيات المركبة بدقة..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#3A434C] bg-[#1C2229] text-[#F1F5F9] placeholder-[#7C8791] text-xs focus:ring-2 focus:ring-[#315EF5] focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Quick Editable Info Strip */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] text-[#AAB2BA] px-1">
                  <span className="font-bold flex items-center gap-1.5 text-[#F1F5F9]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#315EF5]" />
                    <span>البيانات التأمينية والمالية للبلاغ (قابلة للتعديل المباشر هنا وفي التبويبات التفصيلية):</span>
                  </span>
                  <span className="text-[#315EF5] text-[10px]">تعديل فوري متزامن</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {/* Coverage Type */}
                  <div className="p-2.5 bg-[#1C2229] rounded-xl border border-[#3A434C] hover:border-[#315EF5]/50 transition-colors">
                    <label className="text-[#7C8791] block text-[10px] mb-1 font-semibold">نوع التغطية</label>
                    <select
                      value={policyType}
                      onChange={e => setPolicyType(e.target.value)}
                      className="w-full bg-[#2A323A] border border-[#3A434C] rounded-lg px-2 py-1.5 text-xs font-bold text-[#F1F5F9] focus:ring-1 focus:ring-[#315EF5] focus:outline-none cursor-pointer"
                    >
                      {mdmInsuranceCovers.length > 0 ? (
                        mdmInsuranceCovers.map(item => (
                          <option key={item.id} value={item.nameAr}>{item.nameAr}</option>
                        ))
                      ) : (
                        [
                          { val: 'شامل', label: 'شامل' },
                          { val: 'ضد الغير', label: 'ضد الغير / طرف ثالث' },
                          { val: 'حريق وسرقة', label: 'حريق وسرقة' },
                          { val: 'ممتلكات شاملة', label: 'ممتلكات شاملة' }
                        ].map(c => (
                          <option key={c.val} value={c.val}>{c.label}</option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Policy Number */}
                  <div className="p-2.5 bg-[#1C2229] rounded-xl border border-[#3A434C] hover:border-[#315EF5]/50 transition-colors">
                    <label className="text-[#7C8791] block text-[10px] mb-1 font-semibold">رقم الوثيقة</label>
                    <input
                      type="text"
                      value={policyNumber}
                      onChange={e => setPolicyNumber(e.target.value)}
                      placeholder="مثال: POL-10293-PAL"
                      className="w-full bg-[#2A323A] border border-[#3A434C] rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-[#315EF5] focus:ring-1 focus:ring-[#315EF5] focus:outline-none"
                    />
                  </div>

                  {/* Estimated Loss */}
                  <div className="p-2.5 bg-[#1C2229] rounded-xl border border-[#3A434C] hover:border-[#22A06B]/50 transition-colors">
                    <label className="text-[#7C8791] block text-[10px] mb-1 font-semibold">التقدير المالي الأولي (شيكل / ر.س)</label>
                    <input
                      type="number"
                      min={0}
                      step={500}
                      value={estimatedLoss === 0 ? '' : estimatedLoss}
                      onChange={e => setEstimatedLoss(parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-[#2A323A] border border-[#3A434C] rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-[#22A06B] focus:ring-1 focus:ring-[#22A06B] focus:outline-none"
                    />
                  </div>

                  {/* Police Report Number */}
                  <div className="p-2.5 bg-[#1C2229] rounded-xl border border-[#3A434C] hover:border-[#D6A83A]/50 transition-colors">
                    <label className="text-[#7C8791] block text-[10px] mb-1 font-semibold">محضر الشرطة</label>
                    <input
                      type="text"
                      value={policeReportNumber}
                      onChange={e => {
                        setPoliceReportNumber(e.target.value);
                        if (e.target.value.trim()) setPoliceNotified(true);
                      }}
                      placeholder="مثال: PR-455410-PAL"
                      className="w-full bg-[#2A323A] border border-[#3A434C] rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-[#D6A83A] focus:ring-1 focus:ring-[#D6A83A] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED VEHICLE & DRIVER INFO */}
          {activeTab === 'vehicle_driver' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Vehicle Specifications */}
              <div className="p-4 bg-[#1C2229] rounded-2xl border border-[#3A434C] space-y-3">
                <h4 className="font-bold text-[#F1F5F9] text-xs flex items-center gap-2 border-b border-[#3A434C] pb-2">
                  <Car className="w-4 h-4 text-[#315EF5]" />
                  <span>مواصفات المركبة وبيانات الملكية</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">رقم اللوحة</label>
                    <input
                      type="text"
                      required
                      value={vehiclePlate}
                      onChange={e => setVehiclePlate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] font-mono font-bold text-[#315EF5]"
                    />
                  </div>

                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">الشركة المصنعة (Make)</label>
                    <input
                      type="text"
                      value={vehicleMake}
                      onChange={e => setVehicleMake(e.target.value)}
                      placeholder="مثال: هيونداي، تويوتا، سكودا..."
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9]"
                    />
                  </div>

                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">طراز المركبة (Model)</label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={e => setVehicleModel(e.target.value)}
                      placeholder="مثال: توسان، كورولا، أوكتافيا..."
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9]"
                    />
                  </div>

                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">سنة الصنع (Year)</label>
                    <input
                      type="number"
                      min={1990}
                      max={2030}
                      value={vehicleYear}
                      onChange={e => setVehicleYear(parseInt(e.target.value) || 2024)}
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9] font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">لون المركبة</label>
                    <input
                      type="text"
                      value={vehicleColor}
                      onChange={e => setVehicleColor(e.target.value)}
                      placeholder="مثال: أبيض لؤلؤي، فضي..."
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9]"
                    />
                  </div>

                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">اسم المالك المسجل بالرخصة</label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={e => setOwnerName(e.target.value)}
                      placeholder="اسم المالك كما في رخصة السير"
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9]"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-2 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer text-[#AAB2BA]">
                      <input
                        type="checkbox"
                        checked={isDriverOwner}
                        onChange={e => {
                          setIsDriverOwner(e.target.checked);
                          if (e.target.checked) setOwnerName(driverName);
                        }}
                        className="rounded accent-[#315EF5] w-4 h-4"
                      />
                      <span>السائق هو نفسه المالك المسجل للمركبة</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Driver & Contact Information */}
              <div className="p-4 bg-[#1C2229] rounded-2xl border border-[#3A434C] space-y-3">
                <h4 className="font-bold text-[#F1F5F9] text-xs flex items-center gap-2 border-b border-[#3A434C] pb-2">
                  <User className="w-4 h-4 text-[#22A06B]" />
                  <span>معلومات السائق وتفاصيل الاتصال الشاملة</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">اسم السائق كاملاً</label>
                    <input
                      type="text"
                      required
                      value={driverName}
                      onChange={e => setDriverName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9] font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">رقم الهوية الوطنية / الإقامة</label>
                    <input
                      type="text"
                      required
                      value={driverId}
                      onChange={e => setDriverId(e.target.value)}
                      placeholder="رقم الهوية المكون من 9 أرقام"
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] font-mono text-[#F1F5F9]"
                    />
                  </div>

                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">رقم رخصة القيادة</label>
                    <input
                      type="text"
                      value={driverLicenseNumber}
                      onChange={e => setDriverLicenseNumber(e.target.value)}
                      placeholder="مثال: DL-448291-PAL"
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] font-mono text-[#F1F5F9]"
                    />
                  </div>

                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">رقم الجوال الأساسي للتواصل</label>
                    <input
                      type="text"
                      required
                      value={driverPhone}
                      onChange={e => setDriverPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] font-mono text-[#F1F5F9]"
                    />
                  </div>

                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">رقم WhatsApp للتواصل الميداني</label>
                    <input
                      type="text"
                      value={driverWhatsapp}
                      onChange={e => setDriverWhatsapp(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] font-mono text-[#22A06B]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INSURANCE POLICY & COMPANY DATA */}
          {activeTab === 'insurance_policy' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-[#1C2229] rounded-2xl border border-[#3A434C] space-y-4">
                <h4 className="font-bold text-[#F1F5F9] text-xs flex items-center gap-2 border-b border-[#3A434C] pb-2">
                  <ShieldCheck className="w-4 h-4 text-[#315EF5]" />
                  <span>بيانات وثيقة التأمين وتغطية الشركة</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">شركة التأمين المصدرة</label>
                    <input
                      type="text"
                      value={insuranceCompany}
                      onChange={e => setInsuranceCompany(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9]"
                    />
                  </div>

                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">رقم وثيقة التأمين</label>
                    <input
                      type="text"
                      value={policyNumber}
                      onChange={e => setPolicyNumber(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] font-mono font-bold text-[#315EF5]"
                    />
                  </div>

                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">نوع التغطية التأمينية</label>
                    <select
                      value={policyType}
                      onChange={e => setPolicyType(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] font-bold text-[#F1F5F9]"
                    >
                      {mdmInsuranceCovers.length > 0 ? (
                        mdmInsuranceCovers.map(item => (
                          <option key={item.id} value={item.nameAr}>{item.nameAr} ({item.nameEn})</option>
                        ))
                      ) : (
                        [
                          { val: 'شامل', label: 'شامل (Comprehensive)' },
                          { val: 'ضد الغير', label: 'ضد الغير / طرف ثالث (Third Party)' },
                          { val: 'حريق وسرقة', label: 'حريق وسرقة (Fire & Theft)' },
                          { val: 'ممتلكات شاملة', label: 'ممتلكات شاملة (All Risks)' }
                        ].map(c => (
                          <option key={c.val} value={c.val}>{c.label}</option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">حد التغطية الأقصى (شيكل / ر.س)</label>
                    <input
                      type="number"
                      value={coverageLimit}
                      onChange={e => setCoverageLimit(parseInt(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] font-mono font-bold text-[#D6A83A]"
                    />
                  </div>

                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">مبلغ التحمل (Deductible)</label>
                    <input
                      type="number"
                      value={deductible}
                      onChange={e => setDeductible(parseInt(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] font-mono font-bold text-[#22A06B]"
                    />
                  </div>

                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">حالة سريان الوثيقة عند الحادث</label>
                    <select
                      value={policyStatus}
                      onChange={e => setPolicyStatus(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] font-bold text-[#F1F5F9]"
                    >
                      <option value="سارية ومطابقة">سارية ومطابقة</option>
                      <option value="منتهية الصلاحية">منتهية الصلاحية</option>
                      <option value="معلقة لعدم السداد">معلقة لعدم السداد</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-[#315EF5]/15 rounded-xl border border-[#315EF5]/30 text-xs text-[#F1F5F9] flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#315EF5] mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-[#315EF5] block">تجميد نسخة الوثيقة (Policy Freeze):</span>
                    <span className="text-[#AAB2BA]">عند حفظ البلاغ، سيتم حفظ نسخة مطابقة للوثيقة في سجل التدقيق لحماية حقوق كافة الأطراف.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LOCATION & POLICE DETAILS */}
          {activeTab === 'location_details' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-[#1C2229] rounded-2xl border border-[#3A434C] space-y-3">
                <h4 className="font-bold text-[#F1F5F9] text-xs flex items-center gap-2 border-b border-[#3A434C] pb-2">
                  <MapPin className="w-4 h-4 text-[#D64545]" />
                  <span>الهيكل الجغرافي وتفاصيل موقع الحادث</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">المحافظة</label>
                    <select
                      value={governorate}
                      onChange={e => {
                        setGovernorate(e.target.value as any);
                        setCity(e.target.value);
                      }}
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#315EF5] font-bold"
                    >
                      {mdmGovernorates.length > 0 ? (
                        mdmGovernorates.filter(g => !g.parentId).map(gov => (
                          <option key={gov.id} value={gov.nameAr}>محافظة {gov.nameAr}</option>
                        ))
                      ) : (
                        [...PALESTINE_GOVERNORATES['الضفة الغربية'], ...PALESTINE_GOVERNORATES['قطاع غزة']].map(gov => (
                          <option key={gov} value={gov}>محافظة {gov}</option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">نوع التجمع السكاني</label>
                    <select
                      value={localityType}
                      onChange={e => setLocalityType(e.target.value as PalestineLocalityType)}
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9] font-bold"
                    >
                      <option value="مدينة">مدينة</option>
                      <option value="بلدة">بلدة</option>
                      <option value="قرية">قرية</option>
                      <option value="مخيم لاجئين">مخيم لاجئين</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">المدينة / التجمع</label>
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="مثال: نابلس، رام الله، مخيم بلاطة..."
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9]"
                    />
                  </div>

                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">الحي / المنطقة الفرعية</label>
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={e => setNeighborhood(e.target.value)}
                      placeholder="مثال: رفيديا، الماصيون..."
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9]"
                    />
                  </div>

                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">الشارع / الطريق</label>
                    <input
                      type="text"
                      value={street}
                      onChange={e => setStreet(e.target.value)}
                      placeholder="مثال: شارع يافا الرئيسي"
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9]"
                    />
                  </div>

                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">أقرب معلم بارز</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={e => setLandmark(e.target.value)}
                      placeholder="مثال: قرب المستشفى العربي..."
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9]"
                    />
                  </div>
                </div>
              </div>

              {/* Police & Dynamic Details */}
              <div className="p-4 bg-[#1C2229] rounded-2xl border border-[#3A434C] space-y-3">
                <h4 className="font-bold text-[#F1F5F9] text-xs flex items-center gap-2 border-b border-[#3A434C] pb-2">
                  <ShieldAlert className="w-4 h-4 text-[#D6A83A]" />
                  <span>محضر الشرطة، الإصابات، والسبب المحتمل</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">رقم محضر الشرطة</label>
                    <input
                      type="text"
                      value={policeReportNumber}
                      onChange={e => setPoliceReportNumber(e.target.value)}
                      placeholder="مثال: PR-994821-PAL"
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] font-mono text-[#D6A83A]"
                    />
                  </div>

                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">مركز / مخفر الشرطة</label>
                    <input
                      type="text"
                      value={policeStation}
                      onChange={e => setPoliceStation(e.target.value)}
                      placeholder="مثال: مديرية شرطة نابلس"
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9]"
                    />
                  </div>

                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">السبب المحتمل للحادث</label>
                    <input
                      type="text"
                      value={potentialCause}
                      onChange={e => setPotentialCause(e.target.value)}
                      placeholder="مثال: عدم ترك مسافة أمان، سرعة زائدة..."
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9]"
                    />
                  </div>

                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">عدد الإصابات</label>
                    <input
                      type="number"
                      min={0}
                      value={casualtiesCount}
                      onChange={e => setCasualtiesCount(parseInt(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9] font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[#AAB2BA] font-semibold block mb-1">تقدير الخسائر المالي الأولي</label>
                    <input
                      type="number"
                      value={estimatedLoss}
                      onChange={e => setEstimatedLoss(parseInt(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#22A06B] font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ATTACHMENTS & PHOTOS */}
          {activeTab === 'attachments' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-[#1C2229] rounded-2xl border border-[#3A434C] space-y-4">
                <div className="flex items-center justify-between border-b border-[#3A434C] pb-2">
                  <h4 className="font-bold text-[#F1F5F9] text-xs flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#315EF5]" />
                    <span>إرفاق صور الحادث والمستندات الثبوتية ({photos.length})</span>
                  </h4>
                  <span className="text-[11px] text-[#AAB2BA]">تدعم المعاينة الفورية للأدلة</span>
                </div>

                {/* Add Photo Input */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newPhotoUrl}
                    onChange={e => setNewPhotoUrl(e.target.value)}
                    placeholder="الصق رابط صورة الحادث أو التلفيات..."
                    className="flex-1 p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9] placeholder-[#7C8791] text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhoto}
                    className="px-4 py-2.5 bg-[#315EF5] hover:bg-[#315EF5]/90 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة</span>
                  </button>
                </div>

                {/* Photo Previews */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden border border-[#3A434C] bg-[#2A323A] aspect-video">
                      <img
                        src={photo}
                        alt={`Accident evidence ${index + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          className="p-1.5 bg-[#D64545] text-white rounded-lg hover:bg-red-700 transition-colors"
                          title="حذف الصورة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/70 text-white text-[10px] rounded font-mono">
                        #{index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t border-[#3A434C] flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="text-[11px] text-[#AAB2BA] flex items-center gap-2">
              <span>رقم البلاغ المعتمد:</span>
              <strong className="font-mono text-[#315EF5] bg-[#315EF5]/15 px-2 py-0.5 rounded border border-[#315EF5]/30">{accidentNumber}</strong>
              <span>|</span>
              <span>اللوحة: <strong className="font-mono text-[#F1F5F9]">{vehiclePlate || 'لم يحدد'}</strong></span>
              <span>|</span>
              <span>السائق: <strong className="text-[#F1F5F9]">{driverName || 'لم يحدد'}</strong></span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-[#323A40] hover:bg-[#3A434C] text-[#F1F5F9] rounded-xl text-xs font-semibold transition-colors border border-[#3A434C]"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#D64545] hover:bg-[#D64545]/90 text-white rounded-xl text-xs font-semibold shadow-lg shadow-red-600/20 transition-all flex items-center gap-2 font-bold cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>إرسال البلاغ لغرفة العمليات</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
