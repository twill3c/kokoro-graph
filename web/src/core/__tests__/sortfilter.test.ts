// T-101: 並べ替え・フィルタの純関数
import { describe, expect, it } from "vitest";
import type { WorkIndexEntry } from "../types";
import { filterWorks, sortWorks } from "../sortfilter";

const mk = (over: Partial<WorkIndexEntry>): WorkIndexEntry => ({
  id: "0", author: "作者", title: "題", category: "芥川", kana_type: "新字新仮名",
  chars: 1000, n_lines: 100, hitrate: 0.3, mean: 0, roughness: 0, sd: 0,
  range: 0, flips100: 0, volatility: 0.5, curve: [], ...over,
});

const A = mk({ id: "1", title: "い", author: "あ", volatility: 0.9, mean: -0.2, n_lines: 50, category: "太宰" });
const B = mk({ id: "2", title: "ろ", author: "い", volatility: 0.1, mean: 0.3, n_lines: 500, category: "芥川" });
const C = mk({ id: "3", title: "は", author: "う", volatility: 0.5, mean: 0.0, n_lines: 200, category: "太宰" });

describe("T-101 sortWorks", () => {
  it("起伏度降順(既定)", () => {
    expect(sortWorks([B, A, C], "volatility", "desc").map((w) => w.id)).toEqual(["1", "3", "2"]);
  });
  it("平均極性昇順", () => {
    expect(sortWorks([A, B, C], "mean", "asc").map((w) => w.id)).toEqual(["1", "3", "2"]);
  });
  it("作者はロケール順・元配列を破壊しない", () => {
    const src = [C, B, A];
    const out = sortWorks(src, "author", "asc");
    expect(out.map((w) => w.author)).toEqual(["あ", "い", "う"]);
    expect(src.map((w) => w.id)).toEqual(["3", "2", "1"]);
  });
});

describe("T-101 filterWorks", () => {
  it("カテゴリ選択(空 = 全通し)と起伏度レンジの積", () => {
    const all = [A, B, C];
    expect(filterWorks(all, { categories: [], minVol: 0, maxVol: 1 })).toHaveLength(3);
    expect(filterWorks(all, { categories: ["太宰"], minVol: 0, maxVol: 1 }).map((w) => w.id)).toEqual(["1", "3"]);
    expect(filterWorks(all, { categories: [], minVol: 0.4, maxVol: 1 }).map((w) => w.id)).toEqual(["1", "3"]);
    expect(filterWorks(all, { categories: ["芥川"], minVol: 0.4, maxVol: 1 })).toHaveLength(0);
  });
});
