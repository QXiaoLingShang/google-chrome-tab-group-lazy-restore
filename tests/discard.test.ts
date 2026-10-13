import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { batch, mockChrome, tab } from "./chrome-mock.js";

let mock: ReturnType<typeof mockChrome>;
let queue: typeof import("../src/discard.js");
beforeEach(async () => {
  vi.resetModules();
  vi.useFakeTimers();
  mock = mockChrome();
  queue = await import("../src/discard.js");
});
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("discard safety and backpressure", () => {
  it.each([
    { id: undefined },
    { id: 1 },
    { active: true },
    { discarded: true },
    { pinned: true },
    { audible: true },
    { pendingUrl: "https://example.com" },
    { url: undefined },
    { groupId: 20 },
    { windowId: 2 }
  ])("rejects an unsafe tab: %j", (overrides) => {
    expect(queue.isDiscardable(tab(2, overrides), batch())).toBe(false);
  });
  it("discards only once when the same tab is queued repeatedly", async () => {
    mock.tabs.set(2, tab(2));
    const b = batch();
    queue.enqueueDiscard(b, [tab(2), tab(2), tab(3, { id: undefined })]);
    queue.enqueueDiscard(b, [tab(2)]);
    await vi.advanceTimersByTimeAsync(100);
    expect(mock.api.tabs.discard).toHaveBeenCalledTimes(1);
  });
  it("limits concurrent discard API calls and continues when a worker frees up", async () => {
    const advanced = await import("../src/advanced-config.js");
    advanced.setAdvancedConfig({
      ...advanced.DEFAULT_ADVANCED_CONFIG,
      maxConcurrentDiscards: 2
    });
    let inFlight = 0,
      maximum = 0;
    const resolve: (() => void)[] = [];
    mock.api.tabs.discard.mockImplementation(async (id) => {
      inFlight++;
      maximum = Math.max(maximum, inFlight);
      await new Promise<void>((done) => resolve.push(done));
      inFlight--;
      return tab(id, { discarded: true });
    });
    for (let id = 2; id <= 11; id++) mock.tabs.set(id, tab(id));
    queue.enqueueDiscard(batch(), [...mock.tabs.values()]);
    await vi.advanceTimersByTimeAsync(0);
    expect(mock.api.tabs.discard).toHaveBeenCalledTimes(2);
    for (let round = 0; round < 5; round++) {
      resolve.splice(0).forEach((done) => done());
      await vi.advanceTimersByTimeAsync(10);
    }
    expect(maximum).toBe(2);
    expect(mock.api.tabs.discard).toHaveBeenCalledTimes(10);
  });
  it("rechecks eligibility after enqueue, including a user activation", async () => {
    mock.tabs.set(2, tab(2, { active: true }));
    queue.enqueueDiscard(batch(), [tab(2)]);
    await vi.advanceTimersByTimeAsync(0);
    expect(mock.api.tabs.discard).not.toHaveBeenCalled();
  });
  it("drops tabs that closed before processing", async () => {
    queue.enqueueDiscard(batch(), [tab(2)]);
    await vi.advanceTimersByTimeAsync(1000);
    expect(mock.api.tabs.discard).not.toHaveBeenCalled();
  });
  it("wakes a title waiter immediately, without duplicate discard on repeated titles", async () => {
    mock.tabs.set(2, tab(2));
    const b = batch({ waitForTitleBeforeDiscard: true });
    queue.enqueueDiscard(b, [tab(2)]);
    await vi.advanceTimersByTimeAsync(0);
    expect(mock.api.tabs.discard).not.toHaveBeenCalled();
    queue.notifyTitleUpdated(2, b);
    queue.notifyTitleUpdated(2, b);
    await vi.advanceTimersByTimeAsync(0);
    expect(mock.api.tabs.discard).toHaveBeenCalledTimes(1);
  });
  it("remembers a title received before enqueue and ignores untracked titles", async () => {
    mock.tabs.set(2, tab(2));
    const b = batch({ waitForTitleBeforeDiscard: true });
    queue.notifyTitleUpdated(99, b);
    queue.notifyTitleUpdated(2, b);
    expect(b.titleUpdatedTabIds.has(99)).toBe(false);
    queue.enqueueDiscard(b, [tab(2)]);
    await vi.advanceTimersByTimeAsync(0);
    expect(mock.api.tabs.discard).toHaveBeenCalledTimes(1);
  });
  it("does not use a different batch's title to wake a waiter", async () => {
    mock.tabs.set(2, tab(2));
    const b = batch({ waitForTitleBeforeDiscard: true });
    queue.enqueueDiscard(b, [tab(2)]);
    await vi.advanceTimersByTimeAsync(0);
    queue.notifyTitleUpdated(2, batch());
    await vi.advanceTimersByTimeAsync(0);
    expect(mock.api.tabs.discard).not.toHaveBeenCalled();
  });
  it("forces discard at the title deadline and retains failure backoff afterward", async () => {
    mock.tabs.set(2, tab(2));
    mock.api.tabs.discard.mockRejectedValueOnce(new Error("Busy"));
    queue.enqueueDiscard(
      batch({ waitForTitleBeforeDiscard: true, deadline: Date.now() + 500 }),
      [tab(2)]
    );
    await vi.advanceTimersByTimeAsync(499);
    expect(mock.api.tabs.discard).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(mock.api.tabs.discard).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(249);
    expect(mock.api.tabs.discard).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(mock.api.tabs.discard).toHaveBeenCalledTimes(2);
  });
  it("stops after the configured number of discard retries", async () => {
    mock.tabs.set(2, tab(2));
    mock.api.tabs.discard.mockRejectedValue(new Error("Busy"));
    queue.enqueueDiscard(batch(), [tab(2)]);
    await vi.advanceTimersByTimeAsync(10000);
    expect(mock.api.tabs.discard).toHaveBeenCalledTimes(6);
  });
});
