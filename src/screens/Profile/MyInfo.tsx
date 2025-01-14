import {useMutation} from '@tanstack/react-query';
import React, {useState} from 'react';
import {View} from 'react-native';
import useLanguageStore from '../../../store/languageStore';
import useUserProfileStore from '../../../store/profileStore';
import {errorToast} from '../../../utils/toast';
import {deleteFamilyMembersAttributes, notifyApi} from '../../api/user';
import DeleteAdminModal from '../../components/DeleteAdminModal';
import RoundedButton from '../../components/RoundedButton';
import CustomText from '../../components/Text';
import useGetFamilyMembers from '../../hooks/api/useGetFamilyMembers';
import useSignout from '../../hooks/useSignout';
import GeneralInfo from './components/GeneralInfo';
import ProfileImage from './components/ProfileImage';

const MyInfo = () => {
  const {handleSignout, isLoading} = useSignout();
  const {data: familyMembers} = useGetFamilyMembers();
  const {languages} = useLanguageStore();
  const {currentActiveProfileId} = useUserProfileStore();

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const admin = familyMembers?.find(family => family.relation === 'Admin');

  const {mutateAsync: deleteProfile, isPending: isDeleting} = useMutation({
    mutationKey: ['DeleteFamilyMembersAttributes'],
    mutationFn: deleteFamilyMembersAttributes,
    onSuccess: async () => {
      notifyApi('delete_account');
      await handleSignout();
      hideModal();
    },
  });

  const handleDeleteAccount = async () => {
    if (admin && admin.user_id) {
      await deleteProfile({
        profile_ids: [admin.user_id],
      });
    } else {
      errorToast(languages?.adminNotFound);
    }
  };

  const showModal = () => setIsModalVisible(true);
  const hideModal = () => setIsModalVisible(false);

  return (
    <>
      <View className="mt-8">
        <ProfileImage />
      </View>
      <View className="mt-4">
        <GeneralInfo />
      </View>
      <View className="justify-center px-4 my-4 space-y-4 items-center">
        <RoundedButton
          resetStyle
          className="bg-ultramarineBlue py-3 min-w-[200]"
          onPress={handleSignout}
          loading={isLoading}
          disabled={isLoading}>
          <CustomText className="text-white">{languages?.sign_out}</CustomText>
        </RoundedButton>
        {currentActiveProfileId === admin?.user_id && (
          <View>
            <RoundedButton
              resetStyle
              className="bg-red-500 py-3 min-w-[200]"
              // onPress={handleDeleteAccount}
              onPress={showModal}
              disabled={isDeleting}>
              <CustomText className="text-white font-isidoraMedium">
                {languages?.deleteAccount}
              </CustomText>
            </RoundedButton>
            <DeleteAdminModal
              visible={isModalVisible}
              handleDeleteAccount={handleDeleteAccount}
              hideModal={hideModal}
              isDeleting={isDeleting}
            />
          </View>
        )}
      </View>
    </>
  );
};

export default MyInfo;
