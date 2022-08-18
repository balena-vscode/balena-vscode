import * as vscode from 'vscode'
import * as settings from '../settings'
import { BehaviorSubject } from 'rxjs'
import { getCommandUri, selectActiveFleet } from '../commands'
import { getFleets, useBalenaClient } from '../lib/balena'

export const SelectedFleet$ = new BehaviorSubject<string | undefined>(undefined)

export const registerView = async (context: vscode.ExtensionContext) => {
  fleetStatusItem = createFleetStatusItem()
  context.subscriptions.push(fleetStatusItem)

  const initialFleet = settings.getDefaultFleet() ?? (await getFleets(useBalenaClient()))[0].slug
  SelectedFleet$.next(initialFleet)
  SelectedFleet$.subscribe(fleet => updateFleetStatusItemText(fleet ?? 'None'))
}

export const showSelectFleet = async () => {
  const balena = useBalenaClient()
  const fleets = await getFleets(balena)

  const fleetIds = fleets.map(f => f.slug)
  const fleet = (await vscode.window.showQuickPick(fleetIds, {
    placeHolder: 'Select the Fleet to activate...'
  }))

  if (fleet) {
    SelectedFleet$.next(fleet)
  }

  return fleet
}

let fleetStatusItem: vscode.StatusBarItem
const updateFleetStatusItemText = (fleet: string) => fleetStatusItem.text = `$(symbol-method) Active Fleet: ${fleet}`
const createFleetStatusItem = () => {
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
  item.command = getCommandUri(selectActiveFleet)
  item.tooltip = 'Select Active Balena Fleet'
  item.show()
  return item
}
