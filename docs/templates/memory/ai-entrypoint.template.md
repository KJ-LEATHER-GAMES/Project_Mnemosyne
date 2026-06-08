---

document_role: "ai_entrypoint"
project_code: "{project_code}"
project_name: "{project_name}"
status: "draft"
version: "0.1.0"
updated_at: "YYYY-MM-DD"
last_reviewed_at: null
applicability_scope: "project"
source_path: "docs/projects/{project_code}/memory/ai-entrypoint.md"
-------------------------------------------------------------------

# AI Entrypoint

<!--
目的:
- AIが対象プロジェクトを支援するときに、最初に参照する入口文書とする。
- 読み始めるべき正本、参照条件、制約、draft作成ルールおよび誤解リスクを示す。
- 本書自体はContext Packではなく、Contextを組み立てるための参照ルート定義である。

管理値:
- status: draft / active / superseded / deprecated / archived

記載ルール:
- AIは原則として、`active` なProject Memory文書およびADRを根拠として作業する。
- Conversation Summaryは所定の `review_status` を満たす場合のみ補助参照する。
- Conflict Issueが存在するscopeは、解消まで確定DecisionまたはConstraintとして扱わない。
- AIはdraft作成まで実施できるが、正本のwriteまたはdeleteは行わない。
-->

## Entrypoint Metadata

| Field            | Value                                               |
| ---------------- | --------------------------------------------------- |
| project_code     | `{project_code}`                                    |
| project_status   | {planning / active / paused / completed / archived} |
| current_phase    | {phase_or_milestone}                                |
| entrypoint_owner | {owner_or_team}                                     |
| as_of            | YYYY-MM-DD                                          |
| last_reviewed_at | YYYY-MM-DD                                          |
| memory_root      | `docs/projects/{project_code}/memory/`              |

## What This Project Is

<!-- AIが初回読込で把握すべき最小限のプロジェクト説明を記載する。詳細はproject-summary.mdへ委ねる。 -->

{プロジェクトの目的、対象、および現在の支援対象を2〜4文で記載する。}

## What the AI Should Read First

<!--
下記4文書はProject Contextの基本読込対象である。
各文書について、`status: active` の最新版を参照する。
-->

1. `docs/projects/{project_code}/memory/project-summary.md`

   * プロジェクトの目的、安定した前提、スコープおよび正本境界を把握する。
2. `docs/projects/{project_code}/memory/current-status.md`

   * 現在地、進行中事項、Issue、Pending Decisionおよび競合参照を把握する。
3. `docs/projects/{project_code}/memory/active-decisions.md`

   * 現在有効なDecision、Constraint、置換履歴および競合scopeを確認する。
4. `docs/projects/{project_code}/memory/next-actions.md`

   * 実施対象Task、優先度、成果物、完了条件および `task_status` を確認する。

## Conditional Reading Routes

<!-- 今回のTaskまたは確認目的に応じて追加参照する正本・補助文書を定義する。 -->

| Task / Question Type | Additional Sources to Read                  | Purpose                      | Reference Condition                               |
| -------------------- | ------------------------------------------- | ---------------------------- | ------------------------------------------------- |
| 重要判断の理由確認            | `{adr_root}/ADR-*.md`                       | Decisionの理由、代替案、影響を確認する      | Active ADRを優先し、競合時はIssue化する。                      |
| Phase成果物または完了条件の確認   | `docs/phases/{phase_document}.md`           | PhaseスコープとDoDを確認する           | ActiveなPhase文書を参照する。                              |
| 会話経緯または未反映候補の確認      | `{conversation_summary_root}/*.md`          | 経緯復元と更新候補抽出を補助する             | `review_status: reviewed` または `reflected` のみ参照可能。 |
| 競合・不整合の確認            | `docs/review/context-source-conflicts/*.md` | 競合論点、blocked_scope、修正状況を確認する | Issue自体をDecisionの代替正本として扱わない。                     |
| 検証結果の確認              | `{test_result_or_review_root}/*.md`         | 実施済み確認と判定根拠を把握する             | reviewedまたはActiveな記録を使用する。                        |

## Important Constraints

| Constraint ID             | Constraint                                              | Authoritative Source             | AI Handling                       |
| ------------------------- | ------------------------------------------------------- | -------------------------------- | --------------------------------- |
| {project_code}-AI-CON-001 | AIは正本文書へ直接writeしない。                                     | `{policy_or_adr_path}`           | 修正案または新規文書案をdraftとして提示する。         |
| {project_code}-AI-CON-002 | 未確定事項および未反映Conversation SummaryをActive Decisionとして扱わない。 | `{taxonomy_or_policy_path}`      | 候補、Issue、Pending Decisionとして区別する。 |
| {project_code}-AI-CON-003 | Active正本間競合の `blocked_scope` は確定Contextへ含めない。           | `{context_source_priority_path}` | WarningまたはOpen Issueとして明示する。      |

## Available Document Sources

| Source Category         | Path / Pattern                                            | Role                       | Normal Use    | Do Not Treat As                   |
| ----------------------- | --------------------------------------------------------- | -------------------------- | ------------- | --------------------------------- |
| Project Summary         | `docs/projects/{project_code}/memory/project-summary.md`  | 目的・安定情報の正本                 | 基本読込          | 進捗Taskの正本                         |
| Current Status          | `docs/projects/{project_code}/memory/current-status.md`   | 現在地・Issue参照の正本             | 基本読込          | Decision理由の詳細正本                   |
| Active Decisions        | `docs/projects/{project_code}/memory/active-decisions.md` | 現行Decision / Constraintの正本 | 基本読込          | 未決定案の保存先                          |
| Next Actions            | `docs/projects/{project_code}/memory/next-actions.md`     | Taskの正本                    | 基本読込          | Idea一覧の正本                         |
| ADR                     | `{adr_root}/ADR-*.md`                                     | 重要判断の理由・影響の正本              | 判断根拠確認時       | 単なる進捗記録                           |
| Conversation Summary    | `{conversation_summary_root}/*.md`                        | 会話経緯と抽出候補の整理記録             | 条件付き補助参照      | Active Decision / Constraintの単独根拠 |
| Conflict Issue          | `docs/review/context-source-conflicts/*.md`               | 競合検知・解消確認記録                | 競合確認時         | 競合論点の代替正本                         |
| Context Pack / AI Draft | `{generated_output_path}`                                 | 生成物                        | 作業入力またはレビュー対象 | 正本                                |

## Rules for Drafting Changes

### Permitted AI Actions

| Action                             | Permission  | Required Handling        |
| ---------------------------------- | ----------- | ------------------------ |
| Read active source documents       | Allowed     | 出典とstatusを確認して使用する。      |
| Summarize or compare information   | Allowed     | 確定事項と候補・競合を分離する。         |
| Create new document drafts         | Allowed     | `status: draft` として提示する。 |
| Create revision proposals / diffs  | Allowed     | 反映先正本と修正理由を示す。           |
| Write to active source documents   | Not allowed | 人間の承認・反映を必要とする。          |
| Delete source documents or history | Not allowed | 廃止時もstatusまたは履歴管理を前提とする。 |

### Drafting Procedure

1. 本書の基本読込対象と、今回のTaskに必要な追加sourceを確認する。
2. `status`、`task_status`、`review_status`、Conflict Issueの有無を区別して読む。
3. 根拠となるActive正本またはADRを明示して、draftまたは修正案を作成する。
4. 競合または未確定論点がある場合は、確定内容へ混在させずWarning、Issue、Pending Decisionとして分離する。
5. 正本へ反映すべき内容は、反映候補の文書と対象セクションを示し、人間レビューに渡す。

### Required Draft Markers

| Marker          | Required When              | Meaning          |
| --------------- | -------------------------- | ---------------- |
| `status: draft` | 新規文書案を作成する場合               | 正本反映前の案であることを示す。 |
| `source_path`   | 根拠文書または反映対象がある場合           | 根拠追跡を可能にする。      |
| `related_adr`   | DecisionまたはConstraintを扱う場合 | 判断理由の参照先を示す。     |
| `blocked_scope` | Active正本間競合がある場合           | 確定利用を停止する範囲を示す。  |

## Conflict and Freshness Handling

| Condition                                        | AI Treatment                              |
| ------------------------------------------------ | ----------------------------------------- |
| `status: active` の正本で競合がない                       | 通常の根拠として参照する。                             |
| `status: draft` の情報                              | 検討案としてのみ扱い、確定事項として使用しない。                  |
| `status: superseded` または `deprecated`            | 履歴確認が必要な場合のみ参照し、現行判断として扱わない。              |
| `review_status: reviewed` のConversation Summary  | 会話経緯および更新候補抽出の補助に限り参照する。                  |
| `review_status: reflected` のConversation Summary | 文脈復元に参照できるが、Decision根拠は反映先正本を使う。          |
| Active正本間の競合Issueがopen                           | `blocked_scope` を確定情報から除外し、Warningとして伝える。 |
| Context PackまたはAI DraftがActive正本と不一致             | 生成物を正として扱わず、再生成または修正候補とする。                |

## Known Risks of Misinterpretation

| Risk ID                 | Risk                       | Detection Cue                            | Required Prevention                   |
| ----------------------- | -------------------------- | ---------------------------------------- | ------------------------------------- |
| {project_code}-RISK-001 | 古い会話上の方針を現行Decisionと誤認する。  | Conversation Summaryのみが根拠になっている。         | active-decisions.md またはADRで反映有無を確認する。 |
| {project_code}-RISK-002 | Task進捗と文書statusを混同する。      | Taskへ `status: done` のみが付与されている。         | `task_status` を参照して進捗を判定する。           |
| {project_code}-RISK-003 | 競合中のDecisionを確定ルールとして利用する。 | Conflict Issueまたは `blocked_scope` が存在する。 | 該当scopeを確定Contextから除外する。              |
| {project_code}-RISK-004 | 生成物を正本として参照する。             | Context PackやAI Draftのみが根拠になっている。        | 参照元のActive正本へ遡る。                      |

## Context Builder / Recall Handover Notes

<!-- Phase 2以降の機械読込およびPhase 3の検索補完で使用する入口情報を記載する。 -->

| Item                            | Definition                                                                          |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| base_project_context            | `project-summary.md`, `current-status.md`, `active-decisions.md`, `next-actions.md` |
| conditional_context             | ADR、reviewed / reflected Conversation Summary、Review / Test Result、Conflict Issue   |
| excluded_as_confirmed_context   | draft、未レビューConversation Summary、競合中Decision / Constraint、生成物のみを根拠とする情報              |
| source_traceability_requirement | AI出力では、根拠となる文書パスまたは参照先を提示する。                                                        |

## References

* `docs/projects/{project_code}/memory/project-summary.md`
* `docs/projects/{project_code}/memory/current-status.md`
* `docs/projects/{project_code}/memory/active-decisions.md`
* `docs/projects/{project_code}/memory/next-actions.md`
* `{memory_policy_path}`
* `{memory_taxonomy_path}`
* `{context_source_priority_path}`

## Change History

| Version | Date       | Status | Change Summary              | Approved By |
| ------- | ---------- | ------ | --------------------------- | ----------- |
| 0.1.0   | YYYY-MM-DD | draft  | テンプレートから初期AI Entrypointを作成。 | -           |
