import {NavigationProp, useNavigation} from '@react-navigation/native';
import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {Additional_Information_img} from '../../../../../assets';
import {MainStackParamList} from '../../../../../types/navigation';
import Navbar from '../../../../components/Navbar';
import RoundedButton from '../../../../components/RoundedButton';
import SafeAreaScrollView from '../../../../components/SafeAreaScrollView';
import CustomText from '../../../../components/Text';
import customColor from '../../../../theme/customColor';

const AdditionalInformation = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  return (
    <SafeAreaScrollView style={styles.container} className="px-6 my-6">
      <Navbar />
      <View className="mt-4 items-end">
        <Image
          source={Additional_Information_img as any}
          style={styles.additionalInformationImg}
        />
      </View>
      <View className="mt-4">
        <CustomText
          className="text-3xl font-isidoraSemiBold"
          style={styles.highlightText}>
          Great start!!!
        </CustomText>
        <CustomText
          className="text-base font-isidoraSemiBold"
          style={styles.highlightText}>
          {'Ready to uncover personalised\ninsights for a healthier you?'}
        </CustomText>
      </View>
      <View className="mt-10">
        <CustomText className="text-sm leading-4">
          {
            "Unlock a wealth of personalised information and recommendations by answering just a few\nquestions.\n\nIt's a quick process, taking only 2 to 3 minutes of your time."
          }
        </CustomText>
      </View>

      <RoundedButton
        className="mt-20"
        onPress={() => {
          navigation.navigate('AdditionalDetail');
        }}>
        <CustomText className="text-white text-lg font-isidoraSemiBold">
          Add Additional Details
        </CustomText>
      </RoundedButton>

      <RoundedButton
        className="mt-2"
        onPress={() => {
          navigation.navigate('HomepageStackScreens', {
            screen: 'Home',
          });
        }}>
        <CustomText className="text-white text-lg font-isidoraSemiBold">
          Skip for now
        </CustomText>
      </RoundedButton>
    </SafeAreaScrollView>
  );
};

export default AdditionalInformation;

const styles = StyleSheet.create({
  container: {},
  additionalInformationImg: {
    aspectRatio: '1/1',
    resizeMode: 'contain',
    height: 218,
  },
  highlightText: {
    color: customColor.blueBerry,
  },
});
