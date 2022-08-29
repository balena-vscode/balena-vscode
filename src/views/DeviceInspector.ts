import { focusDeviceInspector } from '../commands'
import { BehaviorSubject } from 'rxjs'
import * as vscode from 'vscode'
import { DeviceWithServiceDetails, getDeviceById, getDeviceConfigVariables, getDeviceEnvVariables, getDeviceWithServices, listDeviceIds, useBalenaClient } from '../lib/balena'
import { MetaProvider, ServicesProvider, VariablesProvider, DeviceSummaryProvider } from '../providers'
import { SelectedFleet$ } from './StatusBar'

export enum ViewIds {
    DeviceInspector = "deviceInspector",
    Summary = "deviceSummary",
    Services = "deviceServices",
    Variables = "deviceVariables",
    Meta = "deviceMeta"
}

export const SelectedDevice$ = new BehaviorSubject<DeviceWithServiceDetails | undefined>(undefined)

export const registerView = (context: vscode.ExtensionContext) => {
    const balena = useBalenaClient()
    SelectedDevice$.subscribe(device => {
        if(device) {
            context.subscriptions.push(vscode.window.createTreeView(ViewIds.Summary, {
                treeDataProvider: new DeviceSummaryProvider(balena, device)
            }))

            context.subscriptions.push(vscode.window.createTreeView(ViewIds.Services, {
                treeDataProvider: new ServicesProvider(balena, getDeviceWithServices, device.uuid)
            }))

            context.subscriptions.push(vscode.window.createTreeView(ViewIds.Variables, {
                canSelectMany: true,
                treeDataProvider: new VariablesProvider(balena, getDeviceConfigVariables, getDeviceEnvVariables, device.uuid)
            }))

            context.subscriptions.push(vscode.window.createTreeView(ViewIds.Meta, {
                canSelectMany: true,
                treeDataProvider: new MetaProvider(balena, getDeviceById, device.uuid)
            }))
        }
    })
}

export const showInspectDeviceInput = () => {
    const balena = useBalenaClient()
    SelectedFleet$.subscribe(async fleet => {
        if (fleet) {
            const devices = await listDeviceIds(balena, fleet.slug)
            const deviceSelectionList = devices.map(d => new DeviceItem(d.device_name, d.uuid))
            const selectedDeviceId = await vscode.window.showQuickPick<DeviceItem>(deviceSelectionList, {
                placeHolder: 'Select the Device to inspect...',
            })

            if (selectedDeviceId) {
                const device = await getDeviceWithServices(balena, selectedDeviceId.uuid)
                SelectedDevice$.next(device)
                focusDeviceInspector()
            }
        }
    }).unsubscribe()
}

class DeviceItem implements vscode.QuickPickItem {
    label: string
    description: string

    constructor(
        public device_name: string,
        public uuid: string,
    ) {
        this.label = device_name
        this.description = uuid.slice(0,7)
    }
}