# Changelog

MD Preview FM is a restyled fork of [MD Preview](https://github.com/vorojar/md-preview) by vorojar, based on MD Preview 1.4.2. For the original app's release history, see [its changelog](https://github.com/vorojar/md-preview/blob/master/CHANGELOG.md).

## 1.0.0

- First release of MD Preview FM. It has every feature of MD Preview 1.4.2 under a new name, plus the groundwork for this fork's restyling.
- Renamed the app to MD Preview FM. The Windows executable is now `md-preview-fm.exe`, window titles and dialogs use the new name, and the file properties list Futuremotion Studio as the publisher.
- Runs alongside the original MD Preview. Settings, open tabs, recent files and the "Open with" entry are stored separately (`%LOCALAPPDATA%\md-preview-fm` on Windows, `~/.config/md-preview-fm` on Linux), so the two apps don't share or overwrite each other's state.
- Updates come only from this repository's releases. The in-app updater ignores the original MD Preview's releases, so an update can't replace this build with the original app.
- Added the Futuremotion theme stylesheet, which holds the fonts, sizes, spacing and colors for the restyle. It starts at the original values, so the app looks the same as MD Preview 1.4.2, except that code blocks now scale with content zoom (Ctrl + / Ctrl −).
- This release provides Windows and Linux packages: `MD-Preview-FM-windows-x64.exe` and `MD-Preview-FM-linux-x64.tar.gz`.
