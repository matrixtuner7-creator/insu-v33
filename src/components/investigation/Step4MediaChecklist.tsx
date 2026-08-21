import React, { useState, useRef } from 'react';
import { Camera, CheckCircle2, Image as ImageIcon, Trash2, Plus, Upload, Eye, X, ShieldCheck, MapPin, Clock } from 'lucide-react';
import { CaseMediaItem } from '../../types';

interface Step4MediaChecklistProps {
  mediaItems: CaseMediaItem[];
  onChange: (updatedMedia: CaseMediaItem[]) => void;
  caseId: string;
  assignmentId: string;
  investigatorId: string;
  currentLat?: number;
  currentLng?: number;
}

export const PHOTO_CHECKLIST_TEMPLATE = [
  { key: 'scene_general', label: 'صورة عامة للموقع', required: false, desc: 'منظر شامل للحادث ومسار الشارع' },
  { key: 'vehicle_1', label: 'المركبة الأولى (المؤمن له)', required: false, desc: 'زاوية واضحة للمركبة كاملة' },
  { key: 'vehicle_2', label: 'المركبة الثانية (الطرف الآخر)', required: false, desc: 'صورة شاملة للمركبة الثانية' },
  { key: 'impact_point', label: 'نقطة الاصطدام المباشرة', required: false, desc: 'مكان التقاء وتلامس المركبتين' },
  { key: 'damages_close', label: 'تفاصيل الأضرار المقربة', required: false, desc: 'صور دقيقة للكسور والانبعاجات' },
  { key: 'plates_both', label: 'لوحات أرقام المركبات', required: false, desc: 'قراءة واضحة لأرقام اللوحات' },
  { key: 'driver_licenses', label: 'رخص القيادة للأطراف', required: false, desc: 'رخصة السائق الأول والثاني' },
  { key: 'vehicle_licenses', label: 'رخص سير المركبات (استمارة)', required: false, desc: 'وثائق ملكية وترخيص المركبات' },
  { key: 'insurance_docs', label: 'وثائق وكوبونات التأمين', required: false, desc: 'شهادة التأمين السارية' },
  { key: 'additional_evidence', label: 'صور إضافية / معالم الطريق', required: false, desc: 'آثار فرامل، إشارات مرور، عوائق' },
];

export const Step4MediaChecklist: React.FC<Step4MediaChecklistProps> = ({
  mediaItems,
  onChange,
  caseId,
  assignmentId,
  investigatorId,
  currentLat = 32.2211,
  currentLng = 35.2544
}) => {
  const [activeCameraCategory, setActiveCameraCategory] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<CaseMediaItem | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadCategory, setUploadCategory] = useState<string>('');

  // Start 1:1 Live Camera Stream
  const openLiveCamera = async (categoryKey: string) => {
    setActiveCameraCategory(categoryKey);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', aspectRatio: 1 },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Could not open direct camera stream, falling back to standard file picker:", err);
      setIsCameraActive(false);
      triggerFilePicker(categoryKey);
    }
  };

  const closeLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setActiveCameraCategory(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !activeCameraCategory) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth, video.videoHeight) || 640;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Center crop to 1:1 square
    const startX = (video.videoWidth - size) / 2;
    const startY = (video.videoHeight - size) / 2;
    ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    savePhotoItem(activeCameraCategory, dataUrl);
    closeLiveCamera();
  };

  const triggerFilePicker = (categoryKey: string) => {
    setUploadCategory(categoryKey);
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadCategory) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      savePhotoItem(uploadCategory, dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const savePhotoItem = (categoryKey: string, photoUrl: string) => {
    const tmpl = PHOTO_CHECKLIST_TEMPLATE.find(t => t.key === categoryKey);
    const now = new Date().toISOString();

    const newItem: CaseMediaItem = {
      id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      categoryKey,
      categoryLabel: tmpl ? tmpl.label : 'صورة إضافية',
      mediaType: 'image',
      photoUrl,
      timestamp: now,
      lat: currentLat,
      lng: currentLng,
      caseId,
      assignmentId,
      investigatorId
    };

    // Replace if exists for single-category or append
    const existingIndex = mediaItems.findIndex(m => m.categoryKey === categoryKey && categoryKey !== 'additional_evidence');
    if (existingIndex >= 0) {
      const updated = [...mediaItems];
      updated[existingIndex] = newItem;
      onChange(updated);
    } else {
      onChange([...mediaItems, newItem]);
    }
  };

  const removePhoto = (id: string) => {
    onChange(mediaItems.filter(m => m.id !== id));
  };

  const capturedCount = mediaItems.filter(m => !!m.photoUrl).length;

  return (
    <div className="space-y-4 text-right animate-fade-in" dir="rtl">
      {/* Hidden File Input for fallback */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Step Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-600 font-black text-sm">
            <Camera className="w-4 h-4" />
            <span>الخطوة 4: التوثيق المصور وقائمة المعاينة (Photo Checklist)</span>
          </div>
          <div className="flex items-center gap-2">
            {capturedCount >= 2 ? (
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>جاهز للمتابعة ({capturedCount} صور)</span>
              </span>
            ) : (
              <span className="text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                مطلوب صورتان كحد أدنى ({capturedCount} / 2)
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-500">
          التقاط صور بدقة 1:1 مع بصمة جغرافية وزمنية. <strong className="text-slate-700 font-bold">الحد الأدنى للاستمرار في الخطوات هو صورتان</strong>، مع إمكانية توثيق باقي البنود في أي وقت.
        </p>
      </div>

      {/* Checklist Items Grid */}
      <div className="space-y-3">
        {PHOTO_CHECKLIST_TEMPLATE.map((item, idx) => {
          const photo = mediaItems.find(m => m.categoryKey === item.key);
          const isCaptured = !!photo?.photoUrl;

          return (
            <div
              key={item.key}
              className={`bg-white rounded-2xl border p-3.5 shadow-sm transition-all flex items-center justify-between gap-3 ${
                isCaptured ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200'
              }`}
            >
              {/* Left Info */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-black ${
                  isCaptured ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {isCaptured ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-black text-slate-900 truncate">{item.label}</h4>
                    {item.required && (
                      <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold">إلزامي</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{item.desc}</p>
                  
                  {isCaptured && photo && (
                    <div className="flex items-center gap-3 text-[9px] text-slate-400 font-mono pt-1">
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5 text-slate-400" />
                        {new Date(photo.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5 text-slate-400" />
                        GPS مثبت
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Action (Thumbnail / Capture Button) */}
              <div className="shrink-0 flex items-center gap-1.5">
                {isCaptured && photo ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewPhoto(photo)}
                      className="w-12 h-12 rounded-xl overflow-hidden border border-emerald-300 relative shadow-sm group cursor-pointer"
                    >
                      <img src={photo.photoUrl} alt={item.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف الصورة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openLiveCamera(item.key)}
                      className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-rose-600/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>التقاط</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerFilePicker(item.key)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                      title="رفع من المعرض"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 1:1 Live Camera Full Modal */}
      {isCameraActive && (
        <div className="fixed inset-0 z-[99999] bg-black/95 flex flex-col items-center justify-between p-4 select-none">
          <div className="w-full flex items-center justify-between text-white pt-2">
            <div className="text-xs font-black text-rose-400 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span>كاميرا التوثيق الميداني (نسبة 1:1)</span>
            </div>
            <button
              type="button"
              onClick={closeLiveCamera}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 1:1 Square Viewport Frame */}
          <div className="relative w-full max-w-[360px] aspect-square bg-slate-900 rounded-3xl overflow-hidden border-2 border-rose-500 shadow-2xl flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Viewfinder Target Grid */}
            <div className="absolute inset-4 border border-white/30 rounded-2xl pointer-events-none flex items-center justify-center">
              <div className="w-6 h-6 border-t-2 border-l-2 border-rose-500 absolute top-0 left-0"></div>
              <div className="w-6 h-6 border-t-2 border-r-2 border-rose-500 absolute top-0 right-0"></div>
              <div className="w-6 h-6 border-b-2 border-l-2 border-rose-500 absolute bottom-0 left-0"></div>
              <div className="w-6 h-6 border-b-2 border-r-2 border-rose-500 absolute bottom-0 right-0"></div>
            </div>
          </div>

          {/* Capture Trigger Button */}
          <div className="w-full flex flex-col items-center gap-3 pb-6">
            <button
              type="button"
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full bg-white border-4 border-rose-500 flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.6)] active:scale-90 transition-transform cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-rose-600"></div>
            </button>
            <span className="text-xs text-white/80 font-bold">اضغط لالتقاط وتثبيت الصورة</span>
          </div>
        </div>
      )}

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 z-[99999] bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl space-y-3 p-3">
            <div className="flex items-center justify-between text-white px-2">
              <span className="text-xs font-bold text-rose-400">{previewPhoto.categoryLabel}</span>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="p-1 hover:bg-white/10 rounded-full"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="w-full aspect-square rounded-2xl overflow-hidden bg-black">
              <img src={previewPhoto.photoUrl} alt={previewPhoto.categoryLabel} className="w-full h-full object-contain" />
            </div>

            <div className="p-2 bg-slate-800 rounded-xl text-[10px] text-slate-300 font-mono flex items-center justify-between">
              <span>GPS: {previewPhoto.lat}, {previewPhoto.lng}</span>
              <span>{new Date(previewPhoto.timestamp).toLocaleTimeString('ar-EG')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
