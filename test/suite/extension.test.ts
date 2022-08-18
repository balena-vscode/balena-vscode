import * as assert from 'assert'
import * as vscode from 'vscode'
import { describe } from 'mocha'
import { SelectedFleet$ } from '../../src/views/StatusBar'

suite('Balena VSCode Test Suite', () => {
  
  let extContext

  suiteSetup( async () => {
    const ext = vscode.extensions.getExtension("kalebpace.balena-vscode")
    extContext = await ext?.activate() 
    extContext
  })

  describe("On Activation...", () => {
    test('load \'undefined\' Fleet', async () => {
      SelectedFleet$.subscribe((value: string | undefined) => assert.equal(value, undefined) )
    })
  })
})
