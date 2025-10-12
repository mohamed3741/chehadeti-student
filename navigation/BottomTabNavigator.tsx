import * as React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createStackNavigator} from '@react-navigation/stack';
import CustomDrawerContent from "../components/Drawer";
import HomeScreen from "../screens/school/HomeScreen";
import CourseDetailScreen from "../screens/school/CourseDetailScreen";
import ChapterDetailScreen from "../screens/school/ChapterDetailScreen";
import SubsectionContentsScreen from "../screens/school/SubsectionContentsScreen";
import ContentViewerScreen from "../screens/school/ContentViewerScreen";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function HomeStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="TabHomeScreen" component={HomeScreen} />
            <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
            <Stack.Screen name="ChapterDetail" component={ChapterDetailScreen} />
            <Stack.Screen name="SubsectionContents" component={SubsectionContentsScreen} />
            <Stack.Screen name="ContentViewer" component={ContentViewerScreen} />
        </Stack.Navigator>
    );
}

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
        <Drawer.Screen name="Home" component={HomeStack} options={{title: 'Home'}}/>
    </Drawer.Navigator>);
}








