import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Image,
    Animated,
    Modal,
    FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';
import { StyledText } from '../../components/StyledText';
import { Toast } from '../../components/Toast';
import { FontsEnum } from '../../constants/FontsEnum';
import { StudentApi } from '../../api/studentApi';
import { AuthApi } from '../../api/AuthApi';
import { UserApi } from '../../api/UserApi';
import { useLoader } from '../../hooks/useLoader';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import Colors from '../../constants/Colors';
import { LoginResponse } from '../../models/LoginResponse';
import { ClasseDTO } from '../../models/UserModel';

interface FormErrors {
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
    tel?: string;
    classe?: string;
}

export default function SignupScreen({ navigation }: any) {
    const { t } = useTranslation();
    const { setLoader, removeLoader, isLoading } = useLoader();
    const { storeToken, refreshUser, connectedUser } = useAuth();
    
    // Form fields
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        tel: '',
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    
    // Country picker state
    const [countryCode, setCountryCode] = useState<CountryCode>('MR');
    const [country, setCountry] = useState<Country | null>(null);
    const [callingCode, setCallingCode] = useState('222');
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    
    // Class selection state
    const [classes, setClasses] = useState<ClasseDTO[]>([]);
    const [selectedClass, setSelectedClass] = useState<ClasseDTO | null>(null);
    const [showClassPicker, setShowClassPicker] = useState(false);
    
    // Refs for inputs
    const firstNameRef = useRef<TextInput>(null);
    const lastNameRef = useRef<TextInput>(null);
    const telRef = useRef<TextInput>(null);
    const emailRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);
    const confirmPasswordRef = useRef<TextInput>(null);

    // Fetch classes on mount
    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const result = await StudentApi.getClasses();
            if (result?.ok && result?.data) {
                setClasses(result.data);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const onSelectCountry = (selectedCountry: Country) => {
        setCountry(selectedCountry);
        setCountryCode(selectedCountry.cca2);
        setCallingCode(selectedCountry.callingCode[0]);
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        
        // First Name validation
        if (!formData.firstName.trim()) {
            newErrors.firstName = t('signupErrorFirstNameRequired') || 'Please enter your first name to continue';
        } else if (formData.firstName.trim().length < 2) {
            newErrors.firstName = t('signupErrorFirstNameTooShort') || 'First name must be at least 2 characters';
        }
        
        // Last Name validation
        if (!formData.lastName.trim()) {
            newErrors.lastName = t('signupErrorLastNameRequired') || 'Please enter your last name to continue';
        } else if (formData.lastName.trim().length < 2) {
            newErrors.lastName = t('signupErrorLastNameTooShort') || 'Last name must be at least 2 characters';
        }
        
        // Phone validation
        if (!formData.tel.trim()) {
            newErrors.tel = t('signupErrorPhoneRequired') || 'Please enter your phone number to create your account';
        } else if (formData.tel.trim().length < 8) {
            newErrors.tel = t('signupErrorPhoneInvalid') || 'Please enter a valid phone number';
        }
        
        // Email validation (optional, but if provided must be valid)
        if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t('signupErrorEmailInvalid') || 'Please enter a valid email address';
        }
        
        // Password validation
        if (!formData.password) {
            newErrors.password = t('signupErrorPasswordRequired') || 'Please create a password to secure your account';
        } else if (formData.password.length < 6) {
            newErrors.password = t('signupErrorPasswordTooShort') || 'Password must be at least 6 characters for security';
        }
        
        // Confirm Password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = t('signupErrorConfirmPasswordRequired') || 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = t('signupErrorPasswordsDoNotMatch') || 'Passwords do not match. Please try again';
        }
        
        // Class validation
        if (!selectedClass) {
            newErrors.classe = t('signupErrorClassRequired') || 'Please select a class';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignup = async () => {
        if (!validateForm()) {
            Toast(t('pleaseFixErrors') || 'Please fix the errors in the form');
            return;
        }

        try {
            setLoader();

            const fullPhone = `+${callingCode}${formData.tel.trim()}`;
            
            const signupData = {
                email: formData.email.trim().toLowerCase() || undefined,
                password: formData.password,
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                tel: fullPhone,
                username: fullPhone,
                classe: selectedClass ? { id: selectedClass.id } : undefined
            };

            // Step 1: Create account
            const signupResult = await StudentApi.signup(signupData);

            if (signupResult?.ok && signupResult?.data) {
                // Step 2: Auto-login with credentials
                const loginData = {
                    username: fullPhone,
                    password: formData.password
                };
                
                const loginResult = await AuthApi.login(loginData);
                
                if (loginResult?.ok && loginResult?.data) {
                    const loginResponse = loginResult.data as LoginResponse;
                    
                    // Step 3: Store tokens
                    await storeToken(
                        loginResponse.access_token,
                        loginResponse.refresh_token,
                        loginResponse.expires_in,
                        loginResponse.refresh_expires_in
                    );
                    
                    // Step 4: Refresh user data in Redux
                    await refreshUser();
                    Toast(t('welcomeMessage') || 'Welcome! Your account has been created successfully.');

                    // Step 5: Get fresh user data from API to check validation status

                    removeLoader();
                    

                } else {
                    removeLoader();
                    Toast(t('signupSuccessLoginFailed') || 'Account created! Please login manually.');
                    setTimeout(() => {
                        navigation.navigate('Login');
                    }, 2000);
                }
            } else {
                removeLoader();
                const errorMessage = signupResult?.data?.message || t('signupError') || 'Failed to create account';
                Toast(errorMessage);
            }
        } catch (error) {
            console.error('Signup error:', error);
            removeLoader();
            Toast(t('genericError') || 'An error occurred. Please try again.');
        }
    };

    const handleVerificationModalClose = () => {
        setShowVerificationModal(false);
        // User stays logged in but on a waiting screen
        // The navigation logic will keep them authenticated but restricted
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Section */}
                    <View style={styles.headerSection}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                            accessibilityLabel={t('goBack') || 'Go back'}
                        >
                            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>

                        <View style={styles.logoContainer}>
                            <Image
                                source={require('./../../assets/images/icon.png')}
                                style={styles.logo}
                                resizeMode="cover"
                            />
                        </View>

                        <StyledText style={styles.headerTitle}>
                            {t('createAccount') || 'Create Account'}
                        </StyledText>
                        <StyledText style={styles.headerSubtitle}>
                            {t('signupToGetStarted') || 'Sign up to get started'}
                        </StyledText>
                    </View>

                    {/* Form Card */}
                    <View style={styles.formCard}>
                        {/* First Name & Last Name - Side by side */}
                        <View style={styles.rowContainer}>
                            <View style={[styles.inputContainer, styles.halfWidth]}>
                                <StyledText style={styles.inputLabel}>
                                    {t('firstName') || 'First Name'}
                                </StyledText>
                                <View style={[
                                    styles.inputWrapper,
                                    errors.firstName && styles.inputWrapperError,
                                ]}>
                                    <TextInput
                                        ref={firstNameRef}
                                        style={styles.textInput}
                                        placeholder={t('firstName') || 'First name'}
                                        placeholderTextColor="#B0B0B0"
                                        value={formData.firstName}
                                        onChangeText={(value) => updateField('firstName', value)}
                                        returnKeyType="next"
                                        onSubmitEditing={() => lastNameRef.current?.focus()}
                                    />
                                </View>
                                {errors.firstName && (
                                    <StyledText style={styles.errorText}>{errors.firstName}</StyledText>
                                )}
                            </View>

                            <View style={[styles.inputContainer, styles.halfWidth]}>
                                <StyledText style={styles.inputLabel}>
                                    {t('lastName') || 'Last Name'}
                                </StyledText>
                                <View style={[
                                    styles.inputWrapper,
                                    errors.lastName && styles.inputWrapperError,
                                ]}>
                                    <TextInput
                                        ref={lastNameRef}
                                        style={styles.textInput}
                                        placeholder={t('lastName') || 'Last name'}
                                        placeholderTextColor="#B0B0B0"
                                        value={formData.lastName}
                                        onChangeText={(value) => updateField('lastName', value)}
                                        returnKeyType="next"
                                        onSubmitEditing={() => telRef.current?.focus()}
                                    />
                                </View>
                                {errors.lastName && (
                                    <StyledText style={styles.errorText}>{errors.lastName}</StyledText>
                                )}
                            </View>
                        </View>

                        {/* Phone with Country Picker */}
                        <View style={styles.inputContainer}>
                            <StyledText style={styles.inputLabel}>
                                {t('phoneNumber') || 'Phone Number'}
                            </StyledText>
                            <View style={[
                                styles.inputWrapper,
                                errors.tel && styles.inputWrapperError,
                            ]}>
                                <TouchableOpacity 
                                    style={styles.countryPickerButton}
                                    onPress={() => setShowCountryPicker(true)}
                                >
                                    <CountryPicker
                                        countryCode={countryCode}
                                        withFilter
                                        withFlag
                                        withCallingCode
                                        withEmoji
                                        onSelect={onSelectCountry}
                                        visible={showCountryPicker}
                                        onClose={() => setShowCountryPicker(false)}
                                    />
                                    <StyledText style={styles.callingCodeText}>+{callingCode}</StyledText>
                                    <Ionicons name="chevron-down" size={16} color="#B0B0B0" />
                                </TouchableOpacity>
                                <View style={styles.phoneSeparator} />
                                <TextInput
                                    ref={telRef}
                                    style={styles.phoneInput}
                                    placeholder={t('enterPhone') || 'Phone number'}
                                    placeholderTextColor="#B0B0B0"
                                    value={formData.tel}
                                    onChangeText={(value) => updateField('tel', value)}
                                    keyboardType="phone-pad"
                                    returnKeyType="next"
                                    onSubmitEditing={() => emailRef.current?.focus()}
                                />
                            </View>
                            {errors.tel && (
                                <StyledText style={styles.errorText}>{errors.tel}</StyledText>
                            )}
                        </View>

                        {/* Class Picker */}
                        <View style={styles.inputContainer}>
                            <StyledText style={styles.inputLabel}>
                                {t('class') || 'Class'}
                            </StyledText>
                            <TouchableOpacity
                                style={[
                                    styles.inputWrapper,
                                    errors.classe && styles.inputWrapperError,
                                ]}
                                onPress={() => setShowClassPicker(true)}
                            >
                                <Ionicons
                                    name="school-outline"
                                    size={20}
                                    color="#B0B0B0"
                                    style={styles.inputIcon}
                                />
                                <StyledText style={[
                                    styles.classPlaceholder,
                                    selectedClass && styles.classSelected
                                ]}>
                                    {selectedClass ? selectedClass.name : (t('selectClass') || 'Select your class')}
                                </StyledText>
                                <Ionicons name="chevron-down" size={20} color="#B0B0B0" />
                            </TouchableOpacity>
                            {errors.classe && (
                                <StyledText style={styles.errorText}>{errors.classe}</StyledText>
                            )}
                        </View>

                        {/* Email (Optional) */}
                        <View style={styles.inputContainer}>
                            <View style={styles.labelRow}>
                                <StyledText style={styles.inputLabel}>
                                    {t('email') || 'Email'}
                                </StyledText>
                                <StyledText style={styles.optionalLabel}>
                                    {t('optional') || '(Optional)'}
                                </StyledText>
                            </View>
                            <View style={[
                                styles.inputWrapper,
                                errors.email && styles.inputWrapperError,
                            ]}>
                                <Ionicons
                                    name="mail-outline"
                                    size={20}
                                    color="#B0B0B0"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    ref={emailRef}
                                    style={styles.textInput}
                                    placeholder={t('enterEmail') || 'Enter your email'}
                                    placeholderTextColor="#B0B0B0"
                                    value={formData.email}
                                    onChangeText={(value) => updateField('email', value)}
                                    keyboardType="email-address"
                                    returnKeyType="next"
                                    onSubmitEditing={() => passwordRef.current?.focus()}
                                    autoCapitalize="none"
                                />
                            </View>
                            {errors.email && (
                                <StyledText style={styles.errorText}>{errors.email}</StyledText>
                            )}
                        </View>

                        {/* Password */}
                        <View style={styles.inputContainer}>
                            <StyledText style={styles.inputLabel}>
                                {t('password') || 'Password'}
                            </StyledText>
                            <View style={[
                                styles.inputWrapper,
                                errors.password && styles.inputWrapperError,
                            ]}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={20}
                                    color="#B0B0B0"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    ref={passwordRef}
                                    style={[styles.textInput, styles.passwordInput]}
                                    placeholder={t('enterPassword') || 'Enter your password'}
                                    placeholderTextColor="#B0B0B0"
                                    value={formData.password}
                                    onChangeText={(value) => updateField('password', value)}
                                    secureTextEntry={!showPassword}
                                    returnKeyType="next"
                                    onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                                />
                                <TouchableOpacity
                                    style={styles.passwordToggle}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color="#B0B0B0"
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.password && (
                                <StyledText style={styles.errorText}>{errors.password}</StyledText>
                            )}
                        </View>

                        {/* Confirm Password */}
                        <View style={styles.inputContainer}>
                            <StyledText style={styles.inputLabel}>
                                {t('confirmPassword') || 'Confirm Password'}
                            </StyledText>
                            <View style={[
                                styles.inputWrapper,
                                errors.confirmPassword && styles.inputWrapperError,
                            ]}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={20}
                                    color="#B0B0B0"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    ref={confirmPasswordRef}
                                    style={[styles.textInput, styles.passwordInput]}
                                    placeholder={t('confirmYourPassword') || 'Confirm your password'}
                                    placeholderTextColor="#B0B0B0"
                                    value={formData.confirmPassword}
                                    onChangeText={(value) => updateField('confirmPassword', value)}
                                    secureTextEntry={!showConfirmPassword}
                                    returnKeyType="done"
                                    onSubmitEditing={handleSignup}
                                />
                                <TouchableOpacity
                                    style={styles.passwordToggle}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <Ionicons
                                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color="#B0B0B0"
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.confirmPassword && (
                                <StyledText style={styles.errorText}>{errors.confirmPassword}</StyledText>
                            )}
                        </View>

                        {/* Sign Up Button */}
                        <TouchableOpacity
                            style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
                            onPress={handleSignup}
                            disabled={isLoading}
                            accessibilityLabel={t('signUp') || 'Sign up'}
                        >
                            <LinearGradient
                                colors={isLoading ? ['#CCCCCC', '#AAAAAA'] : [Colors.primary, '#8B5FCF']}
                                style={styles.signupButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {isLoading ? (
                                    <View style={styles.loadingContainer}>
                                        <Animated.View style={styles.loadingSpinner}>
                                            <Ionicons name="refresh" size={20} color="#FFFFFF" />
                                        </Animated.View>
                                        <StyledText style={styles.signupButtonText}>
                                            {t('creatingAccount') || 'Creating account...'}
                                        </StyledText>
                                    </View>
                                ) : (
                                    <StyledText style={styles.signupButtonText}>
                                        {t('signUp') || 'Sign Up'}
                                    </StyledText>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Login Link */}
                        <View style={styles.loginLinkContainer}>
                            <StyledText style={styles.loginLinkText}>
                                {t('alreadyHaveAccount') || 'Already have an account?'}{' '}
                            </StyledText>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <StyledText style={styles.loginLink}>
                                    {t('login') || 'Login'}
                                </StyledText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Class Picker Modal */}
            <Modal
                visible={showClassPicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowClassPicker(false)}
            >
                <View style={styles.classModalOverlay}>
                    <View style={styles.classModalContent}>
                        <View style={styles.classModalHeader}>
                            <StyledText style={styles.classModalTitle}>
                                {t('selectClass') || 'Select Class'}
                            </StyledText>
                            <TouchableOpacity
                                onPress={() => setShowClassPicker(false)}
                                style={styles.classModalClose}
                            >
                                <Ionicons name="close" size={24} color="#666666" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={classes}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.classItem,
                                        selectedClass?.id === item.id && styles.classItemSelected
                                    ]}
                                    onPress={() => {
                                        setSelectedClass(item);
                                        setShowClassPicker(false);
                                        if (errors.classe) {
                                            setErrors(prev => ({ ...prev, classe: undefined }));
                                        }
                                    }}
                                >
                                    <View style={styles.classItemContent}>
                                        <StyledText style={styles.className}>
                                            {item.name}
                                        </StyledText>
                                        {item.description && (
                                            <StyledText style={styles.classDescription}>
                                                {item.description}
                                            </StyledText>
                                        )}
                                    </View>
                                    {selectedClass?.id === item.id && (
                                        <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                                    )}
                                </TouchableOpacity>
                            )}
                            ItemSeparatorComponent={() => <View style={styles.classSeparator} />}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 30,
        paddingTop: 20,
    },
    backButton: {
        position: 'absolute',
        left: 0,
        top: 20,
        padding: 10,
        zIndex: 10,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        fontFamily: FontsEnum.Poppins_300Light,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 15,
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333333',
        marginBottom: 8,
        fontFamily: FontsEnum.Poppins_500Medium,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        paddingHorizontal: 15,
        height: 50,
    },
    inputWrapperError: {
        borderColor: '#EF4444',
    },
    inputIcon: {
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        color: '#333333',
        fontFamily: FontsEnum.Poppins_400Regular,
    },
    passwordInput: {
        paddingRight: 40,
    },
    passwordToggle: {
        position: 'absolute',
        right: 15,
        padding: 5,
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
        fontFamily: FontsEnum.Poppins_400Regular,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfWidth: {
        width: '48%',
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    optionalLabel: {
        fontSize: 12,
        color: '#999999',
        marginLeft: 6,
        fontFamily: FontsEnum.Poppins_400Regular,
    },
    countryPickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 8,
    },
    callingCodeText: {
        fontSize: 15,
        color: '#333333',
        marginLeft: 8,
        marginRight: 4,
        fontFamily: FontsEnum.Poppins_500Medium,
    },
    phoneSeparator: {
        width: 1,
        height: 24,
        backgroundColor: '#E9ECEF',
        marginHorizontal: 8,
    },
    phoneInput: {
        flex: 1,
        fontSize: 15,
        color: '#333333',
        fontFamily: FontsEnum.Poppins_400Regular,
    },
    signupButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 8,
        marginBottom: 20,
    },
    signupButtonDisabled: {
        opacity: 0.7,
    },
    signupButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    signupButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    loadingSpinner: {
        marginRight: 8,
    },
    loginLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginLinkText: {
        fontSize: 14,
        color: '#666666',
        fontFamily: FontsEnum.Poppins_400Regular,
    },
    loginLink: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '600',
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    // Modal Styles
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
    classPlaceholder: {
        flex: 1,
        fontSize: 15,
        color: '#B0B0B0',
        fontFamily: FontsEnum.Poppins_400Regular,
    },
    classSelected: {
        color: '#333333',
    },
    classModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    classModalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingBottom: 40,
        maxHeight: '70%',
    },
    classModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    classModalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    classModalClose: {
        padding: 4,
    },
    classItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    classItemSelected: {
        backgroundColor: 'rgba(106, 53, 193, 0.05)',
    },
    classItemContent: {
        flex: 1,
        marginRight: 12,
    },
    className: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
        fontFamily: FontsEnum.Poppins_500Medium,
        marginBottom: 4,
    },
    classDescription: {
        fontSize: 13,
        color: '#6B7280',
        fontFamily: FontsEnum.Poppins_400Regular,
    },
    classSeparator: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginHorizontal: 20,
    },
});

