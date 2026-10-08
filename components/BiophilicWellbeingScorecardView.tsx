'use client';

import React, { useState } from 'react';
import {
  Activity,
  Heart,
  Moon,
  ShieldCheck,
  Award,
  Sparkles,
  Check,
  Copy,
  FileText,
  TrendingDown,
  Clock,
  Volume2,
  Calendar,
  Zap,
  BarChart2,
  HelpCircle,
  Eye,
} from 'lucide-react';
import {
  WeeklyWellbeingSummary,
  INITIAL_WELLBEING_SUMMARY,
  generateWellbeingReportMarkdown,
} from '@/lib/wellbeing-scorecard';

export function BiophilicWellbeingScorecardView() {
  const [data, setData] = useState<WeeklyWellbeingSummary>(INITIAL_WELLBEING_SUMMARY);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [selectedPillarId, setSelectedPillarId] = useState<string>('autonomic_recovery');

  const selectedPillar =
    data.pillars.find((p) => p.id === selectedPillarId) || data.pillars[0];

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateWellbeingReportMarkdown(data));
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <section className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>مؤشرات جودة الحياة والاستشفاء الحسي (Sensory Health & Wellbeing Scorecard)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100">
              تقرير الاستشفاء الحسي ومؤشرات جودة الحياة (Biophilic Wellbeing Index)
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mt-1">
              تحليل سريري ومعماري لأثر البيئة الصوتية والضوئية على صحة الأسرة، متوافق مع معيار المباني الصحية العالمي
              (WELL Building Standard v2)، يرصد انخفاض التوتر، جودة النوم، وحماية السكينة.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={handleCopyReport}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
            >
              {copiedReport ? <Check className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
              <span>{copiedReport ? 'تم نسخ التقرير الطبي!' : 'تصدير التقرير التنفيذي'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Executive Master Score Ring & Key Metrics Hero HUD */}
      <section className="p-7 rounded-3xl border border-stone-800 bg-stone-900/80 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden">
        {/* Glow Aura */}
        <div className="absolute -top-12 -right-12 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        {/* Left: Giant Score Ring Gauge (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center text-center space-y-3 relative z-10">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="74"
                className="text-stone-850"
                strokeWidth="12"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="88"
                cy="88"
                r="74"
                className="text-emerald-500 transition-all duration-1000 ease-out"
                strokeWidth="12"
                strokeDasharray={2 * Math.PI * 74}
                strokeDashoffset={2 * Math.PI * 74 * (1 - data.overallIndex / 100)}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5">
              <span className="text-4xl sm:text-5xl font-mono font-bold text-stone-100">
                {data.overallIndex}
              </span>
              <span className="text-[11px] font-mono text-stone-400">من 100 نقطة</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono font-bold shadow-sm">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>{data.certificationTierAr}</span>
            </div>
            <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
              تحقيق أعلى تصنيف للاستشفاء البيوفيلي السكني وفق معايير الصوت والضوء والرفاهية العصبية.
            </p>
          </div>
        </div>

        {/* Right: Key Physiological Telemetry Highlights (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-2 gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-850 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-rose-400">
              <Heart className="w-4 h-4" />
              <span>انخفاض النبض (HR Drop):</span>
            </div>
            <div className="text-2xl font-mono font-bold text-stone-100">
              -{data.averageDailyHrDropBpm} BPM
            </div>
            <p className="text-[10px] text-stone-500">
              متوسط هبوط ضربات القلب أثناء خرير المياه وتفعيل التنفس الرنان.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-850 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
              <Moon className="w-4 h-4" />
              <span>حماية الميلاتونين:</span>
            </div>
            <div className="text-2xl font-mono font-bold text-stone-100">
              {data.melatoninPreservationPct}%
            </div>
            <p className="text-[10px] text-stone-500">
              منع تثبيط هرمون النوم عبر الإضاءة الكهرمانية 1,800K ليلاً.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-850 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>سكون الصلوات الخمس:</span>
            </div>
            <div className="text-2xl font-mono font-bold text-stone-100">
              {data.prayerAdherencePct}%
            </div>
            <p className="text-[10px] text-stone-500">
              35 نافذة صلاة أسبوعية تمت حمايتها بالسكون التام تلقائياً.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-850 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Activity className="w-4 h-4" />
              <span>انحسار الصوت للكلام (VAD):</span>
            </div>
            <div className="text-2xl font-mono font-bold text-stone-100">
              {data.speechInteractionsRespected} مرة
            </div>
            <p className="text-[10px] text-stone-500">
              مرات انحسار الصوت التلقائي (-18dB) لحماية راحة المحادثات.
            </p>
          </div>
        </div>
      </section>

      {/* Four Sensory Health Pillars Breakdown */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-semibold text-stone-100">
              الركائز الأربع للاستشفاء الحسي (The 4 Sensory Health Pillars)
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-mono">· انقر لمراجعة القياسات السريرية</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.pillars.map((pillar) => {
            const isSelected = selectedPillarId === pillar.id;

            return (
              <div
                key={pillar.id}
                onClick={() => setSelectedPillarId(pillar.id)}
                className={`p-5 rounded-3xl border cursor-pointer transition-all space-y-3 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-stone-900 border-emerald-500 shadow-xl ring-1 ring-emerald-500/40'
                    : 'bg-stone-950/80 border-stone-800 hover:border-stone-750'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-stone-500">الوزن: {pillar.weight}%</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {pillar.score}/100
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-stone-100">{pillar.nameAr}</h3>
                  <p className="text-[11px] text-stone-400 leading-relaxed line-clamp-2">
                    {pillar.descriptionAr}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 pt-2">
                  <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${pillar.score}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Pillar Detailed Inspection Drawer */}
        <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-850">
            <div>
              <span className="text-xs font-mono text-emerald-400">تفاصيل الركيزة السريرية:</span>
              <h3 className="text-base font-bold text-stone-100">{selectedPillar.nameAr}</h3>
            </div>
            <span className="text-xs font-mono text-stone-300 bg-stone-900 px-3 py-1 rounded-xl border border-stone-800">
              {selectedPillar.statusAr}
            </span>
          </div>

          <p className="text-xs text-stone-300 leading-relaxed max-w-3xl">
            {selectedPillar.descriptionAr}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {selectedPillar.metrics.map((metric, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
                <span className="text-[10px] font-mono text-stone-500 block">{metric.labelAr}</span>
                <div className="text-base font-mono font-bold text-emerald-400">{metric.value}</div>
                <span className="text-[10px] font-mono text-stone-400 block">
                  الهدف المرجعي: {metric.target}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7-Day Weekly Sensory Activity Log */}
      <section className="p-7 rounded-3xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm sm:text-base font-bold text-stone-100">
              سجل النشاط الحسي الأسبوعي (7-Day Daily Biophilic History)
            </h2>
          </div>
          <span className="text-xs font-mono text-stone-400">معدل يومي: 14.1 ساعة</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {data.dailyLogs.map((log, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-stone-950 border border-stone-850 space-y-2 text-center"
            >
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-stone-200 block">{log.dayNameAr}</span>
                <span className="text-[10px] font-mono text-stone-500">{log.dateStr}</span>
              </div>

              <div className="py-1">
                <span className="text-lg font-mono font-bold text-emerald-400 block">
                  {log.overallScore}
                </span>
                <span className="text-[9px] font-mono text-stone-500">نقطة جودة</span>
              </div>

              <div className="space-y-1 text-[10px] font-mono text-stone-400 pt-1 border-t border-stone-850">
                <div className="flex justify-between">
                  <span>الصوت:</span>
                  <span className="text-stone-300">{log.totalListeningHours}h</span>
                </div>
                <div className="flex justify-between">
                  <span>التهدئة:</span>
                  <span className="text-rose-400">-{log.averageHrDropBpm} BPM</span>
                </div>
                <div className="flex justify-between">
                  <span>الحوار:</span>
                  <span className="text-cyan-400">{log.speechDuckingEvents}x</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
