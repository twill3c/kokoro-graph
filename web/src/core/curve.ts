// 感情曲線の描画データ(SPEC F-09 / T-110・T-111)。
// movingAverage は pipeline/metrics.py(MA_RADIUS = 7)と同一定義 — 言語間で一致させる。
// 非有限値は 0(中立)として扱う(N-04: 縁は正常系)。

export const MA_RADIUS = 7;

const clean = (v: number) => (Number.isFinite(v) ? v : 0);

export function movingAverage(xs: readonly number[]): number[] {
  const n = xs.length;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const lo = Math.max(0, i - MA_RADIUS);
    const hi = Math.min(n, i + MA_RADIUS + 1);
    let acc = 0;
    for (let j = lo; j < hi; j++) acc += clean(xs[j]);
    out.push(acc / (hi - lo));
  }
  return out;
}

export type CurvePoint = { x: number; y: number; i: number };

export type Curve = { points: CurvePoint[] };

/** 極性 [-1,1] → y [1,0](上が正)。x は [0,1]。maxPoints 超は等分ビン平均で縮約 */
export function buildCurve(ps: readonly number[], maxPoints: number): Curve {
  const n = ps.length;
  if (n === 0) return { points: [] };
  const bins = Math.min(n, Math.max(1, maxPoints));
  const points: CurvePoint[] = [];
  for (let b = 0; b < bins; b++) {
    const lo = Math.floor((b * n) / bins);
    const hi = Math.max(lo + 1, Math.floor(((b + 1) * n) / bins));
    let acc = 0;
    for (let j = lo; j < hi; j++) acc += clean(ps[j]);
    const v = acc / (hi - lo);
    points.push({
      x: bins === 1 ? 0 : b / (bins - 1),
      y: (1 - Math.max(-1, Math.min(1, v))) / 2,
      i: lo,
    });
  }
  return { points };
}

/** 曲線上の x ∈ [0,1] を行番号へ写す(T-111) */
export function xToIndex(x: number, nLines: number): number {
  if (nLines <= 0 || !Number.isFinite(x)) return 0;
  const c = Math.max(0, Math.min(1, x));
  return Math.min(nLines - 1, Math.round(c * (nLines - 1)));
}
