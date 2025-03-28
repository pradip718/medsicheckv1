import {
  DrawerActions,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {twMerge} from 'tailwind-merge';
import useLanguageStore from '../../../store/languageStore';
import useWalkthroughStore from '../../../store/walkthroughStore';
import {MainStackParamList} from '../../../types/navigation';
import Icon from '../../components/Icon';
import Navbar from '../../components/Navbar';
import SafeAreaScrollView from '../../components/SafeAreaScrollView';
import CustomText from '../../components/Text';
import useGetUserReading from '../../hooks/api/useGetUserReading';
import customColor from '../../theme/customColor';

const MenuItem = ({
  name,
  icon,
  iconSize,
  action,
  disabled,
}: {
  name: string;
  icon?: string;
  iconSize?: number;
  action: (() => void) | undefined;
  disabled: boolean;
}) => {
  return (
    <TouchableOpacity
      className={twMerge('flex-row items-center px-10  py-2 justify-between')}
      onPress={action}
      disabled={disabled}>
      <View className={twMerge('flex-row items-center py-2')}>
        <View className="w-8">
          {icon && (
            <Icon
              name={icon}
              size={iconSize || 20}
              color={
                disabled
                  ? customColor?.pichartGrey
                  : customColor.ultramarineBlue
              }
            />
          )}
        </View>
        <CustomText
          className={twMerge(
            'text-sm font-isidoraSemiBold',
            disabled ? 'text-slate-400' : '',
          )}>
          {name}
        </CustomText>
      </View>

      <Icon
        name={'chevron-right'}
        size={20}
        color={disabled ? customColor?.pichartGrey : customColor.blueBerry}
      />
    </TouchableOpacity>
  );
};

const Settings = () => {
  const {languages} = useLanguageStore();
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {
    combineWalkthrough,
    setCurrentWalkthroughScreen,
    setIsWalkthroughVisible,
  } = useWalkthroughStore();

  const {data: reportData} = useGetUserReading();

  const readingLength = reportData?.data?.reading_data?.length || 0;
  const shouldShowWalkthrough =
    languages?.showWalkthrough?.toLocaleLowerCase() === 'true';

  const MENU_ITEM = [
    ...(shouldShowWalkthrough
      ? [
          {
            name: languages?.app_Walkthrough,
            icon: 'information',
            disabled: false,
            action: async () => {
              if (readingLength === 1) {
                combineWalkthrough('homepage', 'single-report');
              }
              if (readingLength > 1) {
                combineWalkthrough('homepage', 'multiple-report');
              }
              setCurrentWalkthroughScreen('homepage');
              setIsWalkthroughVisible(true);
              navigation.navigate('Homepage' as any);
            },
          },
        ]
      : []),
    {
      name: languages?.send_feedback,
      icon: 'personal_report',
      disabled: false,
      action: () => {
        navigation?.navigate('Feedbacks');
      },
    },
    {
      name: languages?.pp,
      icon: 'personal_report',
      disabled: false,
      action: () => {
        navigation?.navigate('PrivacyPolicy', {
          uri: languages?.pp_link,
        });
      },
    },
    {
      name: languages?.communication_preferences,
      icon: 'communication-preference-outline',
      iconSize: 24,
      disabled: false,
      action: () => {
        navigation?.navigate('CommunicationPreferences');
      },
    },
  ];

  const handleBackClick = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
      navigation.dispatch(DrawerActions.openDrawer());
    }
  };
  return (
    <SafeAreaScrollView
      className="h-full"
      contentContainerStyle={styles.contentContainer}>
      <View className="p-4">
        <Navbar onBackClick={handleBackClick} />
      </View>
      <View className="flex-1">
        {MENU_ITEM?.map(eachMenu => (
          <View className="my-2" key={eachMenu?.name}>
            <MenuItem
              name={eachMenu.name}
              icon={eachMenu.icon}
              // iconSize={eachMenu?.iconSize}
              action={eachMenu?.action}
              disabled={eachMenu?.disabled || false}
            />
          </View>
        ))}
        {/* <CustomText className="font-isidoraSemiBold text-2xl text-slate-400">
          Work In Progress
        </CustomText> */}
      </View>
    </SafeAreaScrollView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
});
