import { vi } from "vitest";
import type { Tab, GroupBatch } from "../src/types.js";

function event() {
  const listeners: ((...args: any[]) => void)[] = [];
  return {
    addListener: vi.fn((listener: (...args: any[]) => void) =>
      listeners.push(listener)
    ),
    emit: (...args: any[]) => listeners.forEach((listener) => listener(...args))
  };
}

export function tab(id: number, overrides: Partial<Tab> = {}): Tab {
  return {
    id,
    windowId: 1,
    groupId: 10,
    index: id - 1,
    active: false,
    highlighted: false,
    pinned: false,
    incognito: false,
    discarded: false,
    autoDiscardable: true,
    frozen: false,
    selected: false,
    url: `https://example.com/${id}`,
    ...overrides
  };
}

export function batch(overrides: Partial<GroupBatch> = {}): GroupBatch {
  return {
    windowId: 1,
    groupId: 10,
    tabIds: new Set([1, 2, 3]),
    titleUpdatedTabIds: new Set(),
    protectedTabId: 1,
    inspectTimer: null,
    waitForTitleBeforeDiscard: false,
    deadline: Date.now() + 15000,
    ...overrides
  };
}

export function mockChrome(settings: Record<string, unknown> = {}) {
  const tabs = new Map<number, Tab>();
  const api = {
    tabs: {
      onCreated: event(),
      onUpdated: event(),
      onActivated: event(),
      query: vi.fn(async (query: { windowId: number; groupId: number }) =>
        [...tabs.values()].filter(
          (t) => t.windowId === query.windowId && t.groupId === query.groupId
        )
      ),
      get: vi.fn(async (id: number) => {
        const t = tabs.get(id);
        if (!t) throw new Error("Tab closed");
        return t;
      }),
      discard: vi.fn(async (id: number) => {
        const t = tabs.get(id);
        if (!t) throw new Error("Tab closed");
        t.discarded = true;
        return t;
      })
    },
    tabGroups: {
      get: vi.fn(async () => ({ id: 10, title: "Work", windowId: 1 }))
    },
    storage: {
      local: {
        get: vi.fn(async (defaults: object) => ({ ...defaults, ...settings }))
      }
    }
  };
  vi.stubGlobal("chrome", api);
  return {
    api,
    tabs,
    create(t: Tab) {
      tabs.set(t.id!, t);
      api.tabs.onCreated.emit(t);
    },
    update(id: number, changes: Partial<Tab>) {
      const t = tabs.get(id)!;
      Object.assign(t, changes);
      api.tabs.onUpdated.emit(id, changes, t);
    }
  };
}
