import React, { useState } from 'react';
import { Accident, FieldAgent } from '../types';
import { X, Radio, User, MapPin } from 'lucide-react';

interface DispatchModalProps {
  accident: Accident;
  agents: FieldAgent[];
  onClose: () => void;
  onSubmit: (accidentId: string, agentId: string, notes: string) => void;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  accident,
  agents,
  onClose,
  onSubmit,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState(agents[0]?.id || '');
  const [notes, setNotes] = useState('يرجى التوجه الفوري لموقع الحادث وتوثيق كافة التفاصيل وإعداد تقرير المرور المبدئي.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentId) return;
    onSubmit(accident.id, selectedAgentId, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-100 flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">توجيه وكيل ميداني</h2>
              <p className="text-xs text-slate-500">الحادث: {accident.accidentNumber} - {accident.locationName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">اختر الوكيل الميداني المتاح</label>
            <div className="space-y-2">
              {agents.map(agent => (
                <label
                  key={agent.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedAgentId === agent.id
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="agentRadio"
                      value={agent.id}
                      checked={selectedAgentId === agent.id}
                      onChange={() => setSelectedAgentId(agent.id)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">{agent.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-red-400" />
                        <span>{agent.currentLocation}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    agent.status === 'متاح' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {agent.status}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">تعليمات التوجيه والملاحظات للوكيل</label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
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
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
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
