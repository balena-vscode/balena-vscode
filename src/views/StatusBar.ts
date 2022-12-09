import * as vscode from 'vscode';
import { Settings$ } from '@/settings';
import { BehaviorSubject } from 'rxjs';
import { Application as Fleet, getFleetById, getFleets, useBalenaClient } from '@/balena';
import { CommandId } from '@/commands';

export const SelectedFleet$ = new BehaviorSubject<Fleet | undefined>(undefined);

export const registerView = async (context: vscode.ExtensionContext) => {
  fleetStatusItem = createFleetStatusItem();
  context.subscriptions.push(fleetStatusItem);

  let intervalHandle: ReturnType<typeof setInterval>;
  Settings$.subscribe(async settings => {
    if (intervalHandle) {
      clearInterval(intervalHandle);
    }

    await initializeFleet(settings.defaultFleet);
    intervalHandle = setInterval(async() => 
      await initializeFleet(settings.defaultFleet)
    , settings.fleetRefreshInterval);
  });

  SelectedFleet$.subscribe(fleet => updateFleetStatusItemText(fleet?.slug ?? 'None'));
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

const initializeFleet = async (fleetId?: string) => {
  const balena = useBalenaClient();
  if (fleetId) {
    SelectedFleet$.next(await getFleetById(balena, fleetId) ?? undefined);
  } else {
    SelectedFleet$.next((await getFleets(balena) ?? [])[0]);
  }
};

let fleetStatusItem: vscode.StatusBarItem;
const updateFleetStatusItemText = (fleet: string) => fleetStatusItem.text = `$(symbol-method) Active Fleet: ${fleet}`;
const createFleetStatusItem = () => {
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  item.command = CommandId.SelectActiveFleet;
  item.tooltip = 'Select Active Balena Fleet';
  item.show();
  return item;
};
