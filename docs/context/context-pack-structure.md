---
title: "Context Pack Structure"
document_id: "docs/context/context-pack-structure.md"
document_role: "context_structure_definition"
status: "draft"
version: "0.1.0"
created_at: "2026-06-08"
updated_at: "2026-06-08"
phase: "Phase 2: Context Forge"
milestone: "M2-1: Context Pack標準構造定義"
related_documents:
  - "docs/phases/phase-2-context-forge.md"
  - "docs/phases/phase-2-input-requirements.md"
  - "docs/requirements/phase-requirements-2.md"
  - "docs/memory/memory-policy.md"
  - "docs/memory/memory-taxonomy.md"
  - "docs/memory/context-source-priority.md"
  - "docs/adr/ADR-001-docs-as-source-of-memory.md"
  - "docs/adr/ADR-002-memory-source-of-truth-boundary.md"
  - "docs/adr/ADR-003-human-approved-memory-update.md"
  - "docs/adr/ADR-005-agent-context-separation.md"
---

# Context Pack Structure

## 1. Status

`draft`

---

## 2. Purpose

本書は、Phase 2: Context Forge において生成する **Context Pack** の標準構造を定義する文書である。

Context Packは、Project Context、Agent Context、Task Context、Session Context、Recent Conversation Contextなどを選択・結合し、ChatGPT / Cursor / その他AIツールへ渡せるMarkdownとして整形した生成物である。

本書では、以下を定義する。

- Context Packの章構成
- 各章に含める情報
- Source Listの扱い
- Warningsの扱い
- Build Metadataの扱い
- Context Packが正本ではなく生成物であること

---

## 3. Context Pack Definition

### 3.1 One-Line Definition

```text
Context Packとは、Project × Agent × Task に応じて、AIへ渡す文脈を一つのMarkdownに組成した生成物である。
```

### 3.2 Context Pack Is Not Source of Truth

Context Packは正本ではない。

Context Packは、Activeな記憶文書、ADR、Task固有の追加資料、直近会話要約などを読み込み、特定のAI作業に向けて再構成した生成物である。

そのため、Context Pack上の記載が元文書と競合した場合は、以下を優先する。

| Priority | Source Type | Example |
|---:|---|---|
| 1 | Active ADR | `docs/adr/*.md` |
| 2 | Active運用文書 / Memory Policy | `docs/memory/*.md` |
| 3 | Activeプロジェクト記憶文書 | `docs/projects/{project}/memory/*.md` |
| 4 | Active Phase / Requirement文書 | `docs/phases/*.md`, `docs/requirements/*.md` |
| 5 | Task指定の追加資料 | `additional_sources` |
| 6 | Session Context | 今回作業セッションの補足 |
| 7 | Recent Conversation Context | 直近会話の未反映情報 |
| 8 | Context Pack | 生成物。正本ではない |

Context Pack内に誤り、欠落、古い情報、競合が見つかった場合、Context Packそのものを正として修正するのではなく、元となる正本文書またはdraft文書を修正対象とする。

---

## 4. Standard Structure

Context Packの標準構造は以下とする。

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

## 11. Additional Sources

## 12. Constraints and Write Policy

## 13. Warnings

## 14. Source List

## 15. Build Report
```

### 4.1 Structure Policy

Phase 2では、Project Context Pack、Agent Context Pack、Task Context Packなどを個別成果物として分離しない。

それぞれはContext Packを構成する章または入力要素として扱い、最終的に一つのContext Packへ結合する。

---

## 5. Required and Optional Sections

| No. | Section | Required | Purpose |
|---:|---|:---:|---|
| 1 | Build Metadata | yes | 生成条件、対象project、対象agent、入力task、生成日時を記録する |
| 2 | Base Context | yes | Project非依存の共通参照原則、情報優先順位、基本制約を示す |
| 3 | Agent Context | yes | 選択Agentの役割、責務、禁止事項、出力契約を示す |
| 4 | Project Context | yes | 対象プロジェクトの概要、目的、スコープを示す |
| 5 | Current Status | yes | 現在地、進捗、保留事項、直近の状態を示す |
| 6 | Active Decisions | yes | 現在有効な決定事項、ADR、設計判断を示す |
| 7 | Next Actions | yes | Task正本から次に行う作業を示す |
| 8 | Session Context | optional | 今回作業セッション内だけで有効な背景情報を示す |
| 9 | Recent Conversation Context | optional | 直近会話から未反映の補足、候補情報、注意点を示す |
| 10 | Task Context | yes | 今回AIに依頼する作業、成果物、完了条件を示す |
| 11 | Additional Sources | optional | Task固有に追加された文書、コード、レビュー対象を要約する |
| 12 | Constraints and Write Policy | yes | AIの操作境界、正本更新禁止、draft-only方針を示す |
| 13 | Warnings | yes | draft混入、競合、不足、除外、token制約などを示す |
| 14 | Source List | yes | 読み込んだsource、status、用途を一覧化する |
| 15 | Build Report | yes | 生成結果、coverage、missing docs、excluded sourcesを記録する |

---

## 6. Section Definitions

## 6.1 Build Metadata

### Purpose

Context Packの生成条件を記録し、後から「何を入力として生成したか」を追跡できるようにする。

### Required Items

| Item | Required | Description |
|---|:---:|---|
| `context_pack_version` | yes | Context Pack構造のversion |
| `generated_at` | yes | 生成日時 |
| `project_code` | yes | 対象project |
| `project_name` | recommended | 表示用project名 |
| `agent_code` | yes | 対象agent |
| `agent_name` | recommended | 表示用agent名 |
| `task_request` | yes | 今回の依頼内容 |
| `output_type` | recommended | 期待する出力種別 |
| `build_mode` | yes | `active_preferred` などの生成mode |
| `source_status_policy` | yes | source statusの扱い |
| `token_budget` | optional | token上限目安 |
| `builder_name` | optional | CLIまたはbuilder名 |
| `builder_version` | optional | builder version |

### Policy

Build MetadataはContext Packの正当性を保証するものではない。

ただし、Context Packをレビューする際に、対象project / agent / taskの取り違えを検出するための必須情報として扱う。

---

## 6.2 Base Context

### Purpose

Project非依存で常にAIへ渡す共通原則を示す。

### Included Information

- Context Packは正本ではなく生成物である
- Active文書を優先する
- draft / proposedは未確定として扱う
- superseded / deprecated / archivedは通常の根拠にしない
- AIは正本を直接更新せず、draftまたは提案を作成する
- 競合を見つけた場合は断定せず、WarningsまたはIssue候補として扱う

### Source Candidates

- `docs/memory/memory-policy.md`
- `docs/memory/memory-taxonomy.md`
- `docs/memory/context-source-priority.md`
- `docs/adr/ADR-001-docs-as-source-of-memory.md`
- `docs/adr/ADR-002-memory-source-of-truth-boundary.md`
- `docs/adr/ADR-003-human-approved-memory-update.md`

---

## 6.3 Agent Context

### Purpose

選択された専門Agentが、どの役割で、何を読み、何を出力し、何をしてはいけないかを示す。

### Included Information

- `agent_code`
- agent purpose
- role / responsibility
- required context categories
- optional context categories
- output contract
- prohibited actions
- write policy
- expected review perspective

### Policy

Agent ContextはProject固有の決定事項を持たない。

Project固有のFact / Decision / Task / Issueは、Project Context、Active Decisions、Next Actions、Current Statusから取得する。

---

## 6.4 Project Context

### Purpose

対象プロジェクトの基本情報をAIへ渡す。

### Included Information

- project name
- project purpose
- project scope
- in scope / out of scope
- main deliverables
- related phases or milestones
- project-specific terminology

### Source Candidates

- `docs/projects/{project_code}/memory/project-summary.md`
- phase文書
- requirement文書

---

## 6.5 Current Status

### Purpose

対象プロジェクトの現在地をAIへ渡す。

### Included Information

- current phase / milestone
- current status
- completed items
- in-progress items
- open issues
- pending review points
- recent validation results summary

### Source Candidates

- `docs/projects/{project_code}/memory/current-status.md`
- review documents
- phase completion review documents

### Policy

Current StatusはTask正本ではない。

Task正本は `next-actions.md` とし、Current Statusでは状態サマリーとして扱う。

---

## 6.6 Active Decisions

### Purpose

現在有効な判断、設計方針、ADRをAIへ渡す。

### Included Information

- active decisions
- accepted ADR summaries
- decision rationale
- superseded decision references when needed
- unresolved decision candidates when explicitly included

### Source Candidates

- `docs/projects/{project_code}/memory/active-decisions.md`
- `docs/adr/*.md`
- `docs/memory/context-source-priority.md`

### Policy

Active Decisionsは、draftまたはrecent contextに含まれる未承認判断より優先する。

---

## 6.7 Next Actions

### Purpose

現在のTask正本をAIへ渡す。

### Included Information

- active tasks
- next milestone tasks
- task priority
- task status
- acceptance criteria
- blockers
- target deliverables

### Source Candidates

- `docs/projects/{project_code}/memory/next-actions.md`
- phase task list

### Policy

Next ActionsはTask正本である。

Current Status、AI Entrypoint、Conversation Summary内のTask記載と競合する場合は、Next Actionsを優先し、差分をWarningまたはIssue候補として扱う。

---

## 6.8 Session Context

### Purpose

現在の作業セッションに固有の情報をAIへ渡す。

### Included Information

- 今回セッションで合意した作業範囲
- 一時的な前提
- 作業途中の検討メモ
- 今回だけ有効な制約
- ユーザーが明示した補足

### Policy

Session Contextは正本ではない。

Session ContextがActive正本と競合する場合は、Active正本を優先する。

ただし、ユーザーが今回作業の修正指示として明示した場合は、Task Contextの一部として扱う。

---

## 6.9 Recent Conversation Context

### Purpose

直近会話のうち、まだActive正本へ反映されていない可能性がある情報をAIへ渡す。

### Included Information

- 直近会話で確定したが未反映の可能性がある内容
- 直近会話で保留になった論点
- ユーザーが追加した修正指示
- Conversation Summaryに整理された候補情報

### Policy

Recent Conversation ContextはActive正本より優先しない。

Active正本と一致する場合は補足として扱う。

Active正本と競合する場合は、Conflict Warningとして扱う。

Recent Conversation Contextにしか存在しない判断は、Decision候補として扱い、確定判断としては扱わない。

---

## 6.10 Task Context

### Purpose

今回AIに実施させる具体作業を明示する。

### Required Items

| Item | Required | Description |
|---|:---:|---|
| `task_request` | yes | ユーザーの依頼内容 |
| `task_type` | recommended | draft / review / implementation_plan / validation 等 |
| `target_files` | recommended | 対象成果物またはコード |
| `deliverables` | yes | 作成・更新する成果物 |
| `acceptance_criteria` | recommended | 完了条件 |
| `user_constraints` | optional | ユーザー指定制約 |
| `out_of_scope` | optional | 今回扱わないもの |

### Policy

Task Contextは、Context Pack生成時点の依頼を表す。

Task Contextは正本ではないが、今回作業に対する直接指示として扱う。

---

## 6.11 Additional Sources

### Purpose

標準記憶文書だけでは不足する、Task固有の追加情報をAIへ渡す。

### Included Information

- 明示指定された文書
- 明示指定されたコード
- review文書
- test result文書
- phase固有文書
- requirement文書

### Policy

Additional Sourcesは標準記憶文書を置き換えない。

Additional Sourcesにdraft文書を含める場合は、Warningsへ明示する。

---

## 6.12 Constraints and Write Policy

### Purpose

AIの操作境界、出力範囲、正本更新ルールを明示する。

### Included Information

- AIは正本を直接更新しない
- AIはdraft、提案、レビュー、差分案を作成できる
- Active化は人間承認後に行う
- Context Packは生成物であり、正本更新結果ではない
- draft sourceを確定判断の根拠にしない
- conflictを見つけた場合はIssue候補として扱う

### Source Candidates

- `docs/memory/memory-policy.md`
- `docs/adr/ADR-003-human-approved-memory-update.md`
- `docs/projects/{project_code}/memory/active-decisions.md`

---

## 6.13 Warnings

### Purpose

Context Pack利用時にAIと人間が注意すべき事項を明示する。

### Warning Types

| Warning Type | Meaning | Required Handling |
|---|---|---|
| `missing_required_doc` | 必須文書が存在しない | Build Reportへ記録し、Contextの欠落として扱う |
| `draft_source_included` | draft文書が含まれる | 未確定情報として明示する |
| `deprecated_source_included` | deprecated文書が含まれる | 通常根拠にしない |
| `superseded_source_included` | superseded文書が含まれる | 履歴目的として扱う |
| `archived_source_included` | archived文書が含まれる | 履歴目的として扱う |
| `conflict_detected` | source間で競合がある | Active優先。Issue候補として扱う |
| `recent_context_conflict` | recent contextがActive正本と競合 | Active優先。更新候補として扱う |
| `token_budget_exceeded` | token上限を超過 | 除外・要約・分割が必要 |
| `source_excluded` | sourceが除外された | 除外理由を記録する |
| `unknown_status` | source statusが不明 | 確定根拠にしない |

### Policy

WarningsはContext Pack内に必ず章として出力する。

Warningがない場合も、`No warnings.` と明記する。

---

## 6.14 Source List

### Purpose

Context Pack生成時に読み込んだsourceを追跡可能にする。

### Required Items

| Item | Required | Description |
|---|:---:|---|
| `source_id` | yes | Context Pack内で参照するsource ID |
| `path` | yes | source path |
| `document_id` | recommended | sourceのdocument_id |
| `title` | recommended | source title |
| `status` | yes | active / draft / archived 等 |
| `source_type` | yes | adr / memory_doc / phase_doc / requirement / code / review 等 |
| `included_section` | recommended | Context Pack内の反映先章 |
| `purpose` | recommended | 読み込んだ理由 |
| `handling` | recommended | normal / warning / reference_only / excluded |

### Policy

Source ListはContext Packの末尾に必ず出力する。

Source Listは、AIが参照した根拠を人間が確認するための一覧であり、sourceの内容そのものを正本化するものではない。

---

## 6.15 Build Report

### Purpose

Context Pack生成処理の結果を要約する。

### Included Information

- source coverage
- included sources count
- excluded sources count
- missing required docs
- warnings count
- token estimate
- generation result
- next recommended action

### Policy

Build ReportはContext Packに内包してもよいが、CLI実装では別ファイルとして `build-report.md` を出力してもよい。

Context Pack内に内包する場合は、AIへ渡してよい範囲に要約する。

---

## 7. Source Status Handling

| Source Status | Include by Default | Handling |
|---|:---:|---|
| `active` | yes | 通常の根拠として扱う |
| `accepted` | yes | ADR等で通常の根拠として扱う |
| `draft` | no | 明示指定時のみwarning付きで含める |
| `proposed` | no | 候補として扱う |
| `superseded` | no | 履歴比較時のみ含める |
| `deprecated` | no | 原則除外。含める場合はwarning必須 |
| `archived` | no | 履歴目的でのみ含める |
| `unknown` | no | 確定根拠にしない |

---

## 8. Context Ordering Policy

AIへ渡すContext Packでは、以下の順序で情報を提示する。

1. 生成条件を確認するためのBuild Metadata
2. 読み方を制御するBase Context
3. AIの役割を制御するAgent Context
4. Project固有の文脈
5. 現在地・決定・次アクション
6. セッション固有または直近会話の補足
7. 今回タスクの具体指示
8. 制約と書き込み方針
9. Warnings
10. Source List / Build Report

この順序により、AIがTaskだけを見て正本・制約・決定事項を無視するリスクを下げる。

---

## 9. Minimum Valid Context Pack

最小有効Context Packは、以下をすべて満たす必要がある。

| Requirement | Description |
|---|---|
| MVP-001 | Build Metadataが存在する |
| MVP-002 | Base Contextが存在する |
| MVP-003 | Agent Contextが存在する |
| MVP-004 | Project Contextが存在する |
| MVP-005 | Current Statusが存在する |
| MVP-006 | Active Decisionsが存在する |
| MVP-007 | Next Actionsが存在する |
| MVP-008 | Task Contextが存在する |
| MVP-009 | Constraints and Write Policyが存在する |
| MVP-010 | Warningsが存在する。warningなしの場合も明記されている |
| MVP-011 | Source Listが存在する |
| MVP-012 | Context Packが正本ではないことが明記されている |

---

## 10. Relationship with Build Report

Context PackとBuild Reportは役割が異なる。

| Item | Purpose | Human Use | AI Use |
|---|---|---|---|
| Context Pack | AIへ渡す文脈本体 | 内容確認 | 作業文脈として読む |
| Build Report | 生成処理の検査結果 | 欠落・除外・警告確認 | 必要に応じて警告を参照 |

Phase 2初期実装では、Context Pack内にBuild Report要約を含める。

CLI実装が進んだ段階で、以下の2ファイル出力を許容する。

```text
dist/context/{project_code}/{agent_code}/context-pack.md
dist/context/{project_code}/{agent_code}/build-report.md
```

---

## 11. Out of Scope

本書では以下を扱わない。

| Out of Scope | Reason |
|---|---|
| Context読み込み優先順位の詳細アルゴリズム | `context-build-rule.md` で扱う |
| Project Registryのschema詳細 | M2-2以降で扱う |
| Agent Registryのschema詳細 | M2-3以降で扱う |
| CLI引数仕様 | M2-4以降で扱う |
| token圧縮アルゴリズム | Phase 2後半またはPhase 3以降で扱う |
| RAG / Vector Search | Phase 3で扱う |
| Memory API | Phase 4で扱う |
| MCP連携 | Phase 5で扱う |
| AI回答の自動正本反映 | Phase 2対象外。人間承認境界を維持する |

---

## 12. Acceptance Criteria

M2-1は、以下を満たした場合に完了とする。

| ID | Criteria |
|---|---|
| M2-1-AC-001 | Context Packの標準章構成が定義されている |
| M2-1-AC-002 | 各章の目的と含める情報が定義されている |
| M2-1-AC-003 | 必須章と任意章が区別されている |
| M2-1-AC-004 | Build Metadataの項目が定義されている |
| M2-1-AC-005 | Source Listの項目と扱いが定義されている |
| M2-1-AC-006 | Warningsの種類と扱いが定義されている |
| M2-1-AC-007 | Context Packが正本ではなく生成物であることが明記されている |
| M2-1-AC-008 | `templates/context/context-pack.template.md` と対応している |

---

## 13. Draft Review Points

Active化前に以下を確認する。

| ID | Review Point |
|---|---|
| RP-001 | `phase-2-context-forge.md` のM2-1記載と成果物名が一致しているか |
| RP-002 | `phase-requirements-2.md` の標準構成との差異が意図的か |
| RP-003 | `Warnings` を `Referenced Sources` より前に置く構成で問題ないか |
| RP-004 | `Build Report` をContext Pack内に含めるか、別成果物に分離するか |
| RP-005 | `Session Context` と `Recent Conversation Context` の境界が実装可能な粒度か |
| RP-006 | Source Status HandlingがM1のtaxonomy/status定義と整合しているか |
