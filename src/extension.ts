import * as vscode from 'vscode';
import { commands, ExtensionContext } from 'vscode';
import { getCommandUri, loginToBalenaCloud, selectActiveFleet } from './commands'
import * as fleetExplorerView from './views/FleetExplorer';

export function activate(context: ExtensionContext) {
	fleetExplorerView.registerView(context);
	context.subscriptions.push(commands.registerCommand(getCommandUri(loginToBalenaCloud), loginToBalenaCloud));
	context.subscriptions.push(commands.registerCommand(getCommandUri(selectActiveFleet), selectActiveFleet));
}