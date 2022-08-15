import * as vscode from 'vscode';
import * as settings from '../settings';
import * as notifications from './Notifications'
import { BehaviorSubject } from "rxjs";
import { getCommandUri, selectActiveFleet } from '../commands';
import { getFleets, useBalenaClient } from '../lib/balena';

let fleetStatusItem: vscode.StatusBarItem;
const updateFleetStatusItemText = (fleet: string) => fleetStatusItem.text = `Active Fleet: ${fleet}`;

export const registerView = async (context: vscode.ExtensionContext) => {
    fleetStatusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100,);
    fleetStatusItem.command = getCommandUri(selectActiveFleet);
    fleetStatusItem.tooltip = "Select Active Balena Fleet"
    context.subscriptions.push(fleetStatusItem);

    SelectedFleet.next(settings.getDefaultFleet())
    fleetStatusItem.show();
}

export const SelectedFleet = new BehaviorSubject<string | undefined>(undefined)
SelectedFleet.subscribe(fleet => updateFleetStatusItemText(fleet ?? 'None'))

export const showSelectFleet = async () => {
    const balena = useBalenaClient();
    const fleets = await getFleets(balena);
    notifications.debugMsg(fleets)

    const fleetIds = fleets.map(f => f.slug)
    const fleet = (await vscode.window.showQuickPick(fleetIds, {
        placeHolder: 'Select the Fleet to activate...'
    }))

    if (fleet) {
        SelectedFleet.next(fleet)
    }

    return fleet
}