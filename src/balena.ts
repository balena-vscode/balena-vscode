import * as settings from '@/settings';

import { BalenaSDK, DeviceType, NavigationResource, SdkOptions, getSdk } from 'balena-sdk';
import * as BalenaErrors from 'balena-errors';
import { showBalenaSetupWarning } from './views/Notifications';

export * from 'balena-sdk';
export {
  type Application as Fleet,
  type ApplicationVariable as FleetVariable
} from 'balena-sdk';

let balenaSdk: BalenaSDK;
/**
 * Returns an existing Balena SDK Client, or creates a new instance, configured with any user workspace options
 *
 * @remarks
 * In NodeJS environments, the Balena SDK manages the authentication state for itsself.
 * Once a successful login happens, the SDK can be refetched easily with the retained tokens.
 *
 * @returns BalenaSDK
 */
export const useBalenaClient = () => {
  if (!balenaSdk) {
    balenaSdk = getSdk(getSdkOpts());
  }

  return balenaSdk;
};

/**
 * Loads user and workspaces settings from the environment and returns an SdkOptions object
 * to be used for creating a BalenaSDK client
 *
 * @returns SdkOptions
 */
export const getSdkOpts = () => {
  const options: SdkOptions = {};

  const dataDirectory = settings.getBalenaSdkDataDirectory();
  if (dataDirectory) {
    options.dataDirectory = dataDirectory;
  }

  const apiUrl = settings.getBalenaSdkApiUrl();
  if (apiUrl) {
    options.apiUrl = apiUrl;
  }

  return options;
};

/**
 * Returns true if login is successful
 *
 * @param balenaSdk
 * @param authToken
 * @returns boolean
 */
export const loginWithToken = async (balenaSdk: BalenaSDK, authToken: string) => {
  await balenaSdk.auth.loginWithToken(authToken);
  return await balenaSdk.auth.isLoggedIn();
};

/**
 * Returns true if login is successful
 *
 * @param balenaSdk
 * @param email
 * @param password
 * @returns boolean
 */
export const loginWithEmailPass = async (balenaSdk: BalenaSDK, email: string, password: string) => {
  await balenaSdk.auth.login({
    email,
    password
  });
  return await balenaSdk.auth.isLoggedIn();
};

/**
 * Utility funciton which shortens a UUID to the same format displayed in Balena Web Dashboard
 * 
 * @param uuid 
 * @returns 
 */
export const shortenUUID = (uuid: string) => uuid.slice(0, 7);

export const isLoggedIn = async (balenaSdk: BalenaSDK) => await balenaSdk.auth.isLoggedIn().catch(sdkErrHandler);

export const getDevices = async (balenaSdk: BalenaSDK, fleetId: string) => await balenaSdk.models.device.getAllByApplication(fleetId).catch(sdkErrHandler);
export const getDeviceById = async (balenaSdk: BalenaSDK, deviceId: string | number) => await balenaSdk.models.device.get(deviceId).catch(sdkErrHandler);
export const getDeviceIds = async (balenaSdk: BalenaSDK, fleetId: string) => await balenaSdk.models.device.getAllByApplication(fleetId, { $select: ["device_name", "uuid"] }).catch(sdkErrHandler);
export const getDeviceEnvVariables = async (balenaSdk: BalenaSDK, deviceId: string | number) => await balenaSdk.models.device.envVar.getAllByDevice(deviceId).catch(sdkErrHandler);
export const getDeviceConfigVariables = async (balenaSdk: BalenaSDK, deviceId: string | number) => await balenaSdk.models.device.configVar.getAllByDevice(deviceId).catch(sdkErrHandler);
export const getDeviceWithServices = async (balenaSdk: BalenaSDK, deviceId: string | number) => await balenaSdk.models.device.getWithServiceDetails(deviceId).catch(sdkErrHandler);
export const getDeviceType = async (balenaSdk: BalenaSDK, isOfDeviceType: NavigationResource<DeviceType>) => {
  // Get the device type id from private members
  const deviceTypeId = Object.values(isOfDeviceType)[0];
  return await balenaSdk.models.deviceType.get(deviceTypeId).catch(sdkErrHandler);
};


export const getFleets = async (balenaSdk: BalenaSDK) => await balenaSdk.models.application.getAllDirectlyAccessible({ $select: ["slug"] }).catch(sdkErrHandler);
export const getFleetById = async (balenaSdk: BalenaSDK, fleetId: string | number) => await balenaSdk.models.application.get(fleetId).catch(sdkErrHandler);
export const getFleetConfigVariables = async (balenaSdk: BalenaSDK, fleetId: string | number) => await balenaSdk.models.application.configVar.getAllByApplication(fleetId).catch(sdkErrHandler);
export const getFleetEnvVariables = async (balenaSdk: BalenaSDK, fleetId: string | number) => await balenaSdk.models.application.envVar.getAllByApplication(fleetId).catch(sdkErrHandler);
export const getFleetReleases = async (balenaSdk: BalenaSDK, fleetId: string | number) => await balenaSdk.models.release.getAllByApplication(fleetId).catch(sdkErrHandler);
export const getFleetReleaseById = async (balenaSdk: BalenaSDK, releaseId: string | number) => await balenaSdk.models.release.get(releaseId).catch(sdkErrHandler);
export const getFleetReleaseWithImageDetails = async (balenaSdk: BalenaSDK, releaseId: string | number) => await balenaSdk.models.release.getWithImageDetails(releaseId).catch(sdkErrHandler);
export const getFleetReleaseImage = async (balenaSdk: BalenaSDK, imageId: number) => await balenaSdk.models.image.get(imageId).catch(sdkErrHandler);
export const getFleetReleaseTags = async (balenaSdk: BalenaSDK, releaseId: string | number) => await balenaSdk.models.release.tags.getAllByRelease(releaseId).catch(sdkErrHandler);

const sdkErrHandler = async (e: BalenaErrors.BalenaError) => {
  if (e.code === BalenaErrors.BalenaRequestError.prototype.code) {
    if (e.message.includes("Invalid binding")) {
      showBalenaSetupWarning();
    }
  } else {
    throw e;
  }
};
