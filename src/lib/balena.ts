import * as vscode from 'vscode';
import { getSdk, SdkOptions } from 'balena-sdk/es2015';

enum Errors {
    Unauthenticated = "Balena SDK: Unauthenticated, please login via the command palette."
}

export const getAuthenticatedSdkFromCache = async () => {
    const balena = _getSdk();
    const isLoggedIn = await balena.auth.isLoggedIn();

    if (isLoggedIn) {
        return balena;
    } else {
        throw new Error(Errors.Unauthenticated);
    }
}

export const getAuthenticatedSdkWithToken = async (authToken: string) => {
    const balena = _getSdk();
    await balena.auth.loginWithToken(authToken);

    const isLoggedIn = await balena.auth.isLoggedIn();
    if (isLoggedIn) {
        return balena
    } else {
        throw new Error(Errors.Unauthenticated);
    }

}

export const getAuthenticatedSdkWithEmailPass = async (email: string, password: string) => {
    const balena = _getSdk();
    await balena.auth.login({
        email: email,
        password: password
    });

    const isLoggedIn = await balena.auth.isLoggedIn();
    if (isLoggedIn) {
        return balena;
    } else {
        throw new Error(Errors.Unauthenticated);
    }
}
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

const _getSdk = () => {
    const options = getSdkOpts();
    if (Object.keys(options).length > 0) {
        return getSdk(options);
    } else {
        return getSdk();
    }
}
