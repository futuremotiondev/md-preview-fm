# Build and Branding

How to produce the Windows `.exe`, where the fork's name, author, URLs and identifiers live, and what deliberately still carries upstream's name.

Line numbers (≈) refer to `src/main.rs` as of fork v1.0.0; search the quoted anchors if they have drifted.

## Prerequisites

| Requirement                                               | Why                                                                                                   |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Rust stable, 1.89 or newer (`x86_64-pc-windows-msvc`)     | `rust-version = "1.89"` in `Cargo.toml`                                                               |
| Visual Studio Build Tools, "Desktop development with C++" | MSVC linker, plus the Windows SDK `rc.exe` that `winresource` uses to embed the icon and version info |
| WebView2 Runtime                                          | Runtime dependency; preinstalled on Windows 10 and 11, not bundled                                    |

Verified on this machine: rustc 1.98.1 stable MSVC; the release build produces a 6.6 MB `target\release\md-preview-fm.exe` (about 1 MB of it is the embedded fonts).

## Building

```powershell
cargo build --release      # -> target\release\md-preview-fm.exe
cargo run -- README.md     # debug build with DevTools (F12)
cargo test                 # unit tests (43 at v1.0.0)
```

- The release exe is a single portable file. All CSS (including the fork's theme and its embedded Inter and JetBrains Mono fonts), JavaScript, highlight.js, KaTeX (with fonts), Mermaid and the icon are compiled in via `include_str!` / `include_bytes!`. There is no installer.
- The release profile (`Cargo.toml` `[profile.release]`) uses `opt-level = "z"`, LTO, one codegen unit, `strip` and `panic = "abort"`, giving a small binary with a slow final link.
- Expected warnings: `constant WEBSITE_URL is never used` and an unused `UserEvent` variant. Both belong to macOS-only code paths.
- `scripts/verify-windows-self-update.sh` (Git Bash + Node) checks the updater's asset-name wiring.
- `scripts/verify.sh` is upstream's gate (Git Bash, `python3`, optional Node/Playwright and gradle). The fork removed upstream's website (`docs/`): `scripts/verify-distribution.py` no longer reads it, and the website block in `verify.sh` skips itself. `verify.sh` also skips the Android release check when gradle is missing. It passes on Windows, skipping the Playwright and gradle steps. `scripts/release.sh` runs it unless `SKIP_VERIFY=1` is set.

### GitHub Actions

| Workflow                        | Trigger                | What it does                                                                                                                                                                     |
| ------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`      | push or PR to `master` | Windows + Linux build and test, real WebView2 startup check, PE GUI-subsystem check, icon-embedded check; uploads `md-preview-fm.exe` as artifact `md-preview-fm-windows-x64`    |
| `.github/workflows/release.yml` | push of a `v*` tag     | Publishes `MD-Preview-FM-windows-x64.exe` and `MD-Preview-FM-linux-x64.tar.gz`; release notes come from the `## X.Y.Z` section of `CHANGELOG.md`, falling back to a compare link |

Actions on a fork may be disabled until you enable them in the repository settings.

## Identity map

| What                                           | Current value                                                        | Where                                                                                                   |
| ---------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Exe and process name                           | `md-preview-fm.exe`                                                  | `Cargo.toml` `[package] name`                                                                           |
| Version                                        | `1.0.0`                                                              | `Cargo.toml` `version`; feeds FileVersion `1.0.0.0`, ProductVersion, `--help` and the update comparison |
| Company                                        | `Futuremotion Studio`                                                | `build.rs` `CompanyName`                                                                                |
| File description (the name Task Manager shows) | `MD Preview FM`                                                      | `build.rs` `FileDescription`                                                                            |
| Product name                                   | `MD Preview FM`                                                      | `build.rs` `ProductName`                                                                                |
| Copyright                                      | `Copyright Futuremotion Studio ©`                                    | `build.rs` `LegalCopyright`                                                                             |
| Package metadata                               | `authors`, `description`, `repository`, `homepage`, `license-file`   | `Cargo.toml`                                                                                            |
| Window title                                   | `<file> — MD Preview FM`, or `MD Preview FM` with no file            | `fn update_window_title` ≈ 4384–4386; startup title ≈ 4595–4596                                         |
| `--help` banner and dialogs                    | `MD Preview FM …`                                                    | ≈ 125, 302, 4561, 4795, 4889, 5240, 5250                                                                |
| "Open with" display name                       | `MD Preview FM`                                                      | `FriendlyAppName` ≈ 3211                                                                                |
| File-type ProgID                               | `MDPreviewFM.md`                                                     | `let progid` ≈ 3183                                                                                     |
| Config directory                               | `%LOCALAPPDATA%\md-preview-fm` (`~/.config/md-preview-fm` elsewhere) | `fn config_dir` ≈ 231                                                                                   |
| Registration marker                            | `.md-preview-fm-registered`                                          | `fn register_as_default` ≈ 3169 (Windows), ≈ 3144 (macOS)                                               |
| `localStorage` keys                            | `md-preview-fm-content-zoom-v1`, `md-preview-fm:update-check`        | `build_page()` script, `assets/enhance/update-check.js` line 124                                        |
| Icon                                           | `assets/icon.ico` (still upstream's "#" icon)                        | `build.rs` `set_icon`, `ICON_BYTES` line 25                                                             |

Notes:

- Cargo's keys are `authors` (an array; `author` is ignored with a warning) and `license-file`. The `license` key only accepts an SPDX expression such as `MIT`, not a URL.
- The project is MIT-licensed. `LICENSE` carries both notices, vorojar (2025) and Futuremotion Studio (2026); MIT requires keeping upstream's.
- `winresource` writes its `.rc` file as UTF-8 (`#pragma code_page(65001)`), so non-ASCII text such as `©` survives. Check with `(Get-Item target\release\md-preview-fm.exe).VersionInfo`.

### Changing the exe name again

Keep these in sync: `Cargo.toml` `name`; `.github/workflows/ci.yml` (three `target/release/…` paths and the artifact name); `.github/workflows/release.yml` (the `cp target/release/…` packaging lines); `scripts/verify-windows-startup.mjs` (default exe path on line 11, `Get-Process` on line 59). The "Open with" registry key `Applications\<exe name>` follows the file name automatically.

### Icon

`assets/icon.ico` is used twice: as the exe's resource icon (`build.rs` `set_icon`) and as the runtime window and taskbar icon (`ICON_BYTES`, `src/main.rs` line 25). Replace it with a multi-size ICO (16, 32, 48, 64, 128, 256); the CI icon check expects at least 6 PNG-encoded frames. `gen_ico.py` regenerates upstream's "#" icon and needs Pillow. Explorer caches icons, so a rebuilt exe at the same path can show the old icon for a while.

## Self-updater

After first paint, at most once every 24 hours, the page queries `api.github.com/repos/futuremotiondev/md-preview-fm/releases`. If a published (non-draft, non-prerelease) `vX.Y.Z` release is newer than `Cargo.toml`'s `version`, an "Update" button appears in the toolbar. On Windows, clicking it downloads that release's `MD-Preview-FM-windows-x64.exe`, checks its SHA-256 against the digest GitHub reports, replaces the running exe and relaunches (`mod windows_updater` ≈ 3910).

Only the fork's releases are accepted: `fn is_allowed_update_url` (≈ 2214) allows `https://github.com/futuremotiondev/md-preview-fm/releases/…` only, and the test `update_download_urls_are_allowed` asserts that upstream download URLs are rejected.

The Windows asset name must match in every one of these places:

| File                                    | Where                                                                                         |
| --------------------------------------- | --------------------------------------------------------------------------------------------- |
| `.github/workflows/release.yml`         | Package step and the `Create Release` file list                                               |
| `assets/enhance/update-check.js`        | `preferredAssetPattern` (line 61)                                                             |
| `src/main.rs`                           | `fn preferred_update_asset_name` ≈ 2287; `ends_with("/MD-Preview-FM-windows-x64.exe")` ≈ 3951 |
| `scripts/release.sh`                    | `require_release_assets`                                                                      |
| `scripts/verify-windows-self-update.sh` | grep checks and the simulated release                                                         |

Repository URL sites: the page auto-check config (≈ 2164–2170), `fn check_github_updates` (≈ 2363), `fn is_allowed_update_url` (≈ 2214), the `GITHUB_URL` fallback in `fn select_update_release` (≈ 2325), the `WEBSITE_URL` / `GITHUB_URL` / `RELEASES_URL` constants (≈ 3233–3236; their menu items are macOS-only), the fallbacks in `update-check.js` (lines 122–124), and the default `REPO` in `scripts/release.sh`.

To ship an update: bump `version` in `Cargo.toml`, add a `## X.Y.Z` section to `CHANGELOG.md`, and push tag `vX.Y.Z`. Installed copies pick it up within a day. To disable updates instead, delete the `window.__mdPreviewInstallUpdateCheck({ … });` call (≈ 2164–2170); the tests still pass.

## Config directory

`fn config_dir` (≈ 231) resolves to `%LOCALAPPDATA%\md-preview-fm` and can be overridden with the `MD_PREVIEW_CONFIG_DIR` environment variable. It holds:

| Entry                            | Contents                                                                    |
| -------------------------------- | --------------------------------------------------------------------------- |
| `session.json`                   | Open tabs, restored at launch                                               |
| `recent-files.txt`               | Recent list on the empty screen                                             |
| `window.geom`                    | Window size and position                                                    |
| `theme.txt`                      | `system` / `light` / `dark` (set from the macOS menu only)                  |
| `instance.lock`, `instance.json` | Single-instance lock and forwarding endpoint                                |
| `WebView2\`                      | Browser profile, including `localStorage` (content zoom, last update check) |
| `updates\`                       | Temporary self-update scripts                                               |
| `.md-preview-fm-registered`      | Marker so "Open with" registration runs only once                           |

Because the directory, lock and ProgID are all renamed, the fork runs independently of an installed upstream MD Preview. A running fork window (release or debug build) still receives any new fork launch.

## Intentionally not renamed

- **macOS-only code in `src/main.rs`** (`#[cfg(target_os = "macos")]`): app-menu and About strings, `MDPreviewMenuController`, the Finder extension (`mdpreview://` scheme, `com.mdpreview.app` bundle id), `.app` path tests, and the `MD-Preview-macOS-universal.dmg` asset name. The fork does not build for macOS; renaming these only makes sense together with `bundle.sh`, `install.sh`, `release-sign.sh`, `scripts/generate-appcast.sh`, `scripts/verify-sparkle-update.sh` and `macos/`.
- **`mobile/`**: the separate iOS and Android apps.
- **Upstream's notes**: `LESSONS.md`. Upstream's website (`docs/`), `README_zh.md` and `AGENTS.md` were removed, `README.md` was rewritten for the fork, and `CHANGELOG.md` restarted at 1.0.0 with a link to upstream's history.
- **Upstream's line in `LICENSE`**: MIT requires keeping it; the fork's line sits beside it.
- **Internal identifiers users never see**: the environment variables `MD_PREVIEW_CONFIG_DIR`, `MD_PREVIEW_BENCH` and `MD_PREVIEW_TEST_*`, the JavaScript globals `window.__mdPreview*`, and test temp-directory names. Renaming them would only add merge conflicts with upstream.
