import * as vscode from 'vscode';
import { BalenaSDK, getFleetReleases } from '../../lib/balena';

export class ReleasesProvider implements vscode.TreeDataProvider<Release> {
    private _onDidChangeTreeData: vscode.EventEmitter<Release | undefined | void> = new vscode.EventEmitter<Release | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<Release | undefined | void> = this._onDidChangeTreeData.event;

    constructor(private balenaSdk: BalenaSDK, private fleetId: string | number) { }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: Release): vscode.TreeItem {
        return element;
    }

    getChildren(_element?: Release): Thenable<Release[]> {
        return Promise.resolve(this.getAllReleases())
    }


    private async getAllReleases(): Promise<Release[]> {
        const raw = await getFleetReleases(this.balenaSdk, this.fleetId);
        const releases = raw.map((r: any) => new Release(`${r.semver}+rev${r.revision} | ${r.commit.substring(0, 6)} | ${r.status}`, vscode.TreeItemCollapsibleState.None));
        return releases
    }
}

export class Release extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState)
    }
    contextValue = 'release';
}