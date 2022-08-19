import * as vscode from 'vscode'
import {
  DeviceOnlineIcon, 
  DeviceHeartbeatOnlyIcon, 
  DeviceOfflineIcon,
  LocationIcon,
  DateTimeIcon,
  MemoryIcon,
  StorageIcon,
  BoolenIcon,
  CpuIcon,
  DesiredStateIcon,
  InProgressIcon,
  NetworkAddressIcon,
  PowerIcon,
  TextIcon
} from '../icons'

import { BalenaSDK, Device as FleetDevice, getDevices } from '../lib/balena'

export class DevicesProvider implements vscode.TreeDataProvider<Device | DeviceMeta> {
  private _onDidChangeTreeData: vscode.EventEmitter<Device | DeviceMeta | undefined | void> = new vscode.EventEmitter<Device | DeviceMeta | undefined | void>()
  readonly onDidChangeTreeData: vscode.Event<Device | DeviceMeta | undefined | void> = this._onDidChangeTreeData.event

  constructor(private balenaSdk: BalenaSDK, private fleetId: string) { }

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem(element: Device): vscode.TreeItem {
    return element
  }

  getChildren(element?: Device): Thenable<Device[] | DeviceMeta[]> {
    if (element) {
      return Promise.resolve(this.getDeviceMeta(element.device))
    } else {
      return Promise.resolve(this.getAllDevices())
    }
  }

  private async getAllDevices(): Promise<Device[]> {
    const devices = await getDevices(this.balenaSdk, this.fleetId)
    return devices.map((d: FleetDevice) =>
      new Device(d, `${d.device_name}`, vscode.TreeItemCollapsibleState.Collapsed)
    )
      // sort by online status then by label
      .sort((a, b) => (a.status - b.status) + a.device.device_name.localeCompare(b.device.device_name))
  }

  private getDeviceMeta(device: FleetDevice): DeviceMeta[] {
    return Object.entries(device)
      .filter(item => item[1] !== null && typeof item[1] !== "object" && item[1] !== undefined && item[1] !== '')
      .map(item => new DeviceMeta(`${item[0]}: ${item[1]}`, vscode.TreeItemCollapsibleState.None))
      .sort((a, b) => a.label.localeCompare(b.label))
  }
}

enum DeviceStatus {
  Online,
  OnlineHeartbeatOnly,
  Offline
}
export class Device extends vscode.TreeItem {
  public status: DeviceStatus = DeviceStatus.Offline

  constructor(
    public readonly device: FleetDevice,
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(label, collapsibleState)
    this.setDeviceStatus()
  }


  private setDeviceStatus() {
    if (this.device.is_online) {
      this.status = DeviceStatus.Online
      this.tooltip = this.device.status[0].toUpperCase().concat(this.device.status.slice(1));
      this.iconPath = DeviceOnlineIcon
    } else if (!this.device.is_online && this.device.status == "online") {
      this.status = DeviceStatus.OnlineHeartbeatOnly
      this.tooltip = "Online (Heartbeat Only)";
      this.iconPath = DeviceHeartbeatOnlyIcon
    } else {
      this.status = DeviceStatus.Offline
      this.tooltip = this.device.status[0].toUpperCase().concat(this.device.status.slice(1));
      this.iconPath = DeviceOfflineIcon
    }
  }

  contextValue = 'device'
}

export class DeviceMeta extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(label, collapsibleState)
    this.setMetaIcons();
  }

  private setMetaIcons() {
    if (/created_at|last_.*_event|modified_at/.test(this.label)) {
      this.iconPath = DateTimeIcon
    }
    else if (/location|longitude|latitude/.test(this.label)) {
      this.iconPath = LocationIcon
    }
    else if (/memory_/.test(this.label)) {
      this.iconPath = MemoryIcon
    }
    else if (/storage_/.test(this.label)) {
      this.iconPath = StorageIcon
    }
    else if (/is_/.test(this.label)) {
      this.iconPath = BoolenIcon
    }
    else if (/cpu_/.test(this.label)) {
      this.iconPath = CpuIcon
    }
    else if (/should_be_/.test(this.label)) {
      this.iconPath = DesiredStateIcon
    }
    else if (/_progress/.test(this.label)) {
      this.iconPath = InProgressIcon
    }
    else if (/_address/.test(this.label)) {
      this.iconPath = NetworkAddressIcon
    }
    else if (/volt/.test(this.label)) {
      this.iconPath = PowerIcon
    }
    else {
      this.iconPath = TextIcon
    }
  }

  contextValue = 'deviceMeta'
}