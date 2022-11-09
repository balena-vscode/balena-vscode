import * as vscode from 'vscode';
import { VariableIcon } from '@/icons';
import { BalenaSDK, DeviceVariable, FleetVariable } from '@/balena';
import { KeyValueItem } from './sharedItems';

export class VariablesProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | void> = this._onDidChangeTreeData.event;

  constructor (
    private balenaSdk: BalenaSDK, 
    private configFetchMethod: (balenaSdk: BalenaSDK, id: string | number) => Promise<DeviceVariable[] | FleetVariable[]>,
    private envFetchMethod: (balenaSdk: BalenaSDK, id: string | number) => Promise<DeviceVariable[] | FleetVariable[]>,
    private id: string | number
  ) {}

  refresh (): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem (element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren (element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
    switch(element?.label) {
      case "configuration":
        return Promise.resolve(this.getConfigVariables());
      case "environment":
        return Promise.resolve(this.getEnvVariables());
      default:
        return Promise.resolve(this.initializeView());
    }
  }

  private async initializeView(): Promise<vscode.TreeItem[]> {
    return [
      new vscode.TreeItem('configuration', vscode.TreeItemCollapsibleState.Expanded),
      new vscode.TreeItem('environment', vscode.TreeItemCollapsibleState.Expanded),
    ];
  }

  private async getConfigVariables() : Promise<KeyValueItem[]> {
    const vars =  await this.configFetchMethod(this.balenaSdk, this.id);
    return vars.map(v => new KeyValueItem(v.name, v.value, VariableIcon));
  }

  private async getEnvVariables() : Promise<KeyValueItem[]> {
    const vars = await this.envFetchMethod(this.balenaSdk, this.id);
    return vars.map(v => new KeyValueItem(v.name, v.value, VariableIcon));
  }
}