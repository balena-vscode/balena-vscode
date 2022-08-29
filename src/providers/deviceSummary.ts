import * as vscode from 'vscode'

export class DeviceSummaryProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "device-summary";

    private _view?: vscode.WebviewView;

    constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		// context: vscode.WebviewViewResolveContext,
		// _token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(data => {
            console.log(data)
		});
	}

    private _getHtmlForWebview(webview: vscode.Webview) {
		// // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		// const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

		// // Do the same for the stylesheet.
		// const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
		// const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
		// const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));
				// <link href="${styleResetUri}" rel="stylesheet">
				// <link href="${styleVSCodeUri}" rel="stylesheet">
				// <link href="${styleMainUri}" rel="stylesheet">


		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-lkjsadf';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				
				<title>Device Summary</title>
			</head>
			<body>
				<ul class="color-list">
				</ul>
				<h1> Hello World </h1>
				<script nonce="" src=""></script>
			</body>
			</html>`;
	}
}