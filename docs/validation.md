# Validation

## Automated core checks

Run `pnpm check`, `pnpm test:coverage`, `pnpm build:dev`, and `pnpm package:release`. CI runs on Windows and Linux with a frozen lockfile for Node 22.13.0 + pnpm 12.6.0 (minimum), Node 24 + pnpm 12.11.2 (recommended LTS), and Node 26 + pnpm 12.11.2 (higher version). Each job asserts the selected versions so package-manager switching cannot invalidate the compatibility check. Coverage reports are available as CI artifacts and at coverage/index.html locally.

The percentage covers only restoration settings, events, batching, and discard/retry behavior. It is not whole-extension coverage; options DOM, translations, real Chrome event ordering, service-worker termination, and OS memory reclamation need browser validation.

## Browser regression checklist

Use a clean Chrome profile and synthetic groups. Record Chrome/OS/extension version and settings.

- Native restore groups with 5, 6, 50, and 200 tabs; restore one wholly in the background and one in another window.
- Verify small/protected groups stay loaded; active, pinned, audible, and navigating tabs are protected.
- Change the active tab during restore; stop audio/unpin a tab; let a navigating tab finish.
- Close tabs or their window while restoration is running; verify no console errors.
- Keep existing tabs in a target group; they must not be discarded.
- Test title waiting both with a title event and without one through the deadline.
- Reload/terminate the service worker during restore and record the limitation: in-memory batches are lost.
- Verify settings in English/Chinese and persistence after extension reload.
- Load an extracted release ZIP and check worker startup, settings, and icons.

Do not claim these checks ran unless actually performed.

## Measure memory and responsiveness

Compare extension disabled, previous release, and current build with the same synthetic pages/profile/settings. Run at least five restores per case. Close and reopen the same saved group, allowing memory to settle between runs.

Sample Chrome's task-manager memory or OS process memory consistently. Record idle baseline, peak over the first 10 seconds, time to first discard, time until all eligible tabs are discarded, and memory at 30 seconds. Label the metric and sampling interval (e.g. 100 ms); short peaks can be missed. A controlled page server with moderate allocation is preferable to changing public sites.

Record tab count, peak minus baseline, median and range of recovery time, and any missed/incorrect discards. Browser memory reclamation may lag discard completion; mocked timers cannot establish a memory reduction.

No real-browser performance measurements have been recorded for the current changes.
