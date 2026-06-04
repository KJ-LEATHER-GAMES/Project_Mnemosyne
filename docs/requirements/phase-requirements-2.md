Phase 2では、旧案の「Project Context Pack / Session Context Pack / Agent Context Pack / Task Context Packを個別に作成する」という表現を整理し、**各Contextを構成要素として選択・結合し、最終的に1つのContext Packを生成する**要件へ改めます。

これは、Phase 1で整理した「専門Agentとプロジェクトを選ぶだけで、必要文脈を集めるContext Pack Builderへ接続する」という方針、および「専門Agent × Project Context」という抽象化に整合します。  

以下は、前回作成した `docs/requirements/phase-requirements.md` の **Phase 1記載後へ続けて追記する本文**です。

# 7. Phase 2：Context Forge

## 副題：AIに渡す文脈を鍛造する

---

## 7.1 Phase概要

| 項目         | 内容                                                           |
| ---------- | ------------------------------------------------------------ |
| Phase      | Phase 2                                                      |
| 名称         | Context Forge                                                |
| 副題         | AIに渡す文脈を鍛造する                                                 |
| 主目的        | Phase 1で整備した正本文書から、作業目的に応じたContext Packを生成できるようにする           |
| 実装レベル      | 設定ファイル設計、Context組成ルール、CLI試作                                  |
| 主入力        | Phase 1で作成した記憶文書、ADR、検証結果、Phase 2入力要件                        |
| 主出力        | Context Pack、Project Registry、Agent Registry、Context Builder |
| 初期対象プロジェクト | Project Mnemosyne / ATS                                      |
| 初期対象Agent  | 最小限の代表Agent定義                                                |
| 次Phaseとの接続 | Phase 3で、必要文書の検索・抽出を自動化できる状態を作る                              |

---

## 7.2 Phase 2の位置づけ

Phase 1では、AIが参照する情報について、以下を確定する。

* 何を正本とするか
* どのように分類するか
* どの情報を現在有効と扱うか
* AIにどこまで更新を許可するか
* プロジェクトごとの記憶をどの構造で持つか

Phase 2では、その正本文書を人間が毎回手作業で集めてAIへ渡すのではなく、**対象プロジェクト、利用する専門Agent、および今回のタスクを指定することで、必要な文脈を1つのContext Packとして組成する仕組み**を作る。

```text
Phase 1：
記憶として何を残し、何を正とするかを決める

Phase 2：
正しい記憶から、今回の作業に必要な文脈を組み立てる
```

---

## 7.3 Phase 2の重要な設計整理

### 7.3.1 Context Packは1つの生成物とする

従来案では、以下のような表現が想定されていた。

* Project Context Pack
* Session Context Pack
* Agent Context Pack
* Task Context Pack

しかし、Phase 2ではこれらを個別の成果物として乱立させず、**Context Packを構成するContext Component**として扱う。

```text
Base Context
  +
Agent Context
  +
Project Context
  +
Session Context（任意）
  +
Recent Conversation Context（任意）
  +
Task Context
  ↓
1つのContext Packを生成
```

### 7.3.2 Context Componentの役割

| Context Component           | 内容                         | 必須性 |
| --------------------------- | -------------------------- | --- |
| Base Context                | 全Agent共通の安全制約、正本参照ルール、出力原則 | 必須  |
| Agent Context               | Agentの目的、参照範囲、禁止事項、期待出力    | 必須  |
| Project Context             | プロジェクト概要、現在地、有効判断、次アクション   | 必須  |
| Session Context             | 現在の作業セッションに固有の検討状況         | 任意  |
| Recent Conversation Context | 直近会話で確定または保留となった内容         | 任意  |
| Task Context                | 今回の依頼、対象ファイル、確認観点、期待成果物    | 必須  |

### 7.3.3 Context Packは正本ではない

Context Packは、正本文書をAIへ渡すために組み替えた生成物である。

そのため、Context Pack内に新しい判断やタスクが記載されたとしても、正本側へ反映されるまでは正式な記憶とは扱わない。

| 情報               | 扱い                       |
| ---------------- | ------------------------ |
| Phase 1で作成した正本文書 | Context Pack生成の入力        |
| ADR              | 判断根拠として読み込む正本            |
| Registry         | Context Pack生成時の選択・組成ルール |
| Context Pack     | AI入力用の生成物                |
| AI回答内の新規判断・タスク   | 正本反映前の候補                 |

---

## 7.4 Phase 2の目的

### 7.4.1 主目的

```text
Phase 1で整備した記憶の正本構造を入力とし、
Project × Agent × Task の組み合わせに応じて、
AIが作業を開始するために必要なContext Packを生成できるようにする。
```

### 7.4.2 具体目的

| ID         | 目的                                                          |
| ---------- | ----------------------------------------------------------- |
| P2-OBJ-001 | Context Packの標準構造を定義する                                      |
| P2-OBJ-002 | Context Packへ含めるContext Componentと読み込み順序を定義する               |
| P2-OBJ-003 | Project Registryを定義し、対象プロジェクトと記憶文書保存先を選択できるようにする            |
| P2-OBJ-004 | Agent Registryを定義し、作業目的に応じた専門Agentを選択できるようにする               |
| P2-OBJ-005 | Project ContextとAgent Contextを組み合わせてContext Packを生成できるようにする |
| P2-OBJ-006 | Task Contextを入力し、今回の作業内容と期待成果物をContext Packへ反映できるようにする      |
| P2-OBJ-007 | Context Pack生成前に、読み込まれる情報を人間が確認できるようにする                     |
| P2-OBJ-008 | MnemosyneおよびATSでContext Pack生成を検証する                         |
| P2-OBJ-009 | Phase 3の検索・動的抽出導入に備え、手動または固定参照で不足する情報を整理する                  |

---

## 7.5 Phase 2で解決する課題

| 課題ID       | 課題                              | Phase 2での解決内容                            |
| ---------- | ------------------------------- | ---------------------------------------- |
| P2-ISS-001 | AIへ渡す文脈を毎回手作業で集める必要がある          | Context Builderにより必要文書を組成する              |
| P2-ISS-002 | プロジェクト変更時に参照先が曖昧になる             | Project Registryで保存先と必須文書を管理する           |
| P2-ISS-003 | 同じプロジェクトでも作業目的により必要情報が異なる       | Agent RegistryでAgent別の必要Contextを定義する     |
| P2-ISS-004 | Agent定義とプロジェクト情報が混在する           | Agent ContextとProject Contextを分離して組み合わせる |
| P2-ISS-005 | Context Packへ古い判断や不要情報を含める恐れがある | Phase 1の状態管理・参照優先順位に基づき読み込む              |
| P2-ISS-006 | AIへ渡す前に内容を確認できない                | Context Previewを生成し、人間が確認可能にする           |
| P2-ISS-007 | 文書量増加により固定読み込みが限界になる            | Phase 3で検索が必要となる条件を検証結果として残す             |

---

## 7.6 Phase 2の前提条件

| ID         | 前提条件                                                                       |
| ---------- | -------------------------------------------------------------------------- |
| P2-PRE-001 | Phase 1が `Go` または `Conditional Go` と判定されていること                              |
| P2-PRE-002 | `memory-policy.md` に正本・副本・AI更新権限が定義されていること                                 |
| P2-PRE-003 | `memory-taxonomy.md` に記憶分類が定義されていること                                       |
| P2-PRE-004 | `context-source-priority.md` に参照優先順位が定義されていること                             |
| P2-PRE-005 | MnemosyneおよびATSのプロジェクト記憶文書が作成されていること                                       |
| P2-PRE-006 | ADR-001〜ADR-005が作成され、AgentとProject Contextの分離方針が確認できること                    |
| P2-PRE-007 | `phase-2-input-requirements.md` にRegistryおよびContext Builderの入力項目が整理されていること |
| P2-PRE-008 | ATS適用検証により、Context生成に必要な基本文書が確認されていること                                     |

---

## 7.7 Phase 2の対象範囲

### 7.7.1 対象に含めるもの

| 分類          | 対象内容                                         |
| ----------- | -------------------------------------------- |
| Context標準化  | Context Packの章構成、必須項目、生成ルール                  |
| Project選択   | Project Registryによる対象プロジェクト指定                |
| Agent選択     | Agent Registryによる専門Agent指定                   |
| Task入力      | 今回の依頼・対象ファイル・成果物・制約の入力                       |
| Context組成   | Base / Agent / Project / Task / 任意Contextの結合 |
| Preview     | 生成前または生成時に読み込み対象を確認可能にする                     |
| CLI試作       | コマンド実行によりContext Packを生成する                   |
| 出力管理        | 生成したContext Packを確認可能なMarkdownとして保存する        |
| 検証          | MnemosyneおよびATSを用いた生成結果の確認                   |
| Phase 3入力整理 | 固定参照では不足する検索要件の洗い出し                          |

### 7.7.2 対象に含めないもの

| 対象外                             | 理由                                |
| ------------------------------- | --------------------------------- |
| RAG / Embedding / Vector Search | Phase 3で扱うため                      |
| 自然文クエリによる関連文書自動検索               | Phase 3で扱うため                      |
| PostgreSQLによるContext管理          | Markdownおよび設定ファイルで初期検証可能なため       |
| Memory API                      | Phase 4で扱うため                      |
| MCP Server                      | Phase 5で扱うため                      |
| AIモデルへの自動送信                     | Phase 2では生成と確認までを対象とするため          |
| AI回答の自動正本反映                     | 人間承認境界を維持するため                     |
| Agentによる自律タスク実行                 | Phase 2はContext組成基盤であり、実行基盤ではないため |
| GUI / Web UI                    | CLI運用の成立確認後に検討するため                |
| Notionからの自動Context取得            | Phase 1でNotionを正本としていないため         |

---

## 7.8 Phase 2機能要件

### P2-FR-001 Context Pack標準構造定義

AIへ渡すContext Packについて、標準となる章構成と各章の役割を定義できること。

#### 標準構成

```md
# Context Pack

## 1. Build Metadata

## 2. Base Context

## 3. Agent Context

## 4. Project Context

## 5. Current Status

## 6. Active Decisions

## 7. Next Actions

## 8. Session Context

## 9. Recent Conversation Context

## 10. Task Context

## 11. Constraints and Write Policy

## 12. Referenced Sources
```

#### 必須章・任意章

| 章                            | 必須性 | 内容                                |
| ---------------------------- | --- | --------------------------------- |
| Build Metadata               | 必須  | 生成日時、対象project、対象agent、入力タスク、生成方式 |
| Base Context                 | 必須  | 共通制約および参照原則                       |
| Agent Context                | 必須  | 選択したAgentの役割・禁止事項・期待出力            |
| Project Context              | 必須  | プロジェクト概要                          |
| Current Status               | 必須  | 現在地、課題、保留判断                       |
| Active Decisions             | 必須  | 現在有効な判断および関連ADR                   |
| Next Actions                 | 必須  | 現在のタスク状況                          |
| Session Context              | 任意  | 現在セッション固有の背景                      |
| Recent Conversation Context  | 任意  | 直近会話の要約                           |
| Task Context                 | 必須  | 今回の具体依頼・対象・成果物                    |
| Constraints and Write Policy | 必須  | AI操作境界、禁止事項                       |
| Referenced Sources           | 必須  | 読み込んだ正本文書と状態                      |

#### 対応成果物

```text
docs/context/context-pack-format.md
templates/context/context-pack.template.md
```

---

### P2-FR-002 Context読み込みルール定義

Context Packを生成する際に、どの文書を必須で読み込み、どの文書を条件に応じて追加するかを定義できること。

#### 常時読み込み対象

| Context          | 読み込み対象                          |
| ---------------- | ------------------------------- |
| Base Context     | 共通ルール定義またはCLIに設定した共通制約          |
| Project Context  | `project-summary.md`            |
| Current Status   | `current-status.md`             |
| Active Decisions | `active-decisions.md` および必要なADR |
| Next Actions     | `next-actions.md`               |
| Write Policy     | `memory-policy.md` のAI更新境界      |

#### 条件付き読み込み対象

| 条件               | 読み込み候補                      |
| ---------------- | --------------------------- |
| Agentに特定の設計文書が必要 | Agent Registryで指定された追加docs  |
| 直近会話を引き継ぐ必要がある   | Conversation Summary        |
| 検証結果を参照する必要がある   | `test_result` またはreview文書   |
| Phase移行判断を扱う     | phase文書、review記録            |
| ADR作成・更新を扱う      | 関連ADR、active-decisions、判断候補 |

#### 参照制御

* `active` または `accepted` な情報を優先して含める。
* `superseded` または `deprecated` な情報は、履歴比較が必要な場合のみ含める。
* `draft` または `proposed` な情報を含める場合は、未確定であることをContext Pack上に明示する。
* 読み込んだ文書パスと状態を `Referenced Sources` へ記載する。

#### 対応成果物

```text
docs/context/context-build-rule.md
```

---

### P2-FR-003 Project Registry定義

Context Pack生成時に対象プロジェクトを指定できるよう、プロジェクトと記憶文書保存先を管理するProject Registryを定義できること。

#### 必須管理項目

| 項目                     | 内容                       |
| ---------------------- | ------------------------ |
| `project_code`         | CLI等で指定する一意なプロジェクトコード    |
| `project_name`         | 表示用名称                    |
| `status`               | active / archived 等の利用状態 |
| `memory_root`          | プロジェクト記憶文書のルートパス         |
| `required_memory_docs` | 常時読み込む基本記憶文書             |
| `optional_sources`     | 作業種別に応じて参照可能な文書群         |
| `default_constraints`  | 当該プロジェクト固有の制約            |
| `related_projects`     | 必要な場合の関連プロジェクト情報         |

#### 初期登録対象

| project_code | project_name           | 目的                   |
| ------------ | ---------------------- | -------------------- |
| `mnemosyne`  | Project Mnemosyne      | 記憶基盤自身のContext生成検証   |
| `ats`        | Adventure Token System | 実プロジェクトでのContext生成検証 |

#### 設定ファイル例

```yaml
projects:
  - project_code: mnemosyne
    project_name: Project Mnemosyne
    status: active
    memory_root: docs/projects/mnemosyne/memory
    required_memory_docs:
      - project-summary.md
      - current-status.md
      - active-decisions.md
      - next-actions.md
      - ai-entrypoint.md
    optional_sources:
      - docs/adr
      - docs/review

  - project_code: ats
    project_name: Adventure Token System
    status: active
    memory_root: docs/projects/ats/memory
    required_memory_docs:
      - project-summary.md
      - current-status.md
      - active-decisions.md
      - next-actions.md
      - ai-entrypoint.md
    optional_sources:
      - docs/adr
      - docs/review
```

#### 対応成果物

```text
config/projects.yaml
docs/context/project-registry-spec.md
```

---

### P2-FR-004 Agent Registry定義

Context Pack生成時に作業目的に応じた専門Agentを選択できるよう、Agentの目的、参照範囲、制約、出力形式を管理するAgent Registryを定義できること。

#### 必須管理項目

| 項目                  | 内容                     |
| ------------------- | ---------------------- |
| `agent_code`        | CLI等で指定する一意なAgentコード   |
| `agent_name`        | 表示用名称                  |
| `purpose`           | Agentの目的               |
| `required_context`  | 必須となるContext Component |
| `optional_sources`  | 作業時に追加参照する文書種別         |
| `forbidden_actions` | Agentが行ってはならない操作       |
| `output_type`       | 期待する成果物形式              |
| `write_policy`      | 正本更新権限の扱い              |
| `review_points`     | 人間が確認すべき観点             |

#### 初期定義対象

Phase 2で全Agent候補を網羅する必要はない。Context Builderの汎用性を検証するため、初期対象は以下の最小構成とする。

| agent_code                | Agent名        | 選定理由                  |
| ------------------------- | ------------- | --------------------- |
| `requirements_reviewer`   | 要件定義レビューAgent | Mnemosyne文書整備に直接利用できる |
| `implementation_reviewer` | 実装レビューAgent   | ATSで異なる参照文書要件を検証できる   |

#### 将来追加候補

| agent_code候補     | Agent名       |
| ---------------- | ------------ |
| `adr_writer`     | ADR整理Agent   |
| `task_planner`   | タスク分解Agent   |
| `article_writer` | 記事化Agent     |
| `docs_updater`   | 文書更新案作成Agent |

#### 設定ファイル例

```yaml
agents:
  - agent_code: requirements_reviewer
    agent_name: 要件定義レビューAgent
    purpose: 要件定義書と関連方針文書の整合性を確認し、修正案を提示する
    required_context:
      - base_context
      - agent_context
      - project_context
      - current_status
      - active_decisions
      - task_context
    optional_sources:
      - phase_documents
      - adr
      - review_documents
    forbidden_actions:
      - Treat proposed content as accepted decisions
      - Update source-of-truth documents without human approval
    output_type: review_report_and_revision_draft
    write_policy: draft_only

  - agent_code: implementation_reviewer
    agent_name: 実装レビューAgent
    purpose: 実装と設計文書の整合性を確認し、修正候補を提示する
    required_context:
      - base_context
      - agent_context
      - project_context
      - current_status
      - active_decisions
      - task_context
    optional_sources:
      - architecture_documents
      - test_documents
      - source_files
    forbidden_actions:
      - Change production code without explicit instruction
      - Update source-of-truth documents without human approval
    output_type: implementation_review_report
    write_policy: draft_only
```

#### 対応成果物

```text
config/agents.yaml
docs/context/agent-registry-spec.md
```

---

### P2-FR-005 Task Context入力

Context Pack生成時に、ユーザーが今回実施したい作業内容をTask Contextとして入力できること。

#### 必須入力項目

| 項目                | 内容            |
| ----------------- | ------------- |
| `task_title`      | 今回の作業名称       |
| `task_request`    | AIへ依頼する具体内容   |
| `expected_output` | 期待する成果物       |
| `target_files`    | 対象となる文書またはコード |
| `constraints`     | 今回固有の制約       |
| `review_points`   | 確認してほしい観点     |

#### 入力方法

初期実装では、以下のいずれかを許容する。

| 方法                | 用途             |
| ----------------- | -------------- |
| Markdownファイル指定    | 長い依頼やレビュー作業    |
| CLI引数             | 簡易なContext生成確認 |
| 標準入力またはテンプレートファイル | 将来の柔軟な運用       |

#### 対応成果物

```text
templates/context/task-context.template.md
examples/context/tasks/
```

---

### P2-FR-006 Context Builder実装

Project Registry、Agent Registry、Task ContextおよびPhase 1正本文書を入力として、Context Packを生成するCLIを実装できること。

#### 基本処理

```text
プロジェクトを指定
  ↓
Agentを指定
  ↓
Task Contextを指定
  ↓
Project Registryから正本文書保存先を取得
  ↓
Agent Registryから必要Contextと追加参照候補を取得
  ↓
正本文書・ADR・任意Contextを読み込む
  ↓
状態および参照優先順位を確認する
  ↓
Context Previewを生成する
  ↓
Context PackをMarkdown出力する
```

#### CLI利用例

```bash
npm run context:build -- \
  --project ats \
  --agent implementation_reviewer \
  --task examples/context/tasks/ats-usecase-review.md
```

```bash
npm run context:build -- \
  --project mnemosyne \
  --agent requirements_reviewer \
  --task examples/context/tasks/phase2-requirements-review.md
```

#### 出力先

```text
dist/context/{project_code}/{agent_code}/{generated_at}-context-pack.md
```

#### 対応成果物

```text
scripts/context-build.ts
```

---

### P2-FR-007 Context Preview生成

Context PackをAIへ渡す前に、どの情報が読み込まれ、どの情報が除外または警告対象となったかを人間が確認できること。

#### Preview記載項目

| 項目                          | 内容                                       |
| --------------------------- | ---------------------------------------- |
| Selected Project            | 指定されたプロジェクト                              |
| Selected Agent              | 指定されたAgent                               |
| Selected Task               | 指定されたTask Context                        |
| Required Sources            | 必須として読み込む文書                              |
| Optional Sources Included   | 条件により追加した文書                              |
| Sources Skipped             | 参照対象外または存在しなかった文書                        |
| Status Warnings             | draft / superseded / deprecated 情報に関する注意 |
| Estimated Context Structure | 出力予定の章構成                                 |
| Write Policy                | AIが行える操作範囲                               |

#### 出力先

```text
dist/context-preview/{project_code}/{agent_code}/{generated_at}-preview.md
```

#### 対応成果物

```text
scripts/context-preview.ts
docs/context/context-preview-rule.md
```

---

### P2-FR-008 Context Pack出力管理

生成したContext Packを、利用目的と生成元を追跡可能な形で保存できること。

#### 必須メタデータ

| 項目                  | 内容                  |
| ------------------- | ------------------- |
| `generated_at`      | 生成日時                |
| `project_code`      | 対象プロジェクト            |
| `agent_code`        | 対象Agent             |
| `task_title`        | 今回の作業               |
| `source_documents`  | 読み込んだ正本文書           |
| `source_status`     | 読み込み時点の状態           |
| `generator_version` | Context Builderの版識別 |
| `write_policy`      | AIへ許可する操作方針         |

#### 管理ルール

* Context Packは生成物であり、正本として更新しない。
* Context Packから新しい判断またはタスクが生じた場合、Phase 1で定義した記憶更新フローを通じて正本へ反映する。
* 古いContext Packは履歴として保存できるが、現在有効な判断の根拠として直接利用しない。
* Context Packへ含めたsource pathを明記する。

---

### P2-FR-009 Mnemosyne Context Pack検証

Project Mnemosyneについて、要件定義レビューAgentを想定したContext Packを生成し、文書レビューを開始できるだけの文脈が含まれるか確認できること。

#### 検証例

| 項目      | 内容                                |
| ------- | --------------------------------- |
| Project | `mnemosyne`                       |
| Agent   | `requirements_reviewer`           |
| Task    | Phase要件定義書の整合レビュー                 |
| 必須確認    | 目的、Phase境界、正本方針、未決定事項、対象文書が含まれること |
| 期待結果    | AIが前提を再説明されずに要件レビューを実行できること       |

#### 検証記録

```text
docs/review/phase-2-mnemosyne-context-pack-validation.md
```

---

### P2-FR-010 ATS Context Pack検証

ATSについて、実装レビューAgentを想定したContext Packを生成し、実プロジェクトでAgent別Context選定が成立するか確認できること。

#### 検証例

| 項目      | 内容                                       |
| ------- | ---------------------------------------- |
| Project | `ats`                                    |
| Agent   | `implementation_reviewer`                |
| Task    | `action_select` の責務分離・トランザクション境界・冪等性レビュー |
| 必須確認    | ATS概要、現在状況、有効判断、対象タスク、関連設計文書候補が識別できること   |
| 期待結果    | 同一プロジェクトでもレビュー目的に応じて必要Contextを選択できること    |

#### 検証記録

```text
docs/review/phase-2-ats-context-pack-validation.md
```

---

### P2-FR-011 Phase 3入力要件整理

Phase 2の固定参照およびRegistry方式で不足した情報取得要件を整理し、Phase 3のRecall Engineへ引き継げること。

#### 抽出すべき論点

| 論点       | 内容                      |
| -------- | ----------------------- |
| 固定参照の限界  | 必須文書だけでは不足した質問やレビュー対象   |
| 追加docs探索 | 手動で追加参照した文書種別           |
| 情報量      | Context Packが長大化した箇所    |
| 鮮度制御     | 古い判断を除外する上で不足したmetadata |
| 検索要求     | 自然文検索や意味検索が必要となった場面     |
| Agent差分  | Agentごとに必要な検索範囲の違い      |

#### 対応成果物

```text
docs/phases/phase-3-input-requirements.md
```

---

## 7.9 Phase 2非機能要件

| ID         | 非機能要件      | 内容                                                                        |
| ---------- | ---------- | ------------------------------------------------------------------------- |
| P2-NFR-001 | 決定的生成      | 同一のProject、Agent、Taskおよび同一正本文書からは、原則として同一構成のContext Packを生成できること          |
| P2-NFR-002 | 追跡性        | Context Packから、読み込んだ正本文書および選択理由を追跡できること                                   |
| P2-NFR-003 | 人間確認性      | AIへ渡す前に、Context Previewまたは生成物本文で読み込み内容を確認できること                            |
| P2-NFR-004 | 安全性        | Context Pack生成により、AIのwrite権限が拡張されないこと                                     |
| P2-NFR-005 | 情報鮮度       | `superseded` や `deprecated` の情報を無条件に主要Contextへ含めないこと                      |
| P2-NFR-006 | プロジェクト非依存性 | Project Registryへプロジェクトを追加することで、Context Builder本体の大規模改修なしに別プロジェクトへ展開できること |
| P2-NFR-007 | Agent非依存性  | Agent Registryへ定義を追加することで、Context Builder本体の大規模改修なしに別の専門Agentへ展開できること     |
| P2-NFR-008 | 可搬性        | 生成したContext Packは、ChatGPT、Cursor等へ貼り付け可能なMarkdown形式で出力できること               |
| P2-NFR-009 | 段階的拡張性     | Phase 3の検索機能を追加しても、RegistryおよびContext Pack構造を大きく破壊しないこと                   |
| P2-NFR-010 | 運用負荷抑制     | Context Pack作成時に毎回全文書を人手で選定しなくてよいこと                                       |

---

## 7.10 Phase 2制約

| ID       | 制約                                                                  |
| -------- | ------------------------------------------------------------------- |
| P2-C-001 | Context Packは正本ではなく生成物として扱う                                         |
| P2-C-002 | Context Packの入力は、原則としてPhase 1で定義した正本文書または明示的に指定されたTask Contextに限定する |
| P2-C-003 | Context Builderは正本文書を変更しない                                          |
| P2-C-004 | Context BuilderはAIモデルを自動実行しない                                       |
| P2-C-005 | Phase 2ではRAG、Embedding、Vector Storeを導入しない                           |
| P2-C-006 | Phase 2ではMemory APIおよびMCP Serverを実装しない                              |
| P2-C-007 | Phase 2ではNotionを正本入力として必須化しない                                       |
| P2-C-008 | Phase 2ではAgentの自律実行または複数Agentの統括処理を実装しない                            |
| P2-C-009 | `draft` または `proposed` 情報をContext Packへ含める場合は、未確定である旨を明示する          |
| P2-C-010 | Registry定義は、特定プロジェクト固有の実装ロジックをContext Builderへ埋め込まない形とする            |

---

## 7.11 Phase 2成果物

### 7.11.1 必須成果物

#### A. Context仕様文書

| ファイル                                    | 目的                                   |
| --------------------------------------- | ------------------------------------ |
| `docs/context/context-pack-format.md`   | Context Packの標準構成、必須章、metadataを定義する  |
| `docs/context/context-build-rule.md`    | Context Componentの選定・結合・状態制御ルールを定義する |
| `docs/context/context-preview-rule.md`  | AIへ渡す前の確認内容と警告表示ルールを定義する             |
| `docs/context/project-registry-spec.md` | Project Registryの構造と管理項目を定義する        |
| `docs/context/agent-registry-spec.md`   | Agent Registryの構造と管理項目を定義する          |

#### B. Registry設定

| ファイル                   | 目的                             |
| ---------------------- | ------------------------------ |
| `config/projects.yaml` | 対象プロジェクトと記憶文書保存先を管理する          |
| `config/agents.yaml`   | 専門Agentの目的・必要Context・出力方針を管理する |

#### C. テンプレートおよび入力例

| ファイル                                                      | 目的                       |
| --------------------------------------------------------- | ------------------------ |
| `templates/context/context-pack.template.md`              | 生成するContext Packの書式を定義する |
| `templates/context/task-context.template.md`              | Task Context入力形式を定義する    |
| `examples/context/tasks/mnemosyne-requirements-review.md` | Mnemosyne検証用Task入力例      |
| `examples/context/tasks/ats-implementation-review.md`     | ATS検証用Task入力例            |

#### D. CLI実装

| ファイル                         | 目的                   |
| ---------------------------- | -------------------- |
| `scripts/context-build.ts`   | Context Packを生成するCLI |
| `scripts/context-preview.ts` | 読み込み対象と警告を確認するCLI    |

#### E. 生成例

| ファイル                                                                    | 目的                         |
| ----------------------------------------------------------------------- | -------------------------- |
| `examples/context/output/mnemosyne-requirements-review-context-pack.md` | Mnemosyne向けContext Pack生成例 |
| `examples/context/output/ats-implementation-review-context-pack.md`     | ATS向けContext Pack生成例       |

#### F. 検証記録

| ファイル                                                       | 目的                     |
| ---------------------------------------------------------- | ---------------------- |
| `docs/review/phase-2-mnemosyne-context-pack-validation.md` | Mnemosyneでの生成検証結果を記録する |
| `docs/review/phase-2-ats-context-pack-validation.md`       | ATSでの生成検証結果を記録する       |

#### G. Phase 3引継ぎ文書

| ファイル                                        | 目的                           |
| ------------------------------------------- | ---------------------------- |
| `docs/phases/phase-3-input-requirements.md` | Recall Engineへ渡す検索・抽出要件を整理する |

### 7.11.2 生成物の標準出力先

運用実行時のContext PackおよびPreviewは、以下へ出力する。

```text
dist/
  context/
    {project_code}/
      {agent_code}/
        {generated_at}-context-pack.md

  context-preview/
    {project_code}/
      {agent_code}/
        {generated_at}-preview.md
```

### 7.11.3 任意成果物

| ファイルまたは機能                      | 扱い                                  |
| ------------------------------ | ----------------------------------- |
| `docs/context/base-context.md` | Base Contextを独立文書として管理する場合に作成       |
| `docs/agents/*.md`             | Agent定義をMarkdownでも詳細管理する必要が生じた場合に作成 |
| `config/context-builder.yaml`  | 組成ルールが増加し、Registryと分離すべき場合に作成       |
| Context Packのtoken概算表示         | 文書量増加により必要性が確認された場合に追加              |

---

## 7.12 Phase 2推奨ディレクトリ構成

```text
project-mnemosyne/
  config/
    projects.yaml
    agents.yaml

  docs/
    context/
      context-pack-format.md
      context-build-rule.md
      context-preview-rule.md
      project-registry-spec.md
      agent-registry-spec.md

    phases/
      phase-2-input-requirements.md
      phase-3-input-requirements.md

    review/
      phase-2-mnemosyne-context-pack-validation.md
      phase-2-ats-context-pack-validation.md

  templates/
    context/
      context-pack.template.md
      task-context.template.md

  examples/
    context/
      tasks/
        mnemosyne-requirements-review.md
        ats-implementation-review.md
      output/
        mnemosyne-requirements-review-context-pack.md
        ats-implementation-review-context-pack.md

  scripts/
    context-build.ts
    context-preview.ts

  dist/
    context/
      {project_code}/
        {agent_code}/
          {generated_at}-context-pack.md

    context-preview/
      {project_code}/
        {agent_code}/
          {generated_at}-preview.md
```

---

## 7.13 Phase 2検証シナリオ

### 7.13.1 Mnemosyne検証

| No.      | 検証内容                      | 入力                                                 | 期待結果                                    |
| -------- | ------------------------- | -------------------------------------------------- | --------------------------------------- |
| P2-T-001 | Mnemosyne向けContext Pack生成 | `mnemosyne` × `requirements_reviewer` × 要件レビューTask | Phase境界、正本方針、未決定事項を含むContext Packが生成される |
| P2-T-002 | 正本文書追跡確認                  | 生成したContext Pack                                   | 参照元文書が一覧化される                            |
| P2-T-003 | 未確定情報の表示確認                | proposedまたはdraftな論点を含む入力                           | 未確定である旨が明示される                           |
| P2-T-004 | Preview確認                 | 同一入力でpreview実行                                     | 読み込み文書と警告をAI利用前に確認できる                   |

### 7.13.2 ATS検証

| No.      | 検証内容                | 入力                                                          | 期待結果                              |
| -------- | ------------------- | ----------------------------------------------------------- | --------------------------------- |
| P2-T-005 | ATS向けContext Pack生成 | `ats` × `implementation_reviewer` × `action_select`レビューTask | ATSの概要・現在地・主要判断・レビュー目的が含まれる       |
| P2-T-006 | Agent差分確認           | `ats` で異なるAgentを指定                                          | Agent Contextおよび追加参照候補が変わる        |
| P2-T-007 | Project差分確認         | 同一Agentで `mnemosyne` と `ats` を指定                            | Project Contextのみが対象プロジェクトに応じて変わる |
| P2-T-008 | 不足Context抽出         | 生成物を用いてレビュー実施                                               | Phase 3で検索対象とすべき文書や情報が記録される       |

### 7.13.3 安全性検証

| No.      | 検証内容                            | 期待結果                          |
| -------- | ------------------------------- | ----------------------------- |
| P2-T-009 | Context Packにwrite policyが含まれるか | `draft_only` 方針が明記される         |
| P2-T-010 | `deprecated` 情報の取り扱い            | 主要Contextから除外される、または警告付きで扱われる |
| P2-T-011 | `superseded` 判断の取り扱い            | 現在判断と混同されず、必要時のみ履歴表示される       |
| P2-T-012 | Context Builderの副作用確認           | 正本文書が変更されない                   |

---

## 7.14 Phase 2完了条件

### 7.14.1 Definition of Done

Phase 2は、以下をすべて満たした時点で完了とする。

| No.    | 完了条件                                         | 判定観点                                      |
| ------ | -------------------------------------------- | ----------------------------------------- |
| DoD-01 | Context Packの標準構成が定義されている                    | 生成物の章構成と必須項目が明確である                        |
| DoD-02 | Context Componentの選定・結合ルールが定義されている           | Base / Agent / Project / Task等の組成方法が判断できる |
| DoD-03 | Project Registry仕様および初期設定が作成されている            | `mnemosyne` と `ats` を選択できる                |
| DoD-04 | Agent Registry仕様および初期設定が作成されている              | 最低2種類のAgentを選択できる                         |
| DoD-05 | Task Context入力形式が定義されている                     | 今回作業の内容と成果物を入力できる                         |
| DoD-06 | Context Builder CLIがContext Packを生成できる       | Project × Agent × Task で生成できる             |
| DoD-07 | Context Previewを確認できる                        | 読み込み対象と警告をAI利用前に確認できる                     |
| DoD-08 | 生成Context Packに参照元文書とwrite policyが含まれる       | 正本追跡と安全制約が維持される                           |
| DoD-09 | Mnemosyne向けContext Pack生成検証が完了している           | 要件レビューに必要な文脈を再現できる                        |
| DoD-10 | ATS向けContext Pack生成検証が完了している                 | 実装レビューに必要な文脈を再現できる                        |
| DoD-11 | Project変更とAgent変更の双方でContext Pack内容が適切に切り替わる | 汎用専門Agent × Project Context が成立する         |
| DoD-12 | Phase 3へ渡す検索・抽出要件が整理されている                    | Recall Engine設計へ進める                       |
| DoD-13 | 正本文書の自動更新、RAG、API、MCP、Agent自律実行へ不要に着手していない   | Phase 2のスコープを維持している                       |

### 7.14.2 初期MVP完了判定

Phase 1およびPhase 2を初期MVPとする場合、以下を満たした時点でMVP達成と判定できる。

| No.    | MVP完了条件                                        |
| ------ | ---------------------------------------------- |
| MVP-01 | 記憶の正本構造、分類、状態管理、更新ルールが定義されている                  |
| MVP-02 | MnemosyneおよびATSの記憶文書が同一構造で管理されている              |
| MVP-03 | Project Registryにより対象プロジェクトを切り替えられる            |
| MVP-04 | Agent Registryにより作業目的を切り替えられる                  |
| MVP-05 | Task Contextを与えて、1つのContext Packを生成できる         |
| MVP-06 | 新しいAIチャットへContext Packを渡し、前提説明を大幅に省略して作業を開始できる |
| MVP-07 | Context Packの参照元およびAI操作境界を人間が確認できる             |
| MVP-08 | 今後RAGまたはMCPが必要となる理由を、検証結果に基づいて説明できる            |

### 7.14.3 完了判定

| 判定             | 条件                                                            |
| -------------- | ------------------------------------------------------------- |
| Go             | 全DoDを満たし、MnemosyneおよびATSでContext Packが有効に機能する                 |
| Conditional Go | Context Pack構造またはRegistryに軽微な改善課題はあるが、Phase 3の検索要件整理へ進める      |
| No Go          | Project × Agent × Task によるContext組成が成立しない、または正本追跡・安全制約が維持できない |

---

## 7.15 Phase 2からPhase 3への引継ぎ要件

| ID        | 引継ぎ事項            | 内容                                              |
| --------- | ---------------- | ----------------------------------------------- |
| P2-HO-001 | Context Pack標準構造 | 検索結果をどの章へ組み込むか判断する基準                            |
| P2-HO-002 | Project Registry | プロジェクトごとの検索対象ルート候補                              |
| P2-HO-003 | Agent Registry   | Agentごとに必要な検索対象・追加Context                       |
| P2-HO-004 | 固定読み込みの不足        | Phase 2検証で不足した文書または情報種別                         |
| P2-HO-005 | 鮮度制御要件           | status、source path、updated_at等、検索結果に必要なmetadata |
| P2-HO-006 | Context肥大化課題     | 全文書読み込みでは非効率となる領域                               |
| P2-HO-007 | 検証記録             | MnemosyneおよびATSでのContext Pack利用結果               |
| P2-HO-008 | 安全制約             | 検索結果導入後も正本追跡とdraft only方針を維持する要件                |

---

## 7.16 Phase 2時点の未決定事項

| ID        | 論点                                                    | Phase 2での扱い                    | 後続判断                            |
| --------- | ----------------------------------------------------- | ------------------------------ | ------------------------------- |
| P2-OI-001 | Registryの設定形式をYAMLとするかJSONとするか                        | YAMLを初期候補として記載                 | 実装開始時に確定                        |
| P2-OI-002 | Base Contextを独立文書として管理するか                             | Context Pack仕様上は必須Componentとする | 設計仕様書作成時に確定                     |
| P2-OI-003 | Session ContextとRecent Conversation Contextをファイル保存するか | 任意Componentとして扱う               | 運用検証後に確定                        |
| P2-OI-004 | token数またはContext長の制限をどこまで扱うか                          | 必要性を記録する                       | Phase 3またはContext Builder改良時に判断 |
| P2-OI-005 | Agent定義をYAMLのみとするか、Markdown詳細定義も持つか                   | Registryを必須、詳細文書を任意とする         | Agent種類増加後に判断                   |
| P2-OI-006 | Context Packを生成履歴として永続保存するか                           | `dist/` への出力を想定する              | 運用頻度確認後に判断                      |
| P2-OI-007 | Context Pack生成後にAIへ自動送信するか                            | Phase 2対象外                     | 外部接続Phaseで判断                    |

---

# 8. 次分冊で定義する範囲

次分冊では、以下を定義する。

```text
Phase 3：Recall Engine
  - 文書チャンク化
  - metadata設計
  - 検索対象範囲
  - Embedding生成
  - Vector Store
  - status / staleness制御
  - Agentごとの検索範囲
  - Context Packへの検索結果組込み
```

Phase 3は、Phase 2で明らかになった「固定参照だけでは必要情報を十分かつ効率的に取得できない」という課題に対し、必要な記憶を検索によって呼び戻すPhaseとする。

## 今回の設計上の重要な更新

| 項目           | 旧案                                               | 今回の要件定義                                        |
| ------------ | ------------------------------------------------ | ---------------------------------------------- |
| Context Pack | Project / Agent / Session / Taskごとに個別生成するようにも読める | Context Componentを組み合わせ、最終的に1つのContext Packを生成 |
| Context生成単位  | 主にプロジェクト単位                                       | `Project × Agent × Task` 単位                    |
| Agent定義      | 将来候補                                             | Phase 2でRegistryとして最小定義を作成                     |
| Phase 2実装範囲  | `context-build.ts` 中心                            | Registry + Build Rule + Preview + CLI + 検証     |
| MVP完了条件      | Context Packを渡して会話再開可能                           | 専門AgentとProjectを切り替えてContext Packを生成・検証可能      |
| Phase 3への接続  | RAG導入へ進む                                         | 固定参照で不足した情報を根拠にRecall Engine要件へ進む              |

旧案ではPhase 2の成果物に `context-pack-format.md`、`context-build-rule.md`、`agent-context-profiles.md`、`context-build.ts` およびContext Pack生成例が挙げられていました。今回の要件では、それを維持しつつ、現在の方向性に必要な **Project Registry、Agent Registry、Context Preview、Phase 3引継ぎ** を追加しています。 

## Conversation Memory

### fact

* JP: 初期構想におけるPhase 2は、AIへ渡す文脈をContext Packとして生成し、ChatGPTやCursorへ渡してプロジェクト文脈を復元するフェーズとして定義されていた。 / EN: In the initial concept, Phase 2 generates a Context Pack so ChatGPT or Cursor can restore project context.
* JP: 汎用専門Agent化の整理により、Phase 2は専門Agentとプロジェクトを選択し、必要文脈を集めるContext Pack Builderへ接続するフェーズとして位置づけられている。 / EN: With reusable specialist agents, Phase 2 is positioned as the phase that selects an agent and a project to build the needed context.
* JP: 本回答では、`docs/requirements/phase-requirements.md` に追記するPhase 2：Context Forgeの要件定義本文を作成した。 / EN: This response created the Phase 2: Context Forge requirements section to append to `docs/requirements/phase-requirements.md`.

### decision

* JP: Phase 2では、Project Context Pack、Agent Context Pack等を別々の最終成果物として扱わず、Context Componentを結合して1つのContext Packを生成する構造を採用する。 / EN: Phase 2 uses one final Context Pack assembled from context components, rather than separate final packs for project and agent context.
* JP: Context Pack生成単位は `Project × Agent × Task` とする。 / EN: The Context Pack generation unit is `Project × Agent × Task`.
* JP: Phase 2ではProject RegistryおよびAgent Registryを定義・実装対象とし、Agentの自律実行は対象外とする。 / EN: Phase 2 defines and implements Project Registry and Agent Registry, but excludes autonomous agent execution.
* JP: Phase 1とPhase 2を初期MVPの範囲とし、Context Packを用いて新規チャットで作業開始できる状態をMVP到達点とする。 / EN: Phase 1 and Phase 2 form the initial MVP, completed when a new chat can start work using a Context Pack.

### task

* JP: 次分冊として、Phase 3：Recall Engineの要件定義を作成する。 / EN: Create the next section defining Phase 3: Recall Engine.
* JP: 後続の設計仕様書作成時に、Registry設定形式、Base Contextの管理方式、Session / Recent Conversation Contextの保存方式を確定する。 / EN: Finalize registry format, Base Context management, and storage of Session / Recent Conversation Context during later design specification work.

### preference

* JP: 文書およびPhaseは区切りのよい単位で作成し、前Phaseの成果物を入力として次Phaseの要件を具体化する進め方を採用している。 / EN: The project develops documents and phases in clear sections, using each prior phase's outputs to define the next phase.
* JP: Context PackをAIへ渡す前に、参照元・警告・write policyを人間が確認できる運用を重視する。 / EN: The process prioritizes human review of sources, warnings, and write policy before giving a Context Pack to AI.

### constraint

* JP: Phase 2では、RAG、Embedding、Vector Store、Memory API、MCP Server、AIモデル自動実行、正本自動更新、Agent自律実行を対象外とする。 / EN: Phase 2 excludes RAG, embeddings, vector stores, Memory APIs, MCP servers, automatic model execution, automatic source-of-truth updates, and autonomous agents.
* JP: Context Packは正本ではなく、正本文書を基に生成されるAI入力用成果物である。 / EN: A Context Pack is not a source of truth; it is generated AI input based on source documents.

### issue

* JP: Registry設定形式をYAMLとするかJSONとするかは未確定であり、現時点ではYAMLを初期候補としている。 / EN: The registry format is not yet final; YAML is the current initial candidate.
* JP: Base Contextを独立文書として持つか、CLIまたは設定へ含めるかは未決定である。 / EN: It is undecided whether Base Context is stored as a separate document or embedded in CLI/configuration.
* JP: Context Packの長さやtoken制限に対する具体対策は、実際の生成検証後に判断する必要がある。 / EN: Specific controls for Context Pack size or token limits must be decided after generation tests.

### idea

* JP: 初期Agentとして `requirements_reviewer` と `implementation_reviewer` を定義すると、MnemosyneとATSで異なるContext要求を検証しやすい。 / EN: Starting with `requirements_reviewer` and `implementation_reviewer` makes it easier to test different context needs with Mnemosyne and ATS.
* JP: Context Previewを設けることで、将来的なRAG導入後も、AIへ渡された根拠情報の透明性を維持できる。 / EN: A Context Preview can preserve visibility into supporting sources even after future RAG integration.

### article_note

* JP: AI外部記憶基盤のContext Packは、プロジェクト情報の単純な寄せ集めではなく、「誰が、何について、何をするか」を組み立てた作業用コンテキストである。 / EN: A Context Pack is not just collected project information; it is working context built from who acts, on what, and for what task.

### conversation_summary

* JP: 本チャットでは、Phase 1作業計画書を基準に全体要件定義書とPhase 1要件定義を再構成した。続いて、Phase 2を、Phase 1の正本文書から `Project × Agent × Task` に応じた1つのContext Packを生成するフェーズとして定義した。Project Registry、Agent Registry、Context Builder、Context Preview、Mnemosyne/ATS検証、初期MVP完了条件、Phase 3への引継ぎ要件を整理した。 / EN: This chat rebuilt the overall and Phase 1 requirements from the Phase 1 plan. It then defined Phase 2 as generating one Context Pack from Phase 1 source documents according to `Project × Agent × Task`, including registries, builder, preview, validation, MVP completion, and handoff to Phase 3.

### test_result

* JP: Phase 2要件定義では、旧案のContext Pack生成要件を維持しつつ、汎用専門Agent化で必要となったRegistry、Preview、Agent切替検証、Project切替検証、Phase 3入力整理を追加できた。 / EN: The Phase 2 requirements preserve the original Context Pack goal while adding registries, preview, agent/project switching tests, and Phase 3 input preparation required by reusable specialist agents.
