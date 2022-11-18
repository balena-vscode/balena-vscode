import { BehaviorSubject } from 'rxjs';
import * as vscode from 'vscode';
import { SdkOptions } from '@/balena';
import { showInfoMsg } from './views/Notifications';


interface Settings {
  readonly sdkOptions?: SdkOptions,
  readonly defaultFleet?: string,
  readonly fleetRefreshInterval?: number
}

const getWorkspaceConfiguration = (): Settings => vscode.workspace.getConfiguration('balena-vscode') as Settings;
vscode.workspace.onDidChangeConfiguration(changes => {
  if(changes.affectsConfiguration('balena-vscode')) {
    showInfoMsg("Settings Updated");
    Settings$.next(getWorkspaceConfiguration());
  }
});

export const Settings$ = new BehaviorSubject<Settings>(getWorkspaceConfiguration());