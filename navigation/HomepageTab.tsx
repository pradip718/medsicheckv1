import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import CustomTabBar from '../src/components/CustomBottomTabBar';
import ScanButton from '../src/components/ScanButton';
import Homepage from '../src/screens/Homepage';
import Profile from '../src/screens/Profile';

// const Stack = createNativeStackNavigator<HomepageParamList>();
// const Drawer = createDrawerNavigator<HomepageParamList>();

const Tab = createBottomTabNavigator();

const HomepageTab = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        // tabBarStyle: styles.tabBar,
      }}
      // tabBar={props => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Homepage" component={Homepage} />
      <Tab.Screen
        name="Scan"
        component={Homepage}
        options={{
          tabBarButton: () => <ScanButton />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          unmountOnBlur: true,
        }}
      />
    </Tab.Navigator>
  );
};

export default HomepageTab;
