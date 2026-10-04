'use client';

import React from 'react';
import Image from 'next/image';
import { Cpu, HardDrive, Zap, Radio, Volume2, VolumeX, Mic, Sliders, CheckCircle2 } from 'lucide-react';
import { AudioZone, CENTRAL_HUB_SPECS } from '@/lib/hardware-zones';

interface HardwareTopologyViewProps {
  zones: AudioZone[];
  onZoneVolumeChange: (zoneId: string, volume: number) => void;
  onToggleZoneMute: (zoneId: string) => void;
  onToggleZoneSolo: (zoneId: string) => void;
  onZoneOverlayRateChange: (zoneId: string, rate: number) => void;
}

export function HardwareTopologyView({
  zones,
  onZoneVolumeChange,
  onToggleZoneMute,
  onToggleZoneSolo,
  onZoneOverlayRateChange,
}: HardwareTopologyViewProps) {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Central Processing Hub Showcase */}
      <section className="rounded-2xl border border-stone-800 bg-stone-900/60 overflow-hidden shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>معالج الصوت المركزي (Central Acoustic DSP Hub)</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-stone-100">
              وحدة المعالجة المركزية والمضخمات الموزعة
            </h1>

            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-xl">
              تُدار المنظومة بأكملها عبر حاسوب مصغر منخفض الاستهلاك (Mini PC / Raspberry Pi 5 Core) مزود بمحول إشارة رقمية تناظرية
              فائق النقاوة (24-bit / 96kHz DAC) ومخزن NVMe سريع لبنك الأصوات الحيوية غير المضغوطة،
              مع توزيع 8 قنوات صوتية مستقلة لمكبرات الصوت المخفية في حواف الأسقف والجدران.
            </p>

            {/* Hub Hardware Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1">
                <div className="flex items-center gap-1.5 text-stone-400 text-xs">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  <span>حمل المعالج:</span>
                </div>
                <div className="text-base font-bold font-mono text-stone-100 tabular-nums">
                  {CENTRAL_HUB_SPECS.cpuLoadPercent}%
                </div>
                <div className="text-[10px] text-stone-500 font-mono">الحرارة: {CENTRAL_HUB_SPECS.coreTempCelsius}°C</div>
              </div>

              <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1">
                <div className="flex items-center gap-1.5 text-stone-400 text-xs">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>تأخير الاستجابة (DSP):</span>
                </div>
                <div className="text-base font-bold font-mono text-stone-100 tabular-nums">
                  {CENTRAL_HUB_SPECS.dspLatencyMs} ms
                </div>
                <div className="text-[10px] text-emerald-400 font-mono">فائق السرعة (Realtime)</div>
              </div>

              <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1">
                <div className="flex items-center gap-1.5 text-stone-400 text-xs">
                  <Radio className="w-3.5 h-3.5 text-sky-400" />
                  <span>محول DAC الصوتي:</span>
                </div>
                <div className="text-xs font-bold font-mono text-stone-100 truncate">
                  24-bit / 96kHz
                </div>
                <div className="text-[10px] text-stone-500 font-mono">ESS Sabre Dual Core</div>
              </div>

              <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1">
                <div className="flex items-center gap-1.5 text-stone-400 text-xs">
                  <HardDrive className="w-3.5 h-3.5 text-teal-400" />
                  <span>ذاكرة بنك الأصوات:</span>
                </div>
                <div className="text-xs font-bold font-mono text-stone-100">
                  512GB NVMe
                </div>
                <div className="text-[10px] text-stone-500 font-mono">FLAC Lossless Master</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative h-64 sm:h-72 lg:h-full min-h-[280px]">
            <Image
              src="/images/hardware_hub_controller_1791142499787.jpg"
              alt="Central Hardware Hub Controller"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 40vw"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-stone-950/90 via-stone-950/30 to-transparent" />
            <div className="absolute bottom-3 right-4 text-[11px] text-stone-400 bg-stone-950/80 px-2 py-0.5 rounded backdrop-blur-xs">
              هيكل ألمنيوم مؤكسد بتبريد صامت ومؤشر حالة LED
            </div>
          </div>
        </div>
      </section>

      {/* Architectural Speaker Technology Spotlight */}
      <section className="p-6 rounded-2xl border border-stone-800 bg-stone-900/40 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-4 relative h-48 md:h-56 rounded-xl overflow-hidden border border-stone-800">
          <Image
            src="/images/architectural_speaker_detail_1791142521783.jpg"
            alt="Concealed Slot Speaker Architecture"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 30vw"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="md:col-span-8 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>الهندسة المعمارية للسماعات المخفية (Concealed Acoustic Form-Factor)</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-stone-100">
            سماعات شريطية وسقفية تندمج كلياً في تفاصيل الديكور
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            للحفاظ على هدوء الرؤية وجمال المكان، تُثبت السماعات الشريطية الخطية (Linear Slot Diffusers)
            مخفية داخل فواصل الأسقف الخشبية، بينما توزع المحولات الاهتزازية (Drywall Transducers)
            خلف ألواح الجبس، لتصدر الأصوات الطبيعية وكأنها تنبعث من جدران المنزل ذاته بتوزيع محيطي متجانس بدون بؤر صوتية مزعجة.
          </p>
        </div>
      </section>

      {/* Multi-Room Zone Management Matrix */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-stone-100">
              مصفوفة التحكم بالمناطق والغرف (Spatial Multi-Zone Matrix)
            </h2>
            <p className="text-xs text-stone-400">
              تحكم مستقل في مستوى الصوت، وتكثيف التراكب الديناميكي، وتفعيل حساسات كشف الكلام لكل غرفة
            </p>
          </div>
          <div className="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-1 rounded-lg">
            4 مناطق نشطة
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className={`p-5 rounded-xl border transition-all ${
                zone.isMuted
                  ? 'bg-stone-950/50 border-stone-800/60 opacity-60'
                  : 'bg-stone-900/70 border-stone-700/80 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-stone-100">{zone.nameAr}</h3>
                  <p className="text-xs text-stone-400">{zone.nameEn}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onToggleZoneSolo(zone.id)}
                    className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                      zone.isSolo
                        ? 'bg-amber-500 text-stone-950 font-bold'
                        : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                    title="عزل هذه المنطقة والاستماع لها وحدها"
                  >
                    SOLO
                  </button>

                  <button
                    onClick={() => onToggleZoneMute(zone.id)}
                    className={`p-1.5 rounded transition-colors ${
                      zone.isMuted
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-stone-800 text-stone-300 hover:text-stone-100'
                    }`}
                    title={zone.isMuted ? 'إلغاء الكتم' : 'كتم المنطقة'}
                  >
                    {zone.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Hardware specifications for this zone */}
              <div className="p-2.5 rounded-lg bg-stone-950/70 border border-stone-800/80 text-[11px] font-mono text-stone-400 mb-4 space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-500">نوع السماعة:</span>
                  <span className="text-stone-300">{zone.speakerTypeAr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">القناة والمضخم:</span>
                  <span className="text-emerald-400">{zone.amplifierChannel} ({zone.speakerCount} وحدات)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">حساس كشف الكلام (VAD):</span>
                  <span className={zone.vadSensorActive ? 'text-emerald-400 flex items-center gap-1' : 'text-stone-500'}>
                    {zone.vadSensorActive && <Mic className="w-3 h-3 text-emerald-400" />}
                    <span>{zone.vadSensorActive ? 'مفعل لكتم تلقائي' : 'معطل (مساحة استرخاء)'}</span>
                  </span>
                </div>
              </div>

              {/* Volume Slider */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono text-stone-400">
                    <span>مستوى صوت الغرفة:</span>
                    <span className="text-stone-250 font-bold tabular-nums">
                      {zone.isMuted ? '0% (مكتوم)' : `${zone.volume}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    disabled={zone.isMuted}
                    value={zone.volume}
                    onChange={(e) => onZoneVolumeChange(zone.id, parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                  />
                </div>

                {/* Dynamic Overlay Intensity */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono text-stone-400">
                    <span>كثافة التراكب العشوائي (Overlay Density):</span>
                    <span className="text-teal-400 font-bold tabular-nums">{zone.dynamicOverlayRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    disabled={zone.isMuted}
                    value={zone.dynamicOverlayRate}
                    onChange={(e) => onZoneOverlayRateChange(zone.id, parseInt(e.target.value))}
                    className="w-full accent-teal-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
