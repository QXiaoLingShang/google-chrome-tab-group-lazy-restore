/** Service-worker entry point that wires Chrome Tab events to Group logic. */
import {
  detectGroup,
  getBatch,
  getBatchByTab,
  scheduleInspection,
  trackNewTab
} from "./group.js";
import { notifyTitleUpdated } from "./discard.js";
import type { Tab } from "./types.js";

chrome.tabs.onCreated.addListener(trackNewTab);

/** Handle Group, title, and URL updates for tracked restore batches. */
function handleTabUpdated(
  _tabId: number,
  changeInfo: {
    groupId?: number;
    title?: string;
    url?: string;
    status?: string;
    pinned?: boolean;
    audible?: boolean;
  },
  tab: Tab
): void {
  if (changeInfo.groupId !== undefined) {
    detectGroup(tab);
  }

  const batch = getBatch(tab.windowId, tab.groupId ?? -1);

  // Remember early title events even before asynchronous inspection loads settings.
  if (changeInfo.title !== undefined && tab.id !== undefined && batch) {
    notifyTitleUpdated(tab.id, batch);
  }

  if (
    changeInfo.groupId === undefined &&
    changeInfo.url === undefined &&
    changeInfo.status === undefined &&
    changeInfo.pinned === undefined &&
    changeInfo.audible === undefined
  ) {
    return;
  }

  if (batch) {
    scheduleInspection(batch);
  }
}

chrome.tabs.onUpdated.addListener(handleTabUpdated);

/** Protect the active Tab when Chrome reports an activation. */
function handleTabActivated({
  tabId,
  windowId
}: {
  tabId: number;
  windowId: number;
}): void {
  const batch = getBatchByTab(windowId, tabId);
  if (!batch) {
    return;
  }

  if (batch.protectedTabId === null) {
    batch.protectedTabId = tabId;
  }
  scheduleInspection(batch);
}

chrome.tabs.onActivated.addListener(handleTabActivated);
