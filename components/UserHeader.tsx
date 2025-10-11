import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, StatusBar, ViewStyle } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import Colors from "../constants/Colors";
import { useRestaurant } from "../hooks/useRestaurant";
import { AntDesign } from '@expo/vector-icons';
import {StyledText} from "./StyledText";
import {FontsEnum} from "../constants/FontsEnum";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DrawerActions } from '@react-navigation/native';



interface UserHeaderProps {
    goBack?: boolean;
    onEdit?: (item: any) => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({ goBack = false, onEdit }) => {
    const navigation = useNavigation();
    const { restaurant } = useRestaurant();

    const isOpen = React.useMemo(() => {
        const openStatuses = ['OPEN', 'FORCE_OPEN', 'CLOSE_SOON'];
        console.log(restaurant?.openingStatus)
        return openStatuses.includes(restaurant?.openingStatus);
    }, [restaurant?.openingStatus]);


    const openDrawer = () => {
        navigation.dispatch(DrawerActions.toggleDrawer());
    };

    const getStatusIndicatorStyle = (isOpen: boolean): ViewStyle => ({
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: isOpen ? 'green' : 'red',
        marginRight: 5,
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" animated={true} />
            {goBack ? (
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <AntDesign name="arrowleft" size={25} color="#fff" />
                </TouchableOpacity>
            ) : (
                <View style={styles.subContainer}>
                    <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
                        <MaterialIcons name="menu" size={30} color="#fff"   />
                    </TouchableOpacity>
                    <View style={styles.statusButton} >
                        <View style={getStatusIndicatorStyle(isOpen)} />
                        <Text style={styles.statusText}>{isOpen ? 'Open' : 'Closed'}</Text>
                    </View>
                </View>
            )}
            {onEdit && (
                <TouchableOpacity style={styles.editButton} onPress={onEdit}>
                   <StyledText style={styles.editButtonText}>Edit <FontAwesome name="edit" size={16} color={Colors.primary} /></StyledText>
                </TouchableOpacity>
            )}

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.primary,
        height: 100,
        paddingHorizontal: 10,
    },
    subContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 50,
        justifyContent: "space-between"
    },
    menuButton: {
        marginRight: 20,
    },
    statusButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        borderRadius: 8,
        padding: 10,
        width: widthPercentageToDP('30%')
    },
    statusText: {
        color: '#000',
        fontSize: 16,
        width: widthPercentageToDP('16%'),
        marginHorizontal: 5,
    },
    backButton: {
        marginTop: 60
    },
    editButton: {
        position: "absolute",
        bottom: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#fff",
        right: 16,
        width: 66,
        padding: 5,
        borderRadius: 5
    },
    editButtonText: {
        color: Colors.primary,
        fontFamily: FontsEnum.Poppins_600SemiBold,
        fontSize: 16
    }
});

export default UserHeader;
