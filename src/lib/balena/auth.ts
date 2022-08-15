import { BalenaSDK } from "balena-sdk";

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
}

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
        email: email,
        password: password
    });
    return await balenaSdk.auth.isLoggedIn();
}

export const isLoggedIn = async (balenaSdk: BalenaSDK) => await balenaSdk.auth.isLoggedIn() 