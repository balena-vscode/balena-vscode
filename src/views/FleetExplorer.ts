import * as vscode from 'vscode';
import { getFleetById, getFleetConfigVariables, getFleetEnvVariables, useBalenaClient } from '@/balena';
import { DevicesProvider, MetaProvider, ReleasesProvider, VariablesProvider } from '@/providers';
import { SelectedFleet$ } from './StatusBar';

export enum ViewId {
    FleetExplorer = "fleetExplorer",
    Devices = "fleetDevices",
    Releases = "fleetReleases",
    Variables = "fleetVariables",
    Meta = "fleetMeta",
}

export const registerView = (context: vscode.ExtensionContext) => {
  const balena = useBalenaClient();
  SelectedFleet$.subscribe(fleet => {
    if (fleet) {
      context.subscriptions.push(vscode.window.createTreeView(ViewId.Devices, {
        showCollapseAll: true,
        canSelectMany: true,
        treeDataProvider: new DevicesProvider(balena, fleet.slug)
      }));

      context.subscriptions.push(vscode.window.createTreeView(ViewId.Releases, {
        showCollapseAll: true,
        canSelectMany: true,
        treeDataProvider: new ReleasesProvider(balena, fleet.slug)
      }));

      context.subscriptions.push(vscode.window.createTreeView(ViewId.Variables, {
        treeDataProvider: new VariablesProvider(balena, getFleetConfigVariables, getFleetEnvVariables, fleet.slug)
      }));

      context.subscriptions.push(vscode.window.createTreeView(ViewId.Meta, {
        canSelectMany: true,
        treeDataProvider: new MetaProvider(balena, getFleetById, fleet.slug)
      }));
    }
  });
};