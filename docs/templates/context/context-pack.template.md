---
title: "Context Pack Template"
template_id: "docs/templates/context/context-pack.template.md"
template_role: "context_pack_template"
status: "active"
version: "1.0.0"
created_at: "2026-06-08"
updated_at: "2026-06-09"
phase: "Phase 2: Context Forge"
milestone: "M2-1: Context Pack標準構造定義"
owner: "Project Mnemosyne"
review_status: "active"
related_documents:
  - "docs/context/context-pack-structure.md"
---

# Context Pack

> This Context Pack is a generated artifact.
> It is not the source of truth.
> If this Context Pack conflicts with Active ADRs, Active memory documents, Active phase documents, or other Active source documents, the Active source documents take precedence.
> Draft, proposed, archived, deprecated, superseded, unknown, session, and recent conversation information must not override Active source documents.

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
- Active source documents take precedence over draft, proposed, archived, deprecated, superseded, unknown, session, recent conversation, or generated content.
- Draft or proposed information must not be treated as an approved decision.
- Recent Conversation Context must not override Active source documents.
- Session Context is temporary context for this build only.
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

### 3.3 Out of Scope

{{agent_context.out_of_scope}}

### 3.4 Required Context

{{agent_context.required_context}}

### 3.5 Allowed Operations

{{agent_context.allowed_operations}}

### 3.6 Forbidden Operations

{{agent_context.forbidden_operations}}

### 3.7 Output Contract

{{agent_context.output_contract}}

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

### 4.5 Current Phase

{{project_context.current_phase}}

### 4.6 Main Deliverables

{{project_context.main_deliverables}}

### 4.7 Related Systems and Repositories

{{project_context.related_systems}}

---

## 5. Current Status

> Current Status is a state summary.
> It is not the canonical task list.
> The canonical task list is maintained in Next Actions source documents.

### 5.1 Current Position

{{current_status.current_position}}

### 5.2 Completed Items

{{current_status.completed_items}}

### 5.3 In Progress Items

{{current_status.in_progress_items}}

### 5.4 Known Issues

{{current_status.known_issues}}

### 5.5 Recent Changes

{{current_status.recent_changes}}

---

## 6. Active Decisions

### 6.1 Accepted ADRs

{{active_decisions.accepted_adrs}}

### 6.2 Active Decisions

{{active_decisions.decisions}}

### 6.3 Architecture Decisions

{{active_decisions.architecture_decisions}}

### 6.4 Operational Decisions

{{active_decisions.operational_decisions}}

### 6.5 Source of Truth Boundaries

{{active_decisions.source_of_truth_boundaries}}

---

## 7. Next Actions

> Next Actions is the canonical task context section in this Context Pack.
> If this section conflicts with Current Status, Next Actions source documents take precedence.

### 7.1 Active Tasks

{{next_actions.active_tasks}}

### 7.2 Next Milestone Tasks

{{next_actions.next_milestone_tasks}}

### 7.3 Priority

{{next_actions.priority}}

### 7.4 Done Criteria

{{next_actions.done_criteria}}

### 7.5 Dependencies

{{next_actions.dependencies}}

---

## 8. Session Context

> Session Context is temporary input for this Context Pack build only.
> It is not a source of truth.
> It must not override Active source documents.

### 8.1 Request-Specific Context

{{session_context.request_specific_context}}

### 8.2 Temporary Constraints

{{session_context.temporary_constraints}}

### 8.3 Review Viewpoints

{{session_context.review_viewpoints}}

### 8.4 Manual Notes

{{session_context.manual_notes}}

---

## 9. Recent Conversation Context

> Recent Conversation Context is extracted from recent conversation summaries or logs.
> It is not a source of truth.
> It may contain unapproved information.
> It must not override Active source documents.

### 9.1 Recent Confirmed Context Candidates

{{recent_conversation_context.confirmed_candidates}}

### 9.2 Recent Issue Candidates

{{recent_conversation_context.issue_candidates}}

### 9.3 Recent Decision Candidates

{{recent_conversation_context.decision_candidates}}

### 9.4 Recent Task Candidates

{{recent_conversation_context.task_candidates}}

### 9.5 Handling Notes

{{recent_conversation_context.handling_notes}}

---

## 10. Task Context

### 10.1 Objective

{{task_context.objective}}

### 10.2 Required Outputs

{{task_context.required_outputs}}

### 10.3 Done Criteria

{{task_context.done_criteria}}

### 10.4 Review Viewpoints

{{task_context.review_viewpoints}}

### 10.5 Input Files

{{task_context.input_files}}

### 10.6 Expected Change Scope

{{task_context.expected_change_scope}}

### 10.7 Non-Goals

{{task_context.non_goals}}

---

## 11. Additional Sources

{{#each additional_sources}}

### 11.{{@index}} {{title}}

| Item | Value |
|---|---|
| Source ID | {{source_id}} |
| Path | {{path}} |
| Status | {{status}} |
| Source Type | {{source_type}} |
| Handling | {{handling}} |
| Purpose | {{purpose}} |

#### Summary

{{summary}}

#### Relevant Content

{{relevant_content}}

#### Handling Note

{{handling_note}}

{{/each}}

---

## 12. Constraints and Write Policy

### 12.1 Allowed Outputs

{{constraints_and_write_policy.allowed_outputs}}

### 12.2 Forbidden Updates

{{constraints_and_write_policy.forbidden_updates}}

### 12.3 Human Approval Required

{{constraints_and_write_policy.human_approval_required}}

### 12.4 Draft and Active Boundary

{{constraints_and_write_policy.draft_active_boundary}}

### 12.5 Source of Truth Boundary

{{constraints_and_write_policy.source_of_truth_boundary}}

### 12.6 Write Policy

{{constraints_and_write_policy.write_policy}}

---

## 13. Warnings

> Warnings are placed before Source List so that the AI reads risk information before source details.

{{#if warnings}}

| Type | Severity | Source ID | Message | Handling |
|---|---|---|---|---|
{{#each warnings}}
| {{type}} | {{severity}} | {{source_id}} | {{message}} | {{handling}} |
{{/each}}

{{else}}

No warnings.

{{/if}}

---

## 14. Source List

| Source ID | Path | Document ID | Title | Status | Source Type | Included Section | Purpose | Handling |
|---|---|---|---|---|---|---|---|---|
{{#each source_list}}
| {{source_id}} | {{path}} | {{document_id}} | {{title}} | {{status}} | {{source_type}} | {{included_section}} | {{purpose}} | {{handling}} |
{{/each}}

---

## 15. Build Report Summary

> This section contains only the minimum build report required for AI work.
> A detailed Build Report may be generated separately for human review.

| Item | Value |
|---|---|
| Included Source Count | {{build_report_summary.included_source_count}} |
| Excluded Source Count | {{build_report_summary.excluded_source_count}} |
| Warning Count | {{build_report_summary.warning_count}} |
| Conflict Count | {{build_report_summary.conflict_count}} |
| Missing Required Source Count | {{build_report_summary.missing_required_source_count}} |
| Token Budget Handling | {{build_report_summary.token_budget_handling}} |
| Detailed Build Report Path | {{build_report_summary.detailed_build_report_path}} |

### 15.1 Excluded Sources Summary

{{build_report_summary.excluded_sources_summary}}

### 15.2 Conflict Summary

{{build_report_summary.conflict_summary}}

### 15.3 Missing Required Sources Summary

{{build_report_summary.missing_required_sources_summary}}

---

## End of Context Pack

