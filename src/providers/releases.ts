import * as vscode from 'vscode'
import { BalenaSDK, Release as FleetRelease, getFleetReleases, getFleetReleaseById } from '../lib/balena'
import { Meta } from './meta'
import {
  ReleaseCanceledIcon,
  ReleaseFailedIcon,
  UnknownIcon,
  ReleaseValidIcon,
  ReleaseFinalizedIcon,
} from '../icons'


export class ReleasesProvider implements vscode.TreeDataProvider<Release | Meta> {
  private _onDidChangeTreeData: vscode.EventEmitter<Release | Meta | undefined | void> = new vscode.EventEmitter<Release | Meta | undefined | void>()
  readonly onDidChangeTreeData: vscode.Event<Release | Meta | undefined | void> = this._onDidChangeTreeData.event

  constructor(private balenaSdk: BalenaSDK, private fleetId: string | number) { }

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem(element: Release): vscode.TreeItem {
    return element
  }

  getChildren(element?: Release): Thenable<Release[] | Meta[]> {
    if (element) {
      return Promise.resolve(this.getReleaseMeta(element.id))
    } else {
      return Promise.resolve(this.getAllReleases())
    }
  }

  private async getAllReleases(): Promise<Release[]> {
    const releases = await getFleetReleases(this.balenaSdk, this.fleetId)
    return releases.map((r: FleetRelease) =>
      new Release(`${r.commit.substring(0, 6)} | ${r.semver}+rev${r.revision}`, vscode.TreeItemCollapsibleState.Collapsed, r.commit, r.status, r.is_final, r.is_finalized_at__date))
  }

  private async getReleaseMeta(releaseId: string): Promise<Meta[]> {
    const release = await getFleetReleaseById(this.balenaSdk, releaseId)
    return Object.entries(release)
      .filter(item => item[1] !== null && typeof item[1] !== "object" && item[1] !== undefined && item[1] !== '')
      .map(item => new Meta(`${item[0]}: ${item[1]}`))
      .sort((a, b) => a.label.localeCompare(b.label))
  }
}

enum ReleaseStatus {
  Finalized,
  Success,
  Canceled,
  Failed,
  Unknown
}
export class Release extends vscode.TreeItem {
  public status = ReleaseStatus.Unknown

  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly id: string,
    private readonly buildStatus: string | null,
    private readonly isFinalized: boolean,
    private readonly isFinalizedAtDate: string | null,
  ) {
    super(label, collapsibleState)
    this.setBuildStatus();
  }

  private setBuildStatus() {
    if (this.buildStatus === "success" && this.isFinalized) {
      this.status = ReleaseStatus.Finalized
      this.tooltip = `Finalized at ${this.isFinalizedAtDate}`
      this.iconPath = ReleaseFinalizedIcon
    } else if (this.buildStatus === "success") {
      this.status = ReleaseStatus.Success
      this.tooltip = "Successfully Built"
      this.iconPath = ReleaseValidIcon
    } else if (this.buildStatus === "cancelled") {
      this.status = ReleaseStatus.Canceled
      this.tooltip = "Canceled"
      this.iconPath = ReleaseCanceledIcon
    } else if (this.buildStatus === "failed") {
      this.status = ReleaseStatus.Failed
      this.tooltip = "Failed"
      this.iconPath = ReleaseFailedIcon
    } else {
      this.status = ReleaseStatus.Unknown
      this.tooltip = "Unknown"
      this.iconPath = UnknownIcon
    }
  }

  contextValue = 'release'
}