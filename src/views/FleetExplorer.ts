import * as vscode from 'vscode';
import { getCommandUri, selectActiveFleet } from '../commands';
import { getFleets, useBalenaClient } from '../lib/balena';
import { DevicesProvider, ReleasesProvider, VariablesProvider } from './providers';
import * as notifications from './Notifications'

let selectedFleetStatusBar: vscode.StatusBarItem;

export const registerView = async (context: vscode.ExtensionContext) => {
    const balena = useBalenaClient();

    selectedFleetStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    selectedFleetStatusBar.command = getCommandUri(selectActiveFleet);
    selectedFleetStatusBar.text = "Active Fleet: None"
    selectedFleetStatusBar.tooltip = "Select Active Balena Fleet"
    context.subscriptions.push(selectedFleetStatusBar);
    selectedFleetStatusBar.show()

    vscode.window.registerTreeDataProvider('devices', new DevicesProvider(balena));
    vscode.window.registerTreeDataProvider('releases', new ReleasesProvider(balena, 'gh_kalebpace/balena-vscode-test'));
    vscode.window.registerTreeDataProvider('variables', new VariablesProvider(balena, 'gh_kalebpace/balena-vscode-test'));
}

export const showSelectFleet = async () => {
    const balena = useBalenaClient();
    const fleets = await getFleets(balena);

    const fleetNames = fleets.map(f => f.app_name)
    const fleet = (await vscode.window.showQuickPick(fleetNames, {
        placeHolder: 'Select the Fleet you would like to explore...'
    }))

    if (fleet) {
        updateFleetStatusBar(fleet)
    }

    return fleet
}

const updateFleetStatusBar = (fleetName: string) => selectedFleetStatusBar.text = `Active Fleet: ${fleetName}`;