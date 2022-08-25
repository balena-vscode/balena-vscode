import { BehaviorSubject } from 'rxjs'
import * as vscode from 'vscode'
import { Device, getDeviceById, getDeviceConfigVariables, getDeviceEnvVariables, getDeviceWithServices, listDeviceIds, useBalenaClient } from '../lib/balena'
import { MetaProvider, ServicesProvider, VariablesProvider } from '../providers'
import { SelectedFleet$ } from './StatusBar'

export const SelectedDevice$ = new BehaviorSubject<Device | undefined>(undefined)

export const registerView = () => {
    const balena = useBalenaClient()
    SelectedDevice$.subscribe(device => {
        if(device) {
            vscode.window.createTreeView('device-summary', {
                canSelectMany: true,
                treeDataProvider: new MetaProvider(balena, getDeviceById, device.uuid)
            })
            vscode.window.createTreeView('device-services', {
                canSelectMany: true,
                treeDataProvider: new ServicesProvider(balena, getDeviceWithServices, device.uuid)
            })
            vscode.window.createTreeView('device-variables', {
                canSelectMany: true,
                treeDataProvider: new VariablesProvider(balena, getDeviceConfigVariables, getDeviceEnvVariables, device.uuid)
            })
            vscode.window.createTreeView('device-meta', {
                canSelectMany: true,
                treeDataProvider: new MetaProvider(balena, getDeviceById, device.uuid)
            })
        }
    })
}

export const showInspectDevice = () => {
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
                vscode.commands.executeCommand('device-meta.focus')
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