# M1-1 Active化用最終版：作成完了

`memory-policy.md` と ADR 3件について、レビュー(`docs/reviews/M1-1_review.md`)で特定した修正を反映した **Active化用最終版（version 1.0.0 / status: active）** を作成しました。

今回の反映内容は、Phase 1作業計画にある「AIはdraftまで」「Context Pack生成はPhase 2対象」「`docs/projects/{project_code}/memory/` はPhase 1の検証用配置であり、最終配置方式はPhase 2以降に判断する」という方針に整合させています。 

## 作成ファイル

| ファイル                                                  | 内容                                           |
| ----------------------------------------------------- | -------------------------------------------- |
| `docs/memory/memory-policy.md`                        | 正本・副本・一次メモ・生成物、AI権限、状態管理、Phase境界の基本方針        |
| `docs/adr/ADR-001-docs-as-source-of-memory.md`        | Markdown docs / ADR をPhase 1の初期正本とする判断       |
| `docs/adr/ADR-002-memory-source-of-truth-boundary.md` | Notion、Context Pack、PostgreSQL、RAG、MCP等の責務境界 |
| `docs/adr/ADR-003-human-approved-memory-update.md`    | AIはdraftまで、正本反映は人間が行う判断                      |

## 主な確定内容

| 論点                                    | Active版での確定内容                                             |
| ------------------------------------- | --------------------------------------------------------- |
| 初期正本                                  | Markdown docs と ADR                                       |
| AIチャット履歴                              | 一次メモ。正本として直接扱わない                                          |
| Context Pack                          | 正本から作る生成物。生成実装はPhase 2対象                                  |
| Notion                                | 任意の副本。Phase 1必須ではない                                       |
| PostgreSQL / Vector Store / RAG / MCP | Phase 1の実装対象外                                             |
| AI `read`                             | 許可                                                        |
| AI `draft`                            | 許可                                                        |
| AI `write`                            | Phase 1では不可。承認後の正本反映は人間が行う                                |
| AI `delete`                           | 不可。原則として状態変更で履歴を保持                                        |
| 文書状態                                  | `draft / active / superseded / deprecated / archived` に統一 |
| プロジェクト記憶配置                            | `docs/projects/{project_code}/memory/` はPhase 1検証用初期配置    |
| 最終配置方式                                | Phase 2以降で集中管理方式／各プロジェクト正本方式を比較判断                         |

## 反映済み修正の確認結果

| 確認項目                                  | 結果   |
| ------------------------------------- | ---- |
| 4文書すべてが `status: active`              | 確認済み |
| 4文書すべてが `version: 1.0.0`              | 確認済み |
| AIの正本 `write` がPhase 1で不可と明記されている     | 確認済み |
| 正本反映主体が人間であると明記されている                  | 確認済み |
| 検証用初期配置と最終配置方式未確定の区別がある               | 確認済み |
| Context Pack生成処理がPhase 2対象と明記されている    | 確認済み |
| 保存用Markdownへ不要なコードフェンス `id` 属性が残っていない | 確認済み |
| ZIPファイルが正常に展開可能                       | 確認済み |

## M1-1の完了判定

今回の4文書をリポジトリへ配置することで、M1-1の完了条件である以下を満たせます。

| 完了条件                      | 判定 |
| ------------------------- | -- |
| 「どれが正しい情報か」を迷わず判断できる      | 達成 |
| AIに許可する操作範囲が明文化されている      | 達成 |
| 古い情報と現在有効な情報の区別方法が定義されている | 達成 |

したがって、**4文書をリポジトリへ反映した時点で、M1-1：Memory Policy定義は完了扱いとしてよい状態**です。

次の作業単位は、**M1-2：Memory Taxonomy定義**として、`docs/memory/memory-taxonomy.md` と `docs/memory/context-source-priority.md` の作成です。

## Conversation Memory

### fact

* `docs/phases/phase-1-memory-foundation.md` は完成済みであり、M1-0：Phase方針確定は完了扱いとして進行している。 / `docs/phases/phase-1-memory-foundation.md` is complete, and M1-0: Phase policy confirmation is treated as complete.
* M1-1の成果物として、`docs/memory/memory-policy.md` とADR 3件のActive化用最終版を作成した。 / Final active-ready versions of `docs/memory/memory-policy.md` and three ADRs were created as M1-1 deliverables.
* Phase 1では、Markdown docsおよびADRを初期正本とし、AIチャット履歴を一次メモ、Context Packを生成物、Notionを任意の副本として扱う。 / In Phase 1, Markdown docs and ADRs are initial sources of truth; AI chat history is a primary note; Context Pack is a generated artifact; Notion is an optional replica.
* 作成した4文書は、個別Markdownファイルおよび一括ZIPとして出力済みである。 / The four documents have been output as individual Markdown files and as a ZIP package.

### decision

* `memory-policy.md` およびADR 3件は、`status: active`、`version: 1.0.0` として最終版を作成した。 / `memory-policy.md` and the three ADRs were produced as final versions with `status: active` and `version: 1.0.0`.
* AIはPhase 1において `read` と `draft` のみ実施可能とし、正本への `write` および `delete` は実施しない方針を確定した。 / In Phase 1, AI may perform only `read` and `draft`; it may not perform `write` or `delete` on sources of truth.
* 正本への反映作業は、人間が内容を承認した後に、人間が実施する方針を確定した。 / Source-of-truth updates are performed by a human after human approval.
* `docs/projects/{project_code}/memory/` はPhase 1検証用初期配置とし、将来の最終配置方式としては確定しない方針を確定した。 / `docs/projects/{project_code}/memory/` is defined as an initial validation layout for Phase 1, not as the final future placement model.
* Context PackはPhase 1で生成物として位置づけ、生成方式・出力先・運用はPhase 2以降で定義する方針を確定した。 / Context Pack is positioned as a generated artifact in Phase 1; its generation method, output location, and operation will be defined in Phase 2 or later.

### task

* 作成した4文書をProject Mnemosyneリポジトリの該当パスへ配置する。 / Place the four created documents in the corresponding paths of the Project Mnemosyne repository.
* 配置後、M1-1を完了として記録する。 / After placement, record M1-1 as complete.
* 次工程として、M1-2の `docs/memory/memory-taxonomy.md` および `docs/memory/context-source-priority.md` を作成する。 / As the next step, create `docs/memory/memory-taxonomy.md` and `docs/memory/context-source-priority.md` for M1-2.

### preference

* ユーザーは、Phaseおよびマイルストーン単位で成果物・判断・完了条件を明確化し、文書を正として進めることを重視している。 / The user values defining deliverables, decisions, and completion criteria by phase and milestone, using documents as authoritative references.
* ユーザーは、AIとの会話を再利用可能な設計資産へ変換する進め方を採用している。 / The user adopts an approach of converting AI conversations into reusable design assets.

### constraint

* Phase 1では、Context Pack生成処理、PostgreSQLによる構造化記憶管理、Vector Store / RAG、Memory API、MCP、自動同期、自動更新を実装対象外とする。 / Phase 1 excludes Context Pack generation processing, PostgreSQL-based structured memory management, Vector Store / RAG, Memory API, MCP, automated synchronization, and automated updates.
* AIチャット履歴は一次メモであり、整理・レビューなしに正本として扱わない。 / AI chat history is a primary note and must not be treated as a source of truth without organization and review.
* 正本同士に矛盾がある場合、AIは独自に解決せずIssueとして提示する。 / When sources of truth conflict, AI must not resolve them independently and must present the conflict as an issue.

### issue

* M1-1に関する未解決の必須修正事項は、今回のActive版作成により解消した。 / The mandatory unresolved revision items for M1-1 were resolved through creation of the active versions.
* 記憶の最終配置方式として、Mnemosyne集中管理方式と各プロジェクト正本方式のどちらを採用するかは、Phase 2以降の判断事項として残る。 / The choice between centralized Mnemosyne memory management and per-project source ownership remains a Phase 2-or-later decision.

### idea

* 将来の更新自動化では、AIによる直接writeではなく、差分案またはPull Request相当の提案を人間が承認する方式を検討する。 / In future update automation, consider human approval of AI-generated diffs or pull-request-like proposals instead of direct AI writes.
* M1-2では、正本間の競合や古い情報の扱いを、具体例付きの参照優先ルールとして定義する。 / In M1-2, define source-priority rules for conflicting or stale information with concrete examples.

### article_note

* AI外部記憶基盤では、記憶を保存する前に、正本・生成物・一次メモ・副本の境界と更新責任を決める必要がある。 / In an AI external memory foundation, the boundaries and update responsibilities of sources of truth, generated artifacts, primary notes, and replicas must be decided before storing memory.
* AIを正本更新者ではなく、整理・抽出・ドラフト作成者として位置づけることで、安全性と開発効率を両立できる。 / Safety and development efficiency can be balanced by positioning AI as an organizer, extractor, and drafter rather than as a source-of-truth updater.

### conversation_summary

* このチャットでは、Project Mnemosyne Phase 1のM1-0を完了扱いとし、M1-1：Memory Policy定義を進めた。`memory-policy.md` とADR 3件をドラフト作成し、Active化レビューで抽出した修正事項を反映した最終版MarkdownファイルおよびZIPを作成した。これにより、Phase 1における正本、媒体境界、AI操作権限、状態管理、暫定配置、Context Pack境界がActive文書として整備された。 / In this chat, M1-0 of Project Mnemosyne Phase 1 was treated as complete, and M1-1: Memory Policy Definition was advanced. After drafting `memory-policy.md` and three ADRs, final active Markdown files and a ZIP package were created with the activation-review corrections applied. This establishes active documentation for Phase 1 sources of truth, media boundaries, AI permissions, status management, provisional placement, and Context Pack boundaries.

### test_result

* 4文書すべてで `status: active` および `version: 1.0.0` が設定されていることを確認した。 / It was confirmed that all four documents set `status: active` and `version: 1.0.0`.
* AIの正本 `write` をPhase 1で不可とし、正本反映主体を人間とする記述が含まれていることを確認した。 / It was confirmed that the documents prohibit AI source-of-truth `write` in Phase 1 and identify humans as the update actors.
* 検証用初期配置と最終配置方式未確定の区別、およびContext Pack生成をPhase 2へ委譲する記述が含まれていることを確認した。 / It was confirmed that the documents distinguish the initial validation layout from the undecided final placement model and delegate Context Pack generation to Phase 2.
* 保存用Markdownへ不要なコードフェンス `id` 属性が残っていないことを確認した。 / It was confirmed that no unnecessary code-fence `id` attributes remain in the repository Markdown files.
* 一括ZIPファイルが正常に展開可能であることを確認した。 / It was confirmed that the ZIP package can be extracted successfully.
