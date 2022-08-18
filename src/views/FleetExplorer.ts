import * as vscode from 'vscode'
import { useBalenaClient } from '../lib/balena'
import { DevicesProvider, ReleasesProvider, VariablesProvider } from './providers'
import { SelectedFleet$ } from './StatusBar'

export const registerView = async () => {
  const balena = useBalenaClient()
  SelectedFleet$.subscribe(fleetId => {
    if (fleetId) {
      vscode.window.registerTreeDataProvider('devices', new DevicesProvider(balena, fleetId))
      vscode.window.registerTreeDataProvider('releases', new ReleasesProvider(balena, fleetId))
      vscode.window.registerTreeDataProvider('variables', new VariablesProvider(balena, fleetId))
    }
  })
}
