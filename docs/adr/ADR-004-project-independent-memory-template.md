---
title: "ADR-004: Project-Independent Memory Template"
document_id: "docs/adr/ADR-004-project-independent-memory-template.md"
adr_id: "ADR-004"
status: "draft"
version: "0.1.0"
created_at: "2026-06-05"
updated_at: "2026-06-05"
approved_at: null
phase: "Phase 1: Memory Foundation"
milestone: "M1-6: Agent接続方針整理"
decision_scope: "Project Memory Template Standardization"
related_documents:
  - "docs/phases/phase-1-memory-foundation.md"
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

`draft`

---

## 2. Context

Project Mnemosyneは、AIが参照できる外部記憶基盤を作るプロジェクトである。

Phase 1では、Markdown docsとADRを初期正本とし、Mnemosyne自身およびAdventure Token System（ATS）を検証対象として、プロジェクト記憶テンプレートの適用を進めた。

Phase 1で作成した基本テンプレートは以下である。

```text
project-summary.md
current-status.md
active-decisions.md
next-actions.md
ai-entrypoint.md
conversation-summary.md
```

これらはATS専用でもMnemosyne専用でもなく、将来TapLog、note発信、動画制作、業務改善支援などの別プロジェクトにも適用できる必要がある。

もしプロジェクトごとに記憶文書の構成・章立て・frontmatter・正本ルールが異なると、Phase 2以降でProject RegistryやContext Pack Builderを実装する際に、プロジェクトごとの個別処理が増え、汎用的な専門Agentへ接続しにくくなる。

---

## 3. Decision

Project Mnemosyneでは、プロジェクト記憶文書の基本構成を**プロジェクト非依存テンプレート**として扱う。

各プロジェクトは、原則として同一の記憶文書セットと共通schemaを用いる。

```text
docs/projects/{project_code}/memory/
  project-summary.md
  current-status.md
  active-decisions.md
  next-actions.md
  ai-entrypoint.md
```

会話要約は、プロジェクト記憶の更新候補または一次整理記録として以下のテンプレートを用いる。

```text
docs/templates/memory/conversation-summary.template.md
```

### 3.1 標準文書セット

| Document | Role | Source-of-truth Responsibility | Expected Update Timing |
|---|---|---|---|
| `project-summary.md` | プロジェクトの安定情報を記録する | 目的、背景、対象範囲、主要構成、Out of Scope | 目的・スコープ・前提が変わったとき |
| `current-status.md` | 現在地を記録する | 現在の進行状態、ブロッカー、Pending Decision、Conflict Issue | 状態が大きく変化したとき |
| `active-decisions.md` | 現在有効な判断を記録する | Active Decision、Active Constraint、Superseded / Deprecated Decision | 重要判断が追加・変更されたとき |
| `next-actions.md` | Task正本を記録する | Task本文、優先度、完了条件、状態 | 次アクションを追加・完了・保留するとき |
| `ai-entrypoint.md` | AI参照入口を記録する | 読み順、Minimal Reading Set、Full Reading Set、誤読防止ルール | AI利用入口や参照範囲が変わったとき |
| `conversation-summary.md` | 会話を再利用可能な形に整理する | 会話内のFact / Decision候補 / Task候補 / Issue候補 | 会話後に記憶化候補を整理するとき |

### 3.2 共通frontmatter方針

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

### 3.3 プロジェクト固有情報の扱い

テンプレートは共通化するが、文書本文の中身はプロジェクトごとに異なる。

| 情報 | 共通化するもの | プロジェクトごとに変えるもの |
|---|---|---|
| 文書構成 | 5文書 + conversation-summary | 具体的な内容 |
| frontmatter | 必須fieldと意味 | `project_code`、関連文書、version |
| Task管理 | `next-actions.md` をTask正本とする | Task ID、優先度、完了条件 |
| Decision管理 | `active-decisions.md` をActive Decision一覧とする | Decision本文、根拠、ADR有無 |
| AI入口 | Minimal / Full Reading Setを持つ | 読ませる文書の具体path |

### 3.4 テンプレートから外れる場合

プロジェクト固有の事情により標準テンプレートへ項目追加することは許可する。

ただし、以下は禁止する。

- 標準文書の役割を別文書へ無断で移す
- Task正本を `current-status.md` と `next-actions.md` に二重管理する
- Active Decisionを会話要約だけで確定扱いする
- project固有の構成を共通テンプレートへ無条件に逆流させる
- Phase 1時点でProject Registry実装を前提とした特殊schemaを導入する

標準テンプレートからの恒久的な逸脱が必要な場合は、Issue化し、必要に応じてADRまたはテンプレート改訂で扱う。

---

## 4. Rationale

### 4.1 Phase 2のProject Registry設計を単純化できる

Project Registryは、プロジェクトコード、記憶文書root、必須文書、任意文書を管理する予定である。

各プロジェクトの記憶構造が共通であれば、Phase 2で以下のような入力を安定して扱える。

```yaml
project_code: ats
memory_root: docs/projects/ats/memory
required_memory_docs:
  - project-summary.md
  - current-status.md
  - active-decisions.md
  - next-actions.md
  - ai-entrypoint.md
```

### 4.2 専門Agentの再利用性が高まる

ADR整理Agent、実装レビューAgent、要件定義Agent、記事化Agentなどは、プロジェクトに依存せず、必要な記憶種別を指定できる。

例：

```text
ADR整理Agent:
  required: project-summary / active-decisions / ADR
  optional: current-status / related docs
```

この指定がプロジェクトごとに成立するためには、各プロジェクトが同じ種類の記憶文書を持つ必要がある。

### 4.3 ATS検証で基本構造の有効性を確認できた

M1-5のATS適用検証では、5文書によりATSの目的、現在地、主要判断、次アクション、AI参照入口を再構築できることを確認した。

一方で、実装レビューAgentなどでは追加docsが必要になることも確認された。これは標準テンプレートを否定するものではなく、標準記憶文書を基点に、タスク固有文書を任意参照として追加する必要があることを示している。

### 4.4 記憶の正本性と生成物を分離しやすい

共通テンプレートを使うことで、Context Pack、Search Result Context、AI Draftなどの生成物が、どの正本文書から作られたものか追跡しやすくなる。

---

## 5. Alternatives Considered

### 5.1 プロジェクトごとに自由な記憶構造を許可する

**却下。** 初期作成は楽になるが、Phase 2以降でContext Builderがプロジェクトごとの個別処理を必要とする。専門Agentが「どの文書を読めばよいか」を汎用的に判断しにくくなる。

### 5.2 ATS専用テンプレートを先に作る

**却下。** ATSは検証対象として有効だが、ATS専用構造を標準にすると、Mnemosyneの目的である複数プロジェクト対応から外れる。

### 5.3 すべてを1つの巨大なmemory.mdへ集約する

**却下。** 読み込みは単純になるが、Fact、Decision、Task、Issue、AI入口の責務が混在し、更新時の衝突や二重管理が起きやすい。

### 5.4 DB schemaを先に定義して文書を従属させる

**Phase 1では却下。** Phase 1は記憶構造と運用ルールを固める段階であり、DB実装に依存させると設計変更コストが高くなる。

---

## 6. Consequences

### 6.1 Positive Consequences

- 新規プロジェクトへ記憶構造を適用しやすくなる。
- Project Registryの入力項目を安定させやすい。
- 専門Agentが必要Contextを記憶種別で指定できる。
- Task、Decision、Issueの正本位置がぶれにくくなる。
- Context Pack生成時の読込順序を標準化しやすい。

### 6.2 Negative Consequences

- 小規模プロジェクトでは5文書構成がやや重く感じられる可能性がある。
- プロジェクト固有の事情を標準テンプレートへどう反映するか判断が必要になる。
- テンプレート改訂時に既存プロジェクト文書との整合確認が必要になる。

### 6.3 Mitigation

- 小規模プロジェクトでは一部文書の内容を簡略化してもよいが、文書の役割自体は維持する。
- プロジェクト固有の追加情報は `optional_sources` として扱う。
- テンプレートへの恒久反映は、複数プロジェクトで必要性が確認された場合に限定する。
- Phase 2でProject Registryに `required_memory_docs` と `optional_sources` を分けて登録する。

---

## 7. Implementation Notes for Phase 2

Phase 2では、本ADRを前提に、以下の設計を行う。

### 7.1 Project Registry候補

```yaml
projects:
  - project_code: mnemosyne
    project_name: "Project Mnemosyne"
    memory_root: "docs/projects/mnemosyne/memory"
    required_memory_docs:
      - "project-summary.md"
      - "current-status.md"
      - "active-decisions.md"
      - "next-actions.md"
      - "ai-entrypoint.md"
    optional_sources:
      - "docs/phases/phase-1-memory-foundation.md"
      - "docs/adr/*.md"

  - project_code: ats
    project_name: "Adventure Token System"
    memory_root: "docs/projects/ats/memory"
    required_memory_docs:
      - "project-summary.md"
      - "current-status.md"
      - "active-decisions.md"
      - "next-actions.md"
      - "ai-entrypoint.md"
    optional_sources:
      - "docs/usecase-contracts.md"
      - "docs/database-design.md"
      - "docs/test-results/*.md"
```

### 7.2 Context Pack生成時の最低読込順序

```text
1. ai-entrypoint.md
2. project-summary.md
3. current-status.md
4. active-decisions.md
5. next-actions.md
6. task-specific optional sources
```

`ai-entrypoint.md` は入口であり、Decision / Task / Issue の正本ではない。

---

## 8. Open Issues

| Issue ID | Issue | Owner | Target Phase | Status |
|---|---|---|---|---|
| ADR-004-OI-001 | 小規模プロジェクト向けに5文書をすべて必須にするか、簡易モードを定義するか | user | Phase 2 | open |
| ADR-004-OI-002 | `docs/projects/{project_code}/memory/` を最終正本配置にするか、各プロジェクトrepo側を正本にするか | user | Phase 2 | open |
| ADR-004-OI-003 | テンプレート改訂時の既存プロジェクト文書への反映手順 | user | Phase 2 or later | open |

---

## 9. References

- `docs/phases/phase-1-memory-foundation.md`
- `docs/templates/memory/project-summary.template.md`
- `docs/templates/memory/current-status.template.md`
- `docs/templates/memory/active-decisions.template.md`
- `docs/templates/memory/next-actions.template.md`
- `docs/templates/memory/ai-entrypoint.template.md`
- `docs/templates/memory/conversation-summary.template.md`
- `docs/review/phase-1-ats-template-validation.md`
- `docs/adr/ADR-001-docs-as-source-of-memory.md`
- `docs/adr/ADR-002-memory-source-of-truth-boundary.md`
- `docs/adr/ADR-003-human-approved-memory-update.md`

---

## 10. Change History

| Version | Date | Status | Change Summary | Approved By |
|---|---|---|---|---|
| 0.1.0 | 2026-06-05 | draft | M1-6 Agent接続方針整理として初版ドラフトを作成。 | pending |
