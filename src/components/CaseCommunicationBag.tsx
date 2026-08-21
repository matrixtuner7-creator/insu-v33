import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  X, Send, Paperclip, Mic, Camera, Radio, 
  MapPin, CheckCircle2, AlertCircle, StopCircle, User, SwitchCamera, Maximize2, Download,
  Play, Pause, ChevronRight, CheckCheck, Shield, ShieldAlert, ScanLine, Barcode, ImageIcon, RefreshCw, Users,
  Phone, MessageSquare, Layers
} from 'lucide-react';
import { CaseMessage, FieldAgent } from '../types';
import { getPublicShareUrl } from '../lib/shareUtils';
import { radioAudio } from '../lib/radioAudio';

interface CaseCommunicationBagProps {
  incidentId: string;
  incidentNumber: string;
  currentUserName: string;
  currentUserRole: 'Reception' | 'HQ' | 'Field Investigator' | 'admin' | 'investigator';
  onClose?: () => void;
  initialTab?: 'chat' | 'radio' | 'camera' | 'investigation';
  agents?: FieldAgent[];
  currentAssignedAgentId?: string;
  onAssignAgent?: (agentId: string) => void;
}

export const CaseCommunicationBag: React.FC<CaseCommunicationBagProps> = ({
  incidentId,
  incidentNumber,
  currentUserName,
  currentUserRole,
  onClose,
  initialTab = 'chat',
  agents = [],
  currentAssignedAgentId,
  onAssignAgent
}) => {
  const MOBILE_SAFE_MODE = false;
  const [activeTab, setActiveTab] = useState<'chat' | 'radio' | 'camera' | 'investigation'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null);

  // Investigation dossier state
  const [investigationData, setInvestigationData] = useState<any>(null);
  const [isLoadingInvestigation, setIsLoadingInvestigation] = useState(false);

  const fetchInvestigationSession = async () => {
    if (!incidentId) return;
    setIsLoadingInvestigation(true);
    try {
      let fetchedSession: any = null;
      const res = await fetch(`/api/investigation/session/${encodeURIComponent(incidentId)}`);
      if (res.ok) {
        fetchedSession = await res.json();
      }

      if (fetchedSession) {
        setInvestigationData(fetchedSession);
      }
    } catch (e) {
      console.warn("Could not fetch investigation session:", e);
    } finally {
      setIsLoadingInvestigation(false);
    }
  };

  useEffect(() => {
    fetchInvestigationSession();
  }, [activeTab, incidentId, incidentNumber]);

  // Resolve Croquis / Diagram Image with database truth (No fallbacks)
  const resolvedCroquisImage: string | null = (() => {
    if (investigationData?.diagramData?.previewImageUrl) return investigationData.diagramData.previewImageUrl;
    if (investigationData?.diagramData?.exportedImage) return investigationData.diagramData.exportedImage;
    return null;
  })();

  // Multi-investigator selector state
  const [availableAgents, setAvailableAgents] = useState<FieldAgent[]>(() => agents && agents.length > 0 ? agents : []);
  const [selectedIntercomAgentId, setSelectedIntercomAgentId] = useState<string>(currentAssignedAgentId || 'all');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (agents && agents.length > 0) {
      setAvailableAgents(agents);
    } else {
      fetch('/api/agents')
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setAvailableAgents(data);
        })
        .catch(() => {});
    }
  }, [agents]);

  // Normal Voice Note Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // PTT (Push-to-Talk) Walkie-Talkie States
  const [isPttPressed, setIsPttPressed] = useState(false);
  const [pttSpeakerName, setPttSpeakerName] = useState<string | null>(null);
  const [pttSpeakerRole, setPttSpeakerRole] = useState<string | null>(null);
  const isReceivingPtt = !!pttSpeakerName;
  const [pttSeconds, setPttSeconds] = useState(0);
  const pttTimerRef = useRef<any>(null);
  const pttMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const pttAudioChunksRef = useRef<Blob[]>([]);

  // Live Camera Viewfinder State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Audio Playback State for list items
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Fetch initial messages and connect Socket.IO
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/cases/${encodeURIComponent(incidentId || incidentNumber || 'default')}/messages`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setMessages(data);
          }
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    const socket = io(window.location.origin, {
      reconnectionAttempts: 3,
      reconnectionDelay: 5000
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log("✅ Socket connected", socket.id);
      socket.emit("join_case", incidentId);
      if (incidentNumber && incidentNumber !== incidentId) {
        socket.emit("join_case", incidentNumber);
      }
    });
    socket.on('connect_error', (err) => console.error("❌ Socket connection error", err));
    
    socket.on('case:new_message', (msg: any) => {
      console.log("📩 Received new message:", msg);
      const msgCaseId = msg.incidentId || msg.caseId;
      console.log("🔍 Message Case ID vs Local:", msgCaseId, incidentId, incidentNumber);
      if (
        !msgCaseId ||
        msgCaseId === incidentId ||
        msgCaseId === incidentNumber ||
        (typeof incidentId === 'string' && typeof msgCaseId === 'string' && incidentId.includes(msgCaseId)) ||
        (typeof incidentNumber === 'string' && typeof msgCaseId === 'string' && incidentNumber.includes(msgCaseId))
      ) {
        console.log("✅ Message passed filter, adding to state.");
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });

        // If message is from another user, play incoming message notification chime and speak source
        const sender = msg.sender || msg.senderName;
        if (sender !== currentUserName) {
          radioAudio.playMessageNotification();
          
          const role = msg.senderRole;
          const label = (role === 'HQ' || role === 'Reception') ? 'رسالة من الإدارة' : 'رسالة من المحقق';
          setTimeout(() => {
            radioAudio.speakText(label);
          }, 350);
        }
      }
    });

    // PTT Live Relay events
    socket.on('ptt:transmitting', (data: any) => {
      if (data.senderName !== currentUserName) {
        setPttSpeakerName(data.senderName);
        setPttSpeakerRole(data.senderRole);
        radioAudio.playPttStart();
      }
    });

    socket.on('ptt:idle', (data: any) => {
      if (data.senderName !== currentUserName) {
        setPttSpeakerName(null);
        setPttSpeakerRole(null);
        radioAudio.playPttRelease();
      }
    });

    socket.on('ptt:voice_transmitted', (data: any) => {
      // Redundant playback removed here because App.tsx plays it globally and prevents double-play
      console.log("PTT Voice transmitted received inside case bag, delegated to global player.");
    });

    // Real-time sync for investigation updates & croquis diagram
    socket.on('investigation:session_updated', (updatedSession: any) => {
      if (
        updatedSession &&
        (updatedSession.caseId === incidentId ||
         updatedSession.caseId === incidentNumber ||
         updatedSession.basicInfo?.incidentNumber === incidentNumber ||
         updatedSession.basicInfo?.incidentNumber === incidentId)
      ) {
        setInvestigationData(updatedSession);
      }
    });

    return () => {
      socket.disconnect();
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [incidentId, incidentNumber, currentUserName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  // Clean up camera stream on tab change
  useEffect(() => {
    if (activeTab === 'camera') {
      startLiveCamera();
    } else {
      stopLiveCamera();
    }
  }, [activeTab, cameraFacingMode]);

  // 1. Live Camera Handlers
  const startLiveCamera = async () => {
    if (MOBILE_SAFE_MODE) return;
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn("Live camera access failed, falling back to native file input:", err);
      setIsCameraActive(false);
    }
  };

  const stopLiveCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const handleCaptureLivePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      nativeCameraInputRef.current?.click();
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      handleSendMessage('image', dataUrl, `صورة_ميدانية_${new Date().toISOString().slice(11, 19).replace(/:/g, '-')}.jpg`);
      setActiveTab('chat');
    }
  };

  // 2. Generic Message Sender
  const handleSendMessage = async (
    contentType: 'text' | 'voice' | 'image' | 'document' | 'ptt_broadcast',
    content: string,
    fileName?: string,
    duration?: number
  ) => {
    if (!content.trim() && contentType === 'text') return;

    const payload = {
      sender: currentUserName || 'المحقق الميداني',
      senderRole: currentUserRole || 'Field Investigator',
      contentType,
      content,
      fileName: fileName || null,
      mediaDurationSeconds: duration || null
    };

    try {
      const res = await fetch(`/api/cases/${encodeURIComponent(incidentId || incidentNumber || 'default')}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        
        // Speak Case Number dynamically with beep alert
        const announceType = contentType === 'text' ? 'text' : (contentType === 'ptt_broadcast' ? 'ptt' : 'voice');
        radioAudio.speakCaseNumber(incidentNumber || incidentId || '01', announceType);
        
        setInputText('');
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // 3. PTT Walkie-Talkie Push-to-Talk Engine
  const startPttTransmission = async () => {
    if (MOBILE_SAFE_MODE) {
      return;
    }
    if (isPttPressed) return;
    setIsPttPressed(true);
    setPttSeconds(0);
    radioAudio.playPttStart();

    if (socketRef.current) {
      socketRef.current.emit("ptt:start", {
        senderName: currentUserName,
        senderRole: currentUserRole,
        incidentId,
        channel: `قناة الطوارئ #${incidentNumber || '01'}`
      });
    }

    pttTimerRef.current = setInterval(() => {
      setPttSeconds(s => s + 1);
    }, 1000);

    try {
      const mimeType = radioAudio.getOptimalAudioMimeType();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      pttMediaRecorderRef.current = recorder;
      pttAudioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          pttAudioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(pttAudioChunksRef.current, { type: mimeType || 'audio/mp4' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('aac') ? 'aac' : 'webm';
          handleSendMessage(
            'ptt_broadcast',
            base64Audio,
            `بث_لاسلكي_${new Date().toLocaleTimeString().replace(/\s/g, '_')}.${ext}`,
            pttSeconds || 3
          );
        };
        reader.readAsDataURL(audioBlob);

        // Stop media stream tracks
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start(250);
    } catch (err) {
      console.warn("Microphone not available for PTT recording, operating in tactical signaling mode:", err);
    }
  };

  const stopPttTransmission = () => {
    if (!isPttPressed) return;
    setIsPttPressed(false);
    clearInterval(pttTimerRef.current);
    radioAudio.playPttRelease();

    if (socketRef.current) {
      socketRef.current.emit("ptt:stop", {
        senderName: currentUserName,
        incidentId
      });
    }

    if (pttMediaRecorderRef.current && pttMediaRecorderRef.current.state !== 'inactive') {
      try {
        pttMediaRecorderRef.current.stop();
      } catch (e) {}
    } else if (pttSeconds > 0) {
      // Fallback synthetic transmission
      handleSendMessage(
        'ptt_broadcast',
        'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
        'نداء_لاسلكي_تكتيكي.ogg',
        pttSeconds || 2
      );
    }
  };

  // Web PTT Physical/Keyboard Keybind Listener (Spacebar and Mobile Volume Triggers)
  useEffect(() => {
    if (activeTab !== 'radio') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.code === 'Space' || e.key === ' ' || e.key === 'VolumeUp' || e.key === 'VolumeDown') {
        e.preventDefault();
        startPttTransmission();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.code === 'Space' || e.key === ' ' || e.key === 'VolumeUp' || e.key === 'VolumeDown') {
        e.preventDefault();
        stopPttTransmission();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeTab, isPttPressed]);

  // 4. Voice Memo Recording (Standard Chat Voice Note)
  const startVoiceRecording = async () => {
    if (MOBILE_SAFE_MODE) {
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          handleSendMessage('voice', base64Audio, `تسجيل_صوتي_${Date.now()}.webm`, recordingSeconds || 4);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch (err) {
      console.warn("Standard microphone error:", err);
      // Simulated audio note fallback
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    }
  };

  const stopVoiceRecording = () => {
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      handleSendMessage('voice', 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg', 'ملاحظة_صوتية.ogg', recordingSeconds || 3);
    }
  };

  // 5. File & Photo Upload from File Picker
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      handleSendMessage(type, result, file.name);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Play/Pause voice message audio
  const togglePlayAudio = (msgId: string, audioUrl: string) => {
    if (playingMessageId === msgId) {
      currentAudioRef.current?.pause();
      setPlayingMessageId(null);
    } else {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      setPlayingMessageId(msgId);
      audio.play().catch(() => setPlayingMessageId(null));
      audio.onended = () => setPlayingMessageId(null);
    }
  };

  if (activeTab === 'radio') {
    return (
      <div className="flex flex-col w-full h-[100dvh] bg-[#fafafa] text-slate-900 overflow-hidden select-none relative" dir="rtl">
        {/* MINIMAL TOP BAR WITH SMALL CLOSE BUTTON */}
        <div className="px-4 py-3 flex items-center justify-between shrink-0 border-b border-slate-100 bg-white/95 backdrop-blur-sm z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#e7fed6] text-[#22A06B] flex items-center justify-center border border-green-200">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-xs text-slate-800">اللاسلكي الميداني</h3>
                <span className="px-1.5 py-0.5 bg-[#e7fed6] text-[#18754e] text-[9px] font-mono font-bold rounded">
                  PTT
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span className="w-1.5 h-1.5 bg-[#22A06B] rounded-full animate-ping"></span>
                <span>قناة الطوارئ المشفرة</span>
              </div>
            </div>
          </div>

          {/* SMALL CLOSE BUTTON AT TOP */}
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shadow-sm"
              title="إغلاق اللاسلكي"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* FULL SCREEN PTT BODY */}
        <div className="flex-1 flex flex-col items-center justify-between p-4 bg-gradient-to-b from-[#fafafa] via-white to-[#f0fbf5] overflow-y-auto">
          {/* STATUS INDICATOR CARD */}
          <div className="w-full max-w-sm bg-[#f0fbf5] border border-green-200/80 rounded-2xl py-3.5 px-4 shadow-sm mt-2 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col text-right flex-1 pr-1">
                <span className="text-[#18754e] font-black text-sm">القناة جاهزة للاستماع والإرسال</span>
                <span className="text-slate-500 text-xs mt-0.5 font-medium">اتصال مباشر مع العمليات</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#22A06B] flex items-center justify-center shrink-0 shadow text-white">
                <CheckCheck className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* INCOMING PTT ALERT IF SOMEONE IS TRANSMITTING */}
          {isReceivingPtt && (
            <div className="w-full max-w-sm bg-amber-50 border border-amber-200 rounded-2xl p-3 shadow-sm flex items-center gap-2 text-amber-900 text-xs font-bold animate-pulse mt-2 shrink-0">
              <Radio className="w-4 h-4 text-amber-600 animate-spin" />
              <span>جاري استقبال بث مباشر من: {pttSpeakerName}</span>
            </div>
          )}

          {/* IN-APP WARNING FOR MOBILE SAFE MODE */}
          {MOBILE_SAFE_MODE && (
            <div className="w-full max-w-sm bg-[#fff3cd] text-[#856404] p-3 rounded-xl border border-[#ffeeba] text-xs font-bold shadow-sm my-2 text-center animate-pulse flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>تم تعطيل الاتصال اللاسلكي مؤقتًا لحماية استقرار التطبيق على الموبايل.</span>
            </div>
          )}

          {/* GIANT PTT BUTTON CONCENTRIC CIRCLES */}
          <div className="relative flex items-center justify-center my-auto py-6">
            <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
              isPttPressed 
                ? 'bg-red-500/20 scale-150 animate-ping' 
                : 'bg-[#e7fed6]/70 scale-125'
            }`}></div>
            <div className={`absolute inset-0 border-4 rounded-full transition-all duration-300 ${
              isPttPressed 
                ? 'border-red-400 scale-135' 
                : 'border-[#e7fed6] scale-110'
            }`}></div>
            <button
              disabled={MOBILE_SAFE_MODE}
              onMouseDown={startPttTransmission}
              onMouseUp={stopPttTransmission}
              onTouchStart={(e) => { e.preventDefault(); startPttTransmission(); }}
              onTouchEnd={(e) => { e.preventDefault(); stopPttTransmission(); }}
              className={`w-52 h-52 rounded-full flex flex-col items-center justify-center transition-all duration-150 border-[6px] shadow-xl relative z-10 select-none cursor-pointer ${
                MOBILE_SAFE_MODE
                  ? 'bg-slate-100 border-slate-300 text-slate-400 opacity-60 cursor-not-allowed shadow-none'
                  : isPttPressed
                    ? 'bg-red-500 border-white text-white shadow-red-300 scale-105 active:scale-95'
                    : 'bg-white border-[#22A06B] hover:border-[#18754e] text-[#22A06B] shadow-green-100 active:scale-95'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="flex gap-1 items-center opacity-40">
                  <div className="w-1 h-3 bg-current rounded-full"></div>
                  <div className="w-1 h-5 bg-current rounded-full"></div>
                </div>
                <Mic className={`w-16 h-16 ${isPttPressed ? 'animate-bounce text-white' : 'text-[#22A06B]'}`} />
                <div className="flex gap-1 items-center opacity-40">
                  <div className="w-1 h-5 bg-current rounded-full"></div>
                  <div className="w-1 h-3 bg-current rounded-full"></div>
                </div>
              </div>
              <span className={`font-black text-base tracking-wide ${isPttPressed ? 'text-white' : 'text-[#22A06B]'}`}>
                {isPttPressed ? 'افلت لإنهاء البث' : 'اضغط للتحدث'}
              </span>
              <span className={`text-[10px] mt-1 font-mono tracking-wider ${isPttPressed ? 'text-white font-bold' : 'text-slate-400'}`}>
                {isPttPressed ? `${pttSeconds} ثانية (جاري البث)` : 'HOLD TO TALK'}
              </span>
            </button>
          </div>

          {/* FOOTER HINT */}
          <div className="w-full max-w-xs text-center pb-6 pt-2 shrink-0">
            <span className="text-[11px] text-slate-400 font-medium leading-relaxed">
              اضغط مطولاً على الزر للتحدث المباشر مع غرفة العمليات
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-[100dvh] bg-[#efeae2] bg-[url('/wa-bg.svg')] bg-repeat text-slate-900 overflow-hidden shadow-2xl select-none relative" dir="rtl">
      
      {/* HEADER WITH TACTICAL INDICATORS & NAVIGATION TABS */}
      <div className="bg-[#161B1F] border-b border-slate-700/60 p-3 shrink-0">
        <div className="flex items-center justify-between gap-2 mb-2">
          
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#dcf8c6]/20 border border-[#315EF5]/30 flex items-center justify-center text-[#315EF5] shadow-lg">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-white">حقيبة التكليف والمراسلات</h3>
                <span className="px-2 py-0.5 bg-[#dcf8c6]/20 text-[#315EF5] border border-[#315EF5]/30 rounded-lg text-[10px] font-mono font-bold">
                  {incidentNumber || 'قضية ميدانية'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="w-2 h-2 bg-[#22A06B] rounded-full animate-ping"></span>
                <span>{currentUserName} ({currentUserRole === 'HQ' ? 'غرفة العمليات' : 'محقق ميداني'})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onClose && (
              <button 
                onClick={onClose} 
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="إغلاق الحقيبة"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* MULTI-INVESTIGATOR INTERCOM & SWITCHER BAR */}
        {availableAgents && availableAgents.length > 0 && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-200">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900">
                <Users className="w-3.5 h-3.5 text-[#315EF5]" />
                <span>التنقل بين المحققين والتخاطب المباشر ({availableAgents.length})</span>
              </div>
              <span className="text-[10px] text-slate-500">انقر على أي محقق للتخاطب أو التكليف</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
              {/* Broadcast / All */}
              <button
                onClick={() => setSelectedIntercomAgentId('all')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  selectedIntercomAgentId === 'all'
                    ? 'bg-[#dcf8c6] text-slate-800 shadow ring-1 ring-[#315EF5]'
                    : 'bg-transparent hover:bg-slate-100 text-slate-500 border border-slate-200'
                }`}
              >
                <Radio className="w-3 h-3 text-[#315EF5]" />
                <span>القناة العامة (الكل)</span>
              </button>

              {/* Each Investigator Button */}
              {availableAgents.map((ag) => {
                const isSelected = selectedIntercomAgentId === ag.id;
                const isAssigned = currentAssignedAgentId === ag.id;
                return (
                  <button
                    key={ag.id}
                    onClick={() => setSelectedIntercomAgentId(ag.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-[#22A06B] text-slate-800 shadow ring-1 ring-[#22A06B]'
                        : 'bg-transparent hover:bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={ag.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                        alt=""
                        className="w-5 h-5 rounded-full object-cover border border-slate-200"
                        onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'; }}
                      />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#161B1F] ${ag.isActive !== false ? 'bg-[#22A06B]' : 'bg-[#7C8791]'}`}></span>
                    </div>
                    <span className="truncate max-w-[110px] text-slate-900">{ag.name}</span>
                    {isAssigned && (
                      <span className="px-1.5 py-0.2 bg-[#dcf8c6]/20 text-[#315EF5] text-[9px] rounded font-mono border border-[#315EF5]/30">
                        مكلف
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* SELECTED INVESTIGATOR ACTION CONTROLS */}
            {selectedIntercomAgentId !== 'all' && (() => {
              const activeAgent = availableAgents.find(a => a.id === selectedIntercomAgentId);
              if (!activeAgent) return null;
              const cleanPhone = (activeAgent.phone || (activeAgent as any)?.whatsapp || '+970590000000').replace(/[^0-9+]/g, '');
              const agentShareUrl = getPublicShareUrl({
                portal: 'agent',
                investigator_id: activeAgent.id,
                case_id: incidentNumber || incidentId
              });
              const waMsg = `🚨 تكليف وتواصل بشأن القضية رقم (${incidentNumber || incidentId})\nالزميل ${activeAgent.name}،\nرابط متابعة المعاينة الميدانية:\n${agentShareUrl}\nيرجى فتح الرابط والمتابعة فوراً.`;
              const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMsg)}`;

              return (
                <div className="mt-2 p-2.5 bg-transparent border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#22A06B]">
                      قناة خاصة مع: <strong className="text-slate-800">{activeAgent.name}</strong>
                    </span>
                    {activeAgent.phone && (
                      <span className="text-[10px] font-mono text-slate-500" style={{ direction: 'ltr' }}>
                        {activeAgent.phone}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* WhatsApp Button */}
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-[#22A06B] hover:bg-[#22A06B]/90 text-slate-800 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all shadow"
                    >
                      <Phone className="w-3 h-3 fill-current" />
                      <span>WhatsApp مباشر</span>
                    </a>

                    {/* Phone Call */}
                    {activeAgent.phone && (
                      <a
                        href={`tel:${cleanPhone}`}
                        className="px-2.5 py-1 bg-[#323A40] hover:bg-[#3A434C] text-slate-900 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all border border-slate-200"
                      >
                        <Phone className="w-3 h-3" />
                        <span>اتصال هاتفي</span>
                      </a>
                    )}

                    {/* Push-to-Talk Tab */}
                    <button
                      onClick={() => setActiveTab('radio')}
                      className="px-2.5 py-1 bg-[#D6A83A] hover:bg-[#D6A83A]/90 text-slate-900 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all shadow"
                    >
                      <Radio className="w-3 h-3" />
                      <span>PTT لاسلكي</span>
                    </button>

                    {/* Reassign / Assign Case to this Investigator */}
                    {onAssignAgent && currentAssignedAgentId !== activeAgent.id && (
                      <button
                        onClick={() => onAssignAgent(activeAgent.id)}
                        className="px-2.5 py-1 bg-[#dcf8c6] hover:bg-[#dcf8c6]/90 text-slate-800 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all shadow"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>إسناد القضية إليه</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* PRIMARY MODE NAVIGATION TABS */}
        <div className="mt-2.5 pt-2.5 border-t border-slate-700/60 flex items-center justify-between gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-[#315EF5] text-white shadow'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>المراسلات ({messages.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('radio')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'radio'
                ? 'bg-[#D6A83A] text-slate-950 font-black shadow'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>اللاسلكي PTT</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>الكاميرا</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('investigation')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border ${
              activeTab === 'investigation'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>ملف المعاينة والكروكا الرسمية 📐</span>
          </button>
        </div>
      </div>

      {/* BODY CONTENT AREA SWITCHING BASED ON ACTIVE TAB */}
      <div className="flex-1 overflow-hidden relative flex flex-col bg-transparent">
              {/* HIDDEN INPUTS */}
              <input 
                type="file" 
                ref={nativeCameraInputRef} 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
                onChange={(e) => handleFileUpload(e, 'image')} 
              />
              <input 
                type="file" 
                ref={fileInputRef} 
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" 
                className="hidden" 
                onChange={(e) => handleFileUpload(e, fileInputRef.current?.files?.[0]?.type?.includes('image') ? 'image' : 'document')} 
              />

        
        {/* ============================================================== */}
        {/* 1. CHAT MESSAGES & EVIDENCE LIST TAB */}
        {/* ============================================================== */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* INCOMING PTT ALERT BANNER IF SOMEONE IS TRANSMITTING */}
            {pttSpeakerName && (
              <div className="bg-[#D64545]/20 border-b border-[#D64545]/40 px-4 py-2 flex items-center justify-between text-[#D64545] animate-pulse text-xs">
                <div className="flex items-center gap-2 font-bold">
                  <Radio className="w-4 h-4 text-[#D64545] animate-bounce" />
                  <span>📻 بث لاسلكي جاري من: {pttSpeakerName} ({pttSpeakerRole || 'الميدان'})</span>
                </div>
                <span className="font-mono bg-[#D64545]/30 px-2 py-0.5 rounded text-[10px]">RX استماع</span>
              </div>
            )}

            {/* CROQUIS QUICK-ACCESS BANNER IN CHAT */}
            {resolvedCroquisImage && (
              <div 
                onClick={() => setActiveTab('investigation')}
                className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-2xl p-2.5 mx-4 mt-2.5 flex items-center justify-between cursor-pointer transition-all shadow-sm group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-xl">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-amber-300">مخطط الكروكا الرسمي معتمد ومرفوع</span>
                      <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">متاح</span>
                    </div>
                    <p className="text-[10px] text-slate-400">انقر لفتح واستعراض مخطط الحادث الكروكي عالي الدقة</p>
                  </div>
                </div>
                <button 
                  type="button"
                  className="px-2.5 py-1 bg-amber-500 text-slate-950 rounded-xl text-[11px] font-black group-hover:bg-amber-400 transition-colors flex items-center gap-1 shadow"
                >
                  <span>عرض الكروكا</span>
                  <ChevronRight className="w-3 h-3 rotate-180" />
                </button>
              </div>
            )}

            {/* MESSAGES SCROLL CONTAINER */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-[#7C8791] space-y-3 py-10">
                  <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center border border-slate-200 text-[#7C8791] shadow-inner">
                    <Shield className="w-8 h-8 stroke-1" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900">حقيبة التكليف جاهزة للمراسلة والتوثيق</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                      يمكنك إرسال رسائل نصية، تسجيلات صوتية، وبثوث لاسلكية PTT، والتقاط الصور بالكاميرا لحفظها فورياً في ملف القضية.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                <div className="flex justify-center mb-4 mt-2">
                    <span className="bg-white/90 backdrop-blur-sm text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm border border-slate-100">اليوم</span>
                </div>
                {messages.map((mItem: any, idx) => {
                  const senderName = mItem.sender || mItem.senderName || 'مستخدم';
                  const timestampVal = mItem.timestamp || mItem.sentAt || Date.now();
                  const isMe = senderName === currentUserName;
                  const isPttBroadcast = mItem.contentType === 'ptt_broadcast';

                  return (
                    <div key={mItem.id || idx} className={`flex w-full mb-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex flex-col max-w-[85%] sm:max-w-md rounded-2xl p-3 shadow-sm text-sm transition-all relative ${
                        isMe 
                           ? 'bg-[#e7fed6] text-slate-900 rounded-tl-none' 
                           : 'bg-white text-slate-900 rounded-tr-none'
                      }`}>
                        {/* 0. Sender Name for Incoming */}
                        {!isMe && (
                           <div className="text-[#22A06B] text-[11px] font-bold mb-1">
                              {mItem.senderRole === 'HQ' ? 'قسم العمليات' : (mItem.senderRole === 'Reception' ? 'الاستقبال' : 'محقق ميداني')}
                           </div>
                        )}
                        
                        {/* 1. TEXT */}
                        {mItem.contentType === 'text' && (
                          <p className="whitespace-pre-wrap leading-relaxed select-text font-normal text-[13px]">{mItem.content}</p>
                        )}
                        
                        {/* 2. IMAGE / CAMERA EVIDENCE */}
                        {(mItem.contentType === 'image' || mItem.contentType === 'photo' || mItem.contentType === 'camera') && (
                          <div className="space-y-2 mt-1">
                            <div 
                              onClick={() => setSelectedPhotoModal(mItem.content)}
                              className="relative group rounded-xl overflow-hidden cursor-pointer border border-slate-200 bg-black/40"
                            >
                              <img 
                                src={mItem.content} 
                                alt="دليل فوتوغرافي" 
                                className="w-full max-h-60 object-cover group-hover:scale-105 transition-transform duration-300" 
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* 3. VOICE RECORDING & PTT BROADCAST */}
                        {(mItem.contentType === 'voice' || mItem.contentType === 'ptt_broadcast') && (
                          <div className="flex items-center gap-3 py-1">
                            {/* Audio Mic Icon (Right Side in RTL) */}
                            <div className="w-10 h-10 rounded-full bg-[#f0fbf5] flex items-center justify-center shrink-0">
                                <Mic className="w-5 h-5 text-[#22A06B]" />
                            </div>
                            
                            {/* Slider (Middle) */}
                            <div className="flex-1 flex flex-col justify-center min-w-[120px]">
                              <div className="h-1.5 w-full bg-slate-200 rounded-full relative">
                                <div className={`h-full bg-[#22A06B] rounded-full relative transition-all ${playingMessageId === mItem.id ? 'w-full duration-[3000ms] ease-linear' : 'w-[15%]'}`}>
                                   <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#22A06B] rounded-full shadow-sm"></div>
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-500 mt-1 block font-mono">0:18</span>
                            </div>

                            {/* Play Button (Left Side in RTL) */}
                            <button
                              onClick={() => togglePlayAudio(mItem.id, mItem.content)}
                              className="shrink-0 text-slate-600 hover:text-slate-800 transition-colors"
                            >
                              {playingMessageId === mItem.id ? (
                                <Pause className="w-8 h-8 fill-current" />
                              ) : (
                                <Play className="w-8 h-8 fill-current" />
                              )}
                            </button>
                          </div>
                        )}

                        {/* Timestamp & Read Receipt */}
                        <div className={`self-end flex items-center gap-1 text-[10px] text-slate-400 mt-1 ${(mItem.contentType === 'voice' || mItem.contentType === 'ptt_broadcast') ? '-mt-2' : ''}`}>
                          <span className="font-sans">
                             {new Date(timestampVal).toLocaleTimeString('ar-EG', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)])}
                          </span>
                          {isMe && <CheckCheck className="w-3.5 h-3.5 text-[#22A06B]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* CHAT INPUT BAR WITH CAMERA / UPLOAD / VOICE / SEND */}
            <div className="p-3 bg-[#161B1F] border-t border-slate-200 flex items-center gap-2">
              
              {/* ACTION BUTTONS (Camera & Attach) */}
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setActiveTab('camera')} 
                  title="فتح كاميرا التوثيق الميداني"
                  className="p-2.5 bg-slate-200 hover:bg-slate-100 text-[#315EF5] rounded-xl border border-slate-200 transition-all flex items-center justify-center shadow"
                >
                  <Camera className="w-4 h-4" />
                </button>

                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  title="إرفاق ملف أو صورة من المعرض"
                  className="p-2.5 bg-slate-200 hover:bg-slate-100 text-slate-900 rounded-xl border border-slate-200 transition-all flex items-center justify-center shadow"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
              </div>

              {/* INPUT BOX OR ACTIVE VOICE RECORDING STRIP */}
              <div className="flex-1 relative flex items-center">
                {isRecording ? (
                  <div className="w-full bg-[#D64545]/20 border border-[#D64545]/50 rounded-xl px-3 py-2 flex items-center justify-between text-[#D64545] animate-pulse">
                    <span className="flex items-center gap-2 font-bold text-xs">
                      <span className="w-2.5 h-2.5 bg-[#D64545] rounded-full animate-ping"></span>
                      تسجيل صوتي ({recordingSeconds} ثوانٍ)...
                    </span>
                    <button 
                      onClick={stopVoiceRecording} 
                      className="px-3 py-1 bg-[#D64545] hover:bg-[#D64545]/90 text-slate-800 rounded-lg text-xs font-black shadow"
                    >
                      إيقاف وإرسال
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage('text', inputText)}
                    placeholder="اكتب رسالة في حقيبة القضية..."
                    className="w-full bg-slate-200 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#315EF5] transition-all placeholder:text-[#7C8791]"
                  />
                )}
              </div>

              {/* SEND OR MIC BUTTON */}
              {inputText.trim() ? (
                <button
                  onClick={() => handleSendMessage('text', inputText)}
                  className="p-2.5 bg-[#dcf8c6] hover:bg-[#dcf8c6]/90 text-slate-800 rounded-xl shadow-lg transition-all flex items-center justify-center font-bold"
                >
                  <Send className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (isRecording) stopVoiceRecording();
                    else startVoiceRecording();
                  }}
                  title={isRecording ? "إيقاف التسجيل" : "تسجيل ملاحظة صوتية"}
                  className={`p-2.5 rounded-xl transition-all shadow flex items-center justify-center ${
                    isRecording 
                      ? 'bg-[#D64545] text-slate-800 animate-bounce' 
                      : 'bg-slate-200 hover:bg-slate-100 text-[#D6A83A] border border-slate-200'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. DEDICATED PTT WALKIE-TALKIE TAB */}
        {/* ============================================================== */}
        {activeTab === 'radio' && (
          <div className="flex-1 flex flex-col items-center justify-start pt-6 pb-6 px-6 bg-[#fafafa] text-center overflow-y-auto">
            
            {/* HEADER TEXT */}
            <h2 className="text-xl font-black text-slate-800 mb-1">الاتصال اللاسلكي</h2>
            <div className="px-3 py-1 bg-[#e7fed6] text-[#22A06B] border border-[#22A06B]/20 rounded-full text-xs font-mono mb-8 inline-block shadow-sm">
              {incidentNumber || 'CLM-2026-907644'}
            </div>

            <div className="flex items-center gap-1.5 mb-4 text-[#22A06B] font-bold text-xs">
               <Radio className="w-4 h-4 animate-pulse" />
               <span>قناة العمليات الحالية</span>
            </div>

            {/* TACTICAL FREQUENCY SCREEN */}
            <div className="w-full max-w-sm bg-white border border-gray-100 rounded-3xl p-5 shadow-sm mb-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-[#f0fbf5] flex items-center justify-center text-[#22A06B]">
                   <Shield className="w-6 h-6" />
                </div>
                
                <div className="flex-1 px-4 text-right border-r border-slate-100 ml-4">
                   <div className="flex items-center gap-2 justify-end mb-1">
                      <span className="text-[10px] text-slate-400 font-mono tracking-wider">ENCRYPTED</span>
                      <span className="font-mono text-lg font-black text-slate-800 tracking-wider">CH-09</span>
                   </div>
                   <div className="flex items-center gap-2 justify-end">
                      <span className="text-[11px] text-slate-500 font-mono">462.5625 MHz</span>
                      <span className="text-gray-300">|</span>
                      <div className="flex items-center gap-1 text-[#22A06B]">
                         <span className="text-[11px] font-bold tracking-wider font-mono">ONLINE</span>
                         <span className="w-1.5 h-1.5 bg-[#22A06B] rounded-full"></span>
                      </div>
                   </div>
                </div>

                <div className="w-5 h-5 rounded-full bg-[#e7fed6] flex items-center justify-center shrink-0 border border-green-200">
                    <div className="w-2.5 h-2.5 bg-[#22A06B] rounded-full"></div>
                </div>
              </div>
            </div>

            {/* STATUS INDICATOR CARD */}
            <div className="w-full max-w-sm bg-[#f0fbf5] border border-green-100 rounded-2xl py-4 px-5 shadow-sm mb-12">
               <div className="flex items-center justify-between gap-2">
                 <div className="flex flex-col text-right flex-1 pr-2">
                   <span className="text-[#18754e] font-bold text-sm">القناة جاهزة للاستماع والإرسال</span>
                   <span className="text-slate-500 text-xs mt-1">اتصال مباشر مع العمليات</span>
                 </div>
                 <div className="w-8 h-8 rounded-full bg-[#22A06B] flex items-center justify-center shrink-0 shadow text-white">
                   <CheckCheck className="w-4 h-4" />
                 </div>
               </div>
            </div>

            {/* IN-APP WARNING FOR MOBILE SAFE MODE */}
            {MOBILE_SAFE_MODE && (
              <div className="w-full max-w-sm bg-[#fff3cd] text-[#856404] p-3 rounded-xl border border-[#ffeeba] text-xs font-bold shadow-sm mb-4 text-center animate-pulse flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>تم تعطيل الاتصال اللاسلكي مؤقتًا لحماية استقرار التطبيق على الموبايل.</span>
              </div>
            )}

            {/* GIANT PTT BUTTON CONCENTRIC CIRCLES */}
            <div className="relative flex items-center justify-center mt-2 mb-8">
               <div className="absolute inset-0 bg-[#e7fed6]/50 rounded-full scale-125"></div>
               <div className="absolute inset-0 border-4 border-[#e7fed6] rounded-full scale-110"></div>
               <button
                  disabled={MOBILE_SAFE_MODE}
                  onMouseDown={startPttTransmission}
                  onMouseUp={stopPttTransmission}
                  onTouchStart={(e) => { e.preventDefault(); startPttTransmission(); }}
                  onTouchEnd={(e) => { e.preventDefault(); stopPttTransmission(); }}
                  className={`w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all duration-150 border-[6px] shadow-lg relative z-10 ${
                    MOBILE_SAFE_MODE
                      ? 'bg-slate-100 border-slate-300 text-slate-400 opacity-60 cursor-not-allowed shadow-none'
                      : isPttPressed
                        ? 'bg-white border-[#D64545] text-[#D64545] shadow-red-200 scale-105 active:scale-95'
                        : 'bg-white border-[#22A06B] hover:border-[#18754e] text-[#22A06B] shadow-green-100 active:scale-95 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                     <div className="flex gap-1 items-center opacity-50">
                        <div className="w-1 h-3 bg-current rounded-full"></div>
                        <div className="w-1 h-5 bg-current rounded-full"></div>
                     </div>
                     <Mic className={`w-14 h-14 ${isPttPressed ? 'animate-bounce text-[#D64545]' : 'text-[#22A06B]'}`} />
                     <div className="flex gap-1 items-center opacity-50">
                        <div className="w-1 h-5 bg-current rounded-full"></div>
                        <div className="w-1 h-3 bg-current rounded-full"></div>
                     </div>
                  </div>
                  <span className={`font-black text-sm tracking-wide mt-2 ${isPttPressed ? 'text-[#D64545]' : 'text-[#22A06B]'}`}>
                    {isPttPressed ? 'افلت لإنهاء البث' : 'اضغط للتحدث'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 font-mono uppercase tracking-widest">
                    {isPttPressed ? `${pttSeconds} SEC` : 'HOLD TO TALK'}
                  </span>
                </button>
            </div>

            {/* QUICK FOOTER HINTS */}
            <div className="w-full max-w-sm mt-auto text-[11px] text-slate-600 leading-relaxed bg-white p-3 rounded-2xl border border-slate-100 flex flex-col gap-2 shadow-sm text-right" dir="rtl">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[#22A06B] shrink-0" />
                <span className="font-bold text-slate-700">تلميح الاتصال السريع:</span>
              </div>
              <p className="text-[10px] text-slate-500 pr-7 leading-relaxed">
                • اضغط مطولاً على الزر الأخضر للتحدث مباشرة.<br/>
                • **جديد:** يمكنك الضغط المستمر على **زر المسافة (Spacebar)** في لوحة المفاتيح أو **أزرار الصوت** بالهاتف للبث والتحدث مباشرة دون لمس الشاشة!
              </p>
            </div>
            
            <div className="pb-16"></div>
          </div>
        )}
{/* ============================================================== */}
{/* 3. LIVE CAMERA VIEWFINDER TAB */}
        {/* ============================================================== */}
        {activeTab === 'camera' && (
          <div className="flex-1 flex flex-col items-center justify-start pt-6 pb-6 px-4 bg-[#fafafa] text-center overflow-y-auto">
            
            {/* HEADER TEXT */}
            <h2 className="text-xl font-black text-slate-800 mb-1">الكاميرا الميدانية</h2>
            <div className="px-3 py-1 bg-[#e7fed6] text-[#22A06B] border border-[#22A06B]/20 rounded-full text-xs font-mono mb-2 inline-block shadow-sm">
              {incidentNumber || 'CLM-2026-907644'}
            </div>
            <div className="text-slate-500 text-xs mb-6">لتوثيق الأدلة الميدانية</div>
            
            {/* HIDDEN CANVAS FOR FRAME EXTRACTION */}
            <canvas ref={canvasRef} className="hidden" />

            {/* VIEWFINDER FRAME */}
            <div className="w-full max-w-md h-80 rounded-[32px] overflow-hidden relative bg-gradient-to-b from-[#3a4552] to-[#2a333d] shadow-md flex items-center justify-center mb-6">
              
              {/* Grid Lines */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
                 <div className="border-r border-white"></div>
                 <div className="border-r border-white"></div>
                 <div></div>
                 <div className="border-r border-t border-white"></div>
                 <div className="border-r border-t border-white"></div>
                 <div className="border-t border-white"></div>
                 <div className="border-r border-t border-white"></div>
                 <div className="border-r border-t border-white"></div>
                 <div className="border-t border-white"></div>
              </div>

              {isCameraActive ? (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover relative z-0"
                  />
                  {/* Custom Shutter Button overlayed if active */}
                  <div className="absolute bottom-6 w-full flex justify-center z-10">
                     <button
                        onClick={handleCaptureLivePhoto}
                        className="px-6 py-3 bg-[#e7fed6] text-[#18754e] rounded-2xl text-sm font-bold shadow-lg flex items-center gap-2 hover:bg-white transition-colors"
                      >
                        <Camera className="w-5 h-5" />
                        <span>التقاط صورة</span>
                      </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 text-white/80 z-10 flex flex-col items-center">
                  <Camera className="w-16 h-16 text-white/40 mb-4" strokeWidth={1} />
                  <p className="text-sm font-medium mb-8">جاهز لالتقاط الصور الميدانية</p>
                  
                  <button 
                    onClick={() => nativeCameraInputRef.current?.click()}
                    className="px-8 py-3.5 bg-[#e7fed6] text-[#18754e] rounded-2xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-white transition-colors w-full max-w-[200px]"
                  >
                    <Camera className="w-5 h-5" />
                    <span>فتح كاميرا الهاتف</span>
                  </button>
                </div>
              )}
            </div>

            {/* SUGGESTED LABELS (Mockup) */}
            <div className="w-full max-w-md flex justify-between gap-2 mb-6">
                <button className="flex-1 bg-white border border-slate-100 rounded-2xl py-3 px-2 flex items-center justify-center gap-2 shadow-sm text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                   <div className="w-6 h-6 rounded bg-[#f0fbf5] flex items-center justify-center text-[#22A06B]"><ImageIcon className="w-3 h-3" /></div>
                   صورة عامة
                </button>
                <button className="flex-1 bg-white border border-slate-100 rounded-2xl py-3 px-2 flex items-center justify-center gap-2 shadow-sm text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                   <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center text-blue-500"><ScanLine className="w-3 h-3" /></div>
                   لوحة المركبة
                </button>
                <button className="flex-1 bg-white border border-slate-100 rounded-2xl py-3 px-2 flex items-center justify-center gap-2 shadow-sm text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                   <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center text-indigo-500"><Barcode className="w-3 h-3" /></div>
                   رقم الهيكل
                </button>
            </div>

            {/* CAMERA CONTROLS BOTTOM BAR */}
            <div className="w-full max-w-md bg-white border border-slate-100 rounded-[32px] p-4 flex items-center justify-between shadow-sm">
              
              {/* UPLOAD FROM GALLERY */}
              <button
                onClick={() => fileInputRef.current?.click()}
                title="إرفاق صورة من الاستديو"
                className="w-16 flex flex-col items-center gap-1.5"
              >
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100">
                    <ImageIcon className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-slate-500 font-bold">الملفات</span>
              </button>
              
              {/* SHUTTER BUTTON (For actual web capture if needed) */}
              <div className="relative">
                 <div className="absolute inset-0 bg-[#e7fed6] rounded-full scale-110"></div>
                 <button
                   onClick={handleCaptureLivePhoto}
                   className="w-20 h-20 rounded-full bg-white border-[4px] border-[#22A06B] shadow-sm relative z-10 flex items-center justify-center hover:scale-95 transition-transform"
                   title="التقاط صورة للتوثيق"
                 >
                   <Camera className="w-7 h-7 text-[#22A06B]" />
                 </button>
              </div>

              {/* SWITCH CAMERA (Front/Back) */}
              <button
                onClick={() => setCameraFacingMode(m => m === 'environment' ? 'user' : 'environment')}
                title="تبديل الكاميرا"
                className="w-16 flex flex-col items-center gap-1.5"
              >
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100">
                   <RefreshCw className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-slate-500 font-bold">تبديل الكاميرا</span>
              </button>
            </div>
            <div className="pb-24"></div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 4. INVESTIGATION DOSSIER & ACCIDENT DIAGRAM (CROQUIS) TAB */}
        {/* ============================================================== */}
        {activeTab === 'investigation' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900 text-slate-100 pb-24" dir="rtl">
            {/* Header Status Card */}
            <div className="bg-[#1E293B] p-4 rounded-2xl border border-slate-700 shadow-md flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                  📐
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm text-white">ملف المعاينة والمخطط الكروكي الرسمي</h3>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold">
                      {investigationData?.status === 'SUBMITTED' ? 'معتمد ومكتمل' : 'بيانات ميدانية حية'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    المحقق: <strong className="text-slate-200">{investigationData?.investigatorName || currentUserName}</strong> • القضية: {incidentNumber || incidentId}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchInvestigationSession}
                disabled={isLoadingInvestigation}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                title="تحديث البيانات"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInvestigation ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">تحديث</span>
              </button>
            </div>

            {/* SECTION 1: THE ACCIDENT DIAGRAM (الكروكا الرسمية) */}
            <div className="bg-[#1B2530] p-4 rounded-3xl border border-slate-700/80 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                  <Layers className="w-4 h-4" />
                  <span>المخطط الكروكي الهندسي للحادث (Accident Sketch):</span>
                </div>
                {investigationData?.diagramData?.roadType && (
                  <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-xl text-[11px] font-bold border border-slate-700">
                    نوع الطريق: {
                      investigationData.diagramData.roadType === 'intersection' ? 'مفترق طرق رباعي' :
                      investigationData.diagramData.roadType === 'roundabout' ? 'دوار مروري' :
                      investigationData.diagramData.roadType === 't_junction' ? 'مفترق T' :
                      investigationData.diagramData.roadType === 'curve' ? 'منعطف حاد' :
                      investigationData.diagramData.roadType === 'highway' ? 'طريق سريع' : 'شارع مستقيم'
                    }
                  </span>
                )}
              </div>

              {/* Render Diagram Image if Available */}
              {resolvedCroquisImage ? (
                <div className="space-y-3">
                  <div className="w-full rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-slate-950 relative group shadow-md">
                    <img
                      src={resolvedCroquisImage}
                      alt="مخطط الكروكا الرسمي"
                      className="w-full max-h-[420px] object-contain mx-auto bg-slate-950"
                    />
                    <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedPhotoModal(resolvedCroquisImage)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                      >
                        <Maximize2 className="w-4 h-4" />
                        <span>تكبير المخطط</span>
                      </button>
                      <a
                        href={resolvedCroquisImage}
                        download={`croquis_${incidentNumber || incidentId || 'diagram'}.png`}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        <span>تحميل الصورة عالية الدقة</span>
                      </a>
                    </div>
                  </div>

                  {investigationData?.diagramData?.notes && (
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                      <strong className="text-amber-400 block mb-1">وصف وتوضيح المحقق الميداني:</strong>
                      <p>{investigationData.diagramData.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-dashed border-slate-700 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                    <Layers className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-300">لم يتم اعتماد صورة كروكا نهائية حتى الآن</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    يقوم المحقق الميداني حالياً برسم المخطط وتحديد مسارات المركبات وشواخص المرور ونقطة الاصطدام عبر شاشة الكروكا.
                  </p>
                </div>
              )}
            </div>

            {/* SECTION 2: FIELD MEDIA & PHOTO CHECKLIST */}
            {investigationData?.mediaChecklist && investigationData.mediaChecklist.length > 0 && (
              <div className="bg-[#1B2530] p-4 rounded-3xl border border-slate-700/80 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-400 font-black text-sm">
                    <ImageIcon className="w-4 h-4" />
                    <span>التوثيق المصور للحادث ({investigationData.mediaChecklist.length} صور):</span>
                  </div>
                  <span className="text-[11px] text-slate-400">انقر لتكبير أي صورة</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {investigationData.mediaChecklist.map((m: any, idx: number) => (
                    <div
                      key={m.id || idx}
                      onClick={() => m.photoUrl && setSelectedPhotoModal(m.photoUrl)}
                      className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden group cursor-pointer hover:border-blue-500/50 transition-all flex flex-col"
                    >
                      <div className="h-28 bg-slate-950 relative overflow-hidden">
                        {m.photoUrl ? (
                          <img
                            src={m.photoUrl}
                            alt={m.categoryLabel || 'صورة حادث'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                            لا توجد صورة
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm text-white text-[9px] font-bold rounded">
                          {m.categoryLabel || `صورة ${idx + 1}`}
                        </span>
                      </div>
                      <div className="p-2 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>{m.capturedAt ? new Date(m.capturedAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'توثيق ميداني'}</span>
                        <span className="text-emerald-400 font-bold">✓ موثق</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 3: INVOLVED PARTIES & STATEMENTS */}
            {investigationData?.statements && investigationData.statements.length > 0 && (
              <div className="bg-[#1B2530] p-4 rounded-3xl border border-slate-700/80 shadow-lg space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                  <User className="w-4 h-4" />
                  <span>إفادات الأطراف والشهود الميدانية:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {investigationData.statements.map((stmt: any, idx: number) => (
                    <div key={stmt.id || idx} className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-bold text-xs text-white">{stmt.partyLabel || stmt.personName || `طرف ${idx + 1}`}</span>
                        {stmt.phone && <span className="text-[10px] text-slate-400 font-mono" style={{ direction: 'ltr' }}>{stmt.phone}</span>}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                        "{stmt.statementText || 'لا توجد إفادة مسجلة'}"
                      </p>
                      {stmt.signatureDataUrl && (
                        <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                          <span>توقيع السائق/المقر:</span>
                          <img src={stmt.signatureDataUrl} alt="توقيع" className="h-6 max-w-[100px] object-contain filter invert" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 4: DAMAGE ASSESSMENT SUMMARY */}
            {investigationData?.damageAssessment && investigationData.damageAssessment.length > 0 && (
              <div className="bg-[#1B2530] p-4 rounded-3xl border border-slate-700/80 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-red-400 font-black text-sm">
                    <ShieldAlert className="w-4 h-4" />
                    <span>تقييم وحصر أضرار المركبات:</span>
                  </div>
                  <span className="text-xs font-mono font-black text-emerald-400">
                    الإجمالي التقديري: {
                      investigationData.damageAssessment.reduce((acc: number, item: any) => acc + (Number(item.estimatedCost) || 0), 0)
                    } ₪
                  </span>
                </div>

                <div className="space-y-2">
                  {investigationData.damageAssessment.map((d: any, idx: number) => (
                    <div key={d.id || idx} className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <strong className="text-white block">{d.vehicleLabel || d.vehiclePlate || `مركبة ${idx + 1}`}</strong>
                        <span className="text-slate-400 text-[11px]">{d.partName} • {d.notes || d.damageType || 'أضرار تصادم'}</span>
                      </div>
                      <div className="text-left shrink-0">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold block mb-1 text-center ${
                          d.severity === 'severe' ? 'bg-red-500/20 text-red-400' :
                          d.severity === 'medium' || d.severity === 'moderate' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {d.severity === 'severe' ? 'بليغ' : d.severity === 'medium' || d.severity === 'moderate' ? 'متوسط' : 'طفيف'}
                        </span>
                        {d.estimatedCost && (
                          <span className="font-mono text-emerald-400 font-bold">{d.estimatedCost} ₪</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 5: FINAL REPORT SUMMARY */}
            {investigationData?.finalReport?.summary && (
              <div className="bg-[#1B2530] p-4 rounded-3xl border border-emerald-500/30 shadow-lg space-y-2">
                <h4 className="text-xs font-black text-emerald-400">خلاصة تقرير المعاينة النهائي:</h4>
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                  {investigationData.finalReport.summary}
                </p>
                {investigationData.finalReport.finalNotes && (
                  <p className="text-[11px] text-slate-400">
                    ملاحظات إضافية: {investigationData.finalReport.finalNotes}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      
      {/* BOTTOM NAVIGATION BAR (FIXED) - EXACTLY LIKE MOCKUP */}
      {activeTab !== 'chat' && (
        <div className="absolute bottom-4 left-4 right-4 bg-white border border-slate-100 rounded-[28px] p-2 flex items-center justify-between shadow-lg z-50">
          
          <button onClick={() => onClose && onClose()} className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-600 transition-colors py-1">
             <User className="w-5 h-5" />
             <span className="text-[9px] font-bold">الرئيسية</span>
          </button>

          <button
            onClick={() => setActiveTab('radio')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-colors relative ${
              activeTab === 'radio' ? 'text-[#22A06B]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
             {isReceivingPtt && <span className="absolute top-0 right-1/4 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>}
             <Radio className="w-5 h-5" />
             <span className="text-[9px] font-bold">اللاسلكي</span>
             {activeTab === 'radio' && <div className="absolute -bottom-2 w-6 h-1 bg-[#22A06B] rounded-full"></div>}
          </button>

          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-2xl transition-all ${
              activeTab === 'camera' ? 'bg-[#e7fed6] text-[#18754e]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
             <Camera className="w-5 h-5" />
             <span className="text-[9px] font-bold">الكاميرا</span>
          </button>

          <button
            onClick={() => setActiveTab('investigation')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-colors ${
              activeTab === 'investigation' ? 'text-amber-500 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-bold">الكروكا</span>
          </button>

          <button onClick={() => onClose && onClose()} className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-600 transition-colors py-1">
             <div className="relative">
                <ShieldAlert className="w-5 h-5" />
                <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
             </div>
             <span className="text-[9px] font-bold">الحوادث</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-colors ${
              activeTab === 'chat' ? 'text-[#22A06B]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
             <div className="relative">
               <MessageSquare className="w-5 h-5" />
               {messages.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#22A06B] text-white text-[8px] flex items-center justify-center rounded-full font-bold">
                    {messages.length}
                  </div>
               )}
             </div>
             <span className="text-[9px] font-bold">المراسلات</span>
          </button>

        </div>
      )}
      
      </div>

      {/* PHOTO LIGHTBOX MODAL */}
      {selectedPhotoModal && (
        <div 
          onClick={() => setSelectedPhotoModal(null)}
          className="fixed inset-0 z-[999999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="relative max-w-3xl max-h-[90vh] flex flex-col items-center">
            <button 
              onClick={() => setSelectedPhotoModal(null)}
              className="absolute -top-10 left-0 p-2 bg-slate-200 hover:bg-slate-100 text-slate-800 rounded-full font-bold shadow border border-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={selectedPhotoModal} 
              alt="معاينة الصورة المكبرة" 
              className="max-h-[80vh] w-auto rounded-2xl shadow-2xl border border-slate-200 object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="mt-3 flex items-center gap-3">
              <a 
                href={selectedPhotoModal} 
                download={`دليل_${incidentNumber || 'accident'}.jpg`}
                className="px-4 py-2 bg-[#dcf8c6] hover:bg-[#dcf8c6]/90 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-2 shadow"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="w-4 h-4" />
                <span>تحميل الدليل الفوتوغرافي</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
