import { computeIconBasedOnLabelRegex } from '@/icons';
import * as vscode from 'vscode';

export class CopiableItem extends vscode.TreeItem {
    constructor(
        public readonly label: string
    ) {
        super(label);
    }

    contextValue = "copiableItem";
}

export class KeyValueItem extends vscode.TreeItem {
    constructor(
        public readonly key: string,
        public readonly value: string,
        private readonly icon?: vscode.ThemeIcon | null
    ) {
        super(`${key}: ${value}`);

        if(this.icon) {
            this.iconPath = this.icon;
        } else if (this.icon === null) {
            this.iconPath = undefined;
        } else {
            this.iconPath = computeIconBasedOnLabelRegex(this.label as string);
        }
    }

    contextValue = "keyValueItem";
}
