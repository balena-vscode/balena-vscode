import { BalenaSDK } from 'balena-sdk';

export const getFleets = async (balenaSdk: BalenaSDK) => await balenaSdk.models.application.getAllDirectlyAccessible({$select: ["slug"]});
export const getFleetById = async (balenaSdk: BalenaSDK, fleetId: string | number) => await balenaSdk.models.application.get(fleetId);
export const getFleetConfigVariables = async (balenaSdk: BalenaSDK, fleetId: string | number) => await balenaSdk.models.application.configVar.getAllByApplication(fleetId);
export const getFleetEnvVariables = async (balenaSdk: BalenaSDK, fleetId: string | number) => await balenaSdk.models.application.envVar.getAllByApplication(fleetId);
export const getFleetReleases = async (balenaSdk: BalenaSDK, fleetId: string | number) => await balenaSdk.models.release.getAllByApplication(fleetId);
export const getFleetReleaseById = async (balenaSdk: BalenaSDK, releaseId: string | number) => await balenaSdk.models.release.get(releaseId);
export const getFleetReleaseWithImageDetails = async (balenaSdk: BalenaSDK, releaseId: string | number) => await balenaSdk.models.release.getWithImageDetails(releaseId); 
export const getFleetReleaseImage = async (balenaSdk: BalenaSDK, imageId: number) => await balenaSdk.models.image.get(imageId);
export const getFleetReleaseTags = async (balenaSdk: BalenaSDK, releaseId: string | number) => await balenaSdk.models.release.tags.getAllByRelease(releaseId);
