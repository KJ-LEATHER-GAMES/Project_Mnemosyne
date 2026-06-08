---
title: "Memory Template: AI Entrypoint"
document_id: "docs/templates/memory/ai-entrypoint.template.md"
document_role: "template"
template_for: "ai_entrypoint"
status: "active"
version: "1.0.0"
created_at: "2026-06-04"
updated_at: "2026-06-05"
approved_at: "2026-06-05"
phase: "Phase 1: Memory Foundation"
milestone: "M1-3: Template整備"
related_documents:
  - "docs/phases/phase-1-memory-foundation.md"
  - "docs/memory/memory-policy.md"
  - "docs/memory/memory-taxonomy.md"
  - "docs/memory/context-source-priority.md"
---

# AI Entrypoint

<!--
目的:
- AIが対象Projectを支援するときの参照開始点とする。
- 最初に読む正本、条件付き参照先、draft作成境界および誤参照防止ルールを示す。
- 本書はContext Packまたは検索設定ではなく、Project単位の参照ルート文書である。

コピー利用時の処理:
- 対象Project用にfrontmatterと本文プレースホルダーを置換し、コピー直後は `status: draft` とする。

責務境界:
- Constraint本文は `active-decisions.md` または共通Policy / ADRを正本とし、本書では参照先と必須行動のみを示す。
- Context BuilderまたはRecall Engineの生成・検索設定は後続Phaseの仕様へ委ねる。
-->

## Entrypoint Metadata

| Field | Value |
|---|---|
| project_code | `{project_code}` |
| project_status | {planning / active / paused / completed / archived} |
| current_phase | {phase_or_milestone} |
| entrypoint_owner | {owner_or_team} |
| as_of | YYYY-MM-DD |
| last_reviewed_at | YYYY-MM-DD |
| memory_root | `docs/projects/{project_code}/memory/` |

## What This Project Is

{プロジェクトの目的、対象、およびAI支援時に把握すべき現在の位置づけを2〜4文で記載する。}

## What the AI Should Read First

<!-- 各文書について、`status: active` の最新版を参照する。 -->

1. `docs/projects/{project_code}/memory/project-summary.md`  
   - プロジェクトの目的、安定Fact、Scopeおよび正本マップを把握する。
2. `docs/projects/{project_code}/memory/current-status.md`  
   - 現在地、Issue、Conflict Issue参照およびPending Decisionを把握する。
3. `docs/projects/{project_code}/memory/active-decisions.md`  
   - 現在有効なDecision / Constraintと置換・非推奨履歴を把握する。
4. `docs/projects/{project_code}/memory/next-actions.md`  
   - 実施対象Task、優先度、成果物、完了条件および `task_status` を把握する。

## Conditional Reading Routes

| Task / Question Type | Additional Sources to Read | Purpose | Reference Condition |
|---|---|---|---|
| 重要判断の理由確認 | `{adr_root}/ADR-*.md` | Decisionの理由・代替案・影響を確認する | `active` なADRを参照し、競合時はConflict Issueを確認する。 |
| Phase成果物または完了条件の確認 | `docs/phases/{phase_document}.md` | PhaseスコープとDoDを確認する | `active` なPhase文書を参照する。 |
| 会話経緯または更新候補の確認 | `{conversation_summary_root}/*.md` | 経緯復元と反映候補の確認を補助する | `review_status: reviewed` / `reflected` は補助参照可、`archived` は履歴確認時のみ可。 |
| 競合・不整合の確認 | `docs/review/context-source-conflicts/*.md` | `blocked_scope` と解消状況を確認する | Conflict IssueをDecisionの代替正本として扱わない。 |
| 検証結果の確認 | `{test_result_or_review_root}/*.md` | 実施済み確認と根拠を把握する | レビュー済みまたはActiveな記録を参照する。 |

## Important Constraints

<!-- Constraint本文は複製せず、正本参照とAIが守る行動境界を記載する。 -->

| Constraint Reference | Authoritative Source | Required AI Handling |
|---|---|---|
| AI update permission | `{memory_policy_or_adr_path}` | 正本文書へ直接writeせず、修正案または新規案を `draft` として提示する。 |
| Decision evidence boundary | `{memory_taxonomy_or_active_decisions_path}` | 未反映Conversation Summaryおよび未決定案をActive Decision / Constraintの根拠としない。 |
| Conflict blocked scope | `{context_source_priority_path}` | openのConflict Issueが示す `blocked_scope` を確定Contextとして提示しない。 |

## Available Document Sources

| Source Category | Path / Pattern | Role | Normal Use | Do Not Treat As |
|---|---|---|---|---|
| Project Summary | `docs/projects/{project_code}/memory/project-summary.md` | 目的・安定情報の正本 | 基本読込 | Task本文の正本 |
| Current Status | `docs/projects/{project_code}/memory/current-status.md` | 現在地・Issue・競合参照の正本 | 基本読込 | Decision本文の正本 |
| Active Decisions | `docs/projects/{project_code}/memory/active-decisions.md` | 現行Decision / Constraintの正本 | 基本読込 | 未決定案の保存先 |
| Next Actions | `docs/projects/{project_code}/memory/next-actions.md` | Taskの正本 | 基本読込 | Idea一覧の正本 |
| ADR | `{adr_root}/ADR-*.md` | 重要判断理由の正本 | 判断根拠確認時 | 単なる進捗記録 |
| Conversation Summary | `{conversation_summary_root}/*.md` | 会話経緯と反映候補の整理記録 | 条件付き補助参照 | Active Decision / Constraintの単独根拠 |
| Conflict Issue | `docs/review/context-source-conflicts/*.md` | 競合検知・解消確認記録 | 競合確認時 | 競合内容の代替正本 |
| Context Pack / AI Draft | `{generated_output_path}` | 生成物 | 作業入力またはレビュー対象 | 正本 |

## Rules for Drafting Changes

| Action | Permission | Required Handling |
|---|---|---|
| Active正本のread | Allowed | 出典とstatusを確認する。 |
| 情報の要約・比較 | Allowed | 確定事項、候補、競合を分離する。 |
| 新規文書案・修正案の作成 | Allowed | `status: draft` として提示し、反映先を示す。 |
| Active正本へのwrite | Not allowed | 人間承認・人間反映を必要とする。 |
| 正本文書または履歴のdelete | Not allowed | 廃止・置換はstatusと履歴で管理する。 |

## Known Risks of Misinterpretation

| Risk ID | Risk | Required Prevention |
|---|---|---|
| {project_code}-RISK-001 | 古い会話の方針を現行Decisionと誤認する。 | `active-decisions.md` または関連ADRで反映有無を確認する。 |
| {project_code}-RISK-002 | Task進捗と文書statusを混同する。 | `next-actions.md` の `task_status` を参照する。 |
| {project_code}-RISK-003 | 競合中のDecisionを確定ルールとして利用する。 | `current-status.md` とConflict Issueの `blocked_scope` を確認する。 |
| {project_code}-RISK-004 | 生成物を正本として参照する。 | 必ず元のActive正本へ遡る。 |
| {project_code}-RISK-005 | 履歴保管済みConversation Summaryを現在判断に利用する。 | `review_status: archived` は履歴確認のみに限定する。 |

## References

- `docs/projects/{project_code}/memory/project-summary.md`
- `docs/projects/{project_code}/memory/current-status.md`
- `docs/projects/{project_code}/memory/active-decisions.md`
- `docs/projects/{project_code}/memory/next-actions.md`
- `{memory_policy_path}`
- `{memory_taxonomy_path}`
- `{context_source_priority_path}`

## Change History

| Version | Date | Status | Change Summary | Approved By |
|---|---|---|---|---|
| 1.0.0 | 2026-06-05 | active | M1-3 Active化レビューを反映し、Constraint本文の重複を除去し、条件付き参照ルートとdraft境界を確定。 | Human approval by user instruction |
