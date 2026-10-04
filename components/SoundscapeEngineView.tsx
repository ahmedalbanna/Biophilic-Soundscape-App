'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Pause, RefreshCw, Sparkles, Sliders, Waves, Wind, CloudRain, Droplets } from 'lucide-react';
import { ContinuousLayerId, StochasticEventId, AcousticEventLog, getAudioEngine } from '@/lib/audio-engine';
import { Visualizer } from './Visualizer';

interface SoundscapeEngineViewProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  continuousLayers: {
    id: ContinuousLayerId;
    nameAr: string;
    nameEn: string;
    volume: number;
    enabled: boolean;
    description: string;
    icon: string;
  }[];
  onLayerChange: (id: ContinuousLayerId, volume: number, enabled: boolean) => void;
  stochasticEvents: AcousticEventLog[];
  isDucked: boolean;
  duckingEnvelope: number;
  onTriggerEvent: (type: StochasticEventId) => void;
}

export function SoundscapeEngineView({
  isPlaying,
  onTogglePlay,
  continuousLayers,
  onLayerChange,
  stochasticEvents,
  isDucked,
  duckingEnvelope,
  onTriggerEvent,
}: SoundscapeEngineViewProps) {
  const getLayerIcon = (id: ContinuousLayerId) => {
    switch (id) {
      case 'water':
        return <Droplets className="w-4 h-4 text-emerald-400" />;
      case 'breeze':
        return <Wind className="w-4 h-4 text-teal-400" />;
      case 'rain':
        return <CloudRain className="w-4 h-4 text-cyan-400" />;
      case 'ocean':
        return <Waves className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Architectural Showcase */}
      <section className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-900/60 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 space-y-4 z-10">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>تقنية التراكب الديناميكي (Dynamic Overlap Synthesis)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-stone-100 leading-snug">
              البيئة الصوتية الحيوية التكيفية داخل مسكنك
            </h1>

            <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-xl">
              نظام صوتي معماري متطور يحوّل أرجاء المنزل إلى واحة حية تتفاعل عضوياً مع فترات اليوم المختلفة.
              يدمج خلفيات صوتية مستمرة مع مؤثرات طبيعية عشوائية مدروسة لتجنب الإجهاد السمعي وتخفيف التوتر العصبي.
            </p>

            {/* Quick Metrics / Status without pills */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-stone-400 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-stone-500">حالة البث:</span>
                <span className={isPlaying ? 'text-emerald-400 font-medium' : 'text-stone-400'}>
                  {isPlaying ? 'بث حي متجدد (96kHz)' : 'متوقف مؤقتاً'}
                </span>
              </div>
              <span className="text-stone-700">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-stone-500">منع التكرار:</span>
                <span className="text-emerald-400 font-medium">خوارزمية ستوكاستية نشطة</span>
              </div>
              <span className="text-stone-700">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-stone-500">تغطية الغرف:</span>
                <span className="text-stone-200">4 مناطق مستقلة</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={onTogglePlay}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-md ${
                  isPlaying
                    ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>إيقاف المحرك مؤقتاً</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>بدء الاستماع الحي الآن</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onTriggerEvent('birds')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-700 hover:border-emerald-600 bg-stone-900/80 hover:bg-stone-850 text-stone-200 text-xs transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>إطلاق طائر الفجر تجريبياً</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative h-64 sm:h-80 lg:h-full min-h-[300px] overflow-hidden">
            <Image
              src="/images/biophilic_home_interior_1791142489477.jpg"
              alt="Biophilic Interior Architecture with Hidden Speakers"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 40vw"
              priority
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-stone-950/90 via-stone-950/40 to-transparent" />
            <div className="absolute bottom-3 right-4 text-[11px] text-stone-400 bg-stone-950/70 px-2 py-0.5 rounded backdrop-blur-xs">
              سماعات شريطية معمارية مدمجة بسقف خشب الأرز
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Web Audio Spectrum & Ducking Attenuation Visualizer */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-stone-200">المرسم الطيفي وتحليل الترددات الحية</h2>
            <span className="text-xs text-stone-500 font-mono">· Web Audio Real-time FFT</span>
          </div>
          {isDucked && (
            <span className="text-xs font-mono text-amber-400 animate-pulse">
              [ كتم تلقائي نشط لكشف الكلام -18dB ]
            </span>
          )}
        </div>
        <Visualizer isDucked={isDucked} duckingEnvelope={duckingEnvelope} />
      </section>

      {/* Main Grid: Layer Mixer + Stochastic Foreground Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Continuous Nature Beds Mixer */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <div>
              <h2 className="text-base font-semibold text-stone-100">
                طبقات الخلفية الصوتية المستمرة (Continuous Beds)
              </h2>
              <p className="text-xs text-stone-400">
                توليد إجرائي عضوي بدون تسجيلات متكررة مسبقة، لتفادي الإرهاق السمعي
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-stone-400 font-mono">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>ميكسر رقمي 4 قنوات</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {continuousLayers.map((layer) => (
              <div
                key={layer.id}
                className={`p-4 rounded-xl border transition-all ${
                  layer.enabled
                    ? 'bg-stone-900/70 border-stone-700/80 shadow-sm'
                    : 'bg-stone-950/40 border-stone-800/50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-stone-800 border border-stone-700/60">
                      {getLayerIcon(layer.id)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-stone-200">{layer.nameAr}</h3>
                      <p className="text-[11px] text-stone-400">{layer.nameEn}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onLayerChange(layer.id, layer.volume, !layer.enabled)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                      layer.enabled
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-stone-800 text-stone-400 border border-stone-700'
                    }`}
                  >
                    {layer.enabled ? 'نشط' : 'معطّل'}
                  </button>
                </div>

                <p className="text-xs text-stone-400 mb-3 leading-relaxed min-h-[32px]">
                  {layer.description}
                </p>

                {/* Volume Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono text-stone-400">
                    <span>مستوى التدفق:</span>
                    <span className="tabular-nums text-stone-200">
                      {layer.enabled ? `${Math.round(layer.volume * 100)}%` : '0%'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    disabled={!layer.enabled}
                    value={layer.volume}
                    onChange={(e) => onLayerChange(layer.id, parseFloat(e.target.value), layer.enabled)}
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Acoustic Theory Info Box */}
          <div className="p-4 rounded-xl border border-stone-800 bg-stone-900/40 text-xs text-stone-300 space-y-1.5">
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <span>لماذا تقنية التراكب الديناميكي وليس المقاطع الصوتية المسجلة المتكررة؟</span>
            </div>
            <p className="leading-relaxed text-stone-400">
              الدماغ البشري مزود بنظام فائق لرصد الأنماط (Pattern Recognition). عند الاستماع لمقطع طبيعي مكرر (Loop)،
              يلاحظ الجهاز العصبي التكرار بعد دقائق معدودة مما يتحول إلى مصدر إجهاد نفسي غير واعي (Auditory Fatigue).
              يقوم محركنا بتوليد موجات عشوائية دقيقة (Pink/Brownian Noise Modulation) مع ترددات رنين متغيرة باستمرار،
              فلا تتكرر ثانية صوتية واحدة إطلاقاً.
            </p>
          </div>
        </div>

        {/* Right Column (4 cols): Stochastic Foreground Events & Live Feed */}
        <div className="lg:col-span-4 space-y-5">
          <div className="pb-2 border-b border-stone-800">
            <h2 className="text-base font-semibold text-stone-100">
              الأحداث العشوائية المترابطة (Stochastic Events)
            </h2>
            <p className="text-xs text-stone-400">
              مؤثرات متفرقة تظهر بتوزيع احتمالي يمنح المكان نبضاً حياً
            </p>
          </div>

          {/* Trigger Buttons */}
          <div className="space-y-2">
            <span className="text-xs text-stone-400 font-mono block">اختبار المؤثرات يدوياً:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onTriggerEvent('birds')}
                className="p-2.5 rounded-lg border border-stone-800 bg-stone-900/90 hover:border-emerald-600 hover:bg-stone-850 text-right transition-all group"
              >
                <div className="text-xs font-semibold text-stone-200 group-hover:text-emerald-400">
                  🐦 زقزقة طائر الفجر
                </div>
                <div className="text-[10px] text-stone-400">تعديل ترددي 2.8kHz</div>
              </button>

              <button
                onClick={() => onTriggerEvent('leaves')}
                className="p-2.5 rounded-lg border border-stone-800 bg-stone-900/90 hover:border-teal-600 hover:bg-stone-850 text-right transition-all group"
              >
                <div className="text-xs font-semibold text-stone-200 group-hover:text-teal-400">
                  🍃 حفيف الأوراق
                </div>
                <div className="text-[10px] text-stone-400">حركة النسيم بين الشجر</div>
              </button>

              <button
                onClick={() => onTriggerEvent('crickets')}
                className="p-2.5 rounded-lg border border-stone-800 bg-stone-900/90 hover:border-amber-600 hover:bg-stone-850 text-right transition-all group"
              >
                <div className="text-xs font-semibold text-stone-200 group-hover:text-amber-400">
                  🦗 صرار الليل
                </div>
                <div className="text-[10px] text-stone-400">نبضات ليلية هادئة</div>
              </button>

              <button
                onClick={() => onTriggerEvent('chimes')}
                className="p-2.5 rounded-lg border border-stone-800 bg-stone-900/90 hover:border-sky-600 hover:bg-stone-850 text-right transition-all group"
              >
                <div className="text-xs font-semibold text-stone-200 group-hover:text-sky-400">
                  🎐 رنين أجراس الرياح
                </div>
                <div className="text-[10px] text-stone-400">هارمونيكس سلم خماسي</div>
              </button>
            </div>
          </div>

          {/* Live Stochastic Event Stream */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
              <span>سجل التوليد الفراغي الحي:</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>رصد مستمر</span>
              </span>
            </div>

            <div className="h-64 rounded-xl border border-stone-800 bg-stone-950/70 p-3 overflow-y-auto space-y-2">
              {stochasticEvents.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-stone-500 text-xs">
                  <RefreshCw className="w-5 h-5 mb-2 animate-spin text-stone-600" />
                  <span>بانتظار الأحداث الصوتية التالية...</span>
                  <span className="text-[11px] text-stone-600 mt-1">تطلق الخوارزمية حدثاً كل عدة ثوانٍ تلقائياً</span>
                </div>
              ) : (
                stochasticEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-2 rounded-lg bg-stone-900/80 border border-stone-800/80 text-xs space-y-1 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-200">{ev.labelAr}</span>
                      <span className="text-[11px] font-mono text-stone-400 tabular-nums">
                        {ev.timestamp}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-stone-400">
                      <span>التردد: {ev.pitch}Hz</span>
                      <span>·</span>
                      <span>التوزيع الفراغي (Pan): {ev.pan > 0 ? `يمين +${ev.pan}` : ev.pan < 0 ? `يسار ${ev.pan}` : 'وسط'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
