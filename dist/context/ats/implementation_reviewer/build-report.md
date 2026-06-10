# Context Build Report

## 1. Build Result

| Item | Value |
| --- | --- |
| Generation Result | success |
| OK | true |
| Project Code | ats |
| Agent Code | implementation_reviewer |
| Output Type | implementation_review_report |
| Output Contract ID | implementation_review_report |
| Build Mode | standard |
| Source Status Policy | active_preferred |
| Included Source Count | 7 |
| Excluded Source Count | 0 |
| Warning Count | 0 |
| Error Count | 0 |

## 2. Required Docs Check

| Item | Value |
| --- | --- |
| Memory Root | C:\Users\monsi\OneDrive\Apps\remotely-save\Project_Mnemosyne\docs\projects\ats\memory |
| Required Docs Count | 5 |
| Missing Required Docs Count | 0 |
| Standard Docs Satisfied | true |

| File Name | Resolved Path | Exists |
| --- | --- | --- |
| project-summary.md | C:/Users/monsi/OneDrive/Apps/remotely-save/Project_Mnemosyne/docs/projects/ats/memory/project-summary.md | true |
| current-status.md | C:/Users/monsi/OneDrive/Apps/remotely-save/Project_Mnemosyne/docs/projects/ats/memory/current-status.md | true |
| active-decisions.md | C:/Users/monsi/OneDrive/Apps/remotely-save/Project_Mnemosyne/docs/projects/ats/memory/active-decisions.md | true |
| next-actions.md | C:/Users/monsi/OneDrive/Apps/remotely-save/Project_Mnemosyne/docs/projects/ats/memory/next-actions.md | true |
| ai-entrypoint.md | C:/Users/monsi/OneDrive/Apps/remotely-save/Project_Mnemosyne/docs/projects/ats/memory/ai-entrypoint.md | true |

## 3. Unsupported / Placeholder Features

- Recent Context loader is a placeholder. Conversation Summary files are not loaded yet.
- Semantic conflict detection is not implemented. Only structural warnings are generated.
- Token estimate is approximate and uses character count / 4.

## 4. Errors

None.

## 5. Warnings

None.

## 6. Included Sources

| Source ID | Path | Document ID | Title | Status | Source Type | Included Section | Reason | Handling | Matched By | Explicitly Requested | Selection Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| src-001-active-decisions-md | docs/projects/ats/memory/active-decisions.md | docs/projects/ats/memory/active-decisions.md | ATS Active Decisions | active | memory_doc | 6. Active Decisions | agent_required_context | include | agent_required_context | true | Selected by agent_required_context. |
| src-002-project-summary-md | docs/projects/ats/memory/project-summary.md | docs/projects/ats/memory/project-summary.md | ATS Project Summary | active | memory_doc | 4. Project Context | agent_required_context | include | agent_required_context | true | Selected by agent_required_context. |
| src-003-ADR-001-docs-as-source-of-memory-md | docs/adr/ADR-001-docs-as-source-of-memory.md | docs/adr/ADR-001-docs-as-source-of-memory.md | ADR-001: Markdown docs and ADRs as the Source of Memory | active | adr_source | 6. Active Decisions | agent_optional_context | include | ats_adrs | false | Matched Project Registry source group: ats_adrs. |
| src-004-ADR-002-memory-source-of-truth-boundary-md | docs/adr/ADR-002-memory-source-of-truth-boundary.md | docs/adr/ADR-002-memory-source-of-truth-boundary.md | ADR-002: Memory Source of Truth Boundary | active | adr_source | 6. Active Decisions | agent_optional_context | include | ats_adrs | false | Matched Project Registry source group: ats_adrs. |
| src-005-ADR-003-human-approved-memory-update-md | docs/adr/ADR-003-human-approved-memory-update.md | docs/adr/ADR-003-human-approved-memory-update.md | ADR-003: Human-Approved Memory Update | active | adr_source | 6. Active Decisions | agent_optional_context | include | ats_adrs | false | Matched Project Registry source group: ats_adrs. |
| src-006-ADR-004-project-independent-memory-template-md | docs/adr/ADR-004-project-independent-memory-template.md | docs/adr/ADR-004-project-independent-memory-template.md | ADR-004: Project-Independent Memory Template | active | adr_source | 6. Active Decisions | agent_optional_context | include | ats_adrs | false | Matched Project Registry source group: ats_adrs. |
| src-007-ADR-005-agent-context-separation-md | docs/adr/ADR-005-agent-context-separation.md | docs/adr/ADR-005-agent-context-separation.md | ADR-005: Agent and Project Context Separation | active | adr_source | 6. Active Decisions | agent_optional_context | include | ats_adrs | false | Matched Project Registry source group: ats_adrs. |

## 7. Excluded Sources

None.

## 8. Token Estimate

| Item | Value |
| --- | --- |
| Estimated Input Tokens | 9794 (approximate) |
| Estimate Method | Approximate estimate using source excerpt character count / 4. Not tokenizer-based. |
| Max Tokens | 24000 |
| Exceeded | false |
| Handling | none |
| Approximate | true |
