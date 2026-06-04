前回の `# 8. 次分冊で定義する範囲` は予告セクションであるため、正式文書へ統合する際は、今回の **`# 8. Phase 3：Recall Engine`** に置き換え、次の予告を末尾の `# 9` として残してください。

Phase 3は、初期構想で定義されていた「docs、ADR、会話要約、記事メモから必要な情報を検索するフェーズ」を、Phase 2で具体化した **`Project × Agent × Task` によるContext Pack生成**へ接続する形で再定義しています。 

# 8. Phase 3：Recall Engine

## 副題：必要な記憶を呼び戻す

---

## 8.1 Phase概要

| 項目         | 内容                                                                         |
| ---------- | -------------------------------------------------------------------------- |
| Phase      | Phase 3                                                                    |
| 名称         | Recall Engine                                                              |
| 副題         | 必要な記憶を呼び戻す                                                                 |
| 主目的        | Phase 1で整備した正本文書および承認済み記憶を検索可能にし、Phase 2のContext Packへ関連情報を根拠付きで追加できるようにする |
| 実装レベル      | 検索対象定義、チャンク化、metadata管理、索引作成、意味検索、Context Builder連携                        |
| 主入力        | Phase 1正本文書、ADR、Phase 2 Registry、Context Pack検証結果、Phase 3入力要件              |
| 主出力        | Search Result Context、検索索引、検索ポリシー、Context Builder拡張、検証記録                   |
| 初期対象プロジェクト | Project Mnemosyne / ATS                                                    |
| 初期対象Agent  | `requirements_reviewer` / `implementation_reviewer`                        |
| 次Phaseとの接続 | Phase 4でAPI経由のContext取得およびMemory Search提供へ接続する                             |

---

## 8.2 Phase 3の位置づけ

Phase 1では、記憶として残す情報の構造、分類、状態、正本境界および更新ルールを定義した。

Phase 2では、対象プロジェクト、専門Agentおよび今回のTask Contextを指定し、あらかじめ決めた基本文書からContext Packを生成できる状態を作る。

しかし、プロジェクト文書や判断記録が増加すると、Phase 2の固定読み込みだけでは以下の問題が発生する。

* 関連する設計判断をすべて事前指定できない
* Agentごとに参照すべき追加文書が変わる
* 文書をすべて読み込むとContext Packが過大になる
* 過去の検証結果や会話要約から必要な情報を探しにくい
* 古い判断や置換済み情報を誤って混入させる可能性がある

Phase 3では、これらの課題に対し、**正本および承認済み記憶を検索可能な形へ変換し、今回のTaskに必要な関連情報だけを呼び戻す仕組み**を構築する。

```text
Phase 1：
何を記憶として残し、何を正とするかを決める

Phase 2：
必須文書から、Project × Agent × Task に応じた
基本Context Packを組み立てる

Phase 3：
基本Contextだけでは不足する関連記憶を検索し、
根拠付きでContext Packへ追加できるようにする
```

---

## 8.3 Phase 3の重要な設計整理

### 8.3.1 検索対象は「正本および承認済み記憶」とする

Recall Engineが初期段階で検索対象とするのは、正本または人間レビュー済みの記憶情報である。

Context PackやAI回答は、正本から生成された成果物または未反映の候補であり、原則として初期の検索正本には含めない。

| 情報種別                                       | Phase 3初期検索対象 | 扱い                      |
| ------------------------------------------ | ------------: | ----------------------- |
| `docs/memory/*.md`                         |            対象 | 共通方針・分類・参照ルール           |
| `docs/projects/{project_code}/memory/*.md` |            対象 | プロジェクト固有記憶の正本           |
| `docs/adr/*.md`                            |            対象 | 判断理由を含む正本               |
| プロジェクト設計docs                               |            対象 | Registryまたは検索設定で対象範囲を定義 |
| reviewed済みConversation Summary             |        条件付き対象 | 人間レビュー済みのみ              |
| reviewed済みTest Result / Review記録           |            対象 | 検証・レビュー根拠               |
| raw AI chat log                            |         原則対象外 | 未整理の一次メモ                |
| Context Pack                               |         原則対象外 | AI入力用生成物                |
| AI回答・修正案                                   |         原則対象外 | 正本反映前の候補                |
| Notion副本                                   |         初期対象外 | 正本との同期方針確定後に再判断         |

### 8.3.2 Search Resultは正本ではなくContext候補である

検索結果は、正本文書の関連箇所を再取得したものであり、新しい判断や記憶を生成するものではない。

```text
正本文書
  ↓
チャンク化・索引化
  ↓
検索
  ↓
Search Result Context
  ↓
Context Packへ組込み
  ↓
AIが参照して作業
```

検索結果から新しいDecision、Task、Issue等が生じた場合は、Phase 1で定義した記憶更新フローを通じて正本へ反映する。

### 8.3.3 Phase 3では検索を導入するが、正本更新は導入しない

Phase 3で導入するのは、正本を**読む・索引化する・検索する・Contextへ組み込む**機能である。

以下はPhase 3対象外とする。

* 検索結果を根拠とした正本の自動更新
* AI回答からのDecision自動登録
* 自動ADR作成および自動採用
* 自動Task登録
* 外部AIクライアントからの直接検索接続
* MCP経由の利用

---

## 8.4 Phase 3の目的

### 8.4.1 主目的

```text
Phase 1で定義した正本文書と承認済み記憶を検索可能にし、
Phase 2で生成するContext Packへ、
Project × Agent × Task に関連する追加情報を
根拠・状態・出典付きで組み込めるようにする。
```

### 8.4.2 具体目的

| ID         | 目的                                                          |
| ---------- | ----------------------------------------------------------- |
| P3-OBJ-001 | Recall Engineが検索対象とする正本・承認済み記憶の範囲を定義する                      |
| P3-OBJ-002 | 文書を検索可能な単位へ分割するチャンク化ルールを定義する                                |
| P3-OBJ-003 | 情報種別、状態、出典、更新日時等のmetadataを保持できるようにする                        |
| P3-OBJ-004 | 文書内容を索引化し、自然文クエリに対する関連記憶検索を可能にする                            |
| P3-OBJ-005 | `active / accepted` 情報を優先し、古い情報を無条件に主要Contextへ含めない検索制御を実現する |
| P3-OBJ-006 | ProjectおよびAgentに応じて検索対象範囲と結果の扱いを変更できるようにする                  |
| P3-OBJ-007 | 検索結果を根拠付きのSearch Result ContextとしてContext Packへ組み込めるようにする   |
| P3-OBJ-008 | 検索結果の出典、状態、関連度および警告を人間が確認できるようにする                           |
| P3-OBJ-009 | MnemosyneおよびATSで、固定読み込みでは不足した情報を検索により補えるか検証する               |
| P3-OBJ-010 | Phase 4でMemory Search APIを提供するための入出力要件を整理する                 |

---

## 8.5 Phase 3で解決する課題

| 課題ID       | 課題                             | Phase 3での解決内容                           |
| ---------- | ------------------------------ | --------------------------------------- |
| P3-ISS-001 | Phase 2の必須文書だけでは関連判断や詳細仕様が不足する | 正本文書群から関連箇所を検索してContextへ追加する            |
| P3-ISS-002 | 全文書をContext Packへ含めると長大化する     | 文書をチャンク化し、必要箇所だけを取得する                   |
| P3-ISS-003 | 文書量が増えると人手で参照先を選べない            | 自然文クエリに基づく意味検索を可能にする                    |
| P3-ISS-004 | 古い判断や廃止済み方針を誤参照する恐れがある         | statusおよび鮮度metadataによる除外・警告を行う          |
| P3-ISS-005 | Agentごとに必要な追加情報が異なる            | Agent Registryへ検索範囲または検索プロファイルを追加する     |
| P3-ISS-006 | 検索結果の根拠が不透明になる                 | source path、chunk位置、status、更新日時等を結果に含める |
| P3-ISS-007 | 検索導入により正本境界が曖昧になる              | 索引および検索結果を副本・生成物として明確化する                |
| P3-ISS-008 | API化の前に検索I/Oが定義されていない          | Phase 4へ渡す検索入出力仕様を整理する                  |

---

## 8.6 Phase 3の前提条件

| ID         | 前提条件                                                          |
| ---------- | ------------------------------------------------------------- |
| P3-PRE-001 | Phase 2が `Go` または `Conditional Go` と判定されていること                 |
| P3-PRE-002 | Context Pack標準構造およびContext組成ルールが定義されていること                     |
| P3-PRE-003 | Project Registryに `mnemosyne` および `ats` が登録されていること            |
| P3-PRE-004 | Agent Registryに初期検証用Agentが登録されていること                           |
| P3-PRE-005 | MnemosyneおよびATSでContext Pack生成検証が完了していること                     |
| P3-PRE-006 | `phase-3-input-requirements.md` に、固定読み込みで不足した情報取得要件が整理されていること |
| P3-PRE-007 | Phase 1で定義した情報状態および参照優先順位を検索時にも適用できること                        |
| P3-PRE-008 | 正本と索引・検索結果の境界を維持する方針が確認されていること                                |

---

## 8.7 Phase 3の対象範囲

### 8.7.1 対象に含めるもの

| 分類          | 対象内容                                                    |
| ----------- | ------------------------------------------------------- |
| 検索対象定義      | 索引化対象文書、除外対象文書、条件付き対象文書の定義                              |
| チャンク設計      | Markdown文書およびADRの分割ルール                                  |
| Metadata設計  | project、memory type、status、source path、updated date等の管理 |
| 索引作成        | 検索可能な記憶索引の生成                                            |
| 意味検索        | 自然文クエリを用いた関連文書チャンク取得                                    |
| 条件検索        | Project、Agent、status、source type等による絞り込み                |
| 鮮度制御        | superseded / deprecated / draft情報の除外または警告               |
| Agent連携     | Agent種別ごとの検索対象範囲および検索条件                                 |
| Context連携   | Search Result ContextとしてContext Packへ追加する方式             |
| Preview拡張   | 検索結果と選定理由を人間が確認する方式                                     |
| 検証          | MnemosyneおよびATSによる検索有効性検証                               |
| Phase 4入力整理 | API化に必要な検索入出力と権限境界の整理                                   |

### 8.7.2 対象に含めないもの

| 対象外                       | 理由                                      |
| ------------------------- | --------------------------------------- |
| Memory API                | Phase 4で扱うため                            |
| MCP Server                | Phase 5で扱うため                            |
| 外部AIクライアントからの直接検索         | APIおよびMCP整備後に扱うため                       |
| 正本文書の自動更新                 | 人間承認境界を維持するため                           |
| Conversation Summaryの自動承認 | 記憶化統制を崩さないため                            |
| Notion同期またはNotion検索       | 初期検索対象をMarkdown正本中心に限定するため              |
| Web UI                    | CLIおよびMarkdown出力で検索品質を確認した後に検討するため      |
| Agentの自律実行                | Recall EngineはContext補完機能であり、実行基盤ではないため |
| 大規模な権限・認証設計               | Phase 4以降の外部接続時に扱うため                    |

---

## 8.8 Phase 3の検索対象ポリシー

### 8.8.1 初期の索引対象

Phase 3初期では、以下を索引対象とする。

| 対象                       | source_type            |   初期対象 | 備考                            |
| ------------------------ | ---------------------- | -----: | ----------------------------- |
| 共通記憶方針文書                 | `memory_policy`        |     対象 | 全Project共通ルール                 |
| 記憶分類文書                   | `memory_taxonomy`      |     対象 | 分類・状態判断に利用                    |
| Context参照優先順位            | `context_priority`     |     対象 | 検索制御に利用                       |
| プロジェクト固有記憶               | `project_memory`       |     対象 | Project Contextの詳細根拠          |
| ADR                      | `adr`                  |     対象 | Decisionの根拠                   |
| Phase文書                  | `phase_document`       |     対象 | Phase目的・成果物・引継ぎ               |
| Review文書                 | `review_result`        |     対象 | レビュー済み記録                      |
| Test Result文書            | `test_result`          |     対象 | 検証根拠                          |
| プロジェクト設計docs             | `design_document`      | 条件付き対象 | Project Registryで指定           |
| 承認済みConversation Summary | `conversation_summary` | 条件付き対象 | `reviewed` または `reflected` のみ |

### 8.8.2 初期の索引対象外

| 対象                         | 対象外理由                     |
| -------------------------- | ------------------------- |
| 生のAIチャットログ                 | 仮説・感情・未整理情報が混在するため        |
| 未レビューのConversation Summary | 正本反映前の候補であるため             |
| Context Pack               | 正本から生成されるAI入力成果物であるため     |
| Context Preview            | 生成時の確認用成果物であるため           |
| AI回答全文                     | 正本反映前の候補であるため             |
| Notion副本                   | Markdown正本との同期保証が未定義であるため |
| `dist/` 配下の生成物             | 検索元ではなく出力結果であるため          |

### 8.8.3 状態による索引・検索制御

| status       |  索引登録 | 通常検索結果への表示 |  履歴検索時の表示 |
| ------------ | ----: | ---------: | --------: |
| `active`     |     可 |       表示対象 |      表示対象 |
| `accepted`   |     可 |       表示対象 |      表示対象 |
| `draft`      | 条件付き可 |       原則除外 | 明示指定時のみ表示 |
| `proposed`   | 条件付き可 |       原則除外 | 明示指定時のみ表示 |
| `superseded` |     可 |       原則除外 |      表示対象 |
| `deprecated` |     可 |       原則除外 |    警告付き表示 |
| `archived`   | 条件付き可 |       原則除外 | 明示指定時のみ表示 |

---

## 8.9 Phase 3機能要件

### P3-FR-001 検索対象管理

Recall Engineが索引化および検索対象とする文書範囲を、プロジェクト単位およびsource type単位で定義できること。

#### 必須管理内容

* 対象プロジェクト
* 索引対象ルート
* source type
* 初期索引対象か条件付き対象か
* 除外ルール
* statusによる表示制御
* Agent別追加検索対象

#### Project Registry拡張項目候補

| 項目                         | 内容                   |
| -------------------------- | -------------------- |
| `searchable_sources`       | 当該Projectで検索可能とする文書群 |
| `excluded_sources`         | 索引対象から除外する文書群        |
| `default_search_filters`   | 通常検索時に適用するstatus等の条件 |
| `reviewed_summary_sources` | 検索可能な承認済み会話要約の場所     |

#### 対応成果物

```text
docs/recall/search-source-policy.md
config/projects.yaml
```

---

### P3-FR-002 チャンク化ルール定義

索引対象文書を、意味を損なわず検索可能な単位へ分割できること。

#### チャンク化の基本原則

| 原則        | 内容                                               |
| --------- | ------------------------------------------------ |
| 見出し単位優先   | Markdown見出し構造を基本的な分割境界とする                        |
| 意味の完結性    | Decision、Constraint、Test Result等の意味が途中で切れないようにする |
| 出典保持      | 各chunkから元文書および見出し位置を追跡できるようにする                   |
| 過大chunk抑制 | 長大な章は小見出しまたは一定長で分割可能とする                          |
| 過小chunk抑制 | 意味を持たない短い断片は親見出しまたは隣接内容と結合する                     |
| 表形式対応     | ADR一覧、Task一覧、制約表等は行単位または論理ブロック単位で扱えるようにする        |

#### 文書種別ごとの分割方針

| 文書種別                  | 初期分割方針                                                    |
| --------------------- | --------------------------------------------------------- |
| `project-summary.md`  | セクション単位                                                   |
| `current-status.md`   | Current Objective / Completed / In Progress / Issues等の章単位 |
| `active-decisions.md` | 判断行または判断ブロック単位                                            |
| `next-actions.md`     | Task行または優先度ブロック単位                                         |
| ADR                   | Context / Decision / Reason / Consequences等の章単位           |
| Review文書              | 指摘事項または判定単位                                               |
| Test Result           | テストケースまたは検証結果単位                                           |
| Conversation Summary  | Fact / Decision / Task / Issue等の分類ブロック単位                  |

#### 対応成果物

```text
docs/recall/chunk-policy.md
```

---

### P3-FR-003 Metadata管理

各chunkについて、検索結果の評価、鮮度制御および根拠追跡に必要なmetadataを保持できること。

#### 必須metadata

| 項目                | 内容                                          |
| ----------------- | ------------------------------------------- |
| `chunk_id`        | chunkを識別する一意ID                              |
| `project_code`    | 対象プロジェクト                                    |
| `source_type`     | ADR、project memory、review等の情報種別             |
| `source_path`     | 元文書の保存先                                     |
| `section_heading` | 元文書内の見出し                                    |
| `chunk_index`     | 元文書内の順序                                     |
| `chunk_text`      | 検索対象テキスト                                    |
| `memory_type`     | fact / decision / task / issue等。判断可能な場合のみ設定 |
| `status`          | active / accepted / superseded等             |
| `updated_at`      | 文書または記憶情報の更新日時                              |
| `content_hash`    | 内容変更を検出するための値                               |
| `indexed_at`      | 索引化した日時                                     |
| `source_priority` | 参照優先順位判定に利用する区分                             |
| `related_adr`     | 関連ADRが存在する場合の参照                             |

#### 任意metadata候補

| 項目                 | 用途                         |
| ------------------ | -------------------------- |
| `phase`            | Phase固有文書の絞り込み             |
| `agent_scope`      | 特定Agentで優先する情報             |
| `tags`             | 補助的な検索絞り込み                 |
| `superseded_by`    | 置換先情報へのリンク                 |
| `review_status`    | Conversation Summary等の承認状態 |
| `document_version` | バージョン追跡が必要な場合              |

#### 対応成果物

```text
docs/recall/metadata-spec.md
```

---

### P3-FR-004 索引作成

索引対象文書を読み込み、チャンク化し、検索に利用できる索引を生成できること。

#### 基本処理

```text
Projectを指定
  ↓
Project Registryからsearchable_sourcesを取得
  ↓
対象文書を読み込む
  ↓
対象外・未承認・生成物を除外する
  ↓
Markdown構造に基づきチャンク化する
  ↓
metadataを付与する
  ↓
content_hashで変更を判定する
  ↓
Embeddingまたは検索索引を生成する
  ↓
索引状態を記録する
```

#### CLI利用例

```bash
npm run memory:index -- --project mnemosyne
```

```bash
npm run memory:index -- --project ats
```

```bash
npm run memory:index -- --project ats --rebuild
```

#### 必須機能

* Project単位で索引作成できること
* 再索引時に変更された文書を判別できること
* 削除または対象外となった文書を検索結果から除外できること
* 索引作成結果をログまたはMarkdownレポートとして確認できること
* 正本文書を変更しないこと

#### 対応成果物

```text
scripts/memory-index.ts
docs/recall/index-build-rule.md
```

---

### P3-FR-005 意味検索

自然文によるクエリを用いて、対象プロジェクトの記憶から意味的に関連するchunkを取得できること。

#### 入力項目

| 項目                | 内容                                 |
| ----------------- | ---------------------------------- |
| `project_code`    | 検索対象プロジェクト                         |
| `query`           | 検索したい自然文またはキーワード                   |
| `agent_code`      | Agent別の検索範囲調整に使用。任意指定              |
| `source_types`    | 対象文書種別の絞り込み。任意指定                   |
| `memory_types`    | decision / test_result等の絞り込み。任意指定  |
| `statuses`        | 通常はactive / acceptedを基本とする         |
| `top_k`           | 取得件数                               |
| `include_history` | superseded / deprecated等を検索する場合の指定 |

#### CLI利用例

```bash
npm run memory:search -- \
  --project ats \
  --agent implementation_reviewer \
  --query "action_select のトランザクション境界と冪等性の判断"
```

```bash
npm run memory:search -- \
  --project mnemosyne \
  --agent requirements_reviewer \
  --query "Phase 2でContext Packをどのように生成すると決めたか"
```

#### 通常検索の基本動作

* `active` および `accepted` 情報を優先する。
* `superseded`、`deprecated`、`archived` は通常検索から除外する。
* `draft`、`proposed` は明示指定がない限り主要結果へ含めない。
* 結果には必ず出典および状態を含める。
* 検索結果が不足する場合は、不足していることを明示する。

#### 対応成果物

```text
scripts/memory-search.ts
docs/recall/search-policy.md
```

---

### P3-FR-006 検索方式および検索品質管理

関連記憶を検索するため、意味検索を実現できること。

検索方式の詳細技術選定は設計仕様書で確定するが、Phase 3要件として以下の能力を求める。

#### 必須能力

| 能力                   | 内容                                |
| -------------------- | --------------------------------- |
| Semantic Retrieval   | 自然文で意味的に近いchunkを取得できる             |
| Metadata Filtering   | project、source type、status等で絞り込める |
| Status-aware Ranking | active / accepted情報を優先できる         |
| Source Traceability  | 検索結果の出典を提示できる                     |
| Re-indexing          | 正本文書更新後に索引を更新できる                  |

#### 検討候補

| 検索方式                      | Phase 3での扱い           |
| ------------------------- | --------------------- |
| Embedding + Vector Search | 意味検索の基本候補             |
| Keyword Search            | 補助検索または比較検証候補         |
| Hybrid Search             | 意味検索だけで不足する場合の改善候補    |
| PostgreSQL + pgvector     | 将来の実装候補。要件定義時点では確定しない |
| 外部Vector Store            | 将来比較候補。初期要件では確定しない    |

#### 品質確認観点

* 関連するADRが上位結果へ出るか
* unrelatedな文書が大量に混入しないか
* `deprecated` 情報が通常検索で誤って優先されないか
* Agentに応じて必要な情報が取得できるか
* Context Packに追加する価値のある結果か

---

### P3-FR-007 鮮度および状態制御

検索結果について、情報状態と更新時点を考慮した表示制御ができること。

#### 必須制御

| 条件                      | 処理                          |
| ----------------------- | --------------------------- |
| `active` または `accepted` | 通常検索の主要候補として扱う              |
| `superseded`            | 通常検索では除外し、履歴比較指定時のみ表示する     |
| `deprecated`            | 通常検索では除外し、必要時のみ警告付きで表示する    |
| `draft` または `proposed`  | 明示的に未確定情報を求めた場合のみ表示する       |
| `archived`              | 履歴確認または過去検証確認時のみ表示する        |
| 同一論点で新旧情報が存在する          | 新しいactive情報を優先し、旧情報の置換関係を示す |

#### Staleness警告

以下の場合は、検索結果またはSearch Previewに警告を表示できること。

* statusが不明である
* updated dateが不明である
* 同一論点について複数の有効候補が存在する
* ADRとproject memoryの記載が一致しない
* 検索対象文書がPhase 1またはPhase 2以降に更新されていない

#### 対応成果物

```text
docs/recall/staleness-policy.md
```

---

### P3-FR-008 Agent-aware Retrieval

選択されたAgentに応じて、検索対象、検索優先度および追加Contextの扱いを調整できること。

#### Agent Registry拡張項目候補

| 項目                        | 内容                   |
| ------------------------- | -------------------- |
| `search_profile`          | Agentが利用する検索方針       |
| `preferred_source_types`  | 優先する文書種別             |
| `required_search_queries` | Context生成時に実行すべき基本検索 |
| `excluded_source_types`   | 原則参照しない情報            |
| `result_limit`            | Contextへ組み込む検索結果の上限  |
| `history_policy`          | 過去判断を参照する必要性         |

#### 初期Agentごとの検索対象例

| Agent                     | 優先する検索対象                        | 用途            |
| ------------------------- | ------------------------------- | ------------- |
| `requirements_reviewer`   | 要件定義、Phase文書、ADR、review結果       | 要件齟齬・未反映判断の確認 |
| `implementation_reviewer` | 設計docs、ADR、test result、実装レビュー記録 | 実装と設計判断の整合確認  |

#### 要件

* 同一ProjectでもAgentによって検索対象優先度を変えられること。
* 同一AgentでもProjectを切り替えれば検索対象データを切り替えられること。
* Agentによる検索結果選定理由を確認できること。

#### 対応成果物

```text
docs/recall/agent-search-profile.md
config/agents.yaml
```

---

### P3-FR-009 Search Result Context生成

検索結果を、Context Packへ安全に組み込める形式へ整形できること。

#### Search Result Context標準構成

```md
## Retrieved Context

### Retrieval Metadata
- project_code:
- agent_code:
- query:
- executed_at:
- result_count:
- filters:
- history_included:

### Relevant Sources

#### Result 1
- source_path:
- source_type:
- section_heading:
- status:
- updated_at:
- relevance:
- reason_selected:

Relevant Content:
...

#### Result 2
...

### Warnings
- ...

### Excluded Historical or Draft Information
- ...
```

#### 必須要件

* 検索クエリを記録すること。
* 結果ごとに出典とstatusを含めること。
* Contextへ追加した理由を示せること。
* draft、deprecated、superseded等を含めた場合は明示すること。
* Search Result Context自体を正本とは扱わないこと。

#### 対応成果物

```text
templates/recall/search-result-context.template.md
```

---

### P3-FR-010 Context Builder連携

Phase 2で作成したContext Builderへ、検索により得られたSearch Result Contextを追加できること。

#### 拡張後のContext Pack構成

```md
# Context Pack

## 1. Build Metadata
## 2. Base Context
## 3. Agent Context
## 4. Project Context
## 5. Current Status
## 6. Active Decisions
## 7. Next Actions
## 8. Retrieved Context
## 9. Session Context
## 10. Recent Conversation Context
## 11. Task Context
## 12. Constraints and Write Policy
## 13. Referenced Sources
```

#### Context Builder拡張要件

| 要件              | 内容                             |
| --------------- | ------------------------------ |
| Retrieval有無指定   | 検索結果を追加するか指定できる                |
| Query指定         | Task Contextまたは明示クエリから検索を実行できる |
| Agent Profile適用 | Agent別の検索方針を適用できる              |
| 結果上限            | Context Pack肥大化を防ぐ件数制御ができる     |
| 警告表示            | 古い情報・未確定情報を含む場合に明示できる          |
| 出典統合            | 固定読み込み文書と検索文書をまとめて追跡できる        |

#### CLI利用例

```bash
npm run context:build -- \
  --project ats \
  --agent implementation_reviewer \
  --task examples/context/tasks/ats-implementation-review.md \
  --retrieve
```

```bash
npm run context:build -- \
  --project mnemosyne \
  --agent requirements_reviewer \
  --task examples/context/tasks/mnemosyne-requirements-review.md \
  --retrieve \
  --query "Phase 1とPhase 2の成果物構造に関する判断"
```

---

### P3-FR-011 Search Preview生成

AIへContext Packを渡す前に、検索結果の採用内容、除外内容および警告を確認できること。

#### Preview記載項目

| 項目                  | 内容                       |
| ------------------- | ------------------------ |
| Selected Project    | 検索対象プロジェクト               |
| Selected Agent      | 検索方針を適用したAgent           |
| Query               | 実行した検索条件                 |
| Filters             | status、source type等の絞り込み |
| Included Results    | Contextへ含める検索結果          |
| Excluded Results    | statusや低関連度により除外した結果     |
| Historical Results  | 履歴としてのみ候補となった情報          |
| Warnings            | 鮮度・競合・状態不明等の注意           |
| Source Traceability | 各結果の出典                   |
| Context Size Note   | 検索結果追加によるContext増加の確認情報  |

#### 対応成果物

```text
scripts/memory-search-preview.ts
docs/recall/search-preview-rule.md
```

---

### P3-FR-012 Mnemosyne検索検証

Project Mnemosyneについて、要件定義レビューまたはPhase整合レビューに必要な関連記憶を検索できること。

#### 検証シナリオ

| No.      | 検証内容         | 入力クエリ例                           | 期待結果                 |
| -------- | ------------ | -------------------------------- | -------------------- |
| P3-T-001 | Agent分離判断の検索 | 「専門AgentとProject Contextを分離する方針」 | 関連ADRおよび有効判断が取得できる   |
| P3-T-002 | Phase成果物整合検索 | 「Phase 1で必須となるmemory文書と配置」       | Phase文書および関連判断が取得できる |
| P3-T-003 | Notion位置づけ検索 | 「NotionはPhase 1で必須か」             | 任意成果物または副本方針が取得できる   |
| P3-T-004 | 履歴情報除外確認     | 旧要件に存在した単一project配置              | 通常検索で現在有効な構造が優先される   |

#### 検証記録

```text
docs/review/phase-3-mnemosyne-retrieval-validation.md
```

---

### P3-FR-013 ATS検索検証

ATSについて、実装レビューAgentが必要とする設計判断、制約および検証結果を検索できること。

#### 検証シナリオ

| No.      | 検証内容          | 入力クエリ例                                 | 期待結果                    |
| -------- | ------------- | -------------------------------------- | ----------------------- |
| P3-T-005 | 冪等性判断の検索      | 「processed_eventsによるaction_selectの冪等性」 | 関連する設計判断またはレビュー記録が取得できる |
| P3-T-006 | トランザクション境界の検索 | 「action_selectの単一トランザクション境界」           | 関連設計docsまたは判断記録が取得できる   |
| P3-T-007 | 制限ロジック検証結果の検索 | 「cooldown判定の確認結果」                      | 関連test resultが取得できる     |
| P3-T-008 | Agent検索差分確認   | 要件レビューAgentと実装レビューAgentで同一クエリ          | Agentに応じて優先結果が変わる       |

#### 検証記録

```text
docs/review/phase-3-ats-retrieval-validation.md
```

---

### P3-FR-014 Phase 4入力要件整理

Phase 3で構築した検索機能をMemory API経由で提供できるよう、Phase 4へ必要な入出力要件および安全制約を整理できること。

#### 整理対象

| 論点                  | 内容                                           |
| ------------------- | -------------------------------------------- |
| Search Request      | project、agent、query、filter、top_k等の入力         |
| Search Response     | source、status、relevance、content、warnings等の出力 |
| Context Response    | Context PackまたはRetrieved Contextの取得方式        |
| Error Handling      | 対象project不存在、索引未作成、結果なし等                     |
| Permission Boundary | read/search/draftのみを提供し、正本writeを分離する方針       |
| Freshness           | index更新状態および正本文書更新との差分表示                     |
| Observability       | 検索実行結果および選定根拠の追跡方式                           |

#### 対応成果物

```text
docs/phases/phase-4-input-requirements.md
```

---

## 8.10 Phase 3非機能要件

| ID         | 非機能要件      | 内容                                             |
| ---------- | ---------- | ---------------------------------------------- |
| P3-NFR-001 | 根拠追跡性      | すべての検索結果から元文書、見出し、状態および更新情報を確認できること            |
| P3-NFR-002 | 正本非改変性     | 索引作成および検索処理が正本文書を書き換えないこと                      |
| P3-NFR-003 | 鮮度制御       | 古い判断または廃止情報を通常検索で優先表示しないこと                     |
| P3-NFR-004 | 再現性        | 同一索引、同一検索条件および同一設定では、概ね同等の検索結果を得られること          |
| P3-NFR-005 | 検索品質       | MnemosyneおよびATSの代表シナリオで、必要な根拠情報を上位結果として取得できること |
| P3-NFR-006 | Agent適応性   | Agentごとの目的に応じて検索対象や優先結果を調整できること                |
| P3-NFR-007 | Project分離性 | 異なるProjectの記憶が意図せず混在しないこと                      |
| P3-NFR-008 | Context抑制  | 検索結果を無制限にContext Packへ追加せず、必要十分な範囲に制御できること     |
| P3-NFR-009 | 人間確認性      | AI利用前に検索結果、除外理由、警告および出典を確認できること                |
| P3-NFR-010 | 段階的拡張性     | Phase 4のAPI化およびPhase 5のMCP接続へ、検索I/Oを再利用できること   |
| P3-NFR-011 | 障害明示性      | 索引未作成、文書欠落、検索結果なし、状態不明等を黙って無視せず明示できること         |
| P3-NFR-012 | 機密配慮       | Project Registryで明示した検索対象外文書を索引へ含めないこと         |

---

## 8.11 Phase 3制約

| ID       | 制約                                                          |
| -------- | ----------------------------------------------------------- |
| P3-C-001 | 検索対象の基本はMarkdown正本、ADRおよび承認済み記憶とする                          |
| P3-C-002 | 生チャットログ、Context Pack、AI回答および未レビュー草案を初期索引対象としない              |
| P3-C-003 | 索引、Embedding、Vector StoreおよびSearch Result Contextは正本として扱わない |
| P3-C-004 | Phase 3では正本文書の自動更新を実装しない                                    |
| P3-C-005 | Phase 3ではMemory APIを実装しない                                   |
| P3-C-006 | Phase 3ではMCP Serverを実装しない                                   |
| P3-C-007 | Phase 3ではAgentの自律実行および統括処理を実装しない                            |
| P3-C-008 | 通常検索では `active` および `accepted` 情報を優先し、古い情報は原則除外する           |
| P3-C-009 | 検索技術の具体選定は設計仕様書で確定し、要件定義では能力と制約を定義する                        |
| P3-C-010 | Project間横断検索は、個別Project検索の安全性と精度が確認されるまで初期必須範囲に含めない         |
| P3-C-011 | Notion副本の検索は、正本同期方針が確定するまで初期必須範囲に含めない                       |

---

## 8.12 Phase 3成果物

### 8.12.1 必須成果物

#### A. Recall Engine仕様文書

| ファイル                                  | 目的                             |
| ------------------------------------- | ------------------------------ |
| `docs/recall/search-source-policy.md` | 索引対象、除外対象、条件付き対象を定義する          |
| `docs/recall/chunk-policy.md`         | 文書のチャンク分割ルールを定義する              |
| `docs/recall/metadata-spec.md`        | chunkおよび検索結果に保持するmetadataを定義する |
| `docs/recall/index-build-rule.md`     | 索引作成・更新・削除反映のルールを定義する          |
| `docs/recall/search-policy.md`        | 検索入力、filter、結果表示および選定ルールを定義する  |
| `docs/recall/staleness-policy.md`     | 古い情報・置換済み情報・状態不明情報の扱いを定義する     |
| `docs/recall/agent-search-profile.md` | Agentごとの検索対象・優先順位を定義する         |
| `docs/recall/search-preview-rule.md`  | 検索結果確認および警告表示を定義する             |

#### B. 設定拡張

| ファイル                   | 目的                                 |
| ---------------------- | ---------------------------------- |
| `config/projects.yaml` | `searchable_sources` 等の検索対象定義を追加する |
| `config/agents.yaml`   | `search_profile` 等のAgent検索方針を追加する  |

#### C. テンプレート

| ファイル                                                 | 目的                         |
| ---------------------------------------------------- | -------------------------- |
| `templates/recall/search-result-context.template.md` | 検索結果をContextへ組み込む標準形式を定義する |
| `templates/recall/search-validation.template.md`     | 検索品質検証の記録形式を定義する           |

#### D. CLI実装

| ファイル                               | 目的                                         |
| ---------------------------------- | ------------------------------------------ |
| `scripts/memory-index.ts`          | 正本文書のチャンク化および索引作成を行う                       |
| `scripts/memory-search.ts`         | 検索条件に基づき関連記憶を取得する                          |
| `scripts/memory-search-preview.ts` | 検索結果と警告を人間確認用に出力する                         |
| `scripts/context-build.ts`         | Retrieved ContextをContext Packへ追加できるよう拡張する |

#### E. 検証用入力・生成例

| ファイル                                                        | 目的                   |
| ----------------------------------------------------------- | -------------------- |
| `examples/recall/queries/mnemosyne-requirements-queries.md` | Mnemosyne検証用クエリを定義する |
| `examples/recall/queries/ats-implementation-queries.md`     | ATS検証用クエリを定義する       |
| `examples/recall/output/mnemosyne-search-result-context.md` | Mnemosyne検索結果例       |
| `examples/recall/output/ats-search-result-context.md`       | ATS検索結果例             |

#### F. 検証記録

| ファイル                                                    | 目的                                 |
| ------------------------------------------------------- | ---------------------------------- |
| `docs/review/phase-3-mnemosyne-retrieval-validation.md` | Mnemosyneにおける検索品質とContext補完結果を記録する |
| `docs/review/phase-3-ats-retrieval-validation.md`       | ATSにおける検索品質とContext補完結果を記録する       |

#### G. Phase 4引継ぎ文書

| ファイル                                        | 目的                               |
| ------------------------------------------- | -------------------------------- |
| `docs/phases/phase-4-input-requirements.md` | Memory APIおよび外部取得口に必要な入出力要件を整理する |

### 8.12.2 技術選定時に追加される可能性がある成果物

以下は、設計仕様書で検索実装方式を確定した後に追加する。

| ファイルまたは構成                                     | 条件                               |
| --------------------------------------------- | -------------------------------- |
| `docs/design/recall-engine-design.md`         | 技術選定および責務構造を設計文書として独立させる場合       |
| `docs/design/vector-store-design.md`          | Vector Storeまたはpgvector導入を決定した場合 |
| `src/repositories/documentChunkRepository.ts` | DB等にchunkを永続化する場合                |
| `src/repositories/embeddingRepository.ts`     | Embeddingを永続化する場合                |
| `src/services/embeddingService.ts`            | Embedding API利用を採用した場合           |
| `src/services/recallSearchService.ts`         | CLIロジックをServiceへ分離する場合           |
| migrationファイル                                 | PostgreSQLを索引保存先として採用した場合        |

### 8.12.3 生成物の標準出力先

```text
dist/
  recall/
    index-report/
      {project_code}/
        {generated_at}-index-report.md

    search-results/
      {project_code}/
        {agent_code}/
          {generated_at}-search-result-context.md

    search-preview/
      {project_code}/
        {agent_code}/
          {generated_at}-search-preview.md

  context/
    {project_code}/
      {agent_code}/
        {generated_at}-context-pack.md
```

---

## 8.13 Phase 3推奨ディレクトリ構成

```text
project-mnemosyne/
  config/
    projects.yaml
    agents.yaml

  docs/
    recall/
      search-source-policy.md
      chunk-policy.md
      metadata-spec.md
      index-build-rule.md
      search-policy.md
      staleness-policy.md
      agent-search-profile.md
      search-preview-rule.md

    phases/
      phase-3-input-requirements.md
      phase-4-input-requirements.md

    review/
      phase-3-mnemosyne-retrieval-validation.md
      phase-3-ats-retrieval-validation.md

  templates/
    recall/
      search-result-context.template.md
      search-validation.template.md

  examples/
    recall/
      queries/
        mnemosyne-requirements-queries.md
        ats-implementation-queries.md
      output/
        mnemosyne-search-result-context.md
        ats-search-result-context.md

  scripts/
    memory-index.ts
    memory-search.ts
    memory-search-preview.ts
    context-build.ts

  dist/
    recall/
      index-report/
      search-results/
      search-preview/

    context/
```

---

## 8.14 Phase 3検証シナリオ

### 8.14.1 索引作成検証

| No.      | 検証内容          | 入力                                   | 期待結果                                    |
| -------- | ------------- | ------------------------------------ | --------------------------------------- |
| P3-T-001 | Mnemosyne索引作成 | `--project mnemosyne`                | 正本文書・ADR・review対象がchunk化され、生成レポートが出力される |
| P3-T-002 | ATS索引作成       | `--project ats`                      | ATS対象文書のみが索引化される                        |
| P3-T-003 | 生成物除外確認       | `dist/context/` にContext Packが存在する状態 | Context Packが索引対象にならない                  |
| P3-T-004 | 未レビュー要約除外確認   | draft Conversation Summaryが存在する状態    | 通常索引または通常検索の対象から除外される                   |
| P3-T-005 | 再索引確認         | 正本文書を更新後に再実行                         | content hash等により変更分が反映される               |

### 8.14.2 Mnemosyne検索検証

| No.      | 検証内容           | クエリ                              | 期待結果                          |
| -------- | -------------- | -------------------------------- | ----------------------------- |
| P3-T-006 | Agent分離方針取得    | 「専門AgentとProject Contextを分離する判断」 | 関連ADRまたはactive decisionが上位に出る |
| P3-T-007 | Phase 1成果物構成取得 | 「Phase 1の必須成果物とプロジェクト別memory配置」  | 最新のPhase 1文書または判断が取得される       |
| P3-T-008 | Fact分類取得       | 「会話記憶化でFactを扱う理由」                | taxonomyまたは要件記載が取得される         |
| P3-T-009 | 旧案誤参照防止        | 「タスクの正本はどこか」                     | `next-actions.md` 正本方針が優先される  |

### 8.14.3 ATS検索検証

| No.      | 検証内容            | クエリ                                    | 期待結果                            |
| -------- | --------------- | -------------------------------------- | ------------------------------- |
| P3-T-010 | 冪等性判断取得         | 「processed_eventsで冪等性を保証する設計」          | 関連判断または設計記録が取得される               |
| P3-T-011 | transaction境界取得 | 「action_selectで更新対象を同一トランザクションにまとめる理由」 | 関連docsまたはレビュー記録が取得される           |
| P3-T-012 | cooldown検証取得    | 「cooldown判定が二重登録を防止した検証結果」             | 関連Test Resultが取得される             |
| P3-T-013 | Agent差分取得       | 同一クエリを異なるAgentで実行                      | Agent profileに応じた結果優先順位の差が確認できる |

### 8.14.4 Context Pack連携検証

| No.      | 検証内容                | 入力                         | 期待結果                                  |
| -------- | ------------------- | -------------------------- | ------------------------------------- |
| P3-T-014 | Retrieved Context追加 | `--retrieve` 付きContext生成   | Context PackへRetrieved Context章が追加される |
| P3-T-015 | 出典統合確認              | 固定文書 + 検索結果を含むContext Pack | すべての参照元が確認できる                         |
| P3-T-016 | 古い情報警告              | 履歴検索を有効化                   | superseded / deprecatedが警告付きで表示される    |
| P3-T-017 | 結果件数制御              | 多数の検索候補が存在する状態             | Context Packが無制限に肥大化しない               |

### 8.14.5 安全性検証

| No.      | 検証内容             | 期待結果                                      |
| -------- | ---------------- | ----------------------------------------- |
| P3-T-018 | 索引処理の副作用確認       | 正本文書が変更されない                               |
| P3-T-019 | 検索処理の副作用確認       | 正本文書、ADR、Registryが変更されない                  |
| P3-T-020 | write policy維持確認 | 検索結果追加後のContext Packにも `draft_only` 方針が残る |
| P3-T-021 | Project混在防止確認    | `ats` 検索に `mnemosyne` 文書が意図せず混ざらない        |

---

## 8.15 Phase 3完了条件

### 8.15.1 Definition of Done

Phase 3は、以下をすべて満たした時点で完了とする。

| No.    | 完了条件                                    | 判定観点                        |
| ------ | --------------------------------------- | --------------------------- |
| DoD-01 | 検索対象・除外対象・条件付き対象が定義されている                | 正本と検索対象の境界を判断できる            |
| DoD-02 | チャンク化ルールが定義されている                        | 文書種別ごとに適切に分割できる             |
| DoD-03 | Metadata仕様が定義されている                      | 出典、状態、鮮度、Projectを追跡できる      |
| DoD-04 | 索引作成ルールとCLIが整備されている                     | MnemosyneおよびATSを索引化できる      |
| DoD-05 | 自然文による関連記憶検索が実行できる                      | 代表クエリに対して結果を取得できる           |
| DoD-06 | Statusおよび鮮度制御が実装または検証可能である              | 古い情報を通常検索で優先しない             |
| DoD-07 | Agent-aware Retrievalが実行できる             | Agentにより検索対象または結果優先度が変わる    |
| DoD-08 | Search Result Contextを生成できる             | Context Packへ組込み可能な形式で出力できる |
| DoD-09 | Context BuilderがRetrieved Contextを追加できる | Phase 2生成物を検索で補完できる         |
| DoD-10 | Search Previewにより採用結果・除外結果・警告を確認できる     | 人間がAI入力前に確認できる              |
| DoD-11 | Mnemosyneで検索有効性検証が完了している                | 要件・Phase判断を取得できる            |
| DoD-12 | ATSで検索有効性検証が完了している                      | 実装レビューに必要な判断・検証結果を取得できる     |
| DoD-13 | 正本・副本・生成物の境界が維持されている                    | 索引や検索結果を正本として扱っていない         |
| DoD-14 | Phase 4入力要件が整理されている                     | API化へ進める                    |
| DoD-15 | API、MCP、正本自動更新、Agent自律実行へ不要に着手していない     | Phase 3スコープを維持している          |

### 8.15.2 完了判定

| 判定             | 条件                                               |
| -------------- | ------------------------------------------------ |
| Go             | 全DoDを満たし、MnemosyneおよびATSで固定読み込み不足を検索により補完できる     |
| Conditional Go | 検索精度または検索方式に改善課題はあるが、API化に必要なI/Oと安全境界を定義できる      |
| No Go          | 正本の根拠追跡、鮮度制御、Project分離、Context Pack連携のいずれかが成立しない |

---

## 8.16 Phase 3からPhase 4への引継ぎ要件

| ID        | 引継ぎ事項        | 内容                                            |
| --------- | ------------ | --------------------------------------------- |
| P3-HO-001 | 検索Request仕様  | project、agent、query、filter、result limit等      |
| P3-HO-002 | 検索Response仕様 | source path、status、content、warning、relevance等 |
| P3-HO-003 | Context取得仕様  | 基本Context PackおよびRetrieved Contextの返却方式       |
| P3-HO-004 | 鮮度表示仕様       | index時点と正本文書更新との差分通知                          |
| P3-HO-005 | エラー仕様        | 索引未作成、検索結果なし、対象Projectなし等                     |
| P3-HO-006 | 安全境界         | API化後もread / search / draft生成と正本writeを分離する方針  |
| P3-HO-007 | Agent連携要件    | Agent別検索プロファイルをAPI入力または内部処理へ反映する方式            |
| P3-HO-008 | 検証結果         | MnemosyneおよびATSにおける検索品質・不足事項                  |
| P3-HO-009 | 技術課題         | 検索精度、Contextサイズ、索引更新、技術選定に関する残課題              |

---

## 8.17 Phase 3時点の未決定事項

| ID        | 論点                                    | Phase 3での扱い                | 後続判断                |
| --------- | ------------------------------------- | -------------------------- | ------------------- |
| P3-OI-001 | Vector Storeの具体技術                     | 意味検索能力を要件とし、技術は未確定         | Recall Engine設計時に判断 |
| P3-OI-002 | PostgreSQL + pgvectorを採用するか           | 有力候補として保持                  | データ設計・運用負荷比較後に判断    |
| P3-OI-003 | Keyword SearchまたはHybrid Searchを必須化するか | 意味検索の品質不足時の改善候補            | 検証結果に基づき判断          |
| P3-OI-004 | Embeddingモデルの選定                       | 要件定義では確定しない                | 実装設計時に判断            |
| P3-OI-005 | Conversation Summaryをどの承認状態から検索対象にするか | reviewed / reflectedを候補とする | 運用設計で確定             |
| P3-OI-006 | Project横断検索を導入するか                     | 初期範囲外                      | 単一Project検索の検証後に判断  |
| P3-OI-007 | Context Packのtoken上限と検索結果件数制御         | 件数制御を要件とする                 | 検証後に具体値を決定          |
| P3-OI-008 | 索引更新を手動実行にするか自動化するか                   | CLIによる手動実行を初期候補とする         | Phase 4以降で再判断       |
| P3-OI-009 | Notion副本を検索対象に追加するか                   | 初期範囲外                      | 正本同期方針確定後に判断        |

---

# 9. 次分冊で定義する範囲

次分冊では、以下を定義する。

```text
Phase 4：Memory Gateway
  - Memory API
  - Project Context取得API
  - Active Decisions取得API
  - Next Actions取得API
  - Memory Search API
  - Context Pack取得または生成API
  - Doc Update Draft作成API
  - API権限境界
  - エラー応答および監査情報
  - MCP接続前提となる入出力仕様
```

Phase 4は、Phase 3までに構築した正本参照・Context生成・関連記憶検索の機能を、CLI内部利用から外部接続可能なMemory Gatewayへ拡張するPhaseとする。

## 今回の設計上の整理

| 項目           | Phase 2まで                    | Phase 3で追加した要件                      |
| ------------ | ---------------------------- | ----------------------------------- |
| Context取得    | 必須文書をRegistryに基づいて固定読み込み     | 関連する追加記憶を検索して補完                     |
| Context Pack | `Project × Agent × Task` で生成 | `Retrieved Context` を追加可能にする        |
| 参照根拠         | 読み込んだ文書一覧                    | chunk単位の出典・状態・更新情報                  |
| 古い情報対策       | Context生成時のstatus確認          | 検索時の除外・警告・履歴検索制御                    |
| Agent連携      | Agent Registryで必要Contextを定義  | Agent別の検索プロファイルを追加                  |
| 技術選定         | Context Builder中心            | Vector Search等は能力要件のみ定義し、技術は設計工程で確定 |
| 次Phaseへの接続   | 検索導入要件の整理                    | Memory Search APIの入力・出力・安全境界を整理     |

この整理により、Phase 3は「ベクトルDBを入れるフェーズ」ではなく、**正本性と鮮度を維持したまま、必要な記憶だけを根拠付きで呼び戻すフェーズ**として定義できます。

## Conversation Memory

### fact

* JP: Project Mnemosyneは、Markdown docsとADRを初期正本とし、汎用専門AgentとProject Contextを組み合わせてAI作業を継続可能にする外部記憶基盤として設計されている。 / EN: Project Mnemosyne uses Markdown docs and ADRs as initial sources of truth and is designed as an external memory base that combines reusable specialist agents with project context.
* JP: Phase 1では正本構造・記憶分類・更新ルール・テンプレート適用検証を扱い、Phase 2では `Project × Agent × Task` に基づくContext Pack生成を扱う要件を作成した。 / EN: Phase 1 defines source-of-truth structure, memory taxonomy, update rules, and template validation; Phase 2 defines Context Pack generation based on `Project × Agent × Task`.
* JP: 本回答では、Phase 3：Recall Engineの要件定義本文を、Phase別要件定義書へ追記可能な形式で作成した。 / EN: This response created the Phase 3: Recall Engine requirements section in a form that can be appended to the phase requirements document.

### decision

* JP: Phase 3は、正本文書および承認済み記憶を検索可能にし、Phase 2のContext Packへ根拠付きの `Retrieved Context` を追加するフェーズと定義した。 / EN: Phase 3 is defined as making source documents and approved memory searchable and adding evidence-based `Retrieved Context` to Phase 2 Context Packs.
* JP: 生チャットログ、Context Pack、AI回答、未レビュー草案は、Phase 3初期の索引対象に含めない方針とした。 / EN: Raw chats, Context Packs, AI responses, and unreviewed drafts are excluded from the initial Phase 3 index.
* JP: 検索結果、索引、Embedding、Vector Storeは正本ではなく、副本または生成物として扱う方針とした。 / EN: Search results, indexes, embeddings, and vector stores are treated as secondary or generated artifacts, not sources of truth.
* JP: Vector StoreやEmbeddingモデル等の具体技術は要件定義で固定せず、検索能力と制約を要件として定義し、設計工程で判断する方針とした。 / EN: Specific technologies such as vector stores and embedding models are not fixed in requirements; required capabilities and constraints are defined now, with technology decisions deferred to design.

### task

* JP: 次分冊として、Phase 4：Memory Gatewayの要件定義を作成する。 / EN: Create the next section defining Phase 4: Memory Gateway.
* JP: Recall Engineの設計工程では、Vector Store、Embedding方式、検索方式、索引保存先および更新運用を具体化する必要がある。 / EN: The Recall Engine design stage must specify the vector store, embedding approach, search method, index storage, and update operation.

### preference

* JP: 技術を先に固定するのではなく、正本境界・検索対象・鮮度制御・検証条件を要件として固めた後に技術選定へ進む方針を重視している。 / EN: The preferred approach is to define source boundaries, search scope, freshness control, and validation conditions before selecting technology.
* JP: Context Packへ検索結果を追加する前に、出典・状態・警告を人間が確認できる運用を重視する。 / EN: The process prioritizes human review of sources, status, and warnings before adding search results to a Context Pack.

### constraint

* JP: Phase 3では、Memory API、MCP Server、正本自動更新、Agent自律実行、Notion副本検索、Project横断検索を初期必須範囲に含めない。 / EN: Phase 3 does not initially require Memory APIs, MCP servers, automatic source updates, autonomous agents, Notion secondary-view search, or cross-project search.
* JP: 通常検索では `active` および `accepted` 情報を優先し、`superseded`、`deprecated`、`draft`、`proposed`、`archived` 情報は原則除外または明示指定時のみ扱う。 / EN: Normal search prioritizes `active` and `accepted` information; `superseded`, `deprecated`, `draft`, `proposed`, and `archived` information is normally excluded or shown only when explicitly requested.

### issue

* JP: Vector Storeの具体技術、PostgreSQL + pgvector採用可否、Embeddingモデル、KeywordまたはHybrid Searchの採用要否は未確定である。 / EN: The specific vector store, possible PostgreSQL + pgvector use, embedding model, and whether to use keyword or hybrid search remain undecided.
* JP: Conversation Summaryをどの承認状態から検索対象へ含めるか、Context Packの件数・token制御をどの程度実装するかは、検証後に確定する必要がある。 / EN: The approval status required for searchable Conversation Summaries and the level of Context Pack result/token control must be finalized after validation.

### idea

* JP: Agent Registryへ `search_profile` を追加し、要件レビューAgentと実装レビューAgentで検索対象や優先結果を切り替える構造が有効である。 / EN: Adding a `search_profile` to Agent Registry can switch search scope and result priority between requirements-review and implementation-review agents.
* JP: Phase 3の検索結果を `Retrieved Context` として独立章にまとめることで、固定Contextと検索補完情報の境界を維持しやすくなる。 / EN: Keeping Phase 3 search results in a separate `Retrieved Context` section helps preserve the boundary between fixed context and retrieved supplementary information.

### article_note

* JP: RAG導入の本質はベクトルDBの採用ではなく、正本から必要な情報だけを、鮮度と根拠を保ったままAIへ渡す仕組みを作ることである。 / EN: The key value of RAG is not choosing a vector database; it is sending only needed information from sources of truth to AI while preserving freshness and evidence.

### conversation_summary

* JP: 本チャットでは、Phase 1作業計画書を基準として全体要件定義書を再構成し、Phase別要件定義書を分割作成している。Phase 1では記憶の正本構造と運用ルール、Phase 2では `Project × Agent × Task` によるContext Pack生成を定義した。今回、Phase 3を、正本および承認済み記憶を索引化・検索し、根拠付きのRetrieved ContextとしてContext Packを補完するフェーズとして定義した。 / EN: This chat rebuilt the overall requirements using the Phase 1 plan and is creating phased requirements in sections. Phase 1 defines source-of-truth memory and operation rules; Phase 2 defines Context Pack generation based on `Project × Agent × Task`. This response defines Phase 3 as indexing and retrieving source documents and approved memory to supplement Context Packs with evidence-based Retrieved Context.

### test_result

* JP: Phase 3要件定義では、初期構想にあったチャンク化・Embedding・Vector Search・古い情報除外を維持しつつ、Phase 2との接続としてSearch Result Context、Context Builder連携、Agent-aware Retrieval、Phase 4 API入力整理を追加できた。 / EN: The Phase 3 requirements retain the original concepts of chunking, embeddings, vector search, and stale-information exclusion while adding Search Result Context, Context Builder integration, agent-aware retrieval, and Phase 4 API input preparation.
