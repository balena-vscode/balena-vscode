import * as notifications from './views/notifications';
import { getAuthenticatedSdkFromCache, getSdkOpts } from "./lib/balena";

export const loginToBalenaCloud = async () => {
    const balena = await getAuthenticatedSdkFromCache();

    console.log(getSdkOpts())

    balena.models.device.getAll().then((devices: any) => {
        console.log(devices);
        const online = devices.filter((d: any) => d.is_online);
        const offline = devices.filter((d: any) => !d.is_online);
        notifications.infoMsg(`Success! ${devices.length} devices found: ${online.length} online / ${offline.length} offline`)
    })
}