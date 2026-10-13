<h1 align="center">Tab Group Lazy Restore</h1>

<p align="center">
  English · <a href="README.zh-CN.md">Simplified Chinese</a>
</p>

Picture this: your Saved Tab Group has 30 or 40 tabs in it. They sit quietly in the background, and you keep them because you know you'll need them someday. But reopen the group, and Chrome may wake them all up at once. Memory shoots past 5 GB, even if you only wanted to check one page.

Close those tabs and lose the pages you saved; leave them alone and every restore can bring another memory hit, sometimes enough to bog Chrome down. Repeatedly cleaning them up by hand is a hassle, and it defeats the point of saving them for later.

**Tab Group Lazy Restore** helps ease that tradeoff. During a group restore, it discards eligible background tabs to bring memory use down afterward. Switch to a discarded tab and Chrome loads its page again.

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
