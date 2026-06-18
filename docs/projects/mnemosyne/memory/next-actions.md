---
title: "Mnemosyne Memory: Next Actions"
document_id: "docs/projects/mnemosyne/memory/next-actions.md"
document_role: "project_memory"
memory_type: "next_actions"
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
  - "docs/projects/mnemosyne/memory/ai-entrypoint.md"
  - "docs/review/phase-2-mnemosyne-context-pack-validation.md"
---

# Next Actions

## 1. Source of Truth Note

本書はProject MnemosyneにおけるTask正本である。

`current-status.md` は状態サマリーであり、Task定義の正本ではない。

## 2. Active Tasks

| Task ID | Priority | Task | Purpose | Completion Criteria | task_status | Updated At |
|---|---|---|---|---|---|---|
| M2-7-TASK-001 | P0 | `project_code=mnemosyne`、`agent=requirements_writer`でContext Packを生成する | Project Mnemosyne自身へContext Forgeを適用する | Context Pack、Build Report、Context Previewの3成果物が生成される | todo | 2026-06-12 |
| M2-7-TASK-002 | P0 | Phase 3入力要件整理シナリオを実行する | Phase 1 / 2前提をContext Packだけで復元できるか確認する | AIが目的、現在地、Active decision、次作業を説明できる | todo | 2026-06-12 |
| M2-7-TASK-003 | P0 | Context Pack単独理解性を評価する | 追加会話なしで作業開始できるか確認する | 理解可否、誤読、追加質問、不足情報を記録する | todo | 2026-06-12 |
| M2-7-TASK-004 | P0 | Build Report / Context Previewを評価する | source選定、warning、coverage、token、traceを確認する | 人間がAI投入可否を判断できる | todo | 2026-06-12 |
| M2-7-TASK-005 | P0 | 不足Contextと競合候補を記録する | Phase 2の改善点を明確にする | Build Reportまたはvalidation reportに不足・影響・改善案を記載する | todo | 2026-06-12 |
| M2-7-TASK-006 | P0 | `docs/review/phase-2-mnemosyne-context-pack-validation.md` を完成させる | M2-7検証結果を正規review成果物として残す | シナリオ、入力、出力、判定、Issue、Phase 2への結論が記録される | todo | 2026-06-12 |
| M2-7-TASK-007 | P1 | requirements_writer以外の代表Agentによる補助検証を検討する | Agent差によるContext選定の妥当性を確認する | 実施要否と対象Agentをvalidation reportへ記録する | todo | 2026-06-12 |

## 3. M2-7 Validation Scenarios

| Scenario ID | Scenario | Agent | Main Check |
|---|---|---|---|
| M2-V-001 | Phase 3入力要件を整理する | `requirements_writer` | Phase 1 / 2の前提が復元できるか |
| M2-V-002 | ADR草案に必要な判断材料を整理する | `adr_writer` または補助検証対象 | Active decisionと未決事項を区別できるか |
| M2-V-003 | 現在地と次作業を説明する | `requirements_writer` | Current StatusとTask正本を区別できるか |

M2-V-001を必須とし、M2-V-002 / M2-V-003はM2-7検証計画に応じて実施する。

## 4. Completed Tasks

| Task ID | Task | Result | Completed At |
|---|---|---|---|
| M2-5-COMPLETE | Context Builder初期実装 | CLI、source resolution、Build Report、品質ゲートをActive化 | 2026-06-10 |
| M2-6-DRAFT | Context Previewドラフト作成 | 仕様、テンプレート、Service、出力例を作成 | 2026-06-10 |
| M2-6-INTEGRATION | Context Builder / CLI接続 | 3成果物の一括生成を確認 | 2026-06-10 |
| M2-6-COVERAGE | Agent required context厳密化 | Agent Registryの構造化定義による照合を実装 | 2026-06-10 |
| M2-6-ACTIVE | P0/P1反映と最終レビュー | Blocking issueなし、Active完了 | 2026-06-12 |

## 5. Deferred / Future Tasks

| Task ID | Priority | Task | Reason |
|---|---|---|---|
| M2-FUTURE-001 | P1 | BOM検出warning `bom_detected` をBuild Reportへ追加する | Reader側BOM吸収で現時点のbuildは可能 |
| M2-FUTURE-002 | P1 | tokenizer-based token estimateを導入する | Phase 2ではapproximateで許容 |
| M2-FUTURE-003 | P1 | Recent Context loaderを実装する | 現在はplaceholder |
| M2-FUTURE-004 | P1 | Semantic conflict detectionを実装する | M2-7では人間評価で補完 |
| M2-FUTURE-005 | P2 | Human Review Decisionを生成物外へ永続化する | 再生成時上書き問題は後続API / 運用で検討 |
