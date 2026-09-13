import React, { useState, useEffect, useMemo } from 'react';
import { parseWebinarTarget, calculateTimeRemaining } from '../utils/dateUtils';

function CountdownUnit({ id, value, label }) {
  const [currentVal, setCurrentVal] = useState(value);
  const [prevVal, setPrevVal] = useState(null);

  useEffect(() => {
    if (value !== currentVal) {
      setPrevVal(currentVal);
      setCurrentVal(value);

      const timer = setTimeout(() => {
        setPrevVal(null);
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [value, currentVal]);

  return (
    <div className="cd-unit">
      <div className="cd-num-wrap">
        {prevVal !== null && (
          <span className="cd-num slide-up-out" aria-hidden="true">
            {prevVal}
          </span>
        )}
        <span
          id={id}
          key={currentVal}
          className={`cd-num ${prevVal !== null ? 'slide-up-in' : 'active'}`}
        >
          {currentVal}
        </span>
      </div>
      <span className="cd-lbl">{label}</span>
    </div>
  );
}

export default function Countdown({ date, time }) {
  // Parse target timestamp synchronously whenever date or time props update
  const targetTimestamp = useMemo(() => parseWebinarTarget(date, time), [date, time]);

  // Maintain local time reference that ticks once per second
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    // Immediately synchronize on mount or when target date changes
    setNow(Date.now());

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTimestamp]);

  // Synchronously compute time breakdown during render so UI is never stale
  const timeLeft = calculateTimeRemaining(targetTimestamp, now);

  return (
    <div className="countdown-minimal anim-scale delay-8">
      <CountdownUnit id="cd-days" value={timeLeft.days} label="Days" />
      <CountdownUnit id="cd-hours" value={timeLeft.hours} label="Hours" />
      <CountdownUnit id="cd-mins" value={timeLeft.mins} label="Minutes" />
      <CountdownUnit id="cd-secs" value={timeLeft.secs} label="Seconds" />
      <div className="cd-glow"></div>
    </div>
  );
}
