---
title: "Mnemosyne Memory: Project Summary"
document_id: "docs/projects/mnemosyne/memory/project-summary.md"
document_role: "project_memory"
memory_type: "project_summary"
project_code: "mnemosyne"
status: "active"
version: "1.0.0"
created_at: "2026-06-05"
updated_at: "2026-06-05"
phase: "Phase 1: Memory Foundation"
milestone: "M1-4: Mnemosyne初期記憶作成"
related_documents:
  - "docs/phases/phase-1-memory-foundation.md"
  - "docs/requirements/overall-requirements.md"
  - "docs/memory/memory-policy.md"
  - "docs/memory/memory-taxonomy.md"
  - "docs/memory/context-source-priority.md"
  - "docs/projects/mnemosyne/memory/current-status.md"
  - "docs/projects/mnemosyne/memory/active-decisions.md"
  - "docs/projects/mnemosyne/memory/next-actions.md"
  - "docs/projects/mnemosyne/memory/ai-entrypoint.md"
---

# Project Summary

## Project Metadata

| Field | Value |
|---|---|
| project_code | `mnemosyne` |
| project_name | Project Mnemosyne |
| project_status | active |
| project_type | platform |
| owner | 個人開発者 |
| started_at | 2026-05-27 |
| repository_or_workspace | `project-mnemosyne/` |
| memory_root | `docs/projects/mnemosyne/memory/` |

## Purpose

Project Mnemosyneは、AIとの会話、設計判断、タスク、記事メモ、ドキュメント更新案を外部記憶として整理し、AIが必要な文脈を再利用できるようにするための個人開発向けAI外部記憶基盤である。

本プロジェクトの目的は、AIにすべてを覚えさせることではない。

GitHub docs、ADR、Notion、PostgreSQL、Context Pack、RAG、MCP、Agentなどを段階的に組み合わせ、AIが参照できる正本・副本・生成物の境界を明確にした記憶基盤を構築することを目的とする。

## Relationship with AI Entrypoint

本書はProject Mnemosyneの目的、背景、Scope、Stable Factsの正本である。

`docs/projects/mnemosyne/memory/ai-entrypoint.md` はAI支援開始時の入口であり、Project概要を最小要約として再掲する。詳細なProject概要を確認する場合は、本書を正本として扱う。

## Background

AIとの開発相談では、会話が長くなるほど以下の課題が発生する。

- 毎回プロジェクトの前提説明が必要になる
- 過去の設計判断が会話ログに埋もれる
- 決定事項、未決事項、タスク、アイデアが混在する
- AIが古い情報や仮説を確定事項として扱う
- ChatGPT / Cursor / Claude などAIクライアント間で文脈が分断される
- 会話ログが設計資産として残らない
- プロジェクト横断で専門Agentを再利用しづらい

Project Mnemosyneは、これらの課題に対して、会話を流さず、再利用可能な設計資産へ変換するための外部記憶構造を提供する。

## Target Users / Stakeholders

| Stakeholder | Role / Need | Relationship to Project |
|---|---|---|
| 個人開発者 | 複数プロジェクトの設計判断、タスク、文脈を継続的に扱いたい | primary_user |
| AI Assistant | 正本に基づいて、古い情報や未決定案を混同せず支援する | operator |
| ChatGPT / Cursor / Claude などのAIクライアント | 共通のProject Contextを参照して作業を継続する | affected_party |
| ATSなどの適用対象プロジェクト | 記憶構造とContext生成の検証対象となる | validation_target |

## Core Concepts

| Concept | Definition in This Project | Note |
|---|---|---|
| External Memory | AIが参照できるように整理されたプロジェクト記憶 | AI内部の記憶ではなく、外部に管理する |
| Source of Truth | 判断・設計・状態の正本となる情報源 | Markdown docs / ADRを初期正本とする |
| Project Context | プロジェクト固有の目的、状態、判断、次アクション | Agent共通定義とは分離する |
| Agent Context | 役割ベースのAI支援に必要な共通ルール | ADR Agent、Docs Agent、Review Agentなど |
| Context Pack | AIへ渡すために正本から組み立てた文脈 | 生成物であり正本ではない |
| Conversation Summary | 会話ログを再利用可能な記憶候補へ変換したもの | そのままActive Decisionにはしない |
| Conflict Issue | 正本間の競合を検知・記録・解消するためのIssue | current-status.mdから参照する |

## Scope

- プロジェクト概要の整理
- 現在状況の管理
- 設計判断のADR化
- タスク、Issue、Ideaの分類
- 会話ログの要約と記憶化
- AIに渡すContext Pack生成
- 将来的なRAG検索
- 将来的なMemory API / MCP連携
- 汎用専門Agentの設計
- 複数プロジェクトへ適用可能な記憶テンプレートの整備

## Out of Scope

Phase 1時点では以下を対象外とする。

- RAG検索の実装
- Memory APIの実装
- MCP Serverの実装
- UIの実装
- PostgreSQLによる構造化記憶DBの実装
- Vector Store / pgvectorの実装
- AIによる正本文書への直接write
- Agentの本格実装
- 完全自動の会話要約・Decision抽出・Task登録

## Stable Facts

| Fact ID | Fact | Source Path | As Of | Status | Note |
|---|---|---|---|---|---|
| MNEMO-FACT-001 | Project Mnemosyneは、AI外部記憶基盤を作るプロジェクトである。 | `docs/requirements/overall-requirements.md` | 2026-06-05 | active | プロジェクトの根本目的 |
| MNEMO-FACT-002 | Phase 1の名称はMemory Foundationであり、記憶構造と運用ルールを定義する。 | `docs/phases/phase-1-memory-foundation.md` | 2026-06-05 | active | 現在の作業Phase |
| MNEMO-FACT-003 | Phase 1の検証対象はMnemosyne自身とATSである。 | `docs/phases/phase-1-memory-foundation.md` | 2026-06-05 | active | M1-4 / M1-5の対象 |
| MNEMO-FACT-004 | M1-4ではMnemosyne自身の初期記憶として5文書を作成する。 | `docs/phases/phase-1-memory-foundation.md` | 2026-06-05 | active | 本タスクの成果物 |
| MNEMO-FACT-005 | M1-3でMemory Template 6文書がActive化済みである。 | `docs/review/m1-3-template-activation-record.md` | 2026-06-05 | active | M1-4の入力 |

## Source of Truth

| Information Category | Authoritative Source | Role |
|---|---|---|
| プロジェクト目的・安定した範囲・Stable Fact | `docs/projects/mnemosyne/memory/project-summary.md` | Project概要の正本 |
| 現在地・Issue・Conflict Issue参照 | `docs/projects/mnemosyne/memory/current-status.md` | 状態の正本 |
| 現在有効なDecision / Constraint | `docs/projects/mnemosyne/memory/active-decisions.md` および関連ADR | 判断・制約の正本 |
| 直近Task | `docs/projects/mnemosyne/memory/next-actions.md` | Taskの正本 |
| AI参照入口 | `docs/projects/mnemosyne/memory/ai-entrypoint.md` | 参照ルートの入口 |
| 共通Memory運用ルール | `docs/memory/memory-policy.md` | 正本・副本・更新権限の正本 |
| Memory分類・状態定義 | `docs/memory/memory-taxonomy.md` | memory_type / statusの正本 |
| Context参照優先順位 | `docs/memory/context-source-priority.md` | 競合時の参照優先順位の正本 |
| 重要設計判断 | `docs/adr/ADR-*.md` | 判断理由と採用背景の正本 |

## Related Projects

| Project Code | Relationship | Shared Context / Boundary | Reference Path |
|---|---|---|---|
| ats | validation_target | Memory TemplateとContext設計の実プロジェクト適用検証対象 | `docs/projects/ats/memory/` |
| note / content projects | future_candidate | 記事メモや発信活動の外部記憶化候補 | none |
| work-improvement | future_candidate | 業務改善ナレッジの外部記憶化候補 | none |

## References

- `docs/phases/phase-1-memory-foundation.md`
- `docs/requirements/overall-requirements.md`
- `docs/memory/memory-policy.md`
- `docs/memory/memory-taxonomy.md`
- `docs/memory/context-source-priority.md`
- `docs/adr/ADR-001-docs-as-source-of-memory.md`
- `docs/adr/ADR-002-memory-source-of-truth-boundary.md`
- `docs/adr/ADR-003-human-approved-memory-update.md`

## Change History

| Version | Date | Status | Change Summary | Approved By |
|---|---|---|---|---|
| 0.1.0 | 2026-06-05 | draft | M1-4 Mnemosyne初期記憶作成として初版ドラフトを作成。 | pending |
| 1.0.0 | 2026-06-05 | active | M1-4 Active化レビューのP1-004を反映し、ai-entrypointとの概要重複の意図を明記してActive化。 | user |
