# Contributing

Minimum supported versions: Node.js 22.13.0 and pnpm 12.6.0. The Node range follows Vitest: 22.13.0+ within Node 22, Node 24, or Node 26+. Node 23/25 are unsupported. Recommended development/release toolchain: Node.js 24 LTS and pnpm 12.11.2. Install the recommended pnpm with `npm install --global pnpm@12.11.2`, then run `pnpm install --frozen-lockfile`.

package.json declares supported ranges in engines and devEngines.packageManager rather than requiring a single pnpm version. The package-manager range fails on unsupported versions instead of downloading a different version silently. CI checks the minimum pair and higher Node 24/26 pairs on Windows/Linux and asserts the actual versions before installing dependencies. Versions outside that matrix are allowed where the ranges match, but are not independently verified. Only esbuild's install script is allowed in pnpm-workspace.yaml.

Dependabot automatic version updates are disabled. Review dependency and Actions updates manually, inspect migration notes, and run the same checks. Security alerts remain separate from automatic update PRs.

Run `pnpm check`, `pnpm test:coverage`, `pnpm build:dev`, and `pnpm package:release`. Load the project directory in Chrome's developer-mode extensions page after building. Development output keeps source maps; release output is bundled without source maps.

Tests use fake timers and a mocked Chrome API to reproduce restoration event ordering. Coverage includes background, group, discard, config, and advanced-config, with gates of 90% statements/lines/functions and 80% branches. It does not measure the options DOM or translations and cannot establish actual browser memory savings. See [browser validation](docs/validation.md).

Keep changes focused. Add regression cases for restore timing, eligibility, or retry changes. Do not broaden the extension to discard pre-existing tabs or bypass active/pinned/audible/navigation protection. Report bugs using the issue form with Chrome version and settings; redact personal URLs.

For a release, update package.json and manifest.json together and document changes in CHANGELOG.md. Verify locally and push a matching version tag (for example v0.3.4). The tag workflow repeats checks, validates the archive, and creates a **draft** GitHub Release. Review the ZIP and browser results before publishing. It does not submit to the Chrome Web Store. Reusing a tag with an existing release requires maintainer handling.
