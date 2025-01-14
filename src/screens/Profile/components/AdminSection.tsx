import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import useLanguageStore from '../../../../store/languageStore';
import {FamilyMembers} from '../../../../types/users/user';
import CustomText from '../../../components/Text';
import ProfileCard from './ProfileCard';

const AdminSection = ({
  details,
  onChangeCurrentProfile,
}: {
  details: FamilyMembers | undefined;
  onChangeCurrentProfile: (profileId: string) => void;
}) => {
  const {languages} = useLanguageStore();

  if (!details) {
    return <></>;
  }
  return (
    <>
      <CustomText className="text-base font-isidoraSemiBold text-ultramarineBlue mb-4">
        {languages?.admin}
      </CustomText>
      <TouchableOpacity
        className="mb-8 flex-row items-center space-x-2"
        onPress={() => onChangeCurrentProfile(details?.profile_id || '')}>
        <View className="flex-1">
          <ProfileCard
            name={`${details.given_name} ${details.family_name}`}
            profileId={details.profile_id}
            lastHealthScore="6"
          />
        </View>
      </TouchableOpacity>
    </>
  );
};

export default AdminSection;
