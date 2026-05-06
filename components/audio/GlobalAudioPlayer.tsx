'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, X } from 'lucide-react';
import { useAudioPlayer } from '../../contexts/AudioPlayerContext';

export function GlobalAudioPlayer() {
  const { 
    currentTrack, 
    isPlaying, 
    progress, 
    duration, 
    volume, 
    togglePlay, 
    seek, 
    setVolume,
    closePlayer 
  } = useAudioPlayer();

  if (!currentTrack) return null;

  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#1e2329] border-t border-[#2d3748] text-gray-200 z-[100] flex items-center px-4 md:px-8 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] dir-ltr">
      
      {/* Track Info */}
      <div className="flex-1 flex items-center gap-4 min-w-0" dir="rtl">
        <div className="w-12 h-12 bg-cyan-900/50 rounded-lg flex items-center justify-center border border-cyan-800 shrink-0">
          <span className="text-cyan-400 font-bold text-xl">🎵</span>
        </div>
        <div className="truncate">
          <h4 className="font-bold text-white text-sm md:text-base truncate">{currentTrack.title}</h4>
          <p className="text-xs text-gray-400 truncate">{currentTrack.subtitle}</p>
        </div>
      </div>

      {/* Controls & Progress */}
      <div className="flex-[2] flex flex-col items-center max-w-2xl px-4">
        <div className="flex items-center gap-6 mb-2">
          <button className="text-gray-400 hover:text-white transition">
            <SkipBack className="w-5 h-5" />
          </button>
          
          <button 
            onClick={togglePlay}
            className="w-10 h-10 bg-cyan-500 hover:bg-cyan-400 rounded-full flex items-center justify-center text-gray-900 transition-transform hover:scale-105 active:scale-95"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
          </button>
          
          <button className="text-gray-400 hover:text-white transition">
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
        
        <div className="w-full flex items-center gap-3 text-xs text-gray-400 font-mono">
          <span>{formatTime(progress)}</span>
          <input 
            type="range" 
            min={0} 
            max={duration || 100} 
            value={progress}
            onChange={(e) => seek(Number(e.target.value))}
            className="flex-1 h-1 bg-gray-600 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Actions / Volume */}
      <div className="flex-1 flex items-center justify-end gap-4">
        <div className="hidden md:flex items-center gap-2 w-32">
          <Volume2 className="w-4 h-4 text-gray-400 shrink-0" />
          <input 
            type="range" 
            min={0} 
            max={1} 
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full h-1 bg-gray-600 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-gray-300 [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
          />
        </div>
        
        <button 
          onClick={closePlayer}
          className="p-2 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded-full transition"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
    </div>
  );
}
