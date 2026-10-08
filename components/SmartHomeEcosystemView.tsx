'use client';

import React, { useState } from 'react';
import {
  Home,
  Mic,
  Smartphone,
  Cpu,
  Radio,
  Check,
  Copy,
  Code,
  Sparkles,
  Play,
  Volume2,
  Sliders,
  Layers,
  Zap,
  Terminal,
  QrCode,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import {
  SiriShortcut,
  SIRI_SHORTCUTS_LIST,
  HacsEntityDefinition,
  INITIAL_HACS_ENTITIES,
  generateHacsManifestJson,
  generateHacsMediaPlayerPy,
  generateLovelaceCardYaml,
  generateHomebridgeConfigJson,
} from '@/lib/smart-home-ecosystem';
import { getAudioEngine } from '@/lib/audio-engine';
import { REGIONAL_BIOMES } from '@/lib/regional-biomes';

interface SmartHomeEcosystemViewProps {
  onEngineStartRequest: () => void;
  isEnginePlaying: boolean;
  onLayerChange: (layerId: 'water' | 'breeze' | 'rain' | 'ocean', volume: number, enabled: boolean) => void;
}

export function SmartHomeEcosystemView({
  onEngineStartRequest,
  isEnginePlaying,
  onLayerChange,
}: SmartHomeEcosystemViewProps) {
  const [activeCodeTab, setActiveCodeTab] = useState<'lovelace' | 'python' | 'homebridge' | 'manifest'>('lovelace');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeShortcutId, setActiveShortcutId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [entities, setEntities] = useState<HacsEntityDefinition[]>(INITIAL_HACS_ENTITIES);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Execute Siri Shortcut Live in Browser
  const handleExecuteShortcut = (shortcut: SiriShortcut) => {
    setActiveShortcutId(shortcut.id);
    if (!isEnginePlaying) {
      onEngineStartRequest();
    }

    const engine = getAudioEngine();

    // Map shortcut to biomes
    if (shortcut.targetBiomeOrPhase === 'wadi_hanifah') {
      const biome = REGIONAL_BIOMES.find((b) => b.id === 'najd_hanifah');
      if (biome) {
        engine.setLayerVolume('water', biome.layers.water, true);
        engine.setLayerVolume('breeze', biome.layers.breeze, true);
        engine.setLayerVolume('rain', 0, false);
        engine.setLayerVolume('ocean', 0, false);
        onLayerChange('water', biome.layers.water, true);
        onLayerChange('breeze', biome.layers.breeze, true);
        onLayerChange('rain', 0, false);
        onLayerChange('ocean', 0, false);
      }
    } else if (shortcut.targetBiomeOrPhase === 'asir_soudah') {
      const biome = REGIONAL_BIOMES.find((b) => b.id === 'asir_soudah');
      if (biome) {
        engine.setLayerVolume('water', biome.layers.water, true);
        engine.setLayerVolume('breeze', biome.layers.breeze, true);
        engine.setLayerVolume('rain', biome.layers.rain, true);
        engine.setLayerVolume('ocean', 0, false);
        onLayerChange('water', biome.layers.water, true);
        onLayerChange('breeze', biome.layers.breeze, true);
        onLayerChange('rain', biome.layers.rain, true);
        onLayerChange('ocean', 0, false);
      }
    } else if (shortcut.targetBiomeOrPhase === 'farasan_sea') {
      const biome = REGIONAL_BIOMES.find((b) => b.id === 'farasan_islands');
      if (biome) {
        engine.setLayerVolume('ocean', biome.layers.ocean, true);
        engine.setLayerVolume('breeze', biome.layers.breeze, true);
        engine.setLayerVolume('water', 0, false);
        engine.setLayerVolume('rain', 0, false);
        onLayerChange('ocean', biome.layers.ocean, true);
        onLayerChange('breeze', biome.layers.breeze, true);
        onLayerChange('water', 0, false);
        onLayerChange('rain', 0, false);
      }
    } else if (shortcut.targetBiomeOrPhase === 'sleep_induction') {
      engine.setLayerVolume('ocean', 0.4, true);
      engine.setLayerVolume('breeze', 0.3, true);
      engine.setLayerVolume('water', 0.1, true);
      engine.setLayerVolume('rain', 0, false);
      onLayerChange('ocean', 0.4, true);
      onLayerChange('breeze', 0.3, true);
      onLayerChange('water', 0.1, true);
      onLayerChange('rain', 0, false);
    }

    setFeedbackMessage(`تم استقبال أمر سيري: "${shortcut.phraseAr}" وتطبيقه على المحرك الصوتي بنجاح!`);
    setTimeout(() => {
      setActiveShortcutId(null);
      setFeedbackMessage('');
    }, 4000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <section className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-violet-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              <span>منظومات المنازل الذكية (Smart Home Ecosystems & Apple HomeKit)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100">
              التكامل المباشر مع Apple HomeKit و Siri Shortcuts و Home Assistant HACS
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mt-1">
              تحويل المحرك الصوتي الحيوي إلى جهاز منزلي ذكي مدمج يظهر في تطبيق أبل هوم (Apple Home)،
              يدعم الأوامر الصوتية لسيري (Siri)، ويوفر تكامل HACS كامل مع لوحات تحكم Home Assistant.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 flex items-center gap-2">
              <Home className="w-3.5 h-3.5 text-violet-400" />
              <span>رمز الاقتران: <strong>031-45-154</strong></span>
            </span>
          </div>
        </div>

        {feedbackMessage && (
          <div className="p-3 rounded-xl bg-violet-950/80 border border-violet-800 text-xs text-violet-300 flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-violet-400 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}
      </section>

      {/* Apple HomeKit Pairing Hub & Siri Shortcuts */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: HomeKit Pairing Badge (5 cols) */}
        <div className="lg:col-span-5 p-7 rounded-3xl border border-stone-800 bg-stone-900/80 shadow-2xl space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-stone-400">بروتوكول Apple HomeKit & Matter:</span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
                جاهز للاقتران
              </span>
            </div>

            <h2 className="text-lg font-bold text-stone-100">بطاقة تعريف أبل هوم (Apple Home Badge)</h2>
            <p className="text-xs text-stone-400 leading-relaxed">
              امسح الرمز أو أدخل كود الإعداد في تطبيق المنزل (Apple Home) على جهاز الآيفون أو الآيباد لربط النظام كسماعة ذكية متصلة.
            </p>
          </div>

          {/* QR Code Simulation & Setup PIN Card */}
          <div className="p-5 rounded-2xl bg-stone-950 border border-stone-850 flex flex-col items-center justify-center space-y-3 text-center">
            <div className="w-24 h-24 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-lg">
              {/* Symbolic Apple Home QR glyph */}
              <QrCode className="w-full h-full text-stone-950" />
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-stone-500 uppercase">HomeKit Setup PIN</span>
              <div className="text-xl font-mono font-bold tracking-widest text-violet-400">
                031 - 45 - 154
              </div>
            </div>

            <span className="text-[10px] font-mono text-stone-500">
              Biophilic Hub Bridge · Port 51826 · mDNS Broadcast
            </span>
          </div>

          {/* Supported HomeKit Accessories */}
          <div className="space-y-2 text-xs">
            <span className="text-stone-400 font-mono text-[11px] block">الخدمات المكشوفة لنظام أبل:</span>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-stone-300">
              <div className="p-2 rounded-xl bg-stone-950 border border-stone-850">
                <span className="text-stone-500 block">خدمة مكبر الصوت:</span>
                <span className="text-violet-300 font-bold">Smart Speaker</span>
              </div>
              <div className="p-2 rounded-xl bg-stone-950 border border-stone-850">
                <span className="text-stone-500 block">مفتاح التحكم:</span>
                <span className="text-violet-300 font-bold">Nature Bed Switch</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Siri Shortcuts Interactive Test Deck (7 cols) */}
        <div className="lg:col-span-7 p-7 rounded-3xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-bold text-stone-100">
                اختصارات سيري الصوتية المباشرة (Siri Shortcuts Live Test)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-stone-400">انقر للتجربة الحية</span>
          </div>

          <p className="text-xs text-stone-300 leading-relaxed">
            انقر على أي من الأوامر الصوتية أدناه لاختبار تنفيذها المباشر على المحرك الصوتي في المتصفح كما لو كنت تخاطب سيري:
          </p>

          <div className="space-y-2.5">
            {SIRI_SHORTCUTS_LIST.map((shortcut) => {
              const isActive = activeShortcutId === shortcut.id;

              return (
                <div
                  key={shortcut.id}
                  onClick={() => handleExecuteShortcut(shortcut)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-violet-950/80 border-violet-500 shadow-md ring-1 ring-violet-500'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700 hover:bg-stone-950'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mic className={`w-3.5 h-3.5 ${isActive ? 'text-violet-300 animate-pulse' : 'text-stone-400'}`} />
                      <span className="text-xs font-bold text-stone-100">{shortcut.phraseAr}</span>
                    </div>
                    <span className="text-[11px] text-stone-400 block">{shortcut.actionDescriptionAr}</span>
                  </div>

                  <button
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold font-mono transition-colors shrink-0 ${
                      isActive
                        ? 'bg-violet-500 text-stone-950'
                        : 'bg-stone-850 text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    {isActive ? 'جاري التشغيل...' : 'تجربة الأمر'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Home Assistant HACS Entities & Lovelace Exporter */}
      <section className="p-7 rounded-3xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-bold text-stone-100">
                كيانات Home Assistant المدارة (Exposed HACS Entities)
              </h2>
            </div>
            <span className="text-xs text-stone-400 mt-0.5 block">
              تظهر هذه الكيانات تلقائياً في Home Assistant عبر الاكتشاف الذاتي (MQTT Discovery)
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveCodeTab('lovelace')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
                activeCodeTab === 'lovelace'
                  ? 'bg-violet-600 text-white font-bold'
                  : 'bg-stone-850 text-stone-400'
              }`}
            >
              Lovelace Card YAML
            </button>
            <button
              onClick={() => setActiveCodeTab('python')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
                activeCodeTab === 'python'
                  ? 'bg-violet-600 text-white font-bold'
                  : 'bg-stone-850 text-stone-400'
              }`}
            >
              media_player.py
            </button>
            <button
              onClick={() => setActiveCodeTab('homebridge')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
                activeCodeTab === 'homebridge'
                  ? 'bg-violet-600 text-white font-bold'
                  : 'bg-stone-850 text-stone-400'
              }`}
            >
              Homebridge config
            </button>
            <button
              onClick={() => setActiveCodeTab('manifest')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
                activeCodeTab === 'manifest'
                  ? 'bg-violet-600 text-white font-bold'
                  : 'bg-stone-850 text-stone-400'
              }`}
            >
              manifest.json
            </button>
          </div>
        </div>

        {/* Entities Live Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {entities.map((ent) => (
            <div
              key={ent.entityId}
              className="p-3.5 rounded-2xl bg-stone-950 border border-stone-850 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300 font-bold">{ent.nameAr}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-violet-400">
                  {ent.domain}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-stone-400">
                <span className="truncate max-w-[180px]">{ent.entityId}</span>
                <span className="text-emerald-400 font-bold">
                  {ent.state} {ent.unit || ''}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Code Studio Box */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center text-xs text-stone-400 font-mono">
            <span>
              {activeCodeTab === 'lovelace' && 'كود بطاقة الواجهة المخصصة (Lovelace Dashboard Card):'}
              {activeCodeTab === 'python' && 'كود بايثون لتكامل مشغل الصوت (custom_components/biophilic_soundscape/media_player.py):'}
              {activeCodeTab === 'homebridge' && 'إعدادات جسر هومبريدج لأبل هوم (config.json):'}
              {activeCodeTab === 'manifest' && 'بيانات تعريف تكامل HACS (manifest.json):'}
            </span>

            <button
              onClick={() => {
                if (activeCodeTab === 'lovelace') handleCopy(generateLovelaceCardYaml());
                if (activeCodeTab === 'python') handleCopy(generateHacsMediaPlayerPy());
                if (activeCodeTab === 'homebridge') handleCopy(generateHomebridgeConfigJson());
                if (activeCodeTab === 'manifest') handleCopy(generateHacsManifestJson());
              }}
              className="flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'تم النسخ!' : 'نسخ الكود'}</span>
            </button>
          </div>

          <pre
            className="p-4 rounded-2xl bg-stone-950 border border-stone-800 text-[11px] font-mono text-stone-300 overflow-x-auto max-h-64 leading-relaxed"
            dir="ltr"
          >
            {activeCodeTab === 'lovelace' && generateLovelaceCardYaml()}
            {activeCodeTab === 'python' && generateHacsMediaPlayerPy()}
            {activeCodeTab === 'homebridge' && generateHomebridgeConfigJson()}
            {activeCodeTab === 'manifest' && generateHacsManifestJson()}
          </pre>
        </div>
      </section>
    </div>
  );
}
