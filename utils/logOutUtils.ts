import {clearData, getData, storeData} from "./AsyncStorage";
import {DataKey} from "../models/Static";
import Fire from "./Fire";
import {clearSecureData} from "./SecureStorage";

export const logOutUser = async (updateIsSkippedFunction, performLogoutFunction) => {

    Fire.shared.reinitialize();
    const currentLang = await getData(DataKey.ChehadetiLanguage)
    await clearData();
    await clearSecureData(DataKey.token);
    await unSkip(updateIsSkippedFunction);
    if (currentLang) {
        await storeData(DataKey.ChehadetiLanguage, currentLang)
    }
    performLogoutFunction();
};

const unSkip = async (updateIsSkippedFunction) => {
    await storeData(DataKey.isSkipped, 'false');
    if (updateIsSkippedFunction) {
        updateIsSkippedFunction(false);
    }
};

