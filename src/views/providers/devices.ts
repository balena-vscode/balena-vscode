import path from 'path'
import * as vscode from 'vscode'

import { BalenaSDK, Device as FleetDevice, getDevices } from '../../lib/balena'

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
    console.log(devices)
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
    this.tooltip = this.reportedStatus;
      this.iconPath = {
        light: path.join(__filename, '..', '..', '..', '..', '..', 'assets', 'light', 'deviceOnline.svg'),
        dark: path.join(__filename, '..', '..', '..', '..', '..', 'assets', 'dark', 'deviceOnline.svg')
      }
    } else if (!this.isOnline && this.reportedStatus == "online") {
      this.tooltip = "online (heartbeat only)";
      this.iconPath = {
        light: path.join(__filename, '..', '..', '..', '..', '..', 'assets', 'light', 'deviceHeartbeatOnly.svg'),
        dark: path.join(__filename, '..', '..', '..', '..', '..', 'assets', 'dark', 'deviceHeartbeatOnly.svg')
      }
    } else {
      this.tooltip = this.reportedStatus;
      this.iconPath = {
        light: path.join(__filename, '..', '..', '..', '..', '..', 'assets', 'light', 'deviceOffline.svg'),
        dark: path.join(__filename, '..', '..', '..', '..', '..', 'assets', 'dark', 'deviceOffline.svg')
      }
    }
  }


  contextValue = 'device'
}