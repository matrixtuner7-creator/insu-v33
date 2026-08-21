import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  X, 
  Printer, 
  Share2, 
  RefreshCw, 
  Ban, 
  CheckCircle2, 
  Copy, 
  FileText, 
  Shield, 
  AlertCircle 
} from 'lucide-react';
import { QrCodeGenerator } from './QrCodeGenerator';

interface IncidentQrModalProps {
  caseId: string;
  isClosed?: boolean;
  onClose: () => void;
}

export const IncidentQrModal: React.FC<IncidentQrModalProps> = ({
  caseId,
  isClosed = false,
  onClose
}) => {
  const [qrRecord, setQrRecord] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const generateIncidentQr = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/qr/incident/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, createdBy: 'إدارة القضية' })
      });
      if (res.ok) {
        const data = await res.json();
        setQrRecord(data.qrRecord);
      }
    } catch (err) {
      console.error("Error generating incident QR:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateIncidentQr();
  }, [caseId]);

  const qrUrl = qrRecord ? `https://incident.palcom.online/q/incident/${qrRecord.secureToken || qrRecord.tokenHash}` : '';

  const handleCopyLink = () => {
    if (qrUrl) {
      navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 text-right font-sans" dir="rtl" id="INCIDENT_QR_MODAL">
      <div className="bg-[#2A323A] border border-[#3A434C] rounded-3xl w-full max-w-md p-6 text-white space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-[#3A434C] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-950 border border-purple-800 text-purple-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">رمز QR الميداني للقضية</h3>
              <p className="text-[10px] text-slate-400">رقم القضية: <span className="font-mono text-blue-400 font-bold">{caseId}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Closed Case Notice */}
        {isClosed && (
          <div className="bg-amber-950/80 border border-amber-800 text-amber-200 p-3 rounded-2xl text-xs flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>هذه القضية مغلقة - رمز QR للعرض فقط ولا يقبل تعديلات إضافية</span>
          </div>
        )}

        {/* QR Code Canvas */}
        <div className="bg-white p-4 rounded-2xl border border-slate-300 w-fit mx-auto shadow-xl text-center space-y-2">
          {isLoading ? (
            <div className="w-48 h-48 bg-slate-200 animate-pulse rounded-xl flex items-center justify-center text-slate-500 text-xs">
              جاري إنشاء QR...
            </div>
          ) : (
            <QrCodeGenerator value={qrUrl} size={200} />
          )}
        </div>

        {/* URL Box */}
        <div className="space-y-1.5">
          <label className="text-slate-400 text-[11px] font-bold block">رابط الوصول السريع للقضية:</label>
          <div className="flex items-center gap-2 bg-[#1C2229] p-2 rounded-xl border border-[#3A434C]">
            <input
              type="text"
              readOnly
              value={qrUrl}
              className="w-full bg-transparent text-blue-300 text-xs font-mono border-none focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="p-2 bg-[#2A323A] hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
              title="نسخ الرابط"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Actions Toolbar */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#3A434C]">
          <button
            onClick={() => window.print()}
            className="py-2 px-3 bg-[#1C2229] hover:bg-[#323a42] text-slate-200 border border-[#3A434C] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>طباعة</span>
          </button>

          <button
            onClick={generateIncidentQr}
            className="py-2 px-3 bg-[#1C2229] hover:bg-[#323a42] text-slate-200 border border-[#3A434C] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            <span>تحديث QR</span>
          </button>

          <button
            onClick={onClose}
            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
