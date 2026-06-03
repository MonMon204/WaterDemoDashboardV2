import { useState } from 'react';

interface ControlPanelProps {
  rainEnabled: boolean;
  onToggleRain: () => void;
  connected: boolean;
  onToggleConnection: () => void;
  mode: string;
}

export default function ControlPanel({
  rainEnabled,
  onToggleRain,
  connected,
  onToggleConnection,
  mode,
}: ControlPanelProps) {
  const [gridEnabled, setGridEnabled] = useState(false);

  return (
    <div className="mare-panel p-4 flex flex-col gap-3">
      <h3
        className="font-heading text-xs font-bold tracking-[0.2em] uppercase"
        style={{ color: 'var(--accent-cyan)' }}
      >
        Controls
      </h3>

      {/* MQTT Connect */}
      <div
        className="flex items-center justify-between p-2.5 rounded-lg"
        style={{
          background: 'rgba(0, 24, 69, 0.5)',
          border: '1px solid rgba(0, 180, 216, 0.15)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: connected ? 'var(--status-green)' : 'var(--status-red)',
              boxShadow: connected
                ? '0 0 6px var(--status-green)'
                : '0 0 6px var(--status-red)',
            }}
          />
          <span
            className="text-[10px] font-body tracking-wider"
            style={{ color: 'var(--text-secondary)', opacity: 0.6 }}
          >
            {connected ? 'Connected' : 'Disconnected'} — broker.hivemq.com
          </span>
        </div>
        <button
          onClick={onToggleConnection}
          className="px-3 py-1.5 rounded text-[10px] font-bold font-mono-data tracking-wider transition-all hover:opacity-80"
          style={{
            border: `1px solid ${connected ? 'var(--status-red)' : 'var(--accent-cyan)'}`,
            color: connected ? 'var(--status-red)' : 'var(--accent-cyan)',
            background: connected
              ? 'rgba(231, 29, 54, 0.1)'
              : 'rgba(0, 180, 216, 0.1)',
          }}
        >
          {connected ? 'DISCONNECT' : 'CONNECT'}
        </button>
      </div>

      {/* Rain Simulation Toggle */}
      <div
        className="flex items-center justify-between p-2.5 rounded-lg"
        style={{
          background: 'rgba(0, 24, 69, 0.5)',
          border: '1px solid rgba(0, 180, 216, 0.15)',
        }}
      >
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <line x1="4" y1="2" x2="4" y2="8" stroke="#00B4D8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="8" y1="2" x2="8" y2="8" stroke="#00B4D8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="12" y1="2" x2="12" y2="8" stroke="#00B4D8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="2" y1="5" x2="2" y2="11" stroke="#90E0EF" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            <line x1="6" y1="5" x2="6" y2="11" stroke="#90E0EF" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            <line x1="10" y1="5" x2="10" y2="11" stroke="#90E0EF" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            <line x1="14" y1="5" x2="14" y2="11" stroke="#90E0EF" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          </svg>
          <span
            className="text-[10px] font-body tracking-wider"
            style={{ color: 'var(--text-secondary)', opacity: 0.6 }}
          >
            Rain Simulation
          </span>
        </div>
        <button
          onClick={onToggleRain}
          className="px-3 py-1.5 rounded text-[10px] font-bold font-mono-data tracking-wider transition-all hover:opacity-80"
          style={{
            border: `1px solid ${rainEnabled ? 'var(--accent-cyan)' : 'rgba(144, 224, 239, 0.2)'}`,
            color: rainEnabled ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            background: rainEnabled
              ? 'rgba(0, 180, 216, 0.15)'
              : 'rgba(144, 224, 239, 0.05)',
            opacity: rainEnabled ? 1 : 0.5,
          }}
        >
          {rainEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Grid Overlay Toggle */}
      <div
        className="flex items-center justify-between p-2.5 rounded-lg"
        style={{
          background: 'rgba(0, 24, 69, 0.5)',
          border: '1px solid rgba(0, 180, 216, 0.15)',
        }}
      >
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" stroke="#00B4D8" strokeWidth="1" fill="none" />
            <rect x="9" y="2" width="5" height="5" stroke="#00B4D8" strokeWidth="1" fill="none" />
            <rect x="2" y="9" width="5" height="5" stroke="#00B4D8" strokeWidth="1" fill="none" />
            <rect x="9" y="9" width="5" height="5" stroke="#00B4D8" strokeWidth="1" fill="none" />
          </svg>
          <span
            className="text-[10px] font-body tracking-wider"
            style={{ color: 'var(--text-secondary)', opacity: 0.6 }}
          >
            Grid Overlay
          </span>
        </div>
        <button
          onClick={() => setGridEnabled(!gridEnabled)}
          className="px-3 py-1.5 rounded text-[10px] font-bold font-mono-data tracking-wider transition-all hover:opacity-80"
          style={{
            border: `1px solid ${gridEnabled ? 'var(--accent-cyan)' : 'rgba(144, 224, 239, 0.2)'}`,
            color: gridEnabled ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            background: gridEnabled
              ? 'rgba(0, 180, 216, 0.15)'
              : 'rgba(144, 224, 239, 0.05)',
            opacity: gridEnabled ? 1 : 0.5,
          }}
        >
          {gridEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Mode indicator */}
      <div
        className="flex items-center justify-between p-2.5 rounded-lg"
        style={{
          background: 'rgba(0, 24, 69, 0.5)',
          border: '1px solid rgba(0, 180, 216, 0.15)',
        }}
      >
        <span
          className="text-[10px] font-body tracking-wider"
          style={{ color: 'var(--text-secondary)', opacity: 0.6 }}
        >
          Access Mode
        </span>
        <span
          className="text-[10px] font-bold font-mono-data tracking-wider px-2 py-0.5 rounded-full"
          style={{
            color: mode === 'operator' ? 'var(--status-green)' : 'var(--status-amber)',
            background:
              mode === 'operator'
                ? 'rgba(46, 196, 182, 0.15)'
                : 'rgba(255, 159, 28, 0.15)',
            border: `1px solid ${
              mode === 'operator'
                ? 'rgba(46, 196, 182, 0.3)'
                : 'rgba(255, 159, 28, 0.3)'
            }`,
          }}
        >
          {mode === 'operator' ? 'FULL CONTROL' : 'VIEW ONLY'}
        </span>
      </div>
    </div>
  );
}
