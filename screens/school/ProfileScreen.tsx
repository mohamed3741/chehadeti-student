import React, {useState} from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Alert,
    Dimensions,
    Image,
    Linking,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {StyledText} from "../../components/StyledText";
import {FontsEnum} from "../../constants/FontsEnum";
import {useTranslation} from "react-i18next";
import {Ionicons} from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import {useAuth} from "../../hooks/useAuth";
import {LinearGradient} from "expo-linear-gradient";
import {TabHomeParamList} from "../../types";

const {width, height} = Dimensions.get('window');

type ProfileScreenNavigationProp = StackNavigationProp<TabHomeParamList, 'Profile'>;

interface ProfileScreenProps {}

const ProfileScreen: React.FC<ProfileScreenProps> = () => {
    const navigation = useNavigation<ProfileScreenNavigationProp>();
    const {t} = useTranslation();
    const {connectedUser, logOut} = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogOut = async () => {
        Alert.alert(
            t("confirmLogout") || "Confirm Logout",
            t("confirmLogoutMessage") || "Are you sure you want to logout?",
            [
                {
                    text: t("cancel") || "Cancel",
                    style: "cancel",
                },
                {
                    text: t("logout") || "Logout",
                    style: "destructive",
                    onPress: async () => {
                        setIsLoggingOut(true);
                        try {
                            await logOut();
                        } catch (error) {
                            console.error('Logout error:', error);
                            Alert.alert(t("error") || "Error", t("logoutError") || "Failed to logout. Please try again.");
                        } finally {
                            setIsLoggingOut(false);
                        }
                    },
                },
            ]
        );
    };

    const formatPhoneNumber = (phone: string) => {
        if (!phone) return '';
        // Format phone number for display
        return phone.replace(/(\+222)(\d{2})(\d{3})(\d{3})/, '$1 $2 $3 $4');
    };

    const getInitials = (firstName: string, lastName: string) => {
        const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
        const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
        return firstInitial + lastInitial;
    };

    const ProfileItem = ({icon, title, value, onPress, showArrow = false}: {
        icon: string;
        title: string;
        value?: string;
        onPress?: () => void;
        showArrow?: boolean;
    }) => (
        <TouchableOpacity 
            style={styles.profileItem} 
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            <View style={styles.profileItemLeft}>
                <View style={styles.profileItemIcon}>
                    <Ionicons name={icon as any} size={20} color={Colors.primary} />
                </View>
                <View style={styles.profileItemContent}>
                    <StyledText style={styles.profileItemTitle}>{title}</StyledText>
                    {value && <StyledText style={styles.profileItemValue}>{value}</StyledText>}
                </View>
            </View>
            {showArrow && (
                <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
            
            {/* Header */}
            <LinearGradient
                colors={[Colors.primary, '#8B5FCF']}
                style={styles.header}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
            >
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <StyledText style={styles.headerTitle}>{t("profile") || "Profile"}</StyledText>
                <View style={styles.headerRight} />
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Header Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <StyledText style={styles.avatarText}>
                                {getInitials(connectedUser?.firstName || '', connectedUser?.lastName || '')}
                            </StyledText>
                        </View>
                        <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                        </View>
                    </View>
                    
                    <StyledText style={styles.userName}>
                        {connectedUser?.firstName} {connectedUser?.lastName}
                    </StyledText>
                    
                    <StyledText style={styles.userPhone}>
                        {formatPhoneNumber(connectedUser?.tel || '')}
                    </StyledText>
                    
                    <View style={styles.statusContainer}>
                        <View style={styles.statusBadge}>
                            <Ionicons name="shield-checkmark" size={14} color="#10B981" />
                            <StyledText style={styles.statusText}>
                                {t("verified") || "Verified"}
                            </StyledText>
                        </View>
                    </View>
                </View>

                {/* Profile Information */}
                <View style={styles.section}>
                    <StyledText style={styles.sectionTitle}>{t("personalInformation") || "Personal Information"}</StyledText>
                    
                    <View style={styles.profileItemsContainer}>
                        <ProfileItem
                            icon="person-outline"
                            title={t("firstName") || "First Name"}
                            value={connectedUser?.firstName || ''}
                        />
                        <ProfileItem
                            icon="person-outline"
                            title={t("lastName") || "Last Name"}
                            value={connectedUser?.lastName || ''}
                        />
                        <ProfileItem
                            icon="call-outline"
                            title={t("phoneNumber") || "Phone Number"}
                            value={formatPhoneNumber(connectedUser?.tel || '')}
                        />
                        <ProfileItem
                            icon="mail-outline"
                            title={t("email") || "Email"}
                            value={connectedUser?.email || t("notProvided") || "Not provided"}
                        />
                    </View>
                </View>

                {/* Class Information */}
                {connectedUser?.classe && (
                    <View style={styles.section}>
                        <StyledText style={styles.sectionTitle}>{t("classInformation") || "Class Information"}</StyledText>
                        
                        <View style={styles.profileItemsContainer}>
                            <ProfileItem
                                icon="school-outline"
                                title={t("className") || "Class Name"}
                                value={connectedUser.classe.name}
                            />
                            <ProfileItem
                                icon="document-text-outline"
                                title={t("classDescription") || "Description"}
                                value={connectedUser.classe.description}
                            />
                        </View>
                    </View>
                )}

                {/* Account Information */}
                <View style={styles.section}>
                    <StyledText style={styles.sectionTitle}>{t("accountInformation") || "Account Information"}</StyledText>
                    
                    <View style={styles.profileItemsContainer}>
                        <ProfileItem
                            icon="calendar-outline"
                            title={t("memberSince") || "Member Since"}
                            value={connectedUser?.createdAt ? new Date(connectedUser.createdAt).toLocaleDateString() : ''}
                        />
                        <ProfileItem
                            icon="checkmark-circle-outline"
                            title={t("accountStatus") || "Account Status"}
                            value={connectedUser?.isTelVerified ? t("verified") : t("pendingVerification")}
                        />
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.section}>
                    <StyledText style={styles.sectionTitle}>{t("actions") || "Actions"}</StyledText>
                    
                    <View style={styles.profileItemsContainer}>
                        <ProfileItem
                            icon="settings-outline"
                            title={t("settings") || "Settings"}
                            onPress={() => navigation.navigate('Settings')}
                            showArrow={true}
                        />
                        <ProfileItem
                            icon="help-circle-outline"
                            title={t("helpAndSupport") || "Help & Support"}
                            onPress={() => {
                                Alert.alert(
                                    t("helpAndSupport") || "Help & Support",
                                    t("contactSupportMessage") || "Contact our support team",
                                    [
                                        {
                                            text: t("cancel") || "Cancel",
                                            style: "cancel",
                                        },
                                        {
                                            text: t("call") || "Call",
                                            onPress: () => {
                                                Linking.openURL('tel:+22236841098');
                                            },
                                        },
                                    ]
                                );
                            }}
                            showArrow={true}
                        />
                        <ProfileItem
                            icon="information-circle-outline"
                            title={t("about") || "About"}
                            onPress={() => navigation.navigate('About')}
                            showArrow={true}
                        />
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
                    onPress={handleLogOut}
                    activeOpacity={0.8}
                    disabled={isLoggingOut}
                >
                    <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
                    <StyledText style={styles.logoutButtonText}>
                        {isLoggingOut ? (t("loggingOut") || "Logging out...") : (t("logout") || "Logout")}
                    </StyledText>
                </TouchableOpacity>

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    headerRight: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    profileCard: {
        borderRadius: 16,
        padding: 24,
        marginTop: -10,
        marginBottom: 24,
        alignItems: 'center',
        shadowColor: '#000',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 2,
    },
    userName: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1F2937',
        fontFamily: FontsEnum.Poppins_600SemiBold,
        marginBottom: 4,
        textAlign: 'center',
    },
    userPhone: {
        fontSize: 16,
        color: '#6B7280',
        fontFamily: FontsEnum.Poppins_400Regular,
        marginBottom: 12,
        textAlign: 'center',
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#10B981',
        fontFamily: FontsEnum.Poppins_500Medium,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        fontFamily: FontsEnum.Poppins_600SemiBold,
        marginBottom: 16,
    },
    profileItemsContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    profileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    profileItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    profileItemIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    profileItemContent: {
        flex: 1,
    },
    profileItemTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
        fontFamily: FontsEnum.Poppins_500Medium,
        marginBottom: 2,
    },
    profileItemValue: {
        fontSize: 16,
        fontWeight: '400',
        color: '#1F2937',
        fontFamily: FontsEnum.Poppins_400Regular,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EF4444',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginTop: 8,
        marginBottom: 24,
        shadowColor: '#EF4444',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        gap: 8,
    },
    logoutButtonDisabled: {
        backgroundColor: '#FCA5A5',
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    bottomSpacing: {
        height: 20,
    },
});

export default ProfileScreen;
