import * as vscode from 'vscode'

export const DeviceOnline = new vscode.ThemeIcon('broadcast', new vscode.ThemeColor('ports.iconRunningProcess'))
export const DeviceHeartbeatOnly = new vscode.ThemeIcon('pulse', new vscode.ThemeColor('list.warningForeground'))
export const DeviceOffline = new vscode.ThemeIcon('debug-disconnect')

export const ReleaseFinalized  = new vscode.ThemeIcon('verified-filled', new vscode.ThemeColor('extensionIcon.verifiedForeground'))
export const ReleaseValid = new vscode.ThemeIcon('pass', new vscode.ThemeColor('extensionIcon.preReleaseForeground'))
export const ReleaseCanceled = new vscode.ThemeIcon('circle-slash', new vscode.ThemeColor('list.warningForeground'))
export const ReleaseFailed = new vscode.ThemeIcon('error', new vscode.ThemeColor('list.errorForeground'))
export const ReleaseUnknown = new vscode.ThemeIcon('question')

export const VariableSet = new vscode.ThemeIcon('variable')