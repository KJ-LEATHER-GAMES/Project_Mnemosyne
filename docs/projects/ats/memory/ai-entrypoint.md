---

title: "ATS AI Entrypoint"
document_id: "docs/projects/ats/memory/ai-entrypoint.md"
document_role: "project_memory"
template_applied: "docs/templates/memory/ai-entrypoint.template.md"
project_code: "ats"
project_name: "Adventure Token System"
status: "draft"
version: "0.1.0"
created_at: "2026-06-05"
updated_at: "2026-06-05"
approved_at: null
phase: "Phase 1: Memory Foundation"
milestone: "M1-5: ATS適用検証"
related_documents:

- "docs/projects/ats/memory/project-summary.md"
- "docs/projects/ats/memory/current-status.md"
- "docs/projects/ats/memory/active-decisions.md"
- "docs/projects/ats/memory/next-actions.md"

---

# AI Entrypoint

## What This Project Is

Adventure Token System、以下ATSは、家庭内の行動報告・ポイント付与・履歴管理・ごほうび交換をLINE Botで扱う家庭内ゲーミフィケーションシステムである。

ATSは、子どもが日々の行動を前向きに報告し、ポイントやごほうびを通じて積み上げを実感できるようにすることを目的とする。

このプロジェクトでは、単なる機能実装だけでなく、以下を重視する。

* 家庭内ポイント経済のバランス
* 子どもが続けられる報告導線
* 親の運用負荷の低減
* DB正本とNotion副本の役割分離
* LINE Botのpostback契約
* UseCase責務とトランザクション境界
* 設計判断のMarkdown docs化
* 開発過程のnote記事化

## What the AI Should Read First

When supporting ATS, read the following documents in this order.

| Order | Document                                         | Purpose                              |
| ----: | ------------------------------------------------ | ------------------------------------ |
|     1 | `docs/projects/ats/memory/project-summary.md`    | ATSの目的、背景、範囲、正本構造を把握する               |
|     2 | `docs/projects/ats/memory/current-status.md`     | 現在地、Issue、Pending Decision、直近状態を把握する |
|     3 | `docs/projects/ats/memory/active-decisions.md`   | 現在有効な設計判断・制約を確認する                    |
|     4 | `docs/projects/ats/memory/next-actions.md`       | Task正本として、次にやる作業と完了条件を確認する           |
|     5 | `docs/review/phase-1-ats-template-validation.md` | M1-5の検証結果とテンプレート改善点を確認する             |

## Reading Rules

| Rule ID     | Rule                                                   | Reason                                       |
| ----------- | ------------------------------------------------------ | -------------------------------------------- |
| ATS-AI-R001 | Decisionを回答根拠にする場合は、必ず `active-decisions.md` を優先する     | 古い会話ログの案を現在判断と誤認しないため                        |
| ATS-AI-R002 | Taskを回答根拠にする場合は、必ず `next-actions.md` を優先する             | Task正本を一元化し、`current-status.md` との二重管理を避けるため |
| ATS-AI-R003 | `current-status.md` は状態把握に使い、Taskの詳細定義には使わない           | Current Statusはサマリーであり、Task正本ではないため          |
| ATS-AI-R004 | 曖昧な案はDecision扱いせず、Issue / Idea / Pending Decisionとして扱う | 未承認の案を確定判断にしないため                             |
| ATS-AI-R005 | Notion情報だけを根拠にDB正本や設計判断を上書きしない                         | Notionは可視化用副本であるため                           |
| ATS-AI-R006 | 仕様変更を提案する場合は、影響範囲、更新対象docs、テスト観点をセットで示す                | 実装・運用・docsの不整合を防ぐため                          |
| ATS-AI-R007 | 子ども向けUXでは、理想的な運用より継続しやすさを優先する                          | その都度報告は負荷が高い可能性があるため                         |
| ATS-AI-R008 | ポイント設計では、短期的な楽しさだけでなくインフレ防止を評価する                       | 家庭内ポイント経済を壊さないため                             |

## Important Constraints

| Constraint ID | Constraint                                          | Practical Meaning              |
| ------------- | --------------------------------------------------- | ------------------------------ |
| ATS-CON-001   | PostgreSQLを実行時データの正本、Notionを副本として扱う                 | DB更新・集計・冪等性はPostgreSQL基準で判断する  |
| ATS-CON-002   | docsを設計判断・仕様整理の正本として扱う                              | 会話ログだけを根拠に現在仕様を断定しない           |
| ATS-CON-003   | AIはdocs更新案を作成できるが、正本反映は人間承認後とする                     | draft作成まで。write済みと表現しない        |
| ATS-CON-004   | 所持ポイントと累計ポイントを分離する                                  | ごほうび交換で累計ポイントを減らさない            |
| ATS-CON-005   | レベル倍率による恒久的なポイント増加は採用しない                            | ポイント経済のインフレを避ける                |
| ATS-CON-006   | action_selectでは冪等性、cooldown、daily_limit、DB更新整合を崩さない | UseCaseレビュー時の必須観点              |
| ATS-CON-007   | Ver1.1案は正式仕様化されるまで実装済み扱いしない                         | 改善候補と現在仕様を混同しない                |
| ATS-CON-008   | Task詳細は `next-actions.md` に集約する                     | `current-status.md` との二重管理を避ける |

## Available Document Sources

### Project Memory

| Source                                         | Role                       | Priority |
| ---------------------------------------------- | -------------------------- | -------- |
| `docs/projects/ats/memory/project-summary.md`  | ATSの安定した概要                 | high     |
| `docs/projects/ats/memory/current-status.md`   | 現在地・Issue・Pending Decision | high     |
| `docs/projects/ats/memory/active-decisions.md` | 有効な判断・制約                   | highest  |
| `docs/projects/ats/memory/next-actions.md`     | Task正本                     | highest  |
| `docs/projects/ats/memory/ai-entrypoint.md`    | AI支援入口                     | high     |

### Review Documents

| Source                                           | Role       | Priority    |
| ------------------------------------------------ | ---------- | ----------- |
| `docs/review/phase-1-ats-template-validation.md` | M1-5検証結果   | high        |
| `docs/review/context-source-conflicts/`          | 正本間競合Issue | conditional |

### ATS Design Documents

The following documents are expected to exist or be created as ATS design sources. If they are absent, treat them as candidate sources, not confirmed files.

| Candidate Source               | Expected Role                      |
| ------------------------------ | ---------------------------------- |
| `docs/usecase-contracts.md`    | UseCase入出力契約                       |
| `docs/domain-rules.md`         | ポイント、cooldown、daily_limit等のドメインルール |
| `docs/database-design.md`      | DB設計                               |
| `docs/repository-contracts.md` | Repository責務                       |
| `docs/test-results/`           | 実機確認・DB確認・Renderログ確認               |
| `docs/reward-design.md`        | ごほうび設計                             |
| `docs/version-plans/`          | Ver1.1改善案                          |

## Rules for Drafting Changes

When drafting ATS changes, follow this order.

1. Identify the target memory type.

   * Decision
   * Task
   * Issue
   * Idea
   * Test Result
   * Article Note

2. Check the source of truth.

   * Decision → `active-decisions.md`
   * Task → `next-actions.md`
   * Status / Issue → `current-status.md`
   * Stable overview → `project-summary.md`

3. Separate confirmed items from candidates.

   * confirmed → fact / decision / active task
   * not confirmed → pending decision / issue / idea

4. Propose update targets.

   * Which docs should be changed
   * Which docs should not be changed
   * Whether ADR is needed

5. Include validation impact.

   * DB impact
   * UseCase impact
   * LINE Bot impact
   * Notion sync impact
   * test impact
   * article impact, if useful

## Known Risks of Misinterpretation

| Risk ID      | Risk                                    | Safer Handling                                       |
| ------------ | --------------------------------------- | ---------------------------------------------------- |
| ATS-RISK-001 | 古い会話案を現在有効な仕様と誤認する                      | `active-decisions.md` を確認し、未記載なら候補扱いする               |
| ATS-RISK-002 | `current-status.md` のTask要約をTask正本と誤認する | Task詳細は `next-actions.md` のみを見る                      |
| ATS-RISK-003 | Notionを正本DBと誤認する                        | Notionは副本・可視化用と明示する                                  |
| ATS-RISK-004 | 所持ポイントと累計ポイントを混同する                      | 所持は消費可能、累計は減らない積み上げとして扱う                             |
| ATS-RISK-005 | Ver1.1案を実装済みと誤認する                       | `next-actions.md` と `current-status.md` のstatusを確認する |
| ATS-RISK-006 | 子どもが理想通りに毎回報告できる前提で設計する                 | 未報告一覧・夜まとめ報告など支援導線を検討する                              |
| ATS-RISK-007 | 楽しさ重視でポイントインフレを起こす                      | cooldown、daily_limit、小中大ごほうび設計を確認する                  |
| ATS-RISK-008 | 実装レビュー時にDB更新と返信生成だけを見て、冪等性を見落とす         | processed_events、event_id、transaction境界を確認する         |

## Agent Use Cases

| Agent Type    | Required ATS Context                                                  | Optional Context                 | Expected Output  |
| ------------- | --------------------------------------------------------------------- | -------------------------------- | ---------------- |
| Docs Agent    | project-summary / current-status / active-decisions / next-actions    | usecase-contracts / domain-rules | docs更新案          |
| Task Agent    | current-status / next-actions / active-decisions                      | conversation-summary             | Task整理案          |
| Review Agent  | active-decisions / usecase-contracts / database-design / test-results | current-status                   | 設計レビュー結果         |
| ADR Agent     | active-decisions / project-summary                                    | related design notes             | ADRドラフト          |
| Article Agent | project-summary / active-decisions / article_note                     | development logs                 | note記事ドラフト       |
| Context Agent | ai-entrypoint / project-summary / current-status / next-actions       | review documents                 | Context Pack入力整理 |

## Default Response Policy for AI

When answering ATS questions, the AI should:

* State whether the answer is based on active docs, draft docs, or conversation memory.
* Avoid treating ideas as decisions.
* Identify docs that should be updated if the answer changes project state.
* Prefer compact but structured answers.
* Preserve the distinction between:

  * implementation status
  * design decision
  * task status
  * future idea
  * article note
* End with a short update candidate if the user is clearly making a new decision.

## Change History

| Version | Date       | Status | Change Summary                                       | Approved By |
| ------- | ---------- | ------ | ---------------------------------------------------- | ----------- |
| 0.1.0   | 2026-06-05 | draft  | M1-5 ATS適用検証用にAI Entrypoint初期ドラフトを作成。Task正本参照ルールを明記。 | 未承認         |
