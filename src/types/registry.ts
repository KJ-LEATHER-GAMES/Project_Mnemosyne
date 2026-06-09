export type ProjectCode = string;

export type SourceStatus =
  | "active"
  | "accepted"
  | "draft"
  | "proposed"
  | "superseded"
  | "deprecated"
  | "archived"
  | "unknown";

export type SourceStatusPolicyId =
  | "active_only"
  | "active_preferred"
  | "active_preferred_draft_allowed_with_warning"
  | "include_archived_for_history";

export type WritePolicyId = "draft_only";

export type ProjectStatus = "draft" | "active" | "archived";

export type SourceGroupType =
  | "memory_doc"
  | "optional_source"
  | "adr_source"
  | "review_source"
  | "phase_doc"
  | "requirement_doc"
  | "template"
  | "code"
  | "additional_source";

export type StandardRequiredMemoryDoc =
  | "project-summary.md"
  | "current-status.md"
  | "active-decisions.md"
  | "next-actions.md"
  | "ai-entrypoint.md";

export interface ProjectRegistryFile {
  registry_schema_version: string;
  registry_status: ProjectStatus;
  updated_at: string;
  description?: string;
  defaults?: ProjectRegistryDefaults;
  projects: ProjectRegistryEntry[];
}

export interface ProjectRegistryDefaults {
  required_memory_docs?: StandardRequiredMemoryDoc[];
  source_selection_policy?: SourceSelectionPolicy;
  source_status_policies?: Partial<Record<SourceStatusPolicyId, SourceStatusPolicyConfig>>;
  write_policies?: Partial<Record<WritePolicyId, WritePolicyConfig>>;
}

export interface SourceSelectionPolicy {
  required_memory_docs_meaning: "existence_check_only";
  required_memory_docs_are_always_included: false;
  context_inclusion_is_decided_by: string[];
}

export interface ProjectRegistryEntry {
  project_code: ProjectCode;
  project_name: string;
  description?: string;
  status?: ProjectStatus;
  current_phase?: string;

  /**
   * Root directory for project memory documents.
   *
   * Example:
   * docs/projects/ats/memory
   */
  memory_root: string;

  /**
   * Existence validation targets for the standard memory structure.
   *
   * Important:
   * These documents are NOT always included in the Context Pack.
   * Actual inclusion is decided by Agent Registry, Task Request,
   * Additional Sources, Source Status Policy, Token Budget, and Build Rule.
   */
  required_memory_docs: string[];

  /**
   * Project-specific candidate sources.
   * These are selected only when task, agent, or build rule requires them.
   */
  optional_sources?: SourceGroup[];

  /**
   * ADR candidate sources.
   * Active / accepted ADRs are preferred by default.
   */
  adr_sources?: SourceGroup[];

  /**
   * Review result candidate sources.
   */
  review_sources?: SourceGroup[];

  source_status_policy: PolicyReference<SourceStatusPolicyId> | SourceStatusPolicyConfig;

  write_policy: PolicyReference<WritePolicyId> | WritePolicyConfig;
}

export interface PolicyReference<TPolicyId extends string> {
  policy_id: TPolicyId;
}

export interface SourceGroup {
  source_group: string;
  description?: string;
  patterns: string[];
}

export interface SourceStatusPolicyConfig {
  policy_id: SourceStatusPolicyId;
  include_by_default: SourceStatus[];
  explicit_only: SourceStatus[];
  warning_required: SourceStatus[];
  prohibit_as_final_evidence: SourceStatus[];
}

export interface WritePolicyConfig {
  policy_id: WritePolicyId;

  ai_can: string[];

  ai_must_not: string[];

  human_approval_required_for: string[];
}

export interface ProjectRegistryValidationResult {
  ok: boolean;
  project_code?: ProjectCode;
  errors: ProjectRegistryValidationError[];
  warnings: ProjectRegistryValidationWarning[];
  required_docs_check?: RequiredMemoryDocsCheckResult;
}

export interface ProjectRegistryValidationError {
  code:
    | "registry_file_invalid"
    | "project_not_found"
    | "missing_required_field"
    | "duplicate_project_code"
    | "memory_root_not_found"
    | "required_memory_doc_missing"
    | "required_memory_doc_not_declared"
    | "invalid_required_memory_doc_path"
    | "invalid_source_status_policy"
    | "invalid_write_policy";

  message: string;
  path?: string;
  project_code?: ProjectCode;
}

export interface ProjectRegistryValidationWarning {
  code:
    | "optional_sources_empty"
    | "adr_sources_empty"
    | "review_sources_empty"
    | "source_pattern_not_found"
    | "invalid_source_pattern"
    | "source_pattern_group_empty"
    | "unknown_status_policy_detail"
    | "required_memory_docs_not_default";

  message: string;
  path?: string;
  project_code?: ProjectCode;
}

export interface RequiredMemoryDocsCheckResult {
  memory_root: string;
  required_docs: RequiredMemoryDocCheck[];
  missing_docs: RequiredMemoryDocCheck[];

  /**
   * True when all standard required memory docs are declared and exist.
   */
  standard_docs_satisfied: boolean;
}

export interface RequiredMemoryDocCheck {
  file_name: string;
  resolved_path: string;
  exists: boolean;
}

export interface ResolvedProjectRegistry {
  project: ProjectRegistryEntry;
  source_status_policy: SourceStatusPolicyConfig;
  write_policy: WritePolicyConfig;
  required_docs_check: RequiredMemoryDocsCheckResult;
}

export interface SourceCandidate {
  source_type: SourceGroupType;
  source_group?: string;
  path_or_pattern: string;
  description?: string;
}

export interface ProjectSourceCandidates {
  project_code: ProjectCode;
  memory_root: string;
  required_memory_docs: SourceCandidate[];
  optional_sources: SourceCandidate[];
  adr_sources: SourceCandidate[];
  review_sources: SourceCandidate[];
}
export type AgentCode = string;

export type AgentStatus = "draft" | "active" | "archived";

export type AgentPriority = "P0" | "P1" | "P2" | "Later";

export type AgentScope = "project_independent" | "project_specific" | "experimental";

export type AgentContextInclusion = "required" | "optional";

export type AgentContextSourceType = SourceGroupType | "recent_context" | "session_context";

export type AgentOutputFormat = "markdown" | "markdown_and_files" | "json";

export type OutputContractId =
  | "adr_draft"
  | "requirements_document"
  | "implementation_review_report"
  | "task_breakdown"
  | "article_draft";

export interface AgentRegistryFile {
  registry_schema_version: string;
  registry_status: AgentStatus;
  updated_at: string;
  description?: string;
  agent_selection_policy?: AgentSelectionPolicy;
  completion_requirements?: AgentCompletionRequirements;
  defaults?: AgentRegistryDefaults;
  agents: AgentRegistryEntry[];
}

export interface AgentSelectionPolicy {
  agent_registry_is_source_of_agent_contract: boolean;
  project_registry_is_source_of_project_sources: boolean;
  context_pack_is_generated_artifact: boolean;
  project_specific_facts_decisions_tasks_must_not_be_stored_in_agent_registry: boolean;
  context_inclusion_is_decided_by: string[];
}

export interface AgentCompletionRequirements {
  required_p0_agents: AgentCode[];
  required_p1_agents: AgentCode[];
  later_agents?: AgentCode[];
}

export interface AgentRegistryDefaults {
  output_contracts?: Partial<Record<OutputContractId, OutputContractConfig>>;
  write_policies?: Partial<Record<WritePolicyId, WritePolicyConfig>>;
}

export interface AgentRegistryEntry {
  agent_code: AgentCode;
  agent_name: string;
  description?: string;
  priority: AgentPriority;
  agent_scope: AgentScope;
  status?: AgentStatus;
  version?: string;

  /**
   * Project codes this agent can be combined with.
   * Use ["*"] for project-independent agents.
   */
  supported_project_codes: ProjectCode[];

  default_output_contract: OutputContractReference | OutputContractConfig;
  write_policy: PolicyReference<WritePolicyId> | WritePolicyConfig;

  role: string;
  responsibilities: string[];
  out_of_scope: string[];

  /**
   * Context required by the agent contract.
   * Actual source expansion is performed by Context Builder using Project Registry.
   */
  required_context: AgentContextRequirement[];

  /**
   * Context candidates that may be included depending on task, token budget, and build rule.
   */
  optional_context?: AgentContextRequirement[];

  allowed_operations: string[];
  forbidden_operations: string[];

  output_contract: OutputContractReference | AgentOutputContractOverride;
}

export interface AgentContextRequirement {
  context_id: string;
  source_type: AgentContextSourceType;

  /**
   * Project Registry source_group reference.
   * Project-independent agents should prefer generic source_type first.
   */
  source_group?: string;

  /**
   * Memory document file names under project memory_root.
   */
  document_names?: string[];

  /**
   * Direct relative paths. Use sparingly; source_group or source_type is preferred.
   */
  paths?: string[];

  purpose: string;
  inclusion: AgentContextInclusion;
  max_items?: number;
  handling_note?: string;
}

export interface OutputContractReference {
  output_contract_id: OutputContractId;
}

export interface OutputContractConfig {
  output_contract_id: OutputContractId;
  description?: string;
  required_sections: string[];
  default_format: AgentOutputFormat;
}

export interface AgentOutputContractOverride {
  output_contract_id: OutputContractId;
  additional_requirements?: string[];
}

export interface ResolvedAgentRegistry {
  agent: AgentRegistryEntry;
  default_output_contract: OutputContractConfig;
  output_contract: ResolvedAgentOutputContract;
  write_policy: WritePolicyConfig;
}

export interface ResolvedAgentOutputContract extends OutputContractConfig {
  additional_requirements: string[];
}

export interface AgentRegistryValidationResult {
  ok: boolean;
  agent_code?: AgentCode;
  errors: AgentRegistryValidationError[];
  warnings: AgentRegistryValidationWarning[];
  completion_check?: AgentCompletionCheckResult;
}

export interface AgentRegistryValidationError {
  code:
    | "agent_registry_file_invalid"
    | "agent_not_found"
    | "missing_required_field"
    | "duplicate_agent_code"
    | "invalid_supported_project_code"
    | "invalid_agent_priority"
    | "invalid_agent_scope"
    | "invalid_output_contract"
    | "invalid_write_policy"
    | "invalid_context_requirement"
    | "invalid_context_path"
    | "required_p0_agent_missing"
    | "required_p1_agent_missing"
    | "required_agent_priority_mismatch"
    | "project_specific_agent_in_initial_registry";

  message: string;
  agent_code?: AgentCode;
  context_id?: string;
  path?: string;
}

export interface AgentRegistryValidationWarning {
  code:
    | "agent_status_not_active"
    | "optional_context_empty"
    | "agent_all_projects_scope"
    | "output_contract_has_no_additional_requirements"
    | "later_agent_registered"
    | "project_specific_scope_declared";

  message: string;
  agent_code?: AgentCode;
}

export interface AgentCompletionCheckResult {
  required_p0_agents: AgentCode[];
  required_p1_agents: AgentCode[];
  missing_p0_agents: AgentCode[];
  missing_p1_agents: AgentCode[];
  p0_agents_satisfied: boolean;
  p1_agents_satisfied: boolean;
}

export interface AgentContextCandidates {
  agent_code: AgentCode;
  required_context: AgentContextRequirement[];
  optional_context: AgentContextRequirement[];
}
