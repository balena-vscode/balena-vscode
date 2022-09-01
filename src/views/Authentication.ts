import * as vscode from 'vscode';
import * as notifications from './Notifications';
import { useBalenaClient, loginWithEmailPass, loginWithToken } from '@/lib/balena';

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
    }
  }))?.trim();

  try {
    if (token) {
      const isLoggedIn = await loginWithToken(useBalenaClient(), token);
      if (isLoggedIn) {
        notifications.infoMsg('Successfully logged in!');
      }
    } else {
      notifications.errorMsg('Token is empty');
    }
  } catch (error) {
    notifications.errorMsg(error as string);
    await showLoginOptions();
  }
};

const showLoginWithEmailPass = async () => {
  const email = (await vscode.window.showInputBox({
    placeHolder: 'Account Email...',
    validateInput: text => {
      let msg = null;

      if (/\s/g.test(text.trim())) {
        msg = 'Contains whitespace characters!';
      }

      return msg;
    }
  }))?.trim();

  const password = (await vscode.window.showInputBox({
    placeHolder: 'Account Password...'
  }))?.trim();

  try {
    if (email && password) {
      const isLoggedIn = await loginWithEmailPass(useBalenaClient(), email, password);
      if (isLoggedIn) {
        notifications.infoMsg('Successfully logged in!');
      }
    } else {
      notifications.errorMsg('Email or password is empty');
    }
  } catch (error) {
    notifications.errorMsg(error as string);
    await showLoginOptions();
  }
};
