import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import Reports from '../src/screens/Reports';
import {ReportParamList} from '../types/navigation';

const Stack = createNativeStackNavigator<ReportParamList>();

const ReportStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Report" component={Reports} />
    </Stack.Navigator>
  );
};

export default ReportStack;
