'use client';

import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Sparkles,
  Sliders,
  Power,
  Copy,
  Check,
  Code,
  Layers,
  Activity,
  Flame,
  Lightbulb,
  Radio,
  Eye,
  Waves,
  Zap,
} from 'lucide-react';
import {
  LightingZone,
  INITIAL_LIGHT_ZONES,
  getCircadianLightTarget,
  kelvinToRgb,
  generateHomeAssistantLightingYaml,
  generateZigbee2MqttPayload,
  CIRCADIAN_LIGHTING_SCHEDULE,
} from '@/lib/circadian-lighting';

interface CircadianLightingSyncViewProps {
  currentHour: number;
  isDucked: boolean;
  isPlaying: boolean;
}

export function CircadianLightingSyncView({
  currentHour,
  isDucked,
  isPlaying,
}: CircadianLightingSyncViewProps) {
  const [manualOverrides, setManualOverrides] = useState<
    Record<string, { kelvin?: number; brightness?: number; isOn?: boolean }>
  >({});
  const [isAutoSync, setIsAutoSync] = useState<boolean>(true);
  const [causticShimmerActive, setCausticShimmerActive] = useState<boolean>(true);
  const [shimmerOffset, setShimmerOffset] = useState<number>(0);
  const [copiedYaml, setCopiedYaml] = useState<boolean>(false);
  const [copiedMqtt, setCopiedMqtt] = useState<boolean>(false);
  const [selectedProtocolTab, setSelectedProtocolTab] = useState<'ha' | 'z2m' | 'hue'>('ha');

  // Compute Current Circadian Target
  const circadianTarget = getCircadianLightTarget(currentHour);
  const currentColor = kelvinToRgb(circadianTarget.kelvin);

  // Water Caustic Shimmer Animation Effect (subtle ±2% brightness breathing)
  useEffect(() => {
    if (!causticShimmerActive || !isPlaying) {
      return;
    }

    let animationFrame: number;
    const startTime = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      // 0.35 Hz wave matching water stream surge
      const wave = Math.sin(2 * Math.PI * 0.35 * elapsed) * 2.5;
      setShimmerOffset(wave);
      animationFrame = requestAnimationFrame(loop);
    };

    animationFrame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animationFrame);
      setShimmerOffset(0);
    };
  }, [causticShimmerActive, isPlaying]);

  // Derived Zones (Pure & Declarative - no setState in effect)
  const displayedZones: LightingZone[] = INITIAL_LIGHT_ZONES.map((zone) => {
    const override = manualOverrides[zone.id];
    const isOn = override?.isOn !== undefined ? override.isOn : zone.isOn;
    const kelvin = !isAutoSync && override?.kelvin !== undefined ? override.kelvin : circadianTarget.kelvin;
    const baseBrightness = !isAutoSync && override?.brightness !== undefined ? override.brightness : circadianTarget.brightnessPct;
    const effectiveBrightness = Math.round(
      Math.max(
        5,
        Math.min(
          100,
          baseBrightness +
            (zone.shimmerMode && causticShimmerActive && isPlaying ? shimmerOffset : 0) +
            (isDucked ? 8 : 0)
        )
      )
    );
    const rgb = kelvinToRgb(kelvin);
    return {
      ...zone,
      isOn,
      currentKelvin: kelvin,
      targetKelvin: kelvin,
      currentBrightnessPct: effectiveBrightness,
      targetBrightnessPct: effectiveBrightness,
      hexColor: rgb.hex,
    };
  });

  // Toggle Zone Power
  const handleToggleZonePower = (zoneId: string) => {
    setManualOverrides((prev) => {
      const cur = prev[zoneId];
      const currentlyOn = cur?.isOn !== undefined ? cur.isOn : true;
      return {
        ...prev,
        [zoneId]: {
          ...cur,
          isOn: !currentlyOn,
        },
      };
    });
  };

  // Manual Zone Brightness Change
  const handleZoneBrightness = (zoneId: string, val: number) => {
    setIsAutoSync(false);
    setManualOverrides((prev) => ({
      ...prev,
      [zoneId]: {
        ...prev[zoneId],
        brightness: val,
      },
    }));
  };

  // Manual Zone Kelvin Change
  const handleZoneKelvin = (zoneId: string, kelvin: number) => {
    setIsAutoSync(false);
    setManualOverrides((prev) => ({
      ...prev,
      [zoneId]: {
        ...prev[zoneId],
        kelvin,
      },
    }));
  };

  const handleCopyYaml = () => {
    const yaml = generateHomeAssistantLightingYaml(displayedZones);
    navigator.clipboard.writeText(yaml);
    setCopiedYaml(true);
    setTimeout(() => setCopiedYaml(false), 2500);
  };

  const handleCopyMqtt = () => {
    const payload = generateZigbee2MqttPayload(circadianTarget.kelvin, circadianTarget.brightnessPct);
    navigator.clipboard.writeText(payload);
    setCopiedMqtt(true);
    setTimeout(() => setCopiedMqtt(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <section className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>الإضاءة الحيوية المتزامنة (Circadian Smart Lighting Sync)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100">
              التناغم الضوئي الحيوي مع فيليبس هيو وZigbee وHome Assistant
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mt-1">
              ربط هندسي لحظي بين حرارة لون الإضاءة (Kelvin)، شدة التوهج (Brightness)، والتراكب الصوتي الحيوي.
              يحاكي حركة الشمس الطبيعية لمنع اضطراب الميلاتونين وتوفير تناغم حسي كامل في المنزل.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsAutoSync(!isAutoSync)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md ${
                isAutoSync
                  ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 ring-2 ring-amber-500/20'
                  : 'bg-stone-800 hover:bg-stone-750 text-stone-300'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{isAutoSync ? 'المزامنة التلقائية نشطة' : 'وضع التعديل اليدوي'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Spectrum & Photobiological Live Gauge */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Giant Visual Color Swatch & Kelvin Dial (5 cols) */}
        <div className="lg:col-span-5 p-7 rounded-3xl border border-stone-800 bg-stone-900/80 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
          {/* Ambient Glow Aura */}
          <div
            className="absolute -top-12 -right-12 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-1000"
            style={{ backgroundColor: currentColor.hex }}
          />

          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-stone-400">حالة الطيف الضوئي الفعلي:</span>
              <span
                className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border shadow-sm"
                style={{
                  backgroundColor: `${currentColor.hex}22`,
                  borderColor: currentColor.hex,
                  color: currentColor.hex,
                }}
              >
                {circadianTarget.kelvin}K
              </span>
            </div>

            <div className="text-3xl sm:text-4xl font-bold text-stone-100">
              {circadianTarget.kelvin < 2500
                ? 'توهج عنبري دافئ (Amber Glow)'
                : circadianTarget.kelvin < 4500
                ? 'ضوء نهاري ناعم (Soft Daylight)'
                : 'ضوء ناصع كامل الطيف (Full Spectrum)'}
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              محاكاة حركة الشمس لضبط النواة فوق التصالبية (SCN) في الدماغ وإفراز الهرمونات المناسبة.
            </p>
          </div>

          {/* Interactive Light Bulb / Sphere Preview */}
          <div className="flex flex-col items-center justify-center py-4 relative z-10">
            <div
              className="w-36 h-36 rounded-full flex items-center justify-center shadow-2xl transition-all duration-700 relative"
              style={{
                backgroundColor: currentColor.hex,
                boxShadow: `0 0 60px ${currentColor.hex}66, inset 0 0 20px #ffffff88`,
              }}
            >
              <Lightbulb className="w-14 h-14 text-stone-950 opacity-80" />

              {causticShimmerActive && isPlaying && (
                <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-ping opacity-30 pointer-events-none" />
              )}
            </div>

            <div className="flex items-center gap-3 mt-4 text-xs font-mono text-stone-400">
              <span>RGB: {currentColor.hex.toUpperCase()}</span>
              <span>·</span>
              <span>الشدة: {circadianTarget.brightnessPct}%</span>
            </div>
          </div>

          {/* Acoustic & Speech Interlock Telemetry */}
          <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-2 text-xs relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-stone-400 flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-teal-400" />
                <span>تموج لمعان الماء (Caustic Shimmer):</span>
              </span>
              <button
                onClick={() => setCausticShimmerActive(!causticShimmerActive)}
                className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
                  causticShimmerActive ? 'bg-teal-950 text-teal-300 border border-teal-800' : 'bg-stone-850 text-stone-500'
                }`}
              >
                {causticShimmerActive ? 'مفعل (±2.5%)' : 'معطل'}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-stone-850">
              <span className="text-stone-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>استجابة كشف الكلام (VAD Ducking Cue):</span>
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  isDucked ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse' : 'text-stone-500'
                }`}
              >
                {isDucked ? 'تعزيز بصري (+8% Lux)' : 'مستقر'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: 24h Circadian Curve & Photobiological Guide (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-stone-100">
                  منحنى الإضاءة الحيوية اليومي (24-Hour Photobiological Curve)
                </h2>
              </div>
              <span className="text-xs font-mono text-stone-400">التوقيت الافتراضي: {currentHour.toFixed(1)}h</span>
            </div>

            <div className="space-y-3">
              {CIRCADIAN_LIGHTING_SCHEDULE.map((point) => {
                const ptColor = kelvinToRgb(point.kelvin);
                const isCurrent = Math.abs(currentHour - point.hour) < 2.0;

                return (
                  <div
                    key={point.phaseId}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-stone-950 border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-stone-950/60 border-stone-800/80 opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-10 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: ptColor.hex }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-100">{point.phaseAr}</span>
                          <span className="text-[10px] font-mono text-stone-500">{point.hour}:00</span>
                        </div>
                        <span className="text-[11px] text-stone-400 block mt-0.5">{point.descriptionAr}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 text-xs font-mono">
                      <div className="text-right">
                        <span className="text-stone-300 font-bold block">{point.kelvin}K</span>
                        <span className="text-[10px] text-stone-500">{point.brightnessPct}% شدة</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-1 rounded bg-stone-900 border border-stone-800 text-amber-400">
                        {point.melanopicLux} Lux
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Lighting Zones Matrix */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-semibold text-stone-100">
              مناطق الإضاءة المعمارية المتصلة (Connected Smart Light Zones)
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-mono">· تحكم مستقل في كل غرفة وتوافق مع الأجهزة</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedZones.map((zone) => {
            const rgb = kelvinToRgb(zone.currentKelvin);
            return (
              <div
                key={zone.id}
                className={`p-5 rounded-2xl border transition-all space-y-4 ${
                  zone.isOn
                    ? 'bg-stone-900/80 border-stone-750 shadow-lg'
                    : 'bg-stone-950/60 border-stone-850 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-400 uppercase">
                        {zone.protocol}
                      </span>
                      <span className="text-[10px] font-mono text-stone-500">{zone.entityId}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-stone-100">{zone.nameAr}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full border border-white/20 shadow-md"
                      style={{ backgroundColor: rgb.hex }}
                    />
                    <button
                      onClick={() => handleToggleZonePower(zone.id)}
                      className={`p-2 rounded-xl transition-colors ${
                        zone.isOn ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-500'
                      }`}
                      title={zone.isOn ? 'إطفاء الإضاءة' : 'تشغيل الإضاءة'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sliders: Kelvin & Brightness */}
                <div className="space-y-3 pt-1">
                  {/* Kelvin Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-stone-400">
                      <span>حرارة اللون (Color Temperature):</span>
                      <span className="text-stone-200 font-bold">{zone.currentKelvin}K</span>
                    </div>
                    <input
                      type="range"
                      min={1800}
                      max={6500}
                      step={50}
                      disabled={!zone.isOn}
                      value={zone.currentKelvin}
                      onChange={(e) => handleZoneKelvin(zone.id, parseInt(e.target.value))}
                      className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  {/* Brightness Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-stone-400">
                      <span>شدة التوهج (Brightness):</span>
                      <span className="text-stone-200 font-bold">{zone.currentBrightnessPct}%</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={100}
                      step={1}
                      disabled={!zone.isOn}
                      value={zone.currentBrightnessPct}
                      onChange={(e) => handleZoneBrightness(zone.id, parseInt(e.target.value))}
                      className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Integration Code Exporter & Protocols */}
      <section className="p-6 rounded-3xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm sm:text-base font-bold text-stone-100">
                أكواد الربط والتكامل المباشر (Home Assistant & Zigbee2MQTT Integration)
              </h3>
            </div>
            <span className="text-xs text-stone-400 mt-0.5 block">
              انسخ الأكواد التالية لربط النظام بنقرة واحدة مع وحدات الإضاءة الذكية في منزلك
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedProtocolTab('ha')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                selectedProtocolTab === 'ha'
                  ? 'bg-emerald-600 text-stone-950 font-bold'
                  : 'bg-stone-800 text-stone-300'
              }`}
            >
              Home Assistant YAML
            </button>
            <button
              onClick={() => setSelectedProtocolTab('z2m')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                selectedProtocolTab === 'z2m'
                  ? 'bg-emerald-600 text-stone-950 font-bold'
                  : 'bg-stone-800 text-stone-300'
              }`}
            >
              Zigbee2MQTT JSON
            </button>
          </div>
        </div>

        {selectedProtocolTab === 'ha' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-stone-400 font-mono">
              <span>ملف أتمتة Home Assistant التلقائي (automations.yaml):</span>
              <button
                onClick={handleCopyYaml}
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                {copiedYaml ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedYaml ? 'تم النسخ للحافظة!' : 'نسخ الكود'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-stone-950 border border-stone-800 text-[11px] font-mono text-stone-300 overflow-x-auto max-h-60 leading-relaxed" dir="ltr">
              {generateHomeAssistantLightingYaml(displayedZones)}
            </pre>
          </div>
        )}

        {selectedProtocolTab === 'z2m' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-stone-400 font-mono">
              <span>حمولة رسالة MQTT المرسلة عبر Topic (zigbee2mqtt/[zone_id]/set):</span>
              <button
                onClick={handleCopyMqtt}
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                {copiedMqtt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMqtt ? 'تم النسخ للحافظة!' : 'نسخ الحمولة'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-stone-950 border border-stone-800 text-[11px] font-mono text-stone-300 overflow-x-auto max-h-60 leading-relaxed" dir="ltr">
              {generateZigbee2MqttPayload(circadianTarget.kelvin, circadianTarget.brightnessPct)}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
}
