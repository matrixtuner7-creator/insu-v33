import React, { useState, useEffect } from 'react';
import { 
  Accident, 
  Vehicle, 
  Driver, 
  INCIDENT_TAXONOMY, 
  IncidentCategory, 
  IncidentParty,
  PalestineRegion,
  PalestineGovernorate,
  PalestineLocalityType,
  PALESTINE_GOVERNORATES,
  IncidentLocation,
  FieldAgent
} from '../types';
import { CaseCommunicationBag } from './CaseCommunicationBag';
import { 
  PhoneCall, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Send,
  Layers,
  Users,
  Car,
  DollarSign,
  Plus,
  Trash2,
  Briefcase,
  Building,
  Radio,
  MessageSquare,
  LifeBuoy
} from 'lucide-react';

interface ReceptionPortalProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  agents?: FieldAgent[];
  onReportCreated: (newAccident: Accident) => void;
}

export const ReceptionPortal: React.FC<ReceptionPortalProps> = ({
  vehicles,
  drivers,
  agents = [],
  onReportCreated,
}) => {
  const [callerName, setCallerName] = useState('');
  const [callerPhone, setCallerPhone] = useState('');
  const [callerNationalId, setCallerNationalId] = useState('');
  
  // Hierarchical category selection
  const [category, setCategory] = useState<any>('');
  const [subtype, setSubtype] = useState<string>('');
  
  // Palestine Geographic Location Form
  const [region, setRegion] = useState<any>('الضفة الغربية');
  const [governorate, setGovernorate] = useState<any>('');
  const [localityType, setLocalityType] = useState<any>('مدينة');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [street, setStreet] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [landmark, setLandmark] = useState('');
  
  const [severity, setSeverity] = useState<any>('');
  const [priority, setPriority] = useState<any>('عادية');

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
            setSubtype(incTypes[0].nameAr);
            setCategory(incTypes[0].parentId ? 'أخرى' : 'حوادث مركبات');
          }
          if (sevs.length > 0) {
            setMdmSeverities(sevs);
            setSeverity(sevs[0].nameAr);
          }
          if (govs.length > 0) {
            setMdmGovernorates(govs);
            const parentGov = govs.find(g => !g.parentId);
            if (parentGov) setGovernorate(parentGov.nameAr);
          }
          if (covers.length > 0) {
            setMdmInsuranceCovers(covers);
            setPolicyType(covers[0].nameAr);
          }
        }
      })
      .catch(err => console.error("Error loading master data in ReceptionPortal:", err));
  }, []);
  
  // Operational Handoff Options
  const [dispatchMode, setDispatchMode] = useState<'hq_forward' | 'urgent_request'>('hq_forward');
  
  // Vehicle / Property specifics
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [affectedUnits, setAffectedUnits] = useState(0);
  
  // Financial & Insurance
  const [estimatedLoss, setEstimatedLoss] = useState(0);
  const [policyType, setPolicyType] = useState<any>('');
  
  // Policy Registry Lookup
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<any>(null);
  
  const [description, setDescription] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [generatedClaimNum, setGeneratedClaimNum] = useState('');
  const [createdIncidentId, setCreatedIncidentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCaseBagModal, setShowCaseBagModal] = useState(false);

  const handleLookupPolicy = async () => {
    if (!lookupQuery.trim()) return;
    setLookupLoading(true);
    setLookupResult(null);

    try {
      const q = lookupQuery.trim();
      const res = await fetch(`/api/insured-policies/lookup?plateNumber=${encodeURIComponent(q)}`);
      const data = await res.json();
      
      let foundPolicy = data.found ? data.policy : null;
      if (!foundPolicy) {
        // Try national ID
        const resId = await fetch(`/api/insured-policies/lookup?nationalId=${encodeURIComponent(q)}`);
        const dataId = await resId.json();
        if (dataId.found) {
          foundPolicy = dataId.policy;
        }
      }

      if (foundPolicy) {
        setLookupResult({ success: true, policy: foundPolicy });
        // Auto populate fields
        setCallerName(foundPolicy.insuredName || callerName);
        setCallerPhone(foundPolicy.phone || callerPhone);
        setCallerNationalId(foundPolicy.nationalId || callerNationalId);
        setVehiclePlate(foundPolicy.plateNumber || vehiclePlate);
        setVehicleModel(`${foundPolicy.vehicleMake} ${foundPolicy.vehicleModel} (${foundPolicy.vehicleYear})`);
        if (foundPolicy.coverageType) {
          setPolicyType(foundPolicy.coverageType);
        }
        if (foundPolicy.city) {
          setCity(foundPolicy.city);
        }
        // Also update initial party
        setParties([
          {
            id: 'pty-init-1',
            partyRole: 'مؤمَّن له',
            fullName: foundPolicy.insuredName,
            nationalId: foundPolicy.nationalId,
            phone: foundPolicy.phone,
            vehiclePlate: foundPolicy.plateNumber,
            vehicleModel: `${foundPolicy.vehicleMake} ${foundPolicy.vehicleModel}`,
            injuryStatus: 'لا إصابة',
            statementTaken: true,
            statementSummary: `وثيقة تأمين سارية رقم ${foundPolicy.policyNumber} لدى ${foundPolicy.insuranceCompany}`
          }
        ]);
      } else {
        setLookupResult({ success: false, message: 'لم يتم العثور على وثيقة مطابقة في سجل التأمين' });
      }
    } catch (err: any) {
      setLookupResult({ success: false, message: 'خطأ في الاتصال بالسجل: ' + err.message });
    } finally {
      setLookupLoading(false);
    }
  };

  // Additional Third-Party / Witness
  const [parties, setParties] = useState<IncidentParty[]>([]);

  const handleRegionChange = (newRegion: PalestineRegion) => {
    setRegion(newRegion);
    const availableGovs = PALESTINE_GOVERNORATES[newRegion];
    if (availableGovs && availableGovs.length > 0) {
      setGovernorate(availableGovs[0] as PalestineGovernorate);
      setCity(availableGovs[0]);
    }
  };

  const handleGovernorateChange = (newGov: PalestineGovernorate) => {
    setGovernorate(newGov);
    setCity(newGov);
  };

  const handleCategoryChange = (newCat: IncidentCategory) => {
    setCategory(newCat);
    const availableSubtypes = INCIDENT_TAXONOMY[newCat];
    if (availableSubtypes && availableSubtypes.length > 0) {
      setSubtype(availableSubtypes[0]);
    }
  };

  const isVehicleRelated = category === 'حوادث مركبات' || (subtype || '').includes('مركبة');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const claimNum = `CLM-2026-${randomNum}`;
    const incidentId = `acc-${Date.now()}`;

    const locationDetails: IncidentLocation = {
      region,
      governorate,
      localityType,
      city,
      neighborhood,
      street,
      buildingNumber,
      landmark,
      latitude: region === 'قطاع غزة' ? 31.5017 : 32.2227,
      longitude: region === 'قطاع غزة' ? 34.4668 : 35.2621
    };

    const fullLocationName = `${governorate} - ${localityType} ${city} (${neighborhood || street})`;

    const newAcc: Accident = {
      id: incidentId,
      accidentNumber: claimNum,
      timestamp: new Date().toISOString(),
      locationName: fullLocationName,
      lat: locationDetails.latitude,
      lng: locationDetails.longitude,
      locationDetails,
      severity,
      status: 'جديد',
      incidentCategory: category,
      incidentSubtype: subtype,
      vehiclePlate: isVehicleRelated ? vehiclePlate : 'غير منطبق',
      driverName: callerName,
      driverId: callerNationalId,
      description: `[تصنيف: ${category} > ${subtype}] [الموقع: ${fullLocationName}] - ${description}`,
      insuranceClaimStatus: 'معلق',
      potentialCause: category === 'سرقة وسطو' ? 'جريمة سرقة واعتداء على الممتلكات' :
                      category === 'حريق' ? 'اشتعال وتماس محتمل' :
                      category === 'كوارث طبيعية' ? 'سيول وتقلبات مناخية' : 'حادث مروري مفاجئ',
      roadType: localityType === 'مخيم لاجئين' ? 'أزقة مخيم ضيقة' : 'طريق رئيسي',
      weather: 'صحو ومستقر',
      parties: parties.map((p, idx) => idx === 0 ? { ...p, fullName: callerName, phone: callerPhone, nationalId: callerNationalId } : p),
      policySnapshot: {
        policyNumber: `POL-${Math.floor(10000 + Math.random() * 90000)}-PAL`,
        policyType,
        coverageLimit: 500000,
        deductible: 1500,
        policyStatusAtIncident: 'سارية ومطابقة',
        effectiveDate: '2026-01-01',
        expiryDate: '2026-12-31'
      },
      financialEstimates: {
        estimatedLossAmount: estimatedLoss,
        finalApprovedAmount: 0,
        currency: 'SAR',
        fraudRiskFlag: 'لا يوجد اشتباه',
        fraudNotes: `بلاغ وارد عبر مركز الاتصال لموقع (${governorate} - ${localityType} ${city}).`
      },
      propertyDetails: !isVehicleRelated ? {
        propertyType,
        affectedUnitsCount: affectedUnits,
        damageDescription: description
      } : undefined,
      photos: [
        'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80'
      ]
    };

    try {
      // Include idempotencyKey in the request body as expected by the backend
      const newAccWithKey = {
        ...newAcc,
        idempotencyKey: `${Date.now()}-${Math.random()}`
      };

      console.log('DEBUG: Submitting accident report:', newAccWithKey);
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccWithKey),
      });

      console.log('DEBUG: API Response status:', res.status);
      if (res.ok) {
        const saved = await res.json();
        console.log('DEBUG: Saved accident:', saved);
        onReportCreated(saved);
        setGeneratedClaimNum(claimNum);
        setCreatedIncidentId(incidentId);

        // Also post movement logs to Cloud SQL & trigger Socket.IO
        console.log('DEBUG: Posting movement logs...');
        await fetch('/api/movements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            case_id: claimNum,
            type: 'incident_received',
            actor_id: 'reception-01',
            actor_name: callerName,
            actor_role: 'call_center',
            note: 'INCIDENT_RECEIVED: تسجيل البلاغ في مركز الاتصال والاستقبال',
            location_lat: locationDetails.latitude,
            location_lng: locationDetails.longitude,
            device_info: 'web-reception'
          })
        });

        if (dispatchMode === 'hq_forward') {
          console.log('DEBUG: Forwarding to HQ...');
          await fetch('/api/movements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              case_id: claimNum,
              type: 'incident_forwarded_to_hq',
              actor_id: 'reception-01',
              actor_name: 'موظف الاستقبال المركزي',
              actor_role: 'call_center',
              note: 'INCIDENT_FORWARDED_TO_HQ: إحالة القضية إلى غرفة العمليات عبر Socket.IO',
              device_info: 'web-reception'
            })
          });
        } else {
          console.log('DEBUG: Requesting urgent investigator...');
          await fetch('/api/movements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              case_id: claimNum,
              type: 'urgent_investigator_requested',
              actor_id: 'reception-01',
              actor_name: 'موظف الاستقبال المركزي',
              actor_role: 'call_center',
              note: 'URGENT_INVESTIGATOR_REQUESTED: طلب محقق ميداني عاجل من الاستقبال',
              device_info: 'web-reception'
            })
          });
        }

        setSuccessMsg(`تم تسجيل البلاغ #${claimNum}`);
      } else {
        const errorText = await res.text();
        console.error('DEBUG: API Error Response:', errorText);
      }
    } catch (err) {
      console.error('DEBUG: Submission Exception:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn" dir="rtl">
      <div className="bg-[#2A323A] rounded-3xl shadow-xl border border-[#3A434C] overflow-hidden text-[#F1F5F9]">
        
        {/* Header */}
        <div className="p-6 bg-[#161B1F] border-b border-[#3A434C] text-[#F1F5F9] flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-[#315EF5]/20 border border-[#315EF5]/30 rounded-2xl text-[#315EF5]">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#F1F5F9]">بوابة استقبال البلاغات ومركز الاتصال الموحد</h2>
              <p className="text-xs text-[#AAB2BA]">تسجيل البلاغات الأولية، الهيكل الجغرافي الفلسطيني، وتوليد حقيبة التحقيق الرقمية</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-[#22A06B]/20 text-[#22A06B] border border-[#22A06B]/30 rounded-xl text-xs font-bold">
            جاهز للاستقبال
          </span>
        </div>

        {successMsg ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-[#22A06B]/20 text-[#22A06B] border border-[#22A06B]/30 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-[#F1F5F9]">{successMsg}</h3>
              <p className="text-xs text-[#22A06B] font-bold">تم إشعار غرفة العمليات المركزية (HQ) بنجاح عبر Socket.IO</p>
            </div>
            
            <div className="p-4 bg-[#1C2229] border border-[#3A434C] rounded-2xl max-w-sm mx-auto font-mono text-sm font-black text-[#315EF5] shadow-sm">
              {generatedClaimNum}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowCaseBagModal(true)}
                className="px-5 py-3 bg-[#323A40] hover:bg-[#3A434C] text-[#F1F5F9] border border-[#3A434C] rounded-xl text-xs font-bold transition-all shadow flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4 text-[#315EF5]" />
                <span>فتح حقيبة القضية (Case Bag)</span>
              </button>
              <button
                onClick={() => setShowCaseBagModal(true)}
                className="px-5 py-3 bg-[#315EF5] hover:bg-[#315EF5]/90 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>مراسلة العمليات</span>
              </button>
            </div>

            <div className="pt-4 border-t border-[#3A434C]">
              <button
                onClick={() => {
                  setSuccessMsg('');
                  setGeneratedClaimNum('');
                  setCreatedIncidentId('');
                }}
                className="text-xs text-[#AAB2BA] hover:text-white underline font-semibold"
              >
                تسجيل بلاغ اتصال جديد
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 text-[#F1F5F9] text-xs">
            
            {/* Quick Auto-Fill from Insured Registry */}
            <div className="p-4 bg-gradient-to-r from-[#315EF5]/15 via-[#2A323A] to-[#22A06B]/15 border border-[#315EF5]/30 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#315EF5]" />
                  <span className="font-bold text-[#F1F5F9] text-xs">استعلام وتعبئة تلقائية من سجل وثائق التأمين والمركبات (Excel / Database)</span>
                </div>
                <span className="px-2 py-0.5 bg-[#315EF5]/20 text-[#315EF5] rounded-lg text-[10px] font-bold">ربط مباشر بالسجل</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleLookupPolicy();
                    }
                  }}
                  placeholder="أدخل رقم اللوحة (مثال: 3-8834-92) أو رقم الهوية (9 أرقام)..."
                  className="flex-1 px-3 py-2 bg-[#161B1F] border border-[#3A434C] rounded-xl text-xs text-[#F1F5F9] placeholder-[#7C8791] focus:ring-2 focus:ring-[#315EF5] focus:outline-none"
                />
                <button
                  type="button"
                  disabled={lookupLoading || !lookupQuery.trim()}
                  onClick={handleLookupPolicy}
                  className="px-4 py-2 bg-[#315EF5] hover:bg-[#2549d4] disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {lookupLoading ? 'جاري البحث...' : 'استعلام وتعبئة تلقائية'}
                </button>
              </div>

              {lookupResult && (
                <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between ${
                  lookupResult.success 
                    ? 'bg-[#22A06B]/20 text-[#22A06B] border border-[#22A06B]/30' 
                    : 'bg-[#D64545]/20 text-[#D64545] border border-[#D64545]/30'
                }`}>
                  <div className="flex items-center gap-2">
                    {lookupResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    <span>
                      {lookupResult.success 
                        ? `✓ تم العثور على وثيقة سارية: ${lookupResult.policy.policyNumber} - ${lookupResult.policy.insuredName} (${lookupResult.policy.insuranceCompany})` 
                        : lookupResult.message}
                    </span>
                  </div>
                  {lookupResult.success && (
                    <span className="text-[10px] bg-[#22A06B]/30 px-2 py-0.5 rounded">تمت التعبئة التلقائية</span>
                  )}
                </div>
              )}
            </div>

            {/* Caller Identity */}
            <div className="space-y-3">
              <h4 className="font-bold text-[#F1F5F9] text-sm flex items-center gap-2 border-b border-[#3A434C] pb-2">
                <Users className="w-4 h-4 text-[#315EF5]" />
                <span>بيانات المتصل / مقدم البلاغ</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-[#AAB2BA] block mb-1">اسم المتصل الكامل</label>
                  <input
                    type="text"
                    required
                    value={callerName}
                    onChange={e => setCallerName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#1C2229] text-[#F1F5F9] placeholder-[#7C8791] focus:ring-2 focus:ring-[#315EF5] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#AAB2BA] block mb-1">رقم الجوال للتواصل</label>
                  <input
                    type="text"
                    required
                    value={callerPhone}
                    onChange={e => setCallerPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#1C2229] text-[#F1F5F9] placeholder-[#7C8791] focus:ring-2 focus:ring-[#315EF5] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#AAB2BA] block mb-1">رقم الهوية</label>
                  <input
                    type="text"
                    required
                    value={callerNationalId}
                    onChange={e => setCallerNationalId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#1C2229] text-[#F1F5F9] placeholder-[#7C8791] focus:ring-2 focus:ring-[#315EF5] focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Hierarchical Incident Category */}
            <div className="space-y-3">
              <h4 className="font-bold text-[#F1F5F9] text-sm flex items-center gap-2 border-b border-[#3A434C] pb-2">
                <Layers className="w-4 h-4 text-[#315EF5]" />
                <span>التصنيف الهرمي للحدث ومستوى الخطورة</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {mdmIncidentTypes.length > 0 ? (
                  <div className="col-span-2">
                    <label className="font-semibold text-[#AAB2BA] block mb-1">نوع وتصنيف الحادث (MDM) *</label>
                    <select
                      value={subtype}
                      onChange={e => {
                        setSubtype(e.target.value);
                        const selected = mdmIncidentTypes.find(t => t.nameAr === e.target.value);
                        if (selected) {
                          setCategory(selected.parentId ? 'أخرى' : 'حوادث مركبات');
                        }
                      }}
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#1C2229] font-bold text-[#F1F5F9] focus:ring-2 focus:ring-[#315EF5] focus:outline-none"
                    >
                      {mdmIncidentTypes.map(item => (
                        <option key={item.id} value={item.nameAr}>{item.nameAr}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="font-semibold text-[#AAB2BA] block mb-1">التصنيف الرئيسي (Category)</label>
                      <select
                        value={category}
                        onChange={e => handleCategoryChange(e.target.value as IncidentCategory)}
                        className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#1C2229] font-bold text-[#F1F5F9] focus:ring-2 focus:ring-[#315EF5] focus:outline-none"
                      >
                        {Object.keys(INCIDENT_TAXONOMY).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-[#AAB2BA] block mb-1">التصنيف الفرعي (Subtype)</label>
                      <select
                        value={subtype}
                        onChange={e => setSubtype(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#1C2229] font-semibold text-[#F1F5F9] focus:ring-2 focus:ring-[#315EF5] focus:outline-none"
                      >
                        {(INCIDENT_TAXONOMY[category] || []).map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="font-semibold text-[#AAB2BA] block mb-1">مستوى الخطورة والأولوية</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={severity}
                      onChange={e => setSeverity(e.target.value as any)}
                      className="p-2.5 rounded-xl border border-[#3A434C] bg-[#1C2229] font-semibold text-[#F1F5F9]"
                    >
                      {mdmSeverities.length > 0 ? (
                        mdmSeverities.map(item => (
                          <option key={item.id} value={item.nameAr}>{item.nameAr}</option>
                        ))
                      ) : (
                        ['خفيف', 'متوسط', 'بليغ', 'حرج'].map(sev => (
                          <option key={sev} value={sev}>{sev}</option>
                        ))
                      )}
                    </select>
                    <select
                      value={priority}
                      onChange={e => setPriority(e.target.value as any)}
                      className="p-2.5 rounded-xl border border-[#3A434C] bg-[#1C2229] font-semibold text-[#F1F5F9]"
                    >
                      <option value="عادية">أولوية عادية</option>
                      <option value="عاجلة">أولوية عاجلة</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Palestine Geographic Location Breakdown */}
            <div className="space-y-3 bg-[#1C2229] p-4 rounded-2xl border border-[#3A434C]">
              <h4 className="font-bold text-[#F1F5F9] text-sm flex items-center gap-2 border-b border-[#3A434C] pb-2">
                <MapPin className="w-4 h-4 text-[#D64545]" />
                <span>الهيكل الجغرافي ونوع التجمع السكاني (فلسطين)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-[#AAB2BA] block mb-1">الإقليم / المنطقة</label>
                  <select
                    value={region}
                    onChange={e => handleRegionChange(e.target.value as PalestineRegion)}
                    className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] font-bold text-[#F1F5F9]"
                  >
                    <option value="الضفة الغربية">الضفة الغربية (11 محافظة)</option>
                    <option value="قطاع غزة">قطاع غزة (5 محافظات)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#AAB2BA] block mb-1">المحافظة (MDM متزامن)</label>
                  <select
                    value={governorate}
                    onChange={e => handleGovernorateChange(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] font-bold text-[#315EF5]"
                  >
                    {mdmGovernorates.length > 0 ? (
                      mdmGovernorates.filter(g => !g.parentId).map(gov => (
                        <option key={gov.id} value={gov.nameAr}>محافظة {gov.nameAr}</option>
                      ))
                    ) : (
                      PALESTINE_GOVERNORATES[region].map(gov => (
                        <option key={gov} value={gov}>محافظة {gov}</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#AAB2BA] block mb-1">نوع التجمع السكاني (Locality Type)</label>
                  <select
                    value={localityType}
                    onChange={e => setLocalityType(e.target.value as PalestineLocalityType)}
                    className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#2A323A] font-bold text-[#F1F5F9]"
                  >
                    <option value="مدينة">مدينة</option>
                    <option value="بلدة">بلدة</option>
                    <option value="قرية">قرية</option>
                    <option value="مخيم لاجئين">مخيم لاجئين (كثافة مرتفعة / عقود استضافة)</option>
                  </select>
                </div>
              </div>

              {localityType === 'مخيم لاجئين' && (
                <div className="p-3 bg-[#D64545]/20 border border-[#D64545]/40 rounded-xl text-[#F1F5F9] text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#D64545] mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold block text-[#D64545]">تنبيه تقييم أضرار المخيمات:</span>
                    <span className="text-[#AAB2BA]">المخيمات تتطلب توثيقاً هندسياً ميدانياً دقيقاً للأبنية المتلاصقة وتقدير الأضرار المباشرة نظراً لخصوصية البنية العقارية.</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="font-semibold text-[#AAB2BA] block mb-1">اسم المدينة / القرية / المخيم</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="مثال: نابلس، مخيم بلاطة، رام الله..."
                    className="w-full p-2 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9] placeholder-[#7C8791]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#AAB2BA] block mb-1">الحي / المنطقة الفرعية</label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={e => setNeighborhood(e.target.value)}
                    placeholder="مثال: رفيديا، الماصيون، حارة الحشاشين..."
                    className="w-full p-2 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9] placeholder-[#7C8791]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#AAB2BA] block mb-1">الشارع / الطريق</label>
                  <input
                    type="text"
                    value={street}
                    onChange={e => setStreet(e.target.value)}
                    placeholder="مثال: شارع يافا، الشارع العام..."
                    className="w-full p-2 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9] placeholder-[#7C8791]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#AAB2BA] block mb-1">أقرب معلم بارز</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={e => setLandmark(e.target.value)}
                    placeholder="مثال: قرب المستشفى، بجانب المركز..."
                    className="w-full p-2 rounded-xl border border-[#3A434C] bg-[#2A323A] text-[#F1F5F9] placeholder-[#7C8791]"
                  />
                </div>
              </div>
            </div>

            {/* Asset or Vehicle Specifics */}
            <div className="space-y-3">
              <h4 className="font-bold text-[#F1F5F9] text-sm flex items-center gap-2 border-b border-[#3A434C] pb-2">
                {isVehicleRelated ? <Car className="w-4 h-4 text-[#315EF5]" /> : <Building className="w-4 h-4 text-[#D6A83A]" />}
                <span>{isVehicleRelated ? 'بيانات المركبة والوثيقة' : 'بيانات العقار والممتلكات المتضررة'}</span>
              </h4>

              {isVehicleRelated ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-semibold text-[#AAB2BA] block mb-1">رقم لوحة المركبة</label>
                    <input
                      type="text"
                      required
                      value={vehiclePlate}
                      onChange={e => setVehiclePlate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#1C2229] font-mono font-bold text-[#315EF5]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#AAB2BA] block mb-1">طراز ونوع المركبة</label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={e => setVehicleModel(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#1C2229] text-[#F1F5F9]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#AAB2BA] block mb-1">نوع التغطية التأمينية</label>
                    <select
                      value={policyType}
                      onChange={e => setPolicyType(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#1C2229] text-[#F1F5F9] font-bold"
                    >
                      <option value="شامل">شامل</option>
                      <option value="ضد الغير">ضد الغير</option>
                      <option value="حريق وسرقة">حريق وسرقة</option>
                      <option value="ممتلكات شاملة">ممتلكات شاملة</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-[#AAB2BA] block mb-1">نوع العقار / المنشأة</label>
                    <input
                      type="text"
                      value={propertyType}
                      onChange={e => setPropertyType(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#1C2229] text-[#F1F5F9] font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#AAB2BA] block mb-1">عدد الوحدات المتضررة</label>
                    <input
                      type="number"
                      min={1}
                      value={affectedUnits}
                      onChange={e => setAffectedUnits(parseInt(e.target.value) || 1)}
                      className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#1C2229] text-[#F1F5F9] font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Description & Financial Estimate */}
            <div className="space-y-3">
              <h4 className="font-bold text-[#F1F5F9] text-sm flex items-center gap-2 border-b border-[#3A434C] pb-2">
                <FileText className="w-4 h-4 text-[#315EF5]" />
                <span>ملابسات الحادث والتقدير المالي الأولي</span>
              </h4>

              <div>
                <label className="font-semibold text-[#AAB2BA] block mb-1">شرح ملابسات الحادث وأقوال المتصل</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#3A434C] bg-[#1C2229] text-[#F1F5F9] placeholder-[#7C8791] focus:ring-2 focus:ring-[#315EF5] focus:outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-[#AAB2BA] block mb-1">تقدير الخسائر المالي الأولي (شيكل / ريال)</label>
                  <input
                    type="number"
                    value={estimatedLoss}
                    onChange={e => setEstimatedLoss(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-[#3A434C] bg-[#1C2229] font-bold text-[#22A06B]"
                  />
                </div>
              </div>
            </div>

            {/* الإحالة والتواصل التشغيلي (Operational Handoff Section) */}
            <div className="space-y-3 bg-[#1C2229] p-4 rounded-2xl border border-[#3A434C]">
              <h4 className="font-bold text-[#F1F5F9] text-sm flex items-center gap-2 border-b border-[#3A434C] pb-2">
                <Radio className="w-4 h-4 text-[#315EF5]" />
                <span>الإحالة والتواصل التشغيلي</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${dispatchMode === 'hq_forward' ? 'bg-[#323A40] border-[#315EF5] shadow-sm' : 'bg-transparent border-[#3A434C] hover:bg-[#323A40]/50'}`}>
                  <input 
                    type="radio" 
                    name="dispatchMode" 
                    checked={dispatchMode === 'hq_forward'} 
                    onChange={() => setDispatchMode('hq_forward')}
                    className="mt-1" 
                  />
                  <div>
                    <span className="font-bold block text-[#F1F5F9]">1. إحالة إلى غرفة العمليات (افتراضي)</span>
                    <span className="text-[11px] text-[#AAB2BA]">تسجيل البلاغ في Cloud SQL وإرساله فوراً إلى غرفة العمليات (HQ) عبر Socket.IO لصدور تنبيه صوتي Pop-up.</span>
                  </div>
                </label>

                <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${dispatchMode === 'urgent_request' ? 'bg-[#323A40] border-[#D64545] shadow-sm' : 'bg-transparent border-[#3A434C] hover:bg-[#323A40]/50'}`}>
                  <input 
                    type="radio" 
                    name="dispatchMode" 
                    checked={dispatchMode === 'urgent_request'} 
                    onChange={() => setDispatchMode('urgent_request')}
                    className="mt-1" 
                  />
                  <div>
                    <span className="font-bold block text-[#F1F5F9]">2. طلب محقق ميداني عاجل</span>
                    <span className="text-[11px] text-[#AAB2BA]">طلب تدخل ميداني سريع يظهر في غرفة العمليات كحالة طارئة تتطلب التوجيه الرسمي دون اختيار المحقق افتراضياً.</span>
                  </div>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-[#AAB2BA] border-t border-[#3A434C]">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#315EF5]" />
                  <span>3. مخاطبة غرفة العمليات (متاحة عبر حقيبة القضية وربط موحد بـ incident_id).</span>
                </span>
                <span className="font-bold text-[#315EF5]">التعيين الرسمي للمحقق من HQ فقط لمنع التضارب</span>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-[#3A434C] flex items-center justify-between">
              <span className="text-[#AAB2BA] text-xs">سيتم فتح حقيبة رقمية وتسجيل حركة إنشاء أوتوماتيكية وإسنادها لغرفة العمليات.</span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-[#315EF5] hover:bg-[#315EF5]/90 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'جاري التسجيل...' : 'تسجيل البلاغ وإحالته لغرفة العمليات'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Case Communication Bag Modal if opened from success screen */}
      {showCaseBagModal && createdIncidentId && (
        <div className="fixed inset-0 z-[99999] bg-[#1C2229]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl h-[85vh] flex flex-col">
            <CaseCommunicationBag
              incidentId={createdIncidentId}
              incidentNumber={generatedClaimNum || '#CLM-2026-000'}
              currentUserName="مركز الاستقبال والاتصال"
              currentUserRole="Reception"
              agents={agents}
              onClose={() => setShowCaseBagModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

