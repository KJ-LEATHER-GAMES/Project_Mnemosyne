---
title: "ADR-005: Agent and Project Context Separation"
document_id: "docs/adr/ADR-005-agent-context-separation.md"
adr_id: "ADR-005"
status: "draft"
version: "0.1.0"
created_at: "2026-06-05"
updated_at: "2026-06-05"
approved_at: null
phase: "Phase 1: Memory Foundation"
milestone: "M1-6: Agent接続方針整理"
decision_scope: "Agent Context Architecture"
related_documents:
  - "docs/phases/phase-1-memory-foundation.md"
  - "docs/phases/phase-2-input-requirements.md"
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

`draft`

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

### 3.1 定義

| Layer | Meaning | Examples | Source in Phase 2 |
|---|---|---|---|
| Base Context | Mnemosyne共通の記憶運用ルール | 正本/副本、AI draft only、状態管理、参照優先順位 | common docs / memory policy |
| Agent Context | Agentの役割、責務、入力、出力、禁止事項 | ADR整理Agent、実装レビューAgent、要件定義Agent | `agents.yaml` |
| Project Context | 対象プロジェクトの概要、状態、判断、Task | Mnemosyne、ATS、TapLog等 | `projects.yaml` + memory docs |
| Task Context | 今回の依頼内容、作業範囲、追加入力 | 「ADR-006を作る」「UseCaseをレビューする」 | user prompt / task file |
| Recent Conversation Context | 直近会話の要約、未反映の補足 | 会話中の最新指示、レビュー結果 | conversation summary / chat |
| Output Contract | 成果物の形式と完了条件 | ADR、レビュー表、Context Pack、記事草案 | agent definition + task |

### 3.2 Agentはプロジェクト固有情報を持たない

Agent定義には、特定プロジェクトのFact、Decision、Taskを直接埋め込まない。

Agent定義に持たせるものは以下に限定する。

- Agentの目的
- 入力として必要なContext種別
- 参照すべき文書種別
- 出力形式
- 禁止事項
- 判断時の確認観点
- write policy

### 3.3 Project ContextはAgentから独立して選択する

Project Contextは、`project_code` によって選択する。

例：

```text
project_code: ats
memory_root: docs/projects/ats/memory
```

Agentは `project_code` を直接解釈するのではなく、Project Registryによって解決されたContextを受け取る。

### 3.4 Task Contextで組み合わせを確定する

実際のAI支援では、以下の3要素を明示的に組み合わせる。

```text
agent_code + project_code + task_request
```

例：

```yaml
agent_code: adr_writer
project_code: mnemosyne
task_request: "M1-6のAgent接続方針をADR化する"
```

Context Builderは、この組み合わせから必要な文書を集約する。

---

## 4. Agent Types and Required Context

Phase 1時点では、Agent実装ではなく、Agent利用マッピングのみ定義する。

| Agent Code | Agent Name | Required Context | Optional Context | Output Type | Primary Use |
|---|---|---|---|---|---|
| `adr_writer` | ADR整理Agent | `project-summary` / `active-decisions` / related ADR | `current-status` / related docs | ADR draft | 設計判断のADR草案作成 |
| `implementation_reviewer` | 実装レビューAgent | `project-summary` / `current-status` / `active-decisions` | architecture / source / test docs | review report | 実装・UseCase・境界設計レビュー |
| `requirements_writer` | 要件定義Agent | `project-summary` / `current-status` / `next-actions` | issues / ideas / prior requirements | requirement draft | 要件定義書・Phase要件整理 |
| `task_planner` | タスク分解Agent | `current-status` / `next-actions` / `active-decisions` | roadmap / review docs | task list | 作業分解・優先度整理 |
| `article_writer` | 記事化Agent | `project-summary` / conversation summaries | decisions / development logs | article draft | note記事・開発日記草案 |

---

## 5. Context Composition Policy

### 5.1 基本構成

Context Packは、以下の順序で構成する。

```text
1. Base Context
2. Agent Context
3. Project Context
4. Task Context
5. Recent Conversation Context
6. Output Contract
```

### 5.2 読み込み優先順位

Project Context内では、以下の読み込み順序を基本とする。

```text
1. ai-entrypoint.md
2. project-summary.md
3. current-status.md
4. active-decisions.md
5. next-actions.md
6. related ADR
7. task-specific optional sources
8. conversation-summary
```

`ai-entrypoint.md` は入口であり、Decision / Task / Issueの正本ではない。

### 5.3 Context不足時の扱い

Agentが必要とするContextが不足している場合、AIは不足を明示し、推測で補完しない。

| Situation | Required Behavior |
|---|---|
| 必須文書が存在しない | Context不足として報告する |
| optional sourceが未登録 | 追加確認候補として提示する |
| activeな判断が見つからない | 未決定として扱う |
| active正本間に競合がある | Conflict Issueとして扱い、確定判断に使わない |
| Conversation Summaryにしかない情報 | 未反映の一次整理情報として扱う |

---

## 6. Rationale

### 6.1 Agentの再利用性を高める

Agentをプロジェクト非依存にすることで、同じADR整理AgentをMnemosyne、ATS、TapLog等へ適用できる。

### 6.2 Context Pack Builderを設計しやすくする

`agent_code` と `project_code` を分ければ、Phase 2で以下のようにContext生成を設計できる。

```text
context:build --project ats --agent implementation_reviewer --task usecase-review
```

この構造により、Context BuilderはAgent要件とProject文書を別々に解決できる。

### 6.3 プロジェクト記憶の汚染を防ぐ

Agentの出力形式や振る舞いをProject文書へ埋め込むと、Project Contextが特定Agentの都合に引きずられる。

Project Contextは「何についての情報か」を記録し、Agent Contextは「どう処理するか」を記録する。

### 6.4 AIの誤読を減らす

AgentとProjectを分離することで、AIに渡すContext Pack上でも、以下を明示できる。

```text
Role: 実装レビューAgent
Target Project: ATS
Task: action_select UseCaseの責務分離レビュー
Allowed Output: review report only
Write Policy: draft only
```

---

## 7. Alternatives Considered

### 7.1 プロジェクトごとに専用Agentを作る

**却下。** 初期導入は簡単だが、プロジェクトが増えるほどAgent定義が増殖し、役割変更時に全Agentを修正する必要がある。

### 7.2 Agent定義にProject Contextを埋め込む

**却下。** Agentの再利用性が失われ、古いProject情報がAgent定義内に残る危険がある。

### 7.3 Project Contextだけを渡し、Agent定義を作らない

**却下。** AIの役割・出力形式・禁止事項が毎回のプロンプト依存になり、品質が安定しない。

### 7.4 Agent RegistryをPhase 1で実装する

**却下。** Phase 1では実装を行わず、Phase 2に必要な入力要件整理までに留める。

---

## 8. Consequences

### 8.1 Positive Consequences

- Agent定義を複数プロジェクトで再利用できる。
- Project Contextを差し替えるだけで同じAgentを使える。
- Context Builderの入力設計が明確になる。
- Agentの振る舞いとProjectの事実情報を分離できる。
- 将来のMCP / API / UI化で責務境界を維持しやすい。

### 8.2 Negative Consequences

- 初期設計では `agents.yaml` と `projects.yaml` の2系統を扱う必要がある。
- Task Contextの設計が曖昧だと、AgentとProjectを分離しても実行時の入力がぶれる。
- Agent別のContext要件を過剰に細かくすると、運用負荷が増える。

### 8.3 Mitigation

- Phase 2では最小限のAgentから開始する。
- 初期Agentは `adr_writer`、`implementation_reviewer`、`requirements_writer` 程度に絞る。
- `context_requirements` は必須文書と任意文書を分離する。
- Context Pack Previewで、実際にAIへ渡す情報を人間が確認できるようにする。

---

## 9. Phase 2 Design Inputs

### 9.1 `agents.yaml` candidate fields

```yaml
agents:
  - agent_code: adr_writer
    agent_name: "ADR整理Agent"
    purpose: "設計判断をADR形式で整理する"
    required_context:
      memory_types:
        - project_summary
        - active_decisions
      document_patterns:
        - "docs/adr/*.md"
    optional_context:
      memory_types:
        - current_status
      document_patterns:
        - "docs/**/*.md"
    output_type: "adr_draft"
    write_policy: "draft_only"
    prohibited_actions:
      - "正本へ直接writeしない"
      - "未承認Decisionをactiveとして扱わない"
```

### 9.2 `projects.yaml` candidate fields

```yaml
projects:
  - project_code: ats
    project_name: "Adventure Token System"
    memory_root: "docs/projects/ats/memory"
    required_memory_docs:
      - "project-summary.md"
      - "current-status.md"
      - "active-decisions.md"
      - "next-actions.md"
      - "ai-entrypoint.md"
    optional_sources:
      - source_code_root: "src"
      - docs_root: "docs"
      - test_result_root: "docs/test-results"
```

### 9.3 Context Build Input candidate

```yaml
context_build_request:
  project_code: ats
  agent_code: implementation_reviewer
  task_context:
    title: "action_select UseCase設計レビュー"
    request: "責務分離・トランザクション境界・冪等性の観点でレビューする"
    output_type: "review_report"
```

---

## 10. Open Issues

| Issue ID | Issue | Owner | Target Phase | Status |
|---|---|---|---|---|
| ADR-005-OI-001 | 初期Agentを何種類に絞るか | user | Phase 2 | open |
| ADR-005-OI-002 | Agent ContextをMarkdownで管理するかYAMLで管理するか | user | Phase 2 | open |
| ADR-005-OI-003 | Task ContextをCLI引数、Markdown task file、または対話入力のどれで渡すか | user | Phase 2 | open |
| ADR-005-OI-004 | Recent Conversation ContextをどのタイミングでContext Packへ含めるか | user | Phase 2 | open |

---

## 11. References

- `docs/phases/phase-1-memory-foundation.md`
- `docs/phases/phase-2-input-requirements.md`
- `docs/adr/ADR-004-project-independent-memory-template.md`
- `docs/projects/mnemosyne/memory/active-decisions.md`
- `docs/projects/mnemosyne/memory/ai-entrypoint.md`
- `docs/projects/ats/memory/ai-entrypoint.md`
- `docs/review/phase-1-ats-template-validation.md`

---

## 12. Change History

| Version | Date | Status | Change Summary | Approved By |
|---|---|---|---|---|
| 0.1.0 | 2026-06-05 | draft | M1-6 Agent接続方針整理として初版ドラフトを作成。 | pending |
