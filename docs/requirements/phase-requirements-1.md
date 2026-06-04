# Project Mnemosyne Phase別要件定義書

## 第1分冊：共通定義 / Phase 1 Memory Foundation

---

## 0. 文書情報

| 項目          | 内容                                              |
| ----------- | ----------------------------------------------- |
| 文書名         | Project Mnemosyne Phase別要件定義書                   |
| 保存先         | `docs/requirements/phase-requirements.md`       |
| 作成範囲        | 共通定義および Phase 1：Memory Foundation               |
| 文書ステータス     | Draft                                           |
| 上位文書        | `docs/requirements/overall-requirements.md`     |
| Phase 1基準文書 | `docs/phases/phase-1-memory-foundation.md`      |
| 対象プロジェクト    | Project Mnemosyne                               |
| Phase 1検証対象 | Project Mnemosyne / Adventure Token System（ATS） |

---

# 1. 本書の目的

本書は、Project Mnemosyneを構成する各Phaseについて、以下を定義するための要件定義書である。

* 各Phaseの目的
* 各Phaseで解決する課題
* 各Phaseの対象範囲および対象外
* 各Phaseで満たすべき機能要件
* 各Phaseで遵守すべき非機能要件および制約
* 各Phaseの成果物
* 各Phaseの完了条件
* 後続Phaseへの引継ぎ事項

本書は、プロジェクト全体の目的・設計原則・正本境界を定義する `overall-requirements.md` を、実行可能なPhase単位の要件へ分解する文書である。

Phaseごとの具体的な作業手順、マイルストーン、タスク順序およびレビュー手順は、各Phaseの作業計画書で管理する。

---

# 2. 文書間の責務と優先順位

## 2.1 文書の責務

| 文書                                          | 役割                                    |
| ------------------------------------------- | ------------------------------------- |
| `docs/requirements/overall-requirements.md` | Project Mnemosyne全体の目的・基本方針・全体要件を定義する |
| `docs/requirements/phase-requirements.md`   | Phase単位の目的・要件・成果物・完了条件を定義する           |
| `docs/phases/phase-1-memory-foundation.md`  | Phase 1の具体的な作業手順・マイルストーン・実施順序を管理する    |
| `docs/design/system-design.md`              | 要件を実現するための構造・責務・データ・連携方式を定義する         |
| `docs/memory/*.md`                          | 記憶分類・正本境界・更新運用・参照ルールを定義する             |
| `docs/adr/*.md`                             | 重要な設計判断とその理由を記録する                     |

## 2.2 競合時の扱い

文書間で記載内容が競合した場合は、以下の原則で扱う。

| 競合内容                      | 優先する文書                         |
| ------------------------- | ------------------------------ |
| Project Mnemosyne全体の目的・原則 | `overall-requirements.md`      |
| Phase 1の対象・成果物・完了条件       | `phase-1-memory-foundation.md` |
| Phase 1の具体的な実施手順・順序       | `phase-1-memory-foundation.md` |
| 正本・副本・状態・分類の詳細ルール         | `docs/memory/*.md`             |
| 採用済みの重要判断                 | Accepted / Active なADR         |
| 実装構造・責務分割                 | `system-design.md`             |

Phase 1要件は、`phase-1-memory-foundation.md` の内容と整合することを必須とする。

---

# 3. Phase構成

## 3.1 Phase一覧

| Phase       | 名称                                        | 主目的                                                | 実装レベル                     |
| ----------- | ----------------------------------------- | -------------------------------------------------- | ------------------------- |
| Phase 1     | Memory Foundation                         | 記憶の正本構造・分類・更新ルールを定義する                              | 文書・運用設計                   |
| Phase 2     | Context Forge                             | Project × Agent × Task に応じたContext Packを生成できるようにする | CLI / 設定ファイル              |
| Phase 3     | Recall Engine                             | 必要な記憶を検索・抽出できるようにする                                | 検索・Embedding・Vector Store |
| Phase 4     | Memory Gateway                            | 外部アプリや接続口から記憶を取得できるようにする                           | API / Service             |
| Phase 5     | MCP Nexus                                 | AIクライアントから記憶基盤を利用できるようにする                          | MCP Server                |
| Later Phase | Agent Operation / Automation & Governance | 専門Agent運用と安全な半自動更新を拡張する                            | Agent運用・自動化               |

## 3.2 初期MVPの境界

初期MVPは、以下を基本範囲とする。

```text
Phase 1：Memory Foundation
  ＋
Phase 2：Context Forge
```

初期MVPでは、正しい記憶構造を作成し、その記憶をAIへ渡すContext Packを生成できる状態までを目指す。

RAG、Memory API、MCP Server、Agent実行基盤および自動更新は、初期MVPの必須範囲に含めない。

---

# 4. 全Phase共通要件

## 4.1 共通設計原則

すべてのPhaseは、以下の設計原則に従うこと。

| ID     | 原則        | 内容                                   |
| ------ | --------- | ------------------------------------ |
| CP-001 | 正本優先      | AIが参照する情報には、正本と副本・生成物の区別を設ける         |
| CP-002 | 会話ログ非正本化  | 生の会話ログをそのまま確定情報の正本として扱わない            |
| CP-003 | 人間承認      | AIは更新案を作成できるが、正本反映は人間承認後とする          |
| CP-004 | 情報鮮度管理    | 現在有効な情報と、置換済み・廃止済み情報を区別する            |
| CP-005 | プロジェクト非依存 | 記憶構造とAgent設計を特定プロジェクト専用にしない          |
| CP-006 | 段階的実装     | 記憶構造が定まる前に検索・API・MCP・自動化へ進まない        |
| CP-007 | 人間可読性     | 初期段階ではMarkdownを中心に、人間がレビュー可能な形式を採用する |
| CP-008 | 追跡可能性     | 重要判断はADRとして理由と影響を記録する                |

## 4.2 共通の情報分類

少なくとも以下の情報分類を、Phase 1以降の記憶管理で扱えること。

| memory_type            | 意味                |
| ---------------------- | ----------------- |
| `fact`                 | 確認された事実・前提        |
| `decision`             | 採用済みの判断           |
| `task`                 | 実施すべき作業           |
| `issue`                | 未解決の課題・確認事項       |
| `idea`                 | 未採用の提案・将来候補       |
| `constraint`           | 守るべき制約            |
| `conversation_summary` | 会話内容を再利用可能に整理した記録 |
| `test_result`          | 検証または確認の結果        |

以下は、Phase 1の `memory-taxonomy.md` 作成時に正式採用の要否を判断する追加候補とする。

| memory_type候補  | 用途                |
| -------------- | ----------------- |
| `preference`   | 作業方針、出力形式、運用上の選好  |
| `article_note` | 記事化・発信へ利用可能な学びや論点 |

## 4.3 共通の状態管理

少なくとも以下の状態を扱えること。

| status       | 意味         | 参照時の扱い           |
| ------------ | ---------- | ---------------- |
| `draft`      | 下書き・未確認    | 確定情報として扱わない      |
| `proposed`   | 提案済み・判断待ち  | 候補として扱う          |
| `active`     | 現在有効       | 優先して参照する         |
| `accepted`   | 採用済み判断     | 判断根拠として参照する      |
| `superseded` | 新しい情報に置換済み | 履歴としてのみ参照する      |
| `deprecated` | 非推奨・廃止対象   | 原則として現在判断の根拠にしない |
| `archived`   | 完了・保管      | 必要時のみ参照する        |

## 4.4 共通のAI操作境界

| 操作                               | 方針   |
| -------------------------------- | ---- |
| 正本文書の参照                          | 許可   |
| 情報の要約                            | 許可   |
| Fact / Decision / Task 等への分類候補作成 | 許可   |
| 新規文書草案の作成                        | 許可   |
| 修正案・差分案の作成                       | 許可   |
| 正本への無承認直接反映                      | 禁止   |
| 正本の削除                            | 原則禁止 |
| 置換済み情報の履歴削除                      | 原則禁止 |

---

# 5. Phase 1：Memory Foundation

## 副題：記憶の器を作る

---

## 5.1 Phase概要

| 項目         | 内容                                          |
| ---------- | ------------------------------------------- |
| Phase      | Phase 1                                     |
| 名称         | Memory Foundation                           |
| 副題         | 記憶の器を作る                                     |
| 主目的        | AIが参照する記憶の正本構造と、人間が管理できる更新ルールを定義する          |
| 実装レベル      | ドキュメントおよび運用設計                               |
| コード実装      | 原則として実施しない                                  |
| 正本となる作業計画書 | `docs/phases/phase-1-memory-foundation.md`  |
| 検証対象       | Project Mnemosyne / ATS                     |
| 次Phaseとの接続 | Phase 2でContext Pack Builderを設計・実装できる入力を整える |

## 5.2 Phase 1の目的

### 5.2.1 主目的

プロジェクトごとの文脈、判断、状態、制約、次アクションを、AIが再利用できる形式で管理するための標準構造と運用ルールを定義する。

### 5.2.2 具体目的

| ID         | 目的                                                                           |
| ---------- | ---------------------------------------------------------------------------- |
| P1-OBJ-001 | 記憶の正本・副本・一次メモ・生成物の境界を定義する                                                    |
| P1-OBJ-002 | 複数プロジェクトへ共通適用できる記憶文書構造を定義する                                                  |
| P1-OBJ-003 | Fact / Decision / Task / Issue / Idea / Constraint 等の分類ルールを定義する              |
| P1-OBJ-004 | 情報状態および参照優先順位を定義する                                                           |
| P1-OBJ-005 | AIによる参照・草案作成・人間承認反映の境界を定義する                                                  |
| P1-OBJ-006 | Mnemosyne自身へ記憶構造を適用する                                                        |
| P1-OBJ-007 | ATSへ同一テンプレートを適用し、汎用性を検証する                                                    |
| P1-OBJ-008 | AgentとProject Contextを分離する方針を判断記録として残す                                       |
| P1-OBJ-009 | Phase 2で扱うProject Registry / Agent Registry / Context Pack Builderの入力項目を整理する |

---

## 5.3 Phase 1で解決する課題

| 課題ID       | 課題                       | Phase 1での解決内容                                |
| ---------- | ------------------------ | -------------------------------------------- |
| P1-ISS-001 | 会話内の判断が流れてしまう            | 会話を分類・要約し、正本反映候補へ変換するルールを定義する                |
| P1-ISS-002 | プロジェクトごとに記憶の構造が変わる       | 共通テンプレートを作成し、MnemosyneとATSで検証する              |
| P1-ISS-003 | 古い方針を現在有効な情報として参照する恐れがある | 状態管理および参照優先順位を定義する                           |
| P1-ISS-004 | AIによる誤更新が懸念される           | AIはdraftまで、人間承認後に正本へ反映する方針をADR化する            |
| P1-ISS-005 | Agentが何を参照すべきか不明である      | AgentとProject Contextの分離および必要Contextを整理する    |
| P1-ISS-006 | Phase 2の実装入力が不足する        | RegistryおよびContext Pack Builderに必要な入力項目を整理する |

---

## 5.4 Phase 1の対象範囲

### 5.4.1 対象に含めるもの

| 分類          | 対象内容                        |
| ----------- | --------------------------- |
| 方針設計        | 正本・副本・一次メモ・生成物の境界           |
| 分類設計        | 記憶分類および状態管理                 |
| 参照設計        | 情報競合時の参照優先順位                |
| 文書構造        | 共通方針文書、テンプレート、プロジェクト固有記憶の配置 |
| 運用設計        | 会話やメモから正本へ反映する流れ            |
| ADR         | Phase 1で採用する重要判断の記録         |
| Mnemosyne適用 | 設計対象自身への記憶文書作成              |
| ATS検証       | 実プロジェクトへのテンプレート適用および検証      |
| 後続準備        | Phase 2で必要となる入力項目の整理        |

### 5.4.2 対象に含めないもの

| 対象外                            | 理由                           |
| ------------------------------ | ---------------------------- |
| Context Pack自動生成CLI            | Phase 2で実装するため               |
| Project Registry実装             | Phase 2で設定ファイルまたは構造として設計するため |
| Agent Registry実装               | Phase 2でContext生成と合わせて扱うため   |
| Agent実行基盤                      | Phase 1では必要Contextの整理までとするため |
| PostgreSQLによる記憶管理              | Markdownによる運用検証を先行させるため      |
| RAG / Embedding / Vector Store | 正本構造と鮮度ルールの確定後に導入するため        |
| Memory API                     | Context取得方式が確定してから設計するため     |
| MCP Server                     | APIおよびContext仕様の確定後に実装するため   |
| GitHub docs自動更新                | 人間承認運用を先に確立するため              |
| Notion自動更新                     | 副本運用の必要性確認前に自動化しないため         |
| UI                             | 手動またはCLIで必要性を確認してから検討するため    |

---

## 5.5 Phase 1の前提条件

| ID         | 前提条件                                                   |
| ---------- | ------------------------------------------------------ |
| P1-PRE-001 | Project Mnemosyneの全体要件定義書が作成され、Phase 1の位置づけが明文化されていること |
| P1-PRE-002 | Phase 1作業計画書を、Phase 1実施内容および完了判定の基準文書として扱うこと           |
| P1-PRE-003 | Phase 1の検証対象として、Mnemosyne自身およびATSを使用できること              |
| P1-PRE-004 | 初期の正本をMarkdown docsおよびADRとする方針を採用すること                  |
| P1-PRE-005 | Notion、DB、RAG、API、MCP等をPhase 1必須成果物に含めないこと             |

---

## 5.6 Phase 1機能要件

### P1-FR-001 記憶方針管理

記憶として保持する情報、正本・副本・一次メモ・生成物の境界、およびAI操作権限を文書として定義できること。

#### 必須定義項目

* 正本として扱う情報
* 副本として扱う情報
* 一次メモとして扱う情報
* 生成物として扱う情報
* AIに許可する操作
* 人間承認が必要な操作
* 情報状態の扱い

#### 対応成果物

```text
docs/memory/memory-policy.md
```

---

### P1-FR-002 記憶分類管理

会話、メモ、既存文書から抽出する情報を、再利用可能な単位へ分類できること。

#### 必須分類

* `fact`
* `decision`
* `task`
* `issue`
* `idea`
* `constraint`
* `conversation_summary`
* `test_result`

#### 必須定義項目

* 各分類の意味
* 分類判断基準
* 類似分類との境界
* 誤分類を防ぐための例
* 将来追加候補の扱い

#### 対応成果物

```text
docs/memory/memory-taxonomy.md
```

---

### P1-FR-003 状態および参照優先順位管理

記憶情報や判断が競合する場合に、現在有効な情報を優先して参照できるよう、状態管理および参照優先順位を定義できること。

#### 必須状態

* `draft`
* `active`
* `superseded`
* `deprecated`
* `archived`

#### 必須参照対象

* Accepted / Active なADR
* `memory-policy.md`
* `active-decisions.md`
* `current-status.md`
* プロジェクト固有の設計docs
* review memo
* conversation summary
* 生のAIチャット履歴

#### 対応成果物

```text
docs/memory/context-source-priority.md
```

---

### P1-FR-004 記憶更新フロー管理

会話または検討メモから、正本へ反映可能な情報を抽出・整理・レビュー・反映する流れを定義できること。

#### 必須フロー

```text
会話またはメモ
  ↓
Conversation Summary作成
  ↓
Fact / Decision / Task / Issue / Idea / Constraint / Test Result へ分類
  ↓
正本更新候補の整理
  ↓
人間レビュー
  ↓
ADR / active-decisions / next-actions / current-status 等へ反映
```

#### 対応成果物

```text
docs/memory/memory-update-flow.md
```

---

### P1-FR-005 プロジェクト記憶テンプレート管理

複数のプロジェクトへ同一形式で適用できる記憶文書テンプレートを定義できること。

#### 必須テンプレート

| テンプレート                             | 目的                    |
| ---------------------------------- | --------------------- |
| `project-summary.template.md`      | プロジェクト概要・目的・スコープを記録する |
| `current-status.template.md`       | 現在地・進行事項・課題を記録する      |
| `active-decisions.template.md`     | 現在有効な判断を一覧化する         |
| `next-actions.template.md`         | 直近タスク・優先順位・完了条件を記録する  |
| `ai-entrypoint.template.md`        | AIが最初に読むべき情報を定義する     |
| `conversation-summary.template.md` | 会話を記憶候補へ変換する形式を定義する   |

#### 対応成果物

```text
docs/templates/memory/
```

---

### P1-FR-006 Mnemosyne初期記憶作成

Project Mnemosyne自身へ記憶テンプレートを適用し、基盤自身の目的・現在地・有効判断・次アクション・AI参照入口を記録できること。

#### 必須文書

```text
docs/projects/mnemosyne/memory/project-summary.md
docs/projects/mnemosyne/memory/current-status.md
docs/projects/mnemosyne/memory/active-decisions.md
docs/projects/mnemosyne/memory/next-actions.md
docs/projects/mnemosyne/memory/ai-entrypoint.md
```

#### 必須記録内容

* Mnemosyneの目的
* Phase構成
* 初期正本方針
* AI draft only 方針
* AgentとProject Contextの分離方針
* Phase 1の現在地と次アクション

---

### P1-FR-007 ATS適用検証

ATSへMnemosyneと同一のテンプレートを適用し、記憶構造が実プロジェクトで利用可能か検証できること。

#### 必須文書

```text
docs/projects/ats/memory/project-summary.md
docs/projects/ats/memory/current-status.md
docs/projects/ats/memory/active-decisions.md
docs/projects/ats/memory/next-actions.md
docs/projects/ats/memory/ai-entrypoint.md
docs/review/phase-1-ats-template-validation.md
```

#### 必須検証観点

| 検証観点                 | 確認内容                         |
| -------------------- | ---------------------------- |
| Project Summaryの十分性  | ATSの目的とMVP範囲を再現できるか          |
| Current Statusの十分性   | 現在の進捗・課題・保留判断を再現できるか         |
| Active Decisionsの十分性 | ATSの主要設計判断をAIが把握できるか         |
| Next Actionsの十分性     | 次に実行すべきタスクを判断できるか            |
| 情報鮮度管理               | 古い案と現在判断の競合を識別できるか           |
| Agent接続性             | 実装レビュー等に追加で必要なContextを整理できるか |

---

### P1-FR-008 初期ADR管理

Phase 1で採用する重要判断をADRとして記録できること。

#### 必須ADR

| ADR                                              | 判断内容                                               |
| ------------------------------------------------ | -------------------------------------------------- |
| `ADR-001-docs-as-source-of-memory.md`            | Markdown docsを初期の記憶正本とする                           |
| `ADR-002-memory-source-of-truth-boundary.md`     | docs / ADR / Notion / DB / Context Pack の責務境界を定義する |
| `ADR-003-human-approved-memory-update.md`        | AIはdraftまで、正本反映は人間承認後とする                           |
| `ADR-004-project-independent-memory-template.md` | プロジェクト横断で同一テンプレートを利用する                             |
| `ADR-005-agent-context-separation.md`            | 専門AgentとProject Contextを分離する                       |

---

### P1-FR-009 Agent接続方針整理

Phase 1で作成する記憶構造を、将来の汎用的な専門Agentが利用できるよう、AgentとProject Contextの接続方針を整理できること。

#### Phase 1で定義する内容

* AgentとProject Contextを分離する理由
* Agent種別ごとに必須となる参照文書
* Agent種別ごとに任意で追加する参照文書
* AIの書込み権限方針
* Phase 2で必要となるAgent Registry入力項目

#### Phase 1で実施しない内容

* Agent定義ファイルの実装
* Agent実行処理
* 自動Context選択
* Agent orchestration

---

### P1-FR-010 Phase 2入力要件整理

Phase 2でProject Registry、Agent RegistryおよびContext Pack Builderを設計できるよう、必要な入力項目を整理できること。

#### 整理対象

| 区分               | 入力項目候補                                                                                |
| ---------------- | ------------------------------------------------------------------------------------- |
| Project Registry | `project_code`、`project_name`、`memory_root`、`required_memory_docs`、`optional_sources` |
| Agent Registry   | `agent_code`、`purpose`、`context_requirements`、`output_type`、`write_policy`            |
| Context Builder  | Project指定、Agent指定、Task入力、出力先、参照文書選定ルール                                                |

#### 対応成果物

```text
docs/phases/phase-2-input-requirements.md
```

---

## 5.7 Phase 1非機能要件

| ID         | 非機能要件  | 内容                                              |
| ---------- | ------ | ----------------------------------------------- |
| P1-NFR-001 | 人間可読性  | すべての必須成果物はMarkdownを基本とし、人間がレビュー可能であること          |
| P1-NFR-002 | 追跡性    | 重要判断はADRへ記録され、判断理由を追跡できること                      |
| P1-NFR-003 | 再現性    | MnemosyneおよびATSについて、記憶文書を参照すれば新規チャットで文脈を再現できること |
| P1-NFR-004 | 安全性    | AIは正本へ直接書き込まず、草案作成までに限定されること                    |
| P1-NFR-005 | 情報鮮度   | 現在有効な判断と、置換済み・非推奨情報を識別できること                     |
| P1-NFR-006 | 汎用性    | 記憶テンプレートがATS専用構造にならず、他プロジェクトへ展開可能であること          |
| P1-NFR-007 | 段階的実装性 | RAG、API、MCP等が未実装でもPhase 1成果物のみで運用検証できること        |
| P1-NFR-008 | 運用負荷抑制 | 全会話を無条件に正本化せず、再利用価値のある内容を中心に記憶化すること             |

---

## 5.8 Phase 1制約

| ID       | 制約                                                                  |
| -------- | ------------------------------------------------------------------- |
| P1-C-001 | 初期正本はMarkdown docsおよびADRとする                                         |
| P1-C-002 | タスクの初期正本は `docs/projects/{project_code}/memory/next-actions.md` とする |
| P1-C-003 | Notion DBはPhase 1の必須成果物としない                                         |
| P1-C-004 | Notionを使用する場合も、初期段階では運用ビューまたは副本として扱う                                |
| P1-C-005 | PostgreSQLによる記憶管理をPhase 1へ導入しない                                     |
| P1-C-006 | RAG、Vector Store、Memory API、MCP ServerをPhase 1へ導入しない                |
| P1-C-007 | Context Pack BuilderをPhase 1で実装しない                                  |
| P1-C-008 | Agent RegistryおよびProject RegistryをPhase 1で実装しない                     |
| P1-C-009 | AIによる正本の無承認更新および削除を許可しない                                            |
| P1-C-010 | Phase 1の検証対象をMnemosyneおよびATSに限定する                                   |
| P1-C-011 | 記憶の最終配置方式をPhase 1で確定しない。Phase 1ではMnemosyne側で検証用に管理する                |

---

## 5.9 Phase 1成果物

### 5.9.1 必須成果物

#### A. Phase管理文書

| ファイル                                       | 目的                             |
| ------------------------------------------ | ------------------------------ |
| `docs/phases/phase-1-memory-foundation.md` | Phase 1の作業計画、マイルストーン、完了判定を管理する |

#### B. 記憶基盤の共通方針文書

| ファイル                                     | 目的                                              |
| ---------------------------------------- | ----------------------------------------------- |
| `docs/memory/memory-policy.md`           | 正本・副本・状態管理・AI更新ルールを定義する                         |
| `docs/memory/memory-taxonomy.md`         | Fact / Decision / Task / Issue / Idea 等の分類を定義する |
| `docs/memory/memory-update-flow.md`      | 会話やメモから正本へ反映する手順を定義する                           |
| `docs/memory/context-source-priority.md` | 情報競合時の参照優先順位を定義する                               |

#### C. プロジェクト記憶テンプレート

| ファイル                                                     |
| -------------------------------------------------------- |
| `docs/templates/memory/project-summary.template.md`      |
| `docs/templates/memory/current-status.template.md`       |
| `docs/templates/memory/active-decisions.template.md`     |
| `docs/templates/memory/next-actions.template.md`         |
| `docs/templates/memory/ai-entrypoint.template.md`        |
| `docs/templates/memory/conversation-summary.template.md` |

#### D. Mnemosyne自身の初期記憶文書

| ファイル                                                 |
| ---------------------------------------------------- |
| `docs/projects/mnemosyne/memory/project-summary.md`  |
| `docs/projects/mnemosyne/memory/current-status.md`   |
| `docs/projects/mnemosyne/memory/active-decisions.md` |
| `docs/projects/mnemosyne/memory/next-actions.md`     |
| `docs/projects/mnemosyne/memory/ai-entrypoint.md`    |

#### E. ATS検証用記憶文書

| ファイル                                             |
| ------------------------------------------------ |
| `docs/projects/ats/memory/project-summary.md`    |
| `docs/projects/ats/memory/current-status.md`     |
| `docs/projects/ats/memory/active-decisions.md`   |
| `docs/projects/ats/memory/next-actions.md`       |
| `docs/projects/ats/memory/ai-entrypoint.md`      |
| `docs/review/phase-1-ats-template-validation.md` |

#### F. ADR

| ファイル                                                      |
| --------------------------------------------------------- |
| `docs/adr/ADR-001-docs-as-source-of-memory.md`            |
| `docs/adr/ADR-002-memory-source-of-truth-boundary.md`     |
| `docs/adr/ADR-003-human-approved-memory-update.md`        |
| `docs/adr/ADR-004-project-independent-memory-template.md` |
| `docs/adr/ADR-005-agent-context-separation.md`            |

#### G. Phase 2引継ぎ文書

| ファイル                                        | 目的                                                                 |
| ------------------------------------------- | ------------------------------------------------------------------ |
| `docs/phases/phase-2-input-requirements.md` | Project Registry / Agent Registry / Context Pack Builderの入力項目を整理する |

### 5.9.2 任意成果物

| ファイルまたは機能          | 扱い                                          |
| ------------------ | ------------------------------------------- |
| Notion Project DB  | Markdown運用では不足する場合のみ設計または作成する               |
| Notion Decision DB | 判断一覧の可視化が必要になった場合のみ設計または作成する                |
| Notion Task DB     | `next-actions.md` の副本または運用ビューとして必要な場合のみ作成する |
| `README.md` 更新     | 実際にリポジトリを構築し、導線が必要になった場合に行う                 |

### 5.9.3 Phase 1作業計画書への追加判断が必要な候補

以下は全体要件上の必要性が高いが、Phase 1作業計画書の必須成果物へ追加する場合は、作業計画書側の更新を伴うものとする。

| ファイル                                     | 論点                                        |
| ---------------------------------------- | ----------------------------------------- |
| `docs/glossary.md`                       | 正本、副本、Context、Agent、ADR等の用語を早期に固定する必要性がある |
| `docs/memory/context-layering-policy.md` | Context階層定義をPhase 1でどこまで確定するか判断が必要である     |
| `docs/mvp-scope.md`                      | 初期MVP境界を独立文書として残すか判断が必要である                |

---

## 5.10 Phase 1推奨ディレクトリ構成

```text
project-mnemosyne/
  docs/
    phases/
      phase-1-memory-foundation.md
      phase-2-input-requirements.md

    memory/
      memory-policy.md
      memory-taxonomy.md
      memory-update-flow.md
      context-source-priority.md

    templates/
      memory/
        project-summary.template.md
        current-status.template.md
        active-decisions.template.md
        next-actions.template.md
        ai-entrypoint.template.md
        conversation-summary.template.md

    projects/
      mnemosyne/
        memory/
          project-summary.md
          current-status.md
          active-decisions.md
          next-actions.md
          ai-entrypoint.md

      ats/
        memory/
          project-summary.md
          current-status.md
          active-decisions.md
          next-actions.md
          ai-entrypoint.md

    adr/
      ADR-001-docs-as-source-of-memory.md
      ADR-002-memory-source-of-truth-boundary.md
      ADR-003-human-approved-memory-update.md
      ADR-004-project-independent-memory-template.md
      ADR-005-agent-context-separation.md

    review/
      phase-1-ats-template-validation.md
```

---

## 5.11 Phase 1完了条件

### 5.11.1 Definition of Done

Phase 1は、以下をすべて満たした時点で完了とする。

| No.    | 完了条件                                     | 判定観点                                                       |
| ------ | ---------------------------------------- | ---------------------------------------------------------- |
| DoD-01 | Phase 1の目的・対象範囲・対象外・制約が文書化されている          | Phaseの境界が曖昧でない                                             |
| DoD-02 | `memory-policy.md` が作成されている              | 正本・副本・AI権限が判断できる                                           |
| DoD-03 | `memory-taxonomy.md` が作成されている            | Fact / Decision / Task / Issue / Idea / Constraint 等を分類できる |
| DoD-04 | `context-source-priority.md` が作成されている    | 情報競合時の参照順序を判断できる                                           |
| DoD-05 | `memory-update-flow.md` が作成されている         | 会話から正本反映までの手順を説明できる                                        |
| DoD-06 | 記憶テンプレート6種類が作成されている                      | 新規プロジェクトへ同一形式を適用できる                                        |
| DoD-07 | Mnemosyne自身の初期記憶文書が作成されている               | 新規チャットでMnemosyneの現在地を再現できる                                 |
| DoD-08 | ATSの検証用記憶文書が作成されている                      | 実プロジェクトへ同一構造を適用できる                                         |
| DoD-09 | ATS適用検証結果が記録されている                        | テンプレートの不足・過剰項目が把握できる                                       |
| DoD-10 | ADR-001〜ADR-005が作成されている                  | 初期判断と理由が追跡できる                                              |
| DoD-11 | Phase 2入力要件が整理されている                      | RegistryおよびContext Builder設計へ進める                           |
| DoD-12 | AIへ渡すべき基本文書を判断できる                        | `ai-entrypoint.md` が利用可能である                                |
| DoD-13 | Notion、DB、RAG、API、MCP、Agent実行へ不要に着手していない | Phase 1スコープを維持している                                         |

### 5.11.2 完了判定

| 判定             | 条件                                        |
| -------------- | ----------------------------------------- |
| Go             | 全DoDを満たし、ATS検証で致命的な不足がない                  |
| Conditional Go | 軽微なテンプレート修正をPhase 2初期に行う前提で、Context設計へ進める |
| No Go          | 正本境界、分類、AI権限、テンプレート汎用性のいずれかが未確定である        |

---

## 5.12 Phase 1からPhase 2への引継ぎ要件

Phase 1完了時には、Phase 2へ以下を引き継ぐこと。

| ID        | 引継ぎ事項              | 内容                                         |
| --------- | ------------------ | ------------------------------------------ |
| P1-HO-001 | 記憶正本構造             | Phase 2が読み取るべき文書構成と保存先                     |
| P1-HO-002 | 記憶分類               | Contextへ含めるFact / Decision / Task等の分類      |
| P1-HO-003 | 情報鮮度ルール            | active / superseded / deprecated等の参照制御     |
| P1-HO-004 | AI更新境界             | Context Pack生成後も正本更新は人間承認とする方針             |
| P1-HO-005 | Project Registry入力 | project_code、memory_root、必須文書、任意文書等        |
| P1-HO-006 | Agent Registry入力   | agent_code、目的、必要Context、出力形式、write policy等 |
| P1-HO-007 | ATS検証結果            | Context Pack生成に必要な追加情報およびテンプレート改善点         |
| P1-HO-008 | 未決定事項              | Notion導入、配置方式、追加分類等の継続検討事項                 |

---

## 5.13 Phase 1時点の未決定事項

| ID        | 論点                                               | Phase 1での扱い          | 後続判断                        |
| --------- | ------------------------------------------------ | -------------------- | --------------------------- |
| P1-OI-001 | 記憶文書の最終配置をMnemosyne集中管理とするか、各プロジェクト側管理とするか       | Mnemosyne配下で検証用に保持する | Phase 2以降に判断                |
| P1-OI-002 | Notion DBを導入するか                                  | 必須成果物としない            | Markdown運用検証後に判断            |
| P1-OI-003 | `preference` を基本分類に含めるか                          | 候補として残す              | `memory-taxonomy.md` 作成時に判断 |
| P1-OI-004 | `article_note` を基本分類に含めるか                        | 候補として残す              | `memory-taxonomy.md` 作成時に判断 |
| P1-OI-005 | `docs/glossary.md` をPhase 1必須成果物へ追加するか           | 早期作成候補とする            | Phase 1作業計画書改訂時に判断          |
| P1-OI-006 | `context-layering-policy.md` をPhase 1必須成果物へ追加するか | 全体要件上は必要性あり          | Phase 1作業計画書改訂時に判断          |

---

# 6. 次分冊で定義する範囲

次分冊では、以下を定義する。

```text
Phase 2：Context Forge
  - Project Registry
  - Agent Registry
  - Context Pack標準構造
  - Context Builder
  - Context Preview
  - Phase 1成果物の読込ルール
  - 初期MVP完了条件
```

Phase 2は、Phase 1で確定した記憶構造を実際にAIへ渡す仕組みへ変換するPhaseであり、初期MVPの区切りとなる。

## 今回の確定・保留整理

| 項目                                     | 扱い                                  |
| -------------------------------------- | ----------------------------------- |
| 今回の作成範囲                                | 共通定義 + Phase 1                      |
| Phase 1必須成果物                           | Phase 1作業計画書に合わせて定義                 |
| `docs/projects/{project_code}/memory/` | Phase 1検証時のプロジェクト固有記憶配置として採用        |
| Notion DB                              | Phase 1必須外。必要時のみ任意成果物               |
| `Fact`                                 | Phase 1必須分類へ反映                      |
| `glossary.md`                          | 必要性は高いが、Phase 1必須成果物化には作業計画書側の更新が必要 |
| 次に作成する範囲                               | Phase 2：Context Forge               |

## Conversation Memory

### fact

* JP: Project Mnemosyneは、AIとの会話・判断・タスク・設計資産を再利用可能な外部記憶として整理し、将来的に汎用専門AgentとProject Contextを組み合わせて利用する基盤として設計されている。 / EN: Project Mnemosyne is designed as an external memory base for reusable AI conversations, decisions, tasks, and design assets, with future use of reusable specialist agents combined with project context.
* JP: Phase 1作業計画書は、Markdown docsとADRを初期正本とし、MnemosyneとATSで同一テンプレートを検証する方針を定義している。 / EN: The Phase 1 plan defines Markdown docs and ADRs as the initial source of truth and validates the same template with Mnemosyne and ATS.
* JP: 本回答では、`docs/requirements/phase-requirements.md` の共通定義およびPhase 1部分のドラフトを作成した。 / EN: This response created the common definitions and Phase 1 draft for `docs/requirements/phase-requirements.md`.

### decision

* JP: フェーズ別要件定義書は一括作成せず、第1分冊として共通定義とPhase 1までを先に定義する。 / EN: The phase requirements document will be created in sections, starting with common definitions and Phase 1.
* JP: Phase 1の要件・成果物・完了条件は、Phase 1作業計画書を整合基準として定義する。 / EN: Phase 1 requirements, deliverables, and completion criteria are defined using the Phase 1 plan as the alignment baseline.
* JP: Phase 1では、`docs/projects/{project_code}/memory/` にMnemosyneおよびATSの検証用記憶を配置する。 / EN: In Phase 1, validation memory for Mnemosyne and ATS is placed under `docs/projects/{project_code}/memory/`.
* JP: Phase 1で扱う必須分類に `fact` を含める。 / EN: `fact` is included as a required memory type in Phase 1.

### task

* JP: 次分冊として、Phase 2：Context Forge の要件定義を作成する。 / EN: Create the next section defining requirements for Phase 2: Context Forge.
* JP: `docs/glossary.md` と `docs/memory/context-layering-policy.md` をPhase 1必須成果物へ追加する場合は、Phase 1作業計画書にも反映して整合を取る。 / EN: If `docs/glossary.md` and `docs/memory/context-layering-policy.md` become mandatory Phase 1 deliverables, update the Phase 1 plan accordingly.

### preference

* JP: 文書は区切りのよい単位で作成・レビューし、後続Phaseへ段階的に進める方針が採用されている。 / EN: Documents are created and reviewed in clear sections before moving to later phases.
* JP: 自動化より先に、正本構造・分類・更新運用を文書で固定する進め方を重視する。 / EN: The approach prioritizes defining sources of truth, classification, and update operations before automation.

### constraint

* JP: Phase 1では、Context Pack CLI、Registry実装、RAG、PostgreSQL記憶管理、API、MCP、Agent実行、自動更新、UIを対象外とする。 / EN: Phase 1 excludes the Context Pack CLI, registry implementation, RAG, PostgreSQL memory management, APIs, MCP, agent execution, automatic updates, and UI.
* JP: AIは正本文書を無承認で直接更新または削除しない。 / EN: AI must not directly update or delete source-of-truth documents without approval.
* JP: Notion DBはPhase 1の必須成果物とせず、必要性が確認された場合のみ副本または運用ビューとして扱う。 / EN: Notion databases are not mandatory Phase 1 deliverables and are used only as optional secondary views when needed.

### issue

* JP: `docs/glossary.md` をPhase 1必須成果物へ昇格するかは、Phase 1作業計画書への反映を含めて未決定である。 / EN: It remains undecided whether `docs/glossary.md` should become a mandatory Phase 1 deliverable, including an update to the Phase 1 plan.
* JP: `context-layering-policy.md` をPhase 1必須成果物として扱うかは未確定である。 / EN: It is not yet decided whether `context-layering-policy.md` is a mandatory Phase 1 deliverable.
* JP: 記憶文書の最終配置をMnemosyne集中管理とするか、各プロジェクト側へ配置するかは後続Phaseで判断する。 / EN: The final choice between centralized Mnemosyne storage and project-owned storage will be decided in a later phase.

### idea

* JP: Phase 2では、Project Registry、Agent Registry、Context Builder、Context Previewを一体として定義すると、初期MVP境界が明確になる。 / EN: Defining Project Registry, Agent Registry, Context Builder, and Context Preview together in Phase 2 can make the initial MVP boundary clear.

### article_note

* JP: 外部記憶基盤の最初の成果は検索機能ではなく、何を正本とし、どう分類し、どの文脈をAgentへ渡すかを定義できる文書構造である。 / EN: The first result of an external memory base is not search, but a document structure that defines sources of truth, classification, and context delivery to agents.

### conversation_summary

* JP: 本チャットでは、汎用専門Agent化に伴う要件定義書の修正内容をレビューし、Phase 1作業計画書を基準として全体要件定義書を再作成した。続いて、フェーズ別要件定義書を分割作成する方針とし、第1分冊として共通定義およびPhase 1の目的、対象範囲、機能要件、成果物、完了条件、Phase 2引継ぎ要件を整理した。 / EN: This chat reviewed requirement changes for reusable specialist agents, recreated the overall requirements using the Phase 1 plan as the baseline, and then started the phased requirements document. The first section now defines common rules and Phase 1 objectives, scope, requirements, deliverables, completion criteria, and handoff to Phase 2.

### test_result

* JP: Phase 1作業計画書との整合確認に基づき、単一プロジェクト型の保存先、Notion必須化、`Fact` 欠落、Agent実装のスコープ混入を避けたPhase 1要件ドラフトを作成できた。 / EN: Based on alignment with the Phase 1 plan, a Phase 1 requirements draft was created that avoids single-project paths, mandatory Notion use, missing `Fact`, and accidental inclusion of agent implementation.
