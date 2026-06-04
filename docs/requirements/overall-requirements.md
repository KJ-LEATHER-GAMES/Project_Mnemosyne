# Project Mnemosyne 全体要件定義書

## 0. 文書情報

| 項目       | 内容                                              |
| -------- | ----------------------------------------------- |
| 文書名      | Project Mnemosyne 全体要件定義書                       |
| 保存先      | `docs/requirements/overall-requirements.md`     |
| 文書ステータス  | Draft                                           |
| 対象プロジェクト | Project Mnemosyne                               |
| 基準文書     | `docs/phases/phase-1-memory-foundation.md`      |
| 主対象      | AI外部記憶基盤および汎用的な専門Agent利用基盤                      |
| 初期検証対象   | Project Mnemosyne / Adventure Token System（ATS） |

---

## 1. 本書の目的

本書は、Project Mnemosyne 全体の目的、対象範囲、設計原則、機能要件、非機能要件、情報の正本・副本方針、およびPhase間の責務境界を定義する全体要件定義書である。

Phase 1の詳細な作業内容、成果物、実施順序および完了判定については、`docs/phases/phase-1-memory-foundation.md` を正とする。

本書とPhase 1作業計画書の間でPhase 1に関する記載が競合する場合、Phase 1の実施内容および成果物についてはPhase 1作業計画書を優先し、本書を改訂して整合させる。

---

## 2. プロジェクト概要

### 2.1 プロジェクト名

**Project Mnemosyne：AI外部記憶基盤を作る**

### 2.2 目的

Project Mnemosyneは、AIとの会話、設計判断、タスク、課題、検証結果、記事メモ、ドキュメント更新案などを、再利用可能な外部記憶として整理し、AIが必要な文脈を適切に参照できる状態を作るための基盤である。

本プロジェクトの目的は、AIにすべてを暗黙的に記憶させることではない。

```text
AIに記憶を持たせるのではなく、
AIが参照できる記憶基盤を作る。
```

また、会話を単なる履歴として蓄積するのではなく、設計判断・現在地・次アクション・検証結果として再利用可能な形へ変換する。

```text
会話を流さず、設計資産に変換する。
```

### 2.3 発展後の位置づけ

Project Mnemosyneは、単一プロジェクト向けの記憶保管基盤に留まらず、将来的には以下を組み合わせて利用できる基盤を目指す。

```text
汎用的な専門Agent
  ×
Project Context
  ×
Task Context
```

例：

```text
ADR整理Agent × ATS Context × 設計判断整理タスク
実装レビューAgent × ATS Context × UseCaseレビュータスク
要件定義Agent × TapLog Context × MVP要件整理タスク
記事化Agent × ATS Context × 開発日記作成タスク
```

---

## 3. 背景と解決したい課題

### 3.1 背景

個人開発や情報発信をAIと進める中で、プロジェクトごとの前提、過去の設計判断、現在の実装状況、未解決課題、次に進めるべき作業が、複数のチャットや文書に分散する。

ATSのように設計判断や実装履歴が増えたプロジェクトでは、会話を継続するたびに前提説明が必要となり、古い情報と現在有効な判断が混在しやすくなる。

また、今後ATS以外のプロジェクトへAI活用を展開する場合、プロジェクトごとに個別のAgentを作るのではなく、役割単位の専門Agentへ必要なProject Contextを渡して再利用できる構造が必要となる。

### 3.2 解決対象となる課題

| ID    | 課題             | 内容                                        |
| ----- | -------------- | ----------------------------------------- |
| P-001 | 前提説明の繰り返し      | 新しいチャットやAIクライアントへ毎回プロジェクト概要を説明する必要がある     |
| P-002 | 判断履歴の散逸        | なぜその設計や運用方針を採用したのかが会話ログに埋もれる              |
| P-003 | 情報種別の混在        | Fact、Decision、Task、Issue、Ideaが同一会話内で混在する  |
| P-004 | 情報鮮度の不明確さ      | 古い判断や廃止済み方針をAIが現在有効な情報として扱う可能性がある         |
| P-005 | 次アクションの分断      | 会話で発生したタスクが正本に反映されず、継続作業へ接続しにくい           |
| P-006 | AIクライアント間の文脈分断 | ChatGPT、Cursor、Claude等で同じプロジェクト情報を再利用しにくい |
| P-007 | プロジェクト専用化      | AgentやContext設計が特定プロジェクト専用になり、横展開しにくい     |
| P-008 | 自動化の先行リスク      | 正本構造や更新ルールが未定義のままRAG、API、MCPへ進むと整理コストが増える |

---

## 4. 基本コンセプト

### 4.1 外部記憶基盤

Project Mnemosyneは、AIが必要な情報を必要な時に参照できるよう、文書・判断記録・将来の構造化記憶・検索基盤を組み合わせて管理する。

### 4.2 正本と副本の分離

情報は、正しい判断根拠として扱う**正本**と、可視化・検索・AI入力のために生成される**副本または生成物**に分ける。

RAG、MCP、Context Packは情報へ到達する仕組みまたは加工結果であり、正本そのものとはしない。

### 4.3 会話から記憶への変換

AIとの生の会話ログは一次メモとして扱い、そのまま正本にはしない。

```text
会話ログ
  ↓
Conversation Summary
  ↓
Fact / Decision / Task / Issue / Idea / Constraint 等へ分類
  ↓
人間レビュー
  ↓
正本文書またはADRへ反映
```

### 4.4 AgentとProject Contextの分離

専門Agentは、ATSやTapLogなど特定プロジェクト専用の実装として定義しない。

Agentは役割・参照範囲・禁止事項・出力形式を持つ再利用可能な定義とし、作業対象となるプロジェクトのContextを差し替えて利用する。

```text
Agent定義 = 何を行うか
Project Context = 何について行うか
Task Context = 今回何を処理するか
```

---

## 5. 対象範囲

### 5.1 プロジェクト全体の対象範囲

Project Mnemosyne全体では、以下を対象とする。

| 分類               | 対象内容                                                                       |
| ---------------- | -------------------------------------------------------------------------- |
| 記憶方針             | 正本・副本・生成物・一次メモの境界定義                                                        |
| 記憶分類             | Fact、Decision、Task、Issue、Idea、Constraint等の分類                               |
| 状態管理             | draft、active、superseded、deprecated、archived等の管理                            |
| プロジェクト記憶         | Project Summary、Current Status、Active Decisions、Next Actions、AI Entrypoint |
| 判断管理             | ADRによる重要判断と理由の記録                                                           |
| 会話記憶化            | 会話要約と記憶候補の抽出                                                               |
| Context設計        | Base / Project / Agent / Session / Recent Conversation / Task Context の整理  |
| Context Pack     | AIへ渡す文脈の生成                                                                 |
| Project Registry | プロジェクトと記憶保存先の管理                                                            |
| Agent Registry   | 専門Agentの役割・必要Context・出力形式の管理                                               |
| 記憶検索             | 将来的な文書検索および意味検索                                                            |
| 外部接続             | 将来的なAPIおよびMCP連携                                                            |
| 安全な更新            | AIによる更新案作成と人間承認による反映                                                       |

### 5.2 初期スコープ

初期スコープは、Phase 1およびPhase 2により、正本構造とContext生成の基盤を作るところまでとする。

```text
Phase 1：記憶構造・分類・更新ルールを確定する
Phase 2：Project × Agent × Task に必要なContext Packを生成できる状態を作る
```

### 5.3 Phase 1時点の対象外

Phase 1では以下を実装対象に含めない。

| 対象外                | 理由                                    |
| ------------------ | ------------------------------------- |
| PostgreSQLによる記憶管理  | Markdownでの構造検証を先に行うため                 |
| Vector Store / RAG | 正本構造と鮮度ルール確定後に導入すべきため                 |
| Memory API         | Context取得方式が固まった後に設計するため              |
| MCP Server         | APIおよびContext仕様確定後に接続するため             |
| Agent実行基盤          | Phase 1ではAgentが必要とするContextの整理までとするため |
| 自動Notion更新         | 正本・副本の運用検証前に自動化しないため                  |
| 自動GitHub docs更新    | AIによる直接更新を初期方針で禁止するため                 |
| Web UI             | CLIまたは手動運用で要件を確認した後に検討するため            |
| 複雑な認証・権限管理         | 初期の個人利用スコープを超えるため                     |

---

## 6. 設計原則

### 6.1 初期正本はMarkdown docsとADRとする

Phase 1では、プロジェクトの記憶および重要判断の正本をMarkdown docsとADRで管理する。

| 情報       | 初期正本                                                      |
| -------- | --------------------------------------------------------- |
| 記憶管理方針   | `docs/memory/memory-policy.md`                            |
| 記憶分類     | `docs/memory/memory-taxonomy.md`                          |
| 更新手順     | `docs/memory/memory-update-flow.md`                       |
| 参照優先順位   | `docs/memory/context-source-priority.md`                  |
| プロジェクト概要 | `docs/projects/{project_code}/memory/project-summary.md`  |
| 現在状況     | `docs/projects/{project_code}/memory/current-status.md`   |
| 有効な判断一覧  | `docs/projects/{project_code}/memory/active-decisions.md` |
| 次アクション   | `docs/projects/{project_code}/memory/next-actions.md`     |
| AI参照入口   | `docs/projects/{project_code}/memory/ai-entrypoint.md`    |
| 重要な設計判断  | `docs/adr/*.md`                                           |

### 6.2 正本・副本・生成物・一次メモを区別する

| 情報種別                 | Phase 1での扱い     | 将来の扱い           | 正本性      |
| -------------------- | --------------- | --------------- | -------- |
| Markdown docs        | 方針・プロジェクト記憶を管理  | 継続利用            | 正本       |
| ADR                  | 重要判断と理由を管理      | 継続利用            | 正本       |
| AIチャット履歴             | 会話の元データ         | 必要に応じて保存        | 一次メモ     |
| Conversation Summary | 正本反映候補の整理       | 構造化保存候補         | レビュー前は草案 |
| Notion               | 必要時のみ運用ビューとして利用 | 可視化・一覧管理        | 副本       |
| PostgreSQL           | Phase 1対象外      | 構造化記憶・状態管理の正本候補 | 将来判断     |
| Vector Store         | Phase 1対象外      | 検索用インデックス       | 副本       |
| Context Pack         | Phase 1対象外      | AI入力用に生成        | 生成物      |
| MCP Server           | Phase 1対象外      | AIクライアント接続口     | 接続手段     |

### 6.3 タスクの初期正本は `next-actions.md` とする

Phase 1およびMarkdown中心の初期運用では、タスクの正本を以下とする。

```text
docs/projects/{project_code}/memory/next-actions.md
```

Notion Task DBを導入する場合も、初期段階では運用ビューまたは副本として扱い、正本の変更は別途判断記録を残した上で行う。

### 6.4 AIは草案作成までとする

AIに許可する操作境界は以下とする。

| 操作                       | 許可方針    |
| ------------------------ | ------- |
| read                     | 許可      |
| summarize                | 許可      |
| classify                 | 許可      |
| draft                    | 許可      |
| update proposal          | 許可      |
| write to source of truth | 人間承認後のみ |
| delete                   | 原則禁止    |

### 6.5 古い情報を現在有効な判断として扱わない

情報には状態を持たせ、現在有効な情報と履歴情報を区別する。

| 状態           | 意味         | AI参照時の扱い    |
| ------------ | ---------- | ----------- |
| `draft`      | 検討中・未承認    | 確定事項として扱わない |
| `proposed`   | 提案済み・判断待ち  | 候補として扱う     |
| `active`     | 現在有効       | 優先的に参照する    |
| `accepted`   | 採用済み判断     | 判断根拠として参照する |
| `superseded` | 新判断に置換済み   | 履歴としてのみ参照する |
| `deprecated` | 非推奨または廃止予定 | 原則として根拠にしない |
| `archived`   | 完了・保管      | 必要時のみ参照する   |

---

## 7. 文書構造および保存先要件

### 7.1 文書の責務分離

記憶に関する文書は、以下の3層へ分離する。

| 層          | 保存先                                    | 役割                      |
| ---------- | -------------------------------------- | ----------------------- |
| 共通ルール      | `docs/memory/`                         | 全プロジェクト共通の記憶方針・分類・更新ルール |
| 共通テンプレート   | `docs/templates/memory/`               | 新規プロジェクトへ適用する雛形         |
| プロジェクト固有記憶 | `docs/projects/{project_code}/memory/` | 各プロジェクトの概要・状態・判断・タスク    |

### 7.2 Phase 1で前提とする基本構造

```text
docs/
  phases/
    phase-1-memory-foundation.md
    phase-2-input-requirements.md

  memory/
    memory-policy.md
    memory-taxonomy.md
    memory-update-flow.md
    context-source-priority.md

  templates/
    memory/
      project-summary.template.md
      current-status.template.md
      active-decisions.template.md
      next-actions.template.md
      ai-entrypoint.template.md
      conversation-summary.template.md

  projects/
    mnemosyne/
      memory/
        project-summary.md
        current-status.md
        active-decisions.md
        next-actions.md
        ai-entrypoint.md

    ats/
      memory/
        project-summary.md
        current-status.md
        active-decisions.md
        next-actions.md
        ai-entrypoint.md

  adr/
    ADR-001-docs-as-source-of-memory.md
    ADR-002-memory-source-of-truth-boundary.md
    ADR-003-human-approved-memory-update.md
    ADR-004-project-independent-memory-template.md
    ADR-005-agent-context-separation.md

  review/
    phase-1-ats-template-validation.md
```

### 7.3 横断文書の扱い

以下の文書は、プロジェクト全体で重要であるため早期作成候補とする。ただし、Phase 1必須成果物へ追加する場合は、Phase 1作業計画書側にも反映して整合を取る。

| 文書                                       | 目的                                    |
| ---------------------------------------- | ------------------------------------- |
| `docs/glossary.md`                       | 正本、副本、Context、Agent、ADR、RAG、MCP等の用語統一 |
| `docs/mvp-scope.md`                      | MVP境界および対象外の明示                        |
| `docs/roadmap.md`                        | Phase間の進行管理                           |
| `docs/memory/context-layering-policy.md` | Context階層の詳細方針                        |

---

## 8. 記憶分類要件

### 8.1 必須となる基本分類

Project Mnemosyneでは、会話・メモ・文書から抽出する情報を、最低限以下の分類で扱えること。

| memory_type            | 意味                | 例                               |
| ---------------------- | ----------------- | ------------------------------- |
| `fact`                 | 確認された事実・前提        | ATSはLINE Botとして開発されている          |
| `decision`             | 採用済みの判断           | タスクの初期正本を `next-actions.md` とする |
| `task`                 | 実施すべき作業           | `memory-policy.md` を作成する        |
| `issue`                | 未解決の問題・確認事項       | 記憶の集中管理方式は未確定である                |
| `idea`                 | 未採用の候補・将来案        | Context Preview UIを追加する         |
| `constraint`           | 守るべき制約            | AIは正本へ直接書き込まない                  |
| `conversation_summary` | 会話内容を再利用可能に整理した記録 | Agent設計に関する議論要約                 |
| `test_result`          | 検証・確認の結果          | ATSへテンプレートを適用し不足項目を抽出した         |

### 8.2 追加分類候補

以下は有用性が見込まれるが、正式採用の要否および定義境界は `memory-taxonomy.md` で確定する。

| memory_type候補  | 想定用途               |
| -------------- | ------------------ |
| `preference`   | 出力形式、作業方針、運用上の選好   |
| `article_note` | 記事化・発信用に再利用する論点や学び |

### 8.3 分類時の原則

* 未決定の内容を `decision` として扱わない。
* 実施合意のない案を `task` として確定しない。
* 事実と判断理由を混同しない。
* 古い判断を削除せず、置換関係を記録する。
* 会話要約は、正本反映前に人間レビューを行う。

---

## 9. ContextおよびAgent要件

### 9.1 Context階層

AIへ渡す文脈は、将来的に以下の階層で扱えること。

| Context種別                   | 内容                        |
| --------------------------- | ------------------------- |
| Base Context                | 全Agent共通のルール、安全制約、出力方針    |
| Agent Context               | 専門Agentの目的、参照範囲、禁止事項、出力形式 |
| Project Context             | 対象プロジェクトの概要、状態、判断、次アクション  |
| Session Context             | 現在の作業セッションで扱っている論点        |
| Recent Conversation Context | 直近会話で確定・保留となった内容          |
| Task Context                | 今回処理する具体的な入力、対象文書、依頼内容    |

### 9.2 Agent定義原則

Agentは役割ベースで定義し、特定プロジェクトの情報をAgent定義そのものへ埋め込まない。

| Agent候補     | 主な役割                 |
| ----------- | -------------------- |
| ADR整理Agent  | 設計判断をADR草案として整理する    |
| 実装レビューAgent | 実装と設計の整合性をレビューする     |
| 要件定義Agent   | 要件文書の作成・改訂案を作る       |
| タスク分解Agent  | 状況と判断に基づき次アクションを整理する |
| 記事化Agent    | 開発記録・判断・学びを記事草案へ変換する |

### 9.3 Phase 1におけるAgentの扱い

Phase 1ではAgentを実装しない。

Phase 1では、以下を整理することを要件とする。

* AgentとProject Contextを分離する方針
* Agentが必要とする記憶文書の種類
* Phase 2で使用するProject RegistryおよびAgent Registryの入力項目
* Agentによる更新案作成と人間承認の境界

---

## 10. 機能要件

### FR-001 プロジェクト記憶管理

プロジェクトごとに、以下の基本記憶文書を管理できること。

| 文書                    | 目的                          |
| --------------------- | --------------------------- |
| `project-summary.md`  | プロジェクトの目的、背景、対象範囲、基本概念を管理する |
| `current-status.md`   | 現在フェーズ、進行中事項、課題、保留判断を管理する   |
| `active-decisions.md` | 現在有効な判断と参照ADRを一覧化する         |
| `next-actions.md`     | 直近タスク、優先順位、完了条件を管理する        |
| `ai-entrypoint.md`    | AIが最初に参照すべき文書と注意事項を管理する     |

保存先は以下を基本とする。

```text
docs/projects/{project_code}/memory/
```

### FR-002 共通記憶ルール管理

プロジェクト横断で共通利用する以下のルールを管理できること。

* 記憶の正本・副本方針
* 記憶分類
* 記憶状態
* 会話から記憶への更新手順
* 情報が競合した場合の参照優先順位

保存先は以下を基本とする。

```text
docs/memory/
```

### FR-003 会話ログ記憶化

AIとの会話ログまたは検討メモを、そのまま正本として保存せず、以下の情報へ分解できること。

* Fact
* Decision
* Task
* Issue
* Idea
* Constraint
* Conversation Summary
* Test Result

分解結果は、人間レビューを経た上で、必要な正本文書またはADRへ反映できること。

### FR-004 設計判断管理

重要な設計判断をADRとして記録できること。

ADRには最低限以下を含める。

* 判断内容
* 背景
* 解決したい課題
* 検討した選択肢
* 採用理由
* 影響
* ステータス
* 置換関係がある場合の参照先

### FR-005 情報状態および鮮度管理

記憶および判断について、現在有効な情報と履歴情報を区別できること。

最低限以下の状態を扱えること。

* `draft`
* `proposed`
* `active`
* `accepted`
* `superseded`
* `deprecated`
* `archived`

### FR-006 テンプレート管理

複数プロジェクトへ同一の記憶構造を適用するため、プロジェクト記憶文書のテンプレートを管理できること。

最低限以下のテンプレートを持つこと。

* `project-summary.template.md`
* `current-status.template.md`
* `active-decisions.template.md`
* `next-actions.template.md`
* `ai-entrypoint.template.md`
* `conversation-summary.template.md`

### FR-007 テンプレート適用検証

Phase 1では、Project Mnemosyne自身およびATSへ同一テンプレートを適用し、記憶構造が特定プロジェクト専用になっていないことを検証できること。

検証結果は以下へ記録する。

```text
docs/review/phase-1-ats-template-validation.md
```

### FR-008 Context管理

AIへ渡す文脈を、Base Context、Agent Context、Project Context、Session Context、Recent Conversation Context、Task Contextに区分して整理できること。

Phase 1では区分と必要情報を定義し、自動生成はPhase 2以降で扱う。

### FR-009 Project RegistryおよびAgent Registry準備

Phase 2でContext Pack Builderを設計できるよう、Phase 1では以下の入力項目を整理できること。

| 区分               | 主な入力項目                                                                                |
| ---------------- | ------------------------------------------------------------------------------------- |
| Project Registry | `project_code`、`project_name`、`memory_root`、`required_memory_docs`、`optional_sources` |
| Agent Registry   | `agent_code`、`purpose`、`context_requirements`、`output_type`、`write_policy`            |

### FR-010 Context Pack生成

Phase 2以降において、Project Context、Agent ContextおよびTask Contextを組み合わせ、AIへ渡すContext Packを生成できること。

Context Packは正本ではなく、正本文書から生成される成果物として扱う。

### FR-011 記憶検索

将来的に、Markdown docs、ADR、会話要約、記事メモ、検証記録から必要な情報を検索できること。

検索結果は、source path、状態、更新日時等の根拠情報を伴うこと。

### FR-012 外部接続

将来的に、Memory APIおよびMCP Serverを介して、複数のAIクライアントから同一の記憶基盤を参照できること。

### FR-013 更新案作成と承認反映

AIは、正本文書またはADRに対する新規作成案・修正案・差分案を作成できること。

ただし、正本への反映は人間承認を前提とし、AI単独による無承認更新を許可しない。

---

## 11. 非機能要件

### NFR-001 安全性

AIは正本に対して無承認の直接更新または削除を行わないこと。

### NFR-002 追跡性

重要な設計判断について、判断内容、理由、影響、置換履歴をADRから追跡できること。

### NFR-003 再現性

新しいAIチャットまたは異なるAIクライアントであっても、`ai-entrypoint.md` と関連する記憶文書を参照することで、プロジェクトの現在地を再構築できること。

### NFR-004 拡張性

ATS専用の構造とせず、TapLog、note発信、動画制作、業務改善等の異なる対象へ同一の記憶構造およびAgent方針を適用できること。

### NFR-005 情報鮮度管理

古い判断、置換済み判断、非推奨情報を状態により識別し、現在有効な情報と混同しないこと。

### NFR-006 人間可読性

Phase 1および初期運用では、Markdown文書を中心とし、人間が確認・修正・承認しやすい形式を優先すること。

### NFR-007 段階的実装可能性

記憶の標準化、Context生成、検索、API、MCP、自動化を段階的に導入でき、後続機能が未実装でも初期運用が成立すること。

### NFR-008 プロジェクト非依存性

記憶テンプレートおよびAgent設計は、特定プロジェクトの用語やデータ構造へ過度に依存しないこと。

### NFR-009 文書間整合性

全体要件、Phase要件、作業計画、設計仕様、ADRの間で成果物名称、保存先、正本境界および用語が一致していること。

### NFR-010 運用負荷の抑制

記憶化のための作業負担が過度にならないよう、全会話を無条件に正本化せず、判断・課題・タスク・検証結果等の再利用価値がある情報を中心に記録すること。

---

## 12. 情報の正本・副本方針

### 12.1 初期運用における正本境界

| 情報種別      | 初期正本                                                      | 副本・生成物               | 備考            |
| --------- | --------------------------------------------------------- | -------------------- | ------------- |
| 記憶運用方針    | `docs/memory/memory-policy.md`                            | なし                   | Phase 1で定義    |
| 記憶分類      | `docs/memory/memory-taxonomy.md`                          | なし                   | Phase 1で定義    |
| 参照優先順位    | `docs/memory/context-source-priority.md`                  | なし                   | Phase 1で定義    |
| プロジェクト概要  | `docs/projects/{project_code}/memory/project-summary.md`  | Context Pack         | プロジェクト固有      |
| 現在状況      | `docs/projects/{project_code}/memory/current-status.md`   | Context Pack         | プロジェクト固有      |
| 有効判断一覧    | `docs/projects/{project_code}/memory/active-decisions.md` | Context Pack         | ADRへの導線を持つ    |
| 重要判断      | `docs/adr/*.md`                                           | Decision View等       | 理由を含む正本       |
| 直近タスク     | `docs/projects/{project_code}/memory/next-actions.md`     | Notion Task DB       | 初期はMarkdown正本 |
| AI参照入口    | `docs/projects/{project_code}/memory/ai-entrypoint.md`    | Context Pack         | AI利用開始点       |
| 会話ログ      | 生ログ                                                       | Conversation Summary | 生ログは一次メモ      |
| ATS適用検証結果 | `docs/review/phase-1-ats-template-validation.md`          | なし                   | Phase 1検証記録   |

### 12.2 将来機能における扱い

| 対象           | 扱い                                      |
| ------------ | --------------------------------------- |
| Notion       | 必要性が確認された場合の可視化・運用ビュー。Phase 1の必須成果物ではない |
| PostgreSQL   | 構造化記憶管理が必要になった段階で正本候補として判断する            |
| Vector Store | 検索用の副本または索引とし、正本にはしない                   |
| Context Pack | AI入力用の生成物とし、正本にはしない                     |
| Memory API   | 正本を取得・検索するための接続口とする                     |
| MCP Server   | AIクライアントからMemory API等を利用するための接続口とする     |

---

## 13. フェーズ構成と責務境界

| Phase   | 名称                           | 主目的                                             | 主な対象                                            | 本書における位置づけ |
| ------- | ---------------------------- | ----------------------------------------------- | ----------------------------------------------- | ---------- |
| Phase 1 | Memory Foundation            | 記憶の正本構造と更新ルールを定義する                              | Markdown docs、ADR、テンプレート、ATS検証                  | 初期基盤       |
| Phase 2 | Context Forge                | Project × Agent × Task に応じたContext Pack生成を可能にする | Project Registry、Agent Registry、Context Builder | 初期MVP拡張    |
| Phase 3 | Recall Engine                | 必要な記憶を検索可能にする                                   | Chunk、Embedding、Vector Search                   | 将来実装       |
| Phase 4 | Memory Gateway               | 外部取得口を提供する                                      | API、Context Service、Search Service              | 将来実装       |
| Phase 5 | MCP Nexus                    | AIクライアントと接続する                                   | MCP Server、MCP Tools                            | 将来実装       |
| Later   | Automation / Agent Operation | 安全な自動化と専門Agent運用を拡張する                           | 半自動記憶化、更新案生成、Agent実行支援                          | 検証後に具体化    |

### 13.1 Phase 1の位置づけ

Phase 1は、記憶の自動化を開始するフェーズではない。

```text
Phase 1：
人間が見てもAIが見ても意味がぶれない
記憶構造・分類・更新ルールを確定する。
```

Phase 1では、Mnemosyne自身とATSの二つを対象として、共通テンプレートが実プロジェクトでも成立するかを確認する。

### 13.2 Phase 2への引継ぎ

Phase 1完了時には、少なくとも以下がPhase 2へ引き継がれていること。

* プロジェクト記憶文書の標準構造
* 正本・副本・生成物の境界
* 記憶分類および状態管理ルール
* AgentとProject Contextを分離する方針
* Project Registryに必要な入力項目
* Agent Registryに必要な入力項目
* ATS適用検証で判明したContext不足事項

---

## 14. 制約

| ID    | 制約                                         |
| ----- | ------------------------------------------ |
| C-001 | Phase 1では自動化より記憶構造の標準化を優先する                |
| C-002 | Phase 1ではMarkdown docsおよびADRを初期正本とする       |
| C-003 | AIは正本へ無承認で直接書き込まない                         |
| C-004 | 会話ログを未整理のまま正本として扱わない                       |
| C-005 | Context Pack、RAG、MCPを正本として扱わない             |
| C-006 | Notion DBをPhase 1の必須成果物としない                |
| C-007 | Phase 1ではAgent実行基盤を実装しない                   |
| C-008 | Phase 1の検証対象はMnemosyneおよびATSを基本とする         |
| C-009 | Phase 1成果物の保存先およびDoDはPhase 1作業計画書との整合を維持する |
| C-010 | 正本配置の集中管理方式と各プロジェクト配下管理方式の最終判断は、必要な検証後に行う  |

---

## 15. 成功条件

### 15.1 プロジェクト全体の成功条件

Project Mnemosyneは、最終的に以下を満たす状態を成功とする。

* 新しいAIチャットまたは別のAIクライアントから、必要なプロジェクト文脈を再利用できる。
* プロジェクトのFact、Decision、Task、Issue、Idea、Constraint、Test Resultを区別して管理できる。
* 重要な設計判断がADRとして残り、判断理由と変更履歴を追跡できる。
* 古い情報、置換済み判断、現在有効な情報を区別できる。
* Project Contextと専門Agent定義を分離し、異なるプロジェクトへ同じAgent方針を再利用できる。
* AIによる更新案作成と、人間による正本反映承認の境界が維持される。
* 必要に応じてContext Pack、検索、API、MCPへ段階的に拡張できる。

### 15.2 Phase 1到達時点で満たすべき初期成功条件

Phase 1完了時点では、以下を満たしていること。

* 記憶の正本・副本・一次メモ・生成物の扱いが明文化されている。
* Fact、Decision、Task、Issue、Idea、Constraint、Conversation Summary、Test Resultの分類基準が定義されている。
* AIの参照・草案作成・反映承認の境界が定義されている。
* プロジェクト記憶テンプレートが定義されている。
* Mnemosyne自身の記憶文書が作成されている。
* ATSへ同一テンプレートを適用した検証記録が作成されている。
* AgentとProject Contextの分離方針が判断記録として残っている。
* Phase 2で使用するProject RegistryおよびAgent Registryの入力項目が整理されている。
* Notion、PostgreSQL、RAG、API、MCP、Agent実行へ不要に着手せず、Markdownによる初期運用が成立している。

---

## 16. 未決定事項および後続判断事項

本書の時点では、以下を未決定事項または後続Phaseでの判断事項として扱う。

| ID     | 論点                                            | 現時点の扱い                    | 判断予定                     |
| ------ | --------------------------------------------- | ------------------------- | ------------------------ |
| OI-001 | プロジェクト記憶の最終配置をMnemosyneへ集中するか、各プロジェクトへ分散するか   | Phase 1ではMnemosyne配下で検証する | Phase 2以降                |
| OI-002 | Notion DBを導入するか                               | 必須成果物にしない                 | Markdown運用検証後            |
| OI-003 | PostgreSQLを構造化記憶の正本として導入するか                   | 対象外                       | 記憶量・検索要件確定後              |
| OI-004 | `preference` および `article_note` を正式な基本分類に含めるか | 拡張分類候補                    | `memory-taxonomy.md` 作成時 |
| OI-005 | Context階層ポリシーをPhase 1必須成果物へ追加するか              | 全体要件として必要性あり              | Phase 1計画書改訂時に判断         |
| OI-006 | Agent実行およびAgent orchestrationの実装範囲            | Phase 1対象外                | Context Builder検証後       |

---

## 17. 関連文書

| 文書                                               | 役割                     |
| ------------------------------------------------ | ---------------------- |
| `docs/phases/phase-1-memory-foundation.md`       | Phase 1の作業計画および完了条件の正本 |
| `docs/requirements/phase-requirements.md`        | Phase別の要件定義            |
| `docs/design/system-design.md`                   | 全体アーキテクチャおよび設計仕様       |
| `docs/memory/memory-policy.md`                   | 記憶の正本・副本・更新権限方針        |
| `docs/memory/memory-taxonomy.md`                 | 記憶分類と状態管理の定義           |
| `docs/memory/context-source-priority.md`         | 情報競合時の参照優先順位           |
| `docs/adr/*.md`                                  | 重要な設計判断の記録             |
| `docs/review/phase-1-ats-template-validation.md` | ATSを用いたテンプレート検証結果      |

---

## 18. 現時点の結論

Project Mnemosyneは、単なる会話ログ保存や検索機能の実験ではなく、AIとの作業を継続可能な設計資産へ変換し、複数プロジェクトに対して汎用的な専門Agentを適用できるようにするための外部記憶基盤である。

初期段階では、自動化や検索機能を先に作るのではなく、Markdown docsとADRを用いて、正本構造、記憶分類、更新ルール、参照優先順位、AgentとProject Contextの分離方針を確定する。

Phase 1では、Mnemosyne自身とATSを対象に同一の記憶テンプレートを適用し、汎用構造として成立することを確認する。

その結果を踏まえ、Phase 2でProject Registry、Agent RegistryおよびContext Pack Builderへ進むことを、本プロジェクトの初期実装方針とする。

## 今回の再修正で反映した事項

| 修正事項              | 反映内容                                                            |
| ----------------- | --------------------------------------------------------------- |
| Phase 1作業計画書を正とする | 文書情報・責務境界・Phase 1成功条件へ明記                                        |
| 単一プロジェクト型の保存先を解消  | `docs/projects/{project_code}/memory/` を採用                      |
| 共通方針と固有記憶を分離      | `docs/memory/`、`docs/templates/memory/`、`docs/projects/` の3層構造化 |
| `Fact` の反映漏れを解消   | 記憶分類、FR-003、成功条件へ反映                                             |
| Notionの扱いを統一      | Phase 1必須外。必要性確認後の任意導入                                          |
| タスク正本を統一          | `next-actions.md` を初期正本として明文化                                   |
| ADR名称を整合          | Phase 1計画書に合わせたADR-001〜005を採用                                   |
| Agentスコープを限定      | Phase 1では実装せず、Context要件とRegistry入力整理まで                          |
| 未確定事項を分離          | `preference`、`article_note`、Context階層文書のPhase割当等を未決定事項へ整理       |

次に作成すべき正本文書は、全体要件からPhase 1の実行要件を切り出す `docs/requirements/phase-requirements.md` の再修正版です。

## Conversation Memory

### fact

* JP: `要件定義_修正済み.md` には、`memory-taxonomy.md`、`next-actions.md` の正本化、FR-003への `Fact` 追加、`glossary.md` のP0化が反映されていた。 / EN: The revised requirements already used `memory-taxonomy.md`, made `next-actions.md` the task source of truth, added `Fact` to FR-003, and raised `glossary.md` to P0.
* JP: Phase 1作業計画書は、Markdown docsとADRを初期正本とし、MnemosyneとATSで同一の記憶テンプレートを検証する方針を示している。 / EN: The Phase 1 plan uses Markdown docs and ADRs as the first source of truth and validates one memory template with Mnemosyne and ATS.
* JP: 今回、Phase 1作業計画書を基準として、`docs/requirements/overall-requirements.md` の再修正版本文を作成した。 / EN: This turn created a re-revised draft of `docs/requirements/overall-requirements.md` based on the Phase 1 plan.

### decision

* JP: Phase 1作業計画書を、Phase 1の実施内容・成果物・完了判定に関する整合基準として扱う。 / EN: The Phase 1 plan is treated as the alignment baseline for Phase 1 work, deliverables, and completion criteria.
* JP: プロジェクト固有記憶の保存先は `docs/projects/{project_code}/memory/` を基本とする。 / EN: Project-specific memory is based on `docs/projects/{project_code}/memory/`.
* JP: 初期のタスク正本は `docs/projects/{project_code}/memory/next-actions.md` とし、Notion Task DBは必要時の副本とする。 / EN: The initial task source of truth is `docs/projects/{project_code}/memory/next-actions.md`; Notion Task DB is an optional secondary view.
* JP: Phase 1ではAgentを実装せず、AgentとProject Contextの分離方針およびPhase 2入力項目の整理までを扱う。 / EN: Phase 1 does not implement agents; it defines agent/project-context separation and prepares Phase 2 inputs.

### task

* JP: 次に `docs/requirements/phase-requirements.md` を、今回の全体要件定義書とPhase 1作業計画書に整合する形で再修正する。 / EN: Next, revise `docs/requirements/phase-requirements.md` to align with this overall requirements document and the Phase 1 plan.
* JP: その後、`docs/design/system-design.md`、`docs/memory/memory-policy.md`、`docs/memory/memory-taxonomy.md` へ順次展開する。 / EN: After that, propagate the design into `system-design.md`, `memory-policy.md`, and `memory-taxonomy.md`.

### preference

* JP: 自動化やDB化へ進む前に、Markdown中心で正本構造・分類・運用ルールを固定し、実プロジェクトで検証する進め方を重視する。 / EN: The preferred approach is to fix the source-of-truth structure, taxonomy, and operating rules in Markdown before automation or database work, then validate them with a real project.

### constraint

* JP: Phase 1では、PostgreSQL記憶管理、RAG、API、MCP、Agent実行、自動更新を実装対象に含めない。 / EN: Phase 1 excludes PostgreSQL memory storage, RAG, APIs, MCP, agent execution, and automatic updates.
* JP: AIは正本文書へ無承認で直接書き込まず、草案・差分案の作成までとする。 / EN: AI must not directly update source-of-truth documents without approval; it may create drafts and proposed diffs.
* JP: Conversation SummaryやContext Packは正本ではなく、レビュー対象または生成物として扱う。 / EN: Conversation Summaries and Context Packs are not sources of truth; they are review items or generated outputs.

### issue

* JP: `glossary.md` および `context-layering-policy.md` をPhase 1必須成果物に追加するかは、Phase 1作業計画書側の改訂と合わせて判断する必要がある。 / EN: Whether to add `glossary.md` and `context-layering-policy.md` as mandatory Phase 1 deliverables must be decided together with a Phase 1 plan revision.
* JP: `preference` と `article_note` を正式な基本分類へ含めるかは未確定である。 / EN: It is not yet decided whether `preference` and `article_note` should be formal core memory types.
* JP: 記憶の最終配置をMnemosyne集中管理とするか、各プロジェクト配下へ分散するかは未決定である。 / EN: The final choice between centralized Mnemosyne memory and distributed project-owned memory is unresolved.

### idea

* JP: `glossary.md` を早期に作成し、正本・副本・Context・Agent・ADR等の用語を先に固定すると、後続文書の揺れを抑制できる。 / EN: Creating `glossary.md` early could reduce wording drift across later documents.
* JP: Context階層方針を独立ADRまたは方針文書として扱う場合、Phase 1計画書へ明示的に追加する案がある。 / EN: If context layering becomes a separate ADR or policy document, it can be explicitly added to the Phase 1 plan.

### article_note

* JP: 汎用専門Agent基盤では、Agentの能力とプロジェクトの記憶を分離することで、同じレビュー・要件定義・記事化の能力を複数プロジェクトへ再利用できる。 / EN: In a reusable specialist-agent base, separating agent capability from project memory allows the same review, requirements, and writing capability to be reused across projects.

### conversation_summary

* JP: 本チャットでは、汎用専門Agent化に合わせた要件定義書の修正内容をレビューし、Phase 1作業計画書との齟齬を特定した。続いて、Phase 1作業計画書を基準文書として、プロジェクト別記憶配置、Fact分類、Notion任意化、AgentとContextの分離を反映した全体要件定義書の再修正版を作成した。 / EN: This chat reviewed the revised requirements for reusable specialist agents, found gaps against the Phase 1 plan, and then created a new overall requirements draft aligned with the Phase 1 plan, including project-specific memory paths, Fact classification, optional Notion use, and separation of agents from context.

### test_result

* JP: 文書整合レビューにより特定したP0論点のうち、全体要件定義書上の保存先構造、Fact反映、Notion位置づけ、タスク正本、ADR方針、Agentスコープについては再修正版へ反映済みである。 / EN: The re-revised overall requirements now address the P0 issues for storage paths, Fact handling, Notion positioning, task source of truth, ADR direction, and agent scope.
