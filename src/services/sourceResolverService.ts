import fs from "node:fs";
import path from "node:path";

import type {
  AgentContextRequirement,
  AgentRegistryEntry,
  ProjectRegistryEntry,
  SourceGroup,
  SourceGroupType,
  SourceStatus,
  SourceStatusPolicyConfig,
} from "../types/registry";
import type {
  ContextAdditionalSourceRequest,
  ContextBuildValidationIssue,
  ContextSessionRequest,
  ContextSourceHandling,
  ContextSourceInclusionReason,
  ContextSourceSelection,
  RecentContextRequest,
} from "../types/context";
import type { RequiredMemoryDocsCheckResult } from "../types/registry";

export interface ResolvedSourceContent extends ContextSourceSelection {
  absolutePath?: string;
  title?: string;
  documentId?: string;
  content?: string;
  excerpt?: string;
}

export interface SourceResolutionResult {
  includedSources: ResolvedSourceContent[];
  excludedSources: ResolvedSourceContent[];
  warnings: ContextBuildValidationIssue[];
  errors: ContextBuildValidationIssue[];
}

interface SourceCandidateInput {
  path: string;
  sourceType: SourceGroupType | "recent_context" | "session_context";
  sourceGroup?: string;
  inclusionReason: ContextSourceInclusionReason;
  includedSection?: string;
  purpose?: string;
  explicit: boolean;
  virtualContent?: string;
}

const REPOSITORY_ROOT = process.cwd();
const DEFAULT_MAX_SOURCE_CHARS = 6000;

export async function resolveContextSources(input: {
  project: ProjectRegistryEntry;
  agent: AgentRegistryEntry;
  sourceStatusPolicy: SourceStatusPolicyConfig;
  requiredDocsCheck: RequiredMemoryDocsCheckResult;
  taskRequest: string;
  additionalSources?: ContextAdditionalSourceRequest[];
  sessionContext: ContextSessionRequest;
  recentContext: RecentContextRequest;
}): Promise<SourceResolutionResult> {
  const warnings: ContextBuildValidationIssue[] = [];
  const errors: ContextBuildValidationIssue[] = [];
  const candidates: SourceCandidateInput[] = [];

  for (const missingDoc of input.requiredDocsCheck.missing_docs) {
    const sourceId = createSourceId("missing", missingDoc.file_name);
    errors.push({
      code: "missing_required_doc",
      severity: "error",
      message: `Required memory doc is missing: ${missingDoc.resolved_path}`,
      path: missingDoc.resolved_path,
      projectCode: input.project.project_code,
      sourceId,
    });
  }

  candidates.push(
    ...resolveAgentContextRequirements({
      project: input.project,
      requirements: input.agent.required_context,
      inclusionReason: "agent_required_context",
      explicit: true,
    }),
  );

  candidates.push(
    ...resolveAgentContextRequirements({
      project: input.project,
      requirements: input.agent.optional_context ?? [],
      inclusionReason: "agent_optional_context",
      explicit: false,
    }),
  );

  candidates.push(...resolveTaskMatchedCandidates(input.project, input.taskRequest));

  const additionalResult = resolveAdditionalSources(input.project, input.additionalSources ?? []);
  candidates.push(...additionalResult.candidates);
  warnings.push(...additionalResult.warnings);
  errors.push(...additionalResult.errors);

  if (input.sessionContext.include) {
    candidates.push({
      path: "session://context-build-request",
      sourceType: "session_context",
      inclusionReason: "session_context",
      includedSection: "8. Session Context",
      purpose: "Context Build Request supplied session context.",
      explicit: true,
      virtualContent: renderSessionContext(input.sessionContext),
    });
  }

  if (input.recentContext.include) {
    const source = input.recentContext.source ?? "conversation-summary";
    candidates.push({
      path: `recent://${source}`,
      sourceType: "recent_context",
      inclusionReason: "recent_context",
      includedSection: "9. Recent Conversation Context",
      purpose: "Recent Context requested by Context Build Request.",
      explicit: true,
      virtualContent: `Recent Context source requested: ${source}\n\nM2-5 draft does not implement conversation summary loading yet.`,
    });
  }

  const uniqueCandidates = dedupeCandidates(candidates);
  const includedSources: ResolvedSourceContent[] = [];
  const excludedSources: ResolvedSourceContent[] = [];

  let index = 1;
  for (const candidate of uniqueCandidates) {
    const resolved = await resolveCandidate(candidate, input.sourceStatusPolicy, index);
    index += 1;

    if (resolved.warning) {
      warnings.push(resolved.warning);
    }

    if (resolved.source.handling === "exclude") {
      excludedSources.push(resolved.source);
    } else {
      includedSources.push(resolved.source);
    }
  }

  return {
    includedSources,
    excludedSources,
    warnings,
    errors,
  };
}

function resolveAgentContextRequirements(input: {
  project: ProjectRegistryEntry;
  requirements: AgentContextRequirement[];
  inclusionReason: ContextSourceInclusionReason;
  explicit: boolean;
}): SourceCandidateInput[] {
  const candidates: SourceCandidateInput[] = [];

  for (const requirement of input.requirements) {
    if (requirement.source_type === "memory_doc") {
      for (const docName of requirement.document_names ?? []) {
        candidates.push({
          path: path.join(input.project.memory_root, docName),
          sourceType: "memory_doc",
          inclusionReason: input.inclusionReason,
          includedSection: includedSectionForMemoryDoc(docName),
          purpose: requirement.purpose,
          explicit: input.explicit,
        });
      }
    }

    if (requirement.source_type === "adr_source") {
      candidates.push(
        ...expandSourceGroups(
          input.project.adr_sources ?? [],
          "adr_source",
          input.inclusionReason,
          requirement.purpose,
          input.explicit,
          "6. Active Decisions",
        ),
      );
    }

    if (requirement.source_type === "review_source") {
      candidates.push(
        ...expandSourceGroups(
          input.project.review_sources ?? [],
          "review_source",
          input.inclusionReason,
          requirement.purpose,
          input.explicit,
          "11. Additional Sources",
        ),
      );
    }

    if (requirement.source_type === "optional_source") {
      candidates.push(
        ...expandSourceGroups(
          input.project.optional_sources ?? [],
          "optional_source",
          input.inclusionReason,
          requirement.purpose,
          input.explicit,
          "11. Additional Sources",
        ),
      );
    }

    for (const directPath of requirement.paths ?? []) {
      candidates.push({
        path: directPath,
        sourceType: requirement.source_type as SourceGroupType,
        sourceGroup: requirement.source_group,
        inclusionReason: input.inclusionReason,
        includedSection: "11. Additional Sources",
        purpose: requirement.purpose,
        explicit: input.explicit,
      });
    }
  }

  return candidates;
}

function expandSourceGroups(
  groups: SourceGroup[],
  sourceType: SourceGroupType,
  inclusionReason: ContextSourceInclusionReason,
  purpose: string,
  explicit: boolean,
  includedSection: string,
): SourceCandidateInput[] {
  return groups.flatMap((group) =>
    group.patterns.flatMap((pattern) =>
      expandPattern(pattern).map((matchedPath) => ({
        path: matchedPath,
        sourceType,
        sourceGroup: group.source_group,
        inclusionReason,
        includedSection,
        purpose: purpose || group.description,
        explicit,
      })),
    ),
  );
}

function resolveTaskMatchedCandidates(
  project: ProjectRegistryEntry,
  taskRequest: string,
): SourceCandidateInput[] {
  const normalizedTask = taskRequest.toLowerCase();
  const candidates: SourceCandidateInput[] = [];

  const shouldIncludeCode =
    /implement|implementation|usecase|service|repository|review|code|実装|レビュー/.test(
      normalizedTask,
    );
  const shouldIncludeDocs = /requirement|contract|domain|rule|plan|要件|契約|設計|方針/.test(
    normalizedTask,
  );

  for (const group of project.optional_sources ?? []) {
    const groupText = `${group.source_group} ${group.description ?? ""}`.toLowerCase();
    const groupLooksRelevant =
      (shouldIncludeCode && /code|source|usecase|service|repository|types/.test(groupText)) ||
      (shouldIncludeDocs &&
        /doc|domain|contract|phase|requirement|version|test|database/.test(groupText));

    if (!groupLooksRelevant) {
      continue;
    }

    candidates.push(
      ...expandSourceGroups(
        [group],
        "optional_source",
        "task_request_match",
        group.description ?? "Matched by task request.",
        false,
        "11. Additional Sources",
      ),
    );
  }

  return candidates;
}

function resolveAdditionalSources(
  project: ProjectRegistryEntry,
  additionalSources: ContextAdditionalSourceRequest[],
): {
  candidates: SourceCandidateInput[];
  warnings: ContextBuildValidationIssue[];
  errors: ContextBuildValidationIssue[];
} {
  const candidates: SourceCandidateInput[] = [];
  const warnings: ContextBuildValidationIssue[] = [];
  const errors: ContextBuildValidationIssue[] = [];

  for (const source of additionalSources) {
    if (!isSafeRelativePath(source.path)) {
      errors.push({
        code: "invalid_additional_source_path",
        severity: "error",
        message: `Additional source path must be repository-root relative and must not contain parent traversal: ${source.path}`,
        path: normalizePath(source.path),
        projectCode: project.project_code,
      });
      continue;
    }

    if (!fs.existsSync(path.resolve(source.path))) {
      errors.push({
        code: "additional_source_not_found",
        severity: "error",
        message: `Additional source does not exist: ${source.path}`,
        path: normalizePath(source.path),
        projectCode: project.project_code,
      });
      continue;
    }

    if (!matchesProjectCandidate(project, source.path)) {
      warnings.push({
        code: "additional_source_not_allowed",
        severity: "warning",
        message: `Additional source is not matched by Project Registry candidates. Included as explicit additional source with warning: ${source.path}`,
        path: normalizePath(source.path),
        projectCode: project.project_code,
      });
    }

    candidates.push({
      path: normalizePath(source.path),
      sourceType: "additional_source",
      inclusionReason: "additional_source",
      includedSection: "11. Additional Sources",
      purpose: source.purpose ?? "Explicitly supplied additional source.",
      explicit: true,
    });
  }

  return { candidates, warnings, errors };
}

async function resolveCandidate(
  candidate: SourceCandidateInput,
  policy: SourceStatusPolicyConfig,
  index: number,
): Promise<{ source: ResolvedSourceContent; warning?: ContextBuildValidationIssue }> {
  const normalizedPath = normalizePath(candidate.path);
  const isVirtual =
    normalizedPath.startsWith("session://") || normalizedPath.startsWith("recent://");
  const absolutePath = isVirtual ? undefined : path.resolve(normalizedPath);
  const exists = isVirtual || Boolean(absolutePath && fs.existsSync(absolutePath));
  const rawContent = isVirtual
    ? (candidate.virtualContent ?? "")
    : exists && absolutePath
      ? await fs.promises.readFile(absolutePath, "utf8")
      : "";
  const metadata = parseSourceMetadata(rawContent);
  const status = isVirtual ? "active" : metadata.status;
  const handling =
    !exists && !isVirtual ? "exclude" : determineHandling(status, policy, candidate.explicit);
  const sourceId = createSourceId(String(index).padStart(3, "0"), normalizedPath);

  const source: ResolvedSourceContent = {
    sourceId,
    path: normalizedPath,
    sourceType: candidate.sourceType,
    sourceGroup: candidate.sourceGroup,
    status,
    inclusionReason: candidate.inclusionReason,
    handling,
    includedSection: candidate.includedSection,
    purpose: candidate.purpose,
    absolutePath,
    title: metadata.title,
    documentId: metadata.documentId,
    matchedBy: candidate.sourceGroup ?? candidate.inclusionReason,
    explicitlyRequested: candidate.explicit,
    selectionReason: selectionReasonFor(candidate),
    content: rawContent,
    excerpt: truncate(rawContent, DEFAULT_MAX_SOURCE_CHARS),
  };

  const warning = createStatusWarning(source, policy);
  return { source, warning };
}

function determineHandling(
  status: SourceStatus,
  policy: SourceStatusPolicyConfig,
  explicit: boolean,
): ContextSourceHandling {
  if (policy.include_by_default.includes(status)) {
    return policy.warning_required.includes(status) ? "include_with_warning" : "include";
  }

  if (explicit && policy.explicit_only.includes(status)) {
    return policy.warning_required.includes(status) ? "include_with_warning" : "include";
  }

  return "exclude";
}

function createStatusWarning(
  source: ResolvedSourceContent,
  policy: SourceStatusPolicyConfig,
): ContextBuildValidationIssue | undefined {
  if (source.handling === "exclude") {
    return {
      code: "source_excluded",
      severity: "warning",
      message: `Source excluded by source status policy: ${source.path} status=${source.status}`,
      path: normalizePath(source.path),
      sourceId: source.sourceId,
    };
  }

  if (!policy.warning_required.includes(source.status)) {
    return undefined;
  }

  const codeByStatus: Partial<Record<SourceStatus, ContextBuildValidationIssue["code"]>> = {
    draft: "draft_source_included",
    proposed: "proposed_source_included",
    archived: "archived_source_included",
    deprecated: "deprecated_source_included",
    superseded: "superseded_source_included",
    unknown: "unknown_status",
  };

  return {
    code: codeByStatus[source.status] ?? "unknown_status",
    severity: "warning",
    message: `Non-active source included with warning: ${source.path} status=${source.status}`,
    path: normalizePath(source.path),
    sourceId: source.sourceId,
  };
}

function parseSourceMetadata(content: string): {
  title?: string;
  documentId?: string;
  status: SourceStatus;
} {
  const normalizedContent = content.replace(/^\uFEFF/, "");
  const frontmatterMatch = normalizedContent.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  const frontmatter = frontmatterMatch?.[1] ?? "";

  const title =
    matchFrontmatterValue(frontmatter, "title") ?? firstMarkdownTitle(normalizedContent);
  const documentId =
    matchFrontmatterValue(frontmatter, "document_id") ??
    matchFrontmatterValue(frontmatter, "template_id");
  const statusValue =
    matchFrontmatterValue(frontmatter, "status") ??
    matchFrontmatterValue(frontmatter, "review_status");

  return {
    title,
    documentId,
    status: normalizeStatus(statusValue),
  };
}

function matchFrontmatterValue(frontmatter: string, key: string): string | undefined {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*["']?([^"'\\r\\n]+)["']?\\s*$`, "m"));
  return match?.[1]?.trim();
}

function firstMarkdownTitle(content: string): string | undefined {
  return content.match(/^#\s+(.+)$/m)?.[1]?.trim();
}

function normalizeStatus(value?: string): SourceStatus {
  const normalized = value?.trim().toLowerCase();
  const valid: SourceStatus[] = [
    "active",
    "accepted",
    "draft",
    "proposed",
    "superseded",
    "deprecated",
    "archived",
    "unknown",
  ];
  return normalized && valid.includes(normalized as SourceStatus)
    ? (normalized as SourceStatus)
    : "unknown";
}

function includedSectionForMemoryDoc(fileName: string): string {
  switch (fileName) {
    case "project-summary.md":
      return "4. Project Context";
    case "current-status.md":
      return "5. Current Status";
    case "active-decisions.md":
      return "6. Active Decisions";
    case "next-actions.md":
      return "7. Next Actions";
    case "ai-entrypoint.md":
      return "12. Constraints and Write Policy";
    default:
      return "11. Additional Sources";
  }
}

function expandPattern(pattern: string): string[] {
  if (!isSafeRelativePath(pattern)) {
    return [];
  }

  const normalized = pattern.replace(/\\/g, "/");
  if (!normalized.includes("*")) {
    return fs.existsSync(path.resolve(normalized)) ? [normalized] : [];
  }

  const baseDir = getGlobBaseDir(normalized);
  const absoluteBaseDir = path.resolve(baseDir || ".");
  if (!fs.existsSync(absoluteBaseDir)) {
    return [];
  }

  const files = walkFiles(absoluteBaseDir).map((filePath) =>
    path.relative(REPOSITORY_ROOT, filePath).replace(/\\/g, "/"),
  );
  const regex = globToRegExp(normalized);
  return files.filter((filePath) => regex.test(filePath));
}

function getGlobBaseDir(pattern: string): string {
  const starIndex = pattern.search(/[*]/);
  const staticPrefix = starIndex >= 0 ? pattern.slice(0, starIndex) : pattern;
  const slashIndex = staticPrefix.lastIndexOf("/");
  return slashIndex >= 0 ? staticPrefix.slice(0, slashIndex) : ".";
}

function walkFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walkFiles(fullPath);
    }
    return [fullPath];
  });
}

function globToRegExp(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "::DOUBLE_STAR::")
    .replace(/\*/g, "[^/]*")
    .replace(/::DOUBLE_STAR::/g, ".*");
  return new RegExp(`^${escaped}$`);
}

function matchesProjectCandidate(project: ProjectRegistryEntry, sourcePath: string): boolean {
  const candidatePatterns = [
    ...project.required_memory_docs.map((doc) => path.join(project.memory_root, doc)),
    ...(project.optional_sources ?? []).flatMap((group) => group.patterns),
    ...(project.adr_sources ?? []).flatMap((group) => group.patterns),
    ...(project.review_sources ?? []).flatMap((group) => group.patterns),
  ];

  return candidatePatterns.some((pattern) => {
    if (pattern.includes("*")) {
      return globToRegExp(pattern.replace(/\\/g, "/")).test(sourcePath.replace(/\\/g, "/"));
    }
    return path.normalize(pattern) === path.normalize(sourcePath);
  });
}

function dedupeCandidates(candidates: SourceCandidateInput[]): SourceCandidateInput[] {
  const byPath = new Map<string, SourceCandidateInput>();
  for (const candidate of candidates) {
    const key = candidate.path.replace(/\\/g, "/");
    const existing = byPath.get(key);
    if (!existing) {
      byPath.set(key, candidate);
      continue;
    }

    byPath.set(key, {
      ...existing,
      explicit: existing.explicit || candidate.explicit,
      inclusionReason: existing.explicit ? existing.inclusionReason : candidate.inclusionReason,
      purpose: existing.purpose ?? candidate.purpose,
      includedSection: existing.includedSection ?? candidate.includedSection,
    });
  }

  return [...byPath.values()];
}

function isSafeRelativePath(inputPath: string): boolean {
  return (
    Boolean(inputPath) && !path.isAbsolute(inputPath) && !inputPath.split(/[\\/]+/).includes("..")
  );
}

function truncate(content: string, maxChars: number): string {
  if (content.length <= maxChars) {
    return content;
  }
  return `${content.slice(0, maxChars)}\n\n...[truncated by M2-5 draft Context Builder]`;
}

function renderSessionContext(sessionContext: ContextSessionRequest): string {
  const lines = ["# Session Context", ""];
  if (sessionContext.notes?.length) {
    lines.push("## Notes", ...sessionContext.notes.map((note) => `- ${note}`), "");
  }
  if (sessionContext.reviewViewpoints?.length) {
    lines.push(
      "## Review Viewpoints",
      ...sessionContext.reviewViewpoints.map((viewpoint) => `- ${viewpoint}`),
      "",
    );
  }
  if (sessionContext.temporaryConstraints?.length) {
    lines.push(
      "## Temporary Constraints",
      ...sessionContext.temporaryConstraints.map((constraint) => `- ${constraint}`),
      "",
    );
  }
  return lines.join("\n");
}

function normalizePath(inputPath: string): string {
  if (inputPath.startsWith("session://") || inputPath.startsWith("recent://")) {
    return inputPath;
  }
  return inputPath.replace(/\\/g, "/");
}

function selectionReasonFor(candidate: SourceCandidateInput): string {
  if (candidate.inclusionReason === "additional_source") {
    return "Explicitly requested by additional_sources or --source.";
  }
  if (candidate.sourceGroup) {
    return `Matched Project Registry source group: ${candidate.sourceGroup}.`;
  }
  return `Selected by ${candidate.inclusionReason}.`;
}

function createSourceId(prefix: string, sourcePath: string): string {
  const baseName =
    sourcePath
      .split(/[\\/:]+/)
      .filter(Boolean)
      .pop() ?? "source";
  return `src-${prefix}-${baseName.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}
