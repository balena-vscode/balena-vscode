import * as vscode from 'vscode';



const balenaSdkOptionsConfigUri = 'sdkOptions';
const dataDirectoryConfigUri = 'dataDirectory';
export const getBalenaSdkDataDirectory = () =>
  vscode.workspace.getConfiguration(balenaSdkOptionsConfigUri).get<string>(dataDirectoryConfigUri);
export const setBalenaSdkDataDirectory = (value: string) =>
  vscode.workspace.getConfiguration(balenaSdkOptionsConfigUri).update(dataDirectoryConfigUri, value);

const apiUrlConfigUrl = 'apiUrl';
export const getBalenaSdkApiUrl = () =>
  vscode.workspace.getConfiguration(balenaSdkOptionsConfigUri).get<string>(apiUrlConfigUrl);
export const setBalenaSdkApiUrl = (value: string) =>
  vscode.workspace.getConfiguration(balenaSdkOptionsConfigUri).update(apiUrlConfigUrl, value);

const defaultFleetConfigUri = 'defaultFleet';
export const getDefaultFleet = () => vscode.workspace.getConfiguration().get<string>(defaultFleetConfigUri);
export const setDefaultFleet = (value: string) => vscode.workspace.getConfiguration().update(defaultFleetConfigUri, value, vscode.ConfigurationTarget.WorkspaceFolder);
