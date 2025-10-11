import * as React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import CustomDrawerContent from "../components/Drawer";
import HomeAdminScreen from "../screens/school/HomeAdminScreen";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {


    return (<Drawer.Navigator
        initialRouteName="Home"
        drawerContent={(props: any) => <CustomDrawerContent {...props} />}
        screenOptions={{
            drawerStyle: {
                width: '85%',
                backgroundColor: '#F9F9F9',
            },
            overlayColor: 'rgba(0, 0, 0, 0.5)',
            drawerType: 'front',
            headerShown: false
        }}
    >
        <Drawer.Screen name="Home" component={HomeAdminScreen} options={{title: 'Orders overview'}}/>
    </Drawer.Navigator>);
}








