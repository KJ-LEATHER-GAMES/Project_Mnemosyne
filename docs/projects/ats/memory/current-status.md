---

title: "ATS Current Status"
document_id: "docs/projects/ats/memory/current-status.md"
document_role: "project_memory"
template_applied: "docs/templates/memory/current-status.template.md"
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
- "docs/projects/ats/memory/active-decisions.md"
- "docs/projects/ats/memory/next-actions.md"

---

# Current Status

## Status Metadata

| Field            | Value               |
| ---------------- | ------------------- |
| project_code     | `ats`               |
| project_status   | active              |
| current_phase    | MVP実装・運用改善・設計docs整理 |
| status_as_of     | 2026-06-05          |
| status_owner     | こうちゃん               |
| last_reviewed_at | 2026-06-05          |
| next_review_at   | 未設定                 |

## Current Objective

ATSの現在の目的は、LINE Botによる家庭内ポイント制度のMVPを安定運用できる状態にしつつ、実装・DB・UseCase・ポイント経済・ごほうび交換の設計判断をMarkdown docsとして再利用可能な形へ整理することである。

M1-5における目的は、ATSの複雑な文脈をProject Mnemosyneのmemoryテンプレートへ適用し、5文書だけでATS相談を再開できるかを検証することである。

## Current Position

| Item               | Current State                                | Evidence / Source Path                           | Updated At |
| ------------------ | -------------------------------------------- | ------------------------------------------------ | ---------- |
| Current milestone  | LINE Bot MVPの実装・検証・運用改善を進行中                  | `docs/projects/ats/memory/current-status.md`     | 2026-06-05 |
| Completion outlook | on_track                                     | `docs/projects/ats/memory/current-status.md`     | 2026-06-05 |
| Immediate focus    | `ATS-TASK-001`: M1-5用ATS memory 5文書の作成       | `docs/projects/ats/memory/next-actions.md`       | 2026-06-05 |
| Secondary focus    | `ATS-TASK-002`: Ver1.1登録支援案のdocs反映           | `docs/projects/ats/memory/next-actions.md`       | 2026-06-05 |
| Validation focus   | `ATS-TASK-003`: memory文書だけでATSの設計相談を再開できるか確認 | `docs/review/phase-1-ats-template-validation.md` | 2026-06-05 |

## Completed Recently

| Completion ID | Completed Item        | Result / Confirmed Fact                         | Source Path                                    | Completed At |
| ------------- | --------------------- | ----------------------------------------------- | ---------------------------------------------- | ------------ |
| ATS-COMP-001  | 紙運用によるポイント制度の観察       | 実運用を通じて、報告頻度・ポイント設定・親の確認負荷・ごほうび妥当性が設計論点として抽出された | `docs/projects/ats/memory/project-summary.md`  | 2026-06-05   |
| ATS-COMP-002  | LINE Botによる行動登録の正常系確認 | 有効なactionCodeでポイント付与・DB更新・返信が成立することを確認済み        | `docs/projects/ats/memory/current-status.md`   | 2026-06-05   |
| ATS-COMP-003  | cooldown判定の確認         | cooldown中の登録では二重登録されず、想定どおり制御されることを確認済み         | `docs/projects/ats/memory/current-status.md`   | 2026-06-05   |
| ATS-COMP-004  | 所持ポイントと累計ポイントの分離方針を整理 | 消費型経済と永続蓄積を分ける設計方針を採用                           | `docs/projects/ats/memory/active-decisions.md` | 2026-06-05   |
| ATS-COMP-005  | ごほうび必要ポイントの現実化        | 8000pt全額交換案から、3000pt補助券案へ見直し                    | `docs/projects/ats/memory/active-decisions.md` | 2026-06-05   |

## In Progress

| Task ID      | Work Summary                                    | Priority | task_status | Source Task Document                             | Updated At |
| ------------ | ----------------------------------------------- | -------- | ----------- | ------------------------------------------------ | ---------- |
| ATS-TASK-001 | ATSのProject Memory 5文書を作成する                     | P0       | in_progress | `docs/projects/ats/memory/next-actions.md`       | 2026-06-05 |
| ATS-TASK-002 | Ver1.1登録支援案をdocsへ反映する                           | P0       | todo        | `docs/projects/ats/memory/next-actions.md`       | 2026-06-05 |
| ATS-TASK-003 | action_select周辺のUseCase設計・責務境界を継続レビューする         | P1       | todo        | `docs/projects/ats/memory/next-actions.md`       | 2026-06-05 |
| ATS-TASK-004 | lifetime_points / point_policy反映後の関連docs整合を確認する | P1       | todo        | `docs/projects/ats/memory/next-actions.md`       | 2026-06-05 |
| ATS-TASK-005 | ATSテンプレート適用検証レビューを作成する                          | P1       | todo        | `docs/review/phase-1-ats-template-validation.md` | 2026-06-05 |

## Blockers / Issues

| Issue ID    | Issue Type | Summary                                    | Severity | Impact / blocked_scope | issue_status | Source Path                                  | Related Task   |
| ----------- | ---------- | ------------------------------------------ | -------- | ---------------------- | ------------ | -------------------------------------------- | -------------- |
| ATS-ISS-001 | issue      | 子どもがその都度行動を報告する運用は忘れやすく、心理的ハードルもある         | high     | 継続率・報告漏れ・ポイント実態        | open         | `docs/projects/ats/memory/current-status.md` | `ATS-TASK-002` |
| ATS-ISS-002 | issue      | 親が代理登録・確認する導線の負荷が残っている                     | medium   | 親側の継続運用負荷              | open         | `docs/projects/ats/memory/current-status.md` | `ATS-TASK-002` |
| ATS-ISS-003 | risk       | Render無料プランではスリープによりWebhook応答が不安定になる可能性がある | medium   | LINE Bot応答・ユーザー体験      | monitoring   | `docs/projects/ats/memory/current-status.md` | `ATS-TASK-003` |
| ATS-ISS-004 | issue      | 仕様・DB・UseCase・記事メモが複数会話に分散している             | high     | AI相談再開時の前提復元           | open         | `docs/projects/ats/memory/current-status.md` | `ATS-TASK-001` |
| ATS-ISS-005 | issue      | Ver1.1改善案の優先度は整理済みだが、正式な仕様反映は未完了           | medium   | 次期改善スコープ               | open         | `docs/projects/ats/memory/current-status.md` | `ATS-TASK-002` |

## Active Source Conflicts

| Conflict Issue ID | Severity | blocked_scope | Conflicting Sources | conflict_status | Formal Issue Path | Required Handling                                     |
| ----------------- | -------- | ------------- | ------------------- | --------------- | ----------------- | ----------------------------------------------------- |
| なし                | -        | -             | -                   | -               | -                 | 現時点で正式なActive正本間競合は未記録。ただし、複数会話由来の情報はM1-5レビューで整合確認する。 |

## Pending Decisions

| Pending Decision ID | Question / Decision Needed               | Why Needed Now                | Candidate Sources                              | Decision Owner | Target Review | Status |
| ------------------- | ---------------------------------------- | ----------------------------- | ---------------------------------------------- | -------------- | ------------- | ------ |
| ATS-PD-001          | Ver1.1改善案をどこまでMVP後続スコープに含めるか             | 登録忘れ対策が継続運用に強く影響するため          | `docs/projects/ats/memory/next-actions.md`     | こうちゃん          | 未設定           | open   |
| ATS-PD-002          | 今日の未報告一覧と夜まとめ報告のUI仕様をどうするか               | 子ども・親双方の運用負荷を下げるため            | `docs/projects/ats/memory/next-actions.md`     | こうちゃん          | 未設定           | open   |
| ATS-PD-003          | reward交換のspend型 / milestone型をどの範囲まで実装するか | ごほうび交換と累計達成の設計境界を明確にするため      | `docs/projects/ats/memory/active-decisions.md` | こうちゃん          | 未設定           | open   |
| ATS-PD-004          | 実装レビューAgentに渡す追加docsをどう定義するか             | Phase 2のContext Pack設計へ接続するため | `docs/projects/ats/memory/ai-entrypoint.md`    | こうちゃん          | M1-5レビュー時     | open   |

## Next Review Point

| Review Item          | Review Trigger / Date | Expected Decision or Confirmation           | Related Source                                   |
| -------------------- | --------------------- | ------------------------------------------- | ------------------------------------------------ |
| ATS memory 5文書レビュー   | M1-5ドラフト作成後           | 5文書でATSの文脈を再現できるか確認する                       | `docs/review/phase-1-ats-template-validation.md` |
| Ver1.1登録支援案レビュー      | next-actions作成後       | P0改善案を正式タスク化するか確認する                         | `docs/projects/ats/memory/next-actions.md`       |
| active-decisions整合確認 | active-decisions作成後   | 現在有効な判断と未決定案が混在していないか確認する                   | `docs/projects/ats/memory/active-decisions.md`   |
| Phase 2入力観点確認        | M1-5レビュー時             | Project Registry / Agent Contextに必要な項目を抽出する | `docs/review/phase-1-ats-template-validation.md` |

## References

* `docs/projects/ats/memory/project-summary.md`
* `docs/projects/ats/memory/active-decisions.md`
* `docs/projects/ats/memory/next-actions.md`
* `docs/memory/context-source-priority.md`
* `docs/review/phase-1-ats-template-validation.md`

## Change History

| Version | Date       | Status | Change Summary                         | Approved By |
| ------- | ---------- | ------ | -------------------------------------- | ----------- |
| 0.1.0   | 2026-06-05 | draft  | M1-5 ATS適用検証用にCurrent Status初期ドラフトを作成。 | 未承認         |
