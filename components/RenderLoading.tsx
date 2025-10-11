import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Image } from 'react-native';
import { useLoader } from '../hooks/useLoader';

export default function RenderLoading() {
    const { isLoading } = useLoader();

    return isLoading ? (
        <View style={styles.container} accessible accessibilityLabel="Loading, please wait">
            <ActivityIndicator size="large" color="#fff" style={styles.indicator} />
        </View>
    ) : null;
}

const styles = StyleSheet.create({
    container: {
        zIndex: 999999999,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    indicator: {
        marginBottom: 20,
    }
});