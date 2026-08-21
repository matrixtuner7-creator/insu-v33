import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Compass, 
  Car, 
  Zap, 
  RotateCw, 
  Trash2, 
  Plus, 
  Move, 
  Type, 
  ShieldAlert, 
  Check, 
  RefreshCw,
  Sparkles,
  MapPin,
  Maximize2,
  Minimize2,
  PenTool,
  Eraser,
  Undo2,
  Download,
  UploadCloud,
  FileCheck2,
  Layers,
  ArrowUpRight,
  Split,
  Circle,
  Truck,
  Bike,
  Footprints,
  AlertTriangle,
  Grid,
  Palette,
  Eye
} from 'lucide-react';
import { DiagramData, DiagramElement, DiagramDrawingPath } from '../../types';

interface Step5AccidentDiagramProps {
  diagramData: DiagramData;
  onChange: (updated: DiagramData) => void;
  caseId?: string;
  incidentNumber?: string;
}

export const Step5AccidentDiagram: React.FC<Step5AccidentDiagramProps> = ({
  diagramData,
  onChange,
  caseId,
  incidentNumber
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Drawing Mode States
  const [toolMode, setToolMode] = useState<'select' | 'pen' | 'eraser'>('select');
  const [penColor, setPenColor] = useState('#F59E0B');
  const [penWidth, setPenWidth] = useState(3);
  const [showGrid, setShowGrid] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Array<{ x: number; y: number }>>([]);
  const [exportingStatus, setExportingStatus] = useState<'idle' | 'exporting' | 'success'>('idle');
  const [previewImage, setPreviewImage] = useState<string | null>(diagramData.previewImageUrl || diagramData.exportedImage || null);

  // Road background types
  const roadTypes: Array<{ key: DiagramData['roadType']; label: string; desc: string }> = [
    { key: 'straight', label: 'شارع مستقيم', desc: 'شارع مستقيم' },
    { key: 'intersection', label: 'تقاطع رباعي', desc: 'مفترق رباعي' },
    { key: 't_junction', label: 'مفترق T', desc: 'مفترق ثلاثي' },
    { key: 'roundabout', label: 'دوار', desc: 'دوار مروري' },
    { key: 'curve', label: 'منعطف', desc: 'منعطف حاد' },
    { key: 'highway', label: 'طريق سريع', desc: 'أوتوستراد' }
  ];

  // Initialize with standard vehicle collision elements if completely empty
  useEffect(() => {
    if (!diagramData.elements || diagramData.elements.length === 0) {
      const initialElements: DiagramElement[] = [
        {
          id: 'v1',
          type: 'vehicle',
          x: 180,
          y: 220,
          rotation: 0,
          label: 'مركبة (أ) المؤمن له',
          color: '#3B82F6',
          width: 70,
          height: 36
        },
        {
          id: 'v2',
          type: 'vehicle',
          x: 320,
          y: 220,
          rotation: 180,
          label: 'مركبة (ب) الطرف الثاني',
          color: '#EF4444',
          width: 70,
          height: 36
        },
        {
          id: 'impact_1',
          type: 'impact',
          x: 250,
          y: 215,
          rotation: 0,
          label: 'نقطة الاصطدام',
          color: '#F59E0B',
          width: 44,
          height: 44
        },
        {
          id: 'arrow_1',
          type: 'arrow',
          x: 130,
          y: 228,
          rotation: 0,
          label: 'مسار (أ)',
          color: '#3B82F6',
          width: 40,
          height: 18
        },
        {
          id: 'arrow_2',
          type: 'arrow',
          x: 380,
          y: 228,
          rotation: 180,
          label: 'مسار (ب)',
          color: '#EF4444',
          width: 40,
          height: 18
        }
      ];
      onChange({
        ...diagramData,
        roadType: diagramData.roadType || 'straight',
        elements: initialElements,
        drawingPaths: diagramData.drawingPaths || []
      });
    }
  }, []);

  // Sync internal preview when external changes
  useEffect(() => {
    if (diagramData.previewImageUrl || diagramData.exportedImage) {
      setPreviewImage(diagramData.previewImageUrl || diagramData.exportedImage || null);
    }
  }, [diagramData.previewImageUrl, diagramData.exportedImage]);

  // Add Element of specific type
  const handleAddElement = (type: DiagramElement['type'], customOptions: Partial<DiagramElement> = {}) => {
    const id = `elem_${Date.now()}`;
    let newElem: DiagramElement;

    // Centered spawn coordinates
    const spawnX = isFullscreen ? 400 : 250;
    const spawnY = isFullscreen ? 300 : 200;

    switch (type) {
      case 'vehicle':
        const vehicleCount = (diagramData.elements || []).filter(e => e.type === 'vehicle').length + 1;
        const color = vehicleCount === 1 ? '#3B82F6' : vehicleCount === 2 ? '#EF4444' : '#10B981';
        const label = vehicleCount === 1 ? 'مركبة (أ) المؤمن له' : vehicleCount === 2 ? 'مركبة (ب) الطرف الثاني' : `مركبة (${vehicleCount})`;
        newElem = {
          id,
          type: 'vehicle',
          x: spawnX,
          y: spawnY,
          rotation: 0,
          label,
          color,
          width: 70,
          height: 36,
          ...customOptions
        };
        break;
      case 'truck':
        newElem = {
          id,
          type: 'truck',
          x: spawnX,
          y: spawnY,
          rotation: 0,
          label: 'شاحنة / حافلة',
          color: '#F97316',
          width: 100,
          height: 42,
          ...customOptions
        };
        break;
      case 'motorcycle':
        newElem = {
          id,
          type: 'motorcycle',
          x: spawnX,
          y: spawnY,
          rotation: 0,
          label: 'دراجة نارية / سكوتر',
          color: '#8B5CF6',
          width: 45,
          height: 24,
          ...customOptions
        };
        break;
      case 'impact':
        newElem = {
          id,
          type: 'impact',
          x: spawnX,
          y: spawnY,
          rotation: 0,
          label: 'نقطة الاصطدام 💥',
          color: '#F59E0B',
          width: 46,
          height: 46,
          ...customOptions
        };
        break;
      case 'skid_mark':
        newElem = {
          id,
          type: 'skid_mark',
          x: spawnX,
          y: spawnY,
          rotation: 0,
          label: 'آثار فرملة (انزلاق)',
          color: '#1E293B',
          width: 80,
          height: 20,
          ...customOptions
        };
        break;
      case 'arrow':
        newElem = {
          id,
          type: 'arrow',
          x: spawnX,
          y: spawnY,
          rotation: 0,
          label: 'مسار مستقيم',
          color: '#3B82F6',
          width: 50,
          height: 20,
          ...customOptions
        };
        break;
      case 'turn_arrow':
        newElem = {
          id,
          type: 'turn_arrow',
          x: spawnX,
          y: spawnY,
          rotation: 0,
          label: 'مسار انعطاف',
          color: '#F59E0B',
          width: 45,
          height: 45,
          ...customOptions
        };
        break;
      case 'traffic_light':
        newElem = {
          id,
          type: 'traffic_light',
          x: spawnX - 100,
          y: spawnY - 100,
          rotation: 0,
          label: 'إشارة ضوئية',
          color: '#64748B',
          width: 28,
          height: 60,
          ...customOptions
        };
        break;
      case 'stop_sign':
        newElem = {
          id,
          type: 'stop_sign',
          x: spawnX - 80,
          y: spawnY - 80,
          rotation: 0,
          label: 'شاخصة قف 🛑',
          color: '#EF4444',
          width: 32,
          height: 32,
          ...customOptions
        };
        break;
      case 'yield_sign':
        newElem = {
          id,
          type: 'yield_sign',
          x: spawnX - 80,
          y: spawnY - 80,
          rotation: 0,
          label: 'مثلث أولوية ⚠️',
          color: '#EAB308',
          width: 32,
          height: 32,
          ...customOptions
        };
        break;
      case 'pedestrian':
        newElem = {
          id,
          type: 'pedestrian',
          x: spawnX,
          y: spawnY,
          rotation: 0,
          label: 'مشاة / ممر',
          color: '#FFFFFF',
          width: 30,
          height: 30,
          ...customOptions
        };
        break;
      case 'obstacle':
        newElem = {
          id,
          type: 'obstacle',
          x: spawnX,
          y: spawnY,
          rotation: 0,
          label: 'عائق / رصيف',
          color: '#EAB308',
          width: 36,
          height: 36,
          ...customOptions
        };
        break;
      default:
        newElem = {
          id,
          type: 'text',
          x: spawnX,
          y: spawnY,
          rotation: 0,
          label: 'ملاحظة تخطيطية',
          color: '#FFFFFF',
          ...customOptions
        };
    }

    onChange({
      ...diagramData,
      elements: [...(diagramData.elements || []), newElem]
    });
    setSelectedElementId(id);
    setToolMode('select');
  };

  const handleRotate = (id: string, degrees: number = 45) => {
    onChange({
      ...diagramData,
      elements: (diagramData.elements || []).map(e => 
        e.id === id ? { ...e, rotation: (e.rotation + degrees) % 360 } : e
      )
    });
  };

  const handleRemove = (id: string) => {
    onChange({
      ...diagramData,
      elements: (diagramData.elements || []).filter(e => e.id !== id)
    });
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const handleUpdateLabel = (id: string, newLabel: string) => {
    onChange({
      ...diagramData,
      elements: (diagramData.elements || []).map(e => 
        e.id === id ? { ...e, label: newLabel } : e
      )
    });
  };

  // Dragging logic
  const handleStartDrag = (e: React.MouseEvent | React.TouchEvent, elem: DiagramElement) => {
    if (toolMode !== 'select') return;
    e.stopPropagation();
    setSelectedElementId(elem.id);
    setIsDragging(true);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDragOffset({
        x: (clientX - rect.left) - elem.x,
        y: (clientY - rect.top) - elem.y
      });
    }
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    // Handling freehand pen drawing
    if (toolMode === 'pen' && isDrawing && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const point = {
        x: Math.round(clientX - rect.left),
        y: Math.round(clientY - rect.top)
      };
      setCurrentPath(prev => [...prev, point]);
      return;
    }

    // Handling element movement
    if (!isDragging || !selectedElementId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const newX = Math.max(10, Math.min(rect.width - 40, (clientX - rect.left) - dragOffset.x));
    const newY = Math.max(10, Math.min(rect.height - 40, (clientY - rect.top) - dragOffset.y));

    onChange({
      ...diagramData,
      elements: (diagramData.elements || []).map(elem => 
        elem.id === selectedElementId ? { ...elem, x: Math.round(newX), y: Math.round(newY) } : elem
      )
    });
  };

  const handleEndDrag = () => {
    if (toolMode === 'pen' && isDrawing && currentPath.length > 1) {
      const newPath: DiagramDrawingPath = {
        points: currentPath,
        color: penColor,
        width: penWidth
      };
      onChange({
        ...diagramData,
        drawingPaths: [...(diagramData.drawingPaths || []), newPath]
      });
      setCurrentPath([]);
      setIsDrawing(false);
    }
    setIsDragging(false);
  };

  const handleStartDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (toolMode !== 'pen' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setIsDrawing(true);
    setCurrentPath([{
      x: Math.round(clientX - rect.left),
      y: Math.round(clientY - rect.top)
    }]);
  };

  const handleUndoPath = () => {
    if (!diagramData.drawingPaths || diagramData.drawingPaths.length === 0) return;
    const updated = [...diagramData.drawingPaths];
    updated.pop();
    onChange({
      ...diagramData,
      drawingPaths: updated
    });
  };

  const handleClearAll = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع عناصر المخطط والرسم؟')) {
      onChange({
        ...diagramData,
        elements: [],
        drawingPaths: [],
        exportedImage: undefined,
        previewImageUrl: undefined
      });
      setPreviewImage(null);
      setSelectedElementId(null);
    }
  };

  // High-Resolution Diagram Image Rendering & Direct Export to Case
  const handleExportDiagramImage = async () => {
    setExportingStatus('exporting');
    try {
      const width = isFullscreen ? 1200 : 800;
      const height = isFullscreen ? 800 : 550;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Background Grid & Asphalt
      ctx.fillStyle = '#111827'; // Dark asphalt slate
      ctx.fillRect(0, 0, width, height);

      // Blueprint grid lines
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw Road Geometry
      const roadType = diagramData.roadType || 'straight';
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 3;

      if (roadType === 'straight') {
        const roadHeight = 220;
        const roadY = (height - roadHeight) / 2;
        ctx.fillRect(0, roadY, width, roadHeight);
        ctx.strokeRect(0, roadY, width, roadHeight);

        // Center dashed line
        ctx.strokeStyle = '#FACC15';
        ctx.setLineDash([20, 15]);
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (roadType === 'intersection') {
        const laneW = 220;
        const centerX = width / 2;
        const centerY = height / 2;
        // Horizontal road
        ctx.fillRect(0, centerY - laneW / 2, width, laneW);
        // Vertical road
        ctx.fillRect(centerX - laneW / 2, 0, laneW, height);
        // Dashed lanes
        ctx.strokeStyle = '#FACC15';
        ctx.setLineDash([15, 15]);
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, height);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (roadType === 'roundabout') {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = 180;
        // Outer road circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Central island
        ctx.fillStyle = '#065F46'; // Grass green island
        ctx.beginPath();
        ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#10B981';
        ctx.stroke();
      } else {
        ctx.fillRect(0, 150, width, 300);
      }

      // 3. Draw Freehand Paths
      if (diagramData.drawingPaths) {
        diagramData.drawingPaths.forEach(path => {
          if (path.points.length < 2) return;
          ctx.strokeStyle = path.color;
          ctx.lineWidth = path.width * 1.5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(path.points[0].x * (width / (containerRef.current?.clientWidth || 800)), path.points[0].y * (height / (containerRef.current?.clientHeight || 550)));
          for (let i = 1; i < path.points.length; i++) {
            ctx.lineTo(
              path.points[i].x * (width / (containerRef.current?.clientWidth || 800)),
              path.points[i].y * (height / (containerRef.current?.clientHeight || 550))
            );
          }
          ctx.stroke();
        });
      }

      // 4. Draw Diagram Elements (Vehicles, Impact, Arrows)
      const containerW = containerRef.current?.clientWidth || 800;
      const containerH = containerRef.current?.clientHeight || 550;
      const scaleX = width / containerW;
      const scaleY = height / containerH;

      (diagramData.elements || []).forEach(elem => {
        const x = elem.x * scaleX;
        const y = elem.y * scaleY;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((elem.rotation * Math.PI) / 180);

        if (elem.type === 'vehicle') {
          // Car body
          ctx.fillStyle = elem.color || '#3B82F6';
          ctx.beginPath();
          ctx.roundRect(-35, -18, 70, 36, [8, 8, 8, 8]);
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Windshields & Wheels
          ctx.fillStyle = '#0F172A';
          ctx.fillRect(-15, -14, 28, 28);
          // Headlights
          ctx.fillStyle = '#FEF08A';
          ctx.fillRect(30, -14, 4, 8);
          ctx.fillRect(30, 6, 4, 8);
        } else if (elem.type === 'truck') {
          ctx.fillStyle = elem.color || '#F97316';
          ctx.beginPath();
          ctx.roundRect(-50, -21, 100, 42, [6, 6, 6, 6]);
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (elem.type === 'impact') {
          // Impact Star
          ctx.fillStyle = '#F59E0B';
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, 22, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('💥', 0, 0);
        } else if (elem.type === 'arrow') {
          ctx.strokeStyle = elem.color || '#3B82F6';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(-20, 0);
          ctx.lineTo(20, 0);
          ctx.lineTo(10, -10);
          ctx.moveTo(20, 0);
          ctx.lineTo(10, 10);
          ctx.stroke();
        } else if (elem.type === 'skid_mark') {
          ctx.strokeStyle = '#1E293B';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(-35, -8);
          ctx.lineTo(35, -8);
          ctx.moveTo(-35, 8);
          ctx.lineTo(35, 8);
          ctx.stroke();
        }

        ctx.restore();

        // Draw Element Label
        if (elem.label) {
          ctx.save();
          ctx.font = 'bold 12px sans-serif';
          ctx.fillStyle = '#F8FAFC';
          ctx.textAlign = 'center';
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 4;
          ctx.fillText(elem.label, x, y + 32);
          ctx.restore();
        }
      });

      // 5. Official Header & Stamp Overlay
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(20, 20, 360, 70);
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(20, 20, 360, 70);

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('المخطط الكروكي الهندسي لمعاينة الحادث', 360, 45);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '11px sans-serif';
      ctx.fillText(`رقم القضية: ${incidentNumber || caseId || 'NAB-2026-8819'} | التاريخ: ${new Date().toLocaleDateString('ar-EG')}`, 360, 70);

      // Compass Rose at top left
      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⬆ N (شمال)', width - 60, 40);

      // Export as Base64 Data URL
      const dataUrl = canvas.toDataURL('image/png');
      setPreviewImage(dataUrl);

      // Update state
      const updatedDiagram = {
        ...diagramData,
        exportedImage: dataUrl,
        previewImageUrl: dataUrl
      };
      onChange(updatedDiagram);

      const targetCaseId = caseId || incidentNumber || 'default';

      // 1. Update localStorage instantly
      try {
        const localKey = `investigation_session_${targetCaseId}`;
        const existingLocal = localStorage.getItem(localKey);
        let parsed = existingLocal ? JSON.parse(existingLocal) : {};
        parsed = {
          ...parsed,
          caseId: targetCaseId,
          diagramData: updatedDiagram,
          lastSavedAt: new Date().toISOString()
        };
        localStorage.setItem(localKey, JSON.stringify(parsed));
        localStorage.setItem(`investigation_diagram_${targetCaseId}`, dataUrl);
      } catch (locErr) {
        console.warn("Could not write diagram to localStorage:", locErr);
      }

      // 2. Automatically save diagram into Investigation Session API
      try {
        await fetch('/api/investigation/session/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caseId: targetCaseId,
            incidentNumber: incidentNumber || targetCaseId,
            diagramData: updatedDiagram,
            lastAction: 'DIAGRAM_EXPORTED'
          })
        });
      } catch (saveErr) {
        console.warn("Could not auto-save diagram to session API:", saveErr);
      }

      // 3. Automatically post to the Case Bag & Messages API
      try {
        await fetch(`/api/cases/${encodeURIComponent(targetCaseId)}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caseId: targetCaseId,
            incidentId: targetCaseId,
            senderName: 'المحقق الميداني',
            senderRole: 'Field Investigator',
            contentType: 'image',
            messageType: 'image',
            mediaUrl: dataUrl,
            content: dataUrl,
            fileName: `croquis_${targetCaseId}.png`,
            timestamp: new Date().toISOString()
          })
        });
      } catch (postErr) {
        console.warn("Could not post diagram to case messages:", postErr);
      }

      setExportingStatus('success');
      setTimeout(() => setExportingStatus('idle'), 3000);
    } catch (err) {
      console.error("Export diagram error:", err);
      setExportingStatus('idle');
    }
  };

  const selectedElement = (diagramData.elements || []).find(e => e.id === selectedElementId);

  return (
    <div className={`space-y-4 text-right ${isFullscreen ? 'fixed inset-0 z-[99999] bg-[#0F172A] p-4 flex flex-col overflow-hidden' : 'relative'}`} dir="rtl">
      {/* Top Clean Toolbar */}
      <div className="bg-[#1E293B] px-3.5 py-2.5 rounded-2xl border border-slate-700/80 shadow-md flex items-center justify-between gap-2 text-white shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2 truncate">
            <h3 className="font-black text-xs sm:text-sm text-slate-100 whitespace-nowrap">رسم الكروكا</h3>
            <span className="text-[10px] text-slate-400 hidden sm:inline font-mono">#{incidentNumber || caseId || 'CASE'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Export & Attach Button */}
          <button
            type="button"
            onClick={handleExportDiagramImage}
            disabled={exportingStatus === 'exporting'}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
            title="اعتماد الكروكا وإرفاقها بالقضية"
          >
            {exportingStatus === 'exporting' ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : exportingStatus === 'success' ? (
              <Check className="w-3.5 h-3.5 text-emerald-200" />
            ) : (
              <UploadCloud className="w-3.5 h-3.5" />
            )}
            <span>{exportingStatus === 'success' ? 'تم الاعتماد ✓' : 'اعتماد الكروكا'}</span>
          </button>

          {/* Full-Screen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer whitespace-nowrap"
            title={isFullscreen ? 'تصغير' : 'ملء الشاشة'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{isFullscreen ? 'تصغير' : 'ملء الشاشة'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Area */}
      <div className={`grid ${isFullscreen ? 'grid-cols-1 lg:grid-cols-4 flex-1 gap-4 overflow-hidden' : 'grid-cols-1 gap-4'}`}>
        
        {/* Left/Main Canvas Column */}
        <div className={`${isFullscreen ? 'lg:col-span-3 h-full flex flex-col' : 'space-y-3'}`}>
          
          {/* Quick Road Selector Bar */}
          <div className="bg-[#1E293B] p-2.5 rounded-2xl border border-slate-700 shadow-sm flex items-center justify-between gap-2 overflow-x-auto scrollbar-none shrink-0">
            <span className="text-xs font-bold text-slate-400 whitespace-nowrap px-1">هندسة الطريق:</span>
            <div className="flex items-center gap-1.5">
              {roadTypes.map(rt => (
                <button
                  key={rt.key}
                  type="button"
                  onClick={() => onChange({ ...diagramData, roadType: rt.key })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    diagramData.roadType === rt.key
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title={rt.desc}
                >
                  {rt.label}
                </button>
              ))}
            </div>
            
            {/* Compass Rose */}
            <div className="flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700 text-[11px] text-red-400 font-black">
              <span>⬆</span>
              <span>الشمال (N)</span>
            </div>
          </div>

          {/* Interactive Stage Canvas Container */}
          <div className="relative flex-1 bg-slate-950 rounded-3xl border-2 border-slate-700 shadow-2xl overflow-hidden min-h-[420px] select-none touch-none flex flex-col">
            
            {/* Floating Top In-Canvas Tools */}
            <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700 shadow-lg">
              <button
                type="button"
                onClick={() => setToolMode('select')}
                className={`p-2 rounded-xl transition-all ${toolMode === 'select' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                title="أداة التحديد والتحريك (Select & Drag)"
              >
                <Move className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setToolMode('pen')}
                className={`p-2 rounded-xl transition-all ${toolMode === 'pen' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                title="أداة الرسم اليدوي المباشر (Freehand Pen)"
              >
                <PenTool className="w-4 h-4" />
              </button>
              {toolMode === 'pen' && (
                <div className="flex items-center gap-1 px-1 border-r border-slate-700 pr-1">
                  {['#F59E0B', '#EF4444', '#3B82F6', '#10B981', '#FFFFFF'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setPenColor(c)}
                      className={`w-5 h-5 rounded-full border-2 transition-transform ${penColor === c ? 'scale-125 border-white' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={handleUndoPath}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                    title="تراجع عن آخر خط"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded-xl transition-all ${showGrid ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                title="إظهار / إخفاء شبكة القياس الهندسي"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-xl"
                title="مسح كامل اللوحة"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* The Actual Canvas Visual Field */}
            <div
              ref={containerRef}
              onMouseDown={handleStartDraw}
              onMouseMove={handleDragMove}
              onMouseUp={handleEndDrag}
              onTouchStart={handleStartDraw}
              onTouchMove={handleDragMove}
              onTouchEnd={handleEndDrag}
              className="relative w-full flex-1 bg-slate-900 overflow-hidden cursor-crosshair"
              style={{ minHeight: isFullscreen ? '100%' : '420px' }}
            >
              {/* Engineering Grid Overlay */}
              {showGrid && (
                <div 
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage: 'linear-gradient(to right, #38BDF8 1px, transparent 1px), linear-gradient(to bottom, #38BDF8 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                  }}
                />
              )}

              {/* Road Templates Background Render */}
              {diagramData.roadType === 'straight' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-48 bg-slate-800 border-y-4 border-slate-600 relative flex items-center">
                    {/* Asphalt texture */}
                    <div className="absolute inset-0 bg-[#1E293B]"></div>
                    {/* Pedestrian Crossing Left */}
                    <div className="absolute left-10 top-0 bottom-0 w-16 flex flex-col justify-between py-2 pointer-events-none">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="w-full h-3 bg-white/70 rounded-sm"></div>
                      ))}
                    </div>
                    {/* Pedestrian Crossing Right */}
                    <div className="absolute right-10 top-0 bottom-0 w-16 flex flex-col justify-between py-2 pointer-events-none">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="w-full h-3 bg-white/70 rounded-sm"></div>
                      ))}
                    </div>
                    {/* Center Dashed Lane */}
                    <div className="w-full border-t-2 border-dashed border-amber-400 z-10"></div>
                  </div>
                </div>
              )}

              {diagramData.roadType === 'intersection' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Horizontal Road */}
                  <div className="absolute w-full h-44 bg-[#1E293B] border-y-4 border-slate-600 flex items-center">
                    <div className="w-full border-t-2 border-dashed border-amber-400"></div>
                  </div>
                  {/* Vertical Road */}
                  <div className="absolute h-full w-44 bg-[#1E293B] border-x-4 border-slate-600 flex justify-center">
                    <div className="h-full border-l-2 border-dashed border-amber-400"></div>
                  </div>
                  {/* Center junction zone */}
                  <div className="absolute w-44 h-44 border-2 border-dashed border-slate-500/40 pointer-events-none"></div>
                </div>
              )}

              {diagramData.roadType === 't_junction' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Horizontal Main Road */}
                  <div className="absolute top-16 w-full h-44 bg-[#1E293B] border-y-4 border-slate-600 flex items-center">
                    <div className="w-full border-t-2 border-dashed border-amber-400"></div>
                  </div>
                  {/* Bottom Branch Road */}
                  <div className="absolute bottom-0 h-48 w-44 bg-[#1E293B] border-x-4 border-slate-600 flex justify-center">
                    <div className="h-full border-l-2 border-dashed border-amber-400"></div>
                  </div>
                </div>
              )}

              {diagramData.roadType === 'roundabout' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* 4 Ingress Roads */}
                  <div className="absolute w-full h-36 bg-[#1E293B]"></div>
                  <div className="absolute h-full w-36 bg-[#1E293B]"></div>
                  {/* Outer Circle Road */}
                  <div className="w-80 h-80 rounded-full bg-[#1E293B] border-4 border-slate-600 flex items-center justify-center shadow-inner relative">
                    <div className="w-64 h-64 rounded-full border-2 border-dashed border-amber-400 flex items-center justify-center">
                      {/* Green Center Island */}
                      <div className="w-36 h-36 rounded-full bg-emerald-900 border-4 border-emerald-500 flex items-center justify-center shadow-lg text-white font-black text-xs">
                        دوار مروري
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Freehand SVG Paths Layer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                {(diagramData.drawingPaths || []).map((path, idx) => (
                  <path
                    key={idx}
                    d={`M ${path.points.map(p => `${p.x} ${p.y}`).join(' L ')}`}
                    stroke={path.color}
                    strokeWidth={path.width}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
                {currentPath.length > 1 && (
                  <path
                    d={`M ${currentPath.map(p => `${p.x} ${p.y}`).join(' L ')}`}
                    stroke={penColor}
                    strokeWidth={penWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>

              {/* Draggable Diagram Elements */}
              {(diagramData.elements || []).map(elem => {
                const isSelected = selectedElementId === elem.id;

                return (
                  <div
                    key={elem.id}
                    onMouseDown={(e) => handleStartDrag(e, elem)}
                    onTouchStart={(e) => handleStartDrag(e, elem)}
                    className={`absolute z-20 cursor-grab active:cursor-grabbing transition-transform ${
                      isSelected ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 shadow-2xl scale-105' : 'hover:scale-102'
                    }`}
                    style={{
                      left: elem.x,
                      top: elem.y,
                      transform: `rotate(${elem.rotation}deg)`,
                      transformOrigin: 'center center'
                    }}
                  >
                    {/* Vehicle Rendering */}
                    {elem.type === 'vehicle' && (
                      <div 
                        className="relative w-[70px] h-[36px] rounded-lg shadow-xl flex items-center justify-center border-2 border-white text-white select-none font-bold"
                        style={{ backgroundColor: elem.color || '#3B82F6' }}
                      >
                        {/* Windshield & Roof */}
                        <div className="w-7 h-6 bg-slate-950/80 rounded-md border border-white/30 flex items-center justify-center text-[9px]">
                          🚗
                        </div>
                        {/* Headlights */}
                        <div className="absolute right-0 top-1 w-1.5 h-2 bg-yellow-300 rounded-l"></div>
                        <div className="absolute right-0 bottom-1 w-1.5 h-2 bg-yellow-300 rounded-l"></div>
                        {/* Tail lights */}
                        <div className="absolute left-0 top-1 w-1.5 h-2 bg-red-500 rounded-r"></div>
                        <div className="absolute left-0 bottom-1 w-1.5 h-2 bg-red-500 rounded-r"></div>
                      </div>
                    )}

                    {/* Truck Rendering */}
                    {elem.type === 'truck' && (
                      <div 
                        className="relative w-[100px] h-[42px] rounded-lg shadow-xl flex items-center justify-between px-2 border-2 border-white text-white select-none font-bold"
                        style={{ backgroundColor: elem.color || '#F97316' }}
                      >
                        <span className="text-xs">🚛</span>
                        <div className="w-14 h-7 bg-slate-950/80 rounded border border-white/20"></div>
                      </div>
                    )}

                    {/* Motorcycle Rendering */}
                    {elem.type === 'motorcycle' && (
                      <div 
                        className="relative w-[45px] h-[24px] rounded-full shadow-lg flex items-center justify-center border-2 border-white text-white select-none"
                        style={{ backgroundColor: elem.color || '#8B5CF6' }}
                      >
                        <span className="text-xs">🏍️</span>
                      </div>
                    )}

                    {/* Impact Point */}
                    {elem.type === 'impact' && (
                      <div className="w-11 h-11 bg-amber-500/90 rounded-full border-2 border-red-500 flex items-center justify-center text-lg shadow-2xl animate-pulse">
                        💥
                      </div>
                    )}

                    {/* Arrow Marker */}
                    {elem.type === 'arrow' && (
                      <div className="w-12 h-6 flex items-center justify-center text-blue-400 font-black text-xl filter drop-shadow">
                        ➔
                      </div>
                    )}

                    {/* Turn Arrow */}
                    {elem.type === 'turn_arrow' && (
                      <div className="w-10 h-10 flex items-center justify-center text-amber-400 font-black text-2xl filter drop-shadow">
                        ⮤
                      </div>
                    )}

                    {/* Skid Mark */}
                    {elem.type === 'skid_mark' && (
                      <div className="w-20 h-5 flex flex-col justify-between py-0.5 opacity-80">
                        <div className="w-full h-1.5 bg-slate-950 rounded-full"></div>
                        <div className="w-full h-1.5 bg-slate-950 rounded-full"></div>
                      </div>
                    )}

                    {/* Traffic Light */}
                    {elem.type === 'traffic_light' && (
                      <div className="w-7 h-14 bg-slate-950 rounded-lg border-2 border-slate-600 flex flex-col items-center justify-around py-1 shadow-xl">
                        <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-pulse"></span>
                        <span className="w-3.5 h-3.5 rounded-full bg-yellow-500"></span>
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-500"></span>
                      </div>
                    )}

                    {/* Stop Sign */}
                    {elem.type === 'stop_sign' && (
                      <div className="w-9 h-9 bg-red-600 rounded-lg border-2 border-white flex items-center justify-center text-white font-black text-[10px] shadow-xl">
                        قف
                      </div>
                    )}

                    {/* Yield Sign */}
                    {elem.type === 'yield_sign' && (
                      <div className="w-9 h-9 bg-yellow-400 rounded-lg border-2 border-red-600 flex items-center justify-center text-red-900 font-black text-[9px] shadow-xl">
                        أولوية
                      </div>
                    )}

                    {/* Pedestrian */}
                    {elem.type === 'pedestrian' && (
                      <div className="w-8 h-8 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center text-white text-sm shadow-md">
                        🚶
                      </div>
                    )}

                    {/* Obstacle */}
                    {elem.type === 'obstacle' && (
                      <div className="w-9 h-9 bg-amber-600 rounded-xl border-2 border-yellow-300 flex items-center justify-center text-white text-xs shadow-md">
                        🚧
                      </div>
                    )}

                    {/* Text Annotation */}
                    {elem.type === 'text' && (
                      <div className="bg-slate-950/90 text-white text-xs font-bold px-2.5 py-1 rounded-xl border border-amber-400/80 shadow-2xl whitespace-nowrap">
                        {elem.label}
                      </div>
                    )}

                    {/* Sub-label badge */}
                    {elem.label && elem.type !== 'text' && (
                      <div 
                        className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-slate-950/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap pointer-events-none border border-slate-700"
                        style={{ transform: `translateX(-50%) rotate(${-elem.rotation}deg)` }}
                      >
                        {elem.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected Element Quick Controller Bar (Bottom of Canvas) */}
            {selectedElement && (
              <div className="bg-slate-900/95 backdrop-blur-md p-3 border-t border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs text-white shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">العنصر المحدد:</span>
                  <input
                    type="text"
                    value={selectedElement.label || ''}
                    onChange={(e) => handleUpdateLabel(selectedElement.id, e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500 w-44"
                    placeholder="تسمية العنصر..."
                  />
                  <span className="text-[10px] text-slate-400 font-mono">({selectedElement.rotation}°)</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRotate(selectedElement.id, 45)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>تدوير +45°</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRotate(selectedElement.id, -45)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700"
                  >
                    <RotateCw className="w-3.5 h-3.5 -scale-x-100" />
                    <span>تدوير -45°</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(selectedElement.id)}
                    className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl border border-red-500/30 cursor-pointer"
                    title="حذف هذا العنصر"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Toolbox & Stamp Elements Palette */}
        <div className={`space-y-4 ${isFullscreen ? 'h-full overflow-y-auto pr-1' : ''}`}>
          
          {/* Elements Stamping Library */}
          <div className="bg-[#1E293B] p-3 rounded-2xl border border-slate-700 shadow-sm space-y-2.5">
            <h4 className="text-xs font-black text-slate-300 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-amber-400" />
              <span>مكتبة العناصر:</span>
            </h4>

            {/* Vehicles Group */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block">المركبات:</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddElement('vehicle', { color: '#3B82F6', label: 'مركبة (أ) المؤمن له' })}
                  className="p-2 bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 rounded-xl text-xs font-bold flex items-center gap-2 border border-blue-800/60 transition-colors"
                >
                  <Car className="w-4 h-4 text-blue-400" />
                  <span>مركبة (أ)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddElement('vehicle', { color: '#EF4444', label: 'مركبة (ب) الطرف الثاني' })}
                  className="p-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-800/60 transition-colors"
                >
                  <Car className="w-4 h-4 text-red-400" />
                  <span>مركبة (ب)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddElement('truck')}
                  className="p-2 bg-orange-950/40 hover:bg-orange-900/60 text-orange-300 rounded-xl text-xs font-bold flex items-center gap-2 border border-orange-800/60 transition-colors"
                >
                  <Truck className="w-4 h-4 text-orange-400" />
                  <span>شاحنة / باص</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddElement('motorcycle')}
                  className="p-2 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 rounded-xl text-xs font-bold flex items-center gap-2 border border-purple-800/60 transition-colors"
                >
                  <Bike className="w-4 h-4 text-purple-400" />
                  <span>دراجة نارية</span>
                </button>
              </div>
            </div>

            {/* Impact & Trajectory */}
            <div className="space-y-1 pt-1.5 border-t border-slate-700/60">
              <span className="text-[10px] font-bold text-slate-400 block">الاصطدام والحركة:</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddElement('impact')}
                  className="p-2 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-2 border border-amber-800/60 transition-colors"
                >
                  <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>نقطة اصطدام 💥</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddElement('skid_mark')}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700 transition-colors"
                >
                  <Split className="w-4 h-4 text-slate-400" />
                  <span>آثار فرملة</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddElement('arrow')}
                  className="p-2 bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 rounded-xl text-xs font-bold flex items-center gap-2 border border-blue-800/60 transition-colors"
                >
                  <Move className="w-4 h-4 text-blue-400" />
                  <span>سهم مسار</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddElement('turn_arrow')}
                  className="p-2 bg-yellow-950/40 hover:bg-yellow-900/60 text-yellow-300 rounded-xl text-xs font-bold flex items-center gap-2 border border-yellow-800/60 transition-colors"
                >
                  <ArrowUpRight className="w-4 h-4 text-yellow-400" />
                  <span>سهم انعطاف</span>
                </button>
              </div>
            </div>

            {/* Traffic Control Signs */}
            <div className="space-y-1 pt-1.5 border-t border-slate-700/60">
              <span className="text-[10px] font-bold text-slate-400 block">الشواخص والمشاة:</span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddElement('traffic_light')}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border border-slate-700"
                >
                  <span>🚦</span>
                  <span className="text-[10px]">إشارة</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddElement('stop_sign')}
                  className="p-2 bg-red-950/50 hover:bg-red-900/60 text-red-200 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border border-red-800/60"
                >
                  <span>🛑</span>
                  <span className="text-[10px]">شاخصة قف</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddElement('yield_sign')}
                  className="p-2 bg-yellow-950/50 hover:bg-yellow-900/60 text-yellow-200 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border border-yellow-800/60"
                >
                  <span>⚠️</span>
                  <span className="text-[10px]">أولوية</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddElement('pedestrian')}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border border-slate-700"
                >
                  <Footprints className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px]">مشاة</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddElement('obstacle')}
                  className="p-2 bg-amber-950/50 hover:bg-amber-900/60 text-amber-200 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border border-amber-800/60"
                >
                  <span>🚧</span>
                  <span className="text-[10px]">عائق</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddElement('text')}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border border-slate-700"
                >
                  <Type className="w-4 h-4 text-blue-400" />
                  <span className="text-[10px]">نص</span>
                </button>
              </div>
            </div>
          </div>

          {/* Diagram Explanation Notes */}
          <div className="bg-[#1E293B] p-3 rounded-2xl border border-slate-700 shadow-sm space-y-1.5">
            <label className="text-xs font-black text-slate-300 block">ملاحظات الكروكا:</label>
            <textarea
              rows={2}
              value={diagramData.notes || ''}
              onChange={(e) => onChange({ ...diagramData, notes: e.target.value })}
              placeholder="ملاحظات حول الحادث ومسار السير..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Preview of Attached Snapshot */}
          {previewImage && (
            <div className="bg-[#1E293B] p-3.5 rounded-3xl border border-emerald-500/40 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4" />
                  <span>معاينة الكروكا المعتمدة بالقضية:</span>
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">جاهزة للإرسال</span>
              </div>
              <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 relative group">
                <img src={previewImage} alt="كروكا الحادث" className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a
                    href={previewImage}
                    download={`accident_diagram_${caseId || 'case'}.png`}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل</span>
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
