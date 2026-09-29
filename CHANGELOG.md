# Changelog

MD Preview FM is a restyled fork of [MD Preview](https://github.com/vorojar/md-preview) by vorojar, based on MD Preview 1.4.2. For the original app's release history, see [its changelog](https://github.com/vorojar/md-preview/blob/master/CHANGELOG.md).

## 1.0.0

- First release of MD Preview FM: every feature of MD Preview 1.4.2 under a new name, with a restyled reading experience.
- Renamed the app to MD Preview FM. The Windows executable is now `md-preview-fm.exe`, window titles and dialogs use the new name, and the file properties list Futuremotion Studio as the publisher.
- Runs alongside the original MD Preview. Settings, open tabs, recent files and the "Open with" entry are stored separately (`%LOCALAPPDATA%\md-preview-fm` on Windows, `~/.config/md-preview-fm` on Linux), so the two apps don't share or overwrite each other's state.
- Updates come only from this repository's releases. The in-app updater ignores the original MD Preview's releases, so an update can't replace this build with the original app.
- Restyled documents for a refined technical-docs look: Inter body text, SF Pro Display headings (Inter when SF Pro Display isn't installed) and JetBrains Mono code at a light 340 weight, with tighter heading tracking and more room around headings.
- Inter and JetBrains Mono are built into the app, so they render without being installed.
- Tables always span the full text width, with hairline rows, a tinted header and aligned figures. Code blocks and inline code get hairline borders, code ligatures are off, and code blocks scale with content zoom (Ctrl + / Ctrl −).
- Images in HTML `<img>` tags now display when they point to an image file in the document's folder, following the same rules as Markdown images. Previously only Markdown `![alt](path)` images could show local files.
- This release provides Windows and Linux packages: `MD-Preview-FM-windows-x64.exe` and `MD-Preview-FM-linux-x64.tar.gz`.
