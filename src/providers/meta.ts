import { BalenaSDK, Device, Fleet } from '@/balena';
import * as vscode from 'vscode';
import { KeyValueItem } from './sharedItems';

export class MetaProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | void> = this._onDidChangeTreeData.event;

    constructor(
        private balenaSdk: BalenaSDK,
        private resourceFetchMethod: (balenaSdk: BalenaSDK, id: string | number) => Promise<void | Device | Fleet>,
        public id: string,
    ) { }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(): Thenable<vscode.TreeItem[]> {
        return Promise.resolve(this.getAllMetas());
    }

    private async getAllMetas(): Promise<KeyValueItem[]> {
        const metas = await this.resourceFetchMethod(this.balenaSdk, this.id) ?? {};
        return Object.entries(metas)
        .filter(item => item[1] !== null && typeof item[1] !== "object" && item[1] !== undefined && item[1] !== '')
        .map(item => new KeyValueItem(item[0], item[1] as string))
        .sort((a, b) => (a.label as string).localeCompare(b.label as string));
    }
}