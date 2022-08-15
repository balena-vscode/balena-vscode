import { BalenaSDK } from "balena-sdk";

export const getDevices = async (balenaSdk: BalenaSDK) => await balenaSdk.models.device.getAll();

export const getDevicesWithComputedStatus = async (balenaSdk: BalenaSDK) =>
    await balenaSdk.models.device.getAll({
        $select: [
            'overall_status',
            'overall_progress'
        ]
    });
