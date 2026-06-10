# M2-5 Context Builder Revised Draft

This package is the revised draft for **M2-5: Context Builder initial implementation**.

## Implemented fixes

### P0

- `M2-5-REV-P0-001`: Added frontmatter metadata parsing for `title`, `document_id` / `template_id`, and `status`.
- `M2-5-REV-P0-002`: Standardized status warning codes.
  - `draft` -> `draft_source_included`
  - `proposed` -> `proposed_source_included`
  - `archived` -> `archived_source_included`
  - `deprecated` -> `deprecated_source_included`
  - `superseded` -> `superseded_source_included`
  - `unknown` -> `unknown_status`
- `M2-5-REV-P0-003`: `active` / `accepted` sources are included normally without warnings.
- `M2-5-REV-P0-004`: Source List now includes `Document ID` and `Title`.
- `M2-5-REV-P0-005`: Source body rendering is fenced as Markdown code blocks to avoid breaking Context Pack structure.
- `M2-5-REV-P0-006`: Build Report now includes `Required Docs Check` even for successful builds.

### P1

- `M2-5-REV-P1-001`: Added `--help` / `-h` CLI output.
- `M2-5-REV-P1-002`: Added `npm run check` as `typecheck + lint + format:check`.
- `M2-5-REV-P1-003`: Added ESLint / Prettier configuration files.
- `M2-5-REV-P1-004`: Token estimate is marked as approximate.
- `M2-5-REV-P1-005`: Recent Context loader and semantic conflict detection are listed as unsupported / placeholder features in Build Report.
- `M2-5-REV-P1-006`: Source paths are normalized to `/` where source resolution outputs paths.
- `M2-5-REV-P1-007`: Build Report source tables include `Matched By`, `Explicitly Requested`, and `Selection Reason`.

## Commands

```bash
npm install
npm run check
npm run context:build -- --project ats --agent implementation_reviewer --task "reward request usecase review"
npm run context:build -- --project mnemosyne --agent implementation_reviewer --task "context builder implementation review"
npm run context:build -- --help
```

## Verification result in this draft package

- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run format:check`: passed
- `npm run check`: passed
- `ats` Context Pack generation: passed
- `mnemosyne` Context Pack generation: passed
- draft source explicit inclusion warning: verified separately as `draft_source_included`

## Known limitations

- Recent Context loader is still a placeholder.
- Semantic conflict detection is not implemented.
- Token estimation is approximate and not tokenizer-based.

## Draft 0.1.0-draft.3 Notes

This revision reflects the final pre-Active fixes:

- Standardized included non-active source warning codes.
  - `draft` -> `draft_source_included`
  - `proposed` -> `proposed_source_included`
  - `archived` -> `archived_source_included`
  - `deprecated` -> `deprecated_source_included`
  - `superseded` -> `superseded_source_included`
  - `unknown` -> `unknown_status`
- Moved test additional sources out of `docs/review` into `tests/fixtures/context-builder`.
- `docs/review/*.md` remains a regular Project Registry review source candidate and should not be used for ad-hoc fixture files.

Recommended fixture checks:

```bash
npm run context:build -- --project ats --agent implementation_reviewer --task "active additional source test" --source tests/fixtures/context-builder/temp-review-note.md
npm run context:build -- --project ats --agent implementation_reviewer --task "draft additional source test" --source tests/fixtures/context-builder/draft-review-note.md
```

Expected result:

- Active fixture is included normally.
- Draft fixture is included with `draft_source_included` warning.
