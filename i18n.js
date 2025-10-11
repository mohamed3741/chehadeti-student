import * as Localization from 'expo-localization'
import {Platform} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import i18n from 'i18n-js'
import {en} from './translations/en'
import {fr} from './translations/fr'
import {ar} from './translations/ar'


i18n.initAsync = async () => {
    i18n.fallbacks = true
    i18n.translations = {fr, en, ar}
    // i18n.locale = 'km'
    if (Platform.OS === 'android') {
        const lang = await AsyncStorage.getItem('medrasti-language')
        i18n.locale = lang || 'ar'
    } else {
        i18n.locale = Localization.getLocales()
    }
}

export default i18n
