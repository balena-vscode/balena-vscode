import { BalenaSDK } from 'balena-sdk'

export const getDevices = async (balenaSdk: BalenaSDK, fleetId: string) =>
  await balenaSdk.models.device.getAllByApplication(fleetId)
export const getDeviceByUuid = async (balenaSdk: BalenaSDK, deviceId: string) =>
  await balenaSdk.models.device.get(deviceId)
