<h1 align="center">Tab Group Lazy Restore</h1>

<p align="center">
  English · <a href="README.zh-CN.md">Simplified Chinese</a>
</p>

Ever reopened a saved Chrome Tab Group and watched your memory usage explode? You keep dozens of tabs around because you might need them later. While they sit idle, Chrome may keep their resource usage under control, so the group seems harmless—until you close the browser or simply close the group without deleting it.

Restore that group, and Chrome may wake up and load every tab at once. A group with 30–40 tabs can suddenly consume 5–6 GB of memory, even if you only wanted to resume one page.

Closing the tabs solves the memory problem, but defeats the purpose of saving the group. Keeping them all loaded makes every restore expensive. Tab Group Lazy Restore bridges that gap.

## Installation

1. Download the ZIP package from the [latest release](https://github.com/QXiaoLingShang/google-chrome-tab-group-lazy-restore/releases).
2. Extract the ZIP file.
3. Open `chrome://extensions/` in Chrome and enable **Developer mode**.
4. Click **Load unpacked** and select the extracted folder containing `manifest.json`.

## Configuration

Open `chrome://extensions/`, click **Details** for the extension, and select **Extension options**.

- **Advanced settings** is collapsed by default. Expand it to tune restore detection, inspection delay, title-wait lifetime, retry behavior, and discard concurrency. These are internal controls; unusual values may increase restore latency or browser pressure.
- **Minimum tabs**: Groups with this many Tabs or fewer are loaded normally. The default is `5`.
- **Protected group names**: Add group names in the final input row. Press Enter or leave the field to confirm an entry. Tabs in groups whose names exactly match a name in this list are not discarded.
- **Wait for tab titles (Experimental)**: When enabled, wait for a title update event before discarding an individual tab. Tabs that never receive the event are discarded when the restore wait deadline expires. Disabled by default. This can prolong the high-memory period while a Group is opening.

Settings are stored locally in Chrome and take effect on the next Group restore. No rebuild is required after changing them.

## How It Works

When Chrome restores a saved group, Tab Group Lazy Restore watches for the burst of tabs created during the restore and processes eligible background tabs in batches:

1. Leave the currently active tab loaded.
2. Put eligible background tabs into a bounded-concurrency discard queue. When the experimental title option is enabled, each tab waits for its title update event first.
3. Keep the tab entries in the original group. When you switch to one, Chrome loads its page again.

Nothing is deleted, and pre-existing tabs are never candidates for discard. Pinned tabs, tabs playing audio, and tabs still navigating are skipped. Navigating tabs are checked again on loading-state updates. A continuous restore is inspected periodically instead of waiting for its last event.

## Known issues

This is not true lazy loading. When Chrome opens a saved Tab Group, it may still load multiple tabs in parallel, so opening a Group can cause a temporary memory spike. The extension cannot prevent Chrome's initial loading; it can only discard eligible tabs as quickly as possible after detecting them. Chrome may also take additional time to reclaim memory and refresh its memory reporting.

## Development and verification

Minimum supported toolchain: **Node.js 22.13.0** and **pnpm 12.6.0**. Supported Node release lines follow Vitest: 22 (22.13.0+), 24, and 26+. Node 23 and 25 are not supported. Recommended: **Node.js 24 LTS** and **pnpm 12.11.2**. These tools are only needed to develop/build the extension, not to install its ZIP in Chrome.

CI verifies Windows/Linux with the minimum pair, Node 24 + pnpm 12.11.2, and Node 26 + pnpm 12.11.2. Higher versions are allowed by the declared ranges; versions outside the matrix are not separately verified. Dependency updates are reviewed manually; automatic Dependabot PRs are disabled.

Clone this repository, run `pnpm install --frozen-lockfile`, then:

```sh
pnpm check
pnpm test:coverage
pnpm build:dev
pnpm package:release
```

Load the project directory as an unpacked extension after building. The ZIP is written to `release/`. CI checks Windows/Linux and uploads coverage and installable ZIP artifacts. Matching version tags run the checks again and create a draft Release for review.

Coverage gates apply to the restoration core (events, batching, queue, and configuration): 90% statements/lines/functions and 80% branches. Options DOM and translations require browser checks and are outside that percentage. Actual memory improvements require browser measurements.

See [contributing](CONTRIBUTING.md), [privacy](PRIVACY.md), [security](SECURITY.md), [changelog](CHANGELOG.md), and [browser validation](docs/validation.md). The [repository comparison](docs/project-review.zh-CN.md) and [true lazy restore proposal](docs/true-lazy-restore.zh-CN.md) document the native API limitation and a possible future extension-managed workflow.

## Source Structure

```text
better_group/
├── manifest.json
├── options.html        # Extension settings page
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── src/
│   ├── background.ts      # Service worker event entry point
│   ├── advanced-config.ts # Internal tuning constants
│   ├── config.ts          # Restore settings and storage loading
│   ├── group.ts           # Restore-batch tracking and tab inspection
│   ├── discard.ts         # Bounded-concurrency discard queue
│   ├── options.ts         # Settings page logic
│   └── types.ts           # Shared TypeScript types
└── dist/
```

## License

Unless otherwise noted, the original source code, documentation, and artwork in this repository are licensed under the [MIT License](LICENSE).

You may use, modify, distribute, and sell the Software, provided that the copyright notice and license notice are included. Third-party dependencies and materials retain their own licenses.
