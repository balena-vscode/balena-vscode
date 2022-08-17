import * as vscode from 'vscode'
import { useLogger } from '../logger'

export const infoMsg = (msg: string) => {
  vscode.window.showInformationMessage(msg)
  const logger = useLogger()
  logger.appendLine(msg)
}

export const errorMsg = async (msg: string) => {
  vscode.window.showErrorMessage(msg)
  const logger = useLogger()
  logger.show()
  logger.appendLine(msg)
}

export const debugMsg = async (obj: unknown) => {
  console.log(obj)
  const logger = useLogger()
  logger.appendLine(JSON.stringify(obj))
}
