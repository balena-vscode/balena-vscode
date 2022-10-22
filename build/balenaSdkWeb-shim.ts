// [1] Inject non-null window object for BalenaSDK to detect it is in a broswer environment while inside a ServiceWorker.
// While setting the 'isBrowser' flag is an option, it is not propogated through the rest of the library 
// and other browser detection logic exists, which conflicts with the isBrowser flag setting.
//
// [2] Inject an AbortController polyfill to make Logs stream subscription happy. For some reason, 
// the "abort-controller/dist/cjs-ponyfill" does not satisfy request in the ServiceWorker env, 
// so we bring our own polyfill library instead. Otherwise it errors with: 
// "TypeError: Failed to execute 'fetch' on 'WorkerGlobalScope': Failed to read the 'signal' property from 'RequestInit': Failed to convert value to 'AbortSignal'."
//
// [1] https://github.com/balena-io/balena-sdk/blob/c0877db26efbde5907d6b322e58c21570c6adc35/lib/index.ts#L210
// [2] https://github.com/balena-io/balena-sdk/blob/c0877db26efbde5907d6b322e58c21570c6adc35/lib/logs.ts#L94
import AbortController from 'abort-controller';
export let window = {
    AbortController
};