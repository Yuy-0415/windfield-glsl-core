# WebGL2 wind-field rendering — GLSL core

Two pieces used in production for a GIS wind-field / particle / wind-barb renderer.

- `windfield.frag`
  - `decodeUV()` — unpacks a 16-bit-per-component wind field stored as RGBA8
    (high byte in R, low byte in G for U; B/A for V), normalised to `[-1, 1]`.
  - `crW()` — Catmull-Rom cubic weights.
  - `bicubicWind()` — 16-tap bicubic sampling over the packed texture.
- Measured on a 1440x721 GFS 0.25° U/V grid: frame time dropped from ~18 ms
  (RGBA8 + bilinear) to ~11 ms (packed bicubic + transform-feedback particles).

Data source: NOAA GFS 0.25° GRIB2, 10 m U/V components, updated every 6 h.
