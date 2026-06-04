---
title: "ADR-001: Markdown docs and ADRs as the Source of Memory"
document_id: "docs/adr/ADR-001-docs-as-source-of-memory.md"
adr_id: "ADR-001"
status: "active"
version: "1.0.0"
created_at: "2026-06-04"
updated_at: "2026-06-04"
approved_at: "2026-06-04"
phase: "Phase 1: Memory Foundation"
milestone: "M1-1: Memory Policy定義"
decision_scope: "Memory Source of Truth"
related_documents:
  - "docs/phases/phase-1-memory-foundation.md"
  - "docs/memory/memory-policy.md"
  - "docs/adr/ADR-002-memory-source-of-truth-boundary.md"
  - "docs/adr/ADR-003-human-approved-memory-update.md"
supersedes: null
superseded_by: null
---

# ADR-001: Markdown docs and ADRs as the Source of Memory

## 1. Status

`active`

---

## 2. Context

Project Mnemosyneは、AIとの会話、設計判断、タスク、課題、記事メモ等を、後続作業で再利用可能な外部記憶として管理する基盤である。

AIチャット履歴には、確定判断だけでなく、仮説、作業途中の案、採用されなかった選択肢、未整理の情報が混在する。会話履歴のみを記憶の根拠にすると、未確定情報や古い判断が現在有効な方針として参照される危険がある。

また、将来的にはNotion、Context Pack、PostgreSQL、Vector Store、MCP等を利用する可能性がある。複数媒体を導入する前に、Phase 1で人間が確認でき、AIが参照でき、差分管理可能な初期正本を決める必要がある。

---

## 3. Decision

Phase 1において、Project Mnemosyneの記憶に関する初期正本を以下とする。

| 情報種別 | 正本として管理する内容 |
|---|---|
| Markdown docs | プロジェクト概要、現在状況、有効な判断一覧、次アクション、運用ルール、分類ルール、Context方針 |
| ADR | 重要な設計判断、採用理由、代替案、影響、判断変更履歴 |

### 3.1 役割分担

| 確認したい内容 | 優先して確認する正本 |
|---|---|
| 現在どのルールで運用するか | Markdown docs |
| 現在の状態・次アクションは何か | Markdown docs |
| なぜその方針を採用したか | ADR |
| 何を比較し、何を却下したか | ADR |
| 重要判断が何に置換されたか | ADR |

Markdown docsは現在の運用状態を示し、ADRは重要判断の根拠と履歴を示す。両者が矛盾する場合、AIは独自に一方を正として確定せず、矛盾をIssueとして提示し、人間による修正判断を必要とする。

### 3.2 Phase 1検証用の初期配置

Phase 1では、Mnemosyne自身およびATSへの適用検証のため、以下の文書配置を検証用初期配置として使用する。

```text
docs/projects/{project_code}/memory/
  project-summary.md
  current-status.md
  active-decisions.md
  next-actions.md
  ai-entrypoint.md
```

この配置はPhase 1の検証を進めるための初期構成であり、将来の最終的な正本配置方式を確定するものではない。

---

## 4. Rationale

### 4.1 人間が直接レビューできる

Markdown docsおよびADRは、専用システムを用いずに内容を確認・修正できる。記憶運用ルールを検証するPhase 1では、人間可読性が最優先である。

### 4.2 Gitによる差分管理が可能である

文書の追加・修正・置換を差分として追跡できるため、判断変更の経緯や正本更新の妥当性を確認しやすい。

### 4.3 複数AIクライアントへ再利用しやすい

Markdownは、ChatGPT、Cursor、Claude等へ参照情報として提供しやすく、Phase 2以降のContext Pack生成元としても適する。

### 4.4 実装より先に運用ルールを検証できる

DBや検索基盤を導入する前に、何を記憶し、何を正本とし、どう更新するかを確定できる。これにより、後続実装でのスキーマや同期方式の手戻りを抑えられる。

### 4.5 特定サービスへの依存を抑えられる

Notion等の外部SaaSを初期正本にせず、移植性の高いMarkdown文書を採用することで、ツール変更時にも記憶資産を維持できる。

---

## 5. Alternatives Considered

### 5.1 AIチャット履歴を正本とする

**却下。** 確定事項と検討事項が混在し、状態管理・差分レビュー・他クライアントへの再利用が困難である。AIチャット履歴は一次メモとして利用する。

### 5.2 Notionを正本とする

**Phase 1では却下。** 一覧性は高いが、同期責任、更新履歴、Markdown文書との競合ルールを先に必要とする。Notionは任意の副本として位置づける。

### 5.3 PostgreSQLをPhase 1から正本とする

**却下。** 記憶分類や更新ルールが固まる前にスキーマ実装が先行する。PostgreSQLの正本性は後続Phaseで判断する。

### 5.4 Context Packを正本とする

**却下。** Context Packはタスク向けに抽出・加工される生成物であり、正本更新後には再生成すべき対象である。

---

## 6. Consequences

### 6.1 Positive Consequences

- 現在参照すべき情報源が明確になる。
- AIチャット内の検討過程と確定済みの判断を分離できる。
- 判断理由と変更履歴を追跡できる。
- Context Pack、Notion、将来の検索基盤を安全に追加しやすくなる。

### 6.2 Negative Consequences

- 会話で決まった内容を正本文書へ反映する手間が発生する。
- 正本更新を怠ると、重要判断が一次メモに留まる。
- Markdown docsとADRの責務が曖昧になると重複や矛盾が発生する。

### 6.3 Mitigation

- `docs/memory/memory-update-flow.md` で更新手順を定義する。
- `docs/memory/context-source-priority.md` で矛盾検知・解決手順を定義する。
- `docs/memory/memory-taxonomy.md` で分類基準を定義する。

---

## 7. Scope Boundary

本ADRは、Phase 1においてMarkdown docsおよびADRを初期正本として採用する判断を確定する。

本ADRでは、以下を確定しない。

- 全プロジェクト記憶をMnemosyne側へ集中管理するか、各プロジェクト側を正本とするか
- Notionを実際に導入するか
- PostgreSQLが将来どの情報種別の正本となるか
- Context Packの形式および生成処理
- Vector Store / RAG / API / MCPの実装方式

記憶の最終配置方式は、Phase 2以降で以下の案を比較して判断する。

| 案 | 概要 |
|---|---|
| 案A | Mnemosyne側で全プロジェクトの記憶を集中管理する |
| 案B | 各プロジェクト側の `docs/memory` を正本とし、Mnemosyneは参照・集約する |

---

## 8. Related Decisions

| ADR | 関係 |
|---|---|
| `ADR-002-memory-source-of-truth-boundary.md` | 正本、副本、一次メモ、生成物、将来基盤の境界を定義する |
| `ADR-003-human-approved-memory-update.md` | AIはdraftまでとし、正本反映を人間が行うことを定義する |

---

## 9. Review Record

| Item | Result |
|---|---|
| Markdown docs / ADR をPhase 1の初期正本とする | 採用 |
| AIチャット履歴を正本とする | 不採用。一次メモとして扱う |
| `docs/projects/{project_code}/memory/` を最終配置として確定する | 不採用。Phase 1検証用初期配置とする |
| Context Packを正本とする | 不採用。生成物として扱う |

---

## 10. Change History

| Version | Date | Status | Summary |
|---|---|---|---|
| 0.1.0 | 2026-06-04 | draft | Phase 1における記憶正本の初版ドラフトを作成 |
| 1.0.0 | 2026-06-04 | active | 配置の暫定性と正本間矛盾時の扱いを明確化しActive化 |
