import CheckBox from '@react-native-community/checkbox';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import React, {useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import useLanguageStore from '../../../../store/languageStore';
import useUserProfileStore from '../../../../store/profileStore';
import {FamilyMembers} from '../../../../types/users/user';
import {isAndroid} from '../../../../utils';
import {isOnlyAdmin, sortAdminToTop} from '../../../../utils/methods';
import {errorToast} from '../../../../utils/toast';
import {deleteFamilyMembersAttributes, notifyApi} from '../../../api/user';
import Icon from '../../../components/Icon';
import CustomText from '../../../components/Text';
import useFullPageLoader from '../../../hooks/useFullPageLoader';
import customColor from '../../../theme/customColor';
import ProfileCard from './ProfileCard';

const FamilySection = ({
  otherMembers,
  admin,
  navigateToFamilyInformation,
}: {
  otherMembers: FamilyMembers[] | undefined;
  admin: FamilyMembers | undefined;
  navigateToFamilyInformation: () => void;
}) => {
  const queryClient = useQueryClient();
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);
  const {languages} = useLanguageStore();
  const {showLoader, hideLoader} = useFullPageLoader();
  const {setCurrentActiveProfileId} = useUserProfileStore();

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const {mutateAsync: deleteFamilyMembers} = useMutation({
    onMutate: showLoader,
    mutationKey: ['DeleteFamilyMembersAttributes'],
    mutationFn: deleteFamilyMembersAttributes,
    onSuccess: async () => {
      await notifyApi('delete_profile');
      await queryClient.invalidateQueries({queryKey: ['family-members']});
      resetState();
    },
    onError: error => errorToast(error?.message),
    onSettled: hideLoader,
  });

  const handleSelectProfile = (isChecked: boolean, profileId: string) => {
    if (isChecked) {
      setSelectedProfileIds([...selectedProfileIds, profileId]);
    } else {
      setSelectedProfileIds(selectedProfileIds.filter(id => id !== profileId));
    }
  };

  const handleDeleteFamilyMembers = async () => {
    if (selectedProfileIds.length === 0) {
      return errorToast(languages?.deleteFamilyMemberMessage);
    }
    await deleteFamilyMembers({profile_ids: selectedProfileIds});
  };
  const handleEditing = () => setIsEditing(!isEditing);
  const cancelEditing = () => setIsEditing(false);
  const resetState = () => {
    setIsEditing(false);
    setSelectedProfileIds([]);
  };

  const onChangeCurrentProfile = (profileId: string) => {
    setCurrentActiveProfileId(profileId);
    queryClient.resetQueries({
      predicate: query => !query.queryKey.includes('reading-detail'),
    });
  };

  if ((!otherMembers || otherMembers.length === 0) && !admin) {
    return <></>;
  }

  return (
    <View>
      <View className="largePhone:flex-row largePhone:items-center justify-between">
        {!!otherMembers?.length && (
          <CustomText className="text-base font-isidoraSemiBold text-ultramarineBlue mb-4">
            {languages?.other_member}
          </CustomText>
        )}
        {!isOnlyAdmin(otherMembers || []) && otherMembers?.length ? (
          <View className="flex-row justify-end items-center space-x-3">
            <View className="items-end mb-4">
              <TouchableOpacity
                className="flex-row justify-center items-center  rounded-3xl px-4 py-1 bg-[#B2C1FF]"
                onPress={navigateToFamilyInformation}>
                <Icon name="plus" size={20} color={customColor.blueBerry} />
                <CustomText className="ml-2  font-isidoraSemiBold text-base">
                  {languages?.add}
                </CustomText>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={isEditing ? handleDeleteFamilyMembers : handleEditing}>
              <CustomText
                className={`underline ${
                  isEditing ? 'text-red-400' : 'text-ultramarineBlue'
                } text-right font-isidoraSemiBold text-base mb-4`}>
                {isEditing ? languages?.delete : languages?.edit}
              </CustomText>
            </TouchableOpacity>
            {isEditing && (
              <TouchableOpacity onPress={cancelEditing}>
                <CustomText className="underline text-ultramarineBlue text-right font-isidoraSemiBold text-base mb-4">
                  {languages?.cancel}
                </CustomText>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <></>
        )}
      </View>
      {sortAdminToTop(otherMembers || [])?.map((eachMember, idx: number) => (
        <View
          key={`${eachMember.profile_id} ${idx}`}
          className="mb-8 flex-row items-center space-x-2">
          {isEditing && eachMember.relation !== 'Admin' && (
            <CheckBox
              tintColors={{true: '#3E64FF', false: '#3E64FF'}}
              style={styles.checkBox}
              boxType="square"
              onValueChange={value =>
                handleSelectProfile(value, eachMember.profile_id)
              }
              value={selectedProfileIds?.includes(eachMember.profile_id)}
            />
          )}
          <TouchableOpacity
            className="flex-1"
            onPress={() => onChangeCurrentProfile(eachMember.profile_id)}>
            <ProfileCard
              name={`${eachMember.given_name} ${eachMember.family_name}`}
              profileId={eachMember.profile_id}
              lastHealthScore="6"
              isAdmin={eachMember?.relation === 'Admin'}
            />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

export default FamilySection;

const styles = StyleSheet.create({
  checkBox: {
    transform: isAndroid
      ? [{scaleX: 1}, {scaleY: 1}]
      : [{scaleX: 0.8}, {scaleY: 0.8}],
  },
});
