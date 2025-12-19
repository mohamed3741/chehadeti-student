import * as SplashScreen from 'expo-splash-screen';
import {useEffect, useState} from 'react';
import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    useFonts
} from "@expo-google-fonts/poppins";
import {useAuth} from "./useAuth";
import * as Updates from 'expo-updates';
import Constants from "expo-constants";

export default function useCachedResources() {
    const [isLoadingComplete, setLoadingComplete] = useState(false);
    let [fontsLoaded] = useFonts({
        Poppins_700Bold,
        Poppins_400Regular,
        Poppins_600SemiBold,
        Poppins_500Medium,
        Poppins_300Light
    });
    const {refreshUser} = useAuth();


    // Load any resources or data that we need prior to rendering the app
    useEffect(() => {
        (async () => {
            try {
                // Only check for updates in production builds, not in development
                const isDev = typeof __DEV__ !== 'undefined' && __DEV__;
                if (Constants.appOwnership !== 'expo' && !isDev) {
                    try {
                        const update = await Updates.checkForUpdateAsync();
                        if (update.isAvailable) {
                            await Updates.fetchUpdateAsync();
                            // ... notify user of update ...
                            await Updates.reloadAsync();
                        }
                    } catch (updateError) {
                        // Silently handle update errors in development
                        if (isDev) {
                            console.log('Update check skipped in development mode');
                        } else {
                            console.warn('Error checking for updates:', updateError);
                        }
                    }
                }

                await refreshUser();

            } catch (e) {
                // We might want to provide this error information to an error reporting service
                console.warn('Error in useCachedResources:', e);
            } finally {
                // Ensure splash screen is hidden
                console.log('useCachedResources - Setting loading complete to true');
                await SplashScreen.hideAsync().catch(reason => console.log('Error hiding splash screen:', reason));
                setLoadingComplete(true);
            }
        })()
    }, []);

    return isLoadingComplete && fontsLoaded;
}
