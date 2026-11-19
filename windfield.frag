#version 300 es
precision highp float;

uniform sampler2D uWindTex;   // RGBA8 packed U/V (16-bit hi/lo per channel pair)
uniform vec2      uTexSize;   // e.g. vec2(1440.0, 721.0)
uniform float     uTime;

out vec4 fragColor;

// ---- 1. unpack RGBA8 -> float -> [-1,1] ----
vec2 decodeUV(vec4 t) {
    float u = (t.r * 255.0 * 256.0 + t.g * 255.0) / 65535.0;
    float v = (t.b * 255.0 * 256.0 + t.a * 255.0) / 65535.0;
    return vec2(u, v) * 2.0 - 1.0;
}

// ---- 2. Catmull-Rom weights ----
vec4 crW(float t) {
    float t2 = t * t;
    float t3 = t2 * t;
    return vec4(
        -0.5 * t3 +       t2 - 0.5 * t,
         1.5 * t3 - 2.5 * t2          + 1.0,
        -1.5 * t3 + 2.0 * t2 + 0.5 * t,
         0.5 * t3 - 0.5 * t2
    );
}

// ---- 3. 16-tap bicubic sample on packed wind field ----
vec2 bicubicWind(sampler2D tex, vec2 uv, vec2 ts) {
    vec2 st = uv * ts - 0.5;
    vec2 f  = fract(st);
    vec2 b  = floor(st);
    vec4 wx = crW(f.x);
    vec4 wy = crW(f.y);
    vec2 acc = vec2(0.0);
    for (int j = 0; j < 4; ++j) {
        for (int i = 0; i < 4; ++i) {
            vec2 c = (b + vec2(float(i - 1), float(j - 1)) + 0.5) / ts;
            acc += decodeUV(texture(tex, c)) * wx[i] * wy[j];
        }
    }
    return acc;
}

void main() {
    vec2 uv = gl_FragCoord.xy / uTexSize;
    vec2 wind = bicubicWind(uWindTex, uv, uTexSize);
    // simple visualization: map wind to RG
    fragColor = vec4(wind * 0.5 + 0.5, 0.0, 1.0);
}
