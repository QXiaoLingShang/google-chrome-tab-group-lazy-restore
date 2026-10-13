<h1 align="center">Tab Group Lazy Restore</h1>

<p align="center">
  English · <a href="README.zh-CN.md">Simplified Chinese</a>
</p>

Ever reopened a saved Chrome Tab Group and watched your memory usage explode? You keep dozens of tabs around because you might need them later. While they sit idle, Chrome may keep their resource use under control, so the group seems harmless—until you close the browser or simply close the group without deleting it.

Restore that group, and Chrome may wake up and load every tab at once. A group with 30–40 tabs can push memory use past 5 GB, even if you only wanted to resume one page.

Closing those tabs would lose the pages you saved; keeping them loaded can mean a hefty memory bill. Tab Group Lazy Restore eases that tradeoff by discarding eligible tabs during the restore, helping bring memory use back down.

## Installation

1. Download the ZIP package from the [latest release](https://github.com/QXiaoLingShang/google-chrome-tab-group-lazy-restore/releases).
2. Extract the ZIP file.
3. Open `chrome://extensions/` in Chrome and enable **Developer mode**.
4. Click **Load unpacked** and select the extracted folder containing `manifest.json`.

## Usage

Enable the extension and reopen a group with more than five tabs (the default threshold). It detects tabs created during the restore and discards eligible background tabs to help keep memory use down.

To adjust the settings, open `chrome://extensions/`, click **Details** for the extension, and select **Extension options**.

## Limitations

Chrome may start loading pages before the extension can discard their tabs. It can lower memory use after a restore, but it cannot prevent the initial spike or make tabs load only when you switch to them. Chrome may also take time to reclaim memory and update its memory reporting.

## Development

For supported tool versions and build instructions, see the [development guide](docs/DEVELOP.md).

## Project structure

```text
better_group/
├── manifest.json
├── options.html           # Extension settings page
├── icons/                 # Extension icons
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml    # Dependency build-script permissions
├── tsconfig.json
├── vitest.config.mts      # Core test and coverage configuration
├── .github/workflows/     # CI and draft-release workflows
├── docs/                  # English development and project guides
├── scripts/               # Build, archive, and toolchain checks
├── tests/                 # Chrome API mocks and regression tests
├── src/
│   ├── background.ts      # Service worker event entry point
│   ├── advanced-config.ts # Internal tuning constants
│   ├── config.ts          # Restore settings and storage loading
│   ├── group.ts           # Restore-batch tracking and tab inspection
│   ├── discard.ts         # Bounded-concurrency discard queue
│   ├── options.ts         # Settings page logic
│   ├── i18n.ts            # English and Simplified Chinese messages
│   └── types.ts           # Shared TypeScript types
└── dist/                  # Generated extension scripts
```

## Documentation

- [Development](docs/DEVELOP.md): supported tools and build instructions.
- [Contributing](docs/CONTRIBUTING.md): development, checks, and releases.
- [Privacy](docs/PRIVACY.md): local data and extension permissions.
- [Security](docs/SECURITY.md): reporting a vulnerability.
- [Changelog](docs/CHANGELOG.md): changes by version.

## License

This project is licensed under the [MIT License](LICENSE).
