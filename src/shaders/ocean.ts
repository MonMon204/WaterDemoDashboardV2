export const oceanVert = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

export const oceanFrag = `
precision mediump float;
varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform float uWaveHeight;
uniform float uDitherScale;
uniform vec3 uBaseColor;
uniform vec3 uWaterColor;
uniform vec3 uFoamColor;
uniform vec3 uDitherColor;
uniform vec3 uSkyColor;
uniform float uRainEnabled;
uniform float uRainIntensity;

const float PI = 3.14159265359;
const int BAYER_SIZE = 8;

float bayer8(vec2 coord) {
  ivec2 iCoord = ivec2(mod(coord, float(BAYER_SIZE)));
  return iCoord.x < 4 ?
    iCoord.y < 4 ?
      iCoord.x < 2 ?
        iCoord.y < 2 ?
          (iCoord.x == 0 ? (iCoord.y == 0 ? 0.0 : 8.0) : (iCoord.y == 0 ? 12.0 : 4.0))
          : (iCoord.x == 0 ? (iCoord.y == 2 ? 2.0 : 10.0) : (iCoord.y == 2 ? 14.0 : 6.0))
        : iCoord.y < 2 ?
          (iCoord.x == 2 ? (iCoord.y == 0 ? 3.0 : 11.0) : (iCoord.y == 0 ? 15.0 : 7.0))
          : (iCoord.x == 2 ? (iCoord.y == 2 ? 1.0 : 9.0) : (iCoord.y == 2 ? 13.0 : 5.0))
    : iCoord.x < 2 ?
      iCoord.y < 6 ?
        (iCoord.x == 0 ? (iCoord.y == 4 ? 32.0 : 40.0) : (iCoord.y == 4 ? 44.0 : 36.0))
        : (iCoord.x == 0 ? (iCoord.y == 6 ? 34.0 : 42.0) : (iCoord.y == 6 ? 46.0 : 38.0))
      : iCoord.y < 6 ?
        (iCoord.x == 2 ? (iCoord.y == 4 ? 35.0 : 43.0) : (iCoord.y == 4 ? 47.0 : 39.0))
        : (iCoord.x == 2 ? (iCoord.y == 6 ? 33.0 : 41.0) : (iCoord.y == 6 ? 45.0 : 37.0))
  : iCoord.y < 4 ?
    iCoord.x < 6 ?
      iCoord.y < 2 ?
        (iCoord.x == 4 ? (iCoord.y == 0 ? 48.0 : 56.0) : (iCoord.y == 0 ? 60.0 : 52.0))
        : (iCoord.x == 4 ? (iCoord.y == 2 ? 50.0 : 58.0) : (iCoord.y == 2 ? 62.0 : 54.0))
      : iCoord.y < 2 ?
        (iCoord.x == 6 ? (iCoord.y == 0 ? 51.0 : 59.0) : (iCoord.y == 0 ? 63.0 : 55.0))
        : (iCoord.x == 6 ? (iCoord.y == 2 ? 49.0 : 57.0) : (iCoord.y == 2 ? 61.0 : 53.0))
    : iCoord.x < 6 ?
      iCoord.y < 6 ?
        (iCoord.x == 4 ? (iCoord.y == 4 ? 16.0 : 24.0) : (iCoord.y == 4 ? 28.0 : 20.0))
        : (iCoord.x == 4 ? (iCoord.y == 6 ? 18.0 : 26.0) : (iCoord.y == 6 ? 30.0 : 22.0))
      : iCoord.y < 6 ?
        (iCoord.x == 6 ? (iCoord.y == 4 ? 19.0 : 27.0) : (iCoord.y == 4 ? 31.0 : 23.0))
        : (iCoord.x == 6 ? (iCoord.y == 6 ? 17.0 : 25.0) : (iCoord.y == 6 ? 29.0 : 21.0));
}

float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash2(i);
  float b = hash2(i + vec2(1.0, 0.0));
  float c = hash2(i + vec2(0.0, 1.0));
  float d = hash2(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float wave(vec2 p, float time) {
  float w1 = sin(p.x * 2.0 + time * 0.5) * 0.5 + 0.5;
  float w2 = sin(p.y * 3.0 + time * 0.7) * 0.5 + 0.5;
  float w3 = sin((p.x + p.y) * 1.5 + time * 0.3) * 0.5 + 0.5;
  return (w1 * w2 + w3) * 0.5;
}

float waveHeight(vec2 p, float time) {
  float height = 0.0;
  height += sin(p.x * 1.0 + time * 0.5) * cos(p.y * 1.0 + time * 0.3) * 0.5;
  height += sin(p.x * 2.0 - time * 0.4) * cos(p.y * 2.0 + time * 0.6) * 0.3;
  height += sin(p.x * 0.5 + time * 0.2) * cos(p.y * 0.5 - time * 0.1) * 0.2;
  float turbulence = noise(p * 3.0 + time * 0.1) * 0.2;
  return (height + turbulence) * uWaveHeight;
}

vec3 waterNormal(vec2 p, float time) {
  float eps = 0.01;
  float h = waveHeight(p, time);
  float hx = waveHeight(p + vec2(eps, 0.0), time);
  float hy = waveHeight(p + vec2(0.0, eps), time);
  vec3 n = normalize(vec3(h - hx, h - hy, eps * 2.0));
  return n * 0.5 + 0.5;
}

vec3 rainRipple(vec2 uv, float time, float dropTime) {
  float age = time - dropTime;
  if (age < 0.0 || age > 2.0) return vec3(0.5, 0.5, 1.0);
  float radius = age * 0.3;
  float dist = length(uv);
  float ring = smoothstep(radius + 0.02, radius, dist) - smoothstep(radius, radius - 0.02, dist);
  float height = ring * 0.1 * (1.0 - age / 2.0);
  float dx = -uv.x / (dist + 0.001) * ring * 0.1;
  float dy = -uv.y / (dist + 0.001) * ring * 0.1;
  return normalize(vec3(dx, dy, 1.0 - height)) * 0.5 + 0.5;
}

void main() {
  vec2 fragCoord = vUv * uResolution;
  vec2 pixelIndex = floor(fragCoord);
  float bayerThreshold = bayer8(pixelIndex) / 64.0;

  float aspect = uResolution.x / uResolution.y;
  vec2 uv = vUv * 2.0 - 1.0;
  uv.x *= aspect;

  float time = uTime;
  float distortScale = 0.1;

  vec2 distortUv;
  distortUv.x = uv.x + sin(uv.y * 5.0 + time * 0.5) * distortScale;
  distortUv.y = uv.y + cos(uv.x * 5.0 + time * 0.7) * distortScale;

  vec2 skyUv = distortUv * 0.5 + 0.5;
  vec3 skyColor = mix(uSkyColor, vec3(0.8, 0.9, 1.0), skyUv.y);

  float wave = wave(uv, time);
  float waterAmount = smoothstep(0.3, 0.7, wave);

  vec3 waterCol = mix(uBaseColor, uWaterColor, waterAmount);
  vec3 finalColor;

  float bayerValue = bayerThreshold * uDitherScale;
  float dithered = 0.0;
  vec3 normal = waterNormal(uv, time);
  float height = waveHeight(uv, time);

  if (uRainEnabled > 0.5) {
    float rainIntensity = uRainIntensity;
    int dropCount = int(rainIntensity * 10.0) + 3;
    for (int i = 0; i < 13; i++) {
      if (i >= dropCount) break;
      float fi = float(i);
      float dropTime = hash(fi * 123.456) * 2.0;
      float cycleTime = mod(time, 4.0);
      float currentDropTime = cycleTime - dropTime;
      if (currentDropTime < 0.0) continue;
      float dropX = hash(fi * 321.654) * aspect * 2.0 - aspect;
      float dropY = hash(fi * 213.546) * 2.0 - 1.0;
      vec2 dropUv = uv - vec2(dropX, dropY);
      vec3 rippleNormal = rainRipple(dropUv, cycleTime, dropTime);
      normal = mix(normal, rippleNormal, 0.3);
      float rippleHeight = rainRipple(dropUv, cycleTime, dropTime).z;
      height += rippleHeight * 0.05 * (1.0 - currentDropTime / 2.0);
    }
  }

  float colorBands = 8.0 + height * 4.0;
  float normalDither = (normal.x + normal.y) * 0.5;
  float ditherThreshold = fract(colorBands + normalDither) - 0.5;
  dithered = step(ditherThreshold, bayerValue);

  float foam = smoothstep(0.6, 1.0, height);
  dithered = max(dithered, foam);
  float shading = dot(normal * 2.0 - 1.0, normalize(vec3(0.5, 0.8, 1.0)));
  dithered = mix(dithered, dithered * (shading * 0.5 + 0.5), 0.3);

  vec3 ditheredColor = mix(uWaterColor, uDitherColor, dithered);
  vec3 foamColor = mix(uFoamColor, vec3(1.0), shading * 0.5);
  finalColor = mix(ditheredColor, foamColor, foam * 0.7);

  float highlight = pow(max(shading, 0.0), 8.0) * 0.5;
  finalColor = mix(finalColor, foamColor, highlight);

  vec3 reflection = mix(uWaterColor, skyColor, 0.3);
  finalColor = mix(finalColor, reflection, 0.2);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;
