import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockChrome, tab } from "./chrome-mock.js";

let mock: ReturnType<typeof mockChrome>;
beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  mock = mockChrome();
});
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function start(settings: Record<string, unknown> = {}) {
  mock = mockChrome(settings);
  await import("../src/background.js");
}
function restore(count = 6, active = true) {
  for (let id = 1; id <= count; id++)
    mock.create(tab(id, { active: active && id === 1 }));
}
const tick = (ms = 300) => vi.advanceTimersByTimeAsync(ms);

describe("native group restore events", () => {
  it("discards background tabs reported as grouped on creation", async () => {
    await start();
    restore();
    await tick();
    expect(mock.api.tabs.discard.mock.calls.map(([id]) => id)).toEqual([
      2, 3, 4, 5
    ]);
    await tick(10);
    expect(mock.api.tabs.discard).toHaveBeenCalledTimes(5);
    expect(mock.tabs.get(1)?.discarded).toBe(false);
  });
  it("detects tabs that join a group after creation", async () => {
    await start();
    for (let id = 1; id <= 6; id++) {
      mock.create(tab(id, { groupId: -1, active: id === 1 }));
      mock.update(id, { groupId: 10 });
    }
    await tick(310);
    expect(mock.api.tabs.discard).toHaveBeenCalledTimes(5);
  });
  it("starts discarding while a long stream of tabs is still arriving", async () => {
    await start();
    for (let id = 1; id <= 8; id++) {
      mock.create(tab(id, { active: id === 1 }));
      await tick(100);
    }
    // With trailing debounce no inspection would run before the stream stopped.
    expect(mock.api.tabs.discard).toHaveBeenCalled();
  });
  it("handles a group restored entirely in the background", async () => {
    await start();
    restore(6, false);
    await tick(310);
    expect(mock.api.tabs.discard).toHaveBeenCalledTimes(6);
  });
  it("rechecks a skipped navigating tab after loading completes", async () => {
    await start();
    restore();
    mock.tabs.get(2)!.pendingUrl = "https://example.com/2";
    await tick(310);
    expect(mock.tabs.get(2)?.discarded).toBe(false);
    delete mock.tabs.get(2)!.pendingUrl;
    mock.update(2, { status: "complete" });
    await tick();
    expect(mock.tabs.get(2)?.discarded).toBe(true);
  });
  it.each([{ pinned: true }, { audible: true }])(
    "rechecks eligibility after protection ends: %j",
    async (protection) => {
      await start();
      restore();
      Object.assign(mock.tabs.get(2)!, protection);
      await tick(310);
      expect(mock.tabs.get(2)?.discarded).toBe(false);
      mock.update(
        2,
        Object.fromEntries(Object.keys(protection).map((key) => [key, false]))
      );
      await tick();
      expect(mock.tabs.get(2)?.discarded).toBe(true);
    }
  );
  it.each([{}, { excludedGroupTitles: ["Work"], minTabs: 0 }])(
    "leaves small or protected groups loaded: %j",
    async (settings) => {
      await start(settings);
      restore(5);
      await tick(1000);
      expect(mock.api.tabs.discard).not.toHaveBeenCalled();
    }
  );
  it("does not sweep pre-existing tabs when a restore joins their group", async () => {
    await start();
    mock.tabs.set(99, tab(99));
    restore();
    await tick(310);
    expect(mock.tabs.get(99)?.discarded).toBe(false);
  });
  it("ignores old creation events and untracked updates", async () => {
    await start();
    mock.create(tab(1, { groupId: -1 }));
    await tick(5200);
    mock.update(1, { groupId: 10 });
    mock.tabs.set(99, tab(99));
    mock.update(99, { groupId: 10 });
    mock.api.tabs.onActivated.emit({ tabId: 99, windowId: 1 });
    await tick();
    expect(mock.api.tabs.query).not.toHaveBeenCalled();
  });
  it("remembers title changes that precede asynchronous settings loading", async () => {
    await start({ waitForTitleBeforeDiscard: true });
    restore();
    mock.update(2, { title: "Ready" });
    await tick();
    expect(mock.tabs.get(2)?.discarded).toBe(true);
    expect(mock.tabs.get(3)?.discarded).toBe(false);
  });
  it("protects a newly activated tab while it is queued", async () => {
    await start({ waitForTitleBeforeDiscard: true });
    restore();
    await tick();
    mock.update(2, { active: true });
    mock.api.tabs.onActivated.emit({ tabId: 2, windowId: 1 });
    mock.update(2, { title: "Ready" });
    await tick(0);
    expect(mock.tabs.get(2)?.discarded).toBe(false);
  });
  it("handles closed groups and failed storage or tab queries conservatively", async () => {
    await start();
    restore();
    mock.api.tabs.query.mockRejectedValueOnce(new Error("Closed"));
    await tick();
    expect(mock.api.tabs.discard).not.toHaveBeenCalled();
    mock.update(2, { status: "complete" });
    mock.api.storage.local.get.mockRejectedValueOnce(new Error("Unavailable"));
    await tick();
    expect(mock.api.tabs.discard).not.toHaveBeenCalled();
    mock.update(2, { status: "complete" });
    mock.api.tabGroups.get.mockRejectedValueOnce(new Error("Closed"));
    await tick();
    expect(mock.api.tabs.discard).not.toHaveBeenCalled();
  });
  it("expires batches so later updates cannot sweep unrelated tabs", async () => {
    await start({ minTabs: 100 });
    restore();
    await tick(15000);
    mock.api.tabs.query.mockClear();
    mock.update(2, { status: "complete" });
    await tick();
    expect(mock.api.tabs.query).not.toHaveBeenCalled();
  });
});

it("serializes inspections when Chrome query responses are slow", async () => {
  await start();
  restore();
  let resolveQuery!: (tabs: ReturnType<typeof tab>[]) => void;
  mock.api.tabs.query.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveQuery = resolve;
      })
  );
  await tick();
  for (let i = 0; i < 5; i++) {
    mock.update(2, { status: "loading" });
    await tick();
  }
  expect(mock.api.tabs.query).toHaveBeenCalledTimes(1);
  resolveQuery([...mock.tabs.values()]);
  await tick(0);
  await tick();
  expect(mock.api.tabs.query).toHaveBeenCalledTimes(2);
});
it("does not discard when an inspection response arrives after batch expiry", async () => {
  await start();
  restore();
  let resolveQuery!: (tabs: ReturnType<typeof tab>[]) => void;
  mock.api.tabs.query.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveQuery = resolve;
      })
  );
  await tick();
  await tick(15000);
  resolveQuery([...mock.tabs.values()]);
  await tick(0);
  expect(mock.api.tabs.discard).not.toHaveBeenCalled();
});
