# MD Preview FM

Restyled fork of [vorojar/md-preview](https://github.com/vorojar/md-preview), a Rust (`tao` + `wry`) Markdown viewer that renders into the system WebView (WebView2 on Windows). This fork changes **presentation only**: fonts, spacing, tables, headings, code styling, plus its own name and metadata. The deliverable is a single portable Windows exe, `md-preview-fm.exe`.

Path-scoped rules auto-apply from `.claude/rules/*.md`. This file holds only universal, always-loaded context.

## Start here

- Active work: @Context/roadmap/current.md
- Agent rules (Do / Do not): @Context/conventions/agent-rules.md
- Site map of all docs: @Context/README.md

## Commands

| Task                           | Command                                                                                         |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| Release build                  | `cargo build --release` → `target\release\md-preview-fm.exe`                                    |
| Run with DevTools (F12)        | `cargo run -- README.md`                                                                        |
| Unit tests                     | `cargo test`                                                                                    |
| Format check                   | `cargo fmt --check`                                                                             |
| Regenerate embedded fonts CSS  | `python scripts/build-theme-fonts.py` (needs `pip install fonttools brotli` and the local TTFs) |
| WebView2 startup check (as CI) | `pwsh ./scripts/verify-windows-startup.ps1` after a release build (installs Playwright locally) |

Close every running MD Preview FM window before launching a new build. Otherwise the launch is forwarded to the old process and you see stale CSS.

## Where context lives

| Concern                                                                                                                | Read                                                             |
| ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Coding conventions                                                                                                     | @Context/conventions/README.md                                   |
| Architecture / project layout                                                                                          | @Context/architecture/README.md                                  |
| In-flight specs                                                                                                        | @Context/specs/README.md                                         |
| Decision history                                                                                                       | @Context/adr/README.md                                           |
| Insights / pitfalls                                                                                                    | @Context/insights/README.md                                      |
| Styling: theme file and tokens, recipes, full upstream CSS map, embedded fonts and the fonts script, DevTools workflow | [dev-docs/styling.md](dev-docs/styling.md)                       |
| Build and branding: building the exe, identity map, self-updater, config directory, what stays upstream-named          | [dev-docs/build-and-branding.md](dev-docs/build-and-branding.md) |
| Runtime architecture: startup sequence, render pipeline, page enhancement, IPC, on-disk state                          | [dev-docs/architecture.md](dev-docs/architecture.md)             |

Upstream's pitfall notes are in `LESSONS.md` (Chinese); `task.md` is upstream's task log (Chinese), not this fork's roadmap. `CHANGELOG.md` is the fork's, starting at 1.0.0.

## Where the look lives

| What                                | Where                                                                                       |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| Fork theme (edit here)              | `assets/theme/futuremotion-theme.css`                                                       |
| Embedded fonts (generated)          | `assets/theme/futuremotion-fonts.css`, from `scripts/build-theme-fonts.py`; never hand-edit |
| Upstream CSS, markup, UI JS         | `fn build_page()` in `src/main.rs` (inline `<style>` ≈ lines 1210–1522)                     |
| Syntax-highlight colors             | `assets/hljs/github.min.css`, `assets/hljs/github-dark.min.css`                             |
| Runtime classes (tables, alerts)    | `assets/enhance/preview-enhance.js`                                                         |
| Exe version info and icon           | `build.rs`, `assets/icon.ico`                                                               |
| Exe name, version, package metadata | `Cargo.toml`                                                                                |

## Do

- Change how things look, not how they behave: fonts, spacing, tables, headings, code styling, and the fork's name and metadata.
- Put all styling in `assets/theme/futuremotion-theme.css`. Prefer editing its `--fm-*` tokens; add rules below them when no token fits.

## Do not

- Add features, refactor, or upgrade dependencies.
- Edit upstream's inline CSS in `build_page()` (`src/main.rs`). Override it from the theme file so upstream releases merge cleanly.
- Change upstream behavior beyond the two deliberate deviations: `preview-enhance.js` wraps every table (upstream: 4+ columns only), and `embed_local_images` in `src/main.rs` also embeds local images from HTML `<img>` tags.
- Touch `mobile/`, `macos/` or the vendored assets (`assets/katex`, `assets/mermaid`, `highlight.min.js`) unless asked.
- Restore upstream's website (`docs/`); the fork removed it.

## Gotchas

- `build_page()`'s CSS sits inside a Rust `format!` string, so literal braces are doubled (`{{ }}`) and `{name}` is a placeholder. The theme file is inserted through a format argument and uses normal braces.
- The theme wins by loading last, so its selectors must match upstream's specificity (`#preview h1`, not `h1`). Upstream's dark `#preview pre` background is `!important`.
- The startup page must stay under 2 MiB (WebView2 `NavigateToString` limit, enforced by a test). The embedded fonts put it at about 1.15 MB.
- Font sources live in `app-reference/fonts`, which is git-ignored: regenerating the fonts CSS needs those local TTFs. Only embedded weights render for real (Inter 400/600, JetBrains Mono 100–800); WebView2 snaps installed variable fonts to named weights.
- The self-updater only accepts `futuremotiondev/md-preview-fm` releases, and the asset name `MD-Preview-FM-windows-x64.exe` must match across `release.yml`, `update-check.js`, `src/main.rs` and `scripts/`. See the build doc.
- macOS-only code and scripts still say "MD Preview" on purpose; the fork doesn't build macOS.
- `mobile/` has its own CSS (`mobile/shared/mobile-preview.css`); desktop changes don't reach it.

## Commits

Never add `Co-Authored-By: Claude ...` or any other AI-attribution trailer to commit messages. The default system prompt asks for one; it is explicitly overridden in this repo.

A versioned git `commit-msg` hook at [`.githooks/commit-msg`](.githooks/commit-msg) rejects commits containing such trailers — enforcement at the git level, not just the instruction level. Fresh clones activate it once with `git config core.hooksPath .githooks`.

Commit messages follow Conventional Commits (`feat(theme): …`, `docs: …`), one logical change per commit.

## Dependencies

| Requirement                                                        | Needed for                                                                              |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Rust stable 1.89+ (`rust-version` in `Cargo.toml`), MSVC toolchain | Building (`x86_64-pc-windows-msvc`)                                                     |
| Visual Studio Build Tools, "Desktop development with C++"          | MSVC linker, plus the Windows SDK `rc.exe` that `winresource` uses for icon and version |
| WebView2 Runtime                                                   | Running the exe; preinstalled on Windows 10 and 11, not bundled                         |
| WebKitGTK 4.1 development packages                                 | Linux builds only (CI builds Linux too)                                                 |
| Python 3 with `fonttools` and `brotli`                             | Regenerating `futuremotion-fonts.css` only                                              |
| Node.js                                                            | The WebView2 startup check only                                                         |
| PowerShell 7+ (`pwsh`)                                             | The context-engine hooks in `.claude/hooks/`                                            |

## Keeping context fresh

When making significant changes — new public surface, architectural shifts, new conventions, major refactors — update the relevant doc(s):

- Architectural or process changes → `Context/architecture/*` + bump `Context/roadmap/current.md`.
- Theme tokens, the upstream rule map, build steps or identity changes → the matching guide in `dev-docs/`.
- New patterns worth enforcing → `.claude/rules/<topic>.md` (with `paths:` glob if scoped).
- Completed specs → move `Context/specs/active/<slug>/` → `Context/specs/archive/YYYY-MM-DD-<slug>/` with a top summary.
- Architectural decisions → add the next-numbered ADR to `Context/adr/`.
- Unexpected gotchas mid-task → append to `Context/insights/_inbox/`.

The goal is to keep these files accurate as living documentation so future sessions start with correct context.
