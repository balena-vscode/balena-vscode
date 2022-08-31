import * as vscode from 'vscode'

let logger: vscode.OutputChannel
export const useLogger = () => {
    if(!logger) {
        logger = vscode.window.createOutputChannel('Balena')
    }
    return logger
}
