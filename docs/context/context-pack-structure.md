---
title: "Context Pack Structure"
document_id: "docs/context/context-pack-structure.md"
document_role: "context_structure_definition"
status: "active"
version: "1.0.0"
created_at: "2026-06-08"
updated_at: "2026-06-09"
phase: "Phase 2: Context Forge"
milestone: "M2-1: Context Pack標準構造定義"
owner: "Project Mnemosyne"
review_status: "active"
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
  - "docs/templates/context/context-pack.template.md"
---

# Context Pack Structure

## 1. Status

`active`

本書は、M2-1：Context Pack標準構造定義のActive成果物である。

---

## 2. Purpose

本書は、Phase 2: Context Forge において生成する **Context Pack** の標準構造を定義する。

Context Packは、Project Context、Agent Context、Task Context、Session Context、Recent Conversation Contextなどを選択・結合し、ChatGPT / Cursor / その他AIツールへ渡せるMarkdownとして整形した生成物である。

本書では、以下を定義する。

- Context Packの章構成
- 各章に含める情報
- Source Listの扱い
- Warningsの扱い
- Build Metadataの扱い
- Build Report Summaryの扱い
- Context Packが正本ではなく生成物であること
- Phase 2成果物候補との関係
- M1で定義したstatusとの整合ルール

---

## 3. Relationship to Phase 2 Deliverables

### 3.1 Position of This Document

本書は、Phase 2成果物候補である `docs/context/context-pack-format.md` の前段として、Context Packの章構成・必須項目・Source List / Warnings / Build Metadata / Build Report Summaryを定義するM2-1成果物である。

今後、`docs/context/context-pack-format.md` を作成する場合は、本書を基準として、より詳細なformat仕様、schema、validation ruleへ展開する。

### 3.2 Template Location Policy

Context Packテンプレートは、既存のMemory Template配置方針に合わせ、以下を正式配置とする。

```text
docs/templates/context/context-pack.template.md
```

`templates/context/context-pack.template.md` のようにrepository root直下へ置く構成は、過去の `docs/templates/memory/*.template.md` と配置方針が揃わないため、M2-1 Active版では採用しない。

### 3.3 Relationship with Previous Candidate Structure

Phase 2 Input Requirementsで示されたContext Pack Candidate Structureは、本書ではM1で確定したContext階層、Task正本、Agent Context分離方針に合わせて15章構成へ詳細化する。

| Previous Candidate Section | M2-1 Active Standard Section |
|---|---|
| Build Metadata | 1. Build Metadata |
| Agent Role and Output Contract | 3. Agent Context |
| Project Context | 4. Project Context |
| Active Decisions and Constraints | 6. Active Decisions / 12. Constraints and Write Policy |
| Current Status | 5. Current Status |
| Task Context | 7. Next Actions / 10. Task Context |
| Additional Sources | 11. Additional Sources |
| Recent Conversation Context | 8. Session Context / 9. Recent Conversation Context |
| Warnings | 13. Warnings |
| Source List | 14. Source List |
| Build Report | 15. Build Report Summary |

この詳細化は、旧構成の破棄ではなく、AIが読みやすく、かつSource境界とWarningを明示しやすくするための展開である。

---

## 4. Context Pack Definition

### 4.1 One-Line Definition

```text
Context Packとは、Project × Agent × Task に応じて、AIへ渡す文脈を一つのMarkdownに組成した生成物である。
```

### 4.2 Context Pack Is Not Source of Truth

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

## 5. Standard Structure

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

## 15. Build Report Summary
```

### 5.1 Structure Policy

Phase 2では、Project Context Pack、Agent Context Pack、Task Context Packなどを個別成果物として分離しない。

Context Packは、以下を統合した単一Markdownとして生成する。

- Project Context
- Agent Context
- Task Context
- Session Context
- Recent Conversation Context
- Additional Sources
- Warnings
- Source List
- Build Report Summary

### 5.2 Section Order Policy

`Warnings` は `Source List` より前に配置する。

理由は以下である。

- AIがsource詳細一覧を読む前に、欠落・競合・draft混入などの注意事項を認識できる。
- draftやdeprecated sourceを確定情報として誤読するリスクを下げられる。
- 人間レビュー時に、source一覧より先に問題箇所を確認できる。

---

## 6. Section Definitions

### 6.1 Build Metadata

Context Pack生成条件を記録する。

必須項目は以下とする。

| Item | Description |
|---|---|
| `context_pack_version` | Context Pack構造version |
| `generated_at` | 生成日時 |
| `project_code` | 対象project code |
| `project_name` | 対象project name |
| `agent_code` | 対象agent code。未指定時は `default` |
| `agent_name` | 対象agent name |
| `task_request` | Context Pack生成時のtask request概要 |
| `output_type` | review / draft / implementation_plan / investigation等 |
| `build_mode` | standard / minimal / full / debug等 |
| `source_status_policy` | draft等の扱い |
| `token_budget` | Context Pack生成時のtoken budget |
| `builder_name` | builder tool name |
| `builder_version` | builder tool version |

### 6.2 Base Context

Projectに依存しない共通原則を記載する。

含める情報は以下とする。

- Context Packは正本ではないこと
- Active sourceが優先されること
- AIはActive正本を直接更新しないこと
- draft / proposed / recent contextの扱い
- Source Priority
- 共通制約

### 6.3 Agent Context

Agentごとの役割・責務・出力契約を記載する。

含める情報は以下とする。

- Agent role
- Responsibilities
- Out of scope
- Required context
- Allowed operations
- Forbidden operations
- Output contract

### 6.4 Project Context

対象projectの概要を記載する。

含める情報は以下とする。

- Project purpose
- Project scope
- Out of scope
- Current phase
- Main deliverables
- Related systems / repositories
- Project memory documents

### 6.5 Current Status

対象projectの現在地を記載する。

含める情報は以下とする。

- Current phase / milestone
- Completed items
- In-progress items
- Known issues
- Recent changes
- Current working context

Current Statusは状態サマリーであり、Task正本ではない。

### 6.6 Active Decisions

Activeな判断事項を記載する。

含める情報は以下とする。

- Accepted ADR
- Active decisions
- Architecture decisions
- Operational decisions
- Source of truth boundaries
- Context handling rules

### 6.7 Next Actions

次に行うべき作業を記載する。

含める情報は以下とする。

- Active tasks
- Next milestone tasks
- Priority
- Done criteria
- Dependencies

Task正本は、原則として `next-actions.md` で管理する。

### 6.8 Session Context

今回のContext Build Requestまたは一時入力に含まれる情報を記載する。

Session Contextは今回生成するContext Packに閉じる一時情報であり、正本ではない。

含める情報は以下とする。

- 今回の作業依頼
- 今回だけ有効な補足条件
- 一時的な作業方針
- CLI引数または手動入力されたcontext
- その場で指定されたreview観点

Session ContextがActive sourceと競合する場合、Active sourceを優先し、競合はWarningsへ記録する。

### 6.9 Recent Conversation Context

Conversation Summary等から取得する、直近会話由来の未反映情報を記載する。

Recent Conversation Contextは正本ではない。ただし、正本化前の候補情報として、AI作業時の文脈補助に利用できる。

含める情報は以下とする。

- 直近会話で合意されたが未反映の候補
- 直近会話で確認されたIssue候補
- 直近会話で提示された修正方針
- Conversation Summaryから抽出された重要事項

Recent Conversation Contextは、正本反映、reviewed、archived等の状態遷移まで参照候補として残り得る。

Recent Conversation ContextがActive sourceと競合する場合、Active sourceを優先し、競合はWarningsへ記録する。

### 6.10 Task Context

今回のAI作業に必要なtask-specific contextを記載する。

含める情報は以下とする。

- Task objective
- Required outputs
- Done criteria
- Review viewpoints
- Input files
- Expected change scope
- Non-goals

### 6.11 Additional Sources

Taskで明示指定された追加資料を記載する。

含める情報は以下とする。

- Source summary
- Relevant excerpts
- Why included
- Handling note
- Status note

Additional Sourcesは正本より優先しない。

### 6.12 Constraints and Write Policy

AIの操作境界を記載する。

含める情報は以下とする。

- AIが作成できる成果物
- AIが直接更新してはいけないもの
- Human approvalが必要な操作
- Draft / Active化の境界
- Source of truth boundary
- Write policy

### 6.13 Warnings

Context Pack生成時の警告を記載する。

Warningsは必須章とする。

警告がない場合も、以下のように明記する。

```text
No warnings.
```

Warning種別は以下とする。

| Warning Type | Description |
|---|---|
| `missing_required_doc` | 必須sourceが存在しない |
| `draft_source_included` | draft sourceを含めた |
| `proposed_source_included` | proposed sourceを含めた |
| `deprecated_source_included` | deprecated sourceを含めた |
| `superseded_source_included` | superseded sourceを含めた |
| `archived_source_included` | archived sourceを含めた |
| `conflict_detected` | source間の競合を検知した |
| `recent_context_conflict` | recent contextとActive sourceの競合を検知した |
| `token_budget_exceeded` | token budgetによりsourceを省略した |
| `source_excluded` | sourceを除外した |
| `unknown_status` | source statusを判定できなかった |

### 6.14 Source List

Context Pack生成に使ったsource一覧を記載する。

Source Listは必須章とする。

Source Listの必須項目は以下とする。

| Field | Description |
|---|---|
| `source_id` | Context Pack内で参照するsource ID |
| `path` | source path |
| `document_id` | source document_id |
| `title` | source title |
| `status` | active / draft / archived等 |
| `source_type` | adr / memory_doc / phase_doc / requirement / code / review等 |
| `included_section` | 反映先章 |
| `purpose` | 読み込んだ理由 |
| `handling` | normal / warning / reference_only / excluded |

### 6.15 Build Report Summary

Context Pack内には、Build Reportの要約を必ず含める。

Build Report Summaryには、AIが作業時に誤読を避けるために必要な最小情報のみを含める。

含める情報は以下とする。

- Included source count
- Excluded source count
- Warning count
- Conflict count
- Missing required source count
- Token budget handling
- Detailed Build Report path

詳細なBuild Reportは、CLI実装時に別ファイルとして出力してよい。

標準出力候補は以下とする。

```text
dist/context/{project_code}/{agent_code}/context-pack.md
dist/context/{project_code}/{agent_code}/build-report.md
```

Context Pack内のBuild Report Summaryと、別ファイルのBuild Reportが競合する場合は、元sourceおよびBuild Report詳細を確認し、Context Packを正本として扱わない。

---

## 7. Source Status Handling

Context Builderはsource statusに応じて、以下の扱いを行う。

| Status | Handling | Context Pack Inclusion |
|---|---|---|
| `active` | 現在有効な正本文書・運用文書・記憶文書 | include normally |
| `accepted` | 採用済みADRまたはDecision系source | include normally |
| `draft` | 未承認 | include only when explicitly requested, with warning |
| `proposed` | 提案中 | include only when explicitly requested, with warning |
| `superseded` | 置換済み | exclude by default; include only for history with warning |
| `deprecated` | 非推奨 | exclude by default; include only for history with warning |
| `archived` | 保管済み | exclude by default; include only for history with warning |
| `unknown` | status判定不能 | include only with warning or exclude by policy |

`unknown` はM1で定義した正式statusではない。

`unknown` は、Context Builderがsourceのstatusを判定できなかった場合のbuild-time handling valueとして扱う。

`unknown` sourceは確定根拠に使用せず、WarningsおよびBuild Report Summaryに記録する。

---

## 8. Required Context Pack Rules

Context Packは以下のルールを満たす必要がある。

1. Context Packは正本ではないことを明記する。
2. Build Metadataを必ず含める。
3. Warningsを必ず含める。
4. Source Listを必ず含める。
5. Build Report Summaryを必ず含める。
6. draft / proposed / archived / deprecated / superseded sourceを含める場合はWarningsへ記録する。
7. Active sourceとRecent Conversation Contextが競合する場合はActive sourceを優先する。
8. Session Contextは今回作業セッション内の一時情報として扱う。
9. Context Pack内の情報は、元sourceへtraceできるようにする。
10. Context PackをActive正本として扱ってはならない。

---

## 9. Active Definition of Done

M2-1は以下を満たすことでActive完了とする。

- [x] Context Packの章構成が定義されている。
- [x] 各章に含める情報が定義されている。
- [x] Source Listの扱いが定義されている。
- [x] Warningsの扱いが定義されている。
- [x] Build Metadataの扱いが定義されている。
- [x] Build Report Summaryの扱いが定義されている。
- [x] Context Packが正本ではなく生成物であることが明記されている。
- [x] Phase 2成果物候補とM2-1成果物名の関係が明記されている。
- [x] Session ContextとRecent Conversation Contextの境界が定義されている。
- [x] M1 status定義との整合ルールが定義されている。
- [x] Templateの正式配置が `docs/templates/context/context-pack.template.md` と定義されている。

---

## 10. Revision Notes

### 10.1 M2-1 Active Revision

P0/P1レビュー結果に基づき、以下を反映した。

| ID | Result |
|---|---|
| M2-1-REV-P0-001 | Phase 2成果物候補とM2-1成果物名の関係を明記 |
| M2-1-REV-P0-002 | Build ReportはContext Pack内にSummaryを必須化し、詳細版は別ファイル出力可能と定義 |
| M2-1-REV-P1-001 | 既存候補構成から15章構成への展開対応表を追加 |
| M2-1-REV-P1-002 | Session Context / Recent Conversation Context の入力元・有効期間・保持境界を追記 |
| M2-1-REV-P1-003 | `active` と `accepted` の使い分けを補足 |
| M2-1-REV-P1-004 | `unknown` は正式statusではなくbuild-time handling valueと明記 |

