import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyledText } from './StyledText';
import { FontsEnum } from '../constants/FontsEnum';
import Colors from '../constants/Colors';

// Array of prayers (only the prayer text, without the "حديث صحيح" part)
const PRAYERS = [
    'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا',
    'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا',
    'اللَّهُمَّ أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ',
    'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ',
    'اللَّهُمَّ رَحْمَتَكَ أَرْجُو، فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ',
    'اللَّهُمَّ وَفِّقْنِي لِمَا تُحِبُّ وَتَرْضَى',
    'اللَّهُمَّ سَدِّدْنِي وَقَارِبْنِي',
    'اللَّهُمَّ اهْدِنِي وَيَسِّرِ الْهُدَى لِي',
    'اللَّهُمَّ أَعِنِّي وَلَا تُعِنْ عَلَيَّ',
    'اللَّهُمَّ اجْعَلْ عَمَلِي صَالِحًا، وَاجْعَلْهُ لِوَجْهِكَ خَالِصًا',
    'اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي، وَعَلِّمْنِي مَا يَنْفَعُنِي، وَزِدْنِي عِلْمًا',
    'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا',
    'اللَّهُمَّ فَقِّهْنِي فِي الدِّينِ',
    'اللَّهُمَّ عَلِّمْنِي مَا جَهِلْتُ، وَذَكِّرْنِي مَا نَسِيتُ',
    'اللَّهُمَّ نَوِّرْ قَلْبِي، وَاشْرَحْ لِي صَدْرِي',
    'رَبِّ زِدْنِي عِلْمًا',
    'رَبِّ اشْرَحْ لِي صَدْرِي، وَيَسِّرْ لِي أَمْرِي',
    'اللَّهُمَّ إِنِّي أَسْأَلُكَ التَّوْفِيقَ وَالسَّدَادَ',
    'اللَّهُمَّ اجْعَلْنِي مِنَ الْمُهْتَدِينَ',
    'اللَّهُمَّ اخْتِمْ لِي بِالصَّالِحَاتِ',
];

// Function to get a random prayer (avoiding the current one)
const getRandomPrayer = (currentPrayer?: string): string => {
    let randomIndex = Math.floor(Math.random() * PRAYERS.length);
    let newPrayer = PRAYERS[randomIndex];
    
    // If we have a current prayer and it's the same, try again
    if (currentPrayer && newPrayer === currentPrayer && PRAYERS.length > 1) {
        randomIndex = (randomIndex + 1) % PRAYERS.length;
        newPrayer = PRAYERS[randomIndex];
    }
    
    return newPrayer;
};

export const PrayersComponent: React.FC = () => {
    const [currentPrayer, setCurrentPrayer] = useState<string>(getRandomPrayer());
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(10)).current;

    useEffect(() => {
        // Animate in when component mounts
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();

        // Change prayer randomly every 8 seconds
        const interval = setInterval(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: -10,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setCurrentPrayer((prev) => getRandomPrayer(prev));
                Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(slideAnim, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ]).start();
            });
        }, 8000);

        return () => clearInterval(interval);
    }, [fadeAnim, slideAnim]);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#F8F9FA', '#FFFFFF']}
                style={styles.card}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.header}>
                    <StyledText style={styles.title}>دعاء</StyledText>
                    <View style={styles.iconContainer}>
                        <Ionicons name="bookmark" size={20} color={Colors.primary} />
                    </View>
                </View>
                
                <Animated.View
                    style={[
                        styles.prayerContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <StyledText style={styles.prayerText} numberOfLines={0}>
                        {currentPrayer}
                    </StyledText>
                </Animated.View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    card: {
        borderRadius: 16,
        padding: 14,
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginBottom: 12,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: Colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    prayerContainer: {
        minHeight: 50,
    },
    prayerText: {
        fontSize: 17,
        color: '#374151',
        fontFamily: FontsEnum.Poppins_400Regular,
        lineHeight: 32,
        textAlign: 'right',
    },
});

