import { useClock } from '../hooks/useClock';

interface HeaderBarProps {
  connected: boolean;
}

export default function HeaderBar({ connected }: HeaderBarProps) {
  const clock = useClock();

  return (
    <header className="mare-panel flex items-center justify-between px-4 py-2.5 z-10 relative">
      <div className="flex items-center gap-2">
        <div className="relative">
          <span
            className="font-heading text-base font-bold tracking-wider"
            style={{ color: 'var(--accent-cyan)', fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Water Demo Plant
          </span>
          <div
            className="absolute -right-3 -top-1 w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: 'var(--accent-cyan)' }}
          />
        </div>
        <span
          className="hidden sm:inline text-[10px] tracking-widest uppercase opacity-40"
          style={{ color: 'var(--text-secondary)' }}
        >
          SCADA Dashboard
        </span>
      </div>

      <div
        className="font-mono-data text-xs tracking-wide hidden sm:block"
        style={{ color: 'var(--text-primary)', opacity: 0.7 }}
      >
        {clock}
      </div>

      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${connected ? 'animate-pulse' : ''}`}
          style={{
            background: connected ? 'var(--status-green)' : 'var(--status-red)',
          }}
        />
        <span
          className="text-xs tracking-wider uppercase"
          style={{
            color: connected ? 'var(--status-green)' : 'var(--status-red)',
          }}
        >
          {connected ? 'Online' : 'Offline'}
        </span>
      </div>
    </header>
  );
}
