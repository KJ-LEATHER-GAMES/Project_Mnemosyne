## Active化レビュー結果

結論として、**M2-4ドラフトは完了条件の主要項目をおおむね満たしています**。
ただし、**そのままActive化は非推奨**です。理由は、Context Builder実装時に解釈が分岐しそうな点が残っているためです。

判定は以下です。

| 判定        | 内容                                                                                                               |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| Active化可否 | **条件付きNG**                                                                                                       |
| 理由        | 完了条件は概ね満たすが、`output_type` / `output_contract_id`、Recent Context default、Additional Sources照合、override扱いに仕様曖昧さが残る |
| 推奨対応      | P0を修正後、Active化可能                                                                                                 |
| 修正規模      | 小〜中                                                                                                              |

---

## 1. 完了条件との照合

| 完了条件                                                          |       判定 | コメント                                                                             |
| ------------------------------------------------------------- | -------: | -------------------------------------------------------------------------------- |
| Context Build Requestの必須項目と任意項目が定義されている                       |       OK | `project_code` / `agent_code` / `task_request` と任意項目は定義済み                        |
| CLI引数からRequest型へ変換できる                                         | OK / 要補強 | `toContextBuildRequestFromCli()` は存在するが、`--recent` / `--no-recent` 同時指定などの扱いが未定義 |
| 不正な `project_code` の扱いが定義されている                                |       OK | `project_not_found` / `project_inactive` が定義済み                                   |
| 不正な `agent_code` の扱いが定義されている                                  |       OK | `agent_not_found` / `agent_project_not_supported` / `agent_inactive` が定義済み       |
| 不正な source 指定時の扱いが定義されている                                     | OK / 要補強 | path安全性・存在確認は定義済み。ただしRegistry globとの照合方法が曖昧                                      |
| Session Contextの扱いが定義されている                                    | OK / 要補強 | 定義は十分。ただし `include:false` でnotesがある場合の扱いが未定義                                     |
| Recent Conversation Context / Conversation Summaryの扱いが定義されている | OK / 要補強 | 位置づけは明確。ただし `include:true` かつ `source` 未指定の扱いが曖昧                                 |
| `src/types/context.ts` と文書が対応している                             |     NG寄り | 型は概ね対応。ただし `output_type` と `OutputContractId` の接続に不整合あり                          |

---

## 2. P0：Active化前に必須修正

### M2-4-REV-P0-001

**対象:** `docs/context/context-build-rule.md` / `src/types/context.ts`
**内容:** `output_type` と Agent Registry の `output_contract_id` の対応を確定する。

現在、`output_type` には以下があります。

```ts
"review_report"
"context_pack"
```

一方で、M2-3側のAgent Registry系では `OutputContractId` は以下のような契約IDです。

```ts
"implementation_review_report"
"requirements_document"
"adr_draft"
"task_breakdown"
"article_draft"
```

このため、`review_report` を `implementation_review_report` へ変換するのか、`review_report` 自体を廃止するのかを明確化する必要があります。

特に `context_pack` は `OutputContractId` に存在しないため、`ResolvedContextBuildRequest.outputContractId` が必須である現在の型と衝突します。

**修正案:**

```ts
export type ContextBuildOutputType =
  | "implementation_review_report"
  | "requirements_document"
  | "adr_draft"
  | "task_breakdown"
  | "article_draft"
  | "context_pack";
```

または、`output_type` はCLI aliasとして残し、内部では必ず `outputContractId` へ解決するルールを明記します。

---

### M2-4-REV-P0-002

**対象:** `docs/context/context-build-rule.md` / `docs/context/recent-context-policy.md` / `src/types/context.ts`
**内容:** `recent_context.include = true` かつ `source` 未指定時の扱いを確定する。

現在の型では以下が可能です。

```ts
recentContext: {
  include: true,
  source: undefined,
}
```

しかし、文書上ではM2-4初期版の正式sourceは `conversation-summary` のみです。

**修正案:**
以下のどちらかに統一してください。

| 案 | 内容                                                                 | 推奨 |
| - | ------------------------------------------------------------------ | -: |
| A | `include:true` かつ `source` 未指定なら `conversation-summary` をdefault補完 | 推奨 |
| B | `include:true` かつ `source` 未指定はerror                               |  可 |

初期運用では、Aの方がCLI利用性が高いです。

---

### M2-4-REV-P0-003

**対象:** `docs/context/context-build-rule.md`
**内容:** `additional_sources` がProject Registry候補に一致するかの判定方法を明確化する。

現在、`additional_sources` は「Project Registryのsource candidateに一致しないsourceはerror」と定義されています。
一方、Project Registry側は以下のようなglob patternを持ちます。

```yaml
- "src/usecases/**/*.ts"
- "src/services/**/*.ts"
- "docs/*.md"
```

そのため、`additional_sources` の実pathを、Registryのglob patternにどう照合するかが必要です。

**修正案:**

```text
additional_sources のcandidate validationは、Project Registryの optional_sources / adr_sources / review_sources の path_or_pattern に対する glob match により判定する。
```

併せて、以下も明記するとよいです。

* Windows path separator `\` は `/` に正規化する
* repository root相対pathとして比較する
* glob展開はContext Builder実装側の責務とする
* `required_memory_docs` は存在検証対象であり、additional source候補判定には直接使わない。ただしAgent required_contextにより採用され得る

---

### M2-4-REV-P0-004

**対象:** `docs/context/context-build-rule.md` / `src/types/context.ts`
**内容:** `source_status_policy_override` の扱いを正式定義するか、初期版から外す。

現在、任意項目として `source_status_policy_override` が存在しますが、CLI mappingには出ておらず、validation ruleも不足しています。

これはSource Status Policyを上書きする強い操作なので、Active化時点では曖昧に残さない方がよいです。

**修正案:**
初期版では以下のどちらか。

| 案 | 内容                                           | 推奨 |
| - | -------------------------------------------- | -: |
| A | `source_status_policy_override` をM2-4初期版から削除 | 推奨 |
| B | debug mode限定で正式定義し、non-debugではerror          |  可 |

採用するなら、以下のerror codeが必要です。

```ts
"source_status_policy_override_not_allowed"
"invalid_source_status_policy_override"
```

---

### M2-4-REV-P0-005

**対象:** `docs/context/context-build-rule.md`
**内容:** Project Required Memory Docs存在検証失敗時の扱いを明記する。

Validation Flowには `Project required memory docs existence check` がありますが、error / warningの扱いが少し弱いです。

M2-2では `required_memory_docs` は標準5文書の存在検証対象であり、欠落時は基本error扱いです。M2-4でもContext Build前提として明記した方がよいです。

**修正案:**

```text
required_memory_docs の存在検証に失敗した場合、Context Builderは error としてContext Pack生成を停止する。
ただし debug mode では Build Report のみ生成してよい。
```

---

## 3. P1：Active化前の推奨修正

### M2-4-REV-P1-001

**対象:** `context-build-rule.md` / `recent-context-policy.md`
**内容:** Acceptance CriteriaのチェックボックスをActive化時に `[x]` へ更新する。

現在はすべて `[ ]` のままです。
Active版では、レビュー反映後に完了条件を満たした項目を `[x]` に更新してください。

---

### M2-4-REV-P1-002

**対象:** `context-build-rule.md`
**内容:** `--recent` と `--no-recent` の同時指定時の扱いを定義する。

**修正案:**

```text
--recent と --no-recent が同時指定された場合は error とする。
```

追加error code案:

```ts
"conflicting_recent_context_options"
```

---

### M2-4-REV-P1-003

**対象:** `context-build-rule.md` / `recent-context-policy.md`
**内容:** `session_context.include = false` なのに `notes` / `review_viewpoints` が指定された場合の扱いを定義する。

**修正案:**

```text
session_context.include=false かつ notes / review_viewpoints / temporary_constraints が存在する場合は warning とし、Session Contextは含めない。
```

または、入力者の意図を優先して `include=true` に正規化してもよいです。
CLIでは `--session-note` 指定時に `include=true` へ補完しているため、YAMLでも同じ挙動に寄せる方が自然です。

---

### M2-4-REV-P1-004

**対象:** `context-build-rule.md` / `src/types/context.ts`
**内容:** `token_budget` の制約をもう少し具体化する。

現在は `max_tokens` が正の整数という定義です。以下もあると実装しやすいです。

```text
reserve_tokens_for_response は0以上の整数
reserve_tokens_for_response は max_tokens 未満
max_tokens の推奨下限は1000
```

追加error code案:

```ts
"token_budget_reserve_exceeds_max"
```

---

### M2-4-REV-P1-005

**対象:** `src/types/context.ts`
**内容:** `ContextBuildErrorCode` を `ContextBuildIssueCode` に改名する。

現在のunionにはwarning系も含まれています。

```ts
export type ContextBuildErrorCode = ...
```

しかし実態はerrorだけでなく、warning / infoも含みます。

**修正案:**

```ts
export type ContextBuildIssueCode = ...
```

合わせて以下も修正します。

```ts
code: ContextBuildIssueCode;
```

---

### M2-4-REV-P1-006

**対象:** `context-build-rule.md`
**内容:** Request YAMLの正式保存先を決める。

Open Issueに残っていますが、M2-4 Active版では最低限の推奨配置を決めてもよいです。

**推奨:**

```text
requests/context/*.context-request.yaml
```

またはdocs配下に寄せるなら、

```text
docs/context/requests/*.context-request.yaml
```

個人的には、実行入力ファイルなので `requests/context/` が自然です。
ただし、正本ドキュメントではないため `docs/` 配下に入れる必然性は低いです。

---

## 4. P2：後続でもよい改善

### M2-4-REV-P2-001

**対象:** `context-build-rule.md`
**内容:** `output_type` 不明時をwarning fallbackにする方針は便利だが、typo検出が弱くなります。

たとえば以下のような入力でもwarningで通ってしまいます。

```yaml
output_type: "reivew_report"
```

後続実装では、CLIではerror、programmatic inputではwarning、などに分けてもよいです。

---

### M2-4-REV-P2-002

**対象:** `recent-context-policy.md`
**内容:** Conversation Summaryの保存先はOpen Issueのままでよいが、M2-5以降で確定が必要です。

現時点ではM2-4の責務外として残して問題ありません。

---

### M2-4-REV-P2-003

**対象:** `src/types/context.ts`
**内容:** validation関数はまだ型だけで未実装です。

M2-4の完了条件が「型と扱いの定義」なら問題ありません。
ただしM2-5以降でContext Builder実装に進むなら、以下の関数が必要になります。

```ts
validateContextBuildRequest()
resolveContextBuildRequest()
```

---

## 5. Active化に向けた修正リスト

| Priority | ID              | 対象                                    | 修正内容                                                            |
| -------- | --------------- | ------------------------------------- | --------------------------------------------------------------- |
| P0       | M2-4-REV-P0-001 | `context-build-rule.md`, `context.ts` | `output_type` と `output_contract_id` の対応を確定する                   |
| P0       | M2-4-REV-P0-002 | 3成果物                                  | `recent_context.include=true` かつ `source` 未指定時の扱いを確定する          |
| P0       | M2-4-REV-P0-003 | `context-build-rule.md`               | `additional_sources` とProject Registry glob candidateの照合方法を定義する |
| P0       | M2-4-REV-P0-004 | `context-build-rule.md`, `context.ts` | `source_status_policy_override` を削除またはdebug限定で正式定義する            |
| P0       | M2-4-REV-P0-005 | `context-build-rule.md`               | `required_memory_docs` 欠落時のContext Build停止条件を明記する               |
| P1       | M2-4-REV-P1-001 | 2文書                                   | Acceptance CriteriaをActive版で `[x]` に更新する                        |
| P1       | M2-4-REV-P1-002 | `context-build-rule.md`, `context.ts` | `--recent` と `--no-recent` 同時指定時のerrorを定義する                     |
| P1       | M2-4-REV-P1-003 | 2文書                                   | `session_context.include=false` かつnotesありの場合の扱いを定義する            |
| P1       | M2-4-REV-P1-004 | `context-build-rule.md`, `context.ts` | token budgetの詳細制約を追加する                                          |
| P1       | M2-4-REV-P1-005 | `context.ts`                          | `ContextBuildErrorCode` を `ContextBuildIssueCode` に改名する         |
| P1       | M2-4-REV-P1-006 | `context-build-rule.md`               | Request YAMLの推奨保存先を決める                                          |
| P2       | M2-4-REV-P2-001 | `context-build-rule.md`               | unknown `output_type` のfallback方針を後続で再検討する                      |
| P2       | M2-4-REV-P2-002 | `recent-context-policy.md`            | Conversation Summary保存先はM2-5以降で確定する                             |
| P2       | M2-4-REV-P2-003 | `context.ts`                          | validation / resolution関数は後続実装で追加する                             |

---

## 6. 総合評価

### 良い点

* Context Build Requestの基本設計はかなり良いです。
* M2-1のContext Pack構造、M2-2のProject Registry、M2-3のAgent Registryと自然につながっています。
* Session ContextとRecent Conversation Contextを分離した点は重要です。
* `additional_sources` を明示入力にしているため、実装レビューや文書レビューで使いやすいです。
* `Context Build Request → validation → registry resolution → source selection → Context Pack` の流れが明確です。

### Active化前の懸念

* `output_type` と `output_contract_id` の境界が曖昧です。
* Recent Contextのdefault挙動が未確定です。
* Additional SourcesのRegistry candidate照合方法が実装時にぶれそうです。
* `source_status_policy_override` は強い機能なので、曖昧に残すと危険です。

---

## 7. Active化判断

現時点の判定は以下です。

```text
M2-4 draft review result: conditional pass, not ready for Active.
```

P0を反映すれば、M2-4成果物はActive化して問題ない水準です。

## まとめ / Summary

日本語: M2-4ドラフトは完了条件を概ね満たしていますが、Active化前にP0修正が必要です。特に `output_type`、Recent Context default、Additional Sources照合、source status overrideの扱いを確定するべきです。
English: The M2-4 draft mostly meets the done criteria, but P0 fixes are needed before Active status. The key points are output type mapping, Recent Context default, Additional Sources matching, and source status override handling.

## Conversation Memory

### fact

* M2-4：Context Build Request定義のドラフト成果物として、`docs/context/context-build-rule.md`、`docs/context/recent-context-policy.md`、`src/types/context.ts` が作成済み。
* M2-4ドラフトレビューを実施した。
* M2-4ドラフトは完了条件の主要項目を概ね満たしている。
* 現時点では、そのままActive化するのは非推奨と判定した。

### decision

* M2-4ドラフトのActive化判定は「条件付きNG」とした。
* P0修正を反映後、Active化可能な水準と判断した。
* Active化前に `output_type` と `output_contract_id` の対応を確定すべきとした。
* Active化前に `recent_context.include=true` かつ `source` 未指定時の扱いを確定すべきとした。
* Active化前に `additional_sources` とProject Registry glob candidateの照合方法を明確化すべきとした。
* Active化前に `source_status_policy_override` を削除またはdebug限定で正式定義すべきとした。

### task

* P0修正をM2-4ドラフト3成果物へ反映する。
* P1修正を必要に応じて反映する。
* 修正後、Acceptance CriteriaをActive版として `[x]` に更新する。
* P0/P1反映後にM2-4 Active版を作成する。

### preference

* Project Mnemosyneでは、ドラフト作成後に完了条件と照合し、P0/P1を洗い出してからActive化する進め方を採用している。
* Context Build Requestは、CLIから使いやすく、かつ内部型へ安全に正規化できることを重視する。
* Session ContextとRecent Conversation Contextは分離して扱う。

### constraint

* Context Packは正本ではなく生成物である。
* Context Build Requestも正本ではなく、Context Builderへの入力契約である。
* Active ADR / Active memory docs / Active phase docsは、Session ContextやRecent Conversation Contextより優先する。
* `required_memory_docs` は存在検証対象であり、Context Packへの常時全文投入対象ではない。
* AIはActive正本文書を直接更新せず、draft、review、proposal、issue candidateを作成する。

### issue

* `output_type` と Agent Registryの `output_contract_id` の対応に不整合がある。
* `context_pack` が `ContextBuildOutputType` にある一方で、`OutputContractId` には存在しない。
* `recent_context.include=true` かつ `source` 未指定時の扱いが未確定。
* `additional_sources` とProject Registry glob patternとの照合方法が未定義。
* `source_status_policy_override` のvalidationとCLI対応が不足している。
* `--recent` と `--no-recent` の同時指定時の扱いが未定義。
* `session_context.include=false` かつnotes指定ありの場合の扱いが未定義。
* token budgetの詳細制約が不足している。

### idea

* `recent_context.include=true` かつ `source` 未指定時は `conversation-summary` をdefault補完する案が有力。
* `source_status_policy_override` は初期版では削除し、後続でdebug機能として追加する案が有力。
* Request YAMLの推奨保存先として `requests/context/*.context-request.yaml` が候補。
* `ContextBuildErrorCode` はwarningも含むため、`ContextBuildIssueCode` へ改名すると実態に合う。

### article_note

* Context Build Requestは「AIに渡す文脈を毎回手作業で組み立てないための入力契約」として説明できる。
* Session ContextとRecent Conversation Contextを分けることで、「今回だけの補足」と「直近会話由来の未反映情報」を混同しない設計として記事化できる。
* `output_type` と `output_contract_id` の分離は、「人間向けCLI入力」と「Agent内部契約」の境界として説明できる。

### conversation_summary

* 日本語: M2-4ではContext Builderへ渡す入力形式を定義するため、ドラフト3成果物を作成し、今回Active化前レビューを実施した。主要完了条件は満たしているが、P0修正が必要なため、現時点では条件付きNGと判定した。
* English: In M2-4, we created three draft files for the Context Builder input format and reviewed them for Active status. The main criteria are mostly met, but P0 fixes are needed, so the current result is conditional NG.

### test_result

* `context-build-rule.md`、`recent-context-policy.md`、`context.ts` の内容を確認した。
* 完了条件との照合を実施した。
* 静的レビュー上、P0修正5件、P1修正6件、P2改善3件を抽出した。
