import * as vscode from 'vscode';

export const BoolenIcon = new vscode.ThemeIcon('symbol-boolean');
export const ServiceDefinitionIcon = new vscode.ThemeIcon('file-code');
export const CpuIcon = new vscode.ThemeIcon('server-environment');
export const DateTimeIcon = new vscode.ThemeIcon('calendar');
export const DesiredStateIcon = new vscode.ThemeIcon('target');
export const DeviceHeartbeatOnlyIcon = new vscode.ThemeIcon('pulse', new vscode.ThemeColor('list.warningForeground'));
export const DeviceOfflineIcon = new vscode.ThemeIcon('debug-disconnect');
export const DeviceOnlineIcon = new vscode.ThemeIcon('broadcast', new vscode.ThemeColor('testing.iconPassed'));
export const DurationIcon = new vscode.ThemeIcon('watch');
export const InfoIcon = new vscode.ThemeIcon('info');
export const InProgressIcon = new vscode.ThemeIcon('loading~spin');
export const LocationIcon = new vscode.ThemeIcon('location');
export const LogIcon = new vscode.ThemeIcon('notebook');
export const MemoryIcon = new vscode.ThemeIcon('save');
export const NetworkAddressIcon = new vscode.ThemeIcon('globe');
export const PrivateNetworkAddressIcon = new vscode.ThemeIcon('shield');
export const NoteIcon = new vscode.ThemeIcon('note');
export const PersonIcon = new vscode.ThemeIcon('person');
export const PowerIcon = new vscode.ThemeIcon('zap');
export const ReleaseCanceledIcon = new vscode.ThemeIcon('circle-slash', new vscode.ThemeColor('list.warningForeground'));
export const ReleaseFailedIcon = new vscode.ThemeIcon('error', new vscode.ThemeColor('list.errorForeground'));
export const ReleaseFinalizedIcon  = new vscode.ThemeIcon('verified-filled', new vscode.ThemeColor('extensionIcon.verifiedForeground'));
export const ReleaseValidIcon = new vscode.ThemeIcon('pass', new vscode.ThemeColor('extensionIcon.preReleaseForeground'));
export const ServiceRunningIcon = new vscode.ThemeIcon('debug-start');
export const ServiceStoppedIcon = new vscode.ThemeIcon('debug-stop');
export const StorageIcon = new vscode.ThemeIcon('server');
export const TagIcon = new vscode.ThemeIcon('tag');
export const TargetIcon = new vscode.ThemeIcon('target');
export const TextIcon = new vscode.ThemeIcon('symbol-text');
export const UnknownIcon = new vscode.ThemeIcon('question');
export const VariableIcon = new vscode.ThemeIcon('variable');
export const VersionsIcon = new vscode.ThemeIcon('versions');

export const computeIconBasedOnLabelRegex = (label: string) => {
    if (/created_at|last_.*_event|timestamp|modified_at/.test(label)) {
        return DateTimeIcon;
    }
    else if (/is_/.test(label)) {
        return BoolenIcon;
    }
    else if (/location|longitude|latitude/.test(label)) {
        return LocationIcon;
    }
    else if (/memory_/.test(label)) {
        return MemoryIcon;
    }
    else if (/storage_/.test(label)) {
        return StorageIcon;
    }
    else if (/cpu_/.test(label)) {
        return CpuIcon;
    }
    else if (/should_be_/.test(label)) {
        return DesiredStateIcon;
    }
    else if (/_progress/.test(label)) {
        return InProgressIcon;
    }
    else if (/_address/.test(label)) {
        return NetworkAddressIcon;
    }
    else if (/volt/.test(label)) {
        return PowerIcon;
    }
    else if (/note/.test(label)) {
        return NoteIcon;
    }
    else if (/_log/.test(label)) {
        return LogIcon;
    }
    else {
        return TextIcon;
    }
};