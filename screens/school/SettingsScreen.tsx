import React, {useState} from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Alert,
    Linking,
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
import {useLang} from "../../hooks/useLang";

type SettingsScreenNavigationProp = StackNavigationProp<TabHomeParamList, 'Settings'>;

interface SettingsScreenProps {}

const SettingsScreen: React.FC<SettingsScreenProps> = () => {
    const navigation = useNavigation<SettingsScreenNavigationProp>();
    const {t} = useTranslation();
    const {currentLangCode, changeLanguage} = useLang();

    const handleLanguageChange = () => {
        Alert.alert(
            t("selectLanguage") || "Select Language",
            t("selectLanguageMessage") || "Choose your preferred language",
            [
                {
                    text: "English",
                    onPress: () => changeLanguage('en'),
                },
                {
                    text: "العربية",
                    onPress: () => changeLanguage('ar'),
                },
                {
                    text: "Français",
                    onPress: () => changeLanguage('fr'),
                },
                {
                    text: t("cancel") || "Cancel",
                    style: "cancel",
                },
            ]
        );
    };

    const handleHelpAndSupport = () => {
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
    };

    const SettingsItem = ({icon, title, description, onPress, showArrow = false, rightText}: {
        icon: string;
        title: string;
        description?: string;
        onPress?: () => void;
        showArrow?: boolean;
        rightText?: string;
    }) => (
        <TouchableOpacity 
            style={styles.settingsItem} 
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            <View style={styles.settingsItemLeft}>
                <View style={styles.settingsItemIcon}>
                    <Ionicons name={icon as any} size={20} color={Colors.primary} />
                </View>
                <View style={styles.settingsItemContent}>
                    <StyledText style={styles.settingsItemTitle}>{title}</StyledText>
                    {description && <StyledText style={styles.settingsItemDescription}>{description}</StyledText>}
                </View>
            </View>
            <View style={styles.settingsItemRight}>
                {rightText && <StyledText style={styles.rightText}>{rightText}</StyledText>}
                {showArrow && (
                    <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
                )}
            </View>
        </TouchableOpacity>
    );

    const getLanguageName = (code: string) => {
        switch (code) {
            case 'en': return 'English';
            case 'ar': return 'العربية';
            case 'fr': return 'Français';
            default: return 'English';
        }
    };

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
                <StyledText style={styles.headerTitle}>{t("settings") || "Settings"}</StyledText>
                <View style={styles.headerRight} />
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* General Settings */}
                <View style={styles.section}>
                    <StyledText style={styles.sectionTitle}>{t("generalSettings") || "General Settings"}</StyledText>
                    
                    <View style={styles.settingsItemsContainer}>
                        <SettingsItem
                            icon="language-outline"
                            title={t("language") || "Language"}
                            description={t("selectLanguageMessage") || "Choose your preferred language"}
                            onPress={handleLanguageChange}
                            showArrow={true}
                            rightText={getLanguageName(currentLangCode)}
                        />
                    </View>
                </View>

                {/* Security Settings */}
                <View style={styles.section}>
                    <StyledText style={styles.sectionTitle}>{t("securitySettings") || "Security Settings"}</StyledText>
                    
                    <View style={styles.settingsItemsContainer}>
                        <SettingsItem
                            icon="lock-closed-outline"
                            title={t("changePassword") || "Change Password"}
                            description={t("changePasswordDescription") || "Update your account password"}
                            onPress={() => navigation.navigate('EditPassword')}
                            showArrow={true}
                        />
                    </View>
                </View>

                {/* Support */}
                <View style={styles.section}>
                    <StyledText style={styles.sectionTitle}>{t("support") || "Support"}</StyledText>
                    
                    <View style={styles.settingsItemsContainer}>
                        <SettingsItem
                            icon="help-circle-outline"
                            title={t("helpAndSupport") || "Help & Support"}
                            description={t("contactSupportDescription") || "Get help from our support team"}
                            onPress={handleHelpAndSupport}
                            showArrow={true}
                        />
                    </View>
                </View>

                {/* App Information */}
                <View style={styles.section}>
                    <StyledText style={styles.sectionTitle}>{t("appInformation") || "App Information"}</StyledText>
                    
                    <View style={styles.settingsItemsContainer}>
                        <SettingsItem
                            icon="information-circle-outline"
                            title={t("about") || "About"}
                            description={t("aboutDescription") || "Learn more about Chehadeti"}
                            onPress={() => navigation.navigate('About')}
                            showArrow={true}
                        />
                    </View>
                </View>

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
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        fontFamily: FontsEnum.Poppins_600SemiBold,
        marginBottom: 16,
    },
    settingsItemsContainer: {
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
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    settingsItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingsItemIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingsItemContent: {
        flex: 1,
    },
    settingsItemTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
        fontFamily: FontsEnum.Poppins_500Medium,
        marginBottom: 2,
    },
    settingsItemDescription: {
        fontSize: 14,
        color: '#6B7280',
        fontFamily: FontsEnum.Poppins_400Regular,
    },
    settingsItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    rightText: {
        fontSize: 14,
        color: '#6B7280',
        fontFamily: FontsEnum.Poppins_400Regular,
    },
    bottomSpacing: {
        height: 20,
    },
});

export default SettingsScreen;
