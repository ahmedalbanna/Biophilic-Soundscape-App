'use client';

import React, { useState } from 'react';
import {
  Terminal,
  Server,
  Home,
  Copy,
  Check,
  Download,
  Zap,
  Radio,
  Sliders,
  Sparkles,
  ExternalLink,
  Code2,
  Cpu,
} from 'lucide-react';
import {
  MqttBrokerConfig,
  DEFAULT_MQTT_CONFIG,
  generateMqttDiscoveryPayloads,
  BASH_INSTALLER_SCRIPT,
  HOME_ASSISTANT_AUTOMATIONS_YAML,
  LOVELACE_CARD_YAML,
  ALSA_PIPEWIRE_CONF,
} from '@/lib/home-assistant-config';

export function DeploymentIntegrationView() {
  const [subTab, setSubTab] = useState<'boot' | 'ha' | 'dac'>('boot');
  const [mqttConfig, setMqttConfig] = useState<MqttBrokerConfig>(DEFAULT_MQTT_CONFIG);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testPublishSuccess, setTestPublishSuccess] = useState(false);

  const discoveryPayloads = generateMqttDiscoveryPayloads(mqttConfig);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleTestPublish = () => {
    setTestPublishSuccess(true);
    setTimeout(() => setTestPublishSuccess(false), 4000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <section className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>أدوات النشر والتكامل المنزلي (Deployment & Home Automation Suite)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100">
              حزم التشغيل الذاتي وربط Home Assistant / MQTT
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mt-1">
              جهّز جهازك المصغر (Raspberry Pi 5 أو Mini PC) ليعمل تلقائياً عند إقلاع النظام كخدمة خلفية (Systemd Daemon)،
              واربط البيئة الصوتية الحيوية بمنظومة Home Assistant لمزامنة الإضاءة الذكية وحساسات الحركة وأجراس الأبواب.
            </p>
          </div>

          {/* Segmented Controls for Sub-tabs */}
          <div className="flex items-center gap-1 p-1 bg-stone-950/80 rounded-xl border border-stone-800 self-start sm:self-auto">
            <button
              onClick={() => setSubTab('boot')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                subTab === 'boot'
                  ? 'bg-stone-800 text-emerald-400 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              التشغيل التلقائي (Boot)
            </button>
            <button
              onClick={() => setSubTab('ha')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                subTab === 'ha'
                  ? 'bg-stone-800 text-emerald-400 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              تكامل Home Assistant
            </button>
            <button
              onClick={() => setSubTab('dac')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                subTab === 'dac'
                  ? 'bg-stone-800 text-emerald-400 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              توصيل الـ DAC والعتاد
            </button>
          </div>
        </div>
      </section>

      {/* Sub-Tab 1: Systemd & Auto-Boot Suite */}
      {subTab === 'boot' && (
        <div className="space-y-6 animate-fadeIn">
          {/* One-Line Terminal Installer Card */}
          <div className="p-6 rounded-2xl border border-emerald-800/60 bg-stone-900/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <Terminal className="w-4 h-4" />
                <span>أمر التثبيت التلقائي المباشر (One-Line Terminal Install)</span>
              </div>
              <span className="text-[11px] font-mono text-stone-400 bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
                Raspberry Pi OS 64-bit / Debian / Ubuntu
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-300">
              قم بفتح شاشة الأوامر (SSH / Terminal) في جهازك وشغّل هذا الأمر الواحد، ليقوم السكربت تلقائياً
              بتثبيت حزمة الصوت PipeWire، وتهيئة بيئة Node.js، وإنشاء خدمة النظام المستمرة:
            </p>

            <div className="relative group">
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 font-mono text-xs text-emerald-300 overflow-x-auto flex items-center justify-between">
                <code>
                  curl -fsSL &quot;https://ais-dev-6bwwpxwg6xfxl5g5tx3qge-399373516352.europe-west1.run.app/api/integration/scripts/install-hub.sh&quot; | bash
                </code>
                <button
                  onClick={() =>
                    copyToClipboard(
                      'curl -fsSL "https://ais-dev-6bwwpxwg6xfxl5g5tx3qge-399373516352.europe-west1.run.app/api/integration/scripts/install-hub.sh" | bash',
                      'curl_cmd'
                    )
                  }
                  className="mr-3 p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors shrink-0"
                  title="نسخ الأمر"
                >
                  {copiedKey === 'curl_cmd' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="/api/integration/scripts/install-hub.sh"
                download="install-biophilic-hub.sh"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-medium border border-stone-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تحميل ملف السكربت (.sh)</span>
              </a>
              <span className="text-xs text-stone-500">
                يتضمن إعطاء أولوية المعالجة اللحظية للصوت (Real-time Priority RT_PRIO 95)
              </span>
            </div>
          </div>

          {/* Systemd Service Configuration & PipeWire Low-Latency Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Systemd Service Unit */}
            <div className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-stone-200">
                    ملف خدمة النظام (Systemd Service Unit)
                  </h3>
                </div>
                <button
                  onClick={() => copyToClipboard(BASH_INSTALLER_SCRIPT, 'systemd_unit')}
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs flex items-center gap-1 px-2 transition-colors"
                >
                  {copiedKey === 'systemd_unit' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>نسخ</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 font-mono text-[11px] text-stone-300 overflow-x-auto max-h-56 leading-relaxed">
                <pre>{`[Unit]
Description=Biophilic Soundscape DSP Engine
After=network.target sound.target pipewire.service
Wants=sound.target

[Service]
Type=simple
User=pi
WorkingDirectory=/opt/biophilic-soundscape
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
LimitRTPRIO=95
LimitMEMLOCK=infinity
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target`}</pre>
              </div>

              <div className="space-y-1.5 text-xs text-stone-400">
                <span className="font-semibold text-stone-300 block">أوامر الإدارة عبر الطرفية:</span>
                <div className="font-mono text-[11px] space-y-1 bg-stone-950/60 p-2.5 rounded-lg border border-stone-800/80 text-stone-400">
                  <div>sudo systemctl enable biophilic-soundscape</div>
                  <div>sudo systemctl start biophilic-soundscape</div>
                  <div>journalctl -u biophilic-soundscape -f</div>
                </div>
              </div>
            </div>

            {/* PipeWire Low-Latency Audio Config */}
            <div className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-stone-200">
                    تهيئة تأخير الصوت المنخفض (PipeWire 96kHz)
                  </h3>
                </div>
                <button
                  onClick={() => copyToClipboard(ALSA_PIPEWIRE_CONF, 'pipewire_conf')}
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs flex items-center gap-1 px-2 transition-colors"
                >
                  {copiedKey === 'pipewire_conf' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>نسخ</span>
                </button>
              </div>

              <p className="text-xs text-stone-400 leading-relaxed">
                يضمن تشغيل مخزن الصوت بحجم 128 عينة وتردد 96kHz مما يحقق زمناً استجابياً فائق السرعة
                (أقل من 4 ملي ثانية) لمنع أي تقطيع أثناء توليد وتراكب الطبقات الطبيعية.
              </p>

              <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 font-mono text-[11px] text-stone-300 overflow-x-auto max-h-48 leading-relaxed">
                <pre>{ALSA_PIPEWIRE_CONF.trim()}</pre>
              </div>

              <div className="text-[11px] text-stone-500 font-mono">
                المسار: /etc/pipewire/pipewire.conf.d/99-biophilic-dsp.conf
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Home Assistant & MQTT */}
      {subTab === 'ha' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Broker Settings & Discovery Configurator */}
          <div className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-stone-100 flex items-center gap-2">
                  <Home className="w-4 h-4 text-sky-400" />
                  <span>اكتشاف الأجهزة التلقائي في Home Assistant عبر MQTT</span>
                </h3>
                <p className="text-xs text-stone-400">
                  بمجرد تشغيل النظام وبث حزمة الاكتشاف (MQTT Discovery)، ستظهر البيئة الصوتية ككيان متكامل في هوم أسيستانت
                </p>
              </div>

              <button
                onClick={handleTestPublish}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs transition-colors self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>محاكاة إرسال حزم الاكتشاف (Publish)</span>
              </button>
            </div>

            {testPublishSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>تم إرسال حزمة الاكتشاف التلقائي لـ Home Assistant بنجاح! تم تعريف الكيانات: Media Player, VAD Sensor, Phase Sensor.</span>
              </div>
            )}

            {/* Connection Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-stone-400">عنوان خادم MQTT (Broker IP):</label>
                <input
                  type="text"
                  value={mqttConfig.host}
                  onChange={(e) => setMqttConfig({ ...mqttConfig, host: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 font-mono"
                  placeholder="192.168.1.150"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-stone-400">منفذ الاتصال (Port):</label>
                <input
                  type="number"
                  value={mqttConfig.port}
                  onChange={(e) => setMqttConfig({ ...mqttConfig, port: parseInt(e.target.value) || 1883 })}
                  className="w-full text-xs p-2 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-stone-400">بادئة الموضوع (Base Topic):</label>
                <input
                  type="text"
                  value={mqttConfig.baseTopic}
                  onChange={(e) => setMqttConfig({ ...mqttConfig, baseTopic: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 font-mono"
                />
              </div>
            </div>

            {/* Discovered Entities Preview */}
            <div className="pt-2 space-y-2">
              <span className="text-xs font-semibold text-stone-300 block">الكيانات المُعرّفة تلقائياً (Auto-Generated Entities):</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                  <div className="text-stone-400 text-[11px]">مشغل الوسائط:</div>
                  <div className="text-emerald-400 font-semibold truncate">media_player.{mqttConfig.baseTopic}</div>
                  <div className="text-[10px] text-stone-500">Play/Pause, Volume, Preset</div>
                </div>

                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                  <div className="text-stone-400 text-[11px]">حساس كشف الكلام (VAD):</div>
                  <div className="text-amber-400 font-semibold truncate">binary_sensor.{mqttConfig.baseTopic}_vad</div>
                  <div className="text-[10px] text-stone-500">Active / Clear (Voice Detect)</div>
                </div>

                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                  <div className="text-stone-400 text-[11px]">حساس الطور اليومي:</div>
                  <div className="text-sky-400 font-semibold truncate">sensor.{mqttConfig.baseTopic}_phase</div>
                  <div className="text-[10px] text-stone-500">Dawn / Midday / Evening</div>
                </div>

                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                  <div className="text-stone-400 text-[11px]">متحكم عمق الكتم:</div>
                  <div className="text-teal-400 font-semibold truncate">number.{mqttConfig.baseTopic}_ducking</div>
                  <div className="text-[10px] text-stone-500">Slider -30dB to -6dB</div>
                </div>
              </div>
            </div>
          </div>

          {/* Automations YAML & Lovelace Card Code */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Automation Blueprints */}
            <div className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-stone-200">
                    أتمتة مزامنة الإضاءة وجرس الباب (Automations YAML)
                  </h3>
                </div>
                <button
                  onClick={() => copyToClipboard(HOME_ASSISTANT_AUTOMATIONS_YAML, 'ha_yaml')}
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs flex items-center gap-1 px-2 transition-colors"
                >
                  {copiedKey === 'ha_yaml' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>نسخ</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 font-mono text-[11px] text-stone-300 overflow-x-auto max-h-60 leading-relaxed">
                <pre>{HOME_ASSISTANT_AUTOMATIONS_YAML.trim()}</pre>
              </div>

              <p className="text-[11px] text-stone-400">
                ألصق هذه الأكواد داخل ملف <code className="text-emerald-400 font-mono">automations.yaml</code> في Home Assistant
                لتغيير درجة حرارة ألوان مصابيح المنزل (Kelvin) مع دورة الصوت البيوفيلية.
              </p>
            </div>

            {/* Lovelace Dashboard Card */}
            <div className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-sky-400" />
                  <h3 className="text-sm font-bold text-stone-200">
                    بطاقة واجهة المستخدم (Lovelace UI Card)
                  </h3>
                </div>
                <button
                  onClick={() => copyToClipboard(LOVELACE_CARD_YAML, 'lovelace_card')}
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs flex items-center gap-1 px-2 transition-colors"
                >
                  {copiedKey === 'lovelace_card' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>نسخ</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 font-mono text-[11px] text-stone-300 overflow-x-auto max-h-60 leading-relaxed">
                <pre>{LOVELACE_CARD_YAML.trim()}</pre>
              </div>

              <p className="text-[11px] text-stone-400">
                أضف بطاقة كـ Manual Card في لوحة تحكم Home Assistant للتحكم في التشغيل وضبط حساسية الكتم بسهولة من هاتفك.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: DAC & Hardware Wiring Architecture */}
      {subTab === 'dac' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 space-y-4">
            <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>مخطط توصيل العتاد ومسار الإشارة الصوتية (Hardware Signal Flow)</span>
            </h3>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              للحصول على جودة نقاء صوتي عالية (Audiophile Grade) تمنع أي تشويش أو طنين كهربائي في سماعات السقف،
              يُوصى باتباع مسار الإشارة التالي:
            </p>

            {/* Step by step schematic flow */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
                  <span className="font-bold">المرحلة 1</span>
                  <Cpu className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-stone-200">وحدة المعالجة المركزية</h4>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Raspberry Pi 5 أو Intel N100 Mini PC يشغل محرك التراكب الديناميكي بدقة 96kHz.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-sky-400">
                  <span className="font-bold">المرحلة 2</span>
                  <Radio className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-stone-200">محول الـ DAC الرقمي</h4>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  بطاقة HiFiBerry DAC2 HD عبر I2S أو USB DAC مثل Topping E50 بشريحة ESS Sabre ES9068AS.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-amber-400">
                  <span className="font-bold">المرحلة 3</span>
                  <Zap className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-stone-200">مضخم القنوات الموزع</h4>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  مضخم 8 قنوات Class-D عالي الكفاءة (GaN FET) يغذي الأسلاك المعزولة الممتدة للغرف.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-teal-400">
                  <span className="font-bold">المرحلة 4</span>
                  <Home className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-stone-200">السماعات المعمارية</h4>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  سماعات شريطية محفوفة في الجبس، ومحولات اهتزازية غير مرئية توزع الصوت محيطياً.
                </p>
              </div>
            </div>

            {/* ALSA Configuration Tip */}
            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 text-xs text-stone-300 space-y-1.5 mt-4">
              <span className="font-semibold text-emerald-400 block">نصيحة تقنية لربط بطاقة HiFiBerry I2S DAC في Raspberry Pi:</span>
              <p className="text-stone-400 leading-relaxed font-mono text-[11px]">
                أضف السطر التالي إلى ملف <code className="text-stone-200">/boot/firmware/config.txt</code> ثم أعد التشغيل:
                <br />
                <span className="text-emerald-400">dtoverlay=hifiberry-dacplus</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
