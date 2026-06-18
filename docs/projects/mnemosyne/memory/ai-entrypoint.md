---
title: "Mnemosyne Memory: AI Entrypoint"
document_id: "docs/projects/mnemosyne/memory/ai-entrypoint.md"
document_role: "project_memory"
memory_type: "ai_entrypoint"
project_code: "mnemosyne"
status: "active"
version: "1.2.0"
created_at: "2026-06-05"
updated_at: "2026-06-12"
phase: "Phase 2: Context Forge"
milestone: "M2-7: Mnemosyne Context Pack生成検証"
owner: "Project Mnemosyne"
related_documents:
  - "docs/projects/mnemosyne/memory/project-summary.md"
  - "docs/projects/mnemosyne/memory/current-status.md"
  - "docs/projects/mnemosyne/memory/active-decisions.md"
  - "docs/projects/mnemosyne/memory/next-actions.md"
  - "docs/context/build-report-rule.md"
  - "docs/review/phase-2-mnemosyne-context-pack-validation.md"
---

# AI Entrypoint

## 1. Entrypoint Boundary

本書はProject MnemosyneをAIが読み始めるための入口である。

本書自体はDecision、Task、Issueの正本ではない。

- Decision正本：`active-decisions.md` およびAccepted ADR
- Task正本：`next-actions.md`
- Current state：`current-status.md`

## 2. Minimal Reading Set

Project Mnemosyneの作業を開始するAIは、まず以下を読む。

1. `docs/projects/mnemosyne/memory/project-summary.md`
2. `docs/projects/mnemosyne/memory/current-status.md`
3. `docs/projects/mnemosyne/memory/active-decisions.md`
4. `docs/projects/mnemosyne/memory/next-actions.md`
5. `docs/context/build-report-rule.md`

M2-7の検証結果を確認する場合は、次も読む。

6. `docs/review/phase-2-mnemosyne-context-pack-validation.md`

## 3. Current Working Context

M2-6 Context Preview実装はActive完了した。

現在の主要作業はM2-7であり、Project Mnemosyne自身のContext Packを生成し、Context PackだけでAIが現在地と前提を理解できるかを検証することである。

必須代表シナリオは以下。

```text
project_code=mnemosyne
agent=requirements_writer
task=Phase 3入力要件を整理する
```

## 4. Important Rules

- Context Pack、Build Report、Context Previewは生成物であり、正本ではない。
- Context PreviewはAI input bodyとして使用しない。
- AIへ渡す前にContext Previewのwarning、coverage、token budget、traceabilityを人間が確認する。
- Context CoverageとEvidence Qualityを混同しない。
- draft / proposed / archived / deprecated / superseded / unknown sourceは確定根拠として扱わない。
- `ready_for_human_review` はAI投入承認済みを意味しない。
- Preview生成時は `Human Reviewed=no`、`Approved for AI Input=pending` を維持する。
- Taskの正本は `next-actions.md` であり、`current-status.md` は状態サマリーである。
- M2-7で発見した不足Contextは、Build Reportまたはvalidation reportに記録する。

## 5. M2-7 Recommended Command

```bash
npm run check
npm run context:build -- --project mnemosyne --agent requirements_writer --task "Phase 3 input requirements preparation"
```

生成後、以下を確認する。

```text
dist/context/mnemosyne/requirements_writer/context-pack.md
dist/context/mnemosyne/requirements_writer/build-report.md
dist/context/mnemosyne/requirements_writer/context-preview.md
```

## 6. M2-7 Review Questions

AIまたは人間レビューでは、少なくとも以下を確認する。

1. Project Mnemosyneの目的を説明できるか。
2. Phase 1の前提とPhase 2の成果を区別できるか。
3. M2-6完了とM2-7開始を認識できるか。
4. Active decisionと未決事項を区別できるか。
5. 次作業をTask正本から説明できるか。
6. Phase 3入力要件整理を開始するための情報が足りるか。
7. 足りない情報を具体的に指摘できるか。

## 7. Do Not Treat As Final

以下は未実装または後続改善であり、完了済み機能として扱わない。

- Recent Context loader
- Semantic conflict detection
- tokenizer-based token estimate
- Human Review Decisionの外部永続化
