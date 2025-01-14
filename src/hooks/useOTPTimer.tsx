import {useEffect, useState} from 'react';

const useOTPTimer = () => {
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(59);

  useEffect(() => {
    const interval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }

      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(interval);
        } else {
          setSeconds(59);
          setMinutes(minutes - 1);
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  });

  const resetTimer = () => {
    setMinutes(2);
    setSeconds(59);
  };

  return {minutes, seconds, resetTimer};
};

export default useOTPTimer;
