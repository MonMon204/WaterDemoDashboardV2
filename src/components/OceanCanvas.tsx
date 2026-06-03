import { useEffect, useRef } from 'react';
import { createOceanSystem } from '../lib/oceanSystem';

interface OceanCanvasProps {
  rainEnabled: boolean;
}

export default function OceanCanvas({ rainEnabled }: OceanCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<ReturnType<typeof createOceanSystem> | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (apiRef.current) return;

    apiRef.current = createOceanSystem(canvasRef.current, {
      rainEnabled,
      waveHeight: 1.0,
      ditherScale: 1.0,
    });

    return () => {
      apiRef.current?.destroy();
      apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (apiRef.current) {
      apiRef.current.updateRain(rainEnabled);
    }
  }, [rainEnabled]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}
