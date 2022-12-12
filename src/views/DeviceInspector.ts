import * as vscode from 'vscode';
import { BehaviorSubject, delayWhen, interval, repeat, take, tap } from 'rxjs';
import { DeviceWithServiceDetails, getDeviceById, getDeviceConfigVariables, getDeviceEnvVariables, getDeviceIds, getDeviceWithServiceDetails, shortenUUID, useBalenaClient } from '@/balena';
import { DeviceSummaryProvider, MetaProvider, ServicesProvider, VariablesProvider } from '@/providers';
import { SelectedFleet$ } from '@/views/FleetExplorer';
import { Settings$ } from '@/settings';

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
        if (device) {
            context.subscriptions.push(vscode.window.createTreeView(ViewId.Summary, {
                treeDataProvider: new DeviceSummaryProvider(balena, device)
            }));

            context.subscriptions.push(vscode.window.createTreeView(ViewId.Services, {
                treeDataProvider: new ServicesProvider(balena, getDeviceWithServiceDetails, device.uuid)
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
    
    refreshViewAtInterval();
};

const refreshViewAtInterval = () => {
    Settings$.pipe(
        tap(() => SelectedDevice$.pipe(take(1)).subscribe(d => SelectedDevice$.next(d))),
        delayWhen(settings => interval(settings.deviceRefreshIntervalInSeconds! * 1000)),
        take(1),
        repeat()
    ).subscribe();
}

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

    SelectedFleet$.subscribe(async fleet => {
        if (fleet) {
            const devices = await getDeviceIds(balena, fleet.slug) ?? [];
            const deviceSelectionList = devices.map(d => new DeviceItem(d.device_name, d.uuid));
            const selection = await vscode.window.showQuickPick<DeviceItem>(deviceSelectionList, {
                placeHolder: 'Select a device...',
            });

            if(selection) {
                const selectedDevice = await getDeviceWithServiceDetails(balena, selection.uuid);
                SelectedDevice$.next(selectedDevice ?? undefined);
            }
        }
    }).unsubscribe();
};
