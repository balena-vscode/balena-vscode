import * as vscode from 'vscode'
import { useBalenaClient } from '../lib/balena'
import { DevicesProvider, ReleasesProvider, VariablesProvider } from '../providers'
import { SelectedFleet$ } from './StatusBar'

export const registerView = async () => {
  const balena = useBalenaClient()

  SelectedFleet$.subscribe(fleetId => {
    if (fleetId) {
      vscode.window.createTreeView('devices', {
        showCollapseAll: true,
        canSelectMany: true,
        treeDataProvider: new DevicesProvider(balena, fleetId)
      })

      vscode.window.createTreeView('releases', {
        showCollapseAll: true,
        canSelectMany: true,
        treeDataProvider: new ReleasesProvider(balena, fleetId)
      })

      vscode.window.createTreeView('variables', {
        treeDataProvider: new VariablesProvider(balena, fleetId)
      })
    }
  })
}