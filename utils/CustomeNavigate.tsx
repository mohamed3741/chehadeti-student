import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();
export const isReadyRef = { current: false };

export function navigate(name, params) {
    if (isReadyRef.current && navigationRef.current) {
        console.log(`Navigating to ${name} with params`, params);
        // @ts-ignore
        navigationRef.current.navigate(name, params);
    } else {
        console.warn("Navigation not ready - navigation attempt ignored");
    }
}
