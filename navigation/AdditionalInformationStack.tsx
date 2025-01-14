import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import AdditionalInformation from '../src/screens/auth/Register/Additional_Information';
import AdditionalDetails from '../src/screens/auth/Register/Additional_Information/AdditionalDetails';
import {AdditionalInformationParamList} from '../types/navigation';

//Stack will receive a RoomsStackParamList - Type
const Stack = createNativeStackNavigator<AdditionalInformationParamList>();

const AdditionalInformationStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="AdditionalInformation"
        component={AdditionalInformation}
      />
      <Stack.Screen name="AdditionalDetail" component={AdditionalDetails} />
    </Stack.Navigator>
  );
};

export default AdditionalInformationStack;
