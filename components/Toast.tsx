import { Platform, ToastAndroid, Alert } from 'react-native';

export const Toast = (message: string, duration: number = 3000) => {
    if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
        Alert.alert('', message);
    }
};

export const showToast = Toast;

