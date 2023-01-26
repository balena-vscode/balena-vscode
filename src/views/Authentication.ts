import * as vscode from 'vscode';
import {showErrMsg, showInfoMsg} from './Notifications';
import { BalenaSDK, getToken, is2FAEnabled, loginWithEmailPass, loginWithToken, useBalenaClient, verify2FAToken } from '@/balena';
import { useStore } from '@/store';

enum AuthenticationMethods {
  APIKey = 'API Key',
  EmailPass = 'Email / Password',
}

export const showLoginOptions = async () => {
  const result = await vscode.window.showQuickPick(Object.values(AuthenticationMethods), {
    placeHolder: 'Choose the authentication method...'
  });

  switch (result) {
    case AuthenticationMethods.APIKey:
      showLoginWithToken();
      break;
    case AuthenticationMethods.EmailPass:
      showLoginWithEmailPass();
      break;
    default:
      break;
  }
};

const showLoginWithToken = async () => {
  const token = (await vscode.window.showInputBox({
    placeHolder: 'Balena API Key...',
    validateInput: text => {
      let msg = null;

      if (/\s/g.test(text.trim())) {
        msg = 'Contains whitespace characters';
      } else if (text.trim().length !== 32) {
        msg = 'Must be 32 characters long';
      } else if (text.length === 0) {
        msg = 'Cannot be empty';
      }

      return msg;
    },
    ignoreFocusOut: true
  }))?.trim();

  try {
    if (token) {
      const isLoggedIn = await loginWithToken(useBalenaClient(), token);
      if (isLoggedIn) {
        const store = useStore();
        store.setBalenaApiKey(token);
        showInfoMsg('Successfully logged in!');
      }
    } else {
      showErrMsg('Token is empty');
    }
  } catch (error) {
    showErrMsg(error as string);
  }
};

const showLoginWithEmailPass = async () => {
  const email = (await vscode.window.showInputBox({
    placeHolder: 'Account Email...',
    validateInput: text => {
      let msg = null;

      if (/\s/g.test(text.trim())) {
        msg = 'Contains whitespace characters!';
      } else if(text.length === 0) {
        msg = 'Email must not be empty';
      }

      return msg;
    },
    ignoreFocusOut: true
  }))?.trim();

  const password = (await vscode.window.showInputBox({
    placeHolder: 'Account Password...',
    validateInput: text => text.length > 0 ? null : 'Password must not be empty',
    ignoreFocusOut: true
  }))?.trim();

  const balena = useBalenaClient();
  try {
    if(email && password) {
      let isLoggedIn = await loginWithEmailPass(balena, email, password);
      if (!isLoggedIn && await is2FAEnabled(balena)) {
        isLoggedIn = await showVerify2FAToken(balena);
      }
      
      if (isLoggedIn) {
        const store = useStore();
        store.setBalenaApiKey(await getToken(balena) as string);
        showInfoMsg('Successfully logged in!');
      } else {
        throw "Failed to login";
      }
    }
  } catch (error) {
    showErrMsg(error as string);
  }
};

const showVerify2FAToken = async (balena: BalenaSDK) => {
  const token = (await vscode.window.showInputBox({
    placeHolder: '2FA Token...',
    validateInput: text => text.length > 0 ? null : 'Token must not be empty',
    ignoreFocusOut: true
  }))?.trim()!;
  
  try {
    return await verify2FAToken(balena, token);
  } catch (e) {
    const error: Error = e as any;
    if(error.name === "BalenaRequestError2") {
      showErrMsg("Invalid 2FA Token");
    } else {
      showErrMsg(error.message);
    }
    return false;
  }
}
