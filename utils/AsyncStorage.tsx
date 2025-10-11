import AsyncStorage from "@react-native-async-storage/async-storage";
import {DataKey} from "../models/Static";

export const storeData = async (key: DataKey, value: string) => {
    try {
        await AsyncStorage.setItem(key, value)
    } catch (e) {
        // saving error
        console.log('saving',e)
    }
};

export const getData = async (key: DataKey) => {
    try {
        return await AsyncStorage.getItem(key);
    } catch(e) {
        // error reading value
        console.log('reading',e)
    }
};

export const clearData = async () => {
    try {
        await AsyncStorage.clear();
    } catch(e) {
        // error reading value
        console.log('clearing',e)
    }
};

export const clearSingleData = async (key: DataKey) => {
    try {
        await AsyncStorage.removeItem(key);
    } catch(e) {
        // error reading value
        console.log('clearing',e)
    }
};
