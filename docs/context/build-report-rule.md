---
title: "Build Report and Context Preview Rule"
document_id: "docs/context/build-report-rule.md"
document_role: "context_build_report_rule"
status: "draft"
version: "0.1.0"
created_at: "2026-06-10"
updated_at: "2026-06-10"
phase: "Phase 2: Context Forge"
milestone: "M2-6: Context Preview実装"
owner: "Project Mnemosyne"
review_status: "draft"
related_documents:
  - "docs/context/context-pack-structure.md"
  - "docs/context/source-status-policy.md"
  - "docs/context/context-build-rule.md"
  - "docs/templates/context/context-pack.template.md"
  - "docs/templates/context/context-preview.template.md"
  - "docs/templates/context/build-report.template.md"
  - "src/services/contextPreviewService.ts"
---

# Build Report and Context Preview Rule

## 1. Status

`draft`

本書は、M2-6：Context Preview実装のドラフト成果物である。

---

## 2. Purpose

本書は、Context PackをAIへ投入する前に、人間が確認するための **Context Preview** と、生成過程を追跡する **Build Report** の出力ルールを定義する。

M2-6では、Context Pack本文を直接読まなくても、以下を確認できる状態を目指す。

- どのsourceが含まれ、どのsourceが除外されたか
- active / accepted / draft / proposed / archived / deprecated / superseded / unknown sourceが混在していないか
- Context不足、競合候補、token budget超過がないか
- Agent要求Contextが満たされているか
- Context Pack本文とBuild Reportの対応を追跡できるか

---

## 3. Scope

### 3.1 In Scope

- Context PackとPreviewの差分定義
- Build Reportの詳細出力ルール
- Context Previewの人間確認用出力ルール
- source list / warnings / token estimate / coverageの表示ルール
- source status混在状況の表示ルール
- Agent要求Contextの充足状況の表示ルール
- Context Pack本文とBuild Reportのtrace rule
- `dist/context/{project_code}/{agent_code}/context-preview.md` の出力ルール

### 3.2 Out of Scope

- Context Pack本文の章構成変更
- Agent Registry自体のschema変更
- Semantic conflict detectionの完全実装
- tokenizerベースの厳密なtoken count
- GUI Preview
- RAG検索結果Preview

---

## 4. Artifact Relationship

M2-6の生成物は以下の関係とする。

| Artifact | Primary Reader | Purpose | Source of Truth |
|---|---|---|---|
| Context Pack | AI | AI投入用の本文Context | no |
| Build Report | human / tool | 生成過程、検証結果、採用・除外理由の詳細 | no |
| Context Preview | human | AI投入前の確認用サマリー | no |

Context Previewは、Context Packの短縮版ではない。  
Context Previewは、**AIに渡す内容そのものではなく、AIへ渡す前に人間が確認すべきリスク・充足状況・trace情報をまとめた確認用成果物**である。

---

## 5. Context Pack and Preview Difference

| Item | Context Pack | Context Preview |
|---|---|---|
| Main purpose | AIへ渡す作業文脈 | 人間が投入前に確認する |
| Includes source excerpts | yes | no, 原則summaryのみ |
| Includes full task context | yes | summary only |
| Includes warnings | yes | yes, emphasized |
| Includes source list | yes | yes, compact plus status summary |
| Includes token estimate | summary only | yes, review-focused |
| Includes coverage | optional summary | required |
| Includes agent required context satisfaction | usually implicit | required |
| Use as AI input | yes | no |
| Use as source of truth | no | no |

---

## 6. Required Build Report Sections

Build Reportは以下の章を持つ。

```md
# Context Build Report

## 1. Build Result
## 2. Request Summary
## 3. Output Artifacts
## 4. Required Docs Check
## 5. Agent Context Coverage
## 6. Source Coverage
## 7. Source Status Distribution
## 8. Warnings
## 9. Errors
## 10. Included Sources
## 11. Excluded Sources
## 12. Token Estimate
## 13. Context Pack Trace
## 14. Unsupported / Placeholder Features
```

---

## 7. Required Context Preview Sections

Context Previewは以下の章を持つ。

```md
# Context Preview

## 1. Preview Summary
## 2. Human Review Checklist
## 3. Build Result
## 4. Output Artifacts
## 5. Warning Summary
## 6. Source Status Mix
## 7. Agent Context Coverage
## 8. Source Coverage
## 9. Token Estimate
## 10. Context Pack and Build Report Trace
## 11. Included Source List
## 12. Excluded Source List
## 13. Review Decision
```

---

## 8. Warning Rules

Context Preview must surface the same warning codes as Context Pack / Build Report.

| Warning Code | Preview Handling |
|---|---|
| `missing_required_doc` | P0 risk. Show in Warning Summary and Agent Context Coverage if relevant. |
| `draft_source_included` | Show in Source Status Mix and Included Source List. |
| `proposed_source_included` | Show in Source Status Mix and Included Source List. |
| `archived_source_included` | Show in Source Status Mix and Included Source List. |
| `deprecated_source_included` | Show in Source Status Mix and Included Source List. |
| `superseded_source_included` | Show in Source Status Mix and Included Source List. |
| `unknown_status` | Show as P0/P1 review risk depending on source role. |
| `conflict_detected` | Show in Warning Summary. Human review required. |
| `adr_conflict_detected` | Show as P0 risk. Human review required. |
| `recent_context_conflict` | Show in Warning Summary. Active source takes precedence. |
| `source_excluded` | Show in Excluded Source List. |
| `token_budget_exceeded` | Show in Token Estimate and Review Checklist. |

---

## 9. Agent Context Coverage Rule

Agent Context Coverage verifies whether the Context Pack satisfies the agent's requested context.

### 9.1 Coverage Status

| Status | Meaning |
|---|---|
| `covered` | At least one included source satisfies the required context item. |
| `partial` | Source exists but is summarized, warning-only, reference-only, or weakly matched. |
| `missing` | No included source satisfies the required context item. |
| `not_applicable` | The required item is not applicable to this build request. |
| `unknown` | Coverage cannot be determined by the current builder. |

### 9.2 Coverage Matching Inputs

Coverage may be calculated from the following fields.

- Agent Registry `required_context`
- Agent Registry `optional_context`
- Context source `includedSection`
- Context source `matchedBy`
- Context source `inclusionReason`
- Context source `sourceType`
- Task Request
- Additional Sources

### 9.3 Initial Implementation Rule

M2-6 initial implementation may use deterministic structural matching only.

Semantic coverage scoring is not required in M2-6.

---

## 10. Source Coverage Rule

Source Coverage summarizes the selected and excluded source population.

| Metric | Description |
|---|---|
| `included_source_count` | Count of sources included in Context Pack. |
| `excluded_source_count` | Count of sources excluded by policy, missing path, or token budget. |
| `warning_source_count` | Count of included sources with warning handling. |
| `required_doc_count` | Count of required memory docs declared. |
| `missing_required_doc_count` | Count of required memory docs missing. |
| `active_or_accepted_count` | Count of sources that can be treated as normal evidence. |
| `non_final_evidence_count` | Count of draft/proposed/archived/deprecated/superseded/unknown sources. |

---

## 11. Source Status Mix Rule

Context Preview must show source status distribution.

Minimum output fields:

| Status | Included Count | Excluded Count | Review Note |
|---|---:|---:|---|
| active |  |  |  |
| accepted |  |  |  |
| draft |  |  |  |
| proposed |  |  |  |
| archived |  |  |  |
| deprecated |  |  |  |
| superseded |  |  |  |
| unknown |  |  |  |

If any non-final evidence source is included, Context Preview must show:

```text
Human review required before treating this Context Pack as safe for AI input.
```

---

## 12. Token Estimate Rule

M2-6 token estimate may use the M2-5 approximate method.

```text
estimatedInputTokens = ceil(totalIncludedSourceExcerptCharacters / 4)
```

The Preview must explicitly label this as approximate.

| Field | Required | Note |
|---|:---:|---|
| estimated_input_tokens | yes | approximate allowed |
| max_tokens | yes | from request or default |
| reserve_tokens_for_response | recommended | if available |
| exceeded | yes | true / false |
| handling | yes | none / summarized / excluded / failed |
| note | yes | calculation note |

---

## 13. Trace Rule

Context Preview must allow human reviewers to trace Context Pack and Build Report correspondence.

Required trace fields:

| Field | Description |
|---|---|
| `context_pack_path` | Generated Context Pack path. |
| `build_report_path` | Generated Build Report path. |
| `context_preview_path` | Generated Context Preview path. |
| `source_id` | Shared source ID in Context Pack and Build Report. |
| `included_section` | Context Pack section where source was inserted. |
| `warning_code` | Shared warning code when applicable. |
| `generation_result` | success / warning / failed. |

---

## 14. Output Path Rule

M2-6 output paths are:

```text
dist/context/{project_code}/{agent_code}/context-pack.md
dist/context/{project_code}/{agent_code}/build-report.md
dist/context/{project_code}/{agent_code}/context-preview.md
```

Timestamped filenames may be introduced later, but M2-6 draft keeps the M2-5 fixed filename style for continuity.

---

## 15. Review Decision Rule

Context Preview ends with a human review decision block.

```md
## 13. Review Decision

| Item | Value |
|---|---|
| Human Reviewed | no |
| Approved for AI Input | pending |
| Reviewer |  |
| Reviewed At |  |
| Notes |  |
```

Context Preview must not mark itself as approved automatically.

---

## 16. Draft Definition of Done

M2-6 draft is complete when:

- [ ] Context PackとPreviewの差分が定義されている。
- [ ] Previewにsource list、warnings、token estimate、coverageが含まれる。
- [ ] Active / draft / archived sourceの混在状況を確認できる。
- [ ] Agent要求Contextの充足状況を確認できる。
- [ ] Context Pack本文とBuild Reportの対応をtraceできる。
- [ ] Context不足や競合候補がwarningとして確認できる。
- [ ] `contextPreviewService.ts` がPreview Markdownを生成できる。
- [ ] `dist/context/{project_code}/{agent_code}/context-preview.md` が出力される。

---

## 17. Review Notes for Active化

Active化前に確認すべき論点:

| ID | Topic | Draft Position |
|---|---|---|
| M2-6-REV-CAND-001 | Template配置 | M2-1に合わせ、正式配置は `docs/templates/context/` とする。 |
| M2-6-REV-CAND-002 | Coverage算出 | M2-6では構造的matchingのみ。semantic判定はPhase 3以降。 |
| M2-6-REV-CAND-003 | Token estimate | M2-5のchar/4近似を継続。厳密tokenizerは対象外。 |
| M2-6-REV-CAND-004 | Preview承認欄 | 自動承認しない。人間review用の空欄を出す。 |
| M2-6-REV-CAND-005 | Build Reportとの重複 | Build Reportは詳細、Previewは判断用サマリーに分離する。 |
