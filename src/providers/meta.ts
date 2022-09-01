import { BalenaSDK, Device, Fleet } from '@/lib/balena';
import * as vscode from 'vscode';
import {
    BoolenIcon,
    CpuIcon,
    DateTimeIcon,
    DesiredStateIcon,
    InProgressIcon,
    LocationIcon,
    LogIcon,
    MemoryIcon,
    NetworkAddressIcon,
    NoteIcon,
    PowerIcon,
    StorageIcon,
    TextIcon,
} from '@/icons';

export class MetaProvider implements vscode.TreeDataProvider<Meta> {
    private _onDidChangeTreeData: vscode.EventEmitter<Meta | undefined | void> = new vscode.EventEmitter<Meta | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<Meta | undefined | void> = this._onDidChangeTreeData.event;

    constructor(
        private balenaSdk: BalenaSDK,
        private resourceFetchMethod: (balenaSdk: BalenaSDK, id: string | number) => Promise<Device | Fleet>,
        public id: string,
    ) { }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: Meta): vscode.TreeItem {
        return element;
    }

    getChildren(): Thenable<Meta[]> {
        return Promise.resolve(this.getAllMetas());
    }

    private async getAllMetas(): Promise<Meta[]> {
        const metas = await this.resourceFetchMethod(this.balenaSdk, this.id);
        return Object.entries(metas)
        .filter(item => item[1] !== null && typeof item[1] !== "object" && item[1] !== undefined && item[1] !== '')
        .map(item => new Meta(`${item[0]}: ${item[1]}`))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
}

export class Meta extends vscode.TreeItem {
    constructor(
        public readonly label: string,
    ) {
        super(label);
        this.setMetaIcon();
    }

    private setMetaIcon() {
        if (/created_at|last_.*_event|timestamp|modified_at/.test(this.label)) {
            this.iconPath = DateTimeIcon;
        }
        else if (/is_/.test(this.label)) {
            this.iconPath = BoolenIcon;
        }
        else if (/location|longitude|latitude/.test(this.label)) {
            this.iconPath = LocationIcon;
        }
        else if (/memory_/.test(this.label)) {
            this.iconPath = MemoryIcon;
        }
        else if (/storage_/.test(this.label)) {
            this.iconPath = StorageIcon;
        }
        else if (/cpu_/.test(this.label)) {
            this.iconPath = CpuIcon;
        }
        else if (/should_be_/.test(this.label)) {
            this.iconPath = DesiredStateIcon;
        }
        else if (/_progress/.test(this.label)) {
            this.iconPath = InProgressIcon;
        }
        else if (/_address/.test(this.label)) {
            this.iconPath = NetworkAddressIcon;
        }
        else if (/volt/.test(this.label)) {
            this.iconPath = PowerIcon;
        }
        else if (/note/.test(this.label)) {
            this.iconPath = NoteIcon;
        }
        else if (/_log/.test(this.label)) {
            this.iconPath = LogIcon;
        }
        else {
            this.iconPath = TextIcon;
        }
    }

    contextValue = 'meta';
}