import * as vscode from 'vscode';
import { BehaviorSubject, delayWhen, interval, repeat, take, tap } from 'rxjs';
import { Fleet, getFleetById, getFleetConfigVariables, getFleetEnvVariables, getFleets, useBalenaClient } from '@/balena';
import { DevicesProvider, MetaProvider, ReleasesProvider, VariablesProvider } from '@/providers';
import { Settings$ } from '@/settings';

export enum ViewId {
  FleetExplorer = "fleetExplorer",
  Devices = "fleetDevices",
  Releases = "fleetReleases",
  Variables = "fleetVariables",
  Meta = "fleetMeta",
}

export const SelectedFleet$ = new BehaviorSubject<Fleet | undefined>(undefined);

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

  refreshViewAtInterval();
};

const refreshViewAtInterval = () => {
  Settings$.pipe(
    tap(settings => {
      const balena = useBalenaClient();
      SelectedFleet$.pipe(take(1)).subscribe(async fleet => {
        if (fleet) {
          SelectedFleet$.next(await getFleetById(balena, fleet.id) ?? undefined);
        } else if (settings.defaultFleet) {
          SelectedFleet$.next(await getFleetById(balena, settings.defaultFleet) ?? undefined);
        } else {
          SelectedFleet$.next((await getFleets(balena) ?? [])[0]);
        }
      });
    }),
    delayWhen(settings => interval(settings.fleetRefreshIntervalInSeconds! * 1000)),
    take(1),
    repeat()
  ).subscribe();
}

