## M2-3 再ドラフト Active化レビュー結果

**判定：Go / Active化可能**

今回の再ドラフトは、提示されたレビュー観点および計画書の完了条件に対して、**P0不備なし**です。
Active化版を作成する段階で `registry_status` / 各Agentの `status` を `active` に更新すれば、M2-3成果物としてActive化してよい状態です。

---

# 1. レビュー観点ごとの確認結果

| レビュー観点                                                  |   判定 | 確認結果                                                                                                       |
| ------------------------------------------------------- | ---: | ---------------------------------------------------------------------------------------------------------- |
| `agents.yaml` に計画書通りのAgent Codeが登録されている                 | ✅ OK | `adr_writer` / `requirements_writer` / `implementation_reviewer` / `task_planner` / `article_writer` が登録済み |
| `priority` が追加されている                                     | ✅ OK | 各Agentに `priority` が定義済み                                                                                   |
| P0/P1 Agentの出力契約と禁止事項が定義されている                           | ✅ OK | 4 Agentすべてに `output_contract` と `forbidden_operations` あり                                                  |
| Agent定義からProject固有Fact / Decision / Taskが除去されている        | ✅ OK | `mnemosyne` / `ats` / `Project Mnemosyne` / `Adventure Token System` の混入なし                                 |
| `agentRegistryService.ts` がPriorityと必須Agent存在チェックを検証できる | ✅ OK | `validateCompletionRequirements()` と `checkAgentCompletionRequirements()` で検証可能                            |

---

# 2. 完了条件との照合

| 完了条件                                                            |   判定 | コメント                  |
| --------------------------------------------------------------- | ---: | --------------------- |
| P0 Agentとして `adr_writer` と `requirements_writer` が登録されている       | ✅ OK | 両方登録済み、priorityも `P0` |
| P1 Agentとして `implementation_reviewer` と `task_planner` が登録されている | ✅ OK | 両方登録済み、priorityも `P1` |
| Agent定義にProject固有のFact / Decision / Taskが混入していない                | ✅ OK | Project固有名や固有判断は確認されず |
| Agentごとの出力契約と禁止事項が定義されている                                       | ✅ OK | P0/P1/Laterすべてに定義あり   |

---

# 3. `agents.yaml` レビュー

## 3.1 Agent Code

登録Agentは計画書と一致しています。

| agent_code                | agent_name  | priority | 判定 |
| ------------------------- | ----------- | -------: | -: |
| `adr_writer`              | ADR整理Agent  |       P0 |  ✅ |
| `requirements_writer`     | 要件定義Agent   |       P0 |  ✅ |
| `implementation_reviewer` | 実装レビューAgent |       P1 |  ✅ |
| `task_planner`            | タスク分解Agent  |       P1 |  ✅ |
| `article_writer`          | 記事化Agent    |    Later |  ✅ |

初回ドラフトにあった以下のProject寄りAgentは除去されています。

* `mnemosyne_docs_agent`
* `mnemosyne_review_agent`
* `ats_architecture_agent`
* `article_agent`

これは前回レビューのP0指摘に対して適切に修正されています。

---

## 3.2 Priority

各Agentに `priority` が定義されています。

```yaml
priority: "P0"
priority: "P1"
priority: "Later"
```

また、`completion_requirements` にもP0/P1必須Agentが明示されています。

```yaml
completion_requirements:
  required_p0_agents:
    - "adr_writer"
    - "requirements_writer"
  required_p1_agents:
    - "implementation_reviewer"
    - "task_planner"
```

**判定：OK**

---

## 3.3 出力契約

出力契約はAgentごとに分離されています。

| Agent                     | output_contract_id             | 判定 |
| ------------------------- | ------------------------------ | -: |
| `adr_writer`              | `adr_draft`                    |  ✅ |
| `requirements_writer`     | `requirements_document`        |  ✅ |
| `implementation_reviewer` | `implementation_review_report` |  ✅ |
| `task_planner`            | `task_breakdown`               |  ✅ |
| `article_writer`          | `article_draft`                |  ✅ |

また、`defaults.output_contracts` に以下が定義されています。

* `adr_draft`
* `requirements_document`
* `implementation_review_report`
* `task_breakdown`
* `article_draft`

各Agentの `output_contract.output_contract_id` と defaults 側の定義が対応しています。

**判定：OK**

---

## 3.4 禁止事項

P0/P1 Agentすべてに `forbidden_operations` が定義されています。

特に良い点は、各Agentに以下の趣旨が入っていることです。

* Active文書を直接更新しない
* 未承認情報を確定扱いしない
* Project固有のFact / Decision / TaskをAgent Registryへ保存しない
* Context PackをSource of Truthとして扱わない

これはM2-3の目的である「専門Agentごとの役割、必要Context、出力形式、禁止事項、write policyを管理する」に合っています。

**判定：OK**

---

## 3.5 Project固有情報の混入

確認した限り、Agent定義内に以下のようなProject固有名は含まれていません。

| 確認語                      | 結果 |
| ------------------------ | -: |
| `ats`                    | なし |
| `mnemosyne`              | なし |
| `Adventure Token System` | なし |
| `Project Mnemosyne`      | なし |

また、Context指定もProject固有source groupではなく、以下のような汎用Context要求へ寄せられています。

* `memory_doc`
* `adr_source`
* `requirement_doc`
* `phase_doc`
* `review_source`
* `additional_source`
* `recent_context`
* `session_context`
* `code`

**判定：OK**

---

# 4. `src/types/registry.ts` レビュー

## 4.1 追加型

以下の型が追加されており、M2-3に必要な概念を表現できています。

```ts
export type AgentPriority = "P0" | "P1" | "P2" | "Later";
export type AgentScope = "project_independent" | "project_specific" | "experimental";
export type OutputContractId =
  | "adr_draft"
  | "requirements_document"
  | "implementation_review_report"
  | "task_breakdown"
  | "article_draft";
```

## 4.2 Agent Registry型

`AgentRegistryEntry` に以下が含まれており、今回の完了条件を型として支えられています。

* `agent_code`
* `agent_name`
* `priority`
* `agent_scope`
* `required_context`
* `optional_context`
* `allowed_operations`
* `forbidden_operations`
* `output_contract`
* `write_policy`

**判定：OK**

---

# 5. `src/services/agentRegistryService.ts` レビュー

## 5.1 Priority検証

以下でPriorityの許容値が定義されています。

```ts
const VALID_AGENT_PRIORITIES: AgentPriority[] = ["P0", "P1", "P2", "Later"];
```

さらに `validateAgentPriorityAndScope()` で不正値を検出できます。

**判定：OK**

---

## 5.2 必須Agent存在チェック

以下の必須Agentが定義されています。

```ts
const DEFAULT_REQUIRED_P0_AGENTS: AgentCode[] = [
  "adr_writer",
  "requirements_writer",
];

const DEFAULT_REQUIRED_P1_AGENTS: AgentCode[] = [
  "implementation_reviewer",
  "task_planner",
];
```

`checkAgentCompletionRequirements()` で不足Agentを検出し、`validateCompletionRequirements()` でerror化できます。

検出できる内容は以下です。

* P0 Agent不足
* P1 Agent不足
* P0 Agentのpriority不一致
* P1 Agentのpriority不一致

**判定：OK**

---

## 5.3 出力契約・禁止事項の検証

`validateAgentRequiredFields()` で以下を検証しています。

* `forbidden_operations` が配列であり、空ではないこと
* `default_output_contract` が存在すること
* `output_contract` が存在すること
* `write_policy` が存在すること

また、`validateAgentPolicies()` で output contract ID がdefaultsに存在するか確認しています。

**判定：OK**

---

## 5.4 Project固有Agentの排除

`validateAgentPriorityAndScope()` で、初期Registryに `project_specific` Agentが含まれるとerrorになります。

```ts
if (agent.agent_scope === "project_specific") {
  errors.push({
    code: "project_specific_agent_in_initial_registry",
    ...
  });
}
```

これは今回の完了条件に合っています。

**判定：OK**

---

# 6. 検証結果

実施した確認は以下です。

| 確認                 |           結果 |
| ------------------ | -----------: |
| ZIP展開              |         ✅ 成功 |
| `agents.yaml` 読み込み |         ✅ 成功 |
| 登録Agent一覧確認        |         ✅ 成功 |
| P0 Agent不足確認       |       ✅ 不足なし |
| P1 Agent不足確認       |       ✅ 不足なし |
| P0/P1 Agentの出力契約確認 |    ✅ すべて定義あり |
| P0/P1 Agentの禁止事項確認 |    ✅ すべて定義あり |
| Project固有名の混入確認    |       ✅ 混入なし |
| TypeScript構文確認     | ⚠️ 環境依存エラーあり |

TypeScript確認では、以下の依存解決エラーのみ確認されました。

```text
Cannot find module 'node:fs'
Cannot find module 'node:path'
Cannot find module 'yaml'
```

これはソースコード構造の問題というより、確認環境側に `@types/node` と `yaml` の型解決がないためです。実プロジェクト側で依存関係が揃っていれば解消できる想定です。

---

# 7. Active化前の修正事項

## P0：なし

Active化を止める必須不備はありません。

---

## P1：推奨修正

### M2-3-REV-P1-001：Active版作成時にstatusを更新する

### 対象

* `config/agents.yaml`

### 修正内容

Active版では以下を更新する。

```yaml
registry_status: "active"
```

各AgentもActive成果物として扱うなら、以下に更新する。

```yaml
status: "active"
```

### 理由

現状はドラフト版なので `draft` で正しいです。
ただし、Active化成果物では `active` に変更する必要があります。

---

### M2-3-REV-P1-002：TypeScript依存関係を実プロジェクト側で確認する

### 対象

* `package.json`
* `tsconfig.json`
* TypeScript実行環境

### 確認内容

以下が解決できることを確認する。

* `node:fs`
* `node:path`
* `yaml`

### 理由

現環境では依存解決エラーが残りました。
実プロジェクトで `@types/node` と `yaml` が揃っているか確認してください。

---

### M2-3-REV-P1-003：将来的に内容ベースのProject固有語チェックを追加する

### 対象

* `src/services/agentRegistryService.ts`

### 修正案

現状は `agent_scope: project_specific` の排除はできます。
一方で、文字列内容にProject固有名が混入した場合の自動検出はまだ限定的です。

将来的には以下を追加するとより堅牢です。

```ts
const PROHIBITED_PROJECT_SPECIFIC_TERMS = [
  "ats",
  "mnemosyne",
  "Adventure Token System",
  "Project Mnemosyne",
];
```

ただし、Project名の完全な禁止は過剰検知になりやすいため、M2-3 Active化の必須条件にはしなくてよいです。

---

# 8. Active化可否

```text
Go
```

## 理由

* 計画書通りのAgent Codeが登録されている。
* P0/P1 AgentがPriority付きで登録されている。
* P0/P1 Agentに出力契約と禁止事項がある。
* Project固有Agentが除去されている。
* Agent Registry ServiceでPriorityと必須Agent存在チェックを検証できる。
* 完了条件との齟齬は確認されない。

---

# 9. Active化時の推奨対応

次は、以下を反映してActive版を作成すればよいです。

| 優先度 | 対応                             |
| --- | ------------------------------ |
| P1  | `registry_status: active` に変更  |
| P1  | 各Agentの `status: active` に変更   |
| P1  | 実プロジェクト環境でTypeScript依存解決を確認    |
| 任意  | Project固有語チェックを将来拡張候補としてIssue化 |

---

## まとめ / Summary

**日本語:**
再ドラフト版は、計画書の完了条件とレビュー観点を満たしています。P0不備はなく、Active化可能です。Active版作成時には `registry_status` と各Agentの `status` を `active` に更新するのが推奨です。

**English:**
The redraft meets the plan and review criteria. There are no P0 issues, so it can move to activation. When creating the active version, update `registry_status` and each agent `status` to `active`.

## Conversation Memory

### fact

* M2-3：Agent Registry再ドラフト版のActive化レビューを実施した。
* 再ドラフト版には `config/agents.yaml`、`src/types/registry.ts`、`src/services/agentRegistryService.ts` が含まれている。
* `agents.yaml` には `adr_writer`、`requirements_writer`、`implementation_reviewer`、`task_planner`、`article_writer` が登録されている。
* `adr_writer` / `requirements_writer` はPriority `P0`。
* `implementation_reviewer` / `task_planner` はPriority `P1`。
* `article_writer` はPriority `Later`。
* 各Agentには `output_contract` と `forbidden_operations` が定義されている。
* Project固有名 `ats`、`mnemosyne`、`Adventure Token System`、`Project Mnemosyne` の混入は確認されなかった。
* `agentRegistryService.ts` にはPriority検証と必須Agent存在チェックが実装されている。

### decision

* M2-3再ドラフトはActive化可能と判定した。
* P0修正事項はなしと判定した。
* Active版作成時には `registry_status` と各Agentの `status` を `active` に変更する方針。
* TypeScript依存関係確認はP1扱いとし、Active化を止めるP0とはしない。

### task

* M2-3 Active版を作成する。
* Active版では `registry_status: active` に更新する。
* Active版では各Agentの `status: active` に更新する。
* 実プロジェクト環境で `node:fs`、`node:path`、`yaml` の型解決を確認する。
* 必要に応じて、Project固有語チェックの将来拡張をIssue候補にする。

### preference

* Agent RegistryはProject非依存の専門Agent契約として管理する。
* Project固有情報はAgent Registryに持たせず、Project Registry、Task Request、Additional Sources、Context Packで扱う。
* Active化前レビューではP0/P1を明確に分け、P0がなければActive化へ進む。

### constraint

* AIはActive文書を人間承認なしに直接更新しない。
* Agent RegistryはProject Registryのsource_status_policyやwrite_policyを上書きしない。
* Context Packは生成物であり、正本ではない。
* Agent定義にProject固有のFact / Decision / Taskを混入させない。
* M2-3完了条件として、P0 Agent `adr_writer` / `requirements_writer`、P1 Agent `implementation_reviewer` / `task_planner` が必要。

### issue

* 現在の再ドラフトは `registry_status: draft`、各Agentも `status: draft` であり、Active版作成時に更新が必要。
* この確認環境ではTypeScript依存解決として `node:fs`、`node:path`、`yaml` が解決できなかった。
* 内容ベースのProject固有語自動検出は、将来拡張候補として残る。

### idea

* `agentRegistryService.ts` にProject固有語チェックを追加すると、Agent定義へのProject固有情報混入をより機械的に検出できる。
* Project-specific Agentは将来的に別registryまたはpresetとして扱うとよい。
* M2-4以降では、Project Registry × Agent Registry × Task Request を統合してContext Pack生成条件を解決するServiceへ進めるとよい。

### article_note

* Agent Registryは、AIに読ませる情報そのものではなく、「専門Agentの役割・入力要求・出力契約・禁止事項」を定義する契約表として説明できる。
* Priorityを持たせることで、Phaseの最小構成と将来拡張候補を分けられる。
* Project固有情報をAgentから分離することが、汎用専門Agent設計の重要ポイントになる。

### conversation_summary

* M2-3：Agent Registry定義について、初回ドラフトのレビュー後、計画書に合わせた再ドラフトを作成した。
* 今回、その再ドラフトをActive化観点でレビューし、計画書の完了条件との齟齬がないことを確認した。
* 結果として、P0不備なし、Active化可能と判定した。

### test_result

* ZIP展開：成功。
* `agents.yaml` 読み込み：成功。
* P0 Agent不足確認：不足なし。
* P1 Agent不足確認：不足なし。
* P0/P1 Agentの出力契約確認：すべて定義あり。
* P0/P1 Agentの禁止事項確認：すべて定義あり。
* Project固有名混入確認：混入なし。
* TypeScript確認：環境依存の型解決エラーのみ確認。
