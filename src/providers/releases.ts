import * as vscode from 'vscode'
import {
  ReleaseCanceledIcon,
  ReleaseFailedIcon,
  ReleaseUnknownIcon,
  ReleaseValidIcon,
  ReleaseFinalizedIcon,
  DateTimeIcon,
  TextIcon,
  BoolenIcon,
  LogIcon,
  NoteIcon
} from '../icons'

import { BalenaSDK, Release as FleetRelease, getFleetReleases, getFleetReleaseById } from '../lib/balena'

export class ReleasesProvider implements vscode.TreeDataProvider<Release | ReleaseMeta> {
  private _onDidChangeTreeData: vscode.EventEmitter<Release | ReleaseMeta | undefined | void> = new vscode.EventEmitter<Release | ReleaseMeta | undefined | void>()
  readonly onDidChangeTreeData: vscode.Event<Release | ReleaseMeta | undefined | void> = this._onDidChangeTreeData.event

  constructor(private balenaSdk: BalenaSDK, private fleetId: string | number) { }

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem(element: Release): vscode.TreeItem {
    return element
  }

  getChildren(element?: Release): Thenable<Release[] | ReleaseMeta[]> {
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

  private async getReleaseMeta(releaseId: string): Promise<ReleaseMeta[]> {
    const release = await getFleetReleaseById(this.balenaSdk, releaseId)
    return Object.entries(release)
      .filter(item => item[1] !== null && typeof item[1] !== "object" && item[1] !== undefined && item[1] !== '')
      .map(item => new ReleaseMeta(`${item[0]}: ${item[1]}`, vscode.TreeItemCollapsibleState.None))
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
      this.iconPath = ReleaseUnknownIcon
    }
  }

  contextValue = 'release'
}

export class ReleaseMeta extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState)
    this.setMetaIcon()
  }

  private setMetaIcon() {
    if (/created_at|timestamp|_date/.test(this.label)) {
      this.iconPath = DateTimeIcon
    }
    else if (/is_/.test(this.label)) {
      this.iconPath = BoolenIcon
    }
    else if (/_log/.test(this.label)) {
      this.iconPath = LogIcon
    }
    else if (/note/.test(this.label)) {
      this.iconPath = NoteIcon
    }
    else {
      this.iconPath = TextIcon
    }

  }

  contextValue = 'releaseMeta'
}