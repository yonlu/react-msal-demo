import { useState, useEffect } from 'react';

const useCountdownTimer = (expirationTime) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const timeLeftMillis = expirationTime ? expirationTime.getTime() - now.getTime() : 0;

      if (timeLeftMillis <= 0) {
        setTimeLeft('00:00:00');
        return;
      }

      const hours = Math.floor(timeLeftMillis / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeftMillis % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeftMillis % (1000 * 60)) / 1000);

      const formattedTime = [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
      ].join(':');

      setTimeLeft(formattedTime);
    };

    const timer = setInterval(updateCountdown, 1000);
    updateCountdown(); // Initial update

    return () => clearInterval(timer);
  }, [expirationTime]);

  return timeLeft;
};

export default useCountdownTimer;
