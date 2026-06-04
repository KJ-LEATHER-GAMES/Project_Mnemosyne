# Active化レビュー結果

## 1. レビュー対象・判定基準

### 対象ドラフト

| 文書                                       | 目的                        |
| ---------------------------------------- | ------------------------- |
| `docs/memory/memory-taxonomy.md`         | 会話・メモを再利用可能な記憶単位へ分類する基準   |
| `docs/memory/context-source-priority.md` | 情報源の参照優先、競合検知、Issue化、修正手順 |

### 基準文書

* [phase-1-memory-foundation.md]
* [memory-policy.md]
* [ADR-001-docs-as-source-of-memory.md]
* [ADR-002-memory-source-of-truth-boundary.md]
* [ADR-003-human-approved-memory-update.md]

M1-2の完了条件は、会話内容を分類できること、仮説をDecisionとして誤登録しないこと、古い会話ログよりADRを優先するルールを定義することです。M1-1では、Markdown docsとADRを正本とし、AIはドラフト作成まで、正本反映は人間が行い、状態語は `draft / active / superseded / deprecated / archived` に統一されています。

---

## 2. 総合判定

| 文書                           | 判定                                | 理由                                                                         |
| ---------------------------- | --------------------------------- | -------------------------------------------------------------------------- |
| `memory-taxonomy.md`         | **Conditional Pass：要修正後Active化可** | 分類体系と誤登録防止は成立しているが、`task` の進捗状態と記憶statusの混同、Conversation Summaryの承認状態定義が残る |
| `context-source-priority.md` | **Conditional Pass：要修正後Active化可** | 競合検知・Issue化・修正手順の骨格は成立しているが、競合時の参照既定動作とIssue記録先が未確定である                     |
| M1-2全体                       | **Active化保留**                     | P0修正項目を反映すれば、M1-2成果物としてActive化可能                                           |

## 結論

**全面的な設計やり直しは不要です。**
両ドラフトはM1-1方針と概ね整合しており、M1-2の目的にも適合しています。

ただし、以下の **P0項目はActive化前に必ず修正**してください。

---

# 3. Active化前に必須の修正項目：P0

## 3.1 `memory-taxonomy.md`

### TAX-P0-01：`task` の進捗状態と記憶statusが混同されている

| 項目   | 内容                                                                                                                          |
| ---- | --------------------------------------------------------------------------------------------------------------------------- |
| 対象箇所 | 第6.3節 `task`、第9章 Status一覧                                                                                                   |
| 現状   | `task` の最小記載項目で `status = 未着手、進行中、完了等` としている一方、第9章では `status = draft / active / superseded / deprecated / archived` と定義している |
| 問題   | 同じ `status` が「承認・鮮度状態」と「作業進捗状態」の二つの意味を持ち、テンプレート・検索metadata・Context Packで判定不能になる                                             |
| 影響   | M1-3テンプレート、Phase 2 Context Pack、Phase 3検索metadata                                                                           |
| 優先度  | **P0：Active化前必須**                                                                                                           |

### 修正方針

`status` はM1-1で確定した記憶・文書の状態専用とし、Taskの進捗は別フィールドに分離する。

#### 修正後の定義案

| 項目            | 用途          | 値の例                                                                    |
| ------------- | ----------- | ---------------------------------------------------------------------- |
| `status`      | 記憶の有効性・承認状態 | `draft` / `active` / `superseded` / `deprecated` / `archived`          |
| `task_status` | Taskの実行進捗   | `todo` / `in_progress` / `blocked` / `done` / `cancelled` / `deferred` |

#### 修正対象

* 第6.3節 `Taskの最小記載項目`
* 第9章 `Memory TypeとStatusの組合せ`
* 第13章 `記憶抽出フォーマット`
* 第17章 `M1-3 Template整備への引継ぎ`

---

### TAX-P0-02：`conversation_summary` の承認状態と参照条件が未確定

| 項目   | 内容                                                                                                                |
| ---- | ----------------------------------------------------------------------------------------------------------------- |
| 対象箇所 | 第6.9節、第9章、第12章、第18章 `TAX-OI-004`                                                                                  |
| 現状   | Conversation Summaryを `active` として扱える可能性を記載している一方、承認管理方式を未決定事項として残している                                            |
| 問題   | `reviewed済み conversation summary` を参照可能とする条件が文書内で確定していない                                                          |
| 関連基準 | Phase 1計画の `conversation-summary.template.md` では `Review Status: draft / reviewed / reflected / archived` が示されている |
| 影響   | 会話要約の参照可否、Decision誤登録防止、Phase 3索引対象判断                                                                             |
| 優先度  | **P0：Active化前必須**                                                                                                 |

### 修正方針

`status` と `review_status` を分離して定義する。

#### 修正後の定義案

| 項目              | 用途                             | 値                                                             |
| --------------- | ------------------------------ | ------------------------------------------------------------- |
| `status`        | 文書としての有効状態                     | `draft` / `active` / `superseded` / `deprecated` / `archived` |
| `review_status` | Conversation Summary固有の確認・反映状態 | `draft` / `reviewed` / `reflected` / `archived`               |

#### 参照ルール案

| review_status | 扱い                                                      |
| ------------- | ------------------------------------------------------- |
| `draft`       | 未確認の要約。通常Contextおよび検索対象に含めない                            |
| `reviewed`    | 会話内容の要約として参照可能。ただし、内包するDecisionやConstraintは正本反映済みとは扱わない |
| `reflected`   | 必要なDecision、Task、Issue等が正本文書へ反映済みであることを示す               |
| `archived`    | 履歴確認時のみ参照する                                             |

#### 必ず追記すべき原則

```text
Conversation Summaryが reviewed または reflected であっても、
その中に記載された Decision や Constraint は、
active な正本文書またはADRへ反映されるまで、
現在有効な判断根拠として扱わない。
```

---

### TAX-P0-03：未決定事項 `TAX-OI-004` をActive文書に残したままにできない

| 項目   | 内容                                                             |
| ---- | -------------------------------------------------------------- |
| 対象箇所 | 第18章 `TAX-OI-004`                                              |
| 現状   | Reviewed済みConversation Summaryの承認状態管理が未決定                      |
| 問題   | 本文が会話要約を標準memory typeとして採用している以上、参照可否の最低条件はTaxonomy内で確定する必要がある |
| 優先度  | **P0：Active化前必須**                                              |

### 修正方針

`TAX-OI-004` は未決定事項から削除し、第6.9節および第9章へ正式ルールとして反映する。

詳細な保存先や自動化方式は後続へ委譲してよいが、**レビュー済みSummaryをどのように扱うかという最低ルールはM1-2で確定**する。

---

## 3.2 `context-source-priority.md`

### CSP-P0-01：参照順位が「文書責務」と「優先順位」を混在させている

| 項目   | 内容                                                                          |
| ---- | --------------------------------------------------------------------------- |
| 対象箇所 | 第4.2節 `初期参照順位`、第5章 `正本文書の責務分担`                                              |
| 現状   | `active なADRおよびactive な共通運用正本文書` を同一順位に置き、その後に `active-decisions.md` を置いている |
| 問題   | 「現在の運用ルールを知りたい場合」と「判断理由を知りたい場合」で最初に参照すべき文書が異なるため、単一順位表だけでは利用方法が曖昧になる        |
| 影響   | AI回答、Context Pack生成、Agent別参照ルール                                             |
| 優先度  | **P0：Active化前必須**                                                           |

### 修正方針

単純な順位表の前に、**問いの種類に応じた参照開始文書**を定義する。

#### 追加すべき参照ルーティング表

| 確認したい内容          | 最初に参照する文書                                                            | 補助参照                         | 競合時           |
| ---------------- | -------------------------------------------------------------------- | ---------------------------- | ------------- |
| 現在適用する共通運用ルール    | `memory-policy.md`、`memory-taxonomy.md`、`context-source-priority.md` | 関連ADR                        | Issue化        |
| 重要判断の理由・代替案・変更履歴 | ADR                                                                  | 関連運用文書、`active-decisions.md` | Issue化        |
| 現在有効なProject判断   | `active-decisions.md`                                                | 関連ADR、設計docs                 | Issue化        |
| 現在地・進行状況・ブロッカー   | `current-status.md`                                                  | Review文書、Test Result         | Issue化または更新候補 |
| 次に実施する作業         | `next-actions.md`                                                    | `current-status.md`、Phase文書  | Issue化または更新候補 |
| 過去の議論経緯          | Reviewed / Reflected Conversation Summary                            | Active正本                     | Active正本を優先   |

### 修正後の考え方

```text
文書の責務に応じて参照開始先を選ぶ。
その上で、同一論点についてActive正本間に矛盾がある場合は、
順位で自動解決せずIssue化する。
```

---

### CSP-P0-02：競合中情報をContext Packへどう扱うかが選択肢のまま残っている

| 項目   | 内容                                                                                |
| ---- | --------------------------------------------------------------------------------- |
| 対象箇所 | 第11.1節、第20.1節、未決定事項 `CSP-OI-003`                                                  |
| 現状   | 競合論点は「競合警告付きで除外または保留」と記載され、どちらを既定動作とするか未確定                                        |
| 問題   | `context-source-priority.md` の核心は、競合時にAIへ何を渡してよいかを決めることであり、既定動作を未決定のままActive化できない |
| 影響   | Phase 2 Context Pack、Phase 3 Retrieved Context、AI回答                               |
| 優先度  | **P0：Active化前必須**                                                                 |

### 修正方針

通常のContext Packでは、競合中の規範情報を**確定情報セクションから除外**することを既定動作とする。

#### 既定ルール案

| 情報             | Context Packでの扱い                          |
| -------------- | ----------------------------------------- |
| 競合中のDecision   | `Active Decisions` へ含めない                  |
| 競合中のConstraint | `Constraints` へ含めない                       |
| 競合Issueそのもの    | `Warnings` または `Open Issues` へ記載してよい      |
| 比較作業を目的とする場合   | 両方の記載を `Conflicting Sources` として明示して含めてよい |
| 競合解消後          | 更新済みActive正本から再生成する                       |

#### 追記文案

```text
競合中の論点は、通常のContext Packにおいて、
Active DecisionまたはConstraintとして収録してはならない。

必要な場合は、WarningsまたはOpen Issuesとして、
競合の存在、関連文書、blocked_scopeおよびIssue IDのみを提示する。

競合比較そのものをTaskとする場合に限り、
両方の記載を未解決情報として明示した上で参照可能とする。
```

---

### CSP-P0-03：Conflict Issueの保存先が未決定のため、手順を実行できない

| 項目   | 内容                                              |
| ---- | ----------------------------------------------- |
| 対象箇所 | 第12章、第13章、第26章 `CSP-OI-001`                     |
| 現状   | Conflict Issue Draftフォーマットは定義されているが、正式な記録先は未決定  |
| 問題   | 競合を検知しても、どこに保存し、どの文書から参照するかが決まっていないため、運用手順が閉じない |
| 影響   | M1-3テンプレート、M1-5 ATS検証、Phase 2入力要件               |
| 優先度  | **P0：Active化前必須**                               |

### 修正方針

Phase 1の初期記録先を確定する。

#### 推奨配置

```text
docs/review/context-source-conflicts/
  CSP-ISS-001.md
  CSP-ISS-002.md
```

#### 追加ルール案

| 項目          | ルール                                                                                |
| ----------- | ---------------------------------------------------------------------------------- |
| 競合Issue本文   | `docs/review/context-source-conflicts/{issue_id}.md` に記録する                         |
| Projectへの影響 | `docs/projects/{project_code}/memory/current-status.md` のIssue欄へIssue IDと影響範囲を記載する |
| 未完了対応       | `next-actions.md` へ修正Taskを記載する                                                     |
| 重要判断変更      | ADR案を作成する                                                                          |
| 解消後         | Conflict Issueを `resolved` または `closed` に更新する                                      |

### 補足

この配置は新たな正本カテゴリを作るものではなく、**レビュー・矛盾解消記録の保存先**として扱うのが適切です。

---

### CSP-P0-04：Conversation Summaryの参照条件をTaxonomyと同期させる必要がある

| 項目   | 内容                                                                            |
| ---- | ----------------------------------------------------------------------------- |
| 対象箇所 | 第4.2節、第19章、第20章                                                               |
| 現状   | `reviewed済みconversation summary` を参照対象としているが、`reviewed` の意味と正本反映済みかどうかの区別が未定義 |
| 問題   | Summaryがレビュー済みであっても、そこに含まれるDecisionが正本化済みとは限らない                               |
| 優先度  | **P0：Active化前必須**                                                             |

### 修正方針

`memory-taxonomy.md` のConversation Summary定義と同一ルールを記載する。

#### 参照順位上の扱い

| Summary状態                  |    参照可否 | 用途                         |
| -------------------------- | ------: | -------------------------- |
| `review_status: draft`     |      不可 | 未確認要約                      |
| `review_status: reviewed`  |   条件付き可 | 会話経緯の把握のみ。Decision根拠には使用不可 |
| `review_status: reflected` |       可 | 正本文書への反映確認済みの会話要約として参照     |
| `review_status: archived`  | 履歴確認時のみ | 過去経緯の確認                    |

---

# 4. 同時修正を強く推奨する項目：P1

P1は、形式上はActive化後に後続文書で補うことも可能ですが、今回P0修正と同時に反映した方が、M1-3以降の手戻りを抑えられます。

## 4.1 `memory-taxonomy.md`

| ID        | 対象箇所                                                 | 指摘内容                                                                | 推奨修正                                                      |
| --------- | ---------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------- |
| TAX-P1-01 | 第6.1節 `fact`                                         | 時点によって変化するFactの扱いが不足している                                            | `observed_at` または `as_of`、`source_path` を推奨項目として追加する      |
| TAX-P1-02 | 第6.4節 `preference`、第6.7節 `idea`、第6.8節 `article_note` | これらがContext上でDecisionやConstraintの代替として誤用されるリスクがある                   | 「単独では現在有効な判断根拠として使用しない」と明記する                              |
| TAX-P1-03 | 第13章 `Memory Extraction Draft`                       | `review_status: draft` が文書statusとConversation Summary固有状態のどちらを指すか曖昧 | 共通項目は `status`、会話要約固有項目は `review_status` に分離する            |
| TAX-P1-04 | 第4.2節                                                | 「1記憶単位に1主分類」の例外や補助タグの扱いが不明                                          | Phase 1では `primary_memory_type` 1つのみを必須とし、複数分類は分割を原則と明記する |
| TAX-P1-05 | 第17章                                                 | `test-result.template.md` がM1-3の元計画成果物に含まれていない                      | 新規テンプレート候補として明示するか、Phase 1 ATS検証文書へ委譲する                   |

---

## 4.2 `context-source-priority.md`

| ID        | 対象箇所       | 指摘内容                                                 | 推奨修正                                                                            |
| --------- | ---------- | ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| CSP-P1-01 | 第7章 `競合分類` | `generated_artifact_staleness` は正本間競合ではなく、生成物鮮度問題である | `conflict_type` から分離し、`consistency_warning_type` または `artifact_staleness` として扱う |
| CSP-P1-02 | 第7章 `競合分類` | `omission_risk` は意味上の競合ではなく、反映漏れである                  | `reflection_gap` として競合とは別に扱い、必ずしも `blocked_scope` を設定しない                        |
| CSP-P1-03 | 第6章、第9章    | 共通方針とProject固有ルールが競合した場合の適用範囲判定が不足                   | `applicability_scope: common / project / phase / task` の考え方を追加する                |
| CSP-P1-04 | 第13章       | Issue ID命名規則が未定義                                     | `CSP-ISS-{連番}` または `{project_code}-CSP-ISS-{連番}` を定義する                          |
| CSP-P1-05 | 第21章       | 解消確認結果の保存先が明確でない                                     | Conflict Issue本文の `Resolution Confirmation` に記録することを明記する                        |
| CSP-P1-06 | 第20章       | Phase 3検索では競合警告を要求しているが、検索結果の利用可否が曖昧                 | 競合中chunkは取得可能でも、通常の `active decision` 組込み対象外とする原則を追加する                          |

---

# 5. 未決定事項の扱いレビュー

## 5.1 `memory-taxonomy.md`

| 未決定事項                                    | Active化前に決定が必要か | 判定理由                            |
| ---------------------------------------- | --------------: | ------------------------------- |
| `TAX-OI-001` Memory単位のMarkdown粒度         |              不要 | Template整備またはデータ設計で決定可能         |
| `TAX-OI-002` `preference` の恒久保存先         |              不要 | 分類定義そのものには影響しない                 |
| `TAX-OI-003` `article_note` の検索対象条件      |              不要 | Phase 3で判断可能                    |
| `TAX-OI-004` Conversation Summaryの承認状態管理 |          **必要** | Summaryの参照可否とDecision誤登録防止へ直結する |
| `TAX-OI-005` DB化時のenum管理                 |              不要 | Phase 1対象外                      |

## 5.2 `context-source-priority.md`

| 未決定事項                                         | Active化前に決定が必要か | 判定理由                                |
| --------------------------------------------- | --------------: | ----------------------------------- |
| `CSP-OI-001` Conflict Issueの保存先               |          **必要** | 競合検知後の記録手順が実行不能となる                  |
| `CSP-OI-002` `conflict_status` のmetadata管理方式  |              不要 | Markdown本文での初期運用は可能                 |
| `CSP-OI-003` Context Packで競合情報を除外するか警告付き収録するか |          **必要** | 参照優先ルールの核心であり、後続Context生成へ直接影響する    |
| `CSP-OI-004` Phase 3索引への競合chunk登録             |              不要 | Phase 3設計時に判断可能。ただし無警告利用禁止原則は先に定義する |
| `CSP-OI-005` 競合検知CLI化                         |              不要 | Phase 1は手動レビューで成立する                 |
| `CSP-OI-006` Severity別期限                      |              不要 | 実運用後に追加可能                           |

---

# 6. M1-1 Active文書との整合確認

| 確認観点                            | `memory-taxonomy.md` | `context-source-priority.md` | 判定      |
| ------------------------------- | -------------------: | ---------------------------: | ------- |
| Markdown docs / ADRを正本とする       |                   整合 |                           整合 | Pass    |
| AIチャット履歴を一次メモとする                |                   整合 |                           整合 | Pass    |
| Context Packを生成物とする             |                   整合 |                           整合 | Pass    |
| AIはdraft作成までとする                 |                   整合 |                           整合 | Pass    |
| 正本反映は人間が行う                      |                   整合 |                           整合 | Pass    |
| `accepted` を独立statusにしない        |                   整合 |                           整合 | Pass    |
| Active正本同士の矛盾はIssue化する          |                   整合 |                           整合 | Pass    |
| 古い会話ログよりActive正本を優先する           |                   整合 |                           整合 | Pass    |
| Status定義が一意である                  |        `task` 部分で未整合 |                         概ね整合 | **要修正** |
| Conversation Summary参照条件が確定している |                  未確定 |                          未確定 | **要修正** |
| 競合検知後の運用が閉じている                  |                  対象外 |          保存先・Context既定動作が未確定 | **要修正** |

---

# 7. M1-2完了条件に対する判定

| M1-2完了条件                     | 判定                   | コメント                                                     |
| ---------------------------- | -------------------- | -------------------------------------------------------- |
| 任意の会話内容をどの分類に置くか判断できる        | **Conditional Pass** | 10分類と判断フローは十分。ただしTask状態とConversation Summary状態を整理する必要がある |
| 仮説をDecisionとして誤登録しないルールがある   | **Pass**             | `idea`、`issue`、`draft decision` の分離は明確                   |
| 古い会話ログよりADRを優先するルールが明文化されている | **Pass**             | Active正本優先、一次メモ非優先が明確                                    |
| Active ADRとActive運用文書の競合を扱える | **Conditional Pass** | 検知・Issue化・修正手順は定義済み。保存先とContext扱いの確定が必要                  |
| M1-3以降へ安全に接続できる              | **Conditional Pass** | P0修正後に接続可能                                               |

---

# 8. 修正優先順位一覧

## P0：Active化前に必ず反映

| No. | 文書                           | 修正項目                                                        |
| --: | ---------------------------- | ----------------------------------------------------------- |
|   1 | `memory-taxonomy.md`         | `task_status` を新設し、共通 `status` と分離する                        |
|   2 | `memory-taxonomy.md`         | Conversation Summaryの `review_status` と参照条件を正式定義する          |
|   3 | `memory-taxonomy.md`         | `TAX-OI-004` を未決定事項から外し、本文ルールへ反映する                          |
|   4 | `context-source-priority.md` | 単一順位表に加え、確認目的別の参照開始文書ルールを定義する                               |
|   5 | `context-source-priority.md` | 競合中Decision / Constraintを通常Context Packの確定情報から除外する既定動作を確定する |
|   6 | `context-source-priority.md` | Conflict IssueのPhase 1初期保存先を決定する                            |
|   7 | `context-source-priority.md` | Conversation Summaryの参照条件をTaxonomyと同期する                     |

## P1：P0修正と同時反映を推奨

| No. | 文書                           | 修正項目                                                          |
| --: | ---------------------------- | ------------------------------------------------------------- |
|   8 | `memory-taxonomy.md`         | Factへ `as_of` / `source_path` 等の鮮度根拠項目を追加する                   |
|   9 | `memory-taxonomy.md`         | `idea` / `preference` / `article_note` はDecision代替にしない原則を追加する |
|  10 | `memory-taxonomy.md`         | Memory Extraction Draftのstatus項目を整理する                         |
|  11 | `context-source-priority.md` | 真の競合と、生成物鮮度問題・反映漏れを分類上分離する                                    |
|  12 | `context-source-priority.md` | `applicability_scope` の考え方を追加する                               |
|  13 | `context-source-priority.md` | Issue ID命名規則と解消記録先を定義する                                       |
|  14 | `context-source-priority.md` | Phase 3検索結果で競合情報をActive判断として採用しない原則を追加する                      |

---

# 9. Active化時の形式更新項目

P0修正内容の承認後、両文書をActive化する際は、本文修正に加えてfront matterおよびChange Historyを更新する必要があります。

| 項目             | Draft版    | Active化時            |
| -------------- | --------- | ------------------- |
| `status`       | `draft`   | `active`            |
| `version`      | `0.1.0`   | `1.0.0`             |
| `updated_at`   | 初版作成日     | 修正版確定日              |
| `approved_at`  | `null`    | 人間が承認した日付           |
| Change History | draft作成記録 | Active化および主要修正内容を追記 |

### Change Historyへの記載対象

* `task_status` 分離
* Conversation Summaryの `review_status` 確定
* 目的別参照ルーティング追加
* Conflict Issue保存先確定
* 競合中情報のContext Pack既定処理確定

---

# 10. 推奨するActive化判定

| 判定                 | 条件                                                                                |
| ------------------ | --------------------------------------------------------------------------------- |
| **Go**             | P0の7項目を反映し、両文書間の用語・参照条件・競合処理が一致している                                               |
| **Conditional Go** | P0は反映済みで、P1の一部をM1-3またはPhase 2入力要件へ明示的に引き継ぐ                                        |
| **No Go**          | `task` 状態の混同、Conversation Summary参照条件、Conflict Issue保存先、競合Context処理のいずれかが未解決のまま残る |

## 最終判定

**現行ドラフト：No Go for Active / 修正後Go可能**

理由は、設計思想の不足ではなく、運用時に必ず必要になる以下の境界が未確定だからです。

1. `task` の進捗と記憶のstatusの区別
2. Conversation Summaryをいつ参照可能とするか
3. 競合Issueをどこへ記録するか
4. 競合中情報をContext Packへどう渡すか

この4点を決めれば、両文書はM1-2のActive成果物として十分成立します。

---

## Conversation Memory

### fact

* JP: Project MnemosyneのPhase 1 M1-1では、`memory-policy.md` と `ADR-001`〜`ADR-003` がActive化用最終版として作成され、Markdown docsとADRを初期正本とし、AIはドラフト作成まで、正本反映は人間が行う方針が定義されている。 / EN: In Project Mnemosyne Phase 1 M1-1, final Active-ready versions of `memory-policy.md` and `ADR-001` to `ADR-003` were created. Markdown docs and ADRs are initial sources of truth, AI creates drafts only, and humans apply approved source updates.
* JP: M1-2では、`memory-taxonomy.md` と `context-source-priority.md` のドラフトが作成済みである。 / EN: Drafts of `memory-taxonomy.md` and `context-source-priority.md` have been created for M1-2.
* JP: M1-2の完了条件は、会話内容を分類できること、仮説をDecisionとして誤登録しないこと、古い会話ログよりADRを優先するルールを明文化することである。 / EN: The M1-2 completion conditions are being able to classify conversation content, preventing hypotheses from being wrongly registered as decisions, and defining a rule that prioritizes ADRs over old chat logs.
* JP: 今回、両ドラフトをActive化するためのレビューを実施し、必須修正項目と後続へ委譲可能な項目を整理した。 / EN: This response reviewed both drafts for activation and organized required corrections and items that may be deferred.

### decision

* JP: 両ドラフトの現行版は、そのままではActive化せず、P0修正反映後にActive化判定を行う方針とする。 / EN: The current drafts should not be activated as-is; activation should be judged after applying the P0 corrections.
* JP: `task` の実行進捗は `task_status` として分離し、M1-1で定義した共通 `status` は記憶の有効性・承認状態を示す用途に限定する修正が必要である。 / EN: Task execution progress must be separated as `task_status`, while the shared `status` defined in M1-1 must remain limited to memory validity and approval state.
* JP: Conversation Summaryには `review_status` を定義し、レビュー済みSummary内のDecisionであっても正本文書またはADRへ反映されるまでActive判断根拠にしないルールを確定する必要がある。 / EN: Conversation Summaries need a defined `review_status`, and even decisions inside a reviewed summary must not be treated as active decision evidence until reflected in source documents or ADRs.
* JP: 競合中のDecisionまたはConstraintは、通常のContext Packの確定情報セクションへ含めず、WarningsまたはOpen Issuesとしてのみ提示する既定ルールを採用すべきである。 / EN: Decisions or constraints under conflict should not be included in confirmed sections of normal Context Packs; they should be shown only as warnings or open issues.
* JP: Conflict IssueのPhase 1初期保存先として、`docs/review/context-source-conflicts/{issue_id}.md` を採用する修正案を提示した。 / EN: A correction proposal was made to use `docs/review/context-source-conflicts/{issue_id}.md` as the initial Phase 1 storage location for Conflict Issues.

### task

* JP: `memory-taxonomy.md` に対し、`task_status` 分離、Conversation Summaryの `review_status` 定義、`TAX-OI-004` の本文ルール化を反映する必要がある。 / EN: `memory-taxonomy.md` must be updated to separate `task_status`, define Conversation Summary `review_status`, and convert `TAX-OI-004` into an explicit rule.
* JP: `context-source-priority.md` に対し、目的別参照ルーティング、競合中情報のContext Pack既定処理、Conflict Issue保存先、Conversation Summary参照条件の同期を反映する必要がある。 / EN: `context-source-priority.md` must be updated with purpose-based reference routing, default Context Pack treatment for conflicting information, Conflict Issue storage, and aligned Conversation Summary reference conditions.
* JP: P0修正後、両文書のfront matterとChange HistoryをActive化用に更新し、再レビューする必要がある。 / EN: After P0 corrections, both documents require front matter and Change History updates for activation, followed by re-review.

### preference

* JP: 正本間の競合を単純な順位で自動解決せず、論点単位でIssue化し、人間承認により解消する運用を重視している。 / EN: The process prioritizes handling conflicts between sources as topic-level issues resolved through human approval, rather than automatically deciding by simple rank.
* JP: Phase 2以降のContext生成や検索導入前に、未承認情報・古い情報・競合情報の混入を防ぐ境界を文書として確定する進め方を重視している。 / EN: Before Phase 2 context generation or later search implementation, the process prioritizes documenting boundaries that prevent unapproved, stale, or conflicting information from being mixed in.

### constraint

* JP: AIはPhase 1において正本文書へ直接writeせず、参照、分類、競合検知、ドラフトおよび修正案作成までを担当する。 / EN: In Phase 1, AI does not write directly to source documents; it reads, classifies, detects conflicts, and creates drafts or correction proposals.
* JP: `draft`、`superseded`、`deprecated`、`archived` の情報は、通常の現在判断における確定根拠として扱わない。 / EN: Information marked `draft`, `superseded`, `deprecated`, or `archived` is not treated as confirmed evidence in normal current decisions.
* JP: Active正本同士で競合する論点は、解消完了まで確定済みDecisionまたはConstraintとしてContext Packへ収録しない。 / EN: Topics conflicting between Active sources must not be included in Context Packs as confirmed decisions or constraints until resolved.

### issue

* JP: `memory-taxonomy.md` では、Taskの進捗状態と記憶statusが同じ `status` 名で扱われており、Active化前に分離が必要である。 / EN: In `memory-taxonomy.md`, task progress and memory status use the same `status` name and must be separated before activation.
* JP: Conversation Summaryの承認状態と参照可否が両ドラフトで完全には確定しておらず、Active化前に定義が必要である。 / EN: Conversation Summary approval state and reference eligibility are not fully defined in either draft and must be specified before activation.
* JP: `context-source-priority.md` では、競合中情報をContext Packへ除外するか警告付きで含めるかが未確定であり、参照優先規約として未完了である。 / EN: In `context-source-priority.md`, whether conflicting information is excluded from or included with warnings in Context Packs remains undecided, leaving the source-priority policy incomplete.
* JP: Conflict Issueの正式な記録先が未決定であり、競合検知後の運用フローが完結していない。 / EN: The official storage location for Conflict Issues is undecided, so the operational flow after conflict detection is incomplete.

### idea

* JP: `fact` には `as_of` または `observed_at` を持たせることで、変化し得る事実の鮮度判断を強化できる。 / EN: Adding `as_of` or `observed_at` to facts can improve freshness judgement for facts that may change.
* JP: `conflict_type` から生成物鮮度問題や反映漏れを分離すると、真の正本競合と通常の更新対応を区別しやすくなる。 / EN: Separating generated-artifact staleness and reflection gaps from `conflict_type` would make it easier to distinguish real source conflicts from ordinary update work.
* JP: `applicability_scope` を追加すると、共通方針、Project固有ルール、Phase限定ルールの関係を後続検索やContext生成で判断しやすくなる。 / EN: Adding `applicability_scope` would make relationships among common rules, project-specific rules, and phase-specific rules easier to judge in later search and context generation.

### article_note

* JP: 外部記憶基盤の分類設計では、DecisionとIdeaの分離だけでなく、「情報が有効か」というstatusと「Taskが進んでいるか」という進捗状態を分離しないと、後続の自動化で意味が崩れる。 / EN: In external memory taxonomy design, it is not enough to separate decisions from ideas; memory validity status and task progress must also be separated, or later automation becomes ambiguous.
* JP: 正本競合の設計では、矛盾を検知するだけでなく、競合中の情報をContext Packへ確定情報として流さない既定動作まで決める必要がある。 / EN: In source conflict design, it is necessary not only to detect conflicts, but also to define a default rule that prevents conflicting information from flowing into Context Packs as confirmed information.

### conversation_summary

* JP: 本チャットでは、Phase 1 M1-2として `memory-taxonomy.md` と `context-source-priority.md` のドラフトを作成し、今回、それらをM1-1 Active方針およびPhase 1計画書と照合してActive化レビューを実施した。両文書の設計骨格は成立しているが、Task進捗とstatusの分離、Conversation Summaryのレビュー状態、目的別参照ルーティング、競合中情報のContext扱い、Conflict Issue保存先をP0修正として反映するまでActive化は保留と判定した。 / EN: In this chat, drafts of `memory-taxonomy.md` and `context-source-priority.md` were created for Phase 1 M1-2, and this response reviewed them for activation against the M1-1 Active policy and Phase 1 plan. Their design foundations are sound, but activation is held until P0 corrections are made for task progress versus status separation, Conversation Summary review state, purpose-based reference routing, Context handling of conflicting information, and Conflict Issue storage.

### test_result

* JP: M1-1との整合確認では、正本境界、AIのdraft-only原則、`active` へのstatus統一、Active正本間競合のIssue化、古い会話ログよりActive正本を優先する原則について、両ドラフトは整合していると判定した。 / EN: Alignment review with M1-1 found that both drafts are consistent on source boundaries, AI draft-only operation, use of `active` status, issue handling for conflicts between Active sources, and prioritizing Active sources over old chat logs.
* JP: Active化阻害要因として、`task` 状態名の衝突、Conversation Summary参照条件未確定、競合時Context Pack既定処理未確定、Conflict Issue保存先未確定の4領域を特定した。 / EN: Four activation blockers were identified: conflicting task status naming, undefined Conversation Summary reference conditions, undefined default Context Pack handling during conflicts, and undefined Conflict Issue storage.
