import * as vscode from 'vscode'
import { getFleetById, getFleetConfigVariables, getFleetEnvVariables, useBalenaClient } from '../lib/balena'
import { DevicesProvider, ReleasesProvider, VariablesProvider, MetaProvider } from '../providers'
import { SelectedFleet$ } from './StatusBar'

export const registerView = () => {
  const balena = useBalenaClient()
  SelectedFleet$.subscribe(fleet => {
    if (fleet) {
      vscode.window.createTreeView('fleet-devices', {
        showCollapseAll: true,
        canSelectMany: true,
        treeDataProvider: new DevicesProvider(balena, fleet.slug)
      })

      // https://stackoverflow.com/questions/31639563/how-to-filter-files-shown-in-visual-studio-code/73039128#73039128
      // TODO: ensure filtering by commit works
      vscode.window.createTreeView('fleet-releases', {
        showCollapseAll: true,
        canSelectMany: true,
        treeDataProvider: new ReleasesProvider(balena, fleet.slug)
      })

      vscode.window.createTreeView('fleet-variables', {
        treeDataProvider: new VariablesProvider(balena, getFleetConfigVariables, getFleetEnvVariables, fleet.slug)
      })

      vscode.window.createTreeView('fleet-meta', {
        treeDataProvider: new MetaProvider(balena, getFleetById, fleet.slug)
      })
    }
  })
}