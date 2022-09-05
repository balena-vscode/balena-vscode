import * as vscode from 'vscode';

export const createBalenaSSHTerminal = (name: string, uuid: string) => {
  vscode.window.createTerminal({
    name: `${name} [Balena Device]`,
    shellPath: 'balena',
    shellArgs: ['ssh', uuid],
  }).show();
};