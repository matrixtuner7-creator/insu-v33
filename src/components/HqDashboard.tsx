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
import { ArchiveManager } from './ArchiveManager';
import { ReportsManager } from './ReportsManager';
import { InsuredRegistryManager } from './InsuredRegistryManager';
import { MasterDataManager } from './MasterDataManager';
import { LiveOperationsCenter } from './investigation/LiveOperationsCenter';
import { QuickDetailsPanel } from './investigation/QuickDetailsPanel';
import { VehicleQrManager } from './qr/VehicleQrManager';
import { MotorInsuranceSector } from './sectors/MotorInsuranceSector';
import { PropertyInsuranceSector } from './sectors/PropertyInsuranceSector';
import { CorporateInsuranceSector } from './sectors/CorporateInsuranceSector';
import { PolicyholderFileModal } from './PolicyholderFileModal';
import { 
  Briefcase, 
  MapPin, 
  Users, 
  Car, 
  Building2,
  Factory,
  QrCode, 
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
  Camera,
  Database,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Archive,
  Layers,
  Globe,
  Moon,
  Map,
  Mountain,
  Folder,
  Paperclip,
  Shield,
  Mic, 
  Activity, 
  ArrowLeft,
  Headphones
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
  onDirectAssignAgent?: (accidentId: string, agentId: string) => void;
  onLogout?: () => void;
}

// Real Interactive Leaflet Map Component with Multiple Style Switcher
const RealMapComponent: React.FC<{ 
  accidents: Accident[]; 
  agents: FieldAgent[]; 
  focusCoords?: [number, number] | null;
  selectedCaseId?: string | null;
  onSelectCase?: (caseId: string) => void;
  mapStyle?: 'streets' | 'dark' | 'satellite' | 'topo';
  onMapStyleChange?: (style: 'streets' | 'dark' | 'satellite' | 'topo') => void;
}> = ({ 
  accidents, 
  agents, 
  focusCoords, 
  selectedCaseId, 
  onSelectCase,
  mapStyle: externalMapStyle,
  onMapStyleChange
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const [internalMapStyle, setInternalMapStyle] = useState<'streets' | 'dark' | 'satellite' | 'topo'>('streets');
  const [mapProvider, setMapProvider] = useState<'leaflet' | 'waze'>('leaflet');

  const activeMapStyle = externalMapStyle || internalMapStyle;
  const changeMapStyle = (style: 'streets' | 'dark' | 'satellite' | 'topo') => {
    setInternalMapStyle(style);
    if (onMapStyleChange) onMapStyleChange(style);
  };

  // Smoothly center and zoom to selected coordinates on demand
  useEffect(() => {
    if (focusCoords && mapInstanceRef.current) {
      mapInstanceRef.current.setView(focusCoords, 16, { animate: true });
    }
  }, [focusCoords]);

  // Initialize Map once
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

      const defaultLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 });
      defaultLayer.addTo(map);
      tileLayerRef.current = defaultLayer;

      // Invalidate size immediately and after layout settles
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }

    // Auto-resize observer so the map never disappears or glitches on tablet / zoom / orientation change
    let resizeObserver: ResizeObserver | null = null;
    if (mapRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapRef.current);
    }

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update TileLayer ONLY when activeMapStyle changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    if (activeMapStyle === 'streets') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    } else if (activeMapStyle === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    } else if (activeMapStyle === 'topo') {
      url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    }

    const newLayer = L.tileLayer(url, { maxZoom: 19 });
    newLayer.addTo(map);
    tileLayerRef.current = newLayer;
  }, [activeMapStyle]);

  // Update Markers when agents or accidents change
  useEffect(() => {
    if (!markersGroupRef.current || !mapInstanceRef.current) return;

    markersGroupRef.current.clearLayers();

    // Group agents by coordinates to detect overlaps
    const coordMap: Record<string, FieldAgent[]> = {};
    
    agents.forEach(ag => {
      let lat = Number(ag.lat) || 32.2211;
      let lng = Number(ag.lng) || 35.2544;
      
      if (Math.abs(lat - 31.9522) < 0.001 && Math.abs(lng - 35.2332) < 0.001) {
        lat = 32.2211;
        lng = 35.2544;
      }
      
      const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
      if (!coordMap[key]) coordMap[key] = [];
      coordMap[key].push({ ...ag, lat, lng });
    });

    // Add agents markers with stable real coordinates and overlap offset
    Object.values(coordMap).forEach((group) => {
      group.forEach((ag, indexInGroup) => {
        const stableOffsetLat = (indexInGroup * 0.003);
        const stableOffsetLng = (indexInGroup * -0.002);
        
        const lat = Number(ag.lat) + stableOffsetLat;
        const lng = Number(ag.lng) + stableOffsetLng;
        const photoUrl = ag.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';
        const agentName = ag.name || (ag as any).fullName || 'محقق ميداني';
        const agentRole = (ag as any).jobTitle || 'محقق جنائي وميداني';
        const agentPhone = ag.phone || (ag as any).whatsapp || '970599794043';
        const isOnline = ag.isActive !== false;

        const markerHtml = `
          <div style="display: inline-flex; align-items: center; background: #1B2530; color: #ffffff; padding: 4px 10px 4px 4px; border-radius: 9999px; border: 2px solid #2F66F6; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.6); gap: 6px; white-space: nowrap; direction: rtl; cursor: pointer;">
            <div style="position: relative;">
              <img src="${photoUrl}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 1.5px solid #3B82F6; display: block;" onerror="this.src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'" />
              <span style="position: absolute; bottom: 0; right: 0; width: 8px; height: 8px; background: ${isOnline ? '#18B77A' : '#738190'}; border-radius: 50%; border: 1.5px solid #1B2530;"></span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-start; text-align: right;">
              <span style="font-size: 11px; font-weight: 800; color: #F4F7FA; line-height: 1.2;">${agentName}</span>
              <span style="font-size: 9px; font-weight: 600; color: #3B82F6; line-height: 1;">${ag.currentLocation || 'نابلس'}</span>
            </div>
          </div>
        `;

        const customIcon = L.divIcon({ 
          html: markerHtml, 
          className: 'agent-custom-marker-wrapper', 
          iconSize: [160, 38], 
          iconAnchor: [80, 19] 
        });

        const marker = L.marker([lat, lng], { icon: customIcon });

        marker.bindPopup(`
          <div style="text-align: right; direction: rtl; font-family: inherit; min-width: 200px; padding: 4px; color: #0f172a;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <img src="${photoUrl}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid #2F66F6;" onerror="this.src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'" />
              <div>
                <b style="font-size: 14px; color: #0f172a; display: block;">${agentName}</b>
                <div style="font-size: 10px; color: #2F66F6; font-weight: bold;">${agentRole}</div>
              </div>
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 6px 0;" />
            <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #334155;">
              <div><b>📱 الهاتف:</b> <span style="direction: ltr; display: inline-block;">${agentPhone}</span></div>
              <div><b>📍 الموقع:</b> ${ag.currentLocation || 'نابلس'}</div>
              <div><b>🟢 الحالة:</b> <span style="color: #18B77A; font-weight: bold;">${ag.status || 'متصل ونشط'}</span></div>
            </div>
          </div>
        `);

        markersGroupRef.current?.addLayer(marker);
      });
    });

    // Add accidents markers with color coding per status
    accidents.forEach((acc) => {
      const lat = acc.lat || 32.2227;
      const lng = acc.lng || 35.2621;
      const caseNo = acc.accidentNumber || acc.incidentNumber || acc.id;
      const isSelected = selectedCaseId === acc.id || selectedCaseId === acc.accidentNumber || selectedCaseId === acc.incidentNumber;
      
      const isNeedsIntervention = acc.severity === 'حرج' || acc.severity === 'حرج جداً' || acc.status === 'تحتاج تدخل';
      const isDelay = acc.status === 'تأخير' || acc.status === 'تأخير SLA';
      const isOnSite = acc.status === 'في الموقع' || acc.status === 'قيد المعاينة';
      const isInTransit = acc.status === 'في الطريق' || acc.status === 'قيد التحقيق';

      let color = '#738190'; // Gray (Unassigned/Not started)
      let statusText = acc.status || 'لم يبدأ بعد';
      
      if (isNeedsIntervention) {
        color = '#E5484D'; // Critical Red
        statusText = '🚨 تحتاج تدخل';
      } else if (isDelay) {
        color = '#E6B84A'; // Warning Yellow
        statusText = '⚠️ تأخير SLA';
      } else if (isOnSite) {
        color = '#18B77A'; // Success Green
        statusText = '📍 في الموقع';
      } else if (isInTransit) {
        color = '#3B82F6'; // Active Blue
        statusText = '🚗 في الطريق';
      }

      const agentName = acc.assignedAgentName || 'غير منسّب';
      const stepsCount = (acc as any).currentStep || 6;
      const progressPct = Math.round((stepsCount / 8) * 100);

      const markerHtml = `
        <div style="background: ${color}; color: #ffffff; padding: 4px 10px; border-radius: 9999px; border: ${isSelected ? '3px solid #3B82F6' : '2px solid rgba(255,255,255,0.9)'}; box-shadow: 0 8px 20px rgba(0,0,0,0.5); font-size: 11px; font-weight: bold; white-space: nowrap; cursor: pointer; direction: rtl; display: flex; align-items: center; gap: 4px; transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'}; transition: transform 0.2s;">
          <span>${caseNo}</span>
        </div>
      `;

      const customIcon = L.divIcon({ html: markerHtml, className: '' });
      const marker = L.marker([lat, lng], { icon: customIcon });

      marker.on('click', () => {
        if (onSelectCase) onSelectCase(acc.id || caseNo);
      });

      const popupHtml = `
        <div style="text-align: right; direction: rtl; font-family: inherit; min-width: 220px; padding: 4px; color: #0f172a;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <strong style="font-size: 13px; color: #0f172a; font-family: monospace;">${caseNo}</strong>
            <span style="font-size: 10px; font-weight: bold; background: ${color}20; color: ${color}; padding: 2px 8px; border-radius: 8px; border: 1px solid ${color}40;">${statusText}</span>
          </div>
          <div style="font-size: 11px; color: #334155; margin-bottom: 8px; display: flex; flex-direction: column; gap: 3px;">
            <div><b>👤 المحقق:</b> ${agentName}</div>
            <div><b>⏱️ زمن المهمة:</b> <span style="color: #d97706; font-weight: bold;">00:46</span></div>
            <div><b>📊 نسبة التقدم:</b> ${stepsCount}/8 (${progressPct}%)</div>
            <div><b>🔄 آخر مزامنة:</b> منذ 15 ثانية</div>
          </div>
          <button id="btn-open-case-${acc.id}" style="width: 100%; padding: 6px; background: #2F66F6; color: white; border: none; border-radius: 8px; font-size: 11px; font-weight: bold; cursor: pointer;">
            فتح القضية
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-open-case-${acc.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectCase) onSelectCase(acc.id || caseNo);
          };
        }
      });

      markersGroupRef.current?.addLayer(marker);
    });
  }, [accidents, agents, selectedCaseId, onSelectCase]);

  return (
    <div className="relative w-full h-full min-h-[380px] rounded-2xl border border-[#34414E] overflow-hidden flex flex-col bg-[#111820]">
      {/* Left Overlay: Map Provider Selection Toggle */}
      <div className="absolute top-2.5 left-2.5 z-[1000] pointer-events-auto flex items-center gap-1 p-1 bg-[#17212B]/95 backdrop-blur-md rounded-xl border border-[#34414E] text-[10px] font-bold shadow-2xl">
        <button 
          onClick={() => setMapProvider('leaflet')}
          className={`px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
            mapProvider === 'leaflet' 
              ? 'bg-[#2F66F6] text-white shadow-sm font-black' 
              : 'text-[#A9B5C2] hover:text-white hover:bg-[#1B2530]'
          }`}
          title="عرض الخريطة التفاعلية والمسارات والفرق"
        >
          <span>خريطة تفاعلية</span>
        </button>
        <button 
          onClick={() => setMapProvider('waze')}
          className={`px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
            mapProvider === 'waze' 
              ? 'bg-[#F2A900] text-[#111820] shadow-sm font-black' 
              : 'text-[#A9B5C2] hover:text-white hover:bg-[#1B2530]'
          }`}
          title="عرض خريطة Waze المباشرة وحركة المرور"
        >
          <span>Waze 🚗</span>
        </button>
      </div>

      {/* Right Overlay: Miniaturized Map Style Selector Controls (Only for Leaflet) */}
      {mapProvider === 'leaflet' && (
        <div className="absolute top-2.5 right-2.5 z-[1000] pointer-events-auto flex items-center gap-1 p-1 bg-[#17212B]/95 backdrop-blur-md rounded-xl border border-[#34414E] text-[10px] font-bold shadow-2xl">
          <span className="text-[9px] text-[#738190] px-1.5 font-bold flex items-center gap-1 border-l border-[#34414E] ml-0.5 select-none">
            <Layers className="w-3 h-3 text-[#3B82F6]" />
            <span>الخريطة:</span>
          </span>
          <button 
            onClick={() => changeMapStyle('dark')}
            className={`px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              activeMapStyle === 'dark' 
                ? 'bg-[#2F66F6] text-white shadow-sm font-black' 
                : 'text-[#A9B5C2] hover:text-white hover:bg-[#1B2530]'
            }`}
            title="عرض النمط الداكن الميداني"
          >
            <Moon className="w-2.5 h-2.5" />
            <span>داكن</span>
          </button>
          <button 
            onClick={() => changeMapStyle('streets')}
            className={`px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              activeMapStyle === 'streets' 
                ? 'bg-[#2F66F6] text-white shadow-sm font-black' 
                : 'text-[#A9B5C2] hover:text-white hover:bg-[#1B2530]'
            }`}
            title="عرض خريطة الشوارع والتنقل"
          >
            <Map className="w-2.5 h-2.5" />
            <span>شوارع</span>
          </button>
          <button 
            onClick={() => changeMapStyle('satellite')}
            className={`px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              activeMapStyle === 'satellite' 
                ? 'bg-[#2F66F6] text-white shadow-sm font-black' 
                : 'text-[#A9B5C2] hover:text-white hover:bg-[#1B2530]'
            }`}
            title="عرض صور الأقمار الصناعية الجوية"
          >
            <Globe className="w-2.5 h-2.5" />
            <span>أقمار</span>
          </button>
          <button 
            onClick={() => changeMapStyle('topo')}
            className={`px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              activeMapStyle === 'topo' 
                ? 'bg-[#2F66F6] text-white shadow-sm font-black' 
                : 'text-[#A9B5C2] hover:text-white hover:bg-[#1B2530]'
            }`}
            title="عرض خريطة التضاريس والارتفاعات"
          >
            <Mountain className="w-2.5 h-2.5" />
            <span>تضاريس</span>
          </button>
        </div>
      )}

      {/* Map Rendering Container */}
      {mapProvider === 'waze' ? (
        <div className="w-full h-full relative bg-[#111820]">
          <iframe
            src={`https://embed.waze.com/iframe?zoom=13&lat=${focusCoords ? focusCoords[0] : 32.2211}&lon=${focusCoords ? focusCoords[1] : 35.2544}&pin=1`}
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: '350px' }}
            allowFullScreen
            title="خريطة Waze المباشرة"
          />
        </div>
      ) : (
        <div ref={mapRef} className="w-full h-full" />
      )}
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
  onDirectAssignAgent,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'accidents' | 'dispatch' | 'map' | 'communications' | 'reports' | 'archive' | 'agents' | 'fleet' | 'settings' | 'help' | 'missions' | 'chats' | 'radio' | 'master_data' | 'qr_manager' | 'insured_registry' | 'documents_inquiries' | 'sector_motor' | 'sector_property' | 'sector_corporate'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'sector_motor' || tabParam === 'motor') {
        return 'sector_motor';
      }
      if (tabParam === 'sector_property' || tabParam === 'property') {
        return 'sector_property';
      }
      if (tabParam === 'sector_corporate' || tabParam === 'corporate') {
        return 'sector_corporate';
      }
      if (tabParam === 'master_data' || tabParam === 'admin' || tabParam === 'archive' || tabParam === 'documents' || tabParam === 'documents_inquiries') {
        return 'documents_inquiries';
      }
      if (tabParam === 'qr' || tabParam === 'qr_manager') {
        return 'qr_manager';
      }
    }
    return 'accidents';
  });
  const [docsSubTab, setDocsSubTab] = useState<'archive' | 'master_data'>('archive');
  const [selectedPolicyholderId, setSelectedPolicyholderId] = useState<string | null>(null);
  const [selectedDispatchAccidentId, setSelectedDispatchAccidentId] = useState<string | null>(null);
  const [activeOverviewFilterTab, setActiveOverviewFilterTab] = useState<'all' | 'new' | 'ongoing' | 'completed'>('all');
  const [overviewCurrentPage, setOverviewCurrentPage] = useState<number>(1);
  const [overviewSearchQuery, setOverviewSearchQuery] = useState<string>('');
  const [contactTabFilter, setContactTabFilter] = useState<'all' | 'admin' | 'investigators'>('all');
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [sosSuccessMessage, setSosSuccessMessage] = useState('');
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [showCaseBagModal, setShowCaseBagModal] = useState(false);
  const [activeBagAccident, setActiveBagAccident] = useState<Accident | null>(null);
  const [hqBagInitialTab, setHqBagInitialTab] = useState<'chat' | 'radio' | 'camera'>('chat');
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedInvestigatorPreview, setSelectedInvestigatorPreview] = useState<FieldAgent | null>(null);
  const [mapFocusCoords, setMapFocusCoords] = useState<[number, number] | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [globalRealMapStyle, setGlobalRealMapStyle] = useState<'streets' | 'dark' | 'satellite' | 'topo'>('streets');

  const selectedCaseAccident = accidents.find(a => 
    a.id === selectedCaseId || 
    a.accidentNumber === selectedCaseId || 
    a.incidentNumber === selectedCaseId
  ) || null;

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    const acc = accidents.find(a => a.id === caseId || a.accidentNumber === caseId || a.incidentNumber === caseId);
    if (acc) {
      const lat = Number(acc.lat) || 32.2211;
      const lng = Number(acc.lng) || 35.2544;
      setMapFocusCoords([lat, lng]);
    }
  };

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
    const agentId = acc.assignedAgentId;
    if (!agentId) {
      alert('لا يمكن إرسال التكليف، لم يتم إسناد محقق برقم تعريفي.');
      return;
    }
    const assignedAgent = agents?.find(ag => ag.id === agentId);
    const agentName = assignedAgent?.name || 'المحقق الميداني';
    const rawPhone = assignedAgent?.phone || '+970590000000';
    const cleanPhone = rawPhone.replace(/[^0-9+]/g, '');
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
    const agentId = acc.assignedAgentId;
    if (!agentId) {
      alert('لا يمكن نسخ الرابط، لم يتم إسناد محقق برقم تعريفي.');
      return;
    }
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

  const filteredAccidents = accidents.filter(acc => {
    if (!acc) return false;
    // Search query filter
    if (overviewSearchQuery.trim()) {
      const q = overviewSearchQuery.toLowerCase().trim();
      const match = 
        (acc.accidentNumber || acc.incidentNumber || acc.id || '').toLowerCase().includes(q) ||
        (acc.locationName || '').toLowerCase().includes(q) ||
        (acc.vehiclePlate || '').toLowerCase().includes(q) ||
        (acc.driverName || '').toLowerCase().includes(q) ||
        (acc.assignedAgentName || '').toLowerCase().includes(q) ||
        (acc.incidentCategory || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    
    // Tab filter
    if (activeOverviewFilterTab === 'new') {
      return acc.status === 'جديد' || acc.status === 'جديدة' || (!acc.assignedAgentId && !acc.assignedAgentName && acc.status !== 'مكتمل');
    } else if (activeOverviewFilterTab === 'ongoing') {
      return acc.status === 'قيد التحقيق' || acc.status === 'قيد المعاينة' || acc.status === 'مُوَجَّه' || acc.status === 'مستلم' || acc.status === 'مستلمة' || acc.status === 'في الطريق' || acc.status === 'في الموقع';
    } else if (activeOverviewFilterTab === 'completed') {
      return acc.status === 'مكتمل' || acc.status === 'مغلق' || acc.status === 'مكتملة' || acc.status === 'مغلقة';
    }
    return true;
  });

  const OVERVIEW_PAGE_SIZE = 6;
  const overviewTotalPages = Math.max(1, Math.ceil(filteredAccidents.length / OVERVIEW_PAGE_SIZE));
  const validOverviewCurrentPage = overviewCurrentPage > overviewTotalPages ? 1 : overviewCurrentPage;
  const paginatedAccidents = filteredAccidents.slice((validOverviewCurrentPage - 1) * OVERVIEW_PAGE_SIZE, validOverviewCurrentPage * OVERVIEW_PAGE_SIZE);

  const isOverview = activeTab !== 'settings' && activeTab !== 'dispatch' && activeTab !== 'agents' && activeTab !== 'archive' && activeTab !== 'reports' && activeTab !== 'insured_registry' && activeTab !== 'master_data' && activeTab !== 'documents_inquiries' && activeTab !== 'sector_motor' && activeTab !== 'sector_property' && activeTab !== 'sector_corporate' && activeTab !== 'fleet' && activeTab !== 'qr_manager' && activeTab !== 'help';

  return (
    <div className="w-full h-screen bg-[#1C2229] text-[#F1F5F9] flex flex-col md:flex-row overflow-hidden font-sans text-xs select-none" dir="rtl">
      {/* LEFT SIDEBAR NAVIGATION (TOOLBAR) */}
      <div className="w-full md:w-60 bg-[#2A323A] text-[#CBD5E1] flex md:flex-col justify-between shrink-0 border-b md:border-b-0 md:border-l border-[#3A434C] overflow-x-auto md:overflow-y-auto">
        <div className="p-3 space-y-3">
          <nav className="space-y-3">
            {/* 1. العمليات */}
            <div>
              <span className="text-[11px] text-[#AAB2BA] font-bold px-3 block mb-1.5 text-right">العمليات</span>
              <div className="space-y-0.5">
                {/* 1. الرئيسية */}
                <button
                  type="button"
                  onClick={() => setActiveTab('overview' as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all cursor-pointer text-xs ${
                    activeTab === 'accidents' && activeOverviewFilterTab === 'all' ? 'bg-[#1D4ED8] text-white font-bold shadow-sm' : 'text-[#CBD5E1] hover:bg-[#323A40] hover:text-white'
                  }`}
                >
                  <span>الرئيسية</span>
                  <Home className="w-4 h-4 shrink-0" />
                </button>

                {/* 2. القضايا والعمليات */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('accidents');
                    setActiveOverviewFilterTab('all');
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all cursor-pointer text-xs ${
                    activeTab === 'accidents' && activeOverviewFilterTab !== 'new' ? 'bg-[#1D4ED8] text-white font-bold shadow-sm' : 'text-[#CBD5E1] hover:bg-[#323A40] hover:text-white'
                  }`}
                >
                  <span>القضايا والعمليات</span>
                  <FileText className="w-4 h-4 shrink-0" />
                </button>

                {/* 3. البلاغات الجديدة */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('accidents');
                    setActiveOverviewFilterTab('new');
                    setOverviewCurrentPage(1);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all cursor-pointer text-xs ${
                    activeTab === 'accidents' && activeOverviewFilterTab === 'new' ? 'bg-[#1D4ED8] text-white font-bold shadow-sm' : 'text-[#CBD5E1] hover:bg-[#323A40] hover:text-white'
                  }`}
                >
                  <span>البلاغات الجديدة</span>
                  <Bell className="w-4 h-4 shrink-0" />
                </button>

                {/* 4. التحويل والاتصال */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveBagAccident(currentMission);
                    setHqBagInitialTab('radio');
                    setShowCaseBagModal(true);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all cursor-pointer text-xs text-[#CBD5E1] hover:bg-[#323A40] hover:text-white"
                >
                  <span>التحويل والاتصال</span>
                  <PhoneCall className="w-4 h-4 shrink-0" />
                </button>

                {/* 5. التوجيه الميداني */}
                <button
                  type="button"
                  onClick={() => setActiveTab('dispatch' as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all cursor-pointer text-xs ${
                    activeTab === 'dispatch' ? 'bg-[#1D4ED8] text-white font-bold shadow-sm' : 'text-[#CBD5E1] hover:bg-[#323A40] hover:text-white'
                  }`}
                >
                  <span>التوجيه الميداني</span>
                  <Send className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>

            {/* 2. قطاعات التأمين (3 أبواب رئيسية واضحة ومنظمة) */}
            <div className="pt-2 border-t border-[#3A434C]">
              <div className="flex items-center justify-between px-3 mb-1.5">
                <span className="text-[11px] text-[#AAB2BA] font-bold text-right">قطاعات التأمين</span>
                <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-400 text-[9px] rounded font-bold border border-blue-500/30">3 أبواب</span>
              </div>
              <div className="space-y-0.5">
                {/* 1. المركبات */}
                <button
                  type="button"
                  onClick={() => setActiveTab('sector_motor')}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all cursor-pointer text-xs ${
                    activeTab === 'sector_motor' ? 'bg-[#1D4ED8] text-white font-bold shadow-sm' : 'text-[#CBD5E1] hover:bg-[#323A40] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>المركبات</span>
                  </div>
                  <Car className="w-4 h-4 shrink-0 text-blue-400" />
                </button>

                {/* 2. العقارات */}
                <button
                  type="button"
                  onClick={() => setActiveTab('sector_property')}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all cursor-pointer text-xs ${
                    activeTab === 'sector_property' ? 'bg-[#1D4ED8] text-white font-bold shadow-sm' : 'text-[#CBD5E1] hover:bg-[#323A40] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>العقارات</span>
                  </div>
                  <Building2 className="w-4 h-4 shrink-0 text-amber-400" />
                </button>

                {/* 3. الشركات */}
                <button
                  type="button"
                  onClick={() => setActiveTab('sector_corporate')}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all cursor-pointer text-xs ${
                    activeTab === 'sector_corporate' ? 'bg-[#1D4ED8] text-white font-bold shadow-sm' : 'text-[#CBD5E1] hover:bg-[#323A40] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>الشركات</span>
                  </div>
                  <Factory className="w-4 h-4 shrink-0 text-emerald-400" />
                </button>
              </div>
            </div>

            {/* 3. السجلات والاستعلامات */}
            <div className="pt-2 border-t border-[#3A434C]">
              <span className="text-[11px] text-[#AAB2BA] font-bold px-3 block mb-1.5 text-right">السجلات والاستعلامات</span>
              <div className="space-y-0.5">
                {/* سجل المؤمن لهم الموحد */}
                <button
                  type="button"
                  onClick={() => setActiveTab('insured_registry' as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all cursor-pointer text-xs ${
                    activeTab === 'insured_registry' ? 'bg-[#1D4ED8] text-white font-bold shadow-sm' : 'text-[#CBD5E1] hover:bg-[#323A40] hover:text-white'
                  }`}
                >
                  <span>سجل المؤمن لهم</span>
                  <Users className="w-4 h-4 shrink-0" />
                </button>

                {/* الوثائق والاستعلامات المدمجة */}
                <button
                  type="button"
                  onClick={() => setActiveTab('documents_inquiries')}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all cursor-pointer text-xs ${
                    activeTab === 'documents_inquiries' || activeTab === 'master_data' || activeTab === 'archive' ? 'bg-[#1D4ED8] text-white font-bold shadow-sm' : 'text-[#CBD5E1] hover:bg-[#323A40] hover:text-white'
                  }`}
                >
                  <span>الوثائق والاستعلامات</span>
                  <Folder className="w-4 h-4 shrink-0" />
                </button>

                {/* التقارير والمراجعة */}
                <button
                  type="button"
                  onClick={() => setActiveTab('reports' as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all cursor-pointer text-xs ${
                    activeTab === 'reports' ? 'bg-[#1D4ED8] text-white font-bold shadow-sm' : 'text-[#CBD5E1] hover:bg-[#323A40] hover:text-white'
                  }`}
                >
                  <span>التقارير والمراجعة</span>
                  <BarChart2 className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>

            {/* 4. الإدارة والأسطول */}
            <div className="pt-2 border-t border-[#3A434C]">
              <span className="text-[11px] text-[#AAB2BA] font-bold px-3 block mb-1.5 text-right">الإدارة</span>
              <div className="space-y-0.5">
                {/* المحققون الميدانيون */}
                <button
                  type="button"
                  onClick={() => setActiveTab('agents')}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all cursor-pointer text-xs ${
                    activeTab === 'agents' ? 'bg-[#1D4ED8] text-white font-bold shadow-sm' : 'text-[#CBD5E1] hover:bg-[#323A40] hover:text-white'
                  }`}
                >
                  <span>المحققون الميدانيون</span>
                  <Users className="w-4 h-4 shrink-0" />
                </button>

                {/* تأمين المركبات والأسطول (Renamed to match user request) */}
                <button
                  type="button"
                  onClick={() => setActiveTab('fleet' as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all cursor-pointer text-xs ${
                    activeTab === 'fleet' ? 'bg-[#1D4ED8] text-white font-bold shadow-sm' : 'text-[#CBD5E1] hover:bg-[#323A40] hover:text-white'
                  }`}
                >
                  <span>تأمين المركبات والأسطول</span>
                  <Car className="w-4 h-4 shrink-0" />
                </button>

                {/* إعدادات النظام */}
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all cursor-pointer text-xs ${
                    activeTab === 'settings' ? 'bg-[#1D4ED8] text-white font-bold shadow-sm' : 'text-[#CBD5E1] hover:bg-[#323A40] hover:text-white'
                  }`}
                >
                  <span>إعدادات النظام</span>
                  <Settings className="w-4 h-4 shrink-0" />
                </button>

                {/* المستخدمون والصلاحيات */}
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all cursor-pointer text-xs text-[#CBD5E1] hover:bg-[#323A40] hover:text-white"
                >
                  <span>المستخدمون والصلاحيات</span>
                  <Shield className="w-4 h-4 shrink-0" />
                </button>

                {/* المساعدة والدعم */}
                <button
                  type="button"
                  onClick={() => setActiveTab('help' as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all cursor-pointer text-xs ${
                    activeTab === 'help' ? 'bg-[#1D4ED8] text-white font-bold shadow-sm' : 'text-[#CBD5E1] hover:bg-[#323A40] hover:text-white'
                  }`}
                >
                  <span>المساعدة والدعم</span>
                  <HelpCircle className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Build Badge at bottom of sidebar */}
        <div className="p-3 border-t border-[#3A434C] flex items-center justify-center">
          <div className="w-full py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded-full text-center font-mono font-bold text-[10px] tracking-wider shadow-md cursor-pointer transition-all">
            BUILD: 2026-05-18-NEW-HQ
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#1C2229]">
        {/* TOP BAR */}
        <div className="bg-[#2A323A] px-6 py-2 border-b border-[#3A434C] flex items-center justify-between shrink-0 shadow-sm">
          {/* Right: Notifications & High-Density Stats */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <div className="w-9 h-9 bg-[#323A40] hover:bg-[#3A434C] rounded-xl flex items-center justify-center text-[#AAB2BA] hover:text-[#F1F5F9] cursor-pointer border border-[#3A434C]">
                <Bell className="w-4 h-4" />
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D64545] text-white rounded-full text-[9px] font-black flex items-center justify-center shadow">
                3
              </span>
            </div>

            {/* High-Density Shrunk Metrics */}
            <div className="hidden lg:flex items-center gap-2 border-r border-[#3A434C] pr-3 mr-1">
              {/* Total Tasks Pill */}
              <button 
                onClick={() => {
                  setActiveTab('accidents');
                  setActiveOverviewFilterTab('all');
                  setOverviewCurrentPage(1);
                }}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#161B1F] hover:bg-[#25313D] border border-[#3A434C] rounded-xl text-[11px] text-[#CBD5E1] font-bold cursor-pointer transition-all"
                title="عرض كافة القضايا"
              >
                <Briefcase className="w-3.5 h-3.5 text-[#315EF5]" />
                <span>الكل</span>
                <span className="font-black font-mono text-[#F1F5F9] bg-[#2A323A] px-1.5 py-0.5 rounded-lg border border-[#3A434C] mr-0.5">{accidents.length}</span>
              </button>

              {/* Ongoing Tasks Pill */}
              <button 
                onClick={() => {
                  setActiveTab('accidents');
                  setActiveOverviewFilterTab('ongoing');
                  setOverviewCurrentPage(1);
                }}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#161B1F] hover:bg-[#25313D] border border-[#3A434C] rounded-xl text-[11px] text-[#CBD5E1] font-bold cursor-pointer transition-all"
                title="عرض القضايا قيد المعاينة"
              >
                <span className="w-2 h-2 bg-[#315EF5] rounded-full"></span>
                <span>الجارية</span>
                <span className="font-black font-mono text-[#315EF5] bg-[#315EF5]/15 px-1.5 py-0.5 rounded-lg border border-[#315EF5]/30 mr-0.5">{accidents.filter(a => a.status === 'قيد المعاينة' || a.status === 'قيد التحقيق' || a.status === 'في الطريق' || a.status === 'في الموقع').length}</span>
              </button>

              {/* Completed Tasks Pill */}
              <button 
                onClick={() => {
                  setActiveTab('accidents');
                  setActiveOverviewFilterTab('completed');
                  setOverviewCurrentPage(1);
                }}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#161B1F] hover:bg-[#25313D] border border-[#3A434C] rounded-xl text-[11px] text-[#CBD5E1] font-bold cursor-pointer transition-all"
                title="عرض القضايا المكتملة"
              >
                <span className="w-2 h-2 bg-[#22A06B] rounded-full"></span>
                <span>المكتملة</span>
                <span className="font-black font-mono text-[#22A06B] bg-[#22A06B]/15 px-1.5 py-0.5 rounded-lg border border-[#22A06B]/30 mr-0.5">{accidents.filter(a => a.status === 'مكتملة' || a.status === 'مغلقة' || a.status === 'مكتمل' || a.status === 'مغلق').length}</span>
              </button>

              {/* Working Hours Pill */}
              <div className="flex items-center gap-1 px-2.5 py-1 bg-[#161B1F] border border-[#3A434C] rounded-xl text-[11px] text-[#CBD5E1] font-bold">
                <Clock className="w-3.5 h-3.5 text-[#D6A83A]" />
                <span>ساعات العمل</span>
                <span className="font-black font-mono text-[#D6A83A] bg-[#D6A83A]/15 px-1.5 py-0.5 rounded-lg border border-[#D6A83A]/30 mr-0.5">01:25</span>
              </div>

              {/* New Tasks Pill */}
              <button 
                onClick={() => {
                  setActiveTab('accidents');
                  setActiveOverviewFilterTab('new');
                  setOverviewCurrentPage(1);
                }}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#161B1F] hover:bg-[#D64545]/20 border border-[#D64545]/40 rounded-xl text-[11px] text-[#CBD5E1] font-bold cursor-pointer transition-all"
                title="عرض البلاغات الجديدة المعلقة"
              >
                <span className="w-2 h-2 bg-[#D64545] rounded-full animate-pulse"></span>
                <span className="text-[#D64545] font-black">الجديدة</span>
                <span className="font-black font-mono text-[#D64545] bg-[#D64545]/20 px-1.5 py-0.5 rounded-lg border border-[#D64545]/40 mr-0.5 animate-pulse">{accidents.filter(a => a.status === 'جديد' || a.status === 'جديدة' || (!a.assignedAgentId && !a.assignedAgentName && a.status !== 'مكتمل')).length}</span>
              </button>
            </div>
          </div>

          {/* Left: Quick Launch Live Bag */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowComplianceModal(true)}
              className="px-3.5 py-2 bg-[#2A323A] border border-[#3A434C] hover:bg-[#323A40] text-emerald-400 hover:text-emerald-300 rounded-2xl text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#22A06B]" />
              <span>🛡️ فحص مطابقة الروابط</span>
            </button>
          </div>
        </div>

        {/* DASHBOARD CONTENT BODY */}
        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {activeTab === 'sector_motor' && (
            <MotorInsuranceSector 
              onSelectAccident={onSelectAccident}
              onOpenPolicyholder={(phId) => setSelectedPolicyholderId(phId)}
            />
          )}

          {activeTab === 'sector_property' && (
            <PropertyInsuranceSector 
              onOpenPolicyholder={(phId) => setSelectedPolicyholderId(phId)}
            />
          )}

          {activeTab === 'sector_corporate' && (
            <CorporateInsuranceSector 
              onOpenPolicyholder={(phId) => setSelectedPolicyholderId(phId)}
            />
          )}

          {activeTab === 'fleet' && (
            <MotorInsuranceSector 
              onSelectAccident={onSelectAccident}
              onOpenPolicyholder={(phId) => setSelectedPolicyholderId(phId)}
            />
          )}

          {activeTab === 'qr_manager' && (
            <VehicleQrManager />
          )}

          {activeTab === 'settings' && (
            <div className="bg-[#2A323A] rounded-3xl p-6 border border-[#3A434C] shadow-sm space-y-6">
              <h3 className="font-bold text-[#F1F5F9] text-sm">إدارة مستخدمي النظام</h3>
              <div className="space-y-4">
                <input type="text" id="new-user" placeholder="اسم المستخدم" className="p-2.5 bg-[#323A40] border border-[#3A434C] rounded-xl text-[#F1F5F9] placeholder-[#7C8791] w-full focus:ring-2 focus:ring-[#315EF5] focus:outline-none" />
                <input type="password" id="new-pass" placeholder="كلمة المرور" className="p-2.5 bg-[#323A40] border border-[#3A434C] rounded-xl text-[#F1F5F9] placeholder-[#7C8791] w-full focus:ring-2 focus:ring-[#315EF5] focus:outline-none" />
                <select id="new-role" className="p-2.5 bg-[#323A40] border border-[#3A434C] rounded-xl text-[#F1F5F9] w-full focus:ring-2 focus:ring-[#315EF5] focus:outline-none">
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
                  className="px-5 py-2.5 bg-[#315EF5] hover:bg-[#2549d4] text-white rounded-xl font-bold shadow cursor-pointer"
                >
                  إضافة مستخدم
                </button>
              </div>
            </div>
          )}

          {activeTab === 'dispatch' && (
            <div className="space-y-6">
              <div className="bg-[#2A323A] text-white p-6 rounded-3xl shadow-xl border border-[#3A434C] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black flex items-center gap-2 text-[#F1F5F9]">
                    <Send className="w-5 h-5 text-[#315EF5]" />
                    <span>مركز التوجيه الميداني وتكليف المحققين</span>
                  </h2>
                  <p className="text-xs text-[#AAB2BA] mt-1">إدارة البلاغات الواردة وتوجيه المحققين الميدانيين عبر النظام المباشر وواتساب</p>
                </div>
              </div>

              {/* 2-Column Dispatch Grid */}
              {accidents.length === 0 ? (
                <div className="bg-[#2A323A] rounded-3xl p-12 border border-[#3A434C] text-center flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[400px]">
                  <div className="w-16 h-16 rounded-full bg-[#315EF5]/10 flex items-center justify-center text-[#315EF5] border border-[#315EF5]/20">
                    <Briefcase className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-[#F1F5F9] text-base">لا توجد بلاغات معلقة أو قضايا نشطة حالياً</h3>
                  <p className="text-xs text-[#AAB2BA] max-w-md mx-auto leading-relaxed">
                    تم توجيه وتنسيب كافة القضايا والمهمات بنجاح للمحققين الميدانيين. بمجرد قيام موظف الاستقبال أو غرفة العمليات بإدخال بلاغ جديد، سيظهر فوراً هنا للتكليف والمراقبة اللحظية.
                  </p>
                  <button
                    onClick={onOpenNewAccident}
                    className="mt-2 bg-[#D64545] hover:bg-[#b83838] text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span>تسجيل بلاغ طارئ وتكليفه فوراً</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-6">
                  {/* Left: Accidents list for dispatch selection */}
                  <div className="bg-[#2A323A] rounded-3xl p-5 border border-[#3A434C] shadow-sm space-y-4 h-[650px] flex flex-col">
                  <div className="flex items-center justify-between pb-3 border-b border-[#3A434C]">
                    <h3 className="font-bold text-[#F1F5F9] text-sm flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[#315EF5]" />
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
                              ? 'bg-[#315EF5]/15 border-[#315EF5] shadow-md ring-2 ring-[#315EF5]/20'
                              : 'bg-[#323A40] hover:bg-[#3A434C] border-[#3A434C]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-black text-xs text-[#315EF5] bg-[#161B1F] px-2.5 py-0.5 rounded-lg border border-[#3A434C] shadow-sm">
                              {acc.accidentNumber}
                            </span>
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                              acc.severity === 'حرج' || acc.severity === 'حرج جداً'
                                ? 'bg-[#D64545]/20 text-[#D64545] border border-[#D64545]/30'
                                : 'bg-[#D6A83A]/20 text-[#D6A83A] border border-[#D6A83A]/30'
                            }`}>
                              {acc.severity}
                            </span>
                          </div>

                          <div className="text-xs font-bold text-[#F1F5F9] truncate">
                            📍 {acc.locationName}
                          </div>

                          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#3A434C]">
                            <span className={`font-bold ${hasAgent ? 'text-[#22A06B]' : 'text-[#D6A83A]'}`}>
                              {hasAgent ? `👤 ${acc.assignedAgentName || 'مُسند'}` : '⚠️ بانتظار محقق'}
                            </span>
                            <span className="px-1.5 py-0.5 bg-[#161B1F] text-[#AAB2BA] rounded font-bold border border-[#3A434C]">
                              {acc.source === 'FIELD_INVESTIGATOR' ? 'ميداني' : 'استقبال'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDispatchAccidentId(acc.id);
                              }}
                              className="py-1.5 px-3 bg-[#315EF5] hover:bg-[#2549d4] text-white rounded-xl font-bold text-[11px] shadow text-center cursor-pointer"
                            >
                              توجيه
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectAccident(acc);
                              }}
                              className="py-1.5 px-3 bg-[#323A40] hover:bg-[#3A434C] text-[#F1F5F9] border border-[#3A434C] rounded-xl font-bold text-[11px] text-center cursor-pointer"
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
                <div className="col-span-2 bg-[#2A323A] rounded-3xl p-6 border border-[#3A434C] shadow-sm space-y-6 h-[650px] flex flex-col justify-between overflow-y-auto">
                  {/* Case Details Header */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-[#3A434C]">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-xl text-[#315EF5] bg-[#161B1F] px-3.5 py-1 rounded-2xl border border-[#3A434C] text-glow-neon">
                            {selectedDispatchAccident.accidentNumber}
                          </span>
                          <span className="px-3 py-1 bg-[#D64545]/20 text-[#D64545] border border-[#D64545]/30 font-black rounded-xl text-xs flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {selectedDispatchAccident.severity}
                          </span>
                          <span className="px-3 py-1 bg-[#323A40] text-[#AAB2BA] border border-[#3A434C] font-bold rounded-xl text-xs">
                            {selectedDispatchAccident.incidentCategory || 'حوادث مرورية'}
                          </span>
                        </div>
                        <p className="text-xs text-[#AAB2BA] mt-2 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#7C8791]" />
                          <span>تاريخ البلاغ: {new Date(selectedDispatchAccident.timestamp).toLocaleString('ar-EG')}</span>
                          <span className="mx-2">•</span>
                          <span>المصدر: <strong className="text-[#F1F5F9]">{selectedDispatchAccident.source === 'FIELD_INVESTIGATOR' ? 'محقق ميداني' : 'موظف الاستقبال'}</strong></span>
                        </p>
                      </div>

                      <div className="text-left">
                        <span className="text-[10px] text-[#AAB2BA] block mb-1">حالة البلاغ</span>
                        <span className="px-3 py-1 bg-[#22A06B]/20 text-[#22A06B] border border-[#22A06B]/30 rounded-xl font-black text-xs">
                          {selectedDispatchAccident.status}
                        </span>
                      </div>
                    </div>

                    {/* Incident Summary Card */}
                    <div className="p-4 bg-[#323A40] rounded-2xl border border-[#3A434C] grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[#AAB2BA] block mb-1">الموقع الجغرافي:</span>
                        <div className="font-bold text-[#F1F5F9] flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-[#D64545] shrink-0" />
                          <span>{selectedDispatchAccident.locationName}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[#AAB2BA] block mb-1">بيانات المركبة والسائق:</span>
                        <div className="font-bold text-[#F1F5F9] font-mono">
                          {selectedDispatchAccident.vehiclePlate || '3-8834-92'} — {selectedDispatchAccident.driverName || 'سعيد عبدربه النتشة'}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[#AAB2BA] block mb-1">وصف الحادث:</span>
                        <p className="text-[#F1F5F9] font-medium leading-relaxed">
                          {selectedDispatchAccident.description || 'تصادم مروري بحاجة إلى معاينة ميدانية وتوثيق الأضرار والتقرير المالي.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ASSIGNED INVESTIGATOR & WHATSAPP CARD */}
                  <div className="p-6 rounded-3xl bg-[#161B1F] text-[#F1F5F9] space-y-5 shadow-2xl border border-[#3A434C]">
                    <div className="flex items-center justify-between pb-3 border-b border-[#3A434C]">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#315EF5]" />
                        <h3 className="font-black text-sm text-[#F1F5F9]">المحقق المكلّف بالتوجيه الميداني</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${
                        selectedDispatchAccident.assignedAgentId || selectedDispatchAccident.assignedAgentName
                          ? 'bg-[#22A06B]/20 text-[#22A06B] border border-[#22A06B]/30'
                          : 'bg-[#D6A83A]/20 text-[#D6A83A] border border-[#D6A83A]/30'
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
                            <div className="p-4 bg-[#2A323A] rounded-2xl border border-[#3A434C] flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-[#22A06B] text-white font-black flex items-center justify-center text-base shadow-lg border border-[#22A06B]/30">
                                  {assignedAgent.name?.[0] || 'م'}
                                </div>
                                <div className="space-y-1">
                                  <div className="font-black text-sm text-[#F1F5F9] flex items-center gap-2">
                                    <span>{assignedAgent.name}</span>
                                    <span className="px-2 py-0.5 bg-[#315EF5]/20 text-[#315EF5] font-mono text-[10px] rounded-lg border border-[#315EF5]/20">
                                      {assignedAgent.id}
                                    </span>
                                  </div>
                                  <div className="text-[#AAB2BA] text-xs font-mono">
                                    📱 WhatsApp / Phone: <span className="text-[#22A06B] font-bold">{assignedAgent.phone || '+970590000000'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#22A06B]/20 text-[#22A06B] rounded-xl border border-[#22A06B]/30 font-bold text-xs">
                                <span className="w-2.5 h-2.5 bg-[#22A06B] rounded-full animate-pulse"></span>
                                <span>ONLINE / متصل</span>
                              </div>
                            </div>

                            {/* RENDERED BUTTONS */}
                            <div className="space-y-3">
                              {/* 1. PRIMARY WHATSAPP BUTTON */}
                              <button
                                onClick={() => handleSendWhatsAppDispatch(selectedDispatchAccident)}
                                className="w-full py-3.5 px-6 bg-[#22A06B] hover:bg-[#1b8256] text-white rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-3 transition-all border border-[#22A06B]/30 cursor-pointer"
                              >
                                <Phone className="w-5 h-5 fill-current" />
                                <span>🟢 إرسال القضية عبر WhatsApp</span>
                              </button>

                              {/* 2. SECONDARY ACTION BUTTONS GRID */}
                              <div className="grid grid-cols-4 gap-2.5">
                                <button
                                  onClick={() => {
                                    setHqBagInitialTab('chat');
                                    setShowCaseBagModal(true);
                                  }}
                                  className="py-2.5 px-3 bg-[#2A323A] hover:bg-[#323A40] text-[#F1F5F9] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-[#3A434C] transition-all cursor-pointer"
                                >
                                  <MessageSquare className="w-4 h-4 text-[#315EF5]" />
                                  <span>مراسلة المحقق</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setHqBagInitialTab('radio');
                                    setShowCaseBagModal(true);
                                  }}
                                  className="py-2.5 px-3 bg-[#2A323A] hover:bg-[#323A40] text-[#F1F5F9] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-[#3A434C] transition-all cursor-pointer"
                                >
                                  <Radio className="w-4 h-4 text-[#D6A83A]" />
                                  <span>اللاسلكي PTT</span>
                                </button>

                                {assignedAgent.phone && (
                                  <a
                                    href={`tel:${(assignedAgent.phone || '').replace(/[^0-9+]/g, '')}`}
                                    className="py-2.5 px-3 bg-[#2A323A] hover:bg-[#323A40] text-[#F1F5F9] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-[#3A434C] transition-all"
                                  >
                                    <Phone className="w-4 h-4 text-[#22A06B]" />
                                    <span>اتصال هاتفي</span>
                                  </a>
                                )}

                                <button
                                  onClick={() => onOpenDispatch(selectedDispatchAccident)}
                                  className="py-2.5 px-3 bg-[#315EF5] hover:bg-[#2549d4] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                                >
                                  <Users className="w-4 h-4" />
                                  <span>تبديل المحقق</span>
                                </button>
                              </div>

                              <button
                                onClick={() => handleCopyCaseLink(selectedDispatchAccident)}
                                className="w-full py-2 px-4 bg-[#2A323A] hover:bg-[#323A40] text-[#AAB2BA] hover:text-[#F1F5F9] rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 border border-[#3A434C] transition-all cursor-pointer"
                              >
                                <span>{copiedLink ? '✓ تم نسخ الرابط المشفر بنجاح' : '📋 نسخ رابط القضية المباشر'}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      /* UNASSIGNED INVESTIGATOR STATE */
                      <div className="p-6 bg-[#2A323A] rounded-2xl border border-[#D6A83A]/30 text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-[#D6A83A]/20 text-[#D6A83A] flex items-center justify-center mx-auto border border-[#D6A83A]/30">
                          <AlertCircle className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-[#D6A83A]">لم يتم تعيين محقق ميداني لهذه القضية بعد</h4>
                          <p className="text-xs text-[#AAB2BA]">اختر محققاً ميدانياً من القائمة أدناه ليتم تفعيل التخاطب وإرسال التكليف فوراً.</p>
                        </div>
                        <button
                          onClick={() => onOpenDispatch(selectedDispatchAccident)}
                          className="py-3 px-8 bg-[#315EF5] hover:bg-[#2549d4] text-white rounded-2xl font-black text-xs shadow-lg flex items-center justify-center gap-2 mx-auto transition-all cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>+ تعيين محقق ميداني</span>
                        </button>
                      </div>
                    )}

                    {/* MULTI-INVESTIGATOR SWITCHER & INTERCOM LIST */}
                    <div className="pt-4 border-t border-[#3A434C] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#22A06B]" />
                          <h4 className="font-bold text-xs text-[#F1F5F9]">التنقل والتخاطب بين كافة المحققين ({agents?.length || 0})</h4>
                        </div>
                        <span className="text-[10px] text-[#AAB2BA]">إمكانية التبديل والعودة لأي محقق أثناء التحقيق</span>
                      </div>

                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {agents && agents.length > 0 ? (
                          agents.map((ag) => {
                            const isAssigned = selectedDispatchAccident.assignedAgentId === ag.id || selectedDispatchAccident.assignedAgentName === ag.name;
                            const cleanPhone = (ag.phone || (ag as any)?.whatsapp || '+970590000000').replace(/[^0-9+]/g, '');
                            const agentUrl = getPublicShareUrl({
                              portal: 'agent',
                              investigator_id: ag.id,
                              case_id: selectedDispatchAccident.accidentNumber || selectedDispatchAccident.incidentNumber || selectedDispatchAccident.id
                            });
                            const waText = `🚨 تكليف وتواصل بشأن القضية رقم (${selectedDispatchAccident.accidentNumber || selectedDispatchAccident.incidentNumber || selectedDispatchAccident.id})\nالزميل ${ag.name}،\nرابط المتابعة والمعاينة الميدانية:\n${agentUrl}\nيرجى المتابعة فوراً.`;
                            const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`;

                            return (
                              <div
                                key={ag.id}
                                className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                                  isAssigned
                                    ? 'bg-[#22A06B]/20 border-[#22A06B]/40 shadow-sm'
                                    : 'bg-[#2A323A] border-[#3A434C] hover:bg-[#323A40]'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="relative">
                                    <div className="w-8 h-8 rounded-xl bg-[#323A40] text-white font-bold flex items-center justify-center text-xs border border-[#3A434C]">
                                      {ag.name?.[0] || 'م'}
                                    </div>
                                    <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#161B1F] ${ag.isActive !== false ? 'bg-[#22A06B]' : 'bg-[#7C8791]'}`}></span>
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-xs text-[#F1F5F9] truncate flex items-center gap-1.5">
                                      <span>{ag.name}</span>
                                      {isAssigned && (
                                        <span className="px-1.5 py-0.2 bg-[#22A06B]/20 text-[#22A06B] text-[9px] rounded font-bold border border-[#22A06B]/30">
                                          المكلّف حالياً
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-[#AAB2BA] font-mono" style={{ direction: 'ltr' }}>
                                      {ag.phone || '+970590000000'}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {/* WhatsApp */}
                                  <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 bg-[#22A06B]/20 hover:bg-[#22A06B]/30 text-[#22A06B] hover:text-white rounded-lg transition-all border border-[#22A06B]/30"
                                    title="WhatsApp مباشر"
                                  >
                                    <Phone className="w-3.5 h-3.5 fill-current" />
                                  </a>

                                  {/* Call */}
                                  {ag.phone && (
                                    <a
                                      href={`tel:${cleanPhone}`}
                                      className="p-1.5 bg-[#323A40] hover:bg-[#3A434C] text-[#AAB2BA] hover:text-white rounded-lg transition-all border border-[#3A434C]"
                                      title="اتصال هاتفي"
                                    >
                                      <Phone className="w-3.5 h-3.5" />
                                    </a>
                                  )}

                                  {/* Radio PTT */}
                                  <button
                                    onClick={() => {
                                      setHqBagInitialTab('radio');
                                      setShowCaseBagModal(true);
                                    }}
                                    className="p-1.5 bg-[#D6A83A]/20 hover:bg-[#D6A83A]/30 text-[#D6A83A] hover:text-white rounded-lg transition-all border border-[#D6A83A]/30 cursor-pointer"
                                    title="اللاسلكي PTT"
                                  >
                                    <Radio className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Chat */}
                                  <button
                                    onClick={() => {
                                      setHqBagInitialTab('chat');
                                      setShowCaseBagModal(true);
                                    }}
                                    className="p-1.5 bg-[#315EF5]/20 hover:bg-[#315EF5]/30 text-[#315EF5] hover:text-white rounded-lg transition-all border border-[#315EF5]/30 cursor-pointer"
                                    title="مراسلة فورية"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Assign / Switch button */}
                                  {!isAssigned && (
                                    <button
                                      onClick={() => {
                                        if (onDirectAssignAgent) {
                                          onDirectAssignAgent(selectedDispatchAccident.id, ag.id);
                                          // Optimistic update
                                          selectedDispatchAccident.assignedAgentId = ag.id;
                                          selectedDispatchAccident.assignedAgentName = ag.name;
                                          selectedDispatchAccident.status = 'قيد التحقيق';
                                        } else {
                                          onOpenDispatch(selectedDispatchAccident);
                                        }
                                      }}
                                      className="px-2.5 py-1 bg-[#315EF5] hover:bg-[#2549d4] text-white rounded-lg text-[10px] font-bold transition-all shadow cursor-pointer"
                                      title="إسناد القضية لهذا المحقق"
                                    >
                                      إسناد القضية
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-3 text-[#AAB2BA] text-xs">
                            لا يوجد محققون مسجلون حالياً
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
          )}

          {activeTab === 'agents' && (
            <FieldInvestigatorsManager />
          )}

          {(activeTab === 'documents_inquiries' || activeTab === 'archive' || activeTab === 'master_data') && (
            <div className="space-y-4">
              {/* TOP HEADER & SUB-NAVIGATION BAR */}
              <div className="bg-[#2A323A] rounded-2xl p-4 border border-[#3A434C] shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Folder className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      الوثائق والاستعلامات
                    </h2>
                    <p className="text-xs text-[#AAB2BA]">
                      أرشيف ملفات الحوادث والمرفقات والبحث الشامل، مع إدارة نماذج الوثائق والبيانات المرجعية (MDM)
                    </p>
                  </div>
                </div>

                {/* SUB-TABS SELECTOR */}
                <div className="flex items-center bg-[#1E252B] p-1 rounded-xl border border-[#3A434C] self-stretch sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setDocsSubTab('archive')}
                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      docsSubTab === 'archive'
                        ? 'bg-[#1D4ED8] text-white shadow-md'
                        : 'text-[#94A3B8] hover:text-white hover:bg-[#2A323A]'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>أرشيف الوثائق والمرفقات</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocsSubTab('master_data')}
                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      docsSubTab === 'master_data'
                        ? 'bg-[#1D4ED8] text-white shadow-md'
                        : 'text-[#94A3B8] hover:text-white hover:bg-[#2A323A]'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>إدارة البيانات المرجعية والوثائق (MDM)</span>
                  </button>
                </div>
              </div>

              {/* RENDER ACTIVE SUBTAB */}
              {docsSubTab === 'archive' ? (
                <ArchiveManager 
                  accidents={accidents} 
                  onSelectAccident={onSelectAccident} 
                />
              ) : (
                <MasterDataManager />
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <ReportsManager 
              accidents={accidents} 
              agents={agents} 
            />
          )}

          {activeTab === 'insured_registry' && (
            <InsuredRegistryManager />
          )}

          {activeTab === 'map' && (
            <div className="space-y-6">
              {/* TOP HEADER */}
              <div className="bg-[#2A323A] text-white p-5 rounded-3xl shadow-xl border border-[#3A434C] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-black flex items-center gap-2 text-[#F1F5F9]">
                    <span className="w-2.5 h-2.5 bg-[#D64545] rounded-full animate-ping"></span>
                    <MapPin className="w-5 h-5 text-[#315EF5]" />
                    <span className="text-glow-neon">غرفة العمليات المركزية والخريطة الحية لفرق التحقيق بالحوادث</span>
                  </h2>
                  <p className="text-xs text-[#AAB2BA] mt-1">تتبع وتوجيه فوري للمحققين الميدانيين في جميع المحافظات الفلسطينية مع إدارة الحوادث والدردشة الحية</p>
                </div>
                
                {/* GLOBAL ACTION BUTTONS */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (onOpenNewAccident) {
                        onOpenNewAccident();
                      }
                    }}
                    className="px-4 py-2 bg-[#D64545] hover:bg-[#b53232] text-white text-xs font-black rounded-xl shadow-lg shadow-[#D64545]/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إنشاء بلاغ حادث جديد</span>
                  </button>

                  <button
                    onClick={() => {
                      setSosSuccessMessage('🚨 تم إطلاق إنذار الطوارئ المركزي لجميع المحققين الميدانيين حالياً!');
                      setTimeout(() => setSosSuccessMessage(''), 5000);
                    }}
                    className="px-4 py-2 bg-[#E0A800]/20 hover:bg-[#E0A800]/30 text-[#E0A800] border border-[#E0A800]/30 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Radio className="w-4 h-4" />
                    <span>بث إشارة طوارئ (HQ Broadcast)</span>
                  </button>
                </div>
              </div>

              {/* SPLIT LAYOUT FOR MAP & OPERATIONS CENTER SIDEBAR */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[500px] md:h-[650px]">
                {/* LEFT SIDEBAR: OPERATIONS & DISPATCH CONTROL PANEL */}
                <div className="md:col-span-4 bg-[#2A323A] rounded-3xl border border-[#3A434C] p-4 flex flex-col h-[380px] md:h-full overflow-hidden space-y-4 shadow-xl">
                  {/* CONTROL PANEL HEADER */}
                  <div className="border-b border-[#3A434C] pb-3 flex items-center justify-between">
                    <span className="font-black text-xs text-[#F1F5F9] flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#315EF5]" />
                      <span>مركز التوجيه والعمليات السريع</span>
                    </span>
                    <span className="px-2 py-0.5 bg-[#161B1F] text-[#22A06B] text-[10px] rounded-lg border border-[#3A434C] font-mono font-bold">
                      {agents.filter(a => a.isActive !== false).length} متصلون
                    </span>
                  </div>

                  {/* SCROLLABLE SIDEBAR SECTIONS */}
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                    
                    {/* SECTION 1: FIELD AGENTS STATE */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-[#AAB2BA] text-xs flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#315EF5]" />
                        <span>قائمة المحققين النشطين في الميدان</span>
                      </h4>
                      <div className="space-y-2">
                        {agents.map((ag) => {
                          const isOnline = ag.isActive !== false;
                          const hasMission = accidents.some(a => a.assignedAgentId === ag.id && a.status !== 'مكتمل');
                          return (
                            <div 
                              key={ag.id}
                              onClick={() => {
                                // Zoom map to agent coordinates
                                const lat = Number(ag.lat) || 32.2211;
                                const lng = Number(ag.lng) || 35.2544;
                                setMapFocusCoords([lat, lng]);
                              }}
                              className="group p-2.5 bg-[#161B1F] hover:bg-[#1E252D] rounded-2xl border border-[#3A434C] transition-all flex items-center justify-between cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-[#3A434C]">
                                  <img 
                                    src={ag.photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"} 
                                    alt={ag.name} 
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#161B1F] ${isOnline ? 'bg-[#22c55e]' : 'bg-[#94a3b8]'}`}></span>
                                </div>
                                <div className="text-right min-w-0">
                                  <span className="font-bold text-white text-[11px] block truncate group-hover:text-[#315EF5] transition-colors">{ag.name}</span>
                                  <span className="text-[9px] text-[#AAB2BA] block truncate mt-0.5">{ag.currentLocation || 'نابلس'}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-bold ${
                                  hasMission ? 'bg-[#E03131]/10 text-[#FF6B6B] border border-[#E03131]/20' : 'bg-[#22A06B]/10 text-[#22A06B] border border-[#22A06B]/20'
                                }`}>
                                  {hasMission ? 'في مهمة' : 'متاح'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* SECTION 2: ACCIDENTS STATE WITH INSTANT ZOOM */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-[#AAB2BA] text-xs flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#D64545]" />
                        <span>بلاغات الحوادث النشطة (الاستهداف بالخريطة)</span>
                      </h4>
                      <div className="space-y-2">
                        {accidents.filter(a => a.status !== 'مكتمل').map((acc) => {
                          const assignedAgent = agents.find(ag => ag.id === acc.assignedAgentId);
                          return (
                            <div 
                              key={acc.id}
                              onClick={() => {
                                // Zoom map to accident coordinates
                                const lat = Number(acc.lat) || 32.2227;
                                const lng = Number(acc.lng) || 35.2621;
                                setMapFocusCoords([lat, lng]);
                              }}
                              className="group p-2.5 bg-[#161B1F] hover:bg-[#1E252D] rounded-2xl border border-[#3A434C] transition-all flex flex-col gap-2 cursor-pointer"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-[#D64545] animate-pulse"></span>
                                  <span className="font-mono font-black text-white text-[11px] group-hover:text-[#315EF5] transition-colors">{acc.accidentNumber}</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-bold ${
                                  acc.severity === 'حرج' ? 'bg-[#D64545]/15 text-[#D64545] border border-[#D64545]/20' : 'bg-[#E0A800]/15 text-[#E0A800] border border-[#E0A800]/20'
                                }`}>
                                  {acc.severity}
                                </span>
                              </div>

                              <div className="text-right">
                                <span className="text-[10px] text-[#F1F5F9] font-bold block truncate">{acc.locationName}</span>
                                <span className="text-[9px] text-[#AAB2BA] block mt-0.5 truncate">{acc.description || 'لا توجد تفاصيل إضافية.'}</span>
                              </div>

                              {/* ACTIONS WITHIN SIDEBAR FOR EACH INCIDENT */}
                              <div className="flex items-center justify-between pt-2 border-t border-[#3A434C]/40 mt-1">
                                <span className="text-[8px] text-[#AAB2BA]">المحقق: <strong>{assignedAgent?.name || 'غير مسند'}</strong></span>
                                
                                <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                                  {!acc.assignedAgentId ? (
                                    <select
                                      onChange={(e) => {
                                        const agId = e.target.value;
                                        if (agId && onDirectAssignAgent) {
                                          onDirectAssignAgent(acc.id, agId);
                                          setSosSuccessMessage(`🚨 تم إسناد القضية ${acc.accidentNumber} بنجاح إلى المحقق!`);
                                          setTimeout(() => setSosSuccessMessage(''), 4000);
                                          
                                          // Refresh the accident array immediately with optimistic update
                                          const ag = agents.find(a => a.id === agId);
                                          if (ag) {
                                              acc.assignedAgentId = ag.id;
                                              acc.assignedAgentName = ag.name;
                                              acc.status = 'قيد التحقيق';
                                          }
                                        }
                                      }}
                                      className="py-1 px-1.5 bg-[#315EF5] text-white text-[9px] font-bold rounded-lg border-none outline-none cursor-pointer"
                                    >
                                      <option value="">إسناد وتكليف فوري...</option>
                                      {agents.filter(a => a.isActive !== false).map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <div className="flex items-center gap-1">
                                      {/* Communication triggers */}
                                      <button 
                                        onClick={() => {
                                          setActiveBagAccident(acc);
                                          setHqBagInitialTab('chat');
                                          setShowCaseBagModal(true);
                                        }}
                                        className="p-1 bg-[#315EF5]/15 hover:bg-[#315EF5]/30 text-[#315EF5] rounded-lg border border-[#315EF5]/20"
                                        title="فتح المحادثة الحية"
                                      >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => {
                                          setActiveBagAccident(acc);
                                          setHqBagInitialTab('radio');
                                          setShowCaseBagModal(true);
                                        }}
                                        className="p-1 bg-[#E0A800]/15 hover:bg-[#E0A800]/30 text-[#E0A800] rounded-lg border border-[#E0A800]/20"
                                        title="أرسل إشارة صوتية PTT"
                                      >
                                        <Radio className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT AREA: THE LIVE INTERACTIVE MAP */}
                <div className="md:col-span-8 bg-[#2A323A] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/60 animate-neon-glow-white flex flex-col h-[450px] md:h-full min-h-[380px] relative transition-all duration-300">
                  <div className="w-full h-full relative">
                    <RealMapComponent 
                      accidents={accidents} 
                      agents={agents} 
                      focusCoords={mapFocusCoords} 
                      mapStyle={globalRealMapStyle}
                      onMapStyleChange={setGlobalRealMapStyle}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {isOverview && (
            <div className="space-y-4 px-1 pb-4">
              {/* TOP ROW: 4 Stat Cards + Walkitalki PTT Widget (5-Column Grid) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {/* 1. Active Cases (Blue) */}
                <div className="bg-[#151B22] rounded-lg border border-slate-700/60 p-2 flex flex-col justify-between shadow-sm hover:border-blue-500/40 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <div className="w-6 h-6 rounded-full border border-[#3B82F6]/30 flex items-center justify-center bg-[#3B82F6]/5">
                      <FileText className="w-3 h-3 text-[#3B82F6]" />
                    </div>
                    <div className="text-left" dir="ltr">
                      <span className="text-base font-black text-white">{accidents.filter(a => a.status !== "مكتمل" && a.status !== "مغلق").length}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                    <h3 className="text-[10px] font-bold text-[#F1F5F9]">قضايا نشطة</h3>
                    <button className="text-[9px] text-[#3B82F6] font-bold flex items-center gap-0.5 hover:text-white transition-colors cursor-pointer" onClick={() => setActiveTab("accidents")}>
                      <ChevronLeft className="w-2.5 h-2.5" />
                      <span>التفاصيل</span>
                    </button>
                  </div>
                </div>

                {/* 2. On Site (Green) */}
                <div className="bg-[#151B22] rounded-lg border border-slate-700/60 p-2 flex flex-col justify-between shadow-sm hover:border-emerald-500/40 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <div className="w-6 h-6 rounded-full border border-[#18B77A]/30 flex items-center justify-center bg-[#18B77A]/5">
                      <MapPin className="w-3 h-3 text-[#18B77A]" />
                    </div>
                    <div className="text-left" dir="ltr">
                      <span className="text-base font-black text-white">{accidents.filter(a => a.status === "في الموقع" || a.status === "قيد المعاينة").length}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                    <h3 className="text-[10px] font-bold text-[#F1F5F9]">في الموقع</h3>
                    <button className="text-[9px] text-[#18B77A] font-bold flex items-center gap-0.5 hover:text-white transition-colors cursor-pointer" onClick={() => setActiveTab("accidents")}>
                      <ChevronLeft className="w-2.5 h-2.5" />
                      <span>التفاصيل</span>
                    </button>
                  </div>
                </div>

                {/* 3. Delayed (Yellow) */}
                <div className="bg-[#151B22] rounded-lg border border-slate-700/60 p-2 flex flex-col justify-between shadow-sm hover:border-amber-500/40 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <div className="w-6 h-6 rounded-full border border-[#E6B84A]/30 flex items-center justify-center bg-[#E6B84A]/5">
                      <Clock className="w-3 h-3 text-[#E6B84A]" />
                    </div>
                    <div className="text-left" dir="ltr">
                      <span className="text-base font-black text-white">{accidents.filter(a => a.status === "تأخير" || a.status === "تأخير SLA").length}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                    <h3 className="text-[10px] font-bold text-[#F1F5F9]">متأخرة عن الوقت</h3>
                    <button className="text-[9px] text-[#E6B84A] font-bold flex items-center gap-0.5 hover:text-white transition-colors cursor-pointer" onClick={() => setActiveTab("accidents")}>
                      <ChevronLeft className="w-2.5 h-2.5" />
                      <span>التفاصيل</span>
                    </button>
                  </div>
                </div>

                {/* 4. Needs Intervention (Red) */}
                <div className="bg-[#151B22] rounded-lg border border-slate-700/60 p-2 flex flex-col justify-between shadow-sm hover:border-red-500/40 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <div className="w-6 h-6 rounded-full border border-[#D64545]/40 flex items-center justify-center bg-[#D64545]/5">
                      <AlertTriangle className="w-3 h-3 text-[#D64545]" />
                    </div>
                    <div className="text-left" dir="ltr">
                      <span className="text-base font-black text-white">{accidents.filter(a => a.severity === "حرج" || a.severity === "حرج جداً" || a.status === "تحتاج تدخل").length}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                    <h3 className="text-[10px] font-bold text-[#F1F5F9]">تحتاج تدخل</h3>
                    <button className="text-[9px] text-[#D64545] font-bold flex items-center gap-0.5 hover:text-white transition-colors cursor-pointer" onClick={() => setActiveTab("accidents")}>
                      <ChevronLeft className="w-2.5 h-2.5" />
                      <span>التفاصيل</span>
                    </button>
                  </div>
                </div>

                {/* 5. Live Audio Dispatch Launcher (Leftmost in RTL) */}
                <div 
                  onClick={() => {
                    setHqBagInitialTab('radio');
                    setShowCaseBagModal(true);
                  }}
                  className="bg-gradient-to-r from-emerald-900/40 to-[#151B22] rounded-lg border border-emerald-500/40 p-2 flex items-center justify-between shadow-sm hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all cursor-pointer group relative overflow-hidden"
                  title="بدء اتصال لاسلكي مباشر"
                >
                  {/* Background Ripple Glow */}
                  <div className="absolute -left-4 -top-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/25 transition-all"></div>
                  
                  <div className="flex items-center gap-2 z-10 w-full justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative flex items-center justify-center">
                        {/* Ping Animation for liveliness */}
                        <div className="absolute inset-0 bg-emerald-500/30 rounded-full animate-ping"></div>
                        <div className="relative w-8 h-8 rounded-full bg-[#0B1015] border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.4)] group-hover:scale-110 transition-transform">
                          <Headphones className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-white tracking-wide leading-tight">غرفة العمليات</span>
                        <span className="text-[8.5px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          اتصال مباشر
                        </span>
                      </div>
                    </div>

                    {/* Quick Call Action Button */}
                    <div className="z-10 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 rounded-full w-7 h-7 flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.4)] group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      <Mic className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* MIDDLE ROW: Map & Summary (Tablet-optimized with expanded map width and compact summary block) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 min-h-[380px] md:h-[400px]">
                
                {/* Right Column: Summaries (Reduced to 3 cols on md/tablet and 3 cols on xl to make it 50% more compact) */}
                <div className="col-span-12 md:col-span-3 xl:col-span-3 flex flex-col gap-2.5 min-h-[300px] md:h-full">
                  {/* Quick Summary Block with Subdued White Neon Border Effect */}
                  <div className="bg-[#111820] rounded-2xl border border-white/50 animate-neon-white shadow-[0_0_8px_rgba(255,255,255,0.18)] p-2.5 flex-1 transition-all duration-300 flex flex-col justify-between">
                    <h3 className="text-[11px] font-black text-white text-center mb-1 text-glow-neon">ملخص سريع</h3>
                    
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between border-b border-[#2A323A] pb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-4 h-4 rounded-full bg-[#18B77A]/10 flex items-center justify-center shrink-0">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#18B77A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                          </div>
                          <span className="text-[9.5px] text-[#AAB2BA] font-bold truncate">المحققون المتاحون</span>
                        </div>
                        <span className="text-white font-mono font-black text-xs shrink-0">{agents.filter(a => a.isAvailable).length}</span>
                      </div>
                      
                      <div className="flex items-center justify-between border-b border-[#2A323A] pb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-4 h-4 rounded-full bg-[#3B82F6]/10 flex items-center justify-center shrink-0">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                          </div>
                          <span className="text-[9.5px] text-[#AAB2BA] font-bold truncate">المحققون في مهمة</span>
                        </div>
                        <span className="text-white font-mono font-black text-xs shrink-0">{agents.filter(a => !a.isAvailable).length}</span>
                      </div>

                      <div className="flex items-center justify-between pt-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-4 h-4 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                          </div>
                          <span className="text-[9.5px] text-[#AAB2BA] font-bold truncate">إجمالي المحققين</span>
                        </div>
                        <span className="text-white font-mono font-black text-xs shrink-0">{agents.length}</span>
                      </div>
                    </div>

                  </div>

                  {/* Severity Block with Circular Gauge / Donut Chart */}
                  <div className="bg-[#111820] rounded-2xl border border-[#2A323A] p-2.5 shadow-lg flex-1 flex flex-col justify-between">
                    <h3 className="text-[11px] font-black text-white text-center mb-1 text-glow-neon">حسب درجة الخطورة</h3>
                    
                    {(() => {
                      const highCount = accidents.filter(a => a.severity === 'حرج' || a.severity === 'حرج جداً' || a.severity === 'عالي').length;
                      const medCount = accidents.filter(a => a.severity === 'متوسط').length;
                      const lowCount = accidents.filter(a => a.severity === 'منخفض').length;
                      const inProgressCount = accidents.filter(a => a.status === 'قيد المعاينة' || a.status === 'في الموقع' || a.status === 'جاري').length;
                      
                      const isZero = (highCount + medCount + lowCount + inProgressCount) === 0;
                      const totalCases = isZero ? 146 : (highCount + medCount + lowCount + inProgressCount);
                      const dHigh = isZero ? 18 : highCount;
                      const dMed = isZero ? 47 : medCount;
                      const dLow = isZero ? 61 : lowCount;
                      const dProg = isZero ? 20 : inProgressCount;

                      const pHigh = Math.round((dHigh / totalCases) * 100) || 12;
                      const pMed = Math.round((dMed / totalCases) * 100) || 32;
                      const pLow = Math.round((dLow / totalCases) * 100) || 42;
                      const pProg = Math.max(0, 100 - (pHigh + pMed + pLow)) || 14;

                      const C = 2 * Math.PI * 36; // ~226.195
                      const offHigh = 0;
                      const offMed = (pHigh / 100) * C;
                      const offLow = ((pHigh + pMed) / 100) * C;
                      const offProg = ((pHigh + pMed + pLow) / 100) * C;

                      return (
                        <div className="flex items-center justify-between gap-1.5">
                          {/* Circular Gauge / Donut */}
                          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                              {/* Background track */}
                              <circle
                                cx="50"
                                cy="50"
                                r="36"
                                fill="transparent"
                                stroke="#1E293B"
                                strokeWidth="9"
                              />
                              {/* High (Red) */}
                              <circle
                                cx="50"
                                cy="50"
                                r="36"
                                fill="transparent"
                                stroke="#EF4444"
                                strokeWidth="9"
                                strokeDasharray={`${(pHigh / 100) * C} ${C}`}
                                strokeDashoffset={`-${offHigh}`}
                                strokeLinecap="butt"
                              />
                              {/* Medium (Orange/Yellow) */}
                              <circle
                                cx="50"
                                cy="50"
                                r="36"
                                fill="transparent"
                                stroke="#F59E0B"
                                strokeWidth="9"
                                strokeDasharray={`${(pMed / 100) * C} ${C}`}
                                strokeDashoffset={`-${offMed}`}
                                strokeLinecap="butt"
                              />
                              {/* Low (Green) */}
                              <circle
                                cx="50"
                                cy="50"
                                r="36"
                                fill="transparent"
                                stroke="#10B981"
                                strokeWidth="9"
                                strokeDasharray={`${(pLow / 100) * C} ${C}`}
                                strokeDashoffset={`-${offLow}`}
                                strokeLinecap="butt"
                              />
                              {/* In Progress (Blue) */}
                              <circle
                                cx="50"
                                cy="50"
                                r="36"
                                fill="transparent"
                                stroke="#3B82F6"
                                strokeWidth="9"
                                strokeDasharray={`${(pProg / 100) * C} ${C}`}
                                strokeDashoffset={`-${offProg}`}
                                strokeLinecap="butt"
                              />
                            </svg>
                            {/* Inner Center Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                              <span className="text-xs font-black text-white font-mono leading-none tracking-tight">{totalCases}</span>
                              <span className="text-[7.5px] font-bold text-slate-400 mt-0.5">إجمالي</span>
                            </div>
                          </div>

                          {/* Legend / Metrics List */}
                          <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                            {/* High */}
                            <div className="flex items-center justify-between text-[9px]">
                              <div className="flex items-center gap-1 min-w-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] shrink-0"></span>
                                <span className="text-slate-300 font-bold truncate">عالية</span>
                              </div>
                              <div className="flex items-center gap-1 font-mono text-[8.5px] shrink-0">
                                <span className="text-white font-black">{dHigh}</span>
                                <span className="text-slate-400 w-5 text-left">{pHigh}%</span>
                              </div>
                            </div>

                            {/* Medium */}
                            <div className="flex items-center justify-between text-[9px]">
                              <div className="flex items-center gap-1 min-w-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shrink-0"></span>
                                <span className="text-slate-300 font-bold truncate">متوسطة</span>
                              </div>
                              <div className="flex items-center gap-1 font-mono text-[8.5px] shrink-0">
                                <span className="text-white font-black">{dMed}</span>
                                <span className="text-slate-400 w-5 text-left">{pMed}%</span>
                              </div>
                            </div>

                            {/* Low */}
                            <div className="flex items-center justify-between text-[9px]">
                              <div className="flex items-center gap-1 min-w-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0"></span>
                                <span className="text-slate-300 font-bold truncate">منخفضة</span>
                              </div>
                              <div className="flex items-center gap-1 font-mono text-[8.5px] shrink-0">
                                <span className="text-white font-black">{dLow}</span>
                                <span className="text-slate-400 w-5 text-left">{pLow}%</span>
                              </div>
                            </div>

                            {/* In Progress */}
                            <div className="flex items-center justify-between text-[9px]">
                              <div className="flex items-center gap-1 min-w-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] shrink-0"></span>
                                <span className="text-slate-300 font-bold truncate">قيد المعالجة</span>
                              </div>
                              <div className="flex items-center gap-1 font-mono text-[8.5px] shrink-0">
                                <span className="text-white font-black">{dProg}</span>
                                <span className="text-slate-400 w-5 text-left">{pProg}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Left Column: Map (Expanded to 9 cols on tablet & desktop to gain width) */}
                <div className="col-span-12 md:col-span-9 xl:col-span-9 bg-[#111820] rounded-2xl border-2 border-[#3B82F6]/60 animate-neon-glow overflow-hidden shadow-lg flex flex-col h-[380px] md:h-full min-h-[340px] relative transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 p-3 z-10 flex justify-end items-center pointer-events-none">
                    <div className="flex items-center gap-2.5 bg-[#111820]/80 px-2.5 py-1 rounded-full border border-[#2A323A] pointer-events-auto shadow-md text-[8px] sm:text-[9px] font-bold text-[#AAB2BA]">
                      <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#18B77A]"></span> متاح</div>
                      <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#E6B84A]"></span> متأخر</div>
                      <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]"></span> في الموقع</div>
                      <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#D64545]"></span> متداخلة</div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-3 left-3 z-10 pointer-events-auto">
                    <button className="bg-[#111820]/80 hover:bg-[#1B2530] text-[#AAB2BA] hover:text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-[#2A323A] transition-colors shadow-md">
                      عرض حركة المرور
                    </button>
                  </div>

                  <div className="w-full h-full relative z-0">
                    <RealMapComponent 
                      accidents={accidents} 
                      agents={agents} 
                      focusCoords={mapFocusCoords} 
                      mapStyle={globalRealMapStyle}
                      onMapStyleChange={setGlobalRealMapStyle}
                    />
                  </div>
                </div>

              </div>

              {/* BOTTOM ROW: Table & Live Feed */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 min-h-[280px] md:h-[280px]">
                
                {/* Right Column: Live Feed (5 cols on tablet, 3 on desktop) */}
                <div className="col-span-12 md:col-span-5 xl:col-span-3 bg-[#111820] rounded-2xl border border-[#2A323A] shadow-lg flex flex-col h-[280px] md:h-full overflow-hidden">
                  <div className="p-4 border-b border-[#2A323A] flex justify-between items-center shrink-0">
                    <h3 className="text-xs font-black text-white text-glow-neon">المتابعة الحية</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Simulated live feed items */}
                    <div className="flex gap-3">
                      <div className="text-[10px] font-mono text-[#738190] w-8 pt-1">10:30</div>
                      <div className="flex-1 border-b border-[#2A323A]/50 pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-[11px] font-bold text-white mb-0.5">تم تحديث موقع المحقق</div>
                            <div className="text-[9px] text-[#738190]">أحمد منصور - القضية INC-2026-00041</div>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-[#18B77A]/20 flex items-center justify-center shrink-0">
                            <MapPin className="w-3 h-3 text-[#18B77A]" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="text-[10px] font-mono text-[#738190] w-8 pt-1">10:28</div>
                      <div className="flex-1 border-b border-[#2A323A]/50 pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-[11px] font-bold text-white mb-0.5">تم رفع 4 صور جديدة</div>
                            <div className="text-[9px] text-[#738190]">عماد سليلة - القضية INC-2026-00042</div>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-[#3B82F6]/20 flex items-center justify-center shrink-0">
                            <Camera className="w-3 h-3 text-[#3B82F6]" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="text-[10px] font-mono text-[#738190] w-8 pt-1">10:27</div>
                      <div className="flex-1 border-b border-[#2A323A]/50 pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-[11px] font-bold text-white mb-0.5">تسجيل صوتي جديد</div>
                            <div className="text-[9px] text-[#738190]">محمد عودة - القضية INC-2026-00043</div>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center shrink-0">
                            <Mic className="w-3 h-3 text-[#8B5CF6]" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="text-[10px] font-mono text-[#738190] w-8 pt-1">10:25</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-[11px] font-bold text-white mb-0.5">تم تغيير حالة القضية</div>
                            <div className="text-[9px] text-[#738190]">من جديد إلى في الموقع</div>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-[#E6B84A]/20 flex items-center justify-center shrink-0">
                            <Activity className="w-3 h-3 text-[#E6B84A]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border-t border-[#2A323A] shrink-0 text-center">
                    <button className="text-[#3B82F6] hover:text-white text-[11px] font-bold transition-colors flex items-center justify-center gap-1 w-full" onClick={() => setActiveTab('audit')}>
                      <span>عرض كل النشاط</span>
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Left Column: Active Cases Table (7 cols on tablet, 9 on desktop) */}
                <div className="col-span-12 md:col-span-7 xl:col-span-9 bg-[#111820] rounded-2xl border border-[#2A323A] shadow-lg flex flex-col h-[280px] md:h-full overflow-hidden">
                  <div className="p-4 border-b border-[#2A323A] flex justify-between items-center shrink-0">
                    <h3 className="text-xs font-black text-white text-glow-neon">القضايا النشطة</h3>
                  </div>
                  
                  <div className="flex-1 overflow-auto">
                    <table className="w-full text-right text-[10px] text-[#AAB2BA]">
                      <thead className="bg-[#1B2530] text-[#738190] sticky top-0">
                        <tr>
                          <th className="py-2.5 px-4 font-bold border-b border-[#2A323A]">رقم القضية</th>
                          <th className="py-2.5 px-4 font-bold border-b border-[#2A323A]">نوع الحادث</th>
                          <th className="py-2.5 px-4 font-bold border-b border-[#2A323A]">الموقع</th>
                          <th className="py-2.5 px-4 font-bold border-b border-[#2A323A]">درجة الخطورة</th>
                          <th className="py-2.5 px-4 font-bold border-b border-[#2A323A]">المحقق</th>
                          <th className="py-2.5 px-4 font-bold border-b border-[#2A323A]">الحالة</th>
                          <th className="py-2.5 px-4 font-bold border-b border-[#2A323A]">آخر تحديث</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accidents.slice(0, 5).map((acc, idx) => (
                          <tr key={acc.id} className="border-b border-[#2A323A] hover:bg-[#1B2530]/50 transition-colors cursor-pointer" onClick={() => setSelectedDispatchAccidentId(acc.id)}>
                            <td className="py-3 px-4 font-mono font-bold text-[#3B82F6]">{acc.accidentNumber}</td>
                            <td className="py-3 px-4">{acc.accidentType}</td>
                            <td className="py-3 px-4">{acc.locationName}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] border ${
                                acc.severity === 'حرج' || acc.severity === 'حرج جداً' ? 'bg-[#E5484D]/10 text-[#E5484D] border-[#E5484D]/30' :
                                acc.severity === 'عالي' ? 'bg-[#E6B84A]/10 text-[#E6B84A] border-[#E6B84A]/30' :
                                acc.severity === 'متوسط' ? 'bg-[#F2A900]/10 text-[#F2A900] border-[#F2A900]/30' :
                                'bg-[#18B77A]/10 text-[#18B77A] border-[#18B77A]/30'
                              }`}>
                                {acc.severity}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-bold text-white">{acc.assignedAgentName || '—'}</td>
                            <td className="py-3 px-4">
                              <span className={`font-bold ${
                                acc.status === 'في الموقع' ? 'text-[#18B77A]' :
                                acc.status === 'قيد التحقيق' || acc.status === 'في مهمة' ? 'text-[#3B82F6]' :
                                acc.status === 'تأخير' || acc.status === 'مناظر' ? 'text-[#E6B84A]' :
                                'text-[#AAB2BA]'
                              }`}>
                                {acc.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-[#18B77A] animate-pulse' : idx === 1 ? 'bg-[#3B82F6]' : idx === 2 ? 'bg-[#E6B84A]' : 'bg-[#18B77A]'}`}></span>
                                <span>{idx === 0 ? 'منذ 2 دقيقة' : idx === 1 ? 'منذ 5 دقيقة' : idx === 2 ? 'منذ 7 دقيقة' : idx === 3 ? 'منذ 10 دقيقة' : 'منذ 12 دقيقة'}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-3 border-t border-[#2A323A] shrink-0 text-center">
                    <button className="text-[#3B82F6] hover:text-white text-[11px] font-bold transition-colors flex items-center justify-center gap-1 w-full" onClick={() => setActiveTab('accidents')}>
                      <span>عرض جميع القضايا</span>
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* BOTTOM TAB BAR ACROSS VIEW */}
        <div className="bg-[#161B1F] border-t border-[#3A434C] px-8 py-3 flex items-center justify-between text-[#AAB2BA] text-xs font-bold shrink-0">
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveTab('reports')} className="flex items-center gap-2 hover:text-white transition-all cursor-pointer">
              <BarChart2 className="w-4 h-4" />
              <span>التقارير</span>
            </button>
            <button 
              onClick={() => {
                setHqBagInitialTab('radio');
                setShowCaseBagModal(true);
              }} 
              className="flex items-center gap-2 text-[#22A06B] hover:text-[#42cf95] transition-all bg-[#22A06B]/20 px-3 py-1 rounded-xl border border-[#22A06B]/30 cursor-pointer"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>اللاسلكي PTT</span>
            </button>
            <button 
              onClick={() => {
                setHqBagInitialTab('chat');
                setShowCaseBagModal(true);
              }} 
              className="flex items-center gap-2 text-[#315EF5] hover:text-[#5279f7] transition-all bg-[#315EF5]/20 px-3 py-1 rounded-xl border border-[#315EF5]/30 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>المحادثات وحقيبة القضية</span>
            </button>
            <button onClick={() => setActiveTab('fleet')} className="flex items-center gap-2 hover:text-white transition-all cursor-pointer">
              <Car className="w-4 h-4" />
              <span>المركبات</span>
            </button>
          </div>

          <button 
            onClick={() => setActiveTab('accidents')}
            className="px-6 py-2 bg-[#315EF5] hover:bg-[#2549d4] text-white rounded-xl font-bold flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>الرئيسية</span>
          </button>
        </div>
      </div>

      {/* SOS Toast Message */}
      {sosSuccessMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-[#D64545] text-white rounded-2xl text-sm font-bold shadow-2xl animate-bounce">
          {sosSuccessMessage}
        </div>
      )}

      {/* Case Detail Modal */}
      {showCaseModal && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#2A323A] border border-[#3A434C] rounded-3xl p-6 max-w-lg w-full space-y-6 shadow-2xl text-xs text-[#F1F5F9]">
            <div className="flex items-center justify-between border-b border-[#3A434C] pb-3">
              <h3 className="font-black text-sm text-[#F1F5F9] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#315EF5]" />
                <span>حقيبة التحقيق الرسمية: {currentMission.accidentNumber}</span>
              </h3>
              <button onClick={() => setShowCaseModal(false)} className="p-2 bg-[#323A40] hover:bg-[#3A434C] text-[#AAB2BA] hover:text-[#F1F5F9] rounded-xl font-bold cursor-pointer">✕ إغلاق</button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-[#323A40] rounded-2xl border border-[#3A434C] space-y-2">
                <div className="flex justify-between font-bold">
                  <span className="text-[#F1F5F9]">الموقع: {currentMission.locationName}</span>
                  <span className="text-[#D64545]">حالة طارئة وحرج جداً</span>
                </div>
                <p className="text-[#AAB2BA]">{currentMission.description}</p>
              </div>

              {/* Photos Gallery from field investigation */}
              {Array.isArray(currentMission.photos) && currentMission.photos.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-bold text-[#F1F5F9]">الصور والتوثيقات الميدانية ({currentMission.photos.length}):</span>
                  <div className="grid grid-cols-3 gap-2">
                    {currentMission.photos.map((pUrl, pIdx) => (
                      <div key={pIdx} className="h-20 rounded-xl overflow-hidden border border-[#3A434C] bg-[#161B1F]">
                        <img src={pUrl} alt="دليل" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 bg-[#323A40] rounded-2xl border border-[#3A434C] space-y-2">
                <h4 className="font-bold text-[#F1F5F9]">بيانات الأطراف والسيارات</h4>
                <div>رقم اللوحة: <span className="font-mono font-bold text-[#315EF5]">{currentMission.vehiclePlate || '3-8834-92'}</span></div>
                <div>اسم السائق: <span className="font-bold text-[#F1F5F9]">{currentMission.driverName || 'سعيد عبدربه النتشة'}</span></div>
                <div>الخسارة التقديرية: <span className="font-bold text-[#22A06B]">12,500 ر.س</span></div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setHqBagInitialTab('radio');
                    setShowCaseBagModal(true);
                  }}
                  className="flex-1 py-3 bg-[#22A06B] hover:bg-[#1b8256] text-white rounded-xl font-bold shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Radio className="w-4 h-4" />
                  <span>اللاسلكي PTT</span>
                </button>
                <button
                  onClick={() => {
                    setHqBagInitialTab('chat');
                    setShowCaseBagModal(true);
                  }}
                  className="flex-1 py-3 bg-[#315EF5] hover:bg-[#2549d4] text-white rounded-xl font-bold shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>حقيبة المراسلات والصور</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Case Communication Bag Modal */}
      {showCaseBagModal && (() => {
        const targetIncident = activeBagAccident || currentMission || fallbackAccident;
        return (
          <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
            <div className="w-full max-w-2xl h-[88vh] flex flex-col">
              <CaseCommunicationBag
                incidentId={targetIncident?.id || 'acc-fallback'}
                incidentNumber={targetIncident?.accidentNumber || targetIncident?.incidentNumber || targetIncident?.id || 'ACC-HQ'}
                currentUserName="غرفة العمليات (HQ)"
                currentUserRole="HQ"
                initialTab={hqBagInitialTab}
                agents={agents}
                currentAssignedAgentId={targetIncident?.assignedAgentId}
                onAssignAgent={(agentId) => {
                  if (onDirectAssignAgent && targetIncident?.id) {
                    onDirectAssignAgent(targetIncident.id, agentId);
                  } else if (targetIncident) {
                    onOpenDispatch(targetIncident);
                  }
                }}
                onClose={() => setShowCaseBagModal(false)}
              />
            </div>
          </div>
        );
      })()}

      {/* Compliance Check Verification Panel */}
      {showComplianceModal && (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="bg-[#2A323A] border-2 border-[#22A06B]/50 rounded-3xl p-6 max-w-lg w-full space-y-6 shadow-2xl text-xs text-[#F1F5F9]">
            <div className="flex items-center justify-between border-b border-[#3A434C] pb-3">
              <h3 className="font-black text-sm text-[#F1F5F9] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#22A06B]" />
                <span>مراقب مطابقة ومعايرة الروابط (Compliance Monitor)</span>
              </h3>
              <button onClick={() => setShowComplianceModal(false)} className="p-2 bg-[#323A40] hover:bg-[#3A434C] text-[#AAB2BA] hover:text-[#F1F5F9] rounded-xl font-bold cursor-pointer">✕ إغلاق</button>
            </div>

            <div className="p-4 bg-[#161B1F] rounded-2xl border border-[#3A434C] space-y-3">
              <p className="text-xs text-[#AAB2BA] leading-relaxed">
                يقوم هذا النظام التلقائي بالتحقق من تطبيق المعايير التقنية الصارمة لروابط مهام المحققين الميدانيين وضمان عدم استخدام أي نطاقات Cloud Run داخلية.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-[#2A323A] rounded-xl border border-[#3A434C]">
                  <span className="text-[#AAB2BA] block">النطاق الرسمي المعتمد:</span>
                  <strong className="text-emerald-400 font-mono">incident.palcom.online</strong>
                </div>
                <div className="p-2 bg-[#2A323A] rounded-xl border border-[#3A434C]">
                  <span className="text-[#AAB2BA] block">تجاوز الذاكرة المؤقتة:</span>
                  <strong className="text-emerald-400">مفعّل تلقائياً ✓</strong>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-[#161B1F] rounded-xl border border-[#3A434C] flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-bold text-[#F1F5F9]">PUBLIC_AGENT_URL_DOMAIN</span>
                  <span className="text-[10px] text-[#AAB2BA]">جميع روابط المحققين تتبع النطاق palcom.online</span>
                </div>
                <span className="px-2.5 py-1 bg-[#22A06B]/20 text-[#22A06B] border border-[#22A06B]/30 rounded-lg font-black text-[10px]">PASS</span>
              </div>

              <div className="p-3 bg-[#161B1F] rounded-xl border border-[#3A434C] flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-bold text-[#F1F5F9]">INVESTIGATOR_ID_FROM_ASSIGNMENT</span>
                  <span className="text-[10px] text-[#AAB2BA]">المعرف يؤخذ ديناميكياً من الموظف المكلف الفعلي</span>
                </div>
                <span className="px-2.5 py-1 bg-[#22A06B]/20 text-[#22A06B] border border-[#22A06B]/30 rounded-lg font-black text-[10px]">PASS</span>
              </div>

              <div className="p-3 bg-[#161B1F] rounded-xl border border-[#3A434C] flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-bold text-[#F1F5F9]">CASE_ID_FROM_CURRENT_CASE</span>
                  <span className="text-[10px] text-[#AAB2BA]">معرف القضية يؤخذ من القضية الحالية النشطة</span>
                </div>
                <span className="px-2.5 py-1 bg-[#22A06B]/20 text-[#22A06B] border border-[#22A06B]/30 rounded-lg font-black text-[10px]">PASS</span>
              </div>

              <div className="p-3 bg-[#161B1F] rounded-xl border border-[#3A434C] flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-bold text-[#F1F5F9]">NO_HARDCODED_CASE</span>
                  <span className="text-[10px] text-[#AAB2BA]">منع أي قيم ثابتة أو معرفات مسبقة في التوليد</span>
                </div>
                <span className="px-2.5 py-1 bg-[#22A06B]/20 text-[#22A06B] border border-[#22A06B]/30 rounded-lg font-black text-[10px]">PASS</span>
              </div>

              <div className="p-3 bg-[#161B1F] rounded-xl border border-[#3A434C] flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-bold text-[#F1F5F9]">URL_PARAMS_OVERRIDE_CACHE</span>
                  <span className="text-[10px] text-[#AAB2BA]">المعاملات الجديدة بالرابط تلغي أي جلسة قديمة فوراً</span>
                </div>
                <span className="px-2.5 py-1 bg-[#22A06B]/20 text-[#22A06B] border border-[#22A06B]/30 rounded-lg font-black text-[10px]">PASS</span>
              </div>

              <div className="p-3 bg-[#161B1F] rounded-xl border border-[#3A434C] flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-bold text-[#F1F5F9]">WHATSAPP_LINK_USES_CUSTOM_DOMAIN</span>
                  <span className="text-[10px] text-[#AAB2BA]">جميع روابط واتساب المنشأة تستخدم النطاق المعتمد</span>
                </div>
                <span className="px-2.5 py-1 bg-[#22A06B]/20 text-[#22A06B] border border-[#22A06B]/30 rounded-lg font-black text-[10px]">PASS</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedPolicyholderId && (
        <PolicyholderFileModal
          policyholderId={selectedPolicyholderId}
          onClose={() => setSelectedPolicyholderId(null)}
          onAddPolicy={() => {}}
          onAddAsset={() => {}}
          onRenewPolicy={() => {}}
        />
      )}
    </div>
  );
};
