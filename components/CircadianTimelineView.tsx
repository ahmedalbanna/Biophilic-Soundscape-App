'use client';

import React from 'react';
import { Sun, Moon, Sunrise, Sunset, Clock, Sparkles, Users, BookOpen, HeartPulse, Check } from 'lucide-react';
import { CIRCADIAN_PHASES, SOCIAL_PRESETS, CircadianPhase, SocialPreset, getPhaseForHour } from '@/lib/circadian-data';

interface CircadianTimelineViewProps {
  currentHour: number;
  onHourChange: (hour: number) => void;
  isRealtimeSync: boolean;
  onToggleRealtimeSync: () => void;
  activePhase: CircadianPhase;
  onApplyPhasePreset: (phase: CircadianPhase) => void;
  activeSocialPresetId: string | null;
  onApplySocialPreset: (preset: SocialPreset) => void;
}

export function CircadianTimelineView({
  currentHour,
  onHourChange,
  isRealtimeSync,
  onToggleRealtimeSync,
  activePhase,
  onApplyPhasePreset,
  activeSocialPresetId,
  onApplySocialPreset,
}: CircadianTimelineViewProps) {
  const formatTime = (h: number) => {
    const hours = Math.floor(h);
    const minutes = Math.floor((h - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getPhaseIcon = (id: string) => {
    switch (id) {
      case 'dawn':
        return <Sunrise className="w-5 h-5 text-amber-400" />;
      case 'midday':
        return <Sun className="w-5 h-5 text-yellow-400" />;
      case 'afternoon':
        return <Sunset className="w-5 h-5 text-orange-400" />;
      case 'evening':
        return <Moon className="w-5 h-5 text-indigo-400" />;
      case 'night':
        return <Moon className="w-5 h-5 text-blue-400" />;
      default:
        return <Sun className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getSocialIcon = (id: string) => {
    switch (id) {
      case 'serene_friday':
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      case 'hospitality':
        return <Users className="w-4 h-4 text-amber-400" />;
      case 'deep_study':
        return <BookOpen className="w-4 h-4 text-sky-400" />;
      case 'stress_recovery':
        return <HeartPulse className="w-4 h-4 text-rose-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <section className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>الإيقاع الحيوي والتكيف اليومي (Circadian Adaptation)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100">
              الدورة البيوفيلية على مدار 24 ساعة
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mt-1">
              يتغير النبض الصوتي للمنزل بتناغم مع حركة الشمس والساعة البيولوجية لسكان المنزل؛
              من طيور الفجر المنشطة بلطف، إلى تدفق التركيز وقت الظهيرة، وهدوء السكينة المسائية، ثم القناع الصوتي الحامي للنوم العميق.
            </p>
          </div>

          {/* Sync Button */}
          <button
            onClick={onToggleRealtimeSync}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all self-start sm:self-auto ${
              isRealtimeSync
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-stone-800 text-stone-300 border border-stone-700 hover:bg-stone-750'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>{isRealtimeSync ? 'مربوط بالتوقيت الحي للمنزل' : 'تحكم يدوي بالتوقيت'}</span>
          </button>
        </div>

        {/* 24-Hour Slider */}
        <div className="p-5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-stone-900 border border-stone-800">
                {getPhaseIcon(activePhase.id)}
              </div>
              <div>
                <div className="text-sm font-bold text-stone-100 flex items-center gap-2">
                  <span>{activePhase.nameAr}</span>
                  <span className="text-xs font-mono text-stone-400 font-normal">({activePhase.timeRange})</span>
                </div>
                <div className="text-xs text-emerald-400 font-medium">{activePhase.biologicalGoalAr}</div>
              </div>
            </div>

            <div className="text-left font-mono">
              <span className="text-2xl font-bold text-stone-100 tabular-nums">{formatTime(currentHour)}</span>
              <span className="text-xs text-stone-500 block">التوقيت المحدد</span>
            </div>
          </div>

          {/* Scrubber */}
          <div className="space-y-1.5">
            <input
              type="range"
              min="0"
              max="23.9"
              step="0.1"
              value={currentHour}
              onChange={(e) => {
                if (isRealtimeSync) onToggleRealtimeSync();
                onHourChange(parseFloat(e.target.value));
              }}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-stone-800 rounded-lg"
            />
            <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
              <span>00:00 (ليل عميق)</span>
              <span>06:00 (الفجر)</span>
              <span>12:00 (الظهيرة)</span>
              <span>18:00 (المغيب)</span>
              <span>23:59 (المساء)</span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
            <p className="text-stone-400 text-xs leading-relaxed max-w-xl">
              {activePhase.descriptionAr}
            </p>
            <button
              onClick={() => onApplyPhasePreset(activePhase)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs transition-colors shadow-sm"
            >
              مزامنة توليفة {activePhase.nameAr} الآن
            </button>
          </div>
        </div>
      </section>

      {/* 5 Circadian Phases Breakdown */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-100">
            المراحل الحيوية الخمس لليوم (The 5 Diurnal Phases)
          </h2>
          <span className="text-xs text-stone-500 font-mono">· مستندة لمعايير WELL Building Standard</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {CIRCADIAN_PHASES.map((phase) => {
            const isSelected = activePhase.id === phase.id;
            return (
              <div
                key={phase.id}
                onClick={() => {
                  onHourChange(phase.startHour);
                  onApplyPhasePreset(phase);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-stone-900 border-emerald-600/80 shadow-md ring-1 ring-emerald-500/30'
                    : 'bg-stone-950/60 border-stone-800/80 hover:border-stone-700 hover:bg-stone-900/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-stone-900 border border-stone-800">
                    {getPhaseIcon(phase.id)}
                  </div>
                  <span className="text-[11px] font-mono text-stone-400 tabular-nums">{phase.timeRange}</span>
                </div>

                <h3 className="text-sm font-semibold text-stone-100 mb-1">{phase.nameAr}</h3>
                <p className="text-[11px] text-stone-400 mb-3 leading-snug line-clamp-2">
                  {phase.biologicalGoalAr}
                </p>

                {/* Layer bar representation */}
                <div className="space-y-1 pt-2 border-t border-stone-800/80 text-[10px] font-mono text-stone-400">
                  <div className="flex justify-between">
                    <span>مياه:</span>
                    <span>{Math.round(phase.layerPresets.water * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>نسيم:</span>
                    <span>{Math.round(phase.layerPresets.breeze * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>طيور:</span>
                    <span>{Math.round(phase.stochasticDensity.birds * 100)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Cultural & Social Context Presets */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-stone-100">
            السياق المجتمعي والأنماط المعيشية (Sociocultural Modes)
          </h2>
          <p className="text-xs text-stone-400">
            أوضاع مخصصة للمناسبات والعادات الأسرية تضبط مستويات الحساسية والكتم تلقائياً
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SOCIAL_PRESETS.map((preset) => {
            const isActive = activeSocialPresetId === preset.id;
            return (
              <div
                key={preset.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isActive
                    ? 'bg-stone-900 border-amber-600/80 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-stone-950/60 border-stone-800/80 hover:border-stone-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                      {getSocialIcon(preset.id)}
                    </div>
                    {isActive && (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded">
                        <Check className="w-3 h-3" />
                        <span>مفعّل</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-stone-100">{preset.nameAr}</h3>
                  <p className="text-xs text-stone-400 leading-relaxed min-h-[48px]">
                    {preset.descriptionAr}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-800/80 mt-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
                    <span>حساسية VAD:</span>
                    <span className="text-stone-300">
                      {preset.duckingSensitivityOffset >= 0 ? `+${preset.duckingSensitivityOffset}dB` : `${preset.duckingSensitivityOffset}dB`}
                    </span>
                  </div>

                  <button
                    onClick={() => onApplySocialPreset(preset)}
                    className={`w-full py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-500 text-stone-950 font-bold'
                        : 'bg-stone-800 hover:bg-stone-750 text-stone-200'
                    }`}
                  >
                    {isActive ? 'الوضع النشط حالياً' : 'تفعيل هذا الوضع'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
