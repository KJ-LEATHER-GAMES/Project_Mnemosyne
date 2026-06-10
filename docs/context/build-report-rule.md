---
title: "Build Report and Context Preview Rule"
document_id: "docs/context/build-report-rule.md"
document_role: "context_build_report_and_preview_rule"
status: "active"
version: "1.0.0"
created_at: "2026-06-10"
updated_at: "2026-06-11"
phase: "Phase 2: Context Forge"
milestone: "M2-6: Context Preview実装"
owner: "Project Mnemosyne"
review_status: "active"
related_documents:
  - "docs/context/context-pack-structure.md"
  - "docs/context/source-status-policy.md"
  - "docs/templates/context/context-preview.template.md"
  - "docs/templates/context/build-report.template.md"
---

# Build Report and Context Preview Rule

## 1. Status

`active`

本書は、M2-6：Context Preview実装のActive成果物として、Context Pack、Build Report、Context Previewの責務、出力項目、判定規則、追跡規則を定義する。

## 2. Purpose

AIへContext Packを渡す前に、人間が次の事項を確認できるようにする。

- 採用・除外source
- warning / error
- source statusの混在
- Agent要求Contextの充足状況
- source evidence quality
- token budget
- Context Pack / Build Report / Context Preview間のtraceability
- AI投入可否に関する人間レビュー状態

## 3. Artifact Responsibilities

| Artifact | Primary Reader | Responsibility |
|---|---|---|
| Context Pack | AI | 選択された文脈本文を提供する |
| Build Report | 人間・開発者 | 選択、除外、検証、token計算、warning/errorの詳細を記録する |
| Context Preview | 人間 | AI投入前の判断に必要な要点を集約する |

3成果物はいずれも生成物であり、正本ではない。

## 4. Required Outputs

```text
dist/context/{project_code}/{agent_code}/context-pack.md
dist/context/{project_code}/{agent_code}/build-report.md
dist/context/{project_code}/{agent_code}/context-preview.md
```

## 5. Agent Context Coverage

### 5.1 Definition

Agent Context Coverageは、Agent Registryの`required_context` selectorに一致するincluded sourceが存在するかを判定する。

照合対象は次のとおり。

- `source_type`
- `source_group`
- `document_names`
- `paths`

### 5.2 Coverage and Evidence Quality Separation

Context CoverageとEvidence Qualityを混同してはならない。

| Axis | Question |
|---|---|
| Context Coverage | Agentが要求した種類のContextが提供されているか |
| Evidence Quality | 一致sourceを確定根拠として利用できるか |

selectorに一致するdraft sourceが存在する場合、Coverageは`covered`とする。draftであることはWarning、Source Status Mix、Non-Final Evidence Countで別途示す。

### 5.3 Coverage Status

| Status | Meaning |
|---|---|
| `covered` | selectorに一致するincluded sourceが1件以上存在する |
| `missing` | selectorに一致するincluded sourceが存在しない |
| `partial` | 複数必須要素または将来の`min_items`要件の一部のみ満たす場合に使用する。source statusを理由に使用しない |
| `unknown` | Agent Registryの`required_context`がPreview Serviceへ渡されていない |
| `not_applicable` | Agentに`required_context`が定義されていない |

## 6. Source Evidence Quality

次のstatusはnon-final evidenceとして扱う。

- `draft`
- `proposed`
- `archived`
- `deprecated`
- `superseded`
- `unknown`

non-final evidenceを含めてもCoverageは自動的に`partial`へ変更しない。人間レビューを要求し、確定根拠として扱わない。

## 7. Warning Summary

Warning Summaryは最低限次を含む。

| Field | Required |
|---|:---:|
| Code | yes |
| Severity | yes |
| Source ID | yes |
| Path | yes |
| Message | yes |
| Handling | yes |

Handlingは、利用者が次に行うべき確認または修正を示す。

## 8. Token Budget

Token Estimateは次を出力する。

| Field | Description |
|---|---|
| Estimated Input Tokens | source excerpt文字数÷4による概算値 |
| Max Tokens | requestまたはdefaultの全体上限 |
| Reserve Tokens For Response | 応答用に予約するtoken数 |
| Available Input Tokens | `maxTokens - reserveTokensForResponse` |
| Exceeded | estimated inputがavailable inputを超えたか |
| Handling | none / summarized / excluded / failed |
| Approximate | tokenizerによる厳密値でないことを示す |

超過判定は`maxTokens`ではなく`availableInputTokens`に対して行う。

## 9. Traceability

Traceabilityは固定値を出力してはならない。生成時の実データを照合して判定する。

| Check | Rule |
|---|---|
| Source IDs in Context Pack | Build Reportのincluded source IDがContext Pack本文に存在するか |
| Source IDs in Build Report | Preview対象source IDがBuild Report本文に存在するか |
| Warning Codes in Build Report | Preview対象warning codeがBuild Report本文に存在するか |

結果値は`yes`、`no (missing: ...)`、`not_applicable`、`not_verified`のいずれかとする。

## 10. Review Recommendation

判定は次の優先順で行う。

| Recommendation | Condition |
|---|---|
| `blocked_errors_present` | errorが1件以上、またはgeneration resultがfailed |
| `blocked_required_docs_missing` | 標準required memory docsが不足 |
| `review_required_context_missing` | required contextに`missing`または`unknown`が存在 |
| `review_required_warnings_present` | error・required doc不足・context不足はないがwarningが存在 |
| `ready_for_human_review` | 上記に該当しない |

RecommendationはAI投入の自動承認ではない。

## 11. Human Review Decision

生成時の初期値は次とする。

```text
Human Reviewed: no
Approved for AI Input: pending
```

自動生成処理は`Approved for AI Input: yes`を設定してはならない。

## 12. Active Acceptance Criteria

- [x] Context PackとPreviewの責務差分が定義されている。
- [x] Previewにsource list、warnings、token estimate、coverageが含まれる。
- [x] Active / draft / archived等の混在を確認できる。
- [x] Agent要求Contextの充足状況を構造的に確認できる。
- [x] Context CoverageとEvidence Qualityが分離されている。
- [x] response reserveと実効入力budgetが出力される。
- [x] Warning SummaryにHandlingが含まれる。
- [x] Traceabilityが実データ照合で判定される。
- [x] Review Recommendationの値と判定優先順が定義されている。
- [x] Previewは人間承認前に`pending`を維持する。

## 13. Revision History

| Version | Date | Status | Summary |
|---|---|---|---|
| 0.1.0 | 2026-06-10 | draft | M2-6初期ドラフト |
| 1.0.0 | 2026-06-11 | active | M2-6-REV-P0-001およびP1-001〜004を反映 |
