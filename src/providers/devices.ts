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
  TextIcon,
  NoteIcon
} from '../icons'

import { BalenaSDK, Device as FleetDevice, getDeviceByUuid, getDevices } from '../lib/balena'

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
      return Promise.resolve(this.getDeviceMeta(element.id))
    } else {
      return Promise.resolve(this.getAllDevices())
    }
  }

  private async getAllDevices(): Promise<Device[]> {
    const devices = await getDevices(this.balenaSdk, this.fleetId)
    return devices.map((d: FleetDevice) =>
      new Device(`${d.device_name}`, vscode.TreeItemCollapsibleState.Collapsed, d.uuid, d.is_online, d.api_heartbeat_state)
    )
      // sort by online status then by label
      .sort((a, b) => (a.status - b.status) + a.label.localeCompare(b.label))
  }

  private async getDeviceMeta(deviceId: string): Promise<DeviceMeta[]> {
    const device = await getDeviceByUuid(this.balenaSdk, deviceId)
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
  public status = DeviceStatus.Offline

  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly id: string,
    private readonly isOnline: boolean,
    private readonly apiStatus: string,
  ) {
    super(label, collapsibleState)
    this.setDeviceStatus()
  }


  private setDeviceStatus() {
    if (this.isOnline) {
      this.status = DeviceStatus.Online
      this.tooltip = this.apiStatus[0].toUpperCase().concat(this.apiStatus.slice(1));
      this.iconPath = DeviceOnlineIcon
    } else if (!this.isOnline && this.apiStatus == "online") {
      this.status = DeviceStatus.OnlineHeartbeatOnly
      this.tooltip = "Online (Heartbeat Only)";
      this.iconPath = DeviceHeartbeatOnlyIcon
    } else {
      this.status = DeviceStatus.Offline
      this.tooltip = this.apiStatus[0].toUpperCase().concat(this.apiStatus.slice(1));
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
    this.setMetaIcon();
  }

  private setMetaIcon() {
    if (/created_at|last_.*_event|modified_at/.test(this.label)) {
      this.iconPath = DateTimeIcon
    }
    else if (/is_/.test(this.label)) {
      this.iconPath = BoolenIcon
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
    else if (/note/.test(this.label)) {
      this.iconPath = NoteIcon
    }
    else {
      this.iconPath = TextIcon
    }
  }

  contextValue = 'deviceMeta'
}