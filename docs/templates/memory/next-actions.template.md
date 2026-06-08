---

document_role: "next_actions"
project_code: "{project_code}"
project_name: "{project_name}"
status: "draft"
version: "0.1.0"
updated_at: "YYYY-MM-DD"
last_reviewed_at: null
applicability_scope: "project"
source_path: "docs/projects/{project_code}/memory/next-actions.md"
------------------------------------------------------------------

# Next Actions

<!--
目的:
- プロジェクトで次に実施する作業を、AIおよび人間が誤解なく参照できる形で保持する。
- Taskの正本として、優先度、成果物、完了条件および実行進捗を明示する。
- 新しいプロジェクトの初期記憶を作成する際に、本テンプレートをコピーして使用する。

管理値:
- 文書status: draft / active / superseded / deprecated / archived
- task_status: todo / in_progress / blocked / done / cancelled / deferred
- priority: P0 / P1 / P2 / Later

記載ルール:
- Active Tasksへ記載できるのは、実施することが合意されたTaskのみとする。
- Idea、Candidate Decision、未レビューのConversation Summary抽出内容を、判断なしにTaskへ格上げしない。
- `task_status` はTaskの実行進捗を示す。文書または記憶の有効性を示す `status` と混同しない。
- 完了したTaskはActive Tasksへ残し続けず、必要に応じて current-status.md の完了事項、test_result、decision、factへ反映する。
- Active正本間競合により作業が停止している場合は、正式なConflict Issueを参照し、該当Taskを `blocked` とする。
-->

## Action Register Metadata

| Field                   | Value                                                   |
| ----------------------- | ------------------------------------------------------- |
| project_code            | `{project_code}`                                        |
| current_phase           | {phase_or_milestone}                                    |
| action_owner            | {owner_or_team}                                         |
| as_of                   | YYYY-MM-DD                                              |
| last_reviewed_at        | YYYY-MM-DD                                              |
| next_review_at          | YYYY-MM-DD                                              |
| related_status_document | `docs/projects/{project_code}/memory/current-status.md` |

## Current Execution Focus

<!-- Active Tasksのうち、現在最も優先して進める作業を短く記載する。 -->

* current_focus_task_id: `{project_code}-TASK-001`
* current_focus_summary: {現在最優先で進める作業の要約}
* reason_for_priority: {なぜ現在の最優先であるか}

## Priority Definition

| Priority | Meaning    |
| -------- | ---------- |
| P0       | 次に必ず実施     |
| P1       | P0完了後に実施   |
| P2       | 必要性を確認して実施 |
| Later    | 将来候補       |

## Active Tasks

<!--
- `task_status` が `todo`、`in_progress` または `blocked` のTaskを記載する。
- `blocked` の詳細は Blockers / Dependencies に記載する。
-->

| Priority | Task ID                 | Task     | Purpose | Input                         | Output                         | Completion Criteria | task_status | Related Decision / Constraint         | Source Path     | Updated At |
| -------- | ----------------------- | -------- | ------- | ----------------------------- | ------------------------------ | ------------------- | ----------- | ------------------------------------- | --------------- | ---------- |
| P0       | {project_code}-TASK-001 | {実施する作業} | {実施目的}  | `{input_path_or_description}` | `{output_path_or_description}` | {完了と判断できる条件}        | todo        | `{decision_or_constraint_id_or_none}` | `{source_path}` | YYYY-MM-DD |

## Blockers / Dependencies

<!-- Taskの停止要因または着手前提を記載する。正本間競合の場合はConflict Issueの正式パスを必ず記載する。 -->

| Task ID                 | Blocker / Dependency | Impact | Required Resolution | Related Issue / Conflict Path | task_status | Updated At |
| ----------------------- | -------------------- | ------ | ------------------- | ----------------------------- | ----------- | ---------- |
| {project_code}-TASK-XXX | {停止要因または依存条件}        | {影響範囲} | {再開に必要な対応}          | `{issue_or_conflict_path}`    | blocked     | YYYY-MM-DD |

## Deferred Tasks

<!-- 実施価値はあるが、現時点で優先対象外としたTaskを記載する。 -->

| Task ID                 | Task       | Reason Deferred | Resume Trigger | Priority When Resumed | task_status | Source Path     | Updated At |
| ----------------------- | ---------- | --------------- | -------------- | --------------------- | ----------- | --------------- | ---------- |
| {project_code}-TASK-YYY | {延期するTask} | {延期理由}          | {再検討または再開条件}   | {P1 / P2 / Later}     | deferred    | `{source_path}` | YYYY-MM-DD |

## Not Doing Now

<!-- Idea、要望、候補機能等のうち、現時点でTask化しないものを記載する。 -->

| Candidate | Reason Not Doing Now | Reconsideration Trigger | Source Path     | Updated At |
| --------- | -------------------- | ----------------------- | --------------- | ---------- |
| {候補内容}    | {今は実施しない理由}          | {再検討条件}                 | `{source_path}` | YYYY-MM-DD |

## Completion and Update Rules

| Rule ID  | Rule                                                                            |
| -------- | ------------------------------------------------------------------------------- |
| NA-R-001 | Taskは、実施合意、目的、成果物および完了条件が明確になった時点でActive Tasksへ登録する。                            |
| NA-R-002 | `task_status: done` となったTaskはActive Tasksから除外し、確認された成果を適切な正本文書または検証記録へ反映する。     |
| NA-R-003 | Conversation Summaryから抽出されたNew Taskは、レビューおよび反映判断を経て本書へ登録されるまで候補として扱う。           |
| NA-R-004 | TaskがActive正本間競合の影響を受ける場合、Conflict Issueを参照し、解消まで `task_status: blocked` として扱う。 |
| NA-R-005 | AIは本書の追加・修正ドラフトを作成できるが、`active` な正本への反映は人間承認後に行う。                               |

## References

* `docs/projects/{project_code}/memory/project-summary.md`
* `docs/projects/{project_code}/memory/current-status.md`
* `docs/projects/{project_code}/memory/active-decisions.md`
* `{related_phase_or_requirement_document}`

## Change History

| Version | Date       | Status | Change Summary             | Approved By |
| ------- | ---------- | ------ | -------------------------- | ----------- |
| 0.1.0   | YYYY-MM-DD | draft  | テンプレートから初期Next Actionsを作成。 | -           |
