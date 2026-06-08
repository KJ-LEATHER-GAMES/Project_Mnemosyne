---
title: "Phase 2 Input Requirements"
document_id: "docs/phases/phase-2-input-requirements.md"
document_role: "phase_input_requirements"
status: "draft"
version: "0.1.0"
created_at: "2026-06-05"
updated_at: "2026-06-05"
approved_at: null
phase: "Phase 1: Memory Foundation"
milestone: "M1-6: Agent接続方針整理"
target_phase: "Phase 2: Context Forge"
related_documents:
  - "docs/phases/phase-1-memory-foundation.md"
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

## 1. Purpose

本書は、Phase 1: Memory Foundation で作成した記憶構造を、Phase 2: Context Forge の設計・実装へ接続するための入力要件を整理する文書である。

Phase 2では、Project Registry、Agent Registry、Context Pack Builderを扱う予定である。

本書では、Phase 2で実装する前に必要となる入力項目、責務境界、最小構成、未決定論点を整理する。

---

## 2. Phase 2 Positioning

### 2.1 Phase 2 Name

| Field | Value |
|---|---|
| Phase | Phase 2 |
| Name | Context Forge |
| Main Purpose | Project ContextとAgent Contextを組み合わせ、AIへ渡すContext Packを生成する |
| Input | Phase 1でActive化された記憶文書、ADR、テンプレート、Registry定義 |
| Output | Context Pack、Context Preview、Context Build Report |
| Implementation Level | CLI中心の初期実装 |

### 2.2 Phase 2 One-Line Definition

```text
AIへ何を渡すかを、Project × Agent × Task から組み立てるフェーズ。
```

---

## 3. Phase 1から引き継ぐ前提

| ID | Input Assumption | Source | Status |
|---|---|---|---|
| P2-A-001 | Markdown docsとADRを初期正本とする | ADR-001 / ADR-002 | active |
| P2-A-002 | AIはdraft作成まで。正本反映は人間承認後とする | ADR-003 | active |
| P2-A-003 | プロジェクト記憶文書は共通テンプレートで管理する | ADR-004 | draft |
| P2-A-004 | Agent定義とProject Contextを分離する | ADR-005 | draft |
| P2-A-005 | Context Packは正本ではなく生成物である | ADR-002 / active-decisions.md | active |
| P2-A-006 | Task正本は `next-actions.md` とする | templates / active-decisions.md | active |
| P2-A-007 | `ai-entrypoint.md` は入口であり、Decision / Task / Issue の正本ではない | templates / active-decisions.md | active |

---

## 4. Phase 2 Scope

### 4.1 In Scope

| Area | Description |
|---|---|
| Project Registry | `project_code` と記憶文書保存先を管理する |
| Agent Registry | `agent_code` とAgentごとの必要Context・出力形式を管理する |
| Context Builder | Project × Agent × Task からContextを集約する |
| Context Preview | AIへ渡す前に人間が内容を確認できるMarkdownを生成する |
| Context Pack | ChatGPT / Cursor等へ貼り付け可能なMarkdown形式で出力する |
| Build Report | 読み込んだ文書、除外した文書、不足Context、警告を出力する |

### 4.2 Out of Scope

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

## 5. Required Inputs

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

## 6. Project Registry Requirements

### 6.1 Purpose

Project Registryは、プロジェクトごとの記憶文書保存先と標準文書セットを管理する。

Phase 2では、Context Builderが `project_code` からProject Contextを解決するために使用する。

### 6.2 Required Fields

| Field | Required | Description | Example |
|---|---:|---|---|
| `project_code` | yes | プロジェクト識別子 | `ats` |
| `project_name` | yes | 表示名 | `Adventure Token System` |
| `memory_root` | yes | 記憶文書root | `docs/projects/ats/memory` |
| `required_memory_docs` | yes | 常時読み込む標準文書 | `project-summary.md` 等 |
| `optional_sources` | recommended | タスクに応じて追加する文書rootまたはpattern | `docs/usecase-contracts.md` |
| `adr_sources` | recommended | 関連ADRのpattern | `docs/adr/*.md` |
| `review_sources` | optional | レビュー結果文書 | `docs/review/*.md` |
| `source_status_policy` | yes | draft/active等の扱い | `active_preferred` |
| `write_policy` | yes | Context生成後の更新方針 | `draft_only` |

### 6.3 Draft YAML Candidate

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
    source_status_policy: "active_preferred_draft_allowed_with_warning"
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
    source_status_policy: "active_preferred_draft_allowed_with_warning"
    write_policy: "draft_only"
```

---

## 7. Agent Registry Requirements

### 7.1 Purpose

Agent Registryは、専門Agentごとの役割、必要Context、出力形式、禁止事項を管理する。

Phase 2では、Context Builderが `agent_code` から必要な文書種別と出力契約を解決するために使用する。

### 7.2 Required Fields

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

### 7.3 Initial Agent Candidates

| Agent Code | Agent Name | Required Context | Optional Context | Output Type | Priority |
|---|---|---|---|---|---|
| `adr_writer` | ADR整理Agent | project-summary / active-decisions / ADR | current-status / related docs | `adr_draft` | P0 |
| `requirements_writer` | 要件定義Agent | project-summary / current-status / next-actions | issues / ideas / previous requirements | `requirements_draft` | P0 |
| `implementation_reviewer` | 実装レビューAgent | project-summary / current-status / active-decisions | architecture / source / test docs | `review_report` | P1 |
| `task_planner` | タスク分解Agent | current-status / next-actions / active-decisions | roadmap / review docs | `task_plan` | P1 |
| `article_writer` | 記事化Agent | project-summary / conversation summaries | decisions / development logs | `article_draft` | Later |

### 7.4 Draft YAML Candidate

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
        - "Status"
        - "Context"
        - "Decision"
        - "Rationale"
        - "Alternatives Considered"
        - "Consequences"
        - "References"
    write_policy: "draft_only"
    prohibited_actions:
      - "正本へ直接writeしない"
      - "未承認Decisionをactiveとして扱わない"
      - "source_path未確認の文書を実在文書として扱わない"
    quality_checks:
      - "DecisionとTaskを混同していないか"
      - "ADR追加が必要な重要判断か"
      - "既存ADRと競合していないか"

  - agent_code: implementation_reviewer
    agent_name: "実装レビューAgent"
    purpose: "実装・UseCase・責務境界を設計方針に沿ってレビューする"
    required_context:
      memory_types:
        - project_summary
        - current_status
        - active_decisions
    optional_context:
      document_patterns:
        - "docs/architecture*.md"
        - "docs/usecase-contracts.md"
        - "docs/database-design*.md"
        - "src/**/*.ts"
        - "tests/**/*.ts"
    output_type: "review_report"
    write_policy: "draft_only"
    prohibited_actions:
      - "実在確認できないソースを前提に断定しない"
      - "未決定の改善案をActive Decisionとして扱わない"
```

---

## 8. Context Build Request Requirements

### 8.1 Purpose

Context Build Requestは、ユーザーが今回実行したい作業をContext Builderへ渡す入力である。

### 8.2 Required Fields

| Field | Required | Description | Example |
|---|---:|---|---|
| `project_code` | yes | 対象プロジェクト | `mnemosyne` |
| `agent_code` | yes | 利用Agent | `adr_writer` |
| `task_title` | yes | 作業名 | `M1-6 ADRドラフト作成` |
| `task_request` | yes | 依頼内容 | `ADR-004とADR-005を作成する` |
| `output_type` | recommended | 期待成果物 | `adr_draft` |
| `additional_sources` | optional | 追加参照文書 | `docs/review/...` |
| `include_recent_context` | optional | 直近会話を含めるか | `true` |

### 8.3 Draft Request Candidate

```yaml
context_build_request:
  project_code: mnemosyne
  agent_code: adr_writer
  task_title: "M1-6 Agent接続方針整理"
  task_request: "ADR-004、ADR-005、phase-2-input-requirements.mdのドラフトを作成する"
  output_type: "document_drafts"
  additional_sources:
    - "docs/phases/phase-1-memory-foundation.md"
    - "docs/review/phase-1-ats-template-validation.md"
  include_recent_context: true
```

---

## 9. Context Pack Requirements

### 9.1 Context Pack Output

Phase 2のContext Packは、AIへ渡すためのMarkdown生成物とする。

```text
dist/context/{project_code}-{agent_code}-{timestamp}.md
```

### 9.2 Required Sections

| Section | Required | Description |
|---|---:|---|
| Context Pack Metadata | yes | project_code、agent_code、generated_at等 |
| Agent Role | yes | Agentの目的、出力形式、禁止事項 |
| Project Summary | yes | 対象プロジェクトの概要 |
| Current Status | yes | 現在地、進行中事項、Issue |
| Active Decisions | yes | 有効な判断・制約 |
| Next Actions | conditional | Task系Agentでは必須 |
| Related ADR | conditional | ADR整理・判断系Agentでは必須 |
| Optional Sources | conditional | タスクに応じた追加文書 |
| Recent Conversation Context | optional | 直近会話要約 |
| Source List | yes | 読み込んだ文書一覧 |
| Warnings | yes | 不足、draft混入、競合、未確認source |

### 9.3 Context Pack Header Candidate

```markdown
# Context Pack

## Metadata

| Field | Value |
|---|---|
| project_code | ats |
| agent_code | implementation_reviewer |
| generated_at | 2026-06-05T00:00:00+09:00 |
| source_policy | active_preferred_draft_allowed_with_warning |
| write_policy | draft_only |

## Agent Role

You are acting as: Implementation Reviewer Agent.

## Target Project

Adventure Token System.
```

---

## 10. Source Status Policy

### 10.1 Status Handling

| Source Status | Context Builder Behavior |
|---|---|
| `active` | 優先的に読み込む |
| `draft` | 明示的に許可された場合のみ含め、Warningsに記録する |
| `superseded` | 履歴確認時のみ含める。現在判断として扱わない |
| `deprecated` | 原則除外する |
| `archived` | 履歴確認やレビュー目的のみ含める |
| unknown | Warningsに記録し、確定根拠として扱わない |

### 10.2 Conflict Handling

Active正本間に競合がある場合、Context Builderは以下を行う。

1. 競合scopeをWarningsに出力する
2. 競合中の内容を確定判断として扱わない
3. Conflict Issueへの参照を含める
4. AIに対して「このscopeは未解決」と明示する

---

## 11. Minimal CLI Requirements

### 11.1 Initial Command Candidate

```bash
npm run context:build -- --project ats --agent implementation_reviewer --task usecase-review
```

または、独立CLIとして以下を検討する。

```bash
mnemo context build --project ats --agent implementation_reviewer --task usecase-review
```

### 11.2 Required CLI Behavior

| Behavior | Required | Description |
|---|---:|---|
| Load Project Registry | yes | `project_code` を解決する |
| Load Agent Registry | yes | `agent_code` を解決する |
| Validate Required Docs | yes | 必須文書の存在・statusを確認する |
| Build Context Pack | yes | Markdown生成物を出力する |
| Generate Preview | yes | 人間確認用の同一Markdownまたはsummaryを出す |
| Generate Build Report | yes | source list、warnings、不足を出す |
| Auto Search Related Docs | no for Phase 2 | Phase 3以降の候補 |
| Write Back to Source Docs | no | ADR-003により禁止 |

---

## 12. Build Report Requirements

Context生成後、以下をBuild Reportとして出力する。

| Item | Description |
|---|---|
| `loaded_sources` | 読み込んだ文書一覧 |
| `missing_required_sources` | 不足している必須文書 |
| `included_draft_sources` | 含めたdraft文書 |
| `excluded_sources` | 除外した文書と理由 |
| `conflict_warnings` | 競合scope |
| `token_estimate` | 概算文字数またはトークン目安 |
| `next_recommended_action` | 不足や競合がある場合の推奨対応 |

---

## 13. Phase 2 Initial Tasks Candidate

| Task ID | Priority | Task | Output | Completion Criteria |
|---|---|---|---|---|
| P2-T01 | P0 | `projects.yaml` の初期schemaを作成する | registry draft | Mnemosyne / ATSを登録できる |
| P2-T02 | P0 | `agents.yaml` の初期schemaを作成する | registry draft | 最低2Agentを登録できる |
| P2-T03 | P0 | Context Build Request形式を定義する | request spec | project_code / agent_code / task_requestを渡せる |
| P2-T04 | P0 | Context Pack Markdown構成を定義する | output template | AIへ貼り付け可能な形式になる |
| P2-T05 | P1 | CLIプロトタイプを作成する | script / CLI | 指定project/agentでContext Packを生成できる |
| P2-T06 | P1 | Build Reportを出力する | report | 読込sourceとWarningsを確認できる |
| P2-T07 | P1 | ATSで実装レビューAgent用Contextを生成して検証する | validation report | 追加docs不足を明示できる |
| P2-T08 | P2 | token_budgetによる簡易圧縮・除外ルールを検討する | design note | 大きすぎるContextの扱い方を整理する |

---

## 14. Phase 2 Open Decisions

| Decision ID | Decision Needed | Options | Suggested Timing |
|---|---|---|---|
| P2-D-001 | Registry形式をYAMLにするかJSONにするか | YAML / JSON / TOML | P2-T01 |
| P2-D-002 | Context Pack出力先をどこにするか | `dist/context/` / `docs/context/` / temp only | P2-T04 |
| P2-D-003 | Agent定義をMarkdownとYAMLのどちらで管理するか | YAML正本 / Markdown正本 + YAML生成物 | P2-T02 |
| P2-D-004 | Recent Conversation Contextをどの条件で含めるか | always / optional / task only | P2-T03 |
| P2-D-005 | token_budget超過時の優先削除順序 | optional source削除 / summary化 / error | P2-T08 |
| P2-D-006 | Context生成結果をGit管理するか | 管理する / `.gitignore` / 一時出力 | P2-T04 |

---

## 15. Acceptance Criteria for Phase 2 Start

M1-6完了時点で、Phase 2へ進むには以下が満たされている必要がある。

| ID | Criteria | Status at Draft |
|---|---|---|
| P2-AC-001 | ADR-004でプロジェクト非依存テンプレート方針が整理されている | draft |
| P2-AC-002 | ADR-005でAgentとProject Contextの分離方針が整理されている | draft |
| P2-AC-003 | `projects.yaml` に必要な入力項目候補が整理されている | draft |
| P2-AC-004 | `agents.yaml` に必要な入力項目候補が整理されている | draft |
| P2-AC-005 | Context Build Requestの最低入力が整理されている | draft |
| P2-AC-006 | Context Packの必要sectionが整理されている | draft |
| P2-AC-007 | Phase 2で実装しない範囲が明確である | draft |

---

## 16. Review Points Before Active

Active化前に、以下を確認する。

| Review ID | Check Item | Expected Result |
|---|---|---|
| P2-REV-001 | ADR-004 / ADR-005と本書の用語が一致しているか | 一致している |
| P2-REV-002 | Phase 1の範囲外である実装詳細に踏み込みすぎていないか | 入力要件に留まっている |
| P2-REV-003 | Project RegistryとAgent Registryの責務が分離されているか | 分離されている |
| P2-REV-004 | Context Packが正本ではなく生成物として扱われているか | 扱われている |
| P2-REV-005 | ATS検証で出た追加docs不足の知見が反映されているか | 反映されている |
| P2-REV-006 | Task正本が `next-actions.md` である方針と競合しないか | 競合しない |

---

## 17. References

- `docs/phases/phase-1-memory-foundation.md`
- `docs/adr/ADR-004-project-independent-memory-template.md`
- `docs/adr/ADR-005-agent-context-separation.md`
- `docs/projects/mnemosyne/memory/project-summary.md`
- `docs/projects/mnemosyne/memory/current-status.md`
- `docs/projects/mnemosyne/memory/active-decisions.md`
- `docs/projects/mnemosyne/memory/next-actions.md`
- `docs/projects/mnemosyne/memory/ai-entrypoint.md`
- `docs/projects/ats/memory/project-summary.md`
- `docs/projects/ats/memory/current-status.md`
- `docs/projects/ats/memory/active-decisions.md`
- `docs/projects/ats/memory/next-actions.md`
- `docs/projects/ats/memory/ai-entrypoint.md`
- `docs/review/phase-1-ats-template-validation.md`

---

## 18. Change History

| Version | Date | Status | Change Summary | Approved By |
|---|---|---|---|---|
| 0.1.0 | 2026-06-05 | draft | M1-6 Agent接続方針整理としてPhase 2入力要件ドラフトを作成。 | pending |
