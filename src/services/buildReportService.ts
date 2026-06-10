import type {
  ContextBuildReport,
  ContextBuildValidationIssue,
  ContextSourceSelection,
  ContextTokenEstimate,
} from "../types/context";
import type { RequiredMemoryDocsCheckResult, SourceStatusPolicyId } from "../types/registry";

export interface BuildReportMarkdownInput {
  projectCode: string;
  agentCode: string;
  outputType: string;
  outputContractId?: string;
  buildMode: string;
  sourceStatusPolicyId: SourceStatusPolicyId;
  includedSources: ContextSourceSelection[];
  excludedSources: ContextSourceSelection[];
  warnings: ContextBuildValidationIssue[];
  errors: ContextBuildValidationIssue[];
  tokenEstimate?: ContextTokenEstimate;
  requiredDocsCheck?: RequiredMemoryDocsCheckResult;
  unsupportedFeatures?: string[];
}

export function createContextBuildReport(input: BuildReportMarkdownInput): ContextBuildReport {
  const generationResult =
    input.errors.length > 0 ? "failed" : input.warnings.length > 0 ? "warning" : "success";

  return {
    ok: input.errors.length === 0,
    projectCode: input.projectCode,
    agentCode: input.agentCode,
    outputType: input.outputType as ContextBuildReport["outputType"],
    outputContractId: input.outputContractId as ContextBuildReport["outputContractId"],
    buildMode: input.buildMode as ContextBuildReport["buildMode"],
    sourceStatusPolicyId: input.sourceStatusPolicyId,
    validation: {
      ok: input.errors.length === 0,
      errors: input.errors,
      warnings: input.warnings,
    },
    includedSources: input.includedSources,
    excludedSources: input.excludedSources,
    warnings: input.warnings,
    errors: input.errors,
    tokenEstimate: input.tokenEstimate,
    requiredDocsCheck: input.requiredDocsCheck,
    unsupportedFeatures: input.unsupportedFeatures,
    generationResult,
  };
}

export function renderBuildReportMarkdown(report: ContextBuildReport): string {
  return [
    "# Context Build Report",
    "",
    "## 1. Build Result",
    "",
    table([
      ["Item", "Value"],
      ["Generation Result", report.generationResult],
      ["OK", String(report.ok)],
      ["Project Code", report.projectCode ?? ""],
      ["Agent Code", report.agentCode ?? ""],
      ["Output Type", report.outputType ?? ""],
      ["Output Contract ID", report.outputContractId ?? ""],
      ["Build Mode", report.buildMode ?? ""],
      ["Source Status Policy", report.sourceStatusPolicyId ?? ""],
      ["Included Source Count", String(report.includedSources.length)],
      ["Excluded Source Count", String(report.excludedSources.length)],
      ["Warning Count", String(report.warnings.length)],
      ["Error Count", String(report.errors.length)],
    ]),
    "",
    "## 2. Required Docs Check",
    "",
    renderRequiredDocsCheck(report.requiredDocsCheck),
    "",
    "## 3. Unsupported / Placeholder Features",
    "",
    renderUnsupportedFeatures(report.unsupportedFeatures),
    "",
    "## 4. Errors",
    "",
    renderIssues(report.errors),
    "",
    "## 5. Warnings",
    "",
    renderIssues(report.warnings),
    "",
    "## 6. Included Sources",
    "",
    renderSources(report.includedSources),
    "",
    "## 7. Excluded Sources",
    "",
    renderSources(report.excludedSources),
    "",
    "## 8. Token Estimate",
    "",
    report.tokenEstimate
      ? table([
          ["Item", "Value"],
          ["Estimated Input Tokens", `${report.tokenEstimate.estimatedInputTokens} (approximate)`],
          [
            "Estimate Method",
            report.tokenEstimate.note ?? "Approximate character-count / 4 heuristic.",
          ],
          ["Max Tokens", String(report.tokenEstimate.maxTokens)],
          ["Reserve Tokens For Response", String(report.tokenEstimate.reserveTokensForResponse)],
          ["Available Input Tokens", String(report.tokenEstimate.availableInputTokens)],
          ["Exceeded", String(report.tokenEstimate.exceeded)],
          ["Handling", report.tokenEstimate.handling],
          ["Approximate", String(report.tokenEstimate.approximate)],
        ])
      : "Not estimated.",
    "",
  ].join("\n");
}

export function renderBuildReportSummary(
  report: ContextBuildReport,
  detailedReportPath: string,
): string {
  const missingRequiredDocCount = report.errors.filter(
    (issue) => issue.code === "missing_required_doc",
  ).length;
  const conflictCount = report.warnings.filter((issue) =>
    String(issue.code).includes("conflict"),
  ).length;

  return [
    table([
      ["Item", "Value"],
      ["Included Source Count", String(report.includedSources.length)],
      ["Excluded Source Count", String(report.excludedSources.length)],
      ["Warning Count", String(report.warnings.length)],
      ["Conflict Count", String(conflictCount)],
      ["Missing Required Source Count", String(missingRequiredDocCount)],
      [
        "Token Budget Handling",
        report.tokenEstimate
          ? `${report.tokenEstimate.handling} / approximate=${report.tokenEstimate.approximate}`
          : "none",
      ],
      ["Detailed Build Report Path", detailedReportPath],
    ]),
    "",
    "### 15.1 Excluded Sources Summary",
    "",
    report.excludedSources.length === 0
      ? "No excluded sources."
      : report.excludedSources
          .map(
            (source) =>
              `- ${source.sourceId}: ${source.path} (${source.status}, ${source.handling})`,
          )
          .join("\n"),
    "",
    "### 15.2 Conflict Summary",
    "",
    conflictCount === 0
      ? "No conflicts detected by M2-5 draft builder."
      : renderIssues(report.warnings.filter((issue) => String(issue.code).includes("conflict"))),
    "",
    "### 15.3 Missing Required Sources Summary",
    "",
    missingRequiredDocCount === 0
      ? "No missing required sources."
      : renderIssues(report.errors.filter((issue) => issue.code === "missing_required_doc")),
  ].join("\n");
}

function renderRequiredDocsCheck(check?: RequiredMemoryDocsCheckResult): string {
  if (!check) {
    return "Not available.";
  }

  return [
    table([
      ["Item", "Value"],
      ["Memory Root", check.memory_root],
      ["Required Docs Count", String(check.required_docs.length)],
      ["Missing Required Docs Count", String(check.missing_docs.length)],
      ["Standard Docs Satisfied", String(check.standard_docs_satisfied)],
    ]),
    "",
    check.required_docs.length === 0
      ? "No required docs declared."
      : table([
          ["File Name", "Resolved Path", "Exists"],
          ...check.required_docs.map((doc) => [
            doc.file_name,
            doc.resolved_path.replace(/\\/g, "/"),
            String(doc.exists),
          ]),
        ]),
  ].join("\n");
}

function renderUnsupportedFeatures(features?: string[]): string {
  if (!features || features.length === 0) {
    return "None.";
  }

  return features.map((feature) => `- ${feature}`).join("\n");
}

function renderIssues(issues: ContextBuildValidationIssue[]): string {
  if (issues.length === 0) {
    return "None.";
  }

  return table([
    ["Code", "Severity", "Source ID", "Path", "Message", "Handling"],
    ...issues.map((issue) => [
      issue.code,
      issue.severity,
      issue.sourceId ?? "",
      issue.path ?? "",
      issue.message,
      getIssueHandling(issue),
    ]),
  ]);
}

function getIssueHandling(issue: ContextBuildValidationIssue): string {
  if (issue.severity === "error") {
    return "Stop build and correct the error before AI input.";
  }
  if (String(issue.code).includes("conflict")) {
    return "Review conflicting sources and do not make a final decision until resolved.";
  }
  if (issue.code === "token_budget_exceeded") {
    return "Reduce, summarize, or exclude lower-priority context before AI input.";
  }
  if (issue.code === "source_excluded") {
    return "Confirm the exclusion reason and whether the source is required for the task.";
  }
  if (String(issue.code).endsWith("_source_included") || issue.code === "unknown_status") {
    return "Review as non-final evidence; do not treat it as an approved source of truth.";
  }
  return "Review the warning before approving the Context Pack for AI input.";
}

function renderSources(sources: ContextSourceSelection[]): string {
  if (sources.length === 0) {
    return "None.";
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
      "Reason",
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
      source.inclusionReason,
      source.handling,
      source.matchedBy ?? "",
      String(source.explicitlyRequested ?? false),
      source.selectionReason ?? "",
    ]),
  ]);
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
