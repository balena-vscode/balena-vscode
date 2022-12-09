import * as vscode from 'vscode';
import { registerCommands } from '@/commands';
import { registerView as registerDeviceInspectorView } from '@/views/DeviceInspector';
import { registerView as registerFleetExplorerView } from '@/views/FleetExplorer';
import { registerView as registerStatusBarView } from '@/views/StatusBar';
import { registerView as registerLogsView } from '@/views/VirtualDocuments';

export function activate (context: vscode.ExtensionContext) {
  registerCommands(context);
  registerStatusBarView(context);
  registerFleetExplorerView(context);
  registerDeviceInspectorView(context);
  registerLogsView(context);

  // Return context for use in tests
  return context;
}
