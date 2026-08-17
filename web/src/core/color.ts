// 極性 → 発散配色(SPEC F-08 / T-100)。−1 = 藍、0 = 生成り、+1 = 紅。
// 非有限値は中立(0)、範囲外はクランプ — 縁を正常系として扱う(N-04)。

export type Rgb = [number, number, number];

export const NEG_RGB: Rgb = [58, 96, 165]; // 藍
export const NEU_RGB: Rgb = [234, 228, 214]; // 生成り
export const POS_RGB: Rgb = [198, 73, 82]; // 紅

function lerp(a: Rgb, b: Rgb, t: number): Rgb {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

export function polarityColor(p: number): Rgb {
  const v = Number.isFinite(p) ? Math.max(-1, Math.min(1, p)) : 0;
  return v < 0 ? lerp(NEG_RGB, NEU_RGB, v + 1) : lerp(NEU_RGB, POS_RGB, v);
}

export function polarityCss(p: number): string {
  const [r, g, b] = polarityColor(p);
  return `rgb(${r}, ${g}, ${b})`;
}
