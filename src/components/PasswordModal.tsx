import { useState, useRef, useEffect } from 'react';

interface PasswordModalProps {
  visible: boolean;
  error: string;
  onConfirm: (password: string) => boolean;
  onCancel: () => void;
}

export default function PasswordModal({
  visible,
  error,
  onConfirm,
  onCancel,
}: PasswordModalProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (visible) {
      setInput('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [visible]);

  const handleConfirm = () => {
    onConfirm(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') onCancel();
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      <div
        className="p-6 rounded-xl w-[300px] max-w-[90vw]"
        style={{
          background: 'rgba(2, 62, 125, 0.95)',
          border: '1px solid var(--accent-cyan)',
          boxShadow: '0 0 30px rgba(0, 180, 216, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: 'var(--accent-cyan)',
              boxShadow: '0 0 6px var(--accent-cyan)',
            }}
          />
          <span
            className="font-heading text-xs font-bold tracking-[0.15em] uppercase"
            style={{ color: 'var(--accent-cyan)' }}
          >
            OPERATOR ACCESS
          </span>
        </div>

        <div
          className="text-[10px] mb-4"
          style={{ color: 'var(--text-secondary)', opacity: 0.6 }}
        >
          ENTER PASSWORD TO CONTINUE
        </div>

        <input
          ref={inputRef}
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="••••••••"
          className="w-full px-3 py-2.5 rounded-md text-sm font-mono-data tracking-widest mb-1.5 outline-none transition-all"
          style={{
            background: 'var(--bg-base)',
            border: `1px solid ${error ? 'var(--status-red)' : 'rgba(0, 180, 216, 0.2)'}`,
            color: 'var(--text-primary)',
          }}
          onFocus={(e) => {
            if (!error) e.target.style.borderColor = 'var(--accent-cyan)';
          }}
          onBlur={(e) => {
            if (!error) e.target.style.borderColor = 'rgba(0, 180, 216, 0.2)';
          }}
        />

        {error && (
          <div
            className="text-[10px] mb-3 font-mono-data"
            style={{ color: 'var(--status-red)', minHeight: '16px' }}
          >
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            className="flex-1 py-2 rounded-md text-[11px] font-bold font-mono-data tracking-wider transition-all hover:opacity-80"
            style={{
              border: '1px solid var(--status-green)',
              color: 'var(--status-green)',
              background: 'rgba(46, 196, 182, 0.1)',
            }}
          >
            CONFIRM
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-md text-[11px] font-bold font-mono-data tracking-wider transition-all hover:opacity-80"
            style={{
              border: '1px solid rgba(0, 180, 216, 0.2)',
              color: 'var(--text-secondary)',
              background: 'transparent',
            }}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}
