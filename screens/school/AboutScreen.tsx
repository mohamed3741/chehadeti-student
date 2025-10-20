import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Linking,
    Dimensions,
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

const {width} = Dimensions.get('window');

type AboutScreenNavigationProp = StackNavigationProp<TabHomeParamList, 'About'>;

interface AboutScreenProps {}

const AboutScreen: React.FC<AboutScreenProps> = () => {
    const navigation = useNavigation<AboutScreenNavigationProp>();
    const {t} = useTranslation();

    const handleWebsitePress = () => {
        Linking.openURL('https://www.digiwave-tech.com');
    };

    const FeatureItem = ({icon, title, description}: {
        icon: string;
        title: string;
        description: string;
    }) => (
        <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
                <Ionicons name={icon as any} size={24} color={Colors.primary} />
            </View>
            <View style={styles.featureContent}>
                <StyledText style={styles.featureTitle}>{title}</StyledText>
                <StyledText style={styles.featureDescription}>{description}</StyledText>
            </View>
        </View>
    );

    const ContactItem = ({icon, title, value, onPress}: {
        icon: string;
        title: string;
        value: string;
        onPress?: () => void;
    }) => (
        <TouchableOpacity 
            style={styles.contactItem} 
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            <View style={styles.contactItemLeft}>
                <View style={styles.contactIcon}>
                    <Ionicons name={icon as any} size={20} color={Colors.primary} />
                </View>
                <View style={styles.contactContent}>
                    <StyledText style={styles.contactTitle}>{title}</StyledText>
                    <StyledText style={styles.contactValue}>{value}</StyledText>
                </View>
            </View>
            {onPress && (
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
                <StyledText style={styles.headerTitle}>{t("aboutChehadeti") || "About Chehadeti"}</StyledText>
                <View style={styles.headerRight} />
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* App Logo and Title */}
                <View style={styles.logoSection}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="school" size={60} color={Colors.primary} />
                    </View>
                    <StyledText style={styles.appTitle}>Chehadeti</StyledText>
                    <StyledText style={styles.appTagline}>{t("lmsTagline") || "Learning Management System"}</StyledText>
                    <StyledText style={styles.appVersion}>{t("version") || "Version"} 1.0.0</StyledText>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <StyledText style={styles.sectionTitle}>{t("aboutChehadeti") || "About Chehadeti"}</StyledText>
                    <StyledText style={styles.description}>
                        {t("chehadetiDescription") || "Chehadeti is a comprehensive Learning Management System designed to provide students with easy access to their educational content, courses, and learning materials. Our platform enables seamless learning experiences with secure document viewing, course management, and progress tracking."}
                    </StyledText>
                </View>

                {/* Key Features */}
                <View style={styles.section}>
                    <StyledText style={styles.sectionTitle}>{t("keyFeatures") || "Key Features"}</StyledText>
                    
                    <View style={styles.featuresContainer}>
                        <FeatureItem
                            icon="book-outline"
                            title={t("courseManagement") || "Course Management"}
                            description="Access and manage your courses efficiently"
                        />
                        <FeatureItem
                            icon="shield-checkmark-outline"
                            title={t("secureDocumentViewing") || "Secure Document Viewing"}
                            description="View documents with advanced security features"
                        />
                        <FeatureItem
                            icon="lock-closed-outline"
                            title={t("contentProtection") || "Content Protection"}
                            description="Protect educational content from unauthorized access"
                        />
                        <FeatureItem
                            icon="language-outline"
                            title={t("multiLanguageSupport") || "Multi-language Support"}
                            description="Available in multiple languages"
                        />
                        <FeatureItem
                            icon="person-outline"
                            title={t("userProfileManagement") || "User Profile Management"}
                            description="Manage your profile and account settings"
                        />
                    </View>
                </View>

                {/* Contact Information */}
                <View style={styles.section}>
                    <StyledText style={styles.sectionTitle}>{t("contactInformation") || "Contact Information"}</StyledText>
                    
                    <View style={styles.contactContainer}>
                        <ContactItem
                            icon="call-outline"
                            title={t("supportPhone") || "Support Phone"}
                            value="+222 3684 1098"
                            onPress={() => Linking.openURL('tel:+22236841098')}
                        />
                    </View>
                </View>

                {/* Developer Information */}
                <View style={styles.section}>
                    <StyledText style={styles.sectionTitle}>{t("developedBy") || "Developed By"}</StyledText>
                    
                    <View style={styles.developerCard}>
                        <View style={styles.developerIcon}>
                            <Ionicons name="code-slash" size={32} color={Colors.primary} />
                        </View>
                        <View style={styles.developerContent}>
                            <StyledText style={styles.developerTitle}>Digi Wave</StyledText>
                            <StyledText style={styles.developerDescription}>
                                {t("developerDescription") || "Professional software development company specializing in educational technology solutions."}
                            </StyledText>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <StyledText style={styles.footerText}>
                        {t("allRightsReserved") || "All rights reserved."}
                    </StyledText>

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
    logoSection: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 20,
    },
    appTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: Colors.primary,
        fontFamily: FontsEnum.Poppins_700Bold,
        marginBottom: 8,
    },
    appTagline: {
        fontSize: 16,
        color: '#6B7280',
        fontFamily: FontsEnum.Poppins_400Regular,
        marginBottom: 4,
    },
    appVersion: {
        fontSize: 14,
        color: '#9CA3AF',
        fontFamily: FontsEnum.Poppins_400Regular,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        fontFamily: FontsEnum.Poppins_600SemiBold,
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: '#4B5563',
        fontFamily: FontsEnum.Poppins_400Regular,
        lineHeight: 24,
    },
    featuresContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        fontFamily: FontsEnum.Poppins_600SemiBold,
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
        color: '#6B7280',
        fontFamily: FontsEnum.Poppins_400Regular,
        lineHeight: 20,
    },
    contactContainer: {
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
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    contactItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    contactIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contactContent: {
        flex: 1,
    },
    contactTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
        fontFamily: FontsEnum.Poppins_500Medium,
        marginBottom: 2,
    },
    contactValue: {
        fontSize: 16,
        fontWeight: '400',
        color: '#1F2937',
        fontFamily: FontsEnum.Poppins_400Regular,
    },
    developerCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    developerIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    developerContent: {
        flex: 1,
    },
    developerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        fontFamily: FontsEnum.Poppins_600SemiBold,
        marginBottom: 8,
    },
    developerDescription: {
        fontSize: 14,
        color: '#6B7280',
        fontFamily: FontsEnum.Poppins_400Regular,
        lineHeight: 20,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    footerText: {
        fontSize: 12,
        color: '#9CA3AF',
        fontFamily: FontsEnum.Poppins_400Regular,
        marginBottom: 4,
    },
    bottomSpacing: {
        height: 20,
    },
});

export default AboutScreen;
