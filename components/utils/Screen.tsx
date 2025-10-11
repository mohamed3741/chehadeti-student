import * as React from 'react';
import {Platform, SafeAreaView, StyleSheet, View} from "react-native"
import Constants from "expo-constants";
import {SafeAreaViewProps} from "react-native-safe-area-context";
import {useBottomTabBarHeight} from "@react-navigation/bottom-tabs";
import {KeyboardAvoidingWrapper} from "../KeyboardAvoidingWrapper";

function Screen(props: SafeAreaViewProps) {
    let tabHeight;
    try {
        tabHeight = useBottomTabBarHeight();
    } catch (e) {
        tabHeight = 0;
    }

    const {style, ...otherProps} = props;
    return <SafeAreaView style={[styles.screen, style]} {...otherProps}>
        {Platform.OS === 'ios' ? <KeyboardAvoidingWrapper>
            <View>
                {props.children}
            </View>
        </KeyboardAvoidingWrapper> : props.children}
    </SafeAreaView>;
}

const styles = StyleSheet.create({
    screen: {
        paddingTop: Constants.statusBarHeight,
        flex: 1,
        backgroundColor: '#fff'
    }
});

export default Screen;
