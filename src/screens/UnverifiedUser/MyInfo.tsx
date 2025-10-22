import {useMutation} from '@tanstack/react-query';
import React, {useState} from 'react';
import {View} from 'react-native';
import useLanguageStore from '../../../store/languageStore';
import {errorToast} from '../../../utils/toast';
import {deleteFamilyMembersAttributes, notifyApi} from '../../api/user';
import DeleteAdminModal from '../../components/DeleteAdminModal';
import RoundedButton from '../../components/RoundedButton';
import CustomText from '../../components/Text';
import useGetAccountStatus from '../../hooks/api/useGetAccountStatus';
import useGetFamilyMembers from '../../hooks/api/useGetFamilyMembers';
import useSignout from '../../hooks/useSignout';
import GeneralInfo from './GeneralInfo';
import ProfileImage from './ProfileImage';

const MyInfo = () => {
  const {handleSignout, isLoading} = useSignout();
  const {data: familyMembers} = useGetFamilyMembers();
  const {languages} = useLanguageStore();
  const {data: accountStatus} = useGetAccountStatus();

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const {mutateAsync: deleteProfile, isPending: isDeleting} = useMutation({
    mutationKey: ['DeleteFamilyMembersAttributes'],
    mutationFn: deleteFamilyMembersAttributes,
    onSuccess: async () => {
      await notifyApi('delete_account');
      await handleSignout();
      hideModal();
    },
  });
  const handleDeleteAccount = async () => {
    const admin = familyMembers?.find(family => family.relation === 'Admin');
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
        <CustomText className="py-4 text-ultramarineBlue font-isidoraSemiBold text-base text-center">
          {accountStatus?.content?.progress_msg}
        </CustomText>
      </View>
      <View className="mt-4">
        <GeneralInfo />
      </View>
      <View className="justify-center px-4 my-4 space-x-4 items-center flex-row">
        <RoundedButton
          resetStyle
          className="bg-ultramarineBlue py-3 min-w-[140]"
          onPress={handleSignout}
          loading={isLoading}
          disabled={isLoading}>
          <CustomText className="text-white">{languages?.sign_out}</CustomText>
        </RoundedButton>
        <RoundedButton
          resetStyle
          className="bg-red-500 py-3 min-w-[140]"
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
    </>
  );
};

export default MyInfo;
