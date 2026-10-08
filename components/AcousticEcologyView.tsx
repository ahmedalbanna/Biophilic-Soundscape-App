'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  CloudSun,
  Wind,
  Droplets,
  CloudRain,
  Sun,
  Compass,
  Radio,
  Sliders,
  Sparkles,
  Volume2,
  Check,
  Copy,
  Layers,
  Activity,
  Zap,
  Play,
  RotateCcw,
  Feather,
  Waves,
  Eye,
  Crosshair,
  LocateFixed,
} from 'lucide-react';
import {
  WeatherGroundingState,
  SAUDI_ECOLOGICAL_STATIONS,
  Spatial3DSource,
  INITIAL_3D_SOURCES,
  CEILING_SPEAKER_PODS,
  calculateAcousticWeatherDeltas,
  generateHaWeatherSyncYaml,
} from '@/lib/acoustic-ecology';
import { getAudioEngine } from '@/lib/audio-engine';

interface AcousticEcologyViewProps {
  onEngineStartRequest: () => void;
  isEnginePlaying: boolean;
  onLayerChange: (layerId: 'water' | 'breeze' | 'rain' | 'ocean', volume: number, enabled: boolean) => void;
}

export function AcousticEcologyView({
  onEngineStartRequest,
  isEnginePlaying,
  onLayerChange,
}: AcousticEcologyViewProps) {
  const [selectedStationId, setSelectedStationId] = useState<string>('abha_asir');
  const [currentWeather, setCurrentWeather] = useState<WeatherGroundingState>(
    SAUDI_ECOLOGICAL_STATIONS[0]
  );
  const [spatialSources, setSpatialSources] = useState<Spatial3DSource[]>(INITIAL_3D_SOURCES);
  const [selectedSourceId, setSelectedSourceId] = useState<string>('src_swallow');
  const [copiedYaml, setCopiedYaml] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isOrbitingActive, setIsOrbitingActive] = useState<boolean>(true);

  const selectedSource =
    spatialSources.find((s) => s.id === selectedSourceId) || spatialSources[0];

  // Apply Weather to Audio Engine
  const applyWeatherToEngine = (weather: WeatherGroundingState) => {
    const deltas = calculateAcousticWeatherDeltas(weather);
    const engine = getAudioEngine();

    engine.setLayerVolume('breeze', deltas.breezeVol, true);
    engine.setLayerVolume('water', deltas.waterVol, true);
    engine.setLayerVolume('rain', deltas.rainVol, deltas.rainEnabled);

    onLayerChange('breeze', deltas.breezeVol, true);
    onLayerChange('water', deltas.waterVol, true);
    onLayerChange('rain', deltas.rainVol, deltas.rainEnabled);

    setStatusMessage(
      `تمت مزامنة المحرك الصوتي مع طقس "${weather.cityNameAr}": نسيم (${Math.round(deltas.breezeVol * 100)}%)، مطر (${deltas.rainEnabled ? Math.round(deltas.rainVol * 100) + '%' : 'متوقف'})`
    );
    setTimeout(() => setStatusMessage(''), 3500);
  };

  // Station Selection
  const handleSelectStation = (station: WeatherGroundingState) => {
    setSelectedStationId(station.cityId);
    setCurrentWeather(station);
    applyWeatherToEngine(station);
  };

  // Manual Weather Override
  const handleWeatherChange = (key: keyof WeatherGroundingState, value: number) => {
    const updated = {
      ...currentWeather,
      [key]: value,
      cityNameAr: `${currentWeather.cityNameAr} (تعديل يدوي)`,
    };
    setCurrentWeather(updated);
    applyWeatherToEngine(updated);
  };

  // 3D Orbiting Animation Loop for Spatial Sound Sources
  useEffect(() => {
    if (!isOrbitingActive) return;

    let animFrame: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      setSpatialSources((prev) =>
        prev.map((src) => {
          if (!src.isOrbiting) return src;
          const nextAngle = src.currentAngle + src.orbitSpeed * dt;
          const nextX = Math.cos(nextAngle) * src.orbitRadius;
          const nextY = Math.sin(nextAngle) * src.orbitRadius;

          return {
            ...src,
            currentAngle: nextAngle,
            x: Math.round(nextX * 100) / 100,
            y: Math.round(nextY * 100) / 100,
          };
        })
      );

      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, [isOrbitingActive]);

  // Adjust source position
  const handleSourceCoordChange = (axis: 'x' | 'y' | 'z', val: number) => {
    setSpatialSources((prev) =>
      prev.map((s) => (s.id === selectedSourceId ? { ...s, [axis]: val, isOrbiting: false } : s))
    );
  };

  // Toggle orbiting
  const handleToggleOrbit = (sourceId: string) => {
    setSpatialSources((prev) =>
      prev.map((s) => (s.id === sourceId ? { ...s, isOrbiting: !s.isOrbiting } : s))
    );
  };

  const handleCopyYaml = () => {
    navigator.clipboard.writeText(generateHaWeatherSyncYaml());
    setCopiedYaml(true);
    setTimeout(() => setCopiedYaml(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <section className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              <span>التوسع البيئي والطقس الميداني (Acoustic Ecology & Real Weather)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100">
              الربط الميكرومناخي المباشر والتوزيع الصوتي ثلاثي الأبعاد للسماعات السقفية
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mt-1">
              مزامنة فورية لحركة الرياح الخارجية، الرطوبة، ومعدل هطول الأمطار مع الطبقات الصوتية الإجرائية،
              مع نظام توزيع فراغي ثلاثي الأبعاد (Ambisonics 3D) يتيح توجيه أصوات الطيور والنسيم بين زوايا السقف بدقة.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                if (!isEnginePlaying) onEngineStartRequest();
                applyWeatherToEngine(currentWeather);
              }}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-md transition-all hover:scale-105"
            >
              <Zap className="w-3.5 h-3.5 fill-stone-950" />
              <span>مزامنة الطقس مع الصوت</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="p-3 rounded-xl bg-sky-950/80 border border-sky-800 text-xs text-sky-300 flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-sky-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </section>

      {/* Weather Grounding Stations & Live Meteorological Sliders */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Meteorological Stations Catalog (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-bold text-stone-100">محطات الرصد البيئي الإقليمية</h2>
            </div>
            <span className="text-[10px] font-mono text-stone-400">مباشر</span>
          </div>

          <div className="space-y-2.5">
            {SAUDI_ECOLOGICAL_STATIONS.map((station) => {
              const isSelected = selectedStationId === station.cityId;

              return (
                <div
                  key={station.cityId}
                  onClick={() => handleSelectStation(station)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all space-y-1.5 ${
                    isSelected
                      ? 'bg-stone-950 border-sky-500 shadow-md ring-1 ring-sky-500/40'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-100">{station.cityNameAr}</span>
                    <span className="text-[10px] font-mono text-sky-400">{station.temperatureC}°C</span>
                  </div>

                  <p className="text-[11px] text-stone-400 leading-tight">
                    {station.weatherConditionAr}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 pt-1 border-t border-stone-850">
                    <span>رياح: {station.windSpeedKmh} km/h</span>
                    <span>رطوبة: {station.humidityPct}%</span>
                    <span>مطر: {station.precipitationMm} mm</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Live Meteorological Telemetry & Manual Weather Injection (8 cols) */}
        <div className="lg:col-span-8 p-7 rounded-3xl border border-stone-800 bg-stone-900/80 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="space-y-0.5">
              <span className="text-xs font-mono text-sky-400">المحطة المربوطة حالياً:</span>
              <h3 className="text-base sm:text-lg font-bold text-stone-100">
                {currentWeather.cityNameAr} ({currentWeather.cityNameEn})
              </h3>
            </div>

            <span className="text-xs font-mono text-stone-400 bg-stone-950 px-3 py-1 rounded-xl border border-stone-800">
              {currentWeather.weatherConditionAr}
            </span>
          </div>

          {/* Interactive Atmospheric Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            {/* Wind Speed */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-850 space-y-2">
              <div className="flex justify-between font-mono text-stone-400">
                <span className="flex items-center gap-1.5 text-stone-300">
                  <Wind className="w-3.5 h-3.5 text-sky-400" />
                  <span>سرعة الرياح (Wind Speed):</span>
                </span>
                <span className="text-sky-400 font-bold">{currentWeather.windSpeedKmh} km/h</span>
              </div>
              <input
                type="range"
                min={0}
                max={70}
                step={2}
                value={currentWeather.windSpeedKmh}
                onChange={(e) => handleWeatherChange('windSpeedKmh', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <span className="text-[10px] text-stone-500 block font-mono">
                يتحكم تلقائياً في شدة طبقة النسيم وتردد فلاتر الاضطراب الهوائي.
              </span>
            </div>

            {/* Precipitation Rate */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-850 space-y-2">
              <div className="flex justify-between font-mono text-stone-400">
                <span className="flex items-center gap-1.5 text-stone-300">
                  <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                  <span>الهطول المطري (Rain Rate):</span>
                </span>
                <span className="text-blue-400 font-bold">{currentWeather.precipitationMm.toFixed(1)} mm/h</span>
              </div>
              <input
                type="range"
                min={0}
                max={25}
                step={0.5}
                value={currentWeather.precipitationMm}
                onChange={(e) => handleWeatherChange('precipitationMm', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-[10px] text-stone-500 block font-mono">
                تفعيل تلقائي لطبقة قطرات المطر الإجرائية عند وجود هطول فعلي.
              </span>
            </div>

            {/* Relative Humidity */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-850 space-y-2">
              <div className="flex justify-between font-mono text-stone-400">
                <span className="flex items-center gap-1.5 text-stone-300">
                  <Droplets className="w-3.5 h-3.5 text-teal-400" />
                  <span>الرطوبة الجوية (Relative Humidity):</span>
                </span>
                <span className="text-teal-400 font-bold">{currentWeather.humidityPct}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={2}
                value={currentWeather.humidityPct}
                onChange={(e) => handleWeatherChange('humidityPct', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <span className="text-[10px] text-stone-500 block font-mono">
                تطبيق ظاهرة الامتصاص الصوتي الجوي (Air Absorption) عند الرطوبة العالية.
              </span>
            </div>

            {/* Solar Elevation Deg */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-850 space-y-2">
              <div className="flex justify-between font-mono text-stone-400">
                <span className="flex items-center gap-1.5 text-stone-300">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>زاوية ارتفاع الشمس (Solar Elevation):</span>
                </span>
                <span className="text-amber-400 font-bold">{currentWeather.solarElevationDeg}°</span>
              </div>
              <input
                type="range"
                min={-30}
                max={90}
                step={2}
                value={currentWeather.solarElevationDeg}
                onChange={(e) => handleWeatherChange('solarElevationDeg', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-[10px] text-stone-500 block font-mono">
                يحدد وتيرة كورس تغريد الطيور الصباحية ومرحلة السكون الليلي.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3D In-Ceiling Spatializer & Sound Object Orbiting Canvas */}
      <section className="p-7 rounded-3xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base sm:text-lg font-bold text-stone-100">
                التوزيع الصوتي الفراغي ثلاثي الأبعاد في السقف (In-Ceiling 3D Spatializer)
              </h2>
            </div>
            <p className="text-xs text-stone-400 mt-1 max-w-xl">
              توجيه حقيقي لمصادر الصوت الحيوية (طيور، نسيم القمم، خرير الماء الأرضي) بين السماعات السقفية
              الموزعة عبر محاكاة كروية دقيقة ثلاثية الأبعاد (X, Y, Z Elevation).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOrbitingActive(!isOrbitingActive)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-colors ${
                isOrbitingActive
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-stone-800 text-stone-400'
              }`}
            >
              {isOrbitingActive ? 'الطواف الحركي نشط (Orbiting)' : 'الطواف متوقف'}
            </button>
          </div>
        </div>

        {/* 3D Visualizer Canvas & Sound Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Visual Ceiling Floorplan (7 cols) */}
          <div className="lg:col-span-7 aspect-square max-h-[380px] w-full mx-auto rounded-3xl bg-stone-950 border border-stone-800 relative flex items-center justify-center overflow-hidden shadow-inner p-4">
            {/* Room Boundary Grid Lines */}
            <div className="absolute inset-4 rounded-2xl border border-stone-800/80 pointer-events-none" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-3/4 h-3/4 rounded-full border border-stone-850 border-dashed" />
              <div className="w-1/2 h-1/2 rounded-full border border-stone-850/60" />
            </div>

            {/* In-Ceiling Speaker Pods (4 corners + center sub) */}
            {CEILING_SPEAKER_PODS.map((pod) => {
              // Convert -1..1 to 0..100%
              const leftPct = 50 + pod.x * 40;
              const topPct = 50 - pod.y * 40;

              return (
                <div
                  key={pod.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
                  style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                >
                  <div className="w-8 h-8 rounded-full bg-stone-900 border border-stone-700 flex items-center justify-center text-[10px] font-mono font-bold text-stone-300 shadow-md">
                    {pod.channel}
                  </div>
                  <span className="text-[9px] font-mono text-stone-500 mt-1 whitespace-nowrap">
                    {pod.labelAr.split(' ')[0]}
                  </span>
                </div>
              );
            })}

            {/* Listener Position in Center */}
            <div className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 pointer-events-none" style={{ left: '50%', top: '50%' }}>
              <div className="w-4 h-4 rounded-full bg-emerald-500/80 ring-4 ring-emerald-500/20" />
              <span className="text-[9px] font-mono text-emerald-400 mt-1">موضع المستمع</span>
            </div>

            {/* Moving 3D Sound Sources */}
            {spatialSources.map((source) => {
              const leftPct = 50 + source.x * 40;
              const topPct = 50 - source.y * 40;
              const isSelected = selectedSourceId === source.id;

              return (
                <div
                  key={source.id}
                  onClick={() => setSelectedSourceId(source.id)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-75 flex flex-col items-center z-20 ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                  }`}
                  style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shadow-lg border border-white/30 text-stone-950 font-bold"
                    style={{ backgroundColor: source.color }}
                  >
                    {source.type === 'bird' && <Feather className="w-3.5 h-3.5 fill-current" />}
                    {source.type === 'breeze' && <Wind className="w-3.5 h-3.5" />}
                    {source.type === 'water' && <Waves className="w-3.5 h-3.5" />}
                  </div>
                  <span
                    className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded mt-1 shadow-sm whitespace-nowrap"
                    style={{ backgroundColor: `${source.color}22`, color: source.color }}
                  >
                    {source.nameAr.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Sound Source Controls & Coordinate Tuners (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-stone-950 border border-stone-850 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-850">
              <span className="text-xs font-mono text-stone-400">الكائن الصوتي المحدد:</span>
              <span
                className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                style={{ backgroundColor: `${selectedSource.color}22`, color: selectedSource.color }}
              >
                {selectedSource.nameAr}
              </span>
            </div>

            {/* Source Selector Pills */}
            <div className="flex items-center gap-2">
              {spatialSources.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSourceId(s.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
                    selectedSourceId === s.id
                      ? 'bg-stone-800 text-stone-100 font-bold border border-stone-700'
                      : 'bg-stone-900 text-stone-500'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span>{s.nameAr.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            {/* Coordinate Sliders */}
            <div className="space-y-3 pt-2 text-xs font-mono">
              <div className="space-y-1">
                <div className="flex justify-between text-stone-400">
                  <span>المحور الأفقي (X: يسار / يمين):</span>
                  <span className="text-stone-200">{selectedSource.x}</span>
                </div>
                <input
                  type="range"
                  min={-1}
                  max={1}
                  step={0.05}
                  value={selectedSource.x}
                  onChange={(e) => handleSourceCoordChange('x', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-stone-400">
                  <span>المحور الرأسي (Y: خلف / أمام):</span>
                  <span className="text-stone-200">{selectedSource.y}</span>
                </div>
                <input
                  type="range"
                  min={-1}
                  max={1}
                  step={0.05}
                  value={selectedSource.y}
                  onChange={(e) => handleSourceCoordChange('y', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-stone-400">
                  <span>ارتفاع السقف (Z: الارتفاع ثلاثي الأبعاد):</span>
                  <span className="text-stone-200">{selectedSource.z * 100}% (سقف)</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={selectedSource.z}
                  onChange={(e) => handleSourceCoordChange('z', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            {/* Orbit toggle for source */}
            <div className="pt-2">
              <button
                onClick={() => handleToggleOrbit(selectedSource.id)}
                className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                  selectedSource.isOrbiting
                    ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
                    : 'bg-stone-900 border-stone-800 text-stone-400'
                }`}
              >
                {selectedSource.isOrbiting ? 'إيقاف مسار الطواف الدائري' : 'تفعيل الطواف الدائري بالسقف'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Avian Seasonal Migration Guide & HA Exporter */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Avian Migration Atlas (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-3xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-800">
            <Feather className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-stone-100">
              التقويم البيئي لهجرة الطيور في شبه الجزيرة (Avian Migration Calendar)
            </h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-stone-950 border border-stone-850 space-y-1">
              <div className="flex justify-between font-mono">
                <span className="text-stone-200 font-bold">البلبل أبيض الخدين (White-cheeked Bulbul)</span>
                <span className="text-emerald-400">طائر مقيم دائم</span>
              </div>
              <p className="text-[11px] text-stone-400">
                صوت الصباح الأصيل في واحات وبساتين الجزيرة، يتواجد في طبقة زقزقة الفجر اليومية.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-stone-950 border border-stone-850 space-y-1">
              <div className="flex justify-between font-mono">
                <span className="text-stone-200 font-bold">الوروار الأوروبي والأخضر (Bee-eaters)</span>
                <span className="text-amber-400">مهاجر ربيعي / صيفي</span>
              </div>
              <p className="text-[11px] text-stone-400">
                نداءات متتابعة ناعمة تعبر سماء عسير ووادي حنيفة خلال فترات الانتقال الفصلي.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-stone-950 border border-stone-850 space-y-1">
              <div className="flex justify-between font-mono">
                <span className="text-stone-200 font-bold">حمام النخيل والقمري (Palm & Turtle Doves)</span>
                <span className="text-sky-400">هجرة الخريف والشتاء</span>
              </div>
              <p className="text-[11px] text-stone-400">
                هديل دافئ في فترات العصر والظهيرة متناغم مع حفيف سعف النخيل في واحة الأحساء.
              </p>
            </div>
          </div>
        </div>

        {/* Home Assistant Live Weather YAML Automation (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-3xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <CloudSun className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-stone-100">
                أتمتة ربط محطة الطقس الخارجية (Home Assistant Weather MQTT)
              </h3>
            </div>

            <button
              onClick={handleCopyYaml}
              className="flex items-center gap-1 text-xs font-mono text-sky-400 hover:text-sky-300 transition-colors"
            >
              {copiedYaml ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedYaml ? 'تم النسخ!' : 'نسخ الكود'}</span>
            </button>
          </div>

          <p className="text-xs text-stone-400">
            انسخ هذا الكود لربط حساسات الرياح والمطر في حديقة منزلك لبث بياناتها الحية إلى المحرك الصوتي.
          </p>

          <pre
            className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 text-[11px] font-mono text-stone-300 overflow-x-auto max-h-52 leading-relaxed"
            dir="ltr"
          >
            {generateHaWeatherSyncYaml()}
          </pre>
        </div>
      </section>
    </div>
  );
}
