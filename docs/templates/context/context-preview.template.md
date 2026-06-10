---
title: "Context Preview Template"
template_id: "docs/templates/context/context-preview.template.md"
template_role: "context_preview_template"
status: "active"
version: "1.0.0"
created_at: "2026-06-10"
updated_at: "2026-06-11"
phase: "Phase 2: Context Forge"
milestone: "M2-6: Context Preview実装"
owner: "Project Mnemosyne"
review_status: "active"
related_documents:
  - "docs/context/build-report-rule.md"
  - "docs/templates/context/build-report.template.md"
---

# Context Preview

> This Context Preview is a generated human-review artifact.
> It is not the source of truth.
> It is not intended to be used as the AI input body.

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

## 2. Human Review Checklist

{{human_review_checklist}}

## 3. Build Result

{{build_result}}

## 4. Output Artifacts

{{output_artifacts}}

## 5. Warning Summary

| Code | Severity | Source ID | Path | Message | Handling |
|---|---|---|---|---|---|
{{#each warnings}}
| {{code}} | {{severity}} | {{source_id}} | {{path}} | {{message}} | {{handling}} |
{{/each}}

## 6. Source Status Mix

{{source_status_mix}}

## 7. Agent Context Coverage

> Coverage expresses whether required context exists. Source status and evidence quality are reviewed separately.

| Required Context | Coverage Status | Matched Sources | Note |
|---|---|---|---|
{{#each agent_context_coverage}}
| {{required_context}} | {{coverage_status}} | {{matched_sources}} | {{note}} |
{{/each}}

## 8. Source Coverage

{{source_coverage}}

## 9. Token Estimate

| Item | Value |
|---|---|
| Estimated Input Tokens | {{token_estimate.estimated_input_tokens}} |
| Max Tokens | {{token_estimate.max_tokens}} |
| Reserve Tokens For Response | {{token_estimate.reserve_tokens_for_response}} |
| Available Input Tokens | {{token_estimate.available_input_tokens}} |
| Exceeded | {{token_estimate.exceeded}} |
| Handling | {{token_estimate.handling}} |
| Approximate | {{token_estimate.approximate}} |
| Note | {{token_estimate.note}} |

## 10. Context Pack and Build Report Trace

| Trace Item | Value |
|---|---|
| Context Pack Path | {{context_pack_path}} |
| Build Report Path | {{build_report_path}} |
| Context Preview Path | {{context_preview_path}} |
| Source ID Shared With Context Pack | {{trace.source_ids_in_context_pack}} |
| Source ID Shared With Build Report | {{trace.source_ids_in_build_report}} |
| Warning Code Shared With Build Report | {{trace.warning_codes_in_build_report}} |

## 11. Included Source List

{{included_source_list}}

## 12. Excluded Source List

{{excluded_source_list}}

## 13. Review Decision

| Item | Value |
|---|---|
| Human Reviewed | no |
| Approved for AI Input | pending |
| Reviewer |  |
| Reviewed At |  |
| Notes |  |

## End of Context Preview
