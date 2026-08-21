import React, { useState, useEffect } from 'react';
import { 
  Globe, Shield, KeyRound, User, Phone, Mail, MapPin, 
  FileText, Calendar, Hash, ArrowLeft, LogOut, RefreshCw, 
  AlertCircle, CheckCircle2, ShieldCheck, HelpCircle, Lock, Eye, EyeOff,
  Bell, ChevronLeft, ChevronRight, Car, Home, Briefcase, Award, Headphones,
  CreditCard, AlertTriangle, Check, Sparkles, Activity, PhoneCall, MessageCircle
} from 'lucide-react';
import { TrustLogo } from './TrustLogo';

interface VehicleDetail {
  plateNumber: string;
  plateCountry?: string;
  make: string;
  model: string;
  modelYear: string;
  color?: string;
  chassisNumber?: string;
  registrationNumber?: string;
}

interface Asset {
  id: string;
  assetType: string; // 'VEHICLE' | 'PROPERTY' | 'EQUIPMENT' etc.
  description: string;
  vehicle?: VehicleDetail | null;
}

interface Policy {
  id: string;
  policyNumber: string;
  policyType: string;
  coverageType: string;
  startDate: string;
  endDate: string;
  status: string;
  premiumAmount?: number | null;
  currency?: string | null;
  sourceSystem?: string;
  asset?: Asset | null;
}

interface Profile {
  id: string;
  customerNumber: string;
  fullName: string;
  nationalId: string | null;
  companyRegistrationNumber: string | null;
  customerType: string;
  mobile: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  governorate: string | null;
}

export function PolicyholderPortal() {
  const [view, setView] = useState<'login' | 'activate' | 'dashboard'>('login');
  
  // API and Session States
  const [token, setToken] = useState<string>('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Login Form States
  const [loginCustomerNumber, setLoginCustomerNumber] = useState('');
  const [loginNationalId, setLoginNationalId] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  // Activation Form States
  const [activationToken, setActivationToken] = useState('');
  const [lookupResult, setLookupResult] = useState<{ fullName: string; customerNumber: string; mobile: string } | null>(null);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Bottom Navigation Tabs
  const [activeTab, setActiveTab] = useState<'home' | 'policies' | 'payments' | 'claims' | 'profile'>('home');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Active Service Modals & Actions State
  const [activeModal, setActiveModal] = useState<'none' | 'renew' | 'certificate' | 'contact' | 'claim' | 'notifications'>('none');
  const [selectedPolicyForAction, setSelectedPolicyForAction] = useState<Policy | null>(null);
  const [modalInputNotes, setModalInputNotes] = useState('');
  const [modalInputSubject, setModalInputSubject] = useState('');
  const [modalInputMessage, setModalInputMessage] = useState('');
  const [claimDescription, setClaimDescription] = useState('');
  const [claimType, setClaimType] = useState('تصادم / حادث مروري');

  const [claimsList, setClaimsList] = useState<any[]>([]);
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);

  // Auto-fading toast helper
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
  };

  const handleRequestRenewal = async (policyId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/portal/services/renew', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ policyId, notes: modalInputNotes })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast(data.message || "تم إرسال طلب التجديد بنجاح");
        setActiveModal('none');
        setModalInputNotes('');
      } else {
        triggerToast(data.error || "فشل إرسال الطلب");
      }
    } catch (err) {
      triggerToast("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitClaim = async (policyNumber: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/portal/services/claim', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ policyNumber, accidentType: claimType, description: claimDescription, location: profile?.city || 'نابلس' })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast(`تم تقديم المطالبة بنجاح برقم: ${data.claimNumber}`);
        setActiveModal('none');
        setClaimDescription('');
        setActiveTab('claims');
      } else {
        triggerToast(data.error || "فشل تقديم المطالبة");
      }
    } catch (err) {
      triggerToast("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  const handleSendContact = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/portal/services/contact', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subject: modalInputSubject, message: modalInputMessage })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast(data.message || "تم إرسال رسالتك بنجاح");
        setActiveModal('none');
        setModalInputSubject('');
        setModalInputMessage('');
      } else {
        triggerToast(data.error || "فشل إرسال الرسالة");
      }
    } catch (err) {
      triggerToast("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => {
        setToastMsg(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Load initial routing context on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;

    // Detect Activation Route
    if (path === '/portal/activate' || params.has('token') || path.endsWith('/activate')) {
      const tokenParam = params.get('token') || '';
      setView('activate');
      if (tokenParam) {
        setActivationToken(tokenParam);
        handleLookupToken(tokenParam);
      }
    } else {
      // Check local storage for session
      const savedToken = localStorage.getItem('portal_session_token');
      if (savedToken) {
        fetchPortalData(savedToken);
      } else {
        setView('login');
      }
    }
  }, []);

  // Securely fetch profile and policies using the token
  const fetchPortalData = async (sessionToken: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Fetch Profile
      const profRes = await fetch('/api/portal/profile', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!profRes.ok) {
        // Session expired or invalid
        localStorage.removeItem('portal_session_token');
        setView('login');
        setLoading(false);
        return;
      }

      const profData = await profRes.json();
      setProfile(profData.profile);

      // Fetch Policies
      const polRes = await fetch('/api/portal/policies', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (polRes.ok) {
        const polData = await polRes.json();
        setPolicies(polData);
      }

      // Fetch Claims
      const claimsRes = await fetch('/api/portal/claims', {
        headers: { 'Authorization': `Bearer ${sessionToken}`, 'Content-Type': 'application/json' }
      });
      if (claimsRes.ok) {
        setClaimsList(await claimsRes.json());
      }

      // Fetch Payments
      const payRes = await fetch('/api/portal/payments', {
        headers: { 'Authorization': `Bearer ${sessionToken}`, 'Content-Type': 'application/json' }
      });
      if (payRes.ok) {
        setPaymentsList(await payRes.json());
      }

      // Fetch Notifications
      const notifRes = await fetch('/api/portal/notifications', {
        headers: { 'Authorization': `Bearer ${sessionToken}`, 'Content-Type': 'application/json' }
      });
      if (notifRes.ok) {
        setNotificationsList(await notifRes.json());
      }

      setToken(sessionToken);
      setView('dashboard');
    } catch (err) {
      console.error(err);
      setErrorMsg('حدث خطأ أثناء تحميل بيانات الحساب.');
    } finally {
      setLoading(false);
    }
  };

  // 1. Activation Token Lookup Handler
  const handleLookupToken = async (rawToken: string) => {
    if (!rawToken.trim()) return;
    setLoading(true);
    setErrorMsg('');
    setLookupResult(null);
    try {
      const res = await fetch(`/api/portal/activate-lookup?token=${encodeURIComponent(rawToken.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'رابط التفعيل هذا غير صالح أو منتهي الصلاحية.');
        return;
      }
      setLookupResult({
        fullName: data.customerName || data.fullName,
        customerNumber: data.policyholderId || data.customerNumber,
        mobile: data.maskedPhone || data.mobile || ''
      });
    } catch (err) {
      console.error(err);
      setErrorMsg('خطأ في استيراد بيانات التفعيل.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Commit Activation (Set PIN)
  const handleCommitActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      setErrorMsg('يجب أن يتكون رمز PIN من 4 أرقام بالضبط.');
      return;
    }
    if (newPin !== confirmPin) {
      setErrorMsg('رمز PIN وتأكيده غير متطابقين.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/portal/activate-commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: activationToken.trim(), password: newPin })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'فشل تفعيل الحساب.');
        return;
      }

      setSuccessMsg('تم تفعيل حسابك بنجاح! جاري تسجيل دخولك تلقائياً...');
      
      // Auto-login with the newly set credentials
      setTimeout(() => {
        handlePortalLoginDirect(profile?.nationalId || lookupResult?.customerNumber || '', newPin);
      }, 1500);

    } catch (err) {
      console.error(err);
      setErrorMsg('حدث خطأ غير متوقع أثناء تفعيل الحساب.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Login API Caller
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginNationalId || !loginPin) {
      setErrorMsg('الرجاء إدخال رقم الهوية ورمز PIN الخاص بك.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nationalId: loginNationalId.trim(),
          password: loginPin.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'بيانات الدخول غير صحيحة أو الحساب معلّق.');
        return;
      }

      // Save token & fetch profile
      localStorage.setItem('portal_session_token', data.sessionToken);
      fetchPortalData(data.sessionToken);
    } catch (err) {
      console.error(err);
      setErrorMsg('خطأ أثناء الاتصال بخادم البوابة الرقمية.');
    } finally {
      setLoading(false);
    }
  };

  // Direct login helper for auto-login after activation
  const handlePortalLoginDirect = async (natId: string, pin: string) => {
    try {
      const res = await fetch('/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nationalId: natId,
          password: pin
        })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('portal_session_token', data.sessionToken);
        fetchPortalData(data.sessionToken);
      } else {
        setView('login');
      }
    } catch (e) {
      setView('login');
    }
  };

  // 4. Secured Logout Handler
  const handleLogout = async () => {
    const savedToken = localStorage.getItem('portal_session_token');
    if (savedToken) {
      try {
        await fetch('/api/portal/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${savedToken}` }
        });
      } catch (e) {}
    }
    localStorage.removeItem('portal_session_token');
    setToken('');
    setProfile(null);
    setPolicies([]);
    setView('login');
    setLoginPin('');
    setActiveTab('home');
  };

  // Helpers for home screen computations
  const activePoliciesCount = policies.filter(p => p.status === 'ACTIVE').length;
  const firstName = profile?.fullName ? profile.fullName.trim().split(' ')[0] : 'المؤمن له';

  // Smart Alert Card - closest active expiring policy
  const getClosestExpiringPolicy = () => {
    const activePols = policies.filter(p => p.status === 'ACTIVE' && p.endDate);
    if (activePols.length === 0) return null;

    const now = new Date();
    const sorted = [...activePols]
      .map(p => {
        const expiryDate = new Date(p.endDate);
        const diffTime = expiryDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { policy: p, days: diffDays };
      })
      .filter(item => item.days > 0)
      .sort((a, b) => a.days - b.days);

    return sorted[0] || null;
  };

  const closestExpiring = getClosestExpiringPolicy();

  // Helper to resolve policy display name & assets
  const getPolicyDetails = (p: Policy) => {
    let title = "تأمين عام";
    let assetDesc = "وثيقة تأمين معتمدة";
    let isVehicle = false;
    let isProperty = false;

    const pTypeLower = (p.policyType || "").toLowerCase();
    
    if (pTypeLower.includes('مركبة') || pTypeLower.includes('سيار') || pTypeLower.includes('vehicle') || pTypeLower.includes('motor')) {
      title = "تأمين المركبة";
      isVehicle = true;
      if (p.asset?.vehicle) {
        const v = p.asset.vehicle;
        assetDesc = `${v.make} ${v.model} ${v.modelYear}`;
      } else {
        assetDesc = p.asset?.description || "مركبة مسجلة";
      }
    } else if (pTypeLower.includes('عقار') || pTypeLower.includes('ممتلك') || pTypeLower.includes('منزل') || pTypeLower.includes('property') || pTypeLower.includes('home')) {
      title = "تأمين الممتلكات";
      isProperty = true;
      assetDesc = p.asset?.description || "مبنى سكني / تجاري";
    } else {
      title = p.policyType || "وثيقة تأمين";
      assetDesc = p.asset?.description || "أصول مؤمنة";
    }

    return { title, assetDesc, isVehicle, isProperty };
  };

  // Helper to format date nicely in Arabic
  const formatArabicDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#17212B] font-sans antialiased text-right" dir="rtl">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-[#17212B] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-[#3A434C] animate-fade-in text-xs font-bold">
          <Sparkles className="w-4 h-4 text-[#E6B84A] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-md mx-auto min-h-screen flex flex-col justify-between pb-24">
        
        {/* ==================================================== */}
        {/* VIEW 1: ACTIVATION GATEWAY */}
        {/* ==================================================== */}
        {view === 'activate' && (
          <div className="p-4 pt-8">
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm space-y-6">
              <div className="text-center space-y-2">
                <div className="flex justify-center mb-1">
                  <TrustLogo size="lg" variant="full" glowColor="orange" isAlive={true} />
                </div>
                <h2 className="text-sm font-black text-[#17212B] mt-2">تفعيل البوابة الرقمية للعملاء</h2>
                <p className="text-[#667788] text-[10px] leading-relaxed">أدخل رمز التفعيل الموحد لتعيين كلمة مرور PIN الخاصة بك وبدء استخدام الخدمة الذاتية</p>
              </div>

              {errorMsg && (
                <div className="p-4 bg-[#E5484D]/10 border border-[#E5484D]/20 text-[#E5484D] rounded-2xl font-bold text-[10px] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="flex-1 leading-relaxed">{errorMsg}</p>
                </div>
              )}

              {successMsg && (
                <div className="p-4 bg-[#18B77A]/10 border border-[#18B77A]/20 text-[#18B77A] rounded-2xl font-bold text-[10px] flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="flex-1 leading-relaxed">{successMsg}</p>
                </div>
              )}

              {/* Step 1: Token Input */}
              {!lookupResult ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#667788] block">رمز التفعيل الموحد (Token)</label>
                    <input
                      type="text"
                      value={activationToken}
                      onChange={(e) => setActivationToken(e.target.value)}
                      placeholder="أدخل الرمز المشفر المكون من 32 حرفاً..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-[#E2E8F0] text-left text-xs font-mono font-bold rounded-2xl focus:border-[#2F66F6] focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <button
                    onClick={() => handleLookupToken(activationToken)}
                    disabled={loading || !activationToken}
                    className="w-full py-3 bg-[#2F66F6] hover:bg-[#2F66F6]/90 disabled:opacity-50 text-white rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                    <span>التحقق من رمز التفعيل</span>
                  </button>
                </div>
              ) : (
                /* Step 2: Set PIN Form */
                <form onSubmit={handleCommitActivation} className="space-y-5">
                  {/* Policyholder Identity Card */}
                  <div className="p-4 bg-[#F5F7FA] border border-[#E2E8F0] rounded-2xl space-y-1 text-xs">
                    <div className="text-[10px] text-[#667788]">هوية العميل المطابقة:</div>
                    <div className="font-black text-[#17212B]">{lookupResult.fullName}</div>
                    <div className="text-[10px] font-mono font-bold text-[#2F66F6]">ID: {lookupResult.customerNumber}</div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#667788] block">تعيين رمز PIN الجديد (4 أرقام)</label>
                      <input
                        type="password"
                        maxLength={4}
                        pattern="\d{4}"
                        inputMode="numeric"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-[#E2E8F0] text-center tracking-widest text-lg font-bold rounded-2xl focus:border-[#2F66F6] focus:bg-white outline-none transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#667788] block">تأكيد رمز PIN الجديد</label>
                      <input
                        type="password"
                        maxLength={4}
                        pattern="\d{4}"
                        inputMode="numeric"
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-[#E2E8F0] text-center tracking-widest text-lg font-bold rounded-2xl focus:border-[#2F66F6] focus:bg-white outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#2F66F6] hover:bg-[#2F66F6]/90 disabled:opacity-50 text-white rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                    <span>حفظ رمز الـ PIN وتفعيل الحساب</span>
                  </button>
                </form>
              )}

              <div className="text-center pt-2">
                <button
                  onClick={() => { setView('login'); setErrorMsg(''); setSuccessMsg(''); }}
                  className="text-xs font-bold text-[#2F66F6] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>العودة لصفحة تسجيل الدخول</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 2: PORTAL LOGIN GATEWAY */}
        {/* ==================================================== */}
        {view === 'login' && (
          <div className="p-4 pt-12">
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm space-y-6">
              <div className="text-center space-y-2">
                <div className="flex justify-center mb-1">
                  <TrustLogo size="lg" variant="full" glowColor="orange" isAlive={true} />
                </div>
                <h2 className="text-sm font-black text-[#17212B] mt-2">تسجيل الدخول لبوابة المؤمن لهم</h2>
                <p className="text-[#667788] text-[10px] leading-relaxed">أدخل رقم الهوية الوطنية أو السجل المدني ورمز PIN الخاص بك</p>
              </div>

              {errorMsg && (
                <div className="p-4 bg-[#E5484D]/10 border border-[#E5484D]/20 text-[#E5484D] rounded-2xl font-bold text-[10px] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="flex-1 leading-relaxed">{errorMsg}</p>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#667788] block">رقم الهوية الوطنية / السجل المدني</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={loginNationalId}
                      onChange={(e) => setLoginNationalId(e.target.value)}
                      placeholder="مثال: 1012345678"
                      className="w-full px-4 py-3 pl-10 bg-slate-50 border border-[#E2E8F0] rounded-2xl text-xs font-bold text-[#17212B] focus:border-[#2F66F6] focus:bg-white outline-none transition-all text-right"
                      required
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#667788] block">رمز PIN المكون من 4 أرقام</label>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      maxLength={4}
                      pattern="\d{4}"
                      inputMode="numeric"
                      value={loginPin}
                      onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••"
                      className="w-full px-4 py-3 pl-10 bg-slate-50 border border-[#E2E8F0] rounded-2xl text-center tracking-widest text-lg font-bold text-[#17212B] focus:border-[#2F66F6] focus:bg-white outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute left-3 top-4 text-slate-400 hover:text-[#2F66F6]"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#2F66F6] hover:bg-[#2F66F6]/90 disabled:opacity-50 text-white rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-[#2F66F6]/10"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  <span>تسجيل الدخول الموحد</span>
                </button>
              </form>

              <div className="text-center pt-2 border-t border-[#E2E8F0] space-y-2">
                <p className="text-[10px] text-[#667788]">لم تقم بتفعيل حسابك الرقمي الموحد بعد؟</p>
                <button
                  onClick={() => { setView('activate'); setErrorMsg(''); setSuccessMsg(''); }}
                  className="text-xs font-black text-[#2F66F6] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>اضغط هنا لتفعيل حسابك بواسطة الرابط</span>
                  <Globe className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 3: SECURED PORTAL DASHBOARD (TASMIM #2 DESIGN) */}
        {/* ==================================================== */}
        {view === 'dashboard' && profile && (
          <div className="flex-1 flex flex-col justify-between">
            
            {/* 1. Header & Greeting Area */}
            {activeTab === 'home' && (
              <div className="p-4 space-y-5">
                {/* Visual Top Bar */}
                <div className="flex items-center justify-between">
                  {/* Left Side: Avatar & Notification */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        if (notificationsList.length === 0) {
                          triggerToast("لا توجد تنبيهات جديدة.");
                        } else {
                          setActiveModal('notifications');
                        }
                      }}
                      className="w-10 h-10 bg-white border border-[#E2E8F0] rounded-2xl flex items-center justify-center relative hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
                    >
                      <Bell className="w-4 h-4 text-[#17212B]" />
                      {notificationsList.length > 0 && (
                        <span className="w-2 h-2 bg-[#E5484D] rounded-full absolute top-2.5 right-2.5 border-2 border-white"></span>
                      )}
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab('profile')}
                      className="w-10 h-10 bg-[#2F66F6]/10 border border-[#2F66F6]/20 rounded-2xl flex items-center justify-center hover:scale-105 transition-all cursor-pointer shadow-sm"
                    >
                      <User className="w-4 h-4 text-[#2F66F6]" />
                    </button>
                  </div>

                  {/* Right Side: Logo & Portal Title */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <h1 className="text-xs font-black text-[#17212B]">بوابة المؤمن له</h1>
                      <p className="text-[8px] text-[#667788] font-bold">شريكك لحماية ما يهمك</p>
                    </div>
                    <div className="w-10 h-10 bg-[#2F66F6]/10 text-[#2F66F6] rounded-2xl flex items-center justify-center border border-[#2F66F6]/20 shadow-sm">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Welcome Card & Policies Counter */}
                <div className="pt-2">
                  <h2 className="text-base font-black text-[#17212B]">مرحباً، {firstName}</h2>
                  <p className="text-[10px] text-[#667788] font-bold mt-1">
                    لديك <span className="text-[#2F66F6] font-extrabold">{activePoliciesCount}</span> بوالص فعالة وسارية
                  </p>
                </div>

                {/* 2. Smart Alert Card */}
                {closestExpiring && (
                  <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden">
                    {/* Decorative Background Accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#2F66F6]/5 rounded-bl-full -mr-6 -mt-6 pointer-events-none"></div>

                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Decorative Visual Graphic (Calendar & Shield Check mockup as requested) */}
                      <div className="shrink-0 relative w-16 h-16 bg-[#2F66F6]/5 border border-[#2F66F6]/10 rounded-2xl flex items-center justify-center">
                        {getPolicyDetails(closestExpiring.policy).isVehicle ? (
                          <Car className="w-7 h-7 text-[#2F66F6]" />
                        ) : getPolicyDetails(closestExpiring.policy).isProperty ? (
                          <Home className="w-7 h-7 text-[#2F66F6]" />
                        ) : (
                          <ShieldCheck className="w-7 h-7 text-[#2F66F6]" />
                        )}
                        <span className="absolute -bottom-1.5 -right-1.5 bg-[#E6B84A] text-[#17212B] font-extrabold text-[9px] px-1.5 py-0.5 rounded-lg border border-white">
                          {closestExpiring.days}ي
                        </span>
                      </div>

                      {/* Right: Text Information */}
                      <div className="flex-1 space-y-1">
                        <span className="px-2.5 py-0.5 bg-[#E6B84A]/10 text-[#E6B84A] text-[9px] font-black rounded-lg inline-block border border-[#E6B84A]/20">
                          تنبيه مهم
                        </span>
                        <h4 className="text-xs font-black text-[#17212B] leading-relaxed">
                          بوليصة {getPolicyDetails(closestExpiring.policy).title} تنتهي بعد {closestExpiring.days} يوماً
                        </h4>
                        <p className="text-[9px] text-[#667788] leading-relaxed">
                          تجديد بوليستك يضمن استمرارية التغطية التأمينية وتجنب أي غرامات مرورية أو انقطاع.
                        </p>
                      </div>
                    </div>

                    {/* Action button */}
                    <button
                      onClick={() => {
                        setSelectedPolicyForAction(closestExpiring.policy);
                        setActiveModal('renew');
                      }}
                      className="w-full py-2.5 bg-[#2F66F6] hover:bg-[#2F66F6]/90 text-white font-black text-[10px] rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <span>طلب تجديد</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* 3. Summary Cards (Grid of 3) */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Card 1: البوالص الفعالة */}
                  <button 
                    onClick={() => setActiveTab('policies')}
                    className="bg-white border border-[#E2E8F0] p-3 rounded-2xl flex flex-col justify-between h-24 text-right shadow-sm hover:border-[#2F66F6]/40 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="w-7 h-7 bg-[#18B77A]/10 text-[#18B77A] rounded-xl flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <ChevronLeft className="w-3.5 h-3.5 text-[#667788]" />
                    </div>
                    <div>
                      <span className="text-lg font-black text-[#17212B] block leading-none">{activePoliciesCount}</span>
                      <span className="text-[8px] font-bold text-[#667788] mt-1 block">بوالص سارية</span>
                    </div>
                  </button>

                  {/* Card 2: الدفعات القريبة */}
                  <button 
                    onClick={() => setActiveTab('payments')}
                    className="bg-white border border-[#E2E8F0] p-3 rounded-2xl flex flex-col justify-between h-24 text-right shadow-sm hover:border-[#2F66F6]/40 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="w-7 h-7 bg-[#E6B84A]/10 text-[#E6B84A] rounded-xl flex items-center justify-center">
                        <CreditCard className="w-3.5 h-3.5" />
                      </div>
                      <ChevronLeft className="w-3.5 h-3.5 text-[#667788]" />
                    </div>
                    <div>
                      <span className="text-lg font-black text-[#17212B] block leading-none">—</span>
                      <span className="text-[8px] font-bold text-[#667788] mt-1 block">الدفعات القريبة</span>
                    </div>
                  </button>

                  {/* Card 3: المطالبات */}
                  <button 
                    onClick={() => setActiveTab('claims')}
                    className="bg-white border border-[#E2E8F0] p-3 rounded-2xl flex flex-col justify-between h-24 text-right shadow-sm hover:border-[#2F66F6]/40 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="w-7 h-7 bg-purple-500/10 text-purple-600 rounded-xl flex items-center justify-center">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <ChevronLeft className="w-3.5 h-3.5 text-[#667788]" />
                    </div>
                    <div>
                      <span className="text-lg font-black text-[#17212B] block leading-none">—</span>
                      <span className="text-[8px] font-bold text-[#667788] mt-1 block">المطالبات</span>
                    </div>
                  </button>
                </div>

                {/* 4. My Policies Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-[#17212B]">بوالصي</h3>
                    <button 
                      onClick={() => setActiveTab('policies')}
                      className="text-[10px] font-black text-[#2F66F6] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>عرض الكل</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {policies.length === 0 ? (
                    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 text-center text-xs text-[#667788]">
                      لا توجد بوالص تأمين نشطة حالياً.
                    </div>
                  ) : (
                    policies.slice(0, 3).map((policy) => {
                      const details = getPolicyDetails(policy);
                      return (
                        <div 
                          key={policy.id} 
                          className="bg-white border border-[#E2E8F0] rounded-3xl p-4.5 shadow-sm space-y-4 hover:border-[#2F66F6]/30 transition-all"
                        >
                          <div className="flex items-start justify-between gap-4">
                            {/* Visual Logo Block */}
                            <div className="w-14 h-14 bg-[#2F66F6]/5 border border-[#2F66F6]/10 rounded-2xl flex items-center justify-center shrink-0">
                              {details.isVehicle ? (
                                <Car className="w-6 h-6 text-[#2F66F6]" />
                              ) : details.isProperty ? (
                                <Home className="w-6 h-6 text-[#2F66F6]" />
                              ) : (
                                <Shield className="w-6 h-6 text-[#2F66F6]" />
                              )}
                            </div>

                            {/* Details Information */}
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-black text-[#17212B]">{details.title}</h4>
                                <span className="px-2 py-0.5 bg-[#18B77A]/10 text-[#18B77A] border border-[#18B77A]/10 text-[8px] font-black rounded-md">
                                  سارية
                                </span>
                              </div>
                              <p className="text-[10px] text-[#667788] font-bold">{details.assetDesc}</p>
                              <p className="text-[9px] text-[#7C8791] font-mono">رقم البوليصة: {policy.policyNumber}</p>
                            </div>
                          </div>

                          {/* Split Details Divider */}
                          <div className="pt-3 border-t border-[#E2E8F0]/70 grid grid-cols-2 gap-2 text-[10px] leading-relaxed">
                            <div>
                              <span className="text-[8px] text-[#667788] block">تاريخ الانتهاء</span>
                              <span className="font-bold text-[#17212B]">{formatArabicDate(policy.endDate)}</span>
                            </div>
                            <div>
                              <span className="text-[8px] text-[#667788] block">نوع التغطية</span>
                              <span className="font-bold text-[#17212B]">{policy.coverageType || "شامل"}</span>
                            </div>
                          </div>

                          {/* View details button */}
                          <button
                            onClick={() => setActiveTab('policies')}
                            className="w-full py-2 bg-[#F5F7FA] hover:bg-slate-100 text-[#17212B] font-black text-[9px] rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer border border-[#E2E8F0]"
                          >
                            <span>عرض التفاصيل</span>
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* 5. Quick Services Section */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-black text-[#17212B]">خدمات سريعة</h3>
                  <div className="grid grid-cols-4 gap-2">
                    <button 
                      onClick={() => {
                        setSelectedPolicyForAction(policies[0] || null);
                        setActiveModal('renew');
                      }}
                      className="bg-white border border-[#E2E8F0] p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 hover:border-[#2F66F6]/40 hover:bg-slate-50 transition-all cursor-pointer text-center shadow-sm"
                    >
                      <div className="w-9 h-9 bg-[#2F66F6]/5 text-[#2F66F6] rounded-xl flex items-center justify-center">
                        <RefreshCw className="w-4 h-4" />
                      </div>
                      <span className="text-[8px] font-black text-[#17212B] whitespace-nowrap">طلب تجديد</span>
                    </button>

                    <button 
                      onClick={() => {
                        setSelectedPolicyForAction(policies[0] || null);
                        setActiveModal('certificate');
                      }}
                      className="bg-white border border-[#E2E8F0] p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 hover:border-[#2F66F6]/40 hover:bg-slate-50 transition-all cursor-pointer text-center shadow-sm"
                    >
                      <div className="w-9 h-9 bg-[#2F66F6]/5 text-[#2F66F6] rounded-xl flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-[8px] font-black text-[#17212B] whitespace-nowrap">نسخة البوليصة</span>
                    </button>

                    <button 
                      onClick={() => {
                        setSelectedPolicyForAction(policies[0] || null);
                        setActiveModal('certificate');
                      }}
                      className="bg-white border border-[#E2E8F0] p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 hover:border-[#2F66F6]/40 hover:bg-slate-50 transition-all cursor-pointer text-center shadow-sm"
                    >
                      <div className="w-9 h-9 bg-[#2F66F6]/5 text-[#2F66F6] rounded-xl flex items-center justify-center">
                        <Award className="w-4 h-4" />
                      </div>
                      <span className="text-[8px] font-black text-[#17212B] whitespace-nowrap">الشهادات</span>
                    </button>

                    <button 
                      onClick={() => setActiveModal('contact')}
                      className="bg-white border border-[#E2E8F0] p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 hover:border-[#2F66F6]/40 hover:bg-slate-50 transition-all cursor-pointer text-center shadow-sm"
                    >
                      <div className="w-9 h-9 bg-[#2F66F6]/5 text-[#2F66F6] rounded-xl flex items-center justify-center">
                        <Headphones className="w-4 h-4" />
                      </div>
                      <span className="text-[8px] font-black text-[#17212B] whitespace-nowrap">تواصل معنا</span>
                    </button>
                  </div>
                </div>

                {/* 6. Next Payment Area */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-black text-[#17212B]">الدفعة القادمة</h3>
                  <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 text-center shadow-sm text-xs text-[#667788] leading-relaxed">
                    <CreditCard className="w-8 h-8 text-[#AAB2BA] mx-auto mb-2" />
                    <span>لا تتوفر بيانات دفعات حالياً</span>
                  </div>
                </div>

                {/* 7. Claims Summary Area */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-black text-[#17212B]">المطالبات</h3>
                  <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 text-center shadow-sm text-xs text-[#667788] leading-relaxed">
                    <Activity className="w-8 h-8 text-[#AAB2BA] mx-auto mb-2" />
                    <span>لا توجد مطالبات حالياً</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: ALL POLICIES */}
            {activeTab === 'policies' && (
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                  <h3 className="text-xs font-black text-[#17212B]">قائمة البوالص والوثائق الخاصة بك</h3>
                  <span className="text-[10px] bg-[#2F66F6]/10 text-[#2F66F6] px-2.5 py-0.5 rounded-lg font-black font-mono">
                    {policies.length} وثائق
                  </span>
                </div>

                {policies.length === 0 ? (
                  <div className="bg-white border border-[#E2E8F0] rounded-3xl p-10 text-center text-[#667788] text-xs space-y-2">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                    <p>لا توجد بوالص تأمين معتمدة مرتبطة بحسابك الرقمي حالياً.</p>
                  </div>
                ) : (
                  policies.map((policy) => {
                    const details = getPolicyDetails(policy);
                    return (
                      <div 
                        key={policy.id} 
                        className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-sm space-y-4 hover:border-[#2F66F6]/40 transition-all"
                      >
                        {/* Policy Header */}
                        <div className="flex items-start justify-between gap-4">
                          <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black ${
                            policy.status === 'ACTIVE' 
                              ? 'bg-[#18B77A]/10 text-[#18B77A]' 
                              : 'bg-yellow-500/10 text-yellow-500'
                          }`}>
                            {policy.status === 'ACTIVE' ? 'نشطة وسارية' : 'موقوفة مؤقتاً'}
                          </span>
                          
                          <div className="text-right">
                            <h5 className="font-black text-xs text-[#17212B]">{details.title}</h5>
                            <span className="text-[9px] text-[#667788] font-mono mt-0.5 block">{policy.policyNumber}</span>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="pt-3 border-t border-[#E2E8F0]/70 grid grid-cols-2 gap-3 text-[10px] leading-relaxed">
                          <div>
                            <span className="text-[8px] text-[#667788] block">تاريخ بداية التغطية</span>
                            <span className="font-bold text-[#17212B]">{formatArabicDate(policy.startDate)}</span>
                          </div>

                          <div>
                            <span className="text-[8px] text-[#667788] block">تاريخ انتهاء التغطية</span>
                            <span className="font-bold text-[#17212B]">{formatArabicDate(policy.endDate)}</span>
                          </div>

                          {policy.premiumAmount && (
                            <div className="col-span-2 pt-1">
                              <span className="text-[8px] text-[#667788] block font-bold">القسط التأميني السنوي</span>
                              <span className="font-black text-xs text-[#2F66F6]">
                                {policy.premiumAmount.toLocaleString('en-US')} {policy.currency === 'ILS' || !policy.currency ? 'شيكل (ILS)' : policy.currency}
                              </span>
                            </div>
                          )}

                          {policy.asset && (
                            <div className="col-span-2 pt-2 bg-slate-50 p-3 rounded-2xl border border-[#E2E8F0]">
                              <span className="text-[8px] text-[#667788] block font-black mb-1">تفاصيل الأصل المؤمن عليه:</span>
                              <p className="font-bold text-[#17212B]">{details.assetDesc}</p>
                              {policy.asset.vehicle && (
                                <div className="mt-1.5 grid grid-cols-2 gap-1 text-[9px] text-[#667788]">
                                  <div>لوحة المركبة: <span className="font-mono font-bold text-[#17212B]">{policy.asset.vehicle.plateNumber}</span></div>
                                  <div>بلد الترخيص: <span className="font-bold text-[#17212B]">{policy.asset.vehicle.plateCountry || "السعودية"}</span></div>
                                  {policy.asset.vehicle.chassisNumber && (
                                    <div className="col-span-2">الهيكل: <span className="font-mono text-[#17212B]">{policy.asset.vehicle.chassisNumber}</span></div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Source System */}
                        <div className="flex justify-end pt-1">
                          <span className="text-[8px] bg-slate-100 text-[#667788] font-mono px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                            النظام المصدر: {policy.sourceSystem || "الأمانة العامة"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB CONTENT 3: PAYMENTS */}
            {activeTab === 'payments' && (
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                  <h3 className="text-xs font-black text-[#17212B]">الفواتير والدفعات المستحقة</h3>
                </div>

                {paymentsList.length === 0 ? (
                  <div className="bg-white border border-[#E2E8F0] rounded-3xl p-10 text-center shadow-sm text-xs text-[#667788] leading-relaxed space-y-2">
                    <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="font-bold text-[#17212B]">لا توجد دفعات مستحقة حالياً.</p>
                  </div>
                ) : (
                  paymentsList.map((p) => (
                    <div key={p.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm space-y-2 text-xs">
                      <div className="flex justify-between font-black text-[#17212B]">
                        <span>المبلغ: {p.amount} {p.currency || 'ILS'}</span>
                        <span className="text-[#18B77A]">{p.status}</span>
                      </div>
                      <div className="text-[10px] text-[#667788]">التاريخ: {p.date}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT 4: CLAIMS */}
            {activeTab === 'claims' && (
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                  <h3 className="text-xs font-black text-[#17212B]">سجل المطالبات والحوادث</h3>
                </div>

                {claimsList.length === 0 ? (
                  <div className="bg-white border border-[#E2E8F0] rounded-3xl p-10 text-center shadow-sm text-xs text-[#667788] leading-relaxed space-y-2">
                    <Activity className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="font-bold text-[#17212B]">لا توجد مطالبات حالياً.</p>
                  </div>
                ) : (
                  claimsList.map((c) => (
                    <div key={c.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm space-y-2 text-xs">
                      <div className="flex justify-between font-black text-[#17212B]">
                        <span>رقم المطالبة: {c.claimNumber}</span>
                        <span className="text-[#2F66F6]">{c.status}</span>
                      </div>
                      <div className="text-[10px] text-[#667788] space-y-1">
                        <div>التاريخ: {c.timestamp ? formatArabicDate(c.timestamp.slice(0, 10)) : '-'}</div>
                        <div>نوع المطالبة: {c.accidentType}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT 5: MY ACCOUNT & PROFILE */}
            {activeTab === 'profile' && (
              <div className="p-4 space-y-5">
                <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-black text-[#17212B] border-b border-[#E2E8F0] pb-2">بيانات المؤمن له الشخصية</h4>
                  
                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-[#F5F7FA]">
                      <span className="font-bold text-[#17212B]">{profile.fullName}</span>
                      <span className="text-[#667788]">الاسم الكامل:</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-[#F5F7FA]">
                      <span className="font-mono font-bold text-[#17212B]">{profile.nationalId || profile.companyRegistrationNumber || '-'}</span>
                      <span className="text-[#667788]">الهوية الوطنية / السجل المدني:</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-[#F5F7FA]">
                      <span className="font-mono font-bold text-[#17212B]">{profile.mobile || '-'}</span>
                      <span className="text-[#667788]">رقم الجوال المسجّل:</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-[#F5F7FA]">
                      <span className="font-bold text-[#17212B]">{profile.email || '-'}</span>
                      <span className="text-[#667788]">البريد الإلكتروني:</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-[#F5F7FA]">
                      <span className="font-bold text-[#17212B]">{profile.city || '-'} ({profile.governorate || '-'})</span>
                      <span className="text-[#667788]">المدينة والمنطقة:</span>
                    </div>

                    <div className="flex justify-between items-start py-1">
                      <span className="font-bold text-[#17212B] text-left max-w-[200px] leading-relaxed">{profile.address || '-'}</span>
                      <span className="text-[#667788]">العنوان الوطني:</span>
                    </div>
                  </div>
                </div>

                {/* Secure Session ID Card */}
                <div className="p-4 bg-slate-100 border border-[#E2E8F0] rounded-3xl space-y-1 text-[10px] text-[#667788]">
                  <div>رقم تسجيل الدخول الموحد للعميل:</div>
                  <div className="font-mono font-black text-[#17212B]">{profile.customerNumber}</div>
                </div>

                {/* Secure logout button */}
                <button
                  onClick={handleLogout}
                  className="w-full py-3 bg-[#E5484D]/10 text-[#E5484D] hover:bg-[#E5484D]/20 rounded-2xl transition-all flex items-center justify-center gap-1.5 text-xs font-black cursor-pointer border border-[#E5484D]/20 shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل خروج آمن من البوابة</span>
                </button>
              </div>
            )}

            {/* ACTIVE SERVICE MODALS OVERLAYS */}
            {activeModal !== 'none' && (
              <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 w-full max-w-sm shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  
                  {/* Modal 1: Renewal Request */}
                  {activeModal === 'renew' && (
                    <>
                      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                        <h3 className="text-xs font-black text-[#17212B]">طلب تجديد وثيقة التأمين</h3>
                        <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-slate-600 font-bold text-xs">✕</button>
                      </div>
                      <div className="space-y-3 text-xs">
                        <div>
                          <span className="text-[10px] text-[#667788] block mb-1">اختر البوليصة المراد تجديدها:</span>
                          <select 
                            value={selectedPolicyForAction?.id || ''}
                            onChange={(e) => {
                              const found = policies.find(p => p.id === e.target.value);
                              if (found) setSelectedPolicyForAction(found);
                            }}
                            className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-slate-50 text-xs font-bold text-[#17212B] focus:outline-none focus:border-[#2F66F6]"
                          >
                            {policies.map(p => (
                              <option key={p.id} value={p.id}>{getPolicyDetails(p).title} ({p.policyNumber})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#667788] block mb-1">ملاحظات إضافية للتجديد (اختياري):</span>
                          <textarea
                            value={modalInputNotes}
                            onChange={(e) => setModalInputNotes(e.target.value)}
                            placeholder="أي تعديلات مطلوبة على التغطية أو البيانات..."
                            className="w-full p-3 rounded-xl border border-[#E2E8F0] bg-slate-50 text-xs text-[#17212B] focus:outline-none focus:border-[#2F66F6] h-20 resize-none"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => setActiveModal('none')}
                            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#17212B] font-black rounded-xl text-xs transition-all cursor-pointer"
                          >
                            إلغاء
                          </button>
                          <button
                            disabled={loading}
                            onClick={() => handleRequestRenewal(selectedPolicyForAction?.id || policies[0]?.id)}
                            className="flex-1 py-2.5 bg-[#2F66F6] hover:bg-[#2F66F6]/90 text-white font-black rounded-xl text-xs transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                          >
                            {loading ? <span>جاري الإرسال...</span> : <span>إرسال الطلب</span>}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Modal 2: Certificate & Policy Copy */}
                  {activeModal === 'certificate' && (
                    <>
                      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                        <h3 className="text-xs font-black text-[#17212B]">شهادة التأمين الرقمية الرسمية</h3>
                        <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-slate-600 font-bold text-xs">✕</button>
                      </div>
                      <div className="space-y-4 text-xs">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-[#E2E8F0] space-y-2 text-center">
                          <div className="w-12 h-12 bg-[#2F66F6]/10 text-[#2F66F6] rounded-2xl flex items-center justify-center mx-auto">
                            <Shield className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-black text-xs text-[#17212B]">{selectedPolicyForAction ? getPolicyDetails(selectedPolicyForAction).title : 'وثيقة تأمين معتمدة'}</h4>
                            <span className="text-[9px] text-[#667788] font-mono">{selectedPolicyForAction?.policyNumber || 'PL-9920192'}</span>
                          </div>
                          <div className="pt-2 border-t border-[#E2E8F0] text-[10px] text-right space-y-1">
                            <div>المؤمن له: <span className="font-bold text-[#17212B]">{profile.fullName}</span></div>
                            <div>رقم الهوية: <span className="font-mono font-bold text-[#17212B]">{profile.nationalId || profile.customerNumber}</span></div>
                            <div>التغطية سارية حتى: <span className="font-bold text-[#18B77A]">{selectedPolicyForAction ? formatArabicDate(selectedPolicyForAction.endDate) : '2027/01/01'}</span></div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => setActiveModal('none')}
                            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#17212B] font-black rounded-xl text-xs transition-all cursor-pointer"
                          >
                            إغلاق
                          </button>
                          <button
                            onClick={() => triggerToast("تم تجهيز نسخة الشهادة الرسمية للتحميل بنجاح")}
                            className="flex-1 py-2.5 bg-[#18B77A] hover:bg-[#18B77A]/90 text-white font-black rounded-xl text-xs transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                          >
                            <FileText className="w-4 h-4" />
                            <span>تحميل الشهادة (PDF)</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Modal 3: Contact / Support */}
                  {activeModal === 'contact' && (
                    <>
                      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                        <h3 className="text-xs font-black text-[#17212B]">تواصل معنا</h3>
                        <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-slate-600 font-bold text-xs">✕</button>
                      </div>
                      <div className="space-y-3 text-xs">
                        <p className="text-[10px] text-[#667788]">يمكنك التواصل مع فريق الدعم عبر القنوات الرسمية:</p>
                        
                        <a href="tel:+97022968888" className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-2xl flex items-center gap-3 hover:border-[#2F66F6] transition-all">
                          <div className="w-8 h-8 bg-[#2F66F6]/10 text-[#2F66F6] rounded-xl flex items-center justify-center">
                            <PhoneCall className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-[#17212B]">الاتصال الهاتفي المباشر</div>
                            <div className="text-[10px] text-[#667788] font-mono">+970 2 296 8888</div>
                          </div>
                        </a>

                        <a href="https://wa.me/970590000000" target="_blank" rel="noreferrer" className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-2xl flex items-center gap-3 hover:border-[#18B77A] transition-all">
                          <div className="w-8 h-8 bg-[#18B77A]/10 text-[#18B77A] rounded-xl flex items-center justify-center">
                            <MessageCircle className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-[#17212B]">خدمة الواتساب</div>
                            <div className="text-[10px] text-[#667788] font-mono">+970 59 000 0000</div>
                          </div>
                        </a>

                        <a href="mailto:support@palcom.online" className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-2xl flex items-center gap-3 hover:border-purple-500 transition-all">
                          <div className="w-8 h-8 bg-purple-500/10 text-purple-600 rounded-xl flex items-center justify-center">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-[#17212B]">البريد الإلكتروني للدعم</div>
                            <div className="text-[10px] text-[#667788] font-mono">support@palcom.online</div>
                          </div>
                        </a>
                      </div>
                    </>
                  )}

                  {/* Modal 4: Notifications */}
                  {activeModal === 'notifications' && (
                    <>
                      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                        <h3 className="text-xs font-black text-[#17212B]">التنبيهات والإشعارات</h3>
                        <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-slate-600 font-bold text-xs">✕</button>
                      </div>
                      <div className="space-y-3 text-xs max-h-60 overflow-y-auto">
                        {notificationsList.length === 0 ? (
                          <p className="text-center text-[#667788] py-4">لا توجد تنبيهات جديدة.</p>
                        ) : (
                          notificationsList.map(n => (
                            <div key={n.id} className="p-3 bg-slate-50 rounded-xl border border-[#E2E8F0] space-y-1">
                              <div className="font-bold text-[#17212B]">{n.title}</div>
                              <p className="text-[10px] text-[#667788]">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}

                </div>
              </div>
            )}

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E2E8F0] px-3 py-2 flex items-center justify-around shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
              {/* Tab 1: الرئيسية */}
              <button 
                onClick={() => setActiveTab('home')}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 transition-all cursor-pointer relative ${
                  activeTab === 'home' ? 'text-[#2F66F6]' : 'text-[#667788]'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="text-[9px] font-black">الرئيسية</span>
                {activeTab === 'home' && (
                  <span className="w-1 h-1 bg-[#2F66F6] rounded-full absolute bottom-0.5"></span>
                )}
              </button>

              {/* Tab 2: بوالصي */}
              <button 
                onClick={() => setActiveTab('policies')}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 transition-all cursor-pointer relative ${
                  activeTab === 'policies' ? 'text-[#2F66F6]' : 'text-[#667788]'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="text-[9px] font-black">بوالصي</span>
                {activeTab === 'policies' && (
                  <span className="w-1 h-1 bg-[#2F66F6] rounded-full absolute bottom-0.5"></span>
                )}
              </button>

              {/* Tab 3: الدفعات */}
              <button 
                onClick={() => setActiveTab('payments')}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 transition-all cursor-pointer relative ${
                  activeTab === 'payments' ? 'text-[#2F66F6]' : 'text-[#667788]'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-[9px] font-black">الدفعات</span>
                {activeTab === 'payments' && (
                  <span className="w-1 h-1 bg-[#2F66F6] rounded-full absolute bottom-0.5"></span>
                )}
              </button>

              {/* Tab 4: المطالبات */}
              <button 
                onClick={() => setActiveTab('claims')}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 transition-all cursor-pointer relative ${
                  activeTab === 'claims' ? 'text-[#2F66F6]' : 'text-[#667788]'
                }`}
              >
                <Activity className="w-5 h-5" />
                <span className="text-[9px] font-black">المطالبات</span>
                {activeTab === 'claims' && (
                  <span className="w-1 h-1 bg-[#2F66F6] rounded-full absolute bottom-0.5"></span>
                )}
              </button>

              {/* Tab 5: حسابي */}
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 transition-all cursor-pointer relative ${
                  activeTab === 'profile' ? 'text-[#2F66F6]' : 'text-[#667788]'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="text-[9px] font-black">حسابي</span>
                {activeTab === 'profile' && (
                  <span className="w-1 h-1 bg-[#2F66F6] rounded-full absolute bottom-0.5"></span>
                )}
              </button>
            </nav>

          </div>
        )}

      </div>
    </div>
  );
}
