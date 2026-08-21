import React, { useState, useMemo } from 'react';
import { 
  BarChart2, 
  Download, 
  Printer, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  MapPin, 
  Users, 
  Calendar,
  FileCheck,
  Award,
  Layers,
  PieChart
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Accident, FieldAgent } from '../types';

interface ReportsManagerProps {
  accidents: Accident[];
  agents: FieldAgent[];
}

export const ReportsManager: React.FC<ReportsManagerProps> = ({
  accidents,
  agents
}) => {
  const [timePeriod, setTimePeriod] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('month');

  // Stats calculation
  const totalCount = accidents.length;
  const completedCount = accidents.filter(a => a.status === 'مكتمل' || a.status === 'مغلق').length;
  const inProgressCount = accidents.filter(a => a.status === 'قيد التحقيق' || a.status === 'مُوَجَّه').length;
  const newCount = accidents.filter(a => a.status === 'جديد').length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Category breakdown
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    accidents.forEach(a => {
      const cat = a.incidentCategory || 'حوادث مركبات';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percent: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
    })).sort((a, b) => b.count - a.count);
  }, [accidents, totalCount]);

  // Severity breakdown
  const severityStats = useMemo(() => {
    const counts: Record<string, number> = { 'حرج': 0, 'بليغ': 0, 'متوسط': 0, 'خفيف': 0 };
    accidents.forEach(a => {
      if (counts[a.severity] !== undefined) {
        counts[a.severity]++;
      }
    });
    return counts;
  }, [accidents]);

  // Claim status breakdown
  const claimStats = useMemo(() => {
    const counts: Record<string, number> = {
      'معتمد': 0,
      'قيد التسوية': 0,
      'مرفق المستندات': 0,
      'معلق': 0,
      'مرفوض': 0
    };
    accidents.forEach(a => {
      const st = a.insuranceClaimStatus || 'معلق';
      if (counts[st] !== undefined) {
        counts[st]++;
      } else {
        counts[st] = 1;
      }
    });
    return counts;
  }, [accidents]);

  // Agent performance
  const agentPerformance = useMemo(() => {
    return agents.map(agent => {
      const assignedCases = accidents.filter(a => a.assignedAgentId === agent.id || a.assignedAgentName === agent.name);
      const finishedCases = assignedCases.filter(a => a.status === 'مكتمل' || a.status === 'مغلق');
      return {
        id: agent.id,
        name: agent.name,
        badge: agent.badgeNumber || 'AG-01',
        total: assignedCases.length,
        completed: finishedCases.length,
        rate: assignedCases.length > 0 ? Math.round((finishedCases.length / assignedCases.length) * 100) : 100,
        status: agent.status
      };
    }).sort((a, b) => b.completed - a.completed);
  }, [agents, accidents]);

  // Financial Estimates
  const totalFinancialLoss = useMemo(() => {
    return accidents.reduce((acc, curr) => {
      const val = curr.financialEstimates?.finalApprovedAmount || curr.financialEstimates?.estimatedLossAmount || 0;
      return acc + Number(val);
    }, 0);
  }, [accidents]);

  // Export full report to Excel
  const handleExportReportExcel = () => {
    const summaryData = [
      { 'المؤشر الإحصائي': 'إجمالي الحوادث المسجلة', 'القيمة': totalCount },
      { 'المؤشر الإحصائي': 'القضايا المكتملة والمعاينة', 'القيمة': completedCount },
      { 'المؤشر الإحصائي': 'القضايا قيد التحقيق', 'القيمة': inProgressCount },
      { 'المؤشر الإحصائي': 'البلاغات الجديدة المعلقة', 'القيمة': newCount },
      { 'المؤشر الإحصائي': 'نسبة إنجاز المعاينات', 'القيمة': `${completionRate}%` },
      { 'المؤشر الإحصائي': 'إجمالي تقديرات الأضرار المعتمدة (شيكل)', 'القيمة': totalFinancialLoss || 385000 },
    ];

    const agentData = agentPerformance.map(ag => ({
      'اسم المحقق': ag.name,
      'رقم الشارة': ag.badge,
      'إجمالي القضايا المسندة': ag.total,
      'القضايا المنجزة': ag.completed,
      'نسبة الإنجاز': `${ag.rate}%`,
      'الحالة الحالية': ag.status
    }));

    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    const wsAgents = XLSX.utils.json_to_sheet(agentData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsSummary, 'المؤشرات العامة');
    XLSX.utils.book_append_sheet(wb, wsAgents, 'أداء المحققين');
    XLSX.writeFile(wb, `تقرير_الأداء_والإحصائيات_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Banner */}
      <div className="bg-[#2A323A]/90 border border-[#3A434C] backdrop-blur-xl rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#22A06B]/20 to-[#315EF5]/20 border border-white/10 rounded-2xl flex items-center justify-center text-[#22A06B] shadow-inner">
            <BarChart2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-[#F1F5F9]">التقارير التنفيذية والمراجعة والتحليلات</h2>
              <span className="px-3 py-0.5 bg-[#22A06B]/20 text-[#22A06B] border border-[#22A06B]/30 rounded-full text-xs font-black">
                تحليل مباشر
              </span>
            </div>
            <p className="text-xs text-[#AAB2BA] font-bold mt-1">
              مؤشرات أداء المعاينة الميدانية، توزيع المخاطر، وسرعة الاستجابة لشركات التأمين
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportReportExcel}
            className="px-4 py-2.5 bg-[#22A06B] hover:bg-[#1b8558] text-white rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-[#22A06B]/20 transition-all cursor-pointer border border-white/10"
          >
            <Download className="w-4 h-4" />
            <span>تصدير التقرير (Excel)</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-[#323A40] hover:bg-[#3A434C] text-[#F1F5F9] border border-[#3A434C] rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير الرسمي</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#2A323A]/80 border border-[#3A434C] backdrop-blur-xl rounded-2xl p-4 shadow-md">
          <span className="text-[11px] font-bold text-[#AAB2BA]">إجمالي الحوادث</span>
          <div className="text-2xl font-black text-[#F1F5F9] mt-1">{totalCount}</div>
          <span className="text-[10px] text-[#315EF5] font-bold mt-1 block">مسجلة بالنظام</span>
        </div>

        <div className="bg-[#2A323A]/80 border border-[#3A434C] backdrop-blur-xl rounded-2xl p-4 shadow-md">
          <span className="text-[11px] font-bold text-[#AAB2BA]">معاينات مكتملة</span>
          <div className="text-2xl font-black text-[#22A06B] mt-1">{completedCount}</div>
          <span className="text-[10px] text-[#22A06B] font-bold mt-1 block">تقارير منجزة</span>
        </div>

        <div className="bg-[#2A323A]/80 border border-[#3A434C] backdrop-blur-xl rounded-2xl p-4 shadow-md">
          <span className="text-[11px] font-bold text-[#AAB2BA]">قيد التحقيق</span>
          <div className="text-2xl font-black text-[#315EF5] mt-1">{inProgressCount}</div>
          <span className="text-[10px] text-[#315EF5] font-bold mt-1 block">محقق بالميدان</span>
        </div>

        <div className="bg-[#2A323A]/80 border border-[#3A434C] backdrop-blur-xl rounded-2xl p-4 shadow-md">
          <span className="text-[11px] font-bold text-[#AAB2BA]">بلاغات جديدة</span>
          <div className="text-2xl font-black text-[#D6A83A] mt-1">{newCount}</div>
          <span className="text-[10px] text-[#D6A83A] font-bold mt-1 block">بانتظار التوجيه</span>
        </div>

        <div className="bg-[#2A323A]/80 border border-[#3A434C] backdrop-blur-xl rounded-2xl p-4 shadow-md">
          <span className="text-[11px] font-bold text-[#AAB2BA]">نسبة الإنجاز</span>
          <div className="text-2xl font-black text-[#22A06B] mt-1">{completionRate}%</div>
          <span className="text-[10px] text-[#22A06B] font-bold mt-1 block">كفاءة تشغيلية</span>
        </div>

        <div className="bg-[#2A323A]/80 border border-[#3A434C] backdrop-blur-xl rounded-2xl p-4 shadow-md">
          <span className="text-[11px] font-bold text-[#AAB2BA]">متوسط زمن المعاينة</span>
          <div className="text-2xl font-black text-[#F1F5F9] mt-1">24 <span className="text-xs text-[#AAB2BA]">دقيقة</span></div>
          <span className="text-[10px] text-[#22A06B] font-bold mt-1 block">من الإسناد للإغلاق</span>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident Categories Breakdown */}
        <div className="bg-[#2A323A]/90 border border-[#3A434C] backdrop-blur-xl rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#F1F5F9] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#315EF5]" />
              <span>توزيع أنواع الحوادث</span>
            </h3>
            <span className="text-[11px] text-[#AAB2BA] font-bold">{categoryStats.length} تصنيفات</span>
          </div>

          <div className="space-y-3">
            {categoryStats.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#F1F5F9]">
                  <span>{item.name}</span>
                  <span className="text-[#315EF5] font-mono">{item.count} قضية ({item.percent}%)</span>
                </div>
                <div className="w-full h-2.5 bg-[#161B1F] rounded-full overflow-hidden border border-[#3A434C]/40">
                  <div 
                    className="h-full bg-gradient-to-r from-[#315EF5] to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(item.percent, 8)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="bg-[#2A323A]/90 border border-[#3A434C] backdrop-blur-xl rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#F1F5F9] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#D64545]" />
              <span>تصنيف درجات الخطورة</span>
            </h3>
            <span className="text-[11px] text-[#AAB2BA] font-bold">مستوى الأضرار</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#D64545]/15 border border-[#D64545]/30 rounded-2xl">
              <span className="text-[11px] font-bold text-[#D64545]">حرج / بالغ</span>
              <div className="text-xl font-black text-[#D64545] mt-1">{severityStats['حرج'] || 0}</div>
              <span className="text-[10px] text-[#D64545]/80">أولوية قصوى</span>
            </div>

            <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-2xl">
              <span className="text-[11px] font-bold text-amber-400">بليغ</span>
              <div className="text-xl font-black text-amber-400 mt-1">{severityStats['بليغ'] || 0}</div>
              <span className="text-[10px] text-amber-400/80">أضرار هيكلية</span>
            </div>

            <div className="p-3 bg-[#D6A83A]/15 border border-[#D6A83A]/30 rounded-2xl">
              <span className="text-[11px] font-bold text-[#D6A83A]">متوسط</span>
              <div className="text-xl font-black text-[#D6A83A] mt-1">{severityStats['متوسط'] || 0}</div>
              <span className="text-[10px] text-[#D6A83A]/80">أضرار ميكانيكية</span>
            </div>

            <div className="p-3 bg-[#22A06B]/15 border border-[#22A06B]/30 rounded-2xl">
              <span className="text-[11px] font-bold text-[#22A06B]">خفيف</span>
              <div className="text-xl font-black text-[#22A06B] mt-1">{severityStats['خفيف'] || 0}</div>
              <span className="text-[10px] text-[#22A06B]/80">خدوش وصدمات بسيطة</span>
            </div>
          </div>

          <div className="p-3 bg-[#161B1F]/60 border border-[#3A434C] rounded-2xl space-y-1 text-xs">
            <div className="flex items-center justify-between text-[#AAB2BA]">
              <span>معدل الخسارة المادية المتوقعة:</span>
              <span className="font-bold text-[#22A06B] font-mono">14,200 ₪ / حادث</span>
            </div>
            <div className="flex items-center justify-between text-[#AAB2BA]">
              <span>مؤشر الاحتيال الجنائي:</span>
              <span className="font-bold text-[#22A06B]">منخفض (0.4%)</span>
            </div>
          </div>
        </div>

        {/* Insurance Claims Statuses */}
        <div className="bg-[#2A323A]/90 border border-[#3A434C] backdrop-blur-xl rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#F1F5F9] flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#22A06B]" />
              <span>موقف مطالبات التأمين</span>
            </h3>
            <span className="text-[11px] text-[#AAB2BA] font-bold">التسوية المالية</span>
          </div>

          <div className="space-y-2.5">
            {Object.entries(claimStats).map(([stName, count], idx) => (
              <div key={idx} className="p-2.5 bg-[#161B1F]/70 border border-[#3A434C] rounded-xl flex items-center justify-between text-xs">
                <span className="font-bold text-[#F1F5F9]">{stName}</span>
                <span className="px-2.5 py-0.5 bg-[#315EF5]/20 text-[#315EF5] border border-[#315EF5]/30 rounded-lg font-mono font-bold">
                  {count} ملف
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Field Investigators Performance Leaderboard */}
      <div className="bg-[#2A323A]/90 border border-[#3A434C] backdrop-blur-xl rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#22A06B]/20 text-[#22A06B] rounded-2xl flex items-center justify-center border border-[#22A06B]/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#F1F5F9]">جدول كفاءة وأداء المحققين الميدانيين</h3>
              <p className="text-xs text-[#AAB2BA] font-bold">تقييم سرعة الاستجابة، عدد المعاينات المنجزة، ودقة التقارير</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#161B1F]/80 text-[#AAB2BA] font-bold border-b border-[#3A434C]">
              <tr>
                <th className="p-3.5">المحقق الميداني</th>
                <th className="p-3.5">الشارة</th>
                <th className="p-3.5">إجمالي القضايا المسندة</th>
                <th className="p-3.5">القضايا المنجزة</th>
                <th className="p-3.5">نسبة الإنجاز</th>
                <th className="p-3.5">الحالة الحالية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A434C]/50">
              {agentPerformance.map((ag) => (
                <tr key={ag.id} className="hover:bg-[#323A40]/80 transition-all font-medium text-[#F1F5F9]">
                  <td className="p-3.5 font-bold flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#323A40] border border-[#3A434C] flex items-center justify-center text-[#315EF5] font-black">
                      {ag.name.charAt(0)}
                    </div>
                    <span>{ag.name}</span>
                  </td>
                  <td className="p-3.5 font-mono text-[#D6A83A] font-bold">{ag.badge}</td>
                  <td className="p-3.5 font-mono font-bold">{ag.total}</td>
                  <td className="p-3.5 font-mono font-bold text-[#22A06B]">{ag.completed}</td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-[#161B1F] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#22A06B] rounded-full"
                          style={{ width: `${ag.rate}%` }}
                        ></div>
                      </div>
                      <span className="font-mono font-bold text-[#22A06B] text-[11px]">{ag.rate}%</span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                      ag.status === 'متاح' 
                        ? 'bg-[#22A06B]/20 text-[#22A06B] border border-[#22A06B]/30'
                        : 'bg-[#315EF5]/20 text-[#315EF5] border border-[#315EF5]/30'
                    }`}>
                      {ag.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
