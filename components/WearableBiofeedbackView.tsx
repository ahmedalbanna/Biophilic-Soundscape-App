'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Activity,
  Bluetooth,
  BluetoothConnected,
  BluetoothOff,
  Sparkles,
  Sliders,
  Check,
  ShieldCheck,
  Zap,
  Volume2,
  Wind,
  Waves,
  Feather,
  Watch,
  RotateCcw,
  ArrowDownCircle,
  HelpCircle,
} from 'lucide-react';
import {
  BiofeedbackReading,
  BLE_HEART_RATE_SERVICE,
  BLE_HEART_RATE_MEASUREMENT_CHAR,
  parseHeartRateDataView,
  calculateRmssd,
  evaluateAutonomicState,
  getClosedLoopAcousticModulation,
} from '@/lib/wearable-biofeedback';
import { getAudioEngine } from '@/lib/audio-engine';

interface WearableBiofeedbackViewProps {
  onEngineStartRequest: () => void;
  isEnginePlaying: boolean;
  onLayerChange: (layerId: 'water' | 'breeze' | 'rain' | 'ocean', volume: number, enabled: boolean) => void;
}

interface BleNavigator {
  bluetooth?: {
    requestDevice: (options: {
      filters: Array<{ services: Array<number | string> }>;
    }) => Promise<{
      name?: string;
      gatt?: {
        connect: () => Promise<{
          getPrimaryService: (service: number | string) => Promise<{
            getCharacteristic: (characteristic: number | string) => Promise<{
              startNotifications: () => Promise<void>;
              addEventListener: (type: string, listener: (event: Event) => void) => void;
            }>;
          }>;
        }>;
      };
    }>;
  };
}

export function WearableBiofeedbackView({
  onEngineStartRequest,
  isEnginePlaying,
  onLayerChange,
}: WearableBiofeedbackViewProps) {
  // Live Biofeedback State
  const [currentHr, setCurrentHr] = useState<number>(72);
  const [currentHrv, setCurrentHrv] = useState<number>(54);
  const [rrHistory, setRrHistory] = useState<number[]>([820, 850, 830, 860, 840, 870]);
  const [isBleConnected, setIsBleConnected] = useState<boolean>(false);
  const [connectedDeviceName, setConnectedDeviceName] = useState<string>('');
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(true);
  const [isAutoEntrainmentActive, setIsAutoEntrainmentActive] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const bleDeviceRef = useRef<unknown>(null);

  // Evaluate current physiological status
  const autonomic = evaluateAutonomicState(currentHr, currentHrv);
  const modulation = getClosedLoopAcousticModulation(currentHr, currentHrv);

  // Apply acoustic modulation to Biophilic Audio Engine
  useEffect(() => {
    if (!isAutoEntrainmentActive || !isEnginePlaying) return;

    const engine = getAudioEngine();
    // Modulate water volume & breeze filter
    const baseWater = 0.65 * modulation.waterTempoFactor;
    engine.setLayerVolume('water', baseWater, true);
    onLayerChange('water', baseWater, true);

    const baseBreeze = 0.5 * (modulation.breezeFilterCutoffHz / 1000);
    engine.setLayerVolume('breeze', baseBreeze, true);
    onLayerChange('breeze', baseBreeze, true);
  }, [currentHr, currentHrv, isAutoEntrainmentActive, isEnginePlaying, modulation, onLayerChange]);

  // Web Bluetooth API Connect Routine
  const handleConnectBle = async () => {
    const nav = typeof navigator !== 'undefined' ? (navigator as unknown as BleNavigator) : undefined;
    if (!nav || !nav.bluetooth) {
      setStatusMessage('متصفحك لا يدعم Web Bluetooth API. يرجى استخدام متصفح Chrome أو Edge.');
      setTimeout(() => setStatusMessage(''), 4500);
      return;
    }

    try {
      setStatusMessage('جاري البحث عن أجهزة قياس النبض عبر البلوتوث (Apple Watch / Garmin / Polar)...');
      const device = await nav.bluetooth.requestDevice({
        filters: [{ services: [BLE_HEART_RATE_SERVICE] }],
      });

      if (!device.gatt) throw new Error('لا يمكن الوصول إلى GATT Server');

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(BLE_HEART_RATE_SERVICE);
      const characteristic = await service.getCharacteristic(BLE_HEART_RATE_MEASUREMENT_CHAR);

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event: Event) => {
        const target = event.target as unknown as { value: DataView };
        if (target && target.value) {
          const { hr, rrIntervals } = parseHeartRateDataView(target.value);
          setCurrentHr(hr);
          if (rrIntervals.length > 0) {
            setRrHistory((prev) => {
              const combined = [...prev.slice(-15), ...rrIntervals];
              const newHrv = calculateRmssd(combined);
              setCurrentHrv(newHrv);
              return combined;
            });
          }
        }
      });

      bleDeviceRef.current = device;
      setIsBleConnected(true);
      setIsSimulationMode(false);
      setConnectedDeviceName(device.name || 'مستشعر النبض المقترن');
      setStatusMessage(`تم الاتصال بنجاح مع ${device.name || 'ساعة النبض الذكية'}`);
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (!errorMsg.includes('User cancelled')) {
        setStatusMessage(`تعذر الاتصال بالبلوتوث: ${errorMsg}`);
        setTimeout(() => setStatusMessage(''), 4500);
      }
    }
  };

  const handleDisconnectBle = () => {
    if (bleDeviceRef.current) {
      const dev = bleDeviceRef.current as { gatt?: { disconnect: () => void } };
      if (dev.gatt) dev.gatt.disconnect();
    }
    setIsBleConnected(false);
    setConnectedDeviceName('');
    setIsSimulationMode(true);
    setStatusMessage('تم قطع اتصال البلوتوث والعودة إلى وضع المحاكاة التفاعلية.');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Preset quick biological states for testing
  const handleApplyPreset = (hr: number, hrv: number) => {
    setCurrentHr(hr);
    setCurrentHrv(hrv);
    if (!isEnginePlaying) {
      onEngineStartRequest();
    }
  };

  // Pulse animation duration in seconds: 60 / BPM
  const pulseDurationSec = Math.max(0.4, Math.min(1.5, 60 / currentHr));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <section className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-rose-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>المستشعرات الحيوية والتزامن الصوتي (Wearable Biofeedback & Closed-Loop Entrainment)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100">
              الربط الحيوي بالساعات الذكية (Apple Watch / Garmin) والتزامن الصوتي العصبي
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mt-1">
              ربط مباشر عبر تقنية Web Bluetooth لقراءة نبض القلب (BPM) وتقلب ضربات القلب (HRV) لحظياً.
              يقوم المحرك الصوتي بتهدئة تدفق المياه وتفعيل إيقاع التنفس الرنان تلقائياً عند رصد ارتفاع التوتر العصبي.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isBleConnected ? (
              <button
                onClick={handleDisconnectBle}
                className="px-4 py-2 rounded-xl bg-rose-950 border border-rose-800 text-rose-300 font-mono text-xs flex items-center gap-2 transition-colors"
              >
                <BluetoothConnected className="w-3.5 h-3.5 text-rose-400" />
                <span>متصل: {connectedDeviceName} (قطع)</span>
              </button>
            ) : (
              <button
                onClick={handleConnectBle}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-md transition-all hover:scale-105"
              >
                <Bluetooth className="w-3.5 h-3.5 fill-current" />
                <span>الاتصال بالساعة عبر البلوتوث</span>
              </button>
            )}
          </div>
        </div>

        {statusMessage && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-300 flex items-center gap-2 animate-fadeIn">
            <Activity className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </section>

      {/* Main Physiological HUD: Heart Rate & HRV & Autonomic Balance */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Giant Pulsing EKG & Heart Rate Gauge (5 cols) */}
        <div className="lg:col-span-5 p-7 rounded-3xl border border-stone-800 bg-stone-900/80 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-stone-400">معدل نبضات القلب اللحظي:</span>
              <span className="text-xs font-mono text-rose-400 bg-rose-950 px-2.5 py-0.5 rounded-full border border-rose-800">
                {isBleConnected ? 'بيانات حية مباشرة' : 'وضع المحاكاة البيولوجية'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 pt-2">
              <span className="text-5xl sm:text-6xl font-mono font-bold text-stone-100">{currentHr}</span>
              <span className="text-sm font-mono text-stone-400">BPM (نبضة/دقيقة)</span>
            </div>
          </div>

          {/* Animated Pulsing Heart Glyph */}
          <div className="flex flex-col items-center justify-center py-6 relative z-10">
            <div
              className="w-28 h-28 rounded-full bg-rose-950/60 border border-rose-800 flex items-center justify-center relative shadow-2xl transition-transform"
              style={{
                animation: `pulse ${pulseDurationSec}s infinite ease-in-out`,
                boxShadow: `0 0 ${Math.max(20, currentHr)}px rgba(244, 63, 94, 0.35)`,
              }}
            >
              <Heart className="w-14 h-14 text-rose-500 fill-rose-500/80" />
            </div>

            <div className="text-xs font-mono text-stone-400 mt-4 flex items-center gap-2">
              <span>الفترة البينية (RR-Interval):</span>
              <span className="text-stone-200 font-bold">{Math.round(60000 / currentHr)} ms</span>
            </div>
          </div>

          {/* HRV & Stress Telemetry */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-850 space-y-2 text-xs relative z-10">
            <div className="flex justify-between font-mono">
              <span className="text-stone-400">تقلب ضربات القلب (HRV RMSSD):</span>
              <span className="text-emerald-400 font-bold">{currentHrv} ms</span>
            </div>
            <div className="flex justify-between font-mono border-t border-stone-850 pt-1.5">
              <span className="text-stone-400">مؤشر الإجهاد الفسيولوجي:</span>
              <span
                className={`font-bold ${
                  autonomic.stressScore > 70
                    ? 'text-rose-400'
                    : autonomic.stressScore > 40
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {autonomic.stressScore}/100
              </span>
            </div>
          </div>
        </div>

        {/* Right: Autonomic Nervous Balance & Closed-Loop Acoustic Entrainment (7 cols) */}
        <div className="lg:col-span-7 p-7 rounded-3xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="space-y-0.5">
              <span className="text-xs font-mono text-stone-400">تقييم الجهاز العصبي اللاإرادي (ANS Balance):</span>
              <h2 className="text-sm sm:text-base font-bold text-stone-100">{autonomic.labelAr}</h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAutoEntrainmentActive(!isAutoEntrainmentActive)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-colors ${
                  isAutoEntrainmentActive
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-stone-800 text-stone-500'
                }`}
              >
                {isAutoEntrainmentActive ? 'التزامن الصوتي التلقائي نشط' : 'التزامن معطل'}
              </button>
            </div>
          </div>

          {/* Closed-Loop Entrainment Action Banner */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-rose-900/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
              <Sparkles className="w-4 h-4" />
              <span>استجابة المحرك الصوتي للحالة الفسيولوجية:</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              {modulation.suggestedActionAr}
            </p>
          </div>

          {/* Acoustic Modulation Parameter Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
            <div className="p-3 rounded-2xl bg-stone-950 border border-stone-850 space-y-1">
              <span className="text-[10px] text-stone-500 block">إيقاع تدفق الماء:</span>
              <span className="text-sky-400 font-bold text-sm">
                {(modulation.waterTempoFactor * 100).toFixed(0)}%
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-stone-950 border border-stone-850 space-y-1">
              <span className="text-[10px] text-stone-500 block">مرشح النسيم (Cutoff):</span>
              <span className="text-teal-400 font-bold text-sm">
                {modulation.breezeFilterCutoffHz} Hz
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-stone-950 border border-stone-850 space-y-1">
              <span className="text-[10px] text-stone-500 block">التنفس الرنان (4-6s):</span>
              <span
                className={`font-bold text-sm ${
                  modulation.resonantBreathingActive ? 'text-rose-400 animate-pulse' : 'text-stone-500'
                }`}
              >
                {modulation.resonantBreathingActive ? 'مفعل للتهدئة' : 'غير مطلوب'}
              </span>
            </div>
          </div>

          {/* Interactive Biological Simulator Sliders */}
          <div className="pt-2 space-y-4 border-t border-stone-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-200">
                محاكاة واختبار الاستجابة الحيوية (Interactive Bio-Simulator):
              </span>
              <span className="text-[10px] font-mono text-stone-500">جرب تحريك المؤشرات لمشاهدة التغير الصوتي</span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              {/* HR Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-stone-400">
                  <span>تعديل معدل النبض (Heart Rate):</span>
                  <span className="text-rose-400 font-bold">{currentHr} BPM</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={120}
                  step={1}
                  value={currentHr}
                  onChange={(e) => setCurrentHr(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              {/* HRV Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-stone-400">
                  <span>تعديل تقلب ضربات القلب (HRV RMSSD):</span>
                  <span className="text-emerald-400 font-bold">{currentHrv} ms</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={95}
                  step={1}
                  value={currentHrv}
                  onChange={(e) => setCurrentHrv(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            {/* Quick Biological State Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => handleApplyPreset(102, 22)}
                className="p-2.5 rounded-xl bg-stone-950 hover:bg-stone-900 border border-stone-800 text-rose-300 text-[11px] font-mono transition-colors text-center"
              >
                حالة توتر وإجهاد (102 BPM)
              </button>
              <button
                onClick={() => handleApplyPreset(74, 48)}
                className="p-2.5 rounded-xl bg-stone-950 hover:bg-stone-900 border border-stone-800 text-stone-300 text-[11px] font-mono transition-colors text-center"
              >
                توازن طبيعي (74 BPM)
              </button>
              <button
                onClick={() => handleApplyPreset(58, 85)}
                className="p-2.5 rounded-xl bg-stone-950 hover:bg-stone-900 border border-stone-800 text-emerald-300 text-[11px] font-mono transition-colors text-center"
              >
                تناغم مبهمي فائق (58 BPM)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Wearable Compatibility & Setup Guide */}
      <section className="p-7 rounded-3xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-800">
          <Watch className="w-5 h-5 text-rose-400" />
          <h3 className="text-sm sm:text-base font-bold text-stone-100">
            دليل توافق الساعات والأحزمة الذكية (Supported Wearable Bluetooth Hardware)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-850 space-y-2">
            <span className="text-rose-400 font-bold block">Apple Watch (ساعة أبل):</span>
            <p className="text-stone-400 leading-relaxed text-[11px]">
              تدعم البث عبر تطبيقات BLE Bridge مثل <em>HeartWatch</em> أو <em>Echo Heart Rate</em> التي تبث خدمة
              `0x180D` المفتوحة مباشرة إلى متصفحك بدون وسيط سحابي.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-850 space-y-2">
            <span className="text-rose-400 font-bold block">Garmin & Polar (ساعات وأحزمة جارمن وبولار):</span>
            <p className="text-stone-400 leading-relaxed text-[11px]">
              ساعات Garmin تدعم تفعيل ميزة <strong>Broadcast Heart Rate</strong>، وأحزمة Polar H10 و Verity Sense
              تبث خدمة GATT القياسية فورياً بمجرد ارتدائها.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-850 space-y-2">
            <span className="text-rose-400 font-bold block">Whoop & Wahoo & Scosche:</span>
            <p className="text-stone-400 leading-relaxed text-[11px]">
              أساور Whoop 4.0 تدعم خيار <em>Heart Rate Broadcast</em> في الإعدادات، مما يتيح للنظام التقاط النبض
              والـ HRV بدقة عالية دون أي اشتراك إضافي.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
