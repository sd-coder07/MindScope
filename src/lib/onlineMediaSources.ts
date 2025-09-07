// Online Media Sources Configuration
// This file contains curated online sources for meditation audio and video

export interface OnlineMediaSource {
  id: string;
  name: string;
  audioSources: Array<{
    id: string;
    name: string;
    url: string;
    volume: number;
    loop: boolean;
    description: string;
  }>;
  videoSource?: {
    id: string;
    name: string;
    url: string;
    loop: boolean;
    description: string;
  };
}

export const ONLINE_MEDITATION_SOURCES: Record<string, OnlineMediaSource> = {
  'morning-mindfulness': {
    id: 'morning-mindfulness',
    name: 'Morning Mindfulness',
    audioSources: [
      {
        id: 'gentle-piano',
        name: 'Gentle Piano',
        url: 'https://cdn.freesound.org/previews/316/316847_5123451-lq.mp3',
        volume: 0.6,
        loop: true,
        description: 'Soft piano melodies for morning meditation'
      },
      {
        id: 'nature-sounds',
        name: 'Nature Sounds',
        url: 'https://cdn.freesound.org/previews/397/397067_5123451-lq.mp3',
        volume: 0.4,
        loop: true,
        description: 'Peaceful nature ambience'
      },
      {
        id: 'birds',
        name: 'Morning Birds',
        url: 'https://cdn.freesound.org/previews/202/202094_3854185-lq.mp3',
        volume: 0.3,
        loop: true,
        description: 'Gentle bird songs'
      }
    ],
    videoSource: {
      id: 'sunrise-video',
      name: 'Sunrise Meditation',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      loop: true,
      description: 'Peaceful sunrise scenes'
    }
  },
  
  'breath-awareness': {
    id: 'breath-awareness',
    name: 'Breath Awareness',
    audioSources: [
      {
        id: 'breathing-guide',
        name: 'Breathing Guide',
        url: 'https://cdn.freesound.org/previews/316/316847_5123451-lq.mp3',
        volume: 0.7,
        loop: true,
        description: 'Rhythmic breathing guidance'
      },
      {
        id: 'wind-chimes',
        name: 'Wind Chimes',
        url: 'https://cdn.freesound.org/previews/202/202094_3854185-lq.mp3',
        volume: 0.3,
        loop: true,
        description: 'Gentle wind chimes'
      }
    ],
    videoSource: {
      id: 'waves-video',
      name: 'Gentle Waves',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      loop: true,
      description: 'Slow-motion wave patterns'
    }
  },
  
  'stress-relief': {
    id: 'stress-relief',
    name: 'Stress Relief',
    audioSources: [
      {
        id: 'rain-sounds',
        name: 'Gentle Rain',
        url: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav',
        volume: 0.8,
        loop: true,
        description: 'Soft rainfall sounds'
      },
      {
        id: 'calm-music',
        name: 'Calming Music',
        url: 'https://www.soundjay.com/misc/sounds/bell-ringing-04.wav',
        volume: 0.5,
        loop: true,
        description: 'Peaceful instrumental music'
      }
    ],
    videoSource: {
      id: 'rain-video',
      name: 'Rainfall Scene',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      loop: true,
      description: 'Peaceful rain on nature'
    }
  },
  
  'forest-sounds': {
    id: 'forest-sounds',
    name: 'Forest Sanctuary',
    audioSources: [
      {
        id: 'forest-ambience',
        name: 'Forest Ambience',
        url: 'https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand60.wav',
        volume: 0.9,
        loop: true,
        description: 'Rich forest atmosphere'
      },
      {
        id: 'creek-sounds',
        name: 'Flowing Creek',
        url: 'https://www.soundjay.com/misc/sounds/bell-ringing-06.wav',
        volume: 0.6,
        loop: true,
        description: 'Gentle creek flowing'
      }
    ],
    videoSource: {
      id: 'forest-video',
      name: 'Forest Canopy',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      loop: true,
      description: 'Peaceful forest scenes'
    }
  },
  
  'evening-wind-down': {
    id: 'evening-wind-down',
    name: 'Evening Wind Down',
    audioSources: [
      {
        id: 'evening-breeze',
        name: 'Evening Breeze',
        url: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars3.wav',
        volume: 0.7,
        loop: true,
        description: 'Gentle evening wind'
      },
      {
        id: 'night-sounds',
        name: 'Night Sounds',
        url: 'https://www.soundjay.com/misc/sounds/bell-ringing-07.wav',
        volume: 0.4,
        loop: true,
        description: 'Peaceful night ambience'
      }
    ],
    videoSource: {
      id: 'sunset-video',
      name: 'Sunset Colors',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      loop: true,
      description: 'Beautiful sunset scenes'
    }
  },
  
  'ocean-waves': {
    id: 'ocean-waves',
    name: 'Ocean Meditation',
    audioSources: [
      {
        id: 'ocean-waves',
        name: 'Ocean Waves',
        url: 'https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand3.wav',
        volume: 0.8,
        loop: true,
        description: 'Rhythmic ocean waves'
      },
      {
        id: 'seagulls',
        name: 'Distant Seagulls',
        url: 'https://www.soundjay.com/misc/sounds/bell-ringing-08.wav',
        volume: 0.3,
        loop: true,
        description: 'Gentle seagull calls'
      }
    ],
    videoSource: {
      id: 'ocean-video',
      name: 'Ocean Underwater',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      loop: true,
      description: 'Peaceful ocean scenes'
    }
  },
  
  'mountain-meditation': {
    id: 'mountain-meditation',
    name: 'Mountain Peak',
    audioSources: [
      {
        id: 'mountain-wind',
        name: 'Mountain Wind',
        url: 'https://www2.cs.uic.edu/~i101/SoundFiles/PinkPanther60.wav',
        volume: 0.8,
        loop: true,
        description: 'High altitude wind sounds'
      },
      {
        id: 'tibetan-bowls',
        name: 'Tibetan Bowls',
        url: 'https://www.soundjay.com/misc/sounds/bell-ringing-09.wav',
        volume: 0.6,
        loop: true,
        description: 'Sacred singing bowls'
      }
    ],
    videoSource: {
      id: 'mountain-video',
      name: 'Mountain Vista',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      loop: true,
      description: 'Majestic mountain landscapes'
    }
  },
  
  'gratitude-practice': {
    id: 'gratitude-practice',
    name: 'Gratitude Practice',
    audioSources: [
      {
        id: 'gentle-bells',
        name: 'Gentle Bells',
        url: 'https://www.soundjay.com/misc/sounds/bell-ringing-10.wav',
        volume: 0.4,
        loop: true,
        description: 'Soft meditation bells'
      },
      {
        id: 'warm-tones',
        name: 'Warm Tones',
        url: 'https://www2.cs.uic.edu/~i101/SoundFiles/taunt.wav',
        volume: 0.6,
        loop: true,
        description: 'Warm, grateful melodies'
      }
    ],
    videoSource: {
      id: 'golden-light-video',
      name: 'Golden Light',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      loop: true,
      description: 'Warm, golden lighting'
    }
  }
};

// Alternative high-quality sources (if main sources don't work)
export const BACKUP_AUDIO_SOURCES = {
  nature: 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav',
  bell: 'https://www.soundjay.com/misc/sounds/bell-ringing-01.wav',
  music: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav'
};

export const BACKUP_VIDEO_SOURCES = {
  nature: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  abstract: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  peaceful: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
};
