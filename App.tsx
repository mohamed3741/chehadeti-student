import 'react-native-gesture-handler';
import {StatusBar} from 'expo-status-bar';
import React, {useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Text} from 'react-native';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import Store from './store/Store'
import {AppRegistry} from "react-native";
import 'moment/locale/fr';
import moment from 'moment';
import {GestureHandlerRootView} from "react-native-gesture-handler";
import './utils/CostmeMomentAr'
import 'moment/locale/en-gb';
import 'moment/locale/ur';

import {getData} from "./utils/AsyncStorage";
import {DataKey} from "./models/Static";
import {useAppNetInfo} from "./hooks/useAppNetInfo";
import * as SplashScreen from "expo-splash-screen";
import {ActionSheetProvider} from "@expo/react-native-action-sheet";
import {initI18n} from "./i18next";
import useCachedResources from './hooks/useCachedResources';


export default App;

function App() {
    useAppNetInfo(true);
    moment.relativeTimeThreshold('ss', 0);

    useEffect(() => {
        (async () => {
            try {
                await SplashScreen.preventAutoHideAsync();
                const currentLang = await getData(DataKey.currentLang)
                await initI18n();
            } catch (error) {
                console.warn('Error in App initialization:', error);
            }
        })()
    }, []);

    const colorScheme = useColorScheme();

    return (
        <ActionSheetProvider>
            <GestureHandlerRootView style={{flex: 1}}>
                <SafeAreaProvider style={{backgroundColor: '#FFF'}}>
                    <Store>
                        <AppContent colorScheme={colorScheme}/>
                    </Store>
                </SafeAreaProvider>
            </GestureHandlerRootView>
        </ActionSheetProvider>
    );

}

function AppContent({colorScheme}) {
    const isLoadingComplete = useCachedResources();
    

    if (!isLoadingComplete) {
        return (
            <SafeAreaProvider style={{flex: 1, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{fontSize: 18, color: '#333'}}>Loading app...</Text>
            </SafeAreaProvider>
        );
    }
    

    return (
        <>
            <Navigation colorScheme={colorScheme}/>
            <StatusBar backgroundColor='black'/>
        </>
    );
}

AppRegistry.registerComponent('MarsaRide', () => App);
