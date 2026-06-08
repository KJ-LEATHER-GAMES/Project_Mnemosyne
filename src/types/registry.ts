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