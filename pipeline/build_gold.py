"""gold 生成(SPEC F-07): 全 300 作品をスコアリングし web/public/data へ出力。

- works/{id}.json: 行テキスト・極性・ヒット語(答えの根拠を隠さない)
- index.json: メタ + 起伏度指標 + 64 点縮約曲線(一覧・散布図・バーコード用)
"""

from __future__ import annotations

import json

from .metrics import composite_volatility, moving_average, work_metrics
from .paths import LINES_DIR, MANIFEST, ROOT
from .score import Scorer

DICT_PATH = ROOT / "dict" / "kokoro_dict.json"
OUT_DIR = ROOT / "web" / "public" / "data"
CURVE_POINTS = 64


def downsample(xs: list[float], n: int) -> list[float]:
    """平滑化列を n 点に縮約(等分ビンの平均)。空は全零。"""
    if not xs:
        return [0.0] * n
    out = []
    for b in range(n):
        lo = int(b * len(xs) / n)
        hi = max(lo + 1, int((b + 1) * len(xs) / n))
        seg = xs[lo:hi]
        out.append(round(sum(seg) / len(seg), 4))
    return out


def main() -> None:
    dictionary = json.loads(DICT_PATH.read_text(encoding="utf-8"))
    scorer = Scorer(dictionary)
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    works = manifest["works"]

    (OUT_DIR / "works").mkdir(parents=True, exist_ok=True)
    all_metrics, index_entries = [], []

    for i, w in enumerate(works, 1):
        lines = json.loads((LINES_DIR / f"{w['id']}.json").read_text(encoding="utf-8"))
        scored = [scorer.score_line(s) for s in lines]
        ps = [s["p"] for s in scored]
        m = work_metrics(ps)
        all_metrics.append(m)

        (OUT_DIR / "works" / f"{w['id']}.json").write_text(json.dumps({
            "id": w["id"], "author": w["author"], "title": w["title"],
            "category": w["category"], "kana_type": w["kana_type"],
            "card_url": w["card_url"], "teihon": w["teihon"],
            "dict_version": scorer.version,
            "lines": [{"t": t, "p": s["p"], "h": s["h"]} for t, s in zip(lines, scored)],
        }, ensure_ascii=False), encoding="utf-8")

        hitrate = sum(1 for s in scored if s["h"]) / len(scored) if scored else 0.0
        index_entries.append({
            "id": w["id"], "author": w["author"], "title": w["title"],
            "category": w["category"], "kana_type": w["kana_type"],
            "chars": w["chars"], "n_lines": w["n_lines"], "hitrate": round(hitrate, 4),
            "mean": round(m["mean"], 4), "roughness": round(m["roughness"], 4),
            "sd": round(m["sd"], 4), "range": round(m["range"], 4),
            "flips100": round(m["flips100"], 4),
            "curve": downsample(moving_average(ps), CURVE_POINTS),
        })
        if i % 50 == 0:
            print(f"{i}/{len(works)}")

    for entry, comp in zip(index_entries, composite_volatility(all_metrics)):
        entry["volatility"] = round(comp, 4)

    (OUT_DIR / "index.json").write_text(json.dumps({
        "dict_version": scorer.version,
        "n_works": len(index_entries),
        "works": index_entries,
    }, ensure_ascii=False), encoding="utf-8")

    top = sorted(index_entries, key=lambda e: -e["volatility"])[:5]
    print("起伏度上位:", [f"{e['author']}『{e['title']}』{e['volatility']}" for e in top])
    print(f"→ {OUT_DIR}")


if __name__ == "__main__":
    main()
