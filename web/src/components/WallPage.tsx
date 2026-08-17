"use client";

// 一覧画面(F-08): 感情バーコード壁 / 起伏マップ + 並べ替え・フィルタ
import { useEffect, useMemo, useState } from "react";
import { filterWorks, sortWorks } from "@/core/sortfilter";
import type { SortKey, WorkIndexEntry, WorksIndex } from "@/core/types";
import { dataUrl } from "@/lib/basePath";
import BarcodeCard from "./BarcodeCard";
import Footer from "./Footer";
import Scatter from "./Scatter";

const SORTS: { key: SortKey; dir: "asc" | "desc"; label: string }[] = [
  { key: "volatility", dir: "desc", label: "起伏が激しい順" },
  { key: "volatility", dir: "asc", label: "穏やかな順" },
  { key: "mean", dir: "desc", label: "明るい順" },
  { key: "mean", dir: "asc", label: "暗い順" },
  { key: "n_lines", dir: "asc", label: "短い順" },
  { key: "author", dir: "asc", label: "作者順" },
];

export default function WallPage() {
  const [index, setIndex] = useState<WorksIndex | null>(null);
  const [mode, setMode] = useState<"wall" | "map">("wall");
  const [sortIdx, setSortIdx] = useState(0);
  const [cats, setCats] = useState<string[]>([]);
  const [minVol, setMinVol] = useState(0);
  const [maxVol, setMaxVol] = useState(1);

  useEffect(() => {
    fetch(dataUrl("index.json"))
      .then((r) => r.json())
      .then(setIndex)
      .catch(() => setIndex(null));
  }, []);

  const categories = useMemo(
    () => (index ? [...new Set(index.works.map((w) => w.category))] : []),
    [index],
  );

  const shown = useMemo(() => {
    if (!index) return [];
    const f = filterWorks(index.works, { categories: cats, minVol, maxVol });
    const s = SORTS[sortIdx];
    return sortWorks(f, s.key, s.dir);
  }, [index, cats, minVol, maxVol, sortIdx]);

  const toggleCat = (c: string) =>
    setCats((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]));

  return (
    <main className="hall">
      <header className="masthead">
        <p className="eyebrow">青空文庫 300 作品 × 行単位感情分析</p>
        <h1>こころグラフ</h1>
        <p className="lede">
          一本のバーコードが一つの物語。縞の色は本文の感情の色(藍 = 陰・紅 = 陽)、
          その乱れが感情の起伏です。気になる一本を選ぶと、感情曲線と本文を並べて読めます。
        </p>
        <span className="legend">
          <span>藍(悲・怖・怒)</span>
          <span className="bar" />
          <span>紅(喜・好)</span>
        </span>
      </header>

      <div className="controls">
        <div className="row">
          <span className="seg" role="group" aria-label="表示切替">
            <button className={mode === "wall" ? "on" : ""} onClick={() => setMode("wall")}>
              バーコードの壁
            </button>
            <button className={mode === "map" ? "on" : ""} onClick={() => setMode("map")}>
              起伏マップ
            </button>
          </span>
          <span className="label">並べ替え</span>
          <select value={sortIdx} onChange={(e) => setSortIdx(Number(e.target.value))}>
            {SORTS.map((s, i) => (
              <option key={s.label} value={i}>
                {s.label}
              </option>
            ))}
          </select>
          <span className="rangebox">
            起伏度 {minVol.toFixed(2)}
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={minVol}
              onChange={(e) => setMinVol(Math.min(Number(e.target.value), maxVol))}
              aria-label="起伏度の下限"
            />
            〜 {maxVol.toFixed(2)}
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={maxVol}
              onChange={(e) => setMaxVol(Math.max(Number(e.target.value), minVol))}
              aria-label="起伏度の上限"
            />
          </span>
          <span className="count">{index ? `${shown.length} / ${index.n_works} 作品` : ""}</span>
        </div>
        <div className="row chips">
          {categories.map((c) => (
            <button key={c} className={`chip ${cats.includes(c) ? "on" : ""}`} onClick={() => toggleCat(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {!index && <p className="loading">読み込み中…</p>}
      {index && mode === "wall" && (
        <div className="wall">
          {shown.map((w) => (
            <BarcodeCard key={w.id} work={w} />
          ))}
        </div>
      )}
      {index && mode === "map" && <Scatter works={shown} />}

      <Footer />
    </main>
  );
}
