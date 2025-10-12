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
import {LMSApi} from "../../api/LMSApi";
import {ChapterDTO, SubsectionDTO, ContentDTO} from "../../models/LMS";
import {Toast} from "../../components/Toast";
import {TabHomeParamList} from "../../types";

type ChapterDetailScreenNavigationProp = StackNavigationProp<TabHomeParamList, 'ChapterDetail'>;
type ChapterDetailScreenRouteProp = RouteProp<TabHomeParamList, 'ChapterDetail'>;

interface ChapterDetailScreenProps {
    route: ChapterDetailScreenRouteProp;
}

const ChapterDetailScreen = ({route}: ChapterDetailScreenProps) => {
    const {chapter} = route.params;
    const navigation = useNavigation<ChapterDetailScreenNavigationProp>();
    const {t} = useTranslation();
    const [subsections, setSubsections] = useState<SubsectionDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchSubsections();
    }, []);

    const fetchSubsections = async () => {
        try {
            setLoading(true);
            const result = await LMSApi.getSubsectionsByChapter(chapter.id);
            if (result?.ok && result?.data) {
                const sortedSubsections = (result.data || []).sort((a, b) =>
                    (a.sortId || 0) - (b.sortId || 0)
                );
                setSubsections(sortedSubsections);
            } else {
                Toast(t('errorFetchingSubsections') || 'Error fetching subsections');
            }
        } catch (error) {
            console.error('Error fetching subsections:', error);
            Toast(t('errorFetchingSubsections') || 'Error fetching subsections');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchSubsections();
    };

    const renderSubsectionCard = ({item, index}: {item: SubsectionDTO; index: number}) => (
        <TouchableOpacity
            style={styles.subsectionCard}
            onPress={() => navigation.navigate('SubsectionContents', {subsection: item})}
            activeOpacity={0.7}
        >
            <View style={styles.subsectionIconContainer}>
                <Ionicons name="list-outline" size={24} color={Colors.primary} />
            </View>
            <View style={styles.subsectionInfo}>
                <StyledText style={styles.subsectionTitle} numberOfLines={2}>
                    {item.title}
                </StyledText>
                {item.description && (
                    <StyledText style={styles.subsectionDescription} numberOfLines={2}>
                        {item.description}
                    </StyledText>
                )}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="albums-outline" size={80} color="#CCCCCC" />
            <StyledText style={styles.emptyTitle}>
                {t('noSubsections') || 'No Subsections Available'}
            </StyledText>
            <StyledText style={styles.emptyMessage}>
                {t('noSubsectionsMessage') || 'This chapter has no subsections yet.'}
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
                        {chapter.title}
                    </StyledText>
                    {chapter.description && (
                        <StyledText style={styles.headerDescription} numberOfLines={3}>
                            {chapter.description}
                        </StyledText>
                    )}
                </View>
            </View>

            {/* Subsections List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <StyledText style={styles.loadingText}>
                        {t('loadingSubsections') || 'Loading subsections...'}
                    </StyledText>
                </View>
            ) : (
                <FlatList
                    data={subsections}
                    renderItem={renderSubsectionCard}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.subsectionsList}
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
    subsectionsList: {
        padding: 20,
        paddingBottom: 40,
    },
    subsectionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
        gap: 12,
    },
    subsectionIconContainer: {
        width: 42,
        height: 42,
        borderRadius: 10,
        backgroundColor: Colors.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
    },
    subsectionInfo: {
        flex: 1,
    },
    subsectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333333',
        fontFamily: FontsEnum.Poppins_600SemiBold,
        marginBottom: 4,
    },
    subsectionDescription: {
        fontSize: 12,
        color: '#666666',
        fontFamily: FontsEnum.Poppins_400Regular,
        lineHeight: 16,
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

export default ChapterDetailScreen;

