import React, { useState, useEffect, useRef } from 'react';
// Removed unused Radix Slider import – using native range inputs
import { Play, Pause } from 'lucide-react';

/**
 * Simple TimeMachine component for NARVEX map.
 * Props:
 *   start: ISO string earliest date.
 *   end:   ISO string latest date.
 *   onChange: ({ startDate, endDate }) => void
 */
export function TimeMachine({ start = '2023-01-01', end = new Date().toISOString().split('T')[0], onChange }) {
  const [range, setRange] = useState([0, 100]); // percentage of timeline
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef(null);

  const toDate = (pct) => {
    const startDate = new Date(start).getTime();
    const endDate = new Date(end).getTime();
    const ts = startDate + ((endDate - startDate) * pct) / 100;
    return new Date(ts);
  };

  const notify = () => {
    const startDate = toDate(range[0]).toISOString().split('T')[0];
    const endDate = toDate(range[1]).toISOString().split('T')[0];
    onChange && onChange({ startDate, endDate });
  };

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setRange((prev) => {
          const newStart = Math.min(prev[0] + speed, 100);
          const newEnd = Math.min(prev[1] + speed, 100);
          if (newEnd >= 100) {
            clearInterval(intervalRef.current);
            setPlaying(false);
          }
          return [newStart, newEnd];
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, speed]);

  useEffect(() => {
    notify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  return (
    <div className="flex flex-col items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          type="button"
          onClick={() => setSpeed((s) => (s === 1 ? 2 : s === 2 ? 4 : 1))}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Toggle speed 1x/2x/4x"
        >
          {speed}x
        </button>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {toDate(range[0]).toLocaleDateString()} – {toDate(range[1]).toLocaleDateString()}
        </span>
      </div>
      {/* Simple range sliders for start and end */}
      <input
        type="range"
        min="0"
        max="100"
        value={range[0]}
        onChange={(e) => setRange([Number(e.target.value), range[1]])}
        className="w-48"
      />
      <input
        type="range"
        min="0"
        max="100"
        value={range[1]}
        onChange={(e) => setRange([range[0], Number(e.target.value)])}
        className="w-48"
      />
    </div>
  );
}
