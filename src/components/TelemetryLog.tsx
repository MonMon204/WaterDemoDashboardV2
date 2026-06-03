import { useRef, useEffect } from 'react';
import type { LogEntry } from '../hooks/useTelemetry';

interface TelemetryLogProps {
  logs: LogEntry[];
}

export default function TelemetryLog({ logs }: TelemetryLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="mare-panel p-3 flex flex-col gap-2" style={{ minHeight: '100px' }}>
      <h3
        className="font-heading text-xs font-bold tracking-[0.2em] uppercase flex-shrink-0"
        style={{ color: 'var(--accent-cyan)' }}
      >
        Telemetry Log
      </h3>
      <div
        ref={scrollRef}
        className="overflow-y-auto scroll-thin font-mono-data text-[10px] leading-relaxed"
        style={{ height: '120px' }}
      >
        {logs.length === 0 && (
          <div className="opacity-40 italic" style={{ color: 'var(--text-secondary)' }}>
            [System ready] Awaiting telemetry...
          </div>
        )}
        {logs.map((log, i) => (
          <div key={i} className="py-px">
            <span style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>[{log.timestamp}] </span>
            <span
              style={{
                color: log.type === 'ok' ? 'var(--status-green)' : log.type === 'err' ? 'var(--status-red)' : 'var(--accent-cyan)',
              }}
            >
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
