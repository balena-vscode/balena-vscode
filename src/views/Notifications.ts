import * as vscode from 'vscode';
import { useLogger } from '@/logger';

export const showInfoMsg = (msg: string) => {
  vscode.window.showInformationMessage(msg);
  const logger = useLogger();
  logger.appendLine(msg);
};

export const showWarnMsg = (msg: string) => {
  vscode.window.showWarningMessage(msg);
  const logger = useLogger();
  logger.appendLine(msg);
};

export const showErrMsg = (msg: string) => {
  vscode.window.showErrorMessage(msg);
  const logger = useLogger();
  logger.show();
  logger.appendLine(msg);
};

export const logDebugMsg = (obj: unknown) => {
  console.log(obj);
  const logger = useLogger();
  logger.appendLine(JSON.stringify(obj));
};
