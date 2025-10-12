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
import {SubsectionDTO, ContentDTO, MediaEnum} from "../../models/LMS";
import {Toast} from "../../components/Toast";
import {TabHomeParamList} from "../../types";

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

    const getContentIcon = (type?: MediaEnum) => {
        switch (type) {
            case MediaEnum.IMAGE:
                return 'image-outline';
            case MediaEnum.VIDEO:
                return 'play-circle-outline';
            case MediaEnum.DOCUMENT:
                return 'document-text-outline';
            case MediaEnum.AUDIO:
                return 'musical-notes-outline';
            default:
                return 'document-outline';
        }
    };

    const getContentColor = (type?: MediaEnum) => {
        switch (type) {
            case MediaEnum.IMAGE:
                return '#10B981';
            case MediaEnum.VIDEO:
                return '#EF4444';
            case MediaEnum.DOCUMENT:
                return '#3B82F6';
            case MediaEnum.AUDIO:
                return '#F59E0B';
            default:
                return Colors.primary;
        }
    };

    const renderContentCard = ({item}: {item: ContentDTO}) => {
        const iconName = getContentIcon(item.media?.type);
        const iconColor = getContentColor(item.media?.type);

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
                    {item.media && (
                        <View style={styles.contentMeta}>
                            <View style={[styles.badge, {backgroundColor: iconColor + '15'}]}>
                                <StyledText style={[styles.badgeText, {color: iconColor}]}>
                                    {item.media.type}
                                </StyledText>
                            </View>
                        </View>
                    )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
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
    },
    contentsList: {
        padding: 20,
        paddingBottom: 40,
    },
    contentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
        gap: 12,
    },
    contentIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentInfo: {
        flex: 1,
    },
    contentTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333333',
        fontFamily: FontsEnum.Poppins_600SemiBold,
        marginBottom: 4,
    },
    contentDescription: {
        fontSize: 12,
        color: '#666666',
        fontFamily: FontsEnum.Poppins_400Regular,
        lineHeight: 16,
        marginBottom: 6,
    },
    contentMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '600',
        fontFamily: FontsEnum.Poppins_600SemiBold,
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

export default SubsectionContentsScreen;

