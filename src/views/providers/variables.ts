import * as vscode from 'vscode';
import { BalenaSDK, getFleetVariables } from '../../lib/balena';

export class VariablesProvider implements vscode.TreeDataProvider<Variable> {
    private _onDidChangeTreeData: vscode.EventEmitter<Variable | undefined | void> = new vscode.EventEmitter<Variable | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<Variable | undefined | void> = this._onDidChangeTreeData.event;

    constructor(private balenaSdk: BalenaSDK, private fleetId: string | number) { }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: Variable): vscode.TreeItem {
        return element;
    }

    getChildren(_element?: Variable): Thenable<Variable[]> {
        return Promise.resolve(this.getAllVariables())
    }


    private async getAllVariables(): Promise<Variable[]> {
        const raw = await getFleetVariables(this.balenaSdk, this.fleetId);
        const releases = raw.map((v: any) => new Variable(`Key: ${v.name} | Value: ${v.value}`, vscode.TreeItemCollapsibleState.None));
        return releases
    }
}

export class Variable extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState)
    }
    contextValue = 'release';
}