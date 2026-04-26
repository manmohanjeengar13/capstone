'use client';
import { useEffect, useRef, useState } from 'react';
import { cn, gradeToClasses, scoreToHex } from '@/lib/utils';
import type { HealthGrade } from '@/types/report';

interface Props {
  score: number;
  grade: HealthGrade;
  size?: number;
  animated?: boolean;
}

export function HealthScoreGauge({ score, grade, size = 160, animated = true }: Props) {
  const [displayed, setDisplayed] = useState(animated ? 0 : score);
  const animRef = useRef<number | null>(null);

  const strokeWidth = size * 0.07;
  const radius = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Semicircle: starts at 7 o'clock (225°) sweeps 270°
  const startAngle = 225;
  const totalAngle = 270;
  const circumference = (totalAngle / 360) * 2 * Math.PI * radius;

  function polarToXY(angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  }

  function describeArc(startDeg: number, endDeg: number) {
    const s = polarToXY(startDeg);
    const e = polarToXY(endDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const trackPath = describeArc(startAngle, startAngle + totalAngle);
  const fillAngle = (displayed / 100) * totalAngle;
  const fillPath  = fillAngle > 0 ? describeArc(startAngle, startAngle + fillAngle) : '';
  const fillColor = scoreToHex(displayed);

  // Count-up animation
  useEffect(() => {
    if (!animated) return;
    const start = performance.now();
    const duration = 1200;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setDisplayed(Math.round(ease(t) * score));
      if (t < 1) animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [score, animated]);

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        width={size}
        height={size * 0.75}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
        style={{ marginBottom: -(size * 0.25) }}
      >
        {/* Track */}
        <path
          d={trackPath}
          fill="none"
          stroke="hsl(215 20% 16%)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Fill */}
        {fillPath && (
          <path
            d={fillPath}
            fill="none"
            stroke={fillColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 ${strokeWidth * 0.8}px ${fillColor}80)`,
              transition: animated ? 'none' : 'stroke-dashoffset 1s ease',
            }}
          />
        )}
        {/* Score text */}
        <text
          x={cx}
          y={cy + 8}
          textAnchor="middle"
          className="font-bold"
          style={{
            fontSize: size * 0.22,
            fill: fillColor,
            fontFamily: 'var(--font-geist)',
          }}
        >
          {displayed}
        </text>
        {/* /100 */}
        <text
          x={cx}
          y={cy + size * 0.16}
          textAnchor="middle"
          style={{
            fontSize: size * 0.09,
            fill: 'hsl(215 16% 47%)',
            fontFamily: 'var(--font-geist)',
          }}
        >
          / 100
        </text>
      </svg>

      {/* Grade badge */}
      <div
        className={cn(
          'badge text-sm font-bold px-3 py-1',
          gradeToClasses(grade)
        )}
      >
        Grade {grade}
      </div>
    </div>
  );
}
