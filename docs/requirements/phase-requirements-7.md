前回の `# 12. 次分冊で定義する範囲` は、正式文書へ統合する際に以下の **`# 12. Phase 7：Automation & Governance`** へ置き換えてください。

Phase 7では、Phase 6で実運用したAgent作業のうち、**会話要約、記憶候補抽出、更新Draft作成、古い情報・矛盾候補の検出、運用記録の集約**を半自動化対象とします。一方、**ADR採用、正本反映、Task確定、外部公開、権限変更、記憶削除**は人間判断として維持します。

# 12. Phase 7：Automation & Governance

## 副題：記憶運用を安全に半自動化する

---

## 12.1 Phase概要

| 項目          | 内容                                                                                                  |
| ----------- | --------------------------------------------------------------------------------------------------- |
| Phase       | Phase 7                                                                                             |
| 名称          | Automation & Governance                                                                             |
| 副題          | 記憶運用を安全に半自動化する                                                                                      |
| 主目的         | Phase 6で運用実績を得たAgent作業および記憶管理作業について、正本境界と人間承認を維持したまま、反復的な整理・検出・Draft作成を半自動化し、記憶基盤の統制と保守を確立する        |
| 実装レベル       | Automation Rule、Governance Policy、Maintenance Workflow、Review Queue、Audit / Approval Record         |
| 主入力         | Phase 1〜6の正本文書・Context・検索・API・MCP Tool・Agent Operation Log・Phase 7入力要件                              |
| 主出力         | 半自動記憶化機能、Memory Maintenance機能、Governance記録、運用レビュー結果                                                 |
| 初期対象Project | Project Mnemosyne / ATS                                                                             |
| 主な自動化対象     | Conversation Summary Draft、Memory Candidate抽出、Update Draft作成、Conflict / Staleness検出、Operation Log集約 |
| 自動化しない対象    | 正本反映、ADR採用、Task確定、公開判断、権限変更、正本削除                                                                    |
| Phase完了後の接続 | 全Phase整合レビュー、設計仕様書化、実装ロードマップ確定、必要に応じた追加Phase判断                                                      |

---

## 12.2 Phase 7の位置づけ

Phase 1では、記憶の正本構造、分類、状態管理、更新ルールおよびAI操作境界を定義した。

Phase 2では、`Project × Agent × Task` に基づくContext Packを生成できるようにした。

Phase 3では、必要な関連記憶を検索し、Retrieved ContextとしてContext Packを補完できるようにした。

Phase 4では、Context取得、検索、Context生成およびDraft作成をMemory Gateway APIとして提供できるようにした。

Phase 5では、AIクライアントがMCP Toolを介してMemory Gatewayを利用できるようにした。

Phase 6では、役割別AgentがContextとToolを利用し、Review Report、ADR Draft、Task Proposal等を安全に作成できる運用を定義した。

Phase 7では、Phase 6の運用結果を基に、繰り返し発生する整理・検出・Draft作成作業を半自動化し、記憶基盤が長期運用で劣化しないためのGovernanceを確立する。

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
役割別Agentが実作業で安全に成果物を作る

Phase 7：
繰り返し作業を半自動化し、
正本・承認・履歴・鮮度を統制する
```

---

## 12.3 Phase 7の重要な設計整理

### 12.3.1 Automationは「自動確定」ではなく「自動整理・自動検出・自動Draft作成」とする

Phase 7におけるAutomationは、AIまたはシステムが正本文書を自律的に更新し続けることを意味しない。

初期のAutomation対象は、以下に限定する。

| 自動化対象                  | 内容                                             | 出力状態            |
| ---------------------- | ---------------------------------------------- | --------------- |
| Conversation Summary生成 | 会話内容を再利用可能な要約形式へ整理する                           | Draft           |
| Memory Candidate抽出     | Fact / Decision / Task / Issue / Idea等の候補を抽出する | Candidate       |
| Update Draft作成         | 正本文書への反映案を作成する                                 | Draft           |
| Conflict検出             | 既存判断との矛盾候補を検出する                                | Review Required |
| Staleness検出            | 古い情報・更新遅延・置換漏れ候補を検出する                          | Review Required |
| Duplicate検出            | 重複Task、重複Decision、重複Issue候補を検出する               | Review Required |
| Operation Log集約        | Agent利用結果と人間判断結果を集計する                          | Report          |
| Maintenance Report生成   | 棚卸し対象と改善案を整理する                                 | Report / Draft  |

以下は、Phase 7においても自動化しない。

| 自動化しない対象              | 理由              |
| --------------------- | --------------- |
| 正本文書への反映              | 記憶の正確性と責任に関わるため |
| ADRのAccepted判断        | 重要判断の確定であるため    |
| Taskの正式追加・優先順位変更・完了判定 | 実施計画の責任に関わるため   |
| 記憶の削除・置換確定            | 履歴と参照可能性に関わるため  |
| Articleの公開            | 外部発信責任に関わるため    |
| Agent権限変更             | 安全境界に関わるため      |
| MCP Tool追加・権限拡張       | 外部接続の安全性に関わるため  |

### 12.3.2 GovernanceはAutomationの制約ではなく成立条件とする

Automationを導入すると、処理量は減る一方で、以下のリスクが増える。

* AIが誤った分類候補を大量に生成する
* Draftが正本と誤認される
* 古い判断が検索やContextへ残り続ける
* Task候補が増加し、実際の優先順位が不明になる
* Agent成果物が反映済みか未反映か判断できなくなる
* 自動処理の理由や根拠を後から追えなくなる

そのため、Phase 7ではAutomation機能と同時に以下を整備する。

| Governance要素        | 目的                                             |
| ------------------- | ---------------------------------------------- |
| Review Queue        | 人間確認が必要な候補を集約する                                |
| Approval Record     | 採用・却下・保留・反映済みを記録する                             |
| Source Traceability | 候補生成の根拠を追跡できるようにする                             |
| Status Lifecycle    | Candidate / Draft / Approved / Reflected等を区別する |
| Maintenance Cycle   | 古い情報や矛盾候補を定期的に確認する                             |
| Audit Record        | 自動処理と人間判断の経緯を追跡する                              |
| Automation Boundary | 自動化可能操作と禁止操作を固定する                              |

### 12.3.3 正本反映前の成果物状態を明確化する

Phase 7では、候補・Draft・承認・反映済みの状態を明確に区別する。

| 状態                | 意味                     |      正本性 |
| ----------------- | ---------------------- | -------: |
| `candidate`       | AIまたはシステムが抽出した記憶候補     |       なし |
| `draft`           | 正本反映案として整理された草案        |       なし |
| `review_required` | 人間確認待ち                 |       なし |
| `approved`        | 人間が内容を採用すると判断した状態      | まだ正本ではない |
| `rejected`        | 採用しないと判断した状態           |       なし |
| `deferred`        | 判断を保留した状態              |       なし |
| `reflected`       | 正本文書へ反映済みであることが確認された状態 |   正本側に存在 |
| `superseded`      | 後続の判断・Draftに置換された状態    |     履歴のみ |

```text
重要：
approved は「反映してよい」と判断された状態であり、
reflected になるまで正本へ反映済みとは扱わない。
```

### 12.3.4 Phase 7は完全自律Agent化のフェーズではない

Phase 7では、Agent Operationの繰り返し部分を効率化するが、Agentが自律的に作業を選び、判断し、正本へ反映し、次タスクを自動実行する構成は採用しない。

```text
採用する運用：
人間が対象Projectまたは確認対象を指定
  ↓
システムが候補抽出・Draft生成・警告検出
  ↓
人間がレビュー
  ↓
必要に応じて人間が正本へ反映

採用しない運用：
Agentが自動的に会話を監視
  ↓
判断を確定
  ↓
正本を更新
  ↓
次のAgentを起動
  ↓
外部公開まで実行
```

---

## 12.4 Phase 7の目的

### 12.4.1 主目的

```text
Phase 6で確認された反復的なAgent作業および記憶管理作業について、
正本境界、人間承認、根拠追跡および状態管理を維持したまま、
候補抽出・Draft生成・矛盾検出・棚卸し支援を半自動化し、
長期運用可能なAI外部記憶基盤のGovernanceを確立する。
```

### 12.4.2 具体目的

| ID         | 目的                                                                                |
| ---------- | --------------------------------------------------------------------------------- |
| P7-OBJ-001 | Automation対象と自動化禁止対象の境界を明文化する                                                     |
| P7-OBJ-002 | 会話またはAgent成果物からConversation Summary Draftを生成できるようにする                              |
| P7-OBJ-003 | Fact / Decision / Task / Issue / Idea / Constraint / Test Result等の記憶候補を抽出できるようにする |
| P7-OBJ-004 | 記憶候補から正本文書更新Draftを作成できるようにする                                                      |
| P7-OBJ-005 | Draft、Approval、Reflectionの状態遷移を管理できるようにする                                         |
| P7-OBJ-006 | 古い情報、矛盾候補、重複Task、置換漏れ等を検出できるようにする                                                 |
| P7-OBJ-007 | Review Queueにより人間確認対象を整理できるようにする                                                  |
| P7-OBJ-008 | Agent Operation Logを集計し、運用効果・負荷・問題点を評価できるようにする                                    |
| P7-OBJ-009 | MnemosyneおよびATSで、半自動化しても正本境界と情報鮮度が維持されることを検証する                                    |
| P7-OBJ-010 | 全Phaseの成果物を統合レビューし、設計仕様書化および実装計画へ移行できる状態を作る                                       |

---

## 12.5 Phase 7で解決する課題

| 課題ID       | 課題                                 | Phase 7での解決内容                                          |
| ---------- | ---------------------------------- | ------------------------------------------------------ |
| P7-ISS-001 | 会話やAgent成果物から毎回手作業で記憶候補を整理する負担が大きい | Conversation Summary DraftおよびMemory Candidate抽出を半自動化する |
| P7-ISS-002 | Draftが増加すると、未確認・採用済み・反映済みの区別が難しい   | Review QueueおよびLifecycle管理を導入する                        |
| P7-ISS-003 | 正本文書に古い判断や未反映事項が残る                 | Staleness / Conflict / Reflection Gap検出を行う             |
| P7-ISS-004 | Task候補が増えると優先順位や重複が不明になる           | Task Proposalの重複・競合候補を検出する                             |
| P7-ISS-005 | Agent運用の効果や人間負荷が評価できない             | Operation Logを集計し、改善判断に利用する                            |
| P7-ISS-006 | 自動化が進むと正本責任が曖昧になる                  | Automation BoundaryとApproval Recordを定義する               |
| P7-ISS-007 | 正本反映漏れにより、AIが古いContextを参照する恐れがある   | Approved未反映候補とSource更新状況を照合する                          |
| P7-ISS-008 | 長期運用で記憶量が増え、検索品質が劣化する恐れがある         | Memory Maintenance Reportにより棚卸し候補を提示する                 |
| P7-ISS-009 | Phase要件が増加し、全体として整合しているか確認が必要になる   | Phase 1〜7の統合レビューを実施する                                  |

---

## 12.6 Phase 7の前提条件

| ID         | 前提条件                                                          |
| ---------- | ------------------------------------------------------------- |
| P7-PRE-001 | Phase 6が `Go` または `Conditional Go` と判定されていること                 |
| P7-PRE-002 | 初期運用Agentの少なくとも一部について、実運用検証記録が存在すること                          |
| P7-PRE-003 | Agent成果物がReview Report、Draft、Proposalとして区別されていること             |
| P7-PRE-004 | MCP ToolまたはMemory Gateway APIにより、Context取得・検索・Draft作成が可能であること |
| P7-PRE-005 | 正本文書、ADR、Next Actionsに対する無承認writeが禁止されていること                   |
| P7-PRE-006 | Agent Operation Logに、人間レビュー結果または運用課題を記録できること                  |
| P7-PRE-007 | `phase-7-input-requirements.md` に半自動化候補と自動化禁止境界が整理されていること     |
| P7-PRE-008 | Memory Taxonomyおよびstatus管理方針が、Automation処理にも適用可能であること         |
| P7-PRE-009 | MnemosyneおよびATSの正本文書が検証対象として利用可能であること                         |

---

## 12.7 Phase 7の対象範囲

### 12.7.1 対象に含めるもの

| 分類                          | 対象内容                                 |
| --------------------------- | ------------------------------------ |
| Automation Policy           | 自動化対象・禁止対象・段階導入方針                    |
| Conversation Summary Draft  | 会話または作業結果の要約草案作成                     |
| Memory Candidate Extraction | Fact / Decision / Task / Issue等の候補抽出 |
| Update Draft Generation     | 正本文書への反映案作成                          |
| Review Queue                | 人間確認待ち候補の一覧管理                        |
| Approval Record             | 採用・却下・保留・反映確認の記録                     |
| Reflection Gap Detection    | 承認済みだが正本へ未反映の候補検出                    |
| Conflict Detection          | 判断・制約・Task等の矛盾候補検出                   |
| Staleness Detection         | 古い情報・更新遅延・索引不整合候補検出                  |
| Duplicate Detection         | 重複Task、重複Decision、重複Issue候補検出        |
| Memory Maintenance          | 定期棚卸し、アーカイブ候補、改善案整理                  |
| Agent Operation Analytics   | Agent利用実績、採用率、負荷、失敗理由の集計             |
| Governance Review           | 正本境界、Tool権限、Automation範囲の継続確認        |
| Phase統合レビュー                 | Phase 1〜7の要件・成果物・責務境界の整合確認           |
| 次工程整理                       | 設計仕様書、実装ロードマップ、追加Phase要否の整理          |

### 12.7.2 対象に含めないもの

| 対象外                     | 理由                   |
| ----------------------- | -------------------- |
| 正本文書への自動反映              | 人間承認および責任境界を維持するため   |
| ADRの自動Accepted化         | 重要判断の確定をAIへ委任しないため   |
| Taskの自動追加・自動完了・自動優先順位変更 | 実施計画判断を人間に残すため       |
| 記憶の自動削除                 | 履歴保持と誤削除防止のため        |
| 記事・SNS・外部媒体への自動公開       | 外部発信責任に関わるため         |
| Agent権限の自動拡張            | 安全境界に関わるため           |
| MCP Toolの自動追加・有効化       | 外部接続権限に関わるため         |
| 複数Agentによる完全自律ワークフロー    | 初期Governance範囲を超えるため |
| Notion正本化または双方向自動同期     | 正本境界の再判断が必要なため       |
| 多人数承認ワークフロー             | 個人利用中心の初期スコープを超えるため  |

---

## 12.8 Phase 7 Automation Level定義

### 12.8.1 Automation Level

Phase 7では、自動化の範囲を以下のLevelで管理する。

| Level | 名称                                | 内容                                             | Phase 7での扱い       |
| ----- | --------------------------------- | ---------------------------------------------- | ----------------- |
| L0    | Manual                            | 人間がすべて手作業で整理・判断・反映する                           | 既存運用として継続可能       |
| L1    | Assistive Drafting                | AIが要約、分類候補、Draftを作成し、人間が判断する                   | 必須対象              |
| L2    | Controlled Detection              | AIまたはシステムが矛盾、古さ、重複、未反映候補を検出し、Review Queueへ提示する | 必須対象              |
| L3    | Approved Reflection Support       | 人間が承認した内容について、反映手順または差分を準備する                   | 任意候補。正本反映自体は人間が行う |
| L4    | Autonomous Reflection             | AIが正本へ自動反映する                                   | Phase 7対象外・禁止     |
| L5    | Autonomous Decision and Execution | AIが判断確定・タスク実行・公開まで自律実施する                       | 対象外・禁止            |

### 12.8.2 Phase 7で許可する自動化範囲

```text
必須範囲：
L1 Assistive Drafting
L2 Controlled Detection

任意検討：
L3 Approved Reflection Support
  ※差分や反映手順の準備まで。
    正本反映操作そのものは人間が行う。

対象外：
L4 Autonomous Reflection
L5 Autonomous Decision and Execution
```

---

## 12.9 Phase 7 Governance原則

### 12.9.1 Source of Truth Preservation原則

Automation処理は、正本文書およびADRを直接変更しない。

| 対象                         | Governance上の扱い |
| -------------------------- | -------------- |
| Markdown docs              | 正本             |
| ADR                        | 重要判断の正本        |
| Conversation Summary Draft | 正本反映候補         |
| Memory Candidate           | 候補情報           |
| Doc Update Draft           | 正本更新案          |
| Approval Record            | 人間判断の記録        |
| Review Queue               | 確認待ち候補の管理情報    |
| Maintenance Report         | 改善候補の報告        |
| Automation Log             | 自動処理の記録        |
| Context Pack / Tool Result | AI入力・参照結果の生成物  |

### 12.9.2 Explicit Approval原則

正本反映に関係する候補について、採用・却下・保留・反映済みを明示的に管理する。

| 判断                | 意味                     |
| ----------------- | ---------------------- |
| Approve           | 内容を採用する判断。まだ正本反映済みではない |
| Reject            | 採用しない判断                |
| Defer             | 現時点では判断しない             |
| Reflect Confirmed | 正本文書へ反映されたことを人間が確認     |
| Supersede         | 後続候補または新判断に置換された       |

### 12.9.3 Evidence Required原則

Automationが生成する候補・Draft・警告には、可能な限り根拠情報を紐付ける。

| 出力                 | 必須となる根拠                               |
| ------------------ | ------------------------------------- |
| Fact Candidate     | 元会話、元文書または検証結果                        |
| Decision Candidate | 発言、Review Report、関連ADRまたは判断根拠         |
| Task Candidate     | Issue、Decision、Review Resultまたはユーザー指示 |
| Conflict Warning   | 競合する複数source                          |
| Staleness Warning  | 更新日時、statusまたは置換関係                    |
| Update Draft       | 変更対象sourceと変更理由                       |

### 12.9.4 No Silent Mutation原則

自動処理によって、以下が暗黙に変化してはならない。

* 正本文書本文
* ADR Status
* Task Status
* Task Priority
* Agent権限
* Tool有効化状態
* 公開状態
* 記憶の削除状態

### 12.9.5 Periodic Maintenance原則

記憶基盤は、作成時だけでなく継続利用時に劣化する可能性があるため、棚卸しの仕組みを持つ。

棚卸し対象には以下を含む。

* 長期間更新されていないCurrent Status
* 完了済みだが残存しているNext Actions候補
* Accepted済みADRと不整合なActive Decisions
* Approvedだが未反映のDraft
* 重複するIssueまたはTask
* `superseded` 化すべき古い判断
* 利用されていないAgent定義
* 不要または肥大化したContext参照範囲
* 検索結果へ頻繁に現れるstale情報

---

## 12.10 Phase 7機能要件

### P7-FR-001 Automation Boundary定義

Automationで許可する処理、禁止する処理、段階的に有効化する処理を文書として定義できること。

#### 必須定義項目

| 項目                        | 内容                     |
| ------------------------- | ---------------------- |
| Automation Level          | L0〜L5の定義               |
| Allowed Automation        | Phase 7で許可する自動処理       |
| Prohibited Automation     | 自動化しない処理               |
| Activation Condition      | 処理を有効化するための条件          |
| Human Review Requirement  | 人間確認が必要となる時点           |
| Rollback / Disable Policy | 問題が発生した場合に自動処理を停止できる方針 |
| Source Write Boundary     | 正本writeを許可しない方針        |

#### 対応成果物

```text
docs/governance/automation-boundary-policy.md
```

---

### P7-FR-002 Conversation Summary Draft生成

会話ログ、Agent作業結果またはユーザーが指定した検討内容から、記憶候補抽出の入力となるConversation Summary Draftを生成できること。

#### 入力対象

| 入力                       | 扱い                 |
| ------------------------ | ------------------ |
| AIとの会話ログ                 | ユーザーが対象として指定した範囲のみ |
| Agent Review Report      | 正本反映候補整理の入力        |
| ADR Draft作成過程            | 判断候補整理の入力          |
| Task Proposal作成過程        | タスク候補整理の入力         |
| Test / Validation Result | 検証事実整理の入力          |

#### Conversation Summary Draft必須構成

```md
# Conversation Summary Draft

## Metadata

| Item | Content |
|---|---|
| project_code |  |
| source_type | conversation / agent_output / validation_result |
| source_reference |  |
| generated_at |  |
| status | draft |
| generated_by | automation / agent / user_assisted |

## Summary

- 

## Fact Candidates

- 

## Decision Candidates

- 

## Task Candidates

- 

## Issue Candidates

- 

## Idea Candidates

- 

## Constraint Candidates

- 

## Test Result Candidates

- 

## Potential Reflection Targets

| Candidate Type | Target Document | Reason |
|---|---|---|

## Human Review Required

- 
```

#### 制約

* Summary生成だけで正本反映済みとしない。
* 元会話内で未決定の内容をDecisionとして確定表示しない。
* 根拠となるsource referenceを保持する。
* 個人情報または不要な会話内容を無制限に保存対象としない。

#### 対応成果物

```text
templates/governance/conversation-summary-draft.template.md
docs/governance/conversation-summary-automation-rule.md
```

---

### P7-FR-003 Memory Candidate抽出

Conversation Summary Draft、Agent成果物または検証結果から、正本反映候補となる情報を分類付きで抽出できること。

#### 必須抽出分類

| candidate_type         | 内容            |
| ---------------------- | ------------- |
| `fact`                 | 確認済み事実候補      |
| `decision`             | 採用判断または判断候補   |
| `task`                 | 実施すべき作業候補     |
| `issue`                | 未解決課題候補       |
| `idea`                 | 未採用案候補        |
| `constraint`           | 守るべき制約候補      |
| `test_result`          | 検証結果候補        |
| `conversation_summary` | 会話記憶として残す要約候補 |

#### 拡張抽出候補

| candidate_type | 条件                              |
| -------------- | ------------------------------- |
| `preference`   | `memory-taxonomy.md` で正式採用された場合 |
| `article_note` | 外部発信への利用境界が確定した場合               |

#### Candidate必須情報

| 項目                 | 内容             |
| ------------------ | -------------- |
| `candidate_id`     | 候補識別子          |
| `project_code`     | 対象Project      |
| `candidate_type`   | 分類             |
| `candidate_text`   | 候補内容           |
| `source_reference` | 根拠             |
| `confidence_note`  | 判断根拠または不確実性の説明 |
| `suggested_target` | 反映先候補          |
| `candidate_status` | `candidate`    |
| `review_required`  | 必ずtrue         |
| `warnings`         | 競合・未確定・根拠不足等   |

#### 制約

* 自動抽出結果を正本のFact、Decision、Task等として直接扱わない。
* Decision Candidateについて、合意・採用が不明な場合は `proposed` 相当として扱う。
* Task Candidateについて、実施合意が不明な場合はTask Proposalとして扱う。
* Candidateの反映先が特定できない場合は、無理に割り当てずReview Queueへ送る。

#### 対応成果物

```text
docs/governance/memory-candidate-extraction-rule.md
templates/governance/memory-candidate.template.md
```

---

### P7-FR-004 Reflection Target推定

抽出したMemory Candidateについて、反映先となる正本文書候補を提示できること。

#### 反映先候補ルール

| Candidate Type         | 主な反映先候補                                           |
| ---------------------- | ------------------------------------------------- |
| `fact`                 | `current-status.md`、`project-summary.md`、関連設計docs |
| `decision`             | ADR Draft、`active-decisions.md` 更新Draft           |
| `task`                 | `next-actions.md` 更新Draft                         |
| `issue`                | `current-status.md`、`next-actions.md`、issue管理用文書  |
| `idea`                 | `current-status.md` の検討事項、将来のidea文書               |
| `constraint`           | `memory-policy.md`、Agent定義、設計docs、ADR             |
| `test_result`          | review文書、test result文書、`current-status.md`        |
| `conversation_summary` | 承認済み会話要約保存領域                                      |

#### 出力要件

* 反映先候補を一つ以上提示できること。
* 反映先を確定ではなく提案として示すこと。
* 複数候補がある場合は、その理由を説明できること。
* 既存正本との競合可能性がある場合はwarningを付与すること。

---

### P7-FR-005 Doc Update Draft自動作成支援

レビュー対象となったMemory Candidateから、正本文書への反映案をDoc Update Draftとして生成できること。

#### Draft対象例

| Candidate      | Draft対象                       |
| -------------- | ----------------------------- |
| 新たに確定した目的または前提 | `project-summary.md` 更新Draft  |
| 現在進行中の事項または課題  | `current-status.md` 更新Draft   |
| 採用候補となる判断      | ADR Draft                     |
| 採用済み判断の一覧反映    | `active-decisions.md` 更新Draft |
| 次に行う作業候補       | `next-actions.md` 更新Draft     |
| Agent運用上の制約    | Agent定義またはCommon Rule更新Draft  |
| 検証結果           | review / validation文書更新Draft  |

#### 必須要件

| 要件                 | 内容                                |
| ------------------ | --------------------------------- |
| Target Source      | 更新対象正本文書または新規文書候補を指定する            |
| Change Reason      | なぜ更新が必要かを記載する                     |
| Based on Sources   | 根拠となるCandidateおよびsourceを保持する      |
| Diff or Full Draft | 差分案または置換用全文案として生成できる              |
| Draft Status       | `draft` または `review_required` とする |
| Human Review       | 正本反映前の確認を必須とする                    |

#### 制約

* Draft生成処理は正本文書を変更しない。
* 正本反映操作を同一処理内で実行しない。
* 複数文書へ影響する場合、影響範囲を明示する。
* ADR Draftを作成してもAccepted化しない。
* Task Draftを作成してもNext Actionsへ自動反映しない。

#### 対応成果物

```text
docs/governance/draft-generation-rule.md
```

---

### P7-FR-006 Review Queue管理

AutomationまたはAgentにより生成された、人間確認が必要なCandidate、Draft、WarningおよびMaintenance ItemをReview Queueとして一覧管理できること。

#### Queue対象

| Item Type                  | 内容        |
| -------------------------- | --------- |
| Memory Candidate           | 記憶分類候補    |
| Conversation Summary Draft | 会話要約草案    |
| Doc Update Draft           | 正本更新案     |
| ADR Draft                  | 判断記録案     |
| Task Proposal              | 次アクション案   |
| Conflict Warning           | 矛盾候補      |
| Staleness Warning          | 古い情報候補    |
| Reflection Gap             | 承認済み未反映候補 |
| Maintenance Proposal       | 棚卸し・整理候補  |

#### Review Queue必須項目

| 項目                 | 内容                                                            |
| ------------------ | ------------------------------------------------------------- |
| `queue_item_id`    | Queue項目識別子                                                    |
| `project_code`     | 対象Project                                                     |
| `item_type`        | Candidate / Draft / Warning等                                  |
| `title`            | 確認対象の名称                                                       |
| `priority`         | P0 / P1 / P2等の確認優先度                                           |
| `status`           | review_required / approved / rejected / deferred / reflected等 |
| `source_reference` | 根拠情報                                                          |
| `target_source`    | 反映対象候補                                                        |
| `created_at`       | 作成日時                                                          |
| `reviewed_at`      | 確認日時                                                          |
| `review_result`    | 人間判断結果                                                        |
| `warnings`         | 注意事項                                                          |

#### 初期管理方式

Phase 7の初期運用では、Review QueueはMarkdownまたは構造化ファイルを基本候補とし、DB化は処理量と運用負荷を確認した上で判断する。

#### 対応成果物

```text
docs/governance/review-queue-policy.md
templates/governance/review-queue-item.template.md
```

---

### P7-FR-007 Approval Record管理

Review Queueの確認結果について、採用・却下・保留・反映済みの判断履歴を記録できること。

#### Approval Record必須項目

| 項目                        | 内容                                                       |
| ------------------------- | -------------------------------------------------------- |
| `approval_id`             | 判断記録識別子                                                  |
| `queue_item_id`           | 対象Review Queue項目                                         |
| `project_code`            | 対象Project                                                |
| `item_type`               | 対象種別                                                     |
| `decision`                | approve / reject / defer / reflect_confirmed / supersede |
| `decision_reason`         | 判断理由                                                     |
| `reviewed_by`             | 確認者                                                      |
| `reviewed_at`             | 確認日時                                                     |
| `reflection_target`       | 反映対象文書                                                   |
| `reflection_confirmed_at` | 正本反映確認日時                                                 |
| `related_sources`         | 根拠情報                                                     |
| `notes`                   | 補足                                                       |

#### 要件

* ApproveとReflect Confirmedを区別すること。
* 反映済み判定は正本文書の確認を伴うこと。
* Rejectされた候補を無断で再提案し続けない制御が可能であること。
* Deferred項目は再確認時期または再確認条件を設定できること。
* Superseded項目は置換先を追跡できること。

#### 対応成果物

```text
docs/governance/approval-record-policy.md
templates/governance/approval-record.template.md
```

---

### P7-FR-008 Reflection Gap検出

人間が採用判断をしたにもかかわらず、正本文書への反映が確認されていない項目を検出できること。

#### 検出対象

| 状態                                     | 検出内容            |
| -------------------------------------- | --------------- |
| `approved` かつ未反映                       | 反映待ち候補として提示     |
| Draft作成済みだが長期間未レビュー                    | Review滞留候補として提示 |
| 反映済みと記録されたが正本に該当記載が見つからない              | 反映確認エラー候補として提示  |
| ADR Accepted判断済みだがActive Decisionsへ未反映 | 整合修正候補として提示     |
| Task採用済みだがNext Actionsへ未反映             | タスク反映漏れ候補として提示  |

#### 出力要件

* 対象候補と想定反映先を示すこと。
* 根拠となるApproval RecordまたはDraftを示すこと。
* 自動反映せず、Review Queueへ登録すること。
* 検出誤りの場合に却下または対象外指定できること。

#### 対応成果物

```text
docs/governance/reflection-gap-detection-rule.md
```

---

### P7-FR-009 Conflict検出

正本文書、ADR、Active Decisions、Next Actions、Agent定義または承認済み記憶の間で、内容が矛盾している可能性を検出できること。

#### 検出対象例

| Conflict Type            | 例                                      |
| ------------------------ | -------------------------------------- |
| Decision Conflict        | 同一論点に異なるactive decisionが存在する           |
| ADR Conflict             | Accepted ADRとActive Decisionsの記載が一致しない |
| Phase Conflict           | Phase要件と作業計画書の成果物が不一致である               |
| Task Conflict            | 同じ目的に重複または矛盾するTaskが存在する                |
| Constraint Conflict      | Agent定義がCommon Agent Rulesに反する権限を持つ    |
| Source Boundary Conflict | 副本または生成物が正本として扱われている                   |
| Tool Boundary Conflict   | MCP Toolが許可外操作を可能にしている                 |

#### 必須要件

* Conflict候補を自動で解消しない。
* 競合しているsourceを両方提示する。
* 優先参照ルールに基づく推奨確認順序を提示できる。
* P0相当の安全境界違反を高優先度として扱える。
* Conflict解消後に、どの正本またはADRへ反映すべきか提案できる。

#### 対応成果物

```text
docs/governance/conflict-detection-rule.md
```

---

### P7-FR-010 Staleness検出

現在参照されている情報が古い、または更新が必要である可能性を検出できること。

#### 検出対象例

| 対象                    | 検出内容                          |
| --------------------- | ----------------------------- |
| `current-status.md`   | 長期間更新されていない                   |
| `next-actions.md`     | 完了済みまたは不要になったTask候補が残存している    |
| `active-decisions.md` | 新ADR採用後も旧判断がactiveのままである      |
| Search Index          | 正本文書更新後に再索引されていない             |
| Context Pack Rule     | Agent運用で不足が判明したのに未更新である       |
| Agent Definition      | 使用実績がない、またはTool構成が現行方針と不一致である |
| Review Queue          | 長期間未処理項目が滞留している               |
| Draft                 | 長期間未確認のまま残存している               |

#### 必須要件

* staleである可能性を示す候補検出に留めること。
* 更新期限または警告基準の設定を可能にすること。
* warningの根拠となる日時、status、関連文書を示すこと。
* 一律削除または自動deprecated化を行わないこと。

#### 対応成果物

```text
docs/governance/staleness-detection-rule.md
```

---

### P7-FR-011 Duplicate検出

重複または類似する記憶候補、Task、Issue、Draft等を検出し、人間が統合判断できるようにすること。

#### 検出対象

| 対象                 | 例                      |
| ------------------ | ---------------------- |
| Task Proposal      | 同じ成果物を目的とするTaskが複数存在する |
| Issue              | 同一課題が別表現で複数記録されている     |
| Decision Candidate | 同一判断が複数会話から抽出されている     |
| ADR Draft          | 類似判断のADR案が重複している       |
| Article Note       | 同じ論点が重複記録されている         |
| Maintenance Item   | 同一warningが繰り返し生成されている  |

#### 必須要件

* 統合候補を提示すること。
* 既存正本または既存Draftを優先候補として示せること。
* 自動統合・自動削除を行わないこと。
* 重複ではないと判断された項目を除外登録できること。

#### 対応成果物

```text
docs/governance/duplicate-detection-rule.md
```

---

### P7-FR-012 Memory Maintenance Report生成

記憶基盤の正本、Draft、Queue、Agent運用および検索鮮度について、定期的または任意タイミングで棚卸し用レポートを生成できること。

#### Maintenance Report必須構成

```md
# Memory Maintenance Report

## Metadata

| Item | Content |
|---|---|
| project_code |  |
| generated_at |  |
| review_period |  |
| status | draft / review_required |

## 1. Source of Truth Status

- 

## 2. Pending Review Queue Items

- 

## 3. Approved but Not Reflected Items

- 

## 4. Conflict Candidates

- 

## 5. Staleness Candidates

- 

## 6. Duplicate Candidates

- 

## 7. Search Index / Context Quality Warnings

- 

## 8. Agent Operation Findings

- 

## 9. Recommended Human Actions

| Priority | Action | Target Source | Reason |
|---|---|---|---|

## 10. Automation Boundary Warnings

- 
```

#### 実行契機

| 実行契機                    | 扱い            |
| ----------------------- | ------------- |
| Phase完了時                | 必須候補          |
| Agent運用実績が一定数蓄積した時      | 推奨            |
| 正本更新が複数発生した時            | 推奨            |
| 検索結果にstale warningが増えた時 | 推奨            |
| ユーザーが棚卸しを依頼した時          | 実行可能          |
| 定期実行                    | 任意。運用量を確認後に判断 |

#### 対応成果物

```text
templates/governance/memory-maintenance-report.template.md
docs/governance/memory-maintenance-policy.md
```

---

### P7-FR-013 Agent Operation Analytics

Phase 6で記録したAgent Operation Logを基に、Agent利用の効果、成果物採用状況、人間負荷および改善課題を評価できること。

#### 集計対象

| 指標                             | 内容                                  |
| ------------------------------ | ----------------------------------- |
| Agent Usage Count              | Agentごとの利用回数                        |
| Output Count                   | Review Report / Draft / Proposal生成数 |
| Approval Rate                  | DraftまたはProposalの採用率                |
| Reflection Rate                | Approved項目の正本反映確認率                  |
| Rejection Reason               | 却下理由の傾向                             |
| Rework Count                   | 人間による大幅修正が必要だった回数                   |
| Missing Context Count          | Context不足により作業が成立しなかった回数            |
| Tool Issue Count               | Tool不足・Error・warningに関する件数          |
| Manual Review Load             | 人間確認負荷の記録                           |
| Automation Candidate Frequency | 繰り返し発生する作業の頻度                       |

#### 利用目的

* Agent定義の改善
* Tool追加判断
* Context構成改善
* Automation有効化判断
* 自動化禁止境界の見直し
* 不要Agentまたは低品質Agentの停止判断

#### 対応成果物

```text
docs/governance/agent-operation-analytics-policy.md
docs/review/phase-7-agent-operation-analysis.md
```

---

### P7-FR-014 Automation処理ログおよび監査記録

自動または半自動で実行された候補抽出、Draft作成、警告検出、Maintenance Report生成について、後から処理内容を追跡できること。

#### 必須記録項目

| 項目                  | 内容                                                                 |
| ------------------- | ------------------------------------------------------------------ |
| `automation_run_id` | 実行識別子                                                              |
| `automation_type`   | summary / extraction / draft / conflict / staleness / maintenance等 |
| `project_code`      | 対象Project                                                          |
| `input_sources`     | 入力となった情報                                                           |
| `output_items`      | 生成されたCandidate / Draft / Warning                                   |
| `executed_at`       | 実行日時                                                               |
| `executed_by`       | user_triggered / agent_assisted / scheduled_candidate等             |
| `automation_level`  | L1 / L2 / L3候補                                                     |
| `write_performed`   | Phase 7では常にfalseであること                                              |
| `warnings`          | 実行時の注意事項                                                           |
| `review_status`     | 未確認 / 確認済み等                                                        |

#### 制約

* 正本文書全文を不必要に重複保存しない。
* Secretまたは許可外情報をログへ保存しない。
* Automation Logを正本判断の代替としない。
* `write_performed=true` となる自動処理をPhase 7で許可しない。

#### 対応成果物

```text
docs/governance/automation-audit-policy.md
```

---

### P7-FR-015 Governance Dashboard用情報整理

Review Queue、Approval Record、Maintenance ReportおよびAgent Operation Analyticsを、人間が確認しやすい一覧形式へ整理できること。

#### 初期対象

Phase 7初期では、Web UIの構築を必須とせず、Markdownレポートまたは構造化ファイルによる確認を基本とする。

#### 確認可能にすべき情報

| 情報            | 内容                                 |
| ------------- | ---------------------------------- |
| Review待ち件数    | 未確認のCandidate / Draft / Warning    |
| P0 Warning    | 正本境界違反、write boundary違反、重大Conflict |
| Approved未反映件数 | Reflection Gap                     |
| Stale候補件数     | 更新確認が必要な情報                         |
| Agent別成果物件数   | Agent運用状況                          |
| 採用率 / 却下率     | Agent出力品質の参考                       |
| 最近の正本更新候補     | 反映判断対象                             |
| Phase整合性課題    | 文書間の齟齬候補                           |

#### 対応成果物

```text
docs/governance/governance-view-spec.md
```

---

### P7-FR-016 Mnemosyne Governance検証

Project Mnemosyneを対象に、要件文書・Phase文書・ADR・Agent成果物を用いて、AutomationおよびGovernanceが成立するか検証できること。

#### 検証対象例

| 検証内容                         | 期待結果                                      |
| ---------------------------- | ----------------------------------------- |
| Phase要件作成会話からSummary Draft生成 | Fact / Decision / Task / Issue候補を整理できる    |
| Phase 1〜7文書間のConflict検出      | 成果物名称、責務境界、未反映論点の候補を提示できる                 |
| Agent Operation方針のADR候補抽出    | ADR Draft候補を作成できるが、Accepted化しない           |
| 次工程Task候補抽出                  | 全Phase統合レビューや設計仕様書化をTask Proposalとして提示できる |
| Approved未反映検出                | 反映確認が必要な項目をQueueへ提示できる                    |

#### 検証記録

```text
docs/review/phase-7-mnemosyne-governance-validation.md
```

---

### P7-FR-017 ATS Governance検証

ATSを対象に、既存の実装判断、検証結果、docs更新候補および記事化候補を用いて、AutomationおよびGovernanceが実プロジェクトで成立するか検証できること。

#### 検証対象例

| 検証内容                                 | 期待結果                           |
| ------------------------------------ | ------------------------------ |
| ATS実装レビュー結果からTask Candidate抽出        | docs更新や追加検証候補を抽出できる            |
| Cooldown確認結果からTest Result候補抽出        | 検証結果を正本反映候補として整理できる            |
| `action_select` 判断とdocsのConflict候補検出 | 設計・実装・docs間の確認事項を提示できる         |
| 記事化候補整理                              | `article_note` 採用済みの場合のみ候補化できる |
| 重複Task候補検出                           | 類似docs更新タスクを人間確認対象として提示できる     |

#### 検証記録

```text
docs/review/phase-7-ats-governance-validation.md
```

---

### P7-FR-018 Phase 1〜7統合レビュー

Phase別要件定義の作成完了後、Phase 1からPhase 7までの目的、成果物、責務境界、正本方針および引継ぎ関係を統合レビューできること。

#### 必須レビュー観点

| 観点                       | 確認内容                                                 |
| ------------------------ | ---------------------------------------------------- |
| Phase連続性                 | 前Phase成果物が後Phaseの前提として適切に接続しているか                     |
| Scope Boundary           | 各Phaseで対象外とした機能が他Phaseで適切に扱われているか                    |
| Source of Truth          | 正本・副本・生成物の扱いが全Phaseで一貫しているか                          |
| Write Policy             | 無承認write禁止がAPI、MCP、Agent、Automationまで維持されているか        |
| Agent Architecture       | AgentとProject Contextの分離が全Phaseへ反映されているか             |
| Deliverable Naming       | 文書名・保存先・成果物名称に揺れがないか                                 |
| Registry Consistency     | Project Registry / Agent Registryの責務が整合しているか         |
| Context Lifecycle        | Context Pack、Retrieved Context、Draft、正本反映の流れが整合しているか |
| Governance Coverage      | 承認、反映確認、棚卸し、監査が不足していないか                              |
| Implementation Readiness | 設計仕様書および実装ロードマップ作成へ進めるか                              |

#### 対応成果物

```text
docs/review/all-phases-requirements-consistency-review.md
```

---

### P7-FR-019 設計仕様書および実装計画への移行整理

全Phase要件の整合レビュー後、要件を実装可能な設計仕様書および実装ロードマップへ展開するための入力を整理できること。

#### 整理対象

| 区分                     | 整理内容                                                  |
| ---------------------- | ----------------------------------------------------- |
| System Design          | 全体構成、責務分割、コンポーネント境界                                   |
| Data Design            | Registry、Index、Draft、Queue、Approval Record、Auditの保持方式 |
| API Design             | Memory Gateway endpoint、認証、Error、監査                   |
| MCP Design             | Tool Contract、transport、client接続                      |
| Agent Design           | Agent定義、prompt構造、Tool Profile                         |
| Governance Design      | Review Queue、Approval、Maintenance、Automation Log      |
| Implementation Roadmap | Phase実装順序、MVP再確認、追加Phase要否                            |
| Validation Plan        | Mnemosyne / ATSを用いた受入テスト                              |
| Technology Decisions   | DB、Vector Store、API Framework、MCP方式等のADR候補            |

#### 対応成果物

```text
docs/design/system-design.md
docs/roadmap/implementation-roadmap.md
docs/review/requirements-to-design-handoff.md
```

---

## 12.11 Phase 7機能要件一覧

| ID        | 機能要件                         | 概要                              |
| --------- | ---------------------------- | ------------------------------- |
| P7-FR-001 | Automation Boundary定義        | 自動化可能範囲と禁止範囲を定義する               |
| P7-FR-002 | Conversation Summary Draft生成 | 会話・Agent成果物を要約草案へ変換する           |
| P7-FR-003 | Memory Candidate抽出           | Fact / Decision / Task等の候補を抽出する |
| P7-FR-004 | Reflection Target推定          | 候補の反映先文書を提案する                   |
| P7-FR-005 | Doc Update Draft作成支援         | 正本更新案をDraftとして作成する              |
| P7-FR-006 | Review Queue管理               | 人間確認対象を一覧管理する                   |
| P7-FR-007 | Approval Record管理            | 採用・却下・保留・反映確認を記録する              |
| P7-FR-008 | Reflection Gap検出             | 承認済み未反映候補を検出する                  |
| P7-FR-009 | Conflict検出                   | 正本・ADR・Task・Agent方針等の矛盾候補を検出する  |
| P7-FR-010 | Staleness検出                  | 古い情報・未更新情報候補を検出する               |
| P7-FR-011 | Duplicate検出                  | 重複候補を検出し統合判断を支援する               |
| P7-FR-012 | Memory Maintenance Report生成  | 記憶基盤の棚卸しレポートを生成する               |
| P7-FR-013 | Agent Operation Analytics    | Agent利用効果・負荷・課題を評価する            |
| P7-FR-014 | Automation監査記録               | 半自動処理の実行内容を追跡する                 |
| P7-FR-015 | Governance View整理            | Review待ち・警告・反映漏れを確認可能にする        |
| P7-FR-016 | Mnemosyne Governance検証       | 基盤自身で統制運用を検証する                  |
| P7-FR-017 | ATS Governance検証             | 実プロジェクトで統制運用を検証する               |
| P7-FR-018 | Phase 1〜7統合レビュー              | 全Phaseの整合性を確認する                 |
| P7-FR-019 | 設計仕様・実装計画への移行整理              | 要件から設計・実装へ引き継ぐ                  |

---

## 12.12 Phase 7非機能要件

| ID         | 非機能要件      | 内容                                                                         |
| ---------- | ---------- | -------------------------------------------------------------------------- |
| P7-NFR-001 | 正本非改変性     | Automation処理が正本文書を無承認で変更しないこと                                              |
| P7-NFR-002 | 承認分離性      | ApproveとReflect Confirmedを区別できること                                          |
| P7-NFR-003 | 根拠追跡性      | Candidate、Draft、Warning、Maintenance Itemから元sourceを追跡できること                  |
| P7-NFR-004 | 状態明確性      | Candidate / Draft / Approved / Reflected / Rejected / Deferred等を明確に区別できること |
| P7-NFR-005 | 情報鮮度維持     | stale、superseded、deprecated、reflection gapを検出・提示できること                      |
| P7-NFR-006 | 人間確認性      | 自動生成された候補・Draft・警告を人間が確認しやすい形式で提示できること                                     |
| P7-NFR-007 | 誤反映防止      | 自動処理の誤分類または誤提案が正本へ直接影響しないこと                                                |
| P7-NFR-008 | Project分離性 | 指定Project以外の情報を誤ってCandidateまたはDraftへ混入させないこと                               |
| P7-NFR-009 | Agent統制性   | Agent成果物がCommon Agent RulesおよびTool Boundaryに適合しているか確認できること                 |
| P7-NFR-010 | 監査可能性      | Automation実行、Review判断、Reflection確認を後から確認できること                              |
| P7-NFR-011 | 運用負荷評価性    | 半自動化による人間負荷の増減を記録・評価できること                                                  |
| P7-NFR-012 | 段階導入性      | L1、L2を先行し、必要性確認後にL3候補を検討できること                                              |
| P7-NFR-013 | 停止可能性      | 問題のあるAutomation処理を無効化または中断できること                                            |
| P7-NFR-014 | セキュリティ     | Secretや許可外情報をAutomation LogまたはReportへ漏えいさせないこと                             |
| P7-NFR-015 | 拡張性        | 将来のUI、DB管理、通知、複数ユーザー運用へ展開可能な情報構造を持つこと                                      |
| P7-NFR-016 | 実装移行可能性    | Phase 1〜7の要件から設計仕様書および実装計画へ移行できること                                         |

---

## 12.13 Phase 7制約

| ID       | 制約                                                                  |
| -------- | ------------------------------------------------------------------- |
| P7-C-001 | Phase 7で許可する必須Automation LevelはL1およびL2とする                           |
| P7-C-002 | 正本への自動反映に該当するL4以上を実装しない                                             |
| P7-C-003 | Approved状態を正本反映済み状態として扱わない                                          |
| P7-C-004 | ADRのAccepted判断を自動化しない                                               |
| P7-C-005 | Taskの確定、優先度変更および完了判定を自動化しない                                         |
| P7-C-006 | 記憶の自動削除または自動置換確定を行わない                                               |
| P7-C-007 | Article等の外部公開を自動化しない                                                |
| P7-C-008 | Agent権限およびMCP Tool権限を自動で拡張しない                                       |
| P7-C-009 | Notion双方向同期またはNotion正本化を必須範囲に含めない                                   |
| P7-C-010 | Phase 7では完全自律Agent orchestrationを必須化しない                             |
| P7-C-011 | Automation処理は必ず入力source、出力candidate、warningおよびreview statusを追跡可能にする |
| P7-C-012 | Review QueueおよびApproval Recordの保存技術は要件定義で固定せず、設計仕様書で確定する            |
| P7-C-013 | 定期自動実行は初期必須とせず、オンデマンド実行またはユーザー起点で検証する                               |
| P7-C-014 | 全Phase整合レビュー完了前に、大規模実装へ移行しない                                        |

---

## 12.14 Phase 7成果物

### 12.14.1 必須成果物

#### A. Automation / Governance方針文書

| ファイル                                            | 目的                          |
| ----------------------------------------------- | --------------------------- |
| `docs/governance/automation-boundary-policy.md` | 自動化Level、許可範囲、禁止範囲を定義する     |
| `docs/governance/governance-overview.md`        | Phase 7全体の統制構造を定義する         |
| `docs/governance/review-queue-policy.md`        | 人間確認対象の管理方針を定義する            |
| `docs/governance/approval-record-policy.md`     | 採用・却下・保留・反映確認の管理方針を定義する     |
| `docs/governance/automation-audit-policy.md`    | 半自動処理の監査記録方針を定義する           |
| `docs/governance/memory-maintenance-policy.md`  | 記憶棚卸しと改善候補管理を定義する           |
| `docs/governance/governance-view-spec.md`       | Review待ち・警告・反映漏れ等の確認情報を定義する |

#### B. Automation Rule文書

| ファイル                                                      | 目的                                   |
| --------------------------------------------------------- | ------------------------------------ |
| `docs/governance/conversation-summary-automation-rule.md` | Conversation Summary Draft生成ルールを定義する |
| `docs/governance/memory-candidate-extraction-rule.md`     | 記憶候補抽出ルールを定義する                       |
| `docs/governance/draft-generation-rule.md`                | 正本文書更新Draft生成ルールを定義する                |
| `docs/governance/reflection-gap-detection-rule.md`        | 承認済み未反映検出ルールを定義する                    |
| `docs/governance/conflict-detection-rule.md`              | 矛盾候補検出ルールを定義する                       |
| `docs/governance/staleness-detection-rule.md`             | 古い情報候補検出ルールを定義する                     |
| `docs/governance/duplicate-detection-rule.md`             | 重複候補検出ルールを定義する                       |
| `docs/governance/agent-operation-analytics-policy.md`     | Agent運用結果の集計・評価方法を定義する               |

#### C. Template

| ファイル                                                          | 目的                           |
| ------------------------------------------------------------- | ---------------------------- |
| `templates/governance/conversation-summary-draft.template.md` | Conversation Summary Draft書式 |
| `templates/governance/memory-candidate.template.md`           | Memory Candidate書式           |
| `templates/governance/review-queue-item.template.md`          | Review Queue Item書式          |
| `templates/governance/approval-record.template.md`            | Approval Record書式            |
| `templates/governance/memory-maintenance-report.template.md`  | Maintenance Report書式         |
| `templates/governance/automation-run-log.template.md`         | Automation実行記録書式             |

#### D. 検証記録

| ファイル                                                        | 目的                                     |
| ----------------------------------------------------------- | -------------------------------------- |
| `docs/review/phase-7-mnemosyne-governance-validation.md`    | MnemosyneでのAutomation / Governance検証結果 |
| `docs/review/phase-7-ats-governance-validation.md`          | ATSでのAutomation / Governance検証結果       |
| `docs/review/phase-7-agent-operation-analysis.md`           | Agent運用ログの集計・改善評価                      |
| `docs/review/phase-7-write-boundary-validation.md`          | 自動処理が正本writeを行わないことの検証                 |
| `docs/review/phase-7-review-queue-validation.md`            | Queue / Approval / Reflection状態管理の検証   |
| `docs/review/all-phases-requirements-consistency-review.md` | Phase 1〜7全体整合レビュー                      |

#### E. 設計・実装工程への引継ぎ文書

| ファイル                                            | 目的                   |
| ----------------------------------------------- | -------------------- |
| `docs/review/requirements-to-design-handoff.md` | 要件から設計仕様へ引き継ぐ事項を整理する |
| `docs/design/system-design.md`                  | 全体設計仕様書の作成対象         |
| `docs/roadmap/implementation-roadmap.md`        | 実装順序、MVP、追加判断を整理する   |

### 12.14.2 技術設計時に追加される可能性がある成果物

| ファイルまたは構成                                      | 条件                                  |
| ---------------------------------------------- | ----------------------------------- |
| `docs/design/governance-design.md`             | Governance内部構造を独立設計する場合             |
| `config/automation-rules.yaml`                 | 自動化ルールを設定ファイルで管理する場合                |
| `config/governance-thresholds.yaml`            | staleness期間、Queue優先度等を設定化する場合       |
| `src/automation/conversationSummaryService.ts` | Summary Draft生成を実装する場合              |
| `src/automation/memoryCandidateExtractor.ts`   | Candidate抽出を実装する場合                  |
| `src/automation/draftGenerationService.ts`     | Draft生成を実装する場合                      |
| `src/governance/reviewQueueService.ts`         | Review Queueを実装する場合                 |
| `src/governance/approvalRecordService.ts`      | Approval Recordを実装する場合              |
| `src/governance/conflictDetectionService.ts`   | Conflict検出を実装する場合                   |
| `src/governance/stalenessDetectionService.ts`  | Staleness検出を実装する場合                  |
| `src/governance/maintenanceReportService.ts`   | Maintenance Report生成を実装する場合         |
| `src/governance/automationAuditService.ts`     | Automation実行監査を実装する場合               |
| DB migration                                   | Queue、Approval、Audit等をDB管理すると判断した場合 |

---

## 12.15 Phase 7推奨ディレクトリ構成

```text
project-mnemosyne/
  docs/
    governance/
      governance-overview.md
      automation-boundary-policy.md
      review-queue-policy.md
      approval-record-policy.md
      automation-audit-policy.md
      memory-maintenance-policy.md
      governance-view-spec.md

      conversation-summary-automation-rule.md
      memory-candidate-extraction-rule.md
      draft-generation-rule.md
      reflection-gap-detection-rule.md
      conflict-detection-rule.md
      staleness-detection-rule.md
      duplicate-detection-rule.md
      agent-operation-analytics-policy.md

    review/
      phase-7-mnemosyne-governance-validation.md
      phase-7-ats-governance-validation.md
      phase-7-agent-operation-analysis.md
      phase-7-write-boundary-validation.md
      phase-7-review-queue-validation.md
      all-phases-requirements-consistency-review.md
      requirements-to-design-handoff.md

    design/
      system-design.md

    roadmap/
      implementation-roadmap.md

  templates/
    governance/
      conversation-summary-draft.template.md
      memory-candidate.template.md
      review-queue-item.template.md
      approval-record.template.md
      memory-maintenance-report.template.md
      automation-run-log.template.md

  config/
    automation-rules.yaml                # Optional
    governance-thresholds.yaml           # Optional
```

---

## 12.16 Phase 7検証シナリオ

### 12.16.1 Conversation Summary / Memory Candidate検証

| No.      | 検証内容              | 入力              | 期待結果                                       |
| -------- | ----------------- | --------------- | ------------------------------------------ |
| P7-T-001 | Mnemosyne会話要約草案生成 | Phase要件作成に関する会話 | Conversation Summary Draftが生成される           |
| P7-T-002 | Fact候補抽出          | 確認済み方針を含む会話     | `fact` Candidateとして根拠付きで抽出される              |
| P7-T-003 | Decision候補抽出      | Phase方針決定を含む会話  | `decision` Candidateとして抽出されるが、正本へ反映されない    |
| P7-T-004 | Task候補抽出          | 次工程の合意を含む会話     | `task` CandidateまたはTask Proposalとして抽出される   |
| P7-T-005 | 未決定内容処理           | 検討中の案を含む会話      | `idea` または `issue` として扱われ、Decisionに誤分類されない |
| P7-T-006 | Test Result候補抽出   | ATS検証結果を含む入力    | `test_result` Candidateとして抽出される            |

### 12.16.2 Draft生成・Review Queue検証

| No.      | 検証内容                  | 入力                          | 期待結果                              |
| -------- | --------------------- | --------------------------- | --------------------------------- |
| P7-T-007 | Current Status更新Draft | 進捗候補                        | `current-status.md` 更新Draftが生成される |
| P7-T-008 | Next Actions更新Draft   | Task Candidate              | `next-actions.md` 更新Draftが生成される   |
| P7-T-009 | ADR Draft生成           | Decision Candidate          | Proposed状態のADR Draftが生成される        |
| P7-T-010 | Queue登録               | Candidate / Draft / Warning | Review Queueに確認対象として登録できる         |
| P7-T-011 | Queue優先度              | 正本境界違反候補                    | P0相当として優先表示できる                    |
| P7-T-012 | 正本非変更                 | Draft生成前後                   | 正本文書が変更されない                       |

### 12.16.3 Approval / Reflection検証

| No.      | 検証内容                 | 入力            | 期待結果                      |
| -------- | -------------------- | ------------- | ------------------------- |
| P7-T-013 | Approve記録            | Review済みDraft | Approved状態を記録できる          |
| P7-T-014 | ApproveとReflect区別    | Approved直後    | 正本反映済みとは扱われない             |
| P7-T-015 | Reflection Confirmed | 人間が正本反映後に確認   | Reflected状態を記録できる         |
| P7-T-016 | Reject記録             | 不採用Candidate  | Reject理由を記録できる            |
| P7-T-017 | Defer記録              | 判断保留候補        | 再確認条件または時期を記録できる          |
| P7-T-018 | Reflection Gap検出     | Approved未反映項目 | Review Queueへ反映待ち候補を提示できる |

### 12.16.4 Conflict / Staleness / Duplicate検証

| No.      | 検証内容                           | 入力                      | 期待結果                 |
| -------- | ------------------------------ | ----------------------- | -------------------- |
| P7-T-019 | Phase成果物Conflict               | 文書名・保存先が不一致な文書          | 矛盾候補と対象sourceを提示できる  |
| P7-T-020 | ADR / Active Decision Conflict | ADRと一覧記載の不一致            | 解消確認候補として提示できる       |
| P7-T-021 | Tool Boundary Conflict         | write可能なTool定義候補        | P0 warningとして提示できる   |
| P7-T-022 | Current Status Stale           | 長期間未更新文書                | 更新確認候補を提示できる         |
| P7-T-023 | Search Index Stale             | 正本更新後に未索引               | 再索引候補を提示できる          |
| P7-T-024 | Duplicate Task                 | 類似Task Proposal複数       | 統合候補として提示できる         |
| P7-T-025 | 自動解消防止                         | Conflict / Duplicate検出後 | 正本やDraftが自動削除・変更されない |

### 12.16.5 Memory Maintenance検証

| No.      | 検証内容           | 対象                      | 期待結果                     |
| -------- | -------------- | ----------------------- | ------------------------ |
| P7-T-026 | Mnemosyne棚卸し   | Phase文書、ADR、Agent成果物    | Maintenance Reportを生成できる |
| P7-T-027 | ATS棚卸し         | 実装判断、Test Result、Task候補 | Maintenance Reportを生成できる |
| P7-T-028 | Review滞留確認     | 未確認Draft複数              | 確認優先度付きで提示できる            |
| P7-T-029 | Agent運用集計      | Agent Operation Log     | 採用率、手戻り、Context不足等を整理できる |
| P7-T-030 | Automation境界警告 | 自動反映要求を含む候補             | 禁止対象として警告できる             |

### 12.16.6 全Phase統合レビュー検証

| No.      | 検証内容           | 対象                             | 期待結果                                                      |
| -------- | -------------- | ------------------------------ | --------------------------------------------------------- |
| P7-T-031 | Phase連続性確認     | Phase 1〜7要件                    | 前提・成果物・引継ぎの不足を抽出できる                                       |
| P7-T-032 | 正本境界確認         | 全Phase要件                       | docs / ADR / Context / Index / API / Tool / Draftの境界が一貫する |
| P7-T-033 | write policy確認 | API / MCP / Agent / Automation | 正本write禁止が維持される                                           |
| P7-T-034 | Agent構想確認      | Phase 2 / 5 / 6                | AgentとProject Contextの分離が一貫する                             |
| P7-T-035 | 設計移行判定         | 全成果物                           | System Design作成へ進めるか判定できる                                 |

---

## 12.17 Phase 7完了条件

### 12.17.1 Definition of Done

Phase 7は、以下をすべて満たした時点で完了とする。

| No.    | 完了条件                                                            | 判定観点                               |
| ------ | --------------------------------------------------------------- | ---------------------------------- |
| DoD-01 | Automation BoundaryおよびAutomation Levelが定義されている                  | 自動化可能範囲と禁止範囲を説明できる                 |
| DoD-02 | Conversation Summary Draft生成ルールが定義され、検証されている                    | 会話等を記憶候補入力へ整理できる                   |
| DoD-03 | Memory Candidate抽出ルールが定義され、検証されている                              | Fact / Decision / Task等を候補として分類できる |
| DoD-04 | Reflection Target推定およびDoc Update Draft生成が可能である                  | 正本更新案をDraftとして準備できる                |
| DoD-05 | Review Queueが定義され、Candidate / Draft / Warningを管理できる             | 人間確認待ち項目を整理できる                     |
| DoD-06 | Approval Recordが定義され、Approve / Reject / Defer / Reflectedを区別できる | 人間判断履歴を追跡できる                       |
| DoD-07 | ApprovedとReflectedが明確に区別されている                                   | 採用判断を反映済みと誤認しない                    |
| DoD-08 | Reflection Gap検出が可能である                                          | 承認済み未反映候補を確認できる                    |
| DoD-09 | Conflict検出が可能である                                                | 正本・ADR・Task・Agent境界の矛盾候補を確認できる     |
| DoD-10 | Staleness検出が可能である                                               | 古い情報や未更新情報候補を確認できる                 |
| DoD-11 | Duplicate検出が可能である                                               | 重複候補を人間が統合判断できる                    |
| DoD-12 | Memory Maintenance Reportを生成できる                                 | 長期運用上の棚卸しが可能である                    |
| DoD-13 | Agent Operation Analyticsが整理されている                               | Agent利用効果と人間負荷を評価できる               |
| DoD-14 | Automation Audit記録が定義されている                                      | 自動処理の入力・出力・判断状態を追跡できる              |
| DoD-15 | MnemosyneでGovernance検証が完了している                                   | 基盤自身の文書運用に適用できる                    |
| DoD-16 | ATSでGovernance検証が完了している                                         | 実プロジェクトの運用に適用できる                   |
| DoD-17 | 自動処理により正本write、ADR採用、Task確定、記憶削除が行われないことを確認している                 | 安全境界が維持されている                       |
| DoD-18 | Phase 1〜7統合レビューが完了している                                          | 全Phaseの責務と成果物が整合している               |
| DoD-19 | Requirements to Design Handoffが作成されている                          | 設計仕様書化へ進める                         |
| DoD-20 | System DesignおよびImplementation Roadmapの作成対象が整理されている             | 実装準備へ移行できる                         |

### 12.17.2 完了判定

| 判定             | 条件                                                  |
| -------------- | --------------------------------------------------- |
| Go             | 全DoDを満たし、候補抽出・Draft生成・棚卸し支援を半自動化しても、正本境界と人間承認が維持される |
| Conditional Go | Automation精度または運用負荷に改善課題はあるが、L1 / L2運用と設計仕様書化へ進める   |
| No Go          | 正本非改変、承認分離、根拠追跡、Conflict検出、または人間レビュー運用のいずれかが成立しない   |

---

## 12.18 Phase 7完了後の引継ぎ要件

Phase 7は現時点のPhase別要件定義における最終の運用拡張Phaseである。完了後は、単純に次の機能Phaseへ進むのではなく、全Phaseを統合して設計・実装へ移行する。

| ID        | 引継ぎ事項                    | 内容                                                                  |
| --------- | ------------------------ | ------------------------------------------------------------------- |
| P7-HO-001 | 全Phase要件定義               | Phase 1〜7の確定またはレビュー済み要件                                             |
| P7-HO-002 | 正本境界                     | docs / ADR / Draft / Context / Index / API / Tool / Governance記録の責務 |
| P7-HO-003 | Automation Boundary      | L1 / L2許可、L4 / L5禁止等の境界                                             |
| P7-HO-004 | Governance Data要件        | Review Queue、Approval Record、Audit、Maintenanceの保持項目                 |
| P7-HO-005 | 検証結果                     | MnemosyneおよびATSによる受入結果                                              |
| P7-HO-006 | 設計課題                     | DB、Vector Store、API Framework、MCP、Agent prompt、Governance保存方式等      |
| P7-HO-007 | Implementation Roadmap入力 | 実装順序、初期MVP、後続拡張、再評価ポイント                                             |
| P7-HO-008 | ADR候補                    | 技術選定・運用境界・保存方式等の未確定判断                                               |
| P7-HO-009 | 運用負荷評価                   | 人間レビュー量、Agent成果物採用率、自動化効果                                           |
| P7-HO-010 | 追加Phase要否                | UI、通知、複数利用者、公開運用等を別Phase化するかの判断材料                                   |

---

## 12.19 Phase 7時点の未決定事項

| ID        | 論点                                   | Phase 7での扱い                      | 後続判断                |
| --------- | ------------------------------------ | -------------------------------- | ------------------- |
| P7-OI-001 | Review Queueの保存方式                    | Markdownまたは構造化ファイルを初期候補とする       | 設計仕様書で判断            |
| P7-OI-002 | Approval Recordの保存方式                 | 要件項目のみ確定する                       | 設計仕様書で判断            |
| P7-OI-003 | Automation Auditの保存方式・保持期間           | 追跡項目を定義する                        | 運用設計で判断             |
| P7-OI-004 | Automationを定期実行するか                   | 初期必須としない                         | 運用頻度確認後に判断          |
| P7-OI-005 | L3 Approved Reflection Supportを導入するか | 任意候補とする                          | L1 / L2検証後に判断       |
| P7-OI-006 | Governance ViewをUI化するか               | 初期はMarkdownレポートで確認               | 運用負荷確認後に判断          |
| P7-OI-007 | DB導入範囲                               | Queue / Approval / Audit量を確認して判断 | System Designで判断    |
| P7-OI-008 | NotionをGovernance Viewに使用するか         | 初期必須範囲外                          | 正本同期方針と負荷を確認後に判断    |
| P7-OI-009 | Article NoteおよびArticle Agentの正式採用    | 外部公開境界が必要                        | 運用方針確定後に判断          |
| P7-OI-010 | 複数利用者・権限管理                           | 初期対象外                            | 将来利用形態確定後に判断        |
| P7-OI-011 | 完全自律AgentまたはAgent Orchestration      | Phase 7対象外                       | 効果・安全性・責任分界を再評価後に判断 |
| P7-OI-012 | 追加Phaseを設けるか                         | 現時点では未決定                         | 全Phase統合レビュー後に判断    |

---

# 13. Phase別要件定義完了後の次工程

Phase 7の要件定義により、Project MnemosyneのPhase別要件は以下の範囲まで整理された。

```text
Phase 1：Memory Foundation
  記憶の正本構造・分類・更新ルール

Phase 2：Context Forge
  Project × Agent × Task に基づくContext Pack生成

Phase 3：Recall Engine
  関連記憶の検索とRetrieved Context補完

Phase 4：Memory Gateway
  記憶機能の安全なAPI公開

Phase 5：MCP Nexus
  AIクライアントからのTool接続

Phase 6：Agent Operation
  役割別Agentの実運用

Phase 7：Automation & Governance
  反復作業の半自動化と記憶統制
```

次工程は、新しいPhase要件を追加することではなく、以下を順に実施する。

## 13.1 次工程一覧

| 順序 | 次工程                   | 成果物                                                         |
| -: | --------------------- | ----------------------------------------------------------- |
|  1 | Phase 1〜7の統合整合レビュー    | `docs/review/all-phases-requirements-consistency-review.md` |
|  2 | 全体要件定義書へのPhase構成反映確認  | `docs/requirements/overall-requirements.md` 改訂案             |
|  3 | Phase別要件定義書の統合・文書化    | `docs/requirements/phase-requirements.md`                   |
|  4 | 全体設計仕様書の作成            | `docs/design/system-design.md`                              |
|  5 | MVP境界および実装順序の再確認      | `docs/roadmap/implementation-roadmap.md`                    |
|  6 | Phase 1実装着手に必要な成果物の作成 | `docs/memory/*`、`docs/templates/memory/*`、ADR等              |
|  7 | 追加Phaseまたは将来拡張の要否判断   | UI、通知、複数利用者、公開運用等                                           |

## 13.2 現時点の実装着手原則

```text
Phase 1〜7の要件をすべて一度に実装するのではない。

まずPhase 1の正本構造とテンプレートを作成し、
MnemosyneおよびATSで検証する。

後続Phaseは、
前Phaseの検証結果を踏まえて
必要性と実装範囲を再確認しながら進める。
```

## 13.3 現時点の結論

Project Mnemosyneは、以下を段階的に実現するプロジェクトである。

```text
記憶を残す
  ↓
必要な文脈として組み立てる
  ↓
関連記憶を検索する
  ↓
外部接続可能にする
  ↓
専門Agentが利用する
  ↓
繰り返し作業を安全に半自動化する
```

その全工程を通じて維持すべき最重要原則は、以下である。

```text
AIは、記憶を参照し、整理し、候補やDraftを作成できる。

しかし、
何を正しい記憶として残すか、
どの判断を採用するか、
どの作業を実行するか、
何を外部へ公開するかは、
人間が責任を持って決定する。
```

## 今回の設計上の整理

| 項目         | Phase 6まで                           | Phase 7で追加した要件                                       |
| ---------- | ----------------------------------- | ---------------------------------------------------- |
| Agent成果物   | Review Report / Draft / Proposalを作成 | 成果物からMemory Candidate・Update Draftを半自動生成             |
| 人間レビュー     | Draft反映前に確認                         | Review Queue・Approval Record・Reflection確認として体系化      |
| Automation | 未定義または後続候補                          | L1 / L2を許可範囲として明文化                                   |
| 正本反映       | 人間承認が必要                             | **ApproveとReflectedを分離**し、未反映漏れを検出                   |
| 記憶鮮度       | status・検索警告で管理                      | Staleness / Conflict / Duplicate / Reflection Gapを検出 |
| 運用評価       | Agent Operation Logを記録              | Agent採用率・負荷・改善課題を分析                                  |
| Phase終了後   | 後続Phaseへ接続                          | 全Phase整合レビュー、設計仕様書、実装ロードマップへ移行                       |

Phase 7の中核は、AIに正本更新を任せることではありません。**AIが候補・Draft・警告を作り、人間が採用・反映・公開を決める構造を、長期運用できる形に整えること**です。

## Conversation Memory

### fact

* JP: Project Mnemosyneは、Markdown docsおよびADRを初期正本とし、Context Pack、検索結果、API、MCP Tool、Agent成果物およびAutomation出力を正本とは区別して扱う外部記憶基盤として整理されている。 / EN: Project Mnemosyne uses Markdown docs and ADRs as initial sources of truth, while Context Packs, search results, APIs, MCP tools, agent outputs, and automation outputs are kept separate from source documents.
* JP: Phase 1では記憶構造と運用、Phase 2ではContext Pack生成、Phase 3では検索補完、Phase 4ではMemory Gateway API、Phase 5ではMCP接続、Phase 6では役割別Agent運用の要件を作成した。 / EN: Requirements have been created for Phase 1 memory operations, Phase 2 Context Pack generation, Phase 3 retrieval, Phase 4 Memory Gateway API, Phase 5 MCP connectivity, and Phase 6 role-based agent operation.
* JP: 本回答では、Phase 7：Automation & Governanceの要件定義本文を、Phase別要件定義書へ追記可能な形式で作成した。 / EN: This response created the Phase 7: Automation & Governance requirements section in a form that can be appended to the phase requirements document.

### decision

* JP: Phase 7では、Conversation Summary Draft生成、Memory Candidate抽出、Doc Update Draft生成、Conflict / Staleness / Duplicate / Reflection Gap検出、Maintenance Report生成を半自動化対象とする。 / EN: Phase 7 targets semi-automation of conversation summary drafts, memory candidate extraction, document update drafts, conflict/staleness/duplicate/reflection-gap detection, and maintenance reports.
* JP: Phase 7で必須とするAutomation Levelは、L1の草案作成支援とL2の統制付き検出までとし、正本への自動反映は対象外とする。 / EN: Phase 7 requires only L1 drafting assistance and L2 controlled detection; automatic reflection into sources of truth is excluded.
* JP: `approved` と `reflected` を別状態として扱い、人間が採用判断しただけでは正本反映済みとみなさない。 / EN: `approved` and `reflected` are treated as separate states; human approval alone does not mean the source document has been updated.
* JP: Phase 7完了後は新たな機能Phaseを自動的に追加するのではなく、Phase 1〜7統合レビュー、設計仕様書化、実装ロードマップ作成へ進む。 / EN: After Phase 7, the project moves to integrated review, design specifications, and an implementation roadmap rather than automatically adding another functional phase.

### task

* JP: 次に、Phase 1〜7の統合整合レビューを作成し、成果物名、保存先、正本境界、引継ぎ関係、未決定事項の重複や矛盾を確認する。 / EN: Next, create an integrated consistency review for Phases 1 to 7, checking deliverable names, paths, source boundaries, handoffs, and overlapping or conflicting open issues.
* JP: 統合レビュー後に、`docs/design/system-design.md` と `docs/roadmap/implementation-roadmap.md` の作成へ進む。 / EN: After the integrated review, proceed to `docs/design/system-design.md` and `docs/roadmap/implementation-roadmap.md`.

### preference

* JP: 自動化は作業を速くするためだけでなく、正本境界・承認履歴・情報鮮度を維持できる範囲で段階的に導入する方針を重視する。 / EN: Automation is introduced step by step only where it preserves source boundaries, approval history, and information freshness.
* JP: AIに判断確定や正本更新を任せるのではなく、候補・Draft・警告を生成させ、人間が採用と反映を判断する運用を優先する。 / EN: The preferred operation is for AI to generate candidates, drafts, and warnings, while humans decide adoption and reflection.

### constraint

* JP: Phase 7では、正本自動反映、ADR自動採用、Task自動確定・完了、記憶自動削除、記事自動公開、Agent権限自動拡張、完全自律Agent orchestrationを対象外とする。 / EN: Phase 7 excludes automatic source reflection, automatic ADR acceptance, automatic task confirmation or completion, automatic memory deletion, automatic publication, automatic agent permission expansion, and fully autonomous agent orchestration.
* JP: Automation処理は入力source、生成候補、Draft、警告、review statusを追跡可能にし、`write_performed=true` となる自動処理を許可しない。 / EN: Automation must track input sources, generated candidates, drafts, warnings, and review status, and must not allow automated processing with `write_performed=true`.

### issue

* JP: Review Queue、Approval Record、Automation Auditの具体的な保存方式をMarkdown、構造化ファイル、DBのいずれとするかは未確定である。 / EN: The storage method for Review Queue, Approval Records, and Automation Audit remains undecided among Markdown, structured files, or a database.
* JP: L3のApproved Reflection Support、Governance ViewのUI化、Notion利用、定期自動実行、追加Phaseの要否は、統合レビューと運用検証後に判断する必要がある。 / EN: L3 approved reflection support, UI for governance views, Notion use, scheduled execution, and any additional phase must be decided after integrated review and operational validation.

### idea

* JP: Review QueueとApproval Recordを導入することで、AIが生成した候補を捨てずに管理しつつ、正本へ混入させない運用が可能になる。 / EN: A Review Queue and Approval Records can retain AI-generated candidates without letting them silently enter source documents.
* JP: Mnemosyne自身のPhase要件作成履歴とATSの実装・検証履歴をGovernance検証に用いることで、抽象設計と実プロジェクト運用の両面を評価できる。 / EN: Using Mnemosyne's phase requirements history and ATS implementation and validation history for governance tests allows evaluation of both abstract design and real project operation.

### article_note

* JP: AI外部記憶の自動化で本当に必要なのは、AIが勝手に覚える仕組みではなく、「何を候補にし、誰が承認し、どこへ反映され、古くなった情報をどう見つけるか」を管理できる統制構造である。 / EN: What matters in automating AI external memory is not letting AI remember freely, but governing what becomes a candidate, who approves it, where it is reflected, and how stale information is found.

### conversation_summary

* JP: 本チャットでは、Phase 1作業計画書を基準に全体要件定義書を再構成し、Phase別要件を段階的に作成してきた。Phase 1では正本構造、Phase 2ではContext Pack生成、Phase 3では検索補完、Phase 4ではAPI Gateway、Phase 5ではMCP Tool接続、Phase 6では役割別Agent運用を定義した。今回、Phase 7を、候補抽出・Draft生成・矛盾検出・棚卸しを半自動化しながら、人間承認と正本境界を維持するAutomation & Governanceフェーズとして定義し、要件定義後は全Phase統合レビューと設計仕様書化へ進む方針を整理した。 / EN: This chat rebuilt the overall requirements from the Phase 1 plan and defined each phase step by step. Phase 1 covers source-of-truth structure, Phase 2 Context Pack generation, Phase 3 retrieval, Phase 4 the API gateway, Phase 5 MCP tool connectivity, and Phase 6 role-based agent operation. This response defines Phase 7 as the Automation & Governance phase that semi-automates candidate extraction, drafting, conflict detection, and maintenance while keeping human approval and source boundaries, followed by integrated review and design specifications.

### test_result

* JP: Phase 7要件定義では、Phase 6で整理した半自動化候補と人間判断境界を基に、Automation Level、Review Queue、Approval Record、Reflection Gap、Conflict / Staleness / Duplicate検出、Maintenance Report、全Phase統合レビューおよび設計移行条件を具体化できた。 / EN: The Phase 7 requirements use the Phase 6 automation candidates and human-decision boundaries to specify automation levels, review queues, approval records, reflection-gap detection, conflict/staleness/duplicate detection, maintenance reports, integrated phase review, and conditions for moving into design.
