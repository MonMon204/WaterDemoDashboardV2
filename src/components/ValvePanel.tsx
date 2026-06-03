import type { ValveData } from '../hooks/useTelemetry';

interface ValvePanelProps {
  valves: ValveData;
  mode: string;
  onSendCmd: (topic: string, payload: string) => void;
}

function ValveIcon({ status }: { status?: string }) {
  const isOpen = status === 'OPEN';
  const isClosed = status === 'CLOSED';
  const color = isOpen ? '#2EC4B6' : isClosed ? '#E71D36' : '#FF9F1C';

  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <rect
        x="4"
        y="13"
        width="24"
        height="6"
        rx="2"
        fill="#023E7D"
        stroke={color}
        strokeWidth="1.2"
      />
      <circle cx="16" cy="16" r="5" fill="#023E7D" stroke={color} strokeWidth="1.2" />
      <rect x="14.5" y="4" width="3" height="7" rx="1" fill={color} />
    </svg>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const isOpen = status === 'OPEN';
  const isClosed = status === 'CLOSED';
  return (
    <span
      className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full font-mono-data"
      style={{
        color: isOpen
          ? 'var(--status-green)'
          : isClosed
          ? 'var(--status-red)'
          : 'var(--status-amber)',
        background: isOpen
          ? 'rgba(46, 196, 182, 0.15)'
          : isClosed
          ? 'rgba(231, 29, 54, 0.15)'
          : 'rgba(255, 159, 28, 0.15)',
        border: `1px solid ${
          isOpen
            ? 'rgba(46, 196, 182, 0.3)'
            : isClosed
            ? 'rgba(231, 29, 54, 0.3)'
            : 'rgba(255, 159, 28, 0.3)'
        }`,
      }}
    >
      {status || '—'}
    </span>
  );
}

export default function ValvePanel({ valves, mode, onSendCmd }: ValvePanelProps) {
  const isOperator = mode === 'operator';

  return (
    <div className="mare-panel p-4 flex flex-col gap-3">
      <h3
        className="font-heading text-xs font-bold tracking-[0.2em] uppercase"
        style={{ color: 'var(--accent-cyan)' }}
      >
        Valves
      </h3>

      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 8 }, (_, i) => {
          const vNum = i + 1;
          const status = valves[`valve${vNum}`];
          const label = vNum === 8 ? 'CV8' : `XV${vNum}`;
          const topic =
            vNum === 7
              ? 'water/control/ftc/valve7'
              : `water/control/valve${vNum}`;

          return (
            <div
              key={vNum}
              className="flex flex-col items-center gap-1.5 p-2 rounded-lg"
              style={{
                background: 'rgba(3, 83, 164, 0.3)',
                border: '1px solid rgba(0, 180, 216, 0.1)',
              }}
            >
              <span
                className="text-[9px] tracking-wider"
                style={{ color: 'var(--text-secondary)', opacity: 0.6 }}
              >
                {label}
              </span>
              <ValveIcon status={status} />
              <StatusBadge status={status} />

              {isOperator && (
                <div className="flex gap-1 mt-0.5">
                  <button
                    onClick={() => onSendCmd(topic, '1')}
                    className="px-1.5 py-0.5 rounded text-[8px] font-bold font-mono-data transition-all hover:opacity-80"
                    style={{
                      border: '1px solid var(--status-green)',
                      color: 'var(--status-green)',
                      background: 'rgba(46, 196, 182, 0.1)',
                    }}
                  >
                    O
                  </button>
                  <button
                    onClick={() => onSendCmd(topic, '0')}
                    className="px-1.5 py-0.5 rounded text-[8px] font-bold font-mono-data transition-all hover:opacity-80"
                    style={{
                      border: '1px solid var(--status-red)',
                      color: 'var(--status-red)',
                      background: 'rgba(231, 29, 54, 0.1)',
                    }}
                  >
                    C
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isOperator && (
        <div
          className="text-[10px] text-center py-2 rounded"
          style={{
            color: 'var(--status-amber)',
            background: 'rgba(255, 159, 28, 0.06)',
            border: '1px solid rgba(255, 159, 28, 0.15)',
          }}
        >
          Valve controls are restricted to operators only.
        </div>
      )}
    </div>
  );
}
