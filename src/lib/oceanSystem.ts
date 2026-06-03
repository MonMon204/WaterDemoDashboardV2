import * as THREE from 'three';
import { oceanVert, oceanFrag } from '../shaders/ocean';

export interface OceanConfig {
  rainEnabled: boolean;
  waveHeight: number;
  ditherScale: number;
}

export interface OceanAPI {
  updateRain: (bool: boolean) => void;
  resize: () => void;
  destroy: () => void;
}

export function createOceanSystem(
  canvasElement: HTMLCanvasElement,
  config: OceanConfig = { rainEnabled: false, waveHeight: 1.0, ditherScale: 1.0 }
): OceanAPI {
  const renderer = new THREE.WebGLRenderer({
    canvas: canvasElement,
    antialias: false,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x001845);

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms: Record<string, THREE.IUniform> = {
    uTime: { value: 0.0 },
    uResolution: {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight),
    },
    uWaveHeight: { value: config.waveHeight },
    uDitherScale: { value: config.ditherScale },
    uBaseColor: { value: new THREE.Color(0x023e7d) },
    uWaterColor: { value: new THREE.Color(0x0353a4) },
    uFoamColor: { value: new THREE.Color(0xcaf0f8) },
    uDitherColor: { value: new THREE.Color(0x001845) },
    uSkyColor: { value: new THREE.Color(0x001845) },
    uRainEnabled: { value: config.rainEnabled ? 1.0 : 0.0 },
    uRainIntensity: { value: 0.5 },
  };

  const oceanMaterial = new THREE.ShaderMaterial({
    vertexShader: oceanVert,
    fragmentShader: oceanFrag,
    uniforms: uniforms,
  });

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    oceanMaterial
  );
  scene.add(plane);

  const clock = new THREE.Clock();

  const api: OceanAPI = {
    updateRain: (bool: boolean) => {
      uniforms.uRainEnabled.value = bool ? 1.0 : 0.0;
    },
    resize: () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      uniforms.uResolution.value.set(w, h);
    },
    destroy: () => {
      renderer.dispose();
      oceanMaterial.dispose();
      plane.geometry.dispose();
    },
  };

  function render() {
    clock.getDelta();
    uniforms.uTime.value = clock.getElapsedTime();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();

  const onResize = () => api.resize();
  window.addEventListener('resize', onResize);

  return api;
}
