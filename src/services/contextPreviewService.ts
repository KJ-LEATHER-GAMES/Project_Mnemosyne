import fs from "node:fs";
import path from "node:path";

import type {
  ContextBuildReport,
  ContextBuildValidationIssue,
  ContextSourceSelection,
  ContextTokenEstimate,
} from "../types/context";
import type { AgentContextRequirement, SourceStatus } from "../types/registry";

export interface ContextPreviewInput {
  projectCode: string;
  projectName?: string;
  agentCode: string;
  agentName?: string;
  taskRequest: string;
  outputType: string;
  buildMode: string;
  contextPackPath: string;
  buildReportPath: string;
  contextPreviewPath?: string;
  report: ContextBuildReport;
  agentRequiredContext?: AgentContextRequirement[];
}

export interface ContextPreviewOutput {
  contextPreviewPath: string;
  contextPreviewMarkdown: string;
  reviewRecommendation: ContextPreviewReviewRecommendation;
}

export type ContextPreviewReviewRecommendation =
  | "ready_for_human_review"
  | "review_required_warnings_present"
  | "blocked_errors_present";

export interface ContextPreviewCoverageRow {
  requiredContext: string;
  coverageStatus: "covered" | "partial" | "missing" | "not_applicable" | "unknown";
  matchedSources: string[];
  note: string;
}

export interface SourceStatusMixRow {
  status: SourceStatus;
  includedCount: number;
  excludedCount: number;
  reviewNote: string;
}

const SOURCE_STATUSES: SourceStatus[] = [
  "active",
  "accepted",
  "draft",
  "proposed",
  "archived",
  "deprecated",
  "superseded",
  "unknown",
];

const NON_FINAL_STATUSES = new Set<SourceStatus>([
  "draft",
  "proposed",
  "archived",
  "deprecated",
  "superseded",
  "unknown",
]);

/**
 * Creates a human-readable Context Preview from a Context Build Report.
 *
 * Context Preview is not the Context Pack body. It is a pre-flight review artifact
 * for checking warnings, source status mix, token estimate, and agent context coverage.
 */
export async function createContextPreview(input: ContextPreviewInput): Promise<ContextPreviewOutput> {
  const contextPreviewPath =
    input.contextPreviewPath ??
    path.join("dist/context", input.projectCode, input.agentCode, "context-preview.md");

  const reviewRecommendation = getReviewRecommendation(input.report);
  const contextPreviewMarkdown = renderContextPreviewMarkdown({
    ...input,
    contextPreviewPath,
    reviewRecommendation,
  });

  await fs.promises.mkdir(path.dirname(contextPreviewPath), { recursive: true });
  await fs.promises.writeFile(contextPreviewPath, contextPreviewMarkdown, "utf8");

  return {
    contextPreviewPath,
    contextPreviewMarkdown,
    reviewRecommendation,
  };
}

export function renderContextPreviewMarkdown(
  input: ContextPreviewInput & {
    contextPreviewPath: string;
    reviewRecommendation: ContextPreviewReviewRecommendation;
  },
): string {
  const generatedAt = new Date().toISOString();
  const warningIssues = input.report.warnings ?? [];
  const errorIssues = input.report.errors ?? [];
  const conflictCount = warningIssues.filter(isConflictIssue).length;
  const missingRequiredSourceCount = [...warningIssues, ...errorIssues].filter(
    (issue) => issue.code === "missing_required_doc",
  ).length;
  const sourceStatusMix = getSourceStatusMix(
    input.report.includedSources ?? [],
    input.report.excludedSources ?? [],
  );
  const coverageRows = getAgentContextCoverageRows(
    input.agentRequiredContext ?? [],
    input.report.includedSources ?? [],
  );
  const coverage = getSourceCoverage(input.report);

  return [
    "# Context Preview",
    "",
    "> This Context Preview is a generated human-review artifact.",
    "> It is not the source of truth.",
    "> It is not intended to be used as the AI input body.",
    "> Review the warnings, source status mix, coverage, and trace information before using the Context Pack.",
    "",
    "---",
    "",
    "## 1. Preview Summary",
    "",
    table([
      ["Item", "Value"],
      ["Generated At", generatedAt],
      ["Project Code", input.projectCode],
      ["Project Name", input.projectName ?? ""],
      ["Agent Code", input.agentCode],
      ["Agent Name", input.agentName ?? ""],
      ["Task Request", input.taskRequest],
      ["Output Type", input.outputType],
      ["Build Mode", input.buildMode],
      ["Generation Result", input.report.generationResult],
      ["Review Recommendation", input.reviewRecommendation],
    ]),
    "",
    "---",
    "",
    "## 2. Human Review Checklist",
    "",
    renderChecklist(input.report, coverageRows),
    "",
    "---",
    "",
    "## 3. Build Result",
    "",
    table([
      ["Item", "Value"],
      ["OK", String(input.report.ok)],
      ["Warning Count", String(warningIssues.length)],
      ["Error Count", String(errorIssues.length)],
      ["Conflict Count", String(conflictCount)],
      ["Missing Required Source Count", String(missingRequiredSourceCount)],
    ]),
    "",
    "---",
    "",
    "## 4. Output Artifacts",
    "",
    table([
      ["Artifact", "Path"],
      ["Context Pack", input.contextPackPath],
      ["Build Report", input.buildReportPath],
      ["Context Preview", input.contextPreviewPath],
    ]),
    "",
    "---",
    "",
    "## 5. Warning Summary",
    "",
    renderIssues(warningIssues),
    "",
    "---",
    "",
    "## 6. Source Status Mix",
    "",
    table([
      ["Status", "Included Count", "Excluded Count", "Review Note"],
      ...sourceStatusMix.map((row) => [
        row.status,
        String(row.includedCount),
        String(row.excludedCount),
        row.reviewNote,
      ]),
    ]),
    "",
    "---",
    "",
    "## 7. Agent Context Coverage",
    "",
    renderAgentContextCoverage(coverageRows),
    "",
    "---",
    "",
    "## 8. Source Coverage",
    "",
    table([
      ["Item", "Value"],
      ["Included Source Count", String(coverage.includedSourceCount)],
      ["Excluded Source Count", String(coverage.excludedSourceCount)],
      ["Warning Source Count", String(coverage.warningSourceCount)],
      ["Required Doc Count", String(coverage.requiredDocCount)],
      ["Missing Required Doc Count", String(coverage.missingRequiredDocCount)],
      ["Active or Accepted Source Count", String(coverage.activeOrAcceptedCount)],
      ["Non-Final Evidence Source Count", String(coverage.nonFinalEvidenceCount)],
    ]),
    "",
    "---",
    "",
    "## 9. Token Estimate",
    "",
    renderTokenEstimate(input.report.tokenEstimate),
    "",
    "---",
    "",
    "## 10. Context Pack and Build Report Trace",
    "",
    table([
      ["Trace Item", "Value"],
      ["Context Pack Path", input.contextPackPath],
      ["Build Report Path", input.buildReportPath],
      ["Context Preview Path", input.contextPreviewPath],
      ["Source ID Shared With Context Pack", "yes"],
      ["Source ID Shared With Build Report", "yes"],
      ["Warning Code Shared With Build Report", "yes"],
    ]),
    "",
    "---",
    "",
    "## 11. Included Source List",
    "",
    renderIncludedSources(input.report.includedSources ?? []),
    "",
    "---",
    "",
    "## 12. Excluded Source List",
    "",
    renderExcludedSources(input.report.excludedSources ?? []),
    "",
    "---",
    "",
    "## 13. Review Decision",
    "",
    table([
      ["Item", "Value"],
      ["Human Reviewed", "no"],
      ["Approved for AI Input", "pending"],
      ["Reviewer", ""],
      ["Reviewed At", ""],
      ["Notes", ""],
    ]),
    "",
    "---",
    "",
    "## End of Context Preview",
    "",
  ].join("\n");
}

function getReviewRecommendation(report: ContextBuildReport): ContextPreviewReviewRecommendation {
  if ((report.errors ?? []).length > 0 || report.generationResult === "failed") {
    return "blocked_errors_present";
  }

  if ((report.warnings ?? []).length > 0 || report.generationResult === "warning") {
    return "review_required_warnings_present";
  }

  return "ready_for_human_review";
}

function getSourceStatusMix(
  includedSources: ContextSourceSelection[],
  excludedSources: ContextSourceSelection[],
): SourceStatusMixRow[] {
  return SOURCE_STATUSES.map((status) => {
    const includedCount = includedSources.filter((source) => source.status === status).length;
    const excludedCount = excludedSources.filter((source) => source.status === status).length;

    return {
      status,
      includedCount,
      excludedCount,
      reviewNote: getStatusReviewNote(status, includedCount),
    };
  });
}

function getStatusReviewNote(status: SourceStatus, includedCount: number): string {
  if (includedCount === 0) {
    return "none included";
  }

  if (status === "active" || status === "accepted") {
    return "normal evidence";
  }

  return "human review required; do not treat as final evidence";
}

function getAgentContextCoverageRows(
  requiredContext: AgentContextRequirement[] | undefined,
  includedSources: ContextSourceSelection[],
): ContextPreviewCoverageRow[] {
  if (requiredContext === undefined) {
    return [
      {
        requiredContext: "Agent required_context not provided to preview service",
        coverageStatus: "unknown",
        matchedSources: [],
        note: "Pass Agent Registry required_context to calculate deterministic coverage.",
      },
    ];
  }

  if (requiredContext.length === 0) {
    return [
      {
        requiredContext: "No required context declared for this agent",
        coverageStatus: "not_applicable",
        matchedSources: [],
        note: "Agent Registry required_context is empty.",
      },
    ];
  }

  return requiredContext.map((requirement) => {
    const matchedSources = includedSources.filter((source) =>
      sourceMatchesRequirement(source, requirement),
    );

    if (matchedSources.length === 0) {
      return {
        requiredContext: requirement.context_id,
        coverageStatus: "missing",
        matchedSources: [],
        note: buildRequirementNote(requirement, "No included source satisfied all requirement selectors."),
      };
    }

    const hasWarningOrReferenceOnly = matchedSources.some(
      (source) =>
        source.handling !== "include" || NON_FINAL_STATUSES.has(source.status),
    );

    return {
      requiredContext: requirement.context_id,
      coverageStatus: hasWarningOrReferenceOnly ? "partial" : "covered",
      matchedSources: matchedSources.map((source) => source.sourceId),
      note: buildRequirementNote(
        requirement,
        hasWarningOrReferenceOnly
          ? "Matched, but at least one source is warning/reference/summarized or non-final evidence."
          : "Matched by Agent Registry requirement selectors.",
      ),
    };
  });
}

function sourceMatchesRequirement(
  source: ContextSourceSelection,
  requirement: AgentContextRequirement,
): boolean {
  if (source.sourceType !== requirement.source_type) {
    return false;
  }

  if (
    requirement.source_group &&
    normalize(source.sourceGroup ?? "") !== normalize(requirement.source_group)
  ) {
    return false;
  }

  const requiredDocumentNames = requirement.document_names ?? [];
  if (
    requiredDocumentNames.length > 0 &&
    !requiredDocumentNames.some((documentName) => sourceMatchesDocumentName(source, documentName))
  ) {
    return false;
  }

  const requiredPaths = requirement.paths ?? [];
  if (
    requiredPaths.length > 0 &&
    !requiredPaths.some((requiredPath) => pathsMatch(source.path, requiredPath))
  ) {
    return false;
  }

  return true;
}

function sourceMatchesDocumentName(
  source: ContextSourceSelection,
  documentName: string,
): boolean {
  const expected = normalizePathValue(documentName);
  const sourcePath = normalizePathValue(source.path);
  const sourceDocumentId = normalizePathValue(source.documentId ?? "");

  return (
    path.posix.basename(sourcePath) === path.posix.basename(expected) ||
    path.posix.basename(sourceDocumentId) === path.posix.basename(expected)
  );
}

function pathsMatch(sourcePath: string, requiredPath: string): boolean {
  const actual = normalizePathValue(sourcePath);
  const expected = normalizePathValue(requiredPath);

  return actual === expected || actual.endsWith(`/${expected}`);
}

function normalizePathValue(value: string): string {
  return value.trim().replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase();
}

function buildRequirementNote(
  requirement: AgentContextRequirement,
  resultNote: string,
): string {
  const selectors = [
    `source_type=${requirement.source_type}`,
    requirement.source_group ? `source_group=${requirement.source_group}` : undefined,
    requirement.document_names?.length
      ? `document_names=${requirement.document_names.join(",")}`
      : undefined,
    requirement.paths?.length ? `paths=${requirement.paths.join(",")}` : undefined,
  ].filter(Boolean);

  return `${resultNote} Selectors: ${selectors.join("; ")}. Purpose: ${requirement.purpose}`;
}

function getSourceCoverage(report: ContextBuildReport): {
  includedSourceCount: number;
  excludedSourceCount: number;
  warningSourceCount: number;
  requiredDocCount: number;
  missingRequiredDocCount: number;
  activeOrAcceptedCount: number;
  nonFinalEvidenceCount: number;
} {
  const includedSources = report.includedSources ?? [];
  const excludedSources = report.excludedSources ?? [];
  const requiredDocs = report.requiredDocsCheck?.required_docs ?? [];
  const missingDocs = report.requiredDocsCheck?.missing_docs ?? [];

  return {
    includedSourceCount: includedSources.length,
    excludedSourceCount: excludedSources.length,
    warningSourceCount: includedSources.filter(
      (source) => source.handling !== "include" || NON_FINAL_STATUSES.has(source.status),
    ).length,
    requiredDocCount: requiredDocs.length,
    missingRequiredDocCount: missingDocs.length,
    activeOrAcceptedCount: includedSources.filter(
      (source) => source.status === "active" || source.status === "accepted",
    ).length,
    nonFinalEvidenceCount: includedSources.filter((source) => NON_FINAL_STATUSES.has(source.status))
      .length,
  };
}

function renderChecklist(
  report: ContextBuildReport,
  coverageRows: ContextPreviewCoverageRow[],
): string {
  const errors = report.errors ?? [];
  const warnings = report.warnings ?? [];
  const conflicts = warnings.filter(isConflictIssue);
  const nonFinalEvidenceSources = (report.includedSources ?? []).filter((source) =>
    NON_FINAL_STATUSES.has(source.status),
  );
  const tokenExceeded = report.tokenEstimate?.exceeded ?? false;
  const incompleteCoverage = coverageRows.filter(
    (row) =>
      row.coverageStatus === "missing" ||
      row.coverageStatus === "partial" ||
      row.coverageStatus === "unknown",
  );

  return table([
    ["Check", "Status", "Note"],
    ["No build errors", errors.length === 0 ? "ok" : "ng", `${errors.length} error(s)`],
    [
      "Required memory docs exist",
      report.requiredDocsCheck?.standard_docs_satisfied ? "ok" : "review",
      report.requiredDocsCheck
        ? `${report.requiredDocsCheck.missing_docs.length} missing required doc(s)`
        : "required docs check not available",
    ],
    [
      "Agent required context is covered",
      incompleteCoverage.length === 0 ? "ok" : "review",
      `${incompleteCoverage.length} incomplete required context item(s)`,
    ],
    ["No conflict warnings", conflicts.length === 0 ? "ok" : "review", `${conflicts.length} conflict warning(s)`],
    [
      "Non-final evidence is acceptable",
      nonFinalEvidenceSources.length === 0 ? "ok" : "review",
      `${nonFinalEvidenceSources.length} non-final evidence source(s) included`,
    ],
    [
      "Token estimate is within budget",
      tokenExceeded ? "review" : "ok",
      report.tokenEstimate
        ? `estimated=${report.tokenEstimate.estimatedInputTokens}, max=${report.tokenEstimate.maxTokens}`
        : "token estimate not available",
    ],
    ["Context Pack and Build Report paths are traceable", "ok", "source_id and warning code are shared"],
  ]);
}

function renderAgentContextCoverage(rows: ContextPreviewCoverageRow[]): string {
  return table([
    ["Required Context", "Coverage Status", "Matched Sources", "Note"],
    ...rows.map((row) => [
      row.requiredContext,
      row.coverageStatus,
      row.matchedSources.join(", "),
      row.note,
    ]),
  ]);
}

function renderIssues(issues: ContextBuildValidationIssue[]): string {
  if (issues.length === 0) {
    return "No warnings.";
  }

  return table([
    ["Code", "Severity", "Source ID", "Path", "Message"],
    ...issues.map((issue) => [
      issue.code,
      issue.severity,
      issue.sourceId ?? "",
      issue.path ?? "",
      issue.message,
    ]),
  ]);
}

function renderTokenEstimate(tokenEstimate?: ContextTokenEstimate): string {
  if (!tokenEstimate) {
    return "Not estimated.";
  }

  return table([
    ["Item", "Value"],
    ["Estimated Input Tokens", String(tokenEstimate.estimatedInputTokens)],
    ["Max Tokens", String(tokenEstimate.maxTokens)],
    ["Reserve Tokens For Response", "not available in ContextBuildReport"],
    ["Exceeded", String(tokenEstimate.exceeded)],
    ["Handling", tokenEstimate.handling],
    ["Approximate", String(tokenEstimate.approximate)],
    ["Note", tokenEstimate.note ?? "Approximate estimate."],
  ]);
}

function renderIncludedSources(sources: ContextSourceSelection[]): string {
  if (sources.length === 0) {
    return "No included sources.";
  }

  return table([
    ["Source ID", "Path", "Status", "Source Type", "Included Section", "Handling", "Purpose"],
    ...sources.map((source) => [
      source.sourceId,
      source.path,
      source.status,
      source.sourceType,
      source.includedSection ?? "",
      source.handling,
      source.purpose ?? "",
    ]),
  ]);
}

function renderExcludedSources(sources: ContextSourceSelection[]): string {
  if (sources.length === 0) {
    return "No excluded sources.";
  }

  return table([
    ["Source ID", "Path", "Status", "Source Type", "Reason", "Handling"],
    ...sources.map((source) => [
      source.sourceId,
      source.path,
      source.status,
      source.sourceType,
      source.selectionReason ?? source.purpose ?? "",
      source.handling,
    ]),
  ]);
}

function isConflictIssue(issue: ContextBuildValidationIssue): boolean {
  return String(issue.code).includes("conflict");
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_./-]/g, "");
}

function table(rows: string[][]): string {
  if (rows.length === 0) {
    return "";
  }

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
