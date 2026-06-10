# Context Pack

> This Context Pack is a generated artifact.
> It is not the source of truth.
> Active source documents take precedence over this generated file.

## 1. Build Metadata

| Item | Value |
| --- | --- |
| Context Pack Version | 1.0.0 |
| Generated At | 2026-06-10T20:39:43.406Z |
| Project Code | mnemosyne |
| Project Name | Project Mnemosyne |
| Agent Code | implementation_reviewer |
| Agent Name | 実装レビューAgent |
| Task Request | M2-6 context preview integration check |
| Output Type | implementation_review_report |
| Build Mode | standard |
| Source Status Policy | active_preferred |
| Token Budget | 24000 max / 4000 reserve / priority_based / estimate=approximate |
| Builder Name | mnemosyne-context-builder |
| Builder Version | 0.1.0-draft |

## 2. Base Context

- Context Pack is a generated artifact, not a source of truth.
- Active / accepted source documents take precedence.
- Draft, proposed, archived, deprecated, superseded, unknown, session, and recent context must not override Active sources.
- AI outputs are draft/review/proposal artifacts unless human approval promotes them.

## 3. Agent Context

### 3.1 Agent Role

ソースコード、設計文書、契約文書、ADR、テスト結果を参照し、 責務境界、依存方向、データ更新範囲、実装と正本文書の整合性をレビューする。

### 3.2 Responsibilities

- 設計方針と実装のズレを検出する
- 責務境界、依存方向、契約、transaction境界を確認する
- 実装変更に伴って更新が必要な文書候補を整理する
- 不具合、設計逸脱、テスト不足を優先度付きで分類する
- 修正案と検証観点を提示する

### 3.3 Out of Scope

- 本番環境や本番DBを直接変更すること
- Project固有のFact / Decision / TaskをAgent定義へ保存すること
- テスト未実施の結果を成功と断定すること
- Active文書を人間承認なしに更新すること

### 3.4 Required Context

- src-001-active-decisions-md: docs/projects/mnemosyne/memory/active-decisions.md (active, include)
- src-002-project-summary-md: docs/projects/mnemosyne/memory/project-summary.md (active, include)

### 3.5 Allowed Operations

- create implementation review reports
- identify architecture and contract deviations
- propose implementation fixes
- propose document update candidates
- define validation points

### 3.6 Forbidden Operations

- directly modify production data
- directly update active documents
- treat untested behavior as verified
- ignore existing domain or architecture decisions
- store project-specific facts, decisions, or tasks in Agent Registry

### 3.7 Output Contract

実装・設計文書・契約・テスト結果の整合をレビューする

Required sections:
- summary
- review_scope
- architecture_findings
- contract_findings
- implementation_findings
- risk_and_priority
- required_fixes
- recommended_fixes
- validation_points

Additional requirements:
- レビュー対象範囲を明示する
- 設計逸脱と実装不具合を分離する
- 必要修正と推奨修正を分ける
- 検証方法またはテスト観点を明示する

## 4. Project Context

### Mnemosyne Memory: Project Summary

| Item | Value |
| --- | --- |
| Source ID | src-002-project-summary-md |
| Path | docs/projects/mnemosyne/memory/project-summary.md |
| Document ID | docs/projects/mnemosyne/memory/project-summary.md |
| Status | active |
| Source Type | memory_doc |
| Handling | include |
| Purpose | 対象Projectの目的と主要構成を把握する |
| Matched By | agent_required_context |
| Explicitly Requested | true |
| Selection Reason | Selected by agent_required_context. |

```md
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


```

Current phase: Phase 2: Context Forge

## 5. Current Status

No source selected for this section by M2-5 draft builder.

## 6. Active Decisions

### Mnemosyne Memory: Active Decisions

| Item | Value |
| --- | --- |
| Source ID | src-001-active-decisions-md |
| Path | docs/projects/mnemosyne/memory/active-decisions.md |
| Document ID | docs/projects/mnemosyne/memory/active-decisions.md |
| Status | active |
| Source Type | memory_doc |
| Handling | include |
| Purpose | 実装が従うべき設計判断と制約を確認する |
| Matched By | agent_required_context |
| Explicitly Requested | true |
| Selection Reason | Selected by agent_required_context. |

```md
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


```

---

### ADR-001: Markdown docs and ADRs as the Source of Memory

| Item | Value |
| --- | --- |
| Source ID | src-003-ADR-001-docs-as-source-of-memory-md |
| Path | docs/adr/ADR-001-docs-as-source-of-memory.md |
| Document ID | docs/adr/ADR-001-docs-as-source-of-memory.md |
| Status | active |
| Source Type | adr_source |
| Handling | include |
| Purpose | アーキテクチャ判断や依存方向の根拠を確認する |
| Matched By | mnemosyne_adrs |
| Explicitly Requested | false |
| Selection Reason | Matched Project Registry source group: mnemosyne_adrs. |

```md
---
title: "ADR-001: Markdown docs and ADRs as the Source of Memory"
document_id: "docs/adr/ADR-001-docs-as-source-of-memory.md"
adr_id: "ADR-001"
status: "active"
version: "1.0.0"
created_at: "2026-06-04"
updated_at: "2026-06-04"
approved_at: "2026-06-04"
phase: "Phase 1: Memory Foundation"
milestone: "M1-1: Memory Policy定義"
decision_scope: "Memory Source of Truth"
related_documents:
  - "docs/phases/phase-1-memory-foundation.md"
  - "docs/memory/memory-policy.md"
  - "docs/adr/ADR-002-memory-source-of-truth-boundary.md"
  - "docs/adr/ADR-003-human-approved-memory-update.md"
supersedes: null
superseded_by: null
---

# ADR-001: Markdown docs and ADRs as the Source of Memory

## 1. Status

`active`

---

## 2. Context

Project Mnemosyneは、AIとの会話、設計判断、タスク、課題、記事メモ等を、後続作業で再利用可能な外部記憶として管理する基盤である。

AIチャット履歴には、確定判断だけでなく、仮説、作業途中の案、採用されなかった選択肢、未整理の情報が混在する。会話履歴のみを記憶の根拠にすると、未確定情報や古い判断が現在有効な方針として参照される危険がある。

また、将来的にはNotion、Context Pack、PostgreSQL、Vector Store、MCP等を利用する可能性がある。複数媒体を導入する前に、Phase 1で人間が確認でき、AIが参照でき、差分管理可能な初期正本を決める必要がある。

---

## 3. Decision

Phase 1において、Project Mnemosyneの記憶に関する初期正本を以下とする。

| 情報種別 | 正本として管理する内容 |
|---|---|
| Markdown docs | プロジェクト概要、現在状況、有効な判断一覧、次アクション、運用ルール、分類ルール、Context方針 |
| ADR | 重要な設計判断、採用理由、代替案、影響、判断変更履歴 |

### 3.1 役割分担

| 確認したい内容 | 優先して確認する正本 |
|---|---|
| 現在どのルールで運用するか | Markdown docs |
| 現在の状態・次アクションは何か | Markdown docs |
| なぜその方針を採用したか | ADR |
| 何を比較し、何を却下したか | ADR |
| 重要判断が何に置換されたか | ADR |

Markdown docsは現在の運用状態を示し、ADRは重要判断の根拠と履歴を示す。両者が矛盾する場合、AIは独自に一方を正として確定せず、矛盾をIssueとして提示し、人間による修正判断を必要とする。

### 3.2 Phase 1検証用の初期配置

Phase 1では、Mnemosyne自身およびATSへの適用検証のため、以下の文書配置を検証用初期配置として使用する。

` ` `text
docs/projects/{project_code}/memory/
  project-summary.md
  current-status.md
  active-decisions.md
  next-actions.md
  ai-entrypoint.md
` ` `

この配置はPhase 1の検証を進めるための初期構成であり、将来の最終的な正本配置方式を確定するものではない。

---

## 4. Rationale

### 4.1 人間が直接レビューできる

Markdown docsおよびADRは、専用システムを用いずに内容を確認・修正できる。記憶運用ルールを検証するPhase 1では、人間可読性が最優先である。

### 4.2 Gitによる差分管理が可能である

文書の追加・修正・置換を差分として追跡できるため、判断変更の経緯や正本更新の妥当性を確認しやすい。

### 4.3 複数AIクライアントへ再利用しやすい

Markdownは、ChatGPT、Cursor、Claude等へ参照情報として提供しやすく、Phase 2以降のContext Pack生成元としても適する。

### 4.4 実装より先に運用ルールを検証できる

DBや検索基盤を導入する前に、何を記憶し、何を正本とし、どう更新するかを確定できる。これにより、後続実装でのスキーマや同期方式の手戻りを抑えられる。

### 4.5 特定サービスへの依存を抑えられる

Notion等の外部SaaSを初期正本にせず、移植性の高いMarkdown文書を採用することで、ツール変更時にも記憶資産を維持できる。

---

## 5. Alternatives Considered

### 5.1 AIチャット履歴を正本とする

**却下。** 確定事項と検討事項が混在し、状態管理・差分レビュー・他クライアントへの再利用が困難である。AIチャット履歴は一次メモとして利用する。

### 5.2 Notionを正本とする

**Phase 1では却下。** 一覧性は高いが、同期責任、更新履歴、Markdown文書との競合ルールを先に必要とする。Notionは任意の副本として位置づける。

### 5.3 PostgreSQLをPhase 1から正本とする

**却下。** 記憶分類や更新ルールが固まる前にスキーマ実装が先行する。PostgreSQLの正本性は後続Phaseで判断する。

### 5.4 Context Packを正本とする

**却下。** Context Packはタスク向けに抽出・加工される生成物であり、正本更新後には再生成すべき対象である。

---

## 6. Consequences

### 6.1 Positive Consequences

- 現在参照すべき情報源が明確になる。
- AIチャット内の検討過程と確定済みの判断を分離できる。
- 判断理由と変更履歴を追跡できる。
- Context Pack、Notion、将来の検索基盤を安全に追加しやすくなる。

### 6.2 Negative Consequences

- 会話で決まった内容を正本文書へ反映する手間が発生する。
- 正本更新を怠ると、重要判断が一次メモに留まる。
- Markdown docsとADRの責務が曖昧になると重複や矛盾が発生する。

### 6.3 Mitigation

- `docs/memory/memory-update-flow.md` で更新手順を定義する。
- `docs/memory/context-source-priority.md` で矛盾検知・解決手順を定義する。
- `docs/memory/memory-taxonomy.md` で分類基準を定義する。

---

## 7. Scope Boundary

本ADRは、Phase 1においてMarkdown docsおよびADRを初期正本として採用する判断を確定する。

本ADRでは、以下を確定しない。

- 全プロジェクト記憶をMnemosyne側へ集中管理するか、各プロジェクト側を正本とするか
- Notionを実際に導入するか
- PostgreSQLが将来どの情報種別の正本となるか
- Context Packの形式および生成処理
- Vector Store / RAG / API / MCPの実装方式

記憶の最終配置方式は、Phase 2以降で以下の案を比較して判断する。

| 案 | 概要 |
|---|---|
| 案A | Mnemosyne側で全プロジェクトの記憶を集中管理する |
| 案B | 各プロジェクト側の `docs/memory` を正本とし、Mnemosyneは参照・集約する |

---

## 8. Related Decisions

| ADR | 関係 |
|---|---|
| `ADR-002-memory-source-of-truth-boundary.md` | 正本、副本、一次メモ、生成物、将来基盤の境界を定義する |
| `ADR-003-human-approved-memory-update.md` | AIはdraftまでとし、正本反映を人間が行うことを定義する |

---

## 9. Review Record

| Item | Result |
|---|---|
| Markdown docs / ADR をPhase 1の初期正本とする | 採用 |
| AIチャット履歴を正本とする | 不採用。一次メモとして扱う |
| `docs/projects/{project_code}/memory/` を最終配置として確定する | 不採用。Phase 1検証用初期配置とする |
| Context Packを正本とする | 不採用。生成物として扱う |

---

## 10. Change History

| Version | Date | Status | Summary |
|---|---|---|---|
| 0.1.0 | 2026-06-04 | draft | Phase 1における記憶正本の初版ドラフトを作成 |
| 1.0.0 | 2026-06-04 | active | 配置の暫定性と正本間矛盾時の扱いを明確化しActive化 |

```

---

### ADR-002: Memory Source of Truth Boundary

| Item | Value |
| --- | --- |
| Source ID | src-004-ADR-002-memory-source-of-truth-boundary-md |
| Path | docs/adr/ADR-002-memory-source-of-truth-boundary.md |
| Document ID | docs/adr/ADR-002-memory-source-of-truth-boundary.md |
| Status | active |
| Source Type | adr_source |
| Handling | include |
| Purpose | アーキテクチャ判断や依存方向の根拠を確認する |
| Matched By | mnemosyne_adrs |
| Explicitly Requested | false |
| Selection Reason | Matched Project Registry source group: mnemosyne_adrs. |

```md
---
title: "ADR-002: Memory Source of Truth Boundary"
document_id: docs/adr/ADR-002-memory-source-of-truth-boundary.md
adr_id: ADR-002
status: active
version: 1.0.0
created_at: 2026-06-04
updated_at: 2026-06-04
approved_at: 2026-06-04
phase: "Phase 1: Memory Foundation"
milestone: "M1-1: Memory Policy定義"
decision_scope: Boundary Between Sources, Replicas, Primary Notes, Generated Artifacts, and Interfaces
related_documents:
  - docs/phases/phase-1-memory-foundation.md
  - docs/memory/memory-policy.md
  - docs/adr/ADR-001-docs-as-source-of-memory.md
  - docs/adr/ADR-003-human-approved-memory-update.md
supersedes:
superseded_by:
---

# ADR-002: Memory Source of Truth Boundary

## 1. Status

`active`

---

## 2. Context

Project Mnemosyneでは、AI外部記憶を実現するために、Markdown docs、ADR、AIチャット履歴、Context Pack、Notion、PostgreSQL、Vector Store / RAG、API / MCP等を扱う可能性がある。

これらはすべて情報利用に関係するが、目的と信頼性は同一ではない。たとえば、AIチャット履歴は未整理情報を含み、Context Packはタスク向けに加工された情報であり、Vector Storeは検索のための副本となる。

媒体の責務を分けない場合、生成物や古い副本が正本として誤認され、AIが誤った判断を再利用する危険がある。このため、Phase 1で情報源の境界を明示する。

---

## 3. Decision

Project Mnemosyneにおける情報源を、以下の区分で扱う。

| 区分 | 定義 |
|---|---|
| 正本 | 内容の正しさを判断する際の公式な基準となる情報源 |
| 副本 | 正本を補助するための可視化用・一覧管理用・検索用の複製または整理情報 |
| 一次メモ | 検討途中・未整理・未承認の情報を含む入力材料 |
| 生成物 | 正本等を入力として作成され、必要に応じて再生成可能な成果物 |
| 接続手段 | 情報源にアクセスするインターフェースであり、情報の正本性を持たないもの |
| 将来判断対象 | Phase 1では実装または正本化せず、後続Phaseで責務を判断する対象 |

### 3.1 Phase 1での媒体別位置づけ

| 媒体・仕組み | Phase 1での役割 | 区分 | Phase 1判断 |
|---|---|---|---|
| Markdown docs | 状態、運用ルール、判断一覧、タスク等の記録 | 正本 | 採用する |
| ADR | 重要判断、理由、影響、変更履歴の記録 | 正本 | 採用する |
| AIチャット履歴 | 考察、相談、未整理情報、記憶化候補の入力 | 一次メモ | そのまま正本にしない |
| Context Pack | AIへ渡すために正本文書等を加工した文脈 | 生成物 | 位置づけのみ確定。生成実装はPhase 2対象 |
| Notion | 人間向けの可視化・一覧管理 | 任意の副本 | 導入必須としない |
| PostgreSQL | 構造化記憶・状態管理の候補 | 将来判断対象 | Phase 1では使用しない |
| Vector Store / RAG | 関連情報を取得する検索副本・検索機構 | 将来判断対象 | Phase 1では使用しない |
| API / MCP | 記憶への接続インターフェース | 接続手段 | Phase 1では実装しない |

---

## 4. Boundary Rules

### 4.1 Markdown docs と ADR

Markdown docsおよびADRは、Phase 1の正本である。

| 文書 | 管理責務 |
|---|---|
| Markdown docs | 現在利用するルール、現在状況、次アクション、整理済み記憶 |
| ADR | 重要判断の背景、比較した選択肢、採用理由、影響、変更履歴 |

両者が矛盾する場合、AIは一方を自動的に採用せず、矛盾をIssueとして提示し、人間が修正方針を決定する。

### 4.2 AIチャット履歴

AIチャット履歴は一次メモである。

- 会話内で合意したように見える内容でも、正本へ反映されるまでは正本として扱わない。
- 再利用すべき情報は、要約・分類・レビュー後にMarkdown docsまたはADRへ反映する。
- 未確認の推測をFactまたはDecisionとして正本化しない。

### 4.3 Context Pack

Context Packは、AIが特定作業を行うために必要な文脈を、正本文書等から抽出・加工した生成物である。

- Context Packは正本ではない。
- Context Packが正本と矛盾する場合、正本を優先する。
- 正本更新後は、古いContext Packを正本として修正管理するのではなく、原則として再生成対象とする。
- Phase 1では、Context Packを生成物と位置づける判断のみを行う。
- Context Packの標準構成、生成処理、出力先、更新手順はPhase 2で定義する。

### 4.4 Notion

Notionは、導入する場合も任意の副本とする。

- タスク、進捗、記事メモ等の可視化用途に利用できる。
- Notionにのみ存在する重要判断は、正本へ反映されるまで確定判断として扱わない。
- 正本と矛盾する場合は、Markdown docsまたはADRを優先する。
- Notion DB設計および同期自動化はPhase 1対象外とする。

### 4.5 PostgreSQL

PostgreSQLは、将来的に構造化されたMemoryや状態管理を担う候補であるが、Phase 1では実装せず、正本として扱わない。

後続Phaseでは、以下を別途判断する必要がある。

- DBを正本とする情報種別
- Markdown docs / ADRとの責務境界
- 同期方向および更新起点
- 履歴管理方式
- 矛盾時の優先順位

### 4.6 Vector Store / RAG

Vector StoreおよびRAGは、将来の検索副本・検索機構として扱う。

- 埋め込みデータおよび検索結果は正本ではない。
- 検索結果の根拠は元の正本文書で確認する。
- 状態が古い文書の検索混入対策は後続Phaseで設計する。

### 4.7 API / MCP

APIおよびMCPは情報源ではなく、情報源へアクセスするための接続手段である。

- APIやMCPの応答の正本性は、返却元となる情報源に依存する。
- MCP自体を正本とは扱わない。
- 実装は後続Phaseで行う。

---

## 5. Reference Priority Principles

本ADRでは、情報源間の基本的な優先原則のみを確定する。詳細な参照順序、同一種別・同一状態の情報が競合した場合の手順、矛盾解消フローは `docs/memory/context-source-priority.md` で定義する。

| 原則 | 内容 |
|---|---|
| RP-01 | `active` なMarkdown docsおよびADRは、副本・一次メモ・生成物より優先される |
| RP-02 | `draft` の情報は検討中として扱い、確定根拠にしない |
| RP-03 | `superseded`、`deprecated`、`archived` の利用範囲は状態定義に従う |
| RP-04 | 副本または生成物と正本が矛盾する場合、正本を優先する |
| RP-05 | `active` な正本同士が矛盾する場合、AIは判断を確定せずIssue化する |

---

## 6. Rationale

### 6.1 媒体の目的を混同しないため

現在状況、判断理由、検索インデックス、AI入力用文脈、可視化ビューは目的が異なる。正本性を分離することで、便利な媒体を追加しても判断根拠を維持できる。

### 6.2 段階的な実装を可能にするため

Phase 1では文書運用を確立し、Phase 2以降でContext生成、検索、接続、構造化管理を導入する。先に境界を定義することで、不確定な運用を誤って実装へ固定するリスクを抑える。

### 6.3 AIの誤参照を防止するため

AIへ提供される情報が正本か生成物かを明記することで、古いContext Packや未整理の会話を確定情報として利用する危険を減らす。

---

## 7. Alternatives Considered

### 7.1 すべての媒体を同等に扱う

**却下。** 矛盾時の判断ができず、古い副本や生成物を正本と誤認する危険がある。

### 7.2 Notionを正本兼ビューとして利用する

**Phase 1では却下。** 同期責任と履歴管理を先に設計する必要があり、初期検証の複雑度を高める。

### 7.3 Phase 1からDB中心で管理する

**却下。** 情報分類や更新運用が確定する前に構造が固定され、文書運用の検証より実装が先行する。

---

## 8. Consequences

### 8.1 Positive Consequences

- 媒体ごとの正本性と責務が明確になる。
- Context PackやRAG等を安全に導入しやすくなる。
- NotionやDBを追加した場合も、正本境界を再判断できる。
- AIが未確定情報を参照するリスクを抑えられる。

### 8.2 Negative Consequences

- 正本から副本・生成物への同期または再生成運用が将来必要になる。
- Phase 1では検索性や一覧性より、手動レビューと文書整備を優先することになる。
- PostgreSQL等を採用する場合、境界変更のADRが追加で必要となる。

---

## 9. Scope Boundary

本ADRは、Phase 1における情報源の区分と基本境界を確定する。

本ADRでは、以下を確定しない。

- Notionの導入可否および具体的DB設計
- PostgreSQLを正本として採用する時期・範囲
- Vector Store / RAGの技術方式
- Context Packの構成、生成処理、出力先
- API / MCPの実装構成
- 正本間矛盾の詳細な解消手順

---

## 10. Related Decisions

| ADR | 関係 |
|---|---|
| `ADR-001-docs-as-source-of-memory.md` | Markdown docsおよびADRをPhase 1の正本とする |
| `ADR-003-human-approved-memory-update.md` | AIのドラフト権限と人間による正本更新を定義する |

---

## 11. Review Record

| Item | Result |
|---|---|
| Context Packの区分 | 生成物として採用。生成実装はPhase 2へ委譲 |
| Notionの区分 | 任意の副本として採用 |
| PostgreSQLのPhase 1正本化 | 不採用。後続Phase判断とする |
| 詳細な参照優先手順 | 本ADRでは基本原則のみ。別文書へ委譲 |

---

## 12. Change History

| Version | Date | Status | Summary |
|---|---|---|---|
| 0.1.0 | 2026-06-04 | draft | 情報源境界の初版ドラフトを作成 |
| 1.0.0 | 2026-06-04 | active | Context PackのPhase境界と参照優先の責務委譲を明確化しActive化 |

```

---

### ADR-003: Human-Approved Memory Update

| Item | Value |
| --- | --- |
| Source ID | src-005-ADR-003-human-approved-memory-update-md |
| Path | docs/adr/ADR-003-human-approved-memory-update.md |
| Document ID | docs/adr/ADR-003-human-approved-memory-update.md |
| Status | active |
| Source Type | adr_source |
| Handling | include |
| Purpose | アーキテクチャ判断や依存方向の根拠を確認する |
| Matched By | mnemosyne_adrs |
| Explicitly Requested | false |
| Selection Reason | Matched Project Registry source group: mnemosyne_adrs. |

```md
---
title: "ADR-003: Human-Approved Memory Update"
document_id: "docs/adr/ADR-003-human-approved-memory-update.md"
adr_id: "ADR-003"
status: "active"
version: "1.0.0"
created_at: "2026-06-04"
updated_at: "2026-06-04"
approved_at: "2026-06-04"
phase: "Phase 1: Memory Foundation"
milestone: "M1-1: Memory Policy定義"
decision_scope: "AI Update Permission and Human Approval"
related_documents:
  - "docs/phases/phase-1-memory-foundation.md"
  - "docs/memory/memory-policy.md"
  - "docs/adr/ADR-001-docs-as-source-of-memory.md"
  - "docs/adr/ADR-002-memory-source-of-truth-boundary.md"
supersedes: null
superseded_by: null
---

# ADR-003: Human-Approved Memory Update

## 1. Status

`active`

---

## 2. Context

Project Mnemosyneでは、AIを利用して、会話要約、記憶候補の分類、文書ドラフト、差分案、ADR案、矛盾候補の指摘等を効率化する。

一方、正本へ保存された情報は、将来のAI回答、Context Pack、検索結果、Agent判断の入力となる。AIが未承認の案、古い情報、推測、誤解を正本へ直接反映すると、誤りが後続作業へ連鎖する。

Phase 1の目的は自動更新の実装ではなく、安全に運用可能な記憶更新ルールを確立することである。このため、AIの活用範囲と、人間が保持すべき更新責任を明確に定義する。

---

## 3. Decision

Phase 1では、AIは**正本文書の参照および更新ドラフトの作成まで**を担う。

正本文書への反映は、人間がドラフトを確認・承認した後に、**人間が実施する**。

AIによる正本ファイルへの直接書き込み、自動反映、自動削除はPhase 1では許可しない。

### 3.1 AI操作権限

| 操作 | 内容 | Phase 1でのAI権限 | 正本反映主体 |
|---|---|---:|---|
| `read` | 正本、一次メモ、生成物を参照する | 許可 | 該当なし |
| `draft` | 新規文書案、修正案、差分案、分類案、ADR案を作成する | 許可 | 該当なし |
| `write` | 正本文書へ確定内容を反映する | 不可 | 人間 |
| `delete` | 正本、判断履歴、記憶文書を削除する | 不可 | 人間が例外的に判断。原則は状態変更 |

---

## 4. Permission Rules

### 4.1 `read`

AIは、以下の目的で情報を参照してよい。

- 現在有効な方針および状況の確認
- 文書ドラフトまたは差分案の作成
- 判断理由の確認
- 矛盾候補および更新漏れ候補の検出
- 会話からの記憶化候補抽出

AIは、情報の状態に応じて扱いを変える。

| 状態 | AIの扱い |
|---|---|
| `draft` | 検討中として扱い、確定事項と断定しない |
| `active` | 現在有効な情報として参照する |
| `superseded` | 置換済みの履歴としてのみ扱う |
| `deprecated` | 現在の判断根拠に用いない |
| `archived` | 必要な履歴確認時のみ参照する |

### 4.2 `draft`

AIは、以下をドラフトとして作成してよい。

| ドラフト種別 | 例 |
|---|---|
| 新規文書案 | Memory Policy、ADR、テンプレート |
| 修正案 | 既存文書の置き換え案、追記案 |
| 差分案 | 現行方針と修正案の差異一覧 |
| 要約案 | 会話内容の構造化サマリー |
| 分類案 | Fact / Decision / Task / Issue / Idea等への分類 |
| 状態変更案 | `active` から `superseded` への変更候補等 |
| 矛盾解消案 | 正本文書同士の不整合修正候補 |
| ADR案 | 新しい設計判断または変更判断の記録案 |

AIがドラフトを作成する場合、以下を守る。

- ドラフトまたは更新案であることを明示する。
- 未承認の内容を確定事項として扱わない。
- 既存正本と異なる内容を含む場合、変更点を提示する。
- 重要判断の追加または変更がある場合、ADR作成・更新の要否を提示する。
- 推測をFactまたはDecisionとして無断で正本化しない。

### 4.3 `write`

Phase 1では、AIは正本文書へ直接書き込まない。

人間がAIドラフトを承認した場合でも、AIの権限が `write` に拡張されるわけではない。承認後の正本反映作業は、人間が行う。

#### 人間が正本へ反映する前の確認事項

- [ ] 反映内容をレビューし、採用判断を行ったか
- [ ] 既存の `active` な正本文書と矛盾しないか
- [ ] 新しい重要判断であり、ADR追加または更新が必要ではないか
- [ ] 旧情報を `superseded` または `deprecated` に変更する必要がないか
- [ ] 関連する正本文書へ反映漏れがないか
- [ ] 将来のContext Pack等の再生成対象となるか

### 4.4 `delete`

Phase 1では、AIは正本または判断履歴を削除しない。

古い情報や採用されなかった案は、原則として物理削除ではなく状態変更により管理する。

| 状況 | 推奨する状態変更 |
|---|---|
| 新しい判断へ置換された | `superseded` |
| 採用しない、または利用非推奨となった | `deprecated` |
| 完了後に保管する | `archived` |

---

## 5. Human Approval Workflow

### 5.1 基本フロー

` ` `mermaid
flowchart TD
    A[AIチャット履歴 / 既存docs / 依頼内容] --> B[AIが要点抽出・文書案作成]
    B --> C[draftとして提示]
    C --> D{人間レビュー}
    D -->|修正必要| E[AIが修正版または差分案を作成]
    E --> C
    D -->|保留・不採用| F[draftまたはdeprecatedとして保持]
    D -->|承認| G[人間が正本へ反映]
    G --> H[statusをactiveに設定]
    H --> I[旧情報の状態変更・関連生成物の再確認]
` ` `

### 5.2 会話から記憶を更新する場合

| 手順 | 実施内容 | 担当 |
|---:|---|---|
| 1 | 会話内容から再利用価値のある情報を抽出する | AI |
| 2 | 情報を分類する | AI |
| 3 | 既存正本との重複・矛盾候補を整理する | AI |
| 4 | 更新案またはADR案をdraftとして提示する | AI |
| 5 | 採用・修正・保留を判断する | 人間 |
| 6 | 承認された内容を正本へ反映する | 人間 |
| 7 | 必要に応じて旧情報の状態を変更する | 人間 |
| 8 | Context Pack等の生成物が存在する場合、再生成要否を判断する | 後続運用 |

### 5.3 ADR化を提案すべき変更

以下に該当する場合、AIは単なる文書修正案に留めず、ADR作成または既存ADR更新を提案する。

- 正本と副本の境界を変更する
- AIの操作権限を変更する
- 記憶配置方針を変更する
- Context階層またはContext生成方針を変更する
- AgentとProject Contextの責務境界を変更する
- PostgreSQL等を新たな正本として採用する
- 既存の重要判断を置換する

---

## 6. Rationale

### 6.1 正本汚染を防ぐため

AIが誤った推測や未承認の内容を正本へ反映すると、その誤りが後続のAI利用へ継承される。正本反映主体を人間に限定することで、確定情報の品質を制御する。

### 6.2 AIの効率化効果を活用するため

AIによる要約、分類、差分抽出、文書案作成は運用負担を下げる。AIを参照・ドラフト作成へ積極的に用いながら、確定責任を人間に残すことで、安全性と効率を両立する。

### 6.3 将来の自動化へ安全に接続するため

後続PhaseでPull Request生成や同期支援を導入する場合も、人間承認の原則を保持すれば、正本品質を守りながら自動化範囲を段階的に検討できる。

---

## 7. Alternatives Considered

### 7.1 AIに正本への直接writeを許可する

**却下。** 未承認内容の混入、判断根拠の不透明化、誤りの連鎖拡大が発生し得る。Phase 1では過剰な自動化である。

### 7.2 AIはreadのみとし、draftも作成させない

**却下。** 会話からの抽出・文書化の負荷が高くなり、AI外部記憶基盤を整備する効率が低下する。

### 7.3 軽微な正本更新のみAIの自動反映を許可する

**保留。** 軽微な更新の境界と誤更新時の影響が検証されていない。運用実績が蓄積された後、別ADRで判断する。

---

## 8. Consequences

### 8.1 Positive Consequences

- AIによる誤った正本更新を防止できる。
- 未確定案と確定情報を明確に分離できる。
- 判断変更の説明責任と履歴を維持できる。
- AIのドラフト作成能力を活用できる。

### 8.2 Negative Consequences

- 正本更新ごとに人間の反映作業が必要となる。
- 未レビューのドラフトが滞留する可能性がある。
- 小規模な更新も自動反映できない。

### 8.3 Mitigation

- 更新案は差分が分かる形式で提示する。
- `memory-update-flow.md` で更新手順を標準化する。
- 更新チェックリストを整備する。
- 将来、AIが差分案またはPull Request相当の提案を作成し、人間が承認する方式を検討する。

---

## 9. Phase Boundary

Phase 1で確定することは、AI操作権限と人間承認原則を文書化し、手動運用へ適用できる状態にすることである。

Phase 1では以下を実施しない。

- AIによる正本文書への直接書き込み
- AIによるGitHubコミットまたはPull Request作成の自動運用
- AIによるNotionまたはDBへの自動更新
- 自動承認
- 自動削除
- 自動同期

これらの自動化を導入する場合は、後続Phaseで安全性、承認フロー、責務境界を検討し、必要に応じて新たなADRを作成する。

---

## 10. Related Decisions

| ADR | 関係 |
|---|---|
| `ADR-001-docs-as-source-of-memory.md` | 人間が保護・更新する正本を定義する |
| `ADR-002-memory-source-of-truth-boundary.md` | AIが扱う情報源の区分と境界を定義する |

---

## 11. Review Record

| Item | Result |
|---|---|
| AIの `read` 権限 | 採用 |
| AIの `draft` 権限 | 採用 |
| AIの正本 `write` 権限 | Phase 1では不採用。人間が反映する |
| AIの `delete` 権限 | 不採用。原則状態変更で履歴を残す |
| 将来の半自動更新 | Phase 1では確定せず、別ADR対象とする |

---

## 12. Change History

| Version | Date | Status | Summary |
|---|---|---|---|
| 0.1.0 | 2026-06-04 | draft | AI更新権限と人間承認ルールの初版ドラフトを作成 |
| 1.0.0 | 2026-06-04 | active | AIの正本writeをPhase 1では不可と明確化し、人間反映主体を固定してActive化 |

```

---

### ADR-004: Project-Independent Memory Template

| Item | Value |
| --- | --- |
| Source ID | src-006-ADR-004-project-independent-memory-template-md |
| Path | docs/adr/ADR-004-project-independent-memory-template.md |
| Document ID | docs/adr/ADR-004-project-independent-memory-template.md |
| Status | active |
| Source Type | adr_source |
| Handling | include |
| Purpose | アーキテクチャ判断や依存方向の根拠を確認する |
| Matched By | mnemosyne_adrs |
| Explicitly Requested | false |
| Selection Reason | Matched Project Registry source group: mnemosyne_adrs. |

```md
---
title: "ADR-004: Project-Independent Memory Template"
document_id: "docs/adr/ADR-004-project-independent-memory-template.md"
adr_id: "ADR-004"
status: "active"
version: "1.0.0"
created_at: "2026-06-05"
updated_at: "2026-06-08"
approved_at: "2026-06-08"
phase: "Phase 1: Memory Foundation"
milestone: "M1-6: Agent接続方針整理"
decision_scope: "Project Memory Template Standardization"
related_documents:
  - "docs/phases/phase-1-memory-foundation.md"
  - "docs/phases/phase-2-input-requirements.md"
  - "docs/templates/memory/project-summary.template.md"
  - "docs/templates/memory/current-status.template.md"
  - "docs/templates/memory/active-decisions.template.md"
  - "docs/templates/memory/next-actions.template.md"
  - "docs/templates/memory/ai-entrypoint.template.md"
  - "docs/templates/memory/conversation-summary.template.md"
  - "docs/projects/mnemosyne/memory/project-summary.md"
  - "docs/projects/ats/memory/project-summary.md"
  - "docs/review/phase-1-ats-template-validation.md"
  - "docs/adr/ADR-001-docs-as-source-of-memory.md"
  - "docs/adr/ADR-002-memory-source-of-truth-boundary.md"
  - "docs/adr/ADR-003-human-approved-memory-update.md"
supersedes: null
superseded_by: null
---

# ADR-004: Project-Independent Memory Template

## 1. Status

`active`

---

## 2. Context

Project Mnemosyneは、AIが参照できる外部記憶基盤を作るプロジェクトである。

Phase 1では、Markdown docsとADRを初期正本とし、Mnemosyne自身およびAdventure Token System（ATS）を検証対象として、プロジェクト記憶テンプレートの適用を進めた。

Phase 1で作成した基本テンプレートは、特定プロジェクト専用ではなく、将来のTapLog、note発信、動画制作、業務改善支援などの別プロジェクトにも適用できる必要がある。

もしプロジェクトごとに記憶文書の構成・章立て・frontmatter・正本ルールが異なると、Phase 2以降でProject RegistryやContext Pack Builderを実装する際に、プロジェクトごとの個別処理が増え、汎用的な専門Agentへ接続しにくくなる。

---

## 3. Decision

Project Mnemosyneでは、プロジェクト記憶文書の基本構成を**プロジェクト非依存テンプレート**として扱う。

各プロジェクトは、原則として同一の標準プロジェクト記憶5文書と共通schemaを用いる。

` ` `text
docs/projects/{project_code}/memory/
  project-summary.md
  current-status.md
  active-decisions.md
  next-actions.md
  ai-entrypoint.md
` ` `

会話要約は、標準プロジェクト記憶5文書とは分離し、**会話整理テンプレート**として扱う。

` ` `text
docs/templates/memory/conversation-summary.template.md
` ` `

`conversation-summary` は、会話内のFact / Decision候補 / Task候補 / Issue候補を整理するための一次整理情報であり、標準プロジェクト記憶5文書と同列の正本ではない。

---

## 4. Standard Project Memory Documents

### 4.1 標準プロジェクト記憶5文書

| Document | Role | Source-of-truth Responsibility | Expected Update Timing |
|---|---|---|---|
| `project-summary.md` | プロジェクトの安定情報を記録する | 目的、背景、対象範囲、主要構成、Out of Scope | 目的・スコープ・前提が変わったとき |
| `current-status.md` | 現在地を記録する | 現在の進行状態、ブロッカー、Pending Decision、Conflict Issue | 状態が大きく変化したとき |
| `active-decisions.md` | 現在有効な判断を記録する | Active Decision、Active Constraint、Superseded / Deprecated Decision | 重要判断が追加・変更されたとき |
| `next-actions.md` | Task正本を記録する | Task本文、優先度、完了条件、状態 | 次アクションを追加・完了・保留するとき |
| `ai-entrypoint.md` | AI参照入口を記録する | 読み順、Minimal Reading Set、Full Reading Set、誤読防止ルール | AI利用入口や参照範囲が変わったとき |

### 4.2 会話整理テンプレート

| Template | Role | Source-of-truth Responsibility | Expected Update Timing |
|---|---|---|---|
| `conversation-summary.template.md` | 会話を再利用可能な形に整理する | 会話内のFact / Decision候補 / Task候補 / Issue候補 / Article Note候補 | 会話後に記憶化候補を整理するとき |

`conversation-summary` に含まれる情報は、Active正本へ反映されるまで未承認の一次整理情報として扱う。

---

## 5. Common Frontmatter Policy

各記憶文書は、少なくとも以下の識別情報を持つ。

| Field | Required | Purpose |
|---|---:|---|
| `title` | yes | 文書名 |
| `document_id` | yes | 文書自身の識別子。原則として保存先pathと一致させる |
| `document_role` | yes | `project_memory` / `review` / `template` 等の文書種別 |
| `memory_type` | yes for memory docs | `project_summary` / `current_status` / `active_decisions` / `next_actions` / `ai_entrypoint` 等 |
| `project_code` | yes | 対象プロジェクトコード |
| `status` | yes | `draft` / `active` / `superseded` / `deprecated` / `archived` |
| `version` | yes | 文書version |
| `created_at` | yes | 作成日 |
| `updated_at` | yes | 更新日 |
| `phase` | recommended | 関連Phase |
| `milestone` | recommended | 関連Milestone |
| `related_documents` | recommended | 関連文書 |

根拠文書は本文中または表内の `source_path` で管理し、文書自身の識別子である `document_id` と混同しない。

---

## 6. Terminology Mapping

Phase 2以降でファイル名とRegistry上の識別子を混同しないよう、以下の対応を標準とする。

| Markdown Document | `memory_type` | Registry Meaning |
|---|---|---|
| `project-summary.md` | `project_summary` | プロジェクト安定情報 |
| `current-status.md` | `current_status` | 現在地・状態サマリー |
| `active-decisions.md` | `active_decisions` | Active Decision / Active Constraint |
| `next-actions.md` | `next_actions` | Task正本 |
| `ai-entrypoint.md` | `ai_entrypoint` | AI参照入口 |
| `conversation-summary.template.md` | `conversation_summary` | 会話整理テンプレート。標準5文書とは別枠 |

---

## 7. Project-Specific Information Policy

テンプレートは共通化するが、文書本文の中身はプロジェクトごとに異なる。

| 情報 | 共通化するもの | プロジェクトごとに変えるもの |
|---|---|---|
| 文書構成 | 標準プロジェクト記憶5文書 | 具体的な内容 |
| 会話整理 | `conversation-summary.template.md` | 会話単位の整理内容 |
| frontmatter | 必須fieldと意味 | `project_code`、関連文書、version |
| Task管理 | `next-actions.md` をTask正本とする | Task ID、優先度、完了条件 |
| Decision管理 | `active-decisions.md` をActive Decision一覧とする | Decision本文、根拠、ADR有無 |
| AI入口 | Minimal / Full Reading Setを持つ | 読ませる文書の具体path |

---

## 8. Deviation Policy

プロジェクト固有の事情により標準テンプレートへ項目追加することは許可する。

ただし、以下は禁止する。

- 標準文書の役割を別文書へ無断で移す
- Task正本を `current-status.md` と `next-actions.md` に二重管理する
- Active Decisionを会話要約だけで確定扱いする
- `conversation-summary` を標準5文書と同列のActive正本として扱う
- project固有の構成を共通テンプレートへ無条件に逆流させる
- Phase 1時点でProject Registry実装を前提とした特殊schemaを導入する

標準テンプレートからの恒久的な逸脱が必要な場合は、Issue化し、必要に応じてADRまたはテンプレート改訂で扱う。

---

## 9. Small Project Operation

小規模プロジェクトでは、5文書構成が重く感じられる可能性がある。

その場合でも、文書の役割自体は維持する。

| Allowed Simplification | Not Allowed |
|---|---|
| 各文書の本文を短くする | 複数文書の責務を1文書へ恒久的に混在させる |
| `current-status.md` を数行の状態サマリーにする | Task正本を `current-status.md` に移す |
| `next-actions.md` のTask数を最小限にする | Decisionを会話要約だけで確定扱いする |
| `ai-entrypoint.md` をMinimal Reading Set中心にする | AI入口と正本文書の責務を混同する |

---

## 10. Project Registry Implication

Phase 2では、Project Registryに `required_memory_docs` を定義する予定である。

ただし、`required_memory_docs` は**Context Packへ常に全文投入する文書**を意味しない。

`required_memory_docs` は、Project Registry上で、そのプロジェク

...[truncated by M2-5 draft Context Builder]
```

---

### ADR-005: Agent and Project Context Separation

| Item | Value |
| --- | --- |
| Source ID | src-007-ADR-005-agent-context-separation-md |
| Path | docs/adr/ADR-005-agent-context-separation.md |
| Document ID | docs/adr/ADR-005-agent-context-separation.md |
| Status | active |
| Source Type | adr_source |
| Handling | include |
| Purpose | アーキテクチャ判断や依存方向の根拠を確認する |
| Matched By | mnemosyne_adrs |
| Explicitly Requested | false |
| Selection Reason | Matched Project Registry source group: mnemosyne_adrs. |

```md
---
title: "ADR-005: Agent and Project Context Separation"
document_id: "docs/adr/ADR-005-agent-context-separation.md"
adr_id: "ADR-005"
status: "active"
version: "1.0.0"
created_at: "2026-06-05"
updated_at: "2026-06-08"
approved_at: "2026-06-08"
phase: "Phase 1: Memory Foundation"
milestone: "M1-6: Agent接続方針整理"
decision_scope: "Agent Context Architecture"
related_documents:
  - "docs/phases/phase-1-memory-foundation.md"
  - "docs/phases/phase-2-input-requirements.md"
  - "docs/adr/ADR-001-docs-as-source-of-memory.md"
  - "docs/adr/ADR-002-memory-source-of-truth-boundary.md"
  - "docs/adr/ADR-003-human-approved-memory-update.md"
  - "docs/adr/ADR-004-project-independent-memory-template.md"
  - "docs/projects/mnemosyne/memory/active-decisions.md"
  - "docs/projects/mnemosyne/memory/ai-entrypoint.md"
  - "docs/projects/ats/memory/ai-entrypoint.md"
  - "docs/review/phase-1-ats-template-validation.md"
supersedes: null
superseded_by: null
---

# ADR-005: Agent and Project Context Separation

## 1. Status

`active`

---

## 2. Context

Project Mnemosyneは、特定プロジェクト専用のAIチャットを作るのではなく、将来的に以下の組み合わせでAI支援を再利用できる状態を目指している。

` ` `text
Specialized Agent
  ×
Project Context
  ×
Task Context
` ` `

例：

` ` `text
ADR整理Agent × ATS Context × 新しい設計判断のADR草案作成
実装レビューAgent × ATS Context × UseCase設計レビュー
要件定義Agent × Mnemosyne Context × Phase 2要件整理
記事化Agent × ATS Context × 開発日記作成
` ` `

ここで、Agent定義とProject Contextを混在させると、以下の問題が起きる。

- ATS用ADR整理Agent、Mnemosyne用ADR整理AgentのようにAgentがプロジェクトごとに増殖する
- Agentの役割、禁止事項、出力形式と、プロジェクトの事実・判断・状態が混ざる
- プロジェクトを切り替えるたびにAgent定義を書き換える必要がある
- Phase 2で `agents.yaml` と `projects.yaml` の責務境界が曖昧になる
- Context Pack Builderが「何をするAgentか」と「何について作業するか」を分離できない

Phase 1ではAgent実装は行わない。ただし、Agentがどの記憶を必要とするか、Agent定義とProject Contextをどう分離するかは、Phase 2入力として整理しておく必要がある。

---

## 3. Decision

Project Mnemosyneでは、専門Agent定義とProject Contextを分離する。

Agent Contextは、Project Memoryの正本ではない。

Agent Contextは、AIにどの役割・制約・出力形式で作業させるかを定義する実行設定である。

ProjectのFact、Decision、Task、Issue、ConstraintはProject Memory側に保持する。

---

## 4. Context Layers

| Layer | Meaning | Examples | Source in Phase 2 |
|---|---|---|---|
| Base Context | Mnemosyne共通の記憶運用ルール | 正本/副本、AI draft only、状態管理、参照優先順位 | common docs / memory policy |
| Agent Context | Agentの役割、責務、入力、出力、禁止事項 | ADR整理Agent、実装レビューAgent、要件定義Agent | `agents.yaml` |
| Project Context | 対象プロジェクトの概要、状態、判断、Task | Mnemosyne、ATS、TapLog等 | `projects.yaml` + memory docs |
| Task Context | 今回の依頼内容、作業範囲、追加入力 | 「ADR-006を作る」「UseCaseをレビューする」 | user prompt / task file |
| Recent Conversation Context | 直近会話の要約、未反映の補足 | 会話中の最新指示、レビュー結果 | conversation summary / chat |
| Output Contract | 成果物の形式、禁止事項、品質条件 | ADR形式、レビュー表、修正案リスト | agent definition / task request |

---

## 5. Responsibility Boundary

### 5.1 Agent Contextが持つもの

| Item | Description |
|---|---|
| Role | Agentが何をする役割か |
| Scope | 扱う作業範囲 |
| Required Context Types | 必須となる記憶種別 |
| Optional Context Types | あれば使う記憶種別 |
| Output Type | 出力種別 |
| Output Contract | 出力構成・品質条件 |
| Prohibited Actions | 禁止事項 |
| Write Policy | 正本更新可否。原則 `draft_only` |

### 5.2 Agent Contextが持たないもの

| Item | Where to Keep |
|---|---|
| Project固有のFact | `project-summary.md` / `current-status.md` |
| Project固有のDecision | `active-decisions.md` / ADR |
| Project固有のTask | `next-actions.md` |
| Project固有のIssue | `current-status.md` または専用review/issue文書 |
| Project固有のAI入口 | `ai-entrypoint.md` |
| 会話から抽出した更新候補 | `conversation-summary` またはAI draft |

---

## 6. Recent Conversation Context Policy

Recent Conversation Contextは、直近の補足・未反映情報として扱う。

Active正本と競合する場合、Active正本を優先し、会話内容はConflict候補または更新候補として扱う。

Recent Conversation Contextにしか存在しない情報は、以下のように扱う。

| Situation | Handling |
|---|---|
| ユーザーが明示的に今回の作業対象として指定した | Task Contextとして参照可能 |
| Active正本へ未反映の判断候補である | Decision候補として扱い、確定判断には使わない |
| Active正本と矛盾する | Conflict Issue候補として扱う |
| 出典が不明確 | 推測で補完せず、不足Contextとして明示する |

---

## 7. Context Pack Composition

Context Packは、以下の要素を組み合わせて生成する。

` ` `text
1. Base Context
2. Agent Context
3. Project Context
4. Task Context
5. Recent Conversation Context
6. Output Contract
7. Source List
8. Warnings / Build Report
` ` `

Context Packは正本ではなく生成物である。

---

## 8. Resolution Order, Rendering Order, Source Priority

Context Pack生成では、以下の3種類の順序を混同しない。

| Order Type | Meaning | Example |
|---|---|---|
| Resolution Order | Builderが文書を探索・検証する順序 | Project Registry → Agent Registry → memory docs |
| Rendering Order | AIへ渡すContext Pack内の表示順序 | Agent Role → Project Summary → Task Request |
| Source Priority | 競合時にどの情報を優先するか | Active ADR > Active memory docs > conversation summary |

### 8.1 Resolution Order候補

` ` `text
1. project_codeを解決する
2. agent_codeを解決する
3. required_memory_docsの存在を検証する
4. agentが必要とするmemory_typeを解決する
5. task_requestに応じてadditional_sourcesを追加する
6. status / conflict / draft混入を検査する
` ` `

### 8.2 Rendering Order候補

` ` `text
1. Agent Role and Output Contract
2. Target Project Summary
3. Current Status
4. Active Decisions and Constraints
5. Task Request
6. Required Actions / Output Format
7. Source List
8. Warnings
` ` `

### 8.3 Source Priority候補

` ` `text
1. Active ADR
2. Active memory docs
3. Active review / phase docs
4. Explicit user-provided task source
5. Draft source explicitly selected for review
6. Conversation summary / recent conversation context
` ` `

`ai-entrypoint.md` は入口であり、Decision / Task / Issueの正本ではない。

---

## 9. Context Insufficiency Handling

Agentが必要とするContextが不足している場合、AIは不足を明示し、推測で補完しない。

| Situation | Required Behavior |
|---|---|
| 必須文書が存在しない | Context不足として報告する |
| optional sourceが未登録 | 追加確認候補として提示する |
| activeな判断が見つからない | 未決定として扱う |
| active正本間に競合がある | Conflict Issueとして扱い、確定判断に使わない |
| Conversation Summaryにしかない情報 | 未反映の一次整理情報として扱う |
| draft sourceしか存在しない | warningを付け、確定判断の根拠にしない |

---

## 10. Initial Agent Candidates

| Agent Code | Agent Name | Required Context | Optional Context | Output Type | Priority |
|---|---|---|---|---|---|
| `adr_writer` | ADR整理Agent | project_summary / active_decisions / ADR | current_status / related docs | `adr_draft` | P0 |
| `requirements_writer` | 要件定義Age

...[truncated by M2-5 draft Context Builder]
```

## 7. Next Actions

No source selected for this section by M2-5 draft builder.

## 8. Session Context

No source selected for this section by M2-5 draft builder.

## 9. Recent Conversation Context

No source selected for this section by M2-5 draft builder.

## 10. Task Context

### 10.1 Objective

M2-6 context preview integration check

### 10.2 Required Outputs

- Generate Context Pack Markdown.
- Generate detailed Build Report Markdown.
- Preserve source traceability through Source List.

### 10.3 Done Criteria

- Context Pack is generated under dist/context/{project_code}/{agent_code}/context-pack.md.
- Build Report is generated under dist/context/{project_code}/{agent_code}/build-report.md.
- Missing required docs, excluded sources, and warnings are reported.

## 11. Additional Sources

### 11.1 Build Report and Context Preview Rule

| Item | Value |
| --- | --- |
| Source ID | src-008-build-report-rule-md |
| Path | docs/context/build-report-rule.md |
| Document ID | docs/context/build-report-rule.md |
| Status | draft |
| Source Type | additional_source |
| Handling | include_with_warning |
| Purpose | Explicitly supplied additional source. |
| Matched By | additional_source |
| Explicitly Requested | true |
| Selection Reason | Explicitly requested by additional_sources or --source. |

#### Relevant Content

```md
---
title: "Build Report and Context Preview Rule"
document_id: "docs/context/build-report-rule.md"
document_role: "context_build_report_rule"
status: "draft"
version: "0.1.0"
created_at: "2026-06-10"
updated_at: "2026-06-10"
phase: "Phase 2: Context Forge"
milestone: "M2-6: Context Preview実装"
owner: "Project Mnemosyne"
review_status: "draft"
related_documents:
  - "docs/context/context-pack-structure.md"
  - "docs/context/source-status-policy.md"
  - "docs/context/context-build-rule.md"
  - "docs/templates/context/context-pack.template.md"
  - "docs/templates/context/context-preview.template.md"
  - "docs/templates/context/build-report.template.md"
  - "src/services/contextPreviewService.ts"
---

# Build Report and Context Preview Rule

## 1. Status

`draft`

本書は、M2-6：Context Preview実装のドラフト成果物である。

---

## 2. Purpose

本書は、Context PackをAIへ投入する前に、人間が確認するための **Context Preview** と、生成過程を追跡する **Build Report** の出力ルールを定義する。

M2-6では、Context Pack本文を直接読まなくても、以下を確認できる状態を目指す。

- どのsourceが含まれ、どのsourceが除外されたか
- active / accepted / draft / proposed / archived / deprecated / superseded / unknown sourceが混在していないか
- Context不足、競合候補、token budget超過がないか
- Agent要求Contextが満たされているか
- Context Pack本文とBuild Reportの対応を追跡できるか

---

## 3. Scope

### 3.1 In Scope

- Context PackとPreviewの差分定義
- Build Reportの詳細出力ルール
- Context Previewの人間確認用出力ルール
- source list / warnings / token estimate / coverageの表示ルール
- source status混在状況の表示ルール
- Agent要求Contextの充足状況の表示ルール
- Context Pack本文とBuild Reportのtrace rule
- `dist/context/{project_code}/{agent_code}/context-preview.md` の出力ルール

### 3.2 Out of Scope

- Context Pack本文の章構成変更
- Agent Registry自体のschema変更
- Semantic conflict detectionの完全実装
- tokenizerベースの厳密なtoken count
- GUI Preview
- RAG検索結果Preview

---

## 4. Artifact Relationship

M2-6の生成物は以下の関係とする。

| Artifact | Primary Reader | Purpose | Source of Truth |
|---|---|---|---|
| Context Pack | AI | AI投入用の本文Context | no |
| Build Report | human / tool | 生成過程、検証結果、採用・除外理由の詳細 | no |
| Context Preview | human | AI投入前の確認用サマリー | no |

Context Previewは、Context Packの短縮版ではない。  
Context Previewは、**AIに渡す内容そのものではなく、AIへ渡す前に人間が確認すべきリスク・充足状況・trace情報をまとめた確認用成果物**である。

---

## 5. Context Pack and Preview Difference

| Item | Context Pack | Context Preview |
|---|---|---|
| Main purpose | AIへ渡す作業文脈 | 人間が投入前に確認する |
| Includes source excerpts | yes | no, 原則summaryのみ |
| Includes full task context | yes | summary only |
| Includes warnings | yes | yes, emphasized |
| Includes source list | yes | yes, compact plus status summary |
| Includes token estimate | summary only | yes, review-focused |
| Includes coverage | optional summary | required |
| Includes agent required context satisfaction | usually implicit | required |
| Use as AI input | yes | no |
| Use as source of truth | no | no |

---

## 6. Required Build Report Sections

Build Reportは以下の章を持つ。

` ` `md
# Context Build Report

## 1. Build Result
## 2. Request Summary
## 3. Output Artifacts
## 4. Required Docs Check
## 5. Agent Context Coverage
## 6. Source Coverage
## 7. Source Status Distribution
## 8. Warnings
## 9. Errors
## 10. Included Sources
## 11. Excluded Sources
## 12. Token Estimate
## 13. Context Pack Trace
## 14. Unsupported / Placeholder Features
` ` `

---

## 7. Required Context Preview Sections

Context Previewは以下の章を持つ。

` ` `md
# Context Preview

## 1. Preview Summary
## 2. Human Review Checklist
## 3. Build Result
## 4. Output Artifacts
## 5. Warning Summary
## 6. Source Status Mix
## 7. Agent Context Coverage
## 8. Source Coverage
## 9. Token Estimate
## 10. Context Pack and Build Report Trace
## 11. Included Source List
## 12. Excluded Source List
## 13. Review Decision
` ` `

---

## 8. Warning Rules

Context Preview must surface the same warning codes as Context Pack / Build Report.

| Warning Code | Preview Handling |
|---|---|
| `missing_required_doc` | P0 risk. Show in Warning Summary and Agent Context Coverage if relevant. |
| `draft_source_included` | Show in Source Status Mix and Included Source List. |
| `proposed_source_included` | Show in Source Status Mix and Included Source List. |
| `archived_source_included` | Show in Source Status Mix and Included Source List. |
| `deprecated_source_included` | Show in Source Status Mix and Included Source List. |
| `superseded_source_included` | Show in Source Status Mix and Included Source List. |
| `unknown_status` | Show as P0/P1 review risk depending on source role. |
| `conflict_detected` | Show in Warning Summary. Human review required. |
| `adr_conflict_detected` | Show as P0 risk. Human review required. |
| `recent_context_conflict` | Show in Warning Summary. Active source takes precedence. |
| `source_excluded` | Show in Excluded Source List. |
| `token_budget_exceeded` | Show in Token Estimate and Review Checklist. |

---

## 9. Agent Context Coverage Rule

Agent Context Coverage verifies whether the Context Pack satisfies the agent's requested context.

### 9.1 Coverage Status

| Status | Meaning |
|---|---|
| `covered` | At least one included source satisfies the required context item. |
| `partial` | Source exists but is summarized, warning-only, reference-only, or weakly matched. |
| `missing` | No included source satisfies the required context item. |
| `not_applicable` | The required item is not applicable to this build request. |
| `unknown` | Coverage cannot be determined by the current builder. |

### 9.2 Coverage Matching Inputs

Coverage may be calculated from the following fields.

- Agent Registry `required_context`
- Agent Registry `optional_context`
- Context source `includedSection`
- Context source `matchedBy`
- Context source `inclusionReason`
- Context source `sourceType`
- Task Request
- Additional Sources

### 9.3 Initial Implementation Rule

M2-6 initial implementation may use deterministic structural matching only.

Semantic coverage scoring is not required in M2-6.

---

## 10. Source Coverage Rule

Source Coverage summarizes the selected and excluded source population.

| Metric | Description |
|---|---

...[truncated by M2-5 draft Context Builder]
```

## 12. Constraints and Write Policy

### 12.1 Allowed Outputs

- create draft documents
- create review reports
- create update proposals
- create diff suggestions
- create warnings and issue candidates

### 12.2 Forbidden Updates

- update active source documents directly
- treat draft or proposed sources as final decisions
- promote issues or ideas to decisions without human approval
- modify source-of-truth documents after Context Pack generation

### 12.3 Human Approval Required

- active document updates
- ADR acceptance
- task source-of-truth updates
- status changes

## 13. Warnings

| Type | Severity | Source ID | Message | Handling |
| --- | --- | --- | --- | --- |
| draft_source_included | warning | src-008-build-report-rule-md | Non-active source included with warning: docs/context/build-report-rule.md status=draft | docs/context/build-report-rule.md |

## 14. Source List

| Source ID | Path | Document ID | Title | Status | Source Type | Included Section | Purpose | Handling | Matched By | Explicitly Requested | Selection Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| src-001-active-decisions-md | docs/projects/mnemosyne/memory/active-decisions.md | docs/projects/mnemosyne/memory/active-decisions.md | Mnemosyne Memory: Active Decisions | active | memory_doc | 6. Active Decisions | 実装が従うべき設計判断と制約を確認する | include | agent_required_context | true | Selected by agent_required_context. |
| src-002-project-summary-md | docs/projects/mnemosyne/memory/project-summary.md | docs/projects/mnemosyne/memory/project-summary.md | Mnemosyne Memory: Project Summary | active | memory_doc | 4. Project Context | 対象Projectの目的と主要構成を把握する | include | agent_required_context | true | Selected by agent_required_context. |
| src-003-ADR-001-docs-as-source-of-memory-md | docs/adr/ADR-001-docs-as-source-of-memory.md | docs/adr/ADR-001-docs-as-source-of-memory.md | ADR-001: Markdown docs and ADRs as the Source of Memory | active | adr_source | 6. Active Decisions | アーキテクチャ判断や依存方向の根拠を確認する | include | mnemosyne_adrs | false | Matched Project Registry source group: mnemosyne_adrs. |
| src-004-ADR-002-memory-source-of-truth-boundary-md | docs/adr/ADR-002-memory-source-of-truth-boundary.md | docs/adr/ADR-002-memory-source-of-truth-boundary.md | ADR-002: Memory Source of Truth Boundary | active | adr_source | 6. Active Decisions | アーキテクチャ判断や依存方向の根拠を確認する | include | mnemosyne_adrs | false | Matched Project Registry source group: mnemosyne_adrs. |
| src-005-ADR-003-human-approved-memory-update-md | docs/adr/ADR-003-human-approved-memory-update.md | docs/adr/ADR-003-human-approved-memory-update.md | ADR-003: Human-Approved Memory Update | active | adr_source | 6. Active Decisions | アーキテクチャ判断や依存方向の根拠を確認する | include | mnemosyne_adrs | false | Matched Project Registry source group: mnemosyne_adrs. |
| src-006-ADR-004-project-independent-memory-template-md | docs/adr/ADR-004-project-independent-memory-template.md | docs/adr/ADR-004-project-independent-memory-template.md | ADR-004: Project-Independent Memory Template | active | adr_source | 6. Active Decisions | アーキテクチャ判断や依存方向の根拠を確認する | include | mnemosyne_adrs | false | Matched Project Registry source group: mnemosyne_adrs. |
| src-007-ADR-005-agent-context-separation-md | docs/adr/ADR-005-agent-context-separation.md | docs/adr/ADR-005-agent-context-separation.md | ADR-005: Agent and Project Context Separation | active | adr_source | 6. Active Decisions | アーキテクチャ判断や依存方向の根拠を確認する | include | mnemosyne_adrs | false | Matched Project Registry source group: mnemosyne_adrs. |
| src-008-build-report-rule-md | docs/context/build-report-rule.md | docs/context/build-report-rule.md | Build Report and Context Preview Rule | draft | additional_source | 11. Additional Sources | Explicitly supplied additional source. | include_with_warning | additional_source | true | Explicitly requested by additional_sources or --source. |

## 15. Build Report Summary

| Item | Value |
| --- | --- |
| Included Source Count | 8 |
| Excluded Source Count | 0 |
| Warning Count | 1 |
| Conflict Count | 0 |
| Missing Required Source Count | 0 |
| Token Budget Handling | none / approximate=true |
| Detailed Build Report Path | dist\context\mnemosyne\implementation_reviewer\build-report.md |

### 15.1 Excluded Sources Summary

No excluded sources.

### 15.2 Conflict Summary

No conflicts detected by M2-5 draft builder.

### 15.3 Missing Required Sources Summary

No missing required sources.

## End of Context Pack
