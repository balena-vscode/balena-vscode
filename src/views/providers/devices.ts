import path from 'path';
import * as vscode from 'vscode';

import { getAuthenticatedSdkFromCache } from '../../lib/balena';

export class DeviceProvider implements vscode.TreeDataProvider<Device> {
    private _onDidChangeTreeData: vscode.EventEmitter<Device | undefined | void> = new vscode.EventEmitter<Device | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<Device | undefined | void> = this._onDidChangeTreeData.event;

    constructor() { }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: Device): vscode.TreeItem {
        return element;
    }

    getChildren(element?: Device): Thenable<Device[]> {
        if (element) {
            vscode.window.showInformationMessage('Passed element');
            return Promise.resolve(this.getAllDevices())
        } else {
            vscode.window.showInformationMessage('No element');
            return Promise.resolve(this.getAllDevices())
        }
    }


    private async getAllDevices(): Promise<Device[]> {
        const balena = await getAuthenticatedSdkFromCache();
        const rawDevices = await balena.models.device.getAll()
        const devices = rawDevices.map(d => new Device(`${d.device_name} (${d.status})`, vscode.TreeItemCollapsibleState.None));
        return devices
    }
}

export class Device extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState)
    }


    iconPath = {
        light: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'light', 'device.svg'),
        dark: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'dark', 'device.svg'),
    };

    contextValue = 'device'
}