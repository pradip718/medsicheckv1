import React from 'react';
import {StyleSheet, View} from 'react-native';
import useLanguageStore from '../../../store/languageStore';
import Navbar from '../../components/Navbar';
import SafeAreaScrollView from '../../components/SafeAreaScrollView';
import CustomText from '../../components/Text';
import MyInfo from './MyInfo';

const Profile = () => {
  const {languages} = useLanguageStore();

  return (
    <SafeAreaScrollView contentContainerStyle={styles.contentContainer}>
      <Navbar noBack />
      <View className="mt-4 flex-row items-center justify-between">
        <CustomText className="text-2xl text-ultramarineBlue font-isidoraBold">
          {languages?.my_info}
        </CustomText>
      </View>
      <MyInfo />
    </SafeAreaScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    // height: '100%',
    paddingBottom: 88,
  },
});
