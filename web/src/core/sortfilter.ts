// 一覧の並べ替え・フィルタ(SPEC F-08 / T-101)。純関数・入力を破壊しない。
import type { SortKey, WorkIndexEntry } from "./types";

export function sortWorks(
  works: readonly WorkIndexEntry[],
  key: SortKey,
  dir: "asc" | "desc",
): WorkIndexEntry[] {
  const sign = dir === "asc" ? 1 : -1;
  return [...works].sort((a, b) => {
    const cmp =
      key === "author" || key === "title"
        ? a[key].localeCompare(b[key], "ja")
        : a[key] - b[key];
    return cmp * sign;
  });
}

export type WorkFilter = {
  categories: readonly string[]; // 空 = 全通し
  minVol: number;
  maxVol: number;
};

export function filterWorks(
  works: readonly WorkIndexEntry[],
  f: WorkFilter,
): WorkIndexEntry[] {
  return works.filter(
    (w) =>
      (f.categories.length === 0 || f.categories.includes(w.category)) &&
      w.volatility >= f.minVol &&
      w.volatility <= f.maxVol,
  );
}
