---
title: "Build Report Template"
template_id: "docs/templates/context/build-report.template.md"
template_role: "context_build_report_template"
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
  - "docs/templates/context/context-preview.template.md"
---

# Context Build Report

> This Build Report is a generated diagnostic artifact.
> It is not the source of truth.

## 1. Build Result

{{build_result}}

## 2. Required Docs Check

{{required_docs_check}}

## 3. Unsupported / Placeholder Features

{{unsupported_features}}

## 4. Errors

| Code | Severity | Source ID | Path | Message | Handling |
|---|---|---|---|---|---|
{{#each errors}}
| {{code}} | {{severity}} | {{source_id}} | {{path}} | {{message}} | {{handling}} |
{{/each}}

## 5. Warnings

| Code | Severity | Source ID | Path | Message | Handling |
|---|---|---|---|---|---|
{{#each warnings}}
| {{code}} | {{severity}} | {{source_id}} | {{path}} | {{message}} | {{handling}} |
{{/each}}

## 6. Included Sources

{{included_sources}}

## 7. Excluded Sources

{{excluded_sources}}

## 8. Token Estimate

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

## End of Context Build Report
