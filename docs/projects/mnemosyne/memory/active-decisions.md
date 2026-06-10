---
title: "Mnemosyne Memory: Active Decisions"
document_id: "docs/projects/mnemosyne/memory/active-decisions.md"
document_role: "project_memory"
memory_type: "active_decisions"
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
  - "docs/projects/mnemosyne/memory/next-actions.md"
  - "docs/review/m2-5-context-builder-active-review.md"
---

# Active Decisions

## 1. Source of Truth Boundary

Context PackとBuild Reportは生成物であり、正本ではない。

AI作業でContext Pack内の情報とActive sourceが競合した場合、Active sourceを優先する。

## 2. M2-5 Active Decisions

| Decision ID | Decision | Rationale | Status |
|---|---|---|---|
| M2-5-DEC-001 | Context Builder CLIをPhase 2の中核成果物として採用する | Project / Agent / Taskに応じた文脈生成を自動化するため | active |
| M2-5-DEC-002 | `required_memory_docs` は存在検証対象であり、常時全文投入対象ではない | Project Registry方針とSource Status Policyに合わせるため | active |
| M2-5-DEC-003 | source statusはfrontmatterから抽出し、`active` / `accepted` を通常採用する | Active正本をwarning扱いしないため | active |
| M2-5-DEC-004 | draft等の非active sourceを明示指定で含める場合はstatus別warning codeを出す | 後続レビューや自動判定を安定させるため | active |
| M2-5-DEC-005 | test fixtureは `docs/review` ではなく `tests/fixtures/context-builder` に置く | 正規review source候補への混入を防ぐため | active |
| M2-5-DEC-006 | `dist/context/**` は生成物であり、正本として統合しない | Context Packを正本扱いしないため | active |
| M2-5-DEC-007 | ESLint / Prettier / TypeScript checkをM2-5品質ゲートに含める | 実装成果物として最低限の品質を保証するため | active |

## 3. Warning Code Policy

| Source Status | Included Explicitly | Warning Code |
|---|---:|---|
| `active` | yes / default | none |
| `accepted` | yes / default | none |
| `draft` | yes | `draft_source_included` |
| `proposed` | yes | `proposed_source_included` |
| `archived` | yes | `archived_source_included` |
| `deprecated` | yes | `deprecated_source_included` |
| `superseded` | yes | `superseded_source_included` |
| `unknown` | conditional | `unknown_status` |

## 4. Accepted Limitations

| Limitation | Decision |
|---|---|
| Recent Context loader | M2-5ではplaceholderとして扱う |
| Semantic conflict detection | M2-5では未実装として明記する |
| Token estimate | approximateとして扱う |
| BOM warning | 読込時BOM吸収は実施。Build Report warning化は後続改善候補 |

