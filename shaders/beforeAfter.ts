/**
 * Before/After morph shader.
 *
 * Two textures (before / after) blended via a soft, animated mask.
 * The mask is offset by simplex noise so the boundary feels like a
 * dissolve rather than a hard wipe. A bright "scan" line is overlaid
 * around the boundary to give it the AI-instrument feel.
 *
 * Uniforms:
 *   uBefore, uAfter — sampler2D
 *   uProgress — 0 → fully before, 1 → fully after
 *   uTime — seconds, drives noise scintillation
 *   uAspect — image aspect ratio (w/h) so the noise doesn't squash
 *   uHover — 0..1, intensity of the gold scan band
 */

export const baVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const baFragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  uniform sampler2D uBefore;
  uniform sampler2D uAfter;
  uniform float uProgress;
  uniform float uTime;
  uniform float uAspect;
  uniform float uHover;

  // 2D simplex noise (same as hero shader)
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

  void main() {
    vec2 uv = vUv;

    // Aspect-corrected sampling for noise so it stays circular not squashed
    vec2 nuv = vec2(uv.x * uAspect, uv.y);

    float n = snoise(nuv * 3.0 + uTime * 0.05) * 0.18;
    n += snoise(nuv * 8.0 - uTime * 0.07) * 0.05;

    // Soft, noise-warped diagonal mask driven by progress
    float band = smoothstep(0.0, 0.35,
      uv.x + uv.y * 0.15 + n - (uProgress * 1.5)
    );

    vec4 before = texture2D(uBefore, uv);
    vec4 after  = texture2D(uAfter,  uv);
    vec4 col = mix(after, before, band);

    // Gold scan band — thin gradient around the mask boundary
    float scanCenter = 1.0 - uProgress;
    float scanDist = abs(uv.x + uv.y * 0.15 + n - (uProgress * 1.5) - 0.18);
    float scan = smoothstep(0.04, 0.0, scanDist);
    col.rgb += vec3(0.788, 0.639, 0.231) * scan * (0.45 + 0.55 * uHover);

    // Subtle scanlines that intensify on hover
    float lines = sin(uv.y * 800.0) * 0.5 + 0.5;
    col.rgb -= 0.04 * lines * uHover;

    gl_FragColor = col;
    // suppress unused warning
    if (false) col.r = scanCenter;
  }
`;
