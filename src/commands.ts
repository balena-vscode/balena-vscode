import * as vscode from 'vscode';
import { getDeviceWithServices, isLoggedIn, Release, useBalenaClient } from '@/lib/balena';
import { showLoginOptions } from '@/views/Authentication';
import { showSelectFleet } from '@/views/StatusBar';
import * as notifications from '@/views/Notifications';
import { SelectedDevice$, showSelectDeviceInput, ViewId as DeviceInspectorViewIds } from '@/views/DeviceInspector';
import { ViewId as FleetExplorerViewIds } from '@/views/FleetExplorer';
import { DeviceItem, ReleaseItem } from '@/providers';

export enum CommandId {
  LoginToBalenaCloud = 'balena-vscode.loginToBalenaCloud',
  SelectActiveFleet = 'balena-vscode.selectActiveFleet',
  InspectDevice = 'balena-vscode.inspectDevice',
  OpenSSHConnectionInTerminal = 'balena-vscode.openSSHConnectionInTerminal',
  CopyDeviceNameToClipboard = 'balena-vscode.copyDeviceNameToClipboard',
  CopyDeviceUUIDToClipboard = 'balena-vscode.copyDeviceUUIDToClipboard',
  CopyReleaseCommitToClipboard = 'balena-vscode.copyReleaseCommitToClipboard',
  CopyReleaseVersionToClipboard = 'balena-vscode.copyReleaseVersionToClipboard',
}

export const registerCommands = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(vscode.commands.registerCommand(CommandId.LoginToBalenaCloud, loginToBalenaCloud));
  context.subscriptions.push(vscode.commands.registerCommand(CommandId.SelectActiveFleet, selectActiveFleet));
  context.subscriptions.push(vscode.commands.registerCommand(CommandId.InspectDevice, inspectDevice));
  context.subscriptions.push(vscode.commands.registerCommand(CommandId.OpenSSHConnectionInTerminal, openSSHConnectionInTerminal));
  context.subscriptions.push(vscode.commands.registerCommand(CommandId.CopyDeviceNameToClipboard, copyDeviceNameToClipboard));
  context.subscriptions.push(vscode.commands.registerCommand(CommandId.CopyDeviceUUIDToClipboard, copyDeviceUUIDToClipboard));
  context.subscriptions.push(vscode.commands.registerCommand(CommandId.CopyReleaseCommitToClipboard, copyReleaseCommitToClipboard));
  context.subscriptions.push(vscode.commands.registerCommand(CommandId.CopyReleaseVersionToClipboard, copyReleaseRevisionToClipboard));
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

export const inspectDevice = async (device?: DeviceItem) => {
  const balena = useBalenaClient();
  if(device) {
    const deviceWithServices = await getDeviceWithServices(balena, device.uuid);
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

export const openSSHConnectionInTerminal = async (device?: DeviceItem) => {
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
    shellPath: 'balena',
    shellArgs: ['ssh', deviceUUID as string],
  }).show();

  vscode.window.onDidCloseTerminal(terminal => {
    if(terminal.exitStatus?.code === 1) {
      notifications.infoMsg(`Terminal exited: ${deviceName} is likely offline`);
    }
  });
};

export const focusDeviceInspector = () => vscode.commands.executeCommand(`${DeviceInspectorViewIds.Summary}.focus`);
export const focusFleetExplorer = () => vscode.commands.executeCommand(`${FleetExplorerViewIds.Devices}.focus`);

export const copyItemLabelToClipboard = async (item: vscode.TreeItem) => copyToClipboard(item.label as string);
export const copyItemDescriptionToClipboard = async (item: vscode.TreeItem) => copyToClipboard(item.description as string);
export const copyDeviceNameToClipboard = async (device: DeviceItem) => copyToClipboard(device.name);
export const copyDeviceUUIDToClipboard = async (device: DeviceItem) => copyToClipboard(device.uuid);
export const copyReleaseCommitToClipboard = async (release: ReleaseItem) => copyToClipboard(release.label);
export const copyReleaseRevisionToClipboard = async (release: ReleaseItem) => copyToClipboard(release.description as string);
const copyToClipboard = async (value: string) => {
  notifications.infoMsg(`Clipboard copied: ${value}`);
  await vscode.env.clipboard.writeText(value);
};
