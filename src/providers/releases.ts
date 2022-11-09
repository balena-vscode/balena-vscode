import * as vscode from 'vscode';
import { BalenaSDK, Release as FleetRelease, getFleetReleases, getFleetReleaseWithImageDetails, ReleaseTag, DeviceTag, Image, ReleaseWithImageDetails, getFleetReleaseImage, getFleetReleaseTags, Release, shortenUUID } from '@/balena';
import {
  ReleaseCanceledIcon,
  ReleaseFailedIcon,
  UnknownIcon,
  ReleaseValidIcon,
  ReleaseFinalizedIcon,
  TagIcon,
  TextIcon,
} from '@/icons';


export class ReleasesProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | void> = this._onDidChangeTreeData.event;

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
      switch (element.label) {
        case "images":
          return Promise.resolve(this.getImages());
        case "tags":
          return Promise.resolve(this.getTags());
        default:
          return Promise.resolve(this.initializeReleaseDetails(element.uuid));
      }
    } else {
      return Promise.resolve(this.getAllReleases());
    }
  }

  private async getAllReleases(): Promise<ReleaseItem[]> {
    const releases = await getFleetReleases(this.balenaSdk, this.fleetId);
    return releases.map((r: FleetRelease) =>
      new ReleaseItem(`${r.semver}+rev${r.revision}`, vscode.TreeItemCollapsibleState.Collapsed, r));
  }

  private async initializeReleaseDetails(releaseId: string): Promise<vscode.TreeItem[]> {
    this.selectedReleaseDetails = await getFleetReleaseWithImageDetails(this.balenaSdk, releaseId);
    return [
      new vscode.TreeItem("images", vscode.TreeItemCollapsibleState.Collapsed),
      new vscode.TreeItem("tags", vscode.TreeItemCollapsibleState.Collapsed),
    ];
  }

  private async getImages(): Promise<ImageItem[]> {
    if (this.selectedReleaseDetails) {
      const items = [];
      for (const i of this.selectedReleaseDetails.images) {
        const image = await getFleetReleaseImage(this.balenaSdk, i.id);
        items.push(new ImageItem(image));
      }
      return items;
    } else {
      return [];
    }
  }

  private async getTags(): Promise<TagItem[]> {
    if (this.selectedReleaseDetails) {
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
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    private readonly release: Release
  ) {
    super(label, collapsibleState);
    this.description = shortenUUID(this.release.commit);
    this.setup();
  }

  public get name() { return this.label; };
  public get uuid() { return this.release.commit; }
  public get status() {
    const status = this.release.status;
    if (status === "success" && this.release.is_final) {
      return ReleaseStatus.Finalized;
    } else if (status === "success") {
      return ReleaseStatus.Success;
    } else if (status === "cancelled") {
      return ReleaseStatus.Canceled;
    } else if (status === "failed") {
      return ReleaseStatus.Failed;
    } else {
      return ReleaseStatus.Unknown;
    }
  }

  private setup() {
    switch (this.status) {
      case ReleaseStatus.Finalized:
        this.tooltip = `Finalized at ${this.release.is_finalized_at__date}`;
        this.iconPath = ReleaseFinalizedIcon;
        break;
      case ReleaseStatus.Success:
        this.tooltip = "Successfully Built";
        this.iconPath = ReleaseValidIcon;
        break;
      case ReleaseStatus.Canceled:
        this.tooltip = "Canceled";
        this.iconPath = ReleaseCanceledIcon;
        break;
      case ReleaseStatus.Failed:
        this.tooltip = "Failed";
        this.iconPath = ReleaseFailedIcon;
        break;
      case ReleaseStatus.Unknown:
      default:
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