import * as vscode from 'vscode';
import { BalenaSDK } from 'balena-sdk';

export async function loginWithToken(balena: BalenaSDK) {
    const result = (await vscode.window.showInputBox({
        value: 'Balena Access Token',
        placeHolder: 'For example: \"34mrUxTY8yzlNXJsx8eFqOjy7oPmmfTK\"',
        validateInput: text => {
            let msg = null

            if (text.trim().length !== 32) {
                msg = 'Must be 32 characters long!'
            }

            if (/\s/g.test(text.trim())) {
                msg = 'Contains whitespace characters!'
            }

            return msg
        }
    }))?.trim()

    if (result !== undefined && result !== '') {
        await balena.auth.loginWithToken(result)
    } else {
        vscode.window.showErrorMessage('Invalid token received: could not authenticate')
    }
}