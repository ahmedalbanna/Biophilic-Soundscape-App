'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Heart,
  Activity,
  Play,
  Pause,
  RotateCcw,
  Bluetooth,
  Sparkles,
  Check,
  ShieldCheck,
  Bell,
  Waves,
  Zap,
  Info,
} from 'lucide-react';
import {
  BREATHING_PATTERNS,
  BreathingPattern,
  BiometricReading,
  evaluateStressLevel,
  BluetoothHeartRateManager,
} from '@/lib/biofeedback';
import { getAudioEngine } from '@/lib/audio-engine';

interface BiofeedbackBreathingViewProps {
  onEngineStartRequest: () => void;
  isEnginePlaying: boolean;
}

export function BiofeedbackBreathingView({
  onEngineStartRequest,
  isEnginePlaying,
}: BiofeedbackBreathingViewProps) {
  // Breathing Pattern & State
  const [selectedPatternId, setSelectedPatternId] = useState<string>('resonance_4_6');
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'hold_after'>('inhale');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(4);
  const [totalBreathsCompleted, setTotalBreathsCompleted] = useState<number>(0);
  const [enableSingingBowlChime, setEnableSingingBowlChime] = useState<boolean>(true);

  // Biometrics (Live or Simulated)
  const [bpm, setBpm] = useState<number>(68);
  const [hrvMs, setHrvMs] = useState<number>(62);
  const [isBluetoothConnected, setIsBluetoothConnected] = useState<boolean>(false);
  const [connectedDeviceName, setConnectedDeviceName] = useState<string>('');
  const [isAutoBioAdaptive, setIsAutoBioAdaptive] = useState<boolean>(true);
  const [bluetoothError, setBluetoothError] = useState<string | null>(null);

  const pattern = BREATHING_PATTERNS.find((p) => p.id === selectedPatternId) || BREATHING_PATTERNS[0];
  const stressEvaluation = evaluateStressLevel(bpm, hrvMs);

  const btManagerRef = useRef<BluetoothHeartRateManager | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const phaseStartTimeRef = useRef<number>(0);

  // Initialize Bluetooth manager on mount
  useEffect(() => {
    btManagerRef.current = new BluetoothHeartRateManager();
    return () => {
      btManagerRef.current?.disconnect();
    };
  }, []);

  // Handle Breath Phase Progression
  const handlePhaseTransition = useCallback(
    (nextPhase: 'inhale' | 'hold' | 'exhale' | 'hold_after') => {
      setCurrentPhase(nextPhase);
      const engine = getAudioEngine();

      let phaseDuration = pattern.inhaleSec;
      if (nextPhase === 'hold') phaseDuration = pattern.holdSec;
      else if (nextPhase === 'exhale') phaseDuration = pattern.exhaleSec;
      else if (nextPhase === 'hold_after') phaseDuration = pattern.holdAfterExhaleSec;

      setPhaseSecondsLeft(phaseDuration);

      // Trigger wave swell in procedural audio engine
      if (nextPhase === 'inhale') {
        engine.triggerBreathingSwell('inhale', pattern.inhaleSec);
        if (enableSingingBowlChime) {
          engine.triggerSingingBowl(432); // Healing 432Hz note
        }
      } else if (nextPhase === 'hold' || nextPhase === 'hold_after') {
        engine.triggerBreathingSwell('hold', phaseDuration);
      } else if (nextPhase === 'exhale') {
        engine.triggerBreathingSwell('exhale', pattern.exhaleSec);
        if (enableSingingBowlChime && pattern.holdSec > 0) {
          engine.triggerSingingBowl(324); // Grounding harmonic
        }
      }
    },
    [pattern, enableSingingBowlChime]
  );

  // Active session clock tick
  useEffect(() => {
    if (!isSessionActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setPhaseSecondsLeft((prev) => {
        if (prev <= 1) {
          // Transition to next phase in sequence
          if (currentPhase === 'inhale') {
            if (pattern.holdSec > 0) {
              handlePhaseTransition('hold');
              return pattern.holdSec;
            } else {
              handlePhaseTransition('exhale');
              return pattern.exhaleSec;
            }
          } else if (currentPhase === 'hold') {
            handlePhaseTransition('exhale');
            return pattern.exhaleSec;
          } else if (currentPhase === 'exhale') {
            setTotalBreathsCompleted((c) => c + 1);
            if (pattern.holdAfterExhaleSec > 0) {
              handlePhaseTransition('hold_after');
              return pattern.holdAfterExhaleSec;
            } else {
              handlePhaseTransition('inhale');
              return pattern.inhaleSec;
            }
          } else {
            handlePhaseTransition('inhale');
            return pattern.inhaleSec;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSessionActive, currentPhase, pattern, handlePhaseTransition]);

  // Start or Stop Session
  const toggleSession = () => {
    if (isSessionActive) {
      setIsSessionActive(false);
    } else {
      if (!isEnginePlaying) {
        onEngineStartRequest();
      }
      setIsSessionActive(true);
      handlePhaseTransition('inhale');
    }
  };

  const resetSession = () => {
    setIsSessionActive(false);
    setCurrentPhase('inhale');
    setPhaseSecondsLeft(pattern.inhaleSec);
    setTotalBreathsCompleted(0);
  };

  // Connect Web Bluetooth Heart Rate Sensor
  const handleConnectBluetooth = async () => {
    setBluetoothError(null);
    if (!btManagerRef.current) return;

    try {
      const deviceName = await btManagerRef.current.connect((data) => {
        setBpm(data.bpm);
        if (data.hrvMs) setHrvMs(data.hrvMs);
      });
      setIsBluetoothConnected(true);
      setConnectedDeviceName(deviceName);
    } catch (err: any) {
      setBluetoothError(err.message || 'تعذر الاتصال بجهاز البلوتوث.');
    }
  };

  const handleDisconnectBluetooth = () => {
    btManagerRef.current?.disconnect();
    setIsBluetoothConnected(false);
    setConnectedDeviceName('');
  };

  // Visual Orb Animation Calculations
  let orbScale = 1.0;
  let orbLabelAr = 'جاهز للبدء';
  let orbSubAr = 'اضغط بدء الجلسة للتناغم مع الأمواج';

  if (isSessionActive) {
    if (currentPhase === 'inhale') {
      orbScale = 1.45;
      orbLabelAr = 'شــهـيــق';
      orbSubAr = 'املأ الرئتين بعمق وهدوء';
    } else if (currentPhase === 'hold' || currentPhase === 'hold_after') {
      orbScale = 1.45;
      orbLabelAr = 'حـبـس الـنـفـس';
      orbSubAr = 'استشعر سكون الجسم والقلب';
    } else if (currentPhase === 'exhale') {
      orbScale = 0.85;
      orbLabelAr = 'زفــيــر هـادئ';
      orbSubAr = 'أفرغ الهواء ببطء وتخلص من التوتر';
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <section className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>التغذية البيولوجية الحيوية ومزامنة التنفس (Biofeedback & Paced Breathing)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100">
              تنظيم التنفس برنين أمواج البحر والتكيف مع نبض القلب
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mt-1">
              تتناغم أمواج البحر ونسيم الأشجار تلقائياً مع وتيرة تنفسك (6 أنفاس في الدقيقة) لتحفيز العصب الحائر وتخفيض
              مستويات التوتر فورياً، مع إمكانية ربط حساسات النبض الذكية عبر البلوتوث لقراءة تقلب ضربات القلب (HRV).
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isBluetoothConnected ? (
              <button
                onClick={handleDisconnectBluetooth}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-400 text-xs font-mono"
              >
                <Bluetooth className="w-3.5 h-3.5" />
                <span>متصل: {connectedDeviceName}</span>
              </button>
            ) : (
              <button
                onClick={handleConnectBluetooth}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 text-xs font-medium transition-colors"
              >
                <Bluetooth className="w-3.5 h-3.5 text-sky-400" />
                <span>ربط حساس النبض (Bluetooth)</span>
              </button>
            )}
          </div>
        </div>

        {bluetoothError && (
          <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
            <Info className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{bluetoothError} (يمكنك استخدام محاكي النبض أدناه لاختبار التكيف الحيوي).</span>
          </div>
        )}
      </section>

      {/* Main Grid: Visual Breathing Orb (7 cols) + Biometric HUD (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Interactive Visual Breathing Orb HUD (7 cols) */}
        <div className="lg:col-span-7 p-8 rounded-3xl border border-stone-800 bg-stone-900/60 shadow-2xl flex flex-col items-center justify-between min-h-[460px] relative overflow-hidden">
          {/* Subtle Ambient Light Glow */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${pattern.color}15 0%, transparent 70%)`,
              opacity: isSessionActive ? 1 : 0.2,
            }}
          />

          {/* Top Session Stats Bar */}
          <div className="w-full flex items-center justify-between text-xs font-mono text-stone-400 z-10 border-b border-stone-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-stone-200">{pattern.nameAr}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>دورات مكتملة: <strong className="text-emerald-400">{totalBreathsCompleted}</strong></span>
              <span>الوتيرة: <strong className="text-stone-200">{pattern.breathsPerMin} ن/د</strong></span>
            </div>
          </div>

          {/* Central Pulsating Organic Breathing Orb */}
          <div className="relative my-8 flex items-center justify-center z-10">
            {/* Outer Expansion Wave Rings */}
            <div
              className="absolute rounded-full border border-dashed transition-all pointer-events-none"
              style={{
                borderColor: `${pattern.color}30`,
                width: isSessionActive && currentPhase === 'inhale' ? '280px' : '200px',
                height: isSessionActive && currentPhase === 'inhale' ? '280px' : '200px',
                transitionDuration: `${currentPhase === 'inhale' ? pattern.inhaleSec : pattern.exhaleSec}s`,
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
            <div
              className="absolute rounded-full border transition-all pointer-events-none"
              style={{
                borderColor: `${pattern.color}15`,
                width: isSessionActive && currentPhase === 'inhale' ? '340px' : '220px',
                height: isSessionActive && currentPhase === 'inhale' ? '340px' : '220px',
                transitionDuration: `${currentPhase === 'inhale' ? pattern.inhaleSec : pattern.exhaleSec}s`,
              }}
            />

            {/* Glowing Main Breathing Body */}
            <div
              className="w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center text-center p-4 transition-transform shadow-2xl cursor-pointer"
              onClick={toggleSession}
              style={{
                transform: `scale(${orbScale})`,
                transitionDuration: `${
                  currentPhase === 'inhale'
                    ? pattern.inhaleSec
                    : currentPhase === 'exhale'
                    ? pattern.exhaleSec
                    : 0.5
                }s`,
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                background: `radial-gradient(circle at 35% 35%, ${pattern.color}cc 0%, ${pattern.color}33 70%, #0c0a09 100%)`,
                boxShadow: isSessionActive
                  ? `0 0 60px ${pattern.color}55, inset 0 0 30px rgba(255,255,255,0.2)`
                  : '0 0 20px rgba(0,0,0,0.5)',
              }}
            >
              <span className="text-xl sm:text-2xl font-bold text-white drop-shadow-md tracking-wide">
                {orbLabelAr}
              </span>

              {isSessionActive && (
                <span className="text-3xl font-mono font-bold text-white mt-1 tabular-nums drop-shadow">
                  {phaseSecondsLeft}s
                </span>
              )}

              <span className="text-[11px] text-stone-200 mt-1 max-w-[130px] leading-tight opacity-90">
                {orbSubAr}
              </span>
            </div>
          </div>

          {/* Bottom Session Controls */}
          <div className="w-full flex flex-wrap items-center justify-between gap-3 z-10 pt-3 border-t border-stone-800/80">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSession}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg ${
                  isSessionActive
                    ? 'bg-amber-600 hover:bg-amber-500 text-stone-950'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-stone-950'
                }`}
              >
                {isSessionActive ? (
                  <>
                    <Pause className="w-4 h-4 fill-stone-950" />
                    <span>إيقاف مؤقت</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-stone-950" />
                    <span>بدء تمرين الرنين الصوتي</span>
                  </>
                )}
              </button>

              <button
                onClick={resetSession}
                className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 transition-colors"
                title="إعادة ضبط التمرين"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enableSingingBowlChime}
                onChange={(e) => setEnableSingingBowlChime(e.target.checked)}
                className="w-4 h-4 rounded accent-emerald-500"
              />
              <span className="flex items-center gap-1 text-[11px] text-stone-400">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>رنين الجرس التبتي 432Hz</span>
              </span>
            </label>
          </div>
        </div>

        {/* Right: Biometric Pulse & Stress HUD (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Real-time Heart Rate & HRV Card */}
          <div className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
                <h3 className="text-sm font-bold text-stone-100">مؤشرات النبض وتقلب القلب (HRV)</h3>
              </div>
              <span className="text-[10px] font-mono text-stone-400 bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
                {isBluetoothConnected ? 'مستشعر حقيقي' : 'محاكاة بيولوجية'}
              </span>
            </div>

            {/* Metrics values */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-stone-400 text-xs">
                  <Activity className="w-3.5 h-3.5 text-rose-400" />
                  <span>معدل النبض (BPM)</span>
                </div>
                <div className="text-2xl font-bold font-mono text-stone-100 tabular-nums">
                  {bpm} <span className="text-xs text-stone-500 font-normal">bpm</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-stone-400 text-xs">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تقلب النبض (HRV)</span>
                </div>
                <div className="text-2xl font-bold font-mono text-stone-100 tabular-nums">
                  {hrvMs} <span className="text-xs text-stone-500 font-normal">ms</span>
                </div>
              </div>
            </div>

            {/* Stress level badge & recommendation */}
            <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400">حالة الجهاز العصبي اللاإرادي:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  stressEvaluation.level === 'low'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : stressEvaluation.level === 'moderate'
                    ? 'bg-sky-950 text-sky-400 border border-sky-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}>
                  {stressEvaluation.labelAr}
                </span>
              </div>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                {stressEvaluation.recommendationAr}
              </p>
            </div>

            {/* Simulation Sliders (when no BLE device connected) */}
            {!isBluetoothConnected && (
              <div className="space-y-3 pt-2 border-t border-stone-800">
                <span className="text-[11px] font-semibold text-stone-400 block">
                  محاكاة تغير النبض (لاختبار تكيف الصوت):
                </span>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-stone-400 font-mono">
                    <span>معدل ضربات القلب:</span>
                    <span className="text-stone-200">{bpm} BPM</span>
                  </div>
                  <input
                    type="range"
                    min={55}
                    max={110}
                    value={bpm}
                    onChange={(e) => setBpm(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-stone-400 font-mono">
                    <span>تقلب معدل النبض (HRV):</span>
                    <span className="text-stone-200">{hrvMs} ms</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={95}
                    value={hrvMs}
                    onChange={(e) => setHrvMs(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Autonomic Bio-Adaptive Loop Toggle */}
          <div className="p-4 rounded-xl border border-stone-800 bg-stone-900/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold text-stone-200 block">التكيف الصوتي التلقائي مع الإجهاد</span>
                <span className="text-[11px] text-stone-400">إبطاء حركة الأمواج لتهدئة النبض المرتفع</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isAutoBioAdaptive}
              onChange={(e) => setIsAutoBioAdaptive(e.target.checked)}
              className="w-4 h-4 rounded accent-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Breathing Patterns Library Carousel/Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-semibold text-stone-100">
              أنماط التنفس المتوافقة مع الهندسة الحيوية (Breathing Protocols)
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-mono">· اختر النمط المناسب لحالتك النفسية</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BREATHING_PATTERNS.map((p) => {
            const isSelected = selectedPatternId === p.id;
            return (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedPatternId(p.id);
                  if (isSessionActive) {
                    resetSession();
                  }
                }}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-stone-900 border-emerald-600 shadow-xl ring-1 ring-emerald-500/40'
                    : 'bg-stone-950/70 border-stone-800 hover:border-stone-700 hover:bg-stone-900/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${p.color}20`,
                      color: p.color,
                      border: `1px solid ${p.color}40`,
                    }}
                  >
                    {p.badge}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                </div>

                <h3 className="text-sm font-bold text-stone-100 mb-1">{p.nameAr}</h3>
                <p className="text-[11px] text-stone-400 line-clamp-2 mb-3 leading-relaxed">
                  {p.descAr}
                </p>

                <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] font-mono text-stone-300">
                  <span>شهيق: {p.inhaleSec}s</span>
                  {p.holdSec > 0 && <span>حبس: {p.holdSec}s</span>}
                  <span>زفير: {p.exhaleSec}s</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
