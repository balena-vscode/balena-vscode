import * as vscode from 'vscode';
import { BalenaSDK, Release as FleetRelease, getFleetReleases, getFleetReleaseWithImageDetails, ReleaseTag, DeviceTag, Image, ReleaseWithImageDetails, getFleetReleaseImage, getFleetReleaseTags } from '@/lib/balena';
import { Meta } from './meta';
import {
  ReleaseCanceledIcon,
  ReleaseFailedIcon,
  UnknownIcon,
  ReleaseValidIcon,
  ReleaseFinalizedIcon,
  TagIcon,
  TextIcon,
} from '@/icons';


export class ReleasesProvider implements vscode.TreeDataProvider<ReleaseItem | vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<ReleaseItem | Meta | undefined | void> = new vscode.EventEmitter<ReleaseItem | Meta | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<ReleaseItem | Meta | undefined | void> = this._onDidChangeTreeData.event;

  private selectedReleaseDetails: ReleaseWithImageDetails | undefined;

  constructor(private balenaSdk: BalenaSDK, private fleetId: string | number) { }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ReleaseItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ReleaseItem): Thenable<ReleaseItem[] | vscode.TreeItem[]> {
    if (element) {
      switch(element.label) {
        case "images":
          return Promise.resolve(this.getImages());
        case "tags":
          return Promise.resolve(this.getTags());
        default:
          return Promise.resolve(this.initializeReleaseDetails(element.id));
      }
    } else {
      return Promise.resolve(this.getAllReleases());
    }
  }

  private async getAllReleases(): Promise<ReleaseItem[]> {
    const releases = await getFleetReleases(this.balenaSdk, this.fleetId);
    return releases.map((r: FleetRelease) =>
      new ReleaseItem(`${r.commit.substring(0, 6)} | ${r.semver}+rev${r.revision}`, vscode.TreeItemCollapsibleState.Collapsed, r.commit, r.status, r.is_final, r.is_finalized_at__date));
  }

  private async initializeReleaseDetails(releaseId: string): Promise<vscode.TreeItem[]> {
    this.selectedReleaseDetails = await getFleetReleaseWithImageDetails(this.balenaSdk, releaseId);
    return [
      new vscode.TreeItem("images", vscode.TreeItemCollapsibleState.Collapsed),
      new vscode.TreeItem("tags", vscode.TreeItemCollapsibleState.Collapsed),
    ];
  }

  private async getImages(): Promise<ImageItem[]> {
    if(this.selectedReleaseDetails) {
      const items = [];
      for(const i of this.selectedReleaseDetails.images) {
        const image = await getFleetReleaseImage(this.balenaSdk, i.id);
        items.push(new ImageItem(image));
      }
      return items;
    } else {
      return [];
    }
  }

  private async getTags(): Promise<TagItem[]> {
    if(this.selectedReleaseDetails) {
      const tags = await getFleetReleaseTags(this.balenaSdk, this.selectedReleaseDetails.id);
      return tags.map(t => new TagItem(t));
    } else {
      return [];
    }
  }
}

export enum ReleaseStatus {
  Finalized,
  Success,
  Canceled,
  Failed,
  Unknown
}
export class ReleaseItem extends vscode.TreeItem {
  public status = ReleaseStatus.Unknown;

  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly id: string,
    private readonly buildStatus: string | null,
    private readonly isFinalized: boolean,
    private readonly isFinalizedAtDate: string | null,
  ) {
    super(label, collapsibleState);
    this.setBuildStatus();
  }

  private setBuildStatus() {
    if (this.buildStatus === "success" && this.isFinalized) {
      this.status = ReleaseStatus.Finalized;
      this.tooltip = `Finalized at ${this.isFinalizedAtDate}`;
      this.iconPath = ReleaseFinalizedIcon;
    } else if (this.buildStatus === "success") {
      this.status = ReleaseStatus.Success;
      this.tooltip = "Successfully Built";
      this.iconPath = ReleaseValidIcon;
    } else if (this.buildStatus === "cancelled") {
      this.status = ReleaseStatus.Canceled;
      this.tooltip = "Canceled";
      this.iconPath = ReleaseCanceledIcon;
    } else if (this.buildStatus === "failed") {
      this.status = ReleaseStatus.Failed;
      this.tooltip = "Failed";
      this.iconPath = ReleaseFailedIcon;
    } else {
      this.status = ReleaseStatus.Unknown;
      this.tooltip = "Unknown";
      this.iconPath = UnknownIcon;
    }
  }

  contextValue = 'release';
}

export class ImageItem extends vscode.TreeItem {
  constructor(
    public readonly image: Image
  ) {
    super(image.content_hash ?? 'No Hash');
    this.iconPath = TextIcon;
  }
}

export class TagItem extends vscode.TreeItem {
  constructor(
    public readonly tag: ReleaseTag | DeviceTag
  ) {
    super(`${tag.tag_key}: ${tag.value}`);
    this.iconPath = TagIcon;
    this.tooltip = "Click to Copy Value";
    this.command = {
      command: 'editor.action.clipboardCopyAction',
      title: '',
      arguments: [tag.value] 
    };
  }
}