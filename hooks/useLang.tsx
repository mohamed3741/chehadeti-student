import {getData} from "../utils/AsyncStorage";
import {DataKey, LangEnum} from "../models/Static";
import {useEffect, useState} from "react";

export const useLang = () => {
    const [currentLang, setCurrentLang] = useState<LangEnum | string>();
    const [currentLangCode, setCurrentLangCode] = useState<'ar' | 'en-gb' | 'ur'>('ar');
    const [isFr, setIsFr] = useState<boolean>(false);
    const [isAr, setIsAr] = useState<boolean>(false);
    const [isEn, setIsEn] = useState<boolean>(false);
    const [isUr, setIsUr] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            const storedLang = await getData(DataKey.currentLang)
            setCurrentLang(storedLang ? storedLang : LangEnum.en_EN);
        })()
    }, [])

    useEffect(() => {
        if (currentLang) {
            switch (currentLang) {
                case LangEnum.en_EN:
                    setIsEn(currentLang === LangEnum.en_EN);
                    setCurrentLangCode('en-gb'); break;
                case LangEnum.ar_AR:
                    setIsAr(currentLang === LangEnum.ar_AR);
                    setCurrentLangCode('ar'); break;
                case LangEnum.fr_FR:
                    setIsFr(currentLang === LangEnum.fr_FR);
                    break;
                case LangEnum.ur_UR:
                    setIsUr(currentLang === LangEnum.ur_UR);
                    setCurrentLangCode('ur'); break;
                    break;
            }
        }
    }, [currentLang]);

    const currentLangApiEnum = async () => {
        const storedLang = await getData(DataKey.currentLang) as LangEnum
        switch (storedLang) {
            case LangEnum.ar_AR:
                return 'AR'
            case LangEnum.ur_UR:
                return 'UR'
            case LangEnum.en_EN:
                return 'EN'
            default:
                return 'AR'
        }
    }

    const convertINTLName = (model, field = 'name') => {
        if (!model) return ''
        let defaultVal = model[`${field}`];
        switch (currentLang) {
            case LangEnum.ar_AR:
                return model[`${field}Ar`] ? model[`${field}Ar`] : defaultVal;
            case LangEnum.ur_UR:
                return model[`${field}Ur`] ? model[`${field}Ur`] : defaultVal;
            default:
                return defaultVal
        }
    }

    const rightDisplayKey = (field = 'name') => {
        switch (currentLang) {
            case LangEnum.ar_AR:
                return `${field}Ar`;
            case LangEnum.ur_UR:
                return `${field}Ur`;
            default:
                return field
        }
    }

    return {
        currentLang,
        setCurrentLang,
        currentLangCode,
        isAr,
        isEn,
        isFr,
        isUr,
        currentLangApiEnum,
        convertINTLName,
        rightDisplayKey
    }
}
