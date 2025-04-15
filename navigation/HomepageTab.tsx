import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import CustomTabBar from '../src/components/CustomBottomTabBar';
import Homepage from '../src/screens/Homepage';
import Profile from '../src/screens/Profile';

const Tab = createBottomTabNavigator();

const HomepageTab = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={props => <CustomTabBar {...props} />}>
      <Tab.Screen name="Homepage" component={Homepage} />
      <Tab.Screen name="Scan" component={Homepage} />
      <Tab.Screen name="VoiceScan" component={Homepage} />
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
