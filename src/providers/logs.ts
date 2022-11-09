import vscode from 'vscode';
import { BalenaSDK, LogsSubscription } from '@/balena';

type Subscriptions = {
    [uri: string]: {
        handle: LogsSubscription
        content: string
    }
};

export const DEVICE_LOG_URI_SCHEME = "deviceLogs";

export class LogsProvider implements vscode.TextDocumentContentProvider {
    onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.onDidChangeEmitter.event;

    private subscriptions: Subscriptions;

    constructor(private balenaSdk: BalenaSDK) {
        this.subscriptions = {};

        vscode.workspace.onDidCloseTextDocument((doc: vscode.TextDocument) => {
            const subscription = this.subscriptions[doc.uri.toString()];
            if(subscription) {
                subscription.handle.unsubscribe();
            }
        });
    }

    provideTextDocumentContent(uri: vscode.Uri) {
        const uuid = uri.fragment;
        const uriString = uri.toString();

        if (!this.subscriptions[uriString]) {
            this.balenaSdk.logs.subscribe(uuid, { count: 20 })
                .then((logs: LogsSubscription) => {
                    this.subscriptions[uriString] = {
                        content: '',
                        handle: logs.on('line', (line: any) => {
                            const oldContent = this.subscriptions[uriString]?.content ?? '';
                            this.subscriptions[uriString].content = oldContent.concat(line.message);
                            this.onDidChangeEmitter.fire(uri as vscode.Uri);
                        })
                    };
                });
        }

        return this.subscriptions[uriString]?.content ?? '';
    }
}