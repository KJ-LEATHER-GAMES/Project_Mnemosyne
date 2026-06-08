---
title: "Mnemosyne Memory: AI Entrypoint"
document_id: "docs/projects/mnemosyne/memory/ai-entrypoint.md"
document_role: "project_memory"
memory_type: "ai_entrypoint"
project_code: "mnemosyne"
status: "active"
version: "1.0.0"
created_at: "2026-06-05"
updated_at: "2026-06-05"
phase: "Phase 1: Memory Foundation"
milestone: "M1-4: Mnemosyne初期記憶作成"
related_documents:
  - "docs/projects/mnemosyne/memory/project-summary.md"
  - "docs/projects/mnemosyne/memory/current-status.md"
  - "docs/projects/mnemosyne/memory/active-decisions.md"
  - "docs/projects/mnemosyne/memory/next-actions.md"
  - "docs/phases/phase-1-memory-foundation.md"
  - "docs/requirements/overall-requirements.md"
  - "docs/memory/memory-policy.md"
  - "docs/memory/memory-taxonomy.md"
  - "docs/memory/context-source-priority.md"
---

# AI Entrypoint

## Entrypoint Metadata

| Field | Value |
|---|---|
| project_code | `mnemosyne` |
| project_name | Project Mnemosyne |
| entrypoint_for | AI consultation / project continuation / document drafting |
| current_phase | Phase 1: Memory Foundation |
| current_milestone | M1-4: Mnemosyne初期記憶作成 |
| status_as_of | 2026-06-05 |
| source_of_truth_policy | Markdown docs / ADR first, AI draft only |
| update_authority | Human approval required |

## Entrypoint Boundary

この文書はProject Mnemosyne相談時の入口であり、Decision / Task / Issue / Constraint の正本ではない。

判断・制約・タスク・Issueの正本は、各参照先文書を確認すること。

| Information Type | Source of Truth |
|---|---|
| Project purpose / stable overview | `docs/projects/mnemosyne/memory/project-summary.md` |
| Current status / Issue / Pending Decision | `docs/projects/mnemosyne/memory/current-status.md` |
| Active Decision / Constraint | `docs/projects/mnemosyne/memory/active-decisions.md` |
| Task / priority / completion criteria / task_status | `docs/projects/mnemosyne/memory/next-actions.md` |
| Common memory policy | `docs/memory/memory-policy.md` |
| Context priority / conflict handling | `docs/memory/context-source-priority.md` |

## What This Project Is

Project Mnemosyneの詳細な目的・背景・Scopeは `docs/projects/mnemosyne/memory/project-summary.md` を正本とする。

本章では、AIが支援開始時に誤解しないための最小要約のみを記載する。

Project Mnemosyneは、AIとの会話、設計判断、タスク、記事メモ、ドキュメント更新案を外部記憶として整理し、AIが必要な文脈を再利用できるようにするための個人開発向けAI外部記憶基盤である。

このプロジェクトは、AIにすべてを内部記憶させることを目的としない。

目的は、GitHub docs、ADR、Notion、PostgreSQL、Context Pack、RAG、MCP、Agentなどを段階的に組み合わせ、AIが参照できる正本・副本・生成物の境界を明確にした記憶基盤を作ることである。

## Current Working Point

現在は、Phase 1: Memory Foundation の M1-4「Mnemosyne初期記憶作成」をActive化済みである。

M1-4では、Project Mnemosyne自身を記憶構造の最初の利用対象として、以下の5文書を作成・Active化した。

- `docs/projects/mnemosyne/memory/project-summary.md`
- `docs/projects/mnemosyne/memory/current-status.md`
- `docs/projects/mnemosyne/memory/active-decisions.md`
- `docs/projects/mnemosyne/memory/next-actions.md`
- `docs/projects/mnemosyne/memory/ai-entrypoint.md`

次の自然な作業は、M1-5「ATS適用検証」である。

## Minimal Reading Set

通常のProject Mnemosyne相談では、以下を最小読み取りセットとする。

| Order | Document | Purpose |
|---|---|---|
| 1 | `docs/projects/mnemosyne/memory/ai-entrypoint.md` | 入口、読み順、制約、誤解しやすい点を把握する |
| 2 | `docs/projects/mnemosyne/memory/current-status.md` | 現在地、Issue、Pending Decisionを把握する |
| 3 | `docs/projects/mnemosyne/memory/active-decisions.md` | 現在有効なDecision / Constraintを確認する |
| 4 | `docs/projects/mnemosyne/memory/next-actions.md` | 次に実施すべきタスクと優先順位を確認する |

`project-summary.md` は、プロジェクト目的・背景・Scope・Stable Factsを確認する必要がある場合に読む。

## Full Reading Set for New Chat

新しいAIチャットでProject Mnemosyneの相談を開始する場合は、以下の5文書をFull Reading Setとして渡す。

| Order | Document | Purpose |
|---|---|---|
| 1 | `docs/projects/mnemosyne/memory/ai-entrypoint.md` | 参照入口、読み順、制約、誤解しやすい点を把握する |
| 2 | `docs/projects/mnemosyne/memory/project-summary.md` | プロジェクト目的、背景、範囲、正本方針を把握する |
| 3 | `docs/projects/mnemosyne/memory/current-status.md` | 現在地、進行中タスク、Issue、Pending Decisionを把握する |
| 4 | `docs/projects/mnemosyne/memory/active-decisions.md` | 現在有効なDecision / Constraintを確認する |
| 5 | `docs/projects/mnemosyne/memory/next-actions.md` | 次に実施すべきタスクと優先順位を確認する |

## Supporting Documents to Read When Needed

| Document | Purpose | Read When |
|---|---|---|
| `docs/phases/phase-1-memory-foundation.md` | Phase 1の目的、マイルストーン、成果物、完了条件を確認する | Phase 1作業の妥当性確認時 |
| `docs/requirements/overall-requirements.md` | Project Mnemosyne全体の目的・機能要件・非機能要件を確認する | 全体方針やPhase境界の確認時 |
| `docs/memory/memory-policy.md` | 正本・副本・AI更新権限を確認する | 文書更新・正本判断時 |
| `docs/memory/memory-taxonomy.md` | memory_type、status、Conversation Summaryの扱いを確認する | 情報分類時 |
| `docs/memory/context-source-priority.md` | Context参照優先順位、競合Issue、古い情報の扱いを確認する | 情報競合や参照優先度の判断時 |
| `docs/adr/ADR-001-docs-as-source-of-memory.md` | Markdown docsを初期正本とする理由を確認する | 正本方針確認時 |
| `docs/adr/ADR-002-memory-source-of-truth-boundary.md` | docs / ADR / Notion / DB / Context Packの境界を確認する | 正本・副本境界の判断時 |
| `docs/adr/ADR-003-human-approved-memory-update.md` | AI draft only / 人間承認ルールを確認する | 更新案作成時 |

## Important Constraints

詳細なConstraint本文は、以下を正本として参照する。

- `docs/projects/mnemosyne/memory/active-decisions.md`
- `docs/memory/memory-policy.md`
- `docs/memory/context-source-priority.md`
- `docs/adr/ADR-003-human-approved-memory-update.md`

このAI Entrypointでは、運用上重要な制約を要約する。

| Constraint Summary | Source |
|---|---|
| AIは正本文書へ直接writeしない。draft / 修正案 / 差分案として提示する。 | `docs/projects/mnemosyne/memory/active-decisions.md` |
| 正本反映は人間承認後とする。 | `docs/adr/ADR-003-human-approved-memory-update.md` |
| Context Pack、Search Result Context、AI Draftは正本ではなく生成物として扱う。 | `docs/memory/context-source-priority.md` |
| Conversation Summaryは単独ではActive Decision / Constraintの根拠にしない。 | `docs/memory/memory-taxonomy.md` |
| Active正本間に競合がある場合、Conflict Issueのblocked_scopeを確認する。 | `docs/projects/mnemosyne/memory/current-status.md` |
| Phase 1ではRAG / API / MCP / UI / Agent実装を行わない。 | `docs/phases/phase-1-memory-foundation.md` |

## Available Document Sources

| Source Category | Path / Example | Role |
|---|---|---|
| Project Memory | `docs/projects/mnemosyne/memory/*.md` | Project Mnemosyneの現在の記憶正本 |
| Phase Plan | `docs/phases/phase-1-memory-foundation.md` | Phase 1の作業計画正本 |
| Requirements | `docs/requirements/overall-requirements.md` / `docs/requirements/phase-requirements-*.md` | 要件正本 |
| Memory Policy | `docs/memory/memory-policy.md` | 正本・副本・更新権限の正本 |
| Memory Taxonomy | `docs/memory/memory-taxonomy.md` | memory_type / statusの正本 |
| Context Priority | `docs/memory/context-source-priority.md` | Context参照優先順位の正本 |
| ADR | `docs/adr/ADR-*.md` | 重要判断の正本 |
| Templates | `docs/templates/memory/*.template.md` | Project Memory文書のテンプレート |

## Rules for Drafting Changes

AIがProject Mnemosyneの文書作成・更新を支援する場合、以下のルールに従う。

| Rule ID | Rule | Reason |
|---|---|---|
| DRAFT-RULE-001 | 新規文書は `status: draft` として作成する | 人間レビュー前の文書を正本扱いしないため |
| DRAFT-RULE-002 | 既存文書の修正は、全文案または差分案として提示する | AIが直接正本を更新しないため |
| DRAFT-RULE-003 | Decision / Constraintを追加する場合は、source_pathを明記する | 根拠追跡を可能にするため |
| DRAFT-RULE-004 | 未決定事項は `Pending Decision` または `Issue` として扱う | Active Decisionへの混入を防ぐため |
| DRAFT-RULE-005 | Taskは `next-actions.md` を正本とし、current-status.mdでは状態要約に留める | Task正本の重複を防ぐため |
| DRAFT-RULE-006 | Conflict Issue一覧は `current-status.md` に集約する | 競合管理の重複を防ぐため |
| DRAFT-RULE-007 | ai-entrypoint.mdではConstraint本文を重複定義せず、参照中心にする | 制約正本の分散を防ぐため |
| DRAFT-RULE-008 | Phase 1スコープ外の実装案は `Deferred` または `Later` として扱う | 実装先行による設計ブレを防ぐため |

## How to Answer Common Requests

| User Request Type | AI Response Rule | Primary Source |
|---|---|---|
| 「今どこまで進んでいる？」 | current-status.mdを基準に、現在Phase / milestone / summary statusを答える | `current-status.md` |
| 「次に何をやる？」 | next-actions.mdのP0 / P1を基準に答える | `next-actions.md` |
| 「この判断は確定？」 | active-decisions.mdとADRを確認して、activeかpendingかを分けて答える | `active-decisions.md` / `docs/adr/` |
| 「文書を作って」 | テンプレートと該当Phase文書を確認し、draftとして提示する | `docs/templates/memory/` / `docs/phases/` |
| 「Active化して」 | まずレビュー指摘を洗い出し、修正版を提示する。人間承認が必要であることを前提にする | `memory-policy.md` |
| 「古い会話ではこう言っていた」 | Conversation Summaryや過去メモをそのまま正本扱いせず、Active正本との差分を確認する | `context-source-priority.md` |
| 「Agent設計を進めたい」 | M1-6の範囲では接続方針整理まで。実装はPhase 6対象として扱う | `docs/phases/phase-1-memory-foundation.md` |

## Known Risks of Misinterpretation

| Risk ID | Misinterpretation Risk | Correct Handling |
|---|---|---|
| RISK-001 | MnemosyneをATS専用の記憶基盤と誤解する | Mnemosyneは複数プロジェクト向け外部記憶基盤。ATSは検証対象の1つ |
| RISK-002 | Context Packを正本と誤解する | Context PackはAI入力用の生成物。正本はdocs / ADR |
| RISK-003 | Conversation Summaryをそのまま確定Decisionと扱う | Conversation Summaryは記憶候補。Active Decision反映には人間承認が必要 |
| RISK-004 | Phase 1でRAG / API / MCP / Agentを実装しようとする | Phase 1では記憶構造と運用ルールを固定する。実装は後続Phase |
| RISK-005 | AIが文書へ直接反映できると誤解する | AIはdraft only。正本反映は人間承認後 |
| RISK-006 | current-status.mdとnext-actions.mdの責務を混同する | current-status.mdは現在地・Issue・Pending Decision、next-actions.mdはTask正本 |
| RISK-007 | active-decisions.mdへIssue一覧を重複記載する | Active正本間競合Issue一覧はcurrent-status.mdへ一本化する |
| RISK-008 | 将来構想をActive Decisionとして扱う | 将来構想はIdea / Deferred / Laterとして扱い、Decisionとは分離する |

## Minimal Context Pack for New Chat

新しいAIチャットでProject Mnemosyneの相談を始める場合、最低限以下を渡す。

```text
1. docs/projects/mnemosyne/memory/ai-entrypoint.md
2. docs/projects/mnemosyne/memory/project-summary.md
3. docs/projects/mnemosyne/memory/current-status.md
4. docs/projects/mnemosyne/memory/active-decisions.md
5. docs/projects/mnemosyne/memory/next-actions.md
```

Phase 1の詳細作業を行う場合は、追加で以下を渡す。

```text
6. docs/phases/phase-1-memory-foundation.md
7. docs/memory/memory-policy.md
8. docs/memory/memory-taxonomy.md
9. docs/memory/context-source-priority.md
```

文書作成を行う場合は、追加で以下を渡す。

```text
10. docs/templates/memory/*.template.md
```

## AI Operating Posture

AIは、Project Mnemosyneに対して以下の姿勢で支援する。

- 正本に基づいて回答する
- 古い会話情報を無条件に採用しない
- 決定済み、未決定、提案、Issueを分ける
- Phase 1では実装より文書構造と運用ルールを優先する
- 文書作成時はdraftとして提示する
- Active化前にはレビュー観点を提示する
- 不明な点は、推測で確定扱いせずPending DecisionまたはIssueとして扱う

## References

- `docs/projects/mnemosyne/memory/project-summary.md`
- `docs/projects/mnemosyne/memory/current-status.md`
- `docs/projects/mnemosyne/memory/active-decisions.md`
- `docs/projects/mnemosyne/memory/next-actions.md`
- `docs/phases/phase-1-memory-foundation.md`
- `docs/requirements/overall-requirements.md`
- `docs/memory/memory-policy.md`
- `docs/memory/memory-taxonomy.md`
- `docs/memory/context-source-priority.md`
- `docs/adr/ADR-001-docs-as-source-of-memory.md`
- `docs/adr/ADR-002-memory-source-of-truth-boundary.md`
- `docs/adr/ADR-003-human-approved-memory-update.md`

## Change History

| Version | Date | Status | Change Summary | Approved By |
|---|---|---|---|---|
| 0.1.0 | 2026-06-05 | draft | M1-4 Mnemosyne初期記憶作成として初版ドラフトを作成。 | pending |
| 1.0.0 | 2026-06-05 | active | M1-4 Active化レビューのP1-001/P1-002/P1-004を反映。Entrypoint Boundary、Minimal Reading Set、Full Reading Set、Project概要の最小要約方針を追加してActive化。 | user |
