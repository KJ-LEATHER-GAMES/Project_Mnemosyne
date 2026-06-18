---
title: "Phase 2 Mnemosyne Context Pack Validation"
document_id: "docs/review/phase-2-mnemosyne-context-pack-validation.md"
document_role: "validation_report"
status: "draft"
version: "0.1.0"
created_at: "2026-06-11"
updated_at: "2026-06-11"
phase: "Phase 2: Context Forge"
milestone: "M2-7: Mnemosyne Context Pack生成検証"
project_code: "mnemosyne"
owner: "Project Mnemosyne"
review_status: "draft"
related_documents:
  - "docs/phases/phase-2-context-forge.md"
  - "docs/phases/phase-2-input-requirements.md"
  - "docs/context/context-pack-structure.md"
  - "docs/context/build-report-rule.md"
  - "docs/context/source-status-policy.md"
  - "docs/projects/mnemosyne/memory/project-summary.md"
  - "docs/projects/mnemosyne/memory/current-status.md"
  - "docs/projects/mnemosyne/memory/active-decisions.md"
  - "docs/projects/mnemosyne/memory/next-actions.md"
  - "docs/projects/mnemosyne/memory/ai-entrypoint.md"
  - "config/projects.yaml"
  - "config/agents.yaml"
  - "dist/context/mnemosyne/requirements_writer/context-pack.md"
  - "dist/context/mnemosyne/requirements_writer/build-report.md"
---

# Phase 2 Mnemosyne Context Pack Validation

## 1. Status

`draft`

本書は、M2-7：Mnemosyne Context Pack生成検証の計画、実施記録、評価結果、およびPhase 3への引継ぎ課題を整理するドラフト版検証レポートである。

本ドラフト作成時点では、M2-7のContext Pack生成およびAI投入検証は未実施である。  
実行結果を確認していない項目は、`not_run`、`pending`、または `TBD` として明示し、成功扱いしない。

---

## 2. Purpose

Project Mnemosyne自身の文脈をContext Packとして生成し、Phase 2で構築した以下の仕組みが、基盤プロジェクト自身にも適用できることを確認する。

- Project RegistryによるProject Context解決
- Agent RegistryによるAgent Context解決
- Context Build RequestによるTask Context指定
- Context Builderによるsource選択とContext Pack生成
- Build Reportによる採用・除外・警告・不足Contextの可視化
- Context PreviewまたはContext Packを用いた人間レビュー
- AIによる現在地、Active Decisions、Next Actionsの復元

本検証では、単にファイルが生成できることだけではなく、生成されたContext PackだけをAIへ渡した場合に、Project Mnemosyneの現在地と次の要件整理対象を誤解なく復元できるかを確認する。

---

## 3. Validation Scope

### 3.1 In Scope

| Scope ID | Validation Target | Description |
|---|---|---|
| M2-7-SCP-001 | Project resolution | `project_code=mnemosyne` からProject Registryを解決できること |
| M2-7-SCP-002 | Agent resolution | P0 Agent `requirements_writer` を解決できること |
| M2-7-SCP-003 | Required memory docs | 標準5文書の存在検証が成功すること |
| M2-7-SCP-004 | Context selection | Agent Required ContextとTask Requestに応じてsourceが選定されること |
| M2-7-SCP-005 | Context Pack generation | 規定パスへContext Packを生成できること |
| M2-7-SCP-006 | Build Report generation | 規定パスへBuild Reportを生成できること |
| M2-7-SCP-007 | Source traceability | Context Pack内の情報をSource Listから元sourceへ追跡できること |
| M2-7-SCP-008 | Current-position recovery | AIがPhase 2の現在地を復元できること |
| M2-7-SCP-009 | Decision recovery | AIがActive Decisionsと主要制約を復元できること |
| M2-7-SCP-010 | Task recovery | AIがNext ActionsとTask正本の境界を復元できること |
| M2-7-SCP-011 | Missing-context reporting | 不足ContextをBuild Reportまたは検証結果へ記録できること |
| M2-7-SCP-012 | Phase 3 handoff | Phase 3入力要件へ回す課題を抽出できること |

### 3.2 Out of Scope

| Out-of-Scope ID | Item | Reason |
|---|---|---|
| M2-7-OOS-001 | RAG / Vector Searchの実装検証 | Phase 3以降の対象 |
| M2-7-OOS-002 | Embedding生成品質の検証 | Phase 3以降の対象 |
| M2-7-OOS-003 | API / MCP経由のContext取得 | Phase 4 / Phase 5以降の対象 |
| M2-7-OOS-004 | AIによるActive正本の自動更新 | `draft_only` のWrite Policyに反する |
| M2-7-OOS-005 | Recent Context loaderの完全検証 | 現行実装では未実装またはplaceholder |
| M2-7-OOS-006 | Semantic conflict detectionの完全検証 | 現行実装では構造的warningまで |
| M2-7-OOS-007 | tokenizerと完全一致するtoken計測 | 現行実装は近似見積もり |

---

## 4. Validation Principles

1. Context Packは生成物であり、正本として扱わない。
2. Activeまたはaccepted sourceを確定根拠として優先する。
3. draft、proposed、archived、deprecated、superseded、unknown sourceを含める場合はwarningを確認する。
4. Context Pack生成成功と、AIが十分な文脈を復元できることを別々に評価する。
5. AIの回答に含まれる事実は、Context PackのSource Listまたは元sourceへ追跡できることを確認する。
6. Context Packに書かれていない情報を、AIが推測で補完した場合は復元成功とみなさない。
7. 不足Contextは失敗として隠さず、Build Reportまたは本書のIssueとして明示する。
8. AIによる要件案はdraftとして扱い、人間承認前にActive要件へ昇格させない。

---

## 5. Validation Environment

実施時に以下を記録する。

| Item | Value |
|---|---|
| Validation Date | TBD |
| Repository / Working Directory | TBD |
| Git Commit / Package Version | TBD |
| Node.js Version | TBD |
| npm Version | TBD |
| OS | TBD |
| Builder Name | TBD |
| Builder Version | TBD |
| Project Registry | `config/projects.yaml` |
| Agent Registry | `config/agents.yaml` |
| Source Status Policy | Expected: `active_preferred` |
| Write Policy | Expected: `draft_only` |
| Build Mode | Expected: `standard` |
| Token Budget | TBD |
| AI Client / Model | TBD |
| Validator | TBD |

---

## 6. Primary Validation Scenario

### 6.1 Scenario Definition

| Item | Value |
|---|---|
| Scenario ID | `M2-V-001` |
| Scenario | Phase 3入力要件を整理する |
| Project Code | `mnemosyne` |
| Agent Code | `requirements_writer` |
| Agent Priority | P0 |
| Expected Output Type | `requirements_document` |
| Main Check | Phase 1 / Phase 2の前提、現在地、Active Decisions、Next Actionsを復元できること |
| Required Deliverable | Phase 3入力要件ドラフトまたは整理案 |
| Validation Status | `not_run` |

### 6.2 Task Request

標準のTask Requestは、以下を使用する。

```text
Project MnemosyneのPhase 3: Recall Engineに向けた入力要件を整理してください。
Phase 1とPhase 2で確定した前提、現在地、Active Decisions、Next Actionsを参照し、
目的、Scope、Out of Scope、機能要件、非機能要件、成果物、完了条件、
Open Issues、Phase 3へ引き継ぐ課題を含む要件定義ドラフトを作成してください。
未承認事項は確定要件として扱わず、Context不足は明示してください。
```

### 6.3 Expected CLI Example

実際のCLI仕様に合わせて必要に応じて修正する。

```bash
npm run context:build -- \
  --project mnemosyne \
  --agent requirements_writer \
  --task "Project MnemosyneのPhase 3: Recall Engineに向けた入力要件を整理する" \
  --output-type requirements_document
```

Windows Command Promptで実行する場合の例：

```bat
npm run context:build -- --project mnemosyne --agent requirements_writer --task "Project MnemosyneのPhase 3: Recall Engineに向けた入力要件を整理する" --output-type requirements_document
```

### 6.4 Expected Outputs

```text
dist/context/mnemosyne/requirements_writer/context-pack.md
dist/context/mnemosyne/requirements_writer/build-report.md
```

Context Previewを同時生成する実装の場合は、以下も確認対象とする。

```text
dist/context/mnemosyne/requirements_writer/context-preview.md
```

---

## 7. Required Source Expectations

### 7.1 Required Memory Document Existence Check

以下の5文書がProject Registry上で宣言され、実ファイルが存在することを確認する。

| Document | Purpose | Expected |
|---|---|---|
| `project-summary.md` | Projectの目的、Scope、Out of Scope | exists |
| `current-status.md` | 現在のPhase、Milestone、進捗、Known Issues | exists |
| `active-decisions.md` | 有効な判断、制約、正本境界 | exists |
| `next-actions.md` | Task正本、優先度、完了条件 | exists |
| `ai-entrypoint.md` | AIが読む入口とReading Set | exists |

`required_memory_docs` は存在検証対象であり、全5文書が常にContext Packへ全文投入されることを要求しない。

### 7.2 Requirements Writer Required Context

Agent Registry上、`requirements_writer` に最低限必要なContextは以下とする。

| Context ID | Expected Source | Inclusion |
|---|---|---|
| `project_summary` | `project-summary.md` | required |
| `active_decisions` | `active-decisions.md` | required |
| `current_status` | `current-status.md` | required |

### 7.3 Task-Relevant Optional Context

M2-V-001では、Phase 3入力要件の整理に必要なため、以下のContextを追加採用候補とする。

| Source Category | Candidate | Reason |
|---|---|---|
| Task source of truth | `next-actions.md` | Phase 2残課題と次タスクを復元するため |
| Phase plan | `docs/phases/phase-2-context-forge.md` | M2-7完了条件とPhase 2完了条件を確認するため |
| Phase input | `docs/phases/phase-2-input-requirements.md` | Phase 2へ引き継がれた前提を確認するため |
| Existing Phase 3 requirements | Phase 3入力要件またはPhase 3要件文書 | 既存内容との重複・競合を確認するため |
| Context structure | `docs/context/context-pack-structure.md` | Context Packの正本性・構造制約を確認するため |
| Build report rule | `docs/context/build-report-rule.md` | 不足Contextと警告の記録方法を確認するため |
| Active ADRs | `docs/adr/*.md` | Phase 3要件を制約する判断を確認するため |

上記が自動選定されない場合は、Task Requestまたは `--source` による明示追加を検討し、その必要性自体を検証結果へ記録する。

---

## 8. Execution Procedure

### 8.1 Pre-Check

| Step | Procedure | Expected Result | Actual Result | Status |
|---:|---|---|---|---|
| 1 | 正本ディレクトリで依存関係を導入する | install成功 | TBD | not_run |
| 2 | `npm run check` を実行する | typecheck / lint / format check成功 | TBD | not_run |
| 3 | Project Registry validationを実行する | `mnemosyne` が有効、標準5文書が存在 | TBD | not_run |
| 4 | Agent Registry validationを実行する | `requirements_writer` がP0 Active Agentとして有効 | TBD | not_run |
| 5 | 既存出力を退避または削除する | 新旧成果物を混同しない | TBD | not_run |

### 8.2 Context Build

| Step | Procedure | Expected Result | Actual Result | Status |
|---:|---|---|---|---|
| 1 | M2-V-001のCLIを実行する | exit code 0 | TBD | not_run |
| 2 | Context Packの生成を確認する | 規定パスに存在 | TBD | not_run |
| 3 | Build Reportの生成を確認する | 規定パスに存在 | TBD | not_run |
| 4 | Context Preview生成対象なら存在を確認する | 規定パスに存在 | TBD | not_run |
| 5 | 生成物の文字化け・BOM影響を確認する | Markdownとして正常に読める | TBD | not_run |

### 8.3 Build Report Review

| Step | Check | Expected Result | Actual Result | Status |
|---:|---|---|---|---|
| 1 | Generation Result | `success` または妥当なwarning付き成功 | TBD | not_run |
| 2 | Project Code | `mnemosyne` | TBD | not_run |
| 3 | Agent Code | `requirements_writer` | TBD | not_run |
| 4 | Output Type / Contract | `requirements_document` | TBD | not_run |
| 5 | Required Docs Check | missing 0、standard docs satisfied | TBD | not_run |
| 6 | Required Context Coverage | project summary / active decisions / current statusがcovered | TBD | not_run |
| 7 | Included Sources | 選定理由を追跡可能 | TBD | not_run |
| 8 | Excluded Sources | 除外理由を追跡可能 | TBD | not_run |
| 9 | Warnings | 件数、severity、handlingが妥当 | TBD | not_run |
| 10 | Errors | 0件 | TBD | not_run |
| 11 | Token Estimate | budget内、近似であることを明記 | TBD | not_run |
| 12 | Unsupported Features | 現行制限が明記されている | TBD | not_run |

### 8.4 Context Pack Structural Review

| Check ID | Check | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| CP-001 | Context Packが正本ではないと明記 | yes | TBD | not_run |
| CP-002 | Build Metadataがある | yes | TBD | not_run |
| CP-003 | Agent Contextが `requirements_writer` と一致 | yes | TBD | not_run |
| CP-004 | Project ContextがMnemosyneを示す | yes | TBD | not_run |
| CP-005 | Current Statusを参照できる | yes | TBD | not_run |
| CP-006 | Active Decisionsを参照できる | yes | TBD | not_run |
| CP-007 | Next ActionsまたはTask正本の情報を参照できる | yes | TBD | not_run |
| CP-008 | Task ContextがM2-V-001と一致 | yes | TBD | not_run |
| CP-009 | Constraints / Write Policyが `draft_only` | yes | TBD | not_run |
| CP-010 | WarningsがSource Listより前にある | yes | TBD | not_run |
| CP-011 | Source Listから元sourceへ追跡可能 | yes | TBD | not_run |
| CP-012 | Build Report Summaryがある | yes | TBD | not_run |

---

## 9. AI Recovery Test

### 9.1 Test Method

1. 新しいチャットまたはProject Mnemosyneの事前知識を持たないAIセッションを用意する。
2. 生成したContext Packのみを入力する。
3. M2-V-001のTask Requestを与える。
4. AIの回答を保存する。
5. 元sourceを参照して、回答内容の正確性、網羅性、推測混入を評価する。
6. Context Pack外の会話履歴や追加説明を与えた場合は、その時点で「Context Packのみ」の検証と分離する。

### 9.2 Recovery Questions

AIへ最終成果物を作成させる前、または成果物と同時に、以下を回答させる。

1. Project Mnemosyneの目的は何か。
2. 現在のPhaseとMilestoneは何か。
3. Phase 1で確定した主要前提は何か。
4. Phase 2で実装済みまたは検証済みの主要機能は何か。
5. Context Packの正本性はどう定義されているか。
6. Active Decisionsとして守るべき制約は何か。
7. Taskの正本はどの文書か。
8. 現在のNext Actionsは何か。
9. 現行Context BuilderのKnown Limitationsは何か。
10. Phase 3へ引き継ぐべき課題は何か。
11. 回答に必要だがContext Pack内に存在しない情報は何か。
12. どのsourceを根拠に各回答を作成したか。

### 9.3 Scoring Criteria

各評価項目を0〜2点で採点する。

| Score | Definition |
|---:|---|
| 2 | 正確かつ十分。元sourceへ追跡でき、重要な欠落がない |
| 1 | 一部正しいが、重要情報の欠落、曖昧さ、軽微な推測がある |
| 0 | 誤り、重大な欠落、根拠不明、または回答不能 |

| Evaluation ID | Evaluation Item | Max Score | Actual Score | Evidence / Note |
|---|---|---:|---:|---|
| AI-001 | Project purpose recovery | 2 | TBD | TBD |
| AI-002 | Current Phase / Milestone recovery | 2 | TBD | TBD |
| AI-003 | Phase 1 assumptions recovery | 2 | TBD | TBD |
| AI-004 | Phase 2 progress recovery | 2 | TBD | TBD |
| AI-005 | Active Decisions recovery | 2 | TBD | TBD |
| AI-006 | Source-of-truth boundary recovery | 2 | TBD | TBD |
| AI-007 | Next Actions recovery | 2 | TBD | TBD |
| AI-008 | Known Limitations recovery | 2 | TBD | TBD |
| AI-009 | Phase 3 handoff issues extraction | 2 | TBD | TBD |
| AI-010 | Source traceability | 2 | TBD | TBD |
| AI-011 | Unsupported assumption avoidance | 2 | TBD | TBD |
| AI-012 | Requirements output-contract compliance | 2 | TBD | TBD |
| **Total** |  | **24** | **TBD** |  |

### 9.4 Pass Threshold

| Result | Condition |
|---|---|
| `pass` | 20点以上、かつAI-002 / AI-005 / AI-006 / AI-007 / AI-010 / AI-011がすべて2点 |
| `conditional_pass` | 16〜19点、または必須項目に1点があるが、追加sourceやBuild Rule修正で解消可能 |
| `fail` | 15点以下、必須項目に0点がある、またはContext Pack外の推測を確定事項として扱った |

点数だけでなく、Phase 2完了条件を阻害するP0 Issueの有無を優先して判定する。

---

## 10. Requirements Draft Output Review

`requirements_writer` が作成したPhase 3入力要件ドラフトについて、以下を確認する。

| Check ID | Check | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| RW-001 | Purposeが明確 | yes | TBD | not_run |
| RW-002 | ScopeとOut of Scopeが分離 | yes | TBD | not_run |
| RW-003 | Functional / Non-Functional Requirementsが分離 | yes | TBD | not_run |
| RW-004 | Deliverablesが明記 | yes | TBD | not_run |
| RW-005 | Acceptance Criteriaが検証可能 | yes | TBD | not_run |
| RW-006 | Open Issuesが確定要件と分離 | yes | TBD | not_run |
| RW-007 | Active ADR / Active Decisionsと矛盾しない | yes | TBD | not_run |
| RW-008 | 未承認事項を確定扱いしない | yes | TBD | not_run |
| RW-009 | Phase 2残課題をPhase 3へ無条件移送しない | yes | TBD | not_run |
| RW-010 | Context不足を明示 | yes | TBD | not_run |
| RW-011 | 実装詳細を要件として過剰固定しない | yes | TBD | not_run |
| RW-012 | 出典または参照sourceを追跡可能 | yes | TBD | not_run |

---

## 11. Secondary Scenarios

M2-7の主検証はM2-V-001とする。以下は、時間と必要性に応じて実施する補助シナリオである。

### 11.1 M2-V-002: ADR Draft Recovery

| Item | Value |
|---|---|
| Scenario | ADR草案を作成する |
| Agent | `adr_writer` |
| Main Check | Active Decisions / accepted ADR / source priorityを参照できるか |
| Example Task | Phase 3の検索基盤または保存境界に関するADR草案を作成する |
| Status | `optional_not_run` |

確認観点：

- 既存ADRとActive Decisionsを優先できる
- proposed内容をaccepted扱いしない
- DecisionとAssumptionを分離できる
- ADR statusをcandidateとして出力する

### 11.2 M2-V-003: Task Recovery

| Item | Value |
|---|---|
| Scenario | 次タスクを分解する |
| Agent | `task_planner` |
| Main Check | `next-actions.md` をTask正本として正しく参照できるか |
| Example Task | M2-7完了後からPhase 3開始までのタスクを分解する |
| Status | `optional_not_run` |

確認観点：

- Current StatusをTask正本として誤認しない
- Next Actionsの既存Taskを重複生成しない
- Done Criteriaと依存関係を明示できる
- 将来課題と直近Taskを分離できる

---

## 12. Build Results

### 12.1 Generation Summary

| Item | Result |
|---|---|
| Context Pack Generated | TBD |
| Build Report Generated | TBD |
| Context Preview Generated | TBD / N/A |
| Generation Result | `not_run` |
| Required Docs Missing | TBD |
| Included Source Count | TBD |
| Excluded Source Count | TBD |
| Warning Count | TBD |
| Error Count | TBD |
| Token Budget Exceeded | TBD |

### 12.2 Included Sources

実施後、Build ReportのIncluded Sourcesを転記または要約する。

| Source ID | Path | Status | Source Type | Included Section | Selection Reason | Evaluation |
|---|---|---|---|---|---|---|
| TBD | TBD | TBD | TBD | TBD | TBD | TBD |

### 12.3 Excluded Sources

| Source ID / Path | Status | Exclusion Reason | Expected? | Impact |
|---|---|---|---|---|
| TBD | TBD | TBD | TBD | TBD |

### 12.4 Warnings

| Warning ID | Type | Severity | Source | Message | Handling | Validation Impact |
|---|---|---|---|---|---|---|
| TBD | TBD | TBD | TBD | TBD | TBD | TBD |

### 12.5 Errors

| Error ID | Type | Source | Message | Handling | Result |
|---|---|---|---|---|---|
| TBD | TBD | TBD | TBD | TBD | TBD |

---

## 13. Context Coverage Evaluation

### 13.1 Required Context Coverage

| Context | Required By | Source | Covered | Complete | Note |
|---|---|---|:---:|:---:|---|
| Project Summary | requirements_writer | TBD | TBD | TBD | TBD |
| Active Decisions | requirements_writer | TBD | TBD | TBD | TBD |
| Current Status | requirements_writer | TBD | TBD | TBD | TBD |
| Phase 2 current position | M2-7 | TBD | TBD | TBD | TBD |
| Next Actions | M2-7 completion criteria | TBD | TBD | TBD | TBD |
| Phase 1 assumptions | M2-V-001 | TBD | TBD | TBD | TBD |
| Phase 2 completion / remaining work | M2-V-001 | TBD | TBD | TBD | TBD |
| Phase 3 input candidates | M2-V-001 | TBD | TBD | TBD | TBD |
| Known Limitations | Phase handoff | TBD | TBD | TBD | TBD |

### 13.2 Coverage Judgment

| Judgment | Definition |
|---|---|
| `covered` | 必要情報がContext Pack内に存在し、sourceへ追跡可能 |
| `partial` | 情報はあるが要約不足、更新遅れ、source選定不足がある |
| `missing` | 必要情報がContext Packに含まれない |
| `conflicting` | 複数source間で解消されていない競合がある |
| `not_applicable` | 当該シナリオでは不要 |

---

## 14. Missing Context and Gaps

不足Contextは、以下のいずれかへ記録する。

1. Context Builderが検知できる不足  
   → Build ReportのWarnings / Errors / Coverageへ記録する。
2. AI投入後に判明した意味的不足  
   → 本章へ記録し、Phase 2 Build Rule改善またはPhase 3入力課題へ分類する。
3. 正本文書自体の不足または更新遅れ  
   → Context Packではなく元sourceの更新候補として記録する。

| Gap ID | Missing / Insufficient Context | Detected By | Related Source | Impact | Priority | Destination | Proposed Handling |
|---|---|---|---|---|---|---|---|
| M2-7-GAP-TBD | TBD | TBD | TBD | TBD | TBD | Build Rule / Source Doc / Phase 3 | TBD |

---

## 15. Preliminary Risk Hypotheses

以下は実施前の確認候補であり、検証結果ではない。

| Hypothesis ID | Risk Candidate | Why It Matters | Validation Method |
|---|---|---|---|
| M2-7-HYP-001 | `requirements_writer` のRequired ContextだけではNext Actionsが選定されない可能性 | 完了条件にNext Actions復元が含まれる | Source ListとAI回答を確認する |
| M2-7-HYP-002 | Mnemosyne記憶文書のMilestoneがM2-5のままの場合、M2-6 / M2-7の現在地を復元できない可能性 | Current Statusの鮮度不足につながる | current-status / next-actionsの内容とAI回答を比較する |
| M2-7-HYP-003 | Phase 3要件sourceが自動選定されない可能性 | 要件ドラフトが既存文書と重複・競合する | Included SourcesとAdditional Sources要否を確認する |
| M2-7-HYP-004 | Recent Context未実装により直近のM2-6完了情報を取得できない可能性 | 正本未反映情報を復元できない | Build ReportのUnsupported Featuresと回答欠落を確認する |
| M2-7-HYP-005 | Semantic conflict detection未実装により、古いCurrent Statusと新しいPhase計画の矛盾を検知できない可能性 | AIが古い現在地を採用する可能性 | 人間レビューでsource間整合を確認する |
| M2-7-HYP-006 | token estimateが近似のため、Phase / ADR / requirementを追加した際の予算判断が不正確な可能性 | source欠落または過大投入につながる | 実際のAI入力tokenと近似値を比較可能なら記録する |

これらは、実行結果に基づいて `confirmed`、`rejected`、`partially_confirmed` のいずれかへ更新する。

---

## 16. Phase 3 Handoff Candidates

M2-7で抽出した課題を、以下の観点でPhase 3入力要件候補として整理する。

| Handoff ID | Candidate | Classification | Trigger | Status |
|---|---|---|---|---|
| P3-HO-001 | source_pathとdocument_idを保持し、検索結果から正本へ追跡できること | traceability | M2-7 source追跡評価 | candidate |
| P3-HO-002 | source statusを検索・ranking・回答根拠へ反映すること | source governance | draft / archived誤用防止 | candidate |
| P3-HO-003 | Active / accepted sourceを優先し、非Active sourceを確定根拠にしないこと | retrieval policy | Phase 1 / 2の継承 | candidate |
| P3-HO-004 | chunk単位でも元文書status、更新日時、source typeを保持すること | metadata | RAGでの鮮度・由来管理 | candidate |
| P3-HO-005 | 検索結果に不足、競合、低信頼を表現できること | warning / confidence | Build Report思想の継承 | candidate |
| P3-HO-006 | 検索結果とContext Buildの選定理由を監査可能にすること | observability | M2-7 traceability評価 | candidate |
| P3-HO-007 | Recent ContextとActive正本の境界を維持すること | context boundary | Recent Context未実装課題 | candidate |
| P3-HO-008 | semantic conflict detectionの実装Phaseと責務を決めること | open issue | M2-5 / M2-6 limitation | candidate |
| P3-HO-009 | tokenizer-based token計測の必要性を判断すること | performance / capacity | approximate estimate limitation | candidate |

本表は実施前の候補であり、M2-7の検証結果により追加、削除、優先度変更を行う。

---

## 17. Issue Classification Rule

| Priority | Definition |
|---|---|
| P0 | Phase 2完了判定を阻害する。Context Pack生成不可、必須Context欠落、現在地・Decision・Taskの重大誤認など |
| P1 | Active化前に修正を推奨する。追加source指定、Coverage表示、記憶文書鮮度改善など |
| P2 | 将来改善。token精度、表示改善、補助メタデータなど |

| Issue ID | Priority | Finding | Evidence | Required Action | Owner | Status |
|---|---|---|---|---|---|---|
| TBD | TBD | TBD | TBD | TBD | TBD | open |

---

## 18. Completion Criteria Evaluation

| Completion Criterion | Evidence Required | Result | Judgment |
|---|---|---|---|
| MnemosyneのContext Packが生成できる | Context Pack path、CLI result、Build Report | TBD | not_evaluated |
| AIがPhase 2の現在地を復元できる | AI回答とCurrent Status / Phase planの比較 | TBD | not_evaluated |
| AIがActive Decisionsを復元できる | AI回答とactive-decisions.mdの比較 | TBD | not_evaluated |
| AIがNext Actionsを復元できる | AI回答とnext-actions.mdの比較 | TBD | not_evaluated |
| 不足ContextがBuild Reportに整理されている | Warnings / Coverage / Missing Context | TBD | not_evaluated |
| Phase 3入力要件へ回す課題が抽出されている | Handoff Candidate一覧 | TBD | not_evaluated |

### 18.1 Overall Judgment

| Item | Value |
|---|---|
| M2-7 Result | `not_evaluated` |
| Phase 2 Mechanism Applicable to Mnemosyne | TBD |
| Blocking P0 Issues | TBD |
| P1 Improvements | TBD |
| Phase 3 Handoff Ready | TBD |
| Recommended Next Action | M2-V-001を実行し、本書へ実測結果を反映する |

判定候補：

- `pass`
- `conditional_pass`
- `fail`
- `not_evaluated`

---

## 19. Evidence

実施時に以下を添付または参照する。

| Evidence ID | Evidence | Path / Reference | Status |
|---|---|---|---|
| EVD-001 | CLI execution log | TBD | pending |
| EVD-002 | Context Pack | `dist/context/mnemosyne/requirements_writer/context-pack.md` | pending |
| EVD-003 | Build Report | `dist/context/mnemosyne/requirements_writer/build-report.md` | pending |
| EVD-004 | Context Preview | `dist/context/mnemosyne/requirements_writer/context-preview.md` | pending / N/A |
| EVD-005 | AI recovery answer | TBD | pending |
| EVD-006 | Phase 3 requirements draft | TBD | pending |
| EVD-007 | Source-to-answer comparison notes | This document, Sections 9–14 | pending |

---

## 20. Activeization Checklist

M2-7成果物をActive化する前に、以下を確認する。

- [ ] Validation Environmentが実測値で記録されている
- [ ] M2-V-001が実行されている
- [ ] CLI execution logが保存されている
- [ ] Context Packが規定パスへ生成されている
- [ ] Build Reportが規定パスへ生成されている
- [ ] Required Docs Checkが成功している
- [ ] requirements_writerのRequired Context Coverageが確認されている
- [ ] Current Position、Active Decisions、Next Actionsの復元結果が評価されている
- [ ] AI回答のsource traceabilityが確認されている
- [ ] Context Pack外の推測混入有無が確認されている
- [ ] 不足ContextがBuild Reportまたは本書へ記録されている
- [ ] P0 / P1 / P2 Issueが分類されている
- [ ] Phase 3 Handoff Candidatesが検証結果に基づいて更新されている
- [ ] Completion Criteriaがすべて評価されている
- [ ] Overall Judgmentが記録されている
- [ ] `review_status` と `status` がActive化判断に合わせて更新されている

---

## 21. Revision History

| Version | Date | Status | Summary | Author |
|---|---|---|---|---|
| 0.1.0 | 2026-06-11 | draft | M2-7の目的、検証範囲、M2-V-001実施手順、AI復元評価、Phase 3引継ぎ候補を定義 | user / AI |
