// Smart Home Ecosystems Integration Engine (Apple HomeKit, Siri Shortcuts, HACS, Matter/Thread)

export interface SiriShortcut {
  id: string;
  phraseAr: string;
  phraseEn: string;
  actionDescriptionAr: string;
  targetBiomeOrPhase: string;
  targetVolume: number;
}

export interface HacsEntityDefinition {
  entityId: string;
  domain: 'media_player' | 'sensor' | 'binary_sensor' | 'number' | 'select';
  nameAr: string;
  nameEn: string;
  state: string | number;
  unit?: string;
  icon: string;
}

export const SIRI_SHORTCUTS_LIST: SiriShortcut[] = [
  {
    id: 'siri_hanifah',
    phraseAr: 'يا سيري، شغّل بيئة وادي حنيفة',
    phraseEn: 'Hey Siri, play Wadi Hanifah soundscape',
    actionDescriptionAr: 'تفعيل المحرك الصوتي ببيئة نجد وحفيف النخيل وهدير المياه المتدفقة',
    targetBiomeOrPhase: 'wadi_hanifah',
    targetVolume: 0.75,
  },
  {
    id: 'siri_asir',
    phraseAr: 'يا سيري، شغّل ضباب وغابات عسير',
    phraseEn: 'Hey Siri, play Asir mist and mountain forest',
    actionDescriptionAr: 'تفعيل رذاذ المطر الجبلي ونسيم العرعر مع زقزقة طيور السودة',
    targetBiomeOrPhase: 'asir_soudah',
    targetVolume: 0.7,
  },
  {
    id: 'siri_sleep',
    phraseAr: 'يا سيري، فعّل وضع النوم العميق',
    phraseEn: 'Hey Siri, activate deep sleep mode',
    actionDescriptionAr: 'تخفيض الإضاءة إلى 1,800K وتشغيل مؤقت انحسار الصوت الليلي لمدة 45 دقيقة',
    targetBiomeOrPhase: 'sleep_induction',
    targetVolume: 0.25,
  },
  {
    id: 'siri_farasan',
    phraseAr: 'يا سيري، شغّل أمواج جزر فرسان',
    phraseEn: 'Hey Siri, play Farasan turquoise sea waves',
    actionDescriptionAr: 'تفعيل أمواج البحر الهادئة وتكسر المياه الفيروزية مع نسيم الشاطئ',
    targetBiomeOrPhase: 'farasan_sea',
    targetVolume: 0.65,
  },
  {
    id: 'siri_focus',
    phraseAr: 'يا سيري، أريد بيئة عمل وتركيز هادئة',
    phraseEn: 'Hey Siri, activate deep focus soundscape',
    actionDescriptionAr: 'تفعيل قناع الضوضاء الحضرية وخرير الماء الإجرائي بدون مشتتات',
    targetBiomeOrPhase: 'deep_focus',
    targetVolume: 0.6,
  },
];

export const INITIAL_HACS_ENTITIES: HacsEntityDefinition[] = [
  {
    entityId: 'media_player.biophilic_soundscape',
    domain: 'media_player',
    nameAr: 'مشغل البيئة الصوتية الحيوية',
    nameEn: 'Biophilic Soundscape Central Player',
    state: 'playing',
    icon: 'mdi:nature-people',
  },
  {
    entityId: 'sensor.biophilic_circadian_phase',
    domain: 'sensor',
    nameAr: 'الفترة اليومية التكيفية',
    nameEn: 'Current Circadian Phase',
    state: 'العصر وتراجع التوهج',
    icon: 'mdi:weather-sunset-down',
  },
  {
    entityId: 'binary_sensor.biophilic_speech_ducking',
    domain: 'binary_sensor',
    nameAr: 'حالة كشف الكلام وانحسار الصوت (VAD)',
    nameEn: 'Voice Activity Ducking Active',
    state: 'off',
    icon: 'mdi:account-voice',
  },
  {
    entityId: 'sensor.biophilic_room_spl_db',
    domain: 'sensor',
    nameAr: 'مستوى ضغط الصوت في الغرفة (SPL)',
    nameEn: 'Acoustic Room SPL Level',
    state: 41.2,
    unit: 'dB SPL',
    icon: 'mdi:volume-vibrate',
  },
  {
    entityId: 'select.biophilic_active_biome',
    domain: 'select',
    nameAr: 'البيئة الطبيعية المحددة',
    nameEn: 'Selected Biophilic Biome',
    state: 'سودة عسير',
    icon: 'mdi:forest',
  },
  {
    entityId: 'number.biophilic_water_stream_volume',
    domain: 'number',
    nameAr: 'شدة تدفق خرير الماء',
    nameEn: 'Water Stream Intensity',
    state: 75,
    unit: '%',
    icon: 'mdi:water',
  },
];

// Generator for Home Assistant HACS manifest.json
export function generateHacsManifestJson(): string {
  return JSON.stringify(
    {
      domain: 'biophilic_soundscape',
      name: 'Biophilic Soundscape & Circadian Engine',
      codeowners: ['@ahmedalbanna', '@biophilic-soundscape'],
      documentation: 'https://github.com/biophilic-soundscape/ha-integration',
      dependencies: ['mqtt'],
      requirements: ['paho-mqtt>=1.6.1'],
      version: '2.5.0',
      iot_class: 'local_push',
      integration_type: 'hub',
    },
    null,
    2
  );
}

// Generator for Home Assistant Python Media Player Component (media_player.py)
export function generateHacsMediaPlayerPy(): string {
  return `"""
Home Assistant Custom Component: Biophilic Soundscape Media Player
Platform: media_player.py | Protocol: Local MQTT / WebSocket
"""
import logging
from homeassistant.components.media_player import (
    MediaPlayerEntity,
    MediaPlayerEntityFeature,
    MediaPlayerState,
)
from homeassistant.const import STATE_OFF, STATE_PLAYING, STATE_PAUSED

_LOGGER = logging.getLogger(__name__)

class BiophilicSoundscapeMediaPlayer(MediaPlayerEntity):
    """Representation of the Biophilic Soundscape Multi-Room Player."""

    def __init__(self, hass, config):
        self._hass = hass
        self._name = "Biophilic Soundscape Master"
        self._state = MediaPlayerState.PLAYING
        self._volume = 0.75
        self._is_volume_muted = False
        self._sound_mode = "asir_soudah"
        self._sound_mode_list = [
            "asir_soudah",
            "wadi_hanifah",
            "al_ahsa_oasis",
            "farasan_islands",
            "taif_rose",
        ]

    @property
    def supported_features(self):
        """Flag media player features that are supported."""
        return (
            MediaPlayerEntityFeature.PLAY
            | MediaPlayerEntityFeature.PAUSE
            | MediaPlayerEntityFeature.VOLUME_SET
            | MediaPlayerEntityFeature.VOLUME_MUTE
            | MediaPlayerEntityFeature.SELECT_SOUND_MODE
        )

    @property
    def name(self):
        return self._name

    @property
    def state(self):
        return self._state

    @property
    def volume_level(self):
        return self._volume

    @property
    def sound_mode(self):
        return self._sound_mode

    @property
    def sound_mode_list(self):
        return self._sound_mode_list

    async def async_set_volume_level(self, volume):
        """Set volume level, range 0..1."""
        self._volume = volume
        await self._hass.components.mqtt.async_publish(
            "biophilic/engine/master_volume/set", str(volume)
        )
        self.async_write_ha_state()

    async def async_media_play(self):
        """Send play command to Biophilic Audio Engine."""
        self._state = MediaPlayerState.PLAYING
        await self._hass.components.mqtt.async_publish("biophilic/engine/playback/set", "play")
        self.async_write_ha_state()

    async def async_media_pause(self):
        """Send pause command to Biophilic Audio Engine."""
        self._state = MediaPlayerState.PAUSED
        await self._hass.components.mqtt.async_publish("biophilic/engine/playback/set", "pause")
        self.async_write_ha_state()

    async def async_select_sound_mode(self, sound_mode):
        """Switch natural biome via MQTT."""
        self._sound_mode = sound_mode
        await self._hass.components.mqtt.async_publish("biophilic/engine/biome/set", sound_mode)
        self.async_write_ha_state()
`;
}

// Generator for Home Assistant Lovelace Dashboard Card YAML
export function generateLovelaceCardYaml(): string {
  return `# Custom Lovelace Card: Biophilic Living Dashboard Card
type: vertical-stack
cards:
  - type: custom:mushroom-media-player-card
    entity: media_player.biophilic_soundscape
    name: البيئة الصوتية الحيوية الذكية
    use_media_artwork_slug: false
    show_volume_level: true
    volume_controls:
      - volume_buttons
      - volume_slider
    layout: horizontal
    icon: mdi:nature-people

  - type: horizontal-stack
    cards:
      - type: custom:mushroom-chips-card
        chips:
          - type: entity
            entity: sensor.biophilic_circadian_phase
            icon: mdi:weather-sunset
          - type: entity
            entity: binary_sensor.biophilic_speech_ducking
            icon: mdi:account-voice
          - type: entity
            entity: sensor.biophilic_room_spl_db
            icon: mdi:decibel

  - type: grid
    columns: 3
    square: false
    cards:
      - type: button
        name: سودة عسير
        icon: mdi:pine-tree
        tap_action:
          action: call-service
          service: media_player.select_sound_mode
          target:
            entity_id: media_player.biophilic_soundscape
          data:
            sound_mode: asir_soudah
      - type: button
        name: وادي حنيفة
        icon: mdi:water
        tap_action:
          action: call-service
          service: media_player.select_sound_mode
          target:
            entity_id: media_player.biophilic_soundscape
          data:
            sound_mode: wadi_hanifah
      - type: button
        name: جزر فرسان
        icon: mdi:waves
        tap_action:
          action: call-service
          service: media_player.select_sound_mode
          target:
            entity_id: media_player.biophilic_soundscape
          data:
            sound_mode: farasan_islands
`;
}

// Generator for Homebridge Config (Apple HomeKit Bridge)
export function generateHomebridgeConfigJson(): string {
  return JSON.stringify(
    {
      bridge: {
        name: 'Biophilic HomeBridge',
        username: 'CC:22:3D:E3:CE:31',
        port: 51826,
        pin: '031-45-154',
      },
      accessories: [
        {
          accessory: 'BiophilicSpeaker',
          name: 'سماعات البيئة الصوتية (Living Room Biophilic)',
          manufacturer: 'Biophilic Soundscape Systems',
          model: 'Smart Hub 2026',
          serialNumber: 'BIO-2026-SA01',
          mqttBroker: 'mqtt://192.168.1.100:1883',
          topicStatus: 'biophilic/engine/status',
          topicVolume: 'biophilic/engine/master_volume',
          topicMute: 'biophilic/engine/mute',
        },
      ],
    },
    null,
    2
  );
}
