'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface Track {
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

interface AudioPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  seek: (value: number) => void;
  setVolume: (value: number) => void;
  closePlayer: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    
    const audio = audioRef.current;
    
    const updateProgress = () => setProgress(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  const playTrack = (track: Track) => {
    if (!audioRef.current) return;
    
    // If playing same track, just toggle
    if (currentTrack?.id === track.id) {
      togglePlay();
      return;
    }

    setCurrentTrack(track);
    audioRef.current.src = track.url;
    audioRef.current.play().then(() => {
      setIsPlaying(true);
    }).catch(e => console.error("Playback failed", e));
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Playback failed", e));
    }
    setIsPlaying(!isPlaying);
  };

  const seek = (value: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value;
    setProgress(value);
  };

  const setVolume = (value: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = value;
    setVolumeState(value);
  };

  const closePlayer = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setCurrentTrack(null);
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <AudioPlayerContext.Provider value={{
      currentTrack,
      isPlaying,
      progress,
      duration,
      volume,
      playTrack,
      togglePlay,
      seek,
      setVolume,
      closePlayer
    }}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
}
