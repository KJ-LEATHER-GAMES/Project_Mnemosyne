---

title: "Mnemosyne Memory: Active Decisions"
document_id: "docs/projects/mnemosyne/memory/active-decisions.md"
document_role: "project_memory"
memory_type: "active_decisions"
project_code: "mnemosyne"
status: "draft"
version: "0.1.0"
created_at: "2026-06-05"
updated_at: "2026-06-05"
phase: "Phase 1: Memory Foundation"
milestone: "M1-4: Mnemosyne初期記憶作成"
related_documents:

- "docs/projects/mnemosyne/memory/project-summary.md"
- "docs/projects/mnemosyne/memory/current-status.md"
- "docs/projects/mnemosyne/memory/next-actions.md"
- "docs/projects/mnemosyne/memory/ai-entrypoint.md"
- "docs/phases/phase-1-memory-foundation.md"
- "docs/memory/memory-policy.md"
- "docs/memory/memory-taxonomy.md"
- "docs/memory/context-source-priority.md"
- "docs/adr/ADR-001-docs-as-source-of-memory.md"
- "docs/adr/ADR-002-memory-source-of-truth-boundary.md"
- "docs/adr/ADR-003-human-approved-memory-update.md"

---

# Active Decisions

## Decision Register Metadata

| Field                       | Value                                              |
| --------------------------- | -------------------------------------------------- |
| project_code                | `mnemosyne`                                        |
| as_of                       | 2026-06-05                                         |
| decision_owner              | 個人開発者                                              |
| decision_source_root        | `docs/adr/` / `docs/memory/` / `docs/phases/`      |
| conflict_reference_document | `docs/projects/mnemosyne/memory/current-status.md` |

## Active Decisions

| Decision ID | Decision                                                                | Reason / Intent                                            | Applicability Scope    | Related ADR                                                                                            | Source Path                                        | Status | Effective At | Updated At | Supersedes |
| ----------- | ----------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------- | ------ | ------------ | ---------- | ---------- |
| MD-001      | Mnemosyneは複数プロジェクト向けの外部記憶基盤である                                          | ATS専用ではなく、複数プロジェクトの文脈をAIに再利用させるため                          | project                | none                                                                                                   | `docs/phases/phase-1-memory-foundation.md`         | active | 2026-06-05   | 2026-06-05 | none       |
| MD-002      | Phase 1では自動化より先に記憶構造を定義する                                               | RAG / API / MCP / UI / Agent実装へ進む前に、正本構造と運用ルールを固定するため      | phase                  | none                                                                                                   | `docs/phases/phase-1-memory-foundation.md`         | active | 2026-06-05   | 2026-06-05 | none       |
| MD-003      | Markdown docs と ADR を初期の正本とする                                           | Phase 1では人間が読みやすく、Git管理しやすい正本を優先するため                       | phase                  | `docs/adr/ADR-001-docs-as-source-of-memory.md` / `docs/adr/ADR-002-memory-source-of-truth-boundary.md` | `docs/memory/memory-policy.md`                     | active | 2026-06-05   | 2026-06-05 | none       |
| MD-004      | AIは更新草案を作成できるが、正本反映は人間承認後とする                                            | AIによる誤更新、未決定案の確定扱い、正本破壊を防ぐため                               | project                | `docs/adr/ADR-003-human-approved-memory-update.md`                                                     | `docs/memory/memory-policy.md`                     | active | 2026-06-05   | 2026-06-05 | none       |
| MD-005      | 専門Agent定義とProject Contextを分離する                                          | ADR Agent、Docs Agent、Review Agentなどを複数プロジェクトで再利用できるようにするため | project / future_phase | none                                                                                                   | `docs/phases/phase-1-memory-foundation.md`         | active | 2026-06-05   | 2026-06-05 | none       |
| MD-006      | Phase 1の検証対象としてATSを使用する                                                 | テンプレートが抽象論ではなく、実際の複雑なプロジェクトへ適用可能か検証するため                    | phase                  | none                                                                                                   | `docs/phases/phase-1-memory-foundation.md`         | active | 2026-06-05   | 2026-06-05 | none       |
| MD-007      | Context Packは正本ではなく生成物として扱う                                             | AIへ渡す加工済み文脈であり、判断・状態・タスクの正本ではないため                          | project                | `docs/adr/ADR-002-memory-source-of-truth-boundary.md`                                                  | `docs/memory/context-source-priority.md`           | active | 2026-06-05   | 2026-06-05 | none       |
| MD-008      | Conversation Summaryは会話の整理記録であり、単独ではActive Decision / Constraintの根拠にしない | 会話要約には未決定案や仮説が含まれる可能性があるため                                 | project                | `docs/adr/ADR-003-human-approved-memory-update.md`                                                     | `docs/memory/memory-taxonomy.md`                   | active | 2026-06-05   | 2026-06-05 | none       |
| MD-009      | Active正本間の競合Issue一覧はcurrent-status.mdに一本化する                             | active-decisions.mdとの重複管理を避け、競合中scopeを明確に扱うため              | project_memory         | none                                                                                                   | `docs/templates/memory/current-status.template.md` | active | 2026-06-05   | 2026-06-05 | none       |

## Active Constraints

| Constraint ID | Constraint                                                                        | Applicability Scope             | Source Decision / ADR | Source Path                                       | Status | Updated At |
| ------------- | --------------------------------------------------------------------------------- | ------------------------------- | --------------------- | ------------------------------------------------- | ------ | ---------- |
| MNEMO-CON-001 | AIは正本文書へ直接writeしない。新規文書案・修正案・差分案をdraftとして提示する。                                    | all docs / all AI support       | MD-004                | `docs/memory/memory-policy.md`                    | active | 2026-06-05 |
| MNEMO-CON-002 | Phase 1ではRAG / API / MCP / UI / Agent実装を対象外とする。                                   | Phase 1                         | MD-002                | `docs/phases/phase-1-memory-foundation.md`        | active | 2026-06-05 |
| MNEMO-CON-003 | 未決定事項、候補案、未反映Conversation SummaryをActive Decisionとして扱わない。                         | memory operation                | MD-008                | `docs/memory/memory-taxonomy.md`                  | active | 2026-06-05 |
| MNEMO-CON-004 | Context Pack、Search Result Context、AI Draftは生成物であり、正本として扱わない。                     | context generation / AI support | MD-007                | `docs/memory/context-source-priority.md`          | active | 2026-06-05 |
| MNEMO-CON-005 | Active正本間に競合がある場合、Conflict Issueでblocked_scopeを管理し、解消まで確定Contextとして扱わない。          | conflict handling               | MD-009                | `docs/memory/context-source-priority.md`          | active | 2026-06-05 |
| MNEMO-CON-006 | Task本文・完了条件の正本はnext-actions.mdとし、current-status.mdには状態要約のみを記載する。                  | project_memory                  | MD-009                | `docs/templates/memory/next-actions.template.md`  | active | 2026-06-05 |
| MNEMO-CON-007 | Constraint本文の正本はactive-decisions.mdまたは共通Policy / ADRとし、ai-entrypoint.mdでは参照中心にする。 | project_memory / AI entrypoint  | MD-009                | `docs/templates/memory/ai-entrypoint.template.md` | active | 2026-06-05 |

## Superseded Decisions

| Old Decision ID | Old Decision | Replaced By | Replacement Reason | Superseded At | Historical Source Path |
| --------------- | ------------ | ----------- | ------------------ | ------------- | ---------------------- |
| none            | none         | none        | none               | none          | none                   |

## Deprecated Decisions

| Decision ID | Deprecated Decision | Reason Not to Use | Deprecated At | Source Path |
| ----------- | ------------------- | ----------------- | ------------- | ----------- |
| none        | none                | none              | none          | none        |

## Conflict Reference

Active正本間競合が存在する場合、本書へ競合内容を複製しない。

* conflict_reference: `docs/projects/mnemosyne/memory/current-status.md#active-source-conflicts`
* formal_issue_root: `docs/review/context-source-conflicts/`

競合中のscopeはActive Decisions / Active Constraintsへ登録しない。

## References

* `docs/projects/mnemosyne/memory/project-summary.md`
* `docs/projects/mnemosyne/memory/current-status.md`
* `docs/projects/mnemosyne/memory/next-actions.md`
* `docs/memory/memory-policy.md`
* `docs/memory/memory-taxonomy.md`
* `docs/memory/context-source-priority.md`
* `docs/adr/ADR-001-docs-as-source-of-memory.md`
* `docs/adr/ADR-002-memory-source-of-truth-boundary.md`
* `docs/adr/ADR-003-human-approved-memory-update.md`
* `docs/phases/phase-1-memory-foundation.md`

## Change History

| Version | Date       | Status | Change Summary                    | Approved By |
| ------- | ---------- | ------ | --------------------------------- | ----------- |
| 0.1.0   | 2026-06-05 | draft  | M1-4 Mnemosyne初期記憶作成として初版ドラフトを作成。 | pending     |
