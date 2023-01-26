import * as vscode from 'vscode';
import { registerCommands } from '@/commands';
import { registerView as registerDeviceInspectorView } from '@/views/DeviceInspector';
import { registerView as registerFleetExplorerView } from '@/views/FleetExplorer';
import { registerView as registerStatusBarView } from '@/views/StatusBar';
import { registerView as registerLogsView } from '@/views/VirtualDocuments';
import { registerStore } from './store';

export function activate (context: vscode.ExtensionContext) {
  registerCommands(context);
  registerDeviceInspectorView(context);
  registerFleetExplorerView(context);
  registerLogsView(context);
  registerStatusBarView(context);
  registerStore(context);

  // Return context for use in tests
  return context;
}
