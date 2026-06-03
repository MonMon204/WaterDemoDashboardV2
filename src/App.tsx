import { useCallback, useState } from 'react';
import OceanCanvas from './components/OceanCanvas';
import HeaderBar from './components/HeaderBar';
import ModeToggle from './components/ModeToggle';
import NodeRegistry from './components/NodeRegistry';
import TelemetryLog from './components/TelemetryLog';
import EnvironmentalMetrics from './components/EnvironmentalMetrics';
import PumpPanel from './components/PumpPanel';
import ValvePanel from './components/ValvePanel';
import SystemFaults from './components/SystemFaults';
import ControlPanel from './components/ControlPanel';
import ScadaView from './components/ScadaView';
import PasswordModal from './components/PasswordModal';
import { useTelemetry } from './hooks/useTelemetry';
import { useMode } from './hooks/useMode';

type Tab = 'scada' | 'pumps' | 'valves' | 'env' | 'faults' | 'nodes' | 'log' | 'control';

export default function App() {
  const {
    mode,
    showPasswordModal,
    passwordError,
    requestOperator,
    confirmPassword,
    cancelPassword,
    setGuest,
  } = useMode();

  const {
    connected,
    sensors,
    pumps,
    valves,
    faultCode,
    ftcModeOn,
    logs,
    latchedLock,
    rainEnabled,
    setRainEnabled,
    toggleConnection,
    sendCmd,
    setFtcMode,
    resetFTC,
    getFaultInfo,
    getSensorFaults,
    upPct,
    downPct,
  } = useTelemetry();

  const faultInfo = getFaultInfo();
  const sensorFaults = getSensorFaults();

  // Mobile tab state
  const [mobileTab, setMobileTab] = useState<Tab>('scada');

  const handleSendCmd = useCallback(
    (topic: string, payload: string) => {
      if (mode === 'guest') return;
      sendCmd(topic, payload);
    },
    [mode, sendCmd]
  );

  const handleFtcToggle = useCallback(
    (checked: boolean) => {
      if (mode === 'guest') return;
      setFtcMode(checked);
    },
    [mode, setFtcMode]
  );

  const handleResetFTC = useCallback(() => {
    if (mode === 'guest') return;
    resetFTC();
  }, [mode, resetFTC]);

  const mobileTabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'scada', label: 'SCADA', icon: '⬡' },
    { id: 'pumps', label: 'Pumps', icon: '◎' },
    { id: 'valves', label: 'Valves', icon: '◈' },
    { id: 'env', label: 'Sensors', icon: '◫' },
    { id: 'faults', label: 'Faults', icon: '⚠' },
    { id: 'nodes', label: 'Nodes', icon: '◉' },
    { id: 'log', label: 'Log', icon: '≡' },
    { id: 'control', label: 'Control', icon: '⚙' },
  ];

  return (
    <div className="relative w-full h-full" style={{ background: 'var(--bg-base)' }}>
      <OceanCanvas rainEnabled={rainEnabled} />

      {/* ── DESKTOP LAYOUT (lg+) ─────────────────────────────────── */}
      <div
        className="hidden lg:grid relative z-10 h-full"
        style={{
          gridTemplateRows: 'auto 1fr',
          gridTemplateColumns: '280px 1fr 300px',
          gap: '10px',
          padding: '10px',
        }}
      >
        {/* Header */}
        <div className="col-span-3" style={{ gridRow: '1' }}>
          <HeaderBar connected={connected} />
        </div>

        {/* Left Column */}
        <div className="flex flex-col gap-3 overflow-hidden" style={{ gridRow: '2', minHeight: 0 }}>
          <ModeToggle mode={mode} onSetGuest={setGuest} onRequestOperator={requestOperator} />
          <NodeRegistry pumps={pumps} valves={valves} />
          <TelemetryLog logs={logs} />
        </div>

        {/* Center Column */}
        <div className="flex flex-col gap-3 min-h-0 overflow-y-auto scroll-thin" style={{ gridRow: '2' }}>
          <ScadaView
            sensors={sensors}
            pumps={pumps}
            valves={valves}
            mode={mode}
            onSendCmd={handleSendCmd}
          />
          <div className="grid grid-cols-2 gap-3">
            <PumpPanel
              pumps={pumps}
              mode={mode}
              latchedLock={latchedLock}
              faultCode={faultCode}
              onSendCmd={handleSendCmd}
            />
            <ValvePanel valves={valves} mode={mode} onSendCmd={handleSendCmd} />
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-3 min-h-0 overflow-y-auto scroll-thin" style={{ gridRow: '2' }}>
          <ControlPanel
            rainEnabled={rainEnabled}
            onToggleRain={() => setRainEnabled(!rainEnabled)}
            connected={connected}
            onToggleConnection={toggleConnection}
            mode={mode}
          />
          <EnvironmentalMetrics
            sensors={sensors}
            upPct={upPct}
            downPct={downPct}
            sensorFaults={sensorFaults}
          />
          <SystemFaults
            faultInfo={faultInfo}
            ftcModeOn={ftcModeOn}
            onFtcToggle={handleFtcToggle}
            onResetFTC={handleResetFTC}
            mode={mode}
          />
        </div>
      </div>

      {/* ── TABLET LAYOUT (md–lg) ────────────────────────────────── */}
      <div
        className="hidden md:grid lg:hidden relative z-10 h-full"
        style={{
          gridTemplateRows: 'auto 1fr auto',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          padding: '8px',
        }}
      >
        <div className="col-span-2">
          <HeaderBar connected={connected} />
        </div>

        {/* Left */}
        <div className="flex flex-col gap-2 min-h-0 overflow-y-auto scroll-thin">
          <ModeToggle mode={mode} onSetGuest={setGuest} onRequestOperator={requestOperator} />
          <ScadaView sensors={sensors} pumps={pumps} valves={valves} mode={mode} onSendCmd={handleSendCmd} />
          <PumpPanel pumps={pumps} mode={mode} latchedLock={latchedLock} faultCode={faultCode} onSendCmd={handleSendCmd} />
          <ValvePanel valves={valves} mode={mode} onSendCmd={handleSendCmd} />
        </div>

        {/* Right */}
        <div className="flex flex-col gap-2 min-h-0 overflow-y-auto scroll-thin">
          <ControlPanel rainEnabled={rainEnabled} onToggleRain={() => setRainEnabled(!rainEnabled)} connected={connected} onToggleConnection={toggleConnection} mode={mode} />
          <EnvironmentalMetrics sensors={sensors} upPct={upPct} downPct={downPct} sensorFaults={sensorFaults} />
          <NodeRegistry pumps={pumps} valves={valves} />
          <SystemFaults faultInfo={faultInfo} ftcModeOn={ftcModeOn} onFtcToggle={handleFtcToggle} onResetFTC={handleResetFTC} mode={mode} />
          <TelemetryLog logs={logs} />
        </div>
      </div>

      {/* ── MOBILE LAYOUT (<md) ──────────────────────────────────── */}
      <div className="flex md:hidden flex-col relative z-10 h-full" style={{ padding: '8px', gap: '8px' }}>
        <HeaderBar connected={connected} />

        {/* Tab Content */}
        <div className="flex-1 min-h-0 overflow-y-auto scroll-thin">
          {mobileTab === 'scada' && (
            <div className="flex flex-col gap-3">
              <ModeToggle mode={mode} onSetGuest={setGuest} onRequestOperator={requestOperator} />
              <ScadaView sensors={sensors} pumps={pumps} valves={valves} mode={mode} onSendCmd={handleSendCmd} />
            </div>
          )}
          {mobileTab === 'pumps' && (
            <PumpPanel pumps={pumps} mode={mode} latchedLock={latchedLock} faultCode={faultCode} onSendCmd={handleSendCmd} />
          )}
          {mobileTab === 'valves' && (
            <ValvePanel valves={valves} mode={mode} onSendCmd={handleSendCmd} />
          )}
          {mobileTab === 'env' && (
            <EnvironmentalMetrics sensors={sensors} upPct={upPct} downPct={downPct} sensorFaults={sensorFaults} />
          )}
          {mobileTab === 'faults' && (
            <SystemFaults faultInfo={faultInfo} ftcModeOn={ftcModeOn} onFtcToggle={handleFtcToggle} onResetFTC={handleResetFTC} mode={mode} />
          )}
          {mobileTab === 'nodes' && (
            <NodeRegistry pumps={pumps} valves={valves} />
          )}
          {mobileTab === 'log' && (
            <TelemetryLog logs={logs} />
          )}
          {mobileTab === 'control' && (
            <ControlPanel rainEnabled={rainEnabled} onToggleRain={() => setRainEnabled(!rainEnabled)} connected={connected} onToggleConnection={toggleConnection} mode={mode} />
          )}
        </div>

        {/* Bottom Tab Bar */}
        <div
          className="flex items-center justify-around rounded-xl py-2 px-1 flex-shrink-0"
          style={{
            background: 'rgba(2, 62, 125, 0.92)',
            border: '1px solid rgba(0, 180, 216, 0.2)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {mobileTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMobileTab(tab.id)}
              className="flex flex-col items-center gap-0.5 px-1 py-1 rounded-lg transition-all"
              style={{
                color: mobileTab === tab.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                opacity: mobileTab === tab.id ? 1 : 0.5,
                background: mobileTab === tab.id ? 'rgba(0, 180, 216, 0.1)' : 'transparent',
                minWidth: '36px',
              }}
            >
              <span style={{ fontSize: '14px', lineHeight: 1 }}>{tab.icon}</span>
              <span style={{ fontSize: '8px', letterSpacing: '0.05em', fontFamily: 'monospace' }}>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <PasswordModal
        visible={showPasswordModal}
        error={passwordError}
        onConfirm={confirmPassword}
        onCancel={cancelPassword}
      />
    </div>
  );
}
