'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Fan,
  Wind,
  Droplets,
  ShieldCheck,
  Activity,
  Sliders,
  Sparkles,
  RefreshCw,
  Waves,
  Mountain,
  Flame,
  Volume2,
  CheckCircle2,
  Settings2,
  Cpu,
  ChevronRight,
  Gauge,
  Thermometer,
  CloudRain,
  Home,
  Copy,
  Check,
} from 'lucide-react';
import {
  getHvacIaqSyncManager,
  HvacIaqSyncState,
  HvacFanSpeed,
  HVAC_MASKING_FLAVORS,
  IAQ_BIOPHILIC_PROFILES,
  HvacIncidentLog,
} from '@/lib/hvac-iaq-sync';
import { getAudioEngine } from '@/lib/audio-engine';

interface AdaptiveHvacIaqSyncViewProps {
  onEngineStartRequest?: () => void;
}

export function AdaptiveHvacIaqSyncView({ onEngineStartRequest }: AdaptiveHvacIaqSyncViewProps) {
  const manager = getHvacIaqSyncManager();
  const [syncState, setSyncState] = useState<HvacIaqSyncState>(manager.getState());
  const [logs, setLogs] = useState<HvacIncidentLog[]>(manager.getLogs());
  const [copiedYaml, setCopiedYaml] = useState(false);
  const [activeTab, setActiveTab] = useState<'cockpit' | 'iaq' | 'flavors' | 'ha_bridge'>('cockpit');

  // Subscribe to manager updates
  useEffect(() => {
    const unsub = manager.subscribe((state) => {
      setSyncState(state);
      setLogs(manager.getLogs());

      // Apply to audio engine if enabled
      const engine = getAudioEngine();
      if (state.enabled) {
        engine.applyAdaptiveHvacAndIaqMask(
          state.hvacTelemetry.speed,
          state.activeFlavorId,
          state.activeIaqProfileId,
          1.0
        );
      } else {
        engine.stopAdaptiveHvacMask();
      }
    });

    return unsub;
  }, [manager]);

  const handleToggleEnabled = () => {
    const next = !syncState.enabled;
    manager.setEnabled(next);
    if (next && onEngineStartRequest) {
      onEngineStartRequest();
    }
  };

  const handleSpeedSelect = (speed: HvacFanSpeed) => {
    manager.setHvacFanSpeed(speed);
    if (onEngineStartRequest) onEngineStartRequest();
  };

  const handleFlavorSelect = (flavorId: string) => {
    manager.setMaskingFlavor(flavorId);
    if (onEngineStartRequest) onEngineStartRequest();
  };

  const handleScenarioApply = (
    scId: 'pristine_quiet' | 'summer_noon' | 'dust_storm' | 'majlis_gathering' | 'night_eco'
  ) => {
    manager.applyScenario(scId);
    if (onEngineStartRequest) onEngineStartRequest();
  };

  const handleCopyYaml = () => {
    const yaml = `# Home Assistant Automation: Biophilic HVAC & IAQ Masking Sync
- alias: "Biophilic Audio - Adaptive HVAC & IAQ Masking"
  trigger:
    - platform: state
      entity_id: climate.daikin_central_vrf
      attribute: fan_mode
    - platform: numeric_state
      entity_id: sensor.air_gradient_pm25
      above: 55
    - platform: numeric_state
      entity_id: sensor.awair_element_co2
      above: 1000
  action:
    - service: mqtt.publish
      data:
        topic: "villa/biophilic/hvac_iaq/sync"
        payload_template: >
          {
            "fan_speed": "{{ state_attr('climate.daikin_central_vrf', 'fan_mode') }}",
            "pm25": {{ states('sensor.air_gradient_pm25') | float }},
            "co2": {{ states('sensor.awair_element_co2') | float }},
            "tvoc": {{ states('sensor.awair_element_tvoc') | float }}
          }`;
    navigator.clipboard.writeText(yaml);
    setCopiedYaml(true);
    setTimeout(() => setCopiedYaml(false), 2500);
  };

  const currentFlavor =
    HVAC_MASKING_FLAVORS.find((f) => f.id === syncState.activeFlavorId) || HVAC_MASKING_FLAVORS[0];
  const currentIaqProfile =
    IAQ_BIOPHILIC_PROFILES[syncState.activeIaqProfileId] || IAQ_BIOPHILIC_PROFILES.pristine;

  const hvac = syncState.hvacTelemetry;
  const iaq = syncState.iaqTelemetry;

  const speeds: Array<{ id: HvacFanSpeed; labelAr: string; labelEn: string; icon: string }> = [
    { id: 'off', labelAr: 'متوقف (صمت)', labelEn: 'Off (Idle)', icon: 'off' },
    { id: 'eco_low', labelAr: 'اقتصادي 25%', labelEn: 'Eco (Whisper)', icon: 'eco' },
    { id: 'normal_med', labelAr: 'قياسي 50%', labelEn: 'Normal (50%)', icon: 'normal' },
    { id: 'high_cool', labelAr: 'مكثف 75%', labelEn: 'High (75%)', icon: 'high' },
    { id: 'turbo_boost', labelAr: 'أقصى طاقة 100%', labelEn: 'Turbo (100%)', icon: 'turbo' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn" dir="rtl">
      {/* Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-br from-stone-900/90 via-cyan-950/40 to-stone-950 border border-cyan-800/30 p-6 sm:p-8 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl text-right">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-600/40 text-cyan-300 text-xs font-semibold">
              <Fan className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: hvac.speed === 'off' ? '0s' : hvac.speed === 'turbo_boost' ? '1s' : '4s' }} />
              <span>هندسة التكيف الصوتي البيوفيلي لضجيج التكييف المركزي</span>
              <span className="text-stone-500">|</span>
              <span className="text-emerald-400 font-mono">IAQ Dynamic Sync</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-100 tracking-tight leading-tight">
              التكيف مع ضوضاء التكييف المركزي وحساسات الهواء
            </h1>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              امتصاص حفيف مجاري الهواء (Duct Hiss) واهتزازات الضواغط (50–120Hz) بتحويلها تلقائياً إلى خرير ماء ونسيم طبيعي، مع مزامنة الطبقات الصوتية فورياً مع حساسات الغبار (PM2.5) وثاني أكسيد الكربون (CO2).
            </p>
          </div>

          {/* Master Control Badge & Switch */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 bg-stone-900/80 border border-stone-800 rounded-2xl p-4 self-start md:self-auto backdrop-blur-md">
            <div className="text-right">
              <div className="text-xs font-medium text-stone-400">حالة القناع الصوتي التكيفي</div>
              <div className="text-sm font-bold flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${syncState.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500'}`} />
                <span className={syncState.enabled ? 'text-emerald-300' : 'text-stone-400'}>
                  {syncState.enabled ? 'مفعل وقيد التكيف النشط' : 'معطل مؤقتاً'}
                </span>
              </div>
            </div>

            <button
              onClick={handleToggleEnabled}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2 ${
                syncState.enabled
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/50'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{syncState.enabled ? 'إيقاف النظام' : 'تشغيل النظام الآن'}</span>
            </button>
          </div>
        </div>

        {/* Real-time KPI Ribbon */}
        <div className="mt-8 pt-6 border-t border-stone-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-stone-950/60 border border-stone-800/60 rounded-xl p-3.5">
            <div className="text-xs text-stone-400 flex items-center justify-between mb-1">
              <span>كفاءة حجب الضجيج</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 tracking-tight font-mono">
              {syncState.maskingEfficiencyPercent}%
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">امتصاص سيكو-صوتي دون رفع شدة الغرفة</div>
          </div>

          <div className="bg-stone-950/60 border border-stone-800/60 rounded-xl p-3.5">
            <div className="text-xs text-stone-400 flex items-center justify-between mb-1">
              <span>الانخفاض الإدراكي للضوضاء</span>
              <Gauge className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-cyan-300 tracking-tight font-mono">
              -{syncState.acousticSPLReductionDb} dB
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">معادلة ترددية لمرشح 60Hz/120Hz</div>
          </div>

          <div className="bg-stone-950/60 border border-stone-800/60 rounded-xl p-3.5">
            <div className="text-xs text-stone-400 flex items-center justify-between mb-1">
              <span>سرعة مروحة التكييف</span>
              <Fan className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-lg font-bold text-sky-300 truncate">
              {hvac.speedNameAr}
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5 font-mono">{hvac.fanRpm} RPM | ~{hvac.estAcousticDb} dBA</div>
          </div>

          <div className="bg-stone-950/60 border border-stone-800/60 rounded-xl p-3.5">
            <div className="text-xs text-stone-400 flex items-center justify-between mb-1">
              <span>مؤشر جودة الهواء (AQI)</span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black tracking-tight font-mono" style={{ color: iaq.color }}>
              {iaq.aqi} <span className="text-xs font-normal text-stone-400">AQI</span>
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5 truncate">{iaq.statusLabelAr}</div>
          </div>
        </div>
      </div>

      {/* Quick Scenario Simulators */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stone-300 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>محاكاة السيناريوهات الحية في الفيلا (Quick Scenarios)</span>
          </h2>
          <span className="text-xs text-stone-500">انقر لاختبار استجابة المحرك الإكوستيكي فوراً</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => handleScenarioApply('pristine_quiet')}
            className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-right transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-stone-200 group-hover:text-emerald-300">هدوء الصباح الباكر</span>
              <span className="text-base">🍃</span>
            </div>
            <div className="text-[11px] text-stone-400">تكييف هادئ Inverter مع نقاء هواء مثالي (AQI 22)</div>
          </button>

          <button
            onClick={() => handleScenarioApply('summer_noon')}
            className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 hover:border-cyan-500/50 hover:bg-cyan-950/20 text-right transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-stone-200 group-hover:text-cyan-300">ذروة حرارة الظهيرة</span>
              <span className="text-base">☀️</span>
            </div>
            <div className="text-[11px] text-stone-400">تكييف Turbo بأقصى تدفق وحاجة لقناع شلال كثيف</div>
          </button>

          <button
            onClick={() => handleScenarioApply('dust_storm')}
            className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 hover:border-amber-500/50 hover:bg-amber-950/20 text-right transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-stone-200 group-hover:text-amber-300">عاصفة رملية خارجية</span>
              <span className="text-base">🌪️</span>
            </div>
            <div className="text-[11px] text-stone-400">ارتفاع الغبار (PM2.5: 118) ونمط سكينة الواحة</div>
          </button>

          <button
            onClick={() => handleScenarioApply('majlis_gathering')}
            className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 hover:border-purple-500/50 hover:bg-purple-950/20 text-right transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-stone-200 group-hover:text-purple-300">مجلس وبخور وضيافة</span>
              <span className="text-base">☕</span>
            </div>
            <div className="text-[11px] text-stone-400">ارتفاع CO2 وبخور TVOC مع نمط الحديقة المنعشة</div>
          </button>

          <button
            onClick={() => handleScenarioApply('night_eco')}
            className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 hover:border-indigo-500/50 hover:bg-indigo-950/20 text-right transition-all group col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-stone-200 group-hover:text-indigo-300">سكون الليل والنوم</span>
              <span className="text-base">🌙</span>
            </div>
            <div className="text-[11px] text-stone-400">تخفيض طنين 60Hz العميق لتسهيل النوم العميق</div>
          </button>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
        <button
          onClick={() => setActiveTab('cockpit')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'cockpit'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Fan className="w-4 h-4" />
          <span>منصة التحكم بضوضاء التكييف</span>
        </button>

        <button
          onClick={() => setActiveTab('iaq')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'iaq'
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>حساسات جودة الهواء IAQ</span>
        </button>

        <button
          onClick={() => setActiveTab('flavors')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'flavors'
              ? 'bg-teal-950/80 text-teal-300 border border-teal-700/60 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Droplets className="w-4 h-4" />
          <span>نكهات القناع البيوفيلي (4 أنماط)</span>
        </button>

        <button
          onClick={() => setActiveTab('ha_bridge')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'ha_bridge'
              ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>جسر Home Assistant وMQTT</span>
        </button>
      </div>

      {/* Tab 1: HVAC Cockpit */}
      {activeTab === 'cockpit' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fan Speed Controller */}
          <div className="lg:col-span-2 bg-stone-900/60 border border-stone-800 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-stone-100 flex items-center gap-2">
                  <Fan className="w-5 h-5 text-cyan-400" />
                  <span>محدد سرعة مروحة التكييف وتدفق الهواء</span>
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  يتكيف المحرك البيوفيلي تلقائياً لضبط ترددات امتصاص الحفيف وفقاً لمعدل ضخ الهواء
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-stone-800 text-xs font-mono text-cyan-300 border border-stone-700">
                {hvac.zoneNameAr}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {speeds.map((s) => {
                const isActive = hvac.speed === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSpeedSelect(s.id)}
                    className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between h-32 relative overflow-hidden ${
                      isActive
                        ? 'bg-cyan-950/70 border-cyan-500/80 text-white shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-400/50'
                        : 'bg-stone-950/50 border-stone-800/80 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    )}
                    <div className="text-stone-400">
                      <Fan className={`w-5 h-5 ${isActive ? 'text-cyan-300 animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                    </div>
                    <div>
                      <div className={`text-xs font-bold leading-snug ${isActive ? 'text-cyan-200' : 'text-stone-300'}`}>
                        {s.labelAr}
                      </div>
                      <div className="text-[10px] text-stone-500 font-mono mt-0.5">{s.labelEn}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Live Acoustic Spectrum Comparison */}
            <div className="bg-stone-950/80 border border-stone-800/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-bold text-stone-200">
                    المقارنة الترددية: ضجيج التكييف الميكانيكي مقابل القناع الحيوي البيوفيلي
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <span className="w-3 h-0.5 bg-rose-500 rounded-full inline-block" />
                    <span>ضوضاء التكييف المزعجة (Raw AC)</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-3 h-0.5 bg-emerald-500 rounded-full inline-block" />
                    <span>الطيف البيوفيلي الممتص (Masked)</span>
                  </span>
                </div>
              </div>

              {/* Graphical Simulation Spectrum */}
              <div className="h-40 w-full relative bg-stone-950 rounded-xl border border-stone-800/50 p-2 flex items-end justify-between gap-1 overflow-hidden">
                {/* 20 frequency bands */}
                {Array.from({ length: 24 }).map((_, i) => {
                  const freq = Math.round(40 * Math.pow(1.3, i));
                  // Raw HVAC curve: high spike at 60Hz and high spike at 800Hz diffuser hiss
                  let rawH = 15;
                  if (i === 1 || i === 2) rawH = hvac.speed === 'off' ? 10 : 85; // 60Hz rumble
                  else if (i >= 8 && i <= 14) rawH = hvac.speed === 'off' ? 8 : 40 + hvac.ductTurbulenceRatio * 45; // Duct hiss
                  else rawH = 10 + Math.sin(i) * 5;

                  // Masked curve: smooth natural 1/f slope
                  const maskedH = hvac.speed === 'off' ? 12 : Math.max(22, 65 - i * 1.8 + Math.cos(i) * 4);

                  return (
                    <div key={i} className="flex-1 flex flex-col justify-end items-center h-full gap-1 group relative">
                      {/* Tooltip on hover */}
                      <div className="hidden group-hover:block absolute bottom-full mb-2 bg-stone-900 border border-stone-700 text-[10px] px-2 py-1 rounded shadow-lg text-white whitespace-nowrap z-20">
                        {freq} Hz: تكييف {rawH}% | بيوفيلي {Math.round(maskedH)}%
                      </div>
                      <div className="w-full flex items-end justify-center gap-0.5 h-full">
                        {/* Raw AC Bar */}
                        <div
                          className="w-1/2 bg-rose-500/70 rounded-t transition-all duration-300"
                          style={{ height: `${rawH}%` }}
                        />
                        {/* Masked Bar */}
                        <div
                          className="w-1/2 bg-emerald-500/80 rounded-t transition-all duration-300"
                          style={{ height: `${maskedH}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                <span>50 Hz (طنين الضاغط)</span>
                <span>250 Hz (هدير الهواء)</span>
                <span>1000 Hz (حفيف الموزعات)</span>
                <span>4000 Hz (صفير الحواف)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Acoustic Duct Physics */}
          <div className="space-y-6">
            <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-6 space-y-5">
              <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-teal-400" />
                <span>خصائص القياس الإكوستيكي للمجاري</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-950/60 border border-stone-800">
                  <span className="text-stone-400">شدة الضجيج الميكانيكي المقدرة</span>
                  <span className="font-mono font-bold text-cyan-300">{hvac.estAcousticDb} dBA</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-950/60 border border-stone-800">
                  <span className="text-stone-400">نسبة اضطراب تدفق الهواء (Turbulence)</span>
                  <span className="font-mono font-bold text-teal-300">{Math.round(hvac.ductTurbulenceRatio * 100)}%</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-950/60 border border-stone-800">
                  <span className="text-stone-400">تردد أزيز الضاغط المركزي</span>
                  <span className="font-mono font-bold text-indigo-300">{hvac.compressorRumbleHz} Hz</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-950/60 border border-stone-800">
                  <span className="text-stone-400">مرشح التحييد الترددي (Notch Filter)</span>
                  <span className="font-mono font-bold text-emerald-400">{currentFlavor.notchCutoffHz} Hz Notch</span>
                </div>
              </div>

              {/* Explainer card */}
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-cyan-200/90 text-xs leading-relaxed">
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>كيف يعمل الامتصاص السيكو-صوتي؟</span>
                </div>
                بدلاً من استخدام ضوضاء بيضاء مزعجة تزيد ضغط الصوت الكلي، يتم توظيف خرير الماء وحفيف النخيل كقناع ممتع يدمج ترددات اندفاع الهواء طبيعياً دون إجهاد الأذن.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: IAQ Multi-Sensor Biophilic Sync */}
      {activeTab === 'iaq' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* PM2.5 Gauge */}
            <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-400 font-semibold">الغبار والجسيمات العالقة PM2.5</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/50 font-mono">
                  {iaq.pm25 > 60 ? 'مرتفع' : 'آمن'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-stone-100">{iaq.pm25}</span>
                <span className="text-xs text-stone-400">µg/m³</span>
              </div>
              <input
                type="range"
                min="5"
                max="150"
                value={iaq.pm25}
                onChange={(e) => manager.updateIaqTelemetry({ pm25: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 bg-stone-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-[11px] text-stone-500">حرك الشريط لمحاكاة غبار أو عاصفة رملية خارجية</div>
            </div>

            {/* CO2 Gauge */}
            <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-400 font-semibold">ثاني أكسيد الكربون CO2</span>
                <span className="text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/50 font-mono">
                  {iaq.co2 > 1000 ? 'بحاجة تهوية' : 'طازج'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-stone-100">{iaq.co2}</span>
                <span className="text-xs text-stone-400">ppm</span>
              </div>
              <input
                type="range"
                min="400"
                max="1800"
                step="50"
                value={iaq.co2}
                onChange={(e) => manager.updateIaqTelemetry({ co2: parseInt(e.target.value) })}
                className="w-full accent-rose-500 bg-stone-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-[11px] text-stone-500">يحفز نغمات بلورية ونسيماً لتنشيط التركيز</div>
            </div>

            {/* TVOC Gauge */}
            <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-400 font-semibold">المركبات العضوية TVOC (بخور)</span>
                <span className="text-xs px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/50 font-mono">
                  {iaq.tvoc > 400 ? 'بخور/عطور' : 'طبيعي'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-stone-100">{iaq.tvoc}</span>
                <span className="text-xs text-stone-400">ppb</span>
              </div>
              <input
                type="range"
                min="50"
                max="800"
                step="25"
                value={iaq.tvoc}
                onChange={(e) => manager.updateIaqTelemetry({ tvoc: parseInt(e.target.value) })}
                className="w-full accent-purple-500 bg-stone-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-[11px] text-stone-500">تفعيل نمط الحديقة العطرية وتناغم الزهور</div>
            </div>

            {/* Temp & Humidity */}
            <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-400 font-semibold">الحرارة والرطوبة الداخلية</span>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50 font-mono">
                  مريحة
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="text-2xl font-bold font-mono text-cyan-300">{iaq.temperatureC}°C</div>
                  <div className="text-[10px] text-stone-500">حرارة الغرفة</div>
                </div>
                <div className="h-8 w-px bg-stone-800" />
                <div>
                  <div className="text-2xl font-bold font-mono text-teal-300">{iaq.humidityPercent}%</div>
                  <div className="text-[10px] text-stone-500">الرطوبة النسبية</div>
                </div>
              </div>
              <div className="text-[11px] text-stone-500">مزامنة توازن ترطيب الصوت الحيوي</div>
            </div>
          </div>

          {/* Active IAQ Profile Card */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-900/90 to-stone-950 border border-stone-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: `${currentIaqProfile.color}20`, border: `1px solid ${currentIaqProfile.color}60` }}
                >
                  <Activity className="w-6 h-6" style={{ color: currentIaqProfile.color }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-100">{currentIaqProfile.nameAr}</h3>
                  <div className="text-xs font-mono text-stone-400">{currentIaqProfile.nameEn}</div>
                </div>
              </div>

              <span
                className="px-3.5 py-1.5 rounded-full text-xs font-bold font-mono border self-start sm:self-auto"
                style={{
                  backgroundColor: `${currentIaqProfile.color}15`,
                  borderColor: `${currentIaqProfile.color}50`,
                  color: currentIaqProfile.color,
                }}
              >
                الاستجابة النشطة: {iaq.statusLabelAr}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-stone-800/80 text-xs">
              <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800">
                <div className="text-stone-400 font-semibold mb-1">شرط التفعيل التلقائي:</div>
                <div className="text-stone-200">{currentIaqProfile.triggerConditionAr}</div>
              </div>

              <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800">
                <div className="text-stone-400 font-semibold mb-1">المواءمة الصوتية البيوفيلية:</div>
                <div className="text-emerald-300 font-medium">{currentIaqProfile.acousticModulationAr}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Psychoacoustic Masking Flavors */}
      {activeTab === 'flavors' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {HVAC_MASKING_FLAVORS.map((flavor) => {
              const isSelected = syncState.activeFlavorId === flavor.id;
              return (
                <div
                  key={flavor.id}
                  onClick={() => handleFlavorSelect(flavor.id)}
                  className={`p-6 rounded-3xl border text-right transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-br from-stone-900 to-cyan-950/40 border-cyan-500 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                      : 'bg-stone-900/60 border-stone-800 hover:border-stone-700 hover:bg-stone-900/80'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${flavor.color}20`, border: `1px solid ${flavor.color}60` }}
                        >
                          <Droplets className="w-5 h-5" style={{ color: flavor.color }} />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-stone-100">{flavor.nameAr}</h4>
                          <span className="text-[11px] text-stone-400 font-mono">{flavor.nameEn}</span>
                        </div>
                      </div>

                      {isSelected ? (
                        <span className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-300 text-xs font-bold">
                          المحدد حالياً
                        </span>
                      ) : (
                        <button className="px-3 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium">
                          تحديد النمط
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-stone-300 leading-relaxed">{flavor.descAr}</p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-stone-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-stone-400">
                      <span>الأفضل لـ:</span>
                      <span className="text-stone-200 font-medium">{flavor.bestFor}</span>
                    </div>

                    <div className="flex items-center justify-between text-stone-400">
                      <span>نطاق التردد المستهدف:</span>
                      <span className="font-mono text-cyan-300">{flavor.maskingFrequencyBand}</span>
                    </div>

                    <div className="flex items-center justify-between text-stone-400">
                      <span>مرشح التحييد الترددي (Notch):</span>
                      <span className="font-mono text-emerald-400">{flavor.notchCutoffHz} Hz</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Home Assistant & MQTT Bridge */}
      {activeTab === 'ha_bridge' && (
        <div className="space-y-6">
          <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-stone-100 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-400" />
                  <span>الربط الشبكي الحي مع Home Assistant وMQTT</span>
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  استقبال سرعات التكييف (Daikin/Mitsubishi VRF) وبيانات حساسات Awair وAirGradient تلقائياً
                </p>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>MQTT Broker: Connected</span>
              </div>
            </div>

            {/* Topics Table */}
            <div className="space-y-2 text-xs">
              <div className="font-semibold text-stone-300">مواضيع MQTT المشتركة في شبكة الفيلا:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800 font-mono">
                  <div className="text-stone-500 text-[10px]">سرعة التكييف HVAC:</div>
                  <div className="text-cyan-300">villa/hvac/daikin_vrf/fan_speed</div>
                </div>

                <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800 font-mono">
                  <div className="text-stone-500 text-[10px]">حساس الغبار PM2.5:</div>
                  <div className="text-amber-300">villa/iaq/airgradient/pm25</div>
                </div>

                <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800 font-mono">
                  <div className="text-stone-500 text-[10px]">حساس ثاني أكسيد الكربون CO2:</div>
                  <div className="text-rose-300">villa/iaq/awair/co2</div>
                </div>

                <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800 font-mono">
                  <div className="text-stone-500 text-[10px]">حساس المركبات العضوية TVOC:</div>
                  <div className="text-purple-300">villa/iaq/awair/tvoc</div>
                </div>
              </div>
            </div>

            {/* Automation Code block */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-300">
                  كود الأتمتة المعتمد في Home Assistant (automations.yaml):
                </span>
                <button
                  onClick={handleCopyYaml}
                  className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copiedYaml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedYaml ? 'تم النسخ!' : 'نسخ الكود'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-stone-950 border border-stone-800/80 text-stone-300 font-mono text-xs overflow-x-auto text-left dir-ltr">
{`- alias: "Biophilic Audio - Adaptive HVAC & IAQ Masking"
  trigger:
    - platform: state
      entity_id: climate.daikin_central_vrf
      attribute: fan_mode
    - platform: numeric_state
      entity_id: sensor.air_gradient_pm25
      above: 55
    - platform: numeric_state
      entity_id: sensor.awair_element_co2
      above: 1000
  action:
    - service: mqtt.publish
      data:
        topic: "villa/biophilic/hvac_iaq/sync"
        payload_template: >
          {
            "fan_speed": "{{ state_attr('climate.daikin_central_vrf', 'fan_mode') }}",
            "pm25": {{ states('sensor.air_gradient_pm25') | float }},
            "co2": {{ states('sensor.awair_element_co2') | float }},
            "tvoc": {{ states('sensor.awair_element_tvoc') | float }}
          }`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Historical Incident & Adaptation Log */}
      <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>سجل أحداث التكيف الصوتي والبيئي التلقائي (Incident Journal)</span>
          </h3>
          <span className="text-xs text-stone-500 font-mono">آخر 24 ساعة</span>
        </div>

        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-200">{log.eventAr}</span>
                  <span className="px-2 py-0.5 rounded bg-stone-800 text-[10px] text-stone-400 font-mono">
                    {log.timestamp}
                  </span>
                </div>
                <div className="text-stone-400 leading-relaxed">{log.actionTakenAr}</div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 font-mono font-bold text-xs">
                  {log.efficiency}% كفاءة
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
