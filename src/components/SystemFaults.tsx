import { useCallback } from 'react';

interface FaultInfo {
  badge: string;
  name: string;
  action: string;
  state: 'normal' | 'active' | 'uncertain';
}

interface SystemFaultsProps {
  faultInfo: FaultInfo;
  ftcModeOn: boolean;
  onFtcToggle: (checked: boolean) => void;
  onResetFTC: () => void;
  mode: string;
}

export default function SystemFaults({
  faultInfo,
  ftcModeOn,
  onFtcToggle,
  onResetFTC,
  mode,
}: SystemFaultsProps) {
  const handleFtcChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFtcToggle(e.target.checked);
    },
    [onFtcToggle]
  );

  const isNormal = faultInfo.state === 'normal';
  const isActive = faultInfo.state === 'active';

  const dotColor = isNormal
    ? 'var(--status-green)'
    : isActive
    ? 'var(--status-red)'
    : 'var(--status-amber)';
  const dotGlow = isNormal
    ? '0 0 8px var(--status-green)'
    : isActive
    ? '0 0 8px var(--status-red)'
    : '0 0 8px var(--status-amber)';
  const badgeColor = isNormal
    ? 'var(--status-green)'
    : isActive
    ? 'var(--status-red)'
    : 'var(--status-amber)';

  return (
    <div className="mare-panel p-4 flex flex-col gap-3">
      <h3
        className="font-heading text-xs font-bold tracking-[0.2em] uppercase"
        style={{ color: 'var(--accent-cyan)' }}
      >
        Fault Status
      </h3>

      <div
        className="flex items-center gap-3 p-3 rounded-lg transition-all"
        style={{
          background: isNormal
            ? 'rgba(46, 196, 182, 0.06)'
            : isActive
            ? 'rgba(231, 29, 54, 0.06)'
            : 'rgba(255, 159, 28, 0.06)',
          border: `1px solid ${
            isNormal
              ? 'rgba(46, 196, 182, 0.2)'
              : isActive
              ? 'rgba(231, 29, 54, 0.25)'
              : 'rgba(255, 159, 28, 0.2)'
          }`,
          animation: isActive ? 'pulse-red 1.5s ease-in-out infinite' : 'none',
        }}
      >
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: dotColor, boxShadow: dotGlow }}
        />
        <div
          className="font-mono-data text-xl font-bold min-w-[28px] text-center"
          style={{ color: badgeColor }}
        >
          {faultInfo.badge}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="font-heading text-xs font-bold tracking-wider"
            style={{ color: badgeColor }}
          >
            {faultInfo.name}
          </div>
          <div
            className="text-[10px] mt-0.5"
            style={{ color: 'var(--text-secondary)', opacity: 0.6 }}
          >
            {faultInfo.action}
          </div>
        </div>
      </div>

      <div
        className="flex items-center gap-3 p-3 rounded-lg"
        style={{
          background: 'rgba(3, 83, 164, 0.3)',
          border: '1px solid rgba(0, 180, 216, 0.1)',
        }}
      >
        <div
          className="text-[10px] font-bold tracking-wider uppercase font-mono-data"
          style={{ color: 'var(--text-secondary)', opacity: 0.6 }}
        >
          FTC MODE
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={ftcModeOn}
            onChange={handleFtcChange}
            disabled={mode === 'guest'}
          />
          <div
            className="w-11 h-6 rounded-full peer transition-all"
            style={{
              background: ftcModeOn
                ? 'rgba(0, 180, 216, 0.3)'
                : 'rgba(144, 224, 239, 0.15)',
              border: `1px solid ${
                ftcModeOn ? 'var(--accent-cyan)' : 'rgba(144, 224, 239, 0.2)'
              }`,
            }}
          >
            <div
              className="absolute top-[2px] left-[2px] w-5 h-5 rounded-full transition-all"
              style={{
                background: ftcModeOn ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                transform: ftcModeOn ? 'translateX(20px)' : 'translateX(0)',
                boxShadow: ftcModeOn ? '0 0 6px var(--accent-cyan)' : 'none',
              }}
            />
          </div>
        </label>

        <div
          className="text-[10px] font-mono-data font-bold flex-1"
          style={{
            color: ftcModeOn ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            opacity: ftcModeOn ? 1 : 0.5,
          }}
        >
          {ftcModeOn
            ? 'ON — Commands routed through Matlab FTC'
            : 'OFF — Direct control (bypasses Matlab)'}
        </div>

        {mode === 'operator' && (
          <button
            onClick={onResetFTC}
            className="px-3 py-1.5 rounded text-[10px] font-bold font-mono-data tracking-wider uppercase transition-all hover:opacity-80 flex-shrink-0"
            style={{
              border: '1px solid var(--status-amber)',
              color: 'var(--status-amber)',
              background: 'rgba(255, 159, 28, 0.1)',
            }}
          >
            ⟳ RESET FTC
          </button>
        )}
      </div>
    </div>
  );
}
