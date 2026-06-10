# M2-6 Context Preview Draft

This package contains the draft artifacts for M2-6: Context Preview implementation.

## Included artifacts

- `docs/context/build-report-rule.md`
- `docs/templates/context/context-preview.template.md`
- `docs/templates/context/build-report.template.md`
- `src/services/contextPreviewService.ts`
- `dist/context/mnemosyne/implementation_reviewer/context-preview.md`

## Placement note

The user-facing milestone list used `templates/context/...`, but M2-1 active policy defines `docs/templates/context/...` as the formal template location. This draft follows the active placement policy.

## Draft intent

- Build Report: detailed generation diagnostics.
- Context Preview: human pre-flight review summary.
- Context Pack: AI input body.

## Active化前 review candidates

- Confirm whether `ContextBuildReport` should carry `taskRequest`, `projectName`, `agentName`, and `reserveTokensForResponse` directly.
- Decide whether `agentRequiredContext` should be passed from `agentRegistryService` to `contextPreviewService` or embedded in `ContextBuildReport`.
- Decide whether fixed filenames remain sufficient or timestamped filenames are required.
- Add CLI integration after service review.
