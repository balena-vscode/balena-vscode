# Contributing to the Unofficial Balena VSCode Extension

Welcome and thank you for taking time to consider contributing to this project! 

## Project Setup

### Recommended Dependencies
 - [act](https://github.com/nektos/act) for testing github actions locally
 
### Steps 
```shell
# clone the repository
git clone https://github.com/balena-vscode/balena-vscode && cd ./balena-vscode

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
npx vsce package --no-dependenies
```

### Testing
#### Creating a test fleet and devices
You can create a simple fleet on balena.io for free to use for testing. Simply add devices, download their configurations per Balena's documenation, and launch with QEMU. 
Have a look at the [README in `test-utils/emulate-balena-devices` for more details](./test-util/emulate-balena-devices/README.md).

## Conduct
Since this is an early project, there are not many formalities. Feel free to open issues for bugs, feature requests, PRs, or anything else! 

## Contact
If you feel the need to reach out, you can find me below:
 - matrix: @kalebpace:matrix.org
 - mastodon: @kalebpace@social.coop
 - twitter: @kalebpace