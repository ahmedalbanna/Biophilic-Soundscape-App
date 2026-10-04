'use client';

import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Clock,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Check,
  Bell,
  Volume2,
  Sliders,
  Flame,
  ShieldCheck,
  Feather,
  Waves,
  Zap,
} from 'lucide-react';
import {
  SunriseAlarmConfig,
  SleepInductionConfig,
  INITIAL_ALARM_CONFIG,
  INITIAL_SLEEP_CONFIG,
  getSunriseEnvelope,
  getSleepEnvelope,
  AwakeningPhase,
  SleepInductionPhase,
} from '@/lib/circadian-alarm';
import { getAudioEngine } from '@/lib/audio-engine';

interface CircadianSunriseAlarmViewProps {
  onEngineStartRequest: () => void;
  isEnginePlaying: boolean;
  onLayerChange: (layerId: 'water' | 'breeze' | 'rain' | 'ocean', volume: number, enabled: boolean) => void;
  onMasterVolumeChange: (vol: number) => void;
}

export function CircadianSunriseAlarmView({
  onEngineStartRequest,
  isEnginePlaying,
  onLayerChange,
  onMasterVolumeChange,
}: CircadianSunriseAlarmViewProps) {
  const [alarmConfig, setAlarmConfig] = useState<SunriseAlarmConfig>(INITIAL_ALARM_CONFIG);
  const [sleepConfig, setSleepConfig] = useState<SleepInductionConfig>(INITIAL_SLEEP_CONFIG);

  // Fast 30s Sunrise Simulation State
  const [isSimulatingSunrise, setIsSimulatingSunrise] = useState<boolean>(false);
  const [sunriseSimProgress, setSunriseSimProgress] = useState<number>(0); // 0 to 1

  // Sleep Induction Timer State
  const [isSleepTimerActive, setIsSleepTimerActive] = useState<boolean>(false);
  const [sleepRemainingSeconds, setSleepRemainingSeconds] = useState<number>(45 * 60);

  // Sunrise Live Simulation Loop (30 seconds duration)
  useEffect(() => {
    if (!isSimulatingSunrise) return;

    let animFrame: number;
    const simDurationMs = 30000; // 30 seconds
    const startTimestamp = performance.now();

    const loop = (now: number) => {
      const elapsed = now - startTimestamp;
      const progress = Math.min(1.0, elapsed / simDurationMs);
      setSunriseSimProgress(progress);

      const envelope = getSunriseEnvelope(progress);
      const engine = getAudioEngine();

      // Apply layers smoothly to engine
      engine.setLayerVolume('water', envelope.waterVol, true);
      engine.setLayerVolume('breeze', envelope.breezeVol, true);
      engine.setLayerVolume('rain', 0.0, false);
      engine.setLayerVolume('ocean', 0.0, false);

      onLayerChange('water', envelope.waterVol, true);
      onLayerChange('breeze', envelope.breezeVol, true);
      onLayerChange('rain', 0.0, false);
      onLayerChange('ocean', 0.0, false);

      // Trigger stochastic birds based on probability
      if (Math.random() < envelope.birdProbability * 0.08) {
        engine.triggerProceduralBird();
      }

      onMasterVolumeChange(envelope.volume);

      if (progress < 1.0) {
        animFrame = requestAnimationFrame(loop);
      } else {
        setIsSimulatingSunrise(false);
      }
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, [isSimulatingSunrise, onLayerChange, onMasterVolumeChange]);

  // Sleep Timer Countdown & Volume Fader
  useEffect(() => {
    if (!isSleepTimerActive) return;

    const interval = setInterval(() => {
      setSleepRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsSleepTimerActive(false);
          const engine = getAudioEngine();
          engine.pause();
          return 0;
        }

        const totalSecs = sleepConfig.durationMinutes * 60;
        const progress = 1.0 - (prev - 1) / totalSecs;
        const env = getSleepEnvelope(
          progress,
          sleepConfig.startVolumePct / 100,
          sleepConfig.finalVolumePct / 100
        );

        const engine = getAudioEngine();
        engine.setLayerVolume('ocean', env.oceanVol, true);
        engine.setLayerVolume('breeze', env.breezeVol, true);
        engine.setLayerVolume('water', env.waterVol, env.waterVol > 0.05);

        onLayerChange('ocean', env.oceanVol, true);
        onLayerChange('breeze', env.breezeVol, true);
        onLayerChange('water', env.waterVol, env.waterVol > 0.05);

        onMasterVolumeChange(env.volume);

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSleepTimerActive, sleepConfig, onLayerChange, onMasterVolumeChange]);

  // Handle Start Sunrise Simulation
  const handleStartSunriseSim = () => {
    if (!isEnginePlaying) {
      onEngineStartRequest();
    }
    setSunriseSimProgress(0);
    setIsSimulatingSunrise(true);
  };

  const handleStopSunriseSim = () => {
    setIsSimulatingSunrise(false);
    setSunriseSimProgress(0);
  };

  // Handle Start Sleep Mode
  const handleStartSleepMode = () => {
    if (!isEnginePlaying) {
      onEngineStartRequest();
    }
    setSleepRemainingSeconds(sleepConfig.durationMinutes * 60);
    setIsSleepTimerActive(true);
  };

  const handleCancelSleepMode = () => {
    setIsSleepTimerActive(false);
  };

  const activeEnvelope = getSunriseEnvelope(sunriseSimProgress);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <section className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>اليقظة الطبيعية وحث النوم (Natural Sunrise Alarm & Sleep Induction)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100">
              منبه الفجر بالتدفق البيئي التدريجي وبروتوكول النوم العميق
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mt-1">
              استبدال الرنين المفاجئ المزعج بمنبه صوتي-ضوئي تدريجي يحاكي بزوغ الشمس الفعلي، مع مؤقت هبوط مدروس
              يقلص الأفكار المتسارعة ويساعد على النوم خلال 45 دقيقة.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono text-stone-300 bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800 flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>حالة المنبه: <strong>{alarmConfig.enabled ? 'مفعل وجاهز' : 'متوقف مؤقتاً'}</strong></span>
            </span>
          </div>
        </div>
      </section>

      {/* Sunrise Awakening Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Giant Animated Horizon & Live Simulation Deck (7 cols) */}
        <div className="lg:col-span-7 p-7 rounded-3xl border border-stone-800 bg-stone-900/80 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
          {/* Horizon Sunrise Glow Background */}
          <div
            className="absolute bottom-0 inset-x-0 h-44 blur-3xl opacity-35 pointer-events-none transition-all duration-1000"
            style={{
              background: `radial-gradient(ellipse at bottom, #f59e0b, #ea580c, #0c0a09)`,
              transform: `scaleY(${0.4 + sunriseSimProgress * 0.8})`,
            }}
          />

          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-stone-400">محاكاة الشروق الصوتي-الضوئي:</span>
              <span className="text-xs font-mono text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-800">
                {activeEnvelope.phase === 'pre_dawn_stirring'
                  ? 'المرحلة 1: تململ ما قبل الفجر'
                  : activeEnvelope.phase === 'golden_rise'
                  ? 'المرحلة 2: البزوغ الذهبي'
                  : 'المرحلة 3: النهار واليقظة الكاملة'}
              </span>
            </div>

            <div className="text-2xl sm:text-3xl font-bold text-stone-100">
              {isSimulatingSunrise ? 'المحاكاة السريعة جارية الآن...' : 'تجربة يقظة منعشة بدون صدمة أدرينالين'}
            </div>

            <p className="text-xs text-stone-300 leading-relaxed max-w-xl">
              قبل موعد الفجر بـ 20 دقيقة، يبدأ نسيم خافت جداً مع خرير ماء هادئ، ثم يرتفع تدريجياً لتبدأ العصافير
              بالتغريد بنعومة بالتزامن مع تدرج الإضاءة من 1,800K إلى 3,500K.
            </p>
          </div>

          {/* Sunrise Visualizer Bar */}
          <div className="space-y-3 relative z-10 py-2">
            <div className="flex justify-between text-xs font-mono text-stone-400">
              <span className="flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>تقدم قوس الشروق (Sunrise Progress):</span>
              </span>
              <span className="text-stone-200 font-bold">{Math.round(sunriseSimProgress * 100)}%</span>
            </div>

            <div className="w-full h-3 bg-stone-950 rounded-full overflow-hidden p-0.5 border border-stone-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-900 via-amber-500 to-yellow-300 transition-all duration-300 shadow-lg"
                style={{ width: `${Math.max(4, sunriseSimProgress * 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono pt-1 text-stone-400">
              <div className="p-2 rounded-xl bg-stone-950/80 border border-stone-850">
                <span className="text-stone-500 block">الإضاءة:</span>
                <span className="text-amber-300 font-bold">{activeEnvelope.kelvin}K ({activeEnvelope.brightnessPct}%)</span>
              </div>
              <div className="p-2 rounded-xl bg-stone-950/80 border border-stone-850">
                <span className="text-stone-500 block">شدة الصوت:</span>
                <span className="text-emerald-400 font-bold">{Math.round(activeEnvelope.volume * 100)}%</span>
              </div>
              <div className="p-2 rounded-xl bg-stone-950/80 border border-stone-850">
                <span className="text-stone-500 block">زقزقة الطيور:</span>
                <span className="text-teal-300 font-bold">{Math.round(activeEnvelope.birdProbability * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Simulation Action Button */}
          <div className="pt-2 relative z-10 flex flex-wrap items-center gap-3">
            {isSimulatingSunrise ? (
              <button
                onClick={handleStopSunriseSim}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-stone-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md"
              >
                <Pause className="w-3.5 h-3.5 fill-stone-950" />
                <span>إيقاف المحاكاة السريعة</span>
              </button>
            ) : (
              <button
                onClick={handleStartSunriseSim}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md hover:scale-105"
              >
                <Play className="w-3.5 h-3.5 fill-stone-950" />
                <span>تجربة محاكاة الشروق في 30 ثانية</span>
              </button>
            )}

            <span className="text-[11px] text-stone-500 font-mono">
              · يعرض لك تجربة الاستيقاظ الكاملة من السكون التام إلى ذروة النهار
            </span>
          </div>
        </div>

        {/* Right: Alarm Configuration Controls (5 cols) */}
        <div className="lg:col-span-5 p-7 rounded-3xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-stone-100">إعدادات منبه الفجر الذكي</h2>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={alarmConfig.enabled}
                onChange={(e) => setAlarmConfig({ ...alarmConfig, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>

          {/* Mode Selector */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-stone-400 block">طريقة تحديد موعد الاستيقاظ:</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setAlarmConfig({ ...alarmConfig, mode: 'fajr_relative' })}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  alarmConfig.mode === 'fajr_relative'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold shadow-md'
                    : 'bg-stone-950/60 border-stone-800 text-stone-400'
                }`}
              >
                ربط تلقائي بأذان الفجر
              </button>
              <button
                onClick={() => setAlarmConfig({ ...alarmConfig, mode: 'custom_time' })}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  alarmConfig.mode === 'custom_time'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold shadow-md'
                    : 'bg-stone-950/60 border-stone-800 text-stone-400'
                }`}
              >
                توقيت ساعة مخصص
              </button>
            </div>
          </div>

          {alarmConfig.mode === 'fajr_relative' ? (
            <div className="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-850 space-y-2">
              <div className="flex justify-between text-xs text-stone-300 font-mono">
                <span>البدء التدريجي قبل أذان الفجر بـ:</span>
                <span className="text-amber-400 font-bold">{Math.abs(alarmConfig.fajrOffsetMinutes)} دقيقة</span>
              </div>
              <input
                type="range"
                min={-45}
                max={-10}
                step={5}
                value={alarmConfig.fajrOffsetMinutes}
                onChange={(e) =>
                  setAlarmConfig({ ...alarmConfig, fajrOffsetMinutes: parseInt(e.target.value) })
                }
                className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-[10px] text-stone-500 block">
                مزامنة يومية مباشرة مع إحداثيات المدينة وحسابات الهيئة العامة للمساحة وأم القرى.
              </span>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-850 space-y-2">
              <label className="text-xs text-stone-300 font-mono block">تحديد وقت الاستيقاظ بالساعة:</label>
              <input
                type="time"
                value={alarmConfig.customTimeStr}
                onChange={(e) => setAlarmConfig({ ...alarmConfig, customTimeStr: e.target.value })}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 font-mono text-sm"
              />
            </div>
          )}

          {/* Soundscape Profile Selector */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-stone-400 block">طبيعة كورس الصباح الصوتي:</span>
            <select
              value={alarmConfig.soundscapeProfile}
              onChange={(e) =>
                setAlarmConfig({
                  ...alarmConfig,
                  soundscapeProfile: e.target.value as SunriseAlarmConfig['soundscapeProfile'],
                })
              }
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-stone-200 font-mono"
            >
              <option value="asir_mountain_dawn">غابات عسير وضباب الصباح مع البلبل المغرد</option>
              <option value="ahsa_palm_sunrise">واحة الأحساء وسواقي المياه مع حمام النخيل</option>
              <option value="farasan_sea_dawn">شواطئ جزر فرسان وتكسر الأمواج الفيروزية الهادئة</option>
              <option value="tibetan_golden_wake">رنين أوعية التبت الكريستالية 432Hz مع نسيم الجبال</option>
            </select>
          </div>

          {/* Ramp Duration Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-stone-400">
              <span>مدة الصعود التدريجي (Ramp Time):</span>
              <span className="text-stone-200 font-bold">{alarmConfig.durationMinutes} دقيقة</span>
            </div>
            <input
              type="range"
              min={10}
              max={30}
              step={5}
              value={alarmConfig.durationMinutes}
              onChange={(e) =>
                setAlarmConfig({ ...alarmConfig, durationMinutes: parseInt(e.target.value) })
              }
              className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Sleep Induction Protocol (مؤقت حث النوم والتهدئة الليلية) */}
      <section className="p-7 rounded-3xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base sm:text-lg font-bold text-stone-100">
                بروتوكول حث النوم العميق (Sleep Induction & Fader)
              </h2>
            </div>
            <p className="text-xs text-stone-400 mt-1 max-w-xl">
              تخفيض تدريجي للأصوات ذات التردد العالي، تعزيز ترددات دلتا الهادئة، وانحسار تدريجي للصوت نحو السكون
              التام لمساعدة الجهاز العصبي على الاستغراق السريع في النوم العميق.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isSleepTimerActive ? (
              <button
                onClick={handleCancelSleepMode}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-stone-950 font-bold text-xs transition-colors"
              >
                إلغاء وضع النوم
              </button>
            ) : (
              <button
                onClick={handleStartSleepMode}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all hover:scale-105"
              >
                <Moon className="w-3.5 h-3.5 fill-current" />
                <span>بدء جلسة النوم ({sleepConfig.durationMinutes} دقيقة)</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Sleep Countdown Bar if Active */}
        {isSleepTimerActive && (
          <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-800 space-y-2 animate-fadeIn">
            <div className="flex justify-between items-center text-xs font-mono text-indigo-300">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <span>جلسة حث النوم جارية حالياً:</span>
              </span>
              <span className="text-sm font-bold text-white">
                المتبقي: {Math.floor(sleepRemainingSeconds / 60)}:
                {(sleepRemainingSeconds % 60).toString().padStart(2, '0')} دقيقة
              </span>
            </div>
            <div className="w-full h-2 bg-stone-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                style={{
                  width: `${(sleepRemainingSeconds / (sleepConfig.durationMinutes * 60)) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Sleep Preset Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          {[15, 30, 45, 60].map((mins) => {
            const isSelected = sleepConfig.durationMinutes === mins;
            return (
              <button
                key={mins}
                onClick={() => setSleepConfig({ ...sleepConfig, durationMinutes: mins })}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  isSelected
                    ? 'bg-indigo-950 border-indigo-500 text-indigo-200 font-bold shadow-md ring-1 ring-indigo-500'
                    : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
                }`}
              >
                <div className="text-base font-bold text-stone-100">{mins} دقيقة</div>
                <div className="text-[10px] text-stone-500 mt-1">
                  {mins <= 20 ? 'قيلولة سريعة (Power Nap)' : mins === 45 ? 'دورة نوم نموذجية' : 'استرخاء عميق مطول'}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
