---
title: "M2-5 Context Builder Integration Guide"
document_id: "docs/review/m2-5-context-builder-integration-guide.md"
document_role: "integration_guide"
status: "active"
version: "1.0.0"
created_at: "2026-06-10"
updated_at: "2026-06-10"
phase: "Phase 2: Context Forge"
milestone: "M2-5: Context Builder初期実装"
owner: "Project Mnemosyne"
review_status: "active"
related_documents:
  - "docs/review/m2-5-context-builder-active-review.md"
---

# M2-5 Context Builder Integration Guide

## 1. Purpose

本書は、M2-5更新版ドラフトをProject Mnemosyne正本ディレクトリへ統合するための手順を定義する。

---

## 2. Copy Targets

以下を正本ディレクトリへ反映する。

| Source in Draft | Target in Project Mnemosyne |
|---|---|
| `src/cli/context-build.ts` | `src/cli/context-build.ts` |
| `src/services/*.ts` | `src/services/*.ts` |
| `src/types/*.ts` | `src/types/*.ts` |
| `config/projects.yaml` | `config/projects.yaml` |
| `config/agents.yaml` | `config/agents.yaml` |
| `tests/fixtures/context-builder/*.md` | `tests/fixtures/context-builder/*.md` |
| `package.json` | `package.json` |
| `package-lock.json` | `package-lock.json` |
| `tsconfig.json` | `tsconfig.json` |
| `eslint.config.mjs` | `eslint.config.mjs` |
| `.prettierrc` | `.prettierrc` |
| `.prettierignore` | `.prettierignore` |
| `README-M2-5-DRAFT.md` | `README-M2-5-DRAFT.md` または `docs/context/context-builder-readme.md` |

---

## 3. Do Not Copy

以下は正本としてコピーしない。

| Path | Reason |
|---|---|
| `dist/context/**` | Context Pack / Build Reportは生成物であり正本ではない |
| `node_modules/**` | 依存物。`npm install` で復元する |
| ad-hoc `docs/review/temp-review-note.md` | fixtureへ移動済み。正規review source候補へ混ぜない |
| ad-hoc `docs/review/draft-review-note.md` | fixtureへ移動済み。正規review source候補へ混ぜない |

---

## 4. Recommended Integration Commands

作業側を `m2-5-context-builder-draft`、正本側を `Project_Mnemosyne` とする。

```bash
cd C:\Users\monsi\OneDrive\Apps\remotely-save\Project_Mnemosyne
git status
git checkout -b feature/m2-5-context-builder
```

Gitを使わない場合は、先に正本側をバックアップする。

```bash
xcopy C:\Users\monsi\OneDrive\Apps\remotely-save\Project_Mnemosyne C:\Users\monsi\OneDrive\Apps\remotely-save\Project_Mnemosyne_backup /E /I
```

コピー例：

```bash
robocopy C:\Users\monsi\OneDrive\Apps\remotely-save\m2-5-context-builder-draft\src C:\Users\monsi\OneDrive\Apps\remotely-save\Project_Mnemosyne\src /E
robocopy C:\Users\monsi\OneDrive\Apps\remotely-save\m2-5-context-builder-draft\config C:\Users\monsi\OneDrive\Apps\remotely-save\Project_Mnemosyne\config /E
robocopy C:\Users\monsi\OneDrive\Apps\remotely-save\m2-5-context-builder-draft\tests C:\Users\monsi\OneDrive\Apps\remotely-save\Project_Mnemosyne\tests /E
```

個別ファイル：

```bash
copy C:\Users\monsi\OneDrive\Apps\remotely-save\m2-5-context-builder-draft\package.json C:\Users\monsi\OneDrive\Apps\remotely-save\Project_Mnemosyne\package.json
copy C:\Users\monsi\OneDrive\Apps\remotely-save\m2-5-context-builder-draft\package-lock.json C:\Users\monsi\OneDrive\Apps\remotely-save\Project_Mnemosyne\package-lock.json
copy C:\Users\monsi\OneDrive\Apps\remotely-save\m2-5-context-builder-draft\tsconfig.json C:\Users\monsi\OneDrive\Apps\remotely-save\Project_Mnemosyne\tsconfig.json
copy C:\Users\monsi\OneDrive\Apps\remotely-save\m2-5-context-builder-draft\eslint.config.mjs C:\Users\monsi\OneDrive\Apps\remotely-save\Project_Mnemosyne\eslint.config.mjs
copy C:\Users\monsi\OneDrive\Apps\remotely-save\m2-5-context-builder-draft\.prettierrc C:\Users\monsi\OneDrive\Apps\remotely-save\Project_Mnemosyne\.prettierrc
copy C:\Users\monsi\OneDrive\Apps\remotely-save\m2-5-context-builder-draft\.prettierignore C:\Users\monsi\OneDrive\Apps\remotely-save\Project_Mnemosyne\.prettierignore
```

---

## 5. Post-Integration Verification

```bash
cd C:\Users\monsi\OneDrive\Apps\remotely-save\Project_Mnemosyne
npm install
npm run check
npm run context:build -- --help
npm run context:build -- -h
npm run context:build -- --project ats --agent implementation_reviewer --task "reward request usecase review"
npm run context:build -- --project mnemosyne --agent implementation_reviewer --task "context builder implementation review"
```

Fixture確認：

```bash
npm run context:build -- --project ats --agent implementation_reviewer --task "active additional source test" --source tests/fixtures/context-builder/temp-review-note.md
npm run context:build -- --project ats --agent implementation_reviewer --task "draft additional source test" --source tests/fixtures/context-builder/draft-review-note.md
```

---

## 6. Expected Results

| Command | Expected Result |
|---|---|
| `npm run check` | success |
| `--help` / `-h` | Usage / Options / Examplesが表示される |
| ATS build | Context Pack / Build Report生成 |
| Mnemosyne build | Context Pack / Build Report生成 |
| active fixture | `status=active` |
| draft fixture | `status=draft` + `draft_source_included` |

---

## 7. Commit Example

```bash
git add src config tests package.json package-lock.json tsconfig.json eslint.config.mjs .prettierrc .prettierignore README-M2-5-DRAFT.md
git add docs/review/m2-5-context-builder-active-review.md docs/review/m2-5-context-builder-integration-guide.md
git commit -m "feat: add M2-5 context builder initial implementation"
```

