import * as SecureStore from 'expo-secure-store';

type SecureValue = string | number | boolean | object | null | undefined;

export const storeSecureData = async (key: string, value: SecureValue) => {
    try {
        if (value === null || typeof value === 'undefined') {
            await SecureStore.deleteItemAsync(key);
            return;
        }

        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        if (typeof stringValue === 'undefined') {
            throw new Error(`Unable to stringify secure value for key: ${key}`);
        }

        await SecureStore.setItemAsync(key, stringValue);
    } catch (e) {
        // saving error
        console.log('saving', e);
    }
};

export const getSecureData = async (key: string) => {
    try {
        return await SecureStore.getItemAsync(key);
    } catch(e) {
        // error reading value
        console.log('reading',e)
    }
};

export const clearSecureData = async (key: string) => {
    try {
        await SecureStore.deleteItemAsync(key);
    } catch(e) {
        // error reading value
        console.log('clearing',e)
    }
};
