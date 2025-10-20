import React, {useState} from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Alert,
    TextInput,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {StyledText} from "../../components/StyledText";
import {FontsEnum} from "../../constants/FontsEnum";
import {useTranslation} from "react-i18next";
import {Ionicons} from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import {LinearGradient} from "expo-linear-gradient";
import {TabHomeParamList} from "../../types";

type EditPasswordScreenNavigationProp = StackNavigationProp<TabHomeParamList, 'EditPassword'>;

interface EditPasswordScreenProps {}

const EditPasswordScreen: React.FC<EditPasswordScreenProps> = () => {
    const navigation = useNavigation<EditPasswordScreenNavigationProp>();
    const {t} = useTranslation();
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validatePassword = () => {
        if (newPassword.length < 6) {
            Alert.alert(t("error") || "Error", t("passwordTooShort") || "Password must be at least 6 characters long");
            return false;
        }
        
        if (newPassword !== confirmPassword) {
            Alert.alert(t("error") || "Error", t("passwordsDoNotMatch") || "New passwords do not match");
            return false;
        }
        
        if (currentPassword === newPassword) {
            Alert.alert(t("error") || "Error", t("samePasswordError") || "New password must be different from current password");
            return false;
        }
        
        return true;
    };

    const handleSavePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert(t("error") || "Error", t("passwordChangeInstructions") || "Please enter your current password and choose a new secure password.");
            return;
        }

        if (!validatePassword()) {
            return;
        }

        setIsLoading(true);
        
        try {
            // TODO: Implement actual password change API call
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            Alert.alert(
                t("success") || "Success",
                t("passwordChangedSuccessfully") || "Password changed successfully",
                [
                    {
                        text: t("ok") || "OK",
                        onPress: () => {
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                            navigation.goBack();
                        },
                    },
                ]
            );
        } catch (error) {
            Alert.alert(t("error") || "Error", t("passwordChangeFailed") || "Failed to change password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const PasswordInput = ({label, value, onChangeText, placeholder, showPassword, onToggleShowPassword, error}: {
        label: string;
        value: string;
        onChangeText: (text: string) => void;
        placeholder: string;
        showPassword: boolean;
        onToggleShowPassword: () => void;
        error?: boolean;
    }) => (
        <View style={styles.inputContainer}>
            <StyledText style={styles.inputLabel}>{label}</StyledText>
            <View style={[styles.inputWrapper, error && styles.inputError]}>
                <TextInput
                    style={styles.textInput}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={onToggleShowPassword}
                    activeOpacity={0.7}
                >
                    <Ionicons 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color="#6B7280" 
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    const RequirementItem = ({text, isValid}: {text: string; isValid: boolean}) => (
        <View style={styles.requirementItem}>
            <Ionicons 
                name={isValid ? "checkmark-circle" : "close-circle"} 
                size={16} 
                color={isValid ? "#10B981" : "#EF4444"} 
            />
            <StyledText style={[styles.requirementText, isValid && styles.requirementTextValid]}>
                {text}
            </StyledText>
        </View>
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
                <StyledText style={styles.headerTitle}>{t("changePassword") || "Change Password"}</StyledText>
                <View style={styles.headerRight} />
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Instructions */}
                <View style={styles.instructionsContainer}>
                    <Ionicons name="information-circle-outline" size={24} color={Colors.primary} />
                    <StyledText style={styles.instructionsText}>
                        {t("passwordChangeInstructions") || "Please enter your current password and choose a new secure password."}
                    </StyledText>
                </View>

                {/* Password Requirements */}
                <View style={styles.requirementsSection}>
                    <StyledText style={styles.requirementsTitle}>
                        {t("passwordRequirements") || "Password Requirements"}
                    </StyledText>
                    <View style={styles.requirementsList}>
                        <RequirementItem 
                            text={t("atLeast6Characters") || "At least 6 characters"} 
                            isValid={newPassword.length >= 6} 
                        />
                        <RequirementItem 
                            text={t("differentFromCurrent") || "Different from current password"} 
                            isValid={currentPassword !== newPassword && newPassword.length > 0} 
                        />
                        <RequirementItem 
                            text={t("passwordsMatch") || "Passwords match"} 
                            isValid={newPassword === confirmPassword && confirmPassword.length > 0} 
                        />
                    </View>
                </View>

                {/* Password Inputs */}
                <View style={styles.inputsSection}>
                    <PasswordInput
                        label={t("currentPassword") || "Current Password"}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        placeholder={t("enterCurrentPassword") || "Enter current password"}
                        showPassword={showCurrentPassword}
                        onToggleShowPassword={() => setShowCurrentPassword(!showCurrentPassword)}
                    />

                    <PasswordInput
                        label={t("newPassword") || "New Password"}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder={t("enterNewPassword") || "Enter new password"}
                        showPassword={showNewPassword}
                        onToggleShowPassword={() => setShowNewPassword(!showNewPassword)}
                    />

                    <PasswordInput
                        label={t("confirmNewPassword") || "Confirm New Password"}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder={t("enterNewPassword") || "Enter new password"}
                        showPassword={showConfirmPassword}
                        onToggleShowPassword={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                    onPress={handleSavePassword}
                    activeOpacity={0.8}
                    disabled={isLoading}
                >
                    <LinearGradient
                        colors={isLoading ? ['#9CA3AF', '#6B7280'] : [Colors.primary, '#8B5FCF']}
                        style={styles.saveButtonGradient}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 0}}
                    >
                        {isLoading ? (
                            <Ionicons name="hourglass-outline" size={20} color="#FFFFFF" />
                        ) : (
                            <Ionicons name="checkmark-outline" size={20} color="#FFFFFF" />
                        )}
                        <StyledText style={styles.saveButtonText}>
                            {isLoading ? (t("saving") || "Saving...") : (t("savePassword") || "Save Password")}
                        </StyledText>
                    </LinearGradient>
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
    instructionsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#EFF6FF',
        padding: 16,
        borderRadius: 12,
        marginTop: 20,
        marginBottom: 24,
    },
    instructionsText: {
        flex: 1,
        fontSize: 14,
        color: '#1E40AF',
        fontFamily: FontsEnum.Poppins_400Regular,
        marginLeft: 12,
        lineHeight: 20,
    },
    requirementsSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    requirementsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        fontFamily: FontsEnum.Poppins_600SemiBold,
        marginBottom: 12,
    },
    requirementsList: {
        gap: 8,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    requirementText: {
        fontSize: 14,
        color: '#6B7280',
        fontFamily: FontsEnum.Poppins_400Regular,
    },
    requirementTextValid: {
        color: '#10B981',
    },
    inputsSection: {
        gap: 20,
        marginBottom: 32,
    },
    inputContainer: {
        marginBottom: 4,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        fontFamily: FontsEnum.Poppins_500Medium,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    inputError: {
        borderColor: '#EF4444',
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        fontFamily: FontsEnum.Poppins_400Regular,
    },
    eyeButton: {
        padding: 4,
    },
    saveButton: {
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
        marginBottom: 20,
    },
    saveButtonDisabled: {
        shadowOpacity: 0.1,
        elevation: 2,
    },
    saveButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        gap: 8,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    bottomSpacing: {
        height: 20,
    },
});

export default EditPasswordScreen;
