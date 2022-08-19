import * as vscode from 'vscode'
import {
  ReleaseCanceled,
  ReleaseFailed,
  ReleaseUnknown,
  ReleaseValid,
  ReleaseFinalized
} from '../icons'

import { BalenaSDK, Release as FleetRelease, getFleetReleases } from '../lib/balena'

export class ReleasesProvider implements vscode.TreeDataProvider<Release> {
  private _onDidChangeTreeData: vscode.EventEmitter<Release | undefined | void> = new vscode.EventEmitter<Release | undefined | void>()
  readonly onDidChangeTreeData: vscode.Event<Release | undefined | void> = this._onDidChangeTreeData.event

  constructor (private balenaSdk: BalenaSDK, private fleetId: string | number) { }

  refresh (): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem (element: Release): vscode.TreeItem {
    return element
  }

  getChildren (element?: Release): Thenable<Release[]> {
    if(!element) {
      return Promise.resolve(this.getAllReleases())
    } else {
      return Promise.resolve([])
    }
  }

  private async getAllReleases (): Promise<Release[]> {
    const raw = await getFleetReleases(this.balenaSdk, this.fleetId)
    const releases = raw.map((r: FleetRelease) => new Release(r, `${r.commit.substring(0, 6)} | ${r.semver}+rev${r.revision}`, vscode.TreeItemCollapsibleState.Collapsed))
    return releases
  }
}

export class Release extends vscode.TreeItem {
  constructor (
        public readonly release: FleetRelease,
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState)
    this.setBuildStatus();
  }

  private setBuildStatus() {
    const buildStatus = this.release.status;
    if(buildStatus === "success" && this.release.is_final) {
      this.tooltip = `Finalized at ${this.release.is_finalized_at__date}`
      this.iconPath = ReleaseFinalized 
    } else if (buildStatus === "success") {
      this.tooltip = "Success"
      this.iconPath = ReleaseValid 
    } else if (buildStatus === "cancelled") {
      this.tooltip = "Canceled"
      this.iconPath = ReleaseCanceled 
    } else if (buildStatus === "failed") {
      this.tooltip = "Failed"
      this.iconPath = ReleaseFailed 
    } else {
      this.tooltip = "Unknown"
      this.iconPath = ReleaseUnknown 
    }
  }

  contextValue = 'release'
}