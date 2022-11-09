import * as vscode from 'vscode';
import { BalenaSDK, getDeviceWithServices, isLoggedIn, LogsSubscription, Release, useBalenaClient } from '@/balena';
import { showLoginOptions } from '@/views/Authentication';
import { showSelectFleet } from '@/views/StatusBar';
import { showWarnMsg, showInfoMsg } from '@/views/Notifications';
import { SelectedDevice$, showSelectDeviceInput, ViewId as DeviceInspectorViewIds } from '@/views/DeviceInspector';
import { ViewId as FleetExplorerViewIds } from '@/views/FleetExplorer';
import { DeviceItem, DeviceStatus, DEVICE_LOG_URI_SCHEME, ReleaseItem } from '@/providers';
import { createBalenaSSHTerminal } from './views/Terminal';
import { KeyValueItem } from './providers/sharedItems';

export enum CommandId {
  LoginToBalenaCloud = 'balena-vscode.loginToBalenaCloud',
  SelectActiveFleet = 'balena-vscode.selectActiveFleet',
  InspectDevice = 'balena-vscode.inspectDevice',
  OpenSSHConnectionInTerminal = 'balena-vscode.openSSHConnectionInTerminal',
  CopyItemToClipboard = 'balena-vscode.copyItemToClipboard',
  CopyItemKeyToClipboard = 'balena-vscode.copyItemKeyToClipboard',
  CopyItemValueToClipboard = 'balena-vscode.copyItemValueToClipboard',
  CopyNameToClipboard = 'balena-vscode.copyNameToClipboard',
  CopyUUIDToClipboard = 'balena-vscode.copyUUIDToClipboard',
  OpenLogsInNewTab = 'balena-vscode.openLogsInNewTab',
}

export const registerCommands = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(vscode.commands.registerCommand(CommandId.LoginToBalenaCloud, loginToBalenaCloud));
  context.subscriptions.push(vscode.commands.registerCommand(CommandId.SelectActiveFleet, selectActiveFleet));
  context.subscriptions.push(vscode.commands.registerCommand(CommandId.InspectDevice, inspectDevice));
  context.subscriptions.push(vscode.commands.registerCommand(CommandId.OpenSSHConnectionInTerminal, openSSHConnectionInTerminal));
  context.subscriptions.push(vscode.commands.registerCommand(CommandId.CopyItemToClipboard, copyItemToClipboard));
  context.subscriptions.push(vscode.commands.registerCommand(CommandId.CopyItemKeyToClipboard, copyItemKeyToClipboard));
  context.subscriptions.push(vscode.commands.registerCommand(CommandId.CopyItemValueToClipboard, copyItemValueToClipboard));
  context.subscriptions.push(vscode.commands.registerCommand(CommandId.CopyNameToClipboard, copyNameToClipboard));
  context.subscriptions.push(vscode.commands.registerCommand(CommandId.CopyUUIDToClipboard, copyUUIDToClipboard));
  context.subscriptions.push(vscode.commands.registerCommand(CommandId.OpenLogsInNewTab, openLogsInNewTab));
};

export const loginToBalenaCloud = async () => {
  const balena = useBalenaClient();
  if (await isLoggedIn(balena)) {
    showInfoMsg('Successfully Logged In!');
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
  if (device) {
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

  if (device) {
    deviceName = device.label;
    deviceUUID = device.uuid;
  } else {
    const selectedDevice = await showSelectDeviceInput();
    deviceName = selectedDevice?.device_name;
    deviceUUID = selectedDevice?.uuid;
  }

  if (device?.status === DeviceStatus.Offline || device?.status === DeviceStatus.OnlineHeartbeatOnly) {
    showWarnMsg("Device is currently offline or has limited connectivity. Cannot create terminal session.");
  } else if (!deviceName || !deviceUUID) {
    showWarnMsg('Device name or uuid is undefined. Cannot create terminal session.');
  } else {
    createBalenaSSHTerminal(deviceName, deviceUUID);
  }
};

export const focusDeviceInspector = () => vscode.commands.executeCommand(`${DeviceInspectorViewIds.Summary}.focus`);
export const focusFleetExplorer = () => vscode.commands.executeCommand(`${FleetExplorerViewIds.Devices}.focus`);

export const copyItemToClipboard = async (item: vscode.TreeItem) => await copyToClipboard(item.label as string);
export const copyItemKeyToClipboard = async (item: KeyValueItem) => await  copyToClipboard(item.key);
export const copyItemValueToClipboard = async (item: KeyValueItem) => await copyToClipboard(item.value);
export const copyNameToClipboard = async (item: DeviceItem | ReleaseItem) => await copyToClipboard(item.name);
export const copyUUIDToClipboard = async (item: DeviceItem | ReleaseItem) => await copyToClipboard(item.uuid);
const copyToClipboard = async (value: string) => {
  showInfoMsg(`Clipboard copied: ${value}`);
  await vscode.env.clipboard.writeText(value.toString());
};

export const openLogsInNewTab = async (device: DeviceItem) => {
  const uri = vscode.Uri.parse(DEVICE_LOG_URI_SCHEME.concat(':', device.name, '#', device.uuid));
  await vscode.window.showTextDocument(uri, { preview: true });
};
