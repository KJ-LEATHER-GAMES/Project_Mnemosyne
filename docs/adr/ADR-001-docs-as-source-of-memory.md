---

title: "ADR-001: Markdown docs and ADRs as the Source of Memory"
document_id: "docs/adr/ADR-001-docs-as-source-of-memory.md"
adr_id: "ADR-001"
status: "draft"
version: "0.1.0"
created_at: "2026-06-04"
updated_at: "2026-06-04"
phase: "Phase 1: Memory Foundation"
milestone: "M1-1: Memory Policy定義"
decision_scope: "Memory Source of Truth"
related_documents:

* "docs/phases/phase-1-memory-foundation.md"
* "docs/memory/memory-policy.md"
* "docs/adr/ADR-002-memory-source-of-truth-boundary.md"
* "docs/adr/ADR-003-human-approved-memory-update.md"
  supersedes: null
  superseded_by: null

---

# ADR-001: Markdown docs and ADRs as the Source of Memory

## 1. Status

`draft`

本ADRは、レビューおよび承認後に `active` へ変更する。

---

## 2. Context

Project Mnemosyneは、AIとの会話、設計判断、タスク、課題、記事メモなどを、後続のAI利用で再参照可能な外部記憶として管理するための基盤である。

この基盤を構築するにあたり、最初に決める必要があるのは、**どの情報を正しい情報源として扱うか**である。

AIとの会話には、以下の内容が同時に含まれる。

* 既に確定した判断
* 検討中の案
* 採用されなかった選択肢
* 一時的な質問
* 作業依頼
* 感情や気づきのメモ
* 後から修正される前提情報

これらを整理せずにAIチャット履歴だけへ依存すると、AIが古い方針や未確定案を現在有効な判断として参照する危険がある。

また、将来的にはNotion、PostgreSQL、Vector Store、Context Pack、MCP、複数のAIクライアントを利用する可能性がある。その場合、初期段階で正本を明確にしなければ、媒体ごとに異なる情報が残り、「どれが正しいのか」が判断できなくなる。

Phase 1の目的は、自動化や検索基盤を先に作ることではなく、**人間が読め、AIが参照でき、変更理由を追跡できる記憶構造と運用ルールを確立すること**である。

---

## 3. Decision

Phase 1において、Project Mnemosyneの記憶に関する正本を以下のとおり定義する。

| 情報種別          | 正本として管理する内容                                        |
| ------------- | -------------------------------------------------- |
| Markdown docs | プロジェクト概要、現在状態、有効な判断一覧、次アクション、運用ルール、分類ルール、Context方針 |
| ADR           | 重要な設計判断、採用理由、代替案、影響、判断変更の履歴                        |

### 3.1 Markdown docs の位置づけ

Markdown docsは、現在のプロジェクト状態および運用ルールを、人間とAIの双方が参照しやすい形式で保持する正本とする。

主な対象は以下とする。

```text
docs/memory/memory-policy.md
docs/memory/memory-taxonomy.md
docs/memory/memory-update-flow.md
docs/memory/context-source-priority.md

docs/projects/{project_code}/memory/project-summary.md
docs/projects/{project_code}/memory/current-status.md
docs/projects/{project_code}/memory/active-decisions.md
docs/projects/{project_code}/memory/next-actions.md
docs/projects/{project_code}/memory/ai-entrypoint.md
```

### 3.2 ADR の位置づけ

ADRは、重要な判断について、単に結論だけでなく以下を記録する正本とする。

* なぜ判断が必要になったか
* どの選択肢を比較したか
* 何を採用したか
* なぜ採用したか
* どのような影響があるか
* 後に判断が変更された場合、何に置換されたか

### 3.3 Markdown docs と ADR の役割分担

| 確認したい内容           | 優先して参照する文書    |
| ----------------- | ------------- |
| 現在どのルールで運用するか     | Markdown docs |
| 現在のプロジェクト状態は何か    | Markdown docs |
| 次に何を実施するか         | Markdown docs |
| なぜその方針を採用したか      | ADR           |
| どの選択肢を却下したか       | ADR           |
| 判断がいつ、どのように変更されたか | ADR           |

Markdown docsとADRは、いずれも正本である。ただし、同一の役割を重複して担うのではなく、**現在有効な運用情報はMarkdown docs、重要判断の理由と履歴はADR**として分担する。

---

## 4. Rationale

### 4.1 人間が直接読める

Phase 1では、記憶基盤のルール自体を検証しながら改善する必要がある。

Markdown docsとADRは、専用UIやデータベース操作を必要とせず、人間が直接読み、レビューし、修正できる。

### 4.2 Gitによる差分管理と相性がよい

Markdown文書で管理することで、以下を追跡しやすい。

* いつ何を変更したか
* どの判断が追加されたか
* どのルールが置き換えられたか
* AIが作成した案をどのように採用したか

### 4.3 AIへ渡しやすい

Markdownは、ChatGPT、Cursor、Claude、Codex系CLIなど、複数のAIクライアントへそのまま参照させやすい。

Phase 2以降でContext Packを生成する場合も、入力元として扱いやすい。

### 4.4 自動化を急がず、ルールを先に確立できる

Phase 1では、PostgreSQL、RAG、MCP、API、自動同期などを先に導入しない。

まずMarkdown docsとADRによって、記憶の分類、状態、更新判断、正本境界を検証する方が、後続実装の手戻りを抑えられる。

### 4.5 特定ツールへの依存を避けられる

Notionや特定AIサービスを正本にすると、ツールの制約、閲覧権限、エクスポート形式、サービス変更の影響を受ける。

Markdown docsとADRを正本に置くことで、特定サービスに依存しない記憶資産を維持できる。

---

## 5. Alternatives Considered

### 5.1 AIチャット履歴を正本とする

#### 概要

AIとの会話履歴を、そのままプロジェクト記憶として扱う。

#### 却下理由

* 確定事項と検討中の内容が混在する
* 古い方針が残り続ける
* 判断理由や現在状態を抽出しにくい
* AIクライアントを変更した際に再利用しにくい
* 文書単位でレビュー・更新しにくい

AIチャット履歴は、一次メモとしては有用だが、正本には適さない。

---

### 5.2 Notionを正本とする

#### 概要

NotionデータベースやNotionページを、プロジェクト記憶の中心に置く。

#### 却下理由

* Phase 1で必須とする必要性がまだ確認できていない
* Markdown運用とNotion運用の同期ルールが先に必要になる
* AIが参照する際の取得方法や状態管理が複雑化する
* Gitによる文書差分管理よりも設計判断の追跡性が低下し得る

Notionは、一覧性や可視化が必要になった場合の任意の副本として扱う。

---

### 5.3 PostgreSQLをPhase 1から正本とする

#### 概要

Decision、Task、Issue、Memory Stateなどを初期段階からDBへ構造化して管理する。

#### 却下理由

* 記憶単位や状態遷移ルールが確定する前にスキーマを固定することになる
* Phase 1の目的である運用ルール検証より、実装作業が先行する
* 修正コストが大きい
* 人間可読性およびレビューの容易さが下がる

PostgreSQLの位置づけは、後続フェーズで改めて判断する。

---

### 5.4 Context Packを正本とする

#### 概要

AIへ渡すContext Packを、そのまま現在の正しい情報として扱う。

#### 却下理由

* Context Packは特定タスク向けに情報を抽出・圧縮した生成物である
* 元の文書が更新された場合、Context Packが古くなる
* すべての判断理由や履歴を保持する用途ではない
* 再生成可能な成果物を正本にすると更新責任が曖昧になる

Context Packは、正本から生成されるAI入力用成果物とする。

---

## 6. Consequences

### 6.1 Positive Consequences

* どの文書を現在の根拠として参照すべきか明確になる
* AIチャット内の検討事項と、確定済みの判断を分離できる
* 重要判断の理由と変更履歴を追跡できる
* Gitによる差分確認とレビューが可能になる
* Phase 2以降のContext Pack生成元が明確になる
* Notion、DB、RAG、MCP導入時の境界判断を行いやすくなる

### 6.2 Negative Consequences

* 会話で決まった内容をMarkdown docsまたはADRへ反映する手間が発生する
* 正本への反映が行われないと、会話内の重要判断が記録漏れとなる
* Markdown docsとADRの役割を守らない場合、重複や矛盾が生じる

### 6.3 Mitigation

上記の負担およびリスクに対して、以下を後続成果物として整備する。

* `docs/memory/memory-update-flow.md`
* `docs/memory/context-source-priority.md`
* `docs/memory/memory-taxonomy.md`
* 必要に応じた更新チェックリスト

---

## 7. Implementation Guidance

### 7.1 Phase 1で正本として作成する文書

```text
docs/memory/memory-policy.md
docs/memory/memory-taxonomy.md
docs/memory/memory-update-flow.md
docs/memory/context-source-priority.md

docs/adr/ADR-001-docs-as-source-of-memory.md
docs/adr/ADR-002-memory-source-of-truth-boundary.md
docs/adr/ADR-003-human-approved-memory-update.md
```

### 7.2 各プロジェクトの記憶文書

Phase 1の検証では、以下の構成でプロジェクト単位の記憶文書を管理する。

```text
docs/projects/{project_code}/memory/
  project-summary.md
  current-status.md
  active-decisions.md
  next-actions.md
  ai-entrypoint.md
```

### 7.3 状態管理

本ADRを含む正本文書は、以下の状態を使用する。

| 状態           | 扱い                   |
| ------------ | -------------------- |
| `draft`      | 検討中であり、確定判断として参照しない  |
| `active`     | 現在有効な判断として参照する       |
| `superseded` | 新しい判断へ置換された履歴として保持する |
| `deprecated` | 非推奨であり、現在判断の根拠にしない   |
| `archived`   | 完了または保管対象として保持する     |

---

## 8. Scope Boundary

本ADRが決定するのは、**Phase 1においてMarkdown docsとADRを記憶の正本とすること**である。

本ADRでは、以下を決定しない。

* PostgreSQL導入後にどの情報をDB正本とするか
* Notionを実際に導入するか
* Vector Storeの製品または構成
* Context Packの生成フォーマット
* MCPやAPIの実装方式
* Agentの具体的な実装方式

これらは後続フェーズまたは別ADRで判断する。

---

## 9. Related Decisions

| ADR                                          | 関係                          |
| -------------------------------------------- | --------------------------- |
| `ADR-002-memory-source-of-truth-boundary.md` | 正本、副本、一次メモ、生成物、将来基盤の境界を定義する |
| `ADR-003-human-approved-memory-update.md`    | AIが正本へ反映する際の承認ルールを定義する      |

---

## 10. Review Checklist

* [ ] Phase 1でMarkdown docsを正本とすることに問題がないか
* [ ] ADRを重要判断の正本として扱うことに問題がないか
* [ ] AIチャット履歴を一次メモとして扱うことに問題がないか
* [ ] Notion、PostgreSQL、Context Packを本ADRで正本化しない方針に問題がないか
* [ ] Markdown docsとADRの責務分担が明確か
* [ ] 後続フェーズへ保留する判断範囲が妥当か

---

## 11. Change History

| Version | Date       | Status | Summary                                             |
| ------- | ---------- | ------ | --------------------------------------------------- |
| 0.1.0   | 2026-06-04 | draft  | Phase 1における記憶正本としてMarkdown docsおよびADRを採用する初版ドラフトを作成 |
