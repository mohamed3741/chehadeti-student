import React, {useState, useEffect} from 'react';
import {Linking, Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../hooks/useAuth';
import {StyledText} from "../../components/StyledText";
import {FontsEnum} from "../../constants/FontsEnum";
import {useTranslation} from "react-i18next";
import {Ionicons} from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import {LinearGradient} from "expo-linear-gradient";


const HomeScreen = () => {
    const navigation = useNavigation();
    const {connectedUser, logOut} = useAuth();
    const {t} = useTranslation();
    const [isModalVisible, setIsModalVisible] = useState(false);
    console.log('connectedUser', connectedUser);
    const [showVerificationModal, setShowVerificationModal] = useState(false);

    // Check if user is verified
    useEffect(() => {
        if (connectedUser && (connectedUser.isTelVerified === false || connectedUser.isTelVerified === null)) {
            setShowVerificationModal(true);
        } else {
            setShowVerificationModal(false);
        }
    }, [connectedUser]);

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

    const handleVerificationModalClose = async () => {
        setShowVerificationModal(false);
        await logOut();
    };

    return (
        <View style={{flex: 1}}>
            <Modal
                visible={showVerificationModal}
                transparent
                animationType="fade"
                onRequestClose={handleVerificationModalClose}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIconContainer}>
                            <View style={styles.pendingIconWrapper}>
                                <Ionicons name="time-outline" size={80} color={Colors.primary} />
                            </View>
                        </View>

                        <StyledText style={styles.modalTitle}>
                            {t('accountPendingActivation') || 'Account Pending Activation'}
                        </StyledText>

                        <StyledText style={styles.modalMessage}>
                            {t('accountPendingMessage') || 'Your account has been created successfully! Please contact the administrator to activate your account.'}
                        </StyledText>

                        <View style={styles.infoBox}>
                            <Ionicons name="information-circle-outline" size={22} color={Colors.primary} />
                            <StyledText style={styles.infoText}>
                                {t('activationNoticeMessage') || 'You will be notified once your account is activated and you can access all features.'}
                            </StyledText>
                        </View>

                        <View style={styles.contactBox}>
                            <Ionicons name="call-outline" size={20} color="#666666" />
                            <StyledText style={styles.contactText}>
                                {t('contactAdminInstruction') || 'Contact your administrator for quick activation'}
                            </StyledText>
                        </View>

                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={handleVerificationModalClose}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={[Colors.primary, '#8B5FCF']}
                                    style={styles.modalButtonGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <StyledText style={styles.modalButtonText}>
                                        {t('understood') || 'I Understand'}
                                    </StyledText>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.logoutButton}
                                onPress={handleLogOut}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                                <StyledText style={styles.logoutButtonText}>
                                    {t('logout') || 'Logout'}
                                </StyledText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 32,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 20,
    },
    modalIconContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    successIconWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pendingIconWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    modalMessage: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
        fontFamily: FontsEnum.Poppins_400Regular,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(106, 53, 193, 0.08)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        alignItems: 'flex-start',
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#374151',
        marginLeft: 12,
        lineHeight: 20,
        fontFamily: FontsEnum.Poppins_400Regular,
    },
    contactBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 10,
        padding: 14,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    contactText: {
        flex: 1,
        fontSize: 13,
        color: '#666666',
        marginLeft: 10,
        fontFamily: FontsEnum.Poppins_400Regular,
    },
    modalButton: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: Colors.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    modalButtonGradient: {
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: FontsEnum.Poppins_600SemiBold,
        marginRight: 8,
    },
    modalButtonIcon: {
        marginLeft: 4,
    },
    modalButtonsContainer: {
        gap: 12,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: '#FEE2E2',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EF4444',
        fontFamily: FontsEnum.Poppins_600SemiBold,
        marginLeft: 8,
    },

});

export default HomeScreen;
