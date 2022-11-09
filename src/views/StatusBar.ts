import * as vscode from 'vscode';
import * as settings from '@/settings';
import { BehaviorSubject } from 'rxjs';
import { Application as Fleet, getFleetById, getFleets, useBalenaClient } from '@/balena';
import { CommandId } from '@/commands';
import { showErrMsg } from './Notifications';

export const SelectedFleet$ = new BehaviorSubject<Fleet | undefined>(undefined);

export const registerView = async (context: vscode.ExtensionContext) => {
  fleetStatusItem = createFleetStatusItem();
  context.subscriptions.push(fleetStatusItem);

  SelectedFleet$.next(await getInitialFleet());
  SelectedFleet$.subscribe(fleet => updateFleetStatusItemText(fleet?.slug ?? 'None'));
};

export const showSelectFleet = async () => {
  const balena = useBalenaClient();
  const fleets = await getFleets(balena);

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

const getInitialFleet = async () => {
  const balena = useBalenaClient();
  const userDefault = settings.getDefaultFleet();
  if(userDefault) {
    return await getFleetById(balena, userDefault);
  } else {
    // TODO FIXME: Implement error handling for all SDK requests. This fails to render
    // the status bar in web extension mode due to an exception when not logged in.
    // When attempting to implement errors for all requests, logger issues are encountered
    // in the console, which may be related to accessing the vscode logger before its available?
    const fleets = await getFleets(balena).catch(r => showErrMsg(r)) ?? [];
    return fleets[0];
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
