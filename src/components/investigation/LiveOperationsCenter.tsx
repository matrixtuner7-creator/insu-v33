import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Eye, 
  Radio, 
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  MessageSquare,
  RotateCcw,
  History,
  FolderOpen
} from 'lucide-react';
import { Accident, InvestigationSession } from '../../types';

interface LiveOperationsCenterProps {
  accidents: Accident[];
  selectedCaseId?: string | null;
  onSelectAccident: (accident: Accident) => void;
  onSelectCase?: (caseId: string) => void;
  onOpenChat?: (accident: Accident) => void;
  onOpenRadio?: (accident: Accident) => void;
  onFocusMap?: (accident: Accident) => void;
}

const PAGE_SIZE = 6;

export const LiveOperationsCenter: React.FC<LiveOperationsCenterProps> = ({
  accidents,
  selectedCaseId,
  onSelectAccident,
  onSelectCase,
  onOpenChat,
  onOpenRadio,
  onFocusMap
}) => {
  const [activeSessions, setActiveSessions] = useState<InvestigationSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastFetchTime, setLastFetchTime] = useState<Date>(new Date());
  const [openMenuCaseId, setOpenMenuCaseId] = useState<string | null>(null);

  const fetchActiveSessions = async () => {
    try {
      const res = await fetch('/api/investigation/active-sessions');
      if (res.ok) {
        const data = await res.json();
        console.log('DEBUG_GHOST_CARDS: API Response=', data);
        console.log('DEBUG_GHOST_CARDS: Current activeSessions state before update=', activeSessions);
        setActiveSessions(data || []);
        setLastFetchTime(new Date());
      }
    } catch (err) {
      console.warn("Could not fetch active live sessions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('DEBUG_GHOST_CARDS: accidents.length=', accidents.length, 'activeSessions.length=', activeSessions.length);
    fetchActiveSessions();
    const interval = setInterval(fetchActiveSessions, 4000); // Poll every 4 seconds
    return () => clearInterval(interval);
  }, [accidents, activeSessions]);

  // Filter out closed or archived cases so they automatically transfer to the Archive section
  const isCaseClosed = (status?: string) => {
    if (!status) return false;
    const s = status.toUpperCase();
    return s === 'CLOSED' || s === 'APPROVED' || status === 'مغلق' || status === 'مكتمل' || status === 'مغلقة';
  };

  // Map active sessions only if they can be matched to a valid accident
  const allActiveCasesList = activeSessions
    .filter(s => {
      const matchedAccident = accidents.find(
        a => a.id === s.caseId || a.accidentNumber === s.caseId || a.incidentNumber === s.caseId
      );
      if (!matchedAccident) return false;
      if (isCaseClosed(s.status)) return false;
      if (matchedAccident && isCaseClosed(matchedAccident.status)) return false;
      
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        s.caseId.toLowerCase().includes(query) ||
        s.investigatorName.toLowerCase().includes(query) ||
        (s.arrivalData?.locationAddress || '').toLowerCase().includes(query)
      );
    });

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(allActiveCasesList.length / PAGE_SIZE));
  const validCurrentPage = currentPage > totalPages ? 1 : currentPage;
  const paginatedActiveCases = allActiveCasesList.slice(
    (validCurrentPage - 1) * PAGE_SIZE,
    validCurrentPage * PAGE_SIZE
  );

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  return (
    <div className="bg-[#17212B] rounded-3xl p-5 border border-[#34414E] shadow-xl space-y-4 text-right" dir="rtl">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#34414E] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#2F66F6]/15 border border-[#2F66F6]/30 text-[#3B82F6] flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm text-[#F4F7FA]">المتابعة الحية لغرفة العمليات الميدانية</h3>
              <span className="w-2 h-2 rounded-full bg-[#18B77A] animate-ping" />
            </div>
            <p className="text-[11px] text-[#A9B5C2]">
              رصد حي لحظي للفرق والمحققين بالميدان
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#738190] absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="بحث برقم القضية أو المحقق..."
            className="pr-8 pl-3 py-1.5 bg-[#1B2530] border border-[#34414E] text-[#F4F7FA] placeholder-[#738190] rounded-xl text-xs w-44 sm:w-56 focus:outline-none focus:border-[#3B82F6]"
          />
        </div>
      </div>

      {/* Streamlined Active Cases Grid */}
      {paginatedActiveCases.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
            {paginatedActiveCases.map((sessionItem) => {
              const matchedAccident = accidents.find(
                a => a.id === sessionItem.caseId || a.accidentNumber === sessionItem.caseId || a.incidentNumber === sessionItem.caseId
              ) || ({
                id: sessionItem.caseId,
                accidentNumber: sessionItem.caseId,
                incidentNumber: sessionItem.caseId,
                locationName: sessionItem.arrivalData?.locationAddress || 'نابلس - شارع رفيديا',
                severity: 'متوسط',
                status: 'في الموقع',
                assignedAgentId: sessionItem.investigatorId,
                assignedAgentName: sessionItem.investigatorName
              } as unknown as Accident);

              const isSelected = selectedCaseId === matchedAccident.id || selectedCaseId === matchedAccident.accidentNumber || selectedCaseId === sessionItem.caseId;
              const isNeedsIntervention = matchedAccident.severity === 'حرج' || matchedAccident.severity === 'حرج جداً' || matchedAccident.status === 'تحتاج تدخل';
              const isDelay = matchedAccident.status === 'تأخير' || matchedAccident.status === 'تأخير SLA';
              
              const completedStepsCount = sessionItem.completedSteps?.length || 6;
              const progressPct = Math.round((completedStepsCount / 8) * 100);

              // Status badge colors strictly following palette
              let badgeBg = 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30';
              let badgeText = 'في الطريق';

              if (isNeedsIntervention) {
                badgeBg = 'bg-[#E5484D]/15 text-[#E5484D] border-[#E5484D]/30';
                badgeText = '🚨 تحتاج تدخل';
              } else if (isDelay) {
                badgeBg = 'bg-[#E6B84A]/15 text-[#E6B84A] border-[#E6B84A]/30';
                badgeText = '⚠️ تأخير SLA';
              } else if (matchedAccident.status === 'في الموقع' || matchedAccident.status === 'قيد المعاينة') {
                badgeBg = 'bg-[#18B77A]/15 text-[#18B77A] border-[#18B77A]/30';
                badgeText = '📍 في الموقع';
              }

              return (
                <div
                  key={sessionItem.caseId}
                  onClick={() => {
                    if (onSelectCase) onSelectCase(matchedAccident.id || matchedAccident.accidentNumber);
                    onSelectAccident(matchedAccident);
                  }}
                  className={`bg-[#1B2530] hover:bg-[#25313D] border rounded-2xl p-3.5 transition-all shadow-md cursor-pointer space-y-2.5 relative ${
                    isSelected 
                      ? 'border-[#3B82F6] ring-1 ring-[#3B82F6]/50 bg-[#25313D]' 
                      : 'border-[#34414E] hover:border-[#3B82F6]/60'
                  } ${isNeedsIntervention ? 'border-l-4 border-l-[#E5484D]' : ''}`}
                >
                  {/* Top Bar: Case Number, Status, Actions Menu */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-[#3B82F6]">
                        {sessionItem.caseId}
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${badgeBg}`}>
                        {badgeText}
                      </span>
                    </div>

                    {/* More Menu Dropdown button */}
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setOpenMenuCaseId(openMenuCaseId === sessionItem.caseId ? null : sessionItem.caseId)}
                        className="p-1 hover:bg-[#34414E] text-[#A9B5C2] hover:text-[#F4F7FA] rounded-lg transition-all cursor-pointer"
                        title="خيارات إضافية"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openMenuCaseId === sessionItem.caseId && (
                        <div className="absolute left-0 top-6 z-30 w-44 bg-[#1B2530] border border-[#34414E] rounded-xl shadow-2xl py-1 text-xs text-[#F4F7FA] space-y-0.5 animate-in fade-in duration-150">
                          <button
                            onClick={() => {
                              if (onFocusMap) onFocusMap(matchedAccident);
                              setOpenMenuCaseId(null);
                            }}
                            className="w-full text-right px-3 py-1.5 hover:bg-[#25313D] flex items-center gap-2 text-[#A9B5C2] hover:text-white cursor-pointer"
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#E6B84A]" />
                            <span>عرض الموقع بالخريطة</span>
                          </button>

                          <button
                            onClick={() => {
                              if (onOpenChat) onOpenChat(matchedAccident);
                              setOpenMenuCaseId(null);
                            }}
                            className="w-full text-right px-3 py-1.5 hover:bg-[#25313D] flex items-center gap-2 text-[#A9B5C2] hover:text-white cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-[#3B82F6]" />
                            <span>مراسلة المحقق</span>
                          </button>

                          <button
                            onClick={() => {
                              if (onOpenRadio) onOpenRadio(matchedAccident);
                              setOpenMenuCaseId(null);
                            }}
                            className="w-full text-right px-3 py-1.5 hover:bg-[#25313D] flex items-center gap-2 text-[#A9B5C2] hover:text-white cursor-pointer"
                          >
                            <Radio className="w-3.5 h-3.5 text-[#18B77A]" />
                            <span>اللاسلكي PTT</span>
                          </button>

                          <button
                            onClick={() => {
                              alert(`تم إرسال تنبيه استكمال فوري للمحقق الميداني لقضية ${sessionItem.caseId}`);
                              setOpenMenuCaseId(null);
                            }}
                            className="w-full text-right px-3 py-1.5 hover:bg-[#25313D] flex items-center gap-2 text-[#A9B5C2] hover:text-white cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-[#E6B84A]" />
                            <span>طلب استكمال البيانات</span>
                          </button>

                          <button
                            onClick={() => {
                              onSelectAccident(matchedAccident);
                              setOpenMenuCaseId(null);
                            }}
                            className="w-full text-right px-3 py-1.5 hover:bg-[#25313D] flex items-center gap-2 text-[#A9B5C2] hover:text-white cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-[#C96A45]" />
                            <span>إعادة تعيين المحقق</span>
                          </button>

                          <div className="border-t border-[#34414E] my-1" />

                          <button
                            onClick={() => {
                              onSelectAccident(matchedAccident);
                              setOpenMenuCaseId(null);
                            }}
                            className="w-full text-right px-3 py-1.5 hover:bg-[#25313D] flex items-center gap-2 text-[#3B82F6] font-bold cursor-pointer"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>فتح ملف القضية كاملة</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Investigator Name */}
                  <div className="flex items-center gap-2 text-xs">
                    <User className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
                    <span className="text-[#A9B5C2]">المحقق:</span>
                    <strong className="text-white font-bold truncate">{sessionItem.investigatorName || 'غير منسّب'}</strong>
                  </div>

                  {/* Concise Metrics Bar */}
                  <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center pt-1 border-t border-[#34414E]/60">
                    <div className="p-1 bg-[#25313D] rounded-lg border border-[#34414E]/50">
                      <span className="text-[#738190] block">التقدم</span>
                      <strong className="text-[#3B82F6] font-mono font-black">{completedStepsCount} / 8</strong>
                    </div>

                    <div className="p-1 bg-[#25313D] rounded-lg border border-[#34414E]/50">
                      <span className="text-[#738190] block">مدة المهمة</span>
                      <strong className="text-[#E6B84A] font-mono font-bold">00:46</strong>
                    </div>

                    <div className="p-1 bg-[#25313D] rounded-lg border border-[#34414E]/50">
                      <span className="text-[#738190] block">آخر مزامنة</span>
                      <strong className="text-[#18B77A] font-mono text-[9px] block truncate">منذ 15ث</strong>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#25313D] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#2F66F6] h-full rounded-full transition-all duration-300" 
                      style={{ width: `${progressPct}%` }} 
                    />
                  </div>

                  {/* Primary Action Button */}
                  <div className="pt-1 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAccident(matchedAccident);
                      }}
                      className="w-full py-1.5 px-3 bg-[#2F66F6] hover:bg-[#3B82F6] text-white text-xs font-bold rounded-xl transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>فتح التحقيق</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-[#34414E] text-xs">
              <span className="text-[#A9B5C2] text-[11px]">
                عرض <span className="text-white font-mono">{paginatedActiveCases.length}</span> من <span className="text-[#3B82F6] font-mono">{allActiveCasesList.length}</span> قضية
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={validCurrentPage === 1}
                  className="px-2.5 py-1 bg-[#1B2530] hover:bg-[#25313D] text-[#F4F7FA] disabled:text-[#738190] border border-[#34414E] rounded-lg text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <span className="px-2 text-xs font-mono text-[#F4F7FA]">
                  {validCurrentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={validCurrentPage === totalPages}
                  className="px-2.5 py-1 bg-[#1B2530] hover:bg-[#25313D] text-[#F4F7FA] disabled:text-[#738190] border border-[#34414E] rounded-lg text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-8 text-center text-[#738190] space-y-2">
          <Activity className="w-7 h-7 text-[#738190] mx-auto animate-bounce" />
          <p className="text-xs font-bold text-[#A9B5C2]">لا توجد قضايا نشطة قيد التحقيق الميداني حالياً</p>
        </div>
      )}
    </div>
  );
};
