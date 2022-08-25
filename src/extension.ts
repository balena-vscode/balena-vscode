import * as vscode from 'vscode'
import { registerCommands } from './commands'
import { registerView as registerDeviceInspectorView } from './views/DeviceInspector'
import { registerView as registerFleetExplorerView } from './views/FleetExplorer'
import { registerView as registerStatusBarView } from './views/StatusBar'

export const EXTENSION_URI_ROOT = 'balena-vscode'

export function activate (context: vscode.ExtensionContext) {
  registerCommands(context)
  registerStatusBarView(context)
  registerFleetExplorerView()
  registerDeviceInspectorView(context)
  return context
}
