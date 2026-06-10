---
title: "Context Preview Template"
template_id: "docs/templates/context/context-preview.template.md"
template_role: "context_preview_template"
status: "draft"
version: "0.1.0"
created_at: "2026-06-10"
updated_at: "2026-06-10"
phase: "Phase 2: Context Forge"
milestone: "M2-6: Context Preview実装"
owner: "Project Mnemosyne"
review_status: "draft"
related_documents:
  - "docs/context/build-report-rule.md"
  - "docs/templates/context/build-report.template.md"
---

# Context Preview

> This Context Preview is a generated human-review artifact.
> It is not the source of truth.
> It is not intended to be used as the AI input body.
> Review the warnings, source status mix, coverage, and trace information before using the Context Pack.

---

## 1. Preview Summary

| Item | Value |
|---|---|
| Generated At | {{generated_at}} |
| Project Code | {{project_code}} |
| Project Name | {{project_name}} |
| Agent Code | {{agent_code}} |
| Agent Name | {{agent_name}} |
| Task Request | {{task_request}} |
| Output Type | {{output_type}} |
| Build Mode | {{build_mode}} |
| Generation Result | {{generation_result}} |
| Review Recommendation | {{review_recommendation}} |

---

## 2. Human Review Checklist

| Check | Status | Note |
|---|---|---|
| No build errors | {{checklist.no_build_errors.status}} | {{checklist.no_build_errors.note}} |
| Required memory docs exist | {{checklist.required_docs.status}} | {{checklist.required_docs.note}} |
| Agent required context is covered | {{checklist.agent_context_coverage.status}} | {{checklist.agent_context_coverage.note}} |
| No conflict warnings | {{checklist.conflicts.status}} | {{checklist.conflicts.note}} |
| Non-final evidence is acceptable | {{checklist.non_final_evidence.status}} | {{checklist.non_final_evidence.note}} |
| Token estimate is within budget | {{checklist.token_budget.status}} | {{checklist.token_budget.note}} |
| Context Pack and Build Report paths are traceable | {{checklist.trace.status}} | {{checklist.trace.note}} |

---

## 3. Build Result

| Item | Value |
|---|---|
| OK | {{build_result.ok}} |
| Warning Count | {{build_result.warning_count}} |
| Error Count | {{build_result.error_count}} |
| Conflict Count | {{build_result.conflict_count}} |
| Missing Required Source Count | {{build_result.missing_required_source_count}} |

---

## 4. Output Artifacts

| Artifact | Path |
|---|---|
| Context Pack | {{context_pack_path}} |
| Build Report | {{build_report_path}} |
| Context Preview | {{context_preview_path}} |

---

## 5. Warning Summary

{{#if warnings}}

| Code | Severity | Source ID | Path | Message |
|---|---|---|---|---|
{{#each warnings}}
| {{code}} | {{severity}} | {{source_id}} | {{path}} | {{message}} |
{{/each}}

{{else}}

No warnings.

{{/if}}

---

## 6. Source Status Mix

| Status | Included Count | Excluded Count | Review Note |
|---|---:|---:|---|
{{#each source_status_mix}}
| {{status}} | {{included_count}} | {{excluded_count}} | {{review_note}} |
{{/each}}

---

## 7. Agent Context Coverage

| Required Context | Coverage Status | Matched Sources | Note |
|---|---|---|---|
{{#each agent_context_coverage}}
| {{required_context}} | {{coverage_status}} | {{matched_sources}} | {{note}} |
{{/each}}

---

## 8. Source Coverage

| Item | Value |
|---|---|
| Included Source Count | {{source_coverage.included_source_count}} |
| Excluded Source Count | {{source_coverage.excluded_source_count}} |
| Warning Source Count | {{source_coverage.warning_source_count}} |
| Required Doc Count | {{source_coverage.required_doc_count}} |
| Missing Required Doc Count | {{source_coverage.missing_required_doc_count}} |
| Active or Accepted Source Count | {{source_coverage.active_or_accepted_count}} |
| Non-Final Evidence Source Count | {{source_coverage.non_final_evidence_count}} |

---

## 9. Token Estimate

| Item | Value |
|---|---|
| Estimated Input Tokens | {{token_estimate.estimated_input_tokens}} |
| Max Tokens | {{token_estimate.max_tokens}} |
| Reserve Tokens For Response | {{token_estimate.reserve_tokens_for_response}} |
| Exceeded | {{token_estimate.exceeded}} |
| Handling | {{token_estimate.handling}} |
| Approximate | {{token_estimate.approximate}} |
| Note | {{token_estimate.note}} |

---

## 10. Context Pack and Build Report Trace

| Trace Item | Value |
|---|---|
| Context Pack Path | {{context_pack_path}} |
| Build Report Path | {{build_report_path}} |
| Context Preview Path | {{context_preview_path}} |
| Source ID Shared With Context Pack | yes |
| Source ID Shared With Build Report | yes |
| Warning Code Shared With Build Report | yes |

---

## 11. Included Source List

| Source ID | Path | Status | Source Type | Included Section | Handling | Purpose |
|---|---|---|---|---|---|---|
{{#each included_sources}}
| {{source_id}} | {{path}} | {{status}} | {{source_type}} | {{included_section}} | {{handling}} | {{purpose}} |
{{/each}}

---

## 12. Excluded Source List

| Source ID | Path | Status | Source Type | Reason | Handling |
|---|---|---|---|---|---|
{{#each excluded_sources}}
| {{source_id}} | {{path}} | {{status}} | {{source_type}} | {{reason}} | {{handling}} |
{{/each}}

---

## 13. Review Decision

| Item | Value |
|---|---|
| Human Reviewed | no |
| Approved for AI Input | pending |
| Reviewer |  |
| Reviewed At |  |
| Notes |  |

---

## End of Context Preview
