import * as vscode from 'vscode';
import { BalenaSDK, Device as FleetDevice, getDeviceById, getDevices } from '@/lib/balena';
import { Meta } from './meta';
import {
  DeviceOnlineIcon, 
  DeviceHeartbeatOnlyIcon, 
  DeviceOfflineIcon,
} from '@/icons';


export class DevicesProvider implements vscode.TreeDataProvider<Device | Meta> {
  private _onDidChangeTreeData: vscode.EventEmitter<Device | Meta | undefined | void> = new vscode.EventEmitter<Device | Meta | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<Device | Meta | undefined | void> = this._onDidChangeTreeData.event;

  constructor(private balenaSdk: BalenaSDK, private fleetId: string) { }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Device): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Device): Thenable<Device[] | Meta[]> {
    if (element) {
      return Promise.resolve(this.getDeviceMeta(element.id));
    } else {
      return Promise.resolve(this.getAllDevices());
    }
  }

  private async getAllDevices(): Promise<Device[]> {
    const devices = await getDevices(this.balenaSdk, this.fleetId);
    return devices.map((d: FleetDevice) =>
      new Device(`${d.device_name}`, vscode.TreeItemCollapsibleState.Collapsed, d.uuid, d.is_online, d.api_heartbeat_state)
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

enum DeviceStatus {
  Online,
  OnlineHeartbeatOnly,
  Offline
}
export class Device extends vscode.TreeItem {
  public status = DeviceStatus.Offline;

  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly id: string,
    private readonly isOnline: boolean,
    private readonly apiStatus: string,
  ) {
    super(label, collapsibleState);
    this.setDeviceStatus();
  }


  private setDeviceStatus() {
    if (this.isOnline) {
      this.status = DeviceStatus.Online;
      this.tooltip = this.apiStatus[0].toUpperCase().concat(this.apiStatus.slice(1));
      this.iconPath = DeviceOnlineIcon;
    } else if (!this.isOnline && this.apiStatus === "online") {
      this.status = DeviceStatus.OnlineHeartbeatOnly;
      this.tooltip = "Online (Heartbeat Only)";
      this.iconPath = DeviceHeartbeatOnlyIcon;
    } else {
      this.status = DeviceStatus.Offline;
      this.tooltip = this.apiStatus[0].toUpperCase().concat(this.apiStatus.slice(1));
      this.iconPath = DeviceOfflineIcon;
    }
  }

  contextValue = 'device';
}