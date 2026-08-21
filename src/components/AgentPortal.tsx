import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  Accident, 
  FieldAgent, 
  Dispatch 
} from '../types';
import { TrustLogo } from "./TrustLogo";
import { CaseCommunicationBag } from './CaseCommunicationBag';
import { InvestigationWorkflowModal } from './investigation/InvestigationWorkflowModal';
import { VehicleQrScannerModal } from './qr/VehicleQrScannerModal';
import { radioAudio } from '../lib/radioAudio';
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
  Volume2,
  ChevronDown,
  ChevronLeft,
  Shield,
  User,
  Lock,
  Eye,
  EyeOff,
  Fingerprint,
  Wifi,
  Battery,
  Signal,
  X,
  ClipboardList,
  Sparkles,
  QrCode,
  Upload
} from 'lucide-react';

interface AgentPortalProps {
  accidents: Accident[];
  dispatches: Dispatch[];
  onUpdateDispatchStatus: (dispatchId: string, status: Dispatch['status']) => void;
  onSubmitComprehensiveAccident?: (data: any) => void;
  onLogout?: () => void;
}

const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
};

const safeSetItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {}
};

const safeRemoveItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (e) {}
};

const sanitizeInvestigatorId = (raw: string | null): string | null => {
  if (!raw) return null;
  let val = raw;
  if (val.includes('http')) {
    val = val.split('http')[0];
  }
  const match = val.match(/emp-\d+/i);
  return match ? match[0] : val.trim();
};

const sanitizeCaseId = (raw: string | null): string | null => {
  if (!raw) return null;
  let val = raw;
  if (val.includes('http')) {
    val = val.split('http')[0];
  }
  const match = val.match(/CLM-\d{4}-\d+/i);
  return match ? match[0] : val.trim();
};

export const AgentPortal: React.FC<AgentPortalProps> = ({
  accidents,
  dispatches,
  onUpdateDispatchStatus,
  onSubmitComprehensiveAccident,
  onLogout,
}) => {
  // Authentication State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Profile Photo Updates (Camera Capture / Device File)
  const [portalCameraActive, setPortalCameraActive] = useState(false);
  const [portalStream, setPortalStream] = useState<MediaStream | null>(null);
  const portalVideoRef = useRef<HTMLVideoElement | null>(null);

  const startPortalCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setPortalStream(stream);
      setPortalCameraActive(true);
      setTimeout(() => {
        if (portalVideoRef.current) portalVideoRef.current.srcObject = stream;
      }, 100);
    } catch (e) {
      alert('تعذر فتح الكاميرا، يرجى تفعيل الصلاحية');
    }
  };

  const capturePortalPhoto = async () => {
    if (portalVideoRef.current && portalStream) {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(portalVideoRef.current, 0, 0, 300, 300);
        const dataUrl = canvas.toDataURL('image/jpeg');
        await updateAgentPhoto(dataUrl);
      }
      stopPortalCamera();
    }
  };

  const stopPortalCamera = () => {
    if (portalStream) {
      portalStream.getTracks().forEach(track => track.stop());
      setPortalStream(null);
    }
    setPortalCameraActive(false);
  };

  const handlePortalPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        await updateAgentPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateAgentPhoto = async (photoBase64: string) => {
    if (!authenticatedAgent) return;
    try {
      const res = await fetch(`/api/investigators/${authenticatedAgent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo: photoBase64 })
      });
      if (res.ok) {
        const updated = { ...authenticatedAgent, photo: photoBase64 };
        setAuthenticatedAgent(updated);
        safeSetItem('field_agent_session', JSON.stringify(updated));
        showToast('📸 تم تحديث صورتك التعريفية بنجاح!');
      } else {
        showToast('فشل في حفظ الصورة بالخادم');
      }
    } catch (err) {
      console.error(err);
      showToast('خطأ أثناء تحديث الصورة');
    }
  };

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (portalStream) {
        portalStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [portalStream]);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };
  const [biometricModal, setBiometricModal] = useState(false);
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);

  const [authenticatedAgent, setAuthenticatedAgent] = useState<FieldAgent | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const rawInvId = params.get('investigator_id') || params.get('agent_id') || params.get('agentId') || safeGetItem('deep_link_investigator_id');
      const urlInvId = sanitizeInvestigatorId(rawInvId);
      if (urlInvId) {
        // Construct seamless object from deep link immediately on first frame
        return {
          id: urlInvId,
          name: urlInvId === 'emp-1787022544825' ? 'أحمد النبلسي' : (urlInvId.startsWith('ag-') || urlInvId.startsWith('EXP-') || urlInvId.startsWith('emp-') ? `المحقق الميداني` : urlInvId),
          phone: '+970599123456',
          status: 'في مهمة',
          currentLocation: 'نابلس - شارع رفيديا',
          lat: 32.2211,
          lng: 35.2544,
          secretToken: urlInvId,
          isActive: true,
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
        };
      }
    }
    const saved = safeGetItem('field_agent_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.name && !parsed.name.includes('عمر الفاروق') && parsed.id !== 'inv-101') {
          return parsed;
        }
      } catch {
        // ignore
      }
    }
    // Default seamless field investigator for direct view
    return {
      id: 'emp-1787022544825',
      name: 'غير منسّب',
      phone: '+970599123456',
      status: 'في مهمة',
      currentLocation: 'نابلس - شارع رفيديا',
      lat: 32.2211,
      lng: 35.2544,
      secretToken: 'emp-1787022544825',
      isActive: true,
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    };
  });
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Sync agent name to local storage for audio playback filtering
  useEffect(() => {
    if (authenticatedAgent && authenticatedAgent.name) {
      try {
        localStorage.setItem('agent_name', authenticatedAgent.name);
      } catch (e) {}
    } else {
      try {
        localStorage.removeItem('agent_name');
      } catch (e) {}
    }
  }, [authenticatedAgent]);

  // Synchronize authenticated agent & login enforcement logic
  useEffect(() => {
    const fetchAgent = async (id: string) => {
      try {
        const res = await fetch(`/api/agents/${id}`);
        if (res.ok) {
          return await res.json();
        }
        return null;
      } catch (err) {
        console.error("Failed to fetch agent:", err);
        return null;
      }
    };

    const initializeAgent = async () => {
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const rawInvId = params?.get('investigator_id') || params?.get('agent_id') || params?.get('agentId') || safeGetItem('deep_link_investigator_id');
      const urlInvId = sanitizeInvestigatorId(rawInvId);

      let targetAgent = null;
      if (urlInvId) {
        targetAgent = await fetchAgent(urlInvId);
      }

      if (urlInvId && !targetAgent) {
        // Create seamless authenticated session from the deep link parameter
        targetAgent = {
          id: urlInvId,
          name: urlInvId === 'emp-1787022544825' ? 'أحمد النبلسي' : (urlInvId.startsWith('ag-') || urlInvId.startsWith('EXP-') || urlInvId.startsWith('emp-') ? `المحقق الميداني` : urlInvId),
          phone: '+970599123456',
          status: 'في مهمة',
          currentLocation: 'نابلس - شارع رفيديا',
          lat: 32.2211,
          lng: 35.2544,
          secretToken: urlInvId,
          isActive: true,
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
        };
      } else if (!urlInvId) {
        targetAgent = null;
      }

      // If Admin has NOT enforced login (requireLogin is false or not set), open directly!
      if (targetAgent && !targetAgent.requireLogin) {
        setAuthenticatedAgent(targetAgent);
        safeSetItem('field_agent_session', JSON.stringify(targetAgent));
        return;
      }

      // If requireLogin IS enforced by Admin, check for stored valid session
      const saved = safeGetItem('field_agent_session');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.id && !parsed.name?.includes('عمر الفاروق') && parsed.id !== 'inv-101') {
            const match = await fetchAgent(parsed.id);
            if (match) {
              setAuthenticatedAgent(match);
              return;
            }
          }
        } catch {}
      }

      // Otherwise, require explicit login
      setAuthenticatedAgent(null);
    };
    
    initializeAgent();
  }, []);

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
        
        let matchedAgent = null;
        if (data.user?.id) {
          try {
            const agentRes = await fetch(`/api/agents/${data.user.id}`);
            if (agentRes.ok) {
              matchedAgent = await agentRes.json();
            }
          } catch (e) {
            console.error("Failed to fetch full agent details:", e);
          }
        }

        if (matchedAgent) {
          setAuthenticatedAgent(matchedAgent);
          if (rememberMe) {
            safeSetItem('field_agent_session', JSON.stringify(matchedAgent));
          }
          safeSetItem('user_role', data.role || 'FIELD_OFFICER');
        } else {
          setAuthError('تعذر جلب بيانات المحقق من الخادم.');
        }
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

  const handleTriggerBiometric = () => {
    setBiometricModal(true);
    setBiometricScanning(true);
    setBiometricSuccess(false);

    setTimeout(() => {
      setBiometricScanning(false);
      setBiometricSuccess(true);
      setTimeout(() => {
        setBiometricModal(false);
        // Biometric is only a visual simulator in this template. We cannot login without a user context.
        // Usually, biometric would decrypt a stored token and re-authenticate.
        setAuthError('تسجيل الدخول بالبصمة غير مدعوم في هذا الجهاز بدون حساب مسبق.');
      }, 900);
    }, 1500);
  };

  const handlePerformLogout = () => {
    safeRemoveItem('field_agent_session');
    setAuthenticatedAgent(null);
    if (onLogout) {
      onLogout();
    }
  };

  // Secure Link token verification states
  const [tokenVerified, setTokenVerified] = useState<boolean | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('token')) return null; // Needs async check
    }
    return true;
  });
  const [tokenError, setTokenError] = useState<string>('');

  // Bottom Nav Active Tab: home, missions, chats, radio, reports
  const [activeTab, setActiveTab] = useState<'home' | 'missions' | 'chats' | 'radio' | 'reports'>('home');
  const [bagInitialTab, setBagInitialTab] = useState<'chat' | 'radio' | 'camera'>('chat');

  // Modals & Sub-views
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Accident | null>(null);
  const [sosSuccessMessage, setSosSuccessMessage] = useState('');
  const [showInvestigationWorkflow, setShowInvestigationWorkflow] = useState(false);

  // PTT State
  const [pttState, setPttState] = useState<'available' | 'talking' | 'connecting' | 'busy' | 'offline'>('available');

  // Dynamic Unread Messages & Notification Toast
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(1);
  const [incomingMessageBanner, setIncomingMessageBanner] = useState<{
    id?: string;
    sender: string;
    text: string;
    incidentNumber?: string;
  } | null>(null);

  // Real-time message listener with sound notification
  useEffect(() => {
    const socket = io();

    socket.on('case:new_message', (msg: any) => {
      const sender = msg.sender || msg.senderName || 'غرفة العمليات';
      if (sender !== (authenticatedAgent?.name || 'المحقق الميداني')) {
        // 1. Play crisp 3-tone notification sound
        radioAudio.playMessageNotification();

        // 2. Increment unread counter if not currently in chat
        setUnreadMessagesCount(prev => prev + 1);

        // 3. Show top floating notification banner
        const textPreview = msg.contentType === 'voice' || msg.contentType === 'ptt_broadcast'
          ? '🎤 رسالة صوتية جديدة'
          : msg.contentType === 'image'
          ? '📷 صورة تم إرسالها'
          : (msg.content || 'لديك رسالة جديدة');

        setIncomingMessageBanner({
          id: msg.id || String(Date.now()),
          sender,
          text: textPreview,
          incidentNumber: msg.incidentId || 'قضية ميدانية'
        });

        // Auto dismiss banner after 6 seconds
        setTimeout(() => {
          setIncomingMessageBanner(null);
        }, 6000);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [authenticatedAgent?.name]);

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    { sender: 'غرفة العمليات', text: 'تم توجيهكم إلى موقع الحادث في شارع فيصل.', time: '10:25 ص', isMe: false },
    { sender: 'علي النابلسي', text: 'تم استلام التوجيه، أنا في الطريق للموقع.', time: '10:27 ص', isMe: true }
  ]);
  const [newMessageText, setNewMessageText] = useState('');

const MOBILE_SAFE_MODE = true;

  // Real GPS watch position effect
  useEffect(() => {
    if (MOBILE_SAFE_MODE) return;
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
    const hasToken = params.has('token');
    const rawInvId = params.get('investigator_id') || params.get('agent_id') || params.get('agentId') || safeGetItem('deep_link_investigator_id');
    const urlInvId = sanitizeInvestigatorId(rawInvId);

    // 1. Resolve agent from URL parameter first, then from saved session
    if (urlInvId) {
      // In isolated mode, we don't have the agents list. We just assume the URL ID is valid for now, 
      // or rely on the fetch we do in useEffect below.
      // For immediate optimistic UI, we set a temp agent.
      const match = null; // We can't synchronously find it without the list
      if (match) {
        setAuthenticatedAgent(match);
        safeSetItem('field_agent_session', JSON.stringify(match));
        safeSetItem('user_role', 'FIELD_OFFICER');
      } else {
        const tempAgent = {
          id: urlInvId,
          name: urlInvId === 'emp-1787022544825' ? 'أحمد النبلسي' : `المحقق الميداني`,
          phone: '+970599123456',
          status: 'في مهمة',
          currentLocation: 'نابلس - شارع رفيديا',
          lat: 32.2211,
          lng: 35.2544,
          secretToken: urlInvId,
          isActive: true,
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
        };
        setAuthenticatedAgent(tempAgent);
        safeSetItem('field_agent_session', JSON.stringify(tempAgent));
        safeSetItem('user_role', 'FIELD_OFFICER');
      }
    } else {
      const savedSession = safeGetItem('field_agent_session');
      if (savedSession) {
        try {
          setAuthenticatedAgent(JSON.parse(savedSession));
        } catch {}
      }
    }

    // 2. Logic for deep link token verification
    if (hasToken) {
      const deepLinkIncidentId = hasCasePath ? pathname.split('/').pop() : params.get('incidentId');
      const deepLinkDispatchId = params.get('dispatch') || params.get('dispatchId');
      const deepLinkToken = params.get('token');

      if (deepLinkToken) {
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
                safeSetItem('deep_link_incident_id', data.incidentId);
              }
              if (data.investigatorId) {
                fetch(`/api/agents/${data.investigatorId}`)
                  .then(r => r.json())
                  .then((matched: FieldAgent) => {
                    if (matched && matched.id) {
                      setAuthenticatedAgent(matched);
                      safeSetItem('field_agent_session', JSON.stringify(matched));
                      safeSetItem('user_role', 'FIELD_OFFICER');
                    }
                  })
                  .catch(() => {});
              }
            } else {
              setTokenVerified(false);
              setTokenError(data.error || 'التكليف غير الصالح أو منتهي الصلاحية');
            }
          })
          .catch(() => {
            setTokenVerified(false);
            setTokenError('التكليف غير الصالح أو منتهي الصلاحية');
          });
      }
    } else {
      setTokenVerified(true);
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
        safeSetItem('field_agent_session', JSON.stringify(authenticatedAgent));
        safeSetItem('user_role', data.role);
      } else {
        setAuthError('بيانات الدخول غير صحيحة.');
      }
    } catch (err) {
      setAuthError('خطأ في الاتصال بالسيرفر.');
    } finally {
      setIsVerifying(false);
    }
  };

  const [urlCaseId, setUrlCaseId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const rawCase = params.get('case_id') || safeGetItem('deep_link_incident_id');
      return sanitizeCaseId(rawCase);
    }
    return null;
  });

  const deepLinkIncidentId = sanitizeCaseId(safeGetItem('deep_link_incident_id'));
  const targetCaseKey = urlCaseId || deepLinkIncidentId;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const caseParam = sanitizeCaseId(params.get('case_id') || safeGetItem('deep_link_incident_id'));
    if (caseParam) {
      setUrlCaseId(caseParam);
    }
  }, []);

  // Intercept Mobile Back Button (popstate)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      let handled = false;
      
      if (showCaseModal) {
        setShowCaseModal(false);
        handled = true;
      }
      if (showProfileModal) {
        setShowProfileModal(false);
        handled = true;
      }
      if (showForgotModal) {
        setShowForgotModal(false);
        handled = true;
      }
      if (activeTab !== 'home') {
        setActiveTab('home');
        handled = true;
      }

      if (handled) {
        // Push state again so the user remains inside the app on next back click
        try { window.history.pushState({ portal: 'agent_home' }, '', window.location.search || window.location.pathname); } catch (e) {}
      }
    };

    window.addEventListener('popstate', handlePopState);
    // Push initial history state so there's always a state to pop back from
    try { window.history.pushState({ portal: 'agent_home' }, '', window.location.search || window.location.pathname); } catch (e) {}

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [activeTab, showCaseModal, showProfileModal, showForgotModal]);

  const handleTriggerSOS = async () => {
    radioAudio.playSosAlarm();
    setSosSuccessMessage('🚨 تم إرسال نداء الطوارئ SOS بنجاح إلى غرفة العمليات المركزية!');
    
    try {
      const payload = {
        agentId: authenticatedAgent?.id || 'ag-1',
        agentName: authenticatedAgent?.name || 'محقق ميداني',
        locationName: currentMission?.locationName || authenticatedAgent?.currentLocation || 'نابلس - الميدان',
        lat: authenticatedAgent?.lat || 32.2211,
        lng: authenticatedAgent?.lng || 35.2544,
        incidentId: currentMission?.id || 'general'
      };

      await fetch('/api/emergency/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn("SOS API warning:", err);
    }

    setTimeout(() => setSosSuccessMessage(''), 5000);
  };

  // Resolve mission: strictly verify targetCaseKey, authenticatedAgent, and assignment in dispatches
  const currentMission: Accident | null = (() => {
    if (!accidents || accidents.length === 0 || !authenticatedAgent) return null;
    
    if (targetCaseKey) {
      return accidents.find(a => {
        const matchCase = a.id === targetCaseKey || a.accidentNumber === targetCaseKey || a.incidentNumber === targetCaseKey;
        if (!matchCase) return false;
        
        const hasValidDispatch = dispatches?.some(d => 
          (d.accidentId === a.id || d.accidentId === a.accidentNumber || d.accidentId === a.incidentNumber) && 
          d.agentId === authenticatedAgent.id
        );
        return hasValidDispatch;
      }) || null;
    } else {
      // Find the first active dispatch for this agent if no specific case was requested
      const activeDispatch = dispatches?.find(d => d.agentId === authenticatedAgent.id && d.status !== 'مكتمل' && d.status !== 'تم الإلغاء');
      if (activeDispatch) {
         return accidents.find(a => a.id === activeDispatch.accidentId || a.accidentNumber === activeDispatch.accidentId || a.incidentNumber === activeDispatch.accidentId) || null;
      }
      return null;
    }
  })();

  // Safeguard against initial API load state
  if (authenticatedAgent && (!accidents || accidents.length === 0)) {
    return (
      <div className="min-h-screen bg-[#030A16] flex flex-col items-center justify-center p-4" dir="rtl">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-[#315EF5] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[#AAB2BA] text-xs font-bold animate-pulse">جاري تحميل بيانات القضية والمهام الميدانية...</p>
        </div>
      </div>
    );
  }

  if (authenticatedAgent && accidents && accidents.length > 0 && !currentMission && targetCaseKey) {
    return (
      <div className="min-h-screen bg-[#1C2229] flex items-center justify-center p-4" dir="rtl">
        <div className="bg-[#2A323A] border border-[#D64545]/40 p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-6 text-center text-[#F1F5F9]">
          <div className="w-16 h-16 bg-[#D64545]/20 text-[#D64545] rounded-full mx-auto flex items-center justify-center border border-[#D64545]/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-base font-black text-[#D64545]">القضية غير موجودة أو انتهت صلاحية التكليف</h2>
          <p className="text-[#AAB2BA] text-xs leading-relaxed">
            عذراً، لم يتم العثور على القضية المرتبطة بهذا الرابط أو التكليف في النظام.
          </p>
        </div>
      </div>
    );
  }

  if (!authenticatedAgent) {
    return (
      <div className="min-h-screen bg-[#070B0E] flex flex-col items-center justify-center p-4 relative overflow-hidden" dir="rtl">
        {/* Futuristic Grid and Radar backgrounds */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.08] bg-[radial-gradient(#06b6d4_1.5px,transparent_1.5px)] [background-size:24px_24px] z-0"></div>
        <div className="absolute w-[500px] h-[500px] rounded-full border border-cyan-500/10 -top-40 -left-40 pointer-events-none z-0"></div>
        <div className="absolute w-[600px] h-[600px] rounded-full border border-teal-500/5 -bottom-40 -right-40 pointer-events-none z-0"></div>

        {/* Decorative Floating Badges */}
        <div className="absolute top-20 right-[10%] opacity-20 hidden md:block z-0">
          <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <span className="text-[10px] text-cyan-300 font-mono">GPS ACTIVE</span>
          </div>
        </div>
        <div className="absolute bottom-24 left-[10%] opacity-20 hidden md:block z-0">
          <div className="p-3 bg-teal-950/40 border border-teal-500/30 rounded-2xl flex items-center gap-2">
            <Car className="w-5 h-5 text-teal-400" />
            <span className="text-[10px] text-teal-300 font-mono">V.TRACK ON</span>
          </div>
        </div>

        {/* Outer Mobile Mockup Frame */}
        <div className="w-full max-w-sm bg-[#0E151B] border border-slate-800 rounded-[36px] shadow-2xl overflow-hidden relative z-10 flex flex-col min-h-[780px] justify-between">
          
          {/* Top Mobile Status Bar */}
          {/* Core Body Content */}
          <div className="p-6 flex-1 flex flex-col justify-center space-y-6">
            <div className="text-center space-y-3">
              {/* Header Section with Double Glowing Shield Logo */}
              <div className="flex justify-center mb-6 mt-6">
                 <TrustLogo size="lg" isAlive={true} glowColor="orange" variant="icon" />
              </div>
              <div>
                <h1 className="text-white text-[22px] font-black tracking-tight">نظام معاينة الحوادث</h1>
                <h2 className="text-cyan-400 text-xs font-black tracking-widest uppercase mt-0.5">تطبيق الوكيل الميداني</h2>
                <p className="text-slate-400 text-[11px] mt-1 px-3 leading-relaxed">
                  تسجيل الدخول للمتابعة والاستلام الميداني للمهمات وحوادث التأمين الموجهة
                </p>
              </div>
            </div>

            {/* Form Glassmorphic Container */}
            <div className="glass-card rounded-[24px] p-5 space-y-4">
              <div className="text-center space-y-0.5">
                <h3 className="font-black text-white text-sm">تسجيل الدخول</h3>
                <p className="text-[#AAB2BA] text-[10px]">أدخل بيانات حسابك للوصول إلى البوابة</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-3.5">
                {/* Username Input with User Icon */}
                <div className="space-y-1 text-right">
                  <label className="text-xs font-bold text-slate-300 block">اسم المستخدم أو البريد الإلكتروني</label>
                  <div className="relative flex items-center glass-input rounded-xl px-3.5 py-3 transition-all">
                    <User className="w-5 h-5 text-cyan-400 shrink-0" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="اسم المستخدم الخاص بك"
                      className="w-full bg-transparent text-slate-100 font-mono text-xs mr-2.5 outline-none placeholder-slate-600 text-right font-semibold"
                    />
                  </div>
                </div>

                {/* Password Input with Lock Icon and Eye Toggle */}
                <div className="space-y-1 text-right">
                  <label className="text-xs font-bold text-slate-300 block">كلمة المرور</label>
                  <div className="relative flex items-center glass-input rounded-xl px-3.5 py-3 transition-all">
                    <Lock className="w-5 h-5 text-cyan-400 shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="كلمة المرور الخاصة بك"
                      className="w-full bg-transparent text-slate-100 font-mono text-xs mr-2.5 outline-none placeholder-slate-600 text-right font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-500 hover:text-slate-300 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me and Forgot Password row */}
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/20 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>حفظ الجلسة (تذكرني)</span>
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-cyan-400 hover:text-cyan-300 font-black cursor-pointer"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>

                {/* Error Banner */}
                {authError && (
                  <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-[10px] text-rose-300 font-bold flex items-center gap-2 leading-relaxed">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Login Trigger Button with lock icon and cyan gradient */}
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3 bg-gradient-to-l from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  {isVerifying ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-950" />
                  )}
                  <span>تسجيل الدخول الآمن</span>
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-slate-800"></div>
                <span className="text-slate-500 text-[10px] font-bold">أو</span>
                <div className="flex-1 h-px bg-slate-800"></div>
              </div>

              {/* Biometric Login Button */}
              <button
                type="button"
                onClick={handleTriggerBiometric}
                className="w-full py-3 bg-[#070B0E]/60 hover:bg-cyan-950/20 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Fingerprint className="w-4.5 h-4.5 text-cyan-400" />
                <span>تسجيل الدخول بالبصمة البيومترية</span>
              </button>
            </div>

            {/* High-security encryption banner */}
            <div className="bg-[#0A0F13]/90 border border-cyan-500/10 rounded-xl p-3 flex items-center justify-between text-right">
              <div className="space-y-0.5">
                <div className="text-xs font-black text-cyan-400">اتصال آمن ومحمي</div>
                <div className="text-[9px] text-slate-500 leading-normal">جميع بياناتك وحركاتك الميدانية مشفرة محلياً ودولياً</div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
            </div>

          </div>

          {/* Footer App Version */}
          <div className="text-center py-3 text-[9px] text-slate-600 font-mono border-t border-slate-900 bg-[#0A0F13]/50 select-none">
            V.COMMAND INCIDENT OFFICER App v1.0.0
          </div>
        </div>

        {/* High-Tech Biometric Pulse Scanner Modal */}
        {biometricModal && (
          <div className="fixed inset-0 bg-[#070B0E]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
            <div className="bg-[#0E151B] border border-cyan-500/30 rounded-[32px] p-8 max-w-xs w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              <div className="space-y-1">
                <h3 className="text-white font-black text-sm">المصادقة البيومترية</h3>
                <p className="text-slate-400 text-[10px]">ضع إصبعك على مستشعر البصمة للمتابعة</p>
              </div>

              {/* Glowing Fingerprint Area */}
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                {/* Ping/Radar animation */}
                {biometricScanning && (
                  <>
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-ping"></div>
                    <div className="absolute inset-2 rounded-full border-2 border-cyan-400/20 animate-pulse"></div>
                  </>
                )}
                
                <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 border ${
                  biometricSuccess 
                    ? 'bg-emerald-950/40 border-emerald-400/60 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]' 
                    : 'bg-cyan-950/20 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                }`}>
                  <Fingerprint className={`w-10 h-10 ${biometricScanning ? 'animate-pulse' : ''}`} />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                {biometricScanning && (
                  <span className="text-cyan-400 font-bold animate-pulse block">جاري مسح البصمة والمطابقة الحيوية...</span>
                )}
                {biometricSuccess && (
                  <span className="text-emerald-400 font-black block">تمت المصادقة بنجاح! جاري الدخول...</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 bg-[#070B0E]/95 backdrop-blur-md z-50 flex items-center justify-center p-4" dir="rtl">
            <div className="bg-[#0E151B] border border-cyan-500/30 rounded-[30px] p-6 max-w-sm w-full space-y-5 text-right relative">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="absolute top-4 left-4 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="text-white font-black text-sm flex items-center gap-2">
                  <Key className="w-4.5 h-4.5 text-cyan-400" />
                  <span>استعادة بيانات الدخول</span>
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  من أجل سلامة البيانات وحماية القضايا، يتم إدارة وتثبيت كلمات المرور حصرياً من قبل المشرفين في غرفة العمليات المركزية (HQ).
                </p>
              </div>

              <div className="p-3.5 bg-[#121D27] rounded-2xl border border-cyan-500/10 space-y-1.5 text-xs text-slate-300">
                <span className="font-bold text-white text-[11px] block">للإجراء الفوري:</span>
                <p>يرجى التواصل مع غرفة العمليات المركزية لإعادة تعيين كلمة المرور أو إرسال رابط تسجيل دخول مباشر وآمن لجهازك.</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href="tel:+970590000000"
                  className="py-3 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 text-[11px] font-black rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>اتصال بالعمليات</span>
                </a>
                <a
                  href="https://wa.me/970590000000?text=%D8%A3%D9%86%D8%A7%20%D8%A7%D9%84%D9%85%D8%AD%D9%82%D9%82%20%D8%A7%D9%84%D9%85%D9%8A%D8%AF%D8%A7%D9%86%D9%8A%D8%8C%20%D8%A3%D8%B1%D8%AC%D9%88%20%D8%A5%D8%B9%D8%A7%D8%AF%D8%A9%20%D8%AA%D8%B9%D9%8A%D9%8A%D9%86%20%D9%83%D9%84%D9%85%D8%A9%20%D8%A7%D9%84%D9%85%D8%B1%D9%88%D8%B1%20%D9%84%D8%AD%D8%B3%D8%A7%D8%A8%D9%8A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 hover:border-emerald-400 text-emerald-400 text-[11px] font-black rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>دعم WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // Render high-security error if secure token verification failed
  if (tokenVerified === false) {
    return (
      <div className="min-h-screen bg-[#1C2229] flex items-center justify-center p-4" dir="rtl">
        <div className="bg-[#2A323A] border border-[#D64545]/40 p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-6 text-center text-[#F1F5F9]">
          <div className="w-16 h-16 bg-[#D64545]/20 text-[#D64545] rounded-full mx-auto flex items-center justify-center border border-[#D64545]/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-base font-black text-[#D64545]">رابط القضية غير صالح أو منتهي الصلاحية</h2>
          <p className="text-[#AAB2BA] text-xs leading-relaxed">
            {tokenError || 'رابط القضية غير صالح أو منتهي الصلاحية'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                safeRemoveItem('deep_link_incident_id');
                safeRemoveItem('deep_link_dispatch_id');
                safeRemoveItem('deep_link_token');
                window.location.href = '/?portal=agent';
              }}
              className="px-5 py-2.5 bg-[#323A40] hover:bg-[#3A434C] text-[#F1F5F9] text-xs font-semibold rounded-xl border border-[#3A434C]"
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
      <div className="min-h-screen bg-[#1C2229] flex items-center justify-center p-4 text-[#F1F5F9] font-semibold text-xs" dir="rtl">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#315EF5] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[#AAB2BA]">جاري التحقق من أمان وصلاحية الرابط المباشر في قاعدة البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[100dvh] bg-[#F9FAFB] flex flex-col overflow-hidden font-sans text-xs select-none relative text-slate-800" dir="rtl">
      {/* MOBILE CONTAINER FRAME ENFORCING NO SCROLL & PIXEL ACCURACY */}
      <div className="w-full max-w-[430px] mx-auto h-[100dvh] bg-[#F9FAFB] flex flex-col justify-between shadow-2xl overflow-hidden relative border-x border-slate-200">
        
        {/* Floating Real-time Message Notification Banner */}
        {incomingMessageBanner && (
          <div 
            onClick={() => {
              setBagInitialTab('chat');
              setActiveTab('chats');
              setUnreadMessagesCount(0);
              setIncomingMessageBanner(null);
            }}
            className="mx-3 mt-2 p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl border border-blue-400 flex items-center justify-between gap-3 animate-bounce cursor-pointer z-50 shrink-0 transition-all"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="text-right">
                <div className="text-[11px] font-black flex items-center gap-1.5">
                  <span>💬 رسالة جديدة:</span>
                  <span className="text-amber-200">{incomingMessageBanner.sender}</span>
                </div>
                <div className="text-[10px] text-blue-100 line-clamp-1">{incomingMessageBanner.text}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">فتح</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIncomingMessageBanner(null);
                }}
                className="p-1 hover:bg-white/20 rounded-lg text-white/80"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* FIXED UPPER PROFILE SECTION (Now at the absolute top of the app) */}
        <div className="pt-4 pb-3 px-4 bg-white border-b border-slate-100 shadow-sm shrink-0 z-10 flex items-center justify-between">
          {/* Left Side: Consolidated Actions (Notifications, Messages, QR Scan, Logout) */}
          <div className="flex items-center gap-2">
            {/* Logout button */}
            <button 
              onClick={onLogout}
              className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-red-500 transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Scan QR button */}
            <button 
              onClick={() => setShowQrScanner(true)}
              id="AGENT_PORTAL_QR_SCAN_BTN"
              className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
              title="مسح رمز QR المركبة"
            >
              <QrCode className="w-4 h-4" />
            </button>

            {/* Chats button */}
            <button 
              onClick={() => { setBagInitialTab('chat'); setActiveTab('chats'); setUnreadMessagesCount(0); }}
              className="relative w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all"
              title="الرسائل"
            >
              <MessageSquare className="w-4 h-4" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[8px] font-black flex items-center justify-center shadow-sm animate-pulse">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            {/* Notifications button */}
            <button 
              onClick={() => showToast('لا توجد إشعارات جديدة')}
              className="relative w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all"
              title="التنبيهات"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[8px] font-black flex items-center justify-center shadow-sm">
                3
              </span>
            </button>
          </div>

          {/* Right Side: Profile Photo & Details */}
          <div className="flex items-center gap-2.5 text-right">
            <div>
              <div className="flex items-center justify-end gap-1.5">
                <h2 className="text-xs font-black text-slate-950 leading-none">{authenticatedAgent?.name || "غير منسّب"}</h2>
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              </div>
              <div className="flex items-center justify-end gap-1 mt-1 text-[8.5px] text-slate-500 font-bold">
                <span>{(authenticatedAgent as any)?.jobTitle || 'محقق ميداني'}</span>
                <span className="text-slate-300">|</span>
                <span className="font-mono bg-slate-100 text-slate-700 px-1 py-0.2 rounded text-[8px]">
                  #{(authenticatedAgent as any)?.licenseNumber || (authenticatedAgent as any)?.employeeCode || '500'}
                </span>
              </div>
            </div>
            <div 
              onClick={() => setShowProfileModal(true)}
              className="relative w-11 h-11 rounded-full border border-teal-500/40 shadow-sm overflow-hidden cursor-pointer active:scale-95 transition-transform shrink-0 bg-slate-100"
            >
              <img
                  src={authenticatedAgent?.photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"}
                  alt={authenticatedAgent?.name || "غير منسّب"}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        {/* MAIN BODY CONTENT (Fully responsive scrolling to fit any mobile size exactly) */}
        <div className="flex-1 px-4 py-3 flex flex-col justify-start overflow-y-auto scrollbar-thin space-y-3.5 relative z-0">
          
          {/* CURRENT MISSION CARD */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3.5 relative overflow-hidden shrink-0">
            <div className="flex items-center justify-between relative z-10">
              <span className="font-bold text-slate-500 text-xs">مهمتك الحالية</span>
              {currentMission ? (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-[9px] font-black border border-red-100">
                  <AlertTriangle className="w-3 h-3" />
                  عاجلة
                </span>
              ) : null}
            </div>

            {currentMission ? (
              <div className="space-y-3 relative z-10">
                {/* Header Row: Title, ID, and Timer */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <h3 className="text-sm font-black text-slate-800">حادث مروري</h3>
                      <Car className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="mt-1">
                      <span className="text-[9px] text-slate-400 font-bold block">رقم المطالبة</span>
                      <span className="text-sm text-blue-700 font-black tracking-wide block mt-0.5">{currentMission.accidentNumber || currentMission.incidentNumber || currentMission.id}</span>
                    </div>
                  </div>
                  
                  {/* Circular Timer UI */}
                  <div className="relative w-[70px] h-[70px] flex items-center justify-center">
                    <svg className="w-full h-full absolute top-0 left-0 -rotate-90">
                      <circle cx="35" cy="35" r="30" stroke="#E2E8F0" strokeWidth="4" fill="none" />
                      <circle cx="35" cy="35" r="30" stroke="#2563EB" strokeWidth="4" fill="none" strokeDasharray="188" strokeDashoffset="40" strokeLinecap="round" />
                    </svg>
                    <div className="flex flex-col items-center justify-center relative z-10">
                      <span className="text-sm font-black text-slate-900 leading-none">00:28</span>
                      <span className="text-[8px] text-slate-500 font-bold leading-none mt-1">ساعة</span>
                    </div>
                    <span className="absolute -bottom-3.5 text-[8px] text-slate-400 font-bold block whitespace-nowrap bg-white px-1">الوقت المتبقي</span>
                  </div>
                </div>

                {/* Location and Distance Row */}
                <div className="grid grid-cols-2 gap-3 pt-1 border-b border-slate-100 pb-3">
                  <div className="flex items-center justify-end gap-2 text-right">
                    <div>
                      <span className="text-[8px] text-slate-400 font-bold block">الموقع</span>
                      <span className="text-[10px] text-slate-800 font-bold block truncate">{currentMission.locationName || 'نابلس - الدوار'}</span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 text-right border-r border-slate-100 pr-3">
                    <div>
                      <span className="text-[8px] text-slate-400 font-bold block">المسافة التقديرية</span>
                      <span className="text-[10px] text-slate-800 font-bold block truncate">25 كم</span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600"><path d="M4 22h16"/><path d="M10 2l-6 20"/><path d="M14 2l6 20"/><path d="M10.5 8h3"/><path d="M9.5 14h5"/></svg>
                    </div>
                  </div>
                </div>

                {/* Status Bar & Action Button */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      حالة المهمة: تم الاستلام والتعيين
                    </span>
                    <span className="text-slate-400 font-mono text-[9px]">
                      {currentMission.locationName || 'الضفة الغربية'}
                    </span>
                  </div>

                  {/* WAZE NAVIGATION DEEP LINK BUTTON */}
                  <a
                    href={`https://waze.com/ul?ll=${currentMission.lat || 32.2211},${currentMission.lng || 35.2544}&navigate=yes`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-[#FFFCE6] hover:bg-[#FFF8C7] text-[#B28200] border border-[#F2D06B] rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer text-center"
                  >
                    <span>فتح وتوجيه عبر Waze 🚗</span>
                  </a>

                  {/* PRIMARY WORKFLOW ACTION BUTTON */}
                  <button
                    type="button"
                    onClick={() => setShowInvestigationWorkflow(true)}
                    className="w-full py-3 bg-[#315EF5] hover:bg-blue-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/25 active:scale-95 cursor-pointer border border-blue-600"
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span>بدء إجراءات التحقيق</span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                      8 خطوات
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-2">
                <p className="text-slate-500 text-[11px]">لا توجد مهمة موجهة حالياً في نطاقك</p>
              </div>
            )}
          </div>

          {/* LARGE DIRECTIVE ACTION BUTTON */}
          <button
            onClick={() => handleUpdateMissionStatus('انطلاق')}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
          >
            <span>ابدأ التوجه إلى الموقع</span>
            <Send className="w-4.5 h-4.5 fill-current rotate-180" />
          </button>

          {/* QUICK ACTIONS SECTION */}
          <div className="shrink-0 pt-1">
            <div className="grid grid-cols-4 gap-2">
              {[
                { 
                  label: 'الملاحة', 
                  sub: 'إلى الموقع', 
                  icon: Navigation, 
                  color: 'text-blue-500', 
                  action: () => showToast('جاري فتح الخرائط...') 
                },
                { 
                  label: 'الكاميرا', 
                  sub: 'التقاط صور', 
                  icon: Camera, 
                  color: 'text-slate-600', 
                  action: () => { setBagInitialTab('camera'); setActiveTab('camera'); } 
                },
                { 
                  label: 'الاتصال الفوري', 
                  sub: '(PTT)', 
                  icon: Mic, // Walkie Talkie style 
                  color: 'text-orange-500', 
                  action: () => { setBagInitialTab('radio'); setActiveTab('radio'); },
                  isRadio: true
                },
                { 
                  label: 'التواصل', 
                  sub: 'غرفة العمليات', 
                  icon: MessageSquare, 
                  color: 'text-blue-500', 
                  action: () => { setBagInitialTab('chat'); setActiveTab('chats'); } 
                },
              ].map((act, idx) => {
                const Icon = act.icon;
                return (
                  <button
                    key={idx}
                    onClick={act.action}
                    className="bg-white hover:bg-slate-50 p-2.5 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer border border-slate-100 h-full"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-100 ${act.color}`}>
                      {act.isRadio ? (
                        <Radio className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className="font-black text-slate-800 text-[9px] leading-tight block text-center mt-1">{act.label}</span>
                    <span className="text-slate-400 text-[8px] leading-none block text-center">{act.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* INSPECTION PROGRESS TIMELINE */}
          <div className="space-y-1.5 shrink-0 pt-1">
            <span className="font-bold text-slate-500 text-[10px] block text-right pr-1">تقدم المعاينة</span>
            
            {/* Steps Container */}
            <div className="flex items-center justify-between gap-1 overflow-x-auto scrollbar-none py-1">
              {[
                { step: 1, label: 'التفصيل', done: true },
                { step: 2, label: 'المركبات', done: true },
                { step: 3, label: 'الحادث', done: true },
                { step: 4, label: 'المعاينة', active: true },
                { step: 5, label: 'الصور', future: true },
                { step: 6, label: 'البيانات', future: true },
                { step: 7, label: 'التوقيع', future: true },
                { step: 8, label: 'الإرسال', future: true }
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center shrink-0 min-w-[40px] relative">
                  <div className="relative flex items-center justify-center mb-1">
                    {/* Horizontal Connector Line */}
                    {item.step < 8 && (
                      <div className={`absolute right-1/2 translate-x-1/2 w-[42px] h-[1px] top-3.5 -z-10 ${
                        item.done ? 'bg-green-500' : 'bg-slate-200'
                      }`} />
                    )}
                    {/* Step Node Circle */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black transition-all ${
                      item.done 
                        ? 'bg-white border border-green-500 text-green-500 shadow-sm' 
                        : item.active 
                          ? 'bg-blue-600 border border-blue-600 text-white shadow-md' 
                          : 'bg-white border border-slate-200 text-slate-400'
                    }`}>
                      {item.done ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        item.step
                      )}
                    </div>
                  </div>
                  <span className={`text-[7.5px] font-black ${
                    item.active ? 'text-blue-600' : item.done ? 'text-green-500' : 'text-slate-400'
                  }`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* LOCAL SYNC ALERTS BANNER */}
          <div className="bg-teal-50/50 border border-teal-100 p-2.5 rounded-xl flex items-center justify-between shrink-0">
            <button 
              onClick={() => showToast('بدء المزامنة...')}
              className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center hover:bg-teal-200 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <h4 className="text-teal-600 font-black text-[10px]">العمل محلياً</h4>
                <p className="text-[8px] text-teal-600/70 font-bold leading-relaxed mt-0.5">
                  سيتم حفظ جميع البيانات تلقائياً<br/>عند توفر الاتصال
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="M22 10a2 2 0 0 0-2-2h-1"/><path d="M22 10v4.5a4.5 4.5 0 0 1-9 0V10"/></svg>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM NAVIGATION BAR */}
        <div className="bg-white border-t border-slate-200 px-4 py-1.5 flex items-center justify-between text-slate-400 text-[9px] font-bold shrink-0 relative z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] h-16">
          <div className="w-full grid grid-cols-5 items-center relative h-full">
            
            {/* Tab 5: Account (Leftmost) */}
            <button
              onClick={() => setShowProfileModal(true)}
              className={`flex flex-col items-center justify-center gap-1 transition-all h-full ${
                showProfileModal ? 'text-blue-600' : 'hover:text-slate-600'
              }`}
            >
              <User className="w-5 h-5" />
              <span>الحساب</span>
            </button>

            {/* Tab 4: Messages */}
            <button
              onClick={() => { setBagInitialTab('chat'); setActiveTab('chats'); setUnreadMessagesCount(0); }}
              className={`flex flex-col items-center justify-center gap-1 transition-all h-full ${
                activeTab === 'chats' && bagInitialTab === 'chat' ? 'text-blue-600' : 'hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <MessageSquare className="w-5 h-5" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[8px] font-black flex items-center justify-center shadow-sm animate-pulse">
                    {unreadMessagesCount}
                  </span>
                )}
              </div>
              <span>الرسائل</span>
            </button>

            {/* Tab 3: FLOATING CENTER TASKS */}
            <div className="flex items-center justify-center h-full relative -top-6 select-none z-20">
              <button
                onClick={() => setActiveTab('missions')}
                className="w-14 h-14 rounded-full bg-blue-600 text-white flex flex-col items-center justify-center shadow-lg shadow-blue-600/30 border-[5px] border-[#F9FAFB] transition-transform active:scale-95 cursor-pointer"
              >
                <Briefcase className="w-5 h-5 mb-0.5" />
              </button>
            </div>

            {/* Tab 2: Clipboard/Tasks */}
            <button
              onClick={() => setActiveTab('missions')}
              className={`flex flex-col items-center justify-center gap-1 transition-all h-full ${
                activeTab === 'missions' ? 'text-blue-600' : 'hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <FileText className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[8px] font-black flex items-center justify-center shadow-sm">
                  2
                </span>
              </div>
              <span>المهام</span>
            </button>

            {/* Tab 1: Home (Rightmost) */}
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center justify-center gap-1 transition-all h-full ${
                activeTab === 'home' ? 'text-blue-600' : 'hover:text-slate-600'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>الرئيسية</span>
            </button>

          </div>
        </div>
      </div>

      {/* OVERLAYS AND MODALS */}
      {/* Full Screen Mode Switcher based on Tabs */}
      {activeTab !== 'home' && activeTab !== 'profile' && (
        <div className="absolute inset-0 z-50 bg-[#F9FAFB] animate-in slide-in-from-bottom-full duration-300">
          {activeTab === 'chats' || activeTab === 'radio' || activeTab === 'camera' || activeTab === 'missions' ? (
            <CaseCommunicationBag 
              incidentId={currentMission?.id || 'general'}
              incidentNumber={currentMission?.accidentNumber || 'عام'}
              currentUserName={authenticatedAgent?.name || 'محقق'}
              currentUserRole="Field Investigator"
              onClose={() => setActiveTab('home')}
              initialTab={bagInitialTab}
            />
          ) : (
            <div className="w-full h-full flex flex-col p-4 relative" dir="rtl">
              <button 
                onClick={() => setActiveTab('home')}
                className="absolute top-4 left-4 p-2 bg-slate-200 rounded-full hover:bg-slate-300 text-slate-700 z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex-1 flex items-center justify-center text-slate-500 font-bold">
                جاري تحميل القسم...
              </div>
            </div>
          )}
        </div>
      )}

      {/* Profile Info Modal */}
      {showProfileModal && authenticatedAgent && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200" dir="rtl">
            <h3 className="text-base font-black text-slate-900 mb-4 border-b border-slate-100 pb-2">الملف الشخصي</h3>
            
            <div className="space-y-4 mb-6">
              {/* INTERACTIVE PHOTO UPDATER */}
              <div className="flex flex-col items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="relative">
                  {authenticatedAgent.photo ? (
                    <img 
                      src={authenticatedAgent.photo} 
                      className="w-20 h-20 rounded-full object-cover border-4 border-blue-500 shadow-md"
                      alt="Agent"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-blue-100 flex items-center justify-center font-black text-2xl text-blue-600 rounded-full border-4 border-blue-500">
                      {authenticatedAgent.name?.charAt(0) || 'م'}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <label className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-[10px] font-black cursor-pointer shadow-sm transition-colors">
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>رفع من الجهاز</span>
                    <input type="file" accept="image/*" onChange={handlePortalPhotoUpload} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={portalCameraActive ? stopPortalCamera : startPortalCamera}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-[10px] font-black border border-blue-100 shadow-sm transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    <span>{portalCameraActive ? 'إلغاء' : 'التقاط كاميرا'}</span>
                  </button>
                </div>

                {portalCameraActive && (
                  <div className="w-full flex flex-col items-center gap-2 mt-2 p-2 bg-white rounded-xl border border-slate-200">
                    <video ref={portalVideoRef} autoPlay playsInline className="w-full h-[140px] object-cover rounded-lg border border-slate-200 scale-x-[-1]" />
                    <button
                      type="button"
                      onClick={capturePortalPhoto}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black"
                    >
                      التقاط وحفظ الصورة
                    </button>
                  </div>
                )}
              </div>

              <div className="text-center">
                <h4 className="font-black text-base text-slate-900">{authenticatedAgent.name}</h4>
                <p className="text-xs text-blue-600 font-bold mt-0.5">{(authenticatedAgent as any).jobTitle || 'محقق جنائي وميداني'}</p>
                <span className="inline-block mt-2 font-mono text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
                  رمز المحقق: {authenticatedAgent.badgeNumber || authenticatedAgent.id}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 text-right">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">رقم الهاتف</span>
                  <span className="font-bold text-slate-900 font-mono">{authenticatedAgent.phone || '970599794043'}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">حالة الاتصال</span>
                  <span className="font-bold text-green-600">نشط (Online)</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 col-span-2">
                  <span className="text-slate-500 block">نطاق التغطية والموقع</span>
                  <span className="font-bold text-slate-900">{authenticatedAgent.currentLocation || 'نابلس - وسط المدينة'}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowProfileModal(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Investigation 8-Step Full-Screen Workflow Modal */}
      {showInvestigationWorkflow && (
        <InvestigationWorkflowModal
          caseId={currentMission?.id || currentMission?.accidentNumber || currentMission?.incidentNumber || 'ACC-2026-0819'}
          assignmentId={currentMission ? (dispatches?.find(d => d.accidentId === currentMission.id)?.id || 'ASSIGN-001') : 'ASSIGN-001'}
          investigatorId={authenticatedAgent?.id || 'emp-1787022544825'}
          investigatorName={authenticatedAgent?.name || 'غير منسّب'}
          initialLocation={currentMission?.locationName || authenticatedAgent?.currentLocation || 'نابلس - شارع رفيديا'}
          initialLat={currentMission?.lat || authenticatedAgent?.lat || 32.2211}
          initialLng={currentMission?.lng || authenticatedAgent?.lng || 35.2544}
          onClose={() => setShowInvestigationWorkflow(false)}
          onSubmitted={(session) => {
            setShowInvestigationWorkflow(false);
            if (currentMission) {
              handleUpdateMissionStatus('أتم التقارير');
            }
            setToastMessage('🎉 تم اعتماد وإرسال تقرير التحقيق الميداني بنجاح إلى الإدارة المركزية');
            setTimeout(() => setToastMessage(''), 5000);
          }}
        />
      )}

      {/* Vehicle QR Scanner Modal */}
      {showQrScanner && (
        <VehicleQrScannerModal
          caseId={currentMission?.id || currentMission?.accidentNumber || currentMission?.incidentNumber || urlCaseId || 'ACC-2026-0819'}
          onClose={() => setShowQrScanner(false)}
          onVehicleLinked={(vehicle) => {
            setToastMessage(`✓ تم إضافة المركبة (${vehicle.vehiclePlate || vehicle.plate_number}) بنجاح وتعبئة بياناتها`);
            setTimeout(() => setToastMessage(''), 4000);
          }}
        />
      )}

      {/* Toast Messages */}
      {toastMessage && (
        <div className="fixed bottom-24 left-4 right-4 bg-slate-900 border-2 border-blue-500 text-white px-4 py-3.5 rounded-2xl shadow-xl z-[9999] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300" dir="rtl">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping shrink-0"></div>
          <p className="text-xs font-black leading-snug">{toastMessage}</p>
        </div>
      )}
    </div>
  );
};
