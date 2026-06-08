---
title: "Phase 1 ATS Template Validation"
document_id: "docs/review/phase-1-ats-template-validation.md"
document_role: "review"
project_code: "mnemosyne"
target_project_code: "ats"
status: "active"
version: "1.0.0"
created_at: "2026-06-05"
updated_at: "2026-06-05"
approved_at: "2026-06-05"
phase: "Phase 1: Memory Foundation"
milestone: "M1-5: ATS適用検証"
related_documents:
  - "docs/phases/phase-1-memory-foundation.md"
  - "docs/templates/memory/project-summary.template.md"
  - "docs/templates/memory/current-status.template.md"
  - "docs/templates/memory/active-decisions.template.md"
  - "docs/templates/memory/next-actions.template.md"
  - "docs/templates/memory/ai-entrypoint.template.md"
  - "docs/projects/ats/memory/project-summary.md"
  - "docs/projects/ats/memory/current-status.md"
  - "docs/projects/ats/memory/active-decisions.md"
  - "docs/projects/ats/memory/next-actions.md"
  - "docs/projects/ats/memory/ai-entrypoint.md"
---

# Phase 1 ATS Template Validation

## Review Purpose

This document validates whether the Phase 1 memory templates can represent a real, complex project: Adventure Token System.

The goal is not to complete ATS itself.  
The goal is to check whether the five memory documents are enough to restart ATS-related AI support without re-explaining the full history.

## Validation Target

| Item | Value |
|---|---|
| Validation Milestone | M1-5: ATS適用検証 |
| Target Project | Adventure Token System |
| Target Project Code | `ats` |
| Review Document | `docs/review/phase-1-ats-template-validation.md` |
| Review Status | active |
| Reviewer | こうちゃん |
| Draft Support | AI |
| Review Date | 2026-06-05 |

## Validated Documents

| Document | Expected Role | Active Status | Evaluation |
|---|---|---|---|
| `docs/projects/ats/memory/project-summary.md` | ATSの安定した概要、目的、範囲、正本構造 | active | pass |
| `docs/projects/ats/memory/current-status.md` | 現在地、Issue、Pending Decision、状態サマリー | active | pass |
| `docs/projects/ats/memory/active-decisions.md` | 現在有効な判断と制約 | active | pass |
| `docs/projects/ats/memory/next-actions.md` | Task正本 | active | pass |
| `docs/projects/ats/memory/ai-entrypoint.md` | AI支援入口と参照ルール | active | pass |

## Validation Scenarios

### T-01: ATSの現在のMVPスコープを整理できるか

| Field | Result |
|---|---|
| Question | ATSの現在のMVPスコープを整理して |
| Expected Sources | `project-summary.md` / `current-status.md` |
| Evaluation | pass |
| Reason | ATSの目的、LINE Bot、ポイント付与、履歴登録、残高更新、返信メッセージ生成、Notion副本が整理されている |
| Gap | MVPスコープをより明確に固定するなら、別途 `mvp-scope.md` があるとよい |
| Required Template Change | none |
| Suggested Project Doc Update | `project-summary.md` のScopeにMVP範囲を明示し続ける |

### T-02: action_selectの重要な設計判断を説明できるか

| Field | Result |
|---|---|
| Question | action_selectの重要な設計判断は何か |
| Expected Sources | `active-decisions.md` |
| Evaluation | pass |
| Reason | action_selectをUseCase境界として扱い、冪等性、cooldown、daily_limit、DB更新整合を維持する判断が記録されている |
| Gap | UseCase入出力契約の詳細はmemory文書だけでは不足する |
| Required Template Change | none |
| Suggested Project Doc Update | `docs/usecase-contracts.md` を追加または参照対象化する |

### T-03: 次に進めるべき作業を説明できるか

| Field | Result |
|---|---|
| Question | 次に進めるべき作業は何か |
| Expected Sources | `next-actions.md` |
| Evaluation | pass |
| Reason | P0 / P1 / P2 / Laterに分類され、Task ID、目的、入力、出力、完了条件、statusが整理されている |
| Gap | Task詳細を `next-actions.md` に集約し、`current-status.md` をTask ID参照中心へ修正済み |
| Required Template Change | current-status templateに「Task詳細はnext-actionsへ置く」ルールを追加する候補あり |
| Suggested Project Doc Update | なし。M1-5 Active版では修正済み |

### T-04: 古い案と現在の判断が競合した場合の扱いを説明できるか

| Field | Result |
|---|---|
| Question | 古い案と現在の判断が競合した場合どう扱うか |
| Expected Sources | `active-decisions.md` / `current-status.md` / `ai-entrypoint.md` |
| Evaluation | pass |
| Reason | active-decisionsにsuperseded decisionsがあり、ai-entrypointに古い案をDecision扱いしないルールがある |
| Gap | Conflict Issueの正式記録先は定義済みだが、ATS側ではまだ実例がない |
| Required Template Change | none |
| Suggested Project Doc Update | 競合が出た時点で `docs/review/context-source-conflicts/` にIssueを作る |

### T-05: 実装レビューAgentに渡すべき追加docsを説明できるか

| Field | Result |
|---|---|
| Question | 実装レビューAgentに渡すべき追加docsは何か |
| Expected Sources | `ai-entrypoint.md` |
| Evaluation | pass |
| Reason | Confirmed SourcesとCandidate Sourcesを分離し、存在未確認docsをAIが実在文書と誤認しない構造へ修正済み |
| Gap | 実在ファイルの登録はPhase 2のProject Registryで扱う |
| Required Template Change | ai-entrypoint templateに「confirmed sources」と「candidate sources」の分離項目を追加する候補あり |
| Suggested Project Doc Update | Phase 2でProject RegistryへATSの必須参照文書を登録する |

## Cross-Document Consistency Review

| Check ID | Check Item | Result | Note |
|---|---|---|---|
| C-01 | project-summaryとcurrent-statusの役割分離 | pass | Summaryは安定情報、Statusは現在地として整理されている |
| C-02 | active-decisionsにIssueやIdeaが混入していないか | pass | Ver1.1改善案はActive Decisionから外し、Task / Pending Decision / Constraintへ分離済み |
| C-03 | next-actionsがTask正本になっているか | pass | Task詳細はnext-actionsへ集約された |
| C-04 | current-statusとnext-actionsのTask二重管理がないか | pass | current-statusはTask ID参照中心へ修正済み |
| C-05 | ai-entrypointが参照順序と禁止事項を示しているか | pass | Read order、constraints、misinterpretation risksが整理されている |
| C-06 | Phase 2へ渡す入力が抽出できるか | pass | Agent別追加docsとProject Registry項目の候補を整理済み |

## Required Revisions Before Active

| Revision ID | Priority | Target Document | Required Revision | Result |
|---|---|---|---|---|
| ATS-REV-001 | P0 | `current-status.md` | In ProgressをTask ID参照中心へ変更し、Task詳細を削除する | done |
| ATS-REV-002 | P0 | `active-decisions.md` | `ATS-D-016` をActive Decisionから外し、Ver1.1改善候補はTask / Pending Decision / Ideaとして扱う | done |
| ATS-REV-003 | P0 | `next-actions.md` | 6文書作成済みの状態に合わせてTask statusとTask表現を更新する | done |
| ATS-REV-004 | P0 | 全6文書 | frontmatterの `status` と `approved_at` をActive化時に更新する | done |
| ATS-REV-005 | P1 | `ai-entrypoint.md` | Available Document SourcesをConfirmed Sources / Candidate Sourcesへ分離する | done |
| ATS-REV-006 | P1 | `project-summary.md` | Stable Factsの根拠表現を補強する | done |
| ATS-REV-007 | P1 | `current-status.md` | Completed Recentlyの根拠を正本参照として整理する | done |
| ATS-REV-008 | P1 | `active-decisions.md` | Decisionと改善候補の混在を解消する | done |
| ATS-REV-009 | P1 | `phase-1-ats-template-validation.md` | Template-Level FindingsにTask正本一元化ルールを正式提案として明記する | done |

## Template-Level Findings

| Finding ID | Template | Finding | Recommendation |
|---|---|---|---|
| TPL-FIND-001 | `current-status.template.md` | In ProgressにTask詳細を書きすぎると `next-actions.md` と二重管理になる | In ProgressはTask ID、Current Focus、Status、Source Task Documentに限定する |
| TPL-FIND-002 | `next-actions.template.md` | Task正本としては、Task IDとsource pathが必要 | Active TasksにTask ID、Source Path、Related Decision / Issueを追加する |
| TPL-FIND-003 | `ai-entrypoint.template.md` | Available Document Sourcesで実在文書と候補文書が混ざる可能性がある | Confirmed Sources / Candidate Sourcesを分ける |
| TPL-FIND-004 | `active-decisions.template.md` | 改善候補や設計案がDecisionへ混入しやすい | Pending DecisionまたはIdeaへの退避ルールを明記する |
| TPL-FIND-005 | `project-summary.template.md` | 複雑なプロジェクトではStable Factsが有効 | Stable Factsの表を標準項目にする候補あり |

## Phase 2 Input Requirements

M1-5の検証結果から、Phase 2: Context Forgeでは以下の入力要件が必要になる。

### Project Registry Candidate

| Field | Value |
|---|---|
| project_code | `ats` |
| project_name | Adventure Token System |
| memory_root | `docs/projects/ats/memory/` |
| required_memory_docs | project-summary, current-status, active-decisions, next-actions, ai-entrypoint |
| default_context_order | project-summary → current-status → active-decisions → next-actions → ai-entrypoint |
| task_source_of_truth | `docs/projects/ats/memory/next-actions.md` |
| decision_source_of_truth | `docs/projects/ats/memory/active-decisions.md` |
| status_source_of_truth | `docs/projects/ats/memory/current-status.md` |
| write_policy | AI draft only / human approval required |

### Agent Context Candidate

| Agent | Required Context | Optional Context | Notes |
|---|---|---|---|
| implementation_reviewer | project-summary / current-status / active-decisions / next-actions | usecase-contracts / domain-rules / database-design / test-results | 実装と設計判断の整合確認 |
| docs_agent | project-summary / current-status / active-decisions / next-actions | conversation-summary / related design docs | docs更新案作成 |
| task_agent | current-status / next-actions / active-decisions | conversation-summary | Task抽出・優先度整理 |
| adr_agent | project-summary / active-decisions | related design notes | ADR草案作成 |
| article_agent | project-summary / active-decisions | article_note / development logs | note記事化 |

## Go / Conditional Go / No Go Judgment

| Judgment | Result |
|---|---|
| Phase 1 M1-5 Completion Judgment | Go |
| Reason | ATS memory 5文書と検証レビュー文書は作成済みであり、P0/P1修正も反映済み。Task正本は `next-actions.md` に集約され、`current-status.md` はTask ID参照中心へ整理された。Ver1.1改善案もActive Decisionから外され、Task / Pending Decisionとして扱える状態になった。 |
| Required Before Active | none |
| Can Proceed to M1-6 | Yes |

## Final Review Notes

ATSは、家庭内ポイント制度、LINE Bot、PostgreSQL、Notion、副本、UseCase、冪等性、ポイント経済、ごほうび設計、記事化素材が絡むため、Phase 1テンプレート検証対象として十分に複雑である。

今回の検証では、5文書構成そのものは有効と判断できる。

特に重要な学びは、複雑なプロジェクトでは `current-status.md` にTask詳細を書きすぎると、`next-actions.md` との二重管理が発生する点である。  
そのため、Taskの正本は `next-actions.md` に固定し、`current-status.md` は状態サマリーに徹する運用ルールをテンプレート側にも反映する価値がある。

## Change History

| Version | Date | Status | Change Summary | Approved By |
|---|---|---|---|---|
| 0.1.0 | 2026-06-05 | draft | M1-5 ATS適用検証レビュー初期ドラフトを作成。Task正本をnext-actionsへ集約する改善点をP0として記録。 | 未承認 |
| 1.0.0 | 2026-06-05 | active | P0/P1修正を反映し、判定をGoへ更新してActive化。 | こうちゃん |
