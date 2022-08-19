import { BalenaSDK } from 'balena-sdk'

export const getFleets = async (balenaSdk: BalenaSDK) => await balenaSdk.models.application.getAllDirectlyAccessible()
export const getFleetReleases = async (balenaSdk: BalenaSDK, fleetId: string | number) => await balenaSdk.models.release.getAllByApplication(fleetId)
export const getFleetReleaseById = async (balenaSdk: BalenaSDK, releaseId: string) => await balenaSdk.models.release.get(releaseId)
export const getFleetVariables = async (balenaSdk: BalenaSDK, fleetId: string | number) => await balenaSdk.models.application.envVar.getAllByApplication(fleetId)
