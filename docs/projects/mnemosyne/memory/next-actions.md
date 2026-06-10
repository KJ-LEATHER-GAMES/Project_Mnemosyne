---
title: "Mnemosyne Memory: Next Actions"
document_id: "docs/projects/mnemosyne/memory/next-actions.md"
document_role: "project_memory"
memory_type: "next_actions"
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
  - "docs/review/m2-5-context-builder-active-review.md"
---

# Next Actions

## 1. Source of Truth Note

本書はProject MnemosyneにおけるTask正本である。

`current-status.md` は状態サマリーであり、Task定義の正本ではない。

## 2. Active Tasks

| Task ID | Priority | Task | Purpose | Completion Criteria | task_status | Updated At |
|---|---|---|---|---|---|---|
| M2-5-TASK-001 | P0 | M2-5 Context Builder更新版ドラフトを正本ディレクトリへ統合する | CLI実装をProject Mnemosyne本体へ反映する | 反映対象ファイルが正本ディレクトリへ配置され、`npm run check` が成功する | todo | 2026-06-10 |
| M2-5-TASK-002 | P0 | 統合後のContext Pack生成を確認する | 環境差分による破損を検出する | ATS / Mnemosyne両方でContext PackとBuild Reportが生成される | todo | 2026-06-10 |
| M2-5-TASK-003 | P0 | M2-5 Active化レビュー記録を正本へ追加する | 完了判断の根拠を後から追跡できるようにする | `docs/review/m2-5-context-builder-active-review.md` が配置される | todo | 2026-06-10 |
| M2-5-TASK-004 | P1 | BOM検出warningの必要性を検討する | source encoding問題をBuild Report上で見える化する | 後続Milestoneへ送るかM2内で扱うか判断する | todo | 2026-06-10 |
| M2-5-TASK-005 | P1 | Recent Context loaderの実装Milestoneを決める | M2-5でplaceholderとなっている機能の後続作業を整理する | 後続Taskとして登録するか判断する | todo | 2026-06-10 |
| M2-5-TASK-006 | P1 | Semantic conflict detectionの扱いを整理する | Active source競合検出をどのPhaseで扱うか決める | 後続PhaseまたはM2追加Milestoneへ送る | todo | 2026-06-10 |

## 3. Completed Tasks

| Task ID | Task | Result | Completed At |
|---|---|---|---|
| M2-5-DRAFT-001 | Context Builder初期ドラフト作成 | CLI / Service / Source Resolver / Build Reportを作成 | 2026-06-09 |
| M2-5-REV-001 | 動作確認とActive化前レビュー | P0/P1修正点を抽出 | 2026-06-09 |
| M2-5-REV-002 | frontmatter / status handling修正 | active / draft metadata解決を確認 | 2026-06-10 |
| M2-5-REV-003 | 品質ゲートとhelp対応 | `npm run check`, `--help`, `-h` 成功 | 2026-06-10 |
| M2-5-REV-004 | warning code標準化とfixture分離 | `draft_source_included` とfixture移動を確認 | 2026-06-10 |

## 4. Deferred / Future Tasks

| Task ID | Priority | Task | Reason |
|---|---|---|---|
| M2-FUTURE-001 | P1 | BOM検出warning `bom_detected` をBuild Reportへ追加する | M2-5ではBOM吸収までで十分と判断 |
| M2-FUTURE-002 | P1 | tokenizer-based token estimateを導入する | 現状はapproximateで許容 |
| M2-FUTURE-003 | P1 | Recent Context loaderを実装する | M2-5ではplaceholder |
| M2-FUTURE-004 | P1 | Semantic conflict detectionを実装する | M2-5では未実装範囲として明記 |

