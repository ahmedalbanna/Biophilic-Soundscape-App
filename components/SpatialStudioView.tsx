'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Compass,
  Move,
  Save,
  Download,
  Upload,
  Trash2,
  Check,
  Sparkles,
  Droplets,
  Wind,
  Bird,
  CloudRain,
  Bell,
  Sliders,
  Headphones,
  Maximize2,
  FolderOpen,
} from 'lucide-react';
import {
  SoundSource2D,
  ListenerPosition,
  SoundscapePreset,
  INITIAL_SOUND_SOURCES,
  CURATED_PRESETS,
  calculateSpatialParameters,
  loadSavedPresets,
  saveCustomPreset,
  deleteCustomPreset,
} from '@/lib/preset-studio';
import { getAudioEngine, ContinuousLayerId, StochasticEventId } from '@/lib/audio-engine';

interface SpatialStudioViewProps {
  onApplyPreset: (preset: SoundscapePreset) => void;
  currentLayers: {
    id: ContinuousLayerId;
    volume: number;
    enabled: boolean;
  }[];
}

export function SpatialStudioView({ onApplyPreset, currentLayers }: SpatialStudioViewProps) {
  const [sources, setSources] = useState<SoundSource2D[]>(INITIAL_SOUND_SOURCES);
  const [listener, setListener] = useState<ListenerPosition>({ x: 50, y: 50, headAngleDeg: 0 });
  const [roomPreset, setRoomPreset] = useState<'living' | 'study' | 'bedroom'>('living');

  const [presets, setPresets] = useState<SoundscapePreset[]>(() => {
    return loadSavedPresets();
  });
  const [selectedPresetId, setSelectedPresetId] = useState<string>('oasis_springs');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newPresetNameAr, setNewPresetNameAr] = useState('');
  const [newPresetDescAr, setNewPresetDescAr] = useState('');
  const [newPresetCategory, setNewPresetCategory] = useState<'nature' | 'focus' | 'sleep' | 'zen'>('nature');

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const roomRef = useRef<HTMLDivElement | null>(null);

  // Update audio engine spatial positioning when a source or listener moves
  const updateEngineSpatialAudio = useCallback((source: SoundSource2D, listenerPos: ListenerPosition) => {
    const { pan, distanceFactor } = calculateSpatialParameters(source, listenerPos);
    const engine = getAudioEngine();

    if (source.type === 'water' || source.type === 'breeze' || source.type === 'rain' || source.type === 'ocean') {
      engine.setLayerSpatialPosition(source.type as ContinuousLayerId, pan, distanceFactor);
    }
  }, []);

  // Handle Dragging
  const handlePointerDown = (id: string, e: React.PointerEvent) => {
    e.preventDefault();
    setActiveDragId(id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDragId || !roomRef.current) return;
    const rect = roomRef.current.getBoundingClientRect();

    const clientX = e.clientX;
    const clientY = e.clientY;

    const x = Math.max(5, Math.min(95, Math.round(((clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(5, Math.min(95, Math.round(((clientY - rect.top) / rect.height) * 100)));

    if (activeDragId === 'listener') {
      setListener((prev) => {
        const next = { ...prev, x, y };
        // Update all sources relative to new listener position
        sources.forEach((s) => updateEngineSpatialAudio(s, next));
        return next;
      });
    } else {
      setSources((prev) =>
        prev.map((s) => {
          if (s.id === activeDragId) {
            const next = { ...s, x, y };
            updateEngineSpatialAudio(next, listener);
            return next;
          }
          return s;
        })
      );
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeDragId) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      setActiveDragId(null);
    }
  };

  // Select and apply preset
  const handleSelectPreset = (preset: SoundscapePreset) => {
    setSelectedPresetId(preset.id);
    setSources(preset.sources);
    setListener(preset.listener);

    // Apply spatial parameters to active audio engine
    preset.sources.forEach((s) => updateEngineSpatialAudio(s, preset.listener));
    onApplyPreset(preset);
  };

  // Save Custom Preset
  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetNameAr.trim()) return;

    // Build layers object from current source volumes or active layers
    const waterLayer = currentLayers.find((l) => l.id === 'water')?.volume ?? 0.7;
    const breezeLayer = currentLayers.find((l) => l.id === 'breeze')?.volume ?? 0.5;
    const rainLayer = currentLayers.find((l) => l.id === 'rain')?.volume ?? 0.0;
    const oceanLayer = currentLayers.find((l) => l.id === 'ocean')?.volume ?? 0.0;

    const newPreset: SoundscapePreset = {
      id: `custom_${Date.now()}`,
      nameAr: newPresetNameAr,
      nameEn: 'Custom Spatial Soundscape',
      category: newPresetCategory,
      descriptionAr: newPresetDescAr || 'توليفة صوتية مخصصة مع توزيع فراغي للأصوات في أرجاء الغرفة.',
      descriptionEn: 'Custom user-saved spatial soundscape arrangement.',
      tone: 'warm_wood',
      layers: {
        water: waterLayer,
        breeze: breezeLayer,
        rain: rainLayer,
        ocean: oceanLayer,
      },
      stochastic: {
        birds: 0.6,
        leaves: 0.5,
        crickets: 0.2,
        chimes: 0.4,
      },
      sources: [...sources],
      listener: { ...listener },
      vadDuckingDepthDb: -18,
      isCustom: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = saveCustomPreset(newPreset);
    setPresets(updated);
    setSelectedPresetId(newPreset.id);
    setShowSaveModal(false);
    setNewPresetNameAr('');
    setNewPresetDescAr('');
    setCopiedNotification('تم حفظ التوليفة في استوديو القوالب بنجاح!');
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  // Delete Custom Preset
  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا القالب المخصص؟')) {
      const updated = deleteCustomPreset(id);
      setPresets(updated);
      if (selectedPresetId === id) {
        setSelectedPresetId(CURATED_PRESETS[0].id);
      }
    }
  };

  // Export Presets to JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(presets, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'biophilic-soundscape-presets.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Presets from JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported: SoundscapePreset[] = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          // Merge custom presets
          const customOnly = imported.filter((p) => p.isCustom);
          let currentList = loadSavedPresets();
          customOnly.forEach((p) => {
            currentList = saveCustomPreset(p);
          });
          setPresets(currentList);
          setCopiedNotification('تم استيراد القوالب بنجاح!');
          setTimeout(() => setCopiedNotification(null), 3000);
        }
      } catch (err) {
        alert('تعذر قراءة ملف JSON أو أن الصيغة غير متوافقة.');
      }
    };
    reader.readAsText(file);
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'water':
        return <Droplets className="w-3.5 h-3.5" />;
      case 'breeze':
        return <Wind className="w-3.5 h-3.5" />;
      case 'birds':
        return <Bird className="w-3.5 h-3.5" />;
      case 'rain':
        return <CloudRain className="w-3.5 h-3.5" />;
      case 'chimes':
        return <Bell className="w-3.5 h-3.5" />;
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
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
              <span>التوزيع الفراغي ثنائي الأبعاد واستوديو التوليفات (2D Spatial Placement & Preset Studio)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100">
              مخطط الغرفة الفراغي ومصادر الصوت التفاعلية
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mt-1">
              اسحب مصادر الصوت الطبيعية (النافورة، حفيف النسيم، الطيور، الأجراس) وضَعها في أرجاء الغرفة بالنسبة لموضع الجلوس،
              ليقوم محرك الصوت بضبط توزيع الصوت الاستريو الفراغي (Stereo Pan) ومستوى القرب والبعد فورياً في أذنيك.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs transition-colors shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>حفظ هذا التوزيع كقالب</span>
            </button>
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 p-2 rounded-xl border border-stone-800 bg-stone-900 text-stone-300 hover:text-stone-100 text-xs transition-colors"
              title="تصدير كملف JSON"
            >
              <Download className="w-4 h-4" />
            </button>
            <label
              className="flex items-center gap-1.5 p-2 rounded-xl border border-stone-800 bg-stone-900 text-stone-300 hover:text-stone-100 text-xs transition-colors cursor-pointer"
              title="استيراد من JSON"
            >
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
          </div>
        </div>

        {copiedNotification && (
          <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{copiedNotification}</span>
          </div>
        )}
      </section>

      {/* Main Grid: 2D Spatial Blueprint Canvas + Emitters Control */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): 2D Interactive Blueprint */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-stone-100">
                مخطط الغرفة المعماري (Architectural Soundstage)
              </h2>
              <span className="text-xs text-stone-500 font-mono">· اسحب أي مصدر صوتي لتغيير موقعه</span>
            </div>

            {/* Room Layout Filter */}
            <div className="flex items-center gap-1 p-1 bg-stone-950 rounded-lg border border-stone-800 text-xs font-mono">
              <button
                onClick={() => setRoomPreset('living')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  roomPreset === 'living' ? 'bg-stone-800 text-emerald-400' : 'text-stone-400'
                }`}
              >
                صالون بيوفيلي
              </button>
              <button
                onClick={() => setRoomPreset('study')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  roomPreset === 'study' ? 'bg-stone-800 text-emerald-400' : 'text-stone-400'
                }`}
              >
                مكتب هادئ
              </button>
              <button
                onClick={() => setRoomPreset('bedroom')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  roomPreset === 'bedroom' ? 'bg-stone-800 text-emerald-400' : 'text-stone-400'
                }`}
              >
                جناح نوم
              </button>
            </div>
          </div>

          {/* Interactive Canvas Container */}
          <div
            ref={roomRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative w-full h-[420px] sm:h-[480px] bg-stone-950 rounded-2xl border-2 border-stone-800 overflow-hidden shadow-2xl select-none touch-none cursor-crosshair"
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.04) 0%, transparent 70%),
                linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
              `,
              backgroundSize: '100% 100%, 32px 32px, 32px 32px',
            }}
          >
            {/* Architectural Room Features (Walls, Windows, Slat Accents) */}
            <div className="absolute top-2 left-10 right-10 flex justify-between text-[10px] font-mono text-stone-600">
              <span>[ فواصل خشب الأرز وسماعات شريطية علوية ]</span>
              <span>[ النافورة الجدارية المائية ]</span>
            </div>

            <div className="absolute left-2 top-16 bottom-16 w-1 bg-stone-800 rounded-full flex flex-col justify-center items-center">
              <span className="text-[9px] font-mono text-stone-600 -rotate-90 whitespace-nowrap">جدار النوافذ البانورامية</span>
            </div>

            <div className="absolute right-2 top-16 bottom-16 w-1 bg-stone-800 rounded-full flex flex-col justify-center items-center">
              <span className="text-[9px] font-mono text-stone-600 rotate-90 whitespace-nowrap">مدخل الشرفة الخضراء</span>
            </div>

            {/* Ceiling In-wall Speakers Mock Markers */}
            <div className="absolute top-4 left-6 w-2.5 h-2.5 rounded-full bg-stone-700 border border-stone-600 shadow-sm" title="سماعة سقف أمامية يسار" />
            <div className="absolute top-4 right-6 w-2.5 h-2.5 rounded-full bg-stone-700 border border-stone-600 shadow-sm" title="سماعة سقف أمامية يمين" />
            <div className="absolute bottom-4 left-6 w-2.5 h-2.5 rounded-full bg-stone-700 border border-stone-600 shadow-sm" title="سماعة سقف خلفية يسار" />
            <div className="absolute bottom-4 right-6 w-2.5 h-2.5 rounded-full bg-stone-700 border border-stone-600 shadow-sm" title="سماعة سقف خلفية يمين" />

            {/* Acoustic Distance Radiation Ring around Listener */}
            <div
              className="absolute pointer-events-none rounded-full border border-dashed border-emerald-500/20 -translate-x-1/2 -translate-y-1/2 transition-all duration-150"
              style={{
                left: `${listener.x}%`,
                top: `${listener.y}%`,
                width: '180px',
                height: '180px',
              }}
            />
            <div
              className="absolute pointer-events-none rounded-full border border-stone-800/60 -translate-x-1/2 -translate-y-1/2 transition-all duration-150"
              style={{
                left: `${listener.x}%`,
                top: `${listener.y}%`,
                width: '320px',
                height: '320px',
              }}
            />

            {/* Central Listener Node (Sofa / Sitting Position) */}
            <div
              onPointerDown={(e) => handlePointerDown('listener', e)}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-grab active:cursor-grabbing group"
              style={{ left: `${listener.x}%`, top: `${listener.y}%` }}
            >
              <div className="relative p-2.5 rounded-2xl bg-stone-900 border-2 border-emerald-500 shadow-2xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Headphones className="w-5 h-5 fill-emerald-500/20" />
                <span className="absolute -top-6 whitespace-nowrap text-[10px] font-mono font-bold text-emerald-400 bg-stone-950/90 px-1.5 py-0.5 rounded border border-emerald-800/80 shadow-md">
                  موقع المستمع (أنت)
                </span>
              </div>
            </div>

            {/* Draggable Sound Emitter Nodes */}
            {sources.map((source) => {
              const { pan, distance } = calculateSpatialParameters(source, listener);
              const isSelected = activeDragId === source.id;

              return (
                <div
                  key={source.id}
                  onPointerDown={(e) => handlePointerDown(source.id, e)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-grab active:cursor-grabbing transition-transform ${
                    isSelected ? 'scale-125 z-40' : 'hover:scale-110'
                  }`}
                  style={{ left: `${source.x}%`, top: `${source.y}%` }}
                >
                  <div
                    className="p-3 rounded-2xl border shadow-xl flex items-center justify-center text-stone-950 font-bold backdrop-blur-xs"
                    style={{
                      backgroundColor: source.color,
                      borderColor: 'rgba(255, 255, 255, 0.35)',
                      boxShadow: `0 0 20px ${source.color}40`,
                    }}
                  >
                    {getSourceIcon(source.type)}
                  </div>

                  {/* Tooltip / Label */}
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono text-stone-200 bg-stone-950/90 px-2 py-0.5 rounded border border-stone-800 shadow-md pointer-events-none flex items-center gap-1.5">
                    <span>{source.nameAr}</span>
                    <span className="text-stone-500">|</span>
                    <span className="text-emerald-400 tabular-nums">
                      {pan > 0 ? `+${pan}R` : pan < 0 ? `${pan}L` : 'Center'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-stone-400 font-mono px-2">
            <span>موضع المستمع الحالي: X: {listener.x}% · Y: {listener.y}%</span>
            <span>استريو ثلاثي الأبعاد: محسوب وفق المسافة الزاوية التناظرية</span>
          </div>
        </div>

        {/* Right Column (4 cols): Curated Biomes & Saved Presets Library */}
        <div className="lg:col-span-4 space-y-4">
          <div className="pb-2 border-b border-stone-800 flex items-center justify-between">
            <h2 className="text-base font-semibold text-stone-100 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-emerald-400" />
              <span>مكتبة القوالب والتوليفات الحيوية</span>
            </h2>
            <span className="text-xs text-stone-500 font-mono">({presets.length} قوالب)</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {presets.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-stone-900 border-emerald-600 shadow-lg ring-1 ring-emerald-500/40'
                      : 'bg-stone-950/70 border-stone-800 hover:border-stone-700 hover:bg-stone-900/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-xs sm:text-sm font-bold text-stone-100">{preset.nameAr}</h3>
                    <div className="flex items-center gap-1">
                      {preset.isCustom && (
                        <button
                          onClick={(e) => handleDeletePreset(preset.id, e)}
                          className="p-1 text-stone-500 hover:text-rose-400 transition-colors"
                          title="حذف القالب المخصص"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        preset.isCustom
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {preset.isCustom ? 'مخصص' : 'أصلي'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-400 line-clamp-2 mb-3 leading-relaxed">
                    {preset.descriptionAr}
                  </p>

                  <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] font-mono text-stone-400">
                    <span>مياه: {Math.round(preset.layers.water * 100)}%</span>
                    <span>نسيم: {Math.round(preset.layers.breeze * 100)}%</span>
                    <span>طيور: {Math.round(preset.stochastic.birds * 100)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Spatial Emitters Detail Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>معايرة البؤر الصوتية والمواقع اللحظية (Emitter Coordinates)</span>
          </h2>
          <span className="text-xs text-stone-500 font-mono">· قيم Pan و Distance Attenuation الحية</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {sources.map((source) => {
            const { pan, distance, distanceFactor } = calculateSpatialParameters(source, listener);
            return (
              <div
                key={source.id}
                className="p-3.5 rounded-xl border border-stone-800 bg-stone-900/50 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: source.color }}
                    />
                    <span className="font-bold text-stone-200">{source.nameAr}</span>
                  </div>
                  {getSourceIcon(source.type)}
                </div>

                <div className="space-y-1 font-mono text-[11px] text-stone-400 pt-1">
                  <div className="flex justify-between">
                    <span className="text-stone-500">الإحداثي:</span>
                    <span>X:{source.x}% · Y:{source.y}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">التوزيع الاستريو:</span>
                    <span className="text-emerald-400 font-semibold">
                      {pan > 0 ? `يمين +${pan}` : pan < 0 ? `يسار ${pan}` : 'وسط 0.0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">عامل القرب:</span>
                    <span className="text-teal-400">{Math.round(distanceFactor * 100)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Save Preset Modal Dialog */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                <Save className="w-4 h-4 text-emerald-400" />
                <span>حفظ التوليفة الحالية كقالب مخصص</span>
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-stone-400 hover:text-stone-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePreset} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-stone-300 font-medium">اسم القالب باللغة العربية:</label>
                <input
                  type="text"
                  required
                  value={newPresetNameAr}
                  onChange={(e) => setNewPresetNameAr(e.target.value)}
                  placeholder="مثلاً: واحة الصباح الهادئة في الصالون"
                  className="w-full p-2.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-300 font-medium">تصنيف التوليفة:</label>
                <select
                  value={newPresetCategory}
                  onChange={(e) => setNewPresetCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="nature">طبيعة عامة (Nature)</option>
                  <option value="focus">تركيز وعمل مكتبي (Focus & Study)</option>
                  <option value="sleep">استرخاء ونوم عميق (Deep Sleep)</option>
                  <option value="zen">تأمل وسكون (Zen Meditation)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-stone-300 font-medium">وصف التوليفة والأثر الصوتي:</label>
                <textarea
                  rows={2}
                  value={newPresetDescAr}
                  onChange={(e) => setNewPresetDescAr(e.target.value)}
                  placeholder="خرير ماء خفيف على اليسار مع نسيم شرفة على اليمين..."
                  className="w-full p-2.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-750 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold transition-colors"
                >
                  حفظ القالب الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
