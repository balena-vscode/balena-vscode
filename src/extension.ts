import * as vscode from 'vscode';
import { commands, ExtensionContext } from 'vscode';
import { loginToBalenaCloud } from './commands'
import { DeviceProvider } from './views/providers/devices';

export function activate(context: ExtensionContext) {
	vscode.window.registerTreeDataProvider('devices', new DeviceProvider())
	context.subscriptions.push(commands.registerCommand('balena-vscode.loginToBalenaCloud', loginToBalenaCloud));
}