import { getFleets, useBalenaClient } from './lib/balena';
import * as authentication from './views/Authentication';
import { showSelectFleet } from './views/FleetExplorer';
import * as notifications from './views/Notifications'

export const loginToBalenaCloud = async () => await authentication.showLoginOptions();
export const selectActiveFleet = async () => await showSelectFleet();

export const getCommandUri = (fn: Function) => 'balena-vscode.'.concat(fn.name);