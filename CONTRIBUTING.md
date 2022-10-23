# Contributing to the Unofficial Balena VSCode Extension

Welcome and thank you for taking time to consider contributing to this project! 

## Project Setup

### Dependencies
 - Nix
 - Docker/Podman/OCI-compliant containers (for testing utilities)
 
### Steps 
```shell
# clone the repository
git clone https://github.com/balena-vscode/balena-vscode && cd ./balena-vscode

# open Nix development shell environment
nix develop

# install node dependencies
npm install

# build, serve, and watch 'balena-vscode' for extension development
npm run build-dev -- --watch

# launch desktop vscode with only this extension installed
code --disable-extensions --extensionDevelopmentPath=./

# launch extension server for use with 'vscode.dev' installation
# 1. Navigate to vscode.dev
# 2. Open Command Palette: "Developer: Install Web Extension..."
# 3. Enter "http://localhost:8000" or wherever the esbuild server is listening
# 4. Done!

# generate .vsix package
npm run build
## or 
nix build
```

### Testing
#### Creating a test fleet and devices
You can create a simple fleet on balena.io for free to use for testing. Simply add devices, download their configurations per Balena's documenation, and launch with QEMU. 
Have a look at the [README in `test-utils/simulate-balena-devices` for more details](./test-util/simulate-balena-devices/README.md).

#### Developing against OpenBalena
WIP: Currently working on containerizing a test server per https://www.balena.io/open/docs/getting-started/


## Conduct
Since this is an early project, there are not many formalities. Feel free to open issues for bugs, feature requests, PRs, or anything else! 

## Contact
If you feel the need to reach out, you can find me below:
 - matrix: @kalebpace:matrix.org
 - mastodon: @kalebpace@social.coop
 - twitter: @kalebpace