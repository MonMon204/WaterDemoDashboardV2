import type { UserMode } from '../hooks/useMode';

interface ModeToggleProps {
  mode: UserMode;
  onSetGuest: () => void;
  onRequestOperator: () => void;
}

export default function ModeToggle({ mode, onSetGuest, onRequestOperator }: ModeToggleProps) {
  return (
    <div className="mare-panel p-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-[10px] font-bold tracking-[0.15em] uppercase whitespace-nowrap"
          style={{ color: 'var(--text-secondary)', opacity: 0.6 }}
        >
          Access
        </span>

        <div
          className="flex items-center gap-1 p-1 rounded-full flex-shrink-0"
          style={{
            background: 'rgba(3, 83, 164, 0.5)',
            border: '1px solid rgba(0, 180, 216, 0.2)',
          }}
        >
          <button
            onClick={onSetGuest}
            className="px-3 py-1 rounded-full text-[10px] font-bold font-mono-data tracking-wider transition-all"
            style={{
              background: mode === 'guest' ? 'var(--accent-cyan)' : 'transparent',
              color: mode === 'guest' ? 'var(--bg-base)' : 'var(--text-secondary)',
            }}
          >
            GUEST
          </button>
          <button
            onClick={onRequestOperator}
            className="px-3 py-1 rounded-full text-[10px] font-bold font-mono-data tracking-wider transition-all"
            style={{
              background: mode === 'operator' ? 'var(--accent-cyan)' : 'transparent',
              color: mode === 'operator' ? 'var(--bg-base)' : 'var(--text-secondary)',
            }}
          >
            OPERATOR
          </button>
        </div>

        <span
          className="text-[10px] font-bold font-mono-data tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap ml-auto"
          style={{
            color: mode === 'operator' ? 'var(--status-green)' : 'var(--status-amber)',
            background: mode === 'operator' ? 'rgba(46,196,182,0.12)' : 'rgba(255,159,28,0.12)',
            border: `1px solid ${mode === 'operator' ? 'rgba(46,196,182,0.25)' : 'rgba(255,159,28,0.25)'}`,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: mode === 'operator' ? 'var(--status-green)' : 'var(--status-amber)' }}
          />
          {mode === 'operator' ? 'Full Control' : 'View Only'}
        </span>
      </div>
    </div>
  );
}
