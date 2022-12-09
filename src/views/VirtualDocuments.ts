import vscode from "vscode";
import { BuildLogsProvider, BUILD_LOG_URI_SCHEME, DEVICE_LOG_URI_SCHEME, LogsProvider } from "@/providers";
import { useBalenaClient } from "@/balena";
import { 
    ComposefileProvider, 
    COMPOSEFILE_URI_SCHEME, 
    ContainerfileProvider, 
    CONTAINERFILE_URI_SCHEME 
} from "@/providers/containerfiles";

export const registerView = (context: vscode.ExtensionContext) => {
    const balena = useBalenaClient();
    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(DEVICE_LOG_URI_SCHEME, new LogsProvider(balena)));
    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(BUILD_LOG_URI_SCHEME, new BuildLogsProvider()));
    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(CONTAINERFILE_URI_SCHEME, new ContainerfileProvider()));
    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(COMPOSEFILE_URI_SCHEME, new ComposefileProvider()));
};