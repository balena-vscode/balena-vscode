import * as vscode from 'vscode';
import { BalenaSDK, DeviceWithServiceDetails, getDeviceType } from '@/lib/balena';
import { DeviceItem } from './devices';

export class DeviceSummaryProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | void> = this._onDidChangeTreeData.event;

  constructor(
	private balenaSdk: BalenaSDK,
	private device: DeviceWithServiceDetails
	) { }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
    if(!element) {
      return Promise.resolve(this.buildSummaryItems());
    } else {
      return Promise.resolve([]);
    }
  }

  private async buildSummaryItems(): Promise<vscode.TreeItem[]> {
    return [
      ...await this.buildDeviceItems(),
    ];
  }

  private async buildDeviceItems(): Promise<DeviceItem[]> {
    const deviceType = (await getDeviceType(this.balenaSdk, this.device.is_of__device_type)).name;
    return [
      new DeviceItem(`${this.device.device_name} - ${deviceType}`, vscode.TreeItemCollapsibleState.None, this.device),
    ];
  }
}