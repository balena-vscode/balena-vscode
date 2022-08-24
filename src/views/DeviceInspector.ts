import { BehaviorSubject } from 'rxjs'
import * as vscode from 'vscode'
import { Device, getDeviceById, getDeviceConfigVariables, getDeviceEnvVariables, getDevices, getDeviceServices, useBalenaClient } from '../lib/balena'
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
                treeDataProvider: new ServicesProvider(balena, getDeviceServices, device.uuid)
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
            const devices = await getDevices(balena, fleet.slug)
            const deviceIds = devices.map(d => d.device_name)
            const selectedDeviceId = await vscode.window.showQuickPick(deviceIds, {
                placeHolder: 'Select the Device to inspect...'
            })

            if (selectedDeviceId) {
                const selectedDevice = devices.find(d => d.device_name === selectedDeviceId)
                if (selectedDevice) {
                    SelectedDevice$.next(selectedDevice)
                    vscode.commands.executeCommand('device-meta.focus')
                }
            }
        }
    }).unsubscribe()
}