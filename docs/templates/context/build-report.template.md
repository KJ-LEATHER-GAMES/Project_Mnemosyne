---
title: "Build Report Template"
template_id: "docs/templates/context/build-report.template.md"
template_role: "context_build_report_template"
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
  - "docs/templates/context/context-preview.template.md"
---

# Context Build Report

> This Build Report is a generated diagnostic artifact.
> It is not the source of truth.
> It records how the Context Pack and Context Preview were generated.

---

## 1. Build Result

| Item | Value |
|---|---|
| Generation Result | {{generation_result}} |
| OK | {{ok}} |
| Project Code | {{project_code}} |
| Agent Code | {{agent_code}} |
| Output Type | {{output_type}} |
| Output Contract ID | {{output_contract_id}} |
| Build Mode | {{build_mode}} |
| Source Status Policy | {{source_status_policy}} |
| Included Source Count | {{included_source_count}} |
| Excluded Source Count | {{excluded_source_count}} |
| Warning Count | {{warning_count}} |
| Error Count | {{error_count}} |

---

## 2. Request Summary

| Item | Value |
|---|---|
| Task Request | {{task_request}} |
| Additional Sources Count | {{request_summary.additional_sources_count}} |
| Session Context Included | {{request_summary.session_context_included}} |
| Recent Context Included | {{request_summary.recent_context_included}} |
| Token Budget | {{request_summary.token_budget}} |

---

## 3. Output Artifacts

| Artifact | Path |
|---|---|
| Context Pack | {{context_pack_path}} |
| Build Report | {{build_report_path}} |
| Context Preview | {{context_preview_path}} |

---

## 4. Required Docs Check

| Item | Value |
|---|---|
| Memory Root | {{required_docs_check.memory_root}} |
| Required Docs Count | {{required_docs_check.required_docs_count}} |
| Missing Required Docs Count | {{required_docs_check.missing_required_docs_count}} |
| Standard Docs Satisfied | {{required_docs_check.standard_docs_satisfied}} |

| File Name | Resolved Path | Exists |
|---|---|---|
{{#each required_docs_check.required_docs}}
| {{file_name}} | {{resolved_path}} | {{exists}} |
{{/each}}

---

## 5. Agent Context Coverage

| Required Context | Coverage Status | Matched Sources | Note |
|---|---|---|---|
{{#each agent_context_coverage}}
| {{required_context}} | {{coverage_status}} | {{matched_sources}} | {{note}} |
{{/each}}

---

## 6. Source Coverage

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

## 7. Source Status Distribution

| Status | Included Count | Excluded Count |
|---|---:|---:|
{{#each source_status_distribution}}
| {{status}} | {{included_count}} | {{excluded_count}} |
{{/each}}

---

## 8. Warnings

{{#if warnings}}

| Code | Severity | Source ID | Path | Message |
|---|---|---|---|---|
{{#each warnings}}
| {{code}} | {{severity}} | {{source_id}} | {{path}} | {{message}} |
{{/each}}

{{else}}

None.

{{/if}}

---

## 9. Errors

{{#if errors}}

| Code | Severity | Source ID | Path | Message |
|---|---|---|---|---|
{{#each errors}}
| {{code}} | {{severity}} | {{source_id}} | {{path}} | {{message}} |
{{/each}}

{{else}}

None.

{{/if}}

---

## 10. Included Sources

| Source ID | Path | Document ID | Title | Status | Source Type | Included Section | Reason | Handling | Matched By | Explicitly Requested | Selection Reason |
|---|---|---|---|---|---|---|---|---|---|---|---|
{{#each included_sources}}
| {{source_id}} | {{path}} | {{document_id}} | {{title}} | {{status}} | {{source_type}} | {{included_section}} | {{reason}} | {{handling}} | {{matched_by}} | {{explicitly_requested}} | {{selection_reason}} |
{{/each}}

---

## 11. Excluded Sources

| Source ID | Path | Document ID | Title | Status | Source Type | Reason | Handling | Matched By | Explicitly Requested | Selection Reason |
|---|---|---|---|---|---|---|---|---|---|---|
{{#each excluded_sources}}
| {{source_id}} | {{path}} | {{document_id}} | {{title}} | {{status}} | {{source_type}} | {{reason}} | {{handling}} | {{matched_by}} | {{explicitly_requested}} | {{selection_reason}} |
{{/each}}

---

## 12. Token Estimate

| Item | Value |
|---|---|
| Estimated Input Tokens | {{token_estimate.estimated_input_tokens}} |
| Max Tokens | {{token_estimate.max_tokens}} |
| Exceeded | {{token_estimate.exceeded}} |
| Handling | {{token_estimate.handling}} |
| Approximate | {{token_estimate.approximate}} |
| Note | {{token_estimate.note}} |

---

## 13. Context Pack Trace

| Item | Value |
|---|---|
| Context Pack Path | {{context_pack_path}} |
| Context Preview Path | {{context_preview_path}} |
| Shared Source IDs | yes |
| Shared Warning Codes | yes |
| Shared Included Section Names | yes |

---

## 14. Unsupported / Placeholder Features

{{#if unsupported_features}}
{{#each unsupported_features}}
- {{this}}
{{/each}}
{{else}}
None.
{{/if}}

---

## End of Context Build Report
