import React from 'react';
import { Wrench, Car, Plus, Trash2, AlertTriangle, CheckSquare, Sparkles, Image as ImageIcon } from 'lucide-react';
import { DamageAssessmentItem, CaseParty, CaseMediaItem } from '../../types';

interface Step7DamageAssessmentProps {
  damageItems: DamageAssessmentItem[];
  onChange: (updatedDamage: DamageAssessmentItem[]) => void;
  parties: CaseParty[];
  mediaItems: CaseMediaItem[];
}

const VEHICLE_PARTS = [
  'الصدام الأمامي (طامبون أمامي)',
  'الصدام الخلفي (طامبون خلفي)',
  'الرفرف الأمامي الأيمن',
  'الرفرف الأمامي الأيسر',
  'الرفرف الخلفي الأيمن',
  'الرفرف الخلفي الأيسر',
  'الباب الأمامي الأيمن',
  'الباب الأمامي الأيسر',
  'الباب الخلفي الأيمن',
  'الباب الخلفي الأيسر',
  'غطاء المحرك (الكبوت)',
  'غطاء الصندوق الخلفي (الشنطة)',
  'الزجاج الأمامي',
  'الزجاج الخلفي',
  'المصابيح الأمامية (الإنارة)',
  'المصابيح الخلفية',
  'المرآة الجانبية',
  'العجلات والإطارات ونظام التعليق',
  'الهيكل الأساسي (الشاسيه)',
  'الرديتر ومجموعة التبريد',
  'أخرى'
];

const DAMAGE_TYPES = [
  'انبعاج وتشوه صاج',
  'كسر / شق كامل',
  'خدوش واحتكاك دهان',
  'تمزق / انفصال جزئي',
  'تلف ميكانيكي / هيدروليكي',
  'كسر زجاجي وتناثر',
  'تلف شامل وتشوّه هيكلي'
];

export const Step7DamageAssessment: React.FC<Step7DamageAssessmentProps> = ({
  damageItems,
  onChange,
  parties,
  mediaItems
}) => {
  const handleAddDamage = () => {
    const defaultPlate = parties[0]?.vehiclePlate || 'مركبة المؤمن له';
    const newItem: DamageAssessmentItem = {
      id: `dmg_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      vehiclePlate: defaultPlate,
      partName: VEHICLE_PARTS[0],
      damageType: DAMAGE_TYPES[0],
      severity: 'moderate',
      description: '',
      photoUrls: [],
      notes: ''
    };
    onChange([...damageItems, newItem]);
  };

  const handleUpdate = (id: string, field: keyof DamageAssessmentItem, value: any) => {
    onChange(damageItems.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const handleRemove = (id: string) => {
    onChange(damageItems.filter(d => d.id !== id));
  };

  return (
    <div className="space-y-4 text-right animate-fade-in" dir="rtl">
      {/* Step Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-600 font-black text-sm">
            <Wrench className="w-4 h-4" />
            <span>الخطوة 7: تقدير ومعاينة الأضرار وتوصيف القطع</span>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            {damageItems.length} أجزاء مسجلة
          </span>
        </div>
        <p className="text-xs text-slate-500">
          تحديد القطع المتضررة بدقة، نوع الضرر، ومستوى الشدة الفنية للتعويض والمعالجة.
        </p>
      </div>

      {/* Damage Items List */}
      {damageItems.length === 0 ? (
        <div className="p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Wrench className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-slate-800">لم يتم تسجيل أي قطع متضررة بعد</h4>
            <p className="text-xs text-slate-500">
              اضغط على الزر أدناه لإضافة تفاصيل الأضرار لكل جزء في المركبات المشتركة.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddDamage}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة أول قطعة متضررة</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {damageItems.map((item, idx) => {
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3.5 relative"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{item.partName}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        اللوحة: {item.vehiclePlate || 'غير محددة'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Vehicle Selection & Part Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      المركبة التابع لها الضرر:
                    </label>
                    <select
                      value={item.vehiclePlate}
                      onChange={(e) => handleUpdate(item.id, 'vehiclePlate', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-amber-600"
                    >
                      {parties.map((p, pIdx) => (
                        <option key={p.id} value={p.vehiclePlate || `مركبة طرف ${pIdx + 1}`}>
                          {p.roleLabel} - {p.vehiclePlate || p.name || 'بدون لوحة'} ({p.vehicleModel || 'طراز غير محدد'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      القطعة المتضررة في المركبة:
                    </label>
                    <select
                      value={item.partName}
                      onChange={(e) => handleUpdate(item.id, 'partName', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-amber-600"
                    >
                      {VEHICLE_PARTS.map((part) => (
                        <option key={part} value={part}>{part}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Damage Type & Severity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      نوع وطبيعة الضرر:
                    </label>
                    <select
                      value={item.damageType}
                      onChange={(e) => handleUpdate(item.id, 'damageType', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                    >
                      {DAMAGE_TYPES.map((dt) => (
                        <option key={dt} value={dt}>{dt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      شدة الضرر:
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdate(item.id, 'severity', 'minor')}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          item.severity === 'minor'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        بسيط (Minor)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdate(item.id, 'severity', 'moderate')}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          item.severity === 'moderate'
                            ? 'bg-amber-50 border-amber-500 text-amber-800'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        متوسط (Mod)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdate(item.id, 'severity', 'severe')}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          item.severity === 'severe'
                            ? 'bg-red-50 border-red-500 text-red-800'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        جسيم (Severe)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    التوصيف الفني لآلية الضرر:
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleUpdate(item.id, 'description', e.target.value)}
                    placeholder="مثال: انبعاج عميق في الصدام مع انكسار الكشاف الأيمن واحتكاك الصاج الداخلي"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add More Damage Item Button */}
      {damageItems.length > 0 && (
        <button
          type="button"
          onClick={handleAddDamage}
          className="w-full py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 border-2 border-dashed border-amber-300 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة قطعة / جزء متضرر آخر</span>
        </button>
      )}
    </div>
  );
};
