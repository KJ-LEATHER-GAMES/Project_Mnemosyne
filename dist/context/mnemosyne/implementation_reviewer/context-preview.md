# Context Preview

> This Context Preview is a generated human-review artifact.
> It is not the source of truth.
> It is not intended to be used as the AI input body.
> Review the warnings, source status mix, coverage, and trace information before using the Context Pack.

---

## 1. Preview Summary

| Item | Value |
| --- | --- |
| Generated At | 2026-06-10T20:39:43.409Z |
| Project Code | mnemosyne |
| Project Name | Project Mnemosyne |
| Agent Code | implementation_reviewer |
| Agent Name | 実装レビューAgent |
| Task Request | M2-6 context preview integration check |
| Output Type | implementation_review_report |
| Build Mode | standard |
| Generation Result | warning |
| Review Recommendation | review_required_warnings_present |

---

## 2. Human Review Checklist

| Check | Status | Note |
| --- | --- | --- |
| No build errors | ok | 0 error(s) |
| Required memory docs exist | ok | 0 missing required doc(s) |
| Agent required context is covered | review | 1 incomplete required context item(s) |
| No conflict warnings | ok | 0 conflict warning(s) |
| Non-final evidence is acceptable | review | 1 non-final evidence source(s) included |
| Token estimate is within budget | ok | estimated=9632, max=24000 |
| Context Pack and Build Report paths are traceable | ok | source_id and warning code are shared |

---

## 3. Build Result

| Item | Value |
| --- | --- |
| OK | true |
| Warning Count | 1 |
| Error Count | 0 |
| Conflict Count | 0 |
| Missing Required Source Count | 0 |

---

## 4. Output Artifacts

| Artifact | Path |
| --- | --- |
| Context Pack | dist\context\mnemosyne\implementation_reviewer\context-pack.md |
| Build Report | dist\context\mnemosyne\implementation_reviewer\build-report.md |
| Context Preview | dist\context\mnemosyne\implementation_reviewer\context-preview.md |

---

## 5. Warning Summary

| Code | Severity | Source ID | Path | Message |
| --- | --- | --- | --- | --- |
| draft_source_included | warning | src-008-build-report-rule-md | docs/context/build-report-rule.md | Non-active source included with warning: docs/context/build-report-rule.md status=draft |

---

## 6. Source Status Mix

| Status | Included Count | Excluded Count | Review Note |
| --- | --- | --- | --- |
| active | 7 | 0 | normal evidence |
| accepted | 0 | 0 | none included |
| draft | 1 | 0 | human review required; do not treat as final evidence |
| proposed | 0 | 0 | none included |
| archived | 0 | 0 | none included |
| deprecated | 0 | 0 | none included |
| superseded | 0 | 0 | none included |
| unknown | 0 | 0 | none included |

---

## 7. Agent Context Coverage

| Required Context | Coverage Status | Matched Sources | Note |
| --- | --- | --- | --- |
| active_decisions | covered | src-001-active-decisions-md | Matched by Agent Registry requirement selectors. Selectors: source_type=memory_doc; document_names=active-decisions.md. Purpose: 実装が従うべき設計判断と制約を確認する |
| project_summary | covered | src-002-project-summary-md | Matched by Agent Registry requirement selectors. Selectors: source_type=memory_doc; document_names=project-summary.md. Purpose: 対象Projectの目的と主要構成を把握する |
| task_additional_sources | partial | src-008-build-report-rule-md | Matched, but at least one source is warning/reference/summarized or non-final evidence. Selectors: source_type=additional_source. Purpose: ユーザーが明示したコード、ログ、設計文書をレビュー対象として扱う |

---

## 8. Source Coverage

| Item | Value |
| --- | --- |
| Included Source Count | 8 |
| Excluded Source Count | 0 |
| Warning Source Count | 1 |
| Required Doc Count | 5 |
| Missing Required Doc Count | 0 |
| Active or Accepted Source Count | 7 |
| Non-Final Evidence Source Count | 1 |

---

## 9. Token Estimate

| Item | Value |
| --- | --- |
| Estimated Input Tokens | 9632 |
| Max Tokens | 24000 |
| Reserve Tokens For Response | not available in ContextBuildReport |
| Exceeded | false |
| Handling | none |
| Approximate | true |
| Note | Approximate estimate using source excerpt character count / 4. Not tokenizer-based. |

---

## 10. Context Pack and Build Report Trace

| Trace Item | Value |
| --- | --- |
| Context Pack Path | dist\context\mnemosyne\implementation_reviewer\context-pack.md |
| Build Report Path | dist\context\mnemosyne\implementation_reviewer\build-report.md |
| Context Preview Path | dist\context\mnemosyne\implementation_reviewer\context-preview.md |
| Source ID Shared With Context Pack | yes |
| Source ID Shared With Build Report | yes |
| Warning Code Shared With Build Report | yes |

---

## 11. Included Source List

| Source ID | Path | Status | Source Type | Included Section | Handling | Purpose |
| --- | --- | --- | --- | --- | --- | --- |
| src-001-active-decisions-md | docs/projects/mnemosyne/memory/active-decisions.md | active | memory_doc | 6. Active Decisions | include | 実装が従うべき設計判断と制約を確認する |
| src-002-project-summary-md | docs/projects/mnemosyne/memory/project-summary.md | active | memory_doc | 4. Project Context | include | 対象Projectの目的と主要構成を把握する |
| src-003-ADR-001-docs-as-source-of-memory-md | docs/adr/ADR-001-docs-as-source-of-memory.md | active | adr_source | 6. Active Decisions | include | アーキテクチャ判断や依存方向の根拠を確認する |
| src-004-ADR-002-memory-source-of-truth-boundary-md | docs/adr/ADR-002-memory-source-of-truth-boundary.md | active | adr_source | 6. Active Decisions | include | アーキテクチャ判断や依存方向の根拠を確認する |
| src-005-ADR-003-human-approved-memory-update-md | docs/adr/ADR-003-human-approved-memory-update.md | active | adr_source | 6. Active Decisions | include | アーキテクチャ判断や依存方向の根拠を確認する |
| src-006-ADR-004-project-independent-memory-template-md | docs/adr/ADR-004-project-independent-memory-template.md | active | adr_source | 6. Active Decisions | include | アーキテクチャ判断や依存方向の根拠を確認する |
| src-007-ADR-005-agent-context-separation-md | docs/adr/ADR-005-agent-context-separation.md | active | adr_source | 6. Active Decisions | include | アーキテクチャ判断や依存方向の根拠を確認する |
| src-008-build-report-rule-md | docs/context/build-report-rule.md | draft | additional_source | 11. Additional Sources | include_with_warning | Explicitly supplied additional source. |

---

## 12. Excluded Source List

No excluded sources.

---

## 13. Review Decision

| Item | Value |
| --- | --- |
| Human Reviewed | no |
| Approved for AI Input | pending |
| Reviewer |  |
| Reviewed At |  |
| Notes |  |

---

## End of Context Preview
