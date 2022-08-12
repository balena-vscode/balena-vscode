import * as vscode from 'vscode'

export const infoMsg = (msg: string) => vscode.window.showInformationMessage(`Info: ${msg}`);
export const errorMsg = (msg: string) => vscode.window.showErrorMessage(`Error: ${msg}`);