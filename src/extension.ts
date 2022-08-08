import * as vscode from 'vscode';

import { BalenaSDK, getSdk } from 'balena-sdk';

import { ExtensionContext, window } from 'vscode'


export function activate(context: vscode.ExtensionContext) {
	const balena = getSdk()
	console.log(`Balena SDK Version: ${balena.version}`)

	const disposable = vscode.commands.registerCommand('balena-vscode.loginToBalenaCloud', async () => {

		// TODO: Refactor into Auth Provider?
		// https://github.com/microsoft/vscode-extension-samples/tree/main/authenticationprovider-sample
		balena.auth.isLoggedIn().then(async status => {
			console.log(`Is logged in: ${status}`)
			if (!status) {
				await loginWithToken(balena)
			}

			balena.models.device.getAll().then((devices: any) => {
				console.log(devices)
				const online = devices.filter((d: any) => d.is_online)
				const offline = devices.filter((d: any) => !d.is_online)
				window.showInformationMessage(`Success! ${devices.length} devices found: ${online.length} online / ${offline.length} offline`)
			})
		})

	});

	context.subscriptions.push(disposable);
}

export async function loginWithToken(client: BalenaSDK) {
	const result = (await window.showInputBox({
		value: 'Balena Access Token',
		placeHolder: 'For example: \"34mrUxTY8yzlNXJsx8eFqOjy7oPmmfTK\"',
		validateInput: text => {
			let msg = null

			if (text.trim().length !== 32) {
				msg = 'Must be 32 characters long!'
			}

			if (text.trim().includes(" ")) {
				msg = 'Contains whitespace characters!'
			}

			return msg
		}
	}))?.trim()

	if (result !== undefined && result !== '') {
		await client.auth.loginWithToken(result)
	} else {
		window.showErrorMessage('Invalid token received: could not authenticate')
	}
}