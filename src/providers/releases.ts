import * as vscode from 'vscode';
import {
  BalenaSDK,
  DeviceTag,
  Image,
  Release as FleetRelease,
  Release,
  ReleaseTag,
  getFleetReleaseImage,
  getFleetReleaseTags,
  getFleetReleaseWithImageDetails,
  getFleetReleases,
  shortenUUID,
  ReleaseWithImageDetails,
} from '@/balena';
import {
  ServiceDefinitionIcon,
  DurationIcon,
  PersonIcon,
  ReleaseCanceledIcon,
  ReleaseFailedIcon,
  ReleaseFinalizedIcon,
  ReleaseValidIcon,
  TagIcon,
  UnknownIcon,
} from '@/icons';
import { KeyValueItem } from './sharedItems';
import { stringify } from 'yaml';
import stripAnsi from 'strip-ansi';

export class ReleasesProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | void> = this._onDidChangeTreeData.event;

  constructor(private balenaSdk: BalenaSDK, private fleetId: string | number) { }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ReleaseItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ReleaseItem | BuildDetails | ServiceDefinitions | ReleaseTags): Thenable<vscode.TreeItem[]> {
    if (element) {
      switch (element.contextValue) {
        case "buildDetails":
        case "serviceDefinitions":
        case "releaseTags":
          return Promise.resolve((element as BuildDetails | ServiceDefinitions | ReleaseTags).items);
        default:
          return Promise.resolve(this.getReleaseDetails((element as ReleaseItem)));
      }
    } else {
      return Promise.resolve(this.getAllReleases());
    }
  }

  private async getAllReleases(): Promise<ReleaseItem[]> {
    const releases = await getFleetReleases(this.balenaSdk, this.fleetId) ?? [];
    return releases.map((r: FleetRelease) =>
      new ReleaseItem(`${r.semver}+rev${r.revision}`, vscode.TreeItemCollapsibleState.Collapsed, r));
  }

  private async getReleaseDetails(release: ReleaseItem): Promise<vscode.TreeItem[]> {
    const buildDetails = await getFleetReleaseWithImageDetails(this.balenaSdk, release.uuid) ?? undefined;
    const serviceDefinitions = await Promise.all(buildDetails?.images.map(async i => await getFleetReleaseImage(this.balenaSdk, i.id) as Image) ?? []);
    const tags = await getFleetReleaseTags(this.balenaSdk, release.uuid) ?? [];

    return [
      new BuildDetails("details", vscode.TreeItemCollapsibleState.Collapsed, buildDetails),
      new ServiceDefinitions("services", vscode.TreeItemCollapsibleState.Collapsed, release.name, serviceDefinitions),
      new ReleaseTags("tags", vscode.TreeItemCollapsibleState.Collapsed, tags),
    ];
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
    this.setStatus();
  }

  public get buildLog() { return this.release.build_log ?? 'No build logs found'; }
  public get name() { return this.label; }
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

  public get composefile() {
    const composition = this.release.composition;
    const json2yaml = stringify(composition);
    return json2yaml;
  }

  private setStatus() {
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

export class BuildDetails extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    private readonly details: ReleaseWithImageDetails | undefined
  ) {
    super(label, collapsibleState);
  }

  public get items() {
    if (this.details) {
      const buildDurationInSeconds = (new Date(this.details.end_timestamp as string).getTime()
        - new Date(this.details.start_timestamp as string).getTime())
        / 1000;

      return [
        new KeyValueItem('created by', this.details.user?.username, PersonIcon),
        new KeyValueItem('build duration', buildDurationInSeconds.toString(), DurationIcon),
      ]
    } else {
      return [new vscode.TreeItem("Could not fetch build details")]
    }
  }

  contextValue = "buildDetails";
}

export class ServiceDefinitions extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly parentReleaseName: string,
    private readonly images: Image[]
  ) {
    super(label, collapsibleState);
  }

  public get items() {
    return this.images?.map(i => {
      const serviceName = (i.is_a_build_of__service as any)[0].service_name;
      return new ImageItem(serviceName, i.image_size, this.parentReleaseName, i);
    });
  };

  contextValue = 'serviceDefinitions';
}

export class ReleaseTags extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    private readonly tags: ReleaseTag[] | DeviceTag[]
  ) {
    super(label, collapsibleState);
  }

  public get items() {
    return this.tags?.map(t =>
      new KeyValueItem(t.tag_key, t.value, TagIcon)
    )
  };

  contextValue = 'releaseTags';
}

export class ImageItem extends vscode.TreeItem {
  constructor(
    public readonly name: string,
    public readonly size: number | null | undefined,
    public readonly parentReleaseName: string,
    private readonly image: Image
  ) {
    super(name);
    this.iconPath = ServiceDefinitionIcon;
    this.description = size ? this.getHumanFriendlyImageSize(size) : "";
  }

  public get imageId() { return this.image.id }
  public get buildLog() { return stripAnsi(this.image.build_log) }
  public get containerfile() { return this.image.dockerfile }

  private getHumanFriendlyImageSize(size: number) {
    const bytesToMB = size / 1024 / 1024;

    if (bytesToMB < 1024) {
      return `${bytesToMB.toFixed(2)}MB`
    } else {
      const mbToGB = bytesToMB / 1024;
      return `${mbToGB.toFixed(2)}GB`
    }
  }

  contextValue = 'imageItem';
}