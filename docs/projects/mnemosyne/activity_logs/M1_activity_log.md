# M1_activity_log

## M1-1_Memory Policy定義

### M1-1-1_`memory-policy.md` ドラフト版作成

#### M1-1-1_activity

このドラフトでは、Context Pack を副本ではなく生成物として明確に分離しました。Context Packは、正本から作られる作業用入力であり、内容が古くなった場合は更新対象ではなく再生成対象として考える方が安全だからです。

また、既存資料間ではADR名に以下の揺れがあります。

| 旧記載例 | 今回採用する名称 |
| ------- | --------------- |
| `ADR-001-docs-as-source-of-design.md` | `ADR-001-docs-as-source-of-memory.md` |
| `ADR-002-memory-source-of-truth.md` | `ADR-002-memory-source-of-truth-boundary.md` |

今回のM1-1では、`docs/phases/phase-1-memory-foundation.md` の成果物名を正として、`memory / source-of-truth-boundary` の名称に揃える方針が妥当です。M1-1は「設計全般」ではなく「記憶基盤における正本境界」を確定する工程であるためです。提示されたPhase計画上でも、M1-1成果物はこの名称で整理されています。

#### M1-1-1_成果物

[[docs/memory/memory-policy.md]]

#### M1-1-1_次に実施すべき作業

`memory-policy.md `の内容確認後は、記載した判断を理由付きで固定するため、以下の順でADRを作成するのが適切です。

1. `ADR-001-docs-as-source-of-memory.md`
2. `ADR-002-memory-source-of-truth-boundary.md`
3. `ADR-003-human-approved-memory-update.md`

### M1-1-2_ADRドラフト作成

#### M1-1-2_activity

