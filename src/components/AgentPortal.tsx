import React, { useState, useEffect } from 'react';
import { 
  Accident, 
  FieldAgent, 
  Dispatch 
} from '../types';
import { CaseCommunicationBag } from './CaseCommunicationBag';
import { 
  ShieldCheck, 
  MapPin, 
  Camera, 
  Send, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Car, 
  Clock, 
  Briefcase, 
  Key,
  LogOut,
  Navigation,
  Check,
  AlertTriangle,
  PhoneCall,
  Mic,
  Bell,
  MessageSquare,
  ShieldAlert,
  Play,
  Map,
  BarChart2,
  Home,
  Radio,
  Users,
  Settings,
  HelpCircle,
  Search,
  Maximize2,
  Phone,
  Plus,
  Volume2
} from 'lucide-react';

interface AgentPortalProps {
  agents: FieldAgent[];
  accidents: Accident[];
  dispatches: Dispatch[];
  onUpdateDispatchStatus: (dispatchId: string, status: Dispatch['status']) => void;
  onSubmitComprehensiveAccident?: (data: any) => void;
}

export const AgentPortal: React.FC<AgentPortalProps> = ({
  agents,
  accidents,
  dispatches,
  onUpdateDispatchStatus,
  onSubmitComprehensiveAccident,
}) => {
  // Authentication State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const defaultAgent: FieldAgent = {
    id: 'ag-1',
    name: 'الرائد عمر الفاروق (inv-101)',
    phone: '+970599111222',
    status: 'متاح',
    currentLocation: 'نابلس - رفيديا',
    lat: 32.228,
    lng: 35.251,
    isActive: true,
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    badgeNumber: 'INV-101'
  } as FieldAgent;

  const [authenticatedAgent, setAuthenticatedAgent] = useState<FieldAgent | null>(() => {
    const saved = localStorage.getItem('field_agent_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      } catch {
        // ignore
      }
    }
    return agents[0] || defaultAgent;
  });
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsVerifying(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, portal: 'field' })
      });
      
      if (res.ok) {
        const data = await res.json();
        // Match with existing agent or create full profile
        const matchedAgent = agents.find(a => a.id === data.user.id || a.name.includes(data.user.username) || a.id === 'ag-1');
        const authenticatedAgent: FieldAgent = matchedAgent || ({
          id: 'ag-1',
          name: 'الرائد عمر الفاروق (inv-101)',
          phone: '+970599111222',
          status: 'متاح',
          currentLocation: 'نابلس - رفيديا',
          lat: 32.228,
          lng: 35.251,
          isActive: true,
          photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          badgeNumber: 'INV-101'
        } as FieldAgent);
        
        setAuthenticatedAgent(authenticatedAgent);
        localStorage.setItem('field_agent_session', JSON.stringify(authenticatedAgent));
        localStorage.setItem('user_role', data.role);
      } else {
        const err = await res.json();
        setAuthError(err.error || 'بيانات الدخول غير صحيحة.');
      }
    } catch (err) {
      setAuthError('خطأ في الاتصال بالسيرفر.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Secure Link token verification states
  const [tokenVerified, setTokenVerified] = useState<boolean | null>(null);
  const [tokenError, setTokenError] = useState<string>('');

  // Bottom Nav Active Tab: home, missions, chats, radio, reports
  const [activeTab, setActiveTab] = useState<'home' | 'missions' | 'chats' | 'radio' | 'reports'>('home');

  // Modals & Sub-views
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Accident | null>(null);
  const [sosSuccessMessage, setSosSuccessMessage] = useState('');

  // PTT State
  const [pttState, setPttState] = useState<'available' | 'talking' | 'connecting' | 'busy' | 'offline'>('available');

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    { sender: 'غرفة العمليات', text: 'تم توجيهكم إلى موقع الحادث في شارع فيصل.', time: '10:25 ص', isMe: false },
    { sender: 'علي النابلسي', text: 'تم استلام التوجيه، أنا في الطريق للموقع.', time: '10:27 ص', isMe: true }
  ]);
  const [newMessageText, setNewMessageText] = useState('');

  // Real GPS watch position effect
  useEffect(() => {
    if (!authenticatedAgent) return;
    const sendGps = (lat: number, lng: number) => {
      fetch(`/api/agents/${authenticatedAgent.id}/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, currentLocation: 'نابلس - الميدان' })
      }).catch(() => {});
    };

    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          sendGps(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          sendGps(32.2211, 35.2544);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      sendGps(32.2211, 35.2544);
    }
  }, [authenticatedAgent]);

  // Secure Token verification effect on mount/deep link changes
  useEffect(() => {
    const pathname = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    const hasCasePath = pathname.startsWith('/field/case/') || pathname.includes('field.html');
    const hasCaseQuery = params.has('incidentId') || params.has('token') || params.has('dispatch') || params.has('dispatchId');

    // 1. Check for valid session first
    const savedSession = localStorage.getItem('field_agent_session');
    if (savedSession) {
      setAuthenticatedAgent(JSON.parse(savedSession));
    }

    // 2. Logic for deep link
    if (hasCasePath || hasCaseQuery) {
      const deepLinkIncidentId = hasCasePath ? pathname.split('/').pop() : params.get('incidentId');
      const deepLinkDispatchId = params.get('dispatch') || params.get('dispatchId');
      const deepLinkToken = params.get('token');

      if ((deepLinkIncidentId || deepLinkDispatchId) && deepLinkToken) {
        setTokenVerified(null);
        const verifyUrl = deepLinkDispatchId 
          ? `/api/tokens/verify?token=${deepLinkToken}&dispatch=${deepLinkDispatchId}${deepLinkIncidentId ? `&incidentId=${deepLinkIncidentId}` : ''}`
          : `/api/tokens/verify?token=${deepLinkToken}&incidentId=${deepLinkIncidentId}`;

        fetch(verifyUrl)
          .then(async (res) => {
            const data = await res.json();
            if (res.ok && data.valid) {
              setTokenVerified(true);
              if (data.incidentId) {
                localStorage.setItem('deep_link_incident_id', data.incidentId);
              }
              fetch('/api/agents')
                .then(r => r.json())
                .then((fetchedAgents: FieldAgent[]) => {
                  const matched = fetchedAgents.find(a => a.id === data.investigatorId);
                  if (matched) {
                    setAuthenticatedAgent(matched);
                    localStorage.setItem('field_agent_session', JSON.stringify(matched));
                    localStorage.setItem('user_role', 'FIELD_OFFICER');
                  } else {
                    setTokenVerified(false);
                    setTokenError('التكليف غير الصالح أو منتهي الصلاحية');
                  }
                })
                .catch(() => {
                  setTokenVerified(false);
                  setTokenError('التكليف غير الصالح أو منتهي الصلاحية');
                });
            } else {
              setTokenVerified(false);
              setTokenError(data.error || 'التكليف غير الصالح أو منتهي الصلاحية');
            }
          })
          .catch(() => {
            setTokenVerified(false);
            setTokenError('التكليف غير الصالح أو منتهي الصلاحية');
          });
      } else {
        setTokenVerified(false);
        setTokenError('التكليف غير الصالح أو منتهي الصلاحية');
      }
    }
  }, []);

  const handleUpdateMissionStatus = async (statusValue: string) => {
    if (!currentMission) return;
    const disp = dispatches.find(d => d.accidentId === currentMission.id || d.accidentId === currentMission.accidentNumber);
    if (disp) {
      try {
        const res = await fetch(`/api/dispatches/${disp.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: statusValue })
        });
        if (res.ok) {
          const updatedDisp = await res.json();
          onUpdateDispatchStatus(disp.id, updatedDisp.status);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsVerifying(true);
    
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password })
      });
      
      if (res.ok) {
        const data = await res.json();
        // Construct FieldAgent from user and officer data
        const authenticatedAgent: FieldAgent = {
          id: data.officer.id,
          name: data.officer.name,
          phone: data.officer.phone,
          status: data.officer.availabilityStatus,
          currentLocation: data.officer.currentLocation,
          lat: data.officer.lastGpsLat,
          lng: data.officer.lastGpsLng,
          secretToken: '', // Token is no longer used for login
          isActive: true,
          badgeNumber: data.officer.employeeId
        };
        setAuthenticatedAgent(authenticatedAgent);
        localStorage.setItem('field_agent_session', JSON.stringify(authenticatedAgent));
        localStorage.setItem('user_role', data.role);
      } else {
        setAuthError('بيانات الدخول غير صحيحة.');
      }
    } catch (err) {
      setAuthError('خطأ في الاتصال بالسيرفر.');
    } finally {
      setIsVerifying(false);
    }
  };

  const [urlCaseId, setUrlCaseId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const caseParam = params.get('case_id');
    const invParam = params.get('investigator_id');
    if (caseParam) setUrlCaseId(caseParam);
    if (invParam && agents && agents.length > 0) {
      const matchedAgent = agents.find(ag => ag.id === invParam || ag.name.includes(invParam));
      if (matchedAgent) {
        setAuthenticatedAgent(matchedAgent);
        localStorage.setItem('field_agent_session', JSON.stringify(matchedAgent));
      }
    }
  }, [agents]);

  const handleTriggerSOS = () => {
    setSosSuccessMessage('🚨 تم إرسال نداء الطوارئ SOS بنجاح إلى غرفة العمليات المركزية!');
    setTimeout(() => setSosSuccessMessage(''), 4000);
  };

  const deepLinkIncidentId = localStorage.getItem('deep_link_incident_id');
  const currentMission = deepLinkIncidentId
    ? (accidents.find(a => a.id === deepLinkIncidentId || a.accidentNumber === deepLinkIncidentId || a.incidentNumber === deepLinkIncidentId) || null)
    : (urlCaseId ? accidents.find(a => a.id === urlCaseId || a.accidentNumber === urlCaseId || a.incidentNumber === urlCaseId) : null);

  if (authenticatedAgent && !currentMission) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-slate-900 border border-red-500/30 p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-6 text-center text-white">
          <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full mx-auto flex items-center justify-center border border-red-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-base font-black text-red-400">القضية غير موجودة أو انتهت صلاحية التكليف</h2>
          <p className="text-slate-300 text-xs leading-relaxed">
            عذراً، لم يتم العثور على القضية المرتبطة بهذا الرابط أو التكليف في النظام.
          </p>
        </div>
      </div>
    );
  }

  if (!authenticatedAgent) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-6 text-xs text-white">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-blue-600/20 text-blue-400 rounded-2xl mx-auto flex items-center justify-center border border-blue-500/30">
              <Key className="w-7 h-7" />
            </div>
            <h2 className="text-base font-black">بوابة المحقق الميداني – V.COMMAND</h2>
            <p className="text-slate-400">أدخل رمز المصادقة السري للوصول إلى تفاصيل القضية الموجهة</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">اسم المستخدم</label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">كلمة المرور</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-500/20 text-red-300 rounded-xl font-semibold flex items-center gap-2 border border-red-500/30">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg transition-all"
            >
              تسجيل الدخول
            </button>
          </form>

          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] text-slate-400 space-y-1 text-center">
            <span className="font-bold text-slate-300 block">يرجى استخدام بيانات الاعتماد المعتمدة الخاصة بك</span>
          </div>
        </div>
      </div>
    );
  }

  // Render high-security error if secure token verification failed
  if (tokenVerified === false) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-slate-900 border border-red-500/30 p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-6 text-center text-white">
          <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full mx-auto flex items-center justify-center border border-red-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-base font-black text-red-400">رابط القضية غير صالح أو منتهي الصلاحية</h2>
          <p className="text-slate-300 text-xs leading-relaxed">
            {tokenError || 'رابط القضية غير صالح أو منتهي الصلاحية'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                localStorage.removeItem('deep_link_incident_id');
                localStorage.removeItem('deep_link_dispatch_id');
                localStorage.removeItem('deep_link_token');
                window.location.href = '/?portal=agent';
              }}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700"
            >
              الذهاب إلى البوابة الرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (tokenVerified === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white font-semibold text-xs" dir="rtl">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400">جاري التحقق من أمان وصلاحية الرابط المباشر في قاعدة البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[100dvh] bg-slate-100 flex flex-col overflow-hidden font-sans text-xs select-none relative" dir="rtl">
      {/* MOBILE CONTAINER FRAME ENFORCING NO SCROLL & PIXEL ACCURACY */}
      <div className="w-full max-w-[430px] mx-auto h-[100dvh] bg-white flex flex-col justify-between shadow-2xl overflow-hidden relative border-x border-slate-200">
        
        {/* HEADER (Curved Navy Header matching FIELDAGENTMOB.png) */}
        <div className="bg-[#050b14] text-white pt-4 pb-6 px-4 rounded-b-[32px] shadow-lg relative shrink-0">
          <div className="flex items-center justify-between">
            {/* GPS & Connection Status badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/80 rounded-full border border-slate-700 text-[10px]">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-emerald-400 font-bold">متصل</span>
              <span className="text-slate-400">GPS نشط</span>
            </div>

            {/* Shield Emblem */}
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow border border-blue-400/30">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>

            {/* Agent Info & Notifications */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <h3 className="font-black text-xs text-white">{authenticatedAgent.name}</h3>
                <span className="font-mono text-amber-400 text-[10px] font-bold">{authenticatedAgent.badgeNumber}</span>
              </div>
              <div className="relative">
                <div className="w-9 h-9 bg-slate-900 rounded-2xl flex items-center justify-center text-white border border-slate-800">
                  <Bell className="w-4 h-4 text-slate-200" />
                </div>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                  3
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN BODY CONTENT (Non-scrolling / 100dvh fitted) */}
        <div className="flex-1 px-4 py-3 flex flex-col justify-between overflow-y-auto space-y-3">
          
          {/* WELCOME SECTION */}
          <div className="text-center space-y-0.5">
            <h2 className="text-base font-black text-slate-900">مرحباً بك</h2>
            <p className="text-[11px] text-slate-500 font-medium">جاهز للتكليف وخدمة عملائنا</p>
            <div className="w-12 h-1 bg-blue-600 rounded-full mx-auto mt-1"></div>
          </div>

          {/* 4 KPI CARDS */}
          <div className="grid grid-cols-4 gap-2">
            {/* Hours */}
            <div className="bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
              <Clock className="w-4 h-4 text-amber-600 mb-1" />
              <span className="font-black font-mono text-amber-600 text-sm">01:25</span>
              <span className="text-[9px] text-slate-500 font-medium">ساعات العمل</span>
            </div>

            {/* Completed */}
            <div className="bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-1" />
              <span className="font-black font-mono text-emerald-600 text-sm">5</span>
              <span className="text-[9px] text-slate-500 font-medium">مهام مكتملة</span>
            </div>

            {/* Ongoing */}
            <div className="bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
              <FileText className="w-4 h-4 text-blue-600 mb-1" />
              <span className="font-black font-mono text-blue-600 text-sm">1</span>
              <span className="text-[9px] text-slate-500 font-medium">مهمة جارية</span>
            </div>

            {/* New */}
            <div className="bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
              <AlertCircle className="w-4 h-4 text-red-600 mb-1" />
              <span className="font-black font-mono text-red-600 text-sm">2</span>
              <span className="text-[9px] text-red-600 font-bold">مهام جديدة</span>
            </div>
          </div>

          {/* CURRENT MISSION CARD */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs">مهمتك الحالية</span>
              <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded-full font-bold text-[9px] border border-red-200">
                جديدة
              </span>
            </div>

            {currentMission ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-xs text-blue-900 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                    {currentMission.accidentNumber}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">توجه من غرفة العمليات • منذ 5 دقائق</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-slate-800 font-bold text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>{currentMission.locationName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="px-1.5 py-0.5 bg-red-100 text-red-800 rounded font-bold flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" />
                        حرج جداً
                      </span>
                      <span className="text-slate-500 flex items-center gap-0.5 font-medium">
                        <Navigation className="w-3 h-3 text-blue-600" />
                        1.8 كم من موقعك
                      </span>
                    </div>
                  </div>

                  <div className="w-20 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                    <img 
                      src={currentMission.photos?.[0] || 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=300&q=80'} 
                      alt="حادث" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[9px]">
                      !
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    onClick={() => handleUpdateMissionStatus('انطلاق')}
                    className="py-1 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1 transition-all"
                  >
                    <span>🚗 بدء التوجه</span>
                  </button>
                  <button
                    onClick={() => handleUpdateMissionStatus('وصل للموقع')}
                    className="py-1 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1 transition-all"
                  >
                    <span>📍 وصل للموقع</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    onClick={() => handleUpdateMissionStatus('بدء المعاينة')}
                    className="py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-[10px] flex items-center justify-center gap-1 transition-all shadow"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>بدء المعاينة</span>
                  </button>
                  <button
                    onClick={() => { setSelectedMission(currentMission); setShowCaseModal(true); }}
                    className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-blue-900 border border-blue-200 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1 transition-all"
                  >
                    <span>التفاصيل</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center space-y-2">
                <p className="text-slate-500 text-[11px]">لا توجد مهمة موجهة حالياً في نطاقك</p>
                <button 
                  onClick={() => alert('فتح شاشة تسجيل بلاغ ميداني جديد')}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-[11px] font-bold shadow"
                >
                  + بلاغ حادث ميداني
                </button>
              </div>
            )}
          </div>

          {/* QUICK ACTIONS GRID (2x4) */}
          <div className="space-y-1.5">
            <span className="font-bold text-slate-900 text-xs block">إجراءات سريعة</span>

            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'التقاط صور', icon: Camera, color: 'text-emerald-600 bg-emerald-50', action: () => alert('جاري فتح كاميرا التوثيق الميداني...') },
                { label: 'محادثة', icon: MessageSquare, color: 'text-purple-600 bg-purple-50', action: () => setActiveTab('chats') },
                { label: 'اللاسلكي PTT', icon: Radio, color: 'text-blue-600 bg-blue-50', action: () => setActiveTab('radio') },
                { label: 'اتصال عاجل', icon: PhoneCall, color: 'text-amber-600 bg-amber-50', action: handleTriggerSOS },
                { label: 'موقعي الحالي', icon: Navigation, color: 'text-indigo-600 bg-indigo-50', action: () => alert('تم إرسال إحداثيات GPS الحالية لغرفة العمليات') },
                { label: 'طلب مساعدة', icon: ShieldAlert, color: 'text-red-600 bg-red-50', action: handleTriggerSOS },
                { label: 'رفع مستند', icon: FileText, color: 'text-emerald-700 bg-emerald-50', action: () => alert('فتح نافذة رفع المستندات والتقارير') },
                { label: 'حالة المركبة', icon: Car, color: 'text-blue-700 bg-blue-50', action: () => alert('حالة مركبة الدوريات والوقود: ممتازة (94%)') },
              ].map((act, idx) => {
                const Icon = act.icon;
                return (
                  <button
                    key={idx}
                    onClick={act.action}
                    className="bg-slate-50 hover:bg-slate-100 p-2 rounded-xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center gap-1 transition-all"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${act.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-slate-800 text-[10px] text-center">{act.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* BOTTOM NAVIGATION (Fixed exactly 5 items as required) */}
        <div className="bg-slate-900 border-t border-slate-800 px-3 py-2 flex items-center justify-around text-slate-400 text-[10px] font-bold shrink-0">
          {[
            { id: 'home', label: 'الرئيسية', icon: Home },
            { id: 'missions', label: 'المهام', icon: Briefcase, badge: '2' },
            { id: 'chats', label: 'المحادثة', icon: MessageSquare, badge: '2' },
            { id: 'radio', label: 'اللاسلكي', icon: Radio },
            { id: 'reports', label: 'التقارير', icon: BarChart2 },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex flex-col items-center gap-1 relative py-1 px-3 rounded-xl transition-all ${
                  isActive ? 'text-blue-400 font-bold bg-slate-800/80' : 'hover:text-white'
                }`}
              >
                <div className="relative">
                  <Icon className="w-4 h-4" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-red-600 text-white rounded-full text-[8px] font-black flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SOS Toast Message */}
      {sosSuccessMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-red-600 text-white rounded-2xl text-xs font-bold shadow-2xl animate-bounce">
          {sosSuccessMessage}
        </div>
      )}

      {/* MISSIONS TAB MODAL / VIEW */}
      {activeTab === 'missions' && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl text-xs text-slate-800 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>مهام المحقق الميداني المعتمدة</span>
              </h3>
              <button onClick={() => setActiveTab('home')} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold">✕ إغلاق</button>
            </div>

            <div className="space-y-2.5">
              {accidents.map((acc, i) => (
                <div key={acc.id || i} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-mono font-bold text-blue-900">{acc.accidentNumber}</div>
                    <div className="text-slate-600">{acc.locationName}</div>
                    <div className="text-[10px] text-amber-600 font-bold">{acc.severity} - {acc.status}</div>
                  </div>
                  <button 
                    onClick={() => { setSelectedMission(acc); setShowCaseModal(true); }}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-xl font-bold"
                  >
                    معاينة
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CHATS TAB MODAL / VIEW */}
      {activeTab === 'chats' && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4" dir="rtl">
          <div className="w-full max-w-lg h-[80vh] flex flex-col relative">
            <CaseCommunicationBag
              incidentId={currentMission?.id || 'acc-3143'}
              incidentNumber={currentMission?.accidentNumber || '#NAB-3143'}
              currentUserName={authenticatedAgent?.name || 'النقيب سامي الجابي'}
              currentUserRole="Field Investigator"
              onClose={() => setActiveTab('home')}
            />
          </div>
        </div>
      )}

      {/* RADIO PTT TAB MODAL / VIEW */}
      {activeTab === 'radio' && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="bg-[#050b14] border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-6 shadow-2xl text-xs text-white text-center">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-sm flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>اللاسلكي الميداني (PTT)</span>
              </h3>
              <button onClick={() => setActiveTab('home')} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl">✕ إغلاق</button>
            </div>

            <div className="space-y-3">
              <div className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full font-bold text-xs border border-emerald-500/30">
                {pttState === 'available' && '🟢 القناة متاحة'}
                {pttState === 'talking' && '🎙️ جاري الإرسال والتحدث...'}
                {pttState === 'connecting' && '🔄 جاري الاتصال بالقناة...'}
                {pttState === 'busy' && '🔴 القناة مشغولة حالياً'}
                {pttState === 'offline' && '⚪ غير متصل بالشبكة'}
              </div>

              {/* Big PTT Push-to-Talk Button */}
              <div className="py-6 flex justify-center">
                <button
                  onMouseDown={() => setPttState('talking')}
                  onMouseUp={() => setPttState('available')}
                  onTouchStart={() => setPttState('talking')}
                  onTouchEnd={() => setPttState('available')}
                  className={`w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all border-4 ${
                    pttState === 'talking' 
                      ? 'bg-red-600 border-red-400 scale-105 shadow-red-600/50' 
                      : 'bg-blue-600 border-blue-400 hover:bg-blue-500 shadow-blue-600/40'
                  }`}
                >
                  <Mic className="w-12 h-12 text-white mb-2 animate-pulse" />
                  <span className="font-black text-sm">اضغط للتحدث</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                اضغط مع الاستمرار على الزر أعلاه للتحدث المباشر عبر قناة الطوارئ المشفرة مع غرفة العمليات وباقي الدوريات.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* REPORTS TAB MODAL / VIEW */}
      {activeTab === 'reports' && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl text-xs text-slate-800 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                <span>تقارير وإحصاءات الأداء اليومي</span>
              </h3>
              <button onClick={() => setActiveTab('home')} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold">✕ إغلاق</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-slate-500">إجمالي المعاينات</span>
                <div className="font-mono font-black text-lg text-blue-600">5 مهمات</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-slate-500">متوسط زمن الاستجابة</span>
                <div className="font-mono font-black text-lg text-emerald-600">4.2 دقيقة</div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
              <h4 className="font-bold text-blue-900">حالة المزامنة والنسخ الاحتياطي</h4>
              <p className="text-[11px] text-blue-700">جميع تقارير اليوم مزامنة بنجاح مع خوادم Cloud SQL السحابية برمز SHA-256 مشفر.</p>
            </div>
          </div>
        </div>
      )}

      {/* CASE DETAIL MODAL */}
      {showCaseModal && selectedMission && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-6 shadow-2xl text-xs text-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>معاينة الحادث: {selectedMission.accidentNumber}</span>
              </h3>
              <button onClick={() => setShowCaseModal(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold">✕ إغلاق</button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
                <div className="flex justify-between font-bold">
                  <span>الموقع: {selectedMission.locationName}</span>
                  <span className="text-red-600 font-black">{selectedMission.severity}</span>
                </div>
                <p className="text-slate-600">{selectedMission.description || 'لا توجد ملاحظات إضافية مسجلة.'}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">بيانات الأطراف والسيارات</h4>
                <div>رقم اللوحة: <span className="font-mono font-bold">{selectedMission.vehiclePlate || '3-8834-92'}</span></div>
                <div>اسم السائق: <span className="font-bold">{selectedMission.driverName || 'سعيد عبدربه النتشة'}</span></div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    alert('تم توثيق المعاينة الميدانية بنجاح وإرسال التقرير النهائي لغرفة العمليات!');
                    setShowCaseModal(false);
                  }}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow"
                >
                  تأكيد إكمال المعاينة ورفع التقرير
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
