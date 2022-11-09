import * as vscode from 'vscode';
import { BalenaSDK, Device, Device as FleetDevice, DeviceWithServiceDetails, getDeviceById, getDevices, getDeviceType, useBalenaClient, shortenUUID } from '@/balena';
import {
  DeviceOnlineIcon,
  DeviceHeartbeatOnlyIcon,
  DeviceOfflineIcon,
} from '@/icons';
import { CopiableItem } from './sharedItems';


export class DevicesProvider implements vscode.TreeDataProvider<DeviceItem | vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<DeviceItem | vscode.TreeItem | undefined | void> = new vscode.EventEmitter<DeviceItem | vscode.TreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<DeviceItem | vscode.TreeItem | undefined | void> = this._onDidChangeTreeData.event;

  constructor(private balenaSdk: BalenaSDK, private fleetId: string) { }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: DeviceItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: DeviceItem): Thenable<DeviceItem[] | vscode.TreeItem[]> {
    if (element) {
      return Promise.resolve(this.getDeviceDetails(element));
    } else {
      return Promise.resolve(this.getAllDevices());
    }
  }

  private async getAllDevices(): Promise<DeviceItem[]> {
    const devices = await getDevices(this.balenaSdk, this.fleetId);

    const sortByStatusThenLabel = (a: DeviceItem, b: DeviceItem) => (a.status - b.status) + a.label.localeCompare(b.label);
    return devices.map((d: FleetDevice) =>
      new DeviceItem(`${d.device_name}`, vscode.TreeItemCollapsibleState.Collapsed, d)
    ).sort((a, b) => sortByStatusThenLabel(a,b));
  }

  private async getDeviceDetails(device: DeviceItem): Promise<vscode.TreeItem[]> {
    const osDetails = new CopiableItem(device.osDetails);
    osDetails.description = "os version";

    const supervisorVersionDetails = new CopiableItem(device.supervisorDetails);
    supervisorVersionDetails.description = "supervisor version";

    const lastOnlineDetails = new CopiableItem(device.lastOnlineDetails);
    lastOnlineDetails.description = "last online";

    return [
      osDetails,
      supervisorVersionDetails,
      lastOnlineDetails
    ];
  }
}

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

export enum DeviceStatus {
  Offline,
  OnlineHeartbeatOnly,
  Online
}
export class DeviceItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    private readonly device: Device
  ) {
    super(label, collapsibleState);
    this.description = shortenUUID(this.uuid);
    this.setup();
  }

  public get name() { return this.device.device_name; }
  public get uuid() { return this.device.uuid; }
  public get status() {
    const status = this.device.is_online;
    const statusMsg = this.device.api_heartbeat_state;
    if (status) {
      return DeviceStatus.Online;
    } else if (!status && statusMsg === "online") {
      return DeviceStatus.OnlineHeartbeatOnly;
    } else {
      return DeviceStatus.Offline;
    }
  }

  public get lastOnlineDetails() { return this.device.last_vpn_event; }
  public get osDetails() { return `${this.device.os_version} | ${this.device.os_variant}`; }
  public get supervisorDetails() { return this.device.supervisor_version; }

  private setup() {
    switch (this.status) {
      case DeviceStatus.Online:
        this.tooltip = "Online";
        this.iconPath = DeviceOnlineIcon;
        break;
      case DeviceStatus.OnlineHeartbeatOnly:
        this.tooltip = `Online (Heartbeat Only) since ${this.device.last_vpn_event}`;
        this.iconPath = DeviceHeartbeatOnlyIcon;
        break;
      case DeviceStatus.Offline:
      default:
        this.tooltip = `Offline since ${this.device.last_connectivity_event}`;
        this.iconPath = DeviceOfflineIcon;
    }
  }

  contextValue = 'device';
}