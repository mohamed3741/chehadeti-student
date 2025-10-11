import {StyleSheet} from "react-native";
import Colors from "./Colors";

export default module.exports = StyleSheet.create({
    headerTitleStyle: {
        fontWeight: 'bold',
        color: '#46345b',
        textTransform: 'capitalize'
    },
    sameRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    flexColumn: {
        flexDirection: 'column'
    },
    accepted: {
        backgroundColor: '#6cc070'
    },
    refused: {
        backgroundColor: '#ad0000'
    },

    finished: {
        backgroundColor: '#65385a'
    },

    canceled: {
        backgroundColor: '#616161'
    },

    delivred: {
        backgroundColor: '#045bff'
    },

    waiting: {
        backgroundColor: '#ff6633'
    },
    flexRow: {
        flexDirection: 'row'
    },
    uppercase: {
        textTransform: 'uppercase'
    },
    floatBtn: {
        position: 'absolute',
        width: 50,
        height: 50,
        bottom: 10,
        elevation: 10
    },
    bgTransparent: {
        backgroundColor: 'transparent'
    },
    bgPrimary: {
        backgroundColor: Colors.primary
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    boxContainer: {
        marginHorizontal: 10,
        marginVertical: 20,
        shadowColor: Colors.medium,
        shadowOffset: {
            width: 0.5,
            height: 0.5,
        },
        shadowOpacity: 0.8,
        shadowRadius: 0.27,
        elevation: 0.8,
        borderRadius: 10,
    },
    boxContent: {
        padding: 10,
        borderRadius: 10
    },
    fieldShadow: {
        borderRadius: 7,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 2,
        borderBottomWidth: 2,
        borderColor: '#2120201A'
    },
    dNone: {
        display: 'none'
    },
});
