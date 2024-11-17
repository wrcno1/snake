"use client";
import { useEffect, useRef } from 'react';

interface GameAudioProps {
  enabled: boolean;
  volume: number;
}

const GameAudio = ({ enabled, volume }: GameAudioProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      // Try to load MP3 first, fallback to OGG
      audioRef.current = new Audio();
      // Add multiple sources for better browser compatibility
      const sources = [
        { src: '/game-music.mp3', type: 'audio/mpeg' },
        { src: '/game-music.ogg', type: 'audio/ogg' }
      ];

      // Find the first supported source
      const supportedSource = sources.find(source => {
        try {
          return audioRef.current?.canPlayType(source.type) !== "";
        } catch {
          return false;
        }
      });

      if (supportedSource) {
        audioRef.current.src = supportedSource.src;
        audioRef.current.loop = true;
        audioRef.current.preload = 'auto';
      } else {
        console.warn('No supported audio format found');
        return;
      }
    }

    audioRef.current.volume = volume;

    const playAudio = async () => {
      try {
        if (enabled && audioRef.current) {
          // Some browsers require user interaction before playing
          await audioRef.current.play();
        }
      } catch (error) {
        console.warn('Audio playback failed:', error);
      }
    };

    if (enabled) {
      playAudio();
    } else if (audioRef.current) {
      audioRef.current.pause();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [enabled, volume]);

  return null;
};

export default GameAudio;