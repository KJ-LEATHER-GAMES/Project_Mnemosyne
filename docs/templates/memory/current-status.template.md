---
title: "Memory Template: Current Status"
document_id: "docs/templates/memory/current-status.template.md"
document_role: "template"
template_for: "current_status"
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

# Current Status

<!--
目的:
- AIまたは人間が、対象Projectの現在地を短時間で把握できるようにする。
- 現在の状態を要約する文書であり、Task本文またはDecision本文の正本を置き換えない。

コピー利用時の処理:
- 対象Project用にfrontmatterと本文プレースホルダーを置換し、コピー直後は `status: draft` とする。

管理値:
- 文書status: draft / active / superseded / deprecated / archived
- task_status: todo / in_progress / blocked / done / cancelled / deferred
- issue_status: open / monitoring / resolved / accepted_risk / archived
- conflict_status: open / under_review / resolved / closed

責務境界:
- Task本文・完了条件の正本は `next-actions.md` とする。
- 現在有効なDecision / Constraintの正本は `active-decisions.md` と関連ADRとする。
- Active正本間競合の正式記録はConflict Issue文書とし、本書はProject状態として参照を保持する。
-->

## Status Metadata

| Field | Value |
|---|---|
| project_code | `{project_code}` |
| project_status | {planning / active / paused / completed / archived} |
| current_phase | {phase_or_milestone} |
| status_as_of | YYYY-MM-DD |
| status_owner | {owner_or_team} |
| last_reviewed_at | YYYY-MM-DD |
| next_review_at | YYYY-MM-DD |

## Current Objective

{現在のPhaseまたはレビュー期間における最重要目的。}

## Current Position

| Item | Current State | Evidence / Source Path | Updated At |
|---|---|---|---|
| Current milestone | {マイルストーンと状態} | `{source_path}` | YYYY-MM-DD |
| Completion outlook | {on_track / at_risk / blocked / completed} | `{source_path}` | YYYY-MM-DD |
| Immediate focus | `{current_focus_task_id}`: {要約のみ} | `docs/projects/{project_code}/memory/next-actions.md` | YYYY-MM-DD |

## Completed Recently

<!-- 現在理解または後続作業に影響する完了事項のみを記載する。 -->

| Completion ID | Completed Item | Result / Confirmed Fact | Source Path | Completed At |
|---|---|---|---|---|
| {project_code}-COMP-001 | {完了した作業} | {得られた結果または確認済み事実} | `{source_path}` | YYYY-MM-DD |

## In Progress

<!-- Task本文を複製せず、現在地把握に必要なTask IDと短い状態要約のみを記載する。 -->

| Task ID | Work Summary | Priority | task_status | Source Task Document | Updated At |
|---|---|---|---|---|---|
| {project_code}-TASK-001 | {進行中作業の短い要約} | P0 | in_progress | `docs/projects/{project_code}/memory/next-actions.md` | YYYY-MM-DD |

## Blockers / Issues

| Issue ID | Issue Type | Summary | Severity | Impact / blocked_scope | issue_status | Source Path | Related Task |
|---|---|---|---|---|---|---|---|
| {project_code}-ISS-001 | {issue / risk / dependency} | {問題概要} | {high / medium / low} | {影響範囲} | open | `{source_path}` | `{task_id_or_none}` |

## Active Source Conflicts

<!--
正式なConflict Issue文書への参照を保持する唯一のProject Memoryテンプレートである。
競合中のDecision / Constraintは、解消まで確定Contextとして利用しない。
-->

| Conflict Issue ID | Severity | blocked_scope | Conflicting Sources | conflict_status | Formal Issue Path | Required Handling |
|---|---|---|---|---|---|---|
| {project_code}-CSP-ISS-001 | {high / medium / low} | {対象DecisionまたはConstraint} | `{source_a}` / `{source_b}` | open | `docs/review/context-source-conflicts/{project_code}-CSP-ISS-001.md` | 解消まで該当scopeを確定AI Contextから除外する。 |

## Pending Decisions

<!-- 未決定論点であり、承認・正本反映までActive Decisionとして扱わない。 -->

| Pending Decision ID | Question / Decision Needed | Why Needed Now | Candidate Sources | Decision Owner | Target Review | Status |
|---|---|---|---|---|---|---|
| {project_code}-PD-001 | {判断が必要な論点} | {判断が必要な理由} | `{source_paths}` | {owner} | YYYY-MM-DD | open |

## Next Review Point

| Review Item | Review Trigger / Date | Expected Decision or Confirmation | Related Source |
|---|---|---|---|
| {review_item} | {trigger_or_date} | {確認または判断すべき内容} | `{source_path}` |

## References

- `docs/projects/{project_code}/memory/project-summary.md`
- `docs/projects/{project_code}/memory/active-decisions.md`
- `docs/projects/{project_code}/memory/next-actions.md`
- `docs/memory/context-source-priority.md`
- `{related_phase_or_review_document}`

## Change History

| Version | Date | Status | Change Summary | Approved By |
|---|---|---|---|---|
| 1.0.0 | 2026-06-05 | active | M1-3 Active化レビューを反映し、Conflict Issue参照先とTask要約責務を確定。 | Human approval by user instruction |
