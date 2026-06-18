#!/usr/bin/env node

import {
  validateAgent,
  validateAgentRegistry,
} from "../services/agentRegistryService";
import type {
  AgentRegistryValidationError,
  AgentRegistryValidationResult,
  AgentRegistryValidationWarning,
} from "../types/registry";

interface CliArgs {
  agent?: string;
  project?: string;
  registry?: string;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  const result = args.agent
    ? await validateAgent({
        agentCode: args.agent,
        projectCode: args.project,
        registryPath: args.registry,
      })
    : await validateAgentRegistry(args.registry);

  printResult(result, args);

  if (!result.ok) {
    process.exitCode = 1;
  }
}

function parseArgs(args: string[]): CliArgs {
  const parsed: CliArgs = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];

    switch (arg) {
      case "--agent":
        parsed.agent = requireValue(arg, next);
        index += 1;
        break;

      case "--project":
        parsed.project = requireValue(arg, next);
        index += 1;
        break;

      case "--registry":
        parsed.registry = requireValue(arg, next);
        index += 1;
        break;

      case "--help":
      case "-h":
        console.log(renderHelp());
        process.exit(0);
        break;

      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (parsed.project && !parsed.agent) {
    throw new Error("--project requires --agent");
  }

  return parsed;
}

function printResult(
  result: AgentRegistryValidationResult,
  args: CliArgs,
): void {
  console.log("Agent Registry Validation");
  console.log("=========================");
  console.log(`Registry: ${args.registry ?? "config/agents.yaml"}`);
  console.log(`Agent: ${args.agent ?? "all"}`);
  console.log(`Project: ${args.project ?? "not specified"}`);
  console.log(`Result: ${result.ok ? "success" : "failed"}`);
  console.log(`Errors: ${result.errors.length}`);
  console.log(`Warnings: ${result.warnings.length}`);

  if (result.completion_check) {
    const check = result.completion_check;

    console.log("\nCompletion Requirements");
    console.log("-----------------------");
    console.log(`P0 Agents Satisfied: ${check.p0_agents_satisfied}`);
    console.log(`P1 Agents Satisfied: ${check.p1_agents_satisfied}`);

    console.log(
      `Required P0 Agents: ${formatList(check.required_p0_agents)}`,
    );
    console.log(
      `Required P1 Agents: ${formatList(check.required_p1_agents)}`,
    );
    console.log(`Missing P0 Agents: ${formatList(check.missing_p0_agents)}`);
    console.log(`Missing P1 Agents: ${formatList(check.missing_p1_agents)}`);
  }

  printErrors(result.errors);
  printWarnings(result.warnings);
}

function printErrors(errors: AgentRegistryValidationError[]): void {
  if (errors.length === 0) {
    return;
  }

  console.error("\nErrors");
  console.error("------");

  for (const error of errors) {
    console.error(formatMessage(error));
  }
}

function printWarnings(warnings: AgentRegistryValidationWarning[]): void {
  if (warnings.length === 0) {
    return;
  }

  console.warn("\nWarnings");
  console.warn("--------");

  for (const warning of warnings) {
    console.warn(formatMessage(warning));
  }
}

function formatMessage(input: {
  code: string;
  message: string;
  path?: string;
  agent_code?: string;
}): string {
  const details = [
    input.agent_code ? `agent=${input.agent_code}` : undefined,
    input.path ? `path=${input.path}` : undefined,
  ].filter((value): value is string => Boolean(value));

  const suffix = details.length > 0 ? ` [${details.join(", ")}]` : "";

  return `- ${input.code}: ${input.message}${suffix}`;
}

function formatList(values: string[]): string {
  return values.length > 0 ? values.join(", ") : "none";
}

function renderHelp(): string {
  return [
    "Agent Registry Validation CLI",
    "",
    "Usage:",
    "  npm run registry:validate:agent",
    "  npm run registry:validate:agent -- --agent <agent_code>",
    "  npm run registry:validate:agent -- --agent <agent_code> --project <project_code>",
    "  npm run registry:validate:agent -- --registry <registry_path>",
    "",
    "Options:",
    "  --agent <code>     Validate one Agent Registry entry.",
    "  --project <code>   Also validate that the agent supports the project.",
    "  --registry <path>  Override the default config/agents.yaml path.",
    "  --help, -h         Show this help.",
  ].join("\n");
}

function requireValue(flag: string, value?: string): string {
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${flag}`);
  }

  return value;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
