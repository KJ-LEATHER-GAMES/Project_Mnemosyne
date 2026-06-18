---
title: "Mnemosyne Memory: Project Summary"
document_id: "docs/projects/mnemosyne/memory/project-summary.md"
document_role: "project_memory"
memory_type: "project_summary"
project_code: "mnemosyne"
status: "active"
version: "1.2.0"
created_at: "2026-06-05"
updated_at: "2026-06-12"
phase: "Phase 2: Context Forge"
milestone: "M2-7: Mnemosyne Context Pack生成検証"
owner: "Project Mnemosyne"
related_documents:
  - "docs/projects/mnemosyne/memory/current-status.md"
  - "docs/projects/mnemosyne/memory/active-decisions.md"
  - "docs/projects/mnemosyne/memory/next-actions.md"
  - "docs/projects/mnemosyne/memory/ai-entrypoint.md"
  - "docs/context/build-report-rule.md"
  - "docs/review/phase-2-mnemosyne-context-pack-validation.md"
---

# Project Summary

## 1. Project Identity

| Item | Value |
|---|---|
| Project Name | Project Mnemosyne |
| Project Code | `mnemosyne` |
| Theme | AI外部記憶基盤を作る |
| Current Phase | Phase 2: Context Forge |
| Current Milestone | M2-7: Mnemosyne Context Pack生成検証 |
| Primary User | 個人開発者 |
| Primary Use Case | Project / Agent / Taskに応じたContext Packを生成し、AI投入前に人間が内容・警告・coverage・token budget・traceabilityを確認する |

## 2. Purpose

Project Mnemosyneは、AIチャットに依存して散在しやすい前提、判断、タスク、課題、検証結果をMarkdown正本として管理し、必要な文脈をAIへ安全かつ再現可能な形で渡すための外部記憶基盤である。

Phase 2では、Project Registry、Agent Registry、Context Build Requestをもとに、Context Pack、Build Report、Context Previewを生成する仕組みを整備する。

## 3. Current Architecture Summary

| Layer | Current Artifact |
|---|---|
| Project Registry | `config/projects.yaml` / `src/services/projectRegistryService.ts` |
| Agent Registry | `config/agents.yaml` / `src/services/agentRegistryService.ts` |
| Context Build Request | request YAML / CLI args |
| Context Builder | `src/cli/context-build.ts` / `src/services/contextBuilderService.ts` |
| Source Resolution | `src/services/sourceResolverService.ts` |
| Build Report | `src/services/buildReportService.ts` / `docs/context/build-report-rule.md` |
| Context Preview | `src/services/contextPreviewService.ts` / `docs/templates/context/context-preview.template.md` |
| Generated Output | `context-pack.md` / `build-report.md` / `context-preview.md` |

標準生成先は以下である。

```text
dist/context/{project_code}/{agent_code}/context-pack.md
dist/context/{project_code}/{agent_code}/build-report.md
dist/context/{project_code}/{agent_code}/context-preview.md
```

## 4. Source of Truth Boundary

Context Pack、Build Report、Context Previewは生成物であり、正本ではない。

正本は以下を優先する。

1. Active / Accepted ADR
2. Active memory / context / phase / requirement documents
3. Project Registry / Agent Registry
4. Human-approved project memory documents
5. Generated Context Pack / Build Report / Context Preview

Context Previewは人間確認用であり、AI input bodyとして使用しない。

## 5. Current Completion Point

M2-6: Context Preview実装は、P0/P1修正と最終レビューを完了し、Active化済みである。

確認済み事項は以下。

- Context Pack、Build Report、Context Previewの3成果物生成
- Source List、Warnings、Source Status Mix、Coverage、Token EstimateのPreview出力
- Agent required contextの構造的coverage判定
- Context CoverageとEvidence Qualityの分離
- `reserveTokensForResponse` を差し引いた実効入力budget判定
- Warning Handlingの表示
- Context Pack / Build Reportとの実データtrace確認
- `ready_for_human_review` と人間承認の分離
- `npm run check`、正常系、draft source系の確認完了

## 6. Current Focus

次の焦点はM2-7である。

Project Mnemosyne自身を対象に、`project_code=mnemosyne` とP0 Agentを使用してContext Packを生成し、Context PackだけでPhase 1 / Phase 2の前提、現在地、Active decision、次作業を復元できるか検証する。
