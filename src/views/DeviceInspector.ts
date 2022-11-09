import { BehaviorSubject } from 'rxjs';
import * as vscode from 'vscode';
import { Application, DeviceWithServiceDetails, getDeviceById, getDeviceConfigVariables, getDeviceEnvVariables, getDeviceIds, getDeviceWithServices, shortenUUID, useBalenaClient } from '@/balena';
import { DeviceSummaryProvider, MetaProvider, ServicesProvider, VariablesProvider } from '@/providers';
import { SelectedFleet$ } from './StatusBar';

export enum ViewId {
    DeviceInspector = "deviceInspector",
    Summary = "deviceSummary",
    Services = "deviceServices",
    Variables = "deviceVariables",
    Meta = "deviceMeta"
}

export const SelectedDevice$ = new BehaviorSubject<DeviceWithServiceDetails | undefined>(undefined);

export const registerView = (context: vscode.ExtensionContext) => {
    const balena = useBalenaClient();
    SelectedDevice$.subscribe(device => {
        if(device) {
            context.subscriptions.push(vscode.window.createTreeView(ViewId.Summary, {
                treeDataProvider: new DeviceSummaryProvider(balena, device)
            }));

            context.subscriptions.push(vscode.window.createTreeView(ViewId.Services, {
                treeDataProvider: new ServicesProvider(balena, getDeviceWithServices, device.uuid)
            }));

            context.subscriptions.push(vscode.window.createTreeView(ViewId.Variables, {
                canSelectMany: true,
                treeDataProvider: new VariablesProvider(balena, getDeviceConfigVariables, getDeviceEnvVariables, device.uuid)
            }));

            context.subscriptions.push(vscode.window.createTreeView(ViewId.Meta, {
                canSelectMany: true,
                treeDataProvider: new MetaProvider(balena, getDeviceById, device.uuid)
            }));
        }
    });
};

export const showSelectDeviceInput = async () => {
    const balena = useBalenaClient();

    class DeviceItem implements vscode.QuickPickItem {
        label: string;
        description: string;

        constructor(
            public device_name: string,
            public uuid: string,
        ) {
            this.label = device_name;
            this.description = shortenUUID(uuid);
        }
    }

    let selectedFleet: Application | undefined;
    SelectedFleet$.subscribe(fleet => {
        selectedFleet = fleet;
    }).unsubscribe();

    if (selectedFleet) {
        const devices = await getDeviceIds(balena, selectedFleet.slug) ?? [];
        const deviceSelectionList = devices.map(d => new DeviceItem(d.device_name, d.uuid));
        const selectedDevice = await vscode.window.showQuickPick<DeviceItem>(deviceSelectionList, {
            placeHolder: 'Select a device...',
        });

        return selectedDevice;
    } else {
        return undefined;
    }
};
