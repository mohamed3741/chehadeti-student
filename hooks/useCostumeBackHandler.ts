import { ParamListBase, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { DependencyList, useEffect } from 'react';
import { BackHandler } from 'react-native';

export function useCostumeBackHandler<
    ParamList extends ParamListBase,
    RouteName extends keyof ParamList & string
    >(onGoBackCallback: () => boolean | null | undefined, deps?: DependencyList) {
    const navigation = useNavigation<StackNavigationProp<ParamList, RouteName>>();

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', onGoBackCallback);
        navigation.addListener('gestureEnd', onGoBackCallback);

        return () => {
            backHandler.remove();
            navigation.removeListener('gestureEnd', onGoBackCallback);
        };
    }, [navigation, onGoBackCallback, deps]);
}
