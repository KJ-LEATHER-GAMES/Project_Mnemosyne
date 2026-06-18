#!/usr/bin/env node

import {
  validateProjectRegistry,
  validateProjectRequiredMemoryDocs,
} from "../services/projectRegistryService";
import type {
  ProjectRegistryValidationError,
  ProjectRegistryValidationResult,
  ProjectRegistryValidationWarning,
} from "../types/registry";

interface CliArgs {
  project?: string;
  registry?: string;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  const result = args.project
    ? await validateProjectRequiredMemoryDocs({
        projectCode: args.project,
        registryPath: args.registry,
      })
    : await validateProjectRegistry(args.registry);

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

  return parsed;
}

function printResult(
  result: ProjectRegistryValidationResult,
  args: CliArgs,
): void {
  console.log("Project Registry Validation");
  console.log("===========================");
  console.log(`Registry: ${args.registry ?? "config/projects.yaml"}`);
  console.log(`Project: ${args.project ?? "all"}`);
  console.log(`Result: ${result.ok ? "success" : "failed"}`);
  console.log(`Errors: ${result.errors.length}`);
  console.log(`Warnings: ${result.warnings.length}`);

  if (result.required_docs_check) {
    const check = result.required_docs_check;

    console.log("\nRequired Memory Documents");
    console.log("-------------------------");
    console.log(`Memory Root: ${check.memory_root}`);
    console.log(
      `Standard Documents Satisfied: ${check.standard_docs_satisfied}`,
    );
    console.log(`Missing Documents: ${check.missing_docs.length}`);

    for (const doc of check.required_docs) {
      console.log(
        `- ${doc.file_name}: ${doc.exists ? "exists" : "missing"} (${doc.resolved_path})`,
      );
    }
  }

  printErrors(result.errors);
  printWarnings(result.warnings);
}

function printErrors(errors: ProjectRegistryValidationError[]): void {
  if (errors.length === 0) {
    return;
  }

  console.error("\nErrors");
  console.error("------");

  for (const error of errors) {
    console.error(formatMessage(error));
  }
}

function printWarnings(warnings: ProjectRegistryValidationWarning[]): void {
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
  project_code?: string;
}): string {
  const details = [
    input.project_code ? `project=${input.project_code}` : undefined,
    input.path ? `path=${input.path}` : undefined,
  ].filter((value): value is string => Boolean(value));

  const suffix = details.length > 0 ? ` [${details.join(", ")}]` : "";

  return `- ${input.code}: ${input.message}${suffix}`;
}

function renderHelp(): string {
  return [
    "Project Registry Validation CLI",
    "",
    "Usage:",
    "  npm run registry:validate:project",
    "  npm run registry:validate:project -- --project <project_code>",
    "  npm run registry:validate:project -- --registry <registry_path>",
    "",
    "Options:",
    "  --project <code>   Validate required memory documents for one project.",
    "  --registry <path>  Override the default config/projects.yaml path.",
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
