import * as assert from 'assert'
import * as vscode from 'vscode'
import { describe } from 'mocha'
import { SelectedFleet$ } from '../../src/views/StatusBar'
import {Application as Fleet} from '../../src/lib/balena'

suite('Balena VSCode Test Suite', () => {
  
  let extContext

  suiteSetup( async () => {
    const ext = vscode.extensions.getExtension("kalebpace.balena-vscode")
    extContext = await ext?.activate() 
    extContext
  })

  describe("On Unauthenticated Activation...", () => {
    test('load \'undefined\' Fleet', async () => {
      SelectedFleet$.subscribe((value: Fleet | undefined) => assert.equal(value, undefined) )
    })
  })
})
