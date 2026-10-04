'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Play,
  Pause,
  Upload,
  Volume2,
  VolumeX,
  Sliders,
  Sparkles,
  Wifi,
  Check,
  Copy,
  Layers,
  BookOpen,
  Headphones,
  Server,
  FileCode,
  Music,
} from 'lucide-react';
import {
  INITIAL_SNAPCAST_CLIENTS,
  SnapcastZoneClient,
  CURATED_MEDIA_TRACKS,
  CuratedMediaTrack,
  generateSnapserverConf,
  generateSnapclientService,
} from '@/lib/snapcast-media';
import { getAudioEngine } from '@/lib/audio-engine';

interface SnapcastMediaOverlayViewProps {
  onEngineStartRequest: () => void;
  isEnginePlaying: boolean;
}

export function SnapcastMediaOverlayView({
  onEngineStartRequest,
  isEnginePlaying,
}: SnapcastMediaOverlayViewProps) {
  // Snapcast Clients State
  const [clients, setClients] = useState<SnapcastZoneClient[]>(INITIAL_SNAPCAST_CLIENTS);
  const [isMultiRoomBroadcasting, setIsMultiRoomBroadcasting] = useState<boolean>(true);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [copiedConfig, setCopiedConfig] = useState<boolean>(false);

  // Media Overlay State
  const [selectedTrackId, setSelectedTrackId] = useState<string>('quran_rahman');
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const [customAudioTitle, setCustomAudioTitle] = useState<string>('');
  const [isMediaPlaying, setIsMediaPlaying] = useState<boolean>(false);
  const [mediaVolume, setMediaVolume] = useState<number>(0.85);
  const [duckingDepthDb, setDuckingDepthDb] = useState<number>(-16);
  const [isAutoDuckingEnabled, setIsAutoDuckingEnabled] = useState<boolean>(true);

  // Media Playback Progress
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeTrack = customAudioUrl
    ? {
        id: 'custom',
        titleAr: customAudioTitle || 'ملف صوتي خاص',
        titleEn: 'Custom Audio',
        categoryAr: 'ملف محلي',
        categoryEn: 'Local File',
        readerOrAuthorAr: 'تلاوة أو تسجيل من جهازك',
        audioUrl: customAudioUrl,
        defaultDuckingDb: duckingDepthDb,
      }
    : CURATED_MEDIA_TRACKS.find((t) => t.id === selectedTrackId) || CURATED_MEDIA_TRACKS[0];

  // Initialize Audio Element Routing into Biophilic Engine
  useEffect(() => {
    if (!audioRef.current) return;
    const engine = getAudioEngine();
    engine.connectMediaElement(audioRef.current);
    engine.setMediaVolume(mediaVolume);
  }, [mediaVolume]);

  // Handle Play/Pause
  const handleTogglePlayMedia = async () => {
    if (!audioRef.current) return;

    if (isMediaPlaying) {
      audioRef.current.pause();
      setIsMediaPlaying(false);
      const engine = getAudioEngine();
      engine.setMediaOverlayDucking(false);
    } else {
      // Ensure nature engine is also active so background bed is audible
      if (!isEnginePlaying) {
        onEngineStartRequest();
      }

      try {
        await audioRef.current.play();
        setIsMediaPlaying(true);
        const engine = getAudioEngine();
        if (isAutoDuckingEnabled) {
          engine.setMediaOverlayDucking(true, duckingDepthDb);
        }
      } catch (err) {
        console.error('Audio playback error', err);
      }
    }
  };

  // Track progress updater
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  // Handle Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  // Handle Custom Audio File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomAudioUrl(url);
      setCustomAudioTitle(file.name.replace(/\.[^/.]+$/, ''));
      setIsMediaPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = url;
      }
    }
  };

  // Snapcast Zone Updates
  const handleClientVolumeChange = (id: string, vol: number) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, volume: vol } : c)));
  };

  const handleToggleClientMute = (id: string) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, muted: !c.muted } : c)));
  };

  const handleLatencyOffsetChange = (id: string, offset: number) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, latencyOffsetMs: offset } : c)));
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hidden Audio Element for Web Audio Routing */}
      <audio
        ref={audioRef}
        src={activeTrack.audioUrl}
        crossOrigin="anonymous"
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setIsMediaPlaying(false);
          getAudioEngine().setMediaOverlayDucking(false);
        }}
        preload="metadata"
      />

      {/* Header */}
      <section className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>البث المتزامن وتراكب الوسائط (Snapcast Multi-Room & Media Overlay)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100">
              تراكب التلاوات القرآنية وبث الغرف المتزامن عبر Snapcast
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mt-1">
              امزج تلاوتك المفضلة أو البودكاست مع خلفية الطبيعة الحية بانحسار ذكي وتلقائي لأصوات الطبيعة (Smart Bed
              Ducking)، مع توزيع الصوت متزامناً بدقة أجزاء الملي ثانية لكافة أجهزة Raspberry Pi في المنزل.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowConfigModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 text-xs font-medium transition-colors"
            >
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>إعدادات Snapserver Daemon</span>
            </button>
          </div>
        </div>

        {/* Live Status Banner */}
        <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 text-xs text-stone-300 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <span>
              بروتوكول البث اللحظي: <strong>Snapcast FIFO Pipe @ 48kHz / 16-bit FLAC</strong>
            </span>
            <span className="font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 text-[10px]">
              تزامن فائق: 0.8ms Jitter
            </span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
            <input
              type="checkbox"
              checked={isMultiRoomBroadcasting}
              onChange={(e) => setIsMultiRoomBroadcasting(e.target.checked)}
              className="w-4 h-4 rounded accent-emerald-500"
            />
            <span className="text-stone-300">بث متزامن لكافة الغرف</span>
          </label>
        </div>
      </section>

      {/* Main Grid: Quran & Media Overlay Deck (7 cols) + Dual Ducking Mixer (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Quran & Media Overlay Player (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl border border-stone-800 bg-stone-900/60 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm sm:text-base font-bold text-stone-100">
                مشغل التلاوات والوسائط المتراكبة (Media & Recitation Overlay)
              </h2>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                isMediaPlaying
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-stone-800 text-stone-400'
              }`}
            >
              {isMediaPlaying ? 'قيد التلاوة والبث' : 'متوقف'}
            </span>
          </div>

          {/* Current Playing Track Card */}
          <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  {activeTrack.categoryAr}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-stone-100">{activeTrack.titleAr}</h3>
                <p className="text-xs text-stone-400">{activeTrack.readerOrAuthorAr}</p>
              </div>

              {/* Upload Custom File Button */}
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-semibold cursor-pointer border border-stone-700 transition-colors shrink-0">
                <Upload className="w-3.5 h-3.5 text-sky-400" />
                <span>رفع ملف صوتي</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Scrubber / Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[11px] font-mono text-stone-400">
                <span>{formatSeconds(currentTime)}</span>
                <span>{formatSeconds(duration)}</span>
              </div>
            </div>

            {/* Play/Pause & Volume Controls */}
            <div className="pt-2 flex items-center justify-between gap-4">
              <button
                onClick={handleTogglePlayMedia}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs transition-all shadow-lg"
              >
                {isMediaPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-stone-950" />
                    <span>إيقاف مؤقت للتلاوة</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-stone-950" />
                    <span>بدء تشغيل التلاوة فوق الطبيعة</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-stone-400" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={mediaVolume}
                  onChange={(e) => setMediaVolume(parseFloat(e.target.value))}
                  className="w-24 sm:w-32 h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <span className="text-xs font-mono text-stone-400 tabular-nums">
                  {Math.round(mediaVolume * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Curated Tracks List */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-stone-400 block">تلاوات ومقاطع مختارة:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {CURATED_MEDIA_TRACKS.map((t) => {
                const isSelected = selectedTrackId === t.id && !customAudioUrl;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTrackId(t.id);
                      setCustomAudioUrl(null);
                      setIsMediaPlaying(false);
                      if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current.src = t.audioUrl;
                      }
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-stone-950 border-emerald-600 shadow-md ring-1 ring-emerald-500/30'
                        : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <span className="text-xs font-bold text-stone-200 block truncate">{t.titleAr}</span>
                    <span className="text-[10px] text-stone-400 block truncate mt-0.5">
                      {t.readerOrAuthorAr}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Dual Crossfader & Auto-Ducking Tuning (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl border border-stone-800 bg-stone-900/60 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm sm:text-base font-bold text-stone-100">
                التنظيم الذكي للخلفية الطبيعية (Nature Bed Ducking)
              </h2>
            </div>
          </div>

          {/* Auto Ducking Explanation & Badge */}
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-300 font-semibold">حالة انحسار أصوات الطبيعة:</span>
              <span
                className={`font-mono text-[10px] px-2 py-0.5 rounded ${
                  isMediaPlaying && isAutoDuckingEnabled
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-stone-900 text-stone-400'
                }`}
              >
                {isMediaPlaying && isAutoDuckingEnabled
                  ? `أصوات الطبيعة منخفضة بنسبة (${duckingDepthDb}dB)`
                  : 'أصوات الطبيعة كاملة (0dB)'}
              </span>
            </div>

            <p className="text-[11px] text-stone-400 leading-relaxed">
              عند بدء التلاوة، تنحسر أصوات خرير الماء ونسيم الأشجار تلقائياً بنعومة إلى مستوى خافت جداً لتشكل بساطاً
              طبيعياً هادئاً تحت صوت القارئ دون أن تشوش عليه. وعند توقف التلاوة، تعود أصوات الطبيعة للتدفق تلقائياً.
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-stone-800">
              <span className="text-xs text-stone-300">تفعيل الانحسار التلقائي:</span>
              <input
                type="checkbox"
                checked={isAutoDuckingEnabled}
                onChange={(e) => {
                  setIsAutoDuckingEnabled(e.target.checked);
                  const engine = getAudioEngine();
                  if (!e.target.checked) {
                    engine.setMediaOverlayDucking(false);
                  } else if (isMediaPlaying) {
                    engine.setMediaOverlayDucking(true, duckingDepthDb);
                  }
                }}
                className="w-4 h-4 rounded accent-emerald-500"
              />
            </div>
          </div>

          {/* Ducking Depth Selector */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-stone-300 font-mono">
              <span>عمق خفض خلفية الطبيعة أثناء التلاوة:</span>
              <span className="text-emerald-400 font-bold">{duckingDepthDb} dB</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              {[
                { db: -12, label: 'خفيف (-12dB)' },
                { db: -16, label: 'متوازن (-16dB)' },
                { db: -22, label: 'عميق (-22dB)' },
              ].map((opt) => (
                <button
                  key={opt.db}
                  onClick={() => {
                    setDuckingDepthDb(opt.db);
                    if (isMediaPlaying && isAutoDuckingEnabled) {
                      getAudioEngine().setMediaOverlayDucking(true, opt.db);
                    }
                  }}
                  className={`py-2 rounded-xl border text-center transition-colors ${
                    duckingDepthDb === opt.db
                      ? 'bg-emerald-950 border-emerald-600 text-emerald-300 font-bold'
                      : 'bg-stone-950 border-stone-800 text-stone-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Snapcast Multi-Room Zone Matrix */}
      <section className="space-y-4 pt-4 border-t border-stone-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-semibold text-stone-100">
              مصفوفة بث الغرف المتزامن (Snapcast Multi-Room Clients)
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-mono">· دقة تزامن زمنية بالميكروثانية عبر شبكة المنزل</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {clients.map((client) => (
            <div
              key={client.id}
              className="p-5 rounded-2xl border border-stone-800 bg-stone-900/60 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono text-emerald-400">متصل ومتزامن</span>
                  </div>
                  <h3 className="text-sm font-bold text-stone-100">{client.nameAr}</h3>
                  <span className="text-[10px] font-mono text-stone-500">{client.ipAddress}</span>
                </div>

                <button
                  onClick={() => handleToggleClientMute(client.id)}
                  className={`p-2 rounded-xl transition-colors ${
                    client.muted ? 'bg-rose-950 text-rose-300' : 'bg-stone-800 text-stone-300'
                  }`}
                >
                  {client.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-[11px] text-stone-400 leading-tight">
                {client.speakerSpecsAr}
              </p>

              {/* Volume Slider */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs text-stone-400 font-mono">
                  <span>الصوت:</span>
                  <span className="text-stone-200">{Math.round(client.volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={client.muted ? 0 : client.volume}
                  onChange={(e) => handleClientVolumeChange(client.id, parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Latency Calibration Offset */}
              <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] font-mono text-stone-400">
                <span>تعديل التأخير الزمني:</span>
                <span className="text-emerald-400 font-bold">{client.latencyOffsetMs}ms</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Snapserver Linux Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-stone-100">
                  ملف إعداد خادم البث المتزامن (/etc/snapserver.conf)
                </h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-stone-400 hover:text-white text-xs px-2 py-1 rounded bg-stone-800"
              >
                إغلاق
              </button>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              انسخ هذا الملف وضعه في جهاز الخادم الرئيسي (Raspberry Pi 5 أو Mini PC) لتشغيل خادم Snapserver وبث صوت
              المحرك والتلاوات لجميع غرف المنزل عبر بروتوكول FLAC منخفض التأخير:
            </p>

            <pre className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-72">
              {generateSnapserverConf()}
            </pre>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs font-mono text-stone-500">منفذ Snapserver الافتراضي: 1704 / 1780</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateSnapserverConf());
                  setCopiedConfig(true);
                  setTimeout(() => setCopiedConfig(false), 2500);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs flex items-center gap-2"
              >
                {copiedConfig ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedConfig ? 'تم النسخ للحافظة!' : 'نسخ الإعدادات'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
