前回の `# 9. 次分冊で定義する範囲` は予告セクションであるため、正式文書へ統合する際は、以下の **`# 9. Phase 4：Memory Gateway`** に置き換え、末尾の `# 10` を次分冊の予告として残してください。

初期企画ではPhase 4を「CLIだけでなく、外部アプリや将来のMCP Serverから記憶を取得できるようにするフェーズ」とし、Context取得・Memory Search・Doc Update Draft作成のAPI候補が示されていました。今回の要件定義では、Phase 2のContext Pack生成とPhase 3のRetrieved Context検索をAPI経由で提供しつつ、**正本文書へのwriteを公開しないGateway境界**として再定義しています。 

# 9. Phase 4：Memory Gateway

## 副題：記憶への入口をAPI化する

---

## 9.1 Phase概要

| 項目         | 内容                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------- |
| Phase      | Phase 4                                                                                       |
| 名称         | Memory Gateway                                                                                |
| 副題         | 記憶への入口をAPI化する                                                                                 |
| 主目的        | Phase 1〜3で整備した正本参照、Context Pack生成および関連記憶検索を、外部アプリケーションや将来のMCP Serverから安全に利用できるHTTP APIとして提供する |
| 実装レベル      | API Contract、Application Service、Repository / Adapter、アクセス制御、監査・エラー処理                         |
| 主入力        | Project Registry、Agent Registry、正本文書、Context Builder、Recall Engine、Phase 4入力要件                |
| 主出力        | Memory API、Context API、Search API、Draft API、Phase 5接続仕様                                       |
| 初期利用者      | 個人開発者本人、ローカルまたは限定公開のクライアント                                                                    |
| 次Phaseとの接続 | Phase 5でMCP ToolをMemory Gateway APIへ接続する                                                      |

---

## 9.2 Phase 4の位置づけ

Phase 1では、記憶の正本構造、分類、状態管理、更新ルールおよびAI操作境界を定義した。

Phase 2では、`Project × Agent × Task` に応じたContext Packを生成できるようにした。

Phase 3では、固定読み込みだけでは不足する関連記憶を検索し、根拠付きの `Retrieved Context` としてContext Packへ追加できるようにした。

Phase 4では、これらの機能をCLI内部利用に留めず、外部クライアントから一貫した契約で利用できるAPIとして公開する。

```text
Phase 1：
何を正本とし、どう記憶するかを決める

Phase 2：
正本から作業用Context Packを生成する

Phase 3：
必要な追加記憶を検索してContext Packを補完する

Phase 4：
Context取得・検索・draft作成を
安全なAPI境界として外部へ提供する
```

Phase 4は、AIクライアントを直接接続するPhaseではない。
ChatGPT、Cursor、Claude等から自然に利用するためのMCP接続はPhase 5で扱う。

---

## 9.3 Phase 4の重要な設計整理

### 9.3.1 Memory Gatewayは接続口であり、正本ではない

Memory Gatewayは、正本文書、Context BuilderおよびRecall Engineの機能を外部から利用可能にするための接続口である。

APIが返すレスポンス、Context Pack、Search Result ContextおよびDoc Update Draftは、正本そのものではない。

| 対象                    | Phase 4での扱い              |
| --------------------- | ------------------------ |
| Markdown docs / ADR   | APIが参照する正本               |
| Registry              | APIが参照する構成定義             |
| Recall Engine Index   | 検索用副本                    |
| API Response          | 外部利用向け返却データ              |
| Context Pack          | AI入力用生成物                 |
| Search Result Context | 正本から抽出した検索結果生成物          |
| Doc Update Draft      | 人間レビュー前の更新候補             |
| MCP Server            | Phase 5で接続する外部クライアント向け窓口 |

### 9.3.2 API操作を Read / Generate / Draft に限定する

Phase 4では、外部公開する操作を以下の3区分に限定する。

| 操作区分          | 内容                                               |         許可 |
| ------------- | ------------------------------------------------ | ---------: |
| Read          | Project Status、Active Decisions、Next Actions等の取得 |         許可 |
| Generate      | Context Pack、Search Result、Preview等の生成           |         許可 |
| Draft         | 正本更新候補となる草案の作成・保存                                |         許可 |
| Reflect       | draft内容を正本へ反映する                                  | Phase 4対象外 |
| Delete Source | 正本文書またはADRを削除する                                  |         禁止 |

```text
Memory Gatewayができること：
参照する
検索する
Contextを生成する
更新案をdraftとして作る

Memory Gatewayがしないこと：
正本を承認なしに変更する
ADRを自動採用する
タスクを自動確定する
正本を削除する
```

### 9.3.3 Notion連携はPhase 4の必須範囲としない

初期構想では、Phase 4の構成要素候補にNotion Serviceが含まれていた。

しかし、Phase 1以降の方針では、初期正本をMarkdown docsおよびADRとし、Notionは必要性が確認された場合の副本または運用ビューとして扱う。

そのため、Phase 4の必須API入力元は以下とする。

* Markdown正本文書
* ADR
* Project Registry
* Agent Registry
* Context Builder
* Recall Engineの検索索引

Notion取得API、Notion同期APIおよびNotionを入力元とするContext生成は、初期必須範囲に含めない。

### 9.3.4 Phase 5はMemory Gatewayを経由して利用する

Phase 5でMCP Serverを実装する場合、MCP Toolが正本文書や検索索引へ直接アクセスする構成は採用しない。

```text
AI Client
  ↓
MCP Server
  ↓
Memory Gateway API
  ↓
Context Builder / Recall Engine / Source Documents
```

この境界により、MCP以外のクライアントを追加しても、正本参照ルール、検索制御、write policyおよび監査方式を共通化できる。

---

## 9.4 Phase 4の目的

### 9.4.1 主目的

```text
Phase 1〜3で構築した記憶参照・Context生成・関連記憶検索の機能を、
外部クライアントから安全かつ追跡可能に利用できるMemory APIとして提供し、
Phase 5のMCP接続に必要な安定したサービス境界を確立する。
```

### 9.4.2 具体目的

| ID         | 目的                                                                         |
| ---------- | -------------------------------------------------------------------------- |
| P4-OBJ-001 | Project Context、Current Status、Active Decisions、Next ActionsをAPI経由で取得可能にする |
| P4-OBJ-002 | `Project × Agent × Task` に基づくContext Pack生成をAPI経由で実行可能にする                  |
| P4-OBJ-003 | Recall Engineによる関連記憶検索をAPI経由で実行可能にする                                       |
| P4-OBJ-004 | Retrieved Contextを含むContext PackをAPI経由で生成可能にする                             |
| P4-OBJ-005 | AIまたは外部クライアントが、正本を直接変更せずDoc Update Draftのみ作成できるようにする                       |
| P4-OBJ-006 | すべてのAPIレスポンスで出典、状態、警告およびwrite policyを追跡可能にする                               |
| P4-OBJ-007 | 認証・認可・入力検証・エラー処理・監査記録の最低要件を定義する                                            |
| P4-OBJ-008 | Phase 5のMCP Toolが対応づけ可能なAPI契約を確立する                                         |
| P4-OBJ-009 | MnemosyneおよびATSに対して、API経由でContext取得・検索・draft生成が成立することを検証する                 |

---

## 9.5 Phase 4で解決する課題

| 課題ID       | 課題                                  | Phase 4での解決内容                               |
| ---------- | ----------------------------------- | ------------------------------------------- |
| P4-ISS-001 | Context Pack生成や検索がCLI実行者に限定される      | HTTP APIとして利用可能にする                          |
| P4-ISS-002 | 将来のMCP実装が内部ファイル構造へ直接依存する恐れがある       | API契約を先に定義し、MCPはGateway経由とする                |
| P4-ISS-003 | Context取得、検索、draft作成の入出力形式が統一されていない | API Request / Response Contractを定義する        |
| P4-ISS-004 | 外部利用時にAIの操作境界が崩れる恐れがある              | read / generate / draftのみを公開し、正本writeを公開しない |
| P4-ISS-005 | 検索結果の根拠や鮮度が外部利用時に見えなくなる             | 出典・status・warning・index状態をAPIレスポンスへ含める      |
| P4-ISS-006 | 無効なProjectやAgent、未索引状態で処理が不透明になる    | エラー応答契約を定義する                                |
| P4-ISS-007 | APIが外部公開された場合のアクセス制御が必要になる          | 認証・認可要件を定義する                                |
| P4-ISS-008 | draftが正本へ誤反映される恐れがある                | Draft専用保存・明示的な未承認状態・反映API非提供を徹底する           |

---

## 9.6 Phase 4の前提条件

| ID         | 前提条件                                                                 |
| ---------- | -------------------------------------------------------------------- |
| P4-PRE-001 | Phase 3が `Go` または `Conditional Go` と判定されていること                        |
| P4-PRE-002 | Phase 1で正本・副本・AI更新権限が定義されていること                                       |
| P4-PRE-003 | Phase 2でContext Pack標準構造、Project RegistryおよびAgent Registryが定義されていること |
| P4-PRE-004 | Phase 2でContext BuilderがContext Packを生成できること                         |
| P4-PRE-005 | Phase 3でMemory SearchおよびRetrieved Context生成が可能であること                  |
| P4-PRE-006 | Phase 3でsource path、status、updated_at等のmetadataを返却できること              |
| P4-PRE-007 | `phase-4-input-requirements.md` に検索・Context取得のAPI化要件が整理されていること       |
| P4-PRE-008 | API経由であっても正本writeを直接許可しない方針が維持されていること                                |

---

## 9.7 Phase 4の対象範囲

### 9.7.1 対象に含めるもの

| 分類                  | 対象内容                                                                      |
| ------------------- | ------------------------------------------------------------------------- |
| API方針               | REST APIの基本構成、バージョニング、操作区分                                                |
| Project取得           | Project一覧、Project Context、Current Status、Active Decisions、Next Actionsの取得 |
| Context生成           | Context Pack PreviewおよびContext Pack生成                                     |
| Search提供            | Memory SearchおよびSearch PreviewのAPI化                                       |
| Retrieved Context連携 | 検索結果を含むContext Pack生成                                                     |
| Draft作成             | Doc Update Draftの生成・保存・参照                                                 |
| 出典管理                | source path、status、updated_at、warningsの返却                                 |
| セキュリティ              | 認証、認可、入力検証、write boundary                                                 |
| エラー設計               | エラーコード、HTTP status、利用者向けメッセージ                                             |
| 監査・追跡               | API実行、生成物、参照元、draft作成の追跡                                                  |
| 検証                  | MnemosyneおよびATSに対するAPI利用検証                                                |
| Phase 5準備           | MCP ToolとAPI endpointの対応整理                                                |

### 9.7.2 対象に含めないもの

| 対象外                             | 理由                             |
| ------------------------------- | ------------------------------ |
| MCP Server                      | Phase 5で扱うため                   |
| ChatGPT / Cursor / Claudeとの直接接続 | MCP等の接続口実装後に扱うため               |
| 正本文書へのwrite API                 | 人間承認境界を維持するため                  |
| ADRの自動Accepted化                 | 設計判断の正本反映には人間判断が必要なため          |
| Taskの自動確定・完了更新                  | 正本変更に該当するため                    |
| Notion同期API                     | Notionを初期正本としないため              |
| Web UI                          | API契約とMCP接続の成立確認後に検討するため       |
| 複数ユーザー向け高度な権限管理                 | 初期の個人利用スコープを超えるため              |
| Agent自律実行・Agent orchestration   | Phase 4は記憶Gatewayであり実行基盤ではないため |
| 自動承認ワークフロー                      | Automation / Governance側で扱うため  |

---

## 9.8 Phase 4 API設計原則

### 9.8.1 APIバージョニング

将来のMCP Tool、外部アプリおよびUIから安定して利用できるよう、API endpointにはバージョンを含める。

```text
/api/v1/
```

### 9.8.2 API操作分類

| 区分               | endpointの性質               | 正本への影響         |
| ---------------- | ------------------------- | -------------- |
| Query API        | 状態・判断・タスク等を取得する           | 影響なし           |
| Search API       | Recall Engineで関連記憶を検索する   | 影響なし           |
| Generation API   | Context PackやPreviewを生成する | 正本には影響なし       |
| Draft API        | 更新候補の草案を作成・保持する           | 正本には影響なし       |
| Source Write API | 正本を更新する                   | Phase 4では提供しない |

### 9.8.3 APIレスポンス共通原則

すべての主要APIレスポンスは、可能な範囲で以下を含む。

| 項目                 | 内容                    |
| ------------------ | --------------------- |
| `request_id`       | API実行を追跡する識別子         |
| `generated_at`     | レスポンスまたは生成物の生成日時      |
| `project_code`     | 対象Project             |
| `agent_code`       | Agentを指定した場合のAgent識別子 |
| `source_documents` | 参照元文書一覧               |
| `source_statuses`  | 参照した情報の状態             |
| `warnings`         | 鮮度、未確定情報、索引状態等の注意事項   |
| `write_policy`     | AIまたはクライアントに許可する操作境界  |

### 9.8.4 正本write非公開原則

Phase 4では、以下のendpointを提供しない。

```http
PUT    /api/v1/projects/{projectCode}/memory/*
PATCH  /api/v1/projects/{projectCode}/memory/*
DELETE /api/v1/projects/{projectCode}/memory/*
POST   /api/v1/adrs/{adrId}/accept
POST   /api/v1/tasks/{taskId}/complete
```

Doc Update Draftは、正本へ反映されていない未承認の更新候補としてのみ扱う。

---

## 9.9 Phase 4 API一覧

### 9.9.1 必須API

| API ID     | Method | Endpoint                                      | 目的                           | 操作区分       |
| ---------- | ------ | --------------------------------------------- | ---------------------------- | ---------- |
| P4-API-001 | GET    | `/api/v1/projects`                            | 利用可能なProject一覧を取得する          | Query      |
| P4-API-002 | GET    | `/api/v1/projects/{projectCode}/context`      | 基本Project Contextを取得する       | Query      |
| P4-API-003 | GET    | `/api/v1/projects/{projectCode}/status`       | Current Statusを取得する          | Query      |
| P4-API-004 | GET    | `/api/v1/projects/{projectCode}/decisions`    | Active Decisionsを取得する        | Query      |
| P4-API-005 | GET    | `/api/v1/projects/{projectCode}/next-actions` | Next Actionsを取得する            | Query      |
| P4-API-006 | POST   | `/api/v1/context-packs/preview`               | Context Pack生成前の参照内容を確認する    | Generation |
| P4-API-007 | POST   | `/api/v1/context-packs`                       | Context Packを生成する            | Generation |
| P4-API-008 | POST   | `/api/v1/memory/search/preview`               | 検索結果候補と警告を確認する               | Search     |
| P4-API-009 | POST   | `/api/v1/memory/search`                       | 関連記憶を検索しRetrieved Contextを返す | Search     |
| P4-API-010 | POST   | `/api/v1/doc-update-drafts`                   | 正本文書の更新草案を作成する               | Draft      |
| P4-API-011 | GET    | `/api/v1/doc-update-drafts/{draftId}`         | 作成済みdraftを参照する               | Query      |
| P4-API-012 | GET    | `/api/v1/health`                              | APIおよび依存機能の稼働状況を確認する         | Query      |

### 9.9.2 Phase 4で提供しないAPI

| API候補             | 提供しない理由                          |
| ----------------- | -------------------------------- |
| 正本文書更新API         | 人間承認後の手動反映方針を維持するため              |
| ADR採用API          | 判断採用を自動化しないため                    |
| Task状態更新API       | `next-actions.md` 正本を無承認で更新しないため |
| Notion同期API       | Notion連携を初期必須としないため              |
| MCP Tool endpoint | MCP ServerはPhase 5で扱うため          |

---

## 9.10 Phase 4機能要件

### P4-FR-001 Project一覧取得

登録されているProjectのうち、利用可能な対象をAPI経由で取得できること。

#### Endpoint

```http
GET /api/v1/projects
```

#### 返却対象

| 項目                  | 内容                 |
| ------------------- | ------------------ |
| `project_code`      | Project識別子         |
| `project_name`      | 表示名称               |
| `status`            | active / archived等 |
| `available_context` | Context取得可否        |
| `search_available`  | 索引が存在し検索可能か        |
| `last_indexed_at`   | 最終索引日時。検索対象の場合     |
| `warnings`          | 記憶文書不足、索引未作成等      |

#### 初期対象

* `mnemosyne`
* `ats`

---

### P4-FR-002 Project Context取得

指定されたProjectの基本Contextを、正本文書の出典付きで取得できること。

#### Endpoint

```http
GET /api/v1/projects/{projectCode}/context
```

#### 取得対象

| 情報                  | 主な参照元                    |
| ------------------- | ------------------------ |
| Project Summary     | `project-summary.md`     |
| Current Status      | `current-status.md`      |
| Active Decisions    | `active-decisions.md`    |
| Next Actions        | `next-actions.md`        |
| AI Entrypoint       | `ai-entrypoint.md`       |
| Project Constraints | Registryおよびmemory policy |

#### Response要件

* Project Contextの本文を返せること。
* 各Context要素の参照元パスを返せること。
* 欠落している必須文書がある場合はwarningを返すこと。
* `draft` または状態不明の情報が含まれる場合は明示すること。
* Context Packではなく、Project固有の基本Context取得APIとして扱うこと。

---

### P4-FR-003 Current Status取得

指定されたProjectの現在状況を取得できること。

#### Endpoint

```http
GET /api/v1/projects/{projectCode}/status
```

#### Response要件

| 項目                  | 内容         |
| ------------------- | ---------- |
| `current_phase`     | 現在のPhase   |
| `current_objective` | 現在の目的      |
| `in_progress`       | 進行中事項      |
| `blockers`          | 課題またはブロッカー |
| `pending_decisions` | 判断待ち事項     |
| `updated_at`        | 更新日時       |
| `source_path`       | 正本文書の参照先   |
| `status`            | 情報の状態      |

---

### P4-FR-004 Active Decisions取得

指定されたProjectの現在有効な判断を取得できること。

#### Endpoint

```http
GET /api/v1/projects/{projectCode}/decisions
```

#### Query候補

| Query                  | 内容                       |
| ---------------------- | ------------------------ |
| `includeHistory=false` | 通常はactive / acceptedのみ返す |
| `includeHistory=true`  | superseded等の履歴を含める       |
| `adr=true`             | 関連ADRの要約または参照情報を含める      |

#### Response要件

* 通常取得では現在有効な判断のみを優先すること。
* 履歴を返す場合は現在有効な判断と混同しない表示にすること。
* ADRが存在する場合は参照先を返すこと。
* `superseded` または `deprecated` の情報を返す場合はwarningを含めること。

---

### P4-FR-005 Next Actions取得

指定されたProjectの次アクションを取得できること。

#### Endpoint

```http
GET /api/v1/projects/{projectCode}/next-actions
```

#### Response要件

| 項目                    | 内容                    |
| --------------------- | --------------------- |
| `priority`            | P0 / P1 / P2 / Later等 |
| `task`                | 作業内容                  |
| `purpose`             | 作業目的                  |
| `output`              | 期待成果物                 |
| `completion_criteria` | 完了条件                  |
| `task_status`         | 未着手 / 進行中 / 保留等       |
| `source_path`         | `next-actions.md` 参照先 |
| `updated_at`          | 更新日時                  |

#### 制約

* APIはNext Actionsを読み取るのみとする。
* タスクの完了更新、追加確定、優先順位変更はPhase 4 APIで正本へ反映しない。
* 更新提案が必要な場合はDoc Update Draftとして作成する。

---

### P4-FR-006 Context Pack Preview生成

Context Packを生成する前に、選択されたProject、Agent、Task、参照予定文書、検索予定条件および警告をAPI経由で確認できること。

#### Endpoint

```http
POST /api/v1/context-packs/preview
```

#### Request例

```json
{
  "project_code": "ats",
  "agent_code": "implementation_reviewer",
  "task_context": {
    "task_title": "action_select設計レビュー",
    "task_request": "責務分離、トランザクション境界、冪等性の観点でレビューする",
    "expected_output": "レビュー報告書",
    "target_files": [
      "docs/usecase-contracts.md",
      "docs/domain-rules.md"
    ],
    "constraints": [
      "正本は直接更新しない"
    ]
  },
  "retrieval": {
    "enabled": true,
    "query": "action_select のトランザクション境界と冪等性",
    "top_k": 5
  }
}
```

#### Response要件

| 項目                 | 内容                      |
| ------------------ | ----------------------- |
| `selected_project` | 対象Project               |
| `selected_agent`   | 対象Agent                 |
| `task_summary`     | 入力Taskの概要               |
| `required_sources` | 必須参照文書                  |
| `optional_sources` | 条件により参照する文書             |
| `retrieval_plan`   | 検索の有無、query、filter、上限件数 |
| `warnings`         | 文書欠落、索引未作成、未確定情報等       |
| `write_policy`     | `draft_only` 等          |
| `can_generate`     | Context Pack生成可否        |

---

### P4-FR-007 Context Pack生成

指定されたProject、AgentおよびTask Contextに基づき、Context PackをAPI経由で生成できること。

#### Endpoint

```http
POST /api/v1/context-packs
```

#### 処理対象

```text
Project Registry
  +
Agent Registry
  +
Task Context
  +
Phase 1正本文書
  +
必要に応じたRetrieved Context
  ↓
Context Pack生成
```

#### Response要件

| 項目                 | 内容                |
| ------------------ | ----------------- |
| `context_pack_id`  | 生成物識別子            |
| `generated_at`     | 生成日時              |
| `project_code`     | 対象Project         |
| `agent_code`       | 対象Agent           |
| `task_title`       | 対象Task            |
| `context_pack`     | 生成本文または参照先        |
| `retrieval_used`   | Recall Engine利用有無 |
| `source_documents` | 参照元文書             |
| `warnings`         | 鮮度・欠落・未確定情報等      |
| `write_policy`     | AI操作境界            |

#### 制約

* Context Packは生成物であり正本ではない。
* Context Pack生成処理は正本文書を変更しない。
* Context Pack内に新しい判断やタスクが生じても、正本反映前は確定情報として扱わない。

---

### P4-FR-008 Memory Search Preview

Recall Engineによる検索結果をContext Packへ利用する前に、取得候補、除外候補および警告をAPI経由で確認できること。

#### Endpoint

```http
POST /api/v1/memory/search/preview
```

#### Request項目

| 項目                | 内容                   |
| ----------------- | -------------------- |
| `project_code`    | 検索対象Project          |
| `agent_code`      | Agent検索プロファイルを適用する場合 |
| `query`           | 検索クエリ                |
| `source_types`    | 文書種別フィルタ             |
| `memory_types`    | 記憶種別フィルタ             |
| `statuses`        | 情報状態フィルタ             |
| `top_k`           | 結果候補数                |
| `include_history` | 履歴情報を含めるか            |

#### Response要件

* Contextへ含める候補結果を表示できること。
* 除外された結果と除外理由を確認できること。
* `draft`、`superseded`、`deprecated` 等の情報に対するwarningを返せること。
* 索引未作成または索引が古い場合に警告できること。

---

### P4-FR-009 Memory Search実行

指定されたProjectおよび検索条件に基づき、関連記憶をRetrieved Context形式で返却できること。

#### Endpoint

```http
POST /api/v1/memory/search
```

#### Request例

```json
{
  "project_code": "mnemosyne",
  "agent_code": "requirements_reviewer",
  "query": "Phase 2でContext Packをどの単位で生成すると決めたか",
  "filters": {
    "source_types": [
      "adr",
      "phase_document",
      "project_memory"
    ],
    "statuses": [
      "active",
      "accepted"
    ]
  },
  "top_k": 5,
  "include_history": false
}
```

#### Response要件

| 項目                    | 内容                      |
| --------------------- | ----------------------- |
| `search_id`           | 検索実行識別子                 |
| `project_code`        | 対象Project               |
| `agent_code`          | 適用Agent                 |
| `query`               | 実行クエリ                   |
| `filters`             | 適用した条件                  |
| `results`             | 関連記憶一覧                  |
| `warnings`            | 鮮度、競合、索引状態等             |
| `retrieved_context`   | Context Packへ組込み可能な整形結果 |
| `source_traceability` | 出典確認情報                  |

#### Result要件

検索結果単位で以下を返せること。

| 項目                | 内容                         |
| ----------------- | -------------------------- |
| `source_path`     | 元文書                        |
| `source_type`     | ADR、review、project memory等 |
| `section_heading` | 元文書内の位置                    |
| `status`          | active / accepted等         |
| `updated_at`      | 更新日時                       |
| `relevance`       | 関連度または順位情報                 |
| `content`         | 関連本文                       |
| `reason_selected` | 選定理由または適用ルール               |

---

### P4-FR-010 Doc Update Draft作成

AIまたは外部クライアントが、正本文書に対する修正案をDraftとして作成できること。

#### Endpoint

```http
POST /api/v1/doc-update-drafts
```

#### 目的

以下のような提案を、正本へ反映せずレビュー対象として保持する。

* `current-status.md` の更新案
* `next-actions.md` のタスク追加・変更案
* `active-decisions.md` の更新案
* ADR新規作成案
* 設計文書の差分案
* Conversation Summaryから抽出された正本反映候補

#### Request要件

| 項目                   | 内容                                                    |
| -------------------- | ----------------------------------------------------- |
| `project_code`       | 対象Project                                             |
| `draft_type`         | update / new_document / adr_proposal / task_proposal等 |
| `target_source_path` | 対象正本文書。新規文書案の場合は想定保存先                                 |
| `title`              | draft名称                                               |
| `reason`             | 更新案を作成する理由                                            |
| `proposed_content`   | 更新後全文または差分案                                           |
| `based_on_sources`   | 根拠となる正本文書・検索結果                                        |
| `created_by`         | user / ai / client等                                   |
| `review_points`      | 人間確認観点                                                |

#### Response要件

| 項目                     | 内容             |
| ---------------------- | -------------- |
| `draft_id`             | Draft識別子       |
| `draft_status`         | 必ず `draft` とする |
| `project_code`         | 対象Project      |
| `target_source_path`   | 対象正本文書         |
| `created_at`           | 作成日時           |
| `based_on_sources`     | 根拠情報           |
| `write_policy`         | 正本未反映である旨      |
| `next_required_action` | 人間レビューが必要である旨  |

#### 制約

* Draft作成により正本文書を変更しない。
* Draft作成によりADRをAccepted扱いにしない。
* Draft作成によりTaskを確定・完了扱いにしない。
* Draft反映APIはPhase 4で提供しない。

---

### P4-FR-011 Doc Update Draft参照

作成済みのDoc Update Draftを、レビューのために取得できること。

#### Endpoint

```http
GET /api/v1/doc-update-drafts/{draftId}
```

#### Response要件

* draft本文または差分案を返せること。
* 対象正本文書と根拠情報を返せること。
* 正本へ未反映であることを明示すること。
* 人間レビュー後の取り扱いはAPI外の運用として区別すること。

---

### P4-FR-012 Healthおよび依存状態確認

Memory Gatewayの稼働状況および主要依存機能の利用可能性を確認できること。

#### Endpoint

```http
GET /api/v1/health
```

#### 確認対象

| 対象               | 確認内容                  |
| ---------------- | --------------------- |
| API Server       | 応答可能であること             |
| Project Registry | 読み込み可能であること           |
| Agent Registry   | 読み込み可能であること           |
| Source Documents | 必須文書ルートへアクセス可能であること   |
| Context Builder  | Context生成利用可否         |
| Recall Engine    | Search利用可否            |
| Search Index     | Project単位の索引有無および更新日時 |
| Draft Storage    | Draft保存機能の利用可否        |

#### 制約

* Health APIは機密な文書本文を返さない。
* 外部公開時は、内部パスや詳細エラー情報の露出を抑制する。

---

### P4-FR-013 認証および認可

Memory Gatewayが外部クライアントから利用される場合、許可されたクライアントのみがAPIを利用できること。

#### 初期要件

| 項目              | 要件                                      |
| --------------- | --------------------------------------- |
| Authentication  | API利用者またはクライアントを識別できること                 |
| Authorization   | 許可された操作区分のみ実行できること                      |
| Read Access     | Project ContextおよびSearchを許可対象として制御できること |
| Draft Access    | Draft作成を許可対象として制御できること                  |
| Source Write    | 認証済みであってもPhase 4では提供しないこと               |
| Secret Handling | API key等をリポジトリへ平文で保持しないこと               |

#### 初期権限区分候補

| 権限             | 許可操作                                             |
| -------------- | ------------------------------------------------ |
| `read`         | Project Context、Status、Decisions、Next Actionsの取得 |
| `search`       | Memory SearchおよびSearch Preview                   |
| `generate`     | Context PackおよびPreview生成                         |
| `draft`        | Doc Update Draft作成および参照                          |
| `source_write` | Phase 4では定義しない                                   |

認証方式の具体技術は、設計仕様書で確定する。

---

### P4-FR-014 API入力検証

APIは、不正または不完全な入力による誤ったContext生成・検索・Draft作成を防ぐため、入力検証を行えること。

#### 必須検証

| 入力                   | 検証内容                  |
| -------------------- | --------------------- |
| `project_code`       | Registryに存在し利用可能であること |
| `agent_code`         | Registryに存在し利用可能であること |
| `task_context`       | 必須項目が存在すること           |
| `query`              | 空文字または不正な形式でないこと      |
| `statuses`           | 許可された状態値であること         |
| `top_k`              | 許容範囲内であること            |
| `target_source_path` | 許可された正本文書範囲であること      |
| `draft_type`         | 許可された種類であること          |
| `proposed_content`   | 空でないこと、およびサイズ制限内であること |

#### 検証失敗時の原則

* 処理を実行しないこと。
* 正本文書、索引およびDraft Storageへ副作用を生じさせないこと。
* 利用者が修正可能なエラー情報を返すこと。

---

### P4-FR-015 エラー応答契約

Memory Gatewayは、失敗内容を利用者および後続のMCP Serverが判断できる形式で返却できること。

#### エラーResponse標準構成

```json
{
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "Specified project is not registered.",
    "details": {
      "project_code": "unknown-project"
    },
    "retryable": false
  },
  "request_id": "req_xxxxx",
  "generated_at": "2026-06-03T12:00:00+09:00"
}
```

#### 必須エラー分類

| Error Code                  |          HTTP Status候補 | 内容                |
| --------------------------- | ---------------------: | ----------------- |
| `INVALID_REQUEST`           |                    400 | 入力形式が不正           |
| `AUTHENTICATION_REQUIRED`   |                    401 | 認証が必要             |
| `FORBIDDEN_OPERATION`       |                    403 | 権限外操作または正本write要求 |
| `PROJECT_NOT_FOUND`         |                    404 | Projectが存在しない     |
| `AGENT_NOT_FOUND`           |                    404 | Agentが存在しない       |
| `SOURCE_DOCUMENT_NOT_FOUND` |              404 / 422 | 必須文書が不足           |
| `DRAFT_NOT_FOUND`           |                    404 | Draftが存在しない       |
| `SEARCH_INDEX_NOT_READY`    |              409 / 503 | 索引未作成または利用不可      |
| `STALE_INDEX_WARNING`       | 200 with warning / 409 | 正本より索引が古い         |
| `CONTEXT_GENERATION_FAILED` |                    500 | Context生成失敗       |
| `SEARCH_FAILED`             |                    500 | Recall Engine処理失敗 |
| `DRAFT_CREATION_FAILED`     |                    500 | Draft作成失敗         |

#### 原則

* 正本writeを要求する操作は `FORBIDDEN_OPERATION` として拒否する。
* 警告のみで利用継続可能な場合は、成功Response内の `warnings` として返す。
* 内部スタックトレースや機密情報を外部Responseへ含めない。

---

### P4-FR-016 監査および追跡情報

API経由で実施されたContext生成、検索およびDraft作成について、後から参照元と実行内容を確認できること。

#### 追跡対象

| 操作                 | 記録対象                                         |
| ------------------ | -------------------------------------------- |
| Project Context取得  | request id、project、参照文書、warning              |
| Context Pack生成     | project、agent、task、source docs、retrieval利用有無 |
| Memory Search      | project、agent、query、filter、返却結果概要            |
| Doc Update Draft作成 | target source、根拠文書、draft id、作成者区分            |
| エラー                | error code、対象操作、request id                   |

#### 制約

* 監査ログは正本文書とは別に扱う。
* 監査ログに正本文書の全文を不必要に複製しない。
* API keyその他のsecretを監査ログに記録しない。

監査ログの保存方式および保存期間は、設計仕様書または運用仕様書で確定する。

---

### P4-FR-017 Phase 5接続仕様整理

Phase 5でMCP Serverを実装できるよう、MCP Tool候補とMemory Gateway APIの対応を整理できること。

#### MCP ToolとAPIの対応候補

| Phase 5 MCP Tool候補        | Phase 4 API                                       |
| ------------------------- | ------------------------------------------------- |
| `list_projects`           | `GET /api/v1/projects`                            |
| `get_project_context`     | `GET /api/v1/projects/{projectCode}/context`      |
| `get_current_status`      | `GET /api/v1/projects/{projectCode}/status`       |
| `list_active_decisions`   | `GET /api/v1/projects/{projectCode}/decisions`    |
| `list_next_actions`       | `GET /api/v1/projects/{projectCode}/next-actions` |
| `preview_context_pack`    | `POST /api/v1/context-packs/preview`              |
| `build_context_pack`      | `POST /api/v1/context-packs`                      |
| `preview_memory_search`   | `POST /api/v1/memory/search/preview`              |
| `search_project_memory`   | `POST /api/v1/memory/search`                      |
| `create_doc_update_draft` | `POST /api/v1/doc-update-drafts`                  |
| `get_doc_update_draft`    | `GET /api/v1/doc-update-drafts/{draftId}`         |

#### 接続原則

* MCP ToolはMemory Gateway APIを経由して機能を利用する。
* MCP Serverは正本文書へ直接writeしない。
* MCP Toolの許可範囲はPhase 4のAPI操作境界を超えない。
* MCP Toolが作成できる更新内容はDraftまでとする。

#### 対応成果物

```text
docs/phases/phase-5-input-requirements.md
docs/gateway/mcp-api-mapping.md
```

---

## 9.11 Phase 4非機能要件

| ID         | 非機能要件      | 内容                                                                  |
| ---------- | ---------- | ------------------------------------------------------------------- |
| P4-NFR-001 | API契約安定性   | MCPや外部クライアントが依存できるよう、versioned endpointを提供すること                      |
| P4-NFR-002 | 正本非改変性     | Read、Search、Generation、Draft APIの実行により正本文書が変更されないこと                 |
| P4-NFR-003 | 安全性        | API経由であっても正本writeおよびdeleteを提供しないこと                                  |
| P4-NFR-004 | 認証性        | 外部利用時に未許可クライアントのアクセスを防止できること                                        |
| P4-NFR-005 | 権限制御       | read、search、generate、draftの操作区分に基づき利用範囲を制御できること                     |
| P4-NFR-006 | 根拠追跡性      | APIレスポンスから参照元文書、状態およびwarningを確認できること                                |
| P4-NFR-007 | 情報鮮度       | 索引が正本より古い場合、または古い判断を含む場合に利用者へ通知できること                                |
| P4-NFR-008 | エラー明示性     | 不正入力、対象不存在、索引未準備等を明示的なエラーとして返せること                                   |
| P4-NFR-009 | Project分離性 | API要求で指定したProject以外の記憶を意図せず混入させないこと                                 |
| P4-NFR-010 | Agent整合性   | Agent指定時はRegistryで定義したContextおよび検索方針を適用すること                         |
| P4-NFR-011 | 可監査性       | Context生成、検索およびDraft作成の実行記録を追跡可能にすること                               |
| P4-NFR-012 | 機密保護       | secret、内部エラー詳細および許可されていない文書内容をレスポンスやログへ漏えいさせないこと                    |
| P4-NFR-013 | 拡張性        | Phase 5のMCP Server、将来のUIまたは他クライアントから同一APIを利用できること                   |
| P4-NFR-014 | 可搬性        | Context PackおよびRetrieved ContextをMarkdownまたは構造化Responseとして利用可能にすること |
| P4-NFR-015 | 運用負荷抑制     | API追加によって正本管理方式や人間承認手順を複雑化させすぎないこと                                  |

---

## 9.12 Phase 4制約

| ID       | 制約                                                     |
| -------- | ------------------------------------------------------ |
| P4-C-001 | Memory Gatewayは正本ではなく、正本利用のためのAPI境界とする                 |
| P4-C-002 | Phase 4で公開する操作は、read、search、generate、draftに限定する        |
| P4-C-003 | 正本文書、ADR、Next Actions等を直接変更するAPIを提供しない                 |
| P4-C-004 | Doc Update Draftは正本へ未反映の候補として扱う                        |
| P4-C-005 | Context PackおよびSearch Result Contextを正本として扱わない         |
| P4-C-006 | Notion連携をPhase 4必須機能としない                               |
| P4-C-007 | MCP ServerをPhase 4で実装しない                               |
| P4-C-008 | Agentの自律実行または複数Agent統括をPhase 4で実装しない                   |
| P4-C-009 | API利用時もPhase 1で定義したstatusおよび参照優先順位を維持する                |
| P4-C-010 | Phase 4のAPIは、Phase 5のMCP Toolが内部正本へ直接アクセスしなくて済む契約を提供する |
| P4-C-011 | 外部公開する場合は、認証なしの状態で正本内容、検索結果またはdraft作成機能を公開しない          |
| P4-C-012 | API実装技術、認証方式、Draft Storage方式の具体選定は設計仕様書で確定する           |

---

## 9.13 Phase 4成果物

### 9.13.1 必須成果物

#### A. Memory Gateway仕様文書

| ファイル                                    | 目的                                                      |
| --------------------------------------- | ------------------------------------------------------- |
| `docs/gateway/api-overview.md`          | Memory Gateway全体の目的、操作区分、endpoint一覧を定義する                |
| `docs/gateway/api-contract.md`          | 共通Request / Response、versioning、metadata規約を定義する         |
| `docs/gateway/project-context-api.md`   | Project Context、Status、Decisions、Next Actions取得APIを定義する |
| `docs/gateway/context-pack-api.md`      | Context PreviewおよびContext Pack生成APIを定義する                |
| `docs/gateway/memory-search-api.md`     | Search PreviewおよびMemory Search APIを定義する                 |
| `docs/gateway/doc-update-draft-api.md`  | Doc Update Draft作成・参照APIを定義する                           |
| `docs/gateway/auth-and-write-policy.md` | 認証、認可、操作境界、正本write禁止方針を定義する                             |
| `docs/gateway/error-response-policy.md` | エラー分類、status code、warning方針を定義する                        |
| `docs/gateway/audit-policy.md`          | 実行追跡および監査記録の対象を定義する                                     |
| `docs/gateway/mcp-api-mapping.md`       | Phase 5 MCP ToolとAPIの対応を定義する                            |

#### B. API実装

| ファイル                                              | 目的                                                   |
| ------------------------------------------------- | ---------------------------------------------------- |
| `src/api/routes/projectRoutes.ts`                 | Project Context、Status、Decisions、Next Actions取得route |
| `src/api/routes/contextPackRoutes.ts`             | Context PreviewおよびContext Pack生成route                |
| `src/api/routes/memoryRoutes.ts`                  | Memory SearchおよびSearch Preview route                 |
| `src/api/routes/docUpdateDraftRoutes.ts`          | Draft作成および参照route                                    |
| `src/api/routes/healthRoutes.ts`                  | Health確認route                                        |
| `src/api/controllers/projectContextController.ts` | Project取得処理のAPI境界                                    |
| `src/api/controllers/contextPackController.ts`    | Context生成処理のAPI境界                                    |
| `src/api/controllers/memorySearchController.ts`   | Search処理のAPI境界                                       |
| `src/api/controllers/docUpdateDraftController.ts` | Draft処理のAPI境界                                        |
| `src/services/contextService.ts`                  | Context取得および生成のユースケース処理                              |
| `src/services/searchService.ts`                   | Recall Engine利用のユースケース処理                             |
| `src/services/draftService.ts`                    | Draft生成・参照処理                                         |
| `src/repositories/memoryRepository.ts`            | 正本文書または索引への参照抽象化                                     |
| `src/repositories/draftRepository.ts`             | Draft保存・取得の抽象化                                       |
| `src/types/api.ts`                                | API Request / Response型定義                            |

#### C. APIテスト・検証用文書

| ファイル                                               | 目的                          |
| -------------------------------------------------- | --------------------------- |
| `docs/review/phase-4-mnemosyne-api-validation.md`  | Mnemosyneを対象としたAPI検証結果を記録する |
| `docs/review/phase-4-ats-api-validation.md`        | ATSを対象としたAPI検証結果を記録する       |
| `docs/review/phase-4-write-boundary-validation.md` | 正本write禁止・draft限定の検証結果を記録する |
| `examples/api/mnemosyne-context-requests.http`     | Mnemosyne向けAPI呼出例           |
| `examples/api/ats-context-requests.http`           | ATS向けAPI呼出例                 |
| `examples/api/doc-update-draft-requests.http`      | Draft作成API呼出例               |

#### D. Phase 5引継ぎ文書

| ファイル                                        | 目的                                       |
| ------------------------------------------- | ---------------------------------------- |
| `docs/phases/phase-5-input-requirements.md` | MCP ServerおよびMCP Tool定義に必要なAPI契約・制約を整理する |

### 9.13.2 技術選定時に追加される可能性がある成果物

| ファイルまたは構成                                       | 条件                     |
| ----------------------------------------------- | ---------------------- |
| `docs/design/memory-gateway-design.md`          | API内部構造を設計文書として独立させる場合 |
| `src/middleware/authMiddleware.ts`              | API key等の認証方式を採用した場合   |
| `src/middleware/requestValidationMiddleware.ts` | 共通入力検証をmiddleware化する場合 |
| `src/middleware/errorHandler.ts`                | エラー応答を共通化する場合          |
| `src/services/auditService.ts`                  | 監査ログを永続化する場合           |
| `src/repositories/auditRepository.ts`           | 監査ログ保存先を分離する場合         |
| Draft保存用migration                               | DraftをDBへ永続化する場合       |
| OpenAPI定義                                       | API仕様を機械可読形式で管理する場合    |

---

## 9.14 Phase 4推奨ディレクトリ構成

```text
project-mnemosyne/
  docs/
    gateway/
      api-overview.md
      api-contract.md
      project-context-api.md
      context-pack-api.md
      memory-search-api.md
      doc-update-draft-api.md
      auth-and-write-policy.md
      error-response-policy.md
      audit-policy.md
      mcp-api-mapping.md

    phases/
      phase-4-input-requirements.md
      phase-5-input-requirements.md

    review/
      phase-4-mnemosyne-api-validation.md
      phase-4-ats-api-validation.md
      phase-4-write-boundary-validation.md

  examples/
    api/
      mnemosyne-context-requests.http
      ats-context-requests.http
      doc-update-draft-requests.http

  src/
    api/
      routes/
        projectRoutes.ts
        contextPackRoutes.ts
        memoryRoutes.ts
        docUpdateDraftRoutes.ts
        healthRoutes.ts

      controllers/
        projectContextController.ts
        contextPackController.ts
        memorySearchController.ts
        docUpdateDraftController.ts

    services/
      contextService.ts
      searchService.ts
      draftService.ts

    repositories/
      memoryRepository.ts
      draftRepository.ts

    types/
      api.ts
```

---

## 9.15 Phase 4検証シナリオ

### 9.15.1 Project Context取得検証

| No.      | 検証内容                | Request                                    | 期待結果                              |
| -------- | ------------------- | ------------------------------------------ | --------------------------------- |
| P4-T-001 | Project一覧取得         | `GET /api/v1/projects`                     | `mnemosyne` および `ats` の利用状態を取得できる |
| P4-T-002 | Mnemosyne Context取得 | `GET /api/v1/projects/mnemosyne/context`   | Project概要、状態、判断、次アクション、出典が返る      |
| P4-T-003 | ATS Context取得       | `GET /api/v1/projects/ats/context`         | ATSの記憶文書に基づくContextが返る            |
| P4-T-004 | Active Decisions取得  | `GET /api/v1/projects/mnemosyne/decisions` | active / accepted判断が優先される         |
| P4-T-005 | Next Actions取得      | `GET /api/v1/projects/ats/next-actions`    | `next-actions.md` を出典とするタスク一覧が返る  |

### 9.15.2 Context Pack生成検証

| No.      | 検証内容                  | 入力                                                          | 期待結果                              |
| -------- | --------------------- | ----------------------------------------------------------- | --------------------------------- |
| P4-T-006 | Context Preview生成     | `mnemosyne` × `requirements_reviewer` × 要件レビューTask          | 読込予定文書、warning、write policyを確認できる |
| P4-T-007 | Context Pack生成        | 同上                                                          | Context Pack本文、出典、生成metadataが返る   |
| P4-T-008 | Retrieved Context付き生成 | `ats` × `implementation_reviewer` × `--retrieve` 相当のRequest | 検索結果を含むContext Packが返る            |
| P4-T-009 | 必須文書欠落時の生成            | 必須文書を欠くProject                                              | warningまたは生成不可エラーが返る              |

### 9.15.3 Memory Search検証

| No.      | 検証内容           | Request                | 期待結果                               |
| -------- | -------------- | ---------------------- | ---------------------------------- |
| P4-T-010 | Mnemosyne記憶検索  | Agent分離方針の検索           | ADRまたは有効判断が出典付きで返る                 |
| P4-T-011 | ATS記憶検索        | `action_select` 冪等性の検索 | ATSの関連判断・test resultが返る            |
| P4-T-012 | Search Preview | deprecated候補を含む検索      | 除外内容またはwarningを確認できる               |
| P4-T-013 | 索引未作成          | 未索引Projectで検索          | `SEARCH_INDEX_NOT_READY` 相当のエラーが返る |

### 9.15.4 Draft境界検証

| No.      | 検証内容      | Request                    | 期待結果                           |
| -------- | --------- | -------------------------- | ------------------------------ |
| P4-T-014 | Draft作成   | `next-actions.md` 更新案をPOST | `draft` 状態の更新候補が作成される          |
| P4-T-015 | Draft参照   | 作成済みdraftをGET              | 対象文書、差分案、未反映表示が返る              |
| P4-T-016 | 正本非更新確認   | Draft作成前後で正本比較             | 正本文書が変更されていない                  |
| P4-T-017 | write要求拒否 | 正本更新相当の操作要求                | `FORBIDDEN_OPERATION` として拒否される |
| P4-T-018 | ADR自動採用防止 | ADR提案draftを作成              | Accepted化されずdraftとして保持される      |

### 9.15.5 認証・入力・エラー検証

| No.      | 検証内容           | 期待結果                         |
| -------- | -------------- | ---------------------------- |
| P4-T-019 | 未認証アクセス        | 認証が必要な構成では拒否される              |
| P4-T-020 | 不存在Project     | `PROJECT_NOT_FOUND` が返る      |
| P4-T-021 | 不存在Agent       | `AGENT_NOT_FOUND` が返る        |
| P4-T-022 | 不正Task Context | `INVALID_REQUEST` が返り副作用がない  |
| P4-T-023 | Health確認       | 依存機能の利用可否と索引状態を確認できる         |
| P4-T-024 | Secret漏えい確認    | Responseおよび監査ログにsecretが含まれない |

### 9.15.6 Phase 5接続準備検証

| No.      | 検証内容          | 期待結果                              |
| -------- | ------------- | --------------------------------- |
| P4-T-025 | MCP Tool対応表確認 | 各Tool候補がAPI endpointへ対応づけられる      |
| P4-T-026 | 操作境界継承確認      | MCP経由でもdraft限定・正本write不可の方針を維持できる |
| P4-T-027 | API契約再利用性確認   | 外部クライアントが内部ファイル構造を知らずに利用できる       |

---

## 9.16 Phase 4完了条件

### 9.16.1 Definition of Done

Phase 4は、以下をすべて満たした時点で完了とする。

| No.    | 完了条件                                                     | 判定観点                      |
| ------ | -------------------------------------------------------- | ------------------------- |
| DoD-01 | Memory Gateway APIの目的、操作区分およびendpoint一覧が定義されている          | API境界を説明できる               |
| DoD-02 | API共通Request / Responseおよびversioning方針が定義されている           | 外部クライアントが安定して利用できる        |
| DoD-03 | Project Context、Status、Decisions、Next Actions取得APIが利用できる | 基本記憶をHTTP経由で取得できる         |
| DoD-04 | Context PreviewおよびContext Pack生成APIが利用できる                | Phase 2機能をAPI経由で利用できる     |
| DoD-05 | Search PreviewおよびMemory Search APIが利用できる                 | Phase 3機能をAPI経由で利用できる     |
| DoD-06 | Retrieved Contextを含むContext Packを生成できる                   | Context生成と検索が接続されている      |
| DoD-07 | Doc Update Draft作成および参照APIが利用できる                         | 更新案を正本非変更で扱える             |
| DoD-08 | 正本文書write APIおよびdelete APIが提供されていない                      | 人間承認境界が維持されている            |
| DoD-09 | 認証・認可・入力検証方針が定義され、検証可能である                                | 外部公開に必要な最低限の安全性がある        |
| DoD-10 | エラーResponseおよびwarning方針が定義されている                          | MCP等の後続クライアントが失敗を解釈できる    |
| DoD-11 | 参照元文書、status、索引状態、write policyを追跡できる                     | 根拠と鮮度が確認可能である             |
| DoD-12 | Mnemosyneに対するAPI検証が完了している                                | 要件・Context取得用途で成立する       |
| DoD-13 | ATSに対するAPI検証が完了している                                      | 実プロジェクトの検索・Context用途で成立する |
| DoD-14 | Draft作成により正本が変更されないことを確認している                             | write boundaryが機能する       |
| DoD-15 | Phase 5 MCP接続に必要なAPI対応表と入力要件が整理されている                     | MCP Nexusへ進める             |
| DoD-16 | MCP Server、正本自動反映、Agent自律実行、Notion同期へ不要に着手していない          | Phase 4スコープを維持している        |

### 9.16.2 完了判定

| 判定             | 条件                                                                      |
| -------------- | ----------------------------------------------------------------------- |
| Go             | 全DoDを満たし、MnemosyneおよびATSでread / search / generate / draftのAPI利用が安全に成立する |
| Conditional Go | API契約または認証方式に軽微な改善課題はあるが、MCP Tool設計と接続試作へ進める                            |
| No Go          | 正本非改変、認証・権限境界、出典追跡、検索連携またはDraft境界のいずれかが成立しない                            |

---

## 9.17 Phase 4からPhase 5への引継ぎ要件

| ID        | 引継ぎ事項                    | 内容                                                  |
| --------- | ------------------------ | --------------------------------------------------- |
| P4-HO-001 | API endpoint一覧           | MCP Toolが呼び出す対象API                                  |
| P4-HO-002 | API Request / Response仕様 | MCP Tool入力・返却値へマッピングする契約                            |
| P4-HO-003 | Context Pack生成仕様         | MCP経由でAIへContextを提供する方式                             |
| P4-HO-004 | Memory Search仕様          | `search_project_memory` 等のToolで利用する検索契約             |
| P4-HO-005 | Draft仕様                  | `create_doc_update_draft` が扱える更新案の境界                |
| P4-HO-006 | 認証情報管理                   | MCP ServerがAPIへ接続する際の認証方式                           |
| P4-HO-007 | 操作権限境界                   | MCP Toolにもread / search / generate / draftのみを許可する方針 |
| P4-HO-008 | エラー契約                    | MCP Serverが利用者へ適切に返すべきAPIエラー                        |
| P4-HO-009 | 監査要件                     | AIクライアント経由の操作を追跡するための情報                             |
| P4-HO-010 | 検証結果                     | MnemosyneおよびATSでのAPI利用結果と残課題                        |

---

## 9.18 Phase 4時点の未決定事項

| ID        | 論点                           | Phase 4での扱い                 | 後続判断                          |
| --------- | ---------------------------- | --------------------------- | ----------------------------- |
| P4-OI-001 | API実装フレームワーク                 | 要件定義では確定しない                 | 設計仕様書で判断                      |
| P4-OI-002 | 認証方式                         | API key、token等を候補とする        | 外部公開範囲と合わせて設計時に判断             |
| P4-OI-003 | Draft保存先                     | Markdown draft領域またはDBを候補とする | Draft運用設計時に判断                 |
| P4-OI-004 | 監査ログ保存先および保存期間               | 追跡要件のみ定義する                  | 運用仕様で判断                       |
| P4-OI-005 | OpenAPI等の機械可読仕様を必須化するか       | 追加候補とする                     | MCP接続・API保守性を踏まえて判断           |
| P4-OI-006 | APIをローカル利用に限定するか、外部ホスティングするか | 初期は限定利用を前提とする               | 利用形態確定後に判断                    |
| P4-OI-007 | Notion副本をAPI経由で参照するか         | 初期必須範囲外                     | 同期方針確定後に判断                    |
| P4-OI-008 | Draft承認・反映フローをAPI化するか        | Phase 4対象外                  | Automation / Governance設計時に判断 |
| P4-OI-009 | Rate Limitや利用量制御をどこまで実装するか   | 外部公開時の要件候補                  | 接続方式確定後に判断                    |
| P4-OI-010 | MCP以外のUIまたはアプリ連携を優先するか       | 接続可能性のみ担保する                 | Phase 5以降に判断                  |

---

# 10. 次分冊で定義する範囲

次分冊では、以下を定義する。

```text
Phase 5：MCP Nexus
  - MCP Serverの役割
  - Memory Gateway APIとの接続
  - MCP Tool定義
  - Toolごとの入力・出力・禁止事項
  - Context取得および検索Tool
  - Doc Update Draft作成Tool
  - ChatGPT / Cursor / Claude等のクライアント利用境界
  - API認証情報の管理
  - AI操作権限の継承
  - MCP接続検証
```

Phase 5は、Phase 4で確立したMemory Gateway APIを利用し、AIクライアントからProject Mnemosyneの外部記憶を自然に参照・検索・draft化できる接続層を構築するPhaseとする。

## 今回の設計上の整理

| 項目             | 旧案                         | 今回のPhase 4要件                                              |
| -------------- | -------------------------- | --------------------------------------------------------- |
| Phase 4の役割     | Memory APIを作る              | 正本参照・Context生成・検索・Draftを外部公開する安全なGateway境界                |
| API範囲          | Context / Search / Draft中心 | Project取得、Preview、Context生成、Search、Draft、Health、認証、監査まで定義 |
| write方針        | draftに限定                   | **正本write APIを提供しない**ことを明文化                               |
| Notion Service | 初期候補に含まれていた                | 初期必須範囲から除外し、Markdown正本中心に統一                               |
| MCPとの関係        | 将来接続先                      | MCPはGateway APIを経由し、正本へ直接アクセスしない                          |
| エラー・認証         | 未整理                        | Phase 5利用を前提にAPI契約として要件化                                  |
| Draft          | 作成可能                       | 参照可能だが、反映・承認・自動採用は対象外                                     |

原案のPhase 4は、Memory API、Context Service、Search Service、Memory Repositoryを作り、HTTP経由で外部記憶を利用可能にする方針でした。今回の要件では、その核を維持しつつ、Phase 1〜3で具体化した正本境界、Retrieved Context、Registry、`draft_only` 方針をAPI契約へ反映しました。 

## Conversation Memory

### fact

* JP: Project Mnemosyneでは、Markdown docsおよびADRを初期正本とし、Context Pack、検索索引、検索結果およびMCPは正本ではないものとして整理している。 / EN: Project Mnemosyne treats Markdown docs and ADRs as initial sources of truth; Context Packs, search indexes, search results, and MCP are not sources of truth.
* JP: Phase 1では記憶構造・分類・更新ルールを定義し、Phase 2では `Project × Agent × Task` に基づくContext Pack生成、Phase 3ではRetrieved Contextによる検索補完を要件化した。 / EN: Phase 1 defines memory structure, classification, and update rules; Phase 2 defines Context Pack generation based on `Project × Agent × Task`; Phase 3 defines search-based supplementation through Retrieved Context.
* JP: 原案のPhase 4には、Project Context取得、Memory Search、Doc Update Draft作成のAPI候補が存在していた。 / EN: The original Phase 4 proposal included API candidates for Project Context retrieval, Memory Search, and Doc Update Draft creation.
* JP: 本回答では、Phase 4：Memory Gatewayの要件定義本文を、Phase別要件定義書へ追記可能な形式で作成した。 / EN: This response created the Phase 4: Memory Gateway requirements section in a form that can be appended to the phase requirements document.

### decision

* JP: Phase 4は、Phase 1〜3の機能を外部利用可能にするHTTP API境界として定義する。 / EN: Phase 4 is defined as the HTTP API boundary that exposes the capabilities built in Phases 1 to 3.
* JP: Phase 4 APIで公開する操作は、read、search、generate、draftに限定し、正本writeおよびdelete APIは提供しない。 / EN: Phase 4 APIs are limited to read, search, generate, and draft operations; source-of-truth write and delete APIs are not provided.
* JP: Notion連携はPhase 4の初期必須範囲から除外し、Markdown正本、ADR、Registry、Context Builder、Recall Engineを主入力とする。 / EN: Notion integration is excluded from the initial mandatory Phase 4 scope; Markdown source documents, ADRs, registries, Context Builder, and Recall Engine are the primary inputs.
* JP: Phase 5のMCP ServerはMemory Gateway APIを経由し、正本文書や検索索引へ直接アクセスしない構成とする。 / EN: The Phase 5 MCP Server will use the Memory Gateway API and will not directly access source documents or search indexes.

### task

* JP: 次分冊として、Phase 5：MCP Nexusの要件定義を作成する。 / EN: Create the next section defining Phase 5: MCP Nexus.
* JP: 後続の設計仕様書で、APIフレームワーク、認証方式、Draft保存先、監査ログ保存方式、OpenAPI要否を具体化する。 / EN: Specify the API framework, authentication method, draft storage, audit log storage, and OpenAPI need in the later design specification.

### preference

* JP: 外部接続を追加しても、正本境界と人間承認の運用を崩さず、安全な接続口を先に定義する進め方を重視する。 / EN: The preferred approach is to define a safe access gateway without breaking source-of-truth boundaries or human approval, even when external connections are added.
* JP: MCPを先に作るのではなく、再利用可能なAPI契約を先に確立してからAIクライアント接続へ進む。 / EN: The approach establishes reusable API contracts before building MCP-based AI client connections.

### constraint

* JP: Phase 4では、MCP Server、正本反映API、ADR自動採用、Task自動確定、Notion同期、Agent自律実行、Web UIを対象外とする。 / EN: Phase 4 excludes MCP Server, source-reflection APIs, automatic ADR acceptance, automatic task confirmation, Notion synchronization, autonomous agent execution, and Web UI.
* JP: Doc Update Draftは未承認の更新候補であり、作成しても正本文書、ADRまたはNext Actionsを変更しない。 / EN: A Doc Update Draft is an unapproved change proposal and does not modify source documents, ADRs, or Next Actions when created.
* JP: 外部公開する場合は、認証なしで記憶取得・検索・Draft作成を利用可能にしない。 / EN: When externally exposed, memory retrieval, search, and draft creation must not be available without authentication.

### issue

* JP: API実装フレームワーク、認証方式、Draft保存先、監査ログ保存方式、APIの公開範囲は未確定である。 / EN: The API framework, authentication method, draft storage, audit log storage, and exposure scope remain undecided.
* JP: Draftの承認・正本反映を将来API化するかは未決定であり、Phase 4では扱わない。 / EN: Whether draft approval and source reflection will later be exposed through APIs is undecided and excluded from Phase 4.
* JP: Notion副本を将来API取得対象とするかは、正本同期方針が確定するまで未決定である。 / EN: Whether Notion secondary views will later be API-accessible remains undecided until source synchronization policy is defined.

### idea

* JP: MCP ToolとMemory Gateway APIの対応表をPhase 4成果物として残すことで、Phase 5でMCPが内部構造へ依存することを防げる。 / EN: Keeping a mapping between MCP tools and Memory Gateway APIs as a Phase 4 deliverable can prevent MCP from depending on internal structures in Phase 5.
* JP: Context Pack PreviewおよびSearch PreviewをAPI化することで、AIへ文脈を渡す前の人間確認を外部クライアントからも維持できる。 / EN: Exposing Context Pack Preview and Search Preview through APIs preserves human review before giving context to AI, even from external clients.

### article_note

* JP: AI外部記憶基盤のAPI化で重要なのは、取得機能を増やすこと以上に、「参照できるが、勝手には確定させない」という境界をAPI契約として固定することである。 / EN: In API-enabling an AI external memory base, the key is not only adding retrieval features, but fixing the boundary that information may be read without being silently finalized.

### conversation_summary

* JP: 本チャットでは、Phase 1作業計画書を基準に全体要件定義書を再構成し、Phase別要件定義を分割で作成している。Phase 1では正本構造と記憶運用、Phase 2ではContext Pack生成、Phase 3では正本検索とRetrieved Context補完を定義した。今回、Phase 4を、Context取得・検索・Context生成・Draft作成を安全に外部公開し、Phase 5のMCP接続へ橋渡しするMemory Gateway APIフェーズとして定義した。 / EN: This chat rebuilt the overall requirements from the Phase 1 plan and is creating phased requirements in sections. Phase 1 defines source-of-truth memory operations, Phase 2 defines Context Pack generation, and Phase 3 defines retrieval-based context supplementation. This response defines Phase 4 as the Memory Gateway API phase that safely exposes context retrieval, search, context generation, and draft creation to prepare for MCP connectivity in Phase 5.

### test_result

* JP: Phase 4要件定義では、原案のContext取得・Memory Search・Doc Update Draft APIを維持しつつ、正本write禁止、Preview API、認証・認可、エラー契約、監査、MCP対応表、Mnemosyne/ATS検証を追加して、Phase 5接続前のGateway境界を具体化できた。 / EN: The Phase 4 requirements retain the original Context retrieval, Memory Search, and Doc Update Draft APIs while adding source-write prohibition, preview APIs, authentication and authorization, error contracts, auditing, MCP mapping, and Mnemosyne/ATS validation to define the gateway boundary before Phase 5.
