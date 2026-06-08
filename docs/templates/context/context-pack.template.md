---
title: "Context Pack Template"
template_id: "templates/context/context-pack.template.md"
template_role: "context_pack_template"
status: "draft"
version: "0.1.0"
created_at: "2026-06-08"
updated_at: "2026-06-08"
phase: "Phase 2: Context Forge"
milestone: "M2-1: Context Pack標準構造定義"
related_documents:
  - "docs/context/context-pack-structure.md"
---

# Context Pack

> This Context Pack is a generated artifact.
> It is not the source of truth.
> If this Context Pack conflicts with Active ADRs, Active memory documents, or Active phase documents, the Active source documents take precedence.

---

## 1. Build Metadata

| Item | Value |
|---|---|
| Context Pack Version | {{context_pack_version}} |
| Generated At | {{generated_at}} |
| Project Code | {{project_code}} |
| Project Name | {{project_name}} |
| Agent Code | {{agent_code}} |
| Agent Name | {{agent_name}} |
| Task Request | {{task_request}} |
| Output Type | {{output_type}} |
| Build Mode | {{build_mode}} |
| Source Status Policy | {{source_status_policy}} |
| Token Budget | {{token_budget}} |
| Builder Name | {{builder_name}} |
| Builder Version | {{builder_version}} |

---

## 2. Base Context

### 2.1 Context Handling Principles

- Context Pack is a generated artifact, not a source of truth.
- Active source documents take precedence over draft, proposed, archived, deprecated, or generated content.
- Draft or proposed information must not be treated as an approved decision.
- Recent Conversation Context must not override Active source documents.
- The AI may create drafts, reviews, proposals, and issue candidates.
- The AI must not directly update Active source documents unless a human explicitly approves the change outside this Context Pack.

### 2.2 Source Priority

{{base_context.source_priority}}

### 2.3 Common Constraints

{{base_context.common_constraints}}

---

## 3. Agent Context

### 3.1 Agent Role

{{agent_context.role}}

### 3.2 Responsibilities

{{agent_context.responsibilities}}

### 3.3 Required Context

{{agent_context.required_context}}

### 3.4 Output Contract

{{agent_context.output_contract}}

### 3.5 Prohibited Actions

{{agent_context.prohibited_actions}}

---

## 4. Project Context

### 4.1 Project Summary

{{project_context.summary}}

### 4.2 Purpose

{{project_context.purpose}}

### 4.3 Scope

{{project_context.scope}}

### 4.4 Out of Scope

{{project_context.out_of_scope}}

### 4.5 Key Terms

{{project_context.key_terms}}

---

## 5. Current Status

### 5.1 Current Phase / Milestone

{{current_status.phase_milestone}}

### 5.2 Current State

{{current_status.current_state}}

### 5.3 Completed Items

{{current_status.completed_items}}

### 5.4 In Progress Items

{{current_status.in_progress_items}}

### 5.5 Open Issues

{{current_status.open_issues}}

### 5.6 Notes

{{current_status.notes}}

---

## 6. Active Decisions

### 6.1 Active Decisions Summary

{{active_decisions.summary}}

### 6.2 Related ADRs

{{active_decisions.related_adrs}}

### 6.3 Effective Constraints from Decisions

{{active_decisions.constraints}}

### 6.4 Superseded or Deprecated Decisions Included for Reference

{{active_decisions.superseded_or_deprecated_reference}}

---

## 7. Next Actions

> Next Actions is the canonical task source when it is generated from `next-actions.md`.
> If task descriptions in Current Status, AI Entrypoint, or Conversation Summary conflict with this section, treat this section as the task source of truth and raise a warning.

### 7.1 Active Tasks

{{next_actions.active_tasks}}

### 7.2 Upcoming Tasks

{{next_actions.upcoming_tasks}}

### 7.3 Blockers

{{next_actions.blockers}}

### 7.4 Acceptance Criteria

{{next_actions.acceptance_criteria}}

---

## 8. Session Context

> Optional.
> Session Context is not a source of truth.
> Use it only as temporary context for the current work session.

{{session_context}}

---

## 9. Recent Conversation Context

> Optional.
> Recent Conversation Context does not override Active source documents.
> If it conflicts with Active source documents, treat it as a conflict candidate or update candidate.

{{recent_conversation_context}}

---

## 10. Task Context

### 10.1 User Request

{{task_context.user_request}}

### 10.2 Task Type

{{task_context.task_type}}

### 10.3 Target Files

{{task_context.target_files}}

### 10.4 Deliverables

{{task_context.deliverables}}

### 10.5 Acceptance Criteria

{{task_context.acceptance_criteria}}

### 10.6 User Constraints

{{task_context.user_constraints}}

### 10.7 Out of Scope for This Task

{{task_context.out_of_scope}}

---

## 11. Additional Sources

> Optional.
> Additional Sources do not replace standard memory documents.
> Draft sources included here must be listed in Warnings.

{{additional_sources.summary}}

---

## 12. Constraints and Write Policy

### 12.1 Write Policy

{{constraints.write_policy}}

### 12.2 Allowed Outputs

{{constraints.allowed_outputs}}

### 12.3 Prohibited Outputs / Actions

{{constraints.prohibited_outputs_or_actions}}

### 12.4 Human Approval Boundary

{{constraints.human_approval_boundary}}

---

## 13. Warnings

> This section is required.
> If there are no warnings, write `No warnings.`

### 13.1 Missing Required Documents

{{warnings.missing_required_docs}}

### 13.2 Draft / Proposed Sources Included

{{warnings.draft_or_proposed_sources}}

### 13.3 Deprecated / Superseded / Archived Sources Included

{{warnings.non_active_sources}}

### 13.4 Conflict Warnings

{{warnings.conflicts}}

### 13.5 Recent Context Warnings

{{warnings.recent_context}}

### 13.6 Token Budget Warnings

{{warnings.token_budget}}

### 13.7 Excluded Source Warnings

{{warnings.excluded_sources}}

---

## 14. Source List

| Source ID | Path | Document ID | Title | Status | Source Type | Included Section | Purpose | Handling |
|---|---|---|---|---|---|---|---|---|
{{source_list_rows}}

---

## 15. Build Report

### 15.1 Build Result

{{build_report.result}}

### 15.2 Context Coverage

{{build_report.context_coverage}}

### 15.3 Included Sources Count

{{build_report.included_sources_count}}

### 15.4 Excluded Sources

{{build_report.excluded_sources}}

### 15.5 Missing Required Docs

{{build_report.missing_required_docs}}

### 15.6 Warning Count

{{build_report.warning_count}}

### 15.7 Token Estimate

{{build_report.token_estimate}}

### 15.8 Recommended Next Action

{{build_report.recommended_next_action}}
