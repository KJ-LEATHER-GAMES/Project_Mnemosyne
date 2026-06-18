---
title: "Mnemosyne Memory: Active Decisions"
document_id: "docs/projects/mnemosyne/memory/active-decisions.md"
document_role: "project_memory"
memory_type: "active_decisions"
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
  - "docs/projects/mnemosyne/memory/next-actions.md"
  - "docs/context/build-report-rule.md"
  - "docs/review/phase-2-mnemosyne-context-pack-validation.md"
---

# Active Decisions

## 1. Source of Truth Boundary

Context Pack、Build Report、Context Previewは生成物であり、正本ではない。

AI作業で生成物内の情報とActive sourceが競合した場合、Active sourceを優先する。

Context Previewは人間確認用であり、AI input bodyとして使用しない。

## 2. Context Builder Decisions

| Decision ID | Decision | Rationale | Status |
|---|---|---|---|
| M2-5-DEC-001 | Context Builder CLIをPhase 2の中核成果物として採用する | Project / Agent / Taskに応じた文脈生成を自動化するため | active |
| M2-5-DEC-002 | `required_memory_docs` は存在検証対象であり、常時全文投入対象ではない | Registry方針とSource Status Policyに合わせるため | active |
| M2-5-DEC-003 | `active` / `accepted` sourceを通常根拠として採用する | Active正本をwarning扱いしないため | active |
| M2-5-DEC-004 | 非active sourceを明示指定で含める場合はstatus別warningを出す | AIと人間の誤認を防ぐため | active |
| M2-5-DEC-005 | `dist/context/**` は生成物であり、正本へ統合しない | 生成物と正本の境界を維持するため | active |
| M2-5-DEC-006 | `typecheck + lint + format:check` を品質ゲートとする | 実装品質を継続確認するため | active |

## 3. Context Preview Decisions

| Decision ID | Decision | Rationale | Status |
|---|---|---|---|
| M2-6-DEC-001 | Context PreviewをAI投入前の人間確認用成果物として生成する | warning、coverage、token、traceを投入前に確認するため | active |
| M2-6-DEC-002 | Context CoverageとEvidence Qualityを別軸で判定する | 必要情報の有無と根拠の確定度を混同しないため | active |
| M2-6-DEC-003 | Agent required contextはAgent Registryの構造化定義を用いて照合する | 文字列部分一致より決定的で再現可能な判定にするため | active |
| M2-6-DEC-004 | draft等のsourceでもselectorに一致すればCoverageは`covered`とする | レビュー対象として存在することと確定根拠性を分けるため | active |
| M2-6-DEC-005 | 非確定sourceはWarning、Source Status Mix、Evidence Qualityで人間レビュー対象にする | 確定根拠としての利用を防ぐため | active |
| M2-6-DEC-006 | Token超過は`maxTokens - reserveTokensForResponse`の実効入力budgetで判定する | AI応答用tokenを確保するため | active |
| M2-6-DEC-007 | Traceabilityは固定値ではなく生成物本文の実照合で判定する | Preview自体の信頼性を高めるため | active |
| M2-6-DEC-008 | `ready_for_human_review` と `approved_for_ai_input` を分離する | 自動生成と人間承認の境界を維持するため | active |
| M2-6-DEC-009 | Preview生成時の承認状態は`Human Reviewed=no`、`Approved for AI Input=pending`とする | AI投入承認を自動化しないため | active |

## 4. M2-7 Validation Decisions

| Decision ID | Decision | Rationale | Status |
|---|---|---|---|
| M2-7-DEC-001 | Project Mnemosyne自身をPhase 2基盤の検証対象とする | 基盤プロジェクトへ自己適用できることを確認するため | active |
| M2-7-DEC-002 | 初期検証AgentはP0の`requirements_writer`を使用する | Phase 3入力要件整理を代表シナリオとするため | active |
| M2-7-DEC-003 | Context PackだけでAIが現在地を理解できるかを人間評価する | Phase 2の実用性を確認するため | active |
| M2-7-DEC-004 | 不足ContextはBuild Reportおよびvalidation reportへ記録する | Phase 3以降の改善入力として残すため | active |

## 5. Warning Code Policy

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

## 6. Accepted Limitations

| Limitation | Decision |
|---|---|
| Recent Context loader | 現時点ではplaceholder。後続Milestoneで扱う |
| Semantic conflict detection | 未実装。M2-7では人間評価とIssue記録で補完する |
| Token estimate | tokenizer-basedではなくapproximateとして扱う |
| Human Review Decision persistence | Phase 2では生成Preview内の初期欄のみ。永続化は後続検討 |
