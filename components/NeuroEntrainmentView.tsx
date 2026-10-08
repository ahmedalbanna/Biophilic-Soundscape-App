'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Zap,
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Server,
  Terminal,
  Copy,
  Check,
  ShieldCheck,
  Volume2,
  Headphones,
  Radio,
  Cpu,
  Waves,
  Feather,
  Info,
  Clock,
  Compass,
} from 'lucide-react';
import {
  BRAINWAVE_BANDS,
  BrainwaveBandId,
  EntrainmentMode,
  PRESET_PROTOCOLS,
  EntrainmentProtocol,
} from '@/lib/neuro-entrainment';
import {
  generatePythonDaemonScript,
  generateSystemdService,
  generateDockerCompose,
  generateInstallationCommands,
  DEFAULT_DAEMON_CONFIG,
  DaemonConfig,
} from '@/lib/standalone-daemon';
import { getAudioEngine } from '@/lib/audio-engine';

interface NeuroEntrainmentViewProps {
  onEngineStartRequest?: () => void;
  isEnginePlaying?: boolean;
}

export function NeuroEntrainmentView({
  onEngineStartRequest,
  isEnginePlaying = false,
}: NeuroEntrainmentViewProps) {
  // Entrainment session state
  const [selectedBand, setSelectedBand] = useState<BrainwaveBandId>('alpha');
  const [targetHz, setTargetHz] = useState<number>(10.0);
  const [carrierHz, setCarrierHz] = useState<number>(256);
  const [mode, setMode] = useState<EntrainmentMode>('hybrid');
  const [subliminalIntensity, setSubliminalIntensity] = useState<number>(0.35);
  const [isEntrainmentActive, setIsEntrainmentActive] = useState<boolean>(false);
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);

  // Standalone Daemon state
  const [daemonTab, setDaemonTab] = useState<'python' | 'systemd' | 'docker' | 'bash'>('python');
  const [daemonConfig, setDaemonConfig] = useState<DaemonConfig>(DEFAULT_DAEMON_CONFIG);

  // Canvas ref for real-time EEG brainwave simulation
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const currentBandConfig = BRAINWAVE_BANDS[selectedBand];

  // Sync with engine when parameters change
  useEffect(() => {
    const engine = getAudioEngine();
    if (isEntrainmentActive) {
      engine.updateNeuroEntrainment({
        targetHz,
        carrierHz,
        mode,
        intensity: subliminalIntensity,
      });
    }
  }, [targetHz, carrierHz, mode, subliminalIntensity, isEntrainmentActive]);

  // Handle band selection
  const handleSelectBand = (bandId: BrainwaveBandId) => {
    setSelectedBand(bandId);
    const band = BRAINWAVE_BANDS[bandId];
    setTargetHz(band.defaultHz);
    setCarrierHz(band.carrierHz);
    if (isEntrainmentActive) {
      const engine = getAudioEngine();
      engine.startNeuroEntrainment(bandId, band.defaultHz, band.carrierHz, mode, subliminalIntensity);
    }
  };

  // Handle Preset Protocol click
  const handleApplyProtocol = (protocol: EntrainmentProtocol) => {
    setSelectedBand(protocol.primaryBand);
    setTargetHz(protocol.targetHz);
    setMode(protocol.mode);
    setSubliminalIntensity(protocol.targetIntensity);
    const band = BRAINWAVE_BANDS[protocol.primaryBand];
    setCarrierHz(band.carrierHz);

    const engine = getAudioEngine();
    if (!isEnginePlaying && onEngineStartRequest) {
      onEngineStartRequest();
    }
    engine.startNeuroEntrainment(
      protocol.primaryBand,
      protocol.targetHz,
      band.carrierHz,
      protocol.mode,
      protocol.targetIntensity
    );
    setIsEntrainmentActive(true);
  };

  // Toggle active entrainment
  const handleToggleEntrainment = () => {
    const engine = getAudioEngine();
    if (isEntrainmentActive) {
      engine.stopNeuroEntrainment(0.5);
      setIsEntrainmentActive(false);
    } else {
      if (!isEnginePlaying && onEngineStartRequest) {
        onEngineStartRequest();
      }
      engine.startNeuroEntrainment(selectedBand, targetHz, carrierHz, mode, subliminalIntensity);
      setIsEntrainmentActive(true);
    }
  };

  // Canvas visualizer animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Background subtle grid
      ctx.strokeStyle = 'rgba(40, 40, 40, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 30) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 20) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      const centerY = height / 2;
      const waveColor =
        selectedBand === 'delta'
          ? '#60a5fa' // Blue
          : selectedBand === 'theta'
          ? '#a78bfa' // Purple
          : selectedBand === 'alpha'
          ? '#34d399' // Emerald
          : selectedBand === 'beta'
          ? '#fbbf24' // Amber
          : '#f43f5e'; // Rose

      // Render primary brainwave (EEG rhythm)
      ctx.lineWidth = isEntrainmentActive ? 2.5 : 1.5;
      ctx.strokeStyle = isEntrainmentActive ? waveColor : 'rgba(160, 160, 160, 0.4)';
      ctx.beginPath();

      const numPoints = width;
      const baseAmp = isEntrainmentActive ? 28 * (0.5 + subliminalIntensity * 0.7) : 14;

      for (let x = 0; x < numPoints; x++) {
        // Multi-harmonic natural EEG simulation
        const t = x / width;
        const mainWave = Math.sin(t * targetHz * 12 + phase);
        const harmonic1 = 0.25 * Math.sin(t * targetHz * 24 + phase * 1.5);
        const carrierMod =
          mode === 'binaural_stereo' || mode === 'hybrid'
            ? 0.15 * Math.sin(t * (carrierHz / 8) + phase * 3)
            : 0;

        const y = centerY + (mainWave + harmonic1 + carrierMod) * baseAmp;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Glow effect if active
      if (isEntrainmentActive) {
        ctx.shadowColor = waveColor;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Phase increment proportional to Hz
      phase += (targetHz * 0.04 + 0.02);
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [targetHz, carrierHz, mode, subliminalIntensity, isEntrainmentActive, selectedBand]);

  const copyCode = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeKey(key);
    setTimeout(() => setCopiedCodeKey(null), 2500);
  };

  return (
    <div className="space-y-8 pb-16" dir="rtl">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-900/90 to-emerald-950/40 border border-stone-800 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>محرك التحفيز العصبي الصوتي الحيوي & تشغيل لينكس المستقل 24/7</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-100 tracking-tight">
              التناغم العصبي وتوجيه موجات الدماغ (Neuro-Acoustic Entrainment)
            </h1>
            <p className="text-stone-300 text-sm md:text-base leading-relaxed">
              تضمين ترددات الرنين الدماغي الطبيعي (Delta, Theta, Alpha, Beta, Gamma) بشكل خفي (Subliminal)
              داخل طبقات المياه والنسيم. يحفّز الاستجابة العصبية (FFR) لتهدئة التوتر، تعميق النوم، وشحذ
              التركيز الذهني دون إجهاد سمعي.
            </p>
          </div>

          {/* Quick Engine Entrainment Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleToggleEntrainment}
              className={`flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg transition-all ${
                isEntrainmentActive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30 hover:scale-[1.02]'
              }`}
            >
              {isEntrainmentActive ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>إيقاف التحفيز العصبي</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>تفعيل التحفيز العصبي اللحظي</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Interactive Brainwave Synchronizer & Real-time Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Controls & Band Selection */}
        <div className="lg:col-span-7 space-y-6">
          {/* Band Selector Tabs */}
          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-stone-100 font-bold text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>اختر النطاق العصبي المستهدف (Target EEG Band):</span>
              </h3>
              <span className="text-xs text-stone-400">
                النطاق النشط: <strong className="text-emerald-400">{currentBandConfig.symbol}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {(Object.keys(BRAINWAVE_BANDS) as BrainwaveBandId[]).map((bandKey) => {
                const band = BRAINWAVE_BANDS[bandKey];
                const isSelected = selectedBand === bandKey;
                return (
                  <button
                    key={bandKey}
                    onClick={() => handleSelectBand(bandKey)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                        : 'bg-stone-950/50 border-stone-800/80 text-stone-400 hover:bg-stone-800/60 hover:text-stone-200'
                    }`}
                  >
                    <span className="text-lg font-black">{band.symbol}</span>
                    <span className="text-xs font-bold mt-0.5">{band.nameEn.split(' ')[0]}</span>
                    <span className="text-[10px] text-stone-400 mt-0.5">
                      {band.hzRange[0]}-{band.hzRange[1]} Hz
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Band Detailed Specs */}
            <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800/80 space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-emerald-400 font-bold text-sm">{currentBandConfig.nameAr}</h4>
                  <p className="text-stone-300 text-xs mt-1 leading-relaxed">
                    {currentBandConfig.descriptionAr}
                  </p>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-700/60 text-stone-300 text-xs font-mono shrink-0">
                  {targetHz.toFixed(1)} Hz
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-stone-800/70 text-xs text-stone-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>الفترة الموصى بها: {currentBandConfig.circadianWindowAr}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>الأثر الفسيولوجي: {currentBandConfig.stateAr}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Sliders & Calibration */}
          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 md:p-6 space-y-5">
            <h3 className="text-stone-100 font-bold text-base flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>معايرة النبض والتردد الحامل (Fine Frequency Calibration):</span>
            </h3>

            {/* Target Hz Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-stone-300 font-medium">
                  تردد التناغم الدماغي (Entrainment Frequency):
                </span>
                <span className="font-mono text-emerald-400 font-bold text-sm">
                  {targetHz.toFixed(1)} Hz ({currentBandConfig.symbol})
                </span>
              </div>
              <input
                type="range"
                min={currentBandConfig.hzRange[0]}
                max={currentBandConfig.hzRange[1]}
                step="0.1"
                value={targetHz}
                onChange={(e) => setTargetHz(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-stone-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                <span>{currentBandConfig.hzRange[0]} Hz</span>
                <span>تردد الرنين التكيفي</span>
                <span>{currentBandConfig.hzRange[1]} Hz</span>
              </div>
            </div>

            {/* Carrier Frequency */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-stone-300 font-medium">التردد الحامل التوافقي (Base Carrier Tone):</span>
                <span className="font-mono text-stone-300 font-bold">{carrierHz} Hz</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[108, 136.1, 216, 256, 288, 432].map((freq) => (
                  <button
                    key={freq}
                    onClick={() => setCarrierHz(freq)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-mono border transition-all ${
                      carrierHz === freq
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {freq} Hz
                  </button>
                ))}
              </div>
            </div>

            {/* Entrainment Mode */}
            <div className="space-y-2">
              <span className="text-stone-300 text-xs font-medium">طريقة بث التناغم الصوتي (Acoustic Mode):</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  onClick={() => setMode('isochronic_biophilic')}
                  className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                    mode === 'isochronic_biophilic'
                      ? 'bg-emerald-950/70 border-emerald-500 text-white'
                      : 'bg-stone-950/50 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">تضمين إيقاعي (سماعات السقف)</span>
                    <Radio className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1">
                    يعمل عبر سماعات الغرفة المخفية دون الحاجة لهيدفون.
                  </p>
                </button>

                <button
                  onClick={() => setMode('binaural_stereo')}
                  className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                    mode === 'binaural_stereo'
                      ? 'bg-emerald-950/70 border-emerald-500 text-white'
                      : 'bg-stone-950/50 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">ثنائي الأذنين (Binaural Stereo)</span>
                    <Headphones className="w-4 h-4 text-cyan-400" />
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1">
                    نغمتان مستقلتان للأذنين لتحفيز العقدة الزيتونية العليا.
                  </p>
                </button>

                <button
                  onClick={() => setMode('hybrid')}
                  className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                    mode === 'hybrid'
                      ? 'bg-emerald-950/70 border-emerald-500 text-white'
                      : 'bg-stone-950/50 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">المزيج الهجين المتكامل (Hybrid)</span>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1">
                    أعلى فعالية؛ يدمج النبض الإيقاعي مع الستيريو الطبيعي.
                  </p>
                </button>
              </div>
            </div>

            {/* Subliminal Intensity Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-stone-300 font-medium">
                  عمق الحضور الخفي (Subliminal Blend Intensity):
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  {Math.round(subliminalIntensity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.05"
                value={subliminalIntensity}
                onChange={(e) => setSubliminalIntensity(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-stone-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500">
                <span>5% خفي تماماً (لا يدركه الوعي)</span>
                <span>35% توازن سريري مثالي</span>
                <span>80% حضور سمعي واضح</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Live EEG Waveform & Protocols */}
        <div className="lg:col-span-5 space-y-6">
          {/* Oscilloscope Card */}
          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-stone-100 font-bold text-sm flex items-center gap-2">
                <Waves className="w-4 h-4 text-emerald-400" />
                <span>مرسمة الذبذبات العصبية الحية (Real-Time EEG Spectrum):</span>
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isEntrainmentActive ? 'bg-emerald-400 animate-pulse' : 'bg-stone-600'
                  }`}
                />
                <span className="text-[11px] text-stone-400">
                  {isEntrainmentActive ? 'بث متزامن نشط' : 'وضع الاستعداد'}
                </span>
              </div>
            </div>

            {/* Oscilloscope Canvas */}
            <div className="relative rounded-xl overflow-hidden border border-stone-800 bg-stone-950 h-44 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={480}
                height={176}
                className="w-full h-full block"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-stone-900/80 text-[10px] font-mono text-stone-400 border border-stone-800">
                {targetHz.toFixed(1)} Hz • {carrierHz} Hz Carrier
              </div>
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-stone-900/80 text-[10px] font-mono text-emerald-400 border border-stone-800">
                {mode === 'isochronic_biophilic' ? 'Isochronic' : mode === 'binaural_stereo' ? 'Binaural' : 'Hybrid 3D'}
              </div>
            </div>

            <p className="text-stone-400 text-xs leading-relaxed">
              الموجة المعروضة توضح إيقاع التعديل السعوي اللحظي (Amplitude Modulation) الذي يتم تراكبه فوق خرير
              الماء وأصوات النسيم الطبيعي.
            </p>
          </div>

          {/* Clinically Structured Protocols */}
          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 md:p-6 space-y-4">
            <h3 className="text-stone-100 font-bold text-sm flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>البروتوكولات الحيوية الجاهزة (One-Click Clinical Protocols):</span>
            </h3>

            <div className="space-y-2.5">
              {PRESET_PROTOCOLS.map((protocol) => (
                <button
                  key={protocol.id}
                  onClick={() => handleApplyProtocol(protocol)}
                  className="w-full text-right p-3 rounded-xl border border-stone-800/80 bg-stone-950/60 hover:bg-stone-850 hover:border-emerald-700/60 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-200 group-hover:text-emerald-400 transition-colors">
                      {protocol.nameAr}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-900 text-stone-400 border border-stone-800">
                      {protocol.targetHz} Hz • {protocol.durationMinutes} دقيقة
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1 leading-normal">
                    {protocol.descriptionAr}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Standalone Linux & Raspberry Pi OS Audio Daemon Suite */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Server className="w-3.5 h-3.5" />
              <span>حزم التشغيل المستقل دون متصفح (Headless 24/7 Engine)</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-stone-100">
              خادم الصوت المستقل للراسبيري باي ولينكس (PipeWire / ALSA Daemon)
            </h2>
            <p className="text-stone-400 text-xs md:text-sm">
              تشغيل بيئة الصوت الحيوية بشكل دائم على أجهزة Raspberry Pi 4/5 أو Mini PC عبر خدمة systemd وحاويات Docker
              مع استهلاك منخفض جداً للمعالج وزمن استجابة فائق الصغر.
            </p>
          </div>

          {/* Daemon Config Details */}
          <div className="flex items-center gap-2 text-xs font-mono bg-stone-950 px-3.5 py-2 rounded-xl border border-stone-800 text-stone-300">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>ALSA {daemonConfig.bufferSize} Frames • {daemonConfig.sampleRate} Hz</span>
          </div>
        </div>

        {/* Studio Tabs */}
        <div className="flex border-b border-stone-800 gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setDaemonTab('python')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              daemonTab === 'python'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>سكربت المحرك biophilic_daemon.py</span>
          </button>

          <button
            onClick={() => setDaemonTab('systemd')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              daemonTab === 'systemd'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>خدمة النظام biophilic-soundscape.service</span>
          </button>

          <button
            onClick={() => setDaemonTab('docker')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              daemonTab === 'docker'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>حاوية docker-compose.yml</span>
          </button>

          <button
            onClick={() => setDaemonTab('bash')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              daemonTab === 'bash'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>أوامر التثبيت والتشغيل (Bash)</span>
          </button>
        </div>

        {/* Tab Content Display with Copy Button */}
        <div className="relative rounded-2xl bg-stone-950 border border-stone-800 p-4 font-mono text-xs overflow-x-auto text-stone-300">
          <div className="absolute top-4 left-4 z-10">
            {daemonTab === 'python' && (
              <button
                onClick={() => copyCode(generatePythonDaemonScript(daemonConfig), 'python')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs transition-all border border-stone-700 shadow"
              >
                {copiedCodeKey === 'python' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCodeKey === 'python' ? 'تم النسخ!' : 'نسخ الكود'}</span>
              </button>
            )}
            {daemonTab === 'systemd' && (
              <button
                onClick={() => copyCode(generateSystemdService(), 'systemd')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs transition-all border border-stone-700 shadow"
              >
                {copiedCodeKey === 'systemd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCodeKey === 'systemd' ? 'تم النسخ!' : 'نسخ الإعداد'}</span>
              </button>
            )}
            {daemonTab === 'docker' && (
              <button
                onClick={() => copyCode(generateDockerCompose(), 'docker')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs transition-all border border-stone-700 shadow"
              >
                {copiedCodeKey === 'docker' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCodeKey === 'docker' ? 'تم النسخ!' : 'نسخ الملف'}</span>
              </button>
            )}
            {daemonTab === 'bash' && (
              <button
                onClick={() => copyCode(generateInstallationCommands(), 'bash')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs transition-all border border-stone-700 shadow"
              >
                {copiedCodeKey === 'bash' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCodeKey === 'bash' ? 'تم النسخ!' : 'نسخ الأوامر'}</span>
              </button>
            )}
          </div>

          <pre className="pr-4 pl-28 py-2 overflow-x-auto leading-relaxed text-[11px]" dir="ltr">
            {daemonTab === 'python' && generatePythonDaemonScript(daemonConfig)}
            {daemonTab === 'systemd' && generateSystemdService()}
            {daemonTab === 'docker' && generateDockerCompose()}
            {daemonTab === 'bash' && generateInstallationCommands()}
          </pre>
        </div>
      </div>
    </div>
  );
}
