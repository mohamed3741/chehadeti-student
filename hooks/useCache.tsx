import React from 'react';
import {getData, storeData} from "../utils/AsyncStorage";

export const useCache = (key) => {

    const cache = async (item) => {
        try {
            const serialized = JSON.stringify(item);
            await storeData(key, serialized);
        } catch (error) {
            console.log('Error caching', error);
        }
    };


    const loadCached = async () => {
        try {
            const serialized = await getData(key);
            if (serialized) {
                return JSON.parse(serialized);
            } else {
                return []
            }
        } catch (error) {
            console.log('Error loading cached ', error);
            return []
        }
    };
    return {
        cache,
        loadCached
    }
}

