# T-040 / T-041 / T-050: コーパス完全性と gold 整合(SPEC G-05 / F-04)
# 生成済み成果物に対する検査(生成がまだなら skip ではなく fail が正 — 完了条件の一部)。
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "data" / "corpus_manifest.json"
INDEX = ROOT / "web" / "public" / "data" / "index.json"
WORKS_DIR = ROOT / "web" / "public" / "data" / "works"
DICT = ROOT / "dict" / "kokoro_dict.json"

CATEGORIES = {"joy", "anger", "sadness", "fear", "like", "surprise", "dislike", "calm"}


def test_t040_manifest():
    m = json.loads(MANIFEST.read_text(encoding="utf-8"))
    assert m["n_works"] == 300
    assert len(m["works"]) == 300
    assert all(w["chars"] <= m["max_chars"] for w in m["works"])
    assert all(e.get("reason") for e in m["excluded"])
    # id 重複なし
    ids = [w["id"] for w in m["works"]]
    assert len(ids) == len(set(ids))


def test_t041_gold_consistency():
    idx = json.loads(INDEX.read_text(encoding="utf-8"))
    assert idx["n_works"] == 300
    assert len(idx["works"]) == 300
    for e in idx["works"]:
        wp = WORKS_DIR / f"{e['id']}.json"
        assert wp.exists(), e["title"]
        w = json.loads(wp.read_text(encoding="utf-8"))
        assert len(w["lines"]) == e["n_lines"], e["title"]
        assert w["dict_version"] == idx["dict_version"]
        assert len(e["curve"]) == 64
        assert 0.0 <= e["hitrate"] <= 1.0
        assert 0.0 <= e["volatility"] <= 1.0


def test_t050_dict_schema():
    d = json.loads(DICT.read_text(encoding="utf-8"))
    assert d["version"]
    words = [e["w"] for e in d["entries"]]
    assert len(words) == len(set(words))
    for e in d["entries"]:
        assert -1.0 <= e["p"] <= 1.0
        assert e["c"] in CATEGORIES
