import * as SecureStore from 'expo-secure-store';

export const storeSecureData = async (key: string, value: string) => {
    try {
        await SecureStore.setItemAsync(key, value)
    } catch (e) {
        // saving error
        console.log('saving',e)
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
