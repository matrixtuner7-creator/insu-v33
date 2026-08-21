import React, { useState, useRef } from 'react';
import { MessageSquare, Mic, Square, Play, Pause, Plus, Trash2, CheckCircle2, User, UserCheck, Eye, Phone, Volume2 } from 'lucide-react';
import { CaseStatement } from '../../types';
import { SignaturePad } from './SignaturePad';

interface Step6StatementsWitnessesProps {
  statements: CaseStatement[];
  onChange: (updatedStatements: CaseStatement[]) => void;
}

export const Step6StatementsWitnesses: React.FC<Step6StatementsWitnessesProps> = ({
  statements,
  onChange
}) => {
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<any>(null);
  const [audioBlobMap, setAudioBlobMap] = useState<Record<string, string>>({});

  // Ensure minimum 2 default statements (insured & third_party)
  React.useEffect(() => {
    if (!statements || statements.length === 0) {
      const defaults: CaseStatement[] = [
        {
          id: 'stmt_insured',
          partyType: 'insured',
          partyLabel: 'إفادة المؤمن له (السائق الأول)',
          personName: '',
          phone: '',
          statementText: '',
          timestamp: new Date().toISOString()
        },
        {
          id: 'stmt_third_party',
          partyType: 'third_party',
          partyLabel: 'إفادة الطرف الآخر (السائق الثاني)',
          personName: '',
          phone: '',
          statementText: '',
          timestamp: new Date().toISOString()
        }
      ];
      onChange(defaults);
    }
  }, []);

  const handleUpdate = (id: string, field: keyof CaseStatement, value: any) => {
    onChange(statements.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleAddWitness = () => {
    const newWitness: CaseStatement = {
      id: `witness_${Date.now()}`,
      partyType: 'witness',
      partyLabel: `إفادة شاهد عيان (${statements.filter(s => s.partyType === 'witness').length + 1})`,
      personName: '',
      phone: '',
      statementText: '',
      timestamp: new Date().toISOString()
    };
    onChange([...statements, newWitness]);
  };

  const handleRemove = (id: string) => {
    if (statements.length <= 1) return;
    onChange(statements.filter(s => s.id !== id));
  };

  // Voice recording logic
  const startVoiceRecord = async (statementId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(blob);
        setAudioBlobMap(prev => ({ ...prev, [statementId]: audioUrl }));
        handleUpdate(statementId, 'audioUrl', audioUrl);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setActiveRecordingId(statementId);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds(sec => sec + 1);
      }, 1000);
    } catch (err) {
      console.warn("Could not access microphone:", err);
    }
  };

  const stopVoiceRecord = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setActiveRecordingId(null);
    setRecordingSeconds(0);
  };

  return (
    <div className="space-y-4 text-right animate-fade-in" dir="rtl">
      {/* Step Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-600 font-black text-sm">
            <MessageSquare className="w-4 h-4" />
            <span>الخطوة 6: إفادات الأطراف والشهود والتواقيع الرقمية</span>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {statements.length} إفادات
          </span>
        </div>
        <p className="text-xs text-slate-500">
          تدوين أقوال الأطراف والشهود نصياً أو صوتياً مع التوقيع الإلكتروني الحي.
        </p>
      </div>

      {/* Statements List */}
      <div className="space-y-4">
        {statements.map((stmt, idx) => {
          const isWitness = stmt.partyType === 'witness';
          const isRecordingThis = activeRecordingId === stmt.id;
          const hasAudio = !!(stmt.audioUrl || audioBlobMap[stmt.id]);

          return (
            <div
              key={stmt.id}
              className={`bg-white rounded-2xl border p-4 shadow-sm space-y-3.5 ${
                isWitness ? 'border-purple-200 bg-purple-50/20' : 'border-slate-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    stmt.partyType === 'insured'
                      ? 'bg-blue-600 text-white'
                      : stmt.partyType === 'third_party'
                      ? 'bg-rose-600 text-white'
                      : 'bg-purple-600 text-white'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">{stmt.partyLabel}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {isWitness ? 'شاهد مستقل على مجريات الحادث' : 'إفادة رسمية على مسؤولية المصرح'}
                    </span>
                  </div>
                </div>

                {isWitness && (
                  <button
                    type="button"
                    onClick={() => handleRemove(stmt.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    اسم صاحب الإفادة: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={stmt.personName}
                    onChange={(e) => handleUpdate(stmt.id, 'personName', e.target.value)}
                    placeholder="الاسم الثلاثي"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    رقم الهاتف:
                  </label>
                  <input
                    type="tel"
                    value={stmt.phone}
                    onChange={(e) => handleUpdate(stmt.id, 'phone', e.target.value)}
                    placeholder="059xxxxxxx"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              {/* Statement Text Area */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  نص الإفادة والأقوال: <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={stmt.statementText}
                  onChange={(e) => handleUpdate(stmt.id, 'statementText', e.target.value)}
                  placeholder="أقر أنا الموقع أدناه بأنه أثناء سيري في المسار المذكور..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-purple-600 resize-none"
                />
              </div>

              {/* Optional Voice Note Recording */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <Volume2 className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-slate-700">تسجيل صوتي للإفادة:</span>
                  {hasAudio && (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      تم التسجيل
                    </span>
                  )}
                </div>

                <div>
                  {!isRecordingThis ? (
                    <button
                      type="button"
                      onClick={() => startVoiceRecord(stmt.id)}
                      className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5 text-purple-600" />
                      <span>{hasAudio ? 'إعادة التسجيل' : 'تسجيل صوتي'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopVoiceRecord}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 animate-pulse cursor-pointer shadow-md shadow-red-600/30"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>إيقاف ({recordingSeconds} ثانية)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Audio Player if recorded */}
              {hasAudio && stmt.audioUrl && (
                <div className="pt-1">
                  <audio controls src={stmt.audioUrl} className="w-full h-8" />
                </div>
              )}

              {/* Digital Signature Pad */}
              <div className="pt-2 border-t border-slate-100">
                <SignaturePad
                  initialSignature={stmt.signatureDataUrl}
                  signerName={stmt.personName || stmt.partyLabel}
                  onSave={(dataUrl) => handleUpdate(stmt.id, 'signatureDataUrl', dataUrl)}
                  label={`توقيع ${stmt.partyLabel}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Witness Button */}
      <button
        type="button"
        onClick={handleAddWitness}
        className="w-full py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 border-2 border-dashed border-purple-300 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98"
      >
        <Plus className="w-4 h-4" />
        <span>إضافة إفادة شاهد عيان جديد</span>
      </button>
    </div>
  );
};
