// i18next.js
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

import { en } from './translations/en';
import { fr } from './translations/fr';
import { ar } from './translations/ar';

export const languageResources = {
    en: { translation: en },
    fr: { translation: fr },
    ar: { translation: ar },
};

const SUPPORTED = Object.keys(languageResources);
const STORAGE_KEY = 'medrasti-language';

function pickFromDevice() {
    try {
        const locales = typeof Localization.getLocales === 'function' ? Localization.getLocales() : [];
        const code = locales?.[0]?.languageCode;
        if (code && SUPPORTED.includes(code)) return code;

        const tag = Localization?.locale;
        if (typeof tag === 'string') {
            const short = tag.split('-')[0];
            if (SUPPORTED.includes(short)) return short;
        }
    } catch {}
    return 'en';
}

async function getInitialLanguage() {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored && SUPPORTED.includes(stored)) return stored;
    } catch {}
    return pickFromDevice();
}

// Keep app layout LTR globally; do NOT flip on RTL languages
async function ensureLayoutLTR() {
    if (I18nManager.isRTL) {
        I18nManager.allowRTL(false);
        I18nManager.forceRTL(false);
    }
}

// Public API to change + persist language
export async function setAppLanguage(code) {
    const lang = SUPPORTED.includes(code) ? code : 'en';
    await AsyncStorage.setItem(STORAGE_KEY, lang);
    await i18next.changeLanguage(lang);
}

export async function initI18n() {
    const lng = await getInitialLanguage();
    await ensureLayoutLTR();

    if (!i18next.isInitialized) {
        await i18next
            .use(initReactI18next)
            .init({
                compatibilityJSON: 'v3',
                resources: languageResources,
                lng,
                fallbackLng: 'en',
                interpolation: { escapeValue: false },
                returnNull: false,
                initImmediate: false,
                react: { useSuspense: false },
            });
    } else if (i18next.language !== lng) {
        await i18next.changeLanguage(lng);
    }

    // Persist any programmatic changes
    i18next.off('languageChanged');
    i18next.on('languageChanged', async (code) => {
        try {
            if (SUPPORTED.includes(code)) {
                await AsyncStorage.setItem(STORAGE_KEY, code);
            }
        } catch {}
    });

    return i18next;
}

export default i18next;

export const writingDir = (lang = i18next.language) => (lang === 'ar' ? 'rtl' : 'ltr');
export const textAlignFor = (lang = i18next.language) => (lang === 'ar' ? 'right' : 'left');
