import React, {useState, useEffect} from 'react';
import {
    Linking,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    ScrollView,
    Text
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useAuth} from '../../hooks/useAuth';
import {StyledText} from "../../components/StyledText";
import {FontsEnum} from "../../constants/FontsEnum";
import {useTranslation} from "react-i18next";
import {Ionicons} from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import {LinearGradient} from "expo-linear-gradient";
import {LMSApi} from "../../api/LMSApi";
import {CourseDTO, SearchResultDTO, LastVisitedContentDTO} from "../../models/LMS";
import {Toast} from "../../components/Toast";
import {TabHomeParamList} from "../../types";
import {SearchComponent} from "../../components/SearchComponent";
import {LastVisitedComponent} from "../../components/LastVisitedComponent";

type HomeScreenNavigationProp = StackNavigationProp<TabHomeParamList, 'TabHomeScreen'>;

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const {connectedUser, logOut} = useAuth();
    const {t} = useTranslation();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [courses, setCourses] = useState<CourseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (connectedUser && (connectedUser.isTelVerified === false || connectedUser.isTelVerified === null)) {
            setShowVerificationModal(true);
        } else {
            setShowVerificationModal(false);
        }
    }, [connectedUser]);

    useEffect(() => {
        if (connectedUser?.isTelVerified && connectedUser?.classe?.id) {
            fetchCourses();
        }
    }, [connectedUser]);

    const fetchCourses = async () => {
        if (!connectedUser?.classe?.id) {

            return;
        }

        try {
            setLoading(true);


            const result = await LMSApi.getCoursesByClasse(connectedUser.classe.id);


            if (result?.ok) {
                if (result?.data && Array.isArray(result.data)) {
                    const sortedCourses = result.data.sort((a, b) =>
                        (a.sortId || 0) - (b.sortId || 0)
                    );

                    setCourses(sortedCourses);
                } else if (result?.data) {
                    // Handle case where data might not be an array

                    setCourses([result.data]);
                } else {

                    setCourses([]);
                }
            } else {
                console.error('API call failed:', {
                    status: result?.status,
                    problem: result?.problem,
                    data: result?.data
                });
                Toast(t('errorFetchingCourses') || 'Error fetching courses');
            }
        } catch (error) {
            console.error('Exception while fetching courses:', error);
            Toast(t('errorFetchingCourses') || 'Error fetching courses');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchCourses();
    };

    const handleLogOut = async () => {
        await logOut();
        setIsModalVisible(false);
    };

    const confirmLogout = () => {
        setIsModalVisible(true);
    };

    // Navigation handlers for search results
    const handleSearchResultPress = async (result: SearchResultDTO) => {
        try {

            
            // Track the visit
            await LMSApi.trackContentVisit(result.id);
            
            // Navigate based on result type
            switch (result.type) {
                case 'COURSE':
                    const course: CourseDTO = {
                        id: result.id,
                        title: result.title,
                        description: result.description,
                    };
                    navigation.navigate('CourseDetail', { course });
                    break;
                case 'CHAPTER':
                    const chapter = {
                        id: result.id,
                        title: result.title,
                        description: result.description,
                        courseId: result.courseId,
                    };
                    navigation.navigate('ChapterDetail', { chapter });
                    break;
                case 'SUBSECTION':
                    const subsection = {
                        id: result.id,
                        title: result.title,
                        description: result.description,
                        chapterId: result.chapterId,
                    };
                    navigation.navigate('SubsectionContents', { subsection });
                    break;
            }
        } catch (error) {
            console.error('Error handling search result:', error);
            Toast('Error opening content');
        }
    };

    // Navigation handler for last visited content
    const handleLastVisitedPress = async (content: LastVisitedContentDTO) => {
        try {

            
            // Fetch the full content with media links
            const contentResult = await LMSApi.getContentById(content.contentId);
            
            if (contentResult.ok && contentResult.data) {

                
                // Track the visit
                await LMSApi.trackContentVisit(content.contentId);
                
                // Navigate to content viewer with full content data
                navigation.navigate('ContentViewer', { content: contentResult.data });
            } else {
                console.error('❌ Failed to fetch content:', contentResult);
                Toast('Error loading content');
            }
        } catch (error) {
            console.error('Error handling last visited content:', error);
            Toast('Error opening content');
        }
    };


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


    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={80} color="#CCCCCC" />
            <StyledText style={styles.emptyTitle}>
                {t('noCourses') || 'No Courses Available'}
            </StyledText>
            <StyledText style={styles.emptyMessage}>
                {t('noCoursesMessage') || 'Your class has no courses yet. Check back later!'}
            </StyledText>
        </View>
    );

    return (
        <View style={{flex: 1, backgroundColor: '#F5F7FA'}}>
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

            {/* Logout Confirmation Modal */}
            <Modal
                visible={isModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIconContainer}>
                            <View style={styles.logoutIconWrapper}>
                                <Ionicons name="log-out-outline" size={60} color="#EF4444" />
                            </View>
                        </View>

                        <StyledText style={styles.modalTitle}>
                            {t('confirmLogout') || 'Confirm Logout'}
                        </StyledText>

                        <StyledText style={styles.modalMessage}>
                            {t('confirmLogoutMessage') || 'Are you sure you want to logout?'}
                        </StyledText>

                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setIsModalVisible(false)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.cancelButtonText}>
                                    {t('cancel') || 'Cancel'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.logoutConfirmButton}
                                onPress={handleLogOut}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.logoutConfirmButtonText}>
                                    {t('logout') || 'Logout'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Main Content for Verified Users */}
            {connectedUser?.isTelVerified && (
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <View>
                                <StyledText style={styles.greeting}>
                                    {t('hello') || 'Hello'}, {connectedUser.firstName}!
                                </StyledText>
                                <StyledText style={styles.className}>
                                    {connectedUser.classe?.name || t('noClass')}
                                </StyledText>
                            </View>
                            <TouchableOpacity
                                style={styles.profileButton}
                                onPress={() => navigation.navigate('Profile')}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="person-circle-outline" size={32} color={'#FFF'} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Search Component */}
                    <SearchComponent 
                        onResultPress={handleSearchResultPress}
                        placeholder={t('searchPlaceholder') || 'Search courses, chapters, and content...'}
                    />

                    <ScrollView
                        style={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{paddingBottom : 50}}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[Colors.primary]}
                            />
                        }
                    >
                        {(() => {

                            return null;
                        })()}
                        <LastVisitedComponent 
                            onContentPress={handleLastVisitedPress}
                            limit={5}
                        />

                        <View style={styles.coursesSection}>
                            <View style={styles.sectionHeader}>
                                <StyledText style={styles.sectionTitle}>
                                    {t('myCourses') || 'My Courses'}
                                </StyledText>
                                <StyledText style={styles.courseCount}>
                                    {courses.length} {courses.length === 1 ? 'course' : 'courses'}
                                </StyledText>
                            </View>

                            {loading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color={Colors.primary} />
                                    <StyledText style={styles.loadingText}>
                                        {t('loadingCourses') || 'Loading courses...'}
                                    </StyledText>
                                </View>
                            ) : courses.length > 0 ? (
                                <View style={styles.coursesGrid}>
                                    {courses.map((course) => (
                                        <TouchableOpacity
                                            key={course.id}
                                            style={styles.courseCard}
                                            onPress={() => navigation.navigate('CourseDetail', {course})}
                                            activeOpacity={0.7}
                                        >
                                            <LinearGradient
                                                colors={['#6A35C1', '#8B5FCF']}
                                                style={styles.courseGradient}
                                                start={{x: 0, y: 0}}
                                                end={{x: 1, y: 1}}
                                            >
                                                <View style={styles.courseIcon}>
                                                    <Ionicons name="book" size={32} color="#FFFFFF" />
                                                </View>
                                                <View style={styles.courseInfo}>
                                                    <StyledText style={styles.courseTitle} numberOfLines={2}>
                                                        {course.title}
                                                    </StyledText>
                                                    {course.description && (
                                                        <StyledText style={styles.courseDescription} numberOfLines={2}>
                                                            {course.description}
                                                        </StyledText>
                                                    )}
                                                </View>
                                                <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ) : (
                                renderEmptyState()
                            )}
                        </View>

                        {renderFooter()}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        backgroundColor: Colors.primary,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    className: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        fontFamily: FontsEnum.Poppins_400Regular,
        marginTop: 4,
    },
    profileButton: {
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
    },
    scrollContainer: {
        flex: 1,
    },
    coursesSection: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    courseCount: {
        fontSize: 14,
        color: '#6B7280',
        fontFamily: FontsEnum.Poppins_400Regular,
    },
    coursesGrid: {
        gap: 16,
    },
    courseCard: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
        marginBottom: 16,
    },
    courseGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 16,
    },
    courseIcon: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    courseInfo: {
        flex: 1,
    },
    courseTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: FontsEnum.Poppins_600SemiBold,
        marginBottom: 4,
    },
    courseDescription: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.85)',
        fontFamily: FontsEnum.Poppins_400Regular,
        lineHeight: 18,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666666',
        fontFamily: FontsEnum.Poppins_400Regular,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333333',
        fontFamily: FontsEnum.Poppins_600SemiBold,
        marginTop: 24,
        marginBottom: 8,
    },
    emptyMessage: {
        fontSize: 14,
        color: '#666666',
        fontFamily: FontsEnum.Poppins_400Regular,
        textAlign: 'center',
        lineHeight: 20,
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
    logoutIconWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        flex: 1,
        borderRadius: 12,
        height : 20,
        backgroundColor: '#F3F4F6',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666666',
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    logoutConfirmButton: {
        flex: 1,
        borderRadius: 12,
        backgroundColor: '#EF4444',
        paddingVertical: 14,
        paddingHorizontal: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        height : 20,
        shadowColor: '#EF4444',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    logoutConfirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },

});

export default HomeScreen;
