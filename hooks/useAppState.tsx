import {useEffect, useRef, useState} from 'react'
import {AppState, AppStateStatus} from 'react-native'

export function useAppState() {
    const currentState = useRef(AppState.currentState)
    const [appState, setAppState] = useState<AppStateStatus>(currentState.current)

    useEffect(() => {
        function onChange(newState: AppStateStatus) {
            setAppState(newState)
        }

        const subscription = AppState.addEventListener('change', onChange)

        return () => {
            if (typeof subscription?.remove === 'function') {
                subscription.remove()
            } else {
                // React Native < 0.65
                AppState.addEventListener('change', onChange)
            }
        }
    }, [])

    return appState
}
