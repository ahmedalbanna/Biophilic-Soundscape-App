'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Layers,
  Sparkles,
  Play,
  Pause,
  Trash2,
  Sliders,
  Volume2,
  VolumeX,
  Compass,
  Check,
  Music,
  Plus,
  Radio,
  FileCheck,
  Disc,
} from 'lucide-react';
import {
  CustomSoundSlot,
  PRELOADED_SOUND_SLOTS,
  extractWaveformPeaks,
  generateCuratedFieldBuffer,
} from '@/lib/custom-soundbank';
import { getAudioEngine } from '@/lib/audio-engine';

interface CustomSoundbankStudioViewProps {
  onEngineStartRequest: () => void;
  isEnginePlaying: boolean;
}

const INITIAL_SLOTS_WITH_WAVEFORMS: CustomSoundSlot[] = PRELOADED_SOUND_SLOTS.map((slot) => ({
  ...slot,
  waveformPoints: [
    0.3, 0.5, 0.8, 0.6, 0.4, 0.7, 0.9, 0.5, 0.3, 0.6, 0.8, 0.7,
    0.4, 0.6, 0.85, 0.7, 0.5, 0.65, 0.9, 0.75, 0.4, 0.55, 0.8, 0.6,
    0.35, 0.7, 0.8, 0.5, 0.3, 0.45, 0.6, 0.75, 0.5, 0.35, 0.25, 0.2,
  ],
}));

export function CustomSoundbankStudioView({
  onEngineStartRequest,
  isEnginePlaying,
}: CustomSoundbankStudioViewProps) {
  const [slots, setSlots] = useState<CustomSoundSlot[]>(INITIAL_SLOTS_WITH_WAVEFORMS);
  const [isDecodingFile, setIsDecodingFile] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);

  // New Slot Ingestion Dialog State
  const [pendingUploadBuffer, setPendingUploadBuffer] = useState<AudioBuffer | null>(null);
  const [pendingFileName, setPendingFileName] = useState<string>('');
  const [pendingSlotType, setPendingSlotType] = useState<'continuous_loop' | 'stochastic_event'>(
    'continuous_loop'
  );
  const [pendingCategory, setPendingCategory] = useState<string>('تسجيلات ميدانية خاصة');
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  // Register and synchronize preloaded curated field recordings into audio engine
  useEffect(() => {
    const engine = getAudioEngine();
    engine.init();
    const ctx = (engine as any).ctx as AudioContext;
    if (!ctx) return;

    PRELOADED_SOUND_SLOTS.forEach((slot) => {
      let soundType: 'canyon_wadi' | 'asir_rain' | 'oasis_palms' | 'bulbul_bird' = 'canyon_wadi';
      if (slot.id === 'slot_asir_rain') soundType = 'asir_rain';
      else if (slot.id === 'slot_palms') soundType = 'oasis_palms';
      else if (slot.id === 'slot_bulbul') soundType = 'bulbul_bird';

      const buffer = generateCuratedFieldBuffer(ctx, soundType);

      engine.registerCustomSoundSlot(
        slot.id,
        buffer,
        slot.type === 'continuous_loop',
        slot.volume,
        slot.pan
      );

      if (slot.isActive && isEnginePlaying) {
        if (slot.type === 'continuous_loop') {
          engine.startCustomLoopSlot(slot.id);
        } else {
          engine.startCustomStochasticScheduler(
            slot.id,
            slot.minIntervalSec,
            slot.maxIntervalSec,
            slot.pitchJitter
          );
        }
      }
    });
  }, [isEnginePlaying]);

  // Handle Drag & Drop File
  const processAudioFile = async (file: File) => {
    setIsDecodingFile(true);
    try {
      const engine = getAudioEngine();
      engine.init();
      const buffer = await engine.decodeAudioBlob(file);
      setPendingUploadBuffer(buffer);
      setPendingFileName(file.name.replace(/\.[^/.]+$/, ''));
      setShowUploadModal(true);
    } catch (err) {
      alert('تعذر فك تشفير هذا الملف الصوتي. يرجى التأكد من أنه ملف FLAC أو WAV أو MP3 سليم.');
    } finally {
      setIsDecodingFile(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAudioFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAudioFile(file);
    }
  };

  // Confirm Adding New Slot
  const handleConfirmUpload = () => {
    if (!pendingUploadBuffer) return;

    const newId = `custom_slot_${Date.now()}`;
    const waveform = extractWaveformPeaks(pendingUploadBuffer);
    const engine = getAudioEngine();

    engine.registerCustomSoundSlot(
      newId,
      pendingUploadBuffer,
      pendingSlotType === 'continuous_loop',
      0.65,
      0
    );

    const newSlot: CustomSoundSlot = {
      id: newId,
      nameAr: pendingFileName || 'تسجيل ميداني جديد',
      nameEn: 'Custom Field Recording',
      type: pendingSlotType,
      categoryAr: pendingCategory,
      durationSec: Math.round(pendingUploadBuffer.duration * 10) / 10,
      sampleRate: pendingUploadBuffer.sampleRate,
      channels: pendingUploadBuffer.numberOfChannels,
      fileFormat: 'FLAC / High-Res PCM',
      volume: 0.65,
      pan: 0,
      minIntervalSec: pendingSlotType === 'stochastic_event' ? 15 : 0,
      maxIntervalSec: pendingSlotType === 'stochastic_event' ? 40 : 0,
      pitchJitter: 1.2,
      isActive: true,
      waveformPoints: waveform,
      audioBuffer: pendingUploadBuffer,
    };

    setSlots((prev) => [newSlot, ...prev]);

    if (!isEnginePlaying) {
      onEngineStartRequest();
    }

    if (pendingSlotType === 'continuous_loop') {
      engine.startCustomLoopSlot(newId);
    } else {
      engine.startCustomStochasticScheduler(newId, 15, 40, 1.2);
    }

    setShowUploadModal(false);
    setPendingUploadBuffer(null);
  };

  // Toggle Slot Active State
  const handleToggleSlotActive = (slotId: string) => {
    const engine = getAudioEngine();
    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.id === slotId) {
          const nextActive = !slot.isActive;
          if (nextActive) {
            if (!isEnginePlaying) onEngineStartRequest();
            if (slot.type === 'continuous_loop') {
              engine.startCustomLoopSlot(slot.id);
            } else {
              engine.startCustomStochasticScheduler(
                slot.id,
                slot.minIntervalSec,
                slot.maxIntervalSec,
                slot.pitchJitter
              );
            }
          } else {
            if (slot.type === 'continuous_loop') {
              engine.stopCustomLoopSlot(slot.id);
            } else {
              engine.stopCustomStochasticScheduler(slot.id);
            }
          }
          return { ...slot, isActive: nextActive };
        }
        return slot;
      })
    );
  };

  // Test Trigger Preview
  const handleAuditionSlot = (slot: CustomSoundSlot) => {
    const engine = getAudioEngine();
    if (!isEnginePlaying) {
      onEngineStartRequest();
    }
    engine.triggerCustomStochasticSlot(slot.id, 0);
  };

  // Change Volume
  const handleSlotVolume = (slotId: string, vol: number) => {
    const engine = getAudioEngine();
    engine.setCustomSlotVolume(slotId, vol);
    setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, volume: vol } : s)));
  };

  // Change Pan
  const handleSlotPan = (slotId: string, pan: number) => {
    const engine = getAudioEngine();
    engine.setCustomSlotPan(slotId, pan);
    setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, pan } : s)));
  };

  // Delete Slot
  const handleDeleteSlot = (slotId: string) => {
    const engine = getAudioEngine();
    engine.removeCustomSlot(slotId);
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <section className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>مستودع التسجيلات الميدانية النقية (Custom FLAC Nature Soundbank)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100">
              استيراد وتوليف أصوات الطبيعة الميدانية النقية
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mt-1">
              ارفع تسجيلاتك الميدانية الحقيقية بصيغة FLAC أو WAV (مثل خرير أودية مدينتك، أمطار منطقتك، أو طيورك المفضلة).
              يقوم المحرك بفك تشفيرها ودمجها مع التراكب الإجرائي وانحسار الكلام التلقائي (Smart Ducking).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-stone-400 bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800">
              طبقات نشطة: <strong className="text-emerald-400">{slots.filter((s) => s.isActive).length}</strong> / {slots.length}
            </span>
          </div>
        </div>
      </section>

      {/* Drag & Drop File Uploader Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`p-8 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
          dragOver
            ? 'border-emerald-500 bg-emerald-950/20 scale-[1.01]'
            : 'border-stone-800 bg-stone-900/40 hover:border-stone-700 hover:bg-stone-900/60'
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400 mb-3 shadow-lg">
          <Upload className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-stone-100 mb-1">
          {isDecodingFile ? 'جاري فك تشفير الملف وتحليله صوتياً...' : 'اسحب وأفلت تسجيلك الطبيعي هنا'}
        </h3>
        <p className="text-xs text-stone-400 max-w-md mb-4 leading-relaxed">
          يدعم ملفات FLAC 24-bit النقي، WAV عالي النقاوة، MP3، وAAC. يتم فحص الطيف الصوتي وعزله وتوليفه لحظياً في
          المتصفح دون رفعه لأي خادم خارجي.
        </p>

        <label className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all">
          <Plus className="w-4 h-4 fill-stone-950" />
          <span>اختر ملفاً صوتياً من جهازك</span>
          <input
            type="file"
            accept="audio/flac,audio/wav,audio/mp3,audio/mpeg,audio/ogg,audio/m4a,.flac,.wav"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>

      {/* Slots Matrix */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Disc className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-semibold text-stone-100">
              طبقات الطبيعة الميدانية المحملة (Active Soundbank Slots)
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-mono">· دمج فوري وتلاشٍ متصالب بدون تقطيع</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className={`p-5 rounded-2xl border transition-all space-y-4 ${
                slot.isActive
                  ? 'bg-stone-900/80 border-emerald-600/80 shadow-xl ring-1 ring-emerald-500/30'
                  : 'bg-stone-950/60 border-stone-800 opacity-70'
              }`}
            >
              {/* Header Info */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-300">
                      {slot.fileFormat}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        slot.type === 'continuous_loop'
                          ? 'bg-sky-950 text-sky-400 border border-sky-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {slot.type === 'continuous_loop' ? 'طبقة مستمرة (Loop)' : 'حدث عشوائي (Stochastic)'}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-100">{slot.nameAr}</h3>
                  <span className="text-xs text-stone-400 block">{slot.categoryAr}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleAuditionSlot(slot)}
                    className="p-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 transition-colors"
                    title="تجربة الاستماع الفوري"
                  >
                    <Play className="w-3.5 h-3.5 fill-stone-200" />
                  </button>

                  <button
                    onClick={() => handleToggleSlotActive(slot.id)}
                    className={`p-2 rounded-xl transition-colors font-bold text-xs ${
                      slot.isActive
                        ? 'bg-emerald-600 text-stone-950'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                    title={slot.isActive ? 'تعطيل الطبقة' : 'تفعيل الطبقة'}
                  >
                    {slot.isActive ? 'مفعل' : 'معطل'}
                  </button>

                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="p-2 rounded-xl bg-stone-950 hover:bg-rose-950 text-stone-500 hover:text-rose-400 border border-stone-800 transition-colors"
                    title="حذف هذا التسجيل"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Waveform Visualization Bars */}
              <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-1 h-12">
                {slot.waveformPoints.map((val, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-full transition-all ${
                      slot.isActive
                        ? 'bg-emerald-500/80 hover:bg-emerald-400'
                        : 'bg-stone-700'
                    }`}
                    style={{ height: `${Math.max(15, val * 100)}%` }}
                  />
                ))}
              </div>

              {/* Volume & Pan Sliders */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                {/* Volume */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-stone-400">
                    <span className="flex items-center gap-1">
                      <Volume2 className="w-3 h-3" />
                      <span>المستوى:</span>
                    </span>
                    <span className="text-stone-200">{Math.round(slot.volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={slot.volume}
                    onChange={(e) => handleSlotVolume(slot.id, parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Pan */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-stone-400">
                    <span className="flex items-center gap-1">
                      <Compass className="w-3 h-3" />
                      <span>التوزيع الفراغي:</span>
                    </span>
                    <span className="text-stone-200">
                      {slot.pan < -0.1 ? `يسار ${Math.round(Math.abs(slot.pan) * 100)}%` : slot.pan > 0.1 ? `يمين ${Math.round(slot.pan * 100)}%` : 'وسط'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-1}
                    max={1}
                    step={0.1}
                    value={slot.pan}
                    onChange={(e) => handleSlotPan(slot.id, parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>

              {/* Stochastic Settings if applicable */}
              {slot.type === 'stochastic_event' && (
                <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] font-mono text-stone-400">
                  <span>فاصل الحدوث العشوائي: {slot.minIntervalSec}s - {slot.maxIntervalSec}s</span>
                  <span className="text-amber-400">تباين النبرة: ±{slot.pitchJitter}st</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Dialog for Upload Configuration */}
      {showUploadModal && pendingUploadBuffer && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-stone-100">تهيئة التسجيل الميداني الجديد</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-stone-400 hover:text-white text-xs px-2 py-1 rounded bg-stone-800"
              >
                إلغاء
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-stone-300 font-semibold block mb-1">اسم التسجيل:</label>
                <input
                  type="text"
                  value={pendingFileName}
                  onChange={(e) => setPendingFileName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">نوع السلوك الصوتي:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPendingSlotType('continuous_loop')}
                    className={`p-3 rounded-xl border text-right space-y-1 transition-all ${
                      pendingSlotType === 'continuous_loop'
                        ? 'bg-emerald-950 border-emerald-600 text-emerald-300 ring-1 ring-emerald-500'
                        : 'bg-stone-950 border-stone-800 text-stone-400'
                    }`}
                  >
                    <span className="font-bold block">طبقة مستمرة (Loop)</span>
                    <span className="text-[10px] block opacity-80">
                      لأصوات خرير المياه، النسيم، المطر المتواصل
                    </span>
                  </button>

                  <button
                    onClick={() => setPendingSlotType('stochastic_event')}
                    className={`p-3 rounded-xl border text-right space-y-1 transition-all ${
                      pendingSlotType === 'stochastic_event'
                        ? 'bg-emerald-950 border-emerald-600 text-emerald-300 ring-1 ring-emerald-500'
                        : 'bg-stone-950 border-stone-800 text-stone-400'
                    }`}
                  >
                    <span className="font-bold block">حدث عشوائي (Stochastic)</span>
                    <span className="text-[10px] block opacity-80">
                      لزقزقة الطيور، حفيف الأغصان، أصوات الرعد
                    </span>
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-stone-400 space-y-1 text-[11px] font-mono">
                <div>المدة: {Math.round(pendingUploadBuffer.duration * 10) / 10} ثانية</div>
                <div>التردد: {pendingUploadBuffer.sampleRate} Hz</div>
                <div>القنوات: {pendingUploadBuffer.numberOfChannels === 2 ? 'Stereo' : 'Mono'}</div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 font-medium text-xs"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmUpload}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                <Check className="w-4 h-4 fill-stone-950" />
                <span>حفظ وإدراج في البيئة الصوتية</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
