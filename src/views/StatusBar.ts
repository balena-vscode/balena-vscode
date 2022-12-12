import * as vscode from 'vscode';
import { getFleets, useBalenaClient } from '@/balena';
import { CommandId } from '@/commands';
import { SelectedFleet$ } from './FleetExplorer';

export const registerView = async (context: vscode.ExtensionContext) => {
  context.subscriptions.push(createFleetStatusItem());
};

export const showSelectFleet = async () => {
  const balena = useBalenaClient();
  const fleets = await getFleets(balena) ?? [];

  const fleetIds = fleets.map(f => f.slug);
  const selectedFleetId = (await vscode.window.showQuickPick(fleetIds, {
    placeHolder: 'Select the Fleet to activate...'
  }));

  if (selectedFleetId) {
    const selectedFleet = fleets.find((f, i) => fleets[i].slug === f.slug);
    SelectedFleet$.next(selectedFleet);
  }

  return selectedFleetId;
};

const createFleetStatusItem = () => {
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  item.command = CommandId.SelectActiveFleet;
  item.tooltip = 'Select Active Balena Fleet';
  item.show();

  SelectedFleet$.subscribe(fleet => {
    item.text = `$(symbol-method) Active Fleet: ${fleet?.slug ?? "None"}`
  });

  return item;
};
