---

document_role: "active_decisions"
project_code: "{project_code}"
project_name: "{project_name}"
status: "draft"
version: "0.1.0"
updated_at: "YYYY-MM-DD"
last_reviewed_at: null
applicability_scope: "project"
source_path: "docs/projects/{project_code}/memory/active-decisions.md"
----------------------------------------------------------------------

# Active Decisions

<!--
目的:
- 現在有効なDecisionおよび派生Constraintを、AIが参照しやすい一覧として保持する。
- 古い会話情報、未承認案、置換済み判断を、現行ルールとして誤参照することを防ぐ。

管理値:
- status: draft / active / superseded / deprecated / archived

記載ルール:
- Active Decisionsへ記載できるのは、人間レビューおよび正本反映済みのDecisionのみとする。
- Active Decisions表およびActive Constraints表のStatusは `active` のみを使用する。
- 同一scopeでActive正本間の競合がある場合、競合中の内容を確定情報として記載せず、Open Decision Conflictsへ記録する。
- 判断の詳細理由・比較案・影響は、必要に応じて関連ADRへ記載する。
-->

## Decision Register Metadata

| Field                | Value                                   |
| -------------------- | --------------------------------------- |
| project_code         | `{project_code}`                        |
| as_of                | YYYY-MM-DD                              |
| decision_owner       | {owner_or_team}                         |
| decision_source_root | `{adr_root_or_docs_root}`               |
| conflict_issue_root  | `docs/review/context-source-conflicts/` |

## Active Decisions

| Decision ID          | Decision  | Reason / Intent | Applicability Scope                 | Related ADR          | Source Path     | Status | Effective At | Updated At | Supersedes                  |
| -------------------- | --------- | --------------- | ----------------------------------- | -------------------- | --------------- | ------ | ------------ | ---------- | --------------------------- |
| {project_code}-D-001 | {現在有効な判断} | {判断理由の要約}       | {project / phase / function / task} | `{adr_path_or_none}` | `{source_path}` | active | YYYY-MM-DD   | YYYY-MM-DD | `{old_decision_id_or_none}` |

## Active Constraints

<!-- AIが本プロジェクトを支援する際に必ず守るべきConstraintを記載する。各ConstraintはActiveなDecision、ADRまたは方針文書を根拠とする。 -->

| Constraint ID          | Constraint | Applicability Scope | Source Decision / ADR  | Source Path     | Status | Updated At |
| ---------------------- | ---------- | ------------------- | ---------------------- | --------------- | ------ | ---------- |
| {project_code}-CON-001 | {制約内容}     | {scope}             | `{decision_or_adr_id}` | `{source_path}` | active | YYYY-MM-DD |

## Superseded Decisions

<!-- 置換履歴を保持する。Superseded Decisionを現在有効な指示として使用しない。 -->

| Old Decision ID      | Old Decision | Replaced By            | Replacement Reason | Superseded At | Historical Source Path |
| -------------------- | ------------ | ---------------------- | ------------------ | ------------- | ---------------------- |
| {project_code}-D-000 | {旧判断}        | `{project_code}-D-001` | {置換理由}             | YYYY-MM-DD    | `{source_path}`        |

## Deprecated Decisions

<!-- 特定の置換先を持たず、不採用または非推奨となった判断を記載する。 -->

| Decision ID          | Deprecated Decision | Reason Not to Use | Deprecated At | Source Path     |
| -------------------- | ------------------- | ----------------- | ------------- | --------------- |
| {project_code}-D-XXX | {非推奨となった判断}         | {使用しない理由}         | YYYY-MM-DD    | `{source_path}` |

## Open Decision Conflicts

<!--
本表の競合は、指定したblocked_scopeに限って確定利用を停止する。
競合の正式記録先はConflict Issue文書であり、本表は参照一覧である。
-->

| Conflict Issue ID          | blocked_scope | Conflicting Active Sources  | Temporary Reference Handling       | conflict_status | Issue Path                                                           |
| -------------------------- | ------------- | --------------------------- | ---------------------------------- | --------------- | -------------------------------------------------------------------- |
| {project_code}-CSP-ISS-001 | {影響scope}     | `{source_a}` / `{source_b}` | 確定DecisionまたはConstraintとしてAIへ渡さない。 | open            | `docs/review/context-source-conflicts/{project_code}-CSP-ISS-001.md` |

## Decision Maintenance Rules

| Rule ID  | Rule                                                                                     |
| -------- | ---------------------------------------------------------------------------------------- |
| AD-R-001 | `draft` 情報およびActive正本へ未反映のConversation Summary記載は、Active Decisionとして登録しない。               |
| AD-R-002 | 新しいActive Decisionが旧判断を置換する場合、旧判断をSuperseded Decisionsへ残し、参照元を保持する。                      |
| AD-R-003 | Active ADRとActive運用文書が同一scopeで競合する場合、Conflict Issueを作成または参照し、該当scopeを確定AI Contextから除外する。 |
| AD-R-004 | Conversation Summaryは参照条件を満たす場合に経緯復元へ用いることができるが、Decisionの根拠はActive正本文書またはADRとする。         |

## References

* `docs/projects/{project_code}/memory/project-summary.md`
* `docs/projects/{project_code}/memory/current-status.md`
* `docs/projects/{project_code}/memory/next-actions.md`
* `{related_adr_or_policy_document}`

## Change History

| Version | Date       | Status | Change Summary                 | Approved By |
| ------- | ---------- | ------ | ------------------------------ | ----------- |
| 0.1.0   | YYYY-MM-DD | draft  | テンプレートから初期Active Decisionsを作成。 | -           |
