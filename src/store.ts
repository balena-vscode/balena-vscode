
import * as vscode from 'vscode';
import { getToken, loginWithToken, useBalenaClient } from './balena';

let store: Store;
export const registerStore = async (context: vscode.ExtensionContext) => {
    store = new Store(context);
}

export const useStore = () => store;

class Store {
    constructor(private context: vscode.ExtensionContext) { }
    async getBalenaApiKey() { return await this.context.secrets.get("BALENA_API_KEY"); }
    async setBalenaApiKey(value: string) { await this.context.secrets.store("BALENA_API_KEY", value); }
}
