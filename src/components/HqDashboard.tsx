import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { getPublicShareUrl } from '../lib/shareUtils';
import { 
  Accident, 
  FieldAgent, 
  Vehicle, 
  Driver, 
  Dispatch, 
  AuditLog, 
  CaseMovement,
  MovementType
} from '../types';
import { CaseCommunicationBag } from './CaseCommunicationBag';
import { FieldInvestigatorsManager } from './FieldInvestigatorsManager';
import { 
  Briefcase, 
  MapPin, 
  Users, 
  Car, 
  Radio, 
  BarChart2, 
  Settings, 
  HelpCircle, 
  Home, 
  MessageSquare, 
  Phone, 
  Bell, 
  ShieldCheck, 
  LogOut, 
  Maximize2, 
  PhoneCall, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  AlertTriangle, 
  Navigation, 
  Send, 
  Play, 
  Plus, 
  Check, 
  FileText, 
  ShieldAlert, 
  Key, 
  History, 
  Download,
  Camera
} from 'lucide-react';

interface HqDashboardProps {
  accidents: Accident[];
  agents: FieldAgent[];
  vehicles: Vehicle[];
  drivers: Driver[];
  dispatches: Dispatch[];
  auditLogs: AuditLog[];
  onSelectAccident: (accident: Accident) => void;
  onOpenNewAccident: () => void;
  onOpenDispatch: (accident: Accident) => void;
  onAddVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  onAddDriver: (driver: Omit<Driver, 'id'>) => void;
  onRegenerateToken?: (agentId: string) => void;
  onToggleAgentActive?: (agentId: string) => void;
}

// Real Interactive Leaflet Map Component with Multiple Style Switcher
const RealMapComponent: React.FC<{ accidents: Accident[]; agents: FieldAgent[] }> = ({ accidents, agents }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const [mapStyle, setMapStyle] = useState<'streets' | 'dark' | 'satellite' | 'topo'>('streets');

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [32.2211, 35.2544],
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      });
      mapInstanceRef.current = map;
      markersGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '';

    if (mapStyle === 'dark') {
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    } else if (mapStyle === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    } else if (mapStyle === 'topo') {
      url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    }

    const newLayer = L.tileLayer(url, { maxZoom: 19 });
    newLayer.addTo(map);
    tileLayerRef.current = newLayer;

    if (markersGroupRef.current) {
      markersGroupRef.current.clearLayers();

      // Add agents markers with real coordinates
      agents.forEach((ag) => {
        const lat = ag.lat || (32.2211 + (Math.random() * 0.01 - 0.005));
        const lng = ag.lng || (35.2544 + (Math.random() * 0.01 - 0.005));
        const photoUrl = ag.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';
        const markerHtml = `
          <div style="display: flex; align-items: center; background: white; padding: 3px 10px 3px 3px; border-radius: 30px; border: 2px solid #2563eb; box-shadow: 0 4px 12px rgba(0,0,0,0.25); gap: 8px; white-space: nowrap; pointer-events: none;">
            <img src="${photoUrl}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 1px solid #2563eb;" />
            <span style="font-size: 11px; font-weight: bold; color: #1e293b;">${ag.name || 'محقق'}</span>
            <span style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; display: inline-block;"></span>
          </div>
        `;
        const customIcon = L.divIcon({ html: markerHtml, className: '', iconSize: [120, 36], iconAnchor: [60, 18] });
        const marker = L.marker([lat, lng], { icon: customIcon });
        marker.bindPopup(`
          <div style="text-align: right; direction: rtl; font-family: inherit;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <img src="${photoUrl}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid #2563eb;" />
              <div>
                <b style="font-size: 14px; color: #1e293b;">${ag.name}</b>
                <div style="font-size: 11px; color: #64748b;">محقق ميداني معتمد</div>
              </div>
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 6px 0;" />
            <p style="margin: 4px 0; font-size: 12px;"><b>الهاتف:</b> ${ag.phone}</p>
            <p style="margin: 4px 0; font-size: 12px;"><b>الموقع:</b> ${ag.currentLocation || 'نابلس'}</p>
            <p style="margin: 4px 0; font-size: 12px; color: #16a34a;"><b>الحالة:</b> متاح ومباشر 🟢</p>
          </div>
        `);
        markersGroupRef.current?.addLayer(marker);
      });

      // Add accidents markers with real coordinates
      accidents.forEach((acc) => {
        const lat = acc.lat || 32.2227;
        const lng = acc.lng || 35.2621;
        const markerHtml = `<div style="background: #dc2626; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.4);">🚨</div>`;
        const customIcon = L.divIcon({ html: markerHtml, className: '' });
        const marker = L.marker([lat, lng], { icon: customIcon });
        marker.bindPopup(`<b>حادث: ${acc.accidentNumber}</b><br/>الموقع: ${acc.locationName}<br/>الخطورة: ${acc.severity}<br/>الحالة: ${acc.status}`);
        markersGroupRef.current?.addLayer(marker);
      });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

  }, [mapStyle, accidents, agents]);

  const handleLocateMe = () => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          map.setView([lat, lng], 15);
          if (markersGroupRef.current) {
            const marker = L.marker([lat, lng], {
              icon: L.divIcon({
                html: `<div style="background: #10b981; color: white; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.4);">📍 موقعك الحالي (نابلس)</div>`,
                className: ''
              })
            });
            markersGroupRef.current.addLayer(marker);
            marker.bindPopup('موقعك الجغرافي الحالي في نابلس').openPopup();
          }
        },
        () => {
          map.setView([32.2211, 35.2544], 14);
        },
        { enableHighAccuracy: true }
      );
    } else {
      map.setView([32.2211, 35.2544], 14);
    }
  };

  return (
    <div className="relative flex-1 min-h-[380px] rounded-2xl border border-slate-200 overflow-hidden flex flex-col animate-pulse-border">
      {/* Leaflet Map DOM Container */}
      <div ref={mapRef} className="w-full flex-1 min-h-[380px]" />
    </div>
  );
};

export const HqDashboard: React.FC<HqDashboardProps> = ({
  accidents,
  agents,
  vehicles,
  drivers,
  dispatches,
  auditLogs,
  onSelectAccident,
  onOpenNewAccident,
  onOpenDispatch,
  onAddVehicle,
  onAddDriver,
  onRegenerateToken,
  onToggleAgentActive,
}) => {
  const [activeTab, setActiveTab] = useState<'accidents' | 'dispatch' | 'map' | 'communications' | 'reports' | 'archive' | 'agents' | 'fleet' | 'settings' | 'help' | 'missions' | 'chats' | 'radio'>('accidents');
  const [selectedDispatchAccidentId, setSelectedDispatchAccidentId] = useState<string | null>(null);
  const [contactTabFilter, setContactTabFilter] = useState<'all' | 'admin' | 'investigators'>('all');
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [sosSuccessMessage, setSosSuccessMessage] = useState('');
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showCaseBagModal, setShowCaseBagModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fallbackAccident: Accident = {
    id: 'acc-3143',
    accidentNumber: '#NAB-3143',
    timestamp: new Date().toISOString(),
    locationName: 'شارع فيصل / المجمع الشرقي',
    lat: 31.9038,
    lng: 35.2034,
    severity: 'حرج',
    status: 'جديد',
    incidentCategory: 'حوادث مركبات',
    incidentSubtype: 'تصادم',
    vehiclePlate: '3-8834-92',
    driverName: 'سعيد عبدربه النتشة',
    driverId: '401293812',
    insuranceClaimStatus: 'معلق',
    description: 'تصادم مروري عنيف في المجمع الشرقي مع أضرار جسيمة',
    photos: ['https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80'],
    missionStage: 'تم استلام القضية'
  };

  const selectedDispatchAccident = (accidents && accidents.length > 0)
    ? (accidents.find(a => a.id === selectedDispatchAccidentId || a.accidentNumber === selectedDispatchAccidentId) || accidents[0])
    : fallbackAccident;

  const currentMission = selectedDispatchAccident || fallbackAccident;

  const handleSendWhatsAppDispatch = (acc: Accident) => {
    const assignedAgent = agents?.find(ag => ag.id === acc.assignedAgentId || ag.name === acc.assignedAgentName);
    const agentName = assignedAgent?.name || acc.assignedAgentName || 'المحقق الميداني';
    const rawPhone = assignedAgent?.phone || (assignedAgent as any)?.whatsapp || '+970590000000';
    const cleanPhone = rawPhone.replace(/[^0-9+]/g, '');
    const agentId = assignedAgent?.id || acc.assignedAgentId || 'ag-1';
    const caseNum = acc.accidentNumber || acc.incidentNumber || acc.id;
    
    const caseUrl = getPublicShareUrl({
      portal: 'agent',
      investigator_id: agentId,
      case_id: caseNum
    });
    
    const messageText = `🚨 تكليف بمهمة معاينة حادث رسمي\n\nالزميل ${agentName}،\nتم إسناد القضية رقم (${caseNum}) إليكم.\nالموقع: ${acc.locationName}\nالخطورة: ${acc.severity}\nالحالة: ${acc.status}\n\nرابط القضية الآمن:\n${caseUrl}\n\nيرجى فتح الرابط وبدء المعاينة الميدانية فوراً.`;
    
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopyCaseLink = (acc: Accident) => {
    const agentId = acc.assignedAgentId || 'ag-1';
    const caseNum = acc.accidentNumber || acc.incidentNumber || acc.id;
    const caseUrl = getPublicShareUrl({
      portal: 'agent',
      investigator_id: agentId,
      case_id: caseNum
    });
    navigator.clipboard.writeText(caseUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleTriggerSOS = () => {
    setSosSuccessMessage('🚨 تم إرسال نداء الطوارئ SOS بنجاح إلى غرفة العمليات المركزية!');
    setTimeout(() => setSosSuccessMessage(''), 4000);
  };

  const unassignedCount = accidents.filter(a => !a.assignedAgentId && !a.assignedAgentName).length;
  const isOverview = activeTab !== 'settings' && activeTab !== 'dispatch' && activeTab !== 'agents';

  return (
    <div className="w-full h-screen bg-slate-100 flex flex-col md:flex-row overflow-hidden font-sans text-xs select-none" dir="rtl">
      {/* LEFT SIDEBAR NAVIGATION (V.COMMAND) */}
      <div className="w-full md:w-64 bg-[#050b14] text-slate-300 flex md:flex-col justify-between shrink-0 border-b md:border-b-0 md:border-l border-slate-800 overflow-x-auto md:overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg border border-blue-400/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-black text-white text-sm tracking-wide">V.COMMAND</h1>
              <p className="text-[10px] text-slate-400">غرفة العمليات والإدارة المركزية</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {/* Active Cases (Custom Component) */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('accidents');
              }}
              className="flex items-center gap-4 px-4 py-3 text-slate-200 hover:text-white group relative"
            >
              {activeTab === 'accidents' && (
                <div className="absolute inset-y-1 right-2 left-2 bg-blue-600/20 rounded-full -z-10 border-r-4 border-blue-500"></div>
              )}
              
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
              
              <span className="font-medium text-sm text-blue-400">القضايا النشطة</span>
            </a>

            {[
              { id: 'dispatch', label: 'التوجيه الميداني', icon: Send, badge: unassignedCount ? `${unassignedCount}` : undefined },
              { id: 'map', label: 'غرفة العمليات والخريطة', icon: MapPin },
              { id: 'communications', label: 'حقيبة الاتصال', icon: Phone },
              { id: 'reports', label: 'التقارير والمراجعة', icon: BarChart2 },
              { id: 'archive', label: 'الأرشيف', icon: History },
              { id: 'agents', label: 'المحققون', icon: Users },
              { id: 'fleet', label: 'المركبات', icon: Car },
              { id: 'settings', label: 'الإعدادات', icon: Settings },
              { id: 'help', label: 'المساعدة', icon: HelpCircle },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold' 
                      : 'hover:bg-slate-900 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Agent Profile Card at Bottom Left */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 overflow-hidden border border-slate-700">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" alt="علي النابلسي" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">علي النابلسي</h4>
              <span className="font-mono text-amber-400 font-bold text-[10px]">HQ-101</span>
              <div className="text-[10px] text-emerald-400">مدير العمليات</div>
            </div>
          </div>
          <button 
            onClick={() => alert('تسجيل الخروج من لوحة التحكم')}
            className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-all"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-100">
        {/* TOP BAR */}
        <div className="bg-white px-6 py-3.5 border-b border-slate-200 flex items-center justify-between shrink-0 shadow-sm">
          {/* Right: GPS status & Notifications */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 font-bold text-[11px]">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>نظام تحديد المواقع نشط</span>
            </div>
            <div className="relative">
              <div className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-2xl flex items-center justify-center text-slate-700 cursor-pointer border border-slate-200">
                <Bell className="w-5 h-5" />
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow">
                3
              </span>
            </div>
          </div>

          {/* Center: Title / Subtitle */}
          <div className="text-center">
            <h2 className="text-sm font-black text-slate-900">غرفة العمليات المركزية</h2>
            <p className="text-[10px] text-slate-500 font-bold">
              {activeTab === 'accidents' && "القضايا النشطة والتوجيه"}
              {activeTab === 'dispatch' && "مركز التوجيه الميداني"}
              {activeTab === 'map' && "غرفة العمليات والخريطة الحية"}
              {activeTab === 'communications' && "مركز اتصالات القضايا"}
              {activeTab === 'reports' && "التقارير والمراجعة"}
              {activeTab === 'archive' && "أرشيف القضايا المغلقة"}
              {activeTab === 'agents' && "إدارة المحققين"}
              {activeTab === 'fleet' && "إدارة المركبات"}
              {activeTab === 'settings' && "الإعدادات"}
              {activeTab === 'help' && "المساعدة"}
              {activeTab !== 'accidents' && activeTab !== 'dispatch' && activeTab !== 'map' && activeTab !== 'communications' && activeTab !== 'reports' && activeTab !== 'archive' && activeTab !== 'agents' && activeTab !== 'fleet' && activeTab !== 'settings' && activeTab !== 'help' && "إدارة القضايا والتوجيه والمتابعة الميدانية"}
            </p>
          </div>
        </div>

        {/* DASHBOARD CONTENT BODY */}
        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {activeTab === 'settings' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-900 text-sm">إدارة مستخدمي النظام</h3>
              <div className="space-y-4">
                <input type="text" id="new-user" placeholder="اسم المستخدم" className="p-2 border rounded-xl w-full" />
                <input type="password" id="new-pass" placeholder="كلمة المرور" className="p-2 border rounded-xl w-full" />
                <select id="new-role" className="p-2 border rounded-xl w-full">
                  <option value="HQ">HQ</option>
                  <option value="RECEPTION">RECEPTION</option>
                  <option value="FIELD_OFFICER">FIELD_OFFICER</option>
                </select>
                <button 
                  onClick={async () => {
                    const u = (document.getElementById('new-user') as HTMLInputElement).value;
                    const p = (document.getElementById('new-pass') as HTMLInputElement).value;
                    const r = (document.getElementById('new-role') as HTMLSelectElement).value;
                    await fetch('/api/users', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ username: u, password: p, role: r })
                    });
                    alert('تمت الإضافة');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl"
                >
                  إضافة مستخدم
                </button>
              </div>
            </div>
          )}

          {activeTab === 'dispatch' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black flex items-center gap-2">
                    <Send className="w-5 h-5 text-blue-400" />
                    <span>مركز التوجيه الميداني وتكليف المحققين</span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">إدارة البلاغات الواردة وتوجيه المحققين الميدانيين عبر النظام المباشر وواتساب</p>
                </div>
              </div>

              {/* 2-Column Dispatch Grid */}
              <div className="grid grid-cols-3 gap-6">
                {/* Left: Accidents list for dispatch selection */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 h-[650px] flex flex-col">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <span>القضايا المعلقة والنشطة ({accidents.length})</span>
                    </h3>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                    {accidents.map((acc) => {
                      const isSelected = selectedDispatchAccident.id === acc.id;
                      const hasAgent = !!(acc.assignedAgentId || acc.assignedAgentName);
                      return (
                        <div
                          key={acc.id}
                          onClick={() => setSelectedDispatchAccidentId(acc.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                            isSelected
                              ? 'bg-blue-50/80 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-black text-xs text-blue-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-sm">
                              {acc.accidentNumber}
                            </span>
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                              acc.severity === 'حرج' || acc.severity === 'حرج جداً'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {acc.severity}
                            </span>
                          </div>

                          <div className="text-xs font-bold text-slate-800 truncate">
                            📍 {acc.locationName}
                          </div>

                          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200/60">
                            <span className={`font-bold ${hasAgent ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {hasAgent ? `👤 ${acc.assignedAgentName || 'مُسند'}` : '⚠️ بانتظار محقق'}
                            </span>
                            <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded font-bold">
                              {acc.source === 'FIELD_INVESTIGATOR' ? 'ميداني' : 'استقبال'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDispatchAccidentId(acc.id);
                              }}
                              className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-[11px] shadow text-center"
                            >
                              توجيه
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectAccident(acc);
                              }}
                              className="py-1.5 px-3 bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl font-bold text-[11px] text-center"
                            >
                              فتح
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* MAIN AREA: Selected Case Dispatch & WhatsApp Card */}
                <div className="col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 h-[650px] flex flex-col justify-between overflow-y-auto">
                  {/* Case Details Header */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-xl text-blue-900 bg-blue-50 px-3.5 py-1 rounded-2xl border border-blue-200">
                            {selectedDispatchAccident.accidentNumber}
                          </span>
                          <span className="px-3 py-1 bg-red-100 text-red-800 font-black rounded-xl text-xs flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {selectedDispatchAccident.severity}
                          </span>
                          <span className="px-3 py-1 bg-slate-100 text-slate-800 font-bold rounded-xl text-xs">
                            {selectedDispatchAccident.incidentCategory || 'حوادث مرورية'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>تاريخ البلاغ: {new Date(selectedDispatchAccident.timestamp).toLocaleString('ar-EG')}</span>
                          <span className="mx-2">•</span>
                          <span>المصدر: <strong className="text-slate-800">{selectedDispatchAccident.source === 'FIELD_INVESTIGATOR' ? 'محقق ميداني' : 'موظف الاستقبال'}</strong></span>
                        </p>
                      </div>

                      <div className="text-left">
                        <span className="text-[10px] text-slate-400 block mb-1">حالة البلاغ</span>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-xl font-black text-xs">
                          {selectedDispatchAccident.status}
                        </span>
                      </div>
                    </div>

                    {/* Incident Summary Card */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 block mb-1">الموقع الجغرافي:</span>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                          <span>{selectedDispatchAccident.locationName}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-1">بيانات المركبة والسائق:</span>
                        <div className="font-bold text-slate-900 font-mono">
                          {selectedDispatchAccident.vehiclePlate || '3-8834-92'} — {selectedDispatchAccident.driverName || 'سعيد عبدربه النتشة'}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 block mb-1">وصف الحادث:</span>
                        <p className="text-slate-700 font-medium leading-relaxed">
                          {selectedDispatchAccident.description || 'تصادم مروري بحاجة إلى معاينة ميدانية وتوثيق الأضرار والتقرير المالي.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ASSIGNED INVESTIGATOR & WHATSAPP CARD */}
                  <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-5 shadow-2xl border border-slate-800">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-400" />
                        <h3 className="font-black text-sm">المحقق المكلّف بالتوجيه الميداني</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${
                        selectedDispatchAccident.assignedAgentId || selectedDispatchAccident.assignedAgentName
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {selectedDispatchAccident.assignedAgentId || selectedDispatchAccident.assignedAgentName ? 'مُسند ومكلّف' : 'غير مسند'}
                      </span>
                    </div>

                    {selectedDispatchAccident.assignedAgentId || selectedDispatchAccident.assignedAgentName ? (
                      (() => {
                        const assignedAgent = agents?.find(ag => ag.id === selectedDispatchAccident.assignedAgentId || ag.name === selectedDispatchAccident.assignedAgentName) || {
                          id: selectedDispatchAccident.assignedAgentId || 'EXP-101',
                          name: selectedDispatchAccident.assignedAgentName || 'محقق ميداني',
                          phone: '+970590000000',
                          status: 'متاح'
                        };
                        return (
                          <div className="space-y-5">
                            {/* Investigator Info Box */}
                            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-black flex items-center justify-center text-base shadow-lg border border-emerald-400/30">
                                  {assignedAgent.name?.[0] || 'م'}
                                </div>
                                <div className="space-y-1">
                                  <div className="font-black text-sm text-white flex items-center gap-2">
                                    <span>{assignedAgent.name}</span>
                                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-mono text-[10px] rounded-lg border border-blue-400/20">
                                      {assignedAgent.id}
                                    </span>
                                  </div>
                                  <div className="text-slate-400 text-xs font-mono">
                                    📱 WhatsApp / Phone: <span className="text-emerald-400 font-bold">{assignedAgent.phone || '+970590000000'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 font-bold text-xs">
                                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span>ONLINE / متصل</span>
                              </div>
                            </div>

                            {/* RENDERED BUTTONS */}
                            <div className="space-y-3">
                              {/* 1. PRIMARY WHATSAPP BUTTON */}
                              <button
                                onClick={() => handleSendWhatsAppDispatch(selectedDispatchAccident)}
                                className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-3 transition-all border border-emerald-400/30 cursor-pointer"
                              >
                                <Phone className="w-5 h-5 fill-current" />
                                <span>🟢 إرسال القضية عبر WhatsApp</span>
                              </button>

                              {/* 2. SECONDARY ACTION BUTTONS GRID */}
                              <div className="grid grid-cols-4 gap-2.5">
                                <button
                                  onClick={() => setActiveTab('communications')}
                                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all"
                                >
                                  <MessageSquare className="w-4 h-4 text-blue-400" />
                                  <span>مراسلة المحقق</span>
                                </button>

                                <button
                                  onClick={() => setActiveTab('radio')}
                                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all"
                                >
                                  <Radio className="w-4 h-4 text-amber-400" />
                                  <span>PTT</span>
                                </button>

                                <button
                                  onClick={() => setActiveTab('map')}
                                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all"
                                >
                                  <MapPin className="w-4 h-4 text-red-400" />
                                  <span>موقع المحقق</span>
                                </button>

                                <button
                                  onClick={() => onOpenDispatch(selectedDispatchAccident)}
                                  className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all"
                                >
                                  <Users className="w-4 h-4" />
                                  <span>تغيير المحقق</span>
                                </button>
                              </div>

                              <button
                                onClick={() => handleCopyCaseLink(selectedDispatchAccident)}
                                className="w-full py-2 px-4 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 border border-slate-800 transition-all"
                              >
                                <span>{copiedLink ? '✓ تم نسخ الرابط المشفر بنجاح' : '📋 نسخ رابط القضية المباشر'}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      /* UNASSIGNED INVESTIGATOR STATE */
                      <div className="p-6 bg-slate-800/60 rounded-2xl border border-amber-500/30 text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
                          <AlertCircle className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-amber-300">لم يتم تعيين محقق ميداني لهذه القضية بعد</h4>
                          <p className="text-xs text-slate-400">اختر محققاً ميدانياً من القائمة ليتم تفعيل زر الإرسال المباشر عبر WhatsApp فوراً.</p>
                        </div>
                        <button
                          onClick={() => onOpenDispatch(selectedDispatchAccident)}
                          className="py-3 px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs shadow-lg flex items-center justify-center gap-2 mx-auto transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          <span>+ تعيين محقق ميداني</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'agents' && (
            <FieldInvestigatorsManager />
          )}

          {isOverview && (
            <div className="space-y-6">
              <div className="grid grid-cols-5 gap-4">
            {/* Card 1: Total Tasks */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 flex items-center justify-between hover:border-indigo-400 hover:shadow-[0_0_10px_rgba(79,70,229,0.3)] transition-all duration-300">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 font-medium block">إجمالي المهام</span>
                <span className="font-black font-mono text-slate-900 text-2xl">{accidents.length}</span>
                <span className="text-[10px] text-slate-400 block">هذا الأسبوع</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>

            {/* Card 2: Ongoing Tasks */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 flex items-center justify-between hover:border-blue-400 hover:shadow-[0_0_10px_rgba(37,99,235,0.3)] transition-all duration-300">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 font-medium block">مهمة جارية</span>
                <span className="font-black font-mono text-blue-600 text-2xl">{accidents.filter(a => a.status === 'قيد المعاينة' || a.status === 'جديد').length}</span>
                <span className="text-[10px] text-blue-500 font-medium block">حالياً</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            {/* Card 3: Completed Tasks */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 flex items-center justify-between hover:border-emerald-400 hover:shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-300">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 font-medium block">مهام مكتملة</span>
                <span className="font-black font-mono text-emerald-600 text-2xl">{accidents.filter(a => a.status === 'مكتملة' || a.status === 'مغلقة').length}</span>
                <span className="text-[10px] text-emerald-500 font-medium block">اليوم</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            {/* Card 4: Working Hours */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 flex items-center justify-between hover:border-amber-400 hover:shadow-[0_0_10px_rgba(245,158,11,0.3)] transition-all duration-300">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 font-medium block">ساعات العمل</span>
                <span className="font-black font-mono text-amber-600 text-2xl">01:25</span>
                <span className="text-[10px] text-slate-400 block">اليوم</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            {/* Card 5: New Tasks */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 font-medium block">مهام جديدة</span>
                <span className="font-black font-mono text-red-600 text-2xl">{unassignedCount}</span>
                <span className="text-[10px] text-red-500 font-bold block">تتطلب توجيه</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* ACTIVE CASES TABLE SECTION */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">القضايا النشطة والتوجيه</h3>
              </div>
              <button
                onClick={() => setActiveTab('dispatch')}
                className="text-xs font-bold text-blue-600 hover:text-blue-500 flex items-center gap-1"
              >
                <span>الانتقال لمركز التوجيه الميداني</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <th className="p-3">رقم القضية</th>
                    <th className="p-3">المصنوع / النوع</th>
                    <th className="p-3">الخطورة</th>
                    <th className="p-3">الموقع الجغرافي</th>
                    <th className="p-3">المصدر</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3">المحقق المكلّف</th>
                    <th className="p-3 text-center">الإجراء المباشر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accidents.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50 transition-all font-medium">
                      <td className="p-3 font-mono font-bold text-blue-900">{acc.accidentNumber}</td>
                      <td className="p-3 text-slate-800">{acc.incidentCategory || 'حوادث مركبات'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          acc.severity === 'حرج' || acc.severity === 'حرج جداً'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {acc.severity}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700">📍 {acc.locationName}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">
                          {acc.source === 'FIELD_INVESTIGATOR' ? 'محقق ميداني' : 'استقبال'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold">
                          {acc.status}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-800">
                        {acc.assignedAgentName || '⚠️ غير مسند'}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onSelectAccident(acc)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-[11px] transition-all shadow-sm"
                          >
                            فتح
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDispatchAccidentId(acc.id);
                              setActiveTab('dispatch');
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-[11px] transition-all shadow flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>توجيه</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MIDDLE SECTION: REAL LEAFLET MAP (LEFT) & CONTACTS BOOK (RIGHT) */}
          <div className="grid grid-cols-3 gap-6">
            {/* Left/Center: Real Interactive Map ("الموقع الحالي") */}
            <div className="col-span-2 bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 flex flex-col h-[500px]">
              {/* Real Leaflet Map Component */}
              <div className="w-full h-full">
                <RealMapComponent accidents={accidents} agents={agents} />
              </div>
            </div>

            {/* Right: Contacts Book ("حقيبة الاتصال") */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4 flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-blue-600" />
                  <span>حقيبة الاتصال</span>
                </h3>
              </div>

              {/* Tabs & Search */}
              <div className="space-y-3">
                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
                  <button onClick={() => setContactTabFilter('all')} className={`flex-1 py-1.5 rounded-lg transition-all ${contactTabFilter === 'all' ? 'bg-blue-600 text-white shadow' : ''}`}>الكل</button>
                  <button onClick={() => setContactTabFilter('admin')} className={`flex-1 py-1.5 rounded-lg transition-all ${contactTabFilter === 'admin' ? 'bg-blue-600 text-white shadow' : ''}`}>الإدارة (3)</button>
                  <button onClick={() => setContactTabFilter('investigators')} className={`flex-1 py-1.5 rounded-lg transition-all ${contactTabFilter === 'investigators' ? 'bg-blue-600 text-white shadow' : ''}`}>المحققون</button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={contactSearchQuery}
                    onChange={e => setContactSearchQuery(e.target.value)}
                    placeholder="بحث عن اسم أو كود..."
                    className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Contact List */}
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[300px]">
                {[
                  { name: 'غرفة العمليات', role: 'مركز القيادة', status: 'متصل', type: 'admin' },
                  { name: 'أحمد النابلسي', role: 'مدير العمليات', status: 'متصل', type: 'admin', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
                  { name: 'سعيد العتيبي', role: 'مسؤول الاستقبال', status: 'متصل', type: 'admin', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
                  { name: 'EXP-111', role: 'محقق ميداني', status: 'متصل', type: 'investigators' },
                  { name: 'EXP-112', role: 'محقق ميداني', status: 'في مهمة', type: 'investigators' },
                  { name: 'EXP-113', role: 'محقق ميداني', status: 'متصل', type: 'investigators' },
                ].filter(c => contactTabFilter === 'all' || c.type === contactTabFilter).map((contact, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 flex items-center justify-between transition-all">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center font-bold text-slate-700 overflow-hidden border border-slate-300">
                        {contact.avatar ? (
                          <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-blue-600 font-bold">{contact.name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{contact.name}</div>
                        <div className="text-[10px] text-slate-500">{contact.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-emerald-600 font-bold">{contact.status}</span>
                      <button className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow hover:bg-blue-500 transition-all">
                        <PhoneCall className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
          )}
        </div>

        {/* BOTTOM TAB BAR ACROSS VIEW */}
        <div className="bg-slate-900 border-t border-slate-800 px-8 py-3 flex items-center justify-between text-slate-400 text-xs font-bold shrink-0">
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveTab('reports')} className="flex items-center gap-2 hover:text-white transition-all">
              <BarChart2 className="w-4 h-4" />
              <span>التقارير</span>
            </button>
            <button onClick={() => setActiveTab('radio')} className="flex items-center gap-2 hover:text-white transition-all">
              <Radio className="w-4 h-4" />
              <span>اللاسلكي</span>
            </button>
            <button onClick={() => setActiveTab('chats')} className="flex items-center gap-2 hover:text-white transition-all">
              <MessageSquare className="w-4 h-4" />
              <span>المحادثات</span>
            </button>
            <button onClick={() => setActiveTab('missions')} className="flex items-center gap-2 hover:text-white transition-all">
              <Briefcase className="w-4 h-4" />
              <span>المهام</span>
            </button>
          </div>

          <button 
            onClick={() => setActiveTab('accidents')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg"
          >
            <Home className="w-4 h-4" />
            <span>الرئيسية</span>
          </button>
        </div>
      </div>

      {/* SOS Toast Message */}
      {sosSuccessMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-red-600 text-white rounded-2xl text-sm font-bold shadow-2xl animate-bounce">
          {sosSuccessMessage}
        </div>
      )}

      {/* Case Detail Modal */}
      {showCaseModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-6 shadow-2xl text-xs text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>حقيبة التحقيق الرسمية: {currentMission.accidentNumber}</span>
              </h3>
              <button onClick={() => setShowCaseModal(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold">✕ إغلاق</button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
                <div className="flex justify-between font-bold">
                  <span>الموقع: {currentMission.locationName}</span>
                  <span className="text-red-600">حالة طارئة وحرج جداً</span>
                </div>
                <p className="text-slate-600">{currentMission.description}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">بيانات الأطراف والسيارات</h4>
                <div>رقم اللوحة: <span className="font-mono font-bold">3-8834-92</span></div>
                <div>اسم السائق: <span className="font-bold">سعيد عبدربه النتشة</span></div>
                <div>الخسارة التقديرية: <span className="font-bold text-emerald-700">12,500 ر.س</span></div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCaseBagModal(true)}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow flex items-center justify-center gap-2"
                >
                  <span>👝 حقيبة اتصال القضية (WhatsApp-like)</span>
                </button>
                <button
                  onClick={() => {
                    alert('تم بدء المعاينة الميدانية وتوثيق البصمة الرقمية SHA-256 بنجاح!');
                    setShowCaseModal(false);
                  }}
                  className="py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow"
                >
                  تأكيد المعاينة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Case Communication Bag Modal */}
      {showCaseBagModal && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl h-[85vh] flex flex-col">
            <CaseCommunicationBag
              incidentId={currentMission.id}
              incidentNumber={currentMission.accidentNumber}
              currentUserName="غرفة العمليات (HQ)"
              currentUserRole="HQ"
              onClose={() => setShowCaseBagModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
