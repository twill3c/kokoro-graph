// T-100: 極性 → 発散配色(−1 = 藍 / 0 = 生成り / +1 = 紅)の境界値
import { describe, expect, it } from "vitest";
import { NEG_RGB, NEU_RGB, POS_RGB, polarityColor, polarityCss } from "../color";

describe("T-100 polarityColor", () => {
  it("端点と中点が定義色に一致する", () => {
    expect(polarityColor(-1)).toEqual(NEG_RGB);
    expect(polarityColor(0)).toEqual(NEU_RGB);
    expect(polarityColor(1)).toEqual(POS_RGB);
  });

  it("中間は線形補間(−0.5 は藍と生成りの中点)", () => {
    const mid = polarityColor(-0.5);
    for (let i = 0; i < 3; i++) {
      expect(mid[i]).toBe(Math.round((NEG_RGB[i] + NEU_RGB[i]) / 2));
    }
  });

  it("範囲外・非有限値は正常系としてクランプ/中立化する", () => {
    expect(polarityColor(-9)).toEqual(NEG_RGB);
    expect(polarityColor(9)).toEqual(POS_RGB);
    expect(polarityColor(Number.NaN)).toEqual(NEU_RGB);
  });

  it("polarityCss は rgb() 文字列を返す", () => {
    expect(polarityCss(0)).toBe(`rgb(${NEU_RGB[0]}, ${NEU_RGB[1]}, ${NEU_RGB[2]})`);
  });
});
