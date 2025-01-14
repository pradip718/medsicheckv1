import React from 'react';
import {StyleSheet, View} from 'react-native';
import EtchedGlass from '../../../components/EtchedGlass';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';

const Question = () => {
  return (
    <EtchedGlass className="rounded-none">
      <CustomText className="text-lg text-black font-isidoraSemiBold">
        I have read and agree to the terms of the privacy notice and
        authorization for the use of personal data on the page [link to privacy
        notice].
      </CustomText>
    </EtchedGlass>
  );
};

const Answer = () => {
  return (
    <View className="items-center flex-grow justify-center">
      <RoundedButton
        resetStyle
        style={styles.btnStyle}
        className="py-2 min-w-[182px] mt-4"
        // onPress={navigation.goBack}
      >
        <CustomText className="font-isidoraSemiBold text-lg text-center text-black border-[#EF82B369] border">
          Yes, I accept
        </CustomText>
      </RoundedButton>

      <RoundedButton
        resetStyle
        // style={styles.btnStyle}
        className="py-2 min-w-[182px] mt-4 border-[#EF82B369] border "
        // onPress={navigation.goBack}
      >
        <CustomText className="font-isidoraSemiBold text-lg text-center text-black">
          No, I do not accept
        </CustomText>
      </RoundedButton>
    </View>
  );
};

const QuestionAnswer = () => {
  return (
    <View className="justify-between flex-grow">
      <Question />
      <Answer />
      <View />
    </View>
  );
};

export default QuestionAnswer;

const styles = StyleSheet.create({
  btnStyle: {
    backgroundColor: 'rgba(239, 130, 179, 1)',
  },
});
