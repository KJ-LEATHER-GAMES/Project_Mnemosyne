---
title: "Source Status Policy"
document_id: "docs/context/source-status-policy.md"
document_role: "context_source_status_policy"
status: "active"
version: "1.0.0"
created_at: "2026-06-08"
updated_at: "2026-06-08"
phase: "Phase 2: Context Forge"
milestone: "M2-2: Project Registry定義"
related_documents:
  - "config/projects.yaml"
  - "docs/context/context-pack-structure.md"
  - "docs/context/context-pack.template.md"
  - "docs/phases/phase-2-context-forge.md"
  - "docs/phases/phase-2-input-requirements.md"
  - "docs/memory/memory-taxonomy.md"
  - "docs/memory/context-source-priority.md"
---

# Source Status Policy

## 1. Status

`active`

---

## 2. Purpose

本書は、Phase 2: Context Forge において、Context Pack生成時に参照するsourceのstatusをどのように扱うかを定義する。

Project Registryの `source_status_policy` は、本書の方針に基づいて、プロジェクト単位でsourceの採用・除外・警告・根拠利用可否を制御する。

---

## 3. Scope

### 3.1 In Scope

本書では以下を扱う。

- source statusの扱い
- Context Packへの投入可否
- draft / proposed / archived等の警告ルール
- 確定判断の根拠として扱えるstatus
- `required_memory_docs` とContext Pack投入対象の分離
- optional source / ADR source / review sourceの採用条件
- Source List / Warnings / Build Reportへの出力ルール

### 3.2 Out of Scope

本書では以下を扱わない。

- Agentごとのrequired_context定義
- RAG検索時のranking rule
- Vector indexのchunk status制御
- 正本文書そのもののstatus変更手順
- Active化承認フローの詳細

---

## 4. Source Status Definitions

| Status | Meaning | Context Handling |
|---|---|---|
| `active` | 現在有効な文書または記憶 | 通常の根拠として扱える |
| `accepted` | ADR等で採用済みの判断 | 通常の根拠として扱える |
| `draft` | 下書き | 明示指定時のみwarning付きで含める |
| `proposed` | 提案中 | 候補として扱い、確定根拠にはしない |
| `superseded` | 置き換え済み | 履歴比較時のみ含める |
| `deprecated` | 非推奨 | 原則除外。含める場合はwarning必須 |
| `archived` | 保管のみ | 履歴目的でのみ含める |
| `unknown` | status不明 | 確定根拠にしない |

---

## 5. Policy IDs

### 5.1 `active_only`

activeまたはacceptedのsourceのみをContext Packへ含める。

| Status | Include | Handling |
|---|:---:|---|
| `active` | yes | 通常根拠 |
| `accepted` | yes | 通常根拠 |
| `draft` | no | 除外 |
| `proposed` | no | 除外 |
| `superseded` | no | 除外 |
| `deprecated` | no | 除外 |
| `archived` | no | 除外 |
| `unknown` | no | 除外 |

#### Use Case

- 確定判断レビュー
- Active成果物作成
- 既存方針との整合確認
- 仕様の正本確認

---

### 5.2 `active_preferred`

activeまたはacceptedを優先する標準policy。

draft / proposed / archived等は、通常は除外する。  
ただし、Task RequestまたはAdditional Sourcesで明示指定された場合は、warning付きで含めることができる。

| Status | Include by Default | Explicit Include | Handling |
|---|:---:|:---:|---|
| `active` | yes | yes | 通常根拠 |
| `accepted` | yes | yes | 通常根拠 |
| `draft` | no | yes | warning付き。未確定情報 |
| `proposed` | no | yes | warning付き。提案情報 |
| `superseded` | no | yes | warning付き。履歴情報 |
| `deprecated` | no | yes | warning付き。非推奨情報 |
| `archived` | no | yes | warning付き。保管情報 |
| `unknown` | no | conditional | warning付き。確定根拠禁止 |

#### Use Case

- 通常のContext Pack生成
- 設計レビュー
- 要件定義ドラフト作成
- 実装レビュー

---

### 5.3 `active_preferred_draft_allowed_with_warning`

active / acceptedを優先しつつ、draft sourceを明示的に含めるpolicy。

draftを含める場合は、Warningsに必ず `draft_source_included` を出力する。

| Status | Include | Handling |
|---|:---:|---|
| `active` | yes | 通常根拠 |
| `accepted` | yes | 通常根拠 |
| `draft` | yes | warning付き。作業対象またはレビュー対象 |
| `proposed` | conditional | warning付き。提案情報 |
| `superseded` | no | 原則除外 |
| `deprecated` | no | 原則除外 |
| `archived` | no | 原則除外 |
| `unknown` | no | 原則除外 |

#### Use Case

- Active化前レビュー
- draft文書の修正
- M2成果物のドラフトレビュー
- 差分案作成

---

### 5.4 `include_archived_for_history`

履歴確認用のpolicy。

archived / superseded / deprecatedを含めることができるが、確定判断の根拠にはしない。

| Status | Include | Handling |
|---|:---:|---|
| `active` | yes | 現在有効な根拠 |
| `accepted` | yes | 現在有効な根拠 |
| `draft` | conditional | warning付き |
| `proposed` | conditional | warning付き |
| `superseded` | yes | 履歴情報 |
| `deprecated` | yes | 非推奨履歴 |
| `archived` | yes | 保管情報 |
| `unknown` | conditional | warning付き |

#### Use Case

- 過去経緯の確認
- 置き換え前後の比較
- ADRの判断変遷確認
- Phase完了レビュー

---

## 6. Required Memory Docs Policy

### 6.1 Definition

`required_memory_docs` は、Project Registryが対象プロジェクトの標準記憶構造を満たしているか確認するための存在検証対象である。

### 6.2 Standard Required Memory Docs

標準構成は以下の5文書とする。

```yaml
required_memory_docs:
  - "project-summary.md"
  - "current-status.md"
  - "active-decisions.md"
  - "next-actions.md"
  - "ai-entrypoint.md"
````

### 6.3 Prohibited Interpretation

以下の解釈は禁止する。

```text
required_memory_docs = Context Packへ常時全文投入する文書
```

### 6.4 Context Inclusion Rule

Context Packへ実際に含める文書は、以下に基づいて決定する。

1. Agent Registryの `required_context`
2. Agent Registryの `optional_context`
3. Task Request
4. Additional Sources
5. Source Status Policy
6. Token Budget
7. Build Rule

### 6.5 Missing Required Memory Docs

`required_memory_docs` に指定された文書が存在しない場合、Context BuilderまたはProject Registry validationは以下を行う。

* Build Reportに `missing_required_doc` を出力する
* WarningsまたはErrorsに不足文書を出力する
* Context Pack生成を継続するか停止するかはBuild Ruleに従う

M2-2時点の推奨初期動作は以下とする。

| Situation                 | Recommended Behavior |
| ------------------------- | -------------------- |
| `project-summary.md` がない  | error                |
| `current-status.md` がない   | error                |
| `active-decisions.md` がない | error                |
| `next-actions.md` がない     | error                |
| `ai-entrypoint.md` がない    | error                |

---

## 7. Source Type Handling

| Source Type         | Meaning                           | Default Handling     |
| ------------------- | --------------------------------- | -------------------- |
| `memory_doc`        | project memory配下の標準記憶文書           | Agent要求に応じて採用        |
| `optional_source`   | Project Registryのoptional_sources | Taskに応じて採用           |
| `adr_source`        | ADR source                        | active / acceptedを優先 |
| `review_source`     | review文書                          | Taskに応じて採用           |
| `phase_doc`         | Phase計画・入力要件                      | Taskに応じて採用           |
| `requirement_doc`   | 要件定義文書                            | Taskに応じて採用           |
| `template`          | template文書                        | template更新時に採用       |
| `code`              | ソースコード                            | 実装レビュー時に採用           |
| `recent_context`    | 直近会話要約                            | Active正本より下位         |
| `additional_source` | ユーザー明示指定source                    | Task Contextとして採用候補  |

---

## 8. Optional / ADR / Review Source Selection Rules

### 8.1 `optional_sources`

`optional_sources` は、Task Request、Agent Registry、Additional Sources、またはBuild Ruleにより要求された場合にContext Pack投入候補とする。

`optional_sources` は、Project Registryに登録されているだけではContext Packへ自動投入しない。

`optional_sources` の主な用途は以下である。

* タスク固有の設計文書を追加する
* 実装レビュー時に関連ソースコードを追加する
* 特定PhaseやMilestoneの文書を追加する
* Agentの専門性に応じて追加文脈を与える

### 8.2 `adr_sources`

`adr_sources` は、設計判断、方針確認、競合解決、Active化レビュー時に優先的に参照する。

activeまたはacceptedのADRは、同一論点において以下より上位の根拠として扱う。

* draft文書
* proposed文書
* recent context
* conversation summary
* review source
* additional source

ただし、ADR sourceも常時全文投入対象ではない。
Task Request、Agent Registry、Build Rule、Source Status Policy、token budgetに基づき選定する。

ADR sourceに競合がある場合、Context Builderは以下を行う。

* Warningsに `adr_conflict_detected` を出力する
* Build Reportに競合sourceを記録する
* 確定判断を避け、Issue候補として扱う

### 8.3 `review_sources`

`review_sources` は、完了条件確認、Active化レビュー、検証履歴確認、過去指摘事項の追跡に使用する。

review sourceは、判断の経緯や検証結果として扱う。
ただし、設計判断そのものの正本は、active memory docsまたはaccepted ADRを優先する。

`review_sources` は、Project Registryに登録されているだけではContext Packへ自動投入しない。

主な用途は以下である。

* Active化前レビュー
* Phase完了レビュー
* P0/P1修正履歴の確認
* 過去のテスト結果確認
* 未解決Issueの追跡

---

## 9. Warning Rules

Context Builderは以下の場合、Warningsに明示する。

| Warning Type                       | Trigger                                      |
| ---------------------------------- | -------------------------------------------- |
| `missing_required_doc`             | `required_memory_docs` の存在検証に失敗した            |
| `required_memory_doc_not_declared` | 標準5文書の一部が `required_memory_docs` に宣言されていない   |
| `invalid_required_memory_doc_path` | `required_memory_docs` に空文字、絶対パス、`../` が含まれる |
| `draft_source_included`            | draft sourceを含めた                             |
| `proposed_source_included`         | proposed sourceを含めた                          |
| `archived_source_included`         | archived sourceを含めた                          |
| `deprecated_source_included`       | deprecated sourceを含めた                        |
| `superseded_source_included`       | superseded sourceを含めた                        |
| `unknown_status`                   | statusを判定できなかった                              |
| `conflict_detected`                | source間で競合が見つかった                             |
| `adr_conflict_detected`            | ADR間またはADRと他source間で競合が見つかった                 |
| `recent_context_conflict`          | Recent ContextがActive正本と競合した                 |
| `source_excluded`                  | policyによりsourceを除外した                         |
| `source_pattern_not_found`         | source patternに一致するファイルが見つからなかった             |
| `invalid_source_pattern`           | source patternが空文字、絶対パス、`../` を含む            |
| `token_budget_exceeded`            | token budgetを超えた                             |

---

## 10. Build Report Requirements

Build Reportには、最低限以下を出力する。

| Item                   |   Required  | Description                |
| ---------------------- | :---------: | -------------------------- |
| `project_code`         |     yes     | 対象project                  |
| `source_status_policy` |     yes     | 適用policy                   |
| `required_docs_check`  |     yes     | 標準5文書の存在検証結果               |
| `included_sources`     |     yes     | 採用source一覧                 |
| `excluded_sources`     |     yes     | 除外source一覧                 |
| `warnings`             |     yes     | warning一覧                  |
| `errors`               |     yes     | error一覧                    |
| `token_estimate`       | recommended | token見積もり                  |
| `generation_result`    |     yes     | success / warning / failed |

---

## 11. Write Policy Boundary

Source Status Policyは、sourceをどう読むかを定義する。
Write Policyは、Context生成後にAIが何をしてよいかを定義する。

M2-2時点では、Project Registryの標準 `write_policy` は `draft_only` とする。

### 11.1 `draft_only`

AIは以下を行える。

* draft文書を作成する
* review結果を作成する
* update proposalを作成する
* diff案を作成する
* warning / issue候補を作成する

AIは以下を行ってはならない。

* active文書を直接更新する
* draftをactive扱いする
* proposedをdecision扱いする
* archivedを現在有効な根拠として扱う
* 人間承認なしに正本statusを変更する

---

## 12. Acceptance Criteria

本書は以下を満たすため、M2-2のActive成果物として扱う。

* `required_memory_docs` が存在検証対象であることを明記している
* `required_memory_docs` が常時全文投入対象ではないことを明記している
* active / accepted / draft / proposed / superseded / deprecated / archived / unknown の扱いを定義している
* optional source / ADR source / review sourceの採用条件を定義している
* Warnings / Source List / Build Reportへの出力方針を定義している
* Project Registryの `source_status_policy` と接続できる
* `write_policy` との責務境界が明確である

---

## 13. Revision History

| Version | Date       | Status | Summary                                                                                          | Author    |
| ------- | ---------- | ------ | ------------------------------------------------------------------------------------------------ | --------- |
| 0.1.0   | 2026-06-08 | draft  | M2-2 Project Registry定義に合わせ、source status policyの初版を作成。                                          | user / AI |
| 1.0.0   | 2026-06-08 | active | P0/P1レビュー結果を反映し、optional / ADR / review sourceの採用条件、required_memory_docsの禁止解釈、warning rulesを明確化。 | user / AI |
