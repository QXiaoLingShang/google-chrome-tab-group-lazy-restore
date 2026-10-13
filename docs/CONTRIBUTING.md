# Contributing

## Toolchain

Use Node.js 22.x (22.13.0+), 24.x, or 26+, and pnpm 12.6.0 or later. Node 23 and 25 are outside the supported range. To match the release workflow, use Node.js 24 and pnpm 12.11.2. You can install that pnpm version with `npm install --global pnpm@12.11.2`.

The supported ranges are declared in [package.json](../package.json), under `engines` and `devEngines.packageManager`. The package-manager setting rejects unsupported versions instead of silently selecting a different version. CI verifies the actual tool versions before installing dependencies, with these combinations on both Windows and Linux:

| Toolchain      | Node.js | pnpm    |
| -------------- | ------- | ------- |
| Minimum        | 22.13.0 | 12.6.0  |
| Release        | 24.x    | 12.11.2 |
| Higher version | 26.x    | 12.11.2 |

Other versions within the declared ranges are allowed, but are not separately verified by CI. Only esbuild's installation script is allowed in [pnpm-workspace.yaml](../pnpm-workspace.yaml).

## Local development

Run these commands from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm test:coverage
pnpm build:dev
```

Open `chrome://extensions/`, enable **Developer mode**, and use **Load unpacked** to select the repository root. After editing the source, run `pnpm build:dev` again and reload the extension. Development builds retain the module layout and source maps. Release builds bundle and minify the scripts without source maps.

Keep changes focused and add regression cases when changing restore timing, discard eligibility, or retries. Preserve the protections for existing, active, pinned, and audible tabs, and for tabs with a pending navigation.

## Automated checks

- `pnpm check` checks formatting and TypeScript types.
- `pnpm test` runs the regression tests; `pnpm test:watch` runs them in watch mode.
- `pnpm test:coverage` also checks coverage thresholds and writes reports to `coverage/`.
- `pnpm build:dev` builds the scripts used for browser debugging.
- `pnpm package:release` checks types, builds release scripts, and creates a ZIP in `release/`.

Tests use fake timers and a mocked Chrome API to reproduce restore event ordering. Coverage includes `background`, `group`, `discard`, `config`, and `advanced-config`. The thresholds are 90% for statements, lines, and functions, and 80% for branches. The options page DOM and translations are outside this coverage scope; they need browser checks. Automated tests do not establish actual browser memory savings.

The [CI workflow](../.github/workflows/ci.yml) runs the checks on the toolchain matrix above, validates the ZIP files, and uploads coverage reports and installable archives. Dependency and GitHub Actions updates are reviewed manually; automatic Dependabot update PRs are disabled. Review migration notes and run the same checks before accepting an update.

## Browser checks

Before submitting a change to restore behavior, load the development build and check these cases with test pages:

- Reopen a saved group above the configured tab threshold. Confirm that the active tab stays loaded, eligible background tabs are discarded, and switching to a discarded tab reloads it.
- Check small groups and groups with an exactly matching protected name. Their tabs should be left alone.
- Confirm that existing, pinned, and audible tabs are protected, along with tabs that have a pending navigation. Check a group restored entirely in the background as well as one with an active tab.
- Test title waiting both on and off. With it enabled, check title updates and tabs that reach the restore timeout without an update.
- Check automatic saving, restoring defaults, and both settings-page languages. Reload the extension and confirm that saved settings persist.

If reporting memory results, record the Chrome version, group size, settings, measurement method, and results. Compare equivalent restores with and without the extension; distinguish the initial peak from memory usage after restoration. Redact personal URLs from screenshots and logs. Report bugs through the repository's issue form, and report vulnerabilities as described in [Security](SECURITY.md).

## Releases

Update [package.json](../package.json) and [manifest.json](../manifest.json) to the same version, and record the changes in the [changelog](CHANGELOG.md). Run the automated and browser checks, then build the archive with `pnpm package:release`.

A matching version tag, such as `v0.3.4`, triggers the [draft-release workflow](../.github/workflows/release.yml). It repeats the checks, confirms that the tag and both version fields match, validates the archive, and creates a draft GitHub Release. Review the ZIP and browser results before publishing. The workflow does not submit the extension to the Chrome Web Store; an existing release for the same tag requires maintainer handling.
