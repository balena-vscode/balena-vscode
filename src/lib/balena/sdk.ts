import * as vscode from 'vscode';
import { getSdk, SdkOptions } from 'balena-sdk';

export { type BalenaSDK } from 'balena-sdk';

/**
 * Returns a Balena SDK Client configured with any user workspace options
 * 
 * @remarks
 * In NodeJS environments, the Balena SDK manages the authentication state for itsself. 
 * Once a successful login happens, the SDK can be refetched easily with the retained tokens.
 * 
 * @returns BalenaSDK
 */
export const useBalenaClient = () => getSdk(getSdkOpts());

export const getSdkOpts = () => {
    const config = 'sdkOptions';
    let options: SdkOptions = {};

    const dataDirectory = vscode.workspace.getConfiguration(config).get<string>('dataDirectory');
    if (dataDirectory) {
        options.dataDirectory = dataDirectory;
    }

    const apiUrl = vscode.workspace.getConfiguration(config).get<string>('apiUrl');
    if (apiUrl) {
        options.apiUrl = apiUrl;
    }

    return options;
}