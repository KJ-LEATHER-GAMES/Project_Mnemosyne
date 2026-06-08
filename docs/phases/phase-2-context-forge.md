---

title: "Phase 2: Context Forge 作業計画書"
document_id: "docs/phases/phase-2-context-forge.md"
document_role: "phase_plan"
status: "active"
version: "1.0.0"
created_at: "2026-06-08"
updated_at: "2026-06-08"
phase: "Phase 2: Context Forge"
previous_phase: "Phase 1: Memory Foundation"
next_phase: "Phase 3: Recall Engine"
m2_status: "M2-0 active"
review_status: "active"
related_documents:

* "docs/phases/phase-1-memory-foundation.md"
* "docs/phases/phase-2-input-requirements.md"
* "docs/adr/ADR-001-docs-as-source-of-memory.md"
* "docs/adr/ADR-002-memory-source-of-truth-boundary.md"
* "docs/adr/ADR-003-human-approved-memory-update.md"
* "docs/adr/ADR-004-project-independent-memory-template.md"
* "docs/adr/ADR-005-agent-context-separation.md"

---

# Phase 2: Context Forge 作業計画書

## 1. Status

`active`

本書は、Project Mnemosyneにおける **Phase 2: Context Forge** の作業計画書である。

本書は、M2-0：Phase 2方針確定の成果物としてActive化する。

---

## 2. Phase概要

Phase 2: Context Forge は、Phase 1: Memory Foundation で整備した記憶文書・ADR・テンプレートをもとに、AIへ渡す文脈を `Project × Agent × Task` の組み合わせから生成するフェーズである。

Phase 1では、AIが参照する記憶の正本構造、分類、状態、参照優先順位、人間承認ルールを整備した。

Phase 2では、それらの正本をAIに丸ごと渡すのではなく、対象プロジェクト、利用する専門Agent、今回の作業目的に応じて、必要な情報だけをContext Packとして組み立てる。

---

## 3. Phase名

| Field                | Value                                                      |
| -------------------- | ---------------------------------------------------------- |
| Phase                | Phase 2                                                    |
| Name                 | Context Forge                                              |
| Japanese Subtitle    | AIに渡す文脈を鍛造する                                               |
| Main Purpose         | Project ContextとAgent Contextを組み合わせ、AIへ渡すContext Packを生成する |
| Main Input           | Phase 1でActive化された記憶文書、ADR、テンプレート、Registry定義               |
| Main Output          | Context Pack、Context Preview、Context Build Report          |
| Implementation Level | CLI中心の初期実装                                                 |

---

## 4. One-Line Definition

```text
AIへ何を渡すかを、Project × Agent × Task から組み立てるフェーズ。
```

---

## 5. Phase 2の目的

Phase 2の目的は、Project Mnemosyneにおいて、AIへ渡すContextを手作業で都度選ぶ状態から、設定ファイルとCLIに基づいて再現可能に生成できる状態へ移行することである。

具体的には、以下を実現する。

1. プロジェクトごとの記憶文書配置を `Project Registry` で管理する
2. 専門Agentごとの必要Context・出力形式・禁止事項を `Agent Registry` で管理する
3. `project_code`、`agent_code`、`task_request` から必要Contextを集約する
4. AIへ渡す前に、人間が内容を確認できるContext Previewを生成する
5. ChatGPT / Cursor等へ貼り付け可能なMarkdown形式のContext Packを生成する
6. 読み込んだ文書、除外した文書、不足Context、警告をBuild Reportとして出力する
7. Phase 3: Recall Engineへ渡す検索導入要件を整理する

---

## 6. Phase 1から引き継ぐ前提

| ID       | Assumption                                                | Status |
| -------- | --------------------------------------------------------- | ------ |
| P2-A-001 | Markdown docsとADRを初期正本とする                                 | active |
| P2-A-002 | AIはdraft作成まで。正本反映は人間承認後とする                                | active |
| P2-A-003 | プロジェクト記憶文書は共通テンプレートで管理する                                  | active |
| P2-A-004 | Agent定義とProject Contextを分離する                              | active |
| P2-A-005 | Context Packは正本ではなく生成物である                                 | active |
| P2-A-006 | Task正本は `next-actions.md` とする                             | active |
| P2-A-007 | `ai-entrypoint.md` は入口であり、Decision / Task / Issue の正本ではない | active |
| P2-A-008 | `conversation-summary` は標準5文書ではなく、未反映情報の一次整理である           | active |
| P2-A-009 | Recent Conversation ContextはActive正本より優先しない               | active |

---

## 7. Phase 2の対象範囲

### 7.1 In Scope

| Area                      | Description                                               |
| ------------------------- | --------------------------------------------------------- |
| Project Registry          | `project_code` と記憶文書保存先を管理する                              |
| Agent Registry            | `agent_code` とAgentごとの必要Context・出力形式を管理する                 |
| Context Build Request     | `project_code`、`agent_code`、`task_request`、追加source等を受け取る |
| Context Builder           | Project × Agent × Task からContextを集約する                     |
| Context Preview           | AIへ渡す前に人間が内容を確認できるMarkdownを生成する                           |
| Context Pack              | ChatGPT / Cursor等へ貼り付け可能なMarkdown形式で出力する                  |
| Build Report              | 読み込んだ文書、除外した文書、不足Context、警告を出力する                          |
| Source Status Policy      | active / draft / archived等の扱いをContext生成へ反映する              |
| Recent Context Policy     | 直近会話・未反映指示をActive正本より下位のContextとして扱う                      |
| Additional Sources Policy | タスク固有の追加文書やコードを指定可能にする                                    |
| Phase 3入力整理               | 固定読み込みで不足した情報取得要件を整理する                                    |

### 7.2 Out of Scope

| Out of Scope        | Reason                                        |
| ------------------- | --------------------------------------------- |
| RAG / Vector Search | Phase 3: Recall Engineで扱う                     |
| Memory API          | Phase 4: Memory Gatewayで扱う                    |
| MCP Server          | Phase 5: MCP Nexusで扱う                         |
| UI                  | CLI運用で入力要件を検証してから判断する                         |
| AIによる正本自動更新         | Phase 2でも原則draft onlyとする                      |
| Agent実行基盤そのもの       | Phase 2ではAgent定義とContext生成まで。実行は人間がAIへ渡して確認する |
| Notion同期            | Phase 2の必須機能にはしない                             |
| 自動承認workflow        | Phase 7: Automation & Governanceで扱う           |
| PostgreSQL保存        | Phase 2では必須化しない。必要性はPhase 3以降で再判断する           |

---

## 8. Naming Policy

Phase 2では、成果物名とCLI配置名の揺れを避けるため、以下の名称へ統一する。

### 8.1 採用する成果物名

| Category                  | Adopted Name                                | Notes                                                           |
| ------------------------- | ------------------------------------------- | --------------------------------------------------------------- |
| Context Pack標準構造          | `docs/context/context-pack-structure.md`    | `context-pack-format.md` は採用しない                                 |
| Context組成ルール              | `docs/context/context-build-rule.md`        | Project × Agent × Taskの組成ルールを定義する                               |
| Source Status Policy      | `docs/context/source-status-policy.md`      | active / draft / archived等の扱いを定義する                              |
| Recent Context Policy     | `docs/context/recent-context-policy.md`     | Session Context / Recent Context / Conversation Summaryの関係を定義する |
| Additional Sources Policy | `docs/context/additional-sources-policy.md` | タスク固有sourceの指定ルールを定義する                                          |
| Build Report Rule         | `docs/context/build-report-rule.md`         | Build Reportの出力項目を定義する                                          |
| Project Registry          | `config/projects.yaml`                      | project_codeとmemory_root等を管理する                                  |
| Agent Registry            | `config/agents.yaml`                        | agent_code、required_context、output_contract等を管理する               |
| CLI実体                     | `src/cli/context-build.ts`                  | `scripts/context-build.ts` ではなく `src/cli/` に配置する                |
| User Command              | `npm run context:build`                     | ユーザー操作口として使用する                                                  |

### 8.2 採用しない名称

| Non-Adopted Name                         | Replacement                              |
| ---------------------------------------- | ---------------------------------------- |
| `docs/context/context-pack-format.md`    | `docs/context/context-pack-structure.md` |
| `docs/context/agent-context-profiles.md` | `config/agents.yaml`                     |
| `scripts/context-build.ts`               | `src/cli/context-build.ts`               |

---

## 9. Context Layering Policy

Phase 2では、AIに渡すContextを以下の階層で扱う。

```text
Base Context
Project Context
Agent Context
Session Context
Recent Conversation Context
Task Context
Additional Sources
```

### 9.1 Context階層の定義

| Context Type                | Description        | Source Example                                                                     | Priority              |
| --------------------------- | ------------------ | ---------------------------------------------------------------------------------- | --------------------- |
| Base Context                | 汎用Agent共通ルール       | common rules / safety rules                                                        | high                  |
| Project Context             | プロジェクト固有の正本文脈      | project-summary / current-status / active-decisions / next-actions / ai-entrypoint | high                  |
| Agent Context               | Agentの役割・参照要件・出力契約 | `config/agents.yaml`                                                               | high                  |
| Session Context             | 現在の作業セッション情報       | 今回のテーマ、作業中の論点、検討中ファイル                                                              | medium                |
| Recent Conversation Context | 直近会話や未反映指示の要約      | conversation-summary、ユーザー入力の要約                                                     | medium-low            |
| Task Context                | 今回の具体指示            | task_request、対象ファイル、追加条件                                                           | high for current task |
| Additional Sources          | タスク固有の追加文書・コード     | docs / src / review files                                                          | depends on status     |

### 9.2 Session Context / Recent Context / Conversation Summary の関係

Phase 2では、`Session Context`、`Recent Conversation Context`、`Conversation Summary` を以下のように区別する。

| Term                        | Meaning                        | Source of Truth? | Context Pack Handling            |
| --------------------------- | ------------------------------ | ---------------: | -------------------------------- |
| Session Context             | 現在の作業セッションで使う一時的な作業文脈          |               no | Context Build Request時に指定される一時入力 |
| Recent Conversation Context | 直近会話・未反映指示をContext Pack内で表現する章 |               no | Active正本より下位の参考Contextとして扱う      |
| Conversation Summary        | 会話内容を分類・要約した文書                 |    no by default | review_status / statusに応じて扱う     |
| Active Memory Docs          | 承認済みのProject Memory            |              yes | Recent Contextより優先する             |
| Active ADR                  | 承認済みの設計判断                      |              yes | 原則として最上位の判断根拠にする                 |

### 9.3 Recent Contextの制約

Phase 2では、Session Contextを独立した正本とは扱わない。

Session Contextは、Context Build Request時に指定される一時的な入力文脈である。

Context Pack内では、直近会話や未反映指示を `Recent Conversation Context` として表現する。

ただし、以下を守る。

1. Recent Conversation ContextはActive正本文書より優先しない
2. Recent Conversation ContextはActive ADRより優先しない
3. Conversation Summaryは未承認の可能性があるため、status / review_statusを明示する
4. 未反映の決定・タスク・Issueは確定扱いしない
5. Active正本とRecent Contextが矛盾する場合はWarningに出す
6. 必要に応じてPhase3またはMemory Update Flow側で正本化候補として扱う

---

## 10. 成果物一覧

### 10.1 設計・運用文書

| Path                                        | Purpose                                                    | Priority |
| ------------------------------------------- | ---------------------------------------------------------- | -------- |
| `docs/phases/phase-2-context-forge.md`      | Phase 2作業計画書                                               | P0       |
| `docs/context/context-pack-structure.md`    | Context Pack標準構造                                           | P0       |
| `docs/context/context-build-rule.md`        | Context組成ルール                                               | P0       |
| `docs/context/source-status-policy.md`      | active / draft / archived等の扱い                              | P0       |
| `docs/context/recent-context-policy.md`     | Session Context / Recent Context / Conversation Summaryの扱い | P0       |
| `docs/context/additional-sources-policy.md` | 追加source指定ルール                                              | P1       |
| `docs/context/build-report-rule.md`         | Build Report出力ルール                                          | P1       |
| `docs/phases/phase-3-input-requirements.md` | Phase 3へ渡す検索導入要件                                           | P0       |

### 10.2 設定ファイル

| Path                                 | Purpose                             | Priority |
| ------------------------------------ | ----------------------------------- | -------- |
| `config/projects.yaml`               | Project Registry                    | P0       |
| `config/agents.yaml`                 | Agent Registry                      | P0       |
| `config/context-build-defaults.yaml` | token budget、出力先、status policy等の初期値 | P1       |

### 10.3 テンプレート

| Path                                                       | Purpose              | Priority |
| ---------------------------------------------------------- | -------------------- | -------- |
| `templates/context/context-pack.template.md`               | Context Pack出力テンプレート | P0       |
| `templates/context/context-preview.template.md`            | Preview出力テンプレート      | P1       |
| `templates/context/build-report.template.md`               | Build Report出力テンプレート | P1       |
| `templates/context/phase-3-input-requirements.template.md` | Phase 3入力要件整理テンプレート  | P1       |

### 10.4 CLI / 実装

| Path                                     | Purpose                             | Priority |
| ---------------------------------------- | ----------------------------------- | -------- |
| `src/cli/context-build.ts`               | Context Pack生成CLI                   | P0       |
| `src/services/contextBuilderService.ts`  | Context組成ロジック                       | P0       |
| `src/services/projectRegistryService.ts` | Project Registry読込・検証               | P0       |
| `src/services/agentRegistryService.ts`   | Agent Registry読込・検証                 | P0       |
| `src/services/sourceResolverService.ts`  | source pattern / file / directory解決 | P1       |
| `src/services/contextPreviewService.ts`  | Preview生成                           | P1       |
| `src/services/buildReportService.ts`     | Build Report生成                      | P1       |
| `src/types/context.ts`                   | Context関連型定義                        | P0       |
| `src/types/registry.ts`                  | Registry関連型定義                       | P0       |
| `src/utils/tokenEstimate.ts`             | token概算補助                           | P2       |

### 10.5 検証レポート

| Path                                                       | Purpose                     | Priority |
| ---------------------------------------------------------- | --------------------------- | -------- |
| `docs/review/phase-2-mnemosyne-context-pack-validation.md` | MnemosyneでのContext Pack生成検証 | P0       |
| `docs/review/phase-2-ats-context-pack-validation.md`       | ATSでのContext Pack生成検証       | P0       |
| `docs/review/phase-2-context-forge-completion-review.md`   | Phase 2完了レビュー               | P0       |

### 10.6 生成物

| Path                                                          | Purpose           |
| ------------------------------------------------------------- | ----------------- |
| `dist/context/{project_code}/{agent_code}/context-pack.md`    | AI投入用Context Pack |
| `dist/context/{project_code}/{agent_code}/context-preview.md` | 人間確認用Preview      |
| `dist/context/{project_code}/{agent_code}/build-report.md`    | Build Report      |
| `dist/context/{project_code}/{agent_code}/source-list.md`     | 参照source一覧        |

---

## 11. 推奨ディレクトリ構成

```text
project-mnemosyne/
  config/
    projects.yaml
    agents.yaml
    context-build-defaults.yaml

  docs/
    context/
      context-pack-structure.md
      context-build-rule.md
      source-status-policy.md
      recent-context-policy.md
      additional-sources-policy.md
      build-report-rule.md

    phases/
      phase-1-memory-foundation.md
      phase-2-input-requirements.md
      phase-2-context-forge.md
      phase-3-input-requirements.md

    review/
      phase-2-mnemosyne-context-pack-validation.md
      phase-2-ats-context-pack-validation.md
      phase-2-context-forge-completion-review.md

  templates/
    context/
      context-pack.template.md
      context-preview.template.md
      build-report.template.md
      phase-3-input-requirements.template.md

  src/
    cli/
      context-build.ts

    services/
      contextBuilderService.ts
      projectRegistryService.ts
      agentRegistryService.ts
      sourceResolverService.ts
      contextPreviewService.ts
      buildReportService.ts

    types/
      context.ts
      registry.ts

    utils/
      tokenEstimate.ts

  dist/
    context/
      {project_code}/
        {agent_code}/
          context-pack.md
          context-preview.md
          build-report.md
          source-list.md
```

---

## 12. Milestones

## M2-0：Phase 2方針確定

### 目的

Phase 2の対象範囲、成果物、完了条件、対象外を固定する。

### 実施内容

1. `phase-2-input-requirements.md` を確認する
2. Phase 2で扱う範囲を確定する
3. Phase 2で扱わない範囲を明確化する
4. 作業計画書を作成する
5. Phase 2内のマイルストーンを定義する
6. Active化レビューで検出されたP1修正を反映する

### 成果物

```text
docs/phases/phase-2-context-forge.md
```

### 完了条件

* Phase 2の目的、対象範囲、成果物、対象外が説明できる
* M2-1以降の作業単位が明確になっている
* Phase 3へ渡すべき情報がPhase 2の完了条件に含まれている
* 成果物名とCLI配置名の揺れが解消されている
* `required_memory_docs` の意味が存在検証対象として明確になっている
* Session Context / Recent Conversation Context / Conversation Summary の関係が説明できる

### M2-0 Active化チェックリスト

| No         | Check                                                                            | Result |
| ---------- | -------------------------------------------------------------------------------- | ------ |
| M2-0-R-001 | Phase 2の目的が1文で説明できる                                                              | pass   |
| M2-0-R-002 | Phase 2のIn Scopeが一覧化されている                                                        | pass   |
| M2-0-R-003 | Phase 2のOut of Scopeが一覧化されている                                                    | pass   |
| M2-0-R-004 | Phase 2の成果物が文書・設定・テンプレート・CLI・検証レポートに分かれている                                       | pass   |
| M2-0-R-005 | M2-1以降の作業単位が定義されている                                                              | pass   |
| M2-0-R-006 | Phase 3へ渡す情報がDoDに含まれている                                                          | pass   |
| M2-0-R-007 | RAG / API / MCP / UIへスコープ逸脱していない                                                 | pass   |
| M2-0-R-008 | 成果物名とCLI配置名の揺れが整理されている                                                           | pass   |
| M2-0-R-009 | `required_memory_docs` が存在検証対象として定義されている                                         | pass   |
| M2-0-R-010 | Session Context / Recent Conversation Context / Conversation Summary の関係が明示されている | pass   |

---

## M2-1：Context Pack標準構造定義

### 目的

AIへ渡すContext Packの標準構造を定義する。

### 実施内容

1. Context Packの章構成を定義する
2. 各章に含める情報を定義する
3. Source ListとWarningsの扱いを定義する
4. Build Metadataを定義する
5. Context Packが正本ではなく生成物であることを明記する

### 推奨Context Pack構造

```markdown
# Context Pack

## 1. Build Metadata

## 2. Agent Role and Output Contract

## 3. Project Context

## 4. Active Decisions and Constraints

## 5. Current Status

## 6. Task Context

## 7. Additional Sources

## 8. Recent Conversation Context

## 9. Warnings

## 10. Source List

## 11. Build Report
```

### 成果物

```text
docs/context/context-pack-structure.md
templates/context/context-pack.template.md
```

### 完了条件

* Context Packの標準章構成が定義されている
* 各章の入力元が明確になっている
* Context Packが正本ではなく生成物であることが明記されている
* Recent Contextやdraft sourceがActive正本より優先されない構造になっている

---

## M2-2：Project Registry定義

### 目的

プロジェクトごとの記憶文書保存先、標準文書、任意source、ADR source、status policyを管理できるようにする。

### 実施内容

1. `projects.yaml` のスキーマを定義する
2. `mnemosyne` を登録する
3. `ats` を登録する
4. `required_memory_docs` を存在検証対象として定義する
5. `optional_sources`、`adr_sources`、`review_sources` の扱いを定義する
6. `source_status_policy` と `write_policy` を設定する

### 必須field

| Field                  |    Required | Description                 |
| ---------------------- | ----------: | --------------------------- |
| `project_code`         |         yes | プロジェクト識別子                   |
| `project_name`         |         yes | 表示名                         |
| `memory_root`          |         yes | 記憶文書root                    |
| `required_memory_docs` |         yes | 標準記憶構造を満たすための存在検証対象         |
| `optional_sources`     | recommended | タスクに応じて追加する文書rootまたはpattern |
| `adr_sources`          | recommended | 関連ADRのpattern               |
| `review_sources`       |    optional | レビュー結果文書                    |
| `source_status_policy` |         yes | draft / active等の扱い          |
| `write_policy`         |         yes | Context生成後の更新方針             |

### `required_memory_docs` の定義

`required_memory_docs` は、Project Registryが標準記憶構造を満たしているかを確認するための **存在検証対象** である。

これらの文書を常にContext Packへ全文投入することはしない。

実際にContext Packへ含める文書は、以下に基づいて決定する。

1. Agent Registryの `required_context`
2. Agent Registryの `optional_context`
3. Task Request
4. Additional Sources
5. Source Status Policy
6. token budget
7. Build Rule

### `required_memory_docs` の想定例

```yaml
required_memory_docs:
  - project-summary.md
  - current-status.md
  - active-decisions.md
  - next-actions.md
  - ai-entrypoint.md
```

### `required_memory_docs` の禁止解釈

以下の解釈は禁止する。

```text
required_memory_docs = 常時全文投入対象
```

Phase 2では、標準記憶構造の存在確認と、Context Pack投入対象の選定を分離する。

### 成果物

```text
config/projects.yaml
docs/context/source-status-policy.md
src/types/registry.ts
src/services/projectRegistryService.ts
```

### 完了条件

* `mnemosyne` と `ats` がProject Registryに登録されている
* 標準5文書の存在検証ができる
* `required_memory_docs` が常時全文投入対象ではないことが明記されている
* optional source / ADR source / review sourceの扱いが定義されている

---

## M2-3：Agent Registry定義

### 目的

専門Agentごとの役割、必要Context、出力形式、禁止事項、write policyを管理できるようにする。

### 実施内容

1. `agents.yaml` のスキーマを定義する
2. 初期検証用Agentを登録する
3. Agentごとの `required_context` を定義する
4. Agentごとの `optional_context` を定義する
5. `output_type` と `output_contract` を定義する
6. `write_policy` と `prohibited_actions` を定義する
7. `quality_checks` を定義する

### 初期Agent候補

| Agent Code                | Agent Name  | Priority |
| ------------------------- | ----------- | -------- |
| `adr_writer`              | ADR整理Agent  | P0       |
| `requirements_writer`     | 要件定義Agent   | P0       |
| `implementation_reviewer` | 実装レビューAgent | P1       |
| `task_planner`            | タスク分解Agent  | P1       |
| `article_writer`          | 記事化Agent    | Later    |

### 成果物

```text
config/agents.yaml
src/types/registry.ts
src/services/agentRegistryService.ts
```

### 完了条件

* P0 Agentとして `adr_writer` と `requirements_writer` が登録されている
* P1 Agentとして `implementation_reviewer` と `task_planner` が登録されている
* Agent定義にProject固有のFact / Decision / Taskが混入していない
* Agentごとの出力契約と禁止事項が定義されている

---

## M2-4：Context Build Request定義

### 目的

Context Builderへ渡す入力形式を定義する。

### 実施内容

1. `project_code`、`agent_code`、`task_request` を必須入力として定義する
2. `output_type`、`additional_sources`、`session_context`、`recent_context`、`token_budget` を定義する
3. CLI引数と内部Request型の対応を定義する
4. 入力エラー時の扱いを定義する

### Context Build Request候補

```yaml
context_build_request:
  project_code: "ats"
  agent_code: "implementation_reviewer"
  task_request: "reward request usecaseのService依存をレビューする"
  output_type: "review_report"
  additional_sources:
    - "src/usecases/requestRewardUseCase.ts"
    - "src/services/line/lineRewardReplyService.ts"
    - "docs/usecase-contracts.md"
  session_context:
    include: true
    notes:
      - "今回の焦点はServiceからUseCaseを呼び出す依存方向の妥当性"
      - "修正後フローはシーケンス図と依存関係図で整理したい"
  recent_context:
    include: true
    source: "conversation-summary"
  token_budget:
    max_tokens: 12000
```

### 成果物

```text
docs/context/context-build-rule.md
docs/context/recent-context-policy.md
src/types/context.ts
```

### 完了条件

* Context Build Requestの必須項目と任意項目が定義されている
* CLI引数からRequest型へ変換できる
* 不正な `project_code` / `agent_code` / source指定時の扱いが定義されている
* Session Context / Recent Conversation Context / Conversation Summaryの扱いが定義されている

---

## M2-5：Context Builder初期実装

### 目的

Project Registry、Agent Registry、Context Build Requestをもとに、Context Packを生成するCLIを実装する。

### 実施内容

1. `projects.yaml` を読み込む
2. `agents.yaml` を読み込む
3. `project_code` からProject Context候補を解決する
4. `agent_code` から必要Contextを解決する
5. `task_request` をTask Contextとして組み込む
6. `additional_sources` を解決する
7. source status policyに従って文書を採用・除外する
8. Context PackをMarkdownとして生成する
9. Build Reportを生成する

### CLI候補

```bash
npm run context:build -- --project ats --agent implementation_reviewer --task "reward request usecase review"
```

### 成果物

```text
src/cli/context-build.ts
src/services/contextBuilderService.ts
src/services/sourceResolverService.ts
src/services/buildReportService.ts
dist/context/{project_code}/{agent_code}/context-pack.md
dist/context/{project_code}/{agent_code}/build-report.md
```

### 完了条件

* `mnemosyne` と `ats` のContext PackをCLIで生成できる
* 読み込んだsource一覧を出力できる
* 除外したsourceと理由をBuild Reportに出力できる
* draft source混入時にwarningを出せる
* missing required docsを検出できる

---

## M2-6：Context Preview実装

### 目的

AIへ渡す前に、人間がContext Packの内容を確認できるPreviewを生成する。

### 実施内容

1. Context PackとPreviewの差分を定義する
2. Previewにsource list、warnings、token estimate、coverageを含める
3. Active / draft / archived sourceの混在状況を確認できるようにする
4. Agent要求Contextの充足状況を確認できるようにする

### 成果物

```text
docs/context/build-report-rule.md
templates/context/context-preview.template.md
templates/context/build-report.template.md
src/services/contextPreviewService.ts
dist/context/{project_code}/{agent_code}/context-preview.md
```

### 完了条件

* AI投入前に人間が確認すべき情報がPreviewに出力される
* Context Pack本文とBuild Reportの対応が追跡できる
* Context不足や競合候補がwarningとして確認できる

---

## M2-7：Mnemosyne Context Pack生成検証

### 目的

Project Mnemosyne自身の文脈をContext Packとして生成し、Phase 2の仕組みが基盤プロジェクトに適用できることを確認する。

### 実施内容

1. `project_code=mnemosyne` でContext Packを生成する
2. P0 Agentである `requirements_writer` を使用する
3. Phase 2またはPhase 3の要件整理タスクを想定して検証する
4. Context PackだけでAIが現在地を理解できるか確認する
5. 不足ContextをBuild Reportへ記録する

### 検証シナリオ例

| No       | Scenario         | Agent                 | Check                         |
| -------- | ---------------- | --------------------- | ----------------------------- |
| M2-V-001 | Phase 3入力要件を整理する | `requirements_writer` | Phase 1/2の前提が復元できるか           |
| M2-V-002 | ADR草案を作成する       | `adr_writer`          | Active Decisions / ADRを参照できるか |
| M2-V-003 | 次タスクを分解する        | `task_planner`        | next-actionsを正しく参照できるか        |

### 成果物

```text
docs/review/phase-2-mnemosyne-context-pack-validation.md
dist/context/mnemosyne/{agent_code}/context-pack.md
dist/context/mnemosyne/{agent_code}/build-report.md
```

### 完了条件

* MnemosyneのContext Packが生成できる
* AIがPhase2の現在地、Active Decisions、Next Actionsを復元できる
* 不足ContextがBuild Reportに整理されている
* Phase3入力要件へ回すべき課題が抽出されている

---

## M2-8：ATS Context Pack生成検証

### 目的

実プロジェクトであるATSに対してContext Packを生成し、Project Registry / Agent Registry / Context Builderが実用に耐えるか確認する。

### 実施内容

1. `project_code=ats` でContext Packを生成する
2. `implementation_reviewer` を使用して実装レビューContextを生成する
3. `task_planner` を使用して次アクション整理Contextを生成する
4. ATS固有docsやコードを `additional_sources` として指定する
5. Context Packが長大化しすぎないか確認する
6. fixed source方式で不足する情報を整理する

### 検証シナリオ例

| No       | Scenario                      | Agent                     | Check                                 |
| -------- | ----------------------------- | ------------------------- | ------------------------------------- |
| M2-V-101 | reward request usecaseの設計レビュー | `implementation_reviewer` | 関連sourceを追加指定できるか                     |
| M2-V-102 | Ver.1.1の次タスク整理                | `task_planner`            | current-status / next-actionsを正しく使えるか |
| M2-V-103 | ADR草案作成                       | `adr_writer`              | active-decisionsとADRの整合を確認できるか        |

### 成果物

```text
docs/review/phase-2-ats-context-pack-validation.md
dist/context/ats/{agent_code}/context-pack.md
dist/context/ats/{agent_code}/build-report.md
```

### 完了条件

* ATSのContext Packが生成できる
* ATS固有のProject Contextが復元できる
* Agentごとに必要なContextの違いを反映できる
* additional sourcesの指定が機能する
* Phase3で検索が必要になるケースが整理されている

---

## M2-9：Phase 3 Input Requirements整理

### 目的

Phase 2の固定読み込み型Context生成で不足した情報取得要件を整理し、Phase 3: Recall Engineへ引き継ぐ。

### 実施内容

1. Mnemosyne検証で不足したContextを整理する
2. ATS検証で不足したContextを整理する
3. 手動source指定が必要だったケースを分類する
4. RAG / 検索が必要なケースと不要なケースを分ける
5. 検索対象候補、検索単位、metadata要件を整理する
6. Phase 3で扱うべきOpen Decisionsを整理する
7. 検索時にもsource status / freshness / evidenceを維持する要件を整理する

### Phase 3へ引き渡す情報

Phase 2完了時点で、以下を `docs/phases/phase-3-input-requirements.md` に整理する。

| Handoff Item            | Description                                                 |
| ----------------------- | ----------------------------------------------------------- |
| 固定読み込みで不足した情報           | Context Pack生成だけでは取得しきれなかった情報                               |
| 検索が必要なsource種別          | docs / ADR / review / conversation-summary / article_note等  |
| 検索不要なsource種別           | 毎回固定投入すべき情報、または検索対象にしない生成物                                  |
| metadata要件              | source_path、document_id、status、updated_at、source_type、hash等 |
| freshness要件             | 古い情報、deprecated情報、superseded情報の扱い                           |
| evidence要件              | 検索結果に根拠sourceを明示する要件                                        |
| Agent-aware Retrieval要件 | Agentごとに検索対象や優先度を変える要件                                      |
| Retrieved Contextの扱い    | Phase3検索結果をContext Packにどう接続するか                             |
| Phase4入力候補              | API化時に必要になりそうなrequest / response要件                          |

### 成果物

```text
docs/phases/phase-3-input-requirements.md
templates/context/phase-3-input-requirements.template.md
```

### 完了条件

* 固定読み込みで不足した情報が整理されている
* Phase3で検索対象にすべき文書候補が整理されている
* Agentごとに検索が必要になるケースが整理されている
* source status / freshness / evidenceを検索時にも維持する要件が整理されている
* Retrieved ContextをContext Packへ接続するための初期要件が整理されている

---

## M2-10：Phase 2完了レビュー

### 目的

Phase 2の成果物がPhase 3へ進める水準に達しているかを判定する。

### 実施内容

1. Phase 2成果物一覧を確認する
2. Context Pack標準構造を確認する
3. Project RegistryとAgent Registryの定義を確認する
4. Context Builderの生成結果を確認する
5. Mnemosyne / ATSの検証結果を確認する
6. Phase 3 Input Requirementsを確認する
7. Phase 3への移行可否を判定する

### 成果物

```text
docs/review/phase-2-context-forge-completion-review.md
```

### 完了条件

* Phase 2 DoDを満たしている
* Phase 3へ渡す入力要件が整理されている
* 残課題がP0 / P1 / P2で分類されている
* Phase 3への移行判断が `Go` / `Conditional Go` / `No Go` で記録されている

---

## 13. 作業順序

| Order | Milestone                    | Priority | Main Output                     | Dependency |
| ----: | ---------------------------- | -------- | ------------------------------- | ---------- |
|     1 | M2-0 Phase 2方針確定             | P0       | `phase-2-context-forge.md`      | Phase 1完了  |
|     2 | M2-1 Context Pack標準構造定義      | P0       | `context-pack-structure.md`     | M2-0       |
|     3 | M2-2 Project Registry定義      | P0       | `projects.yaml`                 | M2-1       |
|     4 | M2-3 Agent Registry定義        | P0       | `agents.yaml`                   | M2-1       |
|     5 | M2-4 Context Build Request定義 | P0       | `context-build-rule.md`         | M2-2, M2-3 |
|     6 | M2-5 Context Builder初期実装     | P0       | `context-build.ts`              | M2-4       |
|     7 | M2-6 Context Preview実装       | P1       | Preview / Build Report          | M2-5       |
|     8 | M2-7 Mnemosyne検証             | P0       | 検証レポート                          | M2-5       |
|     9 | M2-8 ATS検証                   | P0       | 検証レポート                          | M2-5       |
|    10 | M2-9 Phase 3入力要件整理           | P0       | `phase-3-input-requirements.md` | M2-7, M2-8 |
|    11 | M2-10 Phase 2完了レビュー          | P0       | 完了レビュー                          | 全タスク       |

---

## 14. 作業チケット案

| ID     | Task                         | Priority | Output                          | Completion Criteria             |
| ------ | ---------------------------- | -------- | ------------------------------- | ------------------------------- |
| P2-T01 | Phase 2作業計画書を作成する            | P0       | `phase-2-context-forge.md`      | 対象範囲とマイルストーンが明確                 |
| P2-T02 | Context Pack標準構造を定義する        | P0       | `context-pack-structure.md`     | 章構成と入力元が明確                      |
| P2-T03 | Context Packテンプレートを作成する      | P0       | `context-pack.template.md`      | 生成物の雛形がある                       |
| P2-T04 | Project Registry schemaを定義する | P0       | `projects.yaml`                 | `mnemosyne` / `ats` を登録可能       |
| P2-T05 | Agent Registry schemaを定義する   | P0       | `agents.yaml`                   | P0 Agentを登録可能                   |
| P2-T06 | Source Status Policyを定義する    | P0       | `source-status-policy.md`       | draft / active / archivedの扱いが明確 |
| P2-T07 | Recent Context Policyを定義する   | P0       | `recent-context-policy.md`      | Active正本より優先しないことが明確            |
| P2-T08 | Context Build Requestを定義する   | P0       | `context-build-rule.md`         | CLI入力と内部型が対応                    |
| P2-T09 | Registry読込処理を実装する            | P0       | Registry Services               | YAMLを読み込める                      |
| P2-T10 | Source Resolverを実装する         | P1       | `sourceResolverService.ts`      | file / glob / directoryを解決可能    |
| P2-T11 | Context Builderを実装する         | P0       | `contextBuilderService.ts`      | Context Packを生成可能               |
| P2-T12 | Build Reportを実装する            | P1       | `buildReportService.ts`         | source / warning / missingを出力可能 |
| P2-T13 | CLIを実装する                     | P0       | `context-build.ts`              | npm scriptで実行可能                 |
| P2-T14 | Mnemosyneで生成検証する             | P0       | 検証レポート                          | Context Packで文脈復元可能             |
| P2-T15 | ATSで生成検証する                   | P0       | 検証レポート                          | 実プロジェクト文脈を復元可能                  |
| P2-T16 | Phase3入力要件を作成する              | P0       | `phase-3-input-requirements.md` | 検索導入要件が整理済み                     |
| P2-T17 | Phase2完了レビューを実施する            | P0       | 完了レビュー                          | Go判定可能                          |

---

## 15. DoD: Definition of Done

Phase 2は、以下を満たした時点で完了とする。

| ID         | DoD                                                                                                                                         | Required |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------: |
| P2-DOD-001 | Context Pack標準構造が定義されている                                                                                                                    |      yes |
| P2-DOD-002 | Project Registryのschemaが定義されている                                                                                                             |      yes |
| P2-DOD-003 | Project Registryに `mnemosyne` と `ats` が登録されている                                                                                              |      yes |
| P2-DOD-004 | Agent Registryのschemaが定義されている                                                                                                               |      yes |
| P2-DOD-005 | Agent Registryに初期検証用Agentが登録されている                                                                                                           |      yes |
| P2-DOD-006 | Context Build Requestの入力形式が定義されている                                                                                                          |      yes |
| P2-DOD-007 | CLIでContext Packを生成できる                                                                                                                      |      yes |
| P2-DOD-008 | Build ReportにSource List、Excluded Sources、Missing Required Docs、Warningsを出力できる                                                              |      yes |
| P2-DOD-009 | draft sourceとrecent contextをActive正本より優先しない                                                                                                 |      yes |
| P2-DOD-010 | MnemosyneでContext Pack生成検証が完了している                                                                                                           |      yes |
| P2-DOD-011 | ATSでContext Pack生成検証が完了している                                                                                                                 |      yes |
| P2-DOD-012 | 固定読み込みで不足する情報がPhase3入力要件として整理されている                                                                                                          |      yes |
| P2-DOD-013 | RAG / API / MCP / UIへ不要に着手していない                                                                                                             |      yes |
| P2-DOD-014 | Phase3への移行判断が記録されている                                                                                                                        |      yes |
| P2-DOD-015 | Phase 3へ引き渡す検索導入要件として、固定読み込みで不足した情報、追加検索が必要なsource種別、metadata要件、status / freshness / evidence維持方針が `phase-3-input-requirements.md` に整理されている |      yes |
| P2-DOD-016 | Session Context / Recent Conversation Context / Conversation Summaryの扱いが `recent-context-policy.md` または関連文書で定義されている                         |      yes |
| P2-DOD-017 | `required_memory_docs` が存在検証対象であり、常時全文投入対象ではないことがProject Registry定義に明記されている                                                                 |      yes |

---

## 16. Phase 3への移行判断基準

| 判定             | 条件                                                                     |
| -------------- | ---------------------------------------------------------------------- |
| Go             | Phase 2 DoDを満たし、Mnemosyne / ATSでContext Pack生成が実用可能であり、Phase3入力要件が整理済み |
| Conditional Go | 一部P1改善をPhase3初期または並行対応に回せる状態で、P0不足がない                                  |
| No Go          | Registry、Context Builder、Context Pack構造、検証結果、Phase3入力要件のいずれかにP0不足がある   |

---

## 17. 主なリスクと対策

| Risk                                | Description                     | Countermeasure                                                    |
| ----------------------------------- | ------------------------------- | ----------------------------------------------------------------- |
| Context Packが長大化する                  | 必要以上の文書を読み込み、AI投入に向かない          | token budget / source status policy / Agent required contextで制御する |
| `required_memory_docs` を常時投入対象と誤解する | 標準文書すべてを毎回Context Packへ含めて肥大化する | 存在検証対象であり、投入対象はAgent / Taskで決めると明記する                              |
| Agent定義にProject固有情報が混入する            | Agent Registryの再利用性が下がる         | Agent Registryは役割・必要Context・出力契約のみ保持する                            |
| draftやrecent contextを確定情報として扱う      | AIが未承認情報をDecisionとして扱う          | warningを出し、Active正本より下位に置く                                        |
| Build Reportが不足する                   | なぜそのContextになったか追跡できない          | Source List / Excluded Sources / Missing Docs / Warningsを必須化する    |
| Phase3へ進む前にRAGへ脱線する                 | Context Builderの検証前に検索機能へ進んでしまう | Phase2では明示登録文書のみ扱う                                                |
| ATS固有の設計に寄りすぎる                      | Mnemosyne汎用基盤として再利用しづらくなる       | MnemosyneとATSの2系統で必ず検証する                                          |
| CLI仕様が早期に固まりすぎる                     | 後続Phaseで変更しづらくなる                | Phase2では初期CLIとして扱い、API化はPhase4で再設計する                              |
| Session Contextが正本と誤解される            | 一時的な作業文脈が確定情報として扱われる            | Session Contextは一時入力であり、Active正本ではないと明記する                         |

---

## 18. Open Decisions

| ID        | Decision Needed                              | Candidate Options                                                                             | Timing      |
| --------- | -------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------- |
| P2-OD-001 | Registry形式                                   | YAML / JSON / TypeScript config                                                               | M2-2 / M2-3 |
| P2-OD-002 | CLI実装方式                                      | npm script / standalone CLI / Node TS script                                                  | M2-5        |
| P2-OD-003 | Context Pack出力先                              | `dist/context/` / `docs/generated/context/`                                                   | M2-5        |
| P2-OD-004 | token budget方式                               | fixed / agent別 / task別                                                                        | M2-5 / M2-6 |
| P2-OD-005 | source pattern解決方式                           | glob / explicit list / registry group                                                         | M2-5        |
| P2-OD-006 | Build Report保存要否                             | always / option / preview only                                                                | M2-6        |
| P2-OD-007 | `context-preview.md` と `context-pack.md` の差分 | 同一 / Preview拡張 / Report分離                                                                     | M2-6        |
| P2-OD-008 | `article_writer` をPhase2検証対象に含めるか            | Later維持 / P2へ昇格                                                                               | M2-8後       |
| P2-OD-009 | 初期Agentセット                                   | `adr_writer` / `requirements_writer` の2件に絞るか、`implementation_reviewer` / `task_planner` も含めるか | M2-3        |

---

## 19. MVPラインとFullライン

Phase2は、MVPラインとFullラインを分けて進める。

### 19.1 MVPライン

MVPラインでは、Context Pack生成の成立を最優先する。

| Item                                                       | Required |
| ---------------------------------------------------------- | -------: |
| `config/projects.yaml`                                     |      yes |
| `config/agents.yaml`                                       |      yes |
| `src/cli/context-build.ts`                                 |      yes |
| `src/services/contextBuilderService.ts`                    |      yes |
| `dist/context/{project_code}/{agent_code}/context-pack.md` |      yes |
| `dist/context/{project_code}/{agent_code}/build-report.md` |      yes |

### 19.2 Fullライン

Fullラインでは、Preview、token estimate、coverage、詳細なsource resolver、検証テンプレートを整備する。

| Item                     | Required for Phase2 Completion |
| ------------------------ | -----------------------------: |
| `context-preview.md`     |                    recommended |
| token estimate           |                       optional |
| coverage report          |                       optional |
| detailed source resolver |                    recommended |
| validation templates     |                    recommended |

---

## 20. 推奨する最初の着手単位

Phase 2は、まず以下の単位で着手する。

```text
M2-1：Context Pack標準構造定義
M2-2：Project Registry定義
M2-3：Agent Registry定義
```

M2-0は本書のActive化により完了扱いとする。

この3つを先に確定する理由は、Context Builderの実装前に、何を入力として受け取り、何を出力すべきかを固定する必要があるためである。

その後、以下の順に進める。

```text
Context Pack構造定義
  ↓
Project Registry定義
  ↓
Agent Registry定義
  ↓
Context Build Request定義
  ↓
Context Builder実装
  ↓
Mnemosyne / ATS検証
  ↓
Phase3入力要件整理
  ↓
Phase2完了レビュー
```

---

## 21. 今回の判断

M2-0：Phase 2方針確定は、以下の理由によりActive化する。

1. Phase2の目的が定義されている
2. Phase2の対象範囲が定義されている
3. Phase2の対象外が定義されている
4. Phase2成果物が文書・設定・テンプレート・CLI・検証レポート・生成物に分けて整理されている
5. M2-1以降の作業単位が定義されている
6. Phase3へ渡す入力要件がDoD上で明示されている
7. 成果物名とCLI配置名の揺れが整理されている
8. `required_memory_docs` が存在検証対象として定義されている
9. Session Context / Recent Conversation Context / Conversation Summaryの関係が明示されている
10. RAG / API / MCP / UIへスコープ逸脱していない

したがって、Phase2は次工程である **M2-1：Context Pack標準構造定義** へ進める。

---

## 22. Change History

| Version | Date       | Status | Change                                                                                                                                                                        | Author   |
| ------- | ---------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0.1.0   | 2026-06-08 | draft  | Phase 2 Input Requirementsを参照し、Phase 2作業計画書ドラフトを作成。                                                                                                                           | AI draft |
| 1.0.0   | 2026-06-08 | active | M2-0 Active化レビューのP1修正を反映。Phase3入力要件のDoD明示、成果物名・CLI配置名の統一、`required_memory_docs` の存在検証対象化、Session Context / Recent Context / Conversation Summaryの関係明示、M2-0 Active化チェックリストを追加。 | AI draft |
