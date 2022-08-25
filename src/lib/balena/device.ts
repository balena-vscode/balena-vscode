import { BalenaSDK } from 'balena-sdk'

export const getDevices = async (balenaSdk: BalenaSDK, fleetId: string) => await balenaSdk.models.device.getAllByApplication(fleetId)
export const getDeviceById = async (balenaSdk: BalenaSDK, deviceId: string | number) => await balenaSdk.models.device.get(deviceId)
export const getDeviceEnvVariables = async (balenaSdk: BalenaSDK, deviceId: string | number) => await balenaSdk.models.device.envVar.getAllByDevice(deviceId)
export const getDeviceConfigVariables = async (balenaSdk: BalenaSDK, deviceId: string | number) => await balenaSdk.models.device.configVar.getAllByDevice(deviceId)
export const getDeviceWithServices = async (balenaSdk: BalenaSDK, deviceId: string | number) => await balenaSdk.models.device.getWithServiceDetails(deviceId)

export const listDeviceIds = async (balenaSdk: BalenaSDK, fleetId: string) => await balenaSdk.models.device.getAllByApplication(fleetId, {$select: ["device_name", "uuid"]})
