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
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
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
import {StudentApi} from "../../api/studentApi";
import {useLoader} from "../../hooks/useLoader";
import {Toast} from "../../components/Toast";

const {width, height} = Dimensions.get('window');

type ProfileScreenNavigationProp = StackNavigationProp<TabHomeParamList, 'Profile'>;

interface ProfileScreenProps {}

const ProfileScreen: React.FC<ProfileScreenProps> = () => {
    const navigation = useNavigation<ProfileScreenNavigationProp>();
    const {t} = useTranslation();
    const {connectedUser, logOut} = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [showDeletePassword, setShowDeletePassword] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const {setLoader, removeLoader} = useLoader();

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

    const handleDeleteAccount = () => {
        Alert.alert(
            t("Delete your account") || "Delete your account",
            t("Are you sure you want to delete your account?") || "Are you sure you want to delete your account? This action cannot be undone.",
            [
                {
                    text: t("cancel") || "Cancel",
                    style: "cancel",
                },
                {
                    text: t("Delete your account") || "Delete Account",
                    style: "destructive",
                    onPress: () => {
                        setShowDeleteModal(true);
                    },
                },
            ]
        );
    };

    const confirmDeleteAccount = async () => {
        if (!deletePassword.trim()) {
            Alert.alert(
                t("error") || "Error",
                t("password required") || "Password is required"
            );
            return;
        }

        setIsDeleting(true);
        setLoader();

        try {
            const result = await StudentApi.deleteAccount(deletePassword);
            
            if (result.ok) {
                removeLoader();
                setIsDeleting(false);
                setShowDeleteModal(false);
                setDeletePassword('');
                
                Toast(t("Your account deleted successfully") || "Your account has been deleted successfully");
                
                // Log out the user after successful deletion
                setTimeout(async () => {
                    await logOut();
                }, 1000);
            } else {
                removeLoader();
                setIsDeleting(false);
                
                if (result.status === 401 || result.status === 403) {
                    Alert.alert(
                        t("error") || "Error",
                        t("Incorrect password") || "Incorrect password. Please try again."
                    );
                } else {
                    Alert.alert(
                        t("error") || "Error",
                        t("An error occurred while deleting your account") || "An error occurred while deleting your account. Please try again."
                    );
                }
            }
        } catch (error) {
            console.error('Delete account error:', error);
            removeLoader();
            setIsDeleting(false);
            Alert.alert(
                t("error") || "Error",
                t("An error occurred while deleting your account") || "An error occurred while deleting your account. Please try again."
            );
        }
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

                {/* Delete Account Button */}
                <TouchableOpacity
                    style={styles.deleteAccountButton}
                    onPress={handleDeleteAccount}
                    activeOpacity={0.8}
                >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    <StyledText style={styles.deleteAccountButtonText}>
                        {t("Delete your account") || "Delete Account"}
                    </StyledText>
                </TouchableOpacity>

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

            {/* Delete Account Password Modal */}
            <Modal
                visible={showDeleteModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => {
                    if (!isDeleting) {
                        setShowDeleteModal(false);
                        setDeletePassword('');
                    }
                }}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalContainer}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <StyledText style={styles.modalTitle}>
                                    {t("Delete your account") || "Delete Account"}
                                </StyledText>
                                <TouchableOpacity
                                    onPress={() => {
                                        if (!isDeleting) {
                                            setShowDeleteModal(false);
                                            setDeletePassword('');
                                        }
                                    }}
                                    disabled={isDeleting}
                                >
                                    <Ionicons name="close" size={24} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            <StyledText style={styles.modalDescription}>
                                {t("Are you sure you want to delete your account?") || "Are you sure you want to delete your account? This action cannot be undone. Please enter your password to confirm."}
                            </StyledText>

                            <View style={styles.passwordInputContainer}>
                                <StyledText style={styles.passwordLabel}>
                                    {t("password") || "Password"}
                                </StyledText>
                                <View style={styles.passwordInputWrapper}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        value={deletePassword}
                                        onChangeText={setDeletePassword}
                                        placeholder={t("enterPassword") || "Enter your password"}
                                        placeholderTextColor="#9CA3AF"
                                        secureTextEntry={!showDeletePassword}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        editable={!isDeleting}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeButton}
                                        onPress={() => setShowDeletePassword(!showDeletePassword)}
                                        disabled={isDeleting}
                                    >
                                        <Ionicons
                                            name={showDeletePassword ? "eye-off-outline" : "eye-outline"}
                                            size={20}
                                            color="#6B7280"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalCancelButton, isDeleting && styles.modalButtonDisabled]}
                                    onPress={() => {
                                        if (!isDeleting) {
                                            setShowDeleteModal(false);
                                            setDeletePassword('');
                                        }
                                    }}
                                    disabled={isDeleting}
                                >
                                    <StyledText style={styles.modalCancelButtonText}>
                                        {t("cancel") || "Cancel"}
                                    </StyledText>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalDeleteButton, isDeleting && styles.modalButtonDisabled]}
                                    onPress={confirmDeleteAccount}
                                    disabled={isDeleting}
                                >
                                    <StyledText style={styles.modalDeleteButtonText}>
                                        {isDeleting ? (t("saving") || "Deleting...") : (t("Delete your account") || "Delete Account")}
                                    </StyledText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
    deleteAccountButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#EF4444',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginTop: 8,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        gap: 8,
    },
    deleteAccountButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EF4444',
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    modalContainer: {
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    modalDescription: {
        fontSize: 14,
        color: '#6B7280',
        fontFamily: FontsEnum.Poppins_400Regular,
        marginBottom: 24,
        lineHeight: 20,
    },
    passwordInputContainer: {
        marginBottom: 24,
    },
    passwordLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        fontFamily: FontsEnum.Poppins_500Medium,
        marginBottom: 8,
    },
    passwordInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    passwordInput: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        fontFamily: FontsEnum.Poppins_400Regular,
        paddingRight: 12,
    },
    eyeButton: {
        padding: 4,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalCancelButton: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    modalCancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    modalDeleteButton: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: '#EF4444',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalDeleteButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    modalButtonDisabled: {
        opacity: 0.6,
    },
});

export default ProfileScreen;
