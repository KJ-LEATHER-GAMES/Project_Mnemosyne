---
title: "ATS Project Summary"
document_id: "docs/projects/ats/memory/project-summary.md"
document_role: "project_memory"
template_applied: "docs/templates/memory/project-summary.template.md"
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
  - "docs/memory/memory-policy.md"
  - "docs/memory/memory-taxonomy.md"
  - "docs/memory/context-source-priority.md"
---

# Project Summary

## Project Metadata

| Field | Value |
|---|---|
| project_code | `ats` |
| project_name | Adventure Token System |
| project_status | active |
| project_type | product |
| owner | こうちゃん |
| started_at | 2026-03-15 |
| repository_or_workspace | 未確定 |
| memory_root | `docs/projects/ats/memory/` |

## Purpose

Adventure Token System、以下ATSは、家庭内の行動報告・ポイント付与・履歴管理・ごほうび交換を通じて、子どもの行動を前向きに可視化するための家庭内ゲーミフィケーションシステムである。

ATSの目的は、単にポイントを配ることではない。子どもが日々の行動を自分で報告し、積み上げを実感できるようにし、親側も無理なく継続運用できる仕組みを作ることである。

初期運用では紙とNotionを使い、現在はLINE Botを中心とした実装へ移行している。

## Background

ATSは、家庭内ポイント制度を紙運用から始め、実際の運用観察を通じて仕様を具体化してきた。

紙運用によって、以下のような設計上の観点が明確になった。

- どの行動が頻繁に報告されるか
- どのポイント設定が高すぎる、または低すぎるか
- 子どもにとって報告しやすい導線は何か
- 親の確認負荷がどこに集中するか
- ごほうびの必要ポイントが現実的か
- 報告忘れがどの程度発生するか

その後、Notionによる管理を経て、LINE Botで子どもが行動を報告し、サーバー側でポイント付与・履歴記録・返信メッセージ生成を行う構成へ発展している。

## Target Users / Stakeholders

| Stakeholder | Role / Need | Relationship to Project |
|---|---|---|
| 子ども | 行動を報告し、ポイントやごほうびを通じて積み上げを実感する | primary_user |
| 親 | 行動履歴・ポイント・ごほうび交換を確認し、運用を支える | operator |
| こうちゃん | 企画・設計・実装・運用・改善を行う | owner / developer |
| AI支援者 | 設計レビュー、実装方針整理、記事化支援を行う | reviewer / assistant |

## Core Concepts

| Concept | Definition in This Project | Note |
|---|---|---|
| 行動報告 | 子どもがLINE上で実施した行動を選択・報告すること | `category_select` → `action_select` が基本導線 |
| ポイント | 行動に応じて付与される家庭内トークン | 所持ポイントと累計ポイントを分離する |
| 所持ポイント | ごほうび交換に使える消費可能なポイント | DB上では `total_points` 系で扱う |
| 累計ポイント | これまでの積み上げを示す消費されないポイント | DB上では `lifetime_points` 系で扱う |
| ごほうび | ポイントと交換できる報酬 | spend型とmilestone型を区別する |
| cooldown | 同一行動の短時間連続登録を防ぐ制御 | 二重登録・連打対策 |
| daily_limit | 1日あたりの登録上限またはポイント上限 | ポイント経済のインフレ防止 |
| processed_events | LINE Webhookイベントの冪等性を担保する記録 | 二重処理防止 |
| Notion | 可視化・閲覧用の副本 | 正本DBではない |
| PostgreSQL | 実行時データの正本 | Neon PostgreSQLを使用 |
| docs | 設計判断・仕様整理の正本 | Markdownで管理する |

## Scope

- 家庭内ポイント制度の企画・設計
- LINE Botによる行動報告UI
- postback.dataを起点としたUseCase分岐
- ポイント付与・履歴登録・日次集計・残高更新
- cooldown / daily_limit / 冪等性制御
- ごほうび交換処理
- 所持ポイントと累計ポイントの分離
- Notionへの可視化用同期
- 設計判断・仕様・検証結果のMarkdown docs化
- note記事化に利用できる開発記録・設計思想の整理

## Out of Scope

- 学校や外部サービスとの正式連携
- 汎用SaaSとしての多家庭展開
- 課金機能
- 本格的な管理者UI
- 高度なRAG / Agent / MCP連携
- 自動記憶更新
- ゲームそのものの実装
- 子どもの行動評価や成績評価を目的とした運用

## Stable Facts

| Fact ID | Fact | Source Path | As Of | Status | Note |
|---|---|---|---|---|---|
| ATS-FACT-001 | ATSは家庭内ポイント制度をLINE Botとして実装するプロジェクトである | `docs/projects/ats/memory/project-summary.md` | 2026-06-05 | active | M1-5で承認された安定事実 |
| ATS-FACT-002 | ATSは紙運用、Notion運用を経てLINE Bot実装へ進んでいる | `docs/projects/ats/memory/project-summary.md` | 2026-06-05 | active | 紙運用は仕様観察フェーズとして扱う |
| ATS-FACT-003 | LINE Botでは `category_select` から `action_select` へ進む操作導線を採用している | `docs/projects/ats/memory/project-summary.md` | 2026-06-05 | active | postback中心 |
| ATS-FACT-004 | 実行時データの正本はPostgreSQLであり、Notionは可視化用の副本である | `docs/projects/ats/memory/active-decisions.md` | 2026-06-05 | active | 設計判断として管理 |
| ATS-FACT-005 | 所持ポイントと累計ポイントは分離する方針である | `docs/projects/ats/memory/active-decisions.md` | 2026-06-05 | active | 消費によるモチベーション低下を避けるため |
| ATS-FACT-006 | Render上でNode.js / TypeScriptサーバーを動かし、Neon PostgreSQLを利用している | `docs/projects/ats/memory/project-summary.md` | 2026-06-05 | active | 実装環境の安定事実 |
| ATS-FACT-007 | MVPでは、行動報告、ポイント付与、履歴登録、残高更新、返信メッセージ生成を主対象とする | `docs/projects/ats/memory/project-summary.md` | 2026-06-05 | active | MVPスコープ |

## Source of Truth

| Information Category | Authoritative Source | Role |
|---|---|---|
| プロジェクト目的・安定した範囲・Stable Fact | `docs/projects/ats/memory/project-summary.md` | Project概要の正本 |
| 現在地・Issue・Conflict Issue参照 | `docs/projects/ats/memory/current-status.md` | 状態の正本 |
| 現在有効なDecision / Constraint | `docs/projects/ats/memory/active-decisions.md` および関連ADR | 判断・制約の正本 |
| 直近Task | `docs/projects/ats/memory/next-actions.md` | Taskの正本 |
| AI参照入口 | `docs/projects/ats/memory/ai-entrypoint.md` | 参照ルートの正本 |
| 実行時データ | PostgreSQL / Neon | アプリケーションデータの正本 |
| 可視化データ | Notion | 副本 |
| 記事化・発信メモ | note記事メモ / conversation-summary | 発信素材 |

## Related Projects

| Project Code | Relationship | Shared Context / Boundary | Reference Path |
|---|---|---|---|
| mnemosyne | validation_target | ATSはProject Mnemosyne Phase 1のテンプレート適用検証対象である | `docs/projects/mnemosyne/memory/project-summary.md` |
| note-content | derived_from | ATS開発過程をnote記事へ展開する | 未確定 |

## References

- `docs/phases/phase-1-memory-foundation.md`
- `docs/memory/memory-policy.md`
- `docs/memory/memory-taxonomy.md`
- `docs/memory/context-source-priority.md`
- `docs/projects/ats/memory/current-status.md`
- `docs/projects/ats/memory/active-decisions.md`
- `docs/projects/ats/memory/next-actions.md`
- `docs/projects/ats/memory/ai-entrypoint.md`

## Change History

| Version | Date | Status | Change Summary | Approved By |
|---|---|---|---|---|
| 0.1.0 | 2026-06-05 | draft | M1-5 ATS適用検証用にProject Summary初期ドラフトを作成。 | 未承認 |
| 1.0.0 | 2026-06-05 | active | P1修正としてStable Factsの根拠表現を補強し、Active化。 | こうちゃん |
