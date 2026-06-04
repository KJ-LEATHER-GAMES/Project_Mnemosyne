前回の `# 11. 次分冊で定義する範囲` は、正式文書へ統合する際に以下の **`# 11. Phase 6：Agent Operation`** へ置き換えてください。

原案のPhase 6は、Agentごとの定義ファイル、参照範囲、禁止事項、出力形式を整備し、Project Contextを差し替えて再利用できる状態を目指すフェーズとして定義されていました。 

今回の要件定義では、Phase 2で定義したAgent Registry、Phase 5で接続可能になったMCP Tool群、および現在の中核方針である **「専門Agent × Project Context × Task Context」** を接続し、Agentを実際の作業で安全に運用するフェーズとして具体化します。 

# 11. Phase 6：Agent Operation

## 副題：役割別Agentを実運用する

---

## 11.1 Phase概要

| 項目          | 内容                                                                                        |
| ----------- | ----------------------------------------------------------------------------------------- |
| Phase       | Phase 6                                                                                   |
| 名称          | Agent Operation                                                                           |
| 副題          | 役割別Agentを実運用する                                                                            |
| 主目的         | Phase 1〜5で整備した記憶基盤、Context生成、検索、APIおよびMCP Toolを、役割別の専門Agentが実際の作業で再利用できる運用体系として確立する       |
| 実装レベル       | Agent Definition、Agent Registry拡張、Tool利用ルール、作業ワークフロー、検証運用                                 |
| 主入力         | Agent Registry、Project Registry、Context Pack、MCP Tool、Memory Gateway API、Phase 6入力要件      |
| 主出力         | Agent定義文書、Agent運用ルール、Agent別Tool利用プロファイル、実運用検証記録                                           |
| 初期対象Project | Project Mnemosyne / ATS                                                                   |
| 初期運用Agent   | Requirements Review Agent / Implementation Review Agent / ADR Agent / Task Planning Agent |
| 拡張候補Agent   | Docs Update Agent / Article Agent / Context Curation Agent                                |
| 次Phaseとの接続  | Phase 7で会話要約、記憶候補抽出、Draft生成、棚卸し等を安全に半自動化する                                                |

---

## 11.2 Phase 6の位置づけ

Phase 1では、何を記憶の正本とし、どのように分類・更新・参照するかを定義した。

Phase 2では、`Project × Agent × Task` に基づくContext Packを生成できるようにした。

Phase 3では、固定読み込みだけでは不足する関連記憶を検索し、Retrieved Contextとして補完できるようにした。

Phase 4では、これらの機能をMemory Gateway APIとして安全に外部公開できるようにした。

Phase 5では、AIクライアントがMCP Toolを通じて、記憶参照・検索・Context生成・Draft作成を利用できるようにした。

Phase 6では、これらの機能を単に利用可能な状態で終わらせず、**どの専門Agentが、どのProject Contextを参照し、どのToolをどの順序で使い、どの形式の成果物を作成し、どの時点で人間レビューを必要とするか**を定義し、実作業で運用可能な状態にする。

```text
Phase 1：
記憶の正本と運用ルールを作る

Phase 2：
Project × Agent × Task に応じたContext Packを作る

Phase 3：
関連記憶を検索してContextを補完する

Phase 4：
記憶機能をAPIとして公開する

Phase 5：
AIクライアントがMCP Toolとして利用できるようにする

Phase 6：
役割別AgentがToolとContextを使い、
実際の作業成果物を安全に作成できる運用を確立する
```

---

## 11.3 Phase 6の重要な設計整理

### 11.3.1 Agentは「自律実行プログラム」ではなく「専門作業の運用契約」とする

Phase 6におけるAgentは、独自に判断して複数工程を自動実行し続ける自律システムを意味しない。

初期のAgent Operationでは、Agentを以下の要素を持つ**役割定義および運用契約**として扱う。

| 定義要素                | 内容              |
| ------------------- | --------------- |
| Role                | どの専門作業を担当するか    |
| Purpose             | 何を達成するためのAgentか |
| Required Context    | 作業開始前に必要な文脈     |
| Optional Context    | 必要時に追加取得する情報    |
| Allowed Tools       | 使用可能なMCP Tool   |
| Tool Sequence       | 推奨するTool利用順序    |
| Forbidden Actions   | 行ってはならない操作      |
| Output Format       | 生成する成果物の形式      |
| Human Review Point  | 人間確認が必要な時点      |
| Completion Criteria | Agent作業の完了条件    |

```text
Agent Operation
= AIに自由行動させることではない

Agent Operation
= 専門作業の目的・参照情報・Tool利用・成果物・禁止事項を
  再利用可能な運用単位として定義すること
```

### 11.3.2 Agent、MCP Tool、Project Contextの責務を分離する

| 要素              | 役割                      | 例                       |
| --------------- | ----------------------- | ----------------------- |
| Agent           | 何を行うかを定義する              | 要件レビュー、ADR整理、実装レビュー     |
| Project Context | 何について行うかを提供する           | Mnemosyne、ATS、TapLog    |
| Task Context    | 今回何を処理するかを指定する          | Phase要件レビュー、UseCaseレビュー |
| MCP Tool        | 必要な記憶取得・検索・Draft作成を行う操作 | `search_project_memory` |
| Memory Gateway  | Toolの接続先となる安全なAPI境界     | Context取得、検索、Draft作成    |
| 正本文書            | 確定した情報を保持する             | Markdown docs、ADR       |

#### 採用する構造

```text
専門Agent
  ×
Project Context
  ×
Task Context
  ↓
必要なMCP Toolを利用
  ↓
Context取得・検索・成果物草案作成
  ↓
人間レビュー
  ↓
必要に応じて正本へ反映
```

#### 採用しない構造

```text
ATS専用レビューAgent
TapLog専用ADR Agent
Mnemosyne専用タスクAgent
```

AgentをProjectごとに複製するのではなく、Project Contextを差し替えて再利用する。

### 11.3.3 Agentの成果物は原則としてDraftまたはReview Reportとする

Phase 6でAgentが作成する成果物は、以下の二種類を基本とする。

| 成果物区分         | 内容                      | 正本性      |
| ------------- | ----------------------- | -------- |
| Review Report | 分析・指摘・評価・論点整理           | 正本ではない   |
| Draft         | 文書更新案、ADR案、Task追加案、記事案等 | 正本反映前の候補 |

Agentは、正本文書の更新案を作成できるが、自ら確定反映してはならない。

```text
Agentができること：
レビューする
論点を分類する
修正案を作る
ADR案を作る
タスク案を作る
記事草案を作る

Agentができないこと：
正本を直接更新する
ADRをAcceptedにする
Taskを完了扱いにする
古い記憶を削除する
人間の承認を代替する
```

### 11.3.4 初期運用Agentは必要最小限に限定する

原案では複数のAgent候補が示されていたが、Phase 6開始時点ですべてを同時に整備する必要はない。

まず、Project MnemosyneとATSの双方で検証価値が高く、成果物の性質が異なる以下の4種類を初期運用対象とする。

| Agent                       | 主な検証価値                                              |
| --------------------------- | --------------------------------------------------- |
| Requirements Review Agent   | Mnemosyneの要件・Phase文書整合確認に利用できる                      |
| Implementation Review Agent | ATSの実装・設計・検証記録の整合確認に利用できる                           |
| ADR Agent                   | 判断候補からADR草案を作る運用を検証できる                              |
| Task Planning Agent         | Current StatusとDecisionからNext Actions更新案を作る運用を検証できる |

以下は、初期4Agentの運用が成立した後に拡張対象とする。

| Agent                  | 拡張理由                         |
| ---------------------- | ---------------------------- |
| Docs Update Agent      | Agent成果物を設計docs更新へ展開するため     |
| Article Agent          | 開発記録を発信用成果物へ展開するため           |
| Context Curation Agent | 記憶構造・Context不足・古い情報整理を支援するため |

### 11.3.5 Phase 6ではAgent orchestrationを必須化しない

Phase 6では、複数Agentを自動連携させる統括Agentやワークフローエンジンを必須範囲に含めない。

例として、Requirements Review Agentの結果からADR Agentを起動し、さらにTask Planning Agentへ自動連携する構成は将来的に有用であるが、初期運用では人間が成果物を確認した上で次のAgent利用を判断する。

```text
初期運用：
人間がAgentを選択
  ↓
AgentがToolを利用して成果物を作成
  ↓
人間がレビュー
  ↓
必要なら次のAgentを選択

将来候補：
Agent成果物を条件に応じて別Agentへ自動連携
```

---

## 11.4 Phase 6の目的

### 11.4.1 主目的

```text
汎用的な専門Agentについて、
役割、参照Context、利用Tool、禁止事項、出力形式、
人間レビュー境界および完了条件を定義し、
異なるProject Contextへ差し替えて
実際の作業で再利用できる運用体系を確立する。
```

### 11.4.2 具体目的

| ID         | 目的                                                            |
| ---------- | ------------------------------------------------------------- |
| P6-OBJ-001 | Agent Definitionの標準構造を定義する                                    |
| P6-OBJ-002 | Agent Registryと詳細Agent文書の責務を整理する                              |
| P6-OBJ-003 | Agentごとに必要Context、任意Contextおよび参照優先順位を定義する                     |
| P6-OBJ-004 | Agentごとに利用可能なMCP Toolと推奨利用順序を定義する                             |
| P6-OBJ-005 | Agentごとの禁止事項、Draft Only方針および人間レビュー条件を定義する                     |
| P6-OBJ-006 | 初期運用対象Agentを定義し、MnemosyneおよびATSで利用検証する                        |
| P6-OBJ-007 | 同一Agentを異なるProject Contextへ適用できることを確認する                       |
| P6-OBJ-008 | 異なるAgentを同一Project Contextへ適用した場合に成果物と参照Contextが適切に変わることを確認する |
| P6-OBJ-009 | Agent利用から生じたReview ReportおよびDraftを正本反映候補として扱う運用を確立する          |
| P6-OBJ-010 | Phase 7で半自動化すべき工程と、人間判断として維持すべき工程を整理する                        |

---

## 11.5 Phase 6で解決する課題

| 課題ID       | 課題                               | Phase 6での解決内容                                   |
| ---------- | -------------------------------- | ----------------------------------------------- |
| P6-ISS-001 | MCP Toolは使えるが、どの作業でどう使うかが定まっていない | AgentごとのTool利用手順と成果物形式を定義する                     |
| P6-ISS-002 | AgentがProject固有化すると再利用性が下がる      | Agent定義とProject Contextを分離する                    |
| P6-ISS-003 | Agentごとに参照情報の範囲が曖昧である            | Required / Optional / Forbidden Contextを定義する    |
| P6-ISS-004 | AIが未決定事項を判断済みとして成果物化する恐れがある      | status確認、warning処理、禁止事項をAgent定義へ組み込む            |
| P6-ISS-005 | AIが正本へ変更を反映したように扱う恐れがある          | Review Report / Draft / Approved Sourceの状態を区別する |
| P6-ISS-006 | Agent利用結果の品質を評価できない              | Agent別検証シナリオと完了条件を定義する                          |
| P6-ISS-007 | Agentが増えると定義形式がばらつく              | Agent Definition TemplateとRegistry規約を定義する       |
| P6-ISS-008 | どこまで自動化すべきか判断できない                | 実運用結果からPhase 7の自動化対象を抽出する                       |

---

## 11.6 Phase 6の前提条件

| ID         | 前提条件                                                              |
| ---------- | ----------------------------------------------------------------- |
| P6-PRE-001 | Phase 5が `Go` または `Conditional Go` と判定されていること                     |
| P6-PRE-002 | Memory Gateway APIおよびMCP Toolでread / search / generateが利用可能であること  |
| P6-PRE-003 | Draft Toolを利用する場合、正本非変更および未承認表示が検証済みであること                         |
| P6-PRE-004 | Project Registryに `mnemosyne` および `ats` が登録されていること                |
| P6-PRE-005 | Agent Registryに少なくとも初期検証用Agentの定義が存在すること                          |
| P6-PRE-006 | Context Packが `Project × Agent × Task` に基づいて生成可能であること             |
| P6-PRE-007 | Retrieved Contextを利用した検索補完が可能であること                                |
| P6-PRE-008 | `phase-6-input-requirements.md` にMCP Tool利用結果とAgent運用課題が整理されていること |
| P6-PRE-009 | 正本write、Draft反映、ADR採用、Task確定をAgentに許可しない方針が維持されていること              |

---

## 11.7 Phase 6の対象範囲

### 11.7.1 対象に含めるもの

| 分類                | 対象内容                                                              |
| ----------------- | ----------------------------------------------------------------- |
| Agent定義標準         | Agent Definition Template、定義必須項目、命名ルール                            |
| Agent Registry拡張  | Agentの運用状態、利用Tool、成果物形式、人間レビュー条件                                  |
| Common Agent Rule | 全Agent共通の安全制約、正本境界、status取扱い                                      |
| 初期Agent定義         | Requirements Review / Implementation Review / ADR / Task Planning |
| 拡張Agent候補整理       | Docs Update / Article / Context Curation                          |
| Tool利用設計          | Agent別のMCP Tool利用可能範囲と推奨順序                                        |
| Context利用設計       | Agent別のRequired / Optional / Retrieved Context                    |
| 出力設計              | Review Report、ADR Draft、Task Proposal等の成果物形式                      |
| 人間レビュー            | Draft承認前の確認観点、正本反映条件                                              |
| Project差替検証       | 同一Agentを複数Projectへ適用する検証                                          |
| Agent差替検証         | 同一Projectへ複数Agentを適用する検証                                          |
| 運用記録              | Agent利用結果、失敗例、改善点、負荷評価                                            |
| Phase 7準備         | 半自動化対象と統制維持対象の整理                                                  |

### 11.7.2 対象に含めないもの

| 対象外               | 理由                             |
| ----------------- | ------------------------------ |
| 正本文書の自動反映         | 人間承認境界を維持するため                  |
| ADRの自動Accepted化   | 判断確定をAIへ委任しないため                |
| Taskの自動確定・完了更新    | `next-actions.md` 正本変更に該当するため  |
| Agent同士の自動連鎖実行    | 初期運用では人間が作業遷移を判断するため           |
| 自律的な長時間バックグラウンド実行 | Agent Operationの初期範囲を超えるため     |
| Notionへの自動同期      | 正本・副本同期ルール確立後に判断するため           |
| GitHub PR自動作成     | Draft運用の安定確認後に検討するため           |
| Web UIによるAgent管理  | 文書・Registry・MCP利用で運用検証後に検討するため |
| 複数利用者向けの権限モデル     | 個人利用中心の初期スコープを超えるため            |
| 自動評価モデルによる品質判定    | 人間レビューの基準確立を優先するため             |

---

## 11.8 Phase 6 Agent設計原則

### 11.8.1 Role-Based Agent原則

Agentは、Project固有の名称ではなく、専門作業の役割に基づいて定義する。

| 採用するAgent定義               | 採用しないAgent定義                      |
| ------------------------- | --------------------------------- |
| `requirements_reviewer`   | `mnemosyne_requirements_reviewer` |
| `implementation_reviewer` | `ats_implementation_reviewer`     |
| `adr_writer`              | `ats_adr_writer`                  |
| `task_planner`            | `mnemosyne_task_planner`          |
| `article_writer`          | `ats_note_article_writer`         |

### 11.8.2 Context Injection原則

AgentはProjectに関する事実や現在状況を定義内部へ固定的に保持しない。

Project固有情報は、Project Context、Retrieved ContextおよびTask Contextとして外部から与える。

```text
Agent Definition
  = 作業の型

Project Context
  = 対象の情報

Task Context
  = 今回の依頼

Retrieved Context
  = 必要に応じて検索で補う根拠
```

### 11.8.3 Tool Least Privilege原則

各Agentには、目的達成に必要なMCP Toolのみを許可する。

| Agent                       | 原則許可するTool                                             | 原則許可しないTool                 |
| --------------------------- | ------------------------------------------------------ | --------------------------- |
| Requirements Review Agent   | read / search / context generate / draft               | source write / apply        |
| Implementation Review Agent | read / search / context generate / draft               | source write / apply        |
| ADR Agent                   | read / search / context generate / ADR draft           | accept ADR / source write   |
| Task Planning Agent         | read / search / context generate / task proposal draft | update task / complete task |

### 11.8.4 Draft Before Reflection原則

Agent成果物が正本変更を伴う場合、必ずDraftとして出力し、人間レビューを経る。

| 成果物       | Agent出力状態           | 正本反映前の扱い |
| --------- | ------------------- | -------- |
| 要件修正文     | Draft               | 未反映      |
| ADR案      | Proposed Draft      | 未採用      |
| Task追加案   | Task Proposal Draft | 未確定      |
| 設計docs更新案 | Draft               | 未反映      |
| 記事草案      | Draft               | 公開前確認対象  |

### 11.8.5 Explicit Status原則

Agentは、取得した情報および生成した成果物について、以下を混同しない。

| 情報                                  | 扱い                 |
| ----------------------------------- | ------------------ |
| `fact`                              | 確認済み前提として扱える       |
| `decision` with `active / accepted` | 現在有効な判断として扱える      |
| `draft / proposed`                  | 確定事項として扱わない        |
| `superseded / deprecated`           | 現在判断の根拠として無条件に使わない |
| Agentが生成した新規案                       | 人間確認前の候補として扱う      |

### 11.8.6 Human-in-the-Loop原則

Agent運用では、次の判断を人間の責務として維持する。

* Agentを利用する作業の選択
* 重要なProject Contextの妥当性確認
* Draftの正本反映判断
* ADRの採用判断
* Taskの確定・優先順位変更・完了判断
* Agent定義やTool権限の変更
* Phase 7で自動化してよい範囲の判断

---

## 11.9 Agent Definition標準構造

### 11.9.1 Agent定義必須項目

各Agent定義文書は、最低限以下の項目を持つこと。

| 項目                          | 内容                                   |
| --------------------------- | ------------------------------------ |
| `agent_code`                | RegistryおよびTool利用で指定する一意なコード         |
| `agent_name`                | 表示名称                                 |
| `role`                      | 担当する専門的役割                            |
| `purpose`                   | Agentが達成すべき目的                        |
| `use_cases`                 | 利用対象となる代表作業                          |
| `required_context`          | 必ず参照すべきContext                       |
| `optional_context`          | 作業に応じて参照するContext                    |
| `retrieval_policy`          | 検索を使う条件と検索対象                         |
| `allowed_tools`             | 利用可能なMCP Tool                        |
| `recommended_tool_sequence` | 推奨Tool利用順序                           |
| `forbidden_actions`         | 禁止操作                                 |
| `input_requirements`        | Task Contextとして必要な入力                 |
| `output_format`             | 成果物の標準形式                             |
| `output_status`             | Review Report / Draft / Proposal等の扱い |
| `human_review_points`       | 人間確認が必要な観点                           |
| `completion_criteria`       | Agent作業の完了条件                         |
| `validation_scenarios`      | 動作検証に使用するシナリオ                        |
| `known_limitations`         | Agentの不得意領域または制約                     |

### 11.9.2 Agent定義テンプレート

````md
# {Agent Name}

## 1. Agent Information

| Item | Content |
|---|---|
| agent_code |  |
| agent_name |  |
| role |  |
| purpose |  |
| status | draft / active / deprecated |

## 2. Intended Use Cases

- 

## 3. Required Context

| Context | Purpose | Required |
|---|---|---:|
| Base Context |  | Yes |
| Project Context |  | Yes |
| Current Status |  | Yes |
| Active Decisions |  | Yes / No |
| Next Actions |  | Yes / No |
| Task Context |  | Yes |
| Retrieved Context |  | Conditional |

## 4. Allowed MCP Tools

| Tool | Usage | Required Permission |
|---|---|---|
|  |  |  |

## 5. Recommended Tool Sequence

```text
1.
2.
3.
````

## 6. Forbidden Actions

*

## 7. Input Requirements

| Input | Required | Description |
| ----- | -------: | ----------- |
|       |          |             |

## 8. Output Format

### Output Type

* Review Report / Draft / Proposal / Article Draft

### Required Sections

*

## 9. Human Review Points

*

## 10. Completion Criteria

*

## 11. Validation Scenarios

| Scenario | Project | Expected Outcome |
| -------- | ------- | ---------------- |
|          |         |                  |

## 12. Known Limitations

*

````

#### 対応成果物

```text
templates/agents/agent-definition.template.md
docs/agents/agent-definition-policy.md
````

---

## 11.10 Agent Registry拡張要件

### P6-FR-001 Agent Registry運用拡張

Phase 2で定義したAgent Registryを、実運用に必要な情報を保持できるよう拡張すること。

#### 必須管理項目

| 項目                       | 内容                          |
| ------------------------ | --------------------------- |
| `agent_code`             | Agent識別子                    |
| `agent_name`             | 表示名称                        |
| `status`                 | draft / active / deprecated |
| `definition_path`        | 詳細Agent定義文書の保存先             |
| `purpose`                | Agent目的の概要                  |
| `supported_output_types` | Review Report / ADR Draft等  |
| `required_context`       | 必須Context                   |
| `optional_context`       | 任意Context                   |
| `search_profile`         | Recall Engineで適用する検索方針      |
| `allowed_tools`          | 利用可能なMCP Tool               |
| `tool_sequence_profile`  | 推奨Tool利用順序                  |
| `write_policy`           | `draft_only` 等              |
| `human_review_required`  | 人間レビュー必須有無                  |
| `supported_projects`     | 原則 `all`。検証制限がある場合のみ指定      |
| `validation_status`      | 未検証 / 検証中 / 利用可等            |

#### 設定例

```yaml
agents:
  - agent_code: requirements_reviewer
    agent_name: Requirements Review Agent
    status: active
    definition_path: docs/agents/requirements-review-agent.md
    purpose: 要件文書間の整合性と未反映判断を確認し、修正案を作成する
    supported_output_types:
      - review_report
      - document_update_draft
    required_context:
      - base_context
      - agent_context
      - project_context
      - current_status
      - active_decisions
      - task_context
    optional_context:
      - retrieved_context
      - recent_conversation_context
      - phase_documents
    search_profile: requirements_review_search
    allowed_tools:
      - get_project_context
      - get_current_status
      - list_active_decisions
      - preview_memory_search
      - search_project_memory
      - preview_context_pack
      - build_context_pack
      - create_doc_update_draft
    write_policy: draft_only
    human_review_required: true
    supported_projects: all
    validation_status: validation_pending
```

#### 対応成果物

```text
config/agents.yaml
docs/agents/agent-registry-operation-rule.md
```

---

## 11.11 共通Agentルール要件

### P6-FR-002 Common Agent Rules定義

すべての専門Agentに共通適用する運用ルールを定義できること。

#### 必須ルール

| ルール                     | 内容                                                          |
| ----------------------- | ----------------------------------------------------------- |
| Source of Truth Rule    | 正本はMarkdown docsおよびADRであり、Context PackやTool Resultを正本としない   |
| Status Rule             | `draft / proposed / superseded / deprecated` を現在有効な判断と混同しない |
| Evidence Rule           | 重要な指摘・提案は参照元情報に基づく                                          |
| Draft Only Rule         | 正本変更が必要な成果物はDraftとして作成する                                    |
| No Silent Decision Rule | Agentが新しい判断を暗黙に確定しない                                        |
| No Silent Task Rule     | Agentが新しいTaskを暗黙に正本へ追加しない                                   |
| Project Isolation Rule  | 指定Project以外のContextを無断で混在させない                               |
| Human Review Rule       | Draft、ADR Proposal、Task Proposalは人間確認を必須とする                 |
| Warning Rule            | 根拠不足、情報競合、stale情報がある場合は明示する                                 |
| Limitation Rule         | 必要Context不足時に推測で埋めず、不足を明示する                                 |

#### 対応成果物

```text
docs/agents/common-agent-rules.md
```

---

## 11.12 初期運用Agent要件

### 11.12.1 Requirements Review Agent

#### P6-FR-003 Requirements Review Agent定義

要件定義書、Phase要件、作業計画書、設計方針およびADRの整合性を確認し、必要な修正案を作成できるAgentを定義すること。

| 項目           | 内容                                        |
| ------------ | ----------------------------------------- |
| `agent_code` | `requirements_reviewer`                   |
| Agent名       | Requirements Review Agent / 要件定義レビューAgent |
| 主目的          | 要件・Phase境界・成果物・制約・判断の整合性をレビューする           |
| 主対象Project   | Mnemosyne、将来的にはTapLog等                    |
| 主成果物         | Review Report、Requirement Revision Draft  |
| Write Policy | `draft_only`                              |

#### 必須Context

| Context           |  必須性 | 用途                   |
| ----------------- | ---: | -------------------- |
| Base Context      |   必須 | 正本境界・AI操作制限          |
| Agent Context     |   必須 | レビュー観点と出力形式          |
| Project Summary   |   必須 | プロジェクト目的の理解          |
| Current Status    |   必須 | 現在Phaseと検討状況         |
| Active Decisions  |   必須 | 採用済み方針の確認            |
| Task Context      |   必須 | 今回のレビュー対象            |
| Retrieved Context | 条件付き | 関連ADR・旧判断・review記録確認 |
| Next Actions      |   任意 | 修正後の作業接続確認           |

#### 許可Tool

| Tool                      | 利用目的                |
| ------------------------- | ------------------- |
| `get_project_context`     | 対象Projectの基本文脈取得    |
| `get_current_status`      | 現在地取得               |
| `list_active_decisions`   | 有効判断取得              |
| `search_project_memory`   | 関連要件・ADR・review記録検索 |
| `preview_context_pack`    | 作業前の参照範囲確認          |
| `build_context_pack`      | レビュー用文脈生成           |
| `create_doc_update_draft` | 修正文書案作成             |
| `get_doc_update_draft`    | Draft提示・再確認         |

#### 推奨Tool利用順序

```text
1. get_project_context
2. get_current_status
3. list_active_decisions
4. preview_context_pack
5. 必要に応じて search_project_memory
6. build_context_pack
7. Review Reportを作成
8. ユーザーが修正案を必要とする場合のみ create_doc_update_draft
9. 人間レビュー
```

#### 禁止事項

* 未決定の要件案を採用済み要件として扱わない。
* 作業計画書との不整合を無視して要件を確定しない。
* 修正案を正本へ直接反映しない。
* ADR未作成の重要判断を、既存決定として断定しない。

#### 対応成果物

```text
docs/agents/requirements-review-agent.md
```

---

### 11.12.2 Implementation Review Agent

#### P6-FR-004 Implementation Review Agent定義

設計docs、ADR、実装、テスト結果およびCurrent Statusを参照し、実装と設計判断の整合性をレビューできるAgentを定義すること。

| 項目           | 内容                                             |
| ------------ | ---------------------------------------------- |
| `agent_code` | `implementation_reviewer`                      |
| Agent名       | Implementation Review Agent / 実装レビューAgent      |
| 主目的          | 実装が設計契約・ドメインルール・安全制約に適合しているか確認する               |
| 主対象Project   | ATS、将来的にはTapLog等                               |
| 主成果物         | Implementation Review Report、Docs Update Draft |
| Write Policy | `draft_only`                                   |

#### 必須Context

| Context           |  必須性 | 用途                       |
| ----------------- | ---: | ------------------------ |
| Base Context      |   必須 | 共通禁止事項                   |
| Agent Context     |   必須 | レビュー観点                   |
| Project Summary   |   必須 | 対象システム概要                 |
| Current Status    |   必須 | 実装状況                     |
| Active Decisions  |   必須 | 設計判断                     |
| Task Context      |   必須 | 対象機能・対象ファイル              |
| Retrieved Context | 原則必須 | 関連docs、ADR、test result確認 |
| Source Files      | 条件付き | 実コードレビュー時                |
| Test Result       | 条件付き | 動作確認結果がある場合              |

#### 許可Tool

| Tool                      | 利用目的           |
| ------------------------- | -------------- |
| `get_project_context`     | Project前提取得    |
| `get_current_status`      | 現在実装状況取得       |
| `list_active_decisions`   | 有効な設計判断取得      |
| `list_next_actions`       | 現行タスクとの整合確認    |
| `preview_memory_search`   | 検索対象確認         |
| `search_project_memory`   | 関連設計・検証結果検索    |
| `preview_context_pack`    | レビュー前Context確認 |
| `build_context_pack`      | レビュー用Context生成 |
| `create_doc_update_draft` | docs更新案作成      |
| `get_doc_update_draft`    | 更新案提示          |

#### 推奨Tool利用順序

```text
1. get_project_context
2. get_current_status
3. list_active_decisions
4. preview_memory_search
5. search_project_memory
6. preview_context_pack
7. build_context_pack
8. 実装レビュー結果を作成
9. docs更新が必要な場合のみ create_doc_update_draft
10. 人間レビュー
```

#### 禁止事項

* 設計文書の根拠なしに実装を正しいと判定しない。
* test resultがない動作を確認済みとして扱わない。
* コード修正やdocs更新を自動反映しない。
* 廃止済み判断を現在の実装要件として利用しない。

#### 対応成果物

```text
docs/agents/implementation-review-agent.md
```

---

### 11.12.3 ADR Agent

#### P6-FR-005 ADR Agent定義

会話、Review Report、Decision候補および関連Contextから、重要判断をADR草案として整理できるAgentを定義すること。

| 項目           | 内容                                    |
| ------------ | ------------------------------------- |
| `agent_code` | `adr_writer`                          |
| Agent名       | ADR Agent / ADR整理Agent                |
| 主目的          | 判断候補を、背景・選択肢・採用理由・影響を含むADR Draftへ整理する |
| 主対象Project   | Mnemosyne / ATS                       |
| 主成果物         | ADR Draft                             |
| Write Policy | `draft_only`                          |
| 採用権限         | なし                                    |

#### 必須Context

| Context           |  必須性 | 用途              |
| ----------------- | ---: | --------------- |
| Project Summary   |   必須 | 判断対象のプロジェクト把握   |
| Current Status    |   必須 | 判断が必要となった背景     |
| Active Decisions  |   必須 | 既存判断との競合確認      |
| Task Context      |   必須 | 今回整理する判断候補      |
| Retrieved Context | 原則必須 | 関連ADR・過去検討・制約確認 |
| Review Report     | 条件付き | レビュー起点でADR化する場合 |

#### 許可Tool

| Tool                      | 利用目的            |
| ------------------------- | --------------- |
| `get_project_context`     | 前提取得            |
| `get_current_status`      | 判断背景取得          |
| `list_active_decisions`   | 既存判断との競合確認      |
| `search_project_memory`   | 関連判断・制約検索       |
| `build_context_pack`      | ADR整理用Context生成 |
| `create_doc_update_draft` | ADR Draft作成     |
| `get_doc_update_draft`    | Draft参照         |

#### ADR Draft必須構成

```md
# ADR-XXX: {Title}

## Status

Proposed

## Context

## Decision Candidate

## Alternatives Considered

## Rationale

## Consequences

## Related Decisions and Sources

## Human Review Required
```

#### 禁止事項

* ADRのstatusを自動で `Accepted` にしない。
* 判断が合意済みでない場合、採用済みとして表現しない。
* 既存ADRと矛盾する場合、置換関係を人間確認なしで確定しない。
* ADR Draft作成により `active-decisions.md` を自動更新しない。

#### 対応成果物

```text
docs/agents/adr-agent.md
```

---

### 11.12.4 Task Planning Agent

#### P6-FR-006 Task Planning Agent定義

Projectの現在状況、Active Decisions、課題および目的から、実行可能なNext Actionsの追加・更新案を整理できるAgentを定義すること。

| 項目           | 内容                                      |
| ------------ | --------------------------------------- |
| `agent_code` | `task_planner`                          |
| Agent名       | Task Planning Agent / タスク分解Agent        |
| 主目的          | 現在地と判断に基づき、次に実行すべき作業を成果物・完了条件付きで整理する    |
| 主対象Project   | Mnemosyne / ATS                         |
| 主成果物         | Task Proposal、Next Actions Update Draft |
| Write Policy | `draft_only`                            |

#### 必須Context

| Context           |  必須性 | 用途                      |
| ----------------- | ---: | ----------------------- |
| Project Summary   |   必須 | 目的とスコープ理解               |
| Current Status    |   必須 | 現在地とブロッカー把握             |
| Active Decisions  |   必須 | 方針に適合したタスク化             |
| Next Actions      |   必須 | 既存タスクとの重複防止             |
| Task Context      |   必須 | 今回の整理範囲                 |
| Retrieved Context | 条件付き | review結果や検証結果からタスク化する場合 |

#### 許可Tool

| Tool                      | 利用目的                             |
| ------------------------- | -------------------------------- |
| `get_project_context`     | Project把握                        |
| `get_current_status`      | 現在地取得                            |
| `list_active_decisions`   | 判断把握                             |
| `list_next_actions`       | 既存タスク把握                          |
| `search_project_memory`   | 関連issue / test result / review取得 |
| `build_context_pack`      | タスク整理用Context生成                  |
| `create_doc_update_draft` | Next Actions更新案作成                |
| `get_doc_update_draft`    | Draft参照                          |

#### Task Proposal必須項目

| 項目             | 内容                   |
| -------------- | -------------------- |
| Priority       | P0 / P1 / P2 / Later |
| Task           | 実施内容                 |
| Purpose        | なぜ行うか                |
| Input          | 作業に必要な入力             |
| Output         | 成果物                  |
| Done Condition | 完了条件                 |
| Dependencies   | 前提タスクまたは判断           |
| Source         | タスク化の根拠              |
| Status         | Proposal / Draft     |

#### 禁止事項

* Ideaを人間確認なく確定Taskへ格上げしない。
* 既存タスクとの重複を確認せずに追加案を作らない。
* Next Actions正本を自動変更しない。
* 優先順位を根拠なく変更しない。
* Task完了を自動判定しない。

#### 対応成果物

```text
docs/agents/task-planning-agent.md
```

---

## 11.13 拡張Agent候補要件

### 11.13.1 Docs Update Agent

#### P6-FR-007 Docs Update Agent候補整理

設計判断、レビュー結果または実装差分に基づき、設計docsの更新案を作成するAgentを拡張候補として整理する。

| 項目              | 内容                                                               |
| --------------- | ---------------------------------------------------------------- |
| `agent_code` 候補 | `docs_updater`                                                   |
| 主成果物            | Docs Update Draft                                                |
| 主な利用場面          | 実装レビュー後のdocs追記、Phase完了後の状態更新                                     |
| 有効化条件           | Requirements Review / Implementation Review / ADR Agentの運用が成立した後 |
| 主な懸念            | 正本更新とDraftの混同、更新対象過多                                             |

### 11.13.2 Article Agent

#### P6-FR-008 Article Agent候補整理

開発記録、判断、検証結果および記事メモを基に、発信用の草案を作成するAgentを拡張候補として整理する。

| 項目              | 内容                                 |
| --------------- | ---------------------------------- |
| `agent_code` 候補 | `article_writer`                   |
| 主成果物            | Article Draft                      |
| 主な利用場面          | 開発日記、技術記事、設計の学びの発信                 |
| 有効化条件           | `article_note` の記憶分類採否と参照ルールが確定した後 |
| 主な懸念            | 未公開情報・未確定判断の外部発信                   |

### 11.13.3 Context Curation Agent

#### P6-FR-009 Context Curation Agent候補整理

記憶文書、Context Pack利用結果、検索不足および矛盾候補を確認し、記憶構造の改善案を作るAgentを拡張候補として整理する。

| 項目              | 内容                          |
| --------------- | --------------------------- |
| `agent_code` 候補 | `context_curator`           |
| 主成果物            | Memory Improvement Proposal |
| 主な利用場面          | Context不足分析、古い情報の棚卸し候補抽出    |
| 有効化条件           | Agent運用結果が一定量蓄積された後         |
| 主な懸念            | Phase 7の自動化・統制機能との責務重複      |

---

## 11.14 Agent別Tool利用ワークフロー要件

### P6-FR-010 標準作業ワークフロー定義

Agent Operationでは、作業の品質と安全境界を揃えるため、Agent利用の標準ワークフローを定義できること。

### 11.14.1 Review系Agentの標準フロー

対象：

* Requirements Review Agent
* Implementation Review Agent

```text
1. ユーザーがProjectとレビュー対象Taskを指定する
2. AgentがProject Contextを取得する
3. AgentがCurrent StatusおよびActive Decisionsを取得する
4. Agentが必要に応じてMemory Search Previewを行う
5. Agentが関連記憶を検索する
6. AgentがContext Pack Previewを確認する
7. AgentがContext Packを生成する
8. AgentがReview Reportを作成する
9. 文書修正が必要な場合のみDoc Update Draftを作成する
10. ユーザーがReview ReportおよびDraftを確認する
11. 人間判断で正本反映または追加検討へ進む
```

### 11.14.2 ADR Agentの標準フロー

```text
1. ユーザーがADR化したい判断候補を指定する
2. AgentがProject ContextとActive Decisionsを取得する
3. Agentが関連ADRおよび制約を検索する
4. Agentが既存判断との競合・置換可能性を整理する
5. AgentがADR Draftを作成する
6. ユーザーがDecision Candidate、理由、影響を確認する
7. 人間判断によりADRを採用・修正・保留とする
8. 採用後のみ正本側へ反映する
```

### 11.14.3 Task Planning Agentの標準フロー

```text
1. ユーザーがタスク整理対象のProjectまたはテーマを指定する
2. AgentがCurrent Status、Active Decisions、Next Actionsを取得する
3. 必要に応じてReview ResultやTest Resultを検索する
4. Agentが新規Task候補、更新候補、不要候補を分類する
5. AgentがTask ProposalまたはNext Actions Update Draftを作成する
6. ユーザーが優先度・成果物・完了条件を確認する
7. 人間判断により正本へ反映する
```

---

## 11.15 Agent成果物要件

### P6-FR-011 成果物形式の標準化

Agentが生成する成果物を、目的と正本性の境界に応じて標準化できること。

### 11.15.1 Review Report

| 項目                  | 必須内容                   |
| ------------------- | ---------------------- |
| Target              | 対象Project、対象文書または対象実装  |
| Review Purpose      | 確認目的                   |
| Referenced Sources  | 参照した正本・検索結果            |
| Findings            | 確認できた事実・指摘             |
| Issues              | 齟齬・懸念・未解決事項            |
| Severity / Priority | 修正優先度                  |
| Proposed Actions    | 対応候補                   |
| Draft Required      | 正本文書修正案が必要か            |
| Warnings            | 根拠不足・情報鮮度等             |
| Review Status       | Report / Not Reflected |

### 11.15.2 ADR Draft

| 項目                 | 必須内容        |
| ------------------ | ----------- |
| Status             | `Proposed`  |
| Decision Candidate | 判断候補        |
| Context            | 背景          |
| Alternatives       | 選択肢         |
| Rationale          | 採用理由候補      |
| Consequences       | 影響          |
| Related Sources    | 根拠          |
| Review Required    | 人間判断が必要である旨 |

### 11.15.3 Task Proposal

| 項目                 | 必須内容                   |
| ------------------ | ---------------------- |
| Proposal Status    | `Draft` または `Proposed` |
| Priority Candidate | 優先度候補                  |
| Task               | 作業内容                   |
| Purpose            | 目的                     |
| Output             | 成果物                    |
| Done Condition     | 完了条件                   |
| Dependencies       | 前提                     |
| Related Sources    | 根拠                     |
| Reflection Target  | `next-actions.md` 等    |
| Review Required    | 人間確認が必要である旨            |

### 11.15.4 Article Draft

| 項目                           | 必須内容          |
| ---------------------------- | ------------- |
| Publication Status           | `Draft`       |
| Source Boundary              | 公開可能情報か確認する観点 |
| Facts Used                   | 記事内で扱う確認済み事実  |
| Decisions Used               | 記事内で扱う確定判断    |
| Unpublished / Sensitive Note | 除外確認対象        |
| Human Review Required        | 公開前確認必須       |

---

## 11.16 Agent運用上の人間レビュー要件

### P6-FR-012 Human Review Gate定義

Agentが作成した成果物について、正本反映または外部公開へ進める前に、人間が確認すべき項目を定義できること。

#### 共通レビュー項目

| 確認項目                | 内容                                               |
| ------------------- | ------------------------------------------------ |
| Source Accuracy     | 根拠となる正本文書・検索結果が妥当か                               |
| Status Accuracy     | draft / proposed / active / superseded等を誤認していないか |
| Project Scope       | 対象Project以外の情報が不適切に混在していないか                      |
| Agent Scope         | Agentの役割範囲を超えた提案をしていないか                          |
| Output Completeness | 成果物に必要項目が揃っているか                                  |
| Write Boundary      | 正本未反映であることが維持されているか                              |
| Conflicts           | 既存ADR・Decision・Taskと矛盾していないか                     |
| Reflection Need     | 正本へ反映する必要があるか                                    |
| Reflection Target   | 反映先の文書が正しいか                                      |
| Further Review      | 他Agentまたは追加検討が必要か                                |

#### 成果物別レビューGate

| 成果物                        | 正本反映・利用前の確認                  |
| -------------------------- | ---------------------------- |
| Review Report              | 指摘の根拠と優先度を確認                 |
| Requirement Revision Draft | 上位要件・Phase計画との整合を確認          |
| ADR Draft                  | Decision、理由、影響、置換関係を確認       |
| Task Proposal              | 優先度、成果物、Done Condition、重複を確認 |
| Article Draft              | 公開可否、事実性、未確定情報露出を確認          |

#### 対応成果物

```text
docs/operations/agent-output-review-checklist.md
```

---

## 11.17 Phase 6機能要件一覧

| ID        | 機能要件                          | 概要                                               |
| --------- | ----------------------------- | ------------------------------------------------ |
| P6-FR-001 | Agent Registry運用拡張            | Agentの詳細定義・Tool・成果物・検証状態を管理する                    |
| P6-FR-002 | Common Agent Rules定義          | 全Agent共通の安全・正本・statusルールを定義する                    |
| P6-FR-003 | Requirements Review Agent定義   | 要件文書レビューおよび修正Draftを作成できる                         |
| P6-FR-004 | Implementation Review Agent定義 | 実装・設計・Test Resultの整合をレビューできる                     |
| P6-FR-005 | ADR Agent定義                   | 判断候補をADR Draftへ整理できる                             |
| P6-FR-006 | Task Planning Agent定義         | Next Actions更新候補をDraft化できる                       |
| P6-FR-007 | Docs Update Agent候補整理         | 設計docs更新Agentの後続有効化条件を整理する                       |
| P6-FR-008 | Article Agent候補整理             | 発信草案Agentの後続有効化条件を整理する                           |
| P6-FR-009 | Context Curation Agent候補整理    | 記憶改善Agentの後続有効化条件を整理する                           |
| P6-FR-010 | 標準作業ワークフロー定義                  | Agent別Tool利用と人間確認の流れを定義する                        |
| P6-FR-011 | 成果物形式標準化                      | Review Report / ADR Draft / Task Proposal等を標準化する |
| P6-FR-012 | Human Review Gate定義           | 成果物確認・正本反映判断のチェック項目を定義する                         |
| P6-FR-013 | Project差替利用                   | 同一Agentを異なるProject Contextへ適用できる                 |
| P6-FR-014 | Agent差替利用                     | 同一Projectへ異なるAgentを適用し成果物を切り替えられる                |
| P6-FR-015 | Agent運用記録                     | Agent利用結果、失敗、改善点、負荷を記録できる                        |
| P6-FR-016 | Phase 7入力整理                   | 半自動化対象と統制維持対象を整理できる                              |

---

## 11.18 Project差替およびAgent差替要件

### P6-FR-013 Project差替利用

同一のAgent Definitionを、異なるProject Contextへ適用できること。

#### 検証対象例

| Agent                       | Project A | Project B  | 確認内容                |
| --------------------------- | --------- | ---------- | ------------------- |
| Requirements Review Agent   | Mnemosyne | 将来のTapLog等 | 要件レビュー手順が再利用できるか    |
| Implementation Review Agent | ATS       | 将来の別アプリ    | 実装レビューの参照要件が再利用できるか |
| ADR Agent                   | Mnemosyne | ATS        | 判断整理形式が共通利用できるか     |
| Task Planning Agent         | Mnemosyne | ATS        | タスク整理形式が共通利用できるか    |

#### Phase 6初期必須検証

初期検証では、Project MnemosyneおよびATSの双方で成立しやすい以下を必須とする。

| Agent               | MnemosyneでのTask               | ATSでのTask               |
| ------------------- | ----------------------------- | ----------------------- |
| ADR Agent           | Agent Operation方針のADR Draft作成 | 実装判断または運用判断のADR Draft作成 |
| Task Planning Agent | 次Phase準備タスク整理                 | 実装・docs更新の次アクション整理      |

### P6-FR-014 Agent差替利用

同一Projectについて、作業目的に応じて異なるAgentを利用し、必要Context・Tool利用・成果物が適切に変化すること。

#### 検証対象例

| Project   | Agent                       | 成果物                         |
| --------- | --------------------------- | --------------------------- |
| Mnemosyne | Requirements Review Agent   | Phase要件レビュー報告               |
| Mnemosyne | ADR Agent                   | Agent Operation判断のADR Draft |
| Mnemosyne | Task Planning Agent         | Phase 7準備Task Proposal      |
| ATS       | Implementation Review Agent | 実装レビュー報告                    |
| ATS       | ADR Agent                   | 設計判断ADR Draft               |
| ATS       | Task Planning Agent         | 次アクションDraft                 |

---

## 11.19 Agent運用記録要件

### P6-FR-015 Agent運用記録

Agentの実運用結果について、Agent定義の改善およびPhase 7の自動化判断に利用できる記録を残せること。

#### 記録項目

| 項目                        | 内容                      |
| ------------------------- | ----------------------- |
| Operation ID              | Agent利用識別子              |
| Date                      | 実施日                     |
| Project                   | 対象Project               |
| Agent                     | 使用Agent                 |
| Task                      | 実施した作業                  |
| Tools Used                | 使用したMCP Tool            |
| Context Used              | 利用したContext Packまたは検索情報 |
| Output                    | 作成した成果物                 |
| Human Review Result       | 採用・修正・保留・破棄             |
| Reflection Result         | 正本反映有無                  |
| Issues Found              | 運用課題                    |
| Manual Load               | 人間確認負荷                  |
| Automation Candidate      | 半自動化候補                  |
| Security / Boundary Issue | 正本境界または権限制約上の問題         |

#### 対応成果物

```text
docs/operations/agent-operation-log-format.md
docs/review/phase-6-agent-operation-summary.md
```

---

## 11.20 Phase 7入力要件整理

### P6-FR-016 Automation & Governance入力整理

Phase 6の実運用結果を基に、Phase 7で安全に半自動化できる工程と、人間判断として維持すべき工程を整理できること。

#### 半自動化候補

| 工程                                 | 半自動化候補となる理由           |
| ---------------------------------- | --------------------- |
| Conversation Summary草案作成           | 形式を固定しやすい             |
| Fact / Decision / Task / Issue候補抽出 | 人間確認前提で候補生成が可能        |
| Agent利用開始時のContext Preview         | 手順が定型化しやすい            |
| Docs Update Draft生成                | 正本非反映の範囲で支援可能         |
| 古い記憶・競合候補の検出                       | status・検索結果を用いて候補提示可能 |
| Agent Operation Log生成              | Tool利用履歴から補助生成可能      |

#### 人間判断として維持すべき工程

| 工程             | 維持理由            |
| -------------- | --------------- |
| ADRのAccepted判断 | 重要な設計決定であるため    |
| 正本文書への反映承認     | 記憶の正確性と責任に関わるため |
| Taskの確定・優先度変更  | 実施計画と負荷判断に関わるため |
| 公開記事の公開判断      | 外部発信内容の責任に関わるため |
| Agent権限変更      | 安全境界に関わるため      |
| 正本削除・置換判断      | 記憶の履歴性に関わるため    |

#### 対応成果物

```text
docs/phases/phase-7-input-requirements.md
```

---

## 11.21 Phase 6非機能要件

| ID         | 非機能要件          | 内容                                                          |
| ---------- | -------------- | ----------------------------------------------------------- |
| P6-NFR-001 | 再利用性           | Agent DefinitionをProject固有化せず、Context差替で複数Projectへ利用できること   |
| P6-NFR-002 | 役割明確性          | Agent、MCP Tool、Project Context、Task Contextおよび正本の責務を区別できること |
| P6-NFR-003 | 正本非改変性         | Agent利用により正本文書が無承認で変更されないこと                                 |
| P6-NFR-004 | Human Review維持 | Draft、ADR Proposal、Task Proposal等は人間確認を経ること                 |
| P6-NFR-005 | 根拠追跡性          | Agent成果物から参照した正本、Tool ResultおよびContextを追跡できること              |
| P6-NFR-006 | 状態識別性          | 未決定・置換済み・非推奨情報を確定事項として扱わないこと                                |
| P6-NFR-007 | Tool最小権限       | Agentが目的達成に不要なToolまたは権限を持たないこと                              |
| P6-NFR-008 | Project分離性     | 指定Project以外のContextを不適切に混在させないこと                            |
| P6-NFR-009 | 出力一貫性          | Agentごとの成果物が定義済みテンプレートに従うこと                                 |
| P6-NFR-010 | 運用品質           | 同一Agent・類似Taskにおいて、参照手順と成果物品質が大きくぶれないこと                     |
| P6-NFR-011 | 透明性            | Agentが使用したTool、参照したContext、生成したDraftの状態を利用者が確認できること         |
| P6-NFR-012 | 拡張性            | Agent追加時に記憶基盤やMCP Toolを大規模改修せず展開できること                       |
| P6-NFR-013 | 運用負荷評価性        | Agent活用により増減した人間確認負荷を記録・評価できること                             |
| P6-NFR-014 | 自動化準備性         | Phase 7で自動化可能な工程と禁止すべき自動化を判別できる情報が残ること                      |
| P6-NFR-015 | 機密配慮           | Article Agent等の外部発信用途では、未公開情報や不適切なContextを出力しない確認工程を持てること   |

---

## 11.22 Phase 6制約

| ID       | 制約                                                                   |
| -------- | -------------------------------------------------------------------- |
| P6-C-001 | AgentはRole-basedに定義し、Project専用Agentを初期設計としない                         |
| P6-C-002 | AgentはMCP Toolを介して記憶基盤を利用し、正本や索引へ直接アクセスしない                           |
| P6-C-003 | Agentに許可する成果物はReview Report、Draft、Proposal等とし、正本反映を許可しない             |
| P6-C-004 | ADR AgentはADR Draftを作成できるが、Accepted化できない                             |
| P6-C-005 | Task Planning AgentはTask Proposalを作成できるが、`next-actions.md` を直接更新できない |
| P6-C-006 | Phase 6では複数Agentの自動オーケストレーションを必須化しない                                 |
| P6-C-007 | Phase 6では正本自動更新、自動承認、自動公開を実装しない                                      |
| P6-C-008 | Phase 6ではNotion直接操作を必須Toolに含めない                                      |
| P6-C-009 | 初期運用Agentは4種類を基本とし、拡張Agentは運用検証後に有効化する                               |
| P6-C-010 | Agent Definitionの具体的なprompt実装方式は設計仕様書で確定する                           |
| P6-C-011 | Agent成果物の品質をAI単独の自己評価のみで合格判定しない                                      |
| P6-C-012 | Phase 7で自動化する場合も、人間判断として維持すべき境界をPhase 6の検証結果から明示する                   |

---

## 11.23 Phase 6成果物

### 11.23.1 必須成果物

#### A. Agent運用方針文書

| ファイル                                           | 目的                                       |
| ---------------------------------------------- | ---------------------------------------- |
| `docs/agents/agent-operation-overview.md`      | Phase 6の目的、Agent運用全体像、対象範囲を定義する          |
| `docs/agents/agent-definition-policy.md`       | Agent Definitionの標準構造、命名、状態管理を定義する       |
| `docs/agents/common-agent-rules.md`            | 全Agent共通の正本境界、禁止事項、status取扱いを定義する        |
| `docs/agents/agent-registry-operation-rule.md` | Registryと詳細定義文書の責務・更新ルールを定義する            |
| `docs/agents/agent-tool-usage-policy.md`       | MCP Tool利用範囲、推奨順序、最小権限を定義する              |
| `docs/agents/agent-output-policy.md`           | Review Report、Draft、Proposal等の成果物境界を定義する |

#### B. Agent定義テンプレート

| ファイル                                            | 目的                      |
| ----------------------------------------------- | ----------------------- |
| `templates/agents/agent-definition.template.md` | 新規Agent定義の標準テンプレート      |
| `templates/agents/review-report.template.md`    | レビュー成果物テンプレート           |
| `templates/agents/adr-draft.template.md`        | ADR Draftテンプレート         |
| `templates/agents/task-proposal.template.md`    | Task Proposalテンプレート     |
| `templates/agents/article-draft.template.md`    | 将来のArticle Agent用テンプレート |

#### C. 初期運用Agent定義

| ファイル                                         | 目的               |
| -------------------------------------------- | ---------------- |
| `docs/agents/requirements-review-agent.md`   | 要件文書レビューAgentの定義 |
| `docs/agents/implementation-review-agent.md` | 実装レビューAgentの定義   |
| `docs/agents/adr-agent.md`                   | ADR草案整理Agentの定義  |
| `docs/agents/task-planning-agent.md`         | 次アクション整理Agentの定義 |

#### D. Agent Registry拡張

| ファイル                 | 目的                                  |
| -------------------- | ----------------------------------- |
| `config/agents.yaml` | Agent運用状態、定義パス、Tool、出力形式、検証状態等を管理する |

#### E. 人間レビュー・運用記録文書

| ファイル                                                 | 目的                         |
| ---------------------------------------------------- | -------------------------- |
| `docs/operations/agent-output-review-checklist.md`   | Agent成果物の人間レビュー項目を定義する     |
| `docs/operations/agent-operation-log-format.md`      | Agent利用記録の形式を定義する          |
| `docs/operations/agent-to-memory-reflection-flow.md` | Agent成果物から正本反映判断までの流れを定義する |

#### F. 検証記録

| ファイル                                                            | 目的                               |
| --------------------------------------------------------------- | -------------------------------- |
| `docs/review/phase-6-requirements-review-agent-validation.md`   | Requirements Review Agentの検証結果   |
| `docs/review/phase-6-implementation-review-agent-validation.md` | Implementation Review Agentの検証結果 |
| `docs/review/phase-6-adr-agent-validation.md`                   | ADR Agentの検証結果                   |
| `docs/review/phase-6-task-planning-agent-validation.md`         | Task Planning Agentの検証結果         |
| `docs/review/phase-6-agent-project-switch-validation.md`        | Project Context差替検証結果            |
| `docs/review/phase-6-project-agent-switch-validation.md`        | Agent差替検証結果                      |
| `docs/review/phase-6-agent-operation-summary.md`                | Phase 6全体の運用評価・課題・次Phase入力       |

#### G. Phase 7引継ぎ文書

| ファイル                                        | 目的                                         |
| ------------------------------------------- | ------------------------------------------ |
| `docs/phases/phase-7-input-requirements.md` | Automation & Governanceに必要な自動化候補・統制条件を整理する |

### 11.23.2 拡張Agentを有効化する場合の成果物

| ファイル                                    | 有効化条件                             |
| --------------------------------------- | --------------------------------- |
| `docs/agents/docs-update-agent.md`      | 文書更新Draft運用の必要性が確認された場合           |
| `docs/agents/article-agent.md`          | `article_note` と公開前レビュー境界が定義された場合 |
| `docs/agents/context-curation-agent.md` | Context不足・記憶矛盾・棚卸し候補が蓄積された場合      |

### 11.23.3 技術設計時に追加される可能性がある成果物

| ファイルまたは構成                               | 条件                                         |
| --------------------------------------- | ------------------------------------------ |
| `docs/design/agent-operation-design.md` | Agent実行方式、prompt構成、Tool呼出方式を設計文書として独立させる場合 |
| `config/agent-workflows.yaml`           | 推奨Tool順序を設定ファイルで管理する場合                     |
| `src/agents/agentRegistry.ts`           | Agent定義を実行時に読み込む処理を実装する場合                  |
| `src/agents/agentProfileLoader.ts`      | Agent詳細定義をContextへ組み込む場合                   |
| `src/agents/agentOperationService.ts`   | Agent作業セッション管理を実装する場合                      |
| `src/agents/outputValidator.ts`         | 成果物形式を機械的に検証する場合                           |
| `src/agents/reviewGateService.ts`       | 人間レビュー状態を保持する場合                            |

---

## 11.24 Phase 6推奨ディレクトリ構成

```text
project-mnemosyne/
  config/
    agents.yaml

  docs/
    agents/
      agent-operation-overview.md
      agent-definition-policy.md
      common-agent-rules.md
      agent-registry-operation-rule.md
      agent-tool-usage-policy.md
      agent-output-policy.md

      requirements-review-agent.md
      implementation-review-agent.md
      adr-agent.md
      task-planning-agent.md

      docs-update-agent.md          # Optional
      article-agent.md              # Optional
      context-curation-agent.md     # Optional

    operations/
      agent-output-review-checklist.md
      agent-operation-log-format.md
      agent-to-memory-reflection-flow.md

    phases/
      phase-6-input-requirements.md
      phase-7-input-requirements.md

    review/
      phase-6-requirements-review-agent-validation.md
      phase-6-implementation-review-agent-validation.md
      phase-6-adr-agent-validation.md
      phase-6-task-planning-agent-validation.md
      phase-6-agent-project-switch-validation.md
      phase-6-project-agent-switch-validation.md
      phase-6-agent-operation-summary.md

  templates/
    agents/
      agent-definition.template.md
      review-report.template.md
      adr-draft.template.md
      task-proposal.template.md
      article-draft.template.md
```

---

## 11.25 Phase 6検証シナリオ

### 11.25.1 Requirements Review Agent検証

| No.      | 検証内容        | Project / Task             | 期待結果                                       |
| -------- | ----------- | -------------------------- | ------------------------------------------ |
| P6-T-001 | Phase要件レビュー | Mnemosyne / Phase文書間整合確認   | Phase間の齟齬、未反映判断、修正候補をReview Reportとして整理できる |
| P6-T-002 | 参照元確認       | Mnemosyne / 全体要件とPhase要件比較 | 根拠となるContext・ADR・検索結果を提示できる                |
| P6-T-003 | Draft作成     | Mnemosyne / 要件文書修正案        | 正本未反映のRequirement Revision Draftを作成できる     |
| P6-T-004 | 未決定事項処理     | Mnemosyne / 未確定論点を含むレビュー   | 未決定事項を採用済み要件として扱わない                        |

### 11.25.2 Implementation Review Agent検証

| No.      | 検証内容          | Project / Task                             | 期待結果                            |
| -------- | ------------- | ------------------------------------------ | ------------------------------- |
| P6-T-005 | ATS実装レビュー     | ATS / `action_select` 責務分離・transaction・冪等性 | 設計判断と実装確認観点をReview Reportへ整理できる |
| P6-T-006 | Test Result利用 | ATS / cooldown検証確認                         | 検証済み事実と未検証事項を区別できる              |
| P6-T-007 | Docs更新案       | ATS / 実装とdocsの差分                           | Docs Update Draftを正本非変更で作成できる   |
| P6-T-008 | 古い判断除外        | ATS / 置換済み仕様を含む検索                          | 現在有効な判断を優先できる                   |

### 11.25.3 ADR Agent検証

| No.      | 検証内容                | Project / Task                | 期待結果                                     |
| -------- | ------------------- | ----------------------------- | ---------------------------------------- |
| P6-T-009 | Mnemosyne ADR Draft | Mnemosyne / Agent Operation方針 | Proposed状態のADR Draftを作成できる               |
| P6-T-010 | ATS ADR Draft       | ATS / 実装判断候補                  | ATS Contextを用いて同一Agent形式でADR Draftを作成できる |
| P6-T-011 | 既存ADR競合確認           | 既存判断と類似する論点                   | 関連ADRおよび置換可能性を人間確認事項として提示できる             |
| P6-T-012 | 自動採用防止              | ADR Draft作成後                  | `Accepted` やactive decisionへ自動変更されない     |

### 11.25.4 Task Planning Agent検証

| No.      | 検証内容              | Project / Task             | 期待結果                                     |
| -------- | ----------------- | -------------------------- | ---------------------------------------- |
| P6-T-013 | Mnemosyne次アクション整理 | Mnemosyne / Phase 7準備      | Task Proposalを成果物・Done Condition付きで作成できる |
| P6-T-014 | ATS次アクション整理       | ATS / review結果からdocs更新作業整理 | ATS用Task Proposalを作成できる                  |
| P6-T-015 | 重複Task確認          | 既存Next Actionsが存在する場合      | 重複候補を指摘できる                               |
| P6-T-016 | 自動反映防止            | Task Proposal作成後           | `next-actions.md` が変更されない                |

### 11.25.5 Project差替検証

| No.      | 検証内容                   | Agent / Project                  | 期待結果                               |
| -------- | ---------------------- | -------------------------------- | ---------------------------------- |
| P6-T-017 | ADR Agent再利用           | `adr_writer` / Mnemosyne → ATS   | Agent定義を変更せずProject Contextのみ切替できる |
| P6-T-018 | Task Planning Agent再利用 | `task_planner` / Mnemosyne → ATS | 出力形式を維持しつつ内容がProjectに応じて変わる        |
| P6-T-019 | Context混在防止            | ATS指定時                           | Mnemosyne固有判断が無関係に成果物へ混入しない        |

### 11.25.6 Agent差替検証

| No.      | 検証内容              | Project / Agents                                      | 期待結果                       |
| -------- | ----------------- | ----------------------------------------------------- | -------------------------- |
| P6-T-020 | MnemosyneでAgent切替 | Mnemosyne / Requirements Review → ADR → Task Planning | Agentごとに参照範囲と成果物形式が変わる     |
| P6-T-021 | ATSでAgent切替       | ATS / Implementation Review → ADR → Task Planning     | 実装レビュー、判断整理、作業整理へ段階的に展開できる |
| P6-T-022 | Tool最小権限確認        | 各Agent                                                | 不要なToolまたは禁止Toolを利用しない     |

### 11.25.7 Human Reviewおよび安全性検証

| No.      | 検証内容                  | 期待結果                                       |
| -------- | --------------------- | ------------------------------------------ |
| P6-T-023 | Draft境界確認             | Agent成果物が正本未反映として提示される                     |
| P6-T-024 | ADR採用境界確認             | ADR AgentがAccepted判断を行わない                  |
| P6-T-025 | Task反映境界確認            | Task Planning AgentがNext Actionsを直接更新しない   |
| P6-T-026 | Source Traceability確認 | Agent成果物の根拠を確認できる                          |
| P6-T-027 | Status Warning確認      | draft / superseded / deprecated情報の利用が明示される |
| P6-T-028 | 根拠不足確認                | 必要Context不足時に断定せず不足を提示する                   |
| P6-T-029 | Agent運用ログ確認           | Tool利用、成果物、人間判断、課題を記録できる                   |

---

## 11.26 Phase 6完了条件

### 11.26.1 Definition of Done

Phase 6は、以下をすべて満たした時点で完了とする。

| No.    | 完了条件                                          | 判定観点                                        |
| ------ | --------------------------------------------- | ------------------------------------------- |
| DoD-01 | Agent Operationの目的、対象範囲および責務境界が定義されている        | AgentとTool、Context、正本の違いを説明できる              |
| DoD-02 | Agent Definition標準構造およびテンプレートが作成されている         | 新規Agentを同一形式で定義できる                          |
| DoD-03 | Common Agent Rulesが定義されている                    | すべてのAgentへ正本境界・status・Draft Onlyを適用できる      |
| DoD-04 | Agent Registryが実運用情報を保持できるよう拡張されている           | Tool、成果物、review条件、検証状態を管理できる                |
| DoD-05 | Requirements Review Agentが定義・検証されている          | Mnemosyne要件レビューで利用できる                       |
| DoD-06 | Implementation Review Agentが定義・検証されている        | ATS実装レビューで利用できる                             |
| DoD-07 | ADR Agentが定義・検証されている                          | 複数ProjectでADR Draftを作成できる                   |
| DoD-08 | Task Planning Agentが定義・検証されている                | 複数ProjectでTask Proposalを作成できる               |
| DoD-09 | Agent別Tool利用順序と最小権限が定義されている                   | 不要なTool利用を抑止できる                             |
| DoD-10 | Agent成果物形式が標準化されている                           | Review Report、ADR Draft、Task Proposalを判別できる |
| DoD-11 | Human Review Gateが定義・運用確認されている                | 正本反映前の確認を実施できる                              |
| DoD-12 | 同一AgentをMnemosyneおよびATSへ適用できることを確認している        | Project Context差替が成立する                      |
| DoD-13 | 同一Projectへ異なるAgentを適用できることを確認している             | Agent Role差替が成立する                           |
| DoD-14 | Agent成果物が正本を無承認で変更しないことを確認している                | Draft Only境界が成立する                           |
| DoD-15 | Agent Operation LogおよびPhase 6総括が作成されている       | 運用品質・負荷・課題を評価できる                            |
| DoD-16 | Phase 7で半自動化すべき工程と人間判断として維持すべき工程が整理されている      | Automation & Governanceへ進める                 |
| DoD-17 | Agent orchestration、自動承認、自動反映、自動公開へ不要に着手していない | Phase 6スコープを維持している                          |

### 11.26.2 完了判定

| 判定             | 条件                                                                        |
| -------------- | ------------------------------------------------------------------------- |
| Go             | 全DoDを満たし、複数Agentを複数Projectへ適用して、安全にReview ReportおよびDraftを作成できる            |
| Conditional Go | Agent定義またはTool利用手順に改善余地はあるが、半自動化候補と統制要件を整理できている                           |
| No Go          | AgentとProject Contextの分離、Draft Only、人間レビュー、成果物品質またはProject差替利用のいずれかが成立しない |

---

## 11.27 Phase 6からPhase 7への引継ぎ要件

| ID        | 引継ぎ事項               | 内容                                        |
| --------- | ------------------- | ----------------------------------------- |
| P6-HO-001 | Agent Definition群   | 運用実績のあるAgent役割、Context、Tool、出力形式          |
| P6-HO-002 | Common Agent Rules  | 自動化後も維持すべき正本・status・禁止事項                  |
| P6-HO-003 | Agent Operation Log | 作業頻度、失敗、手戻り、人間負荷の記録                       |
| P6-HO-004 | 半自動化候補              | Conversation Summary、分類候補抽出、Draft生成、競合検出等 |
| P6-HO-005 | 自動化禁止境界             | ADR採用、正本反映承認、Task確定、公開判断等                 |
| P6-HO-006 | Review Checklist    | 半自動生成物を人間が確認する際の基準                        |
| P6-HO-007 | Agent別品質課題          | 成果物不足、Context不足、Tool不足、warning不足          |
| P6-HO-008 | Project差替検証結果       | Agentの汎用性とProject固有差分                     |
| P6-HO-009 | Tool改善候補            | Agent運用時に不足したMCP ToolまたはResult項目          |
| P6-HO-010 | Governance要件        | 更新履歴、棚卸し、競合検出、承認記録に必要な条件                  |

---

## 11.28 Phase 6時点の未決定事項

| ID        | 論点                                      | Phase 6での扱い                       | 後続判断                       |
| --------- | --------------------------------------- | --------------------------------- | -------------------------- |
| P6-OI-001 | Agent定義をMarkdown主とするか、Registry主とするか     | 詳細はMarkdown、選択・設定はRegistryを初期案とする | 実運用後に確定                    |
| P6-OI-002 | Agent promptの具体的な保持方式                   | 定義要件のみ定める                         | 設計仕様書で判断                   |
| P6-OI-003 | Docs Update Agentを初期運用へ含めるか             | 拡張候補とする                           | 初期4Agent検証後に判断             |
| P6-OI-004 | Article Agentを有効化するか                    | `article_note` と公開レビュー境界の確定後に判断   | 後続判断                       |
| P6-OI-005 | Context Curation AgentをPhase 6内で有効化するか  | 拡張候補とする                           | 運用ログ蓄積後に判断                 |
| P6-OI-006 | Agent間の手動連携パターンを標準化するか                  | 検証結果へ記録する                         | Phase 7または後続設計で判断          |
| P6-OI-007 | Agent orchestrationを将来導入するか             | Phase 6対象外                        | 自動化効果と安全性評価後に判断            |
| P6-OI-008 | Agent成果物の品質評価を数値化するか                    | 人間レビュー記録を優先する                     | 運用量増加後に判断                  |
| P6-OI-009 | NotionをAgent成果物の運用ビューに使用するか             | 初期必須範囲外                           | 正本同期方針確定後に判断               |
| P6-OI-010 | GitHub PR作成をDraft運用に組み込むか               | Phase 6対象外                        | Automation & Governanceで判断 |
| P6-OI-011 | Agent Operation LogをMarkdownまたはDBで管理するか | Markdownを初期候補とする                  | 運用量確認後に判断                  |

---

# 12. 次分冊で定義する範囲

次分冊では、以下を定義する。

```text
Phase 7：Automation & Governance
  - 会話要約の半自動化
  - Fact / Decision / Task / Issue / Idea候補抽出
  - Agent成果物からの正本更新Draft生成
  - 人間レビューおよび承認記録
  - 古い記憶・矛盾・置換候補の検出
  - Memory Maintenance
  - Agent Operation Logを用いた運用改善
  - 自動化可能範囲と禁止範囲
  - 更新履歴・監査・統制
```

Phase 7は、Phase 6で実際に運用して安定したAgent作業フローについて、正本境界と人間承認を維持したまま、反復作業を安全に半自動化し、記憶基盤の統制と保守を強化するPhaseとする。

## 今回の設計上の整理

| 項目           | 原案                    | 今回のPhase 6要件                                                                 |
| ------------ | --------------------- | ---------------------------------------------------------------------------- |
| Agentの位置づけ   | 役割別Agentを実運用する        | **専門作業の運用契約**として定義し、Tool利用・成果物・レビュー境界まで規定                                    |
| Agent定義      | 参照範囲・禁止事項・出力形式        | Required Context、Tool Sequence、Output Status、Human Review、Validationを追加      |
| 初期Agent      | 複数候補を列挙               | Requirements Review / Implementation Review / ADR / Task Planning の4種類を初期対象化 |
| Project再利用   | Project Contextを差し替える | Project差替検証とAgent差替検証を明確化                                                    |
| MCP Toolとの関係 | 未具体化                  | Agent別のTool最小権限・推奨利用順序を定義                                                    |
| 成果物          | Agent文書               | Review Report、ADR Draft、Task Proposalおよび正本反映候補の境界を定義                         |
| 自動化          | 次Phaseに委ねる            | Phase 7へ渡す半自動化候補と自動化禁止境界を明示                                                  |

この構成により、Phase 6は「Agentをたくさん作るフェーズ」ではなく、**同じ専門的な作業の型を、異なるプロジェクトに対して再利用し、成果物を人間が安全に承認できる運用へ落とし込むフェーズ**になります。

## Conversation Memory

### fact

* JP: Project Mnemosyneは、Markdown docsおよびADRを初期正本とし、Context Pack、検索結果、API、MCP ToolおよびAgent成果物を正本とは区別して扱う外部記憶基盤として整理されている。 / EN: Project Mnemosyne treats Markdown docs and ADRs as initial sources of truth, while Context Packs, search results, APIs, MCP tools, and agent outputs are kept separate from source documents.
* JP: Phase 1では記憶構造と運用、Phase 2ではContext Pack生成、Phase 3では検索補完、Phase 4ではMemory Gateway API、Phase 5ではMCP Tool接続の要件を作成した。 / EN: Requirements have been created for Phase 1 memory structure and operation, Phase 2 Context Pack generation, Phase 3 retrieval, Phase 4 Memory Gateway API, and Phase 5 MCP tool connectivity.
* JP: 原案のPhase 6は、Agentごとの定義、参照範囲、禁止事項、出力形式を定義し、Project Contextを差し替えて再利用できる状態を目指すフェーズであった。 / EN: The original Phase 6 defined role-based agents, their reference scope, prohibited actions, output formats, and reuse through swapped project contexts.
* JP: 本回答では、Phase 6：Agent Operationの要件定義本文を、Phase別要件定義書へ追記可能な形式で作成した。 / EN: This response created the Phase 6: Agent Operation requirements section in a form that can be appended to the phase requirements document.

### decision

* JP: Phase 6におけるAgentは、自律実行プログラムではなく、役割・Context・Tool・成果物・禁止事項・人間レビューを定義する専門作業の運用契約として扱う。 / EN: In Phase 6, an agent is treated as an operating contract for specialist work, defining role, context, tools, outputs, prohibited actions, and human review, rather than as an autonomous program.
* JP: 初期運用Agentは、Requirements Review Agent、Implementation Review Agent、ADR Agent、Task Planning Agentの4種類を基本とする。 / EN: The initial operational agents are Requirements Review, Implementation Review, ADR, and Task Planning agents.
* JP: Agent成果物はReview Report、DraftまたはProposalとして扱い、正本文書への自動反映を許可しない。 / EN: Agent outputs are treated as review reports, drafts, or proposals, and automatic reflection into source documents is not allowed.
* JP: 同一AgentをMnemosyneとATSへ適用するProject差替検証、および同一Projectへ複数Agentを適用するAgent差替検証をPhase 6の完了条件へ含めた。 / EN: Phase 6 completion includes testing the same agent across Mnemosyne and ATS and testing multiple agents on the same project.

### task

* JP: 次分冊として、Phase 7：Automation & Governanceの要件定義を作成する。 / EN: Create the next section defining Phase 7: Automation & Governance.
* JP: 後続の設計仕様書で、Agent promptの保持方式、Agent RegistryとMarkdown定義の責務境界、Agent成果物の実装上の保存方式を具体化する。 / EN: Later design specifications must determine how agent prompts are stored, how registry and Markdown definitions share responsibilities, and how agent outputs are stored in implementation.

### preference

* JP: Agentを増やすこと自体ではなく、専門作業の型を複数Projectへ再利用し、人間が成果物を安全に確認・承認できる運用を優先する。 / EN: The priority is not increasing the number of agents, but reusing specialist work patterns across projects with safe human review and approval.
* JP: Agent運用の初期段階では、自動連携よりもAgentごとの成果物品質・Tool利用境界・人間レビュー負荷を確認する進め方を重視する。 / EN: Initial agent operation prioritizes output quality, tool boundaries, and human review load over automatic agent chaining.

### constraint

* JP: Phase 6では、正本自動反映、ADR自動採用、Task自動確定、Agent orchestration、自動公開、Notion直接操作、GitHub PR自動作成を必須範囲に含めない。 / EN: Phase 6 excludes automatic source reflection, automatic ADR acceptance, automatic task confirmation, agent orchestration, automatic publication, direct Notion operations, and automatic GitHub pull request creation.
* JP: AgentはMCP Toolを介して記憶基盤を利用し、正本文書や検索索引へ直接アクセスしない。 / EN: Agents use the memory base through MCP tools and do not directly access source documents or search indexes.
* JP: Agentが作成したADR案、Task案、文書更新案は、人間レビュー前には正本または確定判断として扱わない。 / EN: ADR proposals, task proposals, and document update drafts created by agents are not treated as sources of truth or final decisions before human review.

### issue

* JP: Agent定義をMarkdown主とするかRegistry主とするか、promptをどの形式で保持するか、Agent成果物ログをMarkdownまたはDBで管理するかは未確定である。 / EN: It remains undecided whether agent definitions are primarily Markdown or registry-based, how prompts are stored, and whether agent operation logs use Markdown or a database.
* JP: Docs Update Agent、Article Agent、Context Curation Agentをいつ有効化するかは、初期4Agentの運用検証後に判断する必要がある。 / EN: When to enable Docs Update, Article, and Context Curation agents must be decided after validating the initial four agents.
* JP: 将来的なAgent orchestration導入可否は、Phase 6で確認する運用効果と安全性に基づいて判断する必要がある。 / EN: Future adoption of agent orchestration must be judged from the operational benefits and safety observed in Phase 6.

### idea

* JP: Requirements Review、Implementation Review、ADR、Task Planningの順に運用を検証すると、レビュー結果から判断草案、次アクション草案へ展開する流れを人間確認下で評価できる。 / EN: Validating Requirements Review, Implementation Review, ADR, and Task Planning agents can evaluate a human-controlled flow from review findings to decision drafts and next-action drafts.
* JP: Phase 6のAgent Operation Logを基に、Phase 7では繰り返し作業のみを半自動化し、判断確定と正本反映を人間に残す設計が可能になる。 / EN: Based on Phase 6 agent operation logs, Phase 7 can automate only repetitive work while retaining final decisions and source reflection for humans.

### article_note

* JP: 汎用専門Agentを作る本質は、AIに自律権限を与えることではなく、役割・根拠・利用Tool・成果物・承認境界を定義し、同じ専門作業を異なるプロジェクトへ再利用できる形にすることである。 / EN: The core of reusable specialist agents is not granting autonomy, but defining role, evidence, tools, outputs, and approval boundaries so the same specialist work can be reused across projects.

### conversation_summary

* JP: 本チャットでは、Phase 1作業計画書を基準に全体要件定義書を再構成し、Phase別要件を段階的に作成している。Phase 1では記憶の正本構造、Phase 2ではContext Pack生成、Phase 3では検索補完、Phase 4ではAPI Gateway、Phase 5ではMCP Tool接続を定義した。今回、Phase 6を、役割別AgentがMCP ToolとProject Contextを用いてReview ReportやDraftを安全に作成し、複数Projectへ再利用できる運用フェーズとして定義した。 / EN: This chat rebuilt the overall requirements from the Phase 1 plan and is defining each phase step by step. Phase 1 covers source-of-truth memory, Phase 2 Context Pack generation, Phase 3 retrieval, Phase 4 the API gateway, and Phase 5 MCP connectivity. This response defines Phase 6 as the operational phase where role-based agents use MCP tools and project context to safely produce review reports and drafts reusable across projects.

### test_result

* JP: Phase 6要件定義では、原案の役割別AgentおよびProject Context差替の構想を維持しつつ、Agentを運用契約として定義し、初期4Agent、Tool最小権限、成果物境界、人間レビュー、Project/Agent差替検証、Phase 7自動化入力を具体化できた。 / EN: The Phase 6 requirements preserve the original role-based agent and project-context-swapping concept while defining agents as operating contracts and specifying four initial agents, least-privilege tools, output boundaries, human review, project/agent switching tests, and Phase 7 automation inputs.
