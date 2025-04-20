import {useAsyncStorage} from '@react-native-async-storage/async-storage';
import CheckBox from '@react-native-community/checkbox';
import React from 'react';
import {View} from 'react-native';
import useLanguageStore from '../../../store/languageStore';
import useUserProfileStore from '../../../store/profileStore';
import EtchedGlass from '../../components/EtchedGlass';
import CustomText from '../../components/Text';
import {
  Face_SCANNER_KEY,
  VOICE_SCANNER_INTRO_STATUS,
} from '../../constants/AsyncStorageKeys';

type HeaderProps = {
  doNotShowChecked: boolean;
  onDoNotShowChecked: (check: boolean) => void;
};

const Header = ({doNotShowChecked, onDoNotShowChecked}: HeaderProps) => {
  const {setItem, getItem} = useAsyncStorage(VOICE_SCANNER_INTRO_STATUS);
  const {languages} = useLanguageStore();
  const {currentActiveProfileId} = useUserProfileStore();

  const storeStatusInLocalStorage = async (check: boolean) => {
    const userStatus = await getItem();
    if (userStatus) {
      const status = JSON.parse(userStatus);
      await setItem(
        JSON.stringify({...status, [currentActiveProfileId]: check}),
      );
      return;
    } else {
      await setItem(JSON.stringify({[currentActiveProfileId]: check}));
    }
  };

  const handleCheckChange = async (check: boolean) => {
    onDoNotShowChecked(check);
    storeStatusInLocalStorage(check);
  };

  return (
    <EtchedGlass
      className="rounded-none h-full justify-center"
      cardContentClassName="p-0 justify-center items-center"
      cardContentContainerClassName="p-0 justify-center items-center">
      <View className="justify-center items-center">
        <CustomText className="text-sm font-isidoraSemiBold text-center mediumPhone:text-xl">
          {languages?.how_to_use}
        </CustomText>
        <View className="flex-row items-center ">
          <CheckBox
            className="w-10 h-10"
            tintColors={{true: '#3E64FF', false: '#3E64FF'}}
            value={doNotShowChecked}
            onValueChange={handleCheckChange}
          />
          <CustomText className="pl-2 text-xs mediumPhone:text-sm">
            {languages?.do_not_show_again}
          </CustomText>
        </View>
      </View>
    </EtchedGlass>
  );
};

export default Header;
