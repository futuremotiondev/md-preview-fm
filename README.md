<!-- markdownlint-disable MD033 MD041 -->
<div align="center">
  <img src="assets/icon_1024.png" alt="MD Preview FM icon" width="96">
  <h1>MD Preview FM</h1>
  <p><strong>A restyled fork of MD Preview: a fast, local Markdown viewer and quick editor for Windows and Linux.</strong></p>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![Platforms](https://img.shields.io/badge/platforms-Windows%20%7C%20Linux-lightgrey?style=flat-square)](https://github.com/futuremotiondev/md-preview-fm/releases)
[![Based on MD Preview](https://img.shields.io/badge/based%20on-MD%20Preview%201.4.2-555?style=flat-square)](https://github.com/vorojar/md-preview)

</div>

---

MD Preview FM builds on [MD Preview](https://github.com/vorojar/md-preview) by vorojar: a native Rust binary on the system WebView, with no Electron, no bundled browser and fully offline rendering. This fork is about presentation. Typography, spacing, headings, tables and code styling live in one theme stylesheet, while features and behavior stay the same as upstream.

## Features

- **Tabs and session restore:** open several Markdown or text files in one window and pick up where you left off.
- **Live reload:** edit in VS Code, Vim or anything else and the preview refreshes on save.
- **Quick edits:** toggle source mode with `Ctrl+E`; changes autosave.
- **Real Markdown:** GFM tables, task lists, GitHub alerts, `==highlights==`, syntax highlighting, KaTeX math and Mermaid diagrams, all offline.
- **Reading tools:** find in page, content zoom, print, and links to local Markdown files that open as tabs.
- **Coexists with MD Preview:** separate settings, tabs and "Open with" entry, and updates only from this repository.

## Download

Grab the latest build from [Releases](https://github.com/futuremotiondev/md-preview-fm/releases):

| Platform | File                             | Notes                                                              |
| -------- | -------------------------------- | ------------------------------------------------------------------ |
| Windows  | `MD-Preview-FM-windows-x64.exe`  | Single portable exe; needs WebView2 (built into Windows 10 and 11) |
| Linux    | `MD-Preview-FM-linux-x64.tar.gz` | Needs WebKitGTK 4.1                                                |

No accounts, no telemetry. The only network request is an update check against this repository's releases, at most once a day.

## Usage

```bash
md-preview-fm README.md notes.md
```

Or launch it empty and drag a file in. Pick it from "Open with" in Explorer to make it your Markdown viewer.

| Shortcut                   | Action                        |
| -------------------------- | ----------------------------- |
| `Ctrl+O` / `Ctrl+N`        | Open file / new Markdown file |
| `Ctrl+E`                   | Toggle preview and source     |
| `Ctrl+F`                   | Find in preview               |
| `Ctrl +` `Ctrl -` `Ctrl 0` | Zoom content in, out, reset   |
| `Ctrl+P`                   | Print the preview             |
| `Ctrl+W`                   | Close tab                     |

## Customizing the look

All styling lives in [`assets/theme/futuremotion-theme.css`](assets/theme/futuremotion-theme.css). Edit the `--fm-*` tokens for fonts, sizes, spacing, headings, code, tables and colors (light and dark), then rebuild. The [styling guide](dev-docs/styling.md) maps every built-in rule and covers embedding fonts.

## Building from source

Requires Rust 1.89 or newer. On Windows you also need the Visual Studio C++ build tools; on Linux, the WebKitGTK 4.1 development packages.

```bash
git clone https://github.com/futuremotiondev/md-preview-fm.git
cd md-preview-fm
cargo build --release
```

The binary lands in `target/release/md-preview-fm` (`.exe` on Windows). Run `cargo test` for the test suite. [Build and branding](dev-docs/build-and-branding.md) covers releases and the updater.

## Credits and license

MD Preview FM is a derivative of [MD Preview](https://github.com/vorojar/md-preview) by vorojar. Both are released under the [MIT License](LICENSE).
