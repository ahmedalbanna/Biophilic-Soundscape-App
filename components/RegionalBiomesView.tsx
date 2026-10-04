'use client';

import React, { useState } from 'react';
import {
  Mountain,
  Palmtree,
  Waves,
  Compass,
  Flower2,
  Check,
  Volume2,
  Sparkles,
  Wind,
  Droplets,
  CloudRain,
  Feather,
  Info,
  Layers,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { REGIONAL_BIOMES, RegionalBiome } from '@/lib/regional-biomes';
import { getAudioEngine } from '@/lib/audio-engine';

interface RegionalBiomesViewProps {
  onEngineStartRequest: () => void;
  isEnginePlaying: boolean;
  onLayerChange: (layerId: 'water' | 'breeze' | 'rain' | 'ocean', volume: number, enabled: boolean) => void;
}

export function RegionalBiomesView({
  onEngineStartRequest,
  isEnginePlaying,
  onLayerChange,
}: RegionalBiomesViewProps) {
  const [selectedBiomeId, setSelectedBiomeId] = useState<string>('asir_soudah');
  const [activeBiomeId, setActiveBiomeId] = useState<string>('asir_soudah');
  const [justApplied, setJustApplied] = useState<boolean>(false);

  const activeBiome = REGIONAL_BIOMES.find((b) => b.id === activeBiomeId) || REGIONAL_BIOMES[0];
  const selectedBiome = REGIONAL_BIOMES.find((b) => b.id === selectedBiomeId) || REGIONAL_BIOMES[0];

  const getBiomeIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'mountain':
        return <Mountain className={className} />;
      case 'palmtree':
        return <Palmtree className={className} />;
      case 'waves':
        return <Waves className={className} />;
      case 'compass':
        return <Compass className={className} />;
      case 'flower2':
        return <Flower2 className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  const handleApplyBiome = (biome: RegionalBiome) => {
    if (!isEnginePlaying) {
      onEngineStartRequest();
    }

    const engine = getAudioEngine();

    // Set continuous layers in audio engine
    engine.setLayerVolume('water', biome.layers.water, biome.layers.water > 0.05);
    engine.setLayerVolume('breeze', biome.layers.breeze, biome.layers.breeze > 0.05);
    engine.setLayerVolume('rain', biome.layers.rain, biome.layers.rain > 0.05);
    engine.setLayerVolume('ocean', biome.layers.ocean, biome.layers.ocean > 0.05);

    // Update parent page continuousLayers state
    onLayerChange('water', biome.layers.water, biome.layers.water > 0.05);
    onLayerChange('breeze', biome.layers.breeze, biome.layers.breeze > 0.05);
    onLayerChange('rain', biome.layers.rain, biome.layers.rain > 0.05);
    onLayerChange('ocean', biome.layers.ocean, biome.layers.ocean > 0.05);

    // Set 2D spatial pan
    engine.setLayerPan('water', biome.spatialPan.water);
    engine.setLayerPan('breeze', biome.spatialPan.breeze);
    engine.setLayerPan('rain', biome.spatialPan.rain);
    engine.setLayerPan('ocean', biome.spatialPan.ocean);

    setActiveBiomeId(biome.id);
    setSelectedBiomeId(biome.id);
    setJustApplied(true);
    setTimeout(() => setJustApplied(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <section className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>الحزم البيئية الجغرافية المخصصة (Regional Biophilic Soundscapes)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100">
              بيئات طبيعية أصيلة مستوحاة من جغرافية وشواطئ وواحات شبه الجزيرة
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mt-1">
              اختر بيئتك المفضلة (ضباب السودة البارد، واحة الأحساء المورقة، شواطئ فرسان المرجانية، وادي حنيفة بعد
              المطر، أو مزارع ورد الطائف) لنقل الغرفة سمعياً ونفسياً إلى تلك البقعة الطبيعية.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono text-stone-400 bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeBiome.badgeColor }} />
              <span>البيئة النشطة: <strong>{activeBiome.nameAr}</strong></span>
            </span>
          </div>
        </div>

        {justApplied && (
          <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 flex items-center justify-between gap-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                تم تحويل البيئة الصوتية بنجاح إلى <strong>{activeBiome.nameAr}</strong> مع ضبط التوزيع الفراغي وترددات الرنين!
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">ارتفاع: {activeBiome.altitudeMeters}م</span>
          </div>
        )}
      </section>

      {/* Selected Biome Spotlight Banner */}
      <section
        className={`p-6 sm:p-8 rounded-3xl border border-stone-800 bg-gradient-to-br ${selectedBiome.accentGradient} shadow-2xl relative overflow-hidden transition-all`}
      >
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className="p-2 rounded-xl text-stone-950 shadow-md"
                  style={{ backgroundColor: selectedBiome.badgeColor }}
                >
                  {getBiomeIcon(selectedBiome.iconName, 'w-5 h-5')}
                </span>
                <span className="text-xs font-mono text-stone-300 bg-stone-950/80 px-2.5 py-1 rounded-lg border border-stone-800">
                  {selectedBiome.regionAr}
                </span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800">
                  ارتفاع: {selectedBiome.altitudeMeters} متر عن سطح البحر
                </span>
              </div>

              <h2 className="text-xl sm:text-3xl font-bold text-stone-100">{selectedBiome.nameAr}</h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-3xl leading-relaxed">
                {selectedBiome.climateTypeAr}
              </p>
            </div>

            <button
              onClick={() => handleApplyBiome(selectedBiome)}
              className="self-start md:self-center px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-sm flex items-center gap-2.5 shadow-xl transition-all hover:scale-105 shrink-0"
            >
              <Volume2 className="w-4 h-4 fill-stone-950" />
              <span>{activeBiomeId === selectedBiome.id ? 'البيئة قيد التشغيل حالياً' : 'تفعيل هذه البيئة الآن'}</span>
            </button>
          </div>

          {/* Deep Aura & Botanical Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800/80 space-y-1.5">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>الأثر الصوتي والنفسي (Acoustic Aura):</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                {selectedBiome.acousticAuraAr}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800/80 space-y-1.5">
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Feather className="w-3.5 h-3.5" />
                <span>الغطاء النباتي والطيور الأصيلة:</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                {selectedBiome.floraFaunaAr}
              </p>
            </div>
          </div>

          {/* Live Layer Balance Visualization */}
          <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/60 space-y-3">
            <span className="text-xs font-mono text-stone-400 block">
              توزيع توازن الطبقات الصوتية لهذه البيئة (Layer Mixing Proportions):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <div className="flex justify-between text-stone-400">
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-400" />
                    <span>المياه والينابيع:</span>
                  </span>
                  <span className="text-stone-200 font-bold">{Math.round(selectedBiome.layers.water * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${selectedBiome.layers.water * 100}%` }} />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <div className="flex justify-between text-stone-400">
                  <span className="flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-teal-400" />
                    <span>النسيم وحفيف النبات:</span>
                  </span>
                  <span className="text-stone-200 font-bold">{Math.round(selectedBiome.layers.breeze * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: `${selectedBiome.layers.breeze * 100}%` }} />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <div className="flex justify-between text-stone-400">
                  <span className="flex items-center gap-1">
                    <CloudRain className="w-3.5 h-3.5 text-indigo-400" />
                    <span>المطر والضباب:</span>
                  </span>
                  <span className="text-stone-200 font-bold">{Math.round(selectedBiome.layers.rain * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${selectedBiome.layers.rain * 100}%` }} />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <div className="flex justify-between text-stone-400">
                  <span className="flex items-center gap-1">
                    <Waves className="w-3.5 h-3.5 text-cyan-400" />
                    <span>أمواج البحر الضحلة:</span>
                  </span>
                  <span className="text-stone-200 font-bold">{Math.round(selectedBiome.layers.ocean * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${selectedBiome.layers.ocean * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Regional Biomes Catalog Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-semibold text-stone-100">
              كتالوج الحزم البيئية الجغرافية الخمس (Selectable Regional Soundscapes)
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-mono">· اضغط لمعاينة وتطبيق أي بيئة صوتية فوراً</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REGIONAL_BIOMES.map((biome) => {
            const isSelected = selectedBiomeId === biome.id;
            const isCurrentlyActive = activeBiomeId === biome.id;

            return (
              <div
                key={biome.id}
                onClick={() => setSelectedBiomeId(biome.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                  isSelected
                    ? 'bg-stone-900 border-emerald-500 shadow-xl ring-1 ring-emerald-500/40'
                    : 'bg-stone-950/70 border-stone-800 hover:border-stone-700 hover:bg-stone-900/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="p-2 rounded-xl text-stone-950 font-bold shadow-sm"
                      style={{ backgroundColor: biome.badgeColor }}
                    >
                      {getBiomeIcon(biome.iconName, 'w-4 h-4')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-100">{biome.nameAr}</h3>
                      <span className="text-[10px] font-mono text-stone-500 block">{biome.regionAr}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 shrink-0">
                    {biome.tagAr}
                  </span>
                </div>

                <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                  {biome.acousticAuraAr}
                </p>

                <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-stone-400">الارتفاع: {biome.altitudeMeters}م</span>
                  <div className="flex items-center gap-2">
                    {isCurrentlyActive && (
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <Check className="w-3.5 h-3.5" />
                        <span>نشط حالياً</span>
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyBiome(biome);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-[10px] transition-colors"
                    >
                      تفعيل
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
