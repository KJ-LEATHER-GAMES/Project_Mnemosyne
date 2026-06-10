---
title: "Context Build Rule"
document_id: "docs/context/context-build-rule.md"
document_role: "context_build_request_definition"
status: "active"
version: "1.0.0"
created_at: "2026-06-09"
updated_at: "2026-06-09"
phase: "Phase 2: Context Forge"
milestone: "M2-4: Context Build Request定義"
owner: "Project Mnemosyne"
review_status: "active"
related_documents:
  - "docs/context/context-pack-structure.md"
  - "docs/context/recent-context-policy.md"
  - "docs/context/source-status-policy.md"
  - "config/projects.yaml"
  - "config/agents.yaml"
  - "src/types/context.ts"
  - "src/types/registry.ts"
  - "src/services/projectRegistryService.ts"
  - "src/services/agentRegistryService.ts"
---

# Context Build Rule

## 1. Status

`active`

本書は、M2-4：Context Build Request定義のActive成果物である。

---

## 2. Purpose

本書は、Context Builderへ渡す入力形式である **Context Build Request** を定義する。

Context Build Requestは、以下を結合するための入力契約である。

- 対象Project
- 対象Agent
- 今回のTask Request
- 出力契約
- 追加source
- Session Context
- Recent Conversation Context
- Token Budget

Context Builderは、本Requestを基点としてProject Registry、Agent Registry、Source Status Policy、Recent Context Policyを参照し、Context Packを生成する。

Context Build Requestは正本ではない。Context Packと同様に、特定の生成処理を制御するための入力であり、ActiveなFact / Decision / Task / Constraintとして扱ってはならない。

---

## 3. Scope

### 3.1 In Scope

本書では以下を定義する。

- Context Build Requestの必須項目
- Context Build Requestの任意項目
- CLI引数と内部Request型の対応
- 入力値のvalidation rule
- 不正な `project_code` / `agent_code` / source指定時の扱い
- `output_type` とAgent Registry `output_contract_id` の対応
- Context Pack生成前の正規化ルール
- Context Builderが出力すべきerror / warning / infoの扱い

### 3.2 Out of Scope

本書では以下を扱わない。

- Context Pack本文の章構成
- Agent Registry自体の定義
- Project Registry自体の定義
- RAG検索ranking
- source本文の抽出・要約アルゴリズム
- token見積もりの詳細実装
- Active文書への直接反映
- validation / resolution関数の実装詳細

---

## 4. Position in Context Forge

Context Build Requestは、Context Pack生成処理の入口である。

```text
CLI Arguments / Request YAML / Programmatic Input
  -> Context Build Request
  -> Request Validation
  -> Project Registry Resolution
  -> Agent Registry Resolution
  -> Output Contract Resolution
  -> Source Candidate Resolution
  -> Source Status Handling
  -> Session / Recent Context Handling
  -> Token Budget Handling
  -> Context Pack Generation
  -> Build Report Generation
```

Context Packは正本ではなく生成物である。Context Build Requestも正本ではない。

Context Build Requestに含まれる `task_request`、`session_context`、`recent_context` は、今回のContext Pack生成を制御する入力であり、ActiveなFact / Decision / Taskとして扱ってはならない。

---

## 5. Context Build Request Definition

### 5.1 YAML Example

```yaml
context_build_request:
  project_code: "ats"
  agent_code: "implementation_reviewer"
  task_request: "reward request usecaseのService依存をレビューする"
  output_type: "implementation_review_report"
  additional_sources:
    - "src/usecases/requestRewardUseCase.ts"
    - "src/services/line/lineRewardReplyService.ts"
    - "docs/usecase-contracts.md"
  session_context:
    include: true
    notes:
      - "今回の焦点はServiceからUseCaseを呼び出す依存方向の妥当性"
      - "修正後フローはシーケンス図と依存関係図で整理したい"
  recent_context:
    include: true
    source: "conversation-summary"
  token_budget:
    max_tokens: 12000
    reserve_tokens_for_response: 2000
    truncation_strategy: "priority_based"
```

### 5.2 Required Fields

| Field | Type | Required | Description |
|---|---:|:---:|---|
| `project_code` | string | yes | Project Registry上の対象Project code |
| `agent_code` | string | yes | Agent Registry上の対象Agent code |
| `task_request` | string | yes | 今回AIに実行させたい作業内容 |

### 5.3 Optional Fields

| Field | Type | Required | Default | Description |
|---|---:|:---:|---|---|
| `output_type` | enum/string | no | Agent default output contract | 出力契約。原則Agent Registryの `output_contract_id` と一致させる |
| `additional_sources` | string[] | no | `[]` | Task固有で追加したいsource path一覧 |
| `session_context` | object | no | `{ include: false }` | 今回セッションに閉じる補足情報 |
| `recent_context` | object | no | `{ include: false }` | 直近会話要約の投入指定 |
| `token_budget` | object | no | builder default | Context Pack生成時のtoken上限・圧縮方針 |
| `build_mode` | enum | no | `standard` | minimal / standard / full / debug の生成モード |

### 5.4 Prohibited Field

M2-4 Active版では、`source_status_policy_override` をContext Build Requestの正式入力から除外する。

理由は以下である。

- Source Status PolicyはProject Registryが保持するProject側のsource読取方針である。
- Agent Registryのwrite policyでは、AIがProject Registryの `source_status_policy` をoverrideすることは禁止される。
- overrideをRequest側に残すと、draft / archived / unknown sourceの扱いがTask入力だけで緩和される危険がある。

`source_status_policy_override` が入力された場合、Context Builderは以下を返す。

| Code | Severity | Description |
|---|---|---|
| `source_status_policy_override_not_allowed` | error | M2-4 Active版では `source_status_policy_override` は禁止 |

将来、debug用途でoverrideを許可する場合は、別Milestoneで明示的に設計する。

---

## 6. Field Rules

### 6.1 `project_code`

`project_code` はProject Registryの `projects[].project_code` と一致しなければならない。

Validation rule:

- 空文字は禁止する
- whitespaceのみは禁止する
- Project Registryに存在しない値は禁止する
- Projectのstatusは原則 `active` とする
- `project_code` はsource pathとして解釈しない

Error:

| Code | Severity | Description |
|---|---|---|
| `project_code_required` | error | `project_code` が未指定 |
| `project_not_found` | error | Project Registryに存在しない |
| `project_inactive` | error | Projectがactiveではない場合。debug modeでもContext Pack生成は停止する |

### 6.2 `agent_code`

`agent_code` はAgent Registryの `agents[].agent_code` と一致しなければならない。

Validation rule:

- 空文字は禁止する
- whitespaceのみは禁止する
- Agent Registryに存在しない値は禁止する
- Agentが対象 `project_code` をsupportしている必要がある
- Agentのstatusは原則 `active` とする

Error:

| Code | Severity | Description |
|---|---|---|
| `agent_code_required` | error | `agent_code` が未指定 |
| `agent_not_found` | error | Agent Registryに存在しない |
| `agent_project_not_supported` | error | Agentが対象Projectをsupportしていない |
| `agent_inactive` | error | Agentがactiveではない場合。debug modeでもContext Pack生成は停止する |

### 6.3 `task_request`

`task_request` は今回の作業意図を表す必須入力である。

Validation rule:

- 空文字は禁止する
- whitespaceのみは禁止する
- 最小文字数は5文字を推奨する
- Active Decisionとして扱わない
- Context PackのTask ContextおよびBuild Metadataへ反映する

Error / Warning:

| Code | Severity | Description |
|---|---|---|
| `task_request_required` | error | `task_request` が未指定 |
| `task_request_too_short` | warning | 内容が短すぎてsource選定精度が下がる可能性がある |

### 6.4 `output_type`

`output_type` はContext Pack生成時にAgentへ期待する出力契約を示す。

M2-4 Active版では、`output_type` は原則としてAgent Registryの `output_contract_id` と一致させる。

| `output_type` | Related Agent Output Contract | Description |
|---|---|---|
| `implementation_review_report` | `implementation_review_report` | 実装・設計文書・契約・テスト結果の整合レビュー |
| `requirements_document` | `requirements_document` | 要件定義文書のドラフト、修正版、構成案 |
| `adr_draft` | `adr_draft` | ADR草案またはADR整理案 |
| `task_breakdown` | `task_breakdown` | Task、優先度、依存関係、完了条件への分解 |
| `article_draft` | `article_draft` | 開発記録・設計メモ・検証ログの記事化 |
| `context_pack` | none | Context Pack生成のみ。Agent output contractを要求しない |

#### Alias Policy

過去ドラフトで使った `review_report` は、M2-4 Active版では正式値としない。

ただしCLI互換用aliasとして以下の正規化を許可する。

| Alias | Normalized `output_type` | Handling |
|---|---|---|
| `review_report` | `implementation_review_report` | warningなしで正規化してよい |

#### Resolution Rule

1. `output_type` が未指定の場合、Agent Registryの `default_output_contract.output_contract_id` を使用する。
2. `output_type` がAgent Registryの対応output contractに存在する場合、その `output_contract_id` を使う。
3. `output_type = context_pack` の場合、`output_contract_id` は不要とし、Context Pack生成のみを目的とする。
4. unknown `output_type` はM2-4 Active版ではerrorとする。

P2として、unknown `output_type` をwarning fallbackする方針は後続で再検討する。

Error:

| Code | Severity | Description |
|---|---|---|
| `unknown_output_type` | error | 未定義の `output_type` |
| `output_contract_not_supported_by_agent` | error | Agentが指定されたoutput contractをsupportしていない |

### 6.5 `additional_sources`

`additional_sources` はTask固有で追加したいsource path一覧である。

Validation rule:

- repository rootからの相対pathとする
- Windows path separator `\` は `/` へ正規化する
- 絶対pathは禁止する
- `../` を含むpathは禁止する
- 空文字は禁止する
- `additional_sources` 自体にglob patternを指定することはM2-4初期版では禁止する
- 指定sourceが存在しない場合はerrorとする
- Project Registryのsource candidateに一致しないsourceはerrorとする

#### Candidate Matching Rule

`additional_sources` のcandidate validationは、以下のProject Registry source candidateとのglob matchにより判定する。

- `optional_sources[].patterns`
- `adr_sources[].patterns`
- `review_sources[].patterns`

判定時は以下を適用する。

1. 入力pathとRegistry patternをrepository root相対pathへ正規化する。
2. `\` を `/` へ正規化する。
3. `.` / 空文字 / 絶対path / `../` を含むpathは比較前にerrorとする。
4. glob matchはContext Builder実装側の責務とする。
5. `required_memory_docs` は存在検証対象であり、`additional_sources` のcandidate判定には直接使わない。
6. ただし、Agent Registryの `required_context` / `optional_context` により、required memory docsがContext Packへ採用されることはある。

Error / Warning:

| Code | Severity | Description |
|---|---|---|
| `invalid_additional_source_path` | error | 絶対path、`../`、空文字など不正path |
| `additional_source_not_found` | error | 指定sourceが存在しない |
| `additional_source_not_allowed` | error | Project Registryのsource candidateに該当しない |
| `additional_source_status_warning` | warning | draft / archived等、warning必須statusのsourceを含めた |

### 6.6 `session_context`

`session_context` は今回のContext Pack生成に閉じる一時情報である。

```yaml
session_context:
  include: true
  notes:
    - "今回の焦点はServiceからUseCaseを呼び出す依存方向の妥当性"
  review_viewpoints:
    - "ServiceからUseCaseを呼び出していないか"
  temporary_constraints:
    - "今回はコード修正ではなくレビューのみ"
```

Rules:

- `include: true` の場合、Session Context章へ反映する
- `include: false` または未指定で、`notes` / `review_viewpoints` / `temporary_constraints` が存在する場合、Context Builderは `include: true` へ正規化する
- CLIで `--session-note` または `--review-viewpoint` が指定された場合も `session_context.include = true` へ正規化する
- `notes` はContext PackのSession Contextへ反映する
- `session_context` はActive sourceより優先しない
- Active sourceと競合する場合は、Active sourceを優先し、Warningsへ `session_context_conflict` を出力する

Info / Warning:

| Code | Severity | Description |
|---|---|---|
| `session_context_auto_included` | info | include=falseまたは未指定だがnotes等があるためinclude=trueへ正規化 |
| `session_context_conflict` | warning | Session ContextがActive sourceと競合 |

### 6.7 `recent_context`

`recent_context` はConversation Summary等から取得する直近会話由来の文脈である。

```yaml
recent_context:
  include: true
  source: "conversation-summary"
  max_items: 20
  max_age_days: 30
```

Rules:

- `include: false` の場合、Recent Conversation Context章には `Not included.` を出力する
- `include: true` かつ `source` 未指定の場合、`source = conversation-summary` をdefault補完する
- `source` はM2-4 Active版では `conversation-summary` のみ正式対応とする
- `--recent` が値なしで指定された場合も `source = conversation-summary` として扱う
- `--recent` と `--no-recent` が同時指定された場合はerrorとする
- Recent Contextは正本ではない
- Active sourceと競合する場合は、Active sourceを優先し、Warningsへ `recent_context_conflict` を出力する
- 詳細は `docs/context/recent-context-policy.md` に従う

Error / Warning:

| Code | Severity | Description |
|---|---|---|
| `conflicting_recent_context_options` | error | `--recent` と `--no-recent` が同時指定された |
| `unsupported_recent_context_source` | error | `conversation-summary` 以外が指定された |
| `invalid_recent_context_option` | error | max_items等の不正値 |
| `recent_context_source_defaulted` | info | include=trueかつsource未指定のためconversation-summaryへdefault補完 |
| `recent_context_conflict` | warning | Recent ContextがActive sourceと競合 |

### 6.8 `token_budget`

`token_budget` はContext Pack生成時のtoken上限を制御する。

```yaml
token_budget:
  max_tokens: 12000
  reserve_tokens_for_response: 2000
  truncation_strategy: "priority_based"
```

Rules:

- `max_tokens` は正の整数とする
- `max_tokens` の推奨下限は1000とする
- `reserve_tokens_for_response` は0以上の整数とする
- `reserve_tokens_for_response` は `max_tokens` 未満とする
- `max_tokens` が未指定の場合はbuilder defaultを使う
- token budget超過時はsource priority、Agent required context、Task Requestへの関連度に基づき省略・要約する
- 省略したsourceはBuild ReportとWarningsへ記録する

Error / Warning:

| Code | Severity | Description |
|---|---|---|
| `invalid_token_budget` | error | `max_tokens` が0以下または数値でない |
| `token_budget_too_small` | warning | `max_tokens` が推奨下限未満 |
| `token_budget_reserve_exceeds_max` | error | `reserve_tokens_for_response` が `max_tokens` 以上 |
| `token_budget_exceeded` | warning | token budgetによりsourceを省略・要約した |

---

## 7. CLI Arguments Mapping

### 7.1 Standard CLI Form

```bash
npm run context:build -- \
  --project ats \
  --agent implementation_reviewer \
  --task "reward request usecaseのService依存をレビューする" \
  --output implementation_review_report \
  --source src/usecases/requestRewardUseCase.ts \
  --source src/services/line/lineRewardReplyService.ts \
  --source docs/usecase-contracts.md \
  --session-note "今回の焦点はServiceからUseCaseを呼び出す依存方向の妥当性" \
  --recent conversation-summary \
  --max-tokens 12000
```

### 7.2 CLI to Request Mapping

| CLI Argument | Context Build Request Field | Required | Notes |
|---|---|:---:|---|
| `--project` | `project_code` | yes | `project_code` のalias |
| `--agent` | `agent_code` | yes | `agent_code` のalias |
| `--task` | `task_request` | yes | 空文字禁止 |
| `--output` | `output_type` | no | 未指定時はAgent default。`review_report` はaliasとして正規化 |
| `--source` | `additional_sources[]` | no | 複数指定可。実pathのみ。glob不可 |
| `--session-note` | `session_context.notes[]` | no | 指定時は `session_context.include = true` |
| `--review-viewpoint` | `session_context.review_viewpoints[]` | no | 指定時は `session_context.include = true` |
| `--recent` | `recent_context.source` | no | 指定時は `recent_context.include = true`。値なしなら `conversation-summary` |
| `--no-recent` | `recent_context.include` | no | falseを明示 |
| `--max-tokens` | `token_budget.max_tokens` | no | 正の整数 |
| `--build-mode` | `build_mode` | no | `minimal` / `standard` / `full` / `debug` |

### 7.3 Conflicting CLI Options

`--recent` と `--no-recent` が同時指定された場合はerrorとする。

| Code | Severity | Description |
|---|---|---|
| `conflicting_recent_context_options` | error | `--recent` と `--no-recent` の同時指定は禁止 |

### 7.4 Request File Form

CLI引数が増える場合は、Request YAMLを入力できるようにする。

推奨保存先は以下とする。

```text
requests/context/*.context-request.yaml
```

理由は以下である。

- Request YAMLはContext Builderへの実行入力であり、Active正本文書ではない。
- `docs/` 配下の正本文書やテンプレートと混同しない。
- project別、agent別、task別の実行例を蓄積しやすい。

CLI例:

```bash
npm run context:build -- --request requests/context/ats-reward-review.context-request.yaml
```

`--request` と個別CLI引数が同時指定された場合は、初期版ではerrorとする。

| Code | Severity | Description |
|---|---|---|
| `mixed_request_input_not_allowed` | error | `--request` と個別CLI引数の同時指定は禁止 |

---

## 8. Internal Request Normalization

Context Builderは、CLIまたはYAMLから受け取った入力を以下の内部型へ正規化する。

```ts
const request: ContextBuildRequest = {
  projectCode: "ats",
  agentCode: "implementation_reviewer",
  taskRequest: "reward request usecaseのService依存をレビューする",
  outputType: "implementation_review_report",
  additionalSources: [
    { path: "src/usecases/requestRewardUseCase.ts" },
    { path: "src/services/line/lineRewardReplyService.ts" },
    { path: "docs/usecase-contracts.md" },
  ],
  sessionContext: {
    include: true,
    notes: [
      "今回の焦点はServiceからUseCaseを呼び出す依存方向の妥当性",
      "修正後フローはシーケンス図と依存関係図で整理したい",
    ],
  },
  recentContext: {
    include: true,
    source: "conversation-summary",
  },
  tokenBudget: {
    maxTokens: 12000,
    reserveTokensForResponse: 2000,
    truncationStrategy: "priority_based",
  },
  buildMode: "standard",
};
```

Naming rule:

- YAML / JSONの外部入力は `snake_case`
- TypeScript内部型は `camelCase`
- Context PackのBuild Metadataでは、読みやすさを優先し表示名を使ってよい

---

## 9. Validation Flow

Context Builderは以下の順序でvalidationする。

1. Request shape validation
2. Prohibited field validation
3. Required field validation
4. CLI / YAML mixed input validation
5. CLI conflicting option validation
6. Project Registry resolution
7. Project status validation
8. Project required memory docs existence check
9. Agent Registry resolution
10. Agent support project validation
11. Output Contract resolution
12. Additional source path safety validation
13. Additional source existence validation
14. Additional source candidate validation
15. Source status validation
16. Session Context normalization / validation
17. Recent Context normalization / validation
18. Token Budget validation

P0 errorがある場合、Context Packは生成しない。

warningのみの場合、Context Packは生成してよい。ただしWarningsおよびBuild Reportに必ず記録する。

### 9.1 Required Memory Docs Stop Rule

`required_memory_docs` の存在検証に失敗した場合、Context BuilderはerrorとしてContext Pack生成を停止する。

対象はProject Registryが定義する標準5文書である。

```text
project-summary.md
current-status.md
active-decisions.md
next-actions.md
ai-entrypoint.md
```

停止時も、可能であればBuild Reportを生成し、`missing_required_doc` を記録する。

Debug modeであっても、Context Pack本文は生成しない。ただし、source resolution調査用のBuild Reportのみ生成してよい。

---

## 10. Error Handling Policy

### 10.1 Error Severity

| Severity | Meaning | Context Pack Generation |
|---|---|---|
| `error` | 入力不正または前提不成立 | stop |
| `warning` | 生成は可能だが注意が必要 | continue |
| `info` | 参考情報 | continue |

### 10.2 Error Output Format

CLIは以下の形式でvalidation resultを返す。

```json
{
  "ok": false,
  "errors": [
    {
      "code": "project_not_found",
      "message": "Project not found in Project Registry: unknown",
      "field": "project_code",
      "value": "unknown"
    }
  ],
  "warnings": []
}
```

### 10.3 Build Report Integration

warningがある場合は、Context Pack内のWarnings章とBuild Report Summaryへ反映する。

errorで停止した場合も、可能であればbuild-reportを出力してよい。

```text
dist/context/{project_code-or-unknown}/{agent_code-or-unknown}/build-report.md
```

---

## 11. Source Selection Rule

Context Build Requestはsource選定の唯一の根拠ではない。

Context Packに含めるsourceは、以下を組み合わせて決定する。

1. Agent Registry `required_context`
2. Agent Registry `optional_context`
3. Project Registry source candidates
4. Task Request
5. Additional Sources
6. Source Status Policy
7. Recent Context Policy
8. Token Budget
9. Build Mode

`required_memory_docs` は存在検証対象であり、Context Packへの常時全文投入対象ではない。

---

## 12. Build Mode

| Build Mode | Description | Primary Use Case |
|---|---|---|
| `minimal` | 必須context中心。token節約 | 軽い相談・方向性確認 |
| `standard` | 標準。Agent required context + Task関連source | 通常のレビュー・ドラフト作成 |
| `full` | optional contextも広めに投入 | Phaseレビュー・包括レビュー |
| `debug` | validation / source resolutionの確認を重視 | Builder開発・検証 |

初期defaultは `standard` とする。

---

## 13. Acceptance Criteria

M2-4の本書は以下を満たす。

- [x] Context Build Requestの必須項目が定義されている。
- [x] Context Build Requestの任意項目が定義されている。
- [x] CLI引数と内部Request型の対応が定義されている。
- [x] 不正な `project_code` の扱いが定義されている。
- [x] 不正な `agent_code` の扱いが定義されている。
- [x] 不正な source 指定時の扱いが定義されている。
- [x] `output_type` と `output_contract_id` の対応が定義されている。
- [x] `recent_context.include=true` かつ `source` 未指定時の扱いが定義されている。
- [x] `additional_sources` とProject Registry glob candidateの照合方法が定義されている。
- [x] `source_status_policy_override` はM2-4 Active版で禁止と定義されている。
- [x] `required_memory_docs` 欠落時のContext Build停止条件が定義されている。
- [x] Session Context / Recent Conversation Context / Conversation Summaryの扱いが定義されている。
- [x] Request YAMLの推奨保存先が定義されている。

---

## 14. Follow-up Items

| ID | Item | Handling |
|---|---|---|
| M2-4-REV-P2-001 | unknown `output_type` のfallback方針 | 後続で再検討。M2-4 Active版ではerror |
| M2-4-REV-P2-002 | Conversation Summary保存先 | M2-5以降で確定 |
| M2-4-REV-P2-003 | validation / resolution関数の実装 | 後続実装で追加 |

---

## 15. Revision History

| Version | Date | Status | Summary | Author |
|---|---|---|---|---|
| 0.1.0 | 2026-06-09 | draft | Context Build Requestの入力形式、CLI対応、validation方針を定義。 | user / AI |
| 1.0.0 | 2026-06-09 | active | P0/P1レビュー結果を反映し、output contract対応、recent context default、additional sources照合、override禁止、required memory docs停止条件を明確化。 | user / AI |
