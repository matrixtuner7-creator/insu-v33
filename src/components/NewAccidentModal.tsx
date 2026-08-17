import React, { useState } from 'react';
import { Vehicle, Driver } from '../types';
import { X, ShieldAlert, Car, User, MapPin, Sparkles } from 'lucide-react';

interface NewAccidentModalProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  onClose: () => void;
  onSubmit: (data: {
    locationName: string;
    severity: 'خفيف' | 'متوسط' | 'بليغ' | 'حرج';
    vehiclePlate: string;
    driverName: string;
    driverId: string;
    description: string;
  }) => void;
}

export const NewAccidentModal: React.FC<NewAccidentModalProps> = ({
  vehicles,
  drivers,
  onClose,
  onSubmit,
}) => {
  const [locationName, setLocationName] = useState('');
  const [severity, setSeverity] = useState<'خفيف' | 'متوسط' | 'بليغ' | 'حرج'>('متوسط');
  const [vehiclePlate, setVehiclePlate] = useState(vehicles[0]?.plateNumber || '');
  const [driverName, setDriverName] = useState(drivers[0]?.fullName || '');
  const [driverId, setDriverId] = useState(drivers[0]?.nationalId || '');
  const [description, setDescription] = useState('');

  const handleVehicleChange = (plate: string) => {
    setVehiclePlate(plate);
    const found = vehicles.find(v => v.plateNumber === plate);
    if (found) {
      // Auto-assign owner/driver if matching
    }
  };

  const handleDriverChange = (name: string) => {
    setDriverName(name);
    const found = drivers.find(d => d.fullName === name);
    if (found) {
      setDriverId(found.nationalId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName || !description) return;
    onSubmit({
      locationName,
      severity,
      vehiclePlate,
      driverName,
      driverId,
      description,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-100 flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">تسجيل بلاغ حادث جديد</h2>
              <p className="text-xs text-slate-500">إدخال بيانات الحادث وتوجيه الفرق الميدانية فوراً</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-500" />
                <span>موقع الحادث / الشارع</span>
              </label>
              <input
                type="text"
                required
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                placeholder="مثال: طريق الملك فهد - مخرج 4"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">مستوى الخطورة</label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="خفيف">خفيف (أضرار سطحية بسيطة)</option>
                <option value="متوسط">متوسط (أضرار متوسطة بالهيكل)</option>
                <option value="بليغ">بليغ (أضرار جسيمة بالمركبة)</option>
                <option value="حرج">حرج (يتطلب إسعاف وطوارئ)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-blue-600" />
                <span>رقم لوحة المركبة</span>
              </label>
              <select
                value={vehiclePlate}
                onChange={e => handleVehicleChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-mono"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.plateNumber}>
                    {v.plateNumber} - {v.make} {v.model}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                <span>سائق المركبة</span>
              </label>
              <select
                value={driverName}
                onChange={e => handleDriverChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                {drivers.map(d => (
                  <option key={d.id} value={d.fullName}>
                    {d.fullName} (هوية: {d.nationalId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">وصف ملابسات الحادث</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="اكتب تفاصيل الحادث والظروف المحيطة وتلفيات المركبة..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-red-600/20 transition-all flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>إرسال البلاغ لغرفة العمليات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
