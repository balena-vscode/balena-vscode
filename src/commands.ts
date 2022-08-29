import * as vscode from 'vscode'
import { getDeviceWithServices, isLoggedIn, useBalenaClient } from './lib/balena'
import { showLoginOptions } from './views/Authentication'
import { showSelectFleet } from './views/StatusBar'
import * as notifications from './views/Notifications'
import { EXTENSION_URI_ROOT } from './extension'
import { SelectedDevice$, showInspectDevice } from './views/DeviceInspector'
import { Device } from './providers'

export const registerCommands = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(vscode.commands.registerCommand(getCommandUri(loginToBalenaCloud), loginToBalenaCloud))
  context.subscriptions.push(vscode.commands.registerCommand(getCommandUri(selectActiveFleet), selectActiveFleet))
  context.subscriptions.push(vscode.commands.registerCommand(getCommandUri(inspectDevice), inspectDevice))
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
    vscode.commands.executeCommand("fleet-devices.focus")
}

export const inspectDevice = async (device?: Device) => {
  if(device) {
    const balena = useBalenaClient()
    const deviceWithServices = await getDeviceWithServices(balena, device.uuid)
    SelectedDevice$.next(deviceWithServices)
    vscode.commands.executeCommand("device-summary.focus")
  }
  else {
    showInspectDevice()
  }
}

export const getCommandUri = (fn: () => void) => EXTENSION_URI_ROOT.concat('.', fn.name)
