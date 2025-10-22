import React, { useState, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyledText } from './StyledText';
import { FontsEnum } from '../constants/FontsEnum';
import Colors from '../constants/Colors';
import { LMSApi } from '../api/LMSApi';
import { LastVisitedContentDTO } from '../models/LMS';

interface LastVisitedComponentProps {
    onContentPress: (content: LastVisitedContentDTO) => void;
    limit?: number;
}

export const LastVisitedComponent: React.FC<LastVisitedComponentProps> = ({
    onContentPress,
    limit = 5
}) => {
    const [lastVisited, setLastVisited] = useState<LastVisitedContentDTO | null>(null);
    const [recentVisits, setRecentVisits] = useState<LastVisitedContentDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingContentId, setLoadingContentId] = useState<number | null>(null);

    useEffect(() => {
        fetchLastVisitedData();
    }, []);

    const fetchLastVisitedData = async () => {
        try {
            setLoading(true);
            
            // Fetch both last visited and recent visits in parallel
            const [lastVisitedResult, recentVisitsResult] = await Promise.all([
                LMSApi.getLastVisitedContent(),
                LMSApi.getRecentVisitedContent(limit)
            ]);

            if (lastVisitedResult.ok && lastVisitedResult.data) {
                console.log('📊 Last visited data received:', lastVisitedResult.data);
                setLastVisited(lastVisitedResult.data);
            } else {
                console.log('❌ Last visited API failed:', lastVisitedResult);
            }

            if (recentVisitsResult.ok && recentVisitsResult.data) {
                console.log('📊 Recent visits data received:', recentVisitsResult.data);
                setRecentVisits(recentVisitsResult.data);
            } else {
                console.log('❌ Recent visits API failed:', recentVisitsResult);
            }
        } catch (error) {
            console.error('Error fetching last visited data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchLastVisitedData();
    };

    const handleContentPress = async (content: LastVisitedContentDTO) => {
        try {
            setLoadingContentId(content.contentId);
            await onContentPress(content);
        } finally {
            setLoadingContentId(null);
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;
        
        return date.toLocaleDateString();
    };

    const getContentIcon = (contentType: string) => {
        switch (contentType.toUpperCase()) {
            case 'PDF':
                return 'document-text';
            case 'VIDEO':
                return 'play-circle';
            case 'AUDIO':
                return 'musical-notes';
            case 'IMAGE':
                return 'image';
            case 'TEXT':
                return 'document';
            case 'QUIZ':
                return 'help-circle';
            case 'ASSIGNMENT':
                return 'clipboard';
            default:
                return 'document';
        }
    };

    const getContentColor = (contentType: string) => {
        switch (contentType.toUpperCase()) {
            case 'PDF':
                return '#EF4444';
            case 'VIDEO':
                return '#8B5CF6';
            case 'AUDIO':
                return '#F59E0B';
            case 'IMAGE':
                return '#10B981';
            case 'TEXT':
                return '#06B6D4';
            case 'QUIZ':
                return '#EC4899';
            case 'ASSIGNMENT':
                return '#84CC16';
            default:
                return '#6B7280';
        }
    };

    const renderLastVisitedCard = () => {
        console.log('🎯 renderLastVisitedCard called with:', lastVisited);
        
        if (!lastVisited) {
            console.log('❌ No lastVisited data, not rendering card');
            return null;
        }

        console.log('✅ Rendering last visited card for:', lastVisited.contentTitle);

        return (
            <TouchableOpacity
                style={styles.lastVisitedCard}
                onPress={() => handleContentPress(lastVisited)}
                activeOpacity={0.8}
                disabled={loadingContentId === lastVisited.contentId}
            >
                <LinearGradient
                    colors={[getContentColor(lastVisited.contentType) + '20', getContentColor(lastVisited.contentType) + '10']}
                    style={styles.lastVisitedGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.lastVisitedHeader}>
                        <View style={styles.lastVisitedIconContainer}>
                            <View style={[styles.lastVisitedIcon, { backgroundColor: getContentColor(lastVisited.contentType) }]}>
                                <Ionicons 
                                    name={getContentIcon(lastVisited.contentType) as any} 
                                    size={24} 
                                    color="#FFFFFF" 
                                />
                            </View>
                        </View>
                        <View style={styles.lastVisitedBadge}>
                            <StyledText style={styles.lastVisitedBadgeText}>
                                Last Visited
                            </StyledText>
                        </View>
                    </View>
                    
                    <View style={styles.lastVisitedContent}>
                        <StyledText style={styles.lastVisitedTitle} numberOfLines={2}>
                            {lastVisited.contentTitle}
                        </StyledText>
                        
                        <View style={styles.lastVisitedMeta}>
                            <StyledText style={styles.lastVisitedType}>
                                {lastVisited.contentType}
                            </StyledText>
                            <StyledText style={styles.lastVisitedTime}>
                                {formatTimeAgo(lastVisited.lastVisitedAt)}
                            </StyledText>
                        </View>
                        
                        {(lastVisited.courseTitle || lastVisited.chapterTitle) && (
                            <View style={styles.lastVisitedPath}>
                                <Ionicons name="location" size={12} color="#9CA3AF" />
                                <StyledText style={styles.lastVisitedPathText} numberOfLines={1}>
                                    {lastVisited.courseTitle}
                                    {lastVisited.chapterTitle && ` • ${lastVisited.chapterTitle}`}
                                </StyledText>
                            </View>
                        )}
                    </View>
                    
                    <View style={styles.lastVisitedArrow}>
                        {loadingContentId === lastVisited.contentId ? (
                            <ActivityIndicator size="small" color={getContentColor(lastVisited.contentType)} />
                        ) : (
                            <Ionicons name="chevron-forward" size={20} color={getContentColor(lastVisited.contentType)} />
                        )}
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    const renderRecentVisitItem = ({ item }: { item: LastVisitedContentDTO }) => (
        <TouchableOpacity
            style={styles.recentVisitItem}
            onPress={() => handleContentPress(item)}
            activeOpacity={0.7}
            disabled={loadingContentId === item.contentId}
        >
            <View style={styles.recentVisitContent}>
                <View style={[styles.recentVisitIcon, { backgroundColor: getContentColor(item.contentType) + '20' }]}>
                    <Ionicons 
                        name={getContentIcon(item.contentType) as any} 
                        size={16} 
                        color={getContentColor(item.contentType)} 
                    />
                </View>
                
                <View style={styles.recentVisitTextContainer}>
                    <StyledText style={styles.recentVisitTitle} numberOfLines={1}>
                        {item.contentTitle}
                    </StyledText>
                    <View style={styles.recentVisitMeta}>
                        <StyledText style={styles.recentVisitType}>
                            {item.contentType}
                        </StyledText>
                        <StyledText style={styles.recentVisitTime}>
                            {formatTimeAgo(item.lastVisitedAt)}
                        </StyledText>
                    </View>
                </View>
                
                {loadingContentId === item.contentId ? (
                    <ActivityIndicator size="small" color="#9CA3AF" />
                ) : (
                    <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
                )}
            </View>
        </TouchableOpacity>
    );

    // Don't render anything if loading or no data
    if (loading) {
        console.log('🔄 LastVisitedComponent: Loading state, hiding component');
        return null; // Hide component while loading
    }

    // Debug logging
    console.log('🔍 LastVisitedComponent render check:', {
        lastVisited: lastVisited,
        recentVisitsLength: recentVisits.length,
        hasLastVisited: !!lastVisited,
        hasRecentVisits: recentVisits.length > 0
    });

    // Don't render anything if there's no recent activity
    if (!lastVisited && recentVisits.length === 0) {
        console.log('❌ LastVisitedComponent: No data, hiding component');
        return null; // Hide component when no data
    }

    console.log('✅ LastVisitedComponent: Rendering component with data');

    return (
        <View style={styles.container}>
            {/* Last Visited Card */}
            {renderLastVisitedCard()}
            
            {/* Recent Visits */}
            {recentVisits.length > 0 && (
                <View style={styles.recentVisitsSection}>
                    <View style={styles.sectionHeader}>
                        <StyledText style={styles.sectionTitle}>
                            Recent Visits
                        </StyledText>
                        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
                            <Ionicons name="refresh" size={16} color={Colors.primary} />
                        </TouchableOpacity>
                    </View>
                    
                    <FlatList
                        data={recentVisits}
                        renderItem={renderRecentVisitItem}
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[Colors.primary]}
                            />
                        }
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
    },
    lastVisitedCard: {
        marginBottom: 20,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    lastVisitedGradient: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    lastVisitedHeader: {
        alignItems: 'center',
        marginRight: 16,
    },
    lastVisitedIconContainer: {
        marginBottom: 8,
    },
    lastVisitedIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lastVisitedBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    lastVisitedBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#374151',
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    lastVisitedContent: {
        flex: 1,
    },
    lastVisitedTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        fontFamily: FontsEnum.Poppins_600SemiBold,
        marginBottom: 8,
    },
    lastVisitedMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    lastVisitedType: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
        fontFamily: FontsEnum.Poppins_500Medium,
        textTransform: 'uppercase',
    },
    lastVisitedTime: {
        fontSize: 12,
        color: '#9CA3AF',
        fontFamily: FontsEnum.Poppins_400Regular,
        marginLeft: 8,
    },
    lastVisitedPath: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    lastVisitedPathText: {
        fontSize: 12,
        color: '#9CA3AF',
        fontFamily: FontsEnum.Poppins_400Regular,
        marginLeft: 4,
        flex: 1,
    },
    lastVisitedArrow: {
        marginLeft: 12,
    },
    recentVisitsSection: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    refreshButton: {
        padding: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    recentVisitItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    recentVisitContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    recentVisitIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    recentVisitTextContainer: {
        flex: 1,
    },
    recentVisitTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
        fontFamily: FontsEnum.Poppins_500Medium,
        marginBottom: 4,
    },
    recentVisitMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    recentVisitType: {
        fontSize: 11,
        fontWeight: '500',
        color: '#6B7280',
        fontFamily: FontsEnum.Poppins_500Medium,
        textTransform: 'uppercase',
    },
    recentVisitTime: {
        fontSize: 11,
        color: '#9CA3AF',
        fontFamily: FontsEnum.Poppins_400Regular,
        marginLeft: 6,
    },
});
