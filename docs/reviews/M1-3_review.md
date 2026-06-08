# M1-3：6テンプレート Active化レビュー結果

## 判定：**Conditional Go / 必須修正後にActive化可能**

6テンプレートは、M1-3の目的である「同一構造をMnemosyne・ATS等へ適用する」ための骨格として成立しています。M1-3の元計画では、6テンプレートを作成し、MnemosyneとATSの双方へ適用でき、Phase 2で機械的に読み込める一定の章構成を持つことが完了条件です。

ただし、現時点のドラフトには **Active方針との不整合1件、固定章構成の逸脱1件、正本責務の重複2件、metadata標準化不足1件** が存在します。これらを修正せずにActive化すると、後続のContext BuilderおよびRecall Engineで、状態判定・競合参照・機械読込が不安定になります。

### 確認対象

* [M1-1 Active成果物 ZIP](sandbox:/mnt/data/project-mnemosyne-m1-1-active-final.zip)
* [M1-2 Active成果物 ZIP](sandbox:/mnt/data/m1-2-active-memory-taxonomy-context-source-priority.zip)
* [M1-3 第1分冊ドラフト ZIP](sandbox:/mnt/data/m1-3-template-drafts-part1.zip)
* [M1-3 第2分冊ドラフト ZIP](sandbox:/mnt/data/m1-3-template-drafts-part2.zip)
* [Phase 1作業計画書](sandbox:/mnt/data/phase-1-memory-foundation.md)
* [Phase 3要件定義書](sandbox:/mnt/data/phase-requirements-3.md)

---

# 1. 総合レビュー結果

| 観点                       |       判定 | 結論                                                                  |
| ------------------------ | -------: | ------------------------------------------------------------------- |
| 6テンプレートの役割分離             |     PASS | 安定情報・現在地・判断・Task・AI入口・会話候補の分離は妥当                                    |
| M1-2の `task_status` 反映   |     PASS | `next-actions` および `current-status` へ適切に反映済み                        |
| M1-2の `review_status` 反映 | **FAIL** | `conversation-summary` が `archived` を除外しておりActive方針と不一致             |
| 固定章構成の維持                 | **FAIL** | `project-summary` の `## Out of Scope` が `### Out of Scope` に変更されている |
| Conflict Issueの責務配置      |  **要修正** | `current-status` と `active-decisions` で競合一覧が重複                      |
| Metadataの機械読込性           |  **要修正** | M1-1/M1-2 Active文書とM1-3テンプレートでfrontmatter項目が不統一                     |
| Mnemosyneへのコピー適用         |    条件付き可 | 必須修正後、M1-4で5基本文書を作成可能                                               |
| ATSへのコピー適用               |    条件付き可 | 必須修正後、M1-5で実データ検証可能                                                 |
| Conversation Summaryの適用  |        可 | 初期5文書ではなく、会話単位で生成する運用が適切                                            |
| Phase 2 / Phase 3接続性     |    条件付き可 | 状態語と参照責務を整理すれば接続可能                                                  |

---

# 2. Active化前の必須修正項目

## P0-01：`conversation-summary.template.md` の `review_status` をM1-2 Active定義へ合わせる

### 現状

第2分冊ドラフトでは、以下の方針になっています。

```text
review_status: draft / reviewed / reflected
review_status: archived は使用しない
```

しかし、M1-2のActive成果物である `memory-taxonomy.md` および `context-source-priority.md` では、Conversation Summaryの `review_status` は以下の4値で確定しています。

| review_status | 扱い                     |
| ------------- | ---------------------- |
| `draft`       | 未レビュー。通常参照不可           |
| `reviewed`    | 内容確認済み。経緯確認・候補抽出の補助参照可 |
| `reflected`   | 必要な正本反映確認済み。文脈復元に利用可   |
| `archived`    | 履歴確認時のみ参照可             |

### 修正方針

`conversation-summary.template.md` は、以下の定義へ修正する必要があります。

```text
review_status: draft / reviewed / reflected / archived
```

また、次の記載は削除します。

```text
review_status: archived は使用しない。保管状態は共通 status: archived で表す。
```

### 判定

| 項目          | 判定                   |
| ----------- | -------------------- |
| 修正要否        | **必須**               |
| Active化への影響 | 修正完了までActive化不可      |
| 理由          | ActiveなM1-2方針との直接不整合 |

---

## P0-02：`project-summary.template.md` の `Out of Scope` を独立した第2階層見出しへ戻す

### 現状

Phase 1作業計画書では、固定章構成として以下が定義されています。

```md
## Scope

## Out of Scope
```

しかし、第1分冊ドラフトでは以下になっています。

```md
## Scope

### In Scope

### Out of Scope
```

M1-3の完了条件には、Phase 2で機械的に読み込める一定の章構成が求められています。`Out of Scope` を第3階層へ移動すると、章名ベースで読み込む処理に対して破壊的変更になります。

### 修正方針

以下の構成へ戻します。

```md
## Scope

- {対象に含める責務、機能、成果物}

## Out of Scope

- {明示的に対象外とする責務、機能、成果物}
```

### 判定

| 項目          | 判定                  |
| ----------- | ------------------- |
| 修正要否        | **必須**              |
| Active化への影響 | 修正完了までActive化不可     |
| 理由          | M1-3で定義済みの固定章構成から逸脱 |

---

## P0-03：frontmatterの共通schemaを6テンプレートで統一する

### 現状

M1-1 / M1-2のActive文書は、概ね以下のfrontmatter構造を持っています。

```yaml
title:
document_id:
status:
version:
created_at:
updated_at:
approved_at:
phase:
milestone:
related_documents:
```

一方、M1-3テンプレートでは以下が追加・変更されています。

```yaml
document_role:
project_code:
project_name:
last_reviewed_at:
applicability_scope:
source_path:
```

追加自体は妥当ですが、**文書自身の識別子として `source_path` を使っている点**は整理が必要です。M1-2では `source_path` はFact、Task、Decision等の根拠追跡に用いる用語であり、文書自体の識別子には既存の `document_id` を使う方が一貫します。

### 採用すべき共通frontmatter

6テンプレートの基本文書では、以下を標準とするのが妥当です。

```yaml
---
title: "{project_name} {document_title}"
document_role: "{document_role}"
document_id: "docs/projects/{project_code}/memory/{document_name}.md"
project_code: "{project_code}"
project_name: "{project_name}"
status: "draft"
version: "0.1.0"
created_at: "YYYY-MM-DD"
updated_at: "YYYY-MM-DD"
approved_at: null
last_reviewed_at: null
related_documents: []
---
```

Conversation Summaryのみ、以下を追加します。

```yaml
review_status: "draft"
source_type: "conversation"
source_reference: "{chat_or_log_reference}"
```

### 用語の使い分け

| 項目                  | 用途                                        |
| ------------------- | ----------------------------------------- |
| `document_id`       | 当該Markdown文書自身の識別子・保存先                    |
| `source_path`       | Fact / Decision / Task / Issue等の根拠となる文書パス |
| `related_documents` | 関連する正本・ADR・Review文書への参照                   |

### 判定

| 項目          | 判定                                |
| ----------- | --------------------------------- |
| 修正要否        | **必須**                            |
| Active化への影響 | Phase 2機械読込を前提にすると必須              |
| 理由          | 自己識別子と根拠参照を分離し、既存Active文書と整合させるため |

---

## P0-04：Conflict Issue一覧の正本を `current-status.md` に一本化する

### 現状

以下の2テンプレートが、ともに競合Issue一覧を保持しています。

| テンプレート                         | 該当章                          |
| ------------------------------ | ---------------------------- |
| `current-status.template.md`   | `## Active Source Conflicts` |
| `active-decisions.template.md` | `## Open Decision Conflicts` |

しかし、M1-2 Active方針では、Active正本間競合について以下の責務が確定しています。

| 情報                 | 記録先                                                  |
| ------------------ | ---------------------------------------------------- |
| 競合の正式記録            | `docs/review/context-source-conflicts/{issue_id}.md` |
| Projectの現状としての競合参照 | `current-status.md`                                  |
| 修正作業               | `next-actions.md`                                    |
| 重要判断の変更            | ADRまたはActive Decision                                |

`active-decisions.md` にも競合一覧を持たせると、`current-status.md` との間でIssue ID、`blocked_scope`、解消状態がずれる可能性があります。

### 修正方針

`active-decisions.template.md` の以下の章は削除します。

```md
## Open Decision Conflicts
```

代わりに、`Active Decisions` または `Active Constraints` の説明コメントへ次の趣旨を残します。

```text
Conflict IssueがopenであるscopeのDecision / Constraintは、
解消までActive一覧へ登録しない。
競合参照は current-status.md と正式Conflict Issue文書で管理する。
```

### 判定

| 項目          | 判定                         |
| ----------- | -------------------------- |
| 修正要否        | **必須**                     |
| Active化への影響 | 競合管理の二重化を解消してからActive化     |
| 理由          | M1-2で定義した責務境界と単一参照元を維持するため |

---

# 3. 追加管理項目の採否

## 3.1 採用する項目

| 追加項目                        | 対象テンプレート                      |       採否 | 理由                                        |
| --------------------------- | ----------------------------- | -------: | ----------------------------------------- |
| `document_role`             | 全6件                           |       採用 | Phase 2 / Phase 3で文書役割を判定しやすい             |
| `project_code`              | 全6件                           |       採用 | Project分離に必須                              |
| `project_name`              | 全6件                           |       採用 | 人間可読性を確保                                  |
| `version`                   | 全6件                           |       採用 | Active化・置換・レビュー履歴を追跡可能                    |
| `created_at` / `updated_at` | 全6件                           |       採用 | 鮮度確認に必要                                   |
| `approved_at`               | 全6件                           |       採用 | draftからactiveへの承認点を明示可能                   |
| `last_reviewed_at`          | 全6件                           |       採用 | Current StatusやAI入口の棚卸し時点を把握可能            |
| `source_path` / `as_of`     | Fact・Decision・Task等の表行        |       採用 | M1-2の根拠追跡要件に一致                            |
| `related_adr`               | Decision / Constraint         |       採用 | 判断理由へ遡れる                                  |
| `supersedes`                | Decision                      |       採用 | 置換履歴を扱える                                  |
| `task_status`               | Next Actions / Current Status | **必須採用** | M1-2で確定済み                                 |
| `review_status`             | Conversation Summary          | **必須採用** | M1-2で確定済み                                 |
| `conflict_status`           | Current Statusの競合参照           |       採用 | M1-2のConflict Issue管理と一致                  |
| `Stable Facts`              | Project Summary               |       採用 | 安定したFactを `source_path` / `as_of` 付きで保持可能 |
| `Deprecated Decisions`      | Active Decisions              |       採用 | `deprecated` 状態を履歴として扱える                  |

---

## 3.2 修正して採用する項目

| 追加項目                      | 現状                                                             | 修正後の扱い                                                    |     判定 |
| ------------------------- | -------------------------------------------------------------- | --------------------------------------------------------- | -----: |
| `project_status`          | 複数テンプレートで個別定義                                                  | Project固有の進行状態として採用。ただしenum定義は1か所へ集約                      | 条件付き採用 |
| `issue_status`            | Current Statusで追加                                              | Project Issue進捗用として採用。共通 `status` とは別軸であることを明記            | 条件付き採用 |
| `reflection_status`       | `not_reviewed / pending / reflected / not_required / rejected` | 候補行ごとの正本反映追跡として採用。ただし文書 `review_status` と役割が重ならないよう定義を簡略化 | 条件付き採用 |
| `Current Execution Focus` | Task概要まで再掲                                                     | `current_focus_task_id` と優先理由のみ保持し、Task本文の複製を避ける          | 条件付き採用 |
| `Important Constraints`   | 制約本文をAI Entrypointにも保持                                         | Constraint IDと正本参照のみ記載し、制約本文の正本はActive Decisionsへ寄せる      | 条件付き採用 |

### `reflection_status` の推奨値

`not_reviewed` は文書全体の `review_status: draft` と意味が重なります。候補行の反映状況だけを管理するため、以下へ簡略化するのが妥当です。

```text
reflection_status:
- pending
- reflected
- not_required
- rejected
```

| 値              | 意味             |
| -------------- | -------------- |
| `pending`      | 反映要否または反映先が未確定 |
| `reflected`    | 指定した正本へ反映完了    |
| `not_required` | 正本反映不要と判断      |
| `rejected`     | 候補自体を採用しない     |

---

## 3.3 不採用または後続Phaseへ移す項目

| 項目                                        | 対象                     |               判定 | 理由                                                   |
| ----------------------------------------- | ---------------------- | ---------------: | ---------------------------------------------------- |
| `Foundational Constraints`                | `project-summary`      |               削除 | `active-decisions` の `Active Constraints` と責務が重複     |
| `Open Decision Conflicts`                 | `active-decisions`     |               削除 | 競合参照の正本は `current-status` とConflict Issue文書へ寄せる      |
| `Decision Maintenance Rules`              | `active-decisions`     |       削除またはコメント化 | M1-2 Active方針の再掲であり、各Project文書へ複製すると乖離リスクがある         |
| `Completion and Update Rules`             | `next-actions`         |       削除またはコメント化 | Task運用の共通ルールは `memory-taxonomy.md` が正本               |
| `Review Status Definition`                | `conversation-summary` |              簡略化 | 完全な定義表は `memory-taxonomy.md` に集約し、Summary側は値と参照先のみ記載 |
| `Context Builder / Recall Handover Notes` | `ai-entrypoint`        | M1-3 Active版から除外 | Phase 2 / Phase 3の生成・検索設定責務へ踏み込みすぎる                  |
| `Conditional Reading Routes`              | `ai-entrypoint`        |               採用 | 入口文書として必要。Context Builder設定とは異なり、人間/AIの参照判断に有効       |

---

# 4. テンプレートごとの修正判定

## 4.1 `project-summary.template.md`

| 観点                       |       判定 | 修正内容                                                   |
| ------------------------ | -------: | ------------------------------------------------------ |
| 基本役割                     |     PASS | 目的・背景・安定情報の保持に適合                                       |
| Stable Facts             |     PASS | `source_path` / `as_of` を持つ構成は妥当                       |
| Scope構成                  | **FAIL** | `## Out of Scope` を独立章へ戻す                              |
| Foundational Constraints |  **要削除** | Active Constraintsと重複するため削除                            |
| Source of Truth          |     要簡略化 | 文書カテゴリと正本パスの対応のみ保持し、参照ルール詳細はAI Entrypoint / Policyへ寄せる |

### Active版での役割

```text
目的・背景・対象範囲・安定Fact・関連Project・正本マップ
```

---

## 4.2 `current-status.template.md`

| 観点                      |       判定 | 修正内容                                            |
| ----------------------- | -------: | ----------------------------------------------- |
| 現在地把握                   |     PASS | 目的に適合                                           |
| `task_status` 参照        |     PASS | M1-2方針に一致                                       |
| Active Source Conflicts |     PASS | 競合参照の配置先として維持                                   |
| In Progress             | 条件付きPASS | `next-actions` のTask本文を複製せず、現在注目するTask IDの要約に限定 |
| Issue Status            |   条件付き採用 | enumを本テンプレートで明示し、共通 `status` と区別                |
| Pending Decisions       |     PASS | Active Decisionと未決定論点を分離できる                     |

### Active版での役割

```text
現在のPhase、進行状況、主要Task参照、Issue、Conflict Issue参照、Pending Decision
```

---

## 4.3 `active-decisions.template.md`

| 観点                         |       判定 | 修正内容                       |
| -------------------------- | -------: | -------------------------- |
| Active Decisions           |     PASS | 現行判断の一覧として適切               |
| Active Constraints         |     PASS | Constraint正本の格納先として維持      |
| Superseded Decisions       |     PASS | 置換履歴の管理に必要                 |
| Deprecated Decisions       |     PASS | 非推奨判断の履歴管理に必要              |
| Open Decision Conflicts    | **FAIL** | `current-status` と重複するため削除 |
| Decision Maintenance Rules |     要簡略化 | 共通ルールはM1-2正本へ寄せる           |

### Active版での役割

```text
現在有効なDecision / Constraintと、置換済み・非推奨の判断履歴
```

---

## 4.4 `next-actions.template.md`

| 観点                                   |     判定 | 修正内容              |
| ------------------------------------ | -----: | ----------------- |
| Task正本としての構成                         |   PASS | 目的に適合             |
| `task_status`                        |   PASS | M1-2の確定方針に一致      |
| Input / Output / Completion Criteria |   PASS | AIがTaskを誤解しにくい    |
| Current Execution Focus              | 条件付き採用 | Task IDと優先理由だけを保持 |
| Blockers / Dependencies              |   PASS | Taskの停止要因管理として有効  |
| Completion and Update Rules          |   要簡略化 | 共通運用ルールの再掲は避ける    |

### Active版での役割

```text
実施合意済みTask、優先度、成果物、完了条件、Task進捗、Task単位の依存関係
```

---

## 4.5 `ai-entrypoint.template.md`

| 観点                                      |   判定 | 修正内容                                      |
| --------------------------------------- | ---: | ----------------------------------------- |
| AI参照入口としての構成                            | PASS | M1-3目的に適合                                 |
| 基本読込対象4文書                               | PASS | Phase 2 Context構造とも整合                     |
| Conditional Reading Routes              | PASS | ADR・Review・Conversation Summaryの条件付き参照に有効 |
| Important Constraints                   |  要修正 | Constraint本文の重複保存を避け、IDと正本参照中心へ変更         |
| Conflict and Freshness Handling         | 要簡略化 | 詳細ルールはPolicyへ寄せ、AIの禁止動作だけ残す               |
| Context Builder / Recall Handover Notes | 除外推奨 | Phase 2 / Phase 3責務へ移す                    |
| Archived Summary参照                      |  要追記 | 履歴確認時のみ `review_status: archived` を参照可とする |

### Active版での役割

```text
AIが最初に読む文書、追加参照条件、AIが守るべき入口ルール、誤参照防止
```

---

## 4.6 `conversation-summary.template.md`

| 観点                               |       判定 | 修正内容                                             |
| -------------------------------- | -------: | ------------------------------------------------ |
| 会話を記憶候補へ変換する構成                   |     PASS | 目的に適合                                            |
| Confirmed / Candidate Decision分離 |     PASS | 未確定事項の誤利用防止に有効                                   |
| New Tasks / Issues / Ideas分離     |     PASS | Taxonomyとの整合が良い                                  |
| `review_status`                  | **FAIL** | `archived` を復活させる                                |
| `reflection_status`              |   条件付き採用 | 候補行の反映進捗に限定して簡略化                                 |
| Metadata重複                       |      要修正 | `status` / `review_status` の正式値はfrontmatterを正とする |
| Review Status Definition         |     要簡略化 | 詳細定義はTaxonomyへ参照させる                              |
| Reflection Checklist             |     PASS | 人間承認フローに有効                                       |

### Active版での役割

```text
会話要約、記憶候補抽出、正本反映候補、レビュー・反映追跡
```

---

# 5. 重複章の整理結果

## 5.1 章を残す正本側

| 情報                | 正本として保持するテンプレート        | 他テンプレートでの扱い                      |
| ----------------- | ---------------------- | -------------------------------- |
| 安定したFact          | `project-summary`      | 他文書では参照のみ                        |
| 現在地・Issue         | `current-status`       | AI Entrypointでは読込先として参照          |
| Conflict Issue参照  | `current-status`       | Active Decisionsでは掲載しない          |
| Active Decision   | `active-decisions`     | Current StatusではPendingのみ        |
| Active Constraint | `active-decisions`     | AI EntrypointではConstraint ID参照のみ |
| Task本文・進捗         | `next-actions`         | Current Statusでは重要Taskの要約のみ      |
| AI参照ルート           | `ai-entrypoint`        | Project Summaryでは正本マップのみ         |
| 会話抽出候補            | `conversation-summary` | 正本反映後は対象正本へ委譲                    |

---

## 5.2 削除・縮退対象

| 現在の章                                                      | 処置                   | 理由                            |
| --------------------------------------------------------- | -------------------- | ----------------------------- |
| `project-summary / Foundational Constraints`              | 削除                   | Active Constraintsと重複         |
| `active-decisions / Open Decision Conflicts`              | 削除                   | Current Statusの競合参照と重複        |
| `active-decisions / Decision Maintenance Rules`           | コメントまたはReferencesへ縮退 | Taxonomy / Source Priorityの再掲 |
| `next-actions / Completion and Update Rules`              | コメントへ縮退              | Taxonomyの再掲                   |
| `conversation-summary / Review Status Definition`         | 参照リンク中心に縮退           | Taxonomyの再掲                   |
| `ai-entrypoint / Context Builder / Recall Handover Notes` | 後続Phaseへ移管           | Context生成・検索設計の責務             |

---

# 6. 推奨する6テンプレートの責務境界

```text
project-summary.md
  └─ 変わりにくい目的・背景・Scope・安定Fact・正本マップ

current-status.md
  └─ 現在地・主要Issue・Conflict Issue参照・Pending Decision

active-decisions.md
  └─ 現在有効なDecision / Constraint・置換履歴・非推奨履歴

next-actions.md
  └─ 実施対象Task・優先度・成果物・完了条件・task_status

ai-entrypoint.md
  └─ AIが読む順序・条件付き参照先・入口で守るべき制約

conversation-summary.md
  └─ 会話単位の抽出候補・レビュー・正本反映追跡
```

この整理にすると、各文書が「似たことを少しずつ持つ」のではなく、**保持する情報の正本責務が明確**になります。

---

# 7. MnemosyneおよびATSへのコピー適用可否

## 7.1 Project Mnemosyneへの適用

M1-4では、Mnemosyne自身に以下の5文書を作成する計画になっています。

| 文書                    | 適用可否 | 記載可能な内容                                                       |
| --------------------- | ---: | ------------------------------------------------------------- |
| `project-summary.md`  | 修正後可 | 外部記憶基盤の目的、対象範囲、Phase構成                                        |
| `current-status.md`   | 修正後可 | M1-3完了状況、M1-4着手前の現在地                                          |
| `active-decisions.md` | 修正後可 | Markdown docs + ADR正本、AI draft-only、Agent / Project Context分離 |
| `next-actions.md`     | 修正後可 | M1-4、M1-5、Phase 1完了レビューのTask                                  |
| `ai-entrypoint.md`    | 修正後可 | Mnemosyne相談時の参照文書と制約                                          |

### Conversation Summaryの扱い

`conversation-summary.template.md` はMnemosyneへ適用可能ですが、初期記憶5文書のように空の常設文書を1件作るのではなく、必要な会話単位で生成する扱いが適切です。

```text
docs/projects/mnemosyne/memory/conversations/
  2026-06-05-m1-3-template-activation-review.md
```

### 判定

| 判定                   | 内容                |
| -------------------- | ----------------- |
| 構造適用可否               | **必須修正後に可**       |
| 実文書作成                | M1-4で実施           |
| Conversation Summary | 常設初期文書ではなく会話単位で生成 |

---

## 7.2 ATSへの適用

Phase 1計画では、ATSは実プロジェクトへテンプレートを当てて実用性を確認する検証対象であり、5つのmemory文書と検証記録を作成する方針です。

| 文書                    | 適用可否 | ATSで整理できる対象                       |
| --------------------- | ---: | --------------------------------- |
| `project-summary.md`  | 修正後可 | 家庭内ポイント制度をLINE Botとして実装する目的・Scope |
| `current-status.md`   | 修正後可 | MVP実装、責務整理、docs整備、検証状況            |
| `active-decisions.md` | 修正後可 | docs設計正本、Notion副本、冪等性、UseCase境界等  |
| `next-actions.md`     | 修正後可 | 実装・テスト・docs更新の優先Task              |
| `ai-entrypoint.md`    | 修正後可 | ATS相談時に読む設計文書・ADR・検証記録            |

### ATS適用で確認すべき実データ論点

| 確認対象                        | テンプレートでの受け先                                                           |
| --------------------------- | --------------------------------------------------------------------- |
| `processed_events` による冪等性判断 | `active-decisions.md`                                                 |
| cooldown判定の検証結果             | Test Result文書またはConversation Summaryからの反映候補                           |
| action_selectのTransaction境界 | `active-decisions.md` + 関連ADR / 設計docs                                |
| 次に行う実装・docs更新               | `next-actions.md`                                                     |
| 旧案・未決案・改善案                  | `current-status.md` のIssue / Pending Decision、またはConversation Summary |

### 判定

| 判定            | 内容                                                                        |
| ------------- | ------------------------------------------------------------------------- |
| 構造適用可否        | **必須修正後に可**                                                               |
| 実データを用いた充足性確認 | **未実施**。M1-5で実施すべき                                                        |
| ATSへの直接影響     | Mnemosyne側の `docs/projects/ats/memory/` に検証文書を作成するため、ATS実装リポジトリへの侵入を避けられる |

---

# 8. Conversation Summaryを初期5文書に含めない整理

M1-3のテンプレート成果物には `conversation-summary.template.md` が含まれていますが、M1-4 / M1-5で作成するProject初期記憶文書は5件です。

| 文書種別                      | 生成タイミング        | 配置     |
| ------------------------- | -------------- | ------ |
| `project-summary.md`      | Project初期化時    | 常設     |
| `current-status.md`       | Project初期化時    | 常設・更新型 |
| `active-decisions.md`     | Project初期化時    | 常設・更新型 |
| `next-actions.md`         | Project初期化時    | 常設・更新型 |
| `ai-entrypoint.md`        | Project初期化時    | 常設・更新型 |
| `conversation-summary.md` | 記憶化すべき会話が発生した時 | 複数生成型  |

## 推奨配置

```text
docs/projects/{project_code}/memory/
  project-summary.md
  current-status.md
  active-decisions.md
  next-actions.md
  ai-entrypoint.md

  conversations/
    {YYYY-MM-DD}-{topic_slug}.md
```

この配置であれば、Projectの基礎Contextと、会話由来の補助記憶候補を明確に分離できます。

---

# 9. M1-3以外で検出した関連Issue

## Phase 3要件定義書の状態語がM1-2 Active方針と不一致

`phase-requirements-3.md` では、検索対象statusとして以下が使用されています。

```text
active / accepted / proposed / superseded / deprecated / archived
```

一方、M1-2 Active方針では、共通 `status` に `accepted` および `proposed` を使用せず、以下へ統一することが確定しています。

```text
draft / active / superseded / deprecated / archived
```

Phase 3文書には、`active / accepted` を優先する記載、`proposed` を条件付き表示する記載が複数残っています。検索statusの設計へ直結するため、Phase 3へ着手する前に修正が必要です。Phase 3では正本性と鮮度を維持した検索を行う方針であり、状態語の不統一は検索filterおよびranking仕様を曖昧にします。

| 項目                   | 判定                                             |
| -------------------- | ---------------------------------------------- |
| M1-3 Active化の直接ブロッカー | いいえ                                            |
| Phase 3開始前の修正要否      | **必須**                                         |
| 推奨対応                 | `accepted` → `active`、`proposed` → `draft` へ統一 |

---

# 10. Active化へ向けた修正優先順位

| Priority | 修正内容                                                                       | 対象ファイル                                                       |
| -------- | -------------------------------------------------------------------------- | ------------------------------------------------------------ |
| P0       | `review_status: archived` を復活し、M1-2 Active定義へ一致させる                         | `conversation-summary.template.md`                           |
| P0       | `## Out of Scope` を独立章へ戻す                                                  | `project-summary.template.md`                                |
| P0       | frontmatter共通schemaを統一し、文書自身は `document_id`、根拠は `source_path` で管理する        | 全6件                                                          |
| P0       | Conflict Issue一覧を `current-status.md` に一本化する                               | `active-decisions.template.md`                               |
| P1       | `Foundational Constraints` を削除し、Constraint正本を `active-decisions.md` に一本化する | `project-summary.template.md`                                |
| P1       | AI EntrypointのConstraint本文重複を参照中心へ簡略化する                                    | `ai-entrypoint.template.md`                                  |
| P1       | `reflection_status` を簡略化して正式定義する                                           | `conversation-summary.template.md`                           |
| P1       | 共通運用ルールの再掲章をコメントまたは参照へ縮退する                                                 | `active-decisions` / `next-actions` / `conversation-summary` |
| P1       | 第1分冊の英語説明・第2分冊の日本語説明を統一する                                                  | 全6件                                                          |
| P2       | Phase 3要件定義書の `accepted` / `proposed` を統一する                                | `phase-requirements-3.md`                                    |

---

# 11. Active化判断

## 現時点

| 判定                 | 理由                                            |
| ------------------ | --------------------------------------------- |
| **Conditional Go** | テンプレート構造の基本設計は妥当だが、Active方針との不整合および重複責務が残っている |

## Goへ移行する条件

以下を満たせば、M1-3のActive版を作成して問題ありません。

1. `conversation-summary.template.md` の `review_status` をM1-2 Active定義へ合わせる。
2. `project-summary.template.md` の固定章構成を修正する。
3. frontmatter schemaを6件で統一する。
4. Conflict Issue参照を `current-status.md` へ一本化する。
5. Constraintおよび共通運用ルールの重複を縮退する。
6. 修正版6テンプレートについて、Mnemosyne / ATSの5基本文書へコピー可能であることを再確認する。

次に行うべき成果物は、**上記修正を反映した `docs/templates/memory/*.template.md` 6件のActive化用最終版**です。

## Conversation Memory

### fact

* JP: M1-3：Template整備では、`project-summary`、`current-status`、`active-decisions`、`next-actions`、`ai-entrypoint`、`conversation-summary` の6テンプレートを成果物とし、MnemosyneとATSへの適用およびPhase 2での機械読込を完了条件としている。 / EN: M1-3 delivers six templates: `project-summary`, `current-status`, `active-decisions`, `next-actions`, `ai-entrypoint`, and `conversation-summary`. Its completion conditions include use with Mnemosyne and ATS and machine reading in Phase 2.
* JP: 第1分冊として3件、第2分冊として3件のドラフトテンプレートが作成済みであり、M1-3で予定された6件のドラフトは揃っている。 / EN: Three draft templates were created in Part 1 and three in Part 2, so all six planned M1-3 drafts now exist.
* JP: M1-2 Active文書では、Task進捗を `task_status`、Conversation Summaryの確認・反映状態を `review_status` で管理し、`review_status` は `draft / reviewed / reflected / archived` と定義されている。 / EN: The active M1-2 documents manage task progress with `task_status` and Conversation Summary review/reflection with `review_status`, defined as `draft / reviewed / reflected / archived`.
* JP: M1-2 Active文書では、Active正本間競合の正式記録はConflict Issue文書に置き、Project側の参照は `current-status.md`、修正作業は `next-actions.md` で扱う方針が確定している。 / EN: The active M1-2 documents define formal active-source conflicts in Conflict Issue documents, references in `current-status.md`, and correction work in `next-actions.md`.
* JP: Phase 1計画では、MnemosyneおよびATSへ初期適用する常設memory文書は5件であり、Conversation Summaryは会話発生時に作成する補助記憶文書として扱うのが整合的である。 / EN: The Phase 1 plan uses five permanent initial memory documents for Mnemosyne and ATS; Conversation Summary is consistent as a supporting document created per relevant conversation.

### decision

* JP: M1-3の現行ドラフトは、現時点ではActive化せず、必須修正後にActive化可能な `Conditional Go` と判定した。 / EN: The current M1-3 drafts are not activated yet and are rated `Conditional Go`, meaning activation is possible after required corrections.
* JP: `conversation-summary.template.md` の `review_status` は、M1-2 Active定義に従い `draft / reviewed / reflected / archived` とするべきである。 / EN: `conversation-summary.template.md` should use `draft / reviewed / reflected / archived` for `review_status`, following the active M1-2 definition.
* JP: Conflict Issue参照は `current-status.md` に一本化し、`active-decisions.md` の `Open Decision Conflicts` は削除または参照案内へ縮退させるべきである。 / EN: Conflict Issue references should be centralized in `current-status.md`, and `Open Decision Conflicts` in `active-decisions.md` should be removed or reduced to guidance.
* JP: Constraint本文の正本は `active-decisions.md` の `Active Constraints` とし、`project-summary.md` の `Foundational Constraints` は削除、`ai-entrypoint.md` はConstraint参照中心へ縮退させるべきである。 / EN: The source for constraint content should be `Active Constraints` in `active-decisions.md`; `Foundational Constraints` in `project-summary.md` should be removed, and `ai-entrypoint.md` should mainly reference constraints.
* JP: 6テンプレートのfrontmatterでは、文書自身の識別に `document_id`、根拠参照に `source_path` を用いる統一schemaを採用すべきである。 / EN: The six template frontmatters should use a unified schema with `document_id` for the document itself and `source_path` for evidence references.
* JP: Conversation Summaryは、Mnemosyne / ATSの初期5文書として空ファイルを作るのではなく、必要な会話単位で複数生成する文書として扱う方針が適切である。 / EN: Conversation Summary should not be created as an empty initial document for Mnemosyne or ATS; it should be created per relevant conversation.

### task

* JP: M1-3の6テンプレートについて、必須修正および重複整理を反映したActive化用最終版を作成する。 / EN: Create the final activation-ready versions of all six M1-3 templates with the required corrections and duplication cleanup applied.
* JP: Active化用最終版では、`conversation-summary` のstatus修正、`project-summary` の章構成修正、frontmatter共通化、Conflict Issue参照一本化を必ず反映する。 / EN: The final activation-ready version must include the Conversation Summary status correction, Project Summary heading correction, unified frontmatter, and centralized Conflict Issue references.
* JP: M1-3 Active化後、M1-4としてMnemosyneの5基本memory文書を作成し、M1-5としてATSの5基本memory文書および適用検証記録を作成する。 / EN: After M1-3 activation, create Mnemosyne's five base memory documents in M1-4 and ATS's five base memory documents plus validation records in M1-5.
* JP: Phase 3へ進む前に、`phase-requirements-3.md` に残る `accepted` / `proposed` をM1-2 Active状態語へ統一する。 / EN: Before starting Phase 3, unify the remaining `accepted` / `proposed` terms in `phase-requirements-3.md` with the active M1-2 status vocabulary.

### preference

* JP: ユーザーは、成果物を分冊でドラフト化した後、全体を通したActive化レビューを行い、重複や不整合を除去してから最終版へ進める方針を採用している。 / EN: The user drafts deliverables in parts, then reviews them together for activation, removing duplication and inconsistencies before producing the final version.
* JP: テンプレートは、特定プロジェクト専用にならず、MnemosyneとATSの双方で使用でき、後続Phaseで機械的に扱える構造であることを重視する。 / EN: The templates should not be project-specific; they should work for both Mnemosyne and ATS and support machine handling in later phases.

### constraint

* JP: AIが作成したM1-3テンプレートは、Active版へ確定されるまで `draft` として扱い、正本へ直接反映しない。 / EN: AI-created M1-3 templates remain `draft` until activated and are not directly written into source documents.
* JP: Task進捗は共通 `status` ではなく `task_status` で管理する。 / EN: Task progress is managed with `task_status`, not the shared `status`.
* JP: Conversation Summary単独をActive DecisionまたはConstraintの根拠として扱わない。 / EN: A Conversation Summary alone is not evidence for an active decision or constraint.
* JP: Active正本間競合がopenである `blocked_scope` は、解消まで確定ContextとしてAIへ渡さない。 / EN: A `blocked_scope` with an open conflict between active source documents is not passed to AI as confirmed context until resolved.
* JP: Phase 1では、Context BuilderやRecall Engineの具体設定をテンプレートへ過剰に埋め込まず、後続Phaseの責務として分離する。 / EN: Phase 1 should not over-embed Context Builder or Recall Engine configuration in templates; those responsibilities remain in later phases.

### issue

* JP: `conversation-summary.template.md` が `review_status: archived` を使用しないとしており、M1-2 Active文書と直接不整合である。 / EN: `conversation-summary.template.md` states that `review_status: archived` is not used, which directly conflicts with the active M1-2 documents.
* JP: `project-summary.template.md` では、必須の `## Out of Scope` が `### Out of Scope` に変更されており、固定章構成を満たしていない。 / EN: In `project-summary.template.md`, the required `## Out of Scope` heading was changed to `### Out of Scope`, so it does not preserve the fixed section structure.
* JP: `current-status.template.md` と `active-decisions.template.md` の双方がConflict Issue一覧を持ち、競合状態の二重管理リスクがある。 / EN: Both `current-status.template.md` and `active-decisions.template.md` hold Conflict Issue lists, creating a risk of duplicate conflict-state management.
* JP: `project-summary`、`active-decisions`、`ai-entrypoint` でConstraint情報が重複しており、将来の更新不整合リスクがある。 / EN: Constraint information is duplicated across `project-summary`, `active-decisions`, and `ai-entrypoint`, creating future inconsistency risk.
* JP: `phase-requirements-3.md` に `accepted` / `proposed` が残っており、M1-2 Activeで確定した状態語と不一致である。 / EN: `phase-requirements-3.md` still contains `accepted` / `proposed`, which conflicts with the status vocabulary finalized in active M1-2.

### idea

* JP: `reflection_status` はConversation Summary内の候補行ごとの正本反映追跡として有効だが、文書全体の `review_status` と役割が重ならないよう、`pending / reflected / not_required / rejected` 程度へ簡略化する案が有効である。 / EN: `reflection_status` is useful for tracking source-document reflection per candidate row in a Conversation Summary, but simplifying it to `pending / reflected / not_required / rejected` avoids overlap with document-level `review_status`.
* JP: AI Entrypointでは、Constraint本文を複製する代わりに、重要Constraint IDと参照元正本を一覧化すると、入口文書の軽量性と正本一貫性を両立できる。 / EN: In AI Entrypoint, listing important constraint IDs and their source documents instead of duplicating constraint text can preserve both lightweight entry and source consistency.
* JP: Conversation Summaryを `docs/projects/{project_code}/memory/conversations/{date}-{topic}.md` の複数生成型として扱うと、基礎Context文書と会話由来候補を分離しやすい。 / EN: Treating Conversation Summary as multiple files under `docs/projects/{project_code}/memory/conversations/{date}-{topic}.md` makes it easier to separate base context documents from conversation-derived candidates.

### article_note

* JP: テンプレート設計では、項目を豊富にするだけでなく、どの文書が何の正本であるかを一つに決めることが、AIの誤参照防止に直結する。 / EN: In template design, defining one source document for each kind of truth is as important as adding useful fields, because it directly prevents AI misreference.
* JP: 会話要約は「役立つ情報」ではあるが「現行判断の根拠」ではないため、レビュー状態と正本反映状態を分離して管理する必要がある。 / EN: Conversation summaries are useful information but not evidence for current decisions, so review state and reflection into source documents must be managed separately.

### conversation_summary

* JP: 本チャットでは、Project Mnemosyne Phase 1のM1-3：Template整備について、前半3件と後半3件のドラフトを作成した後、6件を通したActive化レビューを実施した。レビューの結果、テンプレートの基本責務分離とMnemosyne / ATSへの適用方針は妥当である一方、Conversation Summaryの `review_status` 不整合、Project Summaryの章階層逸脱、Conflict IssueおよびConstraintの重複、frontmatter schemaの不統一を修正する必要があると判断した。現時点の判定は `Conditional Go` であり、必須修正を反映したActive化用最終版の作成が次工程である。 / EN: This chat drafted the first three and second three M1-3 templates, then reviewed all six for activation. The review found that the basic responsibility separation and intended use with Mnemosyne and ATS are sound, but the Conversation Summary `review_status` mismatch, Project Summary heading deviation, duplicated Conflict Issue and Constraint responsibilities, and inconsistent frontmatter schema must be corrected. The current judgement is `Conditional Go`, and the next step is to create the final activation-ready versions with the required fixes.

### test_result

* JP: 6テンプレートの必須第2階層見出しを確認した結果、5件は合格し、`project-summary.template.md` のみ `## Out of Scope` 欠落により不合格であった。 / EN: A check of required level-two headings found that five templates passed and only `project-summary.template.md` failed because `## Out of Scope` was missing.
* JP: M1-2 Active状態語との整合確認では、`next-actions` の `task_status` は合格したが、`conversation-summary` の `review_status` は `archived` 除外により不合格であった。 / EN: In the alignment check against active M1-2 status terms, `task_status` in `next-actions` passed, but `review_status` in `conversation-summary` failed because it excluded `archived`.
* JP: 正本責務の重複確認では、Constraint情報が3文書、Conflict Issue参照が2文書に存在することを確認し、Active化前に一本化が必要と判定した。 / EN: The source-responsibility review found constraint information in three documents and Conflict Issue references in two documents, so consolidation is required before activation.
* JP: MnemosyneおよびATSへのコピー適用は構造上可能と判断したが、実データを用いた充足性確認はM1-4およびM1-5で実施するため、現時点では条件付き合格とした。 / EN: Copy application to Mnemosyne and ATS is structurally feasible, but because content validation with actual data belongs to M1-4 and M1-5, the current result is a conditional pass.
