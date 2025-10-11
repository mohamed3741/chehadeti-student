import React, {useMemo, useState} from 'react';
import {ActivityIndicator, FlatList, Linking, Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Feather, FontAwesome6, Ionicons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../hooks/useAuth';
import {StyledText} from "../../components/StyledText";
import {FontsEnum} from "../../constants/FontsEnum";
import {useTranslation} from "react-i18next";
import {usePermissions} from "../../hooks/usePermissions";
import {filterIconsByPermissions} from "../../utils/permissionUtils";


const HomeAdminScreen = () => {
    const navigation = useNavigation();
    const { connectedUser, logOut } = useAuth();
    const { t } = useTranslation();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const { permissions } = usePermissions();

    const handleLogOut = async () => {
        await logOut();
        setIsModalVisible(false);
    };

    const confirmLogout = () => setIsModalVisible(true);

    const iconData = useMemo(
        () => [
            { key: "teachers", icon: <Feather name="user" size={30} color="#F59E0B" />, screen: "TeachersListScreen" },
            { key: "students", icon: <Feather name="users" size={30} color="#3B82F6" />, screen: "StudentsScreen" },
            { key: "employees", icon: <Feather name="users" size={30} color="#10B981" />, screen: "EmployeesListScreen" },
            { key: "classes", icon: <Feather name="clipboard" size={30} color="#8B5CF6" />, screen: "ClassesListScreen" },
            { key: "blocks", icon: <FontAwesome6 name="building" size={30} color="#EC4899" />, screen: "BlocksListScreen" },
            { key: "exams", icon: <Feather name="check-square" size={30} color="#22C55E" />, screen: "ExamsListScreen" },
            { key: "results", icon: <Feather name="file-text" size={30} color="#F59E0B" />, screen: "ResultsListScreen" },
            { key: "attendance", icon: <Feather name="user-check" size={30} color="#06B6D4" />, screen: "AttendancesListScreen" },
            { key: "schedule", icon: <Feather name="calendar" size={30} color="#6366F1" />, screen: "EventsListScreen" },
            { key: "extra_expenses", icon: <Feather name="trending-down" size={30} color="#EF4444" />, screen: "ExtraExpensesScreen" },
            { key: "accounts", icon: <Ionicons name="wallet-outline" size={30} color="#0B3B8C" />, screen: "AccountsScreen" },
            { key: "settings", icon: <Ionicons name="settings-outline" size={30} color="#0B3B8C" />, screen: "SettingsScreen" },
            { key: "logout", icon: <Ionicons name="log-out-outline" size={30} color="#FF3B30" />, screen: "Logout" }
        ],
        []
    );

    const visibleIconData = useMemo(() => {
        return filterIconsByPermissions(iconData, permissions);
    }, [iconData, permissions]);

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

    const renderIconItem = ({ item }: { item: { key: string; icon: React.ReactNode; screen: string } }) => (
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
        <View style={{ flex: 1 }}>
            <View style={styles.container}>
                <FlatList
                    data={visibleIconData}
                    renderItem={renderIconItem}
                    ListFooterComponent={renderFooter}
                    keyExtractor={(item) => item.screen}
                    numColumns={3}
                    contentContainerStyle={styles.iconGrid}
                />
            </View>

            {/* Logout Confirmation Modal */}
            <Modal
                visible={isModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{t("confirm_logout_title")}</Text>
                        <Text style={styles.modalMessage}>{t("confirm_logout_message")}</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setIsModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>{t("cancel")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleLogOut}
                            >
                                <Text style={styles.confirmButtonText}>{t("logout")}</Text>
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

export default HomeAdminScreen;
