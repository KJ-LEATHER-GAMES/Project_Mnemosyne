---
title: "M1-3 Template Activation Record"
document_id: "docs/review/m1-3-template-activation-record.md"
document_role: "review_result"
status: "active"
version: "1.0.0"
created_at: "2026-06-05"
updated_at: "2026-06-05"
approved_at: "2026-06-05"
phase: "Phase 1: Memory Foundation"
milestone: "M1-3: Template整備"
related_documents:
  - "docs/templates/memory/project-summary.template.md"
  - "docs/templates/memory/current-status.template.md"
  - "docs/templates/memory/active-decisions.template.md"
  - "docs/templates/memory/next-actions.template.md"
  - "docs/templates/memory/ai-entrypoint.template.md"
  - "docs/templates/memory/conversation-summary.template.md"
  - "phase-requirements-3.md"
---

# M1-3 Template Activation Record

## 判定

| 項目 | 結果 |
|---|---|
| M1-3 6テンプレート Active化 | Go |
| Mnemosyneへのコピー適用可否 | 可。M1-4で実文書化する |
| ATSへのコピー適用可否 | 可。M1-5で実データ検証する |
| Phase 3要件状態語整合 | 修正完了 |

## 反映した修正

| Priority | 修正内容 | 反映先 | 結果 |
|---|---|---|---|
| P0 | `review_status: archived` を復活 | `conversation-summary.template.md` | 反映済み |
| P0 | `## Out of Scope` を独立章へ復元 | `project-summary.template.md` | 反映済み |
| P0 | 共通frontmatterを統一し、文書識別は `document_id` とする | 全6件 | 反映済み |
| P0 | Conflict Issue一覧を `current-status.md` に一本化 | `active-decisions.template.md` | 反映済み |
| P1 | Constraint本文の正本を `active-decisions.md` に一本化 | `project-summary.template.md` | 反映済み |
| P1 | AI EntrypointのConstraint記載を参照中心へ縮退 | `ai-entrypoint.template.md` | 反映済み |
| P1 | `reflection_status` を4値へ簡略化 | `conversation-summary.template.md` | 反映済み |
| P1 | 共通運用ルール再掲を参照・コメントへ縮退 | 対象3件 | 反映済み |
| P1 | 本文説明を日本語へ統一 | 全6件 | 反映済み |
| P2 | `accepted` / `proposed` を共通statusから除去 | `phase-requirements-3.md` | 反映済み |

## 確定した責務境界

| 情報 | 正本となるProject Memory文書 |
|---|---|
| 目的・背景・Scope・安定Fact・正本マップ | `project-summary.md` |
| 現在地・Issue・Conflict Issue参照・Pending Decision | `current-status.md` |
| Active Decision / Active Constraint・置換履歴・非推奨履歴 | `active-decisions.md` |
| 実施Task・優先度・完了条件・`task_status` | `next-actions.md` |
| AI参照開始点・条件付き参照ルート・draft境界 | `ai-entrypoint.md` |
| 会話単位のMemory候補・レビュー・正本反映追跡 | `conversations/{date}-{topic}.md` |

## 適用時のルール

- Active化されたのは **テンプレート文書** である。
- テンプレートをProject文書へコピーした直後は、コピー先文書を `status: draft` として作成する。
- Conversation Summaryは初期5文書に含めず、記憶化対象となる会話単位で生成する。
- Conversation Summaryの通常補助参照対象は `review_status: reviewed` または `reflected`、`archived` は履歴確認時のみとする。

## 検証結果

| Test ID | 確認内容 | 結果 |
|---|---|---|
| M1-3-V-001 | 6テンプレートが共通frontmatter項目を保持する | PASS |
| M1-3-V-002 | 6テンプレートの文書statusが `active`、versionが `1.0.0` である | PASS |
| M1-3-V-003 | 元計画の必須見出しを保持する | PASS |
| M1-3-V-004 | `project-summary` に独立した `## Out of Scope` が存在する | PASS |
| M1-3-V-005 | `active-decisions` が競合一覧を重複保持しない | PASS |
| M1-3-V-006 | `conversation-summary` が `review_status: archived` を含む | PASS |
| M1-3-V-007 | `reflection_status` が `pending / reflected / not_required / rejected` に整理されている | PASS |
| M1-3-V-008 | Phase 3修正版に `accepted` / `proposed` のstatus語が残っていない | PASS |

## 次工程

| Milestone | 次の作業 |
|---|---|
| M1-4 | Activeテンプレートを使用し、Project Mnemosyneの初期記憶5文書を作成する |
| M1-5 | ATSへ5文書をコピー適用し、実データでテンプレートの不足・過剰を検証する |
