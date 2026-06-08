---
title: "Memory Template: Conversation Summary"
document_id: "docs/templates/memory/conversation-summary.template.md"
document_role: "template"
template_for: "conversation_summary"
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

# Conversation Summary

<!--
目的:
- 会話ログをそのまま正本化せず、再利用可能なMemory候補として分類・整理する。
- Decision、Task、Issue、Idea等の候補について、正本反映要否をレビュー可能にする。

コピー利用時の処理:
- Conversation Summaryは初期5文書ではなく、記憶化対象となる会話単位で生成する。
- 作成したSummary文書のfrontmatterでは `document_role: "conversation_summary"`、対象の `document_id`、`status: "draft"`、`review_status: "draft"`、`source_reference` を設定する。

管理値:
- 文書status: draft / active / superseded / deprecated / archived
- review_status: draft / reviewed / reflected / archived
- reflection_status: pending / reflected / not_required / rejected

参照境界:
- `review_status: draft` は通常参照不可。
- `review_status: reviewed` は会話経緯確認と更新候補抽出の補助参照に限る。
- `review_status: reflected` は文脈復元に利用できるが、Decision / Constraintの根拠は反映先Active正本またはADRとする。
- `review_status: archived` は履歴確認時のみ参照し、現在判断には利用しない。
- 詳細な共通ルールは `docs/memory/memory-taxonomy.md` と `docs/memory/context-source-priority.md` を参照する。
-->

## Metadata

| Field | Value |
|---|---|
| summary_id | `{project_code}-CS-YYYYMMDD-001` |
| date | YYYY-MM-DD |
| related_project | `{project_code}` |
| topic | {会話テーマ} |
| source_reference | `{chat_or_log_reference}` |
| source_type | conversation |
| prepared_by | {human_or_ai} |
| document_status | draft |
| review_status | {draft / reviewed / reflected / archived} |
| reviewer | {reviewer_or_pending} |
| reflected_at | {YYYY-MM-DD_or_null} |

## Discussion Summary

{会話の目的、主な論点、確定したこと、未解決事項を簡潔に要約する。}

## Confirmed Decisions

<!-- 会話内で明示的に合意された内容。正本反映完了まではActive Decisionの根拠ではない。 -->

| Candidate ID | Decision Confirmed in Conversation | Confirmation Evidence / Context | Reflection Target | reflection_status | Related ADR / Source Path |
|---|---|---|---|---|---|
| {project_code}-CS-D-001 | {会話内で確定した判断} | {確定と判断できる文脈} | `docs/projects/{project_code}/memory/active-decisions.md` | pending | `{adr_path_or_none}` |

## Candidate Decisions

| Candidate ID | Candidate Decision | Reason to Consider | Required Decision / Reviewer | Reflection Target | reflection_status |
|---|---|---|---|---|---|
| {project_code}-CS-CD-001 | {判断候補} | {検討価値または背景} | {必要な判断} | `{target_path_or_none}` | pending |

## New Tasks

<!-- 本表の内容は、`next-actions.md` へ反映されるまでTask正本ではない。 -->

| Candidate Task ID | Task Candidate | Purpose | Proposed Priority | Expected Output | Completion Criteria | Reflection Target | reflection_status |
|---|---|---|---|---|---|---|---|
| {project_code}-CS-TASK-001 | {新規作業候補} | {目的} | {P0 / P1 / P2 / Later} | `{output_path_or_description}` | {完了条件} | `docs/projects/{project_code}/memory/next-actions.md` | pending |

## Issues / Open Questions

| Candidate Issue ID | Issue / Question | Impact | Required Action or Decision | Reflection Target | reflection_status |
|---|---|---|---|---|---|
| {project_code}-CS-ISS-001 | {課題または未解決論点} | {影響} | {必要な対応} | `docs/projects/{project_code}/memory/current-status.md` | pending |

## Ideas for Later

| Candidate Idea ID | Idea | Potential Value | Why Not Now | Revisit Trigger | reflection_status |
|---|---|---|---|---|---|
| {project_code}-CS-IDEA-001 | {将来候補} | {期待価値} | {今扱わない理由} | {再検討条件} | not_required |

## Other Extracted Memory Candidates

| Candidate ID | memory_type | Extracted Content | Evidence / Source Context | Reflection Target | reflection_status |
|---|---|---|---|---|---|
| {project_code}-CS-MEM-001 | {fact / preference / constraint / article_note / test_result} | {抽出内容} | {根拠となる会話文脈} | `{target_path_or_none}` | pending |

## Docs to Update

| Update ID | Target Document | Target Section | Proposed Update | Source Candidate IDs | reflection_status |
|---|---|---|---|---|---|
| {project_code}-CS-UPD-001 | `{target_document_path}` | {target_section} | {追記または修正案の要約} | `{candidate_ids}` | pending |

## Review Status

| Field | Value |
|---|---|
| review_status | {draft / reviewed / reflected / archived} |
| reviewed_by | {reviewer_or_pending} |
| reviewed_at | {YYYY-MM-DD_or_null} |
| reflection_completed_by | {reviewer_or_pending} |
| reflection_completed_at | {YYYY-MM-DD_or_null} |
| review_note | {レビュー結果または未レビューの記載} |

### Candidate Reflection Status

| reflection_status | Meaning |
|---|---|
| `pending` | 正本反映要否または反映作業が未完了 |
| `reflected` | 指定した正本へ必要内容を反映済み |
| `not_required` | レビューの結果、正本反映不要 |
| `rejected` | 候補内容を採用しない |

## Reflection Checklist

| Check ID | Review Check | Result | Note |
|---|---|---|---|
| CS-C-001 | 会話内容の要約が原意を損なっていないか | {pending / pass / revise} | {note} |
| CS-C-002 | Decision候補と未決定案が区別されているか | {pending / pass / revise} | {note} |
| CS-C-003 | Task候補がIdeaから無断で格上げされていないか | {pending / pass / revise} | {note} |
| CS-C-004 | Decision / Constraintの反映先正本またはADRが特定されているか | {pending / pass / revise} | {note} |
| CS-C-005 | Task / Issueの反映先文書が特定されているか | {pending / pass / revise} | {note} |
| CS-C-006 | Active正本との競合がある場合、Conflict Issue化要否を確認したか | {pending / pass / revise} | {note} |

## References

- `docs/projects/{project_code}/memory/project-summary.md`
- `docs/projects/{project_code}/memory/current-status.md`
- `docs/projects/{project_code}/memory/active-decisions.md`
- `docs/projects/{project_code}/memory/next-actions.md`
- `docs/memory/memory-taxonomy.md`
- `docs/memory/context-source-priority.md`

## Change History

| Version | Date | Status | Change Summary | Approved By |
|---|---|---|---|---|
| 1.0.0 | 2026-06-05 | active | M1-3 Active化レビューを反映し、`review_status: archived` を復活、`reflection_status` を簡略化して確定。 | Human approval by user instruction |
