import * as vscode from 'vscode'
import { VariableSet } from '../icons'

import { BalenaSDK, DeviceVariable, FleetVariable } from '../lib/balena'

export class VariablesProvider implements vscode.TreeDataProvider<Variable | VariablesContainer> {
  private _onDidChangeTreeData: vscode.EventEmitter<Variable | VariablesContainer | undefined | void> = new vscode.EventEmitter<Variable | VariablesContainer | undefined | void>()
  readonly onDidChangeTreeData: vscode.Event<Variable | VariablesContainer | undefined | void> = this._onDidChangeTreeData.event

  constructor (
    private balenaSdk: BalenaSDK, 
    private configFetchMethod: (balenaSdk: BalenaSDK, id: string | number) => Promise<DeviceVariable[] | FleetVariable[]>,
    private envFetchMethod: (balenaSdk: BalenaSDK, id: string | number) => Promise<DeviceVariable[] | FleetVariable[]>,
    private id: string | number
  ) {}

  refresh (): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem (element: Variable): vscode.TreeItem {
    return element
  }

  getChildren (element?: VariablesContainer): Thenable<Variable[] | VariablesContainer[]> {
    switch(element?.label) {
      case "configuration":
        return Promise.resolve(this.getConfigVariables())
      case "environment":
        return Promise.resolve(this.getEnvVariables())
      default:
        return Promise.resolve(this.initializeView())
    }
  }

  private async initializeView(): Promise<VariablesContainer[]> {
    return [
      new VariablesContainer('configuration', vscode.TreeItemCollapsibleState.Expanded),
      new VariablesContainer('environment', vscode.TreeItemCollapsibleState.Expanded),
    ]
  }

  private async getConfigVariables() : Promise<Variable[]> {
    const configVars =  await this.configFetchMethod(this.balenaSdk, this.id)
    return configVars.map(v => new Variable(`${v.name}: ${v.value}`))
  }

  private async getEnvVariables() : Promise<Variable[]> {
    const configVars =  await this.envFetchMethod(this.balenaSdk, this.id)
    return configVars.map(v => new Variable(`${v.name}: ${v.value}`))
  }
}

export class VariablesContainer extends vscode.TreeItem {
  constructor (
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(label, collapsibleState)
  }
  contextValue = 'variableContainer'
}

export class Variable extends vscode.TreeItem {
  constructor (
        public readonly label: string
  ) {
    super(label)
  }
  iconPath = VariableSet
  contextValue = 'variable'
}
