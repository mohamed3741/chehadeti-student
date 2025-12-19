import React, {useEffect, useRef, useState} from 'react';
import {DarkTheme, DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import LinkingConfiguration from './LinkingConfiguration';
import LoginScreen from "../screens/auth/LoginScreen";
import SignupScreen from "../screens/auth/SignupScreen";
import {navigationRef} from "../utils/CustomeNavigate";
import {useAuth} from "../hooks/useAuth";
import {Host} from 'react-native-portalize';
import HomeScreen from "../screens/school/HomeScreen";
import CourseDetailScreen from "../screens/school/CourseDetailScreen";
import ChapterDetailScreen from "../screens/school/ChapterDetailScreen";
import SubsectionContentsScreen from "../screens/school/SubsectionContentsScreen";
import ContentViewerScreen from "../screens/school/ContentViewerScreen";
import ProfileScreen from "../screens/school/ProfileScreen";
import SettingsScreen from "../screens/school/SettingsScreen";
import AboutScreen from "../screens/school/AboutScreen";
import EditPasswordScreen from "../screens/school/EditPasswordScreen";


export default function Navigation({colorScheme}) {
    const {connectedUser, token} = useAuth();
    const [sessionOpened, setSessionOpened] = useState(false);
    const navigationReadyRef = useRef(false);


    useEffect(() => {
        const newSessionOpened = Boolean(token);
        setSessionOpened(newSessionOpened);
    }, [token]);

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
                {sessionOpened ? <RootNavigator/> : <AuthNavigator/>}
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
            <Stack.Screen name="Root" component={HomeScreen}/>
            <Stack.Screen name="Home" component={HomeScreen}/>
            <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
            <Stack.Screen name="ChapterDetail" component={ChapterDetailScreen} />
            <Stack.Screen name="SubsectionContents" component={SubsectionContentsScreen} />
            <Stack.Screen name="ContentViewer" component={ContentViewerScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="EditPassword" component={EditPasswordScreen} />
        </Stack.Navigator>
    );
}
