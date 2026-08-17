import React, { useState } from 'react';
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
  IncidentLocation
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
  onReportCreated: (newAccident: Accident) => void;
}

export const ReceptionPortal: React.FC<ReceptionPortalProps> = ({
  vehicles,
  drivers,
  onReportCreated,
}) => {
  const [callerName, setCallerName] = useState('خالد أبو سعيد');
  const [callerPhone, setCallerPhone] = useState('+970599123456');
  const [callerNationalId, setCallerNationalId] = useState('908273641');
  
  // Hierarchical category selection
  const [category, setCategory] = useState<IncidentCategory>('حوادث مركبات');
  const [subtype, setSubtype] = useState<string>('تصادم');
  
  // Palestine Geographic Location Form
  const [region, setRegion] = useState<PalestineRegion>('الضفة الغربية');
  const [governorate, setGovernorate] = useState<PalestineGovernorate>('نابلس');
  const [localityType, setLocalityType] = useState<PalestineLocalityType>('مدينة');
  const [city, setCity] = useState('نابلس');
  const [neighborhood, setNeighborhood] = useState('رفيديا');
  const [street, setStreet] = useState('شارع يافا الرئيسي');
  const [buildingNumber, setBuildingNumber] = useState('عمارة النورس 14');
  const [landmark, setLandmark] = useState('قرب مستشفى العربي التخصصي');
  
  const [severity, setSeverity] = useState<'خفيف' | 'متوسط' | 'بليغ' | 'حرج'>('متوسط');
  const [priority, setPriority] = useState<'عادية' | 'عاجلة'>('عاجلة');
  
  // Operational Handoff Options
  const [dispatchMode, setDispatchMode] = useState<'hq_forward' | 'urgent_request'>('hq_forward');
  
  // Vehicle / Property specifics
  const [vehiclePlate, setVehiclePlate] = useState(vehicles[0]?.plateNumber || '7-9281-90');
  const [vehicleModel, setVehicleModel] = useState('هيونداي توسان 2024');
  const [propertyType, setPropertyType] = useState('مبنى سكني / تجاري');
  const [affectedUnits, setAffectedUnits] = useState(1);
  
  // Financial & Insurance
  const [estimatedLoss, setEstimatedLoss] = useState(15000);
  const [policyType, setPolicyType] = useState<'شامل' | 'ضد الغير' | 'حريق وسرقة' | 'ممتلكات شاملة'>('شامل');
  
  const [description, setDescription] = useState('بلاغ وارد من السائق يفيد بوقوع حادث تصادم في المفترق وتضرر المركبة بالجانب الأيمن.');
  const [successMsg, setSuccessMsg] = useState('');
  const [generatedClaimNum, setGeneratedClaimNum] = useState('');
  const [createdIncidentId, setCreatedIncidentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCaseBagModal, setShowCaseBagModal] = useState(false);

  // Additional Third-Party / Witness
  const [parties, setParties] = useState<IncidentParty[]>([
    {
      id: 'pty-init-1',
      partyRole: 'مؤمَّن له',
      fullName: 'خالد أبو سعيد',
      nationalId: '908273641',
      phone: '+970599123456',
      vehiclePlate: '7-9281-90',
      vehicleModel: 'هيونداي توسان',
      injuryStatus: 'لا إصابة',
      statementTaken: true,
      statementSummary: 'أفاد بالاصطدام المفاجئ أثناء الدوران النظامي عند المفترق.'
    }
  ]);

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

  const isVehicleRelated = category === 'حوادث مركبات' || subtype.includes('مركبة');

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
      const res = await fetch('/api/accidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAcc),
      });

      if (res.ok) {
        const saved = await res.json();
        onReportCreated(saved);
        setGeneratedClaimNum(claimNum);
        setCreatedIncidentId(incidentId);

        // Also post movement logs to Cloud SQL & trigger Socket.IO
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn" dir="rtl">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-blue-600/30 border border-blue-400/40 rounded-2xl text-blue-300">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black">بوابة استقبال البلاغات ومركز الاتصال الموحد</h2>
              <p className="text-xs text-blue-200/80">تسجيل البلاغات الأولية، الهيكل الجغرافي الفلسطيني، وتوليد حقيبة التحقيق الرقمية</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-xl text-xs font-bold">
            جاهز للاستقبال
          </span>
        </div>

        {successMsg ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">{successMsg}</h3>
              <p className="text-xs text-emerald-700 font-bold">تم إشعار غرفة العمليات المركزية (HQ) بنجاح عبر Socket.IO</p>
            </div>
            
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-sm mx-auto font-mono text-sm font-black text-blue-900 shadow-sm">
              {generatedClaimNum}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowCaseBagModal(true)}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                <span>فتح حقيبة القضية (Case Bag)</span>
              </button>
              <button
                onClick={() => setShowCaseBagModal(true)}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>مراسلة العمليات</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setSuccessMsg('');
                  setGeneratedClaimNum('');
                  setCreatedIncidentId('');
                }}
                className="text-xs text-slate-500 hover:text-slate-900 underline font-semibold"
              >
                تسجيل بلاغ اتصال جديد
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 text-slate-800 text-xs">
            
            {/* Caller Identity */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>بيانات المتصل / مقدم البلاغ</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">اسم المتصل الكامل</label>
                  <input
                    type="text"
                    required
                    value={callerName}
                    onChange={e => setCallerName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">رقم الجوال للتواصل</label>
                  <input
                    type="text"
                    required
                    value={callerPhone}
                    onChange={e => setCallerPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">رقم الهوية</label>
                  <input
                    type="text"
                    required
                    value={callerNationalId}
                    onChange={e => setCallerNationalId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Hierarchical Incident Category */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>التصنيف الهرمي للحدث ومستوى الخطورة</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">التصنيف الرئيسي (Category)</label>
                  <select
                    value={category}
                    onChange={e => handleCategoryChange(e.target.value as IncidentCategory)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-indigo-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {Object.keys(INCIDENT_TAXONOMY).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">التصنيف الفرعي (Subtype)</label>
                  <select
                    value={subtype}
                    onChange={e => setSubtype(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-blue-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {(INCIDENT_TAXONOMY[category] || []).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">مستوى الخطورة والأولوية</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={severity}
                      onChange={e => setSeverity(e.target.value as any)}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white font-semibold"
                    >
                      <option value="خفيف">خفيف</option>
                      <option value="متوسط">متوسط</option>
                      <option value="بليغ">بليغ</option>
                      <option value="حرج">حرج</option>
                    </select>
                    <select
                      value={priority}
                      onChange={e => setPriority(e.target.value as any)}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white font-semibold"
                    >
                      <option value="عادية">أولوية عادية</option>
                      <option value="عاجلة">أولوية عاجلة</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Palestine Geographic Location Breakdown */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
                <MapPin className="w-4 h-4 text-red-500" />
                <span>الهيكل الجغرافي ونوع التجمع السكاني (فلسطين)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">الإقليم / المنطقة</label>
                  <select
                    value={region}
                    onChange={e => handleRegionChange(e.target.value as PalestineRegion)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-800"
                  >
                    <option value="الضفة الغربية">الضفة الغربية (11 محافظة)</option>
                    <option value="قطاع غزة">قطاع غزة (5 محافظات)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">المحافظة (قائمة مقفلة)</label>
                  <select
                    value={governorate}
                    onChange={e => handleGovernorateChange(e.target.value as PalestineGovernorate)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-blue-800"
                  >
                    {PALESTINE_GOVERNORATES[region].map(gov => (
                      <option key={gov} value={gov}>محافظة {gov}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">نوع التجمع السكاني (Locality Type)</label>
                  <select
                    value={localityType}
                    onChange={e => setLocalityType(e.target.value as PalestineLocalityType)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-800"
                  >
                    <option value="مدينة">مدينة</option>
                    <option value="بلدة">بلدة</option>
                    <option value="قرية">قرية</option>
                    <option value="مخيم لاجئين">مخيم لاجئين (كثافة مرتفعة / عقود استضافة)</option>
                  </select>
                </div>
              </div>

              {localityType === 'مخيم لاجئين' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold block">تنبيه تقييم أضرار المخيمات:</span>
                    <span>المخيمات تتطلب توثيقاً هندسياً ميدانياً دقيقاً للأبنية المتلاصقة وتقدير الأضرار المباشرة نظراً لخصوصية البنية العقارية.</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">اسم المدينة / القرية / المخيم</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="مثال: نابلس، مخيم بلاطة، رام الله..."
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">الحي / المنطقة الفرعية</label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={e => setNeighborhood(e.target.value)}
                    placeholder="مثال: رفيديا، الماصيون، حارة الحشاشين..."
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">الشارع / الطريق</label>
                  <input
                    type="text"
                    value={street}
                    onChange={e => setStreet(e.target.value)}
                    placeholder="مثال: شارع يافا، الشارع العام..."
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">أقرب معلم بارز</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={e => setLandmark(e.target.value)}
                    placeholder="مثال: قرب المستشفى، بجانب المركز..."
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Asset or Vehicle Specifics */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                {isVehicleRelated ? <Car className="w-4 h-4 text-blue-600" /> : <Building className="w-4 h-4 text-amber-600" />}
                <span>{isVehicleRelated ? 'بيانات المركبة والوثيقة' : 'بيانات العقار والممتلكات المتضررة'}</span>
              </h4>

              {isVehicleRelated ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">رقم لوحة المركبة</label>
                    <input
                      type="text"
                      required
                      value={vehiclePlate}
                      onChange={e => setVehiclePlate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-blue-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">طراز ونوع المركبة</label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={e => setVehicleModel(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">نوع التغطية التأمينية</label>
                    <select
                      value={policyType}
                      onChange={e => setPolicyType(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
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
                    <label className="font-semibold text-slate-700 block mb-1">نوع العقار / المنشأة</label>
                    <input
                      type="text"
                      value={propertyType}
                      onChange={e => setPropertyType(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">عدد الوحدات المتضررة</label>
                    <input
                      type="number"
                      min={1}
                      value={affectedUnits}
                      onChange={e => setAffectedUnits(parseInt(e.target.value) || 1)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Description & Financial Estimate */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>ملابسات الحادث والتقدير المالي الأولي</span>
              </h4>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">شرح ملابسات الحادث وأقوال المتصل</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">تقدير الخسائر المالي الأولي (شيكل / ريال)</label>
                  <input
                    type="number"
                    value={estimatedLoss}
                    onChange={e => setEstimatedLoss(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-emerald-800"
                  />
                </div>
              </div>
            </div>

            {/* الإحالة والتواصل التشغيلي (Operational Handoff Section) */}
            <div className="space-y-3 bg-blue-50/60 p-4 rounded-2xl border border-blue-100">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-blue-200 pb-2">
                <Radio className="w-4 h-4 text-blue-600" />
                <span>الإحالة والتواصل التشغيلي</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${dispatchMode === 'hq_forward' ? 'bg-white border-blue-600 shadow-sm' : 'bg-transparent border-blue-200 hover:bg-white/50'}`}>
                  <input 
                    type="radio" 
                    name="dispatchMode" 
                    checked={dispatchMode === 'hq_forward'} 
                    onChange={() => setDispatchMode('hq_forward')}
                    className="mt-1" 
                  />
                  <div>
                    <span className="font-bold block text-slate-900">1. إحالة إلى غرفة العمليات (افتراضي)</span>
                    <span className="text-[11px] text-slate-600">تسجيل البلاغ في Cloud SQL وإرساله فوراً إلى غرفة العمليات (HQ) عبر Socket.IO لصدور تنبيه صوتي Pop-up.</span>
                  </div>
                </label>

                <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${dispatchMode === 'urgent_request' ? 'bg-white border-red-600 shadow-sm' : 'bg-transparent border-blue-200 hover:bg-white/50'}`}>
                  <input 
                    type="radio" 
                    name="dispatchMode" 
                    checked={dispatchMode === 'urgent_request'} 
                    onChange={() => setDispatchMode('urgent_request')}
                    className="mt-1" 
                  />
                  <div>
                    <span className="font-bold block text-slate-900">2. طلب محقق ميداني عاجل</span>
                    <span className="text-[11px] text-slate-600">طلب تدخل ميداني سريع يظهر في غرفة العمليات كحالة طارئة تتطلب التوجيه الرسمي دون اختيار المحقق افتراضياً.</span>
                  </div>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-600 border-t border-blue-200/60">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                  <span>3. مخاطبة غرفة العمليات (متاحة عبر حقيبة القضية وربط موحد بـ incident_id).</span>
                </span>
                <span className="font-bold text-blue-800">التعيين الرسمي للمحقق من HQ فقط لمنع التضارب</span>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-slate-500 text-xs">سيتم فتح حقيبة رقمية وتسجيل حركة إنشاء أوتوماتيكية وإسنادها لغرفة العمليات.</span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
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
        <div className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl h-[85vh] flex flex-col">
            <CaseCommunicationBag
              incidentId={createdIncidentId}
              incidentNumber={generatedClaimNum || '#CLM-2026-000'}
              currentUserName="مركز الاستقبال والاتصال"
              currentUserRole="Reception"
              onClose={() => setShowCaseBagModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

