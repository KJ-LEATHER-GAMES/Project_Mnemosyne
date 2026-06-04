---
title: "ADR-002: Memory Source of Truth Boundary"
document_id: "docs/adr/ADR-002-memory-source-of-truth-boundary.md"
adr_id: "ADR-002"
status: "active"
version: "1.0.0"
created_at: "2026-06-04"
updated_at: "2026-06-04"
approved_at: "2026-06-04"
phase: "Phase 1: Memory Foundation"
milestone: "M1-1: Memory Policy定義"
decision_scope: "Boundary Between Sources, Replicas, Primary Notes, Generated Artifacts, and Interfaces"
related_documents:
  - "docs/phases/phase-1-memory-foundation.md"
  - "docs/memory/memory-policy.md"
  - "docs/adr/ADR-001-docs-as-source-of-memory.md"
  - "docs/adr/ADR-003-human-approved-memory-update.md"
supersedes: null
superseded_by: null
---

# ADR-002: Memory Source of Truth Boundary

## 1. Status

`active`

---

## 2. Context

Project Mnemosyneでは、AI外部記憶を実現するために、Markdown docs、ADR、AIチャット履歴、Context Pack、Notion、PostgreSQL、Vector Store / RAG、API / MCP等を扱う可能性がある。

これらはすべて情報利用に関係するが、目的と信頼性は同一ではない。たとえば、AIチャット履歴は未整理情報を含み、Context Packはタスク向けに加工された情報であり、Vector Storeは検索のための副本となる。

媒体の責務を分けない場合、生成物や古い副本が正本として誤認され、AIが誤った判断を再利用する危険がある。このため、Phase 1で情報源の境界を明示する。

---

## 3. Decision

Project Mnemosyneにおける情報源を、以下の区分で扱う。

| 区分 | 定義 |
|---|---|
| 正本 | 内容の正しさを判断する際の公式な基準となる情報源 |
| 副本 | 正本を補助するための可視化用・一覧管理用・検索用の複製または整理情報 |
| 一次メモ | 検討途中・未整理・未承認の情報を含む入力材料 |
| 生成物 | 正本等を入力として作成され、必要に応じて再生成可能な成果物 |
| 接続手段 | 情報源にアクセスするインターフェースであり、情報の正本性を持たないもの |
| 将来判断対象 | Phase 1では実装または正本化せず、後続Phaseで責務を判断する対象 |

### 3.1 Phase 1での媒体別位置づけ

| 媒体・仕組み | Phase 1での役割 | 区分 | Phase 1判断 |
|---|---|---|---|
| Markdown docs | 状態、運用ルール、判断一覧、タスク等の記録 | 正本 | 採用する |
| ADR | 重要判断、理由、影響、変更履歴の記録 | 正本 | 採用する |
| AIチャット履歴 | 考察、相談、未整理情報、記憶化候補の入力 | 一次メモ | そのまま正本にしない |
| Context Pack | AIへ渡すために正本文書等を加工した文脈 | 生成物 | 位置づけのみ確定。生成実装はPhase 2対象 |
| Notion | 人間向けの可視化・一覧管理 | 任意の副本 | 導入必須としない |
| PostgreSQL | 構造化記憶・状態管理の候補 | 将来判断対象 | Phase 1では使用しない |
| Vector Store / RAG | 関連情報を取得する検索副本・検索機構 | 将来判断対象 | Phase 1では使用しない |
| API / MCP | 記憶への接続インターフェース | 接続手段 | Phase 1では実装しない |

---

## 4. Boundary Rules

### 4.1 Markdown docs と ADR

Markdown docsおよびADRは、Phase 1の正本である。

| 文書 | 管理責務 |
|---|---|
| Markdown docs | 現在利用するルール、現在状況、次アクション、整理済み記憶 |
| ADR | 重要判断の背景、比較した選択肢、採用理由、影響、変更履歴 |

両者が矛盾する場合、AIは一方を自動的に採用せず、矛盾をIssueとして提示し、人間が修正方針を決定する。

### 4.2 AIチャット履歴

AIチャット履歴は一次メモである。

- 会話内で合意したように見える内容でも、正本へ反映されるまでは正本として扱わない。
- 再利用すべき情報は、要約・分類・レビュー後にMarkdown docsまたはADRへ反映する。
- 未確認の推測をFactまたはDecisionとして正本化しない。

### 4.3 Context Pack

Context Packは、AIが特定作業を行うために必要な文脈を、正本文書等から抽出・加工した生成物である。

- Context Packは正本ではない。
- Context Packが正本と矛盾する場合、正本を優先する。
- 正本更新後は、古いContext Packを正本として修正管理するのではなく、原則として再生成対象とする。
- Phase 1では、Context Packを生成物と位置づける判断のみを行う。
- Context Packの標準構成、生成処理、出力先、更新手順はPhase 2で定義する。

### 4.4 Notion

Notionは、導入する場合も任意の副本とする。

- タスク、進捗、記事メモ等の可視化用途に利用できる。
- Notionにのみ存在する重要判断は、正本へ反映されるまで確定判断として扱わない。
- 正本と矛盾する場合は、Markdown docsまたはADRを優先する。
- Notion DB設計および同期自動化はPhase 1対象外とする。

### 4.5 PostgreSQL

PostgreSQLは、将来的に構造化されたMemoryや状態管理を担う候補であるが、Phase 1では実装せず、正本として扱わない。

後続Phaseでは、以下を別途判断する必要がある。

- DBを正本とする情報種別
- Markdown docs / ADRとの責務境界
- 同期方向および更新起点
- 履歴管理方式
- 矛盾時の優先順位

### 4.6 Vector Store / RAG

Vector StoreおよびRAGは、将来の検索副本・検索機構として扱う。

- 埋め込みデータおよび検索結果は正本ではない。
- 検索結果の根拠は元の正本文書で確認する。
- 状態が古い文書の検索混入対策は後続Phaseで設計する。

### 4.7 API / MCP

APIおよびMCPは情報源ではなく、情報源へアクセスするための接続手段である。

- APIやMCPの応答の正本性は、返却元となる情報源に依存する。
- MCP自体を正本とは扱わない。
- 実装は後続Phaseで行う。

---

## 5. Reference Priority Principles

本ADRでは、情報源間の基本的な優先原則のみを確定する。詳細な参照順序、同一種別・同一状態の情報が競合した場合の手順、矛盾解消フローは `docs/memory/context-source-priority.md` で定義する。

| 原則 | 内容 |
|---|---|
| RP-01 | `active` なMarkdown docsおよびADRは、副本・一次メモ・生成物より優先される |
| RP-02 | `draft` の情報は検討中として扱い、確定根拠にしない |
| RP-03 | `superseded`、`deprecated`、`archived` の利用範囲は状態定義に従う |
| RP-04 | 副本または生成物と正本が矛盾する場合、正本を優先する |
| RP-05 | `active` な正本同士が矛盾する場合、AIは判断を確定せずIssue化する |

---

## 6. Rationale

### 6.1 媒体の目的を混同しないため

現在状況、判断理由、検索インデックス、AI入力用文脈、可視化ビューは目的が異なる。正本性を分離することで、便利な媒体を追加しても判断根拠を維持できる。

### 6.2 段階的な実装を可能にするため

Phase 1では文書運用を確立し、Phase 2以降でContext生成、検索、接続、構造化管理を導入する。先に境界を定義することで、不確定な運用を誤って実装へ固定するリスクを抑える。

### 6.3 AIの誤参照を防止するため

AIへ提供される情報が正本か生成物かを明記することで、古いContext Packや未整理の会話を確定情報として利用する危険を減らす。

---

## 7. Alternatives Considered

### 7.1 すべての媒体を同等に扱う

**却下。** 矛盾時の判断ができず、古い副本や生成物を正本と誤認する危険がある。

### 7.2 Notionを正本兼ビューとして利用する

**Phase 1では却下。** 同期責任と履歴管理を先に設計する必要があり、初期検証の複雑度を高める。

### 7.3 Phase 1からDB中心で管理する

**却下。** 情報分類や更新運用が確定する前に構造が固定され、文書運用の検証より実装が先行する。

---

## 8. Consequences

### 8.1 Positive Consequences

- 媒体ごとの正本性と責務が明確になる。
- Context PackやRAG等を安全に導入しやすくなる。
- NotionやDBを追加した場合も、正本境界を再判断できる。
- AIが未確定情報を参照するリスクを抑えられる。

### 8.2 Negative Consequences

- 正本から副本・生成物への同期または再生成運用が将来必要になる。
- Phase 1では検索性や一覧性より、手動レビューと文書整備を優先することになる。
- PostgreSQL等を採用する場合、境界変更のADRが追加で必要となる。

---

## 9. Scope Boundary

本ADRは、Phase 1における情報源の区分と基本境界を確定する。

本ADRでは、以下を確定しない。

- Notionの導入可否および具体的DB設計
- PostgreSQLを正本として採用する時期・範囲
- Vector Store / RAGの技術方式
- Context Packの構成、生成処理、出力先
- API / MCPの実装構成
- 正本間矛盾の詳細な解消手順

---

## 10. Related Decisions

| ADR | 関係 |
|---|---|
| `ADR-001-docs-as-source-of-memory.md` | Markdown docsおよびADRをPhase 1の正本とする |
| `ADR-003-human-approved-memory-update.md` | AIのドラフト権限と人間による正本更新を定義する |

---

## 11. Review Record

| Item | Result |
|---|---|
| Context Packの区分 | 生成物として採用。生成実装はPhase 2へ委譲 |
| Notionの区分 | 任意の副本として採用 |
| PostgreSQLのPhase 1正本化 | 不採用。後続Phase判断とする |
| 詳細な参照優先手順 | 本ADRでは基本原則のみ。別文書へ委譲 |

---

## 12. Change History

| Version | Date | Status | Summary |
|---|---|---|---|
| 0.1.0 | 2026-06-04 | draft | 情報源境界の初版ドラフトを作成 |
| 1.0.0 | 2026-06-04 | active | Context PackのPhase境界と参照優先の責務委譲を明確化しActive化 |
