---

document_role: "current_status"
project_code: "{project_code}"
project_name: "{project_name}"
status: "draft"
version: "0.1.0"
updated_at: "YYYY-MM-DD"
last_reviewed_at: null
applicability_scope: "project"
source_path: "docs/projects/{project_code}/memory/current-status.md"
--------------------------------------------------------------------

# Current Status

<!--
目的:
- AIまたはレビュー担当者が、プロジェクトの現在地を短時間で把握できるようにする。
- 現在の状態を要約する文書であり、TaskやDecisionの詳細正本を置き換えない。

管理値:
- 文書status: draft / active / superseded / deprecated / archived
- task_status: todo / in_progress / blocked / done / cancelled / deferred
- issue_status: open / monitoring / resolved / archived
- conflict_status: open / under_review / resolved / dismissed

記載ルール:
- Taskの正式な管理は next-actions.md で行う。
- 現在有効な判断の正式な管理は active-decisions.md およびADRで行う。
- Active正本間の競合はConflict Issue文書へ正式記録し、本書では参照情報のみを記載する。
-->

## Status Metadata

| Field            | Value                                               |
| ---------------- | --------------------------------------------------- |
| project_code     | `{project_code}`                                    |
| project_status   | {planning / active / paused / completed / archived} |
| current_phase    | {phase_or_milestone}                                |
| status_as_of     | YYYY-MM-DD                                          |
| status_owner     | {owner_or_team}                                     |
| last_reviewed_at | YYYY-MM-DD                                          |
| next_review_at   | YYYY-MM-DD                                          |

## Current Objective

<!-- 現在のPhaseまたはレビュー期間で、最も重要な目的を1つ記載する。 -->

{現在の目的。}

## Current Position

| Item               | Current State                              | Evidence / Source Path | Updated At |
| ------------------ | ------------------------------------------ | ---------------------- | ---------- |
| Current milestone  | {マイルストーンと進行状態}                             | `{source_path}`        | YYYY-MM-DD |
| Completion outlook | {on_track / at_risk / blocked / completed} | `{source_path}`        | YYYY-MM-DD |
| Immediate focus    | {現在の焦点}                                    | `{source_path}`        | YYYY-MM-DD |

## Completed Recently

<!-- 現在の理解、後続作業、リスク判断に影響する完了事項のみ記載する。 -->

| Completion ID           | Completed Item | Result / Confirmed Fact | Source Path     | Completed At |
| ----------------------- | -------------- | ----------------------- | --------------- | ------------ |
| {project_code}-COMP-001 | {完了した作業}       | {得られた結果または確認済み事実}       | `{source_path}` | YYYY-MM-DD   |

## In Progress

<!-- 本表は状態把握用の要約である。Task IDは next-actions.md と一致させる。 -->

| Task ID                 | Work Summary | Priority | task_status | Output / Expected Result | Source Task Document                                  | Updated At |
| ----------------------- | ------------ | -------- | ----------- | ------------------------ | ----------------------------------------------------- | ---------- |
| {project_code}-TASK-001 | {作業概要}       | P0       | in_progress | {成果物または期待結果}             | `docs/projects/{project_code}/memory/next-actions.md` | YYYY-MM-DD |

## Blockers / Issues

| Issue ID               | Issue Type                  | Summary | Severity              | Impact / blocked_scope | issue_status | Source Path     | Related Task        |
| ---------------------- | --------------------------- | ------- | --------------------- | ---------------------- | ------------ | --------------- | ------------------- |
| {project_code}-ISS-001 | {issue / risk / dependency} | {問題概要}  | {high / medium / low} | {影響範囲}                 | open         | `{source_path}` | `{task_id_or_none}` |

## Active Source Conflicts

<!--
正式なConflict Issue文書への参照のみを記載する。
競合するActive正本のどちらが正しいかを、本書で独自に確定しない。
競合解消まで、該当DecisionまたはConstraintを確定ContextとしてAIへ渡さない。
-->

| Conflict Issue ID          | Severity              | blocked_scope             | Conflicting Sources         | conflict_status | Formal Issue Path                                                    | Required Handling               |
| -------------------------- | --------------------- | ------------------------- | --------------------------- | --------------- | -------------------------------------------------------------------- | ------------------------------- |
| {project_code}-CSP-ISS-001 | {high / medium / low} | {対象DecisionまたはConstraint} | `{source_a}` / `{source_b}` | open            | `docs/review/context-source-conflicts/{project_code}-CSP-ISS-001.md` | 解消まで該当scopeを確定AI Contextから除外する。 |

## Pending Decisions

<!-- Pending Decisionは判断が必要な論点であり、有効なDecisionではない。承認後に active-decisions.md またはADRへ反映する。 -->

| Pending Decision ID   | Question / Decision Needed | Why Needed Now | Candidate Sources | Decision Owner | Target Review | Status |
| --------------------- | -------------------------- | -------------- | ----------------- | -------------- | ------------- | ------ |
| {project_code}-PD-001 | {判断が必要な論点}                 | {現在判断が必要な理由}   | `{source_paths}`  | {owner}        | YYYY-MM-DD    | open   |

## Next Review Point

| Review Item   | Review Trigger / Date | Expected Decision or Confirmation | Related Source  |
| ------------- | --------------------- | --------------------------------- | --------------- |
| {review_item} | {trigger_or_date}     | {確認または判断すべき内容}                    | `{source_path}` |

## References

* `docs/projects/{project_code}/memory/project-summary.md`
* `docs/projects/{project_code}/memory/active-decisions.md`
* `docs/projects/{project_code}/memory/next-actions.md`
* `{related_phase_or_review_document}`

## Change History

| Version | Date       | Status | Change Summary               | Approved By |
| ------- | ---------- | ------ | ---------------------------- | ----------- |
| 0.1.0   | YYYY-MM-DD | draft  | テンプレートから初期Current Statusを作成。 | -           |
