---

document_role: "project_summary"
project_code: "{project_code}"
project_name: "{project_name}"
status: "draft"
version: "0.1.0"
updated_at: "YYYY-MM-DD"
last_reviewed_at: null
applicability_scope: "project"
source_path: "docs/projects/{project_code}/memory/project-summary.md"
---------------------------------------------------------------------

# Project Summary

<!--
目的:
- プロジェクトの目的、背景、範囲など、頻繁には変わらない文脈を保持する。
- 新しいプロジェクトの初期記憶を作成する際に、本テンプレートをコピーして使用する。
- レビュー前に、{ } で示したプレースホルダーを置換する。

管理値:
- status: draft / active / superseded / deprecated / archived
- project_status: planning / active / paused / completed / archived

記載ルール:
- 進捗、ブロッカー、直近タスクなどの変動情報は記載しない。
- 変動情報は current-status.md または next-actions.md に記載する。
-->

## Project Metadata

| Field                   | Value                                                         |
| ----------------------- | ------------------------------------------------------------- |
| project_code            | `{project_code}`                                              |
| project_name            | {project_name}                                                |
| project_status          | planning                                                      |
| project_type            | {product / platform / content / operation / research / other} |
| owner                   | {owner_or_team}                                               |
| started_at              | YYYY-MM-DD                                                    |
| repository_or_workspace | {path_or_url}                                                 |
| memory_root             | `docs/projects/{project_code}/memory/`                        |

## Purpose

<!-- 一時的な目標ではなく、このプロジェクトが存在する根本目的を記載する。 -->

{このプロジェクトが存在する理由と、継続的に提供する価値。}

## Background

<!-- 着手に至った背景を記載する。確認済み事実と動機・仮説を混同しない。 -->

{背景および解決対象となる課題。}

## Target Users / Stakeholders

| Stakeholder   | Role / Need      | Relationship to Project                               |
| ------------- | ---------------- | ----------------------------------------------------- |
| {stakeholder} | {必要としている価値または責務} | {primary_user / operator / reviewer / affected_party} |

## Core Concepts

| Concept   | Definition in This Project | Note        |
| --------- | -------------------------- | ----------- |
| {concept} | {本プロジェクトにおける定義}            | {境界または関連用語} |

## Scope

* {対象に含める責務、機能、成果物。}

## Out of Scope

* {明示的に対象外とする責務、機能、成果物。}

## Foundational Constraints

<!-- 長期間有効で、設計または運用を制限する制約のみを記載する。個別判断の詳細は active-decisions.md に記載する。 -->

| Constraint ID          | Constraint | Rationale | Source Path     | Related ADR          | Status |
| ---------------------- | ---------- | --------- | --------------- | -------------------- | ------ |
| {project_code}-CON-001 | {制約内容}     | {適用理由}    | `{source_path}` | `{adr_path_or_none}` | active |

## Stable Facts

<!--
後続のAIセッションで再利用する価値のある、安定した確認済み事実を記載する。
各Factには根拠となるsource_pathと確認基準日as_ofを付与する。
未検証の推測はFactとして記載しない。
-->

| Fact ID                 | Fact     | Source Path     | As Of      | Status | Note        |
| ----------------------- | -------- | --------------- | ---------- | ------ | ----------- |
| {project_code}-FACT-001 | {確認済み事実} | `{source_path}` | YYYY-MM-DD | active | {補足またはnone} |

## Source of Truth

<!-- 情報カテゴリごとに、現在参照すべき正本文書を定義する。 -->

| Information Category | Authoritative Source                                               | Role         | Reference Rule             |
| -------------------- | ------------------------------------------------------------------ | ------------ | -------------------------- |
| プロジェクト目的・安定した範囲      | `docs/projects/{project_code}/memory/project-summary.md`           | Project概要の正本 | 最新の `active` 文書を参照する。      |
| 現在地・ブロッカー            | `docs/projects/{project_code}/memory/current-status.md`            | 状態の正本        | 最新の `active` 文書を参照する。      |
| 現在有効な判断              | `docs/projects/{project_code}/memory/active-decisions.md` および関連ADR | 判断の正本        | `draft` または競合中の判断を有効扱いしない。 |
| 直近タスク                | `docs/projects/{project_code}/memory/next-actions.md`              | Taskの正本      | 進捗は `task_status` で判定する。   |
| 重要判断の理由              | `docs/adr/ADR-*.md` または `{project_adr_root}`                       | ADR正本        | Active運用文書との整合を確認する。       |

## Related Projects

| Project Code           | Relationship                                              | Shared Context / Boundary | Reference Path   |
| ---------------------- | --------------------------------------------------------- | ------------------------- | ---------------- |
| {related_project_code} | {dependency / validation_target / sibling / derived_from} | {共有する文脈または分離する境界}         | `{path_or_none}` |

## References

* `{related_requirement_or_phase_document}`
* `{related_policy_or_adr}`

## Change History

| Version | Date       | Status | Change Summary                | Approved By |
| ------- | ---------- | ------ | ----------------------------- | ----------- |
| 0.1.0   | YYYY-MM-DD | draft  | テンプレートから初期Project Summaryを作成。 | -           |
