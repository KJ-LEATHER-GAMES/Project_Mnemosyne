# M2-6 Context Preview Active Package

## Status

Active candidate verified on 2026-06-11.

## Canonical artifacts

- `docs/context/build-report-rule.md`
- `docs/templates/context/context-preview.template.md`
- `docs/templates/context/build-report.template.md`
- `src/services/contextPreviewService.ts`
- `dist/context/mnemosyne/implementation_reviewer/context-preview.md`

Template paths are normalized to the M2-1 canonical location `docs/templates/context/`.

## Supporting implementation changes

- `src/services/contextBuilderService.ts`
- `src/services/buildReportService.ts`
- `src/types/context.ts`
- `src/cli/context-build.ts`

These supporting files are included because P1-001 requires Build Report type and Builder changes, and P1-003 requires the generated Context Pack / Build Report markdown to be supplied to Preview trace verification.

## Applied review items

- M2-6-REV-P0-001: Coverage and evidence quality separated.
- M2-6-REV-P1-001: Response reserve and available input budget added.
- M2-6-REV-P1-002: Warning Handling added.
- M2-6-REV-P1-003: Traceability uses actual generated markdown verification.
- M2-6-REV-P1-004: Review Recommendation values and priority rules defined.

## Verification

- `npm run check`: PASS
- Active additional source build: PASS
- Draft additional source build: PASS
- Draft source result: required context `covered`, non-final evidence `review`
- Active sample: 3 included, 0 excluded, 0 warnings
