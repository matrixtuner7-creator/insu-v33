import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle2, AlertTriangle, ShieldCheck, Clock, Navigation, Radio } from 'lucide-react';
import { ArrivalData } from '../../types';

interface Step1ArrivalProps {
  arrivalData: ArrivalData;
  onChange: (updated: ArrivalData) => void;
  caseLocation?: string;
  caseLat?: number;
  caseLng?: number;
}

export const Step1Arrival: React.FC<Step1ArrivalProps> = ({
  arrivalData,
  onChange,
  caseLocation = 'شارع فيصل، نابلس',
  caseLat = 32.2211,
  caseLng = 35.2544
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState('');

  // Auto detect GPS on initial mount if not confirmed
  useEffect(() => {
    if (!arrivalData.confirmed && !arrivalData.lat) {
      handleGetGPS();
    }
  }, []);

  const handleGetGPS = () => {
    setIsLocating(true);
    setGpsError('');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          onChange({
            ...arrivalData,
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6)),
            accuracy: Math.round(pos.coords.accuracy || 10),
            arrivalTime: arrivalData.arrivalTime || new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            locationAddress: arrivalData.locationAddress || caseLocation
          });
        },
        (err) => {
          setIsLocating(false);
          setGpsError('تعذر تحديد الموقع الفعلي بدقة، تم استخدام إحداثيات موقع الحادث التقديرية.');
          // Fallback to case coords
          onChange({
            ...arrivalData,
            lat: caseLat,
            lng: caseLng,
            accuracy: 15,
            arrivalTime: arrivalData.arrivalTime || new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            locationAddress: caseLocation
          });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsLocating(false);
      onChange({
        ...arrivalData,
        lat: caseLat,
        lng: caseLng,
        arrivalTime: arrivalData.arrivalTime || new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        locationAddress: caseLocation
      });
    }
  };

  const handleConfirmArrival = () => {
    const nowTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    onChange({
      ...arrivalData,
      confirmed: true,
      arrivalTime: arrivalData.arrivalTime || nowTime,
      lat: arrivalData.lat || caseLat,
      lng: arrivalData.lng || caseLng,
      siteStatus: arrivalData.siteStatus || 'safe'
    });
  };

  return (
    <div className="space-y-4 text-right animate-fade-in" dir="rtl">
      {/* Title & Introduction */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
        <div className="flex items-center gap-2 text-emerald-600 font-black text-sm">
          <MapPin className="w-4 h-4" />
          <span>الخطوة 1: إثبات وتوثيق الوصول للموقع الميداني</span>
        </div>
        <p className="text-xs text-slate-500">
          تسجيل البصمة الجغرافية والزمنية للوصول وتحديد الجاهزية الميدانية للتحقيق.
        </p>
      </div>

      {/* GPS & Timestamp Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>وقت وتاريخ الوصول الميداني:</span>
          </div>
          <div className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
            {arrivalData.arrivalTime || 'جاري التسجيل...'}
          </div>
        </div>

        {/* GPS Coordinates Box */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">إحداثيات الموقع (GPS):</span>
            <button
              type="button"
              onClick={handleGetGPS}
              disabled={isLocating}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'جاري التحديث...' : 'تحديث الموقع'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-sans">خط العرض (Latitude)</span>
              <strong className="text-slate-800">{arrivalData.lat || caseLat}</strong>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-sans">خط الطول (Longitude)</span>
              <strong className="text-slate-800">{arrivalData.lng || caseLng}</strong>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 flex items-center gap-1.5 pt-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-medium truncate">{arrivalData.locationAddress || caseLocation}</span>
          </div>

          {gpsError && (
            <p className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium">
              {gpsError}
            </p>
          )}
        </div>
      </div>

      {/* Site Status Selection: Safe vs Needs Backup */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <label className="text-xs font-bold text-slate-800 block">
          حالة البيئة وموقع الحادث:
        </label>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onChange({ ...arrivalData, siteStatus: 'safe' })}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold ${
              arrivalData.siteStatus === 'safe'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm ring-2 ring-emerald-400/20'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className={`w-5 h-5 ${arrivalData.siteStatus === 'safe' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>الموقع آمن وطبيعي</span>
            <span className="text-[9px] font-normal text-slate-500">جاهز لبدء المعاينة</span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ ...arrivalData, siteStatus: 'needs_backup' })}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold ${
              arrivalData.siteStatus === 'needs_backup'
                ? 'bg-red-50 border-red-500 text-red-800 shadow-sm ring-2 ring-red-400/20'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className={`w-5 h-5 ${arrivalData.siteStatus === 'needs_backup' ? 'text-red-600' : 'text-slate-400'}`} />
            <span>يحتاج مساندة / طوارئ</span>
            <span className="text-[9px] font-normal text-slate-500">ازدحام أو نزاع أو خطورة</span>
          </button>
        </div>

        {arrivalData.siteStatus === 'needs_backup' && (
          <div className="space-y-1.5 pt-1 animate-fade-in">
            <label className="text-[11px] font-bold text-red-700 block">
              سبب طلب المساندة أو الملاحظات الطارئة:
            </label>
            <input
              type="text"
              value={arrivalData.backupReason || ''}
              onChange={(e) => onChange({ ...arrivalData, backupReason: e.target.value })}
              placeholder="مثال: تجمع كبير للمواطنين، نزاع بين الأطراف، إغلاق مروري كامل..."
              className="w-full bg-red-50/50 border border-red-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-500"
            />
          </div>
        )}
      </div>

      {/* Confirmation Action */}
      <div className="pt-2">
        {!arrivalData.confirmed ? (
          <button
            type="button"
            onClick={handleConfirmArrival}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>تأكيد الوصول للموقع</span>
          </button>
        ) : (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-emerald-800 text-xs font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>تم تأكيد الوصول للموقع بنجاح في {arrivalData.arrivalTime}</span>
            </div>
            <button
              type="button"
              onClick={() => onChange({ ...arrivalData, confirmed: false })}
              className="text-[10px] text-emerald-700 underline font-medium hover:text-emerald-900"
            >
              تعديل
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
