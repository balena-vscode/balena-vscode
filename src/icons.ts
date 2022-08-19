import * as vscode from 'vscode'

export const DeviceOnlineIcon = new vscode.ThemeIcon('broadcast', new vscode.ThemeColor('ports.iconRunningProcess'))
export const DeviceHeartbeatOnlyIcon = new vscode.ThemeIcon('pulse', new vscode.ThemeColor('list.warningForeground'))
export const DeviceOfflineIcon = new vscode.ThemeIcon('debug-disconnect')

export const ReleaseFinalizedIcon  = new vscode.ThemeIcon('verified-filled', new vscode.ThemeColor('extensionIcon.verifiedForeground'))
export const ReleaseValidIcon = new vscode.ThemeIcon('pass', new vscode.ThemeColor('extensionIcon.preReleaseForeground'))
export const ReleaseCanceledIcon = new vscode.ThemeIcon('circle-slash', new vscode.ThemeColor('list.warningForeground'))
export const ReleaseFailedIcon = new vscode.ThemeIcon('error', new vscode.ThemeColor('list.errorForeground'))
export const ReleaseUnknownIcon = new vscode.ThemeIcon('question')

export const VariableSet = new vscode.ThemeIcon('variable')

export const LocationIcon = new vscode.ThemeIcon('location')
export const DateTimeIcon = new vscode.ThemeIcon('calendar')
export const MemoryIcon = new vscode.ThemeIcon('save')
export const StorageIcon = new vscode.ThemeIcon('server')
export const BoolenIcon = new vscode.ThemeIcon('symbol-boolean')
export const CpuIcon = new vscode.ThemeIcon('rocket')
export const DesiredStateIcon = new vscode.ThemeIcon('target')
export const InProgressIcon = new vscode.ThemeIcon('loading~spin')
export const NetworkAddressIcon = new vscode.ThemeIcon('globe')
export const PowerIcon = new vscode.ThemeIcon('zap')
export const TextIcon = new vscode.ThemeIcon('symbol-text')