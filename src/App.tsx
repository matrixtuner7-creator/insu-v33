import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Accident, Vehicle, Driver, FieldAgent, Dispatch } from './types';
import { HqNavbar } from './components/HqNavbar';
import { ReceptionNavbar } from './components/ReceptionNavbar';
import { FieldNavbar } from './components/FieldNavbar';
import { CustomerNavbar } from './components/CustomerNavbar';
import { HqDashboard } from './components/HqDashboard';
import { AgentPortal } from './components/AgentPortal';
import { ReceptionPortal } from './components/ReceptionPortal';
import { CustomerPortal } from './components/CustomerPortal';
import { AccidentDetailModal } from './components/AccidentDetailModal';
import { NewAccidentModal } from './components/NewAccidentModal';
import { DispatchModal } from './components/DispatchModal';
import { SimpleLogin } from './components/SimpleLogin';
import { Share2, X, Check, Copy, ShieldAlert } from 'lucide-react';

export default function App() {
  const determinePortal = (path: string): 'hq' | 'agent' | 'reception' | 'customer' => {
    if (path.startsWith('/field/case/') || path === '/field' || path === '/investigator') return 'agent';
    if (path === '/reception') return 'reception';
    if (path === '/customer') return 'customer';
    return 'hq';
  };

  const [activePortal, setActivePortal] = useState<'hq' | 'agent' | 'reception' | 'customer'>(() => determinePortal(window.location.pathname));
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

  const handleLogin = (portal: 'hq' | 'reception', username: string, password: string) => {
    // We already validated in SimpleLogin component, so just update local auth state
    if (portal === 'hq') {
      localStorage.setItem('hq_authenticated', 'true');
      setHqAuthenticated(true);
      setAuthError('');
    } else if (portal === 'reception') {
      localStorage.setItem('reception_authenticated', 'true');
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
    const role = localStorage.getItem('user_role');
    setUserRole(role);

    const pathname = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    if (pathname.startsWith('/field/case/') || pathname === '/field' || pathname === '/investigator') {
      setActivePortal('agent');
      if (pathname.startsWith('/field/case/')) {
        const parts = pathname.split('/');
        const parsedIncidentId = parts[parts.length - 1];
        const parsedDispatchId = params.get('dispatch');
        const parsedToken = params.get('token');
        if (parsedIncidentId) localStorage.setItem('deep_link_incident_id', parsedIncidentId);
        if (parsedDispatchId) localStorage.setItem('deep_link_dispatch_id', parsedDispatchId);
        if (parsedToken) localStorage.setItem('deep_link_token', parsedToken);
      }
    } else if (pathname === '/reception') {
      setActivePortal('reception');
    } else if (pathname === '/hq') {
      setActivePortal('hq');
    } else if (pathname === '/customer') {
      setActivePortal('customer');
    } else {
      // Root routing based on role
      if (role === 'FIELD_OFFICER') {
        window.history.pushState({}, '', '/field');
        setActivePortal('agent');
      } else if (role === 'RECEPTION') {
        window.history.pushState({}, '', '/reception');
        setActivePortal('reception');
      } else {
        window.history.pushState({}, '', '/hq');
        setActivePortal('hq');
      }
    }

    const headers: Record<string, string> = {};
    if (role) headers['x-user-role'] = role;

    const fetchData = async () => {
      try {
        const [accRes, vehRes, driRes, ageRes, dispRes, audRes] = await Promise.all([
          fetch('/api/accidents', { headers }),
          fetch('/api/vehicles', { headers }),
          fetch('/api/drivers', { headers }),
          fetch('/api/agents', { headers }),
          fetch('/api/dispatches', { headers }),
          fetch('/api/audit-logs', { headers }),
        ]);

        if (accRes.ok) setAccidents(await accRes.json());
        if (vehRes.ok) setVehicles(await vehRes.json());
        if (driRes.ok) setDrivers(await driRes.json());
        if (ageRes.ok) setAgents(await ageRes.json());
        if (dispRes.ok) setDispatches(await dispRes.json());
        if (audRes.ok) setAuditLogs(await audRes.json());
      } catch (err) {
        console.error("Failed to fetch API data:", err);
      }
    };
    fetchData();

    const socket = io(window.location.origin);
    socket.on('dispatch:updated', (updatedDisp) => {
      setDispatches(prev => prev.map(d => d.id === updatedDisp.id ? updatedDisp : d));
      fetch('/api/accidents', { headers }).then(r => r.json()).then(data => setAccidents(data)).catch(() => {});
    });
    socket.on('incident:updated', (updatedInc) => {
      setAccidents(prev => prev.map(a => a.id === updatedInc.id ? { ...a, status: updatedInc.status } : a));
    });
    socket.on('hq:agent_location_updated', (loc) => {
      setAgents(prev => prev.map(ag => ag.id === loc.agentId ? { ...ag, lat: loc.lat, lng: loc.lng, currentLocation: loc.currentLocation } : ag));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user_role');
    localStorage.removeItem('field_agent_session');
    localStorage.removeItem('hq_authenticated');
    localStorage.removeItem('reception_authenticated');
    setHqAuthenticated(false);
    setReceptionAuthenticated(false);
    setUserRole(null);
    window.location.href = '/hq';
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
        setAccidents(prev => [newAcc, ...prev]);
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
        setDispatches(prev => [newDisp, ...prev]);
        const [accRes, ageRes] = await Promise.all([
          fetch('/api/accidents', { headers }),
          fetch('/api/agents', { headers }),
        ]);
        if (accRes.ok) {
          const accData = await accRes.json();
          setAccidents(accData);
          if (selectedAccident) {
            const updatedAcc = accData.find((a: Accident) => a.id === selectedAccident.id);
            if (updatedAcc) setSelectedAccident(updatedAcc);
          }
        }
        if (ageRes.ok) setAgents(await ageRes.json());
      }
    } catch (err) {
      console.error(err);
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
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased" dir="rtl">
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
      {activePortal === 'agent' && !isFieldRoute && (
        <FieldNavbar onLogout={handleLogout} />
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
            onAddVehicle={handleAddVehicle}
            onAddDriver={handleAddDriver}
            onRegenerateToken={handleRegenerateToken}
          />
        ) : activePortal === 'reception' ? (
          <ReceptionPortal
            vehicles={vehicles}
            drivers={drivers}
            onReportCreated={newAcc => setAccidents(prev => [newAcc, ...prev])}
          />
        ) : activePortal === 'customer' ? (
          <CustomerPortal
            accidents={accidents}
            onUpdateAccidentDocs={handleUpdateAccidentDocs}
          />
        ) : (
          <AgentPortal
            agents={agents}
            accidents={accidents}
            dispatches={dispatches}
            onUpdateDispatchStatus={handleUpdateDispatchStatus}
            onSubmitComprehensiveAccident={handleComprehensiveAccident}
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-600" />
                <span>روابط البوابات المعتمدة</span>
              </h3>
              <button onClick={() => setShowShareModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span>غرفة العمليات المركزية (HQ): <strong className="font-mono text-indigo-700">/hq</strong></span>
                <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/hq`); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-blue-600 font-bold hover:underline">نسخ</button>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span>بوابة الاستقبال: <strong className="font-mono text-blue-700">/reception</strong></span>
                <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/reception`); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-blue-600 font-bold hover:underline">نسخ</button>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span>بوابة المحقق الميداني: <strong className="font-mono text-emerald-700">/field</strong></span>
                <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/field`); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-blue-600 font-bold hover:underline">نسخ</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
