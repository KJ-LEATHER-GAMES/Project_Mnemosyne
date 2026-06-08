---
title: "Memory Template: Project Summary"
document_id: "docs/templates/memory/project-summary.template.md"
document_role: "template"
template_for: "project_summary"
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

# Project Summary

<!--
目的:
- プロジェクトの概要、根本目的、対象範囲および安定した事実を保持する。
- 頻繁に変動する進捗、直近Task、Issue詳細、現在有効なConstraint本文は保持しない。

コピー利用時の処理:
- `title`、`document_id`、`document_role`、`project_code` 等を対象Project用に置換する。
- コピー直後の文書statusは `draft` とし、人間レビュー後に `active` 化する。
- 本テンプレート文書自身の `status: active` は、テンプレートが正式採用済みであることを示す。

管理値:
- 文書status: draft / active / superseded / deprecated / archived
- project_status: planning / active / paused / completed / archived
-->

## Project Metadata

| Field | Value |
|---|---|
| project_code | `{project_code}` |
| project_name | {project_name} |
| project_status | {planning / active / paused / completed / archived} |
| project_type | {product / platform / content / operation / research / other} |
| owner | {owner_or_team} |
| started_at | YYYY-MM-DD |
| repository_or_workspace | {path_or_url} |
| memory_root | `docs/projects/{project_code}/memory/` |

## Purpose

<!-- 一時的な作業目標ではなく、このプロジェクトが存在する根本目的を記載する。 -->

{このプロジェクトが存在する理由と、継続的に提供する価値。}

## Background

<!-- 着手に至った背景を記載する。確認済み事実と仮説・期待を混同しない。 -->

{背景および解決対象となる課題。}

## Target Users / Stakeholders

| Stakeholder | Role / Need | Relationship to Project |
|---|---|---|
| {stakeholder} | {必要としている価値または責務} | {primary_user / operator / reviewer / affected_party} |

## Core Concepts

| Concept | Definition in This Project | Note |
|---|---|---|
| {concept} | {本プロジェクトにおける定義} | {境界または関連用語} |

## Scope

- {対象に含める責務、機能、成果物。}

## Out of Scope

- {明示的に対象外とする責務、機能、成果物。}

## Stable Facts

<!--
後続セッションで再利用する価値のある、変わりにくい確認済み事実を記載する。
推測、未承認案、進行中Taskは記載しない。
-->

| Fact ID | Fact | Source Path | As Of | Status | Note |
|---|---|---|---|---|---|
| {project_code}-FACT-001 | {確認済み事実} | `{source_path}` | YYYY-MM-DD | active | {補足またはnone} |

## Source of Truth

<!-- 情報カテゴリごとの正本文書パスを示す。運用ルール本文は共通Policy文書へ委ねる。 -->

| Information Category | Authoritative Source | Role |
|---|---|---|
| プロジェクト目的・安定した範囲・Stable Fact | `docs/projects/{project_code}/memory/project-summary.md` | Project概要の正本 |
| 現在地・Issue・Conflict Issue参照 | `docs/projects/{project_code}/memory/current-status.md` | 状態の正本 |
| 現在有効なDecision / Constraint | `docs/projects/{project_code}/memory/active-decisions.md` および関連ADR | 判断・制約の正本 |
| 直近Task | `docs/projects/{project_code}/memory/next-actions.md` | Taskの正本 |
| AI参照入口 | `docs/projects/{project_code}/memory/ai-entrypoint.md` | 参照ルートの正本 |

## Related Projects

| Project Code | Relationship | Shared Context / Boundary | Reference Path |
|---|---|---|---|
| {related_project_code} | {dependency / validation_target / sibling / derived_from} | {共有する文脈または分離する境界} | `{path_or_none}` |

## References

- `{related_requirement_or_phase_document}`
- `{related_policy_or_adr}`

## Change History

| Version | Date | Status | Change Summary | Approved By |
|---|---|---|---|---|
| 1.0.0 | 2026-06-05 | active | M1-3 Active化レビューを反映し、固定章構成、共通frontmatter、責務境界を確定。 | Human approval by user instruction |
