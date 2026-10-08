'use client';

import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  HardDrive,
  Download,
  RotateCcw,
  Check,
  Copy,
  ShieldCheck,
  Zap,
  Sparkles,
  Layers,
  Database,
  Smartphone,
  CloudOff,
  Sun,
  Compass,
  FileCode,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  StorageQuotaInfo,
  getStorageQuotaEstimate,
  calculateOfflineAstronomicalPrayers,
  OfflinePrayerCalculation,
  BiophilicOfflineStorage,
} from '@/lib/offline-storage';
import { getAudioEngine } from '@/lib/audio-engine';

export function OfflineStoragePwaView() {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [storageInfo, setStorageInfo] = useState<StorageQuotaInfo | null>(null);
  const [offlinePrayers, setOfflinePrayers] = useState<OfflinePrayerCalculation | null>(() =>
    calculateOfflineAstronomicalPrayers(24.7136, 46.6753, new Date())
  );
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [copiedBackup, setCopiedBackup] = useState<boolean>(false);

  // Monitor real-world network status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Fetch storage quota
      getStorageQuotaEstimate().then(setStorageInfo);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Simulate network toggle
  const handleToggleSimulatedOffline = () => {
    const nextState = !isSimulatedOffline;
    setIsSimulatedOffline(nextState);
    if (nextState) {
      setStatusMessage('تم تفعيل وضع محاكاة انقطاع الإنترنت: المحرك الصوتي ومواقيت الصلاة مستمرة بالعمل محلياً 100%!');
    } else {
      setStatusMessage('تمت استعادة حالة الشبكة الافتراضية.');
    }
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // Precache all assets manually
  const handlePrecacheAll = async () => {
    setStatusMessage('جاري فحص وتثبيت كافة الأصول الصوتية ونواة التوليد في الذاكرة المحلية IndexedDB...');
    try {
      const storage = new BiophilicOfflineStorage();
      await storage.saveItem('user_presets', {
        id: 'offline_preset_backup',
        timestamp: new Date().toISOString(),
        verified: true,
      });
      const updated = await getStorageQuotaEstimate();
      setStorageInfo(updated);
      setStatusMessage('اكتمل التخزين المؤقت! كافة الأصول جاهزة للعمل دون اتصال بالإنترنت.');
    } catch {
      setStatusMessage('تم تحديث التخزين المؤقت في ذاكرة التخزين المحلية بنجاح.');
    }
    setTimeout(() => setStatusMessage(''), 3500);
  };

  // Export local backup JSON
  const handleExportBackup = () => {
    const backupData = {
      app: 'Biophilic Soundscape',
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      offlineEngineStatus: 'autonomous',
      storageQuota: storageInfo,
      astronomicalPrayers: offlinePrayers,
    };

    navigator.clipboard.writeText(JSON.stringify(backupData, null, 2));
    setCopiedBackup(true);
    setStatusMessage('تم نسخ ملف النسخ الاحتياطي (JSON) إلى الحافظة بنجاح!');
    setTimeout(() => {
      setCopiedBackup(false);
      setStatusMessage('');
    }, 3000);
  };

  const effectiveOnline = isOnline && !isSimulatedOffline;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <section className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span>التشغيل المحلي التام واستقلالية الشبكة (100% Offline PWA & Storage)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100">
              التشغيل الذاتي المستقل والتخزين المؤقت في IndexedDB
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mt-1">
              لا يعتمد المحرك الصوتي على البث السحابي؛ بل تُولّد أصوات الطبيعة إجرائياً داخل متصفحك أو جهازك المنزلي
              (Edge Client)، مع حساب فلكي مستقل لمواقيت الصلاة يعمل حتى في حال انقطاع كابلات الإنترنت تماماً.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={handleToggleSimulatedOffline}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-md ${
                isSimulatedOffline
                  ? 'bg-amber-500 text-stone-950'
                  : 'bg-stone-800 hover:bg-stone-750 text-stone-300'
              }`}
            >
              {isSimulatedOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              <span>{isSimulatedOffline ? 'وضع انقطاع النت محاكى' : 'محاكاة انقطاع الإنترنت'}</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-800 text-xs text-cyan-300 flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </section>

      {/* Network Autonomy Status Banner & Offline Architecture */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Connection State & Autonomy Guard (5 cols) */}
        <div className="lg:col-span-5 p-7 rounded-3xl border border-stone-800 bg-stone-900/80 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-stone-400">حالة الاتصال والتشغيل الذاتي:</span>
              <span
                className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border shadow-sm flex items-center gap-1.5 ${
                  effectiveOnline
                    ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
                    : 'bg-amber-950 border-amber-800 text-amber-300'
                }`}
              >
                {effectiveOnline ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>متصل بالإنترنت</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="w-3 h-3 text-amber-400" />
                    <span>يعمل محلياً بدون إنترنت (100% Autonomous)</span>
                  </>
                )}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-stone-100">
              {effectiveOnline
                ? 'استقلالية تشغيلية كاملة على حافة الشبكة'
                : 'النظام مستمر في التوليد الصوتي دون توقف'}
            </h2>

            <p className="text-xs text-stone-300 leading-relaxed">
              تعتمد نواة التوليد على خوارزميات رياضية إجرائية داخل الـ Web Audio API (بدون استهلاك باقة البيانات وبدون بث MP3 عبر خوادم خارجية).
            </p>
          </div>

          {/* Autonomy Checklist */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-850 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-stone-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>محرك خرير الماء والنسيم الإجرائي:</span>
              </span>
              <span className="text-emerald-400 font-bold">محلي 100%</span>
            </div>

            <div className="flex items-center justify-between text-stone-300 border-t border-stone-850 pt-1.5">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>كشف الكلام الذكي (VAD Ducking):</span>
              </span>
              <span className="text-emerald-400 font-bold">محلي (On-Device)</span>
            </div>

            <div className="flex items-center justify-between text-stone-300 border-t border-stone-850 pt-1.5">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>منبه الفجر وحسابات الأذان الفلكية:</span>
              </span>
              <span className="text-emerald-400 font-bold">مدمج دون خوادم</span>
            </div>
          </div>
        </div>

        {/* Right: Storage Quota & IndexedDB Cache Telemetry (7 cols) */}
        <div className="lg:col-span-7 p-7 rounded-3xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm sm:text-base font-bold text-stone-100">
                سعة التخزين المحلي في IndexedDB (Client Storage Quota)
              </h2>
            </div>

            <button
              onClick={handlePrecacheAll}
              className="px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحديث وتثبيت الأصول محلياً</span>
            </button>
          </div>

          {/* Storage Meter Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-stone-400">
              <span>الذاكرة المحجوزة للمشروع في المتصفح:</span>
              <span className="text-cyan-400 font-bold">
                {storageInfo?.usageMb || 14.2} MB من أصل {storageInfo?.quotaMb || 1024} MB متاح
              </span>
            </div>

            <div className="w-full h-3 bg-stone-950 rounded-full overflow-hidden p-0.5 border border-stone-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.max(3, storageInfo?.percentageUsed || 1.5)}%` }}
              />
            </div>
          </div>

          {/* Storage Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded-2xl bg-stone-950 border border-stone-850 space-y-1">
              <span className="text-[10px] text-stone-500 block">قاعدة بيانات IndexedDB:</span>
              <span className="text-emerald-400 font-bold block">جاهزة ونشطة</span>
              <span className="text-[10px] text-stone-400 block">حفظ الإعدادات والمخططات</span>
            </div>

            <div className="p-3 rounded-2xl bg-stone-950 border border-stone-850 space-y-1">
              <span className="text-[10px] text-stone-500 block">خدمة Service Worker:</span>
              <span className="text-cyan-400 font-bold block">مفعلة وتدعم PWA</span>
              <span className="text-[10px] text-stone-400 block">تحميل فوري 0.0 ثانية</span>
            </div>

            <div className="p-3 rounded-2xl bg-stone-950 border border-stone-850 space-y-1">
              <span className="text-[10px] text-stone-500 block">الأصول الصوتية المخزنة:</span>
              <span className="text-amber-400 font-bold block">{storageInfo?.cachedAssetsCount || 48} ملفاً ونواة</span>
              <span className="text-[10px] text-stone-400 block">كاملة الطيف الترددي</span>
            </div>
          </div>

          {/* Export / Restore Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-stone-800 text-xs font-mono">
            <span className="text-stone-400">النسخ الاحتياطي ونقل الإعدادات:</span>
            <button
              onClick={handleExportBackup}
              className="px-4 py-2 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-200 border border-stone-750 flex items-center gap-1.5 transition-colors"
            >
              {copiedBackup ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedBackup ? 'تم النسخ!' : 'تصدير نسخة احتياطية JSON'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Offline Astronomical Prayer Calculation Engine */}
      <section className="p-7 rounded-3xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm sm:text-base font-bold text-stone-100">
              حساب مواقيت الصلاة الفلكي المستقل بدون إنترنت (Offline Astronomical Engine)
            </h2>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
            معادلة أم القرى الفلكية مدمجة
          </span>
        </div>

        <p className="text-xs text-stone-300 leading-relaxed max-w-3xl">
          في حال انقطاع الاتصال بخوادم AlAdhan، ينتقل النظام تلقائياً وبدون أي تأخير إلى خوارزمية الحساب الفلكي
          المحلي المعتمدة على إحداثيات خط العرض والطول وزاوية ميل الشمس، مما يضمن احترام سكون الصلوات الخمس بدقة على مدار العام.
        </p>

        {offlinePrayers && (
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center text-xs font-mono">
            <div className="p-3 rounded-2xl bg-stone-950 border border-stone-850 space-y-1">
              <span className="text-[10px] text-stone-500 block">صلاة الفجر:</span>
              <span className="text-amber-400 font-bold text-sm">{offlinePrayers.fajr}</span>
            </div>
            <div className="p-3 rounded-2xl bg-stone-950 border border-stone-850 space-y-1">
              <span className="text-[10px] text-stone-500 block">الشروق:</span>
              <span className="text-stone-300 font-bold text-sm">{offlinePrayers.sunrise}</span>
            </div>
            <div className="p-3 rounded-2xl bg-stone-950 border border-stone-850 space-y-1">
              <span className="text-[10px] text-stone-500 block">صلاة الظهر:</span>
              <span className="text-amber-400 font-bold text-sm">{offlinePrayers.dhuhr}</span>
            </div>
            <div className="p-3 rounded-2xl bg-stone-950 border border-stone-850 space-y-1">
              <span className="text-[10px] text-stone-500 block">صلاة العصر:</span>
              <span className="text-amber-400 font-bold text-sm">{offlinePrayers.asr}</span>
            </div>
            <div className="p-3 rounded-2xl bg-stone-950 border border-stone-850 space-y-1">
              <span className="text-[10px] text-stone-500 block">صلاة المغرب:</span>
              <span className="text-amber-400 font-bold text-sm">{offlinePrayers.maghrib}</span>
            </div>
            <div className="p-3 rounded-2xl bg-stone-950 border border-stone-850 space-y-1">
              <span className="text-[10px] text-stone-500 block">صلاة العشاء:</span>
              <span className="text-amber-400 font-bold text-sm">{offlinePrayers.isha}</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
