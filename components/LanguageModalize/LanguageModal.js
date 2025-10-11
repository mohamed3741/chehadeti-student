// LanguageModal.js
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Easing,
    Modal,
    Pressable,
    ScrollView,
    View,
} from 'react-native';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';

import styles from './styles';
import { alignment } from '../../utils/alignment';
import { StyledText } from '../StyledText';
import i18next, { setAppLanguage, writingDir, textAlignFor } from '../../i18next';

export const languageTypes = [
    { value: 'English', code: 'en', index: 0, flag: '🇬🇧', preview: 'Hello' },
    { value: 'العربية', code: 'ar', index: 1, flag: '🇲🇷', preview: 'مرحبا' },
    { value: 'français', code: 'fr', index: 2, flag: '🇫🇷', preview: 'Bonjour' },
];

const SHEET_MAX_H = Math.min(520, Dimensions.get('window').height * 0.72);
const HANDLE_H = 4;

const LanguageModal = ({
                           modalVisible,
                           setModalVisible,
                           currentTheme,
                           showCrossButton,
                           dontClose,
                       }) => {
    const { t } = useTranslation();
    const isRTLContent = writingDir() === 'rtl';

    const [activeRadio, setActiveRadio] = useState(0);
    const [loading, setLoading] = useState(false);

    const fade = useRef(new Animated.Value(0)).current;
    const slideY = useRef(new Animated.Value(40)).current;

    useEffect(() => {
        if (modalVisible) {
            determineInitialLanguage();
            Animated.parallel([
                Animated.timing(fade, {
                    toValue: 1,
                    duration: 160,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.quad),
                }),
                Animated.timing(slideY, {
                    toValue: 0,
                    duration: 220,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.quad),
                }),
            ]).start();
        } else {
            fade.setValue(0);
            slideY.setValue(40);
        }
    }, [modalVisible]);

    async function determineInitialLanguage() {
        try {
            const stored = await AsyncStorage.getItem('chehadeti-language');
            const codes = languageTypes.map((l) => l.code);
            const storedValid = codes.includes(stored || '') ? stored : null;

            const locales = typeof Localization.getLocales === 'function' ? Localization.getLocales() : [];
            const preferred = locales
                .map((l) => l?.languageCode)
                .filter(Boolean)
                .find((c) => codes.includes(c));

            const fallback = typeof Localization.locale === 'string' ? Localization.locale.split('-')[0] : null;

            const lang = storedValid ?? preferred ?? (codes.includes(fallback) ? fallback : 'en');
            const sel = languageTypes.find((l) => l.code === lang) ?? languageTypes[0];
            setActiveRadio(sel.index);
        } catch {
            setActiveRadio(0);
        }
    }

    const close = () => {
        if (!dontClose) setModalVisible(false);
    };

    const onSelect = async () => {
        try {
            setLoading(true);
            const idx = Math.max(0, Math.min(activeRadio, languageTypes.length - 1));
            const { code, value } = languageTypes[idx];

            // Persist + change language (single source of truth)
            await setAppLanguage(code);
            await AsyncStorage.setItem('chehadeti-language-name', value);
        } catch {
            // no-op
        } finally {
            setLoading(false);
            setModalVisible(false);
        }
    };

    const Item = ({ item, selected }) => (
        <Pressable
            onPress={() => setActiveRadio(item.index)}
            android_ripple={{ color: '#00000010' }}
            style={{
                paddingVertical: 14,
                paddingHorizontal: 14,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: selected ? currentTheme.main : '#E5E7EB',
                backgroundColor: '#FFFFFF',
                flexDirection: isRTLContent ? 'row-reverse' : 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
            }}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={item.value}
        >
            <View style={{ flexDirection: isRTLContent ? 'row-reverse' : 'row', alignItems: 'center', gap: 10 }}>
                <StyledText textColor={currentTheme.fontMainColor} bold style={{ fontSize: 18 }}>
                    {item.flag}
                </StyledText>
                <View style={{ maxWidth: '72%' }}>
                    <StyledText
                        numberOfLines={1}
                        textColor={currentTheme.fontMainColor}
                        bold={selected}
                        style={{
                            fontSize: 15,
                            writingDirection: writingDir(i18next.language),
                            textAlign: textAlignFor(i18next.language),
                        }}
                    >
                        {item.value}
                    </StyledText>
                    <StyledText
                        numberOfLines={1}
                        textColor={'#6B7280'}
                        style={{
                            fontSize: 12,
                            marginTop: 2,
                            writingDirection: writingDir(item.code),
                            textAlign: textAlignFor(item.code),
                        }}
                    >
                        {item.preview}
                    </StyledText>
                </View>
            </View>

            <Feather
                name={selected ? 'check' : 'chevron-right'}
                size={selected ? 20 : 18}
                color={selected ? currentTheme.main : '#9CA3AF'}
            />
        </Pressable>
    );

    return (
        <Modal transparent visible={modalVisible} onRequestClose={close} animationType="none">
            <View style={styles().layout}>
                <Pressable style={[styles().backdrop, { opacity: 0.9 }]} onPress={close} />

                <Animated.View
                    style={[
                        styles(currentTheme).modalContainer,
                        {
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            paddingBottom: 14,
                            paddingTop: 8,
                            maxHeight: SHEET_MAX_H,
                            transform: [{ translateY: slideY }],
                            opacity: fade,
                        },
                    ]}
                >
                    <View
                        style={{
                            alignSelf: 'center',
                            width: 44,
                            height: HANDLE_H,
                            borderRadius: HANDLE_H / 2,
                            backgroundColor: '#E5E7EB',
                            marginBottom: 10,
                        }}
                    />

                    <View
                        style={[
                            styles(currentTheme).flexRow,
                            { alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
                        ]}
                    >
                        <StyledText
                            textColor={currentTheme.fontMainColor}
                            bolder
                            H3
                            style={[
                                alignment.MBsmall,
                                { writingDirection: writingDir(i18next.language), textAlign: textAlignFor(i18next.language) },
                            ]}
                        >
                            {t('selectLanguage')}
                        </StyledText>
                        {showCrossButton && (
                            <Pressable onPress={close} hitSlop={10} accessibilityRole="button" accessibilityLabel={t('close')}>
                                <Feather name="x" size={22} color={currentTheme.newFontcolor} />
                            </Pressable>
                        )}
                    </View>

                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={{ paddingVertical: 10 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {languageTypes.map((item) => (
                            <Item key={item.code} item={item} selected={activeRadio === item.index} />
                        ))}
                    </ScrollView>

                    <View style={{ gap: 10 }}>
                        <Pressable
                            onPress={onSelect}
                            disabled={loading}
                            android_ripple={{ color: '#ffffff30' }}
                            style={{
                                backgroundColor: currentTheme.main,
                                borderRadius: 14,
                                paddingVertical: 14,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            accessibilityRole="button"
                            accessibilityLabel={t('continueBtn')}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <StyledText style={{ color: '#fff' }} center H5>
                                    {t('continueBtn')}
                                </StyledText>
                            )}
                        </Pressable>

                        <Pressable
                            onPress={close}
                            android_ripple={{ color: '#00000010' }}
                            style={{
                                backgroundColor: '#F3F4F6',
                                borderRadius: 14,
                                paddingVertical: 12,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                            }}
                            accessibilityRole="button"
                            accessibilityLabel={t('cancel')}
                        >
                            <StyledText textColor={currentTheme.fontMainColor} center>
                                {t('cancel')}
                            </StyledText>
                        </Pressable>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

export default LanguageModal;
