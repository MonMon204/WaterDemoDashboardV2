import { useState } from 'react';
import type { PumpData, ValveData } from '../hooks/useTelemetry';

interface NodeRegistryProps {
  pumps: PumpData;
  valves: ValveData;
}

interface TooltipData {
  x: number;
  y: number;
  label: string;
  status: string;
}

function StatusDot({ status }: { status?: string }) {
  const color =
    status === 'OPEN'
      ? 'var(--status-green)'
      : status === 'CLOSED'
      ? 'var(--status-red)'
      : 'var(--status-amber)';
  return (
    <div
      className="w-2 h-2 rounded-full flex-shrink-0"
      style={{ background: color, boxShadow: `0 0 5px ${color}` }}
    />
  );
}

export default function NodeRegistry({ pumps, valves }: NodeRegistryProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const handleMouseEnter = (e: React.MouseEvent, label: string, status?: string) => {
    setTooltip({ x: e.clientX, y: e.clientY, label, status: status || 'UNKNOWN' });
  };
  const handleMouseLeave = () => setTooltip(null);

  const pumpEntries = [
    { key: 'A', label: 'PUMP A', status: pumps.pumpA },
    { key: 'B', label: 'PUMP B', status: pumps.pumpB },
    { key: 'C', label: 'PUMP C', status: pumps.pumpC },
  ];

  const valveEntries = Array.from({ length: 8 }, (_, i) => ({
    key: `${i + 1}`,
    label: i === 7 ? 'CV8' : `XV${i + 1}`,
    status: valves[`valve${i + 1}`],
  }));

  return (
    <>
      <div className="mare-panel p-3 flex flex-col gap-2">
        <h3
          className="font-heading text-xs font-bold tracking-[0.2em] uppercase"
          style={{ color: 'var(--accent-cyan)' }}
        >
          Node Registry
        </h3>

        {/* Pumps */}
        <div>
          <span className="text-[9px] tracking-wider uppercase opacity-50 block mb-1" style={{ color: 'var(--text-secondary)' }}>
            Pumps
          </span>
          <div className="flex flex-col gap-0.5">
            {pumpEntries.map((p) => (
              <div
                key={p.key}
                className="flex items-center gap-2 px-2 py-1 rounded-md cursor-default"
                style={{ background: 'rgba(3,83,164,0.2)' }}
                onMouseEnter={(e) => handleMouseEnter(e, p.label, p.status)}
                onMouseLeave={handleMouseLeave}
              >
                <StatusDot status={p.status} />
                <span className="text-xs flex-1" style={{ color: 'var(--text-primary)' }}>{p.label}</span>
                <span
                  className="text-[10px] font-mono-data uppercase"
                  style={{
                    color: p.status === 'OPEN' ? 'var(--status-green)' : p.status === 'CLOSED' ? 'var(--status-red)' : 'var(--status-amber)',
                  }}
                >
                  {p.status || '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Valves — 2-column grid */}
        <div>
          <span className="text-[9px] tracking-wider uppercase opacity-50 block mb-1" style={{ color: 'var(--text-secondary)' }}>
            Valves
          </span>
          <div className="grid grid-cols-2 gap-1">
            {valveEntries.map((v) => (
              <div
                key={v.key}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md cursor-default"
                style={{ background: 'rgba(3,83,164,0.2)' }}
                onMouseEnter={(e) => handleMouseEnter(e, v.label, v.status)}
                onMouseLeave={handleMouseLeave}
              >
                <StatusDot status={v.status} />
                <span className="text-[10px] flex-1" style={{ color: 'var(--text-primary)' }}>{v.label}</span>
                <span
                  className="text-[9px] font-mono-data"
                  style={{
                    color: v.status === 'OPEN' ? 'var(--status-green)' : v.status === 'CLOSED' ? 'var(--status-red)' : 'var(--status-amber)',
                  }}
                >
                  {v.status ? (v.status === 'OPEN' ? '●' : '○') : '?'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-3 py-2 rounded-md text-xs font-mono-data"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 8,
            background: 'rgba(0, 24, 69, 0.95)',
            border: '1px solid rgba(0, 180, 216, 0.3)',
            color: 'var(--text-primary)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ color: 'var(--accent-cyan)' }}>{tooltip.label}</div>
          <div
            style={{
              color: tooltip.status === 'OPEN' ? 'var(--status-green)' : tooltip.status === 'CLOSED' ? 'var(--status-red)' : 'var(--status-amber)',
            }}
          >
            {tooltip.status}
          </div>
        </div>
      )}
    </>
  );
}
