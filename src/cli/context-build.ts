#!/usr/bin/env node
import fs from "node:fs";
import YAML from "yaml";

import { buildContextPack } from "../services/contextBuilderService";
import {
  toContextBuildRequestFromCli,
  toContextBuildRequestFromRaw,
  type ContextBuildCliArgs,
  type RawContextBuildRequest,
} from "../types/context";

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2);
  if (rawArgs.includes("--help") || rawArgs.includes("-h")) {
    console.log(renderHelp());
    return;
  }

  const cliArgs = parseArgs(rawArgs);
  const request = cliArgs.request
    ? toContextBuildRequestFromRaw(
        YAML.parse(await fs.promises.readFile(cliArgs.request, "utf8")) as RawContextBuildRequest,
      )
    : toContextBuildRequestFromCli(cliArgs);

  const result = await buildContextPack({ request });

  if (!result.report.ok) {
    console.error(result.buildReportMarkdown);
    process.exitCode = 1;
    return;
  }

  console.log(`Context Pack generated: ${result.contextPackPath}`);
  console.log(`Build Report generated: ${result.buildReportPath}`);
  console.log(`Included sources: ${result.report.includedSources.length}`);
  console.log(`Excluded sources: ${result.report.excludedSources.length}`);
  console.log(`Warnings: ${result.report.warnings.length}`);

  if (result.report.warnings.length > 0) {
    console.log("\nWarnings:");
    for (const warning of result.report.warnings) {
      console.log(`- ${warning.code}: ${warning.message}`);
    }
  }
}

function parseArgs(args: string[]): ContextBuildCliArgs {
  const parsed: ContextBuildCliArgs = {
    source: [],
    sessionNote: [],
    reviewViewpoint: [],
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case "--project":
        parsed.project = requireValue(arg, next);
        i += 1;
        break;
      case "--agent":
        parsed.agent = requireValue(arg, next);
        i += 1;
        break;
      case "--task":
        parsed.task = requireValue(arg, next);
        i += 1;
        break;
      case "--output":
        parsed.output = requireValue(arg, next);
        i += 1;
        break;
      case "--source":
        parsed.source?.push(requireValue(arg, next));
        i += 1;
        break;
      case "--session-note":
        parsed.sessionNote?.push(requireValue(arg, next));
        i += 1;
        break;
      case "--review-viewpoint":
        parsed.reviewViewpoint?.push(requireValue(arg, next));
        i += 1;
        break;
      case "--recent":
        if (next && !next.startsWith("--")) {
          parsed.recent = next;
          i += 1;
        } else {
          parsed.recent = true;
        }
        break;
      case "--no-recent":
        parsed.noRecent = true;
        break;
      case "--max-tokens":
        parsed.maxTokens = Number(requireValue(arg, next));
        i += 1;
        break;
      case "--reserve-tokens-for-response":
        parsed.reserveTokensForResponse = Number(requireValue(arg, next));
        i += 1;
        break;
      case "--build-mode":
        parsed.buildMode = requireValue(arg, next);
        i += 1;
        break;
      case "--request":
        parsed.request = requireValue(arg, next);
        i += 1;
        break;
      case "--help":
      case "-h":
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return parsed;
}

function renderHelp(): string {
  return [
    "Mnemosyne Context Builder CLI",
    "",
    "Usage:",
    "  npm run context:build -- --project <project_code> --agent <agent_code> --task <task_request>",
    "  npm run context:build -- --request <context-build-request.yaml>",
    "",
    "Options:",
    "  --project <code>                    Project code, e.g. ats or mnemosyne.",
    "  --agent <code>                      Agent code, e.g. implementation_reviewer.",
    "  --task <text>                       Task request used as Task Context.",
    "  --output <type>                     Optional output type.",
    "  --source <path>                     Additional source path. Can be repeated.",
    "  --session-note <text>               Session Context note. Can be repeated.",
    "  --review-viewpoint <text>           Review viewpoint. Can be repeated.",
    "  --recent [conversation-summary]     Include Recent Context placeholder.",
    "  --no-recent                         Do not include Recent Context.",
    "  --max-tokens <number>               Max token budget.",
    "  --reserve-tokens-for-response <n>   Reserved response tokens.",
    "  --build-mode <mode>                 minimal / standard / full / debug.",
    "  --request <path>                    Load Context Build Request YAML.",
    "  --help, -h                          Show this help.",
    "",
    "Examples:",
    '  npm run context:build -- --project ats --agent implementation_reviewer --task "reward request usecase review"',
    "  npm run context:build -- --request context-build-request.yaml",
  ].join("\n");
}

function requireValue(flag: string, value?: string): string {
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${flag}`);
  }
  return value;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
