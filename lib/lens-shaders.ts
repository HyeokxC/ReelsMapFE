export const vertex = `#version 300 es
in vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;

export const fragment = `#version 300 es
precision highp float;
uniform sampler2D uMap;
uniform vec2 uView;
uniform float uDpr;
uniform int uCount;
uniform vec4 uRect[12];
uniform float uRadius[12];
uniform vec4 uParam[12];
uniform float uDispersion;
uniform float uFrost;
out vec4 color;
float sdBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
float gLod;
vec3 tap(vec2 q) {
  vec4 sampled = textureLod(uMap, clamp(q / uView, vec2(0.001), vec2(0.999)), gLod);
  return mix(vec3(1.0), sampled.rgb, sampled.a);
}
vec3 frosted(vec2 q) {
  float s = uFrost * exp2(gLod * 0.9);
  vec3 c = tap(q) * 0.36;
  c += (tap(q + vec2(s, 0.0)) + tap(q - vec2(s, 0.0)) + tap(q + vec2(0.0, s)) + tap(q - vec2(0.0, s))) * 0.11;
  c += (tap(q + vec2(s, s)) + tap(q - vec2(s, s)) + tap(q + vec2(s, -s)) + tap(q - vec2(s, -s))) * 0.05;
  return c;
}
void main() {
  vec2 p = vec2(gl_FragCoord.x, uView.y * uDpr - gl_FragCoord.y) / uDpr;
  for (int i = 0; i < 12; i++) {
    if (i >= uCount) break;
    vec4 r = uRect[i];
    vec2 hb = r.zw * 0.5;
    vec2 c = r.xy + hb;
    float rad = min(uRadius[i], min(hb.x, hb.y));
    float d = sdBox(p - c, hb, rad);
    if (d > 0.0) continue;
    float e = 0.5;
    vec2 n = normalize(vec2(
      sdBox(p - c + vec2(e, 0.0), hb, rad) - sdBox(p - c - vec2(e, 0.0), hb, rad),
      sdBox(p - c + vec2(0.0, e), hb, rad) - sdBox(p - c - vec2(0.0, e), hb, rad)) + 1e-5);
    vec4 prm = uParam[i];
    float bevel = min(prm.z, min(hb.x, hb.y) * 0.9);
    float t = clamp(-d / bevel, 0.0, 1.0);
    float slope = 1.0 - sqrt(1.0 - (1.0 - t) * (1.0 - t));
    vec2 off = -n * slope * prm.w;
    gLod = mix(1.0, prm.x, smoothstep(0.0, 1.0, t));
    vec3 col;
    col.r = frosted(p + off * (1.0 - uDispersion)).r;
    col.g = frosted(p + off).g;
    col.b = frosted(p + off * (1.0 + uDispersion)).b;
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(lum), col, 1.35);
    col = mix(col, vec3(1.0), prm.y * (0.75 + 0.25 * t));
    vec2 light = normalize(vec2(-0.6, -0.8));
    float rim = pow(1.0 - t, 3.0);
    float facing = dot(n, light);
    col += vec3(1.0) * rim * (0.55 * max(facing, 0.0) + 0.12);
    col -= vec3(0.10, 0.11, 0.13) * rim * max(-facing, 0.0) * 0.8;
    float edgeLine = smoothstep(1.2, 0.0, -d);
    col = mix(col, vec3(1.0), edgeLine * 0.55 * (0.5 + 0.5 * max(facing, 0.0)));
    color = vec4(clamp(col, 0.0, 1.0), smoothstep(0.0, 1.0, -d));
    return;
  }
  color = vec4(0.0);
}`;
