'use client';

import React, { useState } from 'react';
import { Mic, MicOff, Volume2, ShieldAlert, Activity, Sparkles, HelpCircle } from 'lucide-react';
import { VadConfig, VadStatus, getVadManager } from '@/lib/vad-engine';

interface VadDuckingViewProps {
  vadStatus: VadStatus;
  onToggleMic: () => void;
  onSimulateSpeech: (active: boolean) => void;
  onPulseSimulation: () => void;
  config: VadConfig;
  onConfigChange: (cfg: Partial<VadConfig>) => void;
}

export function VadDuckingView({
  vadStatus,
  onToggleMic,
  onSimulateSpeech,
  onPulseSimulation,
  config,
  onConfigChange,
}: VadDuckingViewProps) {
  const [showHelp, setShowHelp] = useState(false);

  // Meter percentage from -90dB (0%) to 0dB (100%)
  const meterPercent = Math.min(100, Math.max(0, ((vadStatus.currentDb + 90) / 90) * 100));
  const thresholdPercent = Math.min(100, Math.max(0, ((config.sensitivityThresholdDb + 90) / 90) * 100));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header and Abstract explanation */}
      <section className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>خوارزمية كشف الكلام والتنظيم الذكي (VAD & Smart Audio Ducking)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100">
              التنظيم الذكي لمستوى الصوت وكشف التحدث
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mt-1">
              يراقب النظام الحيز الصوتي للغرفة؛ وحين يبدأ أحد أفراد المنزل بالتحدث، يخفض النظام أصوات الطبيعة تلقائياً
              بسلاسة وبدون انقطاع فجائي، ثم يعيدها تدريجياً بعد انتهاء الحوار.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-2 rounded-lg border border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200 transition-colors"
              title="شرح المفهوم العلمي"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleMic}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                vadStatus.isListening
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold'
              }`}
            >
              {vadStatus.isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>إيقاف استشعار الميكروفون</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>تفعيل الاستشعار الحي (Microphone VAD)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {vadStatus.micError && (
          <div className="p-3 rounded-lg border border-rose-800/80 bg-rose-950/40 text-xs text-rose-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{vadStatus.micError} — يمكنك استخدام وضع المحاكاة التفاعلية أدناه لاختبار كشف الكلام فوراً دون الحاجة لميكروفون.</span>
          </div>
        )}

        {showHelp && (
          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 text-xs text-stone-300 space-y-2">
            <div className="font-semibold text-emerald-400">كيف يعمل التنظيم الذكي (Smart Audio Ducking)؟</div>
            <p className="leading-relaxed text-stone-400">
              في الأنظمة الصوتية التقليدية، قد يضطر السكان إلى رفع أصواتهم للتغلب على خرير الماء أو حفيف النسيم،
              مما يسبب إرهاقاً للأحبال الصوتية ويشوش على التواصل الأسري.
              نظامنا يحلل النطاق الترددي البشري (300Hz - 3400Hz). بمجرد اكتشاف طاقة صوتية بشرية متسقة،
              يخفض مستوى الصوت العام بمقدار <span className="text-emerald-400 font-mono">18dB</span> خلال <span className="text-emerald-400 font-mono">150ms</span> (الهجوم - Attack)،
              ويحتفظ بالمستوى المنخفض أثناء فترات الصمت القصيرة بين الجمل (الاحتفاظ - Hold)،
              ثم يستعيد الطبيعة تدريجياً خلال <span className="text-emerald-400 font-mono">1.5s</span> (التحرير - Release).
            </p>
          </div>
        )}
      </section>

      {/* Real-time Meter & Status Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Live dB Meter & State */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h2 className="text-base font-semibold text-stone-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>مؤشر رصد الطاقة الصوتية اللحظية (RMS Audio Meter)</span>
              </h2>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                vadStatus.isDucked
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}>
                {vadStatus.isDucked ? 'منظّم هابط (Ducking Active)' : 'استماع اسمي (Nominal)'}
              </span>
            </div>

            {/* dB Level Meter Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-stone-400">
                <span>المستوى الحالي: <span className="text-stone-200 tabular-nums font-semibold">{vadStatus.currentDb} dB</span></span>
                <span>عتبة الحساسية: <span className="text-emerald-400 tabular-nums font-semibold">{config.sensitivityThresholdDb} dB</span></span>
              </div>

              <div className="relative h-6 bg-stone-950 rounded-lg overflow-hidden border border-stone-800 p-0.5">
                {/* Threshold Marker Needle */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-20 shadow-sm"
                  style={{ right: `${thresholdPercent}%` }}
                />

                {/* Fill bar */}
                <div
                  className={`h-full rounded-md transition-all duration-75 ${
                    vadStatus.isSpeaking ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${meterPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
                <span>-90 dB (صمت تام)</span>
                <span>-60 dB (نسيم خافت)</span>
                <span>-40 dB (عتبة الكلام)</span>
                <span>-20 dB (محادثة واضحة)</span>
                <span>0 dB</span>
              </div>
            </div>

            {/* Vocal Energy & Ducking Attenuation Badges */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1">
                <span className="text-xs text-stone-400">احتمالية التحدث البشري:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono text-stone-100 tabular-nums">
                    {vadStatus.currentSpeechScore}%
                  </span>
                  <span className={`text-xs ${vadStatus.isSpeaking ? 'text-amber-400 font-semibold' : 'text-stone-500'}`}>
                    {vadStatus.isSpeaking ? 'تم رصد كلام' : 'لا يوجد حديث'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1">
                <span className="text-xs text-stone-400">عامل الكتم التلقائي (Gain):</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                    {Math.round(vadStatus.duckingEnvelope * 100)}%
                  </span>
                  <span className="text-xs font-mono text-stone-500">
                    {vadStatus.isDucked ? `(${config.duckingDepthDb} dB)` : '(0 dB)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Simulation Sandbox */}
            <div className="pt-3 border-t border-stone-800 space-y-2">
              <span className="text-xs text-stone-400 font-mono block">
                محاكاة واختبار فوري للتنظيم الذكي (Sandbox):
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={onPulseSimulation}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-100 text-xs font-semibold transition-all border border-stone-700"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>محاكاة جملة كلامية (نبضة 2.5 ثانية)</span>
                </button>

                <button
                  onMouseDown={() => onSimulateSpeech(true)}
                  onMouseUp={() => onSimulateSpeech(false)}
                  onTouchStart={() => onSimulateSpeech(true)}
                  onTouchEnd={() => onSimulateSpeech(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 text-xs font-semibold transition-all border border-amber-800/80 active:scale-95"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>اضغط مطولاً للمحاكاة (Hold to Speak)</span>
                </button>
              </div>
              <p className="text-[11px] text-stone-500">
                اضغط لتجربة كيف ينخفض صوت خرير الماء والنسيم على الفور ويعود بهدوء تلقائي.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Envelope Curve & Calibration Sliders */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 space-y-5">
            <h2 className="text-base font-semibold text-stone-100 pb-3 border-b border-stone-800">
              معايرة المغلف الزمني (Envelope Calibration)
            </h2>

            {/* Envelope Graph Visualization */}
            <div className="relative h-28 bg-stone-950 rounded-xl border border-stone-800 p-2 overflow-hidden flex flex-col justify-end">
              <svg className="w-full h-20" viewBox="0 0 300 80" preserveAspectRatio="none">
                {/* Baseline 100% */}
                <line x1="0" y1="10" x2="300" y2="10" stroke="#44403c" strokeDasharray="3 3" />
                {/* Ducked -18dB Level */}
                <line x1="0" y1="65" x2="300" y2="65" stroke="#78716c" strokeDasharray="2 2" />

                {/* Envelope path: Nominal -> Attack drop -> Hold floor -> Release ramp up */}
                <path
                  d="M 10 10 L 60 10 L 80 65 L 170 65 L 220 10 L 290 10"
                  fill="none"
                  stroke={vadStatus.isDucked ? '#f59e0b' : '#10b981'}
                  strokeWidth="2.5"
                />

                {/* Animated Playhead dot */}
                <circle
                  cx={vadStatus.isDucked ? '130' : '35'}
                  cy={vadStatus.isDucked ? '65' : '10'}
                  r="4"
                  fill="#ffffff"
                  className="transition-all duration-300"
                />
              </svg>

              <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 pt-1">
                <span>استماع عادي</span>
                <span>هجوم ({config.attackMs}ms)</span>
                <span>احتفاظ ({config.holdMs}ms)</span>
                <span>تحرير ({config.releaseMs}ms)</span>
              </div>
            </div>

            {/* Calibration Controls */}
            <div className="space-y-4">
              {/* Sensitivity Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-stone-400">
                  <span>حساسية الميكروفون (Threshold):</span>
                  <span className="text-emerald-400 font-semibold tabular-nums">{config.sensitivityThresholdDb} dB</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="-20"
                  step="1"
                  value={config.sensitivityThresholdDb}
                  onChange={(e) => onConfigChange({ sensitivityThresholdDb: parseInt(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                />
                <span className="text-[10px] text-stone-500 block">
                  كلما كانت القيمة أقل (مثلاً -50dB)، زادت سرعة استجابة النظام للأصوات الهامسة.
                </span>
              </div>

              {/* Ducking Depth Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-stone-400">
                  <span>عمق خفض الصوت (Ducking Depth):</span>
                  <span className="text-amber-400 font-semibold tabular-nums">{config.duckingDepthDb} dB</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="-6"
                  step="1"
                  value={config.duckingDepthDb}
                  onChange={(e) => onConfigChange({ duckingDepthDb: parseInt(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                />
                <span className="text-[10px] text-stone-500 block">
                  القيمة الموصى بها لمجالس المنازل هي -18dB للحفاظ على لمسة خفيفة دون تشويش.
                </span>
              </div>

              {/* Hold Duration Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-stone-400">
                  <span>فترة الاحتفاظ بالهدوء بعد الكلام (Hold):</span>
                  <span className="text-stone-200 font-semibold tabular-nums">{config.holdMs} ms</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="4000"
                  step="100"
                  value={config.holdMs}
                  onChange={(e) => onConfigChange({ holdMs: parseInt(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                />
                <span className="text-[10px] text-stone-500 block">
                  تمنع ارتفاع الصوت المفاجئ بين الوقفات الطبيعية في حديث المتحدثين.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
