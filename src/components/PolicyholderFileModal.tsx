import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Shield, 
  Car, 
  History, 
  Plus, 
  Globe, 
  Lock, 
  Unlock, 
  Send, 
  Copy, 
  MessageSquare, 
  LogOut, 
  RefreshCw, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldAlert, 
  ExternalLink,
  Edit,
  Save
} from 'lucide-react';

interface PolicyholderFileModalProps {
  policyholderId: string;
  onClose: () => void;
  onAddPolicy: (phId: string) => void;
  onAddAsset: (phId: string) => void;
  onRenewPolicy: (policy: any) => void;
}

export const PolicyholderFileModal: React.FC<PolicyholderFileModalProps> = ({
  policyholderId,
  onClose,
  onAddPolicy,
  onAddAsset,
  onRenewPolicy
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'policies' | 'assets' | 'logs' | 'portal'>('info');

  // Portal details and invitation states
  const [portalDetails, setPortalDetails] = useState<any | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [portalSuccessMsg, setPortalSuccessMsg] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Editing state variables
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    customerType: 'INDIVIDUAL',
    nationalId: '',
    companyRegistrationNumber: '',
    mobile: '',
    phone: '',
    email: '',
    city: '',
    governorate: '',
    address: ''
  });
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState('');

  const startEditing = () => {
    if (!data || !data.policyholder) return;
    const ph = data.policyholder;
    setEditForm({
      fullName: ph.fullName || '',
      customerType: ph.customerType || 'INDIVIDUAL',
      nationalId: ph.nationalId || '',
      companyRegistrationNumber: ph.companyRegistrationNumber || '',
      mobile: ph.mobile || '',
      phone: ph.phone || '',
      email: ph.email || '',
      city: ph.city || '',
      governorate: ph.governorate || '',
      address: ph.address || ''
    });
    setEditError('');
    setIsEditing(true);
  };

  const handleSaveChanges = async () => {
    if (!editForm.fullName.trim()) {
      setEditError('الاسم الكامل مطلوب');
      return;
    }
    setUpdating(true);
    setEditError('');
    try {
      const res = await fetch(`/api/operations/policyholder/${policyholderId}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          actorId: 'HQ'
        })
      });
      if (res.ok) {
        setIsEditing(false);
        await loadFileDetails();
      } else {
        const errData = await res.json();
        setEditError(errData.error || 'حدث خطأ أثناء حفظ التعديلات');
      }
    } catch (err) {
      console.error('Error updating policyholder:', err);
      setEditError('تعذر الاتصال بالخادم لحفظ التعديلات.');
    } finally {
      setUpdating(false);
    }
  };

  const loadFileDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/operations/policyholder/${policyholderId}`).catch(() => null);
      if (res && res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.warn("Notice: Policyholder file loading notice:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPortalDetails = async () => {
    setLoadingPortal(true);
    setPortalSuccessMsg('');
    try {
      const res = await fetch(`/api/portal/policyholder/${policyholderId}`).catch(() => null);
      if (res && res.ok) {
        setPortalDetails(await res.json());
      }
    } catch (err) {
      console.warn("Notice: Portal details loading notice:", err);
    } finally {
      setLoadingPortal(false);
    }
  };

  useEffect(() => {
    if (policyholderId) {
      loadFileDetails();
      loadPortalDetails();
    }
  }, [policyholderId]);

  const handleGenerateInvite = async () => {
    setIsGeneratingInvite(true);
    setPortalSuccessMsg('');
    try {
      const res = await fetch(`/api/portal/policyholder/${policyholderId}/invite`, {
        method: 'POST'
      });
      if (res.ok) {
        const inviteData = await res.json();
        setPortalDetails((prev: any) => ({
          ...prev,
          accountStatus: 'INVITED',
          latestInvite: {
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            usedAt: null,
            revokedAt: null
          },
          generatedInvite: inviteData
        }));
        setPortalSuccessMsg('تم إنشاء وتوليد رابط تفعيل بوابة المؤمن له الفريد بنجاح.');
      }
    } catch (err) {
      console.error("Error generating invite:", err);
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  const handleUpdatePortalStatus = async (newStatus: 'ACTIVE' | 'SUSPENDED') => {
    setPortalSuccessMsg('');
    try {
      const res = await fetch(`/api/portal/policyholder/${policyholderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setPortalDetails((prev: any) => ({ ...prev, accountStatus: newStatus }));
        setPortalSuccessMsg(newStatus === 'ACTIVE' ? 'تم إعادة تفعيل الحساب بنجاح.' : 'تم تعليق الحساب بنجاح.');
      }
    } catch (err) {
      console.error("Error updating portal status:", err);
    }
  };

  const handleLogoutAllDevices = async () => {
    setPortalSuccessMsg('');
    try {
      const res = await fetch(`/api/portal/policyholder/${policyholderId}/logout-devices`, {
        method: 'POST'
      });
      if (res.ok) {
        setPortalSuccessMsg('تم تسجيل خروج المؤمن له وإلغاء جميع الجلسات الفعالة بنجاح.');
      }
    } catch (err) {
      console.error("Error logging out devices:", err);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <div className="bg-[#21272F] p-8 rounded-3xl border border-[#3A434C] text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-[#315EF5] animate-spin mx-auto" />
          <p className="text-[#AAB2BA] text-xs">جاري تحميل ملف المؤمن له المتكامل...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.policyholder) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <div className="bg-[#21272F] p-8 rounded-3xl border border-[#3A434C] text-center space-y-3">
          <ShieldAlert className="w-10 h-10 text-red-400 mx-auto" />
          <p className="text-white font-bold text-sm">الملف المطلوب غير موجود</p>
          <button onClick={onClose} className="px-4 py-2 bg-[#2A323A] text-white rounded-xl">إغلاق</button>
        </div>
      </div>
    );
  }

  const ph = data.policyholder;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
      <div className="bg-[#1C2229] border border-[#3A434C] rounded-3xl w-full max-w-4xl shadow-2xl text-right text-xs text-[#F1F5F9] overflow-hidden flex flex-col max-h-[90vh]" dir="rtl">
        {/* Header */}
        <div className="p-6 border-b border-[#3A434C] flex flex-col md:flex-row md:items-center justify-between bg-[#131920] gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#315EF5]/35 to-indigo-600/35 border border-white/5 rounded-2xl flex items-center justify-center text-[#315EF5] shadow-inner shrink-0">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#315EF5]/10 text-[#315EF5] border border-[#315EF5]/20 rounded-lg text-[9px] font-black">
                  {ph.sourceSystem}
                </span>
                <h3 className="text-base font-black text-white">{ph.fullName}</h3>
              </div>
              <p className="text-[#AAB2BA] text-[11px] mt-1 font-mono">الرقم الموحد المعتمد (Master ID): {ph.customerNumber || ph.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={() => onAddPolicy(ph.id)}
              className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 rounded-xl font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة بوليصة</span>
            </button>
            <button
              onClick={() => onAddAsset(ph.id)}
              className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-600/30 rounded-xl font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة أصل / مركبة</span>
            </button>
            <button onClick={onClose} className="p-1.5 bg-[#2A323A] hover:bg-[#323A40] text-[#AAB2BA] rounded-xl transition-all cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs inside the file */}
        <div className="flex items-center bg-[#131920] px-6 border-b border-[#3A434C]/60 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveSubTab('info')}
            className={`py-3 px-4 font-black text-xs border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'info' ? 'border-[#315EF5] text-white' : 'border-transparent text-[#AAB2BA] hover:text-[#F1F5F9]'
            }`}
          >
            البيانات التعريفية
          </button>
          <button
            onClick={() => setActiveSubTab('policies')}
            className={`py-3 px-4 font-black text-xs border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'policies' ? 'border-[#315EF5] text-white' : 'border-transparent text-[#AAB2BA] hover:text-[#F1F5F9]'
            }`}
          >
            <span>البوالص والوثائق</span>
            <span className="px-1.5 py-0.5 bg-[#2A323A] text-white text-[9px] rounded-md">{data.policies?.length || 0}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('assets')}
            className={`py-3 px-4 font-black text-xs border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'assets' ? 'border-[#315EF5] text-white' : 'border-transparent text-[#AAB2BA] hover:text-[#F1F5F9]'
            }`}
          >
            <span>الأصول والمركبات</span>
            <span className="px-1.5 py-0.5 bg-[#2A323A] text-white text-[9px] rounded-md">{data.assets?.length || 0}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('logs')}
            className={`py-3 px-4 font-black text-xs border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'logs' ? 'border-[#315EF5] text-white' : 'border-transparent text-[#AAB2BA] hover:text-[#F1F5F9]'
            }`}
          >
            سجل العمليات (Audit Trail)
          </button>
          <button
            onClick={() => setActiveSubTab('portal')}
            className={`py-3 px-4 font-black text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'portal' ? 'border-[#315EF5] text-white' : 'border-transparent text-[#AAB2BA] hover:text-[#F1F5F9]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>بوابة المؤمن له الرقمية</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Sub-tab 1: Demographics */}
          {activeSubTab === 'info' && (
            <div className="space-y-4">
              {/* Header inside Info sub-tab with Edit button */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#AAB2BA]">
                  {isEditing ? 'تعديل حقول ملف العميل' : 'استعراض البيانات التعريفية للعميل في النظام'}
                </span>
                
                {!isEditing ? (
                  <button
                    onClick={startEditing}
                    className="px-3 py-1.5 bg-[#315EF5]/20 hover:bg-[#315EF5]/30 text-[#315EF5] border border-[#315EF5]/30 rounded-xl font-bold text-[10px] flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>تعديل ملف المؤمن له</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveChanges}
                      disabled={updating}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-[10px] flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {updating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>حفظ التغييرات</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={updating}
                      className="px-3 py-1.5 bg-[#2A323A] hover:bg-[#323A40] text-white rounded-xl font-bold text-[10px] transition-all cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                )}
              </div>

              {editError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-[11px] font-bold text-right">
                  {editError}
                </div>
              )}

              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#131920] border border-[#3A434C]/40 p-5 rounded-2xl space-y-4">
                    <div className="text-[11px] font-black text-[#315EF5] border-b border-[#3A434C]/30 pb-2">تفاصيل الهوية والتعريف</div>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-right">
                      <span className="text-[#AAB2BA]">تصنيف المؤمن له:</span>
                      <span className="font-bold text-white">{ph.customerType === 'INDIVIDUAL' ? 'شخصي فردي' : 'مؤسسة / شركة تجارية'}</span>

                      {ph.customerType === 'INDIVIDUAL' ? (
                        <>
                          <span className="text-[#AAB2BA]">الهوية الوطنية / السجل المدني:</span>
                          <span className="font-mono font-bold text-white">{ph.nationalId || '-'}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-[#AAB2BA]">رقم السجل التجاري:</span>
                          <span className="font-mono font-bold text-white">{ph.companyRegistrationNumber || '-'}</span>
                        </>
                      )}

                      <span className="text-[#AAB2BA]">كود العميل:</span>
                      <span className="font-mono text-emerald-400 font-bold">{ph.customerNumber || '-'}</span>

                      <span className="text-[#AAB2BA]">تاريخ التسجيل بالكامل:</span>
                      <span className="font-mono text-[#AAB2BA]">{new Date(ph.createdAt).toLocaleString('ar-EG')}</span>
                    </div>
                  </div>

                  <div className="bg-[#131920] border border-[#3A434C]/40 p-5 rounded-2xl space-y-4">
                    <div className="text-[11px] font-black text-[#315EF5] border-b border-[#3A434C]/30 pb-2">معلومات الاتصال والوصول</div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 justify-end">
                        <span className="font-mono font-bold text-white">{ph.mobile || '-'}</span>
                        <span className="text-[#AAB2BA] flex items-center gap-1">
                          <span>رقم الهاتف الخلوي</span>
                          <Phone className="w-3.5 h-3.5 text-[#315EF5]" />
                        </span>
                      </div>

                      <div className="flex items-center gap-3 justify-end">
                        <span className="font-mono text-white">{ph.phone || '-'}</span>
                        <span className="text-[#AAB2BA] flex items-center gap-1">
                          <span>الهاتف الثابت</span>
                          <Phone className="w-3.5 h-3.5 text-[#315EF5]" />
                        </span>
                      </div>

                      <div className="flex items-center gap-3 justify-end">
                        <span className="font-mono text-white text-[11px]">{ph.email || '-'}</span>
                        <span className="text-[#AAB2BA] flex items-center gap-1">
                          <span>البريد الإلكتروني</span>
                          <Mail className="w-3.5 h-3.5 text-[#315EF5]" />
                        </span>
                      </div>

                      <div className="flex items-center gap-3 justify-end">
                        <span className="text-white text-right">{ph.city || '-'} ، {ph.governorate || '-'}</span>
                        <span className="text-[#AAB2BA] flex items-center gap-1">
                          <span>المنطقة والعنوان</span>
                          <MapPin className="w-3.5 h-3.5 text-[#315EF5]" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {ph.address && (
                    <div className="bg-[#131920] border border-[#3A434C]/40 p-4 rounded-2xl col-span-2 space-y-1">
                      <div className="text-[10px] text-[#AAB2BA] font-bold">العنوان السكني والتفصيلي المسجل:</div>
                      <p className="text-white font-medium leading-relaxed">{ph.address}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#131920] border border-[#3A434C]/40 p-6 rounded-2xl space-y-4 text-right">
                  <div className="text-[11px] font-black text-[#315EF5] border-b border-[#3A434C]/30 pb-2">تحديث البيانات التعريفية والاتصال</div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#AAB2BA] font-bold block">الاسم الكامل للمؤمن له *</label>
                      <input
                        type="text"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        className="w-full bg-[#1C2229] border border-[#3A434C] rounded-xl px-3 py-2 text-xs text-white focus:border-[#315EF5] outline-none"
                        placeholder="أدخل الاسم بالكامل"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-[#AAB2BA] font-bold block">تصنيف المؤمن له</label>
                      <select
                        value={editForm.customerType}
                        onChange={(e) => setEditForm({ ...editForm, customerType: e.target.value })}
                        className="w-full bg-[#1C2229] border border-[#3A434C] rounded-xl px-3 py-2 text-xs text-white focus:border-[#315EF5] outline-none"
                      >
                        <option value="INDIVIDUAL">شخصي فردي</option>
                        <option value="COMPANY">مؤسسة / شركة تجارية</option>
                      </select>
                    </div>

                    {editForm.customerType === 'INDIVIDUAL' ? (
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#AAB2BA] font-bold block">الهوية الوطنية / السجل المدني</label>
                        <input
                          type="text"
                          value={editForm.nationalId}
                          onChange={(e) => setEditForm({ ...editForm, nationalId: e.target.value })}
                          className="w-full bg-[#1C2229] border border-[#3A434C] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#315EF5] outline-none"
                          placeholder="مثال: 900232112"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#AAB2BA] font-bold block">رقم السجل التجاري</label>
                        <input
                          type="text"
                          value={editForm.companyRegistrationNumber}
                          onChange={(e) => setEditForm({ ...editForm, companyRegistrationNumber: e.target.value })}
                          className="w-full bg-[#1C2229] border border-[#3A434C] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#315EF5] outline-none"
                          placeholder="مثال: 5621422"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[10px] text-[#AAB2BA] font-bold block">رقم الهاتف الخلوي</label>
                      <input
                        type="text"
                        value={editForm.mobile}
                        onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                        className="w-full bg-[#1C2229] border border-[#3A434C] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#315EF5] outline-none"
                        placeholder="مثال: 972599794043"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-[#AAB2BA] font-bold block">الهاتف الثابت</label>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full bg-[#1C2229] border border-[#3A434C] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#315EF5] outline-none"
                        placeholder="مثال: 0599717122"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-[#AAB2BA] font-bold block">البريد الإلكتروني</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full bg-[#1C2229] border border-[#3A434C] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#315EF5] outline-none"
                        placeholder="example@domain.com"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-[#AAB2BA] font-bold block">المدينة / البلدة</label>
                      <input
                        type="text"
                        value={editForm.city}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        className="w-full bg-[#1C2229] border border-[#3A434C] rounded-xl px-3 py-2 text-xs text-white focus:border-[#315EF5] outline-none"
                        placeholder="مثال: نابلس"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-[#AAB2BA] font-bold block">المحافظة / اللواء</label>
                      <input
                        type="text"
                        value={editForm.governorate}
                        onChange={(e) => setEditForm({ ...editForm, governorate: e.target.value })}
                        className="w-full bg-[#1C2229] border border-[#3A434C] rounded-xl px-3 py-2 text-xs text-white focus:border-[#315EF5] outline-none"
                        placeholder="مثال: نابلس"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] text-[#AAB2BA] font-bold block">العنوان السكني والتفصيلي المسجل</label>
                      <textarea
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        className="w-full bg-[#1C2229] border border-[#3A434C] rounded-xl px-3 py-2 text-xs text-white focus:border-[#315EF5] outline-none h-20 resize-none"
                        placeholder="مثال: نابلس ، رفيديا - شارع المدارس"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sub-tab 2: Associated Policies */}
          {activeSubTab === 'policies' && (
            <div className="space-y-4">
              {data.policies?.length === 0 ? (
                <div className="p-10 bg-[#131920] border border-[#3A434C]/40 text-center rounded-2xl text-[#AAB2BA]">
                  لا توجد وثائق بوالص تأمين مصدرة لهذا المؤمن له.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.policies.map((pol: any) => (
                    <div key={pol.id} className="bg-[#131920] border border-[#3A434C]/50 p-4 rounded-2xl space-y-3 relative overflow-hidden">
                      {pol.renewedFromPolicyId && (
                        <div className="absolute top-0 left-0 px-2 py-0.5 bg-indigo-600/20 border-r border-b border-indigo-600/40 text-[9px] font-bold text-indigo-400">
                          وثيقة مجددة
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          pol.status === 'ACTIVE' ? 'bg-[#22A06B]/20 text-[#22A06B]' : 'bg-red-500/10 text-red-400 border border-red-500/10'
                        }`}>
                          {pol.status === 'ACTIVE' ? 'نشطة سارية' : 'منتهية/ملغاة'}
                        </span>
                        <div className="text-xs font-black text-white">{pol.policyNumber}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-y-2 text-right text-[11px] border-t border-[#3A434C]/30 pt-2 text-[#AAB2BA]">
                        <span>نوع التأمين:</span>
                        <span className="font-bold text-white">{pol.policyType} / {pol.coverageType}</span>

                        <span>مبلغ قسط التأمين:</span>
                        <span className="font-mono font-bold text-emerald-400">{pol.premiumAmount ? `${pol.premiumAmount} ${pol.currency}` : '-'}</span>

                        <span>فترة سريان التأمين:</span>
                        <span className="font-mono text-white text-[10px]">{pol.startDate || '-'} إلى {pol.endDate || '-'}</span>
                      </div>

                      {pol.status === 'ACTIVE' && (
                        <button
                          onClick={() => onRenewPolicy(pol)}
                          className="w-full py-1.5 bg-[#2A323A] hover:bg-[#323A40] text-white border border-[#3A434C] rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-[#315EF5]" />
                          <span>تجديد بوليصة التأمين</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub-tab 3: Associated Assets / Vehicles */}
          {activeSubTab === 'assets' && (
            <div className="space-y-4">
              {data.assets?.length === 0 ? (
                <div className="p-10 bg-[#131920] border border-[#3A434C]/40 text-center rounded-2xl text-[#AAB2BA]">
                  لا توجد أصول أو مركبات مؤمن عليها مسجلة تحت اسم هذا المؤمن له.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.assets.map((asset: any) => (
                    <div key={asset.id} className="bg-[#131920] border border-[#3A434C]/50 p-4 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between border-b border-[#3A434C]/30 pb-2">
                        <span className="px-2 py-0.5 bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 rounded-lg text-[9px] font-black">
                          {asset.assetType}
                        </span>
                        <span className="font-bold text-white">{asset.assetReference || asset.id}</span>
                      </div>

                      {asset.assetType === 'VEHICLE' && asset.vehicle ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between bg-[#1C2229] p-2.5 rounded-xl border border-[#3A434C]/40">
                            <span className="font-mono text-xs font-black text-emerald-400">{asset.vehicle.plateNumber}</span>
                            <span className="text-[10px] text-[#AAB2BA] font-bold">لوحة المركبة</span>
                          </div>

                          <div className="grid grid-cols-2 gap-y-1.5 text-right text-[11px] text-[#AAB2BA]">
                            <span>الشركة والماركة:</span>
                            <span className="font-bold text-white">{asset.vehicle.make || '-'}</span>

                            <span>طراز المركبة والسنة:</span>
                            <span className="text-white">{asset.vehicle.model || '-'} ({asset.vehicle.modelYear || '-'})</span>

                            <span>رقم الهيكل (VIN):</span>
                            <span className="font-mono text-white text-[10px]">{asset.vehicle.chassisNumber || '-'}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[#AAB2BA] leading-relaxed text-[11px]">{asset.description || 'لا يوجد وصف تفصيلي مسجل للأصل حالياً.'}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub-tab 4: Logs / Audit Trail */}
          {activeSubTab === 'logs' && (
            <div className="space-y-4">
              {data.activityLog?.length === 0 ? (
                <div className="p-10 bg-[#131920] border border-[#3A434C]/40 text-center rounded-2xl text-[#AAB2BA]">
                  لا توجد حركات تدقيق أو عمليات سابقة مسجلة للملف.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.activityLog.map((log: any) => (
                    <div key={log.id} className="bg-[#131920] border border-[#3A434C]/40 p-4 rounded-xl text-right space-y-1.5 text-[11px] leading-relaxed">
                      <div className="flex items-center justify-between text-[10px] text-[#7C8791] font-mono border-b border-[#3A434C]/20 pb-1.5">
                        <span>{new Date(log.timestamp).toLocaleString('ar-EG')}</span>
                        <span className="text-[#315EF5] font-black">{log.action}</span>
                      </div>
                      <div className="text-white">
                        العملية على جدول: <span className="font-bold font-mono text-indigo-400">{log.entityType}</span> (ID: {log.entityId})
                      </div>
                      <div className="text-[10px] text-[#AAB2BA]">
                        بواسطة الموظف: <span className="font-mono font-bold text-white">{log.userId}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub-tab 5: Policyholder Portal Accounts */}
          {activeSubTab === 'portal' && (
            <div className="space-y-6">
              {loadingPortal ? (
                <div className="py-12 text-center space-y-2">
                  <RefreshCw className="w-7 h-7 text-[#315EF5] animate-spin mx-auto" />
                  <p className="text-[#AAB2BA]">جاري تحميل بيانات حساب البوابة...</p>
                </div>
              ) : portalDetails ? (
                <>
                  {portalSuccessMsg && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl font-bold">
                      {portalSuccessMsg}
                    </div>
                  )}

                  {/* Account Status */}
                  <div className="bg-[#131920] border border-[#3A434C]/40 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-xs font-bold text-[#AAB2BA]">حالة حساب البوابة:</span>
                        {portalDetails.accountStatus === 'NOT_INVITED' && (
                          <span className="px-2.5 py-1 bg-gray-500/15 text-gray-400 border border-gray-500/30 rounded-lg font-bold text-[10px]">
                            لم يتم دعوته بعد
                          </span>
                        )}
                        {portalDetails.accountStatus === 'INVITED' && (
                          <span className="px-2.5 py-1 bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 rounded-lg font-bold text-[10px]">
                            بانتظار التفعيل (مُرسل)
                          </span>
                        )}
                        {portalDetails.accountStatus === 'ACTIVE' && (
                          <span className="px-2.5 py-1 bg-[#22A06B]/20 text-[#22A06B] border border-[#22A06B]/30 rounded-lg font-bold text-[10px]">
                            ✓ نشط ومفعّل
                          </span>
                        )}
                        {portalDetails.accountStatus === 'SUSPENDED' && (
                          <span className="px-2.5 py-1 bg-red-500/15 text-red-400 border border-red-500/30 rounded-lg font-bold text-[10px]">
                            ⚠ معلّق مؤقتاً
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-[#AAB2BA] space-y-1 font-mono leading-relaxed">
                        <div>تاريخ التنشيط: {portalDetails.activatedAt ? new Date(portalDetails.activatedAt).toLocaleString('ar-EG') : 'لم ينشط بعد'}</div>
                        <div>آخر تسجيل دخول: {portalDetails.lastLoginAt ? new Date(portalDetails.lastLoginAt).toLocaleString('ar-EG') : 'لا يوجد'}</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[150px]">
                      {portalDetails.accountStatus === 'ACTIVE' ? (
                        <button
                          onClick={() => handleUpdatePortalStatus('SUSPENDED')}
                          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-bold text-[10px] flex items-center gap-1.5 justify-center transition-all cursor-pointer border border-red-500/20"
                        >
                          <Lock className="w-4 h-4" />
                          <span>تعليق الحساب</span>
                        </button>
                      ) : portalDetails.accountStatus === 'SUSPENDED' ? (
                        <button
                          onClick={() => handleUpdatePortalStatus('ACTIVE')}
                          className="px-4 py-2 bg-[#22A06B]/10 hover:bg-[#22A06B]/20 text-[#22A06B] rounded-xl font-bold text-[10px] flex items-center gap-1.5 justify-center transition-all cursor-pointer border border-[#22A06B]/20"
                        >
                          <Unlock className="w-4 h-4" />
                          <span>إعادة التفعيل</span>
                        </button>
                      ) : null}

                      {portalDetails.hasAccount && (
                        <button
                          onClick={handleLogoutAllDevices}
                          className="px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded-xl font-bold text-[10px] flex items-center gap-1.5 justify-center transition-all cursor-pointer border border-yellow-500/20"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>طرد جميع الأجهزة</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Invitation Link Section */}
                  <div className="bg-[#131920] border border-[#3A434C]/40 rounded-2xl p-5 space-y-4 text-right">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-[#AAB2BA] font-bold">رابط التفعيل المشفر</span>
                      <h4 className="font-bold text-xs text-[#F1F5F9]">دعوة المؤمن له لتنشيط الحساب</h4>
                    </div>
                    <p className="text-[#AAB2BA] text-[11px] leading-relaxed">
                      قم بإنشاء دعوة جديدة مشفرة لإرسالها للعميل عبر الواتساب أو الرسائل القصيرة. سيمكّنه الرابط المرفق من تعيين رمز PIN وبدء الاستخدام الآمن فوراً.
                    </p>

                    <button
                      onClick={handleGenerateInvite}
                      disabled={isGeneratingInvite}
                      className="w-full px-4 py-2.5 bg-[#315EF5] hover:bg-[#315EF5]/95 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {isGeneratingInvite ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>جاري توليد الرابط...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>{portalDetails.latestInvite ? "إعادة إصدار رابط تفعيل جديد" : "توليد وإصدار رابط تفعيل"}</span>
                        </>
                      )}
                    </button>

                    {portalDetails.generatedInvite && (
                      <div className="mt-4 border-t border-[#3A434C]/40 pt-4 space-y-4">
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-[#AAB2BA] block">رابط التفعيل:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(portalDetails.generatedInvite.activationLink);
                                setCopiedLink(true);
                                setTimeout(() => setCopiedLink(false), 2000);
                              }}
                              className="px-3 py-2 bg-[#2A323A] hover:bg-[#323A40] text-white rounded-xl transition-all text-xs cursor-pointer flex items-center gap-1.5"
                            >
                              <Copy className="w-4 h-4 text-[#315EF5]" />
                              <span>{copiedLink ? "تم النسخ!" : "نسخ الرابط"}</span>
                            </button>
                            <input
                              type="text"
                              readOnly
                              value={portalDetails.generatedInvite.activationLink}
                              className="bg-[#161B1F] border border-[#3A434C] text-left text-xs font-mono font-bold text-[#315EF5] rounded-xl px-3 py-2 flex-1 outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(portalDetails.generatedInvite.whatsappMessage);
                                setCopiedMessage(true);
                                setTimeout(() => setCopiedMessage(false), 2000);
                              }}
                              className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg transition-all text-[10px] font-bold cursor-pointer flex items-center gap-1"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{copiedMessage ? "تم نسخ النص!" : "نسخ نص الواتساب"}</span>
                            </button>
                            <span className="text-xs font-bold text-[#AAB2BA]">صيغة رسالة الواتساب الجاهزة:</span>
                          </div>
                          <pre className="bg-[#161B1F] border border-[#3A434C] p-4 rounded-xl whitespace-pre-wrap leading-relaxed text-[#F1F5F9] max-h-40 overflow-y-auto text-right">
                            {portalDetails.generatedInvite.whatsappMessage}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-red-400">فشل في تحميل تفاصيل حساب البوابة العميل</div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#131920] border-t border-[#3A434C] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#2A323A] hover:bg-[#323A40] text-[#AAB2BA] rounded-xl font-bold transition-all cursor-pointer"
          >
            إغلاق الملف الموحد
          </button>
        </div>
      </div>
    </div>
  );
};
