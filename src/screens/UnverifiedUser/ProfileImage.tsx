import AsyncStorage from '@react-native-async-storage/async-storage';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {
  Asset,
  ImageLibraryOptions,
  ImagePickerResponse,
  launchImageLibrary,
} from 'react-native-image-picker';
import {ProfileImg} from '../../../assets';
import useLanguageStore from '../../../store/languageStore';
import {MainStackParamList} from '../../../types/navigation';
import {errorToast} from '../../../utils/toast';
import useGetUserAttributes from '../../hooks/api/useGetUserAttributes';

let STORAGE_KEY = 'USER_PROFILE';

const ProfileImage = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();
  const [avatarSource, setAvatarSource] = useState<Asset>();
  const [profileData, setProfileData] = useState({});
  const {data: userAttributes} = useGetUserAttributes();

  useEffect(() => {
    const readProfileData = async () => {
      try {
        const profileStoreData = await AsyncStorage.getItem(STORAGE_KEY);
        if (!profileStoreData) {
          return;
        }
        const profileInfo = JSON.parse(profileStoreData);
        const userId: string = await getUserDetails();
        if (profileInfo && userId) {
          setProfileData(profileInfo);
          setAvatarSource(profileInfo[userId]);
        }
      } catch (e) {
        console.log({e});
      }
    };
    readProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateToUserInformation = () => {
    navigation.navigate('UserInformation', {
      fromScreen: 'profile',
    });
  };

  const getUserDetails = async () => {
    return userAttributes?.profile_id || '';
  };

  const saveProfileData = async (data: any) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      errorToast('Failed to save the data to the storage');
    }
  };

  const handleProfileImage = async () => {
    const options = {
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0,
      includeBase64: true,
      mediaType: 'photo',
    } as ImageLibraryOptions;
    launchImageLibrary(options, async (response: ImagePickerResponse) => {
      if (response.didCancel) {
      } else if (response.errorMessage) {
        errorToast(`Something went wrong. ${response.errorMessage || ''}`);
      } else {
        if (response.assets && response.assets[0]) {
          const userId = await getUserDetails();
          saveProfileData({
            ...profileData,
            [userId]: response.assets[0],
          });
          setAvatarSource(response.assets[0]);
        }
      }
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity className="h-[123px] w-[123px] rounded-full border justify-center items-center bg-white">
        <View className="h-[102px] w-[102px] rounded-full  overflow-hidden">
          <Image
            source={avatarSource || (ProfileImg as any)}
            style={styles.profileImage}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileImage;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  profileImage: {
    // height: 102,
    aspectRatio: '1/1',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
