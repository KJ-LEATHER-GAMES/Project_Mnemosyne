---
title: "Mnemosyne Memory: Project Summary"
document_id: "docs/projects/mnemosyne/memory/project-summary.md"
document_role: "project_memory"
memory_type: "project_summary"
project_code: "mnemosyne"
status: "active"
version: "1.1.0"
created_at: "2026-06-05"
updated_at: "2026-06-10"
phase: "Phase 2: Context Forge"
milestone: "M2-5: Context Builder初期実装"
owner: "Project Mnemosyne"
related_documents:
  - "docs/projects/mnemosyne/memory/current-status.md"
  - "docs/projects/mnemosyne/memory/active-decisions.md"
  - "docs/projects/mnemosyne/memory/next-actions.md"
  - "docs/projects/mnemosyne/memory/ai-entrypoint.md"
  - "docs/review/m2-5-context-builder-active-review.md"
---

# Project Summary

## 1. Project Identity

| Item | Value |
|---|---|
| Project Name | Project Mnemosyne |
| Project Code | `mnemosyne` |
| Theme | AI外部記憶基盤を作る |
| Current Phase | Phase 2: Context Forge |
| Current Milestone | M2-5: Context Builder初期実装 |
| Primary User | 個人開発者 |
| Primary Use Case | AI作業に必要なProject / Agent / Task Contextを再利用可能なMarkdown Context Packとして生成する |

## 2. Purpose

Project Mnemosyneは、AIチャットに依存して散らばりやすい前提・判断・タスク・検証結果を、Markdown正本として管理し、必要な文脈をAIへ安全に渡すための外部記憶基盤である。

Phase 2では、Project Registry、Agent Registry、Context Build Requestをもとに、Context Packを生成する仕組みを整備する。

## 3. Current Architecture Summary

| Layer | Current Artifact |
|---|---|
| Project Registry | `config/projects.yaml` / `src/services/projectRegistryService.ts` |
| Agent Registry | `config/agents.yaml` / `src/services/agentRegistryService.ts` |
| Context Build Request | request YAML / CLI args |
| Context Builder | `src/cli/context-build.ts` / `src/services/contextBuilderService.ts` |
| Source Resolution | `src/services/sourceResolverService.ts` |
| Build Report | `src/services/buildReportService.ts` |
| Generated Output | `dist/context/{project_code}/{agent_code}/context-pack.md` / `build-report.md` |

## 4. Source of Truth Boundary

Context PackとBuild Reportは生成物であり、正本ではない。

正本は以下を優先する。

1. Active ADR
2. Active memory / context / phase / requirement documents
3. Project Registry / Agent Registry
4. Human-approved project memory documents
5. Generated Context Pack / Build Report

## 5. Current Completion Point

M2-5: Context Builder初期実装は、更新版ドラフトの検証によりActive化可能と判断された。

主な確認済み事項は以下。

- `npm run check` 成功
- `--help` / `-h` 成功
- ATS / Mnemosyne Context Pack生成成功
- active source metadata解決成功
- draft source warning code `draft_source_included` 確認済み
- test fixtureを `docs/review` から `tests/fixtures/context-builder` へ分離済み

