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
import {makeId} from "./utils/functionHelpers";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import './utils/CostmeMomentAr'
import 'moment/locale/en-gb';
import 'moment/locale/ur';

import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    useFonts
} from "@expo-google-fonts/poppins";
import {getData} from "./utils/AsyncStorage";
import {DataKey} from "./models/Static";
import {useAppNetInfo} from "./hooks/useAppNetInfo";
import * as SplashScreen from "expo-splash-screen";
import {ActionSheetProvider} from "@expo/react-native-action-sheet";
import {initI18n} from "./i18next";
import useCachedResources from './hooks/useCachedResources';


export default App;

function App() {
    const {isInternetReachable, checkNetwork} = useAppNetInfo(true);

    let [fontsLoaded] = useFonts({
        Poppins_700Bold,
        Poppins_400Regular,
        Poppins_600SemiBold,
        Poppins_500Medium,
        Poppins_300Light
    });



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
    
    if (!fontsLoaded) {
        console.log('App - Fonts not loaded yet, showing loading');
        return (
            <SafeAreaProvider style={{flex: 1, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{fontSize: 18, color: '#333'}}>Loading fonts...</Text>
            </SafeAreaProvider>
        );
    }

    return (
        <ActionSheetProvider>
            <GestureHandlerRootView style={{flex: 1}}>
                <SafeAreaProvider style={{backgroundColor: '#FFF'}} key={makeId()}>
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
    
    console.log('AppContent - isLoadingComplete:', isLoadingComplete);
    
    if (!isLoadingComplete) {
        console.log('AppContent - Still loading, showing loading screen');
        return (
            <SafeAreaProvider style={{flex: 1, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{fontSize: 18, color: '#333'}}>Loading app...</Text>
            </SafeAreaProvider>
        );
    }
    
    console.log('AppContent - Loading complete, rendering Navigation');
    
    return (
        <>
            <Navigation colorScheme={colorScheme}/>
            <StatusBar backgroundColor='black'/>
        </>
    );
}

AppRegistry.registerComponent('MarsaRide', () => App);
