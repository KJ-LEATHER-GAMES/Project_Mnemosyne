## レビュー結論

**3件のADRは、方針そのものは妥当です。**
ただし、`active` 化前に修正すべき項目があります。特に重要なのは、**AIの `write` 権限の表現**と、**プロジェクト記憶の最終配置をPhase 1で確定したように見せないこと**です。

なお、ADRは `memory-policy.md` の判断を固定する文書であるため、ADR 3件だけでなく、整合対象として `docs/memory/memory-policy.md` も確認対象に含めるべきです。

Phase 1の基準文書では、Markdown docs と ADR を初期正本とし、AIは草案作成まで、正本反映は人間承認後とすること、また最終的な記憶配置方式はPhase 1では確定しないことが示されています。 

---

# 1. 必須修正項目：`active` 化前に反映すべき内容

| No. | 対象文書                           | 修正項目                        | 現状の問題                                                   | 修正方針                                                                               | 優先度 |
| --: | ------------------------------ | --------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------- | --- |
|   1 | `memory-policy.md` / `ADR-003` | AIの `write` 権限表現            | 「人間承認後ならAIがwrite可能」と読める箇所がある                            | Phase 1では**AIはdraft作成まで**、正本反映作業は**人間が実施**すると明記する                                  | P0  |
|   2 | `memory-policy.md` / `ADR-001` | プロジェクト記憶の配置方針               | `docs/projects/{project_code}/memory/` が最終確定配置のように見える   | Phase 1では**Mnemosyne側で検証用に管理する暫定構成**と明記し、最終配置方式はPhase 2以降の判断対象とする                  | P0  |
|   3 | 全4文書                           | `status` / `version` / 変更履歴 | 現在は `draft` のまま                                         | 承認後、`status: active`、`version: 1.0.0`、承認日・変更履歴を更新する                                | P0  |
|   4 | 全4文書                           | コードフェンスの `id="..."` 記法      | チャット表示用の属性がMarkdown本文に混入している                            | ` ```text id="..." ` や ` ```mermaid id="..." ` を通常のコードフェンスへ修正する                    | P0  |
|   5 | `ADR-002` / `memory-policy.md` | Context PackのPhase 1扱い      | 境界定義対象なのか、成果物対象なのかがやや曖昧                                 | Phase 1では**概念上の位置づけのみ定義**し、生成・運用はPhase 2以降と明記する                                    | P1  |
|   6 | `ADR-002`                      | 情報優先順位の扱い                   | M1-2成果物である `context-source-priority.md` の内容を先取りしたように見える | 本ADRには基本原則のみ残し、詳細手順・例外処理はM1-2で確定すると記載する                                            | P1  |
|   7 | `ADR-001` / `ADR-002`          | Markdown docs と ADR の競合時の扱い | 両方が正本であるため、矛盾時にどちらを採用するか判断が必要                           | 「ADRが判断根拠、Markdown docsが現行運用記述。矛盾時は自動採用せずIssue化する」と統一記載する                          | P1  |
|   8 | 全4文書                           | ADR状態名の統一                   | 将来的に `accepted` と `active` が混在する懸念がある                   | Phase 1では共通状態語として `draft / active / superseded / deprecated / archived` を使用すると明記する | P1  |

---

# 2. 最重要修正：AIの `write` 権限

## 2.1 問題点

現在のドラフトでは、以下のような表現があります。

> `write`: AI単独では禁止。人間確認・承認後のみ実施可能

この表現は、**承認後であればAI自身が正本ファイルへ書き込める**ようにも読めます。

しかし、Phase 1要件では、AIは正本へ直接書き込まず、草案作成までに限定することが明記されています。Phase 1では自動化を避け、Markdownによる人間レビュー可能な運用を優先する方針です。 

## 2.2 修正対象

| 文書                                                 | 修正対象箇所                                                                              |
| -------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `docs/memory/memory-policy.md`                     | `7.1 操作権限の基本ルール`、`7.4 write 権限`、`12.2 AIが行ってはならないこと`                                |
| `docs/adr/ADR-003-human-approved-memory-update.md` | `3. Decision`、`4.3 write`、`5. Human Approval Workflow`、`9. Implementation Guidance` |

## 2.3 修正後の方針

| 操作       | AI             | 人間        |
| -------- | -------------- | --------- |
| `read`   | 実施可能           | 必要に応じて参照  |
| `draft`  | 実施可能           | 内容をレビュー   |
| `write`  | Phase 1では実施しない | 承認後に正本へ反映 |
| `delete` | 実施しない          | 必要時に判断    |

## 2.4 修正文例

### `memory-policy.md` の権限表

| 操作       | 内容                 | Phase 1でのAI権限 | 人間の役割                |
| -------- | ------------------ | ------------: | -------------------- |
| `read`   | 正本文書、一次メモ、生成物を参照する |            許可 | 必要に応じて参照対象を指定する      |
| `draft`  | 新規文書案、修正案、差分案を作成する |            許可 | 採否を判断する              |
| `write`  | 正本文書へ確定内容を反映する     |            不可 | 承認後に人間が反映する          |
| `delete` | 正本または履歴を削除する       |            不可 | 必要性を判断し、原則は状態変更で対応する |

### `ADR-003` の Decision 修正文例

```md
Phase 1では、AIは正本文書の参照および更新草案の作成までを担う。

正本文書への反映作業は、人間がドラフトを確認・承認した後に、人間の管理下で実施する。

AIによる正本ファイルへの直接書き込み、自動反映、自動削除はPhase 1では許可しない。
```

---

# 3. 最重要修正：プロジェクト記憶の配置を確定扱いしない

## 3.1 問題点

`memory-policy.md` および `ADR-001` では、以下の構成を正本配置として提示しています。

```text
docs/projects/{project_code}/memory/
  project-summary.md
  current-status.md
  active-decisions.md
  next-actions.md
  ai-entrypoint.md
```

この構成自体は、Phase 1の検証用構成として妥当です。全体要件でもプロジェクト固有文書の初期正本配置としてこの構成が示されています。

一方、Phase 1作業計画書およびPhase要件では、**記憶の最終配置方式はPhase 1で確定しない**ことが制約として定められています。将来的には、Mnemosyneで集中管理する方式と、各プロジェクト側の `docs/memory` を正本とする方式の比較判断が残されています。

## 3.2 修正対象

| 文書                                                    | 修正対象箇所                                 |
| ----------------------------------------------------- | -------------------------------------- |
| `docs/memory/memory-policy.md`                        | `10. 情報種別ごとの保存方針`、`16. レビュー観点`         |
| `docs/adr/ADR-001-docs-as-source-of-memory.md`        | `7.2 各プロジェクトの記憶文書`、`8. Scope Boundary` |
| `docs/adr/ADR-002-memory-source-of-truth-boundary.md` | 必要に応じてPhase 1の配置境界を補足                  |

## 3.3 修正方針

以下の区別を明確にします。

| 項目                                     | Phase 1での扱い           |
| -------------------------------------- | --------------------- |
| 記憶文書の種類                                | 確定する                  |
| Markdown docs / ADR を正本とする方針           | 確定する                  |
| Mnemosyne自身・ATSへのテンプレート適用              | 実施する                  |
| `docs/projects/{project_code}/memory/` | Phase 1検証用の初期配置として用いる |
| 集中管理か各プロジェクト管理か                        | Phase 2以降の判断対象として残す   |

## 3.4 追記文例

### `ADR-001` への追記例

```md
### 7.3 Phase 1における配置の位置づけ

Phase 1では、Mnemosyne自身およびATSへの適用検証を行うため、
`docs/projects/{project_code}/memory/` を検証用の初期配置として使用する。

ただし、この配置を将来の最終的な正本配置方式として確定するものではない。

以下の選択肢については、Phase 2以降で改めて判断する。

- Mnemosyne側で全プロジェクト記憶を集中管理する方式
- 各プロジェクト側のdocsを正本とし、Mnemosyneは参照・集約する方式
```

---

# 4. 必須修正：`active` 化に伴うメタデータ更新

## 4.1 対象文書

| 文書                                                    |
| ----------------------------------------------------- |
| `docs/memory/memory-policy.md`                        |
| `docs/adr/ADR-001-docs-as-source-of-memory.md`        |
| `docs/adr/ADR-002-memory-source-of-truth-boundary.md` |
| `docs/adr/ADR-003-human-approved-memory-update.md`    |

## 4.2 更新項目

| 項目               | 現在           | Active化時        |
| ---------------- | ------------ | --------------- |
| `status`         | `draft`      | `active`        |
| `version`        | `0.1.0`      | `1.0.0`         |
| `updated_at`     | `2026-06-04` | 承認反映日           |
| `approved_at`    | なし           | 承認日を追加          |
| `change history` | 初版ドラフト作成     | 初版承認・Active化を追加 |

## 4.3 Front Matter例

```yaml
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
---
```

`approved_by` を入れる場合は、レビュー実施者を実際に記録する運用を採用するときだけ追加すべきです。現時点で不要に項目を増やす必要はありません。

---

# 5. 必須修正：コードブロックの表示用属性を除去

## 5.1 問題点

作成したドラフトには、以下のような記法が含まれています。

````md
```text id="hmrd3l"
````

````md
```mermaid id="terv9e"
````

これはチャット上の表示に由来する属性であり、リポジトリに保存するMarkdown文書としては不要です。

## 5.2 修正内容

以下のように変更します。

| 修正前                        | 修正後            |
| -------------------------- | -------------- |
| ` ```text id="hmrd3l" `    | ` ```text `    |
| ` ```mermaid id="terv9e" ` | ` ```mermaid ` |

## 5.3 対象文書

| 文書                 | 対象箇所                     |
| ------------------ | ------------------------ |
| `memory-policy.md` | 文書構成例、ADR例、状態遷移図、正本化フロー  |
| `ADR-001`          | 文書配置例、状態管理例              |
| `ADR-002`          | 後続文書一覧等                  |
| `ADR-003`          | Human Approval Workflow図 |

---

# 6. 推奨修正：Context PackのPhase 1境界をより明確にする

## 6.1 問題点

Context Packは、今回のドラフトでは「生成物」として適切に整理されています。

ただし、Phase 1ではContext Pack Builderの実装やContext Pack生成そのものは対象外であり、**Phase 1で行うのは位置づけと入力前提の整理まで**です。全体要件でも、Context PackはPhase 2以降に正本文書から生成される成果物と整理されています。

## 6.2 修正対象

| 文書                 | 修正対象箇所                                                     |
| ------------------ | ---------------------------------------------------------- |
| `memory-policy.md` | `5.5 生成物`、`10.7 Context Pack`、`11.5 Vector Store / RAG` 周辺 |
| `ADR-002`          | `5.3 Context Pack`、`11. Scope Boundary`                    |

## 6.3 追記文例

```md
Phase 1では、Context Packを「正本文書から生成されるAI入力用の生成物」として位置づける。

ただし、Context Packのフォーマット定義、生成処理、更新処理、出力先の確定はPhase 2以降で扱う。
```

---

# 7. 推奨修正：参照優先順位をM1-2へ適切に委譲する

## 7.1 問題点

`ADR-002` と `memory-policy.md` では、既に参照優先順位の基本案が記載されています。

これは方針として必要ですが、Phase計画上、`context-source-priority.md` は **M1-2：Memory Taxonomy定義** の成果物です。

そのため、M1-1の文書で詳細手順まで確定したように書くと、M1-2の責務が曖昧になります。

## 7.2 修正方針

M1-1では、以下の基本原則までを確定します。

* `active` な正本文書を優先する
* 一次メモや生成物を正本より優先しない
* 正本同士が矛盾した場合は自動判断せずIssue化する

以下はM1-2へ委譲します。

* 文書種別間の詳細優先順位
* 同一状態同士の競合処理
* 矛盾検出時の修正手順
* `superseded` への変更条件
* AIが参照文書を選択する際の具体的ルール

## 7.3 修正文例

```md
本書では、正本、副本、一次メモ、生成物の基本的な優先関係のみを定義する。

同一論点について複数の正本文書が存在する場合の詳細な参照優先順位および矛盾解消手順は、
M1-2の成果物である `docs/memory/context-source-priority.md` で定義する。
```

---

# 8. 推奨修正：Markdown docs と ADR の関係を統一表現にする

## 8.1 現状評価

現在のドラフトは、おおむね以下の役割分担になっています。

| 文書            | 役割                    |
| ------------- | --------------------- |
| Markdown docs | 現在利用するルール、現在状態、次アクション |
| ADR           | 重要判断の背景、理由、影響、履歴      |

この分担は妥当です。

## 8.2 追加すべき一文

ただし、両方が正本であるため、以下を全関連文書で統一して記載した方が安全です。

```md
Markdown docsは現在の運用状態を示し、ADRは重要判断の根拠と履歴を示す。

両者が矛盾する場合、AIは独自に一方を正として確定せず、
矛盾をIssueとして提示し、人間による修正判断を必要とする。
```

## 8.3 対象文書

| 文書                 | 反映要否          |
| ------------------ | ------------- |
| `memory-policy.md` | 反映推奨          |
| `ADR-001`          | 反映推奨          |
| `ADR-002`          | 既存記載を上記表現へ揃える |
| `ADR-003`          | 直接修正不要        |

---

# 9. 推奨修正：状態語を `active` に統一する

## 9.1 背景

Phase計画の参照優先順位例には「Accepted / Active な ADR」という表現がありますが、M1-1で定義する鮮度状態は以下です。

* `draft`
* `active`
* `superseded`
* `deprecated`
* `archived`

そのため、Phase 1の正式運用では `accepted` を別状態として追加せず、**承認済み・現在有効な文書は `active` とする**方がシンプルです。

## 9.2 追記候補

```md
Phase 1では、Markdown docsおよびADRに共通の状態語を使用する。

人間レビューを経て現在有効となったADRは `active` とし、
`accepted` を別の状態値としては使用しない。
```

---

# 10. 文書別の変更リスト

## 10.1 `docs/memory/memory-policy.md`

| No. | 修正内容                                                    | 必須度 |
| --: | ------------------------------------------------------- | --- |
|   1 | `write` を「AI不可、人間が承認後に反映」と明確化する                         | 必須  |
|   2 | `docs/projects/{project_code}/memory/` を検証用初期配置として位置づける | 必須  |
|   3 | Context PackはPhase 1で概念定義のみ、生成はPhase 2以降と明記する           | 推奨  |
|   4 | 参照優先順位の詳細は `context-source-priority.md` へ委譲する           | 推奨  |
|   5 | Markdown docsとADRの矛盾時はIssue化すると統一記載する                   | 推奨  |
|   6 | コードフェンスの `id` 属性を削除する                                   | 必須  |
|   7 | 承認時に `status: active`、`version: 1.0.0` 等へ更新する           | 必須  |

---

## 10.2 `docs/adr/ADR-001-docs-as-source-of-memory.md`

| No. | 修正内容                                                                     | 必須度 |
| --: | ------------------------------------------------------------------------ | --- |
|   1 | `docs/projects/{project_code}/memory/` はPhase 1検証用の初期配置であり、最終方式ではないと明記する | 必須  |
|   2 | 最終配置方式はPhase 2以降の判断対象としてScope Boundaryへ追加する                              | 必須  |
|   3 | Markdown docsとADRの競合時の扱いを統一する                                            | 推奨  |
|   4 | コードフェンスの `id` 属性を削除する                                                    | 必須  |
|   5 | `status`、`version`、承認日、変更履歴をActive化用に更新する                                | 必須  |

---

## 10.3 `docs/adr/ADR-002-memory-source-of-truth-boundary.md`

| No. | 修正内容                                                | 必須度 |
| --: | --------------------------------------------------- | --- |
|   1 | Context PackはPhase 1で位置づけのみ定義し、生成・運用はPhase 2以降と補足する | 推奨  |
|   2 | 参照優先順位は基本原則のみとし、詳細はM1-2へ委譲する                        | 推奨  |
|   3 | ADRとMarkdown docsが矛盾した場合はIssue化する表現へ統一する            | 推奨  |
|   4 | コードフェンスの `id` 属性を削除する                               | 必須  |
|   5 | `status`、`version`、承認日、変更履歴をActive化用に更新する           | 必須  |

---

## 10.4 `docs/adr/ADR-003-human-approved-memory-update.md`

| No. | 修正内容                                          | 必須度 |
| --: | --------------------------------------------- | --- |
|   1 | AIの `write` を「承認後なら可能」ではなく「Phase 1では不可」と修正する  | 必須  |
|   2 | 正本反映主体を「人間」と明記する                              | 必須  |
|   3 | Human Approval Workflow図で、正本反映工程の担当を人間として明示する | 必須  |
|   4 | 将来のPR生成や半自動化は別ADRで検討する旨を補足する                  | 推奨  |
|   5 | コードフェンスの `id` 属性を削除する                         | 必須  |
|   6 | `status`、`version`、承認日、変更履歴をActive化用に更新する     | 必須  |

---

# 11. Active化の判断

## 11.1 現時点での判定

| 文書                                           | 現時点判定      | 理由                                  |
| -------------------------------------------- | ---------- | ----------------------------------- |
| `memory-policy.md`                           | 条件付き承認可能   | 方針は妥当だが、AI write権限と配置方針の明確化が必要      |
| `ADR-001-docs-as-source-of-memory.md`        | 条件付き承認可能   | 正本判断は妥当だが、最終配置未確定の明記が必要             |
| `ADR-002-memory-source-of-truth-boundary.md` | 軽微修正後に承認可能 | 境界整理は妥当。M1-2との責務境界を明確にすると安定する       |
| `ADR-003-human-approved-memory-update.md`    | 修正必須       | AIのwrite可否をPhase 1要件に合わせて明確化する必要がある |

## 11.2 Active化前に最低限必要な修正

以下の5点を反映すれば、M1-1成果物として `active` 化して問題ありません。

| No. | 最低限必要な修正                                         |
| --: | ------------------------------------------------ |
|   1 | Phase 1ではAIは `draft` まで、正本反映は人間が行うと統一する          |
|   2 | プロジェクト記憶の配置はPhase 1検証用の初期配置であり、最終方式ではないと明記する     |
|   3 | Context PackはPhase 1で位置づけのみ定義し、生成はPhase 2以降と整理する |
|   4 | コードフェンスの表示用 `id` 属性を削除する                         |
|   5 | 承認後に `status: active`、`version: 1.0.0`、変更履歴を更新する |

---

## 推奨する次作業

次は、上記修正を反映した **`memory-policy.md` + ADR 3件のActive化用最終版** を一括で作成するのが適切です。その後、M1-1完了判定を行い、M1-2：`memory-taxonomy.md` と `context-source-priority.md` の作成へ移れます。

## Conversation Memory

### fact

* `docs/phases/phase-1-memory-foundation.md` は完成済みであり、M1-0：Phase方針確定は完了扱いとして進行している。 / `docs/phases/phase-1-memory-foundation.md` is complete, and M1-0: Phase policy confirmation is treated as complete.
* M1-1の成果物として、`docs/memory/memory-policy.md` とADR 3件のドラフトが作成済みである。 / Drafts of `docs/memory/memory-policy.md` and three ADRs have been created as M1-1 deliverables.
* Phase 1ではMarkdown docsおよびADRを初期正本とし、Notionは任意の副本、PostgreSQL・Vector Store・Context Pack Builder・MCP等は実装対象外としている。 / In Phase 1, Markdown docs and ADRs are initial sources of truth; Notion is an optional replica; PostgreSQL, Vector Store, Context Pack Builder, MCP, and similar implementations are out of scope.
* Phase要件では、記憶の最終配置方式をPhase 1で確定せず、Mnemosyne側で検証用に管理する方針が定義されている。 / Phase requirements specify that the final memory placement method is not fixed in Phase 1, and memory is managed on the Mnemosyne side for validation.

### decision

* M1-1成果物のActive化レビューでは、ADR 3件だけでなく、基礎方針である `memory-policy.md` も整合対象として確認する。 / The M1-1 activation review covers not only the three ADRs but also the foundational `memory-policy.md` for consistency.
* Active化前の必須修正として、AIの `write` 権限を「Phase 1では不可、正本反映は人間が実施」と統一する必要があると判断した。 / Before activation, AI `write` permissions must be standardized as unavailable in Phase 1, with humans applying approved source updates.
* `docs/projects/{project_code}/memory/` はPhase 1の検証用初期配置として扱い、将来の最終配置方式としては確定しない方針で修正する必要があると判断した。 / `docs/projects/{project_code}/memory/` must be treated as an initial validation layout for Phase 1, not as the final future placement model.
* Context PackはPhase 1で概念上の位置づけのみ確定し、生成・運用はPhase 2以降とする整理が適切である。 / Context Pack should be positioned conceptually in Phase 1, while generation and operation belong to Phase 2 or later.

### task

* `memory-policy.md` およびADR 3件に、Active化前の必須修正を反映する。 / Apply the mandatory pre-activation revisions to `memory-policy.md` and the three ADRs.
* コードフェンスに混入した表示用 `id` 属性を削除する。 / Remove display-only `id` attributes accidentally included in code fences.
* 修正完了後、4文書の `status` を `active`、`version` を `1.0.0` とし、変更履歴を更新する。 / After revisions, change the four documents to `status: active`, `version: 1.0.0`, and update their change histories.
* M1-1完了後、M1-2として `memory-taxonomy.md` および `context-source-priority.md` を作成する。 / After completing M1-1, create `memory-taxonomy.md` and `context-source-priority.md` for M1-2.

### preference

* ユーザーは、Phaseおよびマイルストーン単位で、設計判断・成果物・完了条件を明確化しながら進めることを重視している。 / The user values clear design decisions, deliverables, and completion criteria by phase and milestone.
* ユーザーは、AIとの会話内容を再利用可能な設計資産へ変換する進め方を採用している。 / The user adopts an approach of converting AI conversation content into reusable design assets.

### constraint

* Phase 1では、AIは正本文書の参照および草案作成までを担い、正本への直接反映や削除は行わない。 / In Phase 1, AI reads source documents and creates drafts only; it does not directly update or delete sources of truth.
* 生のAIチャット履歴は一次メモであり、そのまま正本として扱わない。 / Raw AI chat history is a primary note and is not treated directly as a source of truth.
* Notion、PostgreSQL、Vector Store、RAG、API、MCP、Agent実行基盤は、Phase 1の必須実装対象ではない。 / Notion, PostgreSQL, Vector Store, RAG, API, MCP, and Agent execution infrastructure are not mandatory Phase 1 implementation targets.
* `context-source-priority.md` はM1-2の成果物であり、M1-1では参照優先順位の基本原則までを定義する。 / `context-source-priority.md` is an M1-2 deliverable; M1-1 should define only basic source-priority principles.

### issue

* `ADR-003` の現行ドラフトは、人間承認後であればAIが `write` できるようにも読め、Phase 1要件との誤解を招く。 / The current ADR-003 draft can be read as allowing AI `write` after human approval, creating ambiguity against Phase 1 requirements.
* `ADR-001` および `memory-policy.md` は、プロジェクト記憶の配置を将来の最終構成として確定したように読める余地がある。 / ADR-001 and `memory-policy.md` may be read as fixing the project-memory placement as the final future structure.
* 作成済みドラフトには、保存用Markdownには不要なコードフェンスの `id` 属性が含まれている。 / The created drafts include code-fence `id` attributes that are unnecessary in repository Markdown.
* M1-1文書に参照優先順位の詳細を書き込みすぎると、M1-2成果物との責務が重複する。 / Defining too much detail about source priority in M1-1 documents would overlap with M1-2 deliverables.

### idea

* Active化用最終版では、4文書を一括で更新し、同一の用語、状態値、承認ルールを揃える。 / In the activation-ready final version, update all four documents together to align terminology, status values, and approval rules.
* 将来の自動化では、AIによる直接writeではなく、差分案またはPull Request相当の提案を人間が承認する方式を検討する。 / In future automation, consider human approval of AI-generated diffs or pull-request-like proposals rather than direct AI writes.

### article_note

* AI外部記憶では、正本を定義するだけでなく、「誰が正本を更新できるか」「生成物はいつ古くなるか」「配置方針はいつ確定するか」まで決める必要がある。 / In AI external memory, it is necessary to decide not only what the source of truth is, but also who may update it, when generated artifacts become stale, and when placement decisions are finalized.
* 設計文書をActive化する前のレビューでは、内容の妥当性だけでなく、未決事項を誤って確定扱いしていないかを確認することが重要である。 / Before activating design documents, it is important to confirm not only correctness but also whether unresolved matters have accidentally been treated as settled.

### conversation_summary

* このチャットでは、Project Mnemosyne Phase 1のM1-0を完了扱いとし、M1-1：Memory Policy定義の文書作成とActive化レビューを進めている。`memory-policy.md` とADR 3件のドラフトを作成した後、Phase計画・要件との整合を確認し、Active化前に必要な修正として、AI write権限の明確化、記憶配置の暫定性明記、Context Pack境界の補足、表示用属性の除去、メタデータ更新を特定した。 / This chat treats M1-0 of Project Mnemosyne Phase 1 as complete and is progressing through document creation and activation review for M1-1: Memory Policy Definition. After drafting `memory-policy.md` and three ADRs, the review identified necessary pre-activation changes: clarifying AI write restrictions, marking memory placement as provisional, clarifying the Context Pack boundary, removing display-only attributes, and updating metadata.

### test_result

* `memory-policy.md` とADR 3件は、正本・副本・一次メモ・生成物、AI操作境界、情報鮮度の主要方針をカバーしており、方針レベルではM1-1要件に適合する。 / `memory-policy.md` and the three ADRs cover the main policies for sources of truth, replicas, primary notes, generated artifacts, AI operation boundaries, and information freshness, and are aligned with M1-1 at the policy level.
* `ADR-003` にはPhase 1のAI write制約と誤解され得る表現があり、Active化前の修正が必須と判定した。 / ADR-003 contains wording that could be misunderstood regarding Phase 1 AI write restrictions, and revision is mandatory before activation.
* 必須修正5点を反映した後であれば、4文書をM1-1のActive成果物として扱えると判定した。 / After applying the five mandatory revisions, the four documents can be treated as active M1-1 deliverables.
