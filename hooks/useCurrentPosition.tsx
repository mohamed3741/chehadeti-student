import {
    getCurrentPositionAsync,
    getForegroundPermissionsAsync,
    LocationAccuracy,
    requestForegroundPermissionsAsync,
    reverseGeocodeAsync,
    setGoogleApiKey,
} from "expo-location";
import { LatLng } from "react-native-maps";
import Environement from "../constants/Environement";
import { Alert, Linking } from "react-native";
import { useAuth } from "./useAuth";


export const useCurrentPosition = (mapRef?: any) => {
    const { logOut } = useAuth();

    const handlePermissionRequest = async (): Promise<boolean> => {
        let existingFgPermission = await getForegroundPermissionsAsync();
        if (existingFgPermission.status !== 'granted') {
            let { status } = await requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                return false;
            }
        }
        return true;
    };


    const getCurrentPosition = async (isAnimate?: boolean): Promise<LatLng | undefined> => {
        try {
            let permissionGranted = await handlePermissionRequest();
            if (!permissionGranted) {
                Alert.alert("Location Permission Required", "We need access to your location. Please go to settings and allow location access.", [{
                    text: 'Cancel', style: 'cancel', onPress: () => logOut()
                }, {
                    text: 'Settings', onPress: () => Linking.openSettings()
                },],);
                return;
            }

            let location = await getLoc(isAnimate, mapRef);
            return location;
        } catch (error) {
            console.error('Error while getting current position:', error);
        }
    };

    const getLoc = async (isAnimate?: boolean, mapRef?: any): Promise<LatLng | undefined> => {
        try {
            const location = await getCurrentPositionAsync({ accuracy: LocationAccuracy.Balanced });
            if (isAnimate && mapRef?.current) {
                mapRef.current.animateToRegion({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.09,
                    longitudeDelta: 0.09
                }, 2000);
            }
            return location.coords;
        } catch (error) {
            console.error('Error while fetching location:', error);
        }
    };

    return {
        getCurrentPosition,
    };
};

