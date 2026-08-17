"use client";

// 感情曲線(F-09): 生スコアの点 + 移動平均の線。クリックで本文へ、選択行をマーカー表示
import { useMemo } from "react";
import { polarityCss } from "@/core/color";
import { buildCurve, movingAverage, xToIndex } from "@/core/curve";
import type { Line } from "@/core/types";

const W = 960;
const H = 240;
const PAD = 14;

const px = (x: number) => PAD + x * (W - PAD * 2);
const py = (y: number) => PAD + y * (H - PAD * 2);

export default function CurvePanel({
  lines,
  selected,
  onSelect,
}: {
  lines: Line[];
  selected: number;
  onSelect: (i: number) => void;
}) {
  const ps = useMemo(() => lines.map((l) => l.p), [lines]);
  const raw = useMemo(() => buildCurve(ps, 600), [ps]);
  const smooth = useMemo(() => buildCurve(movingAverage(ps), 600), [ps]);

  const path = useMemo(
    () =>
      smooth.points
        .map((p, i) => `${i === 0 ? "M" : "L"}${px(p.x).toFixed(1)},${py(p.y).toFixed(1)}`)
        .join(""),
    [smooth],
  );

  const selX = lines.length > 1 ? selected / (lines.length - 1) : 0;

  return (
    <div className="curve-wrap">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="感情曲線(横 = 物語の進行・縦 = 極性)"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * W;
          onSelect(xToIndex((x - PAD) / (W - PAD * 2), lines.length));
        }}
      >
        <line x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} stroke="var(--border)" strokeDasharray="4 4" />
        {raw.points.map((p) => (
          <circle
            key={p.i}
            cx={px(p.x)}
            cy={py(p.y)}
            r={1.6}
            fill={polarityCss((0.5 - p.y) * 6)}
            fillOpacity={0.55}
          />
        ))}
        <path d={path} fill="none" stroke="var(--gold)" strokeWidth={2} strokeOpacity={0.9} />
        <line x1={px(selX)} y1={PAD} x2={px(selX)} y2={H - PAD} stroke="var(--fg)" strokeOpacity={0.6} />
      </svg>
      <p className="curve-hint">点 = 行の生スコア ・ 金線 = 移動平均 ・ クリックでその場面の本文へ</p>
    </div>
  );
}
