## M2-2 Active化レビュー結果

結論として、**M2-2成果物ドラフトは完了条件の主要要件をおおむね満たしています**。
ただし、Active化するには **P0修正 2件、P1修正 4件** を反映した方がよいです。

特に重要なのは、以下の2点です。

1. `projects.yaml` の `source_status_policy` と `write_policy` がやや冗長で、将来の保守性に不安がある
2. `projectRegistryService.ts` が `optional_sources` / `adr_sources` / `review_sources` の存在検証をまだ行っていない

---

# 1. 完了条件レビュー

## 完了条件1：`mnemosyne` と `ats` がProject Registryに登録されている

### 判定：OK

`config/projects.yaml` に以下の2プロジェクトが登録されています。

```yaml
project_code: "mnemosyne"
project_name: "Project Mnemosyne"
```

```yaml
project_code: "ats"
project_name: "Adventure Token System"
```

また、それぞれに以下が定義されています。

* `memory_root`
* `required_memory_docs`
* `optional_sources`
* `adr_sources`
* `review_sources`
* `source_status_policy`
* `write_policy`

したがって、完了条件は満たしています。

### ただし要確認

`memory_root` の実パスは以下になっています。

```yaml
memory_root: "docs/projects/mnemosyne/memory"
```

```yaml
memory_root: "docs/projects/ats/memory"
```

M1-4 / M1-5で作成した実ファイル配置と一致していれば問題ありません。
ただし、現物のrepositoryでこのディレクトリが存在しない場合、Service上は `memory_root_not_found` になります。

---

## 完了条件2：標準5文書の存在検証ができる

### 判定：OK。ただしP0修正推奨あり

`projectRegistryService.ts` に以下の関数があり、標準5文書の存在検証は可能です。

```ts
export function checkRequiredMemoryDocs(
  project: ProjectRegistryEntry,
): RequiredMemoryDocsCheckResult
```

また、以下の関数でも利用されています。

```ts
validateProjectRegistry()
validateProjectRequiredMemoryDocs()
resolveProjectRegistry()
```

検証対象は `project.required_memory_docs` であり、`memory_root` と結合して実ファイル存在を確認する構成です。

```ts
const resolvedPath = path.resolve(path.join(project.memory_root, fileName));
exists: fs.existsSync(resolvedPath)
```

これはM2-2の完了条件を満たしています。

### P0懸念

ただし、現在のServiceでは `required_memory_docs` については存在検証しますが、以下の検証が弱いです。

* `required_memory_docs` が空配列でも通る可能性がある
* 標準5文書がすべて含まれているかの検証がない
* `required_memory_docs` に絶対パスや `../` が入った場合の防御がない

M2-2の目的が「標準記憶構造を満たすかの確認」である以上、これはActive化前に補強した方がよいです。

---

## 完了条件3：`required_memory_docs` が常時全文投入対象ではないことが明記されている

### 判定：OK

以下の3箇所で明記されています。

## `config/projects.yaml`

```yaml
required_memory_docs_meaning: "existence_check_only"
required_memory_docs_are_always_included: false
```

## `docs/context/source-status-policy.md`

```md
required_memory_docs は、Project Registryが対象プロジェクトの標準記憶構造を満たしているか確認するための存在検証対象である。
```

また、禁止解釈として以下も明記されています。

```text
required_memory_docs = Context Packへ常時全文投入する文書
```

## `src/types/registry.ts`

```ts
/**
 * Existence validation targets for the standard memory structure.
 *
 * Important:
 * These documents are NOT always included in the Context Pack.
 */
required_memory_docs: string[];
```

これは非常に良いです。
M2-0で整理した `required_memory_docs` の意味を、YAML・文書・型定義の3層に埋め込めています。

---

## 完了条件4：optional source / ADR source / review sourceの扱いが定義されている

### 判定：おおむねOK。ただしP1修正推奨

`config/projects.yaml` では以下が定義されています。

```yaml
optional_sources:
adr_sources:
review_sources:
```

また `docs/context/source-status-policy.md` でも以下のように扱いが定義されています。

| Source Type       | Meaning                           | Default Handling     |
| ----------------- | --------------------------------- | -------------------- |
| `optional_source` | Project Registryのoptional_sources | Taskに応じて採用           |
| `adr_source`      | ADR source                        | active / acceptedを優先 |
| `review_source`   | review文書                          | Taskに応じて採用           |

したがって、完了条件は満たしています。

### ただし補強したい点

現状では、optional / ADR / review sourceの扱いがやや抽象的です。

Active化するなら、次のようにもう少し明確にするとよいです。

| Source種別           | 推奨補強                                       |
| ------------------ | ------------------------------------------ |
| `optional_sources` | Task RequestまたはAgent Registryで要求された場合のみ候補化 |
| `adr_sources`      | active / accepted ADRを優先し、競合時はADRを上位根拠とする  |
| `review_sources`   | レビュー対象・完了判定・検証履歴として使用し、設計判断の正本にはしない        |

---

# 2. Active化に向けた修正一覧

## P0：必須修正

| ID              | 対象                          | 修正内容                                                     | 理由                                   |
| --------------- | --------------------------- | -------------------------------------------------------- | ------------------------------------ |
| M2-2-REV-P0-001 | `projectRegistryService.ts` | `required_memory_docs` が標準5文書をすべて含むことを検証する               | 存在検証対象としての標準記憶構造を保証するため              |
| M2-2-REV-P0-002 | `projectRegistryService.ts` | `required_memory_docs` のpath安全性を検証する。絶対パス、`../`、空文字を禁止する | Registry経由でmemory_root外を参照しないようにするため |

---

## P1：推奨修正

| ID              | 対象                                     | 修正内容                                                                                        | 理由                                 |
| --------------- | -------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------- |
| M2-2-REV-P1-001 | `config/projects.yaml`                 | `source_status_policy` と `write_policy` の詳細定義を共通defaultsへ寄せ、各projectでは `policy_id` 中心に簡略化する | 同一定義の重複を減らし、保守性を上げるため              |
| M2-2-REV-P1-002 | `docs/context/source-status-policy.md` | optional / ADR / review sourceの採用条件をより明確化する                                                 | Context Builder実装時の解釈揺れを防ぐため       |
| M2-2-REV-P1-003 | `src/types/registry.ts`                | `RequiredMemoryDocsCheckResult` に `standard_docs_satisfied` を追加する                           | 標準構造を満たしているかをService利用側が判定しやすくするため |
| M2-2-REV-P1-004 | `projectRegistryService.ts`            | `optional_sources` / `adr_sources` / `review_sources` のpattern妥当性チェックをwarningとして追加する        | Registry定義ミスを早期検出するため              |

---

# 3. 成果物別レビュー

## 3.1 `config/projects.yaml`

### 良い点

* `mnemosyne` と `ats` が登録されている
* `required_memory_docs` が標準5文書で定義されている
* `required_memory_docs_are_always_included: false` が明記されている
* `optional_sources` / `adr_sources` / `review_sources` がproject別に分かれている
* `source_status_policy` と `write_policy` がProjectごとに定義されている

### Active化前の懸念

`source_status_policy` と `write_policy` の定義が、`mnemosyne` と `ats` でほぼ重複しています。

現状でも動きますが、将来的にpolicy変更が発生した場合、複数projectに同じ修正を入れる必要があります。

### 推奨修正

以下のように、共通policyを `defaults.policies` に寄せる構成がよいです。

```yaml
defaults:
  source_status_policies:
    active_preferred:
      include_by_default:
        - "active"
        - "accepted"
      explicit_only:
        - "draft"
        - "proposed"
        - "archived"
        - "deprecated"
        - "superseded"
      warning_required:
        - "draft"
        - "proposed"
        - "archived"
        - "deprecated"
        - "superseded"
        - "unknown"
      prohibit_as_final_evidence:
        - "draft"
        - "proposed"
        - "archived"
        - "deprecated"
        - "superseded"
        - "unknown"

  write_policies:
    draft_only:
      ai_can:
        - "create draft documents"
        - "create review reports"
        - "create update proposals"
        - "create diff suggestions"
        - "create warnings and issue candidates"
      ai_must_not:
        - "update active source documents directly"
        - "treat draft or proposed sources as final decisions"
        - "promote issues or ideas to decisions without human approval"
      human_approval_required_for:
        - "active document updates"
        - "ADR acceptance"
        - "task source-of-truth updates"
        - "status changes"
```

各project側は以下程度で十分です。

```yaml
source_status_policy:
  policy_id: "active_preferred"

write_policy:
  policy_id: "draft_only"
```

---

## 3.2 `docs/context/source-status-policy.md`

### 良い点

* statusごとの扱いが表で定義されている
* `active_only` / `active_preferred` / `draft_allowed` / `history` のpolicyが整理されている
* `required_memory_docs` の禁止解釈が明記されている
* Warning RulesとBuild Reportの出力項目が定義されている
* Write Policyとの責務境界が明確

### Active化前の懸念

optional / ADR / review sourceの扱いは定義されていますが、採用条件がやや薄いです。

特にADRは、Project Mnemosyneでは正本に近い判断根拠なので、通常のoptional sourceより上位の扱いを明記した方がよいです。

### 推奨追記

以下を追記するとよいです。

```md
## Optional / ADR / Review Source Selection Rules

### optional_sources

`optional_sources` は、Task Request、Agent Registry、Additional Sources、またはBuild Ruleにより要求された場合にContext Pack投入候補とする。

`optional_sources` は、Project Registryに登録されているだけではContext Packへ自動投入しない。

### adr_sources

`adr_sources` は、設計判断、方針確認、競合解決、Active化レビュー時に優先的に参照する。

activeまたはacceptedのADRは、同一論点において通常のdraft文書、recent context、review sourceより上位の根拠として扱う。

ただし、ADR sourceも常時全文投入対象ではなく、Task Request、Agent Registry、Build Rule、token budgetに基づき選定する。

### review_sources

`review_sources` は、完了条件確認、Active化レビュー、検証履歴確認、過去指摘事項の追跡に使用する。

review sourceは判断の経緯や検証結果として扱うが、設計判断そのものの正本はADRまたはactive memory docsを優先する。
```

---

## 3.3 `src/types/registry.ts`

### 良い点

* Project Registry全体の型が整理されている
* `required_memory_docs` の意味がコメントで明記されている
* `SourceStatus` と `SourceStatusPolicyId` が明確
* `WritePolicyConfig` が定義されている
* 検証結果用の型が用意されている

### Active化前の懸念

`RequiredMemoryDocsCheckResult` には不足文書リストがありますが、「標準構造を満たしているか」を直接表すbooleanがありません。

Service利用側で毎回 `missing_docs.length === 0` を見ることになります。

### 推奨修正

```ts
export interface RequiredMemoryDocsCheckResult {
  memory_root: string;
  required_docs: RequiredMemoryDocCheck[];
  missing_docs: RequiredMemoryDocCheck[];

  /**
   * True when all standard required memory docs are declared and exist.
   */
  standard_docs_satisfied: boolean;
}
```

また、標準5文書の型定義も持たせると堅いです。

```ts
export type StandardRequiredMemoryDoc =
  | "project-summary.md"
  | "current-status.md"
  | "active-decisions.md"
  | "next-actions.md"
  | "ai-entrypoint.md";
```

---

## 3.4 `src/services/projectRegistryService.ts`

### 良い点

* Registryのloadができる
* project_codeからProjectを解決できる
* 標準5文書の存在検証ができる
* Project一覧全体のvalidationができる
* source候補一覧を出せる
* Context Builder側との責務分離が適切

### Active化前の懸念

以下が不足しています。

1. `required_memory_docs` が標準5文書をすべて含むかの検証
2. `required_memory_docs` のpath安全性検証
3. source patternの最低限の妥当性検証
4. policy詳細がdefaults参照になった場合のresolve処理

### 推奨修正

最低限、P0として以下は追加した方がよいです。

```ts
const STANDARD_REQUIRED_MEMORY_DOCS = [
  "project-summary.md",
  "current-status.md",
  "active-decisions.md",
  "next-actions.md",
  "ai-entrypoint.md",
] as const;
```

```ts
function validateRequiredMemoryDocsDefinition(
  project: ProjectRegistryEntry,
): ProjectRegistryValidationError[] {
  const errors: ProjectRegistryValidationError[] = [];

  if (!Array.isArray(project.required_memory_docs)) {
    return errors;
  }

  for (const doc of project.required_memory_docs) {
    if (!doc || doc.trim() === "") {
      errors.push({
        code: "missing_required_field",
        message: "required_memory_docs must not contain empty value",
        project_code: project.project_code,
      });
    }

    if (path.isAbsolute(doc) || doc.includes("..")) {
      errors.push({
        code: "required_memory_doc_missing",
        message: `required_memory_docs must be relative file names under memory_root: ${doc}`,
        project_code: project.project_code,
      });
    }
  }

  for (const standardDoc of STANDARD_REQUIRED_MEMORY_DOCS) {
    if (!project.required_memory_docs.includes(standardDoc)) {
      errors.push({
        code: "required_memory_doc_missing",
        message: `Standard required memory doc is not declared: ${standardDoc}`,
        project_code: project.project_code,
      });
    }
  }

  return errors;
}
```

ただし、`required_memory_doc_missing` は「存在しない」と「宣言されていない」の両方に使うと意味が混ざるため、型側に以下を追加した方がより良いです。

```ts
| "required_memory_doc_not_declared"
| "invalid_required_memory_doc_path"
```

---

# 4. Active化判断

## 総合判定

| 観点                                | 判定              |
| --------------------------------- | --------------- |
| Project登録                         | OK              |
| 標準5文書の存在検証                        | OK。ただし検証強化が必要   |
| `required_memory_docs` の意味明記      | OK              |
| optional / ADR / review sourceの扱い | OK。ただし明確化推奨     |
| 実装責務分離                            | OK              |
| Active化可否                         | P0反映後にActive化推奨 |

---

# 5. Active化に向けた最終判断

## 判定：条件付きActive化可

現時点のドラフトは、完了条件に対して大きな欠落はありません。
ただし、M2-2は今後のContext Builderの入口になるため、**P0-001 / P0-002はActive化前に必ず反映**した方がよいです。

特に `required_memory_docs` はM2-0から慎重に意味定義してきた重要概念なので、文書上の定義だけでなく、Service側でも以下を保証するべきです。

```text
標準5文書が宣言されていること
標準5文書が存在すること
memory_root外を参照しないこと
Context Pack常時全文投入対象として扱わないこと
```

---

# 6. Active化前修正リスト

## 必須修正 P0

| ID              | 対象                                          | 修正内容                                                                                                    |
| --------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| M2-2-REV-P0-001 | `projectRegistryService.ts` / `registry.ts` | `required_memory_docs` が標準5文書をすべて宣言していることを検証する。必要に応じて `required_memory_doc_not_declared` を追加する          |
| M2-2-REV-P0-002 | `projectRegistryService.ts` / `registry.ts` | `required_memory_docs` のpath安全性を検証する。絶対パス、`../`、空文字を禁止し、必要に応じて `invalid_required_memory_doc_path` を追加する |

## 推奨修正 P1

| ID              | 対象                                     | 修正内容                                                                                        |
| --------------- | -------------------------------------- | ------------------------------------------------------------------------------------------- |
| M2-2-REV-P1-001 | `config/projects.yaml`                 | `source_status_policy` / `write_policy` の詳細定義を共通defaultsへ寄せ、各project側は `policy_id` 中心に簡略化する |
| M2-2-REV-P1-002 | `docs/context/source-status-policy.md` | optional / ADR / review sourceの採用条件と優先順位を追記する                                               |
| M2-2-REV-P1-003 | `src/types/registry.ts`                | `RequiredMemoryDocsCheckResult` に `standard_docs_satisfied` を追加する                           |
| M2-2-REV-P1-004 | `projectRegistryService.ts`            | optional / ADR / review sourceのpattern妥当性をwarningとして検出する                                    |

---

## まとめ / Summary

**日本語:**
M2-2成果物ドラフトは、完了条件をおおむね満たしています。Active化前には、`required_memory_docs` が標準5文書をすべて宣言していることの検証と、path安全性検証をP0として追加するのが妥当です。P1として、policy定義の共通化、optional / ADR / review sourceの採用条件明確化、検証結果型の補強を推奨します。

**English:**
The M2-2 draft mostly meets the completion criteria. Before making it active, it should add validation that all five standard memory docs are declared and that their paths are safe. As recommended improvements, simplify shared policies, clarify optional / ADR / review source rules, and improve validation result types.

## Conversation Memory

### fact

* Project MnemosyneはPhase 2: Context Forgeに入り、M2-2ではProject Registry定義を扱っている。
* M2-2の成果物は `config/projects.yaml`、`docs/context/source-status-policy.md`、`src/types/registry.ts`、`src/services/projectRegistryService.ts`。
* M2-2ドラフトでは `mnemosyne` と `ats` がProject Registryに登録されている。
* 標準5文書は `project-summary.md`、`current-status.md`、`active-decisions.md`、`next-actions.md`、`ai-entrypoint.md`。
* `required_memory_docs` は標準記憶構造を満たすための存在検証対象として定義されている。
* `required_memory_docs` はContext Packへの常時全文投入対象ではない。
* `optional_sources`、`adr_sources`、`review_sources` はProject Registry上でsource候補として定義されている。

### decision

* M2-2成果物ドラフトは、完了条件をおおむね満たしていると評価した。
* Active化判断は「条件付きActive化可」とした。
* Active化前にP0修正として、標準5文書の宣言検証とpath安全性検証を追加する方針。
* `source_status_policy` は `active_preferred`、`write_policy` は `draft_only` を初期標準とする方針を維持する。
* `required_memory_docs` の意味は、文書・YAML・型定義・Serviceの複数箇所で誤解防止する方針。

### task

* P0修正を反映してM2-2成果物のActive化版を作成する。
* `projectRegistryService.ts` に、標準5文書がすべて宣言されているかの検証を追加する。
* `projectRegistryService.ts` に、`required_memory_docs` の絶対パス、`../`、空文字禁止の検証を追加する。
* P1として、policy定義の共通化、source採用条件明確化、検証結果型の補強、source pattern warning検出を検討する。

### preference

* 成果物はActive化前にP0/P1で修正点を整理する。
* 正本・生成物・draft・review・Context Packの責務境界を明確にする。
* 誤解されやすい仕様は、文書・YAML・型定義・Serviceコメントに重複して明記する方針が有効。
* 完了条件に対するレビューは、OK / 懸念 / 修正要否で整理するのがよい。

### constraint

* Phase 2では、`required_memory_docs` の存在確認とContext Pack投入対象の選定を分離する。
* AIはActive正本を直接更新せず、draft、レビュー、差分案、更新提案までに留める。
* draft / proposed / archived / deprecated / superseded / unknown は確定判断の根拠として扱わない。
* Context Packは正本ではなく生成物である。
* `projectRegistryService.ts` はRegistry解決・存在検証・source候補列挙までを責務とし、Context投入の最終判断はContext Builder側に寄せる。

### issue

* `source_status_policy` と `write_policy` の詳細定義が `mnemosyne` と `ats` で重複しており、保守性に不安がある。
* `required_memory_docs` が標準5文書をすべて含むことの検証が不足している。
* `required_memory_docs` のpath安全性検証が不足している。
* optional / ADR / review sourceの採用条件がまだやや抽象的。
* optional / ADR / review sourceのpattern妥当性検証が未実装。

### idea

* `source_status_policy` と `write_policy` の詳細定義は `defaults` に寄せ、project側は `policy_id` 参照中心にする。
* `RequiredMemoryDocsCheckResult` に `standard_docs_satisfied` を追加すると、利用側の判定が簡潔になる。
* `adr_sources` は、設計判断・方針確認・競合解決・Active化レビュー時に通常sourceより優先参照する扱いを明記するとよい。
* `review_sources` は、判断の正本ではなく、完了条件確認・検証履歴・過去指摘事項の追跡に使う位置づけにするとよい。

### article_note

* `required_memory_docs` の設計は、「必要な記憶が存在すること」と「AIに毎回全部渡すこと」は別問題である、という記事テーマにできる。
* Project Registryは、AIに渡す文脈を属人的な手作業から設定ファイルベースの再現可能な処理へ変える要点として説明できる。
* draftを読ませること自体は禁止ではなく、「未確定として読ませる」ことが重要、という整理はAI外部記憶設計の学びとして使える。
* Active化レビューでは、完了条件を満たしているかだけでなく、次工程で誤実装を誘発しないかを見ることが重要。

### conversation_summary

* このチャットでは、Project Mnemosyne Phase 2のM2-2としてProject Registry定義に着手した。最初に、`projects.yaml`、source status policy文書、TypeScript型定義、Project Registry Serviceのドラフトを作成した。続いて、ユーザーが完了条件に基づくActive化レビューを依頼し、成果物が概ね条件を満たすこと、ただし標準5文書の宣言検証とpath安全性検証をP0として追加すべきことを整理した。

### test_result

* 実コード実行テストは未実施。
* 文書・設計レビュー上は、M2-2ドラフトは完了条件をおおむね満たすと判定。
* Active化可否は「P0反映後にActive化推奨」と判定。
