import * as vscode from 'vscode'
import { DeviceOnline, DeviceHeartbeatOnly, DeviceOffline } from '../icons'

import { BalenaSDK, Device as FleetDevice, getDevices } from '../lib/balena'

export class DevicesProvider implements vscode.TreeDataProvider<Device> {
  private _onDidChangeTreeData: vscode.EventEmitter<Device | undefined | void> = new vscode.EventEmitter<Device | undefined | void>()
  readonly onDidChangeTreeData: vscode.Event<Device | undefined | void> = this._onDidChangeTreeData.event

  constructor (private balenaSdk: BalenaSDK, private fleetId: string) { }

  refresh (): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem (element: Device): vscode.TreeItem {
    return element
  }

  getChildren (element?: Device): Thenable<Device[]> {
    if(!element) {
      return Promise.resolve(this.getAllDevices())
    } else {
      return Promise.resolve([])
    }
  }

  private async getAllDevices (): Promise<Device[]> {
    const devices = await getDevices(this.balenaSdk, this.fleetId)
    return devices.map((d: FleetDevice) => 
      new Device(`${d.device_name}`, d.is_online, d.api_heartbeat_state, vscode.TreeItemCollapsibleState.Collapsed)
      )
  }
}

export class Device extends vscode.TreeItem {
  constructor (
        public readonly label: string,
        public readonly isOnline: boolean,
        public readonly reportedStatus: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState)
    this.setOnlineStatusIcon()
  }

  private setOnlineStatusIcon() {
    if(this.isOnline) {
      this.tooltip = this.reportedStatus[0].toUpperCase().concat(this.reportedStatus.slice(1));
      this.iconPath = DeviceOnline 
    } else if (!this.isOnline && this.reportedStatus == "online") {
      this.tooltip = "Online (Heartbeat Only)";
      this.iconPath = DeviceHeartbeatOnly
    } else {
      this.tooltip = this.reportedStatus[0].toUpperCase().concat(this.reportedStatus.slice(1));
      this.iconPath = DeviceOffline 
    }
  }

  contextValue = 'device'
}