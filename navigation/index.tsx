import React, {useEffect, useRef, useState} from 'react';
import {DarkTheme, DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import LinkingConfiguration from './LinkingConfiguration';
import LoginScreen from "../screens/auth/LoginScreen";
import SignupScreen from "../screens/auth/SignupScreen";
import {navigationRef} from "../utils/CustomeNavigate";
import useCachedResources from "../hooks/useCachedResources";
import {useAuth} from "../hooks/useAuth";
import {Host} from 'react-native-portalize';
import HomeAdminScreen from "../screens/school/HomeAdminScreen";


export default function Navigation({colorScheme}) {
    const {connectedUser, token} = useAuth();
    const [sessionOpened, setSessionOpened] = useState(false);
    const isLoadingComplete = useCachedResources();
    const navigationReadyRef = useRef(false);


    useEffect(() => {
        if (isLoadingComplete) {
            setSessionOpened(Boolean(token));
        }
    }, [token, isLoadingComplete]);

    return (
        <Host>
            <NavigationContainer
                ref={navigationRef}
                onReady={() => {
                    navigationReadyRef.current = true;
                }}
                linking={LinkingConfiguration}
                theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
            >
                {isLoadingComplete && (sessionOpened ? <RootNavigator/> : <AuthNavigator/>)}
            </NavigationContainer>
        </Host>
    );
}

const AuthStack = createStackNavigator();

function AuthNavigator() {
    return (
        <AuthStack.Navigator initialRouteName="Login" screenOptions={{headerShown: false}}>
            <AuthStack.Screen name="Login" component={LoginScreen}/>
            <AuthStack.Screen name="Signup" component={SignupScreen}/>
        </AuthStack.Navigator>
    );
}

const Stack = createStackNavigator();

function RootNavigator() {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="Root" component={HomeAdminScreen}/>
            <Stack.Screen name="Home" component={HomeAdminScreen}/>
        </Stack.Navigator>
    );
}
