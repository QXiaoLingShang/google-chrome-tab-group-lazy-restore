# Development

Build from source with **Node.js 22.13.0+ within 22.x, 24.x, or 26+**, and **pnpm 12.6.0 or later**. Node 23 and 25 are unsupported. Installing a release ZIP does not require Node.js or pnpm.

Install dependencies and run the checks from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm test:coverage
pnpm build:dev
```

After building, open `chrome://extensions/`, enable **Developer mode**, and load the repository root. After changing the source, run `pnpm build:dev` again and reload the extension.

To create an installable ZIP, run `pnpm package:release`. The archive is written to `release/`. CI checks formatting, types, tests, and release archives on Windows and Linux.

For browser checks and release steps, see the [contributing guide](CONTRIBUTING.md).
