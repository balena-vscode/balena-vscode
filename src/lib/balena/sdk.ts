import * as settings from '../../settings'

import { getSdk, SdkOptions } from 'balena-sdk'

export * from 'balena-sdk'
export { 
  type Application as Fleet,
  type ApplicationVariable as FleetVariable
} from 'balena-sdk'

/**
 * Returns a Balena SDK Client configured with any user workspace options
 *
 * @remarks
 * In NodeJS environments, the Balena SDK manages the authentication state for itsself.
 * Once a successful login happens, the SDK can be refetched easily with the retained tokens.
 *
 * @returns BalenaSDK
 */
export const useBalenaClient = () => getSdk(getSdkOpts())

/**
 * Loads user and workspaces settings from the environment and returns an SdkOptions object
 * to be used for creating a BalenaSDK client
 *
 * @returns SdkOptions
 */
export const getSdkOpts = () => {
  const options: SdkOptions = {}

  const dataDirectory = settings.getBalenaSdkDataDirectory()
  if (dataDirectory) {
    options.dataDirectory = dataDirectory
  }

  const apiUrl = settings.getBalenaSdkApiUrl()
  if (apiUrl) {
    options.apiUrl = apiUrl
  }

  return options
}
