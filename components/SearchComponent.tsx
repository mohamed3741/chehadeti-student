import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Animated,
    Dimensions,
    Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyledText } from './StyledText';
import { FontsEnum } from '../constants/FontsEnum';
import Colors from '../constants/Colors';
import { LMSApi } from '../api/LMSApi';
import { SearchResultDTO } from '../models/LMS';

interface SearchComponentProps {
    onResultPress: (result: SearchResultDTO) => void;
    placeholder?: string;
}

const { width } = Dimensions.get('window');

export const SearchComponent: React.FC<SearchComponentProps> = ({
    onResultPress,
    placeholder = 'Search courses, chapters, and content...'
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResultDTO[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    
    const searchInputRef = useRef<TextInput>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-20)).current;

    useEffect(() => {
        const searchTimeout = setTimeout(() => {
            if (searchTerm.trim().length >= 2) {
                performSearch(searchTerm.trim());
            } else if (searchTerm.trim().length === 0) {
                setSearchResults([]);
                setShowResults(false);
                setHasSearched(false);
            }
        }, 300);

        return () => clearTimeout(searchTimeout);
    }, [searchTerm]);

    useEffect(() => {
        if (showResults) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: -20,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [showResults]);

    const performSearch = async (term: string) => {
        try {
            setIsSearching(true);
            const result = await LMSApi.searchByCriteria(term);
            
            if (result.ok && result.data) {
                setSearchResults(result.data);
                setShowResults(true);
                setHasSearched(true);
            } else {
                setSearchResults([]);
                setShowResults(true);
                setHasSearched(true);
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
            setShowResults(true);
            setHasSearched(true);
        } finally {
            setIsSearching(false);
        }
    };

    const handleResultPress = (result: SearchResultDTO) => {
        onResultPress(result);
        setShowResults(false);
        Keyboard.dismiss();
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSearchResults([]);
        setShowResults(false);
        setHasSearched(false);
        searchInputRef.current?.blur();
    };

    const getResultIcon = (type: string) => {
        switch (type) {
            case 'COURSE':
                return 'book';
            case 'CHAPTER':
                return 'list';
            case 'SUBSECTION':
                return 'document-text';
            default:
                return 'search';
        }
    };

    const getResultColor = (type: string) => {
        switch (type) {
            case 'COURSE':
                return '#8B5CF6';
            case 'CHAPTER':
                return '#06B6D4';
            case 'SUBSECTION':
                return '#10B981';
            default:
                return '#6B7280';
        }
    };

    const renderSearchResult = ({ item }: { item: SearchResultDTO }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => handleResultPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.resultContent}>
                <View style={[styles.resultIcon, { backgroundColor: getResultColor(item.type) + '20' }]}>
                    <Ionicons 
                        name={getResultIcon(item.type) as any} 
                        size={20} 
                        color={getResultColor(item.type)} 
                    />
                </View>
                <View style={styles.resultTextContainer}>
                    <StyledText style={styles.resultTitle} numberOfLines={1}>
                        {item.title}
                    </StyledText>
                    {item.description && (
                        <StyledText style={styles.resultDescription} numberOfLines={2}>
                            {item.description}
                        </StyledText>
                    )}
                    <View style={styles.resultMeta}>
                        <StyledText style={styles.resultType}>
                            {item.type.toLowerCase()}
                        </StyledText>
                        {item.courseTitle && (
                            <StyledText style={styles.resultCourse}>
                                • {item.courseTitle}
                            </StyledText>
                        )}
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#9CA3AF" />
            <StyledText style={styles.emptyTitle}>
                {hasSearched ? 'No results found' : 'Start typing to search'}
            </StyledText>
            <StyledText style={styles.emptyMessage}>
                {hasSearched 
                    ? `No content found for "${searchTerm}"`
                    : 'Search for courses, chapters, and content'
                }
            </StyledText>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Search Input */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                    <TextInput
                        ref={searchInputRef}
                        style={styles.searchInput}
                        placeholder={placeholder}
                        placeholderTextColor="#9CA3AF"
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        returnKeyType="search"
                        onSubmitEditing={() => {
                            if (searchTerm.trim().length >= 2) {
                                performSearch(searchTerm.trim());
                            }
                        }}
                    />
                    {searchTerm.length > 0 && (
                        <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                    {isSearching && (
                        <ActivityIndicator size="small" color={Colors.primary} style={styles.loadingIndicator} />
                    )}
                </View>
            </View>

            {/* Search Results */}
            {showResults && (
                <Animated.View 
                    style={[
                        styles.resultsContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <View style={styles.resultsHeader}>
                        <StyledText style={styles.resultsTitle}>
                            {isSearching ? 'Searching...' : `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`}
                        </StyledText>
                    </View>
                    
                    <FlatList
                        data={searchResults}
                        renderItem={renderSearchResult}
                        keyExtractor={(item) => `${item.type}-${item.id}`}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={renderEmptyState}
                        contentContainerStyle={styles.resultsList}
                        keyboardShouldPersistTaps="handled"
                    />
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        zIndex: 1000,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: FontsEnum.Poppins_400Regular,
        color: '#1F2937',
    },
    clearButton: {
        marginLeft: 8,
        padding: 4,
    },
    loadingIndicator: {
        marginLeft: 8,
    },
    resultsContainer: {
        position: 'absolute',
        top: 80,
        left: 20,
        right: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        maxHeight: 400,
    },
    resultsHeader: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    resultsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    resultsList: {
        paddingVertical: 8,
    },
    resultItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
    },
    resultContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resultIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    resultTextContainer: {
        flex: 1,
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        fontFamily: FontsEnum.Poppins_600SemiBold,
        marginBottom: 2,
    },
    resultDescription: {
        fontSize: 14,
        color: '#6B7280',
        fontFamily: FontsEnum.Poppins_400Regular,
        marginBottom: 4,
        lineHeight: 18,
    },
    resultMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resultType: {
        fontSize: 12,
        fontWeight: '500',
        color: '#9CA3AF',
        fontFamily: FontsEnum.Poppins_500Medium,
        textTransform: 'uppercase',
    },
    resultCourse: {
        fontSize: 12,
        color: '#9CA3AF',
        fontFamily: FontsEnum.Poppins_400Regular,
        marginLeft: 4,
    },
    emptyState: {
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
        fontFamily: FontsEnum.Poppins_600SemiBold,
        marginTop: 12,
        marginBottom: 4,
    },
    emptyMessage: {
        fontSize: 14,
        color: '#9CA3AF',
        fontFamily: FontsEnum.Poppins_400Regular,
        textAlign: 'center',
        lineHeight: 20,
    },
});
