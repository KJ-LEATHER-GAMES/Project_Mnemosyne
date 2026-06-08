---
title: "ATS Current Status"
document_id: "docs/projects/ats/memory/current-status.md"
document_role: "project_memory"
template_applied: "docs/templates/memory/current-status.template.md"
project_code: "ats"
project_name: "Adventure Token System"
status: "active"
version: "1.0.0"
created_at: "2026-06-05"
updated_at: "2026-06-05"
approved_at: "2026-06-05"
phase: "Phase 1: Memory Foundation"
milestone: "M1-5: ATS適用検証"
related_documents:
  - "docs/phases/phase-1-memory-foundation.md"
  - "docs/projects/ats/memory/project-summary.md"
  - "docs/projects/ats/memory/active-decisions.md"
  - "docs/projects/ats/memory/next-actions.md"
---

# Current Status

## Status Metadata

| Field | Value |
|---|---|
| project_code | `ats` |
| project_status | active |
| current_phase | MVP実装・運用改善・設計docs整理 |
| status_as_of | 2026-06-05 |
| status_owner | こうちゃん |
| last_reviewed_at | 2026-06-05 |
| next_review_at | 未設定 |

## Current Objective

ATSの現在の目的は、LINE Botによる家庭内ポイント制度のMVPを安定運用できる状態にしつつ、実装・DB・UseCase・ポイント経済・ごほうび交換の設計判断をMarkdown docsとして再利用可能な形へ整理することである。

M1-5では、ATSの複雑な文脈をProject Mnemosyneのmemoryテンプレートへ適用し、5つのmemory文書と1つの検証レビュー文書をActive化した。

## Current Position

| Item | Current State | Evidence / Source Path | Updated At |
|---|---|---|---|
| Current milestone | M1-5 ATS適用検証のActive化完了 | `docs/review/phase-1-ats-template-validation.md` | 2026-06-05 |
| Completion outlook | on_track | `docs/projects/ats/memory/current-status.md` | 2026-06-05 |
| Immediate focus | `ATS-TASK-004`: Ver1.1登録支援案の整理 | `docs/projects/ats/memory/next-actions.md` | 2026-06-05 |
| Secondary focus | `ATS-TASK-005`: action_select周辺のUseCase設計レビュー | `docs/projects/ats/memory/next-actions.md` | 2026-06-05 |
| Validation focus | `ATS-TASK-007`: Phase 2向けATS Context入力要件の整理 | `docs/projects/ats/memory/next-actions.md` | 2026-06-05 |

## Completed Recently

| Completion ID | Completed Item | Result / Confirmed Fact | Source Path | Completed At |
|---|---|---|---|---|
| ATS-COMP-001 | 紙運用によるポイント制度の観察 | 実運用を通じて、報告頻度・ポイント設定・親の確認負荷・ごほうび妥当性が設計論点として抽出された | `docs/projects/ats/memory/project-summary.md` | 2026-06-05 |
| ATS-COMP-002 | LINE Botによる行動登録の正常系確認 | 有効なactionCodeでポイント付与・DB更新・返信が成立することを確認済み | `docs/projects/ats/memory/current-status.md` | 2026-06-05 |
| ATS-COMP-003 | cooldown判定の確認 | cooldown中の登録では二重登録されず、想定どおり制御されることを確認済み | `docs/projects/ats/memory/current-status.md` | 2026-06-05 |
| ATS-COMP-004 | 所持ポイントと累計ポイントの分離方針を整理 | 消費型経済と永続蓄積を分ける設計方針を採用 | `docs/projects/ats/memory/active-decisions.md` | 2026-06-05 |
| ATS-COMP-005 | ごほうび必要ポイントの現実化 | 8000pt全額交換案から、3000pt補助券案へ見直し | `docs/projects/ats/memory/active-decisions.md` | 2026-06-05 |
| ATS-COMP-006 | M1-5 ATS適用検証の6文書Active化 | P0/P1修正を反映し、ATS memory 5文書と検証レビュー文書をActive化した | `docs/review/phase-1-ats-template-validation.md` | 2026-06-05 |

## In Progress

| Task ID | Current Focus | Priority | task_status | Source Task Document | Updated At |
|---|---|---|---|---|---|
| ATS-TASK-004 | Ver1.1登録支援案の整理 | P0 | todo | `docs/projects/ats/memory/next-actions.md` | 2026-06-05 |
| ATS-TASK-005 | action_select周辺のUseCase設計レビュー | P1 | todo | `docs/projects/ats/memory/next-actions.md` | 2026-06-05 |
| ATS-TASK-006 | lifetime_points / point_policy反映後のdocs整合確認 | P1 | todo | `docs/projects/ats/memory/next-actions.md` | 2026-06-05 |

Full task definitions are managed only in `docs/projects/ats/memory/next-actions.md`.

## Blockers / Issues

| Issue ID | Issue Type | Summary | Severity | Impact / blocked_scope | issue_status | Source Path | Related Task |
|---|---|---|---|---|---|---|---|
| ATS-ISS-001 | issue | 子どもがその都度行動を報告する運用は忘れやすく、心理的ハードルもある | high | 継続率・報告漏れ・ポイント実態 | open | `docs/projects/ats/memory/current-status.md` | `ATS-TASK-004` |
| ATS-ISS-002 | issue | 親が代理登録・確認する導線の負荷が残っている | medium | 親側の継続運用負荷 | open | `docs/projects/ats/memory/current-status.md` | `ATS-TASK-004` |
| ATS-ISS-003 | risk | Render無料プランではスリープによりWebhook応答が不安定になる可能性がある | medium | LINE Bot応答・ユーザー体験 | monitoring | `docs/projects/ats/memory/current-status.md` | `ATS-TASK-005` |
| ATS-ISS-004 | issue | 仕様・DB・UseCase・記事メモが複数会話に分散していた | high | AI相談再開時の前提復元 | resolved | `docs/projects/ats/memory/current-status.md` | `ATS-TASK-001` |
| ATS-ISS-005 | issue | Ver1.1改善案の優先度は整理済みだが、正式な仕様反映は未完了 | medium | 次期改善スコープ | open | `docs/projects/ats/memory/current-status.md` | `ATS-TASK-004` |

## Active Source Conflicts

| Conflict Issue ID | Severity | blocked_scope | Conflicting Sources | conflict_status | Formal Issue Path | Required Handling |
|---|---|---|---|---|---|---|
| なし | - | - | - | - | - | 現時点で正式なActive正本間競合は未記録。競合が発生した場合は `docs/review/context-source-conflicts/` にIssue化する。 |

## Pending Decisions

| Pending Decision ID | Question / Decision Needed | Why Needed Now | Candidate Sources | Decision Owner | Target Review | Status |
|---|---|---|---|---|---|---|
| ATS-PD-001 | Ver1.1改善案をどこまでMVP後続スコープに含めるか | 登録忘れ対策が継続運用に強く影響するため | `docs/projects/ats/memory/next-actions.md` | こうちゃん | Ver1.1計画レビュー時 | open |
| ATS-PD-002 | 今日の未報告一覧と夜まとめ報告のUI仕様をどうするか | 子ども・親双方の運用負荷を下げるため | `docs/projects/ats/memory/next-actions.md` | こうちゃん | Ver1.1計画レビュー時 | open |
| ATS-PD-003 | reward交換のspend型 / milestone型をどの範囲まで実装するか | ごほうび交換と累計達成の設計境界を明確にするため | `docs/projects/ats/memory/active-decisions.md` | こうちゃん | 未設定 | open |
| ATS-PD-004 | 実装レビューAgentに渡す追加docsをどう定義するか | Phase 2のContext Pack設計へ接続するため | `docs/projects/ats/memory/ai-entrypoint.md` | こうちゃん | Phase 2入力要件レビュー時 | open |
| ATS-PD-005 | Ver1.1改善案として「今日の未報告一覧」と「夜まとめ報告」をP0改善候補にするか | 報告忘れ対策として重要だが、正式仕様化は未完了のため | `docs/projects/ats/memory/next-actions.md` | こうちゃん | Ver1.1計画レビュー時 | open |

## Next Review Point

| Review Item | Review Trigger / Date | Expected Decision or Confirmation | Related Source |
|---|---|---|---|
| Ver1.1登録支援案レビュー | `ATS-TASK-004` 着手時 | P0改善候補を正式仕様化するか確認する | `docs/projects/ats/memory/next-actions.md` |
| action_select設計レビュー | `ATS-TASK-005` 着手時 | UseCase責務、冪等性、cooldown、daily_limit、DB更新整合を確認する | `docs/projects/ats/memory/active-decisions.md` |
| lifetime_points整合確認 | `ATS-TASK-006` 着手時 | 所持ポイント・累計ポイント・reward policyのdocs整合を確認する | `docs/projects/ats/memory/active-decisions.md` |
| Phase 2入力観点確認 | M1-6またはPhase 2準備時 | Project Registry / Agent Contextに必要な項目を抽出する | `docs/review/phase-1-ats-template-validation.md` |

## References

- `docs/projects/ats/memory/project-summary.md`
- `docs/projects/ats/memory/active-decisions.md`
- `docs/projects/ats/memory/next-actions.md`
- `docs/memory/context-source-priority.md`
- `docs/review/phase-1-ats-template-validation.md`

## Change History

| Version | Date | Status | Change Summary | Approved By |
|---|---|---|---|---|
| 0.1.0 | 2026-06-05 | draft | M1-5 ATS適用検証用にCurrent Status初期ドラフトを作成。 | 未承認 |
| 1.0.0 | 2026-06-05 | active | P0修正としてTask詳細を削除し、Task ID参照中心へ変更。M1-5完了状態を反映してActive化。 | こうちゃん |
