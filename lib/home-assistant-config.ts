// Home Assistant MQTT Auto-Discovery & Automation Templates

export interface MqttBrokerConfig {
  host: string;
  port: number;
  username: string;
  baseTopic: string;
  devicePrefix: string;
}

export const DEFAULT_MQTT_CONFIG: MqttBrokerConfig = {
  host: '192.168.1.150',
  port: 1883,
  username: 'homeassistant',
  baseTopic: 'biophilic_soundscape',
  devicePrefix: 'homeassistant',
};

// Generates Home Assistant MQTT Discovery Payloads
export function generateMqttDiscoveryPayloads(config: MqttBrokerConfig) {
  const device = {
    identifiers: ['biophilic_soundscape_hub_01'],
    name: 'Biophilic Soundscape Controller',
    model: 'RPi5 / Mini PC Acoustic DSP Hub',
    manufacturer: 'Biophilic Systems',
    sw_version: '2.8.4',
  };

  return {
    // 1. Media Player Entity
    mediaPlayer: {
      topic: `${config.devicePrefix}/media_player/${config.baseTopic}/config`,
      payload: {
        name: 'Biophilic Home Soundscape',
        unique_id: 'biophilic_soundscape_media_player',
        command_topic: `${config.baseTopic}/command/playback`,
        state_topic: `${config.baseTopic}/state/playback`,
        volume_command_topic: `${config.baseTopic}/command/volume`,
        volume_state_topic: `${config.baseTopic}/state/volume`,
        device,
      },
    },

    // 2. Binary Sensor: Voice Activity Detection (VAD)
    vadSensor: {
      topic: `${config.devicePrefix}/binary_sensor/${config.baseTopic}_vad/config`,
      payload: {
        name: 'Soundscape Voice Activity (VAD)',
        unique_id: 'biophilic_soundscape_vad_active',
        state_topic: `${config.baseTopic}/state/vad`,
        device_class: 'sound',
        payload_on: 'SPEECH_DETECTED',
        payload_off: 'CLEAR',
        device,
      },
    },

    // 3. Sensor: Diurnal Phase
    phaseSensor: {
      topic: `${config.devicePrefix}/sensor/${config.baseTopic}_phase/config`,
      payload: {
        name: 'Soundscape Circadian Phase',
        unique_id: 'biophilic_soundscape_current_phase',
        state_topic: `${config.baseTopic}/state/phase`,
        icon: 'mdi:weather-sunset',
        device,
      },
    },

    // 4. Number: Ducking Depth
    duckingNumber: {
      topic: `${config.devicePrefix}/number/${config.baseTopic}_ducking_depth/config`,
      payload: {
        name: 'Soundscape Ducking Attenuation',
        unique_id: 'biophilic_soundscape_ducking_depth',
        command_topic: `${config.baseTopic}/command/ducking_depth`,
        state_topic: `${config.baseTopic}/state/ducking_depth`,
        min: -30,
        max: -6,
        step: 1,
        unit_of_measurement: 'dB',
        device,
      },
    },
  };
}

// Generates Home Assistant Automation YAML Examples
export const HOME_ASSISTANT_AUTOMATIONS_YAML = `
# -------------------------------------------------------------
# Biophilic Soundscape + Home Assistant Smart Automations
# -------------------------------------------------------------

# 1. مزامنة الإضاءة الذكية (Philips Hue / Zigbee) مع أطوار البيئة الصوتية
- id: 'biophilic_circadian_lighting_sync'
  alias: 'Biophilic Soundscape: Sync Circadian Lighting'
  trigger:
    - platform: mqtt
      topic: 'biophilic_soundscape/state/phase'
  action:
    - choose:
        # فجر: إضاءة دافئة هادئة تحاكي الشروق
        - conditions:
            - condition: template
              value_template: "{{ trigger.payload == 'dawn' }}"
          sequence:
            - service: light.turn_on
              target:
                area_id: living_room
              data:
                color_temp_kelvin: 2700
                brightness_pct: 40
                transition: 30

        # ظهيرة: إضاءة بيضاء محفزة للتركيز (Daylight)
        - conditions:
            - condition: template
              value_template: "{{ trigger.payload == 'midday' }}"
          sequence:
            - service: light.turn_on
              target:
                area_id: living_room
              data:
                color_temp_kelvin: 5000
                brightness_pct: 85
                transition: 60

        # مساء: إضاءة كهرمانية مريحة
        - conditions:
            - condition: template
              value_template: "{{ trigger.payload == 'evening' }}"
          sequence:
            - service: light.turn_on
              target:
                area_id: living_room
              data:
                color_temp_kelvin: 2200
                brightness_pct: 35
                transition: 45

# 2. كتم ذكي مؤقت عند رنين جرس الباب أو المكالمات الهاتفية
- id: 'biophilic_intercom_ducking'
  alias: 'Biophilic Soundscape: Instant Mute on Doorbell'
  trigger:
    - platform: state
      entity_id: binary_sensor.smart_doorbell_ringing
      to: 'on'
  action:
    - service: mqtt.publish
      data:
        topic: 'biophilic_soundscape/command/duck_force'
        payload: '{"ducked": true, "depthDb": -24, "holdSec": 15}'
`;

// Generates Lovelace UI Dashboard Card YAML
export const LOVELACE_CARD_YAML = `
type: vertical-stack
title: 🍃 البيئة الصوتية الحيوية (Biophilic Soundscape)
cards:
  - type: media-control
    entity: media_player.biophilic_soundscape
  - type: horizontal-stack
    cards:
      - type: entity
        entity: sensor.soundscape_circadian_phase
        name: الطور اليومي
        icon: mdi:sun-clock
      - type: entity
        entity: binary_sensor.soundscape_voice_activity_vad
        name: كشف الكلام
        icon: mdi:microphone-outline
  - type: entities
    title: معايرة العزل والتنظيم
    entities:
      - entity: number.soundscape_ducking_attenuation
        name: عمق الكتم التلقائي (Ducking)
`;

// One-Line Bash Installer Script for Raspberry Pi 5 & Mini PC
export const BASH_INSTALLER_SCRIPT = `#!/usr/bin/env bash
# ==============================================================================
# Biophilic Soundscape Hub Auto-Installer for Raspberry Pi 5 / Debian / Ubuntu
# ==============================================================================
set -euo pipefail

echo "========================================================"
echo "🍃 Installing Biophilic Soundscape DSP Engine on Boot"
echo "========================================================"

# 1. Update OS packages & Install Audio Stack (PipeWire, ALSA, Node.js)
echo "[1/5] Updating repositories & installing audio runtime..."
sudo apt-get update
sudo apt-get install -y pipewire pipewire-audio-client-libraries alsa-utils git curl jq

# Ensure Node.js 20+ LTS is installed
if ! command -v node &> /dev/null; then
  echo "[2/5] Installing Node.js LTS runtime..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# 2. Setup user audio group permissions
echo "[3/5] Granting real-time audio permissions to $USER..."
sudo usermod -aG audio "$USER"

# 3. Create target directory
INSTALL_DIR="/opt/biophilic-soundscape"
sudo mkdir -p "$INSTALL_DIR"
sudo chown -R "$USER:$USER" "$INSTALL_DIR"

# 4. Install Systemd Service Unit
echo "[4/5] Creating systemd service unit..."
sudo tee /etc/systemd/system/biophilic-soundscape.service > /dev/null << 'EOF'
[Unit]
Description=Biophilic Soundscape DSP Engine & Acoustic Hub
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
WantedBy=multi-user.target
EOF

# If running as user other than pi, update the service file
if [ "$USER" != "pi" ]; then
  sudo sed -i "s/User=pi/User=$USER/g" /etc/systemd/system/biophilic-soundscape.service
fi

# 5. Reload & Enable Service on Startup
echo "[5/5] Enabling and starting background service..."
sudo systemctl daemon-reload
sudo systemctl enable biophilic-soundscape.service

echo "========================================================"
echo "✅ Installation Complete! The Soundscape will now auto-start"
echo "   Status: sudo systemctl status biophilic-soundscape"
echo "   Logs:   journalctl -u biophilic-soundscape -f"
echo "========================================================"
`;

// ALSA / PipeWire bit-perfect hardware configuration
export const ALSA_PIPEWIRE_CONF = `
# /etc/pipewire/pipewire.conf.d/99-biophilic-dsp.conf
# Bit-perfect 96kHz / 24-bit real-time streaming for ESS Sabre / HiFiBerry DAC

context.properties = {
    default.clock.rate          = 96000
    default.clock.allowed-rates = [ 44100, 48000, 88200, 96000 ]
    default.clock.quantum       = 128
    default.clock.min-quantum   = 64
    default.clock.max-quantum   = 512
}

context.modules = [
    { name = libpipewire-module-rt
        args = {
            nice.level    = -15
            rt.prio       = 88
            rt.time.soft  = -1
            rt.time.hard  = -1
        }
        flags = [ ifexists nofail ]
    }
]
`;
