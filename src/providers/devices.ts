import * as vscode from 'vscode';
import { BalenaSDK, Device, Device as FleetDevice, getDeviceById, getDevices } from '@/lib/balena';
import { Meta } from './meta';
import {
  DeviceOnlineIcon, 
  DeviceHeartbeatOnlyIcon, 
  DeviceOfflineIcon,
} from '@/icons';
import { shortenUUID } from '@/utils';


export class DevicesProvider implements vscode.TreeDataProvider<DeviceItem | Meta> {
  private _onDidChangeTreeData: vscode.EventEmitter<DeviceItem | Meta | undefined | void> = new vscode.EventEmitter<DeviceItem | Meta | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<DeviceItem | Meta | undefined | void> = this._onDidChangeTreeData.event;

  constructor(private balenaSdk: BalenaSDK, private fleetId: string) { }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: DeviceItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: DeviceItem): Thenable<DeviceItem[] | Meta[]> {
    if (element) {
      return Promise.resolve(this.getDeviceMeta(element.uuid));
    } else {
      return Promise.resolve(this.getAllDevices());
    }
  }

  private async getAllDevices(): Promise<DeviceItem[]> {
    const devices = await getDevices(this.balenaSdk, this.fleetId);
    return devices.map((d: FleetDevice) =>
      new DeviceItem(`${d.device_name}`, vscode.TreeItemCollapsibleState.Collapsed, d)
    )
      // sort by online status then by label
      .sort((a, b) => (a.status - b.status) + a.label.localeCompare(b.label));
  }

  private async getDeviceMeta(deviceId: string): Promise<Meta[]> {
    const device = await getDeviceById(this.balenaSdk, deviceId);
    return Object.entries(device)
      .filter(item => item[1] !== null && typeof item[1] !== "object" && item[1] !== undefined && item[1] !== '')
      .map(item => new Meta(`${item[0]}: ${item[1]}`))
      .sort((a, b) => a.label.localeCompare(b.label));
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
    if(status) {
      return DeviceStatus.Online;
    } else if(!status && statusMsg === "online") {
      return DeviceStatus.OnlineHeartbeatOnly;
    } else {
      return DeviceStatus.Offline;
    }
  }

  private setup() {
    switch(this.status) {
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
        this.tooltip =  `Offline since ${this.device.last_connectivity_event}`;
        this.iconPath = DeviceOfflineIcon;
    }
  }

  contextValue = 'device';
}