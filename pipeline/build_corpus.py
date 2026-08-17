"""正規化・行分割・字数計測 → 300 作品の確定(SPEC F-01/F-02/F-03)。

- main を selection 順に評価: bronze 欠落 → excluded(no_bronze)、
  正規化後字数 > MAX_CHARS → excluded(over_length)
- 不足分は pool を上から採用(同基準で検査)
- 出力: data/corpus_manifest.json(works ちょうど 300 + excluded 全記録)
        data/lines/{work_id}.json(行配列・中間生成物)
"""

from __future__ import annotations

import json

from .normalize import normalize_text
from .paths import BRONZE, CATALOG, LINES_DIR, MANIFEST
from .split import split_sentences

MAX_CHARS = 200_000
TARGET = 300


def measure(c: dict) -> dict | None:
    path = BRONZE / f"{c['work_id']}.txt"
    if not path.exists():
        return None
    body, meta = normalize_text(path.read_text(encoding="utf-8"))
    lines = split_sentences(body)
    chars = sum(len(s) for s in lines)
    return {"body_meta": meta, "lines": lines, "chars": chars}


def main() -> None:
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    mains = [c for c in catalog if c["kind"] == "main"]
    pools = [c for c in catalog if c["kind"] == "pool"]
    LINES_DIR.mkdir(parents=True, exist_ok=True)

    works, excluded = [], []

    def consider(c: dict, promoted: bool) -> bool:
        m = measure(c)
        if m is None:
            excluded.append({"author": c["author"], "title": c["title"], "reason": "no_bronze"})
            return False
        if m["chars"] > MAX_CHARS:
            excluded.append({
                "author": c["author"], "title": c["title"],
                "reason": "over_length", "chars": m["chars"],
            })
            return False
        entry = {
            "id": c["work_id"],
            "author": c["author"],
            "title": c["title"],
            "category": c["category"],
            "kana_type": c["kana_type"],
            "card_url": c["card_url"],
            "teihon": m["body_meta"]["teihon"] or c.get("teihon_1", ""),
            "chars": m["chars"],
            "n_lines": len(m["lines"]),
            "promoted": promoted,
        }
        works.append(entry)
        (LINES_DIR / f"{c['work_id']}.json").write_text(
            json.dumps(m["lines"], ensure_ascii=False), encoding="utf-8")
        return True

    for c in mains:
        if len(works) >= TARGET:
            break
        consider(c, promoted=False)
    pool_iter = iter(pools)
    while len(works) < TARGET:
        c = next(pool_iter, None)
        if c is None:
            break
        consider(c, promoted=True)

    manifest = {
        "target": TARGET,
        "max_chars": MAX_CHARS,
        "works": works,
        "excluded": excluded,
        "n_works": len(works),
        "n_promoted": sum(1 for w in works if w["promoted"]),
    }
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"確定 {len(works)} 作品(補充 {manifest['n_promoted']})/ 除外 {len(excluded)} 件")
    for e in excluded:
        print(f"- 除外: {e['author']}『{e['title']}』 {e['reason']} {e.get('chars', '')}")
    if len(works) != TARGET:
        print(f"!! 300 に満たない({len(works)})— プール追加が必要")


if __name__ == "__main__":
    main()
