'use client';

import React, { useState } from 'react';
import {
  Users,
  Coffee,
  Heart,
  BookOpen,
  Sun,
  Feather,
  Moon,
  Sparkles,
  Volume2,
  Sliders,
  Check,
  Copy,
  Layers,
  Zap,
  Play,
  Lightbulb,
  Mic,
  Plus,
  Compass,
  FileText,
} from 'lucide-react';
import {
  FamilySocialContext,
  INITIAL_FAMILY_CONTEXTS,
  generateHaFamilyScenesYaml,
} from '@/lib/family-contexts';
import { getAudioEngine } from '@/lib/audio-engine';

interface FamilySocialContextsViewProps {
  onEngineStartRequest: () => void;
  isEnginePlaying: boolean;
  onLayerChange: (layerId: 'water' | 'breeze' | 'rain' | 'ocean', volume: number, enabled: boolean) => void;
}

export function FamilySocialContextsView({
  onEngineStartRequest,
  isEnginePlaying,
  onLayerChange,
}: FamilySocialContextsViewProps) {
  const [contexts, setContexts] = useState<FamilySocialContext[]>(INITIAL_FAMILY_CONTEXTS);
  const [activeContextId, setActiveContextId] = useState<string>('hospitality_majlis');
  const [copiedScenes, setCopiedScenes] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);

  // New Custom Moment Form State
  const [customName, setCustomName] = useState<string>('قهوة المغربية العائلية');
  const [customWaterVol, setCustomWaterVol] = useState<number>(0.55);
  const [customBreezeVol, setCustomBreezeVol] = useState<number>(0.45);
  const [customKelvin, setCustomKelvin] = useState<number>(2800);
  const [customBrightness, setCustomBrightness] = useState<number>(65);

  const activeContext = contexts.find((c) => c.id === activeContextId) || contexts[0];

  // Activate context on audio engine & lighting
  const handleActivateContext = (ctx: FamilySocialContext) => {
    setActiveContextId(ctx.id);
    if (!isEnginePlaying) {
      onEngineStartRequest();
    }

    const engine = getAudioEngine();
    const cfg = ctx.config;

    // Apply continuous layers
    engine.setLayerVolume('water', cfg.waterVolume, cfg.waterEnabled);
    engine.setLayerVolume('breeze', cfg.breezeVolume, cfg.breezeEnabled);
    engine.setLayerVolume('rain', cfg.rainVolume, cfg.rainEnabled);
    engine.setLayerVolume('ocean', cfg.oceanVolume, cfg.oceanEnabled);

    onLayerChange('water', cfg.waterVolume, cfg.waterEnabled);
    onLayerChange('breeze', cfg.breezeVolume, cfg.breezeEnabled);
    onLayerChange('rain', cfg.rainVolume, cfg.rainEnabled);
    onLayerChange('ocean', cfg.oceanVolume, cfg.oceanEnabled);

    // Apply smart ducking settings
    engine.applyDucking(false, cfg.vadDuckingDepthDb);

    setStatusMessage(`تم تفعيل سياق "${ctx.nameAr}" وضبط التراكب الصوتي والإضاءة فورياً بنجاح!`);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // Add custom moment
  const handleSaveCustomMoment = (e: React.FormEvent) => {
    e.preventDefault();
    const newContext: FamilySocialContext = {
      id: `custom_${Date.now()}`,
      nameAr: customName,
      nameEn: 'Custom Family Moment',
      badgeAr: 'لحظة عائلية مخصصة',
      taglineAr: 'بيئة مخصصة ومصممة بأيدي أفراد الأسرة',
      descriptionAr: `بيئة صوتية وإضاءة مخصصة بحرارة ${customKelvin}K وتدفق مائي بنسبة ${Math.round(customWaterVol * 100)}%.`,
      socialDynamicAr: 'جلسة عائلية خاصة ومخصصة حسب رغبة الأسرة.',
      acousticPhilosophyAr: 'مزيج مخصص متوازن من خرير الماء والنسيم.',
      lightingDescriptionAr: `إضاءة متناغمة ${customKelvin}K بشدة ${customBrightness}%.`,
      color: '#f97316',
      iconName: 'heart',
      config: {
        waterVolume: customWaterVol,
        waterEnabled: true,
        breezeVolume: customBreezeVol,
        breezeEnabled: true,
        rainVolume: 0,
        rainEnabled: false,
        oceanVolume: 0,
        oceanEnabled: false,
        birdDensity: 0.5,
        vadSensitivity: 75,
        vadDuckingDepthDb: -18,
        targetKelvin: customKelvin,
        targetBrightnessPct: customBrightness,
      },
    };

    setContexts((prev) => [newContext, ...prev]);
    setIsCustomModalOpen(false);
    handleActivateContext(newContext);
  };

  const handleCopyScenesYaml = () => {
    navigator.clipboard.writeText(generateHaFamilyScenesYaml());
    setCopiedScenes(true);
    setTimeout(() => setCopiedScenes(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <section className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>السياقات العائلية والضيافة (Family Social Contexts & Hospitality)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100">
              سياقات الأسرة والمناسبات الاجتماعية التكيفية (Adaptive Family Presets)
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mt-1">
              أوضاع صوتية وضوئية متناغمة مصممة خصيصاً للحظات الأسرة: من مجالس الضيافة الكريمة، إلى شاي العصر
              مع الوالدين، ومذاكرة الأبناء، وحتى سكون ما بعد منتصف الليل.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={() => setIsCustomModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>صنع لحظة عائلية مخصصة</span>
            </button>

            <button
              onClick={handleCopyScenesYaml}
              className="px-4 py-2 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-300 border border-stone-750 text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              {copiedScenes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
              <span>{copiedScenes ? 'تم نسخ المشاهد!' : 'تصدير مشاهد HA Scenes'}</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-800 text-xs text-amber-300 flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </section>

      {/* Active Context Status Banner HUD */}
      <section className="p-6 rounded-3xl border border-stone-800 bg-stone-900/80 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow Aura */}
        <div
          className="absolute -top-12 -left-12 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
          style={{ backgroundColor: activeContext.color }}
        />

        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border shadow-sm"
              style={{
                backgroundColor: `${activeContext.color}22`,
                borderColor: activeContext.color,
                color: activeContext.color,
              }}
            >
              {activeContext.badgeAr}
            </span>
            <span className="text-xs font-mono text-stone-400">السياق النشط حالياً في المنزل</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-stone-100">{activeContext.nameAr}</h2>
          <p className="text-xs text-stone-300 leading-relaxed">{activeContext.taglineAr}</p>
        </div>

        {/* Live Audio-Photonic Specs Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono relative z-10 shrink-0 w-full md:w-auto">
          <div className="p-3 rounded-2xl bg-stone-950 border border-stone-850 space-y-1 text-center">
            <span className="text-[10px] text-stone-500 block">الإضاءة الحيوية:</span>
            <span className="text-amber-400 font-bold">{activeContext.config.targetKelvin}K</span>
            <span className="text-[10px] text-stone-400 block">{activeContext.config.targetBrightnessPct}% شدة</span>
          </div>

          <div className="p-3 rounded-2xl bg-stone-950 border border-stone-850 space-y-1 text-center">
            <span className="text-[10px] text-stone-500 block">تدفق الماء:</span>
            <span className="text-sky-400 font-bold">
              {Math.round(activeContext.config.waterVolume * 100)}%
            </span>
            <span className="text-[10px] text-stone-400 block">
              نسيم: {Math.round(activeContext.config.breezeVolume * 100)}%
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-stone-950 border border-stone-850 space-y-1 text-center">
            <span className="text-[10px] text-stone-500 block">كشف الكلام (VAD):</span>
            <span className="text-emerald-400 font-bold">
              حساسية {activeContext.config.vadSensitivity}%
            </span>
            <span className="text-[10px] text-rose-400 block">
              {activeContext.config.vadDuckingDepthDb} dB خفض
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-stone-950 border border-stone-850 space-y-1 text-center">
            <span className="text-[10px] text-stone-500 block">كثافة الطيور:</span>
            <span className="text-teal-400 font-bold">
              {Math.round(activeContext.config.birdDensity * 100)}%
            </span>
            <span className="text-[10px] text-stone-400 block">أصوات عشوائية</span>
          </div>
        </div>
      </section>

      {/* Preset Cards Grid (6 Cultural Cards) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-semibold text-stone-100">
              كتالوج الأوضاع العائلية الجاهزة (Preset Social Contexts)
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-mono">· انقر لتفعيل اللحظة فورياً على المحرك الصوتي</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {contexts.map((ctx) => {
            const isActive = activeContextId === ctx.id;

            return (
              <div
                key={ctx.id}
                onClick={() => handleActivateContext(ctx)}
                className={`p-6 rounded-3xl border cursor-pointer transition-all space-y-4 flex flex-col justify-between relative overflow-hidden ${
                  isActive
                    ? 'bg-stone-900 border-amber-500 shadow-xl ring-1 ring-amber-500/40'
                    : 'bg-stone-950/80 border-stone-800 hover:border-stone-700 hover:bg-stone-900/40'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shadow-sm"
                      style={{
                        backgroundColor: `${ctx.color}18`,
                        borderColor: ctx.color,
                        color: ctx.color,
                      }}
                    >
                      {ctx.badgeAr}
                    </span>

                    {isActive && (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-amber-400 font-bold">
                        <Check className="w-3.5 h-3.5" />
                        <span>نشط حالياً</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-stone-100">{ctx.nameAr}</h3>
                    <p className="text-xs text-stone-400 mt-1 leading-relaxed">{ctx.descriptionAr}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-stone-850 text-[11px] font-mono text-stone-400">
                  <div className="flex items-center justify-between">
                    <span>السياق الاجتماعي:</span>
                    <span className="text-stone-300 font-bold truncate max-w-[170px]">{ctx.socialDynamicAr.split('،')[0]}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>الإضاءة:</span>
                    <span className="text-amber-400 font-bold">{ctx.config.targetKelvin}K</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>خفض الكلام:</span>
                    <span className="text-rose-400 font-bold">{ctx.config.vadDuckingDepthDb} dB</span>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivateContext(ctx);
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                        isActive
                          ? 'bg-amber-500 text-stone-950'
                          : 'bg-stone-850 hover:bg-stone-800 text-stone-300'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{isActive ? 'هذا السياق قيد التشغيل' : 'تفعيل هذه اللحظة الآن'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modal: Custom Family Moment Builder */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base sm:text-lg font-bold text-stone-100">
                  صنع لحظة عائلية مخصصة (Custom Family Moment)
                </h3>
              </div>
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="text-stone-500 hover:text-stone-300 text-lg font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomMoment} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-stone-300 block">اسم اللحظة العائلية:</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 font-sans text-sm"
                  placeholder="مثال: قهوة المغربية مع الوالدة في الفناء"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-stone-400">
                  <span>تدفق خرير الماء:</span>
                  <span className="text-sky-400 font-bold">{Math.round(customWaterVol * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={customWaterVol}
                  onChange={(e) => setCustomWaterVol(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-stone-400">
                  <span>نسيم الهواء العليل:</span>
                  <span className="text-teal-400 font-bold">{Math.round(customBreezeVol * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={customBreezeVol}
                  onChange={(e) => setCustomBreezeVol(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-stone-400">
                  <span>حرارة الإضاءة الحيوية (Kelvin):</span>
                  <span className="text-amber-400 font-bold">{customKelvin}K</span>
                </div>
                <input
                  type="range"
                  min={1800}
                  max={5000}
                  step={50}
                  value={customKelvin}
                  onChange={(e) => setCustomKelvin(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-400 hover:text-stone-200"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow-md"
                >
                  حفظ وتفعيل اللحظة الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
