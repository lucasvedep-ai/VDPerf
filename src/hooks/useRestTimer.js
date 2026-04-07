import { useState, useEffect, useRef, useCallback } from 'react';

export function useRestTimer() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const timeLeftRef = useRef(0);

  const start = useCallback((seconds) => {
    setTotalTime(seconds);
    setTimeLeft(seconds);
    timeLeftRef.current = seconds;
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(0);
  }, []);

  const addTime = useCallback((seconds) => {
    setTimeLeft(prev => prev + seconds);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  return { timeLeft, isRunning, totalTime, start, stop, addTime };
}
