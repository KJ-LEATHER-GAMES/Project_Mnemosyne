---

title: "ADR-002: Memory Source of Truth Boundary"
document_id: "docs/adr/ADR-002-memory-source-of-truth-boundary.md"
adr_id: "ADR-002"
status: "draft"
version: "0.1.0"
created_at: "2026-06-04"
updated_at: "2026-06-04"
phase: "Phase 1: Memory Foundation"
milestone: "M1-1: Memory Policy定義"
decision_scope: "Boundary Between Sources, Replicas, Primary Notes, and Generated Artifacts"
related_documents:

* "docs/phases/phase-1-memory-foundation.md"
* "docs/memory/memory-policy.md"
* "docs/adr/ADR-001-docs-as-source-of-memory.md"
* "docs/adr/ADR-003-human-approved-memory-update.md"
  supersedes: null
  superseded_by: null

---

# ADR-002: Memory Source of Truth Boundary

## 1. Status

`draft`

本ADRは、レビューおよび承認後に `active` へ変更する。

---

## 2. Context

Project Mnemosyneでは、AI外部記憶を実現するために、複数の媒体および仕組みを利用する可能性がある。

想定される要素は以下である。

* Markdown docs
* ADR
* AIチャット履歴
* Context Pack
* Notion
* PostgreSQL
* Vector Store / RAG
* API / MCP

これらはすべて「情報に関係する仕組み」ではあるが、役割は同一ではない。

たとえば、AIチャット履歴には検討途中の情報が含まれ、Context PackはAI入力向けに加工された情報であり、Vector Storeは検索を効率化するための索引・副本として機能する。

これらをすべて同じ信頼度で扱うと、以下の問題が起こる。

* 生成物が正本として誤認される
* 古いContext Packが現在有効な方針として使われる
* NotionとMarkdown docsが矛盾した場合に判断できない
* 将来のDBや検索結果が、設計判断の根拠と混同される
* AIが会話上の案を確定事項として扱う

したがって、Phase 1で媒体ごとの責務と正本性を明確に分離する必要がある。

---

## 3. Decision

Project Mnemosyneにおける情報源を、以下の区分で管理する。

| 区分     | 定義                                     |
| ------ | -------------------------------------- |
| 正本     | 内容の正しさを判断する際の公式な基準となる情報源               |
| 副本     | 正本を補助するための表示用、検索用、一覧管理用の複製または整理情報      |
| 一次メモ   | 未整理情報、検討途中の内容、正本化前の情報                  |
| 生成物    | 正本または一次メモを入力として作成され、必要に応じて再生成可能な成果物    |
| 接続手段   | 情報源へアクセスするためのインターフェースであり、情報そのものではない    |
| 将来判断対象 | Phase 1では採用・実装せず、後続フェーズで正本性や責務を再判断する対象 |

---

## 4. Source Boundary Definition

### 4.1 Phase 1での媒体別位置づけ

| 媒体・仕組み             | Phase 1での役割                           | 区分     | 判断                  |
| ------------------ | ------------------------------------- | ------ | ------------------- |
| Markdown docs      | プロジェクト概要、状態、運用ルール、現在有効な判断一覧、次アクションの記録 | 正本     | Phase 1で採用する        |
| ADR                | 重要設計判断、採用理由、代替案、影響、変更履歴の記録            | 正本     | Phase 1で採用する        |
| AIチャット履歴           | 考察、相談、仮説、作業依頼、未整理情報の記録                | 一次メモ   | そのまま正本として扱わない       |
| Context Pack       | AIへ渡す文脈を用途別に加工した入力資料                  | 生成物    | 正本更新後に必要に応じて再生成する   |
| Notion             | 進捗、一覧、記事、タスク等の人間向け可視化                 | 任意の副本  | Phase 1では必須としない     |
| PostgreSQL         | 構造化された状態・記憶管理の候補                      | 将来判断対象 | Phase 1では正本として使用しない |
| Vector Store / RAG | 関連記憶を検索するための検索副本・検索機構                 | 将来判断対象 | Phase 1では使用しない      |
| API / MCP          | AIクライアントや外部アプリが記憶へ接続する手段              | 接続手段   | Phase 1では実装しない      |

---

## 5. Boundary Rules

### 5.1 Markdown docs と ADR

Markdown docsおよびADRは、Phase 1における正本である。

ただし、役割を以下のように分ける。

| 文書            | 管理責務                         |
| ------------- | ---------------------------- |
| Markdown docs | 現在利用するルール、現在状態、次アクション、整理済み記憶 |
| ADR           | 重要判断の背景、比較した選択肢、採用理由、影響、履歴   |

ADRに記録された判断を運用へ展開する必要がある場合、Markdown docsにも現在有効なルールとして反映する。

---

### 5.2 AIチャット履歴

AIチャット履歴は、正本化前の一次メモとする。

#### AIチャット履歴に含まれる可能性がある情報

* Fact候補
* Decision候補
* Task候補
* Issue候補
* Idea候補
* Article Note候補
* Conversation Summary候補
* 採用されなかった案
* 未確認の推測

#### 取り扱いルール

* 会話内で合意したように見える内容でも、正本へ反映されるまでは正本として扱わない。
* 再利用すべき情報は、分類・整理・レビュー後にMarkdown docsまたはADRへ反映する。
* 会話全体を無加工でContext Packや正本へ投入しない。

---

### 5.3 Context Pack

Context Packは、AIが特定の作業を行うために必要な情報をまとめた生成物とする。

#### Context Packに含め得る内容

* Project Summary
* Current Status
* Active Decisions
* Next Actions
* 関連するADR
* タスク固有の前提情報
* Agent Roleに必要な制約

#### 取り扱いルール

* Context Packは正本ではない。
* Context Packに記載があっても、元の正本文書と矛盾する場合は正本文書を優先する。
* 正本が更新された後、古いContext Packを手動修正して維持するのではなく、原則として再生成する。
* Context Pack作成手順および構成定義はPhase 2で扱う。

---

### 5.4 Notion

Notionは、必要に応じて利用する任意の副本とする。

#### 想定用途

* タスクや進捗の一覧表示
* 記事メモ管理
* 人間向けダッシュボード
* フィルタやビューによる可視化

#### 取り扱いルール

* Phase 1完了のためにNotion導入を必須としない。
* Notionにのみ存在する設計判断は、正本へ反映されるまで確定判断として扱わない。
* NotionとMarkdown docsまたはADRが矛盾する場合、正本を優先する。
* 自動同期の導入はPhase 1対象外とする。

---

### 5.5 PostgreSQL

PostgreSQLは、将来的に構造化された記憶や状態を管理する候補である。

#### 将来管理候補

* Memory Entry
* Decision
* Task
* Issue
* Status
* 更新履歴
* プロジェクト関連付け
* 検索用メタデータ

#### Phase 1での判断

Phase 1では、PostgreSQLを実装せず、正本としても扱わない。

#### 後続フェーズで判断すべき事項

* Markdown docsとPostgreSQLの責務境界
* DBが正本となる情報種別
* 文書とDBの同期方向
* 更新起点
* 履歴管理
* 矛盾時の優先順位
* 人間レビューの適用範囲

PostgreSQLが将来的に正本となり得ることは否定しないが、その決定は本ADRでは行わない。

---

### 5.6 Vector Store / RAG

Vector StoreおよびRAGは、将来の検索用副本・検索機構として扱う。

#### 取り扱いルール

* 検索対象となる情報の正しさは、元の正本によって担保する。
* 埋め込みデータや検索結果そのものを正本として扱わない。
* 古い文書由来の検索結果が返る可能性を前提とし、状態情報を考慮した検索設計を後続フェーズで行う。
* Phase 1では導入しない。

---

### 5.7 API / MCP

APIおよびMCPは、記憶そのものではなく、記憶へアクセスするための接続手段である。

#### 取り扱いルール

* APIやMCPの応答が情報を返しても、正本性は返却元の情報源に依存する。
* MCPを導入したとしても、MCP自体を正本と呼ばない。
* Phase 1では実装対象外とする。

---

## 6. Source Priority

同一論点について複数の情報が存在する場合、Phase 1では以下の優先順位を基本とする。

| 優先順位 | 情報源                          | 利用目的                   |
| ---: | ---------------------------- | ---------------------- |
|    1 | `active` なADR                | 重要判断の理由および決定内容の確認      |
|    2 | `active` なMarkdown docs      | 現在の運用、状態、タスク、整理済み情報の確認 |
|    3 | `draft` のADRまたはMarkdown docs | 検討中の案の確認               |
|    4 | Notion等の副本                   | 可視化された補助情報の確認          |
|    5 | Context Pack                 | AI作業用に集約された入力文脈の利用     |
|    6 | AIチャット履歴                     | 背景確認、記憶化候補抽出、検討経緯の確認   |

### 6.1 補足ルール

* `active` なADRと `active` なMarkdown docsが矛盾する場合、自動的に一方を正と断定せず、Issueとして扱う。
* Context PackやNotionが正本と矛盾する場合、正本を優先し、副本または生成物を更新対象とする。
* AIチャット履歴の記述が正本と矛盾する場合、正本を優先する。

詳細な矛盾解消フローは、`docs/memory/context-source-priority.md` で定義する。

---

## 7. Rationale

### 7.1 役割の異なる媒体を混同しないため

検索用データ、可視化用データ、AI入力用データ、判断履歴、現在状態は、それぞれ目的が異なる。

媒体の役割を分離することで、便利な副本や生成物を利用しながらも、正しい判断根拠を失わない。

### 7.2 段階的な実装を可能にするため

Phase 1ではMarkdown docsとADRによって運用ルールを検証する。

その結果をもとに、後続フェーズでContext Pack、検索、API、MCP、DBを追加することで、不確定な運用を先にシステム化するリスクを抑える。

### 7.3 AIの誤参照を防止するため

AIは、提供された情報が正本か、生成物か、一次メモかを自動的に完全判断できるとは限らない。

そのため、媒体ごとの正本性と優先順位を明文化し、AIが未確定情報や古い生成物を現在判断として採用することを防ぐ。

---

## 8. Alternatives Considered

### 8.1 すべての情報源を同等に扱う

#### 却下理由

* 矛盾時の判断ができない
* 古い情報が現在情報と混在する
* AIが誤った根拠を採用しやすい

---

### 8.2 Notionを可視化と正本の両方に使う

#### 却下理由

* Markdown docsとの同期責任が曖昧になる
* Phase 1で必要性が確認されていない機能へ依存する
* 設計判断の履歴管理が複雑になる

---

### 8.3 Phase 1からDB中心に設計する

#### 却下理由

* 情報分類と更新フローが固まる前に構造を固定してしまう
* 実装が先行し、運用判断の検証が後回しになる
* 初期フェーズの人間可読性を損なう

---

## 9. Consequences

### 9.1 Positive Consequences

* 各媒体の責務が明確になる
* 正本と生成物を混同しにくくなる
* Context Packや将来のRAGを安全に導入しやすくなる
* Notionを導入する場合も正本境界を維持できる
* PostgreSQL導入時に、改めて責務を判断する余地を残せる

### 9.2 Negative Consequences

* 同じ内容が複数媒体へ展開される場合、同期や再生成の運用が必要となる
* Phase 1では検索性や一覧性より、文書レビューを優先するため、手作業が残る
* 後続フェーズでDB正本性を再検討するADRが必要となる可能性がある

---

## 10. Implementation Guidance

### 10.1 Phase 1で使用する分類

| 区分       | 対象                                  |
| -------- | ----------------------------------- |
| 正本       | Markdown docs、ADR                   |
| 一次メモ     | AIチャット履歴、ラフメモ                       |
| 生成物      | Context Pack、AIドラフト、差分案、要約案         |
| 任意の副本    | Notion                              |
| 対象外・将来判断 | PostgreSQL、Vector Store、RAG、API、MCP |

### 10.2 後続で整備する文書

```text
docs/memory/memory-taxonomy.md
docs/memory/memory-update-flow.md
docs/memory/context-source-priority.md
```

---

## 11. Scope Boundary

本ADRは、Phase 1における情報源の区分と境界を定義する。

本ADRでは、以下を確定しない。

* Notionの具体的なDB設計
* PostgreSQLを導入する時期
* PostgreSQLが将来どの範囲で正本となるか
* Vector Storeの方式
* RAG検索アルゴリズム
* Context Packのフォーマット
* MCP / APIの実装構成

---

## 12. Related Decisions

| ADR                                       | 関係                                |
| ----------------------------------------- | --------------------------------- |
| `ADR-001-docs-as-source-of-memory.md`     | Markdown docsおよびADRをPhase 1の正本とする |
| `ADR-003-human-approved-memory-update.md` | 正本更新時に人間承認を必要とする                  |

---

## 13. Review Checklist

* [ ] 正本、副本、一次メモ、生成物、接続手段の定義に不足がないか
* [ ] Phase 1でMarkdown docsとADRのみを正本とすることに問題がないか
* [ ] Context Packを生成物として扱うことに問題がないか
* [ ] Notionを任意の副本とすることに問題がないか
* [ ] PostgreSQLを将来判断対象として保留することに問題がないか
* [ ] Vector Store / RAG / MCPを正本としない方針に問題がないか
* [ ] 優先順位と矛盾時の扱いが妥当か

---

## 14. Change History

| Version | Date       | Status | Summary                                         |
| ------- | ---------- | ------ | ----------------------------------------------- |
| 0.1.0   | 2026-06-04 | draft  | Phase 1における正本・副本・一次メモ・生成物・将来基盤の境界を定義する初版ドラフトを作成 |
