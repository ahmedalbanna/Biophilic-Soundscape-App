'use client';

import React, { useState, useEffect } from 'react';
import {
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  Clock,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sparkles,
  Compass,
  Mic,
  MicOff,
  Tablet,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { getAudioEngine } from '@/lib/audio-engine';
import { CIRCADIAN_PHASES, CircadianPhase } from '@/lib/circadian-data';
import { REGIONAL_BIOMES, RegionalBiome } from '@/lib/regional-biomes';

interface WallKioskModeViewProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  masterVolume: number;
  onVolumeChange: (vol: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  activePhase: CircadianPhase;
  onApplyPhase: (phase: CircadianPhase) => void;
  isVadListening: boolean;
  onToggleMic: () => void;
  isDucked: boolean;
  onLayerChange: (layerId: 'water' | 'breeze' | 'rain' | 'ocean', volume: number, enabled: boolean) => void;
}

export function WallKioskModeView({
  isPlaying,
  onTogglePlay,
  masterVolume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  activePhase,
  onApplyPhase,
  isVadListening,
  onToggleMic,
  isDucked,
  onLayerChange,
}: WallKioskModeViewProps) {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDimScreenSaver, setIsDimScreenSaver] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [selectedBiomeId, setSelectedBiomeId] = useState<string>('asir_soudah');

  // Clock Ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('ar-SA', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  // Biome Quick Apply
  const handleQuickBiome = (biome: RegionalBiome) => {
    setSelectedBiomeId(biome.id);
    const engine = getAudioEngine();

    engine.setLayerVolume('water', biome.layers.water, biome.layers.water > 0.05);
    engine.setLayerVolume('breeze', biome.layers.breeze, biome.layers.breeze > 0.05);
    engine.setLayerVolume('rain', biome.layers.rain, biome.layers.rain > 0.05);
    engine.setLayerVolume('ocean', biome.layers.ocean, biome.layers.ocean > 0.05);

    onLayerChange('water', biome.layers.water, biome.layers.water > 0.05);
    onLayerChange('breeze', biome.layers.breeze, biome.layers.breeze > 0.05);
    onLayerChange('rain', biome.layers.rain, biome.layers.rain > 0.05);
    onLayerChange('ocean', biome.layers.ocean, biome.layers.ocean > 0.05);
  };

  // Screensaver Overlay (OLED Pure Black Clock Mode)
  if (isDimScreenSaver) {
    return (
      <div
        onClick={() => setIsDimScreenSaver(false)}
        className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-8 select-none cursor-pointer text-center animate-fadeIn"
      >
        <div className="space-y-4 max-w-md">
          <div className="w-3 h-3 rounded-full bg-emerald-500/40 mx-auto animate-ping" />
          <div className="text-6xl sm:text-8xl font-mono font-extralight text-stone-300 tracking-wider">
            {currentTime}
          </div>
          <div className="text-sm sm:text-base text-stone-500 font-medium">{currentDate}</div>
          <div className="pt-6 text-xs text-stone-600 font-mono">
            البيئة الصوتية: {activePhase.nameAr} · انقر على أي مكان بالشاشة للاستيقاظ
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Kiosk Bar */}
      <section className="p-5 rounded-3xl border border-stone-800 bg-stone-900/60 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shadow-md">
            <Tablet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-stone-100">
                لوحة الحائط الذكية (Wall Kiosk Controller)
              </h1>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-xs text-stone-400 font-mono">
              مجهزة ومحسنة لأجهزة الآيباد والتابلت الجدارية ومثبتات PoE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Screensaver Button */}
          <button
            onClick={() => setIsDimScreenSaver(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-300 text-xs font-medium border border-stone-750 transition-colors"
            title="تفعيل وضع شاشة التوقف الموفرة للطاقة"
          >
            <Moon className="w-3.5 h-3.5 text-amber-400" />
            <span>شاشة توقف OLED</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-300 text-xs font-medium border border-stone-750 transition-colors"
            title="تبديل وضع ملء الشاشة للتابلت"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>إنهاء ملء الشاشة</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>ملء الشاشة</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Main Kiosk Center Deck: Master Touch Controls & Giant Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Giant Master Play & Volume Hub (5 cols) */}
        <div className="lg:col-span-5 p-8 rounded-3xl border border-stone-800 bg-stone-900/80 shadow-2xl flex flex-col items-center justify-between text-center space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
              {isPlaying ? 'المحرك الصوتي قيد البث الحي' : 'البيئة متوقفة مؤقتاً'}
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-bold text-stone-100 pt-3">{currentTime}</div>
            <div className="text-xs text-stone-400">{currentDate}</div>
          </div>

          {/* Huge Touch Play/Pause Disc */}
          <button
            onClick={onTogglePlay}
            className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all shadow-2xl transform active:scale-95 ${
              isPlaying
                ? 'bg-emerald-500 text-stone-950 hover:bg-emerald-400 ring-8 ring-emerald-500/20 shadow-emerald-500/30'
                : 'bg-stone-800 text-stone-200 hover:bg-stone-750 ring-8 ring-stone-800/40'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-10 h-10 fill-stone-950" />
                <span className="text-[11px] font-bold mt-1">إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-10 h-10 fill-stone-200 translate-x-0.5" />
                <span className="text-[11px] font-bold mt-1">بدء الطبيعة</span>
              </>
            )}
          </button>

          {/* Giant Touch Volume Bar */}
          <div className="w-full space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-mono text-stone-300">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>مستوى الصوت العام:</span>
              </span>
              <span className="text-base font-bold text-emerald-400">
                {isMuted ? 'صامت' : `${Math.round(masterVolume * 100)}%`}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={isMuted ? 0 : masterVolume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-full h-3 bg-stone-800 rounded-xl appearance-none cursor-pointer accent-emerald-500"
            />

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={onToggleMute}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                  isMuted
                    ? 'bg-rose-950 border-rose-800 text-rose-300'
                    : 'bg-stone-850 border-stone-750 text-stone-300'
                }`}
              >
                {isMuted ? 'إلغاء الكتم' : 'كتم سريع'}
              </button>

              <button
                onClick={onToggleMic}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                  isVadListening
                    ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
                    : 'bg-stone-850 border-stone-750 text-stone-400'
                }`}
              >
                {isVadListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                <span>{isVadListening ? 'كشف الكلام VAD نشط' : 'الميكروفون متوقف'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Quick Biomes & Circadian Shift (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Circadian Phase Wall Selector */}
          <div className="p-6 rounded-3xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <span className="text-xs font-bold text-stone-200">الفترة اليومية التكيفية الحالية:</span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800">
                {activePhase.nameAr}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CIRCADIAN_PHASES.map((phase) => {
                const isSelected = activePhase.id === phase.id;
                return (
                  <button
                    key={phase.id}
                    onClick={() => onApplyPhase(phase)}
                    className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-950/80 border-emerald-600 shadow-md ring-1 ring-emerald-500'
                        : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <span className="text-xs font-bold text-stone-100">{phase.nameAr}</span>
                    <span className="text-[10px] text-stone-400 mt-1">{phase.descriptionAr}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Regional Quick Biome Selector */}
          <div className="p-6 rounded-3xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <span className="text-xs font-bold text-stone-200">تبديل البيئة الإقليمية بنقرة واحدة:</span>
              <span className="text-xs text-stone-400 font-mono">طبيعة شبه الجزيرة الأصيلة</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {REGIONAL_BIOMES.map((biome) => {
                const isSelected = selectedBiomeId === biome.id;
                return (
                  <button
                    key={biome.id}
                    onClick={() => handleQuickBiome(biome)}
                    className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-stone-950 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                        : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-stone-100 block">{biome.nameAr}</span>
                      <span className="text-[10px] text-stone-500">{biome.tagAr}</span>
                    </div>

                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: biome.badgeColor }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
