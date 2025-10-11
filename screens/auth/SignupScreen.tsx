import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StyledText } from '../../components/StyledText';
import { Toast } from '../../components/Toast';
import { FontsEnum } from '../../constants/FontsEnum';
import { StudentApi } from '../../api/studentApi';
import { useLoader } from '../../hooks/useLoader';
import { useTranslation } from 'react-i18next';
import Colors from '../../constants/Colors';

interface FormErrors {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
    tel?: string;
}

export default function SignupScreen({ navigation }: any) {
    const { t } = useTranslation();
    const { setLoader, removeLoader, isLoading } = useLoader();

    // Form fields
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        tel: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});

    // Refs for inputs
    const emailRef = useRef<TextInput>(null);
    const firstNameRef = useRef<TextInput>(null);
    const lastNameRef = useRef<TextInput>(null);
    const telRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);
    const confirmPasswordRef = useRef<TextInput>(null);

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = t('usernameRequired') || 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = t('usernameTooShort') || 'Username must be at least 3 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = t('emailRequired') || 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t('emailInvalid') || 'Invalid email format';
        }

        if (!formData.firstName.trim()) {
            newErrors.firstName = t('firstNameRequired') || 'First name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = t('lastNameRequired') || 'Last name is required';
        }

        if (!formData.tel.trim()) {
            newErrors.tel = t('phoneRequired') || 'Phone number is required';
        }

        if (!formData.password) {
            newErrors.password = t('passwordRequired') || 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = t('passwordTooShort') || 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = t('passwordsDoNotMatch') || 'Passwords do not match';
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
            const signupData = {
                username: formData.username.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                tel: formData.tel.trim(),
                type: 'STUDENT',
            };

            const result = await StudentApi.signup(signupData);

            if (result?.ok && result?.data) {
                Toast(t('signupSuccess') || 'Account created successfully! Please login.');
                // Navigate to login after a short delay
                setTimeout(() => {
                    navigation.navigate('Login');
                }, 1500);
            } else {
                const errorMessage = result?.data?.message || t('signupError') || 'Failed to create account';
                Toast(errorMessage);
            }
        } catch (error) {
            console.error('Signup error:', error);
            Toast(t('genericError') || 'An error occurred. Please try again.');
        } finally {
            removeLoader();
        }
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
                        {/* Username */}
                        <View style={styles.inputContainer}>
                            <StyledText style={styles.inputLabel}>
                                {t('username') || 'Username'}
                            </StyledText>
                            <View style={[
                                styles.inputWrapper,
                                focusedField === 'username' && styles.inputWrapperFocused,
                                errors.username && styles.inputWrapperError,
                            ]}>
                                <Ionicons
                                    name="person-outline"
                                    size={20}
                                    color={focusedField === 'username' ? Colors.primary : '#B0B0B0'}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder={t('enterUsername') || 'Enter your username'}
                                    placeholderTextColor="#B0B0B0"
                                    value={formData.username}
                                    onChangeText={(value) => updateField('username', value)}
                                    onFocus={() => setFocusedField('username')}
                                    onBlur={() => setFocusedField(null)}
                                    returnKeyType="next"
                                    onSubmitEditing={() => emailRef.current?.focus()}
                                    autoCapitalize="none"
                                />
                            </View>
                            {errors.username && (
                                <StyledText style={styles.errorText}>{errors.username}</StyledText>
                            )}
                        </View>

                        {/* Email */}
                        <View style={styles.inputContainer}>
                            <StyledText style={styles.inputLabel}>
                                {t('email') || 'Email'}
                            </StyledText>
                            <View style={[
                                styles.inputWrapper,
                                focusedField === 'email' && styles.inputWrapperFocused,
                                errors.email && styles.inputWrapperError,
                            ]}>
                                <Ionicons
                                    name="mail-outline"
                                    size={20}
                                    color={focusedField === 'email' ? Colors.primary : '#B0B0B0'}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    ref={emailRef}
                                    style={styles.textInput}
                                    placeholder={t('enterEmail') || 'Enter your email'}
                                    placeholderTextColor="#B0B0B0"
                                    value={formData.email}
                                    onChangeText={(value) => updateField('email', value)}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    keyboardType="email-address"
                                    returnKeyType="next"
                                    onSubmitEditing={() => firstNameRef.current?.focus()}
                                    autoCapitalize="none"
                                />
                            </View>
                            {errors.email && (
                                <StyledText style={styles.errorText}>{errors.email}</StyledText>
                            )}
                        </View>

                        {/* First Name & Last Name - Side by side */}
                        <View style={styles.rowContainer}>
                            <View style={[styles.inputContainer, styles.halfWidth]}>
                                <StyledText style={styles.inputLabel}>
                                    {t('firstName') || 'First Name'}
                                </StyledText>
                                <View style={[
                                    styles.inputWrapper,
                                    focusedField === 'firstName' && styles.inputWrapperFocused,
                                    errors.firstName && styles.inputWrapperError,
                                ]}>
                                    <TextInput
                                        ref={firstNameRef}
                                        style={styles.textInput}
                                        placeholder={t('firstName') || 'First name'}
                                        placeholderTextColor="#B0B0B0"
                                        value={formData.firstName}
                                        onChangeText={(value) => updateField('firstName', value)}
                                        onFocus={() => setFocusedField('firstName')}
                                        onBlur={() => setFocusedField(null)}
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
                                    focusedField === 'lastName' && styles.inputWrapperFocused,
                                    errors.lastName && styles.inputWrapperError,
                                ]}>
                                    <TextInput
                                        ref={lastNameRef}
                                        style={styles.textInput}
                                        placeholder={t('lastName') || 'Last name'}
                                        placeholderTextColor="#B0B0B0"
                                        value={formData.lastName}
                                        onChangeText={(value) => updateField('lastName', value)}
                                        onFocus={() => setFocusedField('lastName')}
                                        onBlur={() => setFocusedField(null)}
                                        returnKeyType="next"
                                        onSubmitEditing={() => telRef.current?.focus()}
                                    />
                                </View>
                                {errors.lastName && (
                                    <StyledText style={styles.errorText}>{errors.lastName}</StyledText>
                                )}
                            </View>
                        </View>

                        {/* Phone */}
                        <View style={styles.inputContainer}>
                            <StyledText style={styles.inputLabel}>
                                {t('phoneNumber') || 'Phone Number'}
                            </StyledText>
                            <View style={[
                                styles.inputWrapper,
                                focusedField === 'tel' && styles.inputWrapperFocused,
                                errors.tel && styles.inputWrapperError,
                            ]}>
                                <Ionicons
                                    name="call-outline"
                                    size={20}
                                    color={focusedField === 'tel' ? Colors.primary : '#B0B0B0'}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    ref={telRef}
                                    style={styles.textInput}
                                    placeholder={t('enterPhone') || 'Enter your phone number'}
                                    placeholderTextColor="#B0B0B0"
                                    value={formData.tel}
                                    onChangeText={(value) => updateField('tel', value)}
                                    onFocus={() => setFocusedField('tel')}
                                    onBlur={() => setFocusedField(null)}
                                    keyboardType="phone-pad"
                                    returnKeyType="next"
                                    onSubmitEditing={() => passwordRef.current?.focus()}
                                />
                            </View>
                            {errors.tel && (
                                <StyledText style={styles.errorText}>{errors.tel}</StyledText>
                            )}
                        </View>

                        {/* Password */}
                        <View style={styles.inputContainer}>
                            <StyledText style={styles.inputLabel}>
                                {t('password') || 'Password'}
                            </StyledText>
                            <View style={[
                                styles.inputWrapper,
                                focusedField === 'password' && styles.inputWrapperFocused,
                                errors.password && styles.inputWrapperError,
                            ]}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={20}
                                    color={focusedField === 'password' ? Colors.primary : '#B0B0B0'}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    ref={passwordRef}
                                    style={[styles.textInput, styles.passwordInput]}
                                    placeholder={t('enterPassword') || 'Enter your password'}
                                    placeholderTextColor="#B0B0B0"
                                    value={formData.password}
                                    onChangeText={(value) => updateField('password', value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
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
                                focusedField === 'confirmPassword' && styles.inputWrapperFocused,
                                errors.confirmPassword && styles.inputWrapperError,
                            ]}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={20}
                                    color={focusedField === 'confirmPassword' ? Colors.primary : '#B0B0B0'}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    ref={confirmPasswordRef}
                                    style={[styles.textInput, styles.passwordInput]}
                                    placeholder={t('confirmYourPassword') || 'Confirm your password'}
                                    placeholderTextColor="#B0B0B0"
                                    value={formData.confirmPassword}
                                    onChangeText={(value) => updateField('confirmPassword', value)}
                                    onFocus={() => setFocusedField('confirmPassword')}
                                    onBlur={() => setFocusedField(null)}
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
    inputWrapperFocused: {
        borderColor: Colors.primary,
        backgroundColor: '#FFFFFF',
        shadowColor: Colors.primary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
});

