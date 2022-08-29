import * as vscode from 'vscode'
import { getFleetById, getFleetConfigVariables, getFleetEnvVariables, useBalenaClient } from '../lib/balena'
import { DevicesProvider, ReleasesProvider, VariablesProvider, MetaProvider } from '../providers'
import { SelectedFleet$ } from './StatusBar'

export enum ViewIds {
    FleetExplorer = "fleetExplorer",
    Devices = "fleetDevices",
    Releases = "fleetReleases",
    Variables = "fleetVariables",
    Meta = "fleetMeta",
}

export const registerView = () => {
  const balena = useBalenaClient()
  SelectedFleet$.subscribe(fleet => {
    if (fleet) {
      vscode.window.createTreeView(ViewIds.Devices, {
        showCollapseAll: true,
        canSelectMany: true,
        treeDataProvider: new DevicesProvider(balena, fleet.slug)
      })

      vscode.window.createTreeView(ViewIds.Releases, {
        showCollapseAll: true,
        canSelectMany: true,
        treeDataProvider: new ReleasesProvider(balena, fleet.slug)
      })

      vscode.window.createTreeView(ViewIds.Variables, {
        treeDataProvider: new VariablesProvider(balena, getFleetConfigVariables, getFleetEnvVariables, fleet.slug)
      })

      vscode.window.createTreeView(ViewIds.Meta, {
        canSelectMany: true,
        treeDataProvider: new MetaProvider(balena, getFleetById, fleet.slug)
      })
    }
  })
}