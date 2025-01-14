import {NavigationProp, useNavigation} from '@react-navigation/native';
import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Divider} from 'react-native-paper';
import useLanguageStore from '../../../store/languageStore';
import useUserProfileStore from '../../../store/profileStore';
import {MainStackParamList} from '../../../types/navigation';
import {isOnlyAdmin} from '../../../utils/methods';
import Icon from '../../components/Icon';
// import Loader from '../../components/Loader';
import CustomText from '../../components/Text';
import useGetFamilyMembers from '../../hooks/api/useGetFamilyMembers';
import customColor from '../../theme/customColor';
import CurrentUserSection from './components/CurrentUserSection';
import FamilySection from './components/FamilySection';

const MultiProfileList = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {currentActiveProfileId} = useUserProfileStore();
  const {languages} = useLanguageStore();

  const {data: familyMembers} = useGetFamilyMembers();
  const otherMembers = familyMembers?.filter(
    eachmember =>
      // eachmember.relation !== 'Admin' &&
      eachmember.profile_id !== currentActiveProfileId,
  );
  const admin = familyMembers?.find(
    eachmember =>
      eachmember.relation === 'Admin' &&
      eachmember.profile_id !== currentActiveProfileId,
  );

  const isOtherMembersEmpty =
    Array.isArray(otherMembers) && !otherMembers?.length;

  const navigateToFamilyInformation = () => {
    navigation.navigate('FamilyInformation');
  };

  // if (isLoading) {
  //   return <Loader />;
  // }

  return (
    <View style={styles.container}>
      <View>
        <CurrentUserSection
          details={familyMembers?.find(
            eachmember => eachmember.profile_id === currentActiveProfileId,
          )}
        />
      </View>
      {otherMembers?.length && !admin ? (
        <Divider style={styles.divider} />
      ) : (
        <></>
      )}
      <View className="mt-8">
        <FamilySection
          otherMembers={otherMembers}
          admin={admin}
          navigateToFamilyInformation={navigateToFamilyInformation}
        />
      </View>
      {(isOnlyAdmin(otherMembers || []) || isOtherMembersEmpty) && (
        <TouchableOpacity
          className="mt-2 flex-row justify-center items-center border border-dashed rounded-3xl py-4 bg-[#EDF0FF]"
          onPress={navigateToFamilyInformation}
          style={styles.borderStyle}>
          <Icon name="plus" size={28} color={customColor.blueBerry} />
          <CustomText className="ml-2  font-isidoraSemiBold text-base">
            {languages?.add_member}
          </CustomText>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default MultiProfileList;

const styles = StyleSheet.create({
  container: {},
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: customColor.ultramarineBlue,
    opacity: 0.4,
  },
  borderStyle: {
    borderWidth: 1,
    borderStyle: 'dashed',
  },
});
