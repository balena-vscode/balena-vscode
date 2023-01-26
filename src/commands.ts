import * as vscode from 'vscode';
import { getDeviceWithServiceDetails, isLoggedIn, useBalenaClient } from '@/balena';
import { showLoginOptions } from '@/views/Authentication';
import { showSelectFleet } from '@/views/StatusBar';
import { showInfoMsg, showWarnMsg } from '@/views/Notifications';
import { ViewId as DeviceInspectorViewIds, SelectedDevice$, showSelectDeviceInput } from '@/views/DeviceInspector';
import { ViewId as FleetExplorerViewIds, SelectedFleet$ } from '@/views/FleetExplorer';
import { DEVICE_LOG_URI_SCHEME, DeviceItem, DeviceStatus, ReleaseItem, ImageItem, BUILD_LOG_URI_SCHEME } from '@/providers';
import { createBalenaSSHTerminal } from './views/Terminal';
import { KeyValueItem } from './providers/sharedItems';
import { COMPOSEFILE_URI_SCHEME, CONTAINERFILE_URI_SCHEME } from './providers/containerfiles';

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
  OpenBuildLogsInNewTab = 'balena-vscode.openBuildLogsInNewTab',
  OpenContainerfileInNewTab = 'balena-vscode.openContainerfileInNewTab',
  OpenComposefileInNewTab = 'balena-vscode.openComposefileInNewTab',
  RefreshFleet = 'balena-vscode.refreshFleet'
}

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
    const deviceWithServices = await getDeviceWithServiceDetails(balena, device.uuid) ?? undefined;
    SelectedDevice$.next(deviceWithServices);
    focusDeviceInspector();
  }
  else {
    await showSelectDeviceInput();
    SelectedDevice$.subscribe(async device => {
      if (device) {
        focusDeviceInspector();
      }
    })
  }
};

export const openSSHConnectionInTerminal = async (device?: DeviceItem) => {
  let deviceName: string | undefined;
  let deviceUUID: string | undefined;

  if (device) {
    deviceName = device.label;
    deviceUUID = device.uuid;
  } else {
    await showSelectDeviceInput();
    SelectedDevice$.subscribe(device => {
      deviceName = device?.device_name
      deviceUUID = device?.uuid
    }).unsubscribe();
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
export const copyItemKeyToClipboard = async (item: KeyValueItem) => await copyToClipboard(item.key);
export const copyItemValueToClipboard = async (item: KeyValueItem) => await copyToClipboard(item.value);
export const copyNameToClipboard = async (item: DeviceItem | ReleaseItem) => await copyToClipboard(item.name);
export const copyUUIDToClipboard = async (item: DeviceItem | ReleaseItem) => await copyToClipboard(item.uuid);
const copyToClipboard = async (value?: string) => {
  showInfoMsg(`Clipboard copied: ${value}`);
  await vscode.env.clipboard.writeText(value?.toString() ?? "");
};

export const openLogsInNewTab = async (device: DeviceItem) => {
  const uri = vscode.Uri.parse("".concat(
    `${DEVICE_LOG_URI_SCHEME}:`,
    `${device.name}.log`,
    `#${device.uuid}`
  ));
  await vscode.window.showTextDocument(uri, { preview: true });
};

export const openBuildLogsInNewTab = async (item: ReleaseItem | ImageItem) => {
  let uri: vscode.Uri;
  if (item instanceof ImageItem) {
    uri = vscode.Uri.parse("".concat(
      `${BUILD_LOG_URI_SCHEME}:`,
      `[${item.parentReleaseName}] ${item.name}.log`,
      `?${encodeURIComponent(item.buildLog)}`
    ));
  } else {
    uri = vscode.Uri.parse("".concat(
      `${BUILD_LOG_URI_SCHEME}:`,
      `${item.name}.log`,
      `?${encodeURIComponent(item.buildLog)}`
    ));
  }
  await vscode.window.showTextDocument(uri, { preview: true });
};

export const openContainerfileInNewTab = async (image: ImageItem) => {
  const uri = vscode.Uri.parse("".concat(
    `${CONTAINERFILE_URI_SCHEME}:`,
    `[${image.parentReleaseName}] ${image.name}.containerfile`,
    `?${encodeURIComponent(image.containerfile)}`
  ));
  await vscode.window.showTextDocument(uri, { preview: true });
};

export const openComposefileInNewTab = async (release: ReleaseItem) => {
  const uri = vscode.Uri.parse("".concat(
    `${COMPOSEFILE_URI_SCHEME}:`,
    `${release.name}.yml`,
    `?${encodeURIComponent(release.composefile)}`
  ));
  await vscode.window.showTextDocument(uri, { preview: true });
};

export const refreshFleet = () => {
  let fleet;
  SelectedFleet$.subscribe(f => fleet = f).unsubscribe();
  SelectedFleet$.next(fleet);
};

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
  context.subscriptions.push(vscode.commands.registerCommand(CommandId.OpenBuildLogsInNewTab, openBuildLogsInNewTab));
  context.subscriptions.push(vscode.commands.registerCommand(CommandId.OpenContainerfileInNewTab, openContainerfileInNewTab));
  context.subscriptions.push(vscode.commands.registerCommand(CommandId.OpenComposefileInNewTab, openComposefileInNewTab));
  context.subscriptions.push(vscode.commands.registerCommand(CommandId.RefreshFleet, refreshFleet));
};