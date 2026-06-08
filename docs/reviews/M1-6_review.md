## レビュー結果：M1-6 Active化に必要な修正点

3文書とも、方向性は **Active化可能な水準に近い** です。
ただし、Active化前に直すべき点があります。

特に重要なのは以下です。

1. **`conversation-summary.md` を標準必須文書に見せない**
2. **draft文書をContext Packに含める条件を厳格化する**
3. **Phase 2で決めるべき内容を、Phase 1で決定済みに見せない**
4. **Project Registryの `required_memory_docs` の意味を明確化する**

---

# P0：Active化前に必須の修正

## P0一覧

| ID              | 対象                                      | 修正内容                                                                           | 理由                                                   |
| --------------- | --------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------- |
| M1-6-REV-P0-001 | ADR-004                                 | `conversation-summary.md` を標準プロジェクト記憶5文書と同列の必須文書に見えないよう修正する                    | `conversation-summary` は一次整理・更新候補であり、正本5文書とは責務が異なるため |
| M1-6-REV-P0-002 | ADR-004                                 | 「5文書 + conversation-summary」という表現を、「標準プロジェクト記憶5文書」と「会話整理テンプレート」に分離する           | Phase 2で必須読込対象を誤認するリスクがあるため                          |
| M1-6-REV-P0-003 | ADR-004 / phase-2-input-requirements.md | `required_memory_docs` の意味を「常時読み込む文書」ではなく「Project Registry上で存在検証する標準文書」に修正する   | Agentごとの必要Context選択と矛盾するため                           |
| M1-6-REV-P0-004 | phase-2-input-requirements.md           | `source_status_policy: active_preferred_draft_allowed_with_warning` の使用条件を限定する | draft混入を通常運用化すると、正本優先ルールが弱くなるため                      |
| M1-6-REV-P0-005 | phase-2-input-requirements.md           | draft文書をContext Packに含められる条件を明記する                                              | AIが未承認情報を確定情報として扱うリスクを防ぐため                           |
| M1-6-REV-P0-006 | ADR-005 / phase-2-input-requirements.md | Recent Conversation Contextは「未反映の一次情報」であり、Active正本より優先しないと明記する                 | M1-2で整理した参照優先順位と整合させるため                              |
| M1-6-REV-P0-007 | phase-2-input-requirements.md           | CLIコマンド、出力先、YAML構造を「候補」であり「Phase 2で決定」と明記する                                    | Phase 1でPhase 2実装詳細を確定したように見えるため                     |
| M1-6-REV-P0-008 | ADR-005                                 | Agent ContextはProject Memoryの正本ではなく、Agent実行設定・振る舞い定義であると明記する                   | Agent定義とProject Contextの分離をさらに明確化するため                |
| M1-6-REV-P0-009 | 3文書共通                                   | Active化時に frontmatter の `status`、`version`、`approved_at`、Change History を更新する  | draft状態のままではActive文書として扱えないため                        |
| M1-6-REV-P0-010 | phase-2-input-requirements.md           | ADR-004 / ADR-005 の前提statusをActive化後の状態に更新する                                   | Phase 2入力要件がdraft ADRを前提にしたまま残るため                    |

---

## P0詳細

### M1-6-REV-P0-001 / 002

## `conversation-summary.md` の位置づけ修正

ADR-004では、標準文書セットの表に `conversation-summary.md` が含まれています。
ただし、これまでの設計では、プロジェクト記憶の標準正本は以下の5文書です。

```text
project-summary.md
current-status.md
active-decisions.md
next-actions.md
ai-entrypoint.md
```

`conversation-summary.md` は、会話を整理し、Fact / Decision候補 / Task候補 / Issue候補を抽出するための **一次整理文書** です。
そのため、Active化前に以下のように分離した方が安全です。

### 修正方針

```text
標準プロジェクト記憶文書:
- project-summary.md
- current-status.md
- active-decisions.md
- next-actions.md
- ai-entrypoint.md

会話整理テンプレート:
- conversation-summary.template.md
```

### 理由

ここを曖昧にすると、Phase 2のContext Builderが `conversation-summary.md` を常時読込対象として扱い、未承認の会話情報を正本扱いするリスクがあります。

---

### M1-6-REV-P0-003

## `required_memory_docs` の意味修正

phase-2-input-requirements.mdでは、Project Registryの `required_memory_docs` が「常時読み込む標準文書」と説明されています。

これは危険です。

`required_memory_docs` は、以下の意味にした方がよいです。

```text
Project Registry上で、そのプロジェクトが標準記憶構造を満たしているか確認するための必須文書。
Context Packへ常に全文投入することを意味しない。
```

### 理由

Agentごとに必要Contextは異なります。

たとえば、ADR整理Agentなら `project-summary` / `active-decisions` / ADR が中心。
実装レビューAgentなら `current-status` / `active-decisions` / source / test docs が重要です。

`required_memory_docs = 常時読み込み` にすると、Agent Context分離の意味が弱くなります。

---

### M1-6-REV-P0-004 / 005

## draft文書の扱いを厳格化

現在の候補では以下の方針があります。

```yaml
source_status_policy: active_preferred_draft_allowed_with_warning
```

この表現自体は使えますが、条件を明記しないと危険です。

### 修正方針

draft文書を含めてよいのは、以下のような場合に限定する。

| 条件                          | draftを含めてよいか |
| --------------------------- | ------------ |
| Active化レビュー中の文書をレビューする      | yes          |
| draft文書そのものを修正対象にする         | yes          |
| Active正本が存在せず、ユーザーが明示的に許可した | conditional  |
| 通常のContext Pack生成           | no / warning |
| 確定判断の根拠として使う                | no           |

### 追記すべき文言

```text
draft sourceは、明示的にレビュー対象または作業対象として指定された場合のみContext Packに含める。
draft sourceに含まれる情報は、Active Decision、確定Task、確定Constraintとして扱ってはならない。
```

---

### M1-6-REV-P0-006

## Recent Conversation Contextの優先順位を明記

ADR-005ではRecent Conversation ContextがContext構成に入っています。
これは必要ですが、扱いを明確化する必要があります。

### 修正方針

```text
Recent Conversation Contextは、直近の補足・未反映情報として扱う。
Active正本と競合する場合、Active正本を優先し、会話内容はConflict候補または更新候補として扱う。
```

### 理由

会話情報は便利ですが、Project Mnemosyneの基本方針では、正本はMarkdown docs / ADRです。
会話が正本を上書きしてしまうと、記憶基盤の意味が崩れます。

---

### M1-6-REV-P0-007

## Phase 2実装候補を「未決定」と明示

phase-2-input-requirements.mdには、CLIコマンド、Context Pack出力先、YAML schema候補が具体的に書かれています。

これは有用ですが、Active化時点では以下を明記した方がよいです。

```text
本書に記載するYAML、CLI、出力先、Context Pack構成はPhase 2設計の入力候補であり、Phase 1時点の確定実装仕様ではない。
最終仕様はPhase 2の各TaskまたはADRで決定する。
```

### 理由

Phase 1の成果物としては「Phase 2へ渡す入力要件」までです。
実装仕様を決め切ったように見えると、Phase 2の設計自由度が落ちます。

---

### M1-6-REV-P0-008

## Agent Contextの正本性を明記

ADR-005ではAgent ContextとProject Contextの分離方針は十分整理されています。
ただし、Agent Contextそのものの位置づけをもう少し明確にした方がよいです。

### 追記案

```text
Agent Contextは、Project Memoryの正本ではない。
Agent Contextは、AIにどの役割・制約・出力形式で作業させるかを定義する実行設定である。
ProjectのFact、Decision、Task、Issue、ConstraintはProject Memory側に保持する。
```

---

### M1-6-REV-P0-009 / 010

## Active化時のメタデータ更新

Active化時は3文書共通で以下を更新します。

```yaml
status: "active"
version: "1.0.0"
approved_at: "2026-06-05"
updated_at: "2026-06-05"
```

Change Historyも以下のように更新します。

```markdown
| 1.0.0 | 2026-06-05 | active | Active化レビュー指摘を反映し、M1-6成果物としてActive化。 | user |
```

また、phase-2-input-requirements.md の前提表では、ADR-004 / ADR-005 のstatusが draft のままになっているため、Active化後は `active` に更新します。

---

# P1：Active化時に反映推奨の修正

## P1一覧

| ID              | 対象                                                | 修正内容                                                     | 理由                                                     |
| --------------- | ------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------ |
| M1-6-REV-P1-001 | ADR-004 / ADR-005 / phase-2-input-requirements.md | 用語対応表を追加する                                               | `project-summary` と `project_summary` などの表記揺れを防ぐため     |
| M1-6-REV-P1-002 | ADR-005                                           | Context Packの「解決順序」と「出力順序」を分ける                           | `ai-entrypoint.md` を最初に読む意味を誤解しにくくするため                 |
| M1-6-REV-P1-003 | phase-2-input-requirements.md                     | `projects.yaml` と `agents.yaml` の責務境界を図または表で追加する         | Phase 2実装時の迷いを減らすため                                    |
| M1-6-REV-P1-004 | phase-2-input-requirements.md                     | Open DecisionsとOpen Issuesの重複を整理する                       | ADR側のOpen IssuesとPhase 2側のOpen Decisionsが分散しすぎるため      |
| M1-6-REV-P1-005 | ADR-005 / phase-2-input-requirements.md           | 初期Agent候補の優先順位を統一する                                      | ADR-005とPhase 2入力要件で初期Agentの扱いが少しずれるため                 |
| M1-6-REV-P1-006 | phase-2-input-requirements.md                     | `output_type` の候補値を一覧化する                                 | Context Build Requestの実装時に型定義しやすくするため                  |
| M1-6-REV-P1-007 | phase-2-input-requirements.md                     | `additional_sources` の指定形式を整理する                          | file path / glob / directory / explicit file の扱いが曖昧なため |
| M1-6-REV-P1-008 | ADR-004                                           | 小規模プロジェクト向けの簡易運用方針を補足する                                  | 5文書構成が重い場合の逃げ道を安全に定義するため                               |
| M1-6-REV-P1-009 | ADR-005                                           | `write_policy` の候補値を明確化する                                | `draft_only` 以外の将来拡張時に混乱しないようにするため                     |
| M1-6-REV-P1-010 | phase-2-input-requirements.md                     | Phase 2 Start Acceptance CriteriaのStatusをActive化後基準へ更新する | `draft` のままだとPhase 2着手可否が判断しにくいため                      |

---

## P1詳細

### M1-6-REV-P1-001

## 用語対応表の追加

文書内で以下のような表記が混在しています。

| Markdown文書名           | memory_type候補      |
| --------------------- | ------------------ |
| `project-summary.md`  | `project_summary`  |
| `current-status.md`   | `current_status`   |
| `active-decisions.md` | `active_decisions` |
| `next-actions.md`     | `next_actions`     |
| `ai-entrypoint.md`    | `ai_entrypoint`    |

この対応表を追加すると、Phase 2のschema設計時にブレが減ります。

---

### M1-6-REV-P1-002

## Context Packの解決順序と出力順序を分ける

現在は以下の順序が示されています。

```text
1. ai-entrypoint.md
2. project-summary.md
3. current-status.md
4. active-decisions.md
5. next-actions.md
```

これは「AI入口としてまず読む」という意味では妥当です。
ただし、Context Builderの内部処理としては、以下を分けた方がよいです。

| 種別               | 意味                      |
| ---------------- | ----------------------- |
| Resolution Order | Builderが文書を探索・検証する順序    |
| Rendering Order  | AIへ渡すContext Pack内の表示順序 |
| Source Priority  | 競合時にどの情報を優先するか          |

特に `ai-entrypoint.md` は入口ですが、Decision / Task / Issueの正本ではありません。
そのため、読み順と優先順位を混同しないようにします。

---

### M1-6-REV-P1-003

## Registry責務境界の追加

phase-2-input-requirements.md に以下のような表を追加すると、Phase 2実装に入りやすくなります。

| Registry              | 持つもの                                      | 持たないもの                           |
| --------------------- | ----------------------------------------- | -------------------------------- |
| Project Registry      | project_code、memory_root、標準文書、任意source    | Agentの役割、出力形式                    |
| Agent Registry        | agent_code、必要Context、出力契約、禁止事項            | Project固有のFact / Decision / Task |
| Context Build Request | 今回のtask_request、追加source、recent_context指定 | 正本情報そのもの                         |
| Context Pack          | AIへ渡す生成物                                  | 正本更新結果                           |

---

### M1-6-REV-P1-004

## Open Issues / Open Decisionsの重複整理

ADR-004 / ADR-005にもOpen Issuesがあり、phase-2-input-requirements.mdにもPhase 2 Open Decisionsがあります。

Active化時は、以下の方針にすると管理しやすいです。

```text
ADR側:
- 方針決定に関する未解決論点を残す

phase-2-input-requirements.md側:
- Phase 2実装前に決める必要がある設計論点を残す
```

重複するものは、片方を正として、もう片方は参照にするのがよいです。

---

### M1-6-REV-P1-005

## 初期Agent候補の優先順位統一

ADR-005では、初期Agent候補として以下が挙がっています。

* `adr_writer`
* `implementation_reviewer`
* `requirements_writer`
* `task_planner`
* `article_writer`

phase-2-input-requirements.mdでは、P0 / P1 / Later の扱いがあります。

Active化時は以下に統一するのがよいです。

| Agent                     | Phase 2優先度 | 理由                         |
| ------------------------- | ---------- | -------------------------- |
| `adr_writer`              | P0         | Phase 1〜2の設計判断整理に必須        |
| `requirements_writer`     | P0         | Phase 2要件定義に直結             |
| `implementation_reviewer` | P1         | ATS検証で有用だが、Context追加が必要    |
| `task_planner`            | P1         | `next-actions.md` 運用と相性がよい |
| `article_writer`          | Later      | 発信には有用だが、記憶基盤MVPからは外す      |

---

# Active化判定

## 判定

**Conditional Active可能** です。

P0を反映すれば、M1-6成果物としてActive化して問題ありません。
P1は同時反映推奨ですが、必須ではありません。

---

## 優先修正順

Active化作業では、以下の順で直すのがよいです。

1. `conversation-summary` の位置づけ修正
2. `required_memory_docs` の意味修正
3. draft source / recent context の扱い修正
4. Phase 2実装候補を「候補」と明記
5. Agent Contextの正本性を明記
6. 用語対応表とRegistry責務表を追加
7. frontmatter / Change History / status更新

---

# 修正対象別まとめ

## ADR-004

### P0

* `conversation-summary.md` を標準必須文書から分離する
* 「5文書 + conversation-summary」表現を修正する
* `required_memory_docs` を「存在検証対象」として定義する
* Active化メタデータへ更新する

### P1

* 用語対応表を追加する
* 小規模プロジェクト向け簡易運用方針を補足する
* Project Registry候補はPhase 2入力候補であると明記する

---

## ADR-005

### P0

* Agent ContextはProject Memory正本ではないと明記する
* Recent Conversation ContextはActive正本より優先しないと明記する
* Active化メタデータへ更新する

### P1

* Context Packの解決順序 / 出力順序 / 参照優先順位を分ける
* 初期Agent候補の優先順位をphase-2-input-requirements.mdと統一する
* `write_policy` の候補値を補足する

---

## phase-2-input-requirements.md

### P0

* ADR-004 / ADR-005のstatusをActive化後に合わせる
* `required_memory_docs` の説明を修正する
* draft文書を含める条件を明記する
* Recent Conversation Contextの扱いを明記する
* YAML / CLI / 出力先はPhase 2候補であり確定仕様ではないと明記する
* Active化メタデータへ更新する

### P1

* Registry責務境界表を追加する
* `output_type` 候補値を一覧化する
* `additional_sources` の指定形式を整理する
* Open Decisionsの重複を整理する
* Acceptance CriteriaのStatusをActive化後基準へ更新する

---

## まとめ / Summary

* 日本語：M1-6の3文書は、P0を反映すればActive化可能です。最重要修正は、`conversation-summary` の位置づけ、draft情報の扱い、`required_memory_docs` の意味、Phase 2候補仕様の未決定明示です。
* English: The three M1-6 documents can be activated after fixing the P0 items. The key fixes are the role of `conversation-summary`, draft source handling, the meaning of `required_memory_docs`, and making Phase 2 candidate specs clearly non-final.

## Conversation Memory

### fact

* M1-6「Agent接続方針整理」のドラフト3文書をレビューした。
* レビュー対象は以下の3件。

  * `docs/adr/ADR-004-project-independent-memory-template.md`
  * `docs/adr/ADR-005-agent-context-separation.md`
  * `docs/phases/phase-2-input-requirements.md`
* 3文書は方向性としてActive化可能な水準に近い。
* Active化にはP0修正が必要。
* P0修正の中心は、`conversation-summary` の位置づけ、draft sourceの扱い、`required_memory_docs` の意味、Phase 2候補仕様の扱いである。

### decision

* レビュー判定は「Conditional Active可能」とした。
* P0修正を反映すればM1-6成果物としてActive化可能と判断した。
* P1修正は同時反映推奨だが、Active化必須ではないと整理した。

### task

* 次に、P0修正を3文書へ反映する。
* 可能であればP1修正も同時に反映する。
* 修正後、frontmatterの `status`、`version`、`approved_at`、Change HistoryをActive化用に更新する。

### preference

* ユーザーは、ドラフト作成後にレビューし、P0/P1修正点を明確化してからActive化する進め方を採用している。
* 正本・副本・生成物・一次整理情報の責務分離を重視する。
* Phase 2へ接続できる入力要件を明確にしたい。

### constraint

* Phase 1ではAgent実装、Context Pack CLI実装、RAG、API、MCP、UIは対象外。
* AIはdraft作成までで、正本反映は人間承認後とする。
* Context Packは正本ではなく生成物である。
* Conversation SummaryはActive正本ではなく、一次整理・更新候補として扱う。
* Recent Conversation ContextはActive正本より優先しない。

### issue

* `conversation-summary.md` が標準必須文書に見える表現がある。
* `required_memory_docs` が「常時読み込む文書」と読める表現になっている。
* draft文書をContext Packに含める条件がまだ厳密ではない。
* Phase 2のYAML / CLI / 出力先候補が、確定仕様に見える可能性がある。
* ADR-004 / ADR-005 / phase-2-input-requirements.md の用語表記に一部揺れがある。

### idea

* `required_memory_docs` は「存在検証対象」とし、Context Packへの投入対象はAgent Contextで決める。
* Context Packでは、Resolution Order、Rendering Order、Source Priorityを分ける。
* Project Registry、Agent Registry、Context Build Request、Context Packの責務境界表を追加する。
* `output_type` と `write_policy` は候補値を定義するとPhase 2実装に入りやすい。

### article_note

* 「Agent定義は何をするか、Project Contextは何について行うか、Task Contextは今回何を処理するか」という分離は、Project Mnemosyneの設計思想を説明する記事素材になる。
* `conversation-summary` を正本にせず、更新候補として扱う設計は、AI外部記憶における誤記憶防止の重要論点になる。
* `required_memory_docs` を「常時読み込み」ではなく「存在検証」とする考え方は、Context Packの肥大化防止とAgent再利用性の両立例として説明できる。

### conversation_summary

* 日本語：このチャットでは、M1-6のドラフト3文書を作成した後、Active化に必要なレビューを実施した。レビュー結果として、P0/P1修正点を整理し、P0反映後にConditional Active可能と判断した。現在地は「M1-6レビュー完了 / Active化修正前」。
* English: In this chat, we created three M1-6 draft documents and reviewed them for activation. I listed P0 and P1 fixes and judged that the documents can become active after P0 fixes. The current status is “M1-6 review done / before activation fixes.”

### test_result

* 3文書の内容を確認し、Active化観点でレビューした。
* P0修正10件、P1修正10件を洗い出した。
* 判定は「Conditional Active可能」。
