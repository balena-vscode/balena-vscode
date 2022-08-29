import * as vscode from 'vscode'
import { getDeviceWithServices, isLoggedIn, useBalenaClient } from './lib/balena'
import { showLoginOptions } from './views/Authentication'
import { showSelectFleet } from './views/StatusBar'
import * as notifications from './views/Notifications'
import { SelectedDevice$, showInspectDeviceInput, ViewIds as DeviceInspectorViewIds } from './views/DeviceInspector'
import { ViewIds as FleetExplorerViewIds } from './views/FleetExplorer'
import { Device } from './providers'

export enum CommandIds {
  LoginToBalenaCloud = 'balena-vscode.loginToBalenaCloud',
  SelectActiveFleet = 'balena-vscode.selectActiveFleet',
  InspectDevice = 'balena-vscode.inspectDevice'
}

export const registerCommands = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(vscode.commands.registerCommand(CommandIds.LoginToBalenaCloud, loginToBalenaCloud))
  context.subscriptions.push(vscode.commands.registerCommand(CommandIds.SelectActiveFleet, selectActiveFleet))
  context.subscriptions.push(vscode.commands.registerCommand(CommandIds.InspectDevice, inspectDevice))
}

export const loginToBalenaCloud = async () => {
  const balena = useBalenaClient()
  if (await isLoggedIn(balena)) {
    notifications.infoMsg('Successfully Logged In!')
  } else {
    await showLoginOptions()
  }
}
export const selectActiveFleet = async () => {
  await showSelectFleet()
  focusFleetExplorer()
}

export const inspectDevice = async (device?: Device) => {
  if(device) {
    const balena = useBalenaClient()
    const deviceWithServices = await getDeviceWithServices(balena, device.uuid)
    SelectedDevice$.next(deviceWithServices)
    focusDeviceInspector()
  }
  else {
    showInspectDeviceInput()
  }
}

export const focusDeviceInspector = () => vscode.commands.executeCommand(`${DeviceInspectorViewIds.Summary}.focus`)
export const focusFleetExplorer = () => vscode.commands.executeCommand(`${FleetExplorerViewIds.Devices}.focus`)
