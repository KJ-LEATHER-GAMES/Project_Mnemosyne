---
title: "Memory Template: Active Decisions"
document_id: "docs/templates/memory/active-decisions.template.md"
document_role: "template"
template_for: "active_decisions"
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

# Active Decisions

<!--
目的:
- 対象Projectで現在有効なDecisionおよびConstraintを保持する。
- 古い会話、未反映候補、置換済み判断を現行ルールとして誤参照することを防ぐ。

コピー利用時の処理:
- 対象Project用にfrontmatterと本文プレースホルダーを置換し、コピー直後は `status: draft` とする。

管理値:
- 文書status: draft / active / superseded / deprecated / archived

責務境界:
- 本書のActive Decisions / Active Constraintsには、人間レビューと正本反映が完了した `active` 情報のみを記載する。
- 競合Issue一覧は本書で重複管理しない。参照先は `current-status.md` と正式Conflict Issue文書である。
- 共通の状態・参照・競合処理ルールは `memory-taxonomy.md` と `context-source-priority.md` を参照する。
-->

## Decision Register Metadata

| Field | Value |
|---|---|
| project_code | `{project_code}` |
| as_of | YYYY-MM-DD |
| decision_owner | {owner_or_team} |
| decision_source_root | `{adr_root_or_docs_root}` |
| conflict_reference_document | `docs/projects/{project_code}/memory/current-status.md` |

## Active Decisions

| Decision ID | Decision | Reason / Intent | Applicability Scope | Related ADR | Source Path | Status | Effective At | Updated At | Supersedes |
|---|---|---|---|---|---|---|---|---|---|
| {project_code}-D-001 | {現在有効な判断} | {判断理由の要約} | {project / phase / function / task} | `{adr_path_or_none}` | `{source_path}` | active | YYYY-MM-DD | YYYY-MM-DD | `{old_decision_id_or_none}` |

## Active Constraints

<!-- AI支援時に必ず守るProject固有Constraintを記載する。共通Policyは複製せず参照する。 -->

| Constraint ID | Constraint | Applicability Scope | Source Decision / ADR | Source Path | Status | Updated At |
|---|---|---|---|---|---|---|
| {project_code}-CON-001 | {制約内容} | {scope} | `{decision_or_adr_id}` | `{source_path}` | active | YYYY-MM-DD |

## Superseded Decisions

<!-- 置換済み判断は履歴として保持し、現在有効な指示として利用しない。 -->

| Old Decision ID | Old Decision | Replaced By | Replacement Reason | Superseded At | Historical Source Path |
|---|---|---|---|---|---|
| {project_code}-D-000 | {旧判断} | `{project_code}-D-001` | {置換理由} | YYYY-MM-DD | `{source_path}` |

## Deprecated Decisions

<!-- 特定の置換先を持たず、現在は使用しない判断を履歴として保持する。 -->

| Decision ID | Deprecated Decision | Reason Not to Use | Deprecated At | Source Path |
|---|---|---|---|---|
| {project_code}-D-XXX | {非推奨となった判断} | {使用しない理由} | YYYY-MM-DD | `{source_path}` |

## Conflict Reference

<!--
Active正本間競合が存在する場合、本書へ競合内容を複製しない。
`docs/projects/{project_code}/memory/current-status.md` の Active Source Conflicts と、
`docs/review/context-source-conflicts/{issue_id}.md` を参照する。
競合中のscopeはActive Decisions / Active Constraintsへ登録しない。
-->

- conflict_reference: `docs/projects/{project_code}/memory/current-status.md#active-source-conflicts`
- formal_issue_root: `docs/review/context-source-conflicts/`

## References

- `docs/projects/{project_code}/memory/project-summary.md`
- `docs/projects/{project_code}/memory/current-status.md`
- `docs/projects/{project_code}/memory/next-actions.md`
- `docs/memory/memory-taxonomy.md`
- `docs/memory/context-source-priority.md`
- `{related_adr_or_policy_document}`

## Change History

| Version | Date | Status | Change Summary | Approved By |
|---|---|---|---|---|
| 1.0.0 | 2026-06-05 | active | M1-3 Active化レビューを反映し、Constraint正本を本書へ一本化し、競合一覧を参照へ縮退。 | Human approval by user instruction |
