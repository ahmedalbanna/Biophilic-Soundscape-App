// Hardware Edge Satellites & Distributed Micro-Nodes (ESP32-S3, ESPHome, Docker, Snapcast)

export interface SatelliteNode {
  id: string;
  nameAr: string;
  nameEn: string;
  roomId: string;
  hardwareModel: 'esp32_s3' | 'esp32_wroom' | 'esp32_poe_eth' | 'raspberry_pi_zero_2w';
  micType: 'inmp441_i2s' | 'sph0645_i2s' | 'ics43434' | 'analog_adc';
  dacType: 'max98357a_i2s' | 'pcm5102a' | 'none_mic_only';
  ipAddress: string;
  macAddress: string;
  rssiDb: number; // -30 to -90 dBm
  pingMs: number;
  firmwareVersion: string;
  status: 'online' | 'active_vad' | 'offline';
  currentSplDb: number; // 30 to 95 dB SPL
  vadSensitivity: number; // 0 to 100%
  lastHeartbeat: string;
  uptimeHours: number;
}

export const INITIAL_SATELLITE_NODES: SatelliteNode[] = [
  {
    id: 'sat_majlis',
    nameAr: 'قمر المجلس الرئيسي (Majlis Satellite)',
    nameEn: 'Majlis Distributed Audio & VAD Node',
    roomId: 'zone_majlis',
    hardwareModel: 'esp32_s3',
    micType: 'inmp441_i2s',
    dacType: 'max98357a_i2s',
    ipAddress: '192.168.1.141',
    macAddress: '34:85:18:2A:4F:90',
    rssiDb: -48,
    pingMs: 14,
    firmwareVersion: 'v2.4.1-biophilic',
    status: 'online',
    currentSplDb: 38.5,
    vadSensitivity: 75,
    lastHeartbeat: 'قبل ثوانٍ',
    uptimeHours: 342,
  },
  {
    id: 'sat_living',
    nameAr: 'قمر صالة المعيشة المفتوحة (Living Room)',
    nameEn: 'Living Room Ceiling Satellite',
    roomId: 'zone_living',
    hardwareModel: 'esp32_s3',
    micType: 'inmp441_i2s',
    dacType: 'pcm5102a',
    ipAddress: '192.168.1.142',
    macAddress: '34:85:18:2B:6C:12',
    rssiDb: -52,
    pingMs: 16,
    firmwareVersion: 'v2.4.1-biophilic',
    status: 'online',
    currentSplDb: 42.0,
    vadSensitivity: 80,
    lastHeartbeat: 'قبل ثوانٍ',
    uptimeHours: 342,
  },
  {
    id: 'sat_bedroom',
    nameAr: 'قمر جناح النوم الرئيسي (Master Suite)',
    nameEn: 'Master Bedroom Discrete Wall Node',
    roomId: 'zone_bedroom',
    hardwareModel: 'esp32_wroom',
    micType: 'sph0645_i2s',
    dacType: 'none_mic_only',
    ipAddress: '192.168.1.143',
    macAddress: '24:0A:C4:9E:11:88',
    rssiDb: -61,
    pingMs: 22,
    firmwareVersion: 'v2.3.8-biophilic',
    status: 'online',
    currentSplDb: 33.2,
    vadSensitivity: 70,
    lastHeartbeat: 'قبل ثوانٍ',
    uptimeHours: 198,
  },
  {
    id: 'sat_corridor',
    nameAr: 'قمر الممرات السلكي PoE (Corridor Ethernet)',
    nameEn: 'Corridor PoE Industrial Node (WT32-ETH01)',
    roomId: 'zone_corridor',
    hardwareModel: 'esp32_poe_eth',
    micType: 'inmp441_i2s',
    dacType: 'max98357a_i2s',
    ipAddress: '192.168.1.144',
    macAddress: '10:52:1C:77:43:02',
    rssiDb: -30, // Ethernet cable
    pingMs: 3, // wired ultra-low latency
    firmwareVersion: 'v2.4.1-biophilic',
    status: 'online',
    currentSplDb: 31.0,
    vadSensitivity: 85,
    lastHeartbeat: 'قبل ثوانٍ',
    uptimeHours: 856,
  },
];

// Generator for ESPHome YAML configuration
export function generateEspHomeYaml(node: SatelliteNode): string {
  return `# ESPHome Configuration for Biophilic Edge Satellite
# Target: ${node.nameEn} (${node.ipAddress})
esphome:
  name: biophilic-${node.id}
  friendly_name: "${node.nameAr}"

esp32:
  board: esp32-s3-devkitc-1
  framework:
    type: esp-idf

wifi:
  ssid: "!secret wifi_ssid"
  password: "!secret wifi_password"
  manual_ip:
    static_ip: ${node.ipAddress}
    gateway: 192.168.1.1
    subnet: 255.255.255.0

mqtt:
  broker: 192.168.1.100
  port: 1883
  topic_prefix: biophilic/satellites/${node.id}
  birth_message:
    topic: biophilic/satellites/${node.id}/status
    payload: "online"
  will_message:
    topic: biophilic/satellites/${node.id}/status
    payload: "offline"

# I2S MEMS Digital Microphone (INMP441 / SPH0645)
i2s_audio:
  - id: i2s_mic
    i2s_lrclk_pin: GPIO4
    i2s_bclk_pin: GPIO5

microphone:
  - platform: i2s_audio
    id: mems_mic
    i2s_audio_id: i2s_mic
    i2s_din_pin: GPIO6
    pdm: false
    adc_type: external
    bits_per_sample: 32bit

# Local Voice Activity Detection & SPL Meter
sensor:
  - platform: template
    name: "Acoustic SPL dB"
    id: sound_spl
    unit_of_measurement: "dB"
    update_interval: 250ms
    lambda: |-
      return id(mems_mic).get_sound_level();

binary_sensor:
  - platform: template
    name: "Room Speech Detected (VAD)"
    id: speech_vad
    filters:
      - delayed_off: 1200ms
    lambda: |-
      return id(sound_spl).state > ${node.vadSensitivity === 80 ? '58.0' : '62.0'};
    on_press:
      - mqtt.publish:
          topic: biophilic/engine/vad_trigger
          payload: '{"node_id": "${node.id}", "room": "${node.roomId}", "duck": true, "spl_db": 68.5}'
    on_release:
      - mqtt.publish:
          topic: biophilic/engine/vad_trigger
          payload: '{"node_id": "${node.id}", "room": "${node.roomId}", "duck": false}'
`;
}

// Generator for compile-ready Arduino C++ Firmware (ESP-IDF / PlatformIO)
export function generateArduinoCppFirmware(node: SatelliteNode): string {
  return `/**
 * Biophilic Soundscape: Distributed Edge VAD Satellite Firmware
 * Model: ESP32-S3 | Mic: I2S INMP441 | Room: ${node.roomId}
 * Features: Zero-Copy DMA I2S, RMS SPL Metering, Sub-20ms MQTT Ducking
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <driver/i2s.h>

#define I2S_PORT         I2S_NUM_0
#define I2S_SCK_PIN      5   // BCLK
#define I2S_WS_PIN       4   // LRCLK
#define I2S_SD_PIN       6   // DATA IN
#define SAMPLE_RATE      16000
#define BUFFER_SAMPLES   256

const char* ssid         = "SmartHome_IoT";
const char* password     = "VillasSecure2026";
const char* mqtt_server  = "192.168.1.100";
const char* node_id      = "${node.id}";
const char* room_id      = "${node.roomId}";

WiFiClient espClient;
PubSubClient client(espClient);

void setup_i2s() {
  i2s_config_t i2s_config = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = SAMPLE_RATE,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count = 4,
    .dma_buf_len = BUFFER_SAMPLES,
    .use_apll = false
  };

  i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_SCK_PIN,
    .ws_io_num = I2S_WS_PIN,
    .data_out_num = I2S_PIN_NO_CHANGE,
    .data_in_num = I2S_SD_PIN
  };

  i2s_driver_install(I2S_PORT, &i2s_config, 0, NULL);
  i2s_set_pin(I2S_PORT, &pin_config);
}

void setup() {
  Serial.begin(115200);
  setup_i2s();
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
    Serial.print(".");
  }
  
  client.setServer(mqtt_server, 1883);
}

void loop() {
  if (!client.connected()) {
    client.connect(node_id);
    client.publish("biophilic/satellites/status", "online");
  }
  client.loop();

  // Read I2S audio frames via DMA
  int32_t samples[BUFFER_SAMPLES];
  size_t bytes_read = 0;
  i2s_read(I2S_PORT, &samples, sizeof(samples), &bytes_read, portMAX_DELAY);

  // Compute Root Mean Square (RMS) Energy for speech detection
  double sum = 0.0;
  int sample_count = bytes_read / sizeof(int32_t);
  for (int i = 0; i < sample_count; i++) {
    double val = (double)(samples[i] >> 14); // normalize 32bit to 16bit range
    sum += val * val;
  }
  double rms = sqrt(sum / sample_count);
  double spl_db = 20.0 * log10(rms + 1.0);

  // VAD Threshold check (Typically > 58 dB indicates clear human voice)
  static bool was_speech = false;
  bool is_speech = (spl_db > 58.5);

  if (is_speech != was_speech) {
    was_speech = is_speech;
    char payload[128];
    snprintf(payload, sizeof(payload), 
      "{\\"node\\":\\"%s\\",\\"room\\":\\"%s\\",\\"duck\\":%s,\\"db\\":%.1f}", 
      node_id, room_id, is_speech ? "true" : "false", spl_db
    );
    client.publish("biophilic/engine/vad_trigger", payload);
  }

  delay(20);
}
`;
}

// Generator for production Docker Compose headless stack
export function generateDockerComposeYaml(): string {
  return `# Complete Production Docker Stack for Biophilic Soundscape
# Target: Raspberry Pi 5 / Home Server / Intel NUC
version: '3.8'

services:
  # 1. Biophilic Central Engine & PWA UI
  biophilic-engine:
    image: node:20-alpine
    container_name: biophilic_engine
    restart: unless-stopped
    working_dir: /app
    volumes:
      - ./:/app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - MQTT_BROKER_URL=mqtt://mosquitto:1883
    command: npm run start
    depends_on:
      - mosquitto
      - snapcast-server

  # 2. Eclipse Mosquitto MQTT Broker for Edge Satellites
  mosquitto:
    image: eclipse-mosquitto:2.0
    container_name: biophilic_mqtt
    restart: unless-stopped
    ports:
      - "1883:1883"
      - "9001:9001"
    volumes:
      - ./mosquitto/config:/mosquitto/config
      - ./mosquitto/data:/mosquitto/data

  # 3. Snapcast Server (Lossless Multi-Room Audio Synchronizer)
  snapcast-server:
    image: saiyp/snapserver:latest
    container_name: biophilic_snapserver
    restart: unless-stopped
    network_mode: host
    volumes:
      - ./snapcast/snapserver.conf:/etc/snapserver.conf
      - /tmp/snapfifo:/tmp/snapfifo
    environment:
      - START_SNAPCLIENT=false

  # 4. Shairport-Sync (Apple AirPlay 2 Receiver to Biophilic Bus)
  shairport-sync:
    image: mikebrady/shairport-sync:latest
    container_name: biophilic_airplay
    restart: unless-stopped
    network_mode: host
    volumes:
      - /tmp/snapfifo:/tmp/snapfifo
    command: -a "Biophilic Living Room" --output=pipe -- /tmp/snapfifo
`;
}

// Generator for ALSA HiFiBerry / USB Soundcard config (asound.conf)
export function generateAlsaConfig(): string {
  return `# ALSA Configuration for Low-Latency Lossless DAC Output (/etc/asound.conf)
pcm.!default {
    type plug
    slave.pcm "dmixer"
}

pcm.dmixer {
    type dmix
    ipc_key 1024
    ipc_perm 0666
    slave {
        pcm "hw:0,0"     # HiFiBerry DAC+ or USB Audio interface
        period_time 0
        period_size 1024
        buffer_size 4096
        rate 48000
        format S24_3LE   # 24-bit Hi-Res
    }
    bindings {
        0 0
        1 1
    }
}

ctl.!default {
    type hw
    card 0
}
`;
}
