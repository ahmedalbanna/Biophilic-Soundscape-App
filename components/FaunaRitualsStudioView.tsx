'use client';

import React, { useState } from 'react';
import {
  Feather,
  Coffee,
  Moon,
  Sun,
  Sparkles,
  Volume2,
  Clock,
  Compass,
  Layers,
  Zap,
  Play,
  RotateCcw,
  Check,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Flame,
  Radio,
  Sliders,
  Filter,
} from 'lucide-react';
import {
  SoundCategory,
  DiurnalPeriodId,
  SocialContextId,
  SoundElementItem,
  ALL_SOUND_ELEMENTS,
  DIURNAL_PERIODS,
  AUDIO_ENGINE_EVOLUTION_PLAN,
  TechnicalPlanPhase,
} from '@/lib/fauna-rituals-catalog';
import { getAudioEngine } from '@/lib/audio-engine';

interface FaunaRitualsStudioViewProps {
  onEngineStartRequest: () => void;
  isEnginePlaying: boolean;
}

export function FaunaRitualsStudioView({
  onEngineStartRequest,
  isEnginePlaying,
}: FaunaRitualsStudioViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<SoundCategory | 'all'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<DiurnalPeriodId | 'all'>('all');
  const [selectedContext, setSelectedContext] = useState<SocialContextId | 'all'>('all');
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [activePlanTab, setActivePlanTab] = useState<number>(1);

  // Filter elements
  const filteredElements = ALL_SOUND_ELEMENTS.filter((elem) => {
    if (selectedCategory !== 'all' && elem.category !== selectedCategory) return false;
    if (selectedPeriod !== 'all' && !elem.diurnalPeriods.includes(selectedPeriod)) return false;
    if (selectedContext !== 'all' && !elem.socialContexts.includes(selectedContext)) return false;
    return true;
  });

  // Play a specific sound element procedurally in real-time
  const handlePlaySound = (elem: SoundElementItem) => {
    setActivePlayingId(elem.id);
    if (!isEnginePlaying) {
      onEngineStartRequest();
    }

    const engine = getAudioEngine();

    // Call the corresponding engine procedural method
    switch (elem.id) {
      case 'elem_bulbul':
        engine.triggerProceduralBird(true);
        break;
      case 'elem_hoopoe':
        engine.triggerHoopoeCall(true);
        break;
      case 'elem_turtle_dove':
        engine.triggerTurtleDoveCoo(true);
        break;
      case 'elem_night_owl':
        engine.triggerHoopoeCall(true);
        break;
      case 'elem_night_crickets':
      case 'elem_midday_cicadas':
        engine.triggerNightCrickets(true);
        break;
      case 'elem_caravan_bell':
        engine.triggerDesertCaravanBell(true);
        break;
      case 'elem_coffee_nejir':
        engine.triggerCoffeeNejir(true);
        break;
      case 'elem_incense_ember':
        engine.triggerIncenseEmber(true);
        break;
      case 'elem_tibetan_bowl':
        engine.triggerSingingBowl(432);
        break;
      default:
        engine.triggerProceduralBird(true);
        break;
    }

    setStatusMessage(`تم توليد نغمة "${elem.nameAr}" إجرائياً عبر خوارزميات Web Audio API الحية!`);
    setTimeout(() => {
      setActivePlayingId(null);
      setStatusMessage('');
    }, 2800);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <section className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>مستودع الكائنات الصوتية وخطة التطوير (Fauna, Aviary & Cultural Rituals)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100">
              مكتبة أصوات الطيور والبرية والطقوس التراثية ومصفوفة الفترات اليومية
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mt-1">
              توليد فيزيائي إجرائي لأصوات الطيور الأصيلة (البلبل، الهدهد، القمري)، الكائنات الحية (الجداجد وأجراس الإبل)،
              وطقوس الضيافة (نجر القهوة، جمر المبخرة والعود) مع خطة تطوير هندسية متكاملة لترقية المحرك الصوتي.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>العناصر المتوفرة: <strong>{ALL_SOUND_ELEMENTS.length} أصوات إجرائية</strong></span>
            </span>
          </div>
        </div>

        {statusMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </section>

      {/* Multi-Dimensional Filter Toolbar */}
      <section className="p-5 rounded-2xl bg-stone-900/40 border border-stone-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
          <Filter className="w-3.5 h-3.5 text-emerald-400" />
          <span>تصفية الأصوات حسب التصنيف والفترة اليومية وسياق الأسرة:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Category Filter */}
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl border transition-colors ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-stone-950 font-bold border-emerald-500'
                : 'bg-stone-950 text-stone-400 border-stone-850'
            }`}
          >
            كافة الأصوات
          </button>
          <button
            onClick={() => setSelectedCategory('birds')}
            className={`px-3 py-1.5 rounded-xl border transition-colors ${
              selectedCategory === 'birds'
                ? 'bg-emerald-600 text-stone-950 font-bold border-emerald-500'
                : 'bg-stone-950 text-stone-400 border-stone-850'
            }`}
          >
            الطيور الأصيلة (Aviary)
          </button>
          <button
            onClick={() => setSelectedCategory('wildlife')}
            className={`px-3 py-1.5 rounded-xl border transition-colors ${
              selectedCategory === 'wildlife'
                ? 'bg-emerald-600 text-stone-950 font-bold border-emerald-500'
                : 'bg-stone-950 text-stone-400 border-stone-850'
            }`}
          >
            البرية والكائنات (Fauna)
          </button>
          <button
            onClick={() => setSelectedCategory('cultural_rituals')}
            className={`px-3 py-1.5 rounded-xl border transition-colors ${
              selectedCategory === 'cultural_rituals'
                ? 'bg-emerald-600 text-stone-950 font-bold border-emerald-500'
                : 'bg-stone-950 text-stone-400 border-stone-850'
            }`}
          >
            الطقوس والمجلس (Rituals)
          </button>
        </div>
      </section>

      {/* Sound Elements Audition Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-semibold text-stone-100">
              لوحة الاستماع الفوري والتوليد الفيزيائي (Live Sound Audition Board)
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-mono">
            معروض {filteredElements.length} من أصل {ALL_SOUND_ELEMENTS.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredElements.map((elem) => {
            const isPlaying = activePlayingId === elem.id;

            return (
              <div
                key={elem.id}
                className={`p-6 rounded-3xl border transition-all space-y-4 flex flex-col justify-between relative overflow-hidden ${
                  isPlaying
                    ? 'bg-stone-900 border-emerald-500 shadow-xl ring-2 ring-emerald-500/40'
                    : 'bg-stone-950/80 border-stone-800 hover:border-stone-750 hover:bg-stone-900/40'
                }`}
              >
                {/* Audio Playing Glow Pulse */}
                {isPlaying && (
                  <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none animate-pulse" />
                )}

                <div className="space-y-2 relative z-10">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-900 border border-stone-800 text-emerald-400">
                      {elem.categoryLabelAr}
                    </span>

                    <span className="text-[10px] font-mono text-stone-500">
                      {elem.acousticSignature.fundamentalFreqHz} Hz
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-stone-100">{elem.nameAr}</h3>
                    <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                      {elem.scientificOrCulturalContextAr}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-stone-850 text-[11px] font-mono relative z-10">
                  <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 text-stone-300">
                    <span className="text-stone-500 block text-[10px]">البصمة الصوتية:</span>
                    <span>{elem.audioDescriptionAr}</span>
                  </div>

                  <div className="flex items-center justify-between text-stone-400 text-[10px]">
                    <span>نوع التوليد:</span>
                    <span className="text-emerald-400 font-bold uppercase">
                      {elem.acousticSignature.proceduralType}
                    </span>
                  </div>

                  <button
                    onClick={() => handlePlaySound(elem)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 shadow-md ${
                      isPlaying
                        ? 'bg-emerald-400 text-stone-950 scale-105'
                        : 'bg-stone-850 hover:bg-stone-800 text-stone-200'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isPlaying ? 'جاري التوليد الصوتي...' : 'استماع فوري للصوت'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 24-Hour Diurnal Circadian Scheduler Matrix */}
      <section className="p-7 rounded-3xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-bold text-stone-100">
                مصفوفة التوزيع اليومي على مدار الـ 24 ساعة (Diurnal Circadian Mapping)
              </h2>
            </div>
            <span className="text-xs text-stone-400 mt-0.5 block">
              توزيع الأصوات الطبيعية والطقوس بدقة على فترات اليوم لتجنب التكرار وتوفير سكون تام وقت النوم والصلوات
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DIURNAL_PERIODS.map((period) => (
            <div
              key={period.id}
              className="p-5 rounded-2xl bg-stone-950 border border-stone-850 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-100">{period.nameAr}</span>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                    {period.timeRangeAr}
                  </span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">{period.acousticAtmosphereAr}</p>
              </div>

              <div className="pt-2 border-t border-stone-850 space-y-1">
                <span className="text-[10px] font-mono text-stone-500 block">العناصر السائدة:</span>
                <div className="flex flex-wrap gap-1">
                  {period.dominantElements.map((elem, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-300"
                    >
                      {elem}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Technical Evolution & Modernization Roadmap */}
      <section className="p-7 rounded-3xl border border-stone-800 bg-stone-900/80 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base sm:text-lg font-bold text-stone-100">
                خطة تطوير وتحديث تقنيات محرك الصوت (Audio Engine Technology Roadmap)
              </h2>
            </div>
            <span className="text-xs text-stone-400 mt-0.5 block">
              خارطة طريق هندسية شاملة ترتقي بالمحرك من التوليد الإجرائي البسيط إلى المعالجة العصبية المكانية ثلاثية الأبعاد
            </span>
          </div>

          {/* Phase Selector Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {AUDIO_ENGINE_EVOLUTION_PLAN.map((phase) => (
              <button
                key={phase.phaseNumber}
                onClick={() => setActivePlanTab(phase.phaseNumber)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-colors ${
                  activePlanTab === phase.phaseNumber
                    ? 'bg-emerald-600 text-stone-950'
                    : 'bg-stone-850 text-stone-400'
                }`}
              >
                المرحلة {phase.phaseNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Phase Detailed View */}
        {(() => {
          const phase = AUDIO_ENGINE_EVOLUTION_PLAN.find((p) => p.phaseNumber === activePlanTab) || AUDIO_ENGINE_EVOLUTION_PLAN[0];

          return (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-mono text-emerald-400">المرحلة الهندسية {phase.phaseNumber}:</span>
                  <h3 className="text-base sm:text-lg font-bold text-stone-100">{phase.titleAr}</h3>
                </div>
                <span className="text-xs font-mono text-stone-300 bg-stone-950 px-3 py-1 rounded-xl border border-stone-800">
                  الجدول الزمني: {phase.timelineAr}
                </span>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed max-w-3xl">
                {phase.focusAr}
              </p>

              <div className="p-5 rounded-2xl bg-stone-950 border border-stone-850 space-y-3">
                <span className="text-xs font-bold text-stone-200 block font-mono">
                  الابتكارات التقنية في هذه المرحلة (Key Technical Innovations):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {phase.keyInnovations.map((inno, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-stone-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{inno}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-900/60 text-xs flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-emerald-400 font-bold block">الأثر المعماري والسكني:</span>
                  <span className="text-stone-300">{phase.architecturalImpactAr}</span>
                </div>
              </div>
            </div>
          );
        })()}
      </section>
    </div>
  );
}
