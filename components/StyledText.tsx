import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { FontsEnum } from '../constants/FontsEnum';

interface StyledTextProps extends TextProps {
    children: React.ReactNode;
}

export const StyledText: React.FC<StyledTextProps> = ({ style, children, ...props }) => {
    return (
        <Text style={[styles.defaultText, style]} {...props}>
            {children}
        </Text>
    );
};

const styles = StyleSheet.create({
    defaultText: {
        fontFamily: FontsEnum.Poppins_400Regular,
    },
});

