import { BehaviorSubject } from 'rxjs';
import * as vscode from 'vscode';
import { SdkOptions } from '@/balena';
import { showInfoMsg } from '@/views/Notifications';


export interface Settings {
  readonly sdkOptions?: SdkOptions,
  readonly defaultFleet?: string,
  readonly fleetRefreshIntervalInSeconds?: number,
  readonly stripAnsiCharactersFromLogs?: boolean
}

export const getWorkspaceConfiguration = (): Settings => vscode.workspace.getConfiguration('balena-vscode') as Settings;

vscode.workspace.onDidChangeConfiguration(changes => {
  if(changes.affectsConfiguration('balena-vscode')) {
    showInfoMsg("Settings Updated");
    Settings$.next(getWorkspaceConfiguration());
  }
});

export const Settings$ = new BehaviorSubject<Settings>(getWorkspaceConfiguration());