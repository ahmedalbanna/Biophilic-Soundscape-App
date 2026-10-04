'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Mic,
  MicOff,
  Sliders,
  Check,
  Volume2,
  Sparkles,
  Zap,
  Activity,
  Fan,
  Car,
  Users,
  Hammer,
  RotateCcw,
  Info,
} from 'lucide-react';
import {
  URBAN_NOISE_PROFILES,
  NoiseProfile,
  SpectrumBands,
  RoomAcousticProfiler,
} from '@/lib/noise-masking';
import { getAudioEngine } from '@/lib/audio-engine';

interface UrbanNoiseMaskingViewProps {
  onEngineStartRequest: () => void;
  isEnginePlaying: boolean;
}

export function UrbanNoiseMaskingView({
  onEngineStartRequest,
  isEnginePlaying,
}: UrbanNoiseMaskingViewProps) {
  const [selectedProfileId, setSelectedProfileId] = useState<string>('traffic_rumble');
  const [maskingIntensity, setMaskingIntensity] = useState<number>(0.65);
  const [isMaskActive, setIsMaskActive] = useState<boolean>(false);

  // Microphone Profiler State
  const [isMicListening, setIsMicListening] = useState<boolean>(false);
  const [bands, setBands] = useState<SpectrumBands>({
    lowSub: 35,
    midLow: 55,
    midSpeech: 30,
    high: 18,
    dominantBand: 'mid_traffic',
    ambientDbApprox: 48,
  });
  const [isFingerprinting, setIsFingerprinting] = useState<boolean>(false);
  const [fingerprintDone, setFingerprintDone] = useState<boolean>(false);

  const profilerRef = useRef<RoomAcousticProfiler | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize and clean up profiler
  useEffect(() => {
    profilerRef.current = new RoomAcousticProfiler();
    return () => {
      profilerRef.current?.stop();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Poll spectrum data when microphone is active
  useEffect(() => {
    if (!isMicListening) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const poll = () => {
      if (profilerRef.current) {
        const live = profilerRef.current.getLiveSpectrumBands();
        setBands(live);
      }
      animFrameRef.current = requestAnimationFrame(poll);
    };

    animFrameRef.current = requestAnimationFrame(poll);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isMicListening]);

  // Toggle Microphone
  const handleToggleMic = async () => {
    if (isMicListening) {
      profilerRef.current?.stop();
      setIsMicListening(false);
    } else {
      try {
        await profilerRef.current?.startMicrophone();
        setIsMicListening(true);
      } catch (err) {
        alert('تعذر الوصول إلى الميكروفون. يرجى السماح بالإذن في المتصفح.');
      }
    }
  };

  // Capture Acoustic Fingerprint (5 seconds analysis)
  const handleCaptureFingerprint = () => {
    if (!isMicListening) {
      handleToggleMic();
    }
    setIsFingerprinting(true);
    setFingerprintDone(false);

    setTimeout(() => {
      setIsFingerprinting(false);
      setFingerprintDone(true);

      // Auto select the detected dominant noise profile
      const detected = URBAN_NOISE_PROFILES.find((p) => p.targetBand === bands.dominantBand);
      if (detected) {
        setSelectedProfileId(detected.id);
      }
    }, 3500);
  };

  // Apply or Disable Mask
  const handleApplyMask = (profileId: string, intensity: number) => {
    const profile = URBAN_NOISE_PROFILES.find((p) => p.id === profileId);
    if (!profile) return;

    if (!isEnginePlaying) {
      onEngineStartRequest();
    }

    const engine = getAudioEngine();
    engine.applyUrbanNoiseMask(profile.targetBand, intensity);
    setIsMaskActive(true);
    setSelectedProfileId(profileId);
  };

  const handleDisableMask = () => {
    const engine = getAudioEngine();
    engine.applyUrbanNoiseMask('none');
    setIsMaskActive(false);
  };

  const activeProfile = URBAN_NOISE_PROFILES.find((p) => p.id === selectedProfileId) || URBAN_NOISE_PROFILES[0];

  const getProfileIcon = (iconName: string) => {
    switch (iconName) {
      case 'fan':
        return <Fan className="w-4 h-4" />;
      case 'car':
        return <Car className="w-4 h-4" />;
      case 'users':
        return <Users className="w-4 h-4" />;
      case 'hammer':
        return <Hammer className="w-4 h-4" />;
      default:
        return <ShieldAlert className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <section className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>قناع الضوضاء الحضرية النشط (Active Urban Noise Masking Studio)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100">
              تحليل طيف الضوضاء المنزلية وحجب المشتتات الخارجية
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mt-1">
              يقوم النظام بتحليل الترددات المزعجة في غرفتك (أزيز التكييف، حركة المرور، محادثات الجيران، أو أعمال البناء)
              ويولّد أطيافاً بيوفيلية متطابقة تحجب الضوضاء دون التسبب في إجهاد سمعي وفق معايير WELL العالمية.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleToggleMic}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                isMicListening
                  ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
                  : 'bg-stone-800 hover:bg-stone-750 text-stone-200 border-stone-700'
              }`}
            >
              {isMicListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span>إيقاف تحليل الميكروفون</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  <span>بدء تحليل ضوضاء الغرفة</span>
                </>
              )}
            </button>

            <button
              onClick={handleCaptureFingerprint}
              disabled={isFingerprinting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 fill-stone-950" />
              <span>{isFingerprinting ? 'جاري أخذ البصمة...' : 'أخذ بصمة الغرفة الصوتية'}</span>
            </button>
          </div>
        </div>

        {fingerprintDone && (
          <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 flex items-center justify-between gap-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                تم تحليل الغرفة بنجاح: الضوضاء المهيمنة هي <strong>{activeProfile.nameAr}</strong>. تم تحضير قناع بيوفيلي مخصص لها!
              </span>
            </div>
            <button
              onClick={() => handleApplyMask(activeProfile.id, maskingIntensity)}
              className="px-3 py-1 bg-emerald-500 text-stone-950 font-bold rounded-lg text-xs hover:bg-emerald-400 shrink-0"
            >
              تطبيق القناع الآن
            </button>
          </div>
        )}
      </section>

      {/* Main Grid: Acoustic Spectrum Analyzer (7 cols) + Active Masking Control (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Acoustic Spectrum RTA (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl border border-stone-800 bg-stone-900/60 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm sm:text-base font-bold text-stone-100">
                محلل الطيف الترددي اللحظي (Real-Time Acoustic Analyzer)
              </h2>
            </div>
            <span className="text-xs font-mono text-stone-400">
              مستوى الضوضاء التقديري: <strong className="text-emerald-400">{bands.ambientDbApprox} dBA</strong>
            </span>
          </div>

          {/* 4 Critical Frequency Bands Meters */}
          <div className="space-y-4">
            {/* Band 1: Low Sub (50-140Hz) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-stone-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>الترددات المنخفضة جداً (50Hz - 140Hz) - طنين التكييف والمضخات</span>
                </span>
                <span className="text-stone-400 font-bold">{bands.lowSub}%</span>
              </div>
              <div className="w-full h-2.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-150"
                  style={{ width: `${bands.lowSub}%` }}
                />
              </div>
            </div>

            {/* Band 2: Mid-Low (160-480Hz) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-stone-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>الترددات المتوسطة المنخفضة (160Hz - 480Hz) - حركة المرور والشارع</span>
                </span>
                <span className="text-stone-400 font-bold">{bands.midLow}%</span>
              </div>
              <div className="w-full h-2.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-150"
                  style={{ width: `${bands.midLow}%` }}
                />
              </div>
            </div>

            {/* Band 3: Mid-Speech (500-2000Hz) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-stone-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>نطاق وضوح الكلام (500Hz - 2000Hz) - تمتمة وأصوات المحادثات</span>
                </span>
                <span className="text-stone-400 font-bold">{bands.midSpeech}%</span>
              </div>
              <div className="w-full h-2.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-150"
                  style={{ width: `${bands.midSpeech}%` }}
                />
              </div>
            </div>

            {/* Band 4: High (2200-6000Hz) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-stone-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>الترددات الحادة العالية (2200Hz - 6000Hz) - أعمال البناء والصفير</span>
                </span>
                <span className="text-stone-400 font-bold">{bands.high}%</span>
              </div>
              <div className="w-full h-2.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-150"
                  style={{ width: `${bands.high}%` }}
                />
              </div>
            </div>
          </div>

          {/* RTA Spectral Visualization Bars (24 bands simulation) */}
          <div className="pt-2 border-t border-stone-800">
            <span className="text-[11px] font-mono text-stone-500 block mb-2">
              طيف الترددات المقروء (RTA Real-Time FFT):
            </span>
            <div className="h-20 flex items-end justify-between gap-1 p-2 rounded-xl bg-stone-950 border border-stone-800">
              {Array.from({ length: 24 }).map((_, i) => {
                const heightPercent = isMicListening
                  ? Math.min(100, Math.max(10, (bands.lowSub + bands.midLow + Math.sin(i * 0.8) * 30)))
                  : 15 + Math.sin(i * 0.5) * 12;

                return (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-sm transition-all duration-100"
                    style={{ height: `${heightPercent}%` }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active Masking Synthesizer Control (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl border border-stone-800 bg-stone-900/60 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <h2 className="text-sm sm:text-base font-bold text-stone-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>مُركّب القناع البيوفيلي النشط</span>
            </h2>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                isMaskActive
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-stone-800 text-stone-400'
              }`}
            >
              {isMaskActive ? 'القناع قيد البث' : 'القناع غير مفعل'}
            </span>
          </div>

          {/* Active Profile Info Card */}
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-100 font-bold text-sm">
                <div
                  className="p-1.5 rounded-lg text-stone-950"
                  style={{ backgroundColor: activeProfile.color }}
                >
                  {getProfileIcon(activeProfile.icon)}
                </div>
                <span>{activeProfile.nameAr}</span>
              </div>
              <span className="text-[10px] font-mono text-stone-500">{activeProfile.freqRange}</span>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed pt-1">
              {activeProfile.descAr}
            </p>

            <div className="pt-2 border-t border-stone-800/80 text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{activeProfile.acousticMaskAr}</span>
            </div>
          </div>

          {/* Mask Intensity Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-stone-300 font-mono">
              <span>كثافة القناع البيوفيلي (Masking Depth):</span>
              <span className="text-emerald-400 font-bold">{Math.round(maskingIntensity * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={1.0}
              step={0.05}
              value={maskingIntensity}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setMaskingIntensity(val);
                if (isMaskActive) {
                  handleApplyMask(selectedProfileId, val);
                }
              }}
              className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-stone-500 font-mono">
              <span>شفاف وخافت</span>
              <span>عزل تام ومكثف</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => handleApplyMask(selectedProfileId, maskingIntensity)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Volume2 className="w-4 h-4 fill-stone-950" />
              <span>تطبيق هذا القناع الآن</span>
            </button>

            {isMaskActive && (
              <button
                onClick={handleDisableMask}
                className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs transition-colors"
                title="إلغاء القناع"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Urban Noise Profiles Catalog */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-semibold text-stone-100">
              كتالوج أقنعة الترددات الحضرية (Urban Noise Counter-Profiles)
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-mono">· اختر القناع المناسب لمصدر الإزعاج في مسكنك</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {URBAN_NOISE_PROFILES.map((profile) => {
            const isSelected = selectedProfileId === profile.id;
            return (
              <div
                key={profile.id}
                onClick={() => setSelectedProfileId(profile.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-stone-900 border-emerald-600 shadow-xl ring-1 ring-emerald-500/40'
                    : 'bg-stone-950/70 border-stone-800 hover:border-stone-700 hover:bg-stone-900/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="p-2 rounded-xl text-stone-950 font-bold"
                    style={{ backgroundColor: profile.color }}
                  >
                    {getProfileIcon(profile.icon)}
                  </div>
                  <span className="text-[10px] font-mono text-stone-400 bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
                    {profile.freqRange}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-stone-100 mb-1">{profile.nameAr}</h3>
                <p className="text-[11px] text-stone-400 line-clamp-2 mb-3 leading-relaxed">
                  {profile.descAr}
                </p>

                <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] font-mono text-emerald-400">
                  <span>المعايير: WELL Compliant</span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
