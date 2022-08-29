import { BalenaSDK, CurrentServiceWithCommit, DeviceWithServiceDetails } from '../lib/balena'
import * as vscode from 'vscode'
import { ServiceRunningIcon, ServiceStoppedIcon, UnknownIcon } from '../icons'

export class ServicesProvider implements vscode.TreeDataProvider<Service> {
    private _onDidChangeTreeData: vscode.EventEmitter<Service | undefined | void> = new vscode.EventEmitter<Service | undefined | void>()
    readonly onDidChangeTreeData: vscode.Event<Service | undefined | void> = this._onDidChangeTreeData.event

    constructor(
        private balenaSdk: BalenaSDK,
        private resourceFetchMethod: (balenaSdk: BalenaSDK, id: string | number) => Promise<DeviceWithServiceDetails<CurrentServiceWithCommit>>,
        public id: string,
    ) { }

    refresh(): void {
        this._onDidChangeTreeData.fire()
    }

    getTreeItem(element: Service): vscode.TreeItem {
        return element
    }

    getChildren(): Thenable<Service[]> {
        return Promise.resolve(this.getAllServices())
    }

    private async getAllServices(): Promise<Service[]> {
        const services = await this.resourceFetchMethod(this.balenaSdk, this.id)
        return Object.keys(services.current_services).map(s => new Service(s, services.current_services[s][0].status))
    }
}

export class Service extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly lastKnownStatus?: string
    ) {
        super(label)
        this.setLastKnownStatusIcon()
    }

    setLastKnownStatusIcon() {
        this.tooltip = this.lastKnownStatus
        if(this.lastKnownStatus == "Running") {
            this.iconPath = ServiceRunningIcon
        } else if (this.lastKnownStatus == "Stopped") {
            this.iconPath = ServiceStoppedIcon
        } else {
            this.iconPath = UnknownIcon
        }
    }

    contextValue = 'service'
}