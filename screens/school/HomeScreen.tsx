import React, {useState} from 'react';
import {Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../hooks/useAuth';
import {StyledText} from "../../components/StyledText";
import {FontsEnum} from "../../constants/FontsEnum";
import {useTranslation} from "react-i18next";


const HomeScreen = () => {
    const navigation = useNavigation();
    const {connectedUser, logOut} = useAuth();
    const {t} = useTranslation();
    const [isModalVisible, setIsModalVisible] = useState(false);
    console.log('connectedUser', connectedUser);

    const handleLogOut = async () => {
        await logOut();
        setIsModalVisible(false);
    };

    const confirmLogout = () => setIsModalVisible(true);


    const renderFooter = () => (
        <TouchableOpacity
            style={styles.digiWaveContainer}
            activeOpacity={0.7}
            onPress={() => Linking.openURL("https://www.digiwave-tech.com")}
        >
            <StyledText style={styles.digiWaveText}>
                {t("developed_by")} <StyledText style={styles.digiWaveHighlight}>Digi Wave</StyledText>
            </StyledText>
        </TouchableOpacity>
    );

    const renderIconItem = ({item}: { item: { key: string; icon: React.ReactNode; screen: string } }) => (
        <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => {
                if (item.screen === "Logout") {
                    confirmLogout();
                } else {
                    // @ts-ignore
                    navigation.navigate(item.screen);
                }
            }}
        >
            {item.icon}
            <Text style={styles.iconLabel}>{t(item.key)}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={{flex: 1}}>


        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    iconGrid: {
        alignItems: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 100,
        height: 100,
        margin: 10,
        borderRadius: 15,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 5},
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    iconLabel: {
        marginTop: 8,
        textAlign: 'center',
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    modalMessage: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#E0E0E0',
    },
    confirmButton: {
        backgroundColor: '#FF3B30',
    },
    cancelButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    digiWaveContainer: {
        marginTop: 15,
        alignItems: "center",
    },

    digiWaveText: {
        fontSize: 12,
        color: "#888888",
        fontFamily: FontsEnum.Poppins_400Regular,
    },

    digiWaveHighlight: {
        color: "#4A90E2",
        fontFamily: FontsEnum.Poppins_500Medium,
        textDecorationLine: "underline",
    },

});

export default HomeScreen;
