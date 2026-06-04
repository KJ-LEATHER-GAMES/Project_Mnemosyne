前回の `# 10. 次分冊で定義する範囲` は、正式文書へ統合する際に以下の **`# 10. Phase 5：MCP Nexus`** へ置き換えてください。

原案ではPhase 5を、ChatGPT / Cursor / Claude等から共通の外部記憶基盤を利用するためのMCP接続フェーズとし、`get_project_context`、`search_project_memory`、`list_active_decisions`、`list_next_actions`、`create_doc_update_draft` 等がTool候補として挙げられていました。 

今回の要件定義では、Phase 4で定義したMemory Gateway APIを唯一の接続先とし、MCP Serverが正本文書・検索索引・Draft保存先へ直接アクセスしない構造に整理します。また、当初のプロジェクト中心のMCP Tool構想を、現在の **専門Agent × Project Context × Task Context** の設計へ接続できるよう拡張します。 

# 10. Phase 5：MCP Nexus

## 副題：AIクライアントと記憶基盤を接続する

---

## 10.1 Phase概要

| 項目          | 内容                                                                              |
| ----------- | ------------------------------------------------------------------------------- |
| Phase       | Phase 5                                                                         |
| 名称          | MCP Nexus                                                                       |
| 副題          | AIクライアントと記憶基盤を接続する                                                              |
| 主目的         | Phase 4で構築したMemory Gateway APIを、MCP対応AIクライアントから安全に利用できるTool群として公開する             |
| 実装レベル       | MCP Server、Tool Contract、Gateway API Client、認証情報管理、Tool利用検証                     |
| 主入力         | Memory Gateway API、API契約、MCP/API対応表、Project Registry、Agent Registry、Phase 5入力要件 |
| 主出力         | MCP Server、MCP Tool群、AIクライアント接続設定、Tool利用検証記録                                    |
| 初期対象Project | Project Mnemosyne / ATS                                                         |
| 初期対象Client  | MCP Toolを利用可能なAIクライアントのうち、検証可能なもの                                               |
| 次Phaseとの接続  | Phase 6で役割別Agentを実運用し、Project Contextを切り替えた専門作業へ展開する                            |

---

## 10.2 Phase 5の位置づけ

Phase 1では、記憶の正本構造、分類、状態管理、更新ルールおよびAI操作境界を定義した。

Phase 2では、`Project × Agent × Task` に基づいてContext Packを生成できるようにした。

Phase 3では、固定文脈だけでは不足する関連記憶を検索し、`Retrieved Context` としてContext Packへ追加できるようにした。

Phase 4では、Context取得、検索、Context Pack生成およびDoc Update Draft作成を、正本writeを許可しないMemory Gateway APIとして外部公開できるようにした。

Phase 5では、AIクライアントがMemory Gateway APIを直接意識せず、MCP Toolとして外部記憶基盤を利用できる接続層を構築する。

```text
Phase 1：
記憶の正本と運用ルールを作る

Phase 2：
Project × Agent × Task に応じたContext Packを作る

Phase 3：
関連記憶を検索し、Context Packを補完する

Phase 4：
Context取得・検索・Draft作成をAPIとして公開する

Phase 5：
AIクライアントがMCP Tool経由で
外部記憶を利用できるようにする
```

---

## 10.3 Phase 5の重要な設計整理

### 10.3.1 MCP ServerはMemory Gatewayのクライアントとする

MCP Serverは、正本文書、ADR、検索索引、RegistryまたはDraft保存領域へ直接アクセスしない。

MCP Serverは、Phase 4で定義したMemory Gateway APIを呼び出し、その結果をAIクライアントが利用できるTool Resultとして返却する。

```text
ChatGPT / Cursor / Claude / MCP対応AIクライアント
        ↓
      MCP Tool
        ↓
      MCP Server
        ↓
   Memory Gateway API
        ↓
 ┌──────────────────────────────────────────┐
 │ Context Builder / Recall Engine / Draft   │
 │ Markdown docs / ADR / Registry / Index    │
 └──────────────────────────────────────────┘
```

#### 採用理由

| 観点   | 理由                                               |
| ---- | ------------------------------------------------ |
| 責務分離 | MCP ServerはAI接続層、Memory Gatewayは記憶サービス境界として分離できる |
| 安全性  | 正本write禁止、status制御、認証、監査をAPI側で一貫して適用できる          |
| 再利用性 | 将来UIや別クライアントを追加しても同一APIを利用できる                    |
| 保守性  | ファイル配置や検索内部実装の変更をMCP Toolへ直接波及させにくい              |
| 検証性  | API検証とMCP接続検証を段階的に分けられる                          |

### 10.3.2 MCP ToolはAgentそのものではない

MCP Toolは、外部記憶を取得・検索・生成・draft化するための操作インターフェースである。

一方、専門Agentは、目的、必要Context、禁止事項、出力形式およびレビュー観点を持つ作業役割である。

```text
MCP Tool
= 記憶基盤へアクセスするための操作

専門Agent
= 取得した記憶を使って何を行うかを定義する役割
```

例：

```text
要件定義レビューAgent
  └─ get_project_context を利用
  └─ search_project_memory を利用
  └─ build_context_pack を利用
  └─ 必要に応じて create_doc_update_draft を利用

実装レビューAgent
  └─ get_project_context を利用
  └─ search_project_memory を利用
  └─ build_context_pack を利用
```

Phase 5ではToolを接続可能にするが、複数の専門Agentを本格的に運用すること自体はPhase 6で扱う。

### 10.3.3 AIクライアントへ許可する操作境界を継承する

Phase 5でAIクライアントへ公開する操作は、Phase 4で定義した操作境界を超えない。

| 操作区分         | MCP Tool提供 | 内容                                              |
| ------------ | ---------: | ----------------------------------------------- |
| Read         |          可 | Project Context、Status、Decision、Next Actionsの取得 |
| Search       |          可 | 関連記憶の検索および検索Preview                             |
| Generate     |          可 | Context PackおよびContext Previewの生成               |
| Draft        |          可 | 正本文書更新案の草案作成・参照                                 |
| Reflect      |         不可 | Draftを正本へ反映する                                   |
| Source Write |         不可 | Markdown正本やADRを直接更新する                           |
| Delete       |         不可 | 正本またはDraftを削除する                                 |

### 10.3.4 Phase 5は初期MVPではなく、接続拡張フェーズとする

Project Mnemosyneの初期MVPは、Phase 1およびPhase 2により、正しい記憶構造からContext Packを生成できる状態までと定義している。

したがって、過去案における「Phase 5の初期MVP Tool」という表現は、正式文書では以下のように読み替える。

```text
旧表現：
Phase 5 初期MVP対象Tool

新表現：
Phase 5 初期接続Toolセット
```

Phase 5は、初期MVP成立後に、AIクライアントから自然に外部記憶基盤を利用できるようにする接続拡張フェーズである。

---

## 10.4 Phase 5の目的

### 10.4.1 主目的

```text
Phase 4で確立したMemory Gateway APIをMCP Toolとして公開し、
AIクライアントがProject Context、関連記憶、Context Packおよび
Doc Update Draftを安全に利用できる接続層を構築する。
```

### 10.4.2 具体目的

| ID         | 目的                                                                             |
| ---------- | ------------------------------------------------------------------------------ |
| P5-OBJ-001 | MCP Serverの責務とMemory Gateway APIとの接続境界を定義する                                    |
| P5-OBJ-002 | Project Context、Current Status、Active Decisions、Next Actionsを取得するMCP Toolを提供する |
| P5-OBJ-003 | Context PreviewおよびContext Pack生成を実行するMCP Toolを提供する                             |
| P5-OBJ-004 | 関連記憶を検索し、Retrieved Contextとして取得するMCP Toolを提供する                                 |
| P5-OBJ-005 | 正本文書を直接変更せず、Doc Update Draftのみ作成・参照するMCP Toolを提供する                             |
| P5-OBJ-006 | MCP Toolの入出力、許可操作、禁止操作およびエラー変換方針を定義する                                          |
| P5-OBJ-007 | Memory Gateway APIへの認証情報を安全に管理する                                               |
| P5-OBJ-008 | Tool利用時の参照元、status、warning、write policyをAIクライアントへ返却できるようにする                    |
| P5-OBJ-009 | MnemosyneおよびATSに対し、AIクライアント経由で記憶参照・検索・Context生成・Draft作成が成立することを検証する            |
| P5-OBJ-010 | Phase 6で専門Agentを役割別に運用するためのTool利用条件および残課題を整理する                                 |

---

## 10.5 Phase 5で解決する課題

| 課題ID       | 課題                                    | Phase 5での解決内容                                      |
| ---------- | ------------------------------------- | -------------------------------------------------- |
| P5-ISS-001 | AIクライアントがMemory Gateway APIを直接呼び出しにくい | MCP Toolとして自然な操作インターフェースを提供する                      |
| P5-ISS-002 | AIクライアントごとに記憶取得方法が分散する                | 共通のMCP Tool Contractを定義する                          |
| P5-ISS-003 | MCP実装が正本文書や検索索引へ直接依存する恐れがある           | MCP ServerをMemory Gateway APIのクライアントに限定する          |
| P5-ISS-004 | AIがTool経由で正本を変更するリスクがある               | Draftまでを許可し、write / reflect / delete Toolを提供しない    |
| P5-ISS-005 | Tool結果から情報の出典や鮮度が見えにくい                | source、status、warning、write policyをTool Resultへ含める |
| P5-ISS-006 | AgentとToolの責務が混同される                   | Toolは操作、Agentは役割として明確に分離する                         |
| P5-ISS-007 | APIエラーをAIクライアントが扱いにくい                 | MCP向けエラー変換および利用者向け説明方針を定義する                        |
| P5-ISS-008 | 複数AIクライアントへの展開時に安全境界が揺れる              | 同一Gateway APIおよび同一Tool権限制約を適用する                    |

---

## 10.6 Phase 5の前提条件

| ID         | 前提条件                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------ |
| P5-PRE-001 | Phase 4が `Go` または `Conditional Go` と判定されていること                                                    |
| P5-PRE-002 | Memory Gateway APIのendpoint、Request / Responseおよびエラー契約が定義されていること                                 |
| P5-PRE-003 | Memory Gateway APIでProject Context取得、Context Pack生成、Memory SearchおよびDoc Update Draft作成が利用可能であること |
| P5-PRE-004 | Memory Gateway APIで正本writeおよびdeleteが提供されていないこと                                                   |
| P5-PRE-005 | API認証方式またはMCP Serverからの接続認証方式が確定していること                                                           |
| P5-PRE-006 | MCP/API対応表が作成され、Tool候補とAPI endpointの関係が確認できること                                                   |
| P5-PRE-007 | MnemosyneおよびATSに対するAPI検証結果が存在すること                                                                |
| P5-PRE-008 | AgentとProject Contextを分離する判断がADRとして確認できること                                                       |
| P5-PRE-009 | AIクライアントへ公開してよい情報範囲および禁止操作が定義されていること                                                             |

---

## 10.7 Phase 5の対象範囲

### 10.7.1 対象に含めるもの

| 分類            | 対象内容                                            |
| ------------- | ----------------------------------------------- |
| MCP Server    | AIクライアントからToolを利用するためのServer実装                  |
| Gateway接続     | Memory Gateway APIへ接続するClient / Adapter         |
| Tool Contract | Tool名、目的、入力、出力、エラー、禁止事項の定義                      |
| Context参照Tool | Project Context、Status、Decisions、Next Actions取得 |
| Context生成Tool | Context Preview、Context Pack生成                  |
| Search Tool   | Search Preview、関連記憶検索                           |
| Draft Tool    | Doc Update Draft作成・参照                           |
| 権限継承          | `read / search / generate / draft` 境界の維持        |
| 認証情報管理        | MCP ServerからGateway APIへ接続するcredential管理        |
| Error Mapping | API errorをMCP Tool Resultへ変換する方式                |
| Traceability  | source、status、warning、request id等の返却            |
| Client検証      | 利用可能なAIクライアントでのTool呼出検証                         |
| Phase 6準備     | Agent別Tool利用方針および運用課題整理                         |

### 10.7.2 対象に含めないもの

| 対象外                   | 理由                               |
| --------------------- | -------------------------------- |
| 正本文書を直接変更するTool       | 人間承認境界を維持するため                    |
| Draft反映・承認Tool        | 正本反映の自動化は後続検討とするため               |
| ADR自動Accepted化Tool    | 重要判断をAI単独で確定させないため               |
| Task自動完了・優先順位変更Tool   | `next-actions.md` 正本を自動変更しないため   |
| MCP Serverによるファイル直接参照 | Gateway境界を迂回させないため               |
| MCP Serverによる検索索引直接参照 | Recall Engineの責務をGateway側に維持するため |
| 複数Agentの自律オーケストレーション  | Phase 6以降で扱うため                   |
| 自動会話要約反映              | Automation / Governanceで扱うため     |
| Notion直接操作Tool        | Notionを初期正本としていないため              |
| 一般公開向けマルチユーザー管理       | 個人利用中心の初期スコープを超えるため              |

---

## 10.8 Phase 5 MCP設計原則

### 10.8.1 Gateway経由原則

MCP Toolは、Memory Gateway APIが公開している機能のみを呼び出す。

```text
Toolで実現したい操作
  ↓
対応するMemory Gateway APIが存在するか確認
  ↓
存在する場合のみMCP Toolとして公開
```

APIに存在しない正本write、delete、承認反映等の操作を、MCP Server側で独自実装してはならない。

### 10.8.2 Tool最小化原則

MCP Toolは、役割が重複しない単位で提供する。

Toolを過度に細分化すると、AIクライアントがどのToolを使うべきか判断しにくくなり、逆に万能Toolへ集約すると操作境界が曖昧になる。

初期Tool群は、以下の目的単位で整理する。

| 分類       | 目的                |
| -------- | ----------------- |
| Discover | 利用可能なProjectを把握する |
| Read     | 基本記憶を取得する         |
| Search   | 関連記憶を検索する         |
| Generate | Context Packを生成する |
| Draft    | 正本更新案を作成・参照する     |

### 10.8.3 Tool Result根拠提示原則

AIクライアントがTool Resultに基づき回答する場合、どの記憶を根拠にしたのか判断できるようにする。

Tool Resultには、必要に応じて以下を含める。

* `source_documents`
* `source_path`
* `source_type`
* `status`
* `updated_at`
* `warnings`
* `write_policy`
* `request_id`
* `generated_at`

### 10.8.4 Draft Only原則

MCP Toolが作成可能な更新内容はDraftに限定する。

```text
AIクライアントができること：
更新案を作る
差分案を作る
ADR案を作る
Task追加案を作る

AIクライアントができないこと：
正本へ反映する
ADRをAcceptedにする
Taskを確定・完了にする
既存記憶を削除する
```

### 10.8.5 Agent非内包原則

MCP Tool定義そのものに、ATS専用やMnemosyne専用の作業ロジックを埋め込まない。

Projectの違いは `project_code` で指定し、Agentの違いは `agent_code` またはAgent Registryにより指定する。

```text
禁止する方向：
get_ats_implementation_review_context
get_mnemosyne_requirements_review_context

採用する方向：
build_context_pack(project_code, agent_code, task_context)
search_project_memory(project_code, agent_code, query)
```

---

## 10.9 MCP Toolセット

### 10.9.1 Phase 5初期接続Toolセット

Phase 5では、接続性・参照性・安全境界を先に確認するため、以下を初期接続Toolセットとする。

| Tool ID     | Tool名                   | 目的                      | Gateway API                                       | 操作区分     |
| ----------- | ----------------------- | ----------------------- | ------------------------------------------------- | -------- |
| P5-TOOL-001 | `list_projects`         | 利用可能なProjectを取得する       | `GET /api/v1/projects`                            | Read     |
| P5-TOOL-002 | `get_project_context`   | Projectの基本Contextを取得する  | `GET /api/v1/projects/{projectCode}/context`      | Read     |
| P5-TOOL-003 | `get_current_status`    | Projectの現在状況を取得する       | `GET /api/v1/projects/{projectCode}/status`       | Read     |
| P5-TOOL-004 | `list_active_decisions` | 現在有効な判断を取得する            | `GET /api/v1/projects/{projectCode}/decisions`    | Read     |
| P5-TOOL-005 | `list_next_actions`     | 次アクションを取得する             | `GET /api/v1/projects/{projectCode}/next-actions` | Read     |
| P5-TOOL-006 | `preview_memory_search` | 検索予定結果と警告を確認する          | `POST /api/v1/memory/search/preview`              | Search   |
| P5-TOOL-007 | `search_project_memory` | 関連記憶を検索する               | `POST /api/v1/memory/search`                      | Search   |
| P5-TOOL-008 | `preview_context_pack`  | Context Pack生成前の内容を確認する | `POST /api/v1/context-packs/preview`              | Generate |
| P5-TOOL-009 | `build_context_pack`    | Context Packを生成する       | `POST /api/v1/context-packs`                      | Generate |

### 10.9.2 Draft接続Toolセット

Read / Search / Generate Toolの安全性および追跡性を検証した後、以下を有効化対象とする。

| Tool ID     | Tool名                     | 目的                   | Gateway API                               | 操作区分  |
| ----------- | ------------------------- | -------------------- | ----------------------------------------- | ----- |
| P5-TOOL-010 | `create_doc_update_draft` | 正本文書更新案をDraftとして作成する | `POST /api/v1/doc-update-drafts`          | Draft |
| P5-TOOL-011 | `get_doc_update_draft`    | 作成済みDraftを参照する       | `GET /api/v1/doc-update-drafts/{draftId}` | Read  |

### 10.9.3 任意Tool候補

以下は、初期接続Toolセットで不足が確認された場合に追加を検討する。

| Tool候補                    | 目的                  | 追加判断の観点                           |
| ------------------------- | ------------------- | --------------------------------- |
| `get_related_adrs`        | 特定論点に関連するADRのみを取得する | `search_project_memory` で代替できない場合 |
| `get_gateway_health`      | Gateway利用可能性を確認する   | AIクライアントから状態確認が必要な場合              |
| `get_search_index_status` | 索引状態を確認する           | stale index対応がTool利用上重要な場合        |
| `list_available_agents`   | 利用可能なAgent定義を確認する   | AIクライアント側でAgent選択を支援する場合          |

### 10.9.4 提供しないTool

| Tool                     | 提供しない理由                      |
| ------------------------ | ---------------------------- |
| `update_source_document` | 正本writeに該当するため               |
| `apply_doc_update_draft` | Draft反映をAIに許可しないため           |
| `accept_adr`             | 重要判断の確定をAIに許可しないため           |
| `complete_task`          | タスク正本の変更に該当するため              |
| `delete_memory`          | 記憶正本の削除をAIに許可しないため           |
| `sync_notion`            | Notionを初期必須の正本・副本運用に含めていないため |

---

## 10.10 Phase 5機能要件

### P5-FR-001 MCP Server提供

AIクライアントがMemory Gateway APIの機能をMCP Toolとして利用できるMCP Serverを実装できること。

#### 必須責務

| 責務       | 内容                                          |
| -------- | ------------------------------------------- |
| Tool公開   | 定義済みMCP ToolをAIクライアントへ公開する                  |
| Input受理  | Toolごとの入力を受け取る                              |
| Input検証  | 必須項目・形式・禁止操作を確認する                           |
| API呼出    | 対応するMemory Gateway APIを呼び出す                 |
| Result整形 | API ResponseをTool Resultとして返す               |
| Error変換  | API ErrorをAIクライアントが扱える形へ変換する                |
| Auth管理   | Gateway API接続用credentialを安全に利用する            |
| Trace付与  | request id、source、warning、write policyを保持する |

#### 制約

* MCP Serverは正本文書を直接読み書きしない。
* MCP Serverは検索索引を直接検索しない。
* MCP ServerはDraft反映処理を実装しない。
* MCP ServerはAgentの自律実行主体とはしない。

---

### P5-FR-002 Project一覧取得Tool

AIクライアントが利用可能なProjectを確認できること。

#### Tool

```text
list_projects
```

#### 入力

初期実装では入力なし、または利用可能状態によるfilterのみを許容する。

#### 出力

| 項目                  | 内容          |
| ------------------- | ----------- |
| `project_code`      | Project識別子  |
| `project_name`      | 表示名称        |
| `status`            | 利用状態        |
| `context_available` | Context取得可否 |
| `search_available`  | Search利用可否  |
| `warnings`          | 文書不足、索引状態等  |

#### 利用例

* AIが作業対象として利用できるProjectを確認する。
* ユーザーがProjectを指定していない場合に、候補一覧を提示する。

---

### P5-FR-003 Project Context取得Tool

指定されたProjectの基本ContextをAIクライアントが取得できること。

#### Tool

```text
get_project_context
```

#### 入力

| 項目                   | 必須性 | 内容                 |
| -------------------- | --: | ------------------ |
| `project_code`       |  必須 | 対象Project          |
| `include_entrypoint` |  任意 | AI Entrypointを含めるか |
| `include_sources`    |  任意 | 出典一覧を含めるか          |

#### 出力要件

* Project Summaryを含めること。
* Current Status、Active Decisions、Next Actionsへの導線または要約を含められること。
* 正本文書の出典を確認できること。
* 文書欠落または状態不明の場合にwarningを返せること。
* Project Contextが正本そのものではなく、正本参照結果であることを識別できること。

---

### P5-FR-004 Current Status取得Tool

指定されたProjectの現在状況をAIクライアントが取得できること。

#### Tool

```text
get_current_status
```

#### 入力

```text
project_code
```

#### 出力要件

* 現在の目的
* 現在Phase
* 進行中事項
* ブロッカー
* Pending Decision
* source path
* status
* updated_at
* warning

#### 利用目的

* 作業開始前に現在地を把握する。
* Agentが古い前提で回答することを防ぐ。
* Task Contextを構成する前提を確認する。

---

### P5-FR-005 Active Decisions取得Tool

指定されたProjectの現在有効な判断をAIクライアントが取得できること。

#### Tool

```text
list_active_decisions
```

#### 入力

| 項目                     | 必須性 | 内容               |
| ---------------------- | --: | ---------------- |
| `project_code`         |  必須 | 対象Project        |
| `include_related_adrs` |  任意 | 関連ADR情報を含めるか     |
| `include_history`      |  任意 | 置換済み判断を履歴として含めるか |

#### 出力要件

* 通常は `active` または `accepted` の判断を優先して返すこと。
* `superseded` または `deprecated` を含める場合は明示すること。
* 関連ADRの参照情報を返せること。
* AIクライアントが未確定事項を確定判断として扱わないよう状態を返すこと。

---

### P5-FR-006 Next Actions取得Tool

指定されたProjectの次アクションをAIクライアントが取得できること。

#### Tool

```text
list_next_actions
```

#### 入力

| 項目                 | 必須性 | 内容              |
| ------------------ | --: | --------------- |
| `project_code`     |  必須 | 対象Project       |
| `priority_filter`  |  任意 | P0 / P1等で絞り込む場合 |
| `include_deferred` |  任意 | 後回しタスクを含める場合    |

#### 出力要件

* `next-actions.md` を正本として取得すること。
* 優先度、作業内容、成果物、完了条件、状態を返せること。
* Tool経由でタスクを完了または変更しないこと。
* タスク変更が必要な場合は `create_doc_update_draft` の利用候補として提示できること。

---

### P5-FR-007 Memory Search Preview Tool

AIクライアントが関連記憶を検索する前に、検索候補、除外結果およびwarningを確認できること。

#### Tool

```text
preview_memory_search
```

#### 入力

| 項目                | 必須性 | 内容               |
| ----------------- | --: | ---------------- |
| `project_code`    |  必須 | 検索対象Project      |
| `agent_code`      |  任意 | Agent検索プロファイル適用時 |
| `query`           |  必須 | 検索クエリ            |
| `source_types`    |  任意 | 文書種別filter       |
| `memory_types`    |  任意 | 記憶分類filter       |
| `statuses`        |  任意 | 情報状態filter       |
| `include_history` |  任意 | 履歴検索有無           |
| `top_k`           |  任意 | 取得候補件数           |

#### 出力要件

* 採用候補となる検索結果を返せること。
* statusにより除外された結果を確認できること。
* stale index、deprecated、superseded、draft等のwarningを返せること。
* AIが履歴情報を利用する前にユーザーへ確認を促せるだけの情報を返すこと。

---

### P5-FR-008 Project Memory Search Tool

AIクライアントが、指定されたProjectとTaskに関連する記憶を検索できること。

#### Tool

```text
search_project_memory
```

#### 入力

| 項目                | 必須性 | 内容                              |
| ----------------- | --: | ------------------------------- |
| `project_code`    |  必須 | 検索対象Project                     |
| `agent_code`      |  任意 | Agent別検索方針を適用する場合               |
| `query`           |  必須 | 自然文またはキーワード検索条件                 |
| `filters`         |  任意 | source type、memory type、status等 |
| `top_k`           |  任意 | 結果件数上限                          |
| `include_history` |  任意 | 履歴情報を含めるか                       |

#### 出力要件

| 項目                    | 内容                            |
| --------------------- | ----------------------------- |
| `query`               | 実行した検索条件                      |
| `project_code`        | 対象Project                     |
| `agent_code`          | 適用Agent                       |
| `results`             | 関連記憶結果                        |
| `retrieved_context`   | AI回答またはContext Packに利用可能な整形情報 |
| `source_traceability` | 出典確認情報                        |
| `warnings`            | 古い情報、競合、索引状態等                 |
| `write_policy`        | 検索結果から正本を直接変更しない方針            |

#### 制約

* 検索結果は根拠候補であり、新しいDecisionとして自動登録しない。
* 検索結果を利用して回答する場合、出典または参照元が保持されること。
* 検索結果不足の場合は、推測で補完せず不足を示せること。

---

### P5-FR-009 Context Pack Preview Tool

AIクライアントがContext Pack生成前に、利用予定のProject、Agent、Task、参照文書、検索条件およびwarningを確認できること。

#### Tool

```text
preview_context_pack
```

#### 入力

| 項目             | 必須性 | 内容                          |
| -------------- | --: | --------------------------- |
| `project_code` |  必須 | 対象Project                   |
| `agent_code`   |  必須 | 対象Agent                     |
| `task_context` |  必須 | 今回の依頼内容                     |
| `retrieval`    |  任意 | Retrieved Contextを追加する場合の条件 |

#### 出力要件

* 選択されたProjectおよびAgentを返すこと。
* Task Contextの要約を返すこと。
* 読み込み予定の正本文書を返すこと。
* Retrieval利用時はquery、filter、件数上限を返すこと。
* 警告およびwrite policyを返すこと。
* Context Packを生成可能か判断できること。

#### 利用方針

AIクライアントが重大な文書作成、設計判断整理またはDraft作成へ進む場合、原則としてPreviewによるContext確認を先に行える構成とする。

---

### P5-FR-010 Context Pack生成Tool

AIクライアントが、指定されたProject、AgentおよびTask Contextに応じたContext Packを生成できること。

#### Tool

```text
build_context_pack
```

#### 入力

| 項目                | 必須性 | 内容              |
| ----------------- | --: | --------------- |
| `project_code`    |  必須 | 対象Project       |
| `agent_code`      |  必須 | 利用する専門Agent     |
| `task_context`    |  必須 | 今回処理する具体的依頼     |
| `retrieval`       |  任意 | 検索結果を追加するか、検索条件 |
| `include_sources` |  任意 | 出典詳細を含めるか       |

#### 出力要件

| 項目                 | 内容                  |
| ------------------ | ------------------- |
| `context_pack_id`  | 生成物識別子              |
| `project_code`     | 対象Project           |
| `agent_code`       | 対象Agent             |
| `task_title`       | 作業名称                |
| `context_pack`     | AIが利用可能な文脈本文        |
| `retrieval_used`   | 検索結果追加有無            |
| `source_documents` | 根拠文書                |
| `warnings`         | 警告                  |
| `write_policy`     | `draft_only` 等の操作境界 |
| `generated_at`     | 生成日時                |

#### 制約

* Context PackはAI入力用生成物であり正本ではない。
* MCP ToolがContext Packを生成しても、正本文書は変更されない。
* Context Pack内に未確定情報が存在する場合は明示すること。

---

### P5-FR-011 Doc Update Draft作成Tool

AIクライアントが、作業結果に基づく正本文書更新案をDraftとして作成できること。

#### Tool

```text
create_doc_update_draft
```

#### 有効化方針

本Toolは、Read / Search / Generate Toolの接続検証および権限制約確認後に有効化する。

#### 入力

| 項目                   | 必須性 | 内容                                                    |
| -------------------- | --: | ----------------------------------------------------- |
| `project_code`       |  必須 | 対象Project                                             |
| `draft_type`         |  必須 | update / new_document / adr_proposal / task_proposal等 |
| `target_source_path` |  必須 | 対象文書または想定保存先                                          |
| `title`              |  必須 | Draft名称                                               |
| `reason`             |  必須 | 更新案作成理由                                               |
| `proposed_content`   |  必須 | 全文案または差分案                                             |
| `based_on_sources`   |  必須 | 根拠となる取得情報                                             |
| `review_points`      |  任意 | 人間レビュー観点                                              |

#### 出力要件

* Draft IDを返すこと。
* statusは必ず `draft` とすること。
* 対象正本文書を返すこと。
* 正本へ未反映である旨を返すこと。
* 人間レビューが次の必須アクションであることを返すこと。
* `write_policy` を返すこと。

#### 制約

* AIクライアントがToolを実行しても正本文書を変更しない。
* ADR proposalを作成してもAccepted化しない。
* Task proposalを作成してもNext Actionsへ自動追加しない。
* Draftの反映Toolは提供しない。

---

### P5-FR-012 Doc Update Draft参照Tool

AIクライアントが、作成済みのDoc Update Draftを参照し、ユーザーへレビュー対象として提示できること。

#### Tool

```text
get_doc_update_draft
```

#### 入力

```text
draft_id
```

#### 出力要件

* Draft本文または差分案を返せること。
* 根拠文書を返せること。
* 対象正本文書を返せること。
* 未承認・未反映であることを明示すること。
* 人間レビュー後の反映操作はTool範囲外であることを示せること。

---

### P5-FR-013 MCP Tool入力検証

MCP Serverは、AIクライアントから受け取ったTool入力について、Gateway API呼出前に基本的な妥当性を確認できること。

#### 必須検証

| 入力                   | 検証内容                        |
| -------------------- | --------------------------- |
| `project_code`       | 必須入力であること、不正形式でないこと         |
| `agent_code`         | 必須Toolでは入力されていること、不正形式でないこと |
| `query`              | Search Toolで空ではないこと         |
| `task_context`       | Context生成Toolで必須項目が揃っていること  |
| `top_k`              | 許容範囲内であること                  |
| `include_history`    | 明示的に指定された場合のみ履歴利用すること       |
| `target_source_path` | Draft Toolで空でないこと           |
| `draft_type`         | 許可されたDraft種別であること           |
| `proposed_content`   | 空でなく、過大でないこと                |

#### 原則

* Tool入力が不正な場合、Gateway APIを呼び出さずにエラーを返せること。
* MCP Server側の検証は、Gateway API側の検証を代替するものではない。
* Gateway API側でも再度入力検証を実施すること。

---

### P5-FR-014 Gateway API認証情報管理

MCP ServerがMemory Gateway APIへ接続する際に必要となる認証情報を、安全に管理できること。

#### 必須要件

| 項目        | 内容                                                       |
| --------- | -------------------------------------------------------- |
| Secret非埋込 | API key、token等をソースコードまたは公開設定へ直接記載しない                     |
| 環境別管理     | ローカル検証環境と公開環境でcredentialを分離できる                           |
| 最小権限      | MCP Serverには必要なread / search / generate / draft権限のみを付与する |
| ログ非表示     | credentialをTool Result、エラー、監査ログへ含めない                     |
| 失効対応      | credentialを差し替えまたは無効化できること                               |

#### 未決定事項

API key、token、OAuth等の具体的な認証方式は設計仕様書で確定する。

---

### P5-FR-015 API ErrorからTool Errorへの変換

Memory Gateway APIが返したエラーを、AIクライアントが誤解なく扱えるMCP Tool Errorへ変換できること。

#### Error Mapping候補

| Gateway Error               | Tool Resultでの扱い              |
| --------------------------- | ---------------------------- |
| `INVALID_REQUEST`           | 入力が不足または不正であることを返す           |
| `AUTHENTICATION_REQUIRED`   | 接続認証が必要または失敗したことを返す          |
| `FORBIDDEN_OPERATION`       | Toolで許可されていない操作であることを返す      |
| `PROJECT_NOT_FOUND`         | Project指定の見直しが必要であることを返す     |
| `AGENT_NOT_FOUND`           | Agent指定の見直しが必要であることを返す       |
| `SOURCE_DOCUMENT_NOT_FOUND` | 必須文書不足のためContextが不完全であることを返す |
| `SEARCH_INDEX_NOT_READY`    | Search利用前に索引準備が必要であることを返す    |
| `STALE_INDEX_WARNING`       | 結果利用に注意が必要であることをwarningとして返す |
| `CONTEXT_GENERATION_FAILED` | Context Pack生成に失敗したことを返す     |
| `DRAFT_CREATION_FAILED`     | Draftが作成されていないことを返す          |

#### 原則

* Tool Error時に、AIクライアントが失敗した操作を成功したものとして扱えない形式にする。
* retry可能な失敗と、入力修正または人間確認が必要な失敗を区別できること。
* 内部stack trace、secret、許可外のパス情報をTool Resultへ露出しないこと。

---

### P5-FR-016 Tool実行の追跡

AIクライアントからMCP Toolが利用された場合に、どのProject、Agent、Taskおよび情報源を用いた処理であったか追跡できること。

#### 追跡対象

| 操作             | 記録すべき情報                                              |
| -------------- | ---------------------------------------------------- |
| Context取得      | client識別、project、tool名、request id、参照元概要              |
| Memory Search  | project、agent、query、filters、結果数、warnings             |
| Context Pack生成 | project、agent、task title、retrieval有無、context pack id |
| Draft作成        | project、target source、draft type、draft id、根拠情報       |
| Tool Error     | tool名、error code、request id、retryableか否か             |

#### 制約

* Tool実行ログは正本とは扱わない。
* credentialまたは不要な正本文書全文をログへ保存しない。
* AIクライアントの会話全文を無条件に監査ログへ保存しない。

---

### P5-FR-017 AIクライアント接続検証

MCP Serverを、検証可能なMCP対応AIクライアントから利用し、Tool呼出、Result受領および権限制約が成立することを確認できること。

#### 検証対象の扱い

| 項目       | 方針                                                          |
| -------- | ----------------------------------------------------------- |
| クライアント候補 | ChatGPT、Cursor、Claude、Codex系CLI等のうち、検証時点でMCP Tool接続が実施可能なもの |
| 必須検証数    | 最低1種類のAIクライアントで接続確認を行う                                      |
| 追加検証     | 複数クライアントで差異が生じる場合に実施する                                      |
| 正本性      | クライアント接続有無は正本構造を変更しない                                       |

#### 必須確認

* MCP Serverへ接続できること。
* 初期接続Toolセットを認識できること。
* Project Contextを取得できること。
* Memory Searchを実行できること。
* Context Packを生成できること。
* Draft Toolを有効化した場合、Draftのみ作成できること。
* 正本writeまたは禁止操作をToolとして実行できないこと。
* Tool結果に根拠およびwarningが保持されること。

---

### P5-FR-018 Mnemosyne接続検証

Project Mnemosyneを対象とし、要件定義レビューAgent相当の作業でMCP Tool利用が成立することを検証できること。

#### 検証シナリオ

| No.      | 検証内容      | Tool                                         | 期待結果                                |
| -------- | --------- | -------------------------------------------- | ----------------------------------- |
| P5-T-001 | Project取得 | `list_projects`                              | `mnemosyne` が利用可能Projectとして取得できる    |
| P5-T-002 | 現在地取得     | `get_project_context` / `get_current_status` | 現在Phaseと目的が取得できる                    |
| P5-T-003 | 判断取得      | `list_active_decisions`                      | Agent / Project Context分離等の判断が取得できる |
| P5-T-004 | 関連記憶検索    | `search_project_memory`                      | Phase構造やContext設計の根拠が取得できる          |
| P5-T-005 | Context生成 | `build_context_pack`                         | 要件レビューに必要なContext Packが生成できる        |
| P5-T-006 | Draft作成   | `create_doc_update_draft`                    | 要件文書修正案をdraftとしてのみ作成できる             |

#### 検証記録

```text
docs/review/phase-5-mnemosyne-mcp-validation.md
```

---

### P5-FR-019 ATS接続検証

ATSを対象とし、実装レビューAgent相当の作業でMCP Tool利用が成立することを検証できること。

#### 検証シナリオ

| No.      | 検証内容           | Tool                      | 期待結果                              |
| -------- | -------------- | ------------------------- | --------------------------------- |
| P5-T-007 | ATS Context取得  | `get_project_context`     | ATSの目的、状態、主要判断を取得できる              |
| P5-T-008 | 次アクション取得       | `list_next_actions`       | ATSの作業候補を取得できる                    |
| P5-T-009 | 実装判断検索         | `search_project_memory`   | `action_select` の責務・冪等性等の根拠を取得できる |
| P5-T-010 | レビュー用Context生成 | `build_context_pack`      | 実装レビューに必要なContext Packが生成できる      |
| P5-T-011 | 文書更新案作成        | `create_doc_update_draft` | docs更新案を正本非変更でdraft化できる           |

#### 検証記録

```text
docs/review/phase-5-ats-mcp-validation.md
```

---

### P5-FR-020 Phase 6入力要件整理

Phase 5で接続可能になったMCP Toolを、Phase 6で役割別Agentが実運用できるよう、Agent運用に必要な入力、制約および検証結果を整理できること。

#### 整理対象

| 論点           | 内容                          |
| ------------ | --------------------------- |
| Agent別Tool利用 | 各Agentが優先的に使用するTool         |
| Tool呼出順序     | 作業開始時、検索時、Draft作成時の推奨順序     |
| Context要件    | Agentが作業を完了するために必要なContext  |
| Human Review | Draft利用時に必要となる人間確認          |
| Tool不足       | Phase 5で不足したToolまたはResult情報 |
| Client差異     | AIクライアントごとのMCP利用差異          |
| 安全性          | Agent運用時にも維持すべき禁止操作         |
| 運用負荷         | Tool利用の頻度・確認負荷・記憶更新負荷       |

#### 対応成果物

```text
docs/phases/phase-6-input-requirements.md
```

---

## 10.11 MCP Tool Contract共通要件

### 10.11.1 Tool定義項目

各MCP Toolは、最低限以下の項目を定義する。

| 項目                    | 内容                               |
| --------------------- | -------------------------------- |
| `tool_name`           | Tool識別名                          |
| `purpose`             | Toolの目的                          |
| `allowed_operation`   | read / search / generate / draft |
| `input_schema`        | 入力項目と必須性                         |
| `output_schema`       | Tool Result構造                    |
| `gateway_endpoint`    | 対応するMemory Gateway API           |
| `required_permission` | 必要権限                             |
| `forbidden_actions`   | Toolで許可しない操作                     |
| `warning_policy`      | statusやstaleness warningの返却方針    |
| `error_mapping`       | API Errorとの対応                    |
| `audit_fields`        | 実行追跡に必要な情報                       |
| `review_requirement`  | 人間確認を必要とする場面                     |

### 10.11.2 Tool Result共通情報

Tool Resultには、操作内容に応じて以下を含める。

| 項目                     | 内容                   |
| ---------------------- | -------------------- |
| `tool_name`            | 実行Tool               |
| `request_id`           | Gateway API実行識別子     |
| `project_code`         | 対象Project            |
| `agent_code`           | 指定された場合のAgent        |
| `generated_at`         | Result生成日時           |
| `data`                 | Tool固有の取得・生成内容       |
| `sources`              | 参照元情報                |
| `warnings`             | 鮮度、状態、欠落、未確定情報等      |
| `write_policy`         | AIに許可される操作境界         |
| `next_required_action` | 人間レビュー等が必要な場合の次アクション |

### 10.11.3 Tool利用時のUser Confirmation方針

以下の操作は、正本を変更しないためToolとしては実行可能であるが、重要な成果物を作成する場面ではユーザーが結果を確認できることを前提とする。

| 操作              | 確認方針                       |
| --------------- | -------------------------- |
| Context Pack生成  | 生成結果およびsourcesを確認可能にする     |
| 履歴情報を含むSearch   | warningを明示する               |
| Draft作成         | 正本未反映であることを明示する            |
| ADR Proposal作成  | Acceptedではないことを明示する        |
| Task Proposal作成 | Next Actionsへ未反映であることを明示する |

---

## 10.12 Phase 5非機能要件

| ID         | 非機能要件         | 内容                                                            |
| ---------- | ------------- | ------------------------------------------------------------- |
| P5-NFR-001 | 接続抽象化         | AIクライアントは内部ファイル配置や検索実装を意識せずToolを利用できること                       |
| P5-NFR-002 | Gateway境界維持   | MCP ServerはMemory Gateway APIを経由し、正本や索引へ直接アクセスしないこと           |
| P5-NFR-003 | 正本非改変性        | MCP Tool利用により正本文書、ADR、Next Actionsが無承認で変更されないこと               |
| P5-NFR-004 | 権限制御          | Toolごとにread / search / generate / draftの必要権限を制御できること          |
| P5-NFR-005 | Credential安全性 | Gateway API接続用secretをソース、Tool Result、ログへ露出しないこと               |
| P5-NFR-006 | 根拠追跡性         | Tool Resultから参照元、状態、warningおよびrequest idを追跡できること              |
| P5-NFR-007 | 情報鮮度          | 古い情報、置換済み判断、索引警告をAIクライアントへ伝達できること                             |
| P5-NFR-008 | Error明示性      | Tool失敗を成功として誤認させず、修正可能な情報を返せること                               |
| P5-NFR-009 | Client可搬性     | MCP対応クライアントで同じTool目的および安全境界を維持できること                           |
| P5-NFR-010 | Project非依存性   | Project追加時にTool自体を個別開発せず、`project_code` により利用対象を切り替えられること     |
| P5-NFR-011 | Agent非依存性     | Agent追加時にTool自体を個別開発せず、`agent_code` によりContextと検索方針を切り替えられること |
| P5-NFR-012 | 運用透明性         | AIがToolを利用して取得・生成・draft化した内容をユーザーが確認可能であること                   |
| P5-NFR-013 | 段階的有効化        | Draft ToolをRead / Search / Generate検証後に有効化できること               |
| P5-NFR-014 | 監査可能性         | Tool利用結果および失敗を後から確認できること                                      |
| P5-NFR-015 | 拡張性           | Phase 6のAgent運用、将来のUIまたは他クライアントへTool境界を再利用できること               |

---

## 10.13 Phase 5制約

| ID       | 制約                                                         |
| -------- | ---------------------------------------------------------- |
| P5-C-001 | MCP ServerはMemory Gateway APIのみを記憶機能の接続先とする                |
| P5-C-002 | MCP Serverは正本文書、ADR、検索索引およびDraft Storageへ直接アクセスしない         |
| P5-C-003 | MCP Toolで公開する操作はread、search、generate、draftに限定する            |
| P5-C-004 | Source write、Draft反映、ADR採用、Task確定、記憶削除Toolを提供しない           |
| P5-C-005 | Context Pack、Retrieved ContextおよびTool Resultを正本として扱わない     |
| P5-C-006 | Draft Toolは、正本を変更しないことを確認した後に有効化する                         |
| P5-C-007 | Notion直接操作Toolを初期必須範囲に含めない                                 |
| P5-C-008 | Phase 5では専門Agentの自律実行および複数Agent統括を実装しない                    |
| P5-C-009 | Phase 5では自動承認・自動反映ワークフローを実装しない                             |
| P5-C-010 | Tool Resultには、可能な限りsource、status、warning、write policyを保持する |
| P5-C-011 | 対応可能なAIクライアントの範囲は、検証時点で実際に接続確認できるものに限定して判定する               |
| P5-C-012 | MCP transport、認証方式およびホスティング方式の具体選定は設計仕様書で確定する              |

---

## 10.14 Phase 5成果物

### 10.14.1 必須成果物

#### A. MCP仕様文書

| ファイル                                   | 目的                                     |
| -------------------------------------- | -------------------------------------- |
| `docs/mcp/mcp-overview.md`             | MCP Nexusの目的、責務、Gateway接続境界を定義する       |
| `docs/mcp/tool-catalog.md`             | 提供するMCP Tool一覧と操作区分を定義する               |
| `docs/mcp/tool-contract.md`            | Tool共通入力・出力・error・warning・権限規約を定義する    |
| `docs/mcp/gateway-integration-rule.md` | Memory Gateway APIとの接続方式と直接アクセス禁止を定義する |
| `docs/mcp/auth-and-secret-policy.md`   | Gateway接続credentialの管理方針を定義する          |
| `docs/mcp/draft-only-policy.md`        | Draft Toolの安全境界と提供しないToolを定義する         |
| `docs/mcp/client-connection-policy.md` | AIクライアント接続・利用条件・検証方針を定義する              |
| `docs/mcp/error-mapping-policy.md`     | Gateway ErrorをTool Errorへ変換する方針を定義する   |
| `docs/mcp/audit-policy.md`             | MCP Tool利用の追跡項目と秘密情報除外を定義する            |

#### B. MCP Server実装

| ファイル                                     | 目的                             |
| ---------------------------------------- | ------------------------------ |
| `src/mcp/server.ts`                      | MCP Serverのエントリポイント            |
| `src/mcp/gateway/memoryGatewayClient.ts` | Memory Gateway API接続Client     |
| `src/mcp/tools/listProjects.ts`          | `list_projects` Tool           |
| `src/mcp/tools/getProjectContext.ts`     | `get_project_context` Tool     |
| `src/mcp/tools/getCurrentStatus.ts`      | `get_current_status` Tool      |
| `src/mcp/tools/listActiveDecisions.ts`   | `list_active_decisions` Tool   |
| `src/mcp/tools/listNextActions.ts`       | `list_next_actions` Tool       |
| `src/mcp/tools/previewMemorySearch.ts`   | `preview_memory_search` Tool   |
| `src/mcp/tools/searchProjectMemory.ts`   | `search_project_memory` Tool   |
| `src/mcp/tools/previewContextPack.ts`    | `preview_context_pack` Tool    |
| `src/mcp/tools/buildContextPack.ts`      | `build_context_pack` Tool      |
| `src/mcp/tools/createDocUpdateDraft.ts`  | `create_doc_update_draft` Tool |
| `src/mcp/tools/getDocUpdateDraft.ts`     | `get_doc_update_draft` Tool    |
| `src/mcp/types/toolTypes.ts`             | Tool Input / Result型定義         |
| `src/mcp/utils/errorMapper.ts`           | Gateway ErrorからTool Errorへの変換  |
| `src/mcp/config/mcpConfig.ts`            | 接続設定読込およびcredential参照          |

#### C. Tool定義・設定例

| ファイル                                                       | 目的                               |
| ---------------------------------------------------------- | -------------------------------- |
| `config/mcp-tools.yaml`                                    | 有効化するTool、必要権限、段階有効化設定を管理する場合の設定 |
| `examples/mcp/client-config.example.md`                    | AIクライアント接続設定例                    |
| `examples/mcp/tool-calls/mnemosyne-requirements-review.md` | MnemosyneでのTool利用例               |
| `examples/mcp/tool-calls/ats-implementation-review.md`     | ATSでのTool利用例                     |

#### D. 検証記録

| ファイル                                                         | 目的                          |
| ------------------------------------------------------------ | --------------------------- |
| `docs/review/phase-5-mcp-server-connection-validation.md`    | MCP Server接続確認結果を記録する       |
| `docs/review/phase-5-mnemosyne-mcp-validation.md`            | MnemosyneでのTool利用検証結果を記録する  |
| `docs/review/phase-5-ats-mcp-validation.md`                  | ATSでのTool利用検証結果を記録する        |
| `docs/review/phase-5-mcp-write-boundary-validation.md`       | 正本write不可・Draft限定の検証結果を記録する |
| `docs/review/phase-5-mcp-client-compatibility-validation.md` | 検証したAIクライアントとの接続結果を記録する     |

#### E. Phase 6引継ぎ文書

| ファイル                                        | 目的                              |
| ------------------------------------------- | ------------------------------- |
| `docs/phases/phase-6-input-requirements.md` | 役割別Agent運用に必要なTool利用要件・残課題を整理する |

### 10.14.2 技術選定時に追加される可能性がある成果物

| ファイルまたは構成                                     | 条件                                          |
| --------------------------------------------- | ------------------------------------------- |
| `docs/design/mcp-nexus-design.md`             | MCP内部構造・transport・deploymentを設計文書として独立させる場合 |
| `src/mcp/middleware/toolAuthGuard.ts`         | Tool単位の権限制御を実装する場合                          |
| `src/mcp/services/toolAuditService.ts`        | MCP Tool実行監査をService化する場合                   |
| `src/mcp/repositories/toolAuditRepository.ts` | Tool実行履歴を永続化する場合                            |
| MCP接続用環境変数定義文書                                | 外部ホストまたは複数環境で運用する場合                         |
| Tool schemaの自動検証テスト                           | Tool数増加により契約崩れ防止が必要な場合                      |

---

## 10.15 Phase 5推奨ディレクトリ構成

```text
project-mnemosyne/
  config/
    mcp-tools.yaml

  docs/
    mcp/
      mcp-overview.md
      tool-catalog.md
      tool-contract.md
      gateway-integration-rule.md
      auth-and-secret-policy.md
      draft-only-policy.md
      client-connection-policy.md
      error-mapping-policy.md
      audit-policy.md

    phases/
      phase-5-input-requirements.md
      phase-6-input-requirements.md

    review/
      phase-5-mcp-server-connection-validation.md
      phase-5-mnemosyne-mcp-validation.md
      phase-5-ats-mcp-validation.md
      phase-5-mcp-write-boundary-validation.md
      phase-5-mcp-client-compatibility-validation.md

  examples/
    mcp/
      client-config.example.md
      tool-calls/
        mnemosyne-requirements-review.md
        ats-implementation-review.md

  src/
    mcp/
      server.ts

      gateway/
        memoryGatewayClient.ts

      tools/
        listProjects.ts
        getProjectContext.ts
        getCurrentStatus.ts
        listActiveDecisions.ts
        listNextActions.ts
        previewMemorySearch.ts
        searchProjectMemory.ts
        previewContextPack.ts
        buildContextPack.ts
        createDocUpdateDraft.ts
        getDocUpdateDraft.ts

      types/
        toolTypes.ts

      utils/
        errorMapper.ts

      config/
        mcpConfig.ts
```

---

## 10.16 Phase 5検証シナリオ

### 10.16.1 MCP Server接続検証

| No.      | 検証内容            | 入力・操作                           | 期待結果                        |
| -------- | --------------- | ------------------------------- | --------------------------- |
| P5-T-001 | MCP Server起動    | Server起動操作                      | MCP Serverが起動し、Tool定義を公開できる |
| P5-T-002 | Gateway接続確認     | MCP ServerからHealthまたは基本取得APIを利用 | Memory Gateway APIへ接続できる    |
| P5-T-003 | Tool一覧認識        | AIクライアントからTool一覧確認              | 有効化されたToolのみ認識できる           |
| P5-T-004 | Credential非露出確認 | Tool Resultおよびログ確認              | API credentialが露出しない        |

### 10.16.2 Read Tool検証

| No.      | 検証内容                | Tool                    | 期待結果                       |
| -------- | ------------------- | ----------------------- | -------------------------- |
| P5-T-005 | Project一覧取得         | `list_projects`         | `mnemosyne` と `ats` が取得できる |
| P5-T-006 | Mnemosyne Context取得 | `get_project_context`   | 正本由来のContextとsourcesが返る    |
| P5-T-007 | ATS Status取得        | `get_current_status`    | ATSの現在地が返る                 |
| P5-T-008 | 判断一覧取得              | `list_active_decisions` | active / accepted判断が優先される  |
| P5-T-009 | 次アクション取得            | `list_next_actions`     | 正本タスクを読み取り専用で取得できる         |

### 10.16.3 Search Tool検証

| No.      | 検証内容        | Tool / Query                                  | 期待結果                  |
| -------- | ----------- | --------------------------------------------- | --------------------- |
| P5-T-010 | Mnemosyne検索 | `search_project_memory`: AgentとContext分離方針    | 関連ADRまたは判断が返る         |
| P5-T-011 | ATS検索       | `search_project_memory`: `action_select` の冪等性 | ATS関連記憶が返る            |
| P5-T-012 | Preview検索   | `preview_memory_search`: 履歴候補を含む検索            | 除外理由・warningを確認できる    |
| P5-T-013 | 索引未準備エラー    | 未索引Projectで検索                                 | Tool Errorとして明示される    |
| P5-T-014 | Project分離確認 | ATS指定で検索                                      | Mnemosyne記憶が意図せず混入しない |

### 10.16.4 Context Pack Tool検証

| No.      | 検証内容                | Tool                   | 期待結果                            |
| -------- | ------------------- | ---------------------- | ------------------------------- |
| P5-T-015 | Mnemosyne Preview   | `preview_context_pack` | 読込文書、warning、write policyが確認できる |
| P5-T-016 | Mnemosyne Context生成 | `build_context_pack`   | 要件レビュー用Context Packが生成できる       |
| P5-T-017 | ATS Context生成       | `build_context_pack`   | 実装レビュー用Context Packが生成できる       |
| P5-T-018 | Retrieved Context付加 | retrieval有効で生成         | Retrieved Contextを含む生成結果が返る     |
| P5-T-019 | Agent切替確認           | 同一Projectで異なるAgentを指定  | Agent Contextと検索方針が切り替わる        |
| P5-T-020 | Project切替確認         | 同一Agentで異なるProjectを指定  | Project Contextが切り替わる           |

### 10.16.5 Draft Tool検証

| No.      | 検証内容             | Tool                      | 期待結果                        |
| -------- | ---------------- | ------------------------- | --------------------------- |
| P5-T-021 | Draft Tool無効状態確認 | 初期接続検証前にDraft実行           | 無効化または利用制限を確認できる            |
| P5-T-022 | Draft作成          | `create_doc_update_draft` | draft状態の更新案だけが作成される         |
| P5-T-023 | Draft参照          | `get_doc_update_draft`    | 未反映表示を含むDraftが取得できる         |
| P5-T-024 | 正本非変更確認          | Draft実行前後の正本比較            | 正本文書に変更がない                  |
| P5-T-025 | ADR自動採用防止        | ADR proposal draft作成      | Accepted化されない               |
| P5-T-026 | Task自動確定防止       | Task proposal draft作成     | `next-actions.md` へ自動反映されない |

### 10.16.6 禁止操作・Error検証

| No.      | 検証内容          | 期待結果                                     |                           |
| -------- | ------------- | ---------------------------------------- | ------------------------- |
| P5-T-027 | 正本更新Tool不存在確認 | Tool一覧にwrite / apply / accept Toolが存在しない |                           |
| P5-T-028 | 禁止操作要求        | AIクライアントが正本反映を求める                        | 実行可能Toolがなく、Draft利用に限定される |
| P5-T-029 | 不存在Project    | Tool Errorが明示される                         |                           |
| P5-T-030 | 不存在Agent      | Tool Errorが明示される                         |                           |
| P5-T-031 | 不正入力          | Gateway呼出前またはGateway側で拒否され、副作用がない        |                           |
| P5-T-032 | API認証失敗       | Tool Errorとして返り、secretが表示されない            |                           |

### 10.16.7 AIクライアント利用検証

| No.      | 検証内容           | 期待結果                           |
| -------- | -------------- | ------------------------------ |
| P5-T-033 | 対応クライアント接続     | 最低1種類のAIクライアントからMCP Toolを利用できる |
| P5-T-034 | Contextを用いた回答  | Tool取得情報を踏まえて回答できる             |
| P5-T-035 | 根拠表示           | sourcesまたは参照元を確認できる            |
| P5-T-036 | warning利用      | 未確定・履歴・stale情報を確定事項として扱わない     |
| P5-T-037 | Draft作成後の利用者確認 | Draftが正本未反映であることをユーザーが判断できる    |

---

## 10.17 Phase 5完了条件

### 10.17.1 Definition of Done

Phase 5は、以下をすべて満たした時点で完了とする。

| No.    | 完了条件                                                   | 判定観点                                      |
| ------ | ------------------------------------------------------ | ----------------------------------------- |
| DoD-01 | MCP Serverの目的、責務およびGateway接続境界が文書化されている                | MCPとAPIの役割を説明できる                          |
| DoD-02 | MCP Tool Catalogおよび共通Tool Contractが定義されている             | Tool目的・入力・出力・禁止事項が明確である                   |
| DoD-03 | MCP ServerがMemory Gateway APIへ接続できる                    | 内部正本へ直接アクセスせず機能を利用できる                     |
| DoD-04 | 初期接続Toolセットが実装されている                                    | Read / Search / Generate操作をAIクライアントへ公開できる |
| DoD-05 | Draft Toolを安全に有効化できる                                   | 正本非変更を維持しながらDraftを作成・参照できる                |
| DoD-06 | Tool Resultにsources、status、warning、write policyを含められる  | 根拠と操作境界を確認できる                             |
| DoD-07 | Gateway Errorを適切なTool Errorへ変換できる                      | AIクライアントが失敗を誤認しない                         |
| DoD-08 | Gateway API credentialが安全に管理される                        | ソース・Result・ログへsecretが露出しない                |
| DoD-09 | Mnemosyneに対するMCP Tool利用検証が完了している                       | 要件レビュー用途で利用可能である                          |
| DoD-10 | ATSに対するMCP Tool利用検証が完了している                             | 実装レビュー用途で利用可能である                          |
| DoD-11 | 最低1種類のMCP対応AIクライアントからTool利用を確認している                     | 接続層として成立している                              |
| DoD-12 | Agent指定およびProject指定によりContext利用対象を切り替えられる              | 汎用専門Agent構想へ接続できる                         |
| DoD-13 | Source write、Draft反映、ADR採用、Task確定、delete Toolが提供されていない | 人間承認境界が維持されている                            |
| DoD-14 | Tool実行の追跡情報を確認できる                                      | 問題発生時に利用状況を追える                            |
| DoD-15 | Phase 6でAgent運用を開始するための入力要件が整理されている                    | 役割別Agent運用へ進める                            |
| DoD-16 | Agent自律実行、自動承認、自動反映、Notion直接操作へ不要に着手していない              | Phase 5スコープを維持している                        |

### 10.17.2 完了判定

| 判定             | 条件                                                              |
| -------------- | --------------------------------------------------------------- |
| Go             | 全DoDを満たし、AIクライアントからread / search / generate / draftを安全に利用できる    |
| Conditional Go | 特定クライアントでの接続差異またはTool UXに改善課題はあるが、Agent運用の試行へ進める                |
| No Go          | Gateway境界、正本非改変、credential管理、Tool Error処理またはClient接続のいずれかが成立しない |

---

## 10.18 Phase 5からPhase 6への引継ぎ要件

| ID        | 引継ぎ事項          | 内容                                               |
| --------- | -------------- | ------------------------------------------------ |
| P5-HO-001 | 利用可能Tool一覧     | Agentが利用できるRead / Search / Generate / Draft Tool |
| P5-HO-002 | Agent別Tool利用条件 | Agent目的に応じた推奨Toolおよび利用順序                         |
| P5-HO-003 | Context生成方式    | `Project × Agent × Task` に応じたTool利用方式            |
| P5-HO-004 | Search利用方式     | Agent別検索プロファイルおよびwarning処理                       |
| P5-HO-005 | Draft利用境界      | Agentが作成可能な更新案と人間レビュー条件                          |
| P5-HO-006 | Client接続検証結果   | 利用可能なAIクライアントおよび制約                               |
| P5-HO-007 | Tool不足・改善課題    | Agent実運用に必要なTool追加候補                             |
| P5-HO-008 | Audit要件        | Agent作業時に保持すべきTool利用履歴                           |
| P5-HO-009 | 安全制約           | write / reflect / deleteを許可しない方針                 |
| P5-HO-010 | 運用負荷           | Preview、検索、Draft確認に伴う人間作業負荷                      |

---

## 10.19 Phase 5時点の未決定事項

| ID        | 論点                                          | Phase 5での扱い                           | 後続判断                          |
| --------- | ------------------------------------------- | ------------------------------------- | ----------------------------- |
| P5-OI-001 | MCP Serverのtransport方式                      | 要件定義では確定しない                           | 設計仕様書および利用クライアント条件で判断         |
| P5-OI-002 | MCP Serverのホスティング方式                         | ローカルまたは限定公開を初期候補とする                   | 接続クライアント・認証方式確定後に判断           |
| P5-OI-003 | 初期検証対象とするAIクライアント                           | 接続可能な最低1種類を必須とする                      | 実装時点の利用可能性で確定                 |
| P5-OI-004 | Draft Toolを初期から公開するか                        | Read / Search / Generate検証後の有効化を基本とする | 接続検証結果で判断                     |
| P5-OI-005 | `get_related_adrs` を独立Toolとするか              | `search_project_memory` で代替可能か確認する    | Agent運用検証後に判断                 |
| P5-OI-006 | `list_available_agents` を提供するか              | 任意Tool候補とする                           | Phase 6のAgent選択UXで判断          |
| P5-OI-007 | Tool監査ログの保存先および保持期間                         | 追跡要件のみ定義する                            | 運用仕様で判断                       |
| P5-OI-008 | MCP経由の会話要約作成Toolを追加するか                      | Phase 5初期対象外                          | Automation / Governance検討時に判断 |
| P5-OI-009 | Notion操作Toolを追加するか                          | 初期対象外                                 | 正本・副本同期方針確定後に判断               |
| P5-OI-010 | Phase 6でAgent定義をMarkdownとRegistryのどちらを主とするか | 未確定                                   | Agent Operation要件定義時に判断       |

---

# 11. 次分冊で定義する範囲

次分冊では、以下を定義する。

```text
Phase 6：Agent Operation
  - 役割別Agentの運用単位
  - Agent Definitionの標準構造
  - Agent RegistryとMCP Toolの連携
  - Planning / Requirements Review / ADR / Implementation Review / Article等のAgent要件
  - Agent × Project Context × Task Context の実運用
  - Draft作成と人間レビューの運用
  - Agent別検証シナリオ
  - Automation & Governanceへの引継ぎ
```

Phase 6は、Phase 5でAIクライアントから利用可能となった外部記憶Toolを、役割別の専門Agentが実際の作業へ適用する運用フェーズとする。

## 今回の設計上の整理

| 項目             | 旧案                      | 今回のPhase 5要件                                     |
| -------------- | ----------------------- | ------------------------------------------------ |
| MCP Serverの接続先 | Memory APIとの接続          | **Memory Gateway APIのみ**へ接続し、正本・索引へ直接アクセスしない     |
| Toolの役割        | 外部記憶取得の候補               | Read / Search / Generate / Draft の操作区分として定義      |
| Agentとの関係      | Agentが記憶を取得する           | Toolは操作、Agentは役割として分離                            |
| 初期MVP表現        | Phase 5の一部Toolを初期MVPと表現 | Phase 1＋2を初期MVPとし、Phase 5は**初期接続Toolセット**と表現     |
| Draft          | 作成可能                    | Read / Search / Generate検証後に段階的有効化し、反映Toolは提供しない |
| Project固有化     | ATS Memory MCP Server中心 | `project_code` と `agent_code` で汎用利用可能にする         |
| Phase 6接続      | Agent Operationへ進む      | Agent別Tool利用・人間レビュー・残課題を引き継ぐ                     |

Phase 5の中核は、MCP対応AIクライアントに便利なToolを増やすことではなく、**AIが記憶へアクセスできる一方で、正本を勝手に確定・更新できない境界をTool Contractとして固定すること**です。

## Conversation Memory

### fact

* JP: Project Mnemosyneでは、Markdown docsおよびADRを初期正本とし、Context Pack、検索索引、Retrieved Context、Memory Gateway APIおよびMCP Serverは正本そのものではない構造として整理している。 / EN: Project Mnemosyne treats Markdown docs and ADRs as initial sources of truth; Context Packs, search indexes, Retrieved Context, the Memory Gateway API, and the MCP Server are not sources of truth.
* JP: Phase 1では記憶構造・分類・更新ルール、Phase 2では `Project × Agent × Task` に基づくContext Pack生成、Phase 3では検索によるRetrieved Context補完、Phase 4ではMemory Gateway APIを要件化した。 / EN: Phase 1 defines memory structure, classification, and update rules; Phase 2 defines Context Pack generation based on `Project × Agent × Task`; Phase 3 defines retrieval-based supplementation; Phase 4 defines the Memory Gateway API.
* JP: 初期構想のPhase 5では、AIクライアントから外部記憶基盤を利用するためのMCP Serverと、Context取得・検索・Draft作成Toolが候補として示されていた。 / EN: The original Phase 5 concept proposed an MCP Server and tools for context retrieval, search, and draft creation so AI clients could use the external memory base.
* JP: 本回答では、Phase 5：MCP Nexusの要件定義本文を、Phase別要件定義書へ追記可能な形式で作成した。 / EN: This response created the Phase 5: MCP Nexus requirements section in a form that can be appended to the phase requirements document.

### decision

* JP: Phase 5のMCP ServerはMemory Gateway APIのクライアントとして実装し、正本文書・検索索引・Draft Storageへ直接アクセスしない方針とした。 / EN: The Phase 5 MCP Server will be implemented as a client of the Memory Gateway API and will not directly access source documents, search indexes, or draft storage.
* JP: MCP Toolで公開する操作は `read / search / generate / draft` に限定し、正本write、Draft反映、ADR採用、Task確定、delete Toolは提供しない方針とした。 / EN: MCP tools are limited to `read / search / generate / draft`; source writes, draft application, ADR acceptance, task completion, and deletion tools are not provided.
* JP: MCP Toolは記憶基盤への操作であり、専門Agentは取得した記憶を用いて作業を行う役割であるため、両者を分離して扱う。 / EN: MCP tools are operations on the memory base, while specialist agents are roles that use retrieved memory to perform work; they are treated separately.
* JP: Phase 5は初期MVPではなく、Phase 1＋2で成立した初期MVPをAIクライアントへ接続する拡張フェーズとして扱う。 / EN: Phase 5 is not the initial MVP; it is an extension phase that connects the MVP established by Phases 1 and 2 to AI clients.

### task

* JP: 次分冊として、Phase 6：Agent Operationの要件定義を作成する。 / EN: Create the next section defining Phase 6: Agent Operation.
* JP: 後続の設計仕様書で、MCP transport方式、ホスティング方式、Gateway認証方式、Tool監査ログ保存方式、初期検証クライアントを具体化する。 / EN: Specify the MCP transport, hosting method, Gateway authentication, tool audit log storage, and initial validation client in later design specifications.

### preference

* JP: AIクライアント接続を導入しても、正本の管理責任と人間承認境界をTool Contractとして維持する進め方を重視する。 / EN: The preferred approach is to preserve source-of-truth responsibility and human approval boundaries as tool contracts even after connecting AI clients.
* JP: Toolをプロジェクト専用化せず、`project_code` と `agent_code` により複数Project・複数Agentへ再利用できる構成を重視する。 / EN: The design prioritizes reusable tools controlled by `project_code` and `agent_code`, rather than project-specific tools.

### constraint

* JP: Phase 5では、正本更新Tool、Draft反映Tool、ADR採用Tool、Task完了Tool、記憶削除Tool、Notion直接操作Tool、Agent自律実行、自動承認・自動反映を対象外とする。 / EN: Phase 5 excludes source-update tools, draft-application tools, ADR acceptance tools, task-completion tools, memory deletion tools, direct Notion tools, autonomous agents, and automatic approval or reflection.
* JP: Draft ToolはRead / Search / Generate Toolの安全性および追跡性確認後に有効化する。 / EN: Draft tools are enabled only after validating the safety and traceability of Read, Search, and Generate tools.
* JP: MCP Serverの具体的なtransport、ホスティングおよび認証方式は要件定義では固定しない。 / EN: The specific MCP transport, hosting, and authentication methods are not fixed in the requirements document.

### issue

* JP: 初期検証対象とするMCP対応AIクライアント、MCP Serverのtransport方式、ホスティング方式、Gateway認証方式は未確定である。 / EN: The initial MCP-compatible AI client, MCP Server transport, hosting method, and Gateway authentication method remain undecided.
* JP: `get_related_adrs` および `list_available_agents` を独立Toolとして追加する必要性は、Phase 6のAgent運用検証を踏まえて判断する必要がある。 / EN: Whether to add `get_related_adrs` and `list_available_agents` as separate tools must be decided based on Phase 6 agent-operation validation.
* JP: MCP Tool実行ログの保存先および保持期間は未確定である。 / EN: The storage location and retention period for MCP tool execution logs remain undecided.

### idea

* JP: Phase 5初期接続ToolセットをRead / Search / Generate中心にし、Draft Toolを段階的に有効化することで、正本非改変性を検証しながら接続範囲を拡張できる。 / EN: Starting Phase 5 with Read, Search, and Generate tools and enabling Draft tools gradually allows expansion while validating that sources of truth remain unchanged.
* JP: Agent Operationでは、Agentごとに推奨Tool呼出順序を定義すると、Context取得からDraft作成までの運用品質を揃えやすい。 / EN: In Agent Operation, defining a recommended tool-call sequence per agent can standardize work quality from context retrieval through draft creation.

### article_note

* JP: MCP導入の価値は、AIへファイル操作権限を広げることではなく、正本境界を維持したまま、記憶取得・検索・草案作成を自然なToolとして利用可能にすることである。 / EN: The value of MCP is not expanding file-write privileges for AI, but enabling natural tools for memory retrieval, search, and drafting while keeping source boundaries intact.

### conversation_summary

* JP: 本チャットでは、Phase 1作業計画書を基準に全体要件定義書を再構成し、Phase別要件を分割作成している。Phase 1では正本構造と運用、Phase 2ではContext Pack生成、Phase 3では検索補完、Phase 4ではMemory Gateway APIを定義した。今回、Phase 5を、Memory Gateway APIのみを経由してAIクライアントへRead / Search / Generate / Draft Toolを提供し、正本writeを許可しないMCP接続層として定義した。 / EN: This chat rebuilt the overall requirements from the Phase 1 plan and is creating phased requirements in sections. Phase 1 defines source-of-truth operations, Phase 2 defines Context Pack generation, Phase 3 defines retrieval supplementation, and Phase 4 defines the Memory Gateway API. This response defines Phase 5 as an MCP connection layer that exposes Read, Search, Generate, and Draft tools to AI clients only through the Memory Gateway API, without permitting source writes.

### test_result

* JP: Phase 5要件定義では、原案のMCP Serverと記憶取得・検索・Draft Tool構想を維持しつつ、Gateway経由原則、ToolとAgentの責務分離、初期接続Toolセット、Draft段階有効化、禁止Tool、Client検証およびPhase 6引継ぎを追加できた。 / EN: The Phase 5 requirements preserve the original MCP Server and retrieval/search/draft tool concept while adding the Gateway-only rule, separation of tools from agents, an initial connection tool set, staged draft enablement, prohibited tools, client validation, and handoff to Phase 6.
