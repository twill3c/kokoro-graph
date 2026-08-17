// T-110 / T-111 / T-130: 感情曲線の描画データ(SPEC F-09)
// 移動平均は Python 側(pipeline/metrics.py MA_RADIUS=7)と同一定義 — 言語間一致の砦
import { describe, expect, it } from "vitest";
import { buildCurve, movingAverage, xToIndex } from "../curve";

describe("T-110 movingAverage(半径 7・端は縮小窓)", () => {
  it("短い列は全要素平均に一致する(Python 実装と同値)", () => {
    expect(movingAverage([0, 1, -1, 0.5])).toEqual([0.125, 0.125, 0.125, 0.125]);
    expect(movingAverage([1, 2, 3])).toEqual([2, 2, 2]);
    expect(movingAverage([])).toEqual([]);
  });

  it("長さ 16 の符号反転列の端(手計算: 縮小窓)", () => {
    const xs = [...Array(8).fill(1), ...Array(8).fill(-1)];
    const ma = movingAverage(xs);
    expect(ma[0]).toBeCloseTo(1.0, 9); // 窓 = xs[0..7] は全て +1
    expect(ma[7]).toBeCloseTo(1 / 15, 9); // 窓 = xs[0..14](+8 −7)
    expect(ma[8]).toBeCloseTo(-1 / 15, 9); // 窓 = xs[1..15](+7 −8)
    expect(ma[15]).toBeCloseTo(-1.0, 9);
  });
});

describe("T-110 buildCurve", () => {
  it("点列を [0,1]×[0,1] に正規化した座標列を返す(y は −1..+1 を 1..0 へ)", () => {
    const c = buildCurve([-1, 0, 1], 3);
    expect(c.points).toHaveLength(3);
    expect(c.points[0]).toEqual({ x: 0, y: 1, i: 0 });
    expect(c.points[1]).toEqual({ x: 0.5, y: 0.5, i: 1 });
    expect(c.points[2]).toEqual({ x: 1, y: 0, i: 2 });
  });

  it("最大点数を超える列は等分ビン平均で縮約し、i は代表行番号を指す", () => {
    const xs = Array.from({ length: 100 }, (_, i) => (i < 50 ? -1 : 1));
    const c = buildCurve(xs, 10);
    expect(c.points).toHaveLength(10);
    expect(c.points[0].i).toBe(0);
    expect(c.points[9].i).toBe(90);
    expect(c.points[0].y).toBe(1); // −1 → 下端(y=1)
    expect(c.points[9].y).toBe(0);
  });

  it("縁: 空列・1 点列・非有限値でも破綻しない(T-130)", () => {
    expect(buildCurve([], 10).points).toEqual([]);
    const single = buildCurve([0.5], 10);
    expect(single.points).toHaveLength(1);
    expect(single.points[0]).toEqual({ x: 0, y: 0.25, i: 0 });
    const withNaN = buildCurve([Number.NaN, 1], 10);
    expect(withNaN.points[0].y).toBe(0.5); // NaN は 0(中立)扱い
  });
});

describe("T-111 xToIndex(曲線クリック位置 → 行番号)", () => {
  it("x∈[0,1] を行番号に往復できる", () => {
    expect(xToIndex(0, 200)).toBe(0);
    expect(xToIndex(1, 200)).toBe(199);
    expect(xToIndex(0.5, 200)).toBe(100);
    expect(xToIndex(0.5, 0)).toBe(0);
    expect(xToIndex(Number.NaN, 200)).toBe(0);
  });
});
