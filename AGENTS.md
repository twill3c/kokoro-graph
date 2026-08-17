# AGENTS.md — kokoro-graph

青空文庫 300 作品の行単位感情分析ビューア。分析は開発時 Python で前計算し、web は静的ビューア。
正しさの正本は pytest(逐語性・分割・スコア・起伏度の数理ゲート)+ vitest + verify.mjs。
仕様は SPEC.md、テストは TEST_SPEC.md。

## 1. 技術構成

- pipeline/(Python 3.12): 索引照合・本文取得(bronze・手動のみ)・正規化・行分割・スコアリング・gold 生成。fugashi + unidic-lite
- dict/kokoro_dict.json: 自前感情辞書(version 必須・変更は感度分析付き)
- web/(Next.js 15 App Router 静的 export + React 19 + vitest): gold JSON の可視化のみ。実行時分析なし
- bronze(data/bronze/)はコミットしない。gold(web/public/data/)はコミットする

## 2. looplog 運用の注意

- 新しいイベント種別を初めて使う前に `harness/looplog.py` の EVENT_SPECS を確認する。推測で組み立てない。
- `test_run` の passed / failed は直前のテスト出力の数値をそのまま転記し、実行と記録は別コマンドで行う(HC-002)。
- enum フィールドの許容値は `schema/taxonomy.json` と looplog.py の ENUMS が正(HC-002)。

## 3. 品質ゲート(完了条件)

- Python: `python -m pytest -q tests/` 全緑(G-01〜G-05)
- web: `node scripts/verify.mjs` green(lint / type / test+coverage / build の 4 ゲート)
- ゲートを緩める変更(閾値引き下げ・テスト削除/skip・eslint-disable 追加・G-xx の較正証拠なし変更)は人間の承認なしに行わない
- 起伏度の定義・辞書の版は SPEC §2 が正。テストは実装から転記しない

## 4. アーキテクチャ規約

- 青空文庫へのネットワークアクセスは手動コマンド(`python -m pipeline.fetch_*`)のみ・間隔 ≥0.7s(N-02)。
  テストは全てフィクスチャ駆動でネットワーク不要
- 正規化は逐語(除去以外の文字改変ゼロ)。行テキストの手直し・要約・言い換えは絶対にしない
- 辞書変更は「version 更新 + 感度分析レポート」をセットで(F-04)。スコア済み gold と辞書 version の不整合を作らない
- web の純粋コア(src/core)は DOM 非依存。document/window/canvas は useEffect 内のみ(HC-002)。
  非有限値・空配列は正常系として仕様化しテストする
- 状態リセットは keyed remount(key={work.id})を第一選択にする

## 5. 変更禁止領域

- `logs/loops/*.jsonl` — append-only(LL-00a)。訂正は correction イベントで
- AGENTS.md 末尾の scaffold ブロックと `.scaffold/manifest.json` — scaffold-kit 管理
- `.wt/gate.json` の上限値 — 変更はレジストリ経由
- `data/bronze/` の中身を手で編集しない(取得物は原本のまま)

## 6. よく使うコマンド

```bash
python -m pipeline.fetch_index      # 青空文庫 索引 CSV 取得(手動のみ)
python -m pipeline.match            # selection.tsv と索引の照合 → catalog.json + レポート
python -m pipeline.fetch_bronze     # 本文 zip 取得(手動のみ・レート制御)
python -m pipeline.build_corpus     # 正規化・分割・字数計測 → corpus_manifest.json
python -m pipeline.score            # スコアリング + 起伏度 + gold 生成
python -m pytest -q tests/          # Python 側ゲート

cd web && npm run dev               # 開発サーバ
node scripts/verify.mjs             # web 側 4 ゲート(web/ で実行)

python harness/looplog.py append --loop loop_XXX --event ... --data ...
python harness/looplog.py validate
```

<!-- scaffold:block agents_core v1.8.0 -->
## 共通規律(scaffold 管理領域 — 手動編集禁止)

このセクションはスキャフォールド・レジストリが管理する。内容を変更したい場合は、
このファイルを直接編集せず、失敗ログ → HARNESS_CHANGELOG 起票 → レジストリ改訂 → `scaffoldctl update` の経路で行うこと。

### 7 段階ループプロトコル

| 段階 | 名称 | 完了条件 |
|---|---|---|
| 1 | 計画 | 対象の要求 ID を特定し、`loop_start` を記録した |
| 2 | 文脈読込 | SPEC.md / IMPLEMENTATION_GUIDE.md の該当箇所と、直近ループのログを読んだ |
| 3 | テスト先行 | TEST_SPEC.md にトレースする失敗するテストを書き、赤を確認した |
| 4 | 実装 | ファイル編集 2 回ごとにテストを実行し、赤のまま次の編集に進んでいない |
| 5 | 検証 | 全テスト合格 + 独立再計算(該当時)を確認した |
| 6 | 文書同期 | SPEC/docs と実装の乖離(SPEC-DRIFT)を解消し、生成ドキュメントを再生成した |
| 7 | 完了 | `loop_end` を記録し、ループログ validate に合格し、専用コミットを積んだ |

### ループ可観測性

全ループは loop-observability の規律(LOOP_LOG_SPEC / FAILURE_TAXONOMY)に従い
`logs/loops/{loop_id}.jsonl` に記録する。失敗は気づいた瞬間に分類コード付きで記録する。
ツーストライク(LL-10)と S1 即時起票(LL-12)は本プロジェクトでも有効である。

### エスカレーション規範

以下の場合は作業を止め、`escalation` を記録してから人間に確認する:
仕様の複数解釈(SPEC-AMB 相当)/ スコープ外ファイルへの変更が必要になった /
破壊的操作(履歴改変・データ削除・強制 push)/ 同種の修正の 3 回目の失敗(PROC-LOOP)。

### コミット規約

Conventional Commits(feat/fix/test/docs/refactor/chore)。スキャフォールド更新は
`chore: scaffold vX.Y.Z` の専用コミットで行い、機能変更と混ぜない。
<!-- /scaffold:block agents_core -->
