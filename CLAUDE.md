# CLAUDE.md

@AGENTS.md

上記ハーネスがこのリポジトリの正本ルール。要点のみ再掲する:

- 仕様の正本は SPEC.md。変更は スペック → テスト → 実装 の順。
- すべてのタスクは 7 段階ループプロトコルで進め、`python harness/looplog.py append` で記録する。
  失敗は気づいた瞬間に分類コード付きで記録する。
- 完了条件: Python 側 `python -m pytest -q tests/` 全緑 + web 側 `node scripts/verify.mjs` green + `looplog.py validate` 合格。
- 青空文庫へのアクセスは手動コマンドのみ(N-02)。テストはフィクスチャ駆動・ネットワーク不要。
- 行テキストは逐語(F-02)。感情辞書は version 必須・変更は感度分析付き(F-04)。
- 起伏度の定義(F-06)が数理オラクル。テストは実装から転記せず SPEC から独立に手計算する。
- scaffold ブロック(AGENTS.md 末尾)と `.wt/gate.json` の上限は直接編集しない。
