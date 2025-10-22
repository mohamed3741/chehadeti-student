import React, {useState, useEffect} from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
    Dimensions,
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
import {SubsectionDTO, ContentDTO, ContentType} from "../../models/LMS";
import {Toast} from "../../components/Toast";
import {TabHomeParamList} from "../../types";

const {width} = Dimensions.get('window');

type SubsectionContentsScreenNavigationProp = StackNavigationProp<TabHomeParamList, 'SubsectionContents'>;
type SubsectionContentsScreenRouteProp = RouteProp<TabHomeParamList, 'SubsectionContents'>;

interface SubsectionContentsScreenProps {
    route: SubsectionContentsScreenRouteProp;
}

const SubsectionContentsScreen = ({route}: SubsectionContentsScreenProps) => {
    const {subsection} = route.params;
    const navigation = useNavigation<SubsectionContentsScreenNavigationProp>();
    const {t} = useTranslation();
    const [contents, setContents] = useState<ContentDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchContents();
    }, []);

    const fetchContents = async () => {
        try {
            setLoading(true);
            const result = await LMSApi.getContentsBySubsection(subsection.id);
            if (result?.ok && result?.data) {
                const sortedContents = (result.data || []).sort((a, b) =>
                    (a.sortId || 0) - (b.sortId || 0)
                );
                setContents(sortedContents);
            } else {
                Toast(t('errorFetchingContents') || 'Error fetching contents');
            }
        } catch (error) {
            console.error('Error fetching contents:', error);
            Toast(t('errorFetchingContents') || 'Error fetching contents');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchContents();
    };

    const getContentTypeFromString = (contentType?: string): ContentType => {
        if (!contentType) return ContentType.UNKNOWN;
        
        const upperType = contentType.toUpperCase();
        switch (upperType) {
            case 'PDF':
                return ContentType.PDF;
            case 'IMAGE':
                return ContentType.IMAGE;
            case 'VIDEO':
                return ContentType.VIDEO;
            case 'AUDIO':
                return ContentType.AUDIO;
            case 'DOCUMENT':
                return ContentType.DOCUMENT;
            case 'TEXT':
                return ContentType.TEXT;
            case 'LINK':
                return ContentType.LINK;
            case 'QUIZ':
                return ContentType.QUIZ;
            case 'ASSIGNMENT':
                return ContentType.ASSIGNMENT;
            default:
                return ContentType.UNKNOWN;
        }
    };

    const getContentIcon = (contentType?: string) => {
        const type = getContentTypeFromString(contentType);
        switch (type) {
            case ContentType.PDF:
                return 'document-text-outline';
            case ContentType.IMAGE:
                return 'image-outline';
            case ContentType.VIDEO:
                return 'play-circle-outline';
            case ContentType.AUDIO:
                return 'musical-notes-outline';
            case ContentType.DOCUMENT:
                return 'document-outline';
            case ContentType.TEXT:
                return 'text-outline';
            case ContentType.LINK:
                return 'link-outline';
            case ContentType.QUIZ:
                return 'help-circle-outline';
            case ContentType.ASSIGNMENT:
                return 'clipboard-outline';
            default:
                return 'document-outline';
        }
    };

    const getContentColor = (contentType?: string) => {
        const type = getContentTypeFromString(contentType);
        switch (type) {
            case ContentType.PDF:
                return '#DC2626'; // Red for PDF
            case ContentType.IMAGE:
                return '#10B981'; // Green for images
            case ContentType.VIDEO:
                return '#EF4444'; // Red for videos
            case ContentType.AUDIO:
                return '#F59E0B'; // Orange for audio
            case ContentType.DOCUMENT:
                return '#3B82F6'; // Blue for documents
            case ContentType.TEXT:
                return '#8B5CF6'; // Purple for text
            case ContentType.LINK:
                return '#06B6D4'; // Cyan for links
            case ContentType.QUIZ:
                return '#EC4899'; // Pink for quizzes
            case ContentType.ASSIGNMENT:
                return '#F97316'; // Orange for assignments
            default:
                return Colors.primary;
        }
    };

    const getContentTypeLabel = (contentType?: string) => {
        const type = getContentTypeFromString(contentType);
        switch (type) {
            case ContentType.PDF:
                return 'PDF Document';
            case ContentType.IMAGE:
                return 'Image';
            case ContentType.VIDEO:
                return 'Video';
            case ContentType.AUDIO:
                return 'Audio';
            case ContentType.DOCUMENT:
                return 'Document';
            case ContentType.TEXT:
                return 'Text Content';
            case ContentType.LINK:
                return 'External Link';
            case ContentType.QUIZ:
                return 'Quiz';
            case ContentType.ASSIGNMENT:
                return 'Assignment';
            default:
                return contentType || 'Content';
        }
    };

    const renderContentCard = ({item}: {item: ContentDTO}) => {
        const iconName = getContentIcon(item.contentType);
        const iconColor = getContentColor(item.contentType);
        const contentTypeLabel = getContentTypeLabel(item.contentType);
        const contentType = getContentTypeFromString(item.contentType);

        return (
            <TouchableOpacity
                style={styles.contentCard}
                onPress={() => navigation.navigate('ContentViewer', {content: item})}
                activeOpacity={0.7}
            >
                <LinearGradient
                    colors={[iconColor + '15', iconColor + '05']}
                    style={styles.contentIconContainer}
                >
                    <Ionicons name={iconName as any} size={28} color={iconColor} />
                </LinearGradient>
                <View style={styles.contentInfo}>
                    <StyledText style={styles.contentTitle} numberOfLines={2}>
                        {item.title}
                    </StyledText>
                    {item.description && (
                        <StyledText style={styles.contentDescription} numberOfLines={2}>
                            {item.description}
                        </StyledText>
                    )}
                    <View style={styles.contentMeta}>
                        <View style={[styles.badge, {backgroundColor: iconColor + '15'}]}>
                            <StyledText style={[styles.badgeText, {color: iconColor}]}>
                                {contentTypeLabel}
                            </StyledText>
                        </View>
                    </View>
                </View>
                <View style={styles.contentActions}>
                    <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="file-tray-outline" size={80} color="#CCCCCC" />
            <StyledText style={styles.emptyTitle}>
                {t('noContents') || 'No Contents Available'}
            </StyledText>
            <StyledText style={styles.emptyMessage}>
                {t('noContentsMessage') || 'This subsection has no contents yet.'}
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
                        {subsection.title}
                    </StyledText>
                    {subsection.description && (
                        <StyledText style={styles.headerDescription} numberOfLines={3}>
                            {subsection.description}
                        </StyledText>
                    )}
                    <View style={styles.headerStats}>
                        <View style={styles.statItem}>
                            <Ionicons name="document-outline" size={14} color="rgba(255, 255, 255, 0.8)" />
                            <StyledText style={styles.statText}>
                                {contents.length} {contents.length === 1 ? 'item' : 'items'}
                            </StyledText>
                        </View>
                    </View>
                </View>
            </View>

            {/* Contents List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <StyledText style={styles.loadingText}>
                        {t('loadingContents') || 'Loading contents...'}
                    </StyledText>
                </View>
            ) : (
                <FlatList
                    data={contents}
                    renderItem={renderContentCard}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.contentsList}
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
        backgroundColor: '#F8FAFC',
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
        fontSize: 22,
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
        marginBottom: 12,
    },
    headerStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.9)',
        fontFamily: FontsEnum.Poppins_500Medium,
        marginLeft: 4,
    },
    contentsList: {
        padding: 20,
        paddingBottom: 40,
    },
    contentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    contentIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contentInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    contentTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        fontFamily: FontsEnum.Poppins_600SemiBold,
        marginBottom: 4,
        lineHeight: 22,
    },
    contentDescription: {
        fontSize: 13,
        color: '#64748B',
        fontFamily: FontsEnum.Poppins_400Regular,
        lineHeight: 18,
        marginBottom: 8,
    },
    contentMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 8,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    contentActions: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#64748B',
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
        color: '#1E293B',
        fontFamily: FontsEnum.Poppins_600SemiBold,
        marginTop: 24,
        marginBottom: 8,
    },
    emptyMessage: {
        fontSize: 14,
        color: '#64748B',
        fontFamily: FontsEnum.Poppins_400Regular,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default SubsectionContentsScreen;

