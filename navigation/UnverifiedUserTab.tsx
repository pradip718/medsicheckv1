import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import UnverifiedCustomTabBar from '../src/components/CustomBottomTabBar/UnverifiedCustomTabbar';
import Icon from '../src/components/Icon';
import Home from '../src/screens/UnverifiedUser/Home';
import Profile from '../src/screens/UnverifiedUser/Profile';
import customColor from '../src/theme/customColor';
import {UnverifiedList} from '../types/navigation';

const Tab = createBottomTabNavigator<UnverifiedList>();

const UnverifiedUserStack = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        // tabBarStyle: styles.tabBar,
      }}
      tabBar={props => <UnverifiedCustomTabBar {...props} />}>
      <Tab.Screen
        name="UnverifiedHome"
        component={Home}
        options={{
          tabBarIcon: ({focused}) => (
            <Icon
              name="person"
              size={20}
              color={
                focused ? customColor.ultramarineBlue : customColor.extraGrey
              }
            />
          ),
        }}
      />
      <Tab.Screen name="UnverifiedProfile" component={Profile} />
    </Tab.Navigator>
  );
};

export default UnverifiedUserStack;
