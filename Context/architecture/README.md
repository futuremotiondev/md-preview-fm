# Architecture

Stable design documents describing how the project is put together — layout, subsystem boundaries, build system, configuration. Read these first for any deep dive.

## Documents

| Document                                                   | Covers                                                                                                     |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [MD Preview FM layout](md-preview-fm-layout.md)            | Top-level layout, each directory's role, and which parts are fork-owned vs upstream-owned                  |
| [Runtime architecture](../../dev-docs/architecture.md)     | Startup sequence, render pipeline, page enhancement, Rust ↔ page IPC, editing, watching and on-disk state  |
| [Styling guide](../../dev-docs/styling.md)                 | How CSS reaches the screen, the theme file and tokens, recipes, the full upstream rule map, embedded fonts |
| [Build and branding](../../dev-docs/build-and-branding.md) | Building the exe, CI workflows, identity map, self-updater, config directory, what stays upstream-named    |

The three `dev-docs/` guides predate the context engine and stay in `dev-docs/`, because `README.md`, `CLAUDE.md` and the theme CSS link to them there.

## When to add a document here

- The project's directory layout and subsystem responsibilities are settled enough to describe (`<project>-layout.md` is usually the first doc).
- A build/packaging pipeline exists that a future session would otherwise have to reverse-engineer.
- A configuration system, plugin system, or cross-cutting mechanism has non-obvious rules.

Architecture docs describe **what is** (current state), not decisions (`Context/adr/`) or plans (`Context/specs/`). Add `last_verified: YYYY-MM-DD` frontmatter so `/validate-context` can flag drift.
