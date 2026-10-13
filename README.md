<h1 align="center">Tab Group Lazy Restore</h1>

<p align="center">
  English · <a href="README.zh-CN.md">Simplified Chinese</a>
</p>

Ever reopened a saved Chrome tab group and watched your memory usage jump? You keep dozens of tabs around because you might need them later. Reopening the group can load them all at once, even if you only wanted to resume one page.

Tab Group Lazy Restore helps release eligible background tabs after the group opens. The tabs stay in their original group, ready to load again when you switch to them. You can keep using Chrome's saved tab groups as usual, though opening a group can still cause a temporary memory spike.

## Installation

1. Download the ZIP package from the [latest release](https://github.com/QXiaoLingShang/google-chrome-tab-group-lazy-restore/releases).
2. Extract the ZIP file.
3. Open `chrome://extensions/` in Chrome and enable **Developer mode**.
4. Click **Load unpacked** and select the extracted folder containing `manifest.json`.

## Usage

Reopen a saved tab group in Chrome as usual. The extension detects newly restored tabs and discards eligible background tabs automatically, while keeping the active tab loaded. Switch to a discarded tab whenever you need it, and Chrome loads its page again.

Groups with five tabs or fewer are left alone by default. You can change this threshold and protect specific groups in the settings below.

## Configuration

Open `chrome://extensions/`, click **Details** for the extension, and select **Extension options**.

- **Minimum number of tabs**: Groups with this many tabs or fewer are left alone. The default is `5`.
- **Protected group names**: Add group names in the final input row. Press Enter or leave the field to confirm an entry. Tabs in groups whose names exactly match a name in this list are not discarded.
- **Wait for tab titles before discarding (Experimental)**: Wait for each tab's title update before discarding it. If no update arrives before the restore timeout, an eligible tab can still be discarded. This is off by default and may keep memory usage high for longer.
- **Advanced settings**: Adjust restore detection, inspection delay, restore timeout, retry behavior, and the number of simultaneous discards. This section is collapsed by default. Start with the defaults; increasing the delays can keep restored pages loaded for longer.

Settings save automatically in Chrome's local storage. No rebuild is required. The settings page supports English and Simplified Chinese, and you can return to the defaults with **Restore defaults**.

## How it works

When Chrome restores a saved group, Tab Group Lazy Restore watches for the burst of tabs created during the restore and processes eligible background tabs in batches:

1. Leave the currently active tab loaded.
2. Discard eligible background tabs in batches, with a limit on how many are processed at once. If you enable title waiting, each tab waits for a title update first.
3. Keep the tab entries in the original group. When you switch to one, Chrome loads its page again.

The extension does not delete tabs or discard tabs that were already open before the restore. It skips pinned tabs, tabs playing audio, and tabs with a pending navigation. It checks tab state again before each discard and revisits tracked tabs when their navigation, pinned, or audio state changes. Checks continue while new tabs arrive, so a long restore does not postpone all discard work.

## Limitations

Chrome may begin loading several pages before the extension can discard them. The extension can reduce memory usage after a restore, but it does not prevent the initial memory spike or create truly lazy tabs. Memory reclamation and Chrome's memory reporting may also take time.

Detection is based on recently created tabs joining the same group. Quickly creating and grouping several new tabs may also trigger it. Only newly tracked tabs are candidates for discard; existing tabs and protected groups are left alone.

## Development

To build from source, use **Node.js 22.x (22.13.0+), 24.x, or 26+**, and **pnpm 12.6.0 or later**. Node 23 and 25 are outside the supported range. The release workflow uses **Node.js 24** and **pnpm 12.11.2**. You only need these tools for development; installing a release ZIP does not require them.

Clone the repository and run these commands from its root directory:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm test:coverage
pnpm build:dev
```

After building, load the repository root with **Load unpacked** in `chrome://extensions/`. After changing the source, build again and click the extension's reload button. To create an installable ZIP, run `pnpm package:release`; the archive is written to `release/`.

CI checks formatting, types, core test coverage, development builds, and release archives on Windows and Linux. Matching version tags create a draft GitHub Release after those checks pass. See the [contributing guide](docs/CONTRIBUTING.md) for the toolchain matrix, coverage thresholds, browser checks, and release steps.

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
├── docs/                  # Contributing, privacy, security, and changelog
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

- [Contributing](docs/CONTRIBUTING.md): development, checks, and releases.
- [Privacy](docs/PRIVACY.md): local data and extension permissions.
- [Security](docs/SECURITY.md): reporting a vulnerability.
- [Changelog](docs/CHANGELOG.md): changes by version.

## License

Unless otherwise noted, the original source code, documentation, and artwork in this repository are licensed under the [MIT License](LICENSE).

You may use, modify, distribute, and sell the Software, provided that the copyright notice and license notice are included. Third-party dependencies and materials retain their own licenses.
