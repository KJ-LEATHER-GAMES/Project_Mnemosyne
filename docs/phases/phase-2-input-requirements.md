---
title: "Phase 2 Input Requirements"
document_id: "docs/phases/phase-2-input-requirements.md"
document_role: "phase_input_requirements"
status: "active"
version: "1.0.0"
created_at: "2026-06-05"
updated_at: "2026-06-08"
approved_at: "2026-06-08"
phase: "Phase 1: Memory Foundation"
milestone: "M1-6: Agent接続方針整理"
target_phase: "Phase 2: Context Forge"
related_documents:
  - "docs/phases/phase-1-memory-foundation.md"
  - "docs/adr/ADR-001-docs-as-source-of-memory.md"
  - "docs/adr/ADR-002-memory-source-of-truth-boundary.md"
  - "docs/adr/ADR-003-human-approved-memory-update.md"
  - "docs/adr/ADR-004-project-independent-memory-template.md"
  - "docs/adr/ADR-005-agent-context-separation.md"
  - "docs/projects/mnemosyne/memory/project-summary.md"
  - "docs/projects/mnemosyne/memory/current-status.md"
  - "docs/projects/mnemosyne/memory/active-decisions.md"
  - "docs/projects/mnemosyne/memory/next-actions.md"
  - "docs/projects/mnemosyne/memory/ai-entrypoint.md"
  - "docs/projects/ats/memory/project-summary.md"
  - "docs/projects/ats/memory/current-status.md"
  - "docs/projects/ats/memory/active-decisions.md"
  - "docs/projects/ats/memory/next-actions.md"
  - "docs/projects/ats/memory/ai-entrypoint.md"
  - "docs/review/phase-1-ats-template-validation.md"
---

# Phase 2 Input Requirements

## 1. Status

`active`

---

## 2. Purpose

本書は、Phase 1: Memory Foundation で作成した記憶構造を、Phase 2: Context Forge の設計・実装へ接続するための入力要件を整理する文書である。

Phase 2では、Project Registry、Agent Registry、Context Pack Builderを扱う予定である。

本書では、Phase 2で実装する前に必要となる入力項目、責務境界、最小構成、未決定論点を整理する。

本書に記載するYAML、CLI、出力先、Context Pack構成はPhase 2設計の入力候補であり、Phase 1時点の確定実装仕様ではない。最終仕様はPhase 2の各TaskまたはADRで決定する。

---

## 3. Phase 2 Positioning

### 3.1 Phase 2 Name

| Field | Value |
|---|---|
| Phase | Phase 2 |
| Name | Context Forge |
| Main Purpose | Project ContextとAgent Contextを組み合わせ、AIへ渡すContext Packを生成する |
| Input | Phase 1でActive化された記憶文書、ADR、テンプレート、Registry定義候補 |
| Output | Context Pack、Context Preview、Context Build Report |
| Implementation Level | CLI中心の初期実装候補 |

### 3.2 Phase 2 One-Line Definition

```text
AIへ何を渡すかを、Project × Agent × Task から組み立てるフェーズ。
```

---

## 4. Phase 1から引き継ぐ前提

| ID | Input Assumption | Source | Status |
|---|---|---|---|
| P2-A-001 | Markdown docsとADRを初期正本とする | ADR-001 / ADR-002 | active |
| P2-A-002 | AIはdraft作成まで。正本反映は人間承認後とする | ADR-003 | active |
| P2-A-003 | プロジェクト記憶文書は共通テンプレートで管理する | ADR-004 | active |
| P2-A-004 | Agent定義とProject Contextを分離する | ADR-005 | active |
| P2-A-005 | Context Packは正本ではなく生成物である | ADR-002 / active-decisions.md | active |
| P2-A-006 | Task正本は `next-actions.md` とする | templates / active-decisions.md | active |
| P2-A-007 | `ai-entrypoint.md` は入口であり、Decision / Task / Issue の正本ではない | templates / active-decisions.md | active |
| P2-A-008 | `conversation-summary` は標準5文書ではなく、未反映情報の一次整理である | ADR-004 | active |
| P2-A-009 | Recent Conversation ContextはActive正本より優先しない | ADR-005 | active |

---

## 5. Phase 2 Scope

### 5.1 In Scope

| Area | Description |
|---|---|
| Project Registry | `project_code` と記憶文書保存先を管理する |
| Agent Registry | `agent_code` とAgentごとの必要Context・出力形式を管理する |
| Context Builder | Project × Agent × Task からContextを集約する |
| Context Preview | AIへ渡す前に人間が内容を確認できるMarkdownを生成する |
| Context Pack | ChatGPT / Cursor等へ貼り付け可能なMarkdown形式で出力する |
| Build Report | 読み込んだ文書、除外した文書、不足Context、警告を出力する |

### 5.2 Out of Scope

| Out of Scope | Reason |
|---|---|
| RAG / Vector Search | Phase 3以降で扱う。Phase 2では明示登録された文書を読む |
| Memory API | Phase 4以降で扱う |
| MCP Server | Phase 5以降で扱う |
| UI | CLI運用で入力要件を検証してから判断する |
| AIによる正本自動更新 | ADR-003によりPhase 2でも原則draft only |
| Agent実行基盤そのもの | Phase 2ではAgent定義とContext生成まで。実行は人間がAIへ渡して確認する |
| Notion同期 | Phase 2の必須機能にはしない |

---

## 6. Required Inputs

Phase 2のContext生成には、最低限以下の入力が必要である。

| Input | Required | Description | Owner |
|---|---:|---|---|
| `project_code` | yes | 対象プロジェクトを識別するコード | user / CLI |
| `agent_code` | yes | 利用する専門Agentを識別するコード | user / CLI |
| `task_request` | yes | 今回AIに実施させたい作業内容 | user |
| `output_type` | recommended | ADR、レビュー、記事、タスクリスト等 | agent / user |
| `additional_sources` | optional | タスク固有の追加文書またはコード | user / registry |
| `recent_context` | optional | 直近会話要約、未反映指示、補足 | user / conversation summary |
| `token_budget` | optional | Context Packの最大サイズ目安 | config |

---

## 7. Registry Responsibility Boundary

| Component | Has | Does Not Have |
|---|---|---|
| Project Registry | `project_code`、`memory_root`、標準文書、任意source、ADR source | Agentの役割、出力形式、禁止事項 |
| Agent Registry | `agent_code`、必要Context、出力契約、禁止事項、write policy | Project固有のFact / Decision / Task |
| Context Build Request | 今回の `task_request`、追加source、recent context指定、token budget | 正本情報そのもの |
| Context Pack | AIへ渡す生成物、Source List、Warnings | 正本更新結果 |

---

## 8. Project Registry Requirements

### 8.1 Purpose

Project Registryは、プロジェクトごとの記憶文書保存先と標準文書セットを管理する。

Phase 2では、Context Builderが `project_code` からProject Contextを解決するために使用する。

### 8.2 Required Fields

| Field | Required | Description | Example |
|---|---:|---|---|
| `project_code` | yes | プロジェクト識別子 | `ats` |
| `project_name` | yes | 表示名 | `Adventure Token System` |
| `memory_root` | yes | 記憶文書root | `docs/projects/ats/memory` |
| `required_memory_docs` | yes | 標準記憶構造を満たしているか確認するための存在検証対象。常時読み込み対象ではない | `project-summary.md` 等 |
| `optional_sources` | recommended | タスクに応じて追加する文書rootまたはpattern | `docs/usecase-contracts.md` |
| `adr_sources` | recommended | 関連ADRのpattern | `docs/adr/*.md` |
| `review_sources` | optional | レビュー結果文書 | `docs/review/*.md` |
| `source_status_policy` | yes | draft/active等の扱い | `active_preferred` |
| `write_policy` | yes | Context生成後の更新方針 | `draft_only` |

### 8.3 `required_memory_docs` Policy

`required_memory_docs` はContext Packへ常に全文投入する文書を意味しない。

`required_memory_docs` は、Project Registry上で、そのプロジェクトが標準記憶構造を満たしているか確認するための存在検証対象である。

Context Packへ実際に含める文書は、Agent Registryの `required_context`、Task Request、Additional Sources、Source Status Policy、Token Budgetによって決定する。

### 8.4 Draft YAML Candidate

以下はPhase 2設計の入力候補であり、確定実装仕様ではない。

```yaml
projects:
  - project_code: mnemosyne
    project_name: "Project Mnemosyne"
    memory_root: "docs/projects/mnemosyne/memory"
    required_memory_docs:
      - "project-summary.md"
      - "current-status.md"
      - "active-decisions.md"
      - "next-actions.md"
      - "ai-entrypoint.md"
    optional_sources:
      - "docs/phases/phase-1-memory-foundation.md"
      - "docs/phases/phase-2-input-requirements.md"
      - "docs/memory/*.md"
    adr_sources:
      - "docs/adr/*.md"
    review_sources:
      - "docs/review/*.md"
    source_status_policy: "active_preferred"
    write_policy: "draft_only"

  - project_code: ats
    project_name: "Adventure Token System"
    memory_root: "docs/projects/ats/memory"
    required_memory_docs:
      - "project-summary.md"
      - "current-status.md"
      - "active-decisions.md"
      - "next-actions.md"
      - "ai-entrypoint.md"
    optional_sources:
      - "docs/usecase-contracts.md"
      - "docs/database-design*.md"
      - "docs/domain-rules.md"
      - "docs/test-results/*.md"
    adr_sources:
      - "docs/adr/*.md"
    review_sources:
      - "docs/review/*.md"
    source_status_policy: "active_preferred"
    write_policy: "draft_only"
```

---

## 9. Agent Registry Requirements

### 9.1 Purpose

Agent Registryは、専門Agentごとの役割、必要Context、出力形式、禁止事項を管理する。

Phase 2では、Context Builderが `agent_code` から必要な文書種別と出力契約を解決するために使用する。

### 9.2 Required Fields

| Field | Required | Description | Example |
|---|---:|---|---|
| `agent_code` | yes | Agent識別子 | `adr_writer` |
| `agent_name` | yes | 表示名 | `ADR整理Agent` |
| `purpose` | yes | Agentの目的 | ADR草案作成 |
| `required_context` | yes | 必須Context | project_summary / active_decisions |
| `optional_context` | recommended | 任意Context | current_status / related docs |
| `output_type` | yes | 標準出力形式 | `adr_draft` |
| `output_contract` | recommended | 成果物の構成要件 | Status / Context / Decision等 |
| `write_policy` | yes | 書き込み制約 | `draft_only` |
| `prohibited_actions` | yes | 禁止事項 | 正本直接write禁止 |
| `quality_checks` | recommended | 出力前確認観点 | Source確認、矛盾確認等 |

### 9.3 Initial Agent Candidates

| Agent Code | Agent Name | Required Context | Optional Context | Output Type | Priority |
|---|---|---|---|---|---|
| `adr_writer` | ADR整理Agent | project_summary / active_decisions / ADR | current_status / related docs | `adr_draft` | P0 |
| `requirements_writer` | 要件定義Agent | project_summary / current_status / next_actions | issues / ideas / previous requirements | `requirements_draft` | P0 |
| `implementation_reviewer` | 実装レビューAgent | project_summary / current_status / active_decisions | architecture / source / test docs | `review_report` | P1 |
| `task_planner` | タスク分解Agent | current_status / next_actions / active_decisions | roadmap / review docs | `task_plan` | P1 |
| `article_writer` | 記事化Agent | project_summary / approved summaries | decisions / development logs | `article_draft` | Later |

### 9.4 Draft YAML Candidate

以下はPhase 2設計の入力候補であり、確定実装仕様ではない。

```yaml
agents:
  - agent_code: adr_writer
    agent_name: "ADR整理Agent"
    purpose: "重要な設計判断をADR形式で整理する"
    required_context:
      memory_types:
        - project_summary
        - active_decisions
      document_patterns:
        - "docs/adr/*.md"
    optional_context:
      memory_types:
        - current_status
      document_patterns:
        - "docs/**/*.md"
    output_type: "adr_draft"
    output_contract:
      required_sections:
        - Status
        - Context
        - Decision
        - Rationale
        - Consequences
        - Alternatives Considered
    write_policy: "draft_only"
    prohibited_actions:
      - "Do not update active docs directly"
      - "Do not treat conversation summary as active decision"
    quality_checks:
      - "Check active ADR conflicts"
      - "Check source status"
      - "List unresolved issues"
```

---

## 10. Output Type Candidates

Phase 2では、少なくとも以下の `output_type` 候補を扱えるようにする。

| `output_type` | Meaning | Typical Agent |
|---|---|---|
| `adr_draft` | ADR草案 | `adr_writer` |
| `requirements_draft` | 要件定義ドラフト | `requirements_writer` |
| `review_report` | レビュー結果 | `implementation_reviewer` |
| `task_plan` | Task分解・次アクション案 | `task_planner` |
| `article_draft` | 記事ドラフト | `article_writer` |
| `context_pack` | AI投入用Context Pack | Context Builder |
| `build_report` | Context生成結果レポート | Context Builder |

---

## 11. Source Status Policy

### 11.1 Candidate Values

| `source_status_policy` | Meaning | Default Use |
|---|---|---|
| `active_only` | active文書のみ使用する | 厳格なレビュー、確定判断 |
| `active_preferred` | activeを優先し、draftは通常除外する | default |
| `active_preferred_draft_allowed_with_warning` | 明示対象のdraftをwarning付きで含める | draftレビュー時のみ |
| `include_archived_for_history` | archivedを履歴確認用に含める | 過去経緯調査 |

### 11.2 Draft Source Handling

draft sourceは、明示的にレビュー対象または作業対象として指定された場合のみContext Packに含める。

draft sourceに含まれる情報は、Active Decision、確定Task、確定Constraintとして扱ってはならない。

| Situation | Include Draft? | Handling |
|---|---:|---|
| Active化レビュー中の文書をレビューする | yes | warning付きで含める |
| draft文書そのものを修正対象にする | yes | 作業対象として含める |
| Active正本が存在せず、ユーザーが明示的に許可した | conditional | 不足Context / warningを出す |
| 通常のContext Pack生成 | no | 除外する |
| 確定判断の根拠として使う | no | 禁止 |

---

## 12. Recent Context Policy

`recent_context` は、直近の会話要約、未反映指示、補足情報を扱うための任意入力である。

Recent Conversation ContextはActive正本より優先しない。

Active正本と競合する場合、Active正本を優先し、recent contextはConflict候補または更新候補として扱う。

| Situation | Handling |
|---|---|
| recent contextが今回の明示作業対象 | Task Contextとして扱う |
| recent contextがActive正本と一致 | 補足情報として扱う |
| recent contextがActive正本と競合 | Conflict候補としてBuild Reportに出す |
| recent contextにしかない判断 | Decision候補として扱い、確定判断には使わない |

---

## 13. Additional Sources Policy

`additional_sources` は、Task固有に追加する文書またはコードを指定する。

Phase 2では、以下の指定形式を候補とする。

| Type | Example | Meaning |
|---|---|---|
| explicit file | `docs/domain-rules.md` | 単一ファイルを指定する |
| glob pattern | `docs/test-results/*.md` | patternに一致する文書を指定する |
| directory | `src/usecases/` | directory配下を対象候補とする |
| named source group | `ats_usecase_docs` | Registry側で定義したsource groupを指定する |

`additional_sources` は、標準記憶文書を置き換えるものではない。

---

## 14. Context Build Request Candidate

以下はPhase 2設計の入力候補であり、確定実装仕様ではない。

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
  recent_context:
    include: true
    source: "conversation-summary"
  token_budget:
    max_tokens: 12000
```

---

## 15. Context Pack Candidate Structure

以下はPhase 2設計の入力候補であり、確定実装仕様ではない。

```markdown
# Context Pack

## 1. Build Metadata
- project_code:
- agent_code:
- task_request:
- generated_at:

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

---

## 16. CLI Candidate

以下はPhase 2設計の入力候補であり、確定実装仕様ではない。

```bash
npm run context:build -- --project ats --agent implementation_reviewer --task "reward request usecase review"
```

出力先候補：

```text
dist/context/{project_code}/{agent_code}/context-pack.md
dist/context/{project_code}/{agent_code}/build-report.md
```

---

## 17. Build Report Requirements

Context Builderは、最低限以下をBuild Reportに出す。

| Item | Required | Description |
|---|---:|---|
| Source List | yes | 読み込んだ文書一覧 |
| Excluded Sources | yes | 除外した文書と理由 |
| Missing Required Docs | yes | 存在しない標準文書 |
| Draft Warnings | yes | draft source混入の有無 |
| Conflict Warnings | yes | Active正本間またはrecent contextとの競合 |
| Token Estimate | recommended | 概算token量 |
| Context Coverage | recommended | Agentが要求したContextを満たしたか |

---

## 18. Phase 2 Start Acceptance Criteria

Phase 2へ入る前に、以下を満たす。

| ID | Criteria | Status |
|---|---|---|
| P2-AC-001 | 標準プロジェクト記憶5文書の役割がADR-004でActive化されている | met |
| P2-AC-002 | Agent ContextとProject Contextの分離方針がADR-005でActive化されている | met |
| P2-AC-003 | Project Registry候補の必須fieldが定義されている | met |
| P2-AC-004 | Agent Registry候補の必須fieldが定義されている | met |
| P2-AC-005 | draft sourceとrecent contextの扱いが定義されている | met |
| P2-AC-006 | Phase 2で決定すべきOpen Decisionsが整理されている | met |

---

## 19. Phase 2 Open Decisions

| ID | Decision Needed | Candidate Options | Timing |
|---|---|---|---|
| P2-OD-001 | Registry形式 | YAML / JSON / TypeScript config | Phase 2設計初期 |
| P2-OD-002 | CLI実装方式 | npm script / standalone CLI / Node TS script | Phase 2設計初期 |
| P2-OD-003 | Context Pack出力先 | `dist/context/` / `docs/generated/context/` | Phase 2設計初期 |
| P2-OD-004 | token budget方式 | fixed / agent別 / task別 | Phase 2実装前 |
| P2-OD-005 | source pattern解決方式 | glob / explicit list / registry group | Phase 2実装前 |
| P2-OD-006 | Build Report保存要否 | always / option / preview only | Phase 2実装前 |

---

## 20. Not Included as Phase 2 Input

以下はPhase 2入力要件には含めない。

| Item | Reason |
|---|---|
| Vector index schema | Phase 3 Recall Engineで扱う |
| API endpoint schema | Phase 4 Memory Gatewayで扱う |
| MCP tool contract | Phase 5 MCP Nexusで扱う |
| Agent execution runtime | Phase 6 Agent Operationで扱う |
| 自動承認workflow | Phase 7 Automation & Governanceで扱う |

---

## 21. Change History

| Version | Date | Status | Change | Author |
|---|---|---|---|---|
| 0.1.0 | 2026-06-05 | draft | 初版ドラフト作成。 | AI draft |
| 1.0.0 | 2026-06-08 | active | P0/P1レビュー指摘を反映し、ADR-004/005のActive前提、`required_memory_docs` の存在検証定義、draft source / recent context policy、Registry責務境界、output_type、additional_sources、Acceptance Criteriaを追加してActive化。 | user |
