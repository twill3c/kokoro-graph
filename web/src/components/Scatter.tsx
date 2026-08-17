"use client";

// 起伏マップ散布図(F-08): x = 平均極性・y = 合成起伏度・大きさ = 行数・色 = 平均極性
import { useRouter } from "next/navigation";
import { useState } from "react";
import { polarityCss } from "@/core/color";
import type { WorkIndexEntry } from "@/core/types";

const W = 960;
const H = 560;
const PAD = 46;
const X_MIN = -0.35;
const X_MAX = 0.35;

const sx = (mean: number) => {
  const c = Math.max(X_MIN, Math.min(X_MAX, mean));
  return PAD + ((c - X_MIN) / (X_MAX - X_MIN)) * (W - PAD * 2);
};
const sy = (vol: number) => H - PAD - vol * (H - PAD * 2);
const radius = (n: number) => Math.max(3.5, Math.min(13, Math.sqrt(n) / 5));

export default function Scatter({ works }: { works: WorkIndexEntry[] }) {
  const router = useRouter();
  const [tip, setTip] = useState<{ x: number; y: number; w: WorkIndexEntry } | null>(null);

  return (
    <div className="scatter-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="起伏マップ: 平均極性 × 起伏度の散布図">
        <line x1={sx(0)} y1={PAD / 2} x2={sx(0)} y2={H - PAD} stroke="var(--border)" />
        <line x1={PAD} y1={H - PAD} x2={W - PAD / 2} y2={H - PAD} stroke="var(--border)" />
        <text className="axis-label" x={PAD} y={H - PAD + 26}>← 暗い(藍)</text>
        <text className="axis-label" x={W - PAD - 70} y={H - PAD + 26}>明るい(紅)→</text>
        <text className="axis-label" x={PAD - 36} y={PAD - 8}>激動 ↑</text>
        <text className="axis-label" x={PAD - 36} y={H - PAD - 6}>平静</text>
        {works.map((w) => (
          <circle
            key={w.id}
            className="dot"
            cx={sx(w.mean)}
            cy={sy(w.volatility)}
            r={radius(w.n_lines)}
            fill={polarityCss(w.mean * 3)}
            fillOpacity={0.82}
            stroke="rgba(0,0,0,0.4)"
            onClick={() => router.push(`/work/${w.id}/`)}
            onMouseEnter={(e) => setTip({ x: e.clientX, y: e.clientY, w })}
            onMouseMove={(e) => setTip({ x: e.clientX, y: e.clientY, w })}
            onMouseLeave={() => setTip(null)}
          />
        ))}
      </svg>
      {tip && (
        <div className="tip" style={{ left: tip.x + 14, top: tip.y + 14 }}>
          <strong>{tip.w.title}</strong> {tip.w.author}
          <br />
          起伏 {tip.w.volatility.toFixed(2)} ・ 平均 {tip.w.mean >= 0 ? "+" : ""}
          {tip.w.mean.toFixed(3)} ・ {tip.w.n_lines.toLocaleString()} 行
        </div>
      )}
    </div>
  );
}
