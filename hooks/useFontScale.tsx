import { useState, useEffect } from 'react';
import { PixelRatio, AppState } from 'react-native';

export function useFontScale() {
    const [fontScale, setFontScale] = useState(PixelRatio.getFontScale());

    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
        };
    }, [fontScale]);

    const handleAppStateChange = (nextAppState) => {
        if (nextAppState === 'active') {
            const currentFontScale = PixelRatio.getFontScale();
            if (currentFontScale !== fontScale) {
                setFontScale(currentFontScale);
            }
        }
    };

    return fontScale;
}
