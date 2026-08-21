import React, { useState, useEffect } from 'react';
import { Accident, FieldAgent } from '../types';
import { X, Radio, User, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

interface DispatchModalProps {
  accident: Accident;
  agents: FieldAgent[];
  onClose: () => void;
  onSubmit: (accidentId: string, agentId: string, notes: string) => void;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  accident,
  agents = [],
  onClose,
  onSubmit,
}) => {
  const [availableAgents, setAvailableAgents] = useState<FieldAgent[]>(() => {
    return Array.isArray(agents) ? agents : [];
  });
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [notes, setNotes] = useState('يرجى التوجه الفوري لموقع الحادث وتوثيق كافة التفاصيل وإعداد تقرير المرور المبدئي.');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFreshAgents = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/agents');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setAvailableAgents(data);
            // DO NOT automatically select the first agent
          }
        }
      } catch (err) {
        console.warn("Could not fetch fresh agents:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFreshAgents();
  }, []);

  const displayList = availableAgents;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentId) return;
    onSubmit(accident.id, selectedAgentId, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#1C2229]/80 backdrop-blur-sm animate-fadeIn" dir="rtl">
      <div className="bg-[#2A323A] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[#3A434C] flex flex-col text-[#F1F5F9]">
        <div className="p-6 border-b border-[#3A434C] flex items-center justify-between bg-[#161B1F]">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#315EF5]/20 text-[#315EF5] rounded-xl border border-[#315EF5]/30">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F1F5F9]">توجيه وكيل ميداني</h2>
              <p className="text-xs text-[#AAB2BA]">الحادث: {accident.accidentNumber || accident.incidentNumber} - {accident.locationName || 'غير محدد'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#AAB2BA] hover:text-white rounded-xl hover:bg-[#323A40] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#AAB2BA]">اختر الوكيل الميداني المتاح ({displayList.length} محقق مسجل)</label>
            
            {displayList.length === 0 ? (
              <div className="p-5 border border-dashed border-[#D6A83A]/40 bg-[#D6A83A]/10 rounded-xl text-center">
                <AlertCircle className="w-8 h-8 text-[#D6A83A] mx-auto mb-2" />
                <h4 className="text-xs font-bold text-[#D6A83A] mb-1">لا يوجد محققون مسجلون في قاعدة البيانات حالياً</h4>
                <p className="text-[11px] text-[#AAB2BA] leading-relaxed">
                  قاعدة البيانات فارغة (0 مدخلات). يمكنك إضافة محقق جديد عبر شاشة "إدارة المحققين" لتتمكن من إسناد المهام إليه.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {displayList.map(agent => {
                  const isSelected = selectedAgentId === agent.id;
                  return (
                    <label
                      key={agent.id}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#315EF5] bg-[#315EF5]/15 shadow-sm ring-1 ring-[#315EF5]'
                          : 'border-[#3A434C] hover:border-[#315EF5]/60 bg-[#1C2229]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="agentRadio"
                          value={agent.id}
                          checked={isSelected}
                          onChange={() => setSelectedAgentId(agent.id)}
                          className="w-4 h-4 text-[#315EF5] focus:ring-[#315EF5]"
                        />
                        <div>
                          <div className="font-semibold text-[#F1F5F9] text-xs flex items-center gap-1.5">
                            <span>{agent.name}</span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#315EF5] inline" />}
                          </div>
                          <div className="text-[11px] text-[#AAB2BA] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#D64545]" />
                            <span>{agent.currentLocation || 'المقر'}</span>
                            {agent.phone && <span className="mr-2 text-[#7C8791] font-mono text-[10px]">{agent.phone}</span>}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        agent.status === 'متاح' ? 'bg-[#22A06B]/20 text-[#22A06B] border-[#22A06B]/40' : 'bg-[#315EF5]/20 text-[#315EF5] border-[#315EF5]/40'
                      }`}>
                        {agent.status || 'متاح'}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#AAB2BA]">تعليمات التوجيه والملاحظات للوكيل</label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#3A434C] bg-[#1C2229] text-[#F1F5F9] placeholder-[#7C8791] text-xs focus:ring-2 focus:ring-[#315EF5] focus:outline-none resize-none"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-[#3A434C] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-[#323A40] hover:bg-[#3A434C] text-[#F1F5F9] rounded-xl text-xs font-semibold transition-colors border border-[#3A434C]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={displayList.length === 0 || !selectedAgentId}
              className={`px-6 py-2.5 rounded-xl text-xs font-semibold shadow-lg transition-all flex items-center gap-2 font-bold ${
                displayList.length === 0 || !selectedAgentId
                  ? 'bg-[#323A40] text-[#7C8791] border border-[#3A434C] cursor-not-allowed shadow-none'
                  : 'bg-[#315EF5] hover:bg-[#315EF5]/90 text-white shadow-blue-600/20'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>تأكيد إرسال التوجيه</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
