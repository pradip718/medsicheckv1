import {useState, useEffect, useRef} from 'react';

function useTimer() {
  const [recordedTime, setRecordedTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedTimeRef = useRef<number>(0);

  const startTimer = (): void => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = Date.now();
    }
  };

  const pauseTimer = (): void => {
    if (isRunning) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      elapsedTimeRef.current = (Date.now() - startTimeRef.current) / 1000;
      setIsRunning(false);
    }
  };

  const resetTimer = (): void => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setRecordedTime(0);
    elapsedTimeRef.current = 0;
    setIsRunning(false);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setRecordedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  return {
    recordedTime,
    startTimer,
    pauseTimer,
    resetTimer,
    isRunning,
  };
}

export default useTimer;
