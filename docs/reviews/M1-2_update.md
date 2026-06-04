# M1-2 Active成果物 作成結果

M1-2のActive化阻害要因であった4点を確定し、`memory-taxonomy.md` と `context-source-priority.md` の**置き換え用Active最終版**を作成しました。

M1-2の成果物は `docs/memory/memory-taxonomy.md` と `docs/memory/context-source-priority.md` であり、完了条件には分類判断、仮説のDecision誤登録防止、古い会話ログよりADRを優先するルールが含まれています。
また、M1-1方針で定義済みのstatusは `draft / active / superseded / deprecated / archived` であり、AIは文書案・修正案の作成まで、正本反映は人間が行う境界です。

## 1. 今回確定した4点

# M1-2 Active化確定事項

## 1. Task進捗と記憶statusの分離

共通 `status` は、記憶または文書の有効性・承認状態のみに使用する。

```text
status:
  draft
  active
  superseded
  deprecated
  archived
```

`task` の実行進捗は、別項目 `task_status` で管理する。

```text
task_status:
  todo
  in_progress
  blocked
  done
  cancelled
  deferred
```

## 2. Conversation Summaryの参照可能条件

Conversation Summaryは、共通 `status` に加えて `review_status` を持つ。

```text
review_status:
  draft
  reviewed
  reflected
  archived
```

* `draft`：通常Contextおよび通常検索の参照元に含めない。
* `reviewed`：会話経緯の確認および正本更新候補の抽出に限り参照可能。
* `reflected`：文脈復元に利用可能。ただし、DecisionまたはConstraintの根拠は反映先のActive正本文書またはADRとする。
* `archived`：履歴確認時のみ参照可能。

Conversation Summary内のDecisionまたはConstraintは、Summaryのみを根拠に `active` と判断してはならない。

## 3. 競合Issueの正式記録先

Active正本間の競合Issueは、Phase 1では以下へ記録する。

```text
docs/review/context-source-conflicts/{issue_id}.md
```

Issue IDは以下とする。

```text
共通方針文書・Mnemosyne基盤文書：
  CSP-ISS-{NNN}

特定Project文書を含む競合：
  {project_code}-CSP-ISS-{NNN}
```

Projectの `current-status.md` にはIssue ID、severity、`blocked_scope` を参照として記載し、修正作業は `next-actions.md` で管理する。

## 4. 競合中情報のContext Packへの受け渡し

通常のContext Packでは、競合中のDecisionまたはConstraintを確定情報セクションへ収録しない。

* 競合中のDecision：`Active Decisions` へ含めない。
* 競合中のConstraint：`Constraints and Write Policy` 等の確定制約欄へ含めない。
* 競合Issueの存在：`Warnings` または `Open Issues` へ、Issue ID、severity、`blocked_scope`、関連正本を記載してよい。
* 競合比較そのものがTaskの目的である場合のみ、両方の記載を `Conflicting Sources` として未解決情報であることを明示して含めてよい。
* 競合解消後は、更新済みActive正本からContext Packを再生成する。

---

## 2. 作成ファイル

| 成果物                                      | 内容                                                                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `docs/memory/memory-taxonomy.md`         | 10分類、`status` / `task_status` / `review_status` / `document_role` の分離、Conversation Summary参照条件、誤分類防止、後続Phase引継ぎを確定 |
| `docs/memory/context-source-priority.md` | 目的別参照ルーティング、Active正本間競合、Issue保存先、Context Pack既定処理、Phase 3検索への引継ぎを確定                                                |

* [memory-taxonomy.md — Active最終版](sandbox:/mnt/data/m1-2-active/docs/memory/memory-taxonomy.md)
* [context-source-priority.md — Active最終版](sandbox:/mnt/data/m1-2-active/docs/memory/context-source-priority.md)
* [M1-2 Active成果物一式 ZIP](sandbox:/mnt/data/m1-2-active-memory-taxonomy-context-source-priority.zip)

## 3. Active版への主要反映内容

### `memory-taxonomy.md`

| 反映内容                 | 結果                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 標準分類                 | `fact / decision / task / preference / constraint / issue / idea / article_note / conversation_summary / test_result` の10種類で確定 |
| 状態語                  | `draft / active / superseded / deprecated / archived` に統一                                                                      |
| Task進捗               | `task_status` を新設し、共通 `status` と分離                                                                                             |
| Conversation Summary | `review_status` と参照条件を正式定義                                                                                                     |
| Decision誤登録防止        | 会話・Summary・AI提案のみを根拠に `active decision` としない                                                                                   |
| Phase 3引継ぎ           | `accepted / proposed` が残る要件文書を `active / draft` へ統一する必要を記載                                                                     |

### `context-source-priority.md`

| 反映内容         | 結果                                                       |
| ------------ | -------------------------------------------------------- |
| 参照方式         | 単一順位ではなく、確認目的別の参照開始文書を確定                                 |
| Active正本競合   | ADRと運用文書が競合した場合は自動採用せずIssue化                             |
| 影響範囲         | `blocked_scope` により論点単位で利用停止                             |
| Issue保存先     | `docs/review/context-source-conflicts/{issue_id}.md` に確定 |
| Context Pack | 競合中Decision / Constraintを確定情報から除外する既定動作を確定               |
| 検索引継ぎ        | 競合情報を通常の確定Contextとして無警告利用しないルールを確定                       |

## 4. 後続文書への影響

Phase 3要件定義の既存記載には、通常検索対象として `active / accepted` を扱い、`draft / proposed` を分ける記述が残っています。今回のM1-2 Active化により、後続文書では **`accepted` を `active`、`proposed` を `draft` へ統一**する必要があります。

| 更新対象                                                       | 必要な修正                                                               |
| ---------------------------------------------------------- | ------------------------------------------------------------------- |
| `docs/phases/phase-3-input-requirements.md` またはPhase 3要件本文 | status表記を `active / draft / superseded / deprecated / archived` に統一 |
| `docs/recall/metadata-spec.md` 作成時                         | `review_status`、`related_issue`、`blocked_scope` をmetadata候補へ反映      |
| `docs/templates/memory/next-actions.template.md`           | `task_status` を追加                                                   |
| `docs/templates/memory/conversation-summary.template.md`   | `review_status` とDecision非根拠ルールを追加                                  |
| `docs/memory/memory-update-flow.md`                        | Conflict Issue記録・承認・解消確認の実務手順を追加                                    |

## 5. 反映上の注意

今回作成したファイルは、**Active化内容を反映した置き換え用最終版**です。M1-1で確定した人間承認境界に従い、リポジトリ上の正本への配置・コミットは人間側で実施する扱いになります。

---

## Conversation Memory

### fact

* JP: Project MnemosyneのPhase 1 M1-1では、Markdown docsとADRを初期正本とし、AIはドラフト作成まで、正本反映は人間が行う方針が確定している。 / EN: In Project Mnemosyne Phase 1 M1-1, Markdown docs and ADRs are the initial sources of truth, AI creates drafts only, and humans apply source updates.
* JP: M1-2の必須成果物は `docs/memory/memory-taxonomy.md` と `docs/memory/context-source-priority.md` である。 / EN: The required M1-2 deliverables are `docs/memory/memory-taxonomy.md` and `docs/memory/context-source-priority.md`.
* JP: 本回答で、M1-2のActive成果物として両文書の置き換え用最終版およびZIP一式を作成した。 / EN: This response created final replacement versions of both M1-2 Active documents and a ZIP package.

### decision

* JP: 共通 `status` は記憶または文書の有効性・承認状態専用とし、Taskの実行進捗は `task_status` で管理する。 / EN: The shared `status` field is only for memory or document validity and approval state; task progress is managed with `task_status`.
* JP: `task_status` は `todo / in_progress / blocked / done / cancelled / deferred` とする。 / EN: `task_status` uses `todo / in_progress / blocked / done / cancelled / deferred`.
* JP: Conversation Summaryは `review_status: draft / reviewed / reflected / archived` を持ち、`reviewed` または `reflected` の場合のみ条件付きで参照可能とする。 / EN: Conversation Summaries use `review_status: draft / reviewed / reflected / archived` and are conditionally referenceable only when `reviewed` or `reflected`.
* JP: Conversation Summary内のDecisionまたはConstraintは、正本文書またはADRへ反映されるまで、現在有効な根拠として扱わない。 / EN: Decisions or constraints inside a Conversation Summary are not current valid evidence until reflected in source documents or ADRs.
* JP: Active正本間の競合Issueは、`docs/review/context-source-conflicts/{issue_id}.md` に記録する。 / EN: Conflict issues between Active sources are recorded in `docs/review/context-source-conflicts/{issue_id}.md`.
* JP: 通常のContext Packでは、競合中のDecisionまたはConstraintを確定情報セクションへ含めず、Issue情報のみをWarningsまたはOpen Issuesとして提示する。 / EN: Normal Context Packs exclude conflicting decisions or constraints from confirmed-information sections and show only issue information in Warnings or Open Issues.
* JP: 状態語は `draft / active / superseded / deprecated / archived` に統一し、`accepted` と `proposed` は独立statusとして使用しない。 / EN: Status values are standardized as `draft / active / superseded / deprecated / archived`; `accepted` and `proposed` are not used as separate statuses.

### task

* JP: 作成したActive最終版を、Project Mnemosyneリポジトリの `docs/memory/` 配下へ人間が反映する。 / EN: A human should apply the created Active final versions under `docs/memory/` in the Project Mnemosyne repository.
* JP: M1-3 Template整備では、`next-actions.template.md` に `task_status`、`conversation-summary.template.md` に `review_status` とDecision非根拠ルールを反映する。 / EN: In M1-3 template work, add `task_status` to `next-actions.template.md` and add `review_status` plus the decision non-evidence rule to `conversation-summary.template.md`.
* JP: `memory-update-flow.md` 作成時に、Conflict Issueの保存、承認、正本修正、解消確認の実務フローを具体化する。 / EN: When creating `memory-update-flow.md`, define the practical flow for storing, approving, correcting, and resolving Conflict Issues.
* JP: Phase 3要件文書に残る `accepted / proposed` 表記を、M1-2 Active方針に従って `active / draft` へ修正する。 / EN: Update remaining `accepted / proposed` wording in Phase 3 requirements to `active / draft` according to the M1-2 Active policy.

### preference

* JP: 正本間の競合を機械的な優先順位だけで解決せず、影響論点を明示して人間承認に戻す進め方を重視している。 / EN: The process prioritizes identifying affected topics and returning them for human approval rather than resolving source conflicts only by mechanical priority.
* JP: Context生成や検索実装の前に、情報の正本性・状態・参照条件を明文化しておく方針を重視している。 / EN: The preferred approach is to define source authority, status, and reference conditions before implementing context generation or search.

### constraint

* JP: AIはPhase 1で正本文書へ直接writeせず、参照、分類、競合検知、ドラフトおよび修正案作成までを担当する。 / EN: In Phase 1, AI does not write directly to source documents; it reads, classifies, detects conflicts, and creates drafts or correction proposals.
* JP: `draft`、`superseded`、`deprecated`、`archived` の情報を通常の現在判断における確定根拠として扱わない。 / EN: Information marked `draft`, `superseded`, `deprecated`, or `archived` is not treated as confirmed evidence in normal current decisions.
* JP: 競合中のDecisionまたはConstraintは、解消完了まで通常Context Packの確定情報として収録しない。 / EN: Conflicting decisions or constraints are not included as confirmed information in normal Context Packs until resolved.

### issue

* JP: Phase 3要件本文に、M1-2で不採用とした `accepted / proposed` のstatus表現が残っているため、後続修正が必要である。 / EN: Phase 3 requirements still contain `accepted / proposed` status wording rejected by M1-2, so later correction is required.
* JP: `memory-update-flow.md` は未作成であり、今回確定したConflict Issue運用を実務手順へ展開する必要がある。 / EN: `memory-update-flow.md` has not yet been created and must expand the confirmed Conflict Issue operation into practical procedures.

### idea

* JP: Phase 3の検索metadataには、`memory_type`、`status`、`review_status`、`related_issue`、`blocked_scope` を持たせると、競合情報の誤採用を防止しやすい。 / EN: Adding `memory_type`, `status`, `review_status`, `related_issue`, and `blocked_scope` to Phase 3 search metadata would help prevent mistaken adoption of conflicting information.
* JP: Conflict Issueの実例をM1-5 ATSテンプレート適用検証で一件試作すると、M1-2ルールの運用性を確認できる。 / EN: Creating one example Conflict Issue during the M1-5 ATS template validation would help verify the operability of the M1-2 rules.

### article_note

* JP: 外部記憶基盤では、「Taskが進んでいるか」と「その情報が現在有効か」を同じstatusで管理すると、後続のContext生成や検索が破綻する。 / EN: In an external memory base, using the same status for task progress and information validity breaks later context generation and search.
* JP: 正本競合への対処では、矛盾検知だけでなく、競合中情報をAIへ確定情報として渡さない既定動作を先に決める必要がある。 / EN: Handling source conflicts requires not only detecting contradictions, but also defining a default rule that prevents conflicting information from being passed to AI as confirmed facts.

### conversation_summary

* JP: 本チャットでは、M1-1完了後にM1-2として `memory-taxonomy.md` と `context-source-priority.md` のドラフトを作成し、Active化レビューで4つの阻害要因を特定した。今回、Task進捗とstatusの分離、Conversation Summary参照条件、Conflict Issue保存先、競合情報のContext Pack既定処理を確定し、両文書のActive最終版を作成した。 / EN: In this chat, after M1-1 was completed, drafts of `memory-taxonomy.md` and `context-source-priority.md` were created for M1-2, and activation review identified four blockers. This response resolved task progress versus status separation, Conversation Summary reference conditions, Conflict Issue storage, and default Context Pack handling for conflicting information, then created final Active versions of both documents.

### test_result

* JP: `memory-taxonomy.md` のActive版では、P0指摘事項であった `task_status` 分離とConversation Summaryの `review_status` ルールが反映されていることを確認した。 / EN: The Active version of `memory-taxonomy.md` was checked to include the P0 corrections for `task_status` separation and Conversation Summary `review_status` rules.
* JP: `context-source-priority.md` のActive版では、P0指摘事項であったConflict Issue保存先と競合中情報のContext Pack除外既定動作が反映されていることを確認した。 / EN: The Active version of `context-source-priority.md` was checked to include the P0 corrections for Conflict Issue storage and default exclusion of conflicting information from confirmed Context Pack sections.
* JP: ZIP成果物に `docs/memory/memory-taxonomy.md` と `docs/memory/context-source-priority.md` の2ファイルが含まれることを確認した。 / EN: The ZIP package was checked to contain `docs/memory/memory-taxonomy.md` and `docs/memory/context-source-priority.md`.
