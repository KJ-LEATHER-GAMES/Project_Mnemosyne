## Active化前レビュー結果

結論として、**M2-1ドラフトは大枠OKですが、Active化前にP0修正が2件あります。**

特に重要なのは以下です。

1. **RP-001：成果物名の整合**
2. **RP-004：Build Reportの扱いの明確化**

確認に使用した主な参照元です。

---

# レビューサマリー

| ID     | 判定              | 結論                                                                                                           |
| ------ | --------------- | ------------------------------------------------------------------------------------------------------------ |
| RP-001 | **要修正 / P0**    | `phase-2-context-forge.md` の存在・成果物名との整合に不確実性あり。少なくとも現行参照できるPhase 2要件とは成果物名が一致していない。                          |
| RP-002 | **OK / P1補足推奨** | 12章相当から15章構成への拡張は許容可能。ただし「Phase 2標準構成」と「Phase 3 Retrieval拡張構成」の関係を明記した方がよい。                                  |
| RP-003 | **OK**          | `Warnings` を `Source List` より前に置く構成で問題なし。むしろAI誤読防止上は妥当。                                                      |
| RP-004 | **要修正 / P0**    | Build ReportはContext Pack内に**要約を含める**、CLI実装では**別ファイルも出力可能**と定義するのが妥当。現ドラフトの記載は方向性OKだが、M2-1標準としてもう少し固定した方がよい。 |
| RP-005 | **OK / P1補足推奨** | Session ContextとRecent Conversation Contextの境界は実装可能。ただし入力元・保持期間・優先順位をもう少し明文化するとよい。                           |
| RP-006 | **概ねOK / P1修正** | M1 status定義との整合は概ね取れている。ただし `accepted` の扱いをADR専用またはDecision系statusとして補足した方が安全。                               |

---

# 詳細レビュー

## RP-001：`phase-2-context-forge.md` のM2-1記載と成果物名が一致しているか

### 判定

**要修正 / P0**

### 確認結果

現時点で参照できるPhase 2関連文書では、Phase 2の成果物候補として以下が定義されています。

```text
docs/context/context-pack-format.md
docs/context/context-build-rule.md
docs/context/agent-context-profiles.md
examples/context/project-context-pack.example.md
examples/context/session-context-pack.example.md
examples/context/agent-context-pack.example.md
scripts/context-build.ts
dist/context/{project-code}-context-pack.md
```

一方、今回のM2-1成果物は以下です。

```text
docs/context/context-pack-structure.md
templates/context/context-pack.template.md
```

このため、**既存のPhase 2要件上の成果物名と、今回のM2-1成果物名は一致していません。**

ただし、これは必ずしも設計ミスではありません。M2-1は「Context Pack標準構造定義」に特化した初期タスクなので、以下のように整理すれば整合します。

### 推奨修正

`context-pack-structure.md` の `related_documents` または本文に、次を追記するのがよいです。

```md
本書は、Phase 2成果物候補である `docs/context/context-pack-format.md` の前段として、
Context Packの章構成・必須項目・Source List / Warnings / Build Metadataを定義するM2-1成果物である。

今後、`context-pack-format.md` を作成する場合は、本書を基準として詳細なformat仕様へ展開する。
```

または、Phase 2成果物名を今回のM2-1に合わせて更新するなら、以下のようにします。

```text
docs/context/context-pack-structure.md
docs/context/context-build-rule.md
docs/context/agent-context-profiles.md
templates/context/context-pack.template.md
examples/context/context-pack.example.md
scripts/context-build.ts
dist/context/{project-code}/{agent-code}/context-pack.md
```

### Active化条件

RP-001は、**成果物名の不一致を明示的に吸収する修正が必要**です。

---

## RP-002：既存要件の12章構成から15章構成へ拡張したことを許容するか

### 判定

**OK / P1補足推奨**

### 確認結果

既存のPhase 2入力要件では、Context Pack Candidate Structureは以下のような構成でした。

```md
# Context Pack

## 1. Build Metadata
## 2. Agent Role and Output Contract
## 3. Project Context
## 4. Active Decisions and Constraints
## 5. Current Status
## 6. Task Context
## 7. Additional Sources
## 8. Recent Conversation Context
## 9. Warnings
## 10. Source List
## 11. Build Report
```

一方、今回のM2-1ドラフトでは以下の15章構成です。

```md
# Context Pack

## 1. Build Metadata
## 2. Base Context
## 3. Agent Context
## 4. Project Context
## 5. Current Status
## 6. Active Decisions
## 7. Next Actions
## 8. Session Context
## 9. Recent Conversation Context
## 10. Task Context
## 11. Additional Sources
## 12. Constraints and Write Policy
## 13. Warnings
## 14. Source List
## 15. Build Report
```

これは、既存要件を破壊しているというより、**M1で定義したContext階層をより忠実に展開した構成**です。

特に以下の独立化は妥当です。

| 独立章                            | 理由                                    |
| ------------------------------ | ------------------------------------- |
| `Base Context`                 | 正本優先・AI write制限・draft扱いなどの共通原則を明示できる  |
| `Agent Context`                | Agent定義とProject Contextの分離方針に合う       |
| `Next Actions`                 | Task正本を `next-actions.md` に置くM1方針に合う  |
| `Session Context`              | 今回セッション限定情報をRecent Conversationと分けられる |
| `Constraints and Write Policy` | AIの操作境界を章として固定できる                     |

### 推奨修正

15章構成を採用するなら、`context-pack-structure.md` に以下を追加すると安全です。

```md
本構成は、Phase 2 Input Requirementsで示されたContext Pack Candidate Structureを、
M1で確定したContext階層、Task正本、Agent Context分離方針に合わせて詳細化したものである。

そのため、旧構成の各章は以下のように本構成へ展開される。
```

対応表も入れるとよいです。

| Phase 2 Input Requirements側      | M2-1標準構造側                                       |
| -------------------------------- | ----------------------------------------------- |
| Agent Role and Output Contract   | Agent Context                                   |
| Active Decisions and Constraints | Active Decisions / Constraints and Write Policy |
| Task Context                     | Task Context / Next Actions                     |
| Recent Conversation Context      | Session Context / Recent Conversation Context   |
| Source List                      | Source List                                     |
| Build Report                     | Build Report                                    |

### Active化条件

RP-002は**許容可能**です。
ただし、旧構成からの展開関係を明記するP1修正を推奨します。

---

## RP-003：`Warnings` を `Source List` より前に置く構成で問題ないか

### 判定

**OK**

### 確認結果

`Warnings` を `Source List` より前に置く構成は問題ありません。

むしろ、AIへContext Packを渡す用途では、以下の理由で妥当です。

| 観点         | 評価                         |
| ---------- | -------------------------- |
| AIの読み順     | Source詳細一覧より先に注意事項を読ませられる  |
| draft混入対策  | 未確定情報を根拠扱いするリスクを下げられる      |
| conflict検知 | 競合を先に明示できる                 |
| 人間レビュー     | Source Listを見る前に危険箇所を把握できる |

`Source List` は根拠追跡用の詳細一覧です。
一方で `Warnings` は、Context Pack全体の読み方を制御する安全装置です。

そのため順序は以下で妥当です。

```text
Warnings
↓
Source List
↓
Build Report
```

### Active化条件

RP-003は**修正不要**です。

---

## RP-004：`Build Report` をContext Pack内に含めるか、別ファイルに分けるか

### 判定

**要修正 / P0**

### 推奨判断

Phase 2初期では、以下の二段構えが最もよいです。

```text
Context Pack内:
  Build Report Summary を含める

CLI出力:
  build-report.md を別ファイルとしても出力可能にする
```

### 理由

Context Pack内にBuild Reportを完全内包すると、AIに渡す本文が肥大化します。
一方で、Build Reportを完全に別ファイルにすると、AIがWarningsや欠落情報を見落とす可能性があります。

そのため、M2-1標準としては以下が妥当です。

| 出力                                          | 役割            | AIへ渡すか   |
| ------------------------------------------- | ------------- | -------- |
| `context-pack.md`                           | AI作業用の文脈本体    | 渡す       |
| `context-pack.md` 内の `Build Report Summary` | 欠落・警告・除外の最小情報 | 渡す       |
| `build-report.md`                           | 人間レビュー用の詳細ログ  | 原則、人間確認用 |

### 修正文案

`context-pack-structure.md` のBuild Report Policyを、以下のように固定するのがよいです。

```md
Phase 2初期実装では、Context Pack内にBuild Report Summaryを必ず含める。

Build Report Summaryには、AIが作業時に誤読を避けるために必要な最小情報のみを含める。

詳細なBuild Reportは、CLI実装時に別ファイルとして出力してよい。

標準出力候補は以下とする。

- `dist/context/{project_code}/{agent_code}/context-pack.md`
- `dist/context/{project_code}/{agent_code}/build-report.md`

Context Pack内のBuild Report Summaryと、別ファイルのBuild Reportが競合する場合は、
元sourceおよびBuild Report詳細を確認し、Context Packを正本として扱わない。
```

### Active化条件

RP-004は、**「内包するのか分離するのか」をM2-1標準として明確化する必要があります。**

---

## RP-005：Session Context と Recent Conversation Context の境界が実装可能か

### 判定

**OK / P1補足推奨**

### 確認結果

実装可能です。
境界は以下のように切れます。

| 項目           | Session Context                  | Recent Conversation Context   |
| ------------ | -------------------------------- | ----------------------------- |
| 対象           | 今回の作業セッション内の一時情報                 | 直近会話から抽出された未反映情報              |
| 生成元          | 今回のCLI引数、task request、手動入力、作業中メモ | conversation-summary、直近チャット要約 |
| 有効期間         | 今回のContext Pack生成単位              | 正本反映またはarchivedまで             |
| 正本性          | なし                               | なし                            |
| Active文書との競合 | Active優先                         | Active優先                      |
| 主な用途         | 今回だけの補足・制約・作業途中メモ                | まだ正本化していない候補情報の持ち込み           |

### 実装イメージ

```yaml
context_build_request:
  session_context:
    include: true
    content: "今回のレビューではP0/P1のみ抽出する"

  recent_context:
    include: true
    source: "conversation-summary"
    max_items: 5
```

または、初期実装ではさらに単純にできます。

```yaml
session_context: "今回だけ有効な補足"
recent_context_file: "docs/conversations/2026-06-08-m2-1-summary.md"
```

### 推奨修正

`context-pack-structure.md` に、以下の境界定義を追記するとよいです。

```md
Session Contextは、Context Build Requestに含まれる一時入力である。
Recent Conversation Contextは、Conversation Summary等から取得する直近会話由来の未反映情報である。

Session Contextは今回生成するContext Packに閉じる。
Recent Conversation Contextは、正本反映・reviewed・archived等の状態遷移まで参照候補として残り得る。
```

### Active化条件

RP-005は**現状でも通せます**。
ただし、実装時の迷いを減らすためP1補足を推奨します。

---

## RP-006：Source Status HandlingがM1のtaxonomy/status定義と整合しているか

### 判定

**概ねOK / P1修正**

### 確認結果

M1側のstatus定義は、概ね以下です。

```text
draft
proposed
active
accepted
deprecated
superseded
archived
```

M2-1ドラフトのSource Status Handlingも以下を扱っています。

```text
active
accepted
draft
proposed
superseded
deprecated
archived
unknown
```

したがって、**M1 status定義との整合は概ね取れています。**

### 気になる点

`accepted` の扱いだけ補足が必要です。

`active` は現在有効な運用文書・記憶文書に使いやすいstatusです。
一方、`accepted` はADRやDecisionの採用状態として使うと自然です。

そのため、以下のように定義した方が安全です。

| status       | 推奨扱い                        |
| ------------ | --------------------------- |
| `active`     | 現在有効な正本文書・運用文書・記憶文書         |
| `accepted`   | 採用済みADRまたはDecision系source   |
| `draft`      | 未承認。明示指定時のみwarning付き        |
| `proposed`   | 提案中。確定判断に使わない               |
| `superseded` | 置換済み。履歴目的のみ                 |
| `deprecated` | 非推奨。原則除外                    |
| `archived`   | 保管済み。履歴目的のみ                 |
| `unknown`    | M2-1追加扱い。status不明。確定根拠に使わない |

`unknown` はM1の正式statusではありませんが、Context Builder実装上の検出結果としては有用です。
ただし、これは**source metadataの欠落状態**であり、正規statusではないと書いた方がよいです。

### 修正文案

```md
`unknown` はM1で定義した正式statusではない。
Context Builderがsourceのstatusを判定できなかった場合のbuild-time handling valueとして扱う。

`unknown` sourceは確定根拠に使用せず、WarningsおよびBuild Reportに記録する。
```

### Active化条件

RP-006は**P1修正で十分**です。

---

# Active化前の修正項目一覧

## P0：必須修正

| ID              | 対象                                     | 修正内容                                                       | 理由                                                      |
| --------------- | -------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------- |
| M2-1-REV-P0-001 | `context-pack-structure.md`            | Phase 2要件上の成果物名と、今回成果物名の関係を明記する                            | `context-pack-format.md` 等との不一致を放置すると、後続M2タスクで成果物体系がブレる |
| M2-1-REV-P0-002 | `context-pack-structure.md` / template | Build Reportは「Context Pack内にSummaryを含め、詳細は別ファイル出力可能」と標準化する | 内包/分離の判断が曖昧だとCLI実装時に迷う                                  |

## P1：推奨修正

| ID              | 対象                          | 修正内容                                                              | 理由                               |
| --------------- | --------------------------- | ----------------------------------------------------------------- | -------------------------------- |
| M2-1-REV-P1-001 | `context-pack-structure.md` | 既存候補構成から15章構成への展開対応表を追加する                                         | 12章相当から15章へ拡張した理由を明確化する          |
| M2-1-REV-P1-002 | `context-pack-structure.md` | Session Context / Recent Conversation Context の入力元・有効期間・保持境界を追記する | 実装時の境界判断を安定させる                   |
| M2-1-REV-P1-003 | `context-pack-structure.md` | `accepted` と `active` の使い分けを補足する                                  | ADR/Decisionと通常文書のstatus運用を明確化する |
| M2-1-REV-P1-004 | `context-pack-structure.md` | `unknown` は正式statusではなくbuild-time handling valueと明記する             | M1 taxonomy/statusとのズレを防ぐ        |

---

# Active化判断

## 判定

**Conditional Go**

M2-1ドラフトは、Context Pack標準構造として十分に有効です。
ただし、Active化するには **P0-001 / P0-002 の反映が必要**です。

## 理由

* Context Packが正本ではなく生成物である点は明確。
* Source List / Warnings / Build Metadataの扱いは妥当。
* 15章構成はM1のContext階層・Agent分離方針と整合している。
* ただし、Phase 2成果物名との接続とBuild Reportの出力単位が曖昧なままだと、次タスクで構造ブレが起きる。

---

# 次に行うべきこと

次の作業は、以下でよいです。

```text
P0/P1を反映して、M2-1成果物のActive化版を作成する。
```

対象は以下の2ファイルです。

```text
docs/context/context-pack-structure.md
templates/context/context-pack.template.md
```

## まとめ / Summary

**日本語:**
M2-1ドラフトは大枠OKです。ただし、成果物名の整合とBuild Reportの扱いはActive化前に必ず修正した方がよいです。15章構成、Warningsの位置、Session ContextとRecent Conversation Contextの分離、Source Status Handlingは概ね妥当です。

**English:**
The M2-1 draft is mostly good. Before making it active, the deliverable names and Build Report policy should be fixed. The 15-section structure, Warnings position, context separation, and source status handling are mostly valid.

## Conversation Memory

### fact

* M2-1：Context Pack標準構造定義のドラフト成果物として、`docs/context/context-pack-structure.md` と `templates/context/context-pack.template.md` が作成済み。
* M2-1ドラフトでは、Context PackをAIへ渡すMarkdown生成物として定義している。
* M2-1ドラフトでは、Context Packは正本ではなく生成物であると明記している。
* M2-1ドラフトでは、Context Pack標準構造を15章構成としている。
* M2-1ドラフトでは、Warnings、Source List、Build Metadata、Build Reportの扱いを定義している。
* 既存Phase 2要件では、成果物候補として `context-pack-format.md`、`context-build-rule.md`、`agent-context-profiles.md` 等が示されており、今回のM2-1成果物名とは完全一致していない。
* M1のstatus定義には `draft`、`proposed`、`active`、`accepted`、`deprecated`、`superseded`、`archived` が含まれる。

### decision

* RP-001はP0修正対象と判断した。
* RP-002は15章構成への拡張を許容可能と判断した。
* RP-003はWarningsをSource Listより前に置く構成で問題なしと判断した。
* RP-004はP0修正対象と判断した。
* RP-005はSession ContextとRecent Conversation Contextの境界は実装可能と判断した。
* RP-006は概ね整合しているがP1補足が必要と判断した。
* M2-1 Active化判断は `Conditional Go` とした。
* Build Reportは、Context Pack内にSummaryを含め、詳細は別ファイル出力可能とする方針が妥当と判断した。

### task

* `docs/context/context-pack-structure.md` に、Phase 2要件上の成果物名と今回成果物名の関係を明記する。
* `docs/context/context-pack-structure.md` と `templates/context/context-pack.template.md` に、Build Report Summary内包・詳細Build Report別ファイル許容の方針を反映する。
* 15章構成が既存候補構成を詳細化したものであることを対応表付きで追記する。
* Session ContextとRecent Conversation Contextの入力元・有効期間・保持境界を補足する。
* `accepted` と `active` の使い分けを補足する。
* `unknown` は正式statusではなくbuild-time handling valueであると補足する。

### preference

* 成果物はMarkdownとしてそのまま配置・Active化レビューできる形式を重視する。
* 正本・生成物・draft・recent contextの境界を曖昧にしない方針を重視する。
* AIへ渡すContext Packでは、Warningsを明示して誤読リスクを下げる構成を重視する。

### constraint

* Context Packは正本ではなく生成物。
* Active ADR、Active運用文書、Activeプロジェクト記憶文書などがContext Packより優先される。
* Recent Conversation ContextはActive正本より優先しない。
* Session Contextは今回作業セッション内の一時情報であり、正本ではない。
* draft sourceは明示指定時のみwarning付きで含める。
* `unknown` はM1の正式statusではなく、Context Builderがstatus判定できなかった場合のbuild-time handling valueとして扱うべき。

### issue

* Phase 2要件上の成果物名とM2-1成果物名が一致していない。
* Build ReportをContext Pack内に含めるか別ファイルに分けるかの標準方針が、Active化前により明確化される必要がある。
* 15章構成は妥当だが、既存候補構成からの展開関係を明記しないと章構成変更の意図が伝わりにくい。
* `accepted` と `active` の使い分けが未補足だと、ADR/Decision系statusと通常文書statusが混ざる可能性がある。

### idea

* Build Reportは、AI用のSummaryと人間レビュー用の詳細ファイルに分ける二層構造が有効。
* 旧構成と新15章構成の対応表を入れることで、要件変更ではなく詳細化として説明できる。
* Session ContextはContext Build Request由来、Recent Conversation ContextはConversation Summary由来として実装すると境界が明確になる。

### article_note

* Context Pack設計では、「AIに渡す文脈」と「正本」を分けることが重要な設計思想になる。
* WarningsをSource Listより前に置く設計は、AIに危険情報を先に読ませるための実践的な工夫として説明できる。
* Build ReportをAI用Summaryと人間用詳細ログに分ける考え方は、AI外部記憶基盤の運用設計として記事化しやすい。

### conversation_summary

* このチャットでは、M2-1：Context Pack標準構造定義のドラフトについて、RP-001〜RP-006の観点でActive化前レビューを実施した。成果物名の整合とBuild Reportの扱いをP0修正対象とし、それ以外は概ね妥当またはP1補足で対応可能と判断した。最終判断はConditional Go。

### test_result

* M2-1ドラフトのレビュー結果は `Conditional Go`。
* RP-001はP0要修正。
* RP-002はOK、P1補足推奨。
* RP-003はOK。
* RP-004はP0要修正。
* RP-005はOK、P1補足推奨。
* RP-006は概ねOK、P1修正推奨。
