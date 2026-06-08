# M1-3 Active Final Package

## 収録内容

```text
docs/templates/memory/
  project-summary.template.md
  current-status.template.md
  active-decisions.template.md
  next-actions.template.md
  ai-entrypoint.template.md
  conversation-summary.template.md

docs/review/
  m1-3-template-activation-record.md

phase-requirements-3.md
```

## 状態

- 6テンプレート: `status: active` / `version: 1.0.0`
- Active化日: `2026-06-05`
- Phase 3要件定義書: M1-2 Active状態語およびConversation Summary参照条件へ整合させた修正版

## 主な修正

- Conversation Summaryへ `review_status: archived` を復活。
- Project Summaryへ独立した `## Out of Scope` を復元。
- 6テンプレートのfrontmatterを共通化し、テンプレート文書自身を `document_id` で識別。
- Conflict Issue参照を `current-status.md` に一本化。
- Constraint本文の正本を `active-decisions.md` に一本化。
- AI Entrypointを参照中心の構成へ簡略化。
- `reflection_status` を `pending / reflected / not_required / rejected` に整理。
- Phase 3要件の `accepted` / `proposed` status使用を廃止し、`active` / `draft` へ統一。

## コピー利用時の注意

Active化されたのはテンプレート文書です。各Projectへコピーして初期記憶文書を作成する際は、コピー先の `document_id`、`document_role`、Project情報を設定し、初回レビュー前は `status: draft` としてください。
