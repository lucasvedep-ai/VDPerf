import { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

export default function AppleMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(240); // 4 minutes

  const songs = [
    { id: 1, title: 'Workout Energy', artist: 'Various Artists', duration: 240 },
    { id: 2, title: 'Power Hour', artist: 'DJ Pump', duration: 300 },
    { id: 3, title: 'Iron Strength', artist: 'Beats Lab', duration: 210 },
  ];

  const [currentSong, setCurrentSong] = useState(0);

  // Timer effect - updates every second when playing
  useEffect(() => {
    let interval;
    if (isPlaying && currentTime < duration) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, duration]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    setCurrentSong((prev) => (prev === 0 ? songs.length - 1 : prev - 1));
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleNext = () => {
    setCurrentSong((prev) => (prev === songs.length - 1 ? 0 : prev + 1));
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const currentDuration = songs[currentSong]?.duration || 240;

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-lg p-6 border border-gray-800 mb-6">
      <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">🎵 Apple Music</h3>

      {/* Album Art */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg h-32 mb-4 flex items-center justify-center">
        <div className="text-5xl">♪</div>
      </div>

      {/* Song Info */}
      <div className="text-center mb-4">
        <div className="font-bold text-white">{songs[currentSong].title}</div>
        <div className="text-sm text-gray-400">{songs[currentSong].artist}</div>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <input
          type="range"
          min="0"
          max={currentDuration}
          value={currentTime}
          onChange={(e) => setCurrentTime(parseInt(e.target.value))}
          className="w-full h-1 bg-gray-700 rounded accent-blue-600 cursor-pointer"
        />
      </div>

      <div className="flex justify-between text-xs text-gray-400 mb-4">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(currentDuration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={handlePrevious}
          className="text-gray-400 hover:text-white transition"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        <button
          onClick={handlePlayPause}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        <button
          onClick={handleNext}
          className="text-gray-400 hover:text-white transition"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-gray-400" />
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(e.target.value)}
          className="flex-1 h-1 bg-gray-700 rounded accent-blue-600 cursor-pointer"
        />
        <span className="text-xs text-gray-400 w-8">{volume}%</span>
      </div>

      {/* Status indicator */}
      {isPlaying && (
        <div className="mt-4 text-center text-xs text-blue-400 font-bold">
          ▶ Lecture en cours...
        </div>
      )}
    </div>
  );
}