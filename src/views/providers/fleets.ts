import * as vscode from 'vscode';
import { BalenaSDK, getFleets } from '../../lib/balena';

export class FleetsProvider implements vscode.TreeDataProvider<Fleet> {
    private _onDidChangeTreeData: vscode.EventEmitter<Fleet | undefined | void> = new vscode.EventEmitter<Fleet | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<Fleet | undefined | void> = this._onDidChangeTreeData.event;

    constructor(private balenaSdk: BalenaSDK) { }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: Fleet): vscode.TreeItem {
        return element;
    }

    getChildren(_element?: Fleet): Thenable<Fleet[]> {
        return Promise.resolve(this.getAllFleets())
    }


    private async getAllFleets(): Promise<Fleet[]> {
        const raw = await getFleets(this.balenaSdk)
        const fleets = raw.map((d: any) => new Fleet(`${d.device_name} (${d.status})`, vscode.TreeItemCollapsibleState.None));
        return fleets
    }
}

export class Fleet extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState)
    }
    contextValue = 'fleet'
}