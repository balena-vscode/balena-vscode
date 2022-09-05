import * as vscode from 'vscode';
import { BalenaSDK, DeviceWithServiceDetails, getDeviceType } from '@/lib/balena';
import { DeviceItem } from './devices';

// Mockup of Summary Pane intended behavior
//
// <status icon> device-bird [QEMU X86 64]
// UUID: 4833e474c307124a8e5609a84419a1ba > click to copy
// Last Seen: 2022-08-18T03:59Z > click to copy

// Host OS: balenaOS 2.83.18+rev5 > click opens changelog in new editor tab
// Supervisor Version: 12.10.3 > click opens changelog in new editor tab
// Current Release: 6e990a9 > click to copy
// Target Release: 6e990a9 > click to copy

// <status icon> Public Device URL: Disabled > click to copy URL, right click toggle enabled?

// Local IP Addresses > expanded by default
// - 10.0.2.16 > click to copy
// - 10.0.2.15 

// Public IP Addresses > expanded by default
// - 136.49.196.128 > click to copy

// MAC Address > expanded by default
// - 52:54:00:12:34:56

// Tags > expanded by default
// - production
// - entryway

// Notes > click to open new editor tab
// Wrap text or truncate? 

export type SummaryItem = DeviceItem | ClickToCopy | DownloadTextToTab | ToggleActionWithCopy | List;
export class DeviceSummaryProvider implements vscode.TreeDataProvider<SummaryItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<SummaryItem | undefined | void> = new vscode.EventEmitter<SummaryItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<SummaryItem | undefined | void> = this._onDidChangeTreeData.event;

  constructor(
	private balenaSdk: BalenaSDK,
	private device: DeviceWithServiceDetails
	) { }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: SummaryItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: SummaryItem): Thenable<SummaryItem[]> {
    if(!element) {
      return Promise.resolve(this.buildSummaryItems());
    } else {
      return Promise.resolve([]);
    }
  }

  private async buildSummaryItems(): Promise<SummaryItem[]> {
    return [
      ...await this.buildDeviceItems(),
    ];
  }

  private async buildDeviceItems(): Promise<DeviceItem[]> {
    const deviceType = (await getDeviceType(this.balenaSdk, this.device.is_of__device_type)).name;
    return [
      new DeviceItem(`${this.device.device_name} - ${deviceType}`, vscode.TreeItemCollapsibleState.None, this.device.uuid, this.device.is_online, this.device.api_heartbeat_state),
    ];
  }
}

export class ClickToCopy extends vscode.TreeItem {
  constructor(
    public label: string,
    public collapsibleState?: vscode.TreeItemCollapsibleState,
    public command?: vscode.Command
  ) {
    super(label, collapsibleState);
  }
}

export class DownloadTextToTab extends vscode.TreeItem {}
export class ToggleActionWithCopy extends vscode.TreeItem {}
export class List extends vscode.TreeItem {}
