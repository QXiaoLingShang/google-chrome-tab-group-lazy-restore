# Changelog

## Unreleased

- Inspect restoring groups at a bounded cadence so a continuous stream of new tabs cannot postpone all discard work.
- Recognize group membership reported directly by the tab-created event.
- Process background-only restores and recheck tabs when navigation, pinning, or audible state changes.
- Remember title updates received before settings loading completes; keep discard-failure backoff after the title deadline.
- Add core regression tests, coverage gates, formatting checks, cross-platform CI, and a validated draft-release workflow.
- Include the MIT license in release archives and add contributor, privacy, and security documentation.

## 0.3.3

Existing baseline before these changes. See Git history for earlier development.
