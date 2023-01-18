# Balena VS Code
| | |
|-------------|--------|
| [OpenVSX](https://open-vsx.org/extension/kalebpace/balena-vscode)     | ![Open VSX Version](https://img.shields.io/open-vsx/v/kalebpace/balena-vscode?color=white) ![Open VSX Downloads](https://img.shields.io/open-vsx/dt/kalebpace/balena-vscode?color=white&logo=OpenVSX) |
| [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=kalebpace.balena-vscode)     |  ![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/kalebpace.balena-vscode?color=white) ![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/kalebpace.balena-vscode?color=white) | 
| [Github Releases](https://github.com/balena-vscode/balena-vscode/releases) | ![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/balena-vscode/balena-vscode?color=white&display_name=tag&sort=semver) |

## Getting Started
1. Install extension
2. [Get API Token from Balena](https://docs.balena.io/learn/manage/account/#api-keys)
2. Open Command Palette, run `Balena: Login to Balena Cloud`, select `API Token`
3. Open Command Palette, run `Balena: Fleet Explorer: Select Active Fleet`

## Features
- [x] Fleet Explorer
    - [x] Open live Logs of any Device
    - [x] Open SSH Terminal of any Device (Native-client only)
    - [x] List Devices, online statuses, and summaries
    - [x] List Releases, build statuses, tags, and open relevant container files (e.g. Dockerfile, docker-compose.yml)
    - [x] List (read-only) Variables, for both Fleet configuration and global environments
    - [x] List miscellaneous (meta) properties for the currently selected Fleet
    - [ ] Edit Variables List
    - [ ] Toggle Local-mode
    - [ ] Power commands (Reboot, Power-off, etc)
- [x] Device Inspector
    - [x] In-depth device summary
    - [x] Show Service statuses
    - [x] Device configuration and environment variables
    - [ ] Edit Service statuses
    - [ ] Edit Variables
- [ ] Open Balena Support


## Previews
### Native/Desktop
![Desktop Preview](assets/native-preview.png)

### Browser
![Browser Preview](assets/browser-preview.png)