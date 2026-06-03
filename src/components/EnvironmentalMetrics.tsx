import { useMemo } from 'react';
import type { SensorData } from '../hooks/useTelemetry';

interface EnvironmentalMetricsProps {
  sensors: SensorData;
  upPct: number;
  downPct: number;
  sensorFaults: string[];
}

function MiniSparkline({ value, color }: { value: number; color: string }) {
  const points = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i < 20; i++) {
      pts.push(value + (Math.random() - 0.5) * value * 0.1);
    }
    return pts;
  }, [value]);

  const max = Math.max(...points, 0.01);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const w = 60;
  const h = 20;

  const d = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-60 flex-shrink-0">
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function SensorCard({
  label,
  value,
  unit,
  color,
  isFault,
}: {
  label: string;
  value: number | undefined;
  unit: string;
  color: string;
  isFault?: boolean;
}) {
  const displayValue = value !== undefined ? value.toFixed(2) : '—';

  return (
    <div
      className={`p-2.5 rounded-lg transition-all`}
      style={{
        background: isFault ? 'rgba(231, 29, 54, 0.08)' : 'rgba(3, 83, 164, 0.4)',
        border: `1px solid ${isFault ? 'rgba(231, 29, 54, 0.3)' : 'rgba(0, 180, 216, 0.1)'}`,
      }}
    >
      <div className="text-[9px] tracking-wider uppercase mb-1" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
        {label}
      </div>
      <div className="flex items-end justify-between gap-1">
        <div className="min-w-0">
          <span className="font-mono-data text-base font-bold" style={{ color: isFault ? 'var(--status-red)' : color }}>
            {displayValue}
          </span>
          <span className="text-[9px] ml-1" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
            {unit}
          </span>
        </div>
        {!isFault && value !== undefined && <MiniSparkline value={value} color={color} />}
      </div>
      {isFault && (
        <div className="text-[9px] mt-1 font-mono-data" style={{ color: 'var(--status-red)' }}>
          ⚠ SENSOR FAULT
        </div>
      )}
    </div>
  );
}

function TankGauge({ label, pct, maxLabel, isUp }: { label: string; pct: number; maxLabel: string; isUp: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      <div
        className="relative rounded-md overflow-hidden"
        style={{
          width: isUp ? '44px' : '62px',
          height: isUp ? '90px' : '62px',
          border: '2px solid var(--accent-cyan)',
          background: 'rgba(0, 24, 69, 0.6)',
        }}
      >
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out"
          style={{
            height: `${pct}%`,
            background: 'linear-gradient(to top, rgba(0, 180, 216, 0.5), rgba(144, 224, 239, 0.2))',
            borderTop: '1px solid var(--accent-teal)',
          }}
        />
      </div>
      <div className="font-mono-data text-xs font-bold" style={{ color: 'var(--accent-cyan)' }}>
        {pct.toFixed(1)}%
      </div>
      <div className="text-[9px] tracking-wider uppercase text-center" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
        {label}<br />{maxLabel}
      </div>
    </div>
  );
}

export default function EnvironmentalMetrics({ sensors, upPct, downPct, sensorFaults }: EnvironmentalMetricsProps) {
  return (
    <div className="mare-panel p-3 flex flex-col gap-3">
      <h3 className="font-heading text-xs font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--accent-cyan)' }}>
        Tank Levels
      </h3>

      <div className="flex gap-4 justify-center py-1">
        <TankGauge label="DownTank" pct={downPct} maxLabel="(max 22cm)" isUp={false} />
        <TankGauge label="UpTank" pct={upPct} maxLabel="(max 32cm)" isUp={true} />
      </div>

      <div className="text-[9px] tracking-wider uppercase" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
        Flow & Pressure
      </div>

      {/* All 6 sensors in a 2-col grid */}
      <div className="grid grid-cols-2 gap-2">
        <SensorCard label="Flow 1" value={sensors.flow1} unit="m³/h" color="var(--accent-cyan)" isFault={sensorFaults.includes('flow1')} />
        <SensorCard label="Flow 2" value={sensorFaults.includes('flow2') ? undefined : sensors.flow2} unit="m³/h" color="var(--accent-cyan)" isFault={sensorFaults.includes('flow2')} />
        <SensorCard label="Pressure 1" value={sensors.pressure1} unit="bar" color="var(--accent-teal)" isFault={sensorFaults.includes('pressure1')} />
        <SensorCard label="Pressure 2" value={sensorFaults.includes('pressure2') ? undefined : sensors.pressure2} unit="bar" color="var(--accent-teal)" isFault={sensorFaults.includes('pressure2')} />
        <SensorCard label="Level Top" value={sensorFaults.includes('levelTop') ? undefined : sensors.levelTop} unit="cm" color="var(--status-green)" isFault={sensorFaults.includes('levelTop')} />
        <SensorCard label="Level Bot" value={sensorFaults.includes('levelBottom') ? undefined : sensors.levelBottom} unit="cm" color="var(--status-green)" isFault={sensorFaults.includes('levelBottom')} />
      </div>
    </div>
  );
}
