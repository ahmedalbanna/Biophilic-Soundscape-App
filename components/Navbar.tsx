'use client';

import React from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  masterVolume: number;
  onVolumeChange: (vol: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export function Navbar({
  activeTab,
  onTabChange,
  isPlaying,
  onTogglePlay,
  masterVolume,
  onVolumeChange,
  isMuted,
  onToggleMute,
}: NavbarProps) {
  const navItems = [
    { id: 'engine', labelAr: 'المحرك الصوتي', labelEn: 'Soundscape Engine' },
    { id: 'snapcast', labelAr: 'التلاوات والغرف', labelEn: 'Snapcast & Media' },
    { id: 'masking', labelAr: 'قناع الضوضاء', labelEn: 'Noise Masking' },
    { id: 'biofeedback', labelAr: 'التنفس والنبض', labelEn: 'Biofeedback & Breath' },
    { id: 'spatial', labelAr: 'التوزيع الفراغي', labelEn: '2D Spatial' },
    { id: 'weather_prayer', labelAr: 'الطقس والصلوات', labelEn: 'Weather & Prayers' },
    { id: 'vad', labelAr: 'كشف الكلام VAD', labelEn: 'Speech & Ducking' },
    { id: 'circadian', labelAr: 'الدورة اليومية', labelEn: 'Circadian Rhythm' },
    { id: 'deployment', labelAr: 'النشر وHome Assistant', labelEn: 'Deployment & HA' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-stone-950/90 backdrop-blur-md border-b border-stone-800/80 px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 font-bold text-sm shadow-sm">
            🍃
          </div>
          <button
            onClick={() => onTabChange('engine')}
            className="text-lg font-bold tracking-tight text-stone-100 hover:text-emerald-400 transition-colors text-right"
          >
            نظام البيئة الصوتية الحيوية
          </button>
        </div>

        {/* Zone 2: 4-5 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`transition-colors relative py-1 text-xs lg:text-sm whitespace-nowrap ${
                  isActive ? 'text-emerald-400 font-semibold' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {item.labelAr}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary functional actions */}
        <div className="flex items-center gap-3">
          {/* Master Volume Slider */}
          <div className="hidden sm:flex items-center gap-2 bg-stone-900/90 border border-stone-800 px-2.5 py-1.5 rounded-lg">
            <button
              onClick={onToggleMute}
              className="text-stone-400 hover:text-stone-200 transition-colors"
              title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : masterVolume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 lg:w-24 accent-emerald-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
              title={`مستوى الصوت العام: ${Math.round(masterVolume * 100)}%`}
            />
            <span className="text-[11px] font-mono text-stone-400 w-7 text-left tabular-nums">
              {isMuted ? '0%' : `${Math.round(masterVolume * 100)}%`}
            </span>
          </div>

          {/* Master Play/Pause Toggle */}
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-stone-950'
                : 'bg-emerald-600 hover:bg-emerald-500 text-stone-950'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>تشغيل النظام</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav row for small screens */}
      <div className="flex md:hidden items-center justify-between gap-1 overflow-x-auto pt-2.5 mt-2 border-t border-stone-900 text-xs">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`px-2 py-1 rounded text-center whitespace-nowrap transition-colors ${
              activeTab === item.id ? 'text-emerald-400 font-semibold bg-stone-900' : 'text-stone-400'
            }`}
          >
            {item.labelAr}
          </button>
        ))}
      </div>
    </header>
  );
}
