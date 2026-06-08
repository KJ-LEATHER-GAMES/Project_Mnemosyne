---
title: "ATS Active Decisions"
document_id: "docs/projects/ats/memory/active-decisions.md"
document_role: "project_memory"
template_applied: "docs/templates/memory/active-decisions.template.md"
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
  - "docs/projects/ats/memory/current-status.md"
  - "docs/projects/ats/memory/next-actions.md"
---

# Active Decisions

## Decision Register Metadata

| Field | Value |
|---|---|
| project_code | `ats` |
| as_of | 2026-06-05 |
| decision_owner | こうちゃん |
| decision_source_root | `docs/projects/ats/` |
| conflict_reference_document | `docs/projects/ats/memory/current-status.md` |

## Active Decisions

| Decision ID | Decision | Reason / Intent | Applicability Scope | Related ADR | Source Path | Status | Effective At | Updated At | Supersedes |
|---|---|---|---|---|---|---|---|---|---|
| ATS-D-001 | ATSは家庭内ポイント制度をLINE Botとして実装する | 子どもが日常の行動を簡単に報告でき、親側も履歴確認と運用をしやすくするため | project | none | `docs/projects/ats/memory/project-summary.md` | active | 2026-06-05 | 2026-06-05 | none |
| ATS-D-002 | 実行時データの正本はPostgreSQLとし、Notionは可視化用の副本とする | データ更新・集計・冪等性制御はDBで厳密に扱い、Notionは閲覧性を補完する役割に限定するため | architecture / data | none | `docs/projects/ats/memory/project-summary.md` | active | 2026-06-05 | 2026-06-05 | none |
| ATS-D-003 | 設計判断・仕様整理の正本はMarkdown docsで管理する | 会話ログに判断を埋もれさせず、AI相談・実装レビュー・記事化に再利用できる形で保持するため | docs / memory | none | `docs/projects/ats/memory/project-summary.md` | active | 2026-06-05 | 2026-06-05 | none |
| ATS-D-004 | LINE Botの操作分岐はpostback.dataを契約として扱う | UI操作、UseCase分岐、DB更新、返信生成を安定して接続するため | line-bot / api-contract | none | `docs/projects/ats/memory/project-summary.md` | active | 2026-06-05 | 2026-06-05 | none |
| ATS-D-005 | action_selectはUseCase境界として扱い、ポイント付与・履歴登録・集計更新を一貫処理する | 行動登録に伴う副作用を分散させず、トランザクション境界を明確にするため | usecase / transaction | none | `docs/projects/ats/memory/current-status.md` | active | 2026-06-05 | 2026-06-05 | none |
| ATS-D-006 | processed_eventsによりLINE Webhookイベントの冪等性を担保する | Webhook再送や重複処理による二重ポイント付与を防ぐため | webhook / idempotency | none | `docs/projects/ats/memory/current-status.md` | active | 2026-06-05 | 2026-06-05 | none |
| ATS-D-007 | cooldownにより短時間の同一行動連続登録を制限する | 誤操作・連打・ポイント過剰付与を防ぐため | point-control / usecase | none | `docs/projects/ats/memory/current-status.md` | active | 2026-06-05 | 2026-06-05 | none |
| ATS-D-008 | daily_limitにより日次上限を設ける | 家庭内ポイント経済のインフレを防ぎ、行動と報酬のバランスを維持するため | point-economy | none | `docs/projects/ats/memory/project-summary.md` | active | 2026-06-05 | 2026-06-05 | none |
| ATS-D-009 | 所持ポイントと累計ポイントを分離する | ごほうび交換によって積み上げ実感が消えることを避け、消費型経済と成長記録を両立するため | point-model / database | none | `docs/projects/ats/memory/project-summary.md` | active | 2026-06-05 | 2026-06-05 | none |
| ATS-D-010 | DB上では所持ポイントを消費可能残高、lifetime_pointsを永続累計として扱う | spend型報酬とmilestone型報酬を分離しやすくするため | database | none | `docs/projects/ats/memory/project-summary.md` | active | 2026-06-05 | 2026-06-05 | none |
| ATS-D-011 | レベルアップによる換算レート上昇は採用しない | 説明コストが高く、家庭内ポイント経済のバランスが崩れやすいため | game-design / point-economy | none | `docs/projects/ats/memory/project-summary.md` | active | 2026-06-05 | 2026-06-05 | none |
| ATS-D-012 | レベルは倍率ではなく、解放・演出・権限・達成感の表現として扱う | ポイント経済を複雑化せず、成長感だけを演出するため | game-design | none | `docs/projects/ats/memory/project-summary.md` | active | 2026-06-05 | 2026-06-05 | none |
| ATS-D-013 | アイテムは一時効果として扱い、常時倍率化しない | ポイントインフレを避けつつ、イベント性や楽しさを加えるため | game-design / item-system | none | `docs/projects/ats/memory/project-summary.md` | active | 2026-06-05 | 2026-06-05 | none |
| ATS-D-014 | ごほうびは小・中・大の複数レンジを用意する | 3000pt級の大きな報酬だけでは途中の達成感が不足するため | reward-design | none | `docs/projects/ats/memory/project-summary.md` | active | 2026-06-05 | 2026-06-05 | none |
| ATS-D-015 | ゲームソフトは全額交換ではなく補助券方式を採用する | 必要ポイントが大きすぎると継続モチベーションが下がるため | reward-design | none | `docs/projects/ats/memory/current-status.md` | active | 2026-06-05 | 2026-06-05 | `ATS-SD-001` |

## Active Constraints

| Constraint ID | Constraint | Applicability Scope | Source Decision / ADR | Source Path | Status | Updated At |
|---|---|---|---|---|---|---|
| ATS-CON-001 | AI支援時は、PostgreSQLを実行時データの正本、Notionを副本として扱う | data / architecture | `ATS-D-002` | `docs/projects/ats/memory/active-decisions.md` | active | 2026-06-05 |
| ATS-CON-002 | Notionに存在する情報だけを根拠にDB正本を上書きしない | data / sync | `ATS-D-002` | `docs/projects/ats/memory/active-decisions.md` | active | 2026-06-05 |
| ATS-CON-003 | 古い会話ログの案は、active-decisionsへ反映されるまで現在有効な判断として扱わない | memory / ai-support | `ATS-D-003` | `docs/projects/ats/memory/active-decisions.md` | active | 2026-06-05 |
| ATS-CON-004 | action_selectの処理では、二重登録防止、cooldown、DB更新、返信生成の整合を崩さない | usecase / transaction | `ATS-D-005` | `docs/projects/ats/memory/active-decisions.md` | active | 2026-06-05 |
| ATS-CON-005 | ポイント設計では、短期的な楽しさよりも継続運用とインフレ防止を優先する | point-economy | `ATS-D-008` | `docs/projects/ats/memory/active-decisions.md` | active | 2026-06-05 |
| ATS-CON-006 | ごほうび交換で所持ポイントを消費しても、累計ポイントは減算しない | point-model / reward | `ATS-D-009` | `docs/projects/ats/memory/active-decisions.md` | active | 2026-06-05 |
| ATS-CON-007 | レベルアップはポイント倍率の恒久上昇として実装しない | game-design | `ATS-D-011` | `docs/projects/ats/memory/active-decisions.md` | active | 2026-06-05 |
| ATS-CON-008 | Ver1.1案は正式仕様化されるまで、実装済み機能またはActive Decisionとして扱わない | version-planning | none | `docs/projects/ats/memory/active-decisions.md` | active | 2026-06-05 |
| ATS-CON-009 | Task詳細の正本は `next-actions.md` とし、`current-status.md` はTask IDと状態サマリーに限定する | task-management / memory | none | `docs/projects/ats/memory/active-decisions.md` | active | 2026-06-05 |

## Superseded Decisions

| Old Decision ID | Old Decision | Replaced By | Replacement Reason | Superseded At | Historical Source Path |
|---|---|---|---|---|---|
| ATS-SD-001 | ゲームソフトを8000pt程度で全額交換する | `ATS-D-015` | 目標が遠すぎ、継続モチベーションに対して重すぎるため、3000pt補助券方式へ見直した | 2026-06-05 | `docs/projects/ats/memory/current-status.md` |
| ATS-SD-002 | レベルアップにより換算レートを上げる | `ATS-D-011` | ポイント経済がインフレしやすく、説明コストも高いため不採用 | 2026-06-05 | `docs/projects/ats/memory/project-summary.md` |
| ATS-SD-003 | Ver1.1改善案として「今日の未報告一覧」と「夜まとめ報告」をP0候補とする内容をActive Decisionとして扱う | `ATS-CON-008`, `ATS-PD-005`, `ATS-TASK-004` | 改善候補であり、正式仕様ではないためActive Decisionから外した | 2026-06-05 | `docs/projects/ats/memory/active-decisions.md` |

## Deprecated Decisions

| Decision ID | Deprecated Decision | Reason Not to Use | Deprecated At | Source Path |
|---|---|---|---|---|
| なし | - | - | - | - |

## Conflict Reference

- conflict_reference: `docs/projects/ats/memory/current-status.md#active-source-conflicts`
- formal_issue_root: `docs/review/context-source-conflicts/`

## References

- `docs/projects/ats/memory/project-summary.md`
- `docs/projects/ats/memory/current-status.md`
- `docs/projects/ats/memory/next-actions.md`
- `docs/memory/memory-taxonomy.md`
- `docs/memory/context-source-priority.md`
- `docs/review/phase-1-ats-template-validation.md`

## Change History

| Version | Date | Status | Change Summary | Approved By |
|---|---|---|---|---|
| 0.1.0 | 2026-06-05 | draft | M1-5 ATS適用検証用にActive Decisions初期ドラフトを作成。 | 未承認 |
| 1.0.0 | 2026-06-05 | active | P0修正としてVer1.1改善候補DecisionをActive Decisionsから外し、ConstraintとPending Decision / Taskへ分離してActive化。 | こうちゃん |
