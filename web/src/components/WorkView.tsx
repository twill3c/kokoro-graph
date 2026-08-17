"use client";

// 作品詳細(F-09): 感情曲線 × 本文リーダーの双方向シンクロ
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { polarityColor } from "@/core/color";
import { segmentLine } from "@/core/segment";
import type { WorkDetail } from "@/core/types";
import { dataUrl } from "@/lib/basePath";
import CurvePanel from "./CurvePanel";
import Footer from "./Footer";

export default function WorkView({ id }: { id: string }) {
  const [work, setWork] = useState<WorkDetail | null>(null);
  const [selected, setSelected] = useState(0);
  const [failed, setFailed] = useState(false);
  const readerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(dataUrl(`works/${id}.json`))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(setWork)
      .catch(() => setFailed(true));
  }, [id]);

  useEffect(() => {
    const el = readerRef.current?.querySelector(`[data-line="${selected}"]`);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [selected]);

  if (failed) return <main className="hall"><p className="loading">読み込みに失敗しました。</p></main>;
  if (!work) return <main className="hall"><p className="loading">読み込み中…</p></main>;

  return (
    <main className="hall work-hall" key={work.id}>
      <nav className="crumbs">
        <Link href="/">← 壁へ戻る</Link>
      </nav>
      <header className="work-head">
        <h1>{work.title}</h1>
        <p className="work-author">{work.author}</p>
        <p className="work-meta">
          {work.category} ・ {work.lines.length.toLocaleString()} 行 ・ {work.kana_type} ・ 辞書 v{work.dict_version}
          {work.card_url && (
            <>
              {" ・ "}
              <a href={work.card_url} target="_blank" rel="noreferrer">
                青空文庫 図書カード
              </a>
            </>
          )}
        </p>
      </header>

      <CurvePanel lines={work.lines} selected={selected} onSelect={setSelected} />

      <div className="reader" ref={readerRef}>
        {work.lines.map((line, i) => {
          const [r, g, b] = polarityColor(line.p);
          const alpha = Math.min(0.4, Math.abs(line.p) * 0.45);
          return (
            <button
              key={i}
              type="button"
              data-line={i}
              className={`line ${i === selected ? "sel" : ""}`}
              style={{ background: `rgba(${r}, ${g}, ${b}, ${alpha})` }}
              onClick={() => setSelected(i)}
            >
              {segmentLine(line.t, line.h).map((seg, j) =>
                seg.hit === null ? (
                  <span key={j}>{seg.text}</span>
                ) : (
                  <mark key={j} className={line.h[seg.hit][1] >= 0 ? "hit-pos" : "hit-neg"} title={`${line.h[seg.hit][2]} ${line.h[seg.hit][1]}`}>
                    {seg.text}
                  </mark>
                ),
              )}
            </button>
          );
        })}
      </div>

      {work.teihon && <p className="teihon">{work.teihon}(青空文庫)</p>}
      <Footer />
    </main>
  );
}
