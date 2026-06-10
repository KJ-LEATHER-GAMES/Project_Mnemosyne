import type {
  AgentCode,
  OutputContractId,
  ProjectCode,
  SourceGroupType,
  SourceStatus,
  SourceStatusPolicyId,
} from "./registry";

export type ContextBuildMode = "minimal" | "standard" | "full" | "debug";

/**
 * Context Build output selector.
 *
 * M2-4 Active rule:
 * - Most values are identical to Agent Registry OutputContractId.
 * - "context_pack" means Context Pack generation only and does not require an Agent output contract.
 */
export type ContextBuildOutputType = OutputContractId | "context_pack";

/** CLI compatibility alias. Normalized before validation / resolution. */
export type ContextBuildOutputAlias = "review_report";

export type RawContextBuildOutputType =
  | ContextBuildOutputType
  | ContextBuildOutputAlias
  | string;

export type RecentContextSource = "conversation-summary";

export type ContextValidationSeverity = "error" | "warning" | "info";

export type ContextBuildIssueCode =
  | "request_shape_invalid"
  | "mixed_request_input_not_allowed"
  | "source_status_policy_override_not_allowed"
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
  | "output_contract_not_supported_by_agent"
  | "missing_required_doc"
  | "invalid_additional_source_path"
  | "additional_source_not_found"
  | "additional_source_not_allowed"
  | "additional_source_status_warning"
  | "conflicting_recent_context_options"
  | "unsupported_recent_context_source"
  | "invalid_recent_context_option"
  | "recent_context_source_defaulted"
  | "invalid_session_context_option"
  | "session_context_auto_included"
  | "invalid_token_budget"
  | "token_budget_too_small"
  | "token_budget_reserve_exceeds_max"
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
}

export interface RawContextBuildRequest {
  context_build_request: {
    project_code: ProjectCode;
    agent_code: AgentCode;
    task_request: string;
    output_type?: RawContextBuildOutputType;
    additional_sources?: string[];
    session_context?: RawContextSessionRequest;
    recent_context?: RawRecentContextRequest;
    token_budget?: RawContextTokenBudget;
    build_mode?: ContextBuildMode | string;

    /**
     * M2-4 Active rule: prohibited.
     * Kept only so validation can detect and report a clear error.
     */
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
  /** Defaults to "conversation-summary" when include=true and source is omitted. */
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
  /** Recommended minimum is 1000. */
  maxTokens?: number;

  /** Must be >= 0 and less than maxTokens when maxTokens is provided. */
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

  /**
   * Supported forms:
   * - undefined: do not include Recent Context
   * - true: include Recent Context with default source "conversation-summary"
   * - "conversation-summary": include Recent Context from Conversation Summary
   */
  recent?: string | boolean;
  noRecent?: boolean;

  maxTokens?: number;
  reserveTokensForResponse?: number;
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
  code: ContextBuildIssueCode;
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
  /** "context_pack" when this build only generates a Context Pack. */
  outputType: ContextBuildOutputType;
  /** Undefined only when outputType is "context_pack". */
  outputContractId?: OutputContractId;
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

export function normalizeContextBuildOutputType(
  output?: string,
): ContextBuildOutputType | undefined {
  if (!output) {
    return undefined;
  }

  if (output === "review_report") {
    return "implementation_review_report";
  }

  return output as ContextBuildOutputType;
}

function hasSessionContextPayload(input?: RawContextSessionRequest): boolean {
  return Boolean(
    input?.notes?.length ||
      input?.review_viewpoints?.length ||
      input?.temporary_constraints?.length,
  );
}

function hasCliSessionContextPayload(args: ContextBuildCliArgs): boolean {
  return Boolean(args.sessionNote?.length || args.reviewViewpoint?.length);
}

function normalizeRecentContextFromCli(
  args: ContextBuildCliArgs,
): RecentContextRequest {
  if (args.recent !== undefined && args.noRecent) {
    throw new Error(
      "conflicting_recent_context_options: --recent and --no-recent cannot be used together.",
    );
  }

  if (args.noRecent) {
    return { include: false };
  }

  if (args.recent === undefined || args.recent === false) {
    return { include: false };
  }

  return {
    include: true,
    source:
      args.recent === true || args.recent === ""
        ? "conversation-summary"
        : (args.recent as RecentContextSource),
  };
}

function normalizeRecentContextFromRaw(
  input?: RawRecentContextRequest,
): RecentContextRequest {
  if (!input) {
    return { include: false };
  }

  const include = input.include ?? false;

  return {
    include,
    source:
      include && !input.source
        ? "conversation-summary"
        : (input.source as RecentContextSource | undefined),
    maxItems: input.max_items,
    maxAgeDays: input.max_age_days,
    includeResolved: input.include_resolved,
    includeArchived: input.include_archived,
  };
}

export function toContextBuildRequestFromCli(
  args: ContextBuildCliArgs,
): ContextBuildRequest {
  if (args.request) {
    throw new Error(
      "mixed_request_input_not_allowed: request file loading must be handled before CLI argument normalization.",
    );
  }

  const sessionPayloadExists = hasCliSessionContextPayload(args);

  return {
    projectCode: args.project ?? "",
    agentCode: args.agent ?? "",
    taskRequest: args.task ?? "",
    outputType: normalizeContextBuildOutputType(args.output),
    additionalSources: (args.source ?? []).map((sourcePath) => ({ path: sourcePath })),
    sessionContext: {
      include: sessionPayloadExists,
      notes: args.sessionNote ?? [],
      reviewViewpoints: args.reviewViewpoint ?? [],
    },
    recentContext: normalizeRecentContextFromCli(args),
    tokenBudget: {
      maxTokens: args.maxTokens,
      reserveTokensForResponse: args.reserveTokensForResponse,
      truncationStrategy: "priority_based",
    },
    buildMode: (args.buildMode as ContextBuildMode | undefined) ?? "standard",
  };
}

export function toContextBuildRequestFromRaw(
  raw: RawContextBuildRequest,
): ContextBuildRequest {
  const input = raw.context_build_request;
  const sessionPayloadExists = hasSessionContextPayload(input.session_context);

  return {
    projectCode: input.project_code,
    agentCode: input.agent_code,
    taskRequest: input.task_request,
    outputType: normalizeContextBuildOutputType(input.output_type),
    additionalSources: (input.additional_sources ?? []).map((sourcePath) => ({
      path: sourcePath,
    })),
    sessionContext: {
      include: input.session_context?.include ?? sessionPayloadExists,
      notes: input.session_context?.notes ?? [],
      reviewViewpoints: input.session_context?.review_viewpoints ?? [],
      temporaryConstraints: input.session_context?.temporary_constraints ?? [],
    },
    recentContext: normalizeRecentContextFromRaw(input.recent_context),
    tokenBudget: {
      maxTokens: input.token_budget?.max_tokens,
      reserveTokensForResponse: input.token_budget?.reserve_tokens_for_response,
      truncationStrategy: input.token_budget?.truncation_strategy as
        | ContextTruncationStrategy
        | undefined,
    },
    buildMode: (input.build_mode as ContextBuildMode | undefined) ?? "standard",
  };
}

/**
 * Placeholder signatures for M2-5+ implementation.
 * M2-4 defines request shape and normalization, not full validation / resolution.
 */
export type ValidateContextBuildRequest = (
  request: ContextBuildRequest,
) => Promise<ContextBuildValidationResult>;

export type ResolveContextBuildRequest = (
  request: ContextBuildRequest,
) => Promise<ResolvedContextBuildRequest>;
