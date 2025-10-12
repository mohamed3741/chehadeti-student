import React, {useState, useEffect} from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
} from 'react-native';
import {useNavigation, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {StyledText} from "../../components/StyledText";
import {FontsEnum} from "../../constants/FontsEnum";
import {useTranslation} from "react-i18next";
import {Ionicons} from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import {LinearGradient} from "expo-linear-gradient";
import {LMSApi} from "../../api/LMSApi";
import {ChapterDTO, CourseDTO} from "../../models/LMS";
import {Toast} from "../../components/Toast";
import {TabHomeParamList} from "../../types";

type CourseDetailScreenNavigationProp = StackNavigationProp<TabHomeParamList, 'CourseDetail'>;
type CourseDetailScreenRouteProp = RouteProp<TabHomeParamList, 'CourseDetail'>;

interface CourseDetailScreenProps {
    route: CourseDetailScreenRouteProp;
}

const CourseDetailScreen = ({route}: CourseDetailScreenProps) => {
    const {course} = route.params;
    const navigation = useNavigation<CourseDetailScreenNavigationProp>();
    const {t} = useTranslation();
    const [chapters, setChapters] = useState<ChapterDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchChapters();
    }, []);

    const fetchChapters = async () => {
        try {
            setLoading(true);
            const result = await LMSApi.getChaptersByCourse(course.id);
            if (result?.ok && result?.data) {
                const sortedChapters = (result.data || []).sort((a, b) =>
                    (a.sortId || 0) - (b.sortId || 0)
                );
                setChapters(sortedChapters);
            } else {
                Toast(t('errorFetchingChapters') || 'Error fetching chapters');
            }
        } catch (error) {
            console.error('Error fetching chapters:', error);
            Toast(t('errorFetchingChapters') || 'Error fetching chapters');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchChapters();
    };

    const renderChapterCard = ({item, index}: {item: ChapterDTO; index: number}) => (
        <TouchableOpacity
            style={styles.chapterCard}
            onPress={() => navigation.navigate('ChapterDetail', {chapter: item})}
            activeOpacity={0.7}
        >
            <View style={styles.chapterNumber}>
                <StyledText style={styles.chapterNumberText}>{index + 1}</StyledText>
            </View>
            <View style={styles.chapterInfo}>
                <StyledText style={styles.chapterTitle} numberOfLines={2}>
                    {item.title}
                </StyledText>
                {item.description && (
                    <StyledText style={styles.chapterDescription} numberOfLines={2}>
                        {item.description}
                    </StyledText>
                )}
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={80} color="#CCCCCC" />
            <StyledText style={styles.emptyTitle}>
                {t('noChapters') || 'No Chapters Available'}
            </StyledText>
            <StyledText style={styles.emptyMessage}>
                {t('noChaptersMessage') || 'This course has no chapters yet.'}
            </StyledText>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <StyledText style={styles.headerTitle} numberOfLines={2}>
                        {course.title}
                    </StyledText>
                    {course.description && (
                        <StyledText style={styles.headerDescription} numberOfLines={2}>
                            {course.description}
                        </StyledText>
                    )}
                </View>
            </View>

            {/* Chapters List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <StyledText style={styles.loadingText}>
                        {t('loadingChapters') || 'Loading chapters...'}
                    </StyledText>
                </View>
            ) : (
                <FlatList
                    data={chapters}
                    renderItem={renderChapterCard}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.chaptersList}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[Colors.primary]}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
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
        paddingBottom: 24,
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
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerContent: {
        paddingRight: 40,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: FontsEnum.Poppins_600SemiBold,
        marginBottom: 8,
    },
    headerDescription: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        fontFamily: FontsEnum.Poppins_400Regular,
        lineHeight: 20,
    },
    chaptersList: {
        padding: 20,
        paddingBottom: 40,
    },
    chapterCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        gap: 12,
    },
    chapterNumber: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: Colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    chapterNumberText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.primary,
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    chapterInfo: {
        flex: 1,
    },
    chapterTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        fontFamily: FontsEnum.Poppins_600SemiBold,
        marginBottom: 4,
    },
    chapterDescription: {
        fontSize: 13,
        color: '#666666',
        fontFamily: FontsEnum.Poppins_400Regular,
        lineHeight: 18,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
});

export default CourseDetailScreen;

