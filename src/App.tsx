import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Accident, Vehicle, Driver, FieldAgent, Dispatch } from './types';
import { HqNavbar } from './components/HqNavbar';
import { ReceptionNavbar } from './components/ReceptionNavbar';
import { FieldNavbar } from './components/FieldNavbar';
import { CustomerNavbar } from './components/CustomerNavbar';
import { HqDashboard } from './components/HqDashboard';
import { AgentPortal } from './components/AgentPortal';
import { ReceptionPortal } from './components/ReceptionPortal';
import { CustomerPortal } from './components/CustomerPortal';
import { PolicyholderPortal } from './components/PolicyholderPortal';
import { AccidentDetailModal } from './components/AccidentDetailModal';
import { NewAccidentModal } from './components/NewAccidentModal';
import { DispatchModal } from './components/DispatchModal';
import { SimpleLogin } from './components/SimpleLogin';
import { CaseCommunicationBag } from './components/CaseCommunicationBag';
import { radioAudio } from './lib/radioAudio';
import { Share2, X, Check, Copy, ShieldAlert, Radio, MessageSquare, AlertTriangle, Volume2, Mic } from 'lucide-react';

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

export default function App() {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/portal')) {
    return <PolicyholderPortal />;
  }
  return <MainInsuranceApp />;
}

function MainInsuranceApp() {
  const determinePortal = (path: string): 'hq' | 'agent' | 'reception' | 'customer' | 'portal' => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const portalParam = searchParams.get('portal');
      const invParam = sanitizeInvestigatorId(searchParams.get('investigator_id'));
      const caseParam = sanitizeCaseId(searchParams.get('case_id'));

      // 1. Explicit path checking takes absolute precedence over session state
      if (path.startsWith('/portal') || portalParam === 'portal') {
        return 'portal';
      }
      if (path.startsWith('/field/case/') || path === '/field' || path === '/investigator' || portalParam === 'agent' || !!invParam || !!caseParam) {
        return 'agent';
      }
      if (path === '/reception' || portalParam === 'reception') {
        return 'reception';
      }
      if (path === '/customer' || portalParam === 'customer') {
        return 'customer';
      }
      if (path === '/hq' || portalParam === 'hq') {
        return 'hq';
      }

      // 2. Session storage context
      try {
        const routeContext = sessionStorage.getItem('route_context_portal');
        if (routeContext === 'portal') return 'portal';
        if (routeContext === 'agent') return 'agent';
        if (routeContext === 'reception') return 'reception';
        if (routeContext === 'customer') return 'customer';
        if (routeContext === 'hq') return 'hq';
      } catch (e) {}

      // 3. Fallback to local storage role
      try {
        const role = localStorage.getItem('user_role');
        if (role === 'FIELD_OFFICER') return 'agent';
        if (role === 'RECEPTION') return 'reception';
      } catch (e) {}
    }

    if (path.startsWith('/portal')) return 'portal';
    if (path.startsWith('/field/case/') || path === '/field' || path === '/investigator') return 'agent';
    if (path === '/reception') return 'reception';
    if (path === '/customer') return 'customer';
    return 'hq';
  };

  const [activePortal, setActivePortal] = useState<'hq' | 'agent' | 'reception' | 'customer' | 'portal'>(() => {
    if (typeof window !== 'undefined') {
      return determinePortal(window.location.pathname);
    }
    return 'hq';
  });
  const [accidents, setAccidents] = useState<Accident[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [agents, setAgents] = useState<FieldAgent[]>([]);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [selectedAccident, setSelectedAccident] = useState<Accident | null>(null);
  const [showNewAccidentModal, setShowNewAccidentModal] = useState(false);
  const [dispatchTargetAccident, setDispatchTargetAccident] = useState<Accident | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const [hqAuthenticated, setHqAuthenticated] = useState(true);
  const [receptionAuthenticated, setReceptionAuthenticated] = useState(true);
  const [authError, setAuthError] = useState('');

  // Global Intercom and Radio Communication States
  const [globalIntercomOpen, setGlobalIntercomOpen] = useState(false);
  const [globalIntercomTab, setGlobalIntercomTab] = useState<'chat' | 'radio' | 'camera'>('radio');
  const [livePttSpeaker, setLivePttSpeaker] = useState<{ senderName: string; senderRole: string; channel?: string } | null>(null);
  const [liveToast, setLiveToast] = useState<{ title: string; message: string; severity?: string; incidentId?: string } | null>(null);
  const [sosAlert, setSosAlert] = useState<{ id: string; agentName: string; locationName: string; timestamp: string } | null>(null);

  // Progressive Web App (PWA) Install Prompt States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Also check display mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBtn(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to PWA install choice: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  const socketRef = useRef<Socket | null>(null);

  const handleLogin = (portal: 'hq' | 'reception', username: string, password: string) => {
    // We already validated in SimpleLogin component, so just update local auth state
    if (portal === 'hq') {
      try { localStorage.setItem('hq_authenticated', 'true'); } catch (e) {}
      setHqAuthenticated(true);
      setAuthError('');
    } else if (portal === 'reception') {
      try { localStorage.setItem('reception_authenticated', 'true'); } catch (e) {}
      setReceptionAuthenticated(true);
      setAuthError('');
    }
  };

  useEffect(() => {
    const handleLocationChange = () => {
      setActivePortal(determinePortal(window.location.pathname));
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Fetch initial data from backend APIs and connect via Socket.IO
  useEffect(() => {
    let role = null;
    try { role = localStorage.getItem('user_role'); } catch (e) {}
    setUserRole(role);

    const pathname = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const portalParam = params.get('portal');
    const invParam = sanitizeInvestigatorId(params.get('investigator_id'));
    const caseParam = sanitizeCaseId(params.get('case_id'));

    const isAgentLink = portalParam === 'agent' || portalParam === 'field' || portalParam === 'investigator' || !!invParam || (!!caseParam && portalParam !== 'customer');

    if (pathname.startsWith('/portal') || portalParam === 'portal') {
      setActivePortal('portal');
      try { sessionStorage.setItem('route_context_portal', 'portal'); } catch (e) {}
    } else if (pathname.startsWith('/field/case/') || pathname === '/field' || pathname === '/investigator' || isAgentLink) {
      setActivePortal('agent');
      try { sessionStorage.setItem('route_context_portal', 'agent'); } catch (e) {}
      if (caseParam) { try { localStorage.setItem('deep_link_incident_id', caseParam); } catch (e) {} }
      if (invParam) { try { localStorage.setItem('deep_link_investigator_id', invParam); } catch (e) {} }
      
      // Clean up search path if not on /field
      if (pathname !== '/' && pathname !== '/field' && !pathname.startsWith('/field/case/')) {
        try { window.history.replaceState({}, '', '/' + window.location.search); } catch (e) {}
      }
    } else if (pathname === '/reception' || portalParam === 'reception') {
      setActivePortal('reception');
      try { sessionStorage.setItem('route_context_portal', 'reception'); } catch (e) {}
    } else if (pathname === '/customer' || portalParam === 'customer') {
      setActivePortal('customer');
      try { sessionStorage.setItem('route_context_portal', 'customer'); } catch (e) {}
    } else if (pathname === '/hq' || portalParam === 'hq') {
      setActivePortal('hq');
      try { sessionStorage.setItem('route_context_portal', 'hq'); } catch (e) {}
    } else {
      // Check Route Context locked in sessionStorage
      let routeContext = null;
      try { routeContext = sessionStorage.getItem('route_context_portal'); } catch (e) {}

      if (routeContext === 'portal') {
        setActivePortal('portal');
      } else if (routeContext === 'agent') {
        setActivePortal('agent');
      } else if (routeContext === 'reception') {
        setActivePortal('reception');
      } else if (routeContext === 'customer') {
        setActivePortal('customer');
      } else if (routeContext === 'hq') {
        setActivePortal('hq');
      } else {
        // Fallback to role-based routing
        if (role === 'FIELD_OFFICER') {
          try { window.history.pushState({}, '', '/field'); } catch (e) {}
          setActivePortal('agent');
          try { sessionStorage.setItem('route_context_portal', 'agent'); } catch (e) {}
        } else if (role === 'RECEPTION') {
          try { window.history.pushState({}, '', '/reception'); } catch (e) {}
          setActivePortal('reception');
          try { sessionStorage.setItem('route_context_portal', 'reception'); } catch (e) {}
        } else {
          try { window.history.pushState({}, '', '/hq'); } catch (e) {}
          setActivePortal('hq');
          try { sessionStorage.setItem('route_context_portal', 'hq'); } catch (e) {}
        }
      }
    }

    const headers: Record<string, string> = {};
    if (role) headers['x-user-role'] = role;

    const fetchData = async () => {
      try {
        const isAgent = activePortal === 'agent';
        const promises: Promise<Response | any>[] = [
          fetch('/api/accidents', { headers }),
          fetch('/api/vehicles', { headers }),
          fetch('/api/drivers', { headers }),
          isAgent ? Promise.resolve(null) : fetch('/api/agents', { headers }),
          fetch('/api/dispatches', { headers }),
        ];
        
        if (!isAgent) {
          promises.push(fetch('/api/audit-logs', { headers }));
        }
        const responses = await Promise.all(promises);
        const [accRes, vehRes, driRes, ageRes, dispRes, audRes] = responses;

        if (accRes && accRes.ok) setAccidents(await accRes.json());
        if (vehRes && vehRes.ok) setVehicles(await vehRes.json());
        if (driRes && driRes.ok) setDrivers(await driRes.json());
        if (ageRes && ageRes.ok) setAgents(await ageRes.json());
        if (dispRes && dispRes.ok) setDispatches(await dispRes.json());
        if (audRes && audRes.ok) setAuditLogs(await audRes.json());
      } catch (err) {
        console.error("Failed to fetch API data:", err);
      }
    };
    fetchData();

    const socket = io(window.location.origin);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log("✅ Socket connected", socket.id);
      socket.emit("join_case", "general");
      socket.emit("join_case", "default");
      socket.emit("join_case", "intercom-all");
    });

    socket.on('dispatch:updated', (updatedDisp) => {
      setDispatches(prev => [updatedDisp, ...prev.filter(d => d.id !== updatedDisp.id)]);
      fetch('/api/accidents', { headers }).then(r => r.json()).then(data => {
        if (Array.isArray(data)) setAccidents(data);
      }).catch(() => {});
    });
    socket.on('incident:created', (newInc) => {
      setAccidents(prev => [
        newInc, 
        ...prev.filter(a => 
          a.id !== newInc.id && 
          a.accidentNumber !== newInc.accidentNumber && 
          a.accidentNumber !== newInc.id &&
          (a as any).incidentNumber !== newInc.accidentNumber &&
          (a as any).incidentNumber !== (newInc as any).incidentNumber
        )
      ]);
    });
    socket.on('incident:updated', (updatedInc) => {
      setAccidents(prev => prev.map(a => {
        const isMatch = a.id === updatedInc.id || 
                        a.accidentNumber === updatedInc.accidentNumber || 
                        a.accidentNumber === updatedInc.id ||
                        (a as any).incidentNumber === updatedInc.incidentNumber;
        if (isMatch) {
          return {
            ...a,
            status: updatedInc.status || a.status,
            assignedAgentId: updatedInc.assignedAgentId || a.assignedAgentId,
            assignedAgentName: updatedInc.assignedAgentName || a.assignedAgentName
          };
        }
        return a;
      }));
    });
    socket.on('system:data_reset', () => {
      setAccidents([]);
      setDispatches([]);
      fetchData();
    });
    socket.on('agent:created', () => {
      fetch('/api/agents', { headers }).then(r => r.json()).then(data => {
        if (Array.isArray(data)) setAgents(data);
      }).catch(() => {});
    });
    socket.on('agents:updated', () => {
      fetch('/api/agents', { headers }).then(r => r.json()).then(data => {
        if (Array.isArray(data)) setAgents(data);
      }).catch(() => {});
    });
    socket.on('hq:agent_location_updated', (loc) => {
      setAgents(prev => prev.map(ag => ag.id === loc.agentId ? { ...ag, lat: loc.lat, lng: loc.lng, currentLocation: loc.currentLocation } : ag));
    });

    // User gesture audio unlock
    const unlockHandler = () => {
      radioAudio.unlockAudio();
    };
    window.addEventListener('click', unlockHandler, { once: true });
    window.addEventListener('touchstart', unlockHandler, { once: true });
    window.addEventListener('keydown', unlockHandler, { once: true });

    // Real-time PTT Walkie-Talkie Broadcasting
    socket.on('ptt:transmitting', (data: any) => {
      setLivePttSpeaker(data);
      radioAudio.playPttStart();
    });

    socket.on('ptt:idle', () => {
      setLivePttSpeaker(null);
      radioAudio.playPttRelease();
    });

    socket.on('ptt:voice_transmitted', (data: any) => {
      // Prevent playing own voice back to the sender
      let myName = '';
      try {
        if (localStorage.getItem('hq_authenticated') === 'true') {
          myName = 'غرفة العمليات (HQ)';
        } else if (localStorage.getItem('reception_authenticated') === 'true') {
          myName = 'موظف الاستقبال';
        } else {
          myName = localStorage.getItem('agent_name') || '';
        }
      } catch (e) {}

      const sender = data.sender || data.senderName;
      if (sender && myName && sender.trim() === myName.trim()) {
        console.log("Ignored self-playback for voice transmission.");
        return;
      }

      if (data.audioUrl) {
        radioAudio.playVoice(data.audioUrl);
      }
      setLiveToast({
        title: `📻 نداء لاسلكي من: ${data.sender || 'الميدان'}`,
        message: 'تم استلام وبث الملاحظة الصوتية الميدانية حياً عبر مكبر الصوت.',
        severity: 'info',
        incidentId: data.incidentId || data.caseId
      });
      setTimeout(() => setLiveToast(null), 7000);
    });

    // Case Message Alerts
    socket.on('case:new_message', (msg: any) => {
      radioAudio.playMessageNotification();
      const contentPreview = msg.contentType === 'voice' || msg.contentType === 'ptt_broadcast' 
        ? '🎤 رسالة صوتية جديدة' 
        : msg.contentType === 'image' 
        ? '📷 صورة جديدة تم التقاطها' 
        : (msg.content || '');
      
      setLiveToast({
        title: `💬 رسالة جديدة: ${msg.sender || 'العمليات'}`,
        message: contentPreview.length > 60 ? contentPreview.substring(0, 60) + '...' : contentPreview,
        severity: 'info',
        incidentId: msg.incidentId
      });
      setTimeout(() => setLiveToast(null), 6000);
    });

    // General HQ Alerts
    socket.on('hq:alert', (alertData: any) => {
      radioAudio.playIncomingAlert();
      setLiveToast(alertData);
      setTimeout(() => setLiveToast(null), 6000);
    });

    // SOS Emergency Broadcasts
    socket.on('hq:sos_alert', (sosData: any) => {
      radioAudio.playSosAlarm();
      setSosAlert(sosData);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('user_role');
      localStorage.removeItem('field_agent_session');
      localStorage.removeItem('deep_link_incident_id');
      localStorage.removeItem('deep_link_investigator_id');
      localStorage.removeItem('deep_link_dispatch_id');
      localStorage.removeItem('deep_link_token');
      localStorage.setItem('hq_authenticated', 'true');
    } catch (e) {}
    setHqAuthenticated(true);
    setUserRole('HQ');
    setActivePortal('hq');

    if (typeof window !== 'undefined') {
      window.location.href = `${window.location.origin}/?portal=hq`;
    }
  };

  const headers = { 'x-user-role': userRole || '' };

  const handleRegenerateToken = async (agentId: string) => {
    try {
      const res = await fetch(`/api/agents/${agentId}/regenerate-token`, {
        method: 'POST',
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        setAgents(prev => prev.map(a => a.id === agentId ? data.agent : a));
        const audRes = await fetch('/api/audit-logs', { headers });
        if (audRes.ok) setAuditLogs(await audRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleComprehensiveAccident = async (data: any) => {
    try {
      const res = await fetch('/api/accidents/comprehensive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const newAcc = await res.json();
        setAccidents(prev => [newAcc, ...prev]);
        const [audRes, dispRes] = await Promise.all([
          fetch('/api/audit-logs', { headers }),
          fetch('/api/dispatches', { headers })
        ]);
        if (audRes.ok) setAuditLogs(await audRes.json());
        if (dispRes.ok) setDispatches(await dispRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (accidentId: string, newStatus: Accident['status']) => {
    try {
      const res = await fetch(`/api/accidents/${accidentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAccidents(prev => prev.map(a => a.id === accidentId ? updated : a));
        if (selectedAccident?.id === accidentId) {
          setSelectedAccident(updated);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunAiAnalysis = async (accidentId: string) => {
    const acc = accidents.find(a => a.id === accidentId);
    if (!acc) return;
    try {
      const res = await fetch('/api/ai/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          description: acc.description,
          vehiclePlate: acc.vehiclePlate,
          locationName: acc.locationName,
          severity: acc.severity,
        }),
      });
      if (res.ok) {
        const analysis = await res.json();
        const updateRes = await fetch(`/api/accidents/${accidentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify({ aiAnalysis: analysis }),
        });
        if (updateRes.ok) {
          const updated = await updateRes.json();
          setAccidents(prev => prev.map(a => a.id === accidentId ? updated : a));
          if (selectedAccident?.id === accidentId) {
            setSelectedAccident(updated);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAccident = async (data: any) => {
    try {
      const res = await fetch('/api/accidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const newAcc = await res.json();
        setAccidents(prev => [
          newAcc, 
          ...prev.filter(a => 
            a.id !== newAcc.id && 
            a.accidentNumber !== newAcc.accidentNumber && 
            a.accidentNumber !== newAcc.id &&
            (a as any).incidentNumber !== newAcc.accidentNumber &&
            (a as any).incidentNumber !== (newAcc as any).incidentNumber
          )
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDispatch = async (accidentId: string, agentId: string, notes: string) => {
    try {
      const res = await fetch('/api/dispatches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ accidentId, agentId, notes }),
      });
      if (res.ok) {
        const newDisp = await res.json();
        setDispatches(prev => [newDisp, ...prev.filter(d => d.id !== newDisp.id)]);
        
        const assignedAgent = agents.find(ag => ag.id === agentId || ag.name === agentId);
        const resolvedName = assignedAgent?.name || newDisp.agentName || 'محقق ميداني';

        // Optimistic update of state locally to ensure instant reflection
        setAccidents(prev => prev.map(acc => {
          if (acc.id === accidentId || acc.accidentNumber === accidentId || (acc as any).incidentNumber === accidentId) {
            return {
              ...acc,
              status: 'قيد التحقيق',
              assignedAgentId: agentId,
              assignedAgentName: resolvedName
            };
          }
          return acc;
        }));
        
        if (selectedAccident && (selectedAccident.id === accidentId || selectedAccident.accidentNumber === accidentId)) {
          setSelectedAccident(prev => prev ? {
            ...prev,
            status: 'قيد التحقيق',
            assignedAgentId: agentId,
            assignedAgentName: resolvedName
          } : prev);
        }
        
        setDispatchTargetAccident(null);

        // Fetch to ensure sync
        const [accRes, ageRes] = await Promise.all([
          fetch('/api/accidents', { headers }),
          fetch('/api/agents', { headers }),
        ]);
        if (accRes.ok) {
          const accData = await accRes.json();
          if (Array.isArray(accData)) setAccidents(accData);
        }
        if (ageRes.ok) {
          const ageData = await ageRes.json();
          if (Array.isArray(ageData)) setAgents(ageData);
        }
      }
    } catch (err) {
      console.error("handleCreateDispatch error:", err);
    }
  };

  const handleUpdateDispatchStatus = async (dispatchId: string, status: 'قيد التوجيه' | 'وصل للموقع' | 'أتم التقارير') => {
    try {
      const res = await fetch(`/api/dispatches/${dispatchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const [accRes, dispRes, ageRes] = await Promise.all([
          fetch('/api/accidents', { headers }),
          fetch('/api/dispatches', { headers }),
          fetch('/api/agents', { headers }),
        ]);
        if (accRes.ok) setAccidents(await accRes.json());
        if (dispRes.ok) setDispatches(await dispRes.json());
        if (ageRes.ok) setAgents(await ageRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddVehicle = async (vehicleData: Omit<Vehicle, 'id'>) => {
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(vehicleData),
      });
      if (res.ok) {
        const newV = await res.json();
        setVehicles(prev => [...prev, newV]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDriver = async (driverData: Omit<Driver, 'id'>) => {
    try {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(driverData),
      });
      if (res.ok) {
        const newD = await res.json();
        setDrivers(prev => [...prev, newD]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateAccidentDocs = async (accidentId: string, newPhotos: string[]) => {
    try {
      const res = await fetch(`/api/accidents/${accidentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ photos: newPhotos }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAccidents(prev => prev.map(a => a.id === accidentId ? updated : a));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unresolvedCount = accidents.filter(a => a.status === 'جديد').length;

  // Role Authorization checks (Disabled for testing inspection)
  const isFieldRoute = window.location.pathname.startsWith('/field/case/') || window.location.pathname === '/field' || window.location.pathname === '/investigator';
  const isHqRoute = window.location.pathname === '/hq';
  const isReceptionRoute = window.location.pathname === '/reception';

  return (
    <div className="min-h-screen bg-[#1C2229] text-[#F1F5F9] font-sans antialiased selection:bg-[#315EF5] selection:text-white" dir="rtl">
      {/* Top Development Portal Quick Switcher */}
      {activePortal === 'hq' && (
        <div className="bg-[#11161B] border-b border-[#2A323A] px-3 py-1.5 flex items-center justify-between z-[9999] text-xs shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-[#AAB2BA] font-bold text-[11px]">تبديل البوابة:</span>
            <div className="flex items-center gap-1 bg-[#1C2229] p-0.5 rounded-lg border border-[#2A323A]">
              <button
                onClick={() => { setActivePortal('agent'); try { sessionStorage.setItem('route_context_portal', 'agent'); } catch(e){} }}
                className={`px-2.5 py-1 rounded-md font-bold text-xs transition-all ${
                  activePortal === 'agent'
                    ? 'bg-[#22A06B] text-white shadow-sm'
                    : 'text-[#AAB2BA] hover:text-white'
                }`}
              >
                📱 المحقق الميداني
              </button>
              <button
                onClick={() => { setActivePortal('hq'); try { sessionStorage.setItem('route_context_portal', 'hq'); } catch(e){} }}
                className={`px-2.5 py-1 rounded-md font-bold text-xs transition-all ${
                  activePortal === 'hq'
                    ? 'bg-[#315EF5] text-white shadow-sm'
                    : 'text-[#AAB2BA] hover:text-white'
                }`}
              >
                🏢 العمليات (HQ)
              </button>
              <button
                onClick={() => { setActivePortal('reception'); try { sessionStorage.setItem('route_context_portal', 'reception'); } catch(e){} }}
                className={`px-2.5 py-1 rounded-md font-bold text-xs transition-all ${
                  activePortal === 'reception'
                    ? 'bg-[#315EF5] text-white shadow-sm'
                    : 'text-[#AAB2BA] hover:text-white'
                }`}
              >
                📋 الاستقبال
              </button>
              <button
                onClick={() => { setActivePortal('customer'); try { sessionStorage.setItem('route_context_portal', 'customer'); } catch(e){} }}
                className={`px-2.5 py-1 rounded-md font-bold text-xs transition-all ${
                  activePortal === 'customer'
                    ? 'bg-[#315EF5] text-white shadow-sm'
                    : 'text-[#AAB2BA] hover:text-white'
                }`}
              >
                👤 العميل
              </button>
            </div>
          </div>
          <span className="text-[10px] text-[#22A06B] font-bold hidden md:inline">
            ✓ شاشة المحقق مفعلة للمعاينة
          </span>
        </div>
      )}

      {/* Independent Navbars */}
      {activePortal === 'hq' && (
        <HqNavbar
          unresolvedCount={unresolvedCount}
          onOpenNewAccident={() => setShowNewAccidentModal(true)}
          onOpenShareModal={() => setShowShareModal(true)}
          onLogout={handleLogout}
        />
      )}
      {activePortal === 'reception' && (
        <ReceptionNavbar
          onOpenNewAccident={() => setShowNewAccidentModal(true)}
          onLogout={handleLogout}
        />
      )}
      
      {activePortal === 'customer' && (
        <CustomerNavbar onLogout={handleLogout} />
      )}

      <main className="pb-16">
        {activePortal === 'hq' ? (
          <HqDashboard
            accidents={accidents}
            vehicles={vehicles}
            drivers={drivers}
            agents={agents}
            dispatches={dispatches}
            auditLogs={auditLogs}
            onSelectAccident={acc => setSelectedAccident(acc)}
            onOpenNewAccident={() => setShowNewAccidentModal(true)}
            onOpenDispatch={acc => setDispatchTargetAccident(acc)}
            onDirectAssignAgent={(accidentId, agentId) => handleCreateDispatch(accidentId, agentId, 'تكليف وإسناد ميداني مباشر')}
            onAddVehicle={handleAddVehicle}
            onAddDriver={handleAddDriver}
            onRegenerateToken={handleRegenerateToken}
            onLogout={handleLogout}
          />
        ) : activePortal === 'reception' ? (
          <ReceptionPortal
            vehicles={vehicles}
            drivers={drivers}
            agents={agents}
            onReportCreated={newAcc => setAccidents(prev => [newAcc, ...prev])}
          />
        ) : activePortal === 'customer' ? (
          <CustomerPortal
            accidents={accidents}
            onUpdateAccidentDocs={handleUpdateAccidentDocs}
          />
        ) : activePortal === 'portal' ? (
          <PolicyholderPortal />
        ) : (
          <AgentPortal
            accidents={accidents}
            dispatches={dispatches}
            onUpdateDispatchStatus={handleUpdateDispatchStatus}
            onSubmitComprehensiveAccident={handleComprehensiveAccident}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Accident Detail Modal */}
      {selectedAccident && (
        <AccidentDetailModal
          accident={selectedAccident}
          vehicles={vehicles}
          drivers={drivers}
          agents={agents}
          dispatches={dispatches}
          onClose={() => setSelectedAccident(null)}
          onUpdateStatus={handleUpdateStatus}
          onRunAiAnalysis={handleRunAiAnalysis}
          onOpenDispatch={acc => setDispatchTargetAccident(acc)}
          onUpdateAccident={acc => setSelectedAccident(acc)}
        />
      )}

      {/* New Accident Modal */}
      {showNewAccidentModal && (
        <NewAccidentModal
          vehicles={vehicles}
          drivers={drivers}
          onClose={() => setShowNewAccidentModal(false)}
          onSubmit={handleCreateAccident}
        />
      )}

      {/* Dispatch Modal */}
      {dispatchTargetAccident && (
        <DispatchModal
          accident={dispatchTargetAccident}
          agents={agents}
          onClose={() => setDispatchTargetAccident(null)}
          onSubmit={handleCreateDispatch}
        />
      )}

      {/* Share Portal Link Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#1C2229]/80 backdrop-blur-sm" dir="rtl">
          <div className="bg-[#2A323A] border border-[#3A434C] rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 text-[#F1F5F9]">
            <div className="flex items-center justify-between border-b border-[#3A434C] pb-3">
              <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#315EF5]" />
                <span>روابط البوابات المعتمدة</span>
              </h3>
              <button onClick={() => setShowShareModal(false)} className="p-1 text-[#AAB2BA] hover:text-white rounded-lg hover:bg-[#323A40] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-[#AAB2BA]">
              <div className="p-3 bg-[#161B1F] rounded-xl border border-[#3A434C] flex items-center justify-between">
                <span>غرفة العمليات المركزية (HQ): <strong className="font-mono text-[#315EF5] font-bold">/hq</strong></span>
                <button onClick={() => { navigator.clipboard.writeText('https://incident.palcom.online/hq'); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-[#315EF5] font-bold hover:underline cursor-pointer">نسخ</button>
              </div>
              <div className="p-3 bg-[#161B1F] rounded-xl border border-[#3A434C] flex items-center justify-between">
                <span>بوابة الاستقبال: <strong className="font-mono text-[#315EF5] font-bold">/reception</strong></span>
                <button onClick={() => { navigator.clipboard.writeText('https://incident.palcom.online/reception'); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-[#315EF5] font-bold hover:underline cursor-pointer">نسخ</button>
              </div>
              <div className="p-3 bg-[#161B1F] rounded-xl border border-[#3A434C] flex items-center justify-between">
                <span>بوابة المحقق الميداني: <strong className="font-mono text-[#22A06B] font-bold">/field</strong></span>
                <button onClick={() => { navigator.clipboard.writeText('https://incident.palcom.online/field'); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-[#22A06B] font-bold hover:underline cursor-pointer">نسخ</button>
              </div>
              <div className="p-3 bg-[#161B1F] rounded-xl border border-[#3A434C] flex items-center justify-between">
                <span>بوابة العميل: <strong className="font-mono text-[#315EF5] font-bold">/customer</strong></span>
                <button onClick={() => { navigator.clipboard.writeText('https://incident.palcom.online/customer'); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-[#315EF5] font-bold hover:underline cursor-pointer">نسخ</button>
              </div>
            </div>
            {copied && (
              <div className="p-2 bg-[#22A06B]/20 text-[#22A06B] border border-[#22A06B]/30 rounded-xl text-center text-xs font-bold">
                ✓ تم نسخ الرابط بنجاح إلى الحافظة!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live PTT Audio Wave Bar (Top Floating Banner) */}
      {livePttSpeaker && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[99999] bg-[#161B1F]/95 border-2 border-[#22A06B] shadow-[0_0_25px_rgba(34,160,107,0.4)] rounded-full px-5 py-2 flex items-center gap-3 backdrop-blur-md animate-bounce text-white">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 bg-[#22A06B] rounded-full animate-ping absolute"></span>
            <span className="w-3 h-3 bg-[#22A06B] rounded-full"></span>
          </div>
          <Radio className="w-5 h-5 text-[#22A06B] animate-pulse" />
          <div className="text-xs sm:text-sm font-bold flex items-center gap-2">
            <span>بث لاسلكي مباشر:</span>
            <span className="text-[#22A06B]">{livePttSpeaker.senderName}</span>
            <span className="text-[10px] bg-[#22A06B]/20 px-2 py-0.5 rounded text-[#22A06B]">{livePttSpeaker.senderRole}</span>
          </div>
          <button 
            onClick={() => {
              setGlobalIntercomTab('radio');
              setGlobalIntercomOpen(true);
            }}
            className="text-[11px] bg-[#22A06B] hover:bg-[#1b8256] text-white px-3 py-1 rounded-full font-bold transition-all cursor-pointer mr-2"
          >
            فتح جهاز اللاسلكي
          </button>
        </div>
      )}

      {/* Real-time Incident & Chat Toast Alert */}
      {liveToast && (
        <div className="fixed bottom-20 left-4 sm:left-6 z-[9999] max-w-sm w-full bg-[#2A323A]/95 border border-[#3A434C] shadow-2xl rounded-2xl p-4 backdrop-blur-md animate-fade-in text-[#F1F5F9] space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#315EF5]">
              <MessageSquare className="w-4 h-4" />
              <span>{liveToast.title}</span>
            </div>
            <button onClick={() => setLiveToast(null)} className="text-[#AAB2BA] hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-[#CBD5E1] line-clamp-2">{liveToast.message}</p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => {
                setGlobalIntercomTab('chat');
                setGlobalIntercomOpen(true);
                setLiveToast(null);
              }}
              className="text-xs bg-[#315EF5] hover:bg-[#2549d4] text-white px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>رد فوري / فتح الحقيبة</span>
            </button>
          </div>
        </div>
      )}

      {/* Urgent SOS Emergency Alert Modal */}
      {sosAlert && (
        <div className="fixed inset-0 z-[999999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1F181B] border-2 border-[#E5484D] shadow-[0_0_50px_rgba(229,72,77,0.6)] rounded-3xl max-w-md w-full p-6 text-center space-y-5 animate-pulse">
            <div className="w-16 h-16 bg-[#E5484D]/20 text-[#E5484D] rounded-full flex items-center justify-center mx-auto border border-[#E5484D]/40">
              <AlertTriangle className="w-10 h-10 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-[#E5484D]">🚨 نداء طوارئ SOS عاجل</h2>
              <p className="text-sm font-bold text-white">المحقق الميداني: {sosAlert.agentName}</p>
              <p className="text-xs text-[#CBD5E1]">الموقع: {sosAlert.locationName}</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSosAlert(null);
                  setGlobalIntercomTab('radio');
                  setGlobalIntercomOpen(true);
                }}
                className="flex-1 py-3 bg-[#E5484D] hover:bg-[#c93b40] text-white rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Radio className="w-4 h-4" />
                <span>اتصال لاسلكي فوري</span>
              </button>
              <button
                onClick={() => setSosAlert(null)}
                className="py-3 px-5 bg-[#323A40] hover:bg-[#3E474F] text-[#CBD5E1] rounded-xl font-bold text-sm cursor-pointer"
              >
                إغلاق التنبيه
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Case Communication Bag & Intercom Modal */}
      {globalIntercomOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-2xl h-[88vh] flex flex-col">
            <CaseCommunicationBag
              incidentId={selectedAccident?.id || 'general'}
              incidentNumber={selectedAccident?.accidentNumber || 'قناة العمليات العامة'}
              currentUserName={activePortal === 'agent' ? 'المحقق الميداني' : 'غرفة العمليات المركزية (HQ)'}
              currentUserRole={activePortal === 'agent' ? 'Field Investigator' : 'HQ'}
              initialTab={globalIntercomTab}
              agents={agents}
              currentAssignedAgentId={selectedAccident?.assignedAgentId}
              onClose={() => setGlobalIntercomOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Custom Progressive Web App (PWA) Installation Dialog */}
      {showInstallBtn && activePortal !== 'portal' && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-[99999] max-w-sm w-full bg-[#1A1F26] border-2 border-[#315EF5] shadow-[0_4px_30px_rgba(49,94,245,0.3)] rounded-2xl p-4 backdrop-blur-md animate-fade-in text-[#F1F5F9] space-y-3" dir="rtl" id="PWA_INSTALL_CARD">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#315EF5]/15 flex items-center justify-center border border-[#315EF5]/40 shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M256 80C320 80 384 100 384 140C384 280 256 416 256 416C256 416 128 280 128 140C128 100 192 80 256 80Z" fill="#315EF5" />
                  <circle cx="330" cy="310" r="48" fill="#10B981" />
                  <path d="M312 310L324 322L348 298" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-black text-white">تثبيت تطبيق العمليات الميدانية</h4>
                <p className="text-[10px] text-slate-400">للحصول على وصول أسرع واستجابة فورية</p>
              </div>
            </div>
            <button 
              onClick={() => setShowInstallBtn(false)} 
              className="text-[#AAB2BA] hover:text-white p-1 hover:bg-[#2A323A] rounded-lg transition-all"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-[#CBD5E1] leading-relaxed">
            يمكنك الآن تثبيت النظام كـ تطبيق مستقل (PWA) على شاشتك الرئيسية للحصول على إشعارات الحوادث واللاسلكي في الخلفية.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleInstallApp}
              className="flex-1 py-2 bg-[#315EF5] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              type="button"
            >
              <span>تثبيت التطبيق الآن</span>
            </button>
            <button
              onClick={() => setShowInstallBtn(false)}
              className="px-3 py-2 bg-[#2A323A] hover:bg-[#323A40] text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              type="button"
            >
              لاحقاً
            </button>
          </div>
        </div>
      )}

      {/* Build Identifier Badge */}
      {activePortal !== 'agent' && activePortal !== 'portal' && (
      <div id="build-identifier" className="fixed bottom-4 right-4 z-[9999] bg-[#E11D48] text-white text-[10px] font-mono px-2.5 py-1 rounded-full shadow-lg border border-[#FDA4AF]/20 select-none pointer-events-none opacity-80" dir="ltr">
        BUILD: 2026-08-18-NEW-HQ
      </div>
      )}
    </div>
  );
}
