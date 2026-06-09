## M2-3 Active化レビュー結果

**判定：Active化不可 / P0修正後に再レビュー**

先ほどのドラフトは、`agents.yaml` / 型定義 / Service の**技術的な骨格**はかなり良いです。
ただし、今回提示された計画書の初期Agent候補と照合すると、**Agent Code・Agent構成・Project非依存性の面でP0不一致**があります。

M1-6時点でも、Agent候補として `adr_writer`、`implementation_reviewer` などをPhase 2入力に渡す想定が整理されていました。
また、M2-2のProject Registryでは、Context投入判断に `Agent Registry required_context` / `optional_context` が含まれるため、Agent RegistryはContext Pack生成の主要入力になります。

---

# 1. 完了条件との照合

| 完了条件                                             |     判定 | コメント                                                                                      |
| ------------------------------------------------ | -----: | ----------------------------------------------------------------------------------------- |
| P0 Agentとして `adr_writer` が登録されている                |   ❌ NG | 現ドラフトには未登録。代わりに `mnemosyne_docs_agent` がある                                                |
| P0 Agentとして `requirements_writer` が登録されている       |   ❌ NG | 現ドラフトには未登録                                                                                |
| P1 Agentとして `implementation_reviewer` が登録されている   |   ❌ NG | `ats_architecture_agent` は近いが、Agent Codeも責務もATS固有に寄りすぎ                                    |
| P1 Agentとして `task_planner` が登録されている              |   ❌ NG | 現ドラフトには未登録                                                                                |
| Agent定義にProject固有のFact / Decision / Taskが混入していない |   ❌ NG | `mnemosyne_docs_agent`、`mnemosyne_review_agent`、`ats_architecture_agent` がProject固有に寄っている |
| Agentごとの出力契約と禁止事項が定義されている                        | ✅ OK寄り | 既存4 Agentには定義あり。ただし必須Agentに対して再定義が必要                                                      |

---

# 2. 総合評価

## 良い点

* `Agent Registry` を `Project Registry` と分離する方向性は正しい。
* `required_context` / `optional_context` / `output_contract` / `forbidden_operations` / `write_policy` の構造は、M2-1のContext PackにおけるAgent Context構成と整合している。Context Pack Templateでも、Agent Contextには Role / Responsibilities / Out of Scope / Required Context / Allowed Operations / Forbidden Operations / Output Contract を含める構造になっています。
* write policyを `draft_only` としている点は、M2-2のWrite Policy Boundaryと整合している。AIはdraft、review、proposal、diff、issue候補を作成できるが、Active文書の直接更新や人間承認なしのstatus変更は禁止されています。

## 問題点

最大の問題は、**初期AgentがProject固有Agentとして設計されていること**です。

現在のドラフトは以下のようになっています。

| 現ドラフトAgent               | 問題                                                          |
| ------------------------ | ----------------------------------------------------------- |
| `mnemosyne_docs_agent`   | Mnemosyne専用で、`adr_writer` / `requirements_writer` に分離されていない |
| `mnemosyne_review_agent` | レビューAgentとしては有用だが、今回の初期候補にない                                |
| `ats_architecture_agent` | ATS固有であり、汎用的な `implementation_reviewer` ではない                |
| `article_agent`          | 計画書では `article_writer`、PriorityはLater                       |

Agent Registryは「Projectごとの作業内容」を持つ場所ではなく、**専門Agentの役割契約**を持つ場所にした方がよいです。
Project固有情報は、Project Registry、Task Request、Additional Sources、Context Pack側で注入するべきです。

---

# 3. P0：Active化前に必須の修正

## M2-3-REV-P0-001：初期Agent Codeを計画書に合わせる

### 対象

`config/agents.yaml`

### 修正内容

現行の初期Agentを、少なくとも以下に置き換える、または追加する。

| agent_code                | agent_name  | priority |
| ------------------------- | ----------- | -------- |
| `adr_writer`              | ADR整理Agent  | P0       |
| `requirements_writer`     | 要件定義Agent   | P0       |
| `implementation_reviewer` | 実装レビューAgent | P1       |
| `task_planner`            | タスク分解Agent  | P1       |
| `article_writer`          | 記事化Agent    | Later    |

### 理由

提示された完了条件と直接不一致です。
このままだと、M2-3のActive完了条件を満たせません。

---

## M2-3-REV-P0-002：Agent定義からProject固有Agentを外す

### 対象

`config/agents.yaml`

### 修正内容

以下のようなProject固有Agentは、初期Active定義から外すか、別のproject-specific presetへ退避する。

* `mnemosyne_docs_agent`
* `mnemosyne_review_agent`
* `ats_architecture_agent`

特に `ats_architecture_agent` は、`implementation_reviewer` に一般化する。

### 修正イメージ

| 現在                                           | 修正後                                             |
| -------------------------------------------- | ----------------------------------------------- |
| `ats_architecture_agent`                     | `implementation_reviewer`                       |
| ATSのUseCase / Service / Repository / DBをレビュー | 実装と設計文書・ADR・テスト結果の整合をレビュー                       |
| `supported_project_codes: ["ats"]`           | `supported_project_codes: ["*"]` または project非依存 |

### 理由

完了条件に「Agent定義にProject固有のFact / Decision / Taskが混入していない」とあるためです。
Agent Registryは、特定Projectの現状や判断を保持する場所ではなく、Agentの役割・入力要求・出力契約を保持する場所に限定すべきです。

---

## M2-3-REV-P0-003：`priority` をAgent定義に追加する

### 対象

* `config/agents.yaml`
* `src/types/registry.ts`
* `src/services/agentRegistryService.ts`

### 修正内容

Agentに `priority` を追加する。

```ts
export type AgentPriority = "P0" | "P1" | "P2" | "Later";
```

```yaml
agent_code: "adr_writer"
agent_name: "ADR整理Agent"
priority: "P0"
```

Service側では以下を検証する。

* `priority` が必須
* 値が `P0 | P1 | P2 | Later` のいずれか
* M2-3完了条件として、P0/P1 Agentの登録状況を検証可能にする

### 理由

今回の計画書はAgent候補をPriority付きで定義しています。
現ドラフトにはPriority概念がないため、完了条件を機械的に検証できません。

---

## M2-3-REV-P0-004：出力契約を初期Agentに合わせて再整理する

### 対象

`config/agents.yaml`

### 修正内容

現ドラフトのoutput contractは以下です。

* `review_report`
* `draft_documents`
* `implementation_plan`
* `article_draft`

これだけでも運用可能ですが、初期Agentの責務を明確にするなら、以下を追加・整理した方がよいです。

| output_contract_id             | 対象Agent                   | 内容                                      |
| ------------------------------ | ------------------------- | --------------------------------------- |
| `adr_draft`                    | `adr_writer`              | ADR草案、背景、Decision、Consequences、Status候補 |
| `requirements_document`        | `requirements_writer`     | 要件定義、スコープ、機能要件、非機能要件、完了条件               |
| `implementation_review_report` | `implementation_reviewer` | 実装レビュー、設計逸脱、責務境界、修正優先度                  |
| `task_breakdown`               | `task_planner`            | Task分解、優先度、依存関係、完了条件                    |
| `article_draft`                | `article_writer`          | 記事本文、タイトル、導入、まとめ、発信用メモ                  |

### 理由

完了条件に「Agentごとの出力契約」が含まれているため、汎用的な `draft_documents` だけでは少し弱いです。
特に `adr_writer` と `requirements_writer` は、出力構造が大きく異なります。

---

## M2-3-REV-P0-005：Project固有Context参照を汎用Context要求へ寄せる

### 対象

`config/agents.yaml`

### 修正内容

現ドラフトでは、Agent定義内に以下のようなProject固有source groupが入っています。

* `mnemosyne_context_docs`
* `mnemosyne_adrs`
* `mnemosyne_memory_policy_docs`
* `ats_domain_docs`
* `ats_source_code`

Active版では、Agent側は以下のような汎用的なContext要求に寄せる。

```yaml
required_context:
  - context_id: "project_summary"
    source_type: "memory_doc"
    document_names:
      - "project-summary.md"
    purpose: "対象Projectの目的とスコープを把握する"
    inclusion: "required"

  - context_id: "active_decisions"
    source_type: "memory_doc"
    document_names:
      - "active-decisions.md"
    purpose: "現在有効な判断を確認する"
    inclusion: "required"

  - context_id: "adr_sources"
    source_type: "adr_source"
    purpose: "設計判断の根拠を確認する"
    inclusion: "required"
```

Projectごとのsource group展開は、Context BuilderがProject Registryと組み合わせて解決する。

### 理由

Agent RegistryはProject非依存の専門Agent契約に寄せるべきです。
Project別のsource候補はProject Registryが管理する責務です。

---

# 4. P1：推奨修正

## M2-3-REV-P1-001：`agent_scope` を追加する

### 修正案

```ts
export type AgentScope = "project_independent" | "project_specific" | "experimental";
```

```yaml
agent_scope: "project_independent"
```

### 理由

将来的に `ats_architecture_agent` のようなProject特化Agentを許容する余地を残せます。
ただし、M2-3 Activeの初期Agentは `project_independent` を基本にするべきです。

---

## M2-3-REV-P1-002：Agent Registry validationにM2-3 DoDチェックを追加する

### 修正案

`validateAgentRegistry` に以下のようなチェックを追加する。

* `adr_writer` が存在する
* `requirements_writer` が存在する
* `implementation_reviewer` が存在する
* `task_planner` が存在する
* P0 Agentが全て存在する
* P1 Agentが全て存在する
* 各Agentに `output_contract` がある
* 各Agentに `forbidden_operations` がある

### 理由

Active化レビューを手作業だけにせず、機械的に検出できるようになります。

---

## M2-3-REV-P1-003：`article_writer` は登録するがLater扱いにする

### 修正内容

`article_agent` を `article_writer` にリネームし、Priorityを `Later` にする。

### 理由

計画書の初期候補と名称を合わせるためです。
ただし完了条件上はP0/P1ではないため、Active化の必須条件にはしなくてよいです。

---

## M2-3-REV-P1-004：`supported_project_codes` の扱いを再検討する

### 現状

Agentごとに `supported_project_codes` を持っています。

### 推奨

初期の汎用Agentは以下のいずれかにする。

```yaml
supported_project_codes:
  - "*"
```

または、より明示的にする。

```yaml
project_scope:
  type: "project_independent"
  supported_project_codes:
    - "*"
```

### 理由

Agent定義はProject非依存にし、Projectごとの適用可否はContext Build時に判定する方が自然です。

---

# 5. Active化に向けた修正方針

## 推奨するActive版構成

`config/agents.yaml` は、以下の5 Agentを中心に再構成するのがよいです。

```yaml
agents:
  - agent_code: "adr_writer"
    agent_name: "ADR整理Agent"
    priority: "P0"

  - agent_code: "requirements_writer"
    agent_name: "要件定義Agent"
    priority: "P0"

  - agent_code: "implementation_reviewer"
    agent_name: "実装レビューAgent"
    priority: "P1"

  - agent_code: "task_planner"
    agent_name: "タスク分解Agent"
    priority: "P1"

  - agent_code: "article_writer"
    agent_name: "記事化Agent"
    priority: "Later"
```

現ドラフトの `mnemosyne_docs_agent` や `ats_architecture_agent` は削除ではなく、将来的に以下のように扱うのがよいです。

| 現ドラフトAgent               | 扱い                                                     |
| ------------------------ | ------------------------------------------------------ |
| `mnemosyne_docs_agent`   | `adr_writer` / `requirements_writer` の具体運用例として退避       |
| `mnemosyne_review_agent` | 将来の `requirements_reviewer` または `document_reviewer` 候補 |
| `ats_architecture_agent` | `implementation_reviewer` のProject-specific preset候補   |
| `article_agent`          | `article_writer` にリネーム                                 |

---

# 6. Active化可否

## 判定

```text
No-Go
```

## 理由

* 必須のP0 Agent `adr_writer` / `requirements_writer` が未登録。
* 必須のP1 Agent `implementation_reviewer` / `task_planner` が未登録。
* Agent定義がProject固有に寄っている。
* Priorityを型・YAML・Serviceで扱えていない。
* 出力契約が既存Agentにはあるが、計画書上の初期Agent単位では未定義。

## 修正後の再レビュー条件

以下が満たされれば、Active化候補に進めます。

* `agents.yaml` に計画書通りのAgent Codeが登録されている。
* `priority` が追加されている。
* `adr_writer` / `requirements_writer` / `implementation_reviewer` / `task_planner` の出力契約と禁止事項が定義されている。
* Agent定義からProject固有Fact / Decision / Taskが除去されている。
* `agentRegistryService.ts` がPriorityと必須Agent存在チェックを検証できる。

---

## まとめ / Summary

**日本語:**
M2-3ドラフトは構造の方向性は良いですが、計画書の初期Agent候補とAgent Codeが一致していません。Active化前に、`adr_writer`、`requirements_writer`、`implementation_reviewer`、`task_planner` を登録し、Project固有に寄ったAgent定義を汎用Agent定義へ修正する必要があります。

**English:**
The M2-3 draft has a good structure, but the agent codes do not match the plan. Before activation, `adr_writer`, `requirements_writer`, `implementation_reviewer`, and `task_planner` must be added, and project-specific agent definitions should be changed into generic agent definitions.

## Conversation Memory

### fact

* M2-3：Agent Registry定義のドラフト版として、`config/agents.yaml`、`src/types/registry.ts`、`src/services/agentRegistryService.ts` が作成済み。
* 現ドラフトのAgentは `mnemosyne_docs_agent`、`mnemosyne_review_agent`、`ats_architecture_agent`、`article_agent` の4件。
* 今回提示された計画書では、初期Agent候補は `adr_writer`、`requirements_writer`、`implementation_reviewer`、`task_planner`、`article_writer`。
* 完了条件では、P0 Agentとして `adr_writer` / `requirements_writer`、P1 Agentとして `implementation_reviewer` / `task_planner` の登録が必要。
* 完了条件では、Agent定義にProject固有のFact / Decision / Taskが混入していないことが必要。
* 現ドラフトには、Mnemosyne専用・ATS専用に寄ったAgent定義が含まれている。

### decision

* M2-3ドラフトは、現状のままではActive化不可と判定した。
* Agent RegistryはProject固有情報ではなく、専門Agentの役割・Context要求・出力契約・禁止事項・write policyを管理するものとして整理する方針。
* Project固有のsource候補やFact / Decision / Taskは、Project Registry、Task Request、Additional Sources、Context Pack側で扱うべきと整理した。

### task

* `config/agents.yaml` に `adr_writer`、`requirements_writer`、`implementation_reviewer`、`task_planner` を追加または置換する。
* `article_agent` は `article_writer` にリネームし、PriorityをLaterにする。
* `priority` 型を `src/types/registry.ts` に追加する。
* `agentRegistryService.ts` にPriority検証と必須Agent存在チェックを追加する。
* `mnemosyne_docs_agent`、`mnemosyne_review_agent`、`ats_architecture_agent` はActive初期定義から外すか、Project-specific preset候補へ退避する。
* Agentごとの出力契約を、ADR、要件定義、実装レビュー、タスク分解に合わせて再整理する。

### preference

* Agent定義はProject非依存・汎用専門Agentとして設計する。
* Project固有の文脈はAgentに埋め込まず、Context Build時にProject Registryと組み合わせて解決する。
* Active化前にP0/P1レビューで修正点を明確にする進め方を継続する。

### constraint

* AIはActive文書を人間承認なしに直接更新しない。
* Agent RegistryはProject Registryのsource_status_policyやwrite_policyを上書きしない。
* Context Packは生成物であり、正本ではない。
* Agent定義にProject固有のFact / Decision / Taskを混入させない。
* `required_memory_docs` は存在検証対象であり、Context Packへの常時全文投入対象ではない。

### issue

* 現ドラフトは計画書のAgent Codeと一致していない。
* 現ドラフトにはPriority概念がない。
* 現ドラフトはProject固有Agentに寄っている。
* 現ドラフトの出力契約は、計画書上の初期Agent単位では再定義が必要。
* P0/P1 Agentの存在を機械的に検証するService機能が未実装。

### idea

* `agent_scope: project_independent | project_specific | experimental` を追加すると、汎用AgentとProject特化Agentを区別しやすい。
* `adr_draft`、`requirements_document`、`implementation_review_report`、`task_breakdown` のように出力契約を分けると、Agentごとの責務がより明確になる。
* Project-specific Agentは削除せず、将来のpresetまたはextensionとして退避できる。
* `validateAgentRegistry` にM2-3 DoDチェックを追加すると、Active化レビューを自動化しやすい。

### article_note

* Agent Registryは「AIの人格リスト」ではなく、「専門Agentの役割・入力・出力・禁止事項の契約表」と説明できる。
* Project RegistryとAgent Registryを分けることで、Project × Agent × Task によるContext Pack生成が可能になる。
* Project固有情報をAgent定義に混ぜないことが、汎用Agent化の重要な設計ポイントになる。

### conversation_summary

* M2-3：Agent Registry定義について、先に作成したドラフト版を計画書の初期Agent候補と完了条件に照らしてレビューした。
* レビューの結果、構造の骨格は良いが、Agent Code不一致、Project固有Agentへの偏り、Priority未定義、必須Agent存在チェック不足があるため、Active化不可と判定した。
* 次はP0/P1修正を反映したActive化候補版の作成が必要。

### test_result

* `agents.yaml` の内容確認により、現ドラフトのAgent Codeが計画書の初期Agent候補と一致しないことを確認した。
* 現ドラフトには既存Agentごとの `output_contract` と `forbidden_operations` は存在するが、計画書で指定された初期Agentに対しては未定義であると判定した。
* Active化判定は `No-Go`。
