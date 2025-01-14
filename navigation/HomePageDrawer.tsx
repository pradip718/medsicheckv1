import {
  DrawerContentComponentProps,
  createDrawerNavigator,
} from '@react-navigation/drawer';
import React from 'react';
import CustomDrawer from '../src/components/CustomDrawer';
import Settings from '../src/screens/Settings';
import SmartReport from '../src/screens/SmartReport';
import WIP from '../src/screens/WorkInProgress';
import {HomepageDrawerList} from '../types/navigation';
import HomepageTab from './HomepageTab';

const Drawer = createDrawerNavigator<HomepageDrawerList>();

const HomePageDrawer = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props: DrawerContentComponentProps) => (
        <CustomDrawer {...props} />
      )}
      initialRouteName="HomepageTab"
      screenOptions={{
        headerShown: false,
        swipeEnabled: true,
        drawerHideStatusBarOnOpen: false,
        drawerType: 'slide',
        drawerStyle: {
          left: 0,
        },
      }}>
      <Drawer.Screen name="HomepageTab" component={HomepageTab} />
      <Drawer.Screen name="WIP" component={WIP} />
      <Drawer.Screen name="Settings" component={Settings} />
      <Drawer.Screen name="SmartReport" component={SmartReport} />
    </Drawer.Navigator>
  );
};

export default HomePageDrawer;
