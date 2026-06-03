import { useState, useCallback, useRef } from 'react';

export interface SensorData {
  flow1?: number;
  flow2?: number;
  pressure1?: number;
  pressure2?: number;
  levelTop?: number;
  levelBottom?: number;
}

export interface PumpData {
  pumpA?: string;
  pumpB?: string;
  pumpC?: string;
}

export interface ValveData {
  [key: string]: string;
}

export interface TelemetrySnapshot {
  sensors: SensorData;
  pumps: PumpData;
  valves: ValveData;
}

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'ok' | 'err';
}

const FAULT_LABELS: Record<number, string> = {
  1: 'FLOW BLOCKAGE',
  2: 'PUMP TRIP',
  3: 'FLOW2 SENSOR FAULT',
  4: 'PRESSURE2 SENSOR FAULT',
  5: 'UPTANK SENSOR FAULT',
  6: 'DOWNTANK SENSOR FAULT',
};

const FAULT_ACTIONS: Record<number, string> = {
  1: 'All pumps shut down and locked until reset.',
  2: 'Tripped pump stopped, backup pump started.',
  3: 'Flow2 reading substituted with Simulink model value.',
  4: 'Pressure2 reading substituted with Simulink model value.',
  5: 'UpTank level substituted with Simulink model value.',
  6: 'DownTank level substituted with Simulink model value.',
};

function decodeFault(code: number) {
  if (code <= 0) return { digits: [] as number[], sensors: [] as number[] };
  let digits: number[];
  if (code < 10) {
    digits = [code];
  } else {
    digits = [Math.floor(code / 10), code % 10];
  }
  return {
    digits,
    sensors: digits.filter((d) => d >= 3 && d <= 6),
  };
}

export function useTelemetry() {
  const [connected, setConnected] = useState(false);
  const [sensors, setSensors] = useState<SensorData>({});
  const [pumps, setPumps] = useState<PumpData>({});
  const [valves, setValves] = useState<ValveData>({});
  const [faultCode, setFaultCode] = useState(0);
  const [faultUncertain, setFaultUncertain] = useState(false);
  const [ftcModeOn, setFtcModeOn] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [latchedLock, setLatchedLock] = useState(false);
  const [latchedTrip, setLatchedTrip] = useState(false);
  const [rainEnabled, setRainEnabled] = useState(false);
  const clientRef = useRef<any>(null);
  const lastTelemetryRef = useRef<TelemetrySnapshot>({
    sensors: {},
    pumps: {},
    valves: {},
  });

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toTimeString().slice(0, 8);
    setLogs((prev) => {
      const next = [...prev, { timestamp, message, type }];
      if (next.length > 60) next.shift();
      return next;
    });
  }, []);

  const parseTelemetry = useCallback(
    (data: TelemetrySnapshot) => {
      lastTelemetryRef.current = data;
      if (data.sensors) setSensors(data.sensors);
      if (data.pumps) setPumps(data.pumps);
      if (data.valves) setValves(data.valves);
    },
    []
  );

  const updateFaultStatus = useCallback(
    (code: number) => {
      if (code === -1) {
        setFaultUncertain(true);
        return;
      }
      if (code < -1) return;
      setFaultUncertain(false);
      setFaultCode(code);
      const dec = decodeFault(code);
      if (code > 0) {
        const nameParts = dec.digits.map((d) => FAULT_LABELS[d] || `FAULT ${d}`);
        addLog(`FAULT ${code}: ${nameParts.join(' + ')}`, 'err');
      }
      if (dec.digits.includes(1)) setLatchedLock(true);
      if (dec.digits.includes(2)) setLatchedTrip(true);
    },
    [addLog]
  );

  const setFtcMode = useCallback(
    (checked: boolean) => {
      setFtcModeOn(checked);
      if (checked) {
        addLog('FTC Mode ON — commands routed through Matlab', 'ok');
      } else {
        addLog('FTC Mode OFF — direct control (bypasses Matlab)', 'info');
        setLatchedLock(false);
      }
    },
    [addLog]
  );

  const resetFTC = useCallback(() => {
    setLatchedLock(false);
    setLatchedTrip(false);
    setFaultCode(0);
    addLog('FTC reset: all commands zeroed, trips cleared, latch released', 'ok');
  }, [addLog]);

  const connect = useCallback(() => {
    addLog('Connecting to MQTT broker...', 'info');
    // Attempt to load mqtt dynamically
    const script = document.createElement('script');
    script.src =
      'https://cdnjs.cloudflare.com/ajax/libs/mqtt/4.3.7/mqtt.min.js';
    script.onload = () => {
      const mqtt = (window as any).mqtt;
      if (!mqtt) {
        addLog('MQTT library failed to load', 'err');
        return;
      }
      try {
        const client = mqtt.connect(
          'wss://broker.hivemq.com:8884/mqtt',
          {
            clientId:
              'WaterDashUI_' + Math.random().toString(16).slice(2),
          }
        );
        clientRef.current = client;

        client.on('connect', () => {
          setConnected(true);
          addLog('MQTT connected', 'ok');
          client.subscribe('water/system/telemetry');
          client.subscribe('water/control/#');
          client.subscribe('water/system/faultcode');
          client.subscribe('water/sim/telemetry');
          client.subscribe('water/system/ftcmode');
          client.subscribe('water/system/ftcreset');
        });

        client.on('message', (topic: string, payload: { toString: () => string }) => {
          const msg = payload.toString().trim();
          if (topic === 'water/system/telemetry') {
            try {
              parseTelemetry(JSON.parse(msg));
            } catch (e) {}
          } else if (topic === 'water/system/faultcode') {
            try {
              updateFaultStatus(parseInt(msg));
            } catch (e) {}
          } else if (topic === 'water/sim/telemetry') {
            // Sim telemetry handled
          } else if (topic === 'water/system/ftcmode') {
            setFtcModeOn(msg === '1');
          } else if (topic === 'water/system/ftcreset') {
            resetFTC();
          } else {
            addLog(`← ${topic}: ${msg}`, 'info');
          }
        });

        client.on('error', (e: Error) => {
          addLog(`Error: ${e.message}`, 'err');
          setConnected(false);
        });

        client.on('close', () => {
          setConnected(false);
          addLog('Disconnected', 'err');
        });
      } catch (e: any) {
        addLog(`Failed: ${e.message}`, 'err');
      }
    };
    script.onerror = () => {
      addLog('Failed to load MQTT library', 'err');
    };
    document.head.appendChild(script);
  }, [addLog, parseTelemetry, updateFaultStatus, resetFTC]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.end();
      clientRef.current = null;
    }
    setConnected(false);
    addLog('Disconnected from broker', 'info');
  }, [addLog]);

  const toggleConnection = useCallback(() => {
    if (connected) {
      disconnect();
    } else {
      connect();
    }
  }, [connected, connect, disconnect]);

  const sendCmd = useCallback(
    (topic: string, payload: string) => {
      if (!connected || !clientRef.current) {
        addLog('Not connected to MQTT', 'err');
        return;
      }
      clientRef.current.publish(topic, payload);
      addLog(`→ ${topic}: ${payload}`, 'ok');
    },
    [connected, addLog]
  );

  const getFaultInfo = useCallback(() => {
    if (faultUncertain) {
      return {
        badge: '?',
        name: 'UNCERTAIN — ML model classifying...',
        action: 'Waiting for confident fault classification.',
        state: 'uncertain' as const,
      };
    }
    if (faultCode === 0) {
      return {
        badge: '0',
        name: 'NORMAL — No Fault Detected',
        action: 'FTC: System operating normally. All commands pass through.',
        state: 'normal' as const,
      };
    }
    const dec = decodeFault(faultCode);
    const nameParts = dec.digits.map((d) => FAULT_LABELS[d] || `FAULT ${d}`);
    const actionParts = dec.digits
      .map((d) => FAULT_ACTIONS[d] || '')
      .filter(Boolean);
    return {
      badge: dec.digits.join(' + '),
      name: `FAULT ${dec.digits.join(' + ')}: ${nameParts.join(' + ')}`,
      action: actionParts.join(' | '),
      state: 'active' as const,
    };
  }, [faultCode, faultUncertain]);

  const getSensorFaults = useCallback(() => {
    const dec = decodeFault(faultCode);
    const map: Record<number, string> = {
      3: 'flow2',
      4: 'pressure2',
      5: 'levelTop',
      6: 'levelBottom',
    };
    return dec.sensors.map((s) => map[s]).filter(Boolean) as string[];
  }, [faultCode]);

  const upPct = sensors.levelTop
    ? Math.min(100, Math.max(0, (sensors.levelTop / 32) * 100))
    : 50;
  const downPct = sensors.levelBottom
    ? Math.min(100, Math.max(0, (sensors.levelBottom / 22) * 100))
    : 50;

  return {
    connected,
    sensors,
    pumps,
    valves,
    faultCode,
    faultUncertain,
    ftcModeOn,
    logs,
    latchedLock,
    latchedTrip,
    rainEnabled,
    setRainEnabled,
    toggleConnection,
    sendCmd,
    setFtcMode,
    resetFTC,
    getFaultInfo,
    getSensorFaults,
    addLog,
    upPct,
    downPct,
  };
}
