import * as vscode from 'vscode'
import * as settings from '../settings'
import { BehaviorSubject } from 'rxjs'
import { Application as Fleet, getFleetById, getFleets, useBalenaClient } from '../lib/balena'
import { CommandIds } from '../commands'

export const SelectedFleet$ = new BehaviorSubject<Fleet | undefined>(undefined)

export const registerView = async (context: vscode.ExtensionContext) => {
  fleetStatusItem = createFleetStatusItem()
  context.subscriptions.push(fleetStatusItem)

  SelectedFleet$.next(await getInitialFleet())
  SelectedFleet$.subscribe(fleet => updateFleetStatusItemText(fleet?.slug ?? 'None'))
}

export const showSelectFleet = async () => {
  const balena = useBalenaClient()
  const fleets = await getFleets(balena)

  const fleetIds = fleets.map(f => f.slug)
  const selectedFleetId = (await vscode.window.showQuickPick(fleetIds, {
    placeHolder: 'Select the Fleet to activate...'
  }))

  if (selectedFleetId) {
    const selectedFleet = fleets.find((f, i) => fleets[i].slug === f.slug)
    SelectedFleet$.next(selectedFleet)
  }

  return selectedFleetId
}

const getInitialFleet = async () => {
  const balena = useBalenaClient()
  const userDefault = settings.getDefaultFleet()
  if(userDefault) {
    return await getFleetById(balena, userDefault)
  } else {
    return (await getFleets(balena))[0]
  }
}

let fleetStatusItem: vscode.StatusBarItem
const updateFleetStatusItemText = (fleet: string) => fleetStatusItem.text = `$(symbol-method) Active Fleet: ${fleet}`
const createFleetStatusItem = () => {
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
  item.command = CommandIds.SelectActiveFleet
  item.tooltip = 'Select Active Balena Fleet'
  item.show()
  return item
}
