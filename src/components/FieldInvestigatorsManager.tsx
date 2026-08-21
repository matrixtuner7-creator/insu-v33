import React, { useState, useEffect, useRef } from 'react';
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
  Globe,
  Trash2,
  Camera,
  Upload
} from 'lucide-react';
import { getPublicShareUrl } from '../lib/shareUtils';

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
  password?: string;
  requireLogin?: boolean;
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
  const [activeTabModal, setActiveTabModal] = useState<'details' | 'edit' | 'active_cases' | 'history_cases' | 'map' | 'credentials'>('details');
  const [editForm, setEditForm] = useState<Partial<InvestigatorMaster>>({});
  const [credForm, setCredForm] = useState<{ username: string; password: string; requireLogin: boolean }>({
    username: '',
    password: '',
    requireLogin: false
  });
  const [showPassword, setShowPassword] = useState(false);
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

  // Camera capture and file reading states
  const [addCameraActive, setAddCameraActive] = useState(false);
  const [addStream, setAddStream] = useState<MediaStream | null>(null);
  const addVideoRef = useRef<HTMLVideoElement | null>(null);

  const [editCameraActive, setEditCameraActive] = useState(false);
  const [editStream, setEditStream] = useState<MediaStream | null>(null);
  const editVideoRef = useRef<HTMLVideoElement | null>(null);

  const startAddCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setAddStream(stream);
      setAddCameraActive(true);
      setTimeout(() => {
        if (addVideoRef.current) addVideoRef.current.srcObject = stream;
      }, 100);
    } catch (e) {
      alert('عذراً، لا يمكن الوصول إلى الكاميرا. يرجى التحقق من الصلاحيات.');
    }
  };

  const captureAddPhoto = () => {
    if (addVideoRef.current && addStream) {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(addVideoRef.current, 0, 0, 300, 300);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setNewInvestigatorForm(prev => ({ ...prev, photo: dataUrl }));
      }
      stopAddCamera();
    }
  };

  const stopAddCamera = () => {
    if (addStream) {
      addStream.getTracks().forEach(track => track.stop());
      setAddStream(null);
    }
    setAddCameraActive(false);
  };

  const startEditCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setEditStream(stream);
      setEditCameraActive(true);
      setTimeout(() => {
        if (editVideoRef.current) editVideoRef.current.srcObject = stream;
      }, 100);
    } catch (e) {
      alert('عذراً، لا يمكن الوصول إلى الكاميرا. يرجى التحقق من الصلاحيات.');
    }
  };

  const captureEditPhoto = () => {
    if (editVideoRef.current && editStream) {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(editVideoRef.current, 0, 0, 300, 300);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setEditForm(prev => ({ ...prev, photo: dataUrl }));
      }
      stopEditCamera();
    }
  };

  const stopEditCamera = () => {
    if (editStream) {
      editStream.getTracks().forEach(track => track.stop());
      setEditStream(null);
    }
    setEditCameraActive(false);
  };

  const handleAddPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewInvestigatorForm(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Clean up streams on unmount
  useEffect(() => {
    return () => {
      if (addStream) addStream.getTracks().forEach(track => track.stop());
      if (editStream) editStream.getTracks().forEach(track => track.stop());
    };
  }, [addStream, editStream]);

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

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvestigator) return;
    try {
      const res = await fetch(`/api/investigators/${selectedInvestigator.id}/credentials`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credForm)
      });
      if (res.ok) {
        setSuccessMsg(`تم تثبيت بيانات تسجيل الدخول للمحقق (${selectedInvestigator.fullName}) بنجاح.`);
        fetchInvestigators();
        setSelectedInvestigator(null);
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

  const handleDeleteInvestigator = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذا المحقق بشكل نهائي؟ لا يمكن التراجع عن هذه العملية.")) return;
    try {
      const res = await fetch(`/api/investigators/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setInvestigators(prev => prev.filter(inv => inv.id !== id));
        setSuccessMsg('تم حذف المحقق بنجاح');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const errData = await res.json();
        alert(errData.error || "فشل حذف المحقق");
      }
    } catch (err) {
      console.error("Error deleting investigator", err);
      alert("حدث خطأ أثناء الحذف");
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
    <div className="bg-[#2A323A] text-[#F1F5F9] rounded-3xl p-6 shadow-2xl border border-[#3A434C] space-y-6 text-xs" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#3A434C] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#315EF5] text-white flex items-center justify-center font-black shadow-lg shadow-black/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-[#F1F5F9]">إدارة الملفات الرئيسية للمحققين والوكلاء الميدانيين (Master Profiles)</h2>
            <p className="text-[11px] text-[#AAB2BA]">المصدر الرسمي: Cloud SQL (جدول الموظفين، الضباط، المستخدمين، والصلاحيات)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#315EF5] hover:bg-[#2549d4] text-white rounded-xl font-bold transition-all shadow flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل محقق جديد</span>
          </button>
          {onClose && (
            <button onClick={onClose} className="px-4 py-2.5 bg-[#323A40] hover:bg-[#3A434C] text-[#AAB2BA] hover:text-white border border-[#3A434C] rounded-xl font-bold cursor-pointer">
              إغلاق
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-[#22A06B]/15 border border-[#22A06B]/30 text-[#22A06B] rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-[#AAB2BA] font-medium">جاري تحميل الملفات الرئيسية للمحققين من Cloud SQL...</div>
      ) : investigators.length === 0 ? (
        <div className="py-16 text-center text-[#AAB2BA]">لا يوجد محققون مسجلون حالياً.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {investigators.map(inv => (
            <div key={inv.id} className="bg-[#323A40] border border-[#3A434C] rounded-3xl p-5 space-y-4 shadow-xl hover:border-[#315EF5]/50 transition-all flex flex-col justify-between">
              
              {/* Card Top: Photo & Basic Details */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img 
                    src={inv.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                    alt={inv.fullName} 
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#315EF5] shadow-md"
                  />
                  <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#161B1F] ${inv.availabilityStatus === 'Available' ? 'bg-[#22A06B]' : inv.availabilityStatus === 'Busy' ? 'bg-[#D6A83A]' : 'bg-[#7C8791]'}`} title={inv.availabilityStatus} />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-sm text-[#F1F5F9] truncate">{inv.fullName}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${inv.isActive ? 'bg-[#22A06B]/20 text-[#22A06B] border border-[#22A06B]/30' : 'bg-[#D64545]/20 text-[#D64545] border border-[#D64545]/30'}`}>
                      {inv.isActive ? 'نشط (Active)' : 'معطل (Inactive)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[#315EF5] font-mono">
                    <span>{inv.employeeCode}</span>
                    <span>•</span>
                    <span>{inv.jobTitle}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-[#AAB2BA] pt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#315EF5]" />
                      <span>{inv.governorate} - {inv.serviceArea}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-[#161B1F] rounded-2xl border border-[#3A434C] text-[11px]">
                <div>
                  <span className="text-[#7C8791] block">رقم الهوية:</span>
                  <span className="font-mono font-bold text-[#F1F5F9]">{inv.nationalId}</span>
                </div>
                <div>
                  <span className="text-[#7C8791] block">رخصة القيادة:</span>
                  <span className="font-mono font-bold text-[#F1F5F9]">{inv.licenseNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#7C8791] block">المركبة المخصصة:</span>
                  <span className="font-bold text-[#315EF5] truncate block">{inv.assignedVehicle} ({inv.vehiclePlate})</span>
                </div>
                <div>
                  <span className="text-[#7C8791] block">رقم WhatsApp:</span>
                  <span className="font-mono font-bold text-[#22A06B]">{inv.whatsapp}</span>
                </div>
                <div>
                  <span className="text-[#7C8791] block">حساب الدخول:</span>
                  <span className="font-mono font-bold text-[#D6A83A]">{inv.username} ({inv.roleName})</span>
                </div>
                <div>
                  <span className="text-[#7C8791] block">شاشة الدخول:</span>
                  {inv.requireLogin ? (
                    <span className="font-bold text-cyan-400 text-[10px] flex items-center gap-1">
                      <Lock className="w-3 h-3 text-cyan-400" />
                      <span>إلزامي بكلمة مرور</span>
                    </span>
                  ) : (
                    <span className="font-bold text-emerald-400 text-[10px] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>فتح مباشر (تلقائي)</span>
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-[#7C8791] block">القضايا (نشطة / مكتملة):</span>
                  <span className="font-bold text-[#F1F5F9]">{inv.activeCasesCount} نشطة / {inv.completedCasesCount} مكتملة</span>
                </div>
              </div>

              {/* GPS & Connection */}
              <div className="flex items-center justify-between text-[10px] text-[#AAB2BA] px-1">
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-[#22A06B]" />
                  <span>آخر GPS: ({inv.lastGpsLat.toFixed(4)}, {inv.lastGpsLng.toFixed(4)})</span>
                </span>
                <span>آخر اتصال: {new Date(inv.lastConnectionTime || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              {/* Actions Toolbar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#3A434C]">
                <button
                  onClick={() => {
                    setSelectedInvestigator(inv);
                    setCredForm({
                      username: inv.username || inv.employeeCode || `inv.${inv.id}`,
                      password: inv.password || '123456',
                      requireLogin: inv.requireLogin ?? false
                    });
                    setActiveTabModal('credentials');
                  }}
                  className="py-2 px-3 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-400 border border-cyan-500/40 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  <span>بيانات الدخول والتفعيل</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedInvestigator(inv);
                    setEditForm(inv);
                    setActiveTabModal('edit');
                  }}
                  className="py-2 px-3 bg-[#2A323A] hover:bg-[#323A40] text-[#F1F5F9] border border-[#3A434C] rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#315EF5]" />
                  <span>تعديل البيانات</span>
                </button>

                <button
                  onClick={() => handleToggleActive(inv.id, inv.isActive)}
                  className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${inv.isActive ? 'bg-[#D64545]/20 hover:bg-[#D64545]/30 text-[#D64545] border border-[#D64545]/30' : 'bg-[#22A06B]/20 hover:bg-[#22A06B]/30 text-[#22A06B] border border-[#22A06B]/30'}`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{inv.isActive ? 'تعطيل' : 'تفعيل'}</span>
                </button>

                <button
                  onClick={() => handleResetPassword(inv.id, inv.fullName)}
                  className="py-2 px-3 bg-[#2A323A] hover:bg-[#323A40] text-[#D6A83A] border border-[#3A434C] rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>إعادة كلمة المرور</span>
                </button>

                <button
                  onClick={() => handleSendLoginLink(inv.id)}
                  className="py-2 px-3 bg-[#2A323A] hover:bg-[#323A40] text-[#315EF5] border border-[#3A434C] rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>رابط الدخول</span>
                </button>

                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/investigators/${inv.id}/send-login-link`, { method: 'POST' });
                      if (res.ok) {
                        const cleanNum = inv.whatsapp.replace(/[^0-9+]/g, '');
                        const agentLoginUrl = getPublicShareUrl({
                          portal: 'agent',
                          investigator_id: inv.fieldOfficerId
                        });
                        const msg = encodeURIComponent(`🚨 بوابة المحقق الميداني الرسمي\n\nالزميل ${inv.fullName}،\nيمكنك تسجيل الدخول لبوابة المحققين عبر الرابط الآمن:\n${agentLoginUrl}\n\nيرجى حفظ البيانات واستخدام رمز الموظف الخاص بك.`);
                        window.open(`https://wa.me/${cleanNum}?text=${msg}`, '_blank');
                      }
                    } catch(e) {
                      console.error(e);
                    }
                  }}
                  className="py-2 px-3 bg-[#22A06B]/20 hover:bg-[#22A06B]/30 text-[#22A06B] border border-[#22A06B]/30 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
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
                    className="py-2 px-3 bg-[#315EF5]/20 hover:bg-[#315EF5]/30 text-[#315EF5] border border-[#315EF5]/30 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>إرسال القضية النشطة عبر WhatsApp</span>
                  </button>
                ) : (
                  <div className="py-2 px-3 bg-[#161B1F] text-[#7C8791] rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-not-allowed opacity-60 border border-[#3A434C]" title="لا توجد قضية مسندة حالياً لإرسالها">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>لا توجد قضية نشطة</span>
                  </div>
                )}

                <button
                  onClick={() => {
                    setSelectedInvestigator(inv);
                    setActiveTabModal('history_cases');
                  }}
                  className="py-2 px-3 bg-[#2A323A] hover:bg-[#323A40] text-[#AAB2BA] hover:text-[#F1F5F9] border border-[#3A434C] rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>السجل السابق</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedInvestigator(inv);
                    setActiveTabModal('map');
                  }}
                  className="py-2 px-3 bg-[#315EF5]/20 hover:bg-[#315EF5]/30 text-[#315EF5] border border-[#315EF5]/30 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>الموقع على الخريطة</span>
                </button>
                <button
                  onClick={() => handleDeleteInvestigator(inv.id)}
                  className="py-2 px-3 bg-[#D64545]/10 hover:bg-[#D64545]/20 text-[#D64545] border border-[#D64545]/20 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف المحقق</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add Investigator Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#2A323A] border border-[#3A434C] rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl text-[#F1F5F9]">
            <h3 className="font-black text-[#F1F5F9] text-sm border-b border-[#3A434C] pb-3">تسجيل محقق ميداني رئيسي جديد (Cloud SQL)</h3>
            
            <form onSubmit={handleCreateSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto px-1">
              <div>
                <label className="text-[#AAB2BA] block mb-1">الاسم الكامل:</label>
                <input 
                  type="text" 
                  value={newInvestigatorForm.fullName} 
                  onChange={e => setNewInvestigatorForm({...newInvestigatorForm, fullName: e.target.value})}
                  required 
                  className="w-full p-2.5 bg-[#323A40] border border-[#3A434C] rounded-xl text-[#F1F5F9] placeholder-[#7C8791] focus:outline-none focus:ring-2 focus:ring-[#315EF5]" 
                  placeholder="مثال: النقيب رامي الخطيب"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#AAB2BA] block mb-1">رمز الموظف (Code):</label>
                  <input 
                    type="text" 
                    value={newInvestigatorForm.employeeCode} 
                    onChange={e => setNewInvestigatorForm({...newInvestigatorForm, employeeCode: e.target.value})}
                    required 
                    className="w-full p-2.5 bg-[#323A40] border border-[#3A434C] rounded-xl text-[#F1F5F9] placeholder-[#7C8791] font-mono focus:outline-none focus:ring-2 focus:ring-[#315EF5]" 
                    placeholder="INV-103"
                  />
                </div>
                <div>
                  <label className="text-[#AAB2BA] block mb-1">رقم الهوية:</label>
                  <input 
                    type="text" 
                    value={newInvestigatorForm.nationalId} 
                    onChange={e => setNewInvestigatorForm({...newInvestigatorForm, nationalId: e.target.value})}
                    required 
                    className="w-full p-2.5 bg-[#323A40] border border-[#3A434C] rounded-xl text-[#F1F5F9] placeholder-[#7C8791] font-mono focus:outline-none focus:ring-2 focus:ring-[#315EF5]" 
                    placeholder="908392102"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#AAB2BA] block mb-1">رقم الهاتف:</label>
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
                    className="w-full p-2.5 bg-[#323A40] border border-[#3A434C] rounded-xl text-[#F1F5F9] placeholder-[#7C8791] font-mono focus:outline-none focus:ring-2 focus:ring-[#315EF5]" 
                    placeholder="+970591234567"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[#AAB2BA]">رقم WhatsApp:</label>
                    <label className="flex items-center gap-1.5 text-[11px] text-[#22A06B] cursor-pointer">
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
                        className="rounded bg-[#323A40] border-[#3A434C] text-[#315EF5]"
                      />
                      <span>نفس رقم الهاتف</span>
                    </label>
                  </div>
                  <input 
                    type="text" 
                    value={newInvestigatorForm.whatsapp} 
                    onChange={e => setNewInvestigatorForm({...newInvestigatorForm, whatsapp: e.target.value, isSamePhoneAsWhatsapp: false})}
                    disabled={newInvestigatorForm.isSamePhoneAsWhatsapp}
                    className="w-full p-2.5 bg-[#323A40] border border-[#3A434C] rounded-xl text-[#F1F5F9] font-mono disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#315EF5]" 
                    placeholder="+970591234567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#AAB2BA] block mb-1">الرتبة / المسمى الوظيفي:</label>
                  <input 
                    type="text" 
                    value={newInvestigatorForm.jobTitle} 
                    onChange={e => setNewInvestigatorForm({...newInvestigatorForm, jobTitle: e.target.value})}
                    required 
                    className="w-full p-2.5 bg-[#323A40] border border-[#3A434C] rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#315EF5]" 
                    placeholder="نقيب / محقق جنائي"
                  />
                </div>
                <div>
                  <label className="text-[#AAB2BA] block mb-1">رقم الترخيص / الاعتماد:</label>
                  <input 
                    type="text" 
                    value={newInvestigatorForm.licenseNumber} 
                    onChange={e => setNewInvestigatorForm({...newInvestigatorForm, licenseNumber: e.target.value})}
                    required 
                    className="w-full p-2.5 bg-[#323A40] border border-[#3A434C] rounded-xl text-[#F1F5F9] font-mono focus:outline-none focus:ring-2 focus:ring-[#315EF5]" 
                    placeholder="LIC-88291"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-[#1e252b]/50 p-3 rounded-2xl border border-[#3a434c]/50">
                <div>
                  <label className="text-[#AAB2BA] block mb-1">البريد الإلكتروني <span className="text-[10px] text-slate-400">(اختياري - يمكن تجاوزه)</span>:</label>
                  <input 
                    type="email" 
                    value={newInvestigatorForm.email} 
                    onChange={e => setNewInvestigatorForm({...newInvestigatorForm, email: e.target.value})}
                    className="w-full p-2.5 bg-[#323A40] border border-[#3A434C] rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#315EF5]" 
                    placeholder="rami@police.gov.ps"
                  />
                </div>
                <div>
                  <label className="text-[#AAB2BA] block mb-1">الصورة الشخصية:</label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#323A40] border border-[#3A434C] overflow-hidden shrink-0 flex items-center justify-center">
                      {newInvestigatorForm.photo ? (
                        <img src={newInvestigatorForm.photo} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-slate-500">لا توجد</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                      <div className="flex gap-1.5">
                        <label className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-[10px] font-bold cursor-pointer transition-colors">
                          <Upload className="w-3 h-3" />
                          <span>جهازك</span>
                          <input type="file" accept="image/*" onChange={handleAddPhotoUpload} className="hidden" />
                        </label>
                        <button
                          type="button"
                          onClick={addCameraActive ? stopAddCamera : startAddCamera}
                          className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          <Camera className="w-3 h-3" />
                          <span>{addCameraActive ? 'إلغاء' : 'كاميرا'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {addCameraActive && (
                    <div className="mt-2 p-2 bg-[#1e252b] border border-[#3A434C] rounded-xl flex flex-col items-center gap-2">
                      <video ref={addVideoRef} autoPlay playsInline className="w-full max-w-[180px] h-[135px] object-cover rounded-lg border border-[#3A434C] scale-x-[-1]" />
                      <button
                        type="button"
                        onClick={captureAddPhoto}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold"
                      >
                        التقاط الصورة
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[#AAB2BA] block mb-1">المحافظة:</label>
                  <input 
                    type="text" 
                    value={newInvestigatorForm.governorate} 
                    onChange={e => setNewInvestigatorForm({...newInvestigatorForm, governorate: e.target.value})}
                    required 
                    className="w-full p-2.5 bg-[#323A40] border border-[#3A434C] rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#315EF5]" 
                  />
                </div>
                <div>
                  <label className="text-[#AAB2BA] block mb-1">حالة الحساب:</label>
                  <select 
                    value={newInvestigatorForm.isActive ? 'active' : 'suspended'} 
                    onChange={e => setNewInvestigatorForm({...newInvestigatorForm, isActive: e.target.value === 'active'})}
                    className="w-full p-2.5 bg-[#323A40] border border-[#3A434C] rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#315EF5]"
                  >
                    <option value="active">فعال (Active)</option>
                    <option value="suspended">موقوف (Suspended)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#AAB2BA] block mb-1">حالة العمل:</label>
                  <select 
                    value={newInvestigatorForm.availabilityStatus} 
                    onChange={e => setNewInvestigatorForm({...newInvestigatorForm, availabilityStatus: e.target.value as any})}
                    className="w-full p-2.5 bg-[#323A40] border border-[#3A434C] rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#315EF5]"
                  >
                    <option value="Available">متاح (Available)</option>
                    <option value="Busy">مشغول (Busy)</option>
                    <option value="Offline">غير متاح (Offline)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#3A434C]">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-[#323A40] hover:bg-[#3A434C] text-[#AAB2BA] rounded-xl font-bold cursor-pointer">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-[#315EF5] hover:bg-[#2549d4] text-white rounded-xl font-bold shadow cursor-pointer">حفظ وإنشاء السجل</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Investigator Modal / Action View */}
      {selectedInvestigator && (
        <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#2A323A] border border-[#3A434C] rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto text-[#F1F5F9]">
            
            <div className="flex items-center justify-between border-b border-[#3A434C] pb-3">
              <div className="flex items-center gap-3">
                <img src={selectedInvestigator.photo} alt="" className="w-10 h-10 rounded-xl object-cover border border-[#3A434C]" />
                <div>
                  <h3 className="font-black text-[#F1F5F9] text-sm">{selectedInvestigator.fullName}</h3>
                  <span className="text-[10px] text-[#315EF5]">{selectedInvestigator.employeeCode} • {selectedInvestigator.roleName}</span>
                </div>
              </div>
              <button onClick={() => setSelectedInvestigator(null)} className="px-3 py-1 bg-[#323A40] hover:bg-[#3A434C] text-[#AAB2BA] hover:text-[#F1F5F9] rounded-xl font-bold cursor-pointer">✕ إغلاق</button>
            </div>

            {activeTabModal === 'edit' && (
              <form onSubmit={handleUpdateSubmit} className="space-y-3">
                <h4 className="font-bold text-[#F1F5F9] text-xs">تعديل الملف الرئيسي للمحقق</h4>
                <div>
                  <label className="text-[#AAB2BA] block mb-1">الاسم الكامل:</label>
                  <input 
                    type="text" 
                    value={editForm.fullName || ''} 
                    onChange={e => setEditForm({...editForm, fullName: e.target.value})}
                    className="w-full p-2 bg-[#323A40] border border-[#3A434C] rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#315EF5]" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[#AAB2BA] block mb-1">رقم الهاتف:</label>
                    <input 
                      type="text" 
                      value={editForm.phone || ''} 
                      onChange={e => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full p-2 bg-[#323A40] border border-[#3A434C] rounded-xl text-[#F1F5F9] font-mono focus:outline-none focus:ring-2 focus:ring-[#315EF5]" 
                    />
                  </div>
                  <div>
                    <label className="text-[#AAB2BA] block mb-1">رقم WhatsApp:</label>
                    <input 
                      type="text" 
                      value={editForm.whatsapp || ''} 
                      onChange={e => setEditForm({...editForm, whatsapp: e.target.value})}
                      className="w-full p-2 bg-[#323A40] border border-[#3A434C] rounded-xl text-[#F1F5F9] font-mono focus:outline-none focus:ring-2 focus:ring-[#315EF5]" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[#AAB2BA] block mb-1">المحافظة:</label>
                    <input 
                      type="text" 
                      value={editForm.governorate || ''} 
                      onChange={e => setEditForm({...editForm, governorate: e.target.value})}
                      className="w-full p-2 bg-[#323A40] border border-[#3A434C] rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#315EF5]" 
                    />
                  </div>
                  <div>
                    <label className="text-[#AAB2BA] block mb-1">حالة التوفر:</label>
                    <select 
                      value={editForm.availabilityStatus || 'Available'} 
                      onChange={e => setEditForm({...editForm, availabilityStatus: e.target.value as any})}
                      className="w-full p-2 bg-[#323A40] border border-[#3A434C] rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#315EF5]"
                    >
                      <option value="Available">متاح (Available)</option>
                      <option value="Busy">مشغول (Busy)</option>
                      <option value="Offline">غير متصل (Offline)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-[#1e252b]/50 p-3 rounded-2xl border border-[#3a434c]/50">
                  <div>
                    <label className="text-[#AAB2BA] block mb-1">البريد الإلكتروني <span className="text-[10px] text-slate-400">(اختياري - يمكن تجاوزه)</span>:</label>
                    <input 
                      type="email" 
                      value={editForm.email || ''} 
                      onChange={e => setEditForm({...editForm, email: e.target.value})}
                      className="w-full p-2 bg-[#323A40] border border-[#3A434C] rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#315EF5]" 
                      placeholder="rami@police.gov.ps"
                    />
                  </div>
                  <div>
                    <label className="text-[#AAB2BA] block mb-1">الصورة الشخصية:</label>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#323A40] border border-[#3A434C] overflow-hidden shrink-0 flex items-center justify-center">
                        {editForm.photo ? (
                          <img src={editForm.photo} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-slate-500">لا توجد</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5 flex-1">
                        <div className="flex gap-1.5">
                          <label className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-[10px] font-bold cursor-pointer transition-colors">
                            <Upload className="w-3 h-3" />
                            <span>جهازك</span>
                            <input type="file" accept="image/*" onChange={handleEditPhotoUpload} className="hidden" />
                          </label>
                          <button
                            type="button"
                            onClick={editCameraActive ? stopEditCamera : startEditCamera}
                            className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            <Camera className="w-3 h-3" />
                            <span>{editCameraActive ? 'إلغاء' : 'كاميرا'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {editCameraActive && (
                      <div className="mt-2 p-2 bg-[#1e252b] border border-[#3A434C] rounded-xl flex flex-col items-center gap-2">
                        <video ref={editVideoRef} autoPlay playsInline className="w-full max-w-[180px] h-[135px] object-cover rounded-lg border border-[#3A434C] scale-x-[-1]" />
                        <button
                          type="button"
                          onClick={captureEditPhoto}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold"
                        >
                          التقاط الصورة
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-[#3A434C]">
                  <button type="submit" className="px-5 py-2 bg-[#315EF5] hover:bg-[#2549d4] text-white rounded-xl font-bold shadow cursor-pointer">حفظ التعديلات في Cloud SQL</button>
                </div>
              </form>
            )}

            {activeTabModal === 'active_cases' && (
              <div className="space-y-3">
                <h4 className="font-bold text-[#F1F5F9] text-xs">القضايا الحالية المسندة للمحقق ({selectedInvestigator.fullName})</h4>
                <div className="p-3 bg-[#161B1F] rounded-2xl border border-[#3A434C] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-[#315EF5]">#CLM-2026-3143</span>
                    <span className="px-2 py-0.5 bg-[#315EF5]/20 text-[#315EF5] rounded font-bold">قيد المعاينة</span>
                  </div>
                  <p className="text-[#F1F5F9]">حوادث مركبات - تصادم مروري في مفترق نابلس الرئيسي</p>
                  <span className="text-[10px] text-[#AAB2BA]">تم التكليف بواسطة غرفة العمليات المركزية</span>
                </div>
              </div>
            )}

            {activeTabModal === 'history_cases' && (
              <div className="space-y-3">
                <h4 className="font-bold text-[#F1F5F9] text-xs">سجل القضايا المكتملة والمغلقة</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-3 bg-[#161B1F] rounded-2xl border border-[#3A434C] flex justify-between items-center text-xs">
                      <div>
                        <span className="font-mono font-bold text-[#22A06B]">#CLM-2026-88{i}0</span>
                        <p className="text-[#AAB2BA] text-[11px]">معاينة وتوثيق بصمة رقمية SHA-256 مكتملة</p>
                      </div>
                      <span className="text-[10px] bg-[#22A06B]/20 text-[#22A06B] px-2 py-1 rounded font-bold">مكتمل</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTabModal === 'credentials' && (
              <form onSubmit={handleSaveCredentials} className="space-y-4">
                <div className="flex items-center gap-3 bg-cyan-950/30 border border-cyan-500/30 rounded-2xl p-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-[#F1F5F9] text-sm">بيانات تسجيل الدخول وتفعيل البوابة</h4>
                    <p className="text-[#AAB2BA] text-xs leading-relaxed">
                      إذا تم تفعيل شاشة الدخول وتثبيت البيانات، فلن يتمكن المحقق من فتح التطبيق إلا بإدخال اسم المستخدم وكلمة المرور. وإذا تم إلغاء التفعيل، سيفتح التطبيق له بشكل مباشر.
                    </p>
                  </div>
                </div>

                {/* Require Login Toggle */}
                <div className="p-4 bg-[#161B1F] rounded-2xl border border-[#3A434C] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#F1F5F9] text-xs block">إلزام المحقق بتسجيل الدخول</span>
                    <span className="text-[#7C8791] text-[11px]">
                      {credForm.requireLogin 
                        ? 'مفعل: ستظهر شاشة تسجيل الدخول للمحقق عند فتح الرابط' 
                        : 'معطل: سيفتح التطبيق للمحقق بشكل مباشر وتلقائي'}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={credForm.requireLogin} 
                      onChange={e => setCredForm({ ...credForm, requireLogin: e.target.checked })} 
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-[#323A40] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>

                {/* Username Input */}
                <div className="space-y-1">
                  <label className="text-[#AAB2BA] text-xs font-semibold block">اسم المستخدم / البريد الإلكتروني للمحقق:</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={credForm.username} 
                      onChange={e => setCredForm({ ...credForm, username: e.target.value })}
                      required
                      placeholder="مثال: inv.nablus أو inv-101"
                      className="w-full p-3 bg-[#323A40] border border-[#3A434C] rounded-xl text-[#F1F5F9] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-[#7C8791]"
                    />
                  </div>
                  <span className="text-[#7C8791] text-[10px] block">اسم الحساب الذي يستخدمه المحقق في شاشة تسجيل الدخول الميدانية.</span>
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[#AAB2BA] text-xs font-semibold block">كلمة المرور:</label>
                    <button 
                      type="button" 
                      onClick={() => {
                        const randomPass = `Inv@${Math.floor(1000 + Math.random() * 9000)}`;
                        setCredForm({ ...credForm, password: randomPass });
                      }}
                      className="text-cyan-400 hover:text-cyan-300 text-[11px] font-bold cursor-pointer"
                    >
                      + توليد كلمة مرور تلقائية
                    </button>
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={credForm.password} 
                      onChange={e => setCredForm({ ...credForm, password: e.target.value })}
                      required
                      placeholder="أدخل كلمة المرور"
                      className="w-full p-3 bg-[#323A40] border border-[#3A434C] rounded-xl text-[#F1F5F9] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-[#7C8791]"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C8791] hover:text-[#F1F5F9] text-xs font-bold"
                    >
                      {showPassword ? "إخفاء" : "إظهار"}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#3A434C]">
                  <button 
                    type="button" 
                    onClick={() => setSelectedInvestigator(null)} 
                    className="px-4 py-2.5 bg-[#323A40] hover:bg-[#3A434C] text-[#AAB2BA] rounded-xl font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 rounded-xl font-black shadow-lg shadow-cyan-500/20 cursor-pointer flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>حفظ وتثبيت بيانات تسجيل الدخول</span>
                  </button>
                </div>
              </form>
            )}

            {activeTabModal === 'map' && (
              <div className="space-y-3 text-center">
                <h4 className="font-bold text-[#F1F5F9] text-xs text-right">الموقع الجغرافي الحي للمحقق (GPS Live)</h4>
                <div className="w-full h-48 bg-[#161B1F] rounded-2xl border border-[#3A434C] flex flex-col items-center justify-center p-4 space-y-2 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#315EF5_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  <div className="w-12 h-12 rounded-full bg-[#315EF5]/30 border-2 border-[#315EF5] animate-ping absolute" />
                  <MapPin className="w-8 h-8 text-[#315EF5] relative z-10" />
                  <span className="font-mono font-bold text-white relative z-10">خط العرض: {selectedInvestigator.lastGpsLat} | خط الطول: {selectedInvestigator.lastGpsLng}</span>
                  <span className="text-[#22A06B] text-[11px] font-bold relative z-10">الإحداثيات متصلة ومحدثة عبر الأقمار الصناعية</span>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
