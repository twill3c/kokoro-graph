"use client";

// 感情バーコード 1 枚(F-08)。canvas 描画は useEffect 内のみ(HC-002)
import Link from "next/link";
import { useEffect, useRef } from "react";
import { polarityCss } from "@/core/color";
import type { WorkIndexEntry } from "@/core/types";

export default function BarcodeCard({ work }: { work: WorkIndexEntry }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const n = work.curve.length || 1;
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = polarityCss((work.curve[i] ?? 0) * 3); // 平滑化で振幅が縮むぶん彩度を上げる
      ctx.fillRect((i * w) / n, 0, w / n + 1, h);
    }
  }, [work]);

  return (
    <Link className="card" href={`/work/${work.id}/`}>
      <canvas ref={ref} width={256} height={34} aria-label={`${work.title} の感情バーコード`} />
      <div className="t">
        {work.title} <span style={{ color: "var(--muted)", fontSize: "0.78em" }}>{work.author}</span>
      </div>
      <div className="meta">
        <span className="vol">起伏 {work.volatility.toFixed(2)}</span>
        <span>{work.n_lines.toLocaleString()} 行</span>
        <span>{work.category}</span>
        {work.hitrate < 0.15 && <span className="low-hit">計測薄</span>}
      </div>
    </Link>
  );
}
