import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

import type {
  ProjectCode,
  ProjectRegistryEntry,
  ProjectRegistryFile,
  ProjectRegistryValidationError,
  ProjectRegistryValidationResult,
  ProjectRegistryValidationWarning,
  ProjectSourceCandidates,
  RequiredMemoryDocCheck,
  RequiredMemoryDocsCheckResult,
  ResolvedProjectRegistry,
  SourceCandidate,
  SourceGroup,
  SourceStatusPolicyConfig,
  SourceStatusPolicyId,
  StandardRequiredMemoryDoc,
  WritePolicyConfig,
  WritePolicyId,
} from "../types/registry";

const DEFAULT_PROJECTS_YAML_PATH = "config/projects.yaml";

const STANDARD_REQUIRED_MEMORY_DOCS: StandardRequiredMemoryDoc[] = [
  "project-summary.md",
  "current-status.md",
  "active-decisions.md",
  "next-actions.md",
  "ai-entrypoint.md",
];

const VALID_SOURCE_STATUS_POLICIES: SourceStatusPolicyId[] = [
  "active_only",
  "active_preferred",
  "active_preferred_draft_allowed_with_warning",
  "include_archived_for_history",
];

const VALID_WRITE_POLICIES: WritePolicyId[] = ["draft_only"];

export async function loadProjectRegistry(
  registryPath = DEFAULT_PROJECTS_YAML_PATH,
): Promise<ProjectRegistryFile> {
  const absolutePath = path.resolve(registryPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Project Registry file not found: ${absolutePath}`);
  }

  const raw = await fs.promises.readFile(absolutePath, "utf8");
  const parsed = YAML.parse(raw) as ProjectRegistryFile;

  validateRegistryShapeOrThrow(parsed, absolutePath);

  return parsed;
}

export async function resolveProjectRegistry(input: {
  projectCode: ProjectCode;
  registryPath?: string;
}): Promise<ResolvedProjectRegistry> {
  const registry = await loadProjectRegistry(input.registryPath);
  const project = findProject(registry, input.projectCode);

  if (!project) {
    throw new Error(`Project not found in Project Registry: ${input.projectCode}`);
  }

  const sourceStatusPolicy = resolveSourceStatusPolicy(registry, project);
  const writePolicy = resolveWritePolicy(registry, project);
  const requiredDocsCheck = checkRequiredMemoryDocs(project);

  return {
    project,
    source_status_policy: sourceStatusPolicy,
    write_policy: writePolicy,
    required_docs_check: requiredDocsCheck,
  };
}

export async function validateProjectRegistry(
  registryPath = DEFAULT_PROJECTS_YAML_PATH,
): Promise<ProjectRegistryValidationResult> {
  const errors: ProjectRegistryValidationError[] = [];
  const warnings: ProjectRegistryValidationWarning[] = [];

  let registry: ProjectRegistryFile;

  try {
    registry = await loadProjectRegistry(registryPath);
  } catch (error) {
    return {
      ok: false,
      errors: [
        {
          code: "registry_file_invalid",
          message: error instanceof Error ? error.message : "Invalid registry file",
          path: registryPath,
        },
      ],
      warnings: [],
    };
  }

  errors.push(...validateDuplicateProjectCodes(registry));

  for (const project of registry.projects) {
    errors.push(...validateProjectRequiredFields(project));
    errors.push(...validateRequiredMemoryDocsDefinition(project));
    errors.push(...validateProjectPolicies(registry, project));

    warnings.push(...validateProjectSourceGroups(project));
    warnings.push(...validateSourceGroupPatterns(project));

    const requiredDocsCheck = checkRequiredMemoryDocs(project);

    for (const missingDoc of requiredDocsCheck.missing_docs) {
      errors.push({
        code: "required_memory_doc_missing",
        message: `Required memory doc is missing: ${missingDoc.resolved_path}`,
        path: missingDoc.resolved_path,
        project_code: project.project_code,
      });
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

export async function validateProjectRequiredMemoryDocs(input: {
  projectCode: ProjectCode;
  registryPath?: string;
}): Promise<ProjectRegistryValidationResult> {
  const registry = await loadProjectRegistry(input.registryPath);
  const project = findProject(registry, input.projectCode);

  if (!project) {
    return {
      ok: false,
      project_code: input.projectCode,
      errors: [
        {
          code: "project_not_found",
          message: `Project not found in Project Registry: ${input.projectCode}`,
          project_code: input.projectCode,
        },
      ],
      warnings: [],
    };
  }

  const errors: ProjectRegistryValidationError[] = [
    ...validateRequiredMemoryDocsDefinition(project),
  ];

  const requiredDocsCheck = checkRequiredMemoryDocs(project);

  for (const missingDoc of requiredDocsCheck.missing_docs) {
    errors.push({
      code: "required_memory_doc_missing",
      message: `Required memory doc is missing: ${missingDoc.resolved_path}`,
      path: missingDoc.resolved_path,
      project_code: project.project_code,
    });
  }

  return {
    ok: errors.length === 0,
    project_code: project.project_code,
    errors,
    warnings: [],
    required_docs_check: requiredDocsCheck,
  };
}

export async function listProjectSourceCandidates(input: {
  projectCode: ProjectCode;
  registryPath?: string;
}): Promise<ProjectSourceCandidates> {
  const { project } = await resolveProjectRegistry({
    projectCode: input.projectCode,
    registryPath: input.registryPath,
  });

  return {
    project_code: project.project_code,
    memory_root: project.memory_root,
    required_memory_docs: project.required_memory_docs.map((fileName) => ({
      source_type: "memory_doc",
      path_or_pattern: path.join(project.memory_root, fileName),
      description:
        "Existence validation target. Not always included in Context Pack.",
    })),
    optional_sources: flattenSourceGroups(project.optional_sources ?? [], "optional_source"),
    adr_sources: flattenSourceGroups(project.adr_sources ?? [], "adr_source"),
    review_sources: flattenSourceGroups(project.review_sources ?? [], "review_source"),
  };
}

export function findProject(
  registry: ProjectRegistryFile,
  projectCode: ProjectCode,
): ProjectRegistryEntry | undefined {
  return registry.projects.find((project) => project.project_code === projectCode);
}

export function checkRequiredMemoryDocs(
  project: ProjectRegistryEntry,
): RequiredMemoryDocsCheckResult {
  const requiredDocs: RequiredMemoryDocCheck[] = project.required_memory_docs.map(
    (fileName) => {
      const resolvedPath = path.resolve(path.join(project.memory_root, fileName));

      return {
        file_name: fileName,
        resolved_path: resolvedPath,
        exists: fs.existsSync(resolvedPath),
      };
    },
  );

  const missingDocs = requiredDocs.filter((doc) => !doc.exists);

  const allStandardDocsDeclared = STANDARD_REQUIRED_MEMORY_DOCS.every((standardDoc) =>
    project.required_memory_docs.includes(standardDoc),
  );

  return {
    memory_root: path.resolve(project.memory_root),
    required_docs: requiredDocs,
    missing_docs: missingDocs,
    standard_docs_satisfied: allStandardDocsDeclared && missingDocs.length === 0,
  };
}

function validateRegistryShapeOrThrow(
  registry: ProjectRegistryFile,
  registryPath: string,
): void {
  if (!registry || typeof registry !== "object") {
    throw new Error(`Project Registry is not an object: ${registryPath}`);
  }

  if (!Array.isArray(registry.projects)) {
    throw new Error(`Project Registry must have projects array: ${registryPath}`);
  }
}

function validateDuplicateProjectCodes(
  registry: ProjectRegistryFile,
): ProjectRegistryValidationError[] {
  const errors: ProjectRegistryValidationError[] = [];
  const seen = new Set<string>();

  for (const project of registry.projects) {
    if (seen.has(project.project_code)) {
      errors.push({
        code: "duplicate_project_code",
        message: `Duplicate project_code found: ${project.project_code}`,
        project_code: project.project_code,
      });
    }

    seen.add(project.project_code);
  }

  return errors;
}

function validateProjectRequiredFields(
  project: ProjectRegistryEntry,
): ProjectRegistryValidationError[] {
  const errors: ProjectRegistryValidationError[] = [];

  if (!project.project_code) {
    errors.push({
      code: "missing_required_field",
      message: "project_code is required",
    });
  }

  if (!project.project_name) {
    errors.push({
      code: "missing_required_field",
      message: "project_name is required",
      project_code: project.project_code,
    });
  }

  if (!project.memory_root) {
    errors.push({
      code: "missing_required_field",
      message: "memory_root is required",
      project_code: project.project_code,
    });
  }

  if (!Array.isArray(project.required_memory_docs)) {
    errors.push({
      code: "missing_required_field",
      message: "required_memory_docs must be an array",
      project_code: project.project_code,
    });
  }

  if (!project.source_status_policy) {
    errors.push({
      code: "missing_required_field",
      message: "source_status_policy is required",
      project_code: project.project_code,
    });
  }

  if (!project.write_policy) {
    errors.push({
      code: "missing_required_field",
      message: "write_policy is required",
      project_code: project.project_code,
    });
  }

  if (project.memory_root && !fs.existsSync(path.resolve(project.memory_root))) {
    errors.push({
      code: "memory_root_not_found",
      message: `memory_root does not exist: ${project.memory_root}`,
      path: project.memory_root,
      project_code: project.project_code,
    });
  }

  return errors;
}

function validateRequiredMemoryDocsDefinition(
  project: ProjectRegistryEntry,
): ProjectRegistryValidationError[] {
  const errors: ProjectRegistryValidationError[] = [];

  if (!Array.isArray(project.required_memory_docs)) {
    return errors;
  }

  for (const doc of project.required_memory_docs) {
    if (!doc || doc.trim() === "") {
      errors.push({
        code: "invalid_required_memory_doc_path",
        message: "required_memory_docs must not contain empty value",
        project_code: project.project_code,
      });

      continue;
    }

    if (path.isAbsolute(doc)) {
      errors.push({
        code: "invalid_required_memory_doc_path",
        message: `required_memory_docs must be relative file names under memory_root: ${doc}`,
        project_code: project.project_code,
      });
    }

    if (doc.includes("..")) {
      errors.push({
        code: "invalid_required_memory_doc_path",
        message: `required_memory_docs must not contain parent directory reference: ${doc}`,
        project_code: project.project_code,
      });
    }
  }

  for (const standardDoc of STANDARD_REQUIRED_MEMORY_DOCS) {
    if (!project.required_memory_docs.includes(standardDoc)) {
      errors.push({
        code: "required_memory_doc_not_declared",
        message: `Standard required memory doc is not declared: ${standardDoc}`,
        project_code: project.project_code,
      });
    }
  }

  return errors;
}

function validateProjectPolicies(
  registry: ProjectRegistryFile,
  project: ProjectRegistryEntry,
): ProjectRegistryValidationError[] {
  const errors: ProjectRegistryValidationError[] = [];

  const sourcePolicyId = project.source_status_policy?.policy_id;

  if (
    sourcePolicyId &&
    !VALID_SOURCE_STATUS_POLICIES.includes(sourcePolicyId)
  ) {
    errors.push({
      code: "invalid_source_status_policy",
      message: `Invalid source_status_policy: ${sourcePolicyId}`,
      project_code: project.project_code,
    });
  }

  if (sourcePolicyId && !resolveSourceStatusPolicyOrNull(registry, project)) {
    errors.push({
      code: "invalid_source_status_policy",
      message: `source_status_policy is not defined in defaults: ${sourcePolicyId}`,
      project_code: project.project_code,
    });
  }

  const writePolicyId = project.write_policy?.policy_id;

  if (writePolicyId && !VALID_WRITE_POLICIES.includes(writePolicyId)) {
    errors.push({
      code: "invalid_write_policy",
      message: `Invalid write_policy: ${writePolicyId}`,
      project_code: project.project_code,
    });
  }

  if (writePolicyId && !resolveWritePolicyOrNull(registry, project)) {
    errors.push({
      code: "invalid_write_policy",
      message: `write_policy is not defined in defaults: ${writePolicyId}`,
      project_code: project.project_code,
    });
  }

  return errors;
}

function validateProjectSourceGroups(
  project: ProjectRegistryEntry,
): ProjectRegistryValidationWarning[] {
  const warnings: ProjectRegistryValidationWarning[] = [];

  if (!project.optional_sources || project.optional_sources.length === 0) {
    warnings.push({
      code: "optional_sources_empty",
      message: "optional_sources is recommended but empty",
      project_code: project.project_code,
    });
  }

  if (!project.adr_sources || project.adr_sources.length === 0) {
    warnings.push({
      code: "adr_sources_empty",
      message: "adr_sources is recommended but empty",
      project_code: project.project_code,
    });
  }

  if (!project.review_sources || project.review_sources.length === 0) {
    warnings.push({
      code: "review_sources_empty",
      message: "review_sources is optional but currently empty",
      project_code: project.project_code,
    });
  }

  return warnings;
}

function validateSourceGroupPatterns(
  project: ProjectRegistryEntry,
): ProjectRegistryValidationWarning[] {
  const warnings: ProjectRegistryValidationWarning[] = [];

  const groups = [
    ...(project.optional_sources ?? []),
    ...(project.adr_sources ?? []),
    ...(project.review_sources ?? []),
  ];

  for (const group of groups) {
    if (!group.patterns || group.patterns.length === 0) {
      warnings.push({
        code: "source_pattern_group_empty",
        message: `Source group has no patterns: ${group.source_group}`,
        project_code: project.project_code,
      });

      continue;
    }

    for (const pattern of group.patterns) {
      if (!pattern || pattern.trim() === "") {
        warnings.push({
          code: "invalid_source_pattern",
          message: `Source pattern must not be empty in group: ${group.source_group}`,
          project_code: project.project_code,
        });

        continue;
      }

      if (path.isAbsolute(pattern) || pattern.includes("..")) {
        warnings.push({
          code: "invalid_source_pattern",
          message: `Source pattern must be a relative path and must not contain parent directory reference: ${pattern}`,
          path: pattern,
          project_code: project.project_code,
        });

        continue;
      }

      if (!mightMatchExistingPath(pattern)) {
        warnings.push({
          code: "source_pattern_not_found",
          message: `Source pattern may not match existing files: ${pattern}`,
          path: pattern,
          project_code: project.project_code,
        });
      }
    }
  }

  return warnings;
}

function resolveSourceStatusPolicy(
  registry: ProjectRegistryFile,
  project: ProjectRegistryEntry,
): SourceStatusPolicyConfig {
  const resolved = resolveSourceStatusPolicyOrNull(registry, project);

  if (!resolved) {
    throw new Error(
      `source_status_policy is not defined in defaults: ${project.source_status_policy.policy_id}`,
    );
  }

  return resolved;
}

function resolveSourceStatusPolicyOrNull(
  registry: ProjectRegistryFile,
  project: ProjectRegistryEntry,
): SourceStatusPolicyConfig | null {
  const inlinePolicy = project.source_status_policy as Partial<SourceStatusPolicyConfig>;

  if (
    inlinePolicy.include_by_default &&
    inlinePolicy.explicit_only &&
    inlinePolicy.warning_required &&
    inlinePolicy.prohibit_as_final_evidence
  ) {
    return inlinePolicy as SourceStatusPolicyConfig;
  }

  const policyId = project.source_status_policy.policy_id;

  return registry.defaults?.source_status_policies?.[policyId] ?? null;
}

function resolveWritePolicy(
  registry: ProjectRegistryFile,
  project: ProjectRegistryEntry,
): WritePolicyConfig {
  const resolved = resolveWritePolicyOrNull(registry, project);

  if (!resolved) {
    throw new Error(
      `write_policy is not defined in defaults: ${project.write_policy.policy_id}`,
    );
  }

  return resolved;
}

function resolveWritePolicyOrNull(
  registry: ProjectRegistryFile,
  project: ProjectRegistryEntry,
): WritePolicyConfig | null {
  const inlinePolicy = project.write_policy as Partial<WritePolicyConfig>;

  if (
    inlinePolicy.ai_can &&
    inlinePolicy.ai_must_not &&
    inlinePolicy.human_approval_required_for
  ) {
    return inlinePolicy as WritePolicyConfig;
  }

  const policyId = project.write_policy.policy_id;

  return registry.defaults?.write_policies?.[policyId] ?? null;
}

function flattenSourceGroups(
  groups: SourceGroup[],
  sourceType: SourceCandidate["source_type"],
): SourceCandidate[] {
  return groups.flatMap((group) =>
    group.patterns.map((pattern) => ({
      source_type: sourceType,
      source_group: group.source_group,
      path_or_pattern: pattern,
      description: group.description,
    })),
  );
}

/**
 * Lightweight existence heuristic for glob-like patterns.
 *
 * This service does not fully expand glob patterns.
 * Full source selection and glob expansion should be handled by Context Builder.
 *
 * The purpose here is to detect obvious registry mistakes early.
 */
function mightMatchExistingPath(pattern: string): boolean {
  const normalizedPattern = pattern.replace(/\\/g, "/");

  if (!normalizedPattern.includes("*")) {
    return fs.existsSync(path.resolve(normalizedPattern));
  }

  const staticPrefix = normalizedPattern.split("*")[0];
  const directoryPrefix = staticPrefix.endsWith("/")
    ? staticPrefix
    : path.dirname(staticPrefix);

  if (!directoryPrefix || directoryPrefix === ".") {
    return true;
  }

  return fs.existsSync(path.resolve(directoryPrefix));
}
