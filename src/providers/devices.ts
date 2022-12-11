import * as vscode from 'vscode';
import { BalenaSDK, Device, DeviceWithServiceDetails, Device as FleetDevice, getDevices, shortenUUID, DeviceType, Release, SupervisorRelease, getDevicePublicURL, DeviceTag } from '@/balena';
import {
  DateTimeIcon,
  DeviceHeartbeatOnlyIcon,
  DeviceOfflineIcon,
  DeviceOnlineIcon,
  NetworkAddressIcon,
  PrivateNetworkAddressIcon,
  TagIcon,
  TextIcon,
  VersionsIcon,
} from '@/icons';
import { CopiableItem, KeyValueItem } from './sharedItems';


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
    const devices = await getDevices(this.balenaSdk, this.fleetId) ?? [];

    const sortByStatusThenLabel = (a: DeviceItem, b: DeviceItem) => (a.status - b.status) + a.label.localeCompare(b.label);
    return devices.map((d: FleetDevice) =>
      new DeviceItem(`${d.device_name}`, vscode.TreeItemCollapsibleState.Collapsed, d)
    ).sort((a, b) => sortByStatusThenLabel(a,b));
  }

  private async getDeviceDetails(device: DeviceItem): Promise<vscode.TreeItem[]> {
    const osDetails = new CopiableItem(device.osDetails, "os version", VersionsIcon);
    const supervisorVersionDetails = new CopiableItem(device.supervisorDetails, "supervisor version", VersionsIcon);
    const lastOnlineDetails = new CopiableItem(device.lastOnlineDetails, "last online", DateTimeIcon);

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
    switch(element?.label) {
      case "tags":
        return this.getDeviceTags();
      default:
        return this.getSummaryItems();
    }
  }

  private async getSummaryItems(): Promise<vscode.TreeItem[]> {
    const deviceType = ((this.device.is_of__device_type as unknown[])[0] as DeviceType).name;
    const currentRelease = ((this.device.is_running__release as unknown[])[0] as any).commit;
    
    const publicUrl = this.device.is_web_accessible ? await getDevicePublicURL(this.balenaSdk, this.device.id) : "disabled";
    const publicUrlIcon = this.device.is_web_accessible ? NetworkAddressIcon : PrivateNetworkAddressIcon;

    return [
      new DeviceItem(`${this.device.device_name} [${deviceType}]`, vscode.TreeItemCollapsibleState.None, this.device),
      new vscode.TreeItem("──"),
      new CopiableItem(this.device.last_connectivity_event ?? "unknown", "last seen", DateTimeIcon),
      new CopiableItem(shortenUUID(currentRelease) ?? "unknown", "release version", VersionsIcon),
      new CopiableItem(this.device.supervisor_version ?? "", "supervisor version", VersionsIcon),
      new CopiableItem(`${this.device.os_version} | ${this.device.os_variant}` ?? "uknown", "host os version", VersionsIcon),
      new CopiableItem(this.device.is_accessible_by_support_until__date ?? "disabled", "support enabled until", DateTimeIcon),
      new CopiableItem(publicUrl ?? "", "public device URL", publicUrlIcon),
      new CopiableItem(this.device.public_address ?? "unknown", "public ip address", NetworkAddressIcon),
      new CopiableItem(this.device.vpn_address ?? "unknown", "vpn ip address", PrivateNetworkAddressIcon),
      new CopiableItem(this.device.ip_address ?? "", "local ip address", PrivateNetworkAddressIcon),
      new CopiableItem(this.device.mac_address ?? "", "mac address", TextIcon),
      new vscode.TreeItem("tags", vscode.TreeItemCollapsibleState.Expanded)
    ];
  }
  
  private async getDeviceTags(): Promise<vscode.TreeItem[]> {
      const deviceTags = ((this.device.device_tag as unknown[]) as DeviceTag[]);
      return Promise.resolve(deviceTags.map(d => new KeyValueItem(d.tag_key, d.value, TagIcon)))
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