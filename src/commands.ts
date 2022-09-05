import * as vscode from 'vscode';
import { getDeviceWithServices, isLoggedIn, useBalenaClient } from './lib/balena';
import { showLoginOptions } from './views/Authentication';
import { showSelectFleet } from './views/StatusBar';
import * as notifications from './views/Notifications';
import { SelectedDevice$, showSelectDeviceInput, ViewId as DeviceInspectorViewIds } from './views/DeviceInspector';
import { ViewId as FleetExplorerViewIds } from './views/FleetExplorer';
import { Device } from './providers';

export enum CommandIds {
  LoginToBalenaCloud = 'balena-vscode.loginToBalenaCloud',
  SelectActiveFleet = 'balena-vscode.selectActiveFleet',
  InspectDevice = 'balena-vscode.inspectDevice',
  OpenSSHConnectionInTerminal = 'balena-vscode.openSSHConnectionInTerminal'
}

export const registerCommands = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(vscode.commands.registerCommand(CommandIds.LoginToBalenaCloud, loginToBalenaCloud));
  context.subscriptions.push(vscode.commands.registerCommand(CommandIds.SelectActiveFleet, selectActiveFleet));
  context.subscriptions.push(vscode.commands.registerCommand(CommandIds.InspectDevice, inspectDevice));
  context.subscriptions.push(vscode.commands.registerCommand(CommandIds.OpenSSHConnectionInTerminal, openSSHConnectionInTerminal));
};

export const loginToBalenaCloud = async () => {
  const balena = useBalenaClient();
  if (await isLoggedIn(balena)) {
    notifications.infoMsg('Successfully Logged In!');
  } else {
    await showLoginOptions();
  }
};
export const selectActiveFleet = async () => {
  await showSelectFleet();
  focusFleetExplorer();
};

export const inspectDevice = async (device?: Device) => {
  const balena = useBalenaClient();
  if(device) {
    const deviceWithServices = await getDeviceWithServices(balena, device.id);
    SelectedDevice$.next(deviceWithServices);
    focusDeviceInspector();
  }
  else {
    const selectedDevice = await showSelectDeviceInput();
    if (selectedDevice) {
        const device = await getDeviceWithServices(balena, selectedDevice.uuid);
        SelectedDevice$.next(device);
        focusDeviceInspector();
    }
  }
};

export const openSSHConnectionInTerminal = async (device?: Device) => {
  let deviceName: string | undefined;
  let deviceUUID: string | undefined;

  if(device) {
    deviceName = device.label;
    deviceUUID = device.id;
  } else {
    const selectedDevice = await showSelectDeviceInput();
    deviceName = selectedDevice?.device_name;
    deviceUUID = selectedDevice?.uuid;
  }
  
  vscode.window.createTerminal({
    name: `${deviceName} [Balena Device]`,
    shellPath: '/usr/bin/zsh',
    shellArgs: ['-c', `balena ssh ${deviceUUID}`],
  }).show();

  vscode.window.onDidCloseTerminal(terminal => {
    if(terminal.exitStatus?.code === 1) {
      notifications.infoMsg(`Terminal exited: ${deviceName} is likely offline`);
    }
  });
};

export const focusDeviceInspector = () => vscode.commands.executeCommand(`${DeviceInspectorViewIds.Summary}.focus`);
export const focusFleetExplorer = () => vscode.commands.executeCommand(`${FleetExplorerViewIds.Devices}.focus`);
