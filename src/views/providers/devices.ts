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

  getChildren (): Thenable<Device[]> {
    return Promise.resolve(this.getAllDevices())
  }

  private async getAllDevices (): Promise<Device[]> {
    const rawDevices = await getDevices(this.balenaSdk, this.fleetId)
    const devices = rawDevices.map((d: FleetDevice) => new Device(`${d.device_name} (${d.status})`, vscode.TreeItemCollapsibleState.None))
    return devices
  }
}

export class Device extends vscode.TreeItem {
  constructor (
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState)
  }

  iconPath = {
    light: path.join(__filename, '..', '..', '..', '..', '..', 'assets', 'light', 'device.svg'),
    dark: path.join(__filename, '..', '..', '..', '..', '..', 'assets', 'dark', 'device.svg')
  }

  contextValue = 'device'
}
