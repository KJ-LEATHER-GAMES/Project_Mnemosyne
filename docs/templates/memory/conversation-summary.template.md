---

document_role: "conversation_summary"
project_code: "{project_code}"
project_name: "{project_name}"
status: "draft"
review_status: "draft"
version: "0.1.0"
created_at: "YYYY-MM-DD"
updated_at: "YYYY-MM-DD"
last_reviewed_at: null
applicability_scope: "project"
source_type: "conversation"
source_reference: "{chat_or_log_reference}"
source_path: "docs/projects/{project_code}/memory/conversations/{YYYY-MM-DD}-{topic_slug}.md"
---------------------------------------------------------------------------------------------

# Conversation Summary

<!--
目的:
- 会話ログをそのまま正本化せず、再利用可能な記憶候補として分類・整理する。
- Decision、Task、Issue、Idea等の候補を抽出し、正本文書への反映要否をレビューできるようにする。

管理値:
- 文書status: draft / active / superseded / deprecated / archived
- review_status: draft / reviewed / reflected
- reflection_status: not_reviewed / pending / reflected / not_required / rejected

参照ルール:
- 作成直後は `status: draft` かつ `review_status: draft` とする。
- 内容の正確性が人間レビューで確認された場合、`status: active` かつ `review_status: reviewed` として補助参照できる。
- 必要なDecision、Constraint、Task、Issue等について正本反映要否を判断し、必要反映が完了した場合、`review_status: reflected` とする。
- 本書内のConfirmed Decisionsは「会話内で確定した発言・合意」を意味する。Active DecisionまたはConstraintの根拠として使用するには、active-decisions.md、ADR等の正本へ反映されていることを確認する。
- `review_status: archived` は使用しない。保管状態は共通 `status: archived` で表す。
-->

## Metadata

| Field           | Value                            |
| --------------- | -------------------------------- |
| summary_id      | `{project_code}-CS-YYYYMMDD-001` |
| date            | YYYY-MM-DD                       |
| related_project | `{project_code}`                 |
| topic           | {会話テーマ}                          |
| source          | `{chat_or_log_reference}`        |
| source_type     | conversation                     |
| prepared_by     | {human_or_ai}                    |
| status          | draft                            |
| review_status   | draft                            |
| reviewer        | {reviewer_or_pending}            |
| reflected_at    | {YYYY-MM-DD_or_null}             |

## Discussion Summary

<!-- 会話の目的、主な論点、到達点、残った論点を簡潔に整理する。 -->

{会話全体の要約。}

## Confirmed Decisions

<!--
会話の中でユーザーが明示的に決定した、または合意した内容を記載する。
ここへの記載だけではActive Decisionの正本反映完了を意味しない。
-->

| Candidate ID            | Decision Confirmed in Conversation | Confirmation Evidence / Context | Reflection Target                                         | reflection_status | Related ADR / Source Path |
| ----------------------- | ---------------------------------- | ------------------------------- | --------------------------------------------------------- | ----------------- | ------------------------- |
| {project_code}-CS-D-001 | {会話内で確定した判断}                       | {確定と判断できる発言または文脈}               | `docs/projects/{project_code}/memory/active-decisions.md` | pending           | `{adr_path_or_none}`      |

## Candidate Decisions

<!-- 明示的な決定には至っていないが、判断候補としてレビューすべき内容を記載する。 -->

| Candidate ID             | Candidate Decision | Reason to Consider | Required Decision / Reviewer | Reflection Target       | reflection_status |
| ------------------------ | ------------------ | ------------------ | ---------------------------- | ----------------------- | ----------------- |
| {project_code}-CS-CD-001 | {判断候補}             | {検討する価値または背景}      | {必要な判断}                      | `{target_path_or_none}` | not_reviewed      |

## New Tasks

<!--
会話から抽出された新規Task候補を記載する。
本表の記載内容は、next-actions.mdへ反映されるまでTask正本ではない。
-->

| Candidate Task ID          | Task Candidate | Purpose | Proposed Priority      | Expected Output                | Completion Criteria | Reflection Target                                     | reflection_status |
| -------------------------- | -------------- | ------- | ---------------------- | ------------------------------ | ------------------- | ----------------------------------------------------- | ----------------- |
| {project_code}-CS-TASK-001 | {新規作業候補}       | {目的}    | {P0 / P1 / P2 / Later} | `{output_path_or_description}` | {完了条件}              | `docs/projects/{project_code}/memory/next-actions.md` | pending           |

## Issues / Open Questions

| Candidate Issue ID        | Issue / Question | Impact | Required Action or Decision | Reflection Target                                       | reflection_status |
| ------------------------- | ---------------- | ------ | --------------------------- | ------------------------------------------------------- | ----------------- |
| {project_code}-CS-ISS-001 | {課題または未解決論点}     | {影響}   | {必要な対応}                     | `docs/projects/{project_code}/memory/current-status.md` | pending           |

## Ideas for Later

| Candidate Idea ID          | Idea   | Potential Value | Why Not Now | Revisit Trigger | reflection_status |
| -------------------------- | ------ | --------------- | ----------- | --------------- | ----------------- |
| {project_code}-CS-IDEA-001 | {将来候補} | {期待価値}          | {今扱わない理由}   | {再検討条件}         | not_required      |

## Other Extracted Memory Candidates

<!-- fact / preference / constraint / article_note / test_result 等を抽出する場合に使用する。 -->

| Candidate ID              | memory_type                                                   | Extracted Content | Evidence / Source Context | Reflection Target       | reflection_status |
| ------------------------- | ------------------------------------------------------------- | ----------------- | ------------------------- | ----------------------- | ----------------- |
| {project_code}-CS-MEM-001 | {fact / preference / constraint / article_note / test_result} | {抽出内容}            | {根拠となる会話文脈}               | `{target_path_or_none}` | pending           |

## Docs to Update

<!-- 人間レビュー後に、正本またはReview文書へ反映すべき候補を整理する。 -->

| Update ID                 | Target Document          | Target Section   | Proposed Update | Source Candidate IDs | Update Status  |
| ------------------------- | ------------------------ | ---------------- | --------------- | -------------------- | -------------- |
| {project_code}-CS-UPD-001 | `{target_document_path}` | {target_section} | {追記または修正案の要約}   | `{candidate_ids}`    | pending_review |

## Review Status

| Field                   | Value                 |
| ----------------------- | --------------------- |
| review_status           | draft                 |
| reviewed_by             | {reviewer_or_pending} |
| reviewed_at             | {YYYY-MM-DD_or_null}  |
| reflection_completed_by | {reviewer_or_pending} |
| reflection_completed_at | {YYYY-MM-DD_or_null}  |
| review_note             | {レビュー結果または未レビューの記載}   |

### Review Status Definition

| review_status | Meaning             | Normal Reference   | Decision / Constraint Evidence Use |
| ------------- | ------------------- | ------------------ | ---------------------------------- |
| draft         | 内容未確認の整理案           | 不可                 | 不可                                 |
| reviewed      | 会話要約としての正確性を人間が確認済み | 経緯確認・更新候補抽出の補助に限り可 | 不可                                 |
| reflected     | 正本反映要否の確認と必要反映が完了済み | 文脈復元の補助として可        | Summary自体ではなく反映先正本を根拠とする           |

## Reflection Checklist

| Check ID | Review Check                               | Result                    | Note   |
| -------- | ------------------------------------------ | ------------------------- | ------ |
| CS-C-001 | 会話内容の要約が原意を損なっていないか                        | {pending / pass / revise} | {note} |
| CS-C-002 | Decision候補と未決定案が区別されているか                   | {pending / pass / revise} | {note} |
| CS-C-003 | Task候補がIdeaから無断で格上げされていないか                 | {pending / pass / revise} | {note} |
| CS-C-004 | Decision / Constraintの反映先正本またはADRが特定されているか | {pending / pass / revise} | {note} |
| CS-C-005 | Task / Issueの反映先文書が特定されているか                | {pending / pass / revise} | {note} |
| CS-C-006 | Active正本との競合がある場合、Conflict Issue化要否を確認したか  | {pending / pass / revise} | {note} |

## References

* `docs/projects/{project_code}/memory/project-summary.md`
* `docs/projects/{project_code}/memory/current-status.md`
* `docs/projects/{project_code}/memory/active-decisions.md`
* `docs/projects/{project_code}/memory/next-actions.md`
* `{memory_taxonomy_path}`
* `{context_source_priority_path}`

## Change History

| Version | Date       | Status | Review Status | Change Summary                   | Approved By |
| ------- | ---------- | ------ | ------------- | -------------------------------- | ----------- |
| 0.1.0   | YYYY-MM-DD | draft  | draft         | テンプレートからConversation Summaryを作成。 | -           |
