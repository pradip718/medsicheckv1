// import {NavigationProp, useNavigation} from '@react-navigation/native';
import React from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Tooltip} from 'react-native-paper';
import {ProfileImg} from '../../../../assets';
import useLanguageStore from '../../../../store/languageStore';
// import {MainStackParamList} from '../../../../types/navigation';
import {Asset} from 'react-native-image-picker';
import Icon from '../../../components/Icon';
import CustomText from '../../../components/Text';
import useGetProfileImage from '../../../hooks/useGetProfileImage';

type ProfileCardProps = {
  name: string;
  img?: string | Asset;
  lastHealthScore: string;
  profileId: string;
  isAdmin?: boolean;
};

const ProfileCard = ({
  name,
  profileId,
  isAdmin,
}: // lastHealthScore,
// profileId,
ProfileCardProps) => {
  // const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();
  const {avatarSource} = useGetProfileImage(profileId);

  // const navigateToFamilyInformation = () => {
  //   navigation.navigate('FamilyInformation', {profileId});
  // };

  return (
    <View className="flex-row items-center bg-[#D8E0FF] pl-6 rounded-[30px] h-[74px]">
      <View className="h-[97px] w-[97px] rounded-full border justify-center items-center bg-white">
        <View className="h-[80px] w-[80px] rounded-full  overflow-hidden">
          <Image
            source={avatarSource || (ProfileImg as any)}
            style={styles.profileImage}
          />
        </View>
      </View>
      <View className="flex-1 ml-4">
        <CustomText
          className="text-base font-isidoraSemiBold text-[#1E3180]"
          numberOfLines={2}
          ellipsizeMode="middle">
          {name}
        </CustomText>
        {isAdmin && (
          <CustomText
            className="font-isidoraMedium text-sm text-[#1E3180] pl-4"
            numberOfLines={1}
            ellipsizeMode="tail">
            ({languages?.admin})
          </CustomText>
        )}
      </View>
      <Tooltip
        title={languages?.profile_switch_info || ''}
        enterTouchDelay={0}
        leaveTouchDelay={2000}>
        <TouchableOpacity className="h-full px-6 justify-center">
          <Icon name="information" color="#6583FF" size={20} />
        </TouchableOpacity>
      </Tooltip>
    </View>
  );
};

export default ProfileCard;

const styles = StyleSheet.create({
  profileImage: {
    // height: 102,
    aspectRatio: '1/1',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
