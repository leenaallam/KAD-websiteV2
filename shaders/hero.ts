/**
 * Cinematic gold-leaf hero shader.
 *
 * Layers (back to front):
 *   1. Slow, large-scale Perlin field tinted toward the deep gold ink
 *   2. Subtle directional sweep that catches the gold like brushed metal
 *   3. Vertical luxury gradient (ink → obsidian → coal) for depth
 *   4. Vignette and film grain on top
 *
 * Inputs come from React Three Fiber via uniforms — see CanvasRoot for wiring.
 */

export const heroVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const heroFragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  uniform float uTime;
  uniform vec2  uResolution;
  uniform vec2  uMouse;       // -1..1
  uniform float uIntensity;   // 0..1

  // ----- 2D simplex noise (Stefan Gustavson, public domain) -----
  vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 mod289(vec2 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 permute(vec3 x){ return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                  + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Brand palette (matches CSS tokens)
  const vec3 INK      = vec3(0.020, 0.020, 0.020);
  const vec3 OBSIDIAN = vec3(0.043, 0.043, 0.051);
  const vec3 COAL     = vec3(0.086, 0.086, 0.094);
  const vec3 GOLD     = vec3(0.788, 0.639, 0.231);
  const vec3 GOLD_DEEP= vec3(0.541, 0.435, 0.133);

  float vignette(vec2 uv){
    vec2 p = uv - 0.5;
    return smoothstep(0.95, 0.20, dot(p, p) * 1.4);
  }

  void main() {
    vec2 uv = vUv;
    vec2 aspectUv = uv;
    aspectUv.x *= uResolution.x / uResolution.y;

    // Mouse-influenced parallax origin
    vec2 m = uMouse * 0.18;

    // Multi-octave slow drift
    float t = uTime * 0.05;
    float n1 = snoise(aspectUv * 1.1 + m + vec2(t, -t * 0.6));
    float n2 = snoise(aspectUv * 2.6 - m * 0.4 + vec2(-t * 0.7, t * 1.1));
    float n3 = snoise(aspectUv * 5.0 + vec2(t * 1.3, t * 0.8));
    float field = (n1 * 0.6 + n2 * 0.3 + n3 * 0.1) * 0.5 + 0.5;

    // Vertical luxury gradient — ink at the top, lifting toward coal at horizon
    float vGrad = smoothstep(0.0, 1.0, uv.y);
    vec3 base = mix(INK, mix(OBSIDIAN, COAL, vGrad * 0.7), vGrad);

    // Brushed-metal sweep — slow diagonal band that catches the gold tone
    float sweep = smoothstep(0.4, 0.55,
      sin((aspectUv.x * 1.4 - aspectUv.y * 0.6) * 3.14159 + uTime * 0.18) * 0.5 + 0.5
    );

    // Soft gold pools driven by noise field
    float goldMask = smoothstep(0.55, 0.85, field) * (0.55 + 0.45 * sweep);
    vec3 gold = mix(GOLD_DEEP, GOLD, smoothstep(0.6, 0.95, field));
    vec3 col = mix(base, gold, goldMask * 0.42 * uIntensity);

    // Subtle highlight band high in the frame
    float halo = smoothstep(0.65, 0.95, 1.0 - uv.y) * 0.12 * uIntensity;
    col += GOLD * halo * (0.4 + 0.6 * field);

    // Vignette to focus the eye
    col *= mix(0.55, 1.0, vignette(uv));

    // Film grain — cheap hash, tied to time so it shimmers
    float g = fract(sin(dot(gl_FragCoord.xy + uTime * 60.0, vec2(12.9898, 78.233))) * 43758.5453);
    col += (g - 0.5) * 0.025;

    gl_FragColor = vec4(col, 1.0);
  }
`;
