---
title: "Recent Context Policy"
document_id: "docs/context/recent-context-policy.md"
document_role: "recent_context_policy"
status: "active"
version: "1.0.0"
created_at: "2026-06-09"
updated_at: "2026-06-09"
phase: "Phase 2: Context Forge"
milestone: "M2-4: Context Build Request定義"
owner: "Project Mnemosyne"
review_status: "active"
related_documents:
  - "docs/context/context-build-rule.md"
  - "docs/context/context-pack-structure.md"
  - "docs/context/source-status-policy.md"
  - "docs/memory/memory-taxonomy.md"
  - "docs/memory/context-source-priority.md"
  - "src/types/context.ts"
---

# Recent Context Policy

## 1. Status

`active`

本書は、M2-4：Context Build Request定義におけるRecent Conversation Context / Conversation Summary / Session Contextの扱いを定義するActive成果物である。

---

## 2. Purpose

本書は、Context Builderが直近会話由来の情報をContext Packへ含める際の扱いを定義する。

特に以下を明確化する。

- Session Context
- Recent Conversation Context
- Conversation Summary
- Active sourceとの優先順位
- 競合時の扱い
- Context Packへの出力方法
- 正本化されていない情報の扱い

---

## 3. Definitions

### 3.1 Session Context

Session Contextとは、今回のContext Build RequestまたはCLI入力で直接渡された一時情報である。

Examples:

- 今回だけのreview観点
- 今回だけの補足メモ
- 今回だけの制約
- CLIの `--session-note`
- Request YAMLの `session_context.notes`

Session Contextは正本ではない。

Session Contextは今回のContext Pack生成に閉じる補助情報であり、Active sourceと競合する場合はActive sourceを優先する。

### 3.2 Recent Conversation Context

Recent Conversation Contextとは、直近会話から抽出された、作業補助用の文脈である。

Examples:

- 直近会話で確認されたが未Active化の修正方針
- 直近会話で出たIssue候補
- 直近会話で合意されたが正本文書未反映の候補
- Conversation Summaryから抽出されたTask候補

Recent Conversation Contextは正本ではない。

Recent Conversation Contextは、Active memory docsやActive ADRへ反映される前の候補情報を、今回作業の文脈補助として扱うためのものである。

### 3.3 Conversation Summary

Conversation Summaryとは、会話の終端または節目で、fact / decision / task / issue等の分類に従って整理された会話要約である。

Conversation Summaryは、Recent Conversation Contextの入力sourceになり得る。

ただし、Conversation Summary自体もActive memory documentsやActive ADRより下位の補助情報である。

Conversation Summary上の `decision` は、Active ADRまたはActive memory docsへ反映されるまでは、確定DecisionではなくDecision candidateとして扱う。

---

## 4. Source Boundary

| Context Type | Source Example | Source of Truth | Default Priority |
|---|---|:---:|---:|
| Active ADR | `docs/adr/*.md` | yes | 1 |
| Active memory docs | `docs/projects/{project}/memory/*.md` | yes | 2 |
| Active phase / requirement docs | `docs/phases/*.md`, `docs/requirements/*.md` | yes | 3 |
| Additional Sources | CLI `--source` | no / depends on status | 4 |
| Session Context | CLI notes / Request YAML notes | no | 5 |
| Recent Conversation Context | Conversation Summary extract | no | 6 |
| Context Pack | generated markdown | no | 7 |

Session Context、Recent Conversation Context、Conversation Summaryは、Active sourceより優先してはならない。

---

## 5. Inclusion Rule

### 5.1 Session Context Inclusion

Session Contextは、Context Build Requestで明示された場合に含める。

```yaml
session_context:
  include: true
```

`include: false` または未指定で、`notes` / `review_viewpoints` / `temporary_constraints` が存在しない場合、Context Packには以下のように出力する。

```text
Not included.
```

`include: false` または未指定で、`notes` / `review_viewpoints` / `temporary_constraints` が存在する場合、Context Builderは `include: true` へ正規化する。

この正規化は、CLIの `--session-note` / `--review-viewpoint` とYAML入力の挙動を揃えるためである。

Context Builderは必要に応じて `session_context_auto_included` をinfoとしてBuild Reportへ記録してよい。

### 5.2 Recent Context Inclusion

Recent Contextは、Context Build Requestで明示された場合のみ含める。

```yaml
recent_context:
  include: true
  source: "conversation-summary"
```

`include: false` または未指定の場合、Context Packには以下のように出力する。

```text
Not included.
```

`include: true` かつ `source` 未指定の場合、Context Builderは以下へdefault補完する。

```yaml
recent_context:
  include: true
  source: "conversation-summary"
```

この正規化は、M2-4初期版で正式対応するRecent Context sourceが `conversation-summary` のみであるためである。

Context Builderは必要に応じて `recent_context_source_defaulted` をinfoとしてBuild Reportへ記録してよい。

### 5.3 Supported Recent Context Source

M2-4 Active版では、正式sourceは以下のみとする。

| Source | Description | Handling |
|---|---|---|
| `conversation-summary` | 会話要約からRecent Contextを取得する | supported |

将来候補:

- `chat-log`
- `manual-recent-context-file`
- `memory-search-result`

Conversation Summaryの正式保存先はM2-5以降で確定する。

---

## 6. Classification Rule

Conversation SummaryからRecent Conversation Contextへ取り込む場合は、memory taxonomyに合わせて分類する。

| Category | Include by Default | Handling |
|---|:---:|---|
| `fact` | yes | Active sourceと照合し、未反映候補として扱う |
| `decision` | conditional | Active source未反映ならDecision candidateとして扱う |
| `task` | yes | Task candidateとして扱う。Task正本ではない |
| `preference` | conditional | 作業方針に影響する場合のみ含める |
| `constraint` | yes | Active constraintと競合しないか確認する |
| `issue` | yes | Issue candidateとして扱う |
| `idea` | conditional | 今回taskに関係する場合のみ含める |
| `article_note` | conditional | article_writer等の場合のみ含める |
| `conversation_summary` | yes | 全体文脈として要約利用可 |
| `test_result` | conditional | 検証review時のみ含める |

`decision` は特に注意する。Conversation Summary上のdecisionは、Active ADRまたはActive memory docへ反映されるまでは、確定DecisionではなくDecision candidateとして扱う。

---

## 7. Conflict Handling

### 7.1 Conflict with Active Source

Session ContextまたはRecent Conversation ContextがActive sourceと競合する場合、Active sourceを優先する。

Context Builderは以下を行う。

1. Context PackのWarningsへ記録する
2. Build Reportへ競合sourceを記録する
3. Session / Recent Context側を確定根拠として使わない
4. 必要に応じてIssue candidateとして出力する

Warning examples:

| Warning Type | Trigger |
|---|---|
| `session_context_conflict` | Session ContextがActive sourceと競合 |
| `recent_context_conflict` | Recent ContextがActive sourceと競合 |
| `conversation_summary_conflict` | Conversation SummaryとActive sourceが競合 |

### 7.2 Conflict Within Recent Context

Conversation Summary内で情報が矛盾する場合、Context Builderは確定判断を避ける。

Handling:

- Warningsへ `recent_context_internal_conflict` を出力する
- Context PackのRecent Conversation Context章に「conflict candidate」として記載する
- Active sourceへ未反映のIssue候補として扱う

---

## 8. Retention and Expiration

Recent Contextは、永続的な正本ではない。

M2-4 Active版では、以下を推奨defaultとする。

| Field | Default | Description |
|---|---:|---|
| `max_items` | 20 | 取り込む最大項目数 |
| `max_age_days` | 30 | 直近文脈として扱う最大日数 |
| `include_resolved` | false | 解決済み項目は原則除外 |
| `include_archived` | false | archived会話要約は原則除外 |

ただし、Phase完了レビューや履歴確認では、`max_age_days` を拡張してよい。

---

## 9. Output Rule in Context Pack

### 9.1 Session Context Section

Context Packの `## 8. Session Context` には以下を出力する。

- Request-specific context
- Temporary constraints
- Review viewpoints
- Manual notes

Session Contextがない場合:

```text
Not included.
```

### 9.2 Recent Conversation Context Section

Context Packの `## 9. Recent Conversation Context` には以下を出力する。

- Recent confirmed context candidates
- Recent issue candidates
- Recent decision candidates
- Recent task candidates
- Handling notes

Recent Contextがない場合:

```text
Not included.
```

### 9.3 Handling Note

Recent Conversation Context章には、必ず以下の趣旨を含める。

```text
Recent Conversation Context is not a source of truth.
It must not override Active source documents.
```

---

## 10. Request Schema Connection

`recent_context` の標準形は以下とする。

```yaml
recent_context:
  include: true
  source: "conversation-summary"
  max_items: 20
  max_age_days: 30
  include_resolved: false
  include_archived: false
```

`recent_context.include=true` かつ `source` 未指定の場合は、`source: "conversation-summary"` をdefault補完する。

`session_context` の標準形は以下とする。

```yaml
session_context:
  include: true
  notes:
    - "今回の補足"
  review_viewpoints:
    - "確認観点"
  temporary_constraints:
    - "今回だけの制約"
```

`session_context.include=false` または未指定で、notes等が存在する場合は `include: true` へ正規化する。

---

## 11. Validation Rules

| Field | Rule | Error / Warning / Info |
|---|---|---|
| `recent_context.source` | `conversation-summary` のみ正式対応 | unsupported valueはerror |
| `recent_context.include=true` + `source`未指定 | `conversation-summary` へdefault補完 | info |
| `recent_context.max_items` | 正の整数 | 不正値はerror |
| `recent_context.max_age_days` | 正の整数 | 不正値はerror |
| `session_context.notes` | string[] | string以外はerror |
| `session_context.review_viewpoints` | string[] | string以外はerror |
| `session_context.temporary_constraints` | string[] | string以外はerror |
| `session_context.include=false` + notes等あり | `include=true` へ正規化 | info |

---

## 12. Acceptance Criteria

M2-4の本書は、以下を満たす。

- [x] Session Contextの定義が明確である。
- [x] Recent Conversation Contextの定義が明確である。
- [x] Conversation Summaryの位置づけが明確である。
- [x] Recent Contextが正本ではないことを明記している。
- [x] Active sourceとの競合時の扱いが定義されている。
- [x] Context Packの該当章へどう出力するかが定義されている。
- [x] `recent_context.include=true` かつ `source` 未指定時のdefault補完を定義している。
- [x] `session_context.include=false` かつnotes等ありの場合の正規化を定義している。
- [x] `src/types/context.ts` と対応している。

---

## 13. Follow-up Items

| ID | Issue | Candidate Resolution |
|---|---|---|
| M2-4-REV-P2-002 | Conversation Summaryの保存先をどこにするか | M2-5以降で確定 |
| M2-4-RC-OI-002 | Recent Contextの取得をCLI実装でどこまで自動化するか | 初期版は明示指定時のみ。M2-5以降で拡張 |
| M2-4-RC-OI-003 | 会話要約内decisionをどの時点でActive Decisionへ昇格するか | Human approval後にActive memory docs / ADRへ反映 |

---

## 14. Revision History

| Version | Date | Status | Summary | Author |
|---|---|---|---|---|
| 0.1.0 | 2026-06-09 | draft | Session Context / Recent Conversation Context / Conversation Summaryの扱いを定義。 | user / AI |
| 1.0.0 | 2026-06-09 | active | P0/P1レビュー結果を反映し、recent context default、session auto include、Conversation Summary保存先の後続扱いを明確化。 | user / AI |
