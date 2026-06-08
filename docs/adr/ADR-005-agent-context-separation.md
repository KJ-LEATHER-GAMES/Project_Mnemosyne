---
title: "ADR-005: Agent and Project Context Separation"
document_id: "docs/adr/ADR-005-agent-context-separation.md"
adr_id: "ADR-005"
status: "active"
version: "1.0.0"
created_at: "2026-06-05"
updated_at: "2026-06-08"
approved_at: "2026-06-08"
phase: "Phase 1: Memory Foundation"
milestone: "M1-6: Agent接続方針整理"
decision_scope: "Agent Context Architecture"
related_documents:
  - "docs/phases/phase-1-memory-foundation.md"
  - "docs/phases/phase-2-input-requirements.md"
  - "docs/adr/ADR-001-docs-as-source-of-memory.md"
  - "docs/adr/ADR-002-memory-source-of-truth-boundary.md"
  - "docs/adr/ADR-003-human-approved-memory-update.md"
  - "docs/adr/ADR-004-project-independent-memory-template.md"
  - "docs/projects/mnemosyne/memory/active-decisions.md"
  - "docs/projects/mnemosyne/memory/ai-entrypoint.md"
  - "docs/projects/ats/memory/ai-entrypoint.md"
  - "docs/review/phase-1-ats-template-validation.md"
supersedes: null
superseded_by: null
---

# ADR-005: Agent and Project Context Separation

## 1. Status

`active`

---

## 2. Context

Project Mnemosyneは、特定プロジェクト専用のAIチャットを作るのではなく、将来的に以下の組み合わせでAI支援を再利用できる状態を目指している。

```text
Specialized Agent
  ×
Project Context
  ×
Task Context
```

例：

```text
ADR整理Agent × ATS Context × 新しい設計判断のADR草案作成
実装レビューAgent × ATS Context × UseCase設計レビュー
要件定義Agent × Mnemosyne Context × Phase 2要件整理
記事化Agent × ATS Context × 開発日記作成
```

ここで、Agent定義とProject Contextを混在させると、以下の問題が起きる。

- ATS用ADR整理Agent、Mnemosyne用ADR整理AgentのようにAgentがプロジェクトごとに増殖する
- Agentの役割、禁止事項、出力形式と、プロジェクトの事実・判断・状態が混ざる
- プロジェクトを切り替えるたびにAgent定義を書き換える必要がある
- Phase 2で `agents.yaml` と `projects.yaml` の責務境界が曖昧になる
- Context Pack Builderが「何をするAgentか」と「何について作業するか」を分離できない

Phase 1ではAgent実装は行わない。ただし、Agentがどの記憶を必要とするか、Agent定義とProject Contextをどう分離するかは、Phase 2入力として整理しておく必要がある。

---

## 3. Decision

Project Mnemosyneでは、専門Agent定義とProject Contextを分離する。

Agent Contextは、Project Memoryの正本ではない。

Agent Contextは、AIにどの役割・制約・出力形式で作業させるかを定義する実行設定である。

ProjectのFact、Decision、Task、Issue、ConstraintはProject Memory側に保持する。

---

## 4. Context Layers

| Layer | Meaning | Examples | Source in Phase 2 |
|---|---|---|---|
| Base Context | Mnemosyne共通の記憶運用ルール | 正本/副本、AI draft only、状態管理、参照優先順位 | common docs / memory policy |
| Agent Context | Agentの役割、責務、入力、出力、禁止事項 | ADR整理Agent、実装レビューAgent、要件定義Agent | `agents.yaml` |
| Project Context | 対象プロジェクトの概要、状態、判断、Task | Mnemosyne、ATS、TapLog等 | `projects.yaml` + memory docs |
| Task Context | 今回の依頼内容、作業範囲、追加入力 | 「ADR-006を作る」「UseCaseをレビューする」 | user prompt / task file |
| Recent Conversation Context | 直近会話の要約、未反映の補足 | 会話中の最新指示、レビュー結果 | conversation summary / chat |
| Output Contract | 成果物の形式、禁止事項、品質条件 | ADR形式、レビュー表、修正案リスト | agent definition / task request |

---

## 5. Responsibility Boundary

### 5.1 Agent Contextが持つもの

| Item | Description |
|---|---|
| Role | Agentが何をする役割か |
| Scope | 扱う作業範囲 |
| Required Context Types | 必須となる記憶種別 |
| Optional Context Types | あれば使う記憶種別 |
| Output Type | 出力種別 |
| Output Contract | 出力構成・品質条件 |
| Prohibited Actions | 禁止事項 |
| Write Policy | 正本更新可否。原則 `draft_only` |

### 5.2 Agent Contextが持たないもの

| Item | Where to Keep |
|---|---|
| Project固有のFact | `project-summary.md` / `current-status.md` |
| Project固有のDecision | `active-decisions.md` / ADR |
| Project固有のTask | `next-actions.md` |
| Project固有のIssue | `current-status.md` または専用review/issue文書 |
| Project固有のAI入口 | `ai-entrypoint.md` |
| 会話から抽出した更新候補 | `conversation-summary` またはAI draft |

---

## 6. Recent Conversation Context Policy

Recent Conversation Contextは、直近の補足・未反映情報として扱う。

Active正本と競合する場合、Active正本を優先し、会話内容はConflict候補または更新候補として扱う。

Recent Conversation Contextにしか存在しない情報は、以下のように扱う。

| Situation | Handling |
|---|---|
| ユーザーが明示的に今回の作業対象として指定した | Task Contextとして参照可能 |
| Active正本へ未反映の判断候補である | Decision候補として扱い、確定判断には使わない |
| Active正本と矛盾する | Conflict Issue候補として扱う |
| 出典が不明確 | 推測で補完せず、不足Contextとして明示する |

---

## 7. Context Pack Composition

Context Packは、以下の要素を組み合わせて生成する。

```text
1. Base Context
2. Agent Context
3. Project Context
4. Task Context
5. Recent Conversation Context
6. Output Contract
7. Source List
8. Warnings / Build Report
```

Context Packは正本ではなく生成物である。

---

## 8. Resolution Order, Rendering Order, Source Priority

Context Pack生成では、以下の3種類の順序を混同しない。

| Order Type | Meaning | Example |
|---|---|---|
| Resolution Order | Builderが文書を探索・検証する順序 | Project Registry → Agent Registry → memory docs |
| Rendering Order | AIへ渡すContext Pack内の表示順序 | Agent Role → Project Summary → Task Request |
| Source Priority | 競合時にどの情報を優先するか | Active ADR > Active memory docs > conversation summary |

### 8.1 Resolution Order候補

```text
1. project_codeを解決する
2. agent_codeを解決する
3. required_memory_docsの存在を検証する
4. agentが必要とするmemory_typeを解決する
5. task_requestに応じてadditional_sourcesを追加する
6. status / conflict / draft混入を検査する
```

### 8.2 Rendering Order候補

```text
1. Agent Role and Output Contract
2. Target Project Summary
3. Current Status
4. Active Decisions and Constraints
5. Task Request
6. Required Actions / Output Format
7. Source List
8. Warnings
```

### 8.3 Source Priority候補

```text
1. Active ADR
2. Active memory docs
3. Active review / phase docs
4. Explicit user-provided task source
5. Draft source explicitly selected for review
6. Conversation summary / recent conversation context
```

`ai-entrypoint.md` は入口であり、Decision / Task / Issueの正本ではない。

---

## 9. Context Insufficiency Handling

Agentが必要とするContextが不足している場合、AIは不足を明示し、推測で補完しない。

| Situation | Required Behavior |
|---|---|
| 必須文書が存在しない | Context不足として報告する |
| optional sourceが未登録 | 追加確認候補として提示する |
| activeな判断が見つからない | 未決定として扱う |
| active正本間に競合がある | Conflict Issueとして扱い、確定判断に使わない |
| Conversation Summaryにしかない情報 | 未反映の一次整理情報として扱う |
| draft sourceしか存在しない | warningを付け、確定判断の根拠にしない |

---

## 10. Initial Agent Candidates

| Agent Code | Agent Name | Required Context | Optional Context | Output Type | Priority |
|---|---|---|---|---|---|
| `adr_writer` | ADR整理Agent | project_summary / active_decisions / ADR | current_status / related docs | `adr_draft` | P0 |
| `requirements_writer` | 要件定義Agent | project_summary / current_status / next_actions | issues / ideas / previous requirements | `requirements_draft` | P0 |
| `implementation_reviewer` | 実装レビューAgent | project_summary / current_status / active_decisions | architecture / source / test docs | `review_report` | P1 |
| `task_planner` | タスク分解Agent | current_status / next_actions / active_decisions | roadmap / review docs | `task_plan` | P1 |
| `article_writer` | 記事化Agent | project_summary / approved summaries | decisions / development logs | `article_draft` | Later |

---

## 11. Write Policy

Phase 2時点のAgentは、原則として正本へ直接書き込まない。

| `write_policy` | Meaning | Phase 2 Use |
|---|---|---|
| `draft_only` | AIはdraft作成まで。正本反映は人間承認後 | default |
| `suggest_changes` | 差分提案のみ行う | allowed |
| `read_only` | 読み取りと分析のみ行う | allowed |
| `human_approved_write` | 人間承認後に正本へ反映する | future candidate |
| `direct_write` | AIが正本へ直接反映する | prohibited in Phase 2 |

---

## 12. Rationale

### 12.1 Agentの再利用性を高める

Agentをプロジェクト非依存にすることで、同じADR整理AgentをMnemosyne、ATS、TapLog等へ適用できる。

### 12.2 Context Pack Builderを設計しやすくする

`agent_code` と `project_code` を分ければ、Phase 2で以下のようにContext生成を設計できる。

```text
context:build --project ats --agent implementation_reviewer --task usecase-review
```

この構造により、Context BuilderはAgent要件とProject文書を別々に解決できる。

### 12.3 プロジェクト記憶の汚染を防ぐ

Agentの出力形式や振る舞いをProject文書へ埋め込むと、Project Contextが特定Agentの都合に引きずられる。

Project Contextは「何についての情報か」を記録し、Agent Contextは「どう処理するか」を記録する。

### 12.4 AIの誤読を減らす

AgentとProjectを分離することで、AIに渡すContext Pack上でも、以下を明示できる。

```text
Role: 実装レビューAgent
Target Project: ATS
Task: action_select UseCaseの責務分離レビュー
Allowed Output: review report only
Write Policy: draft only
```

---

## 13. Alternatives Considered

### 13.1 プロジェクトごとに専用Agentを作る

**却下。** 初期導入は簡単だが、プロジェクトが増えるほどAgent定義が増殖し、役割変更時に全Agentを修正する必要がある。

### 13.2 Agent定義にProject Contextを埋め込む

**却下。** Agentの再利用性が失われ、古いProject情報がAgent定義内に残る危険がある。

### 13.3 Project Contextだけを渡し、Agent定義を作らない

**却下。** AIの役割・出力形式・禁止事項が毎回のプロンプト依存になり、品質が安定しない。

### 13.4 Agent RegistryをPhase 1で実装する

**却下。** Phase 1では実装を行わず、Phase 2に必要な入力要件整理までに留める。

---

## 14. Consequences

### 14.1 Positive Consequences

- Agentをプロジェクト横断で再利用できる。
- Project ContextがAgent固有の都合で汚染されにくい。
- Phase 2で `projects.yaml` と `agents.yaml` を分けて設計できる。
- Context Pack生成時に、何が役割で何がプロジェクト事実かを明示できる。
- AIの出力品質をAgent定義側で安定させやすい。

### 14.2 Negative Consequences

- 初期設計時にRegistryが2種類必要になる。
- Context Pack BuilderがProjectとAgentの両方を解決する必要がある。
- Agent ContextとProject Contextの責務境界を守らないと、分離の効果が薄れる。

### 14.3 Mitigation

- Phase 2では最小限のAgent候補から開始する。
- `project_code`、`agent_code`、`task_request` を必須入力にする。
- Context PackにSource ListとWarningsを含める。
- Agent ContextにはProject固有のFact / Decision / Taskを持たせない。

---

## 15. Open Issues

| ID | Issue | Handling |
|---|---|---|
| ADR-005-OI-001 | Agent Registryの実ファイル形式をYAMLにするかJSONにするか | Phase 2で決定する |
| ADR-005-OI-002 | Agentごとのtoken budgetをどこで管理するか | Phase 2で決定する |
| ADR-005-OI-003 | `human_approved_write` をどのPhaseで解禁するか | Phase 6以降で再検討する |

---

## 16. Change History

| Version | Date | Status | Change | Author |
|---|---|---|---|---|
| 0.1.0 | 2026-06-05 | draft | 初版ドラフト作成。 | AI draft |
| 1.0.0 | 2026-06-08 | active | P0/P1レビュー指摘を反映し、Agent Contextの非正本性、Recent Conversation Contextの優先順位、Resolution / Rendering / Source Priority分離、初期Agent優先度、write_policy候補を追加してActive化。 | user |
