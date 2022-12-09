import vscode from 'vscode';

export const CONTAINERFILE_URI_SCHEME = "containerfile";
export const COMPOSEFILE_URI_SCHEME = "composefile";

export class ContainerfileProvider implements vscode.TextDocumentContentProvider {
    onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.onDidChangeEmitter.event;

    constructor() {}

    provideTextDocumentContent(uri: vscode.Uri) {
        const containerfileContent = decodeURIComponent(uri.query);
        return containerfileContent;
    }
}

export class ComposefileProvider implements vscode.TextDocumentContentProvider {
    onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.onDidChangeEmitter.event;

    constructor() {}

    provideTextDocumentContent(uri: vscode.Uri) {
        const composefileContent = decodeURIComponent(uri.query);
        return composefileContent;
    }
}