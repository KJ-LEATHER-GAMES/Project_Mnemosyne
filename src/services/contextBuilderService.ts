import fs from "node:fs";
import path from "node:path";

import { resolveAgentRegistry } from "./agentRegistryService";
import {
  createContextBuildReport,
  renderBuildReportMarkdown,
  renderBuildReportSummary,
} from "./buildReportService";
import { resolveProjectRegistry } from "./projectRegistryService";
import { resolveContextSources, type ResolvedSourceContent } from "./sourceResolverService";
import type {
  ContextBuildMode,
  ContextBuildReport,
  ContextBuildRequest,
  ContextBuildValidationIssue,
  ContextTokenEstimate,
} from "../types/context";
import { createContextPreview } from "./contextPreviewService";
import type { OutputContractId } from "../types/registry";

export interface ContextBuildOutput {
  contextPackPath: string;
  buildReportPath: string;
  contextPreviewPath: string;
  contextPackMarkdown: string;
  buildReportMarkdown: string;
  contextPreviewMarkdown: string;
  report: ContextBuildReport;
}

const BUILDER_NAME = "mnemosyne-context-builder";
const BUILDER_VERSION = "0.1.0-draft";
const DEFAULT_MAX_TOKENS = 24000;
const DEFAULT_RESERVE_TOKENS = 4000;
const UNSUPPORTED_M2_5_FEATURES = [
  "Recent Context loader is a placeholder. Conversation Summary files are not loaded yet.",
  "Semantic conflict detection is not implemented. Only structural warnings are generated.",
  "Token estimate is approximate and uses character count / 4.",
];

export async function buildContextPack(input: {
  request: ContextBuildRequest;
  projectRegistryPath?: string;
  agentRegistryPath?: string;
  outputRoot?: string;
}): Promise<ContextBuildOutput> {
  const validationErrors = validateMinimalRequest(input.request);
  if (validationErrors.length > 0) {
    const report = createContextBuildReport({
      projectCode: input.request.projectCode,
      agentCode: input.request.agentCode,
      outputType: input.request.outputType ?? "context_pack",
      buildMode: input.request.buildMode ?? "standard",
      sourceStatusPolicyId: "active_preferred",
      includedSources: [],
      excludedSources: [],
      warnings: [],
      errors: validationErrors,
      unsupportedFeatures: UNSUPPORTED_M2_5_FEATURES,
    });
    const buildReportMarkdown = renderBuildReportMarkdown(report);
    return {
      contextPackPath: "",
      buildReportPath: "",
      contextPreviewPath: "",
      contextPackMarkdown: "",
      buildReportMarkdown,
      contextPreviewMarkdown: "",
      report,
    };
  }

  const resolvedProject = await resolveProjectRegistry({
    projectCode: input.request.projectCode,
    registryPath: input.projectRegistryPath,
  });
  const resolvedAgent = await resolveAgentRegistry({
    agentCode: input.request.agentCode,
    projectCode: input.request.projectCode,
    registryPath: input.agentRegistryPath,
  });

  const outputType = input.request.outputType ?? resolvedAgent.output_contract.output_contract_id;
  const outputContractId =
    outputType === "context_pack" ? undefined : (outputType as OutputContractId);
  const buildMode: ContextBuildMode = input.request.buildMode ?? "standard";
  const tokenBudget = {
    maxTokens: input.request.tokenBudget?.maxTokens ?? DEFAULT_MAX_TOKENS,
    reserveTokensForResponse:
      input.request.tokenBudget?.reserveTokensForResponse ?? DEFAULT_RESERVE_TOKENS,
    truncationStrategy: input.request.tokenBudget?.truncationStrategy ?? "priority_based",
  };

  const resolution = await resolveContextSources({
    project: resolvedProject.project,
    agent: resolvedAgent.agent,
    sourceStatusPolicy: resolvedProject.source_status_policy,
    requiredDocsCheck: resolvedProject.required_docs_check,
    taskRequest: input.request.taskRequest,
    additionalSources: input.request.additionalSources,
    sessionContext: input.request.sessionContext ?? { include: false },
    recentContext: input.request.recentContext ?? { include: false },
  });

  const tokenEstimate = estimateTokens(resolution.includedSources, tokenBudget.maxTokens);
  const warnings = [...resolution.warnings];
  if (tokenEstimate.exceeded) {
    warnings.push({
      code: "token_budget_exceeded",
      severity: "warning",
      message: `Estimated input tokens exceed maxTokens: estimated=${tokenEstimate.estimatedInputTokens}, max=${tokenEstimate.maxTokens}`,
    });
  }

  const report = createContextBuildReport({
    projectCode: resolvedProject.project.project_code,
    agentCode: resolvedAgent.agent.agent_code,
    outputType,
    outputContractId,
    buildMode,
    sourceStatusPolicyId: resolvedProject.source_status_policy.policy_id,
    includedSources: resolution.includedSources,
    excludedSources: resolution.excludedSources,
    warnings,
    errors: [...resolution.errors],
    tokenEstimate,
    requiredDocsCheck: resolvedProject.required_docs_check,
    unsupportedFeatures: UNSUPPORTED_M2_5_FEATURES,
  });

  const outputRoot = input.outputRoot ?? "dist/context";
  const outputDirectory = path.join(
    outputRoot,
    resolvedProject.project.project_code,
    resolvedAgent.agent.agent_code,
  );
  const contextPackPath = path.join(outputDirectory, "context-pack.md");
  const buildReportPath = path.join(outputDirectory, "build-report.md");
  const contextPreviewPath = path.join(outputDirectory, "context-preview.md");

  const contextPackMarkdown = renderContextPackMarkdown({
    request: input.request,
    projectName: resolvedProject.project.project_name,
    projectCurrentPhase: resolvedProject.project.current_phase,
    agentName: resolvedAgent.agent.agent_name,
    agentRole: resolvedAgent.agent.role,
    agentResponsibilities: resolvedAgent.agent.responsibilities,
    agentOutOfScope: resolvedAgent.agent.out_of_scope,
    agentAllowedOperations: resolvedAgent.agent.allowed_operations,
    agentForbiddenOperations: resolvedAgent.agent.forbidden_operations,
    outputContractDescription: resolvedAgent.output_contract.description,
    outputContractSections: resolvedAgent.output_contract.required_sections,
    outputContractAdditionalRequirements: resolvedAgent.output_contract.additional_requirements,
    outputType,
    buildMode,
    sourceStatusPolicyId: resolvedProject.source_status_policy.policy_id,
    tokenBudget,
    writePolicyAiCan: resolvedProject.write_policy.ai_can,
    writePolicyAiMustNot: resolvedProject.write_policy.ai_must_not,
    writePolicyHumanApprovalRequiredFor: resolvedProject.write_policy.human_approval_required_for,
    sources: resolution.includedSources,
    excludedSources: resolution.excludedSources,
    warnings,
    report,
    detailedBuildReportPath: buildReportPath,
  });

  const buildReportMarkdown = renderBuildReportMarkdown(report);

  await fs.promises.mkdir(outputDirectory, { recursive: true });
  await fs.promises.writeFile(contextPackPath, contextPackMarkdown, "utf8");
  await fs.promises.writeFile(buildReportPath, buildReportMarkdown, "utf8");

  const contextPreviewOutput = await createContextPreview({
    projectCode: resolvedProject.project.project_code,
    projectName: resolvedProject.project.project_name,
    agentCode: resolvedAgent.agent.agent_code,
    agentName: resolvedAgent.agent.agent_name,
    taskRequest: input.request.taskRequest,
    outputType,
    buildMode,
    contextPackPath,
    buildReportPath,
    contextPreviewPath,
    report,
    agentRequiredContext: resolvedAgent.agent.required_context,
  });
  const contextPreviewMarkdown = contextPreviewOutput.contextPreviewMarkdown;

  return {
    contextPackPath,
    buildReportPath,
    contextPreviewPath,
    contextPackMarkdown,
    buildReportMarkdown,
    contextPreviewMarkdown,
    report,
  };
}

function renderContextPackMarkdown(input: {
  request: ContextBuildRequest;
  projectName: string;
  projectCurrentPhase?: string;
  agentName: string;
  agentRole: string;
  agentResponsibilities: string[];
  agentOutOfScope: string[];
  agentAllowedOperations: string[];
  agentForbiddenOperations: string[];
  outputContractDescription?: string;
  outputContractSections: string[];
  outputContractAdditionalRequirements: string[];
  outputType: string;
  buildMode: ContextBuildMode;
  sourceStatusPolicyId: string;
  tokenBudget: { maxTokens: number; reserveTokensForResponse: number; truncationStrategy: string };
  writePolicyAiCan: string[];
  writePolicyAiMustNot: string[];
  writePolicyHumanApprovalRequiredFor: string[];
  sources: ResolvedSourceContent[];
  excludedSources: ResolvedSourceContent[];
  warnings: ContextBuildValidationIssue[];
  report: ContextBuildReport;
  detailedBuildReportPath: string;
}): string {
  const generatedAt = new Date().toISOString();

  return [
    "# Context Pack",
    "",
    "> This Context Pack is a generated artifact.",
    "> It is not the source of truth.",
    "> Active source documents take precedence over this generated file.",
    "",
    "## 1. Build Metadata",
    "",
    table([
      ["Item", "Value"],
      ["Context Pack Version", "1.0.0"],
      ["Generated At", generatedAt],
      ["Project Code", input.request.projectCode],
      ["Project Name", input.projectName],
      ["Agent Code", input.request.agentCode],
      ["Agent Name", input.agentName],
      ["Task Request", input.request.taskRequest],
      ["Output Type", input.outputType],
      ["Build Mode", input.buildMode],
      ["Source Status Policy", input.sourceStatusPolicyId],
      [
        "Token Budget",
        `${input.tokenBudget.maxTokens} max / ${input.tokenBudget.reserveTokensForResponse} reserve / ${input.tokenBudget.truncationStrategy} / estimate=approximate`,
      ],
      ["Builder Name", BUILDER_NAME],
      ["Builder Version", BUILDER_VERSION],
    ]),
    "",
    "## 2. Base Context",
    "",
    "- Context Pack is a generated artifact, not a source of truth.",
    "- Active / accepted source documents take precedence.",
    "- Draft, proposed, archived, deprecated, superseded, unknown, session, and recent context must not override Active sources.",
    "- AI outputs are draft/review/proposal artifacts unless human approval promotes them.",
    "",
    "## 3. Agent Context",
    "",
    "### 3.1 Agent Role",
    "",
    input.agentRole.trim(),
    "",
    "### 3.2 Responsibilities",
    "",
    bullet(input.agentResponsibilities),
    "",
    "### 3.3 Out of Scope",
    "",
    bullet(input.agentOutOfScope),
    "",
    "### 3.4 Required Context",
    "",
    summarizeSources(
      input.sources.filter((source) => source.inclusionReason === "agent_required_context"),
    ),
    "",
    "### 3.5 Allowed Operations",
    "",
    bullet(input.agentAllowedOperations),
    "",
    "### 3.6 Forbidden Operations",
    "",
    bullet(input.agentForbiddenOperations),
    "",
    "### 3.7 Output Contract",
    "",
    input.outputContractDescription ?? "No description.",
    "",
    "Required sections:",
    bullet(input.outputContractSections),
    "",
    "Additional requirements:",
    bullet(input.outputContractAdditionalRequirements),
    "",
    "## 4. Project Context",
    "",
    renderSectionSources(input.sources, "4. Project Context"),
    "",
    `Current phase: ${input.projectCurrentPhase ?? "Not specified."}`,
    "",
    "## 5. Current Status",
    "",
    renderSectionSources(input.sources, "5. Current Status"),
    "",
    "## 6. Active Decisions",
    "",
    renderSectionSources(input.sources, "6. Active Decisions"),
    "",
    "## 7. Next Actions",
    "",
    renderSectionSources(input.sources, "7. Next Actions"),
    "",
    "## 8. Session Context",
    "",
    renderSectionSources(input.sources, "8. Session Context"),
    "",
    "## 9. Recent Conversation Context",
    "",
    renderSectionSources(input.sources, "9. Recent Conversation Context"),
    "",
    "## 10. Task Context",
    "",
    `### 10.1 Objective\n\n${input.request.taskRequest}`,
    "",
    "### 10.2 Required Outputs",
    "",
    "- Generate Context Pack Markdown.",
    "- Generate detailed Build Report Markdown.",
    "- Preserve source traceability through Source List.",
    "",
    "### 10.3 Done Criteria",
    "",
    "- Context Pack is generated under dist/context/{project_code}/{agent_code}/context-pack.md.",
    "- Build Report is generated under dist/context/{project_code}/{agent_code}/build-report.md.",
    "- Missing required docs, excluded sources, and warnings are reported.",
    "",
    "## 11. Additional Sources",
    "",
    renderAdditionalSources(input.sources),
    "",
    "## 12. Constraints and Write Policy",
    "",
    "### 12.1 Allowed Outputs",
    "",
    bullet(input.writePolicyAiCan),
    "",
    "### 12.2 Forbidden Updates",
    "",
    bullet(input.writePolicyAiMustNot),
    "",
    "### 12.3 Human Approval Required",
    "",
    bullet(input.writePolicyHumanApprovalRequiredFor),
    "",
    "## 13. Warnings",
    "",
    renderWarnings(input.warnings),
    "",
    "## 14. Source List",
    "",
    renderSourceList(input.sources),
    "",
    "## 15. Build Report Summary",
    "",
    renderBuildReportSummary(input.report, input.detailedBuildReportPath),
    "",
    "## End of Context Pack",
    "",
  ].join("\n");
}

function validateMinimalRequest(request: ContextBuildRequest): ContextBuildValidationIssue[] {
  const errors: ContextBuildValidationIssue[] = [];
  if (!request.projectCode) {
    errors.push({
      code: "project_code_required",
      severity: "error",
      message: "projectCode is required.",
    });
  }
  if (!request.agentCode) {
    errors.push({
      code: "agent_code_required",
      severity: "error",
      message: "agentCode is required.",
    });
  }
  if (!request.taskRequest || request.taskRequest.trim().length < 3) {
    errors.push({
      code: "task_request_required",
      severity: "error",
      message: "taskRequest is required.",
    });
  }
  return errors;
}

function estimateTokens(sources: ResolvedSourceContent[], maxTokens: number): ContextTokenEstimate {
  const estimatedInputTokens = Math.ceil(
    sources.reduce((sum, source) => sum + (source.excerpt?.length ?? 0), 0) / 4,
  );
  return {
    estimatedInputTokens,
    maxTokens,
    exceeded: estimatedInputTokens > maxTokens,
    handling: estimatedInputTokens > maxTokens ? "excluded" : "none",
    approximate: true,
    note: "Approximate estimate using source excerpt character count / 4. Not tokenizer-based.",
  };
}

function renderSectionSources(sources: ResolvedSourceContent[], section: string): string {
  const sectionSources = sources.filter((source) => source.includedSection === section);
  if (sectionSources.length === 0) {
    return "No source selected for this section by M2-5 draft builder.";
  }

  return sectionSources.map((source) => renderSourceExcerpt(source)).join("\n\n---\n\n");
}

function renderAdditionalSources(sources: ResolvedSourceContent[]): string {
  const sectionSources = sources.filter(
    (source) =>
      source.includedSection === "11. Additional Sources" ||
      source.sourceType === "additional_source",
  );
  if (sectionSources.length === 0) {
    return "No additional sources selected.";
  }
  return sectionSources
    .map(
      (source, index) =>
        `### 11.${index + 1} ${source.title ?? source.path}\n\n${renderSourceMetadata(source)}\n\n#### Relevant Content\n\n${codeBlock(source.excerpt ?? "")}`,
    )
    .join("\n\n");
}

function renderSourceExcerpt(source: ResolvedSourceContent): string {
  return [
    `### ${source.title ?? source.path}`,
    "",
    renderSourceMetadata(source),
    "",
    codeBlock(source.excerpt ?? ""),
  ].join("\n");
}

function renderSourceMetadata(source: ResolvedSourceContent): string {
  return table([
    ["Item", "Value"],
    ["Source ID", source.sourceId],
    ["Path", source.path],
    ["Document ID", source.documentId ?? ""],
    ["Status", source.status],
    ["Source Type", source.sourceType],
    ["Handling", source.handling],
    ["Purpose", source.purpose ?? ""],
    ["Matched By", source.matchedBy ?? ""],
    ["Explicitly Requested", String(source.explicitlyRequested ?? false)],
    ["Selection Reason", source.selectionReason ?? ""],
  ]);
}

function summarizeSources(sources: ResolvedSourceContent[]): string {
  if (sources.length === 0) {
    return "No required context source selected.";
  }
  return sources
    .map((source) => `- ${source.sourceId}: ${source.path} (${source.status}, ${source.handling})`)
    .join("\n");
}

function renderWarnings(warnings: ContextBuildValidationIssue[]): string {
  if (warnings.length === 0) {
    return "No warnings.";
  }
  return table([
    ["Type", "Severity", "Source ID", "Message", "Handling"],
    ...warnings.map((warning) => [
      warning.code,
      warning.severity,
      warning.sourceId ?? "",
      warning.message,
      warning.path ?? "",
    ]),
  ]);
}

function renderSourceList(sources: ResolvedSourceContent[]): string {
  if (sources.length === 0) {
    return "No sources included.";
  }
  return table([
    [
      "Source ID",
      "Path",
      "Document ID",
      "Title",
      "Status",
      "Source Type",
      "Included Section",
      "Purpose",
      "Handling",
      "Matched By",
      "Explicitly Requested",
      "Selection Reason",
    ],
    ...sources.map((source) => [
      source.sourceId,
      source.path,
      source.documentId ?? "",
      source.title ?? "",
      source.status,
      source.sourceType,
      source.includedSection ?? "",
      source.purpose ?? "",
      source.handling,
      source.matchedBy ?? "",
      String(source.explicitlyRequested ?? false),
      source.selectionReason ?? "",
    ]),
  ]);
}

function bullet(values: string[]): string {
  return values.length === 0 ? "- None." : values.map((value) => `- ${value}`).join("\n");
}

function codeBlock(value: string): string {
  return `\`\`\`md\n${value.replace(/```/g, "` ` `")}\n\`\`\``;
}

function table(rows: string[][]): string {
  const [header, ...body] = rows;
  return [
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
    ...body.map((row) => `| ${row.map(escapeCell).join(" | ")} |`),
  ].join("\n");
}

function escapeCell(value: string): string {
  return String(value ?? "")
    .replace(/\n/g, "<br>")
    .replace(/\|/g, "\\|");
}
