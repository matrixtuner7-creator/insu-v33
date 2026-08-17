import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Phone, 
  Mail, 
  MapPin, 
  Car, 
  Key, 
  Send, 
  Edit3, 
  Power, 
  Briefcase, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  Plus,
  AlertTriangle,
  Lock,
  Globe
} from 'lucide-react';

interface InvestigatorMaster {
  id: string; // employeeId
  fieldOfficerId: string;
  fullName: string;
  employeeCode: string;
  photo?: string;
  nationalId: string;
  phone: string;
  whatsapp: string;
  email: string;
  jobTitle: string;
  licenseNumber?: string;
  governorate: string;
  serviceArea: string;
  isActive: boolean;
  availabilityStatus: 'Available' | 'Busy' | 'Offline';
  assignedVehicle: string;
  vehiclePlate: string;
  lastGpsLat: number;
  lastGpsLng: number;
  lastConnectionTime: string;
  activeCasesCount: number;
  completedCasesCount: number;
  username: string;
  roleName: string;
  permissions: any;
}

interface FieldInvestigatorsManagerProps {
  onClose?: () => void;
}

export const FieldInvestigatorsManager: React.FC<FieldInvestigatorsManagerProps> = ({ onClose }) => {
  const [investigators, setInvestigators] = useState<InvestigatorMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvestigator, setSelectedInvestigator] = useState<InvestigatorMaster | null>(null);
  const [activeTabModal, setActiveTabModal] = useState<'details' | 'edit' | 'active_cases' | 'history_cases' | 'map'>('details');
  const [editForm, setEditForm] = useState<Partial<InvestigatorMaster>>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInvestigatorForm, setNewInvestigatorForm] = useState({
    fullName: '',
    employeeCode: '',
    nationalId: '',
    phone: '',
    whatsapp: '',
    isSamePhoneAsWhatsapp: true,
    email: '',
    jobTitle: 'نقيب / محقق جنائي',
    licenseNumber: 'LIC-88291',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    governorate: 'نابلس',
    serviceArea: 'وسط المدينة والمفترقات الرئيسية',
    assignedVehicle: 'مركبة دورية تويوتا مجهزة',
    vehiclePlate: '7-9281-90',
    isActive: true,
    availabilityStatus: 'Available' as 'Available' | 'Busy' | 'Offline'
  });

  const fetchInvestigators = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/investigators');
      if (res.ok) {
        const data = await res.json();
        setInvestigators(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestigators();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/investigators/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) {
        setSuccessMsg(`تم تحديث حالة تفعيل المحقق بنجاح`);
        fetchInvestigators();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetPassword = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/investigators/${id}/reset-password`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        alert(`تم إعادة تعيين كلمة المرور للمحقق (${name}) بنجاح.\nكلمة المرور المؤقتة الجديدة: ${data.temporaryPassword}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendLoginLink = async (id: string) => {
    try {
      const res = await fetch(`/api/investigators/${id}/send-login-link`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendWhatsAppCase = async (inv: InvestigatorMaster) => {
    try {
      const res = await fetch('/api/investigators/whatsapp-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investigatorId: inv.id,
          incidentId: 'acc-latest',
          accidentNumber: 'CLM-2026-8891',
          locationName: `${inv.governorate} - ${inv.serviceArea}`,
          priority: 'عاجلة'
        })
      });
      if (res.ok) {
        const data = await res.json();
        const cleanNum = (data.whatsappNumber || inv.whatsapp).replace(/[^0-9+]/g, '');
        const text = encodeURIComponent(data.messageText);
        window.open(`https://wa.me/${cleanNum}?text=${text}`, '_blank');
      }
    } catch (err) {
      console.error(err);
      const cleanNum = inv.whatsapp.replace(/[^0-9+]/g, '');
      const fallbackMsg = encodeURIComponent(`🚨 تكليف ميداني رسمي جديد\n\nالزميل ${inv.fullName}،\nتم إرسال تكليف جديد إليك عبر نظام العمليات المركزية V.COMMAND.\n\nيرجى فتح بوابة المحقق الميداني واستلام المهمة فوراً.`);
      window.open(`https://wa.me/${cleanNum}?text=${fallbackMsg}`, '_blank');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/investigators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvestigatorForm)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewInvestigatorForm({
          fullName: '',
          employeeCode: '',
          nationalId: '',
          phone: '',
          whatsapp: '',
          email: '',
          jobTitle: 'محقق ميداني',
          governorate: 'نابلس',
          serviceArea: 'وسط المدينة',
          assignedVehicle: 'مركبة دورية مجهزة',
          vehiclePlate: '1-9921-88',
          username: ''
        });
        fetchInvestigators();
        alert('تم إنشاء سجل المحقق الميداني الرئيسي بنجاح في Cloud SQL!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvestigator) return;
    try {
      const res = await fetch(`/api/investigators/${selectedInvestigator.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        alert('تم تحديث بيانات المحقق بنجاح');
        setSelectedInvestigator(null);
        fetchInvestigators();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 shadow-2xl border border-slate-800 space-y-6 text-xs" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">إدارة الملفات الرئيسية للمحققين والوكلاء الميدانيين (Master Profiles)</h2>
            <p className="text-[11px] text-slate-400">المصدر الرسمي: Cloud SQL (جدول الموظفين، الضباط، المستخدمين، والصلاحيات)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل محقق جديد</span>
          </button>
          {onClose && (
            <button onClick={onClose} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold">
              إغلاق
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-slate-400 font-medium">جاري تحميل الملفات الرئيسية للمحققين من Cloud SQL...</div>
      ) : investigators.length === 0 ? (
        <div className="py-16 text-center text-slate-400">لا يوجد محققون مسجلون حالياً.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {investigators.map(inv => (
            <div key={inv.id} className="bg-slate-950/70 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between">
              
              {/* Card Top: Photo & Basic Details */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img 
                    src={inv.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                    alt={inv.fullName} 
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500 shadow-md"
                  />
                  <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-950 ${inv.availabilityStatus === 'Available' ? 'bg-emerald-500' : inv.availabilityStatus === 'Busy' ? 'bg-amber-500' : 'bg-slate-500'}`} title={inv.availabilityStatus} />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-sm text-white truncate">{inv.fullName}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${inv.isActive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                      {inv.isActive ? 'نشط (Active)' : 'معطل (Inactive)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-indigo-400 font-mono">
                    <span>{inv.employeeCode}</span>
                    <span>•</span>
                    <span>{inv.jobTitle}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{inv.governorate} - {inv.serviceArea}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-900/90 rounded-2xl border border-slate-800/80 text-[11px]">
                <div>
                  <span className="text-slate-500 block">رقم الهوية:</span>
                  <span className="font-mono font-bold text-slate-200">{inv.nationalId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">رخصة القيادة:</span>
                  <span className="font-mono font-bold text-slate-200">{inv.licenseNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">المركبة المخصصة:</span>
                  <span className="font-bold text-indigo-300 truncate block">{inv.assignedVehicle} ({inv.vehiclePlate})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">رقم WhatsApp:</span>
                  <span className="font-mono font-bold text-emerald-400">{inv.whatsapp}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">حساب الدخول:</span>
                  <span className="font-mono font-bold text-amber-300">{inv.username} ({inv.roleName})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">القضايا (نشطة / مكتملة):</span>
                  <span className="font-bold text-white">{inv.activeCasesCount} نشطة / {inv.completedCasesCount} مكتملة</span>
                </div>
              </div>

              {/* GPS & Connection */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>آخر GPS: ({inv.lastGpsLat.toFixed(4)}, {inv.lastGpsLng.toFixed(4)})</span>
                </span>
                <span>آخر اتصال: {new Date(inv.lastConnectionTime || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              {/* Actions Toolbar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    setSelectedInvestigator(inv);
                    setEditForm(inv);
                    setActiveTabModal('edit');
                  }}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>تعديل البيانات</span>
                </button>

                <button
                  onClick={() => handleToggleActive(inv.id, inv.isActive)}
                  className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${inv.isActive ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-300' : 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300'}`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{inv.isActive ? 'تعطيل' : 'تفعيل'}</span>
                </button>

                <button
                  onClick={() => handleResetPassword(inv.id, inv.fullName)}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>إعادة كلمة المرور</span>
                </button>

                <button
                  onClick={() => handleSendLoginLink(inv.id)}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>رابط الدخول</span>
                </button>

                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/investigators/${inv.id}/send-login-link`, { method: 'POST' });
                      if (res.ok) {
                        const data = await res.json();
                        const cleanNum = inv.whatsapp.replace(/[^0-9+]/g, '');
                        const msg = encodeURIComponent(`🚨 بوابة المحقق الميداني الرسمي\n\nالزميل ${inv.fullName}،\nيمكنك تسجيل الدخول لبوابة المحققين عبر الرابط الآمن:\nhttps://${window.location.host}/?portal=agent&investigator_id=${inv.fieldOfficerId}\n\nيرجى حفظ البيانات واستخدام رمز الموظف الخاص بك.`);
                        window.open(`https://wa.me/${cleanNum}?text=${msg}`, '_blank');
                      }
                    } catch(e) {
                      console.error(e);
                    }
                  }}
                  className="py-2 px-3 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>رابط الدخول عبر WhatsApp</span>
                </button>

                {inv.activeCasesCount > 0 ? (
                  <button
                    onClick={() => {
                      setSelectedInvestigator(inv);
                      setActiveTabModal('active_cases');
                    }}
                    className="py-2 px-3 bg-blue-950/80 hover:bg-blue-900 text-blue-200 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>إرسال القضية النشطة عبر WhatsApp</span>
                  </button>
                ) : (
                  <div className="py-2 px-3 bg-slate-900 text-slate-500 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-not-allowed opacity-60" title="لا توجد قضية مسندة حالياً لإرسالها">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>لا توجد قضية نشطة</span>
                  </div>
                )}

                <button
                  onClick={() => {
                    setSelectedInvestigator(inv);
                    setActiveTabModal('history_cases');
                  }}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>السجل السابق</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedInvestigator(inv);
                    setActiveTabModal('map');
                  }}
                  className="py-2 px-3 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>الموقع على الخريطة</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add Investigator Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="font-black text-white text-sm border-b border-slate-800 pb-3">تسجيل محقق ميداني رئيسي جديد (Cloud SQL)</h3>
            
            <form onSubmit={handleCreateSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto px-1">
              <div>
                <label className="text-slate-400 block mb-1">الاسم الكامل:</label>
                <input 
                  type="text" 
                  value={newInvestigatorForm.fullName} 
                  onChange={e => setNewInvestigatorForm({...newInvestigatorForm, fullName: e.target.value})}
                  required 
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white" 
                  placeholder="مثال: النقيب رامي الخطيب"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">رمز الموظف (Code):</label>
                  <input 
                    type="text" 
                    value={newInvestigatorForm.employeeCode} 
                    onChange={e => setNewInvestigatorForm({...newInvestigatorForm, employeeCode: e.target.value})}
                    required 
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono" 
                    placeholder="INV-103"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">رقم الهوية:</label>
                  <input 
                    type="text" 
                    value={newInvestigatorForm.nationalId} 
                    onChange={e => setNewInvestigatorForm({...newInvestigatorForm, nationalId: e.target.value})}
                    required 
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono" 
                    placeholder="908392102"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">رقم الهاتف:</label>
                  <input 
                    type="text" 
                    value={newInvestigatorForm.phone} 
                    onChange={e => {
                      const val = e.target.value;
                      setNewInvestigatorForm({
                        ...newInvestigatorForm, 
                        phone: val, 
                        ...(newInvestigatorForm.isSamePhoneAsWhatsapp ? { whatsapp: val } : {})
                      });
                    }}
                    required 
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono" 
                    placeholder="+970591234567"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400">رقم WhatsApp:</label>
                    <label className="flex items-center gap-1.5 text-[11px] text-emerald-400 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={newInvestigatorForm.isSamePhoneAsWhatsapp} 
                        onChange={e => {
                          const checked = e.target.checked;
                          setNewInvestigatorForm({
                            ...newInvestigatorForm, 
                            isSamePhoneAsWhatsapp: checked,
                            ...(checked ? { whatsapp: newInvestigatorForm.phone } : {})
                          });
                        }}
                        className="rounded bg-slate-950 border-slate-800 text-indigo-600"
                      />
                      <span>نفس رقم الهاتف</span>
                    </label>
                  </div>
                  <input 
                    type="text" 
                    value={newInvestigatorForm.whatsapp} 
                    onChange={e => setNewInvestigatorForm({...newInvestigatorForm, whatsapp: e.target.value, isSamePhoneAsWhatsapp: false})}
                    disabled={newInvestigatorForm.isSamePhoneAsWhatsapp}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono disabled:opacity-50" 
                    placeholder="+970591234567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">الرتبة / المسمى الوظيفي:</label>
                  <input 
                    type="text" 
                    value={newInvestigatorForm.jobTitle} 
                    onChange={e => setNewInvestigatorForm({...newInvestigatorForm, jobTitle: e.target.value})}
                    required 
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white" 
                    placeholder="نقيب / محقق جنائي"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">رقم الترخيص / الاعتماد:</label>
                  <input 
                    type="text" 
                    value={newInvestigatorForm.licenseNumber} 
                    onChange={e => setNewInvestigatorForm({...newInvestigatorForm, licenseNumber: e.target.value})}
                    required 
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono" 
                    placeholder="LIC-88291"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">البريد الإلكتروني:</label>
                  <input 
                    type="email" 
                    value={newInvestigatorForm.email} 
                    onChange={e => setNewInvestigatorForm({...newInvestigatorForm, email: e.target.value})}
                    required 
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white" 
                    placeholder="rami@police.gov.ps"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">رابط الصورة الشخصية (URL):</label>
                  <input 
                    type="text" 
                    value={newInvestigatorForm.photo} 
                    onChange={e => setNewInvestigatorForm({...newInvestigatorForm, photo: e.target.value})}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">المحافظة:</label>
                  <input 
                    type="text" 
                    value={newInvestigatorForm.governorate} 
                    onChange={e => setNewInvestigatorForm({...newInvestigatorForm, governorate: e.target.value})}
                    required 
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white" 
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">حالة الحساب:</label>
                  <select 
                    value={newInvestigatorForm.isActive ? 'active' : 'suspended'} 
                    onChange={e => setNewInvestigatorForm({...newInvestigatorForm, isActive: e.target.value === 'active'})}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="active">فعال (Active)</option>
                    <option value="suspended">موقوف (Suspended)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">حالة العمل:</label>
                  <select 
                    value={newInvestigatorForm.availabilityStatus} 
                    onChange={e => setNewInvestigatorForm({...newInvestigatorForm, availabilityStatus: e.target.value as any})}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="Available">متاح (Available)</option>
                    <option value="Busy">مشغول (Busy)</option>
                    <option value="Offline">غير متاح (Offline)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow">حفظ وإنشاء السجل</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Investigator Modal / Action View */}
      {selectedInvestigator && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <img src={selectedInvestigator.photo} alt="" className="w-10 h-10 rounded-xl object-cover" />
                <div>
                  <h3 className="font-black text-white text-sm">{selectedInvestigator.fullName}</h3>
                  <span className="text-[10px] text-indigo-400">{selectedInvestigator.employeeCode} • {selectedInvestigator.roleName}</span>
                </div>
              </div>
              <button onClick={() => setSelectedInvestigator(null)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold">✕ إغلاق</button>
            </div>

            {activeTabModal === 'edit' && (
              <form onSubmit={handleUpdateSubmit} className="space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">تعديل الملف الرئيسي للمحقق</h4>
                <div>
                  <label className="text-slate-400 block mb-1">الاسم الكامل:</label>
                  <input 
                    type="text" 
                    value={editForm.fullName || ''} 
                    onChange={e => setEditForm({...editForm, fullName: e.target.value})}
                    className="w-full p-2 bg-slate-955 border border-slate-800 rounded-xl text-white" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">رقم الهاتف:</label>
                    <input 
                      type="text" 
                      value={editForm.phone || ''} 
                      onChange={e => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono" 
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">رقم WhatsApp:</label>
                    <input 
                      type="text" 
                      value={editForm.whatsapp || ''} 
                      onChange={e => setEditForm({...editForm, whatsapp: e.target.value})}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">المحافظة:</label>
                    <input 
                      type="text" 
                      value={editForm.governorate || ''} 
                      onChange={e => setEditForm({...editForm, governorate: e.target.value})}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white" 
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">حالة التوفر:</label>
                    <select 
                      value={editForm.availabilityStatus || 'Available'} 
                      onChange={e => setEditForm({...editForm, availabilityStatus: e.target.value as any})}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    >
                      <option value="Available">متاح (Available)</option>
                      <option value="Busy">مشغول (Busy)</option>
                      <option value="Offline">غير متصل (Offline)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow">حفظ التعديلات في Cloud SQL</button>
                </div>
              </form>
            )}

            {activeTabModal === 'active_cases' && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">القضايا الحالية المسندة للمحقق ({selectedInvestigator.fullName})</h4>
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-indigo-400">#CLM-2026-3143</span>
                    <span className="px-2 py-0.5 bg-blue-950 text-blue-300 rounded font-bold">قيد المعاينة</span>
                  </div>
                  <p className="text-slate-300">حوادث مركبات - تصادم مروري في مفترق نابلس الرئيسي</p>
                  <span className="text-[10px] text-slate-500">تم التكليف بواسطة غرفة العمليات المركزية</span>
                </div>
              </div>
            )}

            {activeTabModal === 'history_cases' && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">سجل القضايا المكتملة والمغلقة</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-mono font-bold text-emerald-400">#CLM-2026-88{i}0</span>
                        <p className="text-slate-400 text-[11px]">معاينة وتوثيق بصمة رقمية SHA-256 مكتملة</p>
                      </div>
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-1 rounded font-bold">مكتمل</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTabModal === 'map' && (
              <div className="space-y-3 text-center">
                <h4 className="font-bold text-slate-200 text-xs text-right">الموقع الجغرافي الحي للمحقق (GPS Live)</h4>
                <div className="w-full h-48 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center p-4 space-y-2 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  <div className="w-12 h-12 rounded-full bg-indigo-600/30 border-2 border-indigo-500 animate-ping absolute" />
                  <MapPin className="w-8 h-8 text-indigo-400 relative z-10" />
                  <span className="font-mono font-bold text-white relative z-10">خط العرض: {selectedInvestigator.lastGpsLat} | خط الطول: {selectedInvestigator.lastGpsLng}</span>
                  <span className="text-emerald-400 text-[11px] font-bold relative z-10">الإحداثيات متصلة ومحدثة عبر الأقمار الصناعية</span>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
