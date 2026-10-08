'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { SoundscapeEngineView } from '@/components/SoundscapeEngineView';
import { VadDuckingView } from '@/components/VadDuckingView';
import { CircadianTimelineView } from '@/components/CircadianTimelineView';
import { HardwareTopologyView } from '@/components/HardwareTopologyView';
import { AiAdvisorView } from '@/components/AiAdvisorView';
import { DeploymentIntegrationView } from '@/components/DeploymentIntegrationView';
import { SpatialStudioView } from '@/components/SpatialStudioView';
import { WeatherPrayerSyncView } from '@/components/WeatherPrayerSyncView';
import { BiofeedbackBreathingView } from '@/components/BiofeedbackBreathingView';
import { UrbanNoiseMaskingView } from '@/components/UrbanNoiseMaskingView';
import { SnapcastMediaOverlayView } from '@/components/SnapcastMediaOverlayView';
import { CustomSoundbankStudioView } from '@/components/CustomSoundbankStudioView';
import { RegionalBiomesView } from '@/components/RegionalBiomesView';
import { WallKioskModeView } from '@/components/WallKioskModeView';
import { CircadianLightingSyncView } from '@/components/CircadianLightingSyncView';
import { CircadianSunriseAlarmView } from '@/components/CircadianSunriseAlarmView';
import { AutomatedRoomCalibrationView } from '@/components/AutomatedRoomCalibrationView';
import { SoundscapePreset } from '@/lib/preset-studio';
import { getAudioEngine, ContinuousLayerId, StochasticEventId, AcousticEventLog } from '@/lib/audio-engine';
import { getVadManager, VadStatus, VadConfig } from '@/lib/vad-engine';
import { CIRCADIAN_PHASES, getPhaseForHour, CircadianPhase, SocialPreset } from '@/lib/circadian-data';
import { INITIAL_ZONES, AudioZone } from '@/lib/hardware-zones';
import { ShieldCheck, HeartHandshake, Sparkles, Volume2 } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('engine');
  const [isPlaying, setIsPlaying] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);

  // Continuous layers state
  const [continuousLayers, setContinuousLayers] = useState([
    {
      id: 'water' as ContinuousLayerId,
      nameAr: 'خرير المياه والجدول الرقراق',
      nameEn: 'Babbling Brook Stream',
      volume: 0.65,
      enabled: true,
      description: 'تدفق مائي طبيعي مركب بترددات رنين متغيرة باستمرار، يمنع الملل ويوفر عزلًا ناعماً.',
      icon: 'droplet',
    },
    {
      id: 'breeze' as ContinuousLayerId,
      nameAr: 'نسيم الغابة وحفيف الأشجار',
      nameEn: 'Forest Breeze & Canopy',
      volume: 0.5,
      enabled: true,
      description: 'موجات نسيم وردية ناعمة تحاكي مرور الرياح بين أوراق الأشجار بتدرج لطيف.',
      icon: 'wind',
    },
    {
      id: 'rain' as ContinuousLayerId,
      nameAr: 'رذاذ المطر الهادئ',
      nameEn: 'Gentle Rain Droplet Mask',
      volume: 0.0,
      enabled: false,
      description: 'قناع صوتي دقيق لعزل الضوضاء الخارجية الصاخبة وأصوات شوارع المدينة.',
      icon: 'rain',
    },
    {
      id: 'ocean' as ContinuousLayerId,
      nameAr: 'أمواج الشاطئ الإيقاعية',
      nameEn: 'Tidal Ocean Swell',
      volume: 0.0,
      enabled: false,
      description: 'أمواج بحرية بطيئة متناغمة مع دورات التنفس العميق والاسترخاء الفسيولوجي.',
      icon: 'waves',
    },
  ]);

  // Stochastic events stream
  const [stochasticEvents, setStochasticEvents] = useState<AcousticEventLog[]>([]);

  // VAD & Smart Audio Ducking state
  const [vadStatus, setVadStatus] = useState<VadStatus>({
    isListening: false,
    isSimulating: false,
    isSpeaking: false,
    isDucked: false,
    currentDb: -90,
    currentSpeechScore: 0,
    duckingEnvelope: 1.0,
    micError: null,
  });

  const [vadConfig, setVadConfig] = useState<VadConfig>({
    sensitivityThresholdDb: -42,
    duckingDepthDb: -18,
    attackMs: 150,
    holdMs: 1800,
    releaseMs: 1500,
    speechBandMinHz: 300,
    speechBandMaxHz: 3400,
  });

  // Circadian state with lazy initializer
  const [currentHour, setCurrentHour] = useState(() => {
    if (typeof window === 'undefined') return 7.5;
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
  });
  const [isRealtimeSync, setIsRealtimeSync] = useState(true);
  const [activePhase, setActivePhase] = useState<CircadianPhase>(() => {
    if (typeof window === 'undefined') return CIRCADIAN_PHASES[0];
    const now = new Date();
    const localHour = now.getHours() + now.getMinutes() / 60;
    return getPhaseForHour(localHour);
  });
  const [activeSocialPresetId, setActiveSocialPresetId] = useState<string | null>(null);

  // Multi-room zones
  const [zones, setZones] = useState<AudioZone[]>(INITIAL_ZONES);

  // Initialize Audio & VAD Callbacks
  useEffect(() => {
    const engine = getAudioEngine();
    const vad = getVadManager();

    // Register stochastic event listener
    engine.setStochasticCallback((event) => {
      setStochasticEvents((prev) => [event, ...prev.slice(0, 19)]);
    });

    // Register VAD telemetry callback
    vad.setCallback((status) => {
      setVadStatus(status);
    });

    return () => {
      // Clean up when unmounting
      vad.stopMicrophone();
    };
  }, []);

  // Real-time clock tick when synced
  useEffect(() => {
    if (!isRealtimeSync) return;

    const timer = setInterval(() => {
      const now = new Date();
      const localHour = now.getHours() + now.getMinutes() / 60;
      setCurrentHour(localHour);
      setActivePhase(getPhaseForHour(localHour));
    }, 60000);

    return () => clearInterval(timer);
  }, [isRealtimeSync]);

  // Master Play / Pause
  const handleTogglePlay = async () => {
    const engine = getAudioEngine();
    if (isPlaying) {
      engine.pause();
      setIsPlaying(false);
    } else {
      await engine.start();
      engine.setMasterVolume(isMuted ? 0 : masterVolume);
      continuousLayers.forEach((l) => {
        engine.setLayerVolume(l.id, l.volume, l.enabled);
      });
      setIsPlaying(true);
    }
  };

  // Master Volume
  const handleVolumeChange = (vol: number) => {
    setMasterVolume(vol);
    if (!isMuted) {
      getAudioEngine().setMasterVolume(vol);
    }
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    getAudioEngine().setMasterVolume(nextMute ? 0 : masterVolume);
  };

  // Continuous Layer Volume Change
  const handleLayerChange = (id: ContinuousLayerId, volume: number, enabled: boolean) => {
    setContinuousLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, volume, enabled } : l))
    );
    getAudioEngine().setLayerVolume(id, volume, enabled);
  };

  // Manual Stochastic Event Trigger
  const handleTriggerEvent = (type: StochasticEventId) => {
    const engine = getAudioEngine();
    if (!isPlaying) {
      engine.start().then(() => {
        setIsPlaying(true);
        triggerSpecificEvent(engine, type);
      });
    } else {
      triggerSpecificEvent(engine, type);
    }
  };

  const triggerSpecificEvent = (engine: ReturnType<typeof getAudioEngine>, type: StochasticEventId) => {
    switch (type) {
      case 'birds':
        engine.triggerProceduralBird(true);
        break;
      case 'leaves':
        engine.triggerFoliageRustle(true);
        break;
      case 'crickets':
        engine.triggerCicadaBurst(true);
        break;
      case 'chimes':
        engine.triggerWindChime(true);
        break;
    }
  };

  // VAD Controls
  const handleToggleMic = async () => {
    const vad = getVadManager();
    if (vadStatus.isListening) {
      vad.stopMicrophone();
    } else {
      await vad.startMicrophone();
    }
  };

  const handleSimulateSpeech = (active: boolean) => {
    getVadManager().setSimulatedSpeech(active);
  };

  const handlePulseSimulation = () => {
    getVadManager().toggleSimulationPulse();
  };

  const handleConfigChange = (cfg: Partial<VadConfig>) => {
    setVadConfig((prev) => ({ ...prev, ...cfg }));
    getVadManager().updateConfig(cfg);
  };

  // Circadian Controls
  const handleHourChange = (hour: number) => {
    setCurrentHour(hour);
    setActivePhase(getPhaseForHour(hour));
  };

  const handleToggleRealtimeSync = () => {
    const nextSync = !isRealtimeSync;
    setIsRealtimeSync(nextSync);
    if (nextSync) {
      const now = new Date();
      const localHour = now.getHours() + now.getMinutes() / 60;
      setCurrentHour(localHour);
      setActivePhase(getPhaseForHour(localHour));
    }
  };

  const handleApplyPhasePreset = (phase: CircadianPhase) => {
    setActivePhase(phase);
    setActiveSocialPresetId(null);

    // Apply layers to state & engine
    const engine = getAudioEngine();
    const updated = continuousLayers.map((l) => {
      const vol = phase.layerPresets[l.id];
      const isEnabled = vol > 0.05;
      engine.setLayerVolume(l.id, vol, isEnabled);
      return { ...l, volume: vol, enabled: isEnabled };
    });
    setContinuousLayers(updated);

    if (!isPlaying) {
      handleTogglePlay();
    }
  };

  const handleApplySocialPreset = (preset: SocialPreset) => {
    setActiveSocialPresetId(preset.id);

    // Adjust VAD sensitivity offset
    const newSens = Math.max(-60, Math.min(-20, -42 + preset.duckingSensitivityOffset));
    handleConfigChange({ sensitivityThresholdDb: newSens });

    // Apply layers
    const engine = getAudioEngine();
    const updated = continuousLayers.map((l) => {
      const vol = preset.layerPresets[l.id];
      const isEnabled = vol > 0.05;
      engine.setLayerVolume(l.id, vol, isEnabled);
      return { ...l, volume: vol, enabled: isEnabled };
    });
    setContinuousLayers(updated);

    // Master volume
    handleVolumeChange(preset.masterVolumeTarget);

    if (!isPlaying) {
      handleTogglePlay();
    }
  };

  // Hardware Zones Controls
  const handleZoneVolumeChange = (zoneId: string, volume: number) => {
    setZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, volume } : z))
    );
  };

  const handleToggleZoneMute = (zoneId: string) => {
    setZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, isMuted: !z.isMuted } : z))
    );
  };

  const handleToggleZoneSolo = (zoneId: string) => {
    setZones((prev) => {
      const target = prev.find((z) => z.id === zoneId);
      const isCurrentlySolo = target?.isSolo;
      return prev.map((z) => {
        if (z.id === zoneId) {
          return { ...z, isSolo: !isCurrentlySolo, isMuted: false };
        }
        return { ...z, isSolo: false, isMuted: !isCurrentlySolo };
      });
    });
  };

  const handleZoneOverlayRateChange = (zoneId: string, rate: number) => {
    setZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, dynamicOverlayRate: rate } : z))
    );
  };

  // AI Advisor Recommendation Apply Handler
  const handleApplyAiRecommendation = (rec: {
    layers: { water: number; breeze: number; rain: number; ocean: number };
    vadRecommendedDuckingDb: number;
  }) => {
    const engine = getAudioEngine();
    handleConfigChange({ duckingDepthDb: rec.vadRecommendedDuckingDb });

    const updated = continuousLayers.map((l) => {
      const vol = rec.layers[l.id] ?? l.volume;
      const isEnabled = vol > 0.05;
      engine.setLayerVolume(l.id, vol, isEnabled);
      return { ...l, volume: vol, enabled: isEnabled };
    });
    setContinuousLayers(updated);

    if (!isPlaying) {
      handleTogglePlay();
    }
  };

  // Spatial Preset Apply Handler
  const handleApplySpatialPreset = (preset: SoundscapePreset) => {
    const engine = getAudioEngine();
    handleConfigChange({ duckingDepthDb: preset.vadDuckingDepthDb });

    const updated = continuousLayers.map((l) => {
      const vol = preset.layers[l.id] ?? l.volume;
      const isEnabled = vol > 0.05;
      engine.setLayerVolume(l.id, vol, isEnabled);
      return { ...l, volume: vol, enabled: isEnabled };
    });
    setContinuousLayers(updated);

    if (!isPlaying) {
      handleTogglePlay();
    }
  };

  // Weather Adaptation Apply Handler
  const handleApplyWeatherMix = (layers: { water: number; breeze: number; rain: number; ocean: number }) => {
    const engine = getAudioEngine();
    const updated = continuousLayers.map((l) => {
      const vol = layers[l.id] ?? l.volume;
      const isEnabled = vol > 0.05;
      engine.setLayerVolume(l.id, vol, isEnabled);
      return { ...l, volume: vol, enabled: isEnabled };
    });
    setContinuousLayers(updated);

    if (!isPlaying) {
      handleTogglePlay();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-950 text-stone-100 font-sans selection:bg-emerald-800 selection:text-white">
      {/* Top Bar with Top Bar Contract */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        masterVolume={masterVolume}
        onVolumeChange={handleVolumeChange}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'engine' && (
          <SoundscapeEngineView
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            continuousLayers={continuousLayers}
            onLayerChange={handleLayerChange}
            stochasticEvents={stochasticEvents}
            isDucked={vadStatus.isDucked}
            duckingEnvelope={vadStatus.duckingEnvelope}
            onTriggerEvent={handleTriggerEvent}
          />
        )}

        {activeTab === 'room_eq' && (
          <AutomatedRoomCalibrationView
            onEngineStartRequest={handleTogglePlay}
            isEnginePlaying={isPlaying}
          />
        )}

        {activeTab === 'alarm' && (
          <CircadianSunriseAlarmView
            onEngineStartRequest={handleTogglePlay}
            isEnginePlaying={isPlaying}
            onLayerChange={handleLayerChange}
            onMasterVolumeChange={handleVolumeChange}
          />
        )}

        {activeTab === 'lighting' && (
          <CircadianLightingSyncView
            currentHour={currentHour}
            isDucked={vadStatus.isDucked}
            isPlaying={isPlaying}
          />
        )}

        {activeTab === 'kiosk' && (
          <WallKioskModeView
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            masterVolume={masterVolume}
            onVolumeChange={handleVolumeChange}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            activePhase={activePhase}
            onApplyPhase={handleApplyPhasePreset}
            isVadListening={vadStatus.isListening}
            onToggleMic={handleToggleMic}
            isDucked={vadStatus.isDucked}
            onLayerChange={handleLayerChange}
          />
        )}

        {activeTab === 'regional' && (
          <RegionalBiomesView
            onEngineStartRequest={handleTogglePlay}
            isEnginePlaying={isPlaying}
            onLayerChange={handleLayerChange}
          />
        )}

        {activeTab === 'soundbank' && (
          <CustomSoundbankStudioView
            onEngineStartRequest={handleTogglePlay}
            isEnginePlaying={isPlaying}
          />
        )}

        {activeTab === 'snapcast' && (
          <SnapcastMediaOverlayView
            onEngineStartRequest={handleTogglePlay}
            isEnginePlaying={isPlaying}
          />
        )}

        {activeTab === 'masking' && (
          <UrbanNoiseMaskingView
            onEngineStartRequest={handleTogglePlay}
            isEnginePlaying={isPlaying}
          />
        )}

        {activeTab === 'biofeedback' && (
          <BiofeedbackBreathingView
            onEngineStartRequest={handleTogglePlay}
            isEnginePlaying={isPlaying}
          />
        )}

        {activeTab === 'spatial' && (
          <SpatialStudioView
            onApplyPreset={handleApplySpatialPreset}
            currentLayers={continuousLayers}
          />
        )}

        {activeTab === 'weather_prayer' && (
          <WeatherPrayerSyncView
            onApplyWeatherMix={handleApplyWeatherMix}
            isEnginePlaying={isPlaying}
          />
        )}

        {activeTab === 'vad' && (
          <VadDuckingView
            vadStatus={vadStatus}
            onToggleMic={handleToggleMic}
            onSimulateSpeech={handleSimulateSpeech}
            onPulseSimulation={handlePulseSimulation}
            config={vadConfig}
            onConfigChange={handleConfigChange}
          />
        )}

        {activeTab === 'circadian' && (
          <CircadianTimelineView
            currentHour={currentHour}
            onHourChange={handleHourChange}
            isRealtimeSync={isRealtimeSync}
            onToggleRealtimeSync={handleToggleRealtimeSync}
            activePhase={activePhase}
            onApplyPhasePreset={handleApplyPhasePreset}
            activeSocialPresetId={activeSocialPresetId}
            onApplySocialPreset={handleApplySocialPreset}
          />
        )}

        {activeTab === 'hardware' && (
          <HardwareTopologyView
            zones={zones}
            onZoneVolumeChange={handleZoneVolumeChange}
            onToggleZoneMute={handleToggleZoneMute}
            onToggleZoneSolo={handleToggleZoneSolo}
            onZoneOverlayRateChange={handleZoneOverlayRateChange}
          />
        )}

        {activeTab === 'advisor' && (
          <AiAdvisorView onApplyRecommendation={handleApplyAiRecommendation} />
        )}

        {activeTab === 'deployment' && (
          <DeploymentIntegrationView />
        )}
      </main>

      {/* Architectural Systems & Privacy Footer */}
      <footer className="border-t border-stone-800/80 bg-stone-950 py-10 mt-16 text-xs text-stone-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="font-semibold text-stone-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>خصوصية منزلية تامة (On-Premise Privacy)</span>
              </div>
              <p className="text-stone-400 leading-relaxed text-[11px]">
                تتم معالجة كشف الكلام (VAD) وحساب الطاقة الصوتية محلياً عبر معالج الـ Mini PC / Raspberry Pi.
                لا يتم إرسال أو تسجيل أي صوت بشري أو محادثات عائلية خارج مسكنك إطلاقاً.
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-stone-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>توليد إجرائي غير مكرر (Infinite Procedural Engine)</span>
              </div>
              <p className="text-stone-400 leading-relaxed text-[11px]">
                تطبيق تقنية التراكب الديناميكي يجمع بين الطبقات الصوتية المستمرة والأحداث الستوكاستية العشوائية الموزعة
                فراغياً في أرجاء السقف لمنع التكيف الدماغي وإراحة حاسة السمع.
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-stone-200 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
                <span>التوافق مع المعايير الحيوية (Biophilic Well-Being)</span>
              </div>
              <p className="text-stone-400 leading-relaxed text-[11px]">
                مصمم وفق أحدث معايير الأبنية الصحية (WELL Sound & Mind Standards) لموازنة الجهاز العصبي الذاتي
                وتحفيز فترات الاسترخاء والتركيز المعرفي.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 text-[11px]">
            <div>نظام البيئة الصوتية الحيوية والتكيفية (Biophilic Soundscape Architecture)</div>
            <div className="flex items-center gap-4">
              <span>96.0 kHz / 24-bit PCM DAC Master</span>
              <span>·</span>
              <span>Smart Audio Ducking Envelope v2.8</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
