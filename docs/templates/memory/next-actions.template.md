---
title: "Memory Template: Next Actions"
document_id: "docs/templates/memory/next-actions.template.md"
document_role: "template"
template_for: "next_actions"
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

# Next Actions

<!--
目的:
- 対象Projectで次に実施することが合意されたTaskを保持する。
- 優先度、入力、出力、完了条件および実行進捗をAIと人間が誤解なく参照できるようにする。

コピー利用時の処理:
- 対象Project用にfrontmatterと本文プレースホルダーを置換し、コピー直後は `status: draft` とする。

管理値:
- 文書status: draft / active / superseded / deprecated / archived
- task_status: todo / in_progress / blocked / done / cancelled / deferred
- priority: P0 / P1 / P2 / Later

責務境界:
- 本書はTaskの正本である。
- Idea、候補Decision、未レビューConversation Summary抽出内容を自動的にTaskへ格上げしない。
- 共通のTask運用ルールは `docs/memory/memory-taxonomy.md` を参照し、本書へ重複記載しない。
-->

## Action Register Metadata

| Field | Value |
|---|---|
| project_code | `{project_code}` |
| current_phase | {phase_or_milestone} |
| action_owner | {owner_or_team} |
| as_of | YYYY-MM-DD |
| last_reviewed_at | YYYY-MM-DD |
| next_review_at | YYYY-MM-DD |
| related_status_document | `docs/projects/{project_code}/memory/current-status.md` |

## Current Execution Focus

<!-- Task本文はActive Tasks表を正とし、ここでは最初に扱うTask IDと優先理由のみを示す。 -->

| Field | Value |
|---|---|
| current_focus_task_id | `{project_code}-TASK-001` |
| reason_for_priority | {なぜ最優先か} |

## Priority Definition

| Priority | Meaning |
|---|---|
| P0 | 次に必ず実施 |
| P1 | P0完了後に実施 |
| P2 | 必要性を確認して実施 |
| Later | 将来候補 |

## Active Tasks

<!-- `task_status` が `todo`、`in_progress` または `blocked` の実施合意済みTaskを記載する。 -->

| Priority | Task ID | Task | Purpose | Input | Output | Completion Criteria | task_status | Related Decision / Constraint | Source Path | Updated At |
|---|---|---|---|---|---|---|---|---|---|---|
| P0 | {project_code}-TASK-001 | {実施する作業} | {実施目的} | `{input_path_or_description}` | `{output_path_or_description}` | {完了と判断できる条件} | todo | `{decision_or_constraint_id_or_none}` | `{source_path}` | YYYY-MM-DD |

## Blockers / Dependencies

<!-- 正本間競合による停止の場合は、正式Conflict Issue文書を必ず参照する。 -->

| Task ID | Blocker / Dependency | Impact | Required Resolution | Related Issue / Conflict Path | task_status | Updated At |
|---|---|---|---|---|---|---|
| {project_code}-TASK-XXX | {停止要因または依存条件} | {影響範囲} | {再開に必要な対応} | `{issue_or_conflict_path}` | blocked | YYYY-MM-DD |

## Deferred Tasks

| Task ID | Task | Reason Deferred | Resume Trigger | Priority When Resumed | task_status | Source Path | Updated At |
|---|---|---|---|---|---|---|---|
| {project_code}-TASK-YYY | {延期するTask} | {延期理由} | {再検討または再開条件} | {P1 / P2 / Later} | deferred | `{source_path}` | YYYY-MM-DD |

## Not Doing Now

<!-- 現時点ではTask化しない候補を記載する。必要な場合はConversation SummaryまたはIdea正本へも参照を残す。 -->

| Candidate | Reason Not Doing Now | Reconsideration Trigger | Source Path | Updated At |
|---|---|---|---|---|
| {候補内容} | {今は実施しない理由} | {再検討条件} | `{source_path}` | YYYY-MM-DD |

## References

- `docs/projects/{project_code}/memory/project-summary.md`
- `docs/projects/{project_code}/memory/current-status.md`
- `docs/projects/{project_code}/memory/active-decisions.md`
- `docs/memory/memory-taxonomy.md`
- `docs/memory/context-source-priority.md`
- `{related_phase_or_requirement_document}`

## Change History

| Version | Date | Status | Change Summary | Approved By |
|---|---|---|---|---|
| 1.0.0 | 2026-06-05 | active | M1-3 Active化レビューを反映し、Task正本責務、`task_status`、参照中心の運用構成を確定。 | Human approval by user instruction |
