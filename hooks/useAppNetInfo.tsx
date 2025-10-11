import {useEffect, useState} from "react";
import NetInfo from '@react-native-community/netinfo';
import * as Network from 'expo-network';

export const useAppNetInfo = (initListener = false) => {
    const [isInternetReachable, setIsInternetReachable] = useState(true);

    useEffect(() => {
        let unsubscribe
        if (initListener)
            unsubscribe = NetInfo.addEventListener(state => {
                setIsInternetReachable(state.isConnected && state.isInternetReachable)
            });

        return () => {
            if (unsubscribe)
                unsubscribe();
        };
    }, [initListener]);

    const checkNetwork = async () => {
        const networkState = await Network.getNetworkStateAsync();
        const reachable = networkState.isConnected && networkState.isInternetReachable
        setIsInternetReachable(reachable)
        return reachable
    }

    return {
        checkNetwork,
        isInternetReachable
    }
}
