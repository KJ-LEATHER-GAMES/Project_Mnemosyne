## M1-4 Active化レビュー結果

**判定：Conditional Go**

M1-4の5文書は、Active化できる水準にかなり近いです。
ただし、**Active化前にP0修正が2点必要**です。

M1-4の成果物は、`project-summary.md` / `current-status.md` / `active-decisions.md` / `next-actions.md` / `ai-entrypoint.md` の5文書であり、完了条件は「新しいチャットで文書を提示すれば現在地を再説明せず相談開始できること」と「Phase 1未完了タスクが `next-actions.md` で把握できること」です。

---

# 1. 総合判定

| 観点        |     判定 | コメント                                                                 |
| --------- | -----: | -------------------------------------------------------------------- |
| 責務分離      | 条件付きOK | 大枠はOK。ただし `current-status.md` と `next-actions.md` のTask状態が一部重複・ズレやすい |
| 正本境界      | 条件付きOK | Decision / Task / Issue / Constraint の配置方針は良い。ただしTask状態の正本をさらに明確化したい |
| Phase 1整合 |     OK | RAG / API / MCP / Agent実装はP0タスクに混入していない                              |
| AI入口性     |     OK | `ai-entrypoint.md` だけで読み順・制約・誤解リスクは理解できる                             |
| 完了条件      | 条件付きOK | 相談開始は可能。ただし現在地の表現を「ドラフト作成中」から「Active化レビュー中」へ更新すべき                    |

---

# 2. P0修正項目

## P0-1：`current-status.md` の現在地が古くなる

### 問題

最初の3文書作成時点では、`current-status.md` に以下のような表現が入っています。

* `project-summary / current-status / active-decisions のドラフト作成中`
* `MNEMO-TASK-001` が `in_progress`
* 残り2文書が `todo`

しかし、このレビュー時点では5文書ドラフトが揃っています。
このままActive化すると、**Active文書なのに現在地が1ステップ古い**状態になります。

### 修正方針

`current-status.md` は以下へ更新します。

| 項目                | 修正前                   | 修正後                           |
| ----------------- | --------------------- | ----------------------------- |
| current_milestone | M1-4: Mnemosyne初期記憶作成 | 同じ                            |
| current objective | 5文書を作成する              | 5文書ドラフトをレビューし、Active化用最終版へ整える |
| Current Position  | ドラフト作成中               | 5文書ドラフト作成済み / Active化レビュー中    |
| MNEMO-TASK-001    | in_progress           | review_needed または done        |
| MNEMO-TASK-002    | todo                  | in_progress                   |
| MNEMO-TASK-003    | todo                  | todo                          |

### 推奨

`MNEMO-TASK-001` は **done** にしてよいです。
理由は、5文書ドラフト作成そのものは完了しているためです。

その代わり、現在の主作業は以下へ移します。

```md
MNEMO-TASK-002: M1-4の5文書をレビューし、Active化に必要な修正点を洗い出す
task_status: in_progress
```

---

## P0-2：`next-actions.md` と `current-status.md` のTask状態管理が二重化しやすい

### 問題

`next-actions.md` はTask正本として適切です。
一方で、`current-status.md` にも `In Progress` テーブルとしてTask ID、task_status、更新日が入っています。

この構成自体は悪くありませんが、Active運用では以下のズレが起きやすいです。

* `next-actions.md` では `review_needed`
* `current-status.md` では `in_progress`
* どちらが正しいかAIが迷う

M1-3で「Task本文は `next-actions.md`、`current-status.md` は状態要約」という方針にしているため、この境界をもう一段明確にした方が安全です。

### 修正方針

`current-status.md` の `In Progress` は、Task正本ではなく**状態サマリー**として扱う文言を追加します。

追加推奨文：

```md
Note:
Task本文、Output、Completion Criteria、task_statusの正本は `next-actions.md` とする。
本章は現在地を短時間で把握するための状態サマリーであり、Task定義の正本ではない。
```

### 判定

これはActive化前に入れた方がよいです。
理由は、今後AIがTask更新案を作るときに、`current-status.md` と `next-actions.md` のどちらを更新すべきか迷うリスクが高いためです。

---

# 3. P1修正項目

## P1-1：`ai-entrypoint.md` の読み順が少し重い

### 現状

`ai-entrypoint.md` の `What the AI Should Read First` は以下の5文書すべてを読む前提です。

1. `ai-entrypoint.md`
2. `project-summary.md`
3. `current-status.md`
4. `active-decisions.md`
5. `next-actions.md`

これは正しいですが、軽い相談でも5文書必須に見える可能性があります。

### 修正案

「常に読む最小セット」と「必要時に読む文書」を分けるとより実用的です。

```md
## Minimal Reading Set

通常の相談では、以下を最小セットとする。

1. `ai-entrypoint.md`
2. `current-status.md`
3. `active-decisions.md`
4. `next-actions.md`

`project-summary.md` は、プロジェクト目的・スコープ・背景を確認する必要がある場合に読む。
```

ただし、M1-4完了条件上は「新しいチャットで再説明なし」が重要なので、**初回のContext Packには5文書全部を含める**方針で問題ありません。

---

## P1-2：`project-summary.md` と `ai-entrypoint.md` のPurposeがやや重複

### 判定

許容範囲です。

`ai-entrypoint.md` は入口文書なので、プロジェクト概要を短く再掲するのは妥当です。
ただし、`project-summary.md` と同じ粒度で詳細化すると重複になります。

### 修正案

`ai-entrypoint.md` の `What This Project Is` は、以下のように短縮してもよいです。

```md
Project Mnemosyneの詳細な目的・背景・Scopeは `project-summary.md` を正本とする。
本章では、AIが支援開始時に誤解しないための最小要約のみを記載する。
```

---

## P1-3：`active-decisions.md` のMD-007〜MD-009の扱い

### 現状

M1-4で特に記録すべきActive DecisionはMD-001〜MD-006です。
ドラフトでは、それに加えてMD-007〜MD-009も入れています。

### 判定

追加自体は妥当です。
ただし、M1-4指定Decisionと、M1-3テンプレート整備から派生した運用Decisionが混在して見えます。

### 修正案

`active-decisions.md` を以下のように章分けすると読みやすいです。

```md
## Core Active Decisions for M1-4

MD-001〜MD-006

## Supporting Operational Decisions

MD-007〜MD-009
```

これにより、M1-4で必須の判断と、運用補助判断を分けられます。

---

# 4. 観点別レビュー詳細

## 4.1 責務分離

### 判定：条件付きOK

5文書の責務はおおむね分離できています。

| 文書                    | 主責務                          | 判定    |
| --------------------- | ---------------------------- | ----- |
| `project-summary.md`  | 安定した目的・背景・Scope              | OK    |
| `current-status.md`   | 現在地・Issue・Pending Decision   | 要軽微修正 |
| `active-decisions.md` | Active Decision / Constraint | OK    |
| `next-actions.md`     | Task本文・優先度・完了条件              | OK    |
| `ai-entrypoint.md`    | AIの読み順・参照ルール・誤解防止            | OK    |

### 主な懸念

`current-status.md` と `next-actions.md` がTask状態を両方持つため、将来ズレやすいです。
ただし、`current-status.md` を「状態サマリー」と明記すれば解消できます。

---

## 4.2 正本境界

### 判定：条件付きOK

正本境界はかなり整理されています。

| 情報種別             | 正本                                               | 判定  |
| ---------------- | ------------------------------------------------ | --- |
| Decision         | `active-decisions.md` / ADR                      | OK  |
| Constraint       | `active-decisions.md` / `memory-policy.md` / ADR | OK  |
| Task             | `next-actions.md`                                | 要明記 |
| Issue            | `current-status.md`                              | OK  |
| Pending Decision | `current-status.md`                              | OK  |
| Project概要        | `project-summary.md`                             | OK  |
| AI参照入口           | `ai-entrypoint.md`                               | OK  |

Project Mnemosyneでは、AIに記憶を持たせるのではなく、AIが参照できる記憶基盤を作る方針であり、重要判断はADRへ残し、新しいAIチャットでも文脈を復元できることが要件になっています。

### 修正すべき点

`current-status.md` に以下を追加するのが安全です。

```md
Taskの正本は `next-actions.md` とする。
current-status.mdに記載するTask情報は、現在地把握のための要約であり、Task定義・完了条件・task_statusの正本ではない。
```

---

## 4.3 Phase 1整合

### 判定：OK

RAG / API / MCP / Agent実装はPhase 1タスクに混入していません。

むしろ、以下の分離が適切です。

| 項目                  | ドラフト上の扱い         | 判定 |
| ------------------- | ---------------- | -- |
| RAG検索               | Deferred / Later | OK |
| Memory API          | Later            | OK |
| MCP Server          | Later            | OK |
| Agent本格実装           | Later            | OK |
| Agent接続方針整理         | M1-6             | OK |
| Context Pack自動生成CLI | Phase 2へDeferred | OK |

Phase 1は「AI外部記憶の正本構造と運用ルールを作る」フェーズであり、RAG検索実装、MCP Server実装、Web UIなどはPhase 1対象外と整理されています。

### 注意点

`next-actions.md` の `MNEMO-TASK-005: M1-6 Agent接続方針を整理する` は問題ありません。
ただし、表現は必ず「Agentを実装する」ではなく、**Agentがどの記憶を必要とするかを整理する**に留めるべきです。

この点は、M1-6の説明でも「Agentを実装しない。ただしAgentがどの記憶を必要とするかを整理する」とされているため整合しています。

---

## 4.4 AI入口性

### 判定：OK

`ai-entrypoint.md` は、AIが以下を理解するには十分です。

* Project Mnemosyneとは何か
* 現在どのPhase / Milestoneか
* 最初に読むべき文書は何か
* 必要時に読む補助文書は何か
* AIが正本へ直接writeしてはいけないこと
* Context PackやAI Draftを正本扱いしないこと
* Phase 1で実装しないこと
* 誤解しやすいリスク

テンプレート上も、`ai-entrypoint.md` はAI支援時の入口文書であり、読むべき文書、制約、文書ソース、Draftルール、誤解リスクを持つ構成になっています。

### 改善するとさらに良い点

`ai-entrypoint.md` の冒頭に、次の1文を追加すると実運用で強くなります。

```md
この文書はProject Mnemosyne相談時の入口であり、正本そのものではない。
判断・制約・タスク・Issueの正本は、各参照先文書を確認すること。
```

これにより、AIが `ai-entrypoint.md` だけを正本として扱う誤読を防げます。

---

## 4.5 完了条件

### 判定：条件付きOK

M1-4の完了条件は以下です。

* 新しいチャットで上記文書を提示すれば、Mnemosyneの現在地を再説明せずに相談開始できる
* Phase 1の未完了タスクが `next-actions.md` で把握できる


この条件に対して、現ドラフトはほぼ満たしています。

### 不足している点

`current-status.md` がレビュー時点の状態に更新されていないため、新しいチャットへ渡した場合にAIが以下のように誤認する可能性があります。

> まだ3文書しかドラフト作成していない
> 残り2文書が未作成である

これはActive化前に必ず直すべきです。

---

# 5. Active化前の修正リスト

## 必須修正 P0

| ID              | 対象                  | 修正内容                                                   | 理由                   |
| --------------- | ------------------- | ------------------------------------------------------ | -------------------- |
| M1-4-REV-P0-001 | `current-status.md` | 現在地を「5文書ドラフト作成済み / Active化レビュー中」へ更新                    | Active化時点の状態と一致させるため |
| M1-4-REV-P0-002 | `current-status.md` | Task正本は `next-actions.md` であり、current-statusは状態サマリーと明記 | Task正本の二重化を防ぐため      |

## 推奨修正 P1

| ID              | 対象                                        | 修正内容                                            | 理由                         |
| --------------- | ----------------------------------------- | ----------------------------------------------- | -------------------------- |
| M1-4-REV-P1-001 | `ai-entrypoint.md`                        | 「この文書は入口であり、Decision / Task / Issue の正本ではない」と明記 | AIの誤読防止                    |
| M1-4-REV-P1-002 | `ai-entrypoint.md`                        | Minimal Reading SetとFull Reading Setを分ける        | 実運用時の使いやすさ向上               |
| M1-4-REV-P1-003 | `active-decisions.md`                     | MD-001〜006とMD-007以降を章分け                         | 必須Decisionと補助運用Decisionの区別 |
| M1-4-REV-P1-004 | `project-summary.md` / `ai-entrypoint.md` | Project概要の重複を「ai-entrypointは最小要約」と明記            | 重複の意図を明確化                  |

---

# 6. Active化可否

## 結論

**P0修正2点を反映すれば、M1-4はActive化してよいです。**

P1はActive化前に入れてもよいですが、必須ではありません。
ただし、今後の運用でAIが誤解しにくくなるため、できればP1もまとめて反映することを推奨します。

## 推奨フロー

```text
1. current-status.md の現在地とTask状態を更新
2. current-status.md に「Task正本は next-actions.md」と明記
3. ai-entrypoint.md に「入口であり正本ではない」と明記
4. active-decisions.md のDecision章を分ける
5. 5文書を status: active に変更
6. Change History に Active化記録を追加
```

---

## まとめ / Summary

JP: M1-4の5文書は、Active化可能な水準です。ただし、`current-status.md` の現在地が古くなる点と、Task正本が `current-status.md` と `next-actions.md` で二重化しやすい点は、Active化前に必ず修正した方がよいです。
EN: The five M1-4 documents are almost ready for activation. However, before activation, `current-status.md` should be updated to the latest state, and the task source boundary between `current-status.md` and `next-actions.md` should be clarified.

JP: P0修正2点を反映すれば、M1-4はActive化して問題ありません。
EN: After applying the two P0 fixes, M1-4 can be activated.

---

## Conversation Memory

### fact

* JP: M1-4の成果物5文書について、Active化レビューを実施した。 / EN: An activation review was performed for the five M1-4 output documents.
* JP: M1-4の5文書は、`project-summary.md`、`current-status.md`、`active-decisions.md`、`next-actions.md`、`ai-entrypoint.md` である。 / EN: The five M1-4 documents are `project-summary.md`, `current-status.md`, `active-decisions.md`, `next-actions.md`, and `ai-entrypoint.md`.
* JP: M1-4完了条件は、新しいチャットで現在地を再説明せず相談開始できること、およびPhase 1未完了タスクが `next-actions.md` で把握できることである。 / EN: The M1-4 completion conditions are that a new chat can start without re-explaining the current state, and that unfinished Phase 1 tasks can be understood from `next-actions.md`.

### decision

* JP: M1-4 Active化レビューの総合判定は Conditional Go とした。 / EN: The overall M1-4 activation review result is Conditional Go.
* JP: P0修正2点を反映すれば、M1-4はActive化してよいと判断した。 / EN: M1-4 can be activated after applying the two P0 fixes.

### task

* JP: `current-status.md` の現在地を「5文書ドラフト作成済み / Active化レビュー中」へ更新する。 / EN: Update `current-status.md` to show that all five drafts are ready and activation review is in progress.
* JP: `current-status.md` に、Task正本は `next-actions.md` であることを明記する。 / EN: Add a note to `current-status.md` that `next-actions.md` is the source of truth for tasks.
* JP: 可能であれば、`ai-entrypoint.md` に「入口であり正本ではない」旨を追記する。 / EN: If possible, add to `ai-entrypoint.md` that it is an entrypoint, not the source of truth.
* JP: 可能であれば、`active-decisions.md` でMD-001〜006とMD-007以降を章分けする。 / EN: If possible, split MD-001 to MD-006 and MD-007 onward in `active-decisions.md`.

### preference

* JP: ユーザーはActive化前に、責務分離、正本境界、Phase整合、AI入口性、完了条件の観点でレビューする進め方を重視している。 / EN: The user values reviewing responsibility separation, source boundaries, phase alignment, AI entry quality, and completion conditions before activation.

### constraint

* JP: Task本文、Output、Completion Criteria、task_statusの正本は `next-actions.md` とする。 / EN: The source of truth for task details, outputs, completion criteria, and task status is `next-actions.md`.
* JP: `current-status.md` は現在地、Issue、Pending Decision、状態サマリーを扱う。 / EN: `current-status.md` handles current state, issues, pending decisions, and status summaries.
* JP: Phase 1ではRAG / API / MCP / Agentの実装を行わず、記憶構造と運用ルールを優先する。 / EN: Phase 1 does not implement RAG, API, MCP, or Agents; it prioritizes memory structure and operation rules.

### issue

* JP: `current-status.md` の現在地が、5文書ドラフト作成完了後の状態に更新されていない。 / EN: `current-status.md` has not yet been updated to reflect that all five drafts are complete.
* JP: `current-status.md` と `next-actions.md` の両方にTask状態があるため、将来的にズレるリスクがある。 / EN: Because both `current-status.md` and `next-actions.md` contain task status, there is a risk of future inconsistency.

### idea

* JP: `ai-entrypoint.md` では、Minimal Reading SetとFull Reading Setを分けると実運用しやすくなる。 / EN: `ai-entrypoint.md` may be more practical if it separates a Minimal Reading Set and a Full Reading Set.
* JP: `active-decisions.md` では、M1-4必須Decisionと補助運用Decisionを章分けすると読みやすくなる。 / EN: `active-decisions.md` may be clearer if it separates required M1-4 decisions from supporting operational decisions.

### article_note

* JP: Project Memory文書では、同じ情報を複数文書に置くこと自体が悪いのではなく、「どちらが正本か」を明記することが重要である。 / EN: In Project Memory documents, duplicated information is not always bad. What matters is clearly stating which document is the source of truth.
* JP: AI入口文書は便利だが、それ自体を正本化しすぎると、DecisionやTaskの正本境界が曖昧になる。 / EN: An AI entrypoint is useful, but if it becomes too authoritative, the source boundaries for decisions and tasks become unclear.

### conversation_summary

* JP: この会話では、M1-4で作成した5文書についてActive化レビューを行った。結果はConditional Goであり、`current-status.md` の現在地更新とTask正本境界の明記がP0修正として必要と判断した。P0修正後はM1-4をActive化してよい。 / EN: In this conversation, the five M1-4 documents were reviewed for activation. The result was Conditional Go. Updating `current-status.md` and clarifying the task source boundary were identified as P0 fixes. After these fixes, M1-4 can be activated.

### test_result

* JP: 責務分離は条件付きOK。主な懸念は `current-status.md` と `next-actions.md` のTask状態重複である。 / EN: Responsibility separation is conditionally OK. The main concern is duplicated task status between `current-status.md` and `next-actions.md`.
* JP: 正本境界は条件付きOK。Task正本を `next-actions.md` と明記すれば問題ない。 / EN: Source boundaries are conditionally OK. They are acceptable if `next-actions.md` is clearly stated as the task source of truth.
* JP: Phase 1整合はOK。RAG / API / MCP / Agent実装はP0タスクに混入していない。 / EN: Phase 1 alignment is OK. RAG, API, MCP, and Agent implementation are not mixed into P0 tasks.
* JP: AI入口性はOK。`ai-entrypoint.md` だけで読み順と制約を理解できる。 / EN: AI entry quality is OK. `ai-entrypoint.md` is enough to understand the reading order and constraints.
* JP: 完了条件は条件付きOK。`current-status.md` を最新状態へ更新すれば満たせる。 / EN: Completion conditions are conditionally OK. They can be met by updating `current-status.md` to the latest state.
