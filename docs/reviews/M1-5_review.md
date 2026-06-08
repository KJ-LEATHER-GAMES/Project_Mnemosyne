以下、作成済み6文書について、**Active化前レビュー**として修正点を明確化します。

結論として、**6文書の構成はM1-5成果物として妥当**です。
ただし、Active化するには **P0修正が必要** です。特に重要なのは、ユーザー指定どおり **Task正本を `next-actions.md` に完全集約し、`current-status.md` からTask詳細を除去すること** です。

---

# M1-5 ATS適用検証：Active化前レビュー結果

## 総合判定

| 項目                                | 判定                 |
| --------------------------------- | ------------------ |
| 成果物6文書の構成                         | OK                 |
| ATS文脈の再現性                         | おおむねOK             |
| Task / Decision / Issue / Ideaの分離 | 一部修正必要             |
| Task正本の一元化                        | P0修正必要             |
| Active化可否                         | **Conditional Go** |
| Active化条件                         | P0修正完了後にActive化可能  |

---

# Active化に必要な修正一覧

## P0：Active化前に必須修正

| ID          | 対象文書                                 | 修正内容                                                              | 理由                            |
| ----------- | ------------------------------------ | ----------------------------------------------------------------- | ----------------------------- |
| M1-5-P0-001 | `current-status.md`                  | `In Progress` からTask詳細を削除し、Task ID参照だけにする                         | `next-actions.md` との二重管理を防ぐため |
| M1-5-P0-002 | `active-decisions.md`                | `ATS-D-016` をDecisionから外し、IdeaまたはPending Decisionへ移す              | Ver1.1改善案は確定仕様ではなく改善候補のため     |
| M1-5-P0-003 | `next-actions.md`                    | `ATS-TASK-001`〜`ATS-TASK-003` のstatusを整理する                        | 6文書作成済みのため、状態が実態とズレる          |
| M1-5-P0-004 | `phase-1-ats-template-validation.md` | 判定を `Conditional Go` のままにし、Active化条件としてP0修正完了を明記する                | レビュー結果とActive化条件を一致させるため      |
| M1-5-P0-005 | 全6文書                                 | frontmatterの `status` はActive化時に `active`、`approved_at` は承認日へ更新する | Draft状態のままではActive成果物にならないため  |

---

## P1：Active化前または直後に修正推奨

| ID          | 対象文書                                 | 修正内容                                                                        | 理由                            |
| ----------- | ------------------------------------ | --------------------------------------------------------------------------- | ----------------------------- |
| M1-5-P1-001 | `ai-entrypoint.md`                   | Available Document Sourcesを `Confirmed Sources` と `Candidate Sources` に分離する | 存在未確認docsを実在docsと誤認しないため      |
| M1-5-P1-002 | `project-summary.md`                 | `Stable Facts` のsource_pathを、実際の正本文書へ寄せる                                    | 自己参照が多く、根拠として弱いため             |
| M1-5-P1-003 | `current-status.md`                  | `Completed Recently` の根拠を、可能なら実機確認ログ・DB確認docsへ寄せる                           | 検証済み事実の信頼度を上げるため              |
| M1-5-P1-004 | `active-decisions.md`                | Decision IDの粒度を少し統合する                                                       | Decision数が多く、運用時に重くなる可能性があるため |
| M1-5-P1-005 | `phase-1-ats-template-validation.md` | Template-Level Findingsに「Task正本一元化ルール」を正式提案として明記する                          | M1-5の学びをM1-3テンプレート改善へ接続するため   |

---

## P2：将来改善でよい修正

| ID          | 対象文書                                 | 修正内容                                    | 理由                            |
| ----------- | ------------------------------------ | --------------------------------------- | ----------------------------- |
| M1-5-P2-001 | `project-summary.md`                 | ATSの技術構成図やデータフロー概要を追加する                 | Phase 2以降のContext Pack精度向上に有効 |
| M1-5-P2-002 | `ai-entrypoint.md`                   | Agent別の入力文書セットをより厳密化する                  | Agent運用フェーズで有効                |
| M1-5-P2-003 | `next-actions.md`                    | TaskをMVP / Ver1.1 / Docs / Articleに分類する | Task数が増えたときの可読性向上             |
| M1-5-P2-004 | `phase-1-ats-template-validation.md` | 実際に5文書だけを使ったQ&A検証ログを追記する                | テンプレート検証の証跡強化                 |

---

# 文書別レビュー

---

## 1. `project-summary.md`

### 判定

**Active化可能。ただしP1修正推奨。**

### 良い点

* ATSの目的、背景、Scope、Out of Scopeが明確。
* 紙運用 → Notion → LINE Bot という流れが整理されている。
* PostgreSQL正本、Notion副本、docs正本の役割分離が入っている。
* ATSをProject Mnemosyneの適用検証対象として扱いやすい。

### 修正点

#### P1：Stable Factsのsource_pathを改善

現在のStable Factsは、根拠が `project-summary.md` 自身に寄りすぎています。

例：

```md
ATS-FACT-001 | ATSは家庭内ポイント制度をLINE Botとして実装するプロジェクトである | docs/projects/ats/memory/project-summary.md
```

これはActive化時点では許容できますが、より厳密にするなら、以下のように分けるとよいです。

```md
| ATS-FACT-001 | ATSは家庭内ポイント制度をLINE Botとして実装するプロジェクトである | `docs/projects/ats/memory/project-summary.md` | 2026-06-05 | active | M1-5で整理された安定事実 |
```

つまり、**この文書自体がM1-5で承認された正本になる** という扱いを明記すればOKです。

### Active化条件

* P0修正なし。
* `status: active`
* `approved_at: "2026-06-05"` など承認日を入れる。

---

## 2. `current-status.md`

### 判定

**P0修正必須。**

この文書が今回いちばん重要です。
`next-actions.md` をTask正本にするなら、`current-status.md` の `In Progress` は詳細を書きすぎない構造にする必要があります。

### 問題点

前回ドラフトでは、`In Progress` に以下のような情報が入っていました。

* Work Summary
* Priority
* task_status
* Source Task Document
* Updated At

これは一見問題ありませんが、`Work Summary` が詳しくなりすぎると、Task定義が `next-actions.md` と二重化します。

### P0修正案

`current-status.md` の `In Progress` は以下に置き換えるのがよいです。

```md
## In Progress

| Task ID | Current Focus | Priority | task_status | Source Task Document | Updated At |
|---|---|---|---|---|---|
| ATS-TASK-001 | ATS memory 5文書のActive化 | P0 | review | `docs/projects/ats/memory/next-actions.md` | 2026-06-05 |
| ATS-TASK-002 | ATSテンプレート適用検証レビューのActive化 | P0 | review | `docs/projects/ats/memory/next-actions.md` | 2026-06-05 |
| ATS-TASK-003 | current-statusのTask記載を参照形式へ整理 | P0 | in_progress | `docs/projects/ats/memory/next-actions.md` | 2026-06-05 |

Full task definitions are managed only in `docs/projects/ats/memory/next-actions.md`.
```

### 追加修正

`Current Position` も少し修正した方がよいです。

現在：

```md
Immediate focus | ATS-TASK-001: M1-5用ATS memory 5文書の作成
```

修正後：

```md
Immediate focus | ATS-TASK-001: ATS memory 5文書のActive化レビュー
```

理由は、6文書はすでにドラフト作成済みだからです。

### Active化条件

* `In Progress` をTask ID参照中心へ修正。
* Task詳細を `next-actions.md` のみに残す。
* `Current Objective` を「作成」ではなく「Active化レビュー」に更新する。

---

## 3. `active-decisions.md`

### 判定

**P0修正必須。**

### 良い点

* ATSの重要判断が体系的に整理されている。
* PostgreSQL正本 / Notion副本、所持ポイント / 累計ポイント、cooldown、daily_limit、冪等性など、重要Decisionが入っている。
* Superseded Decisionsがあり、古い案との区別ができている。

### 問題点

`ATS-D-016` がDecisionとして強すぎます。

```md
ATS-D-016 | Ver1.1改善案では「今日の未報告一覧」と「夜まとめ報告」をP0候補とする
```

これは「確定仕様」ではなく、**改善候補の優先順位**です。
Active Decisionに置くと、AIが「実装することが決まった仕様」と誤認する可能性があります。

### P0修正案

`ATS-D-016` はActive Decisionsから削除し、以下のどちらかへ移すのがよいです。

#### 案A：`current-status.md` の Pending Decisionsへ移す

```md
| ATS-PD-005 | Ver1.1改善案として「今日の未報告一覧」と「夜まとめ報告」をP0改善候補にするか | 報告忘れ対策として重要だが、正式仕様化は未完了のため | `docs/projects/ats/memory/next-actions.md` | こうちゃん | Ver1.1計画レビュー時 | open |
```

#### 案B：`next-actions.md` のActive Task / Deferred Taskへ残す

```md
| ATS-TASK-004 | P1 | Ver1.1登録支援案を正式な改善候補として整理する | 子どもの報告忘れ・親の代理登録負荷を下げる次期改善を明確化する | Ver1.1案、運用観察メモ | Ver1.1改善候補リストまたは仕様ドラフト | P0候補、P1候補、P2候補が分離され、未決定事項がDecision扱いされていない | todo |
```

こちらはすでに `next-actions.md` にあるので、**Active Decisionsからは外す** のが最適です。

### Active化条件

* `ATS-D-016` を削除。
* `ATS-CON-008` は残してよいです。

```md
Ver1.1案は正式仕様化されるまで、実装済み機能として扱わない
```

これはDecisionではなくConstraintとして有効です。

---

## 4. `next-actions.md`

### 判定

**P0修正後にActive化可能。**

### 良い点

* Task正本として十分に機能する構造。
* Task ID、Priority、Status、Input、Output、Completion Criteriaがあり、AIが次作業を誤認しにくい。
* Deferred Tasks / Not Doing Now があるため、やらないことも明確。

### 問題点

6文書はすでにドラフト作成済みなので、Task statusを更新する必要があります。

現在の想定：

```md
ATS-TASK-001 | ATS memory 5文書を完成させる | in_progress
ATS-TASK-002 | ATSテンプレート適用検証レビューを作成する | in_progress
```

今回のレビュー時点では、「作成」は完了し、「Active化前レビュー」に移っています。

### P0修正案

以下のように更新します。

```md
| ATS-TASK-001 | P0 | ATS memory 5文書をActive化する | ATSの重要文脈を5文書だけで再現できる状態にする | 作成済みATS memory 5文書、Active化前レビュー結果 | Active版5文書 | P0修正が反映され、statusがactiveへ更新されている | review | `docs/projects/ats/memory/next-actions.md` | ATS-ISS-004 |
| ATS-TASK-002 | P0 | ATSテンプレート適用検証レビューをActive化する | M1-5の完了条件を確認し、テンプレート不足を洗い出す | 作成済み検証レビュー、Active化前レビュー結果 | Active版 `docs/review/phase-1-ats-template-validation.md` | P0修正が反映され、Conditional GoまたはGo判定が明記されている | review | `docs/projects/ats/memory/next-actions.md` | none |
| ATS-TASK-003 | P0 | `current-status.md` のTask記載を正本参照形式へ整理する | Task正本が `next-actions.md` と二重管理にならないようにする | `current-status.md` / `next-actions.md` / Active化前レビュー結果 | `current-status.md` 修正版 | `current-status.md` のIn ProgressがTask ID参照中心になり、詳細定義が `next-actions.md` のみに存在する | in_progress | `docs/projects/ats/memory/next-actions.md` | ATS-CON-008 |
```

### Active化条件

* Task statusを現在地に合わせる。
* 「作成する」ではなく「Active化する」に更新する。
* `current-status.md` 整理TaskをP0として残す。

---

## 5. `ai-entrypoint.md`

### 判定

**P1修正推奨。P0ではない。**

### 良い点

* AIが最初に読むべき順番が明確。
* `active-decisions.md` と `next-actions.md` の優先順位が明確。
* 「古い案をDecision扱いしない」「Taskはnext-actionsを見る」など、誤解防止ルールが非常に良い。
* Agent Use CasesがPhase 2以降へつながる。

### 修正点

#### P1：Confirmed Sources / Candidate Sourcesを分離

現状では以下のような文書が混在しています。

* 実在・作成済みのmemory文書
* 今後作る可能性があるATS設計文書
* 存在未確認の候補文書

AIが「存在している文書」と誤認する可能性があるため、以下の構造へ変更推奨です。

```md
## Confirmed Sources

| Source | Role | Priority |
|---|---|---|
| `docs/projects/ats/memory/project-summary.md` | ATSの安定した概要 | high |
| `docs/projects/ats/memory/current-status.md` | 現在地・Issue・Pending Decision | high |
| `docs/projects/ats/memory/active-decisions.md` | 有効な判断・制約 | highest |
| `docs/projects/ats/memory/next-actions.md` | Task正本 | highest |
| `docs/projects/ats/memory/ai-entrypoint.md` | AI支援入口 | high |
| `docs/review/phase-1-ats-template-validation.md` | M1-5検証結果 | high |
```

```md
## Candidate Sources

The following documents are candidate sources.  
If they do not exist, AI must not assume they are available.

| Candidate Source | Expected Role |
|---|---|
| `docs/usecase-contracts.md` | UseCase入出力契約 |
| `docs/domain-rules.md` | ポイント、cooldown、daily_limit等のドメインルール |
| `docs/database-design.md` | DB設計 |
| `docs/repository-contracts.md` | Repository責務 |
| `docs/test-results/` | 実機確認・DB確認・Renderログ確認 |
| `docs/reward-design.md` | ごほうび設計 |
| `docs/version-plans/` | Ver1.1改善案 |
```

### Active化条件

* P1修正のため、必須ではない。
* ただし、Active化前に直すと品質が高い。

---

## 6. `phase-1-ats-template-validation.md`

### 判定

**P0修正後にActive化可能。**

### 良い点

* M1-5の目的に合っている。
* 5文書の役割検証ができている。
* T-01〜T-05のValidation Scenariosがよい。
* Cross-Document Consistency Reviewが有効。
* Template-Level FindingsがPhase 1全体の改善につながる。

### 問題点

Active化前レビュー結果を反映する必要があります。

特に、現在の判定が以下です。

```md
Phase 1 M1-5 Completion Judgment | Conditional Go
```

これは妥当です。
ただし、今回のレビューにより、P0修正がより明確になったため、Required Before Activeを更新した方がよいです。

### P0修正案

```md
## Go / Conditional Go / No Go Judgment

| Judgment | Result |
|---|---|
| Phase 1 M1-5 Completion Judgment | Conditional Go |
| Reason | ATS memory 5文書と検証レビュー文書は作成済みであり、主要文脈は再現できる。ただし、Task正本を `next-actions.md` に集約するため、`current-status.md` のTask詳細削除と、Ver1.1改善案のDecision扱い修正が必要。 |
| Required Before Active | M1-5-P0-001, M1-5-P0-002, M1-5-P0-003, M1-5-P0-004, M1-5-P0-005 |
| Can Proceed to M1-6 | Yes, after P0 revisions |
```

### Required Revisions Before Activeも更新

```md
| Revision ID | Priority | Target Document | Required Revision | Reason |
|---|---|---|---|---|
| ATS-REV-001 | P0 | `current-status.md` | In ProgressをTask ID参照中心へ変更し、Task詳細を削除する | Task正本を `next-actions.md` に集約するため |
| ATS-REV-002 | P0 | `active-decisions.md` | `ATS-D-016` をActive Decisionから外し、Ver1.1改善候補はTask / Pending Decision / Ideaとして扱う | 未確定の改善案を現在有効な判断と誤認しないため |
| ATS-REV-003 | P0 | `next-actions.md` | 6文書作成済みの状態に合わせてTask statusとTask表現を更新する | 作成中ではなくActive化レビュー中であるため |
| ATS-REV-004 | P0 | 全6文書 | frontmatterの `status` と `approved_at` をActive化時に更新する | DraftからActiveへ移行するため |
| ATS-REV-005 | P1 | `ai-entrypoint.md` | Available Document SourcesをConfirmed Sources / Candidate Sourcesへ分離する | 存在未確認docsをAIが誤認しないようにするため |
```

---

# Active化前の最終修正方針

## 修正方針1：Task正本は完全に `next-actions.md`

これは今回の最重要ポイントです。

### OK

```md
current-status.md:
ATS-TASK-001 | ATS memory 5文書のActive化 | review | next-actions.md
```

### NG

```md
current-status.md:
ATS-TASK-001 | 目的 | 入力 | 出力 | 完了条件 | 詳細手順...
```

理由は、Task定義が2箇所に分裂するからです。

---

## 修正方針2：Ver1.1改善案はDecisionにしない

「今日の未報告一覧」「夜まとめ報告」は非常に良い改善案です。
ただし、現時点では **確定仕様ではなく、改善候補** として扱うべきです。

### 置き場所

| 内容              | 置き場所                                    |
| --------------- | --------------------------------------- |
| 改善候補として整理するTask | `next-actions.md`                       |
| なぜ必要かというIssue   | `current-status.md`                     |
| 正式採用するかの未決定事項   | `current-status.md` の Pending Decisions |
| 採用決定後の判断        | `active-decisions.md`                   |

---

## 修正方針3：Active化時のfrontmatter更新

全6文書で以下を更新します。

### Draft時

```yaml
status: "draft"
approved_at: null
```

### Active化時

```yaml
status: "active"
approved_at: "2026-06-05"
```

必要に応じて以下も更新します。

```yaml
version: "1.0.0"
updated_at: "2026-06-05"
```

Draftを `0.1.0`、Active版を `1.0.0` とする運用が分かりやすいです。

---

# Active化可否の最終判定

## 判定：Conditional Go

**P0修正を反映すればActive化してよい** です。

特に、以下3つを直せば、M1-5成果物として十分に成立します。

1. `current-status.md` のTask詳細を削除し、Task ID参照にする
2. `active-decisions.md` からVer1.1改善候補Decisionを外す
3. `next-actions.md` のTask statusを「作成中」から「Active化レビュー中」に更新する

この修正後、M1-5は **Active化可能** と判断します。

---

## 修正優先順位まとめ

| Priority | 修正内容                                                        | 対象                                                       |
| -------- | ----------------------------------------------------------- | -------------------------------------------------------- |
| P0       | Task詳細を `next-actions.md` に集約し、`current-status.md` は参照形式へ変更 | `current-status.md`, `next-actions.md`                   |
| P0       | Ver1.1改善案をActive Decisionから外す                               | `active-decisions.md`                                    |
| P0       | Task statusを現在地に合わせて更新                                      | `next-actions.md`                                        |
| P0       | 検証レビューに今回のActive化条件を反映                                      | `phase-1-ats-template-validation.md`                     |
| P0       | frontmatterをActive化時に更新                                     | 全6文書                                                     |
| P1       | Confirmed Sources / Candidate Sourcesを分離                    | `ai-entrypoint.md`                                       |
| P1       | Stable Facts / Completed Recentlyのsource_pathを補強            | `project-summary.md`, `current-status.md`                |
| P2       | Phase 2向けContext Pack入力要件をさらに詳細化                            | `ai-entrypoint.md`, `phase-1-ats-template-validation.md` |

---

## まとめ / Summary

日本語：作成済み6文書はM1-5成果物として妥当ですが、Active化にはP0修正が必要です。特に、Task正本を `next-actions.md` に集約し、`current-status.md` からTask詳細を削除する修正が最重要です。
English: The six drafted documents are valid as M1-5 deliverables, but P0 fixes are needed before activation. The most important fix is to keep task details only in `next-actions.md` and remove them from `current-status.md`.

日本語：また、Ver1.1改善案はまだ確定仕様ではないため、`active-decisions.md` から外し、Task・Pending Decision・Ideaとして扱うべきです。
English: Also, Version 1.1 improvement ideas are not confirmed specifications yet. They should be removed from `active-decisions.md` and handled as tasks, pending decisions, or ideas.

---

## Conversation Memory

### fact

* 日本語：Project Mnemosyneは、AI外部記憶基盤を作るプロジェクトであり、Phase 1はMemory Foundationである。 / English: Project Mnemosyne is a project to build an external memory base for AI. Phase 1 is Memory Foundation.
* 日本語：M1-5の成果物は、ATS向けmemory 5文書とATSテンプレート検証レビュー文書である。 / English: The M1-5 deliverables are five ATS memory documents and one ATS template validation review document.
* 日本語：作成済み6文書は、`project-summary.md`、`current-status.md`、`active-decisions.md`、`next-actions.md`、`ai-entrypoint.md`、`phase-1-ats-template-validation.md` である。 / English: The six drafted documents are `project-summary.md`, `current-status.md`, `active-decisions.md`, `next-actions.md`, `ai-entrypoint.md`, and `phase-1-ats-template-validation.md`.
* 日本語：ATSは家庭内ポイント制度をLINE Botとして実装するプロジェクトである。 / English: ATS is a project to implement a home point system as a LINE Bot.
* 日本語：ATSではPostgreSQLを実行時データの正本、Notionを可視化用の副本として扱う。 / English: In ATS, PostgreSQL is the source of truth for runtime data, and Notion is a visual copy.
* 日本語：ATSでは所持ポイントと累計ポイントを分離する方針である。 / English: ATS separates current points and lifetime points.

### decision

* 日本語：M1-5のActive化判定はConditional Goとする。 / English: The M1-5 activation judgment is Conditional Go.
* 日本語：Task正本は `docs/projects/ats/memory/next-actions.md` に集約する。 / English: The source of truth for tasks is `docs/projects/ats/memory/next-actions.md`.
* 日本語：`current-status.md` はTask詳細を持たず、Task IDと状態サマリーの参照に限定する。 / English: `current-status.md` should not hold task details. It should only reference task IDs and status summaries.
* 日本語：Ver1.1改善案は、正式採用されるまではActive Decisionではなく、Task・Pending Decision・Ideaとして扱う。 / English: Version 1.1 improvement ideas should be handled as tasks, pending decisions, or ideas until they are officially adopted.

### task

* 日本語：`current-status.md` の `In Progress` をTask ID参照中心へ修正する。 / English: Revise the `In Progress` section of `current-status.md` to mainly reference task IDs.
* 日本語：`active-decisions.md` から `ATS-D-016` を削除または移動する。 / English: Remove or move `ATS-D-016` from `active-decisions.md`.
* 日本語：`next-actions.md` の `ATS-TASK-001`〜`ATS-TASK-003` のstatusと表現をActive化レビュー段階へ更新する。 / English: Update the status and wording of `ATS-TASK-001` to `ATS-TASK-003` in `next-actions.md` to match the activation review stage.
* 日本語：`phase-1-ats-template-validation.md` に今回のP0修正条件を反映する。 / English: Add the P0 activation conditions to `phase-1-ats-template-validation.md`.
* 日本語：全6文書のfrontmatterをActive化時に `status: active`、`approved_at` ありへ更新する。 / English: When activating, update the frontmatter of all six documents to `status: active` and set `approved_at`.

### preference

* 日本語：ユーザーは、成果物が多い場合は切りのよいところで区切って作成する進め方を希望している。 / English: The user prefers splitting large deliverables into clear parts.
* 日本語：ユーザーは、Task正本と状態サマリーの二重管理を避ける設計を重視している。 / English: The user values avoiding double management between task source documents and status summaries.
* 日本語：ユーザーは、Active化前に修正点を優先順位付きで明確化したい。 / English: The user wants required fixes to be clearly listed by priority before activation.

### constraint

* 日本語：M1-5では、曖昧な内容をDecisionにせず、IssueまたはIdeaとして分ける必要がある。 / English: In M1-5, unclear items should not be treated as decisions. They should be issues or ideas.
* 日本語：Task本文の正本は `next-actions.md` とし、`current-status.md` は状態サマリーに限定する。 / English: The source of truth for task details is `next-actions.md`; `current-status.md` is only a status summary.
* 日本語：AIはdraft作成までを担当し、正本Active化は人間承認後に行う。 / English: AI creates drafts only. Active source documents require human approval.
* 日本語：Phase 1ではRAG、API、MCP、自動更新を持ち込まない。 / English: Phase 1 does not include RAG, API, MCP, or automatic updates.

### issue

* 日本語：`current-status.md` にTask詳細を残すと、`next-actions.md` と二重管理になるリスクがある。 / English: If task details remain in `current-status.md`, there is a risk of double management with `next-actions.md`.
* 日本語：`ATS-D-016` は改善候補であり、Active Decisionとして扱うと確定仕様と誤認されるリスクがある。 / English: `ATS-D-016` is an improvement candidate. If treated as an Active Decision, it may be misunderstood as a confirmed specification.
* 日本語：`ai-entrypoint.md` で実在文書と候補文書が混在しており、AIが存在未確認docsを実在文書と誤認するリスクがある。 / English: In `ai-entrypoint.md`, confirmed and candidate documents are mixed, so AI may misunderstand candidate documents as existing documents.

### idea

* 日本語：`ai-entrypoint.md` では、Available Document SourcesをConfirmed SourcesとCandidate Sourcesに分けるとよい。 / English: In `ai-entrypoint.md`, it would be good to separate Available Document Sources into Confirmed Sources and Candidate Sources.
* 日本語：テンプレート側にも「current-statusはTask詳細を持たない」というルールを追加する案がある。 / English: A possible template improvement is to add a rule that `current-status` should not contain task details.
* 日本語：Phase 2では、ATS memory文書をContext Pack生成の入力として使う構成が考えられる。 / English: In Phase 2, ATS memory documents can be used as input for Context Pack generation.

### article_note

* 日本語：ATSは「紙運用は単なる仮運用ではなく、仕様を観察するフェーズだった」という記事化しやすい論点を持つ。 / English: ATS has a good article point: paper operation was not just a trial, but a phase to observe the specification.
* 日本語：所持ポイントと累計ポイントの分離は、「消費型経済」と「永続蓄積」を分けた設計思想として記事化できる。 / English: Separating current points and lifetime points can be written as a design idea: separating spendable economy and permanent progress.
* 日本語：LINE Botのpostback.dataを契約として扱う設計は、技術記事化しやすい。 / English: Treating LINE Bot `postback.data` as a contract is a good topic for a technical article.

### conversation_summary

* 日本語：このチャットでは、Project Mnemosyne Phase 1のM1-5として、ATSにmemoryテンプレートを適用する作業を進めた。6文書のドラフト作成後、Active化前レビューを行い、Task正本の一元化、Ver1.1改善案のDecision扱い修正、Task status更新をP0修正として整理した。 / English: In this chat, we worked on M1-5 of Project Mnemosyne Phase 1 by applying memory templates to ATS. After drafting six documents, we reviewed them before activation and identified P0 fixes: centralizing task details, correcting the treatment of Version 1.1 ideas, and updating task status.

### test_result

* 日本語：今回の返答内では実行テストは行っていない。 / English: No execution test was performed in this response.
* 日本語：文書レビューの結果、6文書はM1-5成果物として妥当だが、Active化にはP0修正が必要と判定した。 / English: As a document review result, the six documents are valid M1-5 deliverables, but P0 fixes are needed before activation.
