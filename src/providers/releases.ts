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

import { BalenaSDK, Release as FleetRelease, getFleetReleases } from '../lib/balena'

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
      return Promise.resolve(this.getReleaseMeta(element.release))
    } else {
      return Promise.resolve(this.getAllReleases())
    }
  }

  private async getAllReleases(): Promise<Release[]> {
    const releases = await getFleetReleases(this.balenaSdk, this.fleetId)
    return releases.map((r: FleetRelease) =>
      new Release(r, `${r.commit.substring(0, 6)} | ${r.semver}+rev${r.revision}`, vscode.TreeItemCollapsibleState.Collapsed))
  }

  private getReleaseMeta(release: FleetRelease): ReleaseMeta[] {
    return Object.entries(release)
      .filter(item => item[1] !== null && typeof item[1] !== "object" && item[1] !== undefined && item[1] !== '')
      .map(item => new ReleaseMeta(`${item[0]}: ${item[1]}`, vscode.TreeItemCollapsibleState.None))
      .sort((a, b) => a.label.localeCompare(b.label))
  }
}

export class Release extends vscode.TreeItem {
  constructor(
    public readonly release: FleetRelease,
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState)
    this.setBuildStatus();
  }

  private setBuildStatus() {
    const buildStatus = this.release.status;
    if (buildStatus === "success" && this.release.is_final) {
      this.tooltip = `Finalized at ${this.release.is_finalized_at__date}`
      this.iconPath = ReleaseFinalizedIcon
    } else if (buildStatus === "success") {
      this.tooltip = "Success"
      this.iconPath = ReleaseValidIcon
    } else if (buildStatus === "cancelled") {
      this.tooltip = "Canceled"
      this.iconPath = ReleaseCanceledIcon
    } else if (buildStatus === "failed") {
      this.tooltip = "Failed"
      this.iconPath = ReleaseFailedIcon
    } else {
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