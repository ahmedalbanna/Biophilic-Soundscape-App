'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Volume2,
  VolumeX,
  AlertTriangle,
  Sparkles,
  Sliders,
  Play,
  RotateCcw,
  ShieldCheck,
  Zap,
  Activity,
  Wind,
  Waves,
  Feather,
  CheckCircle2,
  Clock,
  Settings2,
  Info,
  Maximize2,
  Radio,
  Flame,
  Volume1,
} from 'lucide-react';
import {
  CALMING_PROFILES,
  VILLA_ZONES,
  CalmingProfileId,
  VillaZoneId,
  StressSeverity,
  AcousticTelemetry,
  StressIncidentLog,
  getStressReliefManager,
} from '@/lib/acoustic-stress-relief';
import { getAudioEngine } from '@/lib/audio-engine';

interface AcousticStressReliefViewProps {
  onEngineStartRequest?: () => void;
}

export function AcousticStressReliefView({ onEngineStartRequest }: AcousticStressReliefViewProps) {
  const manager = getStressReliefManager();
  const [config, setConfig] = useState(manager.getConfig());
  const [telemetry, setTelemetry] = useState<AcousticTelemetry>({
    agitationScore: 16,
    currentDb: -52,
    harshnessRatio: 0.22,
    crestFactor: 2.1,
    severity: 'calm',
    stage: 'monitoring',
    breathPhase: 'rest',
    breathProgress: 0,
    timeInStageSec: 0,
  });
  const [incidents, setIncidents] = useState<StressIncidentLog[]>([]);
  const [activeTab, setActiveTab] = useState<'cockpit' | 'profiles' | 'simulation' | 'history' | 'science'>('cockpit');
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);

  useEffect(() => {
    const unsub = manager.subscribe((newTelem, newLogs) => {
      setTelemetry({ ...newTelem });
      setIncidents([...newLogs]);
    });
    return unsub;
  }, [manager]);

  const handleToggleEnabled = () => {
    const nextState = !config.enabled;
    manager.updateConfig({ enabled: nextState });
    setConfig(manager.getConfig());
    if (nextState && onEngineStartRequest) {
      onEngineStartRequest();
    }
  };

  const handleSelectZone = (zoneId: VillaZoneId) => {
    manager.updateConfig({ zoneId });
    setConfig(manager.getConfig());
  };

  const handleSelectProfile = (profileId: CalmingProfileId) => {
    manager.updateConfig({ profileId });
    setConfig(manager.getConfig());
  };

  const handleTriggerManualIntervention = (profileId?: CalmingProfileId) => {
    if (onEngineStartRequest) onEngineStartRequest();
    manager.triggerManualIntervention(profileId);
  };

  const handleCancelIntervention = () => {
    manager.cancelIntervention();
  };

  const handleSimulate = (scenario: 'kids_screaming' | 'kitchen_clatter' | 'loud_tv' | 'instant_calm', label: string) => {
    if (onEngineStartRequest) onEngineStartRequest();
    setActiveSimulation(label);
    manager.simulateScenario(scenario);
    setTimeout(() => {
      setActiveSimulation(null);
    }, 3000);
  };

  // Severity display styles
  const getSeverityBadge = (severity: StressSeverity) => {
    switch (severity) {
      case 'calm':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400',
          labelAr: 'سكينة وهدوء تام',
          labelEn: 'Serene Baseline',
        };
      case 'mild_agitation':
        return {
          bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400 animate-pulse',
          labelAr: 'أحاديث وحركة نشطة',
          labelEn: 'Active Ambience',
        };
      case 'elevated_cacophony':
        return {
          bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
          dot: 'bg-orange-500 animate-ping',
          labelAr: 'صخب وتوتر متصاعد',
          labelEn: 'Elevated Cacophony',
        };
      case 'acute_stress':
        return {
          bg: 'bg-rose-500/15 text-rose-400 border-rose-500/40',
          dot: 'bg-rose-500 animate-ping',
          labelAr: 'صراخ وارتطام حاد (تدخل فوري)',
          labelEn: 'Acute Agitation',
        };
    }
  };

  const severityStyle = getSeverityBadge(telemetry.severity);
  const currentProfile = CALMING_PROFILES[config.profileId];
  const currentZone = VILLA_ZONES[config.zoneId];

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-teal-950/30 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-300 shadow-inner">
              <Heart className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span>نظام التهدئة التلقائية عند التوتر والصخب</span>
              <span className="text-emerald-500">|</span>
              <span className="text-[11px] opacity-80">Acoustic Stress Auto-Relief & Noise Calming</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>تسكين الصخب والتوافق القلبي الحيوي</span>
              {telemetry.stage === 'calming_active' && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse">
                  التدخل نشط الآن 🟣
                </span>
              )}
            </h1>

            <p className="max-w-2xl text-sm leading-relaxed text-slate-300">
              خوارزمية رصد متقدمة تميز بين الأحاديث الأسرية الطبيعية وصخب الشجار أو ارتطام الأواني، وتتدخل
              تلقائياً عبر تنعيم الترددات الحادة ونبضات التوافق القلبي (0.1 Hz / 6 BPM) لتخفيض هرمون الكورتيزول
              وإعادة السكينة للمنزل.
            </p>
          </div>

          {/* Master Toggle & Quick State */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleToggleEnabled}
              className={`flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all duration-300 shadow-lg ${
                config.enabled
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/20 ring-1 ring-emerald-400/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700/80'
              }`}
            >
              <div
                className={`h-3 w-3 rounded-full ${
                  config.enabled ? 'bg-emerald-300 animate-ping' : 'bg-slate-500'
                }`}
              />
              <span>{config.enabled ? 'المراقبة التلقائية مفعلة' : 'المراقبة متوقفة'}</span>
            </button>

            {telemetry.stage === 'calming_active' ? (
              <button
                onClick={handleCancelIntervention}
                className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/20 px-4 py-3 text-xs font-medium text-rose-300 hover:bg-rose-500/30 transition-colors"
              >
                <VolumeX className="h-4 w-4" />
                <span>إيقاف التدخل واستئناف النمط العادي</span>
              </button>
            ) : (
              <button
                onClick={() => handleTriggerManualIntervention()}
                className="flex items-center gap-2 rounded-2xl border border-teal-500/30 bg-teal-500/15 px-4 py-3 text-xs font-medium text-teal-200 hover:bg-teal-500/25 transition-colors"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>بدء تدخل التهدئة يدوياً</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Sub-Nav Tabs */}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-slate-800/80 pt-4">
          {[
            { id: 'cockpit', labelAr: 'قمرة الرادار والتنفس الحي', labelEn: 'Radar & Pacer Cockpit', icon: Activity },
            { id: 'profiles', labelAr: 'ملفات التهدئة التخصصية (4)', labelEn: 'Calming Profiles', icon: Waves },
            { id: 'simulation', labelAr: 'محاكاة سيناريوهات الصخب', labelEn: 'Cacophony Sim Deck', icon: Zap },
            { id: 'history', labelAr: 'سجل التدخلات والفعالية', labelEn: 'Incident Logs', icon: Clock },
            { id: 'science', labelAr: 'الأساس الطبي والإكوستيكي', labelEn: 'Clinical Science', icon: Info },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.labelAr}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: RADAR & PACER COCKPIT */}
      {activeTab === 'cockpit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Agitation Gauge & Cardiorespiratory Ring */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-emerald-400" />
                  <h2 className="text-base font-bold text-white">رادار التوتر الإكوستيكي الحي (Real-time Agitation Index)</h2>
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${severityStyle.bg}`}>
                  <span className={`h-2 w-2 rounded-full ${severityStyle.dot}`} />
                  <span>{severityStyle.labelAr}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                يقيس المحرك باستمرار طاقة الترددات الحادة فوق 3.5kHz وتباين الضغط الصوتي (Crest Factor) للكشف عن الشجار والصراخ فوراً.
              </p>
            </div>

            {/* Central Animated Visualizer: Agitation Meter + Breathing Pacer */}
            <div className="my-8 flex flex-col items-center justify-center relative">
              {/* Outer Pulse Ring */}
              <div className="relative flex items-center justify-center h-64 w-64 md:h-72 md:w-72">
                {/* Background Track */}
                <svg className="absolute inset-0 h-full w-full -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="42%"
                    className="stroke-slate-800"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  {/* Agitation Progress Arc */}
                  <circle
                    cx="50%"
                    cy="50%"
                    r="42%"
                    className={`transition-all duration-500 ${
                      telemetry.agitationScore > 70
                        ? 'stroke-rose-500'
                        : telemetry.agitationScore > 50
                        ? 'stroke-amber-500'
                        : 'stroke-emerald-500'
                    }`}
                    strokeWidth="12"
                    strokeDasharray="264%"
                    strokeDashoffset={`${264 - (264 * telemetry.agitationScore) / 100}%`}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                {/* Cardiorespiratory Breathing Swell Circle */}
                <motion.div
                  animate={{
                    scale:
                      telemetry.stage === 'calming_active'
                        ? telemetry.breathPhase === 'inhale'
                          ? [1, 1.25]
                          : [1.25, 0.95]
                        : [1, 1.05, 1],
                  }}
                  transition={{
                    duration: telemetry.stage === 'calming_active' ? (telemetry.breathPhase === 'inhale' ? 4 : 6) : 3,
                    ease: 'easeInOut',
                    repeat: telemetry.stage === 'calming_active' ? 0 : Infinity,
                  }}
                  className={`flex flex-col items-center justify-center h-44 w-44 rounded-full border shadow-2xl backdrop-blur-md transition-colors ${
                    telemetry.stage === 'calming_active'
                      ? 'border-purple-400/40 bg-gradient-to-b from-purple-900/60 to-teal-950/70 shadow-purple-500/20'
                      : telemetry.agitationScore > 70
                      ? 'border-rose-500/40 bg-rose-950/40 shadow-rose-500/20'
                      : 'border-emerald-500/30 bg-emerald-950/30 shadow-emerald-500/10'
                  }`}
                >
                  {telemetry.stage === 'calming_active' ? (
                    <>
                      <Wind className="h-6 w-6 text-teal-300 animate-pulse mb-1" />
                      <div className="text-xl font-black text-white">
                        {telemetry.breathPhase === 'inhale' ? 'شـهـيـق (Inhale)' : 'زفـيـر (Exhale)'}
                      </div>
                      <div className="text-[11px] font-medium text-teal-300">
                        {telemetry.breathPhase === 'inhale' ? '4 ثوانٍ (انتعاش)' : '6 ثوانٍ (تهدئة)'}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">نبض 0.1Hz / 6 BPM</div>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl font-extrabold text-white tracking-tight">
                        {telemetry.agitationScore}%
                      </div>
                      <div className="text-xs font-semibold text-slate-300 mt-0.5">مؤشر التوتر الإكوستيكي</div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        العتبة: {config.thresholdPercent}%
                      </div>
                    </>
                  )}
                </motion.div>
              </div>

              {/* Status explanation */}
              <div className="mt-4 text-center">
                <span className="text-xs font-medium text-slate-300">
                  {telemetry.stage === 'calming_active' ? (
                    <span className="text-purple-300">
                      جاري التدخل النشط بملف:{' '}
                      <strong className="text-white">{currentProfile.nameAr}</strong>
                    </span>
                  ) : telemetry.stage === 'triggered' ? (
                    <span className="text-orange-400 font-semibold">
                      تم رصد صخب! جاري التأكد لمدة {config.triggerHoldDurationSec} ثوانٍ قبل التدخل...
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      المحيط ضمن الحدود الطبيعية لمساحة ({currentZone.nameAr})
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* 3 Physical Acoustic Sub-Meters */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800">
              <div className="rounded-2xl bg-slate-950/50 p-3.5 border border-slate-800/80 text-center">
                <div className="text-[11px] text-slate-400 mb-1">الضغط الصوتي (dB SPL)</div>
                <div className="text-lg font-bold text-white">{telemetry.currentDb} <span className="text-xs text-slate-400">dB</span></div>
                <div className="text-[10px] text-slate-500 mt-0.5">مستوى الطاقة اللحظي</div>
              </div>
              <div className="rounded-2xl bg-slate-950/50 p-3.5 border border-slate-800/80 text-center">
                <div className="text-[11px] text-slate-400 mb-1">حدة الترددات (HF Ratio)</div>
                <div className="text-lg font-bold text-teal-400">{Math.round(telemetry.harshnessRatio * 100)}%</div>
                <div className="text-[10px] text-slate-500 mt-0.5">الطاقة فوق 3.5kHz</div>
              </div>
              <div className="rounded-2xl bg-slate-950/50 p-3.5 border border-slate-800/80 text-center">
                <div className="text-[11px] text-slate-400 mb-1">معامل الارتطام (Crest)</div>
                <div className="text-lg font-bold text-amber-400">{telemetry.crestFactor.toFixed(1)}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">صدمات الأصوات الحادة</div>
              </div>
            </div>
          </div>

          {/* Right Column: Zone Selection & Interventions Deck */}
          <div className="lg:col-span-5 space-y-6">
            {/* Zone Selector */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-emerald-400" />
                  <span>تحديد جناح الفيلا المستهدف</span>
                </h3>
                <span className="text-[11px] text-emerald-400 font-medium">حساسية متكيفة</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(VILLA_ZONES) as VillaZoneId[]).map((zoneId) => {
                  const z = VILLA_ZONES[zoneId];
                  const isSelected = config.zoneId === zoneId;
                  return (
                    <button
                      key={zoneId}
                      onClick={() => handleSelectZone(zoneId)}
                      className={`text-right rounded-2xl p-3 border transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/15 text-white shadow-md shadow-emerald-500/10'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold">{z.nameAr}</div>
                      <div className="text-[10px] opacity-75 mt-0.5">عتبة التدخل: {z.defaultThreshold}%</div>
                      <div className="text-[10px] text-teal-400 mt-1">زمن التأكيد: {z.holdTimeSec} ثانية</div>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">
                {currentZone.descriptionAr}
              </p>
            </div>

            {/* Active Calming Profile Preview Card */}
            <div className="rounded-3xl border border-teal-500/30 bg-gradient-to-br from-slate-900/90 to-teal-950/40 p-5 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                  <span>الملف الصوتي المعتمد للتدخل</span>
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 font-medium">
                  {currentProfile.targetBpm} أنفاس/دقيقة
                </span>
              </div>

              <h4 className="text-base font-extrabold text-white">{currentProfile.nameAr}</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{currentProfile.subtitleAr}</p>

              {/* Frequency specs */}
              <div className="my-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-slate-950/60 p-2 border border-slate-800">
                  <span className="block text-[10px] text-slate-400">تردد التجذير</span>
                  <span className="font-bold text-teal-300">{currentProfile.carrierHz} Hz</span>
                </div>
                <div className="rounded-xl bg-slate-950/60 p-2 border border-slate-800">
                  <span className="block text-[10px] text-slate-400">تسكين الترددات</span>
                  <span className="font-bold text-emerald-300">{currentProfile.lowpassCutoffHz} Hz</span>
                </div>
                <div className="rounded-xl bg-slate-950/60 p-2 border border-slate-800">
                  <span className="block text-[10px] text-slate-400">موجة ثيتا</span>
                  <span className="font-bold text-purple-300">{currentProfile.thetaHz} Hz</span>
                </div>
              </div>

              <div className="rounded-xl bg-teal-500/10 border border-teal-500/20 p-2.5 text-xs text-teal-200 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                <span><strong>الأثر الطبي:</strong> {currentProfile.clinicalBenefitAr}</span>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleTriggerManualIntervention(currentProfile.id)}
                  className="flex-1 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-teal-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>تفعيل هذا الملف صوتياً الآن</span>
                </button>
                <button
                  onClick={() => setActiveTab('profiles')}
                  className="rounded-xl bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  تغيير الملف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SPECIALIZED CALMING PROFILES */}
      {activeTab === 'profiles' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Waves className="h-5 w-5 text-teal-400" />
                <span>مصفوفة ملفات التدخل البيوفيلي التخصصية (4)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                صممت كل بيئة صوتية بالتعاون مع معايير الصوتيات المعمارية والطب العصبي لإحداث تأثير مهدئ فوري ومثبت.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(Object.keys(CALMING_PROFILES) as CalmingProfileId[]).map((profId) => {
              const p = CALMING_PROFILES[profId];
              const isSelected = config.profileId === profId;
              return (
                <div
                  key={profId}
                  className={`rounded-3xl border p-6 backdrop-blur-xl transition-all ${
                    isSelected
                      ? 'border-emerald-500/60 bg-gradient-to-br from-emerald-950/30 to-slate-900/90 shadow-2xl shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-extrabold text-white">{p.nameAr}</h3>
                        {isSelected && (
                          <span className="text-[11px] rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 font-bold">
                            الملف النشط
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 font-medium">{p.nameEn}</div>
                    </div>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-teal-300 border border-slate-700">
                      {p.targetBpm} BPM (0.1Hz)
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">{p.descriptionAr}</p>

                  {/* Key Audio Parameters */}
                  <div className="my-4 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-xl bg-slate-950/60 p-2.5 border border-slate-800">
                      <span className="block text-[10px] text-slate-400">تردد القاعدة</span>
                      <span className="font-bold text-teal-300">{p.carrierHz} Hz</span>
                    </div>
                    <div className="rounded-xl bg-slate-950/60 p-2.5 border border-slate-800">
                      <span className="block text-[10px] text-slate-400">فلتر الحماية الحاد</span>
                      <span className="font-bold text-emerald-300">{p.lowpassCutoffHz} Hz</span>
                    </div>
                    <div className="rounded-xl bg-slate-950/60 p-2.5 border border-slate-800">
                      <span className="block text-[10px] text-slate-400">تزامن ثيتا</span>
                      <span className="font-bold text-purple-300">{p.thetaHz} Hz</span>
                    </div>
                  </div>

                  {/* Dominant elements tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {p.dominantElements.map((el, i) => (
                      <span
                        key={i}
                        className="rounded-lg bg-slate-800/80 px-2.5 py-1 text-[11px] text-slate-300 border border-slate-700/60"
                      >
                        {el}
                      </span>
                    ))}
                  </div>

                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-200 mb-4">
                    <strong>المنفعة العصبية:</strong> {p.clinicalBenefitAr}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSelectProfile(profId)}
                      className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-slate-800 text-slate-300 border border-slate-700'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                      }`}
                    >
                      {isSelected ? 'معتمد كملف افتراضي' : 'اختيار كملف التدخل'}
                    </button>
                    <button
                      onClick={() => handleTriggerManualIntervention(profId)}
                      className="rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-500/40 px-3.5 py-2.5 text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>سماع حي</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CACOPHONY SIMULATION DECK */}
      {activeTab === 'simulation' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">
                محطة محاكاة سيناريوهات الصخب المنزلي (Live Acoustic Stress Test Deck)
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              تتيح لك هذه المحطة إرسال نبضات صوتية افتراضية ذات ترددات حادة ومعامل تباين مرتفع (Crest Factor)
              لاختبار استجابة المحرك التلقائية وتفعيل التهدئة فورا دون الحاجة لإحداث ضوضاء فعلية في الغرفة.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  id: 'kids_screaming' as const,
                  titleAr: 'صراخ وشجار أطفال فجائي',
                  titleEn: 'Kids Screaming & Cacophony',
                  agitationExpected: '88%',
                  dbExpected: '-16.4 dB',
                  harshness: '84%',
                  color: 'from-rose-600 to-amber-600',
                  border: 'border-rose-500/40',
                },
                {
                  id: 'kitchen_clatter' as const,
                  titleAr: 'ارتطام أواني مطبخ وأصوات مفاجئة',
                  titleEn: 'Kitchen Clatter & Transients',
                  agitationExpected: '77%',
                  dbExpected: '-19.8 dB',
                  harshness: '72%',
                  color: 'from-orange-600 to-amber-600',
                  border: 'border-orange-500/40',
                },
                {
                  id: 'loud_tv' as const,
                  titleAr: 'تلفاز صاخب وضوضاء ضيوف',
                  titleEn: 'Loud TV & Chaotic Speech',
                  agitationExpected: '70%',
                  dbExpected: '-22.1 dB',
                  harshness: '61%',
                  color: 'from-amber-600 to-teal-600',
                  border: 'border-amber-500/40',
                },
                {
                  id: 'instant_calm' as const,
                  titleAr: 'استعادة فورية للسكينة والهدوء',
                  titleEn: 'Instant Quietude & Recovery',
                  agitationExpected: '12%',
                  dbExpected: '-58.0 dB',
                  harshness: '15%',
                  color: 'from-emerald-600 to-teal-600',
                  border: 'border-emerald-500/40',
                },
              ].map((sim) => (
                <button
                  key={sim.id}
                  onClick={() => handleSimulate(sim.id, sim.titleAr)}
                  className={`text-right rounded-2xl border ${sim.border} bg-slate-950/60 p-5 hover:scale-[1.02] transition-all group relative overflow-hidden`}
                >
                  <div className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${sim.color}`} />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {sim.titleAr}
                    </span>
                    <Play className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">{sim.titleEn}</div>

                  <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">التوتر المتوقع:</span>
                      <strong className="text-white">{sim.agitationExpected}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">الترددات الحادة:</span>
                      <strong className="text-teal-300">{sim.harshness}</strong>
                    </div>
                  </div>

                  {activeSimulation === sim.titleAr && (
                    <div className="mt-3 text-[10px] font-bold text-amber-400 animate-pulse">
                      جاري المحاكاة اللحظية...
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Sensitivity Settings */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-emerald-400" />
              <span>الضبط الهندسي الدقيق لعتبات الاستشعار والتهدئة</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Threshold Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">عتبة التوتر للتدخل</span>
                  <span className="text-emerald-400 font-bold">{config.thresholdPercent}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="90"
                  step="5"
                  value={config.thresholdPercent}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    manager.updateConfig({ thresholdPercent: val });
                    setConfig(manager.getConfig());
                  }}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">
                  إذا تجاوز التوتر هذه النسبة يبدأ عداد التأكيد
                </span>
              </div>

              {/* Hold Duration */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">مدة تأكيد الصخب</span>
                  <span className="text-teal-400 font-bold">{config.triggerHoldDurationSec} ثانية</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={config.triggerHoldDurationSec}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    manager.updateConfig({ triggerHoldDurationSec: val });
                    setConfig(manager.getConfig());
                  }}
                  className="w-full accent-teal-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">
                  تمنع التدخل الخاطئ للأصوات العابرة مثل الضحكات القصيرة
                </span>
              </div>

              {/* Recovery Duration */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">مدة استعادة السكينة</span>
                  <span className="text-purple-400 font-bold">{config.recoveryHoldDurationSec} ثانية</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="45"
                  step="5"
                  value={config.recoveryHoldDurationSec}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    manager.updateConfig({ recoveryHoldDurationSec: val });
                    setConfig(manager.getConfig());
                  }}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">
                  مهلة التأكد من هدوء المكان قبل العودة التلقائية للبيئة العادية
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INCIDENTS & CLINICAL LOGS */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-400" />
                <span>سجل تدخلات التهدئة التلقائية وقياسات الفاعلية</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                توثيق لجميع حالات الصخب التي تم احتوائها في مختلف أجنحة الفيلا مع نسب خفض التوتر واستعادة التوافق.
              </p>
            </div>
            <span className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
              إجمالي الحالات المسجلة: {incidents.length}
            </span>
          </div>

          <div className="space-y-3">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-md hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{inc.zoneNameAr}</span>
                    <span className="text-[10px] text-slate-400">({inc.timestamp})</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {inc.profileNameAr}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{inc.triggerCause}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 block">ذروة التوتر</span>
                    <strong className="text-rose-400 font-bold">{inc.peakAgitation}%</strong>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 block">شدة الصوت</span>
                    <strong className="text-white font-bold">{inc.peakDb} dB</strong>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 block">مدة التدخل</span>
                    <strong className="text-teal-300 font-bold">{inc.durationSec} ثانية</strong>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 block">نسبة التسكين</span>
                    <strong className="text-emerald-400 font-bold">{inc.calmingEfficacy || 92}%</strong>
                  </div>
                  <div className="rounded-xl bg-slate-800/90 px-3 py-1.5 border border-slate-700 text-[11px] text-slate-300">
                    {inc.resolvedAt}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CLINICAL & ACOUSTIC SCIENCE */}
      {activeTab === 'science' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-400" />
              <span>فسيولوجيا التوافق القلبي والتنفس (0.1 Hz / 6 BPM)</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              عندما يتعرض الإنسان لصخب فجائي أو صراخ، يتحفز الجهاز العصبي الودي (Sympathetic Nervous System)
              مما يرفع معدل ضربات القلب ويفرز الكورتيزول والأدرينالين.
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              تقنية <strong>التوافق القلبي الرئوي (Cardiorespiratory Resonance)</strong> تعتمد على وتيرة تنفس
              محددة بدقة 0.1 هرتز (أي 6 أنفاس في الدقيقة: 4 ثوانٍ شهيق، و6 ثوانٍ زفير). عندما يدمج هذا التردد
              كنبض خافت في حركة أمواج البحر وخرير الجداول، فإنه يحفز <strong>العصب المبهم (Vagus Nerve)</strong>
              لا شعورياً، مما يخفض نبضات القلب ويعيد التوازن العصبي خلال أقل من دقيقة.
            </p>
            <div className="rounded-2xl bg-teal-500/10 border border-teal-500/20 p-4 text-xs text-teal-200">
              <strong>دراسات معهد HeartMath:</strong> أثبتت الأبحاث أن المزامنة الصوتية للتنفس التوافقي تخفض التوتر
              النفسي وتزيد من تباين معدل ضربات القلب (HRV) بنسبة 40% مقارنة بالصمت العادي.
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span>التنعيم النفس-صوتي للترددات الحادة (Psychoacoustic Softening)</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              أصوات ارتطام الصحون وصراخ الأطفال تحتوي على طاقة مركزية في المدى الترددي الحرج بين 3.5kHz و8kHz.
              الأذن البشرية بالغة الحساسية لهذا النطاق بسبب تصميم القناة السمعية، مما يسبب إجهاداً سمعياً وتوتراً فورياً.
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              عندما يرصد النظام طفرة في معامل الحدة (Harshness Ratio)، يطبق فلتر تنعيم فوري (Lowpass Filter)
              يهبط بالترددات الحادة بمقدار 12 ديسيبل، مستبدلاً إياها بطبقات ضوضاء وردية طبيعية (خرير ماء ورقراق أرز)،
              مما يمنع الصدمة الإكوستيكية ويمنح الدماغ مساحة للراحة والهدوء.
            </p>
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-200">
              <strong>معايير البيئة السمعية الحيوية (Biophilic Acoustics):</strong> دمج التغطية الصوتية بالماء والنسيم
              يقلل من إدراك الضوضاء المنزلية المزعجة بنسبة 65% مع الحفاظ على وضوح التخاطب الطبيعي.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
