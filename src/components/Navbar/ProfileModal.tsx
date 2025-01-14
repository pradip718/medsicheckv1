import {useQueryClient} from '@tanstack/react-query';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {navigate} from '../../../RootNavigation';
import {ProfileImg} from '../../../assets';
import useLanguageStore from '../../../store/languageStore';
import useUserProfileStore from '../../../store/profileStore';
import {isOnlyAdmin, sortAdminToTop} from '../../../utils/methods';
import useGetFamilyMembers from '../../hooks/api/useGetFamilyMembers';
import useGetProfileImage from '../../hooks/useGetProfileImage';
import customColor from '../../theme/customColor';
import Icon from '../Icon';
import Loader from '../Loader';
import CustomText from '../Text';

const UserCard = ({
  title,
  onCardClick,
  profileId,
  isAdmin,
}: {
  title: string;
  onCardClick: () => void;
  profileId: string;
  isAdmin?: boolean;
}) => {
  const {avatarSource} = useGetProfileImage(profileId);
  const {languages} = useLanguageStore();
  return (
    <TouchableOpacity
      className="w-[251px] h-[47px] flex-row pl-[18%] items-center border rounded-3xl"
      onPress={onCardClick}>
      <View className="h-[60px] w-[60px] rounded-full border justify-center items-center bg-white">
        <View className="h-[50px] w-[50px] rounded-full  overflow-hidden">
          <Image
            source={avatarSource || (ProfileImg as any)}
            style={styles.profileImage}
          />
        </View>
      </View>
      <View className="w-[60%]">
        <CustomText
          className="ml-2 font-isidoraSemiBold text-base text-ellipsis "
          numberOfLines={1}
          ellipsizeMode="tail">
          {title}
          {title}
        </CustomText>
        {isAdmin && (
          <CustomText
            className="font-isidoraMedium text-sm text-[#1E3180] pl-2"
            numberOfLines={1}>
            ({languages?.admin})
          </CustomText>
        )}
      </View>
    </TouchableOpacity>
  );
};

const ProfileModal = ({hideModal}: {hideModal: () => void}) => {
  const {languages} = useLanguageStore();
  const queryClient = useQueryClient();
  const {setCurrentActiveProfileId, currentActiveProfileId} =
    useUserProfileStore();

  const {data: familyMembers, isLoading} = useGetFamilyMembers();

  const otherMembers = familyMembers?.filter(
    eachmember => eachmember.profile_id !== currentActiveProfileId,
  );

  const currentMember = familyMembers?.find(
    eachmember => eachmember.profile_id === currentActiveProfileId,
  );

  const isOtherMembersEmpty =
    Array.isArray(otherMembers) && !otherMembers?.length;

  const navigateToFamilyInformation = () => {
    hideModal();
    navigate('FamilyInformation', {});
  };

  const onUserCardClick = async (profileId: string) => {
    setCurrentActiveProfileId(profileId);
    hideModal();
    await queryClient.resetQueries();
  };

  const renderAddMemberCard = () => {
    return (
      <TouchableOpacity
        className="w-[251px] h-[47px] flex-row justify-center items-center rounded-3xl"
        style={styles.borderStyle}
        onPress={navigateToFamilyInformation}>
        <Icon name="plus" size={28} color={customColor.blueBerry} />

        <CustomText className="ml-2  font-isidoraSemiBold text-base">
          {languages?.add_member}
        </CustomText>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <View
      className="h-[400] rounded-2xl overflow-hidden"
      style={styles.container}>
      <ScrollView>
        <View style={styles.profileModalContainer}>
          <CustomText className="text-base font-isidoraSemiBold text-center">
            {languages?.different_user}
          </CustomText>
          <View className="items-center mt-4">
            <View>
              <CustomText className=" font-isidoraSemiBold text-sm text-ultramarineBlue mb-2">
                {languages?.current_user}
              </CustomText>
              <UserCard
                title={
                  currentMember
                    ? currentMember?.given_name +
                      ' ' +
                      currentMember?.family_name
                    : ''
                }
                onCardClick={() =>
                  onUserCardClick(currentMember?.profile_id || '')
                }
                profileId={currentMember?.profile_id || ''}
              />
            </View>
          </View>
          <View className="items-center mt-4">
            <View>
              <View className="flex-row items-center justify-between">
                {!!otherMembers?.length && (
                  <CustomText className="text-sm font-isidoraSemiBold text-ultramarineBlue mb-4">
                    {languages?.other_member}
                  </CustomText>
                )}

                {!isOnlyAdmin(otherMembers || []) && otherMembers?.length ? (
                  <View className="flex-row justify-end items-center space-x-3">
                    <View className="items-end mb-4">
                      <TouchableOpacity
                        className="flex-row justify-center items-center  rounded-3xl px-4 py-1 bg-[#B2C1FF]"
                        onPress={navigateToFamilyInformation}>
                        <Icon
                          name="plus"
                          size={20}
                          color={customColor.blueBerry}
                        />
                        <CustomText className="ml-2  font-isidoraSemiBold text-base">
                          {languages?.add}
                        </CustomText>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <></>
                )}
              </View>

              {sortAdminToTop(otherMembers || [])?.map(
                (eachMember, idx: number) => (
                  <View
                    className="mb-4"
                    key={`${eachMember.profile_id} ${idx}`}>
                    <UserCard
                      title={
                        eachMember
                          ? eachMember?.given_name +
                            ' ' +
                            eachMember?.family_name
                          : ''
                      }
                      onCardClick={() =>
                        onUserCardClick(eachMember?.profile_id || '')
                      }
                      isAdmin={eachMember?.relation === 'Admin'}
                      profileId={eachMember?.profile_id || ''}
                    />
                  </View>
                ),
              )}
            </View>
          </View>

          {isOnlyAdmin(otherMembers || []) || isOtherMembersEmpty ? (
            <View className="items-center mt-4">{renderAddMemberCard()}</View>
          ) : (
            <></>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileModal;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(216, 224, 255, 1)',
  },
  profileModalContainer: {
    width: 303,
    paddingVertical: 20,
    height: '100%',
  },
  profileImage: {
    // height: 102,
    aspectRatio: '1/1',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  borderStyle: {
    borderWidth: 1,
    borderStyle: 'dashed',
  },
});
