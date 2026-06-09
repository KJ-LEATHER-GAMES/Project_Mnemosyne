---
title: "Context Build Rule"
document_id: "docs/context/context-build-rule.md"
document_role: "context_build_request_definition"
status: "draft"
version: "0.1.0"
created_at: "2026-06-09"
updated_at: "2026-06-09"
phase: "Phase 2: Context Forge"
milestone: "M2-4: Context Build Request定義"
owner: "Project Mnemosyne"
review_status: "draft"
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

`draft`

本書は、M2-4：Context Build Request定義のドラフト成果物である。

---

## 2. Purpose

本書は、Context Builderへ渡す入力形式である **Context Build Request** を定義する。

Context Build Requestは、以下を結合するための入力契約である。

- 対象Project
- 対象Agent
- 今回のTask Request
- 出力種別
- 追加source
- Session Context
- Recent Conversation Context
- Token Budget

Context Builderは、本Requestを基点としてProject Registry、Agent Registry、Source Status Policy、Recent Context Policyを参照し、Context Packを生成する。

---

## 3. Scope

### 3.1 In Scope

本書では以下を定義する。

- Context Build Requestの必須項目
- Context Build Requestの任意項目
- CLI引数と内部Request型の対応
- 入力値のvalidation rule
- 不正な `project_code` / `agent_code` / source指定時の扱い
- Context Pack生成前の正規化ルール
- Context Builderが出力すべきerror / warningの扱い

### 3.2 Out of Scope

本書では以下を扱わない。

- Context Pack本文の章構成
- Agent Registry自体の定義
- Project Registry自体の定義
- RAG検索ranking
- source本文の抽出・要約アルゴリズム
- token見積もりの詳細実装
- Active文書への直接反映

---

## 4. Position in Context Forge

Context Build Requestは、Context Pack生成処理の入口である。

```text
CLI Arguments / Request YAML / Programmatic Input
  -> Context Build Request
  -> Request Validation
  -> Project Registry Resolution
  -> Agent Registry Resolution
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
  output_type: "review_report"
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
| `output_type` | enum/string | no | Agent default output contract derived | 出力種別。Agentのoutput contract選定・Task Context生成に使う |
| `additional_sources` | string[] | no | `[]` | Task固有で追加したいsource path一覧 |
| `session_context` | object | no | `{ include: false }` | 今回セッションに閉じる補足情報 |
| `recent_context` | object | no | `{ include: false }` | 直近会話要約の投入指定 |
| `token_budget` | object | no | project / builder default | Context Pack生成時のtoken上限・圧縮方針 |
| `build_mode` | enum | no | `standard` | minimal / standard / full / debug の生成モード |
| `source_status_policy_override` | enum | no | none | 原則禁止。明示的なdebug用途のみ |

---

## 6. Field Rules

### 6.1 `project_code`

`project_code` はProject Registryの `projects[].project_code` と一致しなければならない。

Validation rule:

- 空文字は禁止する
- whitespaceのみは禁止する
- Project Registryに存在しない値は禁止する
- `project_code` はsource pathとして解釈しない

Error:

| Code | Severity | Description |
|---|---|---|
| `project_code_required` | error | `project_code` が未指定 |
| `project_not_found` | error | Project Registryに存在しない |
| `project_inactive` | error | Projectがactiveではない場合。debug modeではwarningへ緩和可 |

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
| `agent_inactive` | error | Agentがactiveではない場合。debug modeではwarningへ緩和可 |

### 6.3 `task_request`

`task_request` は今回の作業意図を表す必須入力である。

Validation rule:

- 空文字は禁止する
- whitespaceのみは禁止する
- 最小文字数は5文字を推奨する
- Active Decisionとして扱わない
- Context PackのTask ContextおよびBuild Metadataへ反映する

Error:

| Code | Severity | Description |
|---|---|---|
| `task_request_required` | error | `task_request` が未指定 |
| `task_request_too_short` | warning | 内容が短すぎてsource選定精度が下がる可能性がある |

### 6.4 `output_type`

`output_type` はContext Pack生成時の出力目的を示す。

初期候補は以下とする。

| Output Type | Primary Agent Use Case | Related Agent Output Contract |
|---|---|---|
| `review_report` | 実装・設計レビュー | `implementation_review_report` |
| `requirements_document` | 要件定義ドラフト | `requirements_document` |
| `adr_draft` | ADRドラフト | `adr_draft` |
| `task_breakdown` | タスク分解 | `task_breakdown` |
| `article_draft` | 記事化 | `article_draft` |
| `context_pack` | Context Pack生成のみ | Agent default |

`output_type` が未指定の場合は、Agent Registryの `default_output_contract` を基準に推定する。

不明な `output_type` はerrorではなくwarningとし、Agent default output contractへfallbackする。

Warning:

| Code | Severity | Description |
|---|---|---|
| `unknown_output_type` | warning | 未定義のoutput_type。Agent defaultへfallback |

### 6.5 `additional_sources`

`additional_sources` はTask固有で追加したいsource path一覧である。

Validation rule:

- repository rootからの相対pathとする
- 絶対pathは禁止する
- `../` を含むpathは禁止する
- 空文字は禁止する
- glob patternはM2-4初期版ではCLI入力として非推奨。必要な場合は将来拡張とする
- 指定sourceが存在しない場合はerrorとする
- Project Registryのsource candidateに一致しないsourceは、初期版ではerrorとする
- ただしdebug modeではwarning付きで `external_candidate` として扱える余地を残す

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

- `include: false` の場合、Session Context章には `Not included.` を出力する
- `notes` はContext PackのSession Contextへ反映する
- `session_context` はActive sourceより優先しない
- Active sourceと競合する場合は、Active sourceを優先し、Warningsへ `session_context_conflict` を出力する

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
- `source` は初期版では `conversation-summary` のみ正式対応とする
- Recent Contextは正本ではない
- Active sourceと競合する場合は、Active sourceを優先し、Warningsへ `recent_context_conflict` を出力する
- 詳細は `docs/context/recent-context-policy.md` に従う

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
- `max_tokens` が未指定の場合はbuilder defaultを使う
- token budget超過時はsource priority、Agent required context、Task Requestへの関連度に基づき省略・要約する
- 省略したsourceはBuild ReportとWarningsへ記録する

Error / Warning:

| Code | Severity | Description |
|---|---|---|
| `invalid_token_budget` | error | `max_tokens` が0以下または数値でない |
| `token_budget_exceeded` | warning | token budgetによりsourceを省略・要約した |

---

## 7. CLI Arguments Mapping

### 7.1 Standard CLI Form

```bash
npm run context:build -- \
  --project ats \
  --agent implementation_reviewer \
  --task "reward request usecaseのService依存をレビューする" \
  --output review_report \
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
| `--output` | `output_type` | no | 未指定時はAgent default |
| `--source` | `additional_sources[]` | no | 複数指定可 |
| `--session-note` | `session_context.notes[]` | no | 指定時は `session_context.include = true` |
| `--review-viewpoint` | `session_context.review_viewpoints[]` | no | 指定時は `session_context.include = true` |
| `--recent` | `recent_context.source` | no | 指定時は `recent_context.include = true` |
| `--no-recent` | `recent_context.include` | no | falseを明示 |
| `--max-tokens` | `token_budget.max_tokens` | no | 正の整数 |
| `--build-mode` | `build_mode` | no | `minimal` / `standard` / `full` / `debug` |

### 7.3 Request File Form

CLI引数が増える場合は、Request YAMLを入力できるようにする。

```bash
npm run context:build -- --request ./requests/ats-reward-review.context-request.yaml
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
  outputType: "review_report",
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
2. Required field validation
3. CLI / YAML mixed input validation
4. Project Registry resolution
5. Agent Registry resolution
6. Agent support project validation
7. Project required memory docs existence check
8. Additional source path safety validation
9. Additional source existence validation
10. Additional source candidate validation
11. Source status validation
12. Session Context validation
13. Recent Context validation
14. Token Budget validation

P0 errorがある場合、Context Packは生成しない。

warningのみの場合、Context Packは生成してよい。ただしWarningsおよびBuild Reportに必ず記録する。

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

M2-4の本書は、Active化時に以下を満たす必要がある。

- [ ] Context Build Requestの必須項目が定義されている。
- [ ] Context Build Requestの任意項目が定義されている。
- [ ] CLI引数からRequest型への変換が定義されている。
- [ ] 不正な `project_code` の扱いが定義されている。
- [ ] 不正な `agent_code` の扱いが定義されている。
- [ ] 不正なsource指定の扱いが定義されている。
- [ ] Session Contextの扱いが定義されている。
- [ ] Recent Conversation Context / Conversation Summaryの扱いが定義されている。
- [ ] `src/types/context.ts` と対応している。

---

## 14. Open Issues for Review

| ID | Issue | Candidate Resolution |
|---|---|---|
| M2-4-OI-001 | `additional_sources` がProject Registry候補外の場合に完全禁止するか | 初期版はerror。debug modeのみwarning候補 |
| M2-4-OI-002 | `output_type` をAgent output contract IDへ統一するか | CLI利用性を優先し、別名として保持 |
| M2-4-OI-003 | Request YAMLの正式保存先 | `requests/*.context-request.yaml` 候補 |
| M2-4-OI-004 | token見積もりの実装粒度 | M2-4では型と方針まで。実装詳細は後続 |

---

## 15. Revision History

| Version | Date | Status | Summary | Author |
|---|---|---|---|---|
| 0.1.0 | 2026-06-09 | draft | Context Build Request、CLI mapping、validation、error handlingの初版を作成。 | user / AI |
