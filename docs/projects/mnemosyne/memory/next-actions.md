---

title: "Mnemosyne Memory: Next Actions"
document_id: "docs/projects/mnemosyne/memory/next-actions.md"
document_role: "project_memory"
memory_type: "next_actions"
project_code: "mnemosyne"
status: "draft"
version: "0.1.0"
created_at: "2026-06-05"
updated_at: "2026-06-05"
phase: "Phase 1: Memory Foundation"
milestone: "M1-4: Mnemosyne初期記憶作成"
related_documents:

- "docs/projects/mnemosyne/memory/project-summary.md"
- "docs/projects/mnemosyne/memory/current-status.md"
- "docs/projects/mnemosyne/memory/active-decisions.md"
- "docs/projects/mnemosyne/memory/ai-entrypoint.md"
- "docs/phases/phase-1-memory-foundation.md"
- "docs/memory/memory-policy.md"
- "docs/memory/memory-taxonomy.md"
- "docs/memory/context-source-priority.md"

---

# Next Actions

## Task Register Metadata

| Field             | Value                                              |
| ----------------- | -------------------------------------------------- |
| project_code      | `mnemosyne`                                        |
| as_of             | 2026-06-05                                         |
| current_phase     | Phase 1: Memory Foundation                         |
| current_milestone | M1-4: Mnemosyne初期記憶作成                              |
| task_owner        | 個人開発者                                              |
| task_source_root  | `docs/phases/phase-1-memory-foundation.md`         |
| status_reference  | `docs/projects/mnemosyne/memory/current-status.md` |

## Priority Definition

| Priority      | Meaning        | Handling Rule                      |
| ------------- | -------------- | ---------------------------------- |
| P0            | 次に必ず実施する作業     | 完了または明示延期まで優先的に扱う                  |
| P1            | P0完了後に実施する作業   | P0の完了後、次の作業候補として扱う                 |
| P2            | 必要性を確認して実施する作業 | 実施判断が必要。未確定のままActive Decisionへ入れない |
| Later         | 将来候補           | Phase 1完了後または別Phaseで再評価する          |
| Not Doing Now | 今は実施しない作業      | スコープ外または後続Phaseへ明示的に送る             |

## Task Status Definition

| task_status   | Meaning            |
| ------------- | ------------------ |
| todo          | 未着手                |
| in_progress   | 着手中                |
| blocked       | 外部要因または未決定事項により停止中 |
| review_needed | ドラフト作成済みでレビュー待ち    |
| done          | 完了                 |
| deferred      | 後回し                |
| cancelled     | 実施しない              |

## Active Tasks

| Task ID        | Priority | Task                               | Purpose                                              | Input                                                              | Output                                                                                                      | Completion Criteria                             | task_status   | Source Path                                        | Updated At |
| -------------- | -------- | ---------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------- | -------------------------------------------------- | ---------- |
| MNEMO-TASK-001 | P0       | Mnemosyne初期記憶5文書を作成する              | Project Mnemosyne自身を、設計した記憶構造の最初の利用対象にする             | `docs/phases/phase-1-memory-foundation.md` / M1-3 Active Templates | `project-summary.md` / `current-status.md` / `active-decisions.md` / `next-actions.md` / `ai-entrypoint.md` | 5文書のドラフトが揃い、新しいチャットでMnemosyneの現在地を再説明せずに相談開始できる | review_needed | `docs/phases/phase-1-memory-foundation.md`         | 2026-06-05 |
| MNEMO-TASK-002 | P0       | M1-4の5文書をレビューし、Active化に必要な修正点を洗い出す | ドラフトを正本候補として扱える品質へ引き上げる                              | M1-4 5文書ドラフト                                                       | レビュー指摘一覧 / 修正方針                                                                                             | 不足・重複・責務逸脱・未決定事項混入が洗い出されている                     | todo          | `docs/projects/mnemosyne/memory/current-status.md` | 2026-06-05 |
| MNEMO-TASK-003 | P0       | M1-4 5文書のActive化用最終版を作成する          | Mnemosyne自身の初期記憶を正式な参照対象にする                          | レビュー済みM1-4ドラフト / 修正指摘                                              | Active化用5文書                                                                                                 | `status: active` へ変更可能な内容になっている                 | todo          | `docs/projects/mnemosyne/memory/current-status.md` | 2026-06-05 |
| MNEMO-TASK-004 | P1       | M1-5: ATS適用検証へ進む                   | Memory Templateが抽象論ではなく実プロジェクトへ適用可能か検証する             | M1-4 Active文書 / ATS既存docs                                          | `docs/projects/ats/memory/*.md` / `docs/review/phase-1-ats-template-validation.md`                          | ATSの重要前提・現在地・判断・次アクションを5文書で再現できる                | todo          | `docs/phases/phase-1-memory-foundation.md`         | 2026-06-05 |
| MNEMO-TASK-005 | P1       | M1-6: Agent接続方針を整理する               | Phase 1の記憶構造を将来の汎用専門Agentへ接続できるようにする                 | M1-4 / M1-5成果物                                                     | Agent利用マッピング / Phase 2への入力                                                                                  | Agentが必要とする記憶種別、参照文書、禁止事項が整理されている               | todo          | `docs/phases/phase-1-memory-foundation.md`         | 2026-06-05 |
| MNEMO-TASK-006 | P1       | Phase 1完了レビューを行う                   | Phase 2へ進む前に、Memory Foundationとして必要な文書・ルール・検証結果を確認する | M1-0〜M1-6成果物                                                       | Phase 1 completion review                                                                                   | Phase 1 DoDを満たすか判定できる                           | todo          | `docs/phases/phase-1-memory-foundation.md`         | 2026-06-05 |

## Deferred Tasks

| Task ID       | Priority | Task                                     | Reason for Deferral                                      | Revisit Timing             | Source Path                                 | task_status |
| ------------- | -------- | ---------------------------------------- | -------------------------------------------------------- | -------------------------- | ------------------------------------------- | ----------- |
| MNEMO-DEF-001 | P2       | Notion Project / Task / Decision DBの初期作成 | Phase 1ではMarkdown docs / ADR正本を優先し、Notionは必要性が見えた場合に扱うため | Phase 1完了レビューまたはPhase 2計画時 | `docs/memory/memory-policy.md`              | deferred    |
| MNEMO-DEF-002 | P2       | PostgreSQLによる構造化記憶DBの実装                  | Phase 1では記憶構造と運用ルール定義を優先し、DB実装は後続Phaseで扱うため              | Phase 3以降の設計時              | `docs/requirements/overall-requirements.md` | deferred    |
| MNEMO-DEF-003 | P2       | Context Pack自動生成CLIの実装                   | Phase 2の対象であり、M1-4時点では手動Context整理を優先するため                 | Phase 2: Context Forge     | `docs/phases/phase-1-memory-foundation.md`  | deferred    |
| MNEMO-DEF-004 | Later    | Memory API / MCP Serverの実装               | Phase 4 / Phase 5の対象であり、Phase 1では対象外のため                  | Phase 4 / Phase 5          | `docs/requirements/overall-requirements.md` | deferred    |
| MNEMO-DEF-005 | Later    | Agentの本格実装                               | Phase 6の対象であり、Phase 1ではAgent接続方針の整理までとするため               | Phase 6: Agent Operation   | `docs/requirements/overall-requirements.md` | deferred    |

## Not Doing Now

| Item                        | Reason                                 | Related Decision / Constraint | Revisit Timing |
| --------------------------- | -------------------------------------- | ----------------------------- | -------------- |
| AIによる正本文書への直接write          | AIはdraftまで、正本更新は人間承認後とするため             | MD-004 / MNEMO-CON-001        | 原則として再検討しない    |
| RAG検索の実装                    | Phase 3の対象であり、Phase 1では記憶構造を優先するため     | MD-002 / MNEMO-CON-002        | Phase 3        |
| Memory APIの実装               | Phase 4の対象であり、Phase 1では対象外のため          | MNEMO-CON-002                 | Phase 4        |
| MCP Serverの実装               | Phase 5の対象であり、Phase 1では対象外のため          | MNEMO-CON-002                 | Phase 5        |
| Web UIの実装                   | Phase 1の目的は記憶構造と運用ルールの固定であり、UI実装ではないため | MNEMO-CON-002                 | 未定             |
| 完全自動の会話要約・Decision抽出・Task登録 | 人間承認前の誤反映を避けるため                        | MD-004 / MD-008               | 運用検証後          |

## Task Dependency

```text
M1-4 Mnemosyne初期記憶作成
  ├─ MNEMO-TASK-001: 5文書ドラフト作成
  ├─ MNEMO-TASK-002: 5文書レビュー
  └─ MNEMO-TASK-003: Active化用最終版作成
       ↓
M1-5 ATS適用検証
  └─ MNEMO-TASK-004: ATSへMemory Templateを適用
       ↓
M1-6 Agent接続方針整理
  └─ MNEMO-TASK-005: Agent利用マッピング整理
       ↓
Phase 1完了レビュー
  └─ MNEMO-TASK-006: Phase 2へ進む前のDoD確認
```

## Review Checklist for Active Tasks

| Check Item                | Applies To | Expected Result        |
| ------------------------- | ---------- | ---------------------- |
| Source Pathが明記されている       | 全Task      | 根拠文書を追跡できる             |
| Outputが明確である              | 全Task      | 完了時の成果物が判断できる          |
| Completion Criteriaが明確である | 全Task      | done判定が属人的にならない        |
| 未決定事項をDecisionとして扱っていない   | 全Task      | Active Decisionとの混同を防ぐ |
| Phase 1スコープ外をP0にしていない     | 全Task      | 実装先行を防ぐ                |

## References

* `docs/phases/phase-1-memory-foundation.md`
* `docs/projects/mnemosyne/memory/project-summary.md`
* `docs/projects/mnemosyne/memory/current-status.md`
* `docs/projects/mnemosyne/memory/active-decisions.md`
* `docs/projects/mnemosyne/memory/ai-entrypoint.md`
* `docs/memory/memory-policy.md`
* `docs/memory/memory-taxonomy.md`
* `docs/memory/context-source-priority.md`

## Change History

| Version | Date       | Status | Change Summary                    | Approved By |
| ------- | ---------- | ------ | --------------------------------- | ----------- |
| 0.1.0   | 2026-06-05 | draft  | M1-4 Mnemosyne初期記憶作成として初版ドラフトを作成。 | pending     |
