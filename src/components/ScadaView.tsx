import { useState } from 'react';
import type { SensorData, PumpData, ValveData } from '../hooks/useTelemetry';

interface ScadaViewProps {
  sensors: SensorData;
  pumps: PumpData;
  valves: ValveData;
  mode: string;
  onSendCmd: (topic: string, payload: string) => void;
}

export default function ScadaView({ sensors, pumps, valves, mode, onSendCmd }: ScadaViewProps) {
  const [activeTab, setActiveTab] = useState<'schematic' | 'legend' | 'sequence'>('schematic');
  const [tooltip, setTooltip] = useState<{ text: string } | null>(null);

  const isOperator = mode === 'operator';

  const upCm = sensors.levelTop || 0;
  const downCm = sensors.levelBottom || 0;
  const upPct = Math.min(1, upCm / 32);
  const downPct = Math.min(1, downCm / 22);

  const anyPump = pumps.pumpA === 'OPEN' || pumps.pumpB === 'OPEN' || pumps.pumpC === 'OPEN';
  const pipeActive = anyPump ? '#00B4D8' : 'rgba(0, 180, 216, 0.15)';
  const retOn = valves.valve7 === 'OPEN';
  const retPipeColor = retOn ? '#00B4D8' : 'rgba(0, 180, 216, 0.15)';

  const handleValveClick = (num: number) => {
    const status = valves[`valve${num}`];
    if (isOperator) {
      const newState = status === 'OPEN' ? '0' : '1';
      const topic = num === 7 ? 'water/control/ftc/valve7' : `water/control/valve${num}`;
      onSendCmd(topic, newState);
    } else {
      const label = num === 8 ? 'CV8' : `XV${num}`;
      setTooltip({ text: `${label}: ${status || 'UNKNOWN'}` });
      setTimeout(() => setTooltip(null), 2000);
    }
  };

  const handlePumpClick = (p: string) => {
    const status = pumps[`pump${p}` as keyof PumpData];
    if (isOperator) {
      const newState = status === 'OPEN' ? '0' : '1';
      onSendCmd(`water/control/ftc/pump${p}`, newState);
    } else {
      setTooltip({ text: `PUMP ${p}: ${status || 'UNKNOWN'}` });
      setTimeout(() => setTooltip(null), 2000);
    }
  };

  const pumpColor = (p: string) => {
    const s = pumps[`pump${p}` as keyof PumpData];
    return s === 'OPEN' ? '#2EC4B6' : s === 'CLOSED' ? '#E71D36' : '#FF9F1C';
  };

  const valveColor = (v: number) => {
    const s = valves[`valve${v}`];
    return s === 'OPEN' ? '#2EC4B6' : s === 'CLOSED' ? '#E71D36' : '#FF9F1C';
  };

  const pipeDownColor = (p: string) =>
    pumps[`pump${p}` as keyof PumpData] === 'OPEN' ? '#00B4D8' : 'rgba(0, 180, 216, 0.15)';

  const handleSeqCmd = (cmd: string) => onSendCmd(`water/control/${cmd}`, '1');

  const tabs = [
    { id: 'schematic', label: 'SCHEMATIC' },
    { id: 'sequence', label: 'SEQUENCE' },
    { id: 'legend', label: 'LEGEND' },
  ] as const;

  return (
    <div className="mare-panel p-4 flex flex-col gap-3">
      <h3 className="font-heading text-xs font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--accent-cyan)' }}>
        Process View
      </h3>

      {/* Tab Bar */}
      <div className="flex gap-0" style={{ borderBottom: '2px solid rgba(0, 180, 216, 0.15)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-1.5 text-[10px] font-bold tracking-[0.15em] uppercase font-mono-data transition-all cursor-pointer"
            style={{
              color: activeTab === tab.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              opacity: activeTab === tab.id ? 1 : 0.5,
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              marginBottom: '-2px',
              background: 'none',
              border: 'none',
              borderBottomColor: activeTab === tab.id ? 'var(--accent-cyan)' : 'transparent',
              borderBottomWidth: '2px',
              borderBottomStyle: 'solid',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SCHEMATIC TAB */}
      {activeTab === 'schematic' && (
        <div className="overflow-x-auto">
          <svg
            viewBox="0 0 780 460"
            className="w-full"
            style={{ minWidth: '320px', background: '#001845', borderRadius: '6px' }}
          >
            <defs>
              <marker id="arr" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                <polygon points="0 0, 7 3.5, 0 7" fill="#00B4D8" />
              </marker>
              <linearGradient id="fillGradUp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(0, 201, 167, 0.27)" />
                <stop offset="100%" stopColor="rgba(0, 150, 255, 0.6)" />
              </linearGradient>
              <linearGradient id="fillGradDown" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(0, 201, 167, 0.27)" />
                <stop offset="100%" stopColor="rgba(0, 150, 255, 0.6)" />
              </linearGradient>
              <clipPath id="clipUp"><rect x="420" y="39" width="158" height="118" rx="3" /></clipPath>
              <clipPath id="clipDown"><rect x="181" y="221" width="258" height="78" rx="3" /></clipPath>
            </defs>

            <rect width="780" height="460" fill="#001845" rx="8" />
            <text x="14" y="22" fontFamily="Space Grotesk, monospace" fontSize="11" fontWeight="700" fill="#00B4D8" letterSpacing="2">
              WATER DEMO PLANT — PROCESS SCHEMATIC
            </text>

            {/* Upper Tank */}
            <rect x="420" y="38" width="160" height="120" rx="4" fill="rgba(2,62,125,0.5)" stroke="#00B4D8" strokeWidth="2" />
            <rect x="420" y={157 - 116 * upPct} width="158" height={116 * upPct} fill="url(#fillGradUp)" clipPath="url(#clipUp)" />
            <text x="500" y="85" fontFamily="Space Grotesk, monospace" fontSize="11" fontWeight="700" fill="#CAF0F8" textAnchor="middle">UPPER TANK</text>
            <text x="500" y="102" fontFamily="Inter, monospace" fontSize="10" fill="#ADE8F4" opacity="0.6" textAnchor="middle">(max 32 cm)</text>
            <text x="500" y="148" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="700" fill="#00B4D8" textAnchor="middle">
              {upCm ? `${upCm.toFixed(1)} cm` : '— cm'}
            </text>

            {/* Source Tank */}
            <rect x="180" y="220" width="260" height="80" rx="4" fill="rgba(2,62,125,0.5)" stroke="rgba(0,180,216,0.2)" strokeWidth="2" />
            <rect x="181" y={299 - 78 * downPct} width="258" height={78 * downPct} fill="url(#fillGradDown)" clipPath="url(#clipDown)" />
            <text x="310" y="255" fontFamily="Space Grotesk, monospace" fontSize="11" fontWeight="700" fill="#CAF0F8" textAnchor="middle">SOURCE TANK</text>
            <text x="310" y="275" fontFamily="Inter, monospace" fontSize="10" fill="#ADE8F4" opacity="0.6" textAnchor="middle">(max 22 cm)</text>
            <text x="310" y="293" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="700" fill="#00B4D8" textAnchor="middle">
              {downCm ? `${downCm.toFixed(1)} cm` : '— cm'}
            </text>

            {/* Return pipes */}
            <line x1="420" y1="98" x2="300" y2="98" stroke={retPipeColor} strokeWidth="5" strokeLinecap="round" />
            <line x1="300" y1="98" x2="300" y2="210" stroke={retPipeColor} strokeWidth="5" strokeLinecap="round" />
            <line x1="550" y1="190" x2="300" y2="190" stroke={retPipeColor} strokeWidth="3" strokeLinecap="round" />
            <line x1="300" y1="190" x2="300" y2="220" stroke={retPipeColor} strokeWidth="2" strokeLinecap="round" markerEnd="url(#arr)" />

            {/* Pump pipes */}
            <line x1="230" y1="300" x2="230" y2="420" stroke={pipeDownColor('A')} strokeWidth="5" strokeLinecap="round" />
            <line x1="230" y1="420" x2="360" y2="420" stroke={pipeActive} strokeWidth="5" strokeLinecap="round" />
            <line x1="310" y1="300" x2="310" y2="420" stroke={pipeDownColor('B')} strokeWidth="5" strokeLinecap="round" />
            <line x1="390" y1="300" x2="390" y2="420" stroke={pipeDownColor('C')} strokeWidth="5" strokeLinecap="round" />
            <line x1="310" y1="420" x2="390" y2="420" stroke={pipeActive} strokeWidth="5" strokeLinecap="round" />
            <line x1="390" y1="420" x2="550" y2="420" stroke={pipeActive} strokeWidth="5" strokeLinecap="round" />
            <line x1="550" y1="420" x2="550" y2="160" stroke={pipeActive} strokeWidth="5" strokeLinecap="round" />
            <line x1="550" y1="170" x2="550" y2="160" stroke={pipeActive} strokeWidth="2" strokeLinecap="round" markerEnd="url(#arr)" />

            {/* XV7 */}
            <g transform="translate(370, 97)" className={isOperator ? 'cursor-pointer' : ''} onClick={() => handleValveClick(7)}>
              <rect x="-18" y="-14" width="36" height="28" rx="3" fill="transparent" />
              <polygon points="-10,-8 10,-8 0,0" fill={`${valveColor(7)}33`} stroke={valveColor(7)} strokeWidth="1.2" />
              <polygon points="-10,8 10,8 0,0" fill={`${valveColor(7)}33`} stroke={valveColor(7)} strokeWidth="1.2" />
              <line x1="-18" y1="0" x2="-10" y2="0" stroke="#ADE8F4" strokeWidth="1.5" />
              <line x1="10" y1="0" x2="18" y2="0" stroke="#ADE8F4" strokeWidth="1.5" />
              <text x="0" y="-17" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#ADE8F4" textAnchor="middle" opacity="0.7">XV7</text>
            </g>

            {/* CV8 */}
            <g transform="translate(370, 190) rotate(90)" className={isOperator ? 'cursor-pointer' : ''} onClick={() => handleValveClick(8)}>
              <rect x="-14" y="-18" width="28" height="36" rx="3" fill="transparent" />
              <polygon points="-8,-10 8,-10 0,0" fill={`${valveColor(8)}33`} stroke={valveColor(8)} strokeWidth="1.2" />
              <polygon points="-8,10 8,10 0,0" fill={`${valveColor(8)}33`} stroke={valveColor(8)} strokeWidth="1.2" />
              <line x1="0" y1="-18" x2="0" y2="-10" stroke="#ADE8F4" strokeWidth="1.5" />
              <line x1="0" y1="10" x2="0" y2="18" stroke="#ADE8F4" strokeWidth="1.5" />
              <text x="-7" y="-17" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#ADE8F4" opacity="0.7" transform="rotate(-90, -7, -17)">CV8</text>
            </g>

            {/* Pump A */}
            <g transform="translate(230, 356)" className={isOperator ? 'cursor-pointer' : ''} onClick={() => handlePumpClick('A')}>
              <circle cx="0" cy="0" r="14" fill={`${pumpColor('A')}15`} stroke={pumpColor('A')} strokeWidth="1.5" />
              <text x="0" y="4" fontFamily="JetBrains Mono, monospace" fontSize="9" fontWeight="700" fill={pumpColor('A')} textAnchor="middle">A</text>
              <text x="-35" y="3" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#ADE8F4" textAnchor="middle" opacity="0.6">PUMP A</text>
            </g>
            <g transform="translate(230, 318)" className={isOperator ? 'cursor-pointer' : ''} onClick={() => handleValveClick(1)}>
              <polygon points="-8,-8 8,-8 0,0" fill={`${valveColor(1)}33`} stroke={valveColor(1)} strokeWidth="1.2" />
              <polygon points="-8,8 8,8 0,0" fill={`${valveColor(1)}33`} stroke={valveColor(1)} strokeWidth="1.2" />
              <line x1="0" y1="-16" x2="0" y2="-8" stroke="#ADE8F4" strokeWidth="1.5" />
              <line x1="0" y1="8" x2="0" y2="16" stroke="#ADE8F4" strokeWidth="1.5" />
              <text x="14" y="4" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#ADE8F4" opacity="0.7">XV1</text>
            </g>
            <g transform="translate(230, 393)" className={isOperator ? 'cursor-pointer' : ''} onClick={() => handleValveClick(2)}>
              <polygon points="-8,-8 8,-8 0,0" fill={`${valveColor(2)}33`} stroke={valveColor(2)} strokeWidth="1.2" />
              <polygon points="-8,8 8,8 0,0" fill={`${valveColor(2)}33`} stroke={valveColor(2)} strokeWidth="1.2" />
              <line x1="0" y1="-16" x2="0" y2="-8" stroke="#ADE8F4" strokeWidth="1.5" />
              <line x1="0" y1="8" x2="0" y2="16" stroke="#ADE8F4" strokeWidth="1.5" />
              <text x="14" y="4" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#ADE8F4" opacity="0.7">XV2</text>
            </g>

            {/* Pump B */}
            <g transform="translate(310, 356)" className={isOperator ? 'cursor-pointer' : ''} onClick={() => handlePumpClick('B')}>
              <circle cx="0" cy="0" r="16" fill={`${pumpColor('B')}15`} stroke={pumpColor('B')} strokeWidth="1.5" />
              <text x="0" y="4" fontFamily="JetBrains Mono, monospace" fontSize="9" fontWeight="700" fill={pumpColor('B')} textAnchor="middle">B</text>
              <text x="-35" y="3" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#ADE8F4" textAnchor="middle" opacity="0.6">PUMP B</text>
            </g>
            <g transform="translate(310, 318)" className={isOperator ? 'cursor-pointer' : ''} onClick={() => handleValveClick(3)}>
              <polygon points="-8,-8 8,-8 0,0" fill={`${valveColor(3)}33`} stroke={valveColor(3)} strokeWidth="1.2" />
              <polygon points="-8,8 8,8 0,0" fill={`${valveColor(3)}33`} stroke={valveColor(3)} strokeWidth="1.2" />
              <line x1="0" y1="-16" x2="0" y2="-8" stroke="#ADE8F4" strokeWidth="1.5" />
              <line x1="0" y1="8" x2="0" y2="16" stroke="#ADE8F4" strokeWidth="1.5" />
              <text x="14" y="4" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#ADE8F4" opacity="0.7">XV3</text>
            </g>
            <g transform="translate(310, 393)" className={isOperator ? 'cursor-pointer' : ''} onClick={() => handleValveClick(4)}>
              <polygon points="-8,-8 8,-8 0,0" fill={`${valveColor(4)}33`} stroke={valveColor(4)} strokeWidth="1.2" />
              <polygon points="-8,8 8,8 0,0" fill={`${valveColor(4)}33`} stroke={valveColor(4)} strokeWidth="1.2" />
              <line x1="0" y1="-16" x2="0" y2="-8" stroke="#ADE8F4" strokeWidth="1.5" />
              <line x1="0" y1="8" x2="0" y2="16" stroke="#ADE8F4" strokeWidth="1.5" />
              <text x="14" y="4" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#ADE8F4" opacity="0.7">XV4</text>
            </g>

            {/* Pump C */}
            <g transform="translate(390, 356)" className={isOperator ? 'cursor-pointer' : ''} onClick={() => handlePumpClick('C')}>
              <circle cx="0" cy="0" r="16" fill={`${pumpColor('C')}15`} stroke={pumpColor('C')} strokeWidth="1.5" />
              <text x="0" y="4" fontFamily="JetBrains Mono, monospace" fontSize="9" fontWeight="700" fill={pumpColor('C')} textAnchor="middle">C</text>
              <text x="-35" y="3" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#ADE8F4" textAnchor="middle" opacity="0.6">PUMP C</text>
            </g>
            <g transform="translate(390, 318)" className={isOperator ? 'cursor-pointer' : ''} onClick={() => handleValveClick(5)}>
              <polygon points="-8,-8 8,-8 0,0" fill={`${valveColor(5)}33`} stroke={valveColor(5)} strokeWidth="1.2" />
              <polygon points="-8,8 8,8 0,0" fill={`${valveColor(5)}33`} stroke={valveColor(5)} strokeWidth="1.2" />
              <line x1="0" y1="-16" x2="0" y2="-8" stroke="#ADE8F4" strokeWidth="1.5" />
              <line x1="0" y1="8" x2="0" y2="16" stroke="#ADE8F4" strokeWidth="1.5" />
              <text x="14" y="4" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#ADE8F4" opacity="0.7">XV5</text>
            </g>
            <g transform="translate(390, 393)" className={isOperator ? 'cursor-pointer' : ''} onClick={() => handleValveClick(6)}>
              <polygon points="-8,-8 8,-8 0,0" fill={`${valveColor(6)}33`} stroke={valveColor(6)} strokeWidth="1.2" />
              <polygon points="-8,8 8,8 0,0" fill={`${valveColor(6)}33`} stroke={valveColor(6)} strokeWidth="1.2" />
              <line x1="0" y1="-16" x2="0" y2="-8" stroke="#ADE8F4" strokeWidth="1.5" />
              <line x1="0" y1="8" x2="0" y2="16" stroke="#ADE8F4" strokeWidth="1.5" />
              <text x="14" y="4" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#ADE8F4" opacity="0.7">XV6</text>
            </g>

            {/* Sensor Readouts */}
            <rect x="616" y="38" width="148" height="48" rx="4" fill="rgba(0,24,69,0.7)" stroke="rgba(0,180,216,0.15)" strokeWidth="1" />
            <text x="624" y="52" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#ADE8F4" opacity="0.5" letterSpacing="1">LEVEL TX LT2</text>
            <text x="624" y="74" fontFamily="JetBrains Mono, monospace" fontSize="16" fontWeight="700" fill="#00B4D8">
              {sensors.levelTop ? `${sensors.levelTop.toFixed(1)} cm` : '— cm'}
            </text>

            <rect x="616" y="96" width="148" height="48" rx="4" fill="rgba(0,24,69,0.7)" stroke="rgba(0,180,216,0.15)" strokeWidth="1" />
            <text x="624" y="110" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#ADE8F4" opacity="0.5" letterSpacing="1">PRESSURE TX PT2</text>
            <text x="624" y="132" fontFamily="JetBrains Mono, monospace" fontSize="16" fontWeight="700" fill="#00B4D8">
              {sensors.pressure2 ? `${sensors.pressure2.toFixed(1)} bar` : '— bar'}
            </text>

            <rect x="616" y="154" width="148" height="48" rx="4" fill="rgba(0,24,69,0.7)" stroke="rgba(0,180,216,0.15)" strokeWidth="1" />
            <text x="624" y="168" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#ADE8F4" opacity="0.5" letterSpacing="1">FLOW TX FT2</text>
            <text x="624" y="190" fontFamily="JetBrains Mono, monospace" fontSize="16" fontWeight="700" fill="#00B4D8">
              {sensors.flow2 ? `${sensors.flow2.toFixed(1)} m³/h` : '— m³/h'}
            </text>

            <rect x="14" y="220" width="148" height="48" rx="4" fill="rgba(0,24,69,0.7)" stroke="rgba(0,180,216,0.15)" strokeWidth="1" />
            <text x="22" y="234" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#ADE8F4" opacity="0.5" letterSpacing="1">LEVEL TX LT1</text>
            <text x="22" y="256" fontFamily="JetBrains Mono, monospace" fontSize="16" fontWeight="700" fill="#00B4D8">
              {sensors.levelBottom ? `${sensors.levelBottom.toFixed(1)} cm` : '— cm'}
            </text>

            <rect x="616" y="220" width="148" height="48" rx="4" fill="rgba(0,24,69,0.7)" stroke="rgba(0,180,216,0.15)" strokeWidth="1" />
            <text x="624" y="234" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#ADE8F4" opacity="0.5" letterSpacing="1">FLOW TX FT1</text>
            <text x="624" y="256" fontFamily="JetBrains Mono, monospace" fontSize="16" fontWeight="700" fill="#00B4D8">
              {sensors.flow1 ? `${sensors.flow1.toFixed(1)} m³/h` : '— m³/h'}
            </text>

            <rect x="616" y="278" width="148" height="48" rx="4" fill="rgba(0,24,69,0.7)" stroke="rgba(0,180,216,0.15)" strokeWidth="1" />
            <text x="624" y="292" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#ADE8F4" opacity="0.5" letterSpacing="1">PRESSURE TX PT1</text>
            <text x="624" y="314" fontFamily="JetBrains Mono, monospace" fontSize="16" fontWeight="700" fill="#00B4D8">
              {sensors.pressure1 ? `${sensors.pressure1.toFixed(1)} bar` : '— bar'}
            </text>

            {/* Dashed connection lines */}
            <line x1="616" y1="62" x2="580" y2="62" stroke="rgba(0,180,216,0.1)" strokeWidth="1" strokeDasharray="4,3" />
            <line x1="165" y1="250" x2="180" y2="250" stroke="rgba(0,180,216,0.1)" strokeWidth="1" strokeDasharray="4,3" />
            <line x1="616" y1="120" x2="600" y2="120" stroke="rgba(0,180,216,0.1)" strokeWidth="1" strokeDasharray="4,3" />
            <line x1="616" y1="178" x2="550" y2="178" stroke="rgba(0,180,216,0.1)" strokeWidth="1" strokeDasharray="4,3" />
            <line x1="616" y1="240" x2="550" y2="240" stroke="rgba(0,180,216,0.1)" strokeWidth="1" strokeDasharray="4,3" />
            <line x1="616" y1="300" x2="600" y2="300" stroke="rgba(0,180,216,0.1)" strokeWidth="1" strokeDasharray="4,3" />

            <text x="390" y="452" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#ADE8F4" textAnchor="middle" opacity="0.4">
              {isOperator ? 'CLICK ELEMENTS TO CONTROL' : 'GUEST MODE — Click elements to view status'}
            </text>
          </svg>
        </div>
      )}

      {/* SEQUENCE TAB */}
      {activeTab === 'sequence' && (
        <div className="flex flex-col gap-4 py-2">
          {/* Sequence Commands */}
          <div
            className="p-3 rounded-lg"
            style={{ background: 'rgba(3, 83, 164, 0.3)', border: '1px solid rgba(0, 180, 216, 0.15)' }}
          >
            <div className="text-[10px] tracking-[0.15em] uppercase mb-3" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
              Sequence Control
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSeqCmd('startSequence')}
                disabled={!isOperator}
                className="py-3 rounded-lg text-[11px] font-bold font-mono-data tracking-wider transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed flex flex-col items-center gap-1"
                style={{
                  border: '1px solid var(--status-green)',
                  color: 'var(--status-green)',
                  background: 'rgba(46, 196, 182, 0.1)',
                }}
              >
                <span style={{ fontSize: '18px' }}>▶</span>
                START
              </button>
              <button
                onClick={() => handleSeqCmd('stopSequence')}
                disabled={!isOperator}
                className="py-3 rounded-lg text-[11px] font-bold font-mono-data tracking-wider transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed flex flex-col items-center gap-1"
                style={{
                  border: '1px solid var(--status-amber)',
                  color: 'var(--status-amber)',
                  background: 'rgba(255, 159, 28, 0.1)',
                }}
              >
                <span style={{ fontSize: '18px' }}>■</span>
                STOP
              </button>
              <button
                onClick={() => handleSeqCmd('resetSequence')}
                disabled={!isOperator}
                className="py-3 rounded-lg text-[11px] font-bold font-mono-data tracking-wider transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed flex flex-col items-center gap-1"
                style={{
                  border: '1px solid rgba(202, 240, 248, 0.3)',
                  color: 'var(--text-secondary)',
                  background: 'rgba(202, 240, 248, 0.05)',
                }}
              >
                <span style={{ fontSize: '18px' }}>↺</span>
                RESET
              </button>
            </div>
          </div>

          {/* Individual Pump Commands */}
          <div
            className="p-3 rounded-lg"
            style={{ background: 'rgba(3, 83, 164, 0.3)', border: '1px solid rgba(0, 180, 216, 0.15)' }}
          >
            <div className="text-[10px] tracking-[0.15em] uppercase mb-3" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
              Individual Pump Control
            </div>
            <div className="flex flex-col gap-2">
              {(['A', 'B', 'C'] as const).map((p) => {
                const status = pumps[`pump${p}` as keyof PumpData];
                const topic = `water/control/ftc/pump${p}`;
                const isOn = status === 'OPEN';
                return (
                  <div key={p} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(0,24,69,0.4)' }}>
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        background: isOn ? 'var(--status-green)' : status === 'CLOSED' ? 'var(--status-red)' : 'var(--status-amber)',
                        boxShadow: isOn ? '0 0 6px var(--status-green)' : 'none',
                      }}
                    />
                    <span className="text-xs font-bold flex-1 font-mono-data" style={{ color: 'var(--text-secondary)' }}>
                      PUMP {p}
                    </span>
                    <span
                      className="text-[10px] font-mono-data mr-2"
                      style={{ color: isOn ? 'var(--status-green)' : status === 'CLOSED' ? 'var(--status-red)' : 'var(--status-amber)' }}
                    >
                      {status || 'UNKNOWN'}
                    </span>
                    <button
                      onClick={() => onSendCmd(topic, '1')}
                      disabled={!isOperator}
                      className="px-2.5 py-1 rounded text-[10px] font-bold font-mono-data transition-all hover:opacity-80 disabled:opacity-30"
                      style={{ border: '1px solid var(--status-green)', color: 'var(--status-green)', background: 'rgba(46,196,182,0.1)' }}
                    >
                      ON
                    </button>
                    <button
                      onClick={() => onSendCmd(topic, '0')}
                      disabled={!isOperator}
                      className="px-2.5 py-1 rounded text-[10px] font-bold font-mono-data transition-all hover:opacity-80 disabled:opacity-30"
                      style={{ border: '1px solid var(--status-red)', color: 'var(--status-red)', background: 'rgba(231,29,54,0.1)' }}
                    >
                      OFF
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Valve Quick Commands */}
          <div
            className="p-3 rounded-lg"
            style={{ background: 'rgba(3, 83, 164, 0.3)', border: '1px solid rgba(0, 180, 216, 0.15)' }}
          >
            <div className="text-[10px] tracking-[0.15em] uppercase mb-3" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
              Valve Quick Control
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 8 }, (_, i) => {
                const vNum = i + 1;
                const label = vNum === 8 ? 'CV8' : `XV${vNum}`;
                const status = valves[`valve${vNum}`];
                const topic = vNum === 7 ? 'water/control/ftc/valve7' : `water/control/valve${vNum}`;
                const isOpen = status === 'OPEN';
                return (
                  <div key={vNum} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: 'rgba(0,24,69,0.4)' }}>
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: isOpen ? 'var(--status-green)' : status === 'CLOSED' ? 'var(--status-red)' : 'var(--status-amber)' }}
                    />
                    <span className="text-[10px] font-mono-data flex-1" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    <button
                      onClick={() => onSendCmd(topic, '1')}
                      disabled={!isOperator}
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono-data transition-all hover:opacity-80 disabled:opacity-30"
                      style={{ border: '1px solid var(--status-green)', color: 'var(--status-green)', background: 'rgba(46,196,182,0.1)' }}
                    >
                      O
                    </button>
                    <button
                      onClick={() => onSendCmd(topic, '0')}
                      disabled={!isOperator}
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono-data transition-all hover:opacity-80 disabled:opacity-30"
                      style={{ border: '1px solid var(--status-red)', color: 'var(--status-red)', background: 'rgba(231,29,54,0.1)' }}
                    >
                      C
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {!isOperator && (
            <div
              className="text-[10px] text-center py-2 rounded-lg"
              style={{ color: 'var(--status-amber)', background: 'rgba(255,159,28,0.06)', border: '1px solid rgba(255,159,28,0.15)' }}
            >
              Switch to Operator mode to enable sequence controls.
            </div>
          )}
        </div>
      )}

      {/* LEGEND TAB */}
      {activeTab === 'legend' && (
        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="p-3 rounded-lg" style={{ background: 'rgba(3,83,164,0.3)', border: '1px solid rgba(0,180,216,0.1)' }}>
            <div className="text-[9px] tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>VALVE STATES</div>
            {[['#2EC4B6', 'OPEN'], ['#E71D36', 'CLOSED'], ['#FF9F1C', 'UNKNOWN']].map(([c, l]) => (
              <div key={l} className="flex items-center gap-2 mb-1.5">
                <svg width="24" height="16" viewBox="0 0 24 16">
                  <polygon points="2,0 12,8 2,16" fill={c} />
                  <polygon points="22,0 12,8 22,16" fill={c} />
                </svg>
                <span className="text-[11px]" style={{ color: c }}>{l}</span>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'rgba(3,83,164,0.3)', border: '1px solid rgba(0,180,216,0.1)' }}>
            <div className="text-[9px] tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>PUMP STATES</div>
            {[['#2EC4B6', 'RUNNING'], ['#E71D36', 'STOPPED'], ['#FF9F1C', 'UNKNOWN']].map(([c, l]) => (
              <div key={l} className="flex items-center gap-2 mb-1.5">
                <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="8" fill={`${c}22`} stroke={c} strokeWidth="1.5" /></svg>
                <span className="text-[11px]" style={{ color: c }}>{l}</span>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'rgba(3,83,164,0.3)', border: '1px solid rgba(0,180,216,0.1)' }}>
            <div className="text-[9px] tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>PIPES</div>
            <div className="flex items-center gap-2 mb-1.5">
              <svg width="32" height="8"><line x1="0" y1="4" x2="32" y2="4" stroke="#00B4D8" strokeWidth="4" /></svg>
              <span className="text-[11px]" style={{ color: 'var(--accent-cyan)' }}>FLOW ACTIVE</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="32" height="8"><line x1="0" y1="4" x2="32" y2="4" stroke="rgba(0,180,216,0.15)" strokeWidth="4" /></svg>
              <span className="text-[11px]" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>NO FLOW</span>
            </div>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'rgba(3,83,164,0.3)', border: '1px solid rgba(0,180,216,0.1)' }}>
            <div className="text-[9px] tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>INTERACTION</div>
            <div className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
              Click any valve or pump to view status.<br />
              In <span style={{ color: 'var(--status-green)' }}>OPERATOR</span> mode, clicking sends a control command. Use the <span style={{ color: 'var(--accent-cyan)' }}>SEQUENCE</span> tab for bulk operations.
            </div>
          </div>
        </div>
      )}

      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 rounded-md text-xs font-mono-data pointer-events-none"
          style={{
            left: '50%',
            top: '20px',
            transform: 'translateX(-50%)',
            background: 'rgba(0,24,69,0.95)',
            border: '1px solid rgba(0,180,216,0.3)',
            color: 'var(--text-primary)',
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
