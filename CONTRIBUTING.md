# Contributing

Use Node.js 22.20.0 and pnpm 12.6.0 (the packageManager field pins pnpm). Install with `pnpm install --frozen-lockfile`. Only esbuild's install script is allowed in pnpm-workspace.yaml.

Run `pnpm check`, `pnpm test:coverage`, `pnpm build:dev`, and `pnpm package:release`. Load the project directory in Chrome's developer-mode extensions page after building. Development output keeps source maps; release output is bundled without source maps.

Tests use fake timers and a mocked Chrome API to reproduce restoration event ordering. Coverage includes background, group, discard, config, and advanced-config, with gates of 90% statements/lines/functions and 80% branches. It does not measure the options DOM or translations and cannot establish actual browser memory savings. See [browser validation](docs/validation.md).

Keep changes focused. Add regression cases for restore timing, eligibility, or retry changes. Do not broaden the extension to discard pre-existing tabs or bypass active/pinned/audible/navigation protection. Report bugs using the issue form with Chrome version and settings; redact personal URLs.

For a release, update package.json and manifest.json together and document changes in CHANGELOG.md. Verify locally and push a matching version tag (for example v0.3.4). The tag workflow repeats checks, validates the archive, and creates a **draft** GitHub Release. Review the ZIP and browser results before publishing. It does not submit to the Chrome Web Store. Reusing a tag with an existing release requires maintainer handling.
