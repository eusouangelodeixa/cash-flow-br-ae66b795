import { useState, useEffect, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  format?: (n: number) => string;
  duration?: number;
}

const AnimatedNumber = ({ value, className = '', prefix = '', suffix = '', format, duration = 600 }: AnimatedNumberProps) => {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = from + (to - from) * eased;
      setDisplay(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
    prevRef.current = value;
  }, [value, duration]);

  const formatted = format ? format(Math.round(display)) : Math.round(display).toLocaleString('pt-BR');

  return (
    <span className={`font-mono ${className}`}>
      {prefix}{formatted}{suffix}
    </span>
  );
};

export default AnimatedNumber;
