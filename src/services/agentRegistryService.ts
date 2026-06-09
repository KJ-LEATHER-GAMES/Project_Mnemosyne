import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

import type {
  AgentCode,
  AgentCompletionCheckResult,
  AgentContextCandidates,
  AgentContextRequirement,
  AgentOutputContractOverride,
  AgentPriority,
  AgentRegistryEntry,
  AgentRegistryFile,
  AgentRegistryValidationError,
  AgentRegistryValidationResult,
  AgentRegistryValidationWarning,
  AgentScope,
  OutputContractConfig,
  OutputContractId,
  ProjectCode,
  ResolvedAgentOutputContract,
  ResolvedAgentRegistry,
  WritePolicyConfig,
  WritePolicyId,
} from "../types/registry";

const DEFAULT_AGENTS_YAML_PATH = "config/agents.yaml";

const VALID_AGENT_PRIORITIES: AgentPriority[] = ["P0", "P1", "P2", "Later"];

const VALID_AGENT_SCOPES: AgentScope[] = [
  "project_independent",
  "project_specific",
  "experimental",
];

const VALID_OUTPUT_CONTRACTS: OutputContractId[] = [
  "adr_draft",
  "requirements_document",
  "implementation_review_report",
  "task_breakdown",
  "article_draft",
];

const VALID_WRITE_POLICIES: WritePolicyId[] = ["draft_only"];

const DEFAULT_REQUIRED_P0_AGENTS: AgentCode[] = [
  "adr_writer",
  "requirements_writer",
];

const DEFAULT_REQUIRED_P1_AGENTS: AgentCode[] = [
  "implementation_reviewer",
  "task_planner",
];

export async function loadAgentRegistry(
  registryPath = DEFAULT_AGENTS_YAML_PATH,
): Promise<AgentRegistryFile> {
  const absolutePath = path.resolve(registryPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Agent Registry file not found: ${absolutePath}`);
  }

  const raw = await fs.promises.readFile(absolutePath, "utf8");
  const parsed = YAML.parse(raw) as AgentRegistryFile;

  validateAgentRegistryShapeOrThrow(parsed, absolutePath);

  return parsed;
}

export async function resolveAgentRegistry(input: {
  agentCode: AgentCode;
  projectCode?: ProjectCode;
  registryPath?: string;
}): Promise<ResolvedAgentRegistry> {
  const registry = await loadAgentRegistry(input.registryPath);
  const agent = findAgent(registry, input.agentCode);

  if (!agent) {
    throw new Error(`Agent not found in Agent Registry: ${input.agentCode}`);
  }

  if (input.projectCode && !supportsProject(agent, input.projectCode)) {
    throw new Error(
      `Agent does not support project: agent=${input.agentCode}, project=${input.projectCode}`,
    );
  }

  const defaultOutputContract = resolveDefaultOutputContract(registry, agent);
  const outputContract = resolveAgentOutputContract(registry, agent);
  const writePolicy = resolveAgentWritePolicy(registry, agent);

  return {
    agent,
    default_output_contract: defaultOutputContract,
    output_contract: outputContract,
    write_policy: writePolicy,
  };
}

export async function validateAgentRegistry(
  registryPath = DEFAULT_AGENTS_YAML_PATH,
): Promise<AgentRegistryValidationResult> {
  const errors: AgentRegistryValidationError[] = [];
  const warnings: AgentRegistryValidationWarning[] = [];

  let registry: AgentRegistryFile;

  try {
    registry = await loadAgentRegistry(registryPath);
  } catch (error) {
    return {
      ok: false,
      errors: [
        {
          code: "agent_registry_file_invalid",
          message: error instanceof Error ? error.message : "Invalid Agent Registry file",
          path: registryPath,
        },
      ],
      warnings: [],
    };
  }

  errors.push(...validateDuplicateAgentCodes(registry));
  errors.push(...validateCompletionRequirements(registry));

  for (const agent of registry.agents) {
    errors.push(...validateAgentRequiredFields(agent));
    errors.push(...validateAgentPriorityAndScope(agent));
    errors.push(...validateAgentPolicies(registry, agent));
    errors.push(...validateAgentContextRequirements(agent));

    warnings.push(...validateAgentWarnings(agent));
  }

  const completionCheck = checkAgentCompletionRequirements(registry);

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    completion_check: completionCheck,
  };
}

export async function validateAgent(input: {
  agentCode: AgentCode;
  projectCode?: ProjectCode;
  registryPath?: string;
}): Promise<AgentRegistryValidationResult> {
  const registry = await loadAgentRegistry(input.registryPath);
  const agent = findAgent(registry, input.agentCode);

  if (!agent) {
    return {
      ok: false,
      agent_code: input.agentCode,
      errors: [
        {
          code: "agent_not_found",
          message: `Agent not found in Agent Registry: ${input.agentCode}`,
          agent_code: input.agentCode,
        },
      ],
      warnings: [],
    };
  }

  const errors: AgentRegistryValidationError[] = [
    ...validateAgentRequiredFields(agent),
    ...validateAgentPriorityAndScope(agent),
    ...validateAgentPolicies(registry, agent),
    ...validateAgentContextRequirements(agent),
  ];

  if (input.projectCode && !supportsProject(agent, input.projectCode)) {
    errors.push({
      code: "invalid_supported_project_code",
      message: `Agent does not support project: ${input.projectCode}`,
      agent_code: agent.agent_code,
    });
  }

  const warnings = validateAgentWarnings(agent);

  return {
    ok: errors.length === 0,
    agent_code: agent.agent_code,
    errors,
    warnings,
  };
}

export async function listAgentContextCandidates(input: {
  agentCode: AgentCode;
  registryPath?: string;
}): Promise<AgentContextCandidates> {
  const { agent } = await resolveAgentRegistry({
    agentCode: input.agentCode,
    registryPath: input.registryPath,
  });

  return {
    agent_code: agent.agent_code,
    required_context: agent.required_context,
    optional_context: agent.optional_context ?? [],
  };
}

export function findAgent(
  registry: AgentRegistryFile,
  agentCode: AgentCode,
): AgentRegistryEntry | undefined {
  return registry.agents.find((agent) => agent.agent_code === agentCode);
}

export function supportsProject(
  agent: AgentRegistryEntry,
  projectCode: ProjectCode,
): boolean {
  return (
    agent.supported_project_codes.includes("*") ||
    agent.supported_project_codes.includes(projectCode)
  );
}

export function checkAgentCompletionRequirements(
  registry: AgentRegistryFile,
): AgentCompletionCheckResult {
  const requiredP0Agents =
    registry.completion_requirements?.required_p0_agents ?? DEFAULT_REQUIRED_P0_AGENTS;
  const requiredP1Agents =
    registry.completion_requirements?.required_p1_agents ?? DEFAULT_REQUIRED_P1_AGENTS;

  const existingAgents = new Set(registry.agents.map((agent) => agent.agent_code));

  const missingP0Agents = requiredP0Agents.filter(
    (agentCode) => !existingAgents.has(agentCode),
  );
  const missingP1Agents = requiredP1Agents.filter(
    (agentCode) => !existingAgents.has(agentCode),
  );

  return {
    required_p0_agents: requiredP0Agents,
    required_p1_agents: requiredP1Agents,
    missing_p0_agents: missingP0Agents,
    missing_p1_agents: missingP1Agents,
    p0_agents_satisfied: missingP0Agents.length === 0,
    p1_agents_satisfied: missingP1Agents.length === 0,
  };
}

function validateAgentRegistryShapeOrThrow(
  registry: AgentRegistryFile,
  registryPath: string,
): void {
  if (!registry || typeof registry !== "object") {
    throw new Error(`Agent Registry is not an object: ${registryPath}`);
  }

  if (!Array.isArray(registry.agents)) {
    throw new Error(`Agent Registry must have agents array: ${registryPath}`);
  }
}

function validateDuplicateAgentCodes(
  registry: AgentRegistryFile,
): AgentRegistryValidationError[] {
  const errors: AgentRegistryValidationError[] = [];
  const seen = new Set<string>();

  for (const agent of registry.agents) {
    if (seen.has(agent.agent_code)) {
      errors.push({
        code: "duplicate_agent_code",
        message: `Duplicate agent_code found: ${agent.agent_code}`,
        agent_code: agent.agent_code,
      });
    }

    seen.add(agent.agent_code);
  }

  return errors;
}

function validateCompletionRequirements(
  registry: AgentRegistryFile,
): AgentRegistryValidationError[] {
  const errors: AgentRegistryValidationError[] = [];
  const completionCheck = checkAgentCompletionRequirements(registry);

  for (const agentCode of completionCheck.missing_p0_agents) {
    errors.push({
      code: "required_p0_agent_missing",
      message: `Required P0 agent is missing: ${agentCode}`,
      agent_code: agentCode,
    });
  }

  for (const agentCode of completionCheck.missing_p1_agents) {
    errors.push({
      code: "required_p1_agent_missing",
      message: `Required P1 agent is missing: ${agentCode}`,
      agent_code: agentCode,
    });
  }

  for (const agentCode of completionCheck.required_p0_agents) {
    const agent = findAgent(registry, agentCode);

    if (agent && agent.priority !== "P0") {
      errors.push({
        code: "required_agent_priority_mismatch",
        message: `Required P0 agent must have priority P0: ${agentCode}`,
        agent_code: agentCode,
      });
    }
  }

  for (const agentCode of completionCheck.required_p1_agents) {
    const agent = findAgent(registry, agentCode);

    if (agent && agent.priority !== "P1") {
      errors.push({
        code: "required_agent_priority_mismatch",
        message: `Required P1 agent must have priority P1: ${agentCode}`,
        agent_code: agentCode,
      });
    }
  }

  return errors;
}

function validateAgentRequiredFields(
  agent: AgentRegistryEntry,
): AgentRegistryValidationError[] {
  const errors: AgentRegistryValidationError[] = [];

  if (!agent.agent_code) {
    errors.push({
      code: "missing_required_field",
      message: "agent_code is required",
    });
  }

  if (!agent.agent_name) {
    errors.push({
      code: "missing_required_field",
      message: "agent_name is required",
      agent_code: agent.agent_code,
    });
  }

  if (!agent.priority) {
    errors.push({
      code: "missing_required_field",
      message: "priority is required",
      agent_code: agent.agent_code,
    });
  }

  if (!agent.agent_scope) {
    errors.push({
      code: "missing_required_field",
      message: "agent_scope is required",
      agent_code: agent.agent_code,
    });
  }

  if (!Array.isArray(agent.supported_project_codes) || agent.supported_project_codes.length === 0) {
    errors.push({
      code: "missing_required_field",
      message: "supported_project_codes must be a non-empty array",
      agent_code: agent.agent_code,
    });
  }

  if (!agent.role) {
    errors.push({
      code: "missing_required_field",
      message: "role is required",
      agent_code: agent.agent_code,
    });
  }

  if (!Array.isArray(agent.responsibilities) || agent.responsibilities.length === 0) {
    errors.push({
      code: "missing_required_field",
      message: "responsibilities must be a non-empty array",
      agent_code: agent.agent_code,
    });
  }

  if (!Array.isArray(agent.out_of_scope)) {
    errors.push({
      code: "missing_required_field",
      message: "out_of_scope must be an array",
      agent_code: agent.agent_code,
    });
  }

  if (!Array.isArray(agent.required_context) || agent.required_context.length === 0) {
    errors.push({
      code: "missing_required_field",
      message: "required_context must be a non-empty array",
      agent_code: agent.agent_code,
    });
  }

  if (!Array.isArray(agent.allowed_operations) || agent.allowed_operations.length === 0) {
    errors.push({
      code: "missing_required_field",
      message: "allowed_operations must be a non-empty array",
      agent_code: agent.agent_code,
    });
  }

  if (!Array.isArray(agent.forbidden_operations) || agent.forbidden_operations.length === 0) {
    errors.push({
      code: "missing_required_field",
      message: "forbidden_operations must be a non-empty array",
      agent_code: agent.agent_code,
    });
  }

  if (!agent.default_output_contract) {
    errors.push({
      code: "missing_required_field",
      message: "default_output_contract is required",
      agent_code: agent.agent_code,
    });
  }

  if (!agent.output_contract) {
    errors.push({
      code: "missing_required_field",
      message: "output_contract is required",
      agent_code: agent.agent_code,
    });
  }

  if (!agent.write_policy) {
    errors.push({
      code: "missing_required_field",
      message: "write_policy is required",
      agent_code: agent.agent_code,
    });
  }

  return errors;
}

function validateAgentPriorityAndScope(
  agent: AgentRegistryEntry,
): AgentRegistryValidationError[] {
  const errors: AgentRegistryValidationError[] = [];

  if (agent.priority && !VALID_AGENT_PRIORITIES.includes(agent.priority)) {
    errors.push({
      code: "invalid_agent_priority",
      message: `Invalid agent priority: ${agent.priority}`,
      agent_code: agent.agent_code,
    });
  }

  if (agent.agent_scope && !VALID_AGENT_SCOPES.includes(agent.agent_scope)) {
    errors.push({
      code: "invalid_agent_scope",
      message: `Invalid agent scope: ${agent.agent_scope}`,
      agent_code: agent.agent_code,
    });
  }

  if (agent.agent_scope === "project_independent" && !agent.supported_project_codes.includes("*")) {
    errors.push({
      code: "invalid_supported_project_code",
      message: "project_independent agent must support '*' project scope",
      agent_code: agent.agent_code,
    });
  }

  if (agent.agent_scope === "project_specific") {
    errors.push({
      code: "project_specific_agent_in_initial_registry",
      message: "Initial M2-3 Agent Registry must not contain project_specific agents",
      agent_code: agent.agent_code,
    });
  }

  return errors;
}

function validateAgentPolicies(
  registry: AgentRegistryFile,
  agent: AgentRegistryEntry,
): AgentRegistryValidationError[] {
  const errors: AgentRegistryValidationError[] = [];

  if (!agent.default_output_contract || !agent.output_contract || !agent.write_policy) {
    return errors;
  }

  const defaultOutputContractId = getOutputContractId(agent.default_output_contract);
  const outputContractId = getOutputContractId(agent.output_contract);

  if (!VALID_OUTPUT_CONTRACTS.includes(defaultOutputContractId)) {
    errors.push({
      code: "invalid_output_contract",
      message: `Invalid default_output_contract: ${defaultOutputContractId}`,
      agent_code: agent.agent_code,
    });
  }

  if (!VALID_OUTPUT_CONTRACTS.includes(outputContractId)) {
    errors.push({
      code: "invalid_output_contract",
      message: `Invalid output_contract: ${outputContractId}`,
      agent_code: agent.agent_code,
    });
  }

  if (defaultOutputContractId && !resolveOutputContractOrNull(registry, defaultOutputContractId)) {
    errors.push({
      code: "invalid_output_contract",
      message: `default_output_contract is not defined in defaults: ${defaultOutputContractId}`,
      agent_code: agent.agent_code,
    });
  }

  if (outputContractId && !resolveOutputContractOrNull(registry, outputContractId)) {
    errors.push({
      code: "invalid_output_contract",
      message: `output_contract is not defined in defaults: ${outputContractId}`,
      agent_code: agent.agent_code,
    });
  }

  const writePolicyId = agent.write_policy.policy_id;

  if (!VALID_WRITE_POLICIES.includes(writePolicyId)) {
    errors.push({
      code: "invalid_write_policy",
      message: `Invalid write_policy: ${writePolicyId}`,
      agent_code: agent.agent_code,
    });
  }

  if (writePolicyId && !resolveWritePolicyOrNull(registry, agent)) {
    errors.push({
      code: "invalid_write_policy",
      message: `write_policy is not defined in defaults: ${writePolicyId}`,
      agent_code: agent.agent_code,
    });
  }

  return errors;
}

function validateAgentContextRequirements(
  agent: AgentRegistryEntry,
): AgentRegistryValidationError[] {
  const requirements = [
    ...(agent.required_context ?? []),
    ...(agent.optional_context ?? []),
  ];

  return requirements.flatMap((requirement) =>
    validateContextRequirement(agent, requirement),
  );
}

function validateContextRequirement(
  agent: AgentRegistryEntry,
  requirement: AgentContextRequirement,
): AgentRegistryValidationError[] {
  const errors: AgentRegistryValidationError[] = [];

  if (!requirement.context_id || requirement.context_id.trim() === "") {
    errors.push({
      code: "invalid_context_requirement",
      message: "context_id is required",
      agent_code: agent.agent_code,
    });
  }

  if (!requirement.source_type) {
    errors.push({
      code: "invalid_context_requirement",
      message: "source_type is required",
      agent_code: agent.agent_code,
      context_id: requirement.context_id,
    });
  }

  if (!requirement.purpose || requirement.purpose.trim() === "") {
    errors.push({
      code: "invalid_context_requirement",
      message: "purpose is required",
      agent_code: agent.agent_code,
      context_id: requirement.context_id,
    });
  }

  if (!requirement.inclusion || !["required", "optional"].includes(requirement.inclusion)) {
    errors.push({
      code: "invalid_context_requirement",
      message: "inclusion must be required or optional",
      agent_code: agent.agent_code,
      context_id: requirement.context_id,
    });
  }

  for (const documentName of requirement.document_names ?? []) {
    if (!isSafeRelativePath(documentName)) {
      errors.push({
        code: "invalid_context_path",
        message: `document_names must be safe relative file names: ${documentName}`,
        agent_code: agent.agent_code,
        context_id: requirement.context_id,
        path: documentName,
      });
    }
  }

  for (const candidatePath of requirement.paths ?? []) {
    if (!isSafeRelativePath(candidatePath)) {
      errors.push({
        code: "invalid_context_path",
        message: `paths must be safe relative paths: ${candidatePath}`,
        agent_code: agent.agent_code,
        context_id: requirement.context_id,
        path: candidatePath,
      });
    }
  }

  return errors;
}

function validateAgentWarnings(
  agent: AgentRegistryEntry,
): AgentRegistryValidationWarning[] {
  const warnings: AgentRegistryValidationWarning[] = [];

  if (agent.status && agent.status !== "active") {
    warnings.push({
      code: "agent_status_not_active",
      message: `Agent status is not active: ${agent.status}`,
      agent_code: agent.agent_code,
    });
  }

  if (!agent.optional_context || agent.optional_context.length === 0) {
    warnings.push({
      code: "optional_context_empty",
      message: "optional_context is recommended but empty",
      agent_code: agent.agent_code,
    });
  }

  if (agent.supported_project_codes.includes("*")) {
    warnings.push({
      code: "agent_all_projects_scope",
      message: "Agent supports all projects. Confirm this is intentional.",
      agent_code: agent.agent_code,
    });
  }

  if (agent.priority === "Later") {
    warnings.push({
      code: "later_agent_registered",
      message: "Later-priority agent is registered but is not required for M2-3 Active completion.",
      agent_code: agent.agent_code,
    });
  }

  if (agent.agent_scope === "project_specific") {
    warnings.push({
      code: "project_specific_scope_declared",
      message: "Project-specific agent scope should be handled by future presets or extensions.",
      agent_code: agent.agent_code,
    });
  }

  if (isOutputOverride(agent.output_contract)) {
    const additionalRequirements = agent.output_contract.additional_requirements ?? [];

    if (additionalRequirements.length === 0) {
      warnings.push({
        code: "output_contract_has_no_additional_requirements",
        message: "output_contract override has no additional_requirements",
        agent_code: agent.agent_code,
      });
    }
  }

  return warnings;
}

function resolveDefaultOutputContract(
  registry: AgentRegistryFile,
  agent: AgentRegistryEntry,
): OutputContractConfig {
  const outputContractId = getOutputContractId(agent.default_output_contract);
  const resolved = resolveOutputContractOrNull(registry, outputContractId);

  if (!resolved) {
    throw new Error(`output_contract is not defined in defaults: ${outputContractId}`);
  }

  return resolved;
}

function resolveAgentOutputContract(
  registry: AgentRegistryFile,
  agent: AgentRegistryEntry,
): ResolvedAgentOutputContract {
  const outputContractId = getOutputContractId(agent.output_contract);
  const base = resolveOutputContractOrNull(registry, outputContractId);

  if (!base) {
    throw new Error(`output_contract is not defined in defaults: ${outputContractId}`);
  }

  const additionalRequirements = isOutputOverride(agent.output_contract)
    ? agent.output_contract.additional_requirements ?? []
    : [];

  return {
    ...base,
    additional_requirements: additionalRequirements,
  };
}

function resolveOutputContractOrNull(
  registry: AgentRegistryFile,
  outputContractId: OutputContractId,
): OutputContractConfig | null {
  return registry.defaults?.output_contracts?.[outputContractId] ?? null;
}

function resolveAgentWritePolicy(
  registry: AgentRegistryFile,
  agent: AgentRegistryEntry,
): WritePolicyConfig {
  const resolved = resolveWritePolicyOrNull(registry, agent);

  if (!resolved) {
    throw new Error(`write_policy is not defined in defaults: ${agent.write_policy.policy_id}`);
  }

  return resolved;
}

function resolveWritePolicyOrNull(
  registry: AgentRegistryFile,
  agent: AgentRegistryEntry,
): WritePolicyConfig | null {
  const inlinePolicy = agent.write_policy as Partial<WritePolicyConfig>;

  if (
    inlinePolicy.ai_can &&
    inlinePolicy.ai_must_not &&
    inlinePolicy.human_approval_required_for
  ) {
    return inlinePolicy as WritePolicyConfig;
  }

  const policyId = agent.write_policy.policy_id;

  return registry.defaults?.write_policies?.[policyId] ?? null;
}

function getOutputContractId(
  outputContract: AgentRegistryEntry["output_contract"],
): OutputContractId {
  return outputContract.output_contract_id;
}

function isOutputOverride(
  outputContract: AgentRegistryEntry["output_contract"],
): outputContract is AgentOutputContractOverride {
  return "additional_requirements" in outputContract;
}

function isSafeRelativePath(candidatePath: string): boolean {
  if (!candidatePath || candidatePath.trim() === "") {
    return false;
  }

  if (path.isAbsolute(candidatePath)) {
    return false;
  }

  const normalized = candidatePath.replace(/\\/g, "/");

  if (normalized.split("/").includes("..")) {
    return false;
  }

  return true;
}
