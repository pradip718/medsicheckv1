import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import Conclusion from '../src/screens/Preventix/Conclusion';
import Questions from '../src/screens/Preventix/Questions';
import Welcome from '../src/screens/Preventix/Welcome';
import {PreventixInformationParamList} from '../types/navigation';

const Stack = createNativeStackNavigator<PreventixInformationParamList>();

const PreventixInformationStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="Questions" component={Questions} />
      <Stack.Screen name="Conclusion" component={Conclusion} />
    </Stack.Navigator>
  );
};

export default PreventixInformationStack;
