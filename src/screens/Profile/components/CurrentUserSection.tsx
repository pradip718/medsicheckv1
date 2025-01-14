import React from 'react';
import {View} from 'react-native';
import useLanguageStore from '../../../../store/languageStore';
import {FamilyMembers} from '../../../../types/users/user';
import CustomText from '../../../components/Text';
import ProfileCard from './ProfileCard';

const CurrentUserSection = ({
  details,
}: {
  details: FamilyMembers | undefined;
}) => {
  const {languages} = useLanguageStore();
  if (!details) {
    return <></>;
  }
  return (
    <>
      <CustomText className="text-base font-isidoraSemiBold text-ultramarineBlue mb-4">
        {languages?.current_user}
      </CustomText>
      <View className="mb-8 flex-row items-center space-x-2">
        <View className="flex-1">
          <ProfileCard
            name={`${details.given_name} ${details.family_name}`}
            profileId={details.profile_id}
            lastHealthScore="6"
            isAdmin={details?.relation === 'Admin'}
          />
        </View>
      </View>
    </>
  );
};

export default CurrentUserSection;
