---

title: "ATS Next Actions"
document_id: "docs/projects/ats/memory/next-actions.md"
document_role: "project_memory"
template_applied: "docs/templates/memory/next-actions.template.md"
project_code: "ats"
project_name: "Adventure Token System"
status: "draft"
version: "0.1.0"
created_at: "2026-06-05"
updated_at: "2026-06-05"
approved_at: null
phase: "Phase 1: Memory Foundation"
milestone: "M1-5: ATS適用検証"
related_documents:

- "docs/phases/phase-1-memory-foundation.md"
- "docs/projects/ats/memory/project-summary.md"
- "docs/projects/ats/memory/current-status.md"
- "docs/projects/ats/memory/active-decisions.md"
- "docs/projects/ats/memory/ai-entrypoint.md"

---

# Next Actions

## Document Role

This document is the authoritative task source for ATS project memory.

`current-status.md` may reference task IDs and summarize current focus, but it must not duplicate full task definitions, completion criteria, inputs, outputs, or priority rationale.

## Priority Definition

| Priority      | Meaning      | Handling Rule                  |
| ------------- | ------------ | ------------------------------ |
| P0            | 次に必ず実施する     | Current focusとして扱う。完了条件を明確にする。 |
| P1            | P0完了後に実施する   | 実施順を管理する。必要に応じてP0へ昇格する。        |
| P2            | 必要性を確認して実施する | 仕様化・実装前に効果と負荷を再確認する。           |
| Later         | 将来候補         | 現時点では実装・詳細設計しない。               |
| Not Doing Now | 今はやらない       | 今回スコープに含めない。AIが勝手にTask化しない。    |

## Task Status Definition

| task_status | Meaning            |
| ----------- | ------------------ |
| todo        | 未着手                |
| in_progress | 着手中                |
| blocked     | 外部要因または未決定事項により停止中 |
| review      | レビュー待ち             |
| done        | 完了                 |
| deferred    | 後回し                |
| cancelled   | 中止                 |

## Active Tasks

| Task ID      | Priority | Task                                          | Purpose                                     | Input                                   | Output                                                                                                      | Completion Criteria                                                             | task_status | Source Path                                | Related Decision / Issue          |
| ------------ | -------- | --------------------------------------------- | ------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------- | ------------------------------------------ | --------------------------------- |
| ATS-TASK-001 | P0       | ATS memory 5文書を完成させる                          | ATSの重要文脈を5文書だけで再現できる状態にする                   | 既存ATS会話、設計メモ、M1-5テンプレート                 | `project-summary.md` / `current-status.md` / `active-decisions.md` / `next-actions.md` / `ai-entrypoint.md` | 5文書が作成され、Task・Decision・Issue・Ideaの混在が整理されている                                    | in_progress | `docs/projects/ats/memory/next-actions.md` | ATS-ISS-004                       |
| ATS-TASK-002 | P0       | ATSテンプレート適用検証レビューを作成する                        | M1-5の完了条件を確認し、テンプレート不足を洗い出す                 | ATS memory 5文書                          | `docs/review/phase-1-ats-template-validation.md`                                                            | 検証シナリオT-01〜T-05の判定、課題、Phase 2入力要件が記録されている                                       | in_progress | `docs/projects/ats/memory/next-actions.md` | none                              |
| ATS-TASK-003 | P0       | `current-status.md` のTask記載を正本参照形式へ整理する       | Task正本が `next-actions.md` と二重管理にならないようにする   | `current-status.md` / `next-actions.md` | `current-status.md` 修正案                                                                                     | `current-status.md` のIn ProgressがTask ID参照中心になり、詳細定義が `next-actions.md` のみに存在する | todo        | `docs/projects/ats/memory/next-actions.md` | ATS-CON-008                       |
| ATS-TASK-004 | P1       | Ver1.1登録支援案を正式な改善候補として整理する                    | 子どもの報告忘れ・親の代理登録負荷を下げる次期改善を明確化する             | Ver1.1案、運用観察メモ                          | Ver1.1改善候補リストまたは仕様ドラフト                                                                                      | P0候補、P1候補、P2候補が分離され、未決定事項がDecision扱いされていない                                      | todo        | `docs/projects/ats/memory/next-actions.md` | ATS-ISS-001 / ATS-ISS-002         |
| ATS-TASK-005 | P1       | action_select周辺のUseCase設計をレビューする              | 責務分離、トランザクション境界、冪等性を維持する                    | UseCaseコード、DB設計、active-decisions        | 設計レビュー結果                                                                                                    | action_selectの責務、DB更新範囲、processed_events、cooldown、daily_limitの整合が確認されている        | todo        | `docs/projects/ats/memory/next-actions.md` | ATS-D-005 / ATS-D-006 / ATS-D-007 |
| ATS-TASK-006 | P1       | lifetime_points / point_policy反映後のdocs整合を確認する | 所持ポイントと累計ポイントの分離方針をDB・UseCase・ごほうび仕様へ一貫反映する | DB設計メモ、UseCase設計、reward仕様               | docs更新候補                                                                                                    | 所持ポイント、累計ポイント、spend型、milestone型の表現がdocs間で矛盾していない                                | todo        | `docs/projects/ats/memory/next-actions.md` | ATS-D-009 / ATS-D-010             |
| ATS-TASK-007 | P1       | Phase 2向けATS Context入力要件を整理する                 | Context Pack生成時にATSで必要な文書・除外文書・追加文書を定義する    | ATS memory 5文書、検証レビュー                   | Phase 2入力要件メモ                                                                                               | Project Contextとして必須文書、任意文書、Agent別追加文書が整理されている                                  | todo        | `docs/projects/ats/memory/next-actions.md` | none                              |

## Deferred Tasks

| Task ID       | Priority | Task            | Reason for Deferral          | Revisit Trigger           | task_status |
| ------------- | -------- | --------------- | ---------------------------- | ------------------------- | ----------- |
| ATS-TASK-D001 | P2       | Streak機能の詳細仕様化  | 登録支援P0案を先に固める必要があるため         | 今日の未報告一覧・夜まとめ報告の仕様化後      | deferred    |
| ATS-TASK-D002 | P2       | 今日のクエスト機能の詳細仕様化 | 日次導線の基本設計が先に必要なため            | Ver1.1 P0改善の運用方針確定後       | deferred    |
| ATS-TASK-D003 | P2       | 演出強化の仕様化        | MVPの安定運用とポイント経済設計が優先のため      | 基本登録導線が安定した後              | deferred    |
| ATS-TASK-D004 | P2       | リマインド通知の仕様化     | 通知頻度・親子双方の負担・LINE運用設計が未整理のため | 夜まとめ報告の必要性確認後             | deferred    |
| ATS-TASK-D005 | Later    | アバター成長機能の設計     | 効果は高いが実装負荷が大きいため             | MVP安定後、継続率改善が次の主要テーマになった時 | deferred    |

## Not Doing Now

| Item               | Reason                                      | Guardrail              |
| ------------------ | ------------------------------------------- | ---------------------- |
| ATSを汎用SaaS化する      | 現在の目的は家庭内運用のMVP安定化であり、外部提供ではない              | AIは多家庭展開を前提に仕様を拡張しない   |
| 管理者Web UIを作る       | LINE Bot / DB / Notion副本でMVP検証を優先する         | Web UI前提でTaskを作らない     |
| RAG検索をATS実装へ導入する   | Project MnemosyneではPhase 3以降の対象であり、M1-5の範囲外 | memory文書検証に留める         |
| MCP連携を実装する         | Phase 5以降の対象であり、ATS MVPには不要                 | MCP前提の設計変更をしない         |
| AIによるdocs直接更新      | Phase 1の方針に反する                              | AIは更新案作成まで。正本反映は人間承認後。 |
| レベル倍率による恒久的なポイント増加 | ポイントインフレと説明コストが高いため不採用                      | レベルは解放・演出・達成感として扱う     |
| ゲームソフト全額交換を主目標にする  | 必要ポイントが遠すぎ、継続モチベーションを下げるため                  | 補助券方式を前提にする            |

## Current Status Integration Rule

`current-status.md` may contain only the following task-related information:

* current focus task IDs
* task_status summary
* blockers / issues
* next review point

`current-status.md` must not contain:

* full task purpose
* full input / output definition
* completion criteria
* priority rationale
* detailed implementation steps

If task details change, update this document first. Then update `current-status.md` only if the current focus or status summary changed.

## Recommended `current-status.md` Replacement Block

Use the following simplified block to avoid double management.

```md
## In Progress

| Task ID | Current Focus | Priority | task_status | Source Task Document | Updated At |
|---|---|---|---|---|---|
| ATS-TASK-001 | ATS memory 5文書の完成 | P0 | in_progress | `docs/projects/ats/memory/next-actions.md` | 2026-06-05 |
| ATS-TASK-002 | ATSテンプレート適用検証レビュー作成 | P0 | in_progress | `docs/projects/ats/memory/next-actions.md` | 2026-06-05 |
| ATS-TASK-003 | current-statusのTask記載を参照形式へ整理 | P0 | todo | `docs/projects/ats/memory/next-actions.md` | 2026-06-05 |

Full task definitions are managed only in `docs/projects/ats/memory/next-actions.md`.
```

## Change History

| Version | Date       | Status | Change Summary                                            | Approved By |
| ------- | ---------- | ------ | --------------------------------------------------------- | ----------- |
| 0.1.0   | 2026-06-05 | draft  | M1-5 ATS適用検証用にNext Actions初期ドラフトを作成。Task正本を本書に集約するルールを明記。 | 未承認         |
