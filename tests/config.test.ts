import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { mockChrome } from "./chrome-mock.js";
beforeEach(() => vi.resetModules());
afterEach(() => vi.unstubAllGlobals());

it("uses defaults for legacy settings without an advanced section", async () => {
  mockChrome();
  const config = await import("../src/config.js");
  expect(await config.loadRestoreConfig()).toEqual(
    config.DEFAULT_RESTORE_CONFIG
  );
});
it("normalizes old or invalid values and deduplicates protected names", async () => {
  mockChrome({
    minTabs: -2,
    waitForTitleBeforeDiscard: "true",
    excludedGroupTitles: [" Work ", "Work", "", 2, " Home "],
    advanced: {
      inspectionDelayMs: 0,
      maxConcurrentDiscards: 999,
      retryDelayMs: 2.5
    }
  });
  const config = await import("../src/config.js");
  const value = await config.loadRestoreConfig();
  expect(value?.minTabs).toBe(5);
  expect(value?.waitForTitleBeforeDiscard).toBe(false);
  expect(value?.excludedGroupTitles).toEqual(["Work", "Home"]);
  expect(value?.advanced.inspectionDelayMs).toBe(0);
  expect(value?.advanced.maxConcurrentDiscards).toBe(4);
  expect(value?.advanced.retryDelayMs).toBe(250);
});
it("loads valid advanced values into active configuration", async () => {
  mockChrome({
    minTabs: "10",
    excludedGroupTitles: null,
    waitForTitleBeforeDiscard: true,
    advanced: { maxConcurrentDiscards: 1 }
  });
  const config = await import("../src/config.js");
  const advanced = await import("../src/advanced-config.js");
  const value = await config.loadRestoreConfig();
  expect(value?.minTabs).toBe(10);
  expect(value?.excludedGroupTitles).toEqual([]);
  expect(value?.waitForTitleBeforeDiscard).toBe(true);
  expect(advanced.getAdvancedConfig().maxConcurrentDiscards).toBe(1);
});
it.each([null, "invalid"])(
  "falls back for an invalid advanced section: %j",
  async (advanced) => {
    mockChrome({ advanced });
    const config = await import("../src/config.js");
    expect((await config.loadRestoreConfig())?.advanced).toEqual(
      config.DEFAULT_RESTORE_CONFIG.advanced
    );
  }
);
it("fails closed if storage cannot be read", async () => {
  const mock = mockChrome();
  mock.api.storage.local.get.mockRejectedValue(new Error("Unavailable"));
  const config = await import("../src/config.js");
  expect(await config.loadRestoreConfig()).toBeNull();
});
