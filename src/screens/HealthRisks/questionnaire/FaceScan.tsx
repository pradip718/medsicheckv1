import {NavigationProp, useNavigation} from '@react-navigation/native';
import {isArray} from 'lodash';
import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import useHealthRiskStore from '../../../../store/healthRisksStore';
import {MainStackParamList} from '../../../../types/navigation';
import {ParseAndRenderText} from '../../../../utils/common';
import CustomText from '../../../components/Text';
import usePrepareFacescan from '../../../hooks/usePrepareFacescan';

type Props = {
  question: string;
  choices: string[];
  submitFacescan: (payload: string) => Promise<void>;
};

const FaceScan = ({question, choices, submitFacescan}: Props) => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {startScan} = usePrepareFacescan();
  const {setActionData} = useHealthRiskStore();

  const handleSelectedAction = (choice: string) => {
    switch (true) {
      case choice === 'Exit' || choice === 'Salida': {
        return navigation.goBack();
      }
      case choice === 'Initiate Scan' || choice === 'Iniciar escaneo': {
        setActionData({
          fromScreen: 'HealthRisks',
          action: async () => await submitFacescan(choice),
        });
        return startScan();
      }
      default: {
        return submitFacescan(choice);
      }
    }
  };
  return (
    <View className="grow">
      <CustomText className=" font-isidoraSemiBold text-lg grow-[0.1]">
        {ParseAndRenderText(question)}
      </CustomText>

      <View className="justify-center items-center grow ">
        {choices &&
          isArray(choices) &&
          choices.map(choice => (
            <TouchableOpacity
              key={choice}
              className="border border-gray-300 rounded-lg min-w-[50%] min-h-12 justify-center items-center mt-4 px-4 py-2"
              onPress={() => handleSelectedAction(choice)}>
              <CustomText className="font-isidoraSemiBold text-lg">
                {choice}
              </CustomText>
            </TouchableOpacity>
          ))}
      </View>
    </View>
  );
};

export default FaceScan;
