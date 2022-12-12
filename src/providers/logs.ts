import vscode from 'vscode';
import { BalenaSDK, LogMessage, LogsSubscription } from '@/balena';
import { Settings$ } from '@/settings';
import stripAnsi from 'strip-ansi';

interface Subscriptions {
    [uri: string]: {
        handle: LogsSubscription
        content: string
    }
};

export const DEVICE_LOG_URI_SCHEME = "deviceLogs";
export const BUILD_LOG_URI_SCHEME = "buildLogs"

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
                subscription.content = '';
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
                        handle: logs.on('line', (line: LogMessage) => {
                            Settings$.subscribe(settings => {
                                const oldContent = this.subscriptions[uriString]?.content ?? '';
                                this.subscriptions[uriString].content = oldContent.concat(settings.stripAnsiCharactersFromLogs ? stripAnsi(line.message) : line.message);
                                this.onDidChangeEmitter.fire(uri as vscode.Uri);
                            }).unsubscribe();
                        })
                    };
                });
        }

        return this.subscriptions[uriString]?.content ?? '';
    }
}

export class BuildLogsProvider implements vscode.TextDocumentContentProvider {
    onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.onDidChangeEmitter.event;

    constructor() {}

    provideTextDocumentContent(uri: vscode.Uri) { 
        const buildLogContent = decodeURIComponent(uri.query);
        return buildLogContent;
    }
}