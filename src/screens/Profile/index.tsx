import {RouteProp} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {RefreshControl} from 'react-native-gesture-handler';
import useLanguageStore from '../../../store/languageStore';
import {MainStackParamList} from '../../../types/navigation';
import {ProfileType} from '../../../types/users/user';
import Navbar from '../../components/Navbar';
import SafeAreaScrollView from '../../components/SafeAreaScrollView';
import CustomText from '../../components/Text';
import {FAMILY_INFO, MY_INFO} from '../../constants/enums';
import useGetFamilyMembers from '../../hooks/api/useGetFamilyMembers';
import MultiProfileList from './MultiProfileList';
import MyInfo from './MyInfo';

type ProfileRouteProps = RouteProp<MainStackParamList, 'Profile'>;

type ProfileProps = {
  route: ProfileRouteProps;
};

const Profile = ({route}: ProfileProps) => {
  const {languages} = useLanguageStore();
  const {tab} = route.params || {tab: null};

  const [selectedProfile, setSelectedProfile] = useState<ProfileType>(MY_INFO);

  const {isLoading: isFamilyMembersFetching, refetch: getFamilyMembers} =
    useGetFamilyMembers({enabled: false});

  useEffect(() => {
    if (tab?.name) {
      handleSelectedProfile(tab?.name);
    }
  }, [tab]);

  const handleSelectedProfile = (role: ProfileType) => {
    setSelectedProfile(role);
  };

  const renderPersonalAndFamilyInfoSwitch = () => {
    return (
      <View className="flex-row rounded-xl p-1 border border-[#B2C1FF]">
        <TouchableOpacity
          className={`px-4 h-7 rounded-xl justify-center items-center ${
            selectedProfile === MY_INFO && 'bg-[#B2C1FF]'
          } flex-1`}
          onPress={() => handleSelectedProfile(MY_INFO)}>
          <CustomText className="text-sm text-[#222B45] font-isidoraMedium">
            {languages?.my_info}
          </CustomText>
        </TouchableOpacity>
        <TouchableOpacity
          className={`px-4 h-7 rounded-xl justify-center items-center ${
            selectedProfile === FAMILY_INFO && 'bg-[#B2C1FF]'
          } flex-1`}
          onPress={() => handleSelectedProfile(FAMILY_INFO)}>
          <CustomText className="text-sm text-[#222B45] font-isidoraMedium">
            {languages?.profiles}
          </CustomText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaScrollView
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={isFamilyMembersFetching}
          onRefresh={getFamilyMembers}
        />
      }>
      <Navbar noBack hasDrawer />
      {/* <View className="mt-4 flex-row  justify-between"> */}
      {/* <CustomText className="text-2xl text-ultramarineBlue font-isidoraBold w-[30%]">
          {selectedProfile === 'myInfo'
            ? languages?.my_info
            : languages?.profiles}
        </CustomText> */}
      {/* </View> */}
      <View className="mt-4">{renderPersonalAndFamilyInfoSwitch()}</View>
      {selectedProfile === 'myInfo' && <MyInfo />}
      {selectedProfile === 'familyInfo' && (
        <View className="mt-4">
          <MultiProfileList />
        </View>
      )}
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
