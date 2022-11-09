import vscode from "vscode";
import { DEVICE_LOG_URI_SCHEME, LogsProvider } from "@/providers";
import { useBalenaClient } from "@/balena";

export const registerView = (context: vscode.ExtensionContext) => {
    const balena = useBalenaClient();
    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(DEVICE_LOG_URI_SCHEME, new LogsProvider(balena)));
};