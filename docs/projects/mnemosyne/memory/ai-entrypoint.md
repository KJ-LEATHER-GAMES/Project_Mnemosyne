---
title: "Mnemosyne Memory: AI Entrypoint"
document_id: "docs/projects/mnemosyne/memory/ai-entrypoint.md"
document_role: "project_memory"
memory_type: "ai_entrypoint"
project_code: "mnemosyne"
status: "active"
version: "1.1.0"
created_at: "2026-06-05"
updated_at: "2026-06-10"
phase: "Phase 2: Context Forge"
milestone: "M2-5: Context Builder初期実装"
owner: "Project Mnemosyne"
related_documents:
  - "docs/projects/mnemosyne/memory/project-summary.md"
  - "docs/projects/mnemosyne/memory/current-status.md"
  - "docs/projects/mnemosyne/memory/active-decisions.md"
  - "docs/projects/mnemosyne/memory/next-actions.md"
  - "docs/review/m2-5-context-builder-active-review.md"
---

# AI Entrypoint

## 1. Minimal Reading Set

Project Mnemosyneの作業を開始するAIは、まず以下を読む。

1. `docs/projects/mnemosyne/memory/project-summary.md`
2. `docs/projects/mnemosyne/memory/current-status.md`
3. `docs/projects/mnemosyne/memory/active-decisions.md`
4. `docs/projects/mnemosyne/memory/next-actions.md`
5. `docs/review/m2-5-context-builder-active-review.md`

## 2. Current Working Context

現在の主要作業は、M2-5 Context Builder初期実装をProject Mnemosyne正本ディレクトリへ統合し、統合後の再確認を行うことである。

M2-5は、Project Registry、Agent Registry、Context Build RequestをもとにContext PackとBuild Reportを生成するCLIである。

## 3. Important Rules

- Context PackとBuild Reportは生成物であり、正本ではない。
- `dist/context/**` は正本へ統合しない。
- `docs/review/*.md` は正規review source候補であり、テストfixture置き場にしない。
- test fixtureは `tests/fixtures/context-builder` に置く。
- draft sourceを明示指定で含める場合は `draft_source_included` warningを出す。
- Active sourceは `status=active` として通常採用し、warningを出さない。
- Recent Context loaderとsemantic conflict detectionはM2-5では未実装である。

## 4. Commands

統合後確認：

```bash
npm install
npm run check
npm run context:build -- --help
npm run context:build -- --project ats --agent implementation_reviewer --task "reward request usecase review"
npm run context:build -- --project mnemosyne --agent implementation_reviewer --task "context builder implementation review"
```

Fixture確認：

```bash
npm run context:build -- --project ats --agent implementation_reviewer --task "active additional source test" --source tests/fixtures/context-builder/temp-review-note.md
npm run context:build -- --project ats --agent implementation_reviewer --task "draft additional source test" --source tests/fixtures/context-builder/draft-review-note.md
```

## 5. Do Not Treat As Final

以下は未実装または後続改善であり、完了済み機能として扱わない。

- Recent Context loader
- Semantic conflict detection
- tokenizer-based token estimate
- BOM検出warning

