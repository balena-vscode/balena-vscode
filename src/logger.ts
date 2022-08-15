import * as vscode from 'vscode'

export const useLogger = () => vscode.window.createOutputChannel('Balena Fleet Manager');