"use client"
import {useEffect, useState} from "react"
import {
    Animated,
    Image,
    KeyboardAvoidingView,
    Linking,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"
import {LinearGradient} from "expo-linear-gradient"
import {Ionicons} from "@expo/vector-icons"
import {FontsEnum} from "../../constants/FontsEnum"
import {StyledText} from "../../components/StyledText"
import {isValidPhone, trimTel} from "../../utils/functionHelpers"
import {AuthApi} from "../../api/AuthApi"
import {useAuth} from "../../hooks/useAuth"
import {Toast} from "../../components/Toast"
import {useLoader} from "../../hooks/useLoader"
import type {LoginResponse} from "../../models/LoginResponse"
import {useTranslation} from "react-i18next";

export default function LoginScreen({navigation, route}) {
    const [code, setCode] = useState("MR");
    const {
        storeToken,
        rememberUser,
        getRememberedUser,
        clearRememberedUser,
        setTmpPass,
        connectedUser,
        refreshUser,
    } = useAuth();
    const [emailOrPhone, setEmailOrPhone] = useState("");
    const [password, setPassword] = useState("");
    const [isRememberMe, setIsRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const {setLoader, removeLoader, isLoading} = useLoader();
    const {t} = useTranslation();

    const goTo = (root: string) => {
        navigation.push(root);
    };

    useEffect(() => {
        (async () => {
            const user = await getRememberedUser();
            if (user) {
                setIsRememberMe(true);
                setEmailOrPhone(user.emailOrPhone);
                setPassword(user.password);
            }
        })();
    }, []);

    const onLogin = async () => {
        const isPhone = isValidPhone(emailOrPhone, code);

        const data = isPhone
            ? {username: `${trimTel(emailOrPhone, code)}`, password: password}
            : {username: emailOrPhone, password: password};

        try {
            setLoader();
            const result = await AuthApi.login(data);
            const loginData = result?.data as LoginResponse;
            if (result?.ok) {
                if (route?.params?.isFromForget) {
                    await setTmpPass(password);
                }
                if (isRememberMe) {
                    const storeUser = {emailOrPhone, password};
                    await rememberUser(storeUser);
                } else {
                    await clearRememberedUser();
                }

                await storeToken(
                    loginData?.access_token,
                    loginData?.refresh_token,
                    loginData?.expires_in,
                    loginData?.refresh_expires_in
                );
                await refreshUser();
                return;
            } else if (!result?.ok) {
                if (result.status === 403) {
                    Toast(t("userInactive"));
                    return;
                }
                if (result.status === 404 || result.status === 401) {
                    Toast(t("loginError"));
                    return;
                }
            } else if (!result?.ok) {
                Toast(t("genericError"));
            }
        } catch (error) {
            console.error("Error during login: ", error);
            Toast(t("genericError"));
        } finally {
            removeLoader();
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4A90E2"/>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.contentContainer]}>
                        <View style={styles.headerSection}>
                            <View style={styles.logoContainer}>
                                <Image
                                    source={require("./../../assets/images/icon.png")}
                                    style={{width: 100, height: 100, borderRadius: 100}}
                                    resizeMode="cover"
                                />
                            </View>
                        </View>

                        <View style={styles.formCard}>
                            <View style={styles.formHeader}>
                                <StyledText style={styles.formTitle}>
                                    {t("connectToYourAccount")}
                                </StyledText>
                            </View>

                            <View style={styles.inputContainer}>
                                <View
                                    style={[
                                        styles.inputWrapper,
                                        focusedField === "email" && styles.inputWrapperFocused,
                                    ]}
                                >
                                    <Ionicons
                                        name="person-outline"
                                        size={20}
                                        color={focusedField === "email" ? "#4A90E2" : "#B0B0B0"}
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder={t("emailOrPhone")}
                                        placeholderTextColor="#B0B0B0"
                                        keyboardType="default"
                                        onChangeText={setEmailOrPhone}
                                        value={emailOrPhone}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputContainer}>
                                <View
                                    style={[
                                        styles.inputWrapper,
                                        focusedField === "password" && styles.inputWrapperFocused,
                                    ]}
                                >
                                    <Ionicons
                                        name="lock-closed-outline"
                                        size={20}
                                        color={focusedField === "password" ? "#4A90E2" : "#B0B0B0"}
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={[styles.textInput, styles.passwordInput]}
                                        placeholder={t("password")}
                                        placeholderTextColor="#B0B0B0"
                                        onChangeText={setPassword}
                                        value={password}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity
                                        style={styles.passwordToggle}
                                        onPress={() => setShowPassword(!showPassword)}
                                        accessibilityRole="button"
                                        accessibilityLabel={t("togglePasswordVisibility")}
                                    >
                                        <Ionicons
                                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                                            size={20}
                                            color="#B0B0B0"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.optionsContainer}>
                                <TouchableOpacity
                                    style={styles.rememberMeContainer}
                                    onPress={() => setIsRememberMe(!isRememberMe)}
                                >
                                    <View
                                        style={[styles.checkbox, isRememberMe && styles.checkboxChecked]}
                                    >
                                        {isRememberMe && (
                                            <Ionicons name="checkmark" size={14} color="#FFFFFF"/>
                                        )}
                                    </View>
                                    <StyledText style={styles.rememberMeText}>
                                        {t("rememberMe")}
                                    </StyledText>
                                </TouchableOpacity>


                            </View>
                            <TouchableOpacity  style={{
                                alignItems: "flex-end",marginBottom : 15
                            }} onPress={() => goTo("ForgotPassword")}>
                                <StyledText style={styles.forgotPasswordText}>
                                    {t("forgotPassword")}
                                </StyledText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                                onPress={onLogin}
                                disabled={isLoading}
                                accessibilityRole="button"
                                accessibilityLabel={t("login")}
                            >
                                <LinearGradient
                                    colors={isLoading ? ["#CCCCCC", "#AAAAAA"] : ["#4A90E2", "#357ABD"]}
                                    style={styles.loginButtonGradient}
                                >
                                    {isLoading ? (
                                        <View style={styles.loadingContainer}>
                                            <Animated.View style={styles.loadingSpinner}>
                                                <Ionicons name="refresh" size={20} color="#FFFFFF"/>
                                            </Animated.View>
                                            <StyledText style={styles.loginButtonText}>
                                                {t("signingIn")}
                                            </StyledText>
                                        </View>
                                    ) : (
                                        <StyledText style={styles.loginButtonText}>
                                            {t("login")}
                                        </StyledText>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.digiWaveContainer}
                            activeOpacity={0.7}
                            onPress={() => Linking.openURL("https://www.digiwave-tech.com")}
                        >
                            <StyledText style={styles.digiWaveText}>
                                {t("developedBy")}{" "}
                                <StyledText style={styles.digiWaveHighlight}>Digi Wave</StyledText>
                            </StyledText>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#4A90E2",
    },
    gradientBackground: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    contentContainer: {
        flex: 1,
        justifyContent: "center",
    },
    headerSection: {
        alignItems: "center",
        marginBottom: 40,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#FFFFFF",
        textAlign: "center",
        marginBottom: 8,
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.8)",
        textAlign: "center",
        fontFamily: FontsEnum.Poppins_300Light,
    },
    formCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 30,
        marginHorizontal: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 15,
    },
    formHeader: {
        alignItems: "center",
        marginBottom: 30,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#333333",
        textAlign: "center",
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8F9FA",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E9ECEF",
        paddingHorizontal: 15,
        height: 55,
    },
    inputWrapperFocused: {
        borderColor: "#4A90E2",
        backgroundColor: "#FFFFFF",
        shadowColor: "#4A90E2",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inputIcon: {
        marginRight: 12,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: "#333333",
        fontFamily: FontsEnum.Poppins_400Regular,
    },
    passwordInput: {
        paddingRight: 40,
    },
    passwordToggle: {
        position: "absolute",
        right: 15,
        padding: 5,
    },
    optionsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    rememberMeContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: "#4A90E2",
        marginRight: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxChecked: {
        backgroundColor: "#4A90E2",
    },
    rememberMeText: {
        fontSize: 14,
        color: "#666666",
        fontFamily: FontsEnum.Poppins_400Regular,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: "#4A90E2",
        fontWeight: "500",
        fontFamily: FontsEnum.Poppins_500Medium,
    },
    loginButton: {
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 20,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonGradient: {
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    loadingSpinner: {
        marginRight: 8,
    },
    footer: {
        alignItems: "center",
        marginTop: 30,
    },
    footerText: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.8)",
        marginBottom: 5,
        fontFamily: FontsEnum.Poppins_400Regular,
    },
    footerLink: {
        fontSize: 14,
        color: "#FFFFFF",
        fontWeight: "600",
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    digiWaveContainer: {
        marginTop: 15,
        alignItems: "center",
    },

    digiWaveText: {
        fontSize: 14,
        color: "#000",
        fontFamily: FontsEnum.Poppins_400Regular,
    },

    digiWaveHighlight: {
        color: "#FFF",
        fontFamily: FontsEnum.Poppins_500Medium,
        textDecorationLine: "underline",
    },


})
