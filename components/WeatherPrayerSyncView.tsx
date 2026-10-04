'use client';

import React, { useState, useEffect } from 'react';
import {
  Moon,
  Sun,
  CloudRain,
  Wind,
  Thermometer,
  Compass,
  Clock,
  VolumeX,
  Volume2,
  Check,
  Sparkles,
  AlertCircle,
  MapPin,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import {
  CityLocation,
  SUPPORTED_CITIES,
  calculatePrayerStatus,
  calculateWeatherAcousticAdaptation,
  PrayerStatus,
  WeatherAdaptationResult,
} from '@/lib/weather-prayer';
import { getAudioEngine, ContinuousLayerId } from '@/lib/audio-engine';

interface WeatherPrayerSyncViewProps {
  onApplyWeatherMix: (layers: { water: number; breeze: number; rain: number; ocean: number }) => void;
  isEnginePlaying: boolean;
}

export function WeatherPrayerSyncView({ onApplyWeatherMix, isEnginePlaying }: WeatherPrayerSyncViewProps) {
  const [selectedCityId, setSelectedCityId] = useState<string>('riyadh');
  const [isAdhanProtectionEnabled, setIsAdhanProtectionEnabled] = useState(true);
  const [isSimulatingAdhan, setIsSimulatingAdhan] = useState(false);
  const [simulatedCondition, setSimulatedCondition] = useState<
    'clear_mild' | 'hot_desert' | 'rainy' | 'windy' | 'overcast'
  >('hot_desert');

  const [appliedWeatherSuccess, setAppliedWeatherSuccess] = useState(false);

  const city = SUPPORTED_CITIES.find((c) => c.id === selectedCityId) || SUPPORTED_CITIES[0];
  const prayerStatus: PrayerStatus = calculatePrayerStatus(city);

  // If user enabled simulated adhan or actual silence window is active
  const isSilenceActive = isAdhanProtectionEnabled && (isSimulatingAdhan || prayerStatus.isInAdhanSilenceWindow);

  const weatherAdaptation: WeatherAdaptationResult = calculateWeatherAcousticAdaptation(
    simulatedCondition,
    city.defaultWeather.tempC,
    city.defaultWeather.humidity,
    city.defaultWeather.windKmh
  );

  // Sync silence to audio engine
  useEffect(() => {
    const engine = getAudioEngine();
    engine.setAdhanSilence(isSilenceActive, 6);
  }, [isSilenceActive]);

  const handleApplyWeather = () => {
    onApplyWeatherMix(weatherAdaptation.layerAdjustments);
    setAppliedWeatherSuccess(true);
    setTimeout(() => setAppliedWeatherSuccess(false), 3500);
  };

  const handleToggleAdhanSim = () => {
    if (isSimulatingAdhan) {
      setIsSimulatingAdhan(false);
    } else {
      setIsSimulatingAdhan(true);
      // Auto restore after 45s for test demo
      setTimeout(() => {
        setIsSimulatingAdhan(false);
      }, 45000);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header and City Selector */}
      <section className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>المزامنة البيئية والمجتمعية (Environmental & Prayer Synchronization)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100">
              التكيف الصوتي مع الطقس وسكينة أوقات الصلاة
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mt-1">
              يتفاعل النظام مع حالة الطقس الخارجية (حرارة، مطر، رياح)، ويدخل تلقائياً في حالة سكينة تامة قبيل أذان الصلوات
              المفروضة بدقيقتين وحتى انقضاء وقت الصلاة احتراماً للنداء والشعائر.
            </p>
          </div>

          {/* City Selector */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-stone-950 p-2 rounded-xl border border-stone-800">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <select
              value={selectedCityId}
              onChange={(e) => {
                setSelectedCityId(e.target.value);
                const newCity = SUPPORTED_CITIES.find((c) => c.id === e.target.value);
                if (newCity) {
                  setSimulatedCondition(newCity.defaultWeather.condition);
                }
              }}
              className="text-xs bg-transparent text-stone-200 focus:outline-none cursor-pointer font-medium"
            >
              {SUPPORTED_CITIES.map((c) => (
                <option key={c.id} value={c.id} className="bg-stone-900 text-stone-200">
                  {c.nameAr} ({c.countryAr})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Silence Active Banner */}
        {isSilenceActive && (
          <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-200 flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-900/80 text-amber-300">
                <VolumeX className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-2">
                  <span>حالة السكينة التامة لنداء الصلاة نشطة الآن</span>
                  <span className="text-xs font-mono bg-amber-900/80 px-2 py-0.5 rounded text-amber-300">
                    [ تم كتم أصوات الطبيعة تلقائياً ]
                  </span>
                </div>
                <div className="text-xs text-amber-300/80 mt-0.5">
                  {isSimulatingAdhan
                    ? 'وضع المحاكاة التجريبي نشط: سيعود الصوت تلقائياً بعد قليل'
                    : `وقت ${prayerStatus.activePrayerNameAr || 'الصلاة'} في ${city.nameAr}: تم إيقاف البث لضمان الخشوع والهدوء.`}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsSimulatingAdhan(false)}
              className="px-3 py-1.5 rounded-lg bg-amber-900 hover:bg-amber-850 text-amber-200 text-xs font-bold transition-colors border border-amber-700/60 shrink-0"
            >
              استئناف الصوت فوراً
            </button>
          </div>
        )}
      </section>

      {/* Section 1: Prayer Times & Adhan Acoustic Protection */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-semibold text-stone-100">
              جدول مواقيت الصلاة ونوافذ السكينة (Adhan Silence Windows)
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleAdhanSim}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isSimulatingAdhan
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isSimulatingAdhan ? 'إلغاء محاكاة الأذان' : 'محاكاة نافذة الأذان الآن (تجربة الكتم)'}</span>
            </button>

            <button
              onClick={() => setIsAdhanProtectionEnabled(!isAdhanProtectionEnabled)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                isAdhanProtectionEnabled
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-stone-800 text-stone-400 border border-stone-700'
              }`}
            >
              {isAdhanProtectionEnabled ? 'الحماية التلقائية مفعلة' : 'معطلة'}
            </button>
          </div>
        </div>

        {/* Countdown Box & Prayer Times Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Next Prayer Countdown Card (4 cols) */}
          <div className="lg:col-span-4 p-5 rounded-2xl border border-stone-800 bg-stone-900/60 space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>الصلاة القادمة:</span>
              </span>
              <span className="text-stone-300">{city.nameAr}</span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <h3 className="text-xl font-bold text-stone-100">{prayerStatus.nextPrayerNameAr}</h3>
                <span className="text-xs text-stone-400 font-mono">الوقت: {prayerStatus.nextPrayerTimeStr}</span>
              </div>
              <div className="text-left font-mono">
                <span className="text-2xl font-bold text-emerald-400 tabular-nums">
                  {prayerStatus.minutesToNextPrayer}
                </span>
                <span className="text-xs text-stone-500 block">دقيقة متبقية</span>
              </div>
            </div>

            <p className="text-[11px] text-stone-400 leading-relaxed border-t border-stone-800 pt-2">
              يبدأ الخفض التدريجي لمستوى الصوت تلقائياً قبل دقيقتين من موعد الأذان، ويستمر السكون حتى تمام الصلاة.
            </p>
          </div>

          {/* 5 Prayers Grid (8 cols) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              { name: 'الفجر', time: prayerStatus.prayerTimes.fajr, key: 'fajr' },
              { name: 'الظهر', time: prayerStatus.prayerTimes.dhuhr, key: 'dhuhr' },
              { name: 'العصر', time: prayerStatus.prayerTimes.asr, key: 'asr' },
              { name: 'المغرب', time: prayerStatus.prayerTimes.maghrib, key: 'maghrib' },
              { name: 'العشاء', time: prayerStatus.prayerTimes.isha, key: 'isha' },
            ].map((p) => {
              const isNext = prayerStatus.nextPrayerNameAr.includes(p.name);
              return (
                <div
                  key={p.key}
                  className={`p-3.5 rounded-xl border text-center transition-all ${
                    isNext
                      ? 'bg-stone-900 border-emerald-600 shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-stone-950/70 border-stone-800'
                  }`}
                >
                  <span className="text-xs text-stone-400 block mb-1">{p.name}</span>
                  <span className="text-base font-bold font-mono text-stone-100 tabular-nums block mb-1">
                    {p.time}
                  </span>
                  <span className="text-[10px] font-mono text-stone-500">
                    {isNext ? 'الصلاة التالية' : 'سكينة 17 دقيقة'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 2: Outdoor Weather Synchronization & Acoustic Adaptation */}
      <section className="space-y-4 pt-4 border-t border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-semibold text-stone-100">
                التكيف التلقائي مع الطقس والمناخ الخارجي (Weather-Reactive Tuning)
              </h2>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              تكييف ترددات الصوت لعزل ضوضاء الرياح الخارجية وإحداث تبريد حسي بيوفيلي في الصيف
            </p>
          </div>

          {/* Quick Weather Simulator Mode Selector */}
          <div className="flex items-center gap-1 p-1 bg-stone-950 rounded-xl border border-stone-800 text-xs font-mono self-start sm:self-auto">
            <button
              onClick={() => setSimulatedCondition('hot_desert')}
              className={`px-2.5 py-1 rounded transition-colors ${
                simulatedCondition === 'hot_desert' ? 'bg-stone-800 text-amber-400' : 'text-stone-400'
              }`}
            >
              صيف حار
            </button>
            <button
              onClick={() => setSimulatedCondition('rainy')}
              className={`px-2.5 py-1 rounded transition-colors ${
                simulatedCondition === 'rainy' ? 'bg-stone-800 text-cyan-400' : 'text-stone-400'
              }`}
            >
              يوم ممطر
            </button>
            <button
              onClick={() => setSimulatedCondition('windy')}
              className={`px-2.5 py-1 rounded transition-colors ${
                simulatedCondition === 'windy' ? 'bg-stone-800 text-teal-400' : 'text-stone-400'
              }`}
            >
              رياح وعواصف
            </button>
            <button
              onClick={() => setSimulatedCondition('clear_mild')}
              className={`px-2.5 py-1 rounded transition-colors ${
                simulatedCondition === 'clear_mild' ? 'bg-stone-800 text-emerald-400' : 'text-stone-400'
              }`}
            >
              ربيع معتدل
            </button>
          </div>
        </div>

        {/* Live Weather Metrics & Acoustic Rationale Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Weather Metrics Card (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl border border-stone-800 bg-stone-900/60 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <span className="text-xs text-stone-400 font-mono">بيانات طقس {city.nameAr}:</span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                مربوط بالمحطة الجوية
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-center space-y-1">
                <Thermometer className="w-4 h-4 text-rose-400 mx-auto" />
                <span className="text-[10px] text-stone-500 font-mono">الحرارة الخارجية</span>
                <span className="text-lg font-bold font-mono text-stone-100 block tabular-nums">
                  {weatherAdaptation.tempC}°C
                </span>
              </div>

              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-center space-y-1">
                <CloudRain className="w-4 h-4 text-cyan-400 mx-auto" />
                <span className="text-[10px] text-stone-500 font-mono">نسبة الرطوبة</span>
                <span className="text-lg font-bold font-mono text-stone-100 block tabular-nums">
                  {weatherAdaptation.humidity}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-center space-y-1">
                <Wind className="w-4 h-4 text-teal-400 mx-auto" />
                <span className="text-[10px] text-stone-500 font-mono">سرعة الرياح</span>
                <span className="text-lg font-bold font-mono text-stone-100 block tabular-nums">
                  {weatherAdaptation.windKmh} km/h
                </span>
              </div>
            </div>

            <div className="text-xs text-stone-300 font-mono flex items-center justify-between pt-1">
              <span>حالة الجو المرصودة:</span>
              <span className="text-emerald-400 font-semibold">{weatherAdaptation.conditionAr}</span>
            </div>
          </div>

          {/* Acoustic Response & Crossfade Tuning (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-2xl border border-stone-800 bg-stone-900/60 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-100 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>الاستجابة الفسيولوجية والصوتية المقترحة</span>
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                {weatherAdaptation.acousticEffectAr}
              </p>

              {/* Layers mix preview */}
              <div className="grid grid-cols-4 gap-2 text-xs font-mono pt-1">
                <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
                  <span className="text-[10px] text-stone-500 block">المياه:</span>
                  <span className="text-emerald-400 font-bold tabular-nums">
                    {Math.round(weatherAdaptation.layerAdjustments.water * 100)}%
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
                  <span className="text-[10px] text-stone-500 block">النسيم:</span>
                  <span className="text-teal-400 font-bold tabular-nums">
                    {Math.round(weatherAdaptation.layerAdjustments.breeze * 100)}%
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
                  <span className="text-[10px] text-stone-500 block">المطر:</span>
                  <span className="text-cyan-400 font-bold tabular-nums">
                    {Math.round(weatherAdaptation.layerAdjustments.rain * 100)}%
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
                  <span className="text-[10px] text-stone-500 block">الأمواج:</span>
                  <span className="text-blue-400 font-bold tabular-nums">
                    {Math.round(weatherAdaptation.layerAdjustments.ocean * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
              <button
                onClick={handleApplyWeather}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md"
              >
                <Sliders className="w-4 h-4" />
                <span>تطبيق هذه المعايرة المناخية فوراً</span>
              </button>

              {appliedWeatherSuccess && (
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>تم تكييف المحرك الصوتي مع طقس {city.nameAr}!</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
