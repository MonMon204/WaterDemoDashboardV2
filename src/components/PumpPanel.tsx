import type { PumpData } from '../hooks/useTelemetry';

interface PumpPanelProps {
  pumps: PumpData;
  mode: string;
  latchedLock: boolean;
  faultCode: number;
  onSendCmd: (topic: string, payload: string) => void;
}

interface PumpConfig {
  key: string;
  label: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  topic: string;
}

const PUMP_CONFIGS: PumpConfig[] = [
  {
    key: 'A',
    label: 'PUMP A',
    badge: 'Cont',
    badgeColor: '#00B4D8',
    badgeBg: 'rgba(0, 180, 216, 0.15)',
    topic: 'water/control/ftc/pumpA',
  },
  {
    key: 'B',
    label: 'PUMP B',
    badge: 'SOFT',
    badgeColor: '#A855F7',
    badgeBg: 'rgba(168, 85, 247, 0.15)',
    topic: 'water/control/ftc/pumpB',
  },
  {
    key: 'C',
    label: 'PUMP C',
    badge: 'VFD',
    badgeColor: '#F97316',
    badgeBg: 'rgba(249, 115, 22, 0.15)',
    topic: 'water/control/ftc/pumpC',
  },
];

function StatusBadge({ status }: { status?: string }) {
  const isOpen = status === 'OPEN';
  const isClosed = status === 'CLOSED';
  return (
    <span
      className="text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full font-mono-data"
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
      {status || 'UNKNOWN'}
    </span>
  );
}

export default function PumpPanel({
  pumps,
  mode,
  latchedLock,
  onSendCmd,
}: PumpPanelProps) {
  const isOperator = mode === 'operator';

  const handleSeqCmd = (cmd: string) => {
    onSendCmd(`water/control/${cmd}`, '1');
  };

  return (
    <div className="mare-panel p-4 flex flex-col gap-3">
      <h3
        className="font-heading text-xs font-bold tracking-[0.2em] uppercase"
        style={{ color: 'var(--accent-cyan)' }}
      >
        Pumps
      </h3>

      <div className="flex flex-col gap-2">
        {PUMP_CONFIGS.map((cfg) => {
          const status = pumps[`pump${cfg.key}` as keyof PumpData];
          return (
            <div
              key={cfg.key}
              className="flex items-center gap-3 p-2.5 rounded-lg transition-all"
              style={{
                background: 'rgba(3, 83, 164, 0.3)',
                border: '1px solid rgba(0, 180, 216, 0.1)',
                opacity: latchedLock ? 0.6 : 1,
              }}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span
                  className="text-[11px] font-bold tracking-wider"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {cfg.label}
                </span>
                <span
                  className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded"
                  style={{
                    color: cfg.badgeColor,
                    background: cfg.badgeBg,
                  }}
                >
                  {cfg.badge}
                </span>
              </div>

              <StatusBadge status={status} />

              {isOperator && (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onSendCmd(cfg.topic, '1')}
                    disabled={latchedLock}
                    className="px-2.5 py-1 rounded text-[10px] font-bold font-mono-data tracking-wider transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      border: '1px solid var(--status-green)',
                      color: 'var(--status-green)',
                      background: 'rgba(46, 196, 182, 0.1)',
                    }}
                  >
                    ON
                  </button>
                  <button
                    onClick={() => onSendCmd(cfg.topic, '0')}
                    disabled={latchedLock}
                    className="px-2.5 py-1 rounded text-[10px] font-bold font-mono-data tracking-wider transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      border: '1px solid var(--status-red)',
                      color: 'var(--status-red)',
                      background: 'rgba(231, 29, 54, 0.1)',
                    }}
                  >
                    OFF
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isOperator && (
        <>
          <div
            className="text-[10px] tracking-wider uppercase mt-1"
            style={{ color: 'var(--text-secondary)', opacity: 0.5 }}
          >
            Sequence Control
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleSeqCmd('startSequence')}
              className="flex-1 px-3 py-2 rounded text-[10px] font-bold font-mono-data tracking-wider transition-all hover:opacity-80"
              style={{
                border: '1px solid var(--status-green)',
                color: 'var(--status-green)',
                background: 'rgba(46, 196, 182, 0.1)',
              }}
            >
              ▶ START SEQ
            </button>
            <button
              onClick={() => handleSeqCmd('stopSequence')}
              className="flex-1 px-3 py-2 rounded text-[10px] font-bold font-mono-data tracking-wider transition-all hover:opacity-80"
              style={{
                border: '1px solid var(--status-amber)',
                color: 'var(--status-amber)',
                background: 'rgba(255, 159, 28, 0.1)',
              }}
            >
              ■ STOP SEQ
            </button>
            <button
              onClick={() => handleSeqCmd('resetSequence')}
              className="flex-1 px-3 py-2 rounded text-[10px] font-bold font-mono-data tracking-wider transition-all hover:opacity-80"
              style={{
                border: '1px solid rgba(202, 240, 248, 0.3)',
                color: 'var(--text-secondary)',
                background: 'rgba(202, 240, 248, 0.05)',
              }}
            >
              ↺ RESET
            </button>
          </div>
        </>
      )}

      {!isOperator && (
        <div
          className="text-[10px] text-center py-2 rounded"
          style={{
            color: 'var(--status-amber)',
            background: 'rgba(255, 159, 28, 0.06)',
            border: '1px solid rgba(255, 159, 28, 0.15)',
          }}
        >
          Command controls are restricted to operators only.
        </div>
      )}
    </div>
  );
}
