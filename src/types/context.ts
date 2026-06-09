import type {
  AgentCode,
  OutputContractId,
  ProjectCode,
  SourceGroupType,
  SourceStatus,
  SourceStatusPolicyId,
} from "./registry";

export type ContextBuildMode = "minimal" | "standard" | "full" | "debug";

export type ContextBuildOutputType =
  | "review_report"
  | "requirements_document"
  | "adr_draft"
  | "task_breakdown"
  | "article_draft"
  | "context_pack";

export type RecentContextSource = "conversation-summary";

export type ContextValidationSeverity = "error" | "warning" | "info";

export type ContextBuildErrorCode =
  | "request_shape_invalid"
  | "mixed_request_input_not_allowed"
  | "project_code_required"
  | "project_not_found"
  | "project_inactive"
  | "agent_code_required"
  | "agent_not_found"
  | "agent_project_not_supported"
  | "agent_inactive"
  | "task_request_required"
  | "task_request_too_short"
  | "unknown_output_type"
  | "invalid_additional_source_path"
  | "additional_source_not_found"
  | "additional_source_not_allowed"
  | "additional_source_status_warning"
  | "unsupported_recent_context_source"
  | "invalid_recent_context_option"
  | "invalid_session_context_option"
  | "invalid_token_budget"
  | "token_budget_exceeded"
  | "session_context_conflict"
  | "recent_context_conflict"
  | "conversation_summary_conflict"
  | "recent_context_internal_conflict";

export interface ContextBuildRequest {
  projectCode: ProjectCode;
  agentCode: AgentCode;
  taskRequest: string;
  outputType?: ContextBuildOutputType;
  additionalSources?: ContextAdditionalSourceRequest[];
  sessionContext?: ContextSessionRequest;
  recentContext?: RecentContextRequest;
  tokenBudget?: ContextTokenBudget;
  buildMode?: ContextBuildMode;

  /**
   * Normally the Project Registry policy is used.
   * This override should be limited to debug or explicit review scenarios.
   */
  sourceStatusPolicyOverride?: SourceStatusPolicyId;
}

export interface RawContextBuildRequest {
  context_build_request: {
    project_code: ProjectCode;
    agent_code: AgentCode;
    task_request: string;
    output_type?: ContextBuildOutputType | string;
    additional_sources?: string[];
    session_context?: RawContextSessionRequest;
    recent_context?: RawRecentContextRequest;
    token_budget?: RawContextTokenBudget;
    build_mode?: ContextBuildMode | string;
    source_status_policy_override?: SourceStatusPolicyId | string;
  };
}

export interface ContextAdditionalSourceRequest {
  /** Repository-root relative path. Absolute paths and parent traversal are prohibited. */
  path: string;

  /** Optional purpose supplied by caller. Builder may infer this when omitted. */
  purpose?: string;
}

export interface ContextSessionRequest {
  include: boolean;
  notes?: string[];
  reviewViewpoints?: string[];
  temporaryConstraints?: string[];
}

export interface RawContextSessionRequest {
  include?: boolean;
  notes?: string[];
  review_viewpoints?: string[];
  temporary_constraints?: string[];
}

export interface RecentContextRequest {
  include: boolean;
  source?: RecentContextSource;
  maxItems?: number;
  maxAgeDays?: number;
  includeResolved?: boolean;
  includeArchived?: boolean;
}

export interface RawRecentContextRequest {
  include?: boolean;
  source?: RecentContextSource | string;
  max_items?: number;
  max_age_days?: number;
  include_resolved?: boolean;
  include_archived?: boolean;
}

export interface ContextTokenBudget {
  maxTokens?: number;
  reserveTokensForResponse?: number;
  truncationStrategy?: ContextTruncationStrategy;
}

export interface RawContextTokenBudget {
  max_tokens?: number;
  reserve_tokens_for_response?: number;
  truncation_strategy?: ContextTruncationStrategy | string;
}

export type ContextTruncationStrategy =
  | "priority_based"
  | "required_context_first"
  | "summarize_low_priority"
  | "fail_on_exceed";

export interface ContextBuildCliArgs {
  project?: string;
  agent?: string;
  task?: string;
  output?: string;
  source?: string[];
  sessionNote?: string[];
  reviewViewpoint?: string[];
  recent?: string;
  noRecent?: boolean;
  maxTokens?: number;
  buildMode?: string;
  request?: string;
}

export interface NormalizedContextBuildInput {
  request: ContextBuildRequest;
  inputSource: "cli" | "request_file" | "programmatic";
}

export interface ContextBuildValidationResult {
  ok: boolean;
  errors: ContextBuildValidationIssue[];
  warnings: ContextBuildValidationIssue[];
  infos?: ContextBuildValidationIssue[];
}

export interface ContextBuildValidationIssue {
  code: ContextBuildErrorCode;
  severity: ContextValidationSeverity;
  message: string;
  field?: string;
  value?: unknown;
  path?: string;
  projectCode?: ProjectCode;
  agentCode?: AgentCode;
  sourceId?: string;
}

export interface ResolvedContextBuildRequest {
  request: ContextBuildRequest;
  projectCode: ProjectCode;
  agentCode: AgentCode;
  outputContractId: OutputContractId;
  buildMode: ContextBuildMode;
  sourceStatusPolicyId: SourceStatusPolicyId;
  selectedSources: ContextSourceSelection[];
  sessionContext: ContextSessionRequest;
  recentContext: RecentContextRequest;
  tokenBudget: Required<ContextTokenBudget>;
  validation: ContextBuildValidationResult;
}

export interface ContextSourceSelection {
  sourceId: string;
  path: string;
  sourceType: SourceGroupType | "recent_context" | "session_context";
  sourceGroup?: string;
  status: SourceStatus;
  inclusionReason: ContextSourceInclusionReason;
  handling: ContextSourceHandling;
  includedSection?: string;
  purpose?: string;
}

export type ContextSourceInclusionReason =
  | "agent_required_context"
  | "agent_optional_context"
  | "project_registry_candidate"
  | "task_request_match"
  | "additional_source"
  | "session_context"
  | "recent_context"
  | "build_rule";

export type ContextSourceHandling =
  | "include"
  | "include_with_warning"
  | "reference_only"
  | "summarize"
  | "exclude";

export interface ContextBuildReport {
  ok: boolean;
  projectCode?: ProjectCode;
  agentCode?: AgentCode;
  outputType?: ContextBuildOutputType;
  outputContractId?: OutputContractId;
  buildMode?: ContextBuildMode;
  sourceStatusPolicyId?: SourceStatusPolicyId;
  validation: ContextBuildValidationResult;
  includedSources: ContextSourceSelection[];
  excludedSources: ContextSourceSelection[];
  warnings: ContextBuildValidationIssue[];
  errors: ContextBuildValidationIssue[];
  tokenEstimate?: ContextTokenEstimate;
  generationResult: "success" | "warning" | "failed";
}

export interface ContextTokenEstimate {
  estimatedInputTokens: number;
  maxTokens: number;
  exceeded: boolean;
  handling: "none" | "summarized" | "excluded" | "failed";
}

export function toContextBuildRequestFromCli(
  args: ContextBuildCliArgs,
): ContextBuildRequest {
  if (args.request) {
    throw new Error(
      "Request file loading must be handled before CLI argument normalization.",
    );
  }

  return {
    projectCode: args.project ?? "",
    agentCode: args.agent ?? "",
    taskRequest: args.task ?? "",
    outputType: args.output as ContextBuildOutputType | undefined,
    additionalSources: (args.source ?? []).map((sourcePath) => ({ path: sourcePath })),
    sessionContext: {
      include: Boolean(args.sessionNote?.length || args.reviewViewpoint?.length),
      notes: args.sessionNote ?? [],
      reviewViewpoints: args.reviewViewpoint ?? [],
    },
    recentContext: {
      include: args.noRecent ? false : Boolean(args.recent),
      source: args.recent as RecentContextSource | undefined,
    },
    tokenBudget: {
      maxTokens: args.maxTokens,
      truncationStrategy: "priority_based",
    },
    buildMode: (args.buildMode as ContextBuildMode | undefined) ?? "standard",
  };
}

export function toContextBuildRequestFromRaw(
  raw: RawContextBuildRequest,
): ContextBuildRequest {
  const input = raw.context_build_request;

  return {
    projectCode: input.project_code,
    agentCode: input.agent_code,
    taskRequest: input.task_request,
    outputType: input.output_type as ContextBuildOutputType | undefined,
    additionalSources: (input.additional_sources ?? []).map((sourcePath) => ({
      path: sourcePath,
    })),
    sessionContext: {
      include: input.session_context?.include ?? false,
      notes: input.session_context?.notes ?? [],
      reviewViewpoints: input.session_context?.review_viewpoints ?? [],
      temporaryConstraints: input.session_context?.temporary_constraints ?? [],
    },
    recentContext: {
      include: input.recent_context?.include ?? false,
      source: input.recent_context?.source as RecentContextSource | undefined,
      maxItems: input.recent_context?.max_items,
      maxAgeDays: input.recent_context?.max_age_days,
      includeResolved: input.recent_context?.include_resolved,
      includeArchived: input.recent_context?.include_archived,
    },
    tokenBudget: {
      maxTokens: input.token_budget?.max_tokens,
      reserveTokensForResponse: input.token_budget?.reserve_tokens_for_response,
      truncationStrategy: input.token_budget?.truncation_strategy as
        | ContextTruncationStrategy
        | undefined,
    },
    buildMode: (input.build_mode as ContextBuildMode | undefined) ?? "standard",
    sourceStatusPolicyOverride: input.source_status_policy_override as
      | SourceStatusPolicyId
      | undefined,
  };
}
