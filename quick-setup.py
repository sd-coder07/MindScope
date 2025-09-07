#!/usr/bin/env python3
"""
Quick setup script to create placeholder files for immediate app functionality.
"""

import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent
PUBLIC_DIR = BASE_DIR / "public"
AUDIO_DIR = PUBLIC_DIR / "audio"
VIDEO_DIR = PUBLIC_DIR / "video"

# File structure
MEDITATION_FILES = {
    "morning": {
        "audio": ["gentle-piano.mp3", "nature-sounds.mp3", "bird-chirping.mp3", "acoustic-guitar.mp3"],
        "video": ["sunrise-timelapse.mp4"]
    },
    "breathing": {
        "audio": ["rhythmic-breathing.mp3", "wind-chimes.mp3", "ambient-tones.mp3"],
        "video": ["slow-waves.mp4"]
    },
    "stress": {
        "audio": ["calming-violin.mp3", "soft-rain.mp3", "gentle-harp.mp3"],
        "video": ["rainfall-leaves.mp4"]
    },
    "forest": {
        "audio": ["forest-ambience.mp3", "rustling-leaves.mp3", "bird-calls.mp3", "flowing-creek.mp3"],
        "video": ["forest-canopy.mp4"]
    },
    "evening": {
        "audio": ["soft-classical.mp3", "gentle-wind.mp3", "cricket-chirps.mp3"],
        "video": ["sunset-colors.mp4"]
    },
    "ocean": {
        "audio": ["ocean-waves.mp3", "seagull-calls.mp3", "underwater-bubbles.mp3"],
        "video": ["ocean-underwater.mp4"]
    },
    "mountain": {
        "audio": ["mountain-wind.mp3", "distant-eagles.mp3", "tibetan-bowls.mp3"],
        "video": ["mountain-vista.mp4"]
    },
    "gratitude": {
        "audio": ["acoustic-guitar.mp3", "soft-vocals.mp3", "gentle-bells.mp3"],
        "video": ["golden-light.mp4"]
    }
}

def create_placeholder_files():
    """Create minimal placeholder files to prevent 404 errors."""
    print("🧘‍♀️ Creating placeholder files for MindScope...")
    
    total_created = 0
    
    for category, files in MEDITATION_FILES.items():
        print(f"📂 Setting up {category}...")
        
        # Create audio placeholders
        audio_dir = AUDIO_DIR / category
        audio_dir.mkdir(parents=True, exist_ok=True)
        
        for audio_file in files["audio"]:
            filepath = audio_dir / audio_file
            if not filepath.exists():
                # Create a minimal MP3-like file
                filepath.write_bytes(b'')  # Empty file to prevent 404
                print(f"  🎵 Created: {audio_file}")
                total_created += 1
        
        # Create video placeholders
        video_dir = VIDEO_DIR / category
        video_dir.mkdir(parents=True, exist_ok=True)
        
        for video_file in files["video"]:
            filepath = video_dir / video_file
            if not filepath.exists():
                # Create a minimal MP4-like file
                filepath.write_bytes(b'')  # Empty file to prevent 404
                print(f"  🎬 Created: {video_file}")
                total_created += 1
    
    print(f"\n✅ Created {total_created} placeholder files!")
    print("🚀 Your MindScope app will now work without 404 errors!")
    print("📝 Replace these empty files with actual audio/video content when available.")

if __name__ == "__main__":
    create_placeholder_files()
