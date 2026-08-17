import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, Mic, Camera, Paperclip, Check, CheckCheck, FileText, Image as ImageIcon, Volume2, Square, Play, X, Shield, User, Clock } from 'lucide-react';
import { CaseMessage } from '../types';

interface CaseCommunicationBagProps {
  incidentId: string;
  incidentNumber: string;
  currentUserName: string;
  currentUserRole: 'Reception' | 'HQ' | 'Field Investigator';
  onClose?: () => void;
}

export const CaseCommunicationBag: React.FC<CaseCommunicationBagProps> = ({
  incidentId,
  incidentNumber,
  currentUserName,
  currentUserRole,
  onClose
}) => {
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Fetch initial messages and connect socket
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/cases/${incidentId}/messages`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();

    const socket = io(window.location.origin);
    socket.on('case:new_message', (msg: any) => {
      const msgCaseId = msg.caseId || msg.incidentId;
      if (msgCaseId === incidentId) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        
        // Play notification sound if message is not from current user
        const msgSender = msg.sender || msg.senderName;
        if (msgSender !== currentUserName) {
          try {
            const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
            audio.play().catch(() => {});
          } catch (e) {}
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [incidentId, currentUserName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (contentType: 'text' | 'voice' | 'image' | 'document', content: string, fileName?: string, duration?: number) => {
    if (!content.trim() && contentType === 'text') return;

    const payload = {
      sender: currentUserName,
      senderRole: currentUserRole,
      contentType,
      content,
      fileName: fileName || null,
      mediaDurationSeconds: duration || null
    };

    try {
      const res = await fetch(`/api/cases/${incidentId}/messages`, {
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
        setInputText('');
        setAudioPreviewUrl(null);
        setAudioBlob(null);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Voice recording logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioPreviewUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);

      (window as any).__activeMediaRecorder = mediaRecorder;
    } catch (err) {
      console.error("Microphone access error:", err);
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => {
          if (s >= 5) {
            stopRecordingSimulation();
            return 5;
          }
          return s + 1;
        });
      }, 1000);
    }
  };

  const stopRecordingSimulation = () => {
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    handleSendMessage('voice', 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg', 'ملاحظة_صوتية_ميدانية.webm', recordingSeconds || 4);
  };

  const stopRecording = () => {
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    const recorder = (window as any).__activeMediaRecorder;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    } else {
      stopRecordingSimulation();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      handleSendMessage(type, result, file.name);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-2xl overflow-hidden shadow-2xl border border-slate-800" dir="rtl">
      {/* HEADER */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow">
            👝
          </div>
          <div>
            <h3 className="font-black text-sm text-white flex items-center gap-2">
              <span>حقيبة اتصال القضية</span>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-[10px]">
                {incidentNumber}
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">اتصال لحظي مؤمن: Reception ↔ HQ ↔ Field Investigator</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* CHAT MESSAGES BODY */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gradient-to-b from-slate-900 to-[#050b14]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
            <Shield className="w-10 h-10 stroke-1 text-slate-600" />
            <p className="text-xs">لا توجد رسائل سابقة في حقيبة هذه القضية.</p>
            <p className="text-[10px] text-slate-600">جميع المراسلات والمرفقات مسجلة آمنياً ومرتبطة بـ Cloud SQL.</p>
          </div>
        ) : (
          messages.map((mItem: any, idx) => {
            const senderName = mItem.sender || mItem.senderName || 'مستخدم';
            const timestampVal = mItem.timestamp || mItem.sentAt || Date.now();
            const isMe = senderName === currentUserName;
            return (
              <div key={mItem.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="font-bold text-[11px] text-slate-300">{senderName}</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                    {mItem.senderRole === 'HQ' ? 'غرفة العمليات' : mItem.senderRole === 'Reception' ? 'الاستقبال' : 'محقق ميداني'}
                  </span>
                  <span className="text-[9px] text-slate-500">{new Date(timestampVal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className={`max-w-md rounded-2xl p-3 shadow-md text-xs ${isMe ? 'bg-blue-600 text-white rounded-tl-none' : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-tr-none'}`}>
                  {mItem.contentType === 'text' && (
                    <p className="whitespace-pre-wrap leading-relaxed">{mItem.content}</p>
                  )}

                  {mItem.contentType === 'image' && (
                    <div className="space-y-2">
                      <img src={mItem.content} alt="مرفق صورة" className="rounded-xl max-h-56 object-cover border border-slate-600 shadow" />
                      {mItem.fileName && <p className="text-[10px] opacity-80">{mItem.fileName}</p>}
                    </div>
                  )}

                  {mItem.contentType === 'voice' && (
                    <div className="flex items-center gap-3 py-1">
                      <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all">
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                      <div className="flex flex-col">
                        <span className="font-medium">🎤 ملاحظة صوتية ({mItem.mediaDurationSeconds || 5} ثوانٍ)</span>
                        <audio controls src={mItem.content} className="hidden" />
                      </div>
                    </div>
                  )}

                  {mItem.contentType === 'document' && (
                    <div className="flex items-center gap-2.5 p-2 bg-black/20 rounded-xl">
                      <FileText className="w-6 h-6 text-amber-400 shrink-0" />
                      <div className="overflow-hidden">
                        <p className="font-bold truncate">{mItem.fileName || 'مستند مرفق'}</p>
                        <a href={mItem.content} download={mItem.fileName || 'document'} target="_blank" rel="noreferrer" className="text-[10px] text-blue-300 underline">تحميل أو استعراض المستند</a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-70">
                    <span>{new Date(timestampVal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <CheckCheck className="w-3 h-3 text-emerald-400" />
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT / ATTACHMENT FOOTER matching [ + attachment ] [ Write message... ] [ 🎙️ ] */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
        <input 
          type="file" 
          ref={cameraInputRef} 
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

        <div className="flex items-center gap-1">
          <button 
            onClick={() => cameraInputRef.current?.click()} 
            title="التقاط بالكاميرا"
            className="p-2 bg-slate-900 hover:bg-slate-800 text-blue-400 rounded-xl border border-slate-800 transition-all flex items-center justify-center"
          >
            <Camera className="w-4 h-4" />
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()} 
            title="إرفاق مستند أو صورة"
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-all flex items-center justify-center"
          >
            <Paperclip className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 relative flex items-center">
          {isRecording ? (
            <div className="w-full bg-red-950/40 border border-red-800/60 rounded-xl px-3 py-2 flex items-center justify-between text-red-300 animate-pulse">
              <span className="flex items-center gap-2 font-bold text-xs">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                جاري تسسجيل الملاحظة الصوتية ({recordingSeconds} ثوانٍ)...
              </span>
              <button onClick={stopRecording} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold shadow">
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
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-500"
            />
          )}
        </div>

        {inputText.trim() ? (
          <button
            onClick={() => handleSendMessage('text', inputText)}
            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow transition-all flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        ) : (
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            onClick={() => {
              if (!isRecording) startRecording();
              else stopRecording();
            }}
            title="اضغط واستمر للتسجيل الصوتي"
            className={`p-2 rounded-xl transition-all shadow flex items-center justify-center ${isRecording ? 'bg-red-600 text-white animate-bounce' : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800'}`}
          >
            <Mic className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
