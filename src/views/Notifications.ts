import * as vscode from 'vscode';
import { useLogger } from '@/logger';
import { CommandId } from '@/commands';

export const showBalenaSetupWarning = async () => {
  const logger = useLogger();

  const msg = "The BalenaSDK is not initialized: are you logged in?";
  const actions = ["Log In"];
  logger.appendLine(msg);
  
  const selectedAction = await vscode.window.showInformationMessage(msg, ...actions);
  
  switch(selectedAction) {
    case "Log In":
      vscode.commands.executeCommand(CommandId.LoginToBalenaCloud);
      logger.appendLine(`selected: ${msg}`);
  }
};

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
